export default class GameStateManager {
  constructor(scene, socket) {
    this.scene = scene;
    this.socket = socket;
    this.gameState = null;
    this.lastUpdate = 0;
    this.updateInterval = 2000; // Update every 2 seconds
    
    this.setupSocketListeners();
  }
  
  setupSocketListeners() {
    this.socket.on('game-state-update', (state) => {
      this.gameState = state;
      this.lastUpdate = Date.now();
      this.scene.registry.set('gameState', state);
      
      // Emit event for other components to listen
      this.scene.events.emit('gameStateChanged', state);
    });
    
    this.socket.on('harvest-result', (result) => {
      this.scene.events.emit('harvestResult', result);
    });
    
    this.socket.on('travel-result', (result) => {
      this.scene.events.emit('travelResult', result);
    });
  }
  
  getGameState() {
    return this.gameState;
  }
  
  harvestPlanet(planetName, count = 1) {
    if (this.socket && this.gameState?.location?.mode === 'planet') {
      this.socket.emit('harvest-planet', { 
        planetName: planetName || this.gameState.location.planet, 
        count 
      });
      return true;
    }
    return false;
  }
  
  travelToPlanet(planetName) {
    if (this.socket) {
      this.socket.emit('travel-to', { planet: planetName });
      return true;
    }
    return false;
  }
  
  buyGenerator(type) {
    if (this.socket) {
      this.socket.emit('buy-generator', { type });
      return true;
    }
    return false;
  }
  
  buildShip() {
    if (this.socket) {
      this.socket.emit('build-ship');
      return true;
    }
    return false;
  }
  
  canAfford(cost) {
    if (!this.gameState?.resources) return false;
    
    const energy = Number(this.gameState.resources.energy || 0);
    const altanerite = Number(this.gameState.resources.altanerite || 0);
    const homainionite = Number(this.gameState.resources.homainionite || 0);
    
    return energy >= (cost.energy || 0) && 
           altanerite >= (cost.altanerite || 0) && 
           homainionite >= (cost.homainionite || 0);
  }
  
  getResourceCount(resource) {
    return Number(this.gameState?.resources?.[resource] || 0);
  }
  
  getProductionRate(resource) {
    if (!this.gameState?.generators) return 0;
    
    let rate = 0;
    
    switch (resource) {
      case 'energy':
        rate += (this.gameState.generators.solarPanels || 0) * 1.5;
        rate += (this.gameState.generators.reactors || 0) * 8;
        break;
      case 'altanerite':
        rate += (this.gameState.generators.miners || 0) * 0.3;
        break;
      case 'homainionite':
        // No generators for homainionite, only manual harvesting
        break;
      default:
        // Unknown resource type
        break;
    }
    
    return rate;
  }
  
  getLocation() {
    return this.gameState?.location || { mode: 'space', planet: null };
  }
  
  isOnPlanet() {
    return this.gameState?.location?.mode === 'planet';
  }
  
  getCurrentPlanet() {
    return this.gameState?.location?.planet || null;
  }
  
  getGeneratorCount(type) {
    return this.gameState?.generators?.[type] || 0;
  }
  
  getShipCount() {
    return this.gameState?.ships || 0;
  }
  
  getMilitaryForces() {
    return this.gameState?.military || {};
  }
  
  getInventory() {
    return this.gameState?.inventory || {};
  }
  
  getSettings() {
    return this.gameState?.settings || {};
  }
  
  updateSettings(settings) {
    if (this.socket) {
      this.socket.emit('update-settings', settings);
      return true;
    }
    return false;
  }
  
  saveGame() {
    if (this.socket) {
      this.socket.emit('save-game');
      return true;
    }
    return false;
  }
  
  loadGame() {
    if (this.socket) {
      this.socket.emit('load-game');
      return true;
    }
    return false;
  }
  
  resetGame() {
    if (this.socket) {
      this.socket.emit('reset-game');
      return true;
    }
    return false;
  }
  
  // Utility methods
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toLocaleString();
  }
  
  getTimeSinceLastUpdate() {
    return Date.now() - this.lastUpdate;
  }
  
  isConnected() {
    return this.socket?.connected || false;
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
