import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/game/store';
import type { CharacterId } from '@/game/types';
import { CHARACTERS } from '@/game/characters';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Entity {
  x: number;
  y: number;
  z: number;
  id: string;
  type: 'player' | 'enemy' | 'boss' | 'projectile' | 'astra';
  hp: number;
  maxHp: number;
  name?: string;
  color: string;
  size: number;
  vx: number;
  vz: number;
  state: string;
  characterId?: CharacterId;
}

interface AstraProjectile {
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  id: string;
  type: string;
  color: string;
  damage: number;
  life: number;
}

const ASTRA_CONFIGS = {
  BRAHMASTRA: { color: '#FFD700', damage: 2000, radius: 80, name: 'Brahmastra' },
  AGNEYASTRA: { color: '#FF4500', damage: 800, radius: 40, name: 'Agneyastra' },
  VARUNASTRA: { color: '#00BFFF', damage: 600, radius: 50, name: 'Varunastra' },
  VAYAVYASTRA: { color: '#E0E0E0', damage: 700, radius: 45, name: 'Vayavyastra' },
  PASHUPATASTRA: { color: '#9400D3', damage: 1500, radius: 70, name: 'Pashupatastra' },
  NARAYAN_ASTRA: { color: '#00FF7F', damage: 1200, radius: 60, name: 'Narayan Astra' },
  MOHINI_ASTRA: { color: '#FF69B4', damage: 900, radius: 55, name: 'Mohini Astra' },
  BAJRANG_ASTRA: { color: '#FF8C00', damage: 1100, radius: 65, name: 'Bajrang Astra' },
};

const ENV_COLORS = {
  AYODHYA: { bg: 'linear-gradient(180deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)', ground: '#8B7355', accent: '#FFD700' },
  DANDAKA: { bg: 'linear-gradient(180deg, #0d1b0d 0%, #1a2e1a 50%, #0d2b0d 100%)', ground: '#2d4a1e', accent: '#50c878' },
  KISHKINDHA: { bg: 'linear-gradient(180deg, #1a0e00 0%, #2d1800 50%, #1a0e00 100%)', ground: '#8B6914', accent: '#CD853F' },
  LANKA: { bg: 'linear-gradient(180deg, #1a0000 0%, #2d0000 50%, #1a0000 100%)', ground: '#4a0000', accent: '#FFD700' },
  OCEAN: { bg: 'linear-gradient(180deg, #000633 0%, #001a66 50%, #002080 100%)', ground: '#001f5c', accent: '#40E0D0' },
  BATTLEFIELD: { bg: 'linear-gradient(180deg, #200000 0%, #400000 50%, #200000 100%)', ground: '#3d1c00', accent: '#FF4500' },
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const entitiesRef = useRef<Entity[]>([]);
  const astrasRef = useRef<AstraProjectile[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const playerRef = useRef({ x: 0, z: 0, facing: 0, shootCooldown: 0, invincible: 0 });
  const cameraRef = useRef({ x: 0, z: 0, zoom: 1 });
  const timeRef = useRef(0);
  const [envType, setEnvType] = useState<keyof typeof ENV_COLORS>('AYODHYA');
  const [showControls, setShowControls] = useState(true);

  const store = useGameStore();

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 12, speed = 4) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()),
        life: 1,
        maxLife: 1,
        color,
        size: 2 + Math.random() * 4
      });
    }
  }, []);

  const spawnBossParticles = useCallback((x: number, y: number, color: string) => {
    spawnParticles(x, y, color, 40, 10);
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 30 + Math.random() * 60;
      particlesRef.current.push({
        x: x + Math.cos(angle) * r,
        y: y + Math.sin(angle) * r,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2 - 3,
        life: 1,
        maxLife: 1,
        color,
        size: 3 + Math.random() * 6
      });
    }
  }, [spawnParticles]);

  useEffect(() => {
    const currentAct = store.currentAct;
    const envMap: Record<string, keyof typeof ENV_COLORS> = {
      ACT1: 'AYODHYA',
      ACT2: 'DANDAKA',
      ACT3: 'KISHKINDHA',
      ACT4: 'LANKA',
      ACT5: 'BATTLEFIELD',
    };
    setEnvType(envMap[currentAct] || 'AYODHYA');
  }, [store.currentAct]);

  useEffect(() => {
    if (store.gameState !== 'PLAYING') return;

    const levelEnemyMap: Record<string, { id: string; characterId: CharacterId; x: number; z: number; isBoss: boolean }[]> = {
      ACT1: [
        { id: 'tataka', characterId: 'TATAKA', x: 200, z: -150, isBoss: true }
      ],
      ACT2: [
        { id: 'khara', characterId: 'KHARA', x: 180, z: -120, isBoss: false },
        { id: 'dushana', characterId: 'DUSHANA', x: -150, z: -100, isBoss: false },
        { id: 'maricha', characterId: 'MARICHA', x: 100, z: -180, isBoss: false }
      ],
      ACT3: [
        { id: 'vali', characterId: 'VALI', x: 0, z: -200, isBoss: true }
      ],
      ACT4: [],
      ACT5: [
        { id: 'indrajit', characterId: 'INDRAJIT', x: 100, z: -160, isBoss: false },
        { id: 'kumbhakarna', characterId: 'KUMBHAKARNA', x: -100, z: -200, isBoss: true },
        { id: 'ravana', characterId: 'RAVANA', x: 0, z: -250, isBoss: true }
      ]
    };

    const currentEnemies = levelEnemyMap[store.currentAct] || [];
    entitiesRef.current = currentEnemies
      .filter(e => !store.defeatedBosses.includes(e.characterId))
      .map(e => {
        const char = CHARACTERS[e.characterId];
        return {
          x: e.x,
          y: 0,
          z: e.z,
          id: e.id,
          type: e.isBoss ? 'boss' : 'enemy',
          hp: char.hp,
          maxHp: char.maxHp,
          name: char.name,
          color: e.isBoss ? '#FF2200' : '#CC4400',
          size: e.isBoss ? 28 : 18,
          vx: 0,
          vz: 0,
          state: 'PATROL',
          characterId: e.characterId
        };
      });
    
    playerRef.current = { x: 0, z: 50, facing: 0, shootCooldown: 0, invincible: 0 };
  }, [store.gameState, store.currentAct, store.defeatedBosses]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.type === 'keydown') keysRef.current.add(e.key.toLowerCase());
      if (e.type === 'keyup') keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);

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

    const SPEED = 3;
    let lastDamageTime = 0;

    const render = (timestamp: number) => {
      timeRef.current = timestamp;
      const dt = 1;
      const W = canvas.width;
      const H = canvas.height;

      if (store.gameState !== 'PLAYING') {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        animRef.current = requestAnimationFrame(render);
        return;
      }

      const env = ENV_COLORS[envType];
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      const bgParts = env.bg.match(/\d+ \d+% \d+%/g) || [];
      grad.addColorStop(0, '#000820');
      grad.addColorStop(0.5, '#001040');
      grad.addColorStop(1, '#000820');

      // Environment background
      const envGrad = ctx.createLinearGradient(0, 0, 0, H * 0.7);
      envGrad.addColorStop(0, bgParts[0] ? '#000820' : '#0a0a1a');
      envGrad.addColorStop(1, bgParts[1] ? '#001040' : '#1a0a0a');
      ctx.fillStyle = env.bg;

      // Draw background as CSS gradient approximation
      const bgImg = new Image();
      ctx.save();
      
      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
      if (envType === 'AYODHYA') {
        sky.addColorStop(0, '#0a0520');
        sky.addColorStop(1, '#1a1060');
      } else if (envType === 'DANDAKA') {
        sky.addColorStop(0, '#010d01');
        sky.addColorStop(1, '#0a1f0a');
      } else if (envType === 'KISHKINDHA') {
        sky.addColorStop(0, '#100700');
        sky.addColorStop(1, '#201200');
      } else if (envType === 'LANKA') {
        sky.addColorStop(0, '#0f0000');
        sky.addColorStop(1, '#1f0000');
      } else if (envType === 'OCEAN') {
        sky.addColorStop(0, '#000211');
        sky.addColorStop(1, '#000a3d');
      } else {
        sky.addColorStop(0, '#100000');
        sky.addColorStop(1, '#1f0000');
      }
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (let i = 0; i < 80; i++) {
        const sx = ((i * 137.5 + timestamp * 0.01) % W);
        const sy = ((i * 73.1) % (H * 0.6));
        const brightness = 0.4 + 0.6 * Math.abs(Math.sin(timestamp * 0.001 + i));
        ctx.fillStyle = `rgba(255,255,220,${brightness * 0.8})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground
      const ground = ctx.createLinearGradient(0, H * 0.55, 0, H);
      ground.addColorStop(0, env.ground);
      ground.addColorStop(1, '#000');
      ctx.fillStyle = ground;
      ctx.fillRect(0, H * 0.55, W, H * 0.45);

      // Environment decorations
      drawEnvironment(ctx, W, H, envType, timestamp, env.accent);

      // Grid lines on ground for depth
      ctx.strokeStyle = `${env.accent}22`;
      ctx.lineWidth = 1;
      for (let gz = -300; gz < 300; gz += 60) {
        const gy = worldToScreen(0, gz, W, H);
        ctx.beginPath();
        ctx.moveTo(0, gy.sy);
        ctx.lineTo(W, gy.sy);
        ctx.stroke();
      }

      ctx.restore();

      // Player input
      const p = playerRef.current;
      const keys = keysRef.current;
      let moved = false;

      if (keys.has('arrowleft') || keys.has('a')) { p.x -= SPEED; p.facing = Math.PI; moved = true; }
      if (keys.has('arrowright') || keys.has('d')) { p.x += SPEED; p.facing = 0; moved = true; }
      if (keys.has('arrowup') || keys.has('w')) { p.z -= SPEED; moved = true; }
      if (keys.has('arrowdown') || keys.has('s')) { p.z += SPEED; moved = true; }

      p.x = Math.max(-300, Math.min(300, p.x));
      p.z = Math.max(-250, Math.min(100, p.z));

      if (p.shootCooldown > 0) p.shootCooldown--;
      if (p.invincible > 0) p.invincible--;

      // Shoot
      if ((keys.has(' ') || keys.has('f')) && p.shootCooldown <= 0) {
        p.shootCooldown = 20;
        const selectedAstra = store.selectedAstra || 'AGNEYASTRA';
        const astraConfig = ASTRA_CONFIGS[selectedAstra as keyof typeof ASTRA_CONFIGS] || ASTRA_CONFIGS.AGNEYASTRA;
        
        // Find nearest enemy
        let nearestEnemy = entitiesRef.current.find(e => e.hp > 0);
        let aimVx = 0, aimVz = -8;
        if (nearestEnemy) {
          const dx = nearestEnemy.x - p.x;
          const dz = nearestEnemy.z - p.z;
          const dist = Math.sqrt(dx*dx + dz*dz);
          aimVx = (dx / dist) * 8;
          aimVz = (dz / dist) * 8;
          p.facing = Math.atan2(dx, -dz);
        }

        astrasRef.current.push({
          x: p.x, y: 0, z: p.z,
          vx: aimVx, vz: aimVz,
          id: Math.random().toString(36).slice(2),
          type: selectedAstra,
          color: astraConfig.color,
          damage: astraConfig.damage / 10,
          life: 100
        });

        spawnParticles(...worldToScreenArr(p.x, p.z, W, H), astraConfig.color, 8, 5);
        store.useMana(50);
      }

      // Update astras
      astrasRef.current = astrasRef.current.filter(a => a.life > 0);
      for (const astra of astrasRef.current) {
        astra.x += astra.vx;
        astra.z += astra.vz;
        astra.life--;
        
        spawnParticles(
          ...worldToScreenArr(astra.x, astra.z, W, H),
          astra.color, 2, 2
        );

        for (const entity of entitiesRef.current) {
          if (entity.hp <= 0) continue;
          const dx = entity.x - astra.x;
          const dz = entity.z - astra.z;
          if (Math.sqrt(dx*dx + dz*dz) < entity.size * 0.8) {
            entity.hp = Math.max(0, entity.hp - astra.damage);
            astra.life = 0;
            spawnBossParticles(...worldToScreenArr(entity.x, entity.z, W, H), astra.color);
            
            if (entity.hp <= 0 && entity.characterId) {
              store.defeatBoss(entity.characterId as CharacterId);
              store.gainDharma(20);
              spawnBossParticles(...worldToScreenArr(entity.x, entity.z, W, H), '#FFD700');
            }
            
            if (store.isBossFight && entity.type === 'boss') {
              const killed = store.damageBoss(astra.damage);
              if (killed) {
                store.defeatBoss(entity.characterId as CharacterId);
              }
            }
            break;
          }
        }
      }

      // Enemy AI & attacks
      const now = Date.now();
      for (const entity of entitiesRef.current) {
        if (entity.hp <= 0) continue;
        const dx = p.x - entity.x;
        const dz = p.z - entity.z;
        const dist = Math.sqrt(dx*dx + dz*dz);

        if (dist < 200) {
          entity.state = 'COMBAT';
          const speed = entity.type === 'boss' ? 1 : 1.5;
          entity.vx = (dx / dist) * speed;
          entity.vz = (dz / dist) * speed;
          entity.x += entity.vx;
          entity.z += entity.vz;

          // Enemy attack
          if (dist < 30 && p.invincible <= 0 && now - lastDamageTime > 1000) {
            lastDamageTime = now;
            p.invincible = 60;
            const char = entity.characterId ? CHARACTERS[entity.characterId] : null;
            const dmg = char ? char.attack / 50 : 10;
            store.takeDamage(Math.floor(dmg));
            spawnParticles(...worldToScreenArr(p.x, p.z, W, H), '#FF0000', 15, 6);
          }
        } else {
          entity.state = 'PATROL';
          entity.x += Math.sin(timestamp * 0.001 + parseInt(entity.id, 36) * 0.7) * 0.5;
          entity.z += Math.cos(timestamp * 0.0008 + parseInt(entity.id, 36) * 0.5) * 0.3;
        }
      }

      // Draw entities (back to front)
      const sortedEntities = [...entitiesRef.current].sort((a, b) => b.z - a.z);
      for (const entity of sortedEntities) {
        if (entity.hp <= 0) continue;
        const { sx, sy } = worldToScreen(entity.x, entity.z, W, H);
        const scale = getScale(entity.z, H);
        const size = entity.size * scale;

        // Shadow
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(sx, sy + size * 0.6, size * 0.8, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Enemy body
        if (entity.type === 'boss') {
          drawBossSprite(ctx, sx, sy, size, entity.name || 'Boss', entity.characterId, timestamp);
        } else {
          drawEnemySprite(ctx, sx, sy, size, entity.color, timestamp);
        }

        // HP bar
        const hpRatio = entity.hp / entity.maxHp;
        const barW = size * 3;
        const barH = 5 * scale;
        ctx.fillStyle = '#222';
        ctx.fillRect(sx - barW/2, sy - size - 10 * scale, barW, barH);
        ctx.fillStyle = hpRatio > 0.5 ? '#0f0' : hpRatio > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(sx - barW/2, sy - size - 10 * scale, barW * hpRatio, barH);

        // Name tag
        if (entity.type === 'boss') {
          ctx.fillStyle = '#FFD700';
          ctx.font = `bold ${Math.max(10, 14 * scale)}px serif`;
          ctx.textAlign = 'center';
          ctx.fillText(entity.name || '', sx, sy - size - 15 * scale);
        }
      }

      // Draw player
      const { sx: px, sy: py } = worldToScreen(p.x, p.z, W, H);
      const pScale = getScale(p.z, H);
      const pSize = 22 * pScale;

      // Shadow
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(px, py + pSize * 0.5, pSize * 0.8, pSize * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      drawPlayerSprite(ctx, px, py, pSize, store.activeCharacter, p.facing, moved, timestamp, p.invincible > 0);

      // Draw astra projectiles
      for (const astra of astrasRef.current) {
        const { sx: ax, sy: ay } = worldToScreen(astra.x, astra.z, W, H);
        const aScale = getScale(astra.z, H);
        const aConfig = ASTRA_CONFIGS[astra.type as keyof typeof ASTRA_CONFIGS] || ASTRA_CONFIGS.AGNEYASTRA;

        ctx.save();
        ctx.shadowColor = astra.color;
        ctx.shadowBlur = 20;
        const ag = ctx.createRadialGradient(ax, ay, 0, ax, ay, 12 * aScale);
        ag.addColorStop(0, '#fff');
        ag.addColorStop(0.3, astra.color);
        ag.addColorStop(1, 'transparent');
        ctx.fillStyle = ag;
        ctx.beginPath();
        ctx.arc(ax, ay, 12 * aScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Update particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      ctx.save();
      for (const pt of particlesRef.current) {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.2;
        pt.life -= 0.03;
        ctx.globalAlpha = pt.life;
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [store.gameState, envType, store, spawnParticles, spawnBossParticles]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
      
      {showControls && store.gameState === 'PLAYING' && (
        <div className="absolute bottom-32 left-4 bg-black/70 text-yellow-300 text-xs p-2 rounded border border-yellow-800 font-mono">
          <div className="font-bold text-yellow-400 mb-1">CONTROLS</div>
          <div>WASD / Arrows - Move</div>
          <div>SPACE / F - Fire Astra</div>
          <div>1-4 - Select Astra</div>
          <button className="mt-1 text-gray-400 hover:text-white" onClick={() => setShowControls(false)}>hide</button>
        </div>
      )}
    </div>
  );
}

function worldToScreen(wx: number, wz: number, W: number, H: number) {
  const perspective = 400;
  const cameraZ = 150;
  const cameraY = 80;
  const scale = perspective / (perspective + wz + cameraZ);
  const sx = W / 2 + wx * scale;
  const sy = H * 0.6 - (cameraY * scale) + (wz + cameraZ) * 0.15 * scale;
  return { sx, sy };
}

function worldToScreenArr(wx: number, wz: number, W: number, H: number): [number, number] {
  const { sx, sy } = worldToScreen(wx, wz, W, H);
  return [sx, sy];
}

function getScale(wz: number, H: number) {
  const perspective = 400;
  const cameraZ = 150;
  return perspective / (perspective + wz + cameraZ);
}

function drawEnvironment(ctx: CanvasRenderingContext2D, W: number, H: number, env: string, t: number, accent: string) {
  if (env === 'AYODHYA') {
    // Pillars
    for (let i = 0; i < 6; i++) {
      const px = (W / 7) * (i + 1);
      const ph = H * 0.3;
      ctx.fillStyle = '#2a1a00';
      ctx.fillRect(px - 8, H * 0.3, 16, ph);
      ctx.fillStyle = accent + '88';
      ctx.fillRect(px - 10, H * 0.28, 20, 8);
      ctx.fillRect(px - 10, H * 0.3 + ph - 4, 20, 8);
    }
    // Moon
    ctx.save();
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.arc(W * 0.8, H * 0.12, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (env === 'DANDAKA') {
    // Trees
    for (let i = 0; i < 12; i++) {
      const tx = ((i * 137) % W);
      const th = 80 + (i * 37) % 60;
      const ty = H * 0.45 - th;
      ctx.fillStyle = '#1a3d1a';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - 20, H * 0.55);
      ctx.lineTo(tx + 20, H * 0.55);
      ctx.fill();
      ctx.fillStyle = '#0d2b0d';
      ctx.fillRect(tx - 5, H * 0.55, 10, 20);
    }
    // Fireflies
    for (let i = 0; i < 15; i++) {
      const fx = ((i * 97 + t * 0.05) % W);
      const fy = H * 0.3 + (i * 43) % (H * 0.3);
      const glow = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.003 + i));
      ctx.fillStyle = `rgba(180,255,180,${glow})`;
      ctx.beginPath();
      ctx.arc(fx, fy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (env === 'KISHKINDHA') {
    // Boulders
    for (let i = 0; i < 8; i++) {
      const bx = ((i * 173) % W);
      const bh = 30 + (i * 43) % 50;
      ctx.fillStyle = '#5c3d11';
      ctx.beginPath();
      ctx.ellipse(bx, H * 0.55, bh, bh * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (env === 'LANKA') {
    // Golden towers
    for (let i = 0; i < 5; i++) {
      const tx = (W / 6) * (i + 1);
      ctx.fillStyle = '#3d1500';
      ctx.fillRect(tx - 12, H * 0.2, 24, H * 0.4);
      ctx.fillStyle = '#c8a000';
      ctx.beginPath();
      ctx.moveTo(tx, H * 0.15);
      ctx.lineTo(tx - 18, H * 0.2);
      ctx.lineTo(tx + 18, H * 0.2);
      ctx.fill();
      // Glow
      ctx.save();
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#c8a000';
      ctx.lineWidth = 2;
      ctx.strokeRect(tx - 12, H * 0.2, 24, H * 0.4);
      ctx.restore();
    }
    // Fire pits
    for (let i = 0; i < 4; i++) {
      const fx = (W / 5) * (i + 1);
      const fy = H * 0.58;
      const flicker = 0.6 + 0.4 * Math.sin(t * 0.01 + i);
      ctx.save();
      ctx.shadowColor = '#FF4500';
      ctx.shadowBlur = 30 * flicker;
      const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 20);
      fg.addColorStop(0, '#FFFF00');
      fg.addColorStop(0.5, '#FF4500');
      fg.addColorStop(1, 'transparent');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(fx, fy, 20 * flicker, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (env === 'OCEAN') {
    // Waves
    for (let wave = 0; wave < 6; wave++) {
      const wy = H * (0.5 + wave * 0.04);
      ctx.strokeStyle = `rgba(40,160,200,${0.3 - wave * 0.04})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let wx = 0; wx < W; wx += 5) {
        const ywav = wy + Math.sin(wx * 0.02 + t * 0.003 + wave) * 6;
        if (wx === 0) ctx.moveTo(wx, ywav);
        else ctx.lineTo(wx, ywav);
      }
      ctx.stroke();
    }
  } else if (env === 'BATTLEFIELD') {
    // Smoke/fire
    for (let i = 0; i < 6; i++) {
      const bx = (i * 167) % W;
      const flicker = 0.5 + 0.5 * Math.sin(t * 0.008 + i * 2);
      ctx.save();
      ctx.globalAlpha = 0.4 * flicker;
      const bg = ctx.createRadialGradient(bx, H * 0.55, 0, bx, H * 0.55, 40);
      bg.addColorStop(0, '#FF4500');
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(bx, H * 0.55, 40 * flicker, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Fallen banners
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const bx = (W / 4) * (i + 1);
      ctx.beginPath();
      ctx.moveTo(bx, H * 0.45);
      ctx.lineTo(bx + 20, H * 0.55);
      ctx.stroke();
    }
  }
}

function drawPlayerSprite(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  character: string, facing: number, moving: boolean, t: number, invincible: boolean
) {
  ctx.save();
  if (invincible) ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 0.1);

  const bobY = moving ? Math.sin(t * 0.02) * size * 0.1 : 0;
  const cy = y + bobY;

  // Glow aura
  const charColor = character === 'RAMA' ? '#4488FF' : character === 'HANUMAN' ? '#FF8C00' : '#44BB44';
  ctx.shadowColor = charColor;
  ctx.shadowBlur = 15;

  // Body
  ctx.fillStyle = charColor;
  ctx.beginPath();
  ctx.ellipse(x, cy, size * 0.5, size * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.shadowBlur = 8;
  ctx.fillStyle = character === 'HANUMAN' ? '#FF7700' : '#FFCC88';
  ctx.beginPath();
  ctx.arc(x, cy - size * 0.8, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Crown/Feature
  if (character === 'RAMA' || character === 'LAKSHMANA') {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.2, cy - size * 1.1);
    ctx.lineTo(x, cy - size * 1.4);
    ctx.lineTo(x + size * 0.2, cy - size * 1.1);
    ctx.fill();
    // Bow
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const bowX = x + (facing > 0 ? size * 0.6 : -size * 0.6);
    ctx.arc(bowX, cy, size * 0.5, -Math.PI * 0.5, Math.PI * 0.5, facing > 0);
    ctx.stroke();
  } else if (character === 'HANUMAN') {
    // Tail
    ctx.strokeStyle = '#FF8C00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, cy + size * 0.6);
    ctx.bezierCurveTo(
      x + size, cy + size,
      x + size * 1.2, cy - size * 0.5,
      x + size * 0.8, cy - size * 0.3
    );
    ctx.stroke();
    // Gada (mace)
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, cy);
    ctx.lineTo(x + size * 0.9, cy - size * 0.7);
    ctx.stroke();
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(x + size * 0.9, cy - size * 0.7, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawEnemySprite(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, t: number) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.6, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#4a0000';
  ctx.beginPath();
  ctx.arc(x, y - size * 0.8, size * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Horns
  ctx.fillStyle = '#8B0000';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 1.1);
  ctx.lineTo(x - size * 0.5, y - size * 1.5);
  ctx.lineTo(x - size * 0.1, y - size * 1.1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y - size * 1.1);
  ctx.lineTo(x + size * 0.5, y - size * 1.5);
  ctx.lineTo(x + size * 0.1, y - size * 1.1);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(x - size * 0.15, y - size * 0.85, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.15, y - size * 0.85, size * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBossSprite(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  name: string, characterId: CharacterId | undefined, t: number
) {
  ctx.save();
  ctx.shadowColor = '#FF0000';
  ctx.shadowBlur = 25 + Math.sin(t * 0.01) * 10;

  if (characterId === 'RAVANA') {
    // Ten heads
    for (let h = 0; h < 10; h++) {
      const angle = (h / 10) * Math.PI * 2 - Math.PI / 2;
      const hx = x + Math.cos(angle) * size * 1.5;
      const hy = y - size - Math.sin(angle) * size * 0.5;
      ctx.fillStyle = h === 0 ? '#CC0000' : '#880000';
      ctx.beginPath();
      ctx.arc(hx, hy, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // Crown on each head
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(hx - size * 0.2, hy - size * 0.4);
      ctx.lineTo(hx, hy - size * 0.7);
      ctx.lineTo(hx + size * 0.2, hy - size * 0.4);
      ctx.fill();
    }
    // Main body
    ctx.fillStyle = '#660000';
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Multiple arms
    for (let arm = 0; arm < 10; arm++) {
      const angle = (arm / 10) * Math.PI * 2;
      ctx.strokeStyle = '#880000';
      ctx.lineWidth = size * 0.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * size * 1.8, y + Math.sin(angle) * size * 0.8);
      ctx.stroke();
    }
  } else if (characterId === 'KUMBHAKARNA') {
    // Giant form
    ctx.fillStyle = '#553300';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 1.5, size * 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a4400';
    ctx.beginPath();
    ctx.arc(x, y - size * 1.5, size * 0.9, 0, Math.PI * 2);
    ctx.fill();
    // Eyes (sleepy)
    ctx.fillStyle = '#FF8800';
    ctx.beginPath();
    ctx.arc(x - size * 0.25, y - size * 1.55, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.25, y - size * 1.55, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
  } else if (characterId === 'INDRAJIT') {
    // Semi-invisible shimmer
    ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 0.05);
    ctx.fillStyle = '#4400CC';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.8, size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8844FF';
    ctx.beginPath();
    ctx.arc(x, y - size, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (characterId === 'VALI') {
    // Monkey form, powerful
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.arc(x, y - size, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    // Divine necklace
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.4, size * 0.6, 0.3, Math.PI - 0.3);
    ctx.stroke();
  } else {
    // Default boss
    ctx.fillStyle = '#AA0000';
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#660000';
    ctx.beginPath();
    ctx.arc(x, y - size, size * 0.55, 0, Math.PI * 2);
    ctx.fill();
    // Horns
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y - size * 1.3);
    ctx.lineTo(x - size * 0.5, y - size * 1.9);
    ctx.lineTo(x - size * 0.1, y - size * 1.3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.3, y - size * 1.3);
    ctx.lineTo(x + size * 0.5, y - size * 1.9);
    ctx.lineTo(x + size * 0.1, y - size * 1.3);
    ctx.fill();
  }

  ctx.restore();
}
