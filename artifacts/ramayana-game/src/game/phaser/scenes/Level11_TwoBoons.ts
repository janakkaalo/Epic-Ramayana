import Phaser from "phaser";
import { DialogueSystem } from "../systems/DialogueSystem";
import { PauseMenu } from "../systems/PauseMenu";
import { LevelFlow } from "../utils/LevelFlow";
import { getGameSettings } from "../managers/GameSettings";

/**
 * Level 11: "The Two Boons" (Ayodhya Kanda)
 * Mission: story with 3 dharma choices. Rama accepts exile with grace.
 * Choices affect dharma score but the epic outcome holds (Pitru Dharma).
 */
export class Level11_TwoBoons extends Phaser.Scene {
  private dialogueSystem!: DialogueSystem;
  private pauseMenu!: PauseMenu;
  private dharma: number = 200;
  private finished: boolean = false;
  private choiceIndex: number = 0;
  private overlay?: Phaser.GameObjects.Container;

  private readonly choices: Array<{
    speaker: string;
    prompt: string;
    options: Array<{ label: string; dharma: number; reply: string }>;
  }> = [
    {
      speaker: "Dasharatha",
      prompt: "Rama... Kaikeyi demands your exile. What will you do, my son?",
      options: [
        { label: "Accept exile gladly — a father's word is sacred", dharma: 150, reply: "Rama: I go with joy, father. Your honour is my crown." },
        { label: "Accept, but with sorrow in your heart", dharma: 60, reply: "Rama: It grieves me — yet I shall obey." },
      ],
    },
    {
      speaker: "Kausalya",
      prompt: "Stay, my child! Let me stop this madness!",
      options: [
        { label: "Console her — dharma needs no permission", dharma: 150, reply: "Rama: Bless me instead, mother. Your tears are my strength." },
        { label: "Remain silent and bow", dharma: 60, reply: "Rama bows low, saying nothing — his silence itself a vow." },
      ],
    },
    {
      speaker: "Lakshmana",
      prompt: "Brother! I will burn this injustice down! Let me fight!",
      options: [
        { label: "Calm him — anger is adharma now", dharma: 150, reply: "Rama: Sheathe your rage, Lakshmana. Our war is against adharma, not family." },
        { label: "Let him rage while you walk on", dharma: 60, reply: "Rama walks on, leaving Lakshmana's fury echoing in the hall." },
      ],
    },
  ];

  constructor() {
    super({ key: "Level11_TwoBoons" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level11_TwoBoons");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0a2e, 0x1a0a2e, 0x4a1a1a, 0x2d1b0f, 1);
    bg.fillRect(0, 0, width, height);
    bg.setDepth(-100);

    // Throne room silhouettes
    this.add.rectangle(width / 2, height - 160, 500, 200, 0x6b4a2a).setDepth(1);
    this.add.rectangle(width / 2, height - 300, 200, 120, 0xd4a017).setDepth(1);
    this.add.text(width / 2, 120, "👑 The Throne Room — Kopa Bhavan's shadow falls 👑", {
      fontFamily: "serif", fontSize: "22px", color: "#FFD700",
      backgroundColor: "#00000088", padding: { x: 14, y: 8 },
    }).setOrigin(0.5);

    this.dialogueSystem = new DialogueSystem(this);
    LevelFlow.createObjectiveHUD(this, "Answer with dharma (keys 1 / 2 or tap)");
    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level11_TwoBoons",
      levelName: "Level 11 — The Two Boons",
    });

    this.dialogueSystem.startDialogue({
      id: "level11_intro",
      entries: [
        { character: "Narrator", text: "Kaikeyi, in mourner's garb, demands her two boons: Bharata's crown, Rama's fourteen-year exile.", duration: 0 },
        { character: "Dasharatha", text: "My heart breaks... yet a king's word, once given, cannot be taken back.", duration: 0 },
      ],
      skippable: true,
      onComplete: () => this.showChoice(),
    });
  }

  private showChoice(): void {
    if (this.choiceIndex >= this.choices.length) {
      this.finishLevel();
      return;
    }
    const choice = this.choices[this.choiceIndex];
    const { width, height } = this.cameras.main;

    this.overlay = this.add.container(0, 0);
    this.overlay.setDepth(3000);
    const dim = this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);
    this.overlay.add(dim);
    const box = this.add.rectangle(width / 2, height / 2, 760, 300, 0x101b10, 0.98).setStrokeStyle(3, 0xdeb650);
    this.overlay.add(box);
    const speaker = this.add.text(width / 2, height / 2 - 110, `${choice.speaker}`, {
      fontFamily: "serif", fontSize: "26px", color: "#FFD700", fontStyle: "bold",
    }).setOrigin(0.5);
    const prompt = this.add.text(width / 2, height / 2 - 60, choice.prompt, {
      fontFamily: "Arial", fontSize: "19px", color: "#FFFFFF", align: "center", wordWrap: { width: 680 },
    }).setOrigin(0.5);
    this.overlay.add([speaker, prompt]);

    choice.options.forEach((opt, i) => {
      const btn = this.add.text(width / 2, height / 2 + 20 + i * 56, `${i + 1}. ${opt.label}`, {
        fontFamily: "Arial", fontSize: "18px", color: "#FFE9A8",
        backgroundColor: "#00000088", padding: { x: 14, y: 8 }, wordWrap: { width: 680 }, align: "center",
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on("pointerover", () => btn.setColor("#FFD700"));
      btn.on("pointerout", () => btn.setColor("#FFE9A8"));
      btn.on("pointerdown", () => this.pickOption(i));
      this.overlay?.add(btn);
    });

    this.input.keyboard?.once("keydown-ONE", () => this.pickOption(0));
    this.input.keyboard?.once("keydown-TWO", () => this.pickOption(1));
    this.input.keyboard?.once("keydown-NUMPAD_ONE", () => this.pickOption(0));
    this.input.keyboard?.once("keydown-NUMPAD_TWO", () => this.pickOption(1));
  }

  private pickOption(i: number): void {
    const choice = this.choices[this.choiceIndex];
    const opt = choice.options[i];
    if (!opt) return;
    this.overlay?.destroy(true);
    this.overlay = undefined;
    this.dharma += opt.dharma;
    this.choiceIndex++;
    this.dialogueSystem.startDialogue({
      id: `level11_choice_${this.choiceIndex}`,
      entries: [{ character: "Rama", text: opt.reply, duration: 0 }],
      skippable: true,
      onComplete: () => this.showChoice(),
    });
  }

  private finishLevel(): void {
    if (this.finished) return;
    this.finished = true;
    this.dialogueSystem.startDialogue({
      id: "level11_complete",
      entries: [
        { character: "Narrator", text: "Rama accepts fourteen years of exile as calmly as a crown. Sita and Lakshmana vow to follow.", duration: 0 },
        { character: "Rama", text: "Pitru-vakya-paripalana — a father's word shall not falter while I live.", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        LevelFlow.completeLevel(this, "Level11_TwoBoons", 500 + this.dharma, {
          title: "EXILE ACCEPTED",
          subtitle: "Pitru Dharma upheld",
          nextScene: "Level12_FarewellToAyodhya",
        });
      },
    });
  }

  update(): void {
    if (this.pauseMenu.isPausedState()) return;
  }
}
