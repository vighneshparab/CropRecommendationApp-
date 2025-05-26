import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiCalendar,
  FiDroplet,
  FiThermometer,
  FiSun,
  FiWind,
  FiClock,
} from "react-icons/fi";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const CropRecommendationDetail = () => {
  const { id } = useParams();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/suggestions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recommendation");
        }

        const data = await response.json();
        setRecommendation(data.recommendation);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Recommendation
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-gray-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Recommendation Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested crop recommendation could not be found.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-green-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              Crop Recommendation
            </h1>
            <div className="flex items-center text-gray-600">
              <FiClock className="mr-2" />
              <span>Generated on {formatDate(recommendation.createdAt)}</span>
            </div>
          </div>

          {recommendation.crops.map((crop, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-green-700 mb-1">
                      {crop.cropName}
                    </h2>
                    <p className="text-gray-500 mb-4">
                      Matched on {formatDate(crop.matchedAt)}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Recommended
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Soil Factors */}
                  <div className="bg-green-50 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Soil Conditions
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Soil Type</span>
                        <span className="font-medium">
                          {crop.soilFactors.soilType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Soil pH</span>
                        <span className="font-medium">
                          {crop.soilFactors.soilPH}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Organic Matter</span>
                        <span className="font-medium">
                          {crop.soilFactors.organicMatter}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Drainage</span>
                        <span className="font-medium">
                          {crop.soilFactors.drainage}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-md font-semibold text-green-700 mt-5 mb-3">
                      Nutrient Levels
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nitrogen (N)</span>
                        <span className="font-medium">
                          {crop.soilFactors.nutrients.nitrogen} ppm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phosphorus (P)</span>
                        <span className="font-medium">
                          {crop.soilFactors.nutrients.phosphorus} ppm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Potassium (K)</span>
                        <span className="font-medium">
                          {crop.soilFactors.nutrients.potassium} ppm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Climate Factors */}
                  <div className="bg-green-50 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <FiThermometer className="mr-2" />
                      Climate Conditions
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Temperature</span>
                        <span className="font-medium">
                          {crop.climateFactors.temperature}°C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rainfall</span>
                        <span className="font-medium">
                          {crop.climateFactors.rainfall} mm/year
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Humidity</span>
                        <span className="font-medium">
                          {crop.climateFactors.humidity}%
                        </span>
                      </div>
                    </div>

                    <h4 className="text-md font-semibold text-green-700 mt-5 mb-3">
                      Crop Suitability
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-gray-700">
                        {crop.cropName} thrives in{" "}
                        {crop.soilFactors.soilType.toLowerCase()} soil with a pH
                        of {crop.soilFactors.soilPH}. It requires moderate
                        temperatures around {crop.climateFactors.temperature}°C
                        and annual rainfall of {crop.climateFactors.rainfall}mm.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                    <FiSun className="mr-2" />
                    Cultivation Tips for {crop.cropName}
                  </h3>
                  <div className="bg-green-50 rounded-lg p-5">
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Plant during the optimal season for your region</li>
                      <li>Maintain soil moisture without waterlogging</li>
                      <li>
                        Apply balanced fertilizer according to soil test results
                      </li>
                      <li>Monitor for common pests and diseases</li>
                      <li>Practice crop rotation to maintain soil health</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-100 px-6 py-4 flex justify-end">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition duration-200 mr-3">
                  Save Recommendation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CropRecommendationDetail;
