const nodemailer = require('nodemailer');

const sendEmail = (options) => {
  const requiredSettings = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_FROM',
  ];

  if (requiredSettings.some((key) => !process.env[key])) {
    throw new Error('Email service is not configured');
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transport.sendMail({
    from: process.env.SMTP_FROM,
    ...options,
  });
};

module.exports = sendEmail;
