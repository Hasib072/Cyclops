import { createSlice } from '@reduxjs/toolkit';

const mindMapSlice = createSlice({
  name: 'mindMap',
  initialState: {
    nodes: [],
    edges: [],
  },
  reducers: {
    setMindMap: (state, action) => {
      state.nodes = action.payload.nodes;
      state.edges = action.payload.edges;
    },
    updateNodePosition: (state, action) => {
      const { nodeId, position } = action.payload;
      const node = state.nodes.find((n) => n.id === nodeId);
      if (node) {
        node.position = position;
      }
    },
    // Add other reducers as needed
  },
});

export const { setMindMap, updateNodePosition } = mindMapSlice.actions;

export default mindMapSlice.reducer;
