import express from "express";
import {
  registerUser,
  loginUser,
  requestPasswordUpdateOTP,
  googleLogin,
  updatePassword,
  updateProfile,
  uploadProfilePicture,
  getUserProfile,
} from "../controllers/userController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// Define your routes here
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/request-password-update", requestPasswordUpdateOTP);
router.post("/update-password", updatePassword);
router.put("/update-profile", authenticate, updateProfile);
router.post("/google-login", googleLogin);
router.post("/upload-profile-picture", authenticate, uploadProfilePicture);
router.get("/profile", authenticate, getUserProfile);

// Export the router as the default export
export default router;
