const express = require("express");
const multer = require("multer");
const documentController = require("../controllers/documentController");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Stores uploads in 'uploads/' folder

router.post(
  "/upload",
  upload.single("document"),
  documentController.processDocument
);

module.exports = router;
