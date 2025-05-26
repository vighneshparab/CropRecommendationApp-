import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const weatherreport = () => {
  const [inputType, setInputType] = useState("text"); // 'text' or 'map'
  const [locationInput, setLocationInput] = useState("");
  const [coordinates, setCoordinates] = useState({
    lat: 18.5204,
    lng: 73.8567,
  }); // Default to Pune, India
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastDays, setForecastDays] = useState(7);

  // Map click handler component
  const MapClickHandler = ({ setCoordinates }) => {
    useMapEvents({
      click(e) {
        setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        lat: coordinates.lat,
        lon: coordinates.lng,
        days: forecastDays,
      };

      if (inputType === "text" && locationInput) {
        params.location = locationInput;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/weather`,
        {
          params,
        }
      );
      setWeatherData(response.data.data);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError(err.response?.data?.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherData();
  };

  const handleLocationSearch = async () => {
    if (!locationInput) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${locationInput}`
      );
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        setError("Location not found");
      }
    } catch (err) {
      console.error("Error searching location:", err);
      setError("Failed to search location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-green-400 mb-8">
            Weather Forecast Application
          </h1>

          {/* Input Selection Tabs */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setInputType("text")}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  inputType === "text"
                    ? "bg-green-600 text-white"
                    : "bg-white text-green-600 hover:bg-green-50"
                }`}
              >
                Text Input
              </button>
              <button
                onClick={() => setInputType("map")}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  inputType === "map"
                    ? "bg-green-600 text-white"
                    : "bg-white text-green-600 hover:bg-green-50"
                }`}
              >
                Map Selection
              </button>
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            {inputType === "text" ? (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Location
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="location"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="Enter city name or coordinates (lat,lon)"
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      onClick={handleLocationSearch}
                      disabled={!locationInput}
                      className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600 disabled:bg-green-300"
                    >
                      Search
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-32">
                  <label
                    htmlFor="days"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Forecast Days
                  </label>
                  <select
                    id="days"
                    value={forecastDays}
                    onChange={(e) => setForecastDays(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    {[1, 3, 5, 7, 10, 14].map((day) => (
                      <option key={day} value={day}>
                        {day} days
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="h-96 rounded-lg overflow-hidden mb-4">
                <MapContainer
                  center={[coordinates.lat, coordinates.lng]}
                  zoom={8}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[coordinates.lat, coordinates.lng]}>
                    <Popup>
                      Selected Location <br />
                      {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                    </Popup>
                  </Marker>
                  <MapClickHandler setCoordinates={setCoordinates} />
                </MapContainer>
              </div>
            )}

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {inputType === "map" && (
                  <span>
                    Selected: {coordinates.lat.toFixed(4)},{" "}
                    {coordinates.lng.toFixed(4)}
                  </span>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
              >
                {loading ? "Loading..." : "Get Weather"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}

          {/* Weather Display */}
          {weatherData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Weather */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Current Weather
                </h2>
                <div className="flex items-center">
                  {weatherData.current.source === "weatherapi-fallback" ? (
                    <>
                      <img
                        src={weatherData.current.icon}
                        alt={weatherData.current.condition}
                        className="w-16 h-16 mr-4"
                      />
                      <div>
                        <p className="text-3xl font-bold">
                          {weatherData.current.temperature}°C
                        </p>
                        <p className="text-gray-600">
                          {weatherData.current.condition}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">🌤️</span>
                      </div>
                      <div>
                        <p className="text-3xl font-bold">
                          {weatherData.current.temperature}°C
                        </p>
                        <p className="text-gray-600">
                          Wind: {weatherData.current.windspeed} km/h
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Humidity</p>
                    <p className="font-semibold">
                      {weatherData.current.source === "weatherapi-fallback"
                        ? `${weatherData.current.humidity}%`
                        : `${weatherData.current.hourly.relativehumidity_2m[0]}%`}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Feels Like</p>
                    <p className="font-semibold">
                      {weatherData.current.source === "weatherapi-fallback"
                        ? `${weatherData.current.temperature}°C`
                        : `${weatherData.current.hourly.apparent_temperature[0]}°C`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Forecast */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {forecastDays}-Day Forecast
                </h2>
                <div className="space-y-3">
                  {weatherData.forecast.time
                    .slice(0, forecastDays)
                    .map((date, index) => (
                      <div
                        key={date}
                        className="flex items-center justify-between py-2 border-b border-gray-100"
                      >
                        <div className="w-24">
                          <p className="font-medium">
                            {new Date(date).toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-lg mr-2">🌤️</span>
                          <div className="text-right">
                            <p className="font-semibold">
                              {weatherData.forecast.temperature_2m_max[index]}°
                            </p>
                            <p className="text-sm text-gray-500">
                              {weatherData.forecast.temperature_2m_min[index]}°
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Air Quality */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Air Quality
                </h2>
                {weatherData.airQuality ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          PM2.5
                        </span>
                        <span className="text-sm font-semibold">
                          {weatherData.airQuality.pm2_5[0]} μg/m³
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              weatherData.airQuality.pm2_5[0] * 2,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          PM10
                        </span>
                        <span className="text-sm font-semibold">
                          {weatherData.airQuality.pm10[0]} μg/m³
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-yellow-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              weatherData.airQuality.pm10[0],
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          CO
                        </span>
                        <span className="text-sm font-semibold">
                          {weatherData.airQuality.carbon_monoxide[0]} μg/m³
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              weatherData.airQuality.carbon_monoxide[0] / 10,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Air quality data not available
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default weatherreport;
