export const welcomeTemplate = (firstName?: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #4CAF50;
        }
        .header h1 {
          color: #4CAF50;
          margin: 0;
        }
        .content {
          padding: 30px 0;
        }
        .feature-list {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .feature-list li {
          margin: 10px 0;
          padding-left: 10px;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome Aboard!</h1>
        </div>
        <div class="content">
          <p>Hello ${firstName || 'there'},</p>
          <p>Welcome to our platform! We're excited to have you on board. Your account has been successfully created and you're ready to get started.</p>
          
          <div class="feature-list">
            <h3>What you can do:</h3>
            <ul>
              <li>✅ Manage your profile and settings</li>
              <li>✅ Access all features and tools</li>
              <li>✅ Connect with team members</li>
              <li>✅ Get 24/7 support when you need it</li>
            </ul>
          </div>

          <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
          
          <p>Best regards,<br>The Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} Tugza. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
