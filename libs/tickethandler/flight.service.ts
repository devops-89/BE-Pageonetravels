import {  Injectable } from '@nestjs/common';
import { JOURNEYTYPE,JOURNEY } from '../constants/flightConstant';
import   {TBO_CredentialsService} from '../loadtbo-db-config/tbo-config.service';
import { ConfigService } from "../../libs/config/config.service";
import { HTTPSTboAPIService } from '../../libs/http-api-service/tbo-api-service';
import { OrderRepositoryService } from '../../libs/database/src/repositories/order.repository';
import axios from "axios";


@Injectable()
export class FlightService {

    constructor(
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly orderRepositoryService:OrderRepositoryService,
        private readonly configService: ConfigService 
    ) {}

    async flightHandler(order_id,journey_type, journey, isLCC, is_LCC_round , trace_id, order_request, order_request_second){
        try{ 
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const payload = JSON.parse(order_request);
            
            const payloadSecond = JSON.parse(order_request_second);
            
            if(journey_type == JOURNEYTYPE.ONEWAY ){
                if(journey == JOURNEY.DOMESTIC){
                    if(isLCC == true){
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log(result.data);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                        }
                    }else if(isLCC == false){
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);
                       
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            const dataBooking = await this.orderRepositoryService.updatePaymentBooking(order_id,result.data);
                            const pnr = result.data.Response.Response.PNR;
                            const bookingId = result.data.Response.Response.BookingId;
                            const ip = payload.EndUserIp;
                            const token = payload.TokenId;
                            const traceId = payload.TraceId;

                            const payloadForTicket = {
                                "EndUserIp": ip,
                                "TokenId": token,
                                "TraceId": traceId,
                                "PNR": pnr,
                                "BookingId": bookingId
                            }

                            const urlticket = tbo_credentials.FLIGHT_TICKET_FORLCC;
                            let resultTicket = await this.httpAPICall(urlticket, payloadForTicket);
                            if(resultTicket.data.Response.ResponseStatus === 1){
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id,resultTicket.data);
    
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                            }

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                        }
                        
                    }
                }else if(journey == JOURNEY.INTERNATIONAL){
                    if(isLCC == true){
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log(result.data);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                        }
                    }else if(isLCC == false){
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);
                        
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentBooking(order_id,result.data);
                            // const bookingResponse = result.data.Response
                            const pnr = result.data.Response.Response.PNR;
                            const bookingId = result.data.Response.Response.BookingId;
                            const ip = payload.EndUserIp;
                            const token = payload.TokenId;
                            const traceId = payload.TraceId;

                            const payloadForTicket = {
                                "EndUserIp": ip,
                                "TokenId": token,
                                "TraceId": traceId,
                                "PNR": pnr,
                                "BookingId": bookingId
                            }

                            const urlticket = tbo_credentials.FLIGHT_TICKET_FORLCC;
                            let resultTicket = await this.httpAPICall(urlticket, payloadForTicket);
                            if(resultTicket.data.Response.ResponseStatus === 1){
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id,resultTicket.data);
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                            }
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                        }
                    }
                }
            }else if(journey_type == JOURNEYTYPE.ROUNDTRIP){
                if(journey == JOURNEY.DOMESTIC){
                    if(isLCC == true && is_LCC_round == true){

                        // isLCC
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        // is_LCC_round
                        let resultSecond = await this.httpAPICall(url, payloadSecond);

                    }else if(isLCC == true && is_LCC_round == false){
                        // isLCC
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        // is_LCC_round 
                        const urlNonLCC = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let resultSecond = await this.httpAPICall(urlNonLCC, payloadSecond);
                        
                    }else if(isLCC == false && is_LCC_round == false){
                        // isLCC
                        const urlNonLCC = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(urlNonLCC, payload);
                        // is_LCC_round
                        let resultSecond = await this.httpAPICall(urlNonLCC, payloadSecond);


                    }else if(isLCC == false && is_LCC_round == true){
                        // isLCC
                        const urlNonLCC = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(urlNonLCC, payload);
                        // is_LCC_round
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let resultSecond = await this.httpAPICall(url, payloadSecond);
                        
                    }
                }else if(journey == JOURNEY.INTERNATIONAL){
                    if(isLCC == true){
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log(result.data);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                        }
                    }else if(isLCC == false){
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log(result.data);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentBooking(order_id,result.data);
                            // const bookingResponse = result.data.Response
                            const pnr = result.data.Response.Response.PNR;
                            const bookingId = result.data.Response.Response.BookingId;
                            const ip = payload.EndUserIp;
                            const token = payload.TokenId;
                            const traceId = payload.TraceId;

                            const payloadForTicket = {
                                "EndUserIp": ip,
                                "TokenId": token,
                                "TraceId": traceId,
                                "PNR": pnr,
                                "BookingId": bookingId
                            }

                            const urlticket = tbo_credentials.FLIGHT_TICKET_FORLCC;
                            let resultTicket = await this.httpAPICall(urlticket, payloadForTicket);
                            if(resultTicket.data.Response.ResponseStatus === 1){
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id,resultTicket.data);
    
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                            }

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                        }
                    }
                }
            }else if(journey_type == JOURNEYTYPE.MULTICITY){
                if(journey == JOURNEY.DOMESTIC){
                    if(isLCC == true){
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log(result.data);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                        }
                    }else if(isLCC == false){
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log(result.data);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentBooking(order_id,result.data);
                            // const bookingResponse = result.data.Response
                            const pnr = result.data.Response.Response.PNR;
                            const bookingId = result.data.Response.Response.BookingId;
                            const ip = payload.EndUserIp;
                            const token = payload.TokenId;
                            const traceId = payload.TraceId;

                            const payloadForTicket = {
                                "EndUserIp": ip,
                                "TokenId": token,
                                "TraceId": traceId,
                                "PNR": pnr,
                                "BookingId": bookingId
                            }

                            const urlticket = tbo_credentials.FLIGHT_TICKET_FORLCC;
                            let resultTicket = await this.httpAPICall(urlticket, payloadForTicket);
                            if(resultTicket.data.Response.ResponseStatus === 1){
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id,resultTicket.data);
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                            }
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                        }
                    }
                }else if(journey == JOURNEY.INTERNATIONAL){
                    if(isLCC == true){
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log(result.data);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                        }
                    }else if(isLCC == false){
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);
                        // console.log(result.data);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentBooking(order_id,result.data);
                            // const bookingResponse = result.data.Response
                            const pnr = result.data.Response.Response.PNR;
                            const bookingId = result.data.Response.Response.BookingId;
                            const ip = payload.EndUserIp;
                            const token = payload.TokenId;
                            const traceId = payload.TraceId;

                            const payloadForTicket = {
                                "EndUserIp": ip,
                                "TokenId": token,
                                "TraceId": traceId,
                                "PNR": pnr,
                                "BookingId": bookingId
                            }

                            const urlticket = tbo_credentials.FLIGHT_TICKET_FORLCC;
                            let resultTicket = await this.httpAPICall(urlticket, payloadForTicket);
                            if(resultTicket.data.Response.ResponseStatus === 1){
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id,resultTicket.data);
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                            }

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                        }
                    }
                }
            }


        }catch(error){
            console.error('Error in Flight Handler', error);
            throw error; 
        }
    }


    async httpAPICall(baseURL: string, payload: object) {
              const result = await axios.post(baseURL, payload);
              console.log(result.data);
               return result;
    }
    


}