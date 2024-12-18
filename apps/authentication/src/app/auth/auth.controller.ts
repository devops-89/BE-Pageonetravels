
import { Body, Controller, Get,  Post,  Req,  Res, ValidationPipe} from '@nestjs/common';
import { DefaultUserService } from './services/defaultUserService';
import { AuthService } from './services/auth.service';
// import { UserI } from '../../../../../libs/interfaces/authentication/user.interface';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { LoginOrRegisterDto } from '../../../../../libs/dtos/authentication/user.dto';
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

    
    @Post('loginOrRegister')
    async loginOrRegister(@Res() res: Request, @Req() req: Request, @Body(new ValidationPipe()) body: LoginOrRegisterDto) {
        try {
            // const deviceType = req.headers['devicetype'];
            const result = await this.authService.loginWithEmailOrPhone(body);
            return this.ResponseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }

  }
