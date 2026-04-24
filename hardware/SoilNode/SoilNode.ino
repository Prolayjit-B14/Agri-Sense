#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// WiFi & MQTT Config - MISSION CRITICAL
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);

// Hardware Mapping
#define MOISTURE_PIN 34
#define DHTPIN 4
#define DHTTYPE DHT11 // Change to DHT22 if using that sensor
#define PUMP_PIN 26
#define STATUS_LED 2

DHT dht(DHTPIN, DHTTYPE);
long lastMsg = 0;
char msg[256];

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
  }

  randomSeed(micros());
  Serial.println("");
  Serial.println("WiFi connected");
  digitalWrite(STATUS_LED, HIGH);
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  if (message.indexOf("PUMP_ON") >= 0) {
    digitalWrite(PUMP_PIN, HIGH);
    Serial.println(">>> ACTUATOR: PUMP ON");
  } else if (message.indexOf("PUMP_OFF") >= 0) {
    digitalWrite(PUMP_PIN, LOW);
    Serial.println(">>> ACTUATOR: PUMP OFF");
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "AgriSense-SoilNode-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe("agrisense/field_a/commands");
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

  long now = millis();
  if (now - lastMsg > 2000) {
    lastMsg = now;

    // Read Real Sensors
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int moistureRaw = analogRead(MOISTURE_PIN);
    int moisturePer = map(moistureRaw, 4095, 1200, 0, 100); // Calibration values
    moisturePer = constrain(moisturePer, 0, 100);

    if (isnan(h) || isnan(t)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // Create JSON Document
    StaticJsonDocument<256> doc;
    JsonObject soil = doc.createNestedObject("soil");
    soil["moisture"] = moisturePer;
    soil["healthIndex"] = (moisturePer > 30 && moisturePer < 80) ? 95 : 60;

    JsonObject weather = doc.createNestedObject("weather");
    weather["temp"] = t;
    weather["humidity"] = h;
    weather["pressure"] = 1012; // Static or simulated

    serializeJson(doc, msg);
    Serial.print("Payload: ");
    Serial.println(msg);
    client.publish("agrisense/field_a/sensors", msg);
  }
}
