
import { Controller, Get,  Res} from '@nestjs/common';
import { DefaultUserService } from './services/defaultUserService';
import { AuthService } from './services/auth.service';
// import { UserI } from '../../../../../libs/interfaces/authentication/user.interface';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
// import { VerifyDto, LoginOrRegisterDto, LoginDto, RenewTokenDto, ChangePasswordDto, RegisterDto } from '../../../../../libs/dtos/authentication/user.dto';
// import {  TokenValidationGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
// import{ResetPasswordDto, ForgotPasswordDto} from '../../../../../libs/dtos/authentication/forgotPassword.dto'

@Controller('auth')
export class AuthController {
    constructor(private readonly defaultUserService: DefaultUserService, private readonly authService: AuthService, private readonly ResponseHandler: ResponseHandlerService) {}

    @Get('/defaultUser')
    async addDefaultUser(@Res() res: Request): Promise<void> {
        try {
            await this.defaultUserService.addDefaultUser();
            return this.ResponseHandler.sendSuccessResponse(res, { message: 'success', data: null });
        } catch (error) {
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }

  }
