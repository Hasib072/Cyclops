// controller/profileController.js

import asyncHandler from 'express-async-handler';
import Profile from '../models/profileModel.js';
import User from '../models/userModel.js';

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
    const profile = await Profile.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id); // Find the corresponding User
  
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
      // Optionally, update email if desired
      // user.email = req.body.email || user.email;
  
      // Handle image uploads if you plan to implement that later
  
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

export { getProfile, updateProfile };
