import express from "express";
import multer from "multer";
import userController from "../controllers/userController.js";
import checkIsUserAuthenticated from "../middlewares/userAuth.js";

const userRoute = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public');
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});
const uploadSingleImage = multer({ storage: storage }).fields([{ name: 'image', maxCount: 1 }]);

userRoute.post('/users/image-upload/:token', uploadSingleImage, userController.uploadImage);
userRoute.delete('/users/remove-image/:token', userController.removeImage);

// userRoute.post('/users/register', userController.userRegistration);
// userRoute.post('/users/login', userController.userLogin);
// userRoute.post('/users/forgot-password', userController.forgotPassword);
// userRoute.post('/users/forgot-password/:id/:token', userController.resetPassword);


userRoute.post('/users/register', userController.userRegistration);
userRoute.post('/users/login', userController.userLogin);
userRoute.post('/users/forgot-password', userController.forgotPassword);
userRoute.post('/users/forgot-password/:id/:token', userController.resetPassword);


userRoute.post('/users/verify-token', userController.verifyToken);
//protected Routes
userRoute.post('/users/change-password',checkIsUserAuthenticated, userController.changePassword);
export default userRoute;