import { Module } from '@nestjs/common';
import { FlightdetailController } from './flightdetail.controller';
import { FlightDetailService } from './flightdetail.service';

@Module({
    controllers: [FlightdetailController],
    providers:[FlightDetailService]
})
export class FlightdetailModule {}
