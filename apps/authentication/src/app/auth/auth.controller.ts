
import { Body, Controller, Get, Post,Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { DefaultUserService } from './services/defaultUserService';
import { AuthService } from './services/auth.service';
import { AdminLoginDto } from '../../../../../libs/dtos/authentication/admin.dto';
// import { UserI } from '../../../../../libs/interfaces/authentication/user.interface';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { ChangePasswordDto, LoginDto, LoginOrRegisterDto, RegisterDto, VerifyDto } from '../../../../../libs/dtos/authentication/user.dto';
import {  TokenValidationGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
import { ResetPasswordDto, ForgotPasswordDto, SignupLoginDTO } from '../../../../../libs/dtos/authentication/forgotPassword.dto'

@Controller('auth')
export class AuthController {
    constructor(
        private readonly defaultUserService: DefaultUserService,
        private readonly authService: AuthService,
        private readonly ResponseHandler: ResponseHandlerService) { }

    @Get('/default_user')
    async addDefaultUser(@Res() res: Request): Promise<void> {
        try { 
            await this.defaultUserService.addDefaultUser();
            return this.ResponseHandler.sendSuccessResponse(res, { message: 'success', data: null });
        } catch (error) {
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }


    @Get('/guest_login')
    async guestLogin(@Res() res: Response) {
        try {
            const result = await this.authService.guestLogin();
            return this.ResponseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }

    @Post('/login_or_register')
    async loginOrRegister(@Res() res: Request, @Req() req: Request, @Body(new ValidationPipe()) body: LoginOrRegisterDto) {
        try {
            // const device_type = req.headers['devicetype'];
            const result = await this.authService.loginWithEmailOrPhone(body);
            return this.ResponseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }


    @Post('/login')
    // @UseGuards(OptionalTokenValidationAndGuestUserGuard)
    async login(@Res() res: Response, @Req() req: Request, @Body(new ValidationPipe()) body: LoginDto) {
        try {
            const device_type = req.headers['devicetype'];
            const result = await this.authService.loginWithEmailOrPhonePassword(body, device_type);
            return this.ResponseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }

    @Post('/admin-login')
    // @UseGuards(TokenValidationGuard,CheckIfAdminGuard)
    async adminLogin(@Body() body:AdminLoginDto, @Req() req:Request, @Res() res:Response){
        try{
            const device_type = req.headers['devicetype'];
            const result = await this.authService.adminLoginDetails(device_type,body);
            return this.ResponseHandler.sendSuccessResponse(res,result);
        }catch(error){ 
            return this.ResponseHandler.sendErrorResponse(res,error);
        }
    }



    // @Post('/renewAccessToken')
    // async renewAccessToken(@Res() res: Response, @Body(new ValidationPipe()) body: RenewTokenDto) {
    //     try {
    //         const result = await this.authService.renewAccessToken(body as UserI.RenewAccessToken);
    //         return this.ResponseHandler.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.ResponseHandler.sendErrorResponse(res, error);
    //     }
    // }


    @Post('/register')
    // @UseGuards(OptionalTokenValidationAndGuestUserGuard)
    async register(@Res() res: Response, @Req() req: Request, @Body() body: RegisterDto) {
        try {
            const result = await this.authService.registerWithEmailPassword(body);
            return this.ResponseHandler.sendSuccessResponse(res, result);
        } catch (error) {
           return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }


    @Post('/change_password')
    @UseGuards(TokenValidationGuard)
    async changePassword(@Res() res: Response, @Req() req: Request, @Body(new ValidationPipe()) body: ChangePasswordDto) {
        try {
            const payload = req['userPayload'];
            const result = await this.authService.changePassword(body, payload);
            return this.ResponseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }


    @Post('/verifyPasswordChangeOtp')
    async verifyPasswordChangeOtp(@Res() res: Response, @Body(new ValidationPipe()) body: VerifyDto) {
        try {
            const device_type = body.device_type;
            const result = await this.authService.verificationByOtp(body, device_type);
            return this.ResponseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }


    @Post('/verify')
    async verify(@Res() res: Request, @Body(new ValidationPipe()) body: VerifyDto, @Req() req: Request) {
        try {
            // const fcmToken = req.headers['fcmtoken'];
            const device_type = req.headers['devicetype'];
            const result = await this.authService.verificationByOtp(body, device_type);
            return this.ResponseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }



    @Post('/forget_password')
    async forgotPassword(@Res() res: Response, @Body(new ValidationPipe()) body: ForgotPasswordDto) {
        try {
            const result = await this.authService.forgotPasswordRequest(body);
            return this.ResponseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }


    @Post('/reset_password')
    async resetPassword(@Res() res: Response, @Body(new ValidationPipe()) body: ResetPasswordDto) {
        try {
            const result = await this.authService.forgotPasswordVerifyByOtp(body);
            return this.ResponseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }

    @Post('/signup_login_via_email')
    async emailSent(@Req() req:Request,@Res() res:Response,@Body(new ValidationPipe()) body: SignupLoginDTO){
        try{
            const result = await this.authService.loginWithEmail(body);
            return this.ResponseHandler.sendSuccessResponse(res,result);
        }catch(error){
            return this.ResponseHandler.sendErrorResponse(res,error);
        }
    }

}
