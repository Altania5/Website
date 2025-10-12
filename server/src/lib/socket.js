const socketIO = require('socket.io');

function initializeSocket(server) {
  const io = socketIO(server, {
    cors: { origin: "*" }
  });
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('join-game', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined game room`);
    });
    
    socket.on('authenticate', ({ token }) => {
      // TODO: Verify JWT token and extract userId
      // For now, just acknowledge
      socket.emit('authenticated', { success: true });
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  return io;
}

module.exports = { initializeSocket };
