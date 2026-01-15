require('dotenv').config({ path: '.env' });
import { Injectable } from '@nestjs/common';
import { Mail } from 'src/schemas/mail.schema';
import { createTransport, SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailService {
  constructor() { }

  async sendMail(body: Mail): Promise<SentMessageInfo | string> {
    try {
      const { to, subject, text, html } = body;
      const transporter = createTransport({
        host: process.env.MAIL_HOST,
        port: 465,
        secure: true, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: process.env.FROM_EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const res = await transporter.sendMail({
        from: `"Know2Share" <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        text,
        html,
      });
      if (res.messageId) {
        return res;
      } else {
        return 'Mail failed to send!';
      }
    } catch (error) {
      return error.message;
    }
  }
}
