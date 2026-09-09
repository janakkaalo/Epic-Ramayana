import Phaser from "phaser";
import { Player } from "../entities/Player";
import { DialogueSystem } from "../systems/DialogueSystem";
import { PauseMenu } from "../systems/PauseMenu";
import { LevelFlow } from "../utils/LevelFlow";
import { LevelBuilder } from "../utils/LevelBuilder";
import { getGameSettings } from "../managers/GameSettings";

/**
 * Level 10: "The Poisoned Mind" (Ayodhya Kanda)
 * Mission: stealth — slip through the palace to Kaikeyi's chamber
 * without crossing the guards' lamplight. Witness the conspiracy.
 */
export class Level10_PoisonedMind extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private dialogueSystem!: DialogueSystem;
  private pauseMenu!: PauseMenu;

  private started: boolean = false;
  private finished: boolean = false;
  private dharma: number = 100;
  private guards: Array<{ x: number; range: number; speed: number; t: number; cone: Phaser.GameObjects.Ellipse; body: Phaser.GameObjects.Ellipse }> = [];
  private goalX: number = 0;
  private startX: number = 120;
  private spottedText!: Phaser.GameObjects.Text;
  private secretsText!: Phaser.GameObjects.Text;
  private spottedCooldown: number = 0;
  private overheard: Set<string> = new Set();

  /** Whispering voices along the corridor — linger to learn the whole plot. */
  private readonly beats: Array<{ id: string; x: number; title: string; entries: Array<{ character: string; text: string }> }> = [
    {
      id: "festival",
      x: 500,
      title: "Manthara learns of the coronation",
      entries: [
        { character: "Maid", text: "At dawn, Prince Rama is crowned Yuvaraja! The whole city is garlanded, nurse!" },
        { character: "Manthara", text: "What?! Rama's pattabhisheka — while MY Kaikeyi sleeps unwarned? This joy shall turn to ash before sunrise." },
      ],
    },
    {
      id: "ornament",
      x: 1130,
      title: "Kaikeyi laughs — then listens",
      entries: [
        { character: "Kaikeyi", text: "Silly hunchback! Rama loves Bharata like himself. Take this ornament for your happy news and trouble me no more." },
        { character: "Manthara", text: "(flings it down) Keep your jewels! When Kausalya sits queen-mother and YOU fetch her water — then remember Manthara!" },
        { character: "Kaikeyi", text: "...Wait. Speak on. What danger do you see that I do not?" },
      ],
    },
    {
      id: "boons",
      x: 1760,
      title: "The two boons take shape",
      entries: [
        { character: "Manthara", text: "The king owes you TWO boons since the celestial war. Demand them now: Bharata's crown — and Rama's exile for fourteen years, so his roots take hold!" },
        { character: "Manthara", text: "To Kopa Bhavana! Bare floor, mourner's garb, yield to nothing till the king yields everything!" },
      ],
    },
  ];

  constructor() {
    super({ key: "Level10_PoisonedMind" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level10_PoisonedMind");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;
    const builder = new LevelBuilder(this);
    builder.createSky(0x1a1a2e, 0x4a2e12);

    const worldW = width * 2;
    this.platforms = this.physics.add.staticGroup();
    for (let x = 0; x < worldW; x += 100) {
      this.platforms.add(this.add.rectangle(x, height - 40, 100, 80, 0x2e2e4a).setOrigin(0));
    }
    this.platforms.add(this.add.rectangle(700, 500, 260, 20, 0x4a4a6a).setOrigin(0));
    this.platforms.add(this.add.rectangle(1500, 470, 260, 20, 0x4a4a6a).setOrigin(0));
    this.platforms.refresh();
    this.physics.world.setBounds(0, 0, worldW, height);
    this.cameras.main.setBounds(0, 0, worldW, height);

    // Diyas along the corridor
    for (let x = 100; x < worldW; x += 220) {
      this.add.ellipse(x, height - 90, 16, 24, 0xff9800).setDepth(2);
    }

    // Guards with sweeping lamplight cones
    this.spawnGuard(430, height - 120, 150, 0.8);
    this.spawnGuard(950, height - 120, 170, 0.9);
    this.spawnGuard(1500, height - 120, 200, 1.2);
    this.spawnGuard(2050, height - 120, 180, 1.0);

    // Kaikeyi's chamber
    this.goalX = worldW - 220;
    this.add.rectangle(this.goalX, height - 200, 180, 220, 0x6a1b2a).setDepth(2);
    this.add.text(this.goalX, height - 330, "Kaikeyi's Chamber", {
      fontFamily: "serif", fontSize: "18px", color: "#FFD700",
    }).setOrigin(0.5).setDepth(3);

    this.player = new Player(this, this.startX, 440);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.dialogueSystem = new DialogueSystem(this);
    this.physics.add.collider(this.player, this.platforms);

    this.spottedText = this.add.text(width / 2, 120, "", {
      fontFamily: "Arial", fontSize: "22px", color: "#FF5252",
      backgroundColor: "#000000cc", padding: { x: 14, y: 8 }, fontStyle: "bold",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(600);

    this.secretsText = this.add.text(16, 76, "Secrets overheard: 0/3", {
      fontFamily: "Arial", fontSize: "18px", color: "#FFD700",
      backgroundColor: "#000000aa", padding: { x: 10, y: 6 },
    }).setScrollFactor(0).setDepth(500);

    LevelFlow.createObjectiveHUD(this, "Reach Kaikeyi's chamber unseen — linger at whispers 👂");
    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level10_PoisonedMind",
      levelName: "Level 10 — The Poisoned Mind",
    });
    this.drawWhisperMarks();

    this.dialogueSystem.startDialogue({
      id: "level10_intro",
      entries: [
        { character: "Narrator", text: "Night. Manthara has seen the festival lamps — and her heart curdles. You must witness what unfolds — unseen.", duration: 0 },
        { character: "Narrator", text: "Creep past the guards' lamplight. Where voices whisper (👂), linger in shadow to overhear each secret.", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        this.started = true;
      },
    });
  }

  /** Whisper markers — faint clues for the curious. */
  private drawWhisperMarks(): void {
    const { height } = this.cameras.main;
    for (const beat of this.beats) {
      if (this.overheard.has(beat.id)) continue;
      const ear = this.add.text(beat.x, height - 260, "👂", { fontSize: "26px" })
        .setOrigin(0.5).setDepth(3).setAlpha(0.85);
      this.tweens.add({
        targets: ear, alpha: { from: 0.85, to: 0.35 },
        duration: 900, yoyo: true, repeat: -1,
      });
    }
  }

  private spawnGuard(x: number, y: number, range: number, speed: number): void {
    const body = this.add.ellipse(x, y - 40, 44, 70, 0xb71c1c).setDepth(3);
    const cone = this.add.ellipse(x, y - 10, range * 2, 90, 0xffeb3b, 0.22).setDepth(2);
    this.guards.push({ x, range, speed, t: Math.random() * Math.PI * 2, cone, body });
  }

  update(time: number, delta: number): void {
    if (this.pauseMenu.isPausedState()) return;
    if (this.dialogueSystem.isDialogueActive()) {
      this.player.setVelocityX(0);
      return;
    }
    this.player.update(time, delta);
    if (!this.started || this.finished) return;

    const dt = delta / 1000;
    this.spottedCooldown = Math.max(0, this.spottedCooldown - dt);

    // Eavesdrop: lingering near a whisper reveals one secret of the plot.
    for (const beat of this.beats) {
      if (this.overheard.has(beat.id)) continue;
      if (Math.abs(this.player.x - beat.x) < 110) {
        this.overheard.add(beat.id);
        this.dharma += 80;
        this.secretsText.setText(`Secrets overheard: ${this.overheard.size}/3`);
        this.dialogueSystem.startDialogue({
          id: `level10_secret_${beat.id}`,
          entries: [
            { character: "Narrator", text: `Overheard — ${beat.title}:`, duration: 0 },
            ...beat.entries.map((e) => ({ ...e, duration: 0 })),
          ],
          skippable: true,
        });
        break;
      }
    }
    for (const g of this.guards) {
      g.t += dt * g.speed;
      const offset = Math.sin(g.t) * g.range;
      g.body.x = g.x + offset;
      g.cone.x = g.x + offset;
      // Spotted check: player inside cone ellipse & near guard height
      const dx = Math.abs(this.player.x - g.cone.x);
      const dy = Math.abs(this.player.y - (g.cone.y as number));
      if (dx < g.range && dy < 130 && this.spottedCooldown <= 0) {
        this.spottedCooldown = 1.5;
        this.player.x = this.startX;
        this.player.y = 400;
        if (this.player.body) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        this.spottedText.setText("SPOTTED! Sent back to the entrance...");
        this.time.delayedCall(1600, () => this.spottedText.setText(""));
        break;
      }
    }

    if (this.player.x >= this.goalX - 60) {
      this.finished = true;
      if (this.player.body) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      this.dialogueSystem.startDialogue({
        id: "level10_complete",
        entries: [
          { character: "Manthara", text: "Two boons the king owes you since the gods' war! Ask Bharata's crown — and Rama's exile for fourteen years, till his claim withers!", duration: 0 },
          { character: "Kaikeyi", text: "It is decided. (She tears her garlands, lies on the bare floor of Kopa Bhavana.) Let the king find his queen in mourning — and yield.", duration: 0 },
          { character: "Narrator", text: "The poison has taken root. At dawn, old Dasharatha will walk smiling into the chamber of wrath...", duration: 0 },
        ],
        skippable: true,
        onComplete: () => {
          LevelFlow.completeLevel(this, "Level10_PoisonedMind", 300 + this.dharma, {
            title: "CONSPIRACY WITNESSED",
            subtitle: "The tragedy is set in motion",
            nextScene: "Level11_TwoBoons",
          });
        },
      });
    }
  }
}
