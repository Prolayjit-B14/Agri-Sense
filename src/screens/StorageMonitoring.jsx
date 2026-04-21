import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  Archive, Thermometer, Droplet,
  Activity, AlertTriangle,
  Info, ShieldCheck, BarChart3
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
          {value !== null && value !== undefined ? value : '---'}<span style={{ fontSize: '0.6rem', fontWeight: 700, marginLeft: '1px' }}>{unit}</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
          <Icon size={12} color={value === '---' ? COLORS.subtext : color} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: value === '---' ? COLORS.subtext : color }}>
            {value === '---' ? 'OFFLINE' : 'NORMAL'}
          </span>
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
  const navigate = useNavigate();
  const { sensorData } = useApp();
  const storage = sensorData?.storage || {};

  const stats = useMemo(() => ({
    temp: storage.temp !== null ? Number(storage.temp).toFixed(1) : '---',
    humidity: storage.humidity !== null ? Number(storage.humidity).toFixed(1) : '---',
    gas: storage.mq135 !== null ? Number(storage.mq135).toFixed(0) : '---',
    quality: storage.freshnessScore !== null ? storage.freshnessScore : '---'
  }), [storage]);

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '100px' }}>
      


      {/* 2. SENSOR GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <CircularGauge value={stats.temp} label="Temp" unit="°C" color="#EF4444" icon={Thermometer} />
        <CircularGauge value={stats.humidity} label="Humidity" unit="%" color="#3B82F6" icon={Droplet} />
        <CircularGauge value={stats.gas} label="Gas Level" unit="ppm" color="#F59E0B" icon={Activity} />
        <CircularGauge value={stats.quality} label="Freshness" unit="%" color="#10B981" icon={ShieldCheck} />
      </div>

      {/* 3. SPOILAGE INSIGHT */}
      <SpoilageInsight temp={stats.temp} humidity={stats.humidity} gas={stats.gas} />

      {/* 4. ANALYTICS CTA */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/analytics', { state: { tab: 'Storage' } })}
        style={{ width: '100%', padding: '1.25rem', borderRadius: '24px', background: 'white', border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: '0.9rem', fontWeight: 950, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}
      >
        Storage Lifecycle Analytics <BarChart3 size={18} />
      </motion.button>
    </div>
  );
};

export default StorageMonitoring;
