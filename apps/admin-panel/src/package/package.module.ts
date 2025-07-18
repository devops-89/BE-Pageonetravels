import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../../../libs/config/config.module';
import { PackageController } from './package.controller';
import { PackageService } from './package.services';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { TransactionManager } from '../../../../libs/database/src/repositories/utils';
import { JwtService } from '../../../../libs/jwt-service/jwt.service';
import { TokenValidationMiddleware } from '../../../../libs/middlewares/authMiddleware';
import { Booking, DBModule, User, UserRepositoryService } from '../../../../libs/database/src';
import { PackageCategoryRepositoryService } from '../../../../libs/database/src/repositories/packagecategory.repository';
import { PackageDayRepositoryService } from '../../../../libs/database/src/repositories/packageday.repository';
import { PackageRepositoryService } from '../../../../libs/database/src/repositories/package.repository';
import { PackageCategory } from '../../../../libs/database/src/entities/packageCategory.entity'; // Make sure to import your entity
import { PackageAmenite } from '../../../../libs/database/src/entities/packageAmenite.entity'; // Make sure to import your entity
import { PackageDay } from '../../../../libs/database/src/entities/packageDay.entity'; // Make sure to import your entity
import { Package } from '../../../../libs/database/src/entities/package.entity'; // Make sure to import your entity
import { PackageAmeniteRepositoryService } from '../../../../libs/database/src/repositories/packageamenite.repository';
import { BookingRepositoryService } from '../../../../libs/database/src/repositories/booking.repository';
import {S3Module} from "../../../../libs/S3-Service/s3.module";
@Module({
  imports: [
    DBModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      PackageCategory, // Register your entity here
      PackageAmenite,
      PackageDay,
      Package,
      Booking,
    ]),
    ConfigModule,
    ResponseHandlerModule,
     S3Module.forRoot()
  ],
  controllers: [PackageController],
  providers: [
    TransactionManager,
    PackageService,
    UserRepositoryService,
    PackageCategoryRepositoryService, // Add this provider
    JwtService,
    TokenValidationMiddleware,
    PackageAmeniteRepositoryService,
    PackageDayRepositoryService,
    PackageRepositoryService,
    BookingRepositoryService,
  ],
  exports: [PackageService], // Export if needed by other modules
})
export class PackageModule {}