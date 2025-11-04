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
  if (!trailsEnabled) {
    background(0);
  }
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
