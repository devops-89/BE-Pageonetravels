import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { IUserStats } from '../../../interfaces/dashboard/dashboard.interface';
import { USER_ACCOUNT_STATUS, USER_TYPE, USER_VERIFY_STATUS } from '../../../constants/autenticationConstants/userContants';

@Injectable()
export class UserStatsRepositoryService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async getUserStats(): Promise<IUserStats> {
        try {
            // Get total users
            const totalUsers = await this.userRepository.count({
                where: {
                    user_type: USER_TYPE.USER,
                    verify_status: USER_VERIFY_STATUS.VERIFIED,
                    status: USER_ACCOUNT_STATUS.ACTIVE
                }
            });
            return {
                totalUsers
            };
        } catch (error) {
            console.log('Error in fetching user stats:', error);
            throw error;
        }
    }
} 