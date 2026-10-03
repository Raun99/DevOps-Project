
import { useEffect, useRef } from 'react';

export default function CursorTrailCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    let trailPoints = [];
    let shockwaves = [];
    let mouse = { x: -200, y: -200, prevX: -200, prevY: -200, speed: 0 };
    let isHidden = false;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Mouse movement generator
    const handleMouseMove = (e) => {
      const dx = e.clientX - (mouse.x === -200 ? e.clientX : mouse.x);
      const dy = e.clientY - (mouse.y === -200 ? e.clientY : mouse.y);
      mouse.speed = Math.sqrt(dx * dx + dy * dy);
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Add to smooth ribbon trail
      trailPoints.push({
        x: e.clientX,
        y: e.clientY,
        age: 0,
        maxAge: 24,
        size: Math.min(8, Math.max(3, mouse.speed * 0.25))
      });

      // Spawn shimmering anime stardust particles along path
      const count = Math.min(5, Math.max(2, Math.floor(mouse.speed / 4)));
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const drift = Math.random() * 2 + 0.5;
        const isStar = Math.random() > 0.45;
        const colorPalette = [
          { main: '#F59E0B', glow: '#FDE68A' }, // Solar Gold
          { main: '#38BDF8', glow: '#BAE6FD' }, // Celestial Azure
          { main: '#E879F9', glow: '#F5D0FE' }, // Astral Amethyst
          { main: '#34D399', glow: '#A7F3D0' }  // Emerald Leyline
        ];
        const chosen = colorPalette[Math.floor(Math.random() * colorPalette.length)];

        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          vx: Math.cos(angle) * drift + (dx * 0.05),
          vy: Math.sin(angle) * drift + (dy * 0.05) - 0.4,
          radius: Math.random() * 3.5 + 1.2,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.15,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          isStar: isStar,
          points: isStar ? 4 : 0,
          color: chosen.main,
          glow: chosen.glow
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Click Anime Summoning Array & Shockwave
    const handleClick = (e) => {
      // 1. Expanding shockwave ring with anime magic runes
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        maxRadius: 75,
        alpha: 1,
        rotation: 0,
        color: '#F59E0B'
      });

      // 2. High-density burst of 360-degree star motes
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        const isStar = Math.random() > 0.35;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          radius: Math.random() * 4 + 1.8,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.25,
          alpha: 1,
          decay: Math.random() * 0.025 + 0.015,
          isStar: isStar,
          points: 4,
          color: i % 2 === 0 ? '#F59E0B' : '#38BDF8',
          glow: '#FEF08A'
        });
      }
    };
    window.addEventListener('click', handleClick);

    const handleVisibility = () => {
      isHidden = document.hidden;
      if (!isHidden) animId = requestAnimationFrame(render);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Draw 4-pointed Anime Cross Star (✦)
    const drawStar = (x, y, radius, rotation, color, glow, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      
      const spikes = 4;
      const step = Math.PI / spikes;
      const outerRadius = radius * 2.2;
      const innerRadius = radius * 0.45;
      
      let rot = Math.PI / 2 * 3;
      ctx.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
        rot += step;
        ctx.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
        rot += step;
      }
      ctx.lineTo(0, -outerRadius);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.shadowBlur = 12;
      ctx.shadowColor = glow;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      if (isHidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Smooth Luminous Ribbon Trail
      if (trailPoints.length > 2) {
        ctx.save();
        for (let i = 1; i < trailPoints.length; i++) {
          const pt = trailPoints[i];
          const prevPt = trailPoints[i - 1];
          const progress = 1 - (pt.age / pt.maxAge);
          
          ctx.beginPath();
          ctx.moveTo(prevPt.x, prevPt.y);
          ctx.lineTo(pt.x, pt.y);
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = pt.size * progress;
          ctx.lineCap = 'round';
          ctx.globalAlpha = Math.max(0, progress * 0.45);
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#FDE68A';
          ctx.stroke();
        }
        ctx.restore();
      }

      // Age ribbon points
      for (let i = trailPoints.length - 1; i >= 0; i--) {
        trailPoints[i].age += 1;
        if (trailPoints[i].age >= trailPoints[i].maxAge) {
          trailPoints.splice(i, 1);
        }
      }

      // 2. Draw Anime Magic Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.12 + 1.2;
        sw.alpha -= 0.035;
        sw.rotation += 0.02;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(sw.x, sw.y);
        ctx.rotate(sw.rotation);
        
        // Outer runic ring
        ctx.beginPath();
        ctx.arc(0, 0, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#FDE68A';
        ctx.stroke();

        // Inner secondary dashed ring
        ctx.beginPath();
        ctx.arc(0, 0, sw.radius * 0.65, 0, Math.PI * 2);
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = Math.max(0, sw.alpha * 0.85);
        ctx.stroke();

        ctx.restore();
      }

      // 3. Draw Sparkling Particles (Stars & Orbs)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // Gentle downward gravity
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0.01) {
          particles.splice(i, 1);
          continue;
        }

        if (p.isStar) {
          drawStar(p.x, p.y, p.radius, p.rotation, p.color, p.glow, p.alpha);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.glow;
          ctx.fill();
          ctx.restore();
        }
      }

      // 4. Draw Active Cursor Reticle Follower (Anime Diamond + Outer Magic Circle)
      if (mouse.x > 0 && mouse.y > 0) {
        ctx.save();
        ctx.translate(mouse.x, mouse.y);
        
        // Rotating miniature summon reticle
        const ringTime = Date.now() * 0.003;
        ctx.rotate(ringTime);
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 5]);
        ctx.globalAlpha = 0.75;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FDE68A';
        ctx.stroke();

        // 4 cross-points
        for (let a = 0; a < 4; a++) {
          const ang = (Math.PI / 2) * a;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 11, Math.sin(ang) * 11, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = '#38BDF8';
          ctx.globalAlpha = 0.9;
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[999999]" 
    />
  );
}
