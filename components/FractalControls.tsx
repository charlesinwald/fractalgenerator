'use client';

import React, { useState } from 'react';
import type { FractalSettings, AnimationMode, ColorMode, FilterType, FlowerType, SecondaryEffect } from '@/types';

interface FractalControlsProps {
  settings: FractalSettings;
  onSettingsChange: (settings: Partial<FractalSettings>) => void;
  onRandomize: () => void;
  onClear: () => void;
  onSave: () => void;
  onToggleAnimation: () => void;
  isAnimating: boolean;
}

interface AccordionSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionSection({ title, icon, children, defaultOpen = false }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2 border border-white/10 rounded-lg overflow-hidden bg-white/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-white/90 hover:bg-white/10 transition-all"
      >
        <div className="flex items-center gap-2">
          <i className={`fas ${icon} text-[#4ecdc4]`}></i>
          <span className="font-medium text-sm">{title}</span>
        </div>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-xs transition-transform`}></i>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-3 pt-0 space-y-3">{children}</div>
      </div>
    </div>
  );
}

export default function FractalControls({
  settings,
  onSettingsChange,
  onRandomize,
  onClear,
  onSave,
  onToggleAnimation,
  isAnimating,
}: FractalControlsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-gradient-to-br from-[#4ecdc4] to-[#44a08d] text-white p-3 rounded-full shadow-lg"
      >
        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
      </button>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Controls Panel */}
      <div
        className={`
          flex-shrink-0 flex flex-col justify-start items-stretch p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md
          md:w-[280px] md:relative md:max-h-full md:translate-x-0
          fixed top-0 right-0 w-[85vw] max-w-[320px] h-full z-40 overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        {/* Action Buttons - Always visible at top */}
        <div className="grid grid-cols-2 gap-2 mb-4 sticky top-0 bg-[#1a1a2e]/95 backdrop-blur-md p-2 -m-2 rounded-lg z-10">
          <button
            onClick={() => {
              onToggleAnimation();
              setIsMenuOpen(false);
            }}
            className="bg-gradient-to-br from-[#a29bfe] to-[#6c5ce7] border-none text-white px-2.5 py-2 flex flex-col items-center justify-center gap-1 font-semibold cursor-pointer rounded-lg transition-all shadow-[0_4px_15px_rgba(162,155,254,0.3)] min-h-[45px] hover:transform hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(162,155,254,0.4)] active:transform-none"
            title={isAnimating ? 'Stop Animation' : 'Start Animation'}
          >
            <i className={`fas ${isAnimating ? 'fa-stop' : 'fa-play'} text-sm`}></i>
            <span className="text-[10px] font-medium leading-none">{isAnimating ? 'Stop' : 'Animate'}</span>
          </button>

          <button
            onClick={() => {
              onRandomize();
              setIsMenuOpen(false);
            }}
            className="bg-gradient-to-br from-[#ffeaa7] to-[#fdcb6e] border-none text-white px-2.5 py-2 flex flex-col items-center justify-center gap-1 font-semibold cursor-pointer rounded-lg transition-all shadow-[0_4px_15px_rgba(255,234,167,0.3)] min-h-[45px] hover:transform hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,234,167,0.4)] active:transform-none"
            title="Generate Random Fractal"
          >
            <i className="fas fa-dice text-sm"></i>
            <span className="text-[10px] font-medium leading-none">Random</span>
          </button>

          <button
            onClick={() => {
              onSave();
              setIsMenuOpen(false);
            }}
            className="bg-gradient-to-br from-[#4ecdc4] to-[#44a08d] border-none text-white px-2.5 py-2 flex flex-col items-center justify-center gap-1 font-semibold cursor-pointer rounded-lg transition-all shadow-[0_4px_15px_rgba(78,205,196,0.3)] min-h-[45px] hover:transform hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(78,205,196,0.4)] active:transform-none"
            title="Save as Image"
          >
            <i className="fas fa-download text-sm"></i>
            <span className="text-[10px] font-medium leading-none">Save</span>
          </button>

          <button
            onClick={() => {
              onClear();
              setIsMenuOpen(false);
            }}
            className="bg-gradient-to-br from-[#ff6b6b] to-[#ee5a52] border-none text-white px-2.5 py-2 flex flex-col items-center justify-center gap-1 font-semibold cursor-pointer rounded-lg transition-all shadow-[0_4px_15px_rgba(255,107,107,0.3)] min-h-[45px] hover:transform hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,107,107,0.4)] active:transform-none"
            title="Clear Canvas"
          >
            <i className="fas fa-eraser text-sm"></i>
            <span className="text-[10px] font-medium leading-none">Clear</span>
          </button>
        </div>

        {/* Collapsible Sections */}
        <AccordionSection title="Drawing" icon="fa-paint-brush" defaultOpen={true}>
          <div>
            <label className="text-white/90 font-medium mb-1 text-xs block">Number of Fractals:</label>
            <select
              value={settings.symmetry}
              onChange={(e) => onSettingsChange({ symmetry: parseInt(e.target.value) })}
              className="w-full bg-white/10 border-2 border-white/20 text-white p-2 rounded-lg text-sm transition-all cursor-pointer focus:outline-none focus:border-[#4ecdc4] focus:bg-white/15"
            >
              {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                <option key={num} value={num} className="bg-[#1a1a2e] text-white">
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/90 font-medium mb-1 text-xs block">Stroke Weight:</label>
            <input
              type="range"
              min="1"
              max="32"
              step="0.1"
              value={settings.strokeWeight}
              onChange={(e) => onSettingsChange({ strokeWeight: parseFloat(e.target.value) })}
              className="w-full h-1.5 rounded-md bg-white/20 appearance-none opacity-70 hover:opacity-100 transition-opacity [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[#4ecdc4] [&::-webkit-slider-thumb]:to-[#44a08d] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(78,205,196,0.4)]"
            />
            <span className="text-xs text-white/60">{settings.strokeWeight.toFixed(1)}</span>
          </div>
        </AccordionSection>

        <AccordionSection title="Colors" icon="fa-palette" defaultOpen={false}>
          <div>
            <label className="text-white/90 font-medium mb-1 text-xs block">Color Mode:</label>
            <select
              value={settings.colorMode}
              onChange={(e) => onSettingsChange({ colorMode: e.target.value as ColorMode })}
              className="w-full bg-white/10 border-2 border-white/20 text-white p-2 rounded-lg text-sm transition-all cursor-pointer focus:outline-none focus:border-[#4ecdc4] focus:bg-white/15"
            >
              <option value="rainbow" className="bg-[#1a1a2e] text-white">Rainbow</option>
              <option value="gradient" className="bg-[#1a1a2e] text-white">Gradient</option>
              <option value="solid" className="bg-[#1a1a2e] text-white">Solid</option>
            </select>
          </div>

          {settings.colorMode === 'solid' && (
            <div>
              <label className="text-white/90 font-medium mb-1 text-xs block">Choose Color:</label>
              <input
                type="color"
                value={settings.solidColor}
                onChange={(e) => onSettingsChange({ solidColor: e.target.value })}
                className="w-full h-[35px] border-2 border-white/20 rounded-lg bg-transparent cursor-pointer p-0 transition-all focus:outline-none focus:border-[#4ecdc4] focus:shadow-[0_0_15px_rgba(78,205,196,0.3)]"
              />
            </div>
          )}
        </AccordionSection>

        <AccordionSection title="Filters" icon="fa-filter" defaultOpen={false}>
          <div>
            <label className="text-white/90 font-medium mb-1 text-xs block">Photographic Filter:</label>
            <select
              value={settings.filter}
              onChange={(e) => onSettingsChange({ filter: e.target.value as FilterType })}
              className="w-full bg-white/10 border-2 border-white/20 text-white p-2 rounded-lg text-sm transition-all cursor-pointer focus:outline-none focus:border-[#4ecdc4] focus:bg-white/15"
            >
              <option value="none" className="bg-[#1a1a2e] text-white">None</option>
              <option value="grayscale" className="bg-[#1a1a2e] text-white">Grayscale</option>
              <option value="sepia" className="bg-[#1a1a2e] text-white">Sepia</option>
              <option value="vintage" className="bg-[#1a1a2e] text-white">Vintage</option>
              <option value="blackwhite" className="bg-[#1a1a2e] text-white">Black & White</option>
              <option value="highcontrast" className="bg-[#1a1a2e] text-white">High Contrast</option>
              <option value="invert" className="bg-[#1a1a2e] text-white">Invert</option>
              <option value="blur" className="bg-[#1a1a2e] text-white">Blur</option>
              <option value="sharpen" className="bg-[#1a1a2e] text-white">Sharpen</option>
              <option value="saturate" className="bg-[#1a1a2e] text-white">Saturate</option>
              <option value="desaturate" className="bg-[#1a1a2e] text-white">Desaturate</option>
              <option value="brighten" className="bg-[#1a1a2e] text-white">Brighten</option>
              <option value="darken" className="bg-[#1a1a2e] text-white">Darken</option>
              <option value="posterize" className="bg-[#1a1a2e] text-white">Posterize</option>
              <option value="threshold" className="bg-[#1a1a2e] text-white">Threshold</option>
            </select>
          </div>
        </AccordionSection>

        <AccordionSection title="Animation" icon="fa-magic" defaultOpen={false}>
          <div>
            <label className="text-white/90 font-medium mb-1 text-xs block">Animation Mode:</label>
            <select
              value={settings.animationMode}
              onChange={(e) => onSettingsChange({ animationMode: e.target.value as AnimationMode })}
              className="w-full bg-white/10 border-2 border-white/20 text-white p-2 rounded-lg text-sm transition-all cursor-pointer focus:outline-none focus:border-[#4ecdc4] focus:bg-white/15"
            >
              <option value="rotate" className="bg-[#1a1a2e] text-white">Rotating Canvas</option>
              <option value="pulse" className="bg-[#1a1a2e] text-white">Pulsing</option>
              <option value="particles" className="bg-[#1a1a2e] text-white">Particle System</option>
              <option value="kaleidoscope" className="bg-[#1a1a2e] text-white">Kaleidoscope</option>
              <option value="wave" className="bg-[#1a1a2e] text-white">Wave Distortion</option>
              <option value="spiral" className="bg-[#1a1a2e] text-white">Spiral Growth</option>
              <option value="zoom" className="bg-[#1a1a2e] text-white">Fractal Zoom</option>
              <option value="morph" className="bg-[#1a1a2e] text-white">Morphing</option>
              <option value="flower" className="bg-[#1a1a2e] text-white">Blooming Flowers</option>
            </select>
          </div>

          {settings.animationMode === 'flower' && (
            <>
              <div>
                <label className="text-white/90 font-medium mb-1 text-xs block">Flower Type:</label>
                <select
                  value={settings.flowerType}
                  onChange={(e) => onSettingsChange({ flowerType: e.target.value as FlowerType })}
                  className="w-full bg-white/10 border-2 border-white/20 text-white p-2 rounded-lg text-sm transition-all cursor-pointer focus:outline-none focus:border-[#4ecdc4] focus:bg-white/15"
                >
                  <option value="rose" className="bg-[#1a1a2e] text-white">Rose</option>
                  <option value="lily" className="bg-[#1a1a2e] text-white">Lily</option>
                  <option value="lotus" className="bg-[#1a1a2e] text-white">Lotus</option>
                  <option value="cherry" className="bg-[#1a1a2e] text-white">Cherry Blossom</option>
                  <option value="dahlia" className="bg-[#1a1a2e] text-white">Dahlia</option>
                </select>
              </div>

              <div>
                <label className="text-white/90 font-medium mb-1 text-xs block">Flower Count:</label>
                <select
                  value={settings.flowerCount}
                  onChange={(e) => onSettingsChange({ flowerCount: parseInt(e.target.value) })}
                  className="w-full bg-white/10 border-2 border-white/20 text-white p-2 rounded-lg text-sm transition-all cursor-pointer focus:outline-none focus:border-[#4ecdc4] focus:bg-white/15"
                >
                  <option value="1" className="bg-[#1a1a2e] text-white">Single</option>
                  <option value="2" className="bg-[#1a1a2e] text-white">Pair</option>
                  <option value="3" className="bg-[#1a1a2e] text-white">Three</option>
                  <option value="5" className="bg-[#1a1a2e] text-white">Garden (5)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-white/90 font-medium mb-1 text-xs block">Animation Speed:</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={settings.animationSpeed}
              onChange={(e) => onSettingsChange({ animationSpeed: parseFloat(e.target.value) })}
              className="w-full h-1.5 rounded-md bg-white/20 appearance-none opacity-70 hover:opacity-100 transition-opacity [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[#4ecdc4] [&::-webkit-slider-thumb]:to-[#44a08d] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(78,205,196,0.4)]"
            />
            <span className="text-xs text-white/60">{settings.animationSpeed.toFixed(1)}x</span>
          </div>
        </AccordionSection>

        <AccordionSection title="Effects" icon="fa-sparkles" defaultOpen={false}>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="trailsEnabled"
              checked={settings.trailsEnabled}
              onChange={(e) => onSettingsChange({ trailsEnabled: e.target.checked })}
              className="w-5 h-5 accent-[#4ecdc4] cursor-pointer rounded"
            />
            <label htmlFor="trailsEnabled" className="text-white/90 font-medium text-xs cursor-pointer select-none">
              Enable Trails
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="combineEffects"
              checked={settings.combineEffects}
              onChange={(e) => onSettingsChange({ combineEffects: e.target.checked })}
              className="w-5 h-5 accent-[#4ecdc4] cursor-pointer rounded"
            />
            <label htmlFor="combineEffects" className="text-white/90 font-medium text-xs cursor-pointer select-none">
              Combine Effects
            </label>
          </div>

          {settings.combineEffects && (
            <div>
              <label className="text-white/90 font-medium mb-1 text-xs block">Secondary Effect:</label>
              <select
                value={settings.secondaryEffect}
                onChange={(e) => onSettingsChange({ secondaryEffect: e.target.value as SecondaryEffect })}
                className="w-full bg-white/10 border-2 border-white/20 text-white p-2 rounded-lg text-sm transition-all cursor-pointer focus:outline-none focus:border-[#4ecdc4] focus:bg-white/15"
              >
                <option value="none" className="bg-[#1a1a2e] text-white">None</option>
                <option value="rotate" className="bg-[#1a1a2e] text-white">Rotation</option>
                <option value="pulse" className="bg-[#1a1a2e] text-white">Pulse</option>
                <option value="wave" className="bg-[#1a1a2e] text-white">Wave</option>
              </select>
            </div>
          )}
        </AccordionSection>

        <AccordionSection title="Performance" icon="fa-rocket" defaultOpen={false}>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="gpuAcceleration"
              checked={settings.gpuAcceleration}
              onChange={(e) => onSettingsChange({ gpuAcceleration: e.target.checked })}
              className="w-5 h-5 accent-[#4ecdc4] cursor-pointer rounded"
            />
            <label htmlFor="gpuAcceleration" className="text-white/90 font-medium text-xs cursor-pointer select-none">
              GPU Acceleration
            </label>
          </div>
          <p className="text-xs text-white/60 mt-1 leading-relaxed">
            Uses WebGL shaders for faster filter processing and rendering. Best for complex animations and filters.
          </p>
        </AccordionSection>
      </div>
    </>
  );
}
