/**
 * Character definitions for Epic Ramayana
 * Based on Valmiki Ramayana - accurate to source material
 */

export type CharacterId =
  | "RAMA"
  | "LAKSHMANA"
  | "SITA"
  | "BHARATA"
  | "SHATRUGHNA"
  | "DASHARATHA"
  | "VISHWAMITRA"
  | "TATAKA"
  | "SUBAHU"
  | "MARICHA"
  | "RAVANA";

export type CharacterTier = 1 | 2 | 3 | 4 | 5;

export interface CharacterStats {
  id: CharacterId;
  name: string;
  title: string;
  tier: CharacterTier;
  maxHp: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  isPlayable: boolean;
  description: string;
}

export const CHARACTERS: Record<CharacterId, CharacterStats> = {
  RAMA: {
    id: "RAMA",
    name: "Rama",
    title: "Maryada Purushottam",
    tier: 4,
    maxHp: 100,
    maxMana: 100,
    attack: 50,
    defense: 40,
    speed: 150,
    isPlayable: true,
    description:
      "The perfect incarnation of dharma, eldest son of King Dasharatha",
  },

  LAKSHMANA: {
    id: "LAKSHMANA",
    name: "Lakshmana",
    title: "The Devoted Brother",
    tier: 3,
    maxHp: 90,
    maxMana: 80,
    attack: 45,
    defense: 38,
    speed: 160,
    isPlayable: false, // AI companion
    description: "Loyal brother of Rama, devoted protector and warrior",
  },

  SITA: {
    id: "SITA",
    name: "Sita",
    title: "Daughter of Earth",
    tier: 4,
    maxHp: 80,
    maxMana: 150,
    attack: 20,
    defense: 30,
    speed: 120,
    isPlayable: false,
    description: "Divine consort of Rama, embodiment of purity and devotion",
  },

  BHARATA: {
    id: "BHARATA",
    name: "Bharata",
    title: "The Righteous Prince",
    tier: 3,
    maxHp: 85,
    maxMana: 70,
    attack: 42,
    defense: 35,
    speed: 145,
    isPlayable: false,
    description: "Second son of Dasharatha, devoted to Rama",
  },

  SHATRUGHNA: {
    id: "SHATRUGHNA",
    name: "Shatrughna",
    title: "The Destroyer of Enemies",
    tier: 3,
    maxHp: 85,
    maxMana: 70,
    attack: 44,
    defense: 36,
    speed: 148,
    isPlayable: false,
    description: "Youngest son of Dasharatha, twin of Lakshmana",
  },

  DASHARATHA: {
    id: "DASHARATHA",
    name: "Dasharatha",
    title: "King of Ayodhya",
    tier: 3,
    maxHp: 120,
    maxMana: 100,
    attack: 40,
    defense: 50,
    speed: 100,
    isPlayable: false,
    description: "Legendary king, father of Rama, master of chariot warfare",
  },

  VISHWAMITRA: {
    id: "VISHWAMITRA",
    name: "Vishwamitra",
    title: "Brahmarishi",
    tier: 5,
    maxHp: 200,
    maxMana: 500,
    attack: 100,
    defense: 80,
    speed: 120,
    isPlayable: false,
    description: "Great sage and teacher of divine weapons (Astras)",
  },

  TATAKA: {
    id: "TATAKA",
    name: "Tataka",
    title: "The Demoness",
    tier: 2,
    maxHp: 150,
    maxMana: 50,
    attack: 35,
    defense: 25,
    speed: 180,
    isPlayable: false,
    description: "Fierce rakshasi terrorizing the forests, first major boss",
  },

  SUBAHU: {
    id: "SUBAHU",
    name: "Subahu",
    title: "Rakshasa Warrior",
    tier: 2,
    maxHp: 100,
    maxMana: 40,
    attack: 30,
    defense: 20,
    speed: 140,
    isPlayable: false,
    description: "Demon disrupting Vishwamitra's yajna",
  },

  MARICHA: {
    id: "MARICHA",
    name: "Maricha",
    title: "Shapeshifter Demon",
    tier: 2,
    maxHp: 120,
    maxMana: 80,
    attack: 28,
    defense: 22,
    speed: 200,
    isPlayable: false,
    description: "Cunning rakshasa with illusion powers",
  },

  RAVANA: {
    id: "RAVANA",
    name: "Ravana",
    title: "King of Lanka",
    tier: 4,
    maxHp: 500,
    maxMana: 300,
    attack: 70,
    defense: 60,
    speed: 130,
    isPlayable: false,
    description: "Ten-headed demon king, ultimate antagonist (not in Acts 1-2)",
  },
};
