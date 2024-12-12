import { Controller, Get, Res, Req, UseGuards, UploadedFile, Body, Param, Post, UseInterceptors, Query } from '@nestjs/common';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { Request, Response } from 'express';
import { UpdatePersonalDetailDto, UserFilterDto } from '../../../../../libs/dtos/authentication/user.dto';
import { PaginationDto } from '../../../../../libs/dtos/authentication/user.dto';
 import {InsertAddressDto } from '../../../../../libs/dtos/authentication/address.dto';
import { UserService } from './user.service';
import { TokenValidationGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
import { CheckIfAdminGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
import { USER_ACCOUNT_STATUS } from '../../../../../libs/constants/autenticationConstants/userContants';
import { imageFileFilter } from '../../../../../libs/utils/fileUpload';
import { FileInterceptor } from '@nestjs/platform-express';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';


@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseHandler: ResponseHandlerService,
  ) { }

  // @Get('/defaultUser')
  // async addDefaultUser(@Res() res: Request): Promise<void> {
    // eslint-disable-next-line no-useless-catch
    // try {
    //   await this.defaultUserService.updateDefaultRolesAndPermission()
    //   await this.defaultUserService.addDefaultUser();
    //   return this.ResponseHandler.sendSuccessResponse(res,{message:"success", data: null});
    // } catch (error) {
    //   return this.ResponseHandler.sendErrorResponse(res, error);
    // }
  // }

  @Get('/getUserList')
  @UseGuards(TokenValidationGuard, CheckIfAdminGuard)
  async getUsers(@Res() res: Response, @Req() req: Request, @Query() query: UserFilterDto & PaginationDto) {
    try {

      const pagination = { page: query.page || 1, limit: query.limit || 10 };
      const filters = { group: query.group, search: query.search, status: query.status, };
      const result = await this.userService.getUsersByGroup(filters, pagination);
      return this.responseHandler.sendSuccessResponse(res, result)

    } catch (error) {
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }

  @Post('/updatestatus/:userId')
  @UseGuards(TokenValidationGuard, CheckIfAdminGuard)
  async updateUserStatus(@Param('userId') userId: number, @Body('status') status: USER_ACCOUNT_STATUS, @Res() res: Response) {
    try {
      const result = await this.userService.updateUserStatus(userId, status);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }

  @Get('/userdetails')
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
  @Post('/updateprofile')
  @UseGuards(TokenValidationGuard)
  @UseInterceptors(FileInterceptor('avatar', { fileFilter: imageFileFilter }))
  async updateUserProfile(@Req() req,@Body() body: UpdatePersonalDetailDto, @UploadedFile() file, @Res() res) {
    try {
      const payload: JWTPayload = req['userPayload'];
      const result = await this.userService.updateUserProfile(payload, body, file);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }


  @Post('insertorupdateaddress')
  @UseGuards(TokenValidationGuard)
  async insertOrUpdateUser(@Req() req : Request, @Res() res : Response, @Body() body : InsertAddressDto) {
    try {
      const payload = req['userPayload'];
      const result = await this.userService.insertOrUpdateUserAddress(payload,body);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }

}