import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  Droplets, Power, Activity, 
  Waves, CheckCircle2, AlertTriangle, 
  Info, ChevronRight
} from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#3B82F6', 
  success: '#10B981',
  warning: '#F59E0B',
  critical: '#EF4444',
  offline: '#94A3B8',
  text: '#1E293B',
  subtext: '#64748B',
  border: '#F1F5F9',
  shadow: 'rgba(0, 0, 0, 0.04)'
};

const TANK_CAPACITY = 6000; // Total Liters

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const TankLevelBar = ({ percentage, color }) => (
  <div style={{ width: '100%', height: '12px', background: '#F1F5F9', borderRadius: '6px', overflow: 'hidden', marginTop: '1rem' }}>
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      style={{ height: '100%', background: color, borderRadius: '6px' }}
    />
  </div>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const IrrigationControl = () => {
  const { sensorData, actuators, ACTUATORS, toggleActuator, lastGlobalUpdate } = useApp();
  const water = sensorData?.water || {};
  const isPumpActive = actuators ? actuators[ACTUATORS?.PUMP] : false;

  const stats = useMemo(() => {
    const level = water.level !== null ? parseFloat(water.level) : null;
    const liters = level !== null ? Math.round((level / 100) * TANK_CAPACITY) : '---';

    let status = 'Sensor Offline';
    let color = COLORS.offline;

    if (level !== null) {
      if (level > 60) { status = 'Tank Active'; color = COLORS.success; }
      else if (level > 30) { status = 'Low Level'; color = COLORS.warning; }
      else { status = 'Critical'; color = COLORS.critical; }
    }

    return { level, liters, status, color };
  }, [water]);

  const pumpStatus = isPumpActive ? 'Pump Running' : (stats.level !== null ? 'Pump Standby' : 'Pump Offline');

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: COLORS.bg }}>
      
      {/* 1. TANK RESERVOIR CARD */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: COLORS.card, borderRadius: '28px', padding: '1.75rem',
          border: `1px solid ${COLORS.border}`, boxShadow: `0 10px 30px ${COLORS.shadow}`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${stats.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={20} color={stats.color} />
            </div>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tank Reservoir</p>
          </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: COLORS.text }}>
              {stats.liters !== '---' ? stats.liters.toLocaleString() : '---'} <span style={{ fontSize: '1rem', color: COLORS.subtext }}>L remaining</span>
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 950, color: stats.color }}>{stats.level !== null ? `${Math.round(stats.level)}%` : '---'}</p>
            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext }}>Full</p>
          </div>
        </div>

        <TankLevelBar percentage={stats.level || 0} color={stats.color} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: stats.color }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 850, color: stats.color }}>{stats.status}</span>
        </div>
      </motion.section>

      {/* 2. MASTER PUMP CONTROL CARD */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ 
          background: COLORS.card, borderRadius: '28px', padding: '1.75rem',
          border: `1px solid ${COLORS.border}`, boxShadow: `0 10px 30px ${COLORS.shadow}`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '14px', 
              background: isPumpActive ? `${COLORS.success}15` : `${COLORS.primary}10`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${isPumpActive ? `${COLORS.success}20` : `${COLORS.primary}15`}`
            }}>
              <Power size={20} color={isPumpActive ? COLORS.success : COLORS.primary} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 950, color: COLORS.text }}>Master Pump</p>
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: isPumpActive ? COLORS.success : COLORS.subtext }}>
                Status: {isPumpActive ? 'Running' : (stats.level !== null ? 'Standby' : 'Offline')}
              </p>
            </div>
          </div>
          
          <div 
            onClick={() => toggleActuator(ACTUATORS.PUMP)}
            style={{ 
              width: '56px', height: '30px', background: isPumpActive ? COLORS.success : '#E2E8F0',
              borderRadius: '20px', padding: '3px', cursor: 'pointer', transition: '0.3s',
              boxShadow: isPumpActive ? `0 0 15px ${COLORS.success}30` : 'none'
            }}
          >
            <motion.div 
              animate={{ x: isPumpActive ? 26 : 0 }}
              style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', borderTop: `1px solid ${COLORS.border}`, paddingTop: '1.5rem' }}>
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '16px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>Pump Power</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', fontWeight: 950, color: isPumpActive ? COLORS.success : COLORS.subtext }}>
              {isPumpActive ? 'Active' : 'Standby'}
            </p>
          </div>
        </div>
      </motion.section>

      {/* 3. SMART STATUS MESSAGE */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ 
          background: `${COLORS.primary}08`, borderRadius: '16px', padding: '12px 16px',
          border: `1px solid ${COLORS.primary}15`, display: 'flex', alignItems: 'center', gap: '10px'
        }}
      >
        <Info size={16} color={COLORS.primary} />
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: COLORS.text }}>
          {parseFloat(stats.level) < 30 ? "Tank level low – refill recommended" : 
           (isPumpActive ? "Pump running normally" : "Water level sufficient for irrigation")}
        </p>
      </motion.div>

    </div>
  );
};

export default IrrigationControl;
