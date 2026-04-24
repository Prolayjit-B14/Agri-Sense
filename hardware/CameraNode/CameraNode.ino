#include "esp_camera.h"
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  // Camera init code (omit for brevity, but needed in real sketch)
  
  WiFi.begin(ssid, password);
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  StaticJsonDocument<128> doc;
  JsonObject camera = doc.createNestedObject("camera");
  camera["lastPest"] = "Aphids";
  camera["pestConfidence"] = "92%";
  camera["feedStatus"] = "online";
  camera["threatLevel"] = "Medium";

  char buffer[128];
  serializeJson(doc, buffer);
  client.publish("agrisense/field_a/camera", buffer);
  
  delay(10000);
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("AgriSense_CamNode_01")) {
      // connected
    } else {
      delay(5000);
    }
  }
}
