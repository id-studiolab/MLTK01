// create a variable to store the mltk object
let mltk;

// these variables are used to keep track of the activeClass.
let activeClass = '';
let lastActiveClass = '';

let sounds = new Array(8);

let activeclass = 0;

function setup() {
  // initialize the mltk object and pass the two callback functions used for training and play modes
  mltk = new MLTK(train, play);

  // create the control interface.
  mltk.createControlInterface();

  // Create the canvas to work with.
  createCanvas(windowWidth, windowHeight - 50);

  setInterval(setClass,100)
}

function train(){

}

function play(){

}



function setClass(){
  if (mltk.isConnected()){
    mltk.setClass(activeclass);
    console.log("class="+activeclass)
  }
  if (activeclass<7){
    activeclass++;
  }else{
    activeclass=0;
  }
 
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 50);
}
