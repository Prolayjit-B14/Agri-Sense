/**
 * AgriSense Pro v17.1.0 Dashboard
 * High-level overview of farm health, core metrics, and active controls.
 */

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, Droplets, CloudRain, Archive,
  MapPin, Activity, Power, ChevronRight,
  ShieldCheck, RefreshCw
} from 'lucide-react';

// Context & Utils
import { useApp } from '../../state/AppContext';
import { getHealthColor } from '../../logic/healthEngine';

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
  const isActive = status && status !== 'OFFLINE';
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
  const { devices } = useApp();
  const isOffline = score === null || score === 0;
  const healthColor = getHealthColor(score);

  const activeNodesCount = Object.values(devices || {})
    .filter(d => d?.device_id?.endsWith('_node') && d?.status === 'ACTIVE').length;
  const totalNodesCount = 4; // Soil, Weather, Storage, Irrigation (Fixed Industrial Count)

  const systems = [
    { label: 'Soil', score: systemHealth?.soil, color: '#10B981' },
    { label: 'Irrigation', score: systemHealth?.water, color: '#0EA5E9' },
    { label: 'Weather', score: systemHealth?.weather, color: '#14B8A6' },
    { label: 'Storage', score: systemHealth?.storage, color: '#8B5CF6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white', borderRadius: '32px', padding: '2rem',
        border: `1px solid ${COLORS.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
        marginBottom: '2rem', position: 'relative', overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none"
                stroke={healthColor}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray="283"
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * (score || 0) / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 950, color: COLORS.textMain }}>{isOffline ? '--' : Math.round(score || 0)}<small style={{ fontSize: '0.8rem', opacity: 0.5 }}>%</small></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: healthColor }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Integrity</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: COLORS.textMain, letterSpacing: '-0.02em' }}>
              {isOffline ? 'OFFLINE' : (score >= 80 ? 'OPTIMAL' : score >= 50 ? 'STABLE' : 'CRITICAL')}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: 600, color: COLORS.textMuted }}>
              {activeNodesCount} of {totalNodesCount} nodes broadcasting.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {systems.map((s, i) => (
          <div key={i} style={{ 
            background: '#F8FAFC', padding: '8px 12px', borderRadius: '14px', 
            display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(0,0,0,0.03)' 
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.score !== null ? s.color : '#CBD5E1' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/**
 * SensorCard: Navigational card for major monitoring nodes
 */
const SensorCard = ({ title, value, icon: Icon, color, status, score, onClick, nodeType }) => {
  const isConnected = status === 'CONNECTED' || status === 'ACTIVE' || status === 'PARTIAL';
  const hColor = getHealthColor(score);

  const themeColor = isConnected ? ({
    soil: '#10B981',
    irrigation: '#0EA5E9',
    water: '#0EA5E9',
    weather: '#14B8A6',
    storage: '#8B5CF6',
  }[nodeType] || color) : '#CBD5E1';

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
          background: isConnected ? `${themeColor}25` : '#F1F5F9', 
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
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    sensorData, farmHealthScore, systemHealth,
    toggleActuator, actuators, ACTUATORS,
    user, devices, farmInfo, syncData
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    window.location.reload();
  };

  const isPumpActive = actuators ? actuators[ACTUATORS?.PUMP] : false;

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good Morning,';
    if (h < 17) return 'Good Afternoon,';
    if (h < 21) return 'Good Evening,';
    return 'Good Night,';
  };

  return (
    <div style={{ padding: '1.25rem', paddingBottom: '10px', background: COLORS.background, fontFamily: "'Outfit', sans-serif" }}>

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

      <HealthOverview score={farmHealthScore} systemHealth={systemHealth} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.1rem', marginBottom: '1.8rem' }}>
        <SensorCard
          title="Soil Health" nodeType="soil"
          value={devices?.['soil_node']?.status !== 'OFFLINE' && systemHealth?.soil !== null ? `${Math.round(systemHealth?.soil || 0)} %` : '---'}
          icon={Sprout} color="#10B981"
          status={devices?.['soil_node']?.status}
          score={devices?.['soil_node']?.status !== 'OFFLINE' ? systemHealth?.soil : null}
          onClick={() => navigate('/soil-monitoring')}
        />
        <SensorCard
          title="Irrigation Health" nodeType="irrigation"
          value={devices?.['water_node']?.status !== 'OFFLINE' && systemHealth?.water !== null ? `${Math.round(systemHealth?.water || 0)} %` : '---'}
          icon={Droplets} color="#0EA5E9"
          status={devices?.['water_node']?.status}
          score={devices?.['water_node']?.status !== 'OFFLINE' ? systemHealth?.water : null}
          onClick={() => navigate('/irrigation')}
        />
        <SensorCard
          title="Weather Health" nodeType="weather"
          value={devices?.['weather_node']?.status !== 'OFFLINE' && systemHealth?.weather !== null ? `${Math.round(systemHealth?.weather || 0)} %` : '---'}
          icon={CloudRain} color="#14B8A6"
          status={devices?.['weather_node']?.status}
          score={devices?.['weather_node']?.status !== 'OFFLINE' ? systemHealth?.weather : null}
          onClick={() => navigate('/weather')}
        />
        <SensorCard
          title="Storage Health" nodeType="storage"
          value={devices?.['storage_node']?.status !== 'OFFLINE' && systemHealth?.storage !== null ? `${Math.round(systemHealth?.storage || 0)} %` : '---'}
          icon={Archive} color="#8B5CF6"
          status={devices?.['storage_node']?.status}
          score={devices?.['storage_node']?.status !== 'OFFLINE' ? systemHealth?.storage : null}
          onClick={() => navigate('/storage-hub')}
        />
      </div>

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
            onClick={() => toggleActuator(ACTUATORS?.PUMP)}
            style={{ width: '50px', height: '28px', background: isPumpActive ? COLORS.primary : '#E2E8F0', borderRadius: '20px', padding: '3px', cursor: 'pointer', transition: '0.3s' }}
          >
            <motion.div animate={{ x: isPumpActive ? 22 : 0 }} style={{ width: '22px', height: '22px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
          </div>
        </div>
      </section>

      <footer style={{ textAlign: 'center', marginTop: '1.5rem', paddingBottom: '5px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          AgriSense Pro • v{farmInfo?.version || '2.8.0'}
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
