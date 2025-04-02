import { Injectable } from '@nestjs/common';
import { TestimonialRepositoryService, UserRepositoryService } from '../../../../../libs/database/src';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { AddTestimonialDto, UpdateTestimonialDto } from '../../../../../libs/dtos/admin/testimonial.dto';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';

@Injectable()
export class TestimonialService {
    
    constructor(
        private readonly userRepositoryService:UserRepositoryService,
        private readonly testimonialRepositoryService:TestimonialRepositoryService,
        private readonly s3Service:S3FileService
    ){}
    

    async addTestimonial(payload:JWTPayload,testimonialDto:AddTestimonialDto,files){
            try{
                const { reference_id } = payload;
                const refData =   await this.userRepositoryService.getUserByUserId(reference_id);
                if(!refData){
                    throw (`An Error occurred while adding testimonial.`);
                }
                const testimonial_description = testimonialDto.testimonial_description;
                const testimonial_name = testimonialDto.testimonial_name;
                const testimonial_profession = testimonialDto.testimonial_profession;
                const testimonial_image = files.testimonial_image[0].originalname;
                const status = testimonialDto.status;
                const testimonial = await this.testimonialRepositoryService.insertTestimonial({testimonial_image,testimonial_description,testimonial_name,testimonial_profession,status});
                // console.log(testimonial);
                return {message : 'Successfully Inserted Testimonial',testimonialData:testimonial}
            }catch(error){
                console.log('Error in add Testimonial Section',error);
                throw Error(error.message || "An error occurred while add Testimonial Section.");
            }
    }


    async getTestimonialList(){
        try{
            const testimonialList = await this.testimonialRepositoryService.getTestimonial();
            return {message: 'Testimonial List : ',testimonialData: testimonialList};
        }catch(error){
            console.log("Error in Testimonial List",error);
            throw(`Testimonial List Error : ${error.message}`);
        }
    }


    async updateTestimonial(payload:JWTPayload,updateTestimonialDto:UpdateTestimonialDto,files){
        try{
            const testimonial_id = updateTestimonialDto.testimonial_id;
            const existingTestimonial = await this.testimonialRepositoryService.getTestimonialById(testimonial_id);
            if(!existingTestimonial){
                throw { statusCode:ERROR_CODES.NOT_FOUND,message:`Testimonial Details Not Found.`}
            }
            
            let testimonial_image = existingTestimonial.testimonial_image;
            if(files && files.testimonial_image && files.testimonial_image[0].length){
                testimonial_image = files.testimonial_image[0].originalname;
            }
            let testimonial_description = updateTestimonialDto.testimonial_description;
            let testimonial_name = updateTestimonialDto.testimonial_name;
            let testimonial_profession = updateTestimonialDto.testimonial_profession;
            let status = updateTestimonialDto.status;
            if(!testimonial_description){
                testimonial_description = existingTestimonial.testimonial_description;
            }
            if(!testimonial_name){
                testimonial_name = existingTestimonial.testimonial_name;
            }
            if(!testimonial_profession){
                testimonial_profession = existingTestimonial.testimonial_profession;
            }
            if(!status){
                status = existingTestimonial.status;
            }

            const updateTestimonialValue = await this.testimonialRepositoryService.updateTestimonial({
                testimonial_id,
                testimonial_image,
                testimonial_description,
                testimonial_name,
                testimonial_profession,
                status 
            });

            return { message: 'Successfully updated Testimonial.', data: updateTestimonialValue }; 

        }catch(error){
            console.log('Error in Update Testimonial.',error);
            throw Error(error.message || "An error occurred while Update Testimonial Section.");
        }
    }

}