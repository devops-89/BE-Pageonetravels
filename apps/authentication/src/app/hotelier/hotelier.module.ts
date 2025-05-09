import { Module } from '@nestjs/common';
import { HotelierController } from './hotelier.controller';
import { HotelierService } from './hotelier.service';
import { DBModule, LoginSession, User, UserRepositoryService } from "../../../../../libs/database/src";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from '../../../../../libs/config/config.module';
import { ResponseHandlerModule } from '../../../../../libs/response-handler/response-handler.module';


@Module({
  imports: [
    DBModule.forRoot(),
    ConfigModule,
    ResponseHandlerModule,
    TypeOrmModule.forFeature([UserRepositoryService, User, LoginSession]), 
  ],
  controllers: [HotelierController],
  providers: [HotelierService],
})
export class HotelierModule {}  


