import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { TokenValidationGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { LogoutService } from './logout.service';

@Controller('logout')
export class LogoutController {

    constructor(private readonly ResponseHandler: ResponseHandlerService, private readonly LogoutService:LogoutService) {}

    @Get('/currentSession')
    @UseGuards(TokenValidationGuard)
    async currentSession(@Res() res: Response, @Req() req: Request) {
      try {
        const payload = req['userPayload'];
            const result = await this.LogoutService.logoutCurrentSession(payload)
        return this.ResponseHandler.sendSuccessResponse(res,result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return this.ResponseHandler.sendErrorResponse(res, error);
      }
    }

    @Get('/allSession')
    @UseGuards(TokenValidationGuard)
    async logoutAllSession(@Res() res: Response, @Req() req: Request) {
      try {
        const payload = req['userPayload'];
        const result = await this.LogoutService.logoutAllSession(payload)
        return this.ResponseHandler.sendSuccessResponse(res,result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return this.ResponseHandler.sendErrorResponse(res, error);
      }
    }
}
