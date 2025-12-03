'use client';

import { useState } from 'react';
import FractalCanvas from '@/components/FractalCanvas';
import FractalControls from '@/components/FractalControls';
import type { FractalSettings } from '@/types';

export default function Home() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [settings, setSettings] = useState<FractalSettings>({
    symmetry: 6,
    strokeWeight: 4,
    colorMode: 'rainbow',
    solidColor: '#4ECDC4',
    animationMode: 'rotate',
    animationSpeed: 1.0,
    filter: 'none',
    combineEffects: false,
    secondaryEffect: 'none',
    trailsEnabled: false,
    flowerType: 'rose',
    flowerCount: 3,
    gpuAcceleration: true,
  });

  const handleSettingsChange = (newSettings: Partial<FractalSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleRandomize = () => {
    window.dispatchEvent(new Event('randomize-fractal'));
  };

  const handleClear = () => {
    window.dispatchEvent(new Event('clear-fractal'));
    setIsAnimating(false);
  };

  const handleSave = () => {
    window.dispatchEvent(new Event('save-fractal'));
  };

  const handleToggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start w-full overflow-hidden">
      <h1 className="bg-gradient-to-r from-[#ff6b6b] via-[#4ecdc4] via-[#45b7d1] via-[#96ceb4] to-[#ffeaa7] bg-[length:200%_200%] animate-[gradientShift_4s_ease-in-out_infinite] bg-clip-text text-transparent text-2xl md:text-3xl mt-4 mb-4 font-extrabold text-center tracking-[2px] md:tracking-[3px] uppercase relative [filter:drop-shadow(0_0_20px_rgba(78,205,196,0.4))_drop-shadow(0_0_40px_rgba(255,107,107,0.3))]">
        Fractal Generator
      </h1>

      <div className="flex flex-nowrap gap-4 bg-white/5 p-2.5 rounded-[20px] border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.2)] backdrop-blur-[20px] mx-2.5 mb-2.5 overflow-hidden items-start w-[calc(100%-20px)] max-w-[1400px] md:flex-row flex-col h-[calc(100vh-120px)] md:h-auto">
        <FractalCanvas
          settings={settings}
          onRandomize={handleRandomize}
          isAnimating={isAnimating}
          onSave={handleSave}
          onClear={handleClear}
        />
        <FractalControls
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onRandomize={handleRandomize}
          onClear={handleClear}
          onSave={handleSave}
          onToggleAnimation={handleToggleAnimation}
          isAnimating={isAnimating}
        />
      </div>
    </main>
  );
}
