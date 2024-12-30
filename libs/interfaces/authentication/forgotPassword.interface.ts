export declare namespace ForgotPasswardI
{
   interface ForgotPasswardReq
    {
       email: string
    }

    interface ForgotPasswordVerifyByOtp {
        reference_id: string,
        otp: string,
        password: string
    }
}