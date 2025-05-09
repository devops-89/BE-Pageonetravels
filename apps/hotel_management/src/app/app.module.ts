import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HotelierModule } from '../hotelier/hotelier.module';

@Module({
    imports: [HotelierModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
