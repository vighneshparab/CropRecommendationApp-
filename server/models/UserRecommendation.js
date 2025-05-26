import mongoose from "mongoose";

const userRecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recommendations: [
    {
      cropName: {
        type: String,
        required: true,
      },
      factorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RecommendationFactor",
        default: null,
      },
      matchedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserRecommendation = mongoose.model(
  "UserRecommendation",
  userRecommendationSchema
);

export default UserRecommendation;
