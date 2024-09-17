import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
   const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '3d'
   });

   res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', //to set secure cookie on production
      sameSite: "strict", // prevent CSRF attacks
      maxAge: 3 * 24 * 60 * 60 * 1000 // 03 days
   })
};

export default generateToken;