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
  WiFi.begin(ssid, password);
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  StaticJsonDocument<200> doc;
  JsonObject storage = doc.createNestedObject("storage");
  storage["mq135"] = analogRead(35) / 1024.0; // Gas Level
  storage["temp"] = 4.5;
  storage["humidity"] = 88;
  storage["freshnessScore"] = 92;

  char buffer[200];
  serializeJson(doc, buffer);
  client.publish("agrisense/field_a/sensors", buffer);
  
  delay(5000);
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("AgriSense_StorageNode_01")) {
      // connected
    } else {
      delay(5000);
    }
  }
}
