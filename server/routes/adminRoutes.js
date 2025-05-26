import express from "express";
import {
  getAllUsers,
  updateUser,
  getAllPosts,
  updatePost,
  deletePost,
  getSystemStats,
  getFlaggedContent,
} from "../controllers/adminController.js";
import authenticate, { authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply both middlewares to all admin routes
router.use(authenticate, authorizeAdmin);

// User Management Endpoints
router.route("/users").get(getAllUsers); // GET /api/admin/users

router.route("/users/:id").put(updateUser); // PUT /api/admin/users/:id

// Content Management Endpoints
router.route("/posts").get(getAllPosts); // GET /api/admin/posts

router
  .route("/posts/:id")
  .put(updatePost) // PUT /api/admin/posts/:id
  .delete(deletePost); // DELETE /api/admin/posts/:id

// System Administration Endpoints
router.route("/stats").get(getSystemStats); // GET /api/admin/stats

router.route("/flagged").get(getFlaggedContent); // GET /api/admin/flagged

export default router;
