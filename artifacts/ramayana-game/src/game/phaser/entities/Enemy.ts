import Phaser from "phaser";
import { CHARACTERS, CharacterId } from "../config/characters";

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

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

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
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(48, 64);
    body.setOffset(8, 0);
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
