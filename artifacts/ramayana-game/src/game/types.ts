export type GameState =
  | 'MENU'
  | 'CUTSCENE'
  | 'PLAYING'
  | 'DIALOGUE'
  | 'BOSS_INTRO'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'EPILOGUE';

export type ActId = 'ACT1' | 'ACT2' | 'ACT3' | 'ACT4' | 'ACT5';

export type CharacterId =
  | 'RAMA'
  | 'HANUMAN'
  | 'LAKSHMANA'
  | 'SITA'
  | 'RAVANA'
  | 'TATAKA'
  | 'KHARA'
  | 'DUSHANA'
  | 'VALI'
  | 'INDRAJIT'
  | 'KUMBHAKARNA'
  | 'MARICHA';

export type AstraId =
  | 'BRAHMASTRA'
  | 'AGNEYASTRA'
  | 'VARUNASTRA'
  | 'VAYAVYASTRA'
  | 'NAGASTRA'
  | 'PASHUPATASTRA'
  | 'NARAYAN_ASTRA'
  | 'MOHINI_ASTRA'
  | 'BAJRANG_ASTRA';

export type SiddhiId =
  | 'ANIMA'
  | 'MAHIMA'
  | 'GARIMA'
  | 'LAGHIMA'
  | 'PRAPTI'
  | 'PRAKAMYA'
  | 'ISHATVA'
  | 'VASITVA';

export interface CharacterStats {
  id: CharacterId;
  name: string;
  title: string;
  tier: 1 | 2 | 3 | 4 | 5;
  maxHp: number;
  hp: number;
  maxMana: number;
  mana: number;
  attack: number;
  defense: number;
  speed: number;
  dharmaScore: number;
  astras: AstraId[];
  siddhis?: SiddhiId[];
  isPlayable: boolean;
  description: string;
}

export interface GameProgress {
  currentAct: ActId;
  currentLevel: number;
  completedLevels: string[];
  dharmaScore: number;
  karmaWeight: number;
  unlockedAstras: AstraId[];
  unlockedSiddhis: SiddhiId[];
  defeatedBosses: CharacterId[];
  narrative: string[];
  choices: Record<string, string>;
}

export interface Enemy {
  id: string;
  characterId: CharacterId;
  position: [number, number, number];
  hp: number;
  maxHp: number;
  isAlive: boolean;
  isBoss: boolean;
  state: 'IDLE' | 'PATROL' | 'COMBAT' | 'DYING';
}

export interface Projectile {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  astraId?: AstraId;
  damage: number;
  ownerId: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  emotion?: 'neutral' | 'angry' | 'sad' | 'joyful' | 'wise';
}

export interface DialogueTree {
  id: string;
  lines: DialogueLine[];
  choices?: {
    text: string;
    nextId?: string;
    dharmaChange?: number;
    consequence?: string;
  }[];
}

export interface Level {
  id: string;
  actId: ActId;
  name: string;
  location: string;
  description: string;
  objectives: string[];
  environment: 'AYODHYA' | 'DANDAKA' | 'KISHKINDHA' | 'LANKA' | 'OCEAN' | 'BATTLEFIELD';
  enemies: Enemy[];
  bossId?: CharacterId;
  narrative: string;
  completionReward?: {
    dharma?: number;
    karmaWeight?: number;
    astra?: AstraId;
    siddhi?: SiddhiId;
  };
}
