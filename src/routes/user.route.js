const express = require("express");
const { verifyToken } = require("../helper/authJWT");
const validate = require('../middleware')
const { registerUserSchema, loginUserSchema, updateUserSchema } = require('../validators/user.validator')
const { registerUser, updateUser, loginUser, getUsers, deleteUser } = require('../controllers/user.controller')

const userRouter = express.Router();
userRouter.post("/register", registerUserSchema, registerUser)
userRouter.post("/login", loginUserSchema, loginUser)
userRouter.post("/update-user", verifyToken, updateUserSchema, updateUser)



module.exports = userRouter;
