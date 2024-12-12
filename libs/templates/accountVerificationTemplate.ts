import { LOGO } from '../constants/commonConstants';

export const accountVerificationTemplate = function (sellerName) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verified</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; }
            .container { background-color: #ffffff; padding: 20px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Congratulations ${sellerName},</h1>
            <p>Your account has been verified successfully!</p>
            <p>You can now start selling your products.</p>
            <p>Thank you for being a part of our community!</p>
        </div>
    </body>
    </html>`;

    const text = `Congratulations ${sellerName},\n\nYour account has been verified successfully! You can now start selling your products. Thank you for being a part of our community!`;

    return { html, text };
};
