// backend/routes/profileRoutes.js

import express from 'express';
import { getProfile, updateProfile } from '../controller/profileController.js';
import { ValidateJWT } from '../controller/authMiddleware.js';

const router = express.Router();

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', ValidateJWT, getProfile);

// @route   PUT /api/profile
// @desc    Update current user's profile
// @access  Private
router.put('/', ValidateJWT, updateProfile);

export default router;
