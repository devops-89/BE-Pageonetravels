import { DEVICE_TYPE } from "libs/constants/commonConstants";
import { DEFAULT_USER_ROLES, USER_ACCOUNT_STATUS, USER_LOGIN_SOURCE, USER_TYPE, USER_VERIFY_STATUS } from "../../constants/autenticationConstants/userContants";
import { IPagination } from "../commonTypes/custom.interface";
// import { MultiFileType } from "../commonTypes/fastifyTypes";

export declare namespace UserI {
    interface AddressSchema {
        street: string;
        house_number: string;
        postal_code: string;
        city: string;
        country: string;
        state: string;
    }

    interface UserSchema {
        id: string,
        full_name: string,
        avatar: string,
        email: string,
        country_code: string,
        status: USER_ACCOUNT_STATUS,
        verify_status: USER_VERIFY_STATUS,
        phone_number: string,
        password: string,
        user_type: USER_TYPE,
        is_phone_verified: boolean,
        is_email_verified: boolean,
        created_at: Date,
        last_login?: Date,
        addresses?: AddressSchema[];
    }

    type UserType = UserSchema & Document


    interface InsertUserByEmail
    {
        full_name?: string,
        email: string,
        password?: string,
        user_type?: USER_TYPE,
        id?:string,
        verify_status: USER_VERIFY_STATUS,
        status?:USER_ACCOUNT_STATUS,
        loginSource: USER_LOGIN_SOURCE.LOCAL,
        country_code?: string,
        phone_number?: string,
    }


    interface InsertUserByPhone
    {
        phone_number: string,
        country_code:string,
        id?: string,
        user_type: USER_TYPE,
    }

    interface AddOrUpdateUser
    {
        full_name?: string,
        password?: string,
        email?: string,
        is_email_verified?: boolean,
        country_code?: string,
        phone_number?: string,
        status?: USER_ACCOUNT_STATUS,
        id?: string,
        user_id?: string,
        user_type?: USER_TYPE,
        verify_status?:USER_VERIFY_STATUS,
        avatar?:string
        loginSource?:USER_LOGIN_SOURCE,
    }

    interface InsertDefaultUser 
    {
        email: string,
        password: string,
        user_type: USER_TYPE,
        full_name: string,
        status: USER_ACCOUNT_STATUS,
        verify_status?: USER_VERIFY_STATUS,
        is_email_verified:boolean
    }


    
    interface PermissionObj {
        // role_name?: string;
        user_type?: string;
        //permission?: number;
    }


    interface UpdateRoleAndPermission
    {
        //role_name: string, 
        user_id:string

    }

    interface UpdateUserStatus
    {
        id:string,
        status: USER_ACCOUNT_STATUS,
        verify_status: USER_VERIFY_STATUS,
        is_phone_verified?: boolean,
        is_email_verified?: boolean,
        password?: string

    }

    interface Register 
    {
        email: string,
        password: string,
        // user_role: string,
        full_name: string,
        user_type: USER_TYPE
    }

    interface LoginWithEmail {
        email:string,
        user_type: USER_TYPE
    }


    interface LoginWithPhone {
        phone_number: string,
        country_code: string,
        user_type: USER_TYPE,
    }
    
    interface VerifyByOtp {
        reference_id: number,
        otp:string
    }

  
    interface LoginWithEmailOrPhone {
        // email: string,
        // phone_number: string,
        country_code:string,
        identity: string
        user_role:string,
        user_type: string
    }

    interface UpdateProfile {
        user_id: string,
        full_name: string,
        email: string,
        phone_number: string,
        country_code: string,
        password: string,
        avatar: string,
    }
    export interface UpdatePersonalDetailRequest
    {
        full_name: string,
        phone_number: string,
        country_code: string,
        email: string
    }

    interface UpdateEmailById
    {
        user_id: number,
        email: string,
        is_email_verified: boolean
    }

    interface UpdatePhoneById
    {
        phone_number: string,
        user_id: number,
        is_phone_verified: boolean,
        country_code: string
    }

    interface AddUser
    {
        full_name: string,
        email: string,
        // phone_number: string,
        user_role: DEFAULT_USER_ROLES,
        roleId: string,
    }

    interface VerifyAddUser
    {
        user_name: string,
        password: string,
        phone_number: string,
        country_code: string
        // avatar
    }

    export interface UpdateUserProfile
    {
        user_id: string,
        full_name: string,
        user_role: string,
        user_name: string,
        email?: string,
        phone_number?: string,
        password?: string,
    }

    interface GetChildListDb
    {
        parentId: number
    }

    interface UpdatePasswordByUserId
    {
        user_id: number,
        password: string

    }

    interface UpdateParentByUserId
    {
        user_id: number,
        parentId: string
    }

    interface RenewAccessToken {
        access_token: string,
        refresh_token: string
    }

    interface ChangePassword {
        old_password: string,
        new_password: string,
        // otp: string;
        // reference_id:string
    }

    interface UpdateUserAccountStatus
    {
        user_id: string,
        status: USER_ACCOUNT_STATUS
    }
    interface GetUsersByFilter extends IPagination
    {
        user_type?: USER_TYPE,
        status?: USER_ACCOUNT_STATUS,
        parentId?: number,
        search?: string,
        is_phone_verified?: boolean, 
        is_email_verified?: boolean 
        
    }
}
