import { Injectable } from '@nestjs/common';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { FlightDetailRequestDto } from '../../../../libs/dtos/flight/flight-detail.dto'
import { GenerateTokenService } from '../search-flight/generateToken.service';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';

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

    async FlightDetail(body: FlightDetailRequestDto) {
        try {
            const guest_token = "1ABCD"  //fronted will give us 
            const { ip_address, trace_id, result_index } = body;
            const { token } = await this.generateTokenService.getToken(ip_address);
            console.log("Token", token);
            const payload_request = {

                "EndUserIp": ip_address,
                "TokenId": token,
                "TraceId": trace_id,
                "ResultIndex": result_index

            }

            const tbo_credentials = await this.tboConfigService.getTBOCredentials();

            const base_url = tbo_credentials.FLIGHT_FAREQUOTE;

            const response = await this.httptboapiservice.fareRule(base_url, payload_request) ;

            await this.redisCacheService.setCache(`FlightDetail${guest_token}`, JSON.stringify(response), 3600);
            
            return { message: "Fare Rules fetched successfully", data: response };

        } catch (error) {
            console.log("Error in the fare rule function", error);
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
