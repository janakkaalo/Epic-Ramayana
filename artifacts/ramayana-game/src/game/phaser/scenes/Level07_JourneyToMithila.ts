import Phaser from "phaser";
import { Player } from "../entities/Player";
import { DialogueSystem } from "../systems/DialogueSystem";
import { PauseMenu } from "../systems/PauseMenu";
import { LevelFlow } from "../utils/LevelFlow";
import { LevelBuilder } from "../utils/LevelBuilder";
import { getGameSettings } from "../managers/GameSettings";

/**
 * Level 07: "Journey to Mithila" (Bala Kanda)
 * Mission: travel the forest path, free Ahalya from her stone curse,
 * then reach Mithila's gates.
 */
export class Level07_JourneyToMithila extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private dialogueSystem!: DialogueSystem;
  private pauseMenu!: PauseMenu;

  private ahalyaFreed: boolean = false;
  private finished: boolean = false;
  private started: boolean = false;
  private dharma: number = 0;
  private promptText!: Phaser.GameObjects.Text;
  private goalX: number = 0;
  private stoneX: number = 0;

  constructor() {
    super({ key: "Level07_JourneyToMithila" });
  }

  create(): void {
    LevelFlow.markLevelStarted("Level07_JourneyToMithila");
    getGameSettings().applyBrightnessOverlay(this);
    const { width, height } = this.cameras.main;
    const builder = new LevelBuilder(this);
    builder.createSky(0x7fb069, 0xf4e285);
    builder.createMountainLayers(3, 470, [0x6a8f5e, 0x7fa36b, 0x93b779]);
    builder.createClouds(4);

    const worldW = width * 3;
    this.platforms = this.physics.add.staticGroup();
    for (let x = 0; x < worldW; x += 100) {
      this.platforms.add(this.add.rectangle(x, height - 40, 100, 80, 0x4a7c3a).setOrigin(0));
    }
    this.addStep(500, 500, 200, 20);
    this.addStep(950, 440, 200, 20);
    this.addStep(1400, 480, 220, 20);
    this.addStep(2000, 430, 220, 20);
    this.addStep(2600, 480, 220, 20);
    this.platforms.refresh();

    this.physics.world.setBounds(0, 0, worldW, height);
    this.cameras.main.setBounds(0, 0, worldW, height);

    // Gautama's ashram + Ahalya stone mid-way
    this.stoneX = width * 1.5;
    this.add.rectangle(this.stoneX - 160, height - 160, 200, 120, 0x8b7355).setDepth(2);
    this.add.text(this.stoneX - 160, height - 230, "Gautama Ashram", {
      fontFamily: "serif", fontSize: "18px", color: "#FFD700",
    }).setOrigin(0.5).setDepth(3);
    const stone = this.add.ellipse(this.stoneX, height - 110, 70, 110, 0x9e9e9e).setDepth(3);
    stone.setStrokeStyle(3, 0x616161);
    this.tweens.add({ targets: stone, alpha: { from: 0.85, to: 1 }, duration: 1200, yoyo: true, repeat: -1 });

    // Mithila gates at the end
    this.goalX = worldW - 260;
    this.add.rectangle(this.goalX, height - 190, 26, 260, 0xd4a017).setDepth(2);
    this.add.rectangle(this.goalX + 110, height - 190, 26, 260, 0xd4a017).setDepth(2);
    this.add.rectangle(this.goalX + 55, height - 300, 250, 40, 0x8b0000).setDepth(2);
    this.add.text(this.goalX + 55, height - 300, "MITHILA", {
      fontFamily: "serif", fontSize: "24px", color: "#FFD700", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(3);

    this.player = new Player(this, 120, 420);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.dialogueSystem = new DialogueSystem(this);
    this.physics.add.collider(this.player, this.platforms);

    this.promptText = this.add
      .text(width / 2, height - 90, "", {
        fontFamily: "Arial", fontSize: "18px", color: "#FFD700",
        backgroundColor: "#000000aa", padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5).setScrollFactor(0).setDepth(600);

    LevelFlow.createObjectiveHUD(this, "Free Ahalya, then reach Mithila's gates");
    this.pauseMenu = new PauseMenu(this, {
      levelKey: "Level07_JourneyToMithila",
      levelName: "Level 07 — Journey to Mithila",
    });

    this.input.keyboard?.on("keydown-SPACE", () => this.tryInteract());
    this.input.keyboard?.on("keydown-E", () => this.tryInteract());

    this.dialogueSystem.startDialogue({
      id: "level7_intro",
      entries: [
        { character: "Vishwamitra", text: "On the road to Mithila lies Gautama's deserted ashram. A stone waits there — patient, sorrowful.", duration: 0 },
        { character: "Rama", text: "Then we shall not pass it by. No suffering soul is beneath our notice.", duration: 0 },
      ],
      skippable: true,
      onComplete: () => {
        this.started = true;
      },
    });
  }

  private addStep(x: number, y: number, w: number, h: number): void {
    this.platforms.add(this.add.rectangle(x, y, w, h, 0x6b4a2a).setOrigin(0));
  }

  private tryInteract(): void {
    if (!this.started || this.finished || this.dialogueSystem.isDialogueActive()) return;
    if (!this.ahalyaFreed && Math.abs(this.player.x - this.stoneX) < 130) {
      this.ahalyaFreed = true;
      this.dharma += 250;
      this.dialogueSystem.startDialogue({
        id: "level7_ahalya",
        entries: [
          { character: "Narrator", text: "Rama touches the stone. Light blooms — Ahalya rises, freed from Gautama's curse.", duration: 0 },
          { character: "Ahalya", text: "Blessed feet! My penance ends. May your path to Mithila be showered with flowers.", duration: 0 },
          { character: "Rama", text: "Rise, mother. Your patience itself was worship. Come — Mithila awaits.", duration: 0 },
        ],
        skippable: true,
        onComplete: () => {
          this.dharma += 100;
        },
      });
    }
  }

  update(time: number, delta: number): void {
    if (this.pauseMenu.isPausedState()) return;
    if (this.dialogueSystem.isDialogueActive()) {
      this.player.setVelocityX(0);
      return;
    }
    this.player.update(time, delta);
    if (!this.started || this.finished) return;

    if (!this.ahalyaFreed && Math.abs(this.player.x - this.stoneX) < 130) {
      this.promptText.setText("Press SPACE / E to touch the stone");
    } else if (!this.ahalyaFreed) {
      this.promptText.setText("Find Gautama's ashram ahead →");
    } else if (this.player.x < this.goalX - 60) {
      this.promptText.setText("Blessed! Now journey on to Mithila →");
    } else {
      this.promptText.setText("");
    }

    if (this.ahalyaFreed && this.player.x >= this.goalX - 40) {
      this.finished = true;
      if (this.player.body) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      this.dialogueSystem.startDialogue({
        id: "level7_complete",
        entries: [
          { character: "Narrator", text: "Mithila's banners flutter. The city hums — kings have gathered for Sita's swayamvara.", duration: 0 },
          { character: "Lakshmana", text: "Brother, they say none can even lift the Pinaka. I cannot wait to see their faces.", duration: 0 },
        ],
        skippable: true,
        onComplete: () => {
          LevelFlow.completeLevel(this, "Level07_JourneyToMithila", 400 + this.dharma, {
            title: "MITHILA REACHED!",
            subtitle: "Ahalya liberated",
            nextScene: "Level08_DivineBow",
          });
        },
      });
    }
  }
}
