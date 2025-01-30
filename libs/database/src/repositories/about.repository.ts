import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { About } from '../entities';
import { IAbout, UAbout } from '../../../../libs/interfaces/commonTypes/home.interface';

@Injectable()
export class AboutRepositoryService {
    constructor(
        @InjectRepository(About)
        private readonly aboutRepository:Repository<About>,
    ){}

    async insertAbout(input:IAbout):Promise<About>{
        try{
            const {about_image,about_heading,about_description,about_button} = input
            //create a about entity
            const newAbout = this.aboutRepository.create({
                about_image,
                about_heading,
                about_description,
                about_button
            });

            // save  the about  to the database
            const about = await this.aboutRepository.save(newAbout);
            return about;
        }catch(error){
            console.log('Error inserting About : ',error);
            throw `Failed to insert About. Please try again later. ${error.message}`;
        }
    
    }
    
    async getAboutList():Promise<About[]>{
        try{
            const about = await this.aboutRepository
                          .createQueryBuilder('About')
                          .getMany();
            console.log('About List Retrived Successfully.',about);
            return about;
        }catch(error){
            console.log('Error fetching about list:',error);
            throw new Error ('Error to fetch About. Please Try again later.')
        }
    }

    async getAboutbyId(id:string):Promise<About>{
        try{
            const about = await this.aboutRepository.findOne({where : {about_id:id}});
            return about;
        }catch(error){
            console.log(`Failed to retrive About : ${error.message}`);
            throw error;
        }
    }

    async updateAbout(input:UAbout){
            try{
                const updatedAbout = await this.aboutRepository.save(input);
                return updatedAbout;
            }catch(error){
                console.log(`Failed to Update About : ${error.message}`);
                throw (`Failed to update about: ${error.about}`);
            }
    }



    
}