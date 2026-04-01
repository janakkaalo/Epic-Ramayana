/**
 * Level 2: Sacred Yajna
 * Type: Tutorial - Platforming
 * Location: Ayodhya Palace Yajna Mandap
 * Playable: Young Rama (5 years old)
 *
 * Story Context:
 * After Valmiki's introduction, we flashback to Rama's birth story.
 * King Dasharatha performs the Putrakameshti Yajna with Rishyasringa.
 * Young Rama is introduced as the divine child who will become the hero.
 *
 * Gameplay:
 * - Pure platforming tutorial (no combat)
 * - Learn movement (arrow keys)
 * - Learn jumping (up arrow)
 * - Collect sacred offerings (flowers, fruits)
 * - Simple platform traversal
 * - Beautiful palace environment
 */

import Phaser from "phaser";
import { LevelBuilder } from "../utils/LevelBuilder";
import { DialogueSystem, DialogueSequence } from "../systems/DialogueSystem";
import { Player } from "../entities/Player";

export class Level02_SacredYajna extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private collectibles!: Phaser.Physics.Arcade.Group;
  private levelBuilder!: LevelBuilder;
  private dialogueSystem!: DialogueSystem;

  // Game state
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private itemsCollected: number = 0;
  private totalItems: number = 10;
  private levelComplete: boolean = false;

  // UI elements
  private collectionText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;

  // Environment
  private sacredFire!: Phaser.GameObjects.Container;
  private fireParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super("Level02_SacredYajna");
  }

  create(): void {
    console.log("Level 2: Sacred Yajna - Started");

    const { width, height } = this.cameras.main;

    // Set world bounds (important!)
    this.physics.world.setBounds(0, 0, width, height);

    this.levelBuilder = new LevelBuilder(this);
    this.dialogueSystem = new DialogueSystem(this);

    // Create environment
    this.createEnvironment();

    // Create platforms
    this.createPlatforms();

    // Create player (young Rama - 5 years old)
    this.createPlayer();

    // Create collectibles
    this.createCollectibles();

    // Setup camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, width, height);

    // Create UI
    this.createUI();

    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Setup collisions
    this.setupCollisions();

    // Show intro dialogue
    this.showIntroDialogue();
  }

  private createEnvironment(): void {
    // Sky - warm sunrise (dawn of Rama's birth)
    this.levelBuilder.createSky(0xff9e80, 0xffe0b2);

    // Sun (dawn) with rays
    const sun = this.add.circle(700, 120, 60, 0xffd700);
    sun.setDepth(-10);

    // Create sun rays effect
    const rays = this.add.graphics();
    rays.lineStyle(2, 0xffd700, 0.6);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x1 = 700 + Math.cos(angle) * 65;
      const y1 = 120 + Math.sin(angle) * 65;
      const x2 = 700 + Math.cos(angle) * 85;
      const y2 = 120 + Math.sin(angle) * 85;
      rays.lineBetween(x1, y1, x2, y2);
    }
    rays.setDepth(-10);

    // Mountains in background (Ayodhya kingdom)
    this.levelBuilder.createMountainLayers(
      3,
      450,
      [0x9575cd, 0x7e57c2, 0x673ab7],
    );

    // Clouds
    this.levelBuilder.createClouds(5);

    // Palace ground
    this.levelBuilder.createGround(0xffd54f, 550, 50);

    // Ornate palace building in background with more detail
    const palace = this.levelBuilder.createBuilding(
      50,
      350,
      200,
      200,
      0xffb74d, // Golden palace walls
      0xf57c00, // Orange roof
    );
    palace.setDepth(-1);

    // Add palace windows
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const windowX = 50 + 50 + i * 40;
        const windowY = 350 + 100 + j * 50;
        const window = this.add.rectangle(windowX, windowY, 20, 20, 0x01579b);
        window.setStrokeStyle(1, 0xf57f17);
        window.setDepth(-1);
      }
    }

    // Sacred fire in center (animated)
    this.createSacredFire();

    // Decorative elements
    this.createDecorations();

    // Level title with fade-in
    this.levelBuilder.createLevelTitle(
      "Bala Kanda",
      2,
      "Sacred Yajna - Ayodhya Palace - Dawn of the Prince",
    );
  }

  private createSacredFire(): void {
    const fireX = 400;
    const fireY = 520;

    this.sacredFire = this.add.container(fireX, fireY);

    // Fire pit base
    const firePit = this.add.ellipse(0, 0, 80, 30, 0x8b4513);
    firePit.setStrokeStyle(3, 0x654321);

    // Fire flames (layered triangles with animation)
    const flame1 = this.add.triangle(0, -30, 0, 40, -15, 0, 15, 0, 0xff6b00);
    const flame2 = this.add.triangle(0, -40, 0, 30, -10, 0, 10, 0, 0xff8e00);
    const flame3 = this.add.triangle(0, -50, 0, 20, -5, 0, 5, 0, 0xffd700);

    this.sacredFire.add([firePit, flame1, flame2, flame3]);

    // Animate flames
    this.tweens.add({
      targets: flame1,
      scaleY: { from: 1, to: 1.2 },
      alpha: { from: 0.8, to: 1 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: flame2,
      scaleY: { from: 1, to: 1.15 },
      alpha: { from: 0.85, to: 1 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: flame3,
      scaleY: { from: 1, to: 1.3 },
      alpha: { from: 0.9, to: 1 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Fire particles (sparks)
    const particles = this.add.particles(fireX, fireY - 40, "particle", {
      speed: { min: 10, max: 30 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.3, end: 0 },
      tint: [0xffd700, 0xff8e00, 0xff6b00],
      lifespan: 1000,
      frequency: 50,
      quantity: 2,
    });

    particles.setDepth(10);
  }

  private createDecorations(): void {
    // Decorative pillars with ornate capitals
    const pillarPositions = [
      { x: 100, y: 500 },
      { x: 700, y: 500 },
    ];

    pillarPositions.forEach((pos) => {
      // Pillar base
      const base = this.add.rectangle(pos.x, pos.y + 55, 35, 10, 0xd4a574);
      base.setStrokeStyle(2, 0x8d6e63);

      // Main pillar shaft
      const shaft = this.add.rectangle(pos.x, pos.y, 30, 100, 0xf9a825);
      shaft.setStrokeStyle(2, 0xf57f17);

      // Pillar capital (top decoration)
      const capital = this.add.rectangle(pos.x, pos.y - 55, 40, 15, 0xffd54f);
      capital.setStrokeStyle(2, 0xf57f17);

      // Capital ornament (diamond shape)
      const ornament1 = this.add.polygon(
        pos.x - 12,
        pos.y - 55,
        [0, -4, 4, 0, 0, 4, -4, 0],
        0xffd700,
      );
      const ornament2 = this.add.polygon(
        pos.x + 12,
        pos.y - 55,
        [0, -4, 4, 0, 0, 4, -4, 0],
        0xffd700,
      );

      // Shadow effect under pillar
      const shadow = this.add.ellipse(pos.x, pos.y + 60, 40, 8, 0x000000, 0.3);
    });

    // Hanging decorations (garlands) - more ornate
    const garlandCount = 6;
    for (let i = 0; i < garlandCount; i++) {
      const x = 100 + i * 120;
      const garland = this.add.ellipse(x, 70, 30, 40, 0xff6f00, 0.8);
      garland.setStrokeStyle(1, 0xf57f17);

      // Garland ornament pearls
      for (let j = 0; j < 3; j++) {
        const pearlX = x - 10 + j * 10;
        const pearlY = 70 + 15;
        const pearl = this.add.circle(pearlX, pearlY, 3, 0xffd700);
        pearl.setStrokeStyle(1, 0xf9a825);
      }

      // Sway animation
      if (this.tweens && this.tweens.add) {
        this.tweens.add({
          targets: garland,
          y: garland.y + 5,
          duration: 1500 + i * 200,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }

    // Flowering plants with enhanced visuals
    const plantPositions = [150, 300, 500, 650];
    plantPositions.forEach((x) => {
      // Pot
      const pot = this.add.polygon(
        x,
        545,
        [-8, 0, -6, -8, 6, -8, 8, 0, 6, 5, -6, 5],
        0xc4885f,
      );
      pot.setStrokeStyle(1, 0x8d6e63);

      // Soil
      const soil = this.add.ellipse(x, 537, 14, 6, 0x795548);

      // Stem
      const stem = this.add.rectangle(x, 525, 3, 25, 0x2e7d32);
      stem.setStrokeStyle(1, 0x1b5e20);

      // Leaves
      const leaf1 = this.add.polygon(x - 5, 515, [0, 0, 5, -5, 5, 5], 0x4caf50);
      const leaf2 = this.add.polygon(
        x + 5,
        515,
        [0, 0, -5, -5, -5, 5],
        0x4caf50,
      );

      // Flower petals
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const offsetX = Math.cos(angle) * 6;
        const offsetY = Math.sin(angle) * 6;
        const petal = this.add.circle(x + offsetX, 500 + offsetY, 3, 0xe91e63);
        petal.setStrokeStyle(1, 0xc2185b);
      }

      // Center of flower
      const flowerCenter = this.add.circle(x, 500, 2, 0xffd700);

      // Gentle sway animation
      if (this.tweens && this.tweens.add) {
        this.tweens.add({
          targets: [stem, leaf1, leaf2, flowerCenter],
          angle: { from: -3, to: 3 },
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    });

    // Mandap structure decoration (arch elements)
    const archLeft = this.add.arc(200, 200, 80, 0, Math.PI, false, 0xf9a825);
    archLeft.setStrokeStyle(3, 0xf57f17);

    const archRight = this.add.arc(600, 200, 80, 0, Math.PI, false, 0xf9a825);
    archRight.setStrokeStyle(3, 0xf57f17);

    // Decorative banner between arches
    const bannerGraphics = this.add.graphics();
    bannerGraphics.fillStyle(0xff6f00, 0.9);
    bannerGraphics.fillRect(200, 140, 400, 40);
    bannerGraphics.lineStyle(2, 0xf57f17);
    bannerGraphics.strokeRect(200, 140, 400, 40);

    // Banner text decoration (wave pattern)
    for (let i = 0; i < 10; i++) {
      const x = 200 + i * 40;
      const point = this.add.circle(x, 135, 4, 0xffd700);
      point.setStrokeStyle(1, 0xf57f17);
    }
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();

    // Ground platform
    const ground = this.add.rectangle(400, 575, 800, 50, 0xffd54f);
    ground.setStrokeStyle(2, 0xf9a825);
    this.platforms.add(ground);

    // Tutorial platforms (gentle progression: each step is jump-reachable)
    const platformData = [
      { x: 170, y: 500, width: 130, height: 15 }, // Step 1
      { x: 320, y: 450, width: 120, height: 15 }, // Step 2
      { x: 470, y: 400, width: 120, height: 15 }, // Step 3
      { x: 620, y: 350, width: 130, height: 15 }, // Step 4
      { x: 730, y: 450, width: 120, height: 15 }, // Return path
      { x: 580, y: 500, width: 110, height: 15 }, // Near-ground support
    ];

    platformData.forEach((data) => {
      const platform = this.add.rectangle(
        data.x,
        data.y,
        data.width,
        data.height,
        0xf9a825,
      );
      platform.setStrokeStyle(2, 0xf57f17);
      this.platforms.add(platform);
    });

    // Refresh static bodies (IMPORTANT!)
    this.platforms.refresh();
  }

  private createPlayer(): void {
    // Young Rama (smaller sprite for 5-year-old)
    this.player = new Player(this, 100, 500);
    this.player.setScale(0.6); // Smaller scale for young child
    this.player.setJumpVelocity(-500); // Slight boost for tutorial readability
  }

  private createCollectibles(): void {
    this.collectibles = this.physics.add.group({
      allowGravity: false, // IMPORTANT: Disable gravity for all collectibles
    });

    // Collectible positions (sacred offerings)
    const collectibleData = [
      // Ground level
      { x: 200, y: 530, type: "flower" },
      { x: 520, y: 530, type: "fruit" },

      // Low platforms
      { x: 170, y: 470, type: "flower" },
      { x: 580, y: 470, type: "fruit" },

      // Medium platforms
      { x: 320, y: 420, type: "flower" },
      { x: 730, y: 420, type: "fruit" },

      // High platforms
      { x: 470, y: 370, type: "flower" },
      { x: 620, y: 320, type: "fruit" },

      // Extra collectibles
      { x: 400, y: 485, type: "flower" },
      { x: 650, y: 300, type: "special" }, // Special golden flower near top path
    ];

    collectibleData.forEach((data, index) => {
      const item = this.createCollectibleItem(data.x, data.y, data.type);
      item.setData("collected", false);
      this.collectibles.add(item);
    });
  }

  private createCollectibleItem(
    x: number,
    y: number,
    type: string,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Base circle glow
    const glow = this.add.circle(0, 0, 15, 0xffd700, 0.3);

    let mainShape: Phaser.GameObjects.GameObject;

    if (type === "flower") {
      // Lotus flower
      const petals = this.add.star(0, 0, 5, 8, 12, 0xff4081);
      petals.setStrokeStyle(1, 0xf50057);
      const center = this.add.circle(0, 0, 4, 0xffeb3b);
      mainShape = petals;
      container.add([glow, petals, center]);
    } else if (type === "fruit") {
      // Sacred fruit (mango)
      const fruit = this.add.ellipse(0, 0, 12, 16, 0xffb300);
      fruit.setStrokeStyle(1, 0xff8f00);
      mainShape = fruit;
      container.add([glow, fruit]);
    } else if (type === "special") {
      // Golden flower (bonus)
      const star = this.add.star(0, 0, 8, 10, 15, 0xffd700);
      star.setStrokeStyle(2, 0xffffff);
      mainShape = star;
      container.add([glow, star]);

      // Extra sparkle for special item
      this.tweens.add({
        targets: star,
        angle: 360,
        duration: 3000,
        repeat: -1,
        ease: "Linear",
      });
    }

    // Floating animation
    this.tweens.add({
      targets: container,
      y: y - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Pulse glow
    this.tweens.add({
      targets: glow,
      scale: { from: 1, to: 1.3 },
      alpha: { from: 0.3, to: 0.6 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Add physics
    this.physics.add.existing(container);
    (container.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (container.body as Phaser.Physics.Arcade.Body).setSize(20, 20);

    return container;
  }

  private createUI(): void {
    // Collection counter
    this.collectionText = this.add
      .text(
        20,
        20,
        `Sacred Offerings: ${this.itemsCollected}/${this.totalItems}`,
        {
          fontFamily: "Georgia, serif",
          fontSize: "20px",
          color: "#FFD700",
          stroke: "#000000",
          strokeThickness: 4,
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: "#000000",
            blur: 5,
            fill: true,
          },
        },
      )
      .setScrollFactor(0)
      .setDepth(100);

    // Instructions
    this.instructionText = this.add
      .text(
        400,
        550,
        "← → Move  |  ↑ Jump  |  SHIFT Run  |  Collect all offerings!",
        {
          fontFamily: "Georgia, serif",
          fontSize: "16px",
          color: "#FFFFFF",
          backgroundColor: "#000000AA",
          padding: { x: 10, y: 5 },
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    // Fade out instructions after 5 seconds
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: this.instructionText,
        alpha: 0,
        duration: 1000,
      });
    });
  }

  private setupCollisions(): void {
    // Player collides with platforms
    this.physics.add.collider(this.player, this.platforms);

    // Player collects items
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );
  }

  private collectItem(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    item: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ): void {
    const collectible = item as Phaser.GameObjects.Container;

    // Overlap callbacks run every frame; guard against duplicate collection.
    if (collectible.getData("collected")) {
      return;
    }

    collectible.setData("collected", true);

    const body = collectible.body as Phaser.Physics.Arcade.Body | undefined;
    if (body) {
      body.enable = false;
    }

    this.collectibles.remove(collectible, false, false);

    // Collect animation
    this.tweens.add({
      targets: collectible,
      scale: 1.5,
      alpha: 0,
      y: collectible.y - 50,
      duration: 500,
      onComplete: () => {
        collectible.destroy();
      },
    });

    // Increment counter
    this.itemsCollected++;
    this.collectionText.setText(
      `Sacred Offerings: ${this.itemsCollected}/${this.totalItems}`,
    );

    // Play success sound (placeholder - would add actual sound)
    // this.sound.play('collect');

    // Check if all collected
    if (this.itemsCollected >= this.totalItems && !this.levelComplete) {
      this.levelComplete = true;
      this.time.delayedCall(500, () => {
        this.completeLevel();
      });
    }
  }

  private showIntroDialogue(): void {
    const introSequence: DialogueSequence = {
      id: "level2_intro",
      entries: [
        {
          character: "Narrator",
          text: "Long ago in the golden city of Ayodhya, King Dasharatha yearned for sons.",
          duration: 0, // Wait for input
        },
        {
          character: "Narrator",
          text: "The great sage Rishyasringa performed the sacred Putrakameshti Yajna.",
          duration: 0,
        },
        {
          character: "Narrator",
          text: "From the holy fire emerged a divine being bearing sacred nectar (Payasam).",
          duration: 0,
        },
        {
          character: "Narrator",
          text: "Queen Kausalya received the first share, and in time, Prince Rama was born.",
          duration: 0,
        },
        {
          character: "Narrator",
          text: "The infant Rama, an avatar of Lord Vishnu, brought joy to the kingdom.",
          duration: 0,
        },
        {
          character: "Narrator",
          text: "Collect the sacred offerings scattered during the yajna ceremony!",
          duration: 0,
        },
      ],
      onComplete: () => {
        console.log("Intro dialogue complete - player can move now");
      },
      skippable: true,
    };

    this.dialogueSystem.startDialogue(introSequence);
  }

  private completeLevel(): void {
    // Show completion dialogue
    const completeSequence: DialogueSequence = {
      id: "level2_complete",
      entries: [
        {
          character: "Narrator",
          text: "Well done! All sacred offerings have been collected.",
          duration: 0,
        },
        {
          character: "Narrator",
          text: "Prince Rama grew in strength and wisdom under the guidance of Guru Vashishtha.",
          duration: 0,
        },
        {
          character: "Narrator",
          text: "Years passed, and Rama became renowned for his archery skills...",
          duration: 0,
        },
      ],
      onComplete: () => {
        // Transition to Level 3
        this.time.delayedCall(1000, () => {
          console.log("Level 2 Complete - Transitioning to Level 3");
          this.scene.start("Level03_BrothersTraining");
        });
      },
      skippable: true,
    };

    this.dialogueSystem.startDialogue(completeSequence);
  }

  update(time: number, delta: number): void {
    // Skip if dialogue is active
    if (this.dialogueSystem && this.dialogueSystem.isDialogueActive()) {
      this.player.setVelocityX(0);
      return;
    }

    // Update player (handles movement, jumping, animations)
    this.player.update(time, delta);
  }
}
