/**
 * Divine Weapons (Astras) Configuration
 * Based on authentic Hindu mythology from Valmiki Ramayana
 */

export type AstraId =
  | "AGNEYASTRA"
  | "VARUNASTRA"
  | "VAYAVYASTRA"
  | "MANAVASTRA"
  | "BRAHMASTRA"
  | "NAGASTRA"
  | "SURYASTRA";

export type AstraElement = "fire" | "water" | "wind" | "divine" | "mental";

export interface AstraData {
  id: AstraId;
  name: string;
  deity: string;
  element: AstraElement;
  damage: number;
  manaCost: number;
  cooldown: number; // seconds
  description: string;
  visualEffect: string;
  availableInActs: number[]; // Which acts this astra appears in
  counterAstra?: AstraId; // Which astra neutralizes this
}

export const ASTRAS: Record<AstraId, AstraData> = {
  AGNEYASTRA: {
    id: "AGNEYASTRA",
    name: "Agneyastra",
    deity: "Agni (Fire God)",
    element: "fire",
    damage: 50,
    manaCost: 30,
    cooldown: 30,
    description: "Divine fire weapon that creates inextinguishable flames",
    visualEffect: "fire_explosion",
    availableInActs: [1, 2, 3, 4, 5, 6],
    counterAstra: "VARUNASTRA",
  },

  VARUNASTRA: {
    id: "VARUNASTRA",
    name: "Varunastra",
    deity: "Varuna (Water God)",
    element: "water",
    damage: 45,
    manaCost: 30,
    cooldown: 30,
    description: "Divine water weapon that summons torrential floods",
    visualEffect: "water_flood",
    availableInActs: [1, 2, 3, 4, 5, 6],
    counterAstra: "AGNEYASTRA",
  },

  VAYAVYASTRA: {
    id: "VAYAVYASTRA",
    name: "Vayavyastra",
    deity: "Vayu (Wind God)",
    element: "wind",
    damage: 40,
    manaCost: 25,
    cooldown: 25,
    description: "Divine wind weapon creating devastating gales",
    visualEffect: "wind_storm",
    availableInActs: [1, 2, 3, 4, 5, 6],
  },

  MANAVASTRA: {
    id: "MANAVASTRA",
    name: "Manavastra",
    deity: "Manas (Mind)",
    element: "mental",
    damage: 35,
    manaCost: 40,
    cooldown: 45,
    description: "Mental weapon that slows time and enhances perception",
    visualEffect: "time_slow",
    availableInActs: [1, 2, 3, 4, 5, 6],
  },

  BRAHMASTRA: {
    id: "BRAHMASTRA",
    name: "Brahmastra",
    deity: "Brahma (Creator)",
    element: "divine",
    damage: 500,
    manaCost: 100,
    cooldown: 120,
    description:
      "Ultimate weapon of total annihilation - use only in dire need",
    visualEffect: "divine_destruction",
    availableInActs: [3, 4, 5, 6], // Not available in Acts 1-2
  },

  NAGASTRA: {
    id: "NAGASTRA",
    name: "Nagastra",
    deity: "Nagas (Serpents)",
    element: "divine",
    damage: 45,
    manaCost: 35,
    cooldown: 35,
    description: "Serpent weapon that binds enemies in venomous coils",
    visualEffect: "snake_binding",
    availableInActs: [2, 3, 4, 5, 6],
  },

  SURYASTRA: {
    id: "SURYASTRA",
    name: "Suryastra",
    deity: "Surya (Sun God)",
    element: "divine",
    damage: 55,
    manaCost: 35,
    cooldown: 35,
    description: "Solar weapon that blinds enemies with divine radiance",
    visualEffect: "solar_flash",
    availableInActs: [1, 2, 3, 4, 5, 6],
  },
};

/**
 * Get astras available in specific act
 */
export function getAstrasForAct(actNumber: number): AstraData[] {
  return Object.values(ASTRAS).filter((astra) =>
    astra.availableInActs.includes(actNumber),
  );
}

/**
 * Check if an astra counters another
 */
export function isCounter(attackAstra: AstraId, defendAstra: AstraId): boolean {
  const astra = ASTRAS[attackAstra];
  return (
    astra.counterAstra === defendAstra ||
    ASTRAS[defendAstra].counterAstra === attackAstra
  );
}
