import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enquiry } from '../../../../libs/database/src/entities';
import { DBModule } from '../../../../libs/database/src';

@Module({
    imports: [
      DBModule.forRoot(),
      TypeOrmModule.forFeature([Enquiry])],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
