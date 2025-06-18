import {  Injectable } from '@nestjs/common';
import { JOURNEYTYPE,JOURNEY } from '../constants/flightConstant';
import   {TBO_CredentialsService} from '../loadtbo-db-config/tbo-config.service';
import { ConfigService } from "../../libs/config/config.service";
import { HTTPSTboAPIService } from '../../libs/http-api-service/tbo-api-service';
import { OrderRepositoryService } from '../../libs/database/src/repositories/order.repository';
import { EmailService } from '../../libs/email-service/email.service';
import { PDFGenerateService } from '../../libs/pdf-generate/pdf-generate.service';
import {UserRepositoryService } from '../../libs/database/src';
import { bookingConfirmationTemplate } from '../../libs/templates/flightTemplate';
import { bookingConTemplate } from '../../libs/templates/outbondTemplate';
import { bookConfirmationTemplate } from '../../libs/templates/flightOutbond';
import { flightTicketPdfTemplate } from '../../libs/templates/ticket';
import { paymentSuccessTicketFailureTemplate } from '../../libs/templates/ticketfail.template';
import axios from "axios";
import * as fs from "fs";

@Injectable()
export class FlightService {
   

    constructor(
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly pdfGenerateService: PDFGenerateService,
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly userRepositoryService:UserRepositoryService,
        private readonly orderRepositoryService:OrderRepositoryService,
        private readonly EmailService: EmailService,
        private readonly configService: ConfigService 
    ) {}

    async flightHandler(order_id,custom_order_id,journey_type, journey, isLCC, is_LCC_round , trace_id, order_request, order_request_second,user){
        try{ 
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const payload = JSON.parse(order_request);
            console.log(">>>>>>>>>  hello response",payload);
            console.log("order_id",order_id);
            console.log("custom_order_id",custom_order_id);
            console.log("journey_type",journey_type);
            console.log("journey",journey);
            console.log("isLCC",isLCC);
            console.log("is_LCC_round",is_LCC_round);
            console.log("trace_id",trace_id);
            
            const userDetails = await this.userRepositoryService.getUserByUserId(user);
            
            const payloadSecond = JSON.parse(order_request_second);
            
            if(journey_type == JOURNEYTYPE.ONEWAY ){ 
                if(journey == JOURNEY.DOMESTIC){ 
                    if(isLCC == true){ 
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        console.log("isLCC URL:",url);
                        let result = await this.httpAPICall(url, payload);
                        console.log("+++++++++++++lcc one way response+++++++++ ",result);
        
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);
                            const ticket = flightTicketPdfTemplate(result);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                            }
                            const welcomeTemplate = await bookingConfirmationTemplate(result.data,"Guest");
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                        }
                    }else if(isLCC == false){
                        
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);
                         console.log("+++++++++++++non lcc one way response+++++++++ ",result);
                        
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
                             console.log("+++++++++++++ticket for lcc one way response+++++++++ ",result);
                            
                            if(resultTicket.data.Response.ResponseStatus === 1){
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id,resultTicket.data);
                                const ticket = flightTicketPdfTemplate(resultTicket);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                }
                                const welcomeTemplate = await bookingConfirmationTemplate(resultTicket.data,"Guest");
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail 
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                            }

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail 
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                        }
                        
                    }
                }else if(journey == JOURNEY.INTERNATIONAL){
                    if(isLCC == true){
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);
                            const ticket = flightTicketPdfTemplate(result);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                            }
                            const welcomeTemplate = await bookingConfirmationTemplate(result.data,"Guest");
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail 
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
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
                                const ticket = flightTicketPdfTemplate(resultTicket);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                }
                                const welcomeTemplate = await bookingConfirmationTemplate(resultTicket.data,"Guest");
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                            }
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                        }
                    }
                }
            }else if(journey_type == JOURNEYTYPE.ROUNDTRIP){
                if(journey == JOURNEY.DOMESTIC){ 
                    if(isLCC == true && is_LCC_round == true){ 
                        // isLCC
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);
                            const ticket = flightTicketPdfTemplate(result);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                            }
                            const welcomeTemplate = await bookingConTemplate(result,"Guest");
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                            // is LCC True hit second API
                            let resultSecond = await this.httpAPICall(url, payloadSecond);
                            if(resultSecond.data.Response.ResponseStatus === 1){
                                // try to ticket check status then save db success/fail 
                                await this.orderRepositoryService.updatePaymentSuccess(order_id,resultSecond.data);
                                const ticket = flightTicketPdfTemplate(resultSecond);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                } 
                                const welcomeTemplate = await bookConfirmationTemplate(resultSecond.data,"Guest");
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                            }else if(resultSecond.data.Response.ResponseStatus != 1){
                                // status fail 
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultSecond.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                            }

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail 
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                        }
                        
                        
                    }else if(isLCC == true && is_LCC_round == false){
                        // isLCC
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);
                            const ticket = flightTicketPdfTemplate(result);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                            }
                            const welcomeTemplate = await bookingConTemplate(result,"Guest");
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                            // Is LCC False 
                            
                            const urlNonLCC = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                            let resultSecond = await this.httpAPICall(urlNonLCC, payloadSecond);
                            if(resultSecond.data.Response.ResponseStatus === 1){
                                // try to ticket check status then save db success/fail
                                const dataBooking = await this.orderRepositoryService.updatePaymentBooking(order_id,resultSecond.data);
                                const pnr = resultSecond.data.Response.Response.PNR;
                                const bookingId = resultSecond.data.Response.Response.BookingId;
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
                                    const ticket = flightTicketPdfTemplate(resultTicket);
                                    const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                    const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                    if (pdfBuffer) {
                                        attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                    }
                                    const welcomeTemplate = await bookConfirmationTemplate(resultTicket,"Guest");
                                    await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                                }else if(resultTicket.data.Response.ResponseStatus != 1){
                                    // status fail
                                    await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                                    await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                    const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                    await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                                }
                        
                            }else if(resultSecond.data.Response.ResponseStatus != 1){
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultSecond.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                            }
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                        }
                        
                        
                    }else if(isLCC == false && is_LCC_round == false){
                        // is_NON_LCC
                        const urlNonLCC = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(urlNonLCC, payload);
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
                                const ticket = flightTicketPdfTemplate(resultTicket);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                }
                                const welcomeTemplate = await bookingConTemplate(resultTicket,"Guest");
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);

                                // is Non LCC Round
                                let resultSecond = await this.httpAPICall(urlNonLCC, payloadSecond);
                                if(resultSecond.data.Response.ResponseStatus === 1){
                                    // try to ticket check status then save db success/fail
                                    const dataBooking = await this.orderRepositoryService.updatePaymentBooking(order_id,resultSecond.data);
                                    const pnr = resultSecond.data.Response.Response.PNR;
                                    const bookingId = resultSecond.data.Response.Response.BookingId;
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
                                        const ticket = flightTicketPdfTemplate(resultTicket);
                                        const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                        const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                        if (pdfBuffer) {
                                            attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                        }
                                        const welcomeTemplate = await bookConfirmationTemplate(resultTicket,"Guest");
                                        await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                                    }else if(resultTicket.data.Response.ResponseStatus != 1){
                                        // status fail 
                                        await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                                        await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                        const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                        await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                                    }
                            
                                }else if(resultSecond.data.Response.ResponseStatus != 1){
                                    // status fail
                                    await this.orderRepositoryService.updatePaymentFail(order_id,resultSecond.data);
                                    await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                    const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                    await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                                }
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                            }
                    
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                        }
                        


                    }else if(isLCC == false && is_LCC_round == true){
                        // isLCC
                        const urlNonLCC = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(urlNonLCC, payload);
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
                                const ticket = flightTicketPdfTemplate(resultTicket);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                }
                                const welcomeTemplate = await bookingConTemplate(resultTicket,"Guest");
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                                // Is LCC True 
                                const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                                let resultSecond = await this.httpAPICall(url, payloadSecond);
                                if(resultSecond.data.Response.ResponseStatus === 1){
                                    // try to ticket check status then save db success/fail
                                    await this.orderRepositoryService.updatePaymentSuccess(order_id,resultSecond.data);
                                    const ticket = flightTicketPdfTemplate(resultSecond);
                                    const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                    const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                    if (pdfBuffer) {
                                        attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                    }
                                    const welcomeTemplate = await bookConfirmationTemplate(resultSecond,"Guest");
                                    await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                                }else if(resultSecond.data.Response.ResponseStatus != 1){
                                    // status fail
                                    await this.orderRepositoryService.updatePaymentFail(order_id,resultSecond.data);
                                    await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                    const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                    await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                                }
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                            }
                    
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                        }
                 
                    }
                }else if(journey == JOURNEY.INTERNATIONAL){
                    if(isLCC == true){
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);
                            const ticket = flightTicketPdfTemplate(result);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                            }
                            const welcomeTemplate = await bookingConfirmationTemplate(result.data,"Guest");
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                        }
                    }else if(isLCC == false){
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentBooking(order_id,result.data);
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
                                const ticket = flightTicketPdfTemplate(resultTicket);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                }
                                const welcomeTemplate = await bookingConfirmationTemplate(resultTicket.data,"Guest");
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                            }

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                        }
                    }
                } 
            }else if(journey_type == JOURNEYTYPE.MULTICITY){
                if(journey == JOURNEY.DOMESTIC){
                    if(isLCC == true){
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);
                            const ticket = flightTicketPdfTemplate(result);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                            }
                            const welcomeTemplate = await bookingConfirmationTemplate(result.data,"Guest");
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
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
                                const ticket = flightTicketPdfTemplate(resultTicket);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                }
                                const welcomeTemplate = await bookingConfirmationTemplate(resultTicket.data,"Guest");
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                            }
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
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
                            const ticket = flightTicketPdfTemplate(result);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                            }
                            const welcomeTemplate = await bookingConfirmationTemplate(result.data,"Guest");
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
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
                                const ticket = flightTicketPdfTemplate(resultTicket);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                }
                                const welcomeTemplate = await bookingConfirmationTemplate(resultTicket.data,"Guest");
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                            }

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
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