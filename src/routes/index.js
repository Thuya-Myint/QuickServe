const express = require("express");
const router = express.Router();
const userRoutes = require("./user.route");
const { validateRequest } = require("../middleware")



router.use("/user", userRoutes);
router.use(validateRequest)

module.exports = router