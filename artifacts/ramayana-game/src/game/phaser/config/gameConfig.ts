import Phaser from "phaser";

/**
 * Epic Ramayana - Game Configuration
 * 2D Platformer based on Valmiki Ramayana (Bala & Ayodhya Kandas)
 */

export const GAME_CONFIG = {
  // Display settings
  WIDTH: 1280,
  HEIGHT: 720,
  PIXEL_RATIO: window.devicePixelRatio || 1,

  // Physics
  GRAVITY: 800,

  // Player settings
  PLAYER: {
    WALK_SPEED: 150,
    RUN_SPEED: 300,
    JUMP_VELOCITY: -400,
    MAX_HEALTH: 100,
    MAX_MANA: 100,
  },

  // Combat settings
  COMBAT: {
    ARROW_SPEED: 600,
    AIM_SLOW_MOTION: 0.3, // 30% speed during aim
    HEADSHOT_MULTIPLIER: 2.0,
    MARMA_MULTIPLIER: 3.0, // Vital points
    PERFECT_SHOT_WINDOW: 0.2, // seconds
  },

  // Dharma system
  DHARMA: {
    MAX_SCORE: 1000,
    TIERS: {
      APPRENTICE: 200,
      WARRIOR: 400,
      PRINCE: 600,
      DHARMA_WARRIOR: 800,
      MARYADA_PURUSHOTTAM: 1000,
    },
  },

  // Level configuration
  LEVELS: {
    CHECKPOINT_DISTANCE: 500, // pixels
    AUTO_SAVE_INTERVAL: 30000, // ms
  },
};

export const PHASER_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: "phaser-game",
  backgroundColor: "#000000",
  pixelArt: false, // We want smooth traditional art style
  antialias: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: GAME_CONFIG.GRAVITY, x: 0 },
      debug: import.meta.env.DEV, // Debug in development only
      tileBias: 16,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
  },
  render: {
    antialiasGL: true,
    pixelArt: false,
  },
  // Scenes will be added dynamically
  scene: [],
};

export default PHASER_CONFIG;
