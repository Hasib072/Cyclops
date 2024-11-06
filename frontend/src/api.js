// frontend/src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_URL, // Uses the environment variable
  withCredentials: true, // Include if your backend uses cookies
});

export default api;
