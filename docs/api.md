---
layout: default
title: api
nav_order: 5
---
# MLTK API
* * *
{{>main}}

**Kind**: global class  

* [MLTK](#MLTK)
    * [new MLTK(TrainFunction, PlayFunction, [onConnect], [onDisconnect])](#new_MLTK_new)
    * _ML_
        * [.addTrainingData(label, features)](#MLTK+addTrainingData)
        * [.classify(features, callback)](#MLTK+classify)
    * _MLTK BOARD API_
        * [.isConnected()](#MLTK+isConnected) ⇒ <code>boolean</code>
        * [.isTrainModeActive()](#MLTK+isTrainModeActive) ⇒ <code>boolean</code>
        * [.isPlayModeActive()](#MLTK+isPlayModeActive) ⇒ <code>boolean</code>
        * [.isRecordButtonPressed()](#MLTK+isRecordButtonPressed) ⇒ <code>boolean</code>
        * [.getColorimeterData()](#MLTK+getColorimeterData) ⇒ <code>Array</code>
        * [.getGyroscopeData()](#MLTK+getGyroscopeData) ⇒ <code>Array</code>
        * [.getMagnetometerData()](#MLTK+getMagnetometerData) ⇒ <code>Array</code>
        * [.getActiveClass()](#MLTK+getActiveClass) ⇒ <code>Number</code>
        * [.setRGBLed(r, g, b)](#MLTK+setRGBLed)
        * [.setLedRing(index, r, g, b)](#MLTK+setLedRing)
    * _UI_
        * [.updateStatusMsg(message)](#MLTK+updateStatusMsg)
        * [.createControlInterface()](#MLTK+createControlInterface)
        * [.createLiveDataView()](#MLTK+createLiveDataView)
        * [.createTrainingDataView()](#MLTK+createTrainingDataView)

<a name="new_MLTK_new"></a>

### new MLTK(TrainFunction, PlayFunction, [onConnect], [onDisconnect])
MLTK main class


| Param | Type | Description |
| --- | --- | --- |
| TrainFunction | <code>function</code> | The function used for the training |
| PlayFunction | <code>function</code> | The function used in play mode |
| [onConnect] | <code>function</code> | The function to be called after the boards connects |
| [onDisconnect] | <code>function</code> | The function to be called after the board disconnects |

**Example**  
```js
let mltk;
function setup() {
 //inizialize the mltk object passing the two callback functions used fot training and play mode
 mltk = new Mltk( train, play );

 //add a button to initialize the connection
 mltk.createMLTKInterface();
};

function draw() {
}

function train() {
 //get the label of the class selected from the board
 let label = mltk.getActiveClass();
 //get some data from the board sensor and use it as training features
 let features = mltk.getMagnetometerData();
 mltk.addTrainingData( label, features );
}

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
```
<a name="MLTK+addTrainingData"></a>

### mltk.addTrainingData(label, features)
add some training data to a specific class

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Category**: ML  

| Param | Type | Description |
| --- | --- | --- |
| label | <code>String</code> | the label of the class to which associate training data |
| features | <code>Array</code> | the training data |

**Example**  
```js
function train() {
   //get the label of the class selected from the board
   let label = mltk.getActiveClass();
   //get some data from the board sensor and use it as training features
   let features = mltk.getMagnetometerData();
   mltk.addTrainingData( label, features );
}
```
<a name="MLTK+classify"></a>

### mltk.classify(features, callback)
Run a set of data trough the trained classifier and assess to which class the data belongs to

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Category**: ML  

| Param | Type | Description |
| --- | --- | --- |
| features | <code>Array</code> | the data to be classified data |
| callback | <code>function</code> | the function to invoke when the classification has produced some results |

**Example**  
```js
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
```
<a name="MLTK+isConnected"></a>

### mltk.isConnected() ⇒ <code>boolean</code>
returns true if the mltk board is connected

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Returns**: <code>boolean</code> - TRUE when MLTK board is connected  
**Category**: MLTK BOARD API  
<a name="MLTK+isTrainModeActive"></a>

### mltk.isTrainModeActive() ⇒ <code>boolean</code>
returns true if the train/play switch on the mltk board is set to TRAIN

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Returns**: <code>boolean</code> - TRUE when MLTK board is set to TRAIN  
**Category**: MLTK BOARD API  
<a name="MLTK+isPlayModeActive"></a>

### mltk.isPlayModeActive() ⇒ <code>boolean</code>
returns true if the train/play switch on the mltk board is set to PLAY

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Returns**: <code>boolean</code> - TRUE when MLTK board is set to PLAY  
**Category**: MLTK BOARD API  
<a name="MLTK+isRecordButtonPressed"></a>

### mltk.isRecordButtonPressed() ⇒ <code>boolean</code>
returns true if the record button on the mltk board is pressed

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Returns**: <code>boolean</code> - TRUE when train button is pressed  
**Category**: MLTK BOARD API  
<a name="MLTK+getColorimeterData"></a>

### mltk.getColorimeterData() ⇒ <code>Array</code>
Returns an array containing the colorimeter data.

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Returns**: <code>Array</code> - [r,g,b] Array containing red green and blue value as measured from the MLTK onboard colorimeter  
**Category**: MLTK BOARD API  
<a name="MLTK+getGyroscopeData"></a>

### mltk.getGyroscopeData() ⇒ <code>Array</code>
Returns an array containing the gyroscope data.

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Returns**: <code>Array</code> - [Gx,Gy,Gz] Array containing the rotational velocity on the 3 axis as measured by the on board LSM9DS1 IMU  
**Category**: MLTK BOARD API  
<a name="MLTK+getMagnetometerData"></a>

### mltk.getMagnetometerData() ⇒ <code>Array</code>
Returns an array containing the Magnetometer data.

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Returns**: <code>Array</code> - [Gx,Gy,Gz] Array containing the measured magnetic field measured by the LSM9DS1 IMU  
**Category**: MLTK BOARD API  
<a name="MLTK+getActiveClass"></a>

### mltk.getActiveClass() ⇒ <code>Number</code>
Returns the id of the selected class.

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Returns**: <code>Number</code> - The number of the selected class (also shown with the on board led)  
**Category**: MLTK BOARD API  
<a name="MLTK+setRGBLed"></a>

### mltk.setRGBLed(r, g, b)
Set the color of the rgb led on the Arduino BLE sense.

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Category**: MLTK BOARD API  

| Param | Type | Description |
| --- | --- | --- |
| r | <code>Number</code> | The value of the red component [0-255] |
| g | <code>Number</code> | The value of the green component [0-255] |
| b | <code>Number</code> | The value of the blue component [0-255] |

<a name="MLTK+setLedRing"></a>

### mltk.setLedRing(index, r, g, b)
Set the color of the leds on the MLTK board.

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Category**: MLTK BOARD API  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Number</code> | The led we want to change color to [0-7] |
| r | <code>Number</code> | The value of the red component [0-255] |
| g | <code>Number</code> | The value of the green component [0-255] |
| b | <code>Number</code> | The value of the blue component [0-255] |

<a name="MLTK+updateStatusMsg"></a>

### mltk.updateStatusMsg(message)
Create the connect disconnect button and visualize the connection status

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Category**: UI  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | message to display in the MLTK interface return {void} |

<a name="MLTK+createControlInterface"></a>

### mltk.createControlInterface()
Create the connect disconnect button and visualize the connection status

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Category**: UI  
**Example**  
```js
mltk.createControlInterface();
```
<a name="MLTK+createLiveDataView"></a>

### mltk.createLiveDataView()
Visualizes the data from the sensors on the MLTK board.

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Category**: UI  
<a name="MLTK+createTrainingDataView"></a>

### mltk.createTrainingDataView()
Visualize the data recorded in the 8 classes

**Kind**: instance method of [<code>MLTK</code>](#MLTK)  
**Category**: UI  
