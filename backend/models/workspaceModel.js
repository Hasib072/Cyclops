// backend/models/workspaceModel.js

import mongoose from 'mongoose';

// Define the Stage Subdocument Schema
const stageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, 'Stage ID is required'],
      //unique: true, // Ensures each stage has a unique ID
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
        values: ['Not Started', 'Active', 'Done', 'Pending'], // Extend as needed
        message: '{VALUE} is not a valid category',
      },
    },
  },
  {
    _id: false, // Prevents creation of an automatic _id for subdocuments
  }
);

// Define the Workspace Schema
const workspaceSchema = new mongoose.Schema(
  {
    workspaceTitle: {
      type: String,
      required: [true, 'Workspace title is required'],
      trim: true,
      maxlength: [100, 'Workspace title cannot exceed 100 characters'],
      // unique: true, // Removed to enforce uniqueness per user via compound index
    },
    coverImage: {
      type: String, // URL or file path to the cover image
      required: false, // Made optional
      // trim: true,
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
        values: ['Starter', 'Kanban', 'Project', 'Scrum'], // Extend as needed
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