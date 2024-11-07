// frontend/src/slices/apiSlice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout, setCredentials } from './authSlice';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BACKEND_URL + '/api', // 'https://cyclops-ze9u.onrender.com/api'
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token || localStorage.getItem('token'); // Retrieve token from Redux store or localStorage
      if (token) {
        headers.set('Authorization', `Bearer ${token}`); // Set Authorization header
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Profile', 'Workspace', 'List', 'Task'],
  endpoints: () => ({}), // Endpoints are injected elsewhere
});
