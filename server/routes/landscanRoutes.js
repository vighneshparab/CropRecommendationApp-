// routes/landScanRoutes.js
import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import { scanLand } from "../controllers/landScanController.js";

const router = express.Router();

router.get("/scan", authenticate, scanLand);

export default router;
