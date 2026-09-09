import Phaser from "phaser";
import { getProgressionManager } from "../managers/LevelProgressionManager";

/**
 * LevelFlow - Shared helpers for consistent level behaviour:
 * - mark level as started (persistent resume / continue)
 * - standard level-complete overlay with restart + continue
 * - small objective HUD line
 */

export interface CompleteOptions {
  title?: string;
  subtitle?: string;
  nextScene?: string | null;
  astraUnlock?: string;
  /** When true, completion returns to menu (final level of a Kanda). */
  endToMenu?: boolean;
}

export class LevelFlow {
  /** Record that the player entered this level (persists resume point). */
  static markLevelStarted(levelKey: string): void {
    try {
      getProgressionManager().touchLevel(levelKey);
    } catch {
      // ignore persistence failures
    }
  }

  static createObjectiveHUD(
    scene: Phaser.Scene,
    objective: string,
    depth = 500,
  ): Phaser.GameObjects.Text {
    const text = scene.add
      .text(16, 16, `Objective: ${objective}`, {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFFFFF",
        backgroundColor: "#000000aa",
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(depth);
    const hint = scene.add
      .text(16, 48, "ESC / P: Pause  |  SPACE: Interact/Shoot", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#CCCCCC",
        backgroundColor: "#00000088",
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(depth);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      text.destroy();
      hint.destroy();
    });
    return text;
  }

  /**
   * Persist completion, show overlay, and advance on SPACE / tap.
   * Also offers Restart (R) directly from the completion screen.
   */
  static completeLevel(
    scene: Phaser.Scene,
    levelKey: string,
    dharma: number,
    opts: CompleteOptions = {},
  ): void {
    const pm = getProgressionManager();
    const safeDharma = Math.max(0, Math.floor(dharma));
    pm.completeLevel(levelKey, safeDharma);
    if (opts.astraUnlock) {
      pm.unlockAstra(opts.astraUnlock);
    }

    const { width, height } = scene.cameras.main;
    const title = opts.title ?? "LEVEL COMPLETE";
    const nextLabel = opts.endToMenu
      ? "Kanda Complete! Press SPACE / Tap to return to menu"
      : opts.nextScene
        ? "Press SPACE / Tap to continue"
        : "Press SPACE / Tap to return to menu";
    const restartLabel = "Press R to replay this level";

    const dim = scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.55)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(4000);

    const titleText = scene.add
      .text(width / 2, height / 2 - 70, title, {
        fontFamily: "serif",
        fontSize: "48px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4001);

    scene.add
      .text(width / 2, height / 2, `Dharma Gained: ${safeDharma}`, {
        fontFamily: "serif",
        fontSize: "30px",
        color: "#FFFFFF",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4001);

    if (opts.subtitle) {
      scene.add
        .text(width / 2, height / 2 + 42, opts.subtitle, {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#FFE9A8",
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(4001);
    }

    const continueText = scene.add
      .text(width / 2, height / 2 + 84, nextLabel, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#FFD700",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4001);

    scene.add
      .text(width / 2, height / 2 + 114, restartLabel, {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#CCCCCC",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4001);

    scene.tweens.add({
      targets: continueText,
      alpha: { from: 1, to: 0.45 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      dim.destroy();
      if (opts.endToMenu || !opts.nextScene) {
        scene.scene.start("MainMenuScene");
      } else {
        scene.scene.start(opts.nextScene);
      }
    };
    const restart = () => {
      if (advanced) return;
      advanced = true;
      scene.scene.restart();
    };

    scene.input.keyboard?.once("keydown-SPACE", advance);
    scene.input.keyboard?.once("keydown-ENTER", advance);
    scene.input.keyboard?.once("keydown-R", restart);
    scene.input.once("pointerdown", advance);
    void titleText;
  }
}
