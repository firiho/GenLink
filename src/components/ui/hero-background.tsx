import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { HeroVoxelBackground } from './hero-voxel-background';
import { HeroHexagonBackground } from './hero-hexagon-background';
import { HeroOrbitalBackground } from './hero-orbital-background';

// Configuration to easily switch between variants
type BackgroundVariant = 'voxel' | 'hexagon' | 'orbital';
const BACKGROUND_VARIANT = 'hexagon' as BackgroundVariant;

export const HeroBackground = () => {
  const { actualTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = actualTheme === 'dark';

  const renderBackground = () => {
    switch (BACKGROUND_VARIANT) {
      case 'hexagon':
        return <HeroHexagonBackground />;
      case 'orbital':
        return <HeroOrbitalBackground />;
      case 'voxel':
      default:
        return <HeroVoxelBackground />;
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${isDark ? 'bg-background' : 'bg-white'}`} ref={containerRef}>
      {/* 3D Scene Selection */}
      {renderBackground()}

      {/* Dark Mode Overlays */}
      {isDark && (
        <>
          {/* Grid lines commented out as requested */}
          {/* <div className="absolute inset-0 bg-tech-grid opacity-[0.02] pointer-events-none" /> */}
          
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />
          {/* Stronger fade at bottom for dark mode to blend with content */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        </>
      )}

      {/* Light Mode Overlays */}
      {!isDark && (
        <>
          {/* Grid lines commented out as requested */}
          {/* <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
            }}
          /> */}
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-40 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-indigo-50/50 to-transparent blur-3xl" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none" />
        </>
      )}
    </div>
  );
};
