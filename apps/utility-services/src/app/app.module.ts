import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../../../libs/config/config.module';
import { Enquiry } from '../../../../libs/database/src/entities';
import { DBModule } from '../../../../libs/database/src';
import { ConfigService } from '../../../../libs/config/config.service';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module'; // Adjust path as needed
import { EnquiryRepositoryService } from '../../../../libs/database/src/repositories/enquiry-repository';
import { EmailService } from '../../../../libs/email-service/email.service';
@Module({
    imports: [
      DBModule.forRoot(),
      ConfigModule,
      TypeOrmModule.forFeature([Enquiry,EnquiryRepositoryService,ConfigService]),
      ResponseHandlerModule],
    controllers: [AppController],
    providers: [AppService, EmailService],
})
export class AppModule {}
