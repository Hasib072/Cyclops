// utils/sendEmail.js

import axios from 'axios';

/**
 * Sends an email using EmailJS's REST API.
 *
 * @param {string} user_email - Recipient's email address.
 * @param {string} subject - Subject of the email.
 * @param {string} user_name - Recipient's name.
 * @param {string} verificationCode - 6-digit verification code.
 * @returns {Promise<void>}
 * @throws {Error} If the email could not be sent.
 */
const sendEmail = async (Email, subject, name, verificationCode) => {
  const serviceID = 'service_wdsl71y';
  const templateID = 'template_su2618a';
  const userID = '4VnuPnqlpNMQjv7tj';

  const templateParams = {
    user_email: Email,
    subject: subject,
    user_name: name,
    verification_code: verificationCode,
  };

  try {
    const response = await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        service_id: serviceID,
        template_id: templateID,
        user_id: userID,
        template_params: templateParams,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // EmailJS returns a status code and text; 'OK' indicates success
    if (response.data.status !== 'OK') {
      throw new Error(response.data.text || 'Failed to send email');
    }
  } catch (error) {
    // Log the error for debugging
    console.error('Error sending email via EmailJS:', error.response ? error.response.data : error.message);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;
