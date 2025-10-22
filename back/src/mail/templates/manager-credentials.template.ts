export const managerCredentialsTemplate = (
  email: string,
  password: string,
  officeName: string,
  firstName?: string,
): string => {
  const displayName = firstName || 'Manager';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Office Manager Account Created</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .title {
            color: #27ae60;
            font-size: 20px;
            margin-bottom: 20px;
        }
        .credentials-box {
            background-color: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .credential-item {
            margin-bottom: 15px;
        }
        .label {
            font-weight: bold;
            color: #495057;
            display: inline-block;
            width: 100px;
        }
        .value {
            font-family: monospace;
            background-color: #ffffff;
            padding: 5px 10px;
            border-radius: 4px;
            border: 1px solid #dee2e6;
            display: inline-block;
            min-width: 200px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏢 Office Management System</div>
            <h1 class="title">Office Manager Account Created</h1>
        </div>
        
        <p>Hello ${displayName},</p>
        
        <p>Congratulations! Your office "<strong>${officeName}</strong>" has been approved and your manager account has been created successfully.</p>
        
        <div class="credentials-box">
            <h3 style="margin-top: 0; color: #495057;">Your Login Credentials:</h3>
            <div class="credential-item">
                <span class="label">Email:</span>
                <span class="value">${email}</span>
            </div>
            <div class="credential-item">
                <span class="label">Password:</span>
                <span class="value">${password}</span>
            </div>
        </div>
        
        <div class="warning">
            <strong>⚠️ Important Security Notice:</strong><br>
            Please change your password immediately after your first login for security reasons. This temporary password should not be shared with anyone.
        </div>
        
        <p>You can now log in to the system and start managing your office. As a manager, you will have access to:</p>
        <ul>
            <li>Office information and settings</li>
            <li>User management within your office</li>
            <li>Reports and analytics</li>
            <li>QR code for office check-ins</li>
        </ul>
        
        <div style="text-align: center;">
            <a href="#" class="button">Login to Your Account</a>
        </div>
        
        <p>If you have any questions or need assistance, please contact our support team.</p>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2025 Office Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};
