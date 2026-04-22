/**
 * AgriSense v2.8.0 Weather Monitoring
 * Real-time climate diagnostics, regional weather sync, and agricultural forecasting.
 */

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CloudRain, Sun, Wind, Thermometer, Droplet,
  Navigation, Activity, Gauge, SunMedium,
  Sunrise, Sunset, LineChart, ChevronRight,
  Umbrella, CloudSun 
} from 'lucide-react';

// Context & Utils
import { useApp } from '../context/AppContext';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981', 
  secondary: '#3B82F6',
  warning: '#F59E0B',
  critical: '#EF4444',
  offline: '#94A3B8',
  text: '#1E293B',
  subtext: '#64748B',
  border: '#F1F5F9',
  cardBg: '#FFFFFF',
  accent: '#8B5CF6'
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const SensorDot = ({ label, status }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: status === 'active' ? '#34D399' : '#CBD5E1', opacity: status === 'active' ? 1 : 0.5 }} />
    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'white', opacity: 0.8 }}>{label}</span>
  </div>
);

const WeatherCard = ({ title, value, unit, statusMsg, icon: Icon, color, isOffline }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
    style={{
      background: COLORS.cardBg, borderRadius: '24px', padding: '1.25rem',
      border: `1px solid ${COLORS.border}`, boxShadow: '0 8px 20px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', gap: '8px'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: isOffline ? '#F1F5F9' : `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={isOffline ? COLORS.offline : color} />
      </div>
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: '1.3rem', fontWeight: 950, color: isOffline ? COLORS.offline : COLORS.text }}>
          {value !== null && value !== undefined ? value : '---'}
        </span>
        {!isOffline && value !== null && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.subtext }}> {unit}</span>}
      </div>
      {!isOffline && statusMsg && <p style={{ margin: '4px 0 0 0', fontSize: '0.6rem', fontWeight: 800, color }}>{statusMsg}</p>}
    </div>
  </motion.div>
);

const RegionalMetric = ({ label, value, icon: Icon, color }) => (
  <div style={{ background: '#F8FAFC', padding: '12px 8px', borderRadius: '16px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
     <Icon size={16} color={color} />
     <div style={{ textAlign: 'center' }}>
       <p style={{ margin: 0, fontSize: '0.5rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>{label}</p>
       <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 950, color: COLORS.text }}>{value}</p>
     </div>
  </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const WeatherMonitoring = () => {
  // ─── HOOKS & CONTEXT ──────────────────────────────────────────────────────
  const navigate = useNavigate();
  const { sensorData, apiWeather, apiForecast, systemHealth, lastGlobalUpdate } = useApp();

  // ─── DERIVED STATE ────────────────────────────────────────────────────────
  const weather = sensorData?.weather || {};
  const weatherScore = systemHealth.weather;
  const isOnline = weather.temp !== null;

  const displayStats = useMemo(() => ({
    temp: weather.temp !== null ? Number(weather.temp).toFixed(1) : null,
    humidity: weather.humidity !== null ? Number(weather.humidity).toFixed(1) : null,
    light: weather.lightIntensity !== null ? Math.round(weather.lightIntensity) : null,
    rainLevel: weather.rainLevel !== null ? Math.round(weather.rainLevel) : null,
  }), [weather]);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1.25rem', paddingBottom: '30px', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* ─── HERO HEALTH CARD ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{
          background: !isOnline ? 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)' : (weatherScore > 75 ? 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)' : 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)'),
          borderRadius: '32px', padding: '1.75rem', color: 'white',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
          marginBottom: '1.5rem', position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.15)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px', width: 'fit-content' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline ? '#34D399' : '#EF4444' }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 950, textTransform: 'uppercase' }}>NODE {isOnline ? 'ACTIVE' : 'OFFLINE'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Climate Stability</p>
            <h1 style={{ margin: '4px 0', fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{weatherScore !== null ? weatherScore : '--'} <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>%</span></h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, opacity: 0.6 }}>LAST SYNC</p>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900 }}>{lastGlobalUpdate || '--:--'}</p>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '12px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
           <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>{isOnline ? (weatherScore > 70 ? 'Ideal Conditions' : 'Sub-Optimal') : 'System Offline'}</span>
           <div style={{ display: 'flex', gap: '8px' }}>
              <SensorDot label="TMP" status={weather.temp !== null ? 'active' : 'offline'} />
              <SensorDot label="HUM" status={weather.humidity !== null ? 'active' : 'offline'} />
              <SensorDot label="RN" status={weather.rainLevel !== null ? 'active' : 'offline'} />
              <SensorDot label="LUX" status={weather.lightIntensity !== null ? 'active' : 'offline'} />
           </div>
        </div>
      </motion.div>

      {/* ─── LIVE FIELD SENSORS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <WeatherCard title="Field Temp" value={displayStats.temp} unit="°C" icon={Thermometer} color={COLORS.primary} isOffline={!isOnline} />
        <WeatherCard title="Field Humidity" value={displayStats.humidity} unit="%" icon={Droplet} color={COLORS.secondary} isOffline={!isOnline} />
        <WeatherCard title="Solar Intensity" value={displayStats.light} unit="lux" icon={Sun} color={COLORS.warning} isOffline={weather.lightIntensity === null} />
        <WeatherCard title="Rain Level" value={displayStats.rainLevel} unit="mm" icon={CloudRain} color="#8B5CF6" isOffline={weather.rainLevel === null} statusMsg={displayStats.rainLevel !== null ? (weather.isRaining ? 'Raining' : 'Dry') : null} />
      </div>

      {/* ─── REGIONAL DATA GRID ─── */}
      <section style={{ background: COLORS.cardBg, borderRadius: '28px', padding: '1.5rem', border: `1px solid ${COLORS.border}`, marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 950, color: COLORS.text, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={18} color={COLORS.primary} /> Regional Data
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
           <RegionalMetric label="AQI" value={apiWeather?.aqi || '--'} icon={Activity} color="#10B981" />
           <RegionalMetric label="Sky" value={apiWeather?.clouds ? `${apiWeather.clouds}%` : '--'} icon={CloudSun} color="#3B82F6" />
           <RegionalMetric label="Wind" value={apiWeather?.windSpeed || '--'} icon={Wind} color="#F59E0B" />
           <RegionalMetric label="Feels" value={`${apiWeather?.feelsLike || '--'}°`} icon={Thermometer} color="#EF4444" />
           <RegionalMetric label="Pressure" value={apiWeather?.pressure || '--'} icon={Gauge} color={COLORS.accent} />
           <RegionalMetric label="UV" value={apiWeather?.uv || 'Low'} icon={SunMedium} color={COLORS.warning} />
           <RegionalMetric label="Sunrise" value={apiWeather?.sunrise || '--'} icon={Sunrise} color={COLORS.primary} />
           <RegionalMetric label="Sunset" value={apiWeather?.sunset || '--'} icon={Sunset} color={COLORS.secondary} />
        </div>
      </section>

      {/* ─── 5-DAY CROP FORECAST ─── */}
      <section style={{ background: COLORS.cardBg, borderRadius: '32px', padding: '1.5rem', border: `1px solid ${COLORS.border}`, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: `${COLORS.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LineChart size={20} color={COLORS.primary} />
            </div>
            <h3 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 950, color: COLORS.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agricultural Forecast</h3>
          </div>
          <div style={{ background: '#F0FDFA', padding: '4px 10px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 950, color: '#14B8A6' }}>5-Day View</span>
            </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {apiForecast.map((day, idx) => {
            const getWeatherIcon = (cond) => {
              const c = cond.toLowerCase();
              if (c.includes('rain') || c.includes('drizzle')) return <CloudRain size={16} color={COLORS.secondary} />;
              if (c.includes('cloud')) return <CloudSun size={16} color="#64748B" />;
              if (c.includes('clear') || c.includes('sun')) return <Sun size={16} color={COLORS.warning} />;
              if (c.includes('storm')) return <Activity size={16} color={COLORS.critical} />;
              return <Sun size={16} color={COLORS.warning} />;
            };

            return (
              <div key={idx} style={{ 
                display: 'flex', alignItems: 'center', padding: '12px 16px', 
                background: '#F8FAFC', borderRadius: '20px', border: '1px solid #F1F5F9'
              }}>
                <div style={{ width: '60px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 950, color: COLORS.text }}>{day.date}</p>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                      {getWeatherIcon(day.condition)}
                    </div>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 850, color: COLORS.subtext }}>{day.condition}</p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Umbrella size={14} color={COLORS.secondary} opacity={0.5} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 950, color: COLORS.text }}>{day.rainProb}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 950, color: COLORS.text, width: '35px' }}>{day.temp}°</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── FOOTER ACTION ─── */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/analytics', { state: { tab: 'Weather' } })}
          style={{ 
            padding: '12px 30px', borderRadius: '20px', background: COLORS.text, 
            border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 950, textTransform: 'uppercase' }}>Weather Analytics</span>
          <ChevronRight size={16} />
        </motion.button>
      </div>

    </div>
  );
};

export default WeatherMonitoring;
