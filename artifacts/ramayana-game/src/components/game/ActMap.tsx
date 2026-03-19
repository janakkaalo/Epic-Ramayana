import { useGameStore } from '@/game/store';
import { ACT_INFO, LEVELS } from '@/game/levels';
import type { ActId } from '@/game/types';

export default function ActMap() {
  const store = useGameStore();
  const acts = Object.values(ACT_INFO);

  return (
    <div
      className="absolute inset-0 z-40 overflow-y-auto"
      style={{ background: 'linear-gradient(135deg, #020008, #08040010)' }}
    >
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-sm tracking-widest mb-2" style={{ color: '#5c3800', fontFamily: 'serif', letterSpacing: '0.4em' }}>
            ॥ रामायण ॥
          </div>
          <h2 className="text-4xl font-bold mb-2" style={{ color: '#FFD700', fontFamily: 'serif' }}>
            The Five Great Acts
          </h2>
          <p className="text-sm" style={{ color: '#5c4000' }}>
            Progress through the eternal story · Dharma Score: {store.dharmaScore}
          </p>
        </div>

        {/* Act Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-12 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, transparent, #3a2000, #5c3800, #3a2000, transparent)' }}
          />

          {acts.map((act, actIdx) => {
            const isCurrentAct = store.currentAct === act.id as ActId;
            const isPastAct = acts.indexOf(act) < acts.findIndex(a => a.id === store.currentAct);
            const actLevels = LEVELS.filter(l => l.actId === act.id as ActId);

            return (
              <div key={act.id} className="relative flex gap-6 mb-8">
                {/* Timeline dot */}
                <div className="relative flex-shrink-0 w-24 flex flex-col items-center">
                  <div
                    className="w-5 h-5 rounded-full border-2 transition-all duration-300"
                    style={{
                      background: isPastAct ? '#5c3800' : isCurrentAct ? act.color : '#111',
                      borderColor: isPastAct ? '#8B6914' : isCurrentAct ? act.color : '#3a2000',
                      boxShadow: isCurrentAct ? `0 0 15px ${act.color}66` : 'none'
                    }}
                  />
                  <div
                    className="text-center text-xs mt-1"
                    style={{ color: '#3a2000', fontSize: '0.6rem', fontFamily: 'serif' }}
                  >
                    {act.timelineDate}
                  </div>
                </div>

                {/* Act content */}
                <div className="flex-1">
                  <div
                    className="p-4 mb-3 transition-all duration-300"
                    style={{
                      background: isCurrentAct
                        ? `linear-gradient(135deg, rgba(20,10,0,0.9), rgba(${hexToRgb(act.color)},0.1))`
                        : 'linear-gradient(135deg, rgba(8,4,0,0.8), rgba(12,6,0,0.8))',
                      border: `1px solid ${isCurrentAct ? act.color + '66' : '#2a1500'}`,
                      borderLeft: `3px solid ${isCurrentAct ? act.color : isPastAct ? '#5c3800' : '#2a1500'}`,
                    }}
                  >
                    {/* Act header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-xs mb-0.5" style={{ color: '#5c4000', fontFamily: 'serif' }}>
                          {act.id.replace('ACT', 'Act ')}
                        </div>
                        <h3
                          className="text-xl font-bold"
                          style={{ color: isCurrentAct ? act.color : '#8a6000', fontFamily: 'serif' }}
                        >
                          {act.name}
                        </h3>
                        <div className="text-sm" style={{ color: '#5c4000' }}>
                          {act.subtitle}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs" style={{ color: '#3a2500' }}>📍 {act.location}</div>
                        {isCurrentAct && (
                          <div
                            className="text-xs px-2 py-0.5 mt-1 font-bold"
                            style={{ background: `${act.color}22`, border: `1px solid ${act.color}44`, color: act.color }}
                          >
                            ▶ CURRENT
                          </div>
                        )}
                        {isPastAct && (
                          <div className="text-xs mt-1" style={{ color: '#5c4000' }}>✓ Complete</div>
                        )}
                      </div>
                    </div>

                    {/* Levels */}
                    {(isCurrentAct || isPastAct) && (
                      <div className="space-y-2 mt-3">
                        {actLevels.map((level, lvlIdx) => {
                          const isCompleted = store.completedLevels.includes(level.id);
                          const isCurrent = isCurrentAct && lvlIdx === store.currentLevelIndex;
                          const isLocked = isCurrentAct && lvlIdx > store.currentLevelIndex && !isCompleted;

                          return (
                            <div
                              key={level.id}
                              className="flex items-center gap-3 p-2 cursor-pointer transition-all"
                              style={{
                                background: isCurrent ? 'rgba(40,20,0,0.6)' : 'rgba(10,5,0,0.4)',
                                border: `1px solid ${isCurrent ? act.color + '44' : '#1a0a00'}`,
                                opacity: isLocked ? 0.4 : 1
                              }}
                              onClick={() => {
                                if (!isLocked) {
                                  store.startLevel(level.id);
                                }
                              }}
                            >
                              <div
                                className="w-6 h-6 flex items-center justify-center text-xs flex-shrink-0"
                                style={{
                                  background: isCompleted ? '#2a1800' : isCurrent ? 'rgba(100,60,0,0.4)' : '#0a0500',
                                  border: `1px solid ${isCompleted ? '#5c3800' : isCurrent ? act.color + '88' : '#1a0a00'}`,
                                  color: isCompleted ? '#8B6914' : isCurrent ? act.color : '#3a2000'
                                }}
                              >
                                {isCompleted ? '✓' : isCurrent ? '▶' : isLocked ? '🔒' : `${lvlIdx + 1}`}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className="text-sm font-bold truncate"
                                  style={{ color: isCurrent ? act.color : isCompleted ? '#8a6000' : '#5a4000', fontFamily: 'serif' }}
                                >
                                  {level.name}
                                </div>
                                <div className="text-xs truncate" style={{ color: '#3a2000' }}>
                                  {level.location}
                                </div>
                              </div>
                              {level.bossId && (
                                <div
                                  className="text-xs px-1.5 py-0.5 flex-shrink-0"
                                  style={{
                                    background: 'rgba(80,0,0,0.4)',
                                    border: '1px solid #4a0000',
                                    color: store.defeatedBosses.includes(level.bossId) ? '#5c4000' : '#CC4444',
                                    fontSize: '0.65rem'
                                  }}
                                >
                                  {store.defeatedBosses.includes(level.bossId) ? '✓ Boss' : '⚔ BOSS'}
                                </div>
                              )}
                              {level.completionReward && (
                                <div className="text-xs flex-shrink-0" style={{ color: '#5c3800' }}>
                                  {level.completionReward.astra ? '🔮' : ''}
                                  {level.completionReward.dharma ? ` +${level.completionReward.dharma}⚖` : ''}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Advance act button */}
                    {isCurrentAct && actLevels.every(l => store.completedLevels.includes(l.id)) && (
                      <button
                        onClick={() => store.advanceAct()}
                        className="w-full mt-3 py-2 text-sm font-bold tracking-wider transition-all"
                        style={{
                          background: `${act.color}22`,
                          border: `1px solid ${act.color}66`,
                          color: act.color,
                          fontFamily: 'serif'
                        }}
                      >
                        ▶ Advance to Next Kanda
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back button */}
        <div className="text-center mt-4">
          <button
            onClick={() => store.setGameState('PLAYING')}
            className="px-8 py-3 font-bold tracking-wider uppercase transition-all"
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

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
    : '200,160,0';
}
