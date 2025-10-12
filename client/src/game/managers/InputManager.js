export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.keys = null;
    this.mousePosition = { x: 0, y: 0 };
    this.lastClickTime = 0;
    this.clickCooldown = 100; // Minimum time between clicks
    
    this.setupKeyboard();
    this.setupMouse();
  }
  
  setupKeyboard() {
    this.keys = this.scene.input.keyboard.addKeys({
      space: 'SPACE',
      enter: 'ENTER',
      escape: 'ESC',
      tab: 'TAB',
      up: 'UP',
      down: 'DOWN',
      left: 'LEFT',
      right: 'RIGHT',
      w: 'W',
      a: 'A',
      s: 'S',
      d: 'D',
      h: 'H',
      g: 'G',
      m: 'M',
      i: 'I',
      e: 'E',
      f: 'F'
    });
    
    // Keyboard shortcuts
    this.keys.space.on('down', () => this.handleSpaceKey());
    this.keys.enter.on('down', () => this.handleEnterKey());
    this.keys.escape.on('down', () => this.handleEscapeKey());
    this.keys.tab.on('down', () => this.handleTabKey());
    this.keys.h.on('down', () => this.handleHarvestKey());
    this.keys.g.on('down', () => this.handleGalaxyKey());
    this.keys.m.on('down', () => this.handleMilitaryKey());
    this.keys.i.on('down', () => this.handleInventoryKey());
    this.keys.e.on('down', () => this.handleEnergyKey());
    this.keys.f.on('down', () => this.handleFrequencyKey());
  }
  
  setupMouse() {
    this.scene.input.on('pointermove', (pointer) => {
      this.mousePosition.x = pointer.x;
      this.mousePosition.y = pointer.y;
    });
    
    this.scene.input.on('pointerdown', (pointer) => {
      this.handleMouseClick(pointer);
    });
    
    // Mouse wheel for zoom
    this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      this.handleMouseWheel(deltaY);
    });
  }
  
  handleSpaceKey() {
    // Harvest planet or perform main action
    this.scene.events.emit('keyboardAction', 'harvest');
  }
  
  handleEnterKey() {
    // Confirm action or open chat
    this.scene.events.emit('keyboardAction', 'confirm');
  }
  
  handleEscapeKey() {
    // Cancel action or open menu
    this.scene.events.emit('keyboardAction', 'cancel');
  }
  
  handleTabKey() {
    // Cycle through UI elements
    this.scene.events.emit('keyboardAction', 'cycle');
  }
  
  handleHarvestKey() {
    // Quick harvest
    this.scene.events.emit('keyboardAction', 'harvest');
  }
  
  handleGalaxyKey() {
    // Open galaxy map
    this.scene.events.emit('keyboardAction', 'galaxy');
  }
  
  handleMilitaryKey() {
    // Open military tab
    this.scene.events.emit('keyboardAction', 'military');
  }
  
  handleInventoryKey() {
    // Open inventory
    this.scene.events.emit('keyboardAction', 'inventory');
  }
  
  handleEnergyKey() {
    // Open energy tab
    this.scene.events.emit('keyboardAction', 'energy');
  }
  
  handleFrequencyKey() {
    // Open frequency tab
    this.scene.events.emit('keyboardAction', 'frequency');
  }
  
  handleMouseClick(pointer) {
    const currentTime = Date.now();
    
    // Prevent rapid clicking
    if (currentTime - this.lastClickTime < this.clickCooldown) {
      return;
    }
    
    this.lastClickTime = currentTime;
    
    // Emit click event with position
    this.scene.events.emit('mouseClick', {
      x: pointer.x,
      y: pointer.y,
      button: pointer.button,
      worldX: pointer.worldX,
      worldY: pointer.worldY
    });
  }
  
  handleMouseWheel(deltaY) {
    // Handle zoom
    this.scene.events.emit('mouseWheel', { deltaY });
  }
  
  getMousePosition() {
    return { ...this.mousePosition };
  }
  
  isKeyPressed(key) {
    return this.keys[key]?.isDown || false;
  }
  
  getKeyState() {
    return {
      space: this.keys.space.isDown,
      enter: this.keys.enter.isDown,
      escape: this.keys.escape.isDown,
      tab: this.keys.tab.isDown,
      up: this.keys.up.isDown,
      down: this.keys.down.isDown,
      left: this.keys.left.isDown,
      right: this.keys.right.isDown,
      w: this.keys.w.isDown,
      a: this.keys.a.isDown,
      s: this.keys.s.isDown,
      d: this.keys.d.isDown
    };
  }
  
  // Utility methods
  isPointerOver(object) {
    return this.scene.input.hitTestPointer(this.scene.input.activePointer, [object]);
  }
  
  getPointerWorldPosition() {
    return {
      x: this.scene.input.activePointer.worldX,
      y: this.scene.input.activePointer.worldY
    };
  }
  
  setClickCooldown(cooldown) {
    this.clickCooldown = cooldown;
  }
  
  destroy() {
    if (this.keys) {
      this.keys = null;
    }
  }
}
