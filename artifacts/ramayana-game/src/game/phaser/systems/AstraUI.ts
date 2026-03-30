import Phaser from "phaser";
import { ASTRAS, type AstraId } from "../config/astras";

/**
 * AstraUI - Divine Weapon Selection System
 * Displays unlocked Astras and allows player to select them
 * Traditional Indian art style with ornate designs
 */
export class AstraUI {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private unlockedAstras: Set<AstraId> = new Set();
  private selectedAstra: AstraId | null = null;
  private astraSlots: Map<AstraId, AstraSlot> = new Map();

  private readonly SLOT_SIZE = 60;
  private readonly SLOT_SPACING = 10;
  private readonly START_X = 20;
  private readonly START_Y = 20;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
    this.setupInput();
  }

  /**
   * Create the Astra UI elements
   */
  private create(): void {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(900);
    this.container.setScrollFactor(0); // Fixed to camera

    // Create slots for all possible Astras (1-5 keys)
    const astraKeys: AstraId[] = [
      "AGNEYASTRA",
      "VARUNASTRA",
      "VAYAVYASTRA",
      "MANAVASTRA",
      "BRAHMASTRA",
    ];

    astraKeys.forEach((astra, index) => {
      const slot = this.createAstraSlot(astra, index);
      this.astraSlots.set(astra, slot);
      this.container.add(slot.container);
    });

    // Instructions text
    const instructions = this.scene.add.text(
      this.START_X,
      this.START_Y + (this.SLOT_SIZE + this.SLOT_SPACING) * 5 + 20,
      "Press 1-5: Select Astra",
      {
        fontSize: "16px",
        fontFamily: "serif",
        color: "#FFD700",
        stroke: "#000000",
        strokeThickness: 3,
      },
    );
    this.container.add(instructions);
  }

  /**
   * Create a single Astra slot
   */
  private createAstraSlot(astra: AstraId, index: number): AstraSlot {
    const astraData = ASTRAS[astra];
    const x = this.START_X;
    const y = this.START_Y + index * (this.SLOT_SIZE + this.SLOT_SPACING);

    const slotContainer = this.scene.add.container(x, y);

    // Background (locked state - dark)
    const background = this.scene.add.graphics();
    this.drawSlotBackground(background, false, false);
    slotContainer.add(background);

    // Icon (element-based visual)
    const icon = this.scene.add.graphics();
    this.drawAstraIcon(icon, astra, false);
    slotContainer.add(icon);

    // Key number
    const keyText = this.scene.add.text(
      this.SLOT_SIZE - 8,
      8,
      (index + 1).toString(),
      {
        fontSize: "20px",
        fontFamily: "serif",
        color: "#FFFFFF",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      },
    );
    keyText.setOrigin(1, 0);
    slotContainer.add(keyText);

    // Name text (below slot)
    const nameText = this.scene.add.text(
      this.SLOT_SIZE + 10,
      this.SLOT_SIZE / 2,
      astraData.name,
      {
        fontSize: "18px",
        fontFamily: "serif",
        color: "#888888", // Gray when locked
        fontStyle: "bold",
      },
    );
    nameText.setOrigin(0, 0.5);
    slotContainer.add(nameText);

    // Cooldown overlay (circular progress)
    const cooldownOverlay = this.scene.add.graphics();
    cooldownOverlay.setVisible(false);
    slotContainer.add(cooldownOverlay);

    // Mana cost indicator
    const manaCost = this.scene.add.text(
      8,
      this.SLOT_SIZE - 8,
      `${astraData.manaCost}`,
      {
        fontSize: "16px",
        fontFamily: "serif",
        color: "#00BFFF",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 2,
      },
    );
    manaCost.setOrigin(0, 1);
    slotContainer.add(manaCost);

    // Initially locked
    slotContainer.setAlpha(0.5);

    return {
      container: slotContainer,
      background,
      icon,
      nameText,
      keyText,
      cooldownOverlay,
      manaCost,
      isUnlocked: false,
      isOnCooldown: false,
      cooldownProgress: 0,
    };
  }

  /**
   * Draw slot background
   */
  private drawSlotBackground(
    g: Phaser.GameObjects.Graphics,
    unlocked: boolean,
    selected: boolean,
  ): void {
    g.clear();

    const size = this.SLOT_SIZE;

    // Background fill
    if (selected) {
      g.fillStyle(0xffd700, 0.8); // Gold when selected
    } else if (unlocked) {
      g.fillStyle(0x4a3728, 0.9); // Brown when unlocked
    } else {
      g.fillStyle(0x2c2c2c, 0.9); // Dark gray when locked
    }

    g.fillRoundedRect(0, 0, size, size, 8);

    // Border
    if (selected) {
      g.lineStyle(4, 0xffff00); // Bright yellow when selected
    } else if (unlocked) {
      g.lineStyle(3, 0xff8c00); // Orange when unlocked
    } else {
      g.lineStyle(2, 0x555555); // Gray when locked
    }

    g.strokeRoundedRect(0, 0, size, size, 8);

    // Inner glow for selected
    if (selected) {
      g.lineStyle(2, 0xffff00, 0.5);
      g.strokeRoundedRect(3, 3, size - 6, size - 6, 6);
    }
  }

  /**
   * Draw Astra icon based on element
   */
  private drawAstraIcon(
    g: Phaser.GameObjects.Graphics,
    astra: AstraId,
    unlocked: boolean,
  ): void {
    g.clear();

    const centerX = this.SLOT_SIZE / 2;
    const centerY = this.SLOT_SIZE / 2;
    const size = 20;

    const alpha = unlocked ? 1 : 0.3;

    switch (astra) {
      case "AGNEYASTRA": // Fire
        g.fillStyle(0xff4500, alpha);
        g.fillTriangle(
          centerX,
          centerY - size,
          centerX - size * 0.8,
          centerY + size * 0.5,
          centerX + size * 0.8,
          centerY + size * 0.5,
        );
        g.fillStyle(0xff8c00, alpha);
        g.fillTriangle(
          centerX,
          centerY - size * 0.5,
          centerX - size * 0.5,
          centerY + size * 0.2,
          centerX + size * 0.5,
          centerY + size * 0.2,
        );
        break;

      case "VARUNASTRA": // Water
        g.fillStyle(0x0080ff, alpha);
        g.fillCircle(centerX, centerY - 5, 8);
        g.fillCircle(centerX - 8, centerY + 5, 6);
        g.fillCircle(centerX + 8, centerY + 5, 6);
        g.fillCircle(centerX, centerY + 8, 5);
        break;

      case "VAYAVYASTRA": // Wind
        g.lineStyle(3, 0x87ceeb, alpha);
        g.beginPath();
        g.moveTo(centerX - size, centerY - 8);
        g.lineTo(centerX + size, centerY - 8);
        g.moveTo(centerX - size + 5, centerY);
        g.lineTo(centerX + size - 5, centerY);
        g.moveTo(centerX - size, centerY + 8);
        g.lineTo(centerX + size, centerY + 8);
        g.strokePath();
        break;

      case "MANAVASTRA": // Mental/Mind
        g.fillStyle(0x9370db, alpha);
        g.fillCircle(centerX, centerY, 12);
        g.lineStyle(2, 0xdda0dd, alpha);
        g.strokeCircle(centerX, centerY, 15);
        g.strokeCircle(centerX, centerY, 8);
        // Third eye
        g.fillStyle(0xffffff, alpha);
        g.fillCircle(centerX, centerY - 3, 3);
        break;

      case "BRAHMASTRA": // Divine/Ultimate
        g.fillStyle(0xffd700, alpha);
        // Draw star manually (no fillStar in Phaser)
        const points = 8;
        const outerRadius = 18;
        const innerRadius = 10;
        g.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / points - Math.PI / 2;
          const px = centerX + Math.cos(angle) * radius;
          const py = centerY + Math.sin(angle) * radius;
          if (i === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.closePath();
        g.fillPath();
        g.fillStyle(0xffffff, alpha);
        g.fillCircle(centerX, centerY, 6);
        break;
    }
  }

  /**
   * Setup keyboard input for Astra selection
   */
  private setupInput(): void {
    // Number keys 1-5 for Astra selection
    const keys = ["ONE", "TWO", "THREE", "FOUR", "FIVE"];
    const astras: AstraId[] = [
      "AGNEYASTRA",
      "VARUNASTRA",
      "VAYAVYASTRA",
      "MANAVASTRA",
      "BRAHMASTRA",
    ];

    keys.forEach((key, index) => {
      this.scene.input.keyboard?.on(`keydown-${key}`, () => {
        this.selectAstra(astras[index]);
      });
    });
  }

  /**
   * Unlock an Astra
   */
  public unlockAstra(astra: AstraId): void {
    if (this.unlockedAstras.has(astra)) return;

    this.unlockedAstras.add(astra);

    const slot = this.astraSlots.get(astra);
    if (slot) {
      slot.isUnlocked = true;
      slot.container.setAlpha(1);

      // Update visuals
      this.drawSlotBackground(slot.background, true, false);
      this.drawAstraIcon(slot.icon, astra, true);

      // Update name text color
      slot.nameText.setColor("#FFD700");

      // Unlock animation
      this.scene.tweens.add({
        targets: slot.container,
        scale: { from: 1, to: 1.2 },
        duration: 200,
        yoyo: true,
        ease: "Back.easeOut",
      });

      // Emit event
      this.scene.events.emit("astra-unlocked", astra);

      // Show notification
      this.showUnlockNotification(astra);
    }
  }

  /**
   * Select an Astra for use
   */
  public selectAstra(astra: AstraId): void {
    // Check if unlocked
    if (!this.unlockedAstras.has(astra)) {
      this.showLockedMessage(astra);
      return;
    }

    const slot = this.astraSlots.get(astra);
    if (!slot) return;

    // Check cooldown
    if (slot.isOnCooldown) {
      this.showCooldownMessage(astra);
      return;
    }

    // Deselect previous
    if (this.selectedAstra) {
      const prevSlot = this.astraSlots.get(this.selectedAstra);
      if (prevSlot) {
        this.drawSlotBackground(prevSlot.background, true, false);
      }
    }

    // Select new Astra
    this.selectedAstra = astra;
    this.drawSlotBackground(slot.background, true, true);

    // Emit event
    this.scene.events.emit("astra-selected", astra);

    // Visual feedback
    this.scene.tweens.add({
      targets: slot.container,
      scale: { from: 1, to: 1.1 },
      duration: 100,
      yoyo: true,
    });
  }

  /**
   * Start cooldown for an Astra
   */
  public startCooldown(astra: AstraId, durationMs: number): void {
    const slot = this.astraSlots.get(astra);
    if (!slot) return;

    slot.isOnCooldown = true;
    slot.cooldownProgress = 1;
    slot.cooldownOverlay.setVisible(true);

    // Cooldown animation
    this.scene.tweens.add({
      targets: slot,
      cooldownProgress: 0,
      duration: durationMs,
      ease: "Linear",
      onUpdate: () => {
        this.drawCooldownOverlay(slot);
      },
      onComplete: () => {
        slot.isOnCooldown = false;
        slot.cooldownOverlay.setVisible(false);
        this.scene.events.emit("astra-ready", astra);
      },
    });
  }

  /**
   * Draw cooldown overlay (circular progress)
   */
  private drawCooldownOverlay(slot: AstraSlot): void {
    const g = slot.cooldownOverlay;
    g.clear();

    if (slot.cooldownProgress > 0) {
      const centerX = this.SLOT_SIZE / 2;
      const centerY = this.SLOT_SIZE / 2;
      const radius = this.SLOT_SIZE / 2;

      // Semi-transparent black overlay
      g.fillStyle(0x000000, 0.7);
      g.slice(
        centerX,
        centerY,
        radius,
        -Math.PI / 2,
        -Math.PI / 2 + slot.cooldownProgress * Math.PI * 2,
        false,
      );
      g.fillPath();
    }
  }

  /**
   * Show unlock notification
   */
  private showUnlockNotification(astra: AstraId): void {
    const astraData = ASTRAS[astra];

    const notif = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      150,
      `🔓 ${astraData.name} UNLOCKED!\n${astraData.element.toUpperCase()} WEAPON`,
      {
        fontSize: "32px",
        fontFamily: "serif",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
      },
    );
    notif.setOrigin(0.5);
    notif.setDepth(1100);
    notif.setScrollFactor(0);

    // Animated entrance
    notif.setScale(0);
    this.scene.tweens.add({
      targets: notif,
      scale: 1.2,
      duration: 500,
      ease: "Back.easeOut",
      onComplete: () => {
        // Fade out and destroy
        this.scene.tweens.add({
          targets: notif,
          alpha: 0,
          scale: 0.8,
          duration: 500,
          delay: 2000,
          onComplete: () => {
            notif.destroy();
          },
        });
      },
    });
  }

  /**
   * Show locked message
   */
  private showLockedMessage(astra: AstraId): void {
    const msg = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      200,
      "🔒 LOCKED",
      {
        fontSize: "24px",
        fontFamily: "serif",
        color: "#FF4444",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      },
    );
    msg.setOrigin(0.5);
    msg.setDepth(1100);
    msg.setScrollFactor(0);

    this.scene.tweens.add({
      targets: msg,
      alpha: 0,
      y: "-=30",
      duration: 1000,
      onComplete: () => msg.destroy(),
    });
  }

  /**
   * Show cooldown message
   */
  private showCooldownMessage(astra: AstraId): void {
    const msg = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      200,
      "⏱️ ON COOLDOWN",
      {
        fontSize: "24px",
        fontFamily: "serif",
        color: "#FFA500",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      },
    );
    msg.setOrigin(0.5);
    msg.setDepth(1100);
    msg.setScrollFactor(0);

    this.scene.tweens.add({
      targets: msg,
      alpha: 0,
      y: "-=30",
      duration: 1000,
      onComplete: () => msg.destroy(),
    });
  }

  /**
   * Get currently selected Astra
   */
  public getSelectedAstra(): AstraId | null {
    return this.selectedAstra;
  }

  /**
   * Check if an Astra is unlocked
   */
  public isAstraUnlocked(astra: AstraId): boolean {
    return this.unlockedAstras.has(astra);
  }

  /**
   * Check if an Astra is on cooldown
   */
  public isAstraOnCooldown(astra: AstraId): boolean {
    const slot = this.astraSlots.get(astra);
    return slot?.isOnCooldown ?? false;
  }

  /**
   * Destroy the Astra UI
   */
  public destroy(): void {
    this.container.destroy();
  }
}

/**
 * Astra Slot Interface
 */
interface AstraSlot {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Graphics;
  icon: Phaser.GameObjects.Graphics;
  nameText: Phaser.GameObjects.Text;
  keyText: Phaser.GameObjects.Text;
  cooldownOverlay: Phaser.GameObjects.Graphics;
  manaCost: Phaser.GameObjects.Text;
  isUnlocked: boolean;
  isOnCooldown: boolean;
  cooldownProgress: number;
}
