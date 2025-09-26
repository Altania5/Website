const mongoose = require("mongoose");

const connectDatabase = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("MONGO_URI is not set. Skipping MongoDB connection.");
    return;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
