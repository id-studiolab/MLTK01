---
layout: default
title: getting started
nav_order: 1
---


# Getting started
this guide will walk you trough the basics steps you will need to take to create you firts MLTK01 project.

## 0. Prerequisites
If you never had experience with writing a p5.js sketch or any js code I higly reccommend to get familiar it before getting started with this. [Watch a couple of this videos and you will be ready to go](https://www.youtube.com/playlist?list=PLRqwX-V7Uu6Zy51Q-x9tMWIv9cueOFTFA).

## 1. Tools
you will only need the 🤖MLTK01 board and a web browser.

<span class="higlight">currently the web bluetooth api are only supported by Google Chrome so please make sure to run your code with that</span>

You can write the code in your favourite editor or use the handy online [p5.js editor](https://editor.p5js.org/).

## 2. project structure
As any other p5.js sketch you will need to create two main files for your project: index.html and sketch.js

![alt text](./assets/file-structure.png "file structure")


## 3. Importing Libraries
To create our first sketch we will need to import a couple of libraries. Copy paste the following piece of code in your index.html file.

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

    <!-- Include the main js sketch -->
    <script src="./sketch.js"></script>

    <!-- Some styling for the UI elements coming with the library -->
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/id-studiolab/MLTK01/library/mltk.css">

    <meta charset="UTF-8" />
    <title>MLTK BOILERPLATE</title>
  </head>

    <!-- These 3 divs in the body will be filled in by the library -->
  <body>
    <div id="headerContainer"></div>
    <div id="sketchContainer"></div>
    <div id="ToolsContainer"></div>
  </body>
</html>
```
The code above imports the p5.js, the ml5js and the MLTK library; links our main js sketch file and fetches some stylesheet to render a few UI utilities coming with the MLTK library.
To correctly render the UI elements 3 html divs needs to be created inside the body of the html page.

## 4. js code structure
It's now time to look at the core of the project contained in the js file.

Let's start creating the two main function of any p5.js file: `void setup()` and `void loop()`, to make sure that our p5.js canvas elements will be created inside the sketch container we use the parent function on the canvas element.

```javascript
function setup() {
  var canvas = createCanvas( windowWidth, windowHeight - 50 );
  canvas.parent( 'sketchContainer' );
}

function draw() {
}
```
## 5. the MLTK object
To access the features provided by the MLTK library we need to create a MLTK object.

```javascript
//create a variable to store the mltk object
let mltk;

function setup() {
  var canvas = createCanvas( windowWidth, windowHeight - 50 );
  canvas.parent( 'sketchContainer' );

  //inizialize the mltk object passing the two callback functions used fot training and play mode
  mltk = new MLTK( train, play );
}
```

As you can see, the MLTK constructor function takes two arguments as input, namely two callback functions that will be called accordingly when the board is in train or play mode.  Let's start adding those two function to our sketch, we are going to see later on how to use them.

```javascript
//this functions will be run in loop when you are in train mode and the record button is pressed
function train() {

}

//this function will be run in loop when you are in play mode
function play() {

}
```
Lastly we need a way to initialize the connection between the browser and the board.
Because of the BLE specification, for security issues, the initialization of a ble connection can only be initialized by a user action. Hence, we need to add a button for that.
To simplify the process of creating this simple UI all the time, the MLTK comes with a handy function that creates all the needed interface. add `mltk.createControlInterface();` inside the setup after the constructor function.

Here the full skeleton of the app

```javascript
let mltk;
function setup() {
  var canvas = createCanvas(windowWidth, windowHeight - 50);

  canvas.parent('sketchContainer');

  //inizialize the mltk object passing the two callback functions used for training and play mode
  mltk = new MLTK(train, play);

  //add a button to initialize the connection
  mltk.createControlInterface();
}

function draw() {
  background(10); 
}

//this functions will be run in loop when you are in train mode and the record button is pressed
function train() {

}

//this function will be run in loop when you are in play mode
function play() {

}
```
