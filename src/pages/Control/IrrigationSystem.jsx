/**
 * AgriSense Pro v18.0.0 "Ultra-Premium" Irrigation Control
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Droplets, Power, Waves, ChevronRight, Gauge
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { useTelemetry } from '../../state/TelemetryContext';

// ─── ANIMATION CONFIGS ──────────────────────────────────────────────────────
const springConfig = { type: 'spring', stiffness: 300, damping: 30 };
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};
const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springConfig }
};

const TANK_CAPACITY = 6000;

// ─── DIAGNOSTIC CARD ────────────────────────────────────────────────────────

const DiagnosticCard = ({ label, value, min, max, icon: Icon, color, range, unit }) => {
  const isOffline = value === null || value === undefined;
  const systemColor = isOffline ? '#94A3B8' : color;

  const numVal = parseFloat(value);
  const health = isOffline ? 'offline'
    : (numVal >= min && numVal <= max) ? 'optimal'
    : (numVal >= min - (max - min) * 0.15 && numVal <= max + (max - min) * 0.15) ? 'warning'
    : 'critical';

  const statusMap = {
    optimal:  { dot: '#22C55E' },
    warning:  { dot: '#F59E0B' },
    critical: { dot: '#EF4444' },
    offline:  { dot: '#CBD5E1' }
  };

  const { dot: dotColor } = statusMap[health];

  return (
    <motion.div
      variants={itemFadeUp}
      whileTap={{ scale: 0.97 }}
      style={{
        borderRadius: 'var(--radius-xl)',
        border: '1px solid ' + (isOffline ? '#E2E8F0' : systemColor + '30'),
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: '170px'
      }}
    >
      <div style={{
        background: isOffline ? '#F1F5F9' : systemColor + '15',
        padding: '0.9rem 1rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '12px'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
          background: isOffline ? 'rgba(0,0,0,0.06)' : systemColor + '25',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'none',
          border: isOffline ? 'none' : '1px solid ' + systemColor + '35'
        }}>
          <Icon size={21} color={isOffline ? '#94A3B8' : systemColor} strokeWidth={2.5} />
        </div>
        <span style={{
          fontSize: '0.8rem', fontWeight: 900,
          color: isOffline ? '#94A3B8' : systemColor,
          letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.2
        }}>
          {label}
        </span>
      </div>

      <div style={{
        background: '#FFFFFF',
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0.5rem 1rem 0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{
            fontSize: '2.8rem', fontWeight: 950,
            color: isOffline ? '#CBD5E1' : 'var(--text-main)',
            letterSpacing: '-0.06em', lineHeight: 1, textAlign: 'center'
          }}>
            {isOffline ? '--' : value}
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8' }}>{unit}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const IrrigationSystem = () => {
  const navigate = useNavigate();
  const { actuators, ACTUATORS, toggleActuator } = useApp();
  const { sensorData, systemHealth } = useTelemetry();

  const water = sensorData?.water || {};
  const isPumpActive = actuators ? actuators[ACTUATORS?.PUMP] : false;
  const healthScore = systemHealth.water;
  
  const stats = useMemo(() => {
    const safeNum = (val) => (val !== null && val !== undefined && !isNaN(parseFloat(val))) ? parseFloat(val) : null;
    const level = safeNum(water.level);
    const liters = level !== null ? Math.round((level / 100) * TANK_CAPACITY) : null;
    return { level, liters };
  }, [water]);

  const isOnline = stats.level !== null;

  const heroConfig = useMemo(() => {
    const mainColor = '#06D6A0';
    if (!isOnline) return { label: 'Node Offline', status: 'Standby', color: '#64748B', bg: '#F8FAFC' };
    if (healthScore >= 75) return { label: 'Optimal Reserve', status: 'Stable', color: mainColor, bg: mainColor + '08' };
    if (healthScore >= 35) return { label: 'Low Reserve', status: 'Caution', color: mainColor, bg: mainColor + '08' };
    return { label: 'Critical Level', status: 'Alert', color: mainColor, bg: mainColor + '08' };
  }, [isOnline, healthScore]);

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{ padding: '1.25rem', paddingBottom: '140px' }}
    >
      {/* Industrial Hero Card */}
      <motion.div
        variants={itemFadeUp}
        style={{
          background: heroConfig.bg,
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: '0 10px 30px -10px ' + heroConfig.color + '30',
          marginBottom: '1.5rem',
          border: '1px solid ' + heroConfig.color + '25',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: heroConfig.color + '10', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '13px',
              background: '#FFFFFF', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid ' + heroConfig.color + '15'
            }}>
              <Waves size={24} color={heroConfig.color} strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Irrigation Health Index
              </h2>
            </div>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: '100px',
            background: '#FFFFFF', color: heroConfig.color,
            fontSize: '0.65rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '8px',
            border: `1px solid ${heroConfig.color}30`
          }}>
            {heroConfig.status}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', minWidth: '140px' }}>
            <span style={{ fontSize: '5rem', fontWeight: 950, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.06em', lineHeight: 0.9 }}>
              {(!isOnline || healthScore === null) ? '--' : Math.round(healthScore)}
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-muted)', opacity: 0.6 }}>%</span>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem',
            padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.5)',
            borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.8)',
            maxWidth: '200px'
          }}>
            <div>
              <div style={{ fontSize: '0.55rem', fontWeight: 950, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Sensors
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {isOnline ? '2 / 2' : '0 / 2'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.55rem', fontWeight: 950, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Sync
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-main)' }}>
                Live
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Industrial Pump Commander */}
      <motion.section 
        variants={itemFadeUp}
        style={{ 
          background: (isPumpActive && isOnline) ? '#0F172A' : '#FFFFFF', 
          borderRadius: '24px', padding: '1.5rem', 
          border: '1px solid rgba(0,0,0,0.05)', 
          marginBottom: '1.5rem', 
          boxShadow: 'var(--shadow-md)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '14px', 
            background: (isPumpActive && isOnline) ? 'rgba(16, 185, 129, 0.1)' : '#F1F5F9', 
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Power size={22} color={(isPumpActive && isOnline) ? '#10B981' : '#64748B'} strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: (isPumpActive && isOnline) ? 'white' : 'var(--text-main)' }}>Master Pump Control</p>
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: (isPumpActive && isOnline) ? '#10B981' : 'var(--text-muted)', textTransform: 'uppercase' }}>
              {isPumpActive ? 'Flow Active' : 'System Ready'}
            </p>
          </div>
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => isOnline && toggleActuator(ACTUATORS.PUMP)} 
          style={{ 
            padding: '10px 20px', 
            background: (isPumpActive && isOnline) ? '#10B981' : '#0F172A', 
            borderRadius: '12px', border: 'none',
            color: 'white',
            fontSize: '0.75rem', fontWeight: 950, cursor: isOnline ? 'pointer' : 'default'
          }}
        >
          {isPumpActive ? 'SHUTDOWN' : 'START PUMP'}
        </motion.button>
      </motion.section>

      {/* Diagnostic Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <DiagnosticCard label="Reservoir Level" value={stats.level} unit="%" min={30} max={100} icon={Waves} color="#00C2FF" />
        <DiagnosticCard label="Hydraulic Flow" value={isOnline ? (water.flow || 0).toFixed(1) : null} unit="L/min" min={isPumpActive ? 0.1 : 0} max={50} icon={Gauge} color="#06D6A0" />
      </div>

    </motion.div>
  );
};

export default IrrigationSystem;
