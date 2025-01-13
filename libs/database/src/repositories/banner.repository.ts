import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../entities/banner.entity';
import { IBanner, UBanner } from '../../../../libs/interfaces/commonTypes/home.interface';

@Injectable()
export class BannerRepositoryService {
    constructor(
            @InjectRepository(Banner)
            private readonly bannerRepository: Repository<Banner>,
        ) { } 
    
    async insertBanner(input:IBanner): Promise<Banner>{
        try{
                const { banner_image, banner_title,banner_heading } = input
                // Create a header Entity
                const newBanner = this.bannerRepository.create({
                            banner_image,
                            banner_title,
                            banner_heading 
                        });
                // Save the commission to the database  
                const result = await this.bannerRepository.save(newBanner);  
                return result;   
        }catch(error){
            console.error('Error inserting Banner:', error); 
            throw `Failed to insert banner. Please try again later. ${error.message}`; 
        }
    }
    
    async getBannerList():Promise<Banner[]>{
        try{
            const banner = await this.bannerRepository
                           .createQueryBuilder('banner')
                           .getMany();
            console.log('Banner List retrived successfully:',banner);
            return banner;
        }catch(error){
            console.log('Error fetching banner list:',error);
            throw new Error ('Failed to fetch banner list. Please try again later.');
        }
    }


    async getBannerbyId(id:string):Promise<Banner>{
        try{
            const banner  = await this.bannerRepository.findOne({where: {banner_id:id}});
            return banner;
        }catch(error){
            console.log(`Failed to retrive Banners: ${error.message}`);
            throw error;
        }
    }


    async updateBanner(input: UBanner){
        try{    
            const { banner_id } = input;
            // fetch the banner entity to update
            const existingBanner = await this.bannerRepository.findOne({where : {banner_id}});
            if(!existingBanner){
                throw `Banner not found with ID : ${banner_id}`;
            }
            // Assign new values to the existing header entity 
            Object.assign(existingBanner,input);
            // save the updated banner
            const updatedBanner = await this.bannerRepository.save(existingBanner);
            return updatedBanner;
        }catch(error){
            console.log(`Failed to Updated Banner: ${error.message}`);
            throw (`Failed to update banner: ${error.message}`);
        }
    }

}