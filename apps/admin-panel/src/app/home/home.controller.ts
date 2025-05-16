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
import { AddAboutDto, UpdateAboutDto } from '../../../../../libs/dtos/admin/about.dto';
import { AddSocialDto, UpdateSocialDto } from '../../../../../libs/dtos/admin/social.dto';
import { AddHeaderDto } from '../../../../../libs/dtos/admin/header.dto';
import { AddFooterDto, UpdateFooterDto } from '../../../../../libs/dtos/admin/footer.dto';
import { AddFaqDto, UpdateFaqDto } from '../../../../../libs/dtos/admin/faq.dto';
import { AddTestimonialDto, UpdateTestimonialDto } from '../../../../../libs/dtos/admin/testimonial.dto';
import { AddOfferDto, UpdateOfferDto } from '../../../../../libs/dtos/admin/offer.dto';
import { AddBannerDto, UpdateBannerDto } from '../../../../../libs/dtos/admin/banner.dto';
import { AddFestivalDto, UpdateFestivalDto } from '../../../../../libs/dtos/admin/festival.dto';
import { AddServiceDto, UpdateServiceDto } from '../../../../../libs/dtos/admin/service.dto';
import { UpdateHeaderDto } from '../../../../../libs/dtos/admin/header.dto';
import {TokenValidationGuard} from '../../../../../libs/middlewares/authMiddleware.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../../../../../libs/utils/fileUpload';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { TabService } from './tab.service';


@Controller('home')
export class HomeController {  
constructor(
private readonly aboutService : AboutService,
private readonly footerService : FooterService,
private readonly bannerService : BannerService,
private readonly responseHandler : ResponseHandlerService,
private readonly festivalService : FestivalService,
private readonly faqService : FaqService,
private readonly tabService : TabService,
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
        console.log("Error get Header",error);
		    return this.responseHandler.sendErrorResponse(res, error);
    }
}

@Post('updateHeader') 
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'header_logo', maxCount: 1 },
      { name: 'favicon', maxCount: 1 },
    ],
    { fileFilter: imageFileFilter }
  )
)
async updateHeader(@Body() body:UpdateHeaderDto,@UploadedFiles() files , @Req() req: Request, @Res() res:Response ){
   try{
      const payload: JWTPayload=req['userPayload'];
      const result =  await this.headerService.updateHeader(payload,body,files);
      return this.responseHandler.sendSuccessResponse(res, result);
   }catch(error){
        console.log("Error get Header",error);
		    return this.responseHandler.sendErrorResponse(res, error);
   }
}

// Banner API - Add Banner


@Post('/banner')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'banner_image', maxCount: 5 }
    ],
    { fileFilter: imageFileFilter }
  )
)
async addBanner(@Body() body: AddBannerDto,@UploadedFiles() files, @Req() req: Request, @Res() res:Response)
{
  try{ 
      const payload: JWTPayload=req['userPayload'];
      const result = await this.bannerService.addBanner(payload,body,files);
      return this.responseHandler.sendSuccessResponse(res,result);
  }catch(error){ 
    console.log("Banner Error :..", error); 
    return this.responseHandler.sendErrorResponse(res,error); 
  }
}

// Banner API - Get Banner

@Get('banner-list')
@UseGuards(TokenValidationGuard)
async getBanner(@Res() res:Response){
  try{
      const result = await this.bannerService.getBannerList();
      return this.responseHandler.sendSuccessResponse(res,result);
  }catch(error){
    console.log("Error get Header",error);
    return this.responseHandler.sendErrorResponse(res,error);
  }
}


// Banner API - Update Banner

@Post('updateBanner')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'banner_image', maxCount: 5 }
    ],
    { fileFilter: imageFileFilter }
  )
)
async updateBanner(@Body() body:UpdateBannerDto,@UploadedFiles() files, @Req() req: Request,@Res() res:Response){
    try{
      const payload: JWTPayload=req['userPayload']; 
      const result = await this.bannerService.updateBanner(payload,body,files);
      return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
      console.log("Error Update Banner",error);
      return this.responseHandler.sendErrorResponse(res,error);
    }
}

//********** Banner API - End Banner     *******




// Service API - Add Service

@Post('/service')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'service_image', maxCount: 1 }
    ],
    { fileFilter: imageFileFilter }
  )
)
async addService(@Body() body:AddServiceDto, @UploadedFiles() files, @Req() req:Request,@Res() res:Response){
    try{ 
      console.log(files);
          const payload: JWTPayload=req['userPayload'];
          console.log(payload);
          const result =  await this.tabService.addService(payload,body,files);
          return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
          console.log("Service Error..",error );
          return this.responseHandler.sendErrorResponse(res,error);
    }
}

// Service API - List Service

@Get('service-list')
@UseGuards(TokenValidationGuard)
async getServicelist(@Res() res:Response){
  try{
    const result = await this.tabService.getServiceList();
    return this.responseHandler.sendSuccessResponse(res,result);
  }catch(error){
    console.log('Error get Service List',error);
    return this.responseHandler.sendErrorResponse(res,error);
  }
}

// Service API - Update Service

@Post('update-service')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      {name: 'service_image',maxCount:1}
    ],
    {fileFilter:  imageFileFilter}
  )
)
async updateService(@Body() body:UpdateServiceDto,@UploadedFiles() files, @Req() req: Request,@Res() res:Response){
  try{
    const payload: JWTPayload = req['userPayload'];
    const result = await this.tabService.updateService(payload,body,files);
    return this.responseHandler.sendSuccessResponse(res,result);
  }catch(error){
    console.log("Error Update Service Error",error);
    return this.responseHandler.sendErrorResponse(res,error);
  }
}

//********** Sevice API - End Service     *******




//********** Festival API - Start Service     *******

// Festival API - Add Festival

@Post('/festival')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      {name:'festival_image', maxCount : 1 }
    ],
    { fileFilter: imageFileFilter }
  )
)
async addFestival(@Body() body:AddFestivalDto, @UploadedFiles() files,@Req() req:Request, @Res() res:Response){
  try{
        const payload: JWTPayload = req['userPayload'];
        console.log(payload);
        const result = await this.festivalService.addFestival(payload,body,files);
        return this.responseHandler.sendSuccessResponse(res,result);
  }catch(error){ 
        console.log("Error Add Fastival Error",error);
        return this.responseHandler.sendErrorResponse(res,error);
  }
}

// Festival API - List Festival

@Get('festival-list')
@UseGuards(TokenValidationGuard)
async getFestivalList(@Res() res:Response){
  try{
    const result = await this.festivalService.getFestivalList();
    return this.responseHandler.sendSuccessResponse(res,result);
  }catch(error){
    console.log('Error get Service List',error);
    return this.responseHandler.sendErrorResponse(res,error);
  }
}

// Festival API - Update Festival

@Post('update-festival')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      {name: 'festival_image',maxCount:1}
    ],
    {fileFilter: imageFileFilter}
  )
)
async updateFestival(@Body() body:UpdateFestivalDto,@UploadedFiles() files, @Req() req:Request,@Res() res:Response){
  try{
      const payload: JWTPayload = req['userPayload'];
      const result = await this.festivalService.updateFestival(payload,body,files);
      return this.responseHandler.sendSuccessResponse(res,result);
  }catch(error){
      console.log("Error Update Festival Error", error);
      return this.responseHandler.sendErrorResponse(res,error);
  }
}


//********** Festival API - End Service     *******



//********** Offer API - Start Service     *******

// Offer API - Add Offer

@Post('/offer')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      {name: 'offer_image',maxCount : 4}
    ],
    {fileFilter: imageFileFilter}
  )
)
async addOffer(@Body() body:AddOfferDto,@UploadedFiles() files,@Req() req:Request,@Res() res:Response){
  try{ 
    const payload: JWTPayload = req['userPayload'];
    // console.log(payload);
    const result =  await this.offerService.addOffer(payload,body,files);
    return this.responseHandler.sendSuccessResponse(res,result);
  }catch(error){
    console.log("Error Add Offer Error",error);
    return this.responseHandler.sendErrorResponse(res,error);
  }
}


// Offer API - List Offer

@Get('offer-list')
@UseGuards(TokenValidationGuard)
async getOfferList(@Res() res:Response){
    try{
      const result = await this.offerService.getOfferList();
      return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
      console.log('Error get Offer List',error);
      return this.responseHandler.sendSuccessResponse(res,error);
    }
}

// Offer API - Update Offer

@Post('update-offer')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      {name:'offer_image',maxCount:1}
    ],
    {fileFilter: imageFileFilter}
  )
)
async updateOffer(@Body() body:UpdateOfferDto,@UploadedFiles() files,@Req() req:Request,@Res() res:Response){
  try{
    const payload: JWTPayload = req['userPayload'];
    const result = await this.offerService.updateOffer(payload,body,files);
    console.log(result);
    return this.responseHandler.sendSuccessResponse(res,result);
  }catch(error){
    console.log("Error Update Offer Error : ",error);
    return this.responseHandler.sendErrorResponse(res,error);
  }
}

//********** Offer API - End Service     ******* 


//********** Testimonial API - Start Service     *******

// Testimonial API - add Testimonial

@Post('/testimonial')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'testimonial_image', maxCount : 1 }
    ],
    {fileFilter : imageFileFilter}
  )
)
async addTestimonial(@Body() body:AddTestimonialDto,@UploadedFiles() files,@Req() req:Request, @Res() res:Response){
  try{
      const payload: JWTPayload = req['userPayload'];
      const result = await this.testimonialService.addTestimonial(payload,body,files);
      return this.responseHandler.sendSuccessResponse(res,result);
  }catch(error){
      console.log("Error Add offer Error",error);
      return this.responseHandler.sendErrorResponse(res,error);
  }
}


// Testimonial API - list Testimonial

@Get("testimonial-list")
@UseGuards(TokenValidationGuard)
async getTestimonialList(@Res() res:Response){
    try{
        const result = await this.testimonialService.getTestimonialList();
        return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
        console.log('Error get Testimonial List',error);
        return this.responseHandler.sendErrorResponse(res,error);
    }
}

// Testimonial API - Update Testimonial


@Post('update-testimonial')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      {name:"testimonial_image",maxCount:1}
    ],
    {fileFilter: imageFileFilter}
  )
)
async updateTestimonial(@Body() body:UpdateTestimonialDto,@UploadedFiles() files,@Req() req:Request,@Res() res:Response){
      try{
        const payload : JWTPayload = req['userPayload'];
        const result = await  this.testimonialService.updateTestimonial(payload,body,files)
        return this.responseHandler.sendSuccessResponse(res,result);
      }catch(error){
        console.log("Update Testimonial Error : ",error);
        return this.responseHandler.sendErrorResponse(res,error);
      }
}



//********** Testimonial API - End Service     *******



//********** About API - Start About     *******

// About API - add About

@Post('/about')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      {name:'about_image',maxCount:2}
    ],
    {fileFilter : imageFileFilter}
  )
)
async addAbout(@Body() body:AddAboutDto,@UploadedFiles() files,@Req() req:Request,@Res() res:Response){
    try{
      const payload:JWTPayload = req['userPayload'];
      const result = await this.aboutService.addAbout(payload,body,files);
      return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
      console.error('Error inserting About',error);
      return this.responseHandler.sendErrorResponse(res,error);
    }
}


// About API - list About

@Get("about-list")
@UseGuards(TokenValidationGuard)
async getAboutList(@Res() res:Response){
  try{
    const result = await this.aboutService.getAboutList();
    return this.responseHandler.sendSuccessResponse(res,result);
  }catch(error){
    console.log("Error get About List",error);
    return this.responseHandler.sendErrorResponse(res,error);
  }
}

// About API - Update About

@Post('update-about')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      {name:"about_image",maxCount:2}
    ],
    {fileFilter: imageFileFilter}
  )
)
async updateAbout(@Body() body:UpdateAboutDto,@UploadedFiles() files,@Req() req:Request,@Res() res:Response){
    try{
      const payload : JWTPayload = req['userPayload'];
      const result = await this.aboutService.updateAbout(payload,body,files);
      return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
      console.log("Update About Error : ",error);
      return this.responseHandler.sendErrorResponse(res,error);
    }
}

//********** About API - End About     *******



//********** FAQ API - Start FAQ     *******

// FAQ API - Add FAQ

@Post('/faq')
@UseGuards(TokenValidationGuard)
async addFaq(@Body() body:AddFaqDto,@Res() res:Response,@Req() req:Request){
    try{
      const payload:JWTPayload = req['userPayload'];
      const result = await this.faqService.addFaq(payload,body);
      return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
      console.log('Error inserting FAQ',error);
      return this.responseHandler.sendErrorResponse(res,error)
    }
}

// FAQ API - List FAQ

@Get('faq-list')
@UseGuards(TokenValidationGuard)
async getFaqList(@Res() res:Response){
    try{
      const result = await this.faqService.getFaqList();
      return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
      console.log('Error get FAQ List',error);
      return this.responseHandler.sendErrorResponse(res,error);
    }
}

// FAQ API - Update FAQ

@Post('update-faq')
@UseGuards(TokenValidationGuard)
async updateFaq(@Body() body:UpdateFaqDto,@Res() res:Response, @Req() req:Request){
    try{
      const payload: JWTPayload = req['userPayload'];
      const result = await this.faqService.updateFaq(payload, body);

       return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
      console.log("Update Faq Error",error);
      return this.responseHandler.sendErrorResponse(res,error)
    }
}


//********** FAQ API - End FAQ     *******


//********** Social API - Start Social     *******

// Social API - Add Social

@Post('/social')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      {name:"icon_image",maxCount:1}
    ],
    {fileFilter : imageFileFilter}
  )
)
async addSocial(@Body() body:AddSocialDto,@UploadedFiles() files,@Res() res:Response, @Req() req:Request){
      try{
        const payload : JWTPayload = req['userPayload'];
        const result = await this.socialService.addSocial(payload,body,files);
        return this.responseHandler.sendSuccessResponse(res,result);
      }catch(error){
        console.log('Error inserting Social',error)
        return this.responseHandler.sendErrorResponse(res,error);
      }
}

// Social API - List Social

@Get('/social-list')
@UseGuards(TokenValidationGuard)
async getSocialList(@Res() res:Response){
    try{
      const result = await this.socialService.getSocialList();
      return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
      console.log('Error get Social List',error);
      return this.responseHandler.sendErrorResponse(res,error);
    }
}

// Social API - Update Social

@Post('update-social')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      {name:'icon_image',maxCount:2}
    ],
    {fileFilter : imageFileFilter}
  )
)
async updateSocial(@Body() body:UpdateSocialDto,@UploadedFiles() files,@Req() req:Request,@Res() res:Response){
    try{
        const payload : JWTPayload = req['userPayload'];
        const result = await this.socialService.updateSocialData(payload,body,files);
        return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
        console.log("Update Social Error",error)
        return this.responseHandler.sendErrorResponse(res,error);
    }
}


//********** Social API - End Social     *******

//********** Footer API - Start Footer     *******

// Footer API - Add Footer

@Post('/footer')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      {name:'footer_image',maxCount:1}
    ],
    {fileFilter:imageFileFilter}
  )
)
async addFooter(@Body() body:AddFooterDto,@UploadedFiles() files,@Res() res:Response,@Req() req:Request){
    try{
        const payload : JWTPayload = req['userPayload'];
        const result = await this.footerService.addFooterData(payload,body,files);
        return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){ 
        console.log('Error Inserting Footer',error);
        return this.responseHandler.sendErrorResponse(res,error);
    }
}

// Footer API - List Footer

@Get('/footer-list')
@UseGuards(TokenValidationGuard)
async getFooterList(@Res() res:Response){
      try{
          const result = await this.footerService.getFooter();
          return this.responseHandler.sendSuccessResponse(res,result);
      }catch(error){
          console.log('Error get Social List',error);
          return this.responseHandler.sendErrorResponse(res,error);
      }
}

// Footer API - Update Footer

@Post('update-footer')
@UseGuards(TokenValidationGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      {name:'footer_image', maxCount:1}
    ],
    {fileFilter : imageFileFilter}
  )
)
async updateFooter(@Body() body:UpdateFooterDto,@UploadedFiles() files,@Req() req:Request, @Res() res:Response){
    try{
      const payload : JWTPayload = req['userPayload'];
      const result = await this.footerService.updateFooterData(payload,body,files);
      return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
      console.log("Update Footer Error",error);
      return this.responseHandler.sendErrorResponse(res,error);
    }
}


//********** Footer API - End Footer     *******



}