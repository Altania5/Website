import Phaser from 'phaser';
import GameStateManager from '../managers/GameStateManager';
import InputManager from '../managers/InputManager';
import ParticleManager from '../managers/ParticleManager';

export default class GalaxyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GalaxyScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#0f172a');

    // Get socket from registry
    this.socket = this.registry.get('socket');

    // Initialize managers
    this.gameStateManager = new GameStateManager(this, this.socket);
    this.inputManager = new InputManager(this);
    this.particleManager = new ParticleManager(this);

    // Get managers from MainScene if available
    const mainScene = this.scene.get('MainScene');
    if (mainScene) {
      this.statsManager = mainScene.statsManager;
      this.questManager = mainScene.questManager;
    }

    // Get initial game state
    this.gameState = this.gameStateManager.getGameState() || {};

    // Create star background
    this.createStarfield();

    // Create central star
    this.createCentralStar();

    // Create planets in orbit
    this.createPlanetOrbits();

    // Create ship indicator
    this.createPlayerShip();

    // Add navigation controls
    this.createNavigationControls();
  }
  
  createStarfield() {
    // Create individual stars for better effect
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, 1280);
      const y = Phaser.Math.Between(0, 720);
      const size = Phaser.Math.Between(1, 3);
      
      const star = this.add.circle(x, y, size, 0xffffff, 0.8);
      
      // Twinkle effect
      this.tweens.add({
        targets: star,
        alpha: 0.3,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  createCentralStar() {
    this.star = this.add.circle(640, 360, 30, 0xfbbf24, 0.8);
    
    // Glow effect
    this.tweens.add({
      targets: this.star,
      scale: 1.2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Add star label
    this.add.text(640, 420, 'Zwamsha System', {
      fontSize: '16px',
      color: '#fbbf24',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
  }
  
  createPlanetOrbits() {
    this.planets = [];
    
    // Define planet orbits
    const planetData = [
      { name: 'Zwamsha', distance: 100, angle: 0, type: 'zwamsha' },
      { name: 'Altania', distance: 200, angle: 120, type: 'altanerite' },
      { name: 'Homainia', distance: 300, angle: 240, type: 'homainionite' }
    ];
    
    planetData.forEach(planet => {
      this.createPlanetOrbit(planet.name, planet.distance, planet.angle, planet.type);
    });
  }
  
  createPlanetOrbit(name, distance, angle, type) {
    const x = 640 + Math.cos(angle * Math.PI / 180) * distance;
    const y = 360 + Math.sin(angle * Math.PI / 180) * distance;
    
    // Create planet sprite
    const planet = this.add.sprite(x, y, `planet-${type}`)
      .setInteractive()
      .setScale(0.8)
      .on('pointerdown', () => this.travelToPlanet(name));
    
    // Add planet name
    const label = this.add.text(x, y + 40, name, {
      fontSize: '12px',
      color: '#e2e8f0',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);
    
    // Orbit line
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x4a5568, 0.3);
    graphics.strokeCircle(640, 360, distance);
    
    // Store planet data
    this.planets.push({
      sprite: planet,
      label: label,
      name: name,
      distance: distance,
      angle: angle,
      graphics: graphics
    });
    
    // Hover effect
    planet.on('pointerover', () => {
      this.tweens.add({
        targets: planet,
        scale: 1,
        duration: 200,
        ease: 'Power2'
      });
    });
    
    planet.on('pointerout', () => {
      this.tweens.add({
        targets: planet,
        scale: 0.8,
        duration: 200,
        ease: 'Power2'
      });
    });
  }
  
  createPlayerShip() {
    this.playerShip = this.add.sprite(640, 360, 'ship-icon')
      .setScale(0.5)
      .setTint(0x60a5fa);
    
    // Update ship position based on current location
    this.updateShipPosition();
  }
  
  updateShipPosition() {
    if (this.gameState.location) {
      const currentPlanet = this.planets.find(p => p.name === this.gameState.location.planet);
      if (currentPlanet) {
        this.playerShip.setPosition(currentPlanet.sprite.x, currentPlanet.sprite.y - 30);
      }
    }
  }
  
  createNavigationControls() {
    // Add navigation buttons
    const backButton = this.add.text(50, 50, '← Back to Base', {
      fontSize: '16px',
      color: '#e2e8f0',
      fontFamily: 'Arial',
      backgroundColor: '#1e293b',
      padding: { x: 10, y: 5 }
    }).setInteractive();
    
    backButton.on('pointerdown', () => {
      this.scene.start('MainScene');
    });
    
    // Add system info
    this.add.text(50, 100, 'Click on planets to travel', {
      fontSize: '14px',
      color: '#94a3b8',
      fontFamily: 'Arial'
    });
  }
  
  travelToPlanet(planetName) {
    if (!this.gameStateManager.isConnected()) {
      this.showMessage('Not connected to server!', '#ef4444');
      return;
    }

    // Find target planet
    const targetPlanet = this.planets.find(p => p.name === planetName);
    if (!targetPlanet) return;

    // Animate ship moving
    this.tweens.add({
      targets: this.playerShip,
      x: targetPlanet.sprite.x,
      y: targetPlanet.sprite.y - 30,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        // Use game state manager to travel
        const success = this.gameStateManager.travelToPlanet(planetName);

        if (success) {
          // Track travel for stats and quests
          if (this.statsManager) {
            this.statsManager.trackTravel(planetName);
          }
          if (this.questManager) {
            this.questManager.trackAction('visit_planets');
          }

          // Show warp effect
          this.particleManager.playWarpEffect(targetPlanet.sprite.x, targetPlanet.sprite.y);

          // Show message
          this.showMessage(`Traveling to ${planetName}...`, '#10b981');

          // Switch to main scene after delay
          this.time.delayedCall(1000, () => {
            this.scene.start('MainScene');
          });
        }
      }
    });
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
  
  update(time, delta) {
    // Animate orbiting planets
    this.planets.forEach(planet => {
      planet.angle += 0.1;
      const x = 640 + Math.cos(planet.angle * Math.PI / 180) * planet.distance;
      const y = 360 + Math.sin(planet.angle * Math.PI / 180) * planet.distance;
      
      planet.sprite.setPosition(x, y);
      planet.label.setPosition(x, y + 40);
    });
  }
}
