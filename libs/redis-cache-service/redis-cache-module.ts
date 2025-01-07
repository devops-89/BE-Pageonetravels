import { Module } from '@nestjs/common';
import { ConfigModule } from 'libs/config/config.module';
import { Setting } from '../database/src';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheService } from './redis-cache-service';

@Module({
    imports: [
    ],
    controllers: [],
    providers: [RedisCacheService],
    exports: [RedisCacheService]
  })
  export class RedisCacheServiceModule {}