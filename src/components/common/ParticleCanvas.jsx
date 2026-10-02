
import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let embers = [];

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize ambient stardust & embers (from reference index.html)
    const initEmbers = () => {
      embers = [];
      const count = Math.min(50, Math.floor(window.innerWidth / 35));
      for (let i = 0; i < count; i++) {
        embers.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -Math.random() * 0.6 - 0.2,
          radius: Math.random() * 2 + 0.8,
          alpha: Math.random() * 0.7 + 0.2,
          color: Math.random() > 0.3 ? '#f59e0b' : '#38bdf8'
        });
      }
    };
    initEmbers();

    // Click burst physics (from reference index.html)
    const spawnEmberBurst = (x, y) => {
      for (let i = 0; i < 35; i++) {
        embers.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 7,
          vy: (Math.random() - 0.5) * 7 - 2,
          radius: Math.random() * 3 + 1.2,
          alpha: 1,
          color: Math.random() > 0.4 ? '#f59e0b' : '#fbbf24',
          burst: true
        });
      }
    };

    const handleClick = (e) => {
      spawnEmberBurst(e.clientX, e.clientY);
    };
    window.addEventListener('click', handleClick);

    let isHidden = false;
    const handleVisibility = () => {
      isHidden = document.hidden;
      if (!isHidden) animationFrameId = requestAnimationFrame(animateEmbers);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const animateEmbers = () => {
      if (isHidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = embers.length - 1; i >= 0; i--) {
        const p = embers[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.burst) {
          p.alpha *= 0.94;
          if (p.alpha < 0.05) {
            embers.splice(i, 1);
            continue;
          }
        } else {
          if (p.y < -10) p.y = canvas.height + 10;
          if (p.x < -10) p.x = canvas.width + 10;
          if (p.x > canvas.width + 10) p.x = -10;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animateEmbers);
    };

    animationFrameId = requestAnimationFrame(animateEmbers);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-30" 
    />
  );
}
