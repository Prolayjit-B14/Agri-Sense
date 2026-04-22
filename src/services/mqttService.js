/**
 * AgriSense v2.8.0 MQTT Service
 * Manages real-time telemetry stream and command publishing to hardware nodes.
 */

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import * as mqttModule from 'mqtt';
import { MASTER_CONFIG } from '../config';

// ─── CONFIGURATION ──────────────────────────────────────────────────────────
const mqtt = mqttModule.default || mqttModule;
const { connect } = mqtt;

const MQTT_CONFIG = {
  host: MASTER_CONFIG.MQTT_BROKER,
  port: MASTER_CONFIG.MQTT_WSS_PORT,
  protocol: 'wss',
  path: '/mqtt'
};

// ─── CORE SERVICE CLASS ──────────────────────────────────────────────────────

class MqttService {
  constructor() {
    this.client = null;
    this.onMessage = null;
    this.onStatus = null;
  }

  /**
   * Establishes a connection to the MQTT broker and subscribes to the telemetry wildcard.
   * @param {Function} onMessageCallback - Handler for incoming telemetry.
   * @param {Function} onStatusCallback - Handler for connection status updates.
   */
  connect(onMessageCallback, onStatusCallback) {
    this.onMessage = onMessageCallback;
    this.onStatus = onStatusCallback;

    if (typeof connect !== 'function') {
      console.error("MQTT: Library instantiation failure.");
      if (this.onStatus) this.onStatus('error');
      return;
    }

    if (this.client && this.client.connected) {
      if (this.onStatus) this.onStatus('connected');
      return;
    }
    
    // Initialize connection with industrial-grade resilience
    this.client = connect(`wss://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}${MQTT_CONFIG.path}`, {
      reconnectPeriod: 5000,
      connectTimeout: 30 * 1000,
      keepalive: 60
    });

    // ─── EVENT HANDLERS ─────────────────────────────────────────────────────
    
    this.client.on('connect', () => {
      console.log("MQTT: Connected to AgriSense Cloud Broker ✅");
      if (this.onStatus) this.onStatus('connected');
      this.client.subscribe('agrisense/#'); // Wildcard for all nodes
    });

    this.client.on('reconnect', () => {
      if (this.onStatus) this.onStatus('reconnecting');
    });

    this.client.on('offline', () => {
      if (this.onStatus) this.onStatus('offline');
    });

    this.client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (this.onMessage) this.onMessage(topic, payload);
      } catch (e) {
        console.error("MQTT JSON Parse Error:", e);
      }
    });

    this.client.on('error', (err) => {
      console.error("MQTT Connection Error:", err);
      if (this.onStatus) this.onStatus('error');
    });
  }

  /**
   * Publishes a control command to the hardware nodes.
   * @param {Object} action - The command payload (e.g., { action: "PUMP_ON" })
   */
  publishCommand(action) {
    if (this.client) {
      const topic = 'agrisense/field_a/water/commands';
      const message = JSON.stringify(action);
      this.client.publish(topic, message);
      console.log(`MQTT: Command Published:`, action);
    }
  }

  /**
   * Gracefully terminates the MQTT connection.
   */
  disconnect() {
    if (this.client) {
      this.client.end();
    }
  }
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

const mqttService = new MqttService();
export default mqttService;
