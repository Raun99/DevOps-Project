
import React from 'react';
import { useClandestine } from '../../context/ClandestineContext';
import { Sparkles, BookOpen } from 'lucide-react';

export default function FloatingScrolls() {
  const { filteredPosts, selectPostById, cameraMode, activeCategory } = useClandestine();

  // If in reading mode, hide floating scrolls to focus on codex
  if (cameraMode === 'reading') return null;

  // Take first 3 posts from currently active category filter
  const scrollPosts = filteredPosts.slice(0, 3);
  if (scrollPosts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none select-none">
      
      {/* Floating Scroll 1: Left Balcony Wing */}
      {scrollPosts[0] && (
        <div 
          onClick={() => selectPostById(scrollPosts[0].id, true)}
          className="pointer-events-auto absolute left-[16%] lg:left-[22%] top-[18%] w-60 sm:w-72 p-4 rounded-2xl gothic-hud-panel corner-rune cursor-pointer float-scroll-1 group transition-all duration-500 hover:scale-110 hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(56,189,248,0.5)] z-20"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1.5 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>FOLIO #01</span>
            </span>
            <span className="uppercase px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-[9px]">
              {scrollPosts[0].category}
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-cyan-300 transition-colors line-clamp-2 font-cinzel leading-snug">
            {scrollPosts[0].title}
          </h4>
          <p className="text-[11px] font-cormorant italic text-slate-300 mt-1 line-clamp-2">
            {scrollPosts[0].subtitle}
          </p>
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-amber-300/80 font-mono">
            <span>{scrollPosts[0].author}</span>
            <span className="text-candleAmber font-bold flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>Read Codex »</span>
            </span>
          </div>
        </div>
      )}

      {/* Floating Scroll 2: Right Upper Balcony */}
      {scrollPosts[1] && (
        <div 
          onClick={() => selectPostById(scrollPosts[1].id, true)}
          className="pointer-events-auto absolute right-[6%] lg:right-[14%] top-[20%] w-60 sm:w-72 p-4 rounded-2xl gothic-hud-panel corner-rune cursor-pointer float-scroll-2 group transition-all duration-500 hover:scale-110 hover:border-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] z-20"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 mb-1.5 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>FOLIO #02</span>
            </span>
            <span className="uppercase px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-[9px]">
              {scrollPosts[1].category}
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-amber-300 transition-colors line-clamp-2 font-cinzel leading-snug">
            {scrollPosts[1].title}
          </h4>
          <p className="text-[11px] font-cormorant italic text-slate-300 mt-1 line-clamp-2">
            {scrollPosts[1].subtitle}
          </p>
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-amber-300/80 font-mono">
            <span>{scrollPosts[1].author}</span>
            <span className="text-candleAmber font-bold flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>Read Codex »</span>
            </span>
          </div>
        </div>
      )}

      {/* Floating Scroll 3: Lower Right Balcony (if exists) */}
      {scrollPosts[2] && (
        <div 
          onClick={() => selectPostById(scrollPosts[2].id, true)}
          className="pointer-events-auto absolute right-[8%] lg:right-[16%] bottom-[24%] w-60 sm:w-68 p-4 rounded-2xl gothic-hud-panel corner-rune cursor-pointer float-scroll-3 group transition-all duration-500 hover:scale-110 hover:border-emerald-400 hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] z-20 hidden md:block"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 mb-1.5 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              <span>FOLIO #03</span>
            </span>
            <span className="uppercase px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-[9px]">
              {scrollPosts[2].category}
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-emerald-300 transition-colors line-clamp-2 font-cinzel leading-snug">
            {scrollPosts[2].title}
          </h4>
          <p className="text-[11px] font-cormorant italic text-slate-300 mt-1 line-clamp-2">
            {scrollPosts[2].subtitle}
          </p>
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-amber-300/80 font-mono">
            <span>{scrollPosts[2].author}</span>
            <span className="text-candleAmber font-bold flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>Read Codex »</span>
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
