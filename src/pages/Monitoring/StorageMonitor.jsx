/**
 * AgriSense Pro v18.0.0 "Ultra-Premium" Storage Monitoring
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Thermometer, Droplets, Wind, AirVent, 
  ChevronRight, Database, Activity, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTelemetry } from '../../state/TelemetryContext';
import useTrendEngine from '../../hooks/useTrendEngine';

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

// ─── DIAGNOSTIC CARD ────────────────────────────────────────────────────────

const DiagnosticCard = ({ label, value, min, max, icon: Icon, color, range, trendInfo, unit }) => {
  const isOffline = value === null || value === undefined;
  const systemColor = isOffline ? 'var(--text-inactive)' : color;

  // ── Status dot: green / yellow / red ─────────────────────────────────────
  const numVal = parseFloat(value);
  const health = isOffline ? 'offline'
    : (numVal >= min && numVal <= max) ? 'optimal'
    : (numVal >= min - (max - min) * 0.15 && numVal <= max + (max - min) * 0.15) ? 'warning'
    : 'critical';

  const statusMap = {
    optimal:  { dot: 'var(--primary)' },
    warning:  { dot: 'var(--accent)' },
    critical: { dot: 'var(--danger)' },
    offline:  { dot: 'var(--text-inactive)' }
  };

  const { dot: dotColor } = statusMap[health];

  return (
    <motion.div
      variants={itemFadeUp}
      whileTap={{ scale: 0.97 }}
      style={{
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-card)',
        border: '1px solid ' + (isOffline ? 'var(--glass-stroke)' : systemColor + '30'),
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: '170px'
      }}
    >
      {/* ── TOP BAND: solid background ── */}
      <div style={{
        background: isOffline ? 'var(--bg-main)' : systemColor + '15',
        padding: '0.9rem 1rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '12px'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
          background: isOffline ? 'var(--bg-main)' : systemColor + '25',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'none',
          border: isOffline ? 'none' : '1px solid ' + systemColor + '20'
        }}>
          <Icon size={21} color={isOffline ? 'var(--text-inactive)' : systemColor} strokeWidth={2.5} />
        </div>
        <span style={{
          fontSize: '0.8rem', fontWeight: 900,
          color: isOffline ? 'var(--text-inactive)' : systemColor,
          letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.2
        }}>
          {label}
        </span>
      </div>

      {/* ── BODY: PURE WHITE background ── */}
      <div style={{
        background: 'var(--bg-card)',
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0.5rem 1rem 0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{
            fontSize: '3.2rem', fontWeight: 950,
            color: isOffline ? 'var(--text-inactive)' : 'var(--text-main)',
            letterSpacing: '-0.06em', lineHeight: 1, textAlign: 'center'
          }}>
            {isOffline ? '--' : value}
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-inactive)' }}>{unit}</span>
        </div>

        {/* Range + trend */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '5px', marginTop: '0.5rem'
        }}>
          <span style={{
            fontSize: '0.48rem', fontWeight: 950,
            color: isOffline ? 'var(--text-inactive)' : systemColor,
            letterSpacing: '0.08em', opacity: 0.75
          }}>RANGE</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-inactive)' }}>
            {range}
          </span>
          {!isOffline && (
            trendInfo?.trend === 'increasing'
              ? <ArrowUp size={11} color={systemColor} />
              : trendInfo?.trend === 'decreasing'
                ? <ArrowDown size={11} color="var(--danger)" />
                : <Minus size={11} color="var(--text-inactive)" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const StorageMonitoring = () => {
  const navigate = useNavigate();
  const { sensorData, sensorHistory, systemHealth } = useTelemetry();
  const trend = useTrendEngine(sensorHistory);

  const storage = sensorData?.storage || {};
  const storageScore = systemHealth.storage;

  const stats = useMemo(() => {
    const safeNum = (val, dec = 1) => (val !== null && val !== undefined && !isNaN(val)) ? Number(val).toFixed(dec) : null;
    return {
      temp: safeNum(storage.temp),
      hum: safeNum(storage.humidity, 0),
      gas: safeNum(storage.mq135, 0),
      score: safeNum(storageScore, 0)
    };
  }, [storage, storageScore]);

  const isOnline = stats.temp !== null || stats.hum !== null;

  const heroConfig = useMemo(() => {
    const mainColor = '#64748B';
    if (!isOnline) return { label: 'Facility Offline', status: 'Inactive', color: 'var(--text-muted)', bg: 'var(--bg-main)' };
    if (storageScore >= 75) return { label: 'Optimal Storage', status: 'Stable', color: mainColor, bg: 'var(--bg-card)' };
    if (storageScore >= 45) return { label: 'Condition Alert', status: 'Adjust', color: 'var(--accent)', bg: 'var(--bg-card)' };
    return { label: 'Critical Breach', status: 'Urgent', color: 'var(--danger)', bg: 'var(--bg-card)' };
  }, [isOnline, storageScore]);

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
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '1.5rem',
          border: '1px solid ' + (isOnline ? heroConfig.color + '25' : 'var(--border-main)'),
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
              background: 'var(--bg-sheet)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: 'var(--shadow-sm)',
              border: '1px solid ' + heroConfig.color + '20'
            }}>
              <Database size={24} color={heroConfig.color} strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Storage Health Index
              </h2>
            </div>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: '100px',
            background: 'var(--bg-card)', color: heroConfig.color,
            fontSize: '0.7rem', fontWeight: 950,
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid ' + heroConfig.color + '25',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            {heroConfig.status}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', minWidth: '140px' }}>
            <span style={{ fontSize: '5rem', fontWeight: 950, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.06em', lineHeight: 0.9 }}>
              {(!isOnline || storageScore === null) ? '--' : Math.round(storageScore)}
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-muted)', opacity: 0.6 }}>%</span>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem',
            padding: '1rem 1.25rem', background: 'var(--glass)',
            borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)',
            maxWidth: '200px'
          }}>
            <div>
              <div style={{ fontSize: '0.55rem', fontWeight: 950, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Sensors
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {isOnline ? '3 / 3' : '0 / 3'}
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

      {/* Sensor Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <DiagnosticCard label="Temperature" value={stats.temp} min={0}  max={12}  unit="°C"  icon={Thermometer} color="#FF6B35" range="0-12 °C" trendInfo={trend.temperature} />
        <DiagnosticCard label="Humidity"    value={stats.hum}  min={85} max={95} unit="%"   icon={Droplets}    color="#4DA8FF" range="85-95 %" trendInfo={trend.humidity} />
        <DiagnosticCard label="Safety index" value={isOnline ? Math.round(storageScore) : null} min={90} max={100} unit="%" icon={AirVent} color="#06B6D4" range="90-100 %" />
        <DiagnosticCard label="Gas Level"   value={stats.gas}  min={0}  max={300} unit="ppm" icon={Wind}       color="#6B7280" range="0-300 ppm" />
      </div>

      <motion.button 
        variants={itemFadeUp}
        whileTap={{ scale: 0.98 }} 
        onClick={() => navigate('/analytics', { state: { tab: 'storage' } })} 
        className="btn-premium"
        style={{ width: '100%', marginTop: '1rem' }}
      >
        DETAILED ANALYSIS <ChevronRight size={18} />
      </motion.button>
    </motion.div>
  );
};

export default StorageMonitoring;
