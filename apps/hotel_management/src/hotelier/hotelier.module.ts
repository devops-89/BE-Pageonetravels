import { Module } from '@nestjs/common';

import { ConfigModule } from '../../../../libs/config/config.module';
import { HotelierController } from './hotelier.controller';
import { HotelierService } from './hotelier.service';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { TransactionManager } from '../../../../libs/database/src/repositories/utils';
import { JwtService } from '../../../../libs/jwt-service/jwt.service';
import { TokenValidationMiddleware } from '../../../../libs/middlewares/authMiddleware';
import { DBModule, Hotel, User, UserRepositoryService } from '../../../../libs/database/src';
import { HotelRepositoryService } from '../../../../libs/database/src/repositories/hotel.repository';

@Module({
    imports: [
        DBModule.forRoot(),
        TypeOrmModule.forFeature([
             User,
             Hotel
        ]),
        ConfigModule,
        ResponseHandlerModule,  
    ],
    controllers: [HotelierController],
    providers: [ TransactionManager,HotelierService,UserRepositoryService,HotelRepositoryService, JwtService, TokenValidationMiddleware],
})


export class HotelierModule {} 
