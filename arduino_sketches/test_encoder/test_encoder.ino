#include <Bounce2.h>
const byte ENCODER_PINA = A6;
const byte ENCODER_PINB = A7;
int valueA; //debounced encoder switch reads
int valueB;

bool motionDetected = false;
int grossCounter = 0; // total steps
int nettCounter = 0;  // cw-ccw
int fullRevolutions = 0;
int surplusSteps = 0; //part revs
bool CW;

byte cyclesPerRev = 15; //check encoder datasheet
// Instantiate 2 Bounce object
Bounce debouncerA = Bounce();
Bounce debouncerB = Bounce();

void setup() {
  Serial.begin(9600);
  init_encoder();
}

void loop() {
read_encoder();
}


void init_encoder() {
  pinMode(ENCODER_PINA, INPUT_PULLUP);
  pinMode(ENCODER_PINB, INPUT_PULLUP);
  // After setting up the button, setup debouncer
  debouncerA.attach(ENCODER_PINA);
  debouncerA.interval(5);
  debouncerB.attach(ENCODER_PINB);
  debouncerB.interval(5);

}

void read_encoder() {
  // Update the debouncers
  doDebounce();
  // Read the encoder switches
  doEncoderRead();
  //determine direction and update counter
  updateCounter();

}

void doDebounce() {
  debouncerA.update();
  debouncerB.update();
} 

void doEncoderRead() {
  valueA = debouncerA.read();
  valueB = debouncerB.read();
} 


void updateCounter() {

  /*
    the possibilites are:

    AB: in a detent
    if just arrived, update counter, clear motiondetected
    otherwise do nothing
    Ab: start of CW or end of CCW
    if start, set CW bool and set motionDetected
    if at end (know becasue motionDetected already set), do nothing
    aB: start of CCW or end of CW
    if start, clear CW bool and set motionDetected
    if at end (know becasue motionDetected already set), do nothing
    ab: in middle of either CW or CCW, do nothing
  */

  if (valueA && valueB && motionDetected ) { //in a detent and just arrived

    if (CW) {
      grossCounter = grossCounter + 1;
      nettCounter = nettCounter + 1;
    }
    else { //CCW
      grossCounter = grossCounter + 1;
      nettCounter = nettCounter - 1;
    }
    motionDetected = false;
    Serial.print("grossCounter: ");
    Serial.println(grossCounter);
    Serial.print("nettCounter: ");
    Serial.println(nettCounter);

    fullRevolutions = nettCounter / cyclesPerRev;
    surplusSteps = nettCounter % cyclesPerRev;

    Serial.print("Nett position: ");
    Serial.print(fullRevolutions);
    Serial.print(" + ");
    Serial.println(surplusSteps);
    Serial.println(" ");
  }

  if (valueA && !valueB && !motionDetected ) { // just started CW
    CW = true;
    motionDetected = true;
    Serial.println("CW");
  }

  if (!valueA && valueB && !motionDetected ) { //just started CCW
    CW = false;
    motionDetected = true;
    Serial.println("CCW");
  }
} //updateCounter
