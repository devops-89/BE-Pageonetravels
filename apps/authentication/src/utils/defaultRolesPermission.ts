import { MODULES, PERMISSIONS } from "../../../../libs/constants/autenticationConstants/permissionManagerConstants";
import { DEFAULT_USER_ROLES } from "../../../../libs/constants/autenticationConstants/userContants";
import { PermissionManagerI } from "../../../../libs/interfaces/authentication/permissionManager.interface";

export const RolesPermissionMap = new Map<DEFAULT_USER_ROLES,PermissionManagerI.Permission[]>();

RolesPermissionMap.set(DEFAULT_USER_ROLES.ADMIN, adminPermission());


// RolesPermissionMap.set(DEFAULT_USER_ROLES.BUYER, [
//     {
//         module: MODULES.Buyer,
//         action: { [PERMISSIONS.ADD]: true, [PERMISSIONS.READ]: true, [PERMISSIONS.UPDATE]: true, [PERMISSIONS.DELETE]: true },
//     }
// ]);

RolesPermissionMap.set(DEFAULT_USER_ROLES.SELLER, [
    {
        module: MODULES.Seller,
        action: { [PERMISSIONS.ADD]: true, [PERMISSIONS.READ]: true, [PERMISSIONS.UPDATE]: true, [PERMISSIONS.DELETE]: true },
    }
]);

RolesPermissionMap.set(DEFAULT_USER_ROLES.MANAGER, [
    {
        module: MODULES.Management,
        action: { [PERMISSIONS.ADD]: true, [PERMISSIONS.READ]: true, [PERMISSIONS.UPDATE]: true, [PERMISSIONS.DELETE]: true },
    }
]);

RolesPermissionMap.set(DEFAULT_USER_ROLES.USER, [
    {
        module: MODULES.Buyer,
        action: { [PERMISSIONS.ADD]: true, [PERMISSIONS.READ]: true, [PERMISSIONS.UPDATE]: true, [PERMISSIONS.DELETE]: true },
    }
]);

function adminPermission()
{
    const permission: PermissionManagerI.Permission[] = []
    for (const module of Object.values(MODULES)) {
        permission.push({
            module: module as number,
            action: { [PERMISSIONS.ADD]: true, [PERMISSIONS.READ]: true, [PERMISSIONS.UPDATE]: true, [PERMISSIONS.DELETE]: true }
        })
    }
    return permission;
}