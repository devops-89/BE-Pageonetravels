export declare namespace ForgotPasswardI
{
   interface ForgotPasswardReq
    {
       email: string
    }

    interface ForgotPasswordVerifyByOtp {
        reference_id: number,
        otp: string,
        password: string
    }
}