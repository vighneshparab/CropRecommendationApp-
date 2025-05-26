import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDb.js";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

// Route imports
import userRoutes from "./routes/userRoutes.js";
import landRoutes from "./routes/landscanRoutes.js";
import suggestionsRoutes from "./routes/cropSuggestionsRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";

// Load environment variables
dotenv.config();

// Connect to database
(async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully.");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    process.exit(1);
  }
})();

const app = express();

// Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// CORS configuration
const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:5173"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is running." });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/land", landRoutes);
app.use("/api/suggestions", suggestionsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/weather", weatherRoutes);

// Global error handler (optional - for cleaner API error handling)
app.use((err, req, res, next) => {
  console.error("❗ Error:", err.stack);
  res.status(500).json({ error: "Something went wrong." });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
