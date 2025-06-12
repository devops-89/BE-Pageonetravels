import { Inject, Injectable } from "@nestjs/common";
import { Booking } from "../entities";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { BOOKING_STATUS, PAYMENT_STATUS } from "../../../../libs/constants/bookingContant";
import { TransactionManager } from "./utils";

@Injectable()
export class BookingRepositoryService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository : Repository<Booking>,
        private readonly transactionManager : TransactionManager,

    ){
        // const transactionManager = new TransactionManager(this.dataSource);

    }

    private mapObject(obj: any): any {

        let resObj: any = {};

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                resObj[key] = obj[key];
            }
        }

        return resObj;
    }

    async getBookingById(bookingId: string) {
        try {
            const booking = await this.bookingRepository.findOne({
                where: { id: bookingId },
                relations: ['user']
            });

            if (!booking) {
                throw Error("Booking not found");
            }

            // Parse JSON strings into objects
            const flightDetails = booking.flight_details ? JSON.parse(booking.flight_details) : null;
            const passengerDetails = booking.passenger_details ? JSON.parse(booking.passenger_details) : null;

            return {
                ...booking,
                flight_details: flightDetails,
                passenger_details: passengerDetails
            };
        } catch (error) {
            console.log("Error in get Booking By Id:", error);
            throw error;
        }
    }

    async getAllBookings(userId?: string) {
        try {
            const query = this.bookingRepository.createQueryBuilder('booking')
                .leftJoinAndSelect('booking.user', 'user');

            if (userId) {
                query.where('user.id = :userId', { userId });
            }

            const bookings = await query.getMany();

            return bookings.map(booking => ({
                ...booking,
                flight_details: booking.flight_details ? JSON.parse(booking.flight_details) : null,
                passenger_details: booking.passenger_details ? JSON.parse(booking.passenger_details) : null
            }));
        } catch (error) {
            console.log("Error in get All Bookings:", error);
            throw error;
        }
    }

    async createBookingService(booking_payload) {
        try {
            const {
                bookingpayment_amount,
                bookingpaymentcurrency,
                bookingpayment_date,
                flight_details,
                passenger_details,
                booking_type,
                userId
            } = booking_payload;
    
            let fields = this.mapObject({
                bookingpayment_amount,
                bookingpayment_date,
                flight_details: typeof flight_details === 'string' ? flight_details : JSON.stringify(flight_details),
                passenger_details: typeof passenger_details === 'string' ? passenger_details : JSON.stringify(passenger_details),
                booking_status: BOOKING_STATUS.INIT,
                booking_date: new Date(),
                booking_type,
                bookingpayment_status: PAYMENT_STATUS.PENDING,
                bookingpaymentcurrency
            });
    
            if (!bookingpayment_amount || bookingpayment_amount <= 0) {
                throw Error("Invalid payment amount");
            }
            if (!flight_details || !passenger_details) {
                throw Error("Missing flight or passenger details");
            }
    
            return this.transactionManager.runInTransaction(async (manager) => {
                const saveBookingData = manager.create("booking", fields);
                await manager.save("booking", saveBookingData);
                return saveBookingData;
            });
        } catch (error) {
            console.log("Error in createBookingService Repo:", error);
            throw error;
        }
    }

    async getAllFlightBookings() {
        return await this.bookingRepository.find()
    }

}