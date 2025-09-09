import { LOGO } from '../constants/commonConstants'; // Adjust path as needed

// Function to generate the reset password email content
export const resetPassword = function (otp: string, full_name: string) {
    // HTML content for the email
    const html = `
   <!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>Reset your Password</title>
  <link href="https://fonts.googleapis.com/css?family=Montserrat:400,500,600,700" rel="stylesheet" media="screen">
  <style>
    .hover-underline:hover {
      text-decoration: underline !important;
    }
    @media (max-width: 600px) {
      .sm-px-24 {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
      .sm-py-32 {
        padding-top: 32px !important;
        padding-bottom: 32px !important;
      }
      .sm-w-full {
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #ECEFF1; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif;">
  <div style="display: none;">A request to reset your Page One Travels account password was received</div>
  <div role="article" aria-roledescription="email" aria-label="Reset your Password" lang="en">
    <table style="width: 100%;" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="background-color: #ECEFF1;">
          <table class="sm-w-full" style="width: 600px;" width="600" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td class="sm-py-32 sm-px-24" style="padding: 48px; text-align: center;">
                <a href="#">
                  <img src="${LOGO}" alt="Page One Travels" style="width: 100px;">
                </a>
              </td>
            </tr>
            <tr>
              <td class="sm-px-24" style="padding: 24px;">
                <table style="width: 100%;" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="background-color: #FFFFFF; border-radius: 6px; font-size: 14px; line-height: 24px; padding: 40px; text-align: left; color: #333333;">
                      <p style="font-weight: 600; font-size: 18px; margin: 0 0 16px;">Hello, ${full_name || 'User'}</p>
                      <p style="margin: 0 0 20px;">
                        You recently requested a password reset for your Page1Travels account.
                        Please use the following OTP to reset your password:
                      </p>
                      <p style="font-weight: 700; text-align: center; font-size: 28px; color: #7367F0; margin: 20px 0;">${otp}</p>
                      <p style="margin: 20px 0;">
                        If you did not request this password reset, please contact us immediately.
                        <br>Page1Travels Support Team</p>
                      <p style="margin: 0;">
                        Have questions or need help?
                        Contact us at: <a href="mailto:info@pageonetravels.com" class="hover-underline" style="color: #7367F0;">info@pageonetravels.com</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; font-size: 12px; color: #999999; padding: 20px;">
                © ${new Date().getFullYear()} Page One Travels. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

    // Plain text content for the email
    const text = `
        Reset Password: You recently requested to reset your password for your Page One Travels account. Copy and paste it to reset your password:
        ${otp}

If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next 2 hours.`;

    return {
        html: html,
        text: text,
    };
};
