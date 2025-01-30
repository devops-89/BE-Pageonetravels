import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITestimonial, UTestimonial } from '../../../../libs/interfaces/commonTypes/home.interface';
import { Repository } from 'typeorm';
import { Testimonial } from '../entities';

@Injectable()
export class TestimonialRepositoryService{

    constructor(
        @InjectRepository(Testimonial)
        private readonly testimonialRespository: Repository<Testimonial>
    ){}

    async insertTestimonial(input:ITestimonial):Promise<Testimonial>{
        try{
           
            const {testimonial_image,testimonial_description,testimonial_name,testimonial_profession,status} = input
            const newtestimonial  = this.testimonialRespository.create({
                testimonial_image,
                testimonial_description,
                testimonial_name,
                testimonial_profession,
                status
            });
            
            // save the testimonial to the database
            const result = await this.testimonialRespository.save(newtestimonial);
            return result;
        }catch(error){
            console.log('Error inserting Testimonial : ',error);
            throw `Failed to insert Testimonial.Please try again later. ${error.message}`;
        }
    }

    async getTestimonial(){
        try{
            const testimonialList = await this.testimonialRespository
                                    .createQueryBuilder('Testimonial')
                                    .getMany();
            
            console.log('Testimonial List Retrived Successfully.',testimonialList);
            return testimonialList;
        }catch(error){
            console.log('Error Fetching Service List.',error);
            throw new Error('Failed to fetch service list. Please try again later.');
        }
    }

    async getTestimonialById(id:string):Promise<Testimonial>{
        try{
            const testimonial = await this.testimonialRespository.findOne({where:{testimonial_id:id}});
            return testimonial;
        }catch(error){
            console.log(`Failed to retrive Service : ${error.message}`);
            throw error;
        }
    }

    async updateTestimonial(input:UTestimonial){
        try{
            const updatedTestimonial = await this.testimonialRespository.save(input);
            return updatedTestimonial;
        }catch(error){
            console.log(`Failed to update service : ${error.message}`);
            throw ('Failed to update Testimonial : ${error.message}');
        }
    }

}