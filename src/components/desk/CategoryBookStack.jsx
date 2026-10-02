
import React from 'react';
import { CATEGORIES } from '../../data/initialPosts';
import { useClandestine } from '../../context/ClandestineContext';

export default function CategoryBookStack() {
  const { activeCategory, selectCategory } = useClandestine();
  const books = CATEGORIES.filter(c => c.id !== 'all');

  return (
    <div className="relative select-none flex flex-col items-start">
      
      {/* Label Carved into the Desk Wood */}
      <div className="text-[10px] font-cinzel text-antiqueGold/80 tracking-widest uppercase mb-2 flex items-center gap-1.5 pl-1">
        <span className="w-1.5 h-1.5 rounded-full bg-antiqueGold"></span>
        <span>THE ARCHIVAL VOLUMES</span>
      </div>

      {/* Realistic Stack of Antique Leatherbound Folios (Stacked Horizontally) */}
      <div className="relative flex flex-col space-y-[-4px] pl-2">
        {books.map((book, idx) => {
          const isActive = activeCategory.toLowerCase() === book.id.toLowerCase();
          // Slight realistic asymmetrical offsets for each book in the stack
          const naturalOffsets = [-2, 4, -1, 3, -3, 2, -1, 4];
          const offset = naturalOffsets[idx % naturalOffsets.length];

          return (
            <button
              key={book.id}
              onClick={() => selectCategory(book.id)}
              className={`relative w-48 sm:w-56 h-7 rounded-sm flex items-center justify-between text-left transition-all duration-300 cursor-pointer group border-t border-b border-black/40 ${
                isActive 
                  ? 'translate-x-6 shadow-[0_4px_25px_rgba(232,199,126,0.45)] border-brightGold z-20 scale-[1.02]' 
                  : 'hover:translate-x-3 hover:shadow-xl hover:border-antiqueGold/60 border-black/30 z-10'
              }`}
              style={{
                marginLeft: `${offset}px`,
                backgroundColor: book.spineColor,
                backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(255,255,255,0.08) 35%, rgba(0,0,0,0.55) 100%)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15)'
              }}
              title={`Pull ${book.label} tome from the stack`}
            >
              {/* Embossed Leather Spine Ribs */}
              <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-black/60 shadow-[1px_0_0_rgba(255,255,255,0.08)]"></div>
              <div className="absolute right-3 top-0 bottom-0 w-0.5 bg-black/60 shadow-[1px_0_0_rgba(255,255,255,0.08)]"></div>

              {/* Spine Title */}
              <span 
                className={`font-cinzel text-[11px] tracking-wider pl-4 transition-colors ${
                  isActive ? 'text-brightGold font-bold' : 'text-slate-200 group-hover:text-brightGold'
                }`}
              >
                {book.label}
              </span>

              {/* Active Gold Silk Ribbon Bookmark hanging from book */}
              {isActive && (
                <div className="relative pr-2 flex items-center space-x-1">
                  <span className="text-[8px] font-mono text-brightGold font-bold tracking-widest">PULLED</span>
                  <div className="w-2.5 h-4 bg-brightGold rounded-b-sm shadow-md"></div>
                </div>
              )}

              {/* Brass Corner Detail */}
              <div className="absolute right-0.5 top-0.5 w-1.5 h-1.5 border-t border-r border-antiqueGold/60 pointer-events-none"></div>
              <div className="absolute right-0.5 bottom-0.5 w-1.5 h-1.5 border-b border-r border-antiqueGold/60 pointer-events-none"></div>
            </button>
          );
        })}
      </div>

      <div className="text-[8px] font-cormorant italic text-antiqueGold/50 mt-2 pl-2">
        * Pull a tome to commune with that domain
      </div>
    </div>
  );
}
