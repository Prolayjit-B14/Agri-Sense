/**
 * AgriSense Pro v17.1.0 MQTT Service
 * Manages real-time telemetry stream and command publishing to hardware nodes.
 */

import * as mqttModule from 'mqtt';
import { MASTER_CONFIG } from '../setup';

const mqtt = mqttModule.default || mqttModule;
const { connect } = mqtt;

const MQTT_CONFIG = {
  host: MASTER_CONFIG.MQTT_BROKER,
  port: MASTER_CONFIG.MQTT_WSS_PORT,
  protocol: 'wss',
  path: '/mqtt'
};

class MqttService {
  constructor() {
    this.client = null;
    this.onMessage = null;
    this.onStatus = null;
  }

  connect(onMessageCallback, onStatusCallback) {
    if (this.client) return;
    
    this.onMessage = onMessageCallback;
    this.onStatus = onStatusCallback;

    console.log('📡 MQTT: Initiating connection to', MQTT_CONFIG.host);
    this.onStatus?.('connecting');

    try {
      this.client = connect(`wss://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}${MQTT_CONFIG.path}`, {
        reconnectPeriod: 3000,
        connectTimeout: 30 * 1000,
        keepalive: 60,
        clientId: 'agrisense_web_' + Math.random().toString(16).slice(2, 10),
        clean: true
      });

      this.client.on('connect', () => {
        console.log('✅ MQTT: Cloud Bridge Established');
        this.onStatus?.('connected');
        this.client.subscribe('agrisense/#', (err) => {
          if (!err) console.log('🛰️ MQTT: Subscribed to Wildcard [agrisense/#]');
          else console.error('❌ MQTT: Subscription Failed', err);
        });
      });

      this.client.on('message', (topic, message) => {
        try {
          const rawData = message.toString();
          const parsedData = JSON.parse(rawData);
          console.log(`📥 MQTT [${topic}]:`, parsedData);
          if (this.onMessage) this.onMessage(topic, parsedData);
        } catch (e) {
          console.warn('⚠️ MQTT: Received malformed JSON on', topic);
        }
      });

      this.client.on('error', (err) => {
        console.error('❌ MQTT: Connection Error', err);
        this.onStatus?.('error');
      });

      this.client.on('close', () => {
        console.warn('🔌 MQTT: Connection Closed');
        this.onStatus?.('disconnected');
      });
      
      this.client.on('reconnect', () => {
        console.log('🔄 MQTT: Attempting Reconnection...');
        this.onStatus?.('reconnecting');
      });

    } catch (err) {
      console.error('💥 MQTT: Critical Failure', err);
      this.onStatus?.('error');
    }
  }

  publishCommand(action) {
    if (this.client) {
      const topic = MASTER_CONFIG.FIELD_TOPIC_COMMANDS || 'agrisense/field_a/commands';
      const message = JSON.stringify(action);
      this.client.publish(topic, message);
      console.log(`🕹️ MQTT: Command Published [${topic}]:`, action);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  refresh() {
    console.log("🔄 MQTT: Manual Refresh Triggered");
    const oldCb = this.onMessage;
    const oldSt = this.onStatus;
    this.disconnect();
    setTimeout(() => {
      this.connect(oldCb, oldSt);
    }, 500);
  }
}

const mqttService = new MqttService();
export default mqttService;
