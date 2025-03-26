import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../config/config.service';
import { SMTP } from '../config/config.interface';

interface Attachments {
    filename: string;
    contentType: string;
    content: Buffer;
}

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter | undefined;
    // private SMTPConfig:SMTP
    private sender: string;

    constructor(private readonly configService: ConfigService) {
        this.sender = configService.get().SMTP.SENDER;
        this.initializeTransporter(configService.get().SMTP);
        // this.SMTPConfig = configService.get().SMTP;
    }

    private initializeTransporter(SMTPConfig: SMTP) {
        this.transporter = nodemailer.createTransport({
            host: SMTPConfig.HOST,
            port: SMTPConfig.PORT,
            secure: SMTPConfig.SMTP_TLS === 'yes' ? true : false,
            auth: {
                user: SMTPConfig.USERNAME,
                pass: SMTPConfig.PASSWORD,
            },
        });
    }

    async sendEmail(to: string, subject: string, html: string, attachments?: Attachments[]) {
        const mailOptions: nodemailer.SendMailOptions = {
            from: this.sender,
            to,
            subject,
            html,
        };

        if (attachments && attachments.length) {

            mailOptions.attachments = attachments;
        }

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: ', info.response);
            return info;
        } catch (error) {
            console.error('Error sending email: ', error);
            throw error;
        }
    }

    
}
