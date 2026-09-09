import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import {
  DialogueSystem,
  BALA_KANDA_DIALOGUES,
} from "../systems/DialogueSystem";
import { AstraUI } from "../systems/AstraUI";
import { PauseMenu } from "../systems/PauseMenu";
import { TouchControls } from "../systems/TouchControls";
import { LevelFlow } from "../utils/LevelFlow";
import { getGameSettings } from "../managers/GameSettings";
import { getProgressionManager } from "../managers/LevelProgressionManager";

/**
 * Level 4: "Sage's Request"
 * Location: Throne Room → Forest Path to Siddhashrama
 * Type: Platforming + Combat Introduction
 * Playable: Rama with Lakshmana companion (AI)
 *
 * Story: Vishwamitra arrives at the throne and requests Rama's help
 * to protect a sacred Yajna from demons (asuras).
 * Rama and Lakshmana must journey through the forest to Siddhashrama.
 *
 * Features:
 * - Two-part level (throne room → forest)
 * - First enemy encounters (3-5 minor asuras)
 * - Lakshmana companion AI (basic follow)
 * - Environmental hazards
 */
export class Level04_SagesRequest extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private dialogueSystem!: DialogueSystem;
  private astraUI!: AstraUI;
  private pauseMenu!: PauseMenu;
  private levelPart: "throne-room" | "forest" = "throne-room";

  // Game state
  private enemiesDefeated: number = 0;
  private totalEnemies: number = 0;
  private totalDharmaScore: number = 0;
  private hasStartedJourney: boolean = false;
  private goalX: number = 0;
  private levelCompleted: boolean = false;
  private defeatedEnemies: Set<Enemy> = new Set();

  // UI
  private statusText!: Phaser.GameObjects.Text;
  private enemyCountText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "Level04_SagesRequest" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level04_SagesRequest");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;

    // Start in throne room
    this.setupThroneRoom();

    // Set up camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, width * 4, height);
    this.physics.world.setBounds(0, 0, width * 4, height);

    // Initialize systems
    this.dialogueSystem = new DialogueSystem(this);
    this.astraUI = new AstraUI(this);
    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level04_SagesRequest",
      levelName: "Level 04 — Sage's Request",
    });
    // On-screen gamepad for touch devices (hidden unless enabled in Settings).
    new TouchControls(this, this.player);

    // Create HUD
    this.createHUD();

    // Set up collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    // Set up arrow-enemy collision
    this.setupArrowCollisions();
    this.setupMeleeCombat();

    // Start dialogue
    this.startIntroDialogue();
  }

  update(time: number, delta: number): void {
    if (this.pauseMenu?.isPausedState()) return;
    if (this.dialogueSystem?.isDialogueActive()) {
      this.player.setVelocityX(0);
      return;
    }
    this.player.update(time, delta);

    // Update enemies
    this.enemies.getChildren().forEach((enemy: any) => {
      if (enemy.update) {
        enemy.update(time, delta);
      }
    });

    this.updateArrowEnemyHits();
    this.syncEnemyProgress();
    this.checkLevelCompletion();
  }

  /**
   * Setup the throne room (Part 1)
   */
  private setupThroneRoom(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x2d1b0f).setOrigin(0);

    // Throne room interior
    this.createThroneRoomBackground();
    this.createThroneRoomPlatforms();

    // Create player at bottom left
    this.player = new Player(this, 100, 400);
    this.player.setJumpVelocity(-560);

    // Create enemies group
    this.enemies = this.physics.add.group({
      runChildUpdate: true,
    });
  }

  /**
   * Create throne room graphics
   */
  private createThroneRoomBackground(): void {
    const { width, height } = this.cameras.main;

    // Wall
    const wall = this.add.graphics();
    wall.fillStyle(0x8b4513, 1); // Tan brown
    wall.fillRect(0, 0, width, height);
    wall.setDepth(-10);

    // Gold decorations
    for (let i = 0; i < 4; i++) {
      this.add.circle(50 + i * 250, 50, 20, 0xffd700).setDepth(1);
    }

    // Throne (rear center)
    const throne = this.add.graphics();
    throne.fillStyle(0xff8c00, 1); // Dark orange
    throne.fillRect(width / 2 - 80, 100, 160, 150);
    throne.setDepth(2);

    // Throne back
    throne.fillStyle(0xffd700, 0.6);
    throne.fillRect(width / 2 - 100, 50, 200, 80);
  }

  /**
   * Create throne room platforms
   */
  private createThroneRoomPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    const { width, height } = this.cameras.main;

    // Ground
    const ground = this.add
      .rectangle(width / 2, height - 20, width, 40, 0x654321)
      .setOrigin(0.5);
    this.platforms.add(ground);

    // Additional platforms leading to exit
    this.createPlatform(300, 350, 150, 20);
    this.createPlatform(600, 300, 150, 20);
    this.createPlatform(900, 250, 150, 20);

    this.platforms.refresh();
  }

  /**
   * Start the intro dialogue
   */
  private startIntroDialogue(): void {
    // This would trigger the throne room scene dialogue
    this.statusText?.setText("Watch as Vishwamitra arrives...");

    this.time.delayedCall(2000, () => {
      this.transitionToForest();
    });
  }

  /**
   * Transition to forest (Part 2)
   */
  private transitionToForest(): void {
    const { width, height } = this.cameras.main;
    this.levelPart = "forest";

    // Clear platforms and create forest platforms
    this.platforms.clear(true, true);
    this.platforms = this.physics.add.staticGroup();

    // Clear enemies
    this.enemies.clear(true, true);
    this.defeatedEnemies.clear();
    this.enemiesDefeated = 0;

    // Forest background with layered trees
    const forestColors = [0x0f3b0f, 0x0f3b0f, 0x0f3b0f, 0x0f3b0f];
    for (let section = 0; section < 4; section++) {
      this.add
        .rectangle(
          width * section,
          0,
          width,
          height,
          forestColors[section],
        )
        .setOrigin(0)
        .setDepth(3);

      // Add distant forest silhouettes (background trees)
      this.createForestSilhouettes(width * section, height);
    }

    // Create forest platforms
    this.createForestPlatforms();

    // Add forest decorations (trees, mushrooms, etc.)
    this.addForestDecorations();

    // Teleport player to center of first forest screen so transition does not show split-scene glitch.
    const forestEntryX = width / 2;
    this.player.setPosition(forestEntryX, height - 220);
    this.cameras.main.centerOn(forestEntryX, height / 2);

    // Rebind colliders after replacing platform group; otherwise enemies/player fall through.
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    // Start enemy spawning
    this.spawnEnemies();

    this.statusText?.setText(
      "Defeat the asuras with arrows or sword (F), then proceed to Siddhashrama!",
    );
    this.hasStartedJourney = true;

    // Set a goal position (far right of forest)
    this.goalX = width * 3 + 300;
    this.createGoalMarker();
  }

  /**
   * Create forest platforms
   */
  private createForestPlatforms(): void {
    const { width, height } = this.cameras.main;
    const baseY = height - 100;
    const forestStartX = 0;

    // Ground throughout forest, including right-side goal area.
    for (let x = 0; x < width * 4 + 200; x += 100) {
      this.createPlatform(forestStartX + x, baseY, 100, 100);
    }

    // Floating platforms (tree platforms)
    const platformSequence = [
      { x: forestStartX + 300, y: baseY - 150 },
      { x: forestStartX + 500, y: baseY - 180 },
      { x: forestStartX + 700, y: baseY - 150 },
      { x: forestStartX + 1000, y: baseY - 200 },
      { x: forestStartX + 1200, y: baseY - 150 },
      { x: forestStartX + 1500, y: baseY - 180 },
      { x: forestStartX + 1700, y: baseY - 100 },
      { x: forestStartX + 2000, y: baseY - 150 },
      { x: forestStartX + 2200, y: baseY - 180 },
      { x: forestStartX + 2500, y: baseY - 150 },
    ];

    platformSequence.forEach((p) => {
      this.createPlatform(p.x, p.y, 120, 20);
    });

    this.platforms.refresh();
  }

  /**
   * Spawn enemies in the forest
   */
  private spawnEnemies(): void {
    const { width, height } = this.cameras.main;
    const baseY = height - 150;
    const forestStartX = 0;

    // Spawn 5 minor asuras
    const enemyPositions = [
      { x: forestStartX + 600, y: baseY - 50 },
      { x: forestStartX + 1000, y: baseY - 50 },
      { x: forestStartX + 1500, y: baseY - 50 },
      { x: forestStartX + 1900, y: baseY - 50 },
      { x: forestStartX + 2300, y: baseY - 50 },
    ];

    this.totalEnemies = enemyPositions.length;

    enemyPositions.forEach((pos, index) => {
      // Use different enemy types for variety (TATAKA, SUBAHU, MARICHA)
      const enemyTypes = ["SUBAHU", "MARICHA", "TATAKA"] as const;
      const enemyType = enemyTypes[index % 3] as any;

      const enemy = new Enemy(this, pos.x, pos.y, enemyType);
      this.enemies.add(enemy as any);

      // Make enemy patrol around spawn point
      enemy.setPatrolPoints([
        new Phaser.Math.Vector2(pos.x - 100, pos.y),
        new Phaser.Math.Vector2(pos.x + 100, pos.y),
      ]);
    });

    // Use actual spawned count to avoid soft locks if one enemy fails to instantiate.
    this.totalEnemies = this.enemies.getLength();
    this.enemiesDefeated = 0;

    this.updateEnemyCount();
  }

  private syncEnemyProgress(): void {
    if (!this.hasStartedJourney || this.totalEnemies <= 0) {
      return;
    }

    const worldBounds = this.physics.world.bounds;

    for (const enemyObj of this.enemies.getChildren()) {
      const enemy = enemyObj as Enemy;
      if (!enemy.active || enemy.getState() === "DEAD") {
        continue;
      }

      const outOfPlayableArea =
        enemy.y > worldBounds.height + 160 ||
        enemy.x < worldBounds.x - 240 ||
        enemy.x > worldBounds.width + 240;

      if (!outOfPlayableArea) {
        continue;
      }

      if (!this.defeatedEnemies.has(enemy)) {
        this.defeatedEnemies.add(enemy);
      }

      enemy.destroy();
    }

    const aliveEnemies = this.enemies
      .getChildren()
      .filter((enemyObj) => {
        const enemy = enemyObj as Enemy;
        return enemy.active && enemy.getState() !== "DEAD";
      }).length;

    const derivedDefeated = Phaser.Math.Clamp(
      this.totalEnemies - aliveEnemies,
      0,
      this.totalEnemies,
    );

    if (derivedDefeated !== this.enemiesDefeated) {
      this.enemiesDefeated = derivedDefeated;
      this.updateEnemyCount();

      if (this.enemiesDefeated >= this.totalEnemies) {
        this.statusText?.setText("All asuras defeated! Reach Siddhashrama ahead.");
      }
    }
  }

  /**
   * Setup arrow-enemy collision
   */
  private setupArrowCollisions(): void {
    this.events.on("arrow-shot", () => {
      const arrows = this.player.getBow().getArrows();
      const latestArrow = arrows[arrows.length - 1];
      if (!latestArrow) {
        return;
      }

      latestArrow.setData("prevX", latestArrow.x);
      latestArrow.setData("prevY", latestArrow.y);

      this.physics.add.overlap(
        latestArrow,
        this.enemies,
        (arrowObj, enemyObj) => {
          const arrow = arrowObj as Phaser.Physics.Arcade.Sprite & {
            hit?: (target?: Phaser.GameObjects.GameObject) => void;
          };
          const enemy = enemyObj as Enemy;

          if (!enemy.active || enemy.getState() === "DEAD") {
            return;
          }

          if (arrow.hit) {
            arrow.hit(enemy);
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
        arrow: Phaser.GameObjects.GameObject;
        target?: Phaser.GameObjects.GameObject;
        damage: number;
      }) => {
        const enemy = data.target as Enemy | undefined;
        if (!enemy || !this.enemies.contains(enemy) || !enemy.active) {
          return;
        }

        this.handleEnemyHit(enemy, data.damage, data.arrow);
      },
      this,
    );

    this.events.on(
      "enemy-died",
      (data: { enemy: Enemy }) => {
        if (!this.enemies.contains(data.enemy)) {
          return;
        }

        if (this.defeatedEnemies.has(data.enemy)) {
          return;
        }

        this.defeatedEnemies.add(data.enemy);
        this.enemiesDefeated = this.defeatedEnemies.size;
        this.totalDharmaScore += 120;
        this.updateEnemyCount();

        if (this.enemiesDefeated >= this.totalEnemies) {
          this.statusText?.setText(
            "All asuras defeated! Reach Siddhashrama ahead.",
          );
        }
      },
      this,
    );

    this.events.on(
      "enemy-attack",
      (data: { x: number; y: number; damage: number }) => {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          data.x,
          data.y,
        );

        if (distance <= 90) {
          this.player.takeDamage(data.damage);
        }
      },
      this,
    );
  }

  private setupMeleeCombat(): void {
    this.events.on(
      "player-melee-attack",
      (data: {
        source: Phaser.GameObjects.GameObject;
        x: number;
        y: number;
        range: number;
        damage: number;
        facingRight: boolean;
      }) => {
        if (!this.hasStartedJourney) {
          return;
        }

        for (const enemyObj of this.enemies.getChildren()) {
          const enemy = enemyObj as Enemy;

          if (!enemy.active || enemy.getState() === "DEAD") {
            continue;
          }

          const dx = enemy.x - data.x;
          const dy = enemy.y - data.y;
          const inFront = data.facingRight ? dx >= -20 : dx <= 20;
          const closeEnough = Math.hypot(dx, dy) <= data.range;

          if (!inFront || !closeEnough) {
            continue;
          }

          this.handleEnemyHit(enemy, data.damage, data.source);
        }
      },
      this,
    );
  }

  /**
   * Handle enemy hit
   */
  private handleEnemyHit(
    enemy: Enemy,
    damage: number,
    source: Phaser.GameObjects.GameObject,
  ): void {
    if (!enemy.active || enemy.getState() === "DEAD") {
      return;
    }

    const appliedDamage = Math.max(10, Math.floor(damage));
    enemy.takeDamage(appliedDamage, source);
    this.totalDharmaScore += Math.max(20, Math.floor(appliedDamage * 0.8));
  }

  private updateArrowEnemyHits(): void {
    if (!this.hasStartedJourney || this.enemies.getLength() === 0) {
      return;
    }

    const arrows = this.player.getBow().getArrows();
    if (arrows.length === 0) return;

    for (const arrow of arrows) {
      if (!arrow.active) continue;

      const prevX = (arrow.getData("prevX") as number | undefined) ?? arrow.x;
      const prevY = (arrow.getData("prevY") as number | undefined) ?? arrow.y;
      const currX = arrow.x;
      const currY = arrow.y;

      for (const enemyObj of this.enemies.getChildren()) {
        const enemy = enemyObj as Enemy;

        if (!enemy.active || enemy.getState() === "DEAD") {
          continue;
        }

        if (
          this.segmentHitsCircle(
            prevX,
            prevY,
            currX,
            currY,
            enemy.x,
            enemy.y - 10,
            38,
          )
        ) {
          arrow.hit(enemy);
          break;
        }
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

  private checkLevelCompletion(): void {
    if (!this.hasStartedJourney || this.levelCompleted) {
      return;
    }

    // Anti-softlock: if player reaches the destination and exactly one enemy is
    // missing/unreachable, count it as routed so progression can continue.
    if (
      this.player.x >= this.goalX &&
      this.enemiesDefeated >= this.totalEnemies - 1 &&
      this.enemiesDefeated < this.totalEnemies
    ) {
      this.enemiesDefeated = this.totalEnemies;
      this.updateEnemyCount();
      this.statusText?.setText("Final asura routed. Proceeding to Siddhashrama...");
    }

    if (this.enemiesDefeated < this.totalEnemies) {
      return;
    }

    if (this.player.x >= this.goalX) {
      this.completeLevel();
    }
  }

  private createGoalMarker(): void {
    const { height } = this.cameras.main;
    const markerX = this.goalX + 120;
    const markerY = height - 200;

    const pillar = this.add.rectangle(markerX, markerY + 60, 14, 140, 0x8b5a2b);
    pillar.setScrollFactor(1);

    const banner = this.add.rectangle(markerX + 48, markerY + 20, 96, 48, 0xe0b04a);
    banner.setStrokeStyle(3, 0x7f4f24);
    banner.setScrollFactor(1);

    const label = this.add.text(markerX + 48, markerY + 20, "Siddhashrama", {
      fontSize: "14px",
      color: "#2c1b10",
      fontStyle: "bold",
    });
    label.setOrigin(0.5);
    label.setScrollFactor(1);

    this.tweens.add({
      targets: [banner, label],
      y: "+=6",
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /**
   * Create HUD elements
   */
  private createHUD(): void {
    const padding = 20;

    this.statusText = this.add
      .text(padding, padding, "Journey to Siddhashrama...", {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#FFD700",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.enemyCountText = this.add
      .text(padding, padding + 40, "Enemies: 0/5", {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#FF6B6B",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Instructions
    this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height - 50,
        "Arrow Keys: Move | Hold SPACE: Aim (Mouse or Up/Down), Release: Shoot | F: Sword Slash",
        {
          fontSize: "16px",
          fontFamily: "Arial",
          color: "#FFFFFF",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 },
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
  }

  /**
   * Update enemy count display
   */
  private updateEnemyCount(): void {
    this.enemyCountText?.setText(
      `Enemies: ${this.enemiesDefeated}/${this.totalEnemies}`,
    );
  }

  /**
   * Complete the level
   */
  private completeLevel(): void {
    if (this.levelCompleted) {
      return;
    }
    this.levelCompleted = true;

    // Stop player
    if (this.player.body) {
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }

    // Show completion screen
    const { width, height } = this.cameras.main;

    this.add
      .text(width / 2, height / 2 - 50, "SIDDHASHRAMA REACHED!", {
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
      "Level04_SagesRequest",
      this.totalDharmaScore,
    );

    // Continue option
    this.input.keyboard?.once("keydown-SPACE", () => {
      this.scene.start("Level05_TatakasTerror");
    });
  }

  /**
   * Utility method to create a platform
   */
  private createPlatform(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const platform = this.add
      .rectangle(x, y, width, height, 0x654321)
      .setOrigin(0);

    if (this.levelPart === "forest") {
      platform.setDepth(8);
    }

    this.platforms.add(platform);
  }

  /**
   * Create forest silhouettes for background
   */
  private createForestSilhouettes(baseX: number, height: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0a1a0a, 0.6); // Dark silhouette

    // Draw tree shapes
    for (let i = 0; i < 8; i++) {
      const x = baseX + 50 + i * 120;
      const treeHeight = 200 + Phaser.Math.Between(-50, 50);

      // Tree trunk
      graphics.fillRect(x, height - treeHeight, 20, treeHeight);

      // Tree foliage (circles)
      for (let j = 0; j < 3; j++) {
        graphics.fillCircle(x + 10, height - treeHeight + j * 40, 40 - j * 10);
      }
    }

    graphics.setDepth(4);
    graphics.setScrollFactor(1);
  }

  /**
   * Add decorative forest elements
   */
  private addForestDecorations(): void {
    const { width, height } = this.cameras.main;
    const forestStartX = 0;
    const baseY = height - 100;

    // Add trees on platforms
    for (let section = 0; section < 3; section++) {
      for (let i = 0; i < 6; i++) {
        const treeX = forestStartX + section * width + 150 + i * 180;
        const treeY = baseY;

        // Tree trunk
        const trunk = this.add.rectangle(treeX, treeY - 60, 30, 120, 0x6d4c41);
        trunk.setScrollFactor(1);
        trunk.setDepth(9);

        // Foliage (layered circles)
        const foliage1 = this.add.circle(treeX, treeY - 120, 50, 0x2e7d32);
        foliage1.setScrollFactor(1);
        foliage1.setDepth(9);

        const foliage2 = this.add.circle(treeX - 20, treeY - 100, 40, 0x1b5e20);
        foliage2.setScrollFactor(1);
        foliage2.setDepth(9);

        const foliage3 = this.add.circle(treeX + 20, treeY - 100, 40, 0x1b5e20);
        foliage3.setScrollFactor(1);
        foliage3.setDepth(9);
      }
    }

    // Add mushroom groups
    for (let i = 0; i < 15; i++) {
      const mushroomX = forestStartX + Phaser.Math.Between(0, width * 3);
      const mushroomY = baseY + 10;

      const stem = this.add.rectangle(
        mushroomX,
        mushroomY - 10,
        4,
        20,
        0xf5f5f5,
      );
      stem.setScrollFactor(1);
      stem.setDepth(9);

      const cap = this.add.circle(mushroomX, mushroomY - 20, 8, 0xff6b6b);
      cap.setScrollFactor(1);
      cap.setDepth(9);

      const spots = this.add.circle(mushroomX, mushroomY - 20, 3, 0xffffff);
      spots.setScrollFactor(1);
      spots.setDepth(9);
    }

    // Add forest flowers
    for (let i = 0; i < 20; i++) {
      const flowerX = forestStartX + Phaser.Math.Between(0, width * 3);
      const flowerY = baseY - Phaser.Math.Between(0, 80);

      const graphics = this.add.graphics();
      graphics.fillStyle(0xff69b4);
      for (let j = 0; j < 5; j++) {
        const angle = (j / 5) * Math.PI * 2;
        const x = flowerX + Math.cos(angle) * 6;
        const y = flowerY + Math.sin(angle) * 6;
        graphics.fillCircle(x, y, 3);
      }
      graphics.fillStyle(0xffd700);
      graphics.fillCircle(flowerX, flowerY, 2);
      graphics.setScrollFactor(1);
      graphics.setDepth(9);
    }

    // Add wooden signpost before Siddhashrama
    const signX = forestStartX + width * 3 - 200;
    const signY = baseY - 50;

    const signPost = this.add.rectangle(signX, signY, 8, 80, 0x8b4513);
    signPost.setScrollFactor(1);
    signPost.setDepth(10);

    const signBoard = this.add.rectangle(
      signX + 40,
      signY - 40,
      80,
      40,
      0xd2b48c,
    );
    signBoard.setStrokeStyle(2, 0x8b4513);
    signBoard.setScrollFactor(1);
    signBoard.setDepth(10);

    const signText = this.add.text(signX + 40, signY - 40, "Siddhashrama", {
      fontSize: "12px",
      color: "#000000",
    });
    signText.setOrigin(0.5);
    signText.setScrollFactor(1);
    signText.setDepth(10);
  }
}
