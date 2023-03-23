#include <Bounce2.h>

const byte MODE_SWITCH_PIN = 4;
Bounce MODE_SWITCH_debounder = Bounce();
bool activeMode = 0;

void setup() {
  Serial.begin(9600);
  init_mode_switch();
}

// the loop routine runs over and over again forever:
void loop() {
  read_mode_switch();
}

void read_mode_switch() {
  MODE_SWITCH_debounder.update();
  if ( MODE_SWITCH_debounder.rose() ) {
    activeMode = true;
    Serial.println("entering play mode");
  } else if ( MODE_SWITCH_debounder.fell() ) {
    activeMode = false;
    Serial.println("entering train mode");
  }
}

void init_mode_switch() {
  pinMode(MODE_SWITCH_PIN, INPUT);
  MODE_SWITCH_debounder.attach(MODE_SWITCH_PIN);
  MODE_SWITCH_debounder.interval(5);
}
