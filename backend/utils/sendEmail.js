// utils/sendEmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` }); // Load environment variables based on NODE_ENV

const sendEmail = async (to, subject, text, html = null) => {
  // Create a transporter using Mailtrap's SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // 'smtp.mailtrap.io'
    port: process.env.EMAIL_PORT, // 2525
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Mailtrap username
      pass: process.env.EMAIL_PASS, // Mailtrap password
    },
  });

  // Define the email options
  const mailOptions = {
    from: `"Cyclops" <${process.env.EMAIL_FROM}>`, // Sender address
    to, // Recipient
    subject, // Subject line
    text, // Plain text body
    html, // Optional: HTML body
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;
