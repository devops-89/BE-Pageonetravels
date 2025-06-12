import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from '../entities';
import { IPackageStats } from '../../../interfaces/dashboard/dashboard.interface';

@Injectable()
export class PackageStatsRepositoryService {
    constructor(
        @InjectRepository(Package)
        private readonly packageRepository: Repository<Package>
    ) {}

    async getPackageStats(): Promise<IPackageStats> {
        try {
            // Get total packages
            const totalPackages = await this.packageRepository.count();

            return {
                totalPackages
            };
        } catch (error) {
            console.log('Error in fetching package stats:', error);
            throw error;
        }
    }
} 