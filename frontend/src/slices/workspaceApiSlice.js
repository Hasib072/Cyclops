// frontend/src/slices/workspaceApiSlice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const workspaceApi = createApi({
  reducerPath: 'workspaceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token; // Assuming you have an auth slice
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Workspace', 'List', 'Task'],
  endpoints: (builder) => ({
    // Workspace Endpoints
    createWorkspace: builder.mutation({
      query: (workspaceData) => ({
        url: '/workspaces',
        method: 'POST',
        body: workspaceData,
      }),
      invalidatesTags: [{ type: 'Workspace', id: 'LIST' }],
    }),
    getWorkspaceById: builder.query({
      query: (workspaceId) => `/workspaces/${workspaceId}`,
      providesTags: (result, error, workspaceId) => [{ type: 'Workspace', id: workspaceId }],
    }),
    addListToWorkspace: builder.mutation({
      query: ({ workspaceId, name, description }) => ({
        url: `/workspaces/${workspaceId}/lists`,
        method: 'POST',
        body: { name, description },
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'Workspace', id: workspaceId }],
    }),
    updateListInWorkspace: builder.mutation({
      query: ({ workspaceId, listId, name, description }) => ({
        url: `/workspaces/${workspaceId}/lists/${listId}`,
        method: 'PUT',
        body: { name, description },
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'Workspace', id: workspaceId }],
    }),
    deleteListFromWorkspace: builder.mutation({
      query: ({ workspaceId, listId }) => ({
        url: `/workspaces/${workspaceId}/lists/${listId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'Workspace', id: workspaceId }],
    }),

    // Task Endpoints
    addTaskToList: builder.mutation({
      query: ({ workspaceId, listId, taskData }) => ({
        url: `/workspaces/${workspaceId}/lists/${listId}/tasks`,
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'Workspace', id: workspaceId }],
    }),
    updateTaskInList: builder.mutation({
      query: ({ workspaceId, listId, taskId, taskData }) => ({
        url: `/workspaces/${workspaceId}/lists/${listId}/tasks/${taskId}`,
        method: 'PUT',
        body: taskData,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'Workspace', id: workspaceId }],
    }),
    deleteTaskFromList: builder.mutation({
      query: ({ workspaceId, listId, taskId }) => ({
        url: `/workspaces/${workspaceId}/lists/${listId}/tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'Workspace', id: workspaceId }],
    }),
  }),
});

export const {
  // Workspace Hooks
  useCreateWorkspaceMutation,
  useGetWorkspaceByIdQuery,

  // List Hooks
  useAddListToWorkspaceMutation,
  useUpdateListInWorkspaceMutation,
  useDeleteListFromWorkspaceMutation,

  // Task Hooks
  useAddTaskToListMutation,
  useUpdateTaskInListMutation,
  useDeleteTaskFromListMutation,
} = workspaceApi;
