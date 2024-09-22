// models/userModel.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate verification code
userSchema.methods.generateVerificationCode = function () {
  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = code;
  // Set expiration time (e.g., 10 minutes)
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
  return code;
};

const User = mongoose.model('User', userSchema);

export default User;
