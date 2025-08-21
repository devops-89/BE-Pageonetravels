import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { USER_ACCOUNT_STATUS, USER_TYPE } from '../../../../libs/constants/autenticationConstants/userContants';
import { UserRepositoryService } from '../../../../libs/database/src';

@Injectable()
export class CustomerService {
    constructor(private readonly UserModel:UserRepositoryService){}

    async getAllCustomers(): Promise<ApiResponse.ApiOK>{
         const customers=await this.UserModel.getUsersWithFilters({ user_type: USER_TYPE.USER,search: '', status:USER_ACCOUNT_STATUS.ACTIVE }, { page: 1, limit: 10 });
          return {
            message: 'Customers fetched successfully',
            data: customers,
        };
    }
}
