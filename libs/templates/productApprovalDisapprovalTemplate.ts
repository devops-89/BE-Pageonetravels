import { LOGO } from '../constants/commonConstants';

export const productApprovalTemplate = function (data) {
    const { sellerName, productId, variantId, status } = data;
    const statusMessage = status === 'approved' ? 'approved' : 'disapproved';

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product ${statusMessage.charAt(0).toUpperCase() + statusMessage.slice(1)}</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; }
            .container { background-color: #ffffff; padding: 20px; border-radius: 5px; }
            h1 { color: #333; }
            .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello ${sellerName},</h1>
            <p>Your product with ID: <strong>${productId}</strong> and Variant ID: <strong>${variantId}</strong> has been ${statusMessage}.</p>
            <p>If you have any questions, please contact support.</p>
            <p>Thank you,</p>
            <p>Your Team</p>
        </div>
        <div class="footer">© 2024 Bharat Hast Kaushal. All rights reserved.</div>
    </body>
    </html>`;

    const text = `Hello ${sellerName},\n\nYour product with ID: ${productId} and Variant ID: ${variantId} has been ${statusMessage}.\nIf you have any questions, please contact support.\n\nThank you,\nYour Team`;

    return { html, text };
};
