import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = new Twilio(accountSid, authToken);

export async function sendTextOTP(msg: string) {
    const resp = await client.messages.create({
        body: msg,
        from: '+12532592924', // Twilio "From" phone number
        to: '+919927890044', // Destination phone number
    });
    return resp;
}
