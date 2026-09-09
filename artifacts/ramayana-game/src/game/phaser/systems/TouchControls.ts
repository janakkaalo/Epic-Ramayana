import Phaser from "phaser";
import { Player } from "../entities/Player";
import { getGameSettings } from "../managers/GameSettings";

/**
 * TouchControls - On-screen gamepad for mobile / touch devices.
 *
 * Left cluster:  ◀ ▶ move, JUMP (hold = higher jump)
 * Right cluster: BOW (hold to aim like SPACE, release to fire; also
 *                  activates SPACE-based interactions), SWORD (melee),
 *                  RUN (toggle).
 *
 * Shown when Settings → Mobile Controls is On, or Auto + touch device.
 * Multi-touch is enabled so move + jump + bow can be held together.
 */
export class TouchControls {
  private scene: Phaser.Scene;
  private player: Player;
  private container?: Phaser.GameObjects.Container;
  private enabled: boolean = false;
  private leftHeld: boolean = false;
  private rightHeld: boolean = false;
  private runButton?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    if (!getGameSettings().shouldShowTouchControls()) {
      return;
    }
    this.enabled = true;

    // Extra pointers so several buttons can be held at once.
    try {
      this.scene.input.addPointer(2);
    } catch {
      // ignore
    }

    this.build();
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    this.scene.events.on("pausemenu-open", this.handlePauseOpen, this);
    this.scene.events.on("pausemenu-close", this.handlePauseClose, this);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.events.off("pausemenu-open", this.handlePauseOpen, this);
      this.scene.events.off("pausemenu-close", this.handlePauseClose, this);
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private handlePauseOpen = (): void => {
    this.player.clearTouchState();
    this.leftHeld = false;
    this.rightHeld = false;
    this.container?.setVisible(false);
  };

  private handlePauseClose = (): void => {
    this.refreshRunLabel();
    this.container?.setVisible(true);
  };

  private build(): void {
    const { width, height } = this.scene.cameras.main;
    const y = height - 92;

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9400);

    // Movement cluster (left)
    const left = this.makeHoldButton(96, y, "◀", "Move left");
    const right = this.makeHoldButton(216, y, "▶", "Move right");
    const jump = this.makeHoldButton(336, y, "⤒", "Jump (hold = higher)");

    left.on("pointerdown", () => {
      this.leftHeld = true;
      this.player.setTouchMove(-1);
    });
    const releaseLeft = () => {
      this.leftHeld = false;
      this.player.setTouchMove(this.rightHeld ? 1 : 0);
    };
    left.on("pointerup", releaseLeft);
    left.on("pointerout", releaseLeft);

    right.on("pointerdown", () => {
      this.rightHeld = true;
      this.player.setTouchMove(1);
    });
    const releaseRight = () => {
      this.rightHeld = false;
      this.player.setTouchMove(this.leftHeld ? -1 : 0);
    };
    right.on("pointerup", releaseRight);
    right.on("pointerout", releaseRight);

    jump.on("pointerdown", () => this.player.queueTouchJump());
    const releaseJump = () => this.player.setTouchJumpHeld(false);
    jump.on("pointerup", releaseJump);
    jump.on("pointerout", releaseJump);

    // Action cluster (right)
    const bow = this.makeHoldButton(width - 336, y, "🏹", "Hold to aim, release to fire");
    const sword = this.makeTapButton(width - 216, y, "⚔", "Sword slash");
    this.runButton = this.makeTapButton(width - 96, y, "»", "Toggle run");
    this.refreshRunLabel();

    bow.on("pointerdown", () => {
      this.player.setTouchAimHeld(true);
      // Mirror SPACE press so level interactions (talk/gather/advance) work.
      this.scene.input.keyboard?.emit("keydown-SPACE", { synthetic: true });
    });
    const releaseBow = () => this.player.setTouchAimHeld(false);
    bow.on("pointerup", releaseBow);
    bow.on("pointerout", releaseBow);

    sword.on("pointerdown", () => this.player.queueTouchMelee());

    this.runButton.on("pointerdown", () => {
      this.player.setTouchRun(!this.player.isTouchRun());
      this.refreshRunLabel();
    });

    // Labels under clusters
    const style = {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#FFFFFF",
      backgroundColor: "#00000066",
      padding: { x: 6, y: 2 },
    };
    const moveLabel = this.scene.add
      .text(216, y + 58, "MOVE", style)
      .setOrigin(0.5)
      .setScrollFactor(0);
    const actLabel = this.scene.add
      .text(width - 216, y + 58, "BOW • SWORD • RUN", style)
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.container.add([moveLabel, actLabel]);
  }

  private refreshRunLabel(): void {
    if (!this.runButton) return;
    const on = this.player.isTouchRun();
    this.runButton.setColor(on ? "#FFD700" : "#FFFFFF");
    this.runButton.setText(on ? "»»" : "»");
  }

  private baseButtonStyle(active: boolean = false): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Arial",
      fontSize: "38px",
      color: "#FFFFFF",
      backgroundColor: active ? "#6b4a00cc" : "#00000088",
      padding: { x: 18, y: 12 },
    };
  }

  private makeHoldButton(
    x: number,
    y: number,
    glyph: string,
    hint: string,
  ): Phaser.GameObjects.Text {
    const btn = this.scene.add
      .text(x, y, glyph, this.baseButtonStyle())
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.85);
    btn.setData("hint", hint);
    btn.on("pointerover", () => btn.setAlpha(1));
    btn.on("pointerout", () => btn.setAlpha(0.85));
    this.container?.add(btn);
    return btn;
  }

  private makeTapButton(
    x: number,
    y: number,
    glyph: string,
    hint: string,
  ): Phaser.GameObjects.Text {
    const btn = this.makeHoldButton(x, y, glyph, hint);
    btn.on("pointerdown", () => {
      this.scene.tweens.add({
        targets: btn,
        scale: { from: 1.15, to: 1 },
        duration: 120,
      });
    });
    return btn;
  }

  destroy(): void {
    try {
      this.player.clearTouchState();
    } catch {
      // ignore
    }
    if (this.container) {
      this.container.destroy(true);
      this.container = undefined;
    }
  }
}
