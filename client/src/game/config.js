import Phaser from 'phaser';

const gameConfig = {
  type: Phaser.WEBGL,
  width: 1280,
  height: 720,
  parent: 'phaser-container',
  backgroundColor: '#0f172a',
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: []  // Will add scenes
};

export default gameConfig;
