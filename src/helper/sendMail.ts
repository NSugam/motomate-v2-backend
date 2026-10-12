import { Resend } from 'resend';
import { env } from 'src/config/env';

interface MailOptions {
  email: string;
  subject: string;
  text?: string;
  html?: string;
}

const resend = new Resend(env.RESEND_API_KEY);

export const sendMail = async (options: MailOptions) => {
  const { data, error } = await resend.emails.send({
    from: env.MAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  if (error) {
    console.error('[Email API] Failed to send email:', error);
    throw new Error('Email delivery failed');
  }

  console.log('[Email API] Email accepted:', data?.id);

  return true;
};
