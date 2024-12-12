import { DEVICE_TYPE } from "../../constants/commonConstants";
import { LOGIN_BY, SESSION_STATUS, USER_GROUP } from "../../constants/autenticationConstants/userContants"

export declare namespace LoginSessionI
{
    interface LoginSessionSchema
    {
        id: number,
        userId: number,
        refreshToken: string,
        loginBy: LOGIN_BY,
        loginIdentity: string,
        loginStatus: SESSION_STATUS,
        refreshTokenExpiry: number,
        createdAt: Date,
        updatedAt: Date
    }

    type LoginSessionType = LoginSessionSchema & Document

    interface insertLoginSession
    {
        userId: number,
        refreshToken: string,
        loginStatus: SESSION_STATUS,
        refreshTokenExpiry: number,
        loginBy: LOGIN_BY,
        loginIdentity: string,
        fcmToken?:string,
        deviceType?:DEVICE_TYPE
    }

    interface GetLoginToken {
        userId: number;
        loginBy: LOGIN_BY;
        loginIdentity: string;
        roleName?: string;
        permissionId?: number;
        group?: USER_GROUP;
        fcmToken?:string;
        deviceType?:DEVICE_TYPE;
    }


}
