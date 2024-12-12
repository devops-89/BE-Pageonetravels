import { Controller, Get, Query, Res } from '@nestjs/common';
import { GoogleAuthService } from '../../../../../libs/socialAuth/google';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { ConfigService } from '../../../../../libs/config/config.service';
import { SocialAuthService } from './social-auth.service';
import { USER_LOGIN_SOURCE } from '../../../../../libs/constants/autenticationConstants/userContants';


@Controller('social-auth')
export class SocialAuthController {

    constructor(private readonly googleAuthService: GoogleAuthService, 
        private readonly ResponseHandler: ResponseHandlerService, 
        private readonly configService: ConfigService,
        private readonly sociaAuthService: SocialAuthService
        ){}

    @Get('/google')
    async googleAuth(@Res() res: Response) {
      try {
            const url = this.googleAuthService.getGoogleAuthURL();
            return this.ResponseHandler.sendSuccessResponse(res, { message: 'success', data: { url } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return this.ResponseHandler.sendErrorResponse(res, error);
      }
    }

    @Get('/google/callback')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async googleCallback(@Res() resp: any, @Query() query: {code: string}) {
      try {
        const {FRONTEND_BASE_URL} = this.configService.get();
        
        if (!query || !query.code) {
          console.log("google callback code not found")
          return resp.redirect(`${FRONTEND_BASE_URL}/login`);  // login page
        }

        const userInfo = await this.googleAuthService.googleCallbackHandler(query.code);
        if (!userInfo.email) {
          return resp.redirect(`${FRONTEND_BASE_URL}/login`)  // login page
        }

        const result = await this.sociaAuthService.socialLoginOrSingup({ email: userInfo.email, name: userInfo.name, loginSource: USER_LOGIN_SOURCE.GOOGLE });

            return this.ResponseHandler.sendSuccessResponse(resp, { message: 'success', data: result });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Error in googleCallbackHandler:', error)
        return this.ResponseHandler.sendErrorResponse(resp, error);
      }
    }
}
