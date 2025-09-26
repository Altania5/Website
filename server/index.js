require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDatabase = require("./src/lib/database");

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDatabase();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();
