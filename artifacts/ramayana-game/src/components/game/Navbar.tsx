import { useState } from 'react';
import { useGameStore } from '@/game/store';

type Screen = 'game' | 'map' | 'characters';

interface NavbarProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function Navbar({ currentScreen, onScreenChange }: NavbarProps) {
  const store = useGameStore();
  const [showPause, setShowPause] = useState(false);

  const navItems = [
    { id: 'game' as Screen, label: '⚔ Battle', icon: '⚔' },
    { id: 'map' as Screen, label: '📜 Journey', icon: '📜' },
    { id: 'characters' as Screen, label: '👤 Codex', icon: '👤' },
  ];

  return (
    <>
      {/* Top navbar */}
      <div
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)',
          pointerEvents: 'auto'
        }}
      >
        {/* Game nav tabs */}
        <div className="flex gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className="px-3 py-1 text-xs font-bold tracking-wider transition-all"
              style={{
                background: currentScreen === item.id ? 'rgba(100,60,0,0.6)' : 'rgba(10,5,0,0.5)',
                border: currentScreen === item.id ? '1px solid #8B6914' : '1px solid #1a0a00',
                color: currentScreen === item.id ? '#FFD700' : '#5a4000',
                fontFamily: 'serif',
                letterSpacing: '0.1em'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Center: Game title */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 text-sm font-bold tracking-widest"
          style={{ color: '#3a2800', fontFamily: 'serif', letterSpacing: '0.3em' }}
        >
          RAMAYANA
        </div>

        {/* Right: Menu */}
        <div className="flex items-center gap-3">
          <div className="text-xs" style={{ color: '#3a2800', fontFamily: 'serif' }}>
            ⚖ {store.dharmaScore}
          </div>
          <button
            onClick={() => setShowPause(!showPause)}
            className="w-7 h-7 flex items-center justify-center text-xs transition-all"
            style={{
              background: 'rgba(20,10,0,0.6)',
              border: '1px solid #2a1500',
              color: '#5a4000'
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Pause menu */}
      {showPause && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.8)' }}
        >
          <div
            className="p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(5,2,0,0.98), rgba(10,5,0,0.98))',
              border: '1px solid #5c3800',
              minWidth: 280
            }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color: '#FFD700', fontFamily: 'serif' }}>
              Paused
            </div>
            <div className="text-xs mb-6" style={{ color: '#5c4000' }}>
              The dharmic path awaits your return
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowPause(false)}
                className="w-full py-2.5 font-bold tracking-wider"
                style={{
                  background: 'rgba(80,45,0,0.6)',
                  border: '1px solid #8B6914',
                  color: '#FFD700',
                  fontFamily: 'serif'
                }}
              >
                ▶ Resume
              </button>
              <button
                onClick={() => { setShowPause(false); onScreenChange('map'); }}
                className="w-full py-2.5 font-bold tracking-wider"
                style={{
                  background: 'transparent',
                  border: '1px solid #3a2000',
                  color: '#8a6000',
                  fontFamily: 'serif'
                }}
              >
                📜 Journey Map
              </button>
              <button
                onClick={() => { setShowPause(false); onScreenChange('characters'); }}
                className="w-full py-2.5 font-bold tracking-wider"
                style={{
                  background: 'transparent',
                  border: '1px solid #3a2000',
                  color: '#8a6000',
                  fontFamily: 'serif'
                }}
              >
                👤 Character Codex
              </button>
              <div className="border-t my-2" style={{ borderColor: '#2a1500' }} />
              <button
                onClick={() => { store.resetGame(); setShowPause(false); }}
                className="w-full py-2 font-bold tracking-wider text-sm"
                style={{
                  background: 'transparent',
                  border: '1px solid #2a0000',
                  color: '#4a2000',
                  fontFamily: 'serif'
                }}
              >
                ↩ Return to Menu
              </button>
            </div>

            <div className="mt-6 text-xs" style={{ color: '#2a1800', fontFamily: 'serif' }}>
              "Na hi kaschit kshanam api jatu tishthatyakarmakrit"<br/>
              <em>No one can remain without action even for a moment.</em>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
