import { useState } from 'react';
import { useGameStore } from '@/game/store';
import { CHARACTERS } from '@/game/characters';
import type { CharacterId } from '@/game/types';

const HERO_IDS: CharacterId[] = ['RAMA', 'HANUMAN', 'LAKSHMANA'];
const ENEMY_IDS: CharacterId[] = ['TATAKA', 'KHARA', 'DUSHANA', 'VALI', 'INDRAJIT', 'KUMBHAKARNA', 'RAVANA', 'MARICHA'];

const TIER_LABELS = ['', 'Rathi', 'Atirathi', 'Maharathi', 'Atimaharathi', 'Mahamaharathi'];
const TIER_COLORS = ['', '#aaa', '#44BBFF', '#44FF88', '#FFD700', '#FF4500'];

export default function CharacterScreen() {
  const store = useGameStore();
  const [selected, setSelected] = useState<CharacterId>('RAMA');
  const [tab, setTab] = useState<'heroes' | 'enemies'>('heroes');

  const char = CHARACTERS[selected];

  return (
    <div
      className="absolute inset-0 z-40 overflow-y-auto"
      style={{ background: 'linear-gradient(135deg, #020008, #08040010)' }}
    >
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold" style={{ color: '#FFD700', fontFamily: 'serif' }}>
            Character Codex
          </h2>
          <p className="text-sm mt-1" style={{ color: '#5c4000' }}>
            Entity Component System — Divine Tier Classification
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 mb-6 justify-center">
          {(['heroes', 'enemies'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected(t === 'heroes' ? 'RAMA' : 'TATAKA'); }}
              className="px-6 py-2 text-sm font-bold tracking-wider uppercase transition-all"
              style={{
                background: tab === t ? 'rgba(100,60,0,0.5)' : 'rgba(20,10,0,0.5)',
                border: tab === t ? '1px solid #8B6914' : '1px solid #2a1500',
                color: tab === t ? '#FFD700' : '#5a4000',
                fontFamily: 'serif'
              }}
            >
              {t === 'heroes' ? '⚔ Allied Heroes' : '💀 Adversaries'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character list */}
          <div className="space-y-2">
            {(tab === 'heroes' ? HERO_IDS : ENEMY_IDS).map(id => {
              const c = CHARACTERS[id];
              const isDefeated = store.defeatedBosses.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => setSelected(id)}
                  className="w-full flex items-center gap-3 p-3 text-left transition-all"
                  style={{
                    background: selected === id ? 'rgba(40,20,0,0.8)' : 'rgba(10,5,0,0.6)',
                    border: selected === id ? '1px solid #8B6914' : '1px solid #1a0a00',
                    borderLeft: selected === id ? '3px solid #FFD700' : '3px solid transparent'
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: `${TIER_COLORS[c.tier]}22`,
                      border: `1px solid ${TIER_COLORS[c.tier]}88`,
                      color: TIER_COLORS[c.tier]
                    }}
                  >
                    T{c.tier}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate" style={{ color: selected === id ? '#FFD700' : '#8a6000', fontFamily: 'serif' }}>
                      {c.name}
                    </div>
                    <div className="text-xs truncate" style={{ color: '#3a2000' }}>{c.title}</div>
                  </div>
                  {isDefeated && (
                    <div className="text-xs" style={{ color: '#5c4000' }}>✓</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Character detail */}
          <div className="lg:col-span-2">
            {char && (
              <div
                className="p-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(8,4,0,0.9), rgba(15,8,0,0.9))',
                  border: '1px solid #3a2000'
                }}
              >
                {/* Name and tier */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-bold mb-1" style={{ color: '#FFD700', fontFamily: 'serif' }}>
                      {char.name}
                    </h3>
                    <div className="text-sm mb-2" style={{ color: '#8a6000', fontFamily: 'serif' }}>
                      {char.title}
                    </div>
                    <div
                      className="inline-block px-3 py-1 text-xs font-bold tracking-wider"
                      style={{
                        background: `${TIER_COLORS[char.tier]}22`,
                        border: `1px solid ${TIER_COLORS[char.tier]}66`,
                        color: TIER_COLORS[char.tier]
                      }}
                    >
                      TIER {char.tier} — {TIER_LABELS[char.tier].toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right text-xs" style={{ color: '#3a2000' }}>
                    {char.isPlayable && <div className="text-green-800 mb-1">● Playable</div>}
                    {store.defeatedBosses.includes(char.id) && <div style={{ color: '#5c4000' }}>✓ Defeated</div>}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#c8a050', fontFamily: 'serif' }}>
                  {char.description}
                </p>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <StatBox label="HP" value={char.maxHp.toLocaleString()} color="#FF4444" />
                  <StatBox label="Attack" value={char.attack} color="#FF8800" />
                  <StatBox label="Defense" value={char.defense} color="#4488FF" />
                  <StatBox label="Mana" value={char.maxMana.toLocaleString()} color="#8844FF" />
                  <StatBox label="Speed" value={char.speed} color="#44BBFF" />
                  <StatBox label="Dharma" value={char.dharmaScore} color={char.dharmaScore >= 0 ? '#44FF88' : '#FF4444'} />
                </div>

                {/* Power scaling note */}
                <div
                  className="p-3 mb-4 text-xs"
                  style={{ background: 'rgba(20,10,0,0.5)', border: '1px solid #1a0a00', color: '#5a4000' }}
                >
                  <span className="font-bold" style={{ color: '#8a6000' }}>Combat Scaling: </span>
                  {getTierDescription(char.tier)}
                </div>

                {/* Astras */}
                {char.astras.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-bold mb-2" style={{ color: '#8a6000', letterSpacing: '0.2em' }}>
                      DIVINE WEAPONS (ASTRAS)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {char.astras.map(astra => (
                        <div
                          key={astra}
                          className="px-2 py-1 text-xs"
                          style={{
                            background: 'rgba(20,10,0,0.6)',
                            border: '1px solid #3a2000',
                            color: '#8a6000'
                          }}
                        >
                          {astra.replace('_', ' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Siddhis */}
                {char.siddhis && char.siddhis.length > 0 && (
                  <div>
                    <div className="text-xs font-bold mb-2" style={{ color: '#8a6000', letterSpacing: '0.2em' }}>
                      DIVINE POWERS (SIDDHIS)
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {char.siddhis.map(siddhi => (
                        <div
                          key={siddhi}
                          className="p-2 text-center text-xs"
                          style={{
                            background: 'rgba(30,15,0,0.5)',
                            border: '1px solid #2a1500',
                            color: '#8a6000'
                          }}
                        >
                          <div className="font-bold" style={{ color: '#c8a000' }}>{SIDDHI_DISPLAY[siddhi]?.emoji || '✦'}</div>
                          <div>{SIDDHI_DISPLAY[siddhi]?.name || siddhi}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Playable action */}
                {char.isPlayable && (
                  <button
                    onClick={() => {
                      store.switchCharacter(char.id as 'RAMA' | 'HANUMAN' | 'LAKSHMANA');
                      store.setGameState('PLAYING');
                    }}
                    className="w-full mt-4 py-2.5 font-bold tracking-wider uppercase transition-all"
                    style={{
                      background: 'rgba(60,35,0,0.6)',
                      border: '1px solid #8B6914',
                      color: '#FFD700',
                      fontFamily: 'serif'
                    }}
                  >
                    ▶ Play as {char.name}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Back button */}
        <div className="text-center mt-6">
          <button
            onClick={() => store.setGameState('PLAYING')}
            className="px-8 py-3 font-bold tracking-wider uppercase"
            style={{
              background: 'rgba(20,10,0,0.8)',
              border: '1px solid #3a2000',
              color: '#8a6000',
              fontFamily: 'serif'
            }}
          >
            ◀ Return to Battle
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div
      className="p-2 text-center"
      style={{ background: 'rgba(10,5,0,0.5)', border: '1px solid #1a0a00' }}
    >
      <div className="text-lg font-bold" style={{ color, fontFamily: 'serif' }}>{value}</div>
      <div className="text-xs" style={{ color: '#3a2000' }}>{label}</div>
    </div>
  );
}

function getTierDescription(tier: number): string {
  const desc: Record<number, string> = {
    1: 'Standard hero. Equal in power to 5,000 ordinary warriors.',
    2: 'Elite commander. Equivalent to 12 Rathis — 60,000 warriors.',
    3: 'Master tactician. Equivalent to 12 Atirathis — 720,000 warriors. Masters multiple Astras.',
    4: 'Demigod level. Equivalent to 12 Maharathis — 8.6M warriors. Invulnerability frames. Global AoE abilities.',
    5: 'Supreme Deity. Infinite scaling. Cannot be meaningfully opposed by any mortal force.'
  };
  return desc[tier] || '';
}

const SIDDHI_DISPLAY: Record<string, { emoji: string; name: string }> = {
  ANIMA: { emoji: '🔬', name: 'Anima' },
  MAHIMA: { emoji: '🌌', name: 'Mahima' },
  GARIMA: { emoji: '⛰', name: 'Garima' },
  LAGHIMA: { emoji: '🪶', name: 'Laghima' },
  PRAPTI: { emoji: '🎯', name: 'Prapti' },
  PRAKAMYA: { emoji: '💭', name: 'Prakamya' },
  ISHATVA: { emoji: '👑', name: 'Ishatva' },
  VASITVA: { emoji: '🌀', name: 'Vasitva' },
};
