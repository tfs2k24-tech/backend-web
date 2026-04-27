import express from "express";
import mongoose from "mongoose";
import { authMiddleware, requireRole } from "./admin.js";

const router = express.Router();

// Query Schema
const querySchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    company: String,
    phone: String,
    subject: String,
    message: String,
    contacted: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Query = mongoose.models.Query || mongoose.model("Query", querySchema);

// GET all queries
router.get("/", authMiddleware, requireRole("main", "employee"), async (req, res) => {
  try {
    const queries = await Query.find();
    res.json(queries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new query
router.post("/", async (req, res) => {
  try {
    const query = new Query(req.body);
    const savedQuery = await query.save();
    res.status(201).json(savedQuery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT / update query
router.put("/:id", authMiddleware, requireRole("main", "employee"), async (req, res) => {
  try {
    const updatedQuery = await Query.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedQuery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE query
router.delete("/:id", authMiddleware, requireRole("main"), async (req, res) => {
  try {
    await Query.findByIdAndDelete(req.params.id);
    res.json({ message: "Query deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
