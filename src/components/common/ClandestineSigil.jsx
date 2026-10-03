export default function ClandestineSigil({ className = "w-8 h-8", glowing = false }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full transition-transform duration-500 ${glowing ? 'filter drop-shadow-[0_0_12px_rgba(200,159,86,0.8)]' : 'filter drop-shadow-[0_0_6px_rgba(200,159,86,0.3)]'}`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Celestial Ring */}
        <circle cx="50" cy="50" r="44" stroke="#C89F56" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.75" />
        <circle cx="50" cy="50" r="40" stroke="#E8C77E" strokeWidth="1" opacity="0.9" />

        {/* 4 Cardinal Compass Prongs */}
        <line x1="50" y1="4" x2="50" y2="12" stroke="#E8C77E" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="88" x2="50" y2="96" stroke="#E8C77E" strokeWidth="2" strokeLinecap="round" />
        <line x1="4" y1="50" x2="12" y2="50" stroke="#E8C77E" strokeWidth="2" strokeLinecap="round" />
        <line x1="88" y1="50" x2="96" y2="50" stroke="#E8C77E" strokeWidth="2" strokeLinecap="round" />

        {/* Interlocking Archival Diamonds */}
        <polygon points="50,16 84,50 50,84 16,50" stroke="#C89F56" strokeWidth="1.2" opacity="0.65" />
        <polygon points="50,22 78,50 50,78 22,50" stroke="#E8C77E" strokeWidth="1" strokeDasharray="2 4" opacity="0.8" />

        {/* Central Astrolabe Core */}
        <circle cx="50" cy="50" r="14" fill="#07090E" stroke="#E8C77E" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="6" fill="#F59E0B" opacity="0.85" className="animate-pulse" />

        {/* Scholarly Quill & Compass Angle */}
        <path d="M42 58 L58 42 M54 38 L62 46 M38 62 L42 58" stroke="#E8C77E" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}