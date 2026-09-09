import Phaser from "phaser";
import { Player } from "../entities/Player";
import { DialogueSystem } from "../systems/DialogueSystem";
import { PauseMenu } from "../systems/PauseMenu";
import { LevelFlow } from "../utils/LevelFlow";
import { LevelBuilder } from "../utils/LevelBuilder";
import { getGameSettings } from "../managers/GameSettings";

/**
 * Level 08: "The Divine Bow" (Bala Kanda finale)
 * Mission: string Shiva's Pinaka — a timing puzzle (stop the marker
 * in the golden zone 3 times), then witness the breaking of the bow.
 */
export class Level08_DivineBow extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private dialogueSystem!: DialogueSystem;
  private pauseMenu!: PauseMenu;

  private started: boolean = false;
  private puzzleActive: boolean = false;
  private finished: boolean = false;
  private successes: number = 0;
  private dharma: number = 0;

  private markerX: number = 0;
  private markerDir: number = 1;
  private marker!: Phaser.GameObjects.Rectangle;
  private barX: number = 0;
  private barY: number = 0;
  private barW: number = 560;
  private promptText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private bowX: number = 0;

  constructor() {
    super({ key: "Level08_DivineBow" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level08_DivineBow");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;
    const builder = new LevelBuilder(this);
    builder.createSky(0x3d2b63, 0xe8b04b);
    builder.createMountainLayers(2, 480, [0x5a4570, 0x6b5a7e]);

    this.platforms = this.physics.add.staticGroup();
    for (let x = 0; x < width; x += 100) {
      this.platforms.add(this.add.rectangle(x, height - 40, 100, 80, 0x8b7355).setOrigin(0));
    }
    this.platforms.refresh();
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);

    // Swayamvara hall: pillars + Pinaka bow on a dais
    for (let i = 0; i < 6; i++) {
      const px = 120 + i * 210;
      this.add.rectangle(px, height - 260, 30, 320, 0xd4a017).setDepth(2);
    }
    this.bowX = width / 2;
    this.add.rectangle(this.bowX - 90, height - 90, 180, 30, 0x6b4a2a).setDepth(2);
    const bowArc = this.add.graphics().setDepth(3);
    bowArc.lineStyle(10, 0x4a2e12);
    bowArc.beginPath();
    bowArc.arc(this.bowX, height - 260, 120, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340));
    bowArc.strokePath();
    bowArc.lineStyle(3, 0xffd700);
    bowArc.lineBetween(this.bowX - 110, height - 170, this.bowX - 110, height - 350);
    const glow = this.add.ellipse(this.bowX, height - 260, 300, 300, 0xffd700, 0.12).setDepth(2);

    // Failed kings watching
    const kings = this.add.text(120, 130, "🤴 🤴 🤴  — kings who failed to lift the Pinaka", {
      fontFamily: "Arial", fontSize: "18px", color: "#DDDDDD",
      backgroundColor: "#00000088", padding: { x: 10, y: 6 },
    });
    void kings;
    void glow;

    this.player = new Player(this, 120, 480);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.dialogueSystem = new DialogueSystem(this);
    this.physics.add.collider(this.player, this.platforms);

    this.barX = width / 2 - this.barW / 2;
    this.barY = 190;
    this.promptText = this.add
      .text(width / 2, height - 80, "", {
        fontFamily: "Arial", fontSize: "18px", color: "#FFD700",
        backgroundColor: "#000000aa", padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5).setScrollFactor(0).setDepth(600);
    this.progressText = this.add
      .text(width / 2, 150, "", {
        fontFamily: "Arial", fontSize: "20px", color: "#FFFFFF",
        backgroundColor: "#000000aa", padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5).setScrollFactor(0).setDepth(600);

    LevelFlow.createObjectiveHUD(this, "Approach the Pinaka and string the divine bow");
    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level08_DivineBow",
      levelName: "Level 08 — The Divine Bow",
    });

    this.input.keyboard?.on("keydown-SPACE", () => this.onAction());
    this.input.keyboard?.on("keydown-E", () => this.onAction());
    this.input.on("pointerdown", () => this.onAction());

    this.dialogueSystem.startDialogue({
      id: "level8_intro",
      entries: [
        { character: "Janaka", text: "Whoever strings the Pinaka shall wed my Sita! Mighty kings have tried — all have failed.", duration: 0 },
        { character: "Vishwamitra", text: "Rama. Step forward, my son. This bow has waited an age for you.", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        this.started = true;
        this.promptText.setText("Walk to the divine bow →");
      },
    });
  }

  private drawPuzzleBar(): void {
    const g = this.add.graphics().setDepth(600);
    g.fillStyle(0x000000, 0.75);
    g.fillRoundedRect(this.barX - 8, this.barY - 8, this.barW + 16, 56, 8);
    // golden zone centre
    const zoneW = 110;
    const zoneX = this.barX + this.barW / 2 - zoneW / 2;
    g.fillStyle(0x2e7d32, 1);
    g.fillRect(zoneX - 26, this.barY, 26, 40);
    g.fillStyle(0xffd700, 1);
    g.fillRect(zoneX, this.barY, zoneW, 40);
    g.fillStyle(0x2e7d32, 1);
    g.fillRect(zoneX + zoneW, this.barY, 26, 40);
    g.setScrollFactor(0);
    this.marker = this.add.rectangle(this.barX, this.barY + 20, 8, 48, 0xffffff).setScrollFactor(0).setDepth(601);
    this.time.delayedCall(30000, () => {
      if (!g.active) return;
    });
  }

  private onAction(): void {
    if (!this.started || this.finished || this.dialogueSystem.isDialogueActive()) return;
    if (!this.puzzleActive && Math.abs(this.player.x - this.bowX) < 150) {
      this.puzzleActive = true;
      this.markerX = 0;
      this.markerDir = 1;
      this.drawPuzzleBar();
      this.progressText.setText(`String the bow: ${this.successes}/3 — SPACE in the GOLD zone`);
      this.promptText.setText("Press SPACE when the marker is in the GOLD zone!");
      return;
    }
    if (this.puzzleActive) {
      const zoneCenter = this.barW / 2;
      const dist = Math.abs(this.markerX - zoneCenter);
      if (dist <= 55) {
        this.successes++;
        this.dharma += 150;
        this.progressText.setText(`String the bow: ${this.successes}/3 — Beautiful!`);
        this.cameras.main.shake(150, 0.004);
        if (this.successes >= 3) this.winPuzzle();
      } else {
        this.dharma = Math.max(0, this.dharma - 20);
        this.progressText.setText(`String the bow: ${this.successes}/3 — Missed! Try again.`);
        this.cameras.main.shake(100, 0.002);
      }
    }
  }

  private winPuzzle(): void {
    this.puzzleActive = false;
    this.finished = true;
    this.marker?.destroy();
    this.promptText.setText("");
    this.progressText.setText("");
    if (this.player.body) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    // Breaking flash
    const { width, height } = this.cameras.main;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.85).setScrollFactor(0).setDepth(2000);
    this.time.delayedCall(350, () => flash.destroy());
    this.cameras.main.shake(400, 0.012);
    this.dialogueSystem.startDialogue({
      id: "level8_complete",
      entries: [
        { character: "Narrator", text: "Rama lifts the Pinaka as if it were a lotus stalk — strings it — and with a sound like the world's ending, the bow BREAKS!", duration: 0 },
        { character: "Sita", text: "Garlands for my lord! The gods themselves rain flowers on Mithila.", duration: 0 },
        { character: "Narrator", text: "Bala Kanda ends in joy. But in Ayodhya, a coronation — and a storm — await...", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        LevelFlow.completeLevel(this, "Level08_DivineBow", 700 + this.dharma, {
          title: "BALA KANDA COMPLETE!",
          subtitle: "Rama weds Sita — Ayodhya Kanda unlocks",
          nextScene: "Level09_RamaRajyabhisheka",
        });
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
    if (this.puzzleActive && this.marker && this.marker.active) {
      const speed = 340 + this.successes * 90;
      this.markerX += this.markerDir * speed * (delta / 1000);
      if (this.markerX >= this.barW) { this.markerX = this.barW; this.markerDir = -1; }
      if (this.markerX <= 0) { this.markerX = 0; this.markerDir = 1; }
      this.marker.x = this.barX + this.markerX;
    }
    if (this.started && !this.puzzleActive && !this.finished) {
      if (Math.abs(this.player.x - this.bowX) < 150) {
        this.promptText.setText("Press SPACE / E / Tap to lift the Pinaka");
      } else if (this.player.x < this.bowX) {
        this.promptText.setText("Walk to the divine bow →");
      }
    }
  }
}
