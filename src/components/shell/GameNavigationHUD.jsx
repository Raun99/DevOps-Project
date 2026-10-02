
import React from 'react';
import { useClandestine } from '../../context/ClandestineContext';
import { 
  Compass, 
  Eye, 
  BookOpen, 
  Search, 
  Library, 
  Flame, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

export default function GameNavigationHUD() {
  const { 
    cameraMode, 
    travelTo, 
    activeCategory, 
    selectCategory, 
    ambientMode, 
    toggleAmbientMode, 
    isAudioActive, 
    toggleAudio 
  } = useClandestine();

  const waypoints = [
    { id: 'chamber', label: 'Observatory Study', icon: Compass },
    { id: 'cathedral', label: 'Citadel Nave', icon: Eye },
    { id: 'reading', label: 'Open Codex', icon: BookOpen },
    { id: 'search', label: 'Astrolabe Search', icon: Search },
    { id: 'categories', label: 'Archival Tomes', icon: Library }
  ];

  return (
    <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 select-none pointer-events-none">
      <div className="pointer-events-auto gothic-hud-panel px-3 py-2 rounded-2xl flex items-center space-x-1.5 sm:space-x-2 border border-brightGold/40 shadow-[0_15px_40px_rgba(0,0,0,0.95)]">
        
        {/* Navigation Waypoints */}
        {waypoints.map((wp) => {
          const Icon = wp.icon;
          const isActive = cameraMode === wp.id;
          return (
            <button
              key={wp.id}
              onClick={() => travelTo(wp.id)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-cinzel tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                isActive 
                  ? 'bg-gradient-to-r from-amber-600/40 via-brightGold/25 to-amber-600/40 text-brightGold border border-brightGold shadow-[0_0_18px_rgba(232,199,126,0.35)] scale-105' 
                  : 'text-slate-300 hover:text-amber-100 hover:bg-white/5'
              }`}
              title={`Explore ${wp.label}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brightGold animate-pulse' : 'text-antiqueGold'}`} />
              <span className="hidden md:inline">{wp.label}</span>
            </button>
          );
        })}

        <div className="w-px h-6 bg-antiqueGold/30 mx-1 hidden sm:block"></div>

        {/* Ambient Candlelight Quick Toggle */}
        <button
          onClick={toggleAmbientMode}
          className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-mono text-candleAmber hover:bg-white/5 transition-all flex items-center gap-1.5 border border-amber-500/20"
          title="Toggle chamber ambient lighting exposure"
        >
          <Flame className="w-4 h-4 text-candleAmber animate-flame-flicker" />
          <span className="hidden lg:inline text-[10px] tracking-wider uppercase font-bold">
            {ambientMode === 'warm' ? 'WARM' : 'DIM'}
          </span>
        </button>

        {/* Procedural Audio Drone Toggle */}
        <button
          onClick={toggleAudio}
          className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-mono text-brightGold hover:bg-white/5 transition-all flex items-center gap-1.5 border border-antiqueGold/20"
          title="Toggle procedural ambient synth drone"
        >
          {isAudioActive ? (
            <Volume2 className="w-4 h-4 text-brightGold animate-pulse" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
          <span className="hidden lg:inline text-[10px] tracking-wider uppercase font-bold">
            {isAudioActive ? 'AUDIO ON' : 'AUDIO OFF'}
          </span>
        </button>

      </div>
    </nav>
  );
}
