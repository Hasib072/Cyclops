// frontend/src/slices/apiSlice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api', // Relative path; requires proxy setup
    credentials: 'include', // Include cookies in requests
  }),
  tagTypes: ['User', 'Profile'],
  endpoints: () => ({}),
});
