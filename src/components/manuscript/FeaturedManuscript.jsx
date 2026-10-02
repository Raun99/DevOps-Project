
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Bookmark, 
  MessageSquare, 
  Send, 
  Clock, 
  Share2
} from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';
import { soundEngine } from '../../audio/AudioSynthesizer';

export default function FeaturedManuscript() {
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
    activePostIndex
  } = useClandestine();

  const [isEchoOpen, setIsEchoOpen] = useState(false);
  const [echoAuthor, setEchoAuthor] = useState('');
  const [echoText, setEchoText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') nextPost();
      if (e.key === 'ArrowLeft') prevPost();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPost, prevPost]);

  if (!currentPost) return null;

  const isLiked = likedIds.includes(currentPost.id);
  const isBookmarked = bookmarkedIds.includes(currentPost.id);

  const handleEchoSubmit = (e) => {
    e.preventDefault();
    if (!echoText.trim()) return;
    addEchoComment(currentPost.id, echoAuthor.trim(), echoText.trim());
    setEchoText('');
    setIsEchoOpen(false);
  };

  const handleShare = () => {
    soundEngine.playManaChime();
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1800);
  };

  return (
    <article className="relative w-full select-none">
      
      {/* Physical Grimoire Leather Casing & Open Pages */}
      <div 
        className="relative grimoire-codex rounded-3xl border-4 border-[#24170d] grid grid-cols-1 lg:grid-cols-2 overflow-hidden min-h-[490px] max-h-[580px] contact-shadow-heavy"
        style={{
          transform: 'perspective(1200px) rotateX(1.5deg) rotateZ(-0.4deg)',
        }}
      >
        
        {/* Integrated Leather Spine Shadow Crease */}
        <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 bg-gradient-to-r from-black/50 via-black/15 to-black/50 pointer-events-none z-30 shadow-2xl"></div>

        {/* LEFT FOLIO (Cooler Moonlit Ambient Starlight from Archway) */}
        <section className="folio-left p-6 sm:p-8 flex flex-col justify-between overflow-y-auto folio-scroll border-b lg:border-b-0 lg:border-r border-[#8c6742]/40 relative">
          <div>
            {/* Rubricated Header & Cycle Tag */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#78593a] pb-2 border-b border-[#8c6742]/30 mb-3">
              <span className="font-semibold">{currentPost.categoryLabel}</span>
              <span>{currentPost.cycle}</span>
            </div>

            {/* Article Title */}
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-ink leading-tight tracking-tight mb-2">
              {currentPost.title}
            </h1>

            {/* Subtitle / Excerpt */}
            <p className="font-cormorant italic text-[#523924] text-sm sm:text-base mb-4 leading-snug">
              {currentPost.subtitle}
            </p>

            {/* Author Medallion & Guild Seal */}
            <div className="flex items-center space-x-2.5 mb-4 pb-3 border-b border-[#8c6742]/30">
              <div className="w-8 h-8 rounded-full bg-[#382314] text-amber-200 flex items-center justify-center font-bold text-xs font-mono shadow-md border border-[#8c6742]/50">
                {currentPost.authorAvatar}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-ink font-cinzel">{currentPost.author}</div>
                <div className="text-[10px] font-mono text-[#6d4d31]">{currentPost.authorRole}</div>
              </div>
            </div>

            {/* Left Manuscript Body with Illuminated Medieval Drop-Cap */}
            <div className="font-cormorant text-base sm:text-[17px] text-[#241a12] leading-relaxed text-justify space-y-3">
              <p>
                <span className="float-left text-4xl sm:text-5xl font-cinzel-dec font-bold leading-none pr-2.5 pt-1 text-waxCrimson">
                  {currentPost.leadDropCap}
                </span>
                {currentPost.contentLeft.trim()}
              </p>
            </div>
          </div>

          {/* Folio Recto Footer & Integrated Page Turn Ribbon */}
          <div className="pt-4 border-t border-[#8c6742]/30 flex items-center justify-between text-[10px] font-mono text-[#6d4d31]">
            <button 
              onClick={prevPost}
              className="hover:text-ink font-bold flex items-center gap-1 transition-colors"
              title="Turn to Prior Manuscript (Left Arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>« PRIOR FOLIO</span>
            </button>
            <span className="tracking-widest hidden sm:inline">❖ CODEX CLANDESTINE ❖</span>
            <span className="font-bold">{activePostIndex + 1} / {filteredPosts.length}</span>
          </div>
        </section>

        {/* RIGHT FOLIO (Warmer Candlelit Ambient Exposure) */}
        <section className="folio-right p-6 sm:p-8 flex flex-col justify-between overflow-y-auto folio-scroll relative">
          <div>
            {/* Continuation Body */}
            <div className="font-cormorant text-base sm:text-[17px] text-[#241a12] leading-relaxed text-justify space-y-3 mb-4">
              <p>{currentPost.contentRight.trim()}</p>
            </div>

            {/* Authentically Integrated Wax Seal & Marginalia Controls */}
            <div className="pt-3 pb-2 border-t border-[#8c6742]/30 flex flex-wrap items-center justify-between gap-2 mb-3">
              
              {/* Crimson Wax Seal Stamp (Like / Spark Infusion) */}
              <button 
                onClick={() => toggleLike(currentPost.id)}
                className="wax-seal-button px-4 py-2 rounded-full text-amber-100 font-cinzel text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                title="Affix wax seal of resonance (Like)"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
                <span>{currentPost.sparks.toLocaleString()} SPARKS</span>
              </button>

              <div className="flex items-center space-x-1.5">
                {/* Ribbon Bookmark */}
                <button 
                  onClick={() => toggleBookmark(currentPost.id)}
                  className={`p-2 rounded-xl transition-all border ${
                    isBookmarked 
                      ? 'bg-waxCrimson text-white border-waxCrimson shadow-md' 
                      : 'bg-[#ebe0ca] text-ink hover:bg-[#d8cbb1] border-[#8c6742]/40'
                  }`}
                  title={isBookmarked ? "Affixed to Forbidden Shelf" : "Affix to Forbidden Shelf"}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
                </button>

                {/* Share Scroll */}
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-[#ebe0ca] text-ink hover:bg-[#d8cbb1] border border-[#8c6742]/40 transition-all"
                  title="Copy Scroll Leyline URL"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {copiedShare && (
              <div className="text-[10px] font-mono text-center text-emerald-800 bg-emerald-100/70 p-1 rounded mb-2">
                * Leyline URL inscribed to clipboard *
              </div>
            )}

            {/* Scribe Marginalia Notes (Threaded Annotations) */}
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#8c6742]/30">
                <span className="text-xs font-bold text-ink font-cinzel flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-[#8c6742]" />
                  <span>SCHOLAR MARGINALIA ({currentPost.echoes?.length || 0})</span>
                </span>
                <button 
                  onClick={() => setIsEchoOpen(!isEchoOpen)}
                  className="text-[11px] font-mono text-amber-900 font-bold hover:underline"
                >
                  {isEchoOpen ? 'Close Note' : '+ Inscribe Margin Note'}
                </button>
              </div>

              {/* Scribe Annotation Inscription Drawer */}
              {isEchoOpen && (
                <form onSubmit={handleEchoSubmit} className="p-2.5 bg-white/85 rounded-xl border border-[#8c6742]/40 space-y-1.5">
                  <input 
                    type="text"
                    value={echoAuthor}
                    onChange={(e) => setEchoAuthor(e.target.value)}
                    placeholder="Scholar Signet (optional)"
                    className="w-full text-[11px] font-mono p-1 rounded bg-white border border-[#8c6742]/40 text-ink focus:outline-none"
                  />
                  <textarea 
                    rows={2}
                    value={echoText}
                    onChange={(e) => setEchoText(e.target.value)}
                    placeholder="Inscribe commentary upon the margin..."
                    className="w-full text-xs font-cormorant p-1.5 rounded bg-white border border-[#8c6742]/40 text-ink focus:outline-none"
                  />
                  <div className="flex justify-end space-x-1.5">
                    <button 
                      type="button" 
                      onClick={() => setIsEchoOpen(false)}
                      className="px-2 py-0.5 text-[10px] font-mono text-[#6d4d31]"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-2.5 py-0.5 rounded bg-[#382314] text-amber-200 text-[10px] font-mono hover:bg-[#52331c] transition-colors flex items-center gap-1"
                    >
                      <Send className="w-2.5 h-2.5" />
                      <span>Affix</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Marginalia Echoes */}
              <div className="space-y-1.5 max-h-32 overflow-y-auto folio-scroll pr-1">
                {currentPost.echoes && currentPost.echoes.map((echo) => (
                  <div key={echo.id} className="p-2 rounded-lg bg-white/70 border border-[#8c6742]/25 text-xs shadow-xs">
                    <div className="font-bold text-ink flex items-center justify-between mb-0.5">
                      <span className="font-cinzel text-[10px]">{echo.name}</span>
                      <span className="text-[8px] font-mono text-[#8c6742]">{echo.timestamp}</span>
                    </div>
                    <div className="text-[#3b291a] font-cormorant text-xs leading-snug">{echo.text}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Folio Verso Footer with Next Folio Button */}
          <div className="pt-4 border-t border-[#8c6742]/30 flex items-center justify-between text-[10px] font-mono text-[#6d4d31]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#8c6742]" />
              {currentPost.readingTime}
            </span>
            <button 
              onClick={nextPost}
              className="hover:text-ink font-bold flex items-center gap-1 transition-colors"
              title="Turn to Next Manuscript (Right Arrow)"
            >
              <span>NEXT FOLIO »</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

      </div>

    </article>
  );
}
