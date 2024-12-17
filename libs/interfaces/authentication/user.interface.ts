import { DEVICE_TYPE } from "libs/constants/commonConstants";
import { DEFAULT_USER_ROLES, USER_ACCOUNT_STATUS, USER_LOGIN_SOURCE, USER_TYPE, USER_VERIFY_STATUS } from "../../constants/autenticationConstants/userContants";
import { IPagination } from "../commonTypes/custom.interface";
// import { MultiFileType } from "../commonTypes/fastifyTypes";
// import { IPagination } from "../commonTypes/custom.interface";

export declare namespace UserI {
    interface AddressSchema {
        street: string;
        houseNo: string;
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
        createdAt: Date,
        addresses?: AddressSchema[];
    }

    type UserType = UserSchema & Document


    interface InsertUserByEmail
    {
        name?: string,
        email: string,
        password?: string,
        user_type?: USER_TYPE,
        id?:string,
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
        email: string,
        is_email_verified?: boolean,
        country_code?: string,
        phone_number?: string,
        id?: string,
        roleName?: string,
        user_type?: USER_TYPE,
        avatar?:string
    }

    interface InsertDefaultUser 
    {
        email: string,
        password: string,
        user_type: USER_TYPE,
        full_name: string,
        is_email_verified?: boolean
    }

    interface UpdateRoleAndPermission
    {
        roleName: string, 
        userId:string
    }

    interface UpdateUserStatus
    {
        user_id:string,
        status: USER_ACCOUNT_STATUS,
        verify_status: USER_VERIFY_STATUS,
        isPhoneNoVerified?: boolean,
        is_email_verified?: boolean,
        password?: string

    }

    interface Register 
    {
        email: string,
        password: string,
        // user_role: string,
        name: string,
        user_type: USER_TYPE
    }

    interface LoginWithEmail {
        email:string,
        user_type: USER_TYPE
    }


    interface LoginWithPhone {
        phone_number: string,
        country_code: string,
        user_type: USER_TYPE
    }
    
    interface VerifyByOtp {
        reference_id: number,
        otp:string
    }

  
    interface LoginWithEmailOrPhone {
        // email: string,
        // phone_no: string,
        country_code:string,
        identity: string
        user_role:string,
        user_type: string
    }

    interface UpdateProfile {
        userId: string,
        name: string,
        email: string,
        phone_number: string,
        country_code: string,
        password: string,
        avatar: string,
        phone_no: boolean,
    }
    export interface UpdatePersonalDetailRequest
    {
        name: string,
        phone_number: string,
        country_code: string,
        email: string
    }

    interface UpdateEmailById
    {
        userId: number,
        email: string,
        is_email_verified: boolean
    }

    interface UpdatePhoneById
    {
        phone_number: string,
        userId: number,
        isPhoneNoVerified: boolean,
        country_code: string
    }

    interface AddUser
    {
        name: string,
        email: string,
        // phone_no: string,
        user_role: DEFAULT_USER_ROLES,
        roleId: string,
    }

    interface VerifyAddUser
    {
        user_name: string,
        password: string,
        phone_no: string,
        country_code: string
        // avatar
    }

    export interface UpdateUserProfile
    {
        userId: string,
        fullName: string,
        user_role: string,
        user_name: string,
        email?: string,
        phone_no?: string,
        password?: string,
    }

    interface GetChildListDb
    {
        parentId: number
    }

    interface UpdatePasswordByUserId
    {
        userId: number,
        password: string

    }

    interface UpdateParentByUserId
    {
        userId: number,
        parentId: string
    }

    interface RenewAccessToken {
        accessToken: string,
        refresh_token: string
    }

    interface ChangePassword {
        old_password: string,
        new_password: string,
        otp: string;
        reference_id:number
    }

    interface UpdateUserAccountStatus
    {
        userId: string,
        status: USER_ACCOUNT_STATUS
    }
    interface GetUsersByFilter extends IPagination
    {
        user_type?: USER_TYPE,
        status?: USER_ACCOUNT_STATUS,
        parentId?: number,
        search?: string,
        isPhoneNoVerified?: boolean, 
        is_email_verified?: boolean 

    }
}
