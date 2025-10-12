import Phaser from 'phaser';
import GameStateManager from '../managers/GameStateManager';
import InputManager from '../managers/InputManager';
import ParticleManager from '../managers/ParticleManager';
import Generator from '../objects/Generator';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }
  
  create() {
    this.cameras.main.setBackgroundColor('#0f172a');
    
    // Get socket from registry
    this.socket = this.registry.get('socket');
    
    try {
      // Initialize managers
      this.gameStateManager = new GameStateManager(this, this.socket);
      this.inputManager = new InputManager(this);
      this.particleManager = new ParticleManager(this);
      
      // Get initial game state
      this.gameState = this.gameStateManager.getGameState() || {};
      
      // Create game elements
      this.createPlanet();
      this.createBaseGrid();
      this.createGenerators();
      
      // Setup event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Error in MainScene create:', error);
      // Show error message
      this.add.text(640, 360, 'Game initialization failed', {
        fontSize: '24px',
        color: '#ef4444',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }
  }
  
  createPlanet() {
    const planetType = this.gameState.location?.planet?.toLowerCase() || 'zwamsha';
    const planetKey = `planet-${planetType}`;
    
    this.planet = this.add.sprite(640, 360, planetKey)
      .setInteractive()
      .setScale(2)
      .on('pointerdown', () => this.harvestPlanet());
      
    // Idle animation - gentle rotation
    this.tweens.add({
      targets: this.planet,
      angle: 360,
      duration: 60000,
      repeat: -1,
      ease: 'Linear'
    });
    
    // Add planet name label
    this.planetLabel = this.add.text(640, 500, this.gameState.location?.planet || 'Unknown Planet', {
      fontSize: '16px',
      color: '#e2e8f0',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Add hover effect
    this.planet.on('pointerover', () => {
      this.tweens.add({
        targets: this.planet,
        scale: 2.1,
        duration: 200,
        ease: 'Power2'
      });
    });
    
    this.planet.on('pointerout', () => {
      this.tweens.add({
        targets: this.planet,
        scale: 2,
        duration: 200,
        ease: 'Power2'
      });
    });
  }
  
  createBaseGrid() {
    // Create isometric-style base grid on the left side
    this.baseGrid = this.add.grid(200, 360, 300, 300, 32, 32, 0x1e293b, 0.2);
    
    // Add grid lines for better visibility
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x374151, 0.3);
    
    for (let i = 0; i <= 10; i++) {
      const x = 50 + i * 30;
      const y = 210 + i * 30;
      graphics.moveTo(x, 210);
      graphics.lineTo(x, 510);
      graphics.moveTo(50, y);
      graphics.lineTo(350, y);
    }
    graphics.strokePath();
  }
  
  setupEventListeners() {
    // Listen for game state changes
    this.events.on('gameStateChanged', (state) => {
      this.gameState = state;
      this.updateGenerators();
    });
    
    // Listen for keyboard actions
    this.events.on('keyboardAction', (action) => {
      switch (action) {
        case 'harvest':
          this.harvestPlanet();
          break;
        case 'galaxy':
          this.scene.start('GalaxyScene');
          break;
        default:
          // Unknown action
          break;
      }
    });
    
    // Listen for mouse clicks
    this.events.on('mouseClick', (pointer) => {
      // Handle general mouse clicks if needed
    });
    
    // Listen for harvest results
    this.events.on('harvestResult', (result) => {
      if (result.success) {
        this.particleManager.showFloatingNumber(
          this.planet.x, 
          this.planet.y, 
          `+${result.altanerite} Altanerite`,
          '#8b5cf6'
        );
      }
    });
    
    // Add keyboard controls
    this.input.keyboard.on('keydown-SPACE', () => {
      this.harvestPlanet();
    });
    
    this.input.keyboard.on('keydown-G', () => {
      this.scene.start('GalaxyScene');
    });
    
    this.input.keyboard.on('keydown-H', () => {
      this.harvestPlanet();
    });
    
    this.input.keyboard.on('keydown-M', () => {
      // Toggle minimap or show military
      this.showMessage('Military forces: ' + (this.gameState?.military?.total || 0), '#ef4444');
    });
    
    this.input.keyboard.on('keydown-I', () => {
      // Show inventory
      this.showMessage('Inventory: ' + Object.keys(this.gameState?.inventory || {}).length + ' items', '#8b5cf6');
    });
    
    this.input.keyboard.on('keydown-E', () => {
      // Show energy production
      const energyRate = this.gameStateManager.getProductionRate('energy');
      this.showMessage(`Energy production: ${energyRate.toFixed(1)}/s`, '#fbbf24');
    });
    
    this.input.keyboard.on('keydown-F', () => {
      // Show frequency manipulator
      this.showMessage('Frequency Manipulator: Not implemented yet', '#10b981');
    });
  }
  
  createGenerators() {
    this.generators = [];
    
    if (this.gameState.generators) {
      const generatorTypes = ['solar', 'miner', 'reactor'];
      let generatorIndex = 0;
      
      generatorTypes.forEach(type => {
        const count = this.gameState.generators[type] || 0;
        for (let i = 0; i < count; i++) {
          const x = 100 + (generatorIndex % 5) * 40;
          const y = 300 + Math.floor(generatorIndex / 5) * 40;
          
          const generator = new Generator(this, x, y, type);
          this.generators.push(generator);
          generatorIndex++;
        }
      });
    }
  }
  
  harvestPlanet() {
    if (!this.gameStateManager.isOnPlanet()) {
      this.showMessage('You must be on a planet to harvest!', '#ef4444');
      return;
    }
    
    // Use game state manager to harvest
    const success = this.gameStateManager.harvestPlanet();
    
    if (success) {
      // Visual feedback
      this.particleManager.playClickEffect(this.planet.x, this.planet.y, 1);
      
      // Play sound if available (disabled for now)
      // if (this.sound.get('harvest')) {
      //   this.sound.play('harvest');
      // }
      
      // Pulse animation
      this.tweens.add({
        targets: this.planet,
        scale: 2.2,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
    }
  }
  
  showFloatingNumber(text, color = '#facc15') {
    this.particleManager.showFloatingNumber(this.planet.x, this.planet.y, text, color);
  }
  
  showMessage(text, color = '#e2e8f0') {
    const message = this.add.text(640, 100, text, {
      fontSize: '18px',
      color: color,
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: message,
      alpha: 0,
      duration: 3000,
      onComplete: () => message.destroy()
    });
  }
  
  updateGenerators() {
    // Update generator count based on game state
    if (this.gameState.generators) {
      // Clear existing generators
      this.generators.forEach(gen => gen.destroy());
      this.generators = [];
      
      // Recreate generators
      this.createGenerators();
      
      // Update production effects
      this.generators.forEach(gen => {
        gen.updateProduction(this.gameState);
      });
    }
  }
  
  update(time, delta) {
    // Update any animations or effects
    if (this.planet) {
      // Subtle breathing effect
      const breathScale = 2 + Math.sin(time * 0.001) * 0.05;
      this.planet.setScale(breathScale);
    }
  }
}
