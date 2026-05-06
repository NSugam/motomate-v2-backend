import * as nodemailer from 'nodemailer';
import { env } from 'src/config/env';

interface MailOptions {
  email: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendMail = async (options: MailOptions) => {
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
      from: `Motomate App <${env.MAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log('Failed to send mail', error);
    return false;
  }
};
