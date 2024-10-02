// controller/profileController.js

import asyncHandler from 'express-async-handler';
import Profile from '../models/profileModel.js';

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

  if (profile) {
    // Update fields
    profile.companyName = req.body.companyName || profile.companyName;
    profile.jobRole = req.body.jobRole || profile.jobRole;
    profile.city = req.body.city || profile.city;
    profile.country = req.body.country || profile.country;
    profile.gitHubLink = req.body.gitHubLink || profile.gitHubLink;
    profile.linkedInLink = req.body.linkedInLink || profile.linkedInLink;

    // Handle image uploads if you plan to implement that later

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } else {
    res.status(404);
    throw new Error('Profile not found');
  }
});

export { getProfile, updateProfile };
