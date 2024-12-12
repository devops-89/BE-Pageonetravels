import { Injectable } from '@nestjs/common';
import { AddressRepositoryService, UserRepositoryService } from '../../../../../libs/database/src';
import { PaginationDto, UpdatePersonalDetailDto, UserFilterDto } from '../../../../../libs/dtos/authentication/user.dto';
import { ApiResponse } from '../../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
import { USER_ACCOUNT_STATUS } from '../../../../../libs/constants/autenticationConstants/userContants';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
// import { EditAddressDto, InsertAddressDto } from '../../../../../libs/dtos/authentication/address.dto';


@Injectable()
export class UserService {
  constructor(private readonly userRepositoryService: UserRepositoryService,
    private readonly s3Service: S3FileService,
    private readonly addressRepository: AddressRepositoryService,
  ) { }

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


  async updateUserStatus(userId: number, status: USER_ACCOUNT_STATUS): Promise<ApiResponse.ApiOK> {
    try {
      if (!status) {
        return { message: "Status can't be null", statusCode: ERROR_CODES.BAD_REQUEST };
      }

      const user = await this.userRepositoryService.getUserByUserId(userId);

      if (!user) {
        return { message: "User not found", statusCode: ERROR_CODES.NOT_FOUND };
      }

      // Call the method to update the user account status
      await this.userRepositoryService.updateUserAccountStatus({ userId, status });

      return { message: `User status updated to ${status}`, data: user };
    } catch (error) {
      console.log('Error in Update User Status:', error);
      throw { message: "User Status is Not Updated", statusCode: ERROR_CODES.ACCESS_DENIED };
    }
  }

  async getLoggedInUserDetails(payload: JWTPayload): Promise<ApiResponse.ApiOK> {
    try {
      const { referenceId } = payload
      const user = await this.userRepositoryService.getUserByUserId(referenceId);

      if (!user) {
        throw { message: "User not found", statusCode: ERROR_CODES.NOT_FOUND };
      }

      // Return required Data, including the new fields
      const { name, email, phoneNo, lastLogin, id, addresses, avatar, countryCode, isEmailVerified, isPhoneNoVerified, roleName, group, status, createdAt } = user;
      return {
        message: "User details fetched successfully",
        data: {
          name,
          email,
          phoneNo,
          lastLogin,
          id,
          avatar,
          countryCode,
          isEmailVerified,
          isPhoneNoVerified,
          roleName,
          group,
          status,
          addresses, // Include addresses
          createdAt
        }
      };
    } catch (error) {
      console.log('Error in Get Logged-In User Details:', error);
      throw error;
    }
  }


  async updateUserProfile(payload: JWTPayload, userDto: UpdatePersonalDetailDto, file): Promise<ApiResponse.ApiOK> {
    try {
        const { referenceId } = payload;

        console.log("Incoming User DTO:", userDto);
        console.log("Uploaded File:", file);

        // Check if user exists
        const existingUser = await this.userRepositoryService.getUserByUserId(referenceId);
        if (!existingUser) {
            throw new Error("User Not Found");
        }

        let s3FileLocation: string = existingUser.avatar;

        // Handle file upload if provided
        if (file) {
            s3FileLocation = await this.s3Service.s3FileUpload(file.buffer, file.originalname);
        }

        // Prepare user update object
        const updatedUserData = {
            id: referenceId,
            name: userDto.name || existingUser.name,
            email: userDto.email || existingUser.email,
            phoneNo: userDto.phoneNo || existingUser.phoneNo,
            countryCode: userDto.countryCode || existingUser.countryCode,
            avatar: s3FileLocation,
        };

        // Update user profile
        await this.userRepositoryService.addOrUpdateUser(updatedUserData);

        // Fetch updated user information
        const updatedUser = await this.userRepositoryService.getUserByUserId(referenceId);

        return {
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phoneNo: updatedUser.phoneNo,
                    countryCode: updatedUser.countryCode,
                    avatar: updatedUser.avatar,
                },
            },
        };
    } catch (error) {
        console.error('Error in Update User Profile:', error);
        throw new Error(error.message || "An error occurred while updating the profile.");
    }
}



  async updateLastLogin(userId: number): Promise<void> {
    try {
      const user = await this.userRepositoryService.getUserByUserId(userId);
      if (user) {
        user.lastLogin = new Date(); // Update the lastLogin field
        await this.userRepositoryService.updateUserAccountStatus({ userId, status: user.status }); // Assuming you have a method for this
      }
    } catch (error) {
      console.log('Error updating last login:', error);
      throw { message: "Error In Updating Last login Details Of User", statusCode: ERROR_CODES.NOT_FOUND };
    }
  }


  async insertOrUpdateUserAddress(payload: JWTPayload, address) {
    try {

      const { referenceId } = payload;
      const { addressId } = address;
      // let { street, houseNo, country, city, state, postalCode, addressType } = address
      // const userDetails = await this.userRepositoryService.getUserByUserId(referenceId);

      if (addressId) {
        const updateAdd = await this.addressRepository.updateAddress(address);
        // const updateAdd = await this.userRepositoryService.updateUserAddress(addressId, referenceId)
        return { message: "Address updated", data: updateAdd }

      } else {
        const newAdd = await this.addressRepository.insertAddress(address);
        const savedAdd = await this.userRepositoryService.updateUserAddress(newAdd.id, referenceId)
        return { message: "Address updated", data: savedAdd }
      }

    } catch (error) {
      console.log('Error in update user address', error);
      throw error;
    }
  }
}
