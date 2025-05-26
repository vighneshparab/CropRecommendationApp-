import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Check required environment variables
const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error(
    `Missing required Cloudinary environment variables: ${missingVars.join(
      ", "
    )}`
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Verify Cloudinary connection
cloudinary.api
  .ping()
  .then(() => console.log("Connected to Cloudinary successfully"))
  .catch((err) => {
    console.error("Failed to connect to Cloudinary:", err);
    process.exit(1);
  });

export default cloudinary;
