import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commission } from '../entities/commission.entity';
import { Icommission } from '../../../../libs/interfaces/commonTypes/commission.interface';
import { Ucommission } from '../../../../libs/interfaces/commonTypes/commission.interface';
import { retry } from 'rxjs';

@Injectable()
export class CommissionRepositoryService {
    constructor(
        @InjectRepository(Commission)
        private readonly commissionRepository: Repository<Commission>,
    ) { }

    /** 
     * Inserts a new commission into the database.
     * @param input - The commission input data
     * @returns The saved commission entity
     */
    async insertCommission(input: Icommission): Promise<Commission> {
        try {
            const { type, percentage, status } = input;

            // Create a new commission entity
            const newCommission = this.commissionRepository.create({
                type,
                percentage,
                status,
            });

            // Save the commission to the database  
            const result = await this.commissionRepository.save(newCommission);  
            return result;  
        } catch (error) {  
            console.error('Error inserting commission:', error); 
            throw `Failed to insert commission. Please try again later. ${error.message}`; 
        } 
    } 

    /**
     * Retrieves the list of all commissions from the database.
     * @returns A list of commission entities
     */
    async getCommissionList(): Promise<Commission[]> {
        try {
            // Fetch all commissions using QueryBuilder
            const commissions = await this.commissionRepository
                .createQueryBuilder('commission')
                .getMany();

            console.log('Commission list retrieved successfully:', commissions);
            return commissions;
        } catch (error) {
            console.error('Error fetching commission list:', error);
            throw new Error('Failed to fetch commission list. Please try again later.');
        }
    }


    async getCommissionbyId(id:string): Promise<Commission> {
        try{
            const commission = await this.commissionRepository.findOne({ where: { commission_id: id } });
            return commission;
        }catch(error){
            console.log(`Failed to retrive brand: ${error.message}`);
            throw error;
        }
    }

    async updateCommission(input: Ucommission){
        try{
            const { commission_id } = input;
            // Fetch the commission entity to update
            const existingCommission = await this.commissionRepository.findOne({ where: { commission_id } });
            if (!existingCommission) {
                throw `Commission not found with ID: ${commission_id}`;
            }
            // Assign new values to the existing commission entity
            Object.assign(existingCommission, input);
            // Save the updated commission
            const updatedCommission = await this.commissionRepository.save(existingCommission);
            return updatedCommission;
        }catch(error){
            console.log(`Failed to update commission: ${error.message}`);
            throw (`Failed to update commission: ${error.message}`);
        }
    }

}



