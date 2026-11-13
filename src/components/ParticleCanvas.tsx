import React, { useEffect, useRef } from 'react';

interface ParticleCanvasProps {
  mode: 'victory' | 'defeat';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  phase: 'inward' | 'burst' | 'ember';
  trail: Array<{ x: number; y: number }>;
}

const GOLD_PALETTE = ['#FDE68A', '#FBBF24', '#F59E0B', '#FEF3C7', '#FFFFFF'];
const CRIMSON_PALETTE = ['#EF4444', '#DC2626', '#F87171', '#991B1B'];

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const targetX = width / 2;
    const targetY = Math.min(height * 0.34, 290);
    const particles: Particle[] = [];
    let burstTriggered = false;
    const startTime = performance.now();

    const spawnInwardStreams = () => {
      const perSide = 32;
      for (let side of [-1, 1] as const) {
        const startX = side === -1 ? -10 : width + 10;
        for (let i = 0; i < perSide; i++) {
          const startY = targetY + (Math.random() - 0.5) * (height * 0.42);
          const dx = targetX - startX;
          const dy = targetY - startY;
          const dist = Math.hypot(dx, dy) || 1;
          const speed = (dist / 26) * (0.85 + Math.random() * 0.35);
          particles.push({
            x: startX,
            y: startY,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            size: 2.2 + Math.random() * 2.8,
            alpha: 1,
            decay: 0.008,
            color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
            phase: 'inward',
            trail: [],
          });
        }
      }
    };

    const spawnCenterBurst = () => {
      const burstCount = 96;
      for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.25;
        const speed = 2.5 + Math.random() * 8.5;
        particles.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          size: 2 + Math.random() * 3.5,
          alpha: 1,
          decay: 0.011 + Math.random() * 0.01,
          color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
          phase: 'burst',
          trail: [],
        });
      }
    };

    const spawnCrimsonEmbers = () => {
      for (let i = 0; i < 42; i++) {
        particles.push({
          x: Math.random() * width,
          y: height + Math.random() * 120,
          vx: (Math.random() - 0.5) * 1.1,
          vy: -(1.0 + Math.random() * 2.2),
          size: 1.8 + Math.random() * 2.6,
          alpha: 0.75,
          decay: 0.0045 + Math.random() * 0.003,
          color: CRIMSON_PALETTE[Math.floor(Math.random() * CRIMSON_PALETTE.length)],
          phase: 'ember',
          trail: [],
        });
      }
    };

    if (mode === 'victory') {
      spawnInwardStreams();
    } else {
      spawnCrimsonEmbers();
    }

    let lastTime = performance.now();

    const frame = (now: number) => {
      const rawDt = (now - lastTime) / 16.667;
      const dt = Math.min(rawDt, 2.5);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      if (mode === 'victory' && !burstTriggered && now - startTime >= 400) {
        burstTriggered = true;
        spawnCenterBurst();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > (p.phase === 'inward' ? 6 : 4)) {
          p.trail.shift();
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.phase === 'inward') {
          const distToCenter = Math.hypot(targetX - p.x, targetY - p.y);
          if (distToCenter < 24) {
            p.alpha -= 0.16 * dt;
          }
        } else if (p.phase === 'burst') {
          p.vx *= 0.965;
          p.vy = p.vy * 0.965 + 0.09 * dt;
          p.alpha -= p.decay * dt;
        } else {
          p.vx += (Math.random() - 0.5) * 0.05;
          p.alpha -= p.decay * dt;
        }

        if (p.alpha <= 0.02) {
          particles.splice(i, 1);
          continue;
        }

        // Draw smooth spark trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha * 0.45);
          ctx.lineWidth = p.size * 0.7;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Draw spark core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      if (particles.length > 0 || (mode === 'victory' && !burstTriggered)) {
        animId = requestAnimationFrame(frame);
      }
    };

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
};
