import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Footer } from '../entities';
import { IFooter, UFooter } from 'libs/interfaces/commonTypes/home.interface';

@Injectable()
export class FooterRepositoryService {
 
    constructor(
        @InjectRepository(Footer)
        private readonly footerRepository:Repository<Footer>,
    ){}

    async insertFooter(input:IFooter){
        try{
            const {footer_image,our_services,support,destinations,company,contact_address,contact_email,contact_number,copy_right} = input
            // Create a footer Entity
            const newFooter = this.footerRepository.create({
                        footer_image,
                        our_services,
                        support,
                        destinations,
                        company,
                        contact_address,
                        contact_email,
                        contact_number,
                        copy_right
            });

            // Save the Footer to the database
            const result = await this.footerRepository.save(newFooter);
            return result; 
        }catch(error){
            console.log('Error inserting Footer.',error);
            throw `Failed to insert footer.Please try again later. ${error.message}`;
        }
    }

    async getFooterList():Promise<Footer[]>{
            try{
                const footer = await this.footerRepository
                               .createQueryBuilder('footer')
                               .getMany();
                console.log('Footer list retrived successfully',footer);
                return footer;
            }catch(error){
                console.log(`Failed to retrive Footer : ${error.message}`);
                throw error;
            }
    }


    async getFooterbyId(id:string):Promise<Footer>{
        try{
            const footer = await this.footerRepository.findOne({where : {footer_id:id}});
            return footer;
        }catch(error){
            console.log(`Failed to retrive Footer: ${error.message}`);
            throw error;
        }
    }

    async updateFooterData(input:UFooter){
        try{
            const updateFooter = await this.footerRepository.save(input);
            return updateFooter;
        }catch(error){
            console.log(`Failed to update footer: ${error.message}`);
            throw (`Failed to update Footer: ${error.message}`);
        }
    }

}