
import React, { useState } from 'react';
import { CATEGORIES } from '../../data/initialPosts';
import { useClandestine } from '../../context/ClandestineContext';
import { BookOpen, Sparkles, Check } from 'lucide-react';

export default function CategoryTomeRack() {
  const { activeCategory, selectCategory, cameraMode } = useClandestine();
  const [hoveredCat, setHoveredCat] = useState(null);

  if (cameraMode === 'cathedral' || cameraMode === 'reading') return null;

  return (
    <div className="absolute left-6 lg:left-64 bottom-24 z-20 select-none pointer-events-auto">
      {/* Container with anime glass & gold filigree */}
      <div className="gothic-hud-panel p-3.5 rounded-2xl border border-brightGold/40 shadow-[0_15px_35px_rgba(0,0,0,0.85)] max-w-md sm:max-w-lg">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-antiqueGold/20">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-brightGold" />
            <span className="text-[11px] font-cinzel font-bold text-brightGold tracking-wider">
              8 ARCHIVAL DISCIPLINES
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">
            {activeCategory === 'all' ? 'All Tomes Active' : activeCategory.toUpperCase()}
          </span>
        </div>

        {/* 3D Interactive Books Row / Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
            const isHovered = hoveredCat === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                onMouseEnter={() => setHoveredCat(cat.id)}
                onMouseLeave={() => setHoveredCat(null)}
                className={`relative flex flex-col items-center justify-between p-2 rounded-xl text-center transition-all duration-300 cursor-pointer border group ${
                  isActive
                    ? 'border-brightGold bg-amber-500/20 shadow-[0_0_15px_rgba(232,199,126,0.5)] -translate-y-1 scale-105'
                    : 'border-white/10 hover:border-brightGold/50 hover:bg-white/5 hover:-translate-y-1'
                }`}
                style={{
                  backgroundColor: cat.spineColor,
                  backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.65) 100%)'
                }}
                title={cat.label}
              >
                {/* Book Top Gold Band */}
                <div className="w-full h-1 bg-brightGold/40 rounded-full mb-1 group-hover:bg-brightGold transition-colors" />

                {/* Tome Sigil / Initial */}
                <div className="my-1">
                  <span className="font-cinzel text-xs font-bold text-amber-100 group-hover:text-brightGold">
                    {cat.id === 'all' ? '✦' : cat.label.slice(0, 3).toUpperCase()}
                  </span>
                </div>

                {/* Active Check Indicator */}
                <div className="w-full flex justify-center mt-1">
                  {isActive ? (
                    <Check className="w-3 h-3 text-brightGold" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-amber-300" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Hint */}
        <div className="pt-2 mt-2 border-t border-antiqueGold/15 flex items-center justify-between text-[9px] font-mono text-slate-400">
          <span>Click any tome to filter manuscripts</span>
          {activeCategory !== 'all' && (
            <button 
              onClick={() => selectCategory('all')}
              className="text-antiqueGold hover:text-brightGold underline cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
