// controller/userController.js
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';
import generateToken from '../utils/generateToken.js';

//  @desc   Auth user/set token
//  @route   POST /api/users/auth
//  @access Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      res.status(401);
      throw new Error('Email not verified');
    }

    generateToken(res, user._id);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    });
  } else {
    res.status(400);
    throw new Error('Invalid email or password');
  }
});

//  @desc   Register a new user
//  @route   POST /api/users
//  @access Public
const registerUser = asyncHandler(async (req, res) => {
   const { name, email, password } = req.body;
 
   const userExist = await User.findOne({ email: email });
 
   if (userExist) {
     res.status(400);
     throw new Error('User already exists');
   }
 
   const user = new User({
     name,
     email,
     password,
   });
 
   // Generate verification code
   const verificationCode = user.generateVerificationCode();
 
   await user.save();
 
   // Send verification email
   const subject = 'Email Verification';
   const text = `Your verification code is: ${verificationCode}`;
 
   try {
     await sendEmail(user.email, subject, text);
     res.status(201).json({
       message: 'User registered successfully. Verification code sent to email.',
     });
   } catch (error) {
     console.error(error);
     res.status(500);
     throw new Error('Email could not be sent');
   }
 });

//  @desc   Verify user's email
//  @route   POST /api/users/verify-email
//  @access Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error('Invalid email');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('User already verified');
  }

  if (
    user.verificationCode !== code ||
    user.verificationCodeExpires < Date.now()
  ) {
    res.status(400);
    throw new Error('Invalid or expired verification code');
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;

  await user.save();

  generateToken(res, user._id); // Optionally log the user in after verification

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

//  @desc   Resend verification code
//  @route   POST /api/users/resend-verification
//  @access Public
const resendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

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
  await user.save();

  // Send verification email
  const subject = 'Email Verification';
  const text = `Your new verification code is: ${verificationCode}`;

  try {
    await sendEmail(user.email, subject, text);
    res.json({
      message: 'Verification code resent to email.',
    });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Email could not be sent');
  }
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
