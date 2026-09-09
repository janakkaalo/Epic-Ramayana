import Phaser from "phaser";
import { PHASER_CONFIG } from "./config/gameConfig";
import { BootScene } from "./scenes/BootScene";
import { PreloaderScene } from "./scenes/PreloaderScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { TestLevelScene } from "./scenes/TestLevelScene";
import { Level01_ValmikiAshram } from "./scenes/Level01_ValmikiAshram";
import { Level02_SacredYajna } from "./scenes/Level02_SacredYajna";
import { Level03_BrothersTraining } from "./scenes/Level03_BrothersTraining";
import { Level04_SagesRequest } from "./scenes/Level04_SagesRequest";
import { Level05_TatakasTerror } from "./scenes/Level05_TatakasTerror";
import { Level06_GuardianOfYajna } from "./scenes/Level06_GuardianOfYajna";
import { Level07_JourneyToMithila } from "./scenes/Level07_JourneyToMithila";
import { Level08_DivineBow } from "./scenes/Level08_DivineBow";
import { Level09_RamaRajyabhisheka } from "./scenes/Level09_RamaRajyabhisheka";
import { Level10_PoisonedMind } from "./scenes/Level10_PoisonedMind";
import { Level11_TwoBoons } from "./scenes/Level11_TwoBoons";
import { Level12_FarewellToAyodhya } from "./scenes/Level12_FarewellToAyodhya";
import { Level13_CharioteersTrick } from "./scenes/Level13_CharioteersTrick";
import { Level14_CrossingToChitrakuta } from "./scenes/Level14_CrossingToChitrakuta";
import { Level15_BharatasArrival } from "./scenes/Level15_BharatasArrival";
import { SettingsScene } from "./scenes/SettingsScene";

/**
 * PhaserGame - Main game instance manager
 * Handles initialization and lifecycle of the Phaser game
 */
export class PhaserGame {
  private game: Phaser.Game | null = null;
  private parentElement: string | HTMLElement;

  constructor(parentElement: string | HTMLElement = "phaser-game") {
    this.parentElement = parentElement;
  }

  /**
   * Initialize and start the Phaser game
   */
  start(): void {
    if (this.game) {
      console.warn("Game already running");
      return;
    }

    const config: Phaser.Types.Core.GameConfig = {
      ...PHASER_CONFIG,
      parent: this.parentElement,
      scene: [
        BootScene,
        PreloaderScene,
        MainMenuScene,
        SettingsScene,
        Level01_ValmikiAshram,
        Level02_SacredYajna,
        Level03_BrothersTraining,
        Level04_SagesRequest,
        Level05_TatakasTerror,
        Level06_GuardianOfYajna,
        Level07_JourneyToMithila,
        Level08_DivineBow,
        Level09_RamaRajyabhisheka,
        Level10_PoisonedMind,
        Level11_TwoBoons,
        Level12_FarewellToAyodhya,
        Level13_CharioteersTrick,
        Level14_CrossingToChitrakuta,
        Level15_BharatasArrival,
        TestLevelScene,
      ],
    };

    this.game = new Phaser.Game(config);
    console.log("Epic Ramayana: Game started");
  }

  /**
   * Destroy the game instance
   */
  destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
      console.log("Epic Ramayana: Game destroyed");
    }
  }

  /**
   * Pause the game
   */
  pause(): void {
    if (this.game) {
      this.game.pause();
    }
  }

  /**
   * Resume the game
   */
  resume(): void {
    if (this.game) {
      this.game.resume();
    }
  }

  /**
   * Get the current game instance
   */
  getGame(): Phaser.Game | null {
    return this.game;
  }
}

// Export singleton instance
let gameInstance: PhaserGame | null = null;

export function initializeGame(
  parentElement?: string | HTMLElement,
): PhaserGame {
  if (!gameInstance) {
    gameInstance = new PhaserGame(parentElement);
  }
  return gameInstance;
}

export function getGameInstance(): PhaserGame | null {
  return gameInstance;
}

export function destroyGame(): void {
  if (gameInstance) {
    gameInstance.destroy();
    gameInstance = null;
  }
}
