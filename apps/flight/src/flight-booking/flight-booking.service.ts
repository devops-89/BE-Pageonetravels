import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
//import { InjectRepository } from "@nestjs/typeorm";
//import { Repository } from "typeorm";
import { BookingDto, BookingNonLccDto, TicketDto } from "../../../../libs/dtos/flight/booking-flight.dto";
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { GenerateTokenService } from "../search-flight/generateToken.service";
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
import { CommissionRepositoryService } from '../../../../libs/database/src';
import { RazorpayService } from "../../../../libs/paymentgateway/razorpay.service";
import { BookingRepositoryService, UserRepositoryService, OrderRepositoryService} from "../../../../libs/database/src";
import {  processPassengers,procesPassengers } from '../../../../libs/utils/fareUtils';
import {  calculateTotalPrice } from '../../../../libs/utils/passengerUtils';
import { COMMISSION_TYPE } from "../../../../libs/constants/autenticationConstants/userContants";
import { ERROR_CODES } from "../../../../libs/constants/commonConstants";
import { RoundDto } from "../../../../libs/dtos/flight/round-flight.dto";
//import { ORDER_TYPE } from "../../../../libs/constants/orderConstant";
import { EmailService } from "../../../../libs/email-service/email.service";
import { IGETAGENCYBALANCE } from '../../../../libs/interfaces/flight/flight-detail.interface';
import axios from 'axios';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';

@Injectable()
export class FlightBookingService {

    constructor(
        private readonly responsehandlerservice: ResponseHandlerService,
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly commissionRepositoryService:CommissionRepositoryService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly redisCacheService: RedisCacheService,
        private readonly razorpayservice: RazorpayService,
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly bookingrepository: BookingRepositoryService,
        private readonly EmailService: EmailService,
        private readonly orderRepository: OrderRepositoryService,
        private readonly userrepositoryservice: UserRepositoryService
    ) {

    }

    async bookFlight(reference_id, body: BookingDto) {
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
                gst_number,
            };

          console.log("Passennger  Details: ",passenger_details);

            const passengers = [
                ...procesPassengers(passenger_details.adult || [], 1, fareBreakdown, fare, additionalData),
                ...procesPassengers(passenger_details.child || [], 2, fareBreakdown, fare, additionalData),
                ...procesPassengers(passenger_details.infant || [], 3, fareBreakdown, fare, additionalData),
            ];



          console.log("passengers formated:",passengers);

            const { token } = await this.generateTokenService.getToken(ip_address);

            const payload = {
                PreferredCurrency: "INR",
                AgentReferenceNo: "Page1Travels",
                Passengers: passengers,
                EndUserIp: ip_address,
                TokenId: token,
                TraceId: trace_id,
                ResultIndex: result_index,
            };

            const extraAmount:number = calculateTotalPrice(passenger_details);
            console.log("extraAmount",extraAmount);
            // let amount = fare[0].BaseFare + fare[0].Tax + extraAmount;
            let amount:number=fare[0].PublishedFare+extraAmount;

            const journey_type = body.journey_type;
            const journey = body.journey;
            const is_LCC = body.is_LCC;
            const flightType = `FLIGHT_${journey_type}_${journey}` as COMMISSION_TYPE;

            let commissionType;
            let data;

            if (Object.values(COMMISSION_TYPE).includes(flightType)) {
                commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType);

                if (commissionType.commission_type === "FIXED") {
                    data = parseFloat(commissionType.percentage);
                } else if (commissionType.commission_type === "PERCENTAGE") {
                    const percentValue = parseFloat(commissionType.percentage);
                    data = (fare[0].BaseFare * percentValue) / 100;
                }
            } else {
                throw new BadRequestException("Invalid commission type");
            }

            amount = amount + data;

            // Step 1: Fetch Agency Balance
            const agencyBalancePayload: IGETAGENCYBALANCE = {
                EndUserIp: ip_address,
            };

            const { data: agencyBalanceResponse } = await axios.post(
                "https://api.dev.page1travels.com/payment/api/razorpay/get-agency-balance",
                agencyBalancePayload
            );

            if (!agencyBalanceResponse?.success) {
                throw new BadRequestException({
                    message: agencyBalanceResponse.message,
                    statusCode: agencyBalanceResponse.statusCode,
                    extraError: agencyBalanceResponse.extraError,
                });
            }

            const agencyCashBalance = agencyBalanceResponse.data?.CashBalance ?? 0;
            console.log("Amount: ", amount);
            console.log("Agency Cash Balance: ", agencyCashBalance);

            if (agencyCashBalance < amount) {
                throw new HttpException(
                    'Insufficient balance. Please recharge your account before booking.',
                    402, // Payment Required
                );
            }

            const order_type = "FLIGHT";
            const orderResponse = await this.orderRepository.insertBooking(
                reference_id,
                order_type,
                payload,
                amount,
                is_LCC,
                journey,
                journey_type,
                commissionType.commission_type,
                commissionType.percentage
            );

            return {
                success: true,
                message: "Successfully Created Order.",
                response: orderResponse,
            };

        } catch (err) {
            console.error("Error in Flight Booking Service:", err);
            throw err;
        }
    }


    // comment  for passpport issue date error not saving
    // async bookFlightForNonLCC(reference_id,body: BookingNonLccDto)
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
                fare,
                order_request_second
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

            console.log("Passennger  Details: ",passenger_details);

            // Generate the passenger list
            const passengers = [
                ...processPassengers(passenger_details.adult || [], 1, fareBreakdown, fare, additionalInfo),
                ...processPassengers(passenger_details.child || [], 2, fareBreakdown, fare, additionalInfo),
                ...processPassengers(passenger_details.infant || [], 3, fareBreakdown, fare, additionalInfo)
            ];

            console.log("passengers formated:",passengers);


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
            console.log("extraAmount:", extraAmount);
            console.log("PublishedFare:", fare[0].PublishedFare);
            // let amount = fare[0].BaseFare + fare[0].Tax + + extraAmount;
            let amount:number=fare[0].PublishedFare+extraAmount;
            const is_LCC = body.is_LCC;
            const journey = body.journey;
            const journey_type = body.journey_type;
            const flightType = `FLIGHT_${journey_type}_${journey}` as COMMISSION_TYPE;
            let data ;
            let commissionType;
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

            console.log("Data:",data);
            console.log("payload object: ",payload);
            amount = amount + data;
            const order_type = "FLIGHT";
            const response = await this.orderRepository.insertBooking(reference_id,order_type,payload,amount,is_LCC,journey,journey_type,commissionType.commission_type,commissionType.percentage,order_request_second);

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
            console.log("rounndtripp callled")

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

        const {city,country_code,cell_country_code,address,nationality,gst_company_address,gst_company_contact_number,gst_company_email,gst_company_name,gst_number} = flight;

        // Store additional data in a single object to pass easily
        const additionalData = {
            // house_number,
            // street,
            city,
            address,
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

        // let amount = flight.fare[0].BaseFare + flight.fare[0].Tax + extraAmount;
        let amount=flight.fare[0].PublishedFare+extraAmount;

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

        const {city,country_code,cell_country_code,nationality,gst_company_address,gst_company_contact_number,gst_company_email,gst_company_name,gst_number,ip_address,result_index,trace_id,passenger_details,fareBreakdown,fare} = flight;

        // Common additional details for passenger processing
        const additionalInfo = {
            // house_number,
            // street,
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

        // const amount = fare[0].BaseFare + fare[0].Tax + + extraAmount;
        const amount=fare[0].PublishedFare+extraAmount;


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

}
