import type p5 from 'p5';
import type { ColorMode, Particle, FlowerParticle, Flower, FlowerType } from '@/types';

export class ParticleClass implements Particle {
  x: number;
  y: number;
  angle: number;
  radius: number;
  speed: number;
  size: number;
  lifespan: number;
  color: number[];
  private p: p5;
  private getStrokeColor: () => number[];

  constructor(p: p5, x: number, y: number, angle: number, animationSpeed: number, getStrokeColor: () => number[]) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.radius = p.random(50, 200);
    this.speed = p.random(0.5, 2) * animationSpeed;
    this.size = p.random(2, 8);
    this.lifespan = 255;
    this.getStrokeColor = getStrokeColor;
    this.color = getStrokeColor();
  }

  update(animationSpeed: number) {
    this.radius += this.speed * animationSpeed;
    this.x = this.p.cos(this.angle) * this.radius;
    this.y = this.p.sin(this.angle) * this.radius;
    this.lifespan -= 2 * animationSpeed;
  }

  display(p: p5, symmetry: number, currentColorMode: ColorMode) {
    p.push();
    if (currentColorMode === 'rainbow') {
      p.colorMode(p.HSB, 255, 255, 255, 255);
      p.stroke(this.color[0], this.color[1], this.color[2], this.lifespan);
    } else {
      p.colorMode(p.RGB);
      p.stroke(this.color[0], this.color[1], this.color[2], this.lifespan);
    }
    p.strokeWeight(this.size);

    const angle = 360 / symmetry;
    for (let i = 0; i < symmetry; i++) {
      p.push();
      p.rotate(i * angle);
      p.point(this.x, this.y);
      p.push();
      p.scale(-1, 1);
      p.point(this.x, this.y);
      p.pop();
      p.pop();
    }
    p.pop();
  }

  isDead(): boolean {
    return this.lifespan < 0;
  }
}

export class FlowerParticleClass implements FlowerParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  lifespan: number;
  twinkle: number;
  color: number[];
  private p: p5;

  constructor(p: p5, x: number, y: number, getStrokeColor: () => number[]) {
    this.p = p;
    this.x = x + p.random(-20, 20);
    this.y = y;
    this.vx = p.random(-0.5, 0.5);
    this.vy = p.random(-1, -0.3);
    this.size = p.random(2, 6);
    this.lifespan = 255;
    this.twinkle = p.random(p.TWO_PI);
    this.color = getStrokeColor();
  }

  update(animationSpeed: number) {
    this.x += this.vx * animationSpeed;
    this.y += this.vy * animationSpeed;
    this.lifespan -= 1.5 * animationSpeed;
    this.twinkle += 0.1;
  }

  display(p: p5, currentColorMode: ColorMode) {
    p.push();
    const alpha = this.lifespan * (0.5 + p.sin(this.twinkle) * 0.5);

    if (currentColorMode === 'rainbow') {
      p.colorMode(p.HSB, 255, 255, 255, 255);
      p.fill(this.color[0], 200, 255, alpha);
      p.stroke(this.color[0], 255, 255, alpha * 0.5);
    } else {
      p.colorMode(p.RGB);
      p.fill(this.color[0], this.color[1], this.color[2], alpha);
      p.stroke(this.color[0] + 50, this.color[1] + 50, this.color[2] + 50, alpha * 0.5);
    }

    p.strokeWeight(0.5);
    p.ellipse(this.x, this.y, this.size, this.size);

    p.noStroke();
    p.fill(this.color[0], this.color[1], this.color[2], alpha * 0.2);
    p.ellipse(this.x, this.y, this.size * 3, this.size * 3);

    p.pop();
  }

  isDead(): boolean {
    return this.lifespan < 0;
  }
}

export class FlowerClass implements Flower {
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
  private p: p5;

  constructor(p: p5, x: number, y: number, size: number, phaseOffset: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.size = size;
    this.bloom = 0.3;
    this.bloomDirection = 1;
    this.rotation = p.random(360);
    this.rotationSpeed = p.random(0.2, 0.4);
    this.phaseOffset = phaseOffset;
    this.swayAmount = p.random(5, 15);
    this.swaySpeed = p.random(0.8, 1.2);
    this.depth = p.random(0.7, 1.0);
  }

  update(animationSpeed: number) {
    this.bloom += this.bloomDirection * 0.003 * animationSpeed;
    if (this.bloom > 1.0 || this.bloom < 0.3) {
      this.bloomDirection *= -1;
    }
    this.rotation += this.rotationSpeed * animationSpeed;
  }

  display(p: p5, type: FlowerType, swayOffset: number, currentColorMode: ColorMode, getStrokeColor: () => number[]) {
    p.push();
    p.translate(this.x, this.y);

    const sway = p.sin(swayOffset * this.swaySpeed + this.phaseOffset) * this.swayAmount;
    p.translate(sway, 0);

    const alpha = p.map(this.depth, 0.7, 1.0, 200, 255);

    p.scale(this.size);

    // Draw stem
    this.drawStem(p, alpha);

    // Draw flower based on type
    switch (type) {
      case 'rose':
        this.drawRose(p, alpha, currentColorMode, getStrokeColor);
        break;
      case 'lily':
        this.drawLily(p, alpha, currentColorMode, getStrokeColor);
        break;
      case 'lotus':
        this.drawLotus(p, alpha, currentColorMode, getStrokeColor);
        break;
      case 'cherry':
        this.drawCherry(p, alpha, currentColorMode, getStrokeColor);
        break;
      case 'dahlia':
        this.drawDahlia(p, alpha, currentColorMode, getStrokeColor);
        break;
    }

    p.pop();
  }

  private drawStem(p: p5, alpha: number) {
    p.push();
    const stemColor = [100, 180, 100];
    p.colorMode(p.RGB);
    p.stroke(stemColor[0], stemColor[1], stemColor[2], alpha * 0.8);
    p.strokeWeight(3);
    p.noFill();

    p.beginShape();
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const x = p.sin(t * p.PI) * 8;
      const y = t * 80;
      p.vertex(x, y);
    }
    p.endShape();

    p.fill(stemColor[0], stemColor[1], stemColor[2], alpha * 0.6);
    p.stroke(stemColor[0], stemColor[1], stemColor[2], alpha * 0.8);
    p.strokeWeight(1);

    p.push();
    p.translate(-5, 40);
    p.rotate(-30);
    p.ellipse(0, 0, 20, 35);
    p.pop();

    p.push();
    p.translate(5, 55);
    p.rotate(30);
    p.ellipse(0, 0, 18, 30);
    p.pop();

    p.pop();
  }

  private drawRose(p: p5, alpha: number, currentColorMode: ColorMode, getStrokeColor: () => number[]) {
    p.push();
    p.rotate(this.rotation);

    const strokeColor = getStrokeColor();

    // Draw center
    p.push();
    if (currentColorMode === 'rainbow') {
      p.colorMode(p.HSB, 255, 255, 255, 255);
      p.fill(strokeColor[0], 150, 200, alpha * 0.9);
      p.stroke(strokeColor[0], 200, 255, alpha);
    } else {
      p.colorMode(p.RGB);
      p.fill(strokeColor[0], strokeColor[1], strokeColor[2], alpha * 0.9);
      p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], alpha);
    }
    p.strokeWeight(1);

    for (let i = 0; i < 3; i++) {
      p.push();
      p.rotate(i * 120 + this.rotation * 0.5);
      p.arc(0, 0, 15 * this.bloom, 20 * this.bloom, 0, 180);
      p.pop();
    }
    p.pop();

    // Outer petals (4 layers)
    for (let layer = 0; layer < 4; layer++) {
      this.drawRosePetalLayer(p, layer, alpha, strokeColor, currentColorMode);
    }
    p.pop();
  }

  private drawRosePetalLayer(p: p5, layer: number, alpha: number, strokeColor: number[], currentColorMode: ColorMode) {
    p.push();
    p.rotate(this.rotation * 0.2 + layer * 15);

    const layerSize = 1 - layer * 0.1;
    const layerRadius = (30 + layer * 20) * this.bloom * layerSize;
    const petalLength = (40 + layer * 15) * this.bloom * layerSize;
    const petalWidth = (25 + layer * 10) * this.bloom * layerSize;
    const numPetals = 5;

    for (let i = 0; i < numPetals; i++) {
      p.push();
      p.rotate(i * (360 / numPetals));

      if (currentColorMode === 'rainbow') {
        p.colorMode(p.HSB, 255, 255, 255, 255);
        const h = strokeColor[0];
        p.fill(h, 120 - layer * 20, 255, alpha * 0.8 - layer * 15);
        p.stroke(h, 200, 255, alpha * 0.9 - layer * 20);
      } else {
        p.colorMode(p.RGB);
        const r = Math.min(255, strokeColor[0] + 40 - layer * 10);
        const g = Math.min(255, strokeColor[1] + 40 - layer * 10);
        const b = Math.min(255, strokeColor[2] + 40 - layer * 10);
        p.fill(r, g, b, alpha * 0.8 - layer * 15);
        p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], alpha * 0.9 - layer * 20);
      }
      p.strokeWeight(1.5);

      p.beginShape();
      p.vertex(0, -layerRadius);
      p.bezierVertex(
        petalWidth * 0.6, -layerRadius - petalLength * 0.2,
        petalWidth * 0.8, -layerRadius - petalLength * 0.6,
        petalWidth * 0.4, -layerRadius - petalLength
      );
      p.bezierVertex(
        petalWidth * 0.2, -layerRadius - petalLength * 1.1,
        -petalWidth * 0.2, -layerRadius - petalLength * 1.1,
        -petalWidth * 0.4, -layerRadius - petalLength
      );
      p.bezierVertex(
        -petalWidth * 0.8, -layerRadius - petalLength * 0.6,
        -petalWidth * 0.6, -layerRadius - petalLength * 0.2,
        0, -layerRadius
      );
      p.endShape(p.CLOSE);

      p.pop();
    }
    p.pop();
  }

  private drawLily(p: p5, alpha: number, currentColorMode: ColorMode, getStrokeColor: () => number[]) {
    p.push();
    p.rotate(this.rotation);

    const strokeColor = getStrokeColor();

    // Lily center with stamens
    p.push();
    if (currentColorMode === 'rainbow') {
      p.colorMode(p.HSB, 255, 255, 255, 255);
      p.fill(strokeColor[0], 255, 200, alpha);
      p.stroke(strokeColor[0], 200, 255, alpha);
    } else {
      p.colorMode(p.RGB);
      p.fill(255, 220, 100, alpha);
      p.stroke(200, 180, 50, alpha);
    }
    p.strokeWeight(2);

    for (let i = 0; i < 6; i++) {
      p.push();
      p.rotate(i * 60);
      p.line(0, 0, 0, -30 * this.bloom);
      p.fill(180, 100, 50, alpha);
      p.noStroke();
      p.ellipse(0, -30 * this.bloom, 6, 6);
      p.pop();
    }

    p.fill(150, 200, 100, alpha);
    p.noStroke();
    p.circle(0, 0, 12);
    p.pop();

    // 6 elongated lily petals
    const numPetals = 6;
    for (let i = 0; i < numPetals; i++) {
      p.push();
      p.rotate(i * (360 / numPetals) + this.rotation * 0.3);

      if (currentColorMode === 'rainbow') {
        p.colorMode(p.HSB, 255, 255, 255, 255);
        p.fill(strokeColor[0], 100, 255, alpha * 0.9);
        p.stroke(strokeColor[0], 180, 255, alpha);
      } else {
        p.colorMode(p.RGB);
        p.fill(strokeColor[0] + 50, strokeColor[1] + 50, strokeColor[2] + 50, alpha * 0.9);
        p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], alpha);
      }
      p.strokeWeight(2);

      p.beginShape();
      p.vertex(0, -20);
      p.bezierVertex(15, -30, 20, -70 * this.bloom, 8, -100 * this.bloom);
      p.bezierVertex(5, -105 * this.bloom, -5, -105 * this.bloom, -8, -100 * this.bloom);
      p.bezierVertex(-20, -70 * this.bloom, -15, -30, 0, -20);
      p.endShape(p.CLOSE);

      p.pop();
    }
    p.pop();
  }

  private drawLotus(p: p5, alpha: number, currentColorMode: ColorMode, getStrokeColor: () => number[]) {
    p.push();
    p.rotate(this.rotation);

    const strokeColor = getStrokeColor();

    // Lotus center
    p.push();
    if (currentColorMode === 'rainbow') {
      p.colorMode(p.HSB, 255, 255, 255, 255);
      p.fill(strokeColor[0], 100, 180, alpha);
      p.stroke(strokeColor[0], 150, 200, alpha);
    } else {
      p.colorMode(p.RGB);
      p.fill(200, 180, 100, alpha);
      p.stroke(180, 160, 80, alpha);
    }
    p.strokeWeight(2);

    p.ellipse(0, 0, 35 * this.bloom, 30 * this.bloom);
    p.pop();

    // Multiple layers of lotus petals
    for (let layer = 2; layer >= 0; layer--) {
      p.push();
      p.rotate(layer * 20 + this.rotation * 0.15);

      const layerPetals = 8;
      const layerRadius = (20 + layer * 25) * this.bloom;
      const petalLength = (60 + layer * 10) * this.bloom;
      const petalWidth = 35 * this.bloom;

      for (let i = 0; i < layerPetals; i++) {
        p.push();
        p.rotate(i * (360 / layerPetals));

        if (currentColorMode === 'rainbow') {
          p.colorMode(p.HSB, 255, 255, 255, 255);
          const h = (strokeColor[0] + layer * 10) % 255;
          p.fill(h, 80 + layer * 20, 255, alpha * 0.85 - layer * 10);
          p.stroke(h, 150, 255, alpha * 0.9);
        } else {
          p.colorMode(p.RGB);
          p.fill(strokeColor[0] + layer * 20, strokeColor[1] + layer * 20, strokeColor[2] + layer * 20, alpha * 0.85 - layer * 10);
          p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], alpha * 0.9);
        }
        p.strokeWeight(2);

        p.beginShape();
        p.vertex(0, -layerRadius);
        p.bezierVertex(
          petalWidth * 0.5, -layerRadius - petalLength * 0.3,
          petalWidth * 0.6, -layerRadius - petalLength * 0.7,
          petalWidth * 0.2, -layerRadius - petalLength
        );
        p.bezierVertex(
          petalWidth * 0.1, -layerRadius - petalLength * 1.05,
          -petalWidth * 0.1, -layerRadius - petalLength * 1.05,
          -petalWidth * 0.2, -layerRadius - petalLength
        );
        p.bezierVertex(
          -petalWidth * 0.6, -layerRadius - petalLength * 0.7,
          -petalWidth * 0.5, -layerRadius - petalLength * 0.3,
          0, -layerRadius
        );
        p.endShape(p.CLOSE);

        p.pop();
      }
      p.pop();
    }
    p.pop();
  }

  private drawCherry(p: p5, alpha: number, currentColorMode: ColorMode, getStrokeColor: () => number[]) {
    p.push();
    p.rotate(this.rotation);

    const strokeColor = getStrokeColor();

    // Cherry blossom center
    p.push();
    if (currentColorMode === 'rainbow') {
      p.colorMode(p.HSB, 255, 255, 255, 255);
      p.fill(strokeColor[0], 100, 255, alpha);
    } else {
      p.colorMode(p.RGB);
      p.fill(255, 230, 100, alpha);
    }
    p.noStroke();
    p.circle(0, 0, 12 * this.bloom);

    if (currentColorMode === 'rainbow') {
      p.stroke(strokeColor[0], 150, 200, alpha);
    } else {
      p.stroke(200, 180, 100, alpha);
    }
    p.strokeWeight(1.5);
    for (let i = 0; i < 8; i++) {
      p.push();
      p.rotate(i * 45);
      p.line(0, 0, 0, -8 * this.bloom);
      p.pop();
    }
    p.pop();

    // 5 simple cherry blossom petals
    const numPetals = 5;
    for (let i = 0; i < numPetals; i++) {
      p.push();
      p.rotate(i * (360 / numPetals) + this.rotation * 0.4);

      if (currentColorMode === 'rainbow') {
        p.colorMode(p.HSB, 255, 255, 255, 255);
        p.fill(strokeColor[0], 50, 255, alpha * 0.85);
        p.stroke(strokeColor[0], 100, 255, alpha);
      } else {
        p.colorMode(p.RGB);
        p.fill(strokeColor[0] + 80, strokeColor[1] + 80, strokeColor[2] + 80, alpha * 0.85);
        p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], alpha);
      }
      p.strokeWeight(1.5);

      p.beginShape();
      p.vertex(0, -15);
      p.bezierVertex(20, -25, 25, -50 * this.bloom, 15, -60 * this.bloom);
      p.vertex(8, -58 * this.bloom);
      p.vertex(0, -65 * this.bloom);
      p.vertex(-8, -58 * this.bloom);
      p.vertex(-15, -60 * this.bloom);
      p.bezierVertex(-25, -50 * this.bloom, -20, -25, 0, -15);
      p.endShape(p.CLOSE);

      p.pop();
    }
    p.pop();
  }

  private drawDahlia(p: p5, alpha: number, currentColorMode: ColorMode, getStrokeColor: () => number[]) {
    p.push();
    p.rotate(this.rotation);

    const strokeColor = getStrokeColor();

    // Many layers of pointed petals
    for (let layer = 0; layer < 5; layer++) {
      p.push();
      p.rotate(layer * 10 + this.rotation * 0.2);

      const layerPetals = 8 + layer * 2;
      const layerRadius = (15 + layer * 15) * this.bloom;
      const petalLength = (50 - layer * 5) * this.bloom;
      const petalWidth = 12 * this.bloom;

      for (let i = 0; i < layerPetals; i++) {
        p.push();
        p.rotate(i * (360 / layerPetals));

        if (currentColorMode === 'rainbow') {
          p.colorMode(p.HSB, 255, 255, 255, 255);
          const h = (strokeColor[0] + layer * 15) % 255;
          p.fill(h, 200 - layer * 20, 255, alpha * 0.9 - layer * 10);
          p.stroke(h, 255, 255, alpha * 0.95);
        } else {
          p.colorMode(p.RGB);
          p.fill(strokeColor[0], strokeColor[1], strokeColor[2], alpha * 0.9 - layer * 10);
          p.stroke(strokeColor[0], strokeColor[1], strokeColor[2], alpha * 0.95);
        }
        p.strokeWeight(1);

        p.beginShape();
        p.vertex(0, -layerRadius);
        p.vertex(petalWidth * 0.4, -layerRadius - petalLength * 0.5);
        p.vertex(0, -layerRadius - petalLength);
        p.vertex(-petalWidth * 0.4, -layerRadius - petalLength * 0.5);
        p.endShape(p.CLOSE);

        p.pop();
      }
      p.pop();
    }

    // Dahlia center
    p.push();
    if (currentColorMode === 'rainbow') {
      p.colorMode(p.HSB, 255, 255, 255, 255);
      p.fill(strokeColor[0], 255, 200, alpha);
    } else {
      p.colorMode(p.RGB);
      p.fill(strokeColor[0] * 0.8, strokeColor[1] * 0.6, strokeColor[2] * 0.4, alpha);
    }
    p.noStroke();
    p.circle(0, 0, 20 * this.bloom);
    p.pop();

    p.pop();
  }
}
