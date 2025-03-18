import { Injectable } from '@nestjs/common';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { FlightDetailRequestDto, FlightRuleDto } from '../../../../libs/dtos/flight/flight-detail.dto'
import { GenerateTokenService } from '../search-flight/generateToken.service';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
import { JOURNEYTYPE,JOURNEY} from '../../../../libs/constants/flightConstant'
import { CommissionRepositoryService } from '../../../../libs/database/src';
import { COMMISSION_TYPE } from '../../../../libs/constants/autenticationConstants/userContants';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
// import { ERROR_CODES } from '../../../../libs/constants/commonConstants';


@Injectable()
export class FlightDetailService {
    constructor(
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly redisCacheService: RedisCacheService,
        private readonly commissionRepositoryService:CommissionRepositoryService

    ) { }

    //ifGSTmandatory then we have to fill the information
    async FareRule(body: FlightRuleDto) {
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
            const guest_token = "1ABCD"; // Frontend will provide this
            const { ip_address, trace_id, result_index, journey_type, journey, result_index_ib } = body;
            

            // Validate journey type
            if (!Object.values(JOURNEYTYPE).includes(journey_type)) {
                throw { message: "Invalid journey type provided. Accepted values are: ONEWAY, ROUNDTRIP, MULTICITY.", statusCode: ERROR_CODES.BAD_REQUEST };
            }

            // Validate journey category
            if (!Object.values(JOURNEY).includes(journey)) {
                throw { message: "Invalid journey category provided. Accepted values are: DOMESTIC, INTERNATIONAL.", statusCode: ERROR_CODES.BAD_REQUEST };
            }

            // Generate token and get TBO credentials
            const { token } = await this.generateTokenService.getToken(ip_address);
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const base_url_ssr = tbo_credentials.FLIGHT_SSR;
            const base_url = tbo_credentials.FLIGHT_FAREQUOTE;

            const flightType = `FLIGHT_${journey_type}_${journey}` as COMMISSION_TYPE;

            if (Object.values(COMMISSION_TYPE).includes(flightType)) {
                const commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType);
                console.log(commissionType);
            } else {
                throw { message: "Invalid commission type", statusCode: ERROR_CODES.BAD_REQUEST };
            }
 
            const commissiontype =  await this.commissionRepositoryService.getCommissionbytype(flightType);
            let response;
            let ssrResponse;

            if (journey_type === JOURNEYTYPE.ROUNDTRIP && journey === JOURNEY.DOMESTIC) {
                // Validate result_index_ib for round trip domestic journey
                if (!result_index_ib) {
                    throw { message: "Missing required parameter: Result Index for Inbound journey.", statusCode: ERROR_CODES.BAD_REQUEST };
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

                let [respons_ob, respons_ib] = await Promise.all([
                    this.httptboapiservice.fareRule(base_url, payload_request_OB),
                    this.httptboapiservice.fareRule(base_url, payload_request_IB)
                ]);

                respons_ob = await this.httptboapiservice.flightFormat(respons_ob);
                await this.addImage(respons_ob);
                respons_ib = await this.httptboapiservice.flightFormat(respons_ib);
                await this.addImage(respons_ib);


                let [ssr_ob, ssr_ib] = await Promise.all([
                    this.httptboapiservice.ssr(base_url_ssr, payload_request_OB),
                    this.httptboapiservice.ssr(base_url_ssr, payload_request_IB)
                ]);

                ssr_ob = await this.httptboapiservice.flightFormat(ssr_ob);
                ssr_ib = await this.httptboapiservice.flightFormat(ssr_ib);
                
                
                let response_ob = [respons_ob, ssr_ob];
                let  response_ib = [respons_ib, ssr_ib];

                response = [response_ob, response_ib, commissiontype, { journey_type: journey_type, journey: journey }];
            } else {
                const payload_request = {
                    "EndUserIp": ip_address,
                    "TokenId": token,
                    "TraceId": trace_id,
                    "ResultIndex": result_index
                };
                
                response = await this.httptboapiservice.fareRule(base_url, payload_request);
                // console.log(">>>>>>",response);
                response = await this.httptboapiservice.flightFormat(response);
                await this.addImage(response);
                
                ssrResponse = await this.httptboapiservice.ssr(base_url_ssr, payload_request);                 
                if(journey_type === "ONEWAY"){
                  ssrResponse = await this.httptboapiservice.flightFormat(ssrResponse); 
                } 
                response = [response, ssrResponse,commissiontype, { journey_type: journey_type, journey: journey }];   
            }

            // Cache the response
            await this.redisCacheService.setCache(`FlightDetail${guest_token}`, JSON.stringify(response), 3600);
            
            return { message: "Fare Details fetched successfully", data: response };
        } catch (error) {
            console.error("Error in the fare Details function", error);
            throw error;
        }
    }

    // async FlightDetail(body: FlightDetailRequestDto) {
    //     try {
    //         const guest_token = "1ABCD"; // Frontend will provide this
    //         const { ip_address, trace_id, result_index, journey_type, journey, result_index_ib } = body;
    
    //         // Validate journey type and category
    //         if (!Object.values(JOURNEYTYPE).includes(journey_type)) {
    //             throw { message: "Invalid journey type provided. Accepted values are: ONEWAY, ROUNDTRIP, MULTICITY.", statusCode: ERROR_CODES.BAD_REQUEST };
    //         }
    
    //         if (!Object.values(JOURNEY).includes(journey)) {
    //             throw { message: "Invalid journey category provided. Accepted values are: DOMESTIC, INTERNATIONAL.", statusCode: ERROR_CODES.BAD_REQUEST };
    //         }
    
    //         // Token and credentials
    //         const { token } = await this.generateTokenService.getToken(ip_address);
    //         const tbo_credentials = await this.tboConfigService.getTBOCredentials();
    //         const { FLIGHT_SSR: base_url_ssr, FLIGHT_FAREQUOTE: base_url } = tbo_credentials;
    
    //         const flightType = `FLIGHT_${journey_type}_${journey}` as COMMISSION_TYPE;
    
    //         if (!Object.values(COMMISSION_TYPE).includes(flightType)) {
    //             throw { message: "Invalid commission type", statusCode: ERROR_CODES.BAD_REQUEST };
    //         }
    
    //         const commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType);
    
    //         const payload_request_OB = {
    //             EndUserIp: ip_address,
    //             TokenId: token,
    //             TraceId: trace_id,
    //             ResultIndex: result_index
    //         };
    
    //         const payload_request_IB = {
    //             EndUserIp: ip_address,
    //             TokenId: token,
    //             TraceId: trace_id,
    //             ResultIndex: result_index_ib
    //         };
    
    //         let response;
    //         let ssrResponse;
    
    //         if (journey_type === JOURNEYTYPE.ROUNDTRIP && journey === JOURNEY.DOMESTIC) {
    //             if (!result_index_ib) {
    //                 throw { message: "Missing required parameter: Result Index for Inbound journey.", statusCode: ERROR_CODES.BAD_REQUEST };
    //             }
    
    //             const [respons_ob, respons_ib] = await Promise.all([
    //                 this.httptboapiservice.fareRule(base_url, payload_request_OB).then(this.httptboapiservice.flightFormat).then(this.addImage),
    //                 this.httptboapiservice.fareRule(base_url, payload_request_IB).then(this.httptboapiservice.flightFormat).then(this.addImage)
    //             ]);
    
    //             const [ssr_ob, ssr_ib] = await Promise.all([
    //                 this.httptboapiservice.ssr(base_url_ssr, payload_request_OB).then(this.httptboapiservice.flightFormat),
    //                 this.httptboapiservice.ssr(base_url_ssr, payload_request_IB).then(this.httptboapiservice.flightFormat)
    //             ]);
    
    //             response = [ [respons_ob, ssr_ob], [respons_ib, ssr_ib], commissionType, { journey_type, journey }];
    //         } else {
    //             response = await this.httptboapiservice.fareRule(base_url, payload_request_OB)
    //                 .then(this.httptboapiservice.flightFormat)
    //                 .then(this.addImage);
    
    //             ssrResponse = await this.httptboapiservice.ssr(base_url_ssr, payload_request_OB);
    //             if (journey_type === "ONEWAY") {
    //                 ssrResponse = await this.httptboapiservice.flightFormat(ssrResponse);
    //             }
    
    //             response = [response, ssrResponse, commissionType, { journey_type, journey }];
    //         }
    
    //         // Cache response
    //         await this.redisCacheService.setCache(`FlightDetail${guest_token}`, JSON.stringify(response), 3600);
    
    //         return { message: "Fare Details fetched successfully", data: response };
    //     } catch (error) {
    //         console.error("Error in the fare Details function", error);
    //         throw error;
    //     }
    // }


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

    addImage(response: any) {
        
        const seglength = response.Results.Segments;
        if(seglength.length === 1){

            const segment = response.Results.Segments[0];
            if (segment.length === 1) {
                segment[0].AccumulatedDuration = segment[0].Duration;
            }
            for (const data of segment) {
                data.AirlineLogo = `https://dev.page1travels.com/flight/AirlineLogo/${data.Airline.AirlineCode}.gif`;
            }
        }else if(seglength.length === 2){

            for (let i = 0; i < 2; i++) {
                const segment = response.Results.Segments[i];
        
                if (segment.length === 1) {
                    segment[0].AccumulatedDuration = segment[0].Duration;
                }
        
                for (const data of segment) {
                    data.AirlineLogo = `https://dev.page1travels.com/flight/AirlineLogo/${data.Airline.AirlineCode}.gif`;
                }
            }
        }


        if(seglength.length > 2){
            for(const data of seglength){
                for(let i = 0; i < data.length; i++){
                    data[i].AirlineLogo = `https://dev.page1travels.com/flight/AirlineLogo/${data[i].Airline.AirlineCode}.gif`;
                }
            }
        }

        return response;
    }

    

}
