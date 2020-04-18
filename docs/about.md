---
layout: default
title: about
nav_order: 1
---

MLTK is a toolkit aimed at facilitating the design and development of small Mahine learnign projects supported by physical hardware and sensors. The toolkit is made of an open source [MLTK development board](http://localhost:4000/about.html#mltk-board) also (easily reproducible at home), a software library, and a set of example that will help you to get started.
The board is not standalone and only works together with a webpage running the MLTK Library.

## MLTK BOARD

![MLTK Board](../assets/IMG_20200418_094108.jpg "MLTK01 Board")

The mltk board is based on the [Aarduino Nano 33 BLE Sense](https://store.arduino.cc/arduino-nano-33-ble-sense){:target="_blank"}
The Arduino Nano 33 BLE Sense comes with a series of embedded sensors:
- 9 axis inertial sensor: what makes this board ideal for wearable devices
- humidity, and temperature sensor: to get highly accurate measurements of the environmental conditions
- barometric sensor: you could make a simple weather station
- microphone: to capture and analyse sound in real time
- gesture, proximity, light color and light intensity sensor : estimate the room’s luminosity, but also whether someone is moving close to the board.
For a full list of the board features refer to [the official documentation](https://store.arduino.cc/arduino-nano-33-ble-sense){:target="_blank"}

The Arduino Nano 33 BLE comes soldered on the bottom of the MLTK breakout board and extends its functionality by providing a easy interface to interact Machine Learning Library.
The interface features:
- **A train/play switch** to go from train mode to play mode and vice versa
- **A rotary encoder** to selecting the class to train
- **A rotary encoder** to selecting the class to train
- **A push button ** to record new data
- **An RGB led ring** to provide feedbacks
- **2 Grove connector** to attach external sensor and actuators (limited at the moment, you will need to modify the firmware and the library to interface this with external hardware)

![Board schematics](https://raw.githubusercontent.com/id-studiolab/MLTK01/master/board/circuit.png "MLTK01 Board Schematics")

The Board serves as a gateway to the physical world and doesn't do any machine learning Algoritm, most of the processing is in fact done on a computer (or smartphone) in a browser running a webpage which uses the MLTK library to interface with the board.
The Board and the browser are connected trough BLE (Bluetooth Low Energy)
