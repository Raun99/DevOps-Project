
import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_POSTS } from '../data/initialPosts';
import { soundEngine } from '../audio/AudioSynthesizer';

const ClandestineContext = createContext();

export function ClandestineProvider({ children }) {
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('clandestine_posts');
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch (e) {
      return INITIAL_POSTS;
    }
  });

  // Camera Mode: 'chamber' (default open world), 'reading' (scrollable codex), 'cathedral' (nave plate), 'search' (astrolabe), 'categories' (shelf)
  const [cameraMode, setCameraMode] = useState('chamber');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePostIndex, setActivePostIndex] = useState(0);

  // Bookmarks persistence
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('clandestine_bookmarks');
      return saved ? JSON.parse(saved) : ['post-1', 'post-8'];
    } catch (e) {
      return ['post-1', 'post-8'];
    }
  });

  // User liked post IDs
  const [likedIds, setLikedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('clandestine_likes');
      return saved ? JSON.parse(saved) : ['post-1'];
    } catch (e) {
      return ['post-1'];
    }
  });

  // Ambient lighting mode ('warm' vs 'dim')
  const [ambientMode, setAmbientMode] = useState(() => {
    try {
      return localStorage.getItem('clandestine_ambient') || 'warm';
    } catch (e) {
      return 'warm';
    }
  });

  // Audio synthesizer state (Default: MUTED)
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try { localStorage.setItem('clandestine_posts', JSON.stringify(posts)); } catch (e) {}
  }, [posts]);

  useEffect(() => {
    try { localStorage.setItem('clandestine_bookmarks', JSON.stringify(bookmarkedIds)); } catch (e) {}
  }, [bookmarkedIds]);

  useEffect(() => {
    try { localStorage.setItem('clandestine_likes', JSON.stringify(likedIds)); } catch (e) {}
  }, [likedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('clandestine_ambient', ambientMode);
      document.documentElement.setAttribute('data-ambient', ambientMode);
    } catch (e) {}
  }, [ambientMode]);

  const toggleAudio = () => {
    const nextState = !isAudioActive;
    setIsAudioActive(nextState);
    soundEngine.setAudioEnabled(nextState);
  };

  const toggleAmbientMode = () => {
    const next = ambientMode === 'warm' ? 'dim' : 'warm';
    setAmbientMode(next);
    soundEngine.playManaChime();
  };

  // Filtered posts based on active category and search
  const filteredPosts = posts.filter(post => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      return (
        post.title.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.subtitle.toLowerCase().includes(query) ||
        (post.tags && post.tags.some(t => t.toLowerCase().includes(query)))
      );
    }
    return activeCategory === 'all' || post.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const currentPost = filteredPosts[activePostIndex] || filteredPosts[0] || posts[0];

  const selectCategory = (category) => {
    soundEngine.playPageTurn();
    if (activeCategory === category) {
      setActiveCategory('all');
    } else {
      setActiveCategory(category);
    }
    setActivePostIndex(0);
  };

  const nextPost = () => {
    if (filteredPosts.length <= 1) return;
    soundEngine.playPageTurn();
    setActivePostIndex((prev) => (prev + 1) % filteredPosts.length);
  };

  const prevPost = () => {
    if (filteredPosts.length <= 1) return;
    soundEngine.playPageTurn();
    setActivePostIndex((prev) => (prev - 1 + filteredPosts.length) % filteredPosts.length);
  };

  const selectPostById = (id, openReader = true) => {
    soundEngine.playPageTurn();
    const idx = filteredPosts.findIndex(p => p.id === id);
    if (idx !== -1) {
      setActivePostIndex(idx);
    } else {
      setActiveCategory('all');
      const allIdx = posts.findIndex(p => p.id === id);
      if (allIdx !== -1) setActivePostIndex(allIdx);
    }
    if (openReader) {
      setCameraMode('reading');
    }
  };

  const toggleBookmark = (id) => {
    soundEngine.playWaxSeal();
    setBookmarkedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleLike = (id) => {
    soundEngine.playManaChime();
    const isLiked = likedIds.includes(id);
    setLikedIds(prev => isLiked ? prev.filter(x => x !== id) : [...prev, id]);
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, sparks: isLiked ? p.sparks - 1 : p.sparks + 1 };
      }
      return p;
    }));
  };

  const addEchoComment = (postId, authorName, text) => {
    if (!text.trim()) return;
    soundEngine.playWaxSeal();
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newEcho = {
          id: 'e-' + Date.now(),
          name: authorName || 'Archivist Scribe (You)',
          timestamp: 'Just now',
          text: text.trim()
        };
        return { ...p, echoes: [newEcho, ...(p.echoes || [])] };
      }
      return p;
    }));
  };

  const travelTo = (mode) => {
    soundEngine.playPageTurn();
    setCameraMode(mode);
  };

  return (
    <ClandestineContext.Provider value={{
      posts,
      filteredPosts,
      currentPost,
      activeCategory,
      selectCategory,
      searchQuery,
      setSearchQuery,
      activePostIndex,
      nextPost,
      prevPost,
      selectPostById,
      bookmarkedIds,
      toggleBookmark,
      likedIds,
      toggleLike,
      addEchoComment,
      ambientMode,
      toggleAmbientMode,
      isAudioActive,
      toggleAudio,
      isNavDrawerOpen,
      setIsNavDrawerOpen,
      cameraMode,
      setCameraMode,
      travelTo
    }}>
      {children}
    </ClandestineContext.Provider>
  );
}

export function useClandestine() {
  const context = useContext(ClandestineContext);
  if (!context) throw new Error('useClandestine must be used within ClandestineProvider');
  return context;
}
