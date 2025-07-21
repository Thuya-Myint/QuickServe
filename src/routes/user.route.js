const express = require("express");
const { verifyToken } = require("../helper/authJWT");
const { registerUserSchema, loginUserSchema, updateUserSchema } = require('../validators/user.validator');
const { registerUser, updateUser, loginUser, getUsers, deleteUser } = require('../controllers/user.controller');

const userRouter = express.Router();

// Use validateRequest() with each schema
userRouter.post("/register", registerUserSchema, registerUser);
userRouter.post("/login", loginUserSchema, loginUser);
userRouter.post("/update-user", verifyToken, updateUserSchema, updateUser);

module.exports = userRouter;
