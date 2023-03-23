// create a variable to store the mltk object
let mltk;

// this variable is used to store the active class label
let activeClass;

let canvasHeight;
let canvasWidth;

// The boat is an object with an image & a location. It faces left or right and has some size scale.
let boatImages = {left: null, right: null};
let boatLocation = {x: 100, y: 100};
let boatIsGoingLeft = true;
let boatScale = 0.3;

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

// this runs before setup(). It is used to load images and other assets.
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
  // initialize the mltk object and pass the two callback functions used for training and play modes
  mltk = new MLTK(train, play);

  // create the control interface.
  mltk.createControlInterface();

  // create the canvas after the control interfaces.
  canvasWidth = windowWidth;
  canvasHeight = windowHeight - 50;
  createCanvas(canvasWidth, canvasHeight);
  background('#e3cec1');

  // center the boat on the canvas
  boatLocation.y = canvasHeight / 2 - (boatImages.left.height * boatScale) / 2;
  boatScale = 0.5;
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
  // the draw function is looped every frame. We clear the canvas and draw the boat and mountains.
  background('#e3cec1');
  textAlign(LEFT);
  textSize(20);
  fill('#f9423a');
  drawMountains();
  drawActiveClass();
  // updateBoatPosition();
  drawBoat();
}

// this function draws the active class to the canvas every frame. Useful for debugging.
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
        // Create a new mountain behind
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

// we keep this function for testing purposes. We can use the keyboard to simulate the classes.
function keyTyped() {
  if (key === '0') {
    activeClass = 0;
  } else if (key === '1') {
    activeClass = 1;
  } else if (key === '7') {
    activeClass = 7;
  }
}

// For this code to work, you have to train the classes like so:
// 0: no movement
// 1: right
// 2: right, faster
// 7: left
// 6: left, faster
function updateBoatPosition() {
  switch (activeClass) {
    case 0:
      // no movement
      velocity = 0;
      break;
    case 1:
      // Boat is going right, mountains are moving left
      boatIsGoingLeft = false;
      velocity = 2;
      break;
    case 2:
      // Boat is going right, mountains are moving left, faster
      boatIsGoingLeft = false;
      velocity = 4;
      break;
    case 7:
      // Boat is going left, mountains are moving right
      boatIsGoingLeft = true;
      velocity = 2;
      break;
    case 6:
      // Boat is going left, mountains are moving right, faster.
      boatIsGoingLeft = true;
      velocity = 2;
      break;
    default:
      // no movement
      velocity = 0;
      break;
  }
  // move the mountains
  for (const mountain of mountains) {
    if (boatIsGoingLeft) {
      mountain.x += velocity;
    } else {
      mountain.x -= velocity;
    }
  }
}

// this funcion runs looped only when you are in train mode and the record button is pressed.
function train() {
  //get the label of the class selected from the board
  let label = mltk.getActiveClass();
  //get some data from the board sensor and use it as training features
  let features = mltk.getMagnetometerData();
  mltk.addTrainingData(label, features);
}

// this function runs looped when you are in play mode.
function play() {
  // get the data you want to "classify"
  let features = mltk.getMagnetometerData();

  // pass the data to the function that does the classification, once it is done classifying, call the function gotResults.
  mltk.classify(features, gotResults);
}

// this function is called once the classification is done. It takes the error and the result as arguments. If the error is not empty, we log it to the console. If there is no error, we store the label of the class identified in the global variable activeClass.
function gotResults(err, result) {
  if (err) {
    console.log(err);
  } else {
    // take the name of the label identified and store it in the global variable activeClass
    activeClass = parseInt(result.label);
    play();
  }
}

// if the window is resized, we resize the canvas to fit the new window size.
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
