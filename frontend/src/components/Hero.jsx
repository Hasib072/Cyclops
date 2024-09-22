// src/components/Hero.jsx

import React, { useState } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import Sidebar from './Sidebar'; // Import the Sidebar component

const Hero = () => {
   const { userInfo } = useSelector((state) => state.auth);
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const [logoutApiCall] = useLogoutMutation();
   const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // New state
 
   const logoutHandler = async () => {
     try {
       await logoutApiCall().unwrap();
       dispatch(logout());
       navigate('/login');
     } catch (err) {
       console.error(err);
     }
   };
 
   const handleSidebarToggle = (expanded) => {
     setIsSidebarExpanded(expanded);
   };
 
   return (
     <div style={{ display: 'flex' }}>
       {userInfo && <Sidebar user={userInfo} onToggle={handleSidebarToggle} />} {/* Pass callback */}
 
       {/* Main Content */}
       <div style={{ 
         marginLeft: userInfo ? (isSidebarExpanded ? '250px' : '80px') : '0', 
         transition: 'margin 0.3s ease', 
         width: '100%' 
       }}>
         <div className='py-5'>
           <Container className='d-flex justify-content-center'>
             <Card className='p-5 d-flex flex-column align-items-center hero-card bg-light w-75'>
               <h1 className='text-center mb-4'>
                 {userInfo ? userInfo.name : 'MERN Authentication'}
               </h1>
               <p className='text-center mb-4'>
                 {userInfo
                   ? 'Welcome back!'
                   : 'This is a boilerplate for MERN authentication that stores a JWT in an HTTP-Only cookie. It also uses Redux Toolkit and the React Bootstrap library'}
               </p>
               <div className='d-flex'>
                 {userInfo ? (
                   <>
                     <LinkContainer to='/profile'>
                       <Button variant='primary' className='me-3'>
                         Profile
                       </Button>
                     </LinkContainer>
                     <Button variant='secondary' onClick={logoutHandler}>
                       Logout
                     </Button>
                   </>
                 ) : (
                   <>
                     <Button variant='primary' href='/login' className='me-3'>
                       Sign In
                     </Button>
                     <Button variant='secondary' href='/register'>
                       Register
                     </Button>
                   </>
                 )}
               </div>
             </Card>
           </Container>
         </div>
       </div>
     </div>
   );
 };
 
 export default Hero;
