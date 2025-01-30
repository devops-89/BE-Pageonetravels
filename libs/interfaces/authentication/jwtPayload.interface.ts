import { USER_TYPE } from "../../constants/autenticationConstants/userContants";
import { ERROR_CODES, ErrorMessages, TOKEN_TYPE } from "../../constants/commonConstants";

export interface JWTPayload
{
    reference_id: string,
    guest_id: string,
    refresh_token: string,
    user_role: string,
    session_id: string,
    user_type: USER_TYPE,
    token_type: TOKEN_TYPE 
}
export interface JWTPayloadForGuest
{
    guest_id: string,
    token_type: TOKEN_TYPE
}

export interface VerifyJWTTokenResult
{
    verified: Boolean,
    error_message: ErrorMessages | null,
    error_code: ERROR_CODES | 0,
    payload: JWTPayload
}

export interface AddUserPayload
{
    reference_id: number,  //user_id
    member_request_id: string,
    token_type: TOKEN_TYPE
}