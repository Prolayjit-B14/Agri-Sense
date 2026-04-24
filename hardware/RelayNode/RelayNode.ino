#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com";

#define RELAY_PIN 23

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void callback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<128> doc;
  deserializeJson(doc, payload);
  
  // Logic to handle command mapping
  // If JSON is {"Irrigation Pump": true} -> Relay ON
  if (doc["Irrigation Pump"] == true) {
    digitalWrite(RELAY_PIN, HIGH);
  } else if (doc["Irrigation Pump"] == false) {
    digitalWrite(RELAY_PIN, LOW);
  }
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("AgriSense_Relay_01")) {
      client.subscribe("agrisense/field_a/commands");
    } else {
      delay(5000);
    }
  }
}
