import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  Sun, Zap, Battery, Activity, 
  ArrowUpRight, ArrowDownRight, Minus, 
  Sparkles, History, MapPin, Gauge
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#F59E0B', // Amber for Solar
  secondary: '#10B981',
  warning: '#EF4444',
  text: '#1E293B',
  subtext: '#64748B',
  border: '#F1F5F9'
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const SolarMetric = ({ label, value, unit, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      background: 'white', borderRadius: '24px', padding: '1.25rem',
      border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', gap: '10px'
    }}
  >
    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} color={color} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginTop: '2px' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 950, color: COLORS.text }}>{value || '--'}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.subtext }}>{unit}</span>
      </div>
    </div>
  </motion.div>
);

const SolarOptimizationBanner = ({ power, voltage }) => {
  const optimization = useMemo(() => {
    const p = parseFloat(power);
    const v = parseFloat(voltage);
    if (isNaN(p) || p === 0) return { text: "No power generation. System in standby mode.", color: COLORS.subtext, icon: Activity };
    if (v < 11.5) return { text: "Low voltage detected. Check panel connections or shading.", color: '#EF4444', icon: Battery };
    if (p > 50) return { text: "Peak efficiency reached. Ideal for high-drain operations.", color: '#10B981', icon: Sparkles };
    return { text: "System functioning within normal parameters.", color: '#F59E0B', icon: Zap };
  }, [power, voltage]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: `${optimization.color}10`, border: `1px dashed ${optimization.color}40`,
        borderRadius: '24px', padding: '1.25rem', display: 'flex', gap: '12px', alignItems: 'center',
        marginBottom: '1.5rem'
      }}
    >
      <optimization.icon size={20} color={optimization.color} />
      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: COLORS.text, lineHeight: 1.4 }}>
        <span style={{ color: optimization.color, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', marginBottom: '2px' }}>Solar Optimizer</span>
        {optimization.text}
      </p>
    </motion.div>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const SolarMonitoring = () => {
  const { sensorData, sensorHistory, lastGlobalUpdate } = useApp();
  const solar = sensorData?.solar || {};

  const stats = useMemo(() => ({
    power: solar.power ? Number(solar.power).toFixed(1) : null,
    voltage: solar.voltage ? Number(solar.voltage).toFixed(1) : null,
    current: solar.current ? Number(solar.current).toFixed(1) : (solar.power / solar.voltage || 0).toFixed(1),
    efficiency: solar.power > 0 ? Math.min(100, (solar.power / 1.5).toFixed(0)) : 0, // Mock efficiency
  }), [solar]);

  const historyData = useMemo(() => {
    return (sensorHistory || []).slice(-20).map(h => ({
      time: h.time,
      power: h.solar?.power || 0,
    }));
  }, [sensorHistory]);

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '100px' }}>
      
      {/* 1. HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Solar Hub</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: COLORS.subtext, fontSize: '0.65rem', fontWeight: 700 }}>
            <History size={10} /> Last Sync: {lastGlobalUpdate || 'Just now'}
          </div>
        </div>
        <div style={{ padding: '6px 12px', borderRadius: '10px', background: stats.power > 0 ? '#FEF3C7' : '#F1F5F9', color: stats.power > 0 ? '#D97706' : '#94A3B8', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: stats.power > 0 ? '#F59E0B' : '#94A3B8' }} />
          {stats.power > 0 ? 'GENERATING' : 'IDLE'}
        </div>
      </div>

      {/* 2. POWER GAUGE HERO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          borderRadius: '32px', padding: '2rem', color: 'white',
          boxShadow: '0 20px 40px -12px rgba(245, 158, 11, 0.3)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', opacity: 0.2 }}>
          <Zap size={140} color="white" />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, opacity: 0.9, textTransform: 'uppercase' }}>Live Generation</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '8px 0' }}>
                <span style={{ fontSize: '4.5rem', fontWeight: 950, lineHeight: 1 }}>{stats.power || '0.0'}</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, opacity: 0.8 }}>W</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.8 }}>EFFICIENCY</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 950 }}>{stats.efficiency}%</div>
            </div>
          </div>
          
          <div style={{ height: '60px', marginTop: '1rem', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="white" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="white" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="power" stroke="white" strokeWidth={2} fill="url(#colorPower)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* 3. OPTIMIZATION BANNER */}
      <SolarOptimizationBanner power={stats.power} voltage={stats.voltage} />

      {/* 4. METRICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <SolarMetric label="Panel Voltage" value={stats.voltage} unit="V" icon={Battery} color="#3B82F6" delay={0.05} />
        <SolarMetric label="Load Current" value={stats.current} unit="A" icon={Zap} color="#10B981" delay={0.1} />
        <SolarMetric label="Daily Yield" value={(stats.power * 5.2 / 100).toFixed(2)} unit="kWh" icon={Activity} color="#8B5CF6" delay={0.15} />
        <SolarMetric label="System Health" value="98" unit="%" icon={Gauge} color="#F59E0B" delay={0.2} />
      </div>

      {/* 5. DIAGNOSTICS */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: COLORS.text, marginBottom: '1.25rem', textTransform: 'uppercase' }}>System Diagnostics</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { l: 'MPPT Tracking', v: 'Optimized', c: '#10B981' },
            { l: 'Temperature', v: 'Normal (32°C)', c: '#10B981' },
            { l: 'Load State', v: 'Connected', c: '#10B981' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.subtext }}>{item.l}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: item.c }}>{item.v}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SolarMonitoring;
