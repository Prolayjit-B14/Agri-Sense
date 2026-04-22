/**
 * AgriSense v2.8.0 Soil Monitoring
 * In-depth soil analysis, nutrient tracking, and AI-driven hydration insights.
 */

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sprout, Waves, Activity, Zap, 
  Thermometer, BookOpen, ChevronRight 
} from 'lucide-react';

// Context, Hooks & Utils
import { useApp } from '../context/AppContext';
import useTrendEngine from '../hooks/useTrendEngine';
import { getHealthColor } from '../utils/healthEngine';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#10B981', // Emerald Green
  secondary: '#3B82F6',
  warning: '#F59E0B',
  critical: '#EF4444',
  info: '#6366F1',
  offline: '#94A3B8',
  text: '#1E293B',
  subtext: '#64748B',
  border: '#F1F5F9',
  shadow: 'rgba(0, 0, 0, 0.04)'
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const SensorDot = ({ label, status }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: status === 'active' ? '#34D399' : '#EF4444', opacity: status === 'active' ? 1 : 0.5 }} />
    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'white', opacity: 0.8 }}>{label}</span>
  </div>
);

const DiagnosticCard = ({ label, value, unit, icon: Icon, color, statusText, isOffline }) => (
  <div style={{ 
    background: COLORS.card, borderRadius: '24px', padding: '1.25rem',
    border: `1px solid ${COLORS.border}`, boxShadow: `0 4px 15px ${COLORS.shadow}`,
    display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isOffline ? '#F1F5F9' : `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {Icon && <Icon size={18} color={isOffline ? COLORS.offline : color} />}
      </div>
      {!isOffline && (
        <div style={{ 
          padding: '4px 8px', borderRadius: '6px', background: `${color}10`, 
          color: color, fontSize: '0.6rem', fontWeight: 950, textTransform: 'uppercase'
        }}>
          {`${value}${unit}`}
        </div>
      )}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 850, color: COLORS.subtext, textTransform: 'uppercase' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginTop: '2px' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 950, color: isOffline ? COLORS.offline : COLORS.text }}>{isOffline ? '---' : statusText}</span>
      </div>
    </div>
  </div>
);

const InsightItem = ({ label, value, status, icon: Icon }) => {
  const color = status === 'offline' ? COLORS.offline : (['stable', 'optimal', 'increasing'].includes(status) ? COLORS.primary : (['decreasing', 'rising'].includes(status) ? COLORS.warning : COLORS.critical));
  return (
    <div style={{ padding: '12px 0', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {Icon && <Icon size={16} color={color} />}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 850, color: COLORS.text }}>{label}</p>
        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: COLORS.subtext }}>{value}</p>
      </div>
      <div style={{ 
        padding: '4px 10px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 900, 
        background: `${color}10`, color: color, textTransform: 'uppercase'
      }}>
        {status}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const SoilMonitoring = () => {
  // ─── HOOKS & CONTEXT ──────────────────────────────────────────────────────
  const navigate = useNavigate();
  const { sensorData, systemHealth, lastGlobalUpdate } = useApp();
  const trend = useTrendEngine(); // Fixed: Added trend engine hook

  // ─── DERIVED STATE ────────────────────────────────────────────────────────
  const soil = sensorData?.soil || {};
  const healthScore = systemHealth.soil;
  const isOnline = soil.moisture !== null;

  const stats = useMemo(() => {
    const n = soil.npk || {};
    return {
      moisture: soil.moisture !== null ? Number(soil.moisture).toFixed(1) : null,
      temp: soil.temp !== null ? Number(soil.temp).toFixed(1) : null,
      ph: soil.ph !== null ? Number(soil.ph).toFixed(1) : null,
      n: n.n !== null ? Number(n.n).toFixed(0) : null,
      p: n.p !== null ? Number(n.p).toFixed(0) : null,
      k: n.k !== null ? Number(n.k).toFixed(0) : null,
    };
  }, [soil]);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1.25rem', paddingBottom: '30px', background: COLORS.bg, minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* ─── HERO HEALTH CARD ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{
          background: !isOnline ? 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)' : (healthScore > 75 ? 'linear-gradient(135deg, #065F46 0%, #10B981 100%)' : (healthScore > 50 ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)')),
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
              <span style={{ fontSize: '0.6rem', fontWeight: 950, textTransform: 'uppercase' }}>NODE {isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Health Score</p>
            <h1 style={{ margin: '4px 0', fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{healthScore !== null ? healthScore : '--'} <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>%</span></h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, opacity: 0.6 }}>LAST SYNC</p>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900 }}>{lastGlobalUpdate || '--:--'}</p>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '12px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
           <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>{isOnline ? (healthScore > 75 ? 'Optimal' : (healthScore > 50 ? 'Warning' : 'Critical')) : 'System Offline'}</span>
           <div style={{ display: 'flex', gap: '8px' }}>
              <SensorDot label="MST" status={soil.moisture !== null ? 'active' : 'offline'} />
              <SensorDot label="TMP" status={soil.temp !== null ? 'active' : 'offline'} />
              <SensorDot label="PH" status={soil.ph !== null ? 'active' : 'offline'} />
              <SensorDot label="NPK" status={soil.npk?.n !== null ? 'active' : 'offline'} />
           </div>
        </div>
      </motion.div>

      {/* ─── DIAGNOSTIC GRID ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <DiagnosticCard label="Soil Moisture" value={stats.moisture} unit="%" icon={Waves} color="#3B82F6" isOffline={!isOnline} statusText={stats.moisture > 60 ? 'High' : stats.moisture > 30 ? 'Optimal' : 'Low'} />
        <DiagnosticCard label="Soil pH" value={stats.ph} unit="" icon={Activity} color="#8B5CF6" isOffline={soil.ph === null} statusText={stats.ph > 7.5 ? 'Alkaline' : stats.ph > 6 ? 'Optimal' : 'Acidic'} />
        <DiagnosticCard label="Nitrogen (N)" value={stats.n} unit="mg/kg" icon={Zap} color="#10B981" isOffline={soil.npk?.n === null} statusText={stats.n > 40 ? 'Sufficient' : 'Low'} />
        <DiagnosticCard label="Phosphorus (P)" value={stats.p} unit="mg/kg" icon={Zap} color="#3B82F6" isOffline={soil.npk?.p === null} statusText={stats.p > 30 ? 'High' : 'Optimal'} />
        <DiagnosticCard label="Potassium (K)" value={stats.k} unit="mg/kg" icon={Zap} color="#F59E0B" isOffline={soil.npk?.k === null} statusText={stats.k > 35 ? 'Safe' : 'Low'} />
        <DiagnosticCard label="Root Temp" value={stats.temp} unit="°C" icon={Thermometer} color="#EF4444" isOffline={soil.temp === null} statusText={stats.temp > 35 ? 'High' : 'Optimal'} />
      </div>

      {/* ─── CONDITION SUMMARY ─── */}
      <section style={{ background: COLORS.card, borderRadius: '28px', padding: '1.5rem', border: `1px solid ${COLORS.border}`, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <BookOpen size={18} color={COLORS.primary} />
          <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 950, color: COLORS.text, textTransform: 'uppercase' }}>Condition Summary</h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: COLORS.subtext, lineHeight: 1.6 }}>
          {isOnline ? (
            `Current soil profile shows ${stats.ph} pH and ${stats.moisture}% moisture levels. Nitrogen levels are ${stats.n > 40 ? 'sufficient' : 'low'} for active growth. Automated irrigation is ${stats.moisture < 40 ? 'recommended' : 'not required'}.`
          ) : (
            "Waiting for sensor telemetry to generate diagnostic summary..."
          )}
        </p>
      </section>

      {/* ─── AI INSIGHTS ─── */}
      {isOnline && trend && (
        <section style={{ 
          background: COLORS.card, borderRadius: '32px', padding: '1.5rem',
          border: `1px solid ${COLORS.border}`, boxShadow: `0 10px 40px ${COLORS.shadow}`,
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 950, color: COLORS.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Recommendations</h3>
            <div style={{ background: '#F0FDFA', padding: '4px 10px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 950, color: '#14B8A6' }}>Live Analysis</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <InsightItem label="Hydration" value={trend.moisture?.insight || '--'} status={trend.moisture?.trend || 'offline'} icon={Waves} />
            <InsightItem label="Chemical" value={trend.ph?.insight || '--'} status={trend.ph?.trend || 'offline'} icon={Activity} />
            <InsightItem label="Nutrient" value={trend.npk?.insight || '--'} status={trend.npk?.trend || 'offline'} icon={Zap} />
          </div>
        </section>
      )}

      {/* ─── FOOTER ACTION ─── */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/analytics', { state: { tab: 'Soil' } })}
          style={{ 
            padding: '12px 30px', borderRadius: '20px', background: COLORS.text, 
            border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 950, textTransform: 'uppercase' }}>Detailed Analytics</span>
          <ChevronRight size={16} />
        </motion.button>
      </div>

    </div>
  );
};

export default SoilMonitoring;
