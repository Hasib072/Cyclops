// frontend/src/components/EmailVerification.jsx

import React, { useState, useRef, useEffect } from 'react';
// import './EmailVerification.css'; // Import the CSS styles
import axios from 'axios'; // Assuming you'll use axios for API calls

const EmailVerification = ({ onClose }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown

  const inputsRef = useRef([]);

  useEffect(() => {
    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleChange = (element, index) => {
    const value = element.value;
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value ? value[value.length - 1] : '';
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData('text')
      .trim()
      .slice(0, 6)
      .split('');
    const newOtp = [...otp];
    pasteData.forEach((digit, idx) => {
      if (idx < 6 && /^\d$/.test(digit)) {
        newOtp[idx] = digit;
        if (inputsRef.current[idx]) {
          inputsRef.current[idx].value = digit;
        }
      }
    });
    setOtp(newOtp);
    if (pasteData.length >= 6) {
      inputsRef.current[5].focus();
    } else {
      inputsRef.current[pasteData.length].focus();
    }
  };

  const verifyHandler = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      alert('Please enter all 6 digits.');
      return;
    }

    setIsVerifying(true);
    try {
      // Replace with your verification API endpoint
      const response = await axios.post('/api/verify-otp', { otp: enteredOtp });
      if (response.data.success) {
        alert('Email verified successfully!');
        onClose();
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendHandler = async () => {
    setIsResending(true);
    try {
      // Replace with your resend OTP API endpoint
      const response = await axios.post('/api/resend-otp');
      if (response.data.success) {
        alert('OTP has been resent to your email.');
        setTimeLeft(300); // Reset timer
      } else {
        alert('Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while resending OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container">
      <div className="verification-box">
        <h2>Verify Your Account</h2>
        <p>
          Please verify your new account! A 6-digit OTP (One-Time Password) has been sent to your registered email.
          Check your inbox and enter the OTP to complete the verification process.
        </p>
        <label htmlFor="otp">Enter Code</label>
        <div className="otp-input" id="otp" onPaste={handlePaste}>
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputsRef.current[index] = el)}
              required
            />
          ))}
        </div>
        <p>
          Code expires in: <strong>{formatTime(timeLeft)}</strong>
        </p>
        <p>
          Didn’t receive the code yet?{' '}
          <button type="button" onClick={resendHandler} disabled={isResending}>
            {isResending ? 'Resending...' : 'Resend Code'}
          </button>
        </p>
        <button onClick={verifyHandler} disabled={isVerifying}>
          {isVerifying ? 'Verifying...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default EmailVerification;
