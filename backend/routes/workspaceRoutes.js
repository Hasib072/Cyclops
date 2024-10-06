// backend/routes/workspaceRoutes.js

import express from 'express';
import {
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
  listWorkspaces,
} from '../controller/workspaceController.js';
import { ValidateJWT } from '../controller/authMiddleware.js';
import workspaceUpload from '../middleware/workspaceUpload.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Apply JWT validation to all routes below
router.use(ValidateJWT);

// @route   POST /api/workspaces
// @desc    Create a new workspace
// @access  Private
router.post('/', workspaceUpload.single('coverImage'), createWorkspace);

// @route   GET /api/workspaces
// @desc    List all workspaces accessible to the user
// @access  Private
router.get('/', listWorkspaces);

// @route   GET /api/workspaces/:id
// @desc    Get workspace by ID
// @access  Private
router.get('/:id', getWorkspaceById);

// @route   PUT /api/workspaces/:id
// @desc    Update workspace
// @access  Private (Only Admins)
router.put('/:id', workspaceUpload.single('coverImage'), updateWorkspace);

// @route   DELETE /api/workspaces/:id
// @desc    Delete workspace
// @access  Private (Only Admins)
router.delete('/:id', deleteWorkspace);

// @route   POST /api/workspaces/:id/members
// @desc    Add member to workspace
// @access  Private (Only Admins)
router.post('/:id/members', addMember);

// @route   DELETE /api/workspaces/:id/members/:memberId
// @desc    Remove member from workspace
// @access  Private (Only Admins)
router.delete('/:id/members/:memberId', removeMember);

export default router;
