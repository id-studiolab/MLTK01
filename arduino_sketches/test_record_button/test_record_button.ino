#include <Bounce2.h>

const byte REC_BTN_PIN = 3;
Bounce REC_BTN_debounder = Bounce();
bool isRecBtnPressed = 0;

void setup() {
  Serial.begin(9600);
init_record_button();
}

// the loop routine runs over and over again forever:
void loop() {
  read_record_Button();
}

void read_record_Button() {
  REC_BTN_debounder.update();
  if ( REC_BTN_debounder.rose() ) {
    isRecBtnPressed = true;
    Serial.println("start recording");
  } else if ( REC_BTN_debounder.fell() ) {
    isRecBtnPressed = false;
    Serial.println("stop recording");
  }
}

void init_record_button() {
  pinMode(REC_BTN_PIN, INPUT);
  REC_BTN_debounder.attach(REC_BTN_PIN);
  REC_BTN_debounder.interval(5);
}
