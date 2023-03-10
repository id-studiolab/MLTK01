/*
This example shows how to use ml5js and mobilenet to do "transfer learning".
The goal is to build software that allows us to teach our algorithm to recognize specific patterns.

Once the algorithm has been trained it is also possible to save the generated model for future use.

Widely inspired by Teachable Machine https://teachablemachine.withgoogle.com

Inspired by shiffman's coding train course about ml5js https://www.youtube.com/watch?v=jmznx0Q1fP0&t=4s
*/

let mobilenet;

let label = '';
let prob = '';

let classifier;

let class1Btn;
let class2Btn;
let class3Btn;

let trainButton;
let runButton;

let saveBtn;

function preload() {}

let mltk;

let isTrained = false;
let trainStarted = false;

let lastLabel;
let _label;
let _prevLabel = 9999;

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight - 50);

  canvas.parent('sketchContainer');

  //inizialize the mltk object passing the two callback functions used for training and play mode
  mltk = new MLTK(train, play, onConnect);
  mltk.trainContinuosly = false;

  //add a button to initialize the connection
  mltk.createControlInterface();

  background(100);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Initialize the Image Classifier method with MobileNet and the video as the second argument

  mobilenet = ml5.featureExtractor('MobileNet', modelReady);
  // Create a new classifier using those features and give the video we want to use
  const options = {numLabels: 8};
  classifier = mobilenet.classification(video, options, videoReady);
}

function draw() {
  background(0);
  imageMode(CENTER);
  image(video, width / 2, height / 2, 640, 480);
  fill(255);
  textSize(20);
  text(label, 10, height - 50);
  text(prob, 10, height - 25);

  rotateServoWithClass();
}

function keyTyped() {
  if (key === '0') {
    // _label = 0;
    mltk.writeToIO(A0, 90);
  } else if (key === '1') {
    // _label = 1;
    mltk.writeToIO(A0, 170);
  } else if (key === '2') {
    // _label = 2;
    mltk.writeToIO(A0, 10);
  }
  // console.log(_label);
}

function rotateServoWithClass() {
  if (mltk.isConnected()) {
    label = mltk.getActiveClass();
    moveServo();
    // console.log(`Active now: ${label}`);
  }
}

function onConnect() {
  mltk.setIO(A0, SERVO);
  console.log('initiated Servo');
}

function moveServoToPosition(index) {
  let servoPosition = 180 - floor((180 / 7) * index);
  mltk.writeToIO(A0, servoPosition);
}

function modelReady() {
  console.log('model is ready');
}

function videoReady() {
  console.log('video is ready');
}

function whileTraining(loss) {
  if (loss == null) {
    console.log('training done');
    isTrained = true;
    trainStarted = false;
    play();
  } else {
    console.log(loss);
  }
}

function train() {
  label = mltk.getActiveClass();
  classifier.addImage(label);
  console.log('adding sample to label: ' + label);
  isTrained = false;
}

function play() {
  if (!isTrained && !trainStarted) {
    classifier.train(whileTraining);
    trainStarted = true;
    console.log('training!');
  } else {
    classifier.classify(gotResults);
  }
}

// by default you want error as a first parameter of the callback.
function gotResults(error, results) {
  if (error) {
    console.error(error);
  } else {
    //console.log(results);
    label = results[0].label;
    prob = results[0].confidence;
    //console.log (label)
    console.log(mltk.isPlayModeActive());
    moveServo();
    mltk.setClass(parseInt(label));
    if (mltk.isPlayModeActive()) {
      //need this little delay here to give enough time to the BLE to update it's properties
      setTimeout(function () {
        play();
      }, 100);
    }
  }
}

function moveServo() {
  // if current label is different from lastLabel seen, move the servo. Then make the current label the lastLabel.
  if (lastLabel != label) {
    moveServoToPosition(parseInt(label));
    lastLabel = label;
  }
}
