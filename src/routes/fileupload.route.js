const express = require("express");
const { uploadFileMultiple, uploadFileSingle, uploadMultiple, uploadSingle } = require("../controllers/fileupload.controller");

const fileUploadRouter = express.Router();

fileUploadRouter.post("/upload-single", uploadSingle, uploadFileSingle);
fileUploadRouter.post("/upload-multiple", uploadMultiple, uploadFileMultiple);

module.exports = fileUploadRouter
