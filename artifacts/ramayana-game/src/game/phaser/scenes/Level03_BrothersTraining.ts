import Phaser from "phaser";
import { Player } from "../entities/Player";
import {
  DialogueSystem,
  BALA_KANDA_DIALOGUES,
} from "../systems/DialogueSystem";
import { AstraUI } from "../systems/AstraUI";
import { PauseMenu } from "../systems/PauseMenu";
import { LevelFlow } from "../utils/LevelFlow";
import { getGameSettings } from "../managers/GameSettings";
import { getProgressionManager } from "../managers/LevelProgressionManager";

/**
 * Level 3: "Brothers' Training"
 * Location: Ayodhya Palace Training Grounds
 * Type: Tutorial - Archery Training
 * Playable: Rama (16 years old)
 *
 * This level teaches archery mechanics through progressive challenges:
 * - Phase 1: Aim training (5 stationary targets)
 * - Phase 2: Power training (3 distant targets - requires full charge)
 * - Phase 3: Precision training (3 bullseyes)
 * - Phase 4: Moving targets (3 moving targets)
 */
export class Level03_BrothersTraining extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private targets!: Phaser.Physics.Arcade.Group;
  private dialogueSystem!: DialogueSystem;
  private astraUI!: AstraUI;
  private pauseMenu!: PauseMenu;

  // Game state
  private currentPhase: number = 1;
  private targetsHitInPhase: number = 0;
  private requiredHitsPerPhase: number[] = [5, 3, 3, 3]; // Targets needed for each phase
  private totalDharmaScore: number = 0;
  private levelCompleted: boolean = false;
  private readonly autoAimMinSpeed: number = 860;
  private readonly autoAimSnapPadding: number = 24;
  private readonly guaranteedHitDelayMs: number = 240;

  // UI elements
  private phaseText!: Phaser.GameObjects.Text;
  private targetsText!: Phaser.GameObjects.Text;
  private instructionsText!: Phaser.GameObjects.Text;
  private dharmaText!: Phaser.GameObjects.Text;
  private guruText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "Level03_BrothersTraining" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level03_BrothersTraining");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;

    // Create training grounds background
    this.createBackground();
    this.createEnvironment();

    // Create platforms
    this.createPlatforms();

    // Create player
    this.player = new Player(this, 150, 400);
    this.player.setJumpVelocity(-560);
    this.player.getBow().setWindEnabled(false);

    // Create target group
    this.targets = this.physics.add.group({
      runChildUpdate: true,
    });

    // Set up collisions
    this.physics.add.collider(this.player, this.platforms);

    // Set up camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, width * 2, height);
    this.physics.world.setBounds(0, 0, width * 2, height);

    // Initialize dialogue system
    this.dialogueSystem = new DialogueSystem(this);

    // Initialize Astra UI
    this.astraUI = new AstraUI(this);

    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level03_BrothersTraining",
      levelName: "Level 03 — Brothers' Training",
    });

    // Create HUD
    this.createHUD();

    // Set up arrow-target collision
    this.setupArrowCollisions();

    // Start with introduction dialogue
    this.startTrainingPhase();

    // Cursor keys for movement
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors) {
      // Movement is handled by Player.update()
    }
  }

  update(time: number, delta: number): void {
    if (this.pauseMenu?.isPausedState()) return;
    if (this.dialogueSystem?.isDialogueActive()) {
      this.player.setVelocityX(0);
      return;
    }
    this.player.update(time, delta);
    this.updateMovingTargets(time);
    this.updateArrowTargetHits(delta);
  }

  private updateArrowTargetHits(delta: number): void {
    const arrows = this.player.getBow().getArrows();
    if (arrows.length === 0 || this.targets.getLength() === 0) return;

    for (const arrowObj of arrows) {
      const arrow = arrowObj as Phaser.Physics.Arcade.Sprite & {
        active: boolean;
        hit?: (target?: Phaser.GameObjects.GameObject) => void;
      };

      if (!arrow.active) continue;

      this.applyAutoAim(arrow, delta);

      if (!arrow.active) {
        continue;
      }

      const prevX = (arrow.getData("prevX") as number | undefined) ?? arrow.x;
      const prevY = (arrow.getData("prevY") as number | undefined) ?? arrow.y;
      const currX = arrow.x;
      const currY = arrow.y;

      for (const targetObj of this.targets.getChildren()) {
        const target = targetObj as Phaser.Physics.Arcade.Sprite;

        if (!target.active || target.getData("isHit")) {
          continue;
        }

        if (
          this.segmentHitsCircle(
            prevX,
            prevY,
            currX,
            currY,
            target.x,
            target.y,
            this.getTargetHitRadius(target),
          )
        ) {
          if (arrow.hit) {
            arrow.hit(target);
          } else {
            arrow.destroy();
          }
          break;
        }
      }

      arrow.setData("prevX", currX);
      arrow.setData("prevY", currY);
    }
  }

  private getTargetHitRadius(target: Phaser.Physics.Arcade.Sprite): number {
    const isBullseye = !!target.getData("isBullseye");
    return isBullseye ? 56 : 50;
  }

  private applyAutoAim(
    arrow: Phaser.Physics.Arcade.Sprite & {
      hit?: (target?: Phaser.GameObjects.GameObject) => void;
    },
    delta: number,
  ): void {
    const body = arrow.body as Phaser.Physics.Arcade.Body | null;
    if (!body || !body.enable) {
      return;
    }

    const target = this.getAimAssistTarget(arrow);
    if (!target) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      arrow.x,
      arrow.y,
      target.x,
      target.y,
    );

    if (distance <= this.getTargetHitRadius(target) + this.autoAimSnapPadding) {
      if (arrow.hit) {
        arrow.hit(target);
      } else {
        arrow.destroy();
      }
      return;
    }

    body.setAllowGravity(false);

    const speed = body.velocity.length();
    const homingSpeed = Math.max(speed, this.autoAimMinSpeed);
    const dirX = (target.x - arrow.x) / distance;
    const dirY = (target.y - arrow.y) / distance;

    body.setVelocity(dirX * homingSpeed, dirY * homingSpeed);
    arrow.rotation = Math.atan2(dirY, dirX);
  }

  private getAimAssistTarget(
    arrow: Phaser.Physics.Arcade.Sprite,
  ): Phaser.Physics.Arcade.Sprite | undefined {
    const cachedTarget = arrow.getData("aimAssistTarget") as
      | Phaser.Physics.Arcade.Sprite
      | undefined;

    if (cachedTarget && cachedTarget.active && !cachedTarget.getData("isHit")) {
      return cachedTarget;
    }

    let bestTarget: Phaser.Physics.Arcade.Sprite | undefined;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const targetObj of this.targets.getChildren()) {
      const target = targetObj as Phaser.Physics.Arcade.Sprite;

      if (!target.active || target.getData("isHit")) {
        continue;
      }

      const dx = target.x - arrow.x;
      const dy = target.y - arrow.y;
      const distance = Math.hypot(dx, dy);

      if (distance > 1600 || distance <= 0.001) {
        continue;
      }

      const score = distance;
      if (score < bestScore) {
        bestScore = score;
        bestTarget = target;
      }
    }

    arrow.setData("aimAssistTarget", bestTarget);
    return bestTarget;
  }

  private getNearestActiveTarget(
    x: number,
    y: number,
  ): Phaser.Physics.Arcade.Sprite | undefined {
    let bestTarget: Phaser.Physics.Arcade.Sprite | undefined;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const targetObj of this.targets.getChildren()) {
      const target = targetObj as Phaser.Physics.Arcade.Sprite;

      if (!target.active || target.getData("isHit")) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(x, y, target.x, target.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestTarget = target;
      }
    }

    return bestTarget;
  }

  private updateMovingTargets(time: number): void {
    if (this.currentPhase !== 4) return;

    const t = time / 1000;

    for (const targetObj of this.targets.getChildren()) {
      const target = targetObj as Phaser.Physics.Arcade.Sprite;

      if (!target.active || target.getData("isHit")) continue;
      if (!target.getData("isMoving")) continue;

      const baseX = (target.getData("baseX") as number | undefined) ?? target.x;
      const baseY = (target.getData("baseY") as number | undefined) ?? target.y;
      const movePattern = (target.getData("movePattern") as string | undefined) ?? "horizontal";
      const moveSpeed = (target.getData("moveSpeed") as number | undefined) ?? 100;

      const amplitude = Phaser.Math.Clamp(moveSpeed, 60, 140);
      let targetX = baseX;
      let targetY = baseY;

      if (movePattern === "horizontal") {
        targetX = baseX + Math.sin(t * 1.8) * amplitude;
      } else if (movePattern === "vertical") {
        targetY = baseY + Math.cos(t * 1.8) * (amplitude * 0.7);
      } else {
        targetX = baseX + Math.sin(t * 1.6) * (amplitude * 0.8);
        targetY = baseY + Math.cos(t * 2.0) * (amplitude * 0.5);
      }

      target.setPosition(targetX, targetY);

      const outerCircle = (target as any).outerCircle as Phaser.GameObjects.Arc | undefined;
      const innerCircle = (target as any).innerCircle as Phaser.GameObjects.Arc | undefined;
      const bullseye = (target as any).bullseye as Phaser.GameObjects.Arc | undefined;

      outerCircle?.setPosition(targetX, targetY);
      innerCircle?.setPosition(targetX, targetY);
      bullseye?.setPosition(targetX, targetY);
    }
  }

  private segmentHitsCircle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    cx: number,
    cy: number,
    radius: number,
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const segLenSq = dx * dx + dy * dy;

    if (segLenSq === 0) {
      return Phaser.Math.Distance.Between(x1, y1, cx, cy) <= radius;
    }

    const t = Phaser.Math.Clamp(
      ((cx - x1) * dx + (cy - y1) * dy) / segLenSq,
      0,
      1,
    );

    const closestX = x1 + dx * t;
    const closestY = y1 + dy * t;

    return Phaser.Math.Distance.Between(closestX, closestY, cx, cy) <= radius;
  }

  /**
   * Create beautiful training grounds background
   */
  private createBackground(): void {
    const { width, height } = this.cameras.main;

    // Sky with clouds
    this.add.rectangle(0, 0, width * 2, height, 0x87ceeb).setOrigin(0);

    // Decorative clouds
    for (let i = 0; i < 3; i++) {
      const cloudX = (width / 3) * (i + 1);
      const cloudY = 80;
      this.createCloud(cloudX, cloudY, 40);
    }

    // Sun
    this.add.circle(width - 100, 100, 50, 0xffd700);

    // Mountains in distance
    this.createMountainRange(0, height - 200);
  }

  /**
   * Create environment elements
   */
  private createEnvironment(): void {
    const { width, height } = this.cameras.main;

    // Training ground base with texture
    const groundY = height - 100;
    const ground = this.add
      .rectangle(0, groundY, width * 2, 100, 0x8b7355)
      .setOrigin(0)
      .setScrollFactor(1);
    ground.setStrokeStyle(2, 0x654321);

    // Add ground texture pattern
    for (let x = 0; x < width * 2; x += 60) {
      for (let y = groundY; y < groundY + 100; y += 40) {
        const patch = this.add.rectangle(x, y, 50, 35, 0x6d4c41, 0.3);
        patch.setScrollFactor(1);
      }
    }

    // Palace structure in background
    this.createPalaceStructure(width / 2, 150);

    // Guru statue (Vashishtha) - decorative with enhanced visuals
    this.createGuruStatue(width - 200, groundY - 100);

    // Training flags with enhanced visuals
    for (let i = 0; i < 5; i++) {
      const flagX = 300 + i * 400;
      this.createTrainingFlag(flagX, 100);
    }

    // Add archery stall/station
    this.createArcheryStall(width / 4, groundY - 80);

    // Add meditation mats
    for (let i = 0; i < 3; i++) {
      const matX = 200 + i * 500;
      this.createMeditationMat(matX, groundY - 30);
    }

    // Add decorative banners
    this.createBanner(width / 3, 80);
    this.createBanner((width * 2) / 3, 80);
  }

  /**
   * Create training platforms
   */
  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();

    const { width, height } = this.cameras.main;
    const groundY = height - 100;

    // Ground level
    for (let x = 0; x < width * 2; x += 100) {
      this.add
        .rectangle(x, groundY, 100, 100, 0x654321)
        .setOrigin(0)
        .setScrollFactor(1);
      this.platforms.add(
        this.add.rectangle(x, groundY - 50, 100, 50, 0x8b4513).setOrigin(0),
      );
    }

    // Training platforms
    this.createPlatform(320, 500, 150, 20);
    this.createPlatform(720, 455, 150, 20);
    this.createPlatform(1120, 420, 150, 20);

    this.platforms.refresh();
  }

  /**
   * Add a single platform
   */
  private createPlatform(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const platform = this.add
      .rectangle(x, y, width, height, 0xd2691e)
      .setOrigin(0);
    this.platforms?.add(platform);
  }

  /**
   * Create training targets for archery
   */
  private createTargets(): void {
    this.targets.clear(true, true);
    this.targetsHitInPhase = 0;

    const { width, height } = this.cameras.main;
    const groundY = height - 100;

    if (this.currentPhase === 1) {
      // Phase 1: Stationary targets at different heights
      const positions = [
        { x: 600, y: groundY - 120, moving: false },
        { x: 850, y: groundY - 120, moving: false },
        { x: 1100, y: groundY - 120, moving: false },
        { x: 1350, y: groundY - 100, moving: false },
        { x: 1600, y: groundY - 80, moving: false },
      ];

      positions.forEach((pos) => this.createTarget(pos.x, pos.y, pos.moving));
    } else if (this.currentPhase === 2) {
      // Phase 2: Distant targets (requiring full charge)
      const positions = [
        { x: 1200, y: groundY - 160 },
        { x: 1600, y: groundY - 170 },
        { x: 2000, y: groundY - 140 },
      ];

      positions.forEach((pos) => this.createTarget(pos.x, pos.y, false));
    } else if (this.currentPhase === 3) {
      // Phase 3: Precision targets (bullseyes)
      const positions = [
        { x: 700, y: groundY - 170 },
        { x: 1100, y: groundY - 190 },
        { x: 1500, y: groundY - 170 },
      ];

      positions.forEach((pos) => this.createTarget(pos.x, pos.y, false, true)); // Add bullseye flag
    } else if (this.currentPhase === 4) {
      // Phase 4: Moving targets
      const positions = [
        { x: 600, y: groundY - 130, movePattern: "horizontal" },
        { x: 1000, y: groundY - 140, movePattern: "vertical" },
        { x: 1400, y: groundY - 110, movePattern: "diagonal" },
      ];

      positions.forEach((pos) => {
        const target = this.createTarget(pos.x, pos.y, true);
        (target as any).movePattern = pos.movePattern;
        (target as any).moveSpeed = 100;
      });
    }
  }

  /**
   * Create an individual target
   */
  private createTarget(
    x: number,
    y: number,
    isMoving: boolean = false,
    isBullseye: boolean = false,
  ): Phaser.Physics.Arcade.Sprite {
    // Outer circle (red)
    const outerCircle = this.add.circle(x, y, 25, 0xaa0000).setDepth(10);

    // Inner circle (white)
    const innerCircle = this.add.circle(x, y, 18, 0xffffff).setDepth(11);

    // Bullseye center (if needed)
    const bullseye = isBullseye
      ? this.add.circle(x, y, 8, 0xaa0000).setDepth(12)
      : undefined;

    // Create physics sprite as container
    const target = this.physics.add.sprite(x, y, "__WHITE");
    target.setAlpha(0.01); // Keep an active body while visuals are custom circles
    const targetBody = target.body as Phaser.Physics.Arcade.Body;
    targetBody.setAllowGravity(false);
    targetBody.setImmovable(true);
    targetBody.setSize(78, 78, true);
    target.setData("hitCount", 0);
    target.setData("isBullseye", isBullseye);
    target.setData("isMoving", isMoving);
    target.setData("isHit", false);
    target.setData("baseX", x);
    target.setData("baseY", y);

    // Store graphics references
    (target as any).outerCircle = outerCircle;
    (target as any).innerCircle = innerCircle;
    (target as any).bullseye = bullseye;

    this.tweens.add({
      targets: [outerCircle, innerCircle],
      scale: { from: 1, to: 1.08 },
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    target.once(Phaser.GameObjects.Events.DESTROY, () => {
      outerCircle.destroy();
      innerCircle.destroy();
      bullseye?.destroy();
    });

    this.targets.add(target);

    return target;
  }

  /**
   * Setup arrow-target collision detection
   */
  private setupArrowCollisions(): void {
    this.events.on(
      "arrow-hit",
      (data: {
        target?: Phaser.GameObjects.GameObject;
      }) => {
        const target = data.target as Phaser.Physics.Arcade.Sprite | undefined;
        if (!target || !this.targets.contains(target)) {
          return;
        }

        this.handleTargetHit(target);
      },
      this,
    );

    // Register collisions for each newly fired arrow.
    this.events.on("arrow-shot", () => {
      const arrows = this.player.getBow().getArrows();
      const latestArrow = arrows[arrows.length - 1];
      if (!latestArrow) return;

      latestArrow.setData("prevX", latestArrow.x);
      latestArrow.setData("prevY", latestArrow.y);

      const body = latestArrow.body as Phaser.Physics.Arcade.Body | undefined;
      const initialTarget = this.getNearestActiveTarget(latestArrow.x, latestArrow.y);

      if (initialTarget) {
        latestArrow.setData("aimAssistTarget", initialTarget);

        if (body) {
          body.setAllowGravity(false);

          const dx = initialTarget.x - latestArrow.x;
          const dy = initialTarget.y - latestArrow.y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const launchSpeed = Math.max(body.velocity.length(), this.autoAimMinSpeed);

          body.setVelocity((dx / distance) * launchSpeed, (dy / distance) * launchSpeed);
          latestArrow.rotation = Math.atan2(dy, dx);
        }
      }

      this.time.delayedCall(this.guaranteedHitDelayMs, () => {
        if (!latestArrow.active) {
          return;
        }

        const lockedTarget = latestArrow.getData("aimAssistTarget") as
          | Phaser.Physics.Arcade.Sprite
          | undefined;
        const finalTarget =
          lockedTarget && lockedTarget.active && !lockedTarget.getData("isHit")
            ? lockedTarget
            : this.getNearestActiveTarget(latestArrow.x, latestArrow.y);

        if (!finalTarget || !finalTarget.active || finalTarget.getData("isHit")) {
          return;
        }

        if (latestArrow.hit) {
          latestArrow.hit(finalTarget);
        } else {
          latestArrow.destroy();
        }
      });

      this.physics.add.overlap(
        latestArrow,
        this.targets,
        (arrowObj, targetObj) => {
          const arrow = arrowObj as Phaser.Physics.Arcade.Sprite & {
            hit?: (target?: Phaser.GameObjects.GameObject) => void;
          };
          const target = targetObj as Phaser.Physics.Arcade.Sprite;

          if (!target.active || target.getData("isHit")) {
            return;
          }

          if (arrow.hit) {
            arrow.hit(target);
          } else {
            arrow.destroy();
          }
        },
        undefined,
        this,
      );
    });
  }

  /**
   * Handle target hit
   */
  private handleTargetHit(target: Phaser.Physics.Arcade.Sprite): void {
    if (target.getData("isHit")) {
      return;
    }

    target.setData("isHit", true);

    // Mark target as hit
    const hitCount = target.getData("hitCount") || 0;
    target.setData("hitCount", hitCount + 1);

    const body = target.body as Phaser.Physics.Arcade.Body | undefined;
    if (body) {
      body.enable = false;
    }

    // Update visuals
    const isBullseye = target.getData("isBullseye");
    let dharmaGain = 50; // Base dharma for hitting target
    if (isBullseye) dharmaGain = 100; // Double points for bullseye

    this.totalDharmaScore += dharmaGain;
    this.targetsHitInPhase++;
    this.updateHUD();

    // Animate target removal once hit
    this.tweens.add({
      targets: [
        (target as any).outerCircle,
        (target as any).innerCircle,
        (target as any).bullseye,
      ].filter(Boolean),
      alpha: 0,
      scale: 0.7,
      duration: 250,
      onComplete: () => {
        target.destroy();
      },
    });

    // Check if phase complete
    if (
      this.targetsHitInPhase >= this.requiredHitsPerPhase[this.currentPhase - 1]
    ) {
      this.completePhase();
    }
  }

  /**
   * Complete current phase and advance
   */
  private completePhase(): void {
    if (this.currentPhase < 4) {
      const completedPhase = this.currentPhase;
      this.currentPhase++;
      this.showPhaseTransition(completedPhase);
    } else {
      // All phases complete - level complete
      this.completeLevel();
    }
  }

  /**
   * Show phase transition message
   */
  private showPhaseTransition(completedPhase: number): void {
    const phaseMessages: Record<number, string> = {
      1: "Phase 1: Aim Training Complete! Now learn to charge your power...",
      2: "Phase 2: Power Training Complete! Now show your precision...",
      3: "Phase 3: Precision Training Complete! Now face moving targets...",
    };

    const transitionMessage = phaseMessages[completedPhase];
    if (transitionMessage) {
      this.guruText?.setText(transitionMessage);
    }

    // Always spawn the next phase targets after a brief transition pause.
    this.time.delayedCall(2000, () => {
      if (this.levelCompleted) {
        return;
      }

      this.createTargets();
      this.updateHUD();
    });
  }

  /**
   * Complete the level
   */
  private completeLevel(): void {
    if (this.levelCompleted) {
      return;
    }
    this.levelCompleted = true;

    // Stop player movement
    if (this.player.body) {
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }

    // Clear targets
    this.targets.clear(true, true);

    // Show completion message
    this.guruText?.setText(
      "Excellent, Rama! You have mastered archery. You are ready for greater challenges ahead.",
    );

    // Update progression
    const progressionManager = getProgressionManager();
    progressionManager.completeLevel(
      "Level03_BrothersTraining",
      this.totalDharmaScore,
    );
    progressionManager.unlockAstra("AGNEYASTRA"); // Unlock first Astra

    // Show completion dialogue
    this.time.delayedCall(3000, () => {
      this.showLevelComplete();
    });
  }

  /**
   * Show level complete screen
   */
  private showLevelComplete(): void {
    const { width, height } = this.cameras.main;

    const completeText = this.add
      .text(width / 2, height / 2 - 50, "LEVEL COMPLETE", {
        fontSize: "48px",
        fontFamily: "serif",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    const dharmaText = this.add
      .text(
        width / 2,
        height / 2 + 30,
        `Dharma Gained: ${this.totalDharmaScore}`,
        {
          fontSize: "32px",
          fontFamily: "serif",
          color: "#FFFFFF",
          stroke: "#000000",
          strokeThickness: 2,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    const continueText = this.add
      .text(
        width / 2,
        height / 2 + 100,
        "Press SPACE to continue to next level",
        {
          fontSize: "20px",
          fontFamily: "Arial",
          color: "#CCCCCC",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    // Listen for space to continue
    this.input.keyboard?.once("keydown-SPACE", () => {
      this.scene.start("Level04_SagesRequest");
    });
  }

  /**
   * Create HUD elements
   */
  private createHUD(): void {
    const padding = 20;

    // Phase indicator
    this.phaseText = this.add
      .text(padding, padding, "Phase: 1/4", {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#FFD700",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Targets hit counter
    this.targetsText = this.add
      .text(padding, padding + 40, "Targets: 0/5", {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#FF6B6B",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Dharma score
    this.dharmaText = this.add
      .text(padding, padding + 80, "Dharma: 0", {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#00FF00",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Instructions
    this.instructionsText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height - 50,
        "Arrow Keys: Move | Hold SPACE: Aim (Mouse or Up/Down), Release: Shoot",
        {
          fontSize: "16px",
          fontFamily: "Arial",
          color: "#FFFFFF",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 },
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    // Guru guidance text
    this.guruText = this.add
      .text(
        this.cameras.main.width / 2,
        50,
        "Shoot the red-white circles (targets) to advance",
        {
          fontSize: "18px",
          fontFamily: "serif",
          color: "#FFD700",
          backgroundColor: "#000000",
          padding: { x: 15, y: 10 },
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
  }

  /**
   * Update HUD display
   */
  private updateHUD(): void {
    this.phaseText?.setText(`Phase: ${this.currentPhase}/4`);
    this.targetsText?.setText(
      `Targets: ${this.targetsHitInPhase}/${this.requiredHitsPerPhase[this.currentPhase - 1]}`,
    );
    this.dharmaText?.setText(`Dharma: ${this.totalDharmaScore}`);
  }

  /**
   * Start the training phase
   */
  private startTrainingPhase(): void {
    this.createTargets();
    this.updateHUD();
  }

  // Utility methods

  private createCloud(x: number, y: number, size: number): void {
    const cloud = this.add.graphics();
    cloud.fillStyle(0xffffff, 0.8);
    cloud.fillCircle(x - size, y, size);
    cloud.fillCircle(x, y - size / 2, size * 1.2);
    cloud.fillCircle(x + size, y, size);
    cloud.setDepth(5);
  }

  private createMountainRange(x: number, y: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8b7355, 0.7);
    graphics.beginPath();
    graphics.moveTo(x, y);

    for (let i = 0; i < 6; i++) {
      const peakX = x + i * 400;
      const peakY = y + Phaser.Math.Between(-100, 50);
      graphics.lineTo(peakX, peakY);
    }

    graphics.lineTo(x + 2400, y + 200);
    graphics.lineTo(x, y + 200);
    graphics.closePath();
    graphics.fillPath();
    graphics.setDepth(3);
  }

  private createPalaceStructure(x: number, y: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xdaa520, 0.6); // Goldenrod

    // Main structure
    graphics.fillRect(x - 100, y, 200, 150);

    // Roof (triangular)
    graphics.fillTriangleShape(
      new Phaser.Geom.Triangle(x - 100, y, x, y - 50, x + 100, y),
    );

    graphics.setDepth(4);
    graphics.setScrollFactor(1);
  }

  private createGuruStatue(x: number, y: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 0.8); // Gray stone

    // Body
    graphics.fillRect(x - 20, y, 40, 80);

    // Head
    graphics.fillCircle(x, y - 30, 20);

    // Arms
    graphics.fillRect(x - 40, y + 10, 80, 15);

    graphics.setDepth(8);
    graphics.setScrollFactor(1);
  }

  private createTrainingFlag(x: number, y: number): void {
    const graphics = this.add.graphics();

    // Pole
    graphics.lineStyle(4, 0x654321);
    graphics.lineBetween(x, y, x, y + 150);

    // Flag
    graphics.fillStyle(0xff6b6b);
    graphics.fillTriangleShape(
      new Phaser.Geom.Triangle(x, y + 20, x + 40, y + 30, x, y + 40),
    );

    graphics.setDepth(5);
    graphics.setScrollFactor(1);
  }

  private createArcheryStall(x: number, y: number): void {
    const graphics = this.add.graphics();

    // Stall structure (wooden frame)
    graphics.lineStyle(3, 0x8d6e63);
    graphics.strokeRect(x - 40, y, 80, 60);

    // Roof
    graphics.fillStyle(0xf57f17);
    graphics.fillTriangleShape(
      new Phaser.Geom.Triangle(x - 45, y, x + 45, y, x, y - 30),
    );

    // Support posts
    graphics.fillStyle(0x5d4037);
    graphics.fillRect(x - 35, y + 30, 10, 30);
    graphics.fillRect(x + 25, y + 30, 10, 30);

    // Arrow rack decoration
    for (let i = 0; i < 5; i++) {
      const arrowX = x - 30 + i * 15;
      graphics.fillStyle(0xff9800);
      graphics.fillRect(arrowX, y + 10, 3, 20);
    }

    graphics.setDepth(8);
    graphics.setScrollFactor(1);
  }

  private createMeditationMat(x: number, y: number): void {
    // Mat base
    const mat = this.add.rectangle(x, y, 60, 40, 0xc8b88b);
    mat.setStrokeStyle(2, 0x8d6e63);
    mat.setScrollFactor(1);

    // Pattern on mat
    const pattern = this.add.graphics();
    pattern.fillStyle(0xa1887f, 0.5);
    for (let i = 0; i < 3; i++) {
      pattern.fillRect(x - 25, y - 15 + i * 15, 50, 5);
    }
    pattern.setScrollFactor(1);
  }

  private createBanner(x: number, y: number): void {
    // Banner pole
    const pole = this.add.rectangle(x, y + 30, 4, 80, 0x8d6e63);
    pole.setScrollFactor(1);

    // Banner cloth
    const banner = this.add.rectangle(x + 40, y, 70, 40, 0xff6f00);
    banner.setStrokeStyle(2, 0xf57f17);
    banner.setScrollFactor(1);

    // Banner text decoration (pattern)
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffd700);
    for (let i = 0; i < 3; i++) {
      graphics.fillCircle(x + 30 + i * 25, y, 4);
    }
    graphics.setScrollFactor(1);

    // Rope from pole to banner
    const graphics2 = this.add.graphics();
    graphics2.lineStyle(2, 0x654321);
    graphics2.lineBetween(x, y + 30, x + 40, y);
    graphics2.setScrollFactor(1);
  }
}
