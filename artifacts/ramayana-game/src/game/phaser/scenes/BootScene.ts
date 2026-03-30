import Phaser from "phaser";

/**
 * BootScene - Initial scene that loads essential assets
 * This scene runs before the preloader
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    // Generate placeholder loading assets
    this.generateLoadingAssets();
  }

  create(): void {
    console.log("BootScene: Assets loaded, moving to Preloader");
    this.scene.start("PreloaderScene");
  }

  private generateLoadingAssets(): void {
    const graphics = this.add.graphics();

    // Loading background
    graphics.fillStyle(0x222222);
    graphics.fillRect(0, 0, 400, 50);
    graphics.generateTexture("loading-bg", 400, 50);

    // Loading bar
    graphics.clear();
    graphics.fillStyle(0x00ff00);
    graphics.fillRect(0, 0, 400, 40);
    graphics.generateTexture("loading-bar", 400, 40);

    // Logo
    graphics.clear();
    graphics.fillStyle(0xff6600);
    graphics.fillCircle(64, 64, 60);
    graphics.generateTexture("logo", 128, 128);

    graphics.destroy();
  }
}
