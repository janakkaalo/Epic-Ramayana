import type { Level } from './types';

export const LEVELS: Level[] = [
  {
    id: 'ACT1_L1_AYODHYA',
    actId: 'ACT1',
    name: 'Birth of the Princes',
    location: 'Ayodhya - Palace of King Dasharatha',
    description: 'The Putrakameshti Yajna has been completed. The divine nectar blesses the queens. Four princes are born to fulfill the cosmic purpose.',
    objectives: ['Witness the sacred yajna', 'Receive the divine blessing', 'Begin training with sage Vishwamitra'],
    environment: 'AYODHYA',
    enemies: [],
    narrative: 'In the twilight of a golden era, the sage Narada spoke to Valmiki of a perfect man. A man who was truth itself made flesh. That man was Rama, born in 12241 BCE in the city of Ayodhya, capital of the Kosala kingdom...',
    completionReward: { dharma: 10 }
  },
  {
    id: 'ACT1_L2_TATAKA',
    actId: 'ACT1',
    name: 'Slaying of Tataka',
    location: 'Dandaka Forest - Vishwamitra\'s Hermitage',
    description: 'The sage Vishwamitra seeks protection for his fire sacrifice. Young Rama and Lakshmana must defeat the demoness Tataka.',
    objectives: ['Protect Vishwamitra\'s ashram', 'Learn the Bala and Atibala mantras', 'Slay Tataka'],
    environment: 'DANDAKA',
    enemies: [
      { id: 'tataka_1', characterId: 'TATAKA', position: [0, 0, -30], hp: 1200, maxHp: 1200, isAlive: true, isBoss: true, state: 'PATROL' }
    ],
    bossId: 'TATAKA',
    narrative: 'The forest shook with Tataka\'s fearsome roar. Trees uprooted themselves. The hermitage shook. But Rama stood firm, his bow raised...',
    completionReward: { dharma: 15, astra: 'AGNEYASTRA' }
  },
  {
    id: 'ACT1_L3_SHIVA_BOW',
    actId: 'ACT1',
    name: 'The Bow of Shiva',
    location: 'Mithila - King Janaka\'s Court',
    description: 'The Swayamvara of Sita. Only one who can lift and string the celestial bow of Shiva may win her hand.',
    objectives: ['Enter King Janaka\'s court', 'Lift the Bow of Shiva', 'String and break the bow', 'Win Sita\'s hand'],
    environment: 'AYODHYA',
    enemies: [],
    narrative: 'Thousands of kings had tried and failed. The bow sat immovable, ancient, vibrating with divine energy. Then Rama approached...',
    completionReward: { dharma: 20 }
  },
  {
    id: 'ACT2_L1_EXILE',
    actId: 'ACT2',
    name: 'The Great Exile',
    location: 'Ayodhya - Palace',
    description: 'Queen Kaikeyi\'s boons have been invoked. Rama must accept 14 years of forest exile. A test of Pitru Dharma.',
    objectives: ['Listen to Kaikeyi\'s demands', 'Make the choice of dharma', 'Say farewell to Ayodhya', 'Cross the Ganga'],
    environment: 'AYODHYA',
    enemies: [],
    narrative: 'The choice was simple in its cruelty. A father\'s vow against a kingdom\'s need. Rama chose duty...',
    completionReward: { dharma: 30 }
  },
  {
    id: 'ACT2_L2_SURPANAKHA',
    actId: 'ACT2',
    name: 'Surpanakha\'s Rage',
    location: 'Dandaka Forest - Panchavati',
    description: 'The demoness Surpanakha is mutilated after attempting to harm Sita. Her brothers Khara and Dushana gather an army for revenge.',
    objectives: ['Establish hermitage at Panchavati', 'Repel Surpanakha', 'Defeat Khara and his 14,000 rakshasas'],
    environment: 'DANDAKA',
    enemies: [
      { id: 'rakshasa_1', characterId: 'KHARA', position: [10, 0, -40], hp: 2400, maxHp: 2400, isAlive: true, isBoss: false, state: 'PATROL' },
      { id: 'rakshasa_2', characterId: 'DUSHANA', position: [-10, 0, -40], hp: 1800, maxHp: 1800, isAlive: true, isBoss: false, state: 'PATROL' }
    ],
    bossId: 'KHARA',
    narrative: 'Khara raised his army of 14,000. They darkened the forest like a storm cloud. Against this, stood Rama alone...',
    completionReward: { dharma: 15, astra: 'VARUNASTRA' }
  },
  {
    id: 'ACT2_L3_GOLDEN_DEER',
    actId: 'ACT2',
    name: 'The Golden Deer',
    location: 'Dandaka Forest',
    description: 'The demon Maricha appears as a golden deer to lure Rama away. Sita is abducted by Ravana during this deception.',
    objectives: ['Chase the golden deer', 'Slay Maricha', 'Return to find Sita gone', 'Search for clues'],
    environment: 'DANDAKA',
    enemies: [
      { id: 'maricha_deer', characterId: 'MARICHA', position: [0, 0, -20], hp: 800, maxHp: 800, isAlive: true, isBoss: false, state: 'PATROL' }
    ],
    narrative: 'Sita\'s eyes lit up at the golden deer. \'Bring it for me, my lord.\' Rama knew something was wrong - no beast of nature wore such impossible beauty...',
    completionReward: { dharma: 0 }
  },
  {
    id: 'ACT3_L1_VALI',
    actId: 'ACT3',
    name: 'The Fall of Vali',
    location: 'Kishkindha - Rocky Hills',
    description: 'Rama must help Sugriva reclaim his kingdom from his brother Vali. The moral question: fight from shadows or open combat?',
    objectives: ['Reach Kishkindha', 'Witness Vali\'s power', 'Decide how to aid Sugriva', 'Slay Vali'],
    environment: 'KISHKINDHA',
    enemies: [
      { id: 'vali_1', characterId: 'VALI', position: [0, 2, -35], hp: 5000, maxHp: 5000, isAlive: true, isBoss: true, state: 'COMBAT' }
    ],
    bossId: 'VALI',
    narrative: 'Sugriva challenged Vali again. In plain sight the battle seemed hopeless - Vali would absorb half of any opponent\'s strength. Rama strung his bow from the shadows...',
    completionReward: { dharma: 10, karmaWeight: 15 }
  },
  {
    id: 'ACT3_L2_OCEAN_LEAP',
    actId: 'ACT3',
    name: 'Hanuman\'s Leap',
    location: 'Mahendra Mountain - Southern Shore',
    description: 'Hanuman must leap across the vast ocean to Lanka, find Sita, and deliver Rama\'s message.',
    objectives: ['Activate Mahima siddhi', 'Leap across the ocean', 'Navigate wind demons', 'Locate Lanka'],
    environment: 'OCEAN',
    enemies: [],
    narrative: 'Standing atop Mahendra mountain, Hanuman grew. And grew. His form expanded, filling the sky. Then he leaped...',
    completionReward: { dharma: 20, siddhi: 'MAHIMA' }
  },
  {
    id: 'ACT4_L1_LANKA_INFILTRATION',
    actId: 'ACT4',
    name: 'The Golden City',
    location: 'Lanka - Ashoka Vatika',
    description: 'Hanuman must infiltrate Lanka using Anima siddhi, find Sita in the Ashoka grove, and deliver Rama\'s ring.',
    objectives: ['Shrink using Anima', 'Navigate Rakshasa guards', 'Find the Ashoka Vatika', 'Deliver Rama\'s message to Sita'],
    environment: 'LANKA',
    enemies: [],
    narrative: 'Lanka was magnificent and terrible - gold everywhere, rakshasa guards at every pillar. But for a being who could shrink to the size of a thumb...',
    completionReward: { dharma: 20, siddhi: 'ANIMA' }
  },
  {
    id: 'ACT4_L2_LANKA_DAHAN',
    actId: 'ACT4',
    name: 'Lanka Dahan - The Burning',
    location: 'Lanka - Capital City',
    description: 'Captured by Ravana\'s forces, Hanuman\'s tail is set on fire. He uses this to burn Lanka\'s towers and escape.',
    objectives: ['Allow capture', 'Face Ravana\'s court', 'Burn Lanka with the tail fire', 'Escape across the ocean'],
    environment: 'LANKA',
    enemies: [],
    narrative: 'They bound his tail and lit it. A mistake. Fire cannot hurt the son of the Wind God. Hanuman grew...',
    completionReward: { dharma: 15 }
  },
  {
    id: 'ACT4_L3_NALA_SETU',
    actId: 'ACT4',
    name: 'Bridge of Lanka',
    location: 'Southern Shore',
    description: 'The engineer Nala and the Vanara army must build a bridge of floating stones across 100 yojanas of ocean.',
    objectives: ['Coordinate the Vanara Sena', 'Place floating stones', 'Complete the bridge structure', 'March to Lanka'],
    environment: 'OCEAN',
    enemies: [],
    narrative: 'Nala, architect by divine blessing, supervised the construction. Each stone inscribed with Rama\'s name floated of its own accord...',
    completionReward: { dharma: 10 }
  },
  {
    id: 'ACT5_L1_INDRAJIT',
    actId: 'ACT5',
    name: 'Defeat of Indrajit',
    location: 'Lanka - Battlefield',
    description: 'Indrajit - Ravana\'s invincible son - fights from invisibility. Only Lakshmana\'s sleepless eyes can see through his Maya.',
    objectives: ['Survive Indrajit\'s invisible attacks', 'Switch to Lakshmana', 'Use Narayan Astra to pierce the Maya', 'Slay Indrajit'],
    environment: 'BATTLEFIELD',
    enemies: [
      { id: 'indrajit_1', characterId: 'INDRAJIT', position: [0, 8, -30], hp: 4200, maxHp: 4200, isAlive: true, isBoss: true, state: 'COMBAT' }
    ],
    bossId: 'INDRAJIT',
    narrative: 'Indrajit was nowhere and everywhere. His arrows came from empty air. Only Lakshmana, who had not slept in 14 years, could track his shadow...',
    completionReward: { dharma: 25 }
  },
  {
    id: 'ACT5_L2_KUMBHAKARNA',
    actId: 'ACT5',
    name: 'The Giant Awakens',
    location: 'Lanka - Northern Gate',
    description: 'Kumbhakarna, the sleeping giant of Lanka, is awakened. He requires a coordinated Vanara assault to pin before striking.',
    objectives: ['Coordinate the Vanara army', 'Pin Kumbhakarna\'s limbs', 'Deliver the killing strike', 'Celebrate victory'],
    environment: 'BATTLEFIELD',
    enemies: [
      { id: 'kumbha_1', characterId: 'KUMBHAKARNA', position: [0, 4, -50], hp: 12000, maxHp: 12000, isAlive: true, isBoss: true, state: 'IDLE' }
    ],
    bossId: 'KUMBHAKARNA',
    narrative: 'They blew thousand conches to wake him. He rose from his slumber like a mountain waking. Even in defeat, even knowing his brother was wrong, he fought for family...',
    completionReward: { dharma: 20 }
  },
  {
    id: 'ACT5_L3_RAVANA',
    actId: 'ACT5',
    name: 'The Final Duel',
    location: 'Lanka - Palace Gate',
    description: 'The final battle. Rama faces Ravana in single combat. Ten heads regenerate - the navel is the only true weak point.',
    objectives: ['Survive Ravana\'s ten-head assault', 'Deplete each head\'s power bar', 'Strike the navel during the vulnerability window', 'Claim victory with Brahmastra'],
    environment: 'BATTLEFIELD',
    enemies: [
      { id: 'ravana_final', characterId: 'RAVANA', position: [0, 6, -40], hp: 10000, maxHp: 10000, isAlive: true, isBoss: true, state: 'COMBAT' }
    ],
    bossId: 'RAVANA',
    narrative: 'Ten heads. Twenty arms. The might of Lanka itself. Rama stood alone against him. Again and again the heads fell. Again and again they grew back. Then the sage Agastya revealed the secret...',
    completionReward: { dharma: 100, astra: 'BRAHMASTRA' }
  }
];

export const ACT_INFO = {
  ACT1: {
    id: 'ACT1',
    name: 'The Incarnation',
    subtitle: 'Bala Kanda - The Training of Princes',
    timelineDate: '12241 BCE',
    location: 'Ayodhya & Mithila',
    color: '#FFD700',
    levels: LEVELS.filter(l => l.actId === 'ACT1')
  },
  ACT2: {
    id: 'ACT2',
    name: 'The Forest Exile',
    subtitle: 'Aranya Kanda - Crisis of Dharma',
    timelineDate: '12223 BCE',
    location: 'Dandaka Forest',
    color: '#228B22',
    levels: LEVELS.filter(l => l.actId === 'ACT2')
  },
  ACT3: {
    id: 'ACT3',
    name: 'The Alliance',
    subtitle: 'Kishkindha Kanda - The Vanara Scout',
    timelineDate: '12209 BCE',
    location: 'Kishkindha & Southern Shore',
    color: '#8B4513',
    levels: LEVELS.filter(l => l.actId === 'ACT3')
  },
  ACT4: {
    id: 'ACT4',
    name: 'Infiltration of Lanka',
    subtitle: 'Sundara Kanda - The Divine Message',
    timelineDate: '12209 BCE',
    location: 'Lanka',
    color: '#DC143C',
    levels: LEVELS.filter(l => l.actId === 'ACT4')
  },
  ACT5: {
    id: 'ACT5',
    name: 'The Great War',
    subtitle: 'Yuddha Kanda - Fall of the Demon King',
    timelineDate: '12209 BCE',
    location: 'Lanka - Battlefield',
    color: '#FF4500',
    levels: LEVELS.filter(l => l.actId === 'ACT5')
  }
};
