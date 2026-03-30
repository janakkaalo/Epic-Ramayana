import Phaser from "phaser";
import { GAME_CONFIG } from "../config/gameConfig";
import { CHARACTERS, CharacterId } from "../config/characters";
import { AstraId } from "../config/astras";
import { Bow } from "../weapons/Bow";

/**
 * Player Entity (Rama) for Epic Ramayana
 * Main playable character with archery combat system
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  // Player state
  private characterId: CharacterId = "RAMA";
  private health: number;
  private maxHealth: number;
  private mana: number;
  private maxMana: number;
  private dharmaScore: number = 0;

  // Movement state
  private isRunning: boolean = false;
  private canDoubleJump: boolean = false;
  private hasDoubleJumped: boolean = false;
  private isAiming: boolean = false;
  private isFacingRight: boolean = true;

  // Combat state
  private unlockedAstras: Set<AstraId> = new Set();
  private astraCooldowns: Map<AstraId, number> = new Map();
  private isInvulnerable: boolean = false;
  private bow!: Bow;

  // Input keys
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyRun!: Phaser.Input.Keyboard.Key;
  private keyAim!: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "rama-spritesheet");

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics
    this.setupPhysics();

    // Initialize stats from config
    const stats = CHARACTERS[this.characterId];
    this.maxHealth = stats.maxHp;
    this.health = this.maxHealth;
    this.maxMana = stats.maxMana;
    this.mana = this.maxMana;

    // Set up input
    this.setupInput();

    // Play initial animation
    this.play("rama-idle");

    // Create bow weapon
    this.bow = new Bow(scene, this);
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Set hitbox to match animated sprite
    body.setSize(48, 64);
    body.setOffset(8, 0);

    // Physics properties
    body.setCollideWorldBounds(true);
    body.setDrag(400, 0); // Ground friction
    body.setMaxVelocity(GAME_CONFIG.PLAYER.RUN_SPEED, 1000);
  }

  private setupInput(): void {
    if (!this.scene.input.keyboard) return;

    // Arrow keys for movement
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // Additional keys
    this.keyRun = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT,
    );
    this.keyAim = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  update(time: number, delta: number): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Update cooldowns
    this.updateCooldowns(delta);

    // Update bow
    this.bow.update();

    // Check if on ground
    const onGround = body.blocked.down || body.touching.down;

    if (onGround) {
      this.hasDoubleJumped = false;
    }

    // Handle aiming mode
    if (this.keyAim.isDown && !this.isAiming) {
      this.enterAimMode();
    } else if (this.keyAim.isUp && this.isAiming) {
      this.exitAimMode();
    }

    // Update aiming if active
    if (this.isAiming) {
      body.setVelocityX(0);
      this.handleAiming(delta);
      // Still update animation while aiming
      this.updateAnimation(body, onGround);
      return;
    }

    // Handle horizontal movement
    this.handleMovement(body, onGround);

    // Handle jumping
    this.handleJumping(body, onGround);

    // Update animation
    this.updateAnimation(body, onGround);
  }

  private handleMovement(
    body: Phaser.Physics.Arcade.Body,
    onGround: boolean,
  ): void {
    const speed = this.keyRun.isDown
      ? GAME_CONFIG.PLAYER.RUN_SPEED
      : GAME_CONFIG.PLAYER.WALK_SPEED;
    this.isRunning = this.keyRun.isDown;

    if (this.cursors.left.isDown) {
      body.setVelocityX(-speed);
      this.isFacingRight = false;
      this.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(speed);
      this.isFacingRight = true;
      this.setFlipX(false);
    } else if (onGround) {
      // Apply friction only on ground
      body.setVelocityX(body.velocity.x * 0.8);
    }
  }

  private handleJumping(
    body: Phaser.Physics.Arcade.Body,
    onGround: boolean,
  ): void {
    // Jump
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      if (onGround) {
        body.setVelocityY(GAME_CONFIG.PLAYER.JUMP_VELOCITY);
      } else if (this.canDoubleJump && !this.hasDoubleJumped) {
        body.setVelocityY(GAME_CONFIG.PLAYER.JUMP_VELOCITY * 0.8);
        this.hasDoubleJumped = true;
      }
    }

    // Variable jump height (release jump key early = shorter jump)
    if (this.cursors.up.isUp && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * 0.5);
    }
  }

  private updateAnimation(
    body: Phaser.Physics.Arcade.Body,
    onGround: boolean,
  ): void {
    if (!onGround) {
      if (this.anims.currentAnim?.key !== "rama-jump") {
        this.play("rama-jump");
      }
    } else if (Math.abs(body.velocity.x) > 10) {
      if (this.isRunning) {
        if (this.anims.currentAnim?.key !== "rama-run") {
          this.play("rama-run");
        }
      } else {
        if (this.anims.currentAnim?.key !== "rama-walk") {
          this.play("rama-walk");
        }
      }
    } else {
      if (this.anims.currentAnim?.key !== "rama-idle") {
        this.play("rama-idle");
      }
    }
  }

  private enterAimMode(): void {
    this.isAiming = true;
    this.play("rama-aim");

    // Slow down time for aiming
    this.scene.physics.world.timeScale = 1 / GAME_CONFIG.COMBAT.AIM_SLOW_MOTION;

    // Start bow aiming
    this.bow.startAiming();

    // Emit event for UI to show aim indicator
    this.scene.events.emit("player-aim-start");
  }

  private exitAimMode(): void {
    this.isAiming = false;

    // Return time to normal
    this.scene.physics.world.timeScale = 1;

    // Stop bow aiming and shoot
    this.bow.stopAiming(this);

    // Emit event for UI
    this.scene.events.emit("player-aim-end");
  }

  private handleAiming(delta: number): void {
    // Get mouse or pointer position
    const pointer = this.scene.input.activePointer;
    const camera = this.scene.cameras.main;

    // Convert pointer to world coordinates
    const targetX = pointer.x + camera.scrollX;
    const targetY = pointer.y + camera.scrollY;

    // Update bow aiming
    this.bow.updateAiming(this, targetX, targetY, delta);
  }

  private updateCooldowns(delta: number): void {
    this.astraCooldowns.forEach((cooldown, astraId) => {
      const newCooldown = Math.max(0, cooldown - delta / 1000);
      this.astraCooldowns.set(astraId, newCooldown);
    });
  }

  // Public methods for game systems

  takeDamage(amount: number): void {
    if (this.isInvulnerable) return;

    this.health = Math.max(0, this.health - amount);
    this.isInvulnerable = true;

    // Visual feedback
    this.setTint(0xff0000);

    // Invulnerability period
    this.scene.time.delayedCall(500, () => {
      this.isInvulnerable = false;
      this.clearTint();
    });

    // Check death
    if (this.health <= 0) {
      this.die();
    }

    this.scene.events.emit("player-damaged", this.health, this.maxHealth);
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.scene.events.emit("player-healed", this.health, this.maxHealth);
  }

  restoreMana(amount: number): void {
    this.mana = Math.min(this.maxMana, this.mana + amount);
    this.scene.events.emit("player-mana-restored", this.mana, this.maxMana);
  }

  useMana(amount: number): boolean {
    if (this.mana >= amount) {
      this.mana -= amount;
      this.scene.events.emit("player-mana-used", this.mana, this.maxMana);
      return true;
    }
    return false;
  }

  unlockAstra(astraId: AstraId): void {
    this.unlockedAstras.add(astraId);
    this.scene.events.emit("astra-unlocked", astraId);
  }

  hasAstra(astraId: AstraId): boolean {
    return this.unlockedAstras.has(astraId);
  }

  canUseAstra(astraId: AstraId): boolean {
    const cooldown = this.astraCooldowns.get(astraId) || 0;
    return this.hasAstra(astraId) && cooldown === 0;
  }

  useAstra(astraId: AstraId, cooldownTime: number): void {
    this.astraCooldowns.set(astraId, cooldownTime);
  }

  addDharma(amount: number): void {
    this.dharmaScore = Math.min(
      GAME_CONFIG.DHARMA.MAX_SCORE,
      this.dharmaScore + amount,
    );
    this.scene.events.emit("dharma-changed", this.dharmaScore);
  }

  unlockDoubleJump(): void {
    this.canDoubleJump = true;
  }

  private die(): void {
    this.scene.events.emit("player-died");
    this.play("rama-die");
    this.setTint(0x888888);
  }

  // Get the bow instance for accessing arrows
  getBow(): Bow {
    return this.bow;
  }

  // Override destroy to cleanup bow
  destroy(fromScene?: boolean): void {
    if (this.bow) {
      this.bow.destroy();
    }
    super.destroy(fromScene);
  }

  // Getters
  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getMana(): number {
    return this.mana;
  }

  getMaxMana(): number {
    return this.maxMana;
  }

  getDharmaScore(): number {
    return this.dharmaScore;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
