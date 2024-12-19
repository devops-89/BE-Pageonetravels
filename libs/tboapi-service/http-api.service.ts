import { Injectable } from "@nestjs/common";
import axios from "axios";
import { IFlightSearch } from "libs/interfaces/flight/search.interface";

@Injectable()
export class HTTPSTboAPIService {

    constructor(){}

    async httpAPICall(baseURL:string, payload:object){
        try {
            const result = await axios.post(baseURL, payload);
            return result.data;
        }catch(error){
            console.log("Error in AXIOS api call", error);
            throw error.message;
        }
    }

    async TBOTokenAPI(){
        try {
            
        }catch(error){

        }
    }

    async searchFlightAPI(token, base_url, base_ip, body){
        try {
            const {
                journey_type,
                origin,
                destination,
                journey_date,
                adult,
                child ,
                infant,
                direct_flight,
                one_stop_flight,
                cabin_class,
            } = body;

            const payload: IFlightSearch = {
                EndUserIp: base_ip,
                TokenId: token,
                AdultCount: adult,
                ChildCount: child,
                InfantCount: infant,
                DirectFlight: direct_flight,
                JourneyType: journey_type,
                OneStopFlight: one_stop_flight,
                PreferredAirlines: null,
                Segments: [
                    {
                        Origin: origin,
                        Destination: destination,
                        FlightCabinClass: cabin_class,
                        PreferredDepartureTime: `${journey_date}T00:00:00`,
                        PreferredArrivalTime: `${journey_date}T00:00:00`,
                    },
                ],
                Sources: null,
            };

            let res= await this.httpAPICall(base_url, payload);

            return res;
        }catch(error){
            console.error("Error in the search flight api call service", error);
            throw error.message;
        }
    }
    async BoookingFlightAPI(){
        try {

        }catch(error){
            console.error("Error in the search flight api call service", error);
            throw error.message;
        }
    }

}