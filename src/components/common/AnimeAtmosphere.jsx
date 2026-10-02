
import React from 'react';
import { useClandestine } from '../../context/ClandestineContext';

export default function AnimeAtmosphere({ isMoving, targetBeacon }) {
  const { ambientMode, cameraMode } = useClandestine();

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none">
      
      {/* 1. Volumetric Celestial God Rays (Sunbeams cutting through the archway) */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-screen transition-opacity duration-1000"
        style={{
          background: ambientMode === 'warm'
            ? 'linear-gradient(125deg, rgba(245, 158, 11, 0.18) 0%, rgba(254, 240, 138, 0.08) 25%, transparent 60%)'
            : 'linear-gradient(125deg, rgba(56, 189, 248, 0.15) 0%, rgba(186, 230, 253, 0.05) 30%, transparent 65%)'
        }}
      />

      {/* God ray beams */}
      <div className="absolute -top-20 left-1/4 w-[600px] h-[1200px] rotate-[32deg] opacity-25 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-amber-200/40 via-amber-300/10 to-transparent blur-2xl" />
      </div>

      <div className="absolute -top-32 left-1/2 w-[450px] h-[1100px] rotate-[28deg] opacity-20 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-cyan-200/40 via-cyan-400/10 to-transparent blur-3xl" />
      </div>

      {/* 2. Anime Floor Magic Summoning Circle (SVG Ring on the Balcony) */}
      {cameraMode !== 'cathedral' && (
        <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] opacity-20 pointer-events-none [transform:rotateX(65deg)] animate-pulse">
          <svg viewBox="0 0 400 400" className="w-full h-full animate-spin-slow">
            <circle cx="200" cy="200" r="190" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6 8" />
            <circle cx="200" cy="200" r="170" fill="none" stroke="#38BDF8" strokeWidth="1" />
            <circle cx="200" cy="200" r="140" fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="12 12" />
            {/* Cross Lines */}
            <line x1="200" y1="10" x2="200" y2="390" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="4 6" />
            <line x1="10" y1="200" x2="390" y2="200" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="4 6" />
            {/* Astrological Diamond */}
            <polygon points="200,30 370,200 200,370 30,200" fill="none" stroke="#FDE68A" strokeWidth="1.2" />
            <polygon points="200,60 340,200 200,340 60,200" fill="none" stroke="#38BDF8" strokeWidth="0.8" />
          </svg>
        </div>
      )}

      {/* 3. Anime Speed Lines Overlay when camera is gliding/traveling */}
      {isMoving && (
        <div className="absolute inset-0 z-30 pointer-events-none animate-fade-in flex items-center justify-center">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,transparent_40%,rgba(245,158,11,0.12)_100%)]" />
          <div className="absolute inset-0 opacity-30 mix-blend-screen bg-[repeating-conic-gradient(from_0deg,transparent_0deg,transparent_4deg,rgba(255,255,255,0.4)_5deg,transparent_6deg)] animate-spin-slow" />
        </div>
      )}

      {/* 4. Click Target Beacon (Anime Waypoint Summon Ring at click coordinate) */}
      {targetBeacon && (
        <div 
          className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${targetBeacon.x}px`, top: `${targetBeacon.y}px` }}
        >
          {/* Expanding magic ring */}
          <div className="relative w-28 h-28 flex items-center justify-center animate-ping">
            <div className="absolute inset-0 rounded-full border-2 border-brightGold shadow-[0_0_25px_#F59E0B]" />
          </div>
          {/* Rotating inner rune circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-cyan-400 border-dashed animate-spin-slow flex items-center justify-center">
              <span className="text-brightGold text-xs font-mono font-bold">✦</span>
            </div>
          </div>
          {/* Rising pillar of light */}
          <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-1 h-36 bg-gradient-to-t from-brightGold via-cyan-400 to-transparent blur-[1px] animate-pulse" />
        </div>
      )}

    </div>
  );
}
