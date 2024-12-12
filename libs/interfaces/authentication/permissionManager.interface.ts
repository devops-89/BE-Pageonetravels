import { MODULES, PERMISSIONS } from "../../constants/autenticationConstants/permissionManagerConstants";
import { USER_ACCOUNT_STATUS, DEFAULT_USER_ROLES, USER_GROUP } from "../../constants/autenticationConstants/userContants";
import { User } from "../../database/src/entities/user.entity";
import { IPagination } from "../commonTypes/custom.interface";

export declare namespace PermissionManagerI
{
    interface Permission
    {
        moduleName?: string;
        module: number,
        action: {
            [PERMISSIONS.ADD]: boolean,
            [PERMISSIONS.READ]: boolean,
            [PERMISSIONS.UPDATE]: boolean,
            [PERMISSIONS.DELETE]: boolean,
        }
    }
    
    interface PermissionManagerSchema
    {
        id: number
        permissionId: number,
        roleName: string,  // can be duplicate
        createdBy: number,
        permissions:Permission[]
        group: USER_GROUP
        createdAt: Date,
        updatedAt: Date,
    }

    type PermissionManagerType = PermissionManagerSchema & Document

    interface AddPermission {
        roleName: string,
        // roleId: string,
        createdBy: number,
        group: USER_GROUP
        // [key: string]: any
        permissions: Permission[]
    }

    interface PermissionBulkWrite {
        permission:AddPermission
        // updateOne: {
        //     filter: { roleId: string },
        //     update: AddPermission,
        //     upsert: true
        // }
    }

    interface AddOrUpdatePermissionDb {
        roleName: string,
        // roleId: string,
        createdBy: User,
        group: USER_GROUP
        permissions: Permission[]
    }

    interface AddOrUpdatePermissionReq {
        roleName: string,
        permissions: {
            [key: string]: {
                [PERMISSIONS.ADD]: boolean,
                [PERMISSIONS.READ]: boolean,
                [PERMISSIONS.UPDATE]: boolean,
                [PERMISSIONS.DELETE]: boolean,
            }
        }
    }
    interface GetPermissions
    {
        roleName: string
    }
    
    interface GetRoles extends IPagination
    {
    }
    
    interface UpdatePermissionReq {
        permissionId: string,
        roleName: string,
        permissions: {
            [key: string]: {
                [PERMISSIONS.ADD]: boolean,
                [PERMISSIONS.READ]: boolean,
                [PERMISSIONS.UPDATE]: boolean,
                [PERMISSIONS.DELETE]: boolean,
            }
        }
    }

    interface UpdatePermissionDb
    {
        permissions: Permission[],
        roleName: string,
        id: string
    }
}
