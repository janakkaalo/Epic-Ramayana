import Phaser from "phaser";

/**
 * MainMenuScene - Main menu for Epic Ramayana
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background (placeholder - will be beautiful traditional art)
    this.add.rectangle(0, 0, width, height, 0x1a0a00).setOrigin(0);

    // Title
    const title = this.add
      .text(width / 2, height / 4, "EPIC RAMAYANA", {
        fontFamily: "Arial",
        fontSize: "72px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#8B4513",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Subtitle
    const subtitle = this.add
      .text(width / 2, height / 4 + 80, "Based on Valmiki Ramayana", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#FFA500",
        fontStyle: "italic",
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
        this.scene.start("Level01_ValmikiAshram");
      },
      true,
    ); // Highlight as primary option

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
        console.log("Continue - Load saved game (Coming Soon)");
      },
      false,
    );

    this.createMenuItem(
      "Journey Map",
      menuY + menuSpacing * 3,
      () => {
        console.log("Journey Map - View completed levels (Coming Soon)");
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

    // Instructions
    const instructions = this.add
      .text(
        width / 2,
        height - 50,
        "Arrow Keys: Move | SPACE: Aim/Shoot | SHIFT: Run",
        {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#CCCCCC",
        },
      )
      .setOrigin(0.5);
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
}
