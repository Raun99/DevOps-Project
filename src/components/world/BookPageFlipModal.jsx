
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Bookmark, 
  MessageSquare, 
  Send, 
  Clock, 
  Share2,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';
import { soundEngine } from '../../audio/AudioSynthesizer';

export default function BookPageFlipModal() {
  const { 
    currentPost, 
    nextPost, 
    prevPost, 
    toggleLike, 
    toggleBookmark, 
    likedIds, 
    bookmarkedIds,
    addEchoComment,
    cameraMode,
    travelTo
  } = useClandestine();

  const [isOpenAnimationDone, setIsOpenAnimationDone] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('next');
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const scrollLeftRef = useRef(null);
  const scrollRightRef = useRef(null);

  // Trigger page open sound and animation on open
  useEffect(() => {
    if (cameraMode === 'reading') {
      soundEngine.playPageTurn();
      setIsOpenAnimationDone(false);
      const t = setTimeout(() => setIsOpenAnimationDone(true), 650);
      return () => clearTimeout(t);
    }
  }, [cameraMode, currentPost?.id]);

  // Esc key closes book
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && cameraMode === 'reading') {
        handleClose();
      }
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cameraMode]);

  if (cameraMode !== 'reading' || !currentPost) return null;

  const isLiked = likedIds.includes(currentPost.id);
  const isBookmarked = bookmarkedIds.includes(currentPost.id);

  const handleNext = () => {
    soundEngine.playPageTurn();
    setIsFlipping(true);
    setFlipDirection('next');
    setTimeout(() => {
      nextPost();
      setIsFlipping(false);
    }, 380);
  };

  const handlePrev = () => {
    soundEngine.playPageTurn();
    setIsFlipping(true);
    setFlipDirection('prev');
    setTimeout(() => {
      prevPost();
      setIsFlipping(false);
    }, 380);
  };

  const handleClose = () => {
    soundEngine.playPageTurn();
    travelTo('chamber');
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addEchoComment(currentPost.id, commentName.trim(), commentText.trim());
    setCommentText('');
    setIsCommentBoxOpen(false);
  };

  const handleShare = () => {
    soundEngine.playManaChime();
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      
      {/* Click outside to close */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 cursor-pointer pointer-events-auto"
      />

      {/* Main 3D Book Container */}
      <div 
        className="relative w-full max-w-5xl h-[88vh] z-10 pointer-events-auto flex flex-col justify-between"
        style={{ perspective: '2000px' }}
      >
        
        {/* Top Navigation Bar for Book */}
        <div className="flex items-center justify-between px-5 py-2.5 rounded-2xl bg-black/80 border border-brightGold/40 shadow-2xl backdrop-blur-md mb-2 text-xs flex-shrink-0">
          
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="text-brightGold font-cinzel font-bold uppercase tracking-wider text-xs sm:text-sm">
              {currentPost.category}
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-[11px] flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-antiqueGold" />
              {currentPost.readingTime}
            </span>
          </div>

          {/* Quick Page Turning & Close */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-brightGold border border-white/10 transition-all font-mono text-xs flex items-center gap-1 cursor-pointer"
              title="Previous Article (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <button 
              onClick={handleNext}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-brightGold border border-white/10 transition-all font-mono text-xs flex items-center gap-1 cursor-pointer"
              title="Next Article (Right Arrow)"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button 
              onClick={handleClose}
              className="px-3.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-white font-cinzel text-xs font-bold transition-all ml-3 flex items-center gap-1.5 cursor-pointer border border-red-500/50 shadow-md"
              title="Close Book (Esc)"
            >
              <X className="w-4 h-4" />
              <span>CLOSE BOOK</span>
            </button>
          </div>

        </div>

        {/* 3D Realistic Open Book Structure */}
        <div 
          className={`relative flex-1 rounded-3xl overflow-hidden border-4 border-[#2b180d] shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col md:flex-row transition-all duration-700 ease-out ${
            isOpenAnimationDone ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            backgroundColor: '#f5ecd8'
          }}
        >
          {/* Book Spine Shadow in Center */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gradient-to-r from-black/25 via-black/40 to-black/25 z-20 pointer-events-none shadow-inner" />

          {/* LEFT PAGE */}
          <div 
            ref={scrollLeftRef}
            className="flex-1 p-6 sm:p-10 overflow-y-auto folio-scroll border-b md:border-b-0 md:border-r border-[#8c6742]/30 select-text bg-[#f7efe1] relative"
            style={{
              backgroundImage: 'radial-gradient(ellipse at 35% 40%, rgba(255,255,255,0.7) 0%, rgba(240,225,200,0.5) 70%, rgba(200,175,140,0.3) 100%)'
            }}
          >
            {/* Header / Date */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#78593a] pb-3 mb-4 border-b border-[#8c6742]/30">
              <span className="font-bold uppercase tracking-wider">{currentPost.category} ARTICLE</span>
              <span>{currentPost.cycle}</span>
            </div>

            {/* Article Title */}
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-ink leading-tight tracking-tight mb-3">
              {currentPost.title}
            </h1>

            {/* Subtitle / Excerpt */}
            <p className="font-cormorant italic text-[#4a321e] text-lg sm:text-xl leading-relaxed border-l-3 border-amber-800 pl-4 py-1 mb-6 bg-black/[0.02]">
              {currentPost.subtitle}
            </p>

            {/* Author Byline */}
            <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-[#8c6742]/30">
              <div className="w-10 h-10 rounded-full bg-[#2a1a0f] text-amber-200 flex items-center justify-center font-bold text-sm font-mono shadow-md border border-brightGold/50">
                {currentPost.authorAvatar}
              </div>
              <div>
                <div className="text-base font-bold text-ink font-cinzel">{currentPost.author}</div>
                <div className="text-[11px] font-mono text-[#6d4d31]">{currentPost.authorRole}</div>
              </div>
            </div>

            {/* Editorial Body: Left Column with Large Drop Cap */}
            <div className="text-[#241a12] font-cormorant text-lg sm:text-xl leading-relaxed text-justify space-y-4">
              <p>
                <span className="float-left text-6xl font-cinzel-dec font-bold leading-none pr-3 pt-1 text-red-900 drop-shadow-sm">
                  {currentPost.leadDropCap}
                </span>
                {currentPost.contentLeft.trim()}
              </p>

              {/* Editorial Quote Card */}
              <div className="p-4 rounded-xl bg-amber-950/[0.05] border border-[#8c6742]/30 font-cormorant italic text-base text-[#3d2718]">
                "In the deep silence of the observatory, knowledge is not merely stored; it gathers gravity, bending the surrounding thoughts into new orbits."
              </div>
            </div>
          </div>

          {/* RIGHT PAGE */}
          <div 
            ref={scrollRightRef}
            className="flex-1 p-6 sm:p-10 overflow-y-auto folio-scroll select-text bg-[#fbf5ea] relative flex flex-col justify-between"
            style={{
              backgroundImage: 'radial-gradient(ellipse at 65% 45%, rgba(255,255,255,0.8) 0%, rgba(245,232,210,0.55) 70%, rgba(210,185,150,0.3) 100%)'
            }}
          >
            <div>
              {/* Top Page Number */}
              <div className="flex items-center justify-end text-[11px] font-mono text-[#78593a] pb-3 mb-4 border-b border-[#8c6742]/30">
                <span>PAGE 2</span>
              </div>

              {/* Editorial Body: Right Column */}
              <div className="text-[#241a12] font-cormorant text-lg sm:text-xl leading-relaxed text-justify space-y-4 mb-6">
                <p>{currentPost.contentRight.trim()}</p>

                {/* Topic Tags */}
                <div className="pt-3">
                  <div className="text-[11px] font-cinzel font-bold text-[#6d4d31] mb-2">TOPIC TAGS:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPost.tags && currentPost.tags.map((t, idx) => (
                      <span key={idx} className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-black/10 border border-[#8c6742]/30 text-[#4a321e] font-semibold">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engagement & Social Action Bar */}
              <div className="p-4 rounded-2xl border border-[#8c6742]/40 bg-[#ebe0ca] shadow-inner flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center space-x-2.5">
                  {/* Like Button */}
                  <button 
                    onClick={() => toggleLike(currentPost.id)}
                    className={`px-4 py-2 rounded-xl font-cinzel text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow ${
                      isLiked 
                        ? 'bg-red-800 text-white shadow-red-900/40 scale-105' 
                        : 'bg-[#d8cbb1] text-ink hover:bg-[#c9baa0] border border-[#8c6742]/40'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-white text-white' : 'text-red-800'}`} />
                    <span>{currentPost.sparks.toLocaleString()} LIKES</span>
                  </button>

                  {/* Bookmark Button */}
                  <button 
                    onClick={() => toggleBookmark(currentPost.id)}
                    className={`p-2.5 rounded-xl transition-all border cursor-pointer ${
                      isBookmarked 
                        ? 'bg-[#2a1a0f] text-amber-200 border-amber-600 shadow' 
                        : 'bg-[#d8cbb1] text-ink hover:bg-[#c9baa0] border-[#8c6742]/40'
                    }`}
                    title={isBookmarked ? "Saved in Bookmarks" : "Save to Bookmarks"}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-200' : ''}`} />
                  </button>

                  {/* Share Link */}
                  <button 
                    onClick={handleShare}
                    className="p-2.5 rounded-xl bg-[#d8cbb1] text-ink hover:bg-[#c9baa0] border border-[#8c6742]/40 transition-all cursor-pointer"
                    title="Copy Article Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {copiedLink && (
                  <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-1 rounded">
                    Link Copied!
                  </span>
                )}
              </div>

              {/* Reader Comments Section */}
              <div className="space-y-3 pt-3 border-t border-[#8c6742]/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink font-cinzel flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#8c6742]" />
                    <span>COMMENTS ({currentPost.echoes?.length || 0})</span>
                  </span>
                  <button 
                    onClick={() => setIsCommentBoxOpen(!isCommentBoxOpen)}
                    className="text-[11px] font-mono text-amber-900 font-bold hover:underline cursor-pointer"
                  >
                    {isCommentBoxOpen ? 'Cancel' : '+ Write Comment'}
                  </button>
                </div>

                {/* Comment Draft Box */}
                {isCommentBoxOpen && (
                  <form onSubmit={handleCommentSubmit} className="p-3.5 bg-white/95 rounded-xl border border-[#8c6742]/40 space-y-2 shadow-md">
                    <input 
                      type="text"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="Your Name (e.g. Elena Rostova)"
                      className="w-full text-xs font-mono p-2 rounded bg-white border border-[#8c6742]/40 text-ink focus:outline-none"
                    />
                    <textarea 
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts on this article..."
                      className="w-full text-sm font-cormorant p-2.5 rounded bg-white border border-[#8c6742]/40 text-ink focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-[#2a1a0f] text-amber-200 text-xs font-cinzel font-bold hover:bg-[#402717] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Post Comment</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Comments List */}
                <div className="space-y-2">
                  {currentPost.echoes && currentPost.echoes.map((echo) => (
                    <div key={echo.id} className="p-2.5 rounded-lg bg-white/80 border border-[#8c6742]/30 text-xs shadow-sm">
                      <div className="font-bold text-ink flex items-center justify-between mb-1">
                        <span className="font-cinzel text-xs">{echo.name}</span>
                        <span className="text-[10px] font-mono text-[#8c6742]">{echo.timestamp}</span>
                      </div>
                      <div className="text-[#3b291a] font-cormorant text-base leading-relaxed">{echo.text}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Page Footer */}
            <div className="pt-4 mt-6 border-t border-[#8c6742]/30 flex items-center justify-between text-[11px] font-mono text-[#6d4d31]">
              <span>CLANDESTINE EDITORIAL</span>
              <button 
                onClick={handleClose}
                className="text-xs font-cinzel font-bold text-ink hover:text-red-800 cursor-pointer"
              >
                « Close Book & Return to Castle
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
