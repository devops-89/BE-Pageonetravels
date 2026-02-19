import { Injectable } from '@nestjs/common';
import { UserRepositoryService } from '../../../../libs/database/src';
import { ERROR_CODES, ErrorMessages } from '../../../../libs/constants/commonConstants';
@Injectable()
export class ProfileService {
    constructor(private readonly userRepositoryService: UserRepositoryService) {}

    async getAdminInfo() {
        try {
            const admin = await this.userRepositoryService.getAdminInfo();

            if (!admin) {
                throw {
                    statusCode: ERROR_CODES,
                    message: 'Profile Not Found!',
                };
            }

            return {
                success: true,
                message: 'Profile fetched successfully',
                data: admin,
            };
        } catch (error) {
            throw {
                statusCode: error.statusCode || ERROR_CODES.UNEXPECTED_ERROR,
                message: error.message || ErrorMessages.UNEXPECTED_ERROR,
                extraError: error,
            };
        }
    }
}
