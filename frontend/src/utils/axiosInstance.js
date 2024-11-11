// frontend/src/utils/axiosInstance.js

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_URL + '/api', // Ensure this matches your backend route prefix
  withCredentials: true, // If you're using cookies for authentication
});

export default axiosInstance;
