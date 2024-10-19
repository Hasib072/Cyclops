// backend/routes/workspaceRoutes.js

import express from 'express';
import { sseMiddleware } from '../middleware/sseMiddleware.js';

import {
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
  listWorkspaces,
  addListToWorkspace,
  addTaskToList,
  updateListInWorkspace,
  reorderLists,
  deleteListFromWorkspace,
  updateTaskInList,
  deleteTaskFromList,
  updateListColor,
  getWorkspaceUpdates,
} from '../controller/workspaceController.js';
import { ValidateJWT, sseAuthMiddleware} from '../controller/authMiddleware.js';
import workspaceUpload from '../middleware/workspaceUpload.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, '..', '..', 'uploads','workspaces');
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      // Generate a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      // Extract the file extension
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  // File filter to accept only specific image types
  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mime = allowedTypes.test(file.mimetype);
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
    if (mime && ext) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg formats are allowed!'));
  };
  
  // Initialize multer
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
  

const router = express.Router();

// Apply JWT validation to all routes below
router.use(ValidateJWT);

// POST /api/workspaces - Create a new workspace
router.post('/', upload.single('coverImage'), createWorkspace);

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
router.put('/:id', upload.single('coverImage'), updateWorkspace);

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

// @route   POST /api/workspaces/:workspaceId/lists
// @desc    Add a new list to a workspace
// @access  Private
router.post('/:workspaceId/lists', addListToWorkspace);

// @route   POST /api/workspaces/:workspaceId/lists/:listId/tasks
// @desc    Add a new task to a list within a workspace
// @access  Private
router.post('/:workspaceId/lists/:listId/tasks', addTaskToList);

// @route   PUT /api/workspaces/:workspaceId/lists/:listId
// @desc    Update a list within a workspace
// @access  Private
router.put('/:workspaceId/lists/:listId', updateListInWorkspace);

// @desc    Reorder lists within a workspace
// @route   PUT /api/workspaces/:workspaceId/lists/reorder
// @access  Private
router.put('/:workspaceId/lists/reorder', reorderLists);

// @route   PUT /api/workspaces/:workspaceId/lists/:listId.color
// @desc    Update a list color within a workspace
// @access  Private
router.put('/:workspaceId/lists/:listId/color', updateListColor);

// @route   DELETE /api/workspaces/:workspaceId/lists/:listId
// @desc    Delete a list within a workspace
// @access  Private
router.delete('/:workspaceId/lists/:listId', deleteListFromWorkspace);

// @route   PUT /api/workspaces/:workspaceId/lists/:listId/tasks/:taskId
// @desc    Update a task within a list in a workspace
// @access  Private
router.put('/:workspaceId/lists/:listId/tasks/:taskId', updateTaskInList);

// @route   DELETE /api/workspaces/:workspaceId/lists/:listId/tasks/:taskId
// @desc    Delete a task within a list in a workspace
// @access  Private
router.delete('/:workspaceId/lists/:listId/tasks/:taskId', deleteTaskFromList);

// SSE endpoint for workspace updates
router.get('/:workspaceId/updates', sseAuthMiddleware, getWorkspaceUpdates);

export default router;
