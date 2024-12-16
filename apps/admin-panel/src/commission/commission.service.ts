import { Injectable } from '@nestjs/common';
import { CommissionRepositoryService } from '../../../../libs/database/src/repositories/commission.repository';
import { AddCommissionDto } from '../../../../libs/dtos/admin/commission.dto';
import { UpdateCommissionDto } from '../../../../libs/dtos/admin/commission.dto';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { ApiResponse } from 'libs/interfaces/commonTypes/apiResponse.interface';

@Injectable()
export class CommissionService {
    constructor(private readonly commissionRepositoryService:CommissionRepositoryService){}
    
    async addCommissionData(commissionDto: AddCommissionDto) {
        try { 
            const { type, percentage, status } = commissionDto;
            const commission = await this.commissionRepositoryService.insertCommission({ type, percentage, status });
            return { message: 'Successfully Inserted Commission', commission: commission };
        } catch (error) {
            console.log('Adding Commission', error);
            throw error;
        }
    }  

    async getCommissionList(){
        try{
            const commissionlist = await this.commissionRepositoryService.getCommissionList();
            return { message: 'Commission Service List', commissionlist: commissionlist };
        }catch(error){
            throw (`Commission Service List Error: ${error.message}`);
        }
    }


    async updateCommissionData(updateDto: UpdateCommissionDto):Promise<ApiResponse.ApiOK>{
        try{
            const { commission_id, type,percentage,status} = updateDto;
            // check if brand Exists
            const existingCommission = await this.commissionRepositoryService.getCommissionbyId(commission_id);
            if (!existingCommission) {
                throw { statusCode: ERROR_CODES.NOT_FOUND, message: `Commission not found` };
            }

            const updateCommission = await this.commissionRepositoryService.updateCommission({commission_id,
                type: type ?? existingCommission.type,
                percentage : percentage ?? existingCommission.percentage,
                status: status ?? existingCommission.status
            });

            return { message: 'Successfully updated Brand', data: updateCommission }; ;

        }catch(error){
            throw (`Commission Update Error: ${error.message}`);
        }
    }

}
