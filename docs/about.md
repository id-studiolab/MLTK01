---
layout: default
title: about
nav_order: 1
---

# THE TOOLKIT

MLTK01 is a toolkit aimed at facilitating the design and development of small machine learning projects supported by physical hardware and sensors.

The toolkit is made up of:

- An open source [MLTK01 development board](about.html#mltk-board) also (easily reproducible at home),
- A software library,
- A set of examples that will help you to get started.

<!-- The board comes pre-flashed with a custom firmware which exposes the board bluetooth property and it is intended to function in combination with a webpage running a JavaScript sketch file that includes the MLTK01 library. -->

<span class="highlight">You won't have to write a line of Arduino code. The main logic of your code will be JavaScript running in the browser just like [p5.js](https://p5js.org/) sketches.</span>

## MLTK BOARD

![MLTK Board]({{ site.baseurl}}/assets/board_components.png "MLTK01 Board")

The MLTK board is based on the [Arduino Nano 33 BLE Sense](https://store.arduino.cc/arduino-nano-33-ble-sense){:target="\_blank"}, a small Arduino board equipped with a wide range of embedded sensors:

- **9 axis inertial sensor:** what makes this board ideal for wearable devices
- **humidity, and temperature sensor:** to get highly accurate measurements of the environmental conditions
- **barometric sensor:** you could make a simple weather station
- **microphone:** to capture and analyse sound in real time
- **gesture, proximity, light color and light intensity sensor:** estimate the room’s luminosity, but also whether someone is moving close to the board.

For a full list of the Arduino Nano BLE sense features refer to [the official documentation](https://store.arduino.cc/arduino-nano-33-ble-sense){:target="\_blank"}.

The MLTK Board has a socket to accomodate the Arduino Nano 33 BLE Sense and extends its functionality by providing an easy interface to interact with the Machine Learning library. The interface features:

- A **train/play switch** to go from train mode to play mode and vice versa
- A **rotary encoder** for selecting the class to train
- A **push button** to record new data
- An **RGB led ring** to provide feedbacks
- Two **Grove connectors** to attach external sensors and actuators. (Limited at the moment. You will need to modify the firmware and the library to interface this with external hardware.)

![Board schematics](https://raw.githubusercontent.com/id-studiolab/MLTK01/master/board/circuit.png 'MLTK01 Board Schematics')

The MLTK01 board can be reproduced on a breadboard as shown in the picture below.

![breadboard view]({{ site.baseurl }}/assets/breadboard.png 'MLTK01 Breadboard version')

The board serves as a gateway to the physical world and does not do any processing of machine learning algorithms. Most of the processing is in fact done on a computer (or smartphone) in a browser running a webpage that uses the MLTK library to interface with the board. The board and the browser are connected through Bluetooth Low Energy (BLE).
