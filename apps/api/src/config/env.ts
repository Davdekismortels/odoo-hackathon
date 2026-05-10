import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  API_PORT: parseInt(process.env.API_PORT || "4000", 10),
  API_HOST: process.env.API_HOST || "localhost",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-me-in-production",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "15m",
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  DATABASE_URL: process.env.DATABASE_URL || "file:./traveloop.db",
  NOMINATIM_BASE_URL: process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org",
  OVERPASS_BASE_URL: process.env.OVERPASS_BASE_URL || "https://overpass-api.de/api/interpreter",
} as const;
