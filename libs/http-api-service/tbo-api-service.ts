import { Injectable } from "@nestjs/common";
import axios from "axios";
import { SearchFlightDto } from "../dtos/flight/search-flights.dto";
import { IFareRule, IFlightSearch, ISearchFlight } from "../interfaces/flight/search.interface";
import { JOURNEY_TYPE } from "../../libs/constants/flightConstant";

@Injectable()
export class HTTPSTboAPIService {

    constructor() { }

    async httpAPICall(baseURL: string, payload: object) {
        try {
            const result = await axios.post(baseURL, payload);
            console.log(result.data.Response.FareRules);
            return result.data;
        } catch (error) {
            console.error("Error in AXIOS api call", error.message);
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
            console.log("Payload in searchFlightAPI", payload);
            

            const response = await this.httpAPICall(base_url, payload)

            return response;

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
                        FlightCabinClass: Number(cabin_class),
                        PreferredDepartureTime: `${departure_date}T${preferred_time}`,
                        PreferredArrivalTime: `${departure_date}T${preferred_time}`,
                    },
                    {
                        Origin: destination,
                        Destination: origin,
                        FlightCabinClass: Number(cabin_class),
                        PreferredDepartureTime: `${return_date}T${preferred_time}`,
                        PreferredArrivalTime: `${return_date}T${preferred_time}`,
                    },
                ];
            }

            if (journey_type === JOURNEY_TYPE.MULTICITY) {
                return multicity.map((segment) => ({
                    Origin: segment.origin,
                    Destination: segment.destination,
                    FlightCabinClass: Number(segment.cabin_class),
                    PreferredDepartureTime: `${segment.departure_date}T${preferred_time}`,
                    PreferredArrivalTime: `${segment.departure_date}T${preferred_time}`,
                }));
            }

            // Default to one-way journey
            return [
                {
                    Origin: origin,
                    Destination: destination,
                    FlightCabinClass: Number(cabin_class),
                    PreferredDepartureTime: `${departure_date}T${preferred_time}`,
                    PreferredArrivalTime: `${departure_date}T${preferred_time}`,
                },
            ];
        } catch (error) {
            console.log("Error in the generate segments function", error);
            throw error
        }

    }


    async fareRule(baseurl: string, payload: IFareRule) {
        try {
            let result = await this.httpAPICall(baseurl, payload);
            return result;
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async FlightSeatDetails(base_url:string, payload:IFareRule) {
        try {
            let result = await this.httpAPICall(base_url, payload);
            return result;
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async BookingFlightForNonLCC(baseurl: string, body: any) {
        try {
            const { result_index, ip_address, token, trace_id, passenger_details } = body;

            const payload = {

                "ResultIndex": result_index,
                "passengers": [{
                    "Title": "Mr",
                    "FirstName": "hgjsshsxsgjh",
                    "LastName": "tbotest",
                    "PaxType": 1,
                    "DateOfBirth": "1987-12-06T00:00:00",
                    "Gender": 1,
                    "PassportNo": "KJHHJKHKJH",
                    "PassportExpiry": "2020-12-06T00:00:00",
                    "AddressLine1": "123, Test",
                    "AddressLine2": "",
                    "Fare": {
                        "Currency": "INR",
                        "BaseFare": 3171.0,
                        "Tax": 1284.0,
                        "YQTax": 0.0,
                        "AdditionalTxnFeePub": 0.0,
                        "AdditionalTxnFeeOfrd": 0.0,
                        "OtherCharges": 116.96,
                        "Discount": 0.0,
                        "PublishedFare": 4581.96,
                        "OfferedFare": 4355.03,
                        "TdsOnCommission": 6.34,
                        "TdsOnPLB": 9.14,
                        "TdsOnIncentive": 6.22,
                        "ServiceFee": 10.0
                    },
                    "City": "Gurgaon",
                    "CountryCode": "IN",
                    "CellCountryCode": "+92581-",
                    "ContactNo": "1234567890",
                    "Nationality": "IN",
                    "Email": "harsh@tbtq.in",
                    "IsLeadPax": true,
                    "FFAirlineCode": null,
                    "FFNumber": "",
                    "GSTCompanyAddress": "",
                    "GSTCompanyContactNumber": "",
                    "GSTCompanyName": "",
                    "GSTNumber": "",
                    "GSTCompanyEmail": ""
                }],
                "EndUserIp": ip_address,
                "TokenId": token,
                "TraceId": trace_id
            }

            let result = await this.httpAPICall(baseurl, payload);
            return result;

        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async BookingFlightForLCC(baseurl: string, body: any) {
        try {
            const { result_index, ip_address, token, trace_id, Passengerss, agent_number } = body;
            

            const payload =
            {
                "PreferredCurrency": null,
                "AgentReferenceNo": agent_number,
                "Passengers": Passengerss,
                "EndUserIp": ip_address,
                "TokenId": token,
                "TraceId": trace_id,
                "ResultIndex": result_index,

            }
           

            const result = await this.httpAPICall(baseurl, payload);


            return result;

        } catch (error) {
            console.log(error);
            throw error
        }
    }
}