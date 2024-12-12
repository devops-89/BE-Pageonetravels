import { Injectable } from '@nestjs/common';
import * as paypal from 'paypal-rest-sdk';
import { ConfigService } from '../config/config.service';
import { PAYMENT_INTENT } from '../constants/orderConstants';

@Injectable()
export class PaypalService {
    private mode: string;
    private clientId: string;
    private clientSecret: string;

    constructor(private readonly configService: ConfigService) {
        this.mode = this.configService.get().PaypalCredentials.PAYPAL_MODE;
        this.clientId = this.configService.get().PaypalCredentials.PAYPAL_MODE;
        this.clientSecret = this.configService.get().PaypalCredentials.PAYPAL_CLIENT_SECRET;

        paypal.configure({
            mode: this.mode,
            client_id: this.clientId,
            client_secret: this.clientSecret,
        });
    }

    createPayment(input: { amount: number, executeUrl: string, cancelUrl: string, orderId: number }): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const { amount, cancelUrl, executeUrl, orderId } = input;
                
                const payment_json = {
                    intent: PAYMENT_INTENT.Sale,
                    payer: {
                        payment_method: 'paypal',
                    },
                    redirect_urls: {
                        return_url: executeUrl,
                        cancel_url: cancelUrl,
                    },
                    transactions: [
                        {
                            amount: {
                                currency: 'EUR',
                                total: 10,
                            },
                            description: 'This is a euvande payment for Car Buy/Sale',
                            invoice_number: orderId
                        },
                    ],
                };

                paypal.payment.create(payment_json, (error: any, payment: { links: string | any[]; }) => {
                    if (error) {
                        console.error('Error creating PayPal payment:', error);
                        reject(error);
                    } else {

                        let approval_url = null;
                        for (let i = 0; i < payment.links.length; i++) {
                            if (payment.links[i].rel === 'approval_url') {
                                approval_url = payment.links[i].href;
                                break;
                            }
                        }

                        if (approval_url) {
                            resolve(approval_url);
                        } else {
                            reject(null);
                        }
                    }
                });
            } catch (error) {
                reject(error);
                return;
            }
        });
    }

    executePayment(paymentId: string, payerId: string): Promise<any> {
        try {
            return new Promise(async (resolve, reject) => {
                const execute_payment_json = {
                    payer_id: payerId,
                };

                paypal.payment.execute(paymentId, execute_payment_json, (error: any, payment: any) => 
                {
                    if (error) 
                    {
                        console.log("payment gateway Error", error);
                        reject(error);
                        return;
                    }

                    resolve(payment);
                });
            });
        } catch (error) {
            console.log("payment Error", error);
            throw error;
        }
    }
}