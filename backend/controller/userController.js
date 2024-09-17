import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

//  @desc   Auth user/set token
//  route   POST /api/users/auth
//  @access Public
const authUser = asyncHandler(async (req, res) => {
   const { email, password } = req.body;

   const user = await User.findOne({ email });

   if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id)
      res.status(201).json({
         _id: user._id,
         name: user.name,
         email: user.email
      });
   } else {
      res.status(400);
      throw new Error('Invalid User Data')
   }
});

//  @desc   Register a new user
//  route   POST /api/users
//  @access Public
const registerUser = asyncHandler(async (req, res) => {
   const { name, email, password } = req.body;

   const userExist = await User.findOne({ email: email });

   if (userExist) {
      res.status(400);
      throw new Error('User already exist');
   }

   const createUser = await User.create({
      name,
      email,
      password
   });

   if (createUser) {
      generateToken(res, createUser._id)
      res.status(201).json({
         _id: createUser._id,
         name: createUser.name,
         email: createUser.email
      });
   } else {
      res.status(400);
      throw new Error('Invalid User Data')
   }
});

//  @desc   Logout user
//  route   POST /api/users
//  @access Public
const logoutUser = asyncHandler(async (req, res) => {
   res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0)
   })
   res.status(200).json({ message: 'User Logged Out' });
});

//  @desc   Get user profile
//  route   GET /api/users/profile
//  @access Private
const getUserProfile = asyncHandler(async (req, res) => {
   const user = await User.findById(req.user._id);

   if (user) {
      res.json({
         _id: user._id,
         name: user.name,
         email: user.email,
      });
   } else {
      res.status(404);
      throw new Error('User not found');
   }
});

//  @desc   Update user profile
//  route   PUT /api/users/profile
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
   updateUserProfile
}