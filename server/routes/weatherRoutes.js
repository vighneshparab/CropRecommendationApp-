import express from "express";
import { getWeatherData } from "../controllers/weatherController.js";

const router = express.Router();

router.get("/", getWeatherData);

export default router;
