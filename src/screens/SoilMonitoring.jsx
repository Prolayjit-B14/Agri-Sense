import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import useTrendEngine from '../hooks/useTrendEngine';
import {
  Sprout, Droplets, Thermometer, Activity,
  History, TrendingUp, TrendingDown,
  Minus, AlertTriangle, BarChart3, Leaf, Sparkles,
  Wind, Droplet
} from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  secondary: '#3B82F6',
  warning: '#EF4444',
  text: '#1E293B',
  subtext: '#64748B',
  border: '#F1F5F9'
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const TrendIcon = ({ trend }) => {
  if (trend === 'increasing' || trend === 'stable_optimal' || trend === 'balanced' || trend === 'optimal') {
    return <TrendingUp size={13} strokeWidth={2.5} />;
  }
  if (trend === 'decreasing' || trend === 'dropping' || trend === 'acidic' || trend === 'alkaline' || trend === 'imbalanced') {
    return <TrendingDown size={13} strokeWidth={2.5} />;
  }
  if (trend === 'spike' || trend === 'unstable') {
    return <AlertTriangle size={13} strokeWidth={2.5} />;
  }
  return <Minus size={13} strokeWidth={2.5} />;
};

const InsightRow = ({ label, insightObj, delay = 0 }) => {
  const { insight, color, trend } = insightObj;
  const isNoData = trend === null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      style={{
        display: 'flex', flexDirection: 'column', gap: '4px',
        paddingBottom: '1rem', borderBottom: `1px solid ${COLORS.border}`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        {!isNoData && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            color, fontSize: '0.7rem', fontWeight: 800
          }}>
            <TrendIcon trend={trend} />
            {trend.replace(/_/g, ' ')}
          </span>
        )}
      </div>
      <p style={{
        margin: 0, fontSize: '0.82rem', fontWeight: 700,
        color: isNoData ? '#CBD5E1' : '#475569',
        lineHeight: 1.4
      }}>
        {insight}
      </p>
    </motion.div>
  );
};

const PredictiveBanner = ({ moisture, trend }) => {
  const prediction = useMemo(() => {
    if (!moisture || trend === null) return null;
    const m = parseFloat(moisture);
    if (trend === 'dropping' && m < 30) return { text: "Critical dryness predicted within 4 hours. Irrigation recommended.", color: '#EF4444' };
    if (trend === 'increasing' && m > 70) return { text: "Soil reaching saturation. Monitor drainage.", color: '#F59E0B' };
    if (trend === 'stable_optimal') return { text: "Optimal moisture predicted to persist for next 12 hours.", color: '#10B981' };
    return null;
  }, [moisture, trend]);

  if (!prediction) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: `${prediction.color}10`, border: `1px dashed ${prediction.color}40`,
        borderRadius: '16px', padding: '1rem', display: 'flex', gap: '10px', alignItems: 'flex-start',
        marginBottom: '1rem'
      }}
    >
      <Sparkles size={18} color={prediction.color} />
      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: COLORS.text, lineHeight: 1.4 }}>
        <span style={{ color: prediction.color, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', marginBottom: '2px' }}>Predictive Insight</span>
        {prediction.text}
      </p>
    </motion.div>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const SoilMonitoring = () => {
  const navigate = useNavigate();
  const { sensorData, sensorHistory, lastGlobalUpdate } = useApp();
  const soil = sensorData?.soil || {};
  const weather = sensorData?.weather || {};
  const trend = useTrendEngine(sensorHistory);

  const stats = useMemo(() => {
    const getSafeVal = (v) => {
      const n = parseFloat(v);
      return isNaN(n) ? null : n.toFixed(1);
    };
    return {
      moisture: getSafeVal(soil.moisture),
      ph: getSafeVal(soil.ph),
      humidity: getSafeVal(soil.humidity),
      n: soil.npk?.n || 0,
      p: soil.npk?.p || 0,
      k: soil.npk?.k || 0,
    };
  }, [soil, weather]);

  const isOnline = stats.moisture !== null || stats.ph !== null;
  const heroVal = stats.moisture !== null ? `${stats.moisture}%` : (isOnline ? '---' : 'Offline');

  const sensors = [
    { label: 'Soil pH Level', val: stats.ph, unit: 'pH', icon: Activity, color: '#3B82F6' },
    { label: 'Soil Moisture', val: stats.moisture, unit: '%', icon: Droplets, color: '#14B8A6' },
  ];

  const { healthScore, scoreInfo } = trend;

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '100px' }}>

      {/* 1. HERO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '32px', padding: '2rem', color: 'white',
          boxShadow: '0 20px 40px -12px rgba(16, 185, 129, 0.35)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '150px', height: '150px', background: 'rgba(52,211,153,0.2)', borderRadius: '50%', filter: 'blur(40px)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: isOnline ? '#34D399' : '#CBD5E1',
                boxShadow: isOnline ? '0 0 15px #34D399' : 'none'
              }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.9, letterSpacing: '0.05em' }}>{isOnline ? 'SENSORS ONLINE' : 'SENSORS OFFLINE'}</span>
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, opacity: 0.8 }}>Ground-Truth Metrics</p>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '4.5rem', fontWeight: 950, lineHeight: 1, letterSpacing: '-0.02em' }}>{heroVal}</span>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 800, opacity: 0.95, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={16} /> Precision Soil Moisture
          </p>
        </div>
      </motion.div>

      {/* 2. NPK DASHBOARD (Real Data) */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '1.25rem', border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: COLORS.subtext, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sprout size={16} color={COLORS.primary} /> NPK Nutrient Profile
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8' }}>Nitrogen (N)</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 950, color: '#10B981' }}>{stats.n}<span style={{ fontSize: '0.7rem' }}> mg/kg</span></p>
          </div>
          <div style={{ textAlign: 'center', borderLeft: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}` }}>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8' }}>Phospho (P)</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 950, color: '#3B82F6' }}>{stats.p}<span style={{ fontSize: '0.7rem' }}> mg/kg</span></p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8' }}>Potass (K)</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 950, color: '#F59E0B' }}>{stats.k}<span style={{ fontSize: '0.7rem' }}> mg/kg</span></p>
          </div>
        </div>
      </div>

      {/* 3. PREDICTIVE INSIGHT */}
      <PredictiveBanner moisture={stats.moisture} trend={trend.moisture.trend} />

      {/* 4. SENSOR GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {sensors.map((s, i) => (
          <motion.div
            key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{
              background: 'white', borderRadius: '24px', padding: '1.25rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: `1px solid ${COLORS.border}`
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: s.val === null ? '#CBD5E1' : COLORS.text }}>{s.val || '---'}</span>
              {s.val !== null && s.unit && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>{s.unit}</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 5. TREND ANALYSIS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: `1px solid ${COLORS.border}` }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BarChart3 size={16} color={COLORS.primary} /></div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: COLORS.text, margin: 0, textTransform: 'uppercase' }}>Trend Analysis</h3>
          </div>
        </div>

        <div style={{ background: scoreInfo.bg, borderRadius: '16px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', border: `1px solid ${scoreInfo.color}20` }}>
          <div><p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Soil Health Score</p><p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: 800, color: scoreInfo.color }}>{scoreInfo.label}</p></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}><span style={{ fontSize: '2.5rem', fontWeight: 950, color: scoreInfo.color, lineHeight: 1 }}>{healthScore !== null ? healthScore : '---'}</span>{healthScore !== null && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: scoreInfo.color }}>/100</span>}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <InsightRow label="💧 Moisture Trend" insightObj={trend.moisture} delay={0.05} />
          <InsightRow label="⚗️ pH Status" insightObj={trend.ph} delay={0.15} />
          <InsightRow label="🌿 NPK Balance" insightObj={trend.npk} delay={0.20} />
        </div>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/analytics', { state: { tab: 'Soil' } })}
        style={{ width: '100%', padding: '1.25rem', borderRadius: '24px', background: 'white', border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: '0.9rem', fontWeight: 950, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '0.5rem', cursor: 'pointer' }}
      >
        Deep Soil Analytics <BarChart3 size={18} />
      </motion.button>

    </div>
  );
};

export default SoilMonitoring;
