// frontend/src/slices/workspaceApiSlice.js

import { apiSlice } from './apiSlice';
// import { updateMindMap } from './mindMapSlice';

// Inject workspace endpoints into the existing apiSlice
export const workspaceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Workspace Endpoints
    createWorkspace: builder.mutation({
      query: (formData) => ({
        url: '/workspaces',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Workspace', id: 'LIST' }, { type: 'Workspaces', id: 'LIST' }],
    }),
    getWorkspaceById: builder.query({
      query: (workspaceId) => `/workspaces/${workspaceId}`,
      providesTags: (result, error, arg) => [{ type: 'Workspace', id: arg }],
    }),

    // Delete Workspace Mutation
    deleteWorkspace: builder.mutation({
      query: (workspaceId) => ({
        url: `/workspaces/${workspaceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, workspaceId) => [
        { type: 'Workspace', id: workspaceId },
        { type: 'Workspaces', id: 'LIST' }, // Assuming you have a list of workspaces that should be refreshed
      ],
      // Optional: You can add onQueryStarted for optimistic updates or additional side effects
      // onQueryStarted: async (workspaceId, { dispatch, queryFulfilled }) => {
      //   try {
      //     await queryFulfilled;
      //     // Additional side effects if needed
      //   } catch {
      //     // Handle errors if needed
      //   }
      // },
    }),

    // List Endpoints
    addListToWorkspace: builder.mutation({
      query: ({ workspaceId, name, description }) => ({
        url: `/workspaces/${workspaceId}/lists`,
        method: 'POST',
        body: { name, description },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Workspace', id: arg.workspaceId }],
    }),
    updateListInWorkspace: builder.mutation({
      query: ({ workspaceId, listId, name, description }) => ({
        url: `/workspaces/${workspaceId}/lists/${listId}`,
        method: 'PUT',
        body: { name, description },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Workspace', id: arg.workspaceId }],
    }),
    deleteListFromWorkspace: builder.mutation({
      query: ({ workspaceId, listId }) => ({
        url: `/workspaces/${workspaceId}/lists/${listId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Workspace', id: arg.workspaceId }],
    }),
    updateListColor: builder.mutation({
      query: ({ workspaceId, listId, color }) => ({
        url: `/workspaces/${workspaceId}/lists/${listId}/color`,
        method: 'PUT',
        body: { color },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Workspace', id: arg.workspaceId }],
    }),

    // Reorder lists within a workspace
    reorderLists: builder.mutation({
      query: ({ workspaceId, newOrder }) => ({
        url: `/workspaces/${workspaceId}/lists/reorder`,
        method: 'PUT',
        body: { newOrder },
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'Workspace', id: workspaceId }],
    }),

    getMessages: builder.query({
      query: (workspaceId) => `/workspaces/${workspaceId}/messages`,
      providesTags: (result, error, workspaceId) => [
        { type: 'Messages', id: workspaceId },
      ],
    }),

    // Send Message
    sendMessage: builder.mutation({
      query: ({ workspaceId, content }) => ({
        url: `/workspaces/${workspaceId}/messages`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'Messages', id: workspaceId },
      ],
    }),

     // Mind Map Endpoints
     getMindMap: builder.query({
      query: (workspaceId) => `/mindmap/${workspaceId}`,
      providesTags: (result, error, workspaceId) => [{ type: 'MindMap', id: workspaceId }],
    }),
    addNode: builder.mutation({
      query: ({ workspaceId, nodeData }) => ({
        url: `/mindmap/${workspaceId}/nodes`,
        method: 'POST',
        body: nodeData,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'MindMap', id: workspaceId }],
    }),
    updateNode: builder.mutation({
      query: ({ workspaceId, nodeId, nodeData }) => ({
        url: `/mindmap/${workspaceId}/nodes/${nodeId}`,
        method: 'PUT',
        body: nodeData,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'MindMap', id: workspaceId }],
    }),
    deleteNode: builder.mutation({
      query: ({ workspaceId, nodeId }) => ({
        url: `/mindmap/${workspaceId}/nodes/${nodeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'MindMap', id: workspaceId }],
    }),
    addEdge: builder.mutation({
      query: ({ workspaceId, edgeData }) => ({
        url: `/mindmap/${workspaceId}/edges`,
        method: 'POST',
        body: edgeData,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'MindMap', id: workspaceId }],
    }),
    updateEdge: builder.mutation({
      query: ({ workspaceId, edgeId, edgeData }) => ({
        url: `/mindmap/${workspaceId}/edges/${edgeId}`,
        method: 'PUT',
        body: edgeData,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'MindMap', id: workspaceId }],
    }),
    deleteEdge: builder.mutation({
      query: ({ workspaceId, edgeId }) => ({
        url: `/mindmap/${workspaceId}/edges/${edgeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { workspaceId }) => [{ type: 'MindMap', id: workspaceId }],
    }),
    
    // Task Endpoints
    addTaskToList: builder.mutation({
      query: ({ workspaceId, listId, taskData }) => ({
        url: `/workspaces/${workspaceId}/lists/${listId}/tasks`,
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Workspace', id: arg.workspaceId }],
    }),
    editTaskInList: builder.mutation({
      query: ({ workspaceId, listId, taskId, updatedTask }) => ({
        url: `/workspaces/${workspaceId}/lists/${listId}/tasks/${taskId}`,
        method: 'PUT',
        body: updatedTask,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Workspace', id: arg.workspaceId }],
    }),
    deleteTaskFromList: builder.mutation({
      query: ({ workspaceId, listId, taskId }) => ({
        url: `/workspaces/${workspaceId}/lists/${listId}/tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Workspace', id: arg.workspaceId }],
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in functional components
export const {
  useCreateWorkspaceMutation,
  useGetWorkspaceByIdQuery,
  useDeleteWorkspaceMutation, // Newly added hook
  useAddListToWorkspaceMutation,
  useUpdateListInWorkspaceMutation,
  useDeleteListFromWorkspaceMutation,
  useUpdateListColorMutation,
  useReorderListsMutation,
  useAddTaskToListMutation,
  useEditTaskInListMutation,
  useDeleteTaskFromListMutation,
  useGetMessagesQuery,
  useSendMessageMutation,

  // Mind Map Hooks
  useGetMindMapQuery,
  useAddNodeMutation,
  useUpdateNodeMutation,
  useDeleteNodeMutation,
  useAddEdgeMutation,
  useUpdateEdgeMutation,
  useDeleteEdgeMutation,
} = workspaceApiSlice;
