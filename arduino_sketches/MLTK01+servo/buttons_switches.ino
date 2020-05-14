void init_record_button() {
  pinMode(REC_BTN_PIN, INPUT_PULLUP);
  REC_BTN_debounder.attach(REC_BTN_PIN);
  REC_BTN_debounder.interval(5);
}

void read_record_Button() {
  REC_BTN_debounder.update();
  if ( REC_BTN_debounder.rose() ) {
    isRecBtnPressed = false;
    Serial.println("stop recording");
    updateRecordButtonCharacteristic();
  } else if ( REC_BTN_debounder.fell() ) {
    isRecBtnPressed = true;
    Serial.println("start recording");
    updateRecordButtonCharacteristic();
  }
}

void updateRecordButtonCharacteristic(){
   if (BLE.connected() &&recordButtonCharacteristic.subscribed()) {
      recordButtonCharacteristic.writeValue(isRecBtnPressed);
    }
}


void init_mode_switch() {
  pinMode(MODE_SWITCH_PIN, INPUT);
  MODE_SWITCH_debounder.attach(MODE_SWITCH_PIN);
  MODE_SWITCH_debounder.interval(5);
}

void read_mode_switch() {
  MODE_SWITCH_debounder.update();
  if ( MODE_SWITCH_debounder.rose() ) {
    activeMode = PLAY;
    Serial.println("entering play mode");
    updateModeSwitchCharacteristic();
  } else if ( MODE_SWITCH_debounder.fell() ) {
    activeMode = TRAIN;
    Serial.println("entering train mode");
    updateModeSwitchCharacteristic();
  }
}

void updateModeSwitchCharacteristic(){
   if (BLE.connected() &&modeCharacteristic.subscribed()) {
      modeCharacteristic.writeValue(activeMode);
    }
}
