require("dotenv").config({ path: '../process.env' });
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'present' : 'missing');
const http = require("http");
const app = require("./src/app");
const connectDatabase = require("./src/lib/database");
const { initializeSocket } = require("./src/lib/socket");
const { setupSocketHandlers } = require("./src/routes/socket-handlers");

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDatabase();

  const server = http.createServer(app);
  
  // Initialize Socket.io
  const io = initializeSocket(server);
  
  // Setup socket handlers
  setupSocketHandlers(io);
  
  // Make io available to routes
  app.set('io', io);

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();
