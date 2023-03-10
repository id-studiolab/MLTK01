let canvas;

// create a variable to hold the MLTK object
let mltk;

// a variable for holding the active class:
let activeClass = 0;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight - 50);
  canvas.parent('sketchContainer');
  // initialize the MLTK object passing the two callback functions used for training and play modes.
  mltk = new MLTK(train, play);
  // console.log(mltk);

  // add a button to initiliaze the connection.
  mltk.createControlInterface();
}

function draw() {
  background('#f8db40');
  textAlign(CENTER);
  textSize(30);
  text(activeClass, width / 2, height / 2);
}

// this function will be run in a loop when you are in train mode and the record button is pressed.
function train() {
  // get the label of the class selected from the board
  let label = mltk.getActiveClass();
  console.log(label);

  // get some data from the board sensor and use it as training features
  let features = mltk.getMagnetometerData();
  mltk.addTrainingData(label, features);
}

// this function will be run in a loop when you are in play mode
function play() {
  // get data you want to "classify"
  let features = mltk.getMagnetometerData();

  // pass the data to the function that does classification, once done run the "gotResults" function.
  mltk.classify(features, gotResults);
}

function gotResults(err, results) {
  if (err) {
    console.log(err);
  } else {
    // take the name of the label identified, and store it in the global variable activeClass
    activeClass = results.label;
    play();
  }
}
