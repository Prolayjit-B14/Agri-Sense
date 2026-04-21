import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  Archive, Thermometer, Droplet, Wind, 
  Activity, AlertTriangle, Sparkles, 
  History, Info, ShieldCheck, Gauge
} from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#8B5CF6', // Purple for Storage
  secondary: '#10B981',
  warning: '#EF4444',
  text: '#1E293B',
  subtext: '#64748B',
  border: '#F1F5F9'
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const CircularGauge = ({ value, label, unit, color, icon: Icon }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div style={{ 
      background: 'white', borderRadius: '24px', padding: '1.25rem',
      border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
    }}>
      <div style={{ position: 'relative', width: '90px', height: '90px' }}>
        <svg style={{ transform: 'rotate(-90deg)', width: '90px', height: '90px' }}>
          <circle cx="45" cy="45" r={radius} fill="transparent" stroke="#F1F5F9" strokeWidth="8" />
          <motion.circle 
            cx="45" cy="45" r={radius} fill="transparent" stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ 
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', 
          justifyContent: 'center', color: COLORS.text, fontWeight: 950, fontSize: '1.1rem' 
        }}>
          {value || '--'}<span style={{ fontSize: '0.6rem', fontWeight: 700, marginLeft: '1px' }}>{unit}</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
          <Icon size={12} color={color} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color }}>NORMAL</span>
        </div>
      </div>
    </div>
  );
};

const SpoilageInsight = ({ temp, humidity, gas }) => {
  const insight = useMemo(() => {
    const t = parseFloat(temp);
    const h = parseFloat(humidity);
    const g = parseFloat(gas);
    if (g > 500) return { text: "High CO2/Gas detected. Potential fermentation or spoilage. Increase ventilation immediately.", color: '#EF4444', icon: AlertTriangle };
    if (t > 25 && h > 70) return { text: "Fungal growth risk. Conditions optimal for mold development. Decrease humidity.", color: '#F59E0B', icon: Info };
    if (t < 20 && h < 60) return { text: "Optimal preservation state. Storage life maximized.", color: '#10B981', icon: ShieldCheck };
    return { text: "Storage parameters within safe operational limits.", color: COLORS.primary, icon: Archive };
  }, [temp, humidity, gas]);

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
      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: COLORS.text, lineHeight: 1.4 }}>
        <span style={{ color: insight.color, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', marginBottom: '2px' }}>Spoilage Risk Guardian</span>
        {insight.text}
      </p>
    </motion.div>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const StorageMonitoring = () => {
  const { sensorData, lastGlobalUpdate } = useApp();
  const storage = sensorData?.storage || {};

  const stats = useMemo(() => ({
    temp: storage.temp ? Number(storage.temp).toFixed(1) : '18.4',
    humidity: storage.humidity ? Number(storage.humidity).toFixed(1) : '55.2',
    gas: storage.mq135 ? Number(storage.mq135).toFixed(0) : '124',
    quality: 98
  }), [storage]);

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '100px' }}>
      
      {/* 1. HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Storage Hub</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: COLORS.subtext, fontSize: '0.65rem', fontWeight: 700 }}>
            <History size={10} /> Last Sync: {lastGlobalUpdate || 'Just now'}
          </div>
        </div>
        <div style={{ padding: '6px 12px', borderRadius: '10px', background: '#F3E8FF', color: COLORS.primary, fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS.primary }} />
          PROTECTED
        </div>
      </div>

      {/* 2. PRIMARY GAUGES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <CircularGauge value={stats.temp} label="Temperature" unit="°C" color="#EF4444" icon={Thermometer} />
        <CircularGauge value={stats.humidity} label="Humidity" unit="%" color="#3B82F6" icon={Droplet} />
      </div>

      {/* 3. SPOILAGE INSIGHT */}
      <SpoilageInsight temp={stats.temp} humidity={stats.humidity} gas={stats.gas} />

      {/* 4. GAS ANALYSIS HERO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
          borderRadius: '32px', padding: '1.75rem', color: 'white',
          boxShadow: '0 20px 40px -12px rgba(139, 92, 246, 0.3)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.15 }}>
          <Gauge size={140} color="white" />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, opacity: 0.9, textTransform: 'uppercase' }}>Air Composition (VOC/CO2)</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '8px 0' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 950, lineHeight: 1 }}>{stats.gas}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, opacity: 0.8 }}>ppm</span>
          </div>
          <div style={{ marginTop: '1rem', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${Math.min(100, (stats.gas / 1000) * 100)}%` }}
              style={{ height: '100%', background: 'white' }}
            />
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>Safe threshold: &lt; 800 ppm</p>
        </div>
      </motion.div>

      {/* 5. VENTILATION CONTROLS */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 950, color: COLORS.text, marginBottom: '1.25rem', textTransform: 'uppercase' }}>Environmental Control</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wind size={20} color={COLORS.subtext} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: COLORS.text }}>Exhaust Fan</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981' }}>AUTOMATED</div>
            </div>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: '0.7rem', fontWeight: 900, color: COLORS.text }}>OFF</div>
        </div>
      </div>

    </div>
  );
};

export default StorageMonitoring;
