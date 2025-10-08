import { Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RazorpayModule } from '../razorpay/razorpay.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost', 
      port: 6379,       
      ttl: 600,        
    }),
    RazorpayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
