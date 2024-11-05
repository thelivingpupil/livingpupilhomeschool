import nodemailer from 'nodemailer';

export const emailConfig = {
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  service: process.env.EMAIL_SERVICE,
};

const transporter = nodemailer.createTransport(emailConfig);

export const sendMail = async ({ from, html, subject, text, to, attachments = [], replyTo }) => {
  const data = {
    from: from ?? process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
    attachments: attachments.length > 0 ? attachments : undefined, // Include attachments only if there are any
    replyTo: replyTo ?? process.env.EMAIL_REPLY_TO, // Set replyTo if provided or fallback to a default environment variable
  };

  process.env.NODE_ENV === 'production'
    ? await transporter.sendMail(data)
    : console.log(data);
};

export default transporter;
