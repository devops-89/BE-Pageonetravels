import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enquiry } from '../../../../libs/database/src/entities';
import { DBModule } from '../../../../libs/database/src';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module'; // Adjust path as needed

@Module({
    imports: [
      DBModule.forRoot(),
      TypeOrmModule.forFeature([Enquiry]),
      ResponseHandlerModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
