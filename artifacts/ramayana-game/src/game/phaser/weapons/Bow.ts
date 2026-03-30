import Phaser from "phaser";
import { Arrow, ArrowType } from "./Arrow";
import { AstraId } from "../config/astras";
import { GAME_CONFIG } from "../config/gameConfig";

/**
 * Bow - Rama's divine bow (Sharanga)
 * Manages aiming, charging, and shooting arrows
 */
export class Bow {
  private scene: Phaser.Scene;
  private owner: Phaser.GameObjects.GameObject;
  private isAiming: boolean = false;
  private chargeLevel: number = 0;
  private aimAngle: number = 0;
  private arrows: Arrow[] = [];
  private maxArrows: number = 50; // Max arrows on screen

  // Aim indicator graphics
  private aimLine?: Phaser.GameObjects.Graphics;
  private aimArc?: Phaser.GameObjects.Graphics;
  private windIndicator?: Phaser.GameObjects.Text;

  // Wind effect (adds challenge)
  private windStrength: number = 0;
  private windDirection: number = 0;

  constructor(scene: Phaser.Scene, owner: Phaser.GameObjects.GameObject) {
    this.scene = scene;
    this.owner = owner;

    // Create aim indicators
    this.createAimIndicators();

    // Random wind changes
    this.setupWindSystem();
  }

  private createAimIndicators(): void {
    this.aimLine = this.scene.add.graphics();
    this.aimLine.setDepth(100);
    this.aimLine.setVisible(false);

    this.aimArc = this.scene.add.graphics();
    this.aimArc.setDepth(99);
    this.aimArc.setVisible(false);

    this.windIndicator = this.scene.add
      .text(10, 150, "Wind: None", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFFFFF",
        backgroundColor: "#000000",
        padding: { x: 5, y: 3 },
      })
      .setScrollFactor(0)
      .setDepth(101);
  }

  private setupWindSystem(): void {
    // Change wind periodically
    this.scene.time.addEvent({
      delay: 10000, // Every 10 seconds
      callback: () => {
        this.windStrength = Phaser.Math.Between(0, 3) / 10; // 0 to 0.3
        this.windDirection = Phaser.Math.Between(-1, 1);
        this.updateWindIndicator();
      },
      loop: true,
    });

    this.updateWindIndicator();
  }

  private updateWindIndicator(): void {
    if (!this.windIndicator) return;

    if (this.windStrength === 0) {
      this.windIndicator.setText("Wind: None");
    } else {
      const dir =
        this.windDirection > 0 ? "→" : this.windDirection < 0 ? "←" : "";
      const strength =
        this.windStrength < 0.15
          ? "Light"
          : this.windStrength < 0.25
            ? "Medium"
            : "Strong";
      this.windIndicator.setText(`Wind: ${strength} ${dir}`);
    }
  }

  /**
   * Start aiming the bow
   */
  startAiming(): void {
    this.isAiming = true;
    this.chargeLevel = 0;

    this.aimLine?.setVisible(true);
    this.aimArc?.setVisible(true);

    this.scene.events.emit("bow-aim-start");
  }

  /**
   * Stop aiming and shoot
   */
  stopAiming(ownerSprite: Phaser.Physics.Arcade.Sprite): void {
    if (!this.isAiming) return;

    this.isAiming = false;

    // Shoot arrow
    this.shootArrow(ownerSprite);

    this.aimLine?.setVisible(false);
    this.aimArc?.setVisible(false);

    this.scene.events.emit("bow-aim-stop");
  }

  /**
   * Update aiming (called every frame while aiming)
   */
  updateAiming(
    ownerSprite: Phaser.Physics.Arcade.Sprite,
    targetX: number,
    targetY: number,
    delta: number,
  ): void {
    if (!this.isAiming) return;

    // Increase charge level
    this.chargeLevel = Math.min(1, this.chargeLevel + delta / 1000); // Full charge in 1 second

    // Calculate aim angle
    const dx = targetX - ownerSprite.x;
    const dy = targetY - ownerSprite.y;
    this.aimAngle = Math.atan2(dy, dx);

    // Draw aim indicator
    this.drawAimIndicator(ownerSprite);
  }

  private drawAimIndicator(ownerSprite: Phaser.Physics.Arcade.Sprite): void {
    if (!this.aimLine || !this.aimArc) return;

    const startX = ownerSprite.x;
    const startY = ownerSprite.y - 20; // Slightly above center

    // Clear previous
    this.aimLine.clear();
    this.aimArc.clear();

    // Draw aim line
    const lineLength = 100 + this.chargeLevel * 100;
    const endX = startX + Math.cos(this.aimAngle) * lineLength;
    const endY = startY + Math.sin(this.aimAngle) * lineLength;

    // Color based on charge
    const color =
      this.chargeLevel < 0.5
        ? 0xffffff
        : this.chargeLevel < 0.8
          ? 0xffff00
          : 0xff0000;

    this.aimLine.lineStyle(2, color, 0.8);
    this.aimLine.beginPath();
    this.aimLine.moveTo(startX, startY);
    this.aimLine.lineTo(endX, endY);
    this.aimLine.strokePath();

    // Draw crosshair at end
    this.aimLine.lineStyle(1, color, 0.6);
    this.aimLine.strokeCircle(endX, endY, 10);
    this.aimLine.beginPath();
    this.aimLine.moveTo(endX - 15, endY);
    this.aimLine.lineTo(endX + 15, endY);
    this.aimLine.moveTo(endX, endY - 15);
    this.aimLine.lineTo(endX, endY + 15);
    this.aimLine.strokePath();

    // Draw arc showing trajectory (simplified)
    this.drawTrajectoryArc(startX, startY);
  }

  private drawTrajectoryArc(startX: number, startY: number): void {
    if (!this.aimArc) return;

    const speed = GAME_CONFIG.COMBAT.ARROW_SPEED * this.chargeLevel;
    const velocityX = Math.cos(this.aimAngle) * speed;
    const velocityY = Math.sin(this.aimAngle) * speed;

    // Draw arc showing where arrow will go
    this.aimArc.lineStyle(1, 0xffff00, 0.3);
    this.aimArc.beginPath();

    let x = startX;
    let y = startY;
    let vx = velocityX;
    let vy = velocityY;
    const gravity = 300 / 60; // Gravity per frame (assuming 60fps)

    this.aimArc.moveTo(x, y);

    // Simulate 60 frames of trajectory
    for (let i = 0; i < 60; i++) {
      x += vx / 60;
      y += vy / 60;
      vy += gravity;

      this.aimArc.lineTo(x, y);

      // Stop if goes off screen or hits ground
      if (
        y > this.scene.cameras.main.height ||
        x < 0 ||
        x > this.scene.cameras.main.width * 2
      ) {
        break;
      }
    }

    this.aimArc.strokePath();
  }

  /**
   * Shoot an arrow
   */
  private shootArrow(
    ownerSprite: Phaser.Physics.Arcade.Sprite,
    arrowType: ArrowType = "normal",
    astraId?: AstraId,
  ): void {
    // Check arrow limit
    this.cleanupArrows();
    if (this.arrows.length >= this.maxArrows) {
      console.warn("Max arrows reached");
      return;
    }

    const startX = ownerSprite.x + (ownerSprite.flipX ? -30 : 30);
    const startY = ownerSprite.y - 20;

    // Apply wind effect
    let finalAngle = this.aimAngle;
    if (this.windStrength > 0) {
      finalAngle += this.windDirection * this.windStrength * 0.2;
    }

    // Create arrow
    const arrow = new Arrow(
      this.scene,
      startX,
      startY,
      finalAngle,
      this.chargeLevel,
      arrowType,
      "player",
      astraId,
    );

    this.arrows.push(arrow);

    // Play shoot sound (when audio implemented)
    // this.scene.sound.play('arrow-shoot');

    this.scene.events.emit("arrow-shot", {
      x: startX,
      y: startY,
      angle: finalAngle,
      power: this.chargeLevel,
      type: arrowType,
    });
  }

  /**
   * Shoot with specific Astra
   */
  shootAstra(
    ownerSprite: Phaser.Physics.Arcade.Sprite,
    astraId: AstraId,
  ): void {
    this.shootArrow(ownerSprite, "divine", astraId);
  }

  /**
   * Clean up destroyed arrows
   */
  private cleanupArrows(): void {
    this.arrows = this.arrows.filter((arrow) => arrow.active);
  }

  /**
   * Update all arrows
   */
  update(): void {
    this.cleanupArrows();
    this.arrows.forEach((arrow) => arrow.update());
  }

  /**
   * Get all active arrows
   */
  getArrows(): Arrow[] {
    return this.arrows;
  }

  /**
   * Check if currently aiming
   */
  isCurrentlyAiming(): boolean {
    return this.isAiming;
  }

  /**
   * Get current charge level
   */
  getChargeLevel(): number {
    return this.chargeLevel;
  }

  /**
   * Destroy bow and cleanup
   */
  destroy(): void {
    this.aimLine?.destroy();
    this.aimArc?.destroy();
    this.windIndicator?.destroy();
    this.arrows.forEach((arrow) => arrow.destroy());
    this.arrows = [];
  }
}
