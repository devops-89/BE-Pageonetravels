export interface SMSConfig 
{
    accessKeyId: string,
    secretAccessKey: string,
    region: string
}

export interface TwilioSMSConfig 
{
    accountSid: string,
    authToken: string,
    fromNumber: string
}