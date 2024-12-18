import { Injectable } from '@nestjs/common';
import { AddressRepositoryService, UserRepositoryService } from '../../../../../libs/database/src';
import { PaginationDto, UserFilterDto } from 'libs/dtos/authentication/user.dto';
// import { PaginationDto, UpdatePersonalDetailDto, UserFilterDto } from '../../../../../libs/dtos/authentication/user.dto';
 import { ApiResponse } from '../../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { retry } from 'rxjs';
import { USER_TYPE } from 'libs/constants/autenticationConstants/userContants';
// import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';
// import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
// import { USER_ACCOUNT_STATUS } from '../../../../../libs/constants/autenticationConstants/userContants';
// import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
// import { EditAddressDto, InsertAddressDto } from '../../../../../libs/dtos/authentication/address.dto';


@Injectable()
export class UserService {
  constructor(private readonly userRepositoryService: UserRepositoryService,
    // private readonly s3Service: S3FileService,
    private readonly addressRepository: AddressRepositoryService,
  ) { }
  
  async getUsersByGroup(pagination: PaginationDto): Promise<ApiResponse.ApiOK>{
    try{
    
      const userList = await this.userRepositoryService.getUserWithFilters( pagination);
      return {message:"User List Fetched Successfully.",data:userList} 
    }catch(error){
      console.log('Error In Get Users By Group', error);
      throw error;
    }
  }

}
