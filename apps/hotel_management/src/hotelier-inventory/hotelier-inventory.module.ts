// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Module } from '@nestjs/common';
import { HotelierInventoryController } from './hotelier-inventory.controller';
import { HotelierInventoryService } from './hotelier-inventory.service';
import { ConfigModule } from '../../../../libs/config/config.module';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { TransactionManager } from '../../../../libs/database/src/repositories/utils';
import { JwtService } from '../../../../libs/jwt-service/jwt.service';
import { TokenValidationMiddleware } from '../../../../libs/middlewares/authMiddleware';
import { DBModule, HotelierInventoryRepositoryService, RoomInventory, User, UserRepositoryService,HotelRoomTypes, HotelierRoomTypesRepositoryService } from '../../../../libs/database/src';
// Duplicate import removed: HotelInventoryRepositoryService is already imported above.
@Module({
    imports: [DBModule.forRoot(), TypeOrmModule.forFeature([User, RoomInventory, HotelRoomTypes]), ConfigModule, ResponseHandlerModule],
    controllers: [HotelierInventoryController],
    providers: [HotelierInventoryService, HotelierInventoryRepositoryService,HotelierRoomTypesRepositoryService , TransactionManager, UserRepositoryService, JwtService, TokenValidationMiddleware],
})
export class HotelierInventoryModule {}