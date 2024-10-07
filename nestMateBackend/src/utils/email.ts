
export async function sendEmail({to, subject, text}:{to: string, subject: string, text: string}): Promise<string>{
    console.log('reset link has been sent')
    return "Sending an email prop";
}

// USE THIS WHEN YOU FINALLY SETUP EMAIL SERVER THING
import { Context } from 'hono';
import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  text: string
}

export async function sendEmail2({ to, subject, text }: EmailOptions, c: Context) {
  const transporter = nodemailer.createTransport({
    // Configure with your email service details
    host: c.env.EMAIL_HOST,
    port: Number(c.env.EMAIL_PORT),
    auth: {
      user: c.env.EMAIL_USER,
      pass: c.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: c.env.EMAIL_FROM,
    to,
    subject,
    text,
  })
}

// npm install nodemailer
// npm install @types/nodemailer --save-dev