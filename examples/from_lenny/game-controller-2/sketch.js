//create a variable to store the mltk object
let mltk;
//this variable will be used to store the active class label
let activeClass;
let lastActiveClass;

let canvasHeight;
let canvasWidth;

let boatImages = {left: null, right: null};
let boatIsGoingLeft = true;
let boatLocation = {x: 100, y: 100};
let boatScale = 0.5;
const boatMinScale = 0.1,
  boatMaxScale = 0.8;

const mountainImages = [];
const mountains = [];

const mountainMinSpacing = 20,
  mountainMaxSpacing = 300;
const mountainMinY = 30,
  mountainMaxY = 150;
const mountainMinScale = 0.4,
  mountainMaxScale = 0.7;

let firstMountain = null;
let lastMountain = null;

function preload() {
  // load the boat images
  boatImages.right = loadImage('img/boat-right.png');
  boatImages.left = loadImage('img/boat-left.png');

  // load the mount images into an array
  mountainImages.push(loadImage('img/mountain1.png'));
  mountainImages.push(loadImage('img/mountain2.png'));
  mountainImages.push(loadImage('img/mountain3.png'));
}

function setup() {
  //inizialize the mltk object passing the two callback functions used fot training and play mode
  mltk = new MLTK(train, play);

  //add a button to initialize the connection
  mltk.createControlInterface();

  // creating the canvas after the control interface makes the bar appear on top.
  canvasWidth = windowWidth;
  canvasHeight = windowHeight - 50;
  createCanvas(canvasWidth, canvasHeight);
  background('#e3cec1');

  // Center the boat on the canvas
  boatLocation.y = canvasHeight / 2 - (boatImages.left.height * boatScale) / 2;
  boatScale = map(boatLocation.y, 0, canvasHeight, boatMinScale, boatMaxScale);
  boatLocation.x = canvasWidth / 2 - (boatImages.left.width * boatScale) / 2;

  // Create the first mountain with a random y, image and scale
  let mountain = new Mountain(
    10,
    random(mountainMinY, mountainMaxY),
    random(mountainImages),
    random(mountainMinScale, mountainMaxScale),
  );
  firstMountain = mountain;
  lastMountain = mountain;
  // Add it to the list
  mountains.push(mountain);
}

function draw() {
  // the draw function only draws the active class to the canvas
  background('#e3cec1');
  textAlign(LEFT);
  textSize(20);
  fill('#f9423a');
  drawMountains();
  drawActiveClass();
  updateBoatPosition();
  drawBoat();
}

function drawActiveClass() {
  text('active class: ' + activeClass, 20, 30);
}

function drawMountains() {
  for (const mountain of mountains) {
    // only draw the mountain if it's on the screen.
    if (mountain.x > 0 - mountain.image.width && mountain.x < canvasWidth) {
      image(
        mountain.image,
        mountain.x,
        mountain.y,
        mountain.image.width * mountain.scale,
        mountain.image.height * mountain.scale,
      );

      // If we are drawing the first mountain on the screen, draw a new one in front.
      if (mountain === firstMountain) {
        // Create a new mountain in front
        let newMountain = new Mountain(
          mountain.x - random(mountainMinSpacing, mountainMaxSpacing),
          random(mountainMinY, mountainMaxY),
          random(mountainImages),
          random(mountainMinScale, mountainMaxScale),
        );
        firstMountain = newMountain;
        mountains.push(newMountain);
      }

      // If we are drawing the last mountain on the screen, draw a new one behind.
      if (mountain === lastMountain) {
        // Create a new mountain in front
        let newMountain = new Mountain(
          mountain.x + random(mountainMinSpacing, mountainMaxSpacing),
          random(mountainMinY, mountainMaxY),
          random(mountainImages),
          random(mountainMinScale, mountainMaxScale),
        );
        lastMountain = newMountain;
        mountains.push(newMountain);
      }
    }
  }
}

function drawBoat() {
  if (boatIsGoingLeft) {
    image(
      boatImages.left,
      boatLocation.x,
      boatLocation.y,
      boatImages.left.width * boatScale,
      boatImages.left.height * boatScale,
    );
  } else {
    image(
      boatImages.right,
      boatLocation.x,
      boatLocation.y,
      boatImages.left.width * boatScale,
      boatImages.left.height * boatScale,
    );
  }
}

function keyTyped() {
  if (key === '0') {
    activeClass = 0;
  } else if (key === '1') {
    activeClass = 1;
  } else if (key === '7') {
    activeClass = 7;
  }
}

// For this to work, you have to train the classes like so:
// 0: no movement
// 1: right
// 7: left
function updateBoatPosition() {
  switch (activeClass) {
    case 0:
      // Stop moving
      acceleration = 0;
      break;
    case 1:
      // Go right
      boatIsGoingLeft = false;
      acceleration = 2;
      break;
    case 7:
      // Go left
      boatIsGoingLeft = true;
      acceleration = 2;
      break;
    default:
      acceleration = 0;
      break;
  }
  for (const mountain of mountains) {
    if (boatIsGoingLeft) {
      mountain.x += acceleration;
    } else {
      mountain.x -= acceleration;
    }
  }
}

// TODO consider up/down position of boat and work with scales.

//this functions will be run in loop when you are in train mode and the record button is pressed
function train() {
  //get the label of the class selected from the board
  let label = mltk.getActiveClass();
  //get some data from the board sensor and use it as training features
  let features = mltk.getMagnetometerData();
  mltk.addTrainingData(label, features);
}

//this function will be run in loop when you are in play mode
function play() {
  //get the data you want to "classify"
  let features = mltk.getMagnetometerData();
  //pass the data to the function who does the classification, once done call the "gotResults" callback function
  mltk.classify(features, gotResults);
}

function gotResults(err, result) {
  if (err) {
    console.log(err);
  } else {
    //take the name of the label identified and store it in the global variable activeClass
    activeClass = parseInt(result.label);
    play();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 50);
}

class Mountain {
  // Creates a Mountain object with a x and y location and the image and scale
  constructor(x, y, image, scale) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.scale = scale;
  }
}
