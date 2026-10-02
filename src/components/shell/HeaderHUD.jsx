
import React from 'react';
import { Volume2, VolumeX, Menu, Compass } from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';
import { CATEGORIES } from '../../data/initialPosts';
import ClandestineSigil from '../common/ClandestineSigil';

export default function HeaderHUD() {
  const { 
    isAudioActive, 
    toggleAudio, 
    isNavDrawerOpen,
    setIsNavDrawerOpen,
    activeCategory,
    selectCategory,
    cameraMode
  } = useClandestine();

  // If in reading mode, keep header minimal
  if (cameraMode === 'reading') return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between pointer-events-none select-none">
      
      {/* Mobile Menu Trigger & Ancient Archival Insignia */}
      <div className="pointer-events-auto flex items-center space-x-3">
        <button 
          onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
          className="lg:hidden p-2 rounded-xl bg-black/70 border border-antiqueGold/40 text-antiqueGold hover:text-brightGold transition-colors cursor-pointer"
          title="Unseal Navigation Monolith"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Subtle Carved Insignia Embedded in the Upper Arch */}
        <div className="flex items-center space-x-2.5 opacity-95 hover:opacity-100 transition-opacity">
          <ClandestineSigil className="w-7 h-7" glowing={true} />
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-brightGold font-cinzel">
                CLANDESTINE
              </span>
              <span className="hidden md:inline text-[8px] font-mono tracking-widest text-antiqueGold/70 uppercase">
                OBSERVATORY 3.0
              </span>
            </div>
            <div className="text-[8px] sm:text-[9px] text-slate-400 font-cinzel tracking-wider">
              "IDEAS FIND A HOME"
            </div>
          </div>
        </div>
      </div>

      {/* Center: Always-Accessible Anime Category Seals Bar */}
      <nav className="hidden md:flex pointer-events-auto items-center space-x-1 gothic-hud-panel px-3 py-1.5 rounded-full border border-brightGold/30 shadow-lg">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-cinzel tracking-wider transition-all duration-200 cursor-pointer font-semibold ${
                isActive
                  ? 'bg-brightGold text-obsidian font-bold shadow-[0_0_12px_rgba(232,199,126,0.6)] scale-105'
                  : 'text-slate-300 hover:text-brightGold hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>

      {/* Right: Tactile Celestial Bell (Procedural Audio Toggle) */}
      <div className="pointer-events-auto flex items-center space-x-3">
        <button 
          onClick={toggleAudio}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 border border-antiqueGold/30 hover:border-brightGold/60 transition-all group backdrop-blur-md cursor-pointer shadow-md"
          title={isAudioActive ? "Mute Astral Synth Drone" : "Resonate Procedural Astral Drone"}
        >
          {isAudioActive ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-brightGold animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-brightGold font-semibold">SYNTH: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
              <span className="text-[10px] font-mono tracking-widest text-slate-400 group-hover:text-slate-300">ASTRAL SYNTH: OFF</span>
            </>
          )}
        </button>
      </div>

    </header>
  );
}
