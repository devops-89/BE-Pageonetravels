import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserStatsController } from './user-stats.controller';
import { UserStatsService } from './user-stats.service';
import { UserStatsRepositoryService } from '../../../../../libs/database/src/repositories/user-stats.repository';
import { User, Hotel, Booking, Enquiry, Package } from '../../../../../libs/database/src/entities';
import { HotelStatsRepositoryService } from '../../../../../libs/database/src/repositories/hotel-stats.repository';
import { FlightStatsRepositoryService } from '../../../../../libs/database/src/repositories/flight-stats.repository';
import { PackageStatsRepositoryService } from '../../../../../libs/database/src/repositories/package-stats.repository';
import { CabStatsRepositoryService } from '../../../../../libs/database/src/repositories/cab-stats.repository';
import { ResponseHandlerModule } from '../../../../../libs/response-handler/response-handler.module';
import { DBModule } from '../../../../../libs/database/src/database.module';
import { ConfigModule } from '../../../../../libs/config/config.module';
import { TokenValidationMiddleware } from '../../../../../libs/middlewares/authMiddleware';
import { TokenValidationGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
import { JwtService } from '../../../../../libs/jwt-service/jwt.service';

@Module({
  imports: [
    DBModule.forRoot(),
    ResponseHandlerModule,
    ConfigModule,
    TypeOrmModule.forFeature([User, Hotel, Booking, Enquiry, Package]),
  ],
  controllers: [UserStatsController],
  providers: [
    UserStatsService,
    UserStatsRepositoryService,
    HotelStatsRepositoryService,
    FlightStatsRepositoryService,
    PackageStatsRepositoryService,
    CabStatsRepositoryService,
    TokenValidationMiddleware,
    TokenValidationGuard,
    JwtService,
  ],
  exports: [UserStatsService],
})
export class UserStatsModule {}
