import { Module } from '@nestjs/common';
import { DBModule } from '../../../../libs/database/src';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../../../libs/config/config.module';
import { FlightService } from '../../../../libs/tickethandler/flight.service';
import   {TBO_CredentialsService} from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { ConfigService } from "../../../../libs/config/config.service";
import { TBOConfigModule } from '../../../../libs/loadtbo-db-config/tbo-config.module';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';

@Module({
  imports: [
    DBModule.forRoot(),
    TBOConfigModule.register(),   
    ConfigModule,
    TypeOrmModule.forFeature([
      FlightService,
      ConfigService
    ]),
  ],
  controllers: [WebhookController],
  providers: [WebhookService,FlightService,TBO_CredentialsService,HTTPSTboAPIService],
})


export class WebhookModule {}
