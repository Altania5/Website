export default class ParticleManager {
  constructor(scene) {
    this.scene = scene;
    this.emitters = new Map();
    this.particlePools = new Map();
    
    try {
      this.setupParticleEmitters();
    } catch (error) {
      console.error('Error setting up particle emitters:', error);
    }
  }
  
  setupParticleEmitters() {
    // Click effect emitter
    this.emitters.set('click', this.scene.add.particles(0, 0, 'particle-glow', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      on: false,
      tint: 0xfacc15
    }));
    
    // Harvest effect emitter
    this.emitters.set('harvest', this.scene.add.particles(0, 0, 'particle-spark', {
      speed: { min: 30, max: 80 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 1500,
      on: false,
      tint: 0x10b981
    }));
    
    // Generator production emitter
    this.emitters.set('production', this.scene.add.particles(0, 0, 'particle-glow', {
      speed: 20,
      scale: { start: 0.1, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 2000,
      on: false,
      tint: 0x60a5fa
    }));
    
    // Ship trail emitter
    this.emitters.set('shipTrail', this.scene.add.particles(0, 0, 'particle-glow', {
      speed: { min: 10, max: 30 },
      scale: { start: 0.15, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 1000,
      on: false,
      tint: 0x3b82f6
    }));
    
    // Warp effect emitter
    this.emitters.set('warp', this.scene.add.particles(0, 0, 'particle-glow', {
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      on: false,
      tint: 0x8b5cf6
    }));
  }
  
  playEffect(effectName, x, y, options = {}) {
    const emitter = this.emitters.get(effectName);
    if (!emitter) {
      console.warn(`Particle effect '${effectName}' not found`);
      return;
    }
    
    // Configure emitter based on options
    if (options.count) {
      emitter.explode(options.count, x, y);
    } else {
      emitter.setPosition(x, y);
      emitter.on = true;
      
      // Auto-stop after duration
      if (options.duration) {
        this.scene.time.delayedCall(options.duration, () => {
          emitter.on = false;
        });
      }
    }
  }
  
  stopEffect(effectName) {
    const emitter = this.emitters.get(effectName);
    if (emitter) {
      emitter.on = false;
    }
  }
  
  // Specific effect methods
  playClickEffect(x, y, intensity = 1) {
    const count = Math.floor(5 * intensity);
    this.playEffect('click', x, y, { count });
  }
  
  playHarvestEffect(x, y, resourceType = 'altanerite') {
    const tints = {
      energy: 0xfbbf24,
      altanerite: 0x8b5cf6,
      homainionite: 0xef4444
    };
    
    const emitter = this.emitters.get('harvest');
    emitter.setTint(tints[resourceType] || 0x10b981);
    this.playEffect('harvest', x, y, { count: 8 });
  }
  
  playProductionEffect(x, y, generatorType = 'solar') {
    const tints = {
      solar: 0xfbbf24,
      miner: 0x8b5cf6,
      reactor: 0xef4444
    };
    
    const emitter = this.emitters.get('production');
    emitter.setTint(tints[generatorType] || 0x60a5fa);
    emitter.setPosition(x, y);
    emitter.on = true;
  }
  
  stopProductionEffect() {
    this.stopEffect('production');
  }
  
  playShipTrail(x, y, targetX, targetY) {
    const emitter = this.emitters.get('shipTrail');
    emitter.setPosition(x, y);
    emitter.on = true;
    
    // Animate emitter position
    this.scene.tweens.add({
      targets: emitter,
      x: targetX,
      y: targetY,
      duration: 2000,
      onComplete: () => {
        emitter.on = false;
      }
    });
  }
  
  playWarpEffect(x, y) {
    this.playEffect('warp', x, y, { count: 20 });
  }
  
  // Floating number effect
  showFloatingNumber(x, y, text, color = '#facc15', duration = 2000) {
    const floatText = this.scene.add.text(x, y, text, {
      fontSize: '20px',
      color: color,
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: floatText,
      y: floatText.y - 100,
      alpha: 0,
      duration: duration,
      onComplete: () => floatText.destroy()
    });
  }
  
  // Screen shake effect
  shakeScreen(intensity = 1, duration = 500) {
    const camera = this.scene.cameras.main;
    const originalX = camera.x;
    const originalY = camera.y;
    
    this.scene.tweens.add({
      targets: camera,
      x: originalX + (Math.random() - 0.5) * intensity * 10,
      y: originalY + (Math.random() - 0.5) * intensity * 10,
      duration: duration,
      yoyo: true,
      repeat: Math.floor(duration / 100),
      onComplete: () => {
        camera.setPosition(originalX, originalY);
      }
    });
  }
  
  // Ripple effect
  createRipple(x, y, color = 0x60a5fa, maxRadius = 100) {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(2, color, 0.8);
    
    this.scene.tweens.add({
      targets: graphics,
      scaleX: maxRadius / 10,
      scaleY: maxRadius / 10,
      alpha: 0,
      duration: 1000,
      onUpdate: () => {
        graphics.clear();
        graphics.lineStyle(2, color, graphics.alpha);
        graphics.strokeCircle(x, y, 10 * graphics.scaleX);
      },
      onComplete: () => {
        graphics.destroy();
      }
    });
  }
  
  // Cleanup
  destroy() {
    this.emitters.forEach(emitter => {
      emitter.destroy();
    });
    this.emitters.clear();
    this.particlePools.clear();
  }
}
