/**
 * Agri Sense v2.0.0 ELITE UI RELEASE 🛰️💎
 * 
 * --- HOW TO EDIT ---
 * 1. WiFi & HW: Only edit lines 25-27.
 * 2. Branding: Edit lines 10-14.
 * 3. Mode: Application is hard-wired for Real-Time hardware.
 */

export const MASTER_CONFIG = {
  // 🎨 BRANDING & IDENTITY
  PROJECT_NAME: "AgriSense Pro",
  FARM_NAME: "Master Field",
  TAGLINE: "Smart Agriculture Command Center",
  FOOTER_CREDIT: "by Prolayjit Biswas",
  VERSION: "19.1.1_ULTRA_PREMIUM",
  
  // 🔐 AUTHORIZED INVESTIGATORS
  AUTHORIZED_USERS: [
    { email: import.meta.env.VITE_LOGIN_EMAIL || "admin@agrisense.com", password: import.meta.env.VITE_LOGIN_PASSWORD || "admin123", name: "Prolayjit Biswas" }
  ],
  LOGIN_EMAIL: import.meta.env.VITE_LOGIN_EMAIL || "admin@agrisense.com", 
  LOGIN_PASSWORD: import.meta.env.VITE_LOGIN_PASSWORD || "admin123",
  
  // 🛰️ API & INFRASTRUCTURE
  MQTT_BROKER: import.meta.env.VITE_MQTT_BROKER || "localhost", 
  MQTT_WSS_PORT: 8884, // HiveMQ Cloud WSS
  MQTT_USER: import.meta.env.VITE_MQTT_USER || "admin",
  MQTT_PASS: import.meta.env.VITE_MQTT_PASS || "pass",
  FIELD_TOPIC_SENSORS: "agrisense/agrisense_pro/master_field/sensors",
  FIELD_TOPIC_COMMANDS: "agrisense/agrisense_pro/master_field/commands",
  
  // 🖼️ ASSETS
  DEFAULT_PROFILE_PHOTO: "",
  
  // 🗺️ MAP & WEATHER (Optional External APIs)
  OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || "", 
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || "",
  WEATHER_CITY: import.meta.env.VITE_WEATHER_CITY || "",
  
  MAP_LAT: parseFloat(import.meta.env.VITE_MAP_LAT) || null,
  MAP_LNG: parseFloat(import.meta.env.VITE_MAP_LNG) || null,
  MAP_ZOOM: 15,
  
  
  // 📍 HARDWARE PIN SUGGESTIONS (For SoilNode.ino)
  HARDWARE: {
    SSID: import.meta.env.VITE_WIFI_SSID || "YOUR_WIFI_SSID",
    PASS: import.meta.env.VITE_WIFI_PASS || "YOUR_WIFI_PASSWORD",
    MOISTURE_PIN: 34,
    DHT_PIN: 4,
    PUMP_PIN: 26
  },

  // 🕹️ ACTUATOR COMMANDS (For toggleActuator logic)
  ACTUATOR_COMMANDS: {
    'PUMP':    { ON: 'PUMP_ON',    OFF: 'PUMP_OFF' },
    'VALVE':   { ON: 'VALVE_OPEN', OFF: 'VALVE_CLOSE' },
    'BUZZER':  { ON: 'BUZZER_ON',  OFF: 'BUZZER_OFF' },
    'SPRAYER': { ON: 'SPRAY_ON',   OFF: 'SPRAY_OFF' },
    'DISPLAY': { ON: 'DISPLAY_ON', OFF: 'DISPLAY_OFF' },
    'LIGHT':   { ON: 'LIGHT_ON',   OFF: 'LIGHT_OFF' }
  }
};
