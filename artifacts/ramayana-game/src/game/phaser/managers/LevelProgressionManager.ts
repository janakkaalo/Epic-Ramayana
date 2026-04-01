/**
 * LevelProgressionManager - Manages level progression, unlocking, and game state
 * Handles the flow between levels and tracks completion status
 */

export interface LevelData {
  key: string;
  name: string;
  order: number;
  kanda: "Bala" | "Ayodhya" | "Aranya"; // Cantos of the Ramayana
  completed: boolean;
  unlocked: boolean;
  dharmaScore: number;
  completionTime?: number;
}

export class LevelProgressionManager {
  private levels: Map<string, LevelData> = new Map();
  private currentLevel: string | null = null;
  private totalDharmaScore: number = 0;
  private unlockedAstras: Set<string> = new Set();
  private readonly storageKey = "epic-ramayana-progress-v1";

  constructor() {
    this.initializeLevels();
    this.restoreFromStorage();
  }

  /**
   * Initialize all 15 levels
   */
  private initializeLevels(): void {
    const levelConfigs: LevelData[] = [
      {
        key: "Level01_ValmikiAshram",
        name: "The Question of Perfection",
        order: 1,
        kanda: "Bala",
        completed: false,
        unlocked: true, // First level always unlocked
        dharmaScore: 0,
      },
      {
        key: "Level02_SacredYajna",
        name: "Sacred Yajna",
        order: 2,
        kanda: "Bala",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level03_BrothersTraining",
        name: "Brothers' Training",
        order: 3,
        kanda: "Bala",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level04_SagesRequest",
        name: "Sage's Request",
        order: 4,
        kanda: "Bala",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level05_TatakasTerror",
        name: "Tataka's Terror",
        order: 5,
        kanda: "Bala",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level06_GuardianOfYajna",
        name: "Guardian of the Yajna",
        order: 6,
        kanda: "Bala",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level07_JourneyToMithila",
        name: "Journey to Mithila",
        order: 7,
        kanda: "Bala",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level08_DivineBow",
        name: "The Divine Bow",
        order: 8,
        kanda: "Bala",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level09_RamaRajyabhisheka",
        name: "Rama Rajyabhisheka Preparation",
        order: 9,
        kanda: "Ayodhya",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level10_PoisonedMind",
        name: "The Poisoned Mind",
        order: 10,
        kanda: "Ayodhya",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level11_TwoBoons",
        name: "The Two Boons",
        order: 11,
        kanda: "Ayodhya",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level12_FarewellToAyodhya",
        name: "Farewell to Ayodhya",
        order: 12,
        kanda: "Ayodhya",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level13_CharioteersTrick",
        name: "The Charioteer's Trick",
        order: 13,
        kanda: "Ayodhya",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level14_CrossingToChitrakuta",
        name: "Crossing to Chitrakuta",
        order: 14,
        kanda: "Ayodhya",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
      {
        key: "Level15_BharatasArrival",
        name: "Bharata's Arrival",
        order: 15,
        kanda: "Ayodhya",
        completed: false,
        unlocked: false,
        dharmaScore: 0,
      },
    ];

    levelConfigs.forEach((config) => {
      this.levels.set(config.key, { ...config });
    });
  }

  /**
   * Get a level by key
   */
  getLevel(key: string): LevelData | undefined {
    return this.levels.get(key);
  }

  /**
   * Get all levels
   */
  getAllLevels(): LevelData[] {
    return Array.from(this.levels.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Get next level key
   */
  getNextLevel(currentLevelKey: string): string | null {
    const current = this.getLevel(currentLevelKey);
    if (!current) return null;

    const allLevels = this.getAllLevels();
    const nextLevel = allLevels.find((l) => l.order === current.order + 1);
    return nextLevel?.key || null;
  }

  /**
   * Complete a level and unlock the next one
   */
  completeLevel(levelKey: string, dharmaScore: number): void {
    const level = this.getLevel(levelKey);
    if (!level) return;

    level.completed = true;
    level.dharmaScore = dharmaScore;
    level.completionTime = Date.now();
    this.totalDharmaScore += dharmaScore;
    this.currentLevel = levelKey;

    // Unlock next level
    const nextLevel = this.getNextLevel(levelKey);
    if (nextLevel) {
      const next = this.getLevel(nextLevel);
      if (next) {
        next.unlocked = true;
      }
    }

    this.persistToStorage();
  }

  /**
   * Check if a level is unlocked
   */
  isLevelUnlocked(levelKey: string): boolean {
    return this.getLevel(levelKey)?.unlocked || false;
  }

  /**
   * Check if a level is completed
   */
  isLevelCompleted(levelKey: string): boolean {
    return this.getLevel(levelKey)?.completed || false;
  }

  /**
   * Get progression percentage (0-100)
   */
  getProgressionPercentage(): number {
    const total = this.levels.size;
    const completed = Array.from(this.levels.values()).filter(
      (l) => l.completed,
    ).length;
    return Math.round((completed / total) * 100);
  }

  /**
   * Get current level
   */
  getCurrentLevel(): string | null {
    return this.currentLevel;
  }

  /**
   * Unlock an Astra
   */
  unlockAstra(astraKey: string): void {
    this.unlockedAstras.add(astraKey);
    this.persistToStorage();
  }

  /**
   * Get best level to continue from.
   */
  getContinueLevelKey(): string {
    const allLevels = this.getAllLevels();

    const firstUnlockedIncomplete = allLevels.find(
      (level) => level.unlocked && !level.completed,
    );
    if (firstUnlockedIncomplete) {
      return firstUnlockedIncomplete.key;
    }

    if (this.currentLevel) {
      const nextAfterCurrent = this.getNextLevel(this.currentLevel);
      if (nextAfterCurrent && this.isLevelUnlocked(nextAfterCurrent)) {
        return nextAfterCurrent;
      }

      return this.currentLevel;
    }

    return "Level01_ValmikiAshram";
  }

  /**
   * Reset all progression for a new game.
   */
  clearProgress(): void {
    this.levels.clear();
    this.currentLevel = null;
    this.totalDharmaScore = 0;
    this.unlockedAstras.clear();
    this.initializeLevels();

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Check if an Astra is unlocked
   */
  isAstraUnlocked(astraKey: string): boolean {
    return this.unlockedAstras.has(astraKey);
  }

  /**
   * Get total dharma score
   */
  getTotalDharmaScore(): number {
    return this.totalDharmaScore;
  }

  /**
   * Get dharma tier ("Righteous", "Virtuous", "Noble", "Flawed")
   */
  getDharmaTier(): string {
    if (this.totalDharmaScore >= 8000) return "Maryada Purushottam"; // Perfect being
    if (this.totalDharmaScore >= 6000) return "Righteous";
    if (this.totalDharmaScore >= 4000) return "Virtuous";
    if (this.totalDharmaScore >= 2000) return "Noble";
    return "Flawed";
  }

  /**
   * Save game progress (for future implementation)
   */
  saveProgress(): object {
    return {
      levels: Array.from(this.levels.values()),
      currentLevel: this.currentLevel,
      totalDharmaScore: this.totalDharmaScore,
      unlockedAstras: Array.from(this.unlockedAstras),
    };
  }

  /**
   * Load game progress (for future implementation)
   */
  loadProgress(data: any): void {
    if (data.levels) {
      data.levels.forEach((level: LevelData) => {
        this.levels.set(level.key, level);
      });
    }
    if (data.currentLevel) this.currentLevel = data.currentLevel;
    if (data.totalDharmaScore) this.totalDharmaScore = data.totalDharmaScore;
    if (data.unlockedAstras) {
      this.unlockedAstras = new Set(data.unlockedAstras);
    }

    this.persistToStorage();
  }

  private persistToStorage(): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const payload = JSON.stringify(this.saveProgress());
      window.localStorage.setItem(this.storageKey, payload);
    } catch {
      // Ignore storage write failures in restricted environments.
    }
  }

  private restoreFromStorage(): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const saved = window.localStorage.getItem(this.storageKey);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved);
      this.loadProgress(parsed);
    } catch {
      // Ignore corrupt save data.
    }
  }
}

// Global singleton instance
let progressionManager: LevelProgressionManager | null = null;

export function getProgressionManager(): LevelProgressionManager {
  if (!progressionManager) {
    progressionManager = new LevelProgressionManager();
  }
  return progressionManager;
}

export function resetProgressionManager(): void {
  progressionManager = new LevelProgressionManager();
}
