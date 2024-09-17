import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js'

dotenv.config();

const port = process.env.PORT || 5000;

connectDB();

const app = express(); // create instance as "app"

app.use(express.json()); // allow to pass raw json
app.use(express.urlencoded({ extended: true })); // allow to send form-data

app.use(cookieParser());

app.use(cors());

app.use('/api/users', userRoutes);//whenever api endpoint => /api/user, then call route => userRoutes
// app.get('/', (req, res) => res.send('Server is ready')); //move to line 35

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

app.listen(port, () => console.log(`Server stared on port ${port}`));