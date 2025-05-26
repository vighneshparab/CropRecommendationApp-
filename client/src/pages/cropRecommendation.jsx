import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const CropRecommendationForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    // Soil Factors
    Soil_Type: "Loamy",
    Soil_pH: 6.8,
    N_Value: 80,
    P_Value: 50,
    K_Value: 75,
    Fe_Value: 3.5,
    Zn_Value: 2,
    Cu_Value: 0.35,
    Mn_Value: 2.5,
    Organic_Matter: 2.3,
    Soil_Moisture: 20,
    Soil_Salinity: 1.0,
    Soil_Drainage: "Well-drained",

    // Climate Factors
    Temperature: 22,
    Season: "Rabi",
    Rainfall: 600,
    Humidity: 60,
    Sunlight: 7,
    Frost_Risk: "Low",
    Wind_Speed: 10,

    // Geographic Factors
    Altitude: 800,
    Slope: "Gentle",
    Water_Proximity: "Groundwater",
    Flood_Risk: "Low",

    // Crop Factors
    Crop_Variety: "Yellow",
    Growth_Duration: 120,
    Water_Requirements: "Medium",
    Pest_Susceptibility: "Moderate",

    // Practice Factors
    Irrigation_Method: "Sprinkler",
    Fertilizer_Use: "Organic",

    // Economic Factors
    Market_Demand: "Local",
    Market_Price: 4000,
    Labor_Availability: "Mixed",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.endsWith("_Value") ||
        name.endsWith("pH") ||
        name.endsWith("Moisture") ||
        name.endsWith("Salinity") ||
        name.endsWith("Temperature") ||
        name.endsWith("Rainfall") ||
        name.endsWith("Humidity") ||
        name.endsWith("Sunlight") ||
        name.endsWith("Speed") ||
        name.endsWith("Altitude") ||
        name.endsWith("Duration") ||
        name.endsWith("Price")
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/suggestions/`,
        formData,
        config
      );

      setResult(response.data);
      if (response.data.success && token) {
        navigate(`/crop-recommendations/${response.data.recommendationId}`);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      setResult({
        success: false,
        message: error.response?.data?.message || "Failed to get prediction",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const soilTypes = ["Loamy", "Sandy", "Clay", "Silty", "Peaty", "Chalky"];
  const drainageOptions = [
    "Well-drained",
    "Moderately drained",
    "Poorly drained",
  ];
  const seasons = ["Rabi", "Kharif", "Zaid", "Whole Year"];
  const frostRiskOptions = ["Low", "Medium", "High"];
  const slopeOptions = ["Flat", "Gentle", "Moderate", "Steep"];
  const waterProximityOptions = [
    "Groundwater",
    "River",
    "Lake",
    "Canal",
    "Rainfed",
  ];
  const floodRiskOptions = ["Low", "Medium", "High"];
  const cropVarietyOptions = ["Yellow", "White", "Red", "Hybrid"];
  const waterRequirementOptions = ["Low", "Medium", "High"];
  const pestOptions = ["Low", "Moderate", "High"];
  const irrigationOptions = ["Drip", "Sprinkler", "Flood", "Manual"];
  const fertilizerOptions = ["Organic", "Chemical", "Mixed", "None"];
  const marketOptions = ["Local", "Regional", "National", "Export"];
  const laborOptions = ["Abundant", "Limited", "Mixed"];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              Crop Recommendation System
            </h1>
            <p className="text-lg text-gray-600">
              Fill in your farm details to get personalized crop recommendations
            </p>
          </div>

          {!result ? (
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-xl rounded-lg overflow-hidden"
            >
              {/* Progress Bar */}
              <div className="bg-green-50 h-2">
                <div
                  className="bg-green-600 h-2 transition-all duration-300"
                  style={{ width: `${(step / 6) * 100}%` }}
                ></div>
              </div>

              {/* Form Steps */}
              <div className="p-6 sm:p-8">
                {/* Step 1: Soil Factors */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-green-700 border-b pb-2 mb-4">
                      Soil Characteristics
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Soil Type
                        </label>
                        <select
                          name="Soil_Type"
                          value={formData.Soil_Type}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {soilTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Soil pH
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="14"
                          name="Soil_pH"
                          value={formData.Soil_pH}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nitrogen (N) Value
                        </label>
                        <input
                          type="number"
                          name="N_Value"
                          value={formData.N_Value}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phosphorus (P) Value
                        </label>
                        <input
                          type="number"
                          name="P_Value"
                          value={formData.P_Value}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Potassium (K) Value
                        </label>
                        <input
                          type="number"
                          name="K_Value"
                          value={formData.K_Value}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Iron (Fe) Value
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="Fe_Value"
                          value={formData.Fe_Value}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zinc (Zn) Value
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="Zn_Value"
                          value={formData.Zn_Value}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Copper (Cu) Value
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="Cu_Value"
                          value={formData.Cu_Value}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Manganese (Mn) Value
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="Mn_Value"
                          value={formData.Mn_Value}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Organic Matter (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="Organic_Matter"
                          value={formData.Organic_Matter}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Soil Moisture (%)
                        </label>
                        <input
                          type="number"
                          name="Soil_Moisture"
                          value={formData.Soil_Moisture}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Soil Salinity (dS/m)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="Soil_Salinity"
                          value={formData.Soil_Salinity}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Soil Drainage
                        </label>
                        <select
                          name="Soil_Drainage"
                          value={formData.Soil_Drainage}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {drainageOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Climate Factors */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-green-700 border-b pb-2 mb-4">
                      Climate Conditions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Temperature (°C)
                        </label>
                        <input
                          type="number"
                          name="Temperature"
                          value={formData.Temperature}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Season
                        </label>
                        <select
                          name="Season"
                          value={formData.Season}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {seasons.map((season) => (
                            <option key={season} value={season}>
                              {season}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rainfall (mm)
                        </label>
                        <input
                          type="number"
                          name="Rainfall"
                          value={formData.Rainfall}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Humidity (%)
                        </label>
                        <input
                          type="number"
                          name="Humidity"
                          value={formData.Humidity}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sunlight (hours/day)
                        </label>
                        <input
                          type="number"
                          name="Sunlight"
                          value={formData.Sunlight}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frost Risk
                        </label>
                        <select
                          name="Frost_Risk"
                          value={formData.Frost_Risk}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {frostRiskOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Wind Speed (km/h)
                        </label>
                        <input
                          type="number"
                          name="Wind_Speed"
                          value={formData.Wind_Speed}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Geographic Factors */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-green-700 border-b pb-2 mb-4">
                      Geographic Features
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Altitude (meters)
                        </label>
                        <input
                          type="number"
                          name="Altitude"
                          value={formData.Altitude}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Slope
                        </label>
                        <select
                          name="Slope"
                          value={formData.Slope}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {slopeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Water Proximity
                        </label>
                        <select
                          name="Water_Proximity"
                          value={formData.Water_Proximity}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {waterProximityOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Flood Risk
                        </label>
                        <select
                          name="Flood_Risk"
                          value={formData.Flood_Risk}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {floodRiskOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Crop Factors */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-green-700 border-b pb-2 mb-4">
                      Crop Preferences
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Crop Variety
                        </label>
                        <select
                          name="Crop_Variety"
                          value={formData.Crop_Variety}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {cropVarietyOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Growth Duration (days)
                        </label>
                        <input
                          type="number"
                          name="Growth_Duration"
                          value={formData.Growth_Duration}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Water Requirements
                        </label>
                        <select
                          name="Water_Requirements"
                          value={formData.Water_Requirements}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {waterRequirementOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pest Susceptibility
                        </label>
                        <select
                          name="Pest_Susceptibility"
                          value={formData.Pest_Susceptibility}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {pestOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Practice Factors */}
                {step === 5 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-green-700 border-b pb-2 mb-4">
                      Farming Practices
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Irrigation Method
                        </label>
                        <select
                          name="Irrigation_Method"
                          value={formData.Irrigation_Method}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {irrigationOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fertilizer Use
                        </label>
                        <select
                          name="Fertilizer_Use"
                          value={formData.Fertilizer_Use}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {fertilizerOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Economic Factors */}
                {step === 6 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-green-700 border-b pb-2 mb-4">
                      Economic Considerations
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Market Demand
                        </label>
                        <select
                          name="Market_Demand"
                          value={formData.Market_Demand}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {marketOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Market Price (₹/quintal)
                        </label>
                        <input
                          type="number"
                          name="Market_Price"
                          value={formData.Market_Price}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Labor Availability
                        </label>
                        <select
                          name="Labor_Availability"
                          value={formData.Labor_Availability}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          {laborOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                    >
                      Previous
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {step < 6 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Get Recommendation"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white shadow-xl rounded-lg overflow-hidden p-8 text-center">
              {result.success ? (
                <>
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg
                      className="h-8 w-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Recommended Crop
                  </h2>
                  <p className="text-3xl font-semibold text-gray-800 mb-6">
                    {result.predicted_crop}
                  </p>

                  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 text-left">
                    <h3 className="font-medium text-green-800 mb-2">
                      Why this crop?
                    </h3>
                    <p className="text-gray-700">
                      Based on your soil conditions, climate factors, and
                      farming practices, {result.predicted_crop} is the most
                      suitable crop for your farm. It matches well with your
                      soil nutrients, water availability, and local market
                      conditions.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={() => setResult(null)}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                      New Recommendation
                    </button>
                    {result.recommendationId && (
                      <button
                        onClick={() =>
                          navigate(
                            `/crop-recommendations/${result.recommendationId}`
                          )
                        }
                        className="px-6 py-2 bg-white text-green-600 border border-green-600 rounded-md hover:bg-green-50 transition"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <svg
                      className="h-8 w-8 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-red-800 mb-2">
                    Error
                  </h2>
                  <p className="text-lg text-gray-700 mb-6">{result.message}</p>
                  <button
                    onClick={() => setResult(null)}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CropRecommendationForm;
