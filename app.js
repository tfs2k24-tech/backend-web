import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.js";
import queryRoutes from "./routes/queries.js";
import teamRoutes from "./routes/team.js";
import testimonialRoutes from "./routes/test.js";

dotenv.config();

const app = express();

/* ------------------ CORS ------------------ */

const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

/* ------------------ IMPORTANT ------------------ */
app.use(express.json());   // ✅ YOU MISSED THIS

/* ------------------ ROUTES ------------------ */

app.get("/", (req, res) => {
  res.json({
    message: "TFS Backend API 🚀",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
  });
});

app.use("/api/admin", adminRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/testimonials", testimonialRoutes);

/* ------------------ ERRORS ------------------ */

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);

  // 🔥 IMPORTANT: send proper CORS headers even on error
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");

  res.status(500).json({
    error: err.message || "Internal server error",
  });
});

export default app;
