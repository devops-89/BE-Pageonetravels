import { USER_TYPE } from "../../constants/autenticationConstants/userContants";
import { ERROR_CODES, ErrorMessages, TOKEN_TYPE } from "../../constants/commonConstants";

export interface JWTPayload
{
    referenceId: string,  //userId
    guestId: string,
    refreshToken: string,
    userRole: string,
    sessionId: number,
    user_type: USER_TYPE,
    tokenType: TOKEN_TYPE
}

export interface VerifyJWTTokenResult
{
    verified: Boolean,
    errorMessage: ErrorMessages | null,
    errorCode: ERROR_CODES | 0,
    payload: JWTPayload
}

export interface AddUserPayload
{
    referenceId: number,  //userId
    memberRequestId: string,
    tokenType: TOKEN_TYPE
}