import Phaser from "phaser";
import { Player } from "../entities/Player";
import { DialogueSystem } from "../systems/DialogueSystem";
import { PauseMenu } from "../systems/PauseMenu";
import { TouchControls } from "../systems/TouchControls";
import { LevelFlow } from "../utils/LevelFlow";
import { LevelBuilder } from "../utils/LevelBuilder";
import { getGameSettings } from "../managers/GameSettings";

/**
 * Level 14: "Crossing to Chitrakuta" (Ayodhya Kanda)
 * Mission: cross the Ganga, gather 3 materials (timber, rope, food),
 * then build the hermitage at the marked site.
 */
export class Level14_CrossingToChitrakuta extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private dialogueSystem!: DialogueSystem;
  private pauseMenu!: PauseMenu;

  private started: boolean = false;
  private finished: boolean = false;
  private dharma: number = 100;
  private collected: Set<string> = new Set();
  private materials: Array<{ id: string; label: string; x: number; icon: string }> = [];
  private buildX: number = 0;
  private promptText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "Level14_CrossingToChitrakuta" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level14_CrossingToChitrakuta");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;
    const builder = new LevelBuilder(this);
    builder.createSky(0x4fc3f7, 0xe1f5fe);
    builder.createMountainLayers(3, 440, [0x78909c, 0x90a4ae, 0xa7b8c0]);

    const worldW = width * 2;
    this.platforms = this.physics.add.staticGroup();
    for (let x = 0; x < worldW; x += 100) {
      const inGanga = x > width * 0.55 && x < width * 1.05;
      if (!inGanga) {
        this.platforms.add(this.add.rectangle(x, height - 40, 100, 80, 0x6d8f5e).setOrigin(0));
      }
    }
    const ganga = this.add.rectangle(width * 0.55, height - 60, width * 0.5, 60, 0x0288d1, 0.9).setOrigin(0, 0).setDepth(1);
    void ganga;
    for (const f of [0.6, 0.72, 0.84, 0.96]) {
      this.platforms.add(this.add.rectangle(width * f, height - 140, 120, 22, 0x8d6e63).setOrigin(0));
    }
    this.platforms.add(this.add.rectangle(width * 1.3, 500, 240, 20, 0x6b4a2a).setOrigin(0));
    this.platforms.refresh();
    this.physics.world.setBounds(0, 0, worldW, height);
    this.cameras.main.setBounds(0, 0, worldW, height);

    // Materials beyond the river
    this.materials = [
      { id: "timber", label: "Timber", x: width * 1.25, icon: "🪵" },
      { id: "rope", label: "Rope", x: width * 1.5, icon: "🪢" },
      { id: "food", label: "Forest Food", x: width * 1.7, icon: "🍎" },
    ];
    for (const m of this.materials) {
      this.add.circle(m.x, height - 120, 26, 0x33691e).setDepth(2);
      this.add.text(m.x, height - 120, m.icon, { fontSize: "26px" }).setOrigin(0.5).setDepth(3);
      this.add.text(m.x, height - 175, m.label, {
        fontFamily: "Arial", fontSize: "15px", color: "#FFFFFF",
        backgroundColor: "#000000aa", padding: { x: 8, y: 4 },
      }).setOrigin(0.5).setDepth(3);
    }

    // Build site at the end
    this.buildX = worldW - 260;
    this.add.rectangle(this.buildX, height - 130, 200, 26, 0xa1887f).setOrigin(0.5).setDepth(2);
    this.add.text(this.buildX, height - 220, "🛖 Hermitage Site", {
      fontFamily: "Arial", fontSize: "17px", color: "#FFD700",
      backgroundColor: "#000000aa", padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(3);

    this.player = new Player(this, 120, 440);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.dialogueSystem = new DialogueSystem(this);
    this.physics.add.collider(this.player, this.platforms);

    this.progressText = this.add.text(16, 76, "Materials: 0/3", {
      fontFamily: "Arial", fontSize: "18px", color: "#FFD700",
      backgroundColor: "#000000aa", padding: { x: 10, y: 6 },
    }).setScrollFactor(0).setDepth(500);
    this.promptText = this.add.text(width / 2, height - 80, "", {
      fontFamily: "Arial", fontSize: "18px", color: "#FFD700",
      backgroundColor: "#000000aa", padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(600);

    LevelFlow.createObjectiveHUD(this, "Cross the Ganga, gather 3 materials, build the ashram");
    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level14_CrossingToChitrakuta",
      levelName: "Level 14 — Crossing to Chitrakuta",
    });
    // On-screen gamepad for touch devices (hidden unless enabled in Settings).
    new TouchControls(this, this.player);

    this.input.keyboard?.on("keydown-SPACE", () => this.tryInteract());
    this.input.keyboard?.on("keydown-E", () => this.tryInteract());

    this.dialogueSystem.startDialogue({
      id: "level14_intro",
      entries: [
        { character: "Bharadvaja", text: "Cross the Ganga, dear Rama. Gather timber, rope and food — then raise your hermitage beneath Chitrakuta's peaks.", duration: 0 },
        { character: "Rama", text: "A home of grass and love shall outshine any palace. Come, Sita, Lakshmana.", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        this.started = true;
      },
    });
  }

  private tryInteract(): void {
    if (!this.started || this.finished || this.dialogueSystem.isDialogueActive()) return;
    for (const m of this.materials) {
      if (!this.collected.has(m.id) && Math.abs(this.player.x - m.x) < 90) {
        this.collected.add(m.id);
        this.dharma += 100;
        this.progressText.setText(`Materials: ${this.collected.size}/3`);
        this.cameras.main.flash(120, 255, 215, 0);
        if (this.collected.size >= 3) {
          this.dialogueSystem.startDialogue({
            id: "level14_all",
            entries: [{ character: "Lakshmana", text: "All gathered, brother! To the hermitage site — let us build.", duration: 0 }],
            skippable: true,
          });
        }
        return;
      }
    }
    if (this.collected.size >= 3 && Math.abs(this.player.x - this.buildX) < 130) {
      this.buildAshram();
    }
  }

  private buildAshram(): void {
    if (this.finished) return;
    this.finished = true;
    if (this.player.body) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    const { height } = this.cameras.main;
    this.add.rectangle(this.buildX, height - 220, 170, 130, 0x8d6e63).setDepth(3);
    this.add.triangle(this.buildX, height - 340, 0, 40, 170, 40, 85, -40, 0x5d4037).setDepth(3);
    this.dialogueSystem.startDialogue({
      id: "level14_complete",
      entries: [
        { character: "Narrator", text: "Bamboo, grass and love — the Chitrakuta hermitage rises. Peace settles like morning mist.", duration: 0 },
        { character: "Sita", text: "Listen... the river sings. I have never been happier than in this cottage of leaves.", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        LevelFlow.completeLevel(this, "Level14_CrossingToChitrakuta", 500 + this.dharma, {
          title: "HERMITAGE BUILT!",
          subtitle: "Peace at Chitrakuta",
          nextScene: "Level15_BharatasArrival",
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
    const { height } = this.cameras.main;
    if (this.player.y > height - 10) {
      // Fell in Ganga -> back to near bank
      this.player.x = this.cameras.main.width * 0.4;
      this.player.y = 380;
      if (this.player.body) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      return;
    }
    let hint = "";
    for (const m of this.materials) {
      if (!this.collected.has(m.id) && Math.abs(this.player.x - m.x) < 90) {
        hint = `Press SPACE / E to gather ${m.label}`;
        break;
      }
    }
    if (!hint && this.collected.size < 3) hint = "Cross the Ganga → gather glowing materials";
    if (!hint && this.collected.size >= 3) {
      hint = Math.abs(this.player.x - this.buildX) < 130
        ? "Press SPACE / E to build the hermitage"
        : "Carry everything to the Hermitage Site →";
    }
    this.promptText.setText(hint);
  }
}
