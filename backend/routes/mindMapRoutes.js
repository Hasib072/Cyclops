// backend/routes/mindMapRoutes.js

import express from 'express';
import {
  getMindMap,
  addNode,
  updateNode,
  deleteNode,
  addEdge,
  updateEdge,
  deleteEdge,
} from '../controller/mindMapController.js';
import { ValidateJWT } from '../controller/authMiddleware.js';

const router = express.Router();

// Apply JWT validation to all routes
router.use(ValidateJWT);

// GET Mind Map
router.get('/:workspaceId', getMindMap);

// Node Operations
router.post('/:workspaceId/nodes', addNode);
router.put('/:workspaceId/nodes/:nodeId', updateNode);
router.delete('/:workspaceId/nodes/:nodeId', deleteNode);

// Edge Operations
router.post('/:workspaceId/edges', addEdge);
router.put('/:workspaceId/edges/:edgeId', updateEdge);
router.delete('/:workspaceId/edges/:edgeId', deleteEdge);

export default router;
