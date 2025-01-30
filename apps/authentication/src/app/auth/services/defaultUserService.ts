import { Injectable } from '@nestjs/common';
import { DEFAULT_USER_ROLES, USER_ACCOUNT_STATUS, USER_TYPE } from '../../../../../../libs/constants/autenticationConstants/userContants'; // Replace 'path-to-your-constants' with the correct path to your constants
import { UserRepositoryService } from '../../../../../../libs/database/src/repositories/user.repository';
import { UserI } from '../../../../../../libs/interfaces/authentication/user.interface';
import { generatePasswordHash } from '../../../utils/bcryptUtil';

const defaultUser = {
    email: 'admin@yopmail.com',
    password: 'Admin@123',
    user_type: DEFAULT_USER_ROLES.ADMIN,
    full_name: 'admin',
  };

@Injectable()
export class DefaultUserService {
  constructor(private readonly userModel: UserRepositoryService) {}

  async addDefaultUser(): Promise<void> {
    try {
      const checkIfExist = await this.userModel.checkUserEmailExist(defaultUser.email);
      
      if (checkIfExist) { 
        return;
      }
      
      const password_hash = await generatePasswordHash(defaultUser.password);

      const userObj: UserI.InsertDefaultUser = 
      {
        password: password_hash,
        email: defaultUser.email.toLowerCase().trim(),
        user_type: USER_TYPE.ADMIN,
        full_name: defaultUser.full_name,
        is_email_verified: true,
        status: USER_ACCOUNT_STATUS.ACTIVE,

      };
      
      await this.userModel.insertDefaultUser(userObj);

      return;
    } catch (error) {
      console.log("Error adding admin user, roles, and permission", error);
      throw error;
    }
  }
}

