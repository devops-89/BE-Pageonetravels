import { LOGIN_BY, SESSION_STATUS, USER_TYPE } from "../../constants/autenticationConstants/userContants"

export declare namespace CustomAuthI
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
    }

    interface GetLoginToken {
        userId: number;
        loginBy: LOGIN_BY;
        loginIdentity: string;
        roleName?: string;
        group?: USER_TYPE;
    }


}
