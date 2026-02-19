import { Injectable } from '@nestjs/common';
import { JOURNEYTYPE, JOURNEY, JOURNEY_TYPE } from '../constants/flightConstant';
import { TBO_CredentialsService } from '../loadtbo-db-config/tbo-config.service';
import { ConfigService } from '../../libs/config/config.service';
import { HTTPSTboAPIService } from '../../libs/http-api-service/tbo-api-service';
import { OrderRepositoryService } from '../../libs/database/src/repositories/order.repository';
import { EmailService } from '../../libs/email-service/email.service';
import { PDFGenerateService } from '../../libs/pdf-generate/pdf-generate.service';
import { UserRepositoryService } from '../../libs/database/src';
import { bookingConfirmationTemplate } from '../../libs/templates/flightTemplate';
import { bookingConTemplate } from '../../libs/templates/outbondTemplate';
import { bookConfirmationTemplate } from '../../libs/templates/flightOutbond';
import { flightTicketPdfTemplate } from '../../libs/templates/ticket';
import { paymentSuccessTicketFailureTemplate } from '../../libs/templates/ticketfail.template';
import {bookingRoundTripTemplate} from '../templates/bookingRoundtripTemplate';
import { S3FileService } from '../../libs/S3-Service/s3File.service';
import { CommissionRepositoryService } from '../../libs/database/src';
import http from "http";
import https from "https";
import axios from 'axios';
import * as fs from 'fs';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { tbo_credentials } from '../constants/tboCredentials';
import { cancellationConfirmationTemplate } from '../templates/cancellationTemplate';
import { COMMISSION_TYPE } from '../constants/autenticationConstants/userContants';

@Injectable()
export class FlightService {
    constructor(
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly pdfGenerateService: PDFGenerateService,
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly commissionRepositoryService:CommissionRepositoryService,
        private readonly EmailService: EmailService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly s3FileService: S3FileService
    ) {}

    async flightHandler(order_id, custom_order_id, journey_type, journey, isLCC, is_LCC_round, trace_id, order_request, order_request_second, user) {
        try {
            console.log('flight handler called..');
            console.log('journey_type:', journey_type);
            console.log('journey:', journey);
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const payload = JSON.parse(order_request);

            const userDetails = await this.userRepositoryService.getUserByUserId(user);

            const payloadSecond = JSON.parse(order_request_second);

            if (journey_type == JOURNEYTYPE.ONEWAY) {
                if (journey == JOURNEY.DOMESTIC) {
                    if (isLCC == true) {
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        console.log('isLCC URL:', url);
                        console.log('>>>>>>>>>>>>lcc one way domestic payload print:', payload);
                        let result = await this.httpAPICall(url, payload);

                        const data = result?.data;

                        if (data?.Response?.Response) {
                            console.log('+++++++++++++lcc one way domestic response+++++++++', data.Response.Response);

                            const itinerary = data.Response.Response.FlightItinerary.Passenger[0].Ticket;
                            if (itinerary) {
                                console.log('+++++++++++++lcc one way domestic response itinerary+++++++++', itinerary);
                            } else {
                                console.log('❌ Itinerary missing in response');
                            }
                        } else {
                            console.error('❌ Malformed or unexpected LCC ticket response:', data);
                        }
                        if (result.data.Response.ResponseStatus === 1) {
                            // success result runing with 1 status code
                            console.log('+++++++++++++++result data printing:+++++++++++++++++', result?.data?.Response);
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id, result.data);
                            const ticket = flightTicketPdfTemplate(result?.data);
                            // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                            //   console.log("+++++++++++++ticket for lcc one way domestic response+++++++++ ",result);
                            //   console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

                            // extracting the commission start
                             let commission:number=await this.getCommission(result.data.Response.Response.FlightItinerary.Fare.BaseFare,journey_type,journey);

                            // extracting the commission end
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            const welcomeTemplate = await bookingConfirmationTemplate(result.data, 'Guest',commission);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Confirmation - Page1Travels', welcomeTemplate, attactments);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                                let pdfUrl = await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                                console.log('PDF Ticket Url: ', pdfUrl);
                            }

                        } else if (result.data.Response.ResponseStatus != 1) {
                            // status fail
                            console.log('+++++++++++++ticket for lcc one way domestic failed+++++++++ ');
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                        }
                    }
                    else if (isLCC == false) {
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log('>>>>>>>>>>>>nonlcc one way domestic payload print:', payload);
                        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                        console.log('+++++++++++++nonlcc one way domestic response+++++++++ ', result);
                        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');

                        if (result.data.Response.ResponseStatus === 1) {
                            // try to ticket check status then save db success/fail
                            const dataBooking = await this.orderRepositoryService.updatePaymentBooking(order_id, result.data);
                            const pnr = result.data.Response.Response.PNR;
                            const bookingId = result.data.Response.Response.BookingId;
                            const ip = payload.EndUserIp;
                            const token = payload.TokenId;
                            const traceId = payload.TraceId;

                            const payloadForTicket = {
                                EndUserIp: ip,
                                TokenId: token,
                                TraceId: traceId,
                                PNR: pnr,
                                BookingId: bookingId,
                            };

                            const urlticket = tbo_credentials.FLIGHT_TICKET_FORLCC;
                            let resultTicket = await this.httpAPICall(urlticket, payloadForTicket);
                            console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                            console.log('+++++++++++++ticket for nonlcc one way domestic response+++++++++ ', resultTicket.data.Response);
                            console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');

                            if (resultTicket.data.Response.ResponseStatus === 1) {
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id, resultTicket.data);
                                const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                // extracting the commission start
                                let commission:number=await this.getCommission(result.data.Response.Response.FlightItinerary.Fare.BaseFare,journey_type,journey);
                                console.log("commission:",commission);
                                // extracting the commission end
                                const welcomeTemplate = await bookingConfirmationTemplate(resultTicket.data, 'Guest',commission);
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate, attactments);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                    const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                    const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                                    let pdfUrl = await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                                    console.log('PDF Ticket Url: ', pdfUrl);
                                }


                            } else if (resultTicket.data.Response.ResponseStatus != 1) {
                                // status fail
                                console.log('+++++++++++++ticket for nonlcc one way domestic failed+++++++++ ');
                                await this.orderRepositoryService.updatePaymentFail(order_id, resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                            }
                        } else if (result.data.Response.ResponseStatus != 1) {
                            // status fail
                            console.log('+++++++++++++booking for nonlcc one way domestic failed+++++++++ ');
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                        }
                    }
                }
                else if (journey == JOURNEY.INTERNATIONAL) {
                    if (isLCC == true) {
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log('>>>>>>>>>>>>lcc one way international payload print:', payload);
                        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                        console.log('+++++++++++++lcc one way international response updated +++++++++ ', result);
                        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                        if (result.data.Response.ResponseStatus === 1) {
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id, result?.data);
                            console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                            console.log('+++++++++++++ticket for lcc one way international email response+++++++++ ', result);
                            console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                            const ticket = flightTicketPdfTemplate(result?.data);

                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            // extracting the commission start
                            let commission:number=await this.getCommission(result.data.Response.Response.FlightItinerary.Fare.BaseFare,journey_type,journey);

                            // extracting the commission end
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            const welcomeTemplate = await bookingConfirmationTemplate(result.data, 'Guest',commission);
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate, attactments);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                                let pdfUrl = await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                                console.log('PDF Ticket Url: ', pdfUrl);
                            }

                        } else if (result.data.Response.ResponseStatus != 1) {
                            // status fail
                            console.log('+++++++++++++booking for lcc one way international failed+++++++++ ');

                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                        }
                    }
                    else if (isLCC == false) {
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log('>>>>>>>>>>>>nonlcc one way international payload print:', payload);
                        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                        console.log('+++++++++++++nonlcc one way international response+++++++++ ', result);
                        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                        if (result.data.Response.ResponseStatus === 1) {
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentBooking(order_id, result.data);
                            // const bookingResponse = result.data.Response
                            const pnr = result.data.Response.Response.PNR;
                            const bookingId = result.data.Response.Response.BookingId;
                            const ip = payload.EndUserIp;
                            const token = payload.TokenId;
                            const traceId = payload.TraceId;

                            const payloadForTicket = {
                                EndUserIp: ip,
                                TokenId: token,
                                TraceId: traceId,
                                PNR: pnr,
                                BookingId: bookingId,
                            };

                            const urlticket = tbo_credentials.FLIGHT_TICKET_FORLCC;
                            let resultTicket = await this.httpAPICall(urlticket, payloadForTicket);
                            console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                            console.log('+++++++++++++ticket for nonlcc one way domestic response+++++++++ ', result);
                            console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                            if (resultTicket.data.Response.ResponseStatus === 1) {
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id, resultTicket.data);
                                const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                // extracting the commission start
                                let commission:number=await this.getCommission(result.data.Response.Response.FlightItinerary.Fare.BaseFare,journey_type,journey);

                                // extracting the commission end
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                const welcomeTemplate = await bookingConfirmationTemplate(resultTicket.data, 'Guest',commission);
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate, attactments);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                    const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                    const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                                    let pdfUrl = await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                                    console.log('PDF Ticket Url: ', pdfUrl);
                                }

                            } else if (resultTicket.data.Response.ResponseStatus != 1) {
                                // status fail
                                console.log('+++++++++++++ticket for nonlcc one way international failed+++++++++ ');
                                await this.orderRepositoryService.updatePaymentFail(order_id, resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                            }
                        } else if (result.data.Response.ResponseStatus != 1) {
                            // status fail
                            console.log('+++++++++++++booking for nonlcc one way international failed+++++++++ ');
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                        }
                    }
                }
            } else if (journey_type == JOURNEYTYPE.ROUNDTRIP) {
                if (journey == JOURNEY.DOMESTIC) {
                    if (isLCC == true && is_LCC_round == true) {
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;

                        console.log("url:", url);
                        console.log("OutBound payload:", payload);

                        // ----------------- OUTBOUND TICKET -----------------
                        let result = await this.httpAPICall(url, payload);

                        if (result.data.Response.ResponseStatus === 1) {
                            // Save outbound success
                            await this.orderRepositoryService.updatePaymentSuccess(order_id, result.data);

                            // ----------------- INBOUND TICKET -----------------
                            console.log("InBound payload:", payloadSecond);
                            let resultSecond = await this.httpAPICall(url, payloadSecond);

                            if (resultSecond.data.Response.ResponseStatus === 1) {
                                // Save inbound success
                                await this.orderRepositoryService.updatePaymentSuccess(order_id, resultSecond.data);

                                console.log("Roundtrip ticketing successful");

                                // extracting the commission start
                                let outboundCommission:number=await this.getCommission(result.data.Response.Response.FlightItinerary.Fare.BaseFare,journey_type,journey);
                                let inboundCommission=await this.getCommission(resultSecond.data.Response.Response.FlightItinerary.Fare.BaseFare,journey_type,journey);

                                // extracting the commission end

                                // ----------------- SEND ONLY ONE EMAIL -----------------
                                const finalTemplate = await bookingRoundTripTemplate(
                                    result.data,          // outbound
                                    resultSecond.data,    // inbound
                                    'Guest',
                                    inboundCommission,
                                    outboundCommission

                                );

                                const attachments: { filename: string; contentType: string; content: Buffer }[] = [];

                                await this.EmailService.sendEmail(
                                    userDetails.email,
                                    'Your Roundtrip Flight Ticket – Confirmation',
                                    finalTemplate,
                                    attachments
                                );

                            } else {
                                // ----------------- INBOUND FAIL CASE -----------------
                                await this.orderRepositoryService.updatePaymentFail(order_id, resultSecond.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id, result.data);

                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                            }
                        } else {
                            // ----------------- OUTBOUND FAIL CASE -----------------
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);

                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                        }
                    }

                    else if (isLCC == true && is_LCC_round == false) {

                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;

                        console.log("Outbound payload:", payload);

                        // ---------------- OUTBOUND (LCC) TICKETING ----------------
                        let result = await this.httpAPICall(url, payload);

                        if (result.data.Response.ResponseStatus === 1) {

                            await this.orderRepositoryService.updatePaymentSuccess(order_id, result.data);

                            // extract outbound commission
                            let outboundCommission: number = await this.getCommission(
                                result.data.Response.Response.FlightItinerary.Fare.BaseFare,
                                journey_type,
                                journey
                            );

                            // ---------------- INBOUND (NON-LCC) BOOKING ----------------
                            const urlNonLCC = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;

                            console.log("Inbound payload:", payloadSecond);

                            let resultSecond = await this.httpAPICall(urlNonLCC, payloadSecond);

                            if (resultSecond.data.Response.ResponseStatus === 1) {

                                await this.orderRepositoryService.updatePaymentBooking(order_id, resultSecond.data);

                                const pnr = resultSecond.data.Response.Response.PNR;
                                const bookingId = resultSecond.data.Response.Response.BookingId;

                                const payloadForTicket = {
                                    EndUserIp: payload.EndUserIp,
                                    TokenId: payload.TokenId,
                                    TraceId: payload.TraceId,
                                    PNR: pnr,
                                    BookingId: bookingId,
                                };

                                // ---------------- INBOUND TICKETING AFTER BOOKING ----------------
                                const urlTicket = tbo_credentials.FLIGHT_TICKET_FORLCC;

                                let resultTicket = await this.httpAPICall(urlTicket, payloadForTicket);

                                if (resultTicket.data.Response.ResponseStatus === 1) {

                                    await this.orderRepositoryService.updatePaymentSuccess(order_id, resultTicket.data);

                                    // extract inbound commission
                                    let inboundCommission: number = await this.getCommission(
                                        resultTicket.data.Response.Response.FlightItinerary.Fare.BaseFare,
                                        journey_type,
                                        journey
                                    );

                                    // ---------------- SEND ONLY ONE FINAL MAIL ----------------
                                    const finalTemplate = await bookingRoundTripTemplate(
                                        result.data,           // outbound LCC
                                        resultTicket.data,     // inbound NON-LCC ticket
                                        'Guest',
                                        outboundCommission,
                                        inboundCommission
                                    );

                                    const attachments: { filename: string; contentType: string; content: Buffer }[] = [];

                                    await this.EmailService.sendEmail(
                                        userDetails.email,
                                        'Your Roundtrip Flight Ticket – Confirmation',
                                        finalTemplate,
                                        attachments
                                    );

                                } else {
                                    // ---------------- INBOUND TICKET FAILURE ----------------
                                    await this.orderRepositoryService.updatePaymentFail(order_id, resultTicket.data);
                                    await this.orderRepositoryService.updatePaymentFail(order_id, result.data);

                                    const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                    await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                                }

                            } else {
                                // ---------------- INBOUND BOOKING FAILURE ----------------
                                await this.orderRepositoryService.updatePaymentFail(order_id, resultSecond.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id, result.data);

                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                            }

                        } else {
                            // ---------------- OUTBOUND FAILURE ----------------
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);

                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                        }
                    }
                    else if (isLCC == false && is_LCC_round == false) {

                        const urlNonLCC = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;

                        console.log("Outbound Non-LCC Booking Payload:", payload);

                        // ---------------- OUTBOUND: NON-LCC BOOK → TICKET ----------------
                        let result = await this.httpAPICall(urlNonLCC, payload);

                        if (result.data.Response.ResponseStatus === 1) {

                            await this.orderRepositoryService.updatePaymentBooking(order_id, result.data);

                            const pnr = result.data.Response.Response.PNR;
                            const bookingId = result.data.Response.Response.BookingId;

                            const payloadForTicket = {
                                EndUserIp: payload.EndUserIp,
                                TokenId: payload.TokenId,
                                TraceId: payload.TraceId,
                                PNR: pnr,
                                BookingId: bookingId,
                            };

                            const urlTicket = tbo_credentials.FLIGHT_TICKET_FORLCC;

                            let resultTicketOutbound = await this.httpAPICall(urlTicket, payloadForTicket);

                            if (resultTicketOutbound.data.Response.ResponseStatus === 1) {

                                await this.orderRepositoryService.updatePaymentSuccess(order_id, resultTicketOutbound.data);

                                // extract outbound NON-LCC commission
                                let outboundCommission: number = await this.getCommission(
                                    resultTicketOutbound.data.Response.Response.FlightItinerary.Fare.BaseFare,
                                    journey_type,
                                    journey
                                );

                                // ---------------- INBOUND: NON-LCC BOOK → TICKET ----------------
                                console.log("Inbound Non-LCC Booking Payload:", payloadSecond);

                                let resultSecond = await this.httpAPICall(urlNonLCC, payloadSecond);

                                if (resultSecond.data.Response.ResponseStatus === 1) {

                                    await this.orderRepositoryService.updatePaymentBooking(order_id, resultSecond.data);

                                    const pnr2 = resultSecond.data.Response.Response.PNR;
                                    const bookingId2 = resultSecond.data.Response.Response.BookingId;

                                    const payloadForTicket2 = {
                                        EndUserIp: payload.EndUserIp,
                                        TokenId: payload.TokenId,
                                        TraceId: payload.TraceId,
                                        PNR: pnr2,
                                        BookingId: bookingId2,
                                    };

                                    let resultTicketInbound = await this.httpAPICall(urlTicket, payloadForTicket2);

                                    if (resultTicketInbound.data.Response.ResponseStatus === 1) {

                                        await this.orderRepositoryService.updatePaymentSuccess(order_id, resultTicketInbound.data);

                                        // extract inbound NON-LCC commission
                                        let inboundCommission: number = await this.getCommission(
                                            resultTicketInbound.data.Response.Response.FlightItinerary.Fare.BaseFare,
                                            journey_type,
                                            journey
                                        );

                                        // ---------------- SEND ONLY ONE EMAIL ----------------
                                        const finalTemplate = await bookingRoundTripTemplate(
                                            resultTicketOutbound.data,   // outbound ticket
                                            resultTicketInbound.data,    // inbound ticket
                                            "Guest",
                                            outboundCommission,
                                            inboundCommission
                                        );

                                        const attachments: { filename: string; contentType: string; content: Buffer }[] = [];

                                        await this.EmailService.sendEmail(
                                            userDetails.email,
                                            "Your Roundtrip Flight Ticket – Confirmation",
                                            finalTemplate,
                                            attachments
                                        );

                                    } else {
                                        // INBOUND TICKET FAILURE
                                        await this.orderRepositoryService.updatePaymentFail(order_id, resultTicketInbound.data);
                                        await this.orderRepositoryService.updatePaymentFail(order_id, resultTicketOutbound.data);

                                        const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                        await this.EmailService.sendEmail(userDetails.email, "Flight Booking Update", failTemplate);
                                    }

                                } else {
                                    // INBOUND BOOKING FAILURE
                                    await this.orderRepositoryService.updatePaymentFail(order_id, resultSecond.data);
                                    await this.orderRepositoryService.updatePaymentFail(order_id, resultTicketOutbound.data);

                                    const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                    await this.EmailService.sendEmail(userDetails.email, "Flight Booking Update", failTemplate);
                                }

                            } else {
                                // OUTBOUND TICKET FAILURE
                                await this.orderRepositoryService.updatePaymentFail(order_id, resultTicketOutbound.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id, result.data);

                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email, "Flight Booking Update", failTemplate);
                            }

                        } else {
                            // OUTBOUND BOOKING FAILURE
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);

                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, "Flight Booking Update", failTemplate);
                        }
                    }

                    else if (isLCC == false && is_LCC_round == true) {

                        const urlNonLCC = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;

                        console.log("Outbound Non-LCC Booking Payload:", payload);

                        // ---------------- OUTBOUND NON-LCC BOOK ----------------
                        let result = await this.httpAPICall(urlNonLCC, payload);

                        if (result.data.Response.ResponseStatus === 1) {

                            await this.orderRepositoryService.updatePaymentBooking(order_id, result.data);

                            const pnr = result.data.Response.Response.PNR;
                            const bookingId = result.data.Response.Response.BookingId;

                            const payloadForTicket = {
                                EndUserIp: payload.EndUserIp,
                                TokenId: payload.TokenId,
                                TraceId: payload.TraceId,
                                PNR: pnr,
                                BookingId: bookingId,
                            };

                            const urlTicket = tbo_credentials.FLIGHT_TICKET_FORLCC;

                            // ---------------- OUTBOUND TICKET ----------------
                            let resultTicketOutbound = await this.httpAPICall(urlTicket, payloadForTicket);

                            if (resultTicketOutbound.data.Response.ResponseStatus === 1) {

                                await this.orderRepositoryService.updatePaymentSuccess(order_id, resultTicketOutbound.data);

                                // OUTBOUND COMMISSION
                                let outboundCommission: number = await this.getCommission(
                                    resultTicketOutbound.data.Response.Response.FlightItinerary.Fare.BaseFare,
                                    journey_type,
                                    journey
                                );

                                // ---------------- INBOUND LCC DIRECT TICKET ----------------
                                console.log("Inbound LCC Ticket Payload:", payloadSecond);

                                const urlLCC = tbo_credentials.FLIGHT_TICKET_FORLCC;
                                let resultTicketInbound = await this.httpAPICall(urlLCC, payloadSecond);

                                if (resultTicketInbound.data.Response.ResponseStatus === 1) {

                                    await this.orderRepositoryService.updatePaymentSuccess(order_id, resultTicketInbound.data);

                                    // INBOUND COMMISSION
                                    let inboundCommission: number = await this.getCommission(
                                        resultTicketInbound.data.Response.Response.FlightItinerary.Fare.BaseFare,
                                        journey_type,
                                        journey
                                    );

                                    // ---------------- SEND ONLY ONE FINAL EMAIL ----------------
                                    const finalTemplate = await bookingRoundTripTemplate(
                                        resultTicketOutbound.data,   // outbound ticket
                                        resultTicketInbound.data,    // inbound ticket
                                        'Guest',
                                        outboundCommission,
                                        inboundCommission
                                    );

                                    const attachments: { filename: string; contentType: string; content: Buffer }[] = [];

                                    await this.EmailService.sendEmail(
                                        userDetails.email,
                                        "Your Roundtrip Flight Ticket – Confirmation",
                                        finalTemplate,
                                        attachments
                                    );

                                } else {
                                    // INBOUND FAILURE
                                    await this.orderRepositoryService.updatePaymentFail(order_id, resultTicketInbound.data);
                                    await this.orderRepositoryService.updatePaymentFail(order_id, resultTicketOutbound.data);

                                    const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                    await this.EmailService.sendEmail(userDetails.email, "Flight Booking Update", failTemplate);
                                }

                            } else {
                                // OUTBOUND TICKET FAILURE
                                await this.orderRepositoryService.updatePaymentFail(order_id, resultTicketOutbound.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id, result.data);

                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email, "Flight Booking Update", failTemplate);
                            }

                        } else {
                            // OUTBOUND BOOKING FAILURE
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);

                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, "Flight Booking Update", failTemplate);
                        }
                    }

                }
                else if (journey == JOURNEY.INTERNATIONAL) {
                    if (isLCC == true) {
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        if (result.data.Response.ResponseStatus === 1) {
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id, result.data);
                            const ticket = flightTicketPdfTemplate(result?.data);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            // extracting the commission start
                            let commission:number=await this.getCommission(result.data.Response.Response.FlightItinerary.Fare.BaseFare,journey_type,journey);

                            // extracting the commission end
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            const welcomeTemplate = await bookingConfirmationTemplate(result.data, 'Guest',commission);
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate, attactments);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                                let pdfUrl = await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                                console.log('PDF Ticket Url: ', pdfUrl);
                            }

                        } else if (result.data.Response.ResponseStatus != 1) {
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                        }
                    }
                    else if (isLCC == false) {
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);
                        if (result.data.Response.ResponseStatus === 1) {
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentBooking(order_id, result.data);
                            const pnr = result.data.Response.Response.PNR;
                            const bookingId = result.data.Response.Response.BookingId;
                            const ip = payload.EndUserIp;
                            const token = payload.TokenId;
                            const traceId = payload.TraceId;

                            const payloadForTicket = {
                                EndUserIp: ip,
                                TokenId: token,
                                TraceId: traceId,
                                PNR: pnr,
                                BookingId: bookingId,
                            };

                            const urlticket = tbo_credentials.FLIGHT_TICKET_FORLCC;
                            let resultTicket = await this.httpAPICall(urlticket, payloadForTicket);
                            if (resultTicket.data.Response.ResponseStatus === 1) {
                                console.log('booking successfull.');
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id, resultTicket.data);
                                const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                // extracting the commission start
                                let commission:number=await this.getCommission(result.data.Response.Response.FlightItinerary.Fare.BaseFare,journey_type,journey);

                                // extracting the commission end
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                const welcomeTemplate = await bookingConfirmationTemplate(resultTicket.data, 'Guest',commission);
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate, attactments);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                    const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                    const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                                    let pdfUrl = await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                                    console.log('PDF Ticket Url: ', pdfUrl);
                                }

                            } else if (resultTicket.data.Response.ResponseStatus != 1) {
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id, resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                            }
                        } else if (result.data.Response.ResponseStatus != 1) {
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                        }
                    }
                }
            }
            else if (journey_type == JOURNEYTYPE.MULTICITY) {
                if (journey == JOURNEY.DOMESTIC) {
                    if (isLCC == true) {
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        if (result.data.Response.ResponseStatus === 1) {
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id, result.data);
                            const ticket = flightTicketPdfTemplate(result?.data);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            // extracting the commission start
                            let commission:number=await this.getCommission(result.data.Response.Response.FlightItinerary.Fare.BaseFare,journey_type,journey);

                            // extracting the commission end
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            const welcomeTemplate = await bookingConfirmationTemplate(result.data, 'Guest',commission);
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate, attactments);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                                let pdfUrl = await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                                console.log('PDF Ticket Url: ', pdfUrl);
                            }

                        } else if (result.data.Response.ResponseStatus != 1) {
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                        }
                    }
                    else if (isLCC == false) {
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);

                        if (result.data.Response.ResponseStatus === 1) {
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentBooking(order_id, result.data);
                            // const bookingResponse = result.data.Response
                            const pnr = result.data.Response.Response.PNR;
                            const bookingId = result.data.Response.Response.BookingId;
                            const ip = payload.EndUserIp;
                            const token = payload.TokenId;
                            const traceId = payload.TraceId;

                            const payloadForTicket = {
                                EndUserIp: ip,
                                TokenId: token,
                                TraceId: traceId,
                                PNR: pnr,
                                BookingId: bookingId,
                            };

                            const urlticket = tbo_credentials.FLIGHT_TICKET_FORLCC;
                            let resultTicket = await this.httpAPICall(urlticket, payloadForTicket);
                            if (resultTicket.data.Response.ResponseStatus === 1) {
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id, resultTicket.data);
                                console.log("result ticket response: ",resultTicket.data);
                                const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                // extracting the commission start
                                let commission:number=await this.getCommission(result.data.Response.Response.FlightItinerary.Fare.BaseFare,journey_type,journey);

                                // extracting the commission end
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                const welcomeTemplate = await bookingConfirmationTemplate(resultTicket.data, 'Guest',commission);
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate, attactments);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                    const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                    const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                                    let pdfUrl = await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                                    console.log('PDF Ticket Url: ', pdfUrl);
                                }

                            } else if (resultTicket.data.Response.ResponseStatus != 1) {
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id, resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                            }
                        } else if (result.data.Response.ResponseStatus != 1) {
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                        }
                    }
                }
                else if (journey == JOURNEY.INTERNATIONAL) {
                    if (isLCC == true) {
                        const url = tbo_credentials.FLIGHT_TICKET_FORLCC;
                        let result = await this.httpAPICall(url, payload);
                        console.log(result.data);
                        if (result.data.Response.ResponseStatus === 1) {
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentSuccess(order_id, result.data);
                            const ticket = flightTicketPdfTemplate(result?.data);
                            const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                            // extracting the commission start
                            let commission:number=await this.getCommission(result.data.Response.Response.FlightItinerary.Fare.BaseFare,journey_type,journey);

                            // extracting the commission end
                            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                            const welcomeTemplate = await bookingConfirmationTemplate(result.data, 'Guest',commission);
                            await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate, attactments);
                            if (pdfBuffer) {
                                attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                                let pdfUrl = await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                                console.log('PDF Ticket Url: ', pdfUrl);
                            }

                        } else if (result.data.Response.ResponseStatus != 1) {
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                        }
                    }
                    else if (isLCC == false) {
                        const url = tbo_credentials.FLIGHT_BOOKING_API_FORNONLCC;
                        let result = await this.httpAPICall(url, payload);

                        if (result.data.Response.ResponseStatus === 1) {
                            // try to ticket check status then save db success/fail
                            await this.orderRepositoryService.updatePaymentBooking(order_id, result.data);
                            // const bookingResponse = result.data.Response
                            const pnr = result.data.Response.Response.PNR;
                            const bookingId = result.data.Response.Response.BookingId;
                            const ip = payload.EndUserIp;
                            const token = payload.TokenId;
                            const traceId = payload.TraceId;

                            const payloadForTicket = {
                                EndUserIp: ip,
                                TokenId: token,
                                TraceId: traceId,
                                PNR: pnr,
                                BookingId: bookingId,
                            };

                            const urlticket = tbo_credentials.FLIGHT_TICKET_FORLCC;
                            let resultTicket = await this.httpAPICall(urlticket, payloadForTicket);
                            if (resultTicket.data.Response.ResponseStatus === 1) {
                                // try to ticket check status then save db success/fail
                                await this.orderRepositoryService.updatePaymentSuccess(order_id, resultTicket.data);
                                const ticket = flightTicketPdfTemplate(resultTicket?.data);
                                const attactments: { filename: string; contentType: string; content: Buffer }[] = [];
                                // extracting the commission start
                                let commission:number=await this.getCommission(result.data.Response.Response.FlightItinerary.Fare.BaseFare,journey_type,journey);

                                // extracting the commission end
                                const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(ticket.html);
                                const welcomeTemplate = await bookingConfirmationTemplate(resultTicket.data, 'Guest',commission);
                                await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', welcomeTemplate, attactments);
                                if (pdfBuffer) {
                                    attactments.push({ filename: `flight-ticket.pdf`, contentType: 'application/pdf', content: pdfBuffer });
                                    const ticketPath = `tickets/${Date.now()}-ticket-${order_id}.pdf`;
                                    const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                                    let pdfUrl = await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                                    console.log('PDF Ticket Url: ', pdfUrl);
                                }

                            } else if (resultTicket.data.Response.ResponseStatus != 1) {
                                // status fail
                                await this.orderRepositoryService.updatePaymentFail(order_id, resultTicket.data);
                                await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                                const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                                await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                            }
                        } else if (result.data.Response.ResponseStatus != 1) {
                            // status fail
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            await this.orderRepositoryService.updatePaymentFail(order_id, result.data);
                            const failTemplate = paymentSuccessTicketFailureTemplate(custom_order_id);
                            await this.EmailService.sendEmail(userDetails.email, 'Flight Booking Update', failTemplate);
                        }
                    }
                }
            }
        } catch (error) {
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
                BookingMode: 5, // API mode
            };

            const url = 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetCancellationCharges';
            const result = await this.httpAPICall(url, payload);

            if (result.data.Response.ResponseStatus === 1) {
                // If successful, proceed with cancellation
                const cancelPayload = {
                    ...payload,
                    CancellationCharges: result.data.Response.CancellationCharge,
                    RefundAmount: result.data.Response.RefundAmount,
                    Remarks: result.data.Response.Remarks,
                };

                const cancelUrl = 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Cancel';
                const cancelResult = await this.httpAPICall(cancelUrl, cancelPayload);

                const response = {
                    success: cancelResult.data.Response.ResponseStatus === 1,
                    data: cancelResult.data.Response,
                    cancellationCharges: result.data.Response,
                };

                // Send cancellation confirmation email if user email is provided
                if (userEmail && response.success) {
                    const emailTemplate = cancellationConfirmationTemplate(response, 'Guest');
                    await this.EmailService.sendEmail(userEmail, 'Flight Ticket Cancellation Confirmation', emailTemplate);
                }

                return response;
            }

            return {
                success: false,
                data: result.data.Response,
                error: 'Failed to get cancellation charges',
            };
        } catch (error) {
            throw Error(`Failed to cancel flight ticket: ${error.message}`);
        }
    }

    async httpAPICall(baseURL: string, payload: object) {
        try {
            const agentOptions = {
                keepAlive: true,
                timeout: 60000,        // Socket timeout = 60 seconds
                keepAliveMsecs: 10000,
            };

            const httpAgent = new http.Agent(agentOptions);
            const httpsAgent = new https.Agent(agentOptions);

            const result = await axios.post(baseURL, payload, {
                timeout: 65000,        // Request timeout = 65 sec
                httpAgent,
                httpsAgent,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            });

            return result;

        } catch (error) {
            console.error("❌ API CALL FAILED:", error.message);
            throw error;
        }
    }

    private async getCommission(baseFare,journey_type:JOURNEYTYPE,journey:JOURNEY){
        const flightType = `FLIGHT_${journey_type}_${journey}` as COMMISSION_TYPE;
      const commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType);
        let commission=0;
        if (commissionType.commission_type === "FIXED") {
            commission = parseFloat(commissionType.percentage);
        } else if (commissionType.commission_type === "PERCENTAGE") {
            const percentValue = parseFloat(commissionType.percentage);
            commission = (baseFare * percentValue) / 100;
        }

        return commission;
    }

    private async getToken() {
        try {
            const payload = {
                ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
                UserName: tbo_credentials.FLIGHT_USERNAME,
                Password: tbo_credentials.FLIGHT_PASSWORD,
                EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
            };
            const response = await firstValueFrom(this.httpService.post(tbo_credentials.FLIGHT_AUTHENTICATION, payload));
            return response.data.TokenId;
        } catch (error) {
            throw Error(`Failed to get authentication token: ${error.message}`);
        }
    }




}
