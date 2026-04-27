import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.js";
import queryRoutes from "./routes/queries.js";
import teamRoutes from "./routes/team.js";
import testimonialRoutes from "./routes/test.js";

dotenv.config();

const app = express();

// CORS setup
const isLocalDevOrigin = (origin) =>
  /^http:\/\/localhost:\d+$/.test(origin) ||
  /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

const corsOptions = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : (origin, callback) => {
        if (!origin || isLocalDevOrigin(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

/* ------------------ ROUTES ------------------ */

// Root route (fixes your issue)
app.get("/", (req, res) => {
  res.json({
    message: "TFS Backend API 🚀",
    endpoints: [
      "/health",
      "/api/admin",
      "/api/queries",
      "/api/teams",
      "/api/testimonials",
    ],
  });
});

// Health route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
  });
});

// API routes
app.use("/api/admin", adminRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/testimonials", testimonialRoutes);

/* ------------------ ERROR HANDLING ------------------ */

// 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: err.message || "Internal server error",
  });
});

export default app;
