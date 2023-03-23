---
layout: default
title: getting started
nav_order: 1
---

# Getting started

This guide will walk you through the steps of creating your first MLTK01 sketch.

## 0\_ Prerequisites

If you have no previous experience creating a sketch using p5.js or working in JavaScript, I recommend you get familiar with the process before this tutorial. [This Youtube playlist](https://www.youtube.com/playlist?list=PLRqwX-V7Uu6Zy51Q-x9tMWIv9cueOFTFA) from The Coding Train is a good place to start.

## 1\_ Tools

For this tutorial, you will need:

- The **🤖MLTK01 board**. If you do not have one, you can recreate it using a breadboard as shown in the [about page](../about).
- A **web browser**. Currently the [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) is only supported by Google Chrome so please make sure to run your sketch with that browser.
- A **place to write your code**. You can use your favorite editor, like Atom or VSCode, or the [p5.js web editor](https://editor.p5js.org/).

## 2\_ Project Structure

As with any other p5.js sketch you will need to create two main files for your project: `index.html` and `sketch.js`. If you are working with the p5.js web editor, these files are already made for you.

![alt text]({{ site.baseurl}}/assets/file-structure.png "Necessary file structure for an MLTK sketch includes index.html file and a sketch.js file")

## 3\_ Importing Libraries

To create our first sketch we will need to import a few libraries. Copy and paste the following code block into your `index.html` file.

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Include p5js library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/addons/p5.sound.min.js"></script>

    <!-- Include ml5js library -->
    <script src="https://unpkg.com/ml5@latest/dist/ml5.min.js" type="text/javascript"></script>

    <!-- Include the MLTK library -->
    <script src="https://cdn.jsdelivr.net/gh/id-studiolab/MLTK01/library/mltk.js"></script>

    <!-- Include the MLTK.css file. It provides some styling for the UI elements that come with the library. -->
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.jsdelivr.net/gh/id-studiolab/MLTK01@latest/library/mltk.min.css"
    />
    <meta charset="UTF-8" />
    <title>MLTK boilerplate</title>
  </head>
  <body>
    <!-- These 3 divs in the body will be filled in by the library -->
    <div id="headerContainer"></div>
    <div id="sketchContainer"></div>
    <div id="toolsContainer"></div>

    <!-- Include the main js sketch -->
    <script src="./sketch.js"></script>
  </body>
</html>
```

This code block imports the p5.js, ML5.js, and MLTK libraries. It also links our main sketch.js file and a css file that will be used to render a few of the UI utilities from the MLTK library.

To correctly render the UI elements, we create 3 div elements inside the body of the page.

## 4\_ JS Code Structure

It's now time to look at the core of the project contained in the JS file.

Let's start by creating the two main functions of any p5.js sketch:`void setup()` and `void loop()`. To make sure that our p5.js canvas elements will be created inside the sketch container we use the parent function on the canvas element.

```javascript
function setup() {
  // make sure canvas elements will be created within the sketchContainer div.
  let canvas = createCanvas(windowWidth, windowHeight - 50);
  canvas.parent('sketchContainer');
}

function draw() {}
```

## 5\_ The MLTK object

To access the features provided by the MLTK library we need to create an MLTK object.

```javascript
// Create a variable to store the MLTK object
let mltk;

function setup() {
  // make sure canvas elements will be created within the sketchContainer div.
  let canvas = createCanvas(windowWidth, windowHeight - 50);
  canvas.parent('sketchContainer');

  // initialize the MLTK object and pass two callback functions to be used for training and play modes
  mltk = new MLTK(train, play);
}
```

The MLTK constructor function takes two arguments as input, namely two callback functions that will be called accordingly when the board is in either train or play mode. Let's add these two functions to our sketch; later we will see how to use them.

```javascript
// this function will run in a loop when you are in train mode and the record button is pressed.
function train() {}

// this function will run in a loop when you are in play mode.
function play() {}
```

Lastly we need a way to initialize the connection between the browser and the board.

Because of the BLE specification, the initialization of a BLE connection can only be initialized by user action. Hence, we need to a button for that. To simplify the process of creating this simple UI, the MLTK library comes with a function that creates the needed interface. Add `mltk.createControlInterface();` to the setup function after the constructor.

Below is the full skeleton of our `sketch.js` file:

```javascript
let mltk;
function setup() {
  // make sure canvas elements will be created within the sketchContainer div.
  let canvas = createCanvas(windowWidth, windowHeight - 50);
  canvas.parent('sketchContainer');

  // initialize the MLTK object and pass two callback functions to be used in training and play modes
  mltk = new MLTK(train, play);

  // Add buttons to initiate/end the BLE connection.
  mltk.createControlInterface();
}

function draw() {
  background(10);
}

// this function will run in a loop when you are in train mode and the record button is pressed.
function train() {}

// this function will run in a loop when you are in play mode.
function play() {}
```

After pressing the connect button, a popup will appear, inviting the user to select a BLE device to connect to. At this point, connecting will not do anything; we'll take care of it later. If you cannot see the option to connect to the MLTK board, make sure Bluetooth is enabled on your computer.

![MLTK UI]({{ site.baseurl}}/assets/connect-button.png "connect UI")

## 6\_ Train mode

Now that most of the code skeleton is ready, we can focus on the MLTK API and in particular the training function.

![how to]({{ site.baseurl}}/assets/howto.png "How to use the MLTK board")

First, let's review the training workflow of the toolkit:

1. When the board is in the train mode we can classify data coming from the MLTK board or the computer camera into 8 different classes.
2. We can select a specific class by turning the rotary encoder on the board. The LED ring will indicate which class we have selected to train.
3. To actually train the model, press the "record" button on the board. While the record button is pressed, samples from the sensors are be read and classified in the corresponding class that was previously selected via the rotary encoder.

The train function we created earlier will be invoked repeatedly when the board is in train mode and the record button is being pressed. We just need to fill it in with a few line of code:

```javascript
// this function will run in a loop when you are in train mode and the record button is pressed.
function train() {
  // get the label of the class selected from the board
  let label = mltk.getActiveClass();

  //get some data from the board sensor and use it as training features.
  let features = mltk.getMagnetometerData();
  mltk.addTrainingData(label, features);
}
```

Let's break down what is happening in this block:

- The `mltk.getActiveClass()` reads the ID of the active class selected trough the rotary encoder and store it in a local variable called `label`.
- The `mltk.getMagnetometerData()` collects some sensor data from the board — in this example we are fetching the magnetometer data — and stores it in the features variable.
- Lastly we invoke `mltk.addTrainingData( label, features )` which will add the training data to our dataset labelling the dataset with the specified label.

Keep in mind that <span class="highlight">we can pass any multidimensional array as a feature</span> to the `addTrainingData()` function. Things become more exciting when we combine different data inputs.

## 7\_ Play mode

Now that we covered most of the things that we need to know about the train function we can look at what should happen with the play function.

Similarly to the train function, the play function is invoked automatically when the board is connected and the mode is set to "play". In play mode, we don't have to use any button to read new data; the play function is invoked automatically in a loop.

The general logic of play mode is:

1. Read data from the sensors
1. Run the classification algorithm on the data to identify to which trained class the data from the sensor is closest to.
1. Light up the corresponding LED on the MLTK board. Similarly to the train function, the play function will need to perform a series of actions.

In code, the logic looks like:

```javascript
// this function will run in a loop when you are in play mode.
function play() {
  // get the data you want to "classify"
  let features = mltk.getMagnetometerData();

  // pass the data to the function who does the classification, once done call the "gotResults" callback function
  mltk.classify(features, gotResults);
}

let activeClass = 0;

function gotResults(err, result) {
  if (err) {
    console.log(err);
  } else {
    // take the name of the label identified and store it in the global variable activeClass
    activeClass = result.label;
    play();
  }
}
```

Notice that the `mltk.classify( features, gotResults )` function takes two arguments:

- A multidimensional array representing a feature
- And a callback function that will be invoked once the classify function will be done running the data through the created model.

In the code snippet above, `gotResults( err, result )` will be invoked when the classification will be done. The result objects returned by the callback will return the label we used for the training, as well as the probability that the given features belongs to that label.

The library will automatically turn on the appropriate LED from the LED ring on the board, but to do something with the data being classified it is handy to save the returned label into a global variable. In the code snippet above this global variable is `activeClass`

## 8\_ Visualize the label on screen

At this stage the sketch should already be able to interface with the board, train some features and visualize the result from the classification when in play mode. However, to make the example code a bit more complete let's also visualize the selected label on screen.

```javascript
function draw() {
  // the draw function only draws the active class to the canvas
  background('#f8db40');
  textAlign(CENTER);
  textSize(30);
  text(activeClass, width / 2, height / 2);
}
```

Here is the final version of all the code in sketch.js:

```javascript
let mltk;
function setup() {
  // make sure canvas elements will be created within the sketchContainer div.
  let canvas = createCanvas(windowWidth, windowHeight - 50);
  canvas.parent('sketchContainer');

  // initialize the MLTK object and pass two callback functions to be used in training and play modes
  mltk = new MLTK(train, play);

  // Add buttons to initiate/end the BLE connection.
  mltk.createControlInterface();
}

function draw() {
  // the draw function only draws the active class to the canvas
  background('#f8db40');
  textAlign(CENTER);
  textSize(30);
  text(activeClass, width / 2, height / 2);
}

// this function will run in a loop when you are in train mode and the record button is pressed.
function train() {
  // get the label of the class selected from the board
  let label = mltk.getActiveClass();

  //get some data from the board sensor and use it as training features.
  let features = mltk.getMagnetometerData();
  mltk.addTrainingData(label, features);
}

// this function will run in a loop when you are in play mode.
function play() {
  // get the data you want to "classify"
  let features = mltk.getMagnetometerData();

  // pass the data to the function who does the classification, once done call the "gotResults" callback function
  mltk.classify(features, gotResults);
}

let activeClass = 0;

function gotResults(err, result) {
  if (err) {
    console.log(err);
  } else {
    // take the name of the label identified and store it in the global variable activeClass
    activeClass = result.label;
    play();
  }
}
```

## 9\_ Running the sketch

We are now ready to run the sketch and play with it:

1. Press the connect button on the interface
2. Enter train mode by toggling the mode switch
3. Select a class with the rotary encoder and record some samples
4. Change the board orientation
5. Select a second class and record some more sample
6. Set the mode switch to play mode and
7. See the result of the classification on the board and on the screen
8. Hurray!

## 10\_ Get creative!

You are now ready to get creative and explore all the functionalities of the library.

Explore the [examples section](examples.html) to find more inspiration and have a look at the api page for a list of all the library features.

You can always start your projects by duplicating this [boilerplate sketch in the p5.js editor](https://editor.p5js.org/lennymd/sketches/J_3tTBE-o) or by looking at [the boilerplate sketch files on Github](https://github.com/id-studiolab/MLTK01/tree/master/examples/boilerplate).
