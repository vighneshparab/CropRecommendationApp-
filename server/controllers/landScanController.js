// controllers/landScanController.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_ELEVATION_API_KEY = process.env.GOOGLE_ELEVATION_API_KEY;
const AGRO_API_KEY = process.env.AGRO_API_KEY;

if (!GOOGLE_ELEVATION_API_KEY || !AGRO_API_KEY) {
  console.error("API keys not set in environment variables");
  process.exit(1);
}

export const scanLand = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res
      .status(400)
      .json({ message: "Latitude and Longitude are required" });
  }

  try {
    // 🌱 Agromonitoring Soil API Call
    const soilRes = await axios.get(
      `https://api.agromonitoring.com/agro/1.0/soil`,
      {
        params: {
          lat,
          lon,
          appid: AGRO_API_KEY,
        },
      }
    );

    // 🏔️ Google Elevation API Call
    const elevationRes = await axios.get(
      `https://maps.googleapis.com/maps/api/elevation/json`,
      {
        params: {
          locations: `${lat},${lon}`,
          key: GOOGLE_ELEVATION_API_KEY,
        },
      }
    );

    const soilData = {
      soil_temperature: soilRes.data.t0,
      moisture: soilRes.data.moisture,
      date: new Date(soilRes.data.dt * 1000).toLocaleString(),
    };

    const elevationData = elevationRes.data.results?.[0]?.elevation || "N/A";

    res.json({
      soil: soilData,
      elevation: elevationData,
    });
  } catch (error) {
    console.error(
      "Land scan API error:",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "Failed to retrieve land scan data" });
  }
};
