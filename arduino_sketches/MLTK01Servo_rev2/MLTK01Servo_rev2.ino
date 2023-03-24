//#define DEBUG
#include "DebugUtils.h"

#include <arm_math.h>
#include <Arduino_APDS9960.h>
#include <Arduino_HS300x.h>
#include <Arduino_LPS22HB.h>
#include <Arduino_BMI270_BMM150.h>
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

// IMPORTANT - limiting the rate at which we read the sensor makes fw much more robust
int sensorUpdateInterval = 100;
long lastSensorUpdate;

//some global variables to store sensor data reading to avoid any possible memory leaks
int sensor_r, sensor_g, sensor_b, ambientLight;
unsigned short sensor_colors[3];

int sensor_proximity;

int sensor_gesture;

float sensor_accel_x, sensor_accel_y, sensor_accel_z;
float sensor_gyro_x, sensor_gyro_y, sensor_gyro_z;
float sensor_mag_x, sensor_mag_y, sensor_mag_z;


//trying to allow only one sensor at the time to update it's ble characteristic value
int currentSensorTurn = 0;
int nSensorsToLoop = 7;

void setup() {
  init_mode_switch();
  init_record_button();
  init_encoder();

#ifdef DEBUG
  Serial.begin(115200);
  delay(1000);
  //while (!Serial); // use for debugging.
  Serial.println(F("Started"));
#endif

  if (!APDS.begin()) {
    DEBUG_PRINT(F("Failled to initialized APDS!"));
  }

  if (!HS300x.begin()) {
    DEBUG_PRINT(F("Failed to initialize humidity temperature sensor!"));
  }

  if (!BARO.begin()) {
    DEBUG_PRINT(F("Failled to initialized BARO!"));
  }

  if (!IMU.begin()) {
    DEBUG_PRINT(F("Failled to initialized IMU!"));
  }

  // configure the data receive callback
  PDM.onReceive(onPDMdata);

  // initialize PDM with:
  // - one channel (mono mode)
  // - a 16 kHz sample rate
  if (!PDM.begin(1, 16000)) {
    DEBUG_PRINT(F("Failed to start PDM!"));
  }

  if (!BLE.begin()) {
    DEBUG_PRINT(F("Failled to initialized BLE!"));
  }
  pixels.begin();  // This initializes the NeoPixel library.
  pixels.clear();
  pixels.show();


  String address = BLE.address();

  DEBUG_PRINT(F("address = "));
  DEBUG_PRINT(address);

  address.toUpperCase();

  name = "MLTK01-";
  name += address[address.length() - 5];
  name += address[address.length() - 4];
  name += address[address.length() - 2];
  name += address[address.length() - 1];

  DEBUG_PRINT(F("name = "));
  DEBUG_PRINT(name);


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


  if (BLE.connected() && (millis() - lastSensorUpdate > sensorUpdateInterval)) {

    switch (currentSensorTurn) {




      case 0:
        if ((canStreamData && (ambientLightCharacteristic.subscribed() || colorCharacteristic.subscribed())) && APDS.colorAvailable()) {
          DEBUG_PRINT(F("reading Colorimeter..."));
          APDS.readColor(sensor_r, sensor_g, sensor_b, ambientLight);
          ambientLightCharacteristic.writeValue(ambientLight);
          sensor_colors[0] = sensor_r;
          sensor_colors[1] = sensor_r;
          sensor_colors[2] = sensor_r;
          colorCharacteristic.writeValue(sensor_colors, sizeof(sensor_colors));
          DEBUG_PRINT(F("done"));
        }
        break;
      case 1:
        if (canStreamData && proximityCharacteristic.subscribed() && APDS.proximityAvailable()) {
          DEBUG_PRINT(F("reading proximity..."));
          sensor_proximity = APDS.readProximity();
          proximityCharacteristic.writeValue(sensor_proximity);
          DEBUG_PRINT(F("done"));
        }
        break;
      case 2:
        if (canStreamData && gestureCharacteristic.subscribed() && APDS.gestureAvailable()) {
          DEBUG_PRINT(F("reading gesture..."));
          int sensor_gesture = APDS.readGesture();
          gestureCharacteristic.writeValue(sensor_gesture);
          DEBUG_PRINT(F("done"));
        }
        break;
      case 3:
        if (canStreamData && accelerationCharacteristic.subscribed() && IMU.accelerationAvailable()) {
          DEBUG_PRINT(F("reading accel..."));
          IMU.readAcceleration(sensor_accel_x, sensor_accel_y, sensor_accel_z);
          float acceleration[3] = { sensor_accel_x, sensor_accel_y, sensor_accel_z };
          accelerationCharacteristic.writeValue(acceleration, sizeof(acceleration));
          DEBUG_PRINT(F("done"));
        }
        break;

      case 4:
        if (canStreamData && gyroscopeCharacteristic.subscribed() && IMU.gyroscopeAvailable()) {
          DEBUG_PRINT(F("reading gyroscope..."));
          IMU.readGyroscope(sensor_gyro_x, sensor_gyro_y, sensor_gyro_z);
          float dps[3] = { sensor_gyro_x, sensor_gyro_y, sensor_gyro_z };
          gyroscopeCharacteristic.writeValue(dps, sizeof(dps));
          DEBUG_PRINT(F("done"));
        }
        break;
      case 5:
        if (canStreamData && magneticFieldCharacteristic.subscribed() && IMU.magneticFieldAvailable()) {
          DEBUG_PRINT(F("reading magnometer..."));
          IMU.readMagneticField(sensor_mag_x, sensor_mag_y, sensor_mag_z);
          float magneticField[3] = { sensor_mag_x, sensor_mag_y, sensor_mag_z };
          magneticFieldCharacteristic.writeValue(magneticField, sizeof(magneticField));
          DEBUG_PRINT(F("done"));
        }
        break;
      case 6:
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
        break;
    }


    lastSensorUpdate = millis();
    if (currentSensorTurn < nSensorsToLoop) {
      currentSensorTurn++;
    } else {
      currentSensorTurn = 0;
    }
  }
}

void onPressureCharacteristicRead(BLEDevice central, BLECharacteristic characteristic) {
  //float pressure = BARO.readPressure();
  DEBUG_PRINT(F("pressure requested"));
  //pressureCharacteristic.writeValue(pressure);
}

void onTemperatureCharacteristicRead(BLEDevice central, BLECharacteristic characteristic) {
  float temperature = HS300x.readTemperature();
  DEBUG_PRINT(F("temperature requested"));
  temperatureCharacteristic.writeValue(temperature);
}

void onHumidityCharacteristicRead(BLEDevice central, BLECharacteristic characteristic) {
  float humidity = HS300x.readHumidity();
  DEBUG_PRINT(F("humidity requested"));
  humidityCharacteristic.writeValue(humidity);
}

void onSetIOMode(BLEDevice central, BLECharacteristic characteristic) {
  byte A0_MODE = IOConfigCharacteristic[0];
  byte A5_MODE = IOConfigCharacteristic[1];

  switch (A0_MODE) {
    case 0:
      pinMode(A0, INPUT);
      DEBUG_PRINT(F("configuring A0 as INPUT"));

      break;
    case 1:
      pinMode(A0, OUTPUT);
      DEBUG_PRINT(F("configuring A0 as OUTPUT"));

      break;
    case 2:
      servoA0.attach(A0);
      DEBUG_PRINT(F("configuring A0 as SERVO"));
      break;
  }

  switch (A5_MODE) {
    case 0:
      pinMode(A5, INPUT);
      DEBUG_PRINT(F("configuring A5 as INPUT"));

      break;
    case 1:
      pinMode(A5, OUTPUT);
      DEBUG_PRINT(F("configuring A5 as OUTPUT"));

      break;
    case 2:
      servoA5.attach(A5);
      DEBUG_PRINT(F("configuring A5 as SERVO"));
      break;
  }
}

void onA0CharacteristicWrite(BLEDevice cen2tral, BLECharacteristic characteristic) {
  DEBUG_PRINT(F("set A0 value to "));
  DEBUG_PRINT(IOA0ValueCharacteristic[0]);

  if (IOConfigCharacteristic[0] == 1) {
    analogWrite(A0, IOA0ValueCharacteristic[0]);
  } else if (IOConfigCharacteristic[0] == 2) {
    servoA0.write(IOA0ValueCharacteristic[0]);
  }
}


void onA5CharacteristicWrite(BLEDevice central, BLECharacteristic characteristic) {
  DEBUG_PRINT(F("set A5 value to "));
  DEBUG_PRINT(IOA5ValueCharacteristic[0]);
  DEBUG_PRINT(" ");

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
  DEBUG_PRINT(newClass);
  DEBUG_PRINT(" ");
}

void onLedRingCharacteristicWrite(BLEDevice central, BLECharacteristic characteristic) {
  byte r, g, b;
  if (characteristic.uuid() == ledRing1Characteristic.uuid()) {
    r = ledRing1Characteristic[0];
    g = ledRing1Characteristic[1];
    b = ledRing1Characteristic[2];
    pixels.setPixelColor(0, pixels.Color(r, g, b));  // Moderately bright green color.
  } else if (characteristic.uuid() == ledRing2Characteristic.uuid()) {
    r = ledRing2Characteristic[0];
    g = ledRing2Characteristic[1];
    b = ledRing2Characteristic[2];
    pixels.setPixelColor(1, pixels.Color(r, g, b));  // Moderately bright green color.
  } else if (characteristic.uuid() == ledRing3Characteristic.uuid()) {
    r = ledRing3Characteristic[0];
    g = ledRing3Characteristic[1];
    b = ledRing3Characteristic[2];
    pixels.setPixelColor(2, pixels.Color(r, g, b));  // Moderately bright green color.
  } else if (characteristic.uuid() == ledRing4Characteristic.uuid()) {
    r = ledRing4Characteristic[0];
    g = ledRing4Characteristic[1];
    b = ledRing4Characteristic[2];
    pixels.setPixelColor(3, pixels.Color(r, g, b));  // Moderately bright green color.
  } else if (characteristic.uuid() == ledRing5Characteristic.uuid()) {
    r = ledRing5Characteristic[0];
    g = ledRing5Characteristic[1];
    b = ledRing5Characteristic[2];
    pixels.setPixelColor(4, pixels.Color(r, g, b));  // Moderately bright green color.
  } else if (characteristic.uuid() == ledRing6Characteristic.uuid()) {
    r = ledRing6Characteristic[0];
    g = ledRing6Characteristic[1];
    b = ledRing6Characteristic[2];
    pixels.setPixelColor(5, pixels.Color(r, g, b));  // Moderately bright green color.
  } else if (characteristic.uuid() == ledRing7Characteristic.uuid()) {
    r = ledRing7Characteristic[0];
    g = ledRing7Characteristic[1];
    b = ledRing7Characteristic[2];
    pixels.setPixelColor(6, pixels.Color(r, g, b));  // Moderately bright green color.
  } else if (characteristic.uuid() == ledRing8Characteristic.uuid()) {
    r = ledRing8Characteristic[0];
    g = ledRing8Characteristic[1];
    b = ledRing8Characteristic[2];
    pixels.setPixelColor(7, pixels.Color(r, g, b));  // Moderately bright green color.
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
  DEBUG_PRINT(F("Connected event, central: "));
  DEBUG_PRINT(central.address());
}

void blePeripheralDisconnectHandler(BLEDevice central) {
  // central disconnected event handler
  DEBUG_PRINT(F("Disconnected event, central: "));
  DEBUG_PRINT(central.address());

  if (servoA0.attached()) {
    servoA0.detach();
  }

  if (servoA5.attached()) {
    servoA5.detach();
  }
}
