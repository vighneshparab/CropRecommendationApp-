import User from "../models/User.js";
import CommunityPost from "../models/Post.js";
import UserRecommendation from "../models/UserRecommendation.js";

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({}, "-password -otp -otpExpiration")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      count: users.length,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// @desc    Update user role/status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const userId = req.params.id;

    // Prevent modifying own admin status
    if (userId.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Cannot modify your own admin status",
      });
    }

    const updates = {};
    if (role) updates["credentials.role"] = role;
    if (typeof isActive === "boolean")
      updates["accountStatus.isActive"] = isActive;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, select: "-password -otp -otpExpiration" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// @desc    Get all posts with filters
// @route   GET /api/admin/posts
// @access  Private (Admin)
export const getAllPosts = async (req, res) => {
  try {
    const { status, userId, category } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.isClosed = status === "closed";
    if (userId) query.userId = userId;
    if (category) query.category = category;

    const posts = await CommunityPost.find(query)
      .populate("userId", "credentials.name profile.picture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// @desc    Update post status (close/pin)
// @route   PUT /api/admin/posts/:id
// @access  Private (Admin)
export const updatePost = async (req, res) => {
  try {
    const { isClosed, isPinned } = req.body;

    const updates = {};
    if (typeof isClosed === "boolean") updates.isClosed = isClosed;
    if (typeof isPinned === "boolean") updates.isPinned = isPinned;

    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate("userId", "credentials.name profile.picture");

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
      message: "Failed to update post",
      error: error.message,
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/admin/posts/:id
// @access  Private (Admin)
export const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

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

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getSystemStats = async (req, res) => {
  try {
    const [users, posts, recommendations] = await Promise.all([
      User.countDocuments(),
      CommunityPost.countDocuments(),
      UserRecommendation.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers: users,
        activeUsers: await User.countDocuments({
          "accountStatus.isActive": true,
        }),
        totalPosts: posts,
        closedPosts: await CommunityPost.countDocuments({ isClosed: true }),
        totalRecommendations: recommendations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch system stats",
      error: error.message,
    });
  }
};

// @desc    Get flagged/reported content
// @route   GET /api/admin/flagged
// @access  Private (Admin)
export const getFlaggedContent = async (req, res) => {
  try {
    // Implement your flagging/reporting logic here
    // This is a placeholder for actual flagging system
    const flaggedPosts = await CommunityPost.find({ reportCount: { $gt: 0 } })
      .sort({ reportCount: -1 })
      .limit(10)
      .populate("userId", "credentials.name");

    res.json({
      success: true,
      flaggedPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch flagged content",
      error: error.message,
    });
  }
};
