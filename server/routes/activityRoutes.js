// routes/activityRoutes.js
import express from "express";
import {
  addActivity,
  getActivities,
  updateActivity,
  deleteActivity,
} from "../controllers/activityController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(authenticate, addActivity)
  .get(authenticate, getActivities);

router
  .route("/:id")
  .put(authenticate, updateActivity)
  .delete(authenticate, deleteActivity);

export default router;
