import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  Thermometer, Droplet, Wind, ShieldCheck,
  Battery, Clock, ChevronRight,
  AlertCircle, CheckCircle2, AlertTriangle,
  BarChart3, SignalHigh, Server, Sparkles
} from 'lucide-react';

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────
const THEME = {
  safe: { color: '#10B981', bg: '#ECFDF5', light: '#D1FAE5' },
  warning: { color: '#F59E0B', bg: '#FFFBEB', light: '#FEF3C7' },
  danger: { color: '#EF4444', bg: '#FEF2F2', light: '#FEE2E2' },
  offline: { color: '#94A3B8', bg: '#F8FAFC', light: '#F1F5F9' },
  primary: '#8B5CF6',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#F1F5F9'
};

const STORAGE_TYPES = [
  { id: 'potato', name: 'Potato', temp: [4, 12], hum: [85, 95], gas: 400 },
  { id: 'onion', name: 'Onion', temp: [0, 5], hum: [65, 75], gas: 300 },
  { id: 'fruits', name: 'Fruits', temp: [2, 8], hum: [80, 90], gas: 500 },
  { id: 'rice', name: 'Rice', temp: [15, 25], hum: [12, 14], gas: 200 }
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const CircularRing = ({ value, color, isOffline, size = 45 }) => {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const numericValue = parseFloat(value) || 0;
  const strokeDashoffset = isOffline ? circumference : circumference - (Math.min(numericValue, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={THEME.border} strokeWidth="4" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </svg>
  );
};

const ConnectionBadge = ({ status }) => {
  const config = {
    connected: { color: THEME.safe.color, text: 'Online', bg: THEME.safe.bg },
    disconnected: { color: THEME.offline.color, text: 'Offline', bg: THEME.offline.bg },
    error: { color: THEME.danger.color, text: 'Error', bg: THEME.danger.bg }
  };
  const active = config[status] || config.disconnected;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '100px', background: 'white',
      border: `1px solid ${THEME.border}`, boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: active.color, boxShadow: `0 0 8px ${active.color}60` }} />
      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: THEME.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {active.text}
      </span>
    </div>
  );
};

const SensorCard = ({ title, value, unit, icon: Icon, color, isOffline, statusText, delay = 0, ringValue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{
        background: THEME.surface, borderRadius: '28px', padding: '1.25rem',
        border: `1px solid ${THEME.border}`, boxShadow: '0 10px 25px -10px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '12px',
          background: `${isOffline ? THEME.offline.color : color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${isOffline ? THEME.offline.color : color}20`
        }}>
          <Icon size={18} color={isOffline ? THEME.offline.color : color} />
        </div>
        {ringValue !== undefined && <CircularRing value={ringValue} color={isOffline ? THEME.offline.color : color} isOffline={isOffline} />}
      </div>

      <div>
        <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: THEME.textSecondary, textTransform: 'uppercase' }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 950, color: isOffline ? THEME.offline.color : THEME.text }}>
            {isOffline ? '--' : value}
          </span>
          {!isOffline && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: THEME.textSecondary }}>{unit}</span>}
        </div>
      </div>

      <div style={{
        padding: '4px 10px', borderRadius: '8px',
        background: isOffline ? THEME.offline.bg : `${color}10`,
        width: 'fit-content'
      }}>
        <span style={{ fontSize: '0.6rem', fontWeight: 900, color: isOffline ? THEME.offline.color : color, textTransform: 'uppercase' }}>
          {isOffline ? 'OFFLINE' : statusText}
        </span>
      </div>
    </motion.div>
  );
};

const StorageMonitoring = () => {
  const navigate = useNavigate();
  const { sensorData, lastGlobalUpdate, mqttStatus } = useApp();
  const [activeType, setActiveType] = useState(STORAGE_TYPES[0]);

  const storage = sensorData?.storage || {};
  const isOffline = storage.temp === null || storage.temp === undefined;

  const stats = useMemo(() => {
    const t = storage.temp;
    const h = storage.humidity;
    const e = storage.mq135;
    const f = storage.freshnessScore;

    let score = f || 0;
    let insights = [];
    let riskLevel = 'offline';

    if (!isOffline) {
      if (t < activeType.temp[0] || t > activeType.temp[1]) {
        insights.push("Temperature instability detected");
      }
      if (h < activeType.hum[0] || h > activeType.hum[1]) {
        insights.push(h > activeType.hum[1] ? "High humidity detected" : "Low humidity detected");
      }
      if (e > activeType.gas) {
        insights.push("Ethylene rising - decay risk");
      }

      if (score < 60) riskLevel = 'danger';
      else if (score < 85) riskLevel = 'warning';
      else riskLevel = 'safe';
    } else {
      insights = ["Waiting for real-time telemetry..."];
    }

    return {
      temp: t,
      hum: h,
      gas: e,
      score: score,
      insights,
      riskLevel
    };
  }, [storage, activeType]);

  const riskUI = THEME[stats.riskLevel] || THEME.offline;

  return (
    <div style={{
      padding: '1.25rem', background: THEME.background,
      display: 'flex', flexDirection: 'column', gap: '1rem'
    }}>




      {/* 2X2 SENSOR GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <SensorCard
          title="Temperature" value={(stats.temp !== null && stats.temp !== undefined) ? Number(stats.temp).toFixed(1) : '--'} unit="°C" icon={Thermometer}
          color={stats.temp < activeType.temp[0] || stats.temp > activeType.temp[1] ? THEME.danger.color : THEME.safe.color}
          isOffline={isOffline} statusText={(stats.temp !== null && stats.temp !== undefined) ? (stats.temp > activeType.temp[1] ? "High" : stats.temp < activeType.temp[0] ? "Low" : "Optimal") : "Offline"}
          ringValue={(parseFloat(stats.temp) / 50) * 100} delay={0.1}
        />
        <SensorCard
          title="Humidity" value={(stats.hum !== null && stats.hum !== undefined) ? Number(stats.hum).toFixed(0) : '--'} unit="%" icon={Droplet}
          color={stats.hum < activeType.hum[0] || stats.hum > activeType.hum[1] ? THEME.warning.color : THEME.primary}
          isOffline={isOffline} statusText={`Ideal: ${activeType.hum[0]}%`}
          ringValue={parseFloat(stats.hum)} delay={0.15}
        />
        <SensorCard
          title="Gas Level" value={stats.gas || '--'} unit="ppm" icon={Wind}
          color={stats.gas > activeType.gas ? THEME.danger.color : THEME.warning.color}
          isOffline={isOffline} statusText={stats.gas > activeType.gas ? "Spoilage" : "Normal"}
          ringValue={(parseFloat(stats.gas) / 1000) * 100} delay={0.2}
        />
        <SensorCard
          title="Freshness" value={stats.score || '--'} unit="%" icon={ShieldCheck}
          color={riskUI.color} isOffline={isOffline} statusText={stats.riskLevel}
          ringValue={parseFloat(stats.score)} delay={0.25}
        />
      </div>

      {/* HEALTH INSIGHT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{
          background: 'white', borderRadius: '32px', padding: '1.5rem',
          border: `1px solid ${riskUI.color}20`, position: 'relative', overflow: 'hidden',
          boxShadow: `0 20px 40px -15px ${riskUI.color}15`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: riskUI.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color={riskUI.color} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 950, color: THEME.text }}>Storage Health</h3>
              <p style={{ margin: 0, fontSize: '0.65rem', color: THEME.textSecondary, fontWeight: 700 }}>AI Neural Diagnosis</p>
            </div>
          </div>
          <div style={{ padding: '6px 14px', borderRadius: '100px', background: riskUI.bg, color: riskUI.color, fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase' }}>
            {stats.riskLevel}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!isOffline ? (stats.insights.length > 0 ? stats.insights.map((msg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: riskUI.color }} />
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 750, color: THEME.text }}>{msg}</p>
            </div>
          )) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color={THEME.safe.color} />
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 750, color: THEME.text }}>Safe storage conditions maintained.</p>
            </div>
          )) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={16} color={THEME.offline.color} />
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 750, color: THEME.textSecondary }}>Waiting for sensor telemetry...</p>
            </div>
          )}
        </div>
      </motion.div>


      {/* ANALYTICS BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/analytics', { state: { tab: 'Storage' } })}
          style={{ 
            padding: '10px 24px', borderRadius: '20px', background: THEME.text, 
            border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>Storage Analytics</span>
          <ChevronRight size={14} />
        </motion.button>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StorageMonitoring;
