import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LogoutModule } from './logout/logout.module';
import { HotelierModule } from './hotelier/hotelier.module';

@Module({
  imports: [AuthModule, LogoutModule,HotelierModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
