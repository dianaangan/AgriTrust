import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to other email services
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

export const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'AgriTrust - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5016;">AgriTrust Password Reset</h2>
          <p>Hello,</p>
          <p>You have requested to reset your password. Please use the following verification code:</p>
          <div style="background-color: #f0f8f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2d5016; font-size: 32px; margin: 0; letter-spacing: 5px;">${resetCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <br>
          <p>Best regards,<br>AgriTrust Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export default transporter;
