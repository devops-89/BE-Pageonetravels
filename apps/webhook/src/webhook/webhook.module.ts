import { Module } from '@nestjs/common';
import { DBModule } from '../../../../libs/database/src';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../../../libs/config/config.module';


@Module({
  imports: [
    DBModule.forRoot(),
    ConfigModule,
    TypeOrmModule.forFeature([
        
    ]),
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})


export class WebhookModule {}
