import Phaser from "phaser";
import { AssetGenerator } from "../managers/AssetGenerator";

/**
 * PreloaderScene - Loads all game assets with progress bar
 */
export class PreloaderScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: "PreloaderScene" });
  }

  preload(): void {
    this.createLoadingUI();

    // Set up loading events
    this.load.on("progress", (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0xffd700, 1); // Gold color for Ramayana theme
      this.progressBar.fillRect(
        this.cameras.main.width / 2 - 160,
        this.cameras.main.height / 2 + 50,
        320 * value,
        30,
      );

      this.loadingText.setText(`Loading: ${Math.floor(value * 100)}%`);
    });

    this.load.on("complete", () => {
      this.progressBar.destroy();
      this.progressBox.destroy();
      this.loadingText.destroy();
    });

    // Load all game assets
    this.loadAssets();
  }

  create(): void {
    console.log("PreloaderScene: All assets loaded");

    // Show a "Press to Start" message
    const startText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 100,
        "Press SPACE to Start",
        {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5);

    // Start game on space press
    this.input.keyboard?.once("keydown-SPACE", () => {
      this.scene.start("MainMenuScene");
    });
  }

  private createLoadingUI(): void {
    const { width, height } = this.cameras.main;

    // Title
    const title = this.add
      .text(width / 2, height / 2 - 100, "EPIC RAMAYANA", {
        fontFamily: "Arial",
        fontSize: "48px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Loading text
    this.loadingText = this.add
      .text(width / 2, height / 2, "Loading: 0%", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Progress box (background)
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 2 - 160, height / 2 + 50, 320, 30);

    // Progress bar
    this.progressBar = this.add.graphics();
  }

  private loadAssets(): void {
    // TEMPORARY: Generate placeholder assets
    // These will be replaced with actual traditional Indian art assets

    // Generate all basic placeholder assets
    AssetGenerator.generateAllBasicAssets(this);

    // Future: Load actual assets
    // this.load.image('sky-ayodhya', '/assets/backgrounds/sky-ayodhya.png');
    // this.load.spritesheet('rama', '/assets/sprites/rama/rama-sheet.png', {
    //   frameWidth: 128,
    //   frameHeight: 128
    // });

    console.log("PreloaderScene: Placeholder assets generated");
  }

  private createPlaceholderSprite(key: string, color: number): void {
    // Create a simple colored rectangle as placeholder
    // This will be replaced with actual sprite sheets
    const graphics = this.add.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, 64, 64);

    graphics.generateTexture(key, 64, 64);
    graphics.destroy();
  }
}
