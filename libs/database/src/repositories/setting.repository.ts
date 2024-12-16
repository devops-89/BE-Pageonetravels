import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from '../entities';
import { Repository } from 'typeorm';



@Injectable()
export class SettingRepositoryService {
    constructor(
        @InjectRepository(Setting)
        private readonly settingRepository: Repository<Setting>
    ) {}

    async getAllKeysAndValues(): Promise<Setting[]> {
        try {
            const doc = await this.settingRepository.find()
            return doc;
        } catch (error) {
            console.log('Error checking user by email in DB', error);
            throw error;
        }
    }
}