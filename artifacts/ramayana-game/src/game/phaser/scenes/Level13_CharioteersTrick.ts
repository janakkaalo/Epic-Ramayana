import Phaser from "phaser";
import { Player } from "../entities/Player";
import { DialogueSystem } from "../systems/DialogueSystem";
import { PauseMenu } from "../systems/PauseMenu";
import { TouchControls } from "../systems/TouchControls";
import { LevelFlow } from "../utils/LevelFlow";
import { LevelBuilder } from "../utils/LevelBuilder";
import { getGameSettings } from "../managers/GameSettings";

/**
 * Level 13: "The Charioteer's Trick" (Ayodhya Kanda)
 * Mission: reach Shringaverapura, meet Guha the Nishada king,
 * accept his hospitality, and bid farewell to Sumantra.
 */
export class Level13_CharioteersTrick extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private dialogueSystem!: DialogueSystem;
  private pauseMenu!: PauseMenu;

  private started: boolean = false;
  private finished: boolean = false;
  private metGuha: boolean = false;
  private farewellDone: boolean = false;
  private dharma: number = 150;
  private guhaX: number = 0;
  private chariotX: number = 0;
  private promptText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "Level13_CharioteersTrick" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level13_CharioteersTrick");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;
    const builder = new LevelBuilder(this);
    builder.createSky(0x66bb6a, 0xfff9c4);
    builder.createMountainLayers(3, 480, [0x558b5e, 0x6a9a6b, 0x7fae7d]);
    for (let i = 0; i < 8; i++) {
      builder.createTree(200 + i * 320, height - 60, 80, 150, false);
    }

    const worldW = width * 2;
    this.platforms = this.physics.add.staticGroup();
    for (let x = 0; x < worldW; x += 100) {
      this.platforms.add(this.add.rectangle(x, height - 40, 100, 80, 0x4a7c3a).setOrigin(0));
    }
    this.platforms.add(this.add.rectangle(800, 500, 240, 20, 0x6b4a2a).setOrigin(0));
    this.platforms.add(this.add.rectangle(1600, 470, 240, 20, 0x6b4a2a).setOrigin(0));
    this.platforms.refresh();
    this.physics.world.setBounds(0, 0, worldW, height);
    this.cameras.main.setBounds(0, 0, worldW, height);

    // Guha mid-world
    this.guhaX = width;
    this.add.ellipse(this.guhaX, height - 130, 60, 95, 0x6d4c41).setDepth(3);
    this.add.circle(this.guhaX, height - 205, 20, 0xc98d5e).setDepth(3);
    this.add.text(this.guhaX, height - 265, "Guha, Nishada King", {
      fontFamily: "Arial", fontSize: "16px", color: "#FFD700",
      backgroundColor: "#000000aa", padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(3);

    // Sumantra + chariot at the end
    this.chariotX = worldW - 300;
    this.add.rectangle(this.chariotX, height - 120, 170, 70, 0x8d6e63).setDepth(2);
    this.add.circle(this.chariotX - 55, height - 80, 26, 0x4e342e).setDepth(3);
    this.add.circle(this.chariotX + 55, height - 80, 26, 0x4e342e).setDepth(3);
    this.add.ellipse(this.chariotX + 150, height - 140, 50, 80, 0x3f51b5).setDepth(3);
    this.add.text(this.chariotX + 60, height - 250, "Sumantra & Chariot", {
      fontFamily: "Arial", fontSize: "16px", color: "#FFFFFF",
      backgroundColor: "#000000aa", padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(3);

    this.player = new Player(this, 120, 440);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.dialogueSystem = new DialogueSystem(this);
    this.physics.add.collider(this.player, this.platforms);

    this.promptText = this.add.text(width / 2, height - 80, "", {
      fontFamily: "Arial", fontSize: "18px", color: "#FFD700",
      backgroundColor: "#000000aa", padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(600);

    LevelFlow.createObjectiveHUD(this, "Meet Guha, then farewell Sumantra (SPACE/E near them)");
    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level13_CharioteersTrick",
      levelName: "Level 13 — The Charioteer's Trick",
    });
    // On-screen gamepad for touch devices (hidden unless enabled in Settings).
    new TouchControls(this, this.player);

    this.input.keyboard?.on("keydown-SPACE", () => this.tryInteract());
    this.input.keyboard?.on("keydown-E", () => this.tryInteract());

    this.dialogueSystem.startDialogue({
      id: "level13_intro",
      entries: [
        { character: "Narrator", text: "Beyond the Tamasa lies Shringaverapura, land of Guha — hunter-king and Rama's beloved friend.", duration: 0 },
        { character: "Sumantra", text: "The horses grow restless, Prince. But while I drive, Ayodhya drives with you.", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        this.started = true;
      },
    });
  }

  private tryInteract(): void {
    if (!this.started || this.finished || this.dialogueSystem.isDialogueActive()) return;
    if (!this.metGuha && Math.abs(this.player.x - this.guhaX) < 130) {
      this.metGuha = true;
      this.dharma += 150;
      this.dialogueSystem.startDialogue({
        id: "level13_guha",
        entries: [
          { character: "Guha", text: "Rama! My brother! My kingdom, my boats, my life — all are yours.", duration: 0 },
          { character: "Rama", text: "Your love ferries us better than any boat, Guha. We rest one night under your stars.", duration: 0 },
        ],
        skippable: true,
      });
      return;
    }
    if (this.metGuha && !this.farewellDone && Math.abs(this.player.x - this.chariotX) < 150) {
      this.farewellDone = true;
      this.dharma += 150;
      this.dialogueSystem.startDialogue({
        id: "level13_farewell",
        entries: [
          { character: "Rama", text: "Sumantra, turn the chariot. Tell my father I am at peace — and tell Ayodhya I carry them with me.", duration: 0 },
          { character: "Sumantra", text: "The reins feel heavier than mountains... Farewell, my prince. (He drives the chariot in circles to hide your trail.)", duration: 0 },
        ],
        skippable: true,
        onComplete: () => this.finishLevel(),
      });
    }
  }

  private finishLevel(): void {
    if (this.finished) return;
    this.finished = true;
    if (this.player.body) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    LevelFlow.completeLevel(this, "Level13_CharioteersTrick", 450 + this.dharma, {
      title: "FAREWELL GIVEN",
      subtitle: "The trail is hidden — onward to the Ganga",
      nextScene: "Level14_CrossingToChitrakuta",
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
    if (!this.metGuha) {
      this.promptText.setText(
        Math.abs(this.player.x - this.guhaX) < 130
          ? "Press SPACE / E to greet Guha"
          : "Journey to Shringaverapura →",
      );
    } else if (!this.farewellDone) {
      this.promptText.setText(
        Math.abs(this.player.x - this.chariotX) < 150
          ? "Press SPACE / E to farewell Sumantra"
          : "Go to the chariot →",
      );
    } else {
      this.promptText.setText("");
    }
  }
}
