import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import useTrendEngine from '../hooks/useTrendEngine';
import {
  Sprout, Droplets, Thermometer, Activity,
  History, TrendingUp, TrendingDown,
  Minus, AlertTriangle, BarChart3, Leaf, Sparkles
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
  const trend = useTrendEngine(sensorHistory);

  const stats = useMemo(() => {
    const getSafeVal = (v) => {
      const n = parseFloat(v);
      return isNaN(n) ? null : n.toFixed(1);
    };
    return {
      moisture: getSafeVal(soil.moisture),
      temp: getSafeVal(soil.temp),
      ph: getSafeVal(soil.ph),
      humidity: getSafeVal(soil.humidity),
    };
  }, [soil]);

  const isOnline = stats.moisture !== null || stats.temp !== null || stats.ph !== null;
  const heroVal = stats.moisture !== null ? `${stats.moisture}%` : (isOnline ? '--' : 'Offline');

  const sensors = [
    { label: 'Soil Temperature', val: stats.temp, unit: '°C', icon: Thermometer, color: '#10B981' },
    { label: 'Soil pH Level', val: stats.ph, unit: 'pH', icon: Activity, color: '#3B82F6' },
    { label: 'Air Humidity', val: stats.humidity, unit: '%', icon: Droplets, color: '#14B8A6' },
    { label: 'Root Activity', val: isOnline ? 'Active' : null, unit: '', icon: Sprout, color: '#F59E0B' },
  ];

  const { healthScore, scoreInfo } = trend;

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '100px' }}>

      {/* 1. HERO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '24px', padding: '1.75rem', color: 'white',
          boxShadow: '0 12px 24px -8px rgba(16, 185, 129, 0.4)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.15 }}>
          <Sprout size={140} color="white" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: isOnline ? '#34D399' : '#CBD5E1',
                boxShadow: isOnline ? '0 0 10px #34D399' : 'none'
              }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.9 }}>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Soil Intelligence</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
              <History size={12} /><span style={{ fontSize: '0.65rem', fontWeight: 700 }}>{lastGlobalUpdate || '--'}</span>
            </div>
            {healthScore !== null && (
              <div style={{ padding: '3px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', fontSize: '0.65rem', fontWeight: 900 }}>
                Score: {healthScore}/100
              </div>
            )}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '3.5rem', fontWeight: 950, lineHeight: 1 }}>{heroVal}</span>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.9, marginTop: '8px' }}>Volumetric Moisture Content</p>
        </div>
      </motion.div>

      {/* 2. PREDICTIVE INSIGHT */}
      <PredictiveBanner moisture={stats.moisture} trend={trend.moisture.trend} />

      {/* 3. SENSOR GRID */}
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
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: s.val === null ? '#CBD5E1' : COLORS.text }}>{s.val || '--'}</span>
              {s.val !== null && s.unit && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>{s.unit}</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 4. TREND ANALYSIS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: `1px solid ${COLORS.border}` }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BarChart3 size={16} color={COLORS.primary} /></div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: COLORS.text, margin: 0, textTransform: 'uppercase' }}>Trend Analysis</h3>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8' }}>{trend.hasData ? `Last ${trend.dataPoints} readings` : 'Awaiting data'}</span>
        </div>

        <div style={{ background: scoreInfo.bg, borderRadius: '16px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', border: `1px solid ${scoreInfo.color}20` }}>
          <div><p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Soil Health Score</p><p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: 800, color: scoreInfo.color }}>{scoreInfo.label}</p></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}><span style={{ fontSize: '2.5rem', fontWeight: 950, color: scoreInfo.color, lineHeight: 1 }}>{healthScore !== null ? healthScore : '--'}</span>{healthScore !== null && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: scoreInfo.color }}>/100</span>}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <InsightRow label="💧 Moisture Trend" insightObj={trend.moisture} delay={0.05} />
          <InsightRow label="🌡️ Temperature" insightObj={trend.temperature} delay={0.10} />
          <InsightRow label="⚗️ pH Status" insightObj={trend.ph} delay={0.15} />
          <InsightRow label="🌿 NPK Balance" insightObj={trend.npk} delay={0.20} />
        </div>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/analytics')}
        style={{
          width: '100%', padding: '1.1rem', borderRadius: '18px',
          background: COLORS.primary, color: 'white', border: 'none',
          fontSize: '0.95rem', fontWeight: 900, cursor: 'pointer',
          boxShadow: `0 8px 16px -4px ${COLORS.primary}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        <Leaf size={18} strokeWidth={2.5} />Soil Analytics Hub
      </motion.button>

    </div>
  );
};

export default SoilMonitoring;
