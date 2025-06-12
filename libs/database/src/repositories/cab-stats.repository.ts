import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enquiry, EnquiryType } from '../entities';
import { ICabStats } from '../../../interfaces/dashboard/dashboard.interface';
import { In } from 'typeorm';

@Injectable()
export class CabStatsRepositoryService {
    constructor(
        @InjectRepository(Enquiry)
        private readonly enquiryRepository: Repository<Enquiry>
    ) {}

    async getCabStats(): Promise<ICabStats> {
        try {
            // Get total cab enquiries (both regular and outstation)
            const totalCabs = await this.enquiryRepository.count({
                where: {
                    enquiry_type: In([EnquiryType.CABS, EnquiryType.OUTSTATION_CABS])
                }
            });

            return {
                message: "Cab statistics fetched successfully",
                data: {
                    totalCabs
                }
            };
        } catch (error) {
            console.log('Error in fetching cab stats:', error);
            throw error;
        }
    }
} 