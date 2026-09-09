import Phaser from "phaser";
import { DialogueSystem } from "../systems/DialogueSystem";
import { PauseMenu } from "../systems/PauseMenu";
import { LevelFlow } from "../utils/LevelFlow";
import { getGameSettings } from "../managers/GameSettings";

/**
 * Level 15: "Bharata's Arrival" (Ayodhya Kanda finale)
 * Mission: story — receive news of Dasharatha, debate dharma with
 * Bharata, refuse the throne, gift the Paduka. Ends Ayodhya Kanda.
 */
export class Level15_BharatasArrival extends Phaser.Scene {
  private dialogueSystem!: DialogueSystem;
  private pauseMenu!: PauseMenu;
  private dharma: number = 300;
  private finished: boolean = false;
  private overlay?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "Level15_BharatasArrival" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level15_BharatasArrival");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2e4a2e, 0x2e4a2e, 0xffd27f, 0x8b5a2b, 1);
    bg.fillRect(0, 0, width, height);
    bg.setDepth(-100);

    // Hermitage + Chitrakuta peak
    this.add.triangle(width / 2, 420, 0, 220, 640, 220, 320, -160, 0x5d6d5e).setDepth(1);
    this.add.rectangle(width / 2 - 260, height - 180, 170, 110, 0x8d6e63).setDepth(2);
    this.add.triangle(width / 2 - 260, height - 260, 0, 30, 170, 30, 85, -40, 0x5d4037).setDepth(2);
    // Rama & Bharata figures
    this.add.ellipse(width / 2 - 80, height - 150, 52, 86, 0x1565c0).setDepth(3);
    this.add.ellipse(width / 2 + 80, height - 150, 52, 86, 0xc62828).setDepth(3);
    this.add.text(width / 2, 110, "🙏 Chitrakuta — Bharata comes barefoot 🙏", {
      fontFamily: "serif", fontSize: "24px", color: "#FFD700",
      backgroundColor: "#00000088", padding: { x: 14, y: 8 },
    }).setOrigin(0.5);

    this.dialogueSystem = new DialogueSystem(this);
    LevelFlow.createObjectiveHUD(this, "Answer Bharata (keys 1 / 2 or tap)");
    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level15_BharatasArrival",
      levelName: "Level 15 — Bharata's Arrival (Finale)",
    });

    this.dialogueSystem.startDialogue({
      id: "level15_intro",
      entries: [
        { character: "Narrator", text: "Dasharatha has died of grief, crying Rama's name. Bharata — who refused the stolen throne — walks barefoot to Chitrakuta with the whole city behind him.", duration: 0 },
        { character: "Bharata", text: "Brother! The throne is yours — Ayodhya withers without you. Return, I beg you!", duration: 0 },
      ],
      skippable: true,
      onComplete: () => this.showConfrontation(),
    });
  }

  /**
   * Bharata denounces Kaikeyi (Ayodhya Kanda, sargas 72–73): the son
   * disowns his mother's deed before the whole court — dharma even
   * against one's own blood.
   */
  private showConfrontation(): void {
    this.dialogueSystem.startDialogue({
      id: "level15_confrontation",
      entries: [
        { character: "Bharata", text: "Mother! You have widowed our father and orphaned a kingdom for a crown I will NEVER touch. Your boon is my curse.", duration: 0 },
        { character: "Kaikeyi", text: "(bows her head in silence — the court holds its breath)", duration: 0 },
        { character: "Narrator", text: "Even the citizens murmur: the prince's wrath is righteous. Now all eyes turn to Rama.", duration: 0 },
      ],
      skippable: true,
      onComplete: () => this.showDharmaDebate(),
    });
  }

  private showDharmaDebate(): void {
    const { width, height } = this.cameras.main;
    this.overlay = this.add.container(0, 0);
    this.overlay.setDepth(3000);
    this.overlay.add(this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0));
    this.overlay.add(
      this.add.rectangle(width / 2, height / 2, 780, 320, 0x101b10, 0.98).setStrokeStyle(3, 0xdeb650),
    );
    this.overlay.add(
      this.add.text(width / 2, height / 2 - 115, "Bharata pleads: 'Rule Ayodhya with me!'", {
        fontFamily: "serif", fontSize: "24px", color: "#FFD700", fontStyle: "bold",
      }).setOrigin(0.5),
    );
    const opts = [
      { label: "Refuse with love — honour our father's word together", dharma: 200, reply: "Rama: Fourteen years, Bharata — then I return. Rule as my regent, not my replacement." },
      { label: "Refuse sternly — dharma admits no exception", dharma: 100, reply: "Rama: The word is given. Even gods do not unmake a father's vow." },
    ];
    const choose = (i: number) => {
      const opt = opts[i];
      if (!opt || !this.overlay) return;
      this.overlay.destroy(true);
      this.overlay = undefined;
      this.dharma += opt.dharma;
      this.dialogueSystem.startDialogue({
        id: "level15_debate",
        entries: [
          { character: "Rama", text: opt.reply, duration: 0 },
          { character: "Narrator", text: "The court weeps. Then the Brahmin Jabali steps forward with a serpent's logic...", duration: 0 },
        ],
        skippable: true,
        onComplete: () => this.showJabaliDebate(),
      });
    };
    opts.forEach((opt, i) => {
      const btn = this.add.text(width / 2, height / 2 - 20 + i * 60, `${i + 1}. ${opt.label}`, {
        fontFamily: "Arial", fontSize: "18px", color: "#FFE9A8",
        backgroundColor: "#00000088", padding: { x: 14, y: 8 }, wordWrap: { width: 700 }, align: "center",
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on("pointerover", () => btn.setColor("#FFD700"));
      btn.on("pointerout", () => btn.setColor("#FFE9A8"));
      btn.on("pointerdown", () => choose(i));
      this.overlay?.add(btn);
    });
    this.input.keyboard?.once("keydown-ONE", () => choose(0));
    this.input.keyboard?.once("keydown-TWO", () => choose(1));
    this.input.keyboard?.once("keydown-NUMPAD_ONE", () => choose(0));
    this.input.keyboard?.once("keydown-NUMPAD_TWO", () => choose(1));
  }

  /**
   * Jabali's refutation (Ayodhya Kanda, sargas 108–109): the rationalist
   * minister argues dharma is folly — Rama's famous answer follows.
   * Second dharma choice of the finale.
   */
  private showJabaliDebate(): void {
    this.dialogueSystem.startDialogue({
      id: "level15_jabali",
      entries: [
        { character: "Jabali", text: "Folly, Prince! The dead eat no offerings. Seize the visible kingdom — abandon this wasteland doctrine of dharma!", duration: 0 },
        { character: "Rama", text: "(eyes flashing) Hold, Jabali! Truth, duty and the ancestors' path are not bargaining chips. Hear my answer...", duration: 0 },
      ],
      skippable: true,
      onComplete: () => this.showJabaliChoice(),
    });
  }

  private showJabaliChoice(): void {
    const { width, height } = this.cameras.main;
    this.overlay = this.add.container(0, 0);
    this.overlay.setDepth(3000);
    this.overlay.add(this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0));
    this.overlay.add(
      this.add.rectangle(width / 2, height / 2, 780, 320, 0x101b10, 0.98).setStrokeStyle(3, 0xdeb650),
    );
    this.overlay.add(
      this.add.text(width / 2, height / 2 - 115, "Answer Jabali before the court:", {
        fontFamily: "serif", fontSize: "24px", color: "#FFD700", fontStyle: "bold",
      }).setOrigin(0.5),
    );
    const opts = [
      { label: "Uphold satya & Ikshvaku vow — dharma above expedience", dharma: 200, reply: "Rama: Untruth would rot the Ikshvaku line. My father's word stands — I stand with it, come fourteen years or fourteen ages." },
      { label: "Answer gently — dharma needs no anger to defend it", dharma: 100, reply: "Rama: Dear Jabali, your love speaks, not wisdom. I forgive the counsel — and decline it." },
    ];
    const choose = (i: number) => {
      const opt = opts[i];
      if (!opt || !this.overlay) return;
      this.overlay.destroy(true);
      this.overlay = undefined;
      this.dharma += opt.dharma;
      this.dialogueSystem.startDialogue({
        id: "level15_jabali_answer",
        entries: [
          { character: "Rama", text: opt.reply, duration: 0 },
          { character: "Narrator", text: "Jabali bows, silenced — his heresy was but a goad to draw out Rama's glory. Bharata steps forward, eyes shining...", duration: 0 },
        ],
        skippable: true,
        onComplete: () => this.showPadukaCeremony(),
      });
    };
    opts.forEach((opt, i) => {
      const btn = this.add.text(width / 2, height / 2 - 20 + i * 60, `${i + 1}. ${opt.label}`, {
        fontFamily: "Arial", fontSize: "18px", color: "#FFE9A8",
        backgroundColor: "#00000088", padding: { x: 14, y: 8 }, wordWrap: { width: 700 }, align: "center",
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on("pointerover", () => btn.setColor("#FFD700"));
      btn.on("pointerout", () => btn.setColor("#FFE9A8"));
      btn.on("pointerdown", () => choose(i));
      this.overlay?.add(btn);
    });
    this.input.keyboard?.once("keydown-ONE", () => choose(0));
    this.input.keyboard?.once("keydown-TWO", () => choose(1));
    this.input.keyboard?.once("keydown-NUMPAD_ONE", () => choose(0));
    this.input.keyboard?.once("keydown-NUMPAD_TWO", () => choose(1));
  }

  /**
   * Paduka Pattabhisheka: Bharata bears the sandals on his head and
   * vows to rule from Nandigrama as regent.
   */
  private showPadukaCeremony(): void {
    const { width, height } = this.cameras.main;
    // Golden sandals appear between the brothers.
    const sandalL = this.add.ellipse(width / 2 - 24, height - 120, 26, 52, 0xffd700).setDepth(4);
    const sandalR = this.add.ellipse(width / 2 + 24, height - 120, 26, 52, 0xffd700).setDepth(4);
    sandalL.setStrokeStyle(2, 0x8b5a00);
    sandalR.setStrokeStyle(2, 0x8b5a00);
    this.tweens.add({ targets: [sandalL, sandalR], y: "-=10", duration: 900, yoyo: true, repeat: -1 });
    this.cameras.main.flash(200, 255, 215, 150);

    this.dialogueSystem.startDialogue({
      id: "level15_paduka",
      entries: [
        { character: "Bharata", text: "Then give me your sandals! They shall sit upon the throne while I, in bark garments, serve as your shadow at Nandigrama.", duration: 0 },
        { character: "Rama", text: "(places the Paduka in Bharata's hands) Rule with dharma, brother. If I return one day late, I shall enter fire — come, embrace me.", duration: 0 },
        { character: "Bharata", text: "(lifts the sandals to his head) Nandigrama shall be Ayodhya till you return. Fourteen years — counted in heartbeats!", duration: 0 },
      ],
      skippable: true,
      onComplete: () => this.finishLevel(),
    });
  }

  private finishLevel(): void {
    if (this.finished) return;
    this.finished = true;
    this.dialogueSystem.startDialogue({
      id: "level15_complete",
      entries: [
        { character: "Narrator", text: "Bharata bears the Paduka on his head to Nandigrama. The sandals ascend the throne; the prince takes a straw mat at its foot.", duration: 0 },
        { character: "Narrator", text: "Fourteen years of regency begin — Rama folds his hands toward the forest. Exile continues; dharma triumphs.", duration: 0 },
        { character: "Narrator", text: "Thus ends the AYODHYA KANDA. Aranya — and destiny — await beyond...", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        LevelFlow.completeLevel(this, "Level15_BharatasArrival", 800 + this.dharma, {
          title: "AYODHYA KANDA COMPLETE!",
          subtitle: "Two Kandas finished — Aranya awaits",
          endToMenu: true,
        });
      },
    });
  }

  update(): void {
    if (this.pauseMenu.isPausedState()) return;
  }
}
