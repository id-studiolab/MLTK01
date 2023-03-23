// create a variable to store the mltk object
let mltk;

// this variable is used to store the active class label
let activeClass;

let ballPosition = {};

// velocity of the ball. Combines direction with magnitude.
let velocity = 0;

function setup() {
  // initialize the mltk object and pass the two callback functions used for training and play modes
  mltk = new MLTK(train, play);

  // create the control interface.
  mltk.createControlInterface();

  // Create the canvas to work with.
  createCanvas(windowWidth, windowHeight - 50);

  ballPosition.x = width / 2;
  ballPosition.y = height / 2;
}

function draw() {
  // the draw function is looped every frame. We clear the canvas and draw the ball.
  background('#101010');
  textAlign(LEFT);
  textSize(20);
  fill('#f9423a');
  drawActiveClass();
  updateBallPosition();
  drawBall();
}

// this function draws the active class to the canvas every frame. Useful for debugging.
function drawActiveClass() {
  text('active class: ' + activeClass, 20, 30);
}

// this function draws the ball to the canvas every frame.
function drawBall() {
  ellipse(ballPosition.x, ballPosition.y, 50, 50);
}

// this function updates the ball position every frame. For this to work, we have to train the classes 0,1,2,6,7. We do not have to worry about training the other classes on the board.
function updateBallPosition() {
  switch (activeClass) {
    case 0:
      // no movement
      velocity = 0;
      break;
    case 1:
      // ball is "moving" right
      velocity = +1;
      break;
    case 2:
      // ball is "moving" right, faster.
      velocity = +2;
      break;
    case 7:
      // ball is "moving" left
      velocity = -1;
      break;
    case 6:
      // ball is "moving" left, faster.
      velocity = -2;
      break;
    default:
      // no movement
      velocity = 0;
      break;
  }
  ballPosition.x += velocity;
  //console.log(activeClass,velocity)
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

// we keep this function for testing purposes. We can reset the ball position or actively change the class.
function keyTyped() {
  if (key === '0') {
    ballPosition.x = width / 2;
    activeClass = 0;
  } else if (key === '1') {
    activeClass = 1;
  } else if (key === '7') {
    activeClass = 7;
  }
}
