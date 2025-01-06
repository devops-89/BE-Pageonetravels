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
            return result;
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
          
            const response = {
                "Response": {
                    "ResponseStatus": 1,
                    "Error": {
                        "ErrorCode": 0,
                        "ErrorMessage": ""
                    },
                    "TraceId": "178e9b73-a8c4-4ea8-9d1e-34e6babc9860",
                    "Origin": "IXA",
                    "Destination": "DEL",
                    "Results": [
                        [
                            {
                                "FirstNameFormat": null,
                                "IsBookableIfSeatNotAvailable": false,
                                "IsHoldAllowedWithSSR": false,
                                "LastNameFormat": null,
                                "ResultIndex": "OB1",
                                "Source": 6,
                                "IsLCC": true,
                                "IsRefundable": true,
                                "IsPanRequiredAtBook": false,
                                "IsPanRequiredAtTicket": false,
                                "IsPassportRequiredAtBook": false,
                                "IsPassportRequiredAtTicket": false,
                                "GSTAllowed": true,
                                "IsCouponAppilcable": true,
                                "IsGSTMandatory": false,
                                "AirlineRemark": "On all Indigo Code shared flight, Free Meal will be included ..WEB.",
                                "IsPassportFullDetailRequiredAtBook": false,
                                "ResultFareType": "RegularFare",
                                "Fare": {
                                    "Currency": "INR",
                                    "BaseFare": 26200,
                                    "Tax": 2346,
                                    "TaxBreakup": [
                                        {
                                            "key": "K3",
                                            "value": 0
                                        },
                                        {
                                            "key": "YQTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "YR",
                                            "value": 100
                                        },
                                        {
                                            "key": "PSF",
                                            "value": 0
                                        },
                                        {
                                            "key": "UDF",
                                            "value": 0
                                        },
                                        {
                                            "key": "INTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "TransactionFee",
                                            "value": 0
                                        },
                                        {
                                            "key": "OtherTaxes",
                                            "value": 2246
                                        }
                                    ],
                                    "YQTax": 0,
                                    "AdditionalTxnFeeOfrd": 0,
                                    "AdditionalTxnFeePub": 0,
                                    "PGCharge": 0,
                                    "OtherCharges": 0.00,
                                    "ChargeBU": [
                                        {
                                            "key": "TBOMARKUP",
                                            "value": 0
                                        },
                                        {
                                            "key": "GLOBALPROCUREMENTCHARGE",
                                            "value": 0.00
                                        },
                                        {
                                            "key": "CONVENIENCECHARGE",
                                            "value": 0
                                        },
                                        {
                                            "key": "OTHERCHARGE",
                                            "value": 0.00
                                        }
                                    ],
                                    "Discount": 0,
                                    "PublishedFare": 28546,
                                    "CommissionEarned": 193.36,
                                    "PLBEarned": 0,
                                    "IncentiveEarned": 0.00,
                                    "OfferedFare": 28352.64,
                                    "TdsOnCommission": 9.67,
                                    "TdsOnPLB": 0,
                                    "TdsOnIncentive": 0.00,
                                    "ServiceFee": 0,
                                    "TotalBaggageCharges": 0,
                                    "TotalMealCharges": 0,
                                    "TotalSeatCharges": 0,
                                    "TotalSpecialServiceCharges": 0
                                },
                                "FareBreakdown": [
                                    {
                                        "Currency": "INR",
                                        "PassengerType": 1,
                                        "PassengerCount": 2,
                                        "BaseFare": 26200,
                                        "Tax": 2346,
                                        "TaxBreakUp": [
                                            {
                                                "key": "YQTax",
                                                "value": 0
                                            },
                                            {
                                                "key": "YR",
                                                "value": 100
                                            },
                                            {
                                                "key": "OtherTaxes",
                                                "value": 2246
                                            }
                                        ],
                                        "YQTax": 0,
                                        "AdditionalTxnFeeOfrd": 0,
                                        "AdditionalTxnFeePub": 0,
                                        "PGCharge": 0,
                                        "SupplierReissueCharges": 0
                                    }
                                ],
                                "Segments": [
                                    [
                                        {
                                            "Baggage": "15 Kilograms",
                                            "CabinBaggage": "7 KG",
                                            "CabinClass": 2,
                                            "SupplierFareClass": null,
                                            "TripIndicator": 1,
                                            "SegmentIndicator": 1,
                                            "Airline": {
                                                "AirlineCode": "6E",
                                                "AirlineName": "Indigo",
                                                "FlightNumber": "2306",
                                                "FareClass": "VR",
                                                "OperatingCarrier": ""
                                            },
                                            "NoOfSeatAvailable": 3,
                                            "Origin": {
                                                "Airport": {
                                                    "AirportCode": "IXA",
                                                    "AirportName": "Singerbhil",
                                                    "Terminal": "",
                                                    "CityCode": "IXA",
                                                    "CityName": "Agartala",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "DepTime": "2024-07-01T15:40:00"
                                            },
                                            "Destination": {
                                                "Airport": {
                                                    "AirportCode": "DEL",
                                                    "AirportName": "Indira Gandhi Airport",
                                                    "Terminal": "2",
                                                    "CityCode": "DEL",
                                                    "CityName": "Delhi",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "ArrTime": "2024-07-01T18:20:00"
                                            },
                                            "Duration": 160,
                                            "GroundTime": 0,
                                            "Mile": 0,
                                            "StopOver": false,
                                            "FlightInfoIndex": "",
                                            "StopPoint": "",
                                            "StopPointArrivalTime": null,
                                            "StopPointDepartureTime": null,
                                            "Craft": "320",
                                            "Remark": null,
                                            "IsETicketEligible": true,
                                            "FlightStatus": "Confirmed",
                                            "Status": "",
                                            "FareClassification": {
                                                "Type": "Saver"
                                            }
                                        }
                                    ]
                                ],
                                "LastTicketDate": null,
                                "TicketAdvisory": null,
                                "FareRules": [
                                    {
                                        "Origin": "IXA",
                                        "Destination": "DEL",
                                        "Airline": "6E",
                                        "FareBasisCode": "V0IP",
                                        "FareRuleDetail": "",
                                        "FareRestriction": "",
                                        "FareFamilyCode": "",
                                        "FareRuleIndex": ""
                                    }
                                ],
                                "AirlineCode": "6E",
                                "MiniFareRules": [
                                    [
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "0",
                                            "To": "3",
                                            "Unit": "DAYS",
                                            "Details": "INR 2999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "4",
                                            "To": "",
                                            "Unit": "DAYS",
                                            "Details": "INR 2250"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "0",
                                            "To": "3",
                                            "Unit": "DAYS",
                                            "Details": "INR 3999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "4",
                                            "To": "",
                                            "Unit": "DAYS",
                                            "Details": "INR 2999"
                                        }
                                    ]
                                ],
                                "ValidatingAirline": "6E",
                                "FareClassification": {
                                    "Color": "lime",
                                    "Type": "Saver"
                                }
                            },
                            {
                                "FirstNameFormat": null,
                                "IsBookableIfSeatNotAvailable": false,
                                "IsHoldAllowedWithSSR": false,
                                "LastNameFormat": null,
                                "ResultIndex": "OB2",
                                "Source": 39,
                                "IsLCC": true,
                                "IsRefundable": true,
                                "IsPanRequiredAtBook": false,
                                "IsPanRequiredAtTicket": false,
                                "IsPassportRequiredAtBook": false,
                                "IsPassportRequiredAtTicket": false,
                                "GSTAllowed": true,
                                "IsCouponAppilcable": true,
                                "IsGSTMandatory": false,
                                "AirlineRemark": "On all Indigo Code shared flight, Free Meal will be included ..WEBB.",
                                "IsPassportFullDetailRequiredAtBook": false,
                                "ResultFareType": "RegularFare",
                                "Fare": {
                                    "Currency": "INR",
                                    "BaseFare": 26200,
                                    "Tax": 2346,
                                    "TaxBreakup": [
                                        {
                                            "key": "K3",
                                            "value": 0
                                        },
                                        {
                                            "key": "YQTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "YR",
                                            "value": 100
                                        },
                                        {
                                            "key": "PSF",
                                            "value": 0
                                        },
                                        {
                                            "key": "UDF",
                                            "value": 0
                                        },
                                        {
                                            "key": "INTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "TransactionFee",
                                            "value": 0
                                        },
                                        {
                                            "key": "OtherTaxes",
                                            "value": 2246
                                        }
                                    ],
                                    "YQTax": 0,
                                    "AdditionalTxnFeeOfrd": 0,
                                    "AdditionalTxnFeePub": 0,
                                    "PGCharge": 0,
                                    "OtherCharges": 0.00,
                                    "ChargeBU": [
                                        {
                                            "key": "TBOMARKUP",
                                            "value": 0
                                        },
                                        {
                                            "key": "GLOBALPROCUREMENTCHARGE",
                                            "value": 0.00
                                        },
                                        {
                                            "key": "CONVENIENCECHARGE",
                                            "value": 0
                                        },
                                        {
                                            "key": "OTHERCHARGE",
                                            "value": 0.00
                                        }
                                    ],
                                    "Discount": 0,
                                    "PublishedFare": 28546,
                                    "CommissionEarned": 193.36,
                                    "PLBEarned": 0,
                                    "IncentiveEarned": 0.00,
                                    "OfferedFare": 28352.64,
                                    "TdsOnCommission": 9.67,
                                    "TdsOnPLB": 0,
                                    "TdsOnIncentive": 0.00,
                                    "ServiceFee": 0,
                                    "TotalBaggageCharges": 0,
                                    "TotalMealCharges": 0,
                                    "TotalSeatCharges": 0,
                                    "TotalSpecialServiceCharges": 0
                                },
                                "FareBreakdown": [
                                    {
                                        "Currency": "INR",
                                        "PassengerType": 1,
                                        "PassengerCount": 2,
                                        "BaseFare": 26200,
                                        "Tax": 2346,
                                        "TaxBreakUp": [
                                            {
                                                "key": "YQTax",
                                                "value": 0
                                            },
                                            {
                                                "key": "YR",
                                                "value": 100
                                            },
                                            {
                                                "key": "OtherTaxes",
                                                "value": 2246
                                            }
                                        ],
                                        "YQTax": 0,
                                        "AdditionalTxnFeeOfrd": 0,
                                        "AdditionalTxnFeePub": 0,
                                        "PGCharge": 0,
                                        "SupplierReissueCharges": 0
                                    }
                                ],
                                "Segments": [
                                    [
                                        {
                                            "Baggage": "15 Kilograms",
                                            "CabinBaggage": "7 KG",
                                            "CabinClass": 2,
                                            "SupplierFareClass": null,
                                            "TripIndicator": 1,
                                            "SegmentIndicator": 1,
                                            "Airline": {
                                                "AirlineCode": "6E",
                                                "AirlineName": "Indigo",
                                                "FlightNumber": "2306",
                                                "FareClass": "VR",
                                                "OperatingCarrier": ""
                                            },
                                            "NoOfSeatAvailable": 3,
                                            "Origin": {
                                                "Airport": {
                                                    "AirportCode": "IXA",
                                                    "AirportName": "Singerbhil",
                                                    "Terminal": "",
                                                    "CityCode": "IXA",
                                                    "CityName": "Agartala",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "DepTime": "2024-07-01T15:40:00"
                                            },
                                            "Destination": {
                                                "Airport": {
                                                    "AirportCode": "DEL",
                                                    "AirportName": "Indira Gandhi Airport",
                                                    "Terminal": "2",
                                                    "CityCode": "DEL",
                                                    "CityName": "Delhi",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "ArrTime": "2024-07-01T18:20:00"
                                            },
                                            "Duration": 160,
                                            "GroundTime": 0,
                                            "Mile": 0,
                                            "StopOver": false,
                                            "FlightInfoIndex": "",
                                            "StopPoint": "",
                                            "StopPointArrivalTime": null,
                                            "StopPointDepartureTime": null,
                                            "Craft": "320",
                                            "Remark": null,
                                            "IsETicketEligible": true,
                                            "FlightStatus": "Confirmed",
                                            "Status": "",
                                            "FareClassification": {
                                                "Type": "Saver"
                                            }
                                        }
                                    ]
                                ],
                                "LastTicketDate": null,
                                "TicketAdvisory": null,
                                "FareRules": [
                                    {
                                        "Origin": "IXA",
                                        "Destination": "DEL",
                                        "Airline": "6E",
                                        "FareBasisCode": "V0IP",
                                        "FareRuleDetail": "",
                                        "FareRestriction": "",
                                        "FareFamilyCode": "",
                                        "FareRuleIndex": ""
                                    }
                                ],
                                "AirlineCode": "6E",
                                "MiniFareRules": [
                                    [
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "0",
                                            "To": "3",
                                            "Unit": "DAYS",
                                            "Details": "INR 2999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "4",
                                            "To": "",
                                            "Unit": "DAYS",
                                            "Details": "INR 2250"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "0",
                                            "To": "3",
                                            "Unit": "DAYS",
                                            "Details": "INR 3999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "4",
                                            "To": "",
                                            "Unit": "DAYS",
                                            "Details": "INR 2999"
                                        }
                                    ]
                                ],
                                "ValidatingAirline": "6E",
                                "FareClassification": {
                                    "Color": "lime",
                                    "Type": "Saver"
                                }
                            },
                            {
                                "FirstNameFormat": null,
                                "IsBookableIfSeatNotAvailable": false,
                                "IsHoldAllowedWithSSR": false,
                                "LastNameFormat": null,
                                "ResultIndex": "OB3",
                                "Source": 85,
                                "IsLCC": true,
                                "IsRefundable": true,
                                "IsPanRequiredAtBook": false,
                                "IsPanRequiredAtTicket": false,
                                "IsPassportRequiredAtBook": false,
                                "IsPassportRequiredAtTicket": false,
                                "GSTAllowed": true,
                                "IsCouponAppilcable": true,
                                "IsGSTMandatory": false,
                                "AirlineRemark": "IndigoAPI4.",
                                "IsPassportFullDetailRequiredAtBook": false,
                                "ResultFareType": "RegularFare",
                                "Fare": {
                                    "Currency": "INR",
                                    "BaseFare": 26200,
                                    "Tax": 2346,
                                    "TaxBreakup": [
                                        {
                                            "key": "K3",
                                            "value": 0
                                        },
                                        {
                                            "key": "YQTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "YR",
                                            "value": 100
                                        },
                                        {
                                            "key": "PSF",
                                            "value": 0
                                        },
                                        {
                                            "key": "UDF",
                                            "value": 0
                                        },
                                        {
                                            "key": "INTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "TransactionFee",
                                            "value": 0
                                        },
                                        {
                                            "key": "OtherTaxes",
                                            "value": 2246
                                        }
                                    ],
                                    "YQTax": 0,
                                    "AdditionalTxnFeeOfrd": 0,
                                    "AdditionalTxnFeePub": 0,
                                    "PGCharge": 0,
                                    "OtherCharges": 0.00,
                                    "ChargeBU": [
                                        {
                                            "key": "TBOMARKUP",
                                            "value": 0
                                        },
                                        {
                                            "key": "GLOBALPROCUREMENTCHARGE",
                                            "value": 0.00
                                        },
                                        {
                                            "key": "CONVENIENCECHARGE",
                                            "value": 0
                                        },
                                        {
                                            "key": "OTHERCHARGE",
                                            "value": 0.00
                                        }
                                    ],
                                    "Discount": 0,
                                    "PublishedFare": 28546,
                                    "CommissionEarned": 193.36,
                                    "PLBEarned": 0,
                                    "IncentiveEarned": 0.00,
                                    "OfferedFare": 28352.64,
                                    "TdsOnCommission": 9.67,
                                    "TdsOnPLB": 0,
                                    "TdsOnIncentive": 0.00,
                                    "ServiceFee": 0,
                                    "TotalBaggageCharges": 0,
                                    "TotalMealCharges": 0,
                                    "TotalSeatCharges": 0,
                                    "TotalSpecialServiceCharges": 0
                                },
                                "FareBreakdown": [
                                    {
                                        "Currency": "INR",
                                        "PassengerType": 1,
                                        "PassengerCount": 2,
                                        "BaseFare": 26200,
                                        "Tax": 2346,
                                        "TaxBreakUp": [
                                            {
                                                "key": "YQTax",
                                                "value": 0
                                            },
                                            {
                                                "key": "YR",
                                                "value": 100
                                            },
                                            {
                                                "key": "OtherTaxes",
                                                "value": 2246
                                            }
                                        ],
                                        "YQTax": 0,
                                        "AdditionalTxnFeeOfrd": 0,
                                        "AdditionalTxnFeePub": 0,
                                        "PGCharge": 0,
                                        "SupplierReissueCharges": 0
                                    }
                                ],
                                "Segments": [
                                    [
                                        {
                                            "Baggage": "15 Kilograms",
                                            "CabinBaggage": "7 KG",
                                            "CabinClass": 2,
                                            "SupplierFareClass": null,
                                            "TripIndicator": 1,
                                            "SegmentIndicator": 1,
                                            "Airline": {
                                                "AirlineCode": "6E",
                                                "AirlineName": "Indigo",
                                                "FlightNumber": "2306",
                                                "FareClass": "VR",
                                                "OperatingCarrier": ""
                                            },
                                            "NoOfSeatAvailable": 3,
                                            "Origin": {
                                                "Airport": {
                                                    "AirportCode": "IXA",
                                                    "AirportName": "Singerbhil",
                                                    "Terminal": "",
                                                    "CityCode": "IXA",
                                                    "CityName": "Agartala",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "DepTime": "2024-07-01T15:40:00"
                                            },
                                            "Destination": {
                                                "Airport": {
                                                    "AirportCode": "DEL",
                                                    "AirportName": "Indira Gandhi Airport",
                                                    "Terminal": "2",
                                                    "CityCode": "DEL",
                                                    "CityName": "Delhi",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "ArrTime": "2024-07-01T18:20:00"
                                            },
                                            "Duration": 160,
                                            "GroundTime": 0,
                                            "Mile": 0,
                                            "StopOver": false,
                                            "FlightInfoIndex": "",
                                            "StopPoint": "",
                                            "StopPointArrivalTime": null,
                                            "StopPointDepartureTime": null,
                                            "Craft": "320",
                                            "Remark": null,
                                            "IsETicketEligible": true,
                                            "FlightStatus": "Confirmed",
                                            "Status": "",
                                            "FareClassification": {
                                                "Type": "Saver"
                                            }
                                        }
                                    ]
                                ],
                                "LastTicketDate": null,
                                "TicketAdvisory": null,
                                "FareRules": [
                                    {
                                        "Origin": "IXA",
                                        "Destination": "DEL",
                                        "Airline": "6E",
                                        "FareBasisCode": "V0IP",
                                        "FareRuleDetail": "",
                                        "FareRestriction": "",
                                        "FareFamilyCode": "",
                                        "FareRuleIndex": ""
                                    }
                                ],
                                "AirlineCode": "6E",
                                "MiniFareRules": [
                                    [
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "0",
                                            "To": "3",
                                            "Unit": "DAYS",
                                            "Details": "INR 2999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "4",
                                            "To": "",
                                            "Unit": "DAYS",
                                            "Details": "INR 2250"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "0",
                                            "To": "3",
                                            "Unit": "DAYS",
                                            "Details": "INR 3999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "4",
                                            "To": "",
                                            "Unit": "DAYS",
                                            "Details": "INR 2999"
                                        }
                                    ]
                                ],
                                "ValidatingAirline": "6E",
                                "FareClassification": {
                                    "Color": "lime",
                                    "Type": "Saver"
                                }
                            },
                            {
                                "FirstNameFormat": null,
                                "IsBookableIfSeatNotAvailable": false,
                                "IsHoldAllowedWithSSR": false,
                                "LastNameFormat": null,
                                "ResultIndex": "OB4",
                                "Source": 6,
                                "IsLCC": true,
                                "IsRefundable": true,
                                "IsPanRequiredAtBook": false,
                                "IsPanRequiredAtTicket": false,
                                "IsPassportRequiredAtBook": false,
                                "IsPassportRequiredAtTicket": false,
                                "GSTAllowed": true,
                                "IsCouponAppilcable": true,
                                "IsGSTMandatory": false,
                                "AirlineRemark": " This is a Flexi Fare. Includes free seat(as per restriction). Lower cancellation. Please refer fare rules.. . On all Indigo Code shared flight, Free Meal will be included ..WEB.",
                                "IsPassportFullDetailRequiredAtBook": false,
                                "ResultFareType": "RegularFare",
                                "Fare": {
                                    "Currency": "INR",
                                    "BaseFare": 27200,
                                    "Tax": 2346,
                                    "TaxBreakup": [
                                        {
                                            "key": "K3",
                                            "value": 0
                                        },
                                        {
                                            "key": "YQTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "YR",
                                            "value": 100
                                        },
                                        {
                                            "key": "PSF",
                                            "value": 0
                                        },
                                        {
                                            "key": "UDF",
                                            "value": 0
                                        },
                                        {
                                            "key": "INTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "TransactionFee",
                                            "value": 0
                                        },
                                        {
                                            "key": "OtherTaxes",
                                            "value": 2246
                                        }
                                    ],
                                    "YQTax": 0,
                                    "AdditionalTxnFeeOfrd": 0,
                                    "AdditionalTxnFeePub": 0,
                                    "PGCharge": 0,
                                    "OtherCharges": 0.00,
                                    "ChargeBU": [
                                        {
                                            "key": "TBOMARKUP",
                                            "value": 0
                                        },
                                        {
                                            "key": "GLOBALPROCUREMENTCHARGE",
                                            "value": 0.00
                                        },
                                        {
                                            "key": "CONVENIENCECHARGE",
                                            "value": 0
                                        },
                                        {
                                            "key": "OTHERCHARGE",
                                            "value": 0.00
                                        }
                                    ],
                                    "Discount": 0,
                                    "PublishedFare": 29546,
                                    "CommissionEarned": 200.74,
                                    "PLBEarned": 0,
                                    "IncentiveEarned": 0.00,
                                    "OfferedFare": 29345.26,
                                    "TdsOnCommission": 10.04,
                                    "TdsOnPLB": 0,
                                    "TdsOnIncentive": 0.00,
                                    "ServiceFee": 0,
                                    "TotalBaggageCharges": 0,
                                    "TotalMealCharges": 0,
                                    "TotalSeatCharges": 0,
                                    "TotalSpecialServiceCharges": 0
                                },
                                "FareBreakdown": [
                                    {
                                        "Currency": "INR",
                                        "PassengerType": 1,
                                        "PassengerCount": 2,
                                        "BaseFare": 27200,
                                        "Tax": 2346,
                                        "TaxBreakUp": [
                                            {
                                                "key": "YQTax",
                                                "value": 0
                                            },
                                            {
                                                "key": "YR",
                                                "value": 100
                                            },
                                            {
                                                "key": "OtherTaxes",
                                                "value": 2246
                                            }
                                        ],
                                        "YQTax": 0,
                                        "AdditionalTxnFeeOfrd": 0,
                                        "AdditionalTxnFeePub": 0,
                                        "PGCharge": 0,
                                        "SupplierReissueCharges": 0
                                    }
                                ],
                                "Segments": [
                                    [
                                        {
                                            "Baggage": "15 Kilograms",
                                            "CabinBaggage": "7 KG",
                                            "CabinClass": 2,
                                            "SupplierFareClass": null,
                                            "TripIndicator": 1,
                                            "SegmentIndicator": 1,
                                            "Airline": {
                                                "AirlineCode": "6E",
                                                "AirlineName": "Indigo",
                                                "FlightNumber": "2306",
                                                "FareClass": "FL",
                                                "OperatingCarrier": ""
                                            },
                                            "NoOfSeatAvailable": 3,
                                            "Origin": {
                                                "Airport": {
                                                    "AirportCode": "IXA",
                                                    "AirportName": "Singerbhil",
                                                    "Terminal": "",
                                                    "CityCode": "IXA",
                                                    "CityName": "Agartala",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "DepTime": "2024-07-01T15:40:00"
                                            },
                                            "Destination": {
                                                "Airport": {
                                                    "AirportCode": "DEL",
                                                    "AirportName": "Indira Gandhi Airport",
                                                    "Terminal": "2",
                                                    "CityCode": "DEL",
                                                    "CityName": "Delhi",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "ArrTime": "2024-07-01T18:20:00"
                                            },
                                            "Duration": 160,
                                            "GroundTime": 0,
                                            "Mile": 0,
                                            "StopOver": false,
                                            "FlightInfoIndex": "",
                                            "StopPoint": "",
                                            "StopPointArrivalTime": null,
                                            "StopPointDepartureTime": null,
                                            "Craft": "320",
                                            "Remark": null,
                                            "IsETicketEligible": true,
                                            "FlightStatus": "Confirmed",
                                            "Status": "",
                                            "FareClassification": {
                                                "Type": "Flexi"
                                            }
                                        }
                                    ]
                                ],
                                "LastTicketDate": null,
                                "TicketAdvisory": null,
                                "FareRules": [
                                    {
                                        "Origin": "IXA",
                                        "Destination": "DEL",
                                        "Airline": "6E",
                                        "FareBasisCode": "VUIP",
                                        "FareRuleDetail": "",
                                        "FareRestriction": "",
                                        "FareFamilyCode": "",
                                        "FareRuleIndex": ""
                                    }
                                ],
                                "AirlineCode": "6E",
                                "MiniFareRules": [
                                    [
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "0",
                                            "To": "3",
                                            "Unit": "DAYS",
                                            "Details": "INR 999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "4",
                                            "To": "",
                                            "Unit": "DAYS",
                                            "Details": "INR 299"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "0",
                                            "To": "3",
                                            "Unit": "DAYS",
                                            "Details": "INR 2999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "4",
                                            "To": "",
                                            "Unit": "DAYS",
                                            "Details": "INR 1999"
                                        }
                                    ]
                                ],
                                "ValidatingAirline": "6E",
                                "FareClassification": {
                                    "Color": "Violet",
                                    "Type": "Flexi"
                                }
                            },
                            {
                                "FirstNameFormat": null,
                                "IsBookableIfSeatNotAvailable": false,
                                "IsHoldAllowedWithSSR": false,
                                "LastNameFormat": null,
                                "ResultIndex": "OB5",
                                "Source": 39,
                                "IsLCC": true,
                                "IsRefundable": true,
                                "IsPanRequiredAtBook": false,
                                "IsPanRequiredAtTicket": false,
                                "IsPassportRequiredAtBook": false,
                                "IsPassportRequiredAtTicket": false,
                                "GSTAllowed": true,
                                "IsCouponAppilcable": true,
                                "IsGSTMandatory": false,
                                "AirlineRemark": " This is a Flexi Fare. Includes free seat(as per restriction). Lower cancellation. Please refer fare rules.. . On all Indigo Code shared flight, Free Meal will be included ..WEBB.",
                                "IsPassportFullDetailRequiredAtBook": false,
                                "ResultFareType": "RegularFare",
                                "Fare": {
                                    "Currency": "INR",
                                    "BaseFare": 27200,
                                    "Tax": 2346,
                                    "TaxBreakup": [
                                        {
                                            "key": "K3",
                                            "value": 0
                                        },
                                        {
                                            "key": "YQTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "YR",
                                            "value": 100
                                        },
                                        {
                                            "key": "PSF",
                                            "value": 0
                                        },
                                        {
                                            "key": "UDF",
                                            "value": 0
                                        },
                                        {
                                            "key": "INTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "TransactionFee",
                                            "value": 0
                                        },
                                        {
                                            "key": "OtherTaxes",
                                            "value": 2246
                                        }
                                    ],
                                    "YQTax": 0,
                                    "AdditionalTxnFeeOfrd": 0,
                                    "AdditionalTxnFeePub": 0,
                                    "PGCharge": 0,
                                    "OtherCharges": 0.00,
                                    "ChargeBU": [
                                        {
                                            "key": "TBOMARKUP",
                                            "value": 0
                                        },
                                        {
                                            "key": "GLOBALPROCUREMENTCHARGE",
                                            "value": 0.00
                                        },
                                        {
                                            "key": "CONVENIENCECHARGE",
                                            "value": 0
                                        },
                                        {
                                            "key": "OTHERCHARGE",
                                            "value": 0.00
                                        }
                                    ],
                                    "Discount": 0,
                                    "PublishedFare": 29546,
                                    "CommissionEarned": 200.74,
                                    "PLBEarned": 0,
                                    "IncentiveEarned": 0.00,
                                    "OfferedFare": 29345.26,
                                    "TdsOnCommission": 10.04,
                                    "TdsOnPLB": 0,
                                    "TdsOnIncentive": 0.00,
                                    "ServiceFee": 0,
                                    "TotalBaggageCharges": 0,
                                    "TotalMealCharges": 0,
                                    "TotalSeatCharges": 0,
                                    "TotalSpecialServiceCharges": 0
                                },
                                "FareBreakdown": [
                                    {
                                        "Currency": "INR",
                                        "PassengerType": 1,
                                        "PassengerCount": 2,
                                        "BaseFare": 27200,
                                        "Tax": 2346,
                                        "TaxBreakUp": [
                                            {
                                                "key": "YQTax",
                                                "value": 0
                                            },
                                            {
                                                "key": "YR",
                                                "value": 100
                                            },
                                            {
                                                "key": "OtherTaxes",
                                                "value": 2246
                                            }
                                        ],
                                        "YQTax": 0,
                                        "AdditionalTxnFeeOfrd": 0,
                                        "AdditionalTxnFeePub": 0,
                                        "PGCharge": 0,
                                        "SupplierReissueCharges": 0
                                    }
                                ],
                                "Segments": [
                                    [
                                        {
                                            "Baggage": "15 Kilograms",
                                            "CabinBaggage": "7 KG",
                                            "CabinClass": 2,
                                            "SupplierFareClass": null,
                                            "TripIndicator": 1,
                                            "SegmentIndicator": 1,
                                            "Airline": {
                                                "AirlineCode": "6E",
                                                "AirlineName": "Indigo",
                                                "FlightNumber": "2306",
                                                "FareClass": "FL",
                                                "OperatingCarrier": ""
                                            },
                                            "NoOfSeatAvailable": 3,
                                            "Origin": {
                                                "Airport": {
                                                    "AirportCode": "IXA",
                                                    "AirportName": "Singerbhil",
                                                    "Terminal": "",
                                                    "CityCode": "IXA",
                                                    "CityName": "Agartala",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "DepTime": "2024-07-01T15:40:00"
                                            },
                                            "Destination": {
                                                "Airport": {
                                                    "AirportCode": "DEL",
                                                    "AirportName": "Indira Gandhi Airport",
                                                    "Terminal": "2",
                                                    "CityCode": "DEL",
                                                    "CityName": "Delhi",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "ArrTime": "2024-07-01T18:20:00"
                                            },
                                            "Duration": 160,
                                            "GroundTime": 0,
                                            "Mile": 0,
                                            "StopOver": false,
                                            "FlightInfoIndex": "",
                                            "StopPoint": "",
                                            "StopPointArrivalTime": null,
                                            "StopPointDepartureTime": null,
                                            "Craft": "320",
                                            "Remark": null,
                                            "IsETicketEligible": true,
                                            "FlightStatus": "Confirmed",
                                            "Status": "",
                                            "FareClassification": {
                                                "Type": "Flexi"
                                            }
                                        }
                                    ]
                                ],
                                "LastTicketDate": null,
                                "TicketAdvisory": null,
                                "FareRules": [
                                    {
                                        "Origin": "IXA",
                                        "Destination": "DEL",
                                        "Airline": "6E",
                                        "FareBasisCode": "VUIP",
                                        "FareRuleDetail": "",
                                        "FareRestriction": "",
                                        "FareFamilyCode": "",
                                        "FareRuleIndex": ""
                                    }
                                ],
                                "AirlineCode": "6E",
                                "MiniFareRules": [
                                    [
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "0",
                                            "To": "3",
                                            "Unit": "DAYS",
                                            "Details": "INR 999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "4",
                                            "To": "",
                                            "Unit": "DAYS",
                                            "Details": "INR 299"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "0",
                                            "To": "3",
                                            "Unit": "DAYS",
                                            "Details": "INR 2999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "4",
                                            "To": "",
                                            "Unit": "DAYS",
                                            "Details": "INR 1999"
                                        }
                                    ]
                                ],
                                "ValidatingAirline": "6E",
                                "FareClassification": {
                                    "Color": "Violet",
                                    "Type": "Flexi"
                                }
                            },
                            {
                                "FirstNameFormat": null,
                                "IsBookableIfSeatNotAvailable": false,
                                "IsHoldAllowedWithSSR": false,
                                "LastNameFormat": null,
                                "ResultIndex": "OB6",
                                "Source": 85,
                                "IsLCC": true,
                                "IsRefundable": true,
                                "IsPanRequiredAtBook": false,
                                "IsPanRequiredAtTicket": false,
                                "IsPassportRequiredAtBook": false,
                                "IsPassportRequiredAtTicket": false,
                                "GSTAllowed": true,
                                "IsCouponAppilcable": true,
                                "IsGSTMandatory": false,
                                "AirlineRemark": " This is a Flexi Fare. Includes free seat(as per restriction). Lower cancellation. Please refer fare rules.. . IndigoAPI4.",
                                "IsPassportFullDetailRequiredAtBook": false,
                                "ResultFareType": "RegularFare",
                                "Fare": {
                                    "Currency": "INR",
                                    "BaseFare": 27200,
                                    "Tax": 2346,
                                    "TaxBreakup": [
                                        {
                                            "key": "K3",
                                            "value": 0
                                        },
                                        {
                                            "key": "YQTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "YR",
                                            "value": 100
                                        },
                                        {
                                            "key": "PSF",
                                            "value": 0
                                        },
                                        {
                                            "key": "UDF",
                                            "value": 0
                                        },
                                        {
                                            "key": "INTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "TransactionFee",
                                            "value": 0
                                        },
                                        {
                                            "key": "OtherTaxes",
                                            "value": 2246
                                        }
                                    ],
                                    "YQTax": 0,
                                    "AdditionalTxnFeeOfrd": 0,
                                    "AdditionalTxnFeePub": 0,
                                    "PGCharge": 0,
                                    "OtherCharges": 0.00,
                                    "ChargeBU": [
                                        {
                                            "key": "TBOMARKUP",
                                            "value": 0
                                        },
                                        {
                                            "key": "GLOBALPROCUREMENTCHARGE",
                                            "value": 0.00
                                        },
                                        {
                                            "key": "CONVENIENCECHARGE",
                                            "value": 0
                                        },
                                        {
                                            "key": "OTHERCHARGE",
                                            "value": 0.00
                                        }
                                    ],
                                    "Discount": 0,
                                    "PublishedFare": 29546,
                                    "CommissionEarned": 200.74,
                                    "PLBEarned": 0,
                                    "IncentiveEarned": 0.00,
                                    "OfferedFare": 29345.26,
                                    "TdsOnCommission": 10.04,
                                    "TdsOnPLB": 0,
                                    "TdsOnIncentive": 0.00,
                                    "ServiceFee": 0,
                                    "TotalBaggageCharges": 0,
                                    "TotalMealCharges": 0,
                                    "TotalSeatCharges": 0,
                                    "TotalSpecialServiceCharges": 0
                                },
                                "FareBreakdown": [
                                    {
                                        "Currency": "INR",
                                        "PassengerType": 1,
                                        "PassengerCount": 2,
                                        "BaseFare": 27200,
                                        "Tax": 2346,
                                        "TaxBreakUp": [
                                            {
                                                "key": "YQTax",
                                                "value": 0
                                            },
                                            {
                                                "key": "YR",
                                                "value": 100
                                            },
                                            {
                                                "key": "OtherTaxes",
                                                "value": 2246
                                            }
                                        ],
                                        "YQTax": 0,
                                        "AdditionalTxnFeeOfrd": 0,
                                        "AdditionalTxnFeePub": 0,
                                        "PGCharge": 0,
                                        "SupplierReissueCharges": 0
                                    }
                                ],
                                "Segments": [
                                    [
                                        {
                                            "Baggage": "15 Kilograms",
                                            "CabinBaggage": "7 KG",
                                            "CabinClass": 2,
                                            "SupplierFareClass": null,
                                            "TripIndicator": 1,
                                            "SegmentIndicator": 1,
                                            "Airline": {
                                                "AirlineCode": "6E",
                                                "AirlineName": "Indigo",
                                                "FlightNumber": "2306",
                                                "FareClass": "FL",
                                                "OperatingCarrier": ""
                                            },
                                            "NoOfSeatAvailable": 3,
                                            "Origin": {
                                                "Airport": {
                                                    "AirportCode": "IXA",
                                                    "AirportName": "Singerbhil",
                                                    "Terminal": "",
                                                    "CityCode": "IXA",
                                                    "CityName": "Agartala",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "DepTime": "2024-07-01T15:40:00"
                                            },
                                            "Destination": {
                                                "Airport": {
                                                    "AirportCode": "DEL",
                                                    "AirportName": "Indira Gandhi Airport",
                                                    "Terminal": "2",
                                                    "CityCode": "DEL",
                                                    "CityName": "Delhi",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "ArrTime": "2024-07-01T18:20:00"
                                            },
                                            "Duration": 160,
                                            "GroundTime": 0,
                                            "Mile": 0,
                                            "StopOver": false,
                                            "FlightInfoIndex": "",
                                            "StopPoint": "",
                                            "StopPointArrivalTime": null,
                                            "StopPointDepartureTime": null,
                                            "Craft": "320",
                                            "Remark": null,
                                            "IsETicketEligible": true,
                                            "FlightStatus": "Confirmed",
                                            "Status": "",
                                            "FareClassification": {
                                                "Type": "Flexi"
                                            }
                                        }
                                    ]
                                ],
                                "LastTicketDate": null,
                                "TicketAdvisory": null,
                                "FareRules": [
                                    {
                                        "Origin": "IXA",
                                        "Destination": "DEL",
                                        "Airline": "6E",
                                        "FareBasisCode": "VUIP",
                                        "FareRuleDetail": "",
                                        "FareRestriction": "",
                                        "FareFamilyCode": "",
                                        "FareRuleIndex": ""
                                    }
                                ],
                                "AirlineCode": "6E",
                                "MiniFareRules": [
                                    [
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "0",
                                            "To": "3",
                                            "Unit": "DAYS",
                                            "Details": "INR 999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "4",
                                            "To": "",
                                            "Unit": "DAYS",
                                            "Details": "INR 299"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "0",
                                            "To": "3",
                                            "Unit": "DAYS",
                                            "Details": "INR 2999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "4",
                                            "To": "",
                                            "Unit": "DAYS",
                                            "Details": "INR 1999"
                                        }
                                    ]
                                ],
                                "ValidatingAirline": "6E",
                                "FareClassification": {
                                    "Color": "Violet",
                                    "Type": "Flexi"
                                }
                            },
                            {
                                "FirstNameFormat": null,
                                "IsBookableIfSeatNotAvailable": false,
                                "IsHoldAllowedWithSSR": false,
                                "LastNameFormat": null,
                                "ResultIndex": "OB7",
                                "Source": 24,
                                "IsLCC": true,
                                "IsRefundable": true,
                                "IsPanRequiredAtBook": false,
                                "IsPanRequiredAtTicket": false,
                                "IsPassportRequiredAtBook": false,
                                "IsPassportRequiredAtTicket": false,
                                "GSTAllowed": true,
                                "IsCouponAppilcable": true,
                                "IsGSTMandatory": false,
                                "AirlineRemark": "Crp.con.",
                                "IsPassportFullDetailRequiredAtBook": false,
                                "ResultFareType": "RegularFare",
                                "Fare": {
                                    "Currency": "INR",
                                    "BaseFare": 28820,
                                    "Tax": 2346,
                                    "TaxBreakup": [
                                        {
                                            "key": "K3",
                                            "value": 0
                                        },
                                        {
                                            "key": "YQTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "YR",
                                            "value": 100
                                        },
                                        {
                                            "key": "PSF",
                                            "value": 0
                                        },
                                        {
                                            "key": "UDF",
                                            "value": 0
                                        },
                                        {
                                            "key": "INTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "TransactionFee",
                                            "value": 0
                                        },
                                        {
                                            "key": "OtherTaxes",
                                            "value": 2246
                                        }
                                    ],
                                    "YQTax": 0,
                                    "AdditionalTxnFeeOfrd": 0,
                                    "AdditionalTxnFeePub": 0,
                                    "PGCharge": 0,
                                    "OtherCharges": 0.00,
                                    "ChargeBU": [
                                        {
                                            "key": "TBOMARKUP",
                                            "value": 0
                                        },
                                        {
                                            "key": "GLOBALPROCUREMENTCHARGE",
                                            "value": 0.00
                                        },
                                        {
                                            "key": "CONVENIENCECHARGE",
                                            "value": 0
                                        },
                                        {
                                            "key": "OTHERCHARGE",
                                            "value": 0.00
                                        }
                                    ],
                                    "Discount": 0,
                                    "PublishedFare": 31166,
                                    "CommissionEarned": 153.61,
                                    "PLBEarned": 0,
                                    "IncentiveEarned": 0.00,
                                    "OfferedFare": 31012.39,
                                    "TdsOnCommission": 7.68,
                                    "TdsOnPLB": 0,
                                    "TdsOnIncentive": 0.00,
                                    "ServiceFee": 0,
                                    "TotalBaggageCharges": 0,
                                    "TotalMealCharges": 0,
                                    "TotalSeatCharges": 0,
                                    "TotalSpecialServiceCharges": 0
                                },
                                "FareBreakdown": [
                                    {
                                        "Currency": "INR",
                                        "PassengerType": 1,
                                        "PassengerCount": 2,
                                        "BaseFare": 28820,
                                        "Tax": 2346,
                                        "TaxBreakUp": [
                                            {
                                                "key": "YQTax",
                                                "value": 0
                                            },
                                            {
                                                "key": "YR",
                                                "value": 100
                                            },
                                            {
                                                "key": "OtherTaxes",
                                                "value": 2246
                                            }
                                        ],
                                        "YQTax": 0,
                                        "AdditionalTxnFeeOfrd": 0,
                                        "AdditionalTxnFeePub": 0,
                                        "PGCharge": 0,
                                        "SupplierReissueCharges": 0
                                    }
                                ],
                                "Segments": [
                                    [
                                        {
                                            "Baggage": "15 Kilograms",
                                            "CabinBaggage": "7 KG",
                                            "CabinClass": 2,
                                            "SupplierFareClass": null,
                                            "TripIndicator": 1,
                                            "SegmentIndicator": 1,
                                            "Airline": {
                                                "AirlineCode": "6E",
                                                "AirlineName": "Indigo",
                                                "FlightNumber": "2306",
                                                "FareClass": "SM",
                                                "OperatingCarrier": ""
                                            },
                                            "NoOfSeatAvailable": 3,
                                            "Origin": {
                                                "Airport": {
                                                    "AirportCode": "IXA",
                                                    "AirportName": "Singerbhil",
                                                    "Terminal": "",
                                                    "CityCode": "IXA",
                                                    "CityName": "Agartala",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "DepTime": "2024-07-01T15:40:00"
                                            },
                                            "Destination": {
                                                "Airport": {
                                                    "AirportCode": "DEL",
                                                    "AirportName": "Indira Gandhi Airport",
                                                    "Terminal": "2",
                                                    "CityCode": "DEL",
                                                    "CityName": "Delhi",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "ArrTime": "2024-07-01T18:20:00"
                                            },
                                            "Duration": 160,
                                            "GroundTime": 0,
                                            "Mile": 0,
                                            "StopOver": false,
                                            "FlightInfoIndex": "",
                                            "StopPoint": "",
                                            "StopPointArrivalTime": null,
                                            "StopPointDepartureTime": null,
                                            "Craft": "320",
                                            "Remark": null,
                                            "IsETicketEligible": true,
                                            "FlightStatus": "Confirmed",
                                            "Status": "",
                                            "FareClassification": {
                                                "Type": "SME.CrpCon"
                                            }
                                        }
                                    ]
                                ],
                                "LastTicketDate": null,
                                "TicketAdvisory": null,
                                "FareRules": [
                                    {
                                        "Origin": "IXA",
                                        "Destination": "DEL",
                                        "Airline": "6E",
                                        "FareBasisCode": "VMIP",
                                        "FareRuleDetail": "",
                                        "FareRestriction": "",
                                        "FareFamilyCode": "",
                                        "FareRuleIndex": ""
                                    }
                                ],
                                "AirlineCode": "6E",
                                "MiniFareRules": [
                                    [
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "3",
                                            "To": "24",
                                            "Unit": "Hours",
                                            "Details": "INR 1499"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Cancellation",
                                            "From": "24",
                                            "To": "",
                                            "Unit": "HOURS",
                                            "Details": "INR 999"
                                        },
                                        {
                                            "JourneyPoints": "IXA-DEL",
                                            "Type": "Reissue",
                                            "From": "3",
                                            "To": "",
                                            "Unit": "",
                                            "Details": "INR 499"
                                        }
                                    ]
                                ],
                                "ValidatingAirline": "6E",
                                "FareClassification": {
                                    "Color": "Orange",
                                    "Type": "SME.CrpCon"
                                }
                            },
                            {
                                "FirstNameFormat": null,
                                "IsBookableIfSeatNotAvailable": false,
                                "IsHoldAllowedWithSSR": false,
                                "LastNameFormat": null,
                                "ResultIndex": "OB8",
                                "Source": 6,
                                "IsLCC": true,
                                "IsRefundable": true,
                                "IsPanRequiredAtBook": false,
                                "IsPanRequiredAtTicket": false,
                                "IsPassportRequiredAtBook": false,
                                "IsPassportRequiredAtTicket": false,
                                "GSTAllowed": true,
                                "IsCouponAppilcable": true,
                                "IsGSTMandatory": false,
                                "AirlineRemark": "On all Indigo Code shared flight, Free Meal will be included ..WEB.",
                                "IsPassportFullDetailRequiredAtBook": false,
                                "ResultFareType": "RegularFare",
                                "Fare": {
                                    "Currency": "INR",
                                    "BaseFare": 29200,
                                    "Tax": 2346,
                                    "TaxBreakup": [
                                        {
                                            "key": "K3",
                                            "value": 0
                                        },
                                        {
                                            "key": "YQTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "YR",
                                            "value": 100
                                        },
                                        {
                                            "key": "PSF",
                                            "value": 0
                                        },
                                        {
                                            "key": "UDF",
                                            "value": 0
                                        },
                                        {
                                            "key": "INTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "TransactionFee",
                                            "value": 0
                                        },
                                        {
                                            "key": "OtherTaxes",
                                            "value": 2246
                                        }
                                    ],
                                    "YQTax": 0,
                                    "AdditionalTxnFeeOfrd": 0,
                                    "AdditionalTxnFeePub": 0,
                                    "PGCharge": 0,
                                    "OtherCharges": 0.00,
                                    "ChargeBU": [
                                        {
                                            "key": "TBOMARKUP",
                                            "value": 0
                                        },
                                        {
                                            "key": "GLOBALPROCUREMENTCHARGE",
                                            "value": 0.00
                                        },
                                        {
                                            "key": "CONVENIENCECHARGE",
                                            "value": 0
                                        },
                                        {
                                            "key": "OTHERCHARGE",
                                            "value": 0.00
                                        }
                                    ],
                                    "Discount": 0,
                                    "PublishedFare": 31546,
                                    "CommissionEarned": 215.50,
                                    "PLBEarned": 0,
                                    "IncentiveEarned": 0.00,
                                    "OfferedFare": 31330.50,
                                    "TdsOnCommission": 10.78,
                                    "TdsOnPLB": 0,
                                    "TdsOnIncentive": 0.00,
                                    "ServiceFee": 0,
                                    "TotalBaggageCharges": 0,
                                    "TotalMealCharges": 0,
                                    "TotalSeatCharges": 0,
                                    "TotalSpecialServiceCharges": 0
                                },
                                "FareBreakdown": [
                                    {
                                        "Currency": "INR",
                                        "PassengerType": 1,
                                        "PassengerCount": 2,
                                        "BaseFare": 29200,
                                        "Tax": 2346,
                                        "TaxBreakUp": [
                                            {
                                                "key": "YQTax",
                                                "value": 0
                                            },
                                            {
                                                "key": "YR",
                                                "value": 100
                                            },
                                            {
                                                "key": "OtherTaxes",
                                                "value": 2246
                                            }
                                        ],
                                        "YQTax": 0,
                                        "AdditionalTxnFeeOfrd": 0,
                                        "AdditionalTxnFeePub": 0,
                                        "PGCharge": 0,
                                        "SupplierReissueCharges": 0
                                    }
                                ],
                                "Segments": [
                                    [
                                        {
                                            "Baggage": "25 KG",
                                            "CabinBaggage": "7 KG",
                                            "CabinClass": 2,
                                            "SupplierFareClass": null,
                                            "TripIndicator": 1,
                                            "SegmentIndicator": 1,
                                            "Airline": {
                                                "AirlineCode": "6E",
                                                "AirlineName": "Indigo",
                                                "FlightNumber": "2306",
                                                "FareClass": "VO",
                                                "OperatingCarrier": ""
                                            },
                                            "NoOfSeatAvailable": 3,
                                            "Origin": {
                                                "Airport": {
                                                    "AirportCode": "IXA",
                                                    "AirportName": "Singerbhil",
                                                    "Terminal": "",
                                                    "CityCode": "IXA",
                                                    "CityName": "Agartala",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "DepTime": "2024-07-01T15:40:00"
                                            },
                                            "Destination": {
                                                "Airport": {
                                                    "AirportCode": "DEL",
                                                    "AirportName": "Indira Gandhi Airport",
                                                    "Terminal": "2",
                                                    "CityCode": "DEL",
                                                    "CityName": "Delhi",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "ArrTime": "2024-07-01T18:20:00"
                                            },
                                            "Duration": 160,
                                            "GroundTime": 0,
                                            "Mile": 0,
                                            "StopOver": false,
                                            "FlightInfoIndex": "",
                                            "StopPoint": "",
                                            "StopPointArrivalTime": null,
                                            "StopPointDepartureTime": null,
                                            "Craft": "320",
                                            "Remark": null,
                                            "IsETicketEligible": true,
                                            "FlightStatus": "Confirmed",
                                            "Status": "",
                                            "FareClassification": {
                                                "Type": "Super6E"
                                            }
                                        }
                                    ]
                                ],
                                "LastTicketDate": null,
                                "TicketAdvisory": null,
                                "FareRules": [
                                    {
                                        "Origin": "IXA",
                                        "Destination": "DEL",
                                        "Airline": "6E",
                                        "FareBasisCode": "VLIP",
                                        "FareRuleDetail": "",
                                        "FareRestriction": "",
                                        "FareFamilyCode": "",
                                        "FareRuleIndex": ""
                                    }
                                ],
                                "AirlineCode": "6E",
                                "ValidatingAirline": "6E",
                                "FareClassification": {
                                    "Color": "Aqua",
                                    "Type": "Super6E"
                                }
                            },
                            {
                                "FirstNameFormat": null,
                                "IsBookableIfSeatNotAvailable": false,
                                "IsHoldAllowedWithSSR": false,
                                "LastNameFormat": null,
                                "ResultIndex": "OB9",
                                "Source": 85,
                                "IsLCC": true,
                                "IsRefundable": true,
                                "IsPanRequiredAtBook": false,
                                "IsPanRequiredAtTicket": false,
                                "IsPassportRequiredAtBook": false,
                                "IsPassportRequiredAtTicket": false,
                                "GSTAllowed": true,
                                "IsCouponAppilcable": true,
                                "IsGSTMandatory": false,
                                "AirlineRemark": "IndigoAPI4.",
                                "IsPassportFullDetailRequiredAtBook": false,
                                "ResultFareType": "RegularFare",
                                "Fare": {
                                    "Currency": "INR",
                                    "BaseFare": 29200,
                                    "Tax": 2346,
                                    "TaxBreakup": [
                                        {
                                            "key": "K3",
                                            "value": 0
                                        },
                                        {
                                            "key": "YQTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "YR",
                                            "value": 100
                                        },
                                        {
                                            "key": "PSF",
                                            "value": 0
                                        },
                                        {
                                            "key": "UDF",
                                            "value": 0
                                        },
                                        {
                                            "key": "INTax",
                                            "value": 0
                                        },
                                        {
                                            "key": "TransactionFee",
                                            "value": 0
                                        },
                                        {
                                            "key": "OtherTaxes",
                                            "value": 2246
                                        }
                                    ],
                                    "YQTax": 0,
                                    "AdditionalTxnFeeOfrd": 0,
                                    "AdditionalTxnFeePub": 0,
                                    "PGCharge": 0,
                                    "OtherCharges": 0.00,
                                    "ChargeBU": [
                                        {
                                            "key": "TBOMARKUP",
                                            "value": 0
                                        },
                                        {
                                            "key": "GLOBALPROCUREMENTCHARGE",
                                            "value": 0.00
                                        },
                                        {
                                            "key": "CONVENIENCECHARGE",
                                            "value": 0
                                        },
                                        {
                                            "key": "OTHERCHARGE",
                                            "value": 0.00
                                        }
                                    ],
                                    "Discount": 0,
                                    "PublishedFare": 31546,
                                    "CommissionEarned": 215.50,
                                    "PLBEarned": 0,
                                    "IncentiveEarned": 0.00,
                                    "OfferedFare": 31330.50,
                                    "TdsOnCommission": 10.78,
                                    "TdsOnPLB": 0,
                                    "TdsOnIncentive": 0.00,
                                    "ServiceFee": 0,
                                    "TotalBaggageCharges": 0,
                                    "TotalMealCharges": 0,
                                    "TotalSeatCharges": 0,
                                    "TotalSpecialServiceCharges": 0
                                },
                                "FareBreakdown": [
                                    {
                                        "Currency": "INR",
                                        "PassengerType": 1,
                                        "PassengerCount": 2,
                                        "BaseFare": 29200,
                                        "Tax": 2346,
                                        "TaxBreakUp": [
                                            {
                                                "key": "YQTax",
                                                "value": 0
                                            },
                                            {
                                                "key": "YR",
                                                "value": 100
                                            },
                                            {
                                                "key": "OtherTaxes",
                                                "value": 2246
                                            }
                                        ],
                                        "YQTax": 0,
                                        "AdditionalTxnFeeOfrd": 0,
                                        "AdditionalTxnFeePub": 0,
                                        "PGCharge": 0,
                                        "SupplierReissueCharges": 0
                                    }
                                ],
                                "Segments": [
                                    [
                                        {
                                            "Baggage": "25 KG",
                                            "CabinBaggage": "7 KG",
                                            "CabinClass": 2,
                                            "SupplierFareClass": null,
                                            "TripIndicator": 1,
                                            "SegmentIndicator": 1,
                                            "Airline": {
                                                "AirlineCode": "6E",
                                                "AirlineName": "Indigo",
                                                "FlightNumber": "2306",
                                                "FareClass": "VO",
                                                "OperatingCarrier": ""
                                            },
                                            "NoOfSeatAvailable": 3,
                                            "Origin": {
                                                "Airport": {
                                                    "AirportCode": "IXA",
                                                    "AirportName": "Singerbhil",
                                                    "Terminal": "",
                                                    "CityCode": "IXA",
                                                    "CityName": "Agartala",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "DepTime": "2024-07-01T15:40:00"
                                            },
                                            "Destination": {
                                                "Airport": {
                                                    "AirportCode": "DEL",
                                                    "AirportName": "Indira Gandhi Airport",
                                                    "Terminal": "2",
                                                    "CityCode": "DEL",
                                                    "CityName": "Delhi",
                                                    "CountryCode": "IN",
                                                    "CountryName": "India"
                                                },
                                                "ArrTime": "2024-07-01T18:20:00"
                                            },
                                            "Duration": 160,
                                            "GroundTime": 0,
                                            "Mile": 0,
                                            "StopOver": false,
                                            "FlightInfoIndex": "",
                                            "StopPoint": "",
                                            "StopPointArrivalTime": null,
                                            "StopPointDepartureTime": null,
                                            "Craft": "320",
                                            "Remark": null,
                                            "IsETicketEligible": true,
                                            "FlightStatus": "Confirmed",
                                            "Status": "",
                                            "FareClassification": {
                                                "Type": ""
                                            }
                                        }
                                    ]
                                ],
                                "LastTicketDate": null,
                                "TicketAdvisory": null,
                                "FareRules": [
                                    {
                                        "Origin": "IXA",
                                        "Destination": "DEL",
                                        "Airline": "6E",
                                        "FareBasisCode": "VLIP",
                                        "FareRuleDetail": "",
                                        "FareRestriction": "",
                                        "FareFamilyCode": "",
                                        "FareRuleIndex": ""
                                    }
                                ],
                                "AirlineCode": "6E",
                                "ValidatingAirline": "6E",
                                "FareClassification": {
                                    "Color": "Yellow",
                                    "Type": "Coupon"
                                }
                            }
                        ]
                    ]
                }
            }
            // const response = await this.httpAPICall(base_url, payload)
          
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
}