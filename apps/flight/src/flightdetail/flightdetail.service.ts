import { Injectable } from '@nestjs/common';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { FlightDetailRequestDto, FlightRuleDto } from '../../../../libs/dtos/flight/flight-detail.dto'
import { GenerateTokenService } from '../search-flight/generateToken.service';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
import { JOURNEYTYPE,JOURNEY} from '../../../../libs/constants/flightConstant';
import { CommissionRepositoryService } from '../../../../libs/database/src';
import { COMMISSION_TYPE } from '../../../../libs/constants/autenticationConstants/userContants';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { tbo_credentials } from '../../../../libs/constants/tboCredentials';
import { cancellationConfirmationTemplate } from '../../../../libs/templates/cancellationTemplate';
import { EmailService } from '../../../../libs/email-service/email.service';
// import { ERROR_CODES } from '../../../../libs/constants/commonConstants';


@Injectable()
export class FlightDetailService {
    constructor(
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly redisCacheService: RedisCacheService,
        private readonly commissionRepositoryService:CommissionRepositoryService,
        private readonly EmailService:EmailService

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

    // get Agency Balance
//      async getAgencyBalance(body: {
//         ClientId: string;
//         TokenAgencyId: string;
//         TokenMemberId: string;
//         EndUserIp: string;
//         TokenId: string;
//     }) {
//         try {
//             const tbo_credentials = await this.tboConfigService.getTBOCredentials();
//             const base_url = tbo_credentials.FLIGHT_GET_AGENCY_BALANCE || 'http://Sharedapi.tektravels.com/SharedData.svc/rest/GetAgencyBalance';
//             const payload = {
//                 ClientId: body.ClientId,
//                 TokenAgencyId: body.TokenAgencyId,
//                 TokenMemberId: body.TokenMemberId,
//                 EndUserIp: body.EndUserIp,
//                 TokenId: body.TokenId
//             };
//             const response = await this.httptboapiservice.httpAPICall(base_url, payload);
//             console.log('Agency Balance API response:', response);
//             // Store in Redis with a key based on AgencyId
//             await this.redisCacheService.setCache(AgencyBalance:${body.TokenAgencyId}, JSON.stringify(response), 3600);
//             return { message: 'Agency Balance fetched successfully', data: response };
//         } catch (error) {
//             console.error('Error in getAgencyBalance:', error);
//             throw error;
// }
// }



    async FlightDetail(body: FlightDetailRequestDto) {
        try {
            const guest_token = "1ABCD"; 
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
            console.log("++++++++++++++Token in flight Deatil:",token);
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            console.log(">>>>>>>>>> tbo credentials > >",tbo_credentials);
            const base_url_ssr = tbo_credentials.FLIGHT_SSR;
            const base_url = tbo_credentials.FLIGHT_FAREQUOTE;
            console.log("++++++++++++baseUrl ssr:++++++++",base_url_ssr)
             console.log("++++++++++++baseUrl fare quote:++++++++",base_url)

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
                
                ssr_ob.Response.isLCC = respons_ob.Results.IsLCC  
                ssr_ib.Response.isLCC = respons_ib.Results.IsLCC 
                
                ssr_ob = await this.httptboapiservice.flightFormat(ssr_ob);
                ssr_ib = await this.httptboapiservice.flightFormat(ssr_ib);
                
                
                const response_ob = [respons_ob, ssr_ob];
                const  response_ib = [respons_ib, ssr_ib];

                response = [response_ob, response_ib, commissiontype, { journey_type: journey_type, journey: journey }];
            } else {
                const payload_request = {
                    "EndUserIp": ip_address,
                    "TokenId": token,
                    "TraceId": trace_id,
                    "ResultIndex": result_index
                };
                
                console.log("+++++++++++++++++Fare  api calling++++++++++++++++++");
                response = await this.httptboapiservice.fareRule(base_url, payload_request);
                console.log("fare Quote api calling url:", base_url);
                console.log("Payload for Fare Quote API: ", payload_request);
                console.log("flight Fare Quote url+++++: ",response);
                
                response = await this.httptboapiservice.flightFormat(response);
                console.log("flight format url+++++: ",response);
                await this.addImage(response);
                
                ssrResponse = await this.httptboapiservice.ssr(base_url_ssr, payload_request);
                console.log("++++++++ssr url:++++++++",base_url_ssr);
                console.log("++++++++++ssr payload: ++++++++++",payload_request);
                console.log("+++++ssr response:++++++",ssrResponse);
                ssrResponse.Response.isLCC = response.Results.IsLCC     
                          
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

    //============================================== flight cancellation services ================================

     // fetch airline types before cancellation

    async cancelFlightTicket(bookingId: string, requestType: number, userEmail?: string) {
        try {
            const payload = {
                EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
                TokenId: await this.getToken(),
                RequestType: requestType, // 1 for FullCancellation
                BookingId: bookingId,
                BookingMode: 5, // API mode
                Source: 4
            };

            const url = 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetCancellationCharges';
            const result = await this.httptboapiservice.httpAPICall(url, payload);

            if (result.Response.ResponseStatus === 1) {
                // If successful, proceed with cancellation
                const cancelPayload = {
                    ...payload,
                    CancellationCharges: result.Response.CancellationCharge,
                    RefundAmount: result.Response.RefundAmount,
                    Remarks: result.Response.Remarks
                };

                const cancelUrl = 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Cancel';
                const cancelResult = await this.httptboapiservice.httpAPICall(cancelUrl, cancelPayload);

                const response = {
                    success: cancelResult.Response.ResponseStatus === 1,
                    data: cancelResult.Response,
                    cancellationCharges: result.Response
                };
 
                
                // Optionally send cancellation confirmation email here if you have a valid service
                if (typeof userEmail === 'string' && userEmail.includes('@') && response.success) {
                  const cancellationTemplate = cancellationConfirmationTemplate(response, 'Guest');
                  await this.EmailService.sendEmail(
                      userEmail,
                      'Flight Ticket Cancellation Confirmation',
                      cancellationTemplate
                  );
              console.error('Error sending flight cancellation confirmation email:');
              // Optionally: log this to a monitoring service
          }
              

                return response;
            }

            return {
                success: false,
                data: result.Response,
                error: 'Failed to get cancellation charges'
            };
        } catch (error) {
            throw new Error(`Failed to cancel flight ticket: ${error.message}`);
        }
    }

    private async getToken() {
        try {
            const payload = {
                ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
                UserName: tbo_credentials.FLIGHT_USERNAME,
                Password: tbo_credentials.FLIGHT_PASSWORD,
                EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP
            };
            const response = await this.httptboapiservice.httpAPICall(tbo_credentials.FLIGHT_AUTHENTICATION, payload);
            return response.TokenId;
        } catch (error) {
            throw Error(`Failed to get authentication token: ${error.message}`);
        }
    }

    // Flight Cancellation 

    async releasePNR(bookingId: string, endUserIp: string, tokenId: string) {
        try {
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const base_url = tbo_credentials.FLIGHT_RELEASE_PNR;
            
            const payload = {
                EndUserIp: endUserIp,
                TokenId: tokenId,
                BookingId: bookingId,
                Source: "4"
            };

            const result = await this.httptboapiservice.releasePNR(base_url, payload);
            
            return {
                success: result.Response.ResponseStatus === 1,
                data: result.Response,
                error: result.Response.ResponseStatus !== 1 ? 'Failed to release PNR' : undefined
            };
        } catch (error) {
            console.error("Error in release PNR:", error);
            throw Error(`Failed to release PNR: ${error.message}`);
        }
    }

    

    async getCancellationCharges(body: {
    BookingId: string;
    RequestType: string;
    BookingMode: string;
    EndUserIp: string;
}) {
    try {
        const tbo_credentials = await this.tboConfigService.getTBOCredentials();
        const base_url = tbo_credentials.FLIGHT_GET_CANCELLATION_CHARGES;

        const { token,TBO_data } = await this.generateTokenService.getToken(body.EndUserIp);
        const {  FLIGHT_ENDUSERIP: base_ip } = TBO_data;

        console.log("generated token:",token);

    const payload = {
    BookingId: body.BookingId,
    RequestType: body.RequestType,
    BookingMode: body.BookingMode,
    EndUserIp: base_ip,
    TokenId: token,  // ✅ now always fresh & valid
};
        console.log("paylod",payload);

        const result = await this.httptboapiservice.getCancellationCharges(base_url, payload);

        return {
            success: result.Response.ResponseStatus === 1,
            data: result.Response,
            refundAmount: result.Response.RefundAmount,
            cancellationCharge: result.Response.CancellationCharge,
            error: result.Response.ResponseStatus !== 1 ? 'Failed to get cancellation charges' : undefined
        };
    } catch (error) {
        console.error("Error in getCancellationCharges:", error);
        throw new Error(`Failed to get cancellation charges: ${error.message}`);
    }
}

    async sendChangeRequest(body: {
        bookingId: string;
        requestType: number;
        cancellationType: number;
        sectors?: Array<{ origin: string; destination: string }>;
        ticketIds?: number[];
        remarks?: string;
        userEmail?: string;
    }) {
        try {
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const base_url = tbo_credentials.FLIGHT_SEND_CHANGE_REQUEST;
            
            const payload = {
                BookingId: body.bookingId,
                RequestType: body.requestType,
                CancellationType: body.cancellationType,
                Sectors: body.sectors?.map(s => ({
                    Origin: s.origin,
                    Destination: s.destination
                })),
                TicketId: body.ticketIds,
                Remarks: body.remarks || "Cancellation request",
                EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
                TokenId: await this.getToken()
            };

            const result = await this.httptboapiservice.sendChangeRequest(base_url, payload);
            
            const changeRequestId = result.Response.TicketCRInfo?.[0]?.ChangeRequestId;
            
            return {
                success: result.Response.ResponseStatus === 1,
                data: result.Response,
                changeRequestId: changeRequestId,
                error: result.Response.ResponseStatus !== 1 ? 'Failed to send change request' : undefined
            };
        } catch (error) {
            console.error("Error in send Change Request:", error);
            throw Error(`Failed to send change request: ${error.message}`);
        }
    }

    async getChangeRequestStatus(changeRequestId: string) {
        try {
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const base_url = tbo_credentials.FLIGHT_GET_CHANGE_REQUEST;
            
            const payload = {
                ChangeRequestId: changeRequestId,
                EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
                TokenId: await this.getToken()
            };

            const result = await this.httptboapiservice.getChangeRequestStatus(base_url, payload);
            
            return {
                success: result.ResponseStatus === 1,
                data: result,
                refundAmount: result.RefundedAmount,
                cancellationCharge: result.CancellationCharge,
                error: result.ResponseStatus !== 1 ? 'Failed to get change request status' : undefined
            };
        } catch (error) {
            console.error("Error in get Change Request Status:", error);
            throw Error(`Failed to get change request status: ${error.message}`);
        }
    }

    // async cancelFlightTicketNew(body: {
    //     bookingId: string;
    //     requestType?: number;
    //     userEmail?: string;
    //     remarks?: string;
    //     sectors?: Array<{ origin: string; destination: string }>;
    //     ticketIds?: number[];
    // }) {
    //     try {
    //         const { bookingId, requestType = 1, userEmail, remarks, sectors, ticketIds } = body;
            
    //         // Step 1: Get cancellation charges
    //         const chargesResult = await this.getCancellationCharges({
    //             bookingId,
    //             requestType: requestType.toString(),
    //             bookingMode: "5",
    //             endUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
    //             //tokenId: await this.generateTokenService.getToken(ip_address)
    //         });

    //         if (!chargesResult.success) {
    //             return chargesResult;
    //         }

    //         // Step 2: Send change request
    //         const cancellationRequest = {
    //             bookingId,
    //             requestType,
    //             cancellationType: 3, // Sector cancellation
    //             sectors,
    //             ticketIds,
    //             remarks: remarks || "Flight cancellation request",
    //             userEmail
    //         };

    //         const changeRequestResult = await this.sendChangeRequest(cancellationRequest);

    //         if (!changeRequestResult.success) {
    //             return changeRequestResult;
    //         }

    //         // Step 3: Send cancellation confirmation email if provided
    //         if (userEmail && changeRequestResult.success) {
    //             try {
    //                 const cancellationTemplate = cancellationConfirmationTemplate(changeRequestResult, 'Guest');
    //                 await this.EmailService.sendEmail(
    //                     userEmail,
    //                     'Flight Ticket Cancellation Confirmation',
    //                     cancellationTemplate
    //                 );
    //             } catch (emailError) {
    //                 console.error('Error sending cancellation confirmation email:', emailError);
    //             }
    //         }

    //         return {
    //             success: true,
    //             data: changeRequestResult.data,
    //             //cancellationCharges: chargesResult.cancellationCharges,
    //             changeRequestId: changeRequestResult.changeRequestId,
    //             refundAmount: chargesResult.refundAmount,
    //             cancellationCharge: chargesResult.cancellationCharge
    //         };
    //     } catch (error) {
    //         console.error("Error in cancel Flight Ticket", error);
    //         throw Error(`Failed to cancel flight ticket: ${error.message}`);
    //     }
    // }

    // async partialCancellation(body: {
    //     bookingId: string;
    //     sectors: Array<{ origin: string; destination: string }>;
    //     ticketIds: number[];
    //     remarks?: string;
    //     userEmail?: string;
    // }) {
    //     try {
    //         const tbo_credentials = await this.tboConfigService.getTBOCredentials();
    //         const { bookingId, sectors, ticketIds, remarks, userEmail } = body;

    //         // Step 1: Get cancellation charges
    //         const chargesResult = await this.getCancellationCharges({
    //             BookingId,
    //             RequestType: "2", // Partial cancellation
    //             BookingMode: "5",
    //             EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
    //             //tokenId: await this.getToken()
    //         });

    //         if (!chargesResult.success) {
    //             return chargesResult;
    //         }

    //         // Step 2: Send change request
    //         const cancellationRequest = {
    //             BookingId,
    //             requestType: 2, // Partial cancellation
    //             cancellationType: 3, // Sector cancellation
    //             sectors,
    //             ticketIds,
    //             remarks: remarks || "Partial cancellation request",
    //             userEmail
    //         };

    //         const changeRequestResult = await this.sendChangeRequest(cancellationRequest);

    //         if (!changeRequestResult.success) {
    //             return changeRequestResult;
    //         }

    //         // Step 3: Send cancellation confirmation email if provided
    //         if (userEmail && changeRequestResult.success) {
    //             try {
    //                 const cancellationTemplate = cancellationConfirmationTemplate(changeRequestResult, 'Guest');
    //                 await this.EmailService.sendEmail(
    //                     userEmail,
    //                     'Flight Ticket Partial Cancellation Confirmation',
    //                     cancellationTemplate
    //                 );
    //             } catch (emailError) {
    //                 console.error('Error sending cancellation confirmation email:', emailError);
    //             }
    //         }

    //         return {
    //             success: true,
    //             data: changeRequestResult.data,
    //             //cancellationCharges: chargesResult.cancellationCharges,
    //             changeRequestId: changeRequestResult.changeRequestId,
    //             refundAmount: chargesResult.refundAmount,
    //             cancellationCharge: chargesResult.cancellationCharge
    //         };
    //     } catch (error) {
    //         console.error("Error in partialCancellation:", error);
    //         throw new Error(`Failed to process partial cancellation: ${error.message}`);
    //     }
    // }

    async getAirlineTypes() {
        const GDS_SYSTEMS = [
            { code: 'Galileo', name: 'Galileo', type: 'GDS' },
            { code: 'Amadeus', name: 'Amadeus', type: 'GDS' }
        ];

        const NDC_AIRLINES = [
            { code: 'EK', name: 'Emirates', type: 'NDC' },
            { code: 'LH', name: 'Lufthansa', type: 'NDC' },
            { code: 'WY', name: 'Oman Air', type: 'NDC' },
            { code: 'EY', name: 'Etihad Airways', type: 'NDC' },
            { code: 'GF', name: 'Gulf Air', type: 'NDC' },
            { code: 'AI', name: 'Air India', type: 'NDC' }
        ];

        const LCC_AIRLINES = [
            { code: '6E', name: 'IndiGo', type: 'LCC' },
            { code: 'IX', name: 'Air India Express', type: 'LCC' },
            { code: 'SG', name: 'SpiceJet', type: 'LCC' },
            { code: 'FZ', name: 'FlyDubai', type: 'LCC' },
            { code: 'QP', name: 'Akasa Air', type: 'LCC' }
        ];

        return {
            message: "Airline types retrieved successfully",
            GDS_SYSTEMS: GDS_SYSTEMS,
            NDC_AIRLINES: NDC_AIRLINES,
            LCC_AIRLINES: LCC_AIRLINES,
        };
    }

}
