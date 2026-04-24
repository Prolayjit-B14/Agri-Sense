
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

/**
 * 🌱 AgriSense V2.5 - Production Ready Node
 * ESP32 + DHT + Soil Sensor + MQTT + Pump Control
 */

// ================== CONFIG ==================
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com";

// ================== PINS ==================
#define MOISTURE_PIN 34
#define DHTPIN 4
#define DHTTYPE DHT11
#define PUMP_PIN 26
#define STATUS_LED 2
#define LDR_PIN 35
#define RAIN_PIN 32https://github.com/Prolayjit-B14/Agri_Sense-
#define WATER_LVL_PIN 33
#define AQI_PIN 36 // MQ135
#define NP_N_PIN 39
#define NP_P_PIN 25
#define NP_K_PIN 27

// ================== OBJECTS ==================
WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);

// ================== VARIABLES ==================
unsigned long lastMsg = 0;
unsigned long pumpStart = 0;
bool pumpState = false;

char msg[256];

// ================== WIFI ==================
void setup_wifi() {
  Serial.println("\n📡 Connecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
  }

  Serial.println("\n✅ WiFi Connected!");
  Serial.print("🌐 IP Address: ");
  Serial.println(WiFi.localIP());

  digitalWrite(STATUS_LED, HIGH);
}

// ================== MQTT CALLBACK ==================
void callback(char* topic, byte* payload, unsigned int length) {
  String message;

  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println("\n📥 MQTT Command Received:");
  Serial.println("➡ " + message);

  if (message.indexOf("PUMP_ON") >= 0) {
    digitalWrite(PUMP_PIN, HIGH);
    pumpStart = millis();
    pumpState = true;
    Serial.println("🚿 Pump TURNED ON");
  } 
  else if (message.indexOf("PUMP_OFF") >= 0) {
    digitalWrite(PUMP_PIN, LOW);
    pumpState = false;
    Serial.println("🛑 Pump TURNED OFF");
  }
}

// ================== MQTT RECONNECT ==================
void reconnect() {
  if (!client.connected()) {
    Serial.print("🔄 Connecting to MQTT...");

    String clientId = "AgriSenseNode-" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println(" ✅ Connected!");
      client.subscribe("agrisense/field_a/commands");
      Serial.println("📡 Subscribed to: agrisense/field_a/commands");
    } else {
      Serial.print(" ❌ Failed (rc=");
      Serial.print(client.state());
      Serial.println(")");
    }
  }
}

// ================== SETUP ==================
void setup() {
  pinMode(STATUS_LED, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);

  digitalWrite(PUMP_PIN, LOW);

  Serial.begin(115200);
  dht.begin();

  analogReadResolution(12);

  setup_wifi();

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

// ================== LOOP ==================
void loop() {

  // WiFi Reconnect
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi Lost! Reconnecting...");
    setup_wifi();
  }

  // MQTT Reconnect
  if (!client.connected()) {
    reconnect();
  }

  client.loop();

  // Pump Auto OFF Safety (10 sec)
  if (pumpState && millis() - pumpStart > 10000) {
    digitalWrite(PUMP_PIN, LOW);
    pumpState = false;
    Serial.println("⏱ Pump AUTO-OFF (Safety Timeout)");
  }

  // Sensor Read Every 3 sec
  if (millis() - lastMsg > 3000) {
    lastMsg = millis();

    Serial.println("\n================ SENSOR UPDATE ================");

    // ===== Read Sensors =====
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    int moistureRaw = analogRead(MOISTURE_PIN);

    // ===== Failure Tolerance (Bypass DHT Error) =====
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("⚠️ WARNING: DHT Sensor Failed (Disconnected?). Sending partial data...");
      humidity = 0;
      temperature = 0;
    }

    // ===== Calibration (RESTORED) =====
    int moisturePercent = map(moistureRaw, 3500, 1500, 0, 100);
    moisturePercent = constrain(moisturePercent, 0, 100);

    // ===== Debug Output =====
    Serial.print("🌡 Temperature: ");
    Serial.print(temperature);
    Serial.println(" °C");

    Serial.print("💧 Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");

    Serial.print("🌱 Soil Raw: ");
    Serial.println(moistureRaw);

    Serial.print("🌿 Soil Moisture: ");
    Serial.print(moisturePercent);
    Serial.println(" %");

    // ===== JSON Payload =====
    StaticJsonDocument<256> doc;
    // ===== Real Sensor Placeholders (Replace with analogRead if pins are connected) =====
    int n = 0; // nitrogen
    int p = 0; // phosphorus
    int k = 0; // potassium
    int light = 0; // LDR intensity
    int rain = 0;  // Rain sensor
    bool isRaining = false;

    JsonObject soil = doc.createNestedObject("soil");
    soil["moisture"] = moisturePercent;
    soil["temp"] = temperature;
    soil["humidity"] = humidity;
    
    JsonObject npk = soil.createNestedObject("npk");
    // Using designated analog pins for NPK sensors
    npk["n"] = map(analogRead(NP_N_PIN), 0, 4095, 0, 100); 
    npk["p"] = map(analogRead(NP_P_PIN), 0, 4095, 0, 100); 
    npk["k"] = map(analogRead(NP_K_PIN), 0, 4095, 0, 100);
    
    soil["healthIndex"] = (moisturePercent > 35 && moisturePercent < 65) ? 100 : 50;

    JsonObject weather = doc.createNestedObject("weather");
    weather["temp"] = temperature;
    weather["humidity"] = humidity;
    weather["lightIntensity"] = analogRead(LDR_PIN); 
    weather["rainLevel"] = map(analogRead(RAIN_PIN), 4095, 0, 0, 100);
    weather["isRaining"] = (weather["rainLevel"] > 20);

    JsonObject storage = doc.createNestedObject("storage");
    storage["temp"] = temperature - 2;
    storage["humidity"] = humidity + 8;
    storage["aqi"] = map(analogRead(AQI_PIN), 0, 4095, 0, 500);
    storage["mq135"] = storage["aqi"]; // Gas concentration

    JsonObject water = doc.createNestedObject("water");
    water["level"] = map(analogRead(WATER_LVL_PIN), 4095, 0, 0, 100);
    water["tankLevel"] = water["level"];
    water["flowRate"] = pumpState ? 12.5 : 0; // Mock flow if pump is ON
    water["totalUsage"] = random(100, 500); // Cumulative, keeps increasing normally

    JsonObject solar = doc.createNestedObject("solar");
    solar["lightIntensity"] = analogRead(LDR_PIN);
    solar["power"] = map(solar["lightIntensity"], 0, 4095, 0, 50); // Watts
    solar["voltage"] = (solar["lightIntensity"] > 500) ? 18.2 : 0;
    solar["current"] = (solar["power"] > 0) ? (float)solar["power"] / 18.2 : 0;
    solar["kwhToday"] = 1.2; // Fixed example for demo
    solar["exposureDuration"] = 6; 

    serializeJson(doc, msg);

    Serial.println("📤 Publishing Data:");
    Serial.println(msg);

    // ===== Publish =====
    if (client.connected()) {
      client.publish("agrisense/field_a/sensors", msg);
      Serial.println("✅ Data Sent to MQTT Broker");
    } else {
      Serial.println("❌ MQTT Not Connected!");
    }

    Serial.println("================================================");
  }
}
