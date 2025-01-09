import { Injectable } from "@nestjs/common";
import { BookingDto } from "../../../../libs/dtos/flight/booking-flight.dto";
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { GenerateTokenService } from "../search-flight/generateToken.service";


@Injectable()
export class FlightBookingService {
    constructor(
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly generateTokenService: GenerateTokenService
    ) {
    }

    async bookFlight(body: BookingDto) {
        try {
            const { ip_address, passenger_details, is_LCC } = body;


            console.log("Booking Details", body, passenger_details);
            const { token, TBO_data } = await this.generateTokenService.getToken(ip_address);

            const LCC_base_url = TBO_data.FLIGHT_TICKET_FORLCC; //Non LCC only
            const Non_LCC_base_url = TBO_data.FLIGHT_BOOKING_API_FORNONLCC; //Non LCC only

            console.log("Token", token);

            if (!is_LCC) {
                await this.httptboapiservice.BookingFlightForNonLCC(Non_LCC_base_url, body);
            } else {
                await this.httptboapiservice.BookingFlightForLCC(LCC_base_url, body);
            }


            return { message: 'Flight booked successfully', data: null };
        } catch (err) {
            console.log("Error in the FLight Booking Service For NON LCC", err);
            throw err;
        }
    }


    // async bookFlightForLCC(body: BookingDto) {

    //     const {ip_address, passenger_details} = body;

    //     console.log("Booking Details", body, passenger_details);

    //     const { token, TBO_data } = await this.generateTokenService.getToken(ip_address);

    //     const booking_base_url = TBO_data.FLIGHT_TICKET_FORLCC //Non LCC only

    //     console.log("Token", token);

    //     await this.httptboapiservice.BookingFlightForNonLCC(booking_base_url, body);

    //     return { message : 'Flight booked successfully', data : null};
    // }catch(err) {
    //     console.log("Error in the FLight Booking Service For LCC", err);
    //     throw err;
    // }
}



//LCC - direct flight with payemmnet
//Non LCC - first book the seat then pay later