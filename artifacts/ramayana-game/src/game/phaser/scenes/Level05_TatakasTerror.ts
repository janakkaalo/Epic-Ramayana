import Phaser from "phaser";
import { Player } from "../entities/Player";
import { DialogueSystem } from "../systems/DialogueSystem";
import { AstraUI } from "../systems/AstraUI";
import { PauseMenu } from "../systems/PauseMenu";
import { TouchControls } from "../systems/TouchControls";
import { LevelFlow } from "../utils/LevelFlow";
import { getGameSettings } from "../managers/GameSettings";
import { getProgressionManager } from "../managers/LevelProgressionManager";

export type TatakaBossPhase = 1 | 2 | 3;

/**
 * Level 5: "Tataka's Terror"
 * Location: Dark haunted forest
 * Type: Boss Battle
 * Playable: Rama (first major boss fight)
 *
 * Boss: Tataka - Female Asura (shape-shifter)
 * Health: 500 HP
 * Phases: 3 phases with different attack patterns
 */
export class Level05_TatakasTerror extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private dialogueSystem!: DialogueSystem;
  private astraUI!: AstraUI;
  private pauseMenu!: PauseMenu;

  // Boss state
  private tatakaBoss!: Phaser.Physics.Arcade.Sprite;
  private tatakaVisual?: Phaser.GameObjects.Graphics;
  private bossHealth: number = 500;
  private bossMaxHealth: number = 500;
  private currentPhase: TatakaBossPhase = 1;
  private isAttacking: boolean = false;
  private totalDamageDealt: number = 0;
  private battleComplete: boolean = false;

  // UI elements
  private bossHealthBar!: Phaser.GameObjects.Graphics;
  private bossNameText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private instructionsText!: Phaser.GameObjects.Text;
  private totalDharmaScore: number = 0;

  constructor() {
    super({ key: "Level05_TatakasTerror" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level05_TatakasTerror");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;

    // Create dark forest background
    this.createBackground();
    this.createEnvironment();
    this.createPlatforms();

    // Create player
    this.player = new Player(this, 150, 400);

    // Set up camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, width * 2, height);
    this.physics.world.setBounds(0, 0, width * 2, height);

    // Initialize systems
    this.dialogueSystem = new DialogueSystem(this);
    this.astraUI = new AstraUI(this);
    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level05_TatakasTerror",
      levelName: "Level 05 — Tataka's Terror",
    });
    // On-screen gamepad for touch devices (hidden unless enabled in Settings).
    new TouchControls(this, this.player);

    // Create Tataka boss
    this.createTatakaBoss();

    // Create HUD
    this.createHUD();

    // Set up collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.tatakaBoss, this.platforms);

    // Set up arrow-boss collision
    this.setupArrowCollisions();

    // Start battle dialogue
    this.startBattle();
  }

  update(time: number, delta: number): void {
    if (this.pauseMenu?.isPausedState()) return;
    if (this.dialogueSystem?.isDialogueActive()) {
      this.player.setVelocityX(0);
      return;
    }
    this.player.update(time, delta);

    if (this.battleComplete || !this.tatakaBoss || !this.tatakaBoss.active) {
      return;
    }

    // Update boss
    this.updateBossAI(time, delta);
    this.clampBossPosition();
    this.syncBossVisual();
    this.updateArrowBossHits();
    this.updateBossPhase();
    this.updateHUD();
  }

  /**
   * Create dark forest background
   */
  private createBackground(): void {
    const { width, height } = this.cameras.main;

    // Dark ominous sky with gradient
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x2d1a00, 0x440000, 1);
    sky.fillRect(0, 0, width * 2, height);
    sky.setDepth(-100);

    // Storm clouds
    for (let i = 0; i < 5; i++) {
      const cloudX = Phaser.Math.Between(0, width * 2);
      const cloudY = Phaser.Math.Between(20, 150);
      this.createStormCloud(cloudX, cloudY);
    }

    // Lightning flash periodically
    this.time.addEvent({
      delay: Phaser.Math.Between(3000, 7000),
      callback: () => {
        this.flashLightning();
      },
      loop: true,
    });

    // Fog/mist overlay
    const fog = this.add.graphics();
    fog.fillStyle(0x888888, 0.15);
    fog.fillRect(0, 0, width * 2, height);
    fog.setDepth(5);
    fog.setScrollFactor(1);

    // Animated fog movement
    this.tweens.add({
      targets: fog,
      x: -100,
      duration: 8000,
      repeat: -1,
      yoyo: true,
    });
  }

  /**
   * Create storm cloud
   */
  private createStormCloud(x: number, y: number): void {
    const cloud = this.add.graphics();
    cloud.fillStyle(0x333333, 0.7);

    // Cloud shape
    cloud.fillCircle(x - 40, y, 35);
    cloud.fillCircle(x, y - 20, 40);
    cloud.fillCircle(x + 40, y, 35);

    cloud.setDepth(4);
    cloud.setScrollFactor(1);

    // Animate cloud movement
    this.tweens.add({
      targets: cloud,
      x: x + 200,
      duration: 10000,
      repeat: -1,
      yoyo: true,
    });
  }

  /**
   * Create dark forest environment
   */
  private createEnvironment(): void {
    const { width, height } = this.cameras.main;

    // Dead trees
    for (let i = 0; i < 8; i++) {
      const x = 300 + i * 300;
      this.createDeadTree(x, height - 200);
    }

    // Eerie atmosphere elements
    const graphics = this.add.graphics();
    graphics.fillStyle(0x440000, 0.3); // Red tint
    graphics.fillRect(0, 0, width * 2, height);
    graphics.setDepth(2);
    graphics.setScrollFactor(1);
  }

  /**
   * Create arena platforms
   */
  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    const { width, height } = this.cameras.main;

    // Ground
    for (let x = 0; x < width * 2; x += 100) {
      const ground = this.add
        .rectangle(x, height - 50, 100, 50, 0x2c1810)
        .setOrigin(0);
      this.platforms.add(ground);
    }

    // Boss arena - central platforms
    this.createPlatform(width / 2 - 150, 400, 300, 20); // Central platform
    this.createPlatform(width / 2 - 350, 350, 150, 20); // Left side
    this.createPlatform(width / 2 + 200, 350, 150, 20); // Right side

    this.platforms.refresh();
  }

  /**
   * Create Tataka boss sprite
   */
  private createTatakaBoss(): void {
    const { width, height } = this.cameras.main;

    // Create boss sprite
    this.tatakaBoss = this.physics.add.sprite(width / 2, 250, "__WHITE");
    this.tatakaBoss.setAlpha(0.01); // Visuals are custom graphics drawn separately

    // Draw boss using graphics (fierce demon form)
    const bossGraphic = this.add.graphics();

    // Tataka - female asura with demonic features
    // Main torso
    bossGraphic.fillStyle(0x8b0000, 1); // Dark red
    bossGraphic.fillRect(width / 2 - 40, 250 - 60, 80, 120);

    // Head with crown
    bossGraphic.fillCircle(width / 2, 250 - 70, 32);

    // Eyes (glowing demonic)
    bossGraphic.fillStyle(0xff0000, 1);
    bossGraphic.fillCircle(width / 2 - 15, 250 - 75, 10);
    bossGraphic.fillCircle(width / 2 + 15, 250 - 75, 10);

    // Pupils
    bossGraphic.fillStyle(0xffff00, 1);
    bossGraphic.fillCircle(width / 2 - 15, 250 - 75, 5);
    bossGraphic.fillCircle(width / 2 + 15, 250 - 75, 5);

    // Horns (curved and menacing)
    bossGraphic.lineStyle(4, 0x2a1810);
    bossGraphic.lineBetween(
      width / 2 - 20,
      250 - 100,
      width / 2 - 45,
      250 - 140,
    );
    bossGraphic.lineBetween(
      width / 2 + 20,
      250 - 100,
      width / 2 + 45,
      250 - 140,
    );

    bossGraphic.beginPath();
    bossGraphic.moveTo(width / 2 + 20, 250 - 100);
    bossGraphic.lineTo(width / 2 + 45, 250 - 140);
    bossGraphic.stroke();

    // Arms (muscular and clawed)
    bossGraphic.fillStyle(0x5a1818, 1);
    bossGraphic.fillRect(width / 2 - 60, 250 - 50, 20, 80);
    bossGraphic.fillRect(width / 2 + 40, 250 - 50, 20, 80);

    // Claws
    bossGraphic.lineStyle(3, 0xff6600);
    for (let i = 0; i < 3; i++) {
      bossGraphic.lineBetween(
        width / 2 - 60 + i * 8,
        250 + 30,
        width / 2 - 65 + i * 8,
        250 + 45,
      );
      bossGraphic.lineBetween(
        width / 2 + 60 + i * 8,
        250 + 30,
        width / 2 + 55 + i * 8,
        250 + 45,
      );
    }

    // Crown/tiara on head
    bossGraphic.lineStyle(2, 0xffd700);
    bossGraphic.beginPath();
    bossGraphic.moveTo(width / 2 - 25, 250 - 98);
    bossGraphic.lineTo(width / 2 - 15, 250 - 110);
    bossGraphic.lineTo(width / 2, 250 - 105);
    bossGraphic.lineTo(width / 2 + 15, 250 - 110);
    bossGraphic.lineTo(width / 2 + 25, 250 - 98);
    bossGraphic.stroke();

    // Aura effect (mystical glow)
    bossGraphic.lineStyle(2, 0xff0000, 0.5);
    bossGraphic.strokeCircle(width / 2, 250 - 30, 95);
    bossGraphic.lineStyle(1, 0xff0000, 0.3);
    bossGraphic.strokeCircle(width / 2, 250 - 30, 105);

    // Store graphics reference
    this.tatakaVisual = bossGraphic;
    this.tatakaVisual.setDepth(60);

    this.tatakaBoss.setData("visualAnchorX", width / 2);
    this.tatakaBoss.setData("visualAnchorY", 250);

    // Set up physics body for collision
    const body = this.tatakaBoss.body as Phaser.Physics.Arcade.Body;
    body.setSize(90, 130, true);
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setCollideWorldBounds(true);

    this.syncBossVisual();
  }

  /**
   * Start battle with intro dialogue
   */
  private startBattle(): void {
    this.instructionsText?.setText(
      "Hold SPACE to aim (Mouse or Up/Down), release to shoot. Defeat Tataka!",
    );

    this.time.delayedCall(2000, () => {
      // Boss is now active
      this.isAttacking = true;
    });
  }

  /**
   * Update boss AI based on phase
   */
  private updateBossAI(time: number, delta: number): void {
    if (!this.tatakaBoss || !this.tatakaBoss.active) return;

    const bossBody = this.tatakaBoss.body as Phaser.Physics.Arcade.Body;
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.tatakaBoss.x,
      this.tatakaBoss.y,
      this.player.x,
      this.player.y,
    );

    if (this.currentPhase === 1) {
      this.updatePhase1AI(bossBody, distanceToPlayer, delta);
    } else if (this.currentPhase === 2) {
      this.updatePhase2AI(bossBody, distanceToPlayer, delta);
    } else if (this.currentPhase === 3) {
      this.updatePhase3AI(bossBody, distanceToPlayer, delta);
    }
  }

  /**
   * Phase 1: Grounded attacks
   */
  private updatePhase1AI(
    body: Phaser.Physics.Arcade.Body,
    distanceToPlayer: number,
    delta: number,
  ): void {
    // Charge attack towards player
    if (distanceToPlayer > 100) {
      const direction = Phaser.Math.Angle.Between(
        this.tatakaBoss.x,
        this.tatakaBoss.y,
        this.player.x,
        this.player.y,
      );
      const speed = 150;
      body.setVelocity(
        Math.cos(direction) * speed,
        Math.sin(direction) * speed,
      );
    } else {
      body.setVelocity(0, 0);
      // Attack!
      this.performPhase1Attack();
    }
  }

  /**
   * Phase 2: Enraged mode with teleportation
   */
  private updatePhase2AI(
    body: Phaser.Physics.Arcade.Body,
    distanceToPlayer: number,
    delta: number,
  ): void {
    // Faster movement
    if (distanceToPlayer > 150) {
      const direction = Phaser.Math.Angle.Between(
        this.tatakaBoss.x,
        this.tatakaBoss.y,
        this.player.x,
        this.player.y,
      );
      const speed = 220; // Faster than phase 1
      body.setVelocity(
        Math.cos(direction) * speed,
        Math.sin(direction) * speed,
      );
    }

    // Occasional teleport
    if (Math.random() < 0.01) {
      // 1% chance per frame to teleport
      const newX = Phaser.Math.Between(200, 1000);
      const newY = Phaser.Math.Between(150, 400);
      this.tatakaBoss.setPosition(newX, newY);
      this.performPhase2Attack();
    }
  }

  /**
   * Phase 3: Desperate berserker mode
   */
  private updatePhase3AI(
    body: Phaser.Physics.Arcade.Body,
    distanceToPlayer: number,
    delta: number,
  ): void {
    // Extremely fast movement
    const direction = Phaser.Math.Angle.Between(
      this.tatakaBoss.x,
      this.tatakaBoss.y,
      this.player.x,
      this.player.y,
    );
    const speed = 300;
    body.setVelocity(Math.cos(direction) * speed, Math.sin(direction) * speed);

    // Constant attacks
    this.performPhase3Attack();
  }

  /**
   * Phase 1 Attack: Basic charge and swipe
   */
  private performPhase1Attack(): void {
    // Simple attack - just stay in place momentarily
    this.time.delayedCall(500, () => {
      (this.tatakaBoss.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    });
  }

  /**
   * Phase 2 Attack: Ranged projectiles
   */
  private performPhase2Attack(): void {
    // Spawn projectile
    const projectile = this.physics.add.sprite(
      this.tatakaBoss.x,
      this.tatakaBoss.y,
      "",
    );
    projectile.setVisible(false);

    // Draw projectile
    const graphic = this.add.graphics();
    graphic.fillStyle(0xff0000, 0.8);
    graphic.fillCircle(this.tatakaBoss.x, this.tatakaBoss.y, 8);

    // Move towards player
    const direction = Phaser.Math.Angle.Between(
      this.tatakaBoss.x,
      this.tatakaBoss.y,
      this.player.x,
      this.player.y,
    );

    const speed = 200;
    (projectile.body as Phaser.Physics.Arcade.Body).setVelocity(
      Math.cos(direction) * speed,
      Math.sin(direction) * speed,
    );

    // Projectile cleanup
    this.time.delayedCall(3000, () => {
      projectile.destroy();
      graphic.destroy();
    });
  }

  /**
   * Phase 3 Attack: Continuous rapid strikes
   */
  private performPhase3Attack(): void {
    if (Math.random() < 0.05) {
      // 5% chance per frame
      // Visual attack indicator
      const flash = this.add.rectangle(
        this.tatakaBoss.x,
        this.tatakaBoss.y,
        160,
        120,
        0xff0000,
        0.5,
      );
      flash.setDepth(50);

      this.time.delayedCall(100, () => {
        flash.destroy();
      });
    }
  }

  /**
   * Handle arrow hitting boss
   */
  private handleBossHit(damage: number = 25): void {
    if (this.battleComplete || !this.tatakaBoss.active) {
      return;
    }

    const appliedDamage = Math.max(10, Math.floor(damage));
    this.bossHealth = Math.max(0, this.bossHealth - appliedDamage);
    this.totalDamageDealt += appliedDamage;

    // Boss hit effect
    if (this.tatakaVisual) {
      this.tatakaVisual.setAlpha(0.5);
      this.time.delayedCall(100, () => {
        this.tatakaVisual?.setAlpha(1);
      });
    }

    // Gain dharma for damage
    this.totalDharmaScore += Math.floor(appliedDamage / 4);

    // Check phase transition
    this.updateBossPhase();
  }

  /**
   * Update boss phase based on health
   */
  private updateBossPhase(): void {
    const healthPercent = (this.bossHealth / this.bossMaxHealth) * 100;

    if (healthPercent > 60) {
      this.currentPhase = 1;
    } else if (healthPercent > 30) {
      if (this.currentPhase === 1) {
        this.phaseText?.setText("Phase 2: Tataka Enrages!");
        this.currentPhase = 2;
      }
    } else if (healthPercent > 0) {
      if (this.currentPhase === 2) {
        this.phaseText?.setText("Phase 3: Desperate! Final Stand!");
        this.currentPhase = 3;
      }
    } else {
      this.completeBattle();
    }
  }

  /**
   * Complete the battle
   */
  private completeBattle(): void {
    if (this.battleComplete) {
      return;
    }
    this.battleComplete = true;

    // Boss defeated
    if (this.tatakaBoss.active) {
      this.tatakaBoss.destroy();
    }
    this.tatakaVisual?.destroy();
    this.tatakaVisual = undefined;
    this.isAttacking = false;

    // Show victory screen
    const { width, height } = this.cameras.main;

    this.add
      .text(width / 2, height / 2 - 50, "TATAKA DEFEATED!", {
        fontSize: "48px",
        fontFamily: "serif",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    const dharmaText = this.add
      .text(
        width / 2,
        height / 2 + 30,
        `Dharma Gained: ${this.totalDharmaScore}`,
        {
          fontSize: "32px",
          fontFamily: "serif",
          color: "#FFFFFF",
          stroke: "#000000",
          strokeThickness: 2,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    // Update progression
    const progressionManager = getProgressionManager();
    progressionManager.completeLevel(
      "Level05_TatakasTerror",
      this.totalDharmaScore,
    );
    progressionManager.unlockAstra("AGNEYASTRA"); // Agneyastra unlocked

    this.add
      .text(
        width / 2,
        height / 2 + 100,
        "Victory! Press SPACE / Tap to continue to Level 6...",
        {
          fontSize: "22px",
          fontFamily: "Arial",
          color: "#DDDDDD",
          stroke: "#000000",
          strokeThickness: 2,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    // Continue the journey into Level 6 (Guardian of the Yajna).
    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      this.scene.start("Level06_GuardianOfYajna");
    };
    this.input.keyboard?.once("keydown-SPACE", advance);
    this.input.keyboard?.once("keydown-ENTER", advance);
    this.input.once("pointerdown", advance);
    // Fallback auto-advance for unattended screens.
    this.time.delayedCall(8000, advance);
  }

  /**
   * Setup arrow-boss collision
   */
  private setupArrowCollisions(): void {
    this.events.on("arrow-shot", () => {
      const arrows = this.player.getBow().getArrows();
      const latestArrow = arrows[arrows.length - 1];
      if (!latestArrow || !this.tatakaBoss || !this.tatakaBoss.active) {
        return;
      }

      latestArrow.setData("prevX", latestArrow.x);
      latestArrow.setData("prevY", latestArrow.y);

      this.physics.add.overlap(
        latestArrow,
        this.tatakaBoss,
        (arrowObj) => {
          const arrow = arrowObj as Phaser.Physics.Arcade.Sprite & {
            hit?: (target?: Phaser.GameObjects.GameObject) => void;
          };

          if (arrow.hit) {
            arrow.hit(this.tatakaBoss);
          } else {
            arrow.destroy();
          }
        },
        undefined,
        this,
      );
    });

    this.events.on(
      "arrow-hit",
      (data: {
        target?: Phaser.GameObjects.GameObject;
        damage: number;
      }) => {
        if (data.target === this.tatakaBoss) {
          this.handleBossHit(data.damage);
        }
      },
      this,
    );
  }

  /**
   * Create HUD elements
   */
  private createHUD(): void {
    const padding = 20;

    this.bossNameText = this.add
      .text(this.cameras.main.width / 2, padding, "TATAKA - The Demoness", {
        fontSize: "24px",
        fontFamily: "serif",
        color: "#FF0000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    // Boss health bar background
    this.bossHealthBar = this.add.graphics();
    this.drawBossHealthBar();

    this.phaseText = this.add
      .text(padding, padding + 100, "Phase: 1/3", {
        fontSize: "18px",
        fontFamily: "Arial",
        color: "#FFFFFF",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.instructionsText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height - 50, "", {
        fontSize: "16px",
        fontFamily: "Arial",
        color: "#FFFFFF",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
  }

  /**
   * Update HUD display
   */
  private updateHUD(): void {
    this.drawBossHealthBar();
    this.phaseText?.setText(
      `Phase: ${this.currentPhase}/3  |  HP: ${Math.max(0, this.bossHealth)}/${this.bossMaxHealth}`,
    );
  }

  private updateArrowBossHits(): void {
    const arrows = this.player.getBow().getArrows();
    if (arrows.length === 0) return;

    for (const arrow of arrows) {
      if (!arrow.active) continue;

      const prevX = (arrow.getData("prevX") as number | undefined) ?? arrow.x;
      const prevY = (arrow.getData("prevY") as number | undefined) ?? arrow.y;
      const currX = arrow.x;
      const currY = arrow.y;

      if (
        this.segmentHitsCircle(
          prevX,
          prevY,
          currX,
          currY,
          this.tatakaBoss.x,
          this.tatakaBoss.y - 10,
          62,
        )
      ) {
        arrow.hit(this.tatakaBoss);
      }

      arrow.setData("prevX", currX);
      arrow.setData("prevY", currY);
    }
  }

  private segmentHitsCircle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    cx: number,
    cy: number,
    radius: number,
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const segLenSq = dx * dx + dy * dy;

    if (segLenSq === 0) {
      return Phaser.Math.Distance.Between(x1, y1, cx, cy) <= radius;
    }

    const t = Phaser.Math.Clamp(
      ((cx - x1) * dx + (cy - y1) * dy) / segLenSq,
      0,
      1,
    );

    const closestX = x1 + dx * t;
    const closestY = y1 + dy * t;

    return Phaser.Math.Distance.Between(closestX, closestY, cx, cy) <= radius;
  }

  private clampBossPosition(): void {
    const { width, height } = this.cameras.main;
    this.tatakaBoss.x = Phaser.Math.Clamp(this.tatakaBoss.x, 120, width * 2 - 120);
    this.tatakaBoss.y = Phaser.Math.Clamp(this.tatakaBoss.y, 140, height - 100);
  }

  private syncBossVisual(): void {
    if (!this.tatakaVisual) return;

    const anchorX = this.tatakaBoss.getData("visualAnchorX") as number;
    const anchorY = this.tatakaBoss.getData("visualAnchorY") as number;

    this.tatakaVisual.setPosition(this.tatakaBoss.x - anchorX, this.tatakaBoss.y - anchorY);
  }

  /**
   * Draw boss health bar
   */
  private drawBossHealthBar(): void {
    const width = this.cameras.main.width;
    const padding = 60;
    const barWidth = 300;
    const barHeight = 20;
    const x = (width - barWidth) / 2;
    const y = 50;

    this.bossHealthBar.clear();
    this.bossHealthBar.setScrollFactor(0);
    this.bossHealthBar.setDepth(100);

    // Background
    this.bossHealthBar.fillStyle(0x333333, 1);
    this.bossHealthBar.fillRect(x, y, barWidth, barHeight);

    // Health
    const healthPercent = Math.max(0, this.bossHealth / this.bossMaxHealth);
    this.bossHealthBar.fillStyle(0xff0000, 1);
    this.bossHealthBar.fillRect(x, y, barWidth * healthPercent, barHeight);

    // Border
    this.bossHealthBar.lineStyle(2, 0xffffff);
    this.bossHealthBar.strokeRect(x, y, barWidth, barHeight);
  }

  /**
   * Lightning flash effect
   */
  private flashLightning(): void {
    const flash = this.add.rectangle(
      this.cameras.main.width / 2,
      0,
      this.cameras.main.width * 2,
      this.cameras.main.height,
      0xffffff,
      0.1,
    );
    flash.setScrollFactor(0);
    flash.setDepth(1);

    this.time.delayedCall(100, () => {
      flash.destroy();
    });
  }

  // Utility methods

  private createDeadTree(x: number, y: number): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0x654321);
    graphics.lineBetween(x, y, x, y - 150);

    // Gnarled branches
    graphics.lineBetween(x, y - 50, x - 40, y - 100);
    graphics.lineBetween(x, y - 50, x + 40, y - 100);

    graphics.setDepth(4);
    graphics.setScrollFactor(1);
  }

  private createPlatform(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const platform = this.add
      .rectangle(x, y, width, height, 0x3c2415)
      .setOrigin(0);
    this.platforms.add(platform);
  }
}
