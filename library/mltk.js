//how often do we want to collect new samples to train and how often do we want to get a classification result
let trainClassifyInterval = 100;

//how often do we want ble to poll properties value
let pollingInterval = 500;

class Mltk {

  /**
   * Note: MLTK main class
   * @param {Client} gp - parent g11n-pipeline client object
   * @param {Object} props - properties to inherit
   */
  constructor( trainfn, classifyfn ) {
    this.connected = false;
    this.boardProperties = {
      ambientLight: {
        uuid: '6fbe1da7-2001-44de-92c4-bb6e04fb0212',
        properties: [ 'BLENotify' ],
        structure: [ 'Uint16' ],
        data: { 'ambientLight': [] }
      },
      colorimeter: {
        uuid: '6fbe1da7-2002-44de-92c4-bb6e04fb0212',
        properties: [ 'BLENotify' ],
        structure: [ 'Uint16', 'Uint16', 'Uint16' ],
        data: { 'R': [], 'G': [], 'B': [] }
      },
      proximity: {
        uuid: '6fbe1da7-2003-44de-92c4-bb6e04fb0212',
        properties: [ 'BLENotify' ],
        structure: [ 'Uint8' ],
        data: { proximity: [] }
      },
      accelerometer: {
        uuid: '6fbe1da7-3001-44de-92c4-bb6e04fb0212',
        properties: [ 'BLENotify' ],
        structure: [ 'Float32', 'Float32', 'Float32' ],
        data: { 'Ax': [], 'Ay': [], 'Az': [] },
      },
      gyroscope: {
        uuid: '6fbe1da7-3002-44de-92c4-bb6e04fb0212',
        properties: [ 'BLENotify' ],
        structure: [ 'Float32', 'Float32', 'Float32' ],
        data: { 'Gx': [], 'Gy': [], 'Gz': [] },
      },
      magnetometer: {
        uuid: '6fbe1da7-3003-44de-92c4-bb6e04fb0212',
        properties: [ 'BLENotify' ],
        structure: [ 'Float32', 'Float32', 'Float32' ],
        data: { 'Mx': [], 'My': [], 'Mz': [] },
      },
      pressure: {
        uuid: '6fbe1da7-4001-44de-92c4-bb6e04fb0212',
        properties: [ 'BLERead' ],
        structure: [ 'Float32' ],
        data: { pressure: [] }
      },
      temperature: {
        uuid: '6fbe1da7-4002-44de-92c4-bb6e04fb0212',
        properties: [ 'BLERead' ],
        structure: [ 'Float32' ],
        data: { temperature: [] }
      },
      humidity: {
        uuid: '6fbe1da7-4003-44de-92c4-bb6e04fb0212',
        properties: [ 'BLERead' ],
        structure: [ 'Float32' ],
        data: { humidity: [] }
      },

      microphone: {
        uuid: '6fbe1da7-5001-44de-92c4-bb6e04fb0212',
        properties: [ 'BLENotify' ],
        structure: new Array( 32 ).fill( 'Uint8' ), // an array of 32 'Uint8's
        data: {
          'a0': [],
          'a1': [],
          'a2': [],
          'a3': [],
          'a4': [],
          'a5': [],
          'a6': [],
          'a7': [],
          'a8': [],
          'a9': [],
          'aA': [],
          'aB': [],
          'aC': [],
          'aD': [],
          'aE': [],
          'aF': [],
          'b0': [],
          'b1': [],
          'b2': [],
          'b3': [],
          'b4': [],
          'b5': [],
          'b6': [],
          'b7': [],
          'b8': [],
          'b9': [],
          'bA': [],
          'bB': [],
          'bC': [],
          'bD': [],
          'bE': [],
          'bF': []
        }
      },
      led: {
        uuid: '6fbe1da7-6001-44de-92c4-bb6e04fb0212',
        properties: [ 'BLEWrite' ],
        structure: [ 'Uint8', 'Uint8', 'Uint8' ],
        data: { 'R': [], 'G': [], 'B': [] },
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null
      },
      ledRing1: {
        uuid: '6fbe1da7-7001-44de-92c4-bb6e04fb0212',
        properties: [ 'BLEWrite' ],
        structure: [ 'Uint8', 'Uint8', 'Uint8' ],
        data: { 'R': [], 'G': [], 'B': [] },
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null
      },
      ledRing2: {
        uuid: '6fbe1da7-7002-44de-92c4-bb6e04fb0212',
        properties: [ 'BLEWrite' ],
        structure: [ 'Uint8', 'Uint8', 'Uint8' ],
        data: { 'R': [], 'G': [], 'B': [] },
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null
      },
      ledRing3: {
        uuid: '6fbe1da7-7003-44de-92c4-bb6e04fb0212',
        properties: [ 'BLEWrite' ],
        structure: [ 'Uint8', 'Uint8', 'Uint8' ],
        data: { 'R': [], 'G': [], 'B': [] },
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null
      },
      ledRing4: {
        uuid: '6fbe1da7-7004-44de-92c4-bb6e04fb0212',
        properties: [ 'BLEWrite' ],
        structure: [ 'Uint8', 'Uint8', 'Uint8' ],
        data: { 'R': [], 'G': [], 'B': [] },
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null
      },
      ledRing5: {
        uuid: '6fbe1da7-7005-44de-92c4-bb6e04fb0212',
        properties: [ 'BLEWrite' ],
        structure: [ 'Uint8', 'Uint8', 'Uint8' ],
        data: { 'R': [], 'G': [], 'B': [] },
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null
      },
      ledRing6: {
        uuid: '6fbe1da7-7006-44de-92c4-bb6e04fb0212',
        properties: [ 'BLEWrite' ],
        structure: [ 'Uint8', 'Uint8', 'Uint8' ],
        data: { 'R': [], 'G': [], 'B': [] },
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null
      },
      ledRing7: {
        uuid: '6fbe1da7-7007-44de-92c4-bb6e04fb0212',
        properties: [ 'BLEWrite' ],
        structure: [ 'Uint8', 'Uint8', 'Uint8' ],
        data: { 'R': [], 'G': [], 'B': [] },
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null
      },
      ledRing8: {
        uuid: '6fbe1da7-7008-44de-92c4-bb6e04fb0212',
        properties: [ 'BLEWrite' ],
        structure: [ 'Uint8', 'Uint8', 'Uint8' ],
        data: { 'R': [], 'G': [], 'B': [] },
        writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
        writeValue: null
      },
      encoder: {
        uuid: '6fbe1da7-8001-44de-92c4-bb6e04fb0212',
        properties: [ 'BLERead', 'BLENotify' ],
        structure: [ 'Uint8' ],
        data: { encoder: [] }
      },
      mode: {
        uuid: '6fbe1da7-8002-44de-92c4-bb6e04fb0212',
        properties: [ 'BLERead', 'BLENotify' ],
        structure: [ 'Uint8' ],
        data: { mode: [] }
      },
      record: {
        uuid: '6fbe1da7-8003-44de-92c4-bb6e04fb0212',
        properties: [ 'BLERead', 'BLENotify' ],
        structure: [ 'Uint8' ],
        data: { record: [] }
      },
      class: {
        uuid: '6fbe1da7-9001-44de-92c4-bb6e04fb0212',
          properties: [ 'BLERead', 'BLENotify' ],
          structure: [ 'Uint8' ],
          data: { class: [] },
          writeBusy: false, // we need to track this to avoid 'GATT operation in progress' errors
          writeValue: null
      }
    }

    //register the function used for training
    this.trainFunction = trainfn;
    //register the function used fot the classification
    this.playFunction = classifyfn;

    //how many records to we want to keep per each property
    this.maxRecords = 1;

    this.boardPropertiesNames = Object.keys( this.boardProperties );

    this.SERVICE_UUID = '6fbe1da7-0000-44de-92c4-bb6e04fb0212';

    var bytesReceived = 0;
    var bytesPrevious = 0;

    //the main knn classification object
    this.knnClassifier = ml5.KNNClassifier();
    //two flags used to stop training and classification process
    this.stopClassificationFlag = false;
    this.stopTrainingFlag = false;
  }

  ////////////////////////////////////////////////
  ///////////                       //////////////
  //////////      BLE CONNECTION    //////////////
  ///////////                       //////////////
  ////////////////////////////////////////////////

  async connect() {
    this.updatestatusMsg( 'requesting device ...' );

    const device = await navigator.bluetooth.requestDevice( {
      filters: [ {
        services: [ this.SERVICE_UUID ] // SERVICE_UUID
      } ]
    } );

    this.updatestatusMsg( 'connecting to device ...' );
    device.addEventListener( 'gattserverdisconnected', ( e ) => {
      this.onDisconnected( e );
    }, false );

    const server = await device.gatt.connect();

    this.updatestatusMsg( 'getting primary service ...' );
    const service = await server.getPrimaryService( this.SERVICE_UUID );

    // Set up the characteristics
    for ( const property of this.boardPropertiesNames ) {
      this.updatestatusMsg( 'characteristic ' + property + "..." );
      this.boardProperties[ property ].characteristic = await service.getCharacteristic( this.boardProperties[ property ].uuid );
      // Set up notification
      if ( this.boardProperties[ property ].properties.includes( "BLENotify" ) ) {
        this.boardProperties[ property ].characteristic.addEventListener( 'characteristicvaluechanged', ( event ) => {
          this.handleIncomingNotification( this.boardProperties[ property ], event.target.value )
        } );
        await this.boardProperties[ property ].characteristic.startNotifications();
      }
      // Set up polling for read
      if ( this.boardProperties[ property ].properties.includes( "BLERead" ) &&
        !this.boardProperties[ property ].properties.includes( "BLENotify" ) ) {
        this.boardProperties[ property ].polling = setInterval( () => {
          this.boardProperties[ property ].characteristic.readValue().then( ( data ) => {
            this.handleIncomingRead( this.boardProperties[ property ], data );
          } );
        }, pollingInterval );
      }
      this.boardProperties[ property ].rendered = false;
    }

    this.connected = true;
    this.updatestatusMsg( 'connected.' );
    this.getBoardStatus();
  }

  //when new data arrive from the arduino as notification
  handleIncomingNotification( sensor, dataReceived ) {

    const columns = Object.keys( sensor.data ); // column headings for this sensor
    const typeMap = {
      "Uint8": { fn: DataView.prototype.getUint8, bytes: 1 },
      "Uint16": { fn: DataView.prototype.getUint16, bytes: 2 },
      "Float32": { fn: DataView.prototype.getFloat32, bytes: 4 }
    };
    var packetPointer = 0,
      i = 0;

    sensor.structure.forEach( ( dataType ) => {

      var dataViewFn = typeMap[ dataType ].fn.bind( dataReceived );
      var unpackedValue = dataViewFn( packetPointer, true );

      sensor.data[ columns[ i ] ].push( unpackedValue );
      // Keep array at buffer size
      if ( sensor.data[ columns[ i ] ].length > this.maxRecords ) { sensor.data[ columns[ i ] ].shift(); }
      // move pointer forward in data packet to next value
      packetPointer += typeMap[ dataType ].bytes;
      this.bytesReceived += typeMap[ dataType ].bytes;
      i++;


      if ( sensor.uuid == this.boardProperties.mode.uuid ) {

        if ( this.isTrainModeActive() ) {
          this.stopClassification();
        } else {
          this.startClassification();
        }

      } else if ( sensor.uuid == this.boardProperties.record.uuid ) {
        if ( this.isTrainModeActive() ) {
          if ( this.isRecordButtonPressed() ) {
            this.startTraining();
          } else {
            this.stopTraining();
          }
        }
      }
    } );
    this.updatemltkPanel();
    sensor.rendered = false; // flag - vizualization needs to be updated
  }

  handleIncomingRead( sensor, dataReceived ) {

    const columns = Object.keys( sensor.data ); // column headings for this sensor
    const typeMap = {
      "Uint8": { fn: DataView.prototype.getUint8, bytes: 1 },
      "Uint16": { fn: DataView.prototype.getUint16, bytes: 2 },
      "Float32": { fn: DataView.prototype.getFloat32, bytes: 4 }
    };
    var packetPointer = 0,
      i = 0;

    // Read each sensor value in the BLE packet and push into the data array
    sensor.structure.forEach( ( dataType ) => {
      // Lookup function to extract data for given sensor property type
      var dataViewFn = typeMap[ dataType ].fn.bind( dataReceived );
      // Read sensor ouput value - true => Little Endian
      var unpackedValue = dataViewFn( packetPointer, true );
      // Push sensor reading onto data array
      sensor.data[ columns[ i ] ].push( unpackedValue );
      // Keep array at buffer size
      if ( sensor.data[ columns[ i ] ].length > this.maxRecords ) { sensor.data[ columns[ i ] ].shift(); }
      // move pointer forward in data packet to next value
      packetPointer += typeMap[ dataType ].bytes;
      this.bytesReceived += typeMap[ dataType ].bytes;
      i++;
    } );
    this.updatemltkPanel();
    sensor.rendered = false; // flag - vizualization needs to be updated
  }

  onDisconnected( event ) {
    let device = event.target;
    // clear read polling
    for ( const property of this.boardPropertiesNames ) {
      if ( typeof this.boardProperties[ property ].polling !== 'undefined' ) {
        clearInterval( this.boardProperties[ property ].polling );
      }
    }
    this.updatestatusMsg( 'Device ' + device.name + ' is disconnected.' );
    this.connected = false;
    this.stopTraining();
    this.stopClassification();

  }

  getBoardStatus() {
    for ( const property of this.boardPropertiesNames ) {
      if ( this.boardProperties[ property ].properties.includes( "BLERead" ) ) {
        this.boardProperties[ property ].characteristic.readValue().then( ( data ) => {
          this.handleIncomingRead( this.boardProperties[ property ], data );
        } );
      }
    }
  }

  ////////////////////////////////////////////////
  ///////////                       //////////////
  ///////////         ML5JS         //////////////
  ///////////                       //////////////
  ////////////////////////////////////////////////

  startClassification() {
    console.log( "start classification" );
    this.stopClassificationFlag = false;
    this.playFunction();
  }

  stopClassification() {
    console.log( "stop classification" );
    this.stopClassificationFlag = true;
  }

  startTraining() {
    console.log( "start training" )
    this.stopTrainingFlag = false;
    this.train()
  }

  stopTraining() {
    console.log( "stop training" )
    this.stopTrainingFlag = true;
  }

  train() {
    if ( !this.stopTrainingFlag ) {
      this.trainFunction();
      setTimeout( () => {
        this.train();
      }, trainClassifyInterval );
    }
  }

  addTrainingData( label, features ) {
    this.knnClassifier.addExample( features, label );
    console.log( this.knnClassifier.getCount() );

    this.addtrainingDataToPanel( label, JSON.stringify( features ) );
  }

  classify( features, callback ) {
    if ( !this.stopClassificationFlag ) {
      const numLabels = this.knnClassifier.getNumLabels();
      if ( numLabels <= 0 ) {
        console.error( 'There is no examples in any label' );
        return;
      }
      let err = false;
      this.knnClassifier.classify( features, ( err, result ) => {
        if ( err ) {
          callback( err );
          return;
        }
        setTimeout( () => {
          callback( err, result );
          let label = parseInt( result.label, 10 );
          this.setClass( label );
        }, trainClassifyInterval )
      } );
    }
  }

  ////////////////////////////////////////////////
  ///////////                       //////////////
  ///////////      USER INTERFACE   //////////////
  ///////////                       //////////////
  ////////////////////////////////////////////////


  updatestatusMsg( m ) {
    console.log( m );
    let sm = document.getElementById( "statusMsg" );
    sm.innerHTML = m;
  }

  updatemltkPanel() {
    Object.keys( this.boardProperties ).forEach( ( key, index ) => {
      var x = document.getElementById( key );
      x.querySelector( ".value" ).innerHTML = JSON.stringify( this.boardProperties[ key ].data );
    } )
  }
  createTrainingDataView() {
    var trainingdata = document.createElement( "div" );
    trainingdata.id = "trainingData";
    trainingdata.classList.add( "panel" );

    trainingdata.innerHTML =
      '<div class="head">\n' +
      '<p class="title">Training Data View</p>\n' +
      '</div>\n' +
      '<div id="data">\n' +

      '<div class="dataContainer" id="0">\n' +
      '</div>\n' +
      '<div class="dataContainer" id="1">\n' +
      '</div>\n' +
      '<div class="dataContainer" id="2">\n' +
      '</div>\n' +
      '<div class="dataContainer" id="3">\n' +
      '</div>\n' +
      '<div class="dataContainer" id="4">\n' +
      '</div>\n' +
      '<div class="dataContainer" id="5">\n' +
      '</div>\n' +
      '<div class="dataContainer" id="6">\n' +
      '</div>\n' +
      '<div class="dataContainer" id="7">\n' +
      '</div>\n' +

      '</div>\n'

    document.body.appendChild( trainingdata );
  }

  addtrainingDataToPanel( c, d ) {
    let dataPanel = document.getElementById( c );
    dataPanel.innerHTML += d;
  }

  createmltkPanel() {
    var mltkPanel = document.createElement( "div" );
    mltkPanel.id = "mltkPanel";
    mltkPanel.classList.add( "panel" );

    mltkPanel.innerHTML =
      '<div class="head">\n' +
      '<p class="title">mltk</p>\n' +
      '</div>\n' +

      '<div id="data">\n' +

      '</div>\n' +

      '<div id="statusMsg">\n' +
      '</div>\n' +

      '<div class="actions">\n' +
      '<input id="connect" type="button" value="connect" ">\n' +
      '<input id="disconnect" type="button" value="disconnect">\n' +
      '</div>\n'
    document.body.appendChild( mltkPanel );

    document.getElementById( "connect" ).addEventListener( "click", ( e ) => {
      this.connect();
    }, false );

    let dataDiv = document.getElementById( "data" )

    Object.keys( this.boardProperties ).forEach( function( key, index ) {
      var dataElem = document.createElement( "div" );
      dataElem.id = key;
      dataElem.classList.add( "data-panel" );
      dataElem.innerHTML =
        '<p class="label">' +
        key + '</p>\n' +
        '<p class="value"></p>\n'
      dataDiv.appendChild( dataElem );
      // key: the name of the object key
      // index: the ordinal position of the key within the object
    } );
    //document.getElementById( "disconnect" ).addEventListener( "click", this.disconnect );
  }

  ////////////////////////////////////////////////
  ///////////                       //////////////
  ///////////      GETTERS SETTERS  //////////////
  ///////////                       //////////////
  ////////////////////////////////////////////////


  isTrainModeActive() {
    if ( this.boardProperties.mode.data.mode[ this.maxRecords - 1 ] == 0 ) {
      return true;
    } else {
      return false
    }
  }

  isPlayModeActive() {
    if ( this.boardProperties.mode.data.mode[ this.maxRecords - 1 ] == 1 ) {
      return true;
    } else {
      return false
    }
  }

  isRecordButtonPressed() {
    if ( mltk.boardProperties.record.data.record[ this.maxRecords - 1 ] == 1 ) {
      return true;
    } else {
      return false
    }
  }

  getColorimeterData() {
    var colorimeterData = [];
    colorimeterData[ 0 ] = this.boardProperties.colorimeter.data.R[ this.boardProperties.colorimeter.data.R.length - 1 ];
    colorimeterData[ 1 ] = this.boardProperties.colorimeter.data.G[ this.boardProperties.colorimeter.data.G.length - 1 ];
    colorimeterData[ 2 ] = this.boardProperties.colorimeter.data.B[ this.boardProperties.colorimeter.data.B.length - 1 ];
    return ( colorimeterData );
  }

  getGyroscopeData() {
    var gyroscopeData = [];
    gyroscopeData[ 0 ] = this.boardProperties.gyroscope.data.Gx[ this.boardProperties.gyroscope.data.Gx.length - 1 ];
    gyroscopeData[ 1 ] = this.boardProperties.gyroscope.data.Gy[ this.boardProperties.gyroscope.data.Gy.length - 1 ];
    gyroscopeData[ 2 ] = this.boardProperties.gyroscope.data.Gz[ this.boardProperties.gyroscope.data.Gz.length - 1 ];
    return ( gyroscopeData );
  }

  getMagnetometerData() {
    var magnetometerData = [];
    magnetometerData[ 0 ] = this.boardProperties.magnetometer.data.Mx[ this.boardProperties.magnetometer.data.Mx.length - 1 ];
    magnetometerData[ 1 ] = this.boardProperties.magnetometer.data.My[ this.boardProperties.magnetometer.data.My.length - 1 ];
    magnetometerData[ 2 ] = this.boardProperties.magnetometer.data.Mz[ this.boardProperties.magnetometer.data.Mz.length - 1 ];
    return ( magnetometerData );
  }

  getActiveClass() {
    return ( mltk.boardProperties.class.data.class[ this.maxRecords - 1 ] );
  }

  setRGBLed( r, g, b ) {
    var rgb_values = Uint8Array.of( r, g, b );
    this.boardProperties[ 'led' ].writeValue = rgb_values;
    this.BLEwriteTo( 'led' );
  }

  setLedRing( index, r, g, b ) {
    var rgb_values = Uint8Array.of( r, g, b );
    let propertyName = 'ledRing' + ( index + 1 );
    this.boardProperties[ propertyName ].writeValue = rgb_values;
    this.BLEwriteTo( propertyName );
  }

  // TODO: fix this function to write to the arduino characteristic
  setClass( c ) {
    let data = new Uint8Array( [ c ] )
    let propertyName = 'class'
    if ( c != this.boardProperties[ propertyName ].data.class[ 0 ] ) {
      this.boardProperties[ propertyName ].writeValue = data;
      this.BLEwriteTo( propertyName );
    }
  }

  BLEwriteTo( property ) {
    if ( this.boardProperties[ property ].writeBusy ) {
      console.log( "attempting to write to \"" + property + "\" ble busy, not writing" );
      return; // dropping writes when one is in progress instead of queuing as LED is non-critical / realtime
    }

    this.boardProperties[ property ].writeBusy = true; // Ensure no write happens when GATT operation in progress
    this.boardProperties[ property ].characteristic.writeValue( this.boardProperties[ property ].writeValue )
      .then( _ => {
        console.log( this.boardProperties[ property ].writeValue );

        this.boardProperties[ property ].writeBusy = false;
        console.log( "done writing to \"" + property + "\" !" );

      } )
      .catch( error => {
        console.log( error );
        this.boardProperties[ property ].writeBusy = false;

      } );
  }
}

function ab2str( buf ) {
  return String.fromCharCode.apply( null, new Uint16Array( buf ) );
}

function str2ab( str ) {
  var buf = new ArrayBuffer( str.length * 2 ); // 2 bytes for each char
  var bufView = new Uint16Array( buf );
  for ( var i = 0, strLen = str.length; i < strLen; i++ ) {
    bufView[ i ] = str.charCodeAt( i );
  }
  return buf;
}