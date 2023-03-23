// a simple sketch which uses the knn classifier to classify a bunch of mouse cohordinates.
// this algorithme is often wrapped in other function provided by the mltk library
// based on a coding train episode

const knnClassifier = ml5.KNNClassifier();
let featureExtractor;

let trainingClass;
let resultClass;

let datasetA = [];
let datasetB = [];

classificationStarted = false;

let mousePosition;

function setup() {
  createCanvas( 400, 400 );
  setupUI();

  trainingClass = "A";

  strokeWeight( 10 );
}

function draw() {
  background( 200 )
  drawDataset();
  drawResult();

  mousePosition = [ mouseX, mouseY ];

  if ( !classificationStarted && Object.keys( knnClassifier.getCount() ).length > 0 ) {
    classify( mousePosition );
    classificationStarted = true;
  }
}

function drawDataset() {
  stroke( 'red' ); // Change the color
  for ( let i = 0; i < datasetA.length; i++ ) {
    point( datasetA[ i ][ 0 ], datasetA[ i ][ 1 ] );
  }

  stroke( 'blue' ); // Change the color
  for ( let i = 0; i < datasetB.length; i++ ) {
    point( datasetB[ i ][ 0 ], datasetB[ i ][ 1 ] );
  }
}

function drawResult() {
  noStroke();
  textAlign( CENTER )
  if ( resultClass == null ) {
    textSize( 20 );
    fill( 'white' );
    text( "click on the screen to add samples", width / 2, height / 2 );
  } else {
    if ( resultClass == "A" ) { fill( 'red' ) } else if ( resultClass == "B" ) { fill( 'blue' ) };
    textSize( 20 );
    text( resultClass, width / 2, height / 2 );
  }
}

function mouseClicked() {
  console.log( mousePosition );
  storePositionToArray( mousePosition )
  knnClassifier.addExample( mousePosition, trainingClass );
  console.log( knnClassifier.getCount() );
}

function storePositionToArray( data ) {
  if ( trainingClass == "A" ) {
    datasetA.push( data );
  } else if ( trainingClass == "B" ) {
    datasetB.push( data );
  }
}

function setupUI() {
  button1 = createButton( 'use class A' );
  button1.mousePressed( function() {
    setClass( "A" );
  } );
  button1.position( width / 2 - 100 - 25, height - 20 );


  button2 = createButton( 'use class B' );
  button2.mousePressed( function() {
    setClass( "B" );
  } );
  button2.position( width / 2 + 100 - 25, height - 20 );

}

function setClass( c ) {
  console.log( "recording on class: " + c )
  trainingClass = c;
}

function classify( data ) {
  // Get the total number of labels from knnClassifier
  const numLabels = knnClassifier.getNumLabels();

  console.log( knnClassifier.getCountByLabel() );

  if ( numLabels <= 0 ) {
    console.error( 'There is no examples in any label' );
    return;
  }
  knnClassifier.classify( data, gotResults );
}

// Show the results
function gotResults( err, result ) {
  // Display any error
  if ( err ) {
    console.error( err );
  } else {

    if ( result.label == "A" ) {
      resultClass = "A";
    } else if ( result.label == "B" ) {
      resultClass = "B";
    }
    knnClassifier.classify( mousePosition, gotResults );

  }
}
