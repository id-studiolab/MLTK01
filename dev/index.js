let pino;

function setup() {
  createCanvas( 600, 600 );
  frameRate( 3 );

  pino = new Pino();
  pino.createPinoPanel();

};

function draw() {
  background( 100 );

  if ( pino.connected ) {
    console.log( "connected" );
    pino.setRGBLed( 0, 255, 0 );
  } else {}

};

window.windowResized = () => {
  resizeCanvas( windowWidth, windowHeight );
};