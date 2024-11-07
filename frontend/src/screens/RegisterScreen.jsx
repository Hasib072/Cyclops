// frontend/src/screens/RegisterScreen.jsx

import { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Col, Modal } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import mail_ico from '../assets/icons/mail.png';
import pass_ico from '../assets/icons/pass.png';
import user_circle_ico from '../assets/icons/account_circle.png';
import emailjs from 'emailjs-com';
import axios from 'axios';
import api from '../api';

const RegisterScreen = () => {
  // Registration form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Verification modal state
  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // RTK Query mutations
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && userInfo.isVerified) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  // Add this useEffect hook to handle the countdown
useEffect(() => {
  let timer;
  if (resendCooldown > 0) {
    timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
  }
  return () => clearInterval(timer);
}, [resendCooldown]);

  useEffect(() => {
    if (!showModal) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Verification code expired. Please resend the code.');
          setShowModal(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showModal]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Function to generate a random 6-digit code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Function to send email via EmailJS
  const sendVerificationEmail = (recipientEmail, code) => {
    console.log('inside sendVerificationEmail');
    const serviceID = 'service_wdsl71y';
    const templateID = 'template_su2618a';
    const userID = '4VnuPnqlpNMQjv7tj';
    console.log('inside sendVerificationEmail after ENV');

    const templateParams = {
      user_email: recipientEmail,
      subject: 'Email Verification',
      user_name: name,
      verification_code: code,
    };
    console.log('inside sendVerificationEmail after TemplateParams');

    // Return the promise to allow chaining
    return emailjs
      .send(serviceID, templateID, templateParams, userID)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        toast.success('Verification email sent successfully!');
        return response; // Pass the response to the next handler
      })
      .catch((err) => {
        console.error('FAILED...', err);
        toast.error('Failed to send verification email.');
        throw err; // Propagate the error to be caught in submitHandler
      });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // Register user via backend API
      const response = await register({ name, email, password }).unwrap();
      //   toast.success(response.message || 'Registration successful! Please verify your email.');

      // Generate a verification code
      const code = generateVerificationCode();
      setGeneratedCode(code);

      console.log({ email, code });

      // Send verification email via EmailJS and handle the promise
      await sendVerificationEmail(email, code)
        .then((response) => {
          console.log('Verification email sent successfully:', response);
        })
        .catch((error) => {
          console.error('Error sending verification email:', error);
        });

      // Save verification code to backend
      await api.post('/users/save-verification-code', { email, code });

      // Show the verification modal
      setShowModal(true);
      setTimeLeft(600); // Reset timer
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const verifyHandler = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    try {
      // Send verification code to backend
      const res = await verifyEmail({ email, code }).unwrap();
      toast.success(res.message);
      dispatch(setCredentials(res.user)); // Update Redux state with verified user
      setShowModal(false);
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const resendHandler = async () => {
    try {
      // Prevent resending if cooldown is active
      if (resendCooldown > 0) return;
  
      // Generate a new verification code
      const newCode = generateVerificationCode();
      setGeneratedCode(newCode);
  
      // Resend verification email via EmailJS
      await sendVerificationEmail(email, newCode);
  
      // Update verification code on backend
      await resendVerification({ email, code: newCode }).unwrap();

      // Start the cooldown timer (30 seconds)
      setResendCooldown(30);
  
      // Reset timer and OTP inputs
      setTimeLeft(600); // Reset timer
      setVerificationCode(['', '', '', '', '', '']); // Reset OTP inputs
  
      
    } catch (err) {
      toast.error('Failed to resend verification email.');
      console.error(err);
    }
  };

  // Refs for OTP inputs
  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    const value = element.value;
    if (/^\d$/.test(value)) {
      const newVerificationCode = [...verificationCode];
      newVerificationCode[index] = value;
      setVerificationCode(newVerificationCode);
      // Move focus to next input
      if (index < 5) {
        inputRefs.current[index + 1].focus();
      }
    } else if (value === '') {
      const newVerificationCode = [...verificationCode];
      newVerificationCode[index] = '';
      setVerificationCode(newVerificationCode);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && verificationCode[index] === '') {
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const pasteArray = pasteData.split('');
      setVerificationCode(pasteArray);
      // Focus the last input
      inputRefs.current[5].focus();
    }
  };

  return (
    <FormContainer>
      <div
        style={{
          marginTop: '35%',
          marginLeft: '24%',
          marginRight: '24%',
        }}
      >
        <h1 className='FontHead01'>Create Account</h1>
        <p className='FontBody01'>&nbsp;Join us Today.</p>
        <Form onSubmit={submitHandler}>
          <style>{`
            .input-with-icon {
              position: relative;
            }
            .input-icon {
              position: absolute;
              right: 15px;
              top: 50%;
              transform: translateY(-50%);
              height: 24px;
              width: 24px;
            }
            .my-placeholder-class::placeholder {
              color: white;
            }
            .my-placeholder-class:focus {
              outline: none;
              box-shadow: none;
              border-bottom-color: #c378f4;
            }
          `}</style>
          <Form.Group className='my-2' controlId='name'>
            <div className='input-with-icon'>
              <Form.Control
                type='text'
                placeholder='Enter name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='my-placeholder-class'
                style={{
                  marginTop: '20px',
                  backgroundColor: '#472a6000',
                  color: 'white',
                  border: 'none',
                  borderBottom: '2px solid #8754a9',
                  borderRadius: '0',
                  paddingRight: '45px',
                }}
                required
              />
              <img src={user_circle_ico} alt='Icon' className='input-icon' />
            </div>
          </Form.Group>

          <Form.Group className='my-2' controlId='email'>
            <div className='input-with-icon'>
              <Form.Control
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='my-placeholder-class'
                style={{
                  marginTop: '20px',
                  backgroundColor: '#472a6000',
                  color: 'white',
                  border: 'none',
                  borderBottom: '2px solid #8754a9',
                  borderRadius: '0',
                  paddingRight: '45px',
                }}
                required
              />
              <img src={mail_ico} alt='Icon' className='input-icon' />
            </div>
          </Form.Group>

          <Form.Group className='my-2' controlId='password'>
            <div className='input-with-icon'>
              <Form.Control
                type='password'
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='my-placeholder-class'
                style={{
                  marginTop: '20px',
                  backgroundColor: '#472a6000',
                  color: 'white',
                  border: 'none',
                  borderBottom: '2px solid #8754a9',
                  borderRadius: '0',
                  paddingRight: '45px',
                }}
                required
              />
              <img src={pass_ico} alt='Icon' className='input-icon' />
            </div>
          </Form.Group>

          <Form.Group className='my-2' controlId='confirmPassword'>
            <div className='input-with-icon'>
              <Form.Control
                type='password'
                placeholder='Confirm password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='my-placeholder-class'
                style={{
                  marginTop: '20px',
                  marginBottom: '30px',
                  backgroundColor: '#472a6000',
                  color: 'white',
                  border: 'none',
                  borderBottom: '2px solid #8754a9',
                  borderRadius: '0',
                  paddingRight: '45px',
                }}
                required
              />
              <img src={pass_ico} alt='Icon' className='input-icon' />
            </div>
          </Form.Group>

          {/* {isRegistering && <Loader />} */}

          <Button
            type='submit'
            variant='primary'
            className='mt-3 button-no-outline'
            style={{
              marginTop: '15px',
              marginBottom: '5px',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
              fontOpticalSizing: 'auto',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              width: '80%',
              height: '55px',
            }}
            disabled={isRegistering}
          >
            {isRegistering ? 'Registering...' : 'Sign up'}
          </Button>
        </Form>

        <Row className='py-3'>
          <Col className='FontBody01' style={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link
              style={{
                textDecoration: 'none',
                color: 'white',
                fontStyle: 'italic',
              }}
              to={`/login`}
            >
              Login
            </Link>
          </Col>
        </Row>
        
        {/* Enhanced Verification Modal */}
<Modal
  show={showModal}
  onHide={() => setShowModal(false)}
  centered
  // Remove backdrop="static" to allow closing by clicking outside
  // Remove keyboard={false} if you want to allow closing with the ESC key
>
  <div
    style={{
      background: 'linear-gradient(151deg, rgba(47,38,60,1) 14%, rgba(18,18,18,1) 100%)',
      color: 'white',
      borderRadius: '5px',
      padding: '20px',
    }}
  >
    {/* Modal Header without Close Button */}
    <Modal.Header
      style={{
        background: 'transparent',
        borderBottom: 'none',
        paddingBottom: '0',
        display: 'flex',
      }}
    >
      <Modal.Title>
        <h1 className='FontHead02'>Verify Your Account</h1>
      </Modal.Title>
    </Modal.Header>

    {/* Modal Body */}
    <Modal.Body style={{ background: 'transparent' }}>
      <p className='FontBody02' style={{ paddingBottom: '30px' }}>
        Please enter the 6-digit verification code sent to your email.
        <br />
        Code expires in: {formatTime(timeLeft)}
      </p>
      <p className='FontBody01' style={{fontWeight: 'bold', fontSize:'1.2rem', paddingLeft: '8%'}}>Enter Code</p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingRight: '10%',
          paddingLeft: '9%',
        }}
        onPaste={handlePaste}
      >
        {verificationCode.map((digit, index) => (
          <input
            key={index}
            type='text'
            inputMode='numeric'
            maxLength='1'
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputRefs.current[index] = el)}
            style={{
              width: '50px',
              height: '60px',
              textAlign: 'center',
              fontSize: '22px',
              border: '2px solid #fff',
              borderRadius: '15px',
              background: 'linear-gradient(180deg, #2f263c 0%, #121212 100%)',
              color: '#fff',
              outline: 'none',
              marginRight: index < 5 ? '10px' : '0',
            }}
          />
        ))}
      </div>
      <p className='FontBody02' style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
        Didn’t receive the code yet?{' '}
        <span
          onClick={resendCooldown === 0 ? resendHandler : null}
          style={{
            textDecoration: 'underline',
            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
            color: resendCooldown > 0 ? 'gray' : 'white',
          }}
        >
          {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : <i>Resend Code</i>}
        </span>
      </p>
    </Modal.Body>

    {/* Modal Footer with Centered Verify Button */}
    <Modal.Footer
      style={{
        background: 'transparent',
        borderTop: 'none',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Button
        variant='primary'
        onClick={verifyHandler}
        className='mt-3 button-no-outline'
            style={{
              marginBottom: '5px',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
              fontOpticalSizing: 'auto',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              width: '60%',
              height: '50px',
            }}
        disabled={isVerifying}
      >
        {isVerifying ? 'Verifying...' : 'Verify'}
      </Button>
    </Modal.Footer>
  </div>
</Modal>

        
      </div>
    </FormContainer>
  );
};

export default RegisterScreen;
