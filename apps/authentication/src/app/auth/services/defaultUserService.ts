import { Injectable } from '@nestjs/common';
import { USER_ACCOUNT_STATUS, DEFAULT_USER_ROLES, USER_VERIFY_STATUS, USER_GROUP, USER_LOGIN_SOURCE } from '../../../../../../libs/constants/autenticationConstants/userContants'; // Replace 'path-to-your-constants' with the correct path to your constants
import { UserRepositoryService } from '../../../../../../libs/database/src/repositories/user.repository';
import { PermissionManagerService } from '../../../../../../libs/database/src/repositories/permissionManager.repository';
import { UserI } from '../../../../../../libs/interfaces/authentication/user.interface';
import { PermissionManagerI } from '../../../../../../libs/interfaces/authentication/permissionManager.interface';
import { User } from '../../../../../../libs/database/src/entities/user.entity';
import { RolesPermissionMap } from '../../../utils/defaultRolesPermission';
import { generatePasswordHash } from '../../../utils/bcryptUtil';

const defaultUser = {
    email: 'bharathastkaushal@yopmail.com',
    password: 'Pass@123',
    userRole: DEFAULT_USER_ROLES.ADMIN,
    parentId: '',
    name: 'Admin',
  };

@Injectable()
export class DefaultUserService {
  constructor(private readonly userModel: UserRepositoryService, private readonly permissionModel: PermissionManagerService) {}

  async addDefaultUser(): Promise<void> {
    try {
      const checkIfExist = await this.userModel.checkUserEmailExist(defaultUser.email);
      if (checkIfExist) {
        return;
      }

      const passwordHash = await generatePasswordHash(defaultUser.password);
      const userObj: UserI.InsertDefaultUser = 
      {
        password: passwordHash,
        email: defaultUser.email.toLowerCase().trim(),
        verifyStatus: USER_VERIFY_STATUS.VERIFIED,
        status: USER_ACCOUNT_STATUS.ACTIVE,
        parentId: '',
        group: USER_GROUP.ADMIN,
        loginSource: USER_LOGIN_SOURCE.LOCAL,
        name: defaultUser.name,
        isEmailVerified: true
      };
      console.log(userObj)

      const user = await this.userModel.insertDefaultUser(userObj);

        const userId = user.id
        await this.addDefaultRolesAndPermission(userId, true);

        const adminPermission = await this.permissionModel.getPermissionByRoleName({
          roleName: DEFAULT_USER_ROLES.ADMIN,
          createdBy: userId,
        });
        if (adminPermission) {
          await this.userModel.updateRoleAndPermission({ permission: adminPermission.id, roleName: adminPermission.roleName, userId });
        }

      return;
    } catch (error) {
      console.log("Error adding admin user, roles, and permission", error);
      throw error;
    }
  }

  async addDefaultRolesAndPermission(adminId: number, isUpdate: boolean): Promise<void> {
    try {
      const permissionBulkWrite: PermissionManagerI.AddOrUpdatePermissionDb[] = [];

     
    for (const role of Object.values(DEFAULT_USER_ROLES)) 
    {
        switch (role) {
            case DEFAULT_USER_ROLES.ADMIN: {
                await this.userRolesAndPermission(adminId, DEFAULT_USER_ROLES.ADMIN, USER_GROUP.ADMIN, isUpdate, permissionBulkWrite);
                break;
            }
            // case DEFAULT_USER_ROLES.BUYER: {
            //     await this.userRolesAndPermission(adminId, DEFAULT_USER_ROLES.BUYER, USER_GROUP.BUYER, isUpdate, permissionBulkWrite);
            //     break;
            // }
            case DEFAULT_USER_ROLES.SELLER: {
                await this.userRolesAndPermission(adminId, DEFAULT_USER_ROLES.SELLER, USER_GROUP.SELLER, isUpdate, permissionBulkWrite);
                break;
            }
            case DEFAULT_USER_ROLES.USER: {
                await this.userRolesAndPermission(adminId, DEFAULT_USER_ROLES.USER, USER_GROUP.USER, isUpdate, permissionBulkWrite);
                break;
            }

            case DEFAULT_USER_ROLES.MANAGER: {
              await this.userRolesAndPermission(adminId, DEFAULT_USER_ROLES.MANAGER, USER_GROUP.MANAGER, isUpdate, permissionBulkWrite);
              break;
              
          }

            default:
                console.log('Unhandled Role', role);
                break;
        }
    }
      await this.permissionModel.addOrUpdatebulkPermission(permissionBulkWrite);
      return;
    } catch (error) {
      console.log("Error add or update default roles and permission", error);
      throw error;
    }
  }

  async userRolesAndPermission(adminId: number, role: DEFAULT_USER_ROLES, group: USER_GROUP, isUpdate: boolean, permissionBulkWrite: PermissionManagerI.AddOrUpdatePermissionDb[]): Promise<void> {

      const user = new User();
      user.id = adminId;

      const userRole = await this.permissionModel.getPermissionByRoleNameAndGroup({ roleName: role, group });
      if (userRole) {
        if (isUpdate) {
          permissionBulkWrite.push({ createdBy: user, roleName: userRole.roleName, group, permissions: RolesPermissionMap.get(role) || [] });
        }
      } else {
        permissionBulkWrite.push({ createdBy: user, roleName: role, group, permissions: RolesPermissionMap.get(role) || [] });
      }
  
  }

  async updateDefaultRolesAndPermission(): Promise<void> {
    try {
      const admin = await this.userModel.getUserByRoleAndGroup(USER_GROUP.ADMIN, DEFAULT_USER_ROLES.ADMIN);
      if (!admin) {
        return;
      }
      await this.addDefaultRolesAndPermission(admin.id, true);

      return;
    } catch (error) {
      console.log("Error updating admin user, roles, and permission", error);
      throw error;
    }
  }
}

