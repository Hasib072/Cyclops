// backend/routes/userRoutes.js

import express from 'express';
import { ValidateJWT } from '../controller/authMiddleware.js'; // Corrected path
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  resendVerificationCode,
} from '../controller/userController.js'; // Ensure 'controllers' directory
import verifyEmailLimiter from '../middleware/rateLimiter.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Registration and Authentication Routes
router.post('/', registerUser); // POST /api/users
router.post('/auth', authUser); // POST /api/users/auth
router.post('/logout', logoutUser); // POST /api/users/logout

// Profile Routes (Protected)
router
  .route('/profile')
  .get(ValidateJWT, getUserProfile) // GET /api/users/profile
  .put(ValidateJWT, updateUserProfile); // PUT /api/users/profile

// Verification Routes
router.post('/verify-email', verifyEmailLimiter, verifyEmail); // POST /api/users/verify-email
router.post('/resend-verification', verifyEmailLimiter, resendVerificationCode); // POST /api/users/resend-verification

// Add new route to save verification code
router.post('/save-verification-code', asyncHandler(async (req, res) => {
   const { email, code } = req.body;
 
   const user = await User.findOne({ email });
   
   if (!user) {
     res.status(400);
     throw new Error('Invalid email');
   }
 
   // Update verification code and expiry
   user.verificationCode = code;
   user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
 
   await user.save();
 
   res.json({ message: 'Verification code saved successfully' });
 }));

export default router;
