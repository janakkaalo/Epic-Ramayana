import Phaser from "phaser";

/**
 * AssetGenerator - Creates detailed animated sprites with traditional Indian art style
 * Generates complete sprite sheets with multiple animation frames
 */
export class AssetGenerator {
  /**
   * Draw a detailed Rama character (traditional Indian prince style)
   */
  private static drawRama(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    frame: number,
    animType: string,
  ): void {
    const w = 48;
    const h = 64;

    // Animation offsets
    let walkCycle = 0;
    let armAngle = 0;
    let legOffset = 0;

    if (animType === "walk") {
      walkCycle = Math.sin((frame / 4) * Math.PI) * 3;
      legOffset = Math.sin((frame / 4) * Math.PI) * 5;
    } else if (animType === "run") {
      walkCycle = Math.sin((frame / 2) * Math.PI) * 5;
      legOffset = Math.sin((frame / 2) * Math.PI) * 8;
    } else if (animType === "jump") {
      armAngle = -30;
      legOffset = -5;
    } else if (animType === "aim") {
      armAngle = -45;
    }

    // Legs (brown dhoti)
    g.fillStyle(0x8b4513);
    g.fillRect(x + 14 - legOffset, y + 40, 8, 24);
    g.fillRect(x + 26 + legOffset, y + 40, 8, 24);

    // Torso (royal blue with gold trim)
    g.fillStyle(0x4169e1); // Royal blue
    g.fillRoundedRect(x + 8, y + 20, 32, 24, 4);

    // Gold trim decoration
    g.fillStyle(0xffd700);
    g.fillRect(x + 8, y + 20, 32, 3);
    g.fillRect(x + 8, y + 41, 32, 3);

    // Arms (skin tone)
    g.fillStyle(0x8b6f47);
    const armX = animType === "aim" ? x + 35 : x + 32;
    const armY = y + 22 + walkCycle;
    g.fillRect(x + 8, y + 22 + walkCycle, 8, 16);
    g.fillRect(armX, armY, 8, 16);

    // Head (blue skin - Lord Rama)
    g.fillStyle(0x4682b4); // Steel blue for divine appearance
    g.fillCircle(x + w / 2, y + 12, 10);

    // Crown (golden)
    g.fillStyle(0xffd700);
    g.fillTriangle(
      x + w / 2 - 10,
      y + 5,
      x + w / 2,
      y - 2,
      x + w / 2 + 10,
      y + 5,
    );
    // Crown jewel
    g.fillStyle(0xff0000);
    g.fillCircle(x + w / 2, y + 2, 2);

    // Face features
    g.fillStyle(0x000000);
    g.fillCircle(x + w / 2 - 4, y + 10, 2); // Left eye
    g.fillCircle(x + w / 2 + 4, y + 10, 2); // Right eye
    // Tilak (forehead mark)
    g.fillStyle(0xffff00);
    g.fillRect(x + w / 2 - 1, y + 6, 2, 4);

    // Bow (if aiming)
    if (animType === "aim" || animType === "shoot") {
      g.lineStyle(3, 0x8b4513);
      g.beginPath();
      g.arc(x + 40, y + 25, 15, -Math.PI / 2, Math.PI / 2);
      g.strokePath();
      // Bowstring
      g.lineStyle(1, 0xffffe0);
      g.lineBetween(x + 40, y + 10, x + 40, y + 40);
    }

    // Outline for definition
    g.lineStyle(1, 0x000000);
    g.strokeCircle(x + w / 2, y + 12, 10);
  }

  /**
   * Draw a detailed Rakshasa enemy
   */
  private static drawRakshasa(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    frame: number,
    animType: string,
  ): void {
    const w = 48;
    const h = 64;

    let walkCycle = 0;
    let legOffset = 0;
    let armOffset = 0;

    if (animType === "walk") {
      walkCycle = Math.sin((frame / 4) * Math.PI) * 3;
      legOffset = Math.sin((frame / 4) * Math.PI) * 5;
    } else if (animType === "attack") {
      armOffset = 10;
    }

    // Legs (dark purple)
    g.fillStyle(0x4b0082);
    g.fillRect(x + 14 - legOffset, y + 40, 8, 24);
    g.fillRect(x + 26 + legOffset, y + 40, 8, 24);

    // Torso (dark indigo with spikes)
    g.fillStyle(0x483d8b);
    g.fillRoundedRect(x + 8, y + 20, 32, 24, 4);

    // Spikes/armor
    g.fillStyle(0x696969);
    g.fillTriangle(x + 8, y + 25, x + 6, y + 30, x + 8, y + 35);
    g.fillTriangle(x + 40, y + 25, x + 42, y + 30, x + 40, y + 35);

    // Arms
    g.fillStyle(0x8b008b);
    g.fillRect(x + 6, y + 22 + walkCycle, 8, 16);
    g.fillRect(x + 34 + armOffset, y + 22 + walkCycle, 8, 16);

    // Head (demonic purple)
    g.fillStyle(0x8b008b);
    g.fillCircle(x + w / 2, y + 12, 11);

    // Horns
    g.fillStyle(0x000000);
    g.fillTriangle(
      x + w / 2 - 10,
      y + 5,
      x + w / 2 - 8,
      y - 3,
      x + w / 2 - 6,
      y + 5,
    );
    g.fillTriangle(
      x + w / 2 + 10,
      y + 5,
      x + w / 2 + 8,
      y - 3,
      x + w / 2 + 6,
      y + 5,
    );

    // Eyes (glowing red)
    g.fillStyle(0xff0000);
    g.fillCircle(x + w / 2 - 4, y + 10, 3);
    g.fillCircle(x + w / 2 + 4, y + 10, 3);

    // Fangs
    g.fillStyle(0xffffff);
    g.fillTriangle(
      x + w / 2 - 3,
      y + 16,
      x + w / 2 - 2,
      y + 19,
      x + w / 2 - 1,
      y + 16,
    );
    g.fillTriangle(
      x + w / 2 + 3,
      y + 16,
      x + w / 2 + 2,
      y + 19,
      x + w / 2 + 1,
      y + 16,
    );

    // Outline
    g.lineStyle(1, 0x000000);
    g.strokeCircle(x + w / 2, y + 12, 11);
  }

  /**
   * Generate animated sprite sheet for Rama
   */
  static generateRamaSprites(scene: Phaser.Scene): void {
    const frameW = 64;
    const frameH = 64;
    const animations = {
      idle: 4,
      walk: 8,
      run: 8,
      jump: 1,
      aim: 1,
      shoot: 3,
    };

    // Calculate total frames
    let totalFrames = 0;
    Object.values(animations).forEach((count) => (totalFrames += count));

    const width = frameW * totalFrames;
    const height = frameH;

    const graphics = scene.add.graphics();
    let currentX = 0;

    // Generate each animation
    for (const [animType, frameCount] of Object.entries(animations)) {
      for (let i = 0; i < frameCount; i++) {
        this.drawRama(graphics, currentX + 8, 0, i, animType);
        currentX += frameW;
      }
    }

    graphics.generateTexture("rama-spritesheet", width, height);
    graphics.destroy();

    // Create animations
    if (!scene.anims.exists("rama-idle")) {
      scene.anims.create({
        key: "rama-idle",
        frames: scene.anims.generateFrameNumbers("rama-spritesheet", {
          start: 0,
          end: 3,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }

    let frameStart = 4;
    if (!scene.anims.exists("rama-walk")) {
      scene.anims.create({
        key: "rama-walk",
        frames: scene.anims.generateFrameNumbers("rama-spritesheet", {
          start: frameStart,
          end: frameStart + 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    frameStart += 8;
    if (!scene.anims.exists("rama-run")) {
      scene.anims.create({
        key: "rama-run",
        frames: scene.anims.generateFrameNumbers("rama-spritesheet", {
          start: frameStart,
          end: frameStart + 7,
        }),
        frameRate: 16,
        repeat: -1,
      });
    }

    frameStart += 8;
    if (!scene.anims.exists("rama-jump")) {
      scene.anims.create({
        key: "rama-jump",
        frames: [{ key: "rama-spritesheet", frame: frameStart }],
        frameRate: 1,
      });
    }

    frameStart += 1;
    if (!scene.anims.exists("rama-aim")) {
      scene.anims.create({
        key: "rama-aim",
        frames: [{ key: "rama-spritesheet", frame: frameStart }],
        frameRate: 1,
      });
    }

    frameStart += 1;
    if (!scene.anims.exists("rama-shoot")) {
      scene.anims.create({
        key: "rama-shoot",
        frames: scene.anims.generateFrameNumbers("rama-spritesheet", {
          start: frameStart,
          end: frameStart + 2,
        }),
        frameRate: 15,
      });
    }

    console.log("Generated Rama animated sprite sheet with all animations");
  }

  /**
   * Generate animated sprite sheet for Rakshasa enemies
   */
  static generateRakshasaSprites(scene: Phaser.Scene): void {
    const frameW = 64;
    const frameH = 64;
    const animations = {
      idle: 4,
      walk: 8,
      attack: 6,
      hit: 2,
      death: 4,
    };

    let totalFrames = 0;
    Object.values(animations).forEach((count) => (totalFrames += count));

    const width = frameW * totalFrames;
    const height = frameH;

    const graphics = scene.add.graphics();
    let currentX = 0;

    for (const [animType, frameCount] of Object.entries(animations)) {
      for (let i = 0; i < frameCount; i++) {
        this.drawRakshasa(graphics, currentX + 8, 0, i, animType);
        currentX += frameW;
      }
    }

    graphics.generateTexture("rakshasa-spritesheet", width, height);
    graphics.destroy();

    // Create animations
    if (!scene.anims.exists("rakshasa-idle")) {
      scene.anims.create({
        key: "rakshasa-idle",
        frames: scene.anims.generateFrameNumbers("rakshasa-spritesheet", {
          start: 0,
          end: 3,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }

    if (!scene.anims.exists("rakshasa-walk")) {
      scene.anims.create({
        key: "rakshasa-walk",
        frames: scene.anims.generateFrameNumbers("rakshasa-spritesheet", {
          start: 4,
          end: 11,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!scene.anims.exists("rakshasa-attack")) {
      scene.anims.create({
        key: "rakshasa-attack",
        frames: scene.anims.generateFrameNumbers("rakshasa-spritesheet", {
          start: 12,
          end: 17,
        }),
        frameRate: 12,
      });
    }

    if (!scene.anims.exists("rakshasa-hit")) {
      scene.anims.create({
        key: "rakshasa-hit",
        frames: scene.anims.generateFrameNumbers("rakshasa-spritesheet", {
          start: 18,
          end: 19,
        }),
        frameRate: 10,
      });
    }

    if (!scene.anims.exists("rakshasa-death")) {
      scene.anims.create({
        key: "rakshasa-death",
        frames: scene.anims.generateFrameNumbers("rakshasa-spritesheet", {
          start: 20,
          end: 23,
        }),
        frameRate: 8,
      });
    }

    console.log("Generated Rakshasa animated sprite sheet with all animations");
  }

  /**
   * Generate detailed arrow sprite with glow effect
   */
  static generateArrowSprite(scene: Phaser.Scene): void {
    const graphics = scene.add.graphics();

    // Glow effect
    graphics.fillStyle(0xffffe0, 0.3);
    graphics.fillEllipse(16, 4, 40, 12);

    // Arrow shaft (brown wood)
    graphics.fillStyle(0x8b4513);
    graphics.fillRect(0, 3, 28, 2);

    // Arrow head (silver/steel)
    graphics.fillStyle(0xc0c0c0);
    graphics.beginPath();
    graphics.moveTo(28, 0);
    graphics.lineTo(32, 4);
    graphics.lineTo(28, 8);
    graphics.closePath();
    graphics.fillPath();

    // Arrow head shine
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillTriangle(28, 2, 30, 4, 28, 6);

    // Fletching (white feathers)
    graphics.fillStyle(0xffffff);
    graphics.fillTriangle(2, 2, 0, 0, 0, 4);
    graphics.fillTriangle(2, 6, 0, 8, 0, 4);
    graphics.fillTriangle(4, 2, 2, 0, 2, 4);
    graphics.fillTriangle(4, 6, 2, 8, 2, 4);

    graphics.generateTexture("arrow", 32, 8);
    graphics.destroy();
  }

  /**
   * Generate fire arrow for Agneyastra
   */
  static generateFireArrow(scene: Phaser.Scene): void {
    const graphics = scene.add.graphics();

    // Fire glow
    graphics.fillStyle(0xff4500, 0.5);
    graphics.fillEllipse(16, 4, 50, 16);

    // Arrow shaft
    graphics.fillStyle(0xff0000);
    graphics.fillRect(0, 3, 28, 2);

    // Flaming arrow head
    graphics.fillStyle(0xffa500);
    graphics.beginPath();
    graphics.moveTo(28, 0);
    graphics.lineTo(34, 4);
    graphics.lineTo(28, 8);
    graphics.closePath();
    graphics.fillPath();

    // Fire effect on tip
    graphics.fillStyle(0xff0000);
    graphics.fillCircle(32, 4, 3);
    graphics.fillStyle(0xffff00);
    graphics.fillCircle(32, 4, 1.5);

    graphics.generateTexture("arrow-fire", 34, 8);
    graphics.destroy();
  }

  /**
   * Generate water arrow for Varunastra
   */
  static generateWaterArrow(scene: Phaser.Scene): void {
    const graphics = scene.add.graphics();

    // Water glow
    graphics.fillStyle(0x00bfff, 0.4);
    graphics.fillEllipse(16, 4, 50, 16);

    // Arrow shaft
    graphics.fillStyle(0x4682b4);
    graphics.fillRect(0, 3, 28, 2);

    // Water arrow head
    graphics.fillStyle(0x00bfff);
    graphics.beginPath();
    graphics.moveTo(28, 0);
    graphics.lineTo(34, 4);
    graphics.lineTo(28, 8);
    graphics.closePath();
    graphics.fillPath();

    // Water droplet effect
    graphics.fillStyle(0x87ceeb);
    graphics.fillCircle(30, 2, 2);
    graphics.fillCircle(30, 6, 2);

    graphics.generateTexture("arrow-water", 34, 8);
    graphics.destroy();
  }

  /**
   * Generate divine arrow for Brahmastra
   */
  static generateDivineArrow(scene: Phaser.Scene): void {
    const graphics = scene.add.graphics();

    // Divine glow (rainbow)
    graphics.fillStyle(0xffd700, 0.6);
    graphics.fillEllipse(16, 4, 60, 20);

    // Arrow shaft (golden)
    graphics.fillStyle(0xffd700);
    graphics.fillRect(0, 3, 28, 2);

    // Divine arrow head (radiant gold)
    graphics.fillStyle(0xffdf00);
    graphics.beginPath();
    graphics.moveTo(28, 0);
    graphics.lineTo(36, 4);
    graphics.lineTo(28, 8);
    graphics.closePath();
    graphics.fillPath();

    // Divine symbols
    graphics.fillStyle(0xffffff);
    for (let i = 0; i < 3; i++) {
      graphics.fillCircle(5 + i * 8, 4, 1);
    }

    graphics.generateTexture("arrow-divine", 36, 8);
    graphics.destroy();
  }

  /**
   * Generate platform/ground tiles
   */
  static generatePlatformTile(
    scene: Phaser.Scene,
    key: string,
    color: number,
    width: number = 64,
    height: number = 32,
  ): void {
    const graphics = scene.add.graphics();

    // Base color
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, width, height);

    // Stone texture
    graphics.lineStyle(1, 0x000000, 0.2);
    for (let x = 0; x < width; x += 16) {
      graphics.lineTo(x, 0);
      graphics.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 16) {
      graphics.lineTo(0, y);
      graphics.lineTo(width, y);
    }
    graphics.strokePath();

    // Add some variation/cracks
    graphics.lineStyle(1, 0x000000, 0.3);
    graphics.lineBetween(5, 5, 20, 15);
    graphics.lineBetween(40, 8, 55, 20);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * Generate detailed background with layers
   */
  static generateBackground(
    scene: Phaser.Scene,
    key: string,
    gradientTop: number,
    gradientBottom: number,
  ): void {
    const { width, height } = scene.cameras.main;
    const graphics = scene.add.graphics();

    // Gradient sky
    for (let y = 0; y < height; y++) {
      const ratio = y / height;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.IntegerToColor(gradientTop),
        Phaser.Display.Color.IntegerToColor(gradientBottom),
        100,
        ratio * 100,
      );
      graphics.fillStyle(
        Phaser.Display.Color.GetColor(color.r, color.g, color.b),
      );
      graphics.fillRect(0, y, width, 1);
    }

    // Add clouds
    graphics.fillStyle(0xffffff, 0.4);
    graphics.fillEllipse(width * 0.2, height * 0.2, 100, 40);
    graphics.fillEllipse(width * 0.5, height * 0.15, 120, 50);
    graphics.fillEllipse(width * 0.8, height * 0.25, 90, 35);

    // Add distant mountains
    graphics.fillStyle(0x8b7355, 0.3);
    graphics.fillTriangle(
      0,
      height,
      width * 0.3,
      height * 0.4,
      width * 0.6,
      height,
    );
    graphics.fillTriangle(
      width * 0.4,
      height,
      width * 0.7,
      height * 0.5,
      width,
      height,
    );

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * Create particle emitter for effects
   */
  static createParticleEmitter(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number,
    count: number = 20,
  ): Phaser.GameObjects.Particles.ParticleEmitter {
    // Create particle texture
    const graphics = scene.add.graphics();
    graphics.fillStyle(color);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture("particle-" + color.toString(16), 4, 4);
    graphics.destroy();

    const particles = scene.add.particles(
      x,
      y,
      "particle-" + color.toString(16),
      {
        speed: { min: 50, max: 150 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 500,
        quantity: count,
        blendMode: "ADD",
      },
    );

    return particles;
  }

  /**
   * Generate all game assets
   */
  static generateAllBasicAssets(scene: Phaser.Scene): void {
    // Characters with animations
    this.generateRamaSprites(scene);
    this.generateRakshasaSprites(scene);

    // Weapons
    this.generateArrowSprite(scene);
    this.generateFireArrow(scene);
    this.generateWaterArrow(scene);
    this.generateDivineArrow(scene);

    // Environment
    this.generatePlatformTile(scene, "platform-stone", 0xd2691e, 100, 50);
    this.generatePlatformTile(scene, "ground", 0x8b4513, 100, 50);

    // Backgrounds
    this.generateBackground(scene, "sky-day", 0x87ceeb, 0xe6f2ff);
    this.generateBackground(scene, "sky-forest", 0x556b2f, 0x8fbc8f);

    console.log("AssetGenerator: All animated assets generated successfully!");
  }
}
