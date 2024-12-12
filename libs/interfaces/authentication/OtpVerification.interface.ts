import { OTP_SEND_ON, OTP_TYPE } from "../../constants/autenticationConstants/userContants"

export declare namespace OtpVerificationI 
{

    interface DefaultField
    {
        id: number
        createdAt:Date,
    }

    interface OtpResendData {
        retryLeft: number,
        totalRetry: number,
        isBlocked: boolean,
        blockedTill: number
    }

    interface OtpVerification {
        otp: string,
        user: number,
        otpType: OTP_TYPE,
        sendOn: OTP_SEND_ON,
        expiryTime: number,
        emailOrPhone: string,
        countryCode?: string
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