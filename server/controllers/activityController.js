import User from "../models/User.js";

// @desc    Add new farming activity
// @route   POST /api/activities
// @access  Private
export const addActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const activity = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { farmingActivities: activity } },
      { new: true, runValidators: true }
    ).select("farmingActivities");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const newActivity = user.farmingActivities.slice(-1)[0];

    res.status(201).json({
      success: true,
      activity: newActivity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add activity",
      error: error.message,
    });
  }
};

// @desc    Get all farming activities
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req, res) => {
  try {
    const userId = req.user._id;
    const { crop, activityType, startDate, endDate } = req.query;

    let query = { _id: userId };
    let activityQuery = {};

    if (crop) activityQuery.crop = crop;
    if (activityType) activityQuery.activityType = activityType;
    if (startDate || endDate) {
      activityQuery.date = {};
      if (startDate) activityQuery.date.$gte = new Date(startDate);
      if (endDate) activityQuery.date.$lte = new Date(endDate);
    }

    const user = await User.findOne(query, {
      farmingActivities: { $elemMatch: activityQuery },
    }).select("farmingActivities");

    res.json({
      success: true,
      count: user.farmingActivities.length,
      activities: user.farmingActivities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
      error: error.message,
    });
  }
};

// @desc    Update a farming activity
// @route   PUT /api/activities/:id
// @access  Private
export const updateActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const activityId = req.params.id;
    const updates = req.body;

    const user = await User.findOneAndUpdate(
      { _id: userId, "farmingActivities._id": activityId },
      { $set: { "farmingActivities.$": updates } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    const updatedActivity = user.farmingActivities.id(activityId);

    res.json({
      success: true,
      activity: updatedActivity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update activity",
      error: error.message,
    });
  }
};

// @desc    Delete a farming activity
// @route   DELETE /api/activities/:id
// @access  Private
export const deleteActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const activityId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { farmingActivities: { _id: activityId } } },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete activity",
      error: error.message,
    });
  }
};
