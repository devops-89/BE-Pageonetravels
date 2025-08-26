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
import { HotelierRepositoryService } from '../../../../libs/database/src/repositories/hotel.repository';
import {S3Module} from "../../../../libs/S3-Service/s3.module";


@Module({
    imports: [
        DBModule.forRoot(),
        TypeOrmModule.forFeature([
             User,
             Hotel
        ]),
        ConfigModule,
        ResponseHandlerModule,
        S3Module.forRoot()
    ],
    controllers: [HotelierController],
    providers: [ TransactionManager,HotelierService,UserRepositoryService,HotelierRepositoryService, JwtService, TokenValidationMiddleware],
})
export class HotelierModule {}