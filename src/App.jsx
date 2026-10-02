
import React from 'react';
import { ClandestineProvider } from './context/ClandestineContext';
import Full3DCastleEngine from './components/world/Full3DCastleEngine';
import CleanBloggingHeader from './components/shell/CleanBloggingHeader';
import BookPageFlipModal from './components/world/BookPageFlipModal';
import AstrolabeSearchModal from './components/shell/AstrolabeSearchModal';
import CursorTrailCanvas from './components/common/CursorTrailCanvas';

function Clandestine3DWorld() {
  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-[#05070e] text-slate-100 select-none">
      {/* 1. ANIME MOUSE CURSOR TRAIL */}
      <CursorTrailCanvas />

      {/* 2. CLEAN MODERN BLOGGING HEADER */}
      <CleanBloggingHeader />

      {/* 3. FULL FIRST-PERSON 3D CASTLE ENGINE (16 Explorable Rooms Through Player's Eyes) */}
      <Full3DCastleEngine />

      {/* 4. 3D REALISTIC PAGE-FLIP BOOK READER */}
      <BookPageFlipModal />

      {/* 5. CELESTIAL ASTROLABE SEARCH MODAL */}
      <AstrolabeSearchModal />
    </div>
  );
}

export default function App() {
  return (
    <ClandestineProvider>
      <Clandestine3DWorld />
    </ClandestineProvider>
  );
}
