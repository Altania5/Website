const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, unique: true, sparse: true },
    passwordHash: { type: String },
    // Legacy plaintext fallback (discouraged):
    webPassword: { type: String },
    roles: { type: [String], default: ["user"] },
    permissions: { type: [String], default: [] },
    tenantId: { type: String, default: "default" },
    features: { type: Object, default: {} },
    status: { type: String, enum: ["active", "suspended"], default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);


