import { LOGO } from '../constants/commonConstants';

export const productOutOfStockTemplate = function (data) {
    const { sellerName, productId, productName } = data;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product Out of Stock</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; }
            .container { background-color: #ffffff; padding: 20px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello ${sellerName},</h1>
            <p>Your product <strong>${productName}</strong> (ID: ${productId}) is currently out of stock.</p>
            <p>Please take the necessary actions to replenish the stock.</p>
            <p>Thank you,</p>
            <p>Your Team</p>
        </div>
    </body>
    </html>`;

    const text = `Hello ${sellerName},\n\nYour product ${productName} (ID: ${productId}) is currently out of stock. Please take the necessary actions to replenish the stock.\n\nThank you,\nYour Team`;

    return { html, text };
};
