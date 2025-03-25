import { Module } from '@nestjs/common';
import { ResponseHandlerModule } from '../response-handler/response-handler.module';
import { ConfigModule } from '../../libs/config/config.module';
import { FlightService } from './flight.service';
import   {TBO_CredentialsService} from '../loadtbo-db-config/tbo-config.service';
import { ConfigService } from "../../libs/config/config.service";
import { TBOConfigModule } from '../../libs/loadtbo-db-config/tbo-config.module';
import { HTTPSTboAPIService } from '../../libs/http-api-service/tbo-api-service';
import { OrderRepositoryService } from '../../libs/database/src/repositories/order.repository';

@Module({
  imports:[ConfigModule ,
    TBOConfigModule.register(),   
  ],
  providers: [
    FlightService,
    ConfigService,
    TBO_CredentialsService,
    ResponseHandlerModule,
    HTTPSTboAPIService
    ]
})
export class FlightModule { }

