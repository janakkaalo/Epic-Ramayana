import Phaser from "phaser";
import { Player } from "../entities/Player";
import { DialogueSystem } from "../systems/DialogueSystem";
import { PauseMenu } from "../systems/PauseMenu";
import { TouchControls } from "../systems/TouchControls";
import { LevelFlow } from "../utils/LevelFlow";
import { LevelBuilder } from "../utils/LevelBuilder";
import { getGameSettings } from "../managers/GameSettings";

/**
 * Level 09: "Rama Rajyabhisheka Preparation" (Ayodhya Kanda)
 * Mission: explore celebrating Ayodhya, speak with 4 family members
 * (Kausalya, Dasharatha, Lakshmana, Sita) and receive blessings.
 */
export class Level09_RamaRajyabhisheka extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private dialogueSystem!: DialogueSystem;
  private pauseMenu!: PauseMenu;

  private started: boolean = false;
  private finished: boolean = false;
  private dharma: number = 0;
  private blessed: Set<string> = new Set();
  private npcs: Array<{ id: string; name: string; x: number; color: number; blessing: string[] }> = [];
  private promptText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "Level09_RamaRajyabhisheka" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level09_RamaRajyabhisheka");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;
    const builder = new LevelBuilder(this);
    builder.createSky(0xffb74d, 0xffe0b2);
    builder.createCelestialBody(1050, 110, 55, 0xffd700);

    const worldW = width * 2;
    this.platforms = this.physics.add.staticGroup();
    for (let x = 0; x < worldW; x += 100) {
      this.platforms.add(this.add.rectangle(x, height - 40, 100, 80, 0xc9a06a).setOrigin(0));
    }
    this.platforms.add(this.add.rectangle(500, 500, 240, 20, 0x8b5a2b).setOrigin(0));
    this.platforms.add(this.add.rectangle(1300, 470, 240, 20, 0x8b5a2b).setOrigin(0));
    this.platforms.refresh();
    this.physics.world.setBounds(0, 0, worldW, height);
    this.cameras.main.setBounds(0, 0, worldW, height);

    // Festive banners
    for (let x = 60; x < worldW; x += 160) {
      this.add.triangle(x, 120, 0, 0, 44, 0, 22, 34, 0xd32f2f).setDepth(1);
    }
    this.add.text(worldW / 2, 80, "🌸 AYODHYA CELEBRATES — Rama's coronation tomorrow! 🌸", {
      fontFamily: "serif", fontSize: "22px", color: "#7b1fa2",
      backgroundColor: "#ffffffcc", padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(3);

    this.npcs = [
      { id: "kausalya", name: "Kausalya", x: 420, color: 0xe91e63, blessing: ["Kausalya", "My Rama! Tomorrow the crown... my heart overflows. Rule with compassion, my son."] },
      { id: "dasharatha", name: "Dasharatha", x: 1050, color: 0x3f51b5, blessing: ["Dasharatha", "Rama, my pride! Ayodhya shall prosper under your dharma. Your old father can rest at last."] },
      { id: "lakshmana", name: "Lakshmana", x: 1650, color: 0x009688, blessing: ["Lakshmana", "Brother! I will stand at your side forever — in palace or forest, wherever you go."] },
      { id: "sita", name: "Sita", x: 2200, color: 0xff9800, blessing: ["Sita", "My lord, Mithila rejoices with Ayodhya. Whatever fate brings, I walk beside you."] },
    ];
    for (const npc of this.npcs) {
      this.add.ellipse(npc.x, height - 130, 56, 90, npc.color).setDepth(3);
      this.add.circle(npc.x, height - 200, 20, 0xffcc99).setDepth(3);
      this.add.text(npc.x, height - 260, npc.name, {
        fontFamily: "Arial", fontSize: "16px", color: "#FFFFFF",
        backgroundColor: "#000000aa", padding: { x: 8, y: 4 },
      }).setOrigin(0.5).setDepth(3);
    }

    this.player = new Player(this, 120, 440);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.dialogueSystem = new DialogueSystem(this);
    this.physics.add.collider(this.player, this.platforms);

    const { width: w, height: h } = this.cameras.main;
    this.progressText = this.add.text(16, 76, "Blessings: 0/4", {
      fontFamily: "Arial", fontSize: "18px", color: "#FFD700",
      backgroundColor: "#000000aa", padding: { x: 10, y: 6 },
    }).setScrollFactor(0).setDepth(500);
    this.promptText = this.add.text(w / 2, h - 80, "", {
      fontFamily: "Arial", fontSize: "18px", color: "#FFD700",
      backgroundColor: "#000000aa", padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(600);

    LevelFlow.createObjectiveHUD(this, "Receive blessings from all 4 family members");
    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level09_RamaRajyabhisheka",
      levelName: "Level 09 — Rama Rajyabhisheka Preparation",
    });
    // On-screen gamepad for touch devices (hidden unless enabled in Settings).
    new TouchControls(this, this.player);

    this.input.keyboard?.on("keydown-SPACE", () => this.tryTalk());
    this.input.keyboard?.on("keydown-E", () => this.tryTalk());

    this.dialogueSystem.startDialogue({
      id: "level9_intro",
      entries: [
        { character: "Narrator", text: "Ayodhya glows with lamps. Tomorrow, Prince Rama will be crowned Yuvaraja.", duration: 0 },
        { character: "Narrator", text: "Walk the festive streets. Speak with your family — press SPACE near them.", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        this.started = true;
      },
    });
  }

  private nearestNPC(): { id: string; name: string; x: number; blessing: string[] } | null {
    let best: { id: string; name: string; x: number; blessing: string[] } | null = null;
    let bestDist = 120;
    for (const npc of this.npcs) {
      const d = Math.abs(this.player.x - npc.x);
      if (d < bestDist) {
        bestDist = d;
        best = npc;
      }
    }
    return best;
  }

  private tryTalk(): void {
    if (!this.started || this.finished || this.dialogueSystem.isDialogueActive()) return;
    const npc = this.nearestNPC();
    if (!npc) return;
    if (this.blessed.has(npc.id)) {
      this.dialogueSystem.startDialogue({
        id: `level9_${npc.id}_again`,
        entries: [{ character: npc.blessing[0], text: "Go with joy, Rama. The city already sings your name.", duration: 0 }],
        skippable: true,
      });
      return;
    }
    this.blessed.add(npc.id);
    this.dharma += 100;
    this.progressText.setText(`Blessings: ${this.blessed.size}/4`);
    this.dialogueSystem.startDialogue({
      id: `level9_${npc.id}`,
      entries: [{ character: npc.blessing[0], text: npc.blessing[1], duration: 0 }],
      skippable: true,
      onComplete: () => {
        if (this.blessed.size >= 4) this.finishLevel();
      },
    });
  }

  private finishLevel(): void {
    if (this.finished) return;
    this.finished = true;
    if (this.player.body) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.dialogueSystem.startDialogue({
      id: "level9_complete",
      entries: [
        { character: "Narrator", text: "Lamps lit, drums ready. Yet in a shadowed chamber, old Manthara watches — and smiles coldly...", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        LevelFlow.completeLevel(this, "Level09_RamaRajyabhisheka", 400 + this.dharma, {
          title: "AYODHYA REJOICES!",
          subtitle: "4 blessings received",
          nextScene: "Level10_PoisonedMind",
        });
      },
    });
  }

  update(time: number, delta: number): void {
    if (this.pauseMenu.isPausedState()) return;
    if (this.dialogueSystem.isDialogueActive()) {
      this.player.setVelocityX(0);
      return;
    }
    this.player.update(time, delta);
    if (!this.started || this.finished) return;
    const npc = this.nearestNPC();
    if (npc && !this.blessed.has(npc.id)) {
      this.promptText.setText(`Press SPACE / E to speak with ${npc.name}`);
    } else if (npc && this.blessed.has(npc.id)) {
      this.promptText.setText("");
    } else {
      this.promptText.setText(this.blessed.size >= 4 ? "" : "Find your family along the street →");
    }
  }
}
