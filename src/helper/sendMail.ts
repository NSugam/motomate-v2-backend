import * as nodemailer from 'nodemailer';
import { env } from 'src/config/env';

export const sendMail = async (options: {
  email: string;
  subject: string;
  message: string;
}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: env.MAIL_USERNAME,
        pass: env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log('Failed to send mail', error);
    return false;
  }
};
