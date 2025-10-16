import { Injectable } from '@nestjs/common';
import { JOURNEYTYPE, JOURNEY } from '../constants/flightConstant';
import { TBO_CredentialsService } from '../loadtbo-db-config/tbo-config.service';
import { ConfigService } from '../../libs/config/config.service';
import { HTTPSTboAPIService } from '../../libs/http-api-service/tbo-api-service';
import { OrderRepositoryService } from '../../libs/database/src/repositories/order.repository';
import { EmailService } from '../../libs/email-service/email.service';
import { PDFGenerateService } from '../../libs/pdf-generate/pdf-generate.service';
import { UserRepositoryService } from '../../libs/database/src';
// import { bookingConfirmationTemplate } from '../../libs/templates/flightTemplate';
// import { bookingConTemplate } from '../../libs/templates/outbondTemplate';
// import { bookConfirmationTemplate } from '../../libs/templates/flightOutbond';
// import { flightTicketPdfTemplate } from '../../libs/templates/ticket';
// import { paymentSuccessTicketFailureTemplate } from '../../libs/templates/ticketfail.template';
import { hotelBookingTemplate } from "../../libs/templates/hotelBookingConfirmation";
import { S3FileService } from '../../libs/S3-Service/s3File.service';
import axios from 'axios';
import * as fs from 'fs';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { tbo_credentials } from '../constants/tboCredentials';
import { cancellationConfirmationTemplate } from '../templates/cancellationTemplate';

@Injectable()
export class HotelService {
    constructor(
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly pdfGenerateService: PDFGenerateService,
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly EmailService: EmailService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
         private readonly s3FileService: S3FileService
    ) {}

    async hotelHandler(order_id, custom_order_id, order_request, user, order_request_second) {
        try {
            // const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const payload = JSON.parse(order_request);
            const extraInfo=JSON.parse(order_request_second);
            console.log('payload: ', payload);
            const userDetails = await this.userRepositoryService.getUserByUserId(user);
            let url = 'https://hotelbooking.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc/rest/Book';

            // making the header
            const username = 'DELP574';
            const password = 'Api@deL5-4@';
            const credentials = Buffer.from(`${username}:${password}`).toString('base64');

            const headers = {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/json',
            };

            let result = await this.httpAPICall(url, payload, headers);
            console.log('Hotel Booking Response: ', result);
            console.log("+++++++++++++++++++++++++++++++++++++++++");
            console.log("New User Details:",userDetails);
            if (result?.BookResult?.ResponseStatus === 1) {
                console.log('Booking Success(result.BookResult):', result.BookResult);
              
                     this.orderRepositoryService.updatePaymentSuccess(order_id,result?.BookResult);

                    //  Sending the confirmtion Email
                   const bookingSuccessTemplate = await hotelBookingTemplate(result?.BookResult,userDetails?.full_name,extraInfo);
                   const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(bookingSuccessTemplate);
                    if (pdfBuffer) {
                                      const ticketPath = `hotel-invoice/${Date.now()}-invoice-${order_id}.pdf`;
                                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                               let pdfUrl=await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                               console.log("PDF Invoice Url: ",pdfUrl);
                                }


                   await this.EmailService.sendEmail(userDetails.email, 'Welcome to Our Service', bookingSuccessTemplate);
                  return { success: true, bookingData: result.BookResult };
            } else {
                console.error('Booking Failed:', result?.BookResult?.Error);
                await this.orderRepositoryService.updatePaymentFail(order_id,result?.BookResult);
                throw new Error(result?.BookResult?.Error?.ErrorMessage || 'Hotel booking failed');
                
            }
        } catch (error) {
            console.error('Error in Hotel Handler', error?.message || error);
              await this.orderRepositoryService.updatePaymentFail(order_id,error?.message);
            throw error;
        }
    }

    async httpAPICall(baseURL: string, payload: object, headers: object) {
        const config = { headers };
        const response$ = this.httpService.post(baseURL, payload, config);

        const result = await firstValueFrom(response$);
        return result.data; // Return only the response data
    }
}
