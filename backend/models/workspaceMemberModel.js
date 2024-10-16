// models/workspaceMemberModel.js

import mongoose from 'mongoose';

// Define the Workspace Member Schema
const workspaceMemberSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace', // References the Workspace model
      required: [true, 'Workspace reference is required'],
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // References the User model
          required: [true, 'User reference is required'],
        },
        role: {
          type: String,
          enum: ['admin', 'member'], // Define roles as needed
          default: 'member',
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Ensure a workspace has unique members (prevent duplicate user entries)
workspaceMemberSchema.index(
  { workspace: 1, 'members.user': 1 },
  { unique: true }
);

// Export the WorkspaceMember model
const WorkspaceMember = mongoose.model('WorkspaceMember', workspaceMemberSchema);

export default WorkspaceMember;
