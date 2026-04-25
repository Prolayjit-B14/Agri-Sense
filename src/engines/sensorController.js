/**
 * AgriSense Pro v17.1.0 Sensor Controller
 * Processes incoming MQTT messages and routes them to the correct node state.
 */

import { calculateNodeHealth } from '../logic/healthEngine';

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
  
  // 🛰️ NODE DETECTION (Robust Keyword Matching)
  let nodeType = 'unknown';
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('sensors')) nodeType = 'sensors';
  else if (topicLower.includes('soil')) nodeType = 'soil';
  else if (topicLower.includes('weather')) nodeType = 'weather';
  else if (topicLower.includes('water') || topicLower.includes('irrigation')) nodeType = 'water';
  else if (topicLower.includes('storage')) nodeType = 'storage';

  // 🛰️ UNIFIED DATA ACCEPTANCE (Accept any valid telemetry)
  if (nodeType === 'sensors' || data.soil || data.weather || data.water || data.storage) {
    if (data.soil || data.npk) {
      const sData = data.soil || data;
      newState.soil.moisture = getVal(sData, ['moisture', 'm'], prev.soil.moisture);
      newState.soil.ph = getVal(sData, ['ph'], prev.soil.ph);
      newState.soil.temp = getVal(sData, ['temp', 'soilTemp', 'st'], prev.soil.temp);
      
      const npkSource = sData.npk || sData;
      newState.soil.npk.n = getVal(npkSource, ['n', 'N'], prev.soil.npk.n);
      newState.soil.npk.p = getVal(npkSource, ['p', 'P'], prev.soil.npk.p);
      newState.soil.npk.k = getVal(npkSource, ['k', 'K'], prev.soil.npk.k);
      newState.soil.healthIndex = calculateNodeHealth('soil', newState.soil);
    }
    if (data.weather || data.temp || data.humidity) {
      const wData = data.weather || data;
      newState.weather.temp = getVal(wData, ['temp', 't'], prev.weather.temp);
      newState.weather.humidity = getVal(wData, ['humidity', 'h'], prev.weather.humidity);
      newState.weather.lightIntensity = getVal(wData, ['lightIntensity', 'light', 'ldr'], prev.weather.lightIntensity);
      newState.weather.rainLevel = getVal(wData, ['rainLevel', 'rain'], prev.weather.rainLevel);
      newState.weather.healthIndex = calculateNodeHealth('weather', newState.weather);
    }
    if (data.water || data.level) {
      const waData = data.water || data;
      newState.water.level = getVal(waData, ['level', 'l'], prev.water.level);
      newState.water.pumpActive = (waData.pumpActive === 1 || waData.pump === 1 || waData.pumpActive === true);
    }
    if (data.storage || data.gas) {
      const stData = data.storage || data;
      newState.storage.temp = getVal(stData, ['temp', 't'], prev.storage.temp);
      newState.storage.humidity = getVal(stData, ['humidity', 'h'], prev.storage.humidity);
      newState.storage.mq135 = getVal(stData, ['mq135', 'gas'], prev.storage.mq135);
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
