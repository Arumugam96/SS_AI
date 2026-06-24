const express = require("express");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

router.post("/ask", upload.single("attachment"), async (req, res) => {
  try {
    const { user_id, prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        status: "error",
        message: "Prompt is required",
      });
    }

    const attachmentPath = req.file ? path.resolve(req.file.path) : null;

    const saveResponsePath = `C:\\scrap\\${Date.now()}_response.txt`;

    const appLayerResponse = await axios.post("http://localhost:8000/process", {
      user_id: user_id || "guest",
      prompt: prompt,
      attachment_path: attachmentPath,
      save_response_path: saveResponsePath,
    });

    return res.json({
      status: "success",
      response_text: appLayerResponse.data.response_text,
      saved_file_path: appLayerResponse.data.saved_file_path,
    });
  } catch (error) {
    console.error("Ask API Error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to connect App Layer API",
      details: error.message,
    });
  }
});

module.exports = router;