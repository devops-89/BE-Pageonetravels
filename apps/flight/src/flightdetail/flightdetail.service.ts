import { Injectable } from '@nestjs/common';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { FlightDetailRequestDto } from '../../../../libs/dtos/flight/flight-detail.dto'
import { GenerateTokenService } from '../search-flight/generateToken.service';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
import { JOURNEYTYPE,JOURNEY} from '../../../../libs/constants/flightConstant'


@Injectable()
export class FlightDetailService {
    constructor(
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly redisCacheService: RedisCacheService

    ) { }

    //ifGSTmandatory then we have to fill the information
    async FareRule(body: FlightDetailRequestDto) {
        try {

            const { ip_address, trace_id, result_index } = body;

            const { token } = await this.generateTokenService.getToken(ip_address);
            
            const payload_request = {
                "EndUserIp": ip_address,
                "TokenId": token,
                "TraceId": trace_id,
                "ResultIndex": result_index
            }

            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            
            const base_url = tbo_credentials.FLIGHT_FARERULE;
            
            const response = await this.httptboapiservice.fareRule(base_url, payload_request);

            return { message: "Fare Rules fetched successfully", data: response };

        } catch (error) {
            console.log("Error in the fare rule function", error);
            throw error;
        }
    }

    // async FlightDetail(body: FlightDetailRequestDto) {
    //     try {
    //         const guest_token = "1ABCD"  //fronted will give us 
    //         const { ip_address, trace_id, result_index,journey_type,journey,result_index_ib } = body;

    //         if (!Object.values(JOURNEYTYPE).includes(journey_type)) {
    //             throw new Error("Invalid journey type provided. Accepted values are: ONEWAY, ROUNDTRIP, MULTICITY.");
    //         }

    //         if (!Object.values(JOURNEY).includes(journey)) {
    //             throw new Error("Invalid journey category provided. Accepted values are: DOMESTIC, INTERNATIONAL.");
    //         }

    //         const { token } = await this.generateTokenService.getToken(ip_address);
    //         const tbo_credentials = await this.tboConfigService.getTBOCredentials();

    //         const base_url = tbo_credentials.FLIGHT_FAREQUOTE;


    //         if (journey_type === JOURNEYTYPE.ROUNDTRIP && journey === JOURNEY.DOMESTIC) {

    //             if (!result_index_ib || result_index_ib === null) {
    //                 throw new Error("Missing required parameter: Result Index for Inbound journey.");
    //             }

    //             const payload_request_OB = {
    //                             "EndUserIp": ip_address,
    //                             "TokenId": token,
    //                             "TraceId": trace_id,
    //                             "ResultIndex": result_index
    //                         }

    //             const payload_request_IB = {
    //                             "EndUserIp": ip_address,
    //                             "TokenId": token,
    //                             "TraceId": trace_id,
    //                             "ResultIndex": result_index_ib
    //                         }

    //             const response_ob = await this.httptboapiservice.fareRule(base_url, payload_request_OB) ;
    //             const response_ib = await this.httptboapiservice.fareRule(base_url, payload_request_IB) ;
    //             const response = [response_ob,response_ib];
    //             return { message: "Fare Details fetched successfully", data: response };
                
    //         }

    //         const payload_request = {
    //             "EndUserIp": ip_address,
    //             "TokenId": token,
    //             "TraceId": trace_id,
    //             "ResultIndex": result_index
    //         }
            
    //         const response = await this.httptboapiservice.fareRule(base_url, payload_request) ;

    //         await this.redisCacheService.setCache(`FlightDetail${guest_token}`, JSON.stringify(response), 3600);
            
    //         return { message: "Fare Details fetched successfully", data: response };

    //     } catch (error) {
    //         console.log("Error in the fare Details function", error);
    //         throw error;
    //     }
    // }

    
        async FlightDetail(body: FlightDetailRequestDto) {
        try {
            const guest_token = "1ABCD"; // Frontend will provide this
            const { ip_address, trace_id, result_index, journey_type, journey, result_index_ib } = body;

            // Validate journey type
            if (!Object.values(JOURNEYTYPE).includes(journey_type)) {
                throw new Error("Invalid journey type provided. Accepted values are: ONEWAY, ROUNDTRIP, MULTICITY.");
            }

            // Validate journey category
            if (!Object.values(JOURNEY).includes(journey)) {
                throw new Error("Invalid journey category provided. Accepted values are: DOMESTIC, INTERNATIONAL.");
            }

            // Generate token and get TBO credentials
            const { token } = await this.generateTokenService.getToken(ip_address);
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const base_url = tbo_credentials.FLIGHT_FAREQUOTE;

            let response;

            if (journey_type === JOURNEYTYPE.ROUNDTRIP && journey === JOURNEY.DOMESTIC) {
                // Validate result_index_ib for round trip domestic journey
                if (!result_index_ib) {
                    throw new Error("Missing required parameter: Result Index for Inbound journey.");
                }

                const payload_request_OB = {
                    "EndUserIp": ip_address,
                    "TokenId": token,
                    "TraceId": trace_id,
                    "ResultIndex": result_index
                };

                const payload_request_IB = {
                    "EndUserIp": ip_address,
                    "TokenId": token,
                    "TraceId": trace_id,
                    "ResultIndex": result_index_ib
                };

                const [response_ob, response_ib] = await Promise.all([
                    this.httptboapiservice.fareRule(base_url, payload_request_OB),
                    this.httptboapiservice.fareRule(base_url, payload_request_IB)
                ]);

                response = [response_ob, response_ib];
            } else {
                const payload_request = {
                    "EndUserIp": ip_address,
                    "TokenId": token,
                    "TraceId": trace_id,
                    "ResultIndex": result_index
                };

                response = await this.httptboapiservice.fareRule(base_url, payload_request);
            }

            // Cache the response
            await this.redisCacheService.setCache(`FlightDetail${guest_token}`, JSON.stringify(response), 3600);

            return { message: "Fare Details fetched successfully", data: response };

        } catch (error) {
            console.error("Error in the fare Details function", error);
            throw error;
        }
    }

    async FetchSeatMealBaggaeDetails(body: FlightDetailRequestDto) {
        try {
            const guest_token = "1ABCD"
            const { ip_address, trace_id, result_index } = body;
            const { token } = await this.generateTokenService.getToken(ip_address);
            console.log("Token", token);
            const payload_request = {

                "EndUserIp": ip_address,
                "TokenId": token,
                "TraceId": trace_id,
                "ResultIndex": result_index

            }

            const base_url = 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SSR'

            const response :[]= await this.httptboapiservice.FlightSeatDetails(base_url, payload_request);

            await this.redisCacheService.setCache(`FlightDetail${guest_token}`, JSON.stringify(response), 3600);
            
            return { message: "Seat Details fetched successfully", data: response };

        } catch (error) {
            console.log("Error in the fare rule function", error);
            throw error;
        }
    }


}
