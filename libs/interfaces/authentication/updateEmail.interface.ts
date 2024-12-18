export declare namespace UpdateEmailI
{
    interface AddEmail {
        email: string
    }

    interface VerifyEmail {
        reference_id:number,
        otp: string 
    }
}
