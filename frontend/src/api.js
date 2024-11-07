// frontend/src/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api', // 'https://cyclops-ze9u.onrender.com/api'
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Set Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
