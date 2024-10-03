import { createTransport } from 'nodemailer';
import { MAIL_CONFIG } from '../constant';

// email configuration
export const sendEmail = async (email: any, subject: string, text: string) => {
  const transporter = createTransport({
    host: MAIL_CONFIG.HOST,
    port: MAIL_CONFIG.PORT,
    secure: true,
    auth: {
      user: MAIL_CONFIG.USER,
      pass: MAIL_CONFIG.PASSWORD
    }
  });
  await transporter.sendMail({
    from: MAIL_CONFIG.FROM,
    to: email,
    subject: subject,
    text: text
  });
};

export const transporter = createTransport({
  host: MAIL_CONFIG.HOST,
  port: MAIL_CONFIG.PORT,
  secure: true,
  auth: {
    user: MAIL_CONFIG.USER,
    pass: MAIL_CONFIG.PASSWORD
  }
});
