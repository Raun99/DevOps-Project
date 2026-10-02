
import React, { useEffect, useState } from 'react';

/**
 * Anime-grade controllable wanderer character.
 * Features:
 * - Fluid multi-phase walk cycle with leg strides and arm swings
 * - Billowing cloak with dynamic physics
 * - Smooth rotation towards movement direction
 * - Soft ground contact shadow
 */
export default function AnimeCharacter({ x, y, isMoving, direction, isRunning }) {
  const [walkPhase, setWalkPhase] = useState(0);

  useEffect(() => {
    if (!isMoving) {
      setWalkPhase(0);
      return;
    }

    const interval = setInterval(() => {
      setWalkPhase(p => (p + 1) % 8);
    }, isRunning ? 55 : 90);

    return () => clearInterval(interval);
  }, [isMoving, isRunning]);

  // Determine flip and angle based on direction
  const isFacingLeft = direction === 'left' || direction === 'up-left' || direction === 'down-left';

  // Stride calculations for smooth anime animation
  const strideAngle = isMoving ? Math.sin((walkPhase / 8) * Math.PI * 2) * 24 : 0;
  const cloakBillow = isMoving ? Math.sin((walkPhase / 8) * Math.PI * 2) * 14 : Math.sin(Date.now() * 0.003) * 4;
  const bobbing = isMoving ? Math.abs(Math.sin((walkPhase / 8) * Math.PI * 2)) * 5 : Math.sin(Date.now() * 0.002) * 2;

  return (
    <div 
      className="absolute pointer-events-none z-30 transition-transform duration-75 select-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -90%)'
      }}
    >
      {/* Ground Contact Shadow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-5 rounded-full bg-black/60 blur-[3px]"
        style={{ transform: `translate(-50%, 4px) scale(${isMoving ? 1 + Math.abs(strideAngle) * 0.01 : 1})` }}
      />

      {/* Anime Wanderer SVG Figure */}
      <div 
        className="relative w-16 h-28 flex items-center justify-center"
        style={{
          transform: `translateY(${-bobbing}px) scaleX(${isFacingLeft ? -1 : 1})`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <svg viewBox="0 0 64 112" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
          <defs>
            <linearGradient id="cloakGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="60%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>

            <linearGradient id="cloakTrim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>

            <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>

          {/* Back Leg */}
          <g style={{ transformOrigin: '32px 68px', transform: `rotate(${-strideAngle}deg)` }}>
            <rect x="29" y="66" width="6" height="28" rx="3" fill="#0B0F19" />
            <polygon points="28,90 36,90 38,97 27,97" fill="#18181B" />
          </g>

          {/* Billowing Cape / Cloak Back */}
          <path 
            d={`M24,32 Q${isMoving ? 10 - cloakBillow : 16},65 ${isMoving ? 8 - cloakBillow * 1.5 : 18},92 Q32,96 38,90 Q40,65 38,32 Z`} 
            fill="url(#cloakGrad)"
            opacity="0.95"
          />

          {/* Torso & Inner Tunic */}
          <rect x="25" y="32" width="14" height="36" rx="4" fill="#1E293B" />
          <rect x="30" y="34" width="4" height="32" fill="#D97706" opacity="0.8" />
          {/* Golden Waist Belt & Buckle */}
          <rect x="24" y="58" width="16" height="5" rx="1" fill="#451A03" />
          <rect x="30" y="58" width="4" height="5" fill="#F59E0B" />

          {/* Front Leg */}
          <g style={{ transformOrigin: '32px 68px', transform: `rotate(${strideAngle}deg)` }}>
            <rect x="29" y="66" width="6.5" height="28" rx="3" fill="#1E293B" />
            <polygon points="28,90 36,90 39,98 27,98" fill="#090D16" />
            <rect x="28" y="87" width="8" height="2" fill="#F59E0B" opacity="0.8" />
          </g>

          {/* Flowing Front Cloak / Mantle */}
          <path 
            d={`M22,30 Q16,55 ${20 + cloakBillow * 0.4},84 Q32,88 42,82 Q46,55 42,30 Z`} 
            fill="url(#cloakGrad)" 
            stroke="url(#cloakTrim)" 
            strokeWidth="1.2"
          />

          {/* Anime Hood & Head */}
          <g>
            <path d="M26,22 Q32,8 38,22 Q41,28 32,28 Q23,28 26,22 Z" fill="url(#hairGrad)" />
            <ellipse cx="32" cy="22" rx="6" ry="7" fill="#FED7AA" opacity="0.9" />
            <circle cx="34" cy="21" r="1" fill="#38BDF8" />
            <path d="M22,24 Q32,10 42,24 Q44,34 32,36 Q20,34 22,24 Z" fill="#0F172A" />
            <path d="M24,24 Q32,13 40,24" stroke="#F59E0B" strokeWidth="1" fill="none" />
          </g>

          {/* Hanging Arcane Relic */}
          <circle cx="32" cy="48" r="2.5" fill="#F59E0B" />
        </svg>
      </div>

      {/* Floating Name & Status Indicator */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/85 border border-brightGold/60 text-[9px] font-mono text-amber-200 shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>TRAVELER</span>
      </div>

    </div>
  );
}
