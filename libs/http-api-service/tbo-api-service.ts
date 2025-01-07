import { Injectable } from "@nestjs/common";
import axios from "axios";
import { SearchFlightDto } from "../dtos/flight/search-flights.dto";
import { IFareRule, IFlightSearch, ISearchFlight } from "../interfaces/flight/search.interface";
import { JOURNEY_TYPE } from "../../libs/constants/flightConstant";
import fs  from 'fs';
import { trace } from "console";

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
           

            const segments = await this.generateSegments({ journey_type, origin,  destination, departure_date, return_date, multicity, cabin_class,preferred_time});
        
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
            console.log("Payload in searchFlightAPI", payload);
          
            
            const response = await this.httpAPICall(base_url, payload)
            console.log(response);
            return response;
    
        } catch (error) {
            console.error("Error in searchFlightAPI function:", error);
            throw (error.message || "Failed to fetch flight data in search flight api service");
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

    async BookingFlightForNonLCC(baseurl:string, body:any){
        try {
            const {result_index, ip_address, token, trace_id , passenger_details} =  body;
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
                    "CellCountryCode" : "+92581-",
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
            
        } catch(error){
            console.log(error);
            throw error
        }
    }

    async BookingFlightForLCC(baseurl:string, body:any){
        try {
            const {result_index, ip_address, token, trace_id , passenger_details} =  body;
            const payload =
            {
                "PreferredCurrency": null,
                "AgentReferenceNo": "sonam1234567890",
                "Passengers": [
                    {
                        "Title": "Mr",
                        "FirstName": "Rakesh",
                        "LastName": "Sharma",
                        "PaxType": 1,
                        "DateOfBirth": "1987-12-06T00:00:00",
                        "Gender": 1,
                        "PassportNo": "KJHHJKHKJH",
                        "PassportExpiry": "2025-12-06T00:00:00",
                        "AddressLine1": "123, Test",
                        "AddressLine2": "",
                        "Fare": {
                            "BaseFare": 3690,
                            "Tax": 678,
                            "YQTax": 0.0,
                            "AdditionalTxnFeePub": 0.0,
                            "AdditionalTxnFeeOfrd": 0.0,
                            "OtherCharges": 0.0
                        },
                        "City": "Gurgaon",
                        "CountryCode": "IN",
                        "CountryName": "India",
                        "Nationality": "IN",
                        "ContactNo": "9879879877",
                        "Email": "harsh@tbtq.in",
                        "IsLeadPax": true,
                        "FFAirlineCode": null,
                        "FFNumber": null,
                        "Baggage": [
                           {
                                "AirlineCode": "6E",
                                "FlightNumber": "6047",
                                "WayType": 2,
                                "Code": "NoBaggage",
                                "Description": 2,
                                "Weight": 0,
                                "Currency": "INR",
                                "Price": 0,
                                "Origin": "DEL",
                                "Destination": "BOM"
                            }
                        ],
                        "MealDynamic": [
                           {
                                "AirlineCode": "6E",
                                "FlightNumber": "6047",
                                "WayType": 2,
                                "Code": "NoMeal",
                                "Description": 2,
                                "AirlineDescription": "",
                                "Quantity": 0,
                                "Currency": "INR",
                                "Price": 0,
                                "Origin": "DEL",
                                "Destination": "BOM"
                            }
                        ],
                        "SeatDynamic": [
                           {
                                                    "AirlineCode": "6E",
                                                    "FlightNumber": "6047",
                                                    "CraftType": "A321-220",
                                                    "Origin": "DEL",
                                                    "Destination": "BOM",
                                                    "AvailablityType": 0,
                                                    "Description": 2,
                                                    "Code": "NoSeat",
                                                    "RowNo": "0",
                                                    "SeatNo": null,
                                                    "SeatType": 0,
                                                    "SeatWayType": 2,
                                                    "Compartment": 0,
                                                    "Deck": 0,
                                                    "Currency": "INR",
                                                    "Price": 0
                                                }
                        ],
                        "SpecialServices": [
                            {
                                            "Origin": "DEL",
                                            "Destination": "BOM",
                                            "DepartureTime": "2024-12-30T11:15:00",
                                            "AirlineCode": "6E",
                                            "FlightNumber": "6047",
                                            "Code": "FFWD",
                                            "ServiceType": 3,
                                            "Text": "Priority checkin is allowed",
                                            "WayType": 4,
                                            "Currency": "INR",
                                            "Price": 600
                                        }
                        ],
                        "GSTCompanyAddress": "",
                        "GSTCompanyContactNumber": "",
                        "GSTCompanyName": "",
                        "GSTNumber": "",
                        "GSTCompanyEmail": ""
                    },
                    {
                        "Title": "Mr",
                        "FirstName": "Mahesh",
                        "LastName": "Sharma",
                        "PaxType": 2,
                        "DateOfBirth": "2017-12-06T00:00:00",
                        "Gender": 1,
                        "PassportNo": "KJHHJKJH",
                        "PassportExpiry": "2025-12-06T00:00:00",
                        "AddressLine1": "123, Test",
                        "AddressLine2": "",
                        "Fare": {
                            "BaseFare": 3690,
                            "Tax": 678,
                            "YQTax": 0.0,
                            "AdditionalTxnFeePub": 0.0,
                            "AdditionalTxnFeeOfrd": 0.0,
                            "OtherCharges": 0.0
                        },
                        "City": "Gurgaon",
                        "CountryCode": "IN",
                        "CountryName": "India",
                        "Nationality": "IN",
                        "ContactNo": "9879879877",
                        "Email": "harsh@tbtq.in",
                        "IsLeadPax": false,
                        "FFAirlineCode": null,
                        "FFNumber": null,
                        "Baggage": [
                           {
                                "AirlineCode": "6E",
                                "FlightNumber": "6047",
                                "WayType": 2,
                                "Code": "NoBaggage",
                                "Description": 2,
                                "Weight": 0,
                                "Currency": "INR",
                                "Price": 0,
                                "Origin": "DEL",
                                "Destination": "BOM"
                            }
                        ],
                        "MealDynamic": [
                           {
                                "AirlineCode": "6E",
                                "FlightNumber": "6047",
                                "WayType": 2,
                                "Code": "NoMeal",
                                "Description": 2,
                                "AirlineDescription": "",
                                "Quantity": 0,
                                "Currency": "INR",
                                "Price": 0,
                                "Origin": "DEL",
                                "Destination": "BOM"
                            }
                        ],
                        "SeatDynamic": [
                           {
                                                    "AirlineCode": "6E",
                                                    "FlightNumber": "6047",
                                                    "CraftType": "A321-220",
                                                    "Origin": "DEL",
                                                    "Destination": "BOM",
                                                    "AvailablityType": 0,
                                                    "Description": 2,
                                                    "Code": "NoSeat",
                                                    "RowNo": "0",
                                                    "SeatNo": null,
                                                    "SeatType": 0,
                                                    "SeatWayType": 2,
                                                    "Compartment": 0,
                                                    "Deck": 0,
                                                    "Currency": "INR",
                                                    "Price": 0
                                                }
                        ],
                        "GSTCompanyAddress": "",
                        "GSTCompanyContactNumber": "",
                        "GSTCompanyName": "",
                        "GSTNumber": "",
                        "GSTCompanyEmail": ""
                    },
                    {
                        "Title": "Mstr",
                        "FirstName": "Hrash",
                        "LastName": "Sharma",
                        "PaxType": 3,
                        "DateOfBirth": "2023-12-06T00:00:00",
                        "Gender": 1,
                        "PassportNo": "KJHHJKHKH",
                        "PassportExpiry": "2025-12-06T00:00:00",
                        "AddressLine1": "123, Test",
                        "AddressLine2": "",
                        "Fare": {
                            "BaseFare": 1667,
                            "Tax": 83,
                            "YQTax": 0.0,
                            "AdditionalTxnFeePub": 0.0,
                            "AdditionalTxnFeeOfrd": 0.0,
                            "OtherCharges": 0.0
                        },
                        "City": "Gurgaon",
                        "CountryCode": "IN",
                        "CountryName": "India",
                        "Nationality": "IN",
                        "ContactNo": "9879879877",
                        "Email": "harsh@tbtq.in",
                        "IsLeadPax": false,
                        "FFAirlineCode": null,
                        "FFNumber": null,
                        "GSTCompanyAddress": "",
                        "GSTCompanyContactNumber": "",
                        "GSTCompanyName": "",
                        "GSTNumber": "",
                        "GSTCompanyEmail": ""
                    }
                ],
               "EndUserIp": "192.168.5.56",
              "TokenId": "ac2751e9-4cc3-406f-b678-c947e4f57a00",
              "TraceId": "f140170f-2b71-4b51-9cec-423a8f0bfef3",
              "ResultIndex": "OB2[TBO]ZJfnrNr3lGdOyRzztpRBmpqAnpA8mmd12UtfkktuuMcRXXF+7PK+/bnF1gS0v+UoWfYG/BwPX5S2UJu0HNhTZX+W/96o0tgqGP0KVW1tGjPY8Tm7/YWb8lttExBQkTLSGV483dt3Iv77t4AWMlRZsQcIJ5a8aEe/JNO/e+t/dWseJfu1sRArWmHUDpK5WQGnYfm657yX77yL7QmBYXx6VNzEOph1TLWcsXbEtP8RLU1Jvu0hkHPkAqMf2Gz7KMzgq0WsGDlAGby3jkyf/xz4+miELH/gfsdbQCCzY2iUWlRjrplDQcu7KgLoF7ZvKLBAq9zwt8RwxBCgKGSNbaCY1s2LfE00I0BsK/PVLWmMoy3aZx9i3s79hP/HD3YtR13an/rmwGZUAVnH8Wk2l15offmsxTMry/y2MTwTSq0gaiqA8bKSQomOQz3yYAAHDcdwR9VpBwY7M8kcO+hDtcq9pOfN1XWGOAgma4CFRn8dzqZbKXNFBlk/STQpzVM6HQ14xQFUgPDHrCoCjI8jnWf7uKCF33VZSVWlO2Ncs/vjf0th9VOeb63ny2EzYKmNBWxA"
            }
            let result = await this.httpAPICall(baseurl, payload);
            return result;
            
        } catch(error){
            console.log(error);
            throw error
        }
    }
}