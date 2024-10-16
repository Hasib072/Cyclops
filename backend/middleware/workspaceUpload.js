// backend/middleware/workspaceUpload.js

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Define __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure the uploads/workspaces directory exists
const workspaceUploadsDir = path.join(__dirname, '..', '..', 'uploads', 'workspaces');
if (!fs.existsSync(workspaceUploadsDir)) {
  fs.mkdirSync(workspaceUploadsDir, { recursive: true });
}

// Multer Storage Configuration for Workspaces
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, workspaceUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `workspace-${uniqueSuffix}${ext}`);
  },
});

// File Filter to Accept Only Images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only .png, .jpg and .jpeg formats are allowed!'));
};

// Initialize Multer for Workspaces
const workspaceUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

export default workspaceUpload;
