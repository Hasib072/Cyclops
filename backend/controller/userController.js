// controller/userController.js
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import Profile from '../models/profileModel.js';
import generateProfileImage from '../utils/imageGenerator.js';


// @desc   Auth user/set token
// @route  POST /api/users/auth
// @access Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      res.status(401);
      throw new Error('Email not verified');
    }

    // Generate token without setting it in cookies
    const token = generateToken(user._id); // Adjusted generateToken to return token

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      token, // Include the token in the response body
    });
  } else {
    res.status(400);
    throw new Error('Invalid email or password');
  }
});


// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  // Check if user already exists
  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create new user instance
  const user = new User({
    name,
    email,
    password,
  });

  // Save user to the database
  const savedUser = await user.save();

  // Generate default profile image
  const defaultProfileImagePath = await generateProfileImage(savedUser.name);

  // Create a profile for the user with the default profile image
  const profile = new Profile({
    user: savedUser._id,
    profileImage: defaultProfileImagePath, // Set the generated profile image
  });

  // Save the profile to the database
  await profile.save();

  // Optionally, generate a verification code and send email
  // const verificationCode = user.generateVerificationCode();
  // await user.save();
  // await sendVerificationEmail(user.email, verificationCode);

  // Respond with success
  res.status(201).json({
    message: 'User registered successfully. Please verify your email.',
  });
});

// @desc    Verify user's email
// @route   POST /api/users/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
   const { email, code } = req.body;
 
   // Find user by email
   const user = await User.findOne({ email });
 
   if (!user) {
     res.status(400);
     throw new Error('Invalid email');
   }
 
   if (user.isVerified) {
     res.status(400);
     throw new Error('User already verified');
   }
 
   // Check if verification code is valid and not expired
   if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
     res.status(400);
     throw new Error('Invalid or expired verification code');
   }
 
   // Update user's verification status
   user.isVerified = true;
   user.verificationCode = undefined;
   user.verificationCodeExpires = undefined;
 
   await user.save();
 
   // Optionally, generate a token upon successful verification
   generateToken(res, user._id);
 
   res.json({
     message: 'Email verified successfully',
     user: {
       _id: user._id,
       name: user.name,
       email: user.email,
       isVerified: user.isVerified,
     },
   });
 });

// Similarly, remove email sending from resendVerificationCode
const resendVerificationCode = asyncHandler(async (req, res) => {
   const { email } = req.body;
 
   // Find user by email
   const user = await User.findOne({ email });
 
   if (!user) {
     res.status(400);
     throw new Error('Invalid email');
   }
 
   if (user.isVerified) {
     res.status(400);
     throw new Error('User already verified');
   }
 
   // Generate new verification code
   const verificationCode = user.generateVerificationCode();
 
   // Save updated user to the database
   await user.save();
 
   // Prepare email details (to be handled on frontend)
   const subject = 'Email Verification';
   const text = `Your new verification code is: ${verificationCode}`;
 
   // **Remove or comment out the backend email sending**
   /*
   try {
     // Resend verification email via EmailJS
     await sendEmail(user.email, subject, user.name, verificationCode);
     res.json({
       message: 'Verification code resent to email.',
     });
   } catch (error) {
     console.error('Error in resendVerificationCode:', error);
     res.status(500);
     throw new Error('Email could not be sent');
   }
   */
 
   // Instead, respond with success
   res.json({
     message: 'Verification code resent. Please check your email.',
   });
 });

//  @desc   Logout user
//  @route   POST /api/users/logout
//  @access Public
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'User Logged Out' });
});

//  @desc   Get user profile
//  @route   GET /api/users/profile
//  @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

//  @desc   Update user profile
//  @route   PUT /api/users/profile
//  @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isVerified: updatedUser.isVerified,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  resendVerificationCode,
};
