/*
EXAMPLE MLTK SKETC STRUCTURE

This is the skeleton of a simple p5.js sketch
which uses MLTK library to connect to the mltk board
and classify the readings from the sensors
 */



//create a variable to store the mltk object
let mltk;
//this variable will be used to store the active class label
let activeClass = "";

function setup() {
  createCanvas( 400, 400 );
  //inizialize the mltk object passing the two callback functions used fot training and play mode
  mltk = new MLTK( train, play );

  //add a button to initialize the connection
  mltk.createControlInterface();

  //create a panel to visualize the data from the board
  //mltk.createmltkPanel();
  //visualize the training data used in each class
  //mltk.createTrainingDataView();
};

function draw() {
  // the draw function only draws the active class to the canvas
  background( 100 );
  textAlign( CENTER );
  textSize( 30 );
  text( activeClass, width / 2, height / 2 );
}

//this functions will be run in loop when you are in train mode and the record button is pressed
function train() {
  //get the label of the class selected from the board
  let label = mltk.getActiveClass();
  //get some data from the board sensor and use it as training features
  let features = mltk.getMagnetometerData();
  mltk.addTrainingData( label, features );
}

//this function will be run in loop when you are in play mode
function play() {
  //get the data you want to "classify"
  let features = mltk.getMagnetometerData();
  //pass the data to the function who does the classification, once done call the "gotResults" callback function
  mltk.classify( features, gotResults );
}

function gotResults( err, result ) {
  if ( err ) {
    console.log( err );
  } else {
    //take the name of the label identified and store it in the global variable activeClass
    activeClass = result.label;
    play();
  }
}

// function mouseClicked() {
//   console.log( "click" );
//
//   if ( mltk.connected ) {
//     mltk.setRGBLed( 0, 255, 0 );
//     for ( var i = 0; i < 8; i++ ) {
//       mltk.setLedRing( i, 225 / 8 * i, 0, 225 / 8 * 8 - i );
//     }
//   } else {
//     console.log( "mltk not connected" );
//   }
// }