import { Body, Controller, Post, Req, Res,UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import { AboutService } from './about.service';
import { FooterService } from './footer.service';
import { FaqService } from './faq.service';
import { BannerService } from './banner.service';
import { FestivalService } from './festival.service';
import { HeaderService } from './header.service';
import { OfferService } from './offer.service';
import { HomeService } from './home.service';
import {JWTPayload} from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { SocialService } from './social.service';
import { TestimonialService } from './testimonial.service';
import { AddHeaderDto } from '../../../../../libs/dtos/admin/header.dto';
import {TokenValidationGuard} from '../../../../../libs/middlewares/authMiddleware.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../../../../../libs/utils/fileUpload';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';

@Controller('home')
export class HomeController {
constructor(
private readonly aboutService : AboutService,
private readonly footerService : FooterService,
private readonly bannerService : BannerService,
private readonly responseHandler : ResponseHandlerService,
private readonly festivalService : FestivalService,
private readonly faqService : FaqService,
private readonly headerService : HeaderService,
private readonly offerService : OfferService,
private readonly homeService : HomeService,
private readonly socialService : SocialService,
private readonly testimonialService : TestimonialService,
){}

//Header API

@Post('header_logo')
@UseGuards(TokenValidationGuard)
@UseInterceptors(FileInterceptor('avatar',{fileFilter:imageFileFilter}))
async addHeader(@Body() body:AddHeaderDto, @UploadedFile() file , @Req() req: Request, @Res() res:Response ){
    try{
        const payload: JWTPayload=req['userPayload'];
        const result = await this.headerService.addHeader(payload,body,file);
        return this.responseHandler.sendSuccessResponse(res, result); 
    }catch(error){
        console.log("Commission Error..",error );
		return this.responseHandler.sendErrorResponse(res, error);
    }
}

}