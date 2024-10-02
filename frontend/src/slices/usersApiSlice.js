// frontend/src/slices/usersApiSlice.js

import { apiSlice } from './apiSlice';
import { setCredentials, logout } from './authSlice';

const USERS_URL = '/users'; // Base endpoint for user-related routes
const PROFILE_URL = '/profile'; // Correct profile endpoint

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // User Authentication Endpoints
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data)); // Store user info from response
        } catch (err) {
          // Optionally handle errors here
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (err) {
          // Optionally handle errors here
        }
      },
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-email`,
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user, token: data.token }));
        } catch (err) {
          // Optionally handle errors here
        }
      },
    }),
    resendVerification: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/resend-verification`,
        method: 'POST',
        body: data,
      }),
    }),

    // Profile Endpoints
    getProfile: builder.query({
      query: () => ({
        url: `${PROFILE_URL}`, // Use PROFILE_URL
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: `${PROFILE_URL}`, // Use PROFILE_URL
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

// Export Hooks for Usage in Components
export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = usersApiSlice;
