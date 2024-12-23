import { DEVICE_TYPE } from "../../constants/commonConstants";
import { LOGIN_BY, SESSION_STATUS, USER_TYPE } from "../../constants/autenticationConstants/userContants"

export declare namespace LoginSessionI
{
    interface LoginSessionSchema
    {
        id: string,
        user_id: string,
        refresh_token: string,
        loginBy: LOGIN_BY,
        login_identity: string,
        loginStatus: SESSION_STATUS,
        refreshTokenExpiry: number,
        created_at: Date,
        updatedAt: Date
    }

    type LoginSessionType = LoginSessionSchema & Document

    interface insertLoginSession
    {
        user_id: string,
        refresh_token: string,
        loginStatus: SESSION_STATUS,
        refreshTokenExpiry: number,
        loginBy: LOGIN_BY,
        login_identity: string,
        fcmToken?:string,
        device_type?:DEVICE_TYPE
    }

    interface GetLoginToken {
        user_id: string;
        loginBy: LOGIN_BY;
        login_identity: string;
        // role_name?: string;
        user_type?: USER_TYPE;
        fcmToken?:string;
        device_type?:DEVICE_TYPE;
    }


}
