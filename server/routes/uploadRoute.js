import express from "express";
import upload from "../utils/upload.js";

const router = express.Router();

router.post("/upload", upload.single("file"), (req, res) => {
  res.json({ fileUrl: req.file.path }); // Cloudinary URL
});

export default router;
