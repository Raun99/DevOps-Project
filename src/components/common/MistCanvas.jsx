import React, { useEffect, useRef } from 'react';

export default function MistCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let angle = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angle += 0.002;

      // Soft volumetric starlight fog drifting over the canyon abyss
      const grad = ctx.createRadialGradient(
        canvas.width * 0.72 + Math.sin(angle * 1.5) * 35,
        canvas.height * 0.42 + Math.cos(angle) * 20,
        40,
        canvas.width * 0.72,
        canvas.height * 0.42,
        canvas.width * 0.55
      );
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
      grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.12)');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="parallax-layer z-10 opacity-75 pointer-events-none" 
    />
  );
}