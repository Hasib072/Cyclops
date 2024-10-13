// backend/controller/authMiddleware.js

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const ValidateJWT = asyncHandler(async (req, res, next) => {
  let token;

  // Check for JWT in cookies
  if (req.cookies && req.cookies.jwt) {
    try {
      token = req.cookies.jwt;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export { ValidateJWT };