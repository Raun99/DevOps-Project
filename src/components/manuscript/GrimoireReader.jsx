
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Bookmark, 
  MessageSquare, 
  Send, 
  Clock, 
  Share2,
  Compass,
  ArrowDown
} from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';
import { soundEngine } from '../../audio/AudioSynthesizer';

export default function GrimoireReader() {
  const { 
    currentPost, 
    nextPost, 
    prevPost, 
    toggleLike, 
    toggleBookmark, 
    likedIds, 
    bookmarkedIds,
    addEchoComment,
    filteredPosts,
    activePostIndex,
    cameraMode,
    travelTo
  } = useClandestine();

  const [isEchoDrawerOpen, setIsEchoDrawerOpen] = useState(false);
  const [echoAuthor, setEchoAuthor] = useState('');
  const [echoText, setEchoText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollContainerRef = useRef(null);

  // Esc key and arrow navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && cameraMode === 'reading') {
        travelTo('chamber');
      }
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (e.key === 'ArrowRight') nextPost();
        if (e.key === 'ArrowLeft') prevPost();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cameraMode, nextPost, prevPost, travelTo]);

  // Track scroll percentage
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const progress = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100) || 0;
    setScrollProgress(progress);
  };

  // Dedicated mouse wheel handler on the container to guarantee smooth scrolling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      el.scrollTop += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => el.removeEventListener('wheel', onWheel);
  }, [cameraMode, currentPost]);

  if (cameraMode !== 'reading' || !currentPost) return null;

  const isLiked = likedIds.includes(currentPost.id);
  const isBookmarked = bookmarkedIds.includes(currentPost.id);

  const handleEchoSubmit = (e) => {
    e.preventDefault();
    if (!echoText.trim()) return;
    addEchoComment(currentPost.id, echoAuthor.trim(), echoText.trim());
    setEchoText('');
    setIsEchoDrawerOpen(false);
  };

  const handleShare = () => {
    soundEngine.playManaChime();
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1800);
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 350, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fade-in select-none">
      
      {/* Outer Click to Close Backdrop */}
      <div 
        onClick={() => travelTo('chamber')} 
        className="fixed inset-0 cursor-pointer pointer-events-auto"
      />

      {/* Main Illuminated Grimoire Codex Container */}
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col z-10 pointer-events-auto">
        
        {/* Top Folio Ribbon Navigation & Close Controls */}
        <div className="gothic-hud-panel px-4 sm:px-6 py-2.5 rounded-2xl flex items-center justify-between mb-2 text-xs border border-brightGold/50 shadow-2xl flex-shrink-0">
          
          {/* Domain & Reading Stats */}
          <div className="flex items-center space-x-3">
            <span className="text-brightGold font-cinzel font-bold tracking-wider flex items-center gap-1.5 text-xs sm:text-sm">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>{currentPost.categoryLabel}</span>
            </span>
            <span className="text-slate-600">❖</span>
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-antiqueGold" />
              {currentPost.readingTime}
            </span>
            <span className="hidden md:inline text-amber-300/80 font-mono text-[11px]">
              • Scroll {scrollProgress}%
            </span>
          </div>

          {/* Navigation Controls & Close */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={prevPost}
              className="px-3 py-1.5 rounded-xl bg-black/60 text-slate-300 hover:text-brightGold hover:border-brightGold border border-white/10 transition-all font-mono text-xs flex items-center gap-1 cursor-pointer"
              title="Previous Scroll (Left Arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prior</span>
            </button>

            <div className="px-3 py-1 font-mono text-xs text-brightGold font-bold bg-black/80 rounded-lg border border-antiqueGold/40">
              {activePostIndex + 1} / {filteredPosts.length}
            </div>

            <button 
              onClick={nextPost}
              className="px-3 py-1.5 rounded-xl bg-black/60 text-slate-300 hover:text-brightGold hover:border-brightGold border border-white/10 transition-all font-mono text-xs flex items-center gap-1 cursor-pointer"
              title="Next Scroll (Right Arrow)"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={() => travelTo('chamber')}
              className="px-3 py-1.5 rounded-xl bg-waxCrimson hover:bg-waxCrimson/80 text-white font-cinzel text-xs font-bold transition-all ml-2 flex items-center gap-1.5 cursor-pointer shadow-lg border border-red-500/50"
              title="Step back to Observatory (Esc)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">CLOSE</span>
            </button>
          </div>

        </div>

        {/* Scroll Progress Bar */}
        <div className="w-full h-1 bg-black/50 rounded-full mb-2 overflow-hidden border border-white/5 flex-shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-amber-600 via-brightGold to-cyan-400 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* The Deeply Scrollable Ancient Illuminated Grimoire Book */}
        <div className="relative grimoire-folio rounded-3xl border-4 border-[#3d2718] overflow-hidden flex-1 flex flex-col shadow-[0_30px_90px_rgba(0,0,0,0.98)]">
          
          {/* Scrollable Folio Body Area with styled and responsive scrolling */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-y-auto folio-scroll p-6 sm:p-12 space-y-8 flex-1 select-text"
            style={{ maxHeight: 'calc(92vh - 120px)' }}
          >
            
            {/* Header Rubric */}
            <div className="flex items-center justify-between text-xs font-mono text-[#78593a] pb-3 border-b-2 border-[#8c6742]/40">
              <span className="font-bold tracking-widest">IMPERIAL ARCHIVE CODEX // {currentPost.id.toUpperCase()}</span>
              <span className="tracking-wider">{currentPost.cycle}</span>
            </div>

            {/* Article Title */}
            <h1 className="font-cinzel text-2xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight tracking-tight">
              {currentPost.title}
            </h1>

            {/* Subtitle / Excerpt */}
            <p className="font-cormorant italic text-[#4a321e] text-xl sm:text-2xl leading-relaxed border-l-4 border-waxCrimson pl-5 py-1 bg-amber-900/[0.04] rounded-r-xl">
              {currentPost.subtitle}
            </p>

            {/* Author Medallion & Guild Seal */}
            <div className="flex items-center justify-between pb-4 border-b border-[#8c6742]/30">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-full bg-[#2a1a0f] text-amber-200 flex items-center justify-center font-bold text-base font-mono shadow-md border-2 border-brightGold/60">
                  {currentPost.authorAvatar}
                </div>
                <div>
                  <div className="text-lg font-bold text-ink font-cinzel">{currentPost.author}</div>
                  <div className="text-xs font-mono text-[#6d4d31]">{currentPost.authorRole}</div>
                </div>
              </div>

              {/* Scroll Down Helper Button */}
              <button
                onClick={scrollToBottom}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3d2718]/10 hover:bg-[#3d2718]/25 text-[#4a321e] font-mono text-xs transition-colors cursor-pointer border border-[#8c6742]/30"
              >
                <span>Scroll Down</span>
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
              </button>
            </div>

            {/* Primary Manuscript Editorial Prose (Deeply Scrollable Two-Column Flow) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-[#241a12] font-cormorant text-xl leading-relaxed text-justify">
              
              {/* Left Column Prose with Illuminated Medieval Drop-Cap */}
              <div className="space-y-6">
                <p>
                  <span className="float-left text-7xl font-cinzel-dec font-bold leading-none pr-4 pt-1 text-waxCrimson drop-shadow-sm">
                    {currentPost.leadDropCap}
                  </span>
                  {currentPost.contentLeft.trim()}
                </p>

                {/* Illuminated Quote Plaque */}
                <div className="p-5 rounded-2xl bg-amber-950/[0.06] border-2 border-[#8c6742]/30 font-cormorant italic text-lg text-[#3d2718] shadow-inner">
                  "In the deep silence of the observatory, knowledge is not merely stored; it gathers gravity, bending the surrounding thoughts into new orbits."
                </div>

                <p>
                  Every celestial observation begins with a posture of humility. When scholars gaze across the vast starry abyss, the architecture of the sky reflects the hidden patterns of our own world. The ancient scrolls were never meant to be locked away—they were written to be discovered, shared, and debated across generations.
                </p>
              </div>

              {/* Right Column Prose Continuation */}
              <div className="space-y-6">
                <p>{currentPost.contentRight.trim()}</p>

                <p>
                  As the observatory astrolabe turns, new disciplines intersect. The boundaries separating technology, philosophy, and cosmological inquiry dissolve into a single coherent pursuit of truth.
                </p>
                
                {/* Diegetic Tags */}
                <div className="pt-4 border-t border-[#8c6742]/20">
                  <div className="text-xs font-cinzel font-bold text-[#6d4d31] mb-2">ARCHIVAL TOPIC TAGS:</div>
                  <div className="flex flex-wrap gap-2">
                    {currentPost.tags && currentPost.tags.map((t, idx) => (
                      <span key={idx} className="text-xs font-mono px-3 py-1 rounded-lg bg-black/10 border border-[#8c6742]/40 text-[#4a321e] font-semibold">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Diegetic Essence Resonance & Interactive Controls Bar */}
            <div className="p-5 rounded-2xl border-2 border-[#8c6742]/50 bg-[#e8dcbe] shadow-inner flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold font-cinzel text-ink tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-700" />
                  <span>ESSENCE RESONANCE</span>
                </h4>
                <p className="text-xs font-mono text-[#6d4d31]">Infuse celestial sparks or affix royal wax seal to forbidden shelf</p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Like / Spark Infusion Button */}
                <button 
                  onClick={() => toggleLike(currentPost.id)}
                  className={`wax-seal-button px-6 py-3 rounded-full text-amber-100 font-cinzel text-xs font-bold tracking-wider flex items-center gap-2.5 transition-all cursor-pointer shadow-xl ${
                    isLiked ? 'scale-105 filter brightness-125 ring-2 ring-brightGold' : ''
                  }`}
                  title="Infuse Sparks of Resonance (Like)"
                >
                  <Zap className="w-4 h-4 fill-amber-200 text-amber-200" />
                  <span>{currentPost.sparks.toLocaleString()} SPARKS</span>
                </button>

                {/* Bookmark Button */}
                <button 
                  onClick={() => toggleBookmark(currentPost.id)}
                  className={`p-3 rounded-xl transition-all border cursor-pointer ${
                    isBookmarked 
                      ? 'bg-waxCrimson text-white border-waxCrimson shadow-lg' 
                      : 'bg-[#d8cbb1] text-ink hover:bg-[#c9baa0] border-[#8c6742]/50'
                  }`}
                  title={isBookmarked ? "Affixed to Forbidden Shelf" : "Affix to Forbidden Shelf"}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
                </button>

                {/* Share Button */}
                <button 
                  onClick={handleShare}
                  className="p-3 rounded-xl bg-[#d8cbb1] text-ink hover:bg-[#c9baa0] border border-[#8c6742]/50 transition-all cursor-pointer"
                  title="Copy Scroll Leyline URL"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {copiedShare && (
              <div className="text-xs font-mono text-center text-emerald-900 bg-emerald-200/90 p-2.5 rounded-xl border border-emerald-500 font-bold">
                ❖ Leyline URL inscribed to clipboard ❖
              </div>
            )}

            {/* Scribe Marginalia Notes Section (Threaded Comments) */}
            <div className="space-y-4 pt-6 border-t-2 border-[#8c6742]/40">
              <div className="flex items-center justify-between pb-3 border-b border-[#8c6742]/30">
                <span className="text-base font-bold text-ink font-cinzel flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#8c6742]" />
                  <span>SCHOLAR MARGINALIA ({currentPost.echoes?.length || 0})</span>
                </span>
                <button 
                  onClick={() => setIsEchoDrawerOpen(!isEchoDrawerOpen)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#3d2718]/15 hover:bg-[#3d2718]/25 text-[#4a321e] font-mono text-xs font-bold border border-[#8c6742]/40 cursor-pointer"
                >
                  {isEchoDrawerOpen ? 'Close Inscription' : '+ Scribe Annotation'}
                </button>
              </div>

              {/* Annotation Draft Box */}
              {isEchoDrawerOpen && (
                <form onSubmit={handleEchoSubmit} className="p-5 bg-white/95 rounded-2xl border-2 border-[#8c6742]/50 space-y-3.5 shadow-xl">
                  <input 
                    type="text"
                    value={echoAuthor}
                    onChange={(e) => setEchoAuthor(e.target.value)}
                    placeholder="Scholar Signet / Name (e.g. Master Corvus)"
                    className="w-full text-xs font-mono p-3 rounded-xl bg-white border border-[#8c6742]/50 text-ink focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                  <textarea 
                    rows={3}
                    value={echoText}
                    onChange={(e) => setEchoText(e.target.value)}
                    placeholder="Record your critical commentary upon the parchment margin..."
                    className="w-full text-base font-cormorant p-3.5 rounded-xl bg-white border border-[#8c6742]/50 text-ink focus:outline-none focus:ring-2 focus:ring-amber-600 leading-relaxed"
                  />
                  <div className="flex justify-end space-x-3">
                    <button 
                      type="button" 
                      onClick={() => setIsEchoDrawerOpen(false)}
                      className="px-4 py-2 text-xs font-mono text-[#6d4d31] hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#2a1a0f] text-amber-200 text-xs font-cinzel font-bold hover:bg-[#422918] transition-colors flex items-center gap-2 shadow-lg cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Affix Signet Seal</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Echoes List */}
              <div className="space-y-3">
                {currentPost.echoes && currentPost.echoes.map((echo) => (
                  <div key={echo.id} className="p-4 rounded-xl bg-white/85 border border-[#8c6742]/35 text-xs shadow-sm">
                    <div className="font-bold text-ink flex items-center justify-between mb-1.5">
                      <span className="font-cinzel text-xs text-[#2a1a0f]">{echo.name}</span>
                      <span className="text-[10px] font-mono text-[#8c6742]">{echo.timestamp}</span>
                    </div>
                    <div className="text-[#3b291a] font-cormorant text-lg leading-relaxed">{echo.text}</div>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom Spacer */}
            <div className="h-10" />

          </div>

          {/* Folio Bottom Border Bar */}
          <div className="p-3 bg-[#e8dbbf] border-t-2 border-[#8c6742]/40 flex items-center justify-between text-xs font-mono text-[#6d4d31] flex-shrink-0">
            <span className="tracking-widest">❖ ET LUX IN TENEBRIS LUCET ❖</span>
            <button 
              onClick={() => travelTo('chamber')}
              className="px-4 py-1.5 rounded-xl bg-[#2a1a0f] text-amber-200 font-cinzel font-bold hover:bg-waxCrimson transition-colors cursor-pointer shadow"
            >
              « RETURN TO OBSERVATORY CHAMBER
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
