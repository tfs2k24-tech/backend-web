import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.js";
import queryRoutes from "./routes/queries.js";
import teamRoutes from "./routes/team.js";
import testimonialRoutes from "./routes/test.js";

dotenv.config();

const app = express();

/* ------------------ CORS (TOP PRIORITY) ------------------ */

const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests without origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/* 🔥 APPLY CORS FIRST */
app.use(cors(corsOptions));

/* 🔥 HANDLE PREFLIGHT EXPLICITLY */
app.options("*", cors(corsOptions));

/* ------------------ BODY PARSER ------------------ */
app.use(express.json());

/* ------------------ DEBUG (optional but useful) ------------------ */
app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.url);
  next();
});

/* ------------------ ROUTES ------------------ */

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "TFS Backend API 🚀",
  });
});

// Health route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
  });
});

// API routes
app.use("/api/admin", adminRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/testimonials", testimonialRoutes);

/* ------------------ 404 ------------------ */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

/* ------------------ GLOBAL ERROR HANDLER ------------------ */
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  // 🔥 Ensure CORS headers are always sent even on error
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");

  res.status(500).json({
    error: err.message || "Internal server error",
  });
});

export default app;
