import React from 'react';

export default function DeskMug() {
  return (
    <div className="relative flex flex-col items-center select-none group transition-transform duration-200 hover:scale-105" title="Scholar's steeped tea mug">
      {/* Contact Shadow */}
      <div className="absolute -bottom-1 w-12 h-2.5 bg-black/80 rounded-full blur-[2px] pointer-events-none"></div>

      {/* Gentle Steam Rising */}
      <div className="absolute -top-3 w-3 h-3 rounded-full bg-white/10 blur-[2px] animate-bounce pointer-events-none" />

      {/* Ceramic Mug Body */}
      <div className="w-10 h-12 rounded-t-sm rounded-b-md bg-gradient-to-r from-[#241a13] via-[#3d2b1f] to-[#241a13] border-t border-amber-400/30 shadow-2xl flex items-center justify-center p-1 text-center">
        <span className="text-[7px] font-cinzel text-brightGold/90 leading-tight tracking-wider font-semibold">
          Good Ideas<br/>Travel Far
        </span>
      </div>

      {/* Brass Mug Handle */}
      <div className="absolute right-[-7px] top-2.5 w-3 h-6 rounded-r-md border-2 border-[#3d2b1f] shadow-sm"></div>
    </div>
  );
}