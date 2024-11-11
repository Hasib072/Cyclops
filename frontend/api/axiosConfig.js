// frontend/src/api/axiosConfig.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
