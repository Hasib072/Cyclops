// backend/server.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // Import cookie-parser
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js'; // Ensure you have profile routes
import workspaceRoutes from './routes/workspaceRoutes.js'; // Import workspace routes
import mindMapRoutes from './routes/mindMapRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser

// CORS Configuration using environment variable
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow credentials (cookies)
}));

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes); // This should be /api/profile
app.use('/api/workspaces', workspaceRoutes); // Mount workspace routes
app.use('/api/mindmap', mindMapRoutes);

// **Remove Frontend Serving from Backend**
// Since frontend is on Netlify, the backend doesn't need to serve frontend files.
/*
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}
*/

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Connect to DB and Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to connect to the database', error);
  process.exit(1);
});
