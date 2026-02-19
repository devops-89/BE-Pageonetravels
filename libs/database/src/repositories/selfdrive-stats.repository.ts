import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enquiry, EnquiryType } from '../entities';
import { ISelfDriveStats } from '../../../interfaces/dashboard/dashboard.interface';

@Injectable()
export class SelfDriveStatsRepositoryService {
    constructor(
        @InjectRepository(Enquiry)
        private readonly enquiryRepository: Repository<Enquiry>
    ) {}

    async getSelfDriveStats(): Promise<ISelfDriveStats> {
        try {
            // Get total packages
            const totalSelfDrive = await this.enquiryRepository.count(
                {
                    where: {
                        enquiry_type: EnquiryType.SELF_DRIVE
                    }
                }
            );

            return {
                message: "Self Drive statistics fetched successfully",
                data: {
                    totalSelfDrive
                }
            };
        } catch (error) {
            console.log('Error in fetching Self Drive stats:', error);
            throw error;
        }
    }
}
