let pino;

let activeClass = "";

function setup() {
  createCanvas( 400, 400 );
  frameRate( 3 )

  pino = new Pino( train, classify );
  pino.createPinoPanel();
  pino.createTrainingDataView();
};

function draw() {
  background( 100 );

  textAlign( CENTER );
  textSize( 30 );
  text( activeClass, width / 2, height / 2 );
}

function train() {
  let label = pino.getActiveClass();
  let features = pino.getMagnetometerData();
  pino.addTrainingData( label, features );
}

function classify() {
  let features = pino.getMagnetometerData();
  console.log( features );
  pino.classify( features, gotResults );
}

function gotResults( err, result ) {
  if ( err ) {
    console.log( err );
  } else {
    console.log( result );
    activeClass = result.label;
    classify();
  }
}

function mouseClicked() {
  console.log( "click" );

  if ( pino.connected ) {
    pino.setRGBLed( 0, 255, 0 );
    for ( var i = 0; i < 8; i++ ) {
      pino.setLedRing( i, 225 / 8 * i, 0, 225 / 8 * 8 - i );
    }
  } else {
    console.log( "pino not connected" );
  }
}