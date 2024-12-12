export function loginPasswordTemplate(password: string, email: string): { html: string } {
    return {
      html: `
        <html>
          <body>
            <p>Hello,</p>
            <p>Your login credentials are as follows:</p>
            <p>Email: ${email}</p>
            <p>Password: ${password}</p>
            <p>Please change your password upon your first login.</p>
            <p>Best regards,<br>Bharat Hast Kaushal</p>
          </body>
        </html>
      `
    };
  }
  