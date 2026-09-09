import Phaser from "phaser";
import {
  DialogueSystem,
  BALA_KANDA_DIALOGUES,
} from "../systems/DialogueSystem";
import { PauseMenu } from "../systems/PauseMenu";
import { LevelFlow } from "../utils/LevelFlow";
import { getGameSettings } from "../managers/GameSettings";
import { getProgressionManager } from "../managers/LevelProgressionManager";

/**
 * Level 1: "The Question of Perfection"
 * Location: Sage Valmiki's Ashram on the banks of Tamasa River
 * Type: Story/Cinematic introduction
 * Purpose: Introduce the player to the Ramayana story through Valmiki's conversation with Narada
 */
export class Level01_ValmikiAshram extends Phaser.Scene {
  private dialogueSystem!: DialogueSystem;
  private pauseMenu!: PauseMenu;
  private hasCompletedIntro: boolean = false;

  constructor() {
    super({ key: "Level01_ValmikiAshram" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level01_ValmikiAshram");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;

    // Create beautiful serene ashram scene
    this.createBackground();
    this.createEnvironment();

    // Initialize dialogue system
    this.dialogueSystem = new DialogueSystem(this);
    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level01_ValmikiAshram",
      levelName: "Level 01 — The Question of Perfection",
    });

    // Listen for dialogue completion
    this.events.on("dialogue-end", (id: string) => {
      if (id === "level_1_intro") {
        this.hasCompletedIntro = true;
        // Persist mission completion so Continue/Level Select unlock L02.
        getProgressionManager().completeLevel("Level01_ValmikiAshram", 100);
        this.showContinuePrompt();
      }
    });

    // Start intro dialogue after brief pause
    this.time.delayedCall(1000, () => {
      this.dialogueSystem.startDialogue(BALA_KANDA_DIALOGUES.LEVEL_1_INTRO);
    });

    // Level title
    this.showLevelTitle();
  }

  /**
   * Create serene river background
   */
  private createBackground(): void {
    const { width, height } = this.cameras.main;

    // Sky gradient (peaceful dawn)
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xffd700, 0xffa500, 1);
    sky.fillRect(0, 0, width, height);
    sky.setDepth(-100);

    // Sun/Moon
    const sun = this.add.circle(width - 200, 150, 60, 0xffd700);
    sun.setDepth(-90);

    // Distant mountains (3 layers for depth)
    this.createMountains(0, height - 400, 0x8b7355, 0.3);
    this.createMountains(0, height - 300, 0xa0826d, 0.5);
    this.createMountains(0, height - 200, 0xb89968, 0.7);

    // River in background
    this.createRiver();
  }

  /**
   * Create mountain silhouettes
   */
  private createMountains(
    x: number,
    y: number,
    color: number,
    alpha: number,
  ): void {
    const { width } = this.cameras.main;
    const mountains = this.add.graphics();
    mountains.fillStyle(color, alpha);
    mountains.beginPath();
    mountains.moveTo(x, y + 150);

    for (let i = 0; i < 6; i++) {
      const peakX = x + (i * width) / 5;
      const peakY = y + Phaser.Math.Between(-50, 50);
      mountains.lineTo(peakX, peakY);
    }

    mountains.lineTo(width, y + 150);
    mountains.lineTo(width, y + 200);
    mountains.lineTo(x, y + 200);
    mountains.closePath();
    mountains.fillPath();
    mountains.setDepth(-80 + alpha * 10);
  }

  /**
   * Create flowing river (Tamasa)
   */
  private createRiver(): void {
    const { width, height } = this.cameras.main;
    const riverY = height - 150;

    // River body
    const river = this.add.graphics();
    river.fillGradientStyle(0x4682b4, 0x4682b4, 0x1e90ff, 0x00bfff, 1);
    river.fillRect(0, riverY, width, 150);
    river.setDepth(-70);

    // Animated water ripples
    for (let i = 0; i < 10; i++) {
      const ripple = this.add.ellipse(
        Phaser.Math.Between(0, width),
        riverY + Phaser.Math.Between(20, 80),
        40,
        15,
        0xffffff,
        0.2,
      );
      ripple.setDepth(-69);

      // Animate ripples
      this.tweens.add({
        targets: ripple,
        x: "+=100",
        alpha: { from: 0.2, to: 0 },
        duration: 3000,
        repeat: -1,
        delay: i * 300,
      });
    }

    // Water reflection shimmer
    const shimmer = this.add.graphics();
    shimmer.setDepth(-68);

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 2000,
      repeat: -1,
      yoyo: true,
      onUpdate: (tween) => {
        if (!shimmer) return;
        const value = tween.getValue() ?? 0;
        shimmer.clear();
        shimmer.fillStyle(0xffffff, 0.1 + value * 0.1);
        for (let i = 0; i < 20; i++) {
          const x = (i * width) / 20 + value * 50;
          const y = riverY + 50 + Math.sin(i + value * Math.PI) * 20;
          shimmer.fillCircle(x, y, 8);
        }
      },
    });
  }

  /**
   * Create ashram environment
   */
  private createEnvironment(): void {
    const { width, height } = this.cameras.main;

    // Trees (dense forest ashram)
    this.createTree(150, height - 300, 80, 150);
    this.createTree(width - 200, height - 280, 70, 140);
    this.createTree(300, height - 250, 60, 120);
    this.createTree(width - 400, height - 260, 75, 135);

    // Ashram structure (simple hut)
    this.createAshram(width / 2 - 150, height - 400);

    // Flowering plants
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(100, width - 100);
      const y = height - Phaser.Math.Between(180, 220);
      this.createFlower(x, y);
    }

    // Animated birds
    this.createBirds();

    // Meditating sage (Valmiki) - silhouette
    this.createSageValmiki(width / 2 - 100, height - 250);

    // Standing sage (Narada) - silhouette
    this.createSageNarada(width / 2 + 100, height - 250);
  }

  /**
   * Create a tree
   */
  private createTree(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const tree = this.add.graphics();

    // Trunk
    tree.fillStyle(0x8b4513);
    tree.fillRect(x - width / 8, y, width / 4, height / 2);

    // Foliage (layered circles for depth)
    tree.fillStyle(0x228b22, 0.8);
    tree.fillCircle(x, y - height / 4, width / 1.5);
    tree.fillStyle(0x32cd32, 0.9);
    tree.fillCircle(x - width / 4, y - height / 3, width / 2);
    tree.fillCircle(x + width / 4, y - height / 3, width / 2);
    tree.fillStyle(0x3cb371);
    tree.fillCircle(x, y - height / 2, width / 1.8);

    tree.setDepth(-50);

    // Subtle sway animation
    this.tweens.add({
      targets: tree,
      x: -3,
      duration: 2000 + Phaser.Math.Between(0, 1000),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /**
   * Create ashram hut
   */
  private createAshram(x: number, y: number): void {
    const hut = this.add.graphics();

    // Walls
    hut.fillStyle(0xd2b48c);
    hut.fillRect(x, y + 60, 300, 140);

    // Roof (triangular thatched)
    hut.fillStyle(0x8b7355);
    hut.fillTriangle(x - 20, y + 60, x + 150, y - 20, x + 320, y + 60);

    // Door
    hut.fillStyle(0x654321);
    hut.fillRect(x + 120, y + 130, 60, 70);

    // Windows
    hut.fillStyle(0x4a3018);
    hut.fillRect(x + 40, y + 100, 50, 50);
    hut.fillRect(x + 210, y + 100, 50, 50);

    // Decorative patterns
    hut.lineStyle(2, 0xffd700);
    hut.strokeRect(x + 10, y + 70, 280, 120);

    hut.setDepth(-60);
  }

  /**
   * Create flower
   */
  private createFlower(x: number, y: number): void {
    const colors = [0xff69b4, 0xff1493, 0xffd700, 0xff8c00];
    const color = Phaser.Utils.Array.GetRandom(colors);

    const flower = this.add.graphics();
    flower.fillStyle(color);

    // Petals
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const petalX = x + Math.cos(angle) * 5;
      const petalY = y + Math.sin(angle) * 5;
      flower.fillCircle(petalX, petalY, 4);
    }

    // Center
    flower.fillStyle(0xffd700);
    flower.fillCircle(x, y, 3);

    flower.setDepth(-55);
  }

  /**
   * Create flying birds animation
   */
  private createBirds(): void {
    const { width } = this.cameras.main;

    for (let i = 0; i < 5; i++) {
      const bird = this.add.graphics();
      bird.lineStyle(2, 0x000000);
      bird.beginPath();
      bird.arc(0, 0, 8, 0, Math.PI, true);
      bird.arc(16, 0, 8, 0, Math.PI, true);
      bird.strokePath();

      bird.setPosition(-50, 100 + i * 30);
      bird.setDepth(-40);

      // Fly across screen
      this.tweens.add({
        targets: bird,
        x: width + 50,
        duration: 15000 + i * 2000,
        repeat: -1,
        delay: i * 3000,
      });

      // Wing flap
      this.tweens.add({
        targets: bird,
        scaleY: { from: 1, to: 0.7 },
        duration: 300,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /**
   * Create Sage Valmiki (meditating pose)
   */
  private createSageValmiki(x: number, y: number): void {
    const sage = this.add.graphics();

    // Saffron robes
    sage.fillStyle(0xff8c00, 0.7);
    sage.fillCircle(x, y, 30); // Body (sitting cross-legged)
    sage.fillCircle(x, y - 40, 20); // Head

    // Sacred thread
    sage.lineStyle(2, 0xffd700);
    sage.lineBetween(x - 10, y - 35, x + 15, y + 10);

    sage.setDepth(-30);

    // Subtle breathing animation
    this.tweens.add({
      targets: sage,
      scaleY: { from: 1, to: 1.05 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /**
   * Create Sage Narada (standing with veena)
   */
  private createSageNarada(x: number, y: number): void {
    const sage = this.add.graphics();

    // White robes
    sage.fillStyle(0xf5f5dc, 0.7);
    sage.fillRect(x - 15, y - 20, 30, 60); // Body
    sage.fillCircle(x, y - 50, 18); // Head

    // Veena (musical instrument)
    sage.lineStyle(3, 0x8b4513);
    sage.lineBetween(x - 20, y - 10, x - 40, y + 20);
    sage.fillStyle(0x8b4513);
    sage.fillCircle(x - 40, y + 20, 8);

    sage.setDepth(-30);
  }

  /**
   * Show level title
   */
  private showLevelTitle(): void {
    const { width, height } = this.cameras.main;

    const titleContainer = this.add.container(width / 2, 100);
    titleContainer.setDepth(800);

    // Background panel
    const panel = this.add.graphics();
    panel.fillStyle(0x2c1810, 0.8);
    panel.fillRoundedRect(-250, -50, 500, 100, 12);
    panel.lineStyle(3, 0xffd700);
    panel.strokeRoundedRect(-250, -50, 500, 100, 12);
    titleContainer.add(panel);

    // Title
    const title = this.add.text(0, -20, "Bala Kanda - Level 1", {
      fontSize: "24px",
      fontFamily: "serif",
      color: "#FFD700",
      fontStyle: "bold",
    });
    title.setOrigin(0.5);
    titleContainer.add(title);

    const subtitle = this.add.text(0, 15, '"The Question of Perfection"', {
      fontSize: "20px",
      fontFamily: "serif",
      color: "#FFFFFF",
      fontStyle: "italic",
    });
    subtitle.setOrigin(0.5);
    titleContainer.add(subtitle);

    // Fade out after 3 seconds
    this.tweens.add({
      targets: titleContainer,
      alpha: 0,
      duration: 1000,
      delay: 3000,
      onComplete: () => titleContainer.destroy(),
    });
  }

  /**
   * Show continue prompt after dialogue
   */
  private showContinuePrompt(): void {
    const { width, height } = this.cameras.main;

    const prompt = this.add.text(
      width / 2,
      height - 100,
      "Press SPACE to continue to next level",
      {
        fontSize: "24px",
        fontFamily: "serif",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      },
    );
    prompt.setOrigin(0.5);
    prompt.setDepth(1000);

    // Pulse animation
    this.tweens.add({
      targets: prompt,
      scale: { from: 1, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Listen for space - transition to Level 2
    const keyboard = this.input.keyboard;
    if (keyboard) {
      keyboard.once("keydown-SPACE", () => {
        // Transition to Level 2: Sacred Yajna
        this.scene.start("Level02_SacredYajna");
      });
    }
  }

  update(): void {
    if (this.pauseMenu?.isPausedState()) return;
    // Level is primarily cinematic, no gameplay update needed
  }
}
