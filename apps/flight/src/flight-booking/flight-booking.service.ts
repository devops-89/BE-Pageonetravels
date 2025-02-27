import { Injectable } from "@nestjs/common";
import { BookingDto, BookingNonLccDto, TicketDto } from "../../../../libs/dtos/flight/booking-flight.dto";
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { GenerateTokenService } from "../search-flight/generateToken.service";
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
// import { BookingValidator } from "./booking.utils";
import { RazorpayService } from "../../../../libs/paymentgateway/razorpay.service";
import { BookingRepositoryService, UserRepositoryService,OrderRepositoryService } from "../../../../libs/database/src";
import {  processPassengers } from '../../../../libs/utils/fareUtils';
// import { USER_ACCOUNT_STATUS, USER_TYPE, USER_VERIFY_STATUS } from "../../../../libs/constants/autenticationConstants/userContants";

@Injectable()
export class FlightBookingService {
   
    constructor(
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly redisCacheService: RedisCacheService,
        private readonly razorpayservice: RazorpayService,
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly bookingrepository: BookingRepositoryService,
        private readonly orderRepository: OrderRepositoryService,
        private readonly userrepositoryservice: UserRepositoryService
    ) {
    }

    async bookFlight(reference_id,body: BookingDto) {
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
                house_number,
                postal_code,
                street,
                state,
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
                ...this.procesPassengers(passenger_details.adult || [], 1, fareBreakdown, fare, additionalData),
                ...this.procesPassengers(passenger_details.child || [], 2, fareBreakdown, fare, additionalData),
                ...this.procesPassengers(passenger_details.infant || [], 3, fareBreakdown, fare, additionalData)
            ];
            
            // const formatPassengersData = (body) => {
            //     const {
            //         passenger_details,
            //         fareBreakdown,
            //         fare
            //     } = body;
            //     const formattedPassengers = [];
            //     // Mapping PassengerType to readable type
            //     const passengerTypes = {
            //         1: 'Adult',
            //         2: 'Child',
            //         3: 'Infant'
            //     };
            //     // Loop through all passenger types (Adult, Child, Infant)
            //     fareBreakdown.forEach(fareData => {
            //         const { PassengerType, PassengerCount, BaseFare, Tax, YQTax, AdditionalTxnFeePub, AdditionalTxnFeeOfrd } = fareData;
            //         // Check if PassengerCount is valid to avoid division by zero
            //         if (PassengerCount === 0) return;
            //         // Get the per-passenger fare by dividing by PassengerCount
            //         const perPassengerFare = {
            //             BaseFare: BaseFare / PassengerCount,
            //             Tax: Tax / PassengerCount,
            //             YQTax: YQTax / PassengerCount,
            //             AdditionalTxnFeePub: AdditionalTxnFeePub / PassengerCount,
            //             AdditionalTxnFeeOfrd: AdditionalTxnFeeOfrd / PassengerCount,
            //             OtherCharges: 0.0
            //         };
            //         // Get passenger details of the respective type
            //         const passengersOfType = passenger_details[passengerTypes[PassengerType].toLowerCase()] || [];
            //         passengersOfType.forEach(passenger => {
            //             formattedPassengers.push({
            //                 Title: passenger.title,
            //                 FirstName: passenger.first_name,
            //                 LastName: passenger.last_name,
            //                 PaxType: PassengerType,
            //                 DateOfBirth: passenger.date_of_birth,
            //                 Gender: passenger.gender === "Male" ? 1 : 2, // Assuming Male = 1, Female = 2
            //                 PassportNo: passenger.passport_no || "",
            //                 PassportExpiry: passenger.passport_expiry || "",
            //                 AddressLine1: `${body.house_number}, ${body.street}`,
            //                 AddressLine2: "",
            //                 Fare: perPassengerFare,
            //                 City: body.city,
            //                 CountryCode: body.country_code,
            //                 CountryName: body.country,
            //                 Nationality: body.nationality,
            //                 ContactNo: passenger.contact_no,
            //                 Email: passenger.email,
            //                 IsLeadPax: passenger.is_lead_pax,
            //                 FFAirlineCode: passenger.ff_airline_code || null,
            //                 FFNumber: passenger.ff_number || null,
            //                 GSTCompanyAddress: body.gst_company_address || "",
            //                 GSTCompanyContactNumber: body.gst_company_contact_number || "",
            //                 GSTCompanyName: body.gst_company_name || "",
            //                 GSTNumber: body.gst_number || "",
            //                 GSTCompanyEmail: body.gst_company_email || ""
            //             });
            //         });
            //     });
            //     return formattedPassengers;
            // };
            // Example usage
            // const formattedData = formatPassengersData(body);
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
            const amount = fare[0].BaseFare + fare[0].Tax;
            // console.log(">>>>>>",amount);
            const response = await this.orderRepository.insertBooking(reference_id,payload,amount);

            // await this.orderRepository(payload);

            // const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            // const base_url = tbo_credentials.FLIGHT_TICKET_FORLCC;
            //const response = await this.httptboapiservice.flightBookingTicket(base_url, payload);
           
            // return response;
            // return null;
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
                house_number,
                postal_code,
                street,
                state,
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
            console.log("Received Body:", body);

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

            // console.log(">>>>>>>>>>>>> >>>>> >> >",passengers);

            // Function to calculate per-passenger fare
            // const calculateFare = (passengerType) => {
            //     const breakdown = fareBreakdown.find(item => item.PassengerType === passengerType);
            //     if (!breakdown) return null;
            //     const baseFare = breakdown.BaseFare / breakdown.PassengerCount;
            //     const tax = breakdown.Tax / breakdown.PassengerCount;
            //     const fareDetails = fare[0];  // Assuming first fare object is used
            //     return {
            //         Currency: fareDetails.Currency,
            //         BaseFare: baseFare,
            //         Tax: tax,
            //         YQTax: fareDetails.YQTax,
            //         AdditionalTxnFeePub: fareDetails.AdditionalTxnFeePub,
            //         AdditionalTxnFeeOfrd: fareDetails.AdditionalTxnFeeOfrd,
            //         OtherCharges: fareDetails.OtherCharges,
            //         Discount: fareDetails.Discount,
            //         PublishedFare: fareDetails.PublishedFare,
            //         OfferedFare: fareDetails.OfferedFare,
            //         TdsOnCommission: fareDetails.TdsOnCommission,
            //         TdsOnPLB: fareDetails.TdsOnPLB,
            //         TdsOnIncentive: fareDetails.TdsOnIncentive,
            //         ServiceFee: fareDetails.ServiceFee
            //     };
            // };
            // Function to process passengers
            // const processPassengers = (passengerList, paxType) => {
            //     const calculatedFare = calculateFare(paxType);
            //     if (!calculatedFare) return [];
            //     return passengerList.map(passenger => ({
            //         Title: passenger.title,
            //         FirstName: passenger.first_name,
            //         LastName: passenger.last_name,
            //         PaxType: paxType,
            //         DateOfBirth: `${passenger.date_of_birth}T00:00:00`,
            //         Gender: passenger.gender === "Male" ? 1 : 2,
            //         PassportNo: passenger.passport_no || "",
            //         PassportExpiry: passenger.passport_expiry ? `${passenger.passport_expiry}T00:00:00` : "",
            //         AddressLine1: `${house_number}, ${street}`,
            //         AddressLine2: "",
            //         Fare: calculatedFare,
            //         City: city,
            //         CountryCode: country_code,
            //         CellCountryCode: cell_country_code,
            //         ContactNo: passenger.contact_no,
            //         Nationality: nationality,
            //         Email: passenger.email,
            //         IsLeadPax: passenger.is_lead_pax,
            //         FFAirlineCode: passenger.ff_airline_code || null,
            //         FFNumber: passenger.ff_number || "",
            //         GSTCompanyAddress: gst_company_address || "",
            //         GSTCompanyContactNumber: gst_company_contact_number || "",
            //         GSTCompanyName: gst_company_name || "",
            //         GSTNumber: gst_number || "",
            //         GSTCompanyEmail: gst_company_email || ""
            //     }));
            // };
            // Generate the passenger list
            // const passengers = [
            //     ...processPassengers(passenger_details.adult || [], 1),
            //     ...processPassengers(passenger_details.child || [], 2),
            //     ...processPassengers(passenger_details.infant || [], 3)
            // ];
            const { token, TBO_data } = await this.generateTokenService.getToken(ip_address);
            // Construct final response
            const payload = {
                ResultIndex: result_index,
                Passengers: passengers,
                EndUserIp: ip_address,
                TokenId: token,
                TraceId: trace_id
            };
            const amount = fare[0].BaseFare + fare[0].Tax;
            const response = await this.orderRepository.insertBooking(reference_id,payload,amount);
            //const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            //const base_url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
            //const response = await this.httptboapiservice.flightBooking(base_url, payload);
            //return response;
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

    private procesPassengers(passengerList: any[], paxType: number, fareBreakdown: any[], fare: any[], additionalData: any) {
        const calculateFare = (passengerType: number) => {
            const breakdown = fareBreakdown.find(item => item.PassengerType === passengerType);
            if (!breakdown) return null;
            const baseFare = breakdown.BaseFare / breakdown.PassengerCount;
            const tax = breakdown.Tax / breakdown.PassengerCount;
            const fareDetails = fare[0]; // Assuming first fare object is used
            return {
                Currency: fareDetails.Currency,
                BaseFare: baseFare,
                Tax: tax,
                YQTax: fareDetails.YQTax,
                AdditionalTxnFeePub: fareDetails.AdditionalTxnFeePub,
                AdditionalTxnFeeOfrd: fareDetails.AdditionalTxnFeeOfrd,
                OtherCharges: fareDetails.OtherCharges,
                Discount: fareDetails.Discount,
                PublishedFare: fareDetails.PublishedFare,
                OfferedFare: fareDetails.OfferedFare,
                TdsOnCommission: fareDetails.TdsOnCommission,
                TdsOnPLB: fareDetails.TdsOnPLB,
                TdsOnIncentive: fareDetails.TdsOnIncentive,
                ServiceFee: fareDetails.ServiceFee
            };
        };
    
        const calculatedFare = calculateFare(paxType);
        if (!calculatedFare) return [];
    
        return passengerList.map(passenger => ({
            Title: passenger.title,
            FirstName: passenger.first_name,
            LastName: passenger.last_name,
            PaxType: paxType,
            DateOfBirth: `${passenger.date_of_birth}T00:00:00`,
            Gender: passenger.gender === "Male" ? 1 : 2,
            PassportNo: passenger.passport_no || "",
            PassportExpiry: passenger.passport_expiry ? `${passenger.passport_expiry}T00:00:00` : "",
            AddressLine1: `${additionalData.house_number}, ${additionalData.street}`,
            AddressLine2: "",
            Fare: calculatedFare,
            City: additionalData.city,
            CountryCode: additionalData.country_code,
            CellCountryCode: additionalData.cell_country_code,
            ContactNo: passenger.contact_no,
            Nationality: additionalData.nationality,
            Email: passenger.email,
            IsLeadPax: passenger.is_lead_pax,
            FFAirlineCode: passenger.ff_airline_code || null,
            FFNumber: passenger.ff_number || "",
            GSTCompanyAddress: additionalData.gst_company_address || "",
            GSTCompanyContactNumber: additionalData.gst_company_contact_number || "",
            GSTCompanyName: additionalData.gst_company_name || "",
            GSTNumber: additionalData.gst_number || "",
            GSTCompanyEmail: additionalData.gst_company_email || ""
        }));
    }
    

    

    
   
    
    
}


