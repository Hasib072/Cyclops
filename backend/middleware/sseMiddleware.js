// middleware/sseMiddleware.js

export const sseMiddleware = (req, res, next) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  
    res.flushHeaders();
  
    next();
  };
  