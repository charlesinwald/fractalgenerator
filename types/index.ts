import type p5 from 'p5';

export type ColorMode = 'rainbow' | 'gradient' | 'solid';
export type AnimationMode = 'rotate' | 'pulse' | 'particles' | 'kaleidoscope' | 'wave' | 'spiral' | 'zoom' | 'morph' | 'flower';
export type FlowerType = 'rose' | 'lily' | 'lotus' | 'cherry' | 'dahlia';
export type FilterType = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'blackwhite' | 'highcontrast' | 'invert' | 'blur' | 'sharpen' | 'saturate' | 'desaturate' | 'brighten' | 'darken' | 'posterize' | 'threshold';
export type SecondaryEffect = 'none' | 'rotate' | 'pulse' | 'wave';

export interface FractalSettings {
  symmetry: number;
  strokeWeight: number;
  colorMode: ColorMode;
  solidColor: string;
  animationMode: AnimationMode;
  animationSpeed: number;
  filter: FilterType;
  combineEffects: boolean;
  secondaryEffect: SecondaryEffect;
  trailsEnabled: boolean;
  flowerType: FlowerType;
  flowerCount: number;
}

export interface Particle {
  x: number;
  y: number;
  angle: number;
  radius: number;
  speed: number;
  size: number;
  lifespan: number;
  color: number[];
  update: (animationSpeed: number) => void;
  display: (p: p5, symmetry: number, currentColorMode: ColorMode) => void;
  isDead: () => boolean;
}

export interface Flower {
  x: number;
  y: number;
  size: number;
  bloom: number;
  bloomDirection: number;
  rotation: number;
  rotationSpeed: number;
  phaseOffset: number;
  swayAmount: number;
  swaySpeed: number;
  depth: number;
  update: (animationSpeed: number) => void;
  display: (p: p5, type: FlowerType, swayOffset: number, currentColorMode: ColorMode, getStrokeColor: () => number[]) => void;
}

export interface FlowerParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  lifespan: number;
  twinkle: number;
  color: number[];
  update: (animationSpeed: number) => void;
  display: (p: p5, currentColorMode: ColorMode) => void;
  isDead: () => boolean;
}
