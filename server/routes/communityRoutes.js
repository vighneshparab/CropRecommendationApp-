import express from "express";
import {
  createPost,
  getPosts,
  getPost,
  addComment,
  updateComment,
  toggleLike,
  deletePost,
  getMyPosts,
  updatePost,
  deleteAttachment,
} from "../controllers/communityController.js";
import authenticate from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

// Post routes
router.route("/posts").post(authenticate, upload, createPost).get(getPosts);

router.route("/posts/mine").get(authenticate, getMyPosts);

router
  .route("/posts/:id")
  .get(getPost)
  .put(authenticate, upload, updatePost)
  .delete(authenticate, deletePost);

router.route("/posts/:id/like").put(authenticate, toggleLike);

router.route("/posts/:id/comments").post(authenticate, upload, addComment);

router
  .route("/posts/:postId/comments/:commentId")
  .put(authenticate, upload, updateComment);

router
  .route("/posts/:postId/attachments/:attachmentId")
  .delete(authenticate, deleteAttachment);

export default router;
