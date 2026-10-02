
import React, { useState } from 'react';
import { useClandestine } from '../../context/ClandestineContext';
import { soundEngine } from '../../audio/AudioSynthesizer';
import { BookOpen, Search, Library, Flame, Sparkles, Compass, Eye, MapPin } from 'lucide-react';

export default function InteractiveHotspots({ onZoneTravel, currentZone }) {
  const { 
    cameraMode, 
    travelTo, 
    toggleAmbientMode, 
    ambientMode, 
    currentPost 
  } = useClandestine();

  const [catMessage, setCatMessage] = useState(null);

  const handleCatClick = (e) => {
    e.stopPropagation();
    soundEngine.playCatPurr();
    const secrets = [
      "*purrs softly* 'The celestial rings shift when midnight approaches...'",
      "*stretches paws* 'Did you know? Every tome in the rack filters the manuscripts.'",
      "*eyes gleam golden* 'The astrolabe uncovers hidden scrolls across all eight disciplines.'",
      "*curls tail* 'Touch the candle flame to bathe the chamber in warm radiance.'"
    ];
    setCatMessage(secrets[Math.floor(Math.random() * secrets.length)]);
    setTimeout(() => setCatMessage(null), 4000);
  };

  const handleCandleClick = (e) => {
    e.stopPropagation();
    toggleAmbientMode();
  };

  // Only show hotspots when not reading
  if (cameraMode === 'reading') return null;

  // In Cathedral view:
  if (cameraMode === 'cathedral') {
    return (
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Return to Observatory Button */}
        <div className="pointer-events-auto absolute bottom-24 left-1/2 -translate-x-1/2">
          <button
            onClick={() => travelTo('chamber')}
            className="px-6 py-3 rounded-2xl bg-black/80 hover:bg-black/95 text-brightGold border border-brightGold/50 shadow-[0_0_35px_rgba(200,159,86,0.6)] backdrop-blur-md flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group font-cinzel text-xs tracking-widest font-bold cursor-pointer"
          >
            <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform" />
            <span>RETURN TO OBSERVATORY STUDY</span>
          </button>
        </div>

        {/* Cathedral Sanctuary Astrolabe */}
        <div className="pointer-events-auto absolute top-[44%] left-1/2 -translate-x-1/2">
          <button
            onClick={() => travelTo('search')}
            className="p-4 rounded-full bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-400/60 shadow-[0_0_30px_rgba(56,189,248,0.5)] backdrop-blur-md flex items-center gap-2.5 transition-all hover:scale-110 font-cinzel text-xs font-bold cursor-pointer animate-pulse"
          >
            <Search className="w-5 h-5 text-cyan-300 animate-spin-slow" />
            <span className="hidden sm:inline">COMMUNE WITH SANCTUARY ASTROLABE</span>
          </button>
        </div>
      </div>
    );
  }

  // In Observatory Chamber:
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      
      {/* 1. HOTSPOT: Open Manuscript on the Scholar Desk (Center-Bottom) */}
      <div className="pointer-events-auto absolute left-[50%] top-[66%] -translate-x-1/2 -translate-y-1/2 group">
        <button
          onClick={(e) => {
            e.stopPropagation();
            travelTo('reading');
          }}
          className="relative px-5 py-2.5 rounded-2xl bg-black/80 hover:bg-black/95 text-brightGold border border-brightGold/70 shadow-[0_0_30px_rgba(245,158,11,0.6)] backdrop-blur-md flex items-center gap-3 transition-all hover:scale-110 active:scale-95 font-cinzel text-xs tracking-wider font-bold cursor-pointer"
          title="Click to open illuminated codex and read full article"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-candleAmber opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-candleAmber"></span>
          </span>
          <BookOpen className="w-4 h-4 text-candleAmber" />
          <div className="text-left">
            <div className="text-[10px] text-amber-300/80 font-mono">FEATURED MANUSCRIPT</div>
            <div className="text-xs font-bold font-cinzel text-brightGold">READ: "{currentPost.title.slice(0, 28)}..." »</div>
          </div>
        </button>
      </div>

      {/* 2. HOTSPOT: Celestial Balcony Vista (Walk to Edge) */}
      <div className="pointer-events-auto absolute left-[50%] top-[34%] -translate-x-1/2 group">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onZoneTravel('balcony');
          }}
          className={`relative px-4 py-2 rounded-2xl backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 font-cinzel text-xs tracking-wider font-bold cursor-pointer border ${
            currentZone === 'balcony'
              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.5)]'
              : 'bg-black/60 hover:bg-black/85 border-white/20 text-slate-300 hover:text-cyan-300'
          }`}
          title="Walk forward to the observatory balcony"
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          <span>{currentZone === 'balcony' ? 'AT BALCONY EDGE' : 'WALK TO BALCONY VISTA »'}</span>
        </button>
      </div>

      {/* 3. HOTSPOT: Celestial Astrolabe on Left Shelf */}
      <div className="pointer-events-auto absolute left-[16%] top-[42%] group">
        <button
          onClick={(e) => {
            e.stopPropagation();
            travelTo('search');
          }}
          className="relative p-3 rounded-2xl bg-black/75 hover:bg-black/95 text-brightGold border border-antiqueGold/60 shadow-[0_0_25px_rgba(200,159,86,0.45)] backdrop-blur-md flex items-center gap-2.5 transition-all hover:scale-110 font-cinzel text-xs tracking-wider cursor-pointer"
          title="Turn the celestial astrolabe search apparatus"
        >
          <Search className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span className="hidden sm:inline font-bold">CELESTIAL ASTROLABE (SEARCH)</span>
        </button>
      </div>

      {/* 4. HOTSPOT: Glowing Candle Flame (Exposure Toggle) */}
      <div className="pointer-events-auto absolute right-[15%] bottom-[28%] group">
        <button
          onClick={handleCandleClick}
          className="relative p-3 rounded-2xl bg-black/75 hover:bg-black/95 text-candleAmber border border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.65)] backdrop-blur-md flex items-center gap-2 transition-all hover:scale-110 cursor-pointer"
          title="Click to toggle chamber ambient exposure"
        >
          <Flame className="w-4 h-4 text-candleAmber animate-flame-flicker" />
          <span className="text-[11px] font-mono tracking-wider font-bold">
            {ambientMode === 'warm' ? 'CANDLE: RADIANT' : 'CANDLE: DIM'}
          </span>
        </button>
      </div>

      {/* 5. HOTSPOT: Sleeping Cat Familiar */}
      <div className="pointer-events-auto absolute left-[36%] bottom-[23%] group">
        <button
          onClick={handleCatClick}
          className="relative px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-amber-200 border border-brightGold/40 hover:border-brightGold shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all hover:scale-110 text-[10px] font-mono tracking-wider cursor-pointer"
          title="A sleek black familiar sleeping beside the scrolls... (Click to pet)"
        >
          <Sparkles className="w-3 h-3 text-brightGold animate-pulse" />
          <span>PET FAMILIAR</span>
        </button>

        {catMessage && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-black/95 border-2 border-brightGold text-amber-200 text-xs font-cormorant italic shadow-[0_0_25px_rgba(232,199,126,0.6)] z-50 pointer-events-none animate-bounce">
            {catMessage}
          </div>
        )}
      </div>

      {/* 6. HOTSPOT: Citadel Cathedral Portal */}
      <div className="pointer-events-auto absolute top-[30%] right-[16%] group">
        <button
          onClick={(e) => {
            e.stopPropagation();
            travelTo('cathedral');
          }}
          className="relative px-4 py-2 rounded-2xl bg-black/80 hover:bg-black/95 text-cyan-300 border border-cyan-400/60 shadow-[0_0_25px_rgba(56,189,248,0.5)] backdrop-blur-md flex items-center gap-2 transition-all hover:scale-110 active:scale-95 font-cinzel text-xs tracking-widest font-bold cursor-pointer"
          title="Walk through the grand archway into the Citadel Cathedral"
        >
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>ENTER CITADEL NAVE »</span>
        </button>
      </div>

    </div>
  );
}
