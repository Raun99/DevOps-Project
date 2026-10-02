
import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  User, 
  Flame, 
  Volume2, 
  VolumeX, 
  Compass, 
  ChevronDown, 
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';
import { CATEGORIES } from '../../data/initialPosts';
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
    bookmarkedIds
  } = useClandestine();

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // If in reading mode, keep header super minimal
  if (cameraMode === 'reading') return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-6 sm:px-10 py-3.5 flex items-center justify-between pointer-events-none select-none">
        
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

        {/* Center: Clean Modern Blogging Navigation Tabs */}
        <nav className="hidden md:flex pointer-events-auto items-center space-x-1.5 bg-black/75 px-4 py-2 rounded-full border border-brightGold/30 shadow-2xl backdrop-blur-md">
          
          {/* Feed / Articles Tab */}
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

          {/* Categories Dropdown Tab */}
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

            {/* Categories Menu Drawer */}
            {isCategoryMenuOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 p-2 rounded-2xl bg-black/95 border border-brightGold/50 shadow-2xl backdrop-blur-xl z-50">
                <div className="text-[10px] font-mono text-slate-400 px-3 py-1 border-b border-white/10 uppercase">
                  Select Category
                </div>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      selectCategory(cat.id);
                      setIsCategoryMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-cinzel flex items-center justify-between transition-colors cursor-pointer ${
                      activeCategory.toLowerCase() === cat.id.toLowerCase()
                        ? 'text-brightGold font-bold bg-white/10'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {activeCategory.toLowerCase() === cat.id.toLowerCase() && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brightGold" />
                    )}
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

          {/* User Profile / Dashboard Tab */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-3 py-1.5 rounded-full text-xs font-cinzel tracking-wider flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

        </nav>

        {/* Right: Lighting Toggle & Audio Synthesizer */}
        <div className="pointer-events-auto flex items-center space-x-2.5">
          {/* Candle Lighting Toggle */}
          <button
            onClick={toggleAmbientMode}
            className="p-2 rounded-full bg-black/60 hover:bg-black/85 border border-amber-500/40 hover:border-amber-400 text-amber-300 transition-all cursor-pointer shadow-md"
            title={ambientMode === 'warm' ? "Light: Radiant Golden Glow (Click to switch to Dim Twilight)" : "Light: Dim Twilight (Click to switch to Radiant Glow)"}
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

      {/* User Profile / Dashboard Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
          <div 
            onClick={() => setIsProfileModalOpen(false)}
            className="fixed inset-0 cursor-pointer pointer-events-auto"
          />
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-black/90 border border-brightGold/50 shadow-2xl z-10 pointer-events-auto text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-amber-900/60 border-2 border-brightGold flex items-center justify-center text-lg font-bold font-cinzel text-amber-200">
                  AR
                </div>
                <div>
                  <h3 className="text-base font-bold font-cinzel text-white">Sage Aris Thorne</h3>
                  <p className="text-xs font-mono text-slate-400">Chief Writer & Observatory Scholar</p>
                </div>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="my-5 space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                <span>Published Articles</span>
                <span className="font-bold text-brightGold">12</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                <span>Saved Bookmarks</span>
                <span className="font-bold text-brightGold">{bookmarkedIds.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                <span>Reader Resonance (Likes)</span>
                <span className="font-bold text-brightGold">4,820</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-center">
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-brightGold/20 hover:bg-brightGold/30 text-brightGold border border-brightGold/60 font-cinzel text-xs font-bold transition-all cursor-pointer"
              >
                Return to Castle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
