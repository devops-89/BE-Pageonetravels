import { Injectable } from "@nestjs/common";
import { BookingDto } from "../../../../libs/dtos/flight/booking-flight.dto";
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { GenerateTokenService } from "../search-flight/generateToken.service";
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
import { BookingValidator } from "./booking.utils";
import { RazorpayService } from "../../../../libs/paymentgateway/razorpay.service";
import { BookingRepositoryService, UserRepositoryService } from "../../../../libs/database/src";
import { USER_ACCOUNT_STATUS, USER_TYPE, USER_VERIFY_STATUS } from "../../../../libs/constants/autenticationConstants/userContants";

@Injectable()
export class FlightBookingService {
    constructor(
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly redisCacheService: RedisCacheService,
        private readonly razorpayservice: RazorpayService,
        private readonly bookingrepository: BookingRepositoryService,
        private readonly userrepositoryservice: UserRepositoryService
    ) {
    }

    async bookFlight(body: BookingDto) {
        try {

            const guest_token = "1ABCD";

            const { ip_address, passenger_details, contact_no, email, city, country_code, country,
                nationality, house_number, postal_code, state, street, gst_company_address, gst_company_contact_number,
                gst_company_email, gst_company_name, gst_number, base_fare, tax, receipt, userId
            } = body;


            const address_line1 = ` ${house_number} ${street}`;
            const address_line2 = `${state} ${postal_code}`;


            await this.redisCacheService.getCache(`FlightDetail${guest_token}`);

            const Passengers = [];

            const flight_detailsData_cache = await this.redisCacheService.getCache(`FlightDetail${guest_token}`) as string
            console.log(flight_detailsData_cache);
            const parse_flight_details = JSON.parse(flight_detailsData_cache);


            const flight_details = parse_flight_details?.Response?.Results;



            const BaseFare = flight_details?.Fare?.BaseFare;
            const Tax = flight_details?.Fare?.Tax;
            const AdditionalTxnFeePub = flight_details?.Fare?.AdditionalTxnFeePub;
            const YQTax = flight_details?.Fare?.YQTax;
            const AdditionalTxnFeeOfrd = flight_details?.Fare?.AdditionalTxnFeeOfrd;
            const Discount = flight_details?.Fare?.AdditionalTxnFeeOfrd;
            const PublishedFare = flight_details?.Fare?.PublishedFare;
            const OfferedFare = flight_details?.OfferedFare;
            const TdsOnCommission = flight_details?.Fare?.TdsOnCommission;
            const TdsOnPLB = flight_details?.Fare?.TdsOnPLB;
            const TdsOnIncentive = flight_details?.Fare?.TdsOnIncentive;
            const ServiceFee = flight_details?.Fare?.ServiceFee;
            const OtherCharges = flight_details?.Fare?.OtherCharges;
            const Currency = flight_details?.Fare.Currency;
            const GSTAllowed = flight_details.GSTAllowed;
            const IsGSTMandatory = flight_details.IsGSTMandatory;
            const IsLCC = flight_details.IsLCC;


            const payload = {
                bookingpayment_amount: PublishedFare,
                bookingpaymcentcurrency: Currency,
                bookingpayment_date: new Date(),
                flight_details: "",
                passenger_details: "",
                userId: "userId"
            }


            

            if (passenger_details && Array.isArray(passenger_details) && passenger_details.length > 0) {

                for (const passenger of passenger_details) {

                    const Gender = passenger && passenger.gender === 'Female' ? '2' : '1';


                    const passengerTypeMap = {
                        1: BookingValidator.adultAgeValidation,
                        2: BookingValidator.childAgeValidation,
                        3: BookingValidator.infantAgeValidation
                    } 
                    const validationFucntion = passengerTypeMap[passenger.pax_type];

                    if (validationFucntion) {
                        try {
                            validationFucntion(passenger.date_of_birth);

                        } catch (error) {
                            console.error(`Validation failed: ${error}`);
                        }
                    } else {
                        throw ("Invalid passenger type.");
                    }

                    const passenger_count = passenger_details.length;

                    const perperson_base_fare = BaseFare ? BaseFare / passenger_count : base_fare / passenger_count;

                    const per_person_tax = Tax ? Tax / passenger_count : tax / passenger_count;


                    Passengers.push({
                        "Title": passenger.title,
                        "FirstName": passenger.first_name,
                        "LastName": passenger.last_name,
                        "PaxType": `${passenger.pax_type}`,
                        "DateOfBirth": passenger.date_of_birth,
                        "Gender": Gender,

                        "PassportNo": passenger.passport_no,
                        "PassportExpiry": passenger.passport_expiry,
                        "AddressLine1": address_line1,
                        "AddressLine2": address_line2,

                        "Fare": {
                            "BaseFare": perperson_base_fare,
                            "Tax": per_person_tax,
                            "YQTax": YQTax,
                            "AdditionalTxnFeePub": AdditionalTxnFeePub,
                            "AdditionalTxnFeeOfrd": AdditionalTxnFeeOfrd,
                            "OtherCharges": OtherCharges
                        },

                        "City": city,
                        "CountryCode": country_code,
                        "CountryName": country,
                        "ContactNo": contact_no,
                        "Nationality": nationality,
                        "Email": email,
                        "IsLeadPax": passenger.is_lead_pax,
                        "FFAirlineCode": "",
                        "FFNumber": "",
                        "Baggage": null,
                        "MealDynamic": null,
                        "SeatDynamic": null,
                        "SpecialServices": null,
                        "GSTCompanyAddress": "",
                        "GSTCompanyContactNumber": "",
                        "GSTCompanyName": "",
                        "GSTNumber": "",
                        "GSTCompanyEmail": ""
                    })

                    if (GSTAllowed && IsGSTMandatory) {
                        Passengers.push({
                            "GSTCompanyAddress": gst_company_address,
                            "GSTCompanyContactNumber": gst_company_contact_number,
                            "GSTCompanyName": gst_company_name,
                            "GSTNumber": gst_number,
                            "GSTCompanyEmail": gst_company_email
                        })
                    }

                    if (!IsLCC) {
                        Passengers['Fare'].push({
                            "Currency": Currency,
                            "Discount": Discount,
                            "PublishedFare": PublishedFare,
                            "OfferedFare": OfferedFare,
                            "TdsOnCommission": TdsOnCommission,
                            "TdsOnPLB": TdsOnPLB,
                            "TdsOnIncentive": TdsOnIncentive,
                            "ServiceFee": ServiceFee
                        })
                    }

                }
            }

            const Passengerss = [];

            Passengers.forEach(async (passenger) => {
                if (passenger.IsLeadPax === true) {

                    const full_name = passenger.first_name + ' ' + passenger.last_name;

                    if (!userId) {
                        await this.userrepositoryservice.addOrUpdateUser({
                            full_name,
                            email, is_email_verified: true,
                            user_type: USER_TYPE.USER,
                            phone_number: passenger.contact_no,
                            country_code: passenger.country_code,
                            status: USER_ACCOUNT_STATUS.ACTIVE,
                            verify_status: USER_VERIFY_STATUS.VERIFIED,
                        })
                    }
                    Passengerss.unshift(passenger);
                } else {
                    Passengerss.push(passenger);
                }
            });


            await this.bookingrepository.createBookingService(payload);


            await this.razorpayservice.createPayment({ amount: PublishedFare, currency: Currency, receipt: receipt });


            const { token, TBO_data } = await this.generateTokenService.getToken(ip_address);

            const LCC_base_url = TBO_data.FLIGHT_TICKET_FORLCC;
            const Non_LCC_base_url = TBO_data.FLIGHT_BOOKING_API_FORNONLCC;

            const agent_number = "PageOneTravels98";
            let bookedFliught;
            if (!IsLCC) {
                bookedFliught = await this.httptboapiservice.BookingFlightForNonLCC(Non_LCC_base_url, {
                    ...body,
                    agent_number,
                    Passengerss
                });
            } else {

                bookedFliught = await this.httptboapiservice.BookingFlightForLCC(LCC_base_url, {
                    ...body,
                    agent_number,
                    Passengerss,
                    token
                });
            }


            return { message: 'Flight booked successfully', data: bookedFliught };

        } catch (err) {

            console.log("Error in the FLight Booking Service For NON LCC", err);
            throw err;

        }
    }

}
