// frontend/src/slices/apiSlice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api', // Should be unique across your application
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BACKEND_URL + '/api', // Use environment variable
    credentials: 'include', // Include cookies if your backend uses them
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      if (token) {
        headers.set('Authorization', `Bearer ${token}`); // Set Authorization header
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Profile', 'Workspace', 'List', 'Task'], // Include all tag types used in your endpoints
  endpoints: () => ({}), // Initial endpoints are empty
});
