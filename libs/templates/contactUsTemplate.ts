import { LOGO } from '../constants/commonConstants'; // Adjust path as needed

export const contactUsTemplate = function (username:string) {
    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Bharat Hast Kaushal</title>
  <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
  <style>
    body {
      font-family: Helvetica, Arial, sans-serif;
      margin: 0px;
      padding: 0px;
      background-color: #f5f5f5;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border: 0px;
      border-spacing: 0px;
      background-color: #ffffff;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
    }

    .header {
      background-color: #2d2d2d;
      padding: 20px;
      text-align: center;
    }

    .header img {
      width: 100px;
    }

    .content {
      padding: 20px;
    }

    .content h1 {
      color: #333333;
    }

    .content p {
      color: #666666;
      line-height: 1.5;
    }

    .footer {
      background-color: #2d2d2d;
      color: #ffffff;
      text-align: center;
      padding: 10px;
      font-size: 14px;
    }

    .footer a {
      color: #ffffff;
      text-decoration: none;
    }
  </style>
</head>

<body>
  <table role="presentation">
    <tr>
      <td align="center">
        <table role="presentation" class="container">
          <tr>
            <td class="header">
              <img src = ${LOGO} alt="Bharat Hast Kaushal">
            </td>
          </tr>
          <tr>
            <td class="content">
              <h1>Thank You for Contacting Us!</h1>
              <p>Dear ${username},</p>
              <p>Thank you for reaching out to Bharat Hast Kaushal. We have received your message and one of our team members will be in touch with you shortly.</p>
              <p>We value your interest and look forward to assisting you with your inquiry. If you have any additional information to provide, please reply to this email.</p>
              <p>Best regards,<br>The Bharat Hast Kaushal Team</p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>&copy; 2024 Bharat Hast Kaushal. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>

</html>
 
    `;

    const text = ``;
    return {
        html: html,
        text: text,
    };
};