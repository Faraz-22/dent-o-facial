import nodemailer from 'nodemailer';

const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

let transporter: nodemailer.Transporter | null = null;

if (SMTP_EMAIL && SMTP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD,
    },
  });
} else {
  console.warn('\n⚠️ WARNING: SMTP_EMAIL and SMTP_PASSWORD are not set in environment variables. Emails will not be sent.');
}

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!transporter) {
    console.warn('Email notification skipped because SMTP credentials are not configured.', { to, subject });
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Dent-O-Facial" <${SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log('✅ Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
