
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

/**
 * 🛰️ AgriSense v2.8.0 - Industrial Hardware Node
 * Configuration: ESP32 + DHT11 + Soil Moisture + Pump Relay
 */

// ================== NETWORK CONFIG ==================
const char* ssid = "YOUR_WIFI_SSID";         // Replace with your WiFi SSID
const char* password = "YOUR_WIFI_PASSWORD"; // Replace with your WiFi Password
const char* mqtt_server = "broker.hivemq.com";

// ================== PIN DEFINITIONS ==================
#define DHTPIN 4           // DHT11 Data Pin
#define DHTTYPE DHT11      // DHT 11
#define MOISTURE_PIN 34    // Analog Soil Moisture Pin
#define PUMP_PIN 26        // Relay Control Pin
#define STATUS_LED 2       // Onboard LED

// ================== OBJECTS ==================
WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);

// ================== VARIABLES ==================
unsigned long lastMsg = 0;
bool pumpState = false;

// ================== WIFI SETUP ==================
void setup_wifi() {
  delay(10);
  Serial.println("\n📡 Connecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
  }

  Serial.println("\n✅ WiFi Connected!");
  digitalWrite(STATUS_LED, HIGH);
}

// ================== MQTT CALLBACK ==================
void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) message += (char)payload[i];

  Serial.print("\n📥 Command Received [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  // Control Logic for Pump
  if (message.indexOf("PUMP_ON") >= 0) {
    digitalWrite(PUMP_PIN, HIGH);
    pumpState = true;
    Serial.println("🚿 PUMP: ON");
  } else if (message.indexOf("PUMP_OFF") >= 0) {
    digitalWrite(PUMP_PIN, LOW);
    pumpState = false;
    Serial.println("🛑 PUMP: OFF");
  }
}

// ================== MQTT RECONNECT ==================
void reconnect() {
  while (!client.connected()) {
    Serial.print("🔄 Attempting MQTT connection...");
    String clientId = "AgriSenseNode-" + String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("✅ Connected");
      client.subscribe("agrisense/field_a/commands");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// ================== SETUP ==================
void setup() {
  pinMode(STATUS_LED, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW); // Start with Pump OFF

  Serial.begin(115200);
  dht.begin();
  
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

// ================== MAIN LOOP ==================
void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > 3000) { // Send data every 3 seconds
    lastMsg = now;

    // 1. Read Sensors
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int mRaw = analogRead(MOISTURE_PIN);
    
    // 2. Calibration (Adjust 3500/1500 based on your sensor)
    int mPercent = map(mRaw, 3500, 1500, 0, 100);
    mPercent = constrain(mPercent, 0, 100);

    if (isnan(h) || isnan(t)) {
      Serial.println("⚠️ DHT Sensor Error!");
      h = 0; t = 0;
    }

    // 3. Build JSON Payload
    StaticJsonDocument<512> doc;
    
    // Soil Data
    JsonObject soil = doc.createNestedObject("soil");
    soil["moisture"] = mPercent;
    soil["temp"] = t;
    soil["ph"] = 6.5; // Mock/Placeholder
    
    JsonObject npk = soil.createNestedObject("npk");
    npk["n"] = 45; // Nitrogen
    npk["p"] = 32; // Phosphorus
    npk["k"] = 28; // Potassium

    // Weather Data
    JsonObject weather = doc.createNestedObject("weather");
    weather["temp"] = t;
    weather["humidity"] = h;
    weather["isRaining"] = false;

    // Water/Irrigation Data
    JsonObject water = doc.createNestedObject("water");
    water["level"] = 85;
    water["flowRate"] = pumpState ? 12.5 : 0;

    // Storage Data (Shared Sensors)
    JsonObject storage = doc.createNestedObject("storage");
    storage["temp"] = t - 1.5;
    storage["mq135"] = 120;

    char buffer[512];
    serializeJson(doc, buffer);

    // 4. Publish
    Serial.println("\n📤 Publishing Telemetry:");
    Serial.println(buffer);
    client.publish("agrisense/field_a/sensors", buffer);
  }
}
