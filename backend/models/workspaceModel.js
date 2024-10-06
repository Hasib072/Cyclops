// backend/models/workspaceModel.js

import mongoose from 'mongoose';

// Define the Workspace Schema
const workspaceSchema = new mongoose.Schema(
  {
    workspaceTitle: {
      type: String,
      required: [true, 'Workspace title is required'],
      trim: true,
      maxlength: [100, 'Workspace title cannot exceed 100 characters'],
      unique: true, // Ensures workspace titles are unique
    },
    coverImage: {
      type: String, // URL or file path to the cover image
      required: false, // Made optional
      trim: true,
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
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Optional: Add a text index for searching
workspaceSchema.index({ workspaceTitle: 'text', workspaceDescription: 'text' });

// Export the Workspace model
const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;
