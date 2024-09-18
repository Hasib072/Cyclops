import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

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
         // eslint-disable-next-line no-debugger
         console.log(err);
         toast.error(err?.data?.message || err.error || err.status);
      }
   };

   return (
      <FormContainer>
         <div
         style={{
            marginTop: '40%',
            marginLeft: '24%',
            marginRight: '24%',
         }}
         >
                  <h1 className='FontHead01'>Welcme Back</h1>
                  <p className='FontBody01' style={{marginBottom: '50px'}}>We're glad to see you again!</p>

         <Form onSubmit={submitHandler}>
            <Form.Group className='my-2' controlId='email'>
               {/* <Form.Label>Email Address</Form.Label> */}
               <Form.Control
                  type='email'
                  placeholder='Enter email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                     marginBottom: '20px',
                     height: '50px',
                     backgroundColor: '#472a6',
                     color: 'white',
                     borderColor: '#472a6000'
                  }}
               ></Form.Control>
            </Form.Group>

            <Form.Group className='my-2' controlId='password'>
               {/* <Form.Label>Password</Form.Label> */}
               <Form.Control
                  type='password'
                  placeholder='Enter password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                     marginBottom: '40px',
                     height: '50px'
                  }}
               ></Form.Control>
            </Form.Group>

            <Button
               disabled={isLoading}
               type='submit'
               variant='primary'
               className='mt-3 button-no-outline'
               style={{
                  marginTop: '15px',
                  marginBottom: '5px',
                  display: 'block',          // Centers the button horizontally
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  fontOpticalSizing: 'auto',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  background: `
                       rgb(29,24,35),
                       linear-gradient(84deg, rgba(29,24,35,1) 0%, rgba(31,25,37,1) 20%, rgba(52,38,61,1) 90%)
                     `,
                  width: '280px',
                  height: '55px',
               }}
            >
               Sign In
            </Button>
         </Form>

         {isLoading && <Loader />}

         <Row className='py-3'>
            <Col className='FontBody01'style={{ textAlign: 'center' }}>
               Don't have an account? <Link style={{ textDecoration: 'none', color: 'white', fontStyle: 'italic' }} to='/register'>Sign up</Link>
            </Col>
         </Row>
         </div>
      </FormContainer>
   );
};

export default LoginScreen;