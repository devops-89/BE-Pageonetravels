export interface MailInterface {
    from?: string;
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    text?: string;
    html: string;
}

export interface SESConfig 
{
    sender: string,
    accessKeyId: string,
    secretAccessKey: string,
    region: string
}