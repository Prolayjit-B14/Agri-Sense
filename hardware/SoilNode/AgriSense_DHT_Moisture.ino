#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

/**
 * AgriSense V2.1 - DHT & Moisture Testing Sketch 🚀
 * Hardware: ESP32 + DHT11/22 + Capacitive Soil Moisture Sensor
 */

// 1. WiFi & MQTT Credentials (Edit these!)
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com";

// 2. Hardware Mapping
#define MOISTURE_PIN 34  // Analog Input
#define DHTPIN 4         // Digital Input
#define DHTTYPE DHT11    // Change to DHT22 if needed
#define PUMP_PIN 26      // Actuator (Relay)
#define STATUS_LED 2     // Onboard LED

WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);

unsigned long lastMsg = 0;
char msg[256];

void setup_wifi() {
  delay(10);
  Serial.println("\n--- WiFi Initializing ---");
  Serial.print("Connecting to: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED)); // Heartbeat
  }

  randomSeed(micros());
  Serial.println("\nWiFi Connected ✅");
  digitalWrite(STATUS_LED, HIGH);
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) message += (char)payload[i];
  
  Serial.print("Command Inbound: ");
  Serial.println(message);

  if (message.indexOf("PUMP_ON") >= 0) {
    digitalWrite(PUMP_PIN, HIGH);
    Serial.println(">>> PUMP ACTIVATED");
  } else if (message.indexOf("PUMP_OFF") >= 0) {
    digitalWrite(PUMP_PIN, LOW);
    Serial.println(">>> PUMP DEACTIVATED");
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "AgriSense-TestNode-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      Serial.println("Connected 🚀");
      client.subscribe("agrisense/field_a/commands");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5s...");
      delay(5000);
    }
  }
}

void setup() {
  pinMode(STATUS_LED, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);
  
  Serial.begin(115200);
  dht.begin();
  setup_wifi();
  
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > 3000) { // 3-second testing pulse
    lastMsg = now;

    // A. Read Sensors
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int moistureRaw = analogRead(MOISTURE_PIN);
    
    // B. Calibration (Adjust 4095/1200 based on your sensor dry/wet peaks)
    int moisturePer = map(moistureRaw, 4095, 1200, 0, 100); 
    moisturePer = constrain(moisturePer, 0, 100);

    if (isnan(h) || isnan(t)) {
      Serial.println("⚠️ DHT Sensor Read Failure!");
      return;
    }

    // C. Data Synthesis
    StaticJsonDocument<256> doc;
    JsonObject soil = doc.createNestedObject("soil");
    soil["moisture"] = moisturePer;
    soil["healthIndex"] = (moisturePer > 30 && moisturePer < 80) ? 95 : 60;

    JsonObject weather = doc.createNestedObject("weather");
    weather["temp"] = t;
    weather["humidity"] = h;

    serializeJson(doc, msg);
    Serial.print("Pushing Payload: ");
    Serial.println(msg);
    client.publish("agrisense/field_a/sensors", msg);
  }
}
