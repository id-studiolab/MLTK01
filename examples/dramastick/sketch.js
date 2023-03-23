// create a variable to store the mltk object
let mltk;

// these variables are used to keep track of the activeClass.
let activeClass = '';
let lastActiveClass = '';

let sounds = new Array(8);

// load all the sounds before setup
function preload() {
  soundFormats('mp3');

  sounds[0] = loadSound('./assets/are_you_ready.mp3');
  sounds[1] = loadSound('./assets/baby_baby_baybeh.mp3');
  sounds[2] = loadSound('./assets/burnlikefire.mp3');
  sounds[3] = loadSound('./assets/bwaaaow_chorus.mp3');
  sounds[4] = loadSound('./assets/cmon.mp3');
  sounds[5] = loadSound('./assets/opera_diva.mp3');
  sounds[6] = loadSound('./assets/my-luv-uv-uv-uv-uv-in.mp3 ');
  sounds[7] = loadSound('./assets/ohh-hoo_yeah.mp3');
}
function setup() {
  // initialize the mltk object and pass the two callback functions used for training and play modes
  mltk = new MLTK(train, play);

  // create the control interface.
  mltk.createControlInterface();

  // Create the canvas to work with.
  createCanvas(windowWidth, windowHeight - 50);
}

function draw() {
  // the draw function is looped every frame.
  background('#f8db40');
  textAlign(CENTER);
  textSize(100);
  textStyle(BOLD);
  fill('#5d35e8');
  if (activeClass != null) {
    text('...', width / 2, height / 2);
  }
  text(activeClass, width / 2, height / 2);

  if (activeClass != lastActiveClass) {
    sounds[activeClass].play();
    lastActiveClass = activeClass;
  }
}

// this funcion runs looped only when you are in train mode and the record button is pressed.
function train() {
  // get the label of the class selected from the board
  let label = mltk.getActiveClass();
  // get some data from the board sensor and use it as training features
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

function gotResults(err, result) {
  if (err) {
    console.log(err);
  } else {
    //take the name of the label identified and store it in the global variable activeClass
    activeClass = result.label;
    play();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 50);
}
