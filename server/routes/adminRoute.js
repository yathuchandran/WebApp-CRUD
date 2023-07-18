import express from "express";
import adminController from "../controllers/adminController.js";

const adminRoute = express.Router();

adminRoute.post('/admin/login', adminController.adminLogin);
adminRoute.get('/admin/users', adminController.usersList);
adminRoute.get('/admin/getUser/:id', adminController.getUserData);
adminRoute.put('/admin/edit-user/:id', adminController.editUser);
adminRoute.get('/admin/search-user/:key', adminController.searchUser);
adminRoute.delete('/admin/delete-user/:id', adminController.deleteUser);


export default adminRoute;