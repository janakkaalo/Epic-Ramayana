import { useEffect, useRef } from 'react';
import { useGameStore } from '@/game/store';

export default function VictoryScreen() {
  const store = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    let t = 0;
    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; life: number }[] = [];

    const spawnFirework = () => {
      const colors = ['#FFD700', '#FF6B00', '#FF0000', '#FFFFFF', '#FF69B4', '#00BFFF'];
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height * 0.6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color, size: 2 + Math.random() * 3,
          life: 1
        });
      }
    };

    const render = () => {
      t++;
      const W = canvas.width;
      const H = canvas.height;

      ctx.fillStyle = 'rgba(0,0,5,0.15)';
      ctx.fillRect(0, 0, W, H);

      if (t % 45 === 0) spawnFirework();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.life -= 0.015;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="absolute inset-0 z-50 overflow-hidden" style={{ background: '#000' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
        <div className="text-sm tracking-widest mb-4" style={{ color: '#c8a000', fontFamily: 'serif', letterSpacing: '0.5em' }}>
          ॥ जय श्री राम ॥
        </div>
        
        <h1
          className="text-6xl font-bold mb-4"
          style={{
            fontFamily: '"Palatino Linotype", Palatino, serif',
            background: 'linear-gradient(180deg, #FFE066, #FFD700, #C8860A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 30px rgba(255,200,0,0.5))'
          }}
        >
          Rama Rajya
        </h1>
        
        <p className="text-xl mb-2" style={{ color: '#d4a050', fontFamily: 'serif' }}>
          Dharma has triumphed. Ravana is slain.
        </p>
        <p className="text-base mb-8 max-w-2xl leading-relaxed" style={{ color: '#8a6030', fontFamily: 'serif' }}>
          Sita is restored to Rama. The fourteen years of exile have ended. 
          The people of Ayodhya rejoice as their beloved prince returns to establish 
          the perfect kingdom — Rama Rajya — an age of righteousness and justice 
          that shall echo through eternity.
        </p>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <Stat label="Dharma Score" value={store.dharmaScore} max={100} />
          <Stat label="Bosses Defeated" value={store.defeatedBosses.length} max={8} />
          <Stat label="Astras Unlocked" value={store.unlockedAstras.length} max={8} />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => store.resetGame()}
            className="px-8 py-3 font-bold tracking-wider uppercase transition-all"
            style={{
              background: 'rgba(40,20,0,0.8)',
              border: '2px solid #8B6914',
              color: '#FFD700',
              fontFamily: 'serif',
              letterSpacing: '0.15em'
            }}
          >
            ↺ Play Again
          </button>
          <button
            onClick={() => store.setGameState('PLAYING')}
            className="px-8 py-3 font-bold tracking-wider uppercase transition-all"
            style={{
              background: 'rgba(20,10,0,0.8)',
              border: '1px solid #5c3800',
              color: '#c8a000',
              fontFamily: 'serif',
              letterSpacing: '0.15em'
            }}
          >
            ◈ Free Roam Epilogue
          </button>
        </div>

        <div className="mt-8 text-xs" style={{ color: '#3a2800', fontFamily: 'serif', maxWidth: 500 }}>
          "Where dharma is, there is victory. Where there is devotion, there is Rama."
          <br />— Valmiki Ramayana
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div
      className="p-4 text-center"
      style={{
        background: 'rgba(20,10,0,0.7)',
        border: '1px solid #5c3800'
      }}
    >
      <div className="text-3xl font-bold mb-1" style={{ color: '#FFD700', fontFamily: 'serif' }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: '#5c4000' }}>{label}</div>
      <div className="text-xs mt-1" style={{ color: '#3a2800' }}>/ {max}</div>
    </div>
  );
}
