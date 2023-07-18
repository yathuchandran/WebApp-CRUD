import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const adminEmail = "admin@gmail.com";
const adminPassword = "admin123";

class adminController{
  static adminLogin = async (req, res) => {
    const { email, password } = req.body;
    const adminData = {
      email: adminEmail,
      password: adminPassword
    };
    try {
      if (email && password) {
        if (email === adminData.email && password === adminData.password) {
          const adminToken = jwt.sign({ userName: adminData.email }, "adminPanel", { expiresIn: "2d" });
          return res.status(200).json({ message: "Login successfully", adminToken });
        } else {
          return res.status(400).json({ message: "Invalid Credentials" });
        }
      } else {
        return res.status(400).json({ message: "All fields are required" });
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static usersList = async (req, res) => {
    const users = await userModel.find().select("-password"); 
    try {
      if (!users) {
        return res.status(400).json({ message: "Users are not found" });
      }
      return res.status(200).json({ message: "Success", users });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static getUserData = async (req, res) => {
    const { id } = req.params;  
    const user = await userModel.findOne({ _id: id }).select("-password");
    try {
      if (!user) {
        return res.status(400).json({ message: "User is not found" });
      }
      return res.status(200).json({ message: "Success", user });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static editUser = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body; 
    try {
      const updatedUser = await userModel.findOneAndUpdate({ _id: id }, {
        $set: {
          name: name,
          email: email
        }
      });
      return res.status(200).json({ message: "User data is updated successfully", updatedUser });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static searchUser = async (req, res) => {
    const { key } = req.params;
    try {
      const users = await userModel.find({
        $or: [
          {
            name: { $regex: key }
          },
          {
            email: { $regex: key }
          }
        ]
      });
      return res.status(200).json({ message: "Success", users });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static deleteUser = async (req, res) => {
    const { id } = req.params;    
    try {
      const deleteUser = await userModel.deleteOne({ _id: id }); 
      return res.status(200).json({ message: "Successfully Deleted" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

}
export default adminController;