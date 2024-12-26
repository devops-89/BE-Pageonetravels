import { Injectable } from "@nestjs/common";
import axios from "axios";
import { SearchFlightDto } from "../../libs/dtos/flight/flights.dto";
import { IFlightSearch, ISearchFlight } from "../interfaces/flight/search.interface";
import { JOURNEY_TYPE } from "../../libs/constants/flightConstant";

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

    async searchFlightAPI(
        token: any, 
        base_url: string, 
        base_ip: string, 
        body: ISearchFlight
    ) {
        try {
          
            const {
                min_price,
                max_price,
                multicity = [],
                return_date,
                preferred_time,
                journey_type,
                origin,
                destination,
                departure_date,
                adult,
                child = 0,
                infant = 0,
                direct_flight,
                one_stop_flight,
                cabin_class
            } = body;
           

            const segments = this.generateSegments({ journey_type, origin,  destination, departure_date, return_date, multicity, cabin_class,preferred_time});
    
           
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
                Segments: segments,
                Sources: null,
            };
          
           
            const response = await this.httpAPICall(base_url, payload);

          
            return response;
    
        } catch (error) {
            console.error("Error in searchFlightAPI function:", error);
            throw (error.message || "Failed to fetch flight data in search flight api service");
        }
    }
    
    // async BoookingFlightAPI(){
    //     try {

    //     }catch(error){
    //         console.error("Error in the search flight api call service", error);
    //         throw error.message;
    //     }
    // }


    private generateSegments({ journey_type, origin, destination, departure_date, return_date, multicity, cabin_class, preferred_time }) {
        try {
            if (journey_type === JOURNEY_TYPE.ROUNDTRIP) {
                return [
                    {
                        Origin: origin,
                        Destination: destination,
                        FlightCabinClass: cabin_class,
                        PreferredDepartureTime: `${departure_date}T${preferred_time}`,
                        PreferredArrivalTime: `${departure_date}T${preferred_time}`,
                    },
                    {
                        Origin: destination,
                        Destination: origin,
                        FlightCabinClass: cabin_class,
                        PreferredDepartureTime: `${return_date}T${preferred_time}`,
                        PreferredArrivalTime: `${return_date}T${preferred_time}`,
                    },
                ];
            }
        
            if (journey_type === JOURNEY_TYPE.MULTICITY) {
                return multicity.map((segment) => ({
                    Origin: segment.origin,
                    Destination: segment.destination,
                    FlightCabinClass: cabin_class,
                    PreferredDepartureTime: `${segment.departure_date}T${preferred_time}`,
                    PreferredArrivalTime: `${segment.departure_date}T${preferred_time}`,
                }));
            }
    
            // Default to one-way journey
            return [
                {
                    Origin: origin,
                    Destination: destination,
                    FlightCabinClass: cabin_class,
                    PreferredDepartureTime: `${departure_date}T${preferred_time}`,
                    PreferredArrivalTime: `${departure_date}T${preferred_time}`,
                },
            ];
        }catch(error){
            console.log("Error in the generate segments fucntion", error);
            throw error
        }
       
    }
    
}