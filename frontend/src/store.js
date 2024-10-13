// frontend/src/store.js

import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slices/apiSlice';
import { usersApiSlice } from './slices/usersApiSlice';
import { workspaceApi } from './slices/workspaceApiSlice';
import authReducer from './slices/authSlice'; // Import authReducer

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [usersApiSlice.reducerPath]: usersApiSlice.reducer,
    [workspaceApi.reducerPath]: workspaceApi.reducer,
    auth: authReducer, // Add authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, usersApiSlice.middleware, workspaceApi.middleware),
  devTools: true,
});

export default store;
