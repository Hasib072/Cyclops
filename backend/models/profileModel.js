// backend/models/profileModel.js

import mongoose from 'mongoose';

const profileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Ensures one profile per user
    },
    companyName: {
      type: String,
      default: '',
    },
    jobRole: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    gitHubLink: {
      type: String,
      default: '',
    },
    linkedInLink: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String, // URL or path to the image
      default: '',
    },
    profileBanner: {
      type: String, // URL or path to the banner
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
