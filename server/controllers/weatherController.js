import axios from "axios";

// Primary API - Open-Meteo (free, no key needed)
const OPEN_METEO_URL = "https://api.open-meteo.com/v1";

// Fallback API - WeatherAPI.com (free tier)
const WEATHER_API_URL = "http://api.weatherapi.com/v1";
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || ""; // Get from https://www.weatherapi.com/

export const getWeatherData = async (req, res) => {
  try {
    const { lat, lon, location, days = 7, start_date, end_date } = req.query;

    // Validate input
    if (!lat && !lon && !location) {
      return res.status(400).json({
        success: false,
        message: "Provide either lat/lon or location parameter",
      });
    }

    // If location name provided, first get coordinates
    let coordinates = { lat, lon };
    if (location && !lat && !lon) {
      coordinates = await getCoordinates(location);
    }

    // Fetch all weather data in parallel
    const [current, forecast, historical, airQuality] = await Promise.all([
      getCurrentWeather(coordinates.lat, coordinates.lon, location),
      getWeatherForecast(coordinates.lat, coordinates.lon, days),
      start_date && end_date
        ? getHistoricalWeather(
            coordinates.lat,
            coordinates.lon,
            start_date,
            end_date
          )
        : Promise.resolve(null),
      getAirQuality(coordinates.lat, coordinates.lon),
    ]);

    res.json({
      success: true,
      data: {
        location:
          location || `Lat: ${coordinates.lat}, Lon: ${coordinates.lon}`,
        coordinates,
        current,
        forecast,
        historical,
        airQuality,
      },
    });
  } catch (error) {
    console.error("Weather API Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Failed to fetch weather data",
      error: error.message,
    });
  }
};

// Helper functions
const getCoordinates = async (location) => {
  try {
    if (WEATHER_API_KEY) {
      const response = await axios.get(`${WEATHER_API_URL}/search.json`, {
        params: { key: WEATHER_API_KEY, q: location },
      });
      return {
        lat: response.data[0].lat,
        lon: response.data[0].lon,
      };
    }
    throw new Error("Location lookup requires WeatherAPI.com key");
  } catch (error) {
    console.error("Coordinate lookup failed, using default", error.message);
    return { lat: 18.5204, lon: 73.8567 }; // Default to Pune, India
  }
};

const getCurrentWeather = async (lat, lon, location) => {
  try {
    // Try Open-Meteo first
    const response = await axios.get(`${OPEN_METEO_URL}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        hourly: "temperature_2m,relativehumidity_2m,apparent_temperature",
        timezone: "auto",
      },
    });

    return {
      source: "open-meteo",
      temperature: response.data.current_weather.temperature,
      windspeed: response.data.current_weather.windspeed,
      winddirection: response.data.current_weather.winddirection,
      time: response.data.current_weather.time,
      hourly: response.data.hourly,
    };
  } catch (error) {
    console.error("Open-Meteo current failed, trying fallback");
    return getCurrentWeatherFallback(location);
  }
};

const getCurrentWeatherFallback = async (location) => {
  if (!WEATHER_API_KEY) throw new Error("No fallback API available");

  const response = await axios.get(`${WEATHER_API_URL}/current.json`, {
    params: { key: WEATHER_API_KEY, q: location },
  });

  return {
    source: "weatherapi-fallback",
    temperature: response.data.current.temp_c,
    condition: response.data.current.condition.text,
    icon: response.data.current.condition.icon,
    humidity: response.data.current.humidity,
    wind: response.data.current.wind_kph,
  };
};

const getWeatherForecast = async (lat, lon, days) => {
  const response = await axios.get(`${OPEN_METEO_URL}/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      daily:
        "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
      timezone: "auto",
      forecast_days: Math.min(days, 16),
    },
  });

  return response.data.daily;
};

const getHistoricalWeather = async (lat, lon, start_date, end_date) => {
  const response = await axios.get(`${OPEN_METEO_URL}/archive`, {
    params: {
      latitude: lat,
      longitude: lon,
      start_date,
      end_date,
      daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
      timezone: "auto",
    },
  });

  return response.data.daily;
};

const getAirQuality = async (lat, lon) => {
  try {
    const response = await axios.get(`${OPEN_METEO_URL}/air-quality`, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: "pm10,pm2_5,carbon_monoxide",
      },
    });
    return response.data.hourly;
  } catch (error) {
    console.error("Air quality data not available");
    return null;
  }
};
