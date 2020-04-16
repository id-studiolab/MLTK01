//create a variable to store the mltk object
let mltk;
//this variable will be used to store the active class label
let activeClass = "";
let lastActiveClass = "";

let sounds = new Array( 8 );

function setup() {
  createCanvas( windowWidth, windowHeight - 50 );
  //inizialize the mltk object passing the two callback functions used fot training and play mode
  mltk = new MLTK( train, play );

  //add a button to initialize the connection
  mltk.createControlInterface();

  sounds[ 0 ] = loadSound( "./assets/are_you_ready.mp3" )
  sounds[ 1 ] = loadSound( "./assets/baby_baby_baybeh.mp3" )
  sounds[ 2 ] = loadSound( "./assets/burnlikefire.mp3" )
  sounds[ 3 ] = loadSound( "./assets/bwaaaow_chorus.mp3" )
  sounds[ 4 ] = loadSound( "./assets/cmon.mp3" )
  sounds[ 5 ] = loadSound( "./assets/opera_diva.mp3" )
  sounds[ 6 ] = loadSound( "./assets/my-luv-uv-uv-uv-uv-in.mp3 " )
  sounds[ 7 ] = loadSound( "./assets/ohh-hoo_yeah.mp3" )
};

function draw() {
  // the draw function only draws the active class to the canvas
  background( '#f8db40' );
  textAlign( CENTER );
  textSize( 80 );
  fill( "#5d35e8" );
  text( activeClass, width / 2, height / 2 );

  if ( activeClass != lastActiveClass ) {
    sounds[ activeClass ].play();
    lastActiveClass = activeClass;
  }
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