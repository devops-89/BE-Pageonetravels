import { Module } from '@nestjs/common';
import { DBModule } from '../../../../libs/database/src';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../../../libs/config/config.module';
import { FlightService } from '../../../../libs/tickethandler/flight.service';
import { HotelService } from '../../../../libs/hotelbookinghandler/hotel.service';
import   {TBO_CredentialsService} from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { ConfigService } from "../../../../libs/config/config.service";
import { TBOConfigModule } from '../../../../libs/loadtbo-db-config/tbo-config.module';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { EmailService } from '../../../../libs/email-service/email.service';
import {PDFGenerateService} from '../../../../libs/pdf-generate/pdf-generate.service';
import { HttpModule } from '@nestjs/axios';
import {S3Module} from "../../../../libs/S3-Service/s3.module";


@Module({
  imports: [
    DBModule.forRoot(),
    TBOConfigModule.register(),   
    ConfigModule,
    TypeOrmModule.forFeature([
      FlightService,
      ConfigService,
      HotelService,
    ]),
    S3Module.forRoot(),
    ResponseHandlerModule,
    HttpModule
  ],
  controllers: [WebhookController],
  providers: [WebhookService,FlightService,HotelService,TBO_CredentialsService,HTTPSTboAPIService, EmailService,PDFGenerateService],
})


export class WebhookModule {}
