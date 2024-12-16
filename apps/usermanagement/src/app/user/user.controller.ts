import { Controller } from '@nestjs/common';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
// import { Request, Response } from 'express';
// import { UpdatePersonalDetailDto, UserFilterDto } from '../../../../../libs/dtos/authentication/user.dto';
// import { PaginationDto } from '../../../../../libs/dtos/authentication/user.dto';
//  import {InsertAddressDto } from '../../../../../libs/dtos/authentication/address.dto';
// import { UserService } from './user.service';
// import { TokenValidationGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
// import { CheckIfAdminGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
// import { USER_ACCOUNT_STATUS } from '../../../../../libs/constants/autenticationConstants/userContants';
// import { imageFileFilter } from '../../../../../libs/utils/fileUpload';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';


@Controller('users')
export class UserController {
  constructor(
    // private readonly userService: UserService,
    private readonly responseHandler: ResponseHandlerService,
  ) { }

  
}