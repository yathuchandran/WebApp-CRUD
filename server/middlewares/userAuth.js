import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const checkIsUserAuthenticated = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(' ')[1];
      const { userID } = jwt.verify(token, "pleaseSubscribe"); 
      req.user = await userModel.findById(userID).select("--password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized User" });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized User" });
  }
}
export default checkIsUserAuthenticated;