import Phaser from "phaser";

/**
 * Dialogue Entry - represents a single dialogue message
 */
export interface DialogueEntry {
  character: string; // Character name (Sanskrit)
  text: string; // Dialogue text
  portrait?: string; // Portrait sprite key
  position?: "left" | "right" | "center"; // Character position
  emotion?: "neutral" | "happy" | "sad" | "angry" | "surprised";
  voiceKey?: string; // Audio key for voice
  duration?: number; // Auto-advance duration (ms), 0 = wait for input
}

/**
 * Dialogue Sequence - a series of dialogue entries
 */
export interface DialogueSequence {
  id: string;
  entries: DialogueEntry[];
  onComplete?: () => void;
  skippable?: boolean;
  background?: string; // Background image key
}

/**
 * DialogueSystem - Handles in-game dialogues and cutscenes
 * Traditional Indian art style with Sanskrit character names
 */
export class DialogueSystem {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private dialogueBox!: Phaser.GameObjects.Graphics;
  private characterName!: Phaser.GameObjects.Text;
  private dialogueText!: Phaser.GameObjects.Text;
  private portrait!: Phaser.GameObjects.Sprite;
  private continueIndicator!: Phaser.GameObjects.Text;

  private currentSequence: DialogueSequence | null = null;
  private currentIndex: number = 0;
  private isActive: boolean = false;
  private isTyping: boolean = false;
  private textRevealTimer?: Phaser.Time.TimerEvent;
  private autoAdvanceTimer?: Phaser.Time.TimerEvent;

  // Visual settings
  private readonly BOX_WIDTH = 1100;
  private readonly BOX_HEIGHT = 180;
  private readonly BOX_Y = 520;
  private readonly PORTRAIT_SIZE = 120;
  private readonly TEXT_SPEED = 30; // milliseconds per character

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  /**
   * Create the dialogue UI elements
   */
  private create(): void {
    const centerX = this.scene.cameras.main.width / 2;

    // Main container (hidden by default)
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000);
    this.container.setVisible(false);
    this.container.setScrollFactor(0); // Fixed to camera

    // Dialogue box background (ornate Indian style)
    this.dialogueBox = this.scene.add.graphics();
    this.drawDialogueBox();
    this.container.add(this.dialogueBox);

    // Character portrait (circular frame)
    this.portrait = this.scene.add.sprite(100, this.BOX_Y + 90, "");
    this.portrait.setDisplaySize(this.PORTRAIT_SIZE, this.PORTRAIT_SIZE);
    this.portrait.setVisible(false);
    this.container.add(this.portrait);

    // Character name text (Sanskrit style)
    this.characterName = this.scene.add.text(240, this.BOX_Y + 20, "", {
      fontSize: "28px",
      fontFamily: "serif",
      color: "#FFD700", // Gold
      fontStyle: "bold",
      stroke: "#8B4513",
      strokeThickness: 3,
    });
    this.container.add(this.characterName);

    // Dialogue text (main content)
    this.dialogueText = this.scene.add.text(240, this.BOX_Y + 60, "", {
      fontSize: "22px",
      fontFamily: "serif",
      color: "#FFFFFF",
      wordWrap: { width: this.BOX_WIDTH - 280 },
      lineSpacing: 8,
    });
    this.container.add(this.dialogueText);

    // Continue indicator (animated)
    this.continueIndicator = this.scene.add.text(
      centerX,
      this.BOX_Y + this.BOX_HEIGHT - 30,
      "▼ Press SPACE to continue ▼",
      {
        fontSize: "18px",
        fontFamily: "serif",
        color: "#FFD700",
        fontStyle: "italic",
      },
    );
    this.continueIndicator.setOrigin(0.5);
    this.continueIndicator.setVisible(false);
    this.container.add(this.continueIndicator);

    // Animate continue indicator
    this.scene.tweens.add({
      targets: this.continueIndicator,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Input handling
    this.scene.input.keyboard?.on("keydown-SPACE", () => {
      this.handleInput();
    });

    this.scene.input.on("pointerdown", () => {
      this.handleInput();
    });
  }

  /**
   * Draw the ornate dialogue box (traditional Indian style)
   */
  private drawDialogueBox(): void {
    const centerX = this.scene.cameras.main.width / 2;
    const x = centerX - this.BOX_WIDTH / 2;
    const y = this.BOX_Y;

    this.dialogueBox.clear();

    // Outer border (gold)
    this.dialogueBox.lineStyle(4, 0xffd700);
    this.dialogueBox.fillStyle(0x2c1810, 0.95); // Dark brown, slightly transparent
    this.dialogueBox.fillRoundedRect(x, y, this.BOX_WIDTH, this.BOX_HEIGHT, 12);
    this.dialogueBox.strokeRoundedRect(
      x,
      y,
      this.BOX_WIDTH,
      this.BOX_HEIGHT,
      12,
    );

    // Inner decorative border
    this.dialogueBox.lineStyle(2, 0xff8c00);
    this.dialogueBox.strokeRoundedRect(
      x + 8,
      y + 8,
      this.BOX_WIDTH - 16,
      this.BOX_HEIGHT - 16,
      8,
    );

    // Corner decorations (traditional motifs)
    this.drawCornerDecoration(x + 20, y + 20);
    this.drawCornerDecoration(x + this.BOX_WIDTH - 20, y + 20, true);
    this.drawCornerDecoration(x + 20, y + this.BOX_HEIGHT - 20, false, true);
    this.drawCornerDecoration(
      x + this.BOX_WIDTH - 20,
      y + this.BOX_HEIGHT - 20,
      true,
      true,
    );

    // Portrait frame (circular gold border)
    this.dialogueBox.lineStyle(3, 0xffd700);
    this.dialogueBox.strokeCircle(
      100,
      this.BOX_Y + 90,
      this.PORTRAIT_SIZE / 2 + 5,
    );
    this.dialogueBox.fillStyle(0x4a3728);
    this.dialogueBox.fillCircle(
      100,
      this.BOX_Y + 90,
      this.PORTRAIT_SIZE / 2 + 2,
    );
  }

  /**
   * Draw decorative corner motifs (simplified paisley/mandala style)
   */
  private drawCornerDecoration(
    x: number,
    y: number,
    flipX: boolean = false,
    flipY: boolean = false,
  ): void {
    const scale = flipX ? -1 : 1;
    const scaleY = flipY ? -1 : 1;

    this.dialogueBox.lineStyle(2, 0xff8c00);
    this.dialogueBox.beginPath();
    this.dialogueBox.arc(x, y, 8 * scaleY, 0, Math.PI / 2);
    this.dialogueBox.strokePath();

    this.dialogueBox.lineStyle(1, 0xffd700);
    this.dialogueBox.strokeCircle(x + 5 * scale, y + 5 * scaleY, 3);
  }

  /**
   * Start a dialogue sequence
   */
  public startDialogue(sequence: DialogueSequence): void {
    if (this.isActive) {
      console.warn("Dialogue already active, stopping previous sequence");
      this.stopDialogue();
    }

    this.currentSequence = sequence;
    this.currentIndex = 0;
    this.isActive = true;

    // Pause game physics
    if (this.scene.physics?.world) {
      this.scene.physics.world.pause();
    }

    // Show container
    this.container.setVisible(true);

    // Show first entry
    this.showDialogueEntry(0);

    // Emit event
    this.scene.events.emit("dialogue-start", sequence.id);
  }

  /**
   * Stop the current dialogue
   */
  public stopDialogue(): void {
    if (!this.isActive) return;

    this.isActive = false;
    this.container.setVisible(false);

    // Clean up timers
    if (this.textRevealTimer) {
      this.textRevealTimer.destroy();
      this.textRevealTimer = undefined;
    }

    if (this.autoAdvanceTimer) {
      this.autoAdvanceTimer.destroy();
      this.autoAdvanceTimer = undefined;
    }

    // Resume game physics
    if (this.scene.physics?.world) {
      this.scene.physics.world.resume();
    }

    // Call completion callback
    if (this.currentSequence?.onComplete) {
      this.currentSequence.onComplete();
    }

    // Emit event
    this.scene.events.emit("dialogue-end", this.currentSequence?.id);

    this.currentSequence = null;
  }

  /**
   * Show a specific dialogue entry
   */
  private showDialogueEntry(index: number): void {
    if (!this.currentSequence) return;
    if (index >= this.currentSequence.entries.length) {
      this.stopDialogue();
      return;
    }

    const entry = this.currentSequence.entries[index];

    // Update character name
    this.characterName.setText(entry.character);

    // Update portrait
    if (entry.portrait) {
      this.portrait.setTexture(entry.portrait);
      this.portrait.setVisible(true);
    } else {
      this.portrait.setVisible(false);
    }

    // Start text reveal animation
    this.revealText(entry.text, entry.duration);
  }

  /**
   * Reveal text with typewriter effect
   */
  private revealText(fullText: string, autoDuration: number = 0): void {
    this.isTyping = true;
    this.continueIndicator.setVisible(false);
    this.dialogueText.setText("");

    let currentIndex = 0;

    // Clean up previous timer
    if (this.textRevealTimer) {
      this.textRevealTimer.destroy();
    }

    // Typewriter effect
    this.textRevealTimer = this.scene.time.addEvent({
      delay: this.TEXT_SPEED,
      callback: () => {
        if (currentIndex < fullText.length) {
          currentIndex++;
          this.dialogueText.setText(fullText.substring(0, currentIndex));
        } else {
          // Text fully revealed
          this.isTyping = false;
          this.onTextComplete(autoDuration);
        }
      },
      loop: true,
    });
  }

  /**
   * Called when text reveal completes
   */
  private onTextComplete(autoDuration: number): void {
    if (this.textRevealTimer) {
      this.textRevealTimer.destroy();
      this.textRevealTimer = undefined;
    }

    if (autoDuration > 0) {
      // Auto-advance after duration
      this.autoAdvanceTimer = this.scene.time.delayedCall(autoDuration, () => {
        this.nextDialogue();
      });
    } else {
      // Wait for player input
      this.continueIndicator.setVisible(true);
    }
  }

  /**
   * Handle player input (advance dialogue)
   */
  private handleInput(): void {
    if (!this.isActive) return;

    if (this.isTyping) {
      // Skip text reveal, show full text immediately
      if (this.textRevealTimer) {
        this.textRevealTimer.destroy();
        this.textRevealTimer = undefined;
      }

      const entry = this.currentSequence?.entries[this.currentIndex];
      if (entry) {
        this.dialogueText.setText(entry.text);
        this.isTyping = false;
        this.continueIndicator.setVisible(true);
      }
    } else {
      // Advance to next dialogue
      this.nextDialogue();
    }
  }

  /**
   * Advance to next dialogue entry
   */
  private nextDialogue(): void {
    if (!this.currentSequence) return;

    this.currentIndex++;

    if (this.currentIndex >= this.currentSequence.entries.length) {
      this.stopDialogue();
    } else {
      this.showDialogueEntry(this.currentIndex);
    }
  }

  /**
   * Check if dialogue is currently active
   */
  public isDialogueActive(): boolean {
    return this.isActive;
  }

  /**
   * Get current dialogue ID
   */
  public getCurrentDialogueId(): string | null {
    return this.currentSequence?.id ?? null;
  }

  /**
   * Skip to end of current dialogue (if skippable)
   */
  public skipDialogue(): void {
    if (!this.isActive || !this.currentSequence?.skippable) return;
    this.stopDialogue();
  }

  /**
   * Destroy the dialogue system
   */
  public destroy(): void {
    if (this.textRevealTimer) {
      this.textRevealTimer.destroy();
    }

    if (this.autoAdvanceTimer) {
      this.autoAdvanceTimer.destroy();
    }

    this.container.destroy();
  }
}

/**
 * Predefined dialogue sequences for Bala Kanda
 */
export const BALA_KANDA_DIALOGUES = {
  // Level 1: Valmiki's Ashram
  LEVEL_1_INTRO: {
    id: "level_1_intro",
    entries: [
      {
        character: "Narrator",
        text: "On the banks of the Tamasa River, the great sage Valmiki contemplates a question...",
        position: "center",
        duration: 3000,
      },
      {
        character: "Maharshi Valmiki",
        text: "O Narada, is there a man in this world who possesses all virtues? One who is righteous, valorous, knows dharma, and keeps his word?",
        position: "left",
      },
      {
        character: "Devarshi Narada",
        text: "There is indeed such a man, O great sage! His name is Rama, son of King Dasharatha of the Ikshvaku dynasty.",
        position: "right",
      },
      {
        character: "Devarshi Narada",
        text: "He is the embodiment of dharma, skilled in archery, protector of his people, and loved by all. His story is worthy of being told for ages to come.",
        position: "right",
      },
      {
        character: "Narrator",
        text: "And thus begins the immortal tale of Shri Rama, the Maryada Purushottam...",
        position: "center",
        duration: 3000,
      },
    ],
    skippable: true,
  } as DialogueSequence,

  // Level 3: Brothers' Training
  LEVEL_3_INTRO: {
    id: "level_3_intro",
    entries: [
      {
        character: "Guru Vashishtha",
        text: "Young princes, today you shall learn the sacred art of archery. Master this skill, for it is the duty of a Kshatriya to protect dharma.",
        position: "center",
      },
      {
        character: "Shri Rama",
        text: "We are ready to learn, Gurudev. We shall dedicate ourselves to this noble art.",
        position: "left",
      },
      {
        character: "Guru Vashishtha",
        text: "Good! First, learn to steady your aim. Then, the power of your shot. Finally, precision to strike the vital points.",
        position: "center",
      },
    ],
    skippable: false,
  } as DialogueSequence,

  // Level 5: Tataka Boss - Before Battle
  LEVEL_5_BEFORE_TATAKA: {
    id: "level_5_before_tataka",
    entries: [
      {
        character: "Vishwamitra",
        text: "Rama, this forest is terrorized by the demoness Tataka. She has brought ruin to this once-prosperous land.",
        position: "right",
      },
      {
        character: "Shri Rama",
        text: "But Gurudev, she is a woman. Is it dharmic for me to raise arms against her?",
        position: "left",
      },
      {
        character: "Vishwamitra",
        text: "Tataka has abandoned all dharma and become a threat to innocents. It is your sacred duty as a protector to stop her, regardless of her form.",
        position: "right",
      },
      {
        character: "Lakshmana",
        text: "Brother, the sage is right. Sometimes, dharma demands difficult choices. I stand with you.",
        position: "left",
      },
    ],
    skippable: false,
  } as DialogueSequence,

  // Level 5: Tataka Boss - After Victory
  LEVEL_5_AFTER_TATAKA: {
    id: "level_5_after_tataka",
    entries: [
      {
        character: "Vishwamitra",
        text: "Well done, Rama! You have freed this land from Tataka's terror. Your resolve and skill are commendable.",
        position: "right",
      },
      {
        character: "Vishwamitra",
        text: "As a reward for your valor, I shall teach you the knowledge of divine weapons - the Astras. With these, you shall protect dharma itself.",
        position: "right",
      },
      {
        character: "Narrator",
        text: "Vishwamitra teaches Rama the Agneyastra, the weapon of Agni, the fire god. Rama masters it instantly.",
        position: "center",
        duration: 3000,
      },
      {
        character: "System",
        text: "🔥 AGNEYASTRA UNLOCKED! Press '1' to use Fire Arrow. Mana Cost: 30",
        position: "center",
        duration: 4000,
      },
    ],
    skippable: true,
  } as DialogueSequence,
};
