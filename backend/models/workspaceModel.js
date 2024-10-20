// backend/models/workspaceModel.js

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Define the Task Subdocument Schema
const taskSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    name: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
      maxlength: [100, 'Task name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Task description cannot exceed 500 characters'],
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: ['High', 'Moderate', 'Low'],
      default: 'Low',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming you have a User model
    },
    creationTime: {
      type: Date,
      default: Date.now,
    },
    stageId: {
      type: String,
      required: [true, 'Stage ID is required'],
    },
  },
  {
    _id: false, // Prevents automatic _id generation as we're using a custom _id
  }
);

// Define the List Subdocument Schema
const listSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    name: {
      type: String,
      required: [true, 'List name is required'],
      trim: true,
      maxlength: [100, 'List name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'List description cannot exceed 500 characters'],
    },
    color: {
      type: String,
      required: true,
      default: '#9fa2ff', // Default color value
      trim: true,
      validate: {
        validator: function (v) {
          // Validates HEX color codes
          return /^#([0-9A-F]{3}){1,2}$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid HEX color code!`,
      },
    },
    tasks: [taskSchema], // Embedding Task subdocuments
  },
  {
    // _id: false, // Remove this line
  }
);

// Define the Stage Subdocument Schema
const stageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, 'Stage ID is required'],
      //unique: true,
    },
    name: {
      type: String,
      required: [true, 'Stage name is required'],
      trim: true,
      maxlength: [100, 'Stage name cannot exceed 100 characters'],
    },
    color: {
      type: String,
      required: [true, 'Stage color is required'],
      trim: true,
      validate: {
        validator: function (v) {
          // Validates HEX color codes
          return /^#([0-9A-F]{3}){1,2}$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid HEX color code!`,
      },
    },
    category: {
      type: String,
      required: [true, 'Stage category is required'],
      enum: {
        values: ['Not Started', 'Active', 'Done', 'Pending'],
        message: '{VALUE} is not a valid category',
      },
    },
  },
  {
    _id: false, // Prevents automatic _id generation for subdocuments
  }
);

// Define the Message Subdocument Schema
const messageSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User model
      required: [true, 'Sender is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [1000, 'Message content cannot exceed 1000 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false, // Prevents automatic _id generation for subdocuments
  }
);

// Define the Workspace Schema with Embedded Lists, Tasks, and Messages
const workspaceSchema = new mongoose.Schema(
  {
    workspaceTitle: {
      type: String,
      required: [true, 'Workspace title is required'],
      trim: true,
      maxlength: [100, 'Workspace title cannot exceed 100 characters'],
    },
    coverImage: {
      type: String, // URL or file path to the cover image
      required: false, // Made optional
    },
    workspaceDescription: {
      type: String,
      required: false, // Made optional
      trim: true,
      maxlength: [500, 'Workspace description cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User model
      required: [true, 'Creator is required'],
    },
    creationDateTime: {
      type: Date,
      default: Date.now, // Automatically sets to current date and time
    },
    workspaceType: {
      type: String,
      required: [true, 'Workspace type is required'],
      enum: {
        values: ['Starter', 'Kanban', 'Project', 'Scrum'],
        message: '{VALUE} is not a valid workspace type',
      },
    },
    selectedViews: {
      type: [String],
      required: [true, 'At least one view must be selected'],
      validate: {
        validator: function (v) {
          // Ensures at least one view is selected
          return v.length > 0;
        },
        message: 'At least one view must be selected',
      },
    },
    invitePeople: {
      type: [String],
      required: false, // Made optional; can have zero or more invitees
      validate: {
        validator: function (v) {
          // Validates each email in the array
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return v.every((email) => emailRegex.test(email));
        },
        message: 'One or more email addresses are invalid',
      },
    },
    stages: {
      type: [stageSchema], // Array of Stage subdocuments
      required: [true, 'At least one stage is required'],
      validate: {
        validator: function (v) {
          // Ensures there are no duplicate stage names within the workspace
          const stageNames = v.map((stage) => stage.name.toLowerCase());
          return stageNames.length === new Set(stageNames).size;
        },
        message: 'Stage names must be unique within the workspace',
      },
    },
    lists: [listSchema], // Embedding List subdocuments
    messages: [messageSchema], // Embedding Message subdocuments
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Compound index to enforce uniqueness of workspace titles per user
workspaceSchema.index({ workspaceTitle: 1, createdBy: 1 }, { unique: true });

// Optional: Add a text index for searching
workspaceSchema.index({ workspaceTitle: 'text', workspaceDescription: 'text' });

// Export the Workspace model
const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;
