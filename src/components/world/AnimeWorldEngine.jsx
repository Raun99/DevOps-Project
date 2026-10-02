
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useClandestine } from '../../context/ClandestineContext';
import AnimeCharacter from './AnimeCharacter';
import { soundEngine } from '../../audio/AudioSynthesizer';
import { 
  BookOpen, 
  Search, 
  Flame, 
  Sparkles, 
  Eye, 
  Compass, 
  Library,
  MapPin
} from 'lucide-react';

export default function AnimeWorldEngine() {
  const { 
    cameraMode, 
    travelTo, 
    currentPost, 
    ambientMode, 
    toggleAmbientMode,
    selectPostById,
    filteredPosts
  } = useClandestine();

  // Player Character Coordinates & State in the 3D Castle World
  // Coordinates are in percentages of the world stage: x (0 to 100%), y (0 to 100%)
  const [player, setPlayer] = useState({
    x: 50,
    y: 65,
    isMoving: false,
    direction: 'down',
    targetX: null,
    targetY: null
  });

  // World Camera Offset and Orbit (Pan & Look)
  const [camera, setCamera] = useState({
    offsetX: 0,
    offsetY: 0,
    panX: 0,
    panY: 0,
    zoom: 1.05
  });

  const [activeInteractiveObject, setActiveInteractiveObject] = useState(null);
  const [clickBeacon, setClickBeacon] = useState(null);
  const [catPurrNotice, setCatPurrNotice] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const stageRef = useRef(null);
  const keysPressed = useRef({});

  // 3D In-World Interactive Landmarks & Book Lecterns
  const interactiveObjects = [
    {
      id: 'desk-book',
      name: currentPost?.title || 'Featured Article',
      label: 'Read Article',
      icon: BookOpen,
      x: 48,
      y: 62,
      interactionRadius: 18,
      action: () => travelTo('reading')
    },
    {
      id: 'balcony-vista',
      name: 'Celestial Balcony & Waterfalls',
      label: 'Gaze into Abyss',
      icon: MapPin,
      x: 50,
      y: 35,
      interactionRadius: 16,
      action: () => {
        soundEngine.playGlissandoWhoosh();
        setCamera(c => ({ ...c, zoom: c.zoom === 1.25 ? 1.05 : 1.25, offsetY: c.zoom === 1.25 ? 0 : 40 }));
      }
    },
    {
      id: 'astrolabe-search',
      name: 'Celestial Astrolabe (Search)',
      label: 'Search Articles',
      icon: Search,
      x: 20,
      y: 42,
      interactionRadius: 18,
      action: () => travelTo('search')
    },
    {
      id: 'candle-light',
      name: ambientMode === 'warm' ? 'Candle (Radiant Mode)' : 'Candle (Dim Twilight)',
      label: 'Toggle Lighting',
      icon: Flame,
      x: 82,
      y: 72,
      interactionRadius: 16,
      action: () => toggleAmbientMode()
    },
    {
      id: 'cat-familiar',
      name: 'Black Cat Familiar',
      label: 'Pet Familiar',
      icon: Sparkles,
      x: 34,
      y: 74,
      interactionRadius: 16,
      action: () => {
        soundEngine.playCatPurr();
        const quotes = [
          "*purrs happily* 'You can use WASD or click anywhere to walk!'",
          "*curls tail* 'Each book in the castle holds a story from our writers.'",
          "*eyes gleam* 'Toggle the candle to switch between warm sunlight and cool moonlight!'",
          "*stretches lazily* 'The astrolabe on the left lets you search all blogs!'"
        ];
        setCatPurrNotice(quotes[Math.floor(Math.random() * quotes.length)]);
        setTimeout(() => setCatPurrNotice(null), 4000);
      }
    },
    {
      id: 'citadel-portal',
      name: 'Citadel Cathedral Archway',
      label: 'Enter Cathedral Nave',
      icon: Eye,
      x: 78,
      y: 36,
      interactionRadius: 18,
      action: () => travelTo('cathedral')
    }
  ];

  // Keyboard Movement Loop (WASD / Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept typing in inputs or when reading a book
      if (cameraMode === 'reading' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      keysPressed.current[e.key.toLowerCase()] = true;

      // Press 'E' to interact with the nearest object
      if (e.key.toLowerCase() === 'e' && activeInteractiveObject) {
        e.preventDefault();
        activeInteractiveObject.action();
      }
    };

    const handleKeyUp = (e) => {
      delete keysPressed.current[e.key.toLowerCase()];
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Continuous 60fps game loop for character movement
    let animId;
    const moveLoop = () => {
      setPlayer((prev) => {
        let dx = 0;
        let dy = 0;
        let dir = prev.direction;

        // WASD / Arrow Keys logic
        const keys = keysPressed.current;
        if (keys['w'] || keys['arrowup']) { dy -= 0.65; dir = 'up'; }
        if (keys['s'] || keys['arrowdown']) { dy += 0.65; dir = 'down'; }
        if (keys['a'] || keys['arrowleft']) { dx -= 0.75; dir = 'left'; }
        if (keys['d'] || keys['arrowright']) { dx += 0.75; dir = 'right'; }

        // Click-to-move interpolation
        if (prev.targetX !== null && prev.targetY !== null && dx === 0 && dy === 0) {
          const distX = prev.targetX - prev.x;
          const distY = prev.targetY - prev.y;
          const distance = Math.sqrt(distX * distX + distY * distY);

          if (distance > 0.8) {
            const speed = 0.8;
            dx = (distX / distance) * speed;
            dy = (distY / distance) * speed;
            if (Math.abs(dx) > Math.abs(dy)) {
              dir = dx > 0 ? 'right' : 'left';
            } else {
              dir = dy > 0 ? 'down' : 'up';
            }
          } else {
            return { ...prev, isMoving: false, targetX: null, targetY: null };
          }
        }

        const isMoving = dx !== 0 || dy !== 0;

        if (!isMoving) {
          return { ...prev, isMoving: false };
        }

        // Clamp character movement to walkable castle boundaries
        const newX = Math.min(88, Math.max(12, prev.x + dx));
        const newY = Math.min(85, Math.max(28, prev.y + dy));

        return {
          ...prev,
          x: newX,
          y: newY,
          isMoving: true,
          direction: dir
        };
      });

      animId = requestAnimationFrame(moveLoop);
    };

    animId = requestAnimationFrame(moveLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [cameraMode, activeInteractiveObject]);

  // Check proximity to interactive objects whenever player moves
  useEffect(() => {
    let closest = null;
    let closestDist = Infinity;

    for (const obj of interactiveObjects) {
      const dx = player.x - obj.x;
      const dy = player.y - obj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < obj.interactionRadius && dist < closestDist) {
        closest = obj;
        closestDist = dist;
      }
    }

    setActiveInteractiveObject(closest);

    // Smoothly track camera with player position
    setCamera((prev) => ({
      ...prev,
      offsetX: (50 - player.x) * 1.8,
      offsetY: (60 - player.y) * 1.2
    }));
  }, [player.x, player.y]);

  // Click on floor to walk character there
  const handleFloorClick = (e) => {
    // Ignore clicks on buttons/dialogs
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) return;

    const rect = stageRef.current.getBoundingClientRect();
    const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    // Set walking destination
    setPlayer((prev) => ({
      ...prev,
      targetX: clickXPercent,
      targetY: clickYPercent,
      isMoving: true
    }));

    // Spawn anime click beacon
    setClickBeacon({ x: e.clientX, y: e.clientY });
    setTimeout(() => setClickBeacon(null), 1200);
    soundEngine.playGlissandoWhoosh();
  };

  // Mouse drag for 360-degree camera pan
  const handleMouseDown = (e) => {
    if (e.button === 0 && (e.shiftKey || e.ctrlKey || e.altKey)) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setCamera(c => ({
        ...c,
        panX: Math.min(45, Math.max(-45, c.panX + dx * 0.15)),
        panY: Math.min(25, Math.max(-25, c.panY + dy * 0.12))
      }));
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Switch between Cathedral Nave and Observatory Chamber
  if (cameraMode === 'cathedral') {
    return (
      <div className="relative w-full h-full min-h-screen overflow-hidden bg-black select-none">
        {/* Full Grand Cathedral Nave Plate with Animated Atmosphere */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: "url('/assets/cathedral-nave.jpg')",
            filter: ambientMode === 'dim' ? 'brightness(0.7) contrast(1.2)' : 'brightness(0.95) contrast(1.05)'
          }}
        />

        {/* Cathedral Sunbeams */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-400/10 via-transparent to-black/60 pointer-events-none" />

        {/* Cathedral Interaction Controls */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-40">
          <button
            onClick={() => travelTo('chamber')}
            className="px-6 py-3 rounded-2xl bg-black/85 hover:bg-black text-amber-200 border border-brightGold/50 shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 font-cinzel text-xs font-bold cursor-pointer"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>RETURN TO OBSERVATORY CASTLE</span>
          </button>

          <button
            onClick={() => travelTo('search')}
            className="px-6 py-3 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-400/50 shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 font-cinzel text-xs font-bold cursor-pointer"
          >
            <Search className="w-4 h-4 text-cyan-300 animate-spin-slow" />
            <span>SEARCH ARCHIVES</span>
          </button>
        </div>
      </div>
    );
  }

  // Current background lighting exposure
  const currentBgFilter = ambientMode === 'dim'
    ? 'brightness(0.65) contrast(1.22) saturate(0.8) hue-rotate(-12deg)'
    : 'brightness(1.02) contrast(1.08) saturate(1.1) drop-shadow(0 0 20px rgba(245,158,11,0.25))';

  return (
    <div 
      ref={stageRef}
      onClick={handleFloorClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full min-h-screen overflow-hidden bg-[#070b14] select-none cursor-crosshair"
    >
      
      {/* 1. LAYER 0: Animated High-Resolution Anime Castle Environment Plate */}
      <div 
        className="absolute inset-[-5%] w-[110%] h-[110%] bg-cover bg-center transition-transform duration-300 ease-out pointer-events-none"
        style={{
          backgroundImage: "url('/assets/observatory-desk.jpg')",
          backgroundPosition: 'center 32%',
          filter: currentBgFilter,
          transform: `translate3d(${camera.offsetX + camera.panX}px, ${camera.offsetY + camera.panY}px, 0) scale(${camera.zoom})`
        }}
      />

      {/* 2. LAYER 1: Dynamic Flowing Waterfall Mist & Volumetric Light God-Rays */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          opacity: ambientMode === 'warm' ? 0.6 : 0.35,
          background: ambientMode === 'warm'
            ? 'radial-gradient(ellipse at 70% 30%, rgba(245, 158, 11, 0.22) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(245, 158, 11, 0.35) 0%, transparent 50%)'
            : 'radial-gradient(ellipse at 50% 30%, rgba(56, 189, 248, 0.25) 0%, transparent 60%)'
        }}
      />

      {/* 3. LAYER 2: In-World Interactive 3D Objects & Lecterns */}
      <div 
        className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${camera.offsetX + camera.panX}px, ${camera.offsetY + camera.panY}px, 0) scale(${camera.zoom})`
        }}
      >
        {/* Physical 3D Open Book on the Scholar's Desk */}
        <div 
          onClick={(e) => { e.stopPropagation(); travelTo('reading'); }}
          className="pointer-events-auto absolute left-[48%] top-[60%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          title="Click to open book and read article"
        >
          {/* Subtle animated floating aura around book */}
          <div className="absolute inset-[-12px] rounded-full bg-amber-400/25 blur-lg animate-pulse" />
          
          <div className="relative px-4 py-2 rounded-2xl bg-black/85 hover:bg-black border-2 border-brightGold/80 shadow-[0_0_30px_rgba(245,158,11,0.7)] backdrop-blur-md flex items-center gap-2.5 transition-all hover:scale-110">
            <BookOpen className="w-5 h-5 text-brightGold animate-bounce" />
            <div className="text-left">
              <div className="text-[10px] font-mono text-amber-300 font-bold">OPEN BOOK</div>
              <div className="text-xs font-cinzel font-bold text-white max-w-[200px] truncate">
                {currentPost.title}
              </div>
            </div>
          </div>
        </div>

        {/* In-World Candle Flame on the Desk with Visible Glow */}
        <div 
          onClick={(e) => { e.stopPropagation(); toggleAmbientMode(); }}
          className="pointer-events-auto absolute left-[82%] top-[72%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          title="Click to toggle chamber lighting"
        >
          {/* Glowing Radial Candle Spill */}
          <div 
            className="absolute -top-12 -left-12 w-32 h-32 rounded-full pointer-events-none transition-all duration-700"
            style={{
              background: ambientMode === 'warm' 
                ? 'radial-gradient(circle, rgba(245, 158, 11, 0.6) 0%, rgba(245, 158, 11, 0.15) 50%, transparent 70%)'
                : 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 60%)'
            }}
          />
          <div className="relative p-2.5 rounded-full bg-black/80 hover:bg-black border border-amber-500/80 shadow-lg flex items-center gap-1.5 transition-transform hover:scale-110">
            <Flame className="w-5 h-5 text-amber-400 animate-flame-flicker" />
            <span className="text-[10px] font-mono font-bold text-amber-200 pr-1">
              {ambientMode === 'warm' ? 'RADIANT' : 'DIM'}
            </span>
          </div>
        </div>

        {/* Sleeping Black Cat Familiar */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            soundEngine.playCatPurr();
            setCatPurrNotice("*purrs softly* 'Press E near books to open them!'");
            setTimeout(() => setCatPurrNotice(null), 3500);
          }}
          className="pointer-events-auto absolute left-[34%] top-[74%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          title="Sleeping cat familiar (Click to pet)"
        >
          <div className="relative px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black border border-brightGold/40 hover:border-brightGold shadow-lg flex items-center gap-1.5 transition-transform hover:scale-110">
            <Sparkles className="w-3.5 h-3.5 text-brightGold animate-pulse" />
            <span className="text-[10px] font-mono text-amber-200">PET CAT</span>
          </div>
          {catPurrNotice && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-black/95 border-2 border-brightGold text-amber-200 text-xs font-cormorant italic shadow-2xl z-50 pointer-events-none animate-bounce">
              {catPurrNotice}
            </div>
          )}
        </div>

        {/* Celestial Astrolabe Search Stand */}
        <div 
          onClick={(e) => { e.stopPropagation(); travelTo('search'); }}
          className="pointer-events-auto absolute left-[20%] top-[42%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          title="Turn the astrolabe to search articles"
        >
          <div className="relative p-3 rounded-2xl bg-black/80 hover:bg-black border border-cyan-400/60 shadow-[0_0_25px_rgba(56,189,248,0.5)] flex items-center gap-2 transition-transform hover:scale-110">
            <Search className="w-4 h-4 text-cyan-300 animate-spin-slow" />
            <span className="text-xs font-cinzel font-bold text-cyan-200 hidden sm:inline">ASTROLABE SEARCH</span>
          </div>
        </div>

        {/* Cathedral Portal Gateway */}
        <div 
          onClick={(e) => { e.stopPropagation(); travelTo('cathedral'); }}
          className="pointer-events-auto absolute left-[78%] top-[36%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          title="Walk into the Grand Cathedral Nave"
        >
          <div className="relative px-4 py-2 rounded-2xl bg-black/80 hover:bg-black border border-brightGold/60 shadow-[0_0_25px_rgba(232,199,126,0.5)] flex items-center gap-2 transition-transform hover:scale-110">
            <Eye className="w-4 h-4 text-brightGold" />
            <span className="text-xs font-cinzel font-bold text-brightGold">ENTER CATHEDRAL »</span>
          </div>
        </div>

        {/* 4. LAYER 3: Controllable 3D Anime Character */}
        {stageRef.current && (
          <AnimeCharacter 
            x={(player.x / 100) * stageRef.current.clientWidth}
            y={(player.y / 100) * stageRef.current.clientHeight}
            isMoving={player.isMoving}
            direction={player.direction}
          />
        )}
      </div>

      {/* 5. Click-to-Move Target Beacon Ring */}
      {clickBeacon && (
        <div 
          className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${clickBeacon.x}px`, top: `${clickBeacon.y}px` }}
        >
          <div className="w-16 h-16 rounded-full border-2 border-brightGold shadow-[0_0_20px_#F59E0B] animate-ping" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-brightGold text-xs font-bold animate-spin-slow">✦</span>
          </div>
        </div>
      )}

      {/* 6. Contextual Interaction Prompt when near an object */}
      {activeInteractiveObject && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-fade-in">
          <button
            onClick={activeInteractiveObject.action}
            className="px-6 py-3 rounded-2xl bg-black/90 hover:bg-black text-brightGold border-2 border-brightGold shadow-[0_0_35px_rgba(232,199,126,0.7)] backdrop-blur-xl flex items-center gap-3 transition-transform hover:scale-105 cursor-pointer font-cinzel text-xs font-bold tracking-wider"
          >
            <span className="px-2 py-0.5 rounded-lg bg-brightGold text-obsidian font-mono text-xs font-bold">
              PRESS [E]
            </span>
            <span>{activeInteractiveObject.label.toUpperCase()}: "{activeInteractiveObject.name}"</span>
          </button>
        </div>
      )}

      {/* 7. Minimalist Corner Controls Guide */}
      <div className="fixed bottom-4 left-6 z-30 pointer-events-none hidden sm:flex items-center space-x-3 text-[10px] font-mono text-slate-400 bg-black/60 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
        <span className="text-amber-200 font-bold">CONTROLS:</span>
        <span>[W][A][S][D] / Click to Walk</span>
        <span>•</span>
        <span>[E] Interact</span>
        <span>•</span>
        <span>[Shift + Drag] 360° Pan</span>
      </div>

    </div>
  );
}
