
import React, { useRef, useEffect } from 'react';
import { Search, X, BookOpen, User, Tag } from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';
import { soundEngine } from '../../audio/AudioSynthesizer';

export default function AstrolabeSearchModal() {
  const { 
    searchQuery, 
    setSearchQuery, 
    filteredPosts, 
    selectPostById, 
    cameraMode, 
    travelTo 
  } = useClandestine();

  const inputRef = useRef(null);

  useEffect(() => {
    if (cameraMode === 'search' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [cameraMode]);

  if (cameraMode !== 'search') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      
      {/* Click outside to return */}
      <div 
        onClick={() => travelTo('chamber')} 
        className="fixed inset-0 cursor-pointer pointer-events-auto"
      />

      {/* Ornate Astrolabe Search Chamber */}
      <div className="relative w-full max-w-3xl gothic-hud-panel rounded-3xl p-6 sm:p-8 border border-brightGold/50 shadow-2xl z-10 pointer-events-auto flex flex-col items-center">
        
        {/* Giant Rotating Concentric Astrolabe Instrument SVG */}
        <div className="relative w-28 h-28 my-2 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(200,159,86,0.6)]">
            <circle cx="50" cy="50" r="47" fill="none" stroke="#C89F56" strokeWidth="1.5" strokeDasharray="4 6" className="astrolabe-ring-outer" />
            <circle cx="50" cy="50" r="37" fill="none" stroke="#E8C77E" strokeWidth="1.2" strokeDasharray="3 4" className="astrolabe-ring-mid" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="#F59E0B" strokeWidth="1.5" className="astrolabe-ring-inner" />
            <circle cx="50" cy="50" r="10" fill="#07090E" stroke="#E8C77E" strokeWidth="2" />
            <circle cx="50" cy="50" r="4" fill="#38BDF8" className="animate-pulse" />
          </svg>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-xl font-bold font-cinzel text-brightGold tracking-widest">
            CELESTIAL ASTROLABE OF THE ARCHIVES
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Rotate the celestial rings to locate any registered scroll, author, or discipline.
          </p>
        </div>

        {/* Live Search Input Bar */}
        <div className="w-full relative flex items-center rounded-2xl bg-black/60 border border-brightGold/60 shadow-xl px-4 py-3 mb-4">
          <Search className="w-5 h-5 text-brightGold mr-3 flex-shrink-0" />
          <input 
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type any word, topic, author, or philosophy..."
            className="w-full bg-transparent text-sm font-cinzel text-amber-100 placeholder:text-slate-500 focus:outline-none tracking-wide"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
              className="p-1 text-slate-400 hover:text-brightGold"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Results Stream */}
        <div className="w-full max-h-60 overflow-y-auto folio-scroll space-y-2 pr-1">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-6 text-slate-400 font-cormorant italic text-sm">
              The astrolabe detects no echoes matching your inquiry.
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div 
                key={post.id}
                onClick={() => {
                  selectPostById(post.id, true);
                }}
                className="p-3 rounded-xl bg-white/[0.03] hover:bg-brightGold/15 border border-white/5 hover:border-brightGold/50 cursor-pointer transition-all flex items-center justify-between group text-left"
              >
                <div>
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-cyan-400 mb-0.5">
                    <span className="uppercase">{post.category}</span>
                    <span>•</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h4 className="text-sm font-bold text-amber-100 group-hover:text-brightGold font-cinzel">
                    {post.title}
                  </h4>
                  <p className="text-xs font-cormorant italic text-slate-400 line-clamp-1">
                    {post.subtitle}
                  </p>
                </div>

                <div className="text-right flex-shrink-0 pl-3">
                  <div className="text-xs font-mono text-candleAmber font-bold">{post.sparks} Sparks</div>
                  <div className="text-[10px] font-mono text-slate-400">{post.author}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Close Button */}
        <button 
          onClick={() => travelTo('chamber')}
          className="mt-5 px-6 py-2 rounded-xl bg-black/60 hover:bg-black/90 text-slate-300 hover:text-brightGold border border-antiqueGold/30 text-xs font-mono tracking-wider transition-all"
        >
          Close Astrolabe
        </button>

      </div>

    </div>
  );
}
