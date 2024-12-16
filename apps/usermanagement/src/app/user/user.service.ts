import { Injectable } from '@nestjs/common';
import { AddressRepositoryService, UserRepositoryService } from '../../../../../libs/database/src';
// import { PaginationDto, UpdatePersonalDetailDto, UserFilterDto } from '../../../../../libs/dtos/authentication/user.dto';
// import { ApiResponse } from '../../../../../libs/interfaces/commonTypes/apiResponse.interface';
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

}
