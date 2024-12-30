import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Headers } from '../entities/headers.entity';
import { Iheader } from '../../../../libs/interfaces/commonTypes/home.interface';

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

}