import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { UserStatsService } from './user-stats.service';
import { TokenValidationGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { Response } from 'express';

@Controller('stats')
export class UserStatsController {
    constructor(
        private readonly userStatsService: UserStatsService,
        private readonly responseHandler: ResponseHandlerService
    ) {}

    // @Get("/count-user-stats")
    // @UseGuards(TokenValidationGuard)
    // async getUserStats(@Res() res: Response): Promise<void> {
    //     try {
    //         const result = await this.userStatsService.getUserStats();
    //         return this.responseHandler.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.responseHandler.sendErrorResponse(res, error);
    //     }
    // }

    @Get("/dashboard-stats")
    @UseGuards(TokenValidationGuard)
    async getDashboardStats(@Res() res: Response): Promise<void> {
        try {
            const result = await this.userStatsService.getDashboardStats();
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }
} 