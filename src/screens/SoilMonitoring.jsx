import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import useTrendEngine from '../hooks/useTrendEngine';
import {
  Sprout, Droplets, Thermometer, Activity,
  History, TrendingUp, TrendingDown,
  Minus, AlertTriangle, BarChart3, Leaf, Sparkles,
  Wind, Droplet, CheckCircle2, ChevronRight, Info, Waves, Zap, FlaskConical,
  BookOpen
} from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#10B981', 
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

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const HeroMetric = ({ label, value, unit, color }) => (
  <div style={{ textAlign: 'center' }}>
    <p style={{ margin: 0, fontSize: '0.55rem', fontWeight: 900, opacity: 0.7, textTransform: 'uppercase' }}>{label}</p>
    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 950 }}>{value}<span style={{ fontSize: '0.6rem', opacity: 0.8 }}>{unit}</span></p>
  </div>
);

const DiagnosticCard = ({ label, value, unit, icon: Icon, color, trend = [] }) => {
  const isOffline = value === '---';
  return (
    <div style={{ 
      background: COLORS.card, borderRadius: '24px', padding: '1.25rem',
      border: `1px solid ${COLORS.border}`, boxShadow: `0 4px 15px ${COLORS.shadow}`,
      display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon && <Icon size={18} color={color} />}
        </div>
        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '20px' }}>
          {trend.map((t, i) => (
            <div key={i} style={{ width: '2px', height: `${Math.max(t * 2, 2)}px`, background: color, borderRadius: '1px', opacity: 0.2 + (i * 0.1) }} />
          ))}
        </div>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 850, color: COLORS.subtext, textTransform: 'uppercase' }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginTop: '2px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 950, color: isOffline ? COLORS.offline : COLORS.text }}>{value}</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext }}>{unit}</span>
        </div>
      </div>
    </div>
  );
};

const InsightItem = ({ label, value, status, icon: Icon }) => {
  const color = status === 'offline' ? COLORS.offline : (status === 'stable' || status === 'optimal' || status === 'increasing' ? COLORS.primary : (status === 'decreasing' || status === 'rising' ? COLORS.warning : COLORS.critical));
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

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const SoilMonitoring = () => {
  const navigate = useNavigate();
  const { sensorData, sensorHistory, lastGlobalUpdate } = useApp();

  const stats = useMemo(() => {
    const s = sensorData?.soil || {};
    const n = s.npk || {};

    const getTrend = (path, max) => {
      const history = (sensorHistory || []).slice(-10);
      if (history.length < 2) return [2, 2, 2, 2, 2];
      return history.map(p => {
        let val;
        if (path === 'ph') val = p.soil?.ph;
        else if (path === 'temp') val = p.soil?.temp;
        else if (path === 'moisture') val = p.soil?.moisture;
        else val = p.soil?.npk?.[path];
        if (val === null || val === undefined) return 2;
        return Math.min(Math.max((val / max) * 10, 2), 10);
      });
    };

    return {
      moisture: (s.moisture !== null && s.moisture !== undefined) ? `${Number(s.moisture).toFixed(1)}` : '---',
      temp: (s.temp !== null && s.temp !== undefined) ? `${Number(s.temp).toFixed(1)}` : '---',
      ph: (s.ph !== null && s.ph !== undefined) ? Number(s.ph).toFixed(1) : '---',
      n: (n.n !== null && n.n !== undefined) ? Number(n.n).toFixed(0) : '---',
      p: (n.p !== null && n.p !== undefined) ? Number(n.p).toFixed(0) : '---',
      k: (n.k !== null && n.k !== undefined) ? Number(n.k).toFixed(0) : '---',
      isOnline: s.moisture !== null,
      trends: {
        ph: getTrend('ph', 14),
        temp: getTrend('temp', 50),
        moisture: getTrend('moisture', 100),
        n: getTrend('n', 100),
        p: getTrend('p', 100),
        k: getTrend('k', 100)
      }
    };
  }, [sensorData, sensorHistory]);

  const trend = useTrendEngine(sensorHistory);
  const { healthScore, scoreInfo, hasData } = trend;

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '20px', background: COLORS.bg, minHeight: '100vh' }}>
      
      {/* 1. SOIL HERO CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
          borderRadius: '32px', padding: '1.75rem', color: 'white',
          boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.25)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stats.isOnline ? '#34D399' : '#EF4444', boxShadow: stats.isOnline ? '0 0 10px #34D399' : 'none' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.9, letterSpacing: '0.05em' }}>SOIL NODE: {stats.isOnline ? 'ACTIVE' : 'OFFLINE'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, opacity: 0.6 }}>{lastGlobalUpdate || '---'}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '2rem' }}>
             <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.1em' }}>Soil Health Score</p>
             <h1 style={{ margin: 0, fontSize: '4.5rem', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 1 }}>
               {healthScore !== null ? `${healthScore}%` : '---'}
             </h1>
             <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>{scoreInfo.label}</span>
             </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.5rem' }}>
            <HeroMetric label="Mst" value={stats.moisture} unit="%" />
            <HeroMetric label="pH" value={stats.ph} unit="" />
            <HeroMetric label="N" value={stats.n} unit="" />
            <HeroMetric label="P" value={stats.p} unit="" />
            <HeroMetric label="K" value={stats.k} unit="" />
          </div>
        </div>
      </motion.div>

      {/* 2. CROP CONDITION SUMMARY (NEW) */}
      <section style={{ background: 'white', borderRadius: '28px', padding: '1.25rem', border: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <BookOpen size={18} color={COLORS.primary} />
          <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 950, color: COLORS.text, textTransform: 'uppercase' }}>Condition Summary</h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: COLORS.subtext, lineHeight: 1.5 }}>
          {hasData ? (
            `Current soil profile shows ${stats.ph} pH and ${stats.moisture}% moisture levels. Nitrogen and Phosphorus levels are ${stats.n > 50 ? 'sufficient' : 'low'} for active growth. Automated irrigation is ${stats.moisture < 40 ? 'recommended' : 'not required'}.`
          ) : (
            "Waiting for sensor telemetry to generate diagnostic summary..."
          )}
        </p>
      </section>

      {/* 3. DIAGNOSTIC PARAMETERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <DiagnosticCard label="Soil Moisture" value={stats.moisture} unit="%" icon={Waves} color="#3B82F6" trend={stats.trends.moisture} />
        <DiagnosticCard label="Soil pH" value={stats.ph} unit="" icon={Activity} color="#8B5CF6" trend={stats.trends.ph} />
        <DiagnosticCard label="Nitrogen (N)" value={stats.n} unit="mg/kg" icon={Zap} color="#3B82F6" trend={stats.trends.n} />
        <DiagnosticCard label="Phosphorus (P)" value={stats.p} unit="mg/kg" icon={FlaskConical} color="#EC4899" trend={stats.trends.p} />
        <DiagnosticCard label="Potassium (K)" value={stats.k} unit="mg/kg" icon={Leaf} color="#10B981" trend={stats.trends.k} />
        <DiagnosticCard label="Root Temp" value={stats.temp} unit="°C" icon={Thermometer} color="#F59E0B" trend={stats.trends.temp} />
      </div>

      {/* 4. AI INSIGHTS */}
      {hasData && (
        <section style={{ 
          background: COLORS.card, borderRadius: '32px', padding: '1.5rem',
          border: `1px solid ${COLORS.border}`, boxShadow: `0 10px 40px ${COLORS.shadow}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 950, color: COLORS.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Recommendations</h3>
            <div style={{ background: '#F0FDFA', padding: '6px 12px', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#14B8A6' }}>Real-time</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <InsightItem label="Hydration" value={trend.moisture.insight} status={trend.moisture.trend} icon={Waves} />
            <InsightItem label="Thermal State" value={trend.temperature.insight} status={trend.temperature.trend} icon={Thermometer} />
            <InsightItem label="Chemical Balance" value={trend.ph.insight} status={trend.ph.trend} icon={Activity} />
            <InsightItem label="Nutrient Profile" value={trend.npk.insight} status={trend.npk.trend} icon={Zap} />
          </div>
        </section>
      )}

      {/* 5. SMALLER CENTERED CTA */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/analytics', { state: { tab: 'Soil' } })}
          style={{ 
            padding: '10px 24px', borderRadius: '20px', background: COLORS.text, 
            border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>Soil Analytics</span>
          <ChevronRight size={14} />
        </motion.button>
      </div>

    </div>
  );
};

export default SoilMonitoring;
