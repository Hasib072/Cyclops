// backend/controllers/workspaceController.js

import asyncHandler from 'express-async-handler';
import Workspace from '../models/workspaceModel.js';
import WorkspaceMember from '../models/workspaceMemberModel.js';
import MindMap from '../models/mindMapModel.js'; 
import User from '../models/userModel.js';
import Profile from '../models/profileModel.js';
import generateWorkspaceImage from '../utils/imageGenerator.js';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // For generating unique stage IDs

// Keep track of connected clients for SSE
let clients = []; // List of connected clients

// Helper function to send SSE messages to clients connected to a workspace
const sendSSEMessage = (workspaceId, message) => {
  clients.forEach((client) => {
    if (client.workspaceId === workspaceId) {
      client.res.write(`data: ${JSON.stringify(message)}\n\n`);
    }
  });
};



// Allowed Workspace Types and Views (Adjust as per your application needs)
const allowedWorkspaceTypes = ['Starter', 'Kanban', 'Project', 'Scrum']; // Extend as needed

const defaultViewsByType = {
  Starter: ['Lists', 'Board', 'Table', 'Chat'],
  Kanban: ['Board', 'Calendar', 'Chat'],
  Project: ['Gantt', 'Chat'],
  Scrum: ['Gantt', 'Board', 'Chat'],
  // Add other types and their default views as needed
};

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = asyncHandler(async (req, res) => {
  const {
    workspaceTitle,
    workspaceDescription,
    workspaceType,
    selectedViews,
    invitePeople, // Expecting a JSON stringified array of emails
    stages, // Expecting a JSON stringified array of stage objects
    lists, // Optional: JSON stringified array of lists with tasks
  } = req.body;

  // Validation: Required fields
  if (!workspaceTitle) {
    res.status(400);
    throw new Error('Workspace title is required');
  }

  if (!workspaceType) {
    res.status(400);
    throw new Error('Workspace type is required');
  }

  if (!allowedWorkspaceTypes.includes(workspaceType)) {
    res.status(400);
    throw new Error(`Invalid workspace type. Allowed types: ${allowedWorkspaceTypes.join(', ')}`);
  }

  if (!selectedViews) {
    res.status(400);
    throw new Error('Selected views are required');
  }

  // Parse selectedViews and validate
  let parsedSelectedViews;
  try {
    parsedSelectedViews = JSON.parse(selectedViews);
    if (
      !Array.isArray(parsedSelectedViews) ||
      parsedSelectedViews.length === 0 ||
      !parsedSelectedViews.every((view) => typeof view === 'string')
    ) {
      throw new Error();
    }
  } catch (error) {
    res.status(400);
    throw new Error('Selected views must be a non-empty array of strings');
  }

  // Parse invitePeople and validate emails
  let parsedInvitePeople = [];
  if (invitePeople) {
    try {
      // Handle if invitePeople is a stringified JSON or already an array
      if (typeof invitePeople === 'string') {
        parsedInvitePeople = JSON.parse(invitePeople);
      } else if (Array.isArray(invitePeople)) {
        parsedInvitePeople = invitePeople;
      } else {
        throw new Error();
      }

      if (!Array.isArray(parsedInvitePeople)) {
        throw new Error();
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = parsedInvitePeople.filter((email) => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        res.status(400);
        throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      }
    } catch (error) {
      res.status(400);
      throw new Error('Invite People must be a JSON array of valid email strings');
    }
  }

  // Parse stages and validate
  let parsedStages = [];
  if (stages) {
    try {
      parsedStages = JSON.parse(stages);
      if (!Array.isArray(parsedStages) || parsedStages.length === 0) {
        throw new Error();
      }

      // Validate each stage
      const stageNames = new Set();
      parsedStages.forEach((stage, index) => {
        if (
          !stage.name ||
          typeof stage.name !== 'string' ||
          stage.name.trim() === ''
        ) {
          throw new Error(`Stage at index ${index} must have a valid name`);
        }
        if (!stage.color || !/^#([0-9A-F]{3}){1,2}$/i.test(stage.color)) {
          throw new Error(`Stage "${stage.name}" has an invalid color code`);
        }
        if (
          !stage.category ||
          !['Not Started', 'Active', 'Done', 'Pending'].includes(stage.category)
        ) {
          throw new Error(
            `Stage "${stage.name}" has an invalid category. Allowed categories: Not Started, Active, Done, Pending`
          );
        }
        const lowerCaseName = stage.name.toLowerCase();
        if (stageNames.has(lowerCaseName)) {
          throw new Error(`Duplicate stage name detected: "${stage.name}"`);
        }
        stageNames.add(lowerCaseName);
        // Assign a unique ID if not present
        if (!stage.id) {
          stage.id = uuidv4();
        }
      });
    } catch (error) {
      res.status(400);
      throw new Error(error.message || 'Stages must be a valid JSON array of stage objects');
    }
  } else {
    res.status(400);
    throw new Error('Stages are required');
  }

  // Parse lists and tasks (optional)
  let parsedLists = [];
  if (lists) {
    try {
      parsedLists = JSON.parse(lists);
      if (!Array.isArray(parsedLists)) {
        throw new Error();
      }

      // Validate each list
      parsedLists.forEach((list, listIndex) => {
        if (!list.name || typeof list.name !== 'string' || list.name.trim() === '') {
          throw new Error(`List at index ${listIndex} must have a valid name`);
        }
        if (list.description && typeof list.description !== 'string') {
          throw new Error(`List "${list.name}" has an invalid description`);
        }

        // Validate tasks within each list
        if (list.tasks) {
          if (!Array.isArray(list.tasks)) {
            throw new Error(`Tasks in list "${list.name}" must be an array`);
          }

          list.tasks.forEach((task, taskIndex) => {
            if (!task.name || typeof task.name !== 'string' || task.name.trim() === '') {
              throw new Error(`Task at index ${taskIndex} in list "${list.name}" must have a valid name`);
            }
            if (task.priority && !['High', 'Moderate', 'Low'].includes(task.priority)) {
              throw new Error(`Task "${task.name}" in list "${list.name}" has an invalid priority`);
            }
            if (!task.dueDate || isNaN(Date.parse(task.dueDate))) {
              throw new Error(`Task "${task.name}" in list "${list.name}" must have a valid due date`);
            }
            // Assign a unique ID if not present
            if (!task._id) {
              task._id = uuidv4();
            }
          });
        } else {
          list.tasks = []; // Initialize with empty tasks array if not provided
        }
      });
    } catch (error) {
      res.status(400);
      throw new Error(error.message || 'Lists must be a valid JSON array of list objects with tasks');
    }
  }

  // Check for duplicate workspace title per user
  const workspaceExists = await Workspace.findOne({
    workspaceTitle: workspaceTitle.trim(),
    createdBy: req.user._id,
  });

  if (workspaceExists) {
    res.status(400);
    throw new Error('Workspace with this title already exists');
  }

  // Handle cover image
  let coverImagePath = '';
  if (req.file) {
    coverImagePath = `uploads/workspaces/${req.file.filename}`; // Adjust based on your upload directory
  } else {
    // Generate a default cover image based on the workspace title
    coverImagePath = await generateWorkspaceImage(workspaceTitle.trim());
    // generateWorkspaceImage should return the relative path to the generated image
  }

  // Create the workspace with embedded lists and tasks
  const workspace = await Workspace.create({
    workspaceTitle: workspaceTitle.trim(),
    coverImage: coverImagePath,
    workspaceDescription: workspaceDescription ? workspaceDescription.trim() : '',
    createdBy: req.user._id, // Assuming authMiddleware sets req.user
    workspaceType,
    selectedViews: parsedSelectedViews,
    invitePeople: parsedInvitePeople,
    stages: parsedStages,
    lists: parsedLists, // Embedding lists with tasks
  });

  if (workspace) {
    // Initialize WorkspaceMember with the creator as admin
    const members = [
      {
        user: req.user._id,
        role: 'admin',
      },
    ];

    // Handle invited users
    if (parsedInvitePeople.length > 0) {
      for (const email of parsedInvitePeople) {
        const user = await User.findOne({ email });

        if (user) {
          // Check if the user is already in the members array to prevent duplicates
          const alreadyMember = members.some((member) => member.user.toString() === user._id.toString());
          if (!alreadyMember) {
            // Add user to members array with 'member' role
            members.push({
              user: user._id,
              role: 'member',
            });
          }
        } else {
          // Optionally, handle users who don't exist (e.g., send email invitation)
          console.warn(`User with email ${email} does not exist.`);
        }
      }
    }

    // Create the WorkspaceMember document
    await WorkspaceMember.create({
      workspace: workspace._id,
      members,
    });

    // Create a default MindMap for the workspace
    const defaultMindMap = await MindMap.create({
      workspace: workspace._id,
      nodes: [], // Initialize with empty nodes or add default nodes if desired
      edges: [], // Initialize with empty edges or add default edges if desired
    });

    res.status(201).json({
      _id: workspace._id,
      workspaceTitle: workspace.workspaceTitle,
      coverImage: workspace.coverImage,
      workspaceDescription: workspace.workspaceDescription,
      createdBy: workspace.createdBy,
      creationDateTime: workspace.creationDateTime,
      workspaceType: workspace.workspaceType,
      selectedViews: workspace.selectedViews,
      invitePeople: workspace.invitePeople,
      stages: workspace.stages,
      lists: workspace.lists,
      mindMap: defaultMindMap,
    });
  } else {
    res.status(400);
    throw new Error('Invalid workspace data');
  }
});

// @desc    Add a new list to a workspace
// @route   POST /api/workspaces/:workspaceId/lists
// @access  Private
const addListToWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { name, description, color } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400);
    throw new Error('List name is required and must be a non-empty string');
  }

  // Find the workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Check for duplicate list name
  const duplicate = workspace.lists.find(
    (list) => list.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (duplicate) {
    res.status(400);
    throw new Error('List with this name already exists in the workspace');
  }

  // Create the new list
  const newList = {
    _id: uuidv4(),
    name: name.trim(),
    description: description ? description.trim() : '',
    color: color || '#9fa2ff', // Use provided color or default
    tasks: [],
  };

  // Add the list to the workspace
  workspace.lists.push(newList);
  await workspace.save();

  res.status(201).json(newList);

  const newListData = {
    listId: newList._id,
    list: newList,
  };

  sendSSEMessage(workspaceId, { type: 'LIST_ADDED', payload: newListData });

});

const updateListColor = asyncHandler(async (req, res) => {
  const { workspaceId, listId } = req.params;
  const { color } = req.body;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  const list = workspace.lists.find((list) => list._id === listId);  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }

  list.color = color || list.color;

  await workspace.save();

  res.status(200).json(list);
  // Send SSE message to clients connected to this workspace
  const updatedListData = {
    listId,
    list,
  };

  sendSSEMessage(workspaceId, { type: 'LIST_COLOR_UPDATED', payload: updatedListData });
});

// @desc    Add a new task to a list within a workspace
// @route   POST /api/workspaces/:workspaceId/lists/:listId/tasks
// @access  Private
const addTaskToList = asyncHandler(async (req, res) => {
  const { workspaceId, listId } = req.params;
  const { name, description, priority, dueDate, assignee, stageId } = req.body;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  const list = workspace.lists.find((list) => list._id === listId);  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }

  // Validate that the stage exists
  const stageExists = workspace.stages.some((stage) => stage.id === stageId);
  if (!stageExists) {
    res.status(400);
    throw new Error('Invalid stage ID');
  }

  const newTask = {
    _id: uuidv4(),
    name,
    description,
    priority,
    dueDate,
    assignee,
    stageId,
  };

  list.tasks.push(newTask);
  await workspace.save();

  res.status(201).json(newTask);
  const newTaskData = {
    listId,
    taskId: newTask._id,
    task: newTask,
  };

  sendSSEMessage(workspaceId, { type: 'TASK_ADDED', payload: newTaskData });
});


const editTaskInList = asyncHandler(async (req, res) => {
  const { workspaceId, listId, taskId } = req.params;
  const { name, description, priority, dueDate, assignee, stageId } = req.body;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  const list = workspace.lists.find((list) => list._id === listId);  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }

  const task = list.tasks.id(taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Update task fields
  task.name = name || task.name;
  task.description = description || task.description;
  task.priority = priority || task.priority;
  task.dueDate = dueDate || task.dueDate;
  task.assignee = assignee || task.assignee;
  task.stageId = stageId || task.stageId;

  await workspace.save();

  res.status(200).json(task);
  const updatedTaskData = {
    listId,
    taskId,
    task,
  };

  sendSSEMessage(workspaceId, { type: 'TASK_UPDATED', payload: updatedTaskData });
});

// @desc    Update a list within a workspace
// @route   PUT /api/workspaces/:workspaceId/lists/:listId
// @access  Private
const updateListInWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId, listId } = req.params;
  const { name, description } = req.body;

  // Find the workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Find the list
  const list = workspace.lists.find((list) => list._id === listId);  if (!list) {
    res.status(404);
    throw new Error('List not found in the workspace');
  }


  // Update fields if provided
  if (name) {
    if (typeof name !== 'string' || name.trim() === '') {
      res.status(400);
      throw new Error('List name must be a non-empty string');
    }
    // Check for duplicate list name
    const duplicate = workspace.lists.find(
      (l) => l.name.toLowerCase() === name.trim().toLowerCase() && l._id !== listId
    );
    if (duplicate) {
      res.status(400);
      throw new Error('Another list with this name already exists in the workspace');
    }
    list.name = name.trim();
  }

  if (description) {
    if (typeof description !== 'string') {
      res.status(400);
      throw new Error('List description must be a string');
    }
    list.description = description.trim();
  }

  await workspace.save();

  res.json(list);

  // Send SSE message to clients connected to this workspace
  const updatedListData = {
    listId,
    list,
  };

  sendSSEMessage(workspaceId, { type: 'LIST_UPDATED', payload: updatedListData });
});

// @desc    Reorder lists within a workspace
// @route   PUT /api/workspaces/:workspaceId/lists/reorder
// @access  Private
const reorderLists = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { newOrder } = req.body; // Expecting an array of listIds in the desired order

  console.log('Reorder Lists Request:', { workspaceId, newOrder });

  // Validate newOrder
  if (!Array.isArray(newOrder) || newOrder.length === 0) {
    res.status(400);
    throw new Error('newOrder must be a non-empty array of list IDs');
  }

  // Find the workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  console.log('Workspace Lists:', workspace.lists.map(list => list._id));

  // Extract existing list IDs from the workspace
  const existingListIds = workspace.lists.map((list) => list._id);

  // Check if newOrder contains all existing list IDs without duplicates
  const allListsPresent =
    newOrder.length === existingListIds.length &&
    newOrder.every((id) => existingListIds.includes(id));
  if (!allListsPresent) {
    res.status(400);
    throw new Error('newOrder must include all existing list IDs without duplicates');
  }

  // Reorder the workspace.lists array based on newOrder
  const reorderedLists = newOrder.map((id) => {
    const list = workspace.lists.find((list) => list._id === id);
    if (!list) {
      res.status(404);
      throw new Error(`List with ID ${id} not found in the workspace`);
    }
    return list;
  });

  workspace.lists = reorderedLists;

  await workspace.save();

  console.log('Reordered Lists:', workspace.lists.map(list => list._id));

  res.json({ message: 'Lists reordered successfully', lists: workspace.lists });

  // Send SSE message to clients connected to this workspace
  sendSSEMessage(workspaceId, {
    type: 'LISTS_REORDERED',
    payload: { lists: workspace.lists },
  });

});


// @desc    Delete a list within a workspace
// @route   DELETE /api/workspaces/:workspaceId/lists/:listId
// @access  Private
const deleteListFromWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId, listId } = req.params;

  // Find the workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Check if the list exists in the workspace
  const listExists = workspace.lists.some((list) => list._id === listId);
  if (!listExists) {
    res.status(404);
    throw new Error('List not found in the workspace');
  }

  // Remove the list using pull
  workspace.lists.pull({ _id: listId });
  await workspace.save();

  res.json({ message: 'List deleted successfully' });

  // Send SSE message to clients connected to this workspace
  sendSSEMessage(workspaceId, {
    type: 'LIST_DELETED',
    payload: { listId },
  });

});

// @desc    Update a task within a list in a workspace
// @route   PUT /api/workspaces/:workspaceId/lists/:listId/tasks/:taskId
// @access  Private
const updateTaskInList = asyncHandler(async (req, res) => {
  const { workspaceId, listId, taskId } = req.params;
  const { name, description, priority, dueDate, assignee, stageId } = req.body;

  // Find the workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Find the list
  const list = workspace.lists.find((list) => list._id === listId);  if (!list) {
    res.status(404);
    throw new Error('List not found in the workspace');
  }

  // Find the task
  const task = list.tasks.id(taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found in the list');
  }

  // Update fields if provided
  if (name) {
    if (typeof name !== 'string' || name.trim() === '') {
      res.status(400);
      throw new Error('Task name must be a non-empty string');
    }
    task.name = name.trim();
  }

  if (description) {
    if (typeof description !== 'string') {
      res.status(400);
      throw new Error('Task description must be a string');
    }
    task.description = description.trim();
  }

  if (priority) {
    if (!['High', 'Moderate', 'Low'].includes(priority)) {
      res.status(400);
      throw new Error('Priority must be one of High, Moderate, Low');
    }
    task.priority = priority;
  }

  if (dueDate) {
    if (isNaN(Date.parse(dueDate))) {
      res.status(400);
      throw new Error('Valid due date is required');
    }
    task.dueDate = new Date(dueDate);
  }

  if (assignee !== undefined) {
    task.assignee = assignee; // Can be null or a valid User ID
  }

  if (stageId) {
    // Optionally, validate stageId against existing stages
    const stageExists = workspace.stages.some((stage) => stage.id === stageId);
    if (!stageExists) {
      res.status(400);
      throw new Error('Invalid stage ID');
    }
    task.stageId = stageId;
  }

  await workspace.save();

  res.json(task);

  // Send SSE message to clients connected to this workspace
  const updatedTaskData = {
    listId,
    taskId,
    task,
  };

  sendSSEMessage(workspaceId, { type: 'TASK_UPDATED', payload: updatedTaskData });
});

// @desc    Delete a task within a list in a workspace
// @route   DELETE /api/workspaces/:workspaceId/lists/:listId/tasks/:taskId
// @access  Private
const deleteTaskFromList = asyncHandler(async (req, res) => {
  const { workspaceId, listId, taskId } = req.params;

  // Find the workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Find the list
  const list = workspace.lists.find((list) => list._id === listId);  if (!list) {
    res.status(404);
    throw new Error('List not found in the workspace');
  }

  // Find the task
  const task = list.tasks.id(taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found in the list');
  }

  // Remove the task
  list.tasks.pull(taskId);
  await workspace.save();


  res.json({ message: 'Task deleted successfully' });

  // Send SSE message to clients connected to this workspace
  sendSSEMessage(workspaceId, {
    type: 'TASK_DELETED',
    payload: { listId, taskId },
  });
});

// @desc    Get workspace by ID
// @route   GET /api/workspaces/:id
// @access  Private
const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspaceId = req.params.id;

  // Check if the user is a member of the workspace
  const workspaceMember = await WorkspaceMember.findOne({
    workspace: workspaceId,
    'members.user': req.user._id,
  }).lean();

  if (!workspaceMember) {
    res.status(403);
    throw new Error('You do not have access to this workspace');
  }

  const workspace = await Workspace.findById(workspaceId)
    .populate('createdBy', 'name email')
    .lean();

  if (workspace) {
    // Fetch all members of the workspace
    const membersWithDetails = await Promise.all(
      workspaceMember.members.map(async (member) => {
        // Fetch user data
        const user = await User.findById(member.user).select('name email').lean();

        // Fetch profile data
        const profile = await Profile.findOne({ user: member.user }).select('profileImage').lean();

        return {
          user: {
            ...user,
            profileImage: profile?.profileImage || '',
          },
          role: member.role,
        };
      })
    );

    // Add the members to the workspace object
    workspace.members = membersWithDetails;

    res.json(workspace);
  } else {
    res.status(404);
    throw new Error('Workspace not found');
  }
});


// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private (Only Admins)
const updateWorkspace = asyncHandler(async (req, res) => {
  const {
    workspaceTitle,
    workspaceDescription,
    workspaceType,
    selectedViews,
    invitePeople, // Expecting a JSON stringified array of emails
    stages, // Expecting a JSON stringified array of stage objects
  } = req.body;

  const workspace = await Workspace.findById(req.params.id);

  if (workspace) {
    // Check if the requester is a member
    const workspaceMember = await WorkspaceMember.findOne({
      workspace: workspace._id,
      'members.user': req.user._id,
    });

    if (!workspaceMember) {
      res.status(403);
      throw new Error('Not authorized to update this workspace');
    }

    // Check if the user has admin role
    const member = workspaceMember.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (member.role !== 'admin') {
      res.status(403);
      throw new Error('Only admins can update the workspace');
    }

    // Update workspaceTitle if provided and unique per user
    if (workspaceTitle && workspaceTitle.trim() !== workspace.workspaceTitle) {
      const duplicateWorkspace = await Workspace.findOne({
        workspaceTitle: workspaceTitle.trim(),
        createdBy: req.user._id,
        _id: { $ne: workspace._id }, // Exclude current workspace
      });

      if (duplicateWorkspace) {
        res.status(400);
        throw new Error('Another workspace with this title already exists');
      }

      workspace.workspaceTitle = workspaceTitle.trim();
    }

    // Update workspaceType if provided
    if (workspaceType) {
      if (!allowedWorkspaceTypes.includes(workspaceType)) {
        res.status(400);
        throw new Error(`Invalid workspace type. Allowed types: ${allowedWorkspaceTypes.join(', ')}`);
      }
      workspace.workspaceType = workspaceType;

      // Optionally, update selectedViews based on the new workspaceType
      if (selectedViews) {
        const allowedViews = defaultViewsByType[workspaceType] || [];
        const parsedSelectedViews = JSON.parse(selectedViews);
        const invalidViews = parsedSelectedViews.filter((view) => !allowedViews.includes(view));
        if (invalidViews.length > 0) {
          res.status(400);
          throw new Error(`Invalid views for workspace type "${workspaceType}": ${invalidViews.join(', ')}`);
        }
        workspace.selectedViews = parsedSelectedViews;
      }
    }

    // Update workspaceDescription if provided
    if (workspaceDescription) {
      workspace.workspaceDescription = workspaceDescription.trim();
    }

    // Update selectedViews if provided and workspaceType is not being changed
    if (selectedViews && !workspaceType) {
      let parsedSelectedViews;
      try {
        parsedSelectedViews = JSON.parse(selectedViews);
        if (
          !Array.isArray(parsedSelectedViews) ||
          parsedSelectedViews.length === 0 ||
          !parsedSelectedViews.every((view) => typeof view === 'string')
        ) {
          throw new Error();
        }
      } catch (error) {
        res.status(400);
        throw new Error('Selected views must be a non-empty array of strings');
      }

      // Validate selectedViews against current workspaceType
      const allowedViews = defaultViewsByType[workspace.workspaceType] || [];
      const invalidViews = parsedSelectedViews.filter((view) => !allowedViews.includes(view));
      if (invalidViews.length > 0) {
        res.status(400);
        throw new Error(`Invalid views for workspace type "${workspace.workspaceType}": ${invalidViews.join(', ')}`);
      }

      workspace.selectedViews = parsedSelectedViews;
    }

    // Update invitePeople if provided
    if (invitePeople) {
      let parsedInvitePeople = [];
      try {
        parsedInvitePeople = JSON.parse(invitePeople);
        if (!Array.isArray(parsedInvitePeople)) {
          throw new Error();
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = parsedInvitePeople.filter((email) => !emailRegex.test(email));
        if (invalidEmails.length > 0) {
          res.status(400);
          throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
        }
      } catch (error) {
        res.status(400);
        throw new Error('Invite People must be a JSON array of valid email strings');
      }

      workspace.invitePeople = parsedInvitePeople;
    }

    // Update stages if provided
    if (stages) {
      let parsedStages = [];
      try {
        parsedStages = JSON.parse(stages);
        if (!Array.isArray(parsedStages) || parsedStages.length === 0) {
          throw new Error();
        }

        // Validate each stage
        const stageNames = new Set();
        parsedStages.forEach((stage, index) => {
          if (
            !stage.name ||
            typeof stage.name !== 'string' ||
            stage.name.trim() === ''
          ) {
            throw new Error(`Stage at index ${index} must have a valid name`);
          }
          if (!stage.color || !/^#([0-9A-F]{3}){1,2}$/i.test(stage.color)) {
            throw new Error(`Stage "${stage.name}" has an invalid color code`);
          }
          if (
            !stage.category ||
            !['Not Started', 'Active', 'Done', 'Pending'].includes(stage.category)
          ) {
            throw new Error(
              `Stage "${stage.name}" has an invalid category. Allowed categories: Not Started, Active, Done, Pending`
            );
          }
          const lowerCaseName = stage.name.toLowerCase();
          if (stageNames.has(lowerCaseName)) {
            throw new Error(`Duplicate stage name detected: "${stage.name}"`);
          }
          stageNames.add(lowerCaseName);
          // Assign a unique ID if not present
          if (!stage.id) {
            stage.id = uuidv4();
          }
        });

        // Assign the validated and parsed stages to the workspace
        workspace.stages = parsedStages;
      } catch (error) {
        res.status(400);
        throw new Error(error.message || 'Stages must be a valid JSON array of stage objects');
      }
    }

    // Handle cover image update if provided
    if (req.file) {
      // Optionally, delete the old cover image if it's not a default image
      if (workspace.coverImage && !workspace.coverImage.includes('default.png')) {
        fs.unlink(path.join(__dirname, '..', '..', workspace.coverImage), (err) => {
          if (err) console.error('Error deleting old cover image:', err);
        });
      }
      workspace.coverImage = `uploads/workspaces/${req.file.filename}`;
    }

    const updatedWorkspace = await workspace.save();

    res.json({
      _id: updatedWorkspace._id,
      workspaceTitle: updatedWorkspace.workspaceTitle,
      coverImage: updatedWorkspace.coverImage,
      workspaceDescription: updatedWorkspace.workspaceDescription,
      createdBy: updatedWorkspace.createdBy,
      creationDateTime: updatedWorkspace.creationDateTime,
      workspaceType: updatedWorkspace.workspaceType,
      selectedViews: updatedWorkspace.selectedViews,
      invitePeople: updatedWorkspace.invitePeople,
      stages: updatedWorkspace.stages,
    });
    // Send SSE message to clients connected to this workspace
    sendSSEMessage(workspace._id.toString(), {
      type: 'WORKSPACE_UPDATED',
      payload: { workspace: updatedWorkspace },
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
    // Check if the requester is a member
    const workspaceMember = await WorkspaceMember.findOne({
      workspace: workspace._id,
      'members.user': req.user._id,
    });

    if (!workspaceMember) {
      res.status(403);
      throw new Error('Not authorized to delete this workspace');
    }

    // Check if the user has admin role
    const member = workspaceMember.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (member.role !== 'admin') {
      res.status(403);
      throw new Error('Only admins can delete the workspace');
    }

    // Optionally, delete the cover image if it's not a default image
    if (workspace.coverImage && !workspace.coverImage.includes('default.png')) {
      fs.unlink(path.join(__dirname, '..', '..', workspace.coverImage), (err) => {
        if (err) console.error('Error deleting cover image:', err);
      });
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

  // Validate role
  const allowedRoles = ['admin', 'member'];
  if (role && !allowedRoles.includes(role)) {
    res.status(400);
    throw new Error(`Invalid role. Allowed roles: ${allowedRoles.join(', ')}`);
  }

  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Check if the requester is a member
  const workspaceMember = await WorkspaceMember.findOne({
    workspace: workspace._id,
    'members.user': req.user._id,
  });

  if (!workspaceMember) {
    res.status(403);
    throw new Error('Not authorized to add members to this workspace');
  }

  // Check if the requester has admin role
  const requester = workspaceMember.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );

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
  const existingMember = workspaceMember.members.find(
    (m) => m.user.toString() === userId
  );

  if (existingMember) {
    res.status(400);
    throw new Error('User is already a member of this workspace');
  }

  // Add the new member
  workspaceMember.members.push({ user: userId, role: role || 'member' });
  await workspaceMember.save();

  res.status(201).json({ message: 'Member added successfully' });

  // Send SSE message to clients connected to this workspace
  sendSSEMessage(req.params.id, {
    type: 'MEMBER_ADDED',
    payload: { userId, role },
  });
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

  // Check if the requester is a member
  const workspaceMember = await WorkspaceMember.findOne({
    workspace: workspace._id,
    'members.user': req.user._id,
  });

  if (!workspaceMember) {
    res.status(403);
    throw new Error('Not authorized to remove members from this workspace');
  }

  // Check if the requester has admin role
  const requester = workspaceMember.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );

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
  const memberIndex = workspaceMember.members.findIndex(
    (m) => m.user.toString() === memberId
  );

  if (memberIndex === -1) {
    res.status(404);
    throw new Error('Member not found in this workspace');
  }

  // Remove the member
  workspaceMember.members.splice(memberIndex, 1);
  await workspaceMember.save();

  res.json({ message: 'Member removed successfully' });
  // Send SSE message to clients connected to this workspace
  sendSSEMessage(id, {
    type: 'MEMBER_REMOVED',
    payload: { userId: memberId },
  });
});

// @desc    List all workspaces accessible to the user
// @route   GET /api/workspaces
// @access  Private
const listWorkspaces = asyncHandler(async (req, res) => {
  // Find all WorkspaceMembers where the user is a member
  const workspaceMembers = await WorkspaceMember.find({ 'members.user': req.user._id })
    .populate({
      path: 'workspace',
      populate: {
        path: 'createdBy',
        select: 'name email',
      },
    })
    .lean();

  const workspaces = [];

  for (const wm of workspaceMembers) {
    // Fetch all members of the workspace
    const membersWithDetails = await Promise.all(
      wm.members.map(async (member) => {
        // Fetch user data
        const user = await User.findById(member.user).select('name email').lean();

        // Fetch profile data
        const profile = await Profile.findOne({ user: member.user }).select('profileImage').lean();

        return {
          user: {
            ...user,
            profileImage: profile?.profileImage || '',
          },
          role: member.role,
        };
      })
    );

    workspaces.push({
      _id: wm.workspace._id,
      workspaceTitle: wm.workspace.workspaceTitle,
      coverImage: wm.workspace.coverImage,
      workspaceDescription: wm.workspace.workspaceDescription,
      createdBy: wm.workspace.createdBy,
      creationDateTime: wm.workspace.creationDateTime,
      workspaceType: wm.workspace.workspaceType,
      selectedViews: wm.workspace.selectedViews,
      invitePeople: wm.workspace.invitePeople,
      stages: wm.workspace.stages,
      role: wm.members.find((m) => m.user.toString() === req.user._id.toString()).role,
      members: membersWithDetails,
    });
  }

  res.json(workspaces);
});



// @desc    Get real-time updates for a workspace
// @route   GET /api/workspaces/:workspaceId/updates
// @access  Private
const getWorkspaceUpdates = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  // Authorization: Check if the user is a member of the workspace
  const isMember = await WorkspaceMember.exists({
    workspace: workspaceId,
    'members.user': req.user._id,
  });

  if (!isMember) {
    res.status(403);
    throw new Error('You do not have access to this workspace');
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders();

  // Keep the connection alive with heartbeats
  const keepAliveInterval = setInterval(() => {
    res.write(':\n\n');
  }, 30000); // Every 30 seconds

  // Add client to the list
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    workspaceId,
    res,
  };
  clients.push(newClient);

  console.log(`Client ${clientId} connected to workspace ${workspaceId}`);

  // Remove client on connection close
  req.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clients = clients.filter((client) => client.id !== clientId);
    clearInterval(keepAliveInterval);
  });
});

// @desc    Get all messages for a workspace
// @route   GET /api/workspaces/:workspaceId/messages
// @access  Private (Members of the workspace)
const getMessages = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.workspaceId)
    .populate('messages.sender', 'name email profileImage')
    .populate('members.user', 'name email profileImage');

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Check if the user is a member of the workspace
  const isMember = workspace.members.some(
    (member) => member.user._id.toString() === req.user._id.toString()
  );

  // if (!isMember) {
  //   res.status(403);
  //   throw new Error('Access denied');
  // }

  res.json(workspace.messages);
});

// @desc    Send a new message to a workspace
// @route   POST /api/workspaces/:workspaceId/messages
// @access  Private (Members of the workspace)
const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {
    res.status(400);
    throw new Error('Message content is required');
  }

  const workspace = await Workspace.findById(req.params.workspaceId);

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Check if the user is a member of the workspace
  const isMember = workspace.members.some(
    (member) => member.user.toString() === req.user._id.toString()
  );

  // if (!isMember) {
  //   res.status(403);
  //   throw new Error('Access denied');
  // }

  const message = {
    sender: req.user._id,
    content: content.trim(),
    createdAt: new Date(),
  };

  workspace.messages.push(message);
  await workspace.save();

  // Populate the sender's information for the response
  await workspace.populate({
    path: 'messages.sender',
    select: 'name email profileImage',
  });

  // Retrieve the newly added message (last in the array)
  const populatedMessage = workspace.messages[workspace.messages.length - 1];

  // Emit the new message to all connected clients via SSE
  sendSSEMessage(req.params.workspaceId, {
    type: 'NEW_MESSAGE',
    payload: populatedMessage,
  });

  res.status(201).json(populatedMessage);
});



// Export all controller functions
export {
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
  listWorkspaces,
  addListToWorkspace,
  addTaskToList,
  editTaskInList,
  updateListInWorkspace,
  reorderLists,
  deleteListFromWorkspace,
  updateTaskInList,
  deleteTaskFromList,
  updateListColor,
  getWorkspaceUpdates,
  clients,
  getMessages,
  sendMessage,
  sendSSEMessage,
};
