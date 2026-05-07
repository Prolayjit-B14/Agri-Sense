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
  path: '/mqtt',
  username: MASTER_CONFIG.MQTT_USER,
  password: MASTER_CONFIG.MQTT_PASS
};

class MqttService {
  constructor() {
    this.client = null;
    this.onMessage = null;
    this.onStatus = null;
    this.url = `${MQTT_CONFIG.protocol}://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}${MQTT_CONFIG.path}`;
  }

  connect(primaryId, secondaryId, onMessageCallback, onStatusCallback) {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
    
    const normalize = (val, fallback) => (val || fallback).trim().toLowerCase().replace(/[\s-]+/g, '_');
    
    this.primaryId   = normalize(primaryId, 'agrisense_pro');
    this.secondaryId = normalize(secondaryId, 'master_field');
    this.onMessage   = onMessageCallback;
    this.onStatus    = onStatusCallback;

    const pairedTopic = `agrisense/${this.primaryId}/${this.secondaryId}/#`;
    this.onStatus?.('connecting');

    try {
      this.client = connect(this.url, {
        reconnectPeriod: 3000,
        connectTimeout: 30 * 1000,
        keepalive: 60,
        clientId: 'agrisense_web_' + Math.random().toString(16).slice(2, 10),
        username: MQTT_CONFIG.username,
        password: MQTT_CONFIG.password,
        clean: true,
        rejectUnauthorized: false 
      });

      this.client.on('connect', () => {
        this.onStatus?.('connected');
        this.client.subscribe(pairedTopic, (err) => {
          if (err) console.error('[MQTT_ERROR] ❌ Subscription Failed', err);
        });
      });

      this.client.on('message', (topic, message) => {
        const rawData = message.toString();
        try {
          const parsedData = JSON.parse(rawData);
          if (this.onMessage) this.onMessage(topic, parsedData);
        } catch (e) {
          // Quietly ignore malformed JSON in production
        }
      });

      this.client.on('error', (err) => {
        this.onStatus?.('error');
      });

      this.client.on('close', () => {
        this.onStatus?.('disconnected');
      });
      
      this.client.on('reconnect', () => {
        this.onStatus?.('reconnecting');
      });

    } catch (err) {
      this.onStatus?.('error');
    }
  }

  publishCommand(action) {
    if (this.client && this.primaryId && this.secondaryId) {
      const topic = `agrisense/${this.primaryId}/${this.secondaryId}/commands`;
      const message = JSON.stringify(action);
      this.client.publish(topic, message);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  refresh() {
    const oldCb = this.onMessage;
    const oldSt = this.onStatus;
    this.disconnect();
    setTimeout(() => {
      this.connect(this.primaryId, this.secondaryId, oldCb, oldSt);
    }, 500);
  }
}

const mqttService = new MqttService();
export default mqttService;
