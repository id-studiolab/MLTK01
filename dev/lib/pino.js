class Pino {
  constructor() {
    this.connected = false;

    this.boardProperties = {
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
      colorimeter: {
        uuid: '6fbe1da7-2002-44de-92c4-bb6e04fb0212',
        properties: [ 'BLENotify' ],
        structure: [ 'Uint16', 'Uint16', 'Uint16' ],
        data: { 'R': [], 'G': [], 'B': [] }
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
      proximity: {
        uuid: '6fbe1da7-2003-44de-92c4-bb6e04fb0212',
        properties: [ 'BLENotify' ],
        structure: [ 'Uint8' ],
        data: { proximity: [] }
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
      pressure: {
        uuid: '6fbe1da7-4001-44de-92c4-bb6e04fb0212',
        properties: [ 'BLERead' ],
        structure: [ 'Float32' ],
        data: { pressure: [] }
      }
    }

    this.maxRecords = 64;

    this.boardPropertiesNames = Object.keys( this.boardProperties );

    this.SERVICE_UUID = '6fbe1da7-0000-44de-92c4-bb6e04fb0212';

    var bytesReceived = 0;
    var bytesPrevious = 0;
  }

  updatestatusMsg( m ) {
    console.log( m );
    let sm = document.getElementById( "statusMsg" );
    sm.innerHTML = m;
  }

  async connect() {
    this.updatestatusMsg( 'requesting device ...' );

    const device = await navigator.bluetooth.requestDevice( {
      filters: [ {
        services: [ this.SERVICE_UUID ] // SERVICE_UUID
      } ]
    } );

    this.updatestatusMsg( 'connecting to device ...' );
    device.addEventListener( 'gattserverdisconnected', ( e ) => {
      this.onDisconnected();
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
          this.handleIncoming( this.boardProperties[ property ], event.target.value )
        } );
        await this.boardProperties[ property ].characteristic.startNotifications();
      }
      // Set up polling for read
      if ( this.boardProperties[ property ].properties.includes( "BLERead" ) ) {
        this.boardProperties[ property ].polling = setInterval( () => {
          this.boardProperties[ property ].characteristic.readValue().then( ( data ) => {
            this.handleIncoming( this.boardProperties[ property ], data );
          } );
        }, 500 );
      }

      this.boardProperties[ property ].rendered = false;
    }
    this.connected = true;
    this.updatestatusMsg( 'connected.' );
  }

  handleIncoming( sensor, dataReceived ) {
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
      this.packetPointer += typeMap[ dataType ].bytes;
      this.bytesReceived += typeMap[ dataType ].bytes;
      i++;
    } );
    sensor.rendered = false; // flag - vizualization needs to be updated
  }

  onDisconnected( event ) {
    let device = event.target;
    // clear read polling
    for ( const sensor of sensors ) {
      if ( typeof BLEsense[ sensor ].polling !== 'undefined' ) {
        clearInterval( BLEsense[ sensor ].polling );
      }
    }
    updatestatusMsg( 'Device ' + device.name + ' is disconnected.' );
    this.connected = false;

  }

  createPinoPanel() {
    var pinoPanel = document.createElement( "div" );
    pinoPanel.id = "pinoPanel";

    pinoPanel.innerHTML =
      '<div class="head">\n' +
      '<p class="title">pino</p>\n' +
      '</div>\n' +

      '<div id="statusMsg">\n' +
      '</div>\n' +

      '<div class="actions">\n' +
      '<input id="connect" type="button" value="connect" ">\n' +
      '<input id="disconnect" type="button" value="disconnect">\n' +
      '</div>\n'
    document.body.appendChild( pinoPanel );

    document.getElementById( "connect" ).addEventListener( "click", ( e ) => {
      this.connect();
    }, false );

    //document.getElementById( "disconnect" ).addEventListener( "click", this.disconnect );
  }

  setRGBLed( r, g, b ) {
    var rgb_values = Uint8Array.of( r, g, b );
    this.boardProperties[ 'led' ].writeValue = rgb_values;
    this.BLEwriteTo( 'led' );
  }

  BLEwriteTo( property ) {
    if ( this.boardProperties[ property ].writeBusy ) return; // dropping writes when one is in progress instead of queuing as LED is non-critical / realtime
    this.boardProperties[ property ].writeBusy = true; // Ensure no write happens when GATT operation in progress
    this.boardProperties[ property ].characteristic.writeValue( this.boardProperties[ property ].writeValue )
      .then( _ => {
        this.boardProperties[ property ].writeBusy = false;
      } )
      .catch( error => {
        console.log( error );
      } );
  }
}