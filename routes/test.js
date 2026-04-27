import express from "express";
import Testimonial from "../models/test.js";
import { authMiddleware, requireRole } from "./admin.js";

const router = express.Router();

// GET all testimonials
router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new testimonial
router.post("/", authMiddleware, requireRole("main"), async (req, res) => {
  try {
    const { name, role, company, rating, text } = req.body;
    const testimonial = new Testimonial({ name, role, company, rating, text });
    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE testimonial
router.delete("/:id", authMiddleware, requireRole("main"), async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE testimonial
router.put("/:id", authMiddleware, requireRole("main", "employee"), async (req, res) => {
  try {
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


export default router;
