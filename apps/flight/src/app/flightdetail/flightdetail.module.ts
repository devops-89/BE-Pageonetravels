import { Module } from '@nestjs/common';
import { FlightdetailController } from './flightdetail.controller';
import { FlightDetailService } from './flightdetail.service';
import { ConfigModule } from '../../../../../libs/config/config.module';
import { DBModule } from '../../../../../libs/database/src/database.module'
import { ResponseHandlerModule } from '../../../../../libs/response-handler/response-handler.module';
import { TBOConfigModule } from '../../../../../libs/loadtbo-db-config/tbo-config.module';

@Module({
    imports:[
         DBModule.forRoot(),
         ConfigModule,
         ResponseHandlerModule,
         TBOConfigModule.register(),    
    ],
    controllers: [FlightdetailController],
    providers:[FlightDetailService]
})
export class FlightdetailModule {}
