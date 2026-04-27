import express from "express";
import Admin from "../models/admin.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const getRole = (admin) => admin?.role || "main";
const getJwtSecret = () => process.env.JWT_SECRET || "secretkey";
const getRequestBody = (req) => req.body || {};
const serializeAdmin = (admin) => ({
  _id: admin._id,
  name: admin.username,
  username: admin.username,
  role: getRole(admin),
});

const decodeAuthHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  return jwt.verify(token, getJwtSecret());
};

export const authMiddleware = (req, res, next) => {
  try {
    const decoded = decodeAuthHeader(req);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.admin = {
      id: decoded.id,
      name: decoded.name || decoded.username,
      username: decoded.username || decoded.name,
      role: decoded.role || "main",
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!allowedRoles.includes(req.admin.role)) {
    return res.status(403).json({ message: "Permission denied" });
  }

  next();
};

router.post("/register", async (req, res) => {
  try {
    const body = getRequestBody(req);
    const { name, username, password, role } = body;
    const adminName = (name || username || "").trim().toLowerCase();

    if (!adminName || !password) {
      return res.status(400).json({ message: "Name and password are required" });
    }

    const existingAdmins = await Admin.countDocuments();
    if (existingAdmins > 0) {
      const decoded = decodeAuthHeader(req);
      if (!decoded) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if ((decoded.role || "main") !== "main") {
        return res.status(403).json({ message: "Permission denied" });
      }
    }

    const existing = await Admin.findOne({ username: adminName });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = new Admin({
      username: adminName,
      password,
      role: existingAdmins === 0 ? "main" : role || "employee",
    });
    await admin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: serializeAdmin(admin),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const body = getRequestBody(req);
    const { name, username, password } = body;
    const loginName = (name || username || "").trim().toLowerCase();

    if (!loginName || !password) {
      return res.status(400).json({ message: "Name and password are required" });
    }

    const admin = await Admin.findOne({ username: loginName });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    if (!admin.password) {
      return res.status(500).json({ message: "Admin password is missing" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, name: admin.username, username: admin.username, role: getRole(admin) },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { id: admin._id, name: admin.username, username: admin.username, role: getRole(admin) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: `Welcome ${req.admin.name || req.admin.username} to the Admin Dashboard!`,
    admin: req.admin,
  });
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({ admin: req.admin });
});

router.patch("/me", authMiddleware, async (req, res) => {
  try {
    const body = getRequestBody(req);
    const { name, username } = body;
    const adminName = (name || username || "").trim().toLowerCase();

    if (!adminName) {
      return res.status(400).json({ message: "Name is required" });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const existing = await Admin.findOne({ username: adminName, _id: { $ne: admin._id } });
    if (existing) {
      return res.status(400).json({ message: "Name already exists" });
    }

    admin.username = adminName;
    await admin.save();

    res.json({
      message: "Profile updated successfully",
      admin: serializeAdmin(admin),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/me/password", authMiddleware, async (req, res) => {
  try {
    const body = getRequestBody(req);
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", authMiddleware, requireRole("main"), async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json(admins.map(serializeAdmin));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", authMiddleware, requireRole("main"), async (req, res) => {
  try {
    const body = getRequestBody(req);
    const { name, username, password, role } = body;
    const adminName = (name || username || "").trim().toLowerCase();
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const mainAdminCount = await Admin.countDocuments({ role: "main" });
    const nextRole = role || admin.role;
    if (admin.role === "main" && nextRole !== "main" && mainAdminCount <= 1) {
      return res.status(400).json({ message: "At least one main admin is required." });
    }

    if (adminName) admin.username = adminName;
    if (password && password.trim() !== "") admin.password = password;
    if (role) admin.role = role;

    await admin.save();
    res.json({
      message: "Admin updated successfully",
      admin: serializeAdmin(admin),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authMiddleware, requireRole("main"), async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const mainAdminCount = await Admin.countDocuments({ role: "main" });
    if (admin.role === "main" && mainAdminCount <= 1) {
      return res.status(400).json({ message: "At least one main admin is required." });
    }

    await admin.deleteOne();
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
