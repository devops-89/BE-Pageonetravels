import { LOGO } from '../constants/commonConstants';

export const shipmentTrackingTemplate = function (shipmentData: any) {
    const {
        trackingId,
        customerName,
        orderId,
        shippingStatus,
        estimatedDelivery,
        trackingLink
    } = shipmentData;

    const html = `
    <!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
        <meta charset="utf-8">
        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Shipment Tracking for Order ${orderId}</title>
        <link href="https://fonts.googleapis.com/css?family=Montserrat:400,500,600,700" rel="stylesheet" media="screen">
        <style>
            body { margin: 0; padding: 0; width: 100%; background-color: #eceff1; }
            .container { width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 5px; padding: 20px; }
            h1 { font-size: 24px; color: #333; }
            p { font-size: 14px; color: #626262; line-height: 1.5; }
            .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div style="text-align: center; margin: 20px 0;">
                <img src="${LOGO}" alt="Page One Travels Logo" style="width: 100px;">
            </div>
            <h1>Hello ${customerName},</h1>
            <p>Your order with ID <strong>${orderId}</strong> has been shipped!</p>
            <p>Tracking ID: <strong>${trackingId}</strong></p>
            <p>Status: <strong>${shippingStatus}</strong></p>
            <p>Estimated Delivery: <strong>${estimatedDelivery}</strong></p>
            <p>Track your shipment <a href="${trackingLink}">here</a>.</p>
            <p>If you have any questions, please feel free to contact us.</p>
            <p>Thank you,<br>Page One Travels</p>
        </div>
        <div class="footer">© 2024 Page One Travels. All rights reserved.</div>
    </body>
    </html>`;

    const text = `
    Hello ${customerName},
    Your order with ID ${orderId} has been shipped!
    Tracking ID: ${trackingId}
    Status: ${shippingStatus}
    Estimated Delivery: ${estimatedDelivery}
    Track your shipment here: ${trackingLink}
    If you have any questions, please feel free to contact us.
    Thank you,
    Page One Travels`;

    return { html, text };
};
