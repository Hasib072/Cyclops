// frontend/src/slices/apiSlice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api', // Should be unique across your application
  baseQuery: fetchBaseQuery({
    baseUrl: '/api', // Ensure this matches your backend route prefix
    credentials: 'include', // Include cookies if your backend uses them
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.userInfo?.token; // Adjust path to token as needed
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Profile', 'Workspace', 'List', 'Task'], // Include all tag types used in your endpoints
  endpoints: () => ({}), // Initial endpoints are empty
});
