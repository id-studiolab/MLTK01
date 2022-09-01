//create a variable to store the mltk object
let mltk;
//this variable will be used to store the active class label
let activeClass = "";
let lastActiveClass = "";

let sounds = new Array( 8 );

function setup() {
  //inizialize the mltk object passing the two callback functions used fot training and play mode
  mltk = new MLTK( train, play, onConnect );

  //add a button to initialize the connection
  mltk.createControlInterface();

  // creating the canvas fter the control interface makes the bar appear on top.
  createCanvas( windowWidth, windowHeight - 50 );
};

function draw() {
  // the draw function only draws the active class to the canvas
  background( '#f8db40' );

  textAlign( CENTER );
  textSize( 100 );
  textStyle( BOLD );
  fill( "#5d35e8" );

  if ( mltk.isConnected() ) {
    text( "connected", width / 2, height / 2 );
  }

}

let servoposition = 0;
let servoSpeed = 5;

function servosweepUpdate() {
  servoposition += servoSpeed;
  if ( servoposition > 180 || servoposition < 0 ) {
    servoSpeed *= -1;
  }
  servoposition=constrain(servoposition,0,180)
  mltk.writeToIO( A0,servoposition );
  console.log(servoposition)
}

function onConnect() {
  mltk.setIO( A0, SERVO );
  console.log( "connected callback" );

  setInterval( servosweepUpdate, 100 );
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

function windowResized() {
  resizeCanvas( windowWidth, windowHeight - 50 );
}
