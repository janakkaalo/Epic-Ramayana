import Phaser from "phaser";
import { Player } from "../entities/Player";
import { DialogueSystem } from "../systems/DialogueSystem";
import { PauseMenu } from "../systems/PauseMenu";
import { LevelFlow } from "../utils/LevelFlow";
import { LevelBuilder } from "../utils/LevelBuilder";
import { getGameSettings } from "../managers/GameSettings";

/**
 * Level 12: "Farewell to Ayodhya" (Ayodhya Kanda)
 * Mission: leave the palace in exile garb, walk with the mourning
 * crowds, cross the Tamasa river, then slip away while citizens sleep.
 */
export class Level12_FarewellToAyodhya extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private dialogueSystem!: DialogueSystem;
  private pauseMenu!: PauseMenu;

  private started: boolean = false;
  private finished: boolean = false;
  private dharma: number = 150;
  private goalX: number = 0;
  private promptText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "Level12_FarewellToAyodhya" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level12_FarewellToAyodhya");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;
    const builder = new LevelBuilder(this);
    builder.createSky(0x5c6bc0, 0xffab91);

    const worldW = width * 3;
    this.platforms = this.physics.add.staticGroup();
    for (let x = 0; x < worldW; x += 100) {
      // Gap for the Tamasa river mid-world; bridge platforms span it.
      const inRiver = x > width * 1.4 && x < width * 1.9;
      if (!inRiver) {
        this.platforms.add(this.add.rectangle(x, height - 40, 100, 80, 0x7c5a3a).setOrigin(0));
      }
    }
    // River water
    const river = this.add.rectangle(width * 1.4, height - 60, width * 0.5, 60, 0x1565c0, 0.85).setOrigin(0, 0).setDepth(1);
    void river;
    // Stepping stones / boats across
    const stones = [0.42, 0.5, 0.58, 0.66].map((f) => width * f);
    for (const sx of stones) {
      this.platforms.add(this.add.rectangle(sx, height - 130, 110, 22, 0x6d4c41).setOrigin(0));
    }
    this.platforms.refresh();
    this.physics.world.setBounds(0, 0, worldW, height);
    this.cameras.main.setBounds(0, 0, worldW, height);

    // Mourning crowds along the first stretch
    for (let i = 0; i < 10; i++) {
      const cx = 300 + i * 170;
      this.add.ellipse(cx, height - 120, 40, 66, 0x5d4037).setDepth(2);
      this.add.circle(cx, height - 170, 14, 0xd7a17a).setDepth(2);
    }
    this.add.text(400, 130, "😢 Citizens weep as Rama departs in bark garments", {
      fontFamily: "Arial", fontSize: "18px", color: "#FFFFFF",
      backgroundColor: "#00000088", padding: { x: 10, y: 6 },
    }).setDepth(3);

    this.goalX = worldW - 240;
    this.add.rectangle(this.goalX, height - 200, 160, 200, 0x2e7d32).setDepth(2);
    this.add.text(this.goalX, height - 320, "🌙 Tamasa far bank — rest here", {
      fontFamily: "Arial", fontSize: "16px", color: "#FFD700",
      backgroundColor: "#000000aa", padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(3);

    this.player = new Player(this, 120, 440);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.dialogueSystem = new DialogueSystem(this);
    this.physics.add.collider(this.player, this.platforms);

    // Falling in the river pushes back (no death soft-lock)
    this.promptText = this.add.text(width / 2, height - 80, "", {
      fontFamily: "Arial", fontSize: "18px", color: "#FFD700",
      backgroundColor: "#000000aa", padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(600);

    LevelFlow.createObjectiveHUD(this, "Cross the Tamasa and reach the far bank");
    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level12_FarewellToAyodhya",
      levelName: "Level 12 — Farewell to Ayodhya",
    });

    this.dialogueSystem.startDialogue({
      id: "level12_intro",
      entries: [
        { character: "Narrator", text: "Clad in bark, Rama, Sita and Lakshmana walk out as the city wails behind them.", duration: 0 },
        { character: "Rama", text: "Do not follow beyond the Tamasa, dear citizens. Return — and keep Ayodhya in your hearts.", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        this.started = true;
      },
    });
  }

  update(time: number, delta: number): void {
    if (this.pauseMenu.isPausedState()) return;
    if (this.dialogueSystem.isDialogueActive()) {
      this.player.setVelocityX(0);
      return;
    }
    this.player.update(time, delta);
    if (!this.started || this.finished) return;

    const { height } = this.cameras.main;
    // Fell in river -> respawn on near bank
    if (this.player.y > height - 20) {
      this.player.x = this.cameras.main.width * 1.25;
      this.player.y = 380;
      if (this.player.body) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      this.promptText.setText("The current is strong — use the stones/boats!");
      this.time.delayedCall(1800, () => this.promptText.setText(""));
      return;
    }

    if (this.player.x < this.goalX - 200) {
      this.promptText.setText("Follow the crowds, then cross the Tamasa →");
    } else {
      this.promptText.setText("");
    }

    if (this.player.x >= this.goalX - 40) {
      this.finished = true;
      if (this.player.body) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      this.dialogueSystem.startDialogue({
        id: "level12_complete",
        entries: [
          { character: "Narrator", text: "While Ayodhya sleeps on the riverbank, Rama crosses quietly onward — sparing them a harder farewell.", duration: 0 },
          { character: "Sita", text: "The forest already feels like home, my lord. I fear nothing beside you.", duration: 0 },
        ],
        skippable: true,
        onComplete: () => {
          LevelFlow.completeLevel(this, "Level12_FarewellToAyodhya", 450 + this.dharma, {
            title: "TAMASA CROSSED",
            subtitle: "The exile truly begins",
            nextScene: "Level13_CharioteersTrick",
          });
        },
      });
    }
  }
}
