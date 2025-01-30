import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TabService } from '../entities/tabService.entity';
import { IService, UService } from '../../../../libs/interfaces/commonTypes/home.interface';
import { retry } from 'rxjs';

@Injectable()
export class TabRepositoryService{
    constructor(
        @InjectRepository(TabService)
        private readonly tabRepository: Repository<TabService>,
    ) { }


    async insertService(input:IService):Promise<TabService>{
        try{ 
            const {service_image,service_name,service_status} = input
            // Create a Service 
            const newService = this.tabRepository.create({
                service_image,
                service_name,
                service_status
            });

            // save the service to the database
            const result = await this.tabRepository.save(newService);
            return result;
        }catch(error){
            console.error('Error inserting Tab Service:', error); 
            throw `Failed to insert Tab Service. Please try again later. ${error.message}`; 
        }
    }


    async getService(){
        try{
            const servicelist = await this.tabRepository
                                .createQueryBuilder('TabService')
                                .getMany();
            console.log('Service List Retrived Successfully.',servicelist);
            return servicelist;
        }catch(error){
            console.error('Error fetching service list:',error);
            throw new Error('Failed to fetch service list.Please try again later');
        }
    }


    async getServiceById(id:string):Promise<TabService>{
        try{
            const service = await this.tabRepository.findOne({where: {service_id:id}});
            return service;
        }catch(error){
            console.log(`Failed to retrive Service : ${error.message}`);
            throw error;
        }
    }


    async updateService(input:UService){
        try{
            const updatedService = await this.tabRepository.save(input);
            return updatedService;
        }catch(error){
            console.log(`Failed to Updated Service: ${error.message}`);
            throw ('Failed to update Service: ${error.message}');
        }
    }

}