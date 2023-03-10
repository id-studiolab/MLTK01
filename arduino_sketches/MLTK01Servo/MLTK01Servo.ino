#include <arm_math.h>
#include <Arduino_APDS9960.h>
#include <Arduino_HTS221.h>
#include <Arduino_LPS22HB.h>
#include <Arduino_LSM9DS1.h>
#include <PDM.h>
#include <ArduinoBLE.h>

#include <Servo.h>
Servo servoA0;
Servo servoA5;

//NEOPIXELS
#include <Adafruit_NeoPixel.h>
#define PIN 5
#define NUMPIXELS 8
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ400);
enum ledMode { AUTO,
               MANUAL };
ledMode ledRingMode = AUTO;  // 0-> means controlled by Arduino 1-> when led are overwritten by the BLE service

//ENCODER
#include <Bounce2.h>
#define encoder0PinA 10
#define encoder0PinB 9

float encoder0Pos = 0;
int oldEncoderPos = 0;
int scaledEncoderPos = 0;

//RECORD BUTTON
const byte REC_BTN_PIN = 3;
Bounce REC_BTN_debounder = Bounce();
bool isRecBtnPressed = 0;

//MODE SWITCH
const byte MODE_SWITCH_PIN = 4;
Bounce MODE_SWITCH_debounder = Bounce();
enum boardMode { TRAIN,
                 PLAY };
boardMode activeMode = TRAIN;

//BLE PROPERTIES
#define BLE_SENSE_UUID(val) ("6fbe1da7-" val "-44de-92c4-bb6e04fb0212")
const int VERSION = 0x00000000;


BLEService service(BLE_SENSE_UUID("0000"));
BLEUnsignedIntCharacteristic versionCharacteristic(BLE_SENSE_UUID("1001"), BLERead);
BLEUnsignedShortCharacteristic ambientLightCharacteristic(BLE_SENSE_UUID("2001"), BLENotify);          // 16-bit
BLECharacteristic colorCharacteristic(BLE_SENSE_UUID("2002"), BLENotify, 3 * sizeof(unsigned short));  // Array of 16-bit, RGB
BLEUnsignedCharCharacteristic proximityCharacteristic(BLE_SENSE_UUID("2003"), BLENotify);              // Byte, 0 - 255 => close to far
BLEByteCharacteristic gestureCharacteristic(BLE_SENSE_UUID("2004"), BLENotify);                        // NONE = -1, UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3
BLECharacteristic accelerationCharacteristic(BLE_SENSE_UUID("3001"), BLENotify, 3 * sizeof(float));    // Array of 3 floats, G
BLECharacteristic gyroscopeCharacteristic(BLE_SENSE_UUID("3002"), BLENotify, 3 * sizeof(float));       // Array of 3 floats, dps
BLECharacteristic magneticFieldCharacteristic(BLE_SENSE_UUID("3003"), BLENotify, 3 * sizeof(float));   // Array of 3 floats, uT

BLEFloatCharacteristic pressureCharacteristic(BLE_SENSE_UUID("4001"), BLERead);                        // Float, kPa
BLEFloatCharacteristic temperatureCharacteristic(BLE_SENSE_UUID("4002"), BLERead);                     // Float, Celcius
BLEFloatCharacteristic humidityCharacteristic(BLE_SENSE_UUID("4003"), BLERead);                        // Float, Percentage
BLECharacteristic microphoneLevelCharacteristic(BLE_SENSE_UUID("5001"), BLENotify, 32);                // Int, RMS of audio input
BLECharacteristic rgbLedCharacteristic(BLE_SENSE_UUID("6001"), BLERead | BLEWrite, 3 * sizeof(byte));  // Array of 3 bytes, RGB

BLECharacteristic ledRing1Characteristic(BLE_SENSE_UUID("7001"), BLERead | BLEWrite, 3 * sizeof(byte), true);  // Array of 3 bytes times 8 leds, RGB
BLECharacteristic ledRing2Characteristic(BLE_SENSE_UUID("7002"), BLERead | BLEWrite, 3 * sizeof(byte), true);  // Array of 3 bytes times 8 leds, RGB
BLECharacteristic ledRing3Characteristic(BLE_SENSE_UUID("7003"), BLERead | BLEWrite, 3 * sizeof(byte), true);  // Array of 3 bytes times 8 leds, RGB
BLECharacteristic ledRing4Characteristic(BLE_SENSE_UUID("7004"), BLERead | BLEWrite, 3 * sizeof(byte), true);  // Array of 3 bytes times 8 leds, RGB
BLECharacteristic ledRing5Characteristic(BLE_SENSE_UUID("7005"), BLERead | BLEWrite, 3 * sizeof(byte), true);  // Array of 3 bytes times 8 leds, RGB
BLECharacteristic ledRing6Characteristic(BLE_SENSE_UUID("7006"), BLERead | BLEWrite, 3 * sizeof(byte), true);  // Array of 3 bytes times 8 leds, RGB
BLECharacteristic ledRing7Characteristic(BLE_SENSE_UUID("7007"), BLERead | BLEWrite, 3 * sizeof(byte), true);  // Array of 3 bytes times 8 leds, RGB
BLECharacteristic ledRing8Characteristic(BLE_SENSE_UUID("7008"), BLERead | BLEWrite, 3 * sizeof(byte), true);  // Array of 3 bytes times 8 leds, RGB

BLEIntCharacteristic encodervalueCharacteristic(BLE_SENSE_UUID("8001"), BLERead | BLENotify);

BLEBooleanCharacteristic modeCharacteristic(BLE_SENSE_UUID("8002"), BLERead | BLENotify);
BLEBooleanCharacteristic recordButtonCharacteristic(BLE_SENSE_UUID("8003"), BLERead | BLENotify);

BLEUnsignedIntCharacteristic activeClassCharacteristic(BLE_SENSE_UUID("9001"), BLEWrite | BLERead | BLENotify);

//first byte use for A0 second byte used for A5 00=analog input, 01=analog output, 02=servomotor,
BLECharacteristic IOConfigCharacteristic(BLE_SENSE_UUID("0101"), BLEWrite | BLERead, 2 * sizeof(byte), true);
BLEUnsignedIntCharacteristic IOA0ValueCharacteristic(BLE_SENSE_UUID("0102"), BLEWrite | BLERead | BLENotify);
BLEUnsignedIntCharacteristic IOA5ValueCharacteristic(BLE_SENSE_UUID("0103"), BLEWrite | BLERead | BLENotify);

int activeClass = -1;

// String to calculate the local and device name
String name;

// buffer to read samples into, each sample is 16-bits
short sampleBuffer[256];

arm_rfft_instance_q15 FFT;

// number of samples read
volatile int samplesRead;

//to limit the amount of data sent to the webpage, we stream data only when in play mode or when we are recording data for a training
bool canStreamData = false;


void setup() {
  init_mode_switch();
  init_record_button();
  init_encoder();

  // Serial.begin(115200);
  delay(1000);

  //while (!Serial); // for debugging
  Serial.println("Started");

  if (!APDS.begin()) {
    Serial.println("Failled to initialized APDS!");
    while (1)
      ;
  }

  if (!HTS.begin()) {
    Serial.println("Failled to initialized HTS!");
    while (1)
      ;
  }

  if (!BARO.begin()) {
    Serial.println("Failled to initialized BARO!");
    while (1)
      ;
  }

  if (!IMU.begin()) {
    Serial.println("Failled to initialized IMU!");
    while (1)
      ;
  }

  // configure the data receive callback
  PDM.onReceive(onPDMdata);

  // initialize PDM with:
  // - one channel (mono mode)
  // - a 16 kHz sample rate
  if (!PDM.begin(1, 16000)) {
    Serial.println("Failed to start PDM!");
    while (1)
      ;
  }

  if (!BLE.begin()) {
    Serial.println("Failled to initialized BLE!");
    while (1)
      ;
  }
  pixels.begin();  // This initializes the NeoPixel library.
  pixels.clear();
  pixels.show();


  String address = BLE.address();

  Serial.print("address = ");
  Serial.println(address);

  address.toUpperCase();

  name = "MLTK01-";
  name += address[address.length() - 5];
  name += address[address.length() - 4];
  name += address[address.length() - 2];
  name += address[address.length() - 1];

  Serial.print("name = ");
  Serial.println(name);


  BLE.setLocalName(name.c_str());
  BLE.setDeviceName(name.c_str());
  BLE.setAdvertisedService(service);

  service.addCharacteristic(versionCharacteristic);
  service.addCharacteristic(ambientLightCharacteristic);
  service.addCharacteristic(colorCharacteristic);
  service.addCharacteristic(proximityCharacteristic);
  service.addCharacteristic(gestureCharacteristic);
  service.addCharacteristic(accelerationCharacteristic);
  service.addCharacteristic(gyroscopeCharacteristic);
  service.addCharacteristic(magneticFieldCharacteristic);

  service.addCharacteristic(pressureCharacteristic);
  service.addCharacteristic(temperatureCharacteristic);
  service.addCharacteristic(humidityCharacteristic);
  service.addCharacteristic(microphoneLevelCharacteristic);
  service.addCharacteristic(rgbLedCharacteristic);

  service.addCharacteristic(ledRing1Characteristic);
  service.addCharacteristic(ledRing2Characteristic);
  service.addCharacteristic(ledRing3Characteristic);
  service.addCharacteristic(ledRing4Characteristic);
  service.addCharacteristic(ledRing5Characteristic);
  service.addCharacteristic(ledRing6Characteristic);
  service.addCharacteristic(ledRing7Characteristic);
  service.addCharacteristic(ledRing8Characteristic);

  service.addCharacteristic(encodervalueCharacteristic);
  service.addCharacteristic(modeCharacteristic);
  service.addCharacteristic(recordButtonCharacteristic);

  service.addCharacteristic(activeClassCharacteristic);

  service.addCharacteristic(IOConfigCharacteristic);
  service.addCharacteristic(IOA0ValueCharacteristic);
  service.addCharacteristic(IOA5ValueCharacteristic);

  BLE.addService(service);

  BLE.setEventHandler(BLEConnected, blePeripheralConnectHandler);
  BLE.setEventHandler(BLEDisconnected, blePeripheralDisconnectHandler);

  versionCharacteristic.setValue(VERSION);
  pressureCharacteristic.setEventHandler(BLERead, onPressureCharacteristicRead);
  temperatureCharacteristic.setEventHandler(BLERead, onTemperatureCharacteristicRead);
  humidityCharacteristic.setEventHandler(BLERead, onHumidityCharacteristicRead);
  rgbLedCharacteristic.setEventHandler(BLEWritten, onRgbLedCharacteristicWrite);

  ledRing1Characteristic.setEventHandler(BLEWritten, onLedRingCharacteristicWrite);
  ledRing2Characteristic.setEventHandler(BLEWritten, onLedRingCharacteristicWrite);
  ledRing3Characteristic.setEventHandler(BLEWritten, onLedRingCharacteristicWrite);
  ledRing4Characteristic.setEventHandler(BLEWritten, onLedRingCharacteristicWrite);
  ledRing5Characteristic.setEventHandler(BLEWritten, onLedRingCharacteristicWrite);
  ledRing6Characteristic.setEventHandler(BLEWritten, onLedRingCharacteristicWrite);
  ledRing7Characteristic.setEventHandler(BLEWritten, onLedRingCharacteristicWrite);
  ledRing8Characteristic.setEventHandler(BLEWritten, onLedRingCharacteristicWrite);

  activeClassCharacteristic.setEventHandler(BLEWritten, onClassCharacteristicWrite);

  IOConfigCharacteristic.setEventHandler(BLEWritten, onSetIOMode);
  IOA0ValueCharacteristic.setEventHandler(BLEWritten, onA0CharacteristicWrite);
  IOA5ValueCharacteristic.setEventHandler(BLEWritten, onA5CharacteristicWrite);

  BLE.advertise();
}

void loop() {

  read_mode_switch();

  if (activeMode == TRAIN) {
    scaleEncoder(2, 0, 7);
    activeClass = scaledEncoderPos;
    read_record_Button();
    if (ledRingMode == AUTO) {
      lightUpActiveClassInPink(activeClass);
    }
  } else {
    lightUpActiveClassInBlue(activeClass);
  }

  if ((activeMode == TRAIN && isRecBtnPressed) || activeMode == PLAY) {
    canStreamData = true;
  } else {
    canStreamData = false;
  }


  BLE.poll();

  if (BLE.connected()) {


    if ((canStreamData && (ambientLightCharacteristic.subscribed() || colorCharacteristic.subscribed())) && APDS.colorAvailable()) {
      int r, g, b, ambientLight;

      APDS.readColor(r, g, b, ambientLight);

      ambientLightCharacteristic.writeValue(ambientLight);

      unsigned short colors[3] = { r, g, b };

      colorCharacteristic.writeValue(colors, sizeof(colors));


      // print the values
      Serial.print("r = ");
      Serial.print(r);
      Serial.print('\t');
      Serial.print(colors[0]);
      Serial.print('\t');

      Serial.print("g = ");
      Serial.print(g);
      Serial.print('\t');
      Serial.print(colors[1]);
      Serial.print('\t');

      Serial.print("b = ");
      Serial.print(b);
      Serial.print('\t');
      Serial.print(colors[2]);
      Serial.print('\t');

      Serial.println();
    }

    if (canStreamData && proximityCharacteristic.subscribed() && APDS.proximityAvailable()) {
      int proximity = APDS.readProximity();

      proximityCharacteristic.writeValue(proximity);
    }

    if (canStreamData && gestureCharacteristic.subscribed() && APDS.gestureAvailable()) {
      int gesture = APDS.readGesture();

      gestureCharacteristic.writeValue(gesture);
    }

    if (canStreamData && accelerationCharacteristic.subscribed() && IMU.accelerationAvailable()) {
      float x, y, z;

      IMU.readAcceleration(x, y, z);

      float acceleration[3] = { x, y, z };

      accelerationCharacteristic.writeValue(acceleration, sizeof(acceleration));
    }

    if (canStreamData && gyroscopeCharacteristic.subscribed() && IMU.gyroscopeAvailable()) {
      float x, y, z;

      IMU.readGyroscope(x, y, z);

      float dps[3] = { x, y, z };

      gyroscopeCharacteristic.writeValue(dps, sizeof(dps));
    }

    if (canStreamData && magneticFieldCharacteristic.subscribed() && IMU.magneticFieldAvailable()) {
      float x, y, z;

      IMU.readMagneticField(x, y, z);

      float magneticField[3] = { x, y, z };

      magneticFieldCharacteristic.writeValue(magneticField, sizeof(magneticField));
    }

    if (canStreamData && microphoneLevelCharacteristic.subscribed() && samplesRead) {
      short micLevel;
      // arm_rms_q15 (sampleBuffer, samplesRead, &micLevel);

      static arm_rfft_instance_q15 fft_instance;
      static q15_t fftoutput[256 * 2];  //has to be twice FFT size
      static byte spectrum[32];
      arm_rfft_init_q15(&fft_instance, 256 /*bin count*/, 0 /*forward FFT*/, 1 /*output bit order is normal*/);
      arm_rfft_q15(&fft_instance, (q15_t *)sampleBuffer, fftoutput);
      arm_abs_q15(fftoutput, fftoutput, 256);

      float temp = 0;
      for (int i = 1; i < 256; i++) {
        temp = temp + fftoutput[i];
        if ((i & 3) == 2) {
          if (temp > 1023) {
            temp = 1023;
          };
          spectrum[i >> 3] = (byte)(temp / 2);
          temp = 0;
        }
      }
      microphoneLevelCharacteristic.writeValue((byte *)&spectrum, 32);
      samplesRead = 0;
    }
  }
}

void onPressureCharacteristicRead(BLEDevice central, BLECharacteristic characteristic) {
  float pressure = BARO.readPressure();

  pressureCharacteristic.writeValue(pressure);
}

void onTemperatureCharacteristicRead(BLEDevice central, BLECharacteristic characteristic) {
  float temperature = HTS.readTemperature() - 5;

  temperatureCharacteristic.writeValue(temperature);
}

void onHumidityCharacteristicRead(BLEDevice central, BLECharacteristic characteristic) {
  float humidity = HTS.readHumidity();

  humidityCharacteristic.writeValue(humidity);
}

void onSetIOMode(BLEDevice central, BLECharacteristic characteristic) {
  byte A0_MODE = IOConfigCharacteristic[0];
  byte A5_MODE = IOConfigCharacteristic[1];

  Serial.println("configuring IO");
  Serial.print("A0_MODE: ");
  Serial.print(A0_MODE);

  Serial.print("- A5_MODE: ");
  Serial.println(A5_MODE);

  switch (A0_MODE) {
    case 0:
      pinMode(A0, INPUT);
      Serial.println("configuring A0 as INPUT");

      break;
    case 1:
      pinMode(A0, OUTPUT);
      Serial.println("configuring A0 as OUTPUT");

      break;
    case 2:
      servoA0.attach(A0);
      Serial.println("configuring A0 as SERVO");
      break;
  }

  switch (A5_MODE) {
    case 0:
      pinMode(A5, INPUT);
      Serial.println("configuring A5 as INPUT");

      break;
    case 1:
      pinMode(A5, OUTPUT);
      Serial.println("configuring A5 as OUTPUT");

      break;
    case 2:
      servoA5.attach(A5);
      Serial.println("configuring A5 as SERVO");
      break;
  }
}

void onA0CharacteristicWrite(BLEDevice cen2tral, BLECharacteristic characteristic) {
  Serial.print("set A0 value to ");
  Serial.println(IOA0ValueCharacteristic[0]);

  if (IOConfigCharacteristic[0] == 1) {
    analogWrite(A0, IOA0ValueCharacteristic[0]);
  } else if (IOConfigCharacteristic[0] == 2) {
    servoA0.write(IOA0ValueCharacteristic[0]);
  }
}


void onA5CharacteristicWrite(BLEDevice central, BLECharacteristic characteristic) {
  Serial.print("set A5 value to ");
  Serial.println(IOA5ValueCharacteristic[0]);

  if (IOConfigCharacteristic[1] == 1) {
    analogWrite(A5, IOA5ValueCharacteristic[0]);
  } else if (IOConfigCharacteristic[1] == 2) {
    servoA5.write(IOA5ValueCharacteristic[0]);
  }
}



void onRgbLedCharacteristicWrite(BLEDevice central, BLECharacteristic characteristic) {
  byte r = rgbLedCharacteristic[0];
  byte g = rgbLedCharacteristic[1];
  byte b = rgbLedCharacteristic[2];

  setLedPinValue(LEDR, r);
  setLedPinValue(LEDG, g);
  setLedPinValue(LEDB, b);
}

void onClassCharacteristicWrite(BLEDevice central, BLECharacteristic characteristic) {
  byte newClass = activeClassCharacteristic[0];
  activeClass = newClass;
  Serial.println(newClass);
}

void onLedRingCharacteristicWrite(BLEDevice central, BLECharacteristic characteristic) {
  byte r, g, b;
  if (characteristic.uuid() == ledRing1Characteristic.uuid()) {
    r = ledRing1Characteristic[0];
    g = ledRing1Characteristic[1];
    b = ledRing1Characteristic[2];
    pixels.setPixelColor(0, pixels.Color(r, g, b));
  } else if (characteristic.uuid() == ledRing2Characteristic.uuid()) {
    r = ledRing2Characteristic[0];
    g = ledRing2Characteristic[1];
    b = ledRing2Characteristic[2];
    pixels.setPixelColor(1, pixels.Color(r, g, b));
  } else if (characteristic.uuid() == ledRing3Characteristic.uuid()) {
    r = ledRing3Characteristic[0];
    g = ledRing3Characteristic[1];
    b = ledRing3Characteristic[2];
    pixels.setPixelColor(2, pixels.Color(r, g, b));
  } else if (characteristic.uuid() == ledRing4Characteristic.uuid()) {
    r = ledRing4Characteristic[0];
    g = ledRing4Characteristic[1];
    b = ledRing4Characteristic[2];
    pixels.setPixelColor(3, pixels.Color(r, g, b));
  } else if (characteristic.uuid() == ledRing5Characteristic.uuid()) {
    r = ledRing5Characteristic[0];
    g = ledRing5Characteristic[1];
    b = ledRing5Characteristic[2];
    pixels.setPixelColor(4, pixels.Color(r, g, b));
  } else if (characteristic.uuid() == ledRing6Characteristic.uuid()) {
    r = ledRing6Characteristic[0];
    g = ledRing6Characteristic[1];
    b = ledRing6Characteristic[2];
    pixels.setPixelColor(5, pixels.Color(r, g, b));
  } else if (characteristic.uuid() == ledRing7Characteristic.uuid()) {
    r = ledRing7Characteristic[0];
    g = ledRing7Characteristic[1];
    b = ledRing7Characteristic[2];
    pixels.setPixelColor(6, pixels.Color(r, g, b));
  } else if (characteristic.uuid() == ledRing8Characteristic.uuid()) {
    r = ledRing8Characteristic[0];
    g = ledRing8Characteristic[1];
    b = ledRing8Characteristic[2];
    pixels.setPixelColor(7, pixels.Color(r, g, b));
  }
  pixels.show();
}


void setLedPinValue(int pin, int value) {
  // RGB LED's are pulled up, so the PWM needs to be inverted

  if (value == 0) {
    // special hack to clear LED
    analogWrite(pin, 256);
  } else {
    analogWrite(pin, 255 - value);
  }
}

void onPDMdata() {
  // query the number of bytes available
  int bytesAvailable = PDM.available();

  // read into the sample buffer
  PDM.read(sampleBuffer, bytesAvailable);

  // 16-bit, 2 bytes per sample
  samplesRead = bytesAvailable / 2;
}


void blePeripheralConnectHandler(BLEDevice central) {
  // central connected event handler
  Serial.print("Connected event, central: ");
  Serial.println(central.address());
}

void blePeripheralDisconnectHandler(BLEDevice central) {
  // central disconnected event handler
  Serial.print("Disconnected event, central: ");
  Serial.println(central.address());

  if (servoA0.attached()) {
    servoA0.detach();
  }

  if (servoA5.attached()) {
    servoA5.detach();
  }
}
