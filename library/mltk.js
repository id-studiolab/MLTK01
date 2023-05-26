let A0 = 0;
let A5 = 5;

let INPUT = 0;
let OUTPUT = 1;
let SERVO = 2;

//how often do we want to collect new samples to train and how often do we want to get a classification result
let trainClassifyInterval = 100;

//how often do we want ble to poll properties value
let pollingInterval = 500;

class MLTK {
  /**
   * MLTK main class
   * @param {Function} TrainFunction - The function used for the training
   * @param {Function} PlayFunction - The function used in play mode
   * @param {Function} [onConnect] - The function to be called after the boards connects
   * @param {Function} [onDisconnect] - The function to be called after the board disconnects

   * @typicalname mltk
   * @example
   *
   * let mltk;
   * function setup() {
   *  //inizialize the mltk object passing the two callback functions used fot training and play mode
   *  mltk = new Mltk( train, play );
   *
   *  //add a button to initialize the connection
   *  mltk.createMLTKInterface();
   * };
   *
   * function draw() {
   * }
   *
   * function train() {
   *  //get the label of the class selected from the board
   *  let label = mltk.getActiveClass();
   *  //get some data from the board sensor and use it as training features
   *  let features = mltk.getMagnetometerData();
   *  mltk.addTrainingData( label, features );
   * }
   *
   * function play() {
   *  //get the data you want to "classify"
   *  let features = mltk.getMagnetometerData();
   *  //pass the data to the function who does the classification, once done call the "gotResults" callback function
   *  mltk.classify( features, gotResults );
   * }
   *
   * function gotResults( err, result ) {
   *  if ( err ) {
   *    console.log( err );
   *  } else {
   *    //take the name of the label identified and store it in the global variable activeClass
   *    activeClass = result.label;
   *    play();
   *  }
   * }
   */
  constructor(trainfn, classifyfn, onConnect = null, onDisconnect = null) {
    this.connected = false;
    this.boardProperties = {
      ambientLight: {
        uuid: '6fbe1da7-2001-44de-92c4-bb6e04fb0212',
        properties: ['BLENotify'],
        structure: ['Uint16'],
        data: {ambientLight: []},
        maxRecords: 1,
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
      },
      colorimeter: {
        uuid: '6fbe1da7-2002-44de-92c4-bb6e04fb0212',
        properties: ['BLENotify'],
        structure: ['Uint16', 'Uint16', 'Uint16'],
        data: {R: [], G: [], B: []},
        maxRecords: 1,
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
      },
      proximity: {
        uuid: '6fbe1da7-2003-44de-92c4-bb6e04fb0212',
        properties: ['BLENotify'],
        structure: ['Uint8'],
        data: {proximity: []},
        maxRecords: 1,
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
      },
      accelerometer: {
        uuid: '6fbe1da7-3001-44de-92c4-bb6e04fb0212',
        properties: ['BLENotify'],
        structure: ['Float32', 'Float32', 'Float32'],
        data: {Ax: [], Ay: [], Az: []},
        maxRecords: 10,
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
      },
      gyroscope: {
        uuid: '6fbe1da7-3002-44de-92c4-bb6e04fb0212',
        properties: ['BLENotify'],
        structure: ['Float32', 'Float32', 'Float32'],
        data: {Gx: [], Gy: [], Gz: []},
        maxRecords: 10,
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
      },
      magnetometer: {
        uuid: '6fbe1da7-3003-44de-92c4-bb6e04fb0212',
        properties: ['BLENotify'],
        structure: ['Float32', 'Float32', 'Float32'],
        data: {Mx: [], My: [], Mz: []},
        maxRecords: 10,
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
      },
      // pressure: {
      //   uuid: '6fbe1da7-4001-44de-92c4-bb6e04fb0212',
      //   properties: ['BLERead'],
      //   structure: ['Float32'],
      //   data: {pressure: []},
      //   maxRecords: 1,
      //   writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
      // },
      // temperature: {
      //   uuid: '6fbe1da7-4002-44de-92c4-bb6e04fb0212',
      //   properties: ['BLERead'],
      //   structure: ['Float32'],
      //   data: {temperature: []},
      //   maxRecords: 1,
      //   writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
      // },
      // humidity: {
      //   uuid: '6fbe1da7-4003-44de-92c4-bb6e04fb0212',
      //   properties: ['BLERead'],
      //   structure: ['Float32'],
      //   data: {humidity: []},
      //   maxRecords: 1,
      //   writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
      // },

      microphone: {
        uuid: '6fbe1da7-5001-44de-92c4-bb6e04fb0212',
        properties: ['BLENotify'],
        structure: new Array(32).fill('Uint8'), // an array of 32 'Uint8's
        data: {
          a0: [],
          a1: [],
          a2: [],
          a3: [],
          a4: [],
          a5: [],
          a6: [],
          a7: [],
          a8: [],
          a9: [],
          aA: [],
          aB: [],
          aC: [],
          aD: [],
          aE: [],
          aF: [],
          b0: [],
          b1: [],
          b2: [],
          b3: [],
          b4: [],
          b5: [],
          b6: [],
          b7: [],
          b8: [],
          b9: [],
          bA: [],
          bB: [],
          bC: [],
          bD: [],
          bE: [],
          bF: [],
        },
        maxRecords: 10,
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
      },
      led: {
        uuid: '6fbe1da7-6001-44de-92c4-bb6e04fb0212',
        properties: ['BLEWrite'],
        structure: ['Uint8', 'Uint8', 'Uint8'],
        data: {R: [], G: [], B: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
      },
      ledRing1: {
        uuid: '6fbe1da7-7001-44de-92c4-bb6e04fb0212',
        properties: ['BLEWrite'],
        structure: ['Uint8', 'Uint8', 'Uint8'],
        data: {R: [], G: [], B: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
      },
      ledRing2: {
        uuid: '6fbe1da7-7002-44de-92c4-bb6e04fb0212',
        properties: ['BLEWrite'],
        structure: ['Uint8', 'Uint8', 'Uint8'],
        data: {R: [], G: [], B: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
      },
      ledRing3: {
        uuid: '6fbe1da7-7003-44de-92c4-bb6e04fb0212',
        properties: ['BLEWrite'],
        structure: ['Uint8', 'Uint8', 'Uint8'],
        data: {R: [], G: [], B: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
      },
      ledRing4: {
        uuid: '6fbe1da7-7004-44de-92c4-bb6e04fb0212',
        properties: ['BLEWrite'],
        structure: ['Uint8', 'Uint8', 'Uint8'],
        data: {R: [], G: [], B: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
      },
      ledRing5: {
        uuid: '6fbe1da7-7005-44de-92c4-bb6e04fb0212',
        properties: ['BLEWrite'],
        structure: ['Uint8', 'Uint8', 'Uint8'],
        data: {R: [], G: [], B: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
      },
      ledRing6: {
        uuid: '6fbe1da7-7006-44de-92c4-bb6e04fb0212',
        properties: ['BLEWrite'],
        structure: ['Uint8', 'Uint8', 'Uint8'],
        data: {R: [], G: [], B: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
      },
      ledRing7: {
        uuid: '6fbe1da7-7007-44de-92c4-bb6e04fb0212',
        properties: ['BLEWrite'],
        structure: ['Uint8', 'Uint8', 'Uint8'],
        data: {R: [], G: [], B: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
      },
      ledRing8: {
        uuid: '6fbe1da7-7008-44de-92c4-bb6e04fb0212',
        properties: ['BLEWrite'],
        structure: ['Uint8', 'Uint8', 'Uint8'],
        data: {R: [], G: [], B: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
      },
      encoder: {
        uuid: '6fbe1da7-8001-44de-92c4-bb6e04fb0212',
        properties: ['BLERead', 'BLENotify'],
        structure: ['Uint8'],
        data: {encoder: []},
        maxRecords: 1,
      },
      mode: {
        uuid: '6fbe1da7-8002-44de-92c4-bb6e04fb0212',
        properties: ['BLERead', 'BLENotify'],
        structure: ['Uint8'],
        data: {mode: []},
        maxRecords: 1,
      },
      record: {
        uuid: '6fbe1da7-8003-44de-92c4-bb6e04fb0212',
        properties: ['BLERead', 'BLENotify'],
        structure: ['Uint8'],
        data: {record: []},
        maxRecords: 1,
      },
      class: {
        uuid: '6fbe1da7-9001-44de-92c4-bb6e04fb0212',
        properties: ['BLERead', 'BLENotify'],
        structure: ['Uint8'],
        data: {class: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
        maxRecords: 1,
      },
      IOMODE: {
        uuid: '6fbe1da7-0101-44de-92c4-bb6e04fb0212',
        properties: ['BLEWrite'],
        structure: ['Uint8', 'Uint8'],
        data: {A0: [], A5: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
        maxRecords: 1,
      },
      A0: {
        uuid: '6fbe1da7-0102-44de-92c4-bb6e04fb0212',
        properties: ['BLEWrite', 'BLERead', 'BLENotify'],
        structure: ['Uint8'],
        data: {A0: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
        maxRecords: 1,
      },
      A5: {
        uuid: '6fbe1da7-0103-44de-92c4-bb6e04fb0212',
        properties: ['BLEWrite', 'BLERead', 'BLENotify'],
        structure: ['Uint8'],
        data: {A5: []},
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null,
        maxRecords: 1,
      },
    };

    //register the function used for training
    this.trainFunction = trainfn;

    this.trainContinuosly = true;
    this.disableMLTKClassification = false;

    //register the function used fot the classification
    this.playFunction = classifyfn;

    //register a function to be called after the board is connected
    if (onConnect != null) {
      this.afterConnectCallback = onConnect;
    } else {
      this.afterConnectCallback = function () {};
    }
    //register a function to be called after the board disconnects
    if (onDisconnect != null) {
      this.afterDisconnectCallback = onDisconnect;
    } else {
      this.afterDisconnectCallback = function () {};
    }

    this.boardPropertiesNames = Object.keys(this.boardProperties);

    this.SERVICE_UUID = '6fbe1da7-0000-44de-92c4-bb6e04fb0212';

    var bytesReceived = 0;
    var bytesPrevious = 0;

    //the main knn classification object
    this.knnClassifier = ml5.KNNClassifier();
    //two flags used to stop training and classification process
    this.stopClassificationFlag = false;
    this.stopTrainingFlag = false;

    this.controlPanelVisible = false;
    this.trainingDataPanelVisible = false;
  }

  ////////////////////////////////////////////////
  ///////////                       //////////////
  //////////      BLE CONNECTION    //////////////
  ///////////                       //////////////
  ////////////////////////////////////////////////

  async connect() {
    this.updateStatusMsg('requesting device ...');

    const device = await navigator.bluetooth.requestDevice({
      filters: [
        {
          services: [this.SERVICE_UUID], // SERVICE_UUID
        },
      ],
    });

    this.updateStatusMsg('connecting to device ...');
    device.addEventListener(
      'gattserverdisconnected',
      e => {
        this.onDisconnected(e);
      },
      false,
    );

    this.establishConnection(device);
  }

  async establishConnection(device) {
    const server = await device.gatt.connect();

    this.updateStatusMsg('getting primary service ...');
    const service = await server.getPrimaryService(this.SERVICE_UUID);

    console.log('stops here');
    // Set up the characteristics
    for (const property of this.boardPropertiesNames) {
      this.updateStatusMsg('characteristic ' + property + '...');
      this.boardProperties[property].characteristic = await service.getCharacteristic(
        this.boardProperties[property].uuid,
      );
      // Set up notification
      if (this.boardProperties[property].properties.includes('BLENotify')) {
        this.boardProperties[property].characteristic.addEventListener('characteristicvaluechanged', event => {
          this.handleIncomingNotification(this.boardProperties[property], event.target.value);
        });
        await this.boardProperties[property].characteristic.startNotifications();
      }
      // Set up polling for read
      if (
        this.boardProperties[property].properties.includes('BLERead') &&
        !this.boardProperties[property].properties.includes('BLENotify')
      ) {
        this.boardProperties[property].polling = setInterval(() => {
          this.boardProperties[property].characteristic
            .readValue()
            .then(data => {
              this.handleIncomingRead(this.boardProperties[property], data);
            })
            .catch(error => {
              console.log('Argh! error while trying to read ' + property, error);
            });
        }, pollingInterval);
      }
      this.boardProperties[property].rendered = false;
    }

    this.connected = true;
    this.updateStatusMsg('connected.');
    this.afterConnectCallback();
    this.getBoardStatus();
  }

  //when new data arrive from the arduino as notification
  handleIncomingNotification(sensor, dataReceived) {
    const columns = Object.keys(sensor.data); // column headings for this sensor
    const typeMap = {
      Uint8: {fn: DataView.prototype.getUint8, bytes: 1},
      Uint16: {fn: DataView.prototype.getUint16, bytes: 2},
      Float32: {fn: DataView.prototype.getFloat32, bytes: 4},
    };
    var packetPointer = 0,
      i = 0;

    sensor.structure.forEach(dataType => {
      var dataViewFn = typeMap[dataType].fn.bind(dataReceived);
      var unpackedValue = dataViewFn(packetPointer, true);

      sensor.data[columns[i]].push(unpackedValue);
      // Keep array at buffer size

      if (sensor.data[columns[i]].length > sensor.maxRecords) {
        sensor.data[columns[i]].shift();
      }
      // move pointer forward in data packet to next value
      packetPointer += typeMap[dataType].bytes;
      this.bytesReceived += typeMap[dataType].bytes;
      i++;

      if (sensor.uuid == this.boardProperties.mode.uuid) {
        console.log('changing mode');
        if (this.isTrainModeActive()) {
          this.stopClassification();
        } else {
          this.startClassification();
        }
      } else if (sensor.uuid == this.boardProperties.record.uuid) {
        if (this.isTrainModeActive()) {
          if (this.isRecordButtonPressed()) {
            this.startTraining();
          } else {
            this.stopTraining();
          }
        }
      }
    });
    if (this.controlPanelVisible) {
      this.updatemltkPanel();
    }
    sensor.rendered = false; // flag - vizualization needs to be updated
  }

  handleIncomingRead(sensor, dataReceived) {
    const columns = Object.keys(sensor.data); // column headings for this sensor
    const typeMap = {
      Uint8: {fn: DataView.prototype.getUint8, bytes: 1},
      Uint16: {fn: DataView.prototype.getUint16, bytes: 2},
      Float32: {fn: DataView.prototype.getFloat32, bytes: 4},
    };
    var packetPointer = 0,
      i = 0;

    // Read each sensor value in the BLE packet and push into the data array
    sensor.structure.forEach(dataType => {
      // Lookup function to extract data for given sensor property type
      var dataViewFn = typeMap[dataType].fn.bind(dataReceived);
      // Read sensor ouput value - true => Little Endian
      var unpackedValue = dataViewFn(packetPointer, true);
      // Push sensor reading onto data array
      sensor.data[columns[i]].push(unpackedValue);
      // Keep array at buffer size
      if (sensor.data[columns[i]].length > sensor.maxRecords) {
        sensor.data[columns[i]].shift();
      }
      // move pointer forward in data packet to next value
      packetPointer += typeMap[dataType].bytes;
      this.bytesReceived += typeMap[dataType].bytes;
      i++;
    });
    if (this.controlPanelVisible) {
      this.updatemltkPanel();
    }
    sensor.rendered = false; // flag - vizualization needs to be updated
  }

  onDisconnected(event) {
    let device = event.target;
    // clear read polling
    for (const property of this.boardPropertiesNames) {
      if (typeof this.boardProperties[property].polling !== 'undefined') {
        clearInterval(this.boardProperties[property].polling);
      }
    }
    this.updateStatusMsg('Device ' + device.name + ' is disconnected.');
    this.connected = false;
    this.stopTraining();
    this.stopClassification();

    //this.establishConnection(device);

    //this.afterDisconnectCallback();
  }

  getBoardStatus() {
    for (const property of this.boardPropertiesNames) {
      if (this.boardProperties[property].properties.includes('BLERead')) {
        this.boardProperties[property].characteristic
          .readValue()
          .then(data => {
            this.handleIncomingRead(this.boardProperties[property], data);
          })
          .catch(error => {
            console.log('Argh! error while trying to read ' + property, error);
          });
      }
    }
  }

  ////////////////////////////////////////////////
  ///////////                       //////////////
  ///////////         ML5JS         //////////////
  ///////////                       //////////////
  ////////////////////////////////////////////////

  startClassification() {
    console.log('start classification');
    this.stopClassificationFlag = false;
    this.playFunction();
  }

  stopClassification() {
    console.log('stop classification');
    this.stopClassificationFlag = true;
  }

  startTraining() {
    console.log('start training');
    this.stopTrainingFlag = false;
    this.train();
  }

  stopTraining() {
    console.log('stop training');
    this.stopTrainingFlag = true;
  }

  train() {
    if (!this.stopTrainingFlag) {
      this.trainFunction();
      if (this.trainContinuosly) {
        setTimeout(() => {
          this.train();
        }, trainClassifyInterval);
      }
    }
  }

  /**
   * add some training data to a specific class
   * @category ML
   * @param {String} label - the label of the class to which associate training data
   * @param {Array } features - the training data
   * @example
   *
   * function train() {
   *    //get the label of the class selected from the board
   *    let label = mltk.getActiveClass();
   *    //get some data from the board sensor and use it as training features
   *    let features = mltk.getMagnetometerData();
   *    mltk.addTrainingData( label, features );
   * }
   *
   */
  addTrainingData(label, features) {
    this.knnClassifier.addExample(features, label);
    console.log(this.knnClassifier.getCount());

    if (this.trainingDataPanelVisible) {
      this.addtrainingDataToPanel(label, JSON.stringify(features));
    }
  }

  /**
   * Run a set of data trough the trained classifier and assess to which class the data belongs to
   * @category ML
   * @param {Array } features - the data to be classified data
   * @param {Function} callback - the function to invoke when the classification has produced some results
   * @example
   * //this function will be run in loop when you are in play mode
   * function play() {
   *    //get the data you want to "classify"
   *    let features = mltk.getMagnetometerData();
   *    //pass the data to the function who does the classification, once done call the "gotResults" callback function
   *    mltk.classify( features, gotResults );
   *  }
   *
   *  function gotResults( err, result ) {
   *    if ( err ) {
   *      console.log( err );
   *    } else {
   *      //take the name of the label identified and store it in the global variable activeClass
   *      activeClass = result.label;
   *      play();
   *    }
   *  }
   */
  classify(features, callback) {
    if (!this.stopClassificationFlag) {
      const numLabels = this.knnClassifier.getNumLabels();
      if (numLabels <= 0) {
        console.error('There are no examples in any label');
        return;
      }
      let err = false;
      this.knnClassifier.classify(features, (err, result) => {
        if (err) {
          callback(err);
          return;
        }
        setTimeout(() => {
          callback(err, result);
          let label = parseInt(result.label, 10);
          this.setClass(label);
        }, trainClassifyInterval);
      });
    }
  }

  ////////////////////////////////////////////////
  ///////////                       //////////////
  ///////////      USER INTERFACE   //////////////
  ///////////                       //////////////
  ////////////////////////////////////////////////

  /**
   * Create the connect disconnect button and visualize the connection status
   * @category UI
   * @param {String} message - message to display in the MLTK interface
   * return {void}
   */
  updateStatusMsg(message) {
    console.log(message);
    let sm = document.getElementById('statusMsg');
    sm.innerHTML = message;
  }

  updatemltkPanel() {
    Object.keys(this.boardProperties).forEach((key, index) => {
      var x = document.getElementById(key);
      x.querySelector('.value').innerHTML = JSON.stringify(this.boardProperties[key].data);
    });
  }

  /**
   * Create the connect disconnect button and visualize the connection status
   * @category UI
   * @example
   *
   * mltk.createControlInterface();
   */
  createControlInterface() {
    let MLTKControls = createDiv();
    MLTKControls.id('MLTKControls');

    let MLTKTitle = createDiv('🤖_MLTK01');
    MLTKTitle.class('title');
    MLTKTitle.parent(MLTKControls);

    let statusMsg = createDiv('Waiting to connect to board...');
    statusMsg.class('statusMsg');
    statusMsg.id('statusMsg');
    statusMsg.parent(MLTKControls);

    let connectButton = createButton('connect');
    //connectButton.position( 19, 19 );
    connectButton.mousePressed(() => {
      this.connect();
    });
    connectButton.parent(MLTKControls);

    let disconnectButton = createButton('disconnect');
    disconnectButton.mousePressed(() => {
      //this.disconnect();
    });
    disconnectButton.parent(MLTKControls);

    let headerContainer = select('#headerContainer');
    if (headerContainer != null) {
      MLTKControls.parent(headerContainer);
    } else {
      let headerContainer = createDiv();
      headerContainer.id('headerContainer');
      MLTKControls.parent(headerContainer);
    }
  }

  /**
   * Visualizes the data from the sensors on the MLTK board.
   * @category UI
   */
  createLiveDataView() {
    this.controlPanelVisible = true;

    var mltkPanel = document.createElement('div');
    mltkPanel.id = 'mltkPanel';
    mltkPanel.classList.add('panel');

    mltkPanel.innerHTML =
      '<div class="head">\n' +
      '<p class="title">BOARD PROPERTIES</p>\n' +
      '</div>\n' +
      '<div id="data">\n' +
      '</div>\n';

    document.body.appendChild(mltkPanel);

    let dataDiv = document.getElementById('data');

    Object.keys(this.boardProperties).forEach(function (key, index) {
      var dataElem = document.createElement('div');
      dataElem.id = key;
      dataElem.classList.add('data-panel');
      dataElem.innerHTML = '<p class="label">' + key + '</p>\n' + '<p class="value"></p>\n';
      dataDiv.appendChild(dataElem);
      // key: the name of the object key
      // index: the ordinal position of the key within the object
    });
    //document.getElementById( "disconnect" ).addEventListener( "click", this.disconnect );
  }

  /**
   * Visualize the data recorded in the 8 classes
   * @category UI
   */
  createTrainingDataView() {
    this.trainingDataPanelVisible = true;
    var trainingdata = document.createElement('div');
    trainingdata.id = 'trainingData';
    trainingdata.classList.add('panel');

    trainingdata.innerHTML =
      '<div class="head">\n' +
      '<p class="title">TRAINING DATA VIEW</p>\n' +
      '</div>\n' +
      '<div id="data">\n' +
      '<div class="data-panel" id="0">\n' +
      '<p class="label">class 0</p>' +
      '<p class="value"></p>' +
      '</div>\n' +
      '<div class="data-panel" id="1">\n' +
      '<p class="label">class 1</p>' +
      '<p class="value"></p>' +
      '</div>\n' +
      '<div class="data-panel" id="2">\n' +
      '<p class="label">class 3</p>' +
      '<p class="value"></p>' +
      '</div>\n' +
      '<div class="data-panel" id="3">\n' +
      '<p class="label">class 3</p>' +
      '<p class="value"></p>' +
      '</div>\n' +
      '<div class="data-panel" id="4">\n' +
      '<p class="label">class 4</p>' +
      '<p class="value"></p>' +
      '</div>\n' +
      '<div class="data-panel" id="5">\n' +
      '<p class="label">class 5</p>' +
      '<p class="value"></p>' +
      '</div>\n' +
      '<div class="data-panel" id="6">\n' +
      '<p class="label">class 6</p>' +
      '<p class="value"></p>' +
      '</div>\n' +
      '<div class="data-panel" id="7">\n' +
      '<p class="label">class 7</p>' +
      '<p class="value"></p>' +
      '</div>\n' +
      '</div>\n';

    document.body.appendChild(trainingdata);
  }

  addtrainingDataToPanel(c, d) {
    let dataPanel = select('.value', '#' + c);
    dataPanel.html(dataPanel.html() + d);
    //    dataPanel.innerHTML += d;
  }

  ////////////////////////////////////////////////
  ///////////                       //////////////
  ///////////      GETTERS SETTERS  //////////////
  ///////////                       //////////////
  ////////////////////////////////////////////////

  setIO(id, mode) {
    let A0Mode = this.boardProperties.IOMODE.data.A0[0];
    let A5Mode = this.boardProperties.IOMODE.data.A5[0];

    if (id == A0) {
      A0Mode = mode;
    } else if (id == A5) {
      A5Mode = mode;
    }

    var newData = Uint8Array.of(A0Mode, A5Mode);

    this.boardProperties['IOMODE'].writeValue = newData;
    this.BLEwriteTo('IOMODE');
  }

  writeToIO(id, val) {
    let data = new Uint8Array([val]);

    if (id == A0) {
      this.boardProperties['A0'].writeValue = data;
      this.BLEwriteTo('A0');
    } else if (id == A5) {
      this.boardProperties['A5'].writeValue = data;
      this.BLEwriteTo('A5');
    }
  }

  /**
   * returns true if the mltk board is connected
   * @category MLTK BOARD API
   * @returns {boolean} TRUE when MLTK board is connected
   */
  isConnected() {
    return this.connected;
  }

  /**
   * returns true if the train/play switch on the mltk board is set to TRAIN
   * @category MLTK BOARD API
   * @returns {boolean} TRUE when MLTK board is set to TRAIN
   */
  isTrainModeActive() {
    if (this.boardProperties.mode.data.mode[this.boardProperties.mode.maxRecords - 1] == 0) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * returns true if the train/play switch on the mltk board is set to PLAY
   * @category MLTK BOARD API
   * @returns {boolean} TRUE when MLTK board is set to PLAY
   */
  isPlayModeActive() {
    if (this.boardProperties.mode.data.mode[this.boardProperties.mode.maxRecords - 1] == 1) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * returns true if the record button on the mltk board is pressed
   * @category MLTK BOARD API
   * @returns {boolean} TRUE when train button is pressed
   */
  isRecordButtonPressed() {
    if (mltk.boardProperties.record.data.record[this.boardProperties.record.maxRecords - 1] == 1) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Returns an array containing the colorimeter data.
   * @category MLTK BOARD API
   * @returns {Array} [r,g,b] Array containing red green and blue value as measured from the MLTK onboard colorimeter
   */
  getColorimeterData() {
    var colorimeterData = [];
    colorimeterData[0] = this.boardProperties.colorimeter.data.R[this.boardProperties.colorimeter.data.R.length - 1];
    colorimeterData[1] = this.boardProperties.colorimeter.data.G[this.boardProperties.colorimeter.data.G.length - 1];
    colorimeterData[2] = this.boardProperties.colorimeter.data.B[this.boardProperties.colorimeter.data.B.length - 1];
    return colorimeterData;
  }
  /**
   * Returns an array containing the gyroscope data.
   * @category MLTK BOARD API
   * @returns {Array} [Gx,Gy,Gz] Array containing the rotational velocity on the 3 axis as measured by the on board LSM9DS1 IMU
   */
  getGyroscopeData() {
    var gyroscopeData = [];
    gyroscopeData[0] = this.boardProperties.gyroscope.data.Gx[this.boardProperties.gyroscope.data.Gx.length - 1];
    gyroscopeData[1] = this.boardProperties.gyroscope.data.Gy[this.boardProperties.gyroscope.data.Gy.length - 1];
    gyroscopeData[2] = this.boardProperties.gyroscope.data.Gz[this.boardProperties.gyroscope.data.Gz.length - 1];
    return gyroscopeData;
  }
  /**
   * Returns an array containing the Magnetometer data.
   * @category MLTK BOARD API
   * @returns {Array} [Gx,Gy,Gz] Array containing the measured magnetic field measured by the LSM9DS1 IMU
   */
  getMagnetometerData() {
    var magnetometerData = [];
    magnetometerData[0] =
      this.boardProperties.magnetometer.data.Mx[this.boardProperties.magnetometer.data.Mx.length - 1];
    magnetometerData[1] =
      this.boardProperties.magnetometer.data.My[this.boardProperties.magnetometer.data.My.length - 1];
    magnetometerData[2] =
      this.boardProperties.magnetometer.data.Mz[this.boardProperties.magnetometer.data.Mz.length - 1];
    return magnetometerData;
  }
  /**
   * Returns an array containing the Microphone data.
   * @category MLTK BOARD API
   * @returns {Array} [
      'a0',
      'a1',
      'a2',
      'a3',
      'a4',
      'a5',
      'a6',
      'a7',
      'a8',
      'a9',
      'aA',
      'aB',
      'aC',
      'aD',
      'aE',
      'aF',
      'b0',
      'b1',
      'b2',
      'b3',
      'b4',
      'b5',
      'b6',
      'b7',
      'b8',
      'b9',
      'bA',
      'bB',
      'bC',
      'bD',
      'bE',
      'bF',] Array containing the measured intensity of notes measured by the PMD */
  getMicrophoneData() {
    const microphoneData = [];
    const microphoneProps = [
      'a0',
      'a1',
      'a2',
      'a3',
      'a4',
      'a5',
      'a6',
      'a7',
      'a8',
      'a9',
      'aA',
      'aB',
      'aC',
      'aD',
      'aE',
      'aF',
      'b0',
      'b1',
      'b2',
      'b3',
      'b4',
      'b5',
      'b6',
      'b7',
      'b8',
      'b9',
      'bA',
      'bB',
      'bC',
      'bD',
      'bE',
      'bF',
    ];

    for (let i = 0; i < microphoneProps.length; i++) {
      micData[i] =
        mltk.boardProperties.microphone.data[microphoneProps[i]][
          mltk.boardProperties.microphone.data[microphoneProps[i]].length - 1
        ];
    }

    return microphoneData;
  }
  /**
   * Returns the id of the selected class.
   * @category MLTK BOARD API
   * @returns {Number} The number of the selected class (also shown with the on board led)
   */
  getActiveClass() {
    return mltk.boardProperties.class.data.class[this.boardProperties.class.maxRecords - 1];
  }

  getEncoderValue() {
    return mltk.boardProperties.encoder.data.encoder[this.boardProperties.class.maxRecords - 1];
  }

  /**
   * Set the color of the rgb led on the Arduino BLE sense.
   * @category MLTK BOARD API
   * @param {Number} r - The value of the red component [0-255]
   * @param {Number} g - The value of the green component [0-255]
   * @param {Number} b - The value of the blue component [0-255]
   */
  setRGBLed(r, g, b) {
    var rgb_values = Uint8Array.of(r, g, b);
    this.boardProperties['led'].writeValue = rgb_values;
    this.BLEwriteTo('led');
  }

  /**
   * Set the color of the leds on the MLTK board.
   * @category MLTK BOARD API
   * @param {Number} index - The led we want to change color to [0-7]
   * @param {Number} r - The value of the red component [0-255]
   * @param {Number} g - The value of the green component [0-255]
   * @param {Number} b - The value of the blue component [0-255]
   */
  setLedRing(index, r, g, b) {
    var rgb_values = Uint8Array.of(r, g, b);
    let propertyName = 'ledRing' + (index + 1);
    this.boardProperties[propertyName].writeValue = rgb_values;
    this.BLEwriteTo(propertyName);
  }

  // TODO: fix this function to write to the arduino characteristic
  setClass(c) {
    let data = new Uint8Array([c]);
    let propertyName = 'class';
    if (c != this.boardProperties[propertyName].data.class[0]) {
      this.boardProperties[propertyName].writeValue = data;
      this.BLEwriteTo(propertyName);
    }
  }

  BLEwriteTo(property) {
    if (!this.boardProperties[property].characteristic.writeBusy) {
      console.log('writing');

      this.boardProperties[property].characteristic.writeBusy = true;
      this.boardProperties[property].characteristic
        .writeValue(this.boardProperties[property].writeValue)
        .then(_ => {
          console.log('done writing to "' + property + '" !');
          this.boardProperties[property].characteristic.writeBusy = false;
        })
        .catch(error => {
          console.log(error);
          this.boardProperties[property].characteristic.writeBusy = false;
        });
    }
  }
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
