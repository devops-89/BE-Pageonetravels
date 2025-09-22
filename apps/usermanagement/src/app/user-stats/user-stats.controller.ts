import { Controller, Get, Res, Query } from '@nestjs/common';
import { UserStatsService } from './user-stats.service';
//import { TokenValidationGuard } from '../../../../../libs/middlewares/authMiddleware.guard';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { Response } from 'express';
import { BookingFilterDto } from '../../../../../libs/dtos/common/bookingFilter.dto';
import { PaginationDto } from '../../../../../libs/dtos/authentication/user.dto';

@Controller('stats')
export class UserStatsController {
    constructor(private readonly userStatsService: UserStatsService, private readonly responseHandler: ResponseHandlerService) {}

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

    @Get('/dashboard-stats')
    //@UseGuards(TokenValidationGuard)
    async getDashboardStats(@Res() res: Response): Promise<void> {
        try {
            const result = await this.userStatsService.getDashboardStats();
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }

    @Get('user-bookings')
    //@UseGuards(TokenValidationGuard)
    async getAllBookingsForUser(@Query('userId') userId: string, @Query() pagination: PaginationDto, @Query() filter: BookingFilterDto, @Res() res: Response) {
        try {
            const result = await this.userStatsService.getUserBookings(userId, pagination, filter);
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }

    @Get('bookings')
    async getAllBookings(@Query() pagination: PaginationDto, @Query() filter: BookingFilterDto, @Res() res: Response) {
        try {
            const result = await this.userStatsService.getAllBookings(pagination, filter);
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }
}
