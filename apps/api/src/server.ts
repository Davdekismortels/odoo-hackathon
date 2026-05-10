import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Route imports
import authRoutes from "./routes/auth.routes.js";

const app = express();

// ==================== SECURITY ====================
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ==================== BODY PARSING ====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ==================== RATE LIMITING ====================
app.use("/api/", generalLimiter);

// ==================== ROUTES ====================
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRoutes);

// ==================== ERROR HANDLING ====================
app.use(notFound);
app.use(errorHandler);

// ==================== START ====================
app.listen(env.API_PORT, () => {
  console.log(`🚀 Traveloop API running at http://${env.API_HOST}:${env.API_PORT}`);
  console.log(`   Environment : ${env.NODE_ENV}`);
  console.log(`   Auth routes : /api/v1/auth`);
});

export default app;
