import Phaser from "phaser";

/**
 * PauseMenu - Reusable pause menu.
 * - ESC / P / BACKSPACE toggles pause (Back button on mobile/keyboard = ESC).
 * - On-screen pause button (top-right) for touch users.
 * - Options: Resume, Restart Level, Settings, Main Menu (Home), Exit Game.
 * - Settings returns to the calling scene via registry key.
 */
export class PauseMenu {
  private scene: Phaser.Scene;
  private isPaused: boolean = false;
  private pauseContainer?: Phaser.GameObjects.Container;
  private keys: Phaser.Input.Keyboard.Key[] = [];
  private pauseButton?: Phaser.GameObjects.Text;
  private levelKey: string;
  private levelName: string;
  private confirmContainer?: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    opts: { levelKey?: string; levelName?: string } = {},
  ) {
    this.scene = scene;
    this.levelKey = opts.levelKey ?? scene.scene.key;
    this.levelName = opts.levelName ?? scene.scene.key;
    this.setupKeys();
    this.createPauseButton();
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  private setupKeys(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) return;
    const codes = [
      Phaser.Input.Keyboard.KeyCodes.ESC,
      Phaser.Input.Keyboard.KeyCodes.P,
      Phaser.Input.Keyboard.KeyCodes.BACKSPACE,
    ];
    for (const code of codes) {
      const key = kb.addKey(code);
      key.on("down", () => {
        // Ignore pause toggle while a confirm dialog is open (ESC closes it).
        if (this.confirmContainer) {
          this.closeConfirm();
          return;
        }
        this.togglePause();
      });
      this.keys.push(key);
    }
  }

  private createPauseButton(): void {
    const { width } = this.scene.cameras.main;
    this.pauseButton = this.scene.add
      .text(width - 52, 52, "⏸", {
        fontFamily: "Arial",
        fontSize: "30px",
        color: "#FFD700",
        backgroundColor: "#000000aa",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(9500)
      .setInteractive({ useHandCursor: true });
    this.pauseButton.on("pointerdown", () => this.pause());
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
    try {
      this.scene.physics.pause();
    } catch {
      // scenes without physics
    }
    try {
      this.scene.tweens.pauseAll();
    } catch {
      // ignore
    }
    this.createPauseUI();
    this.scene.events.emit("pausemenu-open");
  }

  resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.closeConfirm();
    this.destroyPauseUI();
    try {
      this.scene.physics.resume();
    } catch {
      // ignore
    }
    try {
      this.scene.tweens.resumeAll();
    } catch {
      // ignore
    }
    this.scene.events.emit("pausemenu-close");
  }

  private createPauseUI(): void {
    const { width, height } = this.scene.cameras.main;

    this.pauseContainer = this.scene.add.container(0, 0);
    this.pauseContainer.setScrollFactor(0);
    this.pauseContainer.setDepth(10000);

    const overlay = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.72)
      .setOrigin(0)
      .setInteractive();
    // Swallow touches so on-screen gamepad buttons underneath can't fire.
    overlay.on("pointerdown", () => {
      // Intentionally empty — blocks fall-through.
    });
    this.pauseContainer.add(overlay);

    const title = this.scene.add
      .text(width / 2, 120, "⏸ PAUSED", {
        fontFamily: "serif",
        fontSize: "56px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#8B4513",
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    this.pauseContainer.add(title);

    const levelLabel = this.scene.add
      .text(width / 2, 172, this.levelName, {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#FFE9A8",
        fontStyle: "italic",
      })
      .setOrigin(0.5);
    this.pauseContainer.add(levelLabel);

    const menuY = 250;
    const spacing = 58;

    const items: Array<{ label: string; primary?: boolean; fn: () => void }> = [
      { label: "▶  Resume", primary: true, fn: () => this.resume() },
      {
        label: "↻  Restart Level",
        fn: () => {
          const paused = this.isPaused;
          if (paused) this.resume();
          this.scene.scene.restart();
        },
      },
      {
        label: "⚙  Settings",
        fn: () => {
          this.resume();
          try {
            this.scene.registry.set("settingsReturnKey", this.scene.scene.key);
          } catch {
            // ignore
          }
          this.scene.scene.start("SettingsScene");
        },
      },
      {
        label: "⌂  Main Menu (Home)",
        fn: () => {
          this.resume();
          this.scene.scene.start("MainMenuScene");
        },
      },
      {
        label: "✕  Exit Game",
        fn: () => this.showExitConfirm(),
      },
    ];

    items.forEach((item, i) => {
      const btn = this.createButton(
        width / 2,
        menuY + i * spacing,
        item.label,
        item.fn,
        item.primary ?? false,
      );
      this.pauseContainer?.add(btn);
    });

    const instructions = this.scene.add
      .text(width / 2, height - 44, "ESC / P / Backspace: Resume  |  Progress auto-saves", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#CCCCCC",
      })
      .setOrigin(0.5);
    this.pauseContainer.add(instructions);
  }

  private showExitConfirm(): void {
    if (this.confirmContainer || !this.pauseContainer) return;
    const { width, height } = this.scene.cameras.main;

    this.confirmContainer = this.scene.add.container(0, 0);
    this.confirmContainer.setDepth(10001);

    const dim = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0)
      .setInteractive();
    this.confirmContainer.add(dim);

    const box = this.scene.add
      .rectangle(width / 2, height / 2, 520, 220, 0x101b10, 0.98)
      .setStrokeStyle(3, 0xdeb650);
    this.confirmContainer.add(box);

    const msg = this.scene.add
      .text(
        width / 2,
        height / 2 - 50,
        "Exit to Main Menu?\nYour progress is auto-saved.",
        {
          fontFamily: "Arial",
          fontSize: "20px",
          color: "#FFFFFF",
          align: "center",
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5);
    this.confirmContainer.add(msg);

    const yes = this.createButton(width / 2 - 110, height / 2 + 55, "Yes, Exit", () => {
      this.resume();
      this.scene.scene.start("MainMenuScene");
    });
    const no = this.createButton(width / 2 + 110, height / 2 + 55, "Cancel", () => {
      this.closeConfirm();
    }, true);
    this.confirmContainer.add([yes, no]);
  }

  private closeConfirm(): void {
    if (this.confirmContainer) {
      this.confirmContainer.destroy(true);
      this.confirmContainer = undefined;
    }
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
        fontSize: isPrimary ? "30px" : "26px",
        color: isPrimary ? "#FFD700" : "#FFFFFF",
        fontStyle: isPrimary ? "bold" : "normal",
        backgroundColor: "#00000066",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => {
      button.setColor("#FFD700");
      button.setScale(1.06);
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
      this.pauseContainer.destroy(true);
      this.pauseContainer = undefined;
    }
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  destroy(): void {
    this.closeConfirm();
    this.destroyPauseUI();
    for (const key of this.keys) {
      try {
        key.removeAllListeners();
      } catch {
        // ignore
      }
    }
    this.keys = [];
    if (this.pauseButton) {
      this.pauseButton.destroy();
      this.pauseButton = undefined;
    }
  }
}
