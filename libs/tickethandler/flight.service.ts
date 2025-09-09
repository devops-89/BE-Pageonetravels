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
import { S3FileService } from '../../libs/S3-Service/s3File.service';
import axios from "axios";
import * as fs from "fs";
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { tbo_credentials } from '../constants/tboCredentials';
import { cancellationConfirmationTemplate } from '../templates/cancellationTemplate';

@Injectable()
export class FlightService {
   

    constructor(
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly pdfGenerateService: PDFGenerateService,
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly userRepositoryService:UserRepositoryService,
        private readonly orderRepositoryService:OrderRepositoryService,
        private readonly EmailService: EmailService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly s3FileService: S3FileService
    ) {}

    async flightHandler(order_id,custom_order_id,journey_type, journey, isLCC, is_LCC_round , trace_id, order_request, order_request_second,user){
        try{ 

            console.log("flight handler called..");
            console.log("journey_type:",journey_type);
            console.log("journey:",journey);
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const payload = JSON.parse(order_request);
            
            
            const userDetails = await this.userRepositoryService.getUserByUserId(user);
            
            const payloadSecond = JSON.parse(order_request_second);
            
            if(journey_type == JOURNEYTYPE.ONEWAY ){ 
                if(journey == JOURNEY.DOMESTIC){ 
                    if(isLCC == true){ 
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        console.log("isLCC URL:",url);
                         console.log(">>>>>>>>>>>>lcc one way domestic payload print:", payload);
                        let result = await this.httpAPICall(url, payload);
                        
            const data = result?.data;

if (data?.Response?.Response) {
  console.log("+++++++++++++lcc one way domestic response+++++++++", data.Response.Response);

  const itinerary = data.Response.Response.FlightItinerary.Passenger[0].Ticket;
  if (itinerary) {
    console.log("+++++++++++++lcc one way domestic response itinerary+++++++++", itinerary);
  } else {
    console.log("❌ Itinerary missing in response");
  }
} else {
  console.error("❌ Malformed or unexpected LCC ticket response:", data);
}
                        if(result.data.Response.ResponseStatus === 1){
                            // success result runing with 1 status code
                            console.log("+++++++++++++++result data printing:+++++++++++++++++",result?.data?.Response);
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);
                            const ticket = flightTicketPdfTemplate(result?.data);
                            // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                            //   console.log("+++++++++++++ticket for lcc one way domestic response+++++++++ ",result);
                            //   console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);




                            }
                            const welcomeTemplate = await bookingConfirmationTemplate(result.data,"Guest");
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                             console.log("+++++++++++++ticket for lcc one way domestic failed+++++++++ ");
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                        }
                    }else if(isLCC == false){
                        
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log(">>>>>>>>>>>>nonlcc one way domestic payload print:", payload);
                        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                        console.log("+++++++++++++nonlcc one way domestic response+++++++++ ",result);
                        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                        
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
                               console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                              console.log("+++++++++++++ticket for nonlcc one way domestic response+++++++++ ",result);
                              console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                            
                            if(resultTicket.data.Response.ResponseStatus === 1){
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id,resultTicket.data);
                                const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                      const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
                                }
                                const welcomeTemplate = await bookingConfirmationTemplate(resultTicket.data,"Guest");
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail 
                                   console.log("+++++++++++++ticket for nonlcc one way domestic failed+++++++++ ");
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                            }

                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail 
                               console.log("+++++++++++++booking for nonlcc one way domestic failed+++++++++ ");
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
                        console.log(">>>>>>>>>>>>lcc one way international payload print:", payload);
                       console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                        console.log("+++++++++++++lcc one way international response updated +++++++++ ",result);
                        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result?.data);
                                console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                              console.log("+++++++++++++ticket for lcc one way international email response+++++++++ ",result);
                              console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                            const ticket = flightTicketPdfTemplate(result?.data);
                           
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                  const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
                            }
                            const welcomeTemplate = await bookingConfirmationTemplate(result.data,"Guest");
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail 
                               console.log("+++++++++++++booking for lcc one way international failed+++++++++ ");
                          
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                        } 
                    }else if(isLCC == false){
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log(">>>>>>>>>>>>nonlcc one way international payload print:", payload);
                       console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                        console.log("+++++++++++++nonlcc one way international response+++++++++ ",result);
                        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
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
                               console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                              console.log("+++++++++++++ticket for nonlcc one way domestic response+++++++++ ",result);
                              console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                            if(resultTicket.data.Response.ResponseStatus === 1){
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id,resultTicket.data);
                                const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                      const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
                                }
                                const welcomeTemplate = await bookingConfirmationTemplate(resultTicket.data,"Guest");
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                            }else if(resultTicket.data.Response.ResponseStatus != 1){
                                // status fail
                                   console.log("+++++++++++++ticket for nonlcc one way international failed+++++++++ ");
                                await this.orderRepositoryService.updatePaymentFail(order_id,resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id,result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email,"Flight Booking Update",failTemplate);
                            }
                        }else if(result.data.Response.ResponseStatus != 1){
                            // status fail
                               console.log("+++++++++++++booking for nonlcc one way international failed+++++++++ ");
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
                        console.log("url:",url);
                        console.log("payload:",payload);
                        let result = await this.httpAPICall(url, payload);
                        if(result.data.Response.ResponseStatus === 1){
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id,result.data);
                            const ticket = flightTicketPdfTemplate(result?.data);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                  const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
                            }
                            const welcomeTemplate = await bookingConTemplate(result,"Guest");
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                            // is LCC True hit second API
                            let resultSecond = await this.httpAPICall(url, payloadSecond);
                            if(resultSecond.data.Response.ResponseStatus === 1){
                                // try to ticket check status then save db success/fail 
                                console.log("booking successfull");
                                await this.orderRepositoryService.updatePaymentSuccess(order_id,resultSecond.data);
                                const ticket = flightTicketPdfTemplate(resultSecond?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                      const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
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
                            const ticket = flightTicketPdfTemplate(result?.data);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                  const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
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
                                    const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                    const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                    const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                    if (pdfBuffer) {
                                        attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                          const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
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
                                const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                      const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
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
                                        const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                        const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                        const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                        if (pdfBuffer) {
                                            attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                              const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
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
                                const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                      const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
                                }
                                const welcomeTemplate = await bookingConTemplate(resultTicket,"Guest");
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate,attactments);
                                // Is LCC True 
                                const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                                let resultSecond = await this.httpAPICall(url, payloadSecond);
                                if(resultSecond.data.Response.ResponseStatus === 1){
                                    // try to ticket check status then save db success/fail
                                    await this.orderRepositoryService.updatePaymentSuccess(order_id,resultSecond.data);
                                    const ticket = flightTicketPdfTemplate(resultSecond?.data);
                                    const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                    const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                    if (pdfBuffer) {
                                        attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                          const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
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
                            const ticket = flightTicketPdfTemplate(result?.data);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                  const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
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
                                console.log("booking successfull.")
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id,resultTicket.data);
                                const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                      const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
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
                            const ticket = flightTicketPdfTemplate(result?.data);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                  const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
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
                                const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                      const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
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
                            const ticket = flightTicketPdfTemplate(result?.data);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                  const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
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
                                const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                      const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Ticket Url: ",pdfUrl);
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

    async cancelFlightTicket(bookingId: string, requestType: number = 1, userEmail?: string) {
        try {
            const payload = {
                EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
                TokenId: await this.getToken(),
                RequestType: requestType, // 1 for FullCancellation
                BookingId: bookingId,
                BookingMode: 5 // API mode
            };

            const url = 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetCancellationCharges';
            const result = await this.httpAPICall(url, payload);

            if (result.data.Response.ResponseStatus === 1) {
                // If successful, proceed with cancellation
                const cancelPayload = {
                    ...payload,
                    CancellationCharges: result.data.Response.CancellationCharge,
                    RefundAmount: result.data.Response.RefundAmount,
                    Remarks: result.data.Response.Remarks
                };

                const cancelUrl = 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Cancel';
                const cancelResult = await this.httpAPICall(cancelUrl, cancelPayload);

                const response = {
                    success: cancelResult.data.Response.ResponseStatus === 1,
                    data: cancelResult.data.Response,
                    cancellationCharges: result.data.Response
                };

                // Send cancellation confirmation email if user email is provided
                if (userEmail && response.success) {
                    const emailTemplate = cancellationConfirmationTemplate(response, 'Guest');
                    await this.EmailService.sendEmail(
                        userEmail,
                        'Flight Ticket Cancellation Confirmation',
                        emailTemplate
                    );
                }

                return response;
            }

            return {
                success: false,
                data: result.data.Response,
                error: 'Failed to get cancellation charges'
            };
        } catch (error) {
            throw Error(`Failed to cancel flight ticket: ${error.message}`);
        }
    }

    async httpAPICall(baseURL: string, payload: object) {
              const result = await axios.post(baseURL, payload);
             
               return result;
    }
    
    private async getToken() {
        try {
            const payload = {
                ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
                UserName: tbo_credentials.FLIGHT_USERNAME,
                Password: tbo_credentials.FLIGHT_PASSWORD,
                EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP
            };
            const response = await firstValueFrom(
                this.httpService.post(tbo_credentials.FLIGHT_AUTHENTICATION, payload)
            );
            return response.data.TokenId;
        } catch (error) {
            throw Error(`Failed to get authentication token: ${error.message}`);
        }
    }
}