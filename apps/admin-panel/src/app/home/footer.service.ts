import { Injectable } from '@nestjs/common';
import { FooterRepositoryService, UserRepositoryService } from '../../../../../libs/database/src';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { AddFooterDto, UpdateFooterDto } from '../../../../../libs/dtos/admin/footer.dto';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';


@Injectable()
export class FooterService {

    constructor(
        private readonly userRepositoryService:UserRepositoryService,
        private readonly footerRepositoryService:FooterRepositoryService,
        private readonly s3Service:S3FileService
    ){}


    async addFooterData(payload:JWTPayload,footerDto:AddFooterDto,files){
            try{
                const {reference_id} = payload;
                const refData = await this.userRepositoryService.getUserByUserId(reference_id);
                if(!refData){
                    throw (`An Error occurred while adding Footer.`);
                }
                const footer_image = files.footer_image[0].originalname;
                const our_services = JSON.stringify(footerDto.our_services);
                const support = JSON.stringify(footerDto.support);
                const destinations = JSON.stringify(footerDto.destinations);
                const contact_address = footerDto.contact_address;
                const contact_email = footerDto.contact_email;
                const company = JSON.stringify(footerDto.company);
                const contact_number = footerDto.contact_number;
                const copy_right = footerDto.copy_right;

                const footer = await this.footerRepositoryService.insertFooter({footer_image,our_services,support,destinations,company,contact_address,contact_email,contact_number,copy_right});
                return {message : 'Successfully Inserted Footer.',footerData:footer};    
            }catch(error){
                console.error('Error in add Footer Section',error);
                throw Error(error.message || "An error occurred while add Banner Section.");
            }
    }

    async getFooter(){
        try{
            const footerList = await this.footerRepositoryService.getFooterList();
            return {message: "Footer List ",footer:footerList}
        }catch(error){
            console.log('Footer List Error',error);
            throw (`Footer List Error : ${error.message}`);
        }
    }

    async updateFooterData(payload:JWTPayload,updateFooter:UpdateFooterDto,files){
            try{
                const footer_id = updateFooter.footer_id;
                const existingFooter = await this.footerRepositoryService.getFooterbyId(footer_id);
                if(!existingFooter){
                    throw {statusCode:ERROR_CODES.NOT_FOUND,message:`Footer details not Found.`};
                }
                let footer_image = existingFooter.footer_image;
                if(files && files.footer_image && files.footer_image.length){
                    footer_image = files.footer_image[0].originalname
                }

                let our_services = JSON.stringify(updateFooter.our_services);
                let support = JSON.stringify(updateFooter.support);
                let destinations = JSON.stringify(updateFooter.destinations);
                let contact_address = JSON.stringify(updateFooter.contact_address);
                let contact_email = JSON.stringify(updateFooter.contact_email);
                let contact_number = JSON.stringify(updateFooter.contact_number);
                let copy_right = JSON.stringify(updateFooter.copy_right);
                let company = JSON.stringify(updateFooter.company);

                if(!our_services){
                    our_services = existingFooter.our_services;
                }
                if(!support){
                    support = existingFooter.support;
                }
                if(!destinations){
                    destinations = existingFooter.destinations;
                }
                if(!contact_address){
                    contact_address = existingFooter.contact_address;
                }
                if(!contact_email){
                    contact_email = existingFooter.contact_email;
                }
                if(!contact_number){
                    contact_number = existingFooter.contact_number;
                }
                if(!copy_right){
                    copy_right = existingFooter.copy_right;
                }
                if(!company){
                    company = existingFooter.company;
                }

                const updateFooterValue = await this.footerRepositoryService.updateFooterData({
                        footer_id,
                        footer_image,
                        our_services,
                        support,
                        destinations,
                        contact_address,
                        contact_email,
                        copy_right,
                        company,
                        contact_number
                });
               
                return {message : 'Successfully updated Footer',footer:updateFooterValue};

            }catch(error){  
                console.log('Error in update footer Section.',error);
                throw Error(error.message || "An error occurred while add Footer Section.");
            }
    }

}