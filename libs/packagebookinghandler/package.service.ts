import { Injectable,NotFoundException } from '@nestjs/common';
import { JOURNEYTYPE, JOURNEY } from '../constants/flightConstant';
import { TBO_CredentialsService } from '../loadtbo-db-config/tbo-config.service';
import { ConfigService } from '../config/config.service';
import { HTTPSTboAPIService } from '../http-api-service/tbo-api-service';
import { OrderRepositoryService } from '../database/src/repositories/order.repository';
import { EmailService } from '../email-service/email.service';
import { PDFGenerateService } from '../pdf-generate/pdf-generate.service';
import { UserRepositoryService } from '../database/src';
import { PackageBookingRepositoryService } from '../database/src';
import { PackageRepositoryService } from '../database/src';

import { HttpService } from '@nestjs/axios';

import { CreatePackageBookingDto } from 'libs/dtos/package/package-booking.dto';
import { BookingStatus } from '../database/src';

@Injectable()
export class PackageService {
    constructor(
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly pdfGenerateService: PDFGenerateService,
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly packageRepositoryService: PackageRepositoryService,
        private readonly packageBookingRepositoryService:PackageBookingRepositoryService,
   
        private readonly EmailService: EmailService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {}

 async createPackageBooking(
    bookingDto: CreatePackageBookingDto,
  ) {
    try {
      const pkg = await this.packageRepositoryService.getPackageById(
        bookingDto.packageId,
      );
      if (!pkg) {
        throw new NotFoundException('Package not found');
      }

      const user = await this.userRepositoryService.getUserByUserId(bookingDto.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const bookingData = {
        package: pkg,
        userId:user.id,
        title: bookingDto.title,
        first_name: bookingDto.first_name,
        last_name: bookingDto.last_name,
        DOB: bookingDto.DOB,
        passport_number: bookingDto.passport_number,
        passport_expiry: bookingDto.passport_expiry,
        email: bookingDto.email,
        mealType: bookingDto.mealType,
        status: BookingStatus.PENDING,
      };

      const booking =
        await this.packageBookingRepositoryService.createPackageBooking(
          bookingData,
        );

      return {
        message: 'Package booked successfully.',
        data: booking,
      };
    } catch (error) {
      console.log('Book Package Service Error', error);
      throw error;
    }
  }


    
}
