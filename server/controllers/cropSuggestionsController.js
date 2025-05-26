import axios from "axios";
import User from "../models/User.js";
import UserRecommendation from "../models/UserRecommendation.js";
import RecommendationFactor from "../models/RecommendationFactor.js";

export const getCropPrediction = async (req, res) => {
  try {
    // 1. Get prediction from external API
    const apiResponse = await axios.post(
      "https://crop-prediction-api-production-2ebd.up.railway.app/predict",
      req.body
    );
    const predictedCrop = apiResponse.data.predicted_crop;

    // 2. If user is authenticated, save to database
    if (req.user?._id) {
      try {
        // Create factor record
        const factor = await RecommendationFactor.create({
          // Soil
          soilType: req.body.Soil_Type,
          soilPH: req.body.Soil_pH,
          nitrogen: req.body.N_Value,
          phosphorus: req.body.P_Value,
          potassium: req.body.K_Value,
          iron: req.body.Fe_Value,
          zinc: req.body.Zn_Value,
          copper: req.body.Cu_Value,
          manganese: req.body.Mn_Value,
          organicMatter: req.body.Organic_Matter,
          soilMoisture: req.body.Soil_Moisture,
          soilSalinity: req.body.Soil_Salinity,
          soilDrainage: req.body.Soil_Drainage,

          // Climate
          temperature: req.body.Temperature,
          season: req.body.Season,
          rainfall: req.body.Rainfall,
          humidity: req.body.Humidity,
          sunlight: req.body.Sunlight,
          frostRisk: req.body.Frost_Risk,
          windSpeed: req.body.Wind_Speed,

          // Geographic
          altitude: req.body.Altitude,
          slope: req.body.Slope,
          waterProximity: req.body.Water_Proximity,
          floodRisk: req.body.Flood_Risk,

          // Crop
          cropVariety: req.body.Crop_Variety,
          growthDuration: req.body.Growth_Duration,
          waterRequirements: req.body.Water_Requirements,
          pestSusceptibility: req.body.Pest_Susceptibility,

          // Practices
          irrigationMethod: req.body.Irrigation_Method,
          fertilizerUse: req.body.Fertilizer_Use,

          // Economic
          marketDemand: req.body.Market_Demand,
          marketPrice: req.body.Market_Price,
          laborAvailability: req.body.Labor_Availability,

          // Reference
          userId: req.user._id,
        });

        // Create recommendation
        const recommendation = await UserRecommendation.create({
          userId: req.user._id,
          recommendations: [
            {
              cropName: predictedCrop,
              factorId: factor._id,
              matchedAt: new Date(),
            },
          ],
        });

        // Update user
        await User.findByIdAndUpdate(req.user._id, {
          $push: { recommendations: recommendation._id },
        });

        return res.json({
          success: true,
          predicted_crop: predictedCrop,
          recommendationId: recommendation._id,
          factorId: factor._id,
          storedInDatabase: true,
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        return res.status(500).json({
          success: false,
          message: "Failed to save data",
          error: dbError.message,
          apiPrediction: predictedCrop, // Still return the prediction
        });
      }
    }

    // 3. For unauthenticated users
    return res.json({
      success: true,
      predicted_crop: predictedCrop,
      storedInDatabase: false,
      message: "Sign in to save predictions",
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get user's recommendation history
export const getUserRecommendations = async (req, res) => {
  try {
    const recommendations = await UserRecommendation.find({
      userId: req.user._id,
    }).populate("recommendations.factorId");

    res.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get recommendations",
    });
  }
};

// Delete recommendation
export const deleteRecommendation = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove from user's array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recommendations: id },
    });

    // Delete the recommendation
    await UserRecommendation.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete",
    });
  }
};

export const getRecommendationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find recommendation and populate factor details
    const recommendation = await UserRecommendation.findOne({
      _id: id,
      userId,
    }).populate({
      path: "recommendations.factorId",
      model: "RecommendationFactor",
      select: "-userId -createdAt -updatedAt -__v", // Exclude unnecessary fields
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found or access denied",
      });
    }

    // Format the response
    const formattedRecommendation = {
      id: recommendation._id,
      createdAt: recommendation.createdAt,
      crops: recommendation.recommendations.map((item) => ({
        cropName: item.cropName,
        matchedAt: item.matchedAt,
        soilFactors: item.factorId
          ? {
              soilType: item.factorId.soilType,
              soilPH: item.factorId.soilPH,
              nutrients: {
                nitrogen: item.factorId.nitrogen,
                phosphorus: item.factorId.phosphorus,
                potassium: item.factorId.potassium,
              },
              organicMatter: item.factorId.organicMatter,
              drainage: item.factorId.soilDrainage,
            }
          : null,
        climateFactors: item.factorId
          ? {
              temperature: item.factorId.temperature,
              rainfall: item.factorId.rainfall,
              humidity: item.factorId.humidity,
            }
          : null,
      })),
    };

    res.json({
      success: true,
      recommendation: formattedRecommendation,
    });
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
