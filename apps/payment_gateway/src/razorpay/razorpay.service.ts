import { Injectable } from '@nestjs/common';
import { RazorpayService as RazorpayPaymentService } from '../../../../libs/paymentgateway/razorpay.service';
import { FlightTicketRepositoryService, OrderRepositoryService, UserRepositoryService } from '../../../../libs/database/src/repositories';
import { LccTicketDto } from '../../../../libs/dtos/flight/flight-ticket.dto';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import * as crypto from 'crypto';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { ConfigService } from '../../../../libs/config/config.service';
import { PackageRepositoryService } from '../../../../libs/database/src/repositories';
import { PackageBookingRepositoryService } from '../../../../libs/database/src/repositories/package-booking.repository';
import { CreatePackageBookingDto } from '../../../../libs/dtos/package/package-booking.dto';
import { BookingStatus, PackageBooking, Payment, User } from '../../../../libs/database/src';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PAYMENT_STATUS } from '../../../../libs/constants/bookingContant';


@Injectable()
export class RazorpayService {
    constructor(
        private readonly configService: ConfigService,
        private readonly orderRepository: OrderRepositoryService,
        private readonly userrepositoryservice: UserRepositoryService,
        private readonly packageBookingRepositoryService:PackageBookingRepositoryService,
        private readonly packageRepositoryService:PackageRepositoryService,
        private readonly razorpayPaymentService: RazorpayPaymentService,
        private readonly flightTicketService: FlightTicketRepositoryService,
        private readonly responsehandlderservice: ResponseHandlerService,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async createFlightOrder(reference_id: string, body: LccTicketDto, email: string) {
        try {
            const amountData = Math.round(parseFloat(body.amount) * 100);
            const { currency, custom_order_id } = body;
            const amount = amountData;
            const orderdetails = await this.orderRepository.findOne(custom_order_id);
            const checkOrder = await this.flightTicketService.findOne(orderdetails.order_id);
            if (checkOrder) {
                throw { message: 'Payment record already exists for this order. Please initiate the process again.', statusCode: ERROR_CODES.BAD_REQUEST };
            }

            const orderAmount = Math.round(parseFloat(orderdetails.amount) * 100);
            if (amount !== orderAmount) {
                throw { message: 'Amount not matched', statusCode: ERROR_CODES.BAD_REQUEST };
            }
            // const paymentInput = { amount, currency, custom_order_id };

            const paymentInput = {
                amount: amount,
                currency: currency,
                description: 'Payment for flight Ticket',
                reference_id: custom_order_id.trim(),
                customer: {
                    email: email,
                },
                notes: {
                    module: 'flight',
                    order_id: orderdetails.order_id,
                },
                callback_url: 'https://dev.page1travels.com/payment/flight/status',
            };
// https://page1-fe.vercel.app/payment/flight/status
            const data = await this.razorpayPaymentService.createPaymentLink(paymentInput);

            await this.flightTicketService.insertOrder(data, { order_id: orderdetails.order_id, user: reference_id });
            return { message: 'Order Created successfully', data: data };
        } catch (error) {
            console.error('Error ', error);
            throw error;
        }
    }

    async getExpireByTime() {
        const currentTime = Math.floor(Date.now() / 1000);
        const expireBy = currentTime + 15 * 60;
        return expireBy;
    }

async createPackageOrder(reference_id: string, body: CreatePackageBookingDto, email: string) {
  const { packageId, startDate, endDate, passengerDetails } = body;

  // ✅ check for overlapping booking
  const alreadyBooked = await this.packageBookingRepositoryService.hasActiveBooking(
    packageId,
    reference_id,
    new Date(startDate),
    new Date(endDate),
  );
  if (alreadyBooked) {
    throw {
      message: 'You already have an active booking for this package in this time span.',
      statusCode: ERROR_CODES.BAD_REQUEST,
    };
  }

  // ✅ passenger details from DTO
  const passengers = passengerDetails.map((p) => ({
    title: p.title,
    firstName: p.first_name,
    middleName: '', // optional
    lastName: p.last_name,
    DOB: p.DOB,
    passportNumber: p.passport_number ?? '',
    passportExpiry: p.passport_expiry ?? '',
    meal: p.mealType,
  }));

const user = await this.userRepository.findOne({ where: { id: reference_id } });

const bookingData: Partial<PackageBooking> = {
  packageId,
  user, // full User object
  status: BookingStatus.PENDING,
  passengerDetails: passengers,
  specialRequest: body.specialRequest ?? '',
  email: body.email,
  phone: body.phone ?? '',
  startDate: new Date(startDate),
  endDate: new Date(endDate),
};


  const booking = await this.packageBookingRepositoryService.createPackageBooking(bookingData);
  console.log("booking id: ",booking);

  // ✅ create payment link
  const paymentInput = {
    amount: Math.round(Number(body.amount) * 100),
    currency: 'INR',
    description: 'Payment for Package Booking',
    reference_id: booking.id.trim(),
    customer: { email },
    notes: { module: 'package', order_id: booking.id },
    callback_url: 'https://dev.page1travels.com/payment/success',
  };

  const paymentLink = await this.razorpayPaymentService.createPaymentLink(paymentInput);

  // ✅ save payment entity
  const paymentEntity = this.paymentRepository.create({
    razorpay_link_response: JSON.stringify(paymentLink),
    user: { id: reference_id },
    packageBooking: { id: booking.id },
    amount: body.amount.toString(),
    payment_gateway: 'Razorpay',
    payment_status: paymentLink.status,
    status: PAYMENT_STATUS.IN_PROGRESS,
  });

  await this.paymentRepository.save(paymentEntity);

  return { booking, paymentLink };
}

    async paymentVerify(razorpayPaymentId: string, razorpayPaymentLinkId: string, razorpaySignature: string) {
        try {
            // Trim inputs to avoid any extra spaces
            razorpayPaymentId = razorpayPaymentId.trim();
            razorpayPaymentLinkId = razorpayPaymentLinkId.trim();
            razorpaySignature = razorpaySignature.trim();

            // Construct the signature string correctly
            const signatureString = `${razorpayPaymentId}|${razorpayPaymentLinkId}`;
            console.log('Signature String:', signatureString); // Log the signature string for debugging

            // Generate the expected signature using the Razorpay Secret Key
            const secretKey = 'zuHsL13ehyikzktJQC1HsBok'; // Razorpay Secret Key
            const expectedSignature = crypto.createHmac('sha256', secretKey).update(signatureString).digest('hex');

            // Log expected and received signatures for debugging
            console.log('Expected Signature:', expectedSignature);
            console.log('Received Signature:', razorpaySignature);

            // Compare the signatures
            if (expectedSignature === razorpaySignature) {
                console.log('Signature verified');
                return { message: 'Payment verified successfully', data: true };
            } else {
                console.log('Signature not verified');
                return { message: 'Payment verification failed', data: false };
            }
        } catch (error) {
            console.error('Error during payment verification:', error);
            throw error;
        }
    }
}
