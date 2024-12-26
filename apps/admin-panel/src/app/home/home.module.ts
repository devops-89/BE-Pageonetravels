import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { ConfigModule } from '../../../../../libs/config/config.module';
import { About, Banner,  DBModule, Faq, Festival, Footer, Offer, Service, Social, Testimonial } from 'libs/database/src';
import { ResponseHandlerModule } from '../../../../../libs/response-handler/response-handler.module';

@Module({
    imports: [
        DBModule.forRoot(),
        ConfigModule,
        TypeOrmModule.forFeature([Faq,Banner,About,Festival,Offer, Social, Testimonial,Footer,Headers,Service]),
        ResponseHandlerModule
    ],
    controllers: [HomeController],
    providers: [HomeService],
})
export class CommissionModule {}
