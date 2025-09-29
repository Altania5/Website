const express = require("express");
const mongoose = require("mongoose");
const { requireAuth, requireRole } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database not connected" });
  }
  const users = await User.find().select("email username roles tenantId status").lean();
  res.json({ users });
});

router.post("/users/:id/roles", async (req, res) => {
  const { roles } = req.body;
  await User.findByIdAndUpdate(req.params.id, { roles: Array.isArray(roles) ? roles : [] });
  res.json({ ok: true });
});

module.exports = router;


