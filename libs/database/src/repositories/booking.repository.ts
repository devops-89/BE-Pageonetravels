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
                flight_details,
                passenger_details,
                booking_status: BOOKING_STATUS.INIT,
                booking_date: new Date(),
                booking_type,
                bookingpayment_status: PAYMENT_STATUS.PENDING,
                bookingpaymentcurrency
            });
    
          
            if (!bookingpayment_amount || bookingpayment_amount <= 0) {
                throw new Error("Invalid payment amount");
            }
            if (!flight_details || !passenger_details) {
                throw new Error("Missing flight or passenger details");
            }
    
          
            
          return  this.transactionManager.runInTransaction(async (manager) => {
            const saveBookingData = manager.create("booking",fields);

                await manager.save("booking", saveBookingData);
            return saveBookingData;


            })
            
            // await this.bookingRepository.save(saveBookingData);
        
           
    
        } catch (error) {
        
            console.log("Error in createBookingService Repo:", error);
            throw error;
        } 
        // finally {
           
        //     await queryRunner.release();
        // }
    }
    
}