import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { soundEngine } from '../audio/AudioSynthesizer';

const ClandestineContext = createContext();

export function ClandestineProvider({ children }) {
  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('clandestine_token') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('clandestine_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Database Posts & Categories
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // UI Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWritingDeskOpen, setIsWritingDeskOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewingAuthor, setViewingAuthor] = useState(null);

  // Camera & Navigation Mode: 'chamber' (default 3D castle), 'reading' (open book modal), 'search' (astrolabe)
  const [cameraMode, setCameraMode] = useState('chamber');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePostIndex, setActivePostIndex] = useState(0);

  // Bookmarks & Likes persistence
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('clandestine_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [likedIds, setLikedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('clandestine_likes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Ambient lighting ('warm' vs 'dim')
  const [ambientMode, setAmbientMode] = useState(() => {
    try {
      return localStorage.getItem('clandestine_ambient') || 'warm';
    } catch {
      return 'warm';
    }
  });

  // Audio synthesizer state
  const [isAudioActive, setIsAudioActive] = useState(false);

  // Fetch Categories from Backend API
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.warn('Could not fetch categories from API:', err);
    }
  }, []);

  // Fetch Posts from Backend API
  const fetchPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        const apiPosts = data.posts || [];
        
        // Map backend schema to UI format
        const formatted = apiPosts.map(p => {
          const content = p.content || '';
          const half = Math.floor(content.length / 2);
          const splitIdx = content.indexOf('\n', half);
          const actualSplit = splitIdx !== -1 ? splitIdx : half;
          const left = content.slice(0, actualSplit);
          const right = content.slice(actualSplit);

          return {
            id: p.id,
            userId: p.user_id,
            title: p.title,
            subtitle: p.subtitle,
            category: p.category_name || (p.category_id ? p.category_id.replace('cat-', '') : 'General'),
            categoryId: p.category_id,
            categoryColor: p.category_color || '#38bdf8',
            author: p.author_username || 'Archivist Scribe',
            authorAvatar: p.author_avatar || 'AS',
            authorBio: p.author_bio || '',
            authorRole: p.user_id === 'user-aris' ? 'Chief Archivist' : 'Scholar Scribe',
            readingTime: p.reading_time || '5 min read',
            sparks: p.likes_count || 0,
            tags: p.tags || [],
            cycle: new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            leadDropCap: left.charAt(0) || 'I',
            contentLeft: left.slice(1),
            contentRight: right,
            rawContent: p.content
          };
        });

        setPosts(formatted);
      }
    } catch (err) {
      console.warn('Could not fetch posts from API:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  // Sync token and user to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('clandestine_token', token);
    } else {
      localStorage.removeItem('clandestine_token');
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('clandestine_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('clandestine_user');
    }
  }, [currentUser]);

  useEffect(() => {
    try { localStorage.setItem('clandestine_bookmarks', JSON.stringify(bookmarkedIds)); } catch {}
  }, [bookmarkedIds]);

  useEffect(() => {
    try { localStorage.setItem('clandestine_likes', JSON.stringify(likedIds)); } catch {}
  }, [likedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('clandestine_ambient', ambientMode);
      document.documentElement.setAttribute('data-ambient', ambientMode);
    } catch {}
  }, [ambientMode]);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [fetchCategories, fetchPosts]);

  // Auth Functions
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication rejected by the archives.');
    }
    setToken(data.token);
    setCurrentUser(data.user);
    soundEngine.playManaChime();
    setIsAuthModalOpen(false);
    return data.user;
  };

  const register = async (username, email, password, bio) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, bio })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registry inscription failed.');
    }
    setToken(data.token);
    setCurrentUser(data.user);
    soundEngine.playManaChime();
    setIsAuthModalOpen(false);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    soundEngine.playPageTurn();
    setIsProfileModalOpen(false);
  };

  const updateProfile = async (profileData) => {
    if (!token) return;
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile.');
    setCurrentUser(data.user);
    soundEngine.playWaxSeal();
    return data.user;
  };

  // Post Actions (Create, Update, Delete)
  const createPost = async (postData) => {
    if (!token) {
      setIsAuthModalOpen(true);
      throw new Error('Please sign in to inscribe a post in the archives.');
    }

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to inscribe post.');

    soundEngine.playWaxSeal();
    await fetchPosts();
    await fetchCategories();
    setIsWritingDeskOpen(false);
    setEditingPost(null);
    return data.post;
  };

  const updatePost = async (id, postData) => {
    if (!token) throw new Error('Authentication required.');

    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update post.');

    soundEngine.playWaxSeal();
    await fetchPosts();
    setIsWritingDeskOpen(false);
    setEditingPost(null);
    return data.post;
  };

  const deletePost = async (id) => {
    if (!token) throw new Error('Authentication required.');

    const res = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to expunge manuscript.');

    soundEngine.playGlissandoWhoosh();
    await fetchPosts();
    await fetchCategories();
    if (cameraMode === 'reading') setCameraMode('chamber');
    return data;
  };

  // Dynamic Category Creation
  const createCategory = async (catData) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(catData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to establish new castle wing.');

    soundEngine.playManaChime();
    await fetchCategories();
    return data.category;
  };

  // Modal Triggers
  const openWritingDesk = (postToEdit = null) => {
    soundEngine.playPageTurn();
    setEditingPost(postToEdit);
    setIsWritingDeskOpen(true);
  };

  const closeWritingDesk = () => {
    soundEngine.playPageTurn();
    setIsWritingDeskOpen(false);
    setEditingPost(null);
  };

  const openAuthModal = () => {
    soundEngine.playPageTurn();
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openProfileModal = (author = null) => {
    soundEngine.playPageTurn();
    setViewingAuthor(author || currentUser);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setViewingAuthor(null);
  };

  // Audio & Atmosphere
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

  // Filtered Posts
  const filteredPosts = posts.filter(post => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      return (
        post.title.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        (post.subtitle && post.subtitle.toLowerCase().includes(query)) ||
        (post.tags && post.tags.some(t => t.toLowerCase().includes(query)))
      );
    }
    return activeCategory === 'all' || post.category.toLowerCase() === activeCategory.toLowerCase() || post.categoryId === activeCategory;
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

  const toggleBookmark = async (id) => {
    soundEngine.playWaxSeal();
    const isBookmarked = bookmarkedIds.includes(id);
    setBookmarkedIds(prev => isBookmarked ? prev.filter(x => x !== id) : [...prev, id]);

    if (token) {
      try {
        await fetch(`/api/posts/${id}/bookmark`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {
        console.warn('Could not sync bookmark to server:', e);
      }
    }
  };

  const toggleLike = async (id) => {
    soundEngine.playManaChime();
    const isLiked = likedIds.includes(id);
    setLikedIds(prev => isLiked ? prev.filter(x => x !== id) : [...prev, id]);
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, sparks: isLiked ? Math.max(0, p.sparks - 1) : p.sparks + 1 };
      }
      return p;
    }));

    if (token) {
      try {
        await fetch(`/api/posts/${id}/like`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {
        console.warn('Could not sync like to server:', e);
      }
    }
  };

  const travelTo = (mode) => {
    soundEngine.playPageTurn();
    setCameraMode(mode);
  };

  return (
    <ClandestineContext.Provider value={{
      currentUser,
      token,
      login,
      register,
      logout,
      updateProfile,
      posts,
      filteredPosts,
      currentPost,
      categories,
      isLoadingPosts,
      fetchPosts,
      fetchCategories,
      createPost,
      updatePost,
      deletePost,
      createCategory,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      isWritingDeskOpen,
      editingPost,
      openWritingDesk,
      closeWritingDesk,
      isProfileModalOpen,
      viewingAuthor,
      openProfileModal,
      closeProfileModal,
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
      ambientMode,
      toggleAmbientMode,
      isAudioActive,
      toggleAudio,
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
