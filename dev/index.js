let pino;

function setup() {
  createCanvas( 600, 600 );
  frameRate( 3 );

  pino = new Pino();
  pino.createPinoPanel();

};

function draw() {
  background( 100 );
};

window.windowResized = () => {
  resizeCanvas( windowWidth, windowHeight );
};