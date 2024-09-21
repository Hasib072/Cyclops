// backend/server.js

import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const port = process.env.PORT || 5000;

connectDB();

const app = express(); // create instance as "app"

app.use(express.json()); // allow to pass raw json
app.use(express.urlencoded({ extended: true })); // allow to send form-data

app.use(cookieParser());

app.use(cors());

// Use user routes
app.use('/api/users', userRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '/frontend/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => res.send('Server is ready')); //for root hit
}

app.use(notFound); //for handle non-exist api url
app.use(errorHandler); //for handle and show error with stack in response

app.listen(port, () => console.log(`Server started on port ${port}`));
