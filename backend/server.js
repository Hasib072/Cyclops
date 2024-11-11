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
app.use(cors({
  origin: 'https://cyclopswebapp.netlify.app', // Frontend URL
  methods: 'GET,POST,PUT,DELETE',
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

// Optional: Remove or verify the Test Route
// Ensure 'test.png' exists in the uploads directory or remove this route
// app.get('/test-upload', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'uploads', 'test.png'));
// });

// Serve frontend in production (optional)
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
