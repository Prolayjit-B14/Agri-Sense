/**
 * Agri Sense v6.0.0 Production System Engine
 * Handles AI recommendations, Actuator constants, and System categories.
 */

export const CATEGORIES = {
  SOIL: 'Soil Monitoring',
  NUTRIENT: 'Nutrient Analysis',
  WEATHER: 'Weather & Environment',
  DETECTION: 'Pest & Security',
  STORAGE: 'Food Freshness',
  WATER: 'Water System',
};

export const DEVICE_IDS = {
  SOIL_NODE: 'ESP32_SOIL_01',
  CAM_NODE: 'ESP32_CAM_01',
  STORAGE_NODE: 'ESP32_STORAGE_01',
  RELAY_NODE: 'ESP32_RELAY_01',
};

export const getAIv2Recommendations = (data) => {
  const recommendations = [];
  const { soil, weather } = data;

  // 1. IRRIGATION (TECHNICAL)
  if (soil?.moisture !== null && soil?.moisture < 35) {
    recommendations.push({ 
      id: 'r1', title: 'Hydration Deficiency', 
      message: `Soil moisture critical at ${soil.moisture}%. Activating pump sync for root zone recovery.`, 
      type: 'danger', 
      category: CATEGORIES.WATER
    });
  }

  // 2. NUTRIENT CHECK (NPK)
  if (soil?.npk?.n !== null && soil?.npk?.n < 40) {
    recommendations.push({ 
      id: 'r2', title: 'Nitrogen Depletion', 
      message: 'Low nitrogen levels detected. Consider urea or compost top-dressing.', 
      type: 'warning',
      category: CATEGORIES.NUTRIENT
    });
  }

  // 3. WEATHER RISK
  if (weather?.humidity > 80 && weather?.temp > 28) {
    recommendations.push({ 
      id: 'r5', title: 'Fungal Risk: CRITICAL', 
      message: 'High heat & humidity detected. Monitor for blight or powdery mildew.', 
      type: 'danger',
      category: CATEGORIES.DETECTION
    });
  }

  // Priority Sort
  return (recommendations || []).sort((a, b) => {
    const p = { 'danger': 0, 'warning': 1, 'info': 2 };
    return p[a.type] - p[b.type];
  });
};

export const ACTUATORS = {
  PUMP: 'Irrigation Pump',
  VALVE: 'Solenoid Valve',
  BUZZER: 'Ultrasonic Repellent',
  SPRAYER: 'Pest Sprayer',
};

/**
 * Standard Parameter Score Formula: 
 * score = 100 - (deviation / max_range) * 100
 */
const getParamScore = (value, idealMin, idealMax, maxRange = 50) => {
  if (value === null || value === undefined) return null;
  if (value >= idealMin && value <= idealMax) return 100;
  
  const deviation = value < idealMin ? idealMin - value : value - idealMax;
  const score = 100 - (deviation / maxRange) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const calculateOverallHealth = (systemHealth) => {
  const scores = Object.values(systemHealth).filter(s => s !== null);
  if (scores.length === 0) return null;

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const min = Math.min(...scores);

  // Safety-First Logic: Overall health is a weighted mix of Average and Minimum.
  // If the minimum score is critical (< 40), it pulls the overall health down by 70%.
  if (min < 40) {
    return Math.round((avg * 0.3) + (min * 0.7));
  }
  
  // Otherwise, it's a standard weighted average (60% Avg, 40% Min) to emphasize potential issues
  return Math.round((avg * 0.6) + (min * 0.4));
};

export const calculateNodeHealth = (nodeType, data) => {
  if (!data) return null;
  
  let scores = [];
  let weights = [];
  
  switch(nodeType) {
    case 'soil': {
      const s = data;
      const mScore = getParamScore(s.moisture, 40, 70, 40);
      const pScore = getParamScore(s.ph, 6.0, 7.5, 3);
      const tScore = getParamScore(s.temp, 18, 30, 15);
      
      const n = getParamScore(s.npk?.n, 40, 100, 40);
      const p = getParamScore(s.npk?.p, 40, 100, 40);
      const k = getParamScore(s.npk?.k, 40, 100, 40);
      const npkScore = (n !== null && p !== null && k !== null) ? Math.round((n + p + k) / 3) : null;

      if (mScore !== null) { scores.push(mScore); weights.push(0.40); } // Higher weight for moisture
      if (pScore !== null) { scores.push(pScore); weights.push(0.20); }
      if (npkScore !== null) { scores.push(npkScore); weights.push(0.25); }
      if (tScore !== null) { scores.push(tScore); weights.push(0.15); }
      break;
    }
    case 'weather': {
      const w = data;
      const tScore = getParamScore(w.temp, 20, 32, 15);
      const hScore = getParamScore(w.humidity, 40, 80, 40);
      const rScore = getParamScore(w.rainLevel, 0, 5, 20); 
      const lScore = getParamScore(w.lightIntensity, 500, 2000, 1000); 

      if (tScore !== null) { scores.push(tScore); weights.push(0.30); }
      if (hScore !== null) { scores.push(hScore); weights.push(0.30); }
      if (rScore !== null) { scores.push(rScore); weights.push(0.20); }
      if (lScore !== null) { scores.push(lScore); weights.push(0.20); }
      break;
    }
    case 'storage': {
      const st = data;
      const gScore = getParamScore(st.mq135, 0, 300, 500); 
      const tScore = getParamScore(st.temp, 15, 25, 15);
      const hScore = getParamScore(st.humidity, 40, 60, 40);
      const aScore = getParamScore(st.mq135, 0, 100, 200); 

      if (gScore !== null) { scores.push(gScore); weights.push(0.35); }
      if (tScore !== null) { scores.push(tScore); weights.push(0.25); }
      if (hScore !== null) { scores.push(hScore); weights.push(0.25); }
      if (aScore !== null) { scores.push(aScore); weights.push(0.15); }
      break;
    }
    case 'irrigation': {
      const ir = data;
      const lScore = getParamScore(ir.level, 30, 100, 50);
      const pScore = ir.pumpActive !== undefined ? (ir.pumpActive ? 100 : 90) : null; 

      if (lScore !== null) { scores.push(lScore); weights.push(0.70); }
      if (pScore !== null) { scores.push(pScore); weights.push(0.30); }
      break;
    }
    default: return null;
  }

  if (scores.length === 0) return null;
  
  const totalPossible = { soil: 4, weather: 4, storage: 4, irrigation: 2 }[nodeType];
  if (scores.length < 1) return null; // Allow single sensor nodes to show health

  const currentTotalWeight = weights.reduce((a, b) => a + b, 0);
  const health = scores.reduce((acc, score, idx) => acc + (score * (weights[idx] / currentTotalWeight)), 0);
  
  return Math.round(health);
};

export const getHealthColor = (score) => {
  if (score === null || score === undefined) return '#94A3B8'; // Offline
  if (score >= 80) return '#10B981'; // Healthy
  if (score >= 60) return '#F59E0B'; // Moderate
  if (score >= 40) return '#FB923C'; // Warning
  return '#EF4444'; // Critical
};
