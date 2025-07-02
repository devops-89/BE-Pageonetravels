import { Injectable } from "@nestjs/common";
//import { InjectRepository } from "@nestjs/typeorm";
//import { Repository } from "typeorm";
import { BookingDto, BookingNonLccDto, TicketDto } from "../../../../libs/dtos/flight/booking-flight.dto";
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { GenerateTokenService } from "../search-flight/generateToken.service";
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
import { CommissionRepositoryService, Order } from '../../../../libs/database/src';
import { RazorpayService } from "../../../../libs/paymentgateway/razorpay.service";
import { BookingRepositoryService, UserRepositoryService, OrderRepositoryService} from "../../../../libs/database/src";
import {  processPassengers,procesPassengers } from '../../../../libs/utils/fareUtils';
import {  calculateTotalPrice } from '../../../../libs/utils/passengerUtils';
import { COMMISSION_TYPE } from "../../../../libs/constants/autenticationConstants/userContants";
import { ERROR_CODES } from "../../../../libs/constants/commonConstants";
import { RoundDto } from "../../../../libs/dtos/flight/round-flight.dto";
import { ORDER_STATUS, PAYMENT_STATUS } from "../../../../libs/constants/bookingContant";
import { Like } from "typeorm";
import { tbo_credentials } from '../../../../libs/constants/tboCredentials';
import { cancellationConfirmationTemplate } from '../../../../libs/templates/cancellationTemplate';
//import { ORDER_TYPE } from "../../../../libs/constants/orderConstant";
import { EmailService } from "../../../../libs/email-service/email.service";
import { ORDER_TYPE } from "../../../../libs/constants/orderConstant";

@Injectable()
export class FlightBookingService {
   
    constructor(

        //@InjectRepository(Order)
        //private readonly orderRepository: Repository<Order>,
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly commissionRepositoryService:CommissionRepositoryService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly redisCacheService: RedisCacheService,
        private readonly razorpayservice: RazorpayService,
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly bookingrepository: BookingRepositoryService,
        private readonly EmailService: EmailService,
        private readonly orderRepository: OrderRepositoryService,
        private readonly userrepositoryservice: UserRepositoryService,
        
    ) {}

    async bookFlight(reference_id,body: BookingDto) {
        try {
            const {
                result_index,
                trace_id,
                ip_address,
                country_code,
                address,
                city,
                contact_no,
                country,
                nationality,
                email,
                passenger_details,
                gst_company_address,
                gst_company_contact_number,
                gst_company_email,
                gst_company_name,
                gst_number,
                fareBreakdown,
                fare
            } = body;

            // if(!body.journey_type || !body.journey || !body.is_LCC){
            //     throw { message: "Journey Details missing like journey_type,journey, flight type", statusCode: ERROR_CODES.BAD_REQUEST };
            // } 
            

            // Store additional data in a single object to pass easily
        const additionalData = {
                address,
                contact_no,
                country,
                email,
                city,
                country_code,
                nationality,
                gst_company_address,
                gst_company_contact_number,
                gst_company_email,
                gst_company_name,
                gst_number
            };


        // Generate the passenger list using the reusable function
        const passengers = [
                ...procesPassengers(passenger_details.adult || [], 1, fareBreakdown, fare, additionalData),
                ...procesPassengers(passenger_details.child || [], 2, fareBreakdown, fare, additionalData),
                ...procesPassengers(passenger_details.infant || [], 3, fareBreakdown, fare, additionalData)
            ];
            
            // console.log(">>>>>>>>>> >>>>>>> >>>> >",passengers);
            const { token, TBO_data } = await this.generateTokenService.getToken(ip_address);
            
            const payload = {
                "PreferredCurrency": "INR",
                "AgentReferenceNo": "Page1Travels",
                "Passengers": passengers,
                "EndUserIp": ip_address,
                "TokenId": token,
                "TraceId": trace_id,
                "ResultIndex": result_index
            } 
            const extraAmount = calculateTotalPrice(passenger_details);
            // console.log(">>>>>>>>>>>>>>>>>>>",extraAmount);
            let amount = fare[0].BaseFare + fare[0].Tax + extraAmount;
            
            const is_LCC = body.is_LCC;
            const journey = body.journey;
            const journey_type = body.journey_type;
            const flightType = `FLIGHT_${journey_type}_${journey}` as COMMISSION_TYPE;
            let data ;
            let commissionType ;
            if (Object.values(COMMISSION_TYPE).includes(flightType)) { 
                    commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType); 
                    if(commissionType.commission_type === "FIXED"){
                      data = parseFloat(commissionType.percentage);
                    }else if(commissionType.commission_type === "PERCENTAGE"){
                        const percentValue = parseFloat(commissionType.percentage);
                        const farePrice = fare[0].BaseFare * percentValue;
                        data = farePrice/100;
                    }
            } else {
                    throw { message: "Invalid commission type", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            
            amount = amount + data;

            const order_type = "FLIGHT";
            
            const response = await this.orderRepository.insertBooking(reference_id,order_type,payload,amount,is_LCC,journey,journey_type,commissionType.commission_type,commissionType.percentage);
           
            return { message: 'Successfully Created Order.', response: response };
        } catch (err) {
            console.log("Error in the FLight Booking Service For NON LCC", err);
            throw err;
        }
    }

    async bookFlightForNonLCC(reference_id,body: BookingNonLccDto) {
        try {
            const {
                result_index,
                trace_id,
                ip_address,
                country_code,
                cell_country_code,
                city,
                contact_no,
                country,
                address,
                nationality,
                email,
                passenger_details,
                gst_company_address,
                gst_company_contact_number,
                gst_company_email,
                gst_company_name,
                gst_number,
                fareBreakdown,
                fare
            } = body;
            // console.log("Received Body:", body);

            // Common additional details for passenger processing
            const additionalInfo = {
                city,
                address,
                country,
                country_code,
                email,
                contact_no,
                cell_country_code,
                nationality,
                gst_company_address,
                gst_company_contact_number,
                gst_company_email,
                gst_company_name,
                gst_number
            };

            // Generate the passenger list
            const passengers = [
                ...processPassengers(passenger_details.adult || [], 1, fareBreakdown, fare, additionalInfo),
                ...processPassengers(passenger_details.child || [], 2, fareBreakdown, fare, additionalInfo),
                ...processPassengers(passenger_details.infant || [], 3, fareBreakdown, fare, additionalInfo)
            ];

            
            const { token, TBO_data } = await this.generateTokenService.getToken(ip_address);
            // Construct final response
            const payload = {
                ResultIndex: result_index,
                Passengers: passengers,
                EndUserIp: ip_address,
                TokenId: token,
                TraceId: trace_id
            };
            const extraAmount = calculateTotalPrice(passenger_details);
            // console.log(">>>>>>",extraAmount);
            let amount = fare[0].BaseFare + fare[0].Tax + + extraAmount;
            const is_LCC = body.is_LCC;
            const journey = body.journey;
            const journey_type = body.journey_type;
            const flightType = `FLIGHT_${journey_type}_${journey}` as COMMISSION_TYPE;
            let data ;
            let commissionType ;
            if (Object.values(COMMISSION_TYPE).includes(flightType)) { 
                    commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType); 
                    if(commissionType.commission_type === "FIXED"){ 
                      data = parseFloat(commissionType.percentage);
                    }else if(commissionType.commission_type === "PERCENTAGE"){
                        const percentValue = parseFloat(commissionType.percentage);
                        const farePrice = fare[0].BaseFare * percentValue;
                        data = farePrice/100;
                    }
            } else {
                    throw { message: "Invalid commission type", statusCode: ERROR_CODES.BAD_REQUEST }; 
            }
            
            amount = amount + data;
            const order_type = "FLIGHT";
            const response = await this.orderRepository.insertBooking(reference_id,order_type,payload,amount,is_LCC,journey,journey_type,commissionType.commission_type,commissionType.percentage);
            
            return { message: 'Successfully Created Order.', response: response };
        } catch (error) {
            console.log("########## booking flight",error.message);
            throw error;
        }
    }


    async bookTicket(body: TicketDto) {
        try {
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const base_url = tbo_credentials.FLIGHT_TICKET_FORLCC;
            const payload = {
                "EndUserIp": body.ip_address,
                "TokenId": body.tokenId,
                "TraceId": body.traceId,
                "PNR": body.pnr,
                "BookingId": body.bookingId
            };
            
            // Call the external API 
            const response = await this.httptboapiservice.flightBookingTicket(base_url, payload);
            return response; // Ensure it returns properly
    
        } catch (error) {
            console.error("Ticket booking error:", error);
            throw error; // Rethrow structured error for handling in the controller
        }
    }

    
    

    async roundFlightBook(reference_id,body:RoundDto){
        try{
            const {ob,ib} = body;
            // console.log(body);
            
            if(ob.is_LCC === true && ib.is_LCC === true){
                const obData =    await  this.handleLCC(ob);
                const ibData =    await  this.handleLCC(ib);
               
                const firstPayload = obData.payload;
                const firstAmount = obData.amount;
                const firstType = obData.is_LCC;
                const firstCommission  = obData.commissionType;
                const firstCommType = firstCommission.commission_type;
                const firstPerType = firstCommission.percentage;
                const journeyType = obData.journey_type;
                const journey = obData.journey;
                const secondPayload = ibData.payload;
                const secondType = ibData.is_LCC;
                const secondAmount = ibData.amount;
                const flightType = `FLIGHT_${journeyType}_${journey}` as COMMISSION_TYPE;
                let data;
                if (Object.values(COMMISSION_TYPE).includes(flightType)) {
                    const commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType); 
                    if(commissionType.commission_type === "FIXED"){
                        data = parseFloat(commissionType.percentage);
                    }else if(commissionType.commission_type === "PERCENTAGE"){
                        const percentValue = parseFloat(commissionType.percentage);
                        const farePrice = (ob.fare[0].BaseFare + ib.fare[0].BaseFare) * percentValue;
                        data = farePrice/100;
                }
                } else {
                    throw { message: "Invalid commission type", statusCode: ERROR_CODES.BAD_REQUEST };
                }
                
                const amount = firstAmount + secondAmount + data;
                const order_type = "FLIGHT";
                const response = await this.orderRepository.roundinsertBooking(reference_id,order_type,firstPayload,amount,firstType,journey,journeyType,firstCommType,firstPerType,secondPayload,secondType)
                return { message: 'Successfully Created Order.', response: response };
                
            }else if(ob.is_LCC === false && ib.is_LCC === false){
                const obData =    await  this.handleNonLCC(ob);
                const ibData =    await  this.handleNonLCC(ib);
                const firstPayload = obData.payload;
                const firstAmount = obData.amount;
                const firstType = obData.is_LCC;
                const firstCommission  = obData.commissionType;
                const firstCommType = firstCommission.commission_type;
                const firstPerType = firstCommission.percentage;
                const journeyType = obData.journey_type;
                const journey = obData.journey;
                const secondPayload = ibData.payload;
                const secondType = ibData.is_LCC;
                const secondAmount = ibData.amount;
                const flightType = `FLIGHT_${journeyType}_${journey}` as COMMISSION_TYPE;
                let data;
                if (Object.values(COMMISSION_TYPE).includes(flightType)) {
                    const commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType); 
                    if(commissionType.commission_type === "FIXED"){
                        data = parseFloat(commissionType.percentage);
                    }else if(commissionType.commission_type === "PERCENTAGE"){
                        const percentValue = parseFloat(commissionType.percentage);
                        const farePrice = (ob.fare[0].BaseFare + ib.fare[0].BaseFare) * percentValue;
                        data = farePrice/100;
                }
                } else {
                    throw { message: "Invalid commission type", statusCode: ERROR_CODES.BAD_REQUEST };
                }
                
                const amount = firstAmount + secondAmount + data;
                const order_type = "FLIGHT";
                const response = await this.orderRepository.roundinsertBooking(reference_id,order_type,firstPayload,amount,firstType,journey,journeyType,firstCommType,firstPerType,secondPayload,secondType)
                return { message: 'Successfully Created Order.', response: response };
                
            }else if(ob.is_LCC === false && ib.is_LCC === true){
                const obData =    await  this.handleLCC(ob);
                const ibData =    await this.handleLCC(ib);
                const firstPayload = obData.payload;
                const firstAmount = obData.amount;
                const firstType = obData.is_LCC;
                const firstCommission  = obData.commissionType;
                const firstCommType = firstCommission.commission_type;
                const firstPerType = firstCommission.percentage;
                const journeyType = obData.journey_type;
                const journey = obData.journey;
                const secondPayload = ibData.payload;
                const secondType = ibData.is_LCC;
                const secondAmount = ibData.amount;
                const flightType = `FLIGHT_${journeyType}_${journey}` as COMMISSION_TYPE;
                let data;
                if (Object.values(COMMISSION_TYPE).includes(flightType)) {
                    const commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType); 
                    if(commissionType.commission_type === "FIXED"){
                        data = parseFloat(commissionType.percentage);
                    }else if(commissionType.commission_type === "PERCENTAGE"){
                        const percentValue = parseFloat(commissionType.percentage);
                        const farePrice = (ob.fare[0].BaseFare + ib.fare[0].BaseFare) * percentValue;
                        data = farePrice/100;
                }
                } else {
                    throw { message: "Invalid commission type", statusCode: ERROR_CODES.BAD_REQUEST };
                }
                
                const amount = firstAmount + secondAmount + data;
                const order_type = "FLIGHT";
                const response = await this.orderRepository.roundinsertBooking(reference_id,order_type,firstPayload,amount,firstType,journey,journeyType,firstCommType,firstPerType,secondPayload,secondType)
                return { message: 'Successfully Created Order.', response: response };
                
                
            }else if(ob.is_LCC === true && ib.is_LCC === false){
                const obData =    await this.handleLCC(ob);
                const ibData =     await this.handleNonLCC(ib);
                const firstPayload = obData.payload;
                const firstAmount = obData.amount;
                const firstType = obData.is_LCC;
                const firstCommission  = obData.commissionType;
                const firstCommType = firstCommission.commission_type;
                const firstPerType = firstCommission.percentage;
                const journeyType = obData.journey_type;
                const journey = obData.journey;
                const secondPayload = ibData.payload;
                const secondType = ibData.is_LCC;
                const secondAmount = ibData.amount;
                
                

                const flightType = `FLIGHT_${journeyType}_${journey}` as COMMISSION_TYPE;
                let data;
                if (Object.values(COMMISSION_TYPE).includes(flightType)) {
                    const commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType); 
                    if(commissionType.commission_type === "FIXED"){
                        data = parseFloat(commissionType.percentage);
                    }else if(commissionType.commission_type === "PERCENTAGE"){
                        const percentValue = parseFloat(commissionType.percentage);
                        const farePrice = (ob.fare[0].BaseFare + ib.fare[0].BaseFare) * percentValue;
                        data = farePrice/100;
                }
                } else {
                    throw { message: "Invalid commission type", statusCode: ERROR_CODES.BAD_REQUEST };
                }
                const order_type = "FLIGHT";
                const amount = firstAmount + secondAmount + data;
                const response = await this.orderRepository.roundinsertBooking(reference_id,order_type,firstPayload,amount,firstType,journey,journeyType,firstCommType,firstPerType,secondPayload,secondType)
                return { message: 'Successfully Created Order.', response: response };
                
            }
            
        }catch(error){
            console.log("########## Round booking flight",error.message);
            throw error;
        }
    }

    async handleLCC(flight: any) {
        // if(!flight.journey_type || !flight.journey || !flight.is_LCC){
        //     throw { message: "Journey Details missing like journey_type,journey, flight type", statusCode: ERROR_CODES.BAD_REQUEST };
        // }
            
        const {house_number,street,city,country_code,cell_country_code,nationality,gst_company_address,gst_company_contact_number,gst_company_email,gst_company_name,gst_number} = flight;

        // Store additional data in a single object to pass easily
        const additionalData = {
            house_number,
            street,
            city,
            country_code,
            cell_country_code,
            nationality,
            gst_company_address,
            gst_company_contact_number,
            gst_company_email,
            gst_company_name,
            gst_number
            };


        // Generate the passenger list using the reusable function
        const passengers = [
                ...procesPassengers(flight.passenger_details.adult || [], 1, flight.fareBreakdown, flight.fare, additionalData),
                ...procesPassengers(flight.passenger_details.child || [], 2, flight.fareBreakdown, flight.fare, additionalData),
                ...procesPassengers(flight.passenger_details.infant || [], 3, flight.fareBreakdown, flight.fare, additionalData)
            ];
        
        // console.log(">>>>>>>>>> >>>>>>> >>>> >",passengers);
        const { token, TBO_data } = await this.generateTokenService.getToken(flight.ip_address);
        
        const payload = {
            "PreferredCurrency": "INR",
            "AgentReferenceNo": "Page1Travels",
            "Passengers": passengers,
            "EndUserIp": flight.ip_address,
            "TokenId": token,
            "TraceId": flight.trace_id,
            "ResultIndex": flight.result_index
        } 
        const extraAmount = calculateTotalPrice(flight.passenger_details);
       
        let amount = flight.fare[0].BaseFare + flight.fare[0].Tax + extraAmount;
        
        const is_LCC = flight.is_LCC;
        const journey = flight.journey;
        const journey_type = flight.journey_type;
        const flightType = `FLIGHT_${journey_type}_${journey}` as COMMISSION_TYPE;
        let data ;
        let commissionType ;
        if (Object.values(COMMISSION_TYPE).includes(flightType)) {
                commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType); 
                if(commissionType.commission_type === "FIXED"){
                  data = parseFloat(commissionType.percentage);
                }else if(commissionType.commission_type === "PERCENTAGE"){
                    const percentValue = parseFloat(commissionType.percentage);
                    const farePrice = flight.fare[0].BaseFare * percentValue;
                    data = farePrice/100;
                }
        } else {
                throw { message: "Invalid commission type", statusCode: ERROR_CODES.BAD_REQUEST };
        }
        
      

        const response = {payload, amount, is_LCC, journey,journey_type, commissionType};
        return response;
    }
    
    async handleNonLCC(flight: any) {
        // if(!flight.journey_type || !flight.journey || !flight.is_LCC){
        //     throw { message: "Journey Details missing like journey_type,journey, flight type", statusCode: ERROR_CODES.BAD_REQUEST };
        // }

        const {house_number,street,city,country_code,cell_country_code,nationality,gst_company_address,gst_company_contact_number,gst_company_email,gst_company_name,gst_number,ip_address,result_index,trace_id,passenger_details,fareBreakdown,fare} = flight;

        // Common additional details for passenger processing
        const additionalInfo = {
            house_number,
            street,
            city,
            country_code,
            cell_country_code,
            nationality,
            gst_company_address,
            gst_company_contact_number,
            gst_company_email,
            gst_company_name,
            gst_number
        };

        // Generate the passenger list 
        const passengers = [
            ...processPassengers(passenger_details.adult || [], 1, fareBreakdown, fare, additionalInfo),
            ...processPassengers(passenger_details.child || [], 2, fareBreakdown, fare, additionalInfo),
            ...processPassengers(passenger_details.infant || [], 3, fareBreakdown, fare, additionalInfo)
        ];

        
        const { token, TBO_data } = await this.generateTokenService.getToken(ip_address);
        // Construct final response
        const payload = {
            ResultIndex: result_index,
            Passengers: passengers,
            EndUserIp: ip_address,
            TokenId: token,
            TraceId: trace_id
        };
        const extraAmount = calculateTotalPrice(passenger_details);
        
        let amount = fare[0].BaseFare + fare[0].Tax + + extraAmount;
        const is_LCC = flight.is_LCC;
        const journey = flight.journey;
        const journey_type = flight.journey_type;
        const flightType = `FLIGHT_${journey_type}_${journey}` as COMMISSION_TYPE;
        let data ;
        let commissionType ;
        if (Object.values(COMMISSION_TYPE).includes(flightType)) {
                commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType); 
                if(commissionType.commission_type === "FIXED"){
                  data = parseFloat(commissionType.percentage);
                }else if(commissionType.commission_type === "PERCENTAGE"){
                    const percentValue = parseFloat(commissionType.percentage);
                    const farePrice = fare[0].BaseFare * percentValue;
                    data = farePrice/100;
                }
        } else {
                throw { message: "Invalid commission type", statusCode: ERROR_CODES.BAD_REQUEST };
        } 
        
        // amount = amount + data;

        const response = {payload, amount, is_LCC, journey,journey_type, commissionType};
        return response;
    }

   //for a  particular user order  check 
   async getAllBookingsForUser(userId: string) {
    try {
        const orders = await this.orderRepository.find({
            where: {
                user: {
                    id: userId
                }
            },
            relations: ['user', 'payment'],
        } as any); // 'as any' to bypass type error if entity relations are not typed correctly

        if (!orders || orders.length === 0) {
            throw new Error('No bookings found for this user');
        }

        // Map the orders and add additional details
        const parsedOrders = orders.map(order => ({
            orderId: order.custom_order_id,
            type: order.order_type,
            journey: order.journey,
            journeyType: order.journey_type,
            amount: order.amount,
            status: order.status,
            paymentStatus: order.payment?.status,
            date: order.created_at,
            user: order.user ? {
                id: order.user.id,
                name: order.user.full_name,
                email: order.user.email,
                phone: order.user.phone_number
            } : null,
            details: {
                request: this.tryParse(order.order_request),
                response: this.tryParse(order.order_response),
                ticketDetails: this.tryParse(order.ticket_details),
                contactDetails: this.tryParse(order.contact_details)
            }
        }));

        return {
            status: true,
            message: 'Bookings retrieved successfully',
            data: parsedOrders,
        };
    } catch (error) {
        console.log('Error in getAllBookingsForUser:', error);
        throw error;
    }
}
      
    async getBookingById(orderId: string) {
          try {
            const order = await this.orderRepository.findOne(orderId);
      
            if (!order) {
              throw Error('Booking not found');
            }
      
            const parsedData = {
              ...order,
              order_request:order.order_request,
              order_response: order.order_response,
              order_request_second: order.order_request_second,
              order_response_second: order.order_response_second,
              ticket_details: order.ticket_details,
              contact_details: order.contact_details,
              success_response: order.success_response,
              fail_response: order.fail_response,
            };
      
            return {
              status: true,
              message: 'Booking details retrieved successfully',
              data: parsedData,
            };
          } catch (error) {
            console.log('Error in getBookingById:', error);
            throw error;
          }
        }
      
        async getAllBookings(userId?: string) {
          try {
            const orders = await this.orderRepository.find(userId);
      
            const parsedOrders = orders.map(order => ({
              ...order,
              order_request: order.order_request,
              order_response: order.order_response,
              order_request_second:order.order_request_second,
              order_response_second: order.order_response_second,
              ticket_details: order.ticket_details,
              contact_details: order.contact_details, 
              success_response: order.success_response,
              fail_response: order.fail_response,
            }));
      
            return {
              status: true,
              message: 'Bookings retrieved successfully',
              data: parsedOrders,
            };
          } catch (error) {
            console.log('Error in getAllBookings:', error);
            throw error;
          }
        }
      
        private tryParse(data: string | null) {
          try {
            return data ? JSON.parse(data) : null;
          } catch {
            return data;
          }
        }

        // async getUserBookings(
        //     userId: string,
        //     status?: ORDER_STATUS,
        //     paymentStatus?: PAYMENT_STATUS
        //   ) {
        //     try {
        //       const query = this.orderRepository.createQueryBuilder('order')
        //         .leftJoinAndSelect('order.payment', 'payment')
        //         .where('order.user_id = :userId', { userId });
        
        //       if (status) {
        //         query.andWhere('order.status = :status', { status });
        //       }
        
        //       if (paymentStatus) {
        //         query.andWhere('payment.status = :paymentStatus', { paymentStatus });
        //       }
        
        //       const bookings = await query
        //         .orderBy('order.created_at', 'DESC')
        //         .getMany();
        
        //       return bookings.map(b => this.transformBooking(b));
        //     } catch (error) {
        //       console.error('Error in getUserBookings:', error);
        //       throw error;
        //     }
        //   }
        
        //   /**
        //    * Search bookings with multiple filters
        //    * @param filters 
        //    * @returns 
        //    */
        //   async searchBookings(filters: {
        //     search?: string;
        //     travelDate?: Date;
        //     journey?: string;
        //     journeyType?: string;
        //     status?: ORDER_STATUS;
        //     orderType?: ORDER_TYPE;
        //     paymentStatus?: PAYMENT_STATUS;
        //   }) {
        //     try {
        //       const query = this.orderRepository.cre('order')
        //         .leftJoinAndSelect('order.user', 'user')
        //         .leftJoinAndSelect('order.payment', 'payment');
        
        //       if (filters.search) {
        //         query.where('(user.email LIKE :search OR user.full_name LIKE :search)', {
        //           search: `%${filters.search}%`,
        //         });
        //       }
        
        //       if (filters.travelDate) {
        //         query.andWhere('DATE(order.created_at) = :travelDate', { 
        //           travelDate: filters.travelDate 
        //         });
        //       }
        
        //       if (filters.journey) {
        //         query.andWhere('order.journey LIKE :journey', { 
        //           journey: `%${filters.journey}%` 
        //         });
        //       }
        
        //       if (filters.journeyType) {
        //         query.andWhere('order.journey_type = :journeyType', { 
        //           journeyType: filters.journeyType 
        //         });
        //       }
        
        //       if (filters.status) {
        //         query.andWhere('order.status = :status', { 
        //           status: filters.status 
        //         });
        //       }
        
        //       if (filters.orderType) {
        //         query.andWhere('order.order_type = :orderType', { 
        //           orderType: filters.orderType 
        //         });
        //       }
        
        //       if (filters.paymentStatus) {
        //         query.andWhere('payment.status = :paymentStatus', { 
        //           paymentStatus: filters.paymentStatus 
        //         });
        //       }
        
        //       const bookings = await query
        //         .orderBy('order.created_at', 'DESC')
        //         .getMany();
        
        //       return bookings.map(b => this.transformBooking(b));
        //     } catch (error) {
        //       console.error('Error in searchBookings:', error);
        //       throw error;
        //     }
        //   }
        
        //   /**
        //    * Transform raw Order entity to API-friendly format
        //    * @param order 
        //    * @returns 
        //    */
        //   private transformBooking(order: Order) {
        //     return {
        //       orderId: order.custom_order_id,
        //       type: order.order_type,
        //       journey: order.journey,
        //       journeyType: order.journey_type,
        //       amount: order.amount,
        //       status: order.status,
        //       paymentStatus: order.payment?.status,
        //       date: order.created_at,
        //       user: order.user ? {
        //         id: order.user.id,
        //         name: order.user.full_name,
        //         email: order.user.email,
        //         phone: order.user.phone_number
        //       } : null,
        //       details: {
        //         request: this.tryParse(order.order_request),
        //         response: this.tryParse(order.order_response),
        //         ticketDetails: this.tryParse(order.ticket_details),
        //         contactDetails: this.tryParse(order.contact_details)
        //       }
        //     };
        
        //   /**
        //    * Safely parse JSON strings
        //    * @param data 
        //    * @returns 
        //    */
        // //   private tryParse(data: string | null) {
        // //     try {
        // //       return data ? JSON.parse(data) : null;
        // //     } catch {
        // //       return data;
        // //     }


        //today's work 01/07/2025
        async searchBookings(filters: {
            search?: string;
            travelDate?: Date;
            journey?: string;
            journeyType?: string;
            status?: ORDER_STATUS;
            orderType?: ORDER_TYPE;
            paymentStatus?: PAYMENT_STATUS;
          }) {
            try {
              const query = this.orderRepository.createQueryBuilder('order')
                .leftJoinAndSelect('order.user', 'user')
                .leftJoinAndSelect('order.payment', 'payment');
        
              if (filters.search) {
                query.where('(user.email LIKE :search OR user.full_name LIKE :search)', {
                  search: `%${filters.search}%`,
                });
              }
        
              if (filters.travelDate) {
                query.andWhere('DATE(order.created_at) = :travelDate', {
                  travelDate: filters.travelDate,
                });
              }
        
              if (filters.journey) {
                query.andWhere('order.journey LIKE :journey', {
                  journey: `%${filters.journey}%`,
                });
              }
        
              if (filters.journeyType) {
                query.andWhere('order.journey_type = :journeyType', {
                  journeyType: filters.journeyType,
                });
              }
        
              if (filters.status) {
                query.andWhere('order.status = :status', {
                  status: filters.status,
                });
              }
        
              if (filters.orderType) {
                query.andWhere('order.order_type = :orderType', {
                  orderType: filters.orderType,
                });
              }
        
              if (filters.paymentStatus) {
                query.andWhere('payment.status = :paymentStatus', {
                  paymentStatus: filters.paymentStatus,
                });
              }
        
              const bookings = await query
                .orderBy('order.created_at', 'DESC')
                .getMany();
        
              return bookings.map((b) => this.transformBooking(b));
            } catch (error) {
              console.error('Error in searchBookings:', error);
              throw error;
            }
          }
        
          private transformBooking(order: Order) {
            return {
              orderId: order.custom_order_id,
              type: order.order_type,
              journey: order.journey,
              journeyType: order.journey_type,
              amount: order.amount,
              status: order.status,
              paymentStatus: order.payment?.status,
              date: order.created_at,
              user: order.user
                ? {
                    id: order.user.id,
                    name: order.user.full_name,
                    email: order.user.email,
                    phone: order.user.phone_number
                  }
                : null,
              details: {
                request: this.tryParse(order.order_request),
                response: this.tryParse(order.order_response),
                ticketDetails: this.tryParse(order.ticket_details),
                contactDetails: this.tryParse(order.contact_details),
              },
            };
          }

        async getUserBookings(
            userId: string,
            status?: ORDER_STATUS,
            paymentStatus?: PAYMENT_STATUS
          ) {
            try {
              const query = await this.orderRepository.createQueryBuilder('order')
                .leftJoinAndSelect('order.payment', 'payment')
                .where('order.user_id = :userId', { userId });
        
              if (status) {
                query.andWhere('order.status = :status', { status });
              }
        
              if (paymentStatus) {
                query.andWhere('payment.status = :paymentStatus', { paymentStatus });
              }
        
              const bookings = await query
                .orderBy('order.created_at', 'DESC')
                .getMany();
        
              return bookings.map(b => this.transformBooking(b));
            } catch (error) {
              console.error('Error in getUserBookings:', error);
              throw error;
            }
          }
        
          
        //   async searchBookings(filters: {
        //     search?: string;
        //     travelDate?: Date;
        //     journey?: string;
        //     journeyType?: string;
        //     status?: ORDER_STATUS;
        //     orderType?: ORDER_TYPE;
        //     paymentStatus?: PAYMENT_STATUS;
        //   }) {
        //     try {
        //       const query = this.orderRepository.createQueryBuilder('order')
        //         .leftJoinAndSelect('order.user', 'user')
        //         .leftJoinAndSelect('order.payment', 'payment');
        
        //       if (filters.search) {
        //         query.where('(user.email LIKE :search OR user.full_name LIKE :search)', {
        //           search: `%${filters.search}%`,
        //         });
        //       }
        
        //       if (filters.travelDate) {
        //         query.andWhere('DATE(order.created_at) = :travelDate', { 
        //           travelDate: filters.travelDate 
        //         });
        //       }
        
        //       if (filters.journey) {
        //         query.andWhere('order.journey LIKE :journey', { 
        //           journey: `%${filters.journey}%` 
        //         });
        //       }
        
        //       if (filters.journeyType) {
        //         query.andWhere('order.journey_type = :journeyType', { 
        //           journeyType: filters.journeyType 
        //         });
        //       }
        
        //       if (filters.status) {
        //         query.andWhere('order.status = :status', { 
        //           status: filters.status 
        //         });
        //       }
        
        //       if (filters.orderType) {
        //         query.andWhere('order.order_type = :orderType', { 
        //           orderType: filters.orderType 
        //         });
        //       }
        
        //       if (filters.paymentStatus) {
        //         query.andWhere('payment.status = :paymentStatus', { 
        //           paymentStatus: filters.paymentStatus 
        //         });
        //       }
        
        //       const bookings = await query
        //         .orderBy('order.created_at', 'DESC')
        //         .getMany();
        
        //       return bookings.map(b => this.transformBooking(b));
        //     } catch (error) {
        //       console.error('Error in searchBookings:', error);
        //       throw error;
        //     }
        //   }
        
        //   private transformBooking(order: Order) {
        //     return {
        //       orderId: order.custom_order_id,
        //       type: order.order_type,
        //       journey: order.journey,
        //       journeyType: order.journey_type,
        //       amount: order.amount,
        //       status: order.status,
        //       paymentStatus: order.payment?.status,
        //       date: order.created_at,
        //       user: order.user ? {
        //         id: order.user.id,
        //         name: order.user.full_name,
        //         email: order.user.email,
        //         phone: order.user.phone_number
        //       } : null,
        //       details: {
        //         request: this.tryParse(order.order_request),
        //         response: this.tryParse(order.order_response),
        //         ticketDetails: this.tryParse(order.ticket_details),
        //         contactDetails: this.tryParse(order.contact_details)
        //       }
        //     };
        //   }

        //   private tryParse(data: string | null) {
        //     try {
        //       return data ? JSON.parse(data) : null;
        //     } catch {
        //       return data;
        //     }
        //   }

        async searchUsers(search?: string) {
          const where = search
            ? [
                { full_name: Like(`%${search}%`) },
                { email: Like(`%${search}%`) },
                { phone: Like(`%${search}%`) },
                { id: search }
              ]
            : {};
      
         const users = await this.userrepositoryservice.getUserByUserId(search);
         console.log("users",users);
      
          const result = await Promise.all(users.map(async user => {
            const bookings = await this.orderRepository.find(user.id);

            console.log("bookings",bookings);
            //const payments = await this.paymentRepo.find({ where: { user_id: user.id } });
      
            return {
              id: user.id,
              full_name: user.full_name,
              email: user.email,
              phone: user.phone,
              createdAt: user.created_at,
              lastLogin: user.last_login,
              bookingHistory: bookings.map(b => ({ status: b.status, type: b.order_type })),
              //paymentHistory: payments
            };
          }));
      
          return result;
        }
      
        async getUserDetails(userId: string) {
          const user = await this.userrepositoryservice.getUserByUserId(userId);
      
          const bookings = await this.orderRepository.find(user.id );
          //const payments = await this.paymentRepository.find({ where: { user_id: userId } });
      
          return {
            full_name: user.full_name,
            email: user.email,
            phone: user.phone_number,
            createdAt: user.created_at,
            lastLogin: user.last_login,
            bookingHistory: bookings,
            //paymentHistory: payments
          };
        }
      
        // async searchBookings(query: any) {
        //   const qb = this.orderRepository.createQueryBuilder('order')
        //     .leftJoinAndSelect('order.user', 'user');
      
        //   if (query.search) {
        //     qb.andWhere('(user.email LIKE :search OR user.full_name LIKE :search)', {
        //       search: `%${query.search}%`,
        //     });
        //   }
      
        //   if (query.travelDate) {
        //     qb.andWhere('DATE(order.created_at) = :travelDate', { travelDate: query.travelDate });
        //   }
      
        //   if (query.journey) {
        //     qb.andWhere('order.journey LIKE :journey', { journey: `%${query.journey}%` });
        //   }
      
        //   if (query.journeyType) {
        //     qb.andWhere('order.journey_type = :journeyType', { journeyType: query.journeyType });
        //   }
      
        //   if (query.status) {
        //     qb.andWhere('order.status = :status', { status: query.status });
        //   }
      
        //   if (query.orderType) {
        //     qb.andWhere('order.order_type = :orderType', { orderType: query.orderType });
        //   }
      
        //   const bookings = await qb.getMany();
      
        //   return bookings;
        // }
      
        async getBookingDetails(orderId: string) {
          const order = await this.orderRepository.findOne({
            where: { custom_order_id: orderId },
            relations: ['user', 'payment']
          });
      
          return {
            orderId: order.custom_order_id,
            user: {
              name: order.user.full_name,
              email: order.user.email,
              phone: order.user.phone_number,
            },
            travelDates: order.created_at,
            journey: order.journey,
            journey_type: order.journey_type,
            passengers: JSON.parse(order.ticket_details || '[]'),
            destination: JSON.parse(order.order_request || '{}')?.destination || '',
            flightHotelDetails: JSON.parse(order.order_request || '{}'),
            status: order.status,
            order_type: order.order_type,
            payment: order.payment || null
          };
        }      
  
    async cancelFlightTicket(bookingId: string, requestType: number, userEmail?: string) {
        try {
            const payload = {
                EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
                TokenId: await this.getToken(),
                RequestType: requestType, // 1 for FullCancellation
                BookingId: bookingId,
                BookingMode: 5, // API mode
                Source: 4
            };

            const url = 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetCancellationCharges';
            const result = await this.httptboapiservice.httpAPICall(url, payload);

            if (result.Response.ResponseStatus === 1) {
                // If successful, proceed with cancellation
                const cancelPayload = {
                    ...payload,
                    CancellationCharges: result.Response.CancellationCharge,
                    RefundAmount: result.Response.RefundAmount,
                    Remarks: result.Response.Remarks
                };

                const cancelUrl = 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Cancel';
                const cancelResult = await this.httptboapiservice.httpAPICall(cancelUrl, cancelPayload);

                const response = {
                    success: cancelResult.Response.ResponseStatus === 1,
                    data: cancelResult.Response,
                    cancellationCharges: result.Response
                };
 
                
                // Optionally send cancellation confirmation email here if you have a valid service
                if (typeof userEmail === 'string' && userEmail.includes('@') && response.success) {
                  const cancellationTemplate = cancellationConfirmationTemplate(response, 'Guest');
                  await this.EmailService.sendEmail(
                      userEmail,
                      'Flight Ticket Cancellation Confirmation',
                      cancellationTemplate
                  );
              console.error('Error sending flight cancellation confirmation email:');
              // Optionally: log this to a monitoring service
          }
              

                return response;
            }

            return {
                success: false,
                data: result.Response,
                error: 'Failed to get cancellation charges'
            };
        } catch (error) {
            throw new Error(`Failed to cancel flight ticket: ${error.message}`);
        }
    }

    private async getToken() {
        try {
            const payload = {
                ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
                UserName: tbo_credentials.FLIGHT_USERNAME,
                Password: tbo_credentials.FLIGHT_PASSWORD,
                EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP
            };
            const response = await this.httptboapiservice.httpAPICall(tbo_credentials.FLIGHT_AUTHENTICATION, payload);
            return response.TokenId;
        } catch (error) {
            throw Error(`Failed to get authentication token: ${error.message}`);
        }
    }

    // Flight Cancellation 

    async releasePNR(bookingId: string, endUserIp: string, tokenId: string) {
        try {
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const base_url = tbo_credentials.FLIGHT_RELEASE_PNR;
            
            const payload = {
                EndUserIp: endUserIp,
                TokenId: tokenId,
                BookingId: bookingId,
                Source: "4"
            };

            const result = await this.httptboapiservice.releasePNR(base_url, payload);
            
            return {
                success: result.Response.ResponseStatus === 1,
                data: result.Response,
                error: result.Response.ResponseStatus !== 1 ? 'Failed to release PNR' : undefined
            };
        } catch (error) {
            console.error("Error in release PNR:", error);
            throw Error(`Failed to release PNR: ${error.message}`);
        }
    }

    async getCancellationCharges(body: {
        bookingId: string;
        requestType: string;
        bookingMode: string;
        endUserIp: string;
        tokenId: string;
    }) {
        try {
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const base_url = tbo_credentials.FLIGHT_GET_CANCELLATION_CHARGES;
            
            const payload = {
                BookingId: body.bookingId,
                RequestType: body.requestType,
                BookingMode: body.bookingMode,
                EndUserIp: body.endUserIp,
                TokenId: body.tokenId
            };

            const result = await this.httptboapiservice.getCancellationCharges(base_url, payload);
            
            return {
                success: result.Response.ResponseStatus === 1,
                data: result.Response,
                cancellationCharges: result.Response,
                refundAmount: result.Response.RefundAmount,
                cancellationCharge: result.Response.CancellationCharge,
                error: result.Response.ResponseStatus !== 1 ? 'Failed to get cancellation charges' : undefined
            };
        } catch (error) {
            console.error("Error in getCancellationCharges:", error);
            throw Error(`Failed to get cancellation charges: ${error.message}`);
        }
    }

    async sendChangeRequest(body: {
        bookingId: string;
        requestType: number;
        cancellationType: number;
        sectors?: Array<{ origin: string; destination: string }>;
        ticketIds?: number[];
        remarks?: string;
        userEmail?: string;
    }) {
        try {
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const base_url = tbo_credentials.FLIGHT_SEND_CHANGE_REQUEST;
            
            const payload = {
                BookingId: body.bookingId,
                RequestType: body.requestType,
                CancellationType: body.cancellationType,
                Sectors: body.sectors?.map(s => ({
                    Origin: s.origin,
                    Destination: s.destination
                })),
                TicketId: body.ticketIds,
                Remarks: body.remarks || "Cancellation request",
                EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
                TokenId: await this.getToken()
            };

            const result = await this.httptboapiservice.sendChangeRequest(base_url, payload);
            
            const changeRequestId = result.Response.TicketCRInfo?.[0]?.ChangeRequestId;
            
            return {
                success: result.Response.ResponseStatus === 1,
                data: result.Response,
                changeRequestId: changeRequestId,
                error: result.Response.ResponseStatus !== 1 ? 'Failed to send change request' : undefined
            };
        } catch (error) {
            console.error("Error in send Change Request:", error);
            throw Error(`Failed to send change request: ${error.message}`);
        }
    }

    async getChangeRequestStatus(changeRequestId: string) {
        try {
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const base_url = tbo_credentials.FLIGHT_GET_CHANGE_REQUEST;
            
            const payload = {
                ChangeRequestId: changeRequestId,
                EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
                TokenId: await this.getToken()
            };

            const result = await this.httptboapiservice.getChangeRequestStatus(base_url, payload);
            
            return {
                success: result.ResponseStatus === 1,
                data: result,
                refundAmount: result.RefundedAmount,
                cancellationCharge: result.CancellationCharge,
                error: result.ResponseStatus !== 1 ? 'Failed to get change request status' : undefined
            };
        } catch (error) {
            console.error("Error in get Change Request Status:", error);
            throw Error(`Failed to get change request status: ${error.message}`);
        }
    }

    async cancelFlightTicketNew(body: {
        bookingId: string;
        requestType?: number;
        userEmail?: string;
        remarks?: string;
        sectors?: Array<{ origin: string; destination: string }>;
        ticketIds?: number[];
    }) {
        try {
            const { bookingId, requestType = 1, userEmail, remarks, sectors, ticketIds } = body;
            
            // Step 1: Get cancellation charges
            const chargesResult = await this.getCancellationCharges({
                bookingId,
                requestType: requestType.toString(),
                bookingMode: "5",
                endUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
                tokenId: await this.getToken()
            });

            if (!chargesResult.success) {
                return chargesResult;
            }

            // Step 2: Send change request
            const cancellationRequest = {
                bookingId,
                requestType,
                cancellationType: 3, // Sector cancellation
                sectors,
                ticketIds,
                remarks: remarks || "Flight cancellation request",
                userEmail
            };

            const changeRequestResult = await this.sendChangeRequest(cancellationRequest);

            if (!changeRequestResult.success) {
                return changeRequestResult;
            }

            // Step 3: Send cancellation confirmation email if provided
            if (userEmail && changeRequestResult.success) {
                try {
                    const cancellationTemplate = cancellationConfirmationTemplate(changeRequestResult, 'Guest');
                    await this.EmailService.sendEmail(
                        userEmail,
                        'Flight Ticket Cancellation Confirmation',
                        cancellationTemplate
                    );
                } catch (emailError) {
                    console.error('Error sending cancellation confirmation email:', emailError);
                }
            }

            return {
                success: true,
                data: changeRequestResult.data,
                cancellationCharges: chargesResult.cancellationCharges,
                changeRequestId: changeRequestResult.changeRequestId,
                refundAmount: chargesResult.refundAmount,
                cancellationCharge: chargesResult.cancellationCharge
            };
        } catch (error) {
            console.error("Error in cancel Flight Ticket", error);
            throw Error(`Failed to cancel flight ticket: ${error.message}`);
        }
    }

    async partialCancellation(body: {
        bookingId: string;
        sectors: Array<{ origin: string; destination: string }>;
        ticketIds: number[];
        remarks?: string;
        userEmail?: string;
    }) {
        try {
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const { bookingId, sectors, ticketIds, remarks, userEmail } = body;

            // Step 1: Get cancellation charges
            const chargesResult = await this.getCancellationCharges({
                bookingId,
                requestType: "2", // Partial cancellation
                bookingMode: "5",
                endUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
                tokenId: await this.getToken()
            });

            if (!chargesResult.success) {
                return chargesResult;
            }

            // Step 2: Send change request
            const cancellationRequest = {
                bookingId,
                requestType: 2, // Partial cancellation
                cancellationType: 3, // Sector cancellation
                sectors,
                ticketIds,
                remarks: remarks || "Partial cancellation request",
                userEmail
            };

            const changeRequestResult = await this.sendChangeRequest(cancellationRequest);

            if (!changeRequestResult.success) {
                return changeRequestResult;
            }

            // Step 3: Send cancellation confirmation email if provided
            if (userEmail && changeRequestResult.success) {
                try {
                    const cancellationTemplate = cancellationConfirmationTemplate(changeRequestResult, 'Guest');
                    await this.EmailService.sendEmail(
                        userEmail,
                        'Flight Ticket Partial Cancellation Confirmation',
                        cancellationTemplate
                    );
                } catch (emailError) {
                    console.error('Error sending cancellation confirmation email:', emailError);
                }
            }

            return {
                success: true,
                data: changeRequestResult.data,
                cancellationCharges: chargesResult.cancellationCharges,
                changeRequestId: changeRequestResult.changeRequestId,
                refundAmount: chargesResult.refundAmount,
                cancellationCharge: chargesResult.cancellationCharge
            };
        } catch (error) {
            console.error("Error in partialCancellation:", error);
            throw new Error(`Failed to process partial cancellation: ${error.message}`);
        }
    }

    async getAirlineTypes() {
        const GDS_SYSTEMS = [
            { code: 'Galileo', name: 'Galileo', type: 'GDS' },
            { code: 'Amadeus', name: 'Amadeus', type: 'GDS' }
        ];

        const NDC_AIRLINES = [
            { code: 'EK', name: 'Emirates', type: 'NDC' },
            { code: 'LH', name: 'Lufthansa', type: 'NDC' },
            { code: 'WY', name: 'Oman Air', type: 'NDC' },
            { code: 'EY', name: 'Etihad Airways', type: 'NDC' },
            { code: 'GF', name: 'Gulf Air', type: 'NDC' },
            { code: 'AI', name: 'Air India', type: 'NDC' }
        ];

        const LCC_AIRLINES = [
            { code: '6E', name: 'IndiGo', type: 'LCC' },
            { code: 'IX', name: 'Air India Express', type: 'LCC' },
            { code: 'SG', name: 'SpiceJet', type: 'LCC' },
            { code: 'FZ', name: 'FlyDubai', type: 'LCC' },
            { code: 'QP', name: 'Akasa Air', type: 'LCC' }
        ];

        return {
            message: "Airline types retrieved successfully",
            GDS_SYSTEMS: GDS_SYSTEMS,
            NDC_AIRLINES: NDC_AIRLINES,
            LCC_AIRLINES: LCC_AIRLINES,
        };
    }
}