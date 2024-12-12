import { DEFAULT_USER_ROLES, USER_ACCOUNT_STATUS, USER_GROUP } from "../../constants/autenticationConstants/userContants"
import { IPagination } from "../commonTypes/custom.interface"

export declare namespace AdminI {
    interface GetUsers extends IPagination 
    {
        userRole?: DEFAULT_USER_ROLES,
        group?: USER_GROUP,
        sortBy?: {
            "Registered On": "ASC" | "DESC",
            Name: "ASC" | "DESC"
        }
        search?: string
    }

    interface GetUserRoles extends IPagination 
    { }
   
    interface LoginWithEmailPassword {
        email:string,
        password:string
    }
   
    interface AddStaffMember {
        email: string,
        password: string,
        name: string,
        designation: string,
        permissionId: string,
        group: USER_GROUP,
        phoneNo: string,
        countryCode: string
    }

    interface ChangePassword {
        oldPassword: string,
        newPassword: string,
        email: string
    }

    interface BlockUser {
        userId: string,
        status: USER_ACCOUNT_STATUS
    }

    interface getCounts {
        userId: string,
        status: USER_ACCOUNT_STATUS
    }

}