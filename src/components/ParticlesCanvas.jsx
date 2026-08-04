import React, { useEffect, useRef } from 'react';

export const ParticlesCanvas = ({ trigger, rarity, enabled = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!trigger || !enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const count = rarity === 'Legendary' ? 80 : rarity === 'Epic' ? 50 : 25;

    const colors = rarity === 'Legendary' 
      ? ['#fbbf24', '#f59e0b', '#fef08a', '#ffffff', '#eab308']
      : rarity === 'Epic'
      ? ['#c084fc', '#a855f7', '#e9d5ff', '#38bdf8']
      : ['#38bdf8', '#818cf8', '#cbd5e1', '#ffffff'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 - 50,
        vx: (Math.random() - 0.5) * (rarity === 'Legendary' ? 18 : 12),
        vy: (Math.random() - 0.7) * (rarity === 'Legendary' ? 18 : 12),
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: Math.random() * 0.02 + 0.015,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;

      particles.forEach((p) => {
        if (p.life <= 0) return;
        alive++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // gravity
        p.life -= p.decay;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (alive > 0) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [trigger, rarity, enabled]);

  if (!enabled) return null;

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 999
      }}
    />
  );
};
