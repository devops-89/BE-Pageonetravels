import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { GenerateTokenService } from '../search-hotel/generateToken.service';
// import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';

@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
