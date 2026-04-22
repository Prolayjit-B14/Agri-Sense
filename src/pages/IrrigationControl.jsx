/**
 * AgriSense v2.8.0 Irrigation Control
 * Management of water reserves, pump automation, and flow rate diagnostics.
 */

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Droplets, Power, Activity, 
  Waves, ChevronRight 
} from 'lucide-react';

// Context & Utils
import { useApp } from '../context/AppContext';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#0EA5E9', // Ocean Blue
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

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const SensorDot = ({ label, status }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: status === 'active' ? '#34D399' : '#94A3B8', opacity: status === 'active' ? 1 : 1 }} />
    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'white', opacity: 0.8 }}>{label}</span>
  </div>
);

const TankLevelBar = ({ percentage, color }) => (
  <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '5px', overflow: 'hidden', marginTop: '1rem' }}>
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      style={{ height: '100%', background: color, borderRadius: '5px' }}
    />
  </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const IrrigationControl = () => {
  // ─── HOOKS & CONTEXT ──────────────────────────────────────────────────────
  const navigate = useNavigate();
  const { 
    sensorData, actuators, ACTUATORS, 
    toggleActuator, systemHealth, lastGlobalUpdate 
  } = useApp();

  // ─── DERIVED STATE ────────────────────────────────────────────────────────
  const water = sensorData?.water || {};
  const isPumpActive = actuators ? actuators[ACTUATORS?.PUMP] : false;
  const healthScore = systemHealth.water;

  const stats = useMemo(() => {
    const level = water.level !== null ? parseFloat(water.level) : null;
    const liters = level !== null ? Math.round((level / 100) * TANK_CAPACITY) : null;
    return { level, liters };
  }, [water]);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1.25rem', paddingBottom: '20px', background: COLORS.bg, minHeight: 'auto', fontFamily: "'Outfit', sans-serif" }}>
      
       {/* ─── HERO TANK CARD ─── */}
       <motion.div
         initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
         style={{
           background: stats.level === null ? 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)' : (stats.level > 30 ? 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)' : 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'),
           borderRadius: '32px', padding: '1.75rem', color: 'white',
           boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
           marginBottom: '1.5rem', position: 'relative', overflow: 'hidden'
         }}
       >
         <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
         
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
           <div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.15)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px', width: 'fit-content' }}>
               <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: stats.level !== null ? '#34D399' : '#94A3B8' }} />
               <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase' }}>TANK {stats.level !== null ? 'ONLINE' : 'OFFLINE'}</span>
             </div>
             <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Water Reserve</p>
             <h1 style={{ margin: '4px 0', fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{healthScore !== null ? healthScore : '--'} <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>%</span></h1>
           </div>
           <div style={{ textAlign: 'right' }}>
             <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, opacity: 0.6 }}>VOLUME</p>
             <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900 }}>{stats.liters !== null ? `${stats.liters} L` : '-- L'}</p>
           </div>
         </div>
         
         <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '12px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
           <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>{stats.level > 30 ? 'Adequate Supply' : 'Low Reserve'}</span>
           <div style={{ display: 'flex', gap: '8px' }}>
              <SensorDot label="LVL" status={stats.level !== null ? 'active' : 'offline'} />
           </div>
         </div>

         <TankLevelBar percentage={stats.level || 0} color="rgba(255,255,255,0.3)" />
       </motion.div>

      {/* ─── PUMP CONTROL CARD ─── */}
      <section style={{ background: COLORS.card, borderRadius: '28px', padding: '1.5rem', border: `1px solid ${COLORS.border}`, marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '12px', 
              background: isPumpActive ? `${COLORS.success}10` : `${COLORS.primary}10`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Power size={20} color={isPumpActive ? COLORS.success : COLORS.primary} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 950, color: COLORS.text }}>Master Pump Control</p>
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: isPumpActive ? COLORS.success : COLORS.subtext }}>
                {isPumpActive ? 'Currently Active' : 'Standby Mode'}
              </p>
            </div>
          </div>
          
          <div 
            onClick={() => toggleActuator(ACTUATORS.PUMP)}
            style={{ 
              width: '54px', height: '28px', background: isPumpActive ? COLORS.success : '#E2E8F0',
              borderRadius: '20px', padding: '2px', cursor: 'pointer', transition: '0.3s'
            }}
          >
            <motion.div 
              animate={{ x: isPumpActive ? 26 : 0 }}
              style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            />
          </div>
        </div>
      </section>

      {/* ─── SYSTEM INSIGHTS ─── */}
      <div style={{ background: COLORS.card, borderRadius: '28px', padding: '1.5rem', border: `1px solid ${COLORS.border}`, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Activity size={18} color={COLORS.primary} />
          <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 950, color: COLORS.text, textTransform: 'uppercase' }}>System Health</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.subtext }}>Pump Efficiency</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 950, color: COLORS.success }}>98% (Optimal)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.subtext }}>Flow Rate</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 950, color: COLORS.primary }}>2.4 L/min</span>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ACTION ─── */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/analytics', { state: { tab: 'Irrigation' } })}
          style={{ 
            padding: '12px 30px', borderRadius: '20px', background: COLORS.text, 
            border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 950, textTransform: 'uppercase' }}>Water Usage Logs</span>
          <ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  );
};

export default IrrigationControl;
