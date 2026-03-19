import { useState } from 'react';
import { useGameStore } from '@/game/store';
import MainMenu from '@/components/game/MainMenu';
import GameCanvas from '@/components/game/GameCanvas';
import HUD from '@/components/game/HUD';
import CutscenePanel from '@/components/game/CutscenePanel';
import ActMap from '@/components/game/ActMap';
import CharacterScreen from '@/components/game/CharacterScreen';
import VictoryScreen from '@/components/game/VictoryScreen';
import Navbar from '@/components/game/Navbar';

type Screen = 'game' | 'map' | 'characters';

export default function App() {
  const store = useGameStore();
  const [screen, setScreen] = useState<Screen>('game');

  const { gameState } = store;

  // Main menu
  if (gameState === 'MENU') {
    return (
      <div className="w-screen h-screen overflow-hidden" style={{ background: '#000' }}>
        <MainMenu />
      </div>
    );
  }

  // Victory screen
  if (gameState === 'VICTORY') {
    return (
      <div className="w-screen h-screen overflow-hidden" style={{ background: '#000' }}>
        <VictoryScreen />
      </div>
    );
  }

  // Main game layout
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#000' }}>
      {/* Navbar always visible during gameplay */}
      <Navbar currentScreen={screen} onScreenChange={setScreen} />

      {/* Main game canvas */}
      {screen === 'game' && (
        <>
          <GameCanvas />
          <HUD />
          <CutscenePanel />
        </>
      )}

      {/* Journey map screen */}
      {screen === 'map' && <ActMap />}

      {/* Character codex screen */}
      {screen === 'characters' && <CharacterScreen />}

      {/* Cutscene overlays on any screen when triggered */}
      {screen !== 'game' && store.showCutscene && (
        <CutscenePanel />
      )}
    </div>
  );
}
