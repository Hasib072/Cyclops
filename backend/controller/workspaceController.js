// backend/controller/workspaceController.js

import asyncHandler from 'express-async-handler';
import Workspace from '../models/workspaceModel.js';
import WorkspaceMember from '../models/workspaceMemberModel.js';
import User from '../models/userModel.js';
import generateWorkspaceImage from '../utils/imageGenerator.js'; // Assuming you have a utility for generating images
import path from 'path';
import fs from 'fs';


// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = asyncHandler(async (req, res) => {
    const { workspaceTitle, workspaceDescription } = req.body;
  
    // workspaceTitle is required, coverImage and workspaceDescription are optional
    if (!workspaceTitle) {
      res.status(400);
      throw new Error('Workspace title is required');
    }
  
    // Check for duplicate workspace title
    const workspaceExists = await Workspace.findOne({ workspaceTitle });
  
    if (workspaceExists) {
      res.status(400);
      throw new Error('Workspace with this title already exists');
    }
  
    // Handle cover image
    let coverImagePath = '';
    if (req.file) {
      coverImagePath = `uploads/${req.file.filename}`; // Adjust based on your upload directory
    } else {
      // Generate a default cover image based on the workspace title
      coverImagePath = await generateWorkspaceImage(workspaceTitle);
      // generateWorkspaceImage should return the relative path to the generated image
    }
  
    // Create the workspace
    const workspace = await Workspace.create({
      workspaceTitle,
      coverImage: coverImagePath,
      workspaceDescription: workspaceDescription || '',
      createdBy: req.user._id, // Assuming authMiddleware sets req.user
    });
  
    if (workspace) {
      // Initialize WorkspaceMember with the creator as admin
      await WorkspaceMember.create({
        workspace: workspace._id,
        members: [
          {
            user: req.user._id,
            role: 'admin',
          },
        ],
      });
  
      res.status(201).json({
        _id: workspace._id,
        workspaceTitle: workspace.workspaceTitle,
        coverImage: workspace.coverImage,
        workspaceDescription: workspace.workspaceDescription,
        createdBy: workspace.createdBy,
        creationDateTime: workspace.creationDateTime,
      });
    } else {
      res.status(400);
      throw new Error('Invalid workspace data');
    }
  });

// @desc    Get workspace by ID
// @route   GET /api/workspaces/:id
// @access  Private
const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id).populate('createdBy', 'name email');

  if (workspace) {
    // Fetch members
    const workspaceMembers = await WorkspaceMember.findOne({ workspace: workspace._id }).populate('members.user', 'name email');

    res.json({
      _id: workspace._id,
      workspaceTitle: workspace.workspaceTitle,
      coverImage: workspace.coverImage,
      workspaceDescription: workspace.workspaceDescription,
      createdBy: workspace.createdBy,
      creationDateTime: workspace.creationDateTime,
      members: workspaceMembers ? workspaceMembers.members : [],
    });
  } else {
    res.status(404);
    throw new Error('Workspace not found');
  }
});

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private (Only Admins)
const updateWorkspace = asyncHandler(async (req, res) => {
    const { workspaceTitle, workspaceDescription } = req.body;
  
    const workspace = await Workspace.findById(req.params.id);
  
    if (workspace) {
      // Check if the requester is a member
      const workspaceMember = await WorkspaceMember.findOne({ workspace: workspace._id, 'members.user': req.user._id });
  
      if (!workspaceMember) {
        res.status(403);
        throw new Error('Not authorized to update this workspace');
      }
  
      // Check if the user has admin role
      const member = workspaceMember.members.find((m) => m.user.toString() === req.user._id.toString());
  
      if (member.role !== 'admin') {
        res.status(403);
        throw new Error('Only admins can update the workspace');
      }
  
      // Update fields if provided
      if (workspaceTitle) workspace.workspaceTitle = workspaceTitle;
      if (workspaceDescription) workspace.workspaceDescription = workspaceDescription;
  
      // Handle cover image
      if (req.file) {
        // Optionally, delete the old cover image if it's not a default image
        if (workspace.coverImage && !workspace.coverImage.includes('default.png')) {
          fs.unlink(path.join(__dirname, '..', '..', workspace.coverImage), (err) => {
            if (err) console.error('Error deleting old cover image:', err);
          });
        }
        workspace.coverImage = `uploads/${req.file.filename}`;
      }
  
      const updatedWorkspace = await workspace.save();
  
      res.json({
        _id: updatedWorkspace._id,
        workspaceTitle: updatedWorkspace.workspaceTitle,
        coverImage: updatedWorkspace.coverImage,
        workspaceDescription: updatedWorkspace.workspaceDescription,
        createdBy: updatedWorkspace.createdBy,
        creationDateTime: updatedWorkspace.creationDateTime,
      });
    } else {
      res.status(404);
      throw new Error('Workspace not found');
    }
  });

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private (Only Admins)
const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (workspace) {
    // Check if the requester is the creator/admin
    const workspaceMember = await WorkspaceMember.findOne({ workspace: workspace._id, 'members.user': req.user._id });

    if (!workspaceMember) {
      res.status(403);
      throw new Error('Not authorized to delete this workspace');
    }

    // Optionally, check if the user has admin role
    const member = workspaceMember.members.find((m) => m.user.toString() === req.user._id.toString());

    if (member.role !== 'admin') {
      res.status(403);
      throw new Error('Only admins can delete the workspace');
    }

    await workspace.remove();
    await WorkspaceMember.deleteOne({ workspace: workspace._id });

    res.json({ message: 'Workspace removed' });
  } else {
    res.status(404);
    throw new Error('Workspace not found');
  }
});

// @desc    Add member to workspace
// @route   POST /api/workspaces/:id/members
// @access  Private (Only Admins)
const addMember = asyncHandler(async (req, res) => {
  const { userId, role } = req.body; // Expecting userId to be a valid User ID and role to be 'admin' or 'member'

  if (!userId) {
    res.status(400);
    throw new Error('User ID is required');
  }

  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Check if the requester is the creator/admin
  const workspaceMember = await WorkspaceMember.findOne({ workspace: workspace._id, 'members.user': req.user._id });

  if (!workspaceMember) {
    res.status(403);
    throw new Error('Not authorized to add members to this workspace');
  }

  // Check if the requester has admin role
  const requester = workspaceMember.members.find((m) => m.user.toString() === req.user._id.toString());

  if (requester.role !== 'admin') {
    res.status(403);
    throw new Error('Only admins can add members to the workspace');
  }

  // Check if the user to be added exists
  const userToAdd = await User.findById(userId);

  if (!userToAdd) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if the user is already a member
  const existingMember = workspaceMember.members.find((m) => m.user.toString() === userId);

  if (existingMember) {
    res.status(400);
    throw new Error('User is already a member of this workspace');
  }

  // Add the new member
  workspaceMember.members.push({ user: userId, role: role || 'member' });
  await workspaceMember.save();

  res.status(201).json({ message: 'Member added successfully' });
});

// @desc    Remove member from workspace
// @route   DELETE /api/workspaces/:id/members/:memberId
// @access  Private (Only Admins)
const removeMember = asyncHandler(async (req, res) => {
  const { id, memberId } = req.params; // id: workspace ID, memberId: user ID to remove

  const workspace = await Workspace.findById(id);

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Check if the requester is the creator/admin
  const workspaceMember = await WorkspaceMember.findOne({ workspace: workspace._id, 'members.user': req.user._id });

  if (!workspaceMember) {
    res.status(403);
    throw new Error('Not authorized to remove members from this workspace');
  }

  // Check if the requester has admin role
  const requester = workspaceMember.members.find((m) => m.user.toString() === req.user._id.toString());

  if (requester.role !== 'admin') {
    res.status(403);
    throw new Error('Only admins can remove members from the workspace');
  }

  // Prevent removing the last admin
  const members = workspaceMember.members.filter((m) => m.user.toString() !== memberId);
  const admins = members.filter((m) => m.role === 'admin');

  if (admins.length === 0) {
    res.status(400);
    throw new Error('Cannot remove the last admin from the workspace');
  }

  // Check if the member to remove exists
  const memberIndex = workspaceMember.members.findIndex((m) => m.user.toString() === memberId);

  if (memberIndex === -1) {
    res.status(404);
    throw new Error('Member not found in this workspace');
  }

  // Remove the member
  workspaceMember.members.splice(memberIndex, 1);
  await workspaceMember.save();

  res.json({ message: 'Member removed successfully' });
});

// @desc    List all workspaces accessible to the user
// @route   GET /api/workspaces
// @access  Private
const listWorkspaces = asyncHandler(async (req, res) => {
  // Find all WorkspaceMembers where the user is a member
  const workspaceMembers = await WorkspaceMember.find({ 'members.user': req.user._id }).populate('workspace');

  const workspaces = workspaceMembers.map((wm) => ({
    _id: wm.workspace._id,
    workspaceTitle: wm.workspace.workspaceTitle,
    coverImage: wm.workspace.coverImage,
    workspaceDescription: wm.workspace.workspaceDescription,
    createdBy: wm.workspace.createdBy,
    creationDateTime: wm.workspace.creationDateTime,
    role: wm.members.find((m) => m.user.toString() === req.user._id.toString()).role,
  }));

  res.json(workspaces);
});

export {
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
  listWorkspaces,
};
