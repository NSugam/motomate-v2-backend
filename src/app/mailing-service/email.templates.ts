export const generateWelcomeTemplate = (fullname: string) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; max-width: 650px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
  
  <!-- Header with branding -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
    <img src="https://res.cloudinary.com/motomate/image/upload/v1778061236/motomate-png.png" alt="MotoMate" style="max-width: 150px; height: auto; margin-bottom: 10px;">
    <p style="color: white; margin: 2px 0; font-size: 22px; font-weight: bold;">Motomate App</p>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Welcome to Your Account</p>
  </div>

  <!-- Main content -->
  <div style="background: white; margin: 14px; border-radius: 12px; padding: 30px 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
    
    <!-- Greeting -->
    <p style="color: #666; margin: 0 0 30px 0; font-size: 14px;">Thank you, ${fullname} for joining MotoMate! Your account is now active and ready to use.</p>

    <!-- Dashboard Link -->
    <div style="background: #f0f7ff; border-left: 4px solid #667eea; padding: 15px 20px; border-radius: 4px; margin: 25px 0; text-align: center;">
      <p style="color: #2c3e50; margin: 0 0 12px 0; font-size: 14px;">
        <strong>🔑 Access Your Dashboard</strong>
      </p>
      <a href="https://motomate.neupanesugam.com.np" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">Go to Dashboard</a>
    </div>

    <!-- Download App -->
    <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px 20px; border-radius: 4px; margin: 25px 0; text-align: center;">
      <p style="color: #1565c0; margin: 0 0 12px 0; font-size: 14px;">
        <strong>📱 Download the MotoMate App</strong>
      </p>
      <a href="https://play.google.com/store/apps/details?id=com.anonymous.MotoMate" style="display: inline-block; background: #2196f3; color: white; padding: 10px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">Get on PlayStore</a>
    </div>
    
    <!-- What's Next Box -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 12px; text-align: center; margin: 30px 0; box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);">
      <p style="color: rgba(255,255,255,0.9); margin: 0 0 20px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;"><strong>What You Can Do Now</strong></p>
      <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin: 15px 0; text-align: left;">
        <p style="color: white; margin: 10px 0; font-size: 14px;">✅ <strong>Complete Your Profile</strong> - Add your personal details and vehicles</p>
        <p style="color: white; margin: 10px 0; font-size: 14px;">🏍️ <strong>Add Your Vehicles</strong> - Register your motorcycle for maintenance tracking</p>
        <p style="color: white; margin: 10px 0; font-size: 14px;">🔧 <strong>Track Maintenance</strong> - Keep detailed records of all service and parts</p>
        <p style="color: white; margin: 10px 0; font-size: 14px;">📊 <strong>View Analytics</strong> - Monitor your vehicle's health and performance</p>
      </div>
    </div>

    <!-- Tips section -->
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; border-radius: 4px; margin: 20px 0;">
      <p style="color: #856404; margin: 0; font-size: 14px;">
        <strong>💡 Getting Started Tips:</strong><br/>
        • Use your registered email and password to login<br/>
        • Keep your profile updated for better recommendations<br/>
        • Enable notifications to stay updated on maintenance reminders<br/>
        • Join our community to connect with other MotoMate users
      </p>
    </div>

    <!-- Support Info -->
    <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px 20px; border-radius: 4px; margin: 20px 0;">
      <p style="color: #2e7d32; margin: 0; font-size: 14px;">
        <strong>🤝 Need Help?</strong><br/>
        Our support team is available 24/7 to assist you with any questions or concerns.
      </p>
    </div>

    <!-- Divider -->
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <!-- Closing -->
    <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
      Happy riding,<br/>
      <strong style="color: #667eea;">The MotoMate Team</strong>
    </p>

    <!-- Disclaimer -->
    <p style="color: #999; margin: 20px 0 0 0; font-size: 12px; text-align: center; line-height: 1.5;">
      This is an automated message, please do not reply to this email.<br/>
      © MotoMate. All rights reserved.
    </p>

  </div>

  <!-- Footer bar -->
  <div style="background: #2c3e50; padding: 20px; text-align: center; color: #bbb; font-size: 12px;">
    <p style="margin: 0;">
      <a href="https://www.neupanesugam.com.np/motomate/privacy-policy" style="color: #667eea; text-decoration: none; margin: 0 15px;">Privacy Policy</a> | 
      <a href="https://www.neupanesugam.com.np/motomate/terms-of-service" style="color: #667eea; text-decoration: none; margin: 0 15px;">Terms of Service</a> | 
      <a href="https://www.neupanesugam.com.np/motomate/contact-support" style="color: #667eea; text-decoration: none; margin: 0 15px;">Contact Support</a>
    </p>
  </div>

</div>
`;

export const generateOTPTemplate = (
  fullname: string,
  otpCode: string,
  validityMinutes: number = 15,
) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; max-width: 650px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
  
  <!-- Header with branding -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
    <img src="https://res.cloudinary.com/motomate/image/upload/v1778061236/motomate-png.png" alt="MotoMate" style="max-width: 150px; height: auto; margin-bottom: 10px;">
    <p style="color: white; margin: 2px 0; font-size: 22px; font-weight: bold;">Motomate App</p>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Your OTP Verification</p>
  </div>

  <!-- Main content -->
  <div style="background: white; margin: 14px; border-radius: 12px; padding: 30px 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
    
    <!-- Greeting -->
    <h2 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 20px;">Hello ${fullname}! 👋</h2>
    <p style="color: #666; margin: 0 0 30px 0; font-size: 14px;">We received a request to verify your identity. Here's your secure verification code:</p>

    <!-- OTP Code Box -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);">
      <p style="color: rgba(255,255,255,0.9); margin: 0 0 15px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your One-Time Password</p>
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
        <p style="font-size: 32px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 6px; font-family: 'Courier New', monospace;">${otpCode}</p>
      </div>
      <p style="color: rgba(255,255,255,0.85); margin: 15px 0 0 0; font-size: 13px;">
        ⏱️ Valid for <strong>${validityMinutes} minutes</strong>
      </p>
    </div>

    <!-- Security info -->
    <div style="background: #f0f7ff; border-left: 4px solid #667eea; padding: 15px 20px; border-radius: 4px; margin: 25px 0;">
      <p style="color: #2c3e50; margin: 0; font-size: 14px;">
        <strong>🔒 Security Tips:</strong><br/>
        • Never share this code with anyone<br/>
        • MotoMate will never ask for your OTP via email or phone<br/>
        • This code is for single-time use only
      </p>
    </div>

    <!-- Why we sent this -->
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; border-radius: 4px; margin: 20px 0;">
      <p style="color: #856404; margin: 0; font-size: 14px;">
        <strong>ℹ️ Didn't request this?</strong><br/>
        If you didn't try to access your account, please secure your password immediately and contact our support team.
      </p>
    </div>

    <!-- Footer message -->
    <p style="color: #666; margin: 30px 0 0 0; font-size: 14px; text-align: center;">
      Need assistance? Our support team is here to help you 24/7.
    </p>

    <!-- Divider -->
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <!-- Closing -->
    <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
      Best regards,<br/>
      <strong style="color: #667eea;">The MotoMate Team</strong>
    </p>

    <!-- Disclaimer -->
    <p style="color: #999; margin: 20px 0 0 0; font-size: 12px; text-align: center; line-height: 1.5;">
      This is an automated message, please do not reply to this email.<br/>
      © MotoMate. All rights reserved.
    </p>

  </div>

  <!-- Footer bar -->
  <div style="background: #2c3e50; padding: 20px; text-align: center; color: #bbb; font-size: 12px;">
    <p style="margin: 0;">
      <a href="https://www.neupanesugam.com.np/motomate/privacy-policy" style="color: #667eea; text-decoration: none; margin: 0 15px;">Privacy Policy</a> | 
      <a href="https://www.neupanesugam.com.np/motomate/terms-of-service" style="color: #667eea; text-decoration: none; margin: 0 15px;">Terms of Service</a> | 
      <a href="https://www.neupanesugam.com.np/motomate/contact-support" style="color: #667eea; text-decoration: none; margin: 0 15px;">Contact Support</a>
    </p>
  </div>

</div>
`;
