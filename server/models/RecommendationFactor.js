import mongoose from "mongoose";

const recommendationFactorSchema = new mongoose.Schema(
  {
    // Soil Factors
    soilType: { type: String },
    soilPH: { type: Number },
    nitrogen: { type: Number }, // N
    phosphorus: { type: Number }, // P
    potassium: { type: Number }, // K
    iron: { type: Number }, // Fe
    zinc: { type: Number }, // Zn
    copper: { type: Number }, // Cu
    manganese: { type: Number }, // Mn
    organicMatter: { type: Number },
    soilMoisture: { type: Number },
    soilSalinity: { type: Number },
    soilDrainage: { type: String },

    // Climate Factors
    temperature: { type: Number },
    season: { type: String },
    rainfall: { type: Number },
    humidity: { type: Number },
    sunlight: { type: Number },
    frostRisk: { type: String },
    windSpeed: { type: Number },

    // Geographic Factors
    altitude: { type: Number },
    slope: { type: String },
    waterProximity: { type: String },
    floodRisk: { type: String },

    // Crop Factors
    cropVariety: { type: String },
    growthDuration: { type: Number },
    waterRequirements: { type: String },
    pestSusceptibility: { type: String },

    // Agricultural Practices
    irrigationMethod: { type: String },
    fertilizerUse: { type: String },

    // Economic Factors
    marketDemand: { type: String },
    marketPrice: { type: Number },
    laborAvailability: { type: String },

    // Reference to User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const RecommendationFactor = mongoose.model(
  "RecommendationFactor",
  recommendationFactorSchema
);

export default RecommendationFactor;
