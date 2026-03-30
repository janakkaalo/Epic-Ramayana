import { useEffect, useRef } from "react";
import {
  PhaserGame,
  initializeGame,
  destroyGame,
} from "@/game/phaser/PhaserGame";

/**
 * PhaserGameComponent - React component wrapper for Phaser game
 */
export default function PhaserGameComponent() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<PhaserGame | null>(null);

  useEffect(() => {
    // Initialize game when component mounts
    if (gameContainerRef.current && !gameInstanceRef.current) {
      gameInstanceRef.current = initializeGame(gameContainerRef.current);
      gameInstanceRef.current.start();
    }

    // Cleanup when component unmounts
    return () => {
      if (gameInstanceRef.current) {
        destroyGame();
        gameInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div
        ref={gameContainerRef}
        id="phaser-game"
        className="w-full h-full"
        style={{
          maxWidth: "1280px",
          maxHeight: "720px",
        }}
      />
    </div>
  );
}
