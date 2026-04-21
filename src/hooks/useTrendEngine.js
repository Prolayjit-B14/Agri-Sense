/**
 * 🧠 Agri-Sense Intelligent Trend Engine
 * Computes rolling window analysis on sensor history.
 * Returns per-parameter insights and a weighted soil health score.
 */

const WINDOW_SIZE = 10; // Use last 10 readings

// --- Core Math Utilities ---

const avg = (arr) => arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length;
const rateOfChange = (arr) => arr.length < 2 ? null : arr[arr.length - 1] - arr[0];
const variation = (arr) => arr.length < 2 ? null : Math.max(...arr) - Math.min(...arr);
const safeNum = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };

// --- Extract a numeric param series from history ---
const extractSeries = (history, selector) => {
  return history
    .map(entry => safeNum(selector(entry)))
    .filter(v => v !== null);
};

// --- 1️⃣ MOISTURE TREND ---
const analyzeMoisture = (series) => {
  if (series.length < 3) return { trend: null, insight: 'Not enough data to generate insight', color: '#CBD5E1' };

  const average = avg(series);
  const rate = rateOfChange(series);
  const vari = variation(series);
  const lastVal = series[series.length - 1];

  if (vari > 15) {
    return { trend: 'unstable', insight: 'Sudden moisture variation detected — possible sensor disturbance or water event', color: '#F59E0B' };
  }
  if (rate > 5) {
    return { trend: 'increasing', insight: 'Moisture gradually improving — soil water retention is active', color: '#10B981' };
  }
  if (rate < -5) {
    if (Math.abs(rate) > 15) {
      return { trend: 'dropping', insight: 'Rapid moisture drop — possible water loss or drainage event', color: '#EF4444' };
    }
    return { trend: 'decreasing', insight: 'Moisture gradually decreasing — irrigation may be needed soon', color: '#F59E0B' };
  }
  if (lastVal >= 35 && lastVal <= 65 && vari < 5) {
    return { trend: 'stable_optimal', insight: 'Moisture stable within optimal range — soil hydration is healthy', color: '#10B981' };
  }
  if (lastVal < 25) {
    return { trend: 'low_stable', insight: 'Moisture stable but below optimal — consider irrigation', color: '#F59E0B' };
  }
  return { trend: 'stable', insight: 'Moisture stable with minor fluctuations', color: '#64748B' };
};

// --- 2️⃣ TEMPERATURE TREND ---
const analyzeTemperature = (series) => {
  if (series.length < 3) return { trend: null, insight: 'Not enough data to generate insight', color: '#CBD5E1' };

  const rate = rateOfChange(series);
  const vari = variation(series);
  const lastVal = series[series.length - 1];

  if (vari > 8) {
    return { trend: 'spike', insight: 'Temperature spike detected — possible external heating or direct sunlight effect', color: '#EF4444' };
  }
  if (rate > 3) {
    return { trend: 'rising', insight: 'Gradual temperature rise detected — monitor for heat stress on roots', color: '#F59E0B' };
  }
  if (rate < -3) {
    return { trend: 'cooling', insight: 'Temperature gradually cooling — could indicate evening transition', color: '#3B82F6' };
  }
  if (lastVal < 30 && vari < 3) {
    return { trend: 'stable_optimal', insight: 'Temperature stable at optimal root level — healthy growing environment', color: '#10B981' };
  }
  if (lastVal >= 30) {
    return { trend: 'elevated', insight: 'Temperature above 30°C — elevated heat exposure for root zone', color: '#F59E0B' };
  }
  return { trend: 'stable', insight: 'Temperature stable with minor variation', color: '#64748B' };
};

// --- 3️⃣ pH TREND ---
const analyzePH = (series) => {
  if (series.length < 3) return { trend: null, insight: 'Not enough data to generate insight', color: '#CBD5E1' };

  const average = avg(series);
  const vari = variation(series);
  const lastVal = series[series.length - 1];

  if (vari > 1.5) {
    return { trend: 'unstable', insight: 'pH fluctuating significantly — unstable soil chemistry detected', color: '#EF4444' };
  }
  if (average >= 6.0 && average <= 7.5 && vari < 0.5) {
    return { trend: 'optimal', insight: 'pH maintaining neutral range — healthy microbial activity likely', color: '#10B981' };
  }
  if (average < 6.0) {
    const severity = average < 5.5 ? 'High acidity' : 'Slight acidity';
    return { trend: 'acidic', insight: `${severity} detected (avg ${average.toFixed(1)}) — consider lime application`, color: '#F59E0B' };
  }
  if (average > 7.5) {
    const severity = average > 8.0 ? 'High alkalinity' : 'Slight alkalinity';
    return { trend: 'alkaline', insight: `${severity} detected (avg ${average.toFixed(1)}) — consider sulfur amendment`, color: '#F59E0B' };
  }
  return { trend: 'stable', insight: 'pH stable within acceptable range', color: '#64748B' };
};

// --- 4️⃣ NPK BALANCE ---
const analyzeNPK = (nSeries, pSeries, kSeries) => {
  const lastN = nSeries.length > 0 ? nSeries[nSeries.length - 1] : null;
  const lastP = pSeries.length > 0 ? pSeries[pSeries.length - 1] : null;
  const lastK = kSeries.length > 0 ? kSeries[kSeries.length - 1] : null;

  if (lastN === null || lastP === null || lastK === null) {
    return { trend: null, insight: 'Not enough data to generate insight', color: '#CBD5E1' };
  }

  const total = lastN + lastP + lastK;
  if (total === 0) return { trend: null, insight: 'NPK sensors returned zero values', color: '#CBD5E1' };

  const nPct = (lastN / total) * 100;
  const pPct = (lastP / total) * 100;
  const kPct = (lastK / total) * 100;

  const isBalanced = Math.max(nPct, pPct, kPct) - Math.min(nPct, pPct, kPct) < 15;

  if (isBalanced) {
    return { trend: 'balanced', insight: 'Balanced macronutrient profile — N, P, K in healthy ratio', color: '#10B981' };
  }

  const dominant = nPct > pPct && nPct > kPct ? 'Nitrogen' : (pPct > nPct && pPct > kPct ? 'Phosphorus' : 'Potassium');
  const deficient = nPct < pPct && nPct < kPct ? 'Nitrogen' : (pPct < nPct && pPct < kPct ? 'Phosphorus' : 'Potassium');

  return {
    trend: 'imbalanced',
    insight: `${dominant} dominant — possible ${deficient} deficiency trend (N:${lastN.toFixed(0)} P:${lastP.toFixed(0)} K:${lastK.toFixed(0)})`,
    color: '#F59E0B'
  };
};

// --- 5️⃣ WEIGHTED SOIL HEALTH SCORE ---
// Moisture 30% | Temperature 25% | pH 25% | NPK Balance 20%
const computeHealthScore = (moistureSeries, tempSeries, phSeries, nSeries, pSeries, kSeries) => {
  const hasData = moistureSeries.length >= 3;
  if (!hasData) return null;

  // Moisture score (0–100)
  const lastMoisture = moistureSeries[moistureSeries.length - 1];
  let mScore = 0;
  if (lastMoisture >= 35 && lastMoisture <= 65) mScore = 100;
  else if (lastMoisture >= 25 && lastMoisture < 35) mScore = 70;
  else if (lastMoisture >= 65 && lastMoisture <= 80) mScore = 70;
  else mScore = 30;

  // Temperature score
  const lastTemp = tempSeries.length > 0 ? tempSeries[tempSeries.length - 1] : null;
  let tScore = lastTemp !== null ? (lastTemp < 30 ? 100 : lastTemp < 38 ? 60 : 20) : 50;

  // pH score
  const lastPH = phSeries.length > 0 ? phSeries[phSeries.length - 1] : null;
  let pHScore = 50; // default neutral
  if (lastPH !== null) {
    if (lastPH >= 6.0 && lastPH <= 7.5) pHScore = 100;
    else if (lastPH >= 5.5 && lastPH < 6.0) pHScore = 65;
    else if (lastPH > 7.5 && lastPH <= 8.0) pHScore = 65;
    else pHScore = 25;
  }

  // NPK score
  const lastN = nSeries.length > 0 ? nSeries[nSeries.length - 1] : null;
  const lastP = pSeries.length > 0 ? pSeries[pSeries.length - 1] : null;
  const lastK = kSeries.length > 0 ? kSeries[kSeries.length - 1] : null;
  let npkScore = 50;
  if (lastN !== null && lastP !== null && lastK !== null) {
    const total = lastN + lastP + lastK;
    if (total > 0) {
      const spread = Math.max(lastN / total, lastP / total, lastK / total) - Math.min(lastN / total, lastP / total, lastK / total);
      npkScore = spread < 0.15 ? 100 : spread < 0.30 ? 70 : 30;
    }
  }

  const weighted = (mScore * 0.30) + (tScore * 0.25) + (pHScore * 0.25) + (npkScore * 0.20);
  return Math.round(weighted);
};

const scoreLabel = (score) => {
  if (score === null) return { label: '--', color: '#CBD5E1', bg: '#F8FAFC' };
  if (score >= 80) return { label: 'Excellent', color: '#10B981', bg: '#ECFDF5' };
  if (score >= 60) return { label: 'Good', color: '#14B8A6', bg: '#F0FDFA' };
  if (score >= 40) return { label: 'Needs Attention', color: '#F59E0B', bg: '#FFFBEB' };
  return { label: 'Poor Condition', color: '#EF4444', bg: '#FEF2F2' };
};

// --- MAIN HOOK ---
const useTrendEngine = (sensorHistory) => {
  const window = sensorHistory ? sensorHistory.slice(-WINDOW_SIZE) : [];

  const moistureSeries = extractSeries(window, e => e.soil?.moisture);
  const tempSeries = extractSeries(window, e => e.soil?.temp);
  const phSeries = extractSeries(window, e => e.soil?.ph);
  const nSeries = extractSeries(window, e => e.soil?.npk?.n);
  const pSeries = extractSeries(window, e => e.soil?.npk?.p);
  const kSeries = extractSeries(window, e => e.soil?.npk?.k);

  const moisture = analyzeMoisture(moistureSeries);
  const temperature = analyzeTemperature(tempSeries);
  const ph = analyzePH(phSeries);
  const npk = analyzeNPK(nSeries, pSeries, kSeries);
  const healthScore = computeHealthScore(moistureSeries, tempSeries, phSeries, nSeries, pSeries, kSeries);
  const scoreInfo = scoreLabel(healthScore);

  const hasData = moistureSeries.length >= 3;
  const dataPoints = moistureSeries.length;

  return {
    moisture,
    temperature,
    ph,
    npk,
    healthScore,
    scoreInfo,
    hasData,
    dataPoints,
    windowSize: WINDOW_SIZE
  };
};

export default useTrendEngine;
