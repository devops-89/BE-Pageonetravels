import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { ConfigModule } from '../../../../../libs/config/config.module';
import { About, Banner,  DBModule, Faq, Festival, Footer, Offer, TabService, Social,Headers, Testimonial, HeaderRepositoryService } from '../../../../../libs/database/src';
import { ResponseHandlerModule } from '../../../../../libs/response-handler/response-handler.module';
import { AboutService } from './about.service';
import { BannerService } from './banner.service';
import { FaqService } from './faq.service';
import { FestivalService } from './festival.service';
import { TestimonialService } from './testimonial.service';
import { FooterService } from './footer.service';
import { SocialService } from './social.service';
import { OfferService } from './offer.service';
import { TokenValidationMiddleware } from '../../../../../libs/middlewares/authMiddleware';
import { JwtService } from '../../../../../libs/jwt-service/jwt.service';
import { HeaderService } from './header.service';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';

@Module({
    imports: [
        DBModule.forRoot(),
        ConfigModule,
        TypeOrmModule.forFeature([Faq,Banner,About,Festival,Offer, Social, Testimonial,Footer,Headers]),
        ResponseHandlerModule 
    ],
    controllers: [HomeController],
    providers: [HomeService,AboutService,HeaderRepositoryService,BannerService,FaqService,FestivalService,TabService, TestimonialService,FooterService,SocialService,OfferService,TokenValidationMiddleware,JwtService, HeaderService, S3FileService],
})
export class HomeModule {} 
