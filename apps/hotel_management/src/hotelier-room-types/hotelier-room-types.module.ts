import { Module } from '@nestjs/common';
import { ConfigModule } from '../../../../libs/config/config.module';
import { HotelierRoomTypesService } from './hotelier-room-types.service';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { TransactionManager } from '../../../../libs/database/src/repositories/utils';
import { JwtService } from '../../../../libs/jwt-service/jwt.service';
import { TokenValidationMiddleware } from '../../../../libs/middlewares/authMiddleware';
import { DBModule, HotelRoomTypes, User, UserRepositoryService } from '../../../../libs/database/src';
import { HotelierRoomTypesController } from './hotelier-room-types.controller';
@Module({
    imports: [DBModule.forRoot(), TypeOrmModule.forFeature([User, HotelRoomTypes]), ConfigModule, ResponseHandlerModule],
    controllers: [HotelierRoomTypesController],
    providers: [TransactionManager, HotelierRoomTypesService, UserRepositoryService, JwtService, TokenValidationMiddleware],
})
export class HotelierRoomTypesModule {}