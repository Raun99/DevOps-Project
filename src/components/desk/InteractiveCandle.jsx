import React from 'react';
import { useClandestine } from '../../context/ClandestineContext';

export default function InteractiveCandle() {
  const { ambientMode, toggleAmbientMode } = useClandestine();
  const isWarm = ambientMode === 'warm';

  return (
    <div 
      onClick={toggleAmbientMode}
      className="relative flex flex-col items-center cursor-pointer group select-none transition-transform duration-300 hover:scale-105"
      title={isWarm ? "Candle is radiant. Click to snuff to moonlit dim." : "Candle is dim. Click to ignite warm candlelight."}
    >
      {/* Dynamic Candle Flame Glow Aura */}
      <div 
        className={`absolute -top-10 w-24 h-24 rounded-full pointer-events-none blur-xl transition-all duration-700 ${
          isWarm ? 'bg-candleAmber/40 scale-110 opacity-100' : 'bg-candleAmber/15 scale-75 opacity-40'
        }`}
      />

      {/* The Animated Flame */}
      <div className="relative w-6 h-10 flex items-center justify-center">
        {/* Core Inner Flame */}
        <div 
          className={`w-3.5 h-7 rounded-full bg-gradient-to-t from-candleAmber via-amber-300 to-white transition-opacity duration-500 ${
            isWarm ? 'animate-flame-flicker opacity-95' : 'animate-flame-flicker-2 opacity-50 scale-75'
          }`}
          style={{
            filter: 'drop-shadow(0 0 8px #F59E0B)',
            borderRadius: '50% 50% 35% 35% / 60% 60% 40% 40%'
          }}
        />
        {/* Wick */}
        <div className="absolute bottom-0 w-0.5 h-2 bg-stone-900"></div>
      </div>

      {/* Wax Candle Body */}
      <div className="relative w-7 h-20 bg-gradient-to-r from-[#dcd1ba] via-[#f7f0df] to-[#c7b99c] rounded-t-sm shadow-lg border-t border-[#f7f0df]">
        {/* Dripped Wax Droplets */}
        <div className="absolute top-1 left-0.5 w-1.5 h-4 bg-[#f7f0df] rounded-full shadow-inner opacity-90"></div>
        <div className="absolute top-2 right-1 w-2 h-6 bg-[#eae1cb] rounded-full shadow-inner opacity-80"></div>
      </div>

      {/* Brass Holder & Dish */}
      <div className="w-14 h-3 bg-gradient-to-r from-[#8c6742] via-[#d4af37] to-[#8c6742] rounded-full shadow-md border-t border-[#e8c77e]/60"></div>
      <div className="w-10 h-1.5 bg-[#523c21] rounded-b-md"></div>

      {/* Subtle Hint Text on Hover */}
      <div className="absolute -bottom-5 text-[8px] font-mono tracking-wider text-antiqueGold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {isWarm ? 'CLICK TO DIM' : 'CLICK TO IGNITE'}
      </div>
    </div>
  );
}