// middleware/rateLimiter.js

import rateLimit from 'express-rate-limit';

const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many attempts from this IP, please try again after 15 minutes',
});

export default verifyEmailLimiter;
