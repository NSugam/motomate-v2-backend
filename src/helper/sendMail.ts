import * as nodemailer from 'nodemailer';
import { env } from 'src/config/env';

interface MailOptions {
  email: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendMail = async (options: MailOptions) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,

    auth: {
      user: env.MAIL_USERNAME,
      pass: env.MAIL_PASSWORD,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  try {
    console.log('[SMTP] Verifying Gmail SMTP connection...');

    await transporter.verify();

    console.log('[SMTP] Gmail SMTP connection verified');

    const mailOptions = {
      from: `Motomate App <${env.MAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    console.log('[SMTP] Sending email...');

    const info = await transporter.sendMail(mailOptions);

    console.log('[SMTP] Email accepted:', info.messageId);

    return true;
  } catch (error) {
    console.error('[SMTP] Failed to send email:', error);
    throw error;
  } finally {
    transporter.close();
  }
};
