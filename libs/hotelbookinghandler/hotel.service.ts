import { Injectable } from '@nestjs/common';
import { JOURNEYTYPE, JOURNEY } from '../constants/flightConstant';
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
        private readonly httpService: HttpService
    ) {}

    async hotelHandler(order_id, custom_order_id, order_request, user, payment) {
        try {
            // const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            const payload = JSON.parse(order_request);
            console.log('payload: ', payload);
            const userDetails = await this.userRepositoryService.getUserByUserId(user);
            let url = 'https://HotelBE.tektravels.com/hotelservice.svc/rest/book/';

            // making the header
            const username = 'Pageone';
            const password = 'Pageone@1234';
            const credentials = Buffer.from(`${username}:${password}`).toString('base64');

            const headers = {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/json',
            };

            let result = await this.httpAPICall(url, payload, headers);
            console.log('Hotel Booking Response: ', result);
            if (result?.BookResult?.ResponseStatus === 1) {
                console.log('Booking Success:', result.BookResult);
            } else {
                console.error('Booking Failed:', result?.BookResult?.Error);
                throw new Error(result?.BookResult?.Error?.ErrorMessage || 'Hotel booking failed');
            }
        } catch (error) {
            console.error('Error in Hotel Handler', error?.message || error);
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
