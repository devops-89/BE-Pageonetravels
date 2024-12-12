import { USER_GROUP } from "../../constants/autenticationConstants/userContants";
import { ERROR_CODES, ErrorMessages, TOKEN_TYPE } from "../../constants/commonConstants";

export interface JWTPayload
{
    referenceId: number,  //userId
    guestId: string,
    refreshToken: string,
    userRole: string,
    permissionId: number,
    sessionId: number,
    group: USER_GROUP,
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