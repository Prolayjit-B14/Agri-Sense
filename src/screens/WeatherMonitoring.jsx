import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  CloudRain, Sun, Wind, Thermometer, Droplet, 
  ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, 
  Sparkles, History, MapPin, Navigation
} from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#EF4444', // Red for weather
  secondary: '#3B82F6',
  warning: '#F59E0B',
  success: '#10B981',
  text: '#1E293B',
  subtext: '#64748B',
  border: '#F1F5F9'
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const WeatherCard = ({ title, value, unit, icon: Icon, color, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      background: 'white', borderRadius: '24px', padding: '1.25rem',
      border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', gap: '12px'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : COLORS.subtext }}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : trend === 'down' ? <ArrowDownRight size={14} /> : <Minus size={14} />}
        </div>
      )}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginTop: '4px' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text }}>{value || '--'}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.subtext }}>{unit}</span>
      </div>
    </div>
  </motion.div>
);

const PredictiveWeatherBanner = ({ temp, humidity, light }) => {
  const prediction = useMemo(() => {
    if (!temp) return null;
    const t = parseFloat(temp);
    const h = parseFloat(humidity);
    if (t < 5) return { text: "Frost risk detected tonight. Protect sensitive crops.", color: '#3B82F6', icon: AlertTriangle };
    if (t > 38 && h < 30) return { text: "Heatwave condition likely. Increase irrigation cycles.", color: '#EF4444', icon: AlertTriangle };
    if (light > 2000 && t > 30) return { text: "High UV & Transpiration risk. Partial shading advised.", color: '#F59E0B', icon: Sparkles };
    return { text: "Weather patterns stable. Optimal for field operations.", color: '#10B981', icon: Sparkles };
  }, [temp, humidity, light]);

  if (!prediction) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: `${prediction.color}10`, border: `1px dashed ${prediction.color}40`,
        borderRadius: '24px', padding: '1.25rem', display: 'flex', gap: '12px', alignItems: 'center',
        marginBottom: '1.5rem'
      }}
    >
      <prediction.icon size={20} color={prediction.color} />
      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: COLORS.text, lineHeight: 1.4 }}>
        <span style={{ color: prediction.color, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', marginBottom: '2px' }}>Intelligent Forecast</span>
        {prediction.text}
      </p>
    </motion.div>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const WeatherMonitoring = () => {
  const { sensorData, lastGlobalUpdate } = useApp();
  const weather = sensorData?.weather || {};

  const stats = useMemo(() => ({
    temp: weather.temp ? Number(weather.temp).toFixed(1) : null,
    humidity: weather.humidity ? Number(weather.humidity).toFixed(1) : null,
    wind: weather.windSpeed ? Number(weather.windSpeed).toFixed(1) : '4.2', // Mock if missing
    pressure: '1012',
    light: weather.lightIntensity || 1200,
    rain: weather.isRaining ? 'Active' : 'No Rain'
  }), [weather]);

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '100px' }}>
      
      {/* 1. LOCATION & SYNC */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={16} color={COLORS.primary} />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 900, color: COLORS.text, margin: 0 }}>Kalyani, Field A</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: COLORS.subtext, fontSize: '0.65rem', fontWeight: 700 }}>
              <History size={10} /> Updated {lastGlobalUpdate || 'Just now'}
            </div>
          </div>
        </div>
        <div style={{ width: '36px', height: '36px', borderRadius: '12px', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.subtext }}>
          <Navigation size={18} />
        </div>
      </div>

      {/* 2. HERO WEATHER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
          borderRadius: '28px', padding: '2rem', color: 'white',
          boxShadow: '0 20px 40px -12px rgba(239, 68, 68, 0.3)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.2 }}>
          <CloudRain size={160} color="white" />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Atmosphere</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '8px 0' }}>
            <span style={{ fontSize: '4.5rem', fontWeight: 950, lineHeight: 1 }}>{stats.temp || '--'}</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, opacity: 0.8 }}>°C</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
              <Droplet size={14} /> {stats.humidity}% Humid
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
              <Wind size={14} /> {stats.wind} km/h
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. PREDICTIVE BANNER */}
      <PredictiveWeatherBanner temp={stats.temp} humidity={stats.humidity} light={stats.light} />

      {/* 4. WEATHER GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <WeatherCard title="Rainfall" value={stats.rain} unit="" icon={CloudRain} color="#3B82F6" trend="stable" delay={0.05} />
        <WeatherCard title="Solar Intensity" value={stats.light} unit="lx" icon={Sun} color="#F59E0B" trend="up" delay={0.1} />
        <WeatherCard title="Air Pressure" value={stats.pressure} unit="hPa" icon={Navigation} color="#8B5CF6" trend="down" delay={0.15} />
        <WeatherCard title="Wind Speed" value={stats.wind} unit="km/h" icon={Wind} color="#64748B" trend="up" delay={0.2} />
      </div>

      {/* 5. DAILY FORECAST MOCK */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: COLORS.text, marginBottom: '1.25rem', textTransform: 'uppercase' }}>Daily Outlook</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
            <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext }}>{day}</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: i === 0 ? '#FEE2E2' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i === 1 ? <CloudRain size={16} color="#3B82F6" /> : <Sun size={16} color={i === 0 ? '#EF4444' : '#F59E0B'} />}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: COLORS.text }}>{28 + i}°</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default WeatherMonitoring;
