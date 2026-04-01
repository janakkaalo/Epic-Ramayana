import Phaser from "phaser";
import { GAME_CONFIG } from "../config/gameConfig";
import { CHARACTERS, CharacterId } from "../config/characters";
import { AstraId } from "../config/astras";
import { Bow } from "../weapons/Bow";
import { ParticleEffectsManager } from "../systems/ParticleEffectsManager";

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
  private particleManager!: ParticleEffectsManager;

  // Input keys
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyRun!: Phaser.Input.Keyboard.Key;
  private keyAim!: Phaser.Input.Keyboard.Key;
  private lastDustEmitTime: number = 0;
  private dustEmitInterval: number = 50; // Emit dust every 50ms
  private jumpVelocity: number = GAME_CONFIG.PLAYER.JUMP_VELOCITY;
  private keyboardAimElevation: number = -0.2;
  private pointerAimActive: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "rama-spritesheet", "0");

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
    this.ensureCoreAnimations();
    this.safePlay("rama-idle");

    // Create bow weapon
    this.bow = new Bow(scene, this);

    // Initialize particle effects manager
    this.particleManager = new ParticleEffectsManager(scene);

    // Add depth sorting
    this.setDepth(100);
  }

  /**
   * Ensure Rama's core animations exist and are valid.
   * If asset generation failed, create a single-frame fallback animation set.
   */
  private ensureCoreAnimations(): void {
    const textureKey = this.scene.textures.exists("rama-spritesheet")
      ? "rama-spritesheet"
      : "__MISSING";

    const fallbackAnimations: Array<{ key: string; repeat: number }> = [
      { key: "rama-idle", repeat: -1 },
      { key: "rama-walk", repeat: -1 },
      { key: "rama-run", repeat: -1 },
      { key: "rama-jump", repeat: 0 },
      { key: "rama-aim", repeat: 0 },
      { key: "rama-shoot", repeat: 0 },
      { key: "rama-die", repeat: 0 },
    ];

    fallbackAnimations.forEach(({ key, repeat }) => {
      const existing = this.scene.anims.get(key);
      const isValid =
        !!existing &&
        existing.frames.length > 0 &&
        Number.isFinite(existing.duration);

      if (isValid) {
        return;
      }

      if (existing) {
        this.scene.anims.remove(key);
      }

      this.scene.anims.create({
        key,
        frames: [{ key: textureKey, frame: "0" }],
        frameRate: 1,
        repeat,
      });
    });
  }

  /**
   * Guard animation playback to avoid runtime crashes from malformed anim defs.
   */
  private safePlay(key: string): void {
    const animation = this.scene.anims.get(key);
    if (!animation) return;
    if (animation.frames.length === 0) return;
    if (!Number.isFinite(animation.duration)) return;
    this.play(key);
  }

  /**
   * Draw an enhanced visual representation of Rama
   */
  private drawPlayerSprite(): void {
    const graphics = this.scene.add.graphics();

    // Skin tone - warm brown
    const skinColor = 0xc4885f;

    // Torso (traditional dhoti and upper wear)
    graphics.fillStyle(0x8b0000, 1); // Deep red robe
    graphics.fillRect(8, 10, 48, 35);

    // Gold trim/belt
    graphics.fillStyle(0xffd700, 1);
    graphics.fillRect(8, 43, 48, 3);

    // Skin - head
    graphics.fillStyle(skinColor, 1);
    graphics.fillCircle(32, 8, 8);

    // Hair (black, traditional style)
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(24, 2, 16, 8);

    // Eyes
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(28, 6, 2);
    graphics.fillCircle(36, 6, 2);

    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(28, 6, 1);
    graphics.fillCircle(36, 6, 1);

    // Arms (skin)
    graphics.fillStyle(skinColor, 1);
    graphics.fillRect(5, 12, 4, 25);
    graphics.fillRect(59, 12, 4, 25);

    // Legs
    graphics.fillStyle(0x4a3728, 1); // Darker for pants
    graphics.fillRect(12, 45, 8, 20);
    graphics.fillRect(44, 45, 8, 20);

    // Feet
    graphics.fillStyle(skinColor, 1);
    graphics.fillRect(12, 64, 8, 4);
    graphics.fillRect(44, 64, 8, 4);

    // Bow across back (visual indicator)
    graphics.lineStyle(2, 0xcd853f);
    graphics.lineBetween(10, 20, 54, 20);

    // Quiver
    graphics.fillStyle(0x654321, 0.8);
    graphics.fillRect(58, 15, 4, 15);
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Set hitbox to match animated sprite
    body.setSize(48, 64);
    body.setOffset(8, 0);

    // Enhanced physics properties for smooth movement
    body.setCollideWorldBounds(true);
    body.setBounce(0.1, 0); // Slight bounce effect
    body.setDrag(350, 0); // Reduced friction for faster response
    body.setMaxVelocity(GAME_CONFIG.PLAYER.RUN_SPEED, 1000);

    // Add gravity for realistic platforming
    body.setGravityY(300); // Smooth gravity effect

    // Prevent rotation
    body.setAngularVelocity(0);
    body.setAngularDrag(0);
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
      // Emit dust cloud when moving on ground
      if (onGround) {
        this.emitDustIfNeeded();
      }
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(speed);
      this.isFacingRight = true;
      this.setFlipX(false);
      // Emit dust cloud when moving on ground
      if (onGround) {
        this.emitDustIfNeeded();
      }
    } else if (onGround) {
      // Apply friction only on ground
      body.setVelocityX(body.velocity.x * 0.8);
    }
  }

  private emitDustIfNeeded(): void {
    const now = this.scene.time.now;
    if (now - this.lastDustEmitTime > this.dustEmitInterval) {
      this.lastDustEmitTime = now;
      // Emit dust at player's feet
      const dustX = this.x + (this.isFacingRight ? -10 : 10);
      const dustY = this.y + 15;
      const dustCount = this.isRunning ? 6 : 3; // More dust when running
      this.particleManager.createDustCloud(dustX, dustY, dustCount);
    }
  }

  private handleJumping(
    body: Phaser.Physics.Arcade.Body,
    onGround: boolean,
  ): void {
    // Jump
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      if (onGround) {
        body.setVelocityY(this.jumpVelocity);
      } else if (this.canDoubleJump && !this.hasDoubleJumped) {
        body.setVelocityY(this.jumpVelocity * 0.8);
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
        this.safePlay("rama-jump");
      }
    } else if (Math.abs(body.velocity.x) > 10) {
      if (this.isRunning) {
        if (this.anims.currentAnim?.key !== "rama-run") {
          this.safePlay("rama-run");
        }
      } else {
        if (this.anims.currentAnim?.key !== "rama-walk") {
          this.safePlay("rama-walk");
        }
      }
    } else {
      if (this.anims.currentAnim?.key !== "rama-idle") {
        this.safePlay("rama-idle");
      }
    }
  }

  private enterAimMode(): void {
    this.isAiming = true;
    this.safePlay("rama-aim");

    const pointer = this.scene.input.activePointer;
    this.lastPointerX = pointer.x;
    this.lastPointerY = pointer.y;
    this.pointerAimActive = false;

    // Default keyboard aim starts slightly upward in facing direction.
    this.keyboardAimElevation = -0.2;

    // Slow down time for aiming
    this.scene.physics.world.timeScale = GAME_CONFIG.COMBAT.AIM_SLOW_MOTION;

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
    // Support both mouse aiming and keyboard-only aiming.
    const pointer = this.scene.input.activePointer;
    const camera = this.scene.cameras.main;
    const pointerMoved =
      Math.abs(pointer.x - this.lastPointerX) > 2 ||
      Math.abs(pointer.y - this.lastPointerY) > 2;
    const pointerInsideViewport =
      pointer.x >= 0 &&
      pointer.x <= camera.width &&
      pointer.y >= 0 &&
      pointer.y <= camera.height;

    if (pointerInsideViewport && pointerMoved) {
      this.pointerAimActive = true;
    }

    if (this.cursors.up.isDown) {
      this.keyboardAimElevation -= (delta / 1000) * 1.6;
      this.pointerAimActive = false;
    }

    if (this.cursors.down.isDown) {
      this.keyboardAimElevation += (delta / 1000) * 1.6;
      this.pointerAimActive = false;
    }

    this.keyboardAimElevation = Phaser.Math.Clamp(
      this.keyboardAimElevation,
      -1.1,
      0.45,
    );

    let targetX: number;
    let targetY: number;

    if (this.pointerAimActive) {
      // Mouse/pointer aiming.
      targetX = pointer.x + camera.scrollX;
      targetY = pointer.y + camera.scrollY;
    } else {
      // Keyboard fallback aiming.
      const baseAngle = this.isFacingRight ? 0 : Math.PI;
      const angle = baseAngle + this.keyboardAimElevation;
      const aimDistance = 320;

      targetX = this.x + Math.cos(angle) * aimDistance;
      targetY = this.y - 20 + Math.sin(angle) * aimDistance;
    }

    this.lastPointerX = pointer.x;
    this.lastPointerY = pointer.y;

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

  setJumpVelocity(velocity: number): void {
    // Jump velocity should be negative in Phaser Arcade physics.
    this.jumpVelocity = Math.min(-120, velocity);
  }

  private die(): void {
    this.scene.events.emit("player-died");
    this.safePlay("rama-die");
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
