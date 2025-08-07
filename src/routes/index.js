const express = require("express");
const router = express.Router();
const userRoutes = require("./user.route");
const { validateRequest } = require("../middleware")
const fileUploadRoutes = require("./fileupload.route")


router.use("/user", userRoutes);
router.use("/file-upload", fileUploadRoutes);
router.use(validateRequest)

module.exports = router