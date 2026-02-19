import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enquiry, EnquiryType } from '../entities';
import { IHelicopterStats } from '../../../interfaces/dashboard/dashboard.interface';

@Injectable()
export class HelicopterStatsRepositoryService {
    constructor(
        @InjectRepository(Enquiry)
        private readonly enquiryRepository: Repository<Enquiry>
    ) {}

    async getHelicopterStats(): Promise<IHelicopterStats> {
        try {
            // Get total packages
            const totalHelicopter = await this.enquiryRepository.count(
                {
                    where: {
                        enquiry_type: EnquiryType.HELICOPTER
                    }
                }
            );

            return {
                message: "Helicopter statistics fetched successfully",
                data: {
                   totalHelicopter
                }
            };
        } catch (error) {
            console.log('Error in fetching Helicopter stats:', error);
            throw error;
        }
    }
}
