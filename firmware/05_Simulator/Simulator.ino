#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ---------- WIFI & MQTT CONFIG ----------
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com";

// ╔══════════════════════════════════════════════════════════════╗
// ║         AGRISENSE HARDWARE PAIRING — 2-FACTOR AUTH          ║
// ║  Both IDs must match the app Settings to receive data.       ║
// ╠══════════════════════════════════════════════════════════════╣
// ║  App "Project Codename"  = primary_id   (like username)      ║
// ║  App "Client Identifier" = secondary_id (like password)      ║
// ╚══════════════════════════════════════════════════════════════╝

String primary_id   = "agrisense_pro";  // Must match app "Project Codename"
String secondary_id = "master_field";   // Must match app "Client Identifier"

// Combined topic: agrisense/innovatex/semicolon/sensors
String topic_sensors  = "agrisense/" + primary_id + "/" + secondary_id + "/sensors";
String topic_commands = "agrisense/" + primary_id + "/" + secondary_id + "/commands";

WiFiClient espClient;
PubSubClient client(espClient);

// ---------- TIMER ----------
unsigned long lastSend = 0;
int interval = 5000; // 5 sec update (Industrial Standard)

// ---------- MOCK VALUE GENERATORS ----------
float randomFloat(float minVal, float maxVal) {
  return minVal + ((float)random(0, 1000) / 1000.0) * (maxVal - minVal);
}

float smoothValue(float base, float variation) {
  return base + randomFloat(-variation, variation);
}

// ---------- GLOBAL BASE VALUES ----------
float soilTempBase = 24.5;
float moistureBase = 45;
float phBase = 6.8;
float airTempBase = 28;
float humidityBase = 62;
float storageTempBase = 18;
float storageHumidityBase = 55;

void setup_wifi() {
  delay(10);
  Serial.print("Connecting to SSID: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { 
    delay(500); 
    Serial.print("."); 
  }
  Serial.println("\nWiFi Connected! IP Address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("🕹️ [COMMAND RECEIVED] Topic: ");
  Serial.println(topic);
  String message = "";
  for (int i = 0; i < length; i++) message += (char)payload[i];
  Serial.print("Payload: ");
  Serial.println(message);
  
  // Flash LED or perform action based on command
  if (message.indexOf("PUMP_ON") != -1)  Serial.println(">>> ACTION: Pump Started! 💧");
  if (message.indexOf("PUMP_OFF") != -1) Serial.println(">>> ACTION: Pump Stopped! 🛑");
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection to ");
    Serial.print(mqtt_server);
    Serial.println("...");
    if (client.connect("AgriSense_Test_Simulator")) {
      Serial.println("CONNECTED to MQTT!");
      client.subscribe(topic_commands.c_str());
      Serial.print("SUBSCRIBED to: ");
      Serial.println(topic_commands);
    } else {
      Serial.print("FAILED, rc=");
      Serial.print(client.state());
      Serial.println(" - Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  client.setBufferSize(1024); // CRITICAL: Increase buffer for unified industrial payload
  randomSeed(analogRead(0));
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  if (millis() - lastSend > interval) {
    lastSend = millis();

    StaticJsonDocument<1024> doc;

    // ---------- SOIL DATA ----------
    JsonObject soil = doc.createNestedObject("soil");
    JsonObject npk = soil.createNestedObject("npk");
    npk["n"] = random(70, 95);
    npk["p"] = random(35, 55);
    npk["k"] = random(180, 230);
    soil["ph"] = smoothValue(phBase, 0.3);
    soil["moisture"] = smoothValue(moistureBase, 5);
    soil["temp"] = smoothValue(soilTempBase, 2);

    // ---------- WEATHER DATA ----------
    JsonObject weather = doc.createNestedObject("weather");
    weather["temp"] = smoothValue(airTempBase, 3);
    weather["humidity"] = smoothValue(humidityBase, 5);
    weather["lightIntensity"] = random(700, 950);
    weather["rainLevel"] = random(0, 5);

    // ---------- WATER HUB ----------
    JsonObject water = doc.createNestedObject("water");
    water["level"] = random(80, 95);
    water["pumpActive"] = random(0, 2); 

    // ---------- STORAGE HUB ----------
    JsonObject storage = doc.createNestedObject("storage");
    storage["mq135"] = random(100, 200);
    storage["temp"] = smoothValue(storageTempBase, 2);
    storage["humidity"] = smoothValue(storageHumidityBase, 5);

    // ---------- PUBLISH ----------
    char buffer[1024];
    serializeJson(doc, buffer);
    client.publish(topic_sensors.c_str(), buffer);
    
    Serial.println("Sent Payload:");
    serializeJsonPretty(doc, Serial);
    Serial.println();
  }
}