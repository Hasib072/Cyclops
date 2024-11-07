// frontend/src/store.js

import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slices/apiSlice';
import { usersApiSlice } from './slices/usersApiSlice';
import { workspaceApiSlice } from './slices/workspaceApiSlice';
import authReducer, { setCredentials } from './slices/authSlice';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [usersApiSlice.reducerPath]: usersApiSlice.reducer,
    [workspaceApiSlice.reducerPath]: workspaceApiSlice.reducer,
    auth: authReducer, // Add authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, usersApiSlice.middleware, workspaceApiSlice.middleware),
  devTools: true,
});

// Initialize store with token from localStorage
const token = localStorage.getItem('token');
if (token) {
  store.dispatch(setCredentials({ token }));
}

export default store;
