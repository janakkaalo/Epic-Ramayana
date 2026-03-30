import Phaser from "phaser";

/**
 * ParticleEffectsManager - Creates visual particle effects for the game
 * Includes explosions, dust, magical auras, and other visual feedback
 */
export class ParticleEffectsManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create explosion effect when arrow hits target
   */
  createExplosion(x: number, y: number, color: number = 0xff6b6b): void {
    // Create burst of particles
    const particleCount = 12;
    const radius = 40;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const vx = Math.cos(angle) * 150;
      const vy = Math.sin(angle) * 150;

      const particle = this.scene.add.circle(x, y, 4, color);
      particle.setDepth(50);

      this.scene.physics.add.existing(particle);
      const body = particle.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(vx, vy);
      body.setDrag(500, 500);
      body.setGravityY(300);

      // Fade out and remove
      this.scene.tweens.add({
        targets: particle,
        alpha: { from: 1, to: 0 },
        scaleX: { from: 1, to: 0.1 },
        scaleY: { from: 1, to: 0.1 },
        duration: 600,
        onComplete: () => {
          particle.destroy();
        },
      });
    }

    // Add screen shake for impact
    this.scene.cameras.main.shake(100, 0.01);
  }

  /**
   * Create dust cloud effect (walking, running)
   */
  createDustCloud(x: number, y: number, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const offsetX = Phaser.Math.Between(-20, 20);
      const offsetY = Phaser.Math.Between(-10, 10);

      const particle = this.scene.add.circle(
        x + offsetX,
        y + offsetY,
        Phaser.Math.Between(2, 5),
        0x8b7355,
        0.6,
      );
      particle.setDepth(50);

      // Float upward and fade
      this.scene.tweens.add({
        targets: particle,
        y: "+=30",
        alpha: { from: 0.6, to: 0 },
        duration: Phaser.Math.Between(400, 800),
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }

  /**
   * Create aura/glow effect (magic, power-up)
   */
  createAura(
    x: number,
    y: number,
    color: number = 0xffd700,
    radius: number = 50,
  ): void {
    const aura = this.scene.add.graphics();
    aura.setDepth(45);

    // Animated aura circles
    const animate = () => {
      aura.clear();

      // Multiple rings with different alphas
      aura.lineStyle(2, color, 0.8);
      aura.strokeCircle(x, y, radius);

      aura.lineStyle(1, color, 0.4);
      aura.strokeCircle(x, y, radius - 10);
      aura.strokeCircle(x, y, radius + 10);
    };

    animate();

    // Animate the aura
    this.scene.tweens.add({
      targets: { radius },
      radius: radius + 15,
      duration: 800,
      repeat: -1,
      yoyo: true,
      onUpdate: (tween) => {
        const value = tween.getValue();
        radius = value !== null ? value : radius;
        animate();
      },
      onComplete: () => {
        aura.destroy();
      },
    });
  }

  /**
   * Create hit flash effect
   */
  createHitFlash(target: Phaser.GameObjects.GameObject): void {
    const originalAlpha = (target as any).alpha || 1;

    // Rapid flash
    this.scene.tweens.add({
      targets: target,
      alpha: { from: 1, to: 0.3 },
      duration: 50,
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        (target as any).setAlpha(originalAlpha);
      },
    });
  }

  /**
   * Create magic projectile trail
   */
  createProjectileTrail(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: number = 0x00bfff,
  ): void {
    const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);
    const steps = Math.ceil(distance / 10);
    const angle = Math.atan2(endY - startY, endX - startX);

    for (let i = 0; i < steps; i++) {
      const progress = i / steps;
      const x = startX + Math.cos(angle) * distance * progress;
      const y = startY + Math.sin(angle) * distance * progress;
      const size = 3 - progress * 2;

      const particle = this.scene.add.circle(x, y, Math.max(1, size), color);
      particle.setDepth(40);

      this.scene.tweens.add({
        targets: particle,
        alpha: { from: 0.8, to: 0 },
        duration: 300 + i * 10,
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }

  /**
   * Create level complete effect
   */
  createLevelCompleteEffect(x: number, y: number): void {
    const particles = 20;

    for (let i = 0; i < particles; i++) {
      const angle = (i / particles) * Math.PI * 2;
      const distance = 100;
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;

      const star = this.scene.add.polygon(
        x,
        y,
        [0, -8, 2, -2, 8, 0, 2, 6, 0, 10, -2, 6, -8, 0, -2, -2],
        0xffd700,
      );
      star.setDepth(100);

      this.scene.tweens.add({
        targets: star,
        x: targetX,
        y: targetY,
        scale: { from: 1, to: 0 },
        alpha: { from: 1, to: 0 },
        duration: 1000,
        ease: "Power2",
        delay: i * 30,
        onComplete: () => {
          star.destroy();
        },
      });
    }
  }

  /**
   * Create damage number (floating text showing damage dealt)
   */
  createDamageNumber(x: number, y: number, damage: number): void {
    const damageText = this.scene.add.text(x, y, damage.toString(), {
      fontSize: "24px",
      fontFamily: "Arial",
      color: "#FF0000",
      fontStyle: "bold",
      stroke: "#FFFF00",
      strokeThickness: 2,
    });
    damageText.setOrigin(0.5);
    damageText.setDepth(100);

    this.scene.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: "Power2",
      onComplete: () => {
        damageText.destroy();
      },
    });
  }

  /**
   * Create healing effect (green particles)
   */
  createHealingEffect(x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      const particle = this.scene.add.circle(
        x + Phaser.Math.Between(-20, 20),
        y + Phaser.Math.Between(-20, 20),
        2,
        0x00ff00,
      );
      particle.setDepth(50);

      this.scene.tweens.add({
        targets: particle,
        y: "-=40",
        alpha: { from: 0.8, to: 0 },
        duration: 800,
        ease: "Power2",
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }

  /**
   * Create teleport effect (disappear/reappear)
   */
  createTeleportEffect(x: number, y: number): void {
    // Ring effect
    const circle = this.scene.add.graphics();
    circle.lineStyle(2, 0x00bfff);
    circle.strokeCircle(x, y, 40);
    circle.setDepth(100);

    this.scene.tweens.add({
      targets: circle,
      radius: 100,
      alpha: { from: 1, to: 0 },
      duration: 300,
      onComplete: () => {
        circle.destroy();
      },
    });

    // Particle burst
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.scene.add.circle(x, y, 3, 0x00bfff);
      particle.setDepth(99);

      const vx = Math.cos(angle) * 200;
      const vy = Math.sin(angle) * 200;

      this.scene.physics.add.existing(particle);
      const body = particle.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(vx, vy);

      this.scene.tweens.add({
        targets: particle,
        alpha: { from: 1, to: 0 },
        duration: 500,
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }
}
