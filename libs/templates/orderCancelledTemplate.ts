import { LOGO } from '../constants/commonConstants';

export const orderCancellationTemplate = function (data) {
    const { sellerName, buyerDetails, orderDetails } = data;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Cancelled</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; }
            .container { background-color: #ffffff; padding: 20px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello ${sellerName},</h1>
            <p>We're sorry to inform you that an order has been cancelled.</p>
            <p><strong>Buyer Details:</strong></p>
            <p>${buyerDetails.email}</p>
            <p>${buyerDetails.shippingAddress}</p>
            <p><strong>Order Details:</strong></p>
            <p>${orderDetails}</p>
            <p>If you have any questions, please reach out to our support team.</p>
        </div>
    </body>
    </html>`;

    const text = `Hello ${sellerName},\n\nWe're sorry to inform you that an order has been cancelled.\n\nBuyer Details:\n${buyerDetails}\n\nOrder Details:\n${orderDetails}\n\nIf you have any questions, please reach out to our support team.`;

    return { html, text };
};
