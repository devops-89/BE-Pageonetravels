export enum ERROR_CODES {
    UNEXPECTED_ERROR = 501,
    OUTGOING_API_ERROR = 777,
    ERROR_UNKNOWN_SHOW_TO_USER = 408,
    DUPLICATE_RESOURCE = 409,
    ERROR_CANNOT_FULLFILL_REQUEST = 417,
    DATABASE_ERROR = 461,
    DATABASE_DUPLICATE_ERROR_CODE = 465,
    ACCESS_DENIED = 403,
    INVALID_ROUTE_URL = 608,
    INVALID_BASE_URL = 609,
    JWT_TOKEN_INVALID = 498,
    JWT_TOKEN_EXPIRED = 463,
    NOT_AUTHORIZED = 401,
    NOT_FOUND = 404,
    BAD_REQUEST = 400,
    UNSUPPORTED_MEDIA_TYPE = 415,
    UNVERIFIED_ACCOUNT = 466,
    BLOCKED_USER = 468,
    TEST_DRIVE_TAKEN = 470
}

export enum ErrorMessages {
    UNEXPECTED_ERROR = "Unexpected Error",
    SOMETHING_WENT_WRONG = "Something Went Wrong",
    JWT_TOKEN_INVALID = "Invalid Token",
    JWT_TOKEN_EXPIRED = "Session Expired",
    NOT_AUTHORIZED = "NOT_AUTHORIZED",
    ACCESS_DENIED = "ACCESS_DENIED"
}

export const ExpressRequestParams =
{
    IP_ADDRESS: "ip_address",
    AUTH_PAYLOAD: "auth_payload"
}

export type HttpMethod = "POST" | "GET" | "PUT" | "DELETE"

export interface ApiEndPoint {
    httpMethod: HttpMethod,
    url: string
}

export const S3_FOLDER =
{
    PROFILE: 'profile',
    products: 'products'
}


export enum TOKEN_TYPE {
    GUEST_LOGIN = "GUEST_LOGIN",
    USER_LOGIN = "USER_LOGIN"
}


export enum PLATFORM {
    WEB = "WEB",
    ANDROID = "ANDROID",
    IOS = "IOS"
}

export enum DEVICE_TYPE {
    WEB = "WEB",
    ANDROID = "ANDROID",
    IOS = "IOS"
}
export const FILE_SIZE_IN_BYTES = 50 * 1024 * 1024;  //50mb

export const LOGO = "https://www.page1travels.com/uploads/1673871307.png"
export const LOGO_WHITTEBG = ""
