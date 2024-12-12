export declare namespace ForgotPasswardI
{
   interface ForgotPasswardReq
    {
       email: string
    }

    interface ForgotPasswordVerifyByOtp {
        referenceId: number,
        otp: string,
        password: string
    }
}