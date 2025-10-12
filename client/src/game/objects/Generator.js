import Phaser from 'phaser';

export default class Generator extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, `generator-${type}`);
    
    this.type = type;
    this.productionRate = this.getProductionRate(type);
    this.isProducing = false;
    
    scene.add.existing(this);
    this.setInteractive();
    
    // Set visual properties
    this.setScale(0.5);
    this.setTint(this.getTintColor(type));
    
    // Create production effect
    this.createProductionEffect();
    
    // Add click handler for info
    this.on('pointerdown', () => this.showInfo());
  }
  
  createProductionEffect() {
    // Create particle emitter for production
    this.productionEmitter = this.scene.add.particles('particle-glow').createEmitter({
      follow: this,
      speed: 20,
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
      frequency: 2000 / this.productionRate,
      tint: this.getProductionTint(this.type),
      on: false
    });
    
    // Start production effect
    this.startProduction();
  }
  
  startProduction() {
    this.isProducing = true;
    this.productionEmitter.on = true;
    
    // Add subtle animation
    this.scene.tweens.add({
      targets: this,
      scale: 0.55,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  stopProduction() {
    this.isProducing = false;
    this.productionEmitter.on = false;
    
    // Stop animation
    this.scene.tweens.killTweensOf(this);
    this.setScale(0.5);
  }
  
  getProductionRate(type) {
    switch (type) {
      case 'solar':
        return 1.5;
      case 'miner':
        return 0.3;
      case 'reactor':
        return 8;
      default:
        return 1;
    }
  }
  
  getTintColor(type) {
    switch (type) {
      case 'solar':
        return 0xfbbf24; // Yellow
      case 'miner':
        return 0x8b5cf6; // Purple
      case 'reactor':
        return 0xef4444; // Red
      default:
        return 0x60a5fa; // Blue
    }
  }
  
  getProductionTint(type) {
    switch (type) {
      case 'solar':
        return 0xfbbf24; // Yellow glow
      case 'miner':
        return 0x8b5cf6; // Purple glow
      case 'reactor':
        return 0xef4444; // Red glow
      default:
        return 0x60a5fa; // Blue glow
    }
  }
  
  showInfo() {
    // Create info popup
    const infoText = `${this.type.toUpperCase()} GENERATOR\nProduction: ${this.productionRate}/s\nStatus: ${this.isProducing ? 'Active' : 'Inactive'}`;
    
    const infoPopup = this.scene.add.text(this.x, this.y - 50, infoText, {
      fontSize: '12px',
      color: '#e2e8f0',
      fontFamily: 'Arial',
      backgroundColor: 'rgba(15,23,42,0.9)',
      padding: { x: 8, y: 4 },
      align: 'center'
    }).setOrigin(0.5);
    
    // Auto-hide after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      infoPopup.destroy();
    });
  }
  
  updateProduction(gameState) {
    // Update production based on game state
    if (gameState && gameState.generators) {
      const count = gameState.generators[this.type] || 0;
      if (count > 0 && !this.isProducing) {
        this.startProduction();
      } else if (count === 0 && this.isProducing) {
        this.stopProduction();
      }
    }
  }
}
