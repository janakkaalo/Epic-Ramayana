import { useGameStore } from '@/game/store';
import { CHARACTERS } from '@/game/characters';
import type { AstraId, SiddhiId } from '@/game/types';

const ASTRA_ICONS: Record<AstraId, string> = {
  BRAHMASTRA: '✦',
  AGNEYASTRA: '🔥',
  VARUNASTRA: '💧',
  VAYAVYASTRA: '🌀',
  NAGASTRA: '🐍',
  PASHUPATASTRA: '☄',
  NARAYAN_ASTRA: '⚡',
  MOHINI_ASTRA: '💜',
  BAJRANG_ASTRA: '💥',
};

const ASTRA_COLORS: Record<AstraId, string> = {
  BRAHMASTRA: '#FFD700',
  AGNEYASTRA: '#FF4500',
  VARUNASTRA: '#00BFFF',
  VAYAVYASTRA: '#E0E0E0',
  NAGASTRA: '#32CD32',
  PASHUPATASTRA: '#9400D3',
  NARAYAN_ASTRA: '#00FF7F',
  MOHINI_ASTRA: '#FF69B4',
  BAJRANG_ASTRA: '#FF8C00',
};

const SIDDHI_ICONS: Record<SiddhiId, string> = {
  ANIMA: '🔬',
  MAHIMA: '🌌',
  GARIMA: '⛰',
  LAGHIMA: '🪶',
  PRAPTI: '🎯',
  PRAKAMYA: '💭',
  ISHATVA: '👑',
  VASITVA: '🌀',
};

export default function HUD() {
  const store = useGameStore();
  const { player, activeCharacter, dharmaScore, karmaWeight, isBossFight, bossHp, bossMaxHp, bossName } = store;

  const hpPct = (player.hp / player.maxHp) * 100;
  const manaPct = (player.mana / player.maxMana) * 100;
  const dharmaPct = Math.max(0, Math.min(100, dharmaScore));

  const hpColor = hpPct > 60 ? '#00CC44' : hpPct > 30 ? '#FFAA00' : '#FF2200';
  const manaColor = '#4488FF';

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top left: Player stats */}
      <div
        className="absolute top-3 left-3 pointer-events-auto"
        style={{ minWidth: 220 }}
      >
        {/* Character Portrait */}
        <div
          className="flex items-center gap-2 mb-2 p-2"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.85), rgba(10,5,0,0.85))',
            border: '1px solid #5c3800',
            borderRadius: 4
          }}
        >
          <CharacterPortrait character={activeCharacter} />
          <div className="flex-1 min-w-0">
            <div
              className="font-bold text-sm truncate"
              style={{ color: '#FFD700', fontFamily: 'serif' }}
            >
              {player.name}
            </div>
            <div
              className="text-xs truncate"
              style={{ color: '#8a6000' }}
            >
              {player.title}
            </div>
            <div className="text-xs" style={{ color: '#AA4400' }}>
              Tier {player.tier} • {getTierName(player.tier)}
            </div>
          </div>
        </div>

        {/* HP Bar */}
        <StatBar label="HP" current={player.hp} max={player.maxHp} color={hpColor} icon="❤" />

        {/* Mana Bar */}
        <StatBar label="MP" current={player.mana} max={player.maxMana} color={manaColor} icon="✦" />
      </div>

      {/* Top center: Act title */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-center">
        <div
          className="px-4 py-1 text-sm font-bold tracking-wider"
          style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid #3a2000',
            color: '#c8a000',
            fontFamily: 'serif'
          }}
        >
          {getActName(store.currentAct)}
        </div>
      </div>

      {/* Top right: Dharma & character switch */}
      <div className="absolute top-3 right-3">
        <div
          className="p-2 mb-2"
          style={{
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid #3a2000',
            minWidth: 160
          }}
        >
          <div className="text-xs font-bold mb-1" style={{ color: '#FFD700', fontFamily: 'serif' }}>
            ◆ Dharma Scale
          </div>
          <div className="relative h-3 rounded overflow-hidden" style={{ background: '#111' }}>
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${dharmaPct}%`,
                background: `linear-gradient(90deg, #AA0000, #FFAA00, #00CC44)`,
                backgroundSize: '300% 100%',
                backgroundPosition: `${dharmaPct}% 50%`
              }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1" style={{ color: '#8a6000' }}>
            <span>Adharma</span>
            <span className="font-bold" style={{ color: '#FFD700' }}>{dharmaScore}</span>
            <span>Dharma</span>
          </div>
          {karmaWeight > 0 && (
            <div className="text-xs mt-1" style={{ color: '#AA4400' }}>
              ⚖ Karma Weight: {karmaWeight}
            </div>
          )}
        </div>

        {/* Character Switch */}
        <div
          className="p-2 pointer-events-auto"
          style={{
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid #3a2000',
          }}
        >
          <div className="text-xs font-bold mb-1" style={{ color: '#8a6000' }}>Switch Hero</div>
          <div className="flex gap-1">
            {(['RAMA', 'LAKSHMANA', 'HANUMAN'] as const).map(char => (
              <button
                key={char}
                onClick={() => store.switchCharacter(char)}
                className="text-xs px-2 py-1 transition-all"
                style={{
                  background: activeCharacter === char ? 'rgba(120,80,0,0.6)' : 'rgba(20,10,0,0.6)',
                  border: activeCharacter === char ? '1px solid #FFD700' : '1px solid #3a2000',
                  color: activeCharacter === char ? '#FFD700' : '#8a6000',
                  borderRadius: 2,
                  fontFamily: 'serif',
                  fontSize: '0.7rem'
                }}
              >
                {char === 'RAMA' ? '🏹' : char === 'HANUMAN' ? '🐒' : '⚔'} {char.slice(0, 4)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Boss HP Bar */}
      {isBossFight && bossMaxHp > 0 && (
        <div
          className="absolute bottom-32 left-1/2 transform -translate-x-1/2"
          style={{ width: 400, maxWidth: '90vw' }}
        >
          <div
            className="p-3"
            style={{
              background: 'linear-gradient(135deg, rgba(40,0,0,0.95), rgba(20,0,0,0.95))',
              border: '2px solid #CC0000',
              boxShadow: '0 0 20px rgba(200,0,0,0.3)'
            }}
          >
            <div
              className="text-center font-bold mb-2 tracking-wide"
              style={{ color: '#FF4444', fontFamily: 'serif', fontSize: '1rem' }}
            >
              ⚔ {bossName} ⚔
            </div>
            <div className="relative h-5 rounded overflow-hidden" style={{ background: '#1a0000' }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${(bossHp / bossMaxHp) * 100}%`,
                  background: 'linear-gradient(90deg, #AA0000, #FF2200, #FF6600)',
                  boxShadow: '0 0 10px #FF2200'
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                style={{ color: '#FFD700' }}
              >
                {bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom: Astra/Siddhi bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(10,5,0,0.9))',
            border: '1px solid #3a2000',
          }}
        >
          {/* Astras */}
          <div className="text-xs font-bold mr-1" style={{ color: '#8a6000', fontFamily: 'serif' }}>ASTRAS</div>
          {store.unlockedAstras.slice(0, 6).map((astra, i) => (
            <button
              key={astra}
              onClick={() => store.selectAstra(store.selectedAstra === astra ? null : astra)}
              className="relative w-10 h-10 flex flex-col items-center justify-center transition-all"
              style={{
                background: store.selectedAstra === astra ? `${ASTRA_COLORS[astra]}33` : 'rgba(20,10,0,0.8)',
                border: store.selectedAstra === astra ? `2px solid ${ASTRA_COLORS[astra]}` : '1px solid #3a2000',
                borderRadius: 3
              }}
              title={astra}
            >
              <span className="text-base leading-none">{ASTRA_ICONS[astra]}</span>
              <span className="text-xs" style={{ color: '#5a3800', fontSize: '0.55rem' }}>
                {i + 1}
              </span>
            </button>
          ))}

          {/* Divider for Siddhis */}
          {store.unlockedSiddhis.length > 0 && (
            <>
              <div className="w-px h-8 mx-1" style={{ background: '#3a2000' }} />
              <div className="text-xs font-bold mr-1" style={{ color: '#8a6000', fontFamily: 'serif' }}>SIDDHIS</div>
              {store.unlockedSiddhis.slice(0, 4).map((siddhi) => (
                <button
                  key={siddhi}
                  onClick={() => store.activateSiddhi(store.activeSiddhi === siddhi ? null : siddhi)}
                  className="w-10 h-10 flex flex-col items-center justify-center transition-all"
                  style={{
                    background: store.activeSiddhi === siddhi ? 'rgba(255,140,0,0.25)' : 'rgba(20,10,0,0.8)',
                    border: store.activeSiddhi === siddhi ? '2px solid #FF8C00' : '1px solid #3a2000',
                    borderRadius: 3
                  }}
                  title={siddhi}
                >
                  <span className="text-base leading-none">{SIDDHI_ICONS[siddhi]}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Game Over overlay */}
      {store.gameState === 'GAME_OVER' && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
          style={{ background: 'rgba(0,0,0,0.85)' }}
        >
          <div className="text-center">
            <div className="text-6xl font-bold mb-4" style={{ color: '#CC0000', fontFamily: 'serif' }}>
              Dharma Fallen
            </div>
            <p className="text-lg mb-8" style={{ color: '#8a6000' }}>
              The path of righteousness demands sacrifice and perseverance.
            </p>
            <button
              onClick={() => store.resetGame()}
              className="px-8 py-3 font-bold tracking-widest uppercase"
              style={{
                background: 'rgba(40,0,0,0.8)',
                border: '2px solid #CC0000',
                color: '#FFD700',
                fontFamily: 'serif'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, current, max, color, icon }: {
  label: string; current: number; max: number; color: string; icon: string;
}) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div
      className="flex items-center gap-2 px-2 py-1 mb-1"
      style={{
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid #2a1500'
      }}
    >
      <span className="text-xs" style={{ color }}>{icon}</span>
      <div className="flex-1">
        <div className="relative h-2.5 rounded overflow-hidden" style={{ background: '#111' }}>
          <div
            className="h-full transition-all duration-200 rounded"
            style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}66` }}
          />
        </div>
      </div>
      <span className="text-xs font-mono" style={{ color: '#8a6000', minWidth: 60, textAlign: 'right' }}>
        {current.toLocaleString()}
      </span>
    </div>
  );
}

function CharacterPortrait({ character }: { character: 'RAMA' | 'HANUMAN' | 'LAKSHMANA' }) {
  const colors = {
    RAMA: { bg: '#1a0c00', accent: '#4488FF', icon: '🏹' },
    HANUMAN: { bg: '#1a0800', accent: '#FF8C00', icon: '🐒' },
    LAKSHMANA: { bg: '#001a00', accent: '#44BB44', icon: '⚔' },
  };
  const { bg, accent, icon } = colors[character];
  return (
    <div
      className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
      style={{
        background: bg,
        border: `2px solid ${accent}`,
        boxShadow: `0 0 8px ${accent}44`
      }}
    >
      {icon}
    </div>
  );
}

function getTierName(tier: number): string {
  const names = ['', 'Rathi', 'Atirathi', 'Maharathi', 'Atimaharathi', 'Mahamaharathi'];
  return names[tier] || '';
}

function getActName(act: string): string {
  const names: Record<string, string> = {
    ACT1: 'Act I — Bala Kanda',
    ACT2: 'Act II — Aranya Kanda',
    ACT3: 'Act III — Kishkindha Kanda',
    ACT4: 'Act IV — Sundara Kanda',
    ACT5: 'Act V — Yuddha Kanda',
  };
  return names[act] || act;
}
