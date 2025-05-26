import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ["image", "document", "video", "other"],
    },
    originalName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    editHistory: {
      type: [
        {
          content: String,
          editedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const communityPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "General",
        "Crop Help",
        "Soil Issues",
        "Weather Discussion",
        "Market Updates",
        "Pest Control",
        "Irrigation",
        "Equipment",
        "Success Stories",
      ],
      default: "General",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: true,
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: [30, "Tag cannot exceed 30 characters"],
        },
      ],
      default: [],
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    editHistory: {
      type: [
        {
          title: String,
          content: String,
          editedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

communityPostSchema.index(
  {
    title: "text",
    content: "text",
    tags: "text",
    "comments.content": "text",
  },
  {
    weights: {
      title: 5,
      tags: 4,
      content: 3,
      "comments.content": 1,
    },
    name: "post_search_index",
  }
);

// Safer virtual properties
communityPostSchema.virtual("commentCount").get(function () {
  return this.comments?.length || 0;
});

communityPostSchema.virtual("likeCount").get(function () {
  return this.likes?.length || 0;
});

communityPostSchema.virtual("attachmentCount").get(function () {
  const postAttachments = this.attachments?.length || 0;
  const commentAttachments = this.comments?.reduce(
    (sum, comment) => sum + (comment.attachments?.length || 0),
    0
  );
  return postAttachments + commentAttachments;
});

communityPostSchema.pre("save", function (next) {
  if (this.isModified("comments") || this.isModified("likes")) {
    this.lastActivityAt = new Date();
  }
  next();
});

const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);
export default CommunityPost;
