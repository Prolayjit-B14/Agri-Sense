/**
 * AgriSense v3.95 Industrial Hardware Test Suite
 * Components: Soil (Moist, pH, NPK), Weather (Temp, Hum, Rain, LDR), OLED, Pump/Relay
 * Targets: ESP32-WROOM / ESP32-S3
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ─── PIN DEFINITIONS ────────────────────────────────────────────────────────
#define PIN_MOISTURE    34
#define PIN_PH          35
#define PIN_LDR         33
#define PIN_RAIN        32
#define PIN_DHT         4
#define PIN_PUMP_BTN    12
#define PIN_LED_STATUS  2
#define PIN_RELAY_PUMP  27

// ─── SENSOR CONFIG ──────────────────────────────────────────────────────────
#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// ─── NETWORK CONFIG ─────────────────────────────────────────────────────────
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "YOUR_MQTT_BROKER_URL"; // e.g., broker.emqx.io
const char* node_id = "soil_node_alpha";
const char* topic_telemetry = "agrisense/v1/node/soil/telemetry";

WiFiClient espClient;
PubSubClient client(espClient);

// ─── GLOBAL STATE ───────────────────────────────────────────────────────────
bool pumpState = false;
unsigned long lastMsg = 0;

void setup() {
  Serial.begin(115200);
  
  // Pin Modes
  pinMode(PIN_LED_STATUS, OUTPUT);
  pinMode(PIN_RELAY_PUMP, OUTPUT);
  pinMode(PIN_PUMP_BTN, INPUT_PULLUP);
  
  // Initialize Sensors
  dht.begin();
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0,0);
  display.println("AGRISENSE v3.95");
  display.println("Initializing...");
  display.display();

  setup_wifi();
  client.setServer(mqtt_server, 1883);
}

void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    digitalWrite(PIN_LED_STATUS, !digitalRead(PIN_LED_STATUS));
  }
  digitalWrite(PIN_LED_STATUS, HIGH);
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect(node_id)) {
      client.subscribe("agrisense/v1/commands");
    } else {
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // Local Pump Button Control
  if (digitalRead(PIN_PUMP_BTN) == LOW) {
    delay(50); // Debounce
    pumpState = !pumpState;
    digitalWrite(PIN_RELAY_PUMP, pumpState);
    while(digitalRead(PIN_PUMP_BTN) == LOW); // Wait for release
  }

  unsigned long now = millis();
  if (now - lastMsg > 10000) { // Publish every 10s
    lastMsg = now;

    // ─── READ SENSORS ───────────────────────────────────────────────────────
    float hum = dht.readHumidity();
    float temp = dht.readTemperature();
    int moist = map(analogRead(PIN_MOISTURE), 4095, 1200, 0, 100);
    float ph = (analogRead(PIN_PH) / 4095.0) * 14.0;
    int ldr = map(analogRead(PIN_LDR), 0, 4095, 100, 0);
    bool isRaining = digitalRead(PIN_RAIN) == LOW;

    // Mock NPK (Replace with RS485 read logic if using hardware NPK)
    int n = random(10, 50);
    int p = random(5, 30);
    int k = random(20, 80);

    // ─── UPDATE OLED ────────────────────────────────────────────────────────
    display.clearDisplay();
    display.setCursor(0,0);
    display.println("--- DIAGNOSTICS ---");
    display.printf("Moist: %d%% | pH: %.1f\n", moist, ph);
    display.printf("Temp: %.1fC | Hum: %.0f%%\n", temp, hum);
    display.printf("Rain: %s | LDR: %d\n", isRaining ? "YES" : "NO", ldr);
    display.printf("PUMP: %s\n", pumpState ? "ACTIVE" : "OFF");
    display.display();

    // ─── PREPARE MQTT PAYLOAD ───────────────────────────────────────────────
    StaticJsonDocument<512> doc;
    doc["device_id"] = node_id;
    doc["timestamp"] = millis(); // Simplified timestamp
    doc["rssi"] = WiFi.RSSI();
    doc["latency"] = 45; // Simulated latency
    
    doc["moisture"] = moist;
    doc["ph"] = ph;
    JsonObject npk = doc.createNestedObject("npk");
    npk["n"] = n;
    npk["p"] = p;
    npk["k"] = k;
    
    doc["temperature"] = temp;
    doc["humidity"] = hum;
    doc["rain"] = isRaining ? 1.0 : 0.0;
    doc["ldr"] = ldr;
    doc["pump_status"] = pumpState;

    char buffer[512];
    serializeJson(doc, buffer);
    client.publish(topic_telemetry, buffer);
  }
}
