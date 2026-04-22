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
  if (series.length < 3) return { trend: 'offline', insight: '---', color: '#CBD5E1' };

  const rate = rateOfChange(series);
  const vari = variation(series);
  const lastVal = series[series.length - 1];

  if (vari > 15) return { trend: 'unstable', insight: 'Fluctuating moisture detected', color: '#F59E0B' };
  if (rate > 5) return { trend: 'increasing', insight: 'Moisture gradually improving', color: '#10B981' };
  if (rate < -5) return { trend: 'decreasing', insight: 'Moisture gradually dropping', color: '#EF4444' };
  if (lastVal >= 35 && lastVal <= 65) return { trend: 'stable', insight: 'Moisture stable in optimal range', color: '#10B981' };
  return { trend: 'stable', insight: 'Soil hydration level stable', color: '#64748B' };
};

// --- 2️⃣ TEMPERATURE TREND ---
const analyzeTemperature = (series) => {
  if (series.length < 3) return { trend: 'offline', insight: '---', color: '#CBD5E1' };

  const rate = rateOfChange(series);
  const lastVal = series[series.length - 1];

  if (rate > 3) return { trend: 'rising', insight: 'Soil temperature rising gradually', color: '#F59E0B' };
  if (rate < -3) return { trend: 'cooling', insight: 'Soil temperature cooling', color: '#3B82F6' };
  return { trend: 'stable', insight: 'Root zone temperature stable', color: '#10B981' };
};

// --- 3️⃣ pH TREND ---
const analyzePH = (series) => {
  if (series.length < 3) return { trend: 'offline', insight: '---', color: '#CBD5E1' };

  const average = avg(series);
  if (average >= 6.0 && average <= 7.5) return { trend: 'optimal', insight: 'pH stable in neutral range', color: '#10B981' };
  if (average < 6.0) return { trend: 'acidic', insight: 'Low pH detected (acidic)', color: '#F59E0B' };
  return { trend: 'alkaline', insight: 'High pH detected (alkaline)', color: '#F59E0B' };
};

// --- 4️⃣ NPK BALANCE ---
const analyzeNPK = (nSeries, pSeries, kSeries) => {
  const lastN = nSeries.length > 0 ? nSeries[nSeries.length - 1] : null;
  const lastP = pSeries.length > 0 ? pSeries[pSeries.length - 1] : null;
  const lastK = kSeries.length > 0 ? kSeries[kSeries.length - 1] : null;

  if (lastN === null || lastP === null || lastK === null) {
    return { trend: 'offline', insight: '---', color: '#CBD5E1' };
  }

  const total = lastN + lastP + lastK;
  if (total === 0) return { trend: 'offline', insight: '---', color: '#CBD5E1' };

  const spread = Math.max(lastN/total, lastP/total, lastK/total) - Math.min(lastN/total, lastP/total, lastK/total);
  if (spread < 0.15) return { trend: 'balanced', insight: 'Balanced nutrient profile', color: '#10B981' };
  return { trend: 'imbalanced', insight: 'Nutrient imbalance detected', color: '#F59E0B' };
};

// --- 5️⃣ WEIGHTED SOIL HEALTH SCORE ---
const computeHealthScore = (moistureSeries, tempSeries, phSeries, nSeries, pSeries, kSeries) => {
  // CRITICAL: Moisture is the lifeline of the score
  if (moistureSeries.length < 2) return null;

  const lastM = moistureSeries[moistureSeries.length - 1];
  const mScore = (lastM >= 35 && lastM <= 65) ? 100 : (lastM >= 25 && lastM <= 80 ? 70 : 30);

  const lastT = tempSeries.length > 0 ? tempSeries[tempSeries.length - 1] : null;
  const tScore = lastT !== null ? (lastT < 30 ? 100 : lastT < 38 ? 60 : 20) : null;

  const lastPH = phSeries.length > 0 ? phSeries[phSeries.length - 1] : null;
  const pHScore = lastPH !== null ? (lastPH >= 6.0 && lastPH <= 7.5 ? 100 : 60) : null;

  const lastN = nSeries.length > 0 ? nSeries[nSeries.length - 1] : null;
  const lastP = pSeries.length > 0 ? pSeries[pSeries.length - 1] : null;
  const lastK = kSeries.length > 0 ? kSeries[kSeries.length - 1] : null;
  
  let npkScore = null;
  if (lastN !== null && lastP !== null && lastK !== null) {
    const total = lastN + lastP + lastK;
    if (total > 0) {
      const spread = Math.max(lastN/total, lastP/total, lastK/total) - Math.min(lastN/total, lastP/total, lastK/total);
      npkScore = spread < 0.15 ? 100 : (spread < 0.30 ? 70 : 30);
    }
  }

  // Weightage: M 35% | T 25% | pH 20% | NPK 20%
  // If a score is null, we distribute its weight or keep the final score as null if critical
  if (mScore === null) return null;

  let totalWeight = 35;
  let finalScore = mScore * 0.35;

  if (tScore !== null) { finalScore += tScore * 0.25; totalWeight += 25; }
  if (pHScore !== null) { finalScore += pHScore * 0.20; totalWeight += 20; }
  if (npkScore !== null) { finalScore += npkScore * 0.20; totalWeight += 20; }

  return Math.round((finalScore / totalWeight) * 100);
};

const scoreLabel = (score) => {
  if (score === null || isNaN(score)) return { label: 'Offline', color: '#94A3B8', bg: '#F1F5F9' };
  if (score >= 80) return { label: 'Excellent', color: '#10B981', bg: '#ECFDF5' };
  if (score >= 60) return { label: 'Good', color: '#14B8A6', bg: '#F0FDFA' };
  if (score >= 40) return { label: 'Moderate', color: '#F59E0B', bg: '#FFFBEB' };
  return { label: 'Poor', color: '#EF4444', bg: '#FEF2F2' };
};

// --- MAIN HOOK ---
const useTrendEngine = (sensorHistory) => {
  const window = (sensorHistory || []).slice(-WINDOW_SIZE);

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

  return {
    moisture,
    temperature,
    ph,
    npk,
    healthScore,
    scoreInfo,
    hasData: moistureSeries.length >= 3,
    dataPoints: moistureSeries.length
  };
};

export default useTrendEngine;
