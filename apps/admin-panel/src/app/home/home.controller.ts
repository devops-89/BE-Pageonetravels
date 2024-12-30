import { Body, Controller, Get, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors} from '@nestjs/common';
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
// import { UpdateHeaderDto } from '../../../../../libs/dtos/admin/header.dto';
import {TokenValidationGuard} from '../../../../../libs/middlewares/authMiddleware.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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

@Post('/header')
@UseGuards(TokenValidationGuard)
// @UseInterceptors(FileInterceptor('avatar',{fileFilter:imageFileFilter}))
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'header_logo', maxCount: 1 },
      { name: 'favicon', maxCount: 1 },
    ],
    { fileFilter: imageFileFilter }
  )
)
async addHeader(@Body() body:AddHeaderDto, @UploadedFiles() files , @Req() req: Request, @Res() res:Response ){
    try{  
        const payload: JWTPayload=req['userPayload']; 
        const result = await this.headerService.addHeader(payload,body,files);
        return this.responseHandler.sendSuccessResponse(res, result); 
    }catch(error){     
        console.log("Commission Error..",error );
		return this.responseHandler.sendErrorResponse(res, error);
    }
}



@Get('getheader')
@UseGuards(TokenValidationGuard)
async getHeader(@Res() res:Response){
    try{
        const result = await this.headerService.getHeaderList();
		return this.responseHandler.sendSuccessResponse(res, result);
    }catch(error){
        console.log("Error get Commission",error);
		return this.responseHandler.sendErrorResponse(res, error);
    }
}

// @Post('updateHeader')
// @UseGuards(TokenValidationGuard)
// @UseInterceptors(
//   FileFieldsInterceptor(
//     [
//       { name: 'header_logo', maxCount: 1 },
//       { name: 'favicon', maxCount: 1 },
//     ],
//     { fileFilter: imageFileFilter }
//   )
// )
// async updateHeader(@Body() body:UpdateHeaderDto,@UploadedFiles() files , @Req() req: Request, @Res() res:Response ){
//    try{
//       const payload: JWTPayload=req['userPayload'];
//       const result = await this.headerService.updateHeader();
//    }catch(error){

//    }
// }



}