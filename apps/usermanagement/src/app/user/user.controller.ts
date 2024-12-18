import { Controller, Query,Get,Req,Res } from '@nestjs/common';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { PaginationDto, UserFilterDto } from 'libs/dtos/authentication/user.dto';
// import { Request, Response } from 'express';
// import { UpdatePersonalDetailDto, UserFilterDto } from '../../../../../libs/dtos/authentication/user.dto';
// import { PaginationDto } from '../../../../../libs/dtos/authentication/user.dto';
//  import {InsertAddressDto } from '../../../../../libs/dtos/authentication/address.dto';
 import { UserService } from './user.service';
// import { TokenValidationGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
// import { CheckIfAdminGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
// import { USER_ACCOUNT_STATUS } from '../../../../../libs/constants/autenticationConstants/userContants';
// import { imageFileFilter } from '../../../../../libs/utils/fileUpload';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';


@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseHandler: ResponseHandlerService,
  ) { }

  @Get('/getUserList')
  async getUsers(@Res() res: Response, @Req() req:Request,@Query() query:UserFilterDto & PaginationDto ){
    try{
      const pagination = { page: query.page || 1, limit: query.limit || 10 };
      const result = await this.userService.getUsersByGroup( pagination);
      return this.responseHandler.sendSuccessResponse(res, result)
    }catch(error){
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }
  
}