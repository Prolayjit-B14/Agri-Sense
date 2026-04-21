import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MASTER_CONFIG } from '../config';
import { 
  CloudRain, Sun, Wind, Thermometer, Droplet,
  AlertTriangle, MapPin, Navigation, Eye,
  Gauge, SunMedium, Activity, ShieldCheck,
  Sunrise, Sunset, LineChart, Sparkles,
  Cloud, CloudLightning, Waves, Zap, ChevronRight,
  TrendingUp, TrendingDown, Info, Umbrella, 
  CloudSun, Binary
} from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
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

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const SensorDot = ({ label, status }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: status === 'active' ? '#34D399' : '#CBD5E1', opacity: status === 'active' ? 1 : 0.5 }} />
    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'white', opacity: 0.8 }}>{label}</span>
  </div>
);

const WeatherCard = ({ title, value, unit, statusMsg, icon: Icon, color, reliability = 'active', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    style={{
      background: COLORS.cardBg, borderRadius: '24px', padding: '1.25rem',
      border: `1px solid ${COLORS.border}`, boxShadow: '0 8px 20px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', gap: '8px'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: reliability === 'active' ? COLORS.primary : COLORS.offline }} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
        <span style={{ fontSize: '1.3rem', fontWeight: 950, color: reliability === 'offline' ? COLORS.offline : COLORS.text }}>
          {value !== null && value !== undefined ? value : '---'}
        </span>
        {reliability !== 'offline' && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.subtext }}>{unit}</span>}
      </div>
      {statusMsg && <p style={{ margin: '4px 0 0 0', fontSize: '0.6rem', fontWeight: 800, color }}>{statusMsg}</p>}
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

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const WeatherMonitoring = () => {
  const navigate = useNavigate();
  const { sensorData, apiWeather, apiForecast, lastGlobalUpdate } = useApp();
  const weather = sensorData?.weather || {};

  const stats = useMemo(() => {
    const lux = weather.lightIntensity;
    let solarStatus = lux !== null ? (lux < 1000 ? "Low" : lux < 10000 ? "Moderate" : "Optimal") : "---";
    let solarColor = lux !== null ? (lux < 1000 ? COLORS.offline : lux < 25000 ? COLORS.primary : COLORS.critical) : COLORS.offline;

    const isRaining = weather.isRaining;
    let rainStatus = isRaining ? (weather.rainLevel < 5 ? "Rain" : "Heavy") : "Dry";
    let rainColor = isRaining ? COLORS.secondary : COLORS.offline;

    // 🌡️ Weather Health Score (0-100)
    let wScore = 100;
    if (weather.temp !== null) {
      if (weather.temp > 38 || weather.temp < 5) wScore -= 30;
      else if (weather.temp > 32 || weather.temp < 15) wScore -= 10;
      if (weather.humidity > 85) wScore -= 20;
      if (weather.isRaining) wScore -= 40;
      if (lux < 200) wScore -= 10;
    } else {
      wScore = null;
    }

    return {
      wScore: wScore !== null ? Math.max(0, wScore) : '---',
      sensorTemp: weather.temp !== null && !isNaN(weather.temp) ? Number(weather.temp).toFixed(1) : '---',
      sensorHumidity: weather.humidity !== null && !isNaN(weather.humidity) ? Number(weather.humidity).toFixed(1) : '---',
      sensorLight: lux !== null && !isNaN(lux) ? Math.round(lux) : '---',
      sensorRainLevel: weather.rainLevel !== null && !isNaN(weather.rainLevel) ? Math.round(weather.rainLevel) : '---',
      sensorRainStatus: isRaining ? rainStatus : 'Dry',
      solarStatus,
      solarColor,
      rainColor,
      isTempOnline: weather.temp !== null,
      isHumOnline: weather.humidity !== null,
      isLdrOnline: lux !== null,
      isRainOnline: weather.rainLevel !== null,
      apiTemp: apiWeather?.temp !== null && apiWeather?.temp !== undefined && !isNaN(apiWeather.temp) ? apiWeather.temp : '---',
      apiHum: apiWeather?.humidity !== null && apiWeather?.humidity !== undefined && !isNaN(apiWeather.humidity) ? `${apiWeather.humidity}%` : '---',
      apiPress: apiWeather?.pressure !== null && apiWeather?.pressure !== undefined && !isNaN(apiWeather.pressure) ? `${apiWeather.pressure} hPa` : '---',
      apiWind: apiWeather?.windSpeed !== null && apiWeather?.windSpeed !== undefined && !isNaN(apiWeather.windSpeed) ? `${apiWeather.windSpeed} m/s` : '---',
      apiAQI: apiWeather?.aqi !== null && apiWeather?.aqi !== undefined && !isNaN(apiWeather.aqi) ? apiWeather.aqi : '---',
      apiUV: apiWeather?.uv || 'Low',
      apiCloudCover: apiWeather?.clouds !== null && !isNaN(apiWeather.clouds) ? `${apiWeather.clouds}%` : '---',
      apiCondition: apiWeather?.condition || 'Detecting...',
      apiDescription: apiWeather?.description || 'Atmospheric analysis in progress',
      apiFeelsLike: apiWeather?.feelsLike !== null && !isNaN(apiWeather.feelsLike) ? apiWeather.feelsLike : '---',
      overallColor: (wScore !== null && wScore < 60) ? 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    };
  }, [weather, apiWeather]);

  const isOnline = weather.temp !== null;

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#F8FAFC' }}>
      
      {/* 1. PROFESSIONAL WEATHER HERO CARD (ELITE REDESIGN) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: stats.overallColor,
          borderRadius: '35px', padding: '2rem', color: 'white',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.2)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', gap: '2rem'
        }}
      >
        {/* Abstract Background Decoration */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '250px', height: '250px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '150px', height: '150px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />

        {/* Top Info Bar */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#34D399' : '#EF4444', boxShadow: isOnline ? '0 0 10px #34D399' : 'none' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Weather Node: {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, opacity: 0.6 }}>{lastGlobalUpdate || '---'}</p>
        </div>

        {/* Main Score Display */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', margin: '1rem 0' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.1em' }}>Weather Health Score</p>
          <h2 style={{ margin: 0, fontSize: '4.5rem', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 1 }}>
            {stats.wScore}{stats.wScore !== '---' && <span style={{ fontSize: '1.5rem', opacity: 0.6 }}>%</span>}
          </h2>
        </div>

        {/* Sensor Node Connectivity Row */}
        <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <SensorDot label="TEMP" status={stats.isTempOnline ? 'active' : 'offline'} />
          <SensorDot label="HUM" status={stats.isHumOnline ? 'active' : 'offline'} />
          <SensorDot label="LDR" status={stats.isLdrOnline ? 'active' : 'offline'} />
          <SensorDot label="RAIN" status={stats.isRainOnline ? 'active' : 'offline'} />
        </div>
      </motion.div>

      {/* 2. LIVE FIELD SENSORS (2x2 GRID) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <WeatherCard title="Field Temp" value={stats.sensorTemp} unit="°C" icon={Thermometer} color={COLORS.primary} reliability={stats.isTempOnline ? 'active' : 'offline'} />
        <WeatherCard title="Field Humidity" value={stats.sensorHumidity} unit="%" icon={Droplet} color={COLORS.secondary} reliability={stats.isHumOnline ? 'active' : 'offline'} />
        <WeatherCard title="LDR Intensity" value={stats.sensorLight} unit="lux" icon={Sun} color={COLORS.warning} reliability={stats.isLdrOnline ? 'active' : 'offline'} />
        <WeatherCard title="Rainfall" value={stats.sensorRainLevel} unit="mm" icon={CloudRain} color="#8B5CF6" reliability={stats.isRainOnline ? 'active' : 'offline'} statusMsg={stats.sensorRainStatus} />
      </div>

      {/* 3. REGIONAL CONDITIONS (EXPANDED GRID) */}
      <section style={{ background: 'white', borderRadius: '32px', padding: '1.5rem', border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 950, color: COLORS.text, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={18} color={COLORS.primary} /> Regional Data
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
           <RegionalMetric label="AQI" value={stats.apiAQI} icon={Activity} color="#10B981" />
           <RegionalMetric label="Sky" value={stats.apiCloudCover} icon={CloudSun} color="#3B82F6" />
           <RegionalMetric label="Rain Prob" value={`${apiForecast?.[0]?.pop ?? 0}%`} icon={Umbrella} color="#8B5CF6" />
           <RegionalMetric label="Wind" value={stats.apiWind} icon={Wind} color="#F59E0B" />
           <RegionalMetric label="Feels" value={`${stats.apiFeelsLike}°`} icon={Thermometer} color="#EF4444" />
           <RegionalMetric label="UV" value={stats.apiUV} icon={Sun} color="#FACC15" />
           <RegionalMetric label="Sunrise" value={apiWeather.sunrise} icon={Sunrise} color="#FB923C" />
           <RegionalMetric label="Sunset" value={apiWeather.sunset} icon={Sunset} color="#EC4899" />
        </div>
      </section>

      {/* 4. 5-DAY CROP FORECAST */}
      <section style={{ background: 'white', borderRadius: '32px', padding: '1.5rem', border: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 950, color: COLORS.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agricultural Forecast</h3>
          <LineChart size={18} color={COLORS.subtext} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {apiForecast.map((day, idx) => (
            <div key={idx} style={{ 
              display: 'flex', alignItems: 'center', padding: '12px 14px', 
              background: '#F8FAFC', borderRadius: '18px', border: '1px solid #F1F5F9'
            }}>
               <div style={{ width: '50px' }}>
                 <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 950, color: COLORS.text }}>{day.date}</p>
               </div>
               <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {day.condition.includes('Rain') || day.condition.includes('Thunder') ? <CloudRain size={14} color={COLORS.secondary} /> : 
                     day.condition.includes('Cloud') ? <Cloud size={14} color={COLORS.offline} /> :
                     day.condition.includes('Mist') || day.condition.includes('Haze') || day.condition.includes('Fog') ? <Wind size={14} color={COLORS.offline} /> :
                     <Sun size={14} color={COLORS.warning} />}
                  </div>
                 <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext }}>{day.condition}</p>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 950, color: COLORS.text }}>{day.temp}°</p>
                 <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 900, color: COLORS.secondary }}>{day.pop}%</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SMALLER CENTERED CTA */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/analytics', { state: { tab: 'Weather' } })}
          style={{ 
            padding: '10px 24px', borderRadius: '20px', background: COLORS.text, 
            border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>Open Analytics</span>
          <ChevronRight size={14} />
        </motion.button>
      </div>

    </div>
  );
};

export default WeatherMonitoring;
