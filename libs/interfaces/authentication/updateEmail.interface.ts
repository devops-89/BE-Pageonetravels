export declare namespace UpdateEmailI
{
    interface AddEmail {
        email: string
    }

    interface VerifyEmail {
        referenceId:number,
        otp: string 
    }
}
