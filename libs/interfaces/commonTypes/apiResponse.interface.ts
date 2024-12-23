export declare namespace ApiResponse
{
    interface ApiResponseType 
    {
        data: any,
        status_code: number,
        message: string,
        extraError?: any,
        extraMessage?: any,
        success?: boolean
    
    }

    interface ApiOK
    {
        data?: any,
        status_code?: number,
        message?: string,
        extraMessage?: any
        success?: boolean
    }

    interface ApiErrorType extends Error
    {
        status_code: number,
        message: string,
        extraError?: any
        stack?: string;
    }
}