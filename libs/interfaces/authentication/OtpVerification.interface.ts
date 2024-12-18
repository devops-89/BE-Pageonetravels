import { OTP_SEND_ON, OTP_TYPE } from "../../constants/autenticationConstants/userContants"

export declare namespace OtpVerificationI 
{

    interface DefaultField
    {
        id: string
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
        user: string,
        otpType: OTP_TYPE,
        sendOn: OTP_SEND_ON,
        expiryTime: number,
        emailOrPhone: string,
        reference_id?: string
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