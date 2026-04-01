import Phaser from "phaser";
import { getProgressionManager } from "../managers/LevelProgressionManager";

/**
 * MainMenuScene - Main menu for Epic Ramayana
 */
export class MainMenuScene extends Phaser.Scene {
  private levelSelectOverlay?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "MainMenuScene" });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Enhanced background with gradient
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x0a0a0a, 0x0a0a0a, 0x1a0a00, 0x2d1b0f, 1);
    bgGraphics.fillRect(0, 0, width, height);
    bgGraphics.setDepth(-100);

    // Decorative ornate corners
    this.createOrnateCorner(10, 10, 100, 100, true);
    this.createOrnateCorner(width - 110, 10, 100, 100, false);
    this.createOrnateCorner(10, height - 110, 100, 100, false);
    this.createOrnateCorner(width - 110, height - 110, 100, 100, true);

    // Title with enhanced styling
    const title = this.add
      .text(width / 2, height / 4, "EPIC RAMAYANA", {
        fontFamily: "serif",
        fontSize: "72px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#8B4513",
        strokeThickness: 6,
        shadow: {
          offsetX: 4,
          offsetY: 4,
          color: "#000000",
          blur: 8,
          fill: true,
        },
      })
      .setOrigin(0.5);

    // Shimmer effect on title
    this.tweens.add({
      targets: title,
      alpha: { from: 0.8, to: 1 },
      duration: 2000,
      repeat: -1,
      yoyo: true,
    });

    // Subtitle with improved styling
    const subtitle = this.add
      .text(width / 2, height / 4 + 80, "Based on Valmiki Ramayana", {
        fontFamily: "serif",
        fontSize: "24px",
        color: "#FFA500",
        fontStyle: "italic",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Menu options
    const menuY = height / 2 + 30;
    const menuSpacing = 60;

    // Story Mode - Start from Level 1
    this.createMenuItem(
      "Story Mode",
      menuY,
      () => {
        const progressionManager = getProgressionManager();
        progressionManager.clearProgress();
        this.scene.start("Level01_ValmikiAshram");
      },
      true,
    );

    // Test Level - Combat demo
    this.createMenuItem(
      "Test Level (Demo)",
      menuY + menuSpacing,
      () => {
        this.scene.start("TestLevelScene");
      },
      false,
    );

    this.createMenuItem(
      "Continue",
      menuY + menuSpacing * 2,
      () => {
        const progressionManager = getProgressionManager();
        const continueLevel = progressionManager.getContinueLevelKey();
        this.scene.start(continueLevel);
      },
      false,
    );

    this.createMenuItem(
      "Level Select",
      menuY + menuSpacing * 3,
      () => {
        this.showLevelSelect();
      },
      false,
    );

    this.createMenuItem(
      "Settings",
      menuY + menuSpacing * 4,
      () => {
        console.log("Settings (Coming Soon)");
      },
      false,
    );

    // Enhanced instructions
    const instructions = this.add
      .text(
        width / 2,
        height - 50,
        "Arrow Keys: Move | SPACE: Aim/Shoot | SHIFT: Run | 1-5: Select Astras",
        {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#CCCCCC",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 },
          stroke: "#FFFFFF",
          strokeThickness: 1,
        },
      )
      .setOrigin(0.5);

    // Add animated particles (optional background effect)
    this.createParticleBackground();
  }

  /**
   * Create ornate corner decorations
   */
  private createOrnateCorner(
    x: number,
    y: number,
    w: number,
    h: number,
    topLeft: boolean,
  ): void {
    const corner = this.add.graphics();
    corner.lineStyle(3, 0xffd700);

    if (topLeft) {
      // Top-left corner
      corner.beginPath();
      corner.moveTo(x, y + 30);
      corner.lineTo(x, y);
      corner.lineTo(x + 30, y);
      corner.strokePath();

      // Decorative dots
      corner.fillStyle(0xffd700);
      corner.fillCircle(x + 8, y + 8, 2);
      corner.fillCircle(x + 16, y + 8, 2);
      corner.fillCircle(x + 8, y + 16, 2);
    } else {
      // Other corners
      corner.beginPath();
      corner.moveTo(x, y);
      corner.lineTo(x + 30, y);
      corner.lineTo(x + 30, y + 30);
      corner.strokePath();

      corner.fillStyle(0xffd700);
      corner.fillCircle(x + 8, y + 8, 2);
      corner.fillCircle(x + 16, y + 8, 2);
      corner.fillCircle(x + 16, y + 16, 2);
    }

    corner.setDepth(1);
  }

  /**
   * Create subtle particle background effect
   */
  private createParticleBackground(): void {
    // Subtle floating effects
    for (let i = 0; i < 10; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, this.cameras.main.width),
        Phaser.Math.Between(0, this.cameras.main.height),
        Phaser.Math.Between(1, 3),
        0xffd700,
        0.2,
      );
      particle.setDepth(-50);

      this.tweens.add({
        targets: particle,
        y: "+=50",
        alpha: { from: 0.2, to: 0 },
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        delay: i * 300,
      });
    }
  }

  private createMenuItem(
    text: string,
    y: number,
    callback: () => void,
    isPrimary: boolean = false,
  ): void {
    const menuItem = this.add
      .text(this.cameras.main.width / 2, y, text, {
        fontFamily: "Arial",
        fontSize: isPrimary ? "36px" : "32px",
        color: isPrimary ? "#FFD700" : "#FFFFFF",
        fontStyle: isPrimary ? "bold" : "normal",
      })
      .setOrigin(0.5)
      .setInteractive();

    // Hover effects
    menuItem.on("pointerover", () => {
      menuItem.setColor("#FFD700");
      menuItem.setScale(1.1);
    });

    menuItem.on("pointerout", () => {
      menuItem.setColor(isPrimary ? "#FFD700" : "#FFFFFF");
      menuItem.setScale(1);
    });

    menuItem.on("pointerdown", callback);
  }

  private showLevelSelect(): void {
    if (this.levelSelectOverlay) {
      this.levelSelectOverlay.setVisible(true);
      return;
    }

    const { width, height } = this.cameras.main;
    const progressionManager = getProgressionManager();
    const levels = progressionManager.getAllLevels();

    const playableLevels = new Set<string>([
      "Level01_ValmikiAshram",
      "Level02_SacredYajna",
      "Level03_BrothersTraining",
      "Level04_SagesRequest",
      "Level05_TatakasTerror",
    ]);

    const dim = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.72)
      .setOrigin(0)
      .setInteractive();
    dim.on("pointerdown", () => this.hideLevelSelect());

    const panel = this.add
      .rectangle(width / 2, height / 2, width * 0.78, height * 0.84, 0x101b10, 0.95)
      .setStrokeStyle(3, 0xdeb650);

    const title = this.add
      .text(width / 2, 82, "Level Select", {
        fontFamily: "serif",
        fontSize: "40px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(width / 2, 118, "Select an unlocked level. Later Kandas are coming soon.", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#DDDDDD",
      })
      .setOrigin(0.5);

    const closeButton = this.add
      .text(width / 2 + width * 0.35, 82, "[Close]", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#FFFFFF",
      })
      .setOrigin(0.5)
      .setInteractive();
    closeButton.on("pointerdown", () => this.hideLevelSelect());

    const overlayChildren: Phaser.GameObjects.GameObject[] = [
      dim,
      panel,
      title,
      subtitle,
      closeButton,
    ];

    let y = 160;
    let currentKanda = "";

    for (const level of levels) {
      if (level.kanda !== currentKanda) {
        currentKanda = level.kanda;
        const kandaHeader = this.add.text(width / 2 - width * 0.34, y, `${currentKanda} Kanda`, {
          fontFamily: "serif",
          fontSize: "24px",
          color: "#FFD700",
          fontStyle: "bold",
        });
        overlayChildren.push(kandaHeader);
        y += 34;
      }

      const implemented = playableLevels.has(level.key);
      const unlocked = level.unlocked;

      let suffix = "";
      let color = "#9E9E9E";
      if (!implemented) {
        suffix = " - Coming Soon";
        color = "#7A7A7A";
      } else if (!unlocked) {
        suffix = " - Locked";
        color = "#8F8F8F";
      } else {
        color = "#FFFFFF";
      }

      const levelLine = this.add
        .text(
          width / 2 - width * 0.34,
          y,
          `${level.order}. ${level.name}${suffix}`,
          {
            fontFamily: "Arial",
            fontSize: "20px",
            color,
          },
        )
        .setOrigin(0, 0);

      if (implemented && unlocked) {
        levelLine.setInteractive();
        levelLine.on("pointerover", () => levelLine.setColor("#FFD700"));
        levelLine.on("pointerout", () => levelLine.setColor("#FFFFFF"));
        levelLine.on("pointerdown", () => {
          this.hideLevelSelect();
          this.scene.start(level.key);
        });
      }

      overlayChildren.push(levelLine);
      y += 30;
    }

    this.levelSelectOverlay = this.add.container(0, 0, overlayChildren);
    this.levelSelectOverlay.setDepth(2000);
  }

  private hideLevelSelect(): void {
    if (!this.levelSelectOverlay) {
      return;
    }

    this.levelSelectOverlay.destroy(true);
    this.levelSelectOverlay = undefined;
  }
}
