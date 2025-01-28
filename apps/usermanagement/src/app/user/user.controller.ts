import { Body, Controller, Get, Param, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { Request, Response } from 'express';
import { UpdatePersonalDetailDto, UserFilterDto } from '../../../../../libs/dtos/authentication/user.dto';
import { PaginationDto } from '../../../../../libs/dtos/authentication/user.dto';
import { InsertAddressDto } from '../../../../../libs/dtos/authentication/address.dto';

import { UserService } from './user.service';
import { TokenValidationGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { CheckIfAdminGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
import { USER_ACCOUNT_STATUS } from '../../../../../libs/constants/autenticationConstants/userContants';
import { imageFileFilter } from '../../../../../libs/utils/fileUpload';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseHandler: ResponseHandlerService,
  ) { }

  @Get('/get_user_list')
  @UseGuards(TokenValidationGuard, CheckIfAdminGuard)
  async getUsers(@Res() res: Response, @Req() req: Request, @Query() query: UserFilterDto & PaginationDto) {
    try { 
      const pagination = { page: query.page || 1, limit: query.limit || 10 };
      const filters = { user_type: query.user_type, search: query.search, status: query.status, };
      const result = await this.userService.getUsersByGroup(filters, pagination);
      return this.responseHandler.sendSuccessResponse(res, result)
    } catch (error) {
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }

  @Post('/update_status/:user_id')
  @UseGuards(TokenValidationGuard, CheckIfAdminGuard)
  async updateUserStatus(@Param('user_id') user_id: string, @Body('status') status: USER_ACCOUNT_STATUS, @Res() res: Response) {
    try {
      const result = await this.userService.updateUserStatus(user_id, status);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }

  @Get('/user_details')
  @UseGuards(TokenValidationGuard)
  async getLoggedInUserDetails(@Req() req: Request, @Res() res: Response) {
    try {
      const payload = req['userPayload'];
      const result = await this.userService.getLoggedInUserDetails(payload);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }


  @Post('/update_profile')
  @UseGuards(TokenValidationGuard)
  @UseInterceptors(FileInterceptor('avatar', { fileFilter: imageFileFilter }))
  async updateUserProfile(@Req() req, @Body() body: UpdatePersonalDetailDto, @UploadedFile() file, @Res() res) {
    try {
      const payload: JWTPayload = req['userPayload'];
      const result = await this.userService.updateUserProfile(payload, body, file);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }

  @Post('/insert_or_update_address')
  @UseGuards(TokenValidationGuard)
  async insertOrUpdateUser(@Req() req: Request, @Res() res: Response, @Body() body: InsertAddressDto) {
    try {
      const payload = req['userPayload'];
      const result = await this.userService.insertOrUpdateUserAddress(payload, body);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }

  

}