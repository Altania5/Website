const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../src/models/User");

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI not set");
    await mongoose.connect(uri);
    const targetEmail = process.env.ADMIN_EMAIL || "22konopelskialexande@gmail.com";
    const user = await User.findOne({ email: targetEmail.toLowerCase() });
    if (!user) throw new Error(`User not found: ${targetEmail}`);
    user.roles = Array.from(new Set([...(user.roles || []), "admin"]));
    await user.save();
    console.log(`Granted admin to ${targetEmail}`);
    process.exit(0);
  } catch (e) {
    console.error("Seed admin failed:", e.message);
    process.exit(1);
  }
})();


