import { Injectable } from '@nestjs/common';
import { HotelTBOAPIService } from '../../../../../libs/http-api-service/hoteltbo-api-service';
import { TBO_CredentialsService } from '../../../../../libs/loadtbo-db-config/tbo-config.service';
import { HotelDetailRequestDto } from '../../../../../libs/dtos/hotel/hotel-detail.dto'

@Injectable()
export class HotelDetailService {
    constructor(private readonly hoteltboapiservice: HotelTBOAPIService,
        private readonly hoteltboConfigService: TBO_CredentialsService,

    ) { }
    async FareRule(body: HotelDetailRequestDto) {
        try {

            const { ip_address, token, trace_id, result_index } = body;

            const payload_request = {

                "EndUserIp": ip_address,
                "TokenId": token,
                "TraceId": trace_id,
                "ResultIndex": result_index

            }

            const tbo_credentials = await this.hoteltboConfigService.getTBOCredentials();

            const base_url = tbo_credentials.FLIGHT_AUTHENTICATION;

            const response = await this.hoteltboapiservice.fareRule(base_url, payload_request);

            return { message: "Fare Rules fetched successfully", data: response };

        } catch (error) {
            console.log("Error in the fare rule function", error);
            throw error;
        }
    }

    async hotelDetail(body: HotelDetailRequestDto) {
        try {

            const { ip_address, token, trace_id, result_index } = body;

            const payload_request = {

                "EndUserIp": ip_address,
                "TokenId": token,
                "TraceId": trace_id,
                "ResultIndex": result_index

            }

            const tbo_credentials = await this.hoteltboConfigService.getTBOCredentials();

            const base_url = tbo_credentials.HOTEL_SEARCH;

            const response = await this.hoteltboapiservice.fareRule(base_url, payload_request);

            return { message: "Fare Rules fetched successfully", data: response };

        } catch (error) {
            console.log("Error in the fare rule function", error);
            throw error;
        }
    }
}