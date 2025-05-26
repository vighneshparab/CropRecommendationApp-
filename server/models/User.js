import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Resource name is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: {
        values: ["kg", "g", "L", "mL", "bags", "units"],
        message: "Invalid unit type",
      },
    },
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
    },
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Activity date is required"],
      default: Date.now,
      max: [Date.now, "Activity date cannot be in the future"],
    },
    activityType: {
      type: String,
      required: [true, "Activity type is required"],
      enum: {
        values: [
          "planting",
          "harvesting",
          "fertilizing",
          "irrigation",
          "pest_control",
          "pruning",
          "soil_treatment",
          "weeding",
          "transplanting",
          "other",
        ],
        message: "Invalid activity type",
      },
    },
    crop: {
      type: String,
      required: [true, "Crop name is required"],
      trim: true,
    },
    fieldLocation: {
      type: String,
      trim: true,
    },
    plotSize: {
      value: Number,
      unit: {
        type: String,
        enum: ["acres", "hectares", "square meters"],
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    duration: {
      type: Number, // in minutes
      min: [1, "Duration must be at least 1 minute"],
    },
    resourcesUsed: [resourceSchema],
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
          },
          message: "Invalid image URL format",
        },
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["planned", "in_progress", "completed", "cancelled"],
        message: "Invalid activity status",
      },
      default: "completed",
    },
    workers: {
      type: Number,
      min: [1, "At least 1 worker is required"],
    },
    weatherConditions: {
      temperature: Number,
      humidity: Number,
      conditions: {
        type: String,
        enum: ["sunny", "cloudy", "rainy", "windy", "stormy"],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

activitySchema.index({
  crop: "text",
  activityType: "text",
  notes: "text",
});

const userSchema = new mongoose.Schema(
  {
    credentials: {
      name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Invalid email format",
        ],
      },
      password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
      },
      role: {
        type: String,
        enum: ["farmer", "admin"],
        default: "farmer",
      },
    },
    preferences: {
      preferredCrops: [
        {
          type: String,
          trim: true,
        },
      ],
      location: {
        type: String,
        trim: true,
      },
    },
    profile: {
      picture: {
        type: String,
        validate: {
          validator: function (v) {
            return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
          },
          message: "Invalid image URL format",
        },
      },
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
      },
      contact: {
        type: String,
        trim: true,
      },
    },
    farmingActivities: {
      type: [activitySchema],
      default: [],
    },
    recommendations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserRecommendation",
      },
    ],
    accountStatus: {
      lastLogin: {
        type: Date,
        default: Date.now,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    otp: {
      type: String,
    },
    otpExpiration: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Safer virtual properties
userSchema.virtual("activityCount").get(function () {
  return this.farmingActivities?.length || 0;
});

userSchema.virtual("recentActivities").get(function () {
  if (!Array.isArray(this.farmingActivities)) return [];
  return [...this.farmingActivities]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
});

const User = mongoose.model("User", userSchema);
export default User;
