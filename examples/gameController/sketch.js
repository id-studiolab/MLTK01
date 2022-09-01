//create a variable to store the mltk object
let mltk;
//this variable will be used to store the active class label
let activeClass;
let lastActiveClass;

let direction = 0;

let ballPosition={}
let acceleration=0

function setup() {
  //inizialize the mltk object passing the two callback functions used fot training and play mode
  mltk = new MLTK( train, play );

  //add a button to initialize the connection
  mltk.createControlInterface();

  // creating the canvas fter the control interface makes the bar appear on top.
  createCanvas( windowWidth, windowHeight - 50 );

  ballPosition.x=width/2
  ballPosition.y=height/2
};

function draw() {
  // the draw function only draws the active class to the canvas
  background( '#101010' );
  textAlign( LEFT );
  textSize( 20 );
  fill( "#df317a" );
  drawActiveClass();
  updateBallPosition();
  drawBall();

}

function drawActiveClass(){
    text( "active class: " + activeClass, 20, 30 );
}

function drawBall(){
  ellipse (ballPosition.x,ballPosition.y,50,50)
}

function keyTyped() {
  if (key === '0') {
  ballPosition.x=width/2
  } else if (key === '1') {
    activeClass = 3;
  } else if (key === '2') {
    activeClass = 1;
  }
}


function updateBallPosition(){
  switch (activeClass) {
    case 0:
      acceleration = 0
      break;
    case 1:
      acceleration = -1
      break;
    case 2:
      acceleration = -2
      break;
    case 7:
      acceleration = 1
      break;
    case 6:
      acceleration = 2
      break;
    default:
      acceleration=0
      break;
  }
  ballPosition.x+=acceleration
  //console.log(activeClass,acceleration)
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
    activeClass = parseInt(result.label);
    play();
  }
}

function windowResized() {
  resizeCanvas( windowWidth, windowHeight - 50 );
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
