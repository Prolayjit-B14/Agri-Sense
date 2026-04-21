import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  CloudRain, Sun, Wind, Thermometer, Droplet,
  AlertTriangle, MapPin, Navigation, Eye,
  Gauge, SunMedium, Activity, ShieldCheck,
  Sunrise, Sunset, LineChart
} from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#EF4444', 
  secondary: '#3B82F6',
  warning: '#F59E0B',
  success: '#10B981',
  text: '#1E293B',
  subtext: '#64748B',
  border: '#F1F5F9',
  cardBg: '#FFFFFF',
  accent: '#8B5CF6'
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const WeatherCard = ({ title, value, unit, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    style={{
      background: COLORS.cardBg, borderRadius: '24px', padding: '1.25rem',
      border: `1px solid ${COLORS.border}`, boxShadow: '0 8px 20px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', gap: '10px'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text }}>{value !== null && value !== undefined ? value : '---'}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.subtext }}>{unit}</span>
      </div>
    </div>
  </motion.div>
);

const PredictiveWeatherBanner = ({ temp, humidity, light }) => {
  const prediction = useMemo(() => {
    if (!temp) return null;
    const t = parseFloat(temp);
    const h = parseFloat(humidity);
    if (t < 5) return { text: "Frost risk detected. Protect sensitive crops immediately.", color: COLORS.secondary, icon: AlertTriangle };
    if (t > 36 && h < 30) return { text: "High transpiration risk. Increase irrigation frequency.", color: COLORS.primary, icon: AlertTriangle };
    if (light > 5000) return { text: "Intense solar radiation. Partial shading advised for seedlings.", color: COLORS.warning, icon: SunMedium };
    return { text: "Climatic conditions are optimal for fertilization and seeding.", color: COLORS.success, icon: ShieldCheck };
  }, [temp, humidity, light]);

  if (!prediction) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      style={{
        background: `${prediction.color}08`, border: `1px solid ${prediction.color}20`,
        borderRadius: '24px', padding: '1.25rem', display: 'flex', gap: '15px', alignItems: 'center',
        boxShadow: `0 4px 15px ${prediction.color}05`
      }}
    >
      <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: prediction.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <prediction.icon size={18} color="white" />
      </div>
      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: COLORS.text, lineHeight: 1.5 }}>
        <span style={{ color: prediction.color, textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 950, display: 'block', marginBottom: '2px', letterSpacing: '0.05em' }}>Agronomic Insight</span>
        {prediction.text}
      </p>
    </motion.div>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const WeatherMonitoring = () => {
  const navigate = useNavigate();
  const { sensorData, apiWeather, apiForecast } = useApp();
  const weather = sensorData?.weather || {};

  const stats = useMemo(() => ({
    // SENSOR DATA
    sensorTemp: weather.temp !== null ? Number(weather.temp).toFixed(1) : '---',
    sensorHumidity: weather.humidity !== null ? Number(weather.humidity).toFixed(1) : '---',
    sensorLight: weather.lightIntensity !== null ? weather.lightIntensity : '---',
    sensorRain: weather.isRaining ? 'PRECIPITATING' : (weather.rainLevel > 0 ? 'DRYING' : (weather.temp !== null ? 'DRY' : '---')),
    
    // API DATA
    apiTemp: apiWeather?.temp !== null ? apiWeather?.temp : '---',
    apiTempMin: apiWeather?.tempMin !== null ? apiWeather?.tempMin : '---',
    apiTempMax: apiWeather?.tempMax !== null ? apiWeather?.tempMax : '---',
    apiHumidity: apiWeather?.humidity !== null ? apiWeather?.humidity : '---',
    apiWind: apiWeather?.windSpeed !== null ? Number(apiWeather.windSpeed).toFixed(1) : '---',
    apiWindDeg: apiWeather?.windDeg !== null ? apiWeather?.windDeg : '---',
    apiWindGust: apiWeather?.windGust !== null ? Number(apiWeather.windGust).toFixed(1) : '---',
    apiPressure: apiWeather?.pressure !== null ? apiWeather?.pressure : '---',
    apiVisibility: apiWeather?.visibility !== null ? apiWeather?.visibility : '---',
    apiFeelsLike: apiWeather?.feelsLike !== null ? apiWeather?.feelsLike : '---',
    apiAQI: apiWeather?.aqi !== null ? apiWeather?.aqi : '---',
    apiClouds: apiWeather?.clouds !== null ? apiWeather?.clouds : '---',
    apiSeaLevel: apiWeather?.seaLevel !== null ? apiWeather?.seaLevel : '---',
    apiGrndLevel: apiWeather?.grndLevel !== null ? apiWeather?.grndLevel : '---',
    apiRain1h: apiWeather?.apiRain !== null ? apiWeather?.apiRain : '0',
    apiSunrise: apiWeather?.sunrise || '---:---',
    apiSunset: apiWeather?.sunset || '---:---',
    apiCondition: apiWeather?.condition || 'Analyzing...',
    apiDescription: apiWeather?.description || 'Determining precise conditions...',
    apiCity: apiWeather?.city || 'Local Farm',
    pollutants: apiWeather?.pollutants || {}
  }), [weather, apiWeather]);

  const getAQILabel = (aqi) => {
    if (aqi === '---') return 'Unknown';
    const labels = ['Excellent', 'Fair', 'Moderate', 'Poor', 'Hazardous'];
    return labels[Math.min(aqi - 1, 4)] || 'Unknown';
  };

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '100px', background: '#FBFBFE' }}>
      
      {/* 1. API HERO CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)',
          borderRadius: '40px', padding: '2.5rem 2rem', color: 'white',
          boxShadow: '0 40px 80px -15px rgba(5, 150, 105, 0.25)',
          position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '320px', height: '320px', background: 'rgba(52, 211, 153, 0.15)', borderRadius: '50%', filter: 'blur(80px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
               <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 950, color: 'white', display: 'inline-block', marginBottom: '12px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                 LIVE SATELLITE FEED
               </div>
               <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>{stats.apiDescription}</p>
               <h4 style={{ margin: '6px 0 0 0', fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <MapPin size={12} /> {stats.apiCity} • {new Date().toLocaleDateString([], { month: 'long', day: 'numeric' })}
               </h4>
            </div>
            <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <SunMedium size={32} color="#FDE68A" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '30px 0' }}>
            <span style={{ fontSize: '6.5rem', fontWeight: 950, letterSpacing: '-0.05em', textShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>{stats.apiTemp}</span>
            <span style={{ fontSize: '3rem', fontWeight: 800, opacity: 0.5 }}>°C</span>
            <div style={{ marginLeft: '15px' }}>
               <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, color: '#FCA5A1', marginBottom: '8px' }}>
                 MAX: {stats.apiTempMax}°C
               </div>
               <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, color: '#93C5FD' }}>
                 MIN: {stats.apiTempMin}°C
               </div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '1.25rem', background: 'rgba(255,255,255,0.08)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)', marginTop: '5px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.55rem', fontWeight: 800, opacity: 0.7, textTransform: 'uppercase' }}>AQI Index</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', fontWeight: 950 }}>{stats.apiAQI}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.55rem', fontWeight: 800, opacity: 0.7, textTransform: 'uppercase' }}>Clouds</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', fontWeight: 950 }}>{stats.apiClouds}%</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.55rem', fontWeight: 800, opacity: 0.7, textTransform: 'uppercase' }}>Humidity</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', fontWeight: 950 }}>{stats.apiHumidity}%</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.55rem', fontWeight: 800, opacity: 0.7, textTransform: 'uppercase' }}>Status</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', fontWeight: 950, textTransform: 'capitalize' }}>{stats.apiCondition}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. REAL-TIME FIELD SENSORS (ESP32 DATA) */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <WeatherCard title="Field Temp" value={stats.sensorTemp} unit="°C" icon={Thermometer} color={COLORS.primary} delay={0.05} />
          <WeatherCard title="Field Humidity" value={stats.sensorHumidity} unit="%" icon={Droplet} color={COLORS.secondary} delay={0.1} />
          <WeatherCard title="Solar Intensity" value={stats.sensorLight} unit="lx" icon={Sun} color={COLORS.warning} delay={0.15} />
          <WeatherCard title="Rainfall Status" value={stats.sensorRain} unit="" icon={CloudRain} color={COLORS.accent} delay={0.2} />
        </div>
      </div>

      {/* 3. LIVE CONDITIONS */}
      <div style={{ background: 'white', borderRadius: '32px', padding: '1.5rem', border: `1px solid ${COLORS.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 950, color: COLORS.text, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Navigation size={18} color={COLORS.secondary} /> Live Conditions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wind size={20} color={COLORS.secondary} />
             </div>
             <div>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>Wind Velocity</p>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 950 }}>{stats.apiWind} <span style={{ fontSize: '0.7rem', color: COLORS.subtext }}>km/h</span></p>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gauge size={20} color={COLORS.accent} />
             </div>
             <div>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>Barometer</p>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 950 }}>{stats.apiPressure} <span style={{ fontSize: '0.7rem', color: COLORS.subtext }}>hPa</span></p>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sunrise size={20} color="#F59E0B" />
             </div>
             <div>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>Sunrise</p>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 950 }}>{stats.apiSunrise}</p>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sunset size={20} color="#EF4444" />
             </div>
             <div>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>Sunset</p>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 950 }}>{stats.apiSunset}</p>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={20} color={COLORS.warning} />
             </div>
             <div>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>Visibility</p>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 950 }}>{stats.apiVisibility} <span style={{ fontSize: '0.7rem', color: COLORS.subtext }}>km</span></p>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} color={COLORS.success} />
             </div>
             <div>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>Feels Like</p>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 950 }}>{stats.apiFeelsLike}°C</p>
             </div>
          </div>
        </div>
      </div>



      {/* 5. 5-DAY AGRICULTURAL FORECAST */}
      <div style={{ background: 'white', borderRadius: '32px', padding: '1.75rem', border: `1px solid ${COLORS.border}`, boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 950, color: COLORS.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>5-Day Agricultural Forecast</h3>
          <div style={{ padding: '4px 10px', borderRadius: '8px', background: `${COLORS.success}15`, color: COLORS.success, fontSize: '0.6rem', fontWeight: 950 }}>LIVE SYNC</div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {apiForecast.map((day, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }}
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                padding: '12px 16px', borderRadius: '20px', background: '#F8FAFC', 
                border: '1px solid #F1F5F9'
              }}
            >
              <div style={{ width: '80px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, color: COLORS.text }}>{day.date === new Date().toLocaleDateString([], { weekday: 'short' }) ? 'Today' : day.date}</p>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, color: COLORS.subtext, textTransform: 'uppercase' }}>{day.condition}</p>
              </div>
              
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt={day.condition} style={{ width: '32px' }} />
                </div>
              </div>

              <div style={{ textAlign: 'right', width: '80px' }}>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: COLORS.text }}>{day.temp}°</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  <Droplet size={10} color={COLORS.secondary} />
                  <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: COLORS.secondary }}>{day.pop}%</p>
                </div>
              </div>
            </motion.div>
          ))}
          {apiForecast.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Activity className="animate-spin" size={24} color={COLORS.subtext} style={{ opacity: 0.5 }} />
              <p style={{ fontSize: '0.8rem', color: COLORS.subtext, marginTop: '10px', fontWeight: 700 }}>Synchronizing Satellite Forecast...</p>
            </div>
          )}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/analytics', { state: { tab: 'Weather' } })}
        style={{ width: '100%', padding: '1.25rem', borderRadius: '24px', background: 'white', border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: '0.9rem', fontWeight: 950, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '0.5rem', cursor: 'pointer' }}
      >
        Meteorological Analytics <LineChart size={18} />
      </motion.button>

    </div>
  );
};

export default WeatherMonitoring;
