import userModel from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from "fs";

const directoryPath = 'public/'; 
const adminEmail = "admnloger123@gmail.com";
const adminPassword ="spqfdjpvzkfalhko" ;

class userController{
  static userRegistration = async (req, res) => {
    const { name, email, password } = req.body; 
    try {
      if (name && email && password) {
        const isUser = await userModel.findOne({ email: email }); 
        if (isUser) {
          return res.status(400).json({ message: "User is already Exist" });
        } else {
          //password hashing
          const hashPassword = await bcryptjs.hash(password, 10);
          //save user
          const newUser = userModel({
            name: name,
            email: email,
            password: hashPassword
          });

          const resUser = await newUser.save(); 
          if (resUser) {            
            return res.status(201).json({ message: "Registered Successfully", user: resUser });
          }
        }
      } else {
        return res.status(400).json({ message: "All Fields are Required" });
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  static userLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
      if (email && password) {
        const isUser = await userModel.findOne({ email: email });
        if (isUser) {
          if (email === isUser.email && (await bcryptjs.compare(password, isUser.password))) {
            //Generate token
            const token = jwt.sign({ userID: isUser._id }, "pleaseSubscribe", { expiresIn: "2d" }); 

            return res.status(200).json({ message: "Login Successfully", token, name:isUser.name, 
             email:isUser.email});
          } else {
            return res.status(400).json({ message: "Invalid Credentials" });
          }
        } else {
          return res.status(400).json({ message: "User is not Registered" });
        }
      } else {
        return res.status(400).json({ message: "All fields are Required" });
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  static changePassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    try {
      if (newPassword && confirmPassword) {
        if (newPassword === confirmPassword) {
          const hashPassword = await bcryptjs.hash(newPassword, 10);
          await userModel.findByIdAndUpdate(req.user._id, { password: hashPassword });
          return res.status(200).json({ message: "Password changed successfully" });
        } else {
          return res.status(400).json({ message: "Passwords do not match" });
        }
      } else {
        return res.status(400).json({ message: "All fields are requried" });
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  static forgotPassword = async (req, res) => {
    const { email } = req.body; 
    try {
      if (email) {
        const isUser = await userModel.findOne({ email: email }); 
        if (isUser) {
          //Generate token
          const secretKey = isUser._id + "subscribe"; 
          const token = jwt.sign({ userID: isUser._id }, secretKey, { expiresIn: "5m" });            
          const link = `http://localhost:3000/user/reset/${isUser._id}/${token}`;
          const transport = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            auth: {
              user:adminEmail,
              pass:adminPassword
            },
          });
          const mailOptions = {
            from: adminEmail,
            to: email,
            subject: 'Password Reset Request',
            html:`<p>Hi ${isUser.name} please Click here to <a href=${link}>Reset your password</a></p>`
          };

          transport.sendMail(mailOptions, function (error, info) {
            if (error) {
               console.log(error);
            } else {              
               console.log("Email has been sent: ",info.response);           
            }
          });
          return res.status(200).json({ message: "Email has been sent" }); 
          
        } else {
          return res.status(400).json({ message: "User is not found" });
        }
      } else {
        return res.status(400).json({ message: "Email is required" });
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  static resetPassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const { id, token } = req.params;
    try {
      if (newPassword && confirmPassword && id && token) {
        if (newPassword === confirmPassword) {
          //token verifying
          const isUser = await userModel.findById(id);
          const secretKey = isUser._id + "subscribe";
          const isValid = await jwt.verify(token, secretKey);
          if (isValid) {
            const hashPassword = await bcryptjs.hash(newPassword, 10);
            const isSuccess = await userModel.findByIdAndUpdate(isUser._id, {
              $set: {
                password: hashPassword
              }
            });
            if (isSuccess) {              
              return res.status(200).json({ message: "Password changed successfully" });
            }
          } else {
            return res.status(400).json({ message: "Link has been expired" });
          }
        } else {
          return res.status(400).json({ message: "Passwords do not match" });
        }
      } else {
        return res.status(400).json({ message: "All fields are Required" });
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static uploadImage = async (req, res) => {
    const { token } = req.params; 
    try {
      const decoded = jwt.verify(token, "pleaseSubscribe"); 
      const isUser = await userModel.findOne({ _id: decoded.userID }); 
      const oldImage = isUser.image; 
      if (oldImage) { 
        fs.unlink(directoryPath + oldImage, async (err) => {
          if (err) {
            throw err;
          }
        }); 
        const remove = await userModel.updateOne({ _id: decoded.userID }, {
          $unset: { image: "" }
        }); 
      }
      const update = await userModel.updateOne({ _id: decoded.userID }, {
        $set: {
          image: req.files.image[0].filename
        }
      }); 
      const image = `http://localhost:9000/${req.files.image[0].filename}`;            
      return res.status(200).json({ message: 'User is Found', image });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static removeImage = async (req, res) => {
    const { token } = req.params; 
    try {
      const decoded = jwt.verify(token, "pleaseSubscribe"); 
      const isUser = await userModel.findOne({ _id: decoded.userID }); 
      const oldImage = isUser.image; 
      if (oldImage) { 
        fs.unlink(directoryPath + oldImage, async (err) => {
          if (err) {
            throw err;
          }
        }); 
        const update = await userModel.updateOne({ _id: decoded.userID }, {
          $unset: { image: "" }
        }); 
      }
      const image = `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`;
      return res.status(200).json({ message: "user found", image });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static verifyToken = async (req, res) => {
    const token = req.body.token; 
    const decoded = jwt.verify(token, "pleaseSubscribe");     
    try {
      const user = await userModel.findOne({ _id: decoded.userID }); 
      if (user.image) {
        user.image = `http://localhost:9000/${user.image}`;
      } else {
        user.image = `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`;
      }
      return res.status(200).json({ message: "Token is valid", user });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
export default userController;

///dfndjthohvorh4ohvdvsfwtbbdkwjgwrgjhtohwrh4y49ryadfdzc,mvcndkgbklbfdskfsdlfn''g