---
layout: default
title: api
nav_order: 5
---

# MLTK API
* * *


<a name="Mltk"></a>

## Mltk
**Kind**: global class  
<a name="new_Mltk_new"></a>

### new Mltk(gp, props)
Note: MLTK main class


| Param | Type | Description |
| --- | --- | --- |
| gp | <code>Client</code> | parent g11n-pipeline client object |
| props | <code>Object</code> | properties to inherit |

**Example**  
```js
let mltk;
function setup() {
 //inizialize the mltk object passing the two callback functions used fot training and play mode
 mltk = new Mltk( train, play );
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
