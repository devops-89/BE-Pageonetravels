import { Injectable } from '@nestjs/common';
import { AddressRepositoryService, UserRepositoryService } from '../../../../../libs/database/src';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { PaginationDto, UpdatePersonalDetailDto, UserFilterDto } from '../../../../../libs/dtos/authentication/user.dto';
import { ApiResponse } from '../../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';
import { USER_ACCOUNT_STATUS } from '../../../../../libs/constants/autenticationConstants/userContants';
//import { UserI } from '../../../../../libs/interfaces/authentication/user.interface';
//import { IPaginationObject } from '../../../../../libs/interfaces/commonTypes/custom.interface';
//import { EditAddressDto, InsertAddressDto } from '../../../../../libs/dtos/authentication/address.dto';


@Injectable()
export class UserService {
  constructor(private readonly userRepositoryService: UserRepositoryService,
    private readonly s3Service: S3FileService,
    private readonly addressRepository: AddressRepositoryService,
  ) { }

  async updateUserProfile(payload: JWTPayload, userDto: UpdatePersonalDetailDto, file): Promise<ApiResponse.ApiOK> {
    try {
      const { reference_id } = payload;


      const existingUser = await this.userRepositoryService.getUserByUserId(reference_id);
      if (!existingUser) {
        throw { message: "User Not Found to Update User Profile", status_code: ERROR_CODES.NOT_FOUND }
      }

      let s3FileLocation: string = existingUser.avatar;

      if (file) {
        s3FileLocation = await this.s3Service.s3FileUpload(file.buffer, file.originalname);
      }


      const updatedUserData = {
        id: reference_id,
        full_name: userDto.full_name || existingUser.full_name,
        email: userDto.email || existingUser.email,
        phone_number: userDto.phone_number || existingUser.phone_number,
        country_code: userDto.country_code || existingUser.country_code,
        avatar: s3FileLocation,
      };

      await this.userRepositoryService.addOrUpdateUser(updatedUserData);


      const updatedUser = await this.userRepositoryService.getUserByUserId(reference_id);

      return {
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            phone_number: updatedUser.phone_number,
            country_code: updatedUser.country_code,
            avatar: updatedUser.avatar,
          },
        },
      };
    } catch (error) {
      console.error('Error in Update User Profile:', error);
      throw Error(error.message || "An error occurred while updating the profile.");
    }
  }


  async insertOrUpdateUserAddress(payload: JWTPayload, address) {
    try {

      const { reference_id } = payload;
      const { address_id } = address;
      // let { street, houseNo, country, city, state, postalCode, addressType } = address
      // const userDetails = await this.userRepositoryService.getUserByUserId(referenceId);

      if (address_id) {
        const updateAdd = await this.addressRepository.updateAddress(address);
        // const updateAdd = await this.userRepositoryService.updateUserAddress(address_id, referenceId)
        return { message: "Address updated", data: updateAdd }

      } else {
        const newAdd = await this.addressRepository.insertAddress(address);
        const savedAdd = await this.userRepositoryService.updateUserAddress(newAdd.id, reference_id)
        return { message: "Address updated", data: savedAdd }
      }

    } catch (error) {
      console.log('Error in update user address', error);
      throw error;
    }
  }

  async getUsersByGroup(filter: UserFilterDto, pagination: PaginationDto): Promise<ApiResponse.ApiOK> {
    try {
      const usersList = await this.userRepositoryService.getUsersWithFilters(filter, pagination);
      return { message: "User List fetched successfully", data: usersList }
    }
    catch (error) {
      console.log('Error In Get Users By Group', error);
      throw error;
    }
  }

  async updateUserStatus(user_id: string, status: USER_ACCOUNT_STATUS): Promise<ApiResponse.ApiOK> {
    try {
      if (!status) {
        return { message: "Status can't be null", statusCode: ERROR_CODES.BAD_REQUEST };
      }

      const user = await this.userRepositoryService.getUserByUserId(user_id)
      

      if (!user) {
        return { message: "User not found", statusCode: ERROR_CODES.NOT_FOUND };
      }

      // Call the method to update the user account status
      await this.userRepositoryService.updateUserAccountStatus({ user_id, status });

      return { message: `User status updated to ${status}`, data: user };
    } catch (error) {
      console.log('Error in Update User Status:', error);
      throw { message: "User Status is Not Updated", statusCode: ERROR_CODES.ACCESS_DENIED };
    }
  }

  async GetUserDetails(user_id: string): Promise<ApiResponse.ApiOK> {
    try {
      if (!user_id) {
        return { message: "user_id can't be null", statusCode: ERROR_CODES.BAD_REQUEST };
      }

      const user = await this.userRepositoryService.getUserByUserIdForAdmin(user_id)
      

      if (!user) {
        return { message: "User not found", statusCode: ERROR_CODES.NOT_FOUND };
      }

   // Return required Data, including the new fields
   const { full_name, email, phone_number, last_login, id, addresses, avatar, country_code, is_email_verified, is_phone_verified, user_type, status, created_at } = user;
   return {
     message: "User details fetched successfully",
     data: {
       full_name,
       email,
       phone_number,
       last_login,
       id,
       avatar,
       country_code,
       is_email_verified,
       is_phone_verified,
       user_type,
       status,
       addresses, // Include addresses
       created_at
     }
   };
    } catch (error) {
      console.log('Error in Update User Status:', error);
      throw { message: "User Status is Not Updated", statusCode: ERROR_CODES.ACCESS_DENIED };
    }
  }


  async updateLastLogin(user_id: string): Promise<void> {
    try {
      const user = await this.userRepositoryService.getUserByUserId(user_id);
      if (user) {
        user.last_login = new Date(); // Update the lastLogin field
        await this.userRepositoryService.updateUserAccountStatus({ user_id, status: user.status }); // Assuming you have a method for this
      }
    } catch (error) {
      console.log('Error updating last login:', error);
      throw { message: "Error In Updating Last login Details Of User", status_code: ERROR_CODES.NOT_FOUND };
    }
  }

  async getLoggedInUserDetails(payload: JWTPayload): Promise<ApiResponse.ApiOK> {
    try {
      const { reference_id } = payload
      const user = await this.userRepositoryService.getUserByUserId(reference_id);

      if (!user) {
        throw { message: "User not found", status_code: ERROR_CODES.NOT_FOUND };
      }

      // Return required Data, including the new fields
      const { full_name, email, phone_number, last_login, id, addresses, avatar, country_code, is_email_verified, is_phone_verified, user_type, status, created_at } = user;
      return {
        message: "User details fetched successfully",
        data: {
          full_name,
          email,
          phone_number,
          last_login,
          id,
          avatar,
          country_code,
          is_email_verified,
          is_phone_verified,
          user_type,
          status,
          addresses, // Include addresses
          created_at
        }
      };
    } catch (error) {
      console.log('Error in Get Logged-In User Details:', error);
      throw error;
    }
  }
}
