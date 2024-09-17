import express from "express";
import { ValidateJWT } from "../controller/authMiddleware.js";
import {
   authUser,
   registerUser,
   logoutUser,
   getUserProfile,
   updateUserProfile
} from "../controller/userController.js"; //add .js at last for es6 module type

const router = express.Router();

router.post('/', registerUser);
router.post('/auth', authUser);
router.post('/logout', logoutUser);
router.route('/profile')
   .get(ValidateJWT, getUserProfile) //add two methods GET & PUT on same api
   .put(ValidateJWT, updateUserProfile);

export default router;