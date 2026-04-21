import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  Droplets, Power, Activity,
  Waves, AlertTriangle,
  CheckCircle2, Info
} from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#3B82F6', // Blue for Water
  secondary: '#10B981',
  warning: '#EF4444',
  text: '#1E293B',
  subtext: '#64748B',
  border: '#F1F5F9'
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const WaterLevelCard = ({ level }) => {
  const l = parseFloat(level) || 0;
  return (
    <div style={{ 
      background: 'white', borderRadius: '32px', padding: '2rem',
      border: `1px solid ${COLORS.border}`, boxShadow: '0 20px 40px -12px rgba(59, 130, 246, 0.1)',
      position: 'relative', overflow: 'hidden', height: '240px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
    }}>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 950, color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tank Reservoir</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '12px' }}>
          <span style={{ fontSize: '4.5rem', fontWeight: 950, color: COLORS.text, lineHeight: 1 }}>{level !== '---' ? parseFloat(level).toFixed(0) : '---'}</span>
          {level !== '---' && <span style={{ fontSize: '2rem', fontWeight: 800, color: COLORS.subtext }}>%</span>}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10 }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: COLORS.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={16} /> Tank Active
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.subtext, marginTop: '4px' }}>Approx. 4,500 L remaining</div>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: `${COLORS.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Waves size={24} color={COLORS.primary} />
        </div>
      </div>

      {/* 🌊 FLUID ANIMATION BACKGROUND (Improved Gradient) */}
      <motion.div 
        animate={{ y: `${100 - l}%` }}
        transition={{ type: 'spring', stiffness: 30, damping: 20 }}
        style={{
          position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #93C5FD 0%, #3B82F6 100%)',
          opacity: 0.2, zIndex: 1
        }}
      >
        <motion.div 
          animate={{ x: [-20, 20, -20] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ width: '150%', height: '30px', background: 'white', opacity: 0.4, filter: 'blur(15px)', marginTop: '-15px' }}
        />
      </motion.div>
    </div>
  );
};

const IrrigationInsight = ({ flow, level }) => {
  const insight = useMemo(() => {
    const f = parseFloat(flow);
    const l = parseFloat(level);
    if (l < 15) return { text: "Critical water level. Automated cycles paused to prevent pump damage.", color: '#EF4444', icon: AlertTriangle };
    if (f > 0 && f < 2) return { text: "Low flow detected. Inspect for pipe blockage or leakage.", color: '#F59E0B', icon: Info };
    if (l > 80) return { text: "Reservoir near capacity. Optimal for full-scale irrigation.", color: '#10B981', icon: CheckCircle2 };
    return { text: "Irrigation parameters stable. System in standby.", color: COLORS.primary, icon: Droplets };
  }, [flow, level]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: `${insight.color}10`, border: `1px dashed ${insight.color}40`,
        borderRadius: '24px', padding: '1.25rem', display: 'flex', gap: '12px', alignItems: 'center',
        marginBottom: '1.5rem'
      }}
    >
      <insight.icon size={20} color={insight.color} />
      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: COLORS.text, lineHeight: 1.4 }}>
        <span style={{ color: insight.color, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', marginBottom: '2px' }}>Water Status</span>
        {insight.text}
      </p>
    </motion.div>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const IrrigationControl = () => {
  const { sensorData, actuators, ACTUATORS, toggleActuator } = useApp();
  const water = sensorData?.water || {};
  const isPumpActive = actuators ? actuators[ACTUATORS?.PUMP] : false;

  const stats = useMemo(() => ({
    level: water.level !== null ? Number(water.level).toFixed(1) : '---',
    flow: water.flowRate !== null ? Number(water.flowRate).toFixed(1) : (isPumpActive ? '---' : '0.0'),
    usage: water.totalUsage !== null ? Number(water.totalUsage).toFixed(0) : '---',
    pressure: '---'
  }), [water, isPumpActive]);

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '100px' }}>
      


      {/* 2. WATER LEVEL HERO */}
      <WaterLevelCard level={stats.level} />

      {/* 3. INTELLIGENT INSIGHT */}
      <IrrigationInsight flow={stats.flow} level={stats.level} />

      {/* 4. CONTROL PANEL */}
      <section style={{ background: 'white', borderRadius: '32px', padding: '1.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '16px', 
              background: isPumpActive ? '#ECFDF5' : '#F8FAFC', 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Power size={22} color={isPumpActive ? '#10B981' : '#64748B'} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: COLORS.text }}>Master Pump</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isPumpActive ? '#10B981' : COLORS.subtext }}>
                {isPumpActive ? `Pumping Water • ${stats.flow} L/min` : 'System Standby'}
              </div>
            </div>
          </div>
          <div 
            onClick={() => toggleActuator(ACTUATORS.PUMP)}
            style={{ 
              width: '64px', height: '34px', background: isPumpActive ? '#10B981' : '#E2E8F0',
              borderRadius: '20px', padding: '4px', cursor: 'pointer', transition: '0.3s'
            }}
          >
            <motion.div 
              animate={{ x: isPumpActive ? 30 : 0 }}
              style={{ width: '26px', height: '26px', background: 'white', borderRadius: '50%', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase', marginBottom: '4px' }}>Flow Rate</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 950, color: COLORS.text }}>{stats.flow} <span style={{ fontSize: '0.75rem', color: COLORS.subtext }}>L/min</span></div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase', marginBottom: '4px' }}>Pressure</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 950, color: COLORS.text }}>{stats.pressure} <span style={{ fontSize: '0.75rem', color: COLORS.subtext }}>Bar</span></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IrrigationControl;
