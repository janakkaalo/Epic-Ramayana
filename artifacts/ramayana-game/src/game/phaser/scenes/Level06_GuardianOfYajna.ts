import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { DialogueSystem } from "../systems/DialogueSystem";
import { PauseMenu } from "../systems/PauseMenu";
import { TouchControls } from "../systems/TouchControls";
import { LevelFlow } from "../utils/LevelFlow";
import { LevelBuilder } from "../utils/LevelBuilder";
import { getGameSettings } from "../managers/GameSettings";

/**
 * Level 06: "Guardian of the Yajna" (Bala Kanda)
 * Mission: defend Vishwamitra's sacred fire from rakshasa waves,
 * then defeat Subahu & Maricha. Unlocks VARUNASTRA.
 */
export class Level06_GuardianOfYajna extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private dialogueSystem!: DialogueSystem;
  private pauseMenu!: PauseMenu;
  private builder!: LevelBuilder;

  private waveIndex: number = 0;
  private enemiesDefeated: number = 0;
  private totalToDefeat: number = 6;
  private dharma: number = 0;
  private finished: boolean = false;
  private started: boolean = false;
  private statusText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private fireX: number = 0;
  private fireY: number = 0;
  private fireHp: number = 100;
  private fireText!: Phaser.GameObjects.Text;
  private fireGfx!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: "Level06_GuardianOfYajna" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level06_GuardianOfYajna");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;
    this.builder = new LevelBuilder(this);
    this.builder.createSky(0x2b1a4d, 0xff9e5e);
    this.builder.createMountainLayers(3, 460, [0x4a3563, 0x5a4570, 0x6b5a7e]);

    this.platforms = this.physics.add.staticGroup();
    this.addGround(width, height);
    this.addPlatform(300, 480, 220, 20);
    this.addPlatform(760, 420, 220, 20);
    this.addPlatform(1500, 430, 260, 20);
    this.addPlatform(2000, 470, 220, 20);
    this.platforms.refresh();

    this.physics.world.setBounds(0, 0, width * 2, height);
    this.cameras.main.setBounds(0, 0, width * 2, height);

    // Sacred fire (defend point)
    this.fireX = width;
    this.fireY = height - 150;
    const altar = this.add.rectangle(this.fireX, this.fireY + 40, 120, 40, 0x6b4a2a);
    altar.setDepth(3);
    this.fireGfx = this.add.graphics().setDepth(4);
    this.drawFire();

    this.player = new Player(this, 140, 420);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.dialogueSystem = new DialogueSystem(this);
    this.enemies = this.physics.add.group({ runChildUpdate: true });
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    this.statusText = this.add
      .text(16, 76, "Defend the sacred yajna fire!", {
        fontFamily: "Arial", fontSize: "18px", color: "#FFD700",
        backgroundColor: "#000000aa", padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0).setDepth(500);
    this.waveText = this.add
      .text(16, 112, "Days 1–2  |  Defeated 0/6", {
        fontFamily: "Arial", fontSize: "16px", color: "#FFFFFF",
        backgroundColor: "#000000aa", padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0).setDepth(500);
    this.fireText = this.add
      .text(16, 148, "Sacred Fire: 100%", {
        fontFamily: "Arial", fontSize: "16px", color: "#FFA500",
        backgroundColor: "#000000aa", padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0).setDepth(500);
    LevelFlow.createObjectiveHUD(this, "Defeat all rakshasas and protect the fire");

    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level06_GuardianOfYajna",
      levelName: "Level 06 — Guardian of the Yajna",
    });
    // On-screen gamepad for touch devices (hidden unless enabled in Settings).
    new TouchControls(this, this.player);

    this.setupCombatEvents();
    this.startIntro();
    // Animate the sacred flame on a timer (cheap) instead of per-frame redraws.
    this.time.addEvent({
      delay: 160,
      loop: true,
      callback: () => {
        if (!this.pauseMenu?.isPausedState() && !this.finished) this.drawFire();
      },
    });
  }

  private addGround(width: number, height: number): void {
    for (let x = 0; x < width * 2; x += 100) {
      const g = this.add.rectangle(x, height - 40, 100, 80, 0x3d5a2e).setOrigin(0);
      this.platforms.add(g);
    }
  }

  private addPlatform(x: number, y: number, w: number, h: number): void {
    const p = this.add.rectangle(x, y, w, h, 0x6b4a2a).setOrigin(0);
    this.platforms.add(p);
  }

  private drawFire(): void {
    const g = this.fireGfx;
    g.clear();
    const flick = 6 + Math.random() * 6;
    g.fillStyle(0xff5500, 0.9);
    g.fillTriangle(this.fireX - 24, this.fireY + 20, this.fireX + 24, this.fireY + 20, this.fireX, this.fireY - 50 - flick);
    g.fillStyle(0xffd700, 0.95);
    g.fillTriangle(this.fireX - 12, this.fireY + 20, this.fireX + 12, this.fireY + 20, this.fireX, this.fireY - 28 - flick);
  }

  private startIntro(): void {
    this.dialogueSystem.startDialogue({
      id: "level6_intro",
      entries: [
        { character: "Vishwamitra", text: "Before we reach Siddhashrama, receive the twin sciences — BALA and ATIBALA, as my guru taught me.", duration: 0 },
        { character: "Vishwamitra", text: "Bala frees the body from hunger, thirst and fatigue. Atibala grants sleepless vigour that no foe can match.", duration: 0 },
        { character: "Rama", text: "I bow to the mantra, Gurudev. Grant me whichever armour this night requires.", duration: 0 },
        { character: "Lakshmana", text: "The yajna must burn six days unbroken. On the sixth night Subahu and Maricha strike — brother, I guard the eastern side!", duration: 0 },
      ],
      skippable: true,
      onComplete: () => this.showBlessingChoice(),
    });
  }

  /**
   * Bala–Atibala choice (Bala Kanda, sarga 22): the sage lets the
   * pupil's need decide which vidya takes root first.
   */
  private showBlessingChoice(): void {
    const { width, height } = this.cameras.main;
    const overlay = this.add.container(0, 0).setDepth(3000);
    overlay.add(this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0));
    overlay.add(
      this.add.rectangle(width / 2, height / 2, 760, 280, 0x101b10, 0.98).setStrokeStyle(3, 0xdeb650),
    );
    overlay.add(
      this.add.text(width / 2, height / 2 - 95, "Vishwamitra: Which vidya shall take root?", {
        fontFamily: "serif", fontSize: "24px", color: "#FFD700", fontStyle: "bold",
      }).setOrigin(0.5),
    );
    const opts = [
      { label: "BALA — body beyond hunger & fatigue (fully healed)", fn: () => { this.player.heal(1000); this.dharma += 50; } },
      { label: "ATIBALA — wind-like vigour (full mana, lighter leaps)", fn: () => { this.player.restoreMana(1000); this.player.unlockDoubleJump(); this.dharma += 50; } },
    ];
    opts.forEach((opt, i) => {
      const btn = this.add.text(width / 2, height / 2 - 10 + i * 58, `${i + 1}. ${opt.label}`, {
        fontFamily: "Arial", fontSize: "18px", color: "#FFE9A8",
        backgroundColor: "#00000088", padding: { x: 14, y: 8 }, wordWrap: { width: 680 }, align: "center",
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on("pointerover", () => btn.setColor("#FFD700"));
      btn.on("pointerout", () => btn.setColor("#FFE9A8"));
      const pick = () => {
        overlay.destroy(true);
        opt.fn();
        this.cameras.main.flash(150, 255, 215, 0);
        this.started = true;
        this.statusText.setText("Days 1–2: the yajna burns. Rakshasa scouts approach...");
        this.spawnWave();
      };
      btn.on("pointerdown", pick);
      overlay.add(btn);
      if (i === 0) this.input.keyboard?.once("keydown-ONE", pick);
      if (i === 1) this.input.keyboard?.once("keydown-TWO", pick);
    });
  }

  private spawnWave(): void {
    if (this.finished) return;
    this.waveIndex++;
    const { height } = this.cameras.main;
    const baseY = height - 150;
    const defs: Array<{ type: "SUBAHU" | "MARICHA"; x: number }> =
      this.waveIndex === 1
        ? [{ type: "SUBAHU", x: 900 }, { type: "MARICHA", x: 1300 }]
        : this.waveIndex === 2
          ? [{ type: "MARICHA", x: 1100 }, { type: "SUBAHU", x: 1700 }]
          : [{ type: "SUBAHU", x: 1400 }, { type: "MARICHA", x: 1900 }];
    for (const d of defs) {
      const enemy = new Enemy(this, d.x, baseY - 40, d.type);
      enemy.setPatrolPoints([
        new Phaser.Math.Vector2(d.x - 160, baseY - 40),
        new Phaser.Math.Vector2(this.fireX - 120, baseY - 40),
      ]);
      this.enemies.add(enemy as unknown as Phaser.GameObjects.GameObject);
    }
    this.updateTexts();
  }

  private setupCombatEvents(): void {
    // If Rama falls, offer a retry instead of a silent soft-lock.
    this.events.on("player-died", () => {
      if (this.finished) return;
      this.finished = true;
      const { width, height } = this.cameras.main;
      this.add
        .text(width / 2, height / 2 - 20, "RAMA HAS FALLEN", {
          fontFamily: "serif", fontSize: "44px", color: "#FF5252",
          fontStyle: "bold", stroke: "#000000", strokeThickness: 4,
        })
        .setOrigin(0.5).setScrollFactor(0).setDepth(4000);
      this.add
        .text(width / 2, height / 2 + 40, "The yajna gutters... Press R to guard it anew", {
          fontFamily: "Arial", fontSize: "20px", color: "#FFFFFF",
        })
        .setOrigin(0.5).setScrollFactor(0).setDepth(4000);
      this.input.keyboard?.once("keydown-R", () => this.scene.restart());
      this.input.once("pointerdown", () => this.scene.restart());
    });

    this.events.on("enemy-defeated", (enemy: Enemy) => {
      void enemy;
      if (!this.started || this.finished) return;
      this.enemiesDefeated++;
      this.dharma += 120;
      this.updateTexts();
      const alive = this.enemies.getChildren().filter((o) => {
        const e = o as unknown as Enemy;
        return (e as unknown as Phaser.GameObjects.GameObject).active && e.getState() !== "DEAD";
      }).length;
      if (alive === 0) {
        if (this.waveIndex < 3) {
          const nextMsg =
            this.waveIndex === 1
              ? "Scouts repelled! Days 3–5: heavier war-bands come..."
              : "The yajna holds! Day 6: SUBAHU and MARICHA themselves descend!";
          this.statusText.setText(nextMsg);
          this.time.delayedCall(1500, () => this.spawnWave());
        } else {
          this.finishLevel();
        }
      }
    });

    this.events.on("enemy-attack", (data: { x: number; y: number; damage: number }) => {
      if (!this.started || this.finished) return;
      const distFire = Phaser.Math.Distance.Between(data.x, data.y, this.fireX, this.fireY);
      if (distFire < 160) {
        this.fireHp = Math.max(0, this.fireHp - 6);
        this.dharma = Math.max(0, this.dharma - 5);
        this.updateTexts();
        if (this.fireHp <= 0) {
          // Fire extinguished -> restart instead of soft-lock (player keeps progress).
          this.statusText.setText("The fire fades... hold on! (Fire restored — keep fighting)");
          this.fireHp = 60;
        }
      }
      const distPlayer = Phaser.Math.Distance.Between(data.x, data.y, this.player.x, this.player.y);
      if (distPlayer <= 95) {
        const mult = getGameSettings().getDamageTakenMultiplier();
        this.player.takeDamage(data.damage * mult);
      }
    });

    this.events.on("player-melee-attack", (data: { x: number; y: number; range: number; damage: number; facingRight: boolean }) => {
      if (!this.started || this.finished) return;
      for (const o of this.enemies.getChildren()) {
        const enemy = o as unknown as Enemy;
        if (!(o as unknown as Phaser.GameObjects.GameObject).active || enemy.getState() === "DEAD") continue;
        const dx = enemy.x - data.x;
        const dy = enemy.y - data.y;
        const inFront = data.facingRight ? dx >= -20 : dx <= 20;
        if (inFront && Math.hypot(dx, dy) <= data.range) {
          enemy.takeDamage(Math.max(15, Math.floor(data.damage)), this.player);
          this.dharma += 25;
        }
      }
    });
  }

  private updateTexts(): void {
    const dayLabel =
      this.waveIndex <= 1 ? "Days 1–2" : this.waveIndex === 2 ? "Days 3–5" : "Day 6 — FINAL ASSAULT";
    this.waveText.setText(`${dayLabel}  |  Defeated ${this.enemiesDefeated}/${this.totalToDefeat}`);
    this.fireText.setText(`Sacred Fire: ${Math.round(this.fireHp)}%`);
  }

  private finishLevel(): void {
    if (this.finished) return;
    this.finished = true;
    if (this.player.body) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.dialogueSystem.startDialogue({
      id: "level6_complete",
      entries: [
        { character: "Narrator", text: "On the sixth night Rama's arrow fells SUBAHU — and a humming manava shaft lifts MARICHA and hurls him a hundred yojanas into the ocean!", duration: 0 },
        { character: "Narrator", text: "The gods rain flowers on Siddhashrama. The yajna smoke rises straight and pure.", duration: 0 },
        { character: "Vishwamitra", text: "Six days guarded, demons broken! Receive VARUNASTRA, lord of waters — and come, Mithila's drums already call.", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        LevelFlow.completeLevel(this, "Level06_GuardianOfYajna", 600 + this.dharma, {
          title: "YAJNA PROTECTED!",
          subtitle: "Varunastra unlocked",
          nextScene: "Level07_JourneyToMithila",
          astraUnlock: "VARUNASTRA",
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
    for (const o of this.enemies.getChildren()) {
      const e = o as unknown as { update?: (t: number, d: number) => void };
      if (e.update) e.update(time, delta);
    }
    this.updateArrowHits();
  }

  private updateArrowHits(): void {
    if (!this.started || this.finished || this.enemies.getLength() === 0) return;
    const arrows = this.player.getBow().getArrows();
    if (arrows.length === 0) return;
    for (const arrow of arrows) {
      if (!arrow.active) continue;
      const prevX = (arrow.getData("prevX") as number | undefined) ?? arrow.x;
      const prevY = (arrow.getData("prevY") as number | undefined) ?? arrow.y;
      const currX = arrow.x;
      const currY = arrow.y;
      for (const o of this.enemies.getChildren()) {
        const enemy = o as unknown as Enemy;
        if (!(o as unknown as Phaser.GameObjects.GameObject).active || enemy.getState() === "DEAD") continue;
        if (this.segCircle(prevX, prevY, currX, currY, enemy.x, enemy.y - 10, 40)) {
          arrow.hit(enemy);
          this.dharma += 30;
          break;
        }
      }
      arrow.setData("prevX", currX);
      arrow.setData("prevY", currY);
    }
  }

  private segCircle(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, r: number): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Phaser.Math.Distance.Between(x1, y1, cx, cy) <= r;
    const t = Phaser.Math.Clamp(((cx - x1) * dx + (cy - y1) * dy) / lenSq, 0, 1);
    return Phaser.Math.Distance.Between(x1 + dx * t, y1 + dy * t, cx, cy) <= r;
  }
}
