
import React from 'react';
import CategoryBookStack from './CategoryBookStack';
import InteractiveCandle from './InteractiveCandle';
import CrystalOrb from './CrystalOrb';
import SleepingCat from './SleepingCat';
import TrendingStonePlaque from './TrendingStonePlaque';
import DeskMug from './DeskMug';
import FeaturedManuscript from '../manuscript/FeaturedManuscript';
import AstrolabeSearch from '../shell/AstrolabeSearch';

export default function StudyDesk() {
  return (
    <div className="relative w-full max-w-[1780px] mx-auto px-4 sm:px-8 pt-16 pb-8 flex flex-col justify-start">
      
      {/* Upper Observatory Ledge: Astrolabe Search resting naturally in upper right */}
      <div className="w-full flex items-center justify-end mb-3 pr-2">
        <AstrolabeSearch />
      </div>

      {/* Asymmetrical Spatial Desk Composition */}
      <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-6 relative z-20">
        
        {/* LEFT WING: Stacked Leather Volumes + Curled Cat + Steeping Mug */}
        <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col space-y-5 lg:pt-4">
          <CategoryBookStack />

          {/* Physical Desk Surface: Cat Curled intimate to the Book Base */}
          <div className="relative flex items-end justify-start space-x-6 pl-2 pt-2">
            <SleepingCat />
            <DeskMug />
          </div>
        </aside>

        {/* CENTERPIECE: The Grand Open Codex Folio (Commanding Primary Hierarchy) */}
        <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center">
          <FeaturedManuscript />
        </main>

        {/* RIGHT WING: Trending Stone Slate + Radiant Candle + Enchanted Crystal Orb */}
        <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col space-y-6 items-end lg:pt-2">
          <TrendingStonePlaque />

          {/* Candle & Crystal Orb Sitting Directly on the Desk Surface */}
          <div className="relative w-full flex items-center justify-around pt-3 pr-2">
            <CrystalOrb />
            <InteractiveCandle />
          </div>
        </aside>

      </div>

    </div>
  );
}
