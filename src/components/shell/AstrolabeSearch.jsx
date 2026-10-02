
import React, { useState, useRef } from 'react';
import { Search, X, BookOpen, User } from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';
import { soundEngine } from '../../audio/AudioSynthesizer';

export default function AstrolabeSearch() {
  const { searchQuery, setSearchQuery, filteredPosts, selectPostById } = useClandestine();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleFocus = () => {
    setIsFocused(true);
    soundEngine.playAstrolabeTick();
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
    }, 220);
  };

  return (
    <div className="relative select-none z-30">
      
      {/* Concentric Rotating Astrolabe Mechanism */}
      <div 
        className={`relative flex items-center rounded-2xl transition-all duration-300 px-3.5 py-1.5 bg-black/60 border ${
          isFocused 
            ? 'border-brightGold shadow-[0_0_25px_rgba(232,199,126,0.35)]' 
            : 'border-antiqueGold/30 hover:border-antiqueGold/60 shadow-lg'
        }`}
        style={{
          backdropFilter: 'blur(16px)'
        }}
      >
        
        {/* Brass Concentric Rings Instrument */}
        <div className="relative w-8 h-8 mr-2.5 flex-shrink-0 flex items-center justify-center cursor-pointer" onClick={() => inputRef.current?.focus()}>
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_6px_rgba(200,159,86,0.4)]">
            {/* Outer Ring with Degree Markings */}
            <circle 
              cx="50" cy="50" r="46" 
              fill="none" 
              stroke="#C89F56" 
              strokeWidth="1.8" 
              strokeDasharray="4 6"
              className={isFocused ? 'astrolabe-ring-inner' : 'astrolabe-ring-outer'} 
            />
            {/* Mid Ring with Interlocking Marks */}
            <circle 
              cx="50" cy="50" r="34" 
              fill="none" 
              stroke="#E8C77E" 
              strokeWidth="1.2" 
              strokeDasharray="2 4"
              className={isFocused ? 'astrolabe-ring-outer' : 'astrolabe-ring-mid'} 
            />
            {/* Inner Ring */}
            <circle 
              cx="50" cy="50" r="22" 
              fill="none" 
              stroke="#F59E0B" 
              strokeWidth="1.2" 
              className="astrolabe-ring-inner" 
            />
            {/* Central Optical Lens */}
            <circle 
              cx="50" cy="50" r="8" 
              fill={isFocused ? "#F59E0B" : "#07090E"} 
              stroke="#E8C77E" 
              strokeWidth="2"
              className="transition-colors duration-300"
            />
            <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" opacity={isFocused ? 1 : 0.6} />
          </svg>
        </div>

        {/* Inscribed Search Bar */}
        <input 
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Inscribe search across the archives..."
          className="bg-transparent text-xs font-cinzel text-slate-200 placeholder:text-slate-500 focus:outline-none w-48 sm:w-60 tracking-wider"
        />

        {searchQuery ? (
          <button 
            onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
            className="p-1 text-slate-400 hover:text-brightGold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Search className="w-3.5 h-3.5 text-antiqueGold/60 ml-1" />
        )}
      </div>

      {/* Astrolabe Archival Matches Dropdown */}
      {isFocused && (
        <div className="astrolabe-search-dropdown absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-2xl p-3 bg-black/90 backdrop-blur-xl border border-brightGold/50 shadow-2xl max-h-80 overflow-y-auto folio-scroll z-50">
          <div className="text-[9px] font-mono text-brightGold uppercase tracking-widest px-2 py-1 border-b border-antiqueGold/20 mb-2 flex items-center justify-between">
            <span>ASTROLABE ARCHIVE MATCHES</span>
            <span>{filteredPosts.length} FOUND</span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-4 text-center text-xs font-cormorant italic text-slate-400">
              No manuscripts inscribed matching your query.
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredPosts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  onMouseDown={() => {
                    selectPostById(post.id);
                    setSearchQuery('');
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-antiqueGold/20 border border-white/5 hover:border-antiqueGold/40 cursor-pointer transition-all text-left group"
                >
                  <div className="flex items-center justify-between text-[9px] font-mono text-antiqueGold mb-1">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-cyan-400" />
                      {post.category}
                    </span>
                    <span>{post.readingTime}</span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-200 group-hover:text-brightGold font-cinzel line-clamp-1">
                    {post.title}
                  </h5>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <User className="w-2.5 h-2.5" />
                      {post.author}
                    </span>
                    <span className="text-candleAmber font-semibold">{post.sparks} Sparks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
