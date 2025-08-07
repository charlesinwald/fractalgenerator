let symmetry = 6;
let saveButton;
let clearButton;
let slider;
let symmetrySelect;
let colorModeSelect;
let colorPicker;
let colorPickerContainer;
let currentColorMode = 'rainbow';
let xoff = 0;
let gradientColors = [
  [255, 107, 107], // Red
  [78, 205, 196],  // Teal
  [69, 183, 209],  // Blue
  [150, 206, 180], // Green
  [255, 193, 7],   // Yellow
  [156, 39, 176]   // Purple
];
let currentGradientIndex = 0;
let solidColor = [255, 255, 255];
function setup() {
  let canvas = createCanvas(800, 800);
  canvas.parent('canvasContainer');
  angleMode(DEGREES);
  background(0);

  saveButton = select("#saveButton");
  saveButton.mousePressed(saveSnowflake);

  clearButton = select("#clearButton");
  clearButton.mousePressed(clearCanvas);

  slider = select("#slider");
  
  symmetrySelect = select("#symmetrySelect");
  symmetrySelect.changed(updateSymmetry);
  
  colorModeSelect = select("#colorModeSelect");
  colorModeSelect.changed(updateColorMode);
  
  colorPicker = select("#colorPicker");
  colorPickerContainer = select("#colorPickerContainer");
  colorPicker.changed(updateSolidColor);
  
  colorMode(HSB, 255, 255);
}

function saveSnowflake() {
  save("snowflake.png");
}

function clearCanvas() {
  background(0);
}

function updateSymmetry() {
  symmetry = int(symmetrySelect.value());
}

function updateColorMode() {
  currentColorMode = colorModeSelect.value();
  
  if (currentColorMode === 'solid') {
    colorPickerContainer.style('display', 'block');
    updateSolidColor();
  } else {
    colorPickerContainer.style('display', 'none');
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

function getStrokeColor() {
  switch(currentColorMode) {
    case 'rainbow':
      let hu = map(sin(xoff), -1, 1, 0, 255);
      return [hu, 255, 255, 255];
    
    case 'gradient':
      let t = map(sin(xoff * 0.1), -1, 1, 0, 1);
      let color1 = gradientColors[currentGradientIndex];
      let color2 = gradientColors[(currentGradientIndex + 1) % gradientColors.length];
      let r = lerp(color1[0], color2[0], t);
      let g = lerp(color1[1], color2[1], t);
      let b = lerp(color1[2], color2[2], t);
      // Cycle through gradient colors slowly
      if (frameCount % 120 === 0) {
        currentGradientIndex = (currentGradientIndex + 1) % gradientColors.length;
      }
      colorMode(RGB);
      return [r, g, b, 255];
    
    case 'solid':
      colorMode(RGB);
      return [solidColor[0], solidColor[1], solidColor[2], 255];
    
    default:
      return [255, 255, 255, 255];
  }
}

function draw() {
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
      if (currentColorMode === 'rainbow') {
        colorMode(HSB, 255, 255);
        stroke(strokeColor[0], strokeColor[1], strokeColor[2], strokeColor[3]);
      } else {
        colorMode(RGB);
        stroke(strokeColor[0], strokeColor[1], strokeColor[2], strokeColor[3]);
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
      pop();
    }
  }
}
