import express from "express";
import {
  getCropPrediction,
  getUserRecommendations,
  getRecommendationById,
  deleteRecommendation,
} from "../controllers/cropSuggestionsController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// Main prediction endpoint (POST)
router.post("/", authenticate, getCropPrediction);

// Recommendation history (GET)
router.get("/history", authenticate, getUserRecommendations);

// Single recommendation (GET)
router.get("/:id", authenticate, getRecommendationById);

// Delete recommendation (DELETE)
router.delete("/:id", authenticate, deleteRecommendation);

export default router;
