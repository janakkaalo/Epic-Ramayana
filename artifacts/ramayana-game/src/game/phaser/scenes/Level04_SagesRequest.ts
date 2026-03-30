import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import {
  DialogueSystem,
  BALA_KANDA_DIALOGUES,
} from "../systems/DialogueSystem";
import { AstraUI } from "../systems/AstraUI";
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
  private levelPart: "throne-room" | "forest" = "throne-room";

  // Game state
  private enemiesDefeated: number = 0;
  private totalEnemies: number = 0;
  private totalDharmaScore: number = 0;
  private hasStartedJourney: boolean = false;

  // UI
  private statusText!: Phaser.GameObjects.Text;
  private enemyCountText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "Level04_SagesRequest" });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Start in throne room
    this.setupThroneRoom();

    // Set up camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, width * 4, height);

    // Initialize systems
    this.dialogueSystem = new DialogueSystem(this);
    this.astraUI = new AstraUI(this);

    // Create HUD
    this.createHUD();

    // Set up collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    // Set up arrow-enemy collision
    this.setupArrowCollisions();

    // Start dialogue
    this.startIntroDialogue();
  }

  update(time: number, delta: number): void {
    this.player.update(time, delta);

    // Update enemies
    this.enemies.getChildren().forEach((enemy: any) => {
      if (enemy.update) {
        enemy.update(time, delta);
      }
    });
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

    // Clear platforms and create forest platforms
    this.platforms.clear(true, true);
    this.platforms = this.physics.add.staticGroup();

    // Clear enemies
    this.enemies.clear(true, true);

    // Forest background with layered trees
    const forestColors = [0x1a3a1a, 0x2d5a2d, 0x1a3a1a, 0x0d2d0d];
    for (let section = 0; section < 4; section++) {
      this.add
        .rectangle(
          width * (1 + section),
          0,
          width,
          height,
          forestColors[section],
        )
        .setOrigin(0);

      // Add distant forest silhouettes (background trees)
      this.createForestSilhouettes(width * (1 + section), height);
    }

    // Create forest platforms
    this.createForestPlatforms();

    // Add forest decorations (trees, mushrooms, etc.)
    this.addForestDecorations();

    // Teleport player to start of forest
    this.player.setPosition(width + 100, 400);

    // Start enemy spawning
    this.spawnEnemies();

    this.statusText?.setText("Navigate through the forest to Siddhashrama!");
    this.hasStartedJourney = true;

    // Set a goal position (far right of forest)
    const goalX = width * 3 + 500;
    this.physics.overlap(this.player, [], undefined, () => {
      if (this.player.x > goalX && this.enemiesDefeated >= this.totalEnemies) {
        this.completeLevel();
      }
    });
  }

  /**
   * Create forest platforms
   */
  private createForestPlatforms(): void {
    const { width, height } = this.cameras.main;
    const baseY = height - 100;
    const forestStartX = width;

    // Ground throughout forest
    for (let x = 0; x < width * 3; x += 100) {
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
    const forestStartX = width;

    // Spawn 5 minor asuras
    const enemyPositions = [
      { x: forestStartX + 600, y: baseY - 50 },
      { x: forestStartX + 1000, y: baseY - 250 },
      { x: forestStartX + 1500, y: baseY - 50 },
      { x: forestStartX + 1900, y: baseY - 200 },
      { x: forestStartX + 2300, y: baseY - 50 },
    ];

    this.totalEnemies = enemyPositions.length;

    enemyPositions.forEach((pos, index) => {
      // Use different enemy types for variety (TATAKA, SUBAHU, MARICHA)
      const enemyTypes = ["SUBAHU", "MARICHA", "TATAKA"] as const;
      const enemyType = enemyTypes[index % 3] as any;

      const enemy = new Enemy(this, pos.x, pos.y, enemyType);
      this.enemies.add(enemy as any);

      // Make enemy patrol
      (enemy as any).patrolRange = 200;
      (enemy as any).patrolSpeed = 60 + index * 20; // Increase difficulty
    });

    this.updateEnemyCount();
  }

  /**
   * Setup arrow-enemy collision
   */
  private setupArrowCollisions(): void {
    this.events.on("arrow-enemy-hit", (arrow: any, enemy: any) => {
      this.handleEnemyHit(enemy);
    });
  }

  /**
   * Handle enemy hit
   */
  private handleEnemyHit(enemy: any): void {
    if (enemy && !enemy.isDead) {
      // Damage enemy
      enemy.takeDamage(25);

      // Award dharma
      this.totalDharmaScore += 100;

      // Check if dead
      if (enemy.health <= 0) {
        enemy.isDead = true;
        enemy.setAlpha(0.5);
        this.enemiesDefeated++;
        this.updateEnemyCount();

        // Check if all enemies defeated
        if (this.enemiesDefeated >= this.totalEnemies) {
          this.statusText?.setText(
            "All enemies defeated! Proceed to Siddhashrama!",
          );
        }
      }
    }
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
        "Arrow Keys: Move | SPACE: Aim/Shoot | Defeat enemies and reach the hermitage",
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
    this.input.keyboard?.on("keydown-SPACE", () => {
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

    graphics.setDepth(-5);
    graphics.setScrollFactor(1);
  }

  /**
   * Add decorative forest elements
   */
  private addForestDecorations(): void {
    const { width, height } = this.cameras.main;
    const forestStartX = width;
    const baseY = height - 100;

    // Add trees on platforms
    for (let section = 0; section < 3; section++) {
      for (let i = 0; i < 6; i++) {
        const treeX = forestStartX + section * width + 150 + i * 180;
        const treeY = baseY;

        // Tree trunk
        const trunk = this.add.rectangle(treeX, treeY - 60, 30, 120, 0x6d4c41);
        trunk.setScrollFactor(1);

        // Foliage (layered circles)
        const foliage1 = this.add.circle(treeX, treeY - 120, 50, 0x2e7d32);
        foliage1.setScrollFactor(1);

        const foliage2 = this.add.circle(treeX - 20, treeY - 100, 40, 0x1b5e20);
        foliage2.setScrollFactor(1);

        const foliage3 = this.add.circle(treeX + 20, treeY - 100, 40, 0x1b5e20);
        foliage3.setScrollFactor(1);
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

      const cap = this.add.circle(mushroomX, mushroomY - 20, 8, 0xff6b6b);
      cap.setScrollFactor(1);

      const spots = this.add.circle(mushroomX, mushroomY - 20, 3, 0xffffff);
      spots.setScrollFactor(1);
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
    }

    // Add wooden signpost before Siddhashrama
    const signX = forestStartX + width * 3 - 200;
    const signY = baseY - 50;

    const signPost = this.add.rectangle(signX, signY, 8, 80, 0x8b4513);
    signPost.setScrollFactor(1);

    const signBoard = this.add.rectangle(
      signX + 40,
      signY - 40,
      80,
      40,
      0xd2b48c,
    );
    signBoard.setStrokeStyle(2, 0x8b4513);
    signBoard.setScrollFactor(1);

    const signText = this.add.text(signX + 40, signY - 40, "Siddhashrama", {
      fontSize: "12px",
      color: "#000000",
    });
    signText.setOrigin(0.5);
    signText.setScrollFactor(1);
  }
}
