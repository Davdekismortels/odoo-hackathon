import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Placeholder for routes (Chunk 2)
app.get("/api/v1", (_req, res) => {
  res.json({ message: "Traveloop API v1", version: "1.0.0" });
});

// Start
app.listen(env.API_PORT, () => {
  console.log(`🚀 Traveloop API running at http://${env.API_HOST}:${env.API_PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
});

export default app;
