/**
 * LevelProgressionManager - Manages level progression and unlocks
 * Handles transitioning between levels and tracking completion
 */
export class LevelProgressionManager {
  private static instance: LevelProgressionManager;
  private completedLevels: Set<string> = new Set();
  private currentLevel: string | null = null;
  private unlockedLevels: Set<string> = new Set(["Level01_ValmikiAshram"]);

  private constructor() {
    this.loadProgress();
  }

  static getInstance(): LevelProgressionManager {
    if (!LevelProgressionManager.instance) {
      LevelProgressionManager.instance = new LevelProgressionManager();
    }
    return LevelProgressionManager.instance;
  }

  /**
   * Complete a level and unlock the next one
   */
  completeLevel(levelKey: string, nextLevelKey?: string): void {
    this.completedLevels.add(levelKey);

    if (nextLevelKey) {
      this.unlockedLevels.add(nextLevelKey);
    }

    this.saveProgress();
    console.log(`Level ${levelKey} completed! Next: ${nextLevelKey || "None"}`);
  }

  /**
   * Check if a level is unlocked
   */
  isLevelUnlocked(levelKey: string): boolean {
    return this.unlockedLevels.has(levelKey);
  }

  /**
   * Check if a level is completed
   */
  isLevelCompleted(levelKey: string): boolean {
    return this.completedLevels.has(levelKey);
  }

  /**
   * Set current level
   */
  setCurrentLevel(levelKey: string): void {
    this.currentLevel = levelKey;
  }

  /**
   * Get current level
   */
  getCurrentLevel(): string | null {
    return this.currentLevel;
  }

  /**
   * Start next level in sequence
   */
  startNextLevel(scene: Phaser.Scene, currentLevelKey: string): void {
    const levelSequence: Record<string, string> = {
      Level01_ValmikiAshram: "Level02_SacredYajna",
      Level02_SacredYajna: "TestLevelScene", // Placeholder until more levels are built
      // Add more level transitions here as they're built
    };

    const nextLevel = levelSequence[currentLevelKey];

    if (nextLevel) {
      this.completeLevel(currentLevelKey, nextLevel);
      scene.scene.start(nextLevel);
    } else {
      console.log("No next level defined, returning to menu");
      scene.scene.start("MainMenuScene");
    }
  }

  /**
   * Get all completed levels
   */
  getCompletedLevels(): string[] {
    return Array.from(this.completedLevels);
  }

  /**
   * Get all unlocked levels
   */
  getUnlockedLevels(): string[] {
    return Array.from(this.unlockedLevels);
  }

  /**
   * Reset all progress (for testing or new game)
   */
  resetProgress(): void {
    this.completedLevels.clear();
    this.unlockedLevels.clear();
    this.unlockedLevels.add("Level01_ValmikiAshram"); // Always unlocked
    this.currentLevel = null;
    this.saveProgress();
    console.log("Progress reset");
  }

  /**
   * Save progress to localStorage
   */
  private saveProgress(): void {
    try {
      const data = {
        completed: Array.from(this.completedLevels),
        unlocked: Array.from(this.unlockedLevels),
        current: this.currentLevel,
      };
      localStorage.setItem("epic-ramayana-progress", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }

  /**
   * Load progress from localStorage
   */
  private loadProgress(): void {
    try {
      const saved = localStorage.getItem("epic-ramayana-progress");
      if (saved) {
        const data = JSON.parse(saved);
        this.completedLevels = new Set(data.completed || []);
        this.unlockedLevels = new Set(
          data.unlocked || ["Level01_ValmikiAshram"],
        );
        this.currentLevel = data.current || null;
        console.log("Progress loaded:", data);
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
    }
  }

  /**
   * Get progress statistics
   */
  getProgressStats(): {
    completedCount: number;
    unlockedCount: number;
    totalLevels: number;
  } {
    return {
      completedCount: this.completedLevels.size,
      unlockedCount: this.unlockedLevels.size,
      totalLevels: 15, // Total levels planned
    };
  }
}
