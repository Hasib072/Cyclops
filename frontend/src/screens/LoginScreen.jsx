import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import mail_ico from '../assets/icons/mail.png'
import pass_ico from '../assets/icons/pass.png'

// import Loader from '../components/Loader'; // Removed the Loader import

const LoginScreen = () => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');

   const { userInfo } = useSelector((state) => state.auth);
   const dispatch = useDispatch();
   const navigate = useNavigate();

   const [login, { isLoading }] = useLoginMutation();

   useEffect(() => {
      if (userInfo) {
         navigate('/');
      }
   }, [navigate, userInfo]);

   const submitHandler = async (e) => {
      e.preventDefault();
      try {
         const res = await login({ email, password }).unwrap();
         dispatch(setCredentials({ ...res }));
         navigate('/');
      } catch (err) {
         console.log(err);
         toast.error(err?.data?.message || err.error || err.status);
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
            <h1 className='FontHead01'>Welcome Back</h1>
            <p className='FontBody01' style={{ marginBottom: '50px' }}>
               &nbsp;We're glad to see you again!
            </p>

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
                height: 24px; /* Adjust the size of the icon as needed */
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

               <Form.Group controlId="email">
               <div className="input-with-icon">
                 <Form.Control
                   type="email"
                   placeholder="Enter email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="my-placeholder-class"
                   style={{
                     marginBottom: '40px',
                     height: '50px',
                     backgroundColor: '#472a6000',
                     color: 'white',
                     border: 'none',
                     borderBottom: '2px solid #8754a9',
                     borderRadius: '0',
                     paddingRight: '45px', // Add padding to prevent text overlap
                   }}
                 />
                 <img
                   src={mail_ico} // Replace with your logo path
                   alt="Logo"
                   className="input-icon"
                 />
               </div>
               </Form.Group>

               <Form.Group className='my-2' controlId='password'>
                  <div className="input-with-icon">
                  <Form.Control
                     type='password'
                     placeholder='Enter password'
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="my-placeholder-class"
                     style={{
                        marginBottom: '70px',
                        height: '50px',
                        backgroundColor: '#472a6000',
                        color: 'white',
                        border: 'none',
                        borderBottom: '2px solid #8754a9',
                        borderRadius: '0',
                        paddingRight: '45px', // Add padding to prevent text overlap
                      }}
                  />
                  <img
                   src={pass_ico} // Replace with your logo path
                   alt="Logo"
                   className="input-icon"
                 />
                  </div>
               </Form.Group>

               <Button
                  disabled={isLoading}
                  type='submit'
                  variant='primary'
                  className='mt-3 button-no-outline'
                  style={{
                     marginTop: '15px',
                     marginBottom: '5px',
                     display: 'block', // Centers the button horizontally
                     marginLeft: 'auto',
                     marginRight: 'auto',
                     fontSize: '1.2rem',
                     fontWeight: 'bold',
                     width: '80%',
                     height: '55px',
                  }}
               >
                  Log In
               </Button>
            </Form>

            {/* Removed the Loader component usage */}
            {/* {isLoading && <Loader />} */}

            <Row className='py-3'>
               <Col className='FontBody01' style={{ textAlign: 'center' }}>
                  Don't have an account?{' '}
                  <Link
                     style={{
                        textDecoration: 'none',
                        color: 'white',
                        fontStyle: 'italic',
                     }}
                     to='/register'
                  >
                     Sign up
                  </Link>
               </Col>
            </Row>
         </div>
      </FormContainer>
   );
};

export default LoginScreen;
