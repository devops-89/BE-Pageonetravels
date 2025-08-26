import { CreateHotelRoomDto } from '../../../../libs/dtos/hotelier/hotelier-room-type.dto';
import { Body, Controller, Post, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { HotelierRoomTypesService } from './hotelier-room-types.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../../../../libs/utils/fileUpload';
import { JWTPayload } from '../../../../libs/interfaces/authentication/jwtPayload.interface';
import { TokenValidationGuard } from '../../../../libs/middlewares/authMiddleware.guard';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { GenerateInventoryDto } from '../../../../libs/dtos/hotelier/hotelier-inventory.dto';
@Controller('hotelier-room-types')
export class HotelierRoomTypesController {
    constructor(private readonly hotelierService: HotelierRoomTypesService, private readonly responseHandlerService: ResponseHandlerService) {}
    // // Add-Room
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
    async createRoom(@Req() req: Request, @UploadedFiles() files, @Res() res: Response, @Body() body: CreateHotelRoomDto) {
        try {
            const payload: JWTPayload = req['userPayload'];
            if (!payload) {
                throw { message: 'Please provide a valid Token.', statusCode: ERROR_CODES.BAD_REQUEST };
            }
            if (payload.user_type === 'HOTEL') {
                const result = await this.hotelierService.addRoom(body);
                return this.responseHandlerService.sendSuccessResponse(res, result);
            } else {
                throw { message: 'Please provide a valid Token.', statusCode: ERROR_CODES.BAD_REQUEST };
            }
        } catch (error) {
            console.log('>>> >> >', error);
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
    async updateRoom(@Req() req: Request, @UploadedFiles() files, @Res() res: Response, @Body() body: any, @Query('room_id') room_id: string) {
        try {
            console.log('>>>> >>> >> >', body);
            console.log('>>>> >>> >> >', room_id);
        } catch (error) {
            console.log('>>>>>>>>>', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }
    @Post('generate-inventory')
    @UseGuards(TokenValidationGuard)
    async generate(@Req() req: Request, @Body() body: GenerateInventoryDto, @Res() res: Response) {
        try {
            const payload: JWTPayload = req['userPayload'];
            if (!payload) {
                throw { message: 'Please provide a valid Token.', statusCode: ERROR_CODES.BAD_REQUEST };
            }
            if (!body.roomTypeId || !body.startDate || !body.days) {
                throw { message: 'Please provide all required fields.', statusCode: ERROR_CODES.BAD_REQUEST };
            }
            const result = await this.hotelierService.generateInventory(body.roomTypeId, body.startDate, body.days);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
        return this.responseHandlerService.sendErrorResponse(res, error);
    }
    }
}






