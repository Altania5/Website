const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const mongoose = require("mongoose");

function ensureMongoConnected(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: "Database not connected" });
    return false;
  }
  return true;
}

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    if (!ensureMongoConnected(res)) return;
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: email }] }).lean();

    let isValid = false;
    if (user && user.passwordHash) {
      isValid = await bcrypt.compare(password, user.passwordHash);
    } else if (user && user.webPassword) {
      isValid = password === user.webPassword; // Fallback for legacy plaintext
    }

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: String(user._id), email: user.email || user.username, roles: user.roles || [], permissions: user.permissions || [], tenantId: user.tenantId || "default" },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("/api/auth/login error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me");
    } catch (e) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!ensureMongoConnected(res)) return;
    const user = await User.findById(payload.sub).select("email username").lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("/api/auth/me error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


