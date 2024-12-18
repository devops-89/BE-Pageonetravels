import { DEFAULT_USER_ROLES, USER_ACCOUNT_STATUS, USER_TYPE } from "../../constants/autenticationConstants/userContants"
import { IPagination } from "../commonTypes/custom.interface"

export declare namespace AdminI {
    interface GetUsers extends IPagination 
    {
        user_type?: USER_TYPE,
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
        new_password: string,
        designation: string,
        user_type: USER_TYPE,
        phone_no: string,
        reference_id: string
    }

    interface ChangePassword {
        old_password: string,
        new_password: string,
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