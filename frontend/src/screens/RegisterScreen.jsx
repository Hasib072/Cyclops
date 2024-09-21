// screens/RegisterScreen.js
import { useState, useEffect } from 'react';
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

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && userInfo.isVerified) {
      navigate('/');
    }
  }, [navigate, userInfo]);

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

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await register({ name, email, password }).unwrap();
      toast.success('Registration successful! Please verify your email.');
      setShowModal(true);
      setTimeLeft(600); // Reset timer
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const verifyHandler = async () => {
    if (verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    try {
      const res = await verifyEmail({ email, code: verificationCode }).unwrap();
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
      await resendVerification({ email }).unwrap();
      toast.success('Verification code resent to your email.');
      setTimeLeft(600); // Reset timer
    } catch (err) {
      toast.error(err?.data?.message || err.error);
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

        {/* Verification Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Email Verification</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Please enter the 6-digit verification code sent to your email.
              <br />
              Code expires in: {formatTime(timeLeft)}
            </p>
            <Form.Group controlId='verificationCode'>
              <Form.Control
                type='text'
                placeholder='Enter verification code'
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                pattern="\d{6}"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='secondary'
              onClick={() => setShowModal(false)}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              variant='warning'
              onClick={resendHandler}
              disabled={isResending}
            >
              {isResending ? 'Resending...' : 'Resend Code'}
            </Button>
            <Button
              variant='primary'
              onClick={verifyHandler}
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </FormContainer>
  );
};

export default RegisterScreen;
