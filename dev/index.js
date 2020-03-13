let pino;


function setup() {
  createCanvas( 400, 400 );
  frameRate( 3 )

  pino = new Pino( train, classify );
  pino.createPinoPanel();
};

function draw() {
  background( 100 );

  // if ( pino.connected ) {
  //   if ( pino.isTrainModeActive() ) { //I'm in train mode
  //     if ( pino.isRecordButtonPressed() ) { //record button is pressed
  //       let label = pino.getActiveClass();
  //       let features = pino.getColorimeterData();
  //       pino.addTrainingData( label, features );
  //     }
  //     classificationStarted = false;
  //   }
  //
  //   if ( pino.isPlayModeActive() && !classificationStarted ) {
  //     console.log( "start classification" );
  //     classificationStarted = true;
  //     classify();
  //   }
  // }
}

function train() {
  let label = pino.getActiveClass();
  let features = pino.getColorimeterData();
  pino.addTrainingData( label, features );
}

function classify() {
  let features = pino.getColorimeterData();
  pino.classify( features, gotResults );
}

function gotResults( err, result ) {
  if ( err ) {
    console.log( err );
  } else {
    console.log( result );
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