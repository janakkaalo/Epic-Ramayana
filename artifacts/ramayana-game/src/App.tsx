import PhaserGameComponent from "@/components/game/PhaserGameComponent";

/**
 * Epic Ramayana - Main Application
 * 2D Platformer based on Valmiki Ramayana (Bala & Ayodhya Kandas)
 */
export default function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <PhaserGameComponent />
    </div>
  );
}
