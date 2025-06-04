import { Body, Controller, Get, Post, Query, Req, Res , UploadedFiles,UseGuards, UseInterceptors } from "@nestjs/common";
import { HotelierService } from './hotelier.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import {LoginDto} from '../../../../libs/dtos/authentication/user.dto';
import { CreateHotelDto } from '../../../../libs/dtos/hotelier/create-hotel.dto';
import { UpdateHotelDto } from '../../../../libs/dtos/hotelier/update-hotel.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../../../../libs/utils/fileUpload';
import {JWTPayload} from '../../../../libs/interfaces/authentication/jwtPayload.interface';
import { CreateHotelRoomDto } from '../../../../libs/dtos/hotelier/hotel-room.dto';
import {TokenValidationGuard} from '../../../../libs/middlewares/authMiddleware.guard';
import { ERROR_CODES } from "../../../../libs/constants/commonConstants";
import { error } from "console";

@Controller('hotelier')
export class HotelierController {
    constructor(
        private readonly hotelierService:HotelierService,
        private readonly responseHandlerService:ResponseHandlerService
    ){}

    @Post('/login')
    async hotelierLogin(@Req() req: Request, @Res() res: Response, @Body() body:LoginDto){
        try{
            const device_type = req.headers['devicetype'];
            const result = await this.hotelierService.loginWithEmail(body, device_type);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        }catch(error){
            console.error("Error in the Search Flight", error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }


    // Add Hotel
    @Post('/add-hotel')
    @UseGuards(TokenValidationGuard)
    @UseInterceptors(
      FileFieldsInterceptor(
        [
          { name: 'main_image', maxCount: 1 },
          { name: 'gallery_images', maxCount: 5 },
        ],
        { fileFilter: imageFileFilter }
      )
    )
    async createHotel(@Req() req:Request,@UploadedFiles() files ,@Res() res:Response,@Body() body:CreateHotelDto){
        try{
            
            const payload: JWTPayload=req['userPayload'];
            if(!payload){
                throw { message: "Please provide a valid Token.", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            if(payload.user_type === "HOTEL"){
                const result = await this.hotelierService.addHotel(payload.reference_id,body);
                return this.responseHandlerService.sendSuccessResponse(res, result);
            }else{
                throw { message: "Please provide a valid Token.", statusCode: ERROR_CODES.BAD_REQUEST };
            }
        }catch(error){
            console.error("Error in the Search Flight", error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    // Update Hotel
    @Post('hotel-update')
    @UseGuards(TokenValidationGuard)
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                {name:'main_image',maxCount:1},
                {name:'gallery_images',maxCount:5}
            ],
            {fileFilter: imageFileFilter}
        )
    )
    async updateHotel(@Res() res:Response,@Req() req:Request,@UploadedFiles() files, @Query('hotel_id') hotel_id: string,@Body() body:UpdateHotelDto){
        try{
            const payload: JWTPayload=req['userPayload'];
            if(!payload){
                throw { message: "Please provide a valid Token.", statusCode: ERROR_CODES.BAD_REQUEST };
            }

            if(payload.user_type === "HOTEL"){
                
                const result = await this.hotelierService.updateHotel(payload.reference_id,hotel_id, body);
                return this.responseHandlerService.sendSuccessResponse(res, result);
            }else{
                throw { message: "Please provide a valid Token.", statusCode: ERROR_CODES.BAD_REQUEST };
            }
        }catch(error){
            console.log("Error in update hotel",error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    @Get('fetch-all-hotel')
    @UseGuards(TokenValidationGuard)
    async getAllHotel(@Req() req:Request,@Res() res:Response){
        try{
            const payload: JWTPayload=req['userPayload'];
            
            if(!payload){
                throw { message: "Please provide a valid Token.", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            if(payload.user_type === "HOTEL"){
                const result = await this.hotelierService.fetchHotelList();
                return this.responseHandlerService.sendSuccessResponse(res, result);
            }else{
                throw { message: "Please provide a valid Token.", statusCode: ERROR_CODES.BAD_REQUEST };
            }
        }catch(error){
            console.log("Error in update hotel",error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    @Get("fetch-hotel")
    @UseGuards(TokenValidationGuard)
    async getHotelById(@Req() req:Request,@Res() res:Response,@Query('hotel_id') hotel_id: string){
        try{
           const payload: JWTPayload=req['userPayload'];
            
            if(!payload){
                throw { message: "Please provide a valid Token.", statusCode: ERROR_CODES.BAD_REQUEST };
            }

            if(payload.user_type === "HOTEL"){
                const result = await this.hotelierService.fetchHotelById(hotel_id);
                return this.responseHandlerService.sendSuccessResponse(res, result);
            }else{
                throw { message: "Please provide a valid Token.", statusCode: ERROR_CODES.BAD_REQUEST };
            }
        }catch(error){
            console.log("Error in Fetch hotel",error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }



    // Add-Room
    @Post('/add-room')
    @UseGuards(TokenValidationGuard)
    @UseInterceptors(
      FileFieldsInterceptor(
        [
          { name: 'main_image', maxCount: 1 },
          { name: 'gallery_images', maxCount: 5 },
        ],
        { fileFilter: imageFileFilter }
      )
    )
    async createRoom(@Req() req:Request,@UploadedFiles() files  ,@Res() res:Response,@Body() body:CreateHotelRoomDto){
        try{
            const payload: JWTPayload=req['userPayload'];
            if(!payload){
                throw { message: "Please provide a valid Token.", statusCode: ERROR_CODES.BAD_REQUEST };
            }

            if(payload.user_type === "HOTEL"){
                const result = await this.hotelierService.addRoom(body);
                return this.responseHandlerService.sendSuccessResponse(res, result);
            }else{
                throw { message: "Please provide a valid Token.", statusCode: ERROR_CODES.BAD_REQUEST };
            }
        }catch(error){
            console.log(">>> >> >",error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }


    // Update-Room
    @Post('update-room')
    @UseGuards(TokenValidationGuard)
    @UseInterceptors(
      FileFieldsInterceptor(
        [
          { name: 'main_image', maxCount: 1 },
          { name: 'gallery_images', maxCount: 5 },
        ],
        { fileFilter: imageFileFilter }
      )
    )
    async updateRoom(@Req() req:Request,@UploadedFiles() files, @Res() res:Response, @Body() body:any,@Query('room_id') room_id: string){
        try{
            console.log(">>>> >>> >> >",body);
            console.log(">>>> >>> >> >",room_id);
        }catch(error){
            console.log(">>>>>>>>>",error);
            return this.responseHandlerService.sendErrorResponse(res,error);
        }
    }

}






