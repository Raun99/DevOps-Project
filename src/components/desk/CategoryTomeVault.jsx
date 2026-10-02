
import React from 'react';
import { CATEGORIES } from '../../data/initialPosts';
import { useClandestine } from '../../context/ClandestineContext';
import { X, BookOpen } from 'lucide-react';

export default function CategoryTomeVault() {
  const { activeCategory, selectCategory, cameraMode, travelTo } = useClandestine();

  if (cameraMode !== 'categories') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      
      {/* Click outside to return */}
      <div 
        onClick={() => travelTo('chamber')} 
        className="fixed inset-0 cursor-pointer pointer-events-auto"
      />

      {/* 3D Archival Tome Vault Container */}
      <div className="relative w-full max-w-4xl gothic-hud-panel rounded-3xl p-6 sm:p-8 border border-brightGold/50 shadow-2xl z-10 pointer-events-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-antiqueGold/30">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-brightGold flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-brightGold" />
              <span>THE ARCHIVE OF 8 DOMAINS</span>
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Pull an intellectual tome to bind the chamber's communion to that discipline.
            </p>
          </div>

          <button 
            onClick={() => travelTo('chamber')}
            className="p-2 rounded-xl bg-black/50 hover:bg-black/80 text-slate-400 hover:text-brightGold transition-all border border-antiqueGold/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Leatherbound Tomes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[60vh] overflow-y-auto folio-scroll pr-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => {
                  selectCategory(cat.id);
                  travelTo('chamber');
                }}
                className={`relative p-4 rounded-2xl flex flex-col justify-between text-left transition-all duration-300 group cursor-pointer border ${
                  isActive 
                    ? 'border-brightGold shadow-[0_0_25px_rgba(232,199,126,0.45)] scale-105 z-10' 
                    : 'border-white/10 hover:border-antiqueGold/60 hover:scale-102 bg-black/40'
                }`}
                style={{
                  backgroundColor: cat.spineColor,
                  backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.6) 100%)'
                }}
              >
                {/* Ribbed Spine Indicator */}
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="text-[10px] font-mono tracking-widest text-antiqueGold/90 font-bold">
                    DOMAIN TOME
                  </span>
                  {isActive && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-brightGold text-obsidian font-bold">
                      COMMUNING
                    </span>
                  )}
                </div>

                <div className="my-2">
                  <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-100 group-hover:text-brightGold transition-colors">
                    {cat.label}
                  </h3>
                </div>

                <div className="pt-2 border-t border-white/10 text-[10px] font-cormorant italic text-slate-300">
                  {cat.id === 'all' ? 'Commune with all recorded scrolls across all realms' : `Explore all inscribed scrolls in ${cat.label}`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-6 border-t border-antiqueGold/20 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Active Discipline: <strong className="text-brightGold uppercase">{activeCategory}</strong></span>
          <button 
            onClick={() => { selectCategory('all'); travelTo('chamber'); }}
            className="text-antiqueGold hover:text-brightGold underline"
          >
            Reset to All Scrolls
          </button>
        </div>

      </div>

    </div>
  );
}
