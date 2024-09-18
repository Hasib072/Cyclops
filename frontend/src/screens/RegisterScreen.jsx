import { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
// import Loader from '../components/Loader';
import mail_ico from '../assets/icons/mail.png'
import pass_ico from '../assets/icons/pass.png'
import user_circle_ico from '../assets/icons/account_circle.png'


const RegisterScreen = () => {
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');

   const dispatch = useDispatch();
   const navigate = useNavigate();

   const [register, { isLoading }] = useRegisterMutation();

   const { userInfo } = useSelector((state) => state.auth);

   useEffect(() => {
      if (userInfo) {
         navigate('/');
      }
   }, [navigate, userInfo]);

   const submitHandler = async (e) => {
      e.preventDefault();

      if (password !== confirmPassword) {
         toast.error('Passwords do not match');
      } else {
         try {
            const res = await register({ name, email, password }).unwrap();
            dispatch(setCredentials({ ...res }));
            navigate('/');
         } catch (err) {
            toast.error(err?.data?.message || err.error);
         }
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
            <Form.Group className='my-2' controlId='name'>
            <div className="input-with-icon">
               <Form.Control
                  type='name'
                  placeholder='Enter name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="my-placeholder-class"
                  style={{
                     marginTop: '20px',
                     backgroundColor: '#472a6000',
                     color: 'white',
                     border: 'none',
                     borderBottom: '2px solid #8754a9',
                     borderRadius: '0',
                     paddingRight: '45px', // Add padding to prevent text overlap
                   }}
               />
               <img
                   src={user_circle_ico} // Replace with your logo path
                   alt="Logo"
                   className="input-icon"
                 />
               </div>
            </Form.Group>

            <Form.Group className='my-2' controlId='email'>
            <div className="input-with-icon">
               <Form.Control
                  type='email'
                  placeholder='Enter email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="my-placeholder-class"
                  style={{
                     marginTop: '20px',
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
                  onChange={(e) => setPassword(e.target.value)}className="my-placeholder-class"
                  style={{
                     marginTop: '20px',
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
            <Form.Group className='my-2' controlId='confirmPassword'>
            <div className="input-with-icon">
               <Form.Control
                  type='password'
                  placeholder='Confirm password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}className="my-placeholder-class"
                  style={{
                     marginTop: '20px',
                     marginBottom: '30px',
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

            {/* {isLoading && <Loader />} */}

            <Button type='submit' variant='primary' className='mt-3 button-no-outline'
            style={{
               marginTop: '15px',
               marginBottom: '5px',
               display: 'block', // Centers the button horizontally
               marginLeft: 'auto',
               marginRight: 'auto',
               fontOpticalSizing: 'auto',
               fontSize: '1.2rem',
               fontWeight: 'bold',
               width: '80%',
               height: '55px',
            }}
            >
               Sign up
            </Button>
         </Form>

         <Row className='py-3'>
            <Col className='FontBody01' style={{ textAlign: 'center' }}>
               Already have an account? <Link style={{ textDecoration: 'none', color: 'white', fontStyle: 'italic' }} to={`/login`}>Login</Link>
            </Col>
         </Row>
         </div>
      </FormContainer>
   );
};

export default RegisterScreen;