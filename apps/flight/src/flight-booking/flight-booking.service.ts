import { Injectable } from "@nestjs/common";
import { BookingDto } from "../../../../libs/dtos/flight/booking-flight.dto";
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { GenerateTokenService } from "../search-flight/generateToken.service";
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
import { BookingValidator } from "./booking.utils";

@Injectable()
export class FlightBookingService {
    constructor(
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly redisCacheService: RedisCacheService
    ) {
    }

    async bookFlight(body: BookingDto) {
        try {
            //PassengerType = 1 means Adudt
            //PassengerType = 2 child
            //PassegngerType = 3 infant inside FareBreakdiown
            //BaseFare devide by passengercount and tax is also devided by passenger count
            const guest_token = "1ABCD";
           
            const { ip_address, passenger_details,contact_no, is_LCC, email, city, country_code , country,
                nationality, house_number, postal_code,state,street, gst_company_address, gst_company_contact_number,
                gst_company_email, gst_company_name, gst_number, cell_country_code, base_fare, tax
            } = body;


            const address_line1= ` ${house_number} ${street}`;
            const address_line2 = `${state} ${postal_code}`;
            // if(is_gst_mandatory== true){
                //gst_mandatory = 
            // }
            await this.redisCacheService.getCache(`FlightDetail${guest_token}`);
            const Passengers = [];


            
               
          
            if(passenger_details && Array.isArray(passenger_details) && passenger_details.length > 0){
                for(const passenger of passenger_details){
                
                    if (passenger && passenger.gender === 'Female') 
                        passenger.gender ? 2 : 1;     
                    
                    const passengerTypeMap ={
                        1 :BookingValidator.adultAgeValidation,
                        2 :BookingValidator.childAgeValidation,
                        3 :BookingValidator.infantAgeValidation
                    }
                    const  validationFucntion = passengerTypeMap[passenger.pax_type];

                    console.log(validationFucntion);

                    const passenger_count = passenger_details.length;

                    const perperson_base_fare = base_fare/passenger_count;
    
                    const per_person_tax = tax/passenger_count;

                    Passengers.push({
                        "Title": passenger.title,
                        "FirstName": passenger.first_name,
                        "LastName": passenger.last_name,
                        "PaxType": passenger.pax_type,
                        "Gender": passenger.gender,

                        "PassportNo": passenger.passport_no,
                        "PassportExpiry": passenger.passport_expiry,
                        "AddressLine1": address_line1,
                        "AddressLine2": address_line2,

                        "Fare": {
                            // "Currency": "INR",
                            "BaseFare": perperson_base_fare,
                            "Tax":per_person_tax,
                            "YQTax": 0.0,
                            "AdditionalTxnFeePub": 0.0,
                            "AdditionalTxnFeeOfrd": 0.0,
                            "OtherCharges": 116.96,
                            // "Discount": 0.0,
                            // "PublishedFare": 4581.96,
                            // "OfferedFare": 4355.03,
                            // "TdsOnCommission": 6.34,
                            // "TdsOnPLB": 9.14,
                            // "TdsOnIncentive": 6.22,
                            // "ServiceFee": 10.0
                        },

                        "City": city,
                        "CountryCode": country_code,
                        "CountryName": country,
                        "CellCountryCode" : cell_country_code,  // Phone number country code
                        "ContactNo": contact_no,
                        "Nationality": nationality,
                        "Email": email,
                        "IsLeadPax": passenger.is_lead_pax,
                        "FFAirlineCode": null,
                        "FFNumber": "",
                        "GSTCompanyAddress": gst_company_address,
                        "GSTCompanyContactNumber": gst_company_contact_number,
                        "GSTCompanyName": gst_company_name,
                        "GSTNumber": gst_number,
                        "GSTCompanyEmail": gst_company_email
                    })
                }
            }

            const Passengerss = [];

            Passengerss.forEach((elm) => {
                if (elm.IsLeadPax === true) {
                    Passengerss.unshift(elm);
                } else {
                    Passengerss.push(elm);
                }
            });

            console.log(Passengerss);

            const { TBO_data } = await this.generateTokenService.getToken(ip_address);

            const LCC_base_url = TBO_data.FLIGHT_TICKET_FORLCC; //Non LCC only
            const Non_LCC_base_url = TBO_data.FLIGHT_BOOKING_API_FORNONLCC; //Non LCC only

            const agent_number = "PageOneTravels98";
            if (!is_LCC) {
                await this.httptboapiservice.BookingFlightForNonLCC(Non_LCC_base_url, {...body,
                    agent_number,
                    Passengerss
                });
            } else {
                await this.httptboapiservice.BookingFlightForLCC(LCC_base_url, {...body,
                        agent_number,
                        Passengerss
                });
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