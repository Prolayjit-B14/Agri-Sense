#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

/**
 * 🛰️ AgriSense v2.8.5 - Industrial Node Firmware
 * STRICT ARCHITECTURE: Each node is logically distinct.
 * Setup: ESP32 with Soil Moisture (GPIO34) + DHT11 (GPIO4) + Pump (GPIO26)
 */

// ================== NETWORK CONFIG ==================
const char* ssid = "Redmi Note 11 Pro+ 5G";         
const char* password = "@polu1411P"; 
const char* mqtt_server = "broker.hivemq.com";

// ================== PIN DEFINITIONS ==================
#define DHTPIN 4           
#define DHTTYPE DHT11      
#define MOISTURE_PIN 34    
#define PUMP_PIN 26        
#define STATUS_LED 2       

WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);

unsigned long lastMsg = 0;
bool pumpState = false;

void setup_wifi() {
  delay(10);
  Serial.println("\n📡 Connecting...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
  }
  digitalWrite(STATUS_LED, HIGH);
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) message += (char)payload[i];
  
  if (message.indexOf("PUMP_ON") >= 0) {
    digitalWrite(PUMP_PIN, HIGH);
    pumpState = true;
  } else if (message.indexOf("PUMP_OFF") >= 0) {
    digitalWrite(PUMP_PIN, LOW);
    pumpState = false;
  }
}

void reconnect() {
  while (!client.connected()) {
    String clientId = "AgriSenseNode-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      // Subscribing specifically to irrigation commands
      client.subscribe("agrisense/field_a/water/commands");
    } else {
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
  if (now - lastMsg > 3000) { 
    lastMsg = now;

    // 1. READ PHYSICAL SENSORS
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int mRaw = analogRead(MOISTURE_PIN);
    int mPercent = constrain(map(mRaw, 3500, 1500, 0, 100), 0, 100);

    if (isnan(h) || isnan(t)) { h = 0; t = 0; }

    // ─── LOGICAL NODE 1: SOIL ──────────────────────────────────────────────
    StaticJsonDocument<128> soilDoc;
    soilDoc["moisture"] = mPercent;
    // Note: Temperature for soil node is omitted unless a dedicated probe is added
    
    char soilBuffer[128];
    serializeJson(soilDoc, soilBuffer);
    client.publish("agrisense/field_a/soil", soilBuffer);

    // ─── LOGICAL NODE 2: WEATHER ───────────────────────────────────────────
    StaticJsonDocument<128> weatherDoc;
    weatherDoc["temp"] = t;
    weatherDoc["humidity"] = h;
    
    char weatherBuffer[128];
    serializeJson(weatherDoc, weatherBuffer);
    client.publish("agrisense/field_a/weather", weatherBuffer);

    // ─── LOGICAL NODE 3: WATER/IRRIGATION ──────────────────────────────────
    StaticJsonDocument<128> waterDoc;
    waterDoc["flowRate"] = pumpState ? 12.5 : 0;
    waterDoc["pumpActive"] = pumpState;
    
    char waterBuffer[128];
    serializeJson(waterDoc, waterBuffer);
    client.publish("agrisense/field_a/water", waterBuffer);

    Serial.println("📤 Multi-Node Telemetry Published");
  }
}
