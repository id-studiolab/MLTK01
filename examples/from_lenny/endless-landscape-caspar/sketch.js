const canvasWidth = 1200,
  canvasHeight = 800;

let boatImages = {
  left: null,
  right: null,
};
let boatIsGoingLeft = true;
let boatLocation = {
  x: 100,
  y: 100,
};
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
  boatImages.right = loadImage('boat-right.png');
  boatImages.left = loadImage('boat-left.png');

  // Load the mountain image into an array
  mountainImages.push(loadImage('mountain1.png'));
  mountainImages.push(loadImage('mountain2.png'));
  mountainImages.push(loadImage('mountain3.png'));
}

function setup() {
  // Make a canvas
  createCanvas(canvasWidth, canvasHeight);
  background('#E3CEC1');

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
  // Clear the screen every frame
  background('#E3CEC1');

  // Draw all the mountains
  for (const mountain of mountains) {
    // only draw the mountain when it is on the screen
    if (mountain.x > 0 - mountain.image.width && mountain.x < canvasWidth) {
      image(
        mountain.image,
        mountain.x,
        mountain.y,
        mountain.image.width * mountain.scale,
        mountain.image.height * mountain.scale,
      );

      // If we are drawing the first mountain on the screen draw a new one in front
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

      // If we are drawing the last mountain on the screen draw a new one behind
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

  // Draw the boat on the canvas based on the direction that it is moving
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

  // Control the boat by changing the direction
  if (keyIsDown(LEFT_ARROW)) {
    boatIsGoingLeft = true;

    // sliding the mountains to the right
    for (const mountain of mountains) {
      mountain.x += 2;
    }
  }
  if (keyIsDown(RIGHT_ARROW)) {
    boatIsGoingLeft = false;

    // sliding the mountains to the left
    for (const mountain of mountains) {
      mountain.x -= 2;
    }
  }
  // Control the boat by changing the scale and height of the boat
  if (keyIsDown(UP_ARROW)) {
    boatLocation.y -= 2;
    // Prevent from going of the canvas
    if (boatLocation.y < 0) {
      boatLocation.y = 0;
    }
    boatScale = map(boatLocation.y, 0, canvasHeight, boatMinScale, boatMaxScale);

    // recenter the boat
    boatLocation.x = canvasWidth / 2 - (boatImages.left.width * boatScale) / 2;
  }
  if (keyIsDown(DOWN_ARROW)) {
    boatLocation.y += 2;
    // Prevent from going of the canvas
    if (boatLocation.y > canvasHeight - boatImages.left.height * boatMaxScale) {
      boatLocation.y = canvasHeight - boatImages.left.height * boatMaxScale;
    }
    boatScale = map(boatLocation.y, 0, canvasHeight, boatMinScale, boatMaxScale);

    // recenter the boat
    boatLocation.x = canvasWidth / 2 - (boatImages.left.width * boatScale) / 2;
  }

  // Create new mountains just of screen
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
