const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/game", require("./routes/game"));
app.use("/api/idle", require("./routes/idleGame"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "..", "..", "client", "build");
  app.use(express.static(clientBuildPath));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

module.exports = app;
