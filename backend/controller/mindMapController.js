// backend/controller/mindMapController.js

import asyncHandler from 'express-async-handler';
import MindMap from '../models/mindMapModel.js';
import Workspace from '../models/workspaceModel.js';
import WorkspaceMember from '../models/workspaceMemberModel.js';
import { sendSSEMessage } from './workspaceController.js'; // Ensure this function is exported
import { v4 as uuidv4 } from 'uuid'; // For generating unique stage IDs


// @desc    Get Mind Map for a Workspace
// @route   GET /api/mindmap/:workspaceId
// @access  Private
const getMindMap = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
  
    // Verify that the workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }
  
    // Authorization: Check if the user is a member of the workspace via WorkspaceMember
    const workspaceMember = await WorkspaceMember.findOne({ workspace: workspaceId });
    if (!workspaceMember) {
      res.status(403);
      throw new Error('Workspace has no members');
    }
  
    const isMember = workspaceMember.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
  
    if (!isMember) {
      res.status(403);
      throw new Error('You do not have access to this workspace');
    }
  
    // Find the MindMap associated with the workspace
    let mindMap = await MindMap.findOne({ workspace: workspaceId });
  
    if (!mindMap) {
      // If no MindMap exists, create a new one
      mindMap = await MindMap.create({
        workspace: workspaceId,
        nodes: [],
        edges: [],
      });
  
      // Update the workspace to reference the new MindMap
      workspace.mindMap = mindMap._id;
      await workspace.save();
    }
  
    res.json(mindMap);
  });

// @desc    Add Node to Mind Map
// @route   POST /api/mindmap/:workspaceId/nodes
// @access  Private
const addNode = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { label, color, position } = req.body;

  // Validate input
  if (!label || typeof label !== 'string' || label.trim() === '') {
    res.status(400);
    throw new Error('Node label is required and must be a non-empty string');
  }

  if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
    res.status(400);
    throw new Error('Node position is required and must include x and y coordinates');
  }

  // Find the MindMap
  const mindMap = await MindMap.findOne({ workspace: workspaceId });
  if (!mindMap) {
    res.status(404);
    throw new Error('Mind Map not found');
  }

  // Create the new node
  const newNode = {
    id: uuidv4(),
    label: label.trim(),
    color: color || '#ffffff',
    position,
  };

  mindMap.nodes.push(newNode);
  await mindMap.save();

  res.status(201).json(newNode);

  // Send SSE message to connected clients
  sendSSEMessage(workspaceId, {
    type: 'NODE_ADDED',
    payload: newNode,
  });
});

// @desc    Update Node
// @route   PUT /api/mindmap/:workspaceId/nodes/:nodeId
// @access  Private
const updateNode = asyncHandler(async (req, res) => {
  const { workspaceId, nodeId } = req.params;
  const { label, color, position } = req.body;

  // Find the MindMap
  const mindMap = await MindMap.findOne({ workspace: workspaceId });
  if (!mindMap) {
    res.status(404);
    throw new Error('Mind Map not found');
  }

  // Find the node
  const node = mindMap.nodes.find((n) => n.id === nodeId);
  if (!node) {
    res.status(404);
    throw new Error('Node not found');
  }

  // Update fields if provided
  if (label) {
    if (typeof label !== 'string' || label.trim() === '') {
      res.status(400);
      throw new Error('Node label must be a non-empty string');
    }
    node.label = label.trim();
  }

  if (color) {
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
      res.status(400);
      throw new Error('Invalid HEX color code');
    }
    node.color = color;
  }

  if (position) {
    if (typeof position.x !== 'number' || typeof position.y !== 'number') {
      res.status(400);
      throw new Error('Node position must include x and y coordinates');
    }
    node.position = position;
  }

  await mindMap.save();

  res.json(node);

  // Send SSE message to connected clients
  sendSSEMessage(workspaceId, {
    type: 'NODE_UPDATED',
    payload: node,
  });
});

// @desc    Delete Node
// @route   DELETE /api/mindmap/:workspaceId/nodes/:nodeId
// @access  Private
const deleteNode = asyncHandler(async (req, res) => {
  const { workspaceId, nodeId } = req.params;

  // Find the MindMap
  const mindMap = await MindMap.findOne({ workspace: workspaceId });
  if (!mindMap) {
    res.status(404);
    throw new Error('Mind Map not found');
  }

  // Find the node index
  const nodeIndex = mindMap.nodes.findIndex((n) => n.id === nodeId);
  if (nodeIndex === -1) {
    res.status(404);
    throw new Error('Node not found');
  }

  // Remove associated edges
  mindMap.edges = mindMap.edges.filter(
    (edge) => edge.source !== nodeId && edge.target !== nodeId
  );

  // Remove the node
  mindMap.nodes.splice(nodeIndex, 1);
  await mindMap.save();

  res.json({ message: 'Node deleted successfully' });

  // Send SSE message to connected clients
  sendSSEMessage(workspaceId, {
    type: 'NODE_DELETED',
    payload: { nodeId },
  });
});

// @desc    Add Edge to Mind Map
// @route   POST /api/mindmap/:workspaceId/edges
// @access  Private
const addEdge = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { source, target } = req.body;

  // Validate input
  if (!source || !target) {
    res.status(400);
    throw new Error('Source and target node IDs are required');
  }

  // Find the MindMap
  const mindMap = await MindMap.findOne({ workspace: workspaceId });
  if (!mindMap) {
    res.status(404);
    throw new Error('Mind Map not found');
  }

  // Validate that source and target nodes exist
  const sourceNode = mindMap.nodes.find((n) => n.id === source);
  const targetNode = mindMap.nodes.find((n) => n.id === target);
  if (!sourceNode || !targetNode) {
    res.status(400);
    throw new Error('Source or target node does not exist');
  }

  // Check for duplicate edge
  const duplicateEdge = mindMap.edges.find(
    (e) => e.source === source && e.target === target
  );
  if (duplicateEdge) {
    res.status(400);
    throw new Error('Edge already exists between these nodes');
  }

  // Create the new edge
  const newEdge = {
    id: uuidv4(),
    source,
    target,
  };

  mindMap.edges.push(newEdge);
  await mindMap.save();

  res.status(201).json(newEdge);

  // Send SSE message to connected clients
  sendSSEMessage(workspaceId, {
    type: 'EDGE_ADDED',
    payload: newEdge,
  });
});

// @desc    Update Edge
// @route   PUT /api/mindmap/:workspaceId/edges/:edgeId
// @access  Private
const updateEdge = asyncHandler(async (req, res) => {
  const { workspaceId, edgeId } = req.params;
  const { source, target } = req.body;

  // Find the MindMap
  const mindMap = await MindMap.findOne({ workspace: workspaceId });
  if (!mindMap) {
    res.status(404);
    throw new Error('Mind Map not found');
  }

  // Find the edge
  const edge = mindMap.edges.find((e) => e.id === edgeId);
  if (!edge) {
    res.status(404);
    throw new Error('Edge not found');
  }

  // Update fields if provided
  if (source) {
    const sourceNode = mindMap.nodes.find((n) => n.id === source);
    if (!sourceNode) {
      res.status(400);
      throw new Error('Source node does not exist');
    }
    edge.source = source;
  }

  if (target) {
    const targetNode = mindMap.nodes.find((n) => n.id === target);
    if (!targetNode) {
      res.status(400);
      throw new Error('Target node does not exist');
    }
    edge.target = target;
  }

  await mindMap.save();

  res.json(edge);

  // Send SSE message to connected clients
  sendSSEMessage(workspaceId, {
    type: 'EDGE_UPDATED',
    payload: edge,
  });
});

// @desc    Delete Edge
// @route   DELETE /api/mindmap/:workspaceId/edges/:edgeId
// @access  Private
const deleteEdge = asyncHandler(async (req, res) => {
  const { workspaceId, edgeId } = req.params;

  // Find the MindMap
  const mindMap = await MindMap.findOne({ workspace: workspaceId });
  if (!mindMap) {
    res.status(404);
    throw new Error('Mind Map not found');
  }

  // Find the edge index
  const edgeIndex = mindMap.edges.findIndex((e) => e.id === edgeId);
  if (edgeIndex === -1) {
    res.status(404);
    throw new Error('Edge not found');
  }

  // Remove the edge
  mindMap.edges.splice(edgeIndex, 1);
  await mindMap.save();

  res.json({ message: 'Edge deleted successfully' });

  // Send SSE message to connected clients
  sendSSEMessage(workspaceId, {
    type: 'EDGE_DELETED',
    payload: { edgeId },
  });
});

export {
  getMindMap,
  addNode,
  updateNode,
  deleteNode,
  addEdge,
  updateEdge,
  deleteEdge,
};
