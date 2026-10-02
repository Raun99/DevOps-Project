import React, { useState } from 'react';
import { soundEngine } from '../../audio/AudioSynthesizer';

export default function CrystalOrb() {
  const [isCharged, setIsCharged] = useState(false);

  const handleClick = () => {
    soundEngine.playManaChime();
    setIsCharged(true);
    setTimeout(() => setIsCharged(false), 900);
  };

  return (
    <div 
      onClick={handleClick}
      className="relative flex flex-col items-center cursor-pointer group select-none"
      title="Enchanted Crystal Orb: Traces astral leylines (Click to resonate)"
    >
      {/* Outer Luminous Aura */}
      <div className={`absolute top-1 w-20 h-20 rounded-full transition-all duration-500 blur-xl pointer-events-none ${
        isCharged ? 'bg-cyan-400/50 scale-125' : 'bg-cyan-500/20 group-hover:bg-cyan-400/35'
      }`} />

      {/* Crystal Sphere Frame */}
      <div className={`relative w-16 h-16 rounded-full border border-cyan-300/40 bg-radial from-cyan-900/40 via-deepAbyss/80 to-black overflow-hidden shadow-2xl transition-all duration-300 group-hover:scale-105 ${
        isCharged ? 'border-cyan-300 shadow-[0_0_25px_rgba(56,189,248,0.7)]' : ''
      }`}>
        
        {/* Internal Swirling Nebula Particles */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-indigo-600/30 to-transparent animate-spin-slow opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-bl from-amber-400/15 via-transparent to-cyan-400/20 animate-spin-reverse-slow" />

        {/* Central Core Star Spark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-2.5 h-2.5 rounded-full bg-cyan-200 transition-all duration-300 shadow-[0_0_10px_#38bdf8] ${
            isCharged ? 'scale-150 bg-white shadow-[0_0_18px_#ffffff]' : 'group-hover:scale-125'
          }`} />
        </div>

        {/* Glass Specular Highlight Curve */}
        <div className="absolute top-1.5 left-2 w-5 h-3 rounded-full bg-white/40 blur-[1px] rotate-[-30deg]" />
      </div>

      {/* Carved Brass Three-legged Pedestal */}
      <div className="w-10 h-2 bg-gradient-to-r from-antiqueGold via-brightGold to-antiqueGold rounded-sm shadow-md mt-0.5 border-t border-brightGold/50"></div>
      <div className="flex justify-between w-8 h-2">
        <div className="w-1.5 h-2 bg-antiqueGold rounded-b-sm"></div>
        <div className="w-1.5 h-2 bg-brightGold rounded-b-sm"></div>
        <div className="w-1.5 h-2 bg-antiqueGold rounded-b-sm"></div>
      </div>

      <div className="absolute -bottom-5 text-[8px] font-mono tracking-wider text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        ASTRAL ORB
      </div>
    </div>
  );
}