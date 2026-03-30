import Phaser from "phaser";
import { GAME_CONFIG } from "../config/gameConfig";
import { AstraId, ASTRAS } from "../config/astras";

export type ArrowType = "normal" | "fire" | "divine";

/**
 * Arrow - Projectile class for Rama's archery
 * Handles physics, trajectory, and collision
 */
export class Arrow extends Phaser.Physics.Arcade.Sprite {
  private arrowType: ArrowType;
  private damage: number;
  private ownerId: string;
  private hasHit: boolean = false;
  private astraId?: AstraId;
  private trailEffect?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    angle: number,
    power: number,
    arrowType: ArrowType = "normal",
    ownerId: string = "player",
    astraId?: AstraId,
  ) {
    // Select texture based on type
    let texture = "arrow";
    if (arrowType === "fire" || astraId === "AGNEYASTRA") {
      texture = "arrow-fire";
    } else if (arrowType === "divine" || astraId === "BRAHMASTRA") {
      texture = "arrow-divine";
    } else if (astraId === "VARUNASTRA") {
      texture = "arrow-water";
    }

    super(scene, x, y, texture);

    this.arrowType = arrowType;
    this.ownerId = ownerId;
    this.astraId = astraId;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Calculate damage
    this.damage = this.calculateDamage(power);

    // Set up physics
    this.setupPhysics(angle, power);

    // Visual setup
    this.setupVisuals();

    // Create trail effect
    this.createTrailEffect();
  }

  private calculateDamage(power: number): number {
    let baseDamage = 10;

    // Modify by arrow type
    switch (this.arrowType) {
      case "fire":
        baseDamage = 15;
        break;
      case "divine":
        baseDamage = 25;
        break;
    }

    // Modify by Astra
    if (this.astraId) {
      const astra = ASTRAS[this.astraId];
      baseDamage += astra.damage;
    }

    // Power multiplier (0.5 to 1.0)
    return Math.floor(baseDamage * (0.5 + power * 0.5));
  }

  private setupPhysics(angle: number, power: number): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Calculate velocity based on angle and power
    const speed = GAME_CONFIG.COMBAT.ARROW_SPEED * power;
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    body.setVelocity(velocityX, velocityY);

    // Enable gravity for realistic arc
    body.setGravityY(300);

    // Set size
    body.setSize(32, 8);

    // Set rotation to match velocity
    this.rotation = angle;
  }

  private setupVisuals(): void {
    // Scale
    this.setScale(1.5, 1.2);

    // Add glow for special arrows
    if (this.arrowType !== "normal") {
      this.setAlpha(0.9);
    }
  }

  private createTrailEffect(): void {
    // Create particle trail based on arrow type
    if (this.arrowType === "fire" || this.astraId === "AGNEYASTRA") {
      // Fire trail
      this.trailEffect = this.scene.add.particles(
        this.x,
        this.y,
        "particle-ff4500",
        {
          speed: { min: 10, max: 30 },
          scale: { start: 0.4, end: 0 },
          alpha: { start: 0.8, end: 0 },
          lifespan: 200,
          frequency: 20,
          blendMode: "ADD",
          follow: this,
        },
      );
    } else if (this.arrowType === "divine" || this.astraId === "BRAHMASTRA") {
      // Divine glow trail
      this.trailEffect = this.scene.add.particles(
        this.x,
        this.y,
        "particle-ffd700",
        {
          speed: { min: 10, max: 30 },
          scale: { start: 0.5, end: 0 },
          alpha: { start: 0.9, end: 0 },
          lifespan: 300,
          frequency: 15,
          blendMode: "ADD",
          follow: this,
        },
      );
    } else if (this.astraId === "VARUNASTRA") {
      // Water trail
      this.trailEffect = this.scene.add.particles(
        this.x,
        this.y,
        "particle-00bfff",
        {
          speed: { min: 10, max: 30 },
          scale: { start: 0.4, end: 0 },
          alpha: { start: 0.7, end: 0 },
          lifespan: 250,
          frequency: 20,
          blendMode: "NORMAL",
          follow: this,
        },
      );
    }
  }

  update(): void {
    if (this.hasHit) return;

    // Update rotation to match velocity direction
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      this.rotation = Math.atan2(body.velocity.y, body.velocity.x);
    }

    // Check if arrow has gone off screen or too far
    if (
      this.y > this.scene.cameras.main.height + 100 ||
      this.x < -100 ||
      this.x > this.scene.cameras.main.width + 100
    ) {
      this.destroy();
    }
  }

  /**
   * Handle arrow hitting something
   */
  hit(target?: Phaser.GameObjects.GameObject): void {
    if (this.hasHit) return;

    this.hasHit = true;

    // Stop physics
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      body.setGravity(0, 0);
    }

    // Stop trail effect
    if (this.trailEffect) {
      this.trailEffect.stop();
    }

    // Create hit effect
    this.createHitEffect();

    // Emit event for damage calculation
    this.scene.events.emit("arrow-hit", {
      arrow: this,
      target: target,
      damage: this.damage,
      arrowType: this.arrowType,
      astraId: this.astraId,
      ownerId: this.ownerId,
    });

    // Destroy arrow after brief delay
    this.scene.time.delayedCall(100, () => {
      this.destroy();
    });
  }

  private createHitEffect(): void {
    // Create visual hit effect based on type
    const effectColor =
      this.arrowType === "fire" || this.astraId === "AGNEYASTRA"
        ? 0xff4500
        : this.arrowType === "divine" || this.astraId === "BRAHMASTRA"
          ? 0xffd700
          : this.astraId === "VARUNASTRA"
            ? 0x00bfff
            : 0xffffff;

    // Create impact particle burst
    const particles = this.scene.add.particles(
      this.x,
      this.y,
      "particle-" + effectColor.toString(16),
      {
        speed: { min: 50, max: 200 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 500,
        quantity: 30,
        blendMode: "ADD",
      },
    );

    // Destroy after emission
    this.scene.time.delayedCall(600, () => particles.destroy());

    // Create a simple flash circle
    const hitCircle = this.scene.add.circle(
      this.x,
      this.y,
      20,
      effectColor,
      0.7,
    );

    this.scene.tweens.add({
      targets: hitCircle,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => hitCircle.destroy(),
    });

    // Special Astra effects
    if (this.astraId === "AGNEYASTRA") {
      // Fire explosion
      const fireRing = this.scene.add.circle(this.x, this.y, 10, 0xff0000, 0.5);
      this.scene.tweens.add({
        targets: fireRing,
        scale: 5,
        alpha: 0,
        duration: 600,
        onComplete: () => fireRing.destroy(),
      });
    } else if (this.astraId === "VARUNASTRA") {
      // Water splash
      const waterSplash = this.scene.add.circle(
        this.x,
        this.y,
        15,
        0x00bfff,
        0.6,
      );
      this.scene.tweens.add({
        targets: waterSplash,
        scaleX: 4,
        scaleY: 2,
        alpha: 0,
        duration: 400,
        onComplete: () => waterSplash.destroy(),
      });
    }
  }

  /**
   * Check if this arrow can hit a specific target
   */
  canHit(targetId: string): boolean {
    // Player arrows can't hit player, enemy arrows can't hit enemies
    if (this.ownerId === "player" && targetId === "player") {
      return false;
    }
    if (this.ownerId !== "player" && targetId !== "player") {
      return false;
    }
    return true;
  }

  // Getters
  getDamage(): number {
    return this.damage;
  }

  getArrowType(): ArrowType {
    return this.arrowType;
  }

  getOwnerId(): string {
    return this.ownerId;
  }

  getAstraId(): AstraId | undefined {
    return this.astraId;
  }

  isHeadshot(): boolean {
    // This will be determined by collision position
    // For now, return false - will be enhanced
    return false;
  }
}
