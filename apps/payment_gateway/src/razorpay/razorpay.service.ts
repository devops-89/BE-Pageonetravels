import { Injectable } from '@nestjs/common';
import { RazorpayService as RazorpayPaymentService } from '../../../../libs/paymentgateway/razorpay.service';
import { FlightTicketRepositoryService, UserRepositoryService } from '../../../../libs/database/src/repositories';
import { LccTicketDto } from '../../../../libs/dtos/flight/flight-ticket.dto';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { TokenProviderService } from '../../../../libs/token-provider-handler/tokenProvider.service';
import * as crypto from 'crypto';
import { OrderRepositoryService } from '../../../../libs/database/src';

import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';

import { PackageRepositoryService } from '../../../../libs/database/src/repositories';
import { PackageBookingRepositoryService } from '../../../../libs/database/src/repositories/package-booking.repository';
import { CreatePackageBookingDto } from '../../../../libs/dtos/package/package-booking.dto';
import { BookingStatus, Order, PackageBooking, Payment, User } from '../../../../libs/database/src';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PAYMENT_STATUS } from '../../../../libs/constants/bookingContant';
import { GetAgencyBalanceDto } from '../../../../libs/dtos/flight/flight-detail.dto';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { FLIGHTDATA } from '../../../../libs/config/config.interface';
import { CreateHotelBookingDto } from '../../../../libs/dtos/hotel/hotel-booking.dto';

@Injectable()
export class RazorpayService {
    private tboCredentials: FLIGHTDATA;

    constructor(
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly userrepositoryservice: UserRepositoryService,
        private readonly packageBookingRepositoryService: PackageBookingRepositoryService,
        private readonly packageRepositoryService: PackageRepositoryService,
        private readonly razorpayPaymentService: RazorpayPaymentService,
        private readonly generateTokenService: TokenProviderService,
        private readonly flightTicketService: FlightTicketRepositoryService,
        private readonly responsehandlderservice: ResponseHandlerService,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async onModuleInit() {
        this.tboCredentials = await this.tboConfigService.getTBOCredentials();
    }

    async createFlightOrder(reference_id: string, body: LccTicketDto, email: string) {
        try {
            const amountData = Math.round(parseFloat(body.amount) * 100);
            const { currency, custom_order_id } = body;
            const amount = amountData;
            const orderdetails = await this.orderRepositoryService.findOne(custom_order_id);

            const checkOrder = await this.flightTicketService.findOne(orderdetails.order_id);
            if (checkOrder) {
                throw { message: 'Payment record already exists for this order. Please initiate the process again.', statusCode: ERROR_CODES.BAD_REQUEST };
            }

            const orderAmount = Math.round(parseFloat(orderdetails.amount) * 100);
            if (amount !== orderAmount) {
                throw { message: 'Amount not matched', statusCode: ERROR_CODES.BAD_REQUEST };
            }
            // const paymentInput = { amount, currency, custom_order_id };

            console.log("callback url:",this.tboCredentials.FLIGHT_PAYMENT_CALLBACK_URL);

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
                callback_url: this.tboCredentials.FLIGHT_PAYMENT_CALLBACK_URL,
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

    async createHotelOrder(reference_id: string, body: CreateHotelBookingDto) {
        try {
            const { extraInfo, ...restOfBookingData } = body;
            const cleanedBody = { ...restOfBookingData };

            console.log('extraInfo', extraInfo);
            console.log('cleanedBody:', cleanedBody);

            // Use amount from body directly
            const netamount = cleanedBody.NetAmount;
            const totalamount=extraInfo.totalAmount;
            const hotelPayload = cleanedBody;

            // Step 1: Fetch Agency Balance
            const agencyBalancePayload = {
                EndUserIp: cleanedBody.EndUserIp,
            };

            console.log('agencyBalancePayload', agencyBalancePayload);

            // Validate user
            const refData = await this.userrepositoryservice.getUserByUserId(reference_id);
            if (!refData) {
                return {
                    success: false,
                    statusCode: 404,
                    message: 'User Not Found!',
                };
            }

            // Fetch Agency Balance
            const agencyBalanceResponse = await this.getAgencyBalance(agencyBalancePayload);
             console.log("Agency Balance Response:",agencyBalanceResponse);
            if (!agencyBalanceResponse.success) {
                return {
                    success: false,
                    statusCode: agencyBalanceResponse.statusCode || 400,
                    message: agencyBalanceResponse.message,
                    extraError: agencyBalanceResponse.extraError,
                };
            }

            const agencyCashBalance = agencyBalanceResponse.data?.CashBalance ?? 0;
            console.log('Amount:', netamount);
            console.log('Agency Cash Balance:', agencyCashBalance);

            if (agencyCashBalance < netamount) {
                return {
                    success: false,
                    statusCode: 400,
                    message: 'Insufficient balance. Please recharge your account before booking.',
                };
            }

            // Save order
            const orderResponse = await this.orderRepositoryService.insertBooking(reference_id, 'HOTEL', hotelPayload, netamount, body.BookingCode, undefined, undefined, undefined, undefined, extraInfo);

            const custom_order_id = orderResponse.custom_order_id;
            const orderdetails = await this.orderRepositoryService.findOne(custom_order_id);

            // Create Razorpay Payment Link
            const paymentLink = await this.razorpayPaymentService.createPaymentLink({
                amount: Math.round(totalamount * 100),
                currency: 'INR',
                description: 'Payment For Hotel Booking',
                reference_id: custom_order_id.trim(),
                customer: { email: refData.email },
                notes: {
                    module: 'hotel',
                    order_id: orderdetails.order_id,
                },
                callback_url: this.tboCredentials.HOTEL_PAYMENT_CALLBACK_URL,
            });

            const user = reference_id;

            const orderRef = new Order();
            orderRef.order_id = orderdetails.order_id;

            const userRef = new User();
            userRef.id = user;

            // Save payment record
            // Create the payment entity
            const paymentEntity = this.paymentRepository.create({
                razorpay_link_response: JSON.stringify(paymentLink),
                user: { id: user },
                order: { order_id: orderdetails.order_id },
                amount: orderdetails.amount,
                payment_gateway: 'Razorpay',
                payment_status: paymentLink.status,
                status: PAYMENT_STATUS.IN_PROGRESS,
            });

            await this.paymentRepository.save(paymentEntity);

            return {
                success: true,
                statusCode: 200,
                message: 'Hotel order created successfully.',
                data: paymentLink,
            };
        } catch (error) {
            console.error('Error in createHotelOrder:', error);
            return {
                success: false,
                statusCode: 500,
                message: error?.message || 'Something went wrong while creating hotel order',
                extraError: error,
            };
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
        const alreadyBooked = await this.packageBookingRepositoryService.hasActiveBooking(packageId, reference_id, new Date(startDate), new Date(endDate));
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
        console.log('booking id: ', booking);

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

    //     get Agency Balance Service
    async getAgencyBalance(body: GetAgencyBalanceDto) {
        try {
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const { token } = await this.generateTokenService.getToken(body.EndUserIp);

            if (!token) {
                return {
                    success: false,
                    statusCode: 401,
                    message: 'Failed to fetch agency balance: No valid token found.',
                };
            }

            const base_url = tbo_credentials.FLIGHT_GET_AGENCY_BALANCE || 'http://Sharedapi.tektravels.com/SharedData.svc/rest/GetAgencyBalance';

            const payload = {
                ClientId: 'ApiIntegrationNew',
                TokenAgencyId: '57515',
                TokenMemberId: '57654',
                EndUserIp: body.EndUserIp,
                TokenId: token,
            };

            const response = await this.httptboapiservice.httpAPICall(base_url, payload);
            console.log('Agency Balance API response:', response);

            if (response?.Status === 1) {
                return {
                    success: true,
                    statusCode: 200,
                    message: 'Agency Balance fetched successfully',
                    data: {
                        AgencyType: response.AgencyType,
                        CashBalance: response.CashBalance,
                        CreditBalance: response.CreditBalance,
                    },
                };
            } else if (response?.Status === 2) {
                return {
                    success: false,
                    statusCode: 400,
                    message: 'Failed to Fetch Agency Balance From API!',
                    extraError: {
                        code: response?.Error?.ErrorCode ?? 'UNKNOWN',
                        message: response?.Error?.ErrorMessage || 'Unknown error occurred.',
                    },
                };
            } else {
                return {
                    success: false,
                    statusCode: 500,
                    message: 'Unexpected API response while fetching agency balance',
                };
            }
        } catch (error) {
            console.error('Error in Calling getAgencyBalance API:', error);
            return {
                success: false,
                statusCode: 500,
                message: 'Error while fetching agency balance!',
                extraError: {
                    type: error.name || 'FetchError',
                    message: error.message || 'Unknown error occurred while calling TBO GetAgencyBalance API',
                },
            };
        }
    }
}
