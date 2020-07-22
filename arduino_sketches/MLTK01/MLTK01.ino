
void init_encoder() {
	pinMode(encoder0PinA, INPUT_PULLUP);
	pinMode(encoder0PinB, INPUT_PULLUP);

	// encoder pin on interrupt 0 (pin 2)
	attachInterrupt(digitalPinToInterrupt(encoder0PinA), doEncoderA, CHANGE);

	// encoder pin on interrupt 1 (pin 3)
	attachInterrupt(digitalPinToInterrupt(encoder0PinB), doEncoderB, CHANGE);
}

void scaleEncoder(int scale, int min, int max) {
	boolean changed = false;
	if (encoder0Pos > oldEncoderPos + scale) {
		scaledEncoderPos++;
		oldEncoderPos = encoder0Pos;
		if (scaledEncoderPos > max) {
			scaledEncoderPos = min;
		}
		Serial.println(encoder0Pos);
		Serial.println(scaledEncoderPos);
		Serial.println("-");
		changed = true;
	} else if (encoder0Pos < oldEncoderPos - scale) {
		scaledEncoderPos--;
		oldEncoderPos = encoder0Pos;
		if (scaledEncoderPos < min) {
			scaledEncoderPos = max;
		}
		Serial.println(encoder0Pos);
		Serial.println(scaledEncoderPos);
		Serial.println("-");
		changed = true;
	}

	if (changed) {
		updateEncoderCharacteristic();
	}
}

void updateEncoderCharacteristic() {
	if (BLE.connected() && encodervalueCharacteristic.subscribed()) {
		encodervalueCharacteristic.writeValue(encoder0Pos);
	}

	if (BLE.connected() && activeClassCharacteristic.subscribed()) {
		activeClassCharacteristic.writeValue(scaledEncoderPos);
	}
}

void doEncoderA() {
	// look for a low-to-high on channel A
	if (digitalRead(encoder0PinA) == HIGH) {
		_srevo
		// check channel B to see which way encoder is turning
		if (digitalRead(encoder0PinB) == LOW) {
			encoder0Pos++;            // CW
		}
		else {
			encoder0Pos--;            // CCW
		}
	}

	else    // must be a high-to-low edge on channel A
	{
		// check channel B to see which way encoder is turning
		if (digitalRead(encoder0PinB) == HIGH) {
			encoder0Pos++;             // CW
		}
		else {
			encoder0Pos--;             // CCW
		}
	}
}

void doEncoderB() {
	// look for a low-to-high on channel B
	if (digitalRead(encoder0PinB) == HIGH) {

		// check channel A to see which way encoder is turning
		if (digitalRead(encoder0PinA) == HIGH) {
			encoder0Pos++;            // CW
		}
		else {
			encoder0Pos--;            // CCW
		}
	}

	// Look for a high-to-low on channel B

	else {
		// check channel B to see which way encoder is turning
		if (digitalRead(encoder0PinA) == LOW) {
			encoder0Pos++;              // CW
		}
		else {
			encoder0Pos--;              // CCW
		}
	}
}
