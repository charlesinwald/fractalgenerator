let symmetry = 6;
let saveButton;
let clearButton;
let randomizeButton;
let animateButton;
let slider;
let symmetrySelect;
let colorModeSelect;
let colorPicker;
let colorPickerContainer;
let animationModeSelect;
let currentColorMode = "rainbow";
let xoff = 0;
let gradientColors = [
  [255, 107, 107], // Red
  [78, 205, 196], // Teal
  [69, 183, 209], // Blue
  [150, 206, 180], // Green
  [255, 193, 7], // Yellow
  [156, 39, 176], // Purple
];
let currentGradientIndex = 0;
let solidColor = [255, 255, 255];
let showInstructions = true;
let subtitleElement;

// Animation variables
let isAnimating = false;
let animationMode = "rotate";
let rotationAngle = 0;
let morphTimer = 0;
let drawingPaths = [];

// Enhanced animation variables
let animationSpeed = 1.0;
let speedSlider;
let pulseScale = 1.0;
let pulseDirection = 1;
let waveOffset = 0;
let spiralRadius = 0;
let zoomLevel = 1.0;
let zoomDirection = 1;
let particles = [];
let kaleidoscopeAngle = 0;
let animationAngle = 0;
let combineEffects = false;
let combineCheckbox;
let secondaryEffect = "none";
let secondaryEffectSelect;
let trailsEnabled = false;
let trailsCheckbox;
let frameBuffer = null;

// Flower animation variables
let flowerBloom = 0.3;
let flowerBloomDirection = 1;
let petalRotation = 0;
let flowerLayers = 3;
let flowers = [];
let flowerParticles = [];
let flowerType = "rose"; // rose, lily, lotus, cherry, dahlia
let flowerCount = 3;
let swayOffset = 0;

// Filter variables
let filterSelect;
let currentFilter = "none";
let filterBuffer = null;

// Particle class for particle system
class Particle {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.radius = random(50, 200);
    this.speed = random(0.5, 2) * animationSpeed;
    this.size = random(2, 8);
    this.lifespan = 255;
    this.color = getStrokeColor();
  }

  update() {
    this.radius += this.speed * animationSpeed;
    this.x = cos(this.angle) * this.radius;
    this.y = sin(this.angle) * this.radius;
    this.lifespan -= 2 * animationSpeed;
  }

  display() {
    push();
    if (currentColorMode === "rainbow") {
      colorMode(HSB, 255, 255);
      stroke(this.color[0], this.color[1], this.color[2], this.lifespan);
    } else {
      colorMode(RGB);
      stroke(this.color[0], this.color[1], this.color[2], this.lifespan);
    }
    strokeWeight(this.size);

    let angle = 360 / symmetry;
    for (let i = 0; i < symmetry; i++) {
      push();
      rotate(i * angle);
      point(this.x, this.y);
      push();
      scale(-1, 1);
      point(this.x, this.y);
      pop();
      pop();
    }
    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}

// Flower class for multiple flower instances
class Flower {
  constructor(x, y, size, phaseOffset) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.bloom = 0.3;
    this.bloomDirection = 1;
    this.rotation = random(360);
    this.rotationSpeed = random(0.2, 0.4);
    this.phaseOffset = phaseOffset;
    this.swayAmount = random(5, 15);
    this.swaySpeed = random(0.8, 1.2);
    this.depth = random(0.7, 1.0); // for depth of field
  }

  update() {
    this.bloom += this.bloomDirection * 0.003 * animationSpeed;
    if (this.bloom > 1.0 || this.bloom < 0.3) {
      this.bloomDirection *= -1;
    }
    this.rotation += this.rotationSpeed * animationSpeed;
  }

  display(type) {
    push();
    translate(this.x, this.y);

    // Apply sway effect
    let sway = sin(swayOffset * this.swaySpeed + this.phaseOffset) * this.swayAmount;
    translate(sway, 0);

    // Apply depth blur effect (smaller = further)
    let alpha = map(this.depth, 0.7, 1.0, 200, 255);

    scale(this.size);

    // Add subtle glow behind flower
    push();
    xoff += 0.1;
    let strokeColor = getStrokeColor();
    if (currentColorMode === "rainbow") {
      colorMode(HSB, 255, 255);
      fill(strokeColor[0], 100, 255, 30);
    } else {
      colorMode(RGB);
      fill(strokeColor[0], strokeColor[1], strokeColor[2], 30);
    }
    noStroke();
    ellipse(0, -40, 180, 180);
    pop();

    // Draw stem
    this.drawStem(alpha);

    // Draw flower based on type
    switch(type) {
      case "rose":
        this.drawRose(alpha);
        break;
      case "lily":
        this.drawLily(alpha);
        break;
      case "lotus":
        this.drawLotus(alpha);
        break;
      case "cherry":
        this.drawCherry(alpha);
        break;
      case "dahlia":
        this.drawDahlia(alpha);
        break;
      default:
        this.drawRose(alpha);
    }

    pop();
  }

  drawStem(alpha) {
    push();
    let stemColor = [100, 180, 100];
    colorMode(RGB);
    stroke(stemColor[0], stemColor[1], stemColor[2], alpha * 0.8);
    strokeWeight(3);
    noFill();

    // Curved stem
    beginShape();
    for (let i = 0; i <= 10; i++) {
      let t = i / 10;
      let x = sin(t * PI) * 8;
      let y = t * 80;
      vertex(x, y);
    }
    endShape();

    // Leaves
    fill(stemColor[0], stemColor[1], stemColor[2], alpha * 0.6);
    stroke(stemColor[0], stemColor[1], stemColor[2], alpha * 0.8);
    strokeWeight(1);

    push();
    translate(-5, 40);
    rotate(-30);
    ellipse(0, 0, 20, 35);
    pop();

    push();
    translate(5, 55);
    rotate(30);
    ellipse(0, 0, 18, 30);
    pop();

    pop();
  }

  drawRose(alpha) {
    push();
    rotate(this.rotation);

    xoff += 0.3;
    let strokeColor = getStrokeColor();

    // Draw center spiral (rose bud)
    push();
    if (currentColorMode === "rainbow") {
      colorMode(HSB, 255, 255);
      fill(strokeColor[0], 150, 200, alpha * 0.9);
      stroke(strokeColor[0], 200, 255, alpha);
    } else {
      colorMode(RGB);
      fill(strokeColor[0], strokeColor[1], strokeColor[2], alpha * 0.9);
      stroke(strokeColor[0], strokeColor[1], strokeColor[2], alpha);
    }
    strokeWeight(1);

    // Tight center petals
    for (let i = 0; i < 3; i++) {
      push();
      rotate(i * 120 + this.rotation * 0.5);
      arc(0, 0, 15 * this.bloom, 20 * this.bloom, 0, 180);
      pop();
    }
    pop();

    // Outer rose petals (4 layers)
    for (let layer = 0; layer < 4; layer++) {
      this.drawRosePetalLayer(layer, alpha, strokeColor);
    }
    pop();
  }

  drawRosePetalLayer(layer, alpha, strokeColor) {
    push();
    rotate(this.rotation * 0.2 + layer * 15);

    let layerSize = 1 - (layer * 0.1);
    let layerRadius = (30 + layer * 20) * this.bloom * layerSize;
    let petalLength = (40 + layer * 15) * this.bloom * layerSize;
    let petalWidth = (25 + layer * 10) * this.bloom * layerSize;
    let numPetals = 5;

    for (let i = 0; i < numPetals; i++) {
      push();
      rotate(i * (360 / numPetals));

      // Gradient effect on petals
      if (currentColorMode === "rainbow") {
        colorMode(HSB, 255, 255);
        let h = strokeColor[0];
        // Outer part of petal (lighter)
        fill(h, 120 - layer * 20, 255, alpha * 0.8 - layer * 15);
        stroke(h, 200, 255, alpha * 0.9 - layer * 20);
      } else {
        colorMode(RGB);
        let r = min(255, strokeColor[0] + 40 - layer * 10);
        let g = min(255, strokeColor[1] + 40 - layer * 10);
        let b = min(255, strokeColor[2] + 40 - layer * 10);
        fill(r, g, b, alpha * 0.8 - layer * 15);
        stroke(strokeColor[0], strokeColor[1], strokeColor[2], alpha * 0.9 - layer * 20);
      }
      strokeWeight(1.5);

      // Heart-shaped rose petal
      beginShape();
      vertex(0, -layerRadius);
      bezierVertex(
        petalWidth * 0.6, -layerRadius - petalLength * 0.2,
        petalWidth * 0.8, -layerRadius - petalLength * 0.6,
        petalWidth * 0.4, -layerRadius - petalLength
      );
      bezierVertex(
        petalWidth * 0.2, -layerRadius - petalLength * 1.1,
        -petalWidth * 0.2, -layerRadius - petalLength * 1.1,
        -petalWidth * 0.4, -layerRadius - petalLength
      );
      bezierVertex(
        -petalWidth * 0.8, -layerRadius - petalLength * 0.6,
        -petalWidth * 0.6, -layerRadius - petalLength * 0.2,
        0, -layerRadius
      );
      endShape(CLOSE);

      // Inner gradient for depth
      if (currentColorMode === "rainbow") {
        fill(strokeColor[0], 180, 200, alpha * 0.4);
      } else {
        fill(strokeColor[0] * 0.8, strokeColor[1] * 0.8, strokeColor[2] * 0.8, alpha * 0.4);
      }
      noStroke();
      beginShape();
      vertex(0, -layerRadius);
      bezierVertex(
        petalWidth * 0.3, -layerRadius - petalLength * 0.3,
        petalWidth * 0.2, -layerRadius - petalLength * 0.6,
        0, -layerRadius - petalLength * 0.5
      );
      bezierVertex(
        -petalWidth * 0.2, -layerRadius - petalLength * 0.6,
        -petalWidth * 0.3, -layerRadius - petalLength * 0.3,
        0, -layerRadius
      );
      endShape(CLOSE);

      pop();
    }
    pop();
  }

  drawLily(alpha) {
    push();
    rotate(this.rotation);

    xoff += 0.3;
    let strokeColor = getStrokeColor();

    // Lily center with stamens
    push();
    if (currentColorMode === "rainbow") {
      colorMode(HSB, 255, 255);
      fill(strokeColor[0], 255, 200, alpha);
      stroke(strokeColor[0], 200, 255, alpha);
    } else {
      colorMode(RGB);
      fill(255, 220, 100, alpha);
      stroke(200, 180, 50, alpha);
    }
    strokeWeight(2);

    // Long stamens
    for (let i = 0; i < 6; i++) {
      push();
      rotate(i * 60);
      line(0, 0, 0, -30 * this.bloom);
      fill(180, 100, 50, alpha);
      noStroke();
      ellipse(0, -30 * this.bloom, 6, 6);
      pop();
    }

    // Center
    fill(150, 200, 100, alpha);
    noStroke();
    circle(0, 0, 12);
    pop();

    // 6 elongated lily petals
    let numPetals = 6;
    for (let i = 0; i < numPetals; i++) {
      push();
      rotate(i * (360 / numPetals) + this.rotation * 0.3);

      if (currentColorMode === "rainbow") {
        colorMode(HSB, 255, 255);
        fill(strokeColor[0], 100, 255, alpha * 0.9);
        stroke(strokeColor[0], 180, 255, alpha);
      } else {
        colorMode(RGB);
        fill(strokeColor[0] + 50, strokeColor[1] + 50, strokeColor[2] + 50, alpha * 0.9);
        stroke(strokeColor[0], strokeColor[1], strokeColor[2], alpha);
      }
      strokeWeight(2);

      // Long, elegant lily petal
      beginShape();
      vertex(0, -20);
      bezierVertex(
        15, -30,
        20, -70 * this.bloom,
        8, -100 * this.bloom
      );
      bezierVertex(
        5, -105 * this.bloom,
        -5, -105 * this.bloom,
        -8, -100 * this.bloom
      );
      bezierVertex(
        -20, -70 * this.bloom,
        -15, -30,
        0, -20
      );
      endShape(CLOSE);

      // Spotted pattern
      if (currentColorMode === "rainbow") {
        fill(strokeColor[0], 200, 150, alpha * 0.6);
      } else {
        fill(strokeColor[0] * 0.7, strokeColor[1] * 0.5, strokeColor[2] * 0.5, alpha * 0.6);
      }
      noStroke();
      for (let j = 0; j < 5; j++) {
        ellipse(random(-5, 5), -30 - j * 10, 3, 4);
      }

      pop();
    }
    pop();
  }

  drawLotus(alpha) {
    push();
    rotate(this.rotation);

    xoff += 0.3;
    let strokeColor = getStrokeColor();

    // Lotus center (seed pod)
    push();
    if (currentColorMode === "rainbow") {
      colorMode(HSB, 255, 255);
      fill(strokeColor[0], 100, 180, alpha);
      stroke(strokeColor[0], 150, 200, alpha);
    } else {
      colorMode(RGB);
      fill(200, 180, 100, alpha);
      stroke(180, 160, 80, alpha);
    }
    strokeWeight(2);

    // Detailed seed pod
    ellipse(0, 0, 35 * this.bloom, 30 * this.bloom);

    // Seeds
    fill(150, 130, 70, alpha);
    noStroke();
    let seedPositions = [
      {x: 0, y: 0},
      {x: -8, y: -5},
      {x: 8, y: -5},
      {x: -8, y: 5},
      {x: 8, y: 5},
      {x: 0, y: -8},
      {x: 0, y: 8}
    ];
    for (let pos of seedPositions) {
      circle(pos.x * this.bloom, pos.y * this.bloom, 4);
    }
    pop();

    // Multiple layers of lotus petals (3 layers)
    for (let layer = 2; layer >= 0; layer--) {
      push();
      rotate(layer * 20 + this.rotation * 0.15);

      let layerPetals = 8;
      let layerRadius = (20 + layer * 25) * this.bloom;
      let petalLength = (60 + layer * 10) * this.bloom;
      let petalWidth = 35 * this.bloom;

      for (let i = 0; i < layerPetals; i++) {
        push();
        rotate(i * (360 / layerPetals));

        if (currentColorMode === "rainbow") {
          colorMode(HSB, 255, 255);
          let h = (strokeColor[0] + layer * 10) % 255;
          fill(h, 80 + layer * 20, 255, alpha * 0.85 - layer * 10);
          stroke(h, 150, 255, alpha * 0.9);
        } else {
          colorMode(RGB);
          fill(strokeColor[0] + layer * 20, strokeColor[1] + layer * 20, strokeColor[2] + layer * 20, alpha * 0.85 - layer * 10);
          stroke(strokeColor[0], strokeColor[1], strokeColor[2], alpha * 0.9);
        }
        strokeWeight(2);

        // Rounded lotus petal
        beginShape();
        vertex(0, -layerRadius);
        bezierVertex(
          petalWidth * 0.5, -layerRadius - petalLength * 0.3,
          petalWidth * 0.6, -layerRadius - petalLength * 0.7,
          petalWidth * 0.2, -layerRadius - petalLength
        );
        bezierVertex(
          petalWidth * 0.1, -layerRadius - petalLength * 1.05,
          -petalWidth * 0.1, -layerRadius - petalLength * 1.05,
          -petalWidth * 0.2, -layerRadius - petalLength
        );
        bezierVertex(
          -petalWidth * 0.6, -layerRadius - petalLength * 0.7,
          -petalWidth * 0.5, -layerRadius - petalLength * 0.3,
          0, -layerRadius
        );
        endShape(CLOSE);

        pop();
      }
      pop();
    }
    pop();
  }

  drawCherry(alpha) {
    push();
    rotate(this.rotation);

    xoff += 0.3;
    let strokeColor = getStrokeColor();

    // Cherry blossom center
    push();
    if (currentColorMode === "rainbow") {
      colorMode(HSB, 255, 255);
      fill(strokeColor[0], 100, 255, alpha);
    } else {
      colorMode(RGB);
      fill(255, 230, 100, alpha);
    }
    noStroke();
    circle(0, 0, 12 * this.bloom);

    // Stamens
    if (currentColorMode === "rainbow") {
      stroke(strokeColor[0], 150, 200, alpha);
    } else {
      stroke(200, 180, 100, alpha);
    }
    strokeWeight(1.5);
    for (let i = 0; i < 8; i++) {
      push();
      rotate(i * 45);
      line(0, 0, 0, -8 * this.bloom);
      pop();
    }
    pop();

    // 5 simple cherry blossom petals
    let numPetals = 5;
    for (let i = 0; i < numPetals; i++) {
      push();
      rotate(i * (360 / numPetals) + this.rotation * 0.4);

      if (currentColorMode === "rainbow") {
        colorMode(HSB, 255, 255);
        fill(strokeColor[0], 50, 255, alpha * 0.85);
        stroke(strokeColor[0], 100, 255, alpha);
      } else {
        colorMode(RGB);
        fill(strokeColor[0] + 80, strokeColor[1] + 80, strokeColor[2] + 80, alpha * 0.85);
        stroke(strokeColor[0], strokeColor[1], strokeColor[2], alpha);
      }
      strokeWeight(1.5);

      // Simple notched petal
      beginShape();
      vertex(0, -15);
      bezierVertex(
        20, -25,
        25, -50 * this.bloom,
        15, -60 * this.bloom
      );
      // Notch at tip
      vertex(8, -58 * this.bloom);
      vertex(0, -65 * this.bloom);
      vertex(-8, -58 * this.bloom);

      vertex(-15, -60 * this.bloom);
      bezierVertex(
        -25, -50 * this.bloom,
        -20, -25,
        0, -15
      );
      endShape(CLOSE);

      pop();
    }
    pop();
  }

  drawDahlia(alpha) {
    push();
    rotate(this.rotation);

    xoff += 0.3;
    let strokeColor = getStrokeColor();

    // Many layers of pointed petals
    for (let layer = 0; layer < 5; layer++) {
      push();
      rotate(layer * 10 + this.rotation * 0.2);

      let layerPetals = 8 + layer * 2;
      let layerRadius = (15 + layer * 15) * this.bloom;
      let petalLength = (50 - layer * 5) * this.bloom;
      let petalWidth = 12 * this.bloom;

      for (let i = 0; i < layerPetals; i++) {
        push();
        rotate(i * (360 / layerPetals));

        if (currentColorMode === "rainbow") {
          colorMode(HSB, 255, 255);
          let h = (strokeColor[0] + layer * 15) % 255;
          fill(h, 200 - layer * 20, 255, alpha * 0.9 - layer * 10);
          stroke(h, 255, 255, alpha * 0.95);
        } else {
          colorMode(RGB);
          fill(strokeColor[0], strokeColor[1], strokeColor[2], alpha * 0.9 - layer * 10);
          stroke(strokeColor[0], strokeColor[1], strokeColor[2], alpha * 0.95);
        }
        strokeWeight(1);

        // Pointed dahlia petal
        beginShape();
        vertex(0, -layerRadius);
        vertex(petalWidth * 0.4, -layerRadius - petalLength * 0.5);
        vertex(0, -layerRadius - petalLength);
        vertex(-petalWidth * 0.4, -layerRadius - petalLength * 0.5);
        endShape(CLOSE);

        pop();
      }
      pop();
    }

    // Dahlia center
    push();
    if (currentColorMode === "rainbow") {
      colorMode(HSB, 255, 255);
      fill(strokeColor[0], 255, 200, alpha);
    } else {
      colorMode(RGB);
      fill(strokeColor[0] * 0.8, strokeColor[1] * 0.6, strokeColor[2] * 0.4, alpha);
    }
    noStroke();
    circle(0, 0, 20 * this.bloom);
    pop();

    pop();
  }
}

// Flower particle class (pollen, sparkles, perfume mist)
class FlowerParticle {
  constructor(x, y) {
    this.x = x + random(-20, 20);
    this.y = y;
    this.vx = random(-0.5, 0.5);
    this.vy = random(-1, -0.3);
    this.size = random(2, 6);
    this.lifespan = 255;
    this.twinkle = random(TWO_PI);
    this.color = getStrokeColor();
  }

  update() {
    this.x += this.vx * animationSpeed;
    this.y += this.vy * animationSpeed;
    this.lifespan -= 1.5 * animationSpeed;
    this.twinkle += 0.1;
  }

  display() {
    push();
    let alpha = this.lifespan * (0.5 + sin(this.twinkle) * 0.5);

    if (currentColorMode === "rainbow") {
      colorMode(HSB, 255, 255);
      fill(this.color[0], 200, 255, alpha);
      stroke(this.color[0], 255, 255, alpha * 0.5);
    } else {
      colorMode(RGB);
      fill(this.color[0], this.color[1], this.color[2], alpha);
      stroke(this.color[0] + 50, this.color[1] + 50, this.color[2] + 50, alpha * 0.5);
    }

    strokeWeight(0.5);

    // Draw sparkle
    ellipse(this.x, this.y, this.size, this.size);

    // Glow effect
    noStroke();
    fill(this.color[0], this.color[1], this.color[2], alpha * 0.2);
    ellipse(this.x, this.y, this.size * 3, this.size * 3);

    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}

// Global function for HTML onclick - defined outside p5.js scope
function randomizeFractal() {
  // Clear canvas and hide instructions
  background(0);
  showInstructions = false;

  // Set up drawing parameters
  let numStrokes = 60;
  let angle = 360 / symmetry;

  push();
  translate(width / 2, height / 2);
  strokeWeight(slider.value());

  // Generate random fractal
  for (let i = 0; i < numStrokes; i++) {
    // Set color based on current color mode
    if (currentColorMode === "rainbow") {
      colorMode(HSB, 255, 255);
      let hue = map(i, 0, numStrokes, 0, 255);
      stroke(hue, 255, 255);
    } else if (currentColorMode === "gradient") {
      colorMode(RGB);
      let t = map(i, 0, numStrokes, 0, 1);
      let color1 = gradientColors[0];
      let color2 = gradientColors[1];
      let r = lerp(color1[0], color2[0], t);
      let g = lerp(color1[1], color2[1], t);
      let b = lerp(color1[2], color2[2], t);
      stroke(r, g, b);
    } else {
      colorMode(RGB);
      stroke(solidColor[0], solidColor[1], solidColor[2]);
    }

    // Generate random coordinates
    let x1 = random(-width / 3, width / 3);
    let y1 = random(-height / 3, height / 3);
    let x2 = random(-width / 3, width / 3);
    let y2 = random(-height / 3, height / 3);

    // Draw symmetrical lines
    for (let j = 0; j < symmetry; j++) {
      push();
      rotate(j * angle);
      line(x1, y1, x2, y2);
      // Mirror reflection
      push();
      scale(-1, 1);
      line(x1, y1, x2, y2);
      pop();
      pop();
    }
  }

  pop();
}

// Global function for animation toggle
function toggleAnimation() {
  isAnimating = !isAnimating;
  console.log("isAnimating", isAnimating);
  if (isAnimating) {
    showInstructions = false;
    if (subtitleElement) {
      subtitleElement.style("display", "none");
    }
    // Clear canvas when starting animation
    background(0);
    animateButton.querySelector('i').className = "fas fa-stop";
    animateButton.querySelector('span').textContent = "Stop";
    animateButton.title = "Stop Animation";
  } else {
    animateButton.querySelector('i').className = "fas fa-play";
    animateButton.querySelector('span').textContent = "Animate";
    animateButton.title = "Start Animation";
  }
}

function setup() {
  // Make canvas responsive to container size
  let canvasWidth, canvasHeight;

  if (windowWidth <= 768) {
    // Mobile: use most of screen width and height
    canvasWidth = windowWidth - 30;
    canvasHeight = windowHeight * 0.6;
  } else {
    // Desktop: fit within container, accounting for padding and controls
    let availableWidth = windowWidth - 350; // 280px controls + margins
    let availableHeight = windowHeight - 120; // title + margins
    let size = min(availableWidth, availableHeight - 40); // extra margin
    canvasWidth = canvasHeight = max(400, min(size, 600));
  }

  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent("canvasContainer");
  angleMode(DEGREES);
  background(0);

  // Create frame buffer for trails effect
  frameBuffer = createGraphics(width, height);
  frameBuffer.background(0);

  // Try to find the subtitle element
  subtitleElement = select(".subtitle");

  saveButton = select("#saveButton");
  saveButton.mousePressed(saveSnowflake);

  clearButton = select("#clearButton");
  clearButton.mousePressed(clearCanvas);

  // Use a timeout to ensure DOM is ready in all browsers
  setTimeout(() => {
    randomizeButton = document.getElementById("randomizeButton");
    if (randomizeButton) {
      randomizeButton.addEventListener("click", randomizeFractal);
      console.log("Randomize button connected");
    } else {
      console.log("Randomize button not found");
    }

    animateButton = document.getElementById("animateButton");
    if (animateButton) {
      animateButton.addEventListener("click", toggleAnimation);
      console.log("Animate button connected");
    } else {
      console.log("Animate button not found");
    }

    // Connect new controls
    speedSlider = document.getElementById("speedSlider");
    if (speedSlider) {
      speedSlider.addEventListener("input", function () {
        animationSpeed = parseFloat(this.value);
      });
    }

    combineCheckbox = document.getElementById("combineEffects");
    if (combineCheckbox) {
      combineCheckbox.addEventListener("change", function () {
        combineEffects = this.checked;
        if (secondaryEffectSelect) {
          secondaryEffectSelect.style.display = combineEffects
            ? "inline"
            : "none";
          let label = document.querySelector('label[for="secondaryEffect"]');
          if (label) {
            label.style.display = combineEffects ? "inline" : "none";
          }
        }
      });
    }

    secondaryEffectSelect = document.getElementById("secondaryEffect");
    if (secondaryEffectSelect) {
      secondaryEffectSelect.addEventListener("change", function () {
        secondaryEffect = this.value;
      });
    }

    trailsCheckbox = document.getElementById("trailsEnabled");
    if (trailsCheckbox) {
      trailsCheckbox.addEventListener("change", function () {
        trailsEnabled = this.checked;
        if (!trailsEnabled) {
          background(0);
        }
      });
    }

    // Flower controls
    let flowerTypeSelect = document.getElementById("flowerTypeSelect");
    if (flowerTypeSelect) {
      flowerTypeSelect.addEventListener("change", function () {
        flowerType = this.value;
        flowers = [];
        flowerParticles = [];
        if (!trailsEnabled) {
          background(0);
        }
      });
    }

    let flowerCountSelect = document.getElementById("flowerCountSelect");
    if (flowerCountSelect) {
      flowerCountSelect.addEventListener("change", function () {
        flowerCount = parseInt(this.value);
        flowers = [];
        flowerParticles = [];
        if (!trailsEnabled) {
          background(0);
        }
      });
    }
  }, 100);

  slider = select("#slider");

  symmetrySelect = select("#symmetrySelect");
  symmetrySelect.changed(updateSymmetry);

  colorModeSelect = select("#colorModeSelect");
  colorModeSelect.changed(updateColorMode);

  colorPicker = select("#colorPicker");
  colorPickerContainer = select("#colorPickerContainer");
  colorPicker.changed(updateSolidColor);

  animationModeSelect = select("#animationModeSelect");
  animationModeSelect.changed(updateAnimationMode);

  filterSelect = select("#filterSelect");
  filterSelect.changed(updateFilter);

  colorMode(HSB, 255, 255);

  // Draw initial instructions
  drawInstructions();
}

function windowResized() {
  // Recalculate canvas dimensions on resize
  let canvasWidth, canvasHeight;

  if (windowWidth <= 768) {
    // Mobile: use most of screen width and height
    canvasWidth = windowWidth - 30;
    canvasHeight = windowHeight * 0.6;
  } else {
    // Desktop: fit within container, accounting for padding and controls
    let availableWidth = windowWidth - 350; // 280px controls + margins
    let availableHeight = windowHeight - 120; // title + margins
    let size = min(availableWidth, availableHeight - 40); // extra margin
    canvasWidth = canvasHeight = max(400, min(size, 600));
  }

  resizeCanvas(canvasWidth, canvasHeight);
  // Only clear background if not animating
  if (!isAnimating) {
    background(0);
    if (showInstructions) {
      drawInstructions();
    }
  }
}

function saveSnowflake() {
  save("snowflake.png");
}

function clearCanvas() {
  background(0);
  frameBuffer.background(0);
  showInstructions = true;
  isAnimating = false;
  drawingPaths = [];
  particles = [];
  rotationAngle = 0;
  pulseScale = 1.0;
  waveOffset = 0;
  spiralRadius = 0;
  zoomLevel = 1.0;
  kaleidoscopeAngle = 0;
  animationAngle = 0;
  flowerBloom = 0.3;
  flowerBloomDirection = 1;
  petalRotation = 0;
  flowers = [];
  flowerParticles = [];
  swayOffset = 0;
  if (animateButton) {
    animateButton.querySelector('i').className = "fas fa-play";
    animateButton.querySelector('span').textContent = "Animate";
    animateButton.title = "Start Animation";
  }
  if (subtitleElement) {
    subtitleElement.style("display", "block");
  }
  drawInstructions();
}

function drawInstructions() {
  if (showInstructions) {
    push();
    colorMode(RGB, 255, 255, 255, 255);
    fill(255, 255, 255, 200);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Click and drag", width / 2, height / 2);
    pop();
  }
}

function updateSymmetry() {
  symmetry = int(symmetrySelect.value());
}

function updateColorMode() {
  currentColorMode = colorModeSelect.value();

  if (currentColorMode === "solid") {
    colorPickerContainer.style("display", "block");
    updateSolidColor();
  } else {
    colorPickerContainer.style("display", "none");
  }
}

function updateSolidColor() {
  let hexColor = colorPicker.value();
  // Convert hex to RGB
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);
  solidColor = [r, g, b];
}

function updateAnimationMode() {
  animationMode = animationModeSelect.value();
  // Reset animation variables when changing mode
  particles = [];
  rotationAngle = 0;
  pulseScale = 1.0;
  waveOffset = 0;
  spiralRadius = 0;
  zoomLevel = 1.0;
  kaleidoscopeAngle = 0;
  animationAngle = 0;
  flowerBloom = 0.3;
  flowerBloomDirection = 1;
  petalRotation = 0;
  flowers = [];
  flowerParticles = [];
  swayOffset = 0;

  // Show/hide flower controls
  let flowerTypeSelect = document.getElementById("flowerTypeSelect");
  let flowerCountSelect = document.getElementById("flowerCountSelect");
  if (flowerTypeSelect && flowerCountSelect) {
    if (animationMode === "flower") {
      flowerTypeSelect.style.display = "inline";
      flowerCountSelect.style.display = "inline";
      document.querySelector('label[for="flowerTypeSelect"]').style.display = "inline";
      document.querySelector('label[for="flowerCountSelect"]').style.display = "inline";
    } else {
      flowerTypeSelect.style.display = "none";
      flowerCountSelect.style.display = "none";
      document.querySelector('label[for="flowerTypeSelect"]').style.display = "none";
      document.querySelector('label[for="flowerCountSelect"]').style.display = "none";
    }
  }

  if (!trailsEnabled) {
    background(0);
  }
}

function updateFilter() {
  currentFilter = filterSelect.value();
}

function getStrokeColor() {
  switch (currentColorMode) {
    case "rainbow":
      let hu = map(sin(xoff), -1, 1, 0, 255);
      return [hu, 255, 255, 255];

    case "gradient":
      let t = map(sin(xoff * 0.1), -1, 1, 0, 1);
      let color1 = gradientColors[currentGradientIndex];
      let color2 =
        gradientColors[(currentGradientIndex + 1) % gradientColors.length];
      let r = lerp(color1[0], color2[0], t);
      let g = lerp(color1[1], color2[1], t);
      let b = lerp(color1[2], color2[2], t);
      // Cycle through gradient colors slowly
      if (frameCount % 120 === 0) {
        currentGradientIndex =
          (currentGradientIndex + 1) % gradientColors.length;
      }
      colorMode(RGB);
      return [r, g, b, 255];

    case "solid":
      colorMode(RGB);
      return [solidColor[0], solidColor[1], solidColor[2], 255];

    default:
      return [255, 255, 255, 255];
  }
}

function draw() {
  // Hide instructions when mouse is pressed anywhere on canvas
  if (mouseIsPressed && showInstructions) {
    showInstructions = false;
    if (subtitleElement) {
      subtitleElement.style("display", "none");
    }
    // Only clear background if not animating
    if (!isAnimating) {
      background(0);
    }
  }

  // Handle animation
  if (isAnimating) {
    // Apply trails effect if enabled
    if (trailsEnabled) {
      push();
      fill(0, 0, 0, 20);
      noStroke();
      rect(0, 0, width, height);
      pop();
    } else if (
      animationMode === "particles" ||
      animationMode === "spiral"
    ) {
      // Only particles and spiral need clearing for clean animation
      // Kaleidoscope can work with manual drawing
      background(0);
    }

    drawAnimation();
  }

  // Handle manual drawing (works with or without animation)
  push();
  translate(width / 2, height / 2);

  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;
    let pmx = pmouseX - width / 2;
    let pmy = pmouseY - height / 2;
    if (mouseIsPressed) {
      xoff += 1;
      //stroke weight
      let strokeColor = getStrokeColor();
      if (currentColorMode === "rainbow") {
        colorMode(HSB, 255, 255);
        stroke(
          strokeColor[0],
          strokeColor[1],
          strokeColor[2],
          strokeColor[3]
        );
      } else {
        colorMode(RGB);
        stroke(
          strokeColor[0],
          strokeColor[1],
          strokeColor[2],
          strokeColor[3]
        );
      }
      let angle = 360 / symmetry;
      for (let i = 0; i < symmetry; i++) {
        rotate(angle);
        let sw = slider.value();
        strokeWeight(sw);
        line(mx, my, pmx, pmy);
        push();
        scale(-1, 1);
        line(mx, my, pmx, pmy);
        pop();
      }
    }
  }
  pop();

  // Apply photographic filter
  if (currentFilter !== "none") {
    applyFilter(currentFilter);
  }
}

function applyFilter(filterType) {
  switch(filterType) {
    case "grayscale":
      filter(GRAY);
      break;
    case "sepia":
      applySepiaFilter();
      break;
    case "vintage":
      applyVintageFilter();
      break;
    case "blackwhite":
      applyBlackWhiteFilter();
      break;
    case "highcontrast":
      applyHighContrastFilter();
      break;
    case "invert":
      filter(INVERT);
      break;
    case "blur":
      filter(BLUR, 1);
      break;
    case "sharpen":
      applySharpenFilter();
      break;
    case "saturate":
      applySaturateFilter();
      break;
    case "desaturate":
      applyDesaturateFilter();
      break;
    case "brighten":
      applyBrightenFilter();
      break;
    case "darken":
      applyDarkenFilter();
      break;
    case "posterize":
      filter(POSTERIZE, 4);
      break;
    case "threshold":
      filter(THRESHOLD);
      break;
  }
}

function applySepiaFilter() {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];
    
    let tr = 0.393 * r + 0.769 * g + 0.189 * b;
    let tg = 0.349 * r + 0.686 * g + 0.168 * b;
    let tb = 0.272 * r + 0.534 * g + 0.131 * b;
    
    pixels[i] = constrain(tr, 0, 255);
    pixels[i + 1] = constrain(tg, 0, 255);
    pixels[i + 2] = constrain(tb, 0, 255);
  }
  updatePixels();
}

function applyVintageFilter() {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];
    
    // Vintage warm tone
    let tr = r * 1.1 + 20;
    let tg = g * 0.95 + 10;
    let tb = b * 0.9;
    
    // Add slight vignette effect (darker at edges)
    let x = (i / 4) % width;
    let y = floor((i / 4) / width);
    let distFromCenter = dist(x, y, width / 2, height / 2);
    let maxDist = dist(0, 0, width / 2, height / 2);
    let vignette = 1 - (distFromCenter / maxDist) * 0.3;
    
    pixels[i] = constrain(tr * vignette, 0, 255);
    pixels[i + 1] = constrain(tg * vignette, 0, 255);
    pixels[i + 2] = constrain(tb * vignette, 0, 255);
  }
  updatePixels();
}

function applyBlackWhiteFilter() {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];
    
    // Convert to grayscale with high contrast
    let gray = (r + g + b) / 3;
    gray = gray > 127 ? 255 : 0; // Hard threshold
    
    pixels[i] = gray;
    pixels[i + 1] = gray;
    pixels[i + 2] = gray;
  }
  updatePixels();
}

function applyHighContrastFilter() {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];
    
    // Increase contrast
    let factor = 1.5;
    r = constrain((r - 128) * factor + 128, 0, 255);
    g = constrain((g - 128) * factor + 128, 0, 255);
    b = constrain((b - 128) * factor + 128, 0, 255);
    
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
  }
  updatePixels();
}

function applySharpenFilter() {
  // Create a temporary buffer for the sharpened image
  let tempPixels = [];
  loadPixels();
  
  // Copy pixels
  for (let i = 0; i < pixels.length; i++) {
    tempPixels[i] = pixels[i];
  }
  
  // Sharpen kernel
  let kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0;
      let idx = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          let px = (y + ky) * width + (x + kx);
          let pidx = px * 4;
          let weight = kernel[idx];
          
          r += tempPixels[pidx] * weight;
          g += tempPixels[pidx + 1] * weight;
          b += tempPixels[pidx + 2] * weight;
          
          idx++;
        }
      }
      
      let pidx = (y * width + x) * 4;
      pixels[pidx] = constrain(r, 0, 255);
      pixels[pidx + 1] = constrain(g, 0, 255);
      pixels[pidx + 2] = constrain(b, 0, 255);
    }
  }
  
  updatePixels();
}

function applySaturateFilter() {
  loadPixels();
  colorMode(HSB, 255);
  
  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];
    
    // Convert RGB to HSB
    let hsb = rgbToHsb(r, g, b);
    
    // Increase saturation
    hsb[1] = constrain(hsb[1] * 1.5, 0, 255);
    
    // Convert back to RGB
    let rgb = hsbToRgb(hsb[0], hsb[1], hsb[2]);
    
    pixels[i] = rgb[0];
    pixels[i + 1] = rgb[1];
    pixels[i + 2] = rgb[2];
  }
  
  colorMode(RGB);
  updatePixels();
}

function applyDesaturateFilter() {
  loadPixels();
  colorMode(HSB, 255);
  
  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];
    
    // Convert RGB to HSB
    let hsb = rgbToHsb(r, g, b);
    
    // Decrease saturation
    hsb[1] = constrain(hsb[1] * 0.5, 0, 255);
    
    // Convert back to RGB
    let rgb = hsbToRgb(hsb[0], hsb[1], hsb[2]);
    
    pixels[i] = rgb[0];
    pixels[i + 1] = rgb[1];
    pixels[i + 2] = rgb[2];
  }
  
  colorMode(RGB);
  updatePixels();
}

function applyBrightenFilter() {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = constrain(pixels[i] * 1.3, 0, 255);
    pixels[i + 1] = constrain(pixels[i + 1] * 1.3, 0, 255);
    pixels[i + 2] = constrain(pixels[i + 2] * 1.3, 0, 255);
  }
  updatePixels();
}

function applyDarkenFilter() {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = constrain(pixels[i] * 0.7, 0, 255);
    pixels[i + 1] = constrain(pixels[i + 1] * 0.7, 0, 255);
    pixels[i + 2] = constrain(pixels[i + 2] * 0.7, 0, 255);
  }
  updatePixels();
}

// Helper functions for color conversion
function rgbToHsb(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  let maxVal = Math.max(r, g, b);
  let minVal = Math.min(r, g, b);
  let delta = maxVal - minVal;
  
  let h = 0;
  if (delta !== 0) {
    if (maxVal === r) {
      h = ((g - b) / delta) % 6;
    } else if (maxVal === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
  }
  h = round(h * 60);
  if (h < 0) h += 360;
  
  let s = maxVal === 0 ? 0 : delta / maxVal;
  let v = maxVal;
  
  return [round(h * 255 / 360), round(s * 255), round(v * 255)];
}

function hsbToRgb(h, s, v) {
  h = (h / 255) * 360;
  s = s / 255;
  v = v / 255;
  
  let c = v * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = v - c;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return [
    round((r + m) * 255),
    round((g + m) * 255),
    round((b + m) * 255)
  ];
}

function drawAnimation() {
  push();
  translate(width / 2, height / 2);

  // Apply secondary effect if combining
  if (combineEffects && secondaryEffect !== "none") {
    applySecondaryEffect();
  }

  // Main animation mode
  switch (animationMode) {
    case "rotate":
      drawRotateAnimation();
      break;
    case "pulse":
      drawPulseAnimation();
      break;
    case "particles":
      drawParticleAnimation();
      break;
    case "kaleidoscope":
      drawKaleidoscopeAnimation();
      break;
    case "wave":
      drawWaveAnimation();
      break;
    case "spiral":
      drawSpiralAnimation();
      break;
    case "zoom":
      drawZoomAnimation();
      break;
    case "morph":
      drawMorphAnimation();
      break;
    case "flower":
      drawFlowerAnimation();
      break;
  }

  pop();
}

function applySecondaryEffect() {
  switch (secondaryEffect) {
    case "rotate":
      rotate(rotationAngle);
      rotationAngle += 0.5 * animationSpeed;
      break;
    case "pulse":
      scale(pulseScale);
      pulseScale += pulseDirection * 0.005 * animationSpeed;
      if (pulseScale > 1.2 || pulseScale < 0.8) {
        pulseDirection *= -1;
      }
      break;
    case "wave":
      let waveAmount = sin(waveOffset) * 10;
      translate(waveAmount, cos(waveOffset) * 10);
      waveOffset += 0.05 * animationSpeed;
      break;
  }
}


function drawRotateAnimation() {
  // Apply gentle rotation effect to the whole canvas view
  push();
  translate(width / 2, height / 2);
  rotate(frameCount * 0.3 * animationSpeed);
  translate(-width / 2, -height / 2);
  
  // Create a subtle rotating overlay effect
  push();
  translate(width / 2, height / 2);
  noFill();
  let strokeColor = getStrokeColor();
  if (currentColorMode === "rainbow") {
    colorMode(HSB, 255, 255);
    stroke(strokeColor[0], strokeColor[1], strokeColor[2], 50);
  } else {
    colorMode(RGB);
    stroke(strokeColor[0], strokeColor[1], strokeColor[2], 50);
  }
  strokeWeight(1);
  
  for (let i = 0; i < 3; i++) {
    let radius = 50 + i * 40;
    let angle = 360 / symmetry;
    for (let j = 0; j < symmetry; j++) {
      push();
      rotate(j * angle + frameCount * (i + 1) * 0.5);
      ellipse(radius, 0, 20, 20);
      pop();
    }
  }
  pop();
  
  pop();
}

function drawPulseAnimation() {
  push();
  translate(width / 2, height / 2);

  // Draw subtle pulsing background elements
  noFill();
  xoff += 1;
  let strokeColor = getStrokeColor();
  if (currentColorMode === "rainbow") {
    colorMode(HSB, 255, 255);
    stroke(strokeColor[0], strokeColor[1], strokeColor[2], 80);
  } else {
    colorMode(RGB);
    stroke(strokeColor[0], strokeColor[1], strokeColor[2], 80);
  }

  strokeWeight(2);

  for (let i = 0; i < 3; i++) {
    let radius = (i + 1) * 60 * pulseScale;
    let angle = 360 / symmetry;

    for (let j = 0; j < symmetry; j++) {
      push();
      rotate(j * angle + animationAngle * (i + 1));
      // Draw subtle arcs that don't interfere with manual drawing
      arc(0, 0, radius, radius, 0, 30);
      push();
      scale(-1, 1);
      arc(0, 0, radius, radius, 0, 30);
      pop();
      pop();
    }
  }

  pop();

  pulseScale += pulseDirection * 0.008 * animationSpeed;
  if (pulseScale > 1.3 || pulseScale < 0.7) {
    pulseDirection *= -1;
  }
  animationAngle += 0.8 * animationSpeed;
}

function drawParticleAnimation() {
  // Generate new particles
  if (frameCount % max(1, floor(5 / animationSpeed)) === 0) {
    for (let i = 0; i < symmetry; i++) {
      let angle = (360 / symmetry) * i + random(-10, 10);
      particles.push(new Particle(0, 0, angle));
    }
  }

  // Update and display particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.display();

    if (p.isDead() || p.radius > max(width, height)) {
      particles.splice(i, 1);
    }
  }

  xoff += 1;
}

function drawKaleidoscopeAnimation() {
  kaleidoscopeAngle += 2 * animationSpeed;

  let radius = min(width, height) * 0.35;
  let numLayers = 3;

  for (let layer = 0; layer < numLayers; layer++) {
    push();
    rotate(kaleidoscopeAngle * (layer + 1) * 0.3);

    let layerRadius = radius * (0.5 + layer * 0.3);
    let numPoints = 6 + layer * 2;

    xoff += 0.5;
    let strokeColor = getStrokeColor();
    if (currentColorMode === "rainbow") {
      colorMode(HSB, 255, 255);
      stroke(strokeColor[0], strokeColor[1], strokeColor[2], 150 - layer * 30);
    } else {
      colorMode(RGB);
      stroke(strokeColor[0], strokeColor[1], strokeColor[2], 150 - layer * 30);
    }

    strokeWeight(slider.value() * (1 - layer * 0.2));
    noFill();

    beginShape();
    for (let i = 0; i <= numPoints; i++) {
      let angle = (TWO_PI / numPoints) * i;
      let x =
        cos(angle) *
        layerRadius *
        (1 + sin(kaleidoscopeAngle * 0.02 + i) * 0.2);
      let y =
        sin(angle) *
        layerRadius *
        (1 + cos(kaleidoscopeAngle * 0.02 + i) * 0.2);

      let symAngle = 360 / symmetry;
      for (let j = 0; j < symmetry; j++) {
        push();
        rotate(j * symAngle);
        if (i === 0) {
          beginShape();
        }
        vertex(x, y);
        if (i === numPoints) {
          endShape(CLOSE);
        }
        pop();
      }
    }

    pop();
  }
}

function drawWaveAnimation() {
  push();
  translate(width / 2, height / 2);
  
  waveOffset += 0.05 * animationSpeed;

  let waveHeight = 30;
  let waveLength = 80;
  let numWaves = 3;

  xoff += 1;
  let strokeColor = getStrokeColor();
  if (currentColorMode === "rainbow") {
    colorMode(HSB, 255, 255);
    stroke(strokeColor[0], strokeColor[1], strokeColor[2], 100);
  } else {
    colorMode(RGB);
    stroke(strokeColor[0], strokeColor[1], strokeColor[2], 100);
  }

  strokeWeight(1);
  noFill();

  for (let w = 0; w < numWaves; w++) {
    push();
    rotate(animationAngle + w * 20);

    let angle = 360 / symmetry;
    for (let i = 0; i < symmetry; i++) {
      push();
      rotate(i * angle);

      // Draw subtle wave patterns that complement manual drawing
      beginShape();
      for (let x = -waveLength; x <= waveLength; x += 8) {
        let y = sin((x + waveOffset * 15) * 0.04) * waveHeight * (0.8 + w * 0.1);
        vertex(x + w * 15, y);
      }
      endShape();

      push();
      scale(-1, 1);
      beginShape();
      for (let x = -waveLength; x <= waveLength; x += 8) {
        let y = sin((x + waveOffset * 15) * 0.04) * waveHeight * (0.8 + w * 0.1);
        vertex(x + w * 15, y);
      }
      endShape();
      pop();

      pop();
    }

    pop();
  }

  pop();

  animationAngle += 0.4 * animationSpeed;
}

function drawSpiralAnimation() {
  spiralRadius += 2 * animationSpeed;
  if (spiralRadius > max(width, height) * 0.7) {
    spiralRadius = 0;
  }

  xoff += 1;
  let strokeColor = getStrokeColor();
  if (currentColorMode === "rainbow") {
    colorMode(HSB, 255, 255);
    stroke(strokeColor[0], strokeColor[1], strokeColor[2], 200);
  } else {
    colorMode(RGB);
    stroke(strokeColor[0], strokeColor[1], strokeColor[2], 200);
  }

  strokeWeight(slider.value());

  let numPoints = 50;
  let angle = 360 / symmetry;

  for (let i = 0; i < symmetry; i++) {
    push();
    rotate(i * angle);

    beginShape();
    noFill();
    for (let j = 0; j < numPoints; j++) {
      let t = j / numPoints;
      let r = spiralRadius * t;
      let a = t * TWO_PI * 3 + animationAngle;
      let x = cos(a) * r;
      let y = sin(a) * r;
      vertex(x, y);
    }
    endShape();

    push();
    scale(-1, 1);
    beginShape();
    noFill();
    for (let j = 0; j < numPoints; j++) {
      let t = j / numPoints;
      let r = spiralRadius * t;
      let a = t * TWO_PI * 3 + animationAngle;
      let x = cos(a) * r;
      let y = sin(a) * r;
      vertex(x, y);
    }
    endShape();
    pop();

    pop();
  }

  animationAngle += 0.02 * animationSpeed;
}

function drawZoomAnimation() {
  push();
  scale(zoomLevel);

  // Draw fractal pattern that changes with zoom
  let detail = floor(map(zoomLevel, 0.5, 2, 3, 8));
  let radius = min(width, height) * 0.25;

  xoff += 1;
  let strokeColor = getStrokeColor();
  if (currentColorMode === "rainbow") {
    colorMode(HSB, 255, 255);
    stroke(strokeColor[0], strokeColor[1], strokeColor[2], 150);
  } else {
    colorMode(RGB);
    stroke(strokeColor[0], strokeColor[1], strokeColor[2], 150);
  }

  strokeWeight(slider.value() / zoomLevel);

  // Draw fractal branches
  let angle = 360 / symmetry;
  for (let i = 0; i < symmetry; i++) {
    push();
    rotate(i * angle + animationAngle);
    drawBranch(radius * zoomLevel, detail);
    push();
    scale(-1, 1);
    drawBranch(radius * zoomLevel, detail);
    pop();
    pop();
  }

  pop();

  zoomLevel += zoomDirection * 0.005 * animationSpeed;
  if (zoomLevel > 2 || zoomLevel < 0.5) {
    zoomDirection *= -1;
  }
  animationAngle += 0.5 * animationSpeed;
}

function drawBranch(len, level) {
  if (level > 0) {
    line(0, 0, len, 0);
    push();
    translate(len, 0);
    rotate(30);
    drawBranch(len * 0.67, level - 1);
    rotate(-60);
    drawBranch(len * 0.67, level - 1);
    pop();
  }
}

function drawMorphAnimation() {
  morphTimer += 0.01 * animationSpeed;

  // Gradually change symmetry
  let newSymmetry = floor(map(sin(morphTimer), -1, 1, 2, 8));
  if (newSymmetry !== symmetry) {
    symmetry = newSymmetry;
    symmetrySelect.value(symmetry.toString());
  }

  // Gradually change stroke weight
  let newStrokeWeight = map(sin(morphTimer * 1.5), -1, 1, 1, 20);
  slider.value(newStrokeWeight);
}

function initFlowers() {
  flowers = [];
  let positions = [];

  // Calculate positions based on flower count
  if (flowerCount === 1) {
    positions = [{x: 0, y: height * 0.1}];
  } else if (flowerCount === 2) {
    positions = [
      {x: -width * 0.15, y: height * 0.15},
      {x: width * 0.15, y: height * 0.15}
    ];
  } else if (flowerCount === 3) {
    positions = [
      {x: -width * 0.2, y: height * 0.15},
      {x: 0, y: 0},
      {x: width * 0.2, y: height * 0.2}
    ];
  } else if (flowerCount === 5) {
    positions = [
      {x: -width * 0.25, y: height * 0.1},
      {x: -width * 0.12, y: height * 0.2},
      {x: 0, y: 0},
      {x: width * 0.12, y: height * 0.2},
      {x: width * 0.25, y: height * 0.1}
    ];
  }

  for (let i = 0; i < positions.length; i++) {
    let size = random(0.8, 1.2);
    flowers.push(new Flower(positions[i].x, positions[i].y, size, i * PI / 3));
  }
}

function drawFlowerAnimation() {
  // Gentle background fade for trails effect
  if (!trailsEnabled) {
    push();
    fill(0, 0, 0, 25);
    noStroke();
    rect(-width/2, -height/2, width, height);
    pop();
  } else {
    // Even with trails, need some fade
    push();
    fill(0, 0, 0, 10);
    noStroke();
    rect(-width/2, -height/2, width, height);
    pop();
  }

  // Initialize flowers if needed
  if (flowers.length === 0) {
    initFlowers();
  }

  // Update sway offset
  swayOffset += 0.02 * animationSpeed;

  // Update and display all flowers (sorted by depth for proper layering)
  flowers.sort((a, b) => a.depth - b.depth);

  for (let flower of flowers) {
    flower.update();
    flower.display(flowerType);
  }

  // Generate flower particles (pollen/sparkles)
  if (frameCount % max(1, floor(10 / animationSpeed)) === 0) {
    for (let flower of flowers) {
      if (random() < 0.5) {
        flowerParticles.push(new FlowerParticle(flower.x, flower.y - 80 * flower.size));
      }
    }
  }

  // Update and display flower particles
  for (let i = flowerParticles.length - 1; i >= 0; i--) {
    let p = flowerParticles[i];
    p.update();
    p.display();

    if (p.isDead()) {
      flowerParticles.splice(i, 1);
    }
  }
}
