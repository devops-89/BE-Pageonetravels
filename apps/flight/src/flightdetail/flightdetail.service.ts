import { Injectable } from '@nestjs/common';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { FlightDetailRequestDto } from '../../../../libs/dtos/flight/flight-detail.dto'

@Injectable()
export class FlightDetailService {
    constructor(private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly tboConfigService: TBO_CredentialsService,

    ) { }


    async FareRule(body: FlightDetailRequestDto) {
        try {

            const { ip_address, token, trace_id, result_index } = body;

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

            const { ip_address, token, trace_id, result_index } = body;

            const payload_request = {

                "EndUserIp": ip_address,
                "TokenId": token,
                "TraceId": trace_id,
                "ResultIndex": result_index

            }

            const tbo_credentials = await this.tboConfigService.getTBOCredentials();

            const base_url = tbo_credentials.FLIGHT_FAREQUOTE;

            const response = await this.httptboapiservice.fareRule(base_url, payload_request);

            return { message: "Fare Rules fetched successfully", data: response };

        } catch (error) {
            console.log("Error in the fare rule function", error);
            throw error;
        }
    }


}
