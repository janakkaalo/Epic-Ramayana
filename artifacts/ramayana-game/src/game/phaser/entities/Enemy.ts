import Phaser from "phaser";
import { CHARACTERS, CharacterId } from "../config/characters";
import { ParticleEffectsManager } from "../systems/ParticleEffectsManager";

export type EnemyState =
  | "IDLE"
  | "PATROL"
  | "CHASE"
  | "ATTACK"
  | "HIT"
  | "DYING"
  | "DEAD";

/**
 * Enemy - Base enemy class for Epic Ramayana
 * Handles AI, combat, and animations
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected enemyId: CharacterId;
  protected health: number;
  protected maxHealth: number;
  protected damage: number;
  protected enemyState: EnemyState = "IDLE";
  protected speed: number;
  protected detectionRange: number = 300;
  protected attackRange: number = 50;
  protected isInvulnerable: boolean = false;
  protected particleManager: ParticleEffectsManager;

  // AI properties
  protected patrolPoints: Phaser.Math.Vector2[] = [];
  protected currentPatrolIndex: number = 0;
  protected aggroTarget?: Phaser.GameObjects.GameObject;
  protected lastStateChange: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemyId: CharacterId,
    texture: string = "rakshasa-spritesheet",
  ) {
    super(scene, x, y, texture);

    this.enemyId = enemyId;
    this.particleManager = new ParticleEffectsManager(scene);

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Draw detailed enemy sprite
    this.drawEnemySprite();

    // Get stats from config
    const stats = CHARACTERS[this.enemyId];
    this.maxHealth = stats.maxHp;
    this.health = this.maxHealth;
    this.damage = stats.attack;
    this.speed = stats.speed;

    // Setup physics
    this.setupPhysics();

    // Play initial animation
    this.play("rakshasa-idle");

    // Start in idle state
    this.changeState("IDLE");

    // Add health bar above enemy
    this.createHealthBar();
  }

  /**
   * Draw detailed enemy sprite based on type
   */
  private drawEnemySprite(): void {
    const graphics = this.scene.add.graphics();

    switch (this.enemyId) {
      case "TATAKA":
        this.drawTataka(graphics);
        break;
      case "SUBAHU":
        this.drawSubahu(graphics);
        break;
      case "MARICHA":
        this.drawMaricha(graphics);
        break;
      default:
        this.drawGenericAsura(graphics);
    }
  }

  private drawTataka(graphics: Phaser.GameObjects.Graphics): void {
    // Female asura - fierce appearance
    graphics.fillStyle(0x4a0e0e, 1); // Dark red/brown
    graphics.fillRect(8, 15, 48, 35); // Torso

    // Skull-like head with demonic features
    graphics.fillStyle(0x3d2817, 1);
    graphics.fillCircle(32, 10, 9);

    // Glowing eyes (demonic)
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(27, 8, 3);
    graphics.fillCircle(37, 8, 3);

    // Horns (curved)
    graphics.lineStyle(3, 0x2a1810);
    graphics.lineBetween(24, 2, 20, -3);
    graphics.lineBetween(40, 2, 44, -3);

    // Arms (muscular)
    graphics.fillStyle(0x5a1818, 1);
    graphics.fillRect(3, 15, 6, 28);
    graphics.fillRect(61, 15, 6, 28);

    // Claws
    graphics.lineStyle(2, 0xff6600);
    graphics.lineBetween(3, 43, 0, 48);
    graphics.lineBetween(67, 43, 70, 48);
  }

  private drawSubahu(graphics: Phaser.GameObjects.Graphics): void {
    // Flying demon - lean, fast
    graphics.fillStyle(0x1a3d1a, 1); // Dark green
    graphics.fillRect(8, 18, 48, 32);

    // Head
    graphics.fillStyle(0x2a5a2a, 1);
    graphics.fillCircle(32, 12, 8);

    // Menacing eyes
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(27, 10, 2);
    graphics.fillCircle(37, 10, 2);

    // Wings (indicated by side features)
    graphics.fillStyle(0x1a3d1a, 0.7);
    graphics.fillTriangleShape(new Phaser.Geom.Triangle(2, 20, -2, 28, 2, 35));
    graphics.fillTriangleShape(
      new Phaser.Geom.Triangle(62, 20, 66, 28, 62, 35),
    );

    // Thin body
    graphics.fillStyle(0x2a5a2a, 1);
    graphics.fillRect(12, 48, 8, 16);
    graphics.fillRect(44, 48, 8, 16);
  }

  private drawMaricha(graphics: Phaser.GameObjects.Graphics): void {
    // Shape-shifter demon - mysterious
    graphics.fillStyle(0x1a1a2e, 1); // Very dark purple-blue
    graphics.fillRect(8, 15, 48, 35);

    // Head with shifting appearance
    graphics.fillStyle(0x2a2a4e, 1);
    graphics.fillCircle(32, 10, 8);

    // Eerie eyes (white with black pupil)
    graphics.fillStyle(0xeeeeee, 1);
    graphics.fillCircle(27, 8, 3);
    graphics.fillCircle(37, 8, 3);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(27, 8, 1.5);
    graphics.fillCircle(37, 8, 1.5);

    // Antlers/crown (indicating mystical nature)
    graphics.lineStyle(2, 0xaa00ff);
    graphics.lineBetween(24, 2, 18, -5);
    graphics.lineBetween(40, 2, 46, -5);
    graphics.lineBetween(18, -5, 16, -10);
    graphics.lineBetween(46, -5, 48, -10);

    // Mystical aura outline
    graphics.lineStyle(1, 0xaa00ff, 0.5);
    graphics.strokeRect(5, 12, 54, 42);
  }

  private drawGenericAsura(graphics: Phaser.GameObjects.Graphics): void {
    // Basic warrior demon
    graphics.fillStyle(0x663333, 1);
    graphics.fillRect(8, 15, 48, 35);

    graphics.fillStyle(0x553322, 1);
    graphics.fillCircle(32, 10, 8);

    graphics.fillStyle(0xff4444, 1);
    graphics.fillCircle(27, 8, 2);
    graphics.fillCircle(37, 8, 2);

    graphics.fillStyle(0x663333, 1);
    graphics.fillRect(2, 15, 6, 30);
    graphics.fillRect(62, 15, 6, 30);
  }

  /**
   * Create floating health bar above enemy
   */
  private createHealthBar(): void {
    const barGraphics = this.scene.add.graphics();
    barGraphics.setDepth(101);

    const updateBar = () => {
      barGraphics.clear();

      // Position above enemy
      const barWidth = 40;
      const barHeight = 3;
      const x = this.x - barWidth / 2;
      const y = this.y - 40;

      // Background
      barGraphics.fillStyle(0x000000, 0.7);
      barGraphics.fillRect(x, y, barWidth, barHeight);

      // Health
      const healthPercent = this.health / this.maxHealth;
      const healthColor =
        healthPercent > 0.5
          ? 0x00ff00
          : healthPercent > 0.25
            ? 0xffaa00
            : 0xff0000;
      barGraphics.fillStyle(healthColor, 1);
      barGraphics.fillRect(x, y, barWidth * healthPercent, barHeight);

      // Border
      barGraphics.lineStyle(1, 0xffffff);
      barGraphics.strokeRect(x, y, barWidth, barHeight);
    };

    // Update bar position and health every frame
    this.scene.events.on("update", updateBar);
    (this as any).healthBarGraphics = barGraphics;
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(0.05, 0); // Slight bounce on collision
    body.setSize(48, 64);
    body.setOffset(8, 0);

    // Enhanced physics
    body.setDrag(300, 0); // Ground friction
    body.setMaxVelocity(this.speed, 1000);
    body.setGravityY(300); // Gravity for realistic platforming
  }

  update(time: number, delta: number): void {
    if (this.enemyState === "DEAD") return;

    if (!this.body) return;
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Update AI based on state
    switch (this.enemyState) {
      case "IDLE":
        this.updateIdle(time, delta);
        break;
      case "PATROL":
        this.updatePatrol(time, delta);
        break;
      case "CHASE":
        this.updateChase(time, delta);
        break;
      case "ATTACK":
        this.updateAttack(time, delta);
        break;
      case "HIT":
        // Brief stun, then return to previous state
        if (this.anims.currentAnim?.key !== "rakshasa-hit") {
          this.play("rakshasa-hit");
        }
        if (time - this.lastStateChange > 300) {
          this.changeState("CHASE");
        }
        break;
    }

    // Check for player in range
    this.checkForPlayer();
  }

  private updateIdle(time: number, delta: number): void {
    // Just stand still, play idle animation
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);

    if (this.anims.currentAnim?.key !== "rakshasa-idle") {
      this.play("rakshasa-idle");
    }

    // Randomly switch to patrol
    if (time - this.lastStateChange > 2000 && this.patrolPoints.length > 0) {
      this.changeState("PATROL");
    }
  }

  private updatePatrol(time: number, delta: number): void {
    if (this.patrolPoints.length === 0) {
      this.changeState("IDLE");
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const target = this.patrolPoints[this.currentPatrolIndex];

    // Move towards patrol point
    const dx = target.x - this.x;

    if (Math.abs(dx) < 10) {
      // Reached patrol point, move to next
      this.currentPatrolIndex =
        (this.currentPatrolIndex + 1) % this.patrolPoints.length;
      body.setVelocityX(0);
    } else {
      const direction = Math.sign(dx);
      body.setVelocityX(direction * this.speed * 0.5); // Half speed for patrol
      this.setFlipX(direction < 0);

      if (this.anims.currentAnim?.key !== "rakshasa-walk") {
        this.play("rakshasa-walk");
      }
    }
  }

  private updateChase(time: number, delta: number): void {
    if (!this.aggroTarget || !this.aggroTarget.active) {
      this.changeState("PATROL");
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const target = this.aggroTarget as Phaser.GameObjects.GameObject & {
      x: number;
      y: number;
    };

    const dx = target.x - this.x;
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      target.x,
      target.y,
    );

    if (distance < this.attackRange) {
      this.changeState("ATTACK");
    } else if (distance > this.detectionRange * 1.5) {
      // Lost aggro
      this.aggroTarget = undefined;
      this.changeState("PATROL");
    } else {
      // Chase player
      const direction = Math.sign(dx);
      body.setVelocityX(direction * this.speed);
      this.setFlipX(direction < 0);

      if (this.anims.currentAnim?.key !== "rakshasa-walk") {
        this.play("rakshasa-walk");
      }
    }
  }

  private updateAttack(time: number, delta: number): void {
    if (!this.aggroTarget || !this.aggroTarget.active) {
      this.changeState("IDLE");
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);

    if (this.anims.currentAnim?.key !== "rakshasa-attack") {
      this.play("rakshasa-attack");
    }

    // Attack cooldown
    if (time - this.lastStateChange > 1000) {
      this.performAttack();
      this.lastStateChange = time;
    }
  }

  private performAttack(): void {
    // Emit attack event
    this.scene.events.emit("enemy-attack", {
      enemy: this,
      damage: this.damage,
      x: this.x,
      y: this.y,
    });
  }

  private checkForPlayer(): void {
    if (this.enemyState === "CHASE" || this.enemyState === "ATTACK") return;

    // Find player in scene (assumes player is tagged or in a group)
    // This is a simplified version - in production, use a proper reference
    const player = this.scene.children
      .getChildren()
      .find((child: any) => child.constructor.name === "Player");

    if (player && player.active) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        (player as any).x,
        (player as any).y,
      );

      if (distance < this.detectionRange) {
        this.aggroTarget = player;
        this.changeState("CHASE");
      }
    }
  }

  private changeState(newState: EnemyState): void {
    this.enemyState = newState;
    this.lastStateChange = this.scene.time.now;
  }

  /**
   * Set patrol points for this enemy
   */
  setPatrolPoints(points: Phaser.Math.Vector2[]): void {
    this.patrolPoints = points;
    if (points.length > 0 && this.enemyState === "IDLE") {
      this.changeState("PATROL");
    }
  }

  /**
   * Take damage from arrow or attack
   */
  takeDamage(amount: number, source?: Phaser.GameObjects.GameObject): void {
    if (this.isInvulnerable || this.enemyState === "DEAD") return;

    this.health = Math.max(0, this.health - amount);

    // Flash red
    this.setTint(0xff0000);
    this.isInvulnerable = true;

    this.scene.time.delayedCall(200, () => {
      this.clearTint();
      this.isInvulnerable = false;
    });

    // Emit damaged event
    this.scene.events.emit("enemy-damaged", {
      enemy: this,
      health: this.health,
      maxHealth: this.maxHealth,
      damage: amount,
    });

    if (this.health <= 0) {
      this.die();
    } else {
      // Knocked back
      if (source) {
        const knockback = 100;
        const dx = this.x - (source as any).x;
        (this.body as Phaser.Physics.Arcade.Body).setVelocityX(
          Math.sign(dx) * knockback,
        );
      }

      this.changeState("HIT");
    }
  }

  private die(): void {
    this.changeState("DEAD");
    this.setTint(0x888888);

    // Create death particle effect
    this.particleManager.createExplosion(this.x, this.y, 0xff6b6b);
    this.particleManager.createDustCloud(this.x, this.y, 10);

    // Play death animation
    this.play("rakshasa-death");

    // Emit death event
    this.scene.events.emit("enemy-died", {
      enemy: this,
      enemyId: this.enemyId,
      x: this.x,
      y: this.y,
    });

    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y + 20,
      duration: 1000,
      onComplete: () => this.destroy(),
    });
  }

  // Getters
  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getState(): EnemyState {
    return this.enemyState;
  }

  getEnemyId(): CharacterId {
    return this.enemyId;
  }
}
