import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/game/store';

export default function MainMenu() {
  const store = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showLore, setShowLore] = useState(false);
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
    window.addEventListener('resize', resize);

    let t = 0;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; life: number }[] = [];

    const render = () => {
      t++;
      const W = canvas.width;
      const H = canvas.height;

      // Dark background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#050010');
      bg.addColorStop(0.5, '#100020');
      bg.addColorStop(1, '#050010');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (let i = 0; i < 150; i++) {
        const sx = ((i * 137.5 + t * 0.02) % W);
        const sy = ((i * 89.3) % H);
        const bright = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.01 + i * 0.5));
        ctx.fillStyle = `rgba(255,248,200,${bright * 0.7})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.7 + Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shooting stars
      if (t % 120 === 0) {
        particles.push({
          x: Math.random() * W,
          y: 0,
          vx: 3 + Math.random() * 2,
          vy: 2 + Math.random() * 2,
          size: 2,
          color: '#FFD700',
          life: 1
        });
      }

      // Divine light rays
      ctx.save();
      ctx.globalAlpha = 0.06 + 0.04 * Math.sin(t * 0.02);
      for (let r = 0; r < 12; r++) {
        const angle = (r / 12) * Math.PI * 2 + t * 0.002;
        const grad = ctx.createLinearGradient(
          W / 2, H / 2,
          W / 2 + Math.cos(angle) * W,
          H / 2 + Math.sin(angle) * H
        );
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(W / 2, H / 2);
        ctx.lineTo(
          W / 2 + Math.cos(angle - 0.1) * W * 2,
          H / 2 + Math.sin(angle - 0.1) * H * 2
        );
        ctx.lineTo(
          W / 2 + Math.cos(angle + 0.1) * W * 2,
          H / 2 + Math.sin(angle + 0.1) * H * 2
        );
        ctx.fill();
      }
      ctx.restore();

      // Orbiting particles
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 + t * 0.005;
        const r = 80 + 20 * Math.sin(t * 0.01 + i);
        const px = W / 2 + Math.cos(angle) * r;
        const py = H * 0.22 + Math.sin(angle) * r * 0.4;
        const bright = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.02 + i));
        ctx.fillStyle = `rgba(255,220,100,${bright})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rama silhouette
      drawRamaSilhouette(ctx, W / 2, H * 0.38, 70, t);

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.02;
        if (pt.life <= 0 || pt.x > W || pt.y > H) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = pt.life;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x - pt.vx * 8, pt.y - pt.vy * 8);
        ctx.stroke();
        ctx.restore();
      }

      // Decorative mandala border
      ctx.save();
      ctx.strokeStyle = 'rgba(180,130,0,0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, 250 + Math.sin(t * 0.01) * 5, angle, angle + Math.PI / 8);
        ctx.stroke();
      }
      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* Title */}
        <div className="text-center mb-2">
          <div
            className="text-sm tracking-widest uppercase mb-2"
            style={{ color: '#c8a000', fontFamily: 'serif', letterSpacing: '0.4em' }}
          >
            ॥ श्रीरामायणम् ॥
          </div>
          <h1
            className="text-7xl font-bold mb-1"
            style={{
              fontFamily: '"Palatino Linotype", Palatino, serif',
              background: 'linear-gradient(180deg, #FFE066 0%, #FFD700 40%, #C8860A 70%, #8B5E00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 20px rgba(255,200,0,0.4))'
            }}
          >
            RAMAYANA
          </h1>
          <div
            className="text-xl tracking-wide"
            style={{ color: '#d4a000', fontFamily: 'serif' }}
          >
            The Eternal Epic
          </div>
          <div
            className="text-sm mt-1 tracking-widest"
            style={{ color: '#8a6800', fontFamily: 'serif' }}
          >
            3D Action-RPG — Five Acts — One Dharma
          </div>
        </div>

        {/* Decorative separator */}
        <div className="flex items-center gap-4 my-6">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-yellow-700" />
          <div className="text-yellow-600 text-lg">◆</div>
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-yellow-700" />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-64">
          <button
            onClick={() => store.startGame()}
            className="relative group px-8 py-3 font-bold tracking-widest uppercase transition-all duration-200"
            style={{
              fontFamily: 'serif',
              background: 'linear-gradient(135deg, #1a0c00, #2d1500)',
              border: '2px solid #8B6914',
              color: '#FFD700',
              fontSize: '1rem',
              letterSpacing: '0.15em',
              boxShadow: '0 0 15px rgba(200,160,0,0.2), inset 0 1px 0 rgba(255,220,100,0.2)'
            }}
          >
            <span className="relative z-10">⚔ Begin Journey</span>
          </button>

          <button
            onClick={() => setShowLore(!showLore)}
            className="px-8 py-2.5 font-bold tracking-wider uppercase transition-all duration-200"
            style={{
              fontFamily: 'serif',
              background: 'transparent',
              border: '1px solid #5c4000',
              color: '#c8a000',
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
            }}
          >
            📜 Sacred Lore
          </button>

          <button
            onClick={() => store.setGameState('PLAYING')}
            className="px-8 py-2.5 font-bold tracking-wider uppercase transition-all duration-200"
            style={{
              fontFamily: 'serif',
              background: 'transparent',
              border: '1px solid #3a2800',
              color: '#8a6800',
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
            }}
          >
            ▶ Quick Play
          </button>
        </div>

        {/* Lore panel */}
        {showLore && (
          <div
            className="absolute inset-4 z-20 overflow-y-auto p-8 flex flex-col gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(5,0,15,0.97), rgba(15,8,0,0.97))',
              border: '1px solid #5c3800',
              color: '#d4a050'
            }}
          >
            <button
              onClick={() => setShowLore(false)}
              className="absolute top-4 right-4 text-yellow-600 hover:text-yellow-300 text-xl"
            >✕</button>
            
            <h2 className="text-2xl font-bold text-center" style={{ fontFamily: 'serif', color: '#FFD700' }}>
              The Ramayana
            </h2>
            <p className="text-sm text-yellow-800 text-center italic">Written by Sage Valmiki • 24,000 verses • 7 Kandas</p>
            
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#c8a050' }}>
              <p>
                The Ramayana is one of the greatest epics of ancient India, written by the sage Valmiki.
                It tells the story of Rama, the seventh avatar of Vishnu, born as a mortal prince to restore
                dharmic order to the cosmos.
              </p>
              <div>
                <h3 className="font-bold text-yellow-500 mb-1">The Seven Kandas</h3>
                <ul className="space-y-1 text-yellow-800">
                  <li>1. <strong className="text-yellow-600">Bala Kanda</strong> — Birth, education, and marriage</li>
                  <li>2. <strong className="text-yellow-600">Ayodhya Kanda</strong> — Exile from Ayodhya</li>
                  <li>3. <strong className="text-yellow-600">Aranya Kanda</strong> — Forest life and abduction</li>
                  <li>4. <strong className="text-yellow-600">Kishkindha Kanda</strong> — Alliance with Vanaras</li>
                  <li>5. <strong className="text-yellow-600">Sundara Kanda</strong> — Hanuman's journey</li>
                  <li>6. <strong className="text-yellow-600">Yuddha Kanda</strong> — The Great War</li>
                  <li>7. <strong className="text-yellow-600">Uttara Kanda</strong> — Epilogue</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-yellow-500 mb-1">Dharma — The Central Theme</h3>
                <p>
                  Rama is called Maryada Purushottam — the Supreme Person of Boundaries. Every decision
                  in the game affects your Dharma score, influencing divine power, ally effectiveness, and
                  the world's response to your actions.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-yellow-500 mb-1">Astras — Divine Weapons</h3>
                <p>
                  The divine Astras are invocations of cosmic forces — not mere physical weapons, but
                  mantras that summon elemental powers. The Brahmastra, when invoked with pure intent,
                  is unstoppable by any force in creation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom info */}
        <div
          className="absolute bottom-6 text-center text-xs"
          style={{ color: '#3a2800', fontFamily: 'serif' }}
        >
          WASD to move · SPACE to fire Astra · Defeat all enemies to complete each Act
        </div>
      </div>
    </div>
  );
}

function drawRamaSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number) {
  ctx.save();
  
  // Divine glow
  const glow = ctx.createRadialGradient(x, y - size * 0.5, size * 0.2, x, y - size * 0.5, size * 2);
  glow.addColorStop(0, 'rgba(255,220,80,0.2)');
  glow.addColorStop(0.5, 'rgba(255,180,0,0.05)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 2, 0, Math.PI * 2);
  ctx.fill();

  const silhouette = 'rgba(255,200,50,0.85)';
  ctx.fillStyle = silhouette;
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 20 + 5 * Math.sin(t * 0.03);

  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.28, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head with crown
  ctx.beginPath();
  ctx.arc(x, y - size * 0.65, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Crown
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.82);
  ctx.lineTo(x - size * 0.18, y - size * 1.05);
  ctx.lineTo(x - size * 0.06, y - size * 0.9);
  ctx.lineTo(x, y - size * 1.1);
  ctx.lineTo(x + size * 0.06, y - size * 0.9);
  ctx.lineTo(x + size * 0.18, y - size * 1.05);
  ctx.lineTo(x + size * 0.12, y - size * 0.82);
  ctx.fill();

  // Bow (raised)
  ctx.strokeStyle = silhouette;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.45, -Math.PI * 0.6, Math.PI * 0.6);
  ctx.stroke();

  // Arrow
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.2);
  ctx.lineTo(x + size * 0.75, y - size * 0.2);
  ctx.stroke();

  ctx.restore();
}
