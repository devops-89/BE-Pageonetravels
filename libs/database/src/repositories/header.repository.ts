import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Headers } from '../entities/headers.entity';
import { Iheader, Uheader } from '../../../../libs/interfaces/commonTypes/home.interface';
import { retry } from 'rxjs';

@Injectable()
export class HeaderRepositoryService {
  constructor(
        @InjectRepository(Headers)
        private readonly headerRepository: Repository<Headers>,
  ) { }

  async saveHeaderData(input:Iheader){
      try{
          const { favicon, header_logo,header_links } = input
          // Create a header Entity
          const newCommission = this.headerRepository.create({
                      favicon,
                      header_logo,
                      header_links
                  });
          // Save the commission to the database  
          const result = await this.headerRepository.save(newCommission);  
          return result;  
      }catch(error){
          console.error('Error inserting header:', error); 
          throw `Failed to insert header. Please try again later. ${error.message}`; 
      }
  }

  async getHeaderList():Promise<Headers[]>{
      try{
        const header = await this.headerRepository
                .createQueryBuilder('commission')
                .getMany();
        console.log('Header list retrieved successfully:', header);
        return header;
      }catch(error){
            console.error('Error fetching header list:', error);
            throw new Error('Failed to fetch header list. Please try again later.');
      }
  }

  async getHeaderbyId(id:string):Promise<Headers>{
    try{
        const header = await this.headerRepository.findOne({ where: { header_id: id } });
		return header;
    }catch(error){
        console.log(`Failed to retrive Headers: ${error.message}`);
		throw error;
    }
  } 


  async updateHeader(input: Uheader){
    try{ 
        const { header_id } = input;
        // fetch the header entity to update
        const existingHeader = await this.headerRepository.findOne({where : { header_id}});
        if(!existingHeader){
            throw `Header not found with ID: ${header_id}`;
        }
        // Assign new values to the existing header entity
        Object.assign(existingHeader,input);
        // Save the updated header 
        const updatedHeader = await this.headerRepository.save(existingHeader);
        return updatedHeader;
    }catch(error){
        console.log(`Failed to Updated header: ${error.message}`);
        throw (`Failed to update commission: ${error.message}`);
    }
  }

}