// backend/models/mindMapModel.js

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Define the Node Schema
const nodeSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
  },
  label: {
    type: String,
    required: [true, 'Node label is required'],
    trim: true,
    maxlength: [100, 'Node label cannot exceed 100 characters'],
  },
  color: {
    type: String,
    default: '#ffffff',
    validate: {
      validator: function (v) {
        return /^#([0-9A-F]{3}){1,2}$/i.test(v);
      },
      message: (props) => `${props.value} is not a valid HEX color code!`,
    },
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
});

// Define the Edge Schema
const edgeSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
  },
  source: {
    type: String,
    required: [true, 'Source node ID is required'],
  },
  target: {
    type: String,
    required: [true, 'Target node ID is required'],
  },
});

// Define the MindMap Schema
const mindMapSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    nodes: [nodeSchema],
    edges: [edgeSchema],
  },
  {
    timestamps: true,
  }
);

const MindMap = mongoose.model('MindMap', mindMapSchema);

export default MindMap;
