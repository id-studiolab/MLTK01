void lightUpActiveClassInPink(int c) {
  for (int i = 0; i < NUMPIXELS; i++) {
    if (i == c) {
      pixels.setPixelColor(i, 255, 0, 25);
    } else {
      pixels.setPixelColor(i, 0, 0, 0);
    }
  }
  pixels.show();
}

void lightUpActiveClassInBlue(int c) {
  for (int i = 0; i < NUMPIXELS; i++) {
    if (i == c) {
      pixels.setPixelColor(i, 25, 0, 255);
    } else {
      pixels.setPixelColor(i, 0, 0, 0);
    }
  }
  pixels.show();
}
