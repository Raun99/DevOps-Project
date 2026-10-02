
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';

export default function TrendingStonePlaque() {
  const { posts, selectPostById } = useClandestine();
  const trendingPosts = posts.filter(p => p.trending).slice(0, 3);

  return (
    <div 
      className="relative select-none p-4 rounded-xl border border-antiqueGold/25 contact-shadow-soft max-w-xs w-full"
      style={{
        background: 'linear-gradient(135deg, rgba(20,25,35,0.92) 0%, rgba(8,11,18,0.96) 100%)',
        backdropFilter: 'blur(16px)',
        transform: 'rotate(0.5deg)'
      }}
    >
      {/* Stone Chiseled Header */}
      <div className="flex items-center justify-between text-[10px] font-mono text-brightGold pb-2 border-b border-antiqueGold/20 mb-2">
        <span className="flex items-center gap-1.5 font-bold tracking-widest font-cinzel">
          <TrendingUp className="w-3 h-3 text-candleAmber" />
          ENGRAVED IN STONE: TRENDING
        </span>
      </div>

      {/* Engraved Post Inscriptions */}
      <div className="space-y-1.5">
        {trendingPosts.map((post, idx) => (
          <div 
            key={post.id}
            onClick={() => selectPostById(post.id)}
            className="p-2 rounded-lg bg-white/[0.02] hover:bg-antiqueGold/15 border border-white/5 hover:border-antiqueGold/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-[8px] font-mono text-antiqueGold/80 mb-0.5">
              <span>0{idx + 1} // {post.category.toUpperCase()}</span>
              <span className="text-candleAmber font-semibold">{post.sparks} Sparks</span>
            </div>
            <h5 className="text-[11px] font-cinzel text-slate-200 group-hover:text-brightGold line-clamp-1 transition-colors">
              {post.title}
            </h5>
          </div>
        ))}
      </div>

    </div>
  );
}
