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
  Tag,
  Edit3,
  Trash2,
  CornerDownRight,
  AlertCircle
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
    cameraMode,
    travelTo,
    currentUser,
    token,
    openAuthModal,
    openWritingDesk,
    deletePost,
    openProfileModal
  } = useClandestine();

  const [isOpenAnimationDone, setIsOpenAnimationDone] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [moderationError, setModerationError] = useState(null);
  const [canaryMeta, setCanaryMeta] = useState(null);

  const scrollLeftRef = useRef(null);
  const scrollRightRef = useRef(null);

  const isOwner = currentUser && currentPost && currentUser.id === currentPost.userId;
  const isLiked = currentPost ? likedIds.includes(currentPost.id) : false;
  const isBookmarked = currentPost ? bookmarkedIds.includes(currentPost.id) : false;

  // Fetch comments for current post
  const fetchComments = async (postId) => {
    if (!postId) return;
    setCommentsLoading(true);
    setModerationError(null);
    try {
      // Send Canary channel header for enhanced threading
      const res = await fetch(`/api/comments/post/${postId}`, {
        headers: {
          'x-canary-channel': 'v2',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setCanaryMeta(data.canary || null);
      }
    } catch (e) {
      console.warn('Could not fetch comments:', e);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (cameraMode === 'reading' && currentPost?.id) {
      soundEngine.playPageTurn();
      setIsOpenAnimationDone(false);
      fetchComments(currentPost.id);
      const t = setTimeout(() => setIsOpenAnimationDone(true), 600);
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

  const handleNext = () => {
    soundEngine.playPageTurn();
    nextPost();
  };

  const handlePrev = () => {
    soundEngine.playPageTurn();
    prevPost();
  };

  const handleClose = () => {
    soundEngine.playPageTurn();
    travelTo('chamber');
  };

  const handleShare = () => {
    soundEngine.playManaChime();
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!currentUser) {
      openAuthModal();
      return;
    }

    setModerationError(null);
    try {
      const res = await fetch(`/api/comments/post/${currentPost.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: commentText.trim(),
          parent_id: replyingToId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setModerationError(data.reason || data.error || 'Comment rejected by moderation.');
        soundEngine.playPageTurn();
        return;
      }

      soundEngine.playWaxSeal();
      setCommentText('');
      setReplyingToId(null);
      setIsCommentBoxOpen(false);
      await fetchComments(currentPost.id);
    } catch (err) {
      setModerationError(err.message || 'Failed to post marginal note.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        soundEngine.playGlissandoWhoosh();
        await fetchComments(currentPost.id);
      }
    } catch (e) {
      console.warn('Failed to delete comment:', e);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to expunge this manuscript from the imperial archives forever?')) return;
    try {
      await deletePost(currentPost.id);
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper to render comments recursively for Canary v2 tree
  const renderCommentNode = (c) => {
    const isCommentOwner = currentUser && c.user_id === currentUser.id;

    return (
      <div key={c.id} className="space-y-2">
        <div className="p-3 rounded-xl bg-white/90 border border-[#8c6742]/30 text-xs shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-[#2a1a0f] text-amber-200 text-[10px] font-bold flex items-center justify-center font-mono">
                {c.author_avatar || 'SC'}
              </span>
              <span className="font-cinzel font-bold text-ink text-xs">{c.author_username || 'Scholar'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-[#8c6742]">
                {new Date(c.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {isCommentOwner && (
                <button
                  onClick={() => handleDeleteComment(c.id)}
                  className="text-red-700 hover:text-red-900 text-[10px] font-mono hover:underline cursor-pointer"
                  title="Expunge your marginal note"
                >
                  Expunge
                </button>
              )}
            </div>
          </div>
          <div className="text-[#3b291a] font-cormorant text-base leading-relaxed pl-1">
            {c.content}
          </div>
          <div className="mt-1 flex justify-end">
            <button
              onClick={() => {
                setReplyingToId(c.id);
                setIsCommentBoxOpen(true);
              }}
              className="text-[10px] font-mono text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CornerDownRight className="w-2.5 h-2.5" />
              <span>Reply</span>
            </button>
          </div>
        </div>

        {/* Nested Replies */}
        {c.replies && c.replies.length > 0 && (
          <div className="pl-4 border-l-2 border-[#8c6742]/40 space-y-2">
            {c.replies.map(renderCommentNode)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      
      {/* Click outside to close */}
      <div onClick={handleClose} className="fixed inset-0 cursor-pointer pointer-events-auto" />

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
            {canaryMeta?.active && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-[9px] font-mono">
                Canary Threading Active
              </span>
            )}
          </div>

          {/* Actions: Owner Edit/Delete, Turn Pages, Close */}
          <div className="flex items-center space-x-2">
            {isOwner && (
              <>
                <button
                  onClick={() => openWritingDesk(currentPost)}
                  className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/50 text-xs font-cinzel font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Edit Manuscript"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={handleDeletePost}
                  className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/50 text-xs font-cinzel font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Expunge Manuscript"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Expunge</span>
                </button>
              </>
            )}

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
              <span>CLOSE</span>
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
            {currentPost.subtitle && (
              <p className="font-cormorant italic text-[#4a321e] text-lg sm:text-xl leading-relaxed border-l-3 border-amber-800 pl-4 py-1 mb-6 bg-black/[0.02]">
                {currentPost.subtitle}
              </p>
            )}

            {/* Author Byline (Clickable to view Profile) */}
            <div 
              onClick={() => openProfileModal({ id: currentPost.userId, username: currentPost.author, avatar: currentPost.authorAvatar, bio: currentPost.authorBio, role: currentPost.authorRole })}
              className="flex items-center space-x-3 pb-4 mb-6 border-b border-[#8c6742]/30 cursor-pointer group hover:bg-black/[0.03] p-1.5 rounded-xl transition-colors"
              title="View Author Profile"
            >
              <div className="w-10 h-10 rounded-full bg-[#2a1a0f] text-amber-200 flex items-center justify-center font-bold text-sm font-mono shadow-md border border-brightGold/50 group-hover:scale-105 transition-transform">
                {currentPost.authorAvatar}
              </div>
              <div>
                <div className="text-base font-bold text-ink font-cinzel group-hover:text-amber-900 transition-colors flex items-center gap-1.5">
                  <span>{currentPost.author}</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">»</span>
                </div>
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
                {currentPost.tags && currentPost.tags.length > 0 && (
                  <div className="pt-3">
                    <div className="text-[11px] font-cinzel font-bold text-[#6d4d31] mb-2">TOPIC TAGS:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {currentPost.tags.map((t, idx) => (
                        <span key={idx} className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-black/10 border border-[#8c6742]/30 text-[#4a321e] font-semibold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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

              {/* Reader Comments (Marginal Notes) Section */}
              <div className="space-y-3 pt-3 border-t border-[#8c6742]/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink font-cinzel flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#8c6742]" />
                    <span>MARGINAL NOTES ({comments.length})</span>
                  </span>
                  <button 
                    onClick={() => {
                      if (!currentUser) {
                        openAuthModal();
                      } else {
                        setReplyingToId(null);
                        setIsCommentBoxOpen(!isCommentBoxOpen);
                      }
                    }}
                    className="text-[11px] font-mono text-amber-900 font-bold hover:underline cursor-pointer"
                  >
                    {isCommentBoxOpen ? 'Cancel' : '+ Write Note'}
                  </button>
                </div>

                {/* Moderation Error Alert Banner */}
                {moderationError && (
                  <div className="p-3 rounded-xl bg-red-100 border border-red-400 text-red-900 text-xs font-mono flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Moderation Notice:</div>
                      <div>{moderationError}</div>
                    </div>
                  </div>
                )}

                {/* Comment Draft Box */}
                {isCommentBoxOpen && (
                  <form onSubmit={handleCommentSubmit} className="p-3.5 bg-white/95 rounded-xl border border-[#8c6742]/40 space-y-2 shadow-md">
                    {replyingToId && (
                      <div className="text-[11px] font-mono text-amber-800 flex items-center justify-between">
                        <span>Replying to note #{replyingToId.slice(-4)}</span>
                        <button 
                          type="button" 
                          onClick={() => setReplyingToId(null)}
                          className="hover:underline text-slate-500"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <textarea 
                      rows={2}
                      required
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={currentUser ? `Inscribe marginal note as ${currentUser.username}...` : "Sign in to inscribe marginal note..."}
                      className="w-full text-sm font-cormorant p-2.5 rounded bg-white border border-[#8c6742]/40 text-ink focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-[#2a1a0f] text-amber-200 text-xs font-cinzel font-bold hover:bg-[#402717] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Inscribe Note</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Comments List */}
                <div className="space-y-2.5 max-h-64 overflow-y-auto folio-scroll pr-1">
                  {commentsLoading ? (
                    <div className="text-xs font-mono text-[#8c6742] text-center py-2">Consulting marginalia...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-xs font-cormorant italic text-[#8c6742] text-center py-2">
                      No marginal notes inscribed on this codex yet. Be the first scholar to inscribe your thoughts.
                    </div>
                  ) : (
                    comments.map(renderCommentNode)
                  )}
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
