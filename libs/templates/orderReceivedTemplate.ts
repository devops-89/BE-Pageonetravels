import { LOGO } from '../constants/commonConstants';

export const orderReceivedTemplate = function (data) {
    const { sellerName, buyerDetails, orderDetails } = data;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Received</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; }
            .container { background-color: #ffffff; padding: 20px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello ${sellerName},</h1>
            <p>You have received a new order!</p>
            <p><strong>Buyer Details:</strong></p>
            <p>${buyerDetails}</p>
            <p><strong>Order Details:</strong></p>
            <p>${orderDetails}</p>
            <p>Thank you for your prompt attention to this order.</p>
        </div>
    </body>
    </html>`;

    const text = `Hello ${sellerName},\n\nYou have received a new order!\n\nBuyer Details:\n${buyerDetails}\n\nOrder Details:\n${orderDetails}\n\nThank you for your prompt attention to this order.`;

    return { html, text };
};
