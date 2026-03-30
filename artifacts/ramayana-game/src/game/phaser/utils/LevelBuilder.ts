import Phaser from "phaser";

/**
 * LevelBuilder - Utility class for rapidly creating level environments
 * Provides reusable methods for common level elements
 */
export class LevelBuilder {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create a sky gradient background
   */
  createSky(
    topColor: number = 0x87ceeb,
    bottomColor: number = 0xffa500,
    height?: number,
  ): Phaser.GameObjects.Graphics {
    const { width, height: h } = this.scene.cameras.main;
    const skyHeight = height || h;

    const sky = this.scene.add.graphics();
    sky.fillGradientStyle(topColor, topColor, bottomColor, bottomColor, 1);
    sky.fillRect(0, 0, width, skyHeight);
    sky.setDepth(-100);
    sky.setScrollFactor(0); // Parallax - sky doesn't move

    return sky;
  }

  /**
   * Create sun or moon
   */
  createCelestialBody(
    x: number,
    y: number,
    radius: number = 60,
    color: number = 0xffd700,
  ): Phaser.GameObjects.Arc {
    const body = this.scene.add.circle(x, y, radius, color);
    body.setDepth(-90);
    body.setScrollFactor(0.1); // Slight parallax

    // Glow effect
    const glow = this.scene.add.circle(x, y, radius + 10, color, 0.3);
    glow.setDepth(-91);
    glow.setScrollFactor(0.1);

    return body;
  }

  /**
   * Create layered mountains with parallax
   */
  createMountainLayers(
    count: number = 3,
    baseY: number = 500,
    colors: number[] = [0x8b7355, 0xa0826d, 0xb89968],
  ): void {
    const { width } = this.scene.cameras.main;

    for (let layer = 0; layer < count; layer++) {
      const color = colors[layer] || 0xb89968;
      const alpha = 0.3 + layer * 0.2;
      const yOffset = baseY - layer * 100;
      const scrollFactor = 0.2 + layer * 0.15;

      const mountains = this.scene.add.graphics();
      mountains.fillStyle(color, alpha);
      mountains.beginPath();
      mountains.moveTo(0, yOffset + 150);

      for (let i = 0; i < 8; i++) {
        const peakX = (i * width) / 7;
        const peakY = yOffset + Phaser.Math.Between(-60, 30);
        mountains.lineTo(peakX, peakY);
      }

      mountains.lineTo(width * 2, yOffset + 150);
      mountains.lineTo(width * 2, yOffset + 300);
      mountains.lineTo(0, yOffset + 300);
      mountains.closePath();
      mountains.fillPath();
      mountains.setDepth(-80 + layer * 5);
      mountains.setScrollFactor(scrollFactor);
    }
  }

  /**
   * Create a forest tree
   */
  createTree(
    x: number,
    y: number,
    width: number = 80,
    height: number = 150,
    animated: boolean = true,
  ): Phaser.GameObjects.Container {
    const tree = this.scene.add.container(x, y);

    // Trunk
    const trunk = this.scene.add.graphics();
    trunk.fillStyle(0x8b4513);
    trunk.fillRect(-width / 8, 0, width / 4, height / 2);
    tree.add(trunk);

    // Foliage (layered for depth)
    const foliage = this.scene.add.graphics();
    foliage.fillStyle(0x228b22, 0.8);
    foliage.fillCircle(0, -height / 4, width / 1.5);
    foliage.fillStyle(0x32cd32, 0.9);
    foliage.fillCircle(-width / 4, -height / 3, width / 2);
    foliage.fillCircle(width / 4, -height / 3, width / 2);
    foliage.fillStyle(0x3cb371);
    foliage.fillCircle(0, -height / 2, width / 1.8);
    tree.add(foliage);

    tree.setDepth(-50);

    // Optional sway animation
    if (animated) {
      this.scene.tweens.add({
        targets: tree,
        x: x - 3,
        duration: 2000 + Phaser.Math.Between(0, 1000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    return tree;
  }

  /**
   * Create a platform
   */
  createPlatform(
    x: number,
    y: number,
    width: number,
    height: number = 32,
    color: number = 0x8b7355,
  ): Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body } {
    const platform = this.scene.add.rectangle(
      x,
      y,
      width,
      height,
      color,
    ) as any;
    this.scene.physics.add.existing(platform, true); // Static body
    return platform;
  }

  /**
   * Create multiple platforms (array of positions)
   */
  createPlatforms(
    positions: Array<{ x: number; y: number; width: number }>,
    group?: Phaser.Physics.Arcade.StaticGroup,
  ): Phaser.Physics.Arcade.StaticGroup {
    const platformGroup = group || this.scene.physics.add.staticGroup();

    positions.forEach(({ x, y, width }) => {
      this.createPlatform(x, y, width);
    });

    return platformGroup;
  }

  /**
   * Create a flowing river
   */
  createRiver(y: number, height: number = 150, animated: boolean = true): void {
    const { width, height: h } = this.scene.cameras.main;

    // River body
    const river = this.scene.add.graphics();
    river.fillGradientStyle(0x4682b4, 0x4682b4, 0x1e90ff, 0x00bfff, 1);
    river.fillRect(0, y, width * 2, height);
    river.setDepth(-70);
    river.setScrollFactor(0.9); // Slight parallax

    if (animated) {
      // Animated ripples
      for (let i = 0; i < 15; i++) {
        const ripple = this.scene.add.ellipse(
          Phaser.Math.Between(0, width * 2),
          y + Phaser.Math.Between(20, height - 20),
          40,
          15,
          0xffffff,
          0.2,
        );
        ripple.setDepth(-69);
        ripple.setScrollFactor(0.9);

        this.scene.tweens.add({
          targets: ripple,
          x: "+=150",
          alpha: { from: 0.2, to: 0 },
          duration: 4000,
          repeat: -1,
          delay: i * 300,
        });
      }
    }
  }

  /**
   * Create ground/floor
   */
  createGround(
    y: number,
    color: number = 0x654321,
    depth: number = 200,
  ): Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body } {
    const { width, height } = this.scene.cameras.main;

    const ground = this.scene.add.rectangle(
      width,
      y,
      width * 2,
      depth,
      color,
    ) as any;

    this.scene.physics.add.existing(ground, true); // Static body
    ground.setDepth(-60);

    return ground;
  }

  /**
   * Create a simple building/structure
   */
  createBuilding(
    x: number,
    y: number,
    width: number,
    height: number,
    roofColor: number = 0x8b4513,
    wallColor: number = 0xd2b48c,
  ): Phaser.GameObjects.Container {
    const building = this.scene.add.container(x, y);

    // Walls
    const walls = this.scene.add.graphics();
    walls.fillStyle(wallColor);
    walls.fillRect(0, height * 0.3, width, height * 0.7);
    building.add(walls);

    // Roof
    const roof = this.scene.add.graphics();
    roof.fillStyle(roofColor);
    roof.fillTriangle(
      -width * 0.1,
      height * 0.3,
      width / 2,
      0,
      width + width * 0.1,
      height * 0.3,
    );
    building.add(roof);

    // Door
    const door = this.scene.add.graphics();
    door.fillStyle(0x654321);
    door.fillRect(width * 0.4, height * 0.6, width * 0.2, height * 0.4);
    building.add(door);

    building.setDepth(-60);

    return building;
  }

  /**
   * Create flying birds
   */
  createBirds(count: number = 5, y: number = 100): void {
    const { width } = this.scene.cameras.main;

    for (let i = 0; i < count; i++) {
      const bird = this.scene.add.graphics();
      bird.lineStyle(2, 0x000000);
      bird.beginPath();
      bird.arc(0, 0, 8, 0, Math.PI, true);
      bird.arc(16, 0, 8, 0, Math.PI, true);
      bird.strokePath();

      bird.setPosition(-50, y + i * 30);
      bird.setDepth(-40);

      this.scene.tweens.add({
        targets: bird,
        x: width * 2 + 50,
        duration: 20000 + i * 2000,
        repeat: -1,
        delay: i * 3000,
      });

      this.scene.tweens.add({
        targets: bird,
        scaleY: { from: 1, to: 0.7 },
        duration: 300,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /**
   * Create clouds
   */
  createClouds(count: number = 8, y: number = 150): void {
    const { width } = this.scene.cameras.main;

    for (let i = 0; i < count; i++) {
      const cloud = this.scene.add.graphics();
      cloud.fillStyle(0xffffff, 0.7);
      cloud.fillCircle(0, 0, 30);
      cloud.fillCircle(40, 0, 35);
      cloud.fillCircle(80, 0, 30);
      cloud.fillCircle(25, -15, 25);
      cloud.fillCircle(55, -15, 28);

      cloud.setPosition(
        Phaser.Math.Between(0, width * 2),
        y + Phaser.Math.Between(-50, 50),
      );
      cloud.setDepth(-85);
      cloud.setScrollFactor(0.3);

      this.scene.tweens.add({
        targets: cloud,
        x: "+=200",
        duration: 30000 + Phaser.Math.Between(-5000, 5000),
        repeat: -1,
      });
    }
  }

  /**
   * Create particle effects (leaves, dust, etc.)
   */
  createAmbientParticles(
    type: "leaves" | "dust" | "rain" | "snow" = "leaves",
    density: number = 20,
  ): void {
    const { width, height } = this.scene.cameras.main;

    let color: number;
    let size: number;
    let fallSpeed: number;

    switch (type) {
      case "leaves":
        color = 0x90ee90;
        size = 8;
        fallSpeed = 3000;
        break;
      case "dust":
        color = 0xd2b48c;
        size = 4;
        fallSpeed = 5000;
        break;
      case "rain":
        color = 0x87ceeb;
        size = 2;
        fallSpeed = 1000;
        break;
      case "snow":
        color = 0xffffff;
        size = 6;
        fallSpeed = 4000;
        break;
    }

    for (let i = 0; i < density; i++) {
      const particle = this.scene.add.circle(
        Phaser.Math.Between(0, width * 2),
        Phaser.Math.Between(-100, height),
        size,
        color,
        0.6,
      );
      particle.setDepth(-30);

      this.scene.tweens.add({
        targets: particle,
        y: height + 100,
        x: "+=50",
        duration: fallSpeed + Phaser.Math.Between(-1000, 1000),
        repeat: -1,
        delay: Phaser.Math.Between(0, fallSpeed),
        onRepeat: () => {
          particle.y = -50;
          particle.x = Phaser.Math.Between(0, width * 2);
        },
      });

      // Rotation for leaves/snow
      if (type === "leaves" || type === "snow") {
        this.scene.tweens.add({
          targets: particle,
          angle: 360,
          duration: 2000,
          repeat: -1,
        });
      }
    }
  }

  /**
   * Create level title display
   */
  createLevelTitle(act: string, levelNumber: number, levelName: string): void {
    const { width } = this.scene.cameras.main;

    const titleContainer = this.scene.add.container(width / 2, 100);
    titleContainer.setDepth(800);
    titleContainer.setScrollFactor(0);

    // Background panel
    const panel = this.scene.add.graphics();
    panel.fillStyle(0x2c1810, 0.9);
    panel.fillRoundedRect(-300, -60, 600, 120, 16);
    panel.lineStyle(4, 0xffd700);
    panel.strokeRoundedRect(-300, -60, 600, 120, 16);

    // Inner border
    panel.lineStyle(2, 0xff8c00);
    panel.strokeRoundedRect(-290, -50, 580, 100, 12);

    titleContainer.add(panel);

    // Title
    const title = this.scene.add.text(0, -25, `${act} - Level ${levelNumber}`, {
      fontSize: "28px",
      fontFamily: "serif",
      color: "#FFD700",
      fontStyle: "bold",
    });
    title.setOrigin(0.5);
    titleContainer.add(title);

    // Subtitle
    const subtitle = this.scene.add.text(0, 15, `"${levelName}"`, {
      fontSize: "22px",
      fontFamily: "serif",
      color: "#FFFFFF",
      fontStyle: "italic",
    });
    subtitle.setOrigin(0.5);
    titleContainer.add(subtitle);

    // Fade in and out animation
    titleContainer.setAlpha(0);
    this.scene.tweens.add({
      targets: titleContainer,
      alpha: 1,
      duration: 800,
      ease: "Power2",
      onComplete: () => {
        this.scene.tweens.add({
          targets: titleContainer,
          alpha: 0,
          duration: 800,
          delay: 3000,
          onComplete: () => titleContainer.destroy(),
        });
      },
    });
  }

  /**
   * Create HUD display
   */
  createHUD(
    player: any,
    showDharma: boolean = true,
  ): Phaser.GameObjects.Container {
    const hud = this.scene.add.container(20, 20);
    hud.setDepth(950);
    hud.setScrollFactor(0);

    // Health bar
    const healthLabel = this.scene.add.text(0, 0, "HP:", {
      fontSize: "20px",
      fontFamily: "serif",
      color: "#FFFFFF",
      fontStyle: "bold",
    });
    hud.add(healthLabel);

    const healthBar = this.scene.add.graphics();
    this.updateHealthBar(healthBar, player.health, player.maxHealth);
    hud.add(healthBar);

    // Mana bar
    const manaLabel = this.scene.add.text(0, 35, "MP:", {
      fontSize: "20px",
      fontFamily: "serif",
      color: "#FFFFFF",
      fontStyle: "bold",
    });
    hud.add(manaLabel);

    const manaBar = this.scene.add.graphics();
    this.updateManaBar(manaBar, player.mana, player.maxMana);
    hud.add(manaBar);

    // Dharma indicator
    if (showDharma) {
      const dharmaLabel = this.scene.add.text(0, 70, "Dharma:", {
        fontSize: "18px",
        fontFamily: "serif",
        color: "#FFD700",
        fontStyle: "bold",
      });
      hud.add(dharmaLabel);

      const dharmaText = this.scene.add.text(
        100,
        70,
        player.dharma.toString(),
        {
          fontSize: "18px",
          fontFamily: "serif",
          color: "#FFD700",
        },
      );
      hud.add(dharmaText);
    }

    return hud;
  }

  /**
   * Update health bar
   */
  updateHealthBar(
    bar: Phaser.GameObjects.Graphics,
    current: number,
    max: number,
  ): void {
    bar.clear();

    const width = 200;
    const height = 20;
    const x = 50;
    const y = 0;

    // Background
    bar.fillStyle(0x000000, 0.5);
    bar.fillRect(x, y, width, height);

    // Health (red to green gradient based on percentage)
    const percent = Math.max(0, current / max);
    const healthWidth = width * percent;
    const color =
      percent > 0.5 ? 0x00ff00 : percent > 0.25 ? 0xffff00 : 0xff0000;

    bar.fillStyle(color);
    bar.fillRect(x, y, healthWidth, height);

    // Border
    bar.lineStyle(2, 0xffffff);
    bar.strokeRect(x, y, width, height);
  }

  /**
   * Update mana bar
   */
  updateManaBar(
    bar: Phaser.GameObjects.Graphics,
    current: number,
    max: number,
  ): void {
    bar.clear();

    const width = 200;
    const height = 20;
    const x = 50;
    const y = 35;

    // Background
    bar.fillStyle(0x000000, 0.5);
    bar.fillRect(x, y, width, height);

    // Mana (blue)
    const percent = Math.max(0, current / max);
    const manaWidth = width * percent;

    bar.fillStyle(0x00bfff);
    bar.fillRect(x, y, manaWidth, height);

    // Border
    bar.lineStyle(2, 0xffffff);
    bar.strokeRect(x, y, width, height);
  }
}
