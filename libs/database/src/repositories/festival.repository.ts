import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Festival } from '../entities/festival.entity';
import { IFestival, UFestival } from '../../../../libs/interfaces/commonTypes/home.interface';

@Injectable()
export class FestivalRepositoryService {
    constructor(
        @InjectRepository(Festival)
        private readonly festivalRespository: Repository<Festival>
    ){}

    async insertFestival(input:IFestival) : Promise<Festival>{
        try{
            const {festival_image,festival_name,festival_discount,festival_status} = input
            // Create a Festival Entity
            const newFestival = this.festivalRespository.create({
                festival_image,
                festival_name,
                festival_discount,
                festival_status
            });
            // save the festival to the database
            const result = await this.festivalRespository.save(newFestival);
            console.log(result);
            return result;
        }catch(error){
            console.log('Error inserting Festival : ',error);
            throw `Failed to insert festival. Please try again later. ${error.message}`;
        }
    } 

    async getFestival():Promise<Festival[]>{
        try{
            const festival = await this.festivalRespository
                            .createQueryBuilder('festival')
                            .getMany();
            console.log('Banner List retrived successfully :',festival);
            return festival;
        }catch(error){
            console.log('Error fetching festival list : ',error);
            throw new Error ('Failed to fetch festival list. Please try again later.');
        }
    }


    async getFestivalById(id:string):Promise<Festival>{
        try{
            const festival = await this.festivalRespository.findOne({where: {festival_id:id}});
            return festival;
        }catch(error){
            console.log(`Failed to retrive Festivals : ${error.message}`);
            throw error;
        }
    }

    async updateFestival(input: UFestival){
        try{    
            const updateFestival = await this.festivalRespository.save(input);
            return updateFestival;
        }catch(error){
            console.log(`Failed to update Festival : ${error.message}`);
            throw ('Failed to update Festival : ${error.message}');
        }
    }

}