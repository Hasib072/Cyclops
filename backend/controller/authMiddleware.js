// backend/controller/authMiddleware.js

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const ValidateJWT = asyncHandler(async (req, res, next) => {
  let token;

  // Check for JWT in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Received Token:', token); // Debugging

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded Token:', decoded); // Debugging

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      console.log('Authenticated User:', req.user); // Debugging

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
  }

  if (!token) {
    console.log('No token provided'); // Debugging
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const sseAuthMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  // Check for JWT in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Received Token for SSE:', token); // Debugging

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded Token for SSE:', decoded); // Debugging

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      console.log('Authenticated User for SSE:', req.user); // Debugging

      if (!req.user) {
        res.status(401);
        res.write('event: error\ndata: User not found\n\n');
        res.end();
        return;
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error for SSE:', error);
      res.status(401);
      res.write('event: error\ndata: Not authorized, token failed\n\n');
      res.end();
    }
  } else {
    res.status(401);
    res.write('event: error\ndata: Not authorized, no token\n\n');
    res.end();
  }
});

export { ValidateJWT, sseAuthMiddleware };
