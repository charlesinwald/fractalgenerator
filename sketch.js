let symmetry = 6;
let saveButton;
let clearButton;
let slider;
let xoff = 0;
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
  colorMode(HSB, 255, 255);
}

function saveSnowflake() {
  save("snowflake.png");
}

function clearCanvas() {
  background(0);
}

function draw() {
  translate(width / 2, height / 2);
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;
    let pmx = pmouseX - width / 2;
    let pmy = pmouseY - height / 2;
    if (mouseIsPressed) {
      let hu = map(sin(xoff), -1, 1, 0, 255);
      xoff += 1;
      //stroke weight
      stroke(hu, 255, 255, 255);
      let angle = 360 / symmetry;
      for (let i = 0; i < 12; i++) {
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
