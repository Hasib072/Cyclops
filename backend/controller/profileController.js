// backend/controller/profileController.js

import asyncHandler from 'express-async-handler';
import Profile from '../models/profileModel.js';
import User from '../models/userModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads')); // Ensure this path exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Multer Upload Middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg, .gif and .jpeg formats are allowed!'));
  }
}).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'profileBanner', maxCount: 1 }
]);

// @desc    Get current user's profile
// @route   GET /api/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id }).populate('user', 'name email');

  if (profile) {
    res.json(profile);
  } else {
    res.status(404);
    throw new Error('Profile not found');
  }
});

// @desc    Update current user's profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      res.status(400);
      throw new Error(err.message);
    } else if (err) {
      res.status(400);
      throw new Error(err.message);
    }

    const profile = await Profile.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    if (profile && user) {
      // Update Profile fields
      profile.companyName = req.body.companyName || profile.companyName;
      profile.jobRole = req.body.jobRole || profile.jobRole;
      profile.city = req.body.city || profile.city;
      profile.country = req.body.country || profile.country;
      profile.gitHubLink = req.body.gitHubLink || profile.gitHubLink;
      profile.linkedInLink = req.body.linkedInLink || profile.linkedInLink;

      // Update User fields
      user.name = req.body.name || user.name;

      // Handle Profile Image Upload
      if (req.files['profileImage']) {
        const profileImage = req.files['profileImage'][0];
        
        // Optionally, delete the old image if it exists
        if (profile.profileImage) {
          fs.unlink(path.join(__dirname, '..', '..', profile.profileImage), (err) => {
            if (err) console.error('Error deleting old profile image:', err);
          });
        }
        profile.profileImage = `uploads/${profileImage.filename}`; // Store the relative path
      }

      // Handle Profile Banner Upload
      if (req.files['profileBanner']) {
        const profileBanner = req.files['profileBanner'][0];
        
        // Optionally, delete the old banner if it exists
        if (profile.profileBanner) {
          fs.unlink(path.join(__dirname, '..', '..', profile.profileBanner), (err) => {
            if (err) console.error('Error deleting old profile banner:', err);
          });
        }
        profile.profileBanner = `uploads/${profileBanner.filename}`; // Store the relative path
      }

      // Save both Profile and User
      const updatedProfile = await profile.save();
      const updatedUser = await user.save();

      // Respond with updated data
      res.json({
        ...updatedProfile.toObject(),
        user: {
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });
    } else {
      res.status(404);
      throw new Error('Profile or User not found');
    }
  });
});

export { getProfile, updateProfile };
