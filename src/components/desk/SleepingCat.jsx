import React, { useState } from 'react';
import { soundEngine } from '../../audio/AudioSynthesizer';

export default function SleepingCat() {
  const [reaction, setReaction] = useState(false);

  const handlePet = () => {
    soundEngine.playCatPurr();
    setReaction(true);
    setTimeout(() => setReaction(false), 1400);
  };

  return (
    <div 
      onClick={handlePet}
      className="relative flex flex-col items-center cursor-pointer select-none group transition-transform duration-300 hover:scale-105"
      title="A scholar's familiar curled peacefully in sleep... (Click gently to pet)"
    >
      {/* Grounding Contact Shadow */}
      <div className="absolute -bottom-1 w-20 h-4 bg-black/80 rounded-full blur-[3px] pointer-events-none"></div>

      {/* Floating Gentle Reaction Text */}
      {reaction && (
        <div className="absolute -top-7 text-[10px] font-cinzel text-brightGold animate-bounce tracking-widest pointer-events-none">
          * gentle purr *
        </div>
      )}

      {/* Feline Silhouette with Natural Breathing Motion */}
      <div className={`relative w-20 h-12 transition-transform duration-500 ${
        reaction ? 'scale-105' : 'group-hover:scale-102'
      }`}>
        
        {/* Curled Body Oval with Warm Amber Rim Lighting */}
        <div 
          className="w-20 h-11 rounded-[50%/60%_60%_40%_40%] bg-gradient-to-tr from-[#0a0d14] via-[#161a24] to-[#252b3b] shadow-2xl border-t border-amber-500/20 relative overflow-hidden"
          style={{
            boxShadow: 'inset -2px -2px 8px rgba(0,0,0,0.9), inset 2px 2px 6px rgba(245,158,11,0.15)'
          }}
        >
          {/* Subtle Spine Fur Highlights */}
          <div className="absolute top-1.5 left-4 w-12 h-2.5 rounded-full bg-white/[0.04] blur-xs"></div>
        </div>

        {/* Head Resting on Paws */}
        <div className={`absolute left-1.5 top-1.5 w-8 h-8 rounded-full bg-gradient-to-b from-[#1c2230] to-[#0e121a] border-t border-amber-400/25 transition-transform duration-300 shadow-md ${
          reaction ? 'rotate-[-8deg]' : ''
        }`}>
          {/* Left Ear */}
          <div className={`absolute -top-1.5 left-1 w-2.5 h-3 bg-[#1e2433] rounded-t-sm border-t border-l border-amber-400/30 transition-transform duration-200 ${
            reaction ? 'rotate-[-20deg]' : ''
          }`}></div>
          {/* Right Ear */}
          <div className="absolute -top-1.5 right-1.5 w-2.5 h-3 bg-[#1e2433] rounded-t-sm border-t border-r border-amber-400/30"></div>

          {/* Sleeping Closed Eyes (tiny delicate crescent lines) */}
          <div className="absolute top-4 left-2 w-1.5 h-0.5 border-b border-amber-200/50 rounded-full"></div>
          <div className="absolute top-4 right-2 w-1.5 h-0.5 border-b border-amber-200/50 rounded-full"></div>

          {/* Nose */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-[#4a342a] rounded-full"></div>
        </div>

        {/* Curled Tail Wrapping Front */}
        <div className={`absolute bottom-0.5 right-1 w-11 h-3 rounded-full bg-gradient-to-l from-[#161a24] to-[#0d1017] border-b border-amber-400/15 transition-transform duration-300 ${
          reaction ? 'translate-x-1.5' : ''
        }`}></div>

      </div>

      <div className="text-[9px] font-mono text-antiqueGold/70 tracking-wider opacity-0 group-hover:opacity-100 transition-opacity mt-1">
        SLEEPING FAMILIAR
      </div>
    </div>
  );
}