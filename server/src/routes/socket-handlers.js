const jwt = require('jsonwebtoken');
const Game = require('../models/Game');
const User = require('../models/User');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Authenticate user
    socket.on('authenticate', async ({ token }) => {
      try {
        console.log('Socket authentication attempt:', { 
          token: token ? 'present' : 'missing', 
          tokenLength: token?.length,
          jwtSecret: process.env.JWT_SECRET ? 'present' : 'missing'
        });
        
        if (!token) {
          socket.emit('authenticated', { success: false, error: 'No token provided' });
          return;
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('JWT decoded successfully:', { userId: decoded.sub || decoded.userId });

        const user = await User.findById(decoded.sub || decoded.userId);
        
        if (!user) {
          socket.emit('authenticated', { success: false, error: 'User not found' });
          return;
        }
        
        socket.userId = user._id;
        socket.emit('authenticated', { success: true, userId: user._id });
        
        // Join user's game room
        socket.join(`user-${user._id}`);
        
        // Send initial game state
        const game = await Game.findOne({ userId: user._id });
        if (game) {
          socket.emit('game-state-update', game);
        }
        
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('authenticated', { success: false, error: 'Invalid token' });
      }
    });
    
    // Join game room
    socket.on('join-game', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined game room`);
    });
    
    // Harvest planet
    socket.on('harvest-planet', async ({ planetName, count = 1 }) => {
      if (!socket.userId) {
        socket.emit('harvest-result', { success: false, error: 'Not authenticated' });
        return;
      }
      
      try {
        const game = await Game.findOne({ userId: socket.userId });
        if (!game) {
          socket.emit('harvest-result', { success: false, error: 'Game not found' });
          return;
        }
        
        // Check if player is on the specified planet
        if (game.location.mode !== 'planet' || game.location.planet !== planetName) {
          socket.emit('harvest-result', { success: false, error: 'Not on the correct planet' });
          return;
        }
        
        // Calculate harvest amount
        const baseHarvest = 5;
        const shipBonus = game.ships * 0.1;
        const totalHarvest = Math.floor(baseHarvest * count * (1 + shipBonus));
        
        // Update resources
        game.resources.altanerite += totalHarvest;
        await game.save();
        
        // Emit result
        socket.emit('harvest-result', { 
          success: true, 
          altanerite: totalHarvest,
          total: game.resources.altanerite
        });
        
        // Broadcast to user's room
        socket.to(`user-${socket.userId}`).emit('game-state-update', game);
        
      } catch (error) {
        console.error('Harvest error:', error);
        socket.emit('harvest-result', { success: false, error: 'Server error' });
      }
    });
    
    // Travel to planet
    socket.on('travel-to', async ({ planet }) => {
      if (!socket.userId) {
        socket.emit('travel-result', { success: false, error: 'Not authenticated' });
        return;
      }
      
      try {
        const game = await Game.findOne({ userId: socket.userId });
        if (!game) {
          socket.emit('travel-result', { success: false, error: 'Game not found' });
          return;
        }
        
        // Update location
        game.location = {
          mode: 'planet',
          planet: planet,
          system: 'Zwamsha'
        };
        
        await game.save();
        
        // Emit result
        socket.emit('travel-result', { 
          success: true, 
          location: game.location
        });
        
        // Broadcast to user's room
        socket.to(`user-${socket.userId}`).emit('game-state-update', game);
        
      } catch (error) {
        console.error('Travel error:', error);
        socket.emit('travel-result', { success: false, error: 'Server error' });
      }
    });
    
    // Buy generator
    socket.on('buy-generator', async ({ type }) => {
      if (!socket.userId) {
        socket.emit('buy-result', { success: false, error: 'Not authenticated' });
        return;
      }
      
      try {
        const game = await Game.findOne({ userId: socket.userId });
        if (!game) {
          socket.emit('buy-result', { success: false, error: 'Game not found' });
          return;
        }
        
        // Define costs
        const costs = {
          solar: { energy: 100, altanerite: 0 },
          miner: { energy: 50, altanerite: 5 },
          reactor: { energy: 200, altanerite: 10 }
        };
        
        const cost = costs[type];
        if (!cost) {
          socket.emit('buy-result', { success: false, error: 'Invalid generator type' });
          return;
        }
        
        // Check if player can afford
        if (game.resources.energy < cost.energy || game.resources.altanerite < cost.altanerite) {
          socket.emit('buy-result', { success: false, error: 'Insufficient resources' });
          return;
        }
        
        // Deduct costs
        game.resources.energy -= cost.energy;
        game.resources.altanerite -= cost.altanerite;
        
        // Add generator
        game.generators[type] = (game.generators[type] || 0) + 1;
        
        await game.save();
        
        // Emit result
        socket.emit('buy-result', { 
          success: true, 
          type: type,
          count: game.generators[type]
        });
        
        // Broadcast to user's room
        socket.to(`user-${socket.userId}`).emit('game-state-update', game);
        
      } catch (error) {
        console.error('Buy generator error:', error);
        socket.emit('buy-result', { success: false, error: 'Server error' });
      }
    });
    
    // Build ship
    socket.on('build-ship', async () => {
      if (!socket.userId) {
        socket.emit('build-result', { success: false, error: 'Not authenticated' });
        return;
      }
      
      try {
        const game = await Game.findOne({ userId: socket.userId });
        if (!game) {
          socket.emit('build-result', { success: false, error: 'Game not found' });
          return;
        }
        
        // Check if player can afford
        if (game.resources.energy < 300 || game.resources.altanerite < 5) {
          socket.emit('build-result', { success: false, error: 'Insufficient resources' });
          return;
        }
        
        // Deduct costs
        game.resources.energy -= 300;
        game.resources.altanerite -= 5;
        
        // Add ship
        game.ships = (game.ships || 0) + 1;
        
        await game.save();
        
        // Emit result
        socket.emit('build-result', { 
          success: true, 
          ships: game.ships
        });
        
        // Broadcast to user's room
        socket.to(`user-${socket.userId}`).emit('game-state-update', game);
        
      } catch (error) {
        console.error('Build ship error:', error);
        socket.emit('build-result', { success: false, error: 'Server error' });
      }
    });
    
    // Disconnect handler
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

module.exports = { setupSocketHandlers };
