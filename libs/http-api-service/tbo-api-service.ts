import { Injectable } from "@nestjs/common";
import axios from "axios";
import { SearchFlightDto } from "../dtos/flight/search-flights.dto";
import { IFareRule, IFlightSearch, ISearchFlight } from "../interfaces/flight/search.interface";
import { JOURNEY_TYPE } from "../../libs/constants/flightConstant";
import fs  from 'fs';

@Injectable()
export class HTTPSTboAPIService {

    constructor(){}

    async httpAPICall(baseURL:string, payload:object){
        try {
            const result = await axios.post(baseURL, payload);
            return result.data;
        }catch(error){
            console.log("Error in AXIOS api call", error.message);
            throw error.message;
        }
    }

    // async searchFlightAPI(
    //     token: any, 
    //     base_url: string, 
    //     base_ip: string, 
    //     body: ISearchFlight
    // ) {
    //     try {
          
    //         const {
    //             min_price,
    //             max_price,
    //             multicity = [],
    //             return_date,
    //             preferred_time,
    //             journey_type,
    //             origin,
    //             destination,
    //             departure_date,
    //             adult,
    //             child = 0,
    //             infant = 0,
    //             direct_flight,
    //             one_stop_flight,
    //             cabin_class
    //         } = body;
           

    //         const segments = await this.generateSegments({ journey_type, origin,  destination, departure_date, return_date, multicity, cabin_class,preferred_time});
        
    //         const payload: IFlightSearch = {
    //             EndUserIp: base_ip,
    //             TokenId: token,
    //             AdultCount: adult,
    //             ChildCount: child,
    //             InfantCount: infant,
    //             DirectFlight: direct_flight,
    //             JourneyType: journey_type,
    //             OneStopFlight: one_stop_flight,
    //             PreferredAirlines: null,
    //             Segments: segments,
    //             Sources: null,
    //             MinPrice: min_price,
    //             MaxPrice: max_price,
    //         };
          
          
    //         const response = await this.httpAPICall(base_url, payload);

    //         const availablePrices = response.Response.Results.flatMap(result =>
    //             result.map(flight => flight.Fare.PublishedFare)
    //         );


    //     const minFlightPrice = Math.min(...availablePrices);
    //     const maxFlightPrice = Math.max(...availablePrices);
          
    //         //return response;
    //         return {
    //             message: "Flight list fetched successfully",
    //             data: {
    //                 minFlightPrice,
    //                 maxFlightPrice,
    //                 flights: response.Response.Results
    //             }
    //         }
    
    //     } catch (error) {
    //         console.error("Error in searchFlightAPI function:", error);
    //         throw (error.message || "Failed to fetch flight data in search flight api service");
    //     }
    // }

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
    
            // Verify the journey type
            if (![JOURNEY_TYPE.ROUNDTRIP, JOURNEY_TYPE.ONEWAY, JOURNEY_TYPE.MULTICITY].includes(journey_type)) {
                throw new Error("Invalid journey type provided.");
            }
    
            // Generate segments based on journey type
            const segments = await this.generateSegments({ journey_type, origin, destination, departure_date, return_date, multicity, cabin_class, preferred_time });
    
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
                MinPrice: min_price,
                MaxPrice: max_price,
            };
    
            // Log the request payload
            console.log("Request payload:", payload);
    
            const response = await this.httpAPICall(base_url, payload);
    
            if (!response?.Response?.Results || response.Response.Results.length === 0) {
                throw new Error("Invalid response structure or empty Results.");
            }
            
            // Log the response
            console.log("API Response:", response);
    
            // Check if the response is valid
            if (!response?.Response?.Results || response.Response.Results.length === 0) {
                throw new Error("Invalid response structure or empty Results.");
            }
    
            const availablePrices = response.Response.Results.flatMap(result => 
                result.map(flight => flight.Fare.PublishedFare)
            );
    
            const minFlightPrice = Math.min(...availablePrices);
            const maxFlightPrice = Math.max(...availablePrices);
    
            return {
                message: "Flight list fetched successfully",
                data: {
                    minFlightPrice,
                    maxFlightPrice,
                    flights: response.Response.Results
                }
            };
            
        } catch (error) {
            // Enhanced error handling
            console.error("Error in searchFlightAPI function:", error);
            
            if (typeof error === "string") {
                throw { message: error, status_code: 400 };
            } else if (error.message) {
                throw { message: error.message, status_code: 500 };
            }
    
            throw { message: "An unknown error occurred.", status_code: 500 };
        }
    }


    async generateSegments({ journey_type, origin, destination, departure_date, return_date, multicity, cabin_class, preferred_time }) {
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
                    FlightCabinClass: segment.cabin_class,
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
    
    
    async fareRule(baseurl:string, payload:IFareRule){
        try {
          let result = await this.httpAPICall(baseurl, payload);
          return result;
        } catch(error){
          console.log(error);
          throw error
      }
    }

    
}