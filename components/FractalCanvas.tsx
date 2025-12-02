'use client';

import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type p5 from 'p5';
import type { FractalSettings } from '@/types';
import { ParticleClass, FlowerParticleClass, FlowerClass } from '@/lib/particles';

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false,
});

interface FractalCanvasProps {
  settings: FractalSettings;
  onRandomize: () => void;
  isAnimating: boolean;
  onSave: () => void;
  onClear: () => void;
}

export default function FractalCanvas({
  settings,
  onRandomize,
  isAnimating,
}: FractalCanvasProps) {
  const xoffRef = useRef(0);
  const particlesRef = useRef<any[]>([]);
  const flowerParticlesRef = useRef<any[]>([]);
  const flowersRef = useRef<any[]>([]);
  const animationStateRef = useRef({
    rotationAngle: 0,
    pulseScale: 1.0,
    pulseDirection: 1,
    waveOffset: 0,
    spiralRadius: 0,
    zoomLevel: 1.0,
    zoomDirection: 1,
    kaleidoscopeAngle: 0,
    animationAngle: 0,
    morphTimer: 0,
    swayOffset: 0,
  });
  const showInstructionsRef = useRef(true);
  const p5InstanceRef = useRef<p5 | null>(null);

  const getStrokeColor = (p: p5): number[] => {
    const { colorMode, solidColor } = settings;

    switch (colorMode) {
      case 'rainbow':
        const hu = p.map(p.sin(xoffRef.current), -1, 1, 0, 255);
        return [hu, 255, 255, 255];

      case 'gradient':
        const gradientColors = [
          [255, 107, 107],
          [78, 205, 196],
          [69, 183, 209],
          [150, 206, 180],
          [255, 193, 7],
          [156, 39, 176],
        ];
        const t = p.map(p.sin(xoffRef.current * 0.1), -1, 1, 0, 1);
        const currentGradientIndex = Math.floor(p.frameCount / 120) % gradientColors.length;
        const color1 = gradientColors[currentGradientIndex];
        const color2 = gradientColors[(currentGradientIndex + 1) % gradientColors.length];
        const r = p.lerp(color1[0], color2[0], t);
        const g = p.lerp(color1[1], color2[1], t);
        const b = p.lerp(color1[2], color2[2], t);
        return [r, g, b, 255];

      case 'solid':
        const hex = solidColor;
        const r2 = parseInt(hex.slice(1, 3), 16);
        const g2 = parseInt(hex.slice(3, 5), 16);
        const b2 = parseInt(hex.slice(5, 7), 16);
        return [r2, g2, b2, 255];

      default:
        return [255, 255, 255, 255];
    }
  };

  const randomizeFractal = (p: p5) => {
    p.background(0);
    showInstructionsRef.current = false;

    const numStrokes = 60;
    const angle = 360 / settings.symmetry;

    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.strokeWeight(settings.strokeWeight);

    for (let i = 0; i < numStrokes; i++) {
      const strokeColor = getStrokeColor(p);
      if (settings.colorMode === 'rainbow') {
        p.colorMode(p.HSB, 255, 255);
        const hue = p.map(i, 0, numStrokes, 0, 255);
        p.stroke(hue, 255, 255);
      } else {
        p.colorMode(p.RGB);
        p.stroke(strokeColor[0], strokeColor[1], strokeColor[2]);
      }

      const x1 = p.random(-p.width / 3, p.width / 3);
      const y1 = p.random(-p.height / 3, p.height / 3);
      const x2 = p.random(-p.width / 3, p.width / 3);
      const y2 = p.random(-p.height / 3, p.height / 3);

      for (let j = 0; j < settings.symmetry; j++) {
        p.push();
        p.rotate(j * angle);
        p.line(x1, y1, x2, y2);
        p.push();
        p.scale(-1, 1);
        p.line(x1, y1, x2, y2);
        p.pop();
        p.pop();
      }
    }

    p.pop();
  };

  const setup = (p: p5, canvasParentRef: Element) => {
    let canvasWidth, canvasHeight;

    if (window.innerWidth <= 768) {
      canvasWidth = window.innerWidth - 30;
      canvasHeight = window.innerHeight * 0.6;
    } else {
      const availableWidth = window.innerWidth - 350;
      const availableHeight = window.innerHeight - 120;
      const size = Math.min(availableWidth, availableHeight - 40);
      canvasWidth = canvasHeight = Math.max(400, Math.min(size, 600));
    }

    p.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef);
    p.angleMode(p.DEGREES);
    p.background(0);
    p5InstanceRef.current = p;
  };

  const draw = (p: p5) => {
    if (p.mouseIsPressed && showInstructionsRef.current) {
      showInstructionsRef.current = false;
      if (!isAnimating) {
        p.background(0);
      }
    }

    if (isAnimating) {
      if (settings.trailsEnabled) {
        p.push();
        p.fill(0, 0, 0, 20);
        p.noStroke();
        p.rect(0, 0, p.width, p.height);
        p.pop();
      } else if (settings.animationMode === 'particles' || settings.animationMode === 'spiral') {
        p.background(0);
      }

      drawAnimation(p);
    }

    p.push();
    p.translate(p.width / 2, p.height / 2);

    if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
      const mx = p.mouseX - p.width / 2;
      const my = p.mouseY - p.height / 2;
      const pmx = p.pmouseX - p.width / 2;
      const pmy = p.pmouseY - p.height / 2;

      if (p.mouseIsPressed) {
        xoffRef.current += 1;
        const strokeColor = getStrokeColor(p);

        if (settings.colorMode === 'rainbow') {
          p.colorMode(p.HSB, 255, 255);
          p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], strokeColor[3]);
        } else {
          p.colorMode(p.RGB);
          p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], strokeColor[3]);
        }

        const angle = 360 / settings.symmetry;
        for (let i = 0; i < settings.symmetry; i++) {
          p.rotate(angle);
          p.strokeWeight(settings.strokeWeight);
          p.line(mx, my, pmx, pmy);
          p.push();
          p.scale(-1, 1);
          p.line(mx, my, pmx, pmy);
          p.pop();
        }
      }
    }
    p.pop();

    if (showInstructionsRef.current) {
      p.push();
      p.colorMode(p.RGB, 255, 255, 255, 255);
      p.fill(255, 255, 255, 200);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(32);
      p.text('Click and drag', p.width / 2, p.height / 2);
      p.pop();
    }
  };

  const applySecondaryEffect = (p: p5) => {
    const { secondaryEffect, animationSpeed } = settings;
    const state = animationStateRef.current;

    switch (secondaryEffect) {
      case 'rotate':
        p.rotate(state.rotationAngle);
        state.rotationAngle += 0.5 * animationSpeed;
        break;
      case 'pulse':
        p.scale(state.pulseScale);
        state.pulseScale += state.pulseDirection * 0.005 * animationSpeed;
        if (state.pulseScale > 1.2 || state.pulseScale < 0.8) {
          state.pulseDirection *= -1;
        }
        break;
      case 'wave':
        const waveAmount = p.sin(state.waveOffset) * 10;
        p.translate(waveAmount, p.cos(state.waveOffset) * 10);
        state.waveOffset += 0.05 * animationSpeed;
        break;
    }
  };

  const drawRotateAnimation = (p: p5) => {
    const state = animationStateRef.current;
    p.push();
    p.noFill();
    const strokeColor = getStrokeColor(p);
    if (settings.colorMode === 'rainbow') {
      p.colorMode(p.HSB, 255, 255);
      p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], 50);
    } else {
      p.colorMode(p.RGB);
      p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], 50);
    }
    p.strokeWeight(1);

    for (let i = 0; i < 3; i++) {
      const radius = 50 + i * 40;
      const angle = 360 / settings.symmetry;
      for (let j = 0; j < settings.symmetry; j++) {
        p.push();
        p.rotate(j * angle + p.frameCount * (i + 1) * 0.5 * settings.animationSpeed);
        p.ellipse(radius, 0, 20, 20);
        p.pop();
      }
    }
    p.pop();
  };

  const drawPulseAnimation = (p: p5) => {
    const state = animationStateRef.current;
    p.push();
    p.noFill();
    xoffRef.current += 1;
    const strokeColor = getStrokeColor(p);
    if (settings.colorMode === 'rainbow') {
      p.colorMode(p.HSB, 255, 255);
      p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], 80);
    } else {
      p.colorMode(p.RGB);
      p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], 80);
    }

    p.strokeWeight(2);

    for (let i = 0; i < 3; i++) {
      const radius = (i + 1) * 60 * state.pulseScale;
      const angle = 360 / settings.symmetry;

      for (let j = 0; j < settings.symmetry; j++) {
        p.push();
        p.rotate(j * angle + state.animationAngle * (i + 1));
        p.arc(0, 0, radius, radius, 0, 30);
        p.push();
        p.scale(-1, 1);
        p.arc(0, 0, radius, radius, 0, 30);
        p.pop();
        p.pop();
      }
    }

    p.pop();

    state.pulseScale += state.pulseDirection * 0.008 * settings.animationSpeed;
    if (state.pulseScale > 1.3 || state.pulseScale < 0.7) {
      state.pulseDirection *= -1;
    }
    state.animationAngle += 0.8 * settings.animationSpeed;
  };

  const drawParticleAnimation = (p: p5) => {
    if (p.frameCount % Math.max(1, Math.floor(5 / settings.animationSpeed)) === 0) {
      for (let i = 0; i < settings.symmetry; i++) {
        const angle = (360 / settings.symmetry) * i + p.random(-10, 10);
        particlesRef.current.push(
          new ParticleClass(p, 0, 0, angle, settings.animationSpeed, () => getStrokeColor(p))
        );
      }
    }

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i];
      particle.update(settings.animationSpeed);
      particle.display(p, settings.symmetry, settings.colorMode);

      if (particle.isDead() || particle.radius > Math.max(p.width, p.height)) {
        particlesRef.current.splice(i, 1);
      }
    }

    xoffRef.current += 1;
  };

  const drawKaleidoscopeAnimation = (p: p5) => {
    const state = animationStateRef.current;
    state.kaleidoscopeAngle += 2 * settings.animationSpeed;

    const radius = Math.min(p.width, p.height) * 0.35;
    const numLayers = 3;

    for (let layer = 0; layer < numLayers; layer++) {
      p.push();
      p.rotate(state.kaleidoscopeAngle * (layer + 1) * 0.3);

      const layerRadius = radius * (0.5 + layer * 0.3);
      const numPoints = 6 + layer * 2;

      xoffRef.current += 0.5;
      const strokeColor = getStrokeColor(p);
      if (settings.colorMode === 'rainbow') {
        p.colorMode(p.HSB, 255, 255);
        p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], 150 - layer * 30);
      } else {
        p.colorMode(p.RGB);
        p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], 150 - layer * 30);
      }

      p.strokeWeight(settings.strokeWeight * (1 - layer * 0.2));
      p.noFill();

      const symAngle = 360 / settings.symmetry;
      for (let j = 0; j < settings.symmetry; j++) {
        p.push();
        p.rotate(j * symAngle);
        p.beginShape();
        for (let i = 0; i <= numPoints; i++) {
          const angle = (p.TWO_PI / numPoints) * i;
          const x = p.cos(angle) * layerRadius * (1 + p.sin(state.kaleidoscopeAngle * 0.02 + i) * 0.2);
          const y = p.sin(angle) * layerRadius * (1 + p.cos(state.kaleidoscopeAngle * 0.02 + i) * 0.2);
          p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
        p.pop();
      }

      p.pop();
    }
  };

  const drawWaveAnimation = (p: p5) => {
    const state = animationStateRef.current;
    state.waveOffset += 0.05 * settings.animationSpeed;

    const waveHeight = 30;
    const waveLength = 80;
    const numWaves = 3;

    xoffRef.current += 1;
    const strokeColor = getStrokeColor(p);
    if (settings.colorMode === 'rainbow') {
      p.colorMode(p.HSB, 255, 255);
      p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], 100);
    } else {
      p.colorMode(p.RGB);
      p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], 100);
    }

    p.strokeWeight(1);
    p.noFill();

    for (let w = 0; w < numWaves; w++) {
      p.push();
      p.rotate(state.animationAngle + w * 20);

      const angle = 360 / settings.symmetry;
      for (let i = 0; i < settings.symmetry; i++) {
        p.push();
        p.rotate(i * angle);

        p.beginShape();
        for (let x = -waveLength; x <= waveLength; x += 8) {
          const y = p.sin((x + state.waveOffset * 15) * 0.04) * waveHeight * (0.8 + w * 0.1);
          p.vertex(x + w * 15, y);
        }
        p.endShape();

        p.push();
        p.scale(-1, 1);
        p.beginShape();
        for (let x = -waveLength; x <= waveLength; x += 8) {
          const y = p.sin((x + state.waveOffset * 15) * 0.04) * waveHeight * (0.8 + w * 0.1);
          p.vertex(x + w * 15, y);
        }
        p.endShape();
        p.pop();

        p.pop();
      }

      p.pop();
    }

    state.animationAngle += 0.4 * settings.animationSpeed;
  };

  const drawSpiralAnimation = (p: p5) => {
    const state = animationStateRef.current;
    state.spiralRadius += 2 * settings.animationSpeed;
    if (state.spiralRadius > Math.max(p.width, p.height) * 0.7) {
      state.spiralRadius = 0;
    }

    xoffRef.current += 1;
    const strokeColor = getStrokeColor(p);
    if (settings.colorMode === 'rainbow') {
      p.colorMode(p.HSB, 255, 255);
      p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], 200);
    } else {
      p.colorMode(p.RGB);
      p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], 200);
    }

    p.strokeWeight(settings.strokeWeight);

    const numPoints = 50;
    const angle = 360 / settings.symmetry;

    for (let i = 0; i < settings.symmetry; i++) {
      p.push();
      p.rotate(i * angle);

      p.beginShape();
      p.noFill();
      for (let j = 0; j < numPoints; j++) {
        const t = j / numPoints;
        const r = state.spiralRadius * t;
        const a = t * p.TWO_PI * 3 + state.animationAngle;
        const x = p.cos(a) * r;
        const y = p.sin(a) * r;
        p.vertex(x, y);
      }
      p.endShape();

      p.push();
      p.scale(-1, 1);
      p.beginShape();
      p.noFill();
      for (let j = 0; j < numPoints; j++) {
        const t = j / numPoints;
        const r = state.spiralRadius * t;
        const a = t * p.TWO_PI * 3 + state.animationAngle;
        const x = p.cos(a) * r;
        const y = p.sin(a) * r;
        p.vertex(x, y);
      }
      p.endShape();
      p.pop();

      p.pop();
    }

    state.animationAngle += 0.02 * settings.animationSpeed;
  };

  const drawBranch = (p: p5, len: number, level: number) => {
    if (level > 0) {
      p.line(0, 0, len, 0);
      p.push();
      p.translate(len, 0);
      p.rotate(30);
      drawBranch(p, len * 0.67, level - 1);
      p.rotate(-60);
      drawBranch(p, len * 0.67, level - 1);
      p.pop();
    }
  };

  const drawZoomAnimation = (p: p5) => {
    const state = animationStateRef.current;
    p.push();
    p.scale(state.zoomLevel);

    const detail = Math.floor(p.map(state.zoomLevel, 0.5, 2, 3, 8));
    const radius = Math.min(p.width, p.height) * 0.25;

    xoffRef.current += 1;
    const strokeColor = getStrokeColor(p);
    if (settings.colorMode === 'rainbow') {
      p.colorMode(p.HSB, 255, 255);
      p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], 150);
    } else {
      p.colorMode(p.RGB);
      p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], 150);
    }

    p.strokeWeight(settings.strokeWeight / state.zoomLevel);

    const angle = 360 / settings.symmetry;
    for (let i = 0; i < settings.symmetry; i++) {
      p.push();
      p.rotate(i * angle + state.animationAngle);
      drawBranch(p, radius * state.zoomLevel, detail);
      p.push();
      p.scale(-1, 1);
      drawBranch(p, radius * state.zoomLevel, detail);
      p.pop();
      p.pop();
    }

    p.pop();

    state.zoomLevel += state.zoomDirection * 0.005 * settings.animationSpeed;
    if (state.zoomLevel > 2 || state.zoomLevel < 0.5) {
      state.zoomDirection *= -1;
    }
    state.animationAngle += 0.5 * settings.animationSpeed;
  };

  const drawMorphAnimation = (p: p5) => {
    const state = animationStateRef.current;
    state.morphTimer += 0.01 * settings.animationSpeed;
    // Note: Morph animation changes settings dynamically
    // This is implemented but may need special handling
  };

  const initFlowers = (p: p5) => {
    flowersRef.current = [];
    const positions: { x: number; y: number }[] = [];

    if (settings.flowerCount === 1) {
      positions.push({ x: 0, y: p.height * 0.1 });
    } else if (settings.flowerCount === 2) {
      positions.push({ x: -p.width * 0.15, y: p.height * 0.15 });
      positions.push({ x: p.width * 0.15, y: p.height * 0.15 });
    } else if (settings.flowerCount === 3) {
      positions.push({ x: -p.width * 0.2, y: p.height * 0.15 });
      positions.push({ x: 0, y: 0 });
      positions.push({ x: p.width * 0.2, y: p.height * 0.2 });
    } else if (settings.flowerCount === 5) {
      positions.push({ x: -p.width * 0.25, y: p.height * 0.1 });
      positions.push({ x: -p.width * 0.12, y: p.height * 0.2 });
      positions.push({ x: 0, y: 0 });
      positions.push({ x: p.width * 0.12, y: p.height * 0.2 });
      positions.push({ x: p.width * 0.25, y: p.height * 0.1 });
    }

    for (let i = 0; i < positions.length; i++) {
      const size = p.random(0.8, 1.2);
      flowersRef.current.push(new FlowerClass(p, positions[i].x, positions[i].y, size, i * p.PI / 3));
    }
  };

  const drawFlowerAnimation = (p: p5) => {
    const state = animationStateRef.current;

    if (!settings.trailsEnabled) {
      p.push();
      p.fill(0, 0, 0, 25);
      p.noStroke();
      p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
      p.pop();
    } else {
      p.push();
      p.fill(0, 0, 0, 10);
      p.noStroke();
      p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
      p.pop();
    }

    if (flowersRef.current.length === 0) {
      initFlowers(p);
    }

    state.swayOffset += 0.02 * settings.animationSpeed;

    // Sort flowers by depth for proper layering
    flowersRef.current.sort((a, b) => a.depth - b.depth);

    // Update and display all flowers
    for (const flower of flowersRef.current) {
      flower.update(settings.animationSpeed);
      flower.display(p, settings.flowerType, state.swayOffset, settings.colorMode, () => getStrokeColor(p));
    }

    // Generate flower particles
    if (p.frameCount % Math.max(1, Math.floor(10 / settings.animationSpeed)) === 0) {
      for (const flower of flowersRef.current) {
        if (p.random() < 0.5) {
          flowerParticlesRef.current.push(
            new FlowerParticleClass(p, flower.x, flower.y - 80 * flower.size, () => getStrokeColor(p))
          );
        }
      }
    }

    // Update and display flower particles
    for (let i = flowerParticlesRef.current.length - 1; i >= 0; i--) {
      const particle = flowerParticlesRef.current[i];
      particle.update(settings.animationSpeed);
      particle.display(p, settings.colorMode);

      if (particle.isDead()) {
        flowerParticlesRef.current.splice(i, 1);
      }
    }
  };

  const drawAnimation = (p: p5) => {
    p.push();
    p.translate(p.width / 2, p.height / 2);

    if (settings.combineEffects && settings.secondaryEffect !== 'none') {
      applySecondaryEffect(p);
    }

    switch (settings.animationMode) {
      case 'rotate':
        drawRotateAnimation(p);
        break;
      case 'pulse':
        drawPulseAnimation(p);
        break;
      case 'particles':
        drawParticleAnimation(p);
        break;
      case 'kaleidoscope':
        drawKaleidoscopeAnimation(p);
        break;
      case 'wave':
        drawWaveAnimation(p);
        break;
      case 'spiral':
        drawSpiralAnimation(p);
        break;
      case 'zoom':
        drawZoomAnimation(p);
        break;
      case 'morph':
        drawMorphAnimation(p);
        break;
      case 'flower':
        drawFlowerAnimation(p);
        break;
    }

    p.pop();
  };

  useEffect(() => {
    const handleRandomize = () => {
      if (p5InstanceRef.current) {
        randomizeFractal(p5InstanceRef.current);
      }
    };

    const handleClear = () => {
      if (p5InstanceRef.current) {
        const p = p5InstanceRef.current;
        p.background(0);
        showInstructionsRef.current = true;
        particlesRef.current = [];
        flowerParticlesRef.current = [];
        flowersRef.current = [];
        animationStateRef.current = {
          rotationAngle: 0,
          pulseScale: 1.0,
          pulseDirection: 1,
          waveOffset: 0,
          spiralRadius: 0,
          zoomLevel: 1.0,
          zoomDirection: 1,
          kaleidoscopeAngle: 0,
          animationAngle: 0,
          morphTimer: 0,
          swayOffset: 0,
        };
      }
    };

    const handleSave = () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.save('fractal.png');
      }
    };

    window.addEventListener('randomize-fractal', handleRandomize);
    window.addEventListener('clear-fractal', handleClear);
    window.addEventListener('save-fractal', handleSave);

    return () => {
      window.removeEventListener('randomize-fractal', handleRandomize);
      window.removeEventListener('clear-fractal', handleClear);
      window.removeEventListener('save-fractal', handleSave);
    };
  }, [settings]);

  return (
    <div className="flex-1 relative overflow-hidden rounded-xl flex justify-center items-center w-full h-full md:min-w-[400px]">
      <div className="[&>canvas]:block [&>canvas]:border-2 [&>canvas]:border-white/20 [&>canvas]:rounded-xl [&>canvas]:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.1)] [&>canvas]:backdrop-blur-[10px] [&>canvas]:max-w-full [&>canvas]:max-h-full">
        <Sketch setup={setup} draw={draw} />
      </div>
    </div>
  );
}
