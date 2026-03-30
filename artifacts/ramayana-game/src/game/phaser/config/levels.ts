/**
 * Level Definitions for Epic Ramayana
 * Bala Kanda (Act 1) & Ayodhya Kanda (Act 2)
 * 100% accurate to Valmiki Ramayana
 */

export type LevelId =
  | "LEVEL_01_VALMIKI_ASHRAM"
  | "LEVEL_02_SACRED_YAJNA"
  | "LEVEL_03_BROTHERS_TRAINING"
  | "LEVEL_04_SAGES_REQUEST"
  | "LEVEL_05_TATAKA_TERROR"
  | "LEVEL_06_GUARDIAN_YAJNA"
  | "LEVEL_07_JOURNEY_MITHILA"
  | "LEVEL_08_DIVINE_BOW"
  | "LEVEL_09_CORONATION_PREP"
  | "LEVEL_10_POISONED_MIND"
  | "LEVEL_11_TWO_BOONS"
  | "LEVEL_12_FAREWELL_AYODHYA"
  | "LEVEL_13_CHARIOTEERS_TRICK"
  | "LEVEL_14_CROSSING_CHITRAKUTA"
  | "LEVEL_15_BHARATAS_ARRIVAL";

export type ActId = "ACT_1_BALA" | "ACT_2_AYODHYA";

export type LevelType =
  | "tutorial"
  | "platforming"
  | "combat"
  | "boss"
  | "story"
  | "puzzle"
  | "tower_defense"
  | "exploration"
  | "stealth"
  | "crafting";

export interface LevelData {
  id: LevelId;
  actId: ActId;
  levelNumber: number;
  name: string;
  location: string;
  type: LevelType[];
  description: string;
  objectives: string[];
  difficulty: "very_easy" | "easy" | "medium" | "hard";
  estimatedTime: number; // minutes
  hasBoss: boolean;
  bossId?: string;
  unlocksAstra?: string;
  dharmaChoices: number; // Number of dharma choices in level
  narrativeSummary: string;
}

export const LEVELS: Record<LevelId, LevelData> = {
  LEVEL_01_VALMIKI_ASHRAM: {
    id: "LEVEL_01_VALMIKI_ASHRAM",
    actId: "ACT_1_BALA",
    levelNumber: 1,
    name: "The Question of Perfection",
    location: "Valmiki's Ashram, Banks of Tamasa River",
    type: ["story", "tutorial"],
    description:
      "The sage Valmiki asks Narada about the existence of a perfect human",
    objectives: [
      "Listen to Narada's description of Rama",
      "Witness Valmiki's inspiration to write Ramayana",
      "Understand the concept of Maryada Purushottam",
    ],
    difficulty: "very_easy",
    estimatedTime: 5,
    hasBoss: false,
    dharmaChoices: 0,
    narrativeSummary:
      "Introduction to the epic. Valmiki, after witnessing a hunter kill one of a pair of birds, is inspired by grief to compose poetry. Narada visits and tells him about Rama, the perfect man.",
  },

  LEVEL_02_SACRED_YAJNA: {
    id: "LEVEL_02_SACRED_YAJNA",
    actId: "ACT_1_BALA",
    levelNumber: 2,
    name: "The Sacred Yajna",
    location: "Royal Palace of Ayodhya - Yajna Mandap",
    type: ["tutorial", "platforming"],
    description: "King Dasharatha performs Putrakameshti Yajna to beget sons",
    objectives: [
      "Learn basic movement controls",
      "Collect sacred offerings for the yajna",
      "Witness the birth of the four princes",
    ],
    difficulty: "very_easy",
    estimatedTime: 8,
    hasBoss: false,
    dharmaChoices: 0,
    narrativeSummary:
      "Dasharatha, childless king of Ayodhya, performs Putrakameshti Yajna with sage Rishyasringa. The gods grant him four sons: Rama, Bharata, Lakshmana, and Shatrughna.",
  },

  LEVEL_03_BROTHERS_TRAINING: {
    id: "LEVEL_03_BROTHERS_TRAINING",
    actId: "ACT_1_BALA",
    levelNumber: 3,
    name: "The Brothers' Training",
    location: "Ayodhya Palace Training Grounds",
    type: ["tutorial", "combat"],
    description: "Young Rama trains in archery under Guru Vashishtha",
    objectives: [
      "Master bow aiming mechanics",
      "Hit all training targets",
      "Learn perfect shot timing",
      "Defeat training enemies",
    ],
    difficulty: "easy",
    estimatedTime: 12,
    hasBoss: false,
    dharmaChoices: 1,
    narrativeSummary:
      "The four brothers grow up learning warfare, scriptures, and statecraft under sage Vashishtha. Rama excels in all arts, showing divine qualities.",
  },

  LEVEL_04_SAGES_REQUEST: {
    id: "LEVEL_04_SAGES_REQUEST",
    actId: "ACT_1_BALA",
    levelNumber: 4,
    name: "The Sage's Request",
    location: "Throne Room to Siddhashrama Forest Path",
    type: ["story", "platforming", "combat"],
    description: "Vishwamitra requests Rama's help to protect his yajna",
    objectives: [
      "Accompany Vishwamitra to the forest",
      "Navigate through dense forest terrain",
      "Defeat minor asuras and wild beasts",
      "Reach Siddhashrama safely",
    ],
    difficulty: "easy",
    estimatedTime: 15,
    hasBoss: false,
    dharmaChoices: 2,
    narrativeSummary:
      "Sage Vishwamitra arrives in Ayodhya requesting Rama's help. Despite Dasharatha's reluctance, Rama and Lakshmana depart with the sage.",
  },

  LEVEL_05_TATAKA_TERROR: {
    id: "LEVEL_05_TATAKA_TERROR",
    actId: "ACT_1_BALA",
    levelNumber: 5,
    name: "Tataka's Terror",
    location: "Dense Forests near Siddhashrama",
    type: ["platforming", "combat", "boss"],
    description:
      "Rama must overcome his hesitation and defeat the demoness Tataka",
    objectives: [
      "Navigate through the haunted forest",
      "Overcome moral dilemma about killing a female",
      "Defeat Tataka in boss battle",
      "Receive blessings and divine weapons from Vishwamitra",
    ],
    difficulty: "medium",
    estimatedTime: 20,
    hasBoss: true,
    bossId: "TATAKA",
    unlocksAstra: "AGNEYASTRA",
    dharmaChoices: 1,
    narrativeSummary:
      "Vishwamitra instructs Rama to kill Tataka, a demoness terrorizing the region. After initial hesitation about killing a woman, Rama fulfills his kshatriya dharma. Vishwamitra teaches him divine astras.",
  },

  LEVEL_06_GUARDIAN_YAJNA: {
    id: "LEVEL_06_GUARDIAN_YAJNA",
    actId: "ACT_1_BALA",
    levelNumber: 6,
    name: "Guardian of the Yajna",
    location: "Siddhashrama Hermitage",
    type: ["combat", "tower_defense"],
    description: "Protect Vishwamitra's yajna from Subahu and Maricha",
    objectives: [
      "Defend the sacred fire for 6 days",
      "Defeat waves of rakshasa attacks",
      "Defeat Subahu and Maricha",
      "Successfully complete the yajna",
    ],
    difficulty: "medium",
    estimatedTime: 18,
    hasBoss: true,
    bossId: "SUBAHU_MARICHA",
    unlocksAstra: "VARUNASTRA",
    dharmaChoices: 0,
    narrativeSummary:
      "Rama and Lakshmana guard Vishwamitra's yajna. On the final day, Subahu and Maricha attack. Rama kills Subahu and hurls Maricha far into the ocean with a special arrow.",
  },

  LEVEL_07_JOURNEY_MITHILA: {
    id: "LEVEL_07_JOURNEY_MITHILA",
    actId: "ACT_1_BALA",
    levelNumber: 7,
    name: "Journey to Mithila",
    location: "Forest Path to Mithila, Gautama's Ashram",
    type: ["platforming", "story"],
    description: "Travel to Mithila and liberate Ahalya from her curse",
    objectives: [
      "Journey through varied landscapes",
      "Discover Gautama's cursed ashram",
      "Touch the stone to free Ahalya",
      "Receive blessings from Ahalya and Gautama",
      "Arrive at Mithila",
    ],
    difficulty: "easy",
    estimatedTime: 15,
    hasBoss: false,
    dharmaChoices: 0,
    narrativeSummary:
      "Vishwamitra takes Rama and Lakshmana to Mithila for Sita's swayamvara. On the way, they pass Gautama's ashram where Ahalya, cursed to stone form, is liberated by Rama's touch.",
  },

  LEVEL_08_DIVINE_BOW: {
    id: "LEVEL_08_DIVINE_BOW",
    actId: "ACT_1_BALA",
    levelNumber: 8,
    name: "The Divine Bow",
    location: "Mithila Palace, Swayamvara Hall",
    type: ["puzzle", "story"],
    description:
      "Rama strings and breaks Shiva's mighty bow, winning Sita's hand",
    objectives: [
      "Witness other kings' failed attempts",
      "Approach the divine bow (Pinaka)",
      "Complete the physics puzzle to string the bow",
      "Break the bow",
      "Marry Sita",
    ],
    difficulty: "medium",
    estimatedTime: 12,
    hasBoss: false,
    dharmaChoices: 0,
    narrativeSummary:
      "In Mithila, Janaka holds a swayamvara where Sita will marry whoever strings Shiva's bow. Many kings fail. Rama effortlessly lifts and strings the bow, which breaks. Rama marries Sita.",
  },

  LEVEL_09_CORONATION_PREP: {
    id: "LEVEL_09_CORONATION_PREP",
    actId: "ACT_2_AYODHYA",
    levelNumber: 9,
    name: "Rama Rajyabhisheka Preparation",
    location: "Ayodhya Royal Palace",
    type: ["story", "exploration"],
    description: "Ayodhya prepares to crown Rama as heir apparent",
    objectives: [
      "Explore celebrating Ayodhya",
      "Speak with family members",
      "Interact with joyful citizens",
      "Receive blessings from elders",
    ],
    difficulty: "very_easy",
    estimatedTime: 10,
    hasBoss: false,
    dharmaChoices: 0,
    narrativeSummary:
      "Years pass in happiness. Dasharatha, feeling old, decides to crown Rama as Yuvaraja. All of Ayodhya celebrates the upcoming coronation.",
  },

  LEVEL_10_POISONED_MIND: {
    id: "LEVEL_10_POISONED_MIND",
    actId: "ACT_2_AYODHYA",
    levelNumber: 10,
    name: "The Poisoned Mind",
    location: "Kaikeyi's Palace - Private Chambers",
    type: ["story", "stealth"],
    description: "Manthara poisons Kaikeyi's mind against Rama",
    objectives: [
      "Observe the conspiracy unfold",
      "Witness Manthara's manipulation",
      "Understand the tragedy about to occur",
    ],
    difficulty: "easy",
    estimatedTime: 8,
    hasBoss: false,
    dharmaChoices: 0,
    narrativeSummary:
      "Manthara, Kaikeyi's maidservant, is jealous of Rama's coronation. She manipulates Kaikeyi, reminding her of two boons Dasharatha owes her, and convinces her to demand Rama's exile.",
  },

  LEVEL_11_TWO_BOONS: {
    id: "LEVEL_11_TWO_BOONS",
    actId: "ACT_2_AYODHYA",
    levelNumber: 11,
    name: "The Two Boons",
    location: "Kopa Bhavan to Throne Room",
    type: ["story"],
    description: "Kaikeyi demands exile for Rama; Rama accepts with grace",
    objectives: [
      "Witness Dasharatha's devastation",
      "Hear Rama's calm acceptance",
      "Make dialogue choices (outcome predetermined)",
      "Prepare for exile",
    ],
    difficulty: "easy",
    estimatedTime: 12,
    hasBoss: false,
    dharmaChoices: 3,
    narrativeSummary:
      "Kaikeyi demands her two boons: crown Bharata as king and exile Rama for 14 years. Dasharatha is heartbroken. Rama accepts calmly, honoring his father's word (Pitru Dharma).",
  },

  LEVEL_12_FAREWELL_AYODHYA: {
    id: "LEVEL_12_FAREWELL_AYODHYA",
    actId: "ACT_2_AYODHYA",
    levelNumber: 12,
    name: "Farewell to Ayodhya",
    location: "Ayodhya Streets to Forest Border",
    type: ["platforming", "story"],
    description: "Rama, Sita, and Lakshmana leave Ayodhya amid grief",
    objectives: [
      "Leave the palace in exile garb",
      "Navigate through mourning crowds",
      "Cross the Tamasa River",
      "Send citizens back to Ayodhya",
    ],
    difficulty: "easy",
    estimatedTime: 15,
    hasBoss: false,
    dharmaChoices: 2,
    narrativeSummary:
      "Rama leaves in bark garments. Sita and Lakshmana insist on accompanying him. Citizens follow in grief. At Tamasa river, Rama rests, then secretly continues so citizens won't follow.",
  },

  LEVEL_13_CHARIOTEERS_TRICK: {
    id: "LEVEL_13_CHARIOTEERS_TRICK",
    actId: "ACT_2_AYODHYA",
    levelNumber: 13,
    name: "The Charioteer's Trick",
    location: "Forest Paths, Shringaverapura",
    type: ["platforming", "story"],
    description: "Meeting with Guha; emotional farewell to Sumantra",
    objectives: [
      "Cross into Nishadraj territory",
      "Meet with Guha, the tribal king",
      "Accept his hospitality",
      "Say farewell to charioteer Sumantra",
    ],
    difficulty: "easy",
    estimatedTime: 12,
    hasBoss: false,
    dharmaChoices: 1,
    narrativeSummary:
      "They reach Shringaverapura where Guha, king of Nishadas and Rama's friend, offers help. Rama sends back Sumantra the charioteer to inform Dasharatha.",
  },

  LEVEL_14_CROSSING_CHITRAKUTA: {
    id: "LEVEL_14_CROSSING_CHITRAKUTA",
    actId: "ACT_2_AYODHYA",
    levelNumber: 14,
    name: "Crossing to Chitrakuta",
    location: "Ganga River to Chitrakuta Mountain",
    type: ["platforming", "crafting"],
    description: "Establish hermitage at Chitrakuta",
    objectives: [
      "Cross the mighty Ganga river",
      "Gather materials for hermitage",
      "Build ashram",
      "Establish peaceful life",
    ],
    difficulty: "easy",
    estimatedTime: 15,
    hasBoss: false,
    dharmaChoices: 0,
    narrativeSummary:
      "Following sage Bharadvaja's advice, they cross Ganga and reach Chitrakuta mountain. They build a hermitage and live peacefully, performing daily duties.",
  },

  LEVEL_15_BHARATAS_ARRIVAL: {
    id: "LEVEL_15_BHARATAS_ARRIVAL",
    actId: "ACT_2_AYODHYA",
    levelNumber: 15,
    name: "Bharata's Arrival",
    location: "Chitrakuta Ashram",
    type: ["story"],
    description: "Bharata requests Rama return; Rama gives his sandals",
    objectives: [
      "Receive news of Dasharatha's death",
      "Debate with Bharata about dharma",
      "Refuse to break father's promise",
      "Give Paduka (sandals) to Bharata",
    ],
    difficulty: "easy",
    estimatedTime: 15,
    hasBoss: false,
    dharmaChoices: 2,
    narrativeSummary:
      "Dasharatha dies of grief. Bharata, learning the truth, refuses the throne and finds Rama at Chitrakuta. He begs Rama to return. Rama refuses, honoring his father's word. Bharata takes Rama's sandals to place on the throne, ruling as regent for 14 years. [END OF AYODHYA KANDA]",
  },
};

/**
 * Get levels by act
 */
export function getLevelsByAct(actId: ActId): LevelData[] {
  return Object.values(LEVELS).filter((level) => level.actId === actId);
}

/**
 * Get level by number
 */
export function getLevelByNumber(levelNumber: number): LevelData | undefined {
  return Object.values(LEVELS).find(
    (level) => level.levelNumber === levelNumber,
  );
}
