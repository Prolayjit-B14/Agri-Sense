/**
 * AgriSense v2.8.0 Sensor Controller
 * Processes incoming MQTT messages and routes them to the correct node state.
 */

import { calculateNodeHealth } from '../utils/healthEngine';

/**
 * Utility to extract numerical values from various sources with fallbacks
 */
export const getVal = (src, keys, fallback) => {
  if (typeof src !== 'object' || src === null) return !isNaN(src) ? Number(src) : fallback;
  for (const k of keys) {
    const v = src[k];
    if (v !== undefined && v !== null && v !== "" && !isNaN(v)) return Number(v);
  }
  return fallback;
};

/**
 * Main Data Processor for MQTT Messages
 */
export const processMqttMessage = (topic, data, prev) => {
  const parts = topic.split('/');
  if (parts.length < 2) return prev;

  const newState = JSON.parse(JSON.stringify(prev));
  
  // 🛰️ NODE DETECTION VIA TOPIC PATH
  let nodeType = parts[parts.length - 1]; 
  if (nodeType === 'telemetry' && parts.length >= 3) {
    nodeType = parts[parts.length - 2];
  }

  // Handle Unified Payload (topic: sensors)
  if (nodeType === 'sensors') {
    if (data.soil) {
      newState.soil.moisture = getVal(data.soil, ['moisture', 'm'], prev.soil.moisture);
      newState.soil.temp = getVal(data.soil, ['temp', 't', 'temperature'], prev.soil.temp);
      newState.soil.ph = getVal(data.soil, ['ph'], prev.soil.ph);
      if (data.soil.npk) {
        newState.soil.npk.n = getVal(data.soil.npk, ['n'], prev.soil.npk.n);
        newState.soil.npk.p = getVal(data.soil.npk, ['p'], prev.soil.npk.p);
        newState.soil.npk.k = getVal(data.soil.npk, ['k'], prev.soil.npk.k);
      }
      newState.soil.healthIndex = calculateNodeHealth('soil', newState.soil);
    }
    // Unified flat weather or nested
    if (data.weather || data.temp || data.humidity || data.ldr || data.rain) {
      const wData = data.weather || data;
      newState.weather.temp = getVal(wData, ['temp', 't', 'temperature'], prev.weather.temp);
      newState.weather.humidity = getVal(wData, ['humidity', 'h'], prev.weather.humidity);
      newState.weather.lightIntensity = getVal(wData, ['lightIntensity', 'light', 'ldr', 'lux'], prev.weather.lightIntensity);
      newState.weather.rainLevel = getVal(wData, ['rainLevel', 'rain', 'rainfall'], prev.weather.rainLevel);
      newState.weather.isRaining = wData.isRaining ?? (newState.weather.humidity > 95) ?? (newState.weather.rainLevel > 0) ?? prev.weather.isRaining;
      newState.weather.healthIndex = calculateNodeHealth('weather', newState.weather);
    }
    if (data.water || data.irrigation) {
      const wData = data.water || data.irrigation;
      newState.water.level = getVal(wData, ['level', 'l'], prev.water.level);
      newState.water.flowRate = getVal(wData, ['flowRate', 'flow'], prev.water.flowRate);
      newState.water.pumpActive = wData.pumpActive ?? prev.water.pumpActive;
      newState.water.healthIndex = calculateNodeHealth('water', newState.water);
    }
    if (data.storage) {
      newState.storage.temp = getVal(data.storage, ['temp', 't', 'temperature'], prev.storage.temp);
      newState.storage.humidity = getVal(data.storage, ['humidity', 'h'], prev.storage.humidity);
      newState.storage.mq135 = getVal(data.storage, ['mq135', 'aqi', 'gas'], prev.storage.mq135);
      newState.storage.healthIndex = calculateNodeHealth('storage', newState.storage);
    }
  }
  // Discrete Node Topics
  else if (nodeType === 'soil') {
    newState.soil.moisture = getVal(data, ['moisture', 'm'], prev.soil.moisture);
    newState.soil.temp = getVal(data, ['temp', 't'], prev.soil.temp);
    newState.soil.ph = getVal(data, ['ph'], prev.soil.ph);
    if (data.npk) {
      newState.soil.npk.n = getVal(data.npk, ['n'], prev.soil.npk.n);
      newState.soil.npk.p = getVal(data.npk, ['p'], prev.soil.npk.p);
      newState.soil.npk.k = getVal(data.npk, ['k'], prev.soil.npk.k);
    }
    if (data.pump_status !== undefined) {
      newState.water.pumpActive = (data.pump_status === 'ACTIVE' || data.pump_status === 1 || data.pump_status === true);
    }
    newState.soil.healthIndex = calculateNodeHealth('soil', newState.soil);
  } 
  else if (nodeType === 'weather') {
    newState.weather.temp = getVal(data, ['temp', 't', 'temperature'], prev.weather.temp);
    newState.weather.humidity = getVal(data, ['humidity', 'h'], prev.weather.humidity);
    newState.weather.lightIntensity = getVal(data, ['lightIntensity', 'light', 'ldr', 'lux'], prev.weather.lightIntensity);
    newState.weather.rainLevel = getVal(data, ['rainLevel', 'rain', 'rainfall'], prev.weather.rainLevel);
    newState.weather.isRaining = data.isRaining ?? (data.humidity > 95) ?? (newState.weather.rainLevel > 0) ?? prev.weather.isRaining;
    newState.weather.healthIndex = calculateNodeHealth('weather', newState.weather);
  }
  else if (nodeType === 'water' || nodeType === 'irrigation') {
    newState.water.level = getVal(data, ['level', 'l'], prev.water.level);
    newState.water.flowRate = getVal(data, ['flowRate', 'flow'], prev.water.flowRate);
    newState.water.healthIndex = calculateNodeHealth('water', newState.water);
  }
  else if (nodeType === 'storage') {
    newState.storage.temp = getVal(data, ['temp', 't'], prev.storage.temp);
    newState.storage.humidity = getVal(data, ['humidity', 'h'], prev.storage.humidity);
    newState.storage.mq135 = getVal(data, ['mq135', 'aqi', 'gas'], prev.storage.mq135);
    newState.storage.healthIndex = calculateNodeHealth('storage', newState.storage);
  }

  return newState;
};
