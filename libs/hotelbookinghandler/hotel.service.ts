import { Injectable } from '@nestjs/common';
import { OrderRepositoryService } from '../../libs/database/src/repositories/order.repository';
import { EmailService } from '../../libs/email-service/email.service';
import { PDFGenerateService } from '../../libs/pdf-generate/pdf-generate.service';
import { UserRepositoryService } from '../../libs/database/src';
import { hotelBookingTemplate } from '../../libs/templates/hotelBookingConfirmation';
import { S3FileService } from '../../libs/S3-Service/s3File.service';
import   {TBO_CredentialsService} from '../loadtbo-db-config/tbo-config.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FLIGHTDATA } from '../config/config.interface';

@Injectable()
export class HotelService {
    private tboCredentials:FLIGHTDATA;
    private staticAuthHeader:string;
    private dynamicAuthHeader:string;
    constructor(
        private readonly pdfGenerateService: PDFGenerateService,
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly EmailService: EmailService,

        private readonly httpService: HttpService,
        private readonly s3FileService: S3FileService
    ) {}

    async onModuleInit(){
        this.tboCredentials=await this.tboConfigService.getTBOCredentials();
        const staticUsername = this.tboCredentials.HOTEL_STATIC_USERNAME;
        const staticPassword=  this.tboCredentials.HOTEL_STATIC_PASSWORD;
        const dynamicUsername=this.tboCredentials.HOTEL_DYNAMIC_USERNAME;
        const dynamicPassword=this.tboCredentials.HOTEL_DYNAMIC_PASSWORD;
        this.staticAuthHeader= `Basic ${Buffer.from(`${staticUsername}:${staticPassword}`).toString('base64')}`;
        this.dynamicAuthHeader=`Basic ${Buffer.from(`${dynamicUsername}:${dynamicPassword}`).toString('base64')}`;

    }

    private getHeaders(type:"static" | "dynamic"="dynamic") {
        const authHeader=type==="static"? this.staticAuthHeader : this.dynamicAuthHeader;
        return {
            Authorization: authHeader,
            'Content-Type': 'application/json',
        };
    }



    async hotelHandler(order_id, custom_order_id, order_request, user, order_request_second) {
        try {
            const payload = JSON.parse(order_request);
            const extraInfo = JSON.parse(order_request_second);
            const userDetails = await this.userRepositoryService.getUserByUserId(user);

            const url = this.tboCredentials.HOTEL_BOOK;

            const headers=this.getHeaders("dynamic");

            console.log("hotel booking payload real",payload);
            const result = await this.httpAPICall(url, payload, headers);
            console.log('Hotel Booking Response real:', result);

            //  Step 1: Only handle main booking success/failure
            if (result?.BookResult?.ResponseStatus === 1) {
                console.log('Booking Success:', result.BookResult);

                // Immediately mark booking as success in DB
                await this.orderRepositoryService.updatePaymentSuccess(order_id, result?.BookResult);

                // Step 2: Now handle post-booking tasks independently (non-critical)
                this.handlePostBookingTasks(order_id, result.BookResult, userDetails, extraInfo).catch((err) => console.error('Post-booking task failed:', err.message));

                // Step 3: Return success to API caller immediately
                return { success: true, bookingData: result.BookResult };
            } else {
                console.error('Booking Failed:', result?.BookResult?.Error);
                await this.orderRepositoryService.updatePaymentFail(order_id, result?.BookResult);
                throw new Error(result?.BookResult?.Error?.ErrorMessage || 'Hotel booking failed');
            }
        } catch (error) {
            console.error('Error in Hotel Handler:', error?.message || error);
            await this.orderRepositoryService.updatePaymentFail(order_id, error?.message);
            throw error;
        }
    }

    private async handlePostBookingTasks(order_id, bookResult, userDetails, extraInfo) {
        try {
            const bookingSuccessTemplate = hotelBookingTemplate(bookResult, userDetails?.full_name, extraInfo);
            const pdfBuffer = await this.pdfGenerateService.generateHTMLToPDF(bookingSuccessTemplate);

            await this.EmailService.sendEmail(userDetails.email, 'Hotel Booking Confirmation - Page1Travels', bookingSuccessTemplate);
            console.log('Confirmation email sent');

            if (pdfBuffer) {
                const ticketPath = `hotel-invoice/${Date.now()}-invoice-${order_id}.pdf`;
                const s3Url = await this.s3FileService.s3FileUpload(pdfBuffer, ticketPath);
                await this.orderRepositoryService.updatePdfUrl(order_id, s3Url);
                console.log('PDF uploaded:', s3Url);
            }


        } catch (error) {
            // Don't rethrow — just log it so booking stays successful
            console.error('Post-booking task failed:', error.message || error);
        }
    }

    async httpAPICall(baseURL: string, payload: object, headers: object) {
        const config = { headers };
        const response$ = this.httpService.post(baseURL, payload, config);

        const result = await firstValueFrom(response$);
        return result.data; // Return only the response data
    }
}
