/**
 * GameSettings - Persistent player settings (volume, visuals, difficulty, accessibility).
 * Stored in localStorage so settings survive reloads.
 */
import type Phaser from "phaser";

export type DifficultyId = "easy" | "normal" | "hard";
export type TextSpeedId = "slow" | "normal" | "fast";

export interface GameSettingsData {
  masterVolume: number; // 0..1
  musicVolume: number; // 0..1
  sfxVolume: number; // 0..1
  brightness: number; // 0.5..1.3 (1 = default)
  difficulty: DifficultyId;
  textSpeed: TextSpeedId;
  reducedMotion: boolean;
  screenShake: boolean;
  showFPS: boolean;
}

const STORAGE_KEY = "epic-ramayana-settings-v1";

const DEFAULTS: GameSettingsData = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.9,
  brightness: 1,
  difficulty: "normal",
  textSpeed: "normal",
  reducedMotion: false,
  screenShake: true,
  showFPS: false,
};

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.min(1, Math.max(0, v));
}

export class GameSettingsManager {
  private data: GameSettingsData = { ...DEFAULTS };

  constructor() {
    this.restore();
  }

  get(): GameSettingsData {
    return { ...this.data };
  }

  set(patch: Partial<GameSettingsData>): void {
    this.data = { ...this.data, ...patch };
    // Clamp numeric ranges
    this.data.masterVolume = clamp01(this.data.masterVolume);
    this.data.musicVolume = clamp01(this.data.musicVolume);
    this.data.sfxVolume = clamp01(this.data.sfxVolume);
    if (!Number.isFinite(this.data.brightness)) this.data.brightness = 1;
    this.data.brightness = Math.min(1.3, Math.max(0.5, this.data.brightness));
    this.persist();
    this.applySoundVolume();
  }

  resetToDefaults(): void {
    this.data = { ...DEFAULTS };
    this.persist();
    this.applySoundVolume();
  }

  /** Milliseconds per character for dialogue typewriter. */
  getTextDelayMs(): number {
    switch (this.data.textSpeed) {
      case "slow":
        return 55;
      case "fast":
        return 12;
      default:
        return 28;
    }
  }

  /** Damage taken multiplier based on difficulty. */
  getDamageTakenMultiplier(): number {
    switch (this.data.difficulty) {
      case "easy":
        return 0.6;
      case "hard":
        return 1.5;
      default:
        return 1;
    }
  }

  /** Enemy damage / HP multiplier. */
  getEnemyStrengthMultiplier(): number {
    switch (this.data.difficulty) {
      case "easy":
        return 0.8;
      case "hard":
        return 1.25;
      default:
        return 1;
    }
  }

  getEffectiveMusicVolume(): number {
    return clamp01(this.data.masterVolume * this.data.musicVolume);
  }

  getEffectiveSfxVolume(): number {
    return clamp01(this.data.masterVolume * this.data.sfxVolume);
  }

  applySoundVolume(): void {
    try {
      // Phaser sound manager may not exist in all contexts; guard heavily.
      const w = window as unknown as { __phaserGame?: { sound?: { volume: number } } };
      if (w.__phaserGame?.sound) {
        w.__phaserGame.sound.volume = clamp01(this.data.masterVolume);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Apply brightness as a full-screen overlay. Returns the overlay so the
   * caller can destroy it on shutdown. Darkens when < 1, lightens when > 1.
   */
  applyBrightnessOverlay(
    scene: Phaser.Scene,
    depth = 9000,
  ): Phaser.GameObjects.Rectangle | null {
    try {
      const { width, height } = scene.cameras.main;
      const b = this.data.brightness;
      if (Math.abs(b - 1) < 0.01) return null;
      if (b < 1) {
        const alpha = Math.min(0.55, (1 - b) * 0.9);
        return scene.add
          .rectangle(0, 0, width, height, 0x000000, alpha)
          .setOrigin(0)
          .setScrollFactor(0)
          .setDepth(depth);
      }
      const alpha = Math.min(0.3, (b - 1) * 0.6);
      return scene.add
        .rectangle(0, 0, width, height, 0xfff6d8, alpha)
        .setOrigin(0)
        .setScrollFactor(0)
        .setDepth(depth);
    } catch {
      return null;
    }
  }

  private persist(): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // restricted environments
    }
  }

  private restore(): void {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<GameSettingsData>;
      this.data = {
        ...DEFAULTS,
        ...parsed,
        masterVolume: clamp01(Number(parsed.masterVolume ?? DEFAULTS.masterVolume)),
        musicVolume: clamp01(Number(parsed.musicVolume ?? DEFAULTS.musicVolume)),
        sfxVolume: clamp01(Number(parsed.sfxVolume ?? DEFAULTS.sfxVolume)),
      };
      if (
        parsed.difficulty !== "easy" &&
        parsed.difficulty !== "normal" &&
        parsed.difficulty !== "hard"
      ) {
        this.data.difficulty = DEFAULTS.difficulty;
      }
      if (
        parsed.textSpeed !== "slow" &&
        parsed.textSpeed !== "normal" &&
        parsed.textSpeed !== "fast"
      ) {
        this.data.textSpeed = DEFAULTS.textSpeed;
      }
    } catch {
      // corrupt save -> keep defaults
    }
  }
}

let settingsInstance: GameSettingsManager | null = null;

export function getGameSettings(): GameSettingsManager {
  if (!settingsInstance) {
    settingsInstance = new GameSettingsManager();
  }
  return settingsInstance;
}
