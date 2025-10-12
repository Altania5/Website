import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  
  preload() {
    // Show loading bar
    this.createLoadingBar();
    
    // Load placeholder sprites (we'll replace with real assets later)
    this.load.image('planet-zwamsha', '/images/zwamsha.gif');
    this.load.image('planet-altanerite', '/images/altanerite-planet.gif');
    this.load.image('planet-homainionite', '/images/homainionite-planet.gif');
    this.load.image('planet-gas', '/images/gas-planet.gif');
    this.load.image('planet-ice', '/images/ice-planet.gif');
    this.load.image('planet-rock', '/images/islands.gif');
    
    // Skip starfield for now to avoid loading errors
    // this.load.image('starfield', '/images/starfield.png');
    
    // Load generator sprites (placeholder circles for now)
    this.load.image('generator-solar', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    this.load.image('generator-miner', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    this.load.image('generator-reactor', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    
    // Load particle textures
    this.load.image('particle-glow', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    this.load.image('particle-spark', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    
    // Load ship sprites
    this.load.image('ship-icon', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    
    // Skip audio loading for now to avoid decode errors
    // this.load.audio('click', 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
    // this.load.audio('harvest', 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
  }
  
  create() {
    this.scene.start('MainScene');
  }
  
  createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);
    
    // Loading text
    this.add.text(width / 2, height / 2 - 50, 'Loading Altanian Conqueror...', {
      fontSize: '24px',
      color: '#e2e8f0',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Progress bar background
    this.add.rectangle(width / 2, height / 2 + 20, 300, 20, 0x1e293b);
    
    // Progress bar fill
    const barFill = this.add.rectangle(width / 2 - 150, height / 2 + 20, 0, 20, 0x3b82f6);
    
    // Progress text
    const progressText = this.add.text(width / 2, height / 2 + 50, '0%', {
      fontSize: '16px',
      color: '#e2e8f0',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Update progress bar
    this.load.on('progress', (progress) => {
      barFill.width = 300 * progress;
      barFill.x = width / 2 - 150 + (300 * progress) / 2;
      progressText.setText(Math.round(progress * 100) + '%');
    });
  }
}
