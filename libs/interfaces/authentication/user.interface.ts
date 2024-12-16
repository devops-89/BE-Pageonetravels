import { DEVICE_TYPE } from "libs/constants/commonConstants";
import { DEFAULT_USER_ROLES, USER_ACCOUNT_STATUS, USER_LOGIN_SOURCE, USER_TYPE, USER_VERIFY_STATUS } from "../../constants/autenticationConstants/userContants";
import { IPagination } from "../commonTypes/custom.interface";
// import { MultiFileType } from "../commonTypes/fastifyTypes";
// import { IPagination } from "../commonTypes/custom.interface";

export declare namespace UserI {
    interface AddressSchema {
        street: string;
        houseNo: string;
        postalCode: string;
        city: string;
        country: string;
        state: string;
    }

    interface UserSchema {
        id: string,
        full_name: string,
        avatar: string,
        email: string,
        phone_number: string,
        country_code: string,
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
        country_code: string
        id?: string,
        user_type: USER_TYPE,
    }

    interface AddOrUpdateUser
    {
        full_name?: string,
        password?: string,
        phone_number?: string,
        country_code?: string,
        id?: string,
        roleName?: string,
        user_type?: USER_TYPE,
        email: string,
        is_email_verified?: boolean,
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
        userId: string,
        status: USER_ACCOUNT_STATUS,
        verifyStatus: USER_VERIFY_STATUS,
        isPhoneNoVerified?: boolean,
        is_email_verified?: boolean,
        password?: string

    }

    interface Register 
    {
        email: string,
        password: string,
        // userRole: string,
        name: string,
        user_type: USER_TYPE
    }

    interface LoginWithEmail {
        email:string,
        user_type: USER_TYPE
    }


    interface LoginWithPhone {
        phoneNo: string,
        countryCode: string,
        user_type: USER_TYPE
    }
    
    interface VerifyByOtp {
        referenceId: number,
        otp:string
    }

  
    interface LoginWithEmailOrPhone {
        // email: string,
        // phoneNo: string,
        countryCode:string,
        identity: string
        userRole:string,
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
        is_phone_verirfied: boolean,
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
        countryCode: string
    }

    interface AddUser
    {
        name: string,
        email: string,
        // phoneNo: string,
        userRole: DEFAULT_USER_ROLES,
        roleId: string,
    }

    interface VerifyAddUser
    {
        userName: string,
        password: string,
        phoneNo: string,
        countryCode: string
        // avatar
    }

    export interface UpdateUserProfile
    {
        userId: string,
        fullName: string,
        userRole: string,
        userName: string,
        email?: string,
        phoneNo?: string,
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
        refreshToken: string
    }

    interface ChangePassword {
        oldPassword: string,
        newPassword: string,
        otp: string;
        referenceId:number
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
