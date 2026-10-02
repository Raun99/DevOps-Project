
import React from 'react';
import { 
  Compass, 
  Sparkles, 
  Feather, 
  Bookmark, 
  Mail, 
  User, 
  Sliders, 
  X 
} from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';
import ClandestineSigil from '../common/ClandestineSigil';

export default function NavMonolith() {
  const { isNavDrawerOpen, setIsNavDrawerOpen, bookmarkedIds } = useClandestine();

  const runes = [
    { id: 'desk', label: 'Observatory Desk', glyph: '⌘', icon: Compass, active: true },
    { id: 'explore', label: 'Grand Archive', glyph: '✦', icon: Sparkles, active: false, badge: 'Phase 2' },
    { id: 'write', label: "Scribe's Forge", glyph: '✒', icon: Feather, active: false, badge: 'Phase 2' },
    { id: 'bookmarks', label: 'Forbidden Shelf', glyph: '⚑', icon: Bookmark, active: false, count: bookmarkedIds.length },
    { id: 'notifications', label: 'Wax-Sealed Letters', glyph: '✉', icon: Mail, active: false, count: 2 },
    { id: 'profile', label: 'Portrait Archive', glyph: '𝜓', icon: User, active: false },
    { id: 'settings', label: 'Arcane Apparatus', glyph: '⚙', icon: Sliders, active: false },
  ];

  return (
    <>
      {/* Desktop Carved Obsidian Stele (Integrated directly into left stone arch) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-30 w-56 obsidian-stele flex-col justify-between p-5 pt-24 select-none">
        
        {/* Upper Stele Head: Engraved Monolith Header */}
        <div>
          <div className="pb-3 mb-5 border-b border-antiqueGold/15 flex items-center space-x-2.5">
            <ClandestineSigil className="w-6 h-6" glowing={true} />
            <div>
              <div className="text-[10px] font-bold tracking-[0.25em] text-brightGold font-cinzel">
                OBSIDIAN STELE
              </div>
              <div className="text-[8px] font-mono text-slate-500 tracking-widest">
                IMPERIAL REGISTER
              </div>
            </div>
          </div>

          {/* Chiseled Runic Stations */}
          <nav className="space-y-1">
            {runes.map((item) => {
              return (
                <button
                  key={item.id}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-cinzel tracking-wider flex items-center justify-between transition-all duration-200 group relative ${
                    item.active 
                      ? 'text-brightGold font-bold bg-gradient-to-r from-brightGold/15 to-transparent border-l-2 border-brightGold shadow-[inset_1px_0_10px_rgba(232,199,126,0.15)]' 
                      : 'text-slate-400 hover:text-amber-100 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`text-xs transition-colors ${item.active ? 'text-brightGold' : 'text-antiqueGold/60 group-hover:text-brightGold'}`}>
                      {item.glyph}
                    </span>
                    <span className="text-[11px] tracking-wide">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-400">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && (
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/60 border border-antiqueGold/30 text-brightGold font-bold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Stele Base: Ancient Scholar Motto */}
        <div className="pt-3 border-t border-antiqueGold/15 text-center">
          <div className="text-[9px] font-cinzel text-antiqueGold/60 tracking-widest">
            ❖ THE ARCHIVE ENDURES ❖
          </div>
          <div className="text-[8px] font-cormorant italic text-slate-500 mt-1">
            "Different perspectives. A wider horizon."
          </div>
        </div>

      </aside>

      {/* Mobile Drawer */}
      {isNavDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            onClick={() => setIsNavDrawerOpen(false)} 
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-64 max-w-[80vw] h-full obsidian-stele p-6 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-antiqueGold/20">
                <div className="flex items-center space-x-2.5">
                  <ClandestineSigil className="w-6 h-6" glowing={true} />
                  <span className="text-xs font-bold tracking-[0.2em] text-brightGold font-cinzel">CLANDESTINE</span>
                </div>
                <button 
                  onClick={() => setIsNavDrawerOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-amber-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2">
                {runes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setIsNavDrawerOpen(false)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-cinzel tracking-wider flex items-center justify-between ${
                      item.active ? 'text-brightGold font-bold bg-white/5 border-l-2 border-brightGold' : 'text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-antiqueGold">{item.glyph}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-black/40 text-slate-400">{item.badge}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-antiqueGold/20 text-center text-[9px] font-mono text-slate-500">
              ARCHIVE PRIMUS • CLANDESTINE
            </div>
          </div>
        </div>
      )}
    </>
  );
}
