import { Module } from '@nestjs/common';
import { ResponseHandlerModule } from '../response-handler/response-handler.module';
import { ConfigModule } from '../../libs/config/config.module';

//import { FlightController } from './flight.controller';
import   {TBO_CredentialsService} from '../loadtbo-db-config/tbo-config.service';
import { ConfigService } from "../../libs/config/config.service";
import { TBOConfigModule } from '../../libs/loadtbo-db-config/tbo-config.module';
import { HTTPSTboAPIService } from '../../libs/http-api-service/tbo-api-service';
import { OrderRepositoryService } from '../../libs/database/src/repositories/order.repository';
import { EmailService } from '../../libs/email-service/email.service';
import {PDFGenerateService} from '../../libs/pdf-generate/pdf-generate.service';
import { DBModule } from '../../libs/database/src/database.module';
import { PackageService } from './package.service';
import { PackageRepositoryService } from '../database/src';
@Module({
  imports:[
    ConfigModule ,
    TBOConfigModule.register(),
    DBModule.forRoot(),
  ],
  controllers: [],
  providers: [
    PackageService,
    ConfigService,
    TBO_CredentialsService,
    ResponseHandlerModule,
    HTTPSTboAPIService,
    PDFGenerateService,
    EmailService
    ]
})
export class FlightModule { }

