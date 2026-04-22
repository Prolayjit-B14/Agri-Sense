/**
 * AgriSense v2.8.0 Dashboard
 * High-level overview of farm health, core metrics, and active controls.
 */

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, Droplets, CloudRain, Archive,
  MapPin, Activity, Power, ChevronRight,
  ShieldCheck
} from 'lucide-react';

// Context & Utils
import { useApp } from '../context/AppContext';
import { getHealthColor } from '../utils/healthEngine';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  primaryDark: '#059669',
  secondary: '#0EA5E9',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  textMain: '#0F172A',
  textMuted: '#64748B',
  border: 'rgba(0, 0, 0, 0.04)',
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const isActive = status === 'connected';
  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '6px', 
      background: isActive ? '#ECFDF5' : '#FEF2F2', 
      padding: '6px 12px', borderRadius: '12px',
      border: `1px solid ${isActive ? '#10B98130' : '#EF444430'}`,
      transition: '0.3s'
    }}>
      <motion.div 
        animate={{ opacity: [1, 0.5, 1] }} 
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#10B981' : '#EF4444' }} 
      />
      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: isActive ? '#059669' : '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
        System {isActive ? 'Active' : 'Offline'}
      </span>
    </div>
  );
};

/**
 * HealthOverview: Circular progress and system status dots
 */
const HealthOverview = ({ score, systemHealth }) => {
  const isOffline = score === null;
  const healthColor = getHealthColor(score);

  const systems = [
    { label: 'Soil', score: systemHealth.soil, color: '#10B981' },
    { label: 'Irrigation', score: systemHealth.water, color: '#0EA5E9' },
    { label: 'Weather', score: systemHealth.weather, color: '#14B8A6' },
    { label: 'Storage', score: systemHealth.storage, color: '#8B5CF6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: COLORS.cardBg, borderRadius: '28px', padding: '1.5rem',
        border: `1px solid ${COLORS.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
        marginBottom: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '85px', height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="85" height="85" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="10" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none"
              stroke={healthColor}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray="264"
              initial={{ strokeDashoffset: 264 }}
              animate={{ strokeDashoffset: 264 - (264 * (score || 0) / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: COLORS.textMain, whiteSpace: 'nowrap' }}>{isOffline ? '-- %' : `${score} %`}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase' }}>Health</div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {systems.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '6px', height: '6px', borderRadius: '50%', 
                  background: s.score !== null ? s.color : '#94A3B8' 
                }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.textMuted }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color={healthColor} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.textMain }}>
              {isOffline ? 'Calibrating Telemetry...' : (score < 40 ? 'Critical Attention' : score < 80 ? 'Action Recommended' : 'All Systems Optimal')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * SensorCard: Navigational card for major monitoring nodes
 */
const SensorCard = ({ title, value, icon: Icon, color, status, score, onClick, nodeType }) => {
  const isConnected = status === 'CONNECTED';
  const hColor = getHealthColor(score);

  // Fail-safe color mapping to ensure they are NEVER all the same green
  const themeColor = isConnected ? {
    soil: '#10B981',      // Emerald Green
    irrigation: '#0EA5E9', // Sky Blue
    weather: '#14B8A6',    // Teal
    storage: '#8B5CF6',    // Purple
  }[nodeType] || color : '#CBD5E1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }} onClick={onClick}
      style={{
        background: COLORS.cardBg, borderRadius: '28px', padding: '1.25rem',
        border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ 
          width: '46px', height: '46px', borderRadius: '14px', 
          background: isConnected ? `${themeColor}15` : '#F1F5F9', 
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <Icon size={22} color={themeColor} strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '0.65rem', color: COLORS.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{title}</div>
        <div style={{ 
          fontSize: '1.65rem', fontWeight: 950, 
          color: value === '---' ? '#CBD5E1' : hColor, 
          letterSpacing: '-0.02em', whiteSpace: 'nowrap',
          lineHeight: 1
        }}>
          {value}
        </div>
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
import { RefreshCw } from 'lucide-react';

const Dashboard = () => {
  // ─── HOOKS & CONTEXT ──────────────────────────────────────────────────────
  const navigate = useNavigate();
  const {
    sensorData, farmHealthScore, systemHealth,
    toggleActuator, actuators, ACTUATORS,
    user, farmInfo, mqttStatus, syncData
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  // ─── EFFECTS ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── HANDLERS ─────────────────────────────────────────────────────────────
  const handleSync = () => {
    setIsSyncing(true);
    syncData();
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const isPumpActive = actuators ? actuators[ACTUATORS?.PUMP] : false;

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good Morning,';
    if (h < 17) return 'Good Afternoon,';
    if (h < 21) return 'Good Evening,';
    return 'Good Night,';
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1.25rem', paddingBottom: '10px', background: COLORS.background, fontFamily: "'Outfit', sans-serif" }}>

      {/* Header Section */}
      <section style={{ marginBottom: '1.8rem', padding: '0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.textMuted, margin: 0 }}>
              {getGreeting()}
            </h1>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: COLORS.textMain, margin: '1px 0 0 0', letterSpacing: '-0.02em' }}>
              {user?.name || 'Guest Farmer'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSync}
              style={{ 
                cursor: 'pointer', padding: '10px 18px', borderRadius: '18px', 
                background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              <motion.div animate={{ rotate: isSyncing ? 360 : 0 }} transition={{ duration: 1, repeat: isSyncing ? Infinity : 0, ease: "linear" }}>
                <RefreshCw size={18} color={isSyncing ? COLORS.primary : COLORS.textMuted} />
              </motion.div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.textMuted, letterSpacing: '0.05em' }}>SYNC</span>
            </motion.button>
          </div>
        </div>

        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: COLORS.textMuted, fontSize: '0.85rem', fontWeight: 600 }}>
          <MapPin size={15} color={COLORS.primary} />
          <span>{user?.location || 'Set farm location'}</span>
        </div>
      </section>

      {/* System Health Overview */}
      <HealthOverview score={farmHealthScore} systemHealth={systemHealth} />

      {/* Core Monitoring Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.1rem', marginBottom: '1.8rem' }}>
        <SensorCard
          title="Soil Health" nodeType="soil"
          value={systemHealth.soil !== null ? `${systemHealth.soil} %` : '---'}
          icon={Sprout} color="#10B981"
          status={sensorData?.soil?.moisture !== null ? "CONNECTED" : "OFFLINE"}
          score={systemHealth.soil}
          onClick={() => navigate('/soil-monitoring')}
        />
        <SensorCard
          title="Irrigation Health" nodeType="irrigation"
          value={systemHealth.water !== null ? `${systemHealth.water} %` : '---'}
          icon={Droplets} color="#0EA5E9"
          status={sensorData?.water?.pumpActive !== undefined || sensorData?.water?.level !== null ? "CONNECTED" : "OFFLINE"}
          score={systemHealth.water}
          onClick={() => navigate('/irrigation')}
        />
        <SensorCard
          title="Weather Health" nodeType="weather"
          value={systemHealth.weather !== null ? `${systemHealth.weather} %` : '---'}
          icon={CloudRain} color="#14B8A6"
          status={sensorData?.weather?.temp !== null ? "CONNECTED" : "OFFLINE"}
          score={systemHealth.weather}
          onClick={() => navigate('/weather')}
        />
        <SensorCard
          title="Storage Health" nodeType="storage"
          value={systemHealth.storage !== null ? `${systemHealth.storage} %` : '---'}
          icon={Archive} color="#8B5CF6"
          status={sensorData?.storage?.temp !== null ? "CONNECTED" : "OFFLINE"}
          score={systemHealth.storage}
          onClick={() => navigate('/storage-hub')}
        />
      </div>

      {/* System Controls */}
      <section style={{ background: COLORS.cardBg, borderRadius: '28px', padding: '1.5rem', border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: COLORS.textMain, margin: 0 }}>Active Controls</h3>
          <Activity size={18} color={isPumpActive ? COLORS.primary : COLORS.textMuted} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: isPumpActive ? '#ECFDF5' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Power size={20} color={isPumpActive ? COLORS.primary : COLORS.textMuted} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.textMain }}>Irrigation Pump</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: isPumpActive ? COLORS.primary : COLORS.textMuted }}>{isPumpActive ? 'System Active' : 'Standby Mode'}</div>
            </div>
          </div>
          <div
            onClick={() => toggleActuator(ACTUATORS.PUMP)}
            style={{ width: '50px', height: '28px', background: isPumpActive ? COLORS.primary : '#E2E8F0', borderRadius: '20px', padding: '3px', cursor: 'pointer', transition: '0.3s' }}
          >
            <motion.div animate={{ x: isPumpActive ? 22 : 0 }} style={{ width: '22px', height: '22px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer style={{ textAlign: 'center', marginTop: '1.5rem', paddingBottom: '5px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          AgriSense Industrial • v{farmInfo?.version || '2.8.0'}
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
