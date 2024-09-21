// routes/userRoutes.js
import express from 'express';
import { ValidateJWT } from '../controller/authMiddleware.js';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  resendVerificationCode,
} from '../controller/userController.js';
import verifyEmailLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

// Registration and Authentication Routes
router.post('/', registerUser);
router.post('/auth', authUser);
router.post('/logout', logoutUser);

// Profile Routes (Protected)
router
  .route('/profile')
  .get(ValidateJWT, getUserProfile)
  .put(ValidateJWT, updateUserProfile);

// Apply limiter to the /verify-email and /resend-verification routes
router.post('/verify-email', verifyEmailLimiter, verifyEmail);
router.post('/resend-verification', verifyEmailLimiter, resendVerificationCode);

export default router;
