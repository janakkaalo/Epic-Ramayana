import Phaser from "phaser";

/**
 * PauseMenu - Reusable pause menu system
 * Press ESC to pause any level and return to main menu
 */
export class PauseMenu {
  private scene: Phaser.Scene;
  private isPaused: boolean = false;
  private pauseContainer?: Phaser.GameObjects.Container;
  private escapeKey?: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupEscapeKey();
  }

  private setupEscapeKey(): void {
    if (!this.scene.input.keyboard) return;

    this.escapeKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );

    this.escapeKey.on("down", () => {
      this.togglePause();
    });
  }

  togglePause(): void {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  pause(): void {
    if (this.isPaused) return;

    this.isPaused = true;
    this.scene.physics.pause();
    this.createPauseUI();
  }

  resume(): void {
    if (!this.isPaused) return;

    this.isPaused = false;
    this.scene.physics.resume();
    this.destroyPauseUI();
  }

  private createPauseUI(): void {
    const { width, height } = this.scene.cameras.main;

    // Create container
    this.pauseContainer = this.scene.add.container(0, 0);
    this.pauseContainer.setScrollFactor(0);
    this.pauseContainer.setDepth(10000);

    // Semi-transparent overlay
    const overlay = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0);
    this.pauseContainer.add(overlay);

    // Pause title
    const title = this.scene.add
      .text(width / 2, height / 3, "PAUSED", {
        fontFamily: "Arial",
        fontSize: "64px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#8B4513",
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.pauseContainer.add(title);

    // Menu options
    const menuY = height / 2;
    const menuSpacing = 60;

    // Resume
    const resumeButton = this.createButton(
      width / 2,
      menuY,
      "Resume",
      () => {
        this.resume();
      },
      true,
    );
    this.pauseContainer.add(resumeButton);

    // Restart Level
    const restartButton = this.createButton(
      width / 2,
      menuY + menuSpacing,
      "Restart Level",
      () => {
        this.resume();
        this.scene.scene.restart();
      },
      false,
    );
    this.pauseContainer.add(restartButton);

    // Main Menu
    const mainMenuButton = this.createButton(
      width / 2,
      menuY + menuSpacing * 2,
      "Main Menu",
      () => {
        this.resume();
        this.scene.scene.start("MainMenuScene");
      },
      false,
    );
    this.pauseContainer.add(mainMenuButton);

    // Instructions
    const instructions = this.scene.add
      .text(width / 2, height - 50, "Press ESC to Resume", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#CCCCCC",
      })
      .setOrigin(0.5);
    this.pauseContainer.add(instructions);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void,
    isPrimary: boolean = false,
  ): Phaser.GameObjects.Text {
    const button = this.scene.add
      .text(x, y, text, {
        fontFamily: "Arial",
        fontSize: isPrimary ? "36px" : "32px",
        color: isPrimary ? "#FFD700" : "#FFFFFF",
        fontStyle: isPrimary ? "bold" : "normal",
      })
      .setOrigin(0.5)
      .setInteractive();

    // Hover effects
    button.on("pointerover", () => {
      button.setColor("#FFD700");
      button.setScale(1.1);
    });

    button.on("pointerout", () => {
      button.setColor(isPrimary ? "#FFD700" : "#FFFFFF");
      button.setScale(1);
    });

    button.on("pointerdown", callback);

    return button;
  }

  private destroyPauseUI(): void {
    if (this.pauseContainer) {
      this.pauseContainer.destroy();
      this.pauseContainer = undefined;
    }
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  destroy(): void {
    this.destroyPauseUI();
    if (this.escapeKey) {
      this.escapeKey.removeAllListeners();
    }
  }
}
