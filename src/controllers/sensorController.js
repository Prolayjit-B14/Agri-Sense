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

  const nodeId = parts[1];
  const sensorType = parts[2];
  
  const newState = JSON.parse(JSON.stringify(prev));
  let target = null;
  
  if (nodeId.includes('soil')) target = 'soil';
  else if (nodeId.includes('weather')) target = 'weather';
  else if (nodeId.includes('storage')) target = 'storage';
  else if (nodeId.includes('irrigation') || nodeId.includes('water')) target = 'water';
  
  if (!target) return prev;

  const rawData = data;
  
  if (sensorType) {
    const fieldMap = {
      'temperature': 'temp', 'temp': 'temp', 't': 'temp',
      'moisture': 'moisture', 'm': 'moisture',
      'humidity': 'humidity', 'h': 'humidity',
      'ph': 'ph', 'rainfall': 'rainLevel', 'rain': 'rainLevel',
      'light': 'lightIntensity', 'ldr': 'lightIntensity', 'lux': 'lightIntensity',
      'aqi': 'mq135', 'gas': 'mq135', 'air': 'mq135',
      'water_level': 'level', 'level': 'level'
    };
    
    const field = fieldMap[sensorType] || sensorType;
    const val = getVal(rawData, [], null);

    if (target === 'soil' && ['n', 'p', 'k'].includes(sensorType)) {
      newState.soil.npk[sensorType] = val;
    } else {
      newState[target][field] = val;
    }
  } else {
    const s = rawData;
    if (target === 'soil') {
      newState.soil.moisture = getVal(s, ['moisture', 'm', 'moist', 'soil_m'], prev.soil.moisture);
      newState.soil.temp = getVal(s, ['temp', 't', 'soil_temp', 'st'], prev.soil.temp);
      newState.soil.ph = getVal(s, ['ph', 'soil_ph'], prev.soil.ph);
      newState.soil.npk = {
        n: getVal(s, ['n', 'nit'], prev.soil.npk.n),
        p: getVal(s, ['p', 'phos'], prev.soil.npk.p),
        k: getVal(s, ['k', 'pot'], prev.soil.npk.k)
      };
    } else if (target === 'weather') {
      newState.weather.temp = getVal(s, ['temp', 't', 'ambient_temp'], prev.weather.temp);
      newState.weather.humidity = getVal(s, ['humidity', 'h', 'ambient_hum'], prev.weather.humidity);
      newState.weather.lightIntensity = getVal(s, ['ldr', 'light', 'lux'], prev.weather.lightIntensity);
      newState.weather.rainLevel = getVal(s, ['rainLevel', 'rain', 'rl'], prev.weather.rainLevel);
      newState.weather.isRaining = s.isRaining ?? s.rain ?? (s.rainLevel > 0) ?? prev.weather.isRaining;
    } else if (target === 'storage') {
      newState.storage.temp = getVal(s, ['temp', 'st_t'], prev.storage.temp);
      newState.storage.humidity = getVal(s, ['humidity', 'st_h'], prev.storage.humidity);
      newState.storage.mq135 = getVal(s, ['mq135', 'gas', 'aqi'], prev.storage.mq135);
    } else if (target === 'water') {
      newState.water.level = getVal(s, ['level', 'l', 'water_level'], prev.water.level);
      newState.water.flowRate = getVal(s, ['flowRate', 'flow'], prev.water.flowRate);
    }
  }

  if (target === 'soil') newState.soil.healthIndex = calculateNodeHealth('soil', newState.soil);
  return newState;
};
