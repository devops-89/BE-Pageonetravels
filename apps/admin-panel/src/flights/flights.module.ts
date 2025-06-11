import { Module } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { BookingRepositoryService, DBModule } from '../../../../libs/database/src';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
        DBModule.forRoot(),
        TypeOrmModule.forFeature([
             BookingRepositoryService,
        ]),
          
    ],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}
