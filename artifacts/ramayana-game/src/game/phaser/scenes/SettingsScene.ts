import Phaser from "phaser";
import {
  getGameSettings,
  DifficultyId,
  TextSpeedId,
  MobileControlsId,
} from "../managers/GameSettings";

/**
 * SettingsScene - Fully working settings screen.
 * Persistent via localStorage. Return target read from registry
 * ("settingsReturnKey") or falls back to MainMenuScene.
 * ESC / BACKSPACE / Back button returns.
 */
export class SettingsScene extends Phaser.Scene {
  private rows: Phaser.GameObjects.GameObject[] = [];
  private valuesText: Record<string, Phaser.GameObjects.Text> = {};

  constructor() {
    super({ key: "SettingsScene" });
  }

  create(): void {
    this.rows = [];
    this.valuesText = {};
    const { width, height } = this.cameras.main;
    const settings = getGameSettings();

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a0a, 0x0a0a0a, 0x1a0a00, 0x2d1b0f, 1);
    bg.fillRect(0, 0, width, height);
    bg.setDepth(-100);

    this.add
      .text(width / 2, 70, "⚙ SETTINGS", {
        fontFamily: "serif",
        fontSize: "52px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#8B4513",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 118, "Settings save automatically", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#CCCCCC",
        fontStyle: "italic",
      })
      .setOrigin(0.5);

    let y = 168;
    const step = 46;
    const cx = width / 2;

    const snap = () => settings.get();

    // Volume sliders
    this.addSliderRow(cx, y, "Master Volume", () => `${Math.round(snap().masterVolume * 100)}%`, (d) =>
      settings.set({ masterVolume: snap().masterVolume + d }),
    );
    y += step;
    this.addSliderRow(cx, y, "Music Volume", () => `${Math.round(snap().musicVolume * 100)}%`, (d) =>
      settings.set({ musicVolume: snap().musicVolume + d }),
    );
    y += step;
    this.addSliderRow(cx, y, "SFX Volume", () => `${Math.round(snap().sfxVolume * 100)}%`, (d) =>
      settings.set({ sfxVolume: snap().sfxVolume + d }),
    );
    y += step;
    this.addSliderRow(
      cx,
      y,
      "Brightness",
      () => `${Math.round(snap().brightness * 100)}%`,
      (d) => settings.set({ brightness: snap().brightness + d }),
      0.05,
      "Applies instantly in levels",
    );
    y += step;

    // Difficulty cycle
    this.addCycleRow<DifficultyId>(
      cx,
      y,
      "Difficulty",
      ["easy", "normal", "hard"],
      () => snap().difficulty,
      (v) => settings.set({ difficulty: v }),
      (v) =>
        v === "easy"
          ? "Easy: less damage taken"
          : v === "hard"
            ? "Hard: more damage taken"
            : "Normal: classic balance",
    );
    y += step;

    // Text speed cycle
    this.addCycleRow<TextSpeedId>(
      cx,
      y,
      "Text Speed",
      ["slow", "normal", "fast"],
      () => snap().textSpeed,
      (v) => settings.set({ textSpeed: v }),
      (v) => `Dialogue speed: ${v}`,
    );
    y += step;

    // Mobile controls cycle (Auto = show on touch devices)
    this.addCycleRow<MobileControlsId>(
      cx,
      y,
      "Mobile Controls",
      ["auto", "on", "off"],
      () => snap().mobileControls,
      (v) => settings.set({ mobileControls: v }),
      (v) =>
        v === "auto"
          ? "Auto: buttons appear on touch devices"
          : v === "on"
            ? "On: always show touch buttons"
            : "Off: keyboard only",
    );
    y += step;

    // Toggles
    this.addToggleRow(cx, y, "Screen Shake", () => snap().screenShake, (v) =>
      settings.set({ screenShake: v }),
    );
    y += step;
    this.addToggleRow(cx, y, "Reduced Motion", () => snap().reducedMotion, (v) =>
      settings.set({ reducedMotion: v }),
      "Disables particles & idle tweens",
    );
    y += step;
    this.addToggleRow(cx, y, "Show FPS", () => snap().showFPS, (v) =>
      settings.set({ showFPS: v }),
    );
    y += step + 8;

    // Reset defaults
    const reset = this.add
      .text(cx, y, "Reset to Defaults", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#FFFFFF",
        backgroundColor: "#442200",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    reset.on("pointerover", () => reset.setColor("#FFD700"));
    reset.on("pointerout", () => reset.setColor("#FFFFFF"));
    reset.on("pointerdown", () => {
      settings.resetToDefaults();
      this.refreshValues();
    });
    y += 56;

    // Back
    const back = this.add
      .text(cx, Math.min(y, height - 50), "← Back (ESC)", {
        fontFamily: "Arial",
        fontSize: "26px",
        color: "#FFD700",
        fontStyle: "bold",
        backgroundColor: "#00000088",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    back.on("pointerover", () => back.setScale(1.06));
    back.on("pointerout", () => back.setScale(1));
    back.on("pointerdown", () => this.goBack());

    this.input.keyboard?.on("keydown-ESC", () => this.goBack());
    this.input.keyboard?.on("keydown-BACKSPACE", () => this.goBack());

    this.refreshValues();
  }

  private goBack(): void {
    let target = "MainMenuScene";
    try {
      const stored = this.registry.get("settingsReturnKey") as string | undefined;
      if (stored && stored !== "SettingsScene") target = stored;
    } catch {
      // ignore
    }
    this.scene.start(target);
  }

  private addLabel(x: number, y: number, label: string, hint?: string): void {
    const t = this.add.text(x - 330, y, label, {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#FFFFFF",
      fontStyle: "bold",
    });
    t.setOrigin(0, 0.5);
    this.rows.push(t);
    if (hint) {
      const h = this.add.text(x - 330, y + 22, hint, {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#AAAAAA",
        fontStyle: "italic",
      });
      h.setOrigin(0, 0.5);
      this.rows.push(h);
    }
  }

  private addSliderRow(
    cx: number,
    y: number,
    label: string,
    getValue: () => string,
    adjust: (delta: number) => void,
    stepAmount = 0.1,
    hint?: string,
  ): void {
    this.addLabel(cx, y, label, hint);
    const mkBtn = (dx: number, text: string, delta: number) => {
      const b = this.add
        .text(cx + dx, y, text, {
          fontFamily: "Arial",
          fontSize: "26px",
          color: "#FFD700",
          fontStyle: "bold",
          backgroundColor: "#00000088",
          padding: { x: 14, y: 4 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      b.on("pointerdown", () => {
        adjust(delta);
        this.refreshValues();
      });
      this.rows.push(b);
    };
    mkBtn(-40, "−", -stepAmount);
    mkBtn(210, "+", stepAmount);
    const val = this.add
      .text(cx + 85, y, "", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#FFE9A8",
      })
      .setOrigin(0.5);
    this.rows.push(val);
    this.valuesText[label] = val;
    void getValue;
    // store getter via refresh closure
    val.setData("getter", getValue);
  }

  private addCycleRow<T extends string>(
    cx: number,
    y: number,
    label: string,
    options: T[],
    getValue: () => T,
    setValue: (v: T) => void,
    hint: (v: T) => string,
  ): void {
    const current = getValue();
    this.addLabel(cx, y, label, hint(current));
    const left = this.add
      .text(cx - 40, y, "◀", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#FFD700",
        backgroundColor: "#00000088",
        padding: { x: 12, y: 4 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const val = this.add
      .text(cx + 85, y, "", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#FFE9A8",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const right = this.add
      .text(cx + 210, y, "▶", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#FFD700",
        backgroundColor: "#00000088",
        padding: { x: 12, y: 4 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const cycle = (dir: number) => {
      const idx = options.indexOf(getValue());
      const next = options[(idx + dir + options.length) % options.length] as T;
      setValue(next);
      this.refreshValues();
      // update hint text
      for (const row of this.rows) {
        void row;
      }
    };
    left.on("pointerdown", () => cycle(-1));
    right.on("pointerdown", () => cycle(1));
    this.rows.push(left, val, right);
    this.valuesText[label] = val;
    val.setData("getter", () => {
      const v = getValue();
      return v.toUpperCase();
    });
    val.setData("hint", (v: string) => hint(v.toLowerCase() as T));
    val.setData("hintLabel", label);
  }

  private addToggleRow(
    cx: number,
    y: number,
    label: string,
    getValue: () => boolean,
    setValue: (v: boolean) => void,
    hint?: string,
  ): void {
    this.addLabel(cx, y, label, hint);
    const val = this.add
      .text(cx + 85, y, "", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#FFE9A8",
        fontStyle: "bold",
        backgroundColor: "#00000088",
        padding: { x: 18, y: 4 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    val.on("pointerdown", () => {
      setValue(!getValue());
      this.refreshValues();
    });
    this.rows.push(val);
    this.valuesText[label] = val;
    val.setData("getter", () => (getValue() ? "ON" : "OFF"));
  }

  private refreshValues(): void {
    for (const label of Object.keys(this.valuesText)) {
      const t = this.valuesText[label];
      try {
        const getter = t.getData("getter") as (() => string) | undefined;
        if (getter) t.setText(getter());
      } catch {
        // ignore
      }
    }
  }
}
