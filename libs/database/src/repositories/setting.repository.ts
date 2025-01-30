import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from '../entities';
import { Repository } from 'typeorm';
import { ConfigService } from "libs/config/config.service";



@Injectable()
export class SettingRepositoryService {
    constructor(
        @InjectRepository(Setting)
        private readonly settingRepository: Repository<Setting>,
        // private readonly configService: ConfigService
    ) {}

    async getFlightKeysAndValues() {
        try {
            const doc = await this.settingRepository.findOne({where : { key : 'flight_settings' }});
            return doc; 
        } catch (error) {
            console.error('Error fetching settings from the database:', error);
            throw error;
        }
    }

    async getHotelKeysAndValues() {
        try {
            const doc = await this.settingRepository.findOne({where : { key : 'hotel_settings' }});
            return doc;
        } catch (error) {
            console.error('Error fetching settings from the database:', error);
            throw error;
        }
    }

    // async generateToken(){
    //     try {
    //         const result = this.configService.get().TBO_CREDENTIALS;
    //         console.log(">>>>>>>>", result
    //         )
    //         let data = {
    //             result
    //         }
    //         return data as any || null;
        
    // } catch (error) {
    //     console.error('Error in the generate token:', error);
    //     throw error;
    // }
// }
}