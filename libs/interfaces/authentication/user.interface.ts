import { DEVICE_TYPE } from "libs/constants/commonConstants";
import { DEFAULT_USER_ROLES, USER_ACCOUNT_STATUS, USER_GROUP, USER_LOGIN_SOURCE, USER_VERIFY_STATUS } from "../../constants/autenticationConstants/userContants";
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
        addressType: string; // "HOME", "OFFICE"
        isDefault: boolean; 
    }
    interface UserSchema {
        id: number,
        name: string,
        avatar: string,
        email: string,
        phoneNo: string,
        countryCode: string,
        password: string,
        status: USER_ACCOUNT_STATUS,
        verifyStatus: USER_VERIFY_STATUS,
        roleName: string, 
        permission: number // permissionId
        parent: number,
        addedBy: number,
        group: USER_GROUP,
        loginSource: USER_LOGIN_SOURCE,
        isPhoneNoVerified: boolean,
        isEmailVerified: boolean,
        guestUserId: string,
        createdAt: Date,
        lastLogin?: Date,
        addresses?: AddressSchema[];
    }

    type UserType = UserSchema & Document


    interface InsertUserByEmail
    {
        name?: string,
        email: string,
        password?: string,
        status: USER_ACCOUNT_STATUS,
        parent?: number,
        addedBy?: number,
        roleName?: string, 
        permission?: number
        verifyStatus: USER_VERIFY_STATUS,
        group?: USER_GROUP,
        loginSource: USER_LOGIN_SOURCE,
        id?:number,
        guestUserId?: string
    }


    interface InsertUserByPhone
    {
        phoneNo: string,
        countryCode: string
        status: USER_ACCOUNT_STATUS,
        verifyStatus: USER_VERIFY_STATUS,
        id?: number,
        roleName: string,
        group: USER_GROUP,
        permission: number
    }

    interface AddOrUpdateUser
    {
        name?: string,
        password?: string,
        parent?: number,
        phoneNo?: string,
        countryCode?: string,
        status?: USER_ACCOUNT_STATUS,
        verifyStatus?: USER_VERIFY_STATUS,
        id?: number,
        roleName?: string,
        group?: USER_GROUP,
        permission?: number,
        email: string,
        isEmailVerified?: boolean,
        avatar?:string,
        loginSource?:USER_LOGIN_SOURCE,
        lastLogin?: Date;

    }

    interface PermissionObj {
        roleName?: string;
        group?: string;
        permission?: number;
    }

    interface InsertDefaultUser 
    {
        email: string,
        password: string,
        status: USER_ACCOUNT_STATUS,
        // isVerified: boolean,
        verifyStatus: USER_VERIFY_STATUS,
        parentId: string,
        group: USER_GROUP,
        loginSource:USER_LOGIN_SOURCE,
        name: string,
        isEmailVerified?: boolean
    }

    interface UpdateRoleAndPermission
    {
        roleName: string, 
        permission: number // permissionId
        userId:number
    }

    interface UpdateUserStatus
    {
        userId: number,
        status: USER_ACCOUNT_STATUS,
        verifyStatus: USER_VERIFY_STATUS,
        isPhoneNoVerified?: boolean,
        isEmailVerified?: boolean,
        password?: string

    }

    interface Register 
    {
        email: string,
        password: string,
        // userRole: string,
        name: string,
        group: USER_GROUP
    }

    interface LoginWithEmail {
        email:string,
        group: USER_GROUP
    }


    interface LoginWithPhone {
        phoneNo: string,
        countryCode: string,
        userRole?: string,
        group: USER_GROUP
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
        group: string
    }

    interface UpdateProfile {
        userId: number,
        name: string,
        email: string,
        phoneNo: string,
        countryCode: string,
        password: string,
        avatar: string,
        status: USER_ACCOUNT_STATUS,
        verifyStatus: USER_VERIFY_STATUS,
        // countryName: string,
        isPhoneNoVerified: boolean,
        zipCode: string
    }
    // interface ProfileImages extends MultiFileType
    // {    }
    export interface UpdatePersonalDetailRequest
    {
        name: string,
        // countryName: string,
        zipCode: string,
        phoneNo: string,
        countryCode: string,
        email: string
    }

    interface UpdateEmailById
    {
        userId: number,
        email: string,
        isEmailVerified: boolean
    }

    interface UpdatePhoneById
    {
        phoneNo: string,
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
        userId: number,
        status: USER_ACCOUNT_STATUS
    }
    interface GetUsersByFilter extends IPagination
    {
        group?: USER_GROUP,
        status?: USER_ACCOUNT_STATUS,
        parentId?: number,
        search?: string,
        isPhoneNoVerified?: boolean, 
        isEmailVerified?: boolean 

    }
}
