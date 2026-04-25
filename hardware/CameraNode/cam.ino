/*
 * AgriSense — Industrial Field Camera Node
 * ----------------------------------------
 * Flash this to the ESP32-CAM (AI-Thinker module).
 *
 * Features:
 *   - Serves MJPEG camera stream at /stream
 *   - Captures high-res still images at /capture
 *   - Flash/Light control at /light?state=on|off
 *   - Buzzer alarm control at /buzzer?state=on|off
 *
 * Board: "AI Thinker ESP32-CAM" in Arduino IDE
 */

#include "esp_camera.h"
#include "esp_http_server.h"
#include "WiFi.h"

// ─── Network Config ────────────────────────────────────────────────────────
#define WIFI_SSID  "AgriSense_IoT"
#define WIFI_PASS  "admin1234"
// ─────────────────────────────────────────────────────────────────────────────

#define FLASH_LED_PIN 4
#define BUZZER_PIN 14

// AI-Thinker ESP32-CAM pin map
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

static camera_config_t cam_cfg = {
  .pin_pwdn     = PWDN_GPIO_NUM,  .pin_reset  = RESET_GPIO_NUM,
  .pin_xclk     = XCLK_GPIO_NUM,
  .pin_sscb_sda = SIOD_GPIO_NUM,  .pin_sscb_scl = SIOC_GPIO_NUM,
  .pin_d7 = Y9_GPIO_NUM, .pin_d6 = Y8_GPIO_NUM, .pin_d5 = Y7_GPIO_NUM,
  .pin_d4 = Y6_GPIO_NUM, .pin_d3 = Y5_GPIO_NUM, .pin_d2 = Y4_GPIO_NUM,
  .pin_d1 = Y3_GPIO_NUM, .pin_d0 = Y2_GPIO_NUM,
  .pin_vsync = VSYNC_GPIO_NUM, .pin_href = HREF_GPIO_NUM, .pin_pclk = PCLK_GPIO_NUM,
  .xclk_freq_hz  = 20000000,
  .ledc_timer    = LEDC_TIMER_0,
  .ledc_channel  = LEDC_CHANNEL_0,
  .pixel_format  = PIXFORMAT_JPEG,
  .frame_size    = FRAMESIZE_VGA,   // 640×480 for smooth stream
  .jpeg_quality  = 12,
  .fb_count      = 2,
  .grab_mode     = CAMERA_GRAB_WHEN_EMPTY
};

// ─── Edge AI Detection State (Update these from your ML loop) ───────────────
bool ml_detection_active = false;
char ml_detection_type[32] = "None"; // e.g. "Wild Boar", "Bird Flock"
char ml_detection_level[16] = "Normal"; // e.g. "High", "Medium"

// ─── HTTP Handlers ──────────────────────────────────────────────────────────

static esp_err_t detectionHandler(httpd_req_t *req) {
  char json[128];
  snprintf(json, sizeof(json), "{\"active\": %s, \"type\": \"%s\", \"level\": \"%s\"}", 
           ml_detection_active ? "true" : "false", ml_detection_type, ml_detection_level);
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_send(req, json, strlen(json));
  return ESP_OK;
}

static esp_err_t streamHandler(httpd_req_t *req) {
  camera_fb_t *fb = NULL;
  char part_buf[64];
  httpd_resp_set_type(req, "multipart/x-mixed-replace; boundary=frame");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  while (true) {
    fb = esp_camera_fb_get();
    if (!fb) break;
    snprintf(part_buf, 64, "Content-Length: %u\r\n\r\n", (uint32_t)fb->len);
    if (httpd_resp_send_chunk(req, "\r\n--frame\r\nContent-Type: image/jpeg\r\n", 37) != ESP_OK) break;
    if (httpd_resp_send_chunk(req, part_buf, strlen(part_buf)) != ESP_OK) break;
    if (httpd_resp_send_chunk(req, (const char *)fb->buf, fb->len) != ESP_OK) break;
    esp_camera_fb_return(fb);
  }
  if (fb) esp_camera_fb_return(fb);
  return ESP_OK;
}

static esp_err_t captureHandler(httpd_req_t *req) {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }
  httpd_resp_set_type(req, "image/jpeg");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_send(req, (const char *)fb->buf, fb->len);
  esp_camera_fb_return(fb);
  return ESP_OK;
}

static esp_err_t lightHandler(httpd_req_t *req) {
  char buf[32];
  if (httpd_req_get_url_query_str(req, buf, sizeof(buf)) == ESP_OK) {
    char state[10];
    if (httpd_query_key_value(buf, "state", state, sizeof(state)) == ESP_OK) {
      if (strcmp(state, "on") == 0) digitalWrite(FLASH_LED_PIN, HIGH);
      else digitalWrite(FLASH_LED_PIN, LOW);
    }
  }
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_send(req, "OK", 2);
  return ESP_OK;
}

static esp_err_t buzzerHandler(httpd_req_t *req) {
  char buf[32];
  if (httpd_req_get_url_query_str(req, buf, sizeof(buf)) == ESP_OK) {
    char state[10];
    if (httpd_query_key_value(buf, "state", state, sizeof(state)) == ESP_OK) {
      if (strcmp(state, "on") == 0) {
        digitalWrite(BUZZER_PIN, HIGH); // Or use tone() if passive
      } else {
        digitalWrite(BUZZER_PIN, LOW);
      }
    }
  }
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_send(req, "OK", 2);
  return ESP_OK;
}

static void startCamServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;
  httpd_handle_t server = NULL;
  if (httpd_start(&server, &config) == ESP_OK) {
    httpd_uri_t stream_uri = { .uri = "/stream", .method = HTTP_GET, .handler = streamHandler };
    httpd_uri_t capture_uri= { .uri = "/capture", .method = HTTP_GET, .handler = captureHandler };
    httpd_uri_t light_uri  = { .uri = "/light",   .method = HTTP_GET, .handler = lightHandler };
    httpd_uri_t buzzer_uri = { .uri = "/buzzer",  .method = HTTP_GET, .handler = buzzerHandler };
    httpd_uri_t detection_uri = { .uri = "/detection", .method = HTTP_GET, .handler = detectionHandler };
    
    httpd_register_uri_handler(server, &stream_uri);
    httpd_register_uri_handler(server, &capture_uri);
    httpd_register_uri_handler(server, &light_uri);
    httpd_register_uri_handler(server, &buzzer_uri);
    httpd_register_uri_handler(server, &detection_uri);
    Serial.println("AgriSense Camera Server started");
  }
}

void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println("\n=== AgriSense Industrial CAM ===");

  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  if (esp_camera_init(&cam_cfg) != ESP_OK) {
    Serial.println("Camera init FAILED");
    return;
  }
  Serial.println("Camera OK");

  // Join Main Node's AP
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.printf("Joining '%s'", WIFI_SSID);
  
  // Wait up to 15s to connect
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - t0 > 15000) {
      Serial.println("\nTimeout. Continuing offline...");
      break;
    }
    delay(400); Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nCam IP: %s\n", WiFi.localIP().toString().c_str());
  }

  startCamServer();
}

void loop() {
  delay(10);
  
  // ─── REAL-TIME ML INFERENCE ───
  // Run your TensorFlow Lite / Edge Impulse classification here.
  // Example implementation:
  // if (detect_human()) {
  //   ml_detection_active = true;
  //   strcpy(ml_detection_type, "Human Intruder");
  //   strcpy(ml_detection_level, "High");
  // }
}