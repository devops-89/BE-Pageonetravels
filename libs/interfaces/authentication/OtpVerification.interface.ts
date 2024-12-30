import { OTP_SEND_ON, OTP_TYPE } from "../../constants/autenticationConstants/userContants"

export declare namespace OtpVerificationI 
{

    interface DefaultField
    {
        id: string
        created_at:Date,
    }

    interface OtpResendData {
        retryLeft: number,
        totalRetry: number,
        isBlocked: boolean,
        blockedTill: number
    }

    interface OtpVerification {
        otp: string,
        user: string,
        otp_type: OTP_TYPE,
        send_on: OTP_SEND_ON,
        expiry_time: number,
        email_or_phone: string,
        country_code?: string
    }

    interface OtpVerificationSchema extends OtpVerification, DefaultField
    { }
  
    type OtpVerificationType = OtpVerificationSchema & Document

    interface VerifyOtpRequest extends OtpVerification
    {
        retryLeft?: number;
        totalRetry?: number;
        resendData?: OtpResendData;
     }

}