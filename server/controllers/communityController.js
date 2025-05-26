import CommunityPost from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";

// Helper function to process attachments
const processAttachments = async (files) => {
  return Promise.all(
    files.map(async (file) => {
      return {
        url: file.path,
        fileType: file.mimetype.split("/")[0] || "other",
        originalName: file.originalname || "file",
        size: file.size || 0,
        publicId: file.filename,
      };
    })
  );
};

// @desc    Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const userId = req.user._id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const processedTags =
      tags && typeof tags === "string"
        ? tags
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag)
        : [];

    const post = new CommunityPost({
      userId,
      title,
      content,
      category: category || "General",
      tags: processedTags,
    });

    if (req.files && Array.isArray(req.files)) {
      try {
        post.attachments = await processAttachments(req.files);
      } catch (uploadError) {
        console.error("Error processing attachments:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to process attachments",
          error: uploadError.message,
        });
      }
    }

    await post.save();
    await post.populate("userId", "credentials.name profile.picture");

    res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
};

// @desc    Get all posts with filters
export const getPosts = async (req, res) => {
  try {
    const { category, search, sortBy, userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    let sort = { createdAt: -1 };

    if (category) query.category = category;
    if (userId) query.userId = userId;
    if (search) query.$text = { $search: search };

    if (sortBy === "popular") {
      sort = { likeCount: -1, commentCount: -1 };
    } else if (sortBy === "oldest") {
      sort = { createdAt: 1 };
    }

    const posts = await CommunityPost.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("userId", "credentials.name profile.picture")
      .populate("likes", "credentials.name profile.picture");

    const totalPosts = await CommunityPost.countDocuments(query);

    res.json({
      success: true,
      count: posts.length,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};

// @desc    Get single post
export const getPost = async (req, res) => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate("userId", "credentials.name profile.picture")
      .populate("likes", "credentials.name profile.picture")
      .populate("comments.userId", "credentials.name profile.picture");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch post",
      error: error.message,
    });
  }
};

// @desc    Update a post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    const userId = req.user._id;

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this post",
      });
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (content) updateFields.content = content;
    if (category) updateFields.category = category;
    if (tags)
      updateFields.tags = tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase());

    if (req.files && req.files.length > 0) {
      try {
        const newAttachments = await processAttachments(req.files);
        updateFields.$push = { attachments: { $each: newAttachments } };
      } catch (uploadError) {
        console.error("Error processing attachments:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to process attachments",
          error: uploadError.message,
        });
      }
    }

    updateFields.$set = {
      isEdited: true,
      editedAt: new Date(),
      ...updateFields.$set,
    };

    updateFields.$push = {
      editHistory: {
        title: post.title,
        content: post.content,
        editedAt: new Date(),
      },
      ...updateFields.$push,
    };

    const updatedPost = await CommunityPost.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    res.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update post",
      error: error.message,
    });
  }
};

// @desc    Add comment to post
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;
    const userId = req.user._id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const comment = {
      userId,
      content,
    };

    if (req.files && req.files.length > 0) {
      try {
        comment.attachments = await processAttachments(req.files);
      } catch (uploadError) {
        console.error("Error processing comment attachments:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to process comment attachments",
          error: uploadError.message,
        });
      }
    }

    const post = await CommunityPost.findByIdAndUpdate(
      id,
      {
        $push: { comments: comment },
        $set: { lastActivityAt: new Date() },
      },
      { new: true }
    ).populate("comments.userId", "credentials.name profile.picture");

    res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

// @desc    Update a comment
export const updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this comment",
      });
    }

    comment.editHistory = comment.editHistory || [];
    comment.editHistory.push({
      content: comment.content,
      editedAt: new Date(),
    });

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    if (req.files && req.files.length > 0) {
      try {
        const newAttachments = await processAttachments(req.files);
        comment.attachments = [
          ...(comment.attachments || []),
          ...newAttachments,
        ];
      } catch (uploadError) {
        console.error("Error processing comment attachments:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to process comment attachments",
          error: uploadError.message,
        });
      }
    }

    post.lastActivityAt = new Date();
    await post.save();

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
      error: error.message,
    });
  }
};

// @desc    Delete an attachment
export const deleteAttachment = async (req, res) => {
  try {
    const { postId, attachmentId } = req.params;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this post",
      });
    }

    const attachment = post.attachments.find(
      (a) => a._id.toString() === attachmentId
    );

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    try {
      await cloudinary.uploader.destroy(attachment.publicId);
    } catch (error) {
      console.error(
        `Failed to delete attachment ${attachment.publicId}:`,
        error
      );
      return res.status(500).json({
        success: false,
        message: "Failed to delete attachment from Cloudinary",
        error: error.message,
      });
    }

    post.attachments = post.attachments.filter(
      (a) => a._id.toString() !== attachmentId
    );

    await post.save();

    res.json({
      success: true,
      message: "Attachment deleted successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete attachment",
      error: error.message,
    });
  }
};

// @desc    Like/unlike a post
export const toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const likeIndex = post.likes.findIndex(
      (id) => id.toString() === userId.toString()
    );

    let update;
    if (likeIndex === -1) {
      update = { $addToSet: { likes: userId } };
    } else {
      update = { $pull: { likes: userId } };
    }

    const updatedPost = await CommunityPost.findByIdAndUpdate(
      postId,
      {
        ...update,
        lastActivityAt: new Date(),
      },
      { new: true }
    );

    res.json({
      success: true,
      likeCount: updatedPost.likes.length,
      isLiked: likeIndex === -1,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like",
      error: error.message,
    });
  }
};

// @desc    Delete a post
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.credentials.role;

    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.userId.toString() !== userId.toString() && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    // Delete all attachments from Cloudinary
    if (post.attachments && post.attachments.length > 0) {
      await Promise.all(
        post.attachments.map(async (attachment) => {
          try {
            await cloudinary.uploader.destroy(attachment.publicId);
          } catch (error) {
            console.error(
              `Failed to delete attachment ${attachment.publicId}:`,
              error
            );
          }
        })
      );
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete post",
      error: error.message,
    });
  }
};

// @desc    Get user's posts
export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const posts = await CommunityPost.find({ userId })
      .populate("userId", "credentials.name profile.picture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await CommunityPost.countDocuments({ userId });

    res.status(200).json({
      success: true,
      posts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching user's posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user's posts",
      error: error.message,
    });
  }
};
