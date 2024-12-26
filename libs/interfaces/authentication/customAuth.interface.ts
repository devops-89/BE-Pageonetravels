import { LOGIN_BY, SESSION_STATUS, USER_TYPE } from "../../constants/autenticationConstants/userContants"

export declare namespace CustomAuthI
{
    interface LoginSessionSchema
    {
        id: number,
        user_id: number,
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
        user_id: number,
        refresh_token: string,
        loginStatus: SESSION_STATUS,
        refreshTokenExpiry: number,
        loginBy: LOGIN_BY,
        login_identity: string,
    }

    interface GetLoginToken {
        user_id: number;
        loginBy: LOGIN_BY;
        login_identity: string;
        // role_name?: string;
        user_type?: USER_TYPE;
    }


}
