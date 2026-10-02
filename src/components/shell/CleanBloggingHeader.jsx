import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  User, 
  Flame, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  Feather,
  LogOut,
  Sparkles,
  Shield
} from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';
import ClandestineSigil from '../common/ClandestineSigil';

export default function CleanBloggingHeader() {
  const { 
    cameraMode, 
    travelTo, 
    activeCategory, 
    selectCategory, 
    ambientMode, 
    toggleAmbientMode, 
    isAudioActive, 
    toggleAudio,
    bookmarkedIds,
    categories,
    currentUser,
    openAuthModal,
    openWritingDesk,
    openProfileModal,
    logout
  } = useClandestine();

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // If in reading mode, keep header hidden so the open book has maximum immersion
  if (cameraMode === 'reading') return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between pointer-events-none select-none">
        
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => travelTo('chamber')}
          className="pointer-events-auto flex items-center space-x-3 cursor-pointer group"
        >
          <ClandestineSigil className="w-8 h-8 group-hover:scale-105 transition-transform" glowing={true} />
          <div>
            <div className="text-sm sm:text-base font-bold tracking-[0.25em] text-brightGold font-cinzel leading-none">
              CLANDESTINE
            </div>
            <div className="text-[9px] text-slate-400 font-cinzel tracking-wider mt-1">
              IDEAS FIND A HOME
            </div>
          </div>
        </div>

        {/* Center: Modern Blogging Navigation Bar */}
        <nav className="hidden md:flex pointer-events-auto items-center space-x-1.5 bg-black/80 px-4 py-1.5 rounded-full border border-brightGold/30 shadow-2xl backdrop-blur-md">
          
          {/* Articles Tab */}
          <button
            onClick={() => travelTo('chamber')}
            className={`px-3 py-1.5 rounded-full text-xs font-cinzel tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraMode === 'chamber' 
                ? 'bg-brightGold/20 text-brightGold font-bold border border-brightGold/50' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Articles</span>
          </button>

          {/* Dynamic Categories Dropdown Tab */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className={`px-3 py-1.5 rounded-full text-xs font-cinzel tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                activeCategory !== 'all' 
                  ? 'bg-brightGold/20 text-brightGold font-bold border border-brightGold/50' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{activeCategory === 'all' ? 'Categories' : activeCategory}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Categories Drawer */}
            {isCategoryMenuOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-2 rounded-2xl bg-black/95 border border-brightGold/50 shadow-2xl backdrop-blur-xl z-50">
                <div className="text-[10px] font-mono text-slate-400 px-3 py-1 border-b border-white/10 uppercase flex justify-between">
                  <span>Castle Wings</span>
                  <span className="text-brightGold cursor-pointer" onClick={() => { setIsCategoryMenuOpen(false); openWritingDesk(); }}>+ New Wing</span>
                </div>
                
                <button
                  onClick={() => {
                    selectCategory('all');
                    setIsCategoryMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-cinzel flex items-center justify-between transition-colors cursor-pointer ${
                    activeCategory === 'all'
                      ? 'text-brightGold font-bold bg-white/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>All Castle Wings</span>
                  {activeCategory === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-brightGold" />}
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      selectCategory(cat.name);
                      setIsCategoryMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-cinzel flex items-center justify-between transition-colors cursor-pointer ${
                      activeCategory.toLowerCase() === cat.name.toLowerCase()
                        ? 'text-brightGold font-bold bg-white/10'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {cat.postCount || 0}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarks Tab */}
          <button
            onClick={() => {
              if (bookmarkedIds.length > 0) {
                travelTo('reading');
              }
            }}
            className="px-3 py-1.5 rounded-full text-xs font-cinzel tracking-wider flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Bookmarks</span>
            {bookmarkedIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-brightGold text-obsidian text-[9px] font-mono font-bold">
                {bookmarkedIds.length}
              </span>
            )}
          </button>

          {/* Search Tab */}
          <button
            onClick={() => travelTo('search')}
            className="px-3 py-1.5 rounded-full text-xs font-cinzel tracking-wider flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>

          {/* Scribe's Writing Desk (Create Post) */}
          <button
            onClick={() => openWritingDesk()}
            className="px-3 py-1.5 rounded-full text-xs font-cinzel tracking-wider flex items-center gap-1.5 bg-gradient-to-r from-red-900/80 to-amber-700/80 hover:from-red-800 hover:to-amber-600 text-amber-100 font-bold border border-brightGold/40 transition-all cursor-pointer shadow"
          >
            <Feather className="w-3.5 h-3.5 text-brightGold" />
            <span>Write</span>
          </button>

        </nav>

        {/* Right: User Authentication / Profile, Lighting & Audio */}
        <div className="pointer-events-auto flex items-center space-x-2.5">
          
          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1 rounded-full bg-black/70 hover:bg-black/90 border border-brightGold/50 transition-all cursor-pointer shadow-md"
              >
                <div className="w-6 h-6 rounded-full bg-amber-900 border border-brightGold flex items-center justify-center text-[10px] font-bold font-cinzel text-amber-200">
                  {currentUser.avatar || 'SC'}
                </div>
                <span className="hidden sm:inline text-xs font-cinzel font-bold text-slate-200 max-w-[100px] truncate">
                  {currentUser.username}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 p-2 rounded-2xl bg-black/95 border border-brightGold/50 shadow-2xl backdrop-blur-xl z-50 text-xs font-cinzel">
                  <div className="px-3 py-2 border-b border-white/10 text-slate-400 font-mono text-[10px]">
                    SIGNED IN AS
                    <div className="font-bold text-white font-cinzel text-xs truncate">{currentUser.username}</div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      openProfileModal(currentUser);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-brightGold" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      openWritingDesk();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Feather className="w-3.5 h-3.5 text-brightGold" />
                    <span>Create Post</span>
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-950/40 text-red-400 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-3.5 py-1.5 rounded-full bg-brightGold/15 hover:bg-brightGold/25 text-brightGold border border-brightGold/50 font-cinzel text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Candle Lighting Toggle */}
          <button
            onClick={toggleAmbientMode}
            className="p-2 rounded-full bg-black/60 hover:bg-black/85 border border-amber-500/40 hover:border-amber-400 text-amber-300 transition-all cursor-pointer shadow-md"
            title={ambientMode === 'warm' ? "Switch to Dim Twilight" : "Switch to Radiant Golden Glow"}
          >
            <Flame className={`w-4 h-4 ${ambientMode === 'warm' ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
          </button>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={toggleAudio}
            className="p-2 rounded-full bg-black/60 hover:bg-black/85 border border-brightGold/40 hover:border-brightGold text-brightGold transition-all cursor-pointer shadow-md"
            title={isAudioActive ? "Mute Ambient Synth" : "Turn On Ambient Synth"}
          >
            {isAudioActive ? (
              <Volume2 className="w-4 h-4 text-brightGold animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

        </div>

      </header>
    </>
  );
}
