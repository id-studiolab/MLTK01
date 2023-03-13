#include <arm_math.h>
#include <Arduino_APDS9960.h>



void setup() {
  Serial.begin (115200);

  if (!APDS.begin()) {
    Serial.println("Failled to initialized APDS!");
    while (1);
  }
}

void loop() {
  if ( APDS.colorAvailable()) {
    int r, g, b, ambientLight;
    APDS.readColor(r, g, b, ambientLight);

    Serial.print("r: \t");
    Serial.print(r);
    Serial.print('\t');

    Serial.print("g: \t");
    Serial.print(g);
    Serial.print('\t');

    Serial.print("b: \t");
    Serial.print(b);
    Serial.println('\t');
  }
}
