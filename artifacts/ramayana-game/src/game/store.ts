import { create } from 'zustand';
import type { GameState, ActId, GameProgress, AstraId, SiddhiId, CharacterId, CharacterStats } from './types';
import { CHARACTERS } from './characters';
import { LEVELS } from './levels';

interface GameStore {
  gameState: GameState;
  currentAct: ActId;
  currentLevelIndex: number;
  player: CharacterStats;
  activeCharacter: 'RAMA' | 'HANUMAN' | 'LAKSHMANA';
  dharmaScore: number;
  karmaWeight: number;
  unlockedAstras: AstraId[];
  unlockedSiddhis: SiddhiId[];
  defeatedBosses: CharacterId[];
  completedLevels: string[];
  narrative: string[];
  showCutscene: boolean;
  cutsceneText: string;
  cutsceneSpeaker: string;
  bossHp: number;
  bossMaxHp: number;
  bossName: string;
  isBossFight: boolean;
  selectedAstra: AstraId | null;
  activeSiddhi: SiddhiId | null;
  
  setGameState: (state: GameState) => void;
  startGame: () => void;
  startLevel: (levelId: string) => void;
  completeLevel: (levelId: string) => void;
  advanceAct: () => void;
  takeDamage: (amount: number) => void;
  useMana: (amount: number) => void;
  restoreHp: (amount: number) => void;
  gainDharma: (amount: number) => void;
  addKarmaWeight: (amount: number) => void;
  unlockAstra: (astra: AstraId) => void;
  unlockSiddhi: (siddhi: SiddhiId) => void;
  defeatBoss: (bossId: CharacterId) => void;
  switchCharacter: (char: 'RAMA' | 'HANUMAN' | 'LAKSHMANA') => void;
  selectAstra: (astra: AstraId | null) => void;
  activateSiddhi: (siddhi: SiddhiId | null) => void;
  showNarrative: (text: string, speaker?: string) => void;
  dismissCutscene: () => void;
  setBossFight: (name: string, maxHp: number) => void;
  damageBoss: (amount: number) => boolean;
  resetGame: () => void;
}

const initialProgress: Partial<GameStore> = {
  gameState: 'MENU',
  currentAct: 'ACT1',
  currentLevelIndex: 0,
  activeCharacter: 'RAMA',
  dharmaScore: 50,
  karmaWeight: 0,
  unlockedAstras: ['AGNEYASTRA'],
  unlockedSiddhis: [],
  defeatedBosses: [],
  completedLevels: [],
  narrative: [],
  showCutscene: false,
  cutsceneText: '',
  cutsceneSpeaker: 'Narrator',
  bossHp: 0,
  bossMaxHp: 0,
  bossName: '',
  isBossFight: false,
  selectedAstra: null,
  activeSiddhi: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialProgress,
  player: { ...CHARACTERS['RAMA'] },

  setGameState: (state) => set({ gameState: state }),

  startGame: () => {
    set({
      gameState: 'CUTSCENE',
      currentAct: 'ACT1',
      currentLevelIndex: 0,
      player: { ...CHARACTERS['RAMA'] },
      dharmaScore: 50,
      karmaWeight: 0,
      unlockedAstras: ['AGNEYASTRA'],
      unlockedSiddhis: [],
      defeatedBosses: [],
      completedLevels: [],
      showCutscene: true,
      cutsceneText: 'In the beginning, the sage Narada told Valmiki of a perfect man. A man who embodied Dharma itself. That man was Rama, Prince of Ayodhya, born to restore cosmic balance...',
      cutsceneSpeaker: 'Sage Narada'
    });
  },

  startLevel: (levelId) => {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;
    
    const bossId = level.bossId;
    const bossChar = bossId ? CHARACTERS[bossId] : null;
    
    set({
      gameState: 'CUTSCENE',
      showCutscene: true,
      cutsceneText: level.narrative,
      cutsceneSpeaker: 'Narrator',
      isBossFight: !!bossChar,
      bossHp: bossChar?.hp || 0,
      bossMaxHp: bossChar?.maxHp || 0,
      bossName: bossChar?.name || ''
    });
  },

  completeLevel: (levelId) => {
    const level = LEVELS.find(l => l.id === levelId);
    const { completedLevels, currentLevelIndex, currentAct } = get();
    
    if (!completedLevels.includes(levelId)) {
      const newCompleted = [...completedLevels, levelId];
      const actLevels = LEVELS.filter(l => l.actId === currentAct);
      const nextIndex = currentLevelIndex + 1;
      
      set({
        completedLevels: newCompleted,
        currentLevelIndex: nextIndex < actLevels.length ? nextIndex : currentLevelIndex,
      });

      if (level?.completionReward) {
        const { dharma, astra, siddhi } = level.completionReward;
        if (dharma) get().gainDharma(dharma);
        if (astra) get().unlockAstra(astra);
        if (siddhi) get().unlockSiddhi(siddhi);
      }
    }
  },

  advanceAct: () => {
    const acts: ActId[] = ['ACT1', 'ACT2', 'ACT3', 'ACT4', 'ACT5'];
    const { currentAct } = get();
    const idx = acts.indexOf(currentAct);
    if (idx < acts.length - 1) {
      set({ currentAct: acts[idx + 1], currentLevelIndex: 0 });
    } else {
      set({ gameState: 'VICTORY' });
    }
  },

  takeDamage: (amount) => {
    const { player } = get();
    const defense = player.defense / 1000;
    const reduced = Math.max(1, Math.floor(amount * (1 - defense)));
    const newHp = Math.max(0, player.hp - reduced);
    set({ player: { ...player, hp: newHp } });
    if (newHp === 0) set({ gameState: 'GAME_OVER' });
  },

  useMana: (amount) => {
    const { player } = get();
    const newMana = Math.max(0, player.mana - amount);
    set({ player: { ...player, mana: newMana } });
  },

  restoreHp: (amount) => {
    const { player } = get();
    const newHp = Math.min(player.maxHp, player.hp + amount);
    set({ player: { ...player, hp: newHp } });
  },

  gainDharma: (amount) => set(s => ({ dharmaScore: Math.min(100, s.dharmaScore + amount) })),

  addKarmaWeight: (amount) => set(s => ({ karmaWeight: s.karmaWeight + amount })),

  unlockAstra: (astra) => set(s => ({
    unlockedAstras: s.unlockedAstras.includes(astra) ? s.unlockedAstras : [...s.unlockedAstras, astra]
  })),

  unlockSiddhi: (siddhi) => set(s => ({
    unlockedSiddhis: s.unlockedSiddhis.includes(siddhi) ? s.unlockedSiddhis : [...s.unlockedSiddhis, siddhi]
  })),

  defeatBoss: (bossId) => set(s => ({
    defeatedBosses: s.defeatedBosses.includes(bossId) ? s.defeatedBosses : [...s.defeatedBosses, bossId],
    isBossFight: false
  })),

  switchCharacter: (char) => {
    const charData = CHARACTERS[char];
    set({ activeCharacter: char, player: { ...charData } });
  },

  selectAstra: (astra) => set({ selectedAstra: astra }),

  activateSiddhi: (siddhi) => set({ activeSiddhi: siddhi }),

  showNarrative: (text, speaker = 'Narrator') => set({
    showCutscene: true,
    cutsceneText: text,
    cutsceneSpeaker: speaker,
  }),

  dismissCutscene: () => set({
    showCutscene: false,
    gameState: 'PLAYING'
  }),

  setBossFight: (name, maxHp) => set({
    isBossFight: true,
    bossName: name,
    bossHp: maxHp,
    bossMaxHp: maxHp
  }),

  damageBoss: (amount) => {
    const { bossHp } = get();
    const newHp = Math.max(0, bossHp - amount);
    set({ bossHp: newHp });
    return newHp === 0;
  },

  resetGame: () => set({
    ...initialProgress,
    player: { ...CHARACTERS['RAMA'] }
  })
}));
