/**
 * AgriSense v2.8.0 Storage Monitoring
 * Real-time climate tracking and air quality diagnostics for storage facilities.
 */

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Thermometer, Droplet, Wind, ShieldCheck, 
  ChevronRight, Server 
} from 'lucide-react';

// Context & Utils
import { useApp } from '../context/AppContext';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const THEME = {
  safe: { color: '#10B981', bg: '#ECFDF5', light: '#D1FAE5' },
  warning: { color: '#F59E0B', bg: '#FFFBEB', light: '#FEF3C7' },
  danger: { color: '#EF4444', bg: '#FEF2F2', light: '#FEE2E2' },
  offline: { color: '#94A3B8', bg: '#F8FAFC', light: '#F1F5F9' },
  primary: '#8B5CF6', // Royal Purple
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#F1F5F9'
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const SensorDot = ({ label, status }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: status === 'active' ? '#34D399' : '#EF4444', opacity: status === 'active' ? 1 : 0.5 }} />
    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'white', opacity: 0.8 }}>{label}</span>
  </div>
);

const SensorCard = ({ title, value, unit, icon: Icon, color, isOffline, statusText }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
    style={{
      background: THEME.surface, borderRadius: '28px', padding: '1.25rem',
      border: `1px solid ${THEME.border}`, boxShadow: '0 10px 25px -10px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: '12px'
    }}
  >
    <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: `${isOffline ? THEME.offline.color : color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} color={isOffline ? THEME.offline.color : color} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: THEME.textSecondary, textTransform: 'uppercase' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: '1.6rem', fontWeight: 950, color: isOffline ? THEME.offline.color : THEME.text }}>{isOffline ? '--' : value}</span>
        {!isOffline && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: THEME.textSecondary }}> {unit}</span>}
      </div>
    </div>
    {!isOffline && (
      <div style={{ padding: '4px 10px', borderRadius: '8px', background: `${color}10`, width: 'fit-content' }}>
        <span style={{ fontSize: '0.6rem', fontWeight: 900, color, textTransform: 'uppercase' }}>{statusText}</span>
      </div>
    )}
  </motion.div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const StorageMonitoring = () => {
  // ─── HOOKS & CONTEXT ──────────────────────────────────────────────────────
  const navigate = useNavigate();
  const { sensorData, systemHealth, lastGlobalUpdate } = useApp();

  // ─── DERIVED STATE ────────────────────────────────────────────────────────
  const storage = sensorData?.storage || {};
  const storageScore = systemHealth.storage;
  const isOnline = storage.temp !== null;

  const stats = useMemo(() => ({
    temp: storage.temp !== null ? Number(storage.temp).toFixed(1) : '---',
    hum: storage.humidity !== null ? Number(storage.humidity).toFixed(0) : '---',
    gas: storage.mq135 !== null ? Number(storage.mq135).toFixed(0) : '---',
  }), [storage]);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1.25rem', paddingBottom: '20px', background: THEME.background, minHeight: 'auto', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* ─── HERO HEALTH CARD ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{
          background: !isOnline ? 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)' : (storageScore > 75 ? 'linear-gradient(135deg, #5B21B6 0%, #8B5CF6 100%)' : 'linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%)'),
          borderRadius: '32px', padding: '1.75rem', color: 'white',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
          marginBottom: '1.5rem', position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.15)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px', width: 'fit-content' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline ? '#34D399' : '#EF4444' }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 950, textTransform: 'uppercase' }}>NODE {isOnline ? 'ACTIVE' : 'OFFLINE'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Storage Stability</p>
            <h1 style={{ margin: '4px 0', fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{storageScore !== null ? storageScore : '--'} <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>%</span></h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, opacity: 0.6 }}>LAST SYNC</p>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900 }}>{lastGlobalUpdate || '--:--'}</p>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '12px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
           <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>{isOnline ? (storageScore > 70 ? 'Optimal Environment' : 'Risk Detected') : 'Facility Offline'}</span>
           <div style={{ display: 'flex', gap: '8px' }}>
              <SensorDot label="TMP" status={isOnline ? 'active' : 'offline'} />
              <SensorDot label="HUM" status={storage.humidity !== null ? 'active' : 'offline'} />
              <SensorDot label="GAS" status={storage.mq135 !== null ? 'active' : 'offline'} />
           </div>
        </div>
      </motion.div>

      {/* ─── DIAGNOSTIC GRID ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <SensorCard title="Temperature" value={stats.temp} unit="°C" icon={Thermometer} color="#EF4444" isOffline={!isOnline} statusText={stats.temp > 12 ? 'High' : 'Safe'} />
        <SensorCard title="Humidity" value={stats.hum} unit="%" icon={Droplet} color="#3B82F6" isOffline={!isOnline} statusText={stats.hum > 95 ? 'High' : 'Optimal'} />
        <SensorCard title="Gas Level" value={stats.gas} unit="ppm" icon={Wind} color="#F59E0B" isOffline={!isOnline} statusText={stats.gas > 400 ? 'Warning' : 'Normal'} />
        <SensorCard title="Air Quality" value={isOnline ? '98' : '--'} unit="%" icon={ShieldCheck} color="#10B981" isOffline={!isOnline} statusText="Protected" />
      </div>

      {/* ─── SUMMARY CARD ─── */}
      <section style={{ background: THEME.surface, borderRadius: '28px', padding: '1.5rem', border: `1px solid ${THEME.border}`, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Server size={18} color={THEME.primary} />
          <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 950, color: THEME.text, textTransform: 'uppercase' }}>Facility Analysis</h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: THEME.textSecondary, lineHeight: 1.6 }}>
          {isOnline ? (
            `Storage unit at ${stats.temp}°C is currently ${storageScore > 80 ? 'exhibiting optimal' : 'showing variable'} stability for perishable goods. Air exchange system is ${stats.gas < 300 ? 'efficient' : 'working at capacity'}.`
          ) : (
            "Telemetry stream suspended. Please verify gateway connectivity for storage node..."
          )}
        </p>
      </section>

      {/* ─── FOOTER ACTION ─── */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/analytics', { state: { tab: 'Storage' } })}
          style={{ 
            padding: '12px 30px', borderRadius: '20px', background: THEME.text, 
            border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 950, textTransform: 'uppercase' }}>Condition Logs</span>
          <ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  );
};

export default StorageMonitoring;
