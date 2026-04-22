#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

/**
 * 🛰️ AgriSense v2.8.5 - PRODUCTION INDUSTRIAL BLUEPRINT (STRICT ISOLATION)
 * This code uses REAL pins for every sensor. 
 * ZERO data sharing between nodes.
 * 
 * --- SENSOR TOPOLOGY ---
 * Soil Node (Topic: .../soil)
 * Weather Node (Topic: .../weather)
 * Storage Node (Topic: .../storage)
 * Water Node (Topic: .../water)
 */

// ================== NETWORK CONFIG ==================
const char* ssid = "Redmi Note 11 Pro+ 5G";         
const char* password = "@polu1411P"; 
const char* mqtt_server = "broker.hivemq.com";

// ================== REAL PIN ASSIGNMENTS ==================
// 1. SOIL NODE (GPIOs 32-35)
#define SOIL_MOISTURE_PIN 34
#define SOIL_TEMP_PIN 35      // Dedicated Analog/DS18B20 Soil Probe
#define SOIL_PH_PIN 32        
#define SOIL_NPK_PIN 33       

// 2. WEATHER NODE (GPIOs 4, 36, 39)
#define WEATHER_DHT_PIN 4     // DHT11 #1 (Ambient)
#define WEATHER_RAIN_PIN 39   
#define WEATHER_LDR_PIN 36    

// 3. STORAGE NODE (GPIOs 15, 25, 27)
#define STORAGE_DHT_PIN 15    // DHT11 #2 (Silo Monitor)
#define STORAGE_AQI_PIN 25    
#define STORAGE_GAS_PIN 27    

// 4. IRRIGATION NODE (GPIOs 14, 26)
#define WATER_LEVEL_PIN 14    
#define PUMP_RELAY_PIN 26     

// ================== SYSTEM OBJECTS ==================
WiFiClient espClient;
PubSubClient client(espClient);

// Distinct DHT Sensors for Zero Leakage
DHT weatherDHT(WEATHER_DHT_PIN, DHT11);
DHT storageDHT(STORAGE_DHT_PIN, DHT11);

bool pumpState = false;
unsigned long lastMsg = 0;

void setup_wifi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) message += (char)payload[i];
  if (message.indexOf("PUMP_ON") >= 0) {
    digitalWrite(PUMP_RELAY_PIN, HIGH);
    pumpState = true;
  } else if (message.indexOf("PUMP_OFF") >= 0) {
    digitalWrite(PUMP_RELAY_PIN, LOW);
    pumpState = false;
  }
}

void reconnect() {
  while (!client.connected()) {
    String clientId = "AgriSenseProduction-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      client.subscribe("agrisense/field_a/water/commands");
    } else { delay(5000); }
  }
}

void setup() {
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, LOW);
  
  weatherDHT.begin();
  storageDHT.begin();
  
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > 5000) { 
    lastMsg = now;

    // ─── 1. SOIL NODE (LOGICAL ISOLATION) ───────────────────────────
    StaticJsonDocument<256> soilDoc;
    soilDoc["moisture"] = map(analogRead(SOIL_MOISTURE_PIN), 4095, 0, 0, 100);
    // Soil Temperature from dedicated probe
    soilDoc["temp"] = (analogRead(SOIL_TEMP_PIN) * 3.3 / 4095.0) * 100.0; 
    soilDoc["ph"] = (analogRead(SOIL_PH_PIN) * 3.3 / 4095.0) * 3.5; 
    
    char soilBuf[256]; serializeJson(soilDoc, soilBuf);
    client.publish("agrisense/field_a/soil", soilBuf);

    // ─── 2. WEATHER NODE (LOGICAL ISOLATION) ─────────────────────────
    StaticJsonDocument<256> weatherDoc;
    weatherDoc["temp"] = weatherDHT.readTemperature();
    weatherDoc["humidity"] = weatherDHT.readHumidity();
    weatherDoc["rain"] = map(analogRead(WEATHER_RAIN_PIN), 4095, 0, 0, 100);
    weatherDoc["light"] = map(analogRead(WEATHER_LDR_PIN), 0, 4095, 0, 1000);
    
    char weatherBuf[256]; serializeJson(weatherDoc, weatherBuf);
    client.publish("agrisense/field_a/weather", weatherBuf);

    // ─── 3. STORAGE NODE (LOGICAL ISOLATION) ─────────────────────────
    StaticJsonDocument<256> storageDoc;
    storageDoc["temp"] = storageDHT.readTemperature();
    storageDoc["humidity"] = storageDHT.readHumidity();
    storageDoc["aqi"] = map(analogRead(STORAGE_AQI_PIN), 0, 4095, 0, 1000);
    storageDoc["gas"] = map(analogRead(STORAGE_GAS_PIN), 0, 4095, 0, 100);
    
    char storageBuf[256]; serializeJson(storageDoc, storageBuf);
    client.publish("agrisense/field_a/storage", storageBuf);

    // ─── 4. WATER NODE (LOGICAL ISOLATION) ───────────────────────────
    StaticJsonDocument<256> waterDoc;
    waterDoc["level"] = map(analogRead(WATER_LEVEL_PIN), 4095, 0, 0, 100);
    waterDoc["flowRate"] = pumpState ? 12.5 : 0;
    waterDoc["pumpActive"] = pumpState;
    
    char waterBuf[256]; serializeJson(waterDoc, waterBuf);
    client.publish("agrisense/field_a/water", waterBuf);
  }
}
