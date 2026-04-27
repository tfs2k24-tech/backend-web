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

const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins (dev + prod)
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// ← DELETE everything after this until your middleware section

// ✅ DELETE the manual middleware below — it conflicts with cors()

// ✅ IMPORTANT: manual preflight handler (safe for Express 5)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,PATCH,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ------------------ MIDDLEWARE ------------------ */

app.use(express.json());

/* ------------------ ROUTES ------------------ */

app.get("/", (req, res) => {
  res.json({
    message: "TFS Backend API 🚀",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/testimonials", testimonialRoutes);

/* ------------------ ERROR HANDLING ------------------ */

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
});

export default app;
