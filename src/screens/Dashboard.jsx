import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, Droplets, CloudRain, Archive, 
  Wind, Sun, Zap, TrendingUp, AlertTriangle, 
  Camera, Power, Settings as SettingsIcon,
  MapPin, Clock, Thermometer, Droplet, Activity, 
  Plus, X, Command, RefreshCw, TrendingDown, Info, Umbrella, 
  CloudSun, Binary
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  secondary: '#3B82F6',
  warning: '#EF4444',
  text: '#1E293B',
  subtext: '#64748B',
  bg: '#F8FAFC',
  border: '#F1F5F9'
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const IconBox = ({ icon: Icon, color, size = 18, background = 'rgba(255,255,255,0.8)' }) => (
  <div style={{ 
    width: '36px', height: '36px', borderRadius: '12px', background,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color, boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
  }}>
    <Icon size={size} strokeWidth={2.2} />
  </div>
);

const SystemInsightCard = ({ healthScore, status }) => {
  const isWarning = healthScore !== null && healthScore < 70;
  const isOffline = healthScore === null || Object.values(status).every(s => s === 'Offline');
  
  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: `1px solid ${COLORS.border}`,
        position: 'relative', overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
        <div style={{ 
          padding: '6px 12px', borderRadius: '10px', 
          background: isOffline ? '#F1F5F9' : (isWarning ? '#FEF2F2' : '#F0FDF4'), 
          color: isOffline ? '#94A3B8' : (isWarning ? '#EF4444' : '#10B981'), 
          fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' 
        }}>
          System Status: {isOffline ? 'OFFLINE' : (isWarning ? 'WARNING' : 'STABLE')}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {Object.entries(status).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>
            <div style={{ 
              width: '6px', height: '6px', borderRadius: '50%', 
              background: val === 'Offline' ? '#CBD5E1' : (val === 'Warning' ? '#EF4444' : '#10B981') 
            }} />
            <span style={{ textTransform: 'capitalize' }}>{key} Status: {val}</span>
          </div>
        ))}
      </div>
    </motion.section>
  );
};

const QuickSummaryStrip = ({ sensorData }) => {
  const stats = [
    { icon: Thermometer, value: (sensorData?.weather?.temp !== null && sensorData?.weather?.temp !== undefined) ? `${Number(sensorData.weather.temp).toFixed(1)}°C` : '---', color: '#EF4444' },
    { icon: Droplet, value: (sensorData?.weather?.humidity !== null && sensorData?.weather?.humidity !== undefined) ? `${Number(sensorData.weather.humidity).toFixed(1)}%` : '---', color: '#0EA5E9' },
    { icon: Wind, value: (sensorData?.weather?.windSpeed !== null && sensorData?.weather?.windSpeed !== undefined) ? `${Number(sensorData.weather.windSpeed).toFixed(1)} km/h` : '---', color: '#64748B' },
    { icon: Sun, value: (sensorData?.weather?.lightIntensity !== null && sensorData?.weather?.lightIntensity !== undefined) ? (sensorData.weather.lightIntensity > 1000 ? 'High' : 'Normal') : '---', color: '#F59E0B' },
  ];

  return (
    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 0 20px 0' }} className="no-scrollbar">
      {stats.map((stat, i) => (
        <div key={i} style={{ 
          background: 'white', padding: '8px 12px', borderRadius: '14px',
          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: `1px solid ${COLORS.border}`
        }}>
          <stat.icon size={14} color={stat.value === '---' ? '#CBD5E1' : stat.color} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: stat.value === '---' ? '#CBD5E1' : COLORS.text }}>{stat.value}</span>
        </div>
      ))}
    </div>
  );
};

const SystemOverviewCard = ({ score, status }) => {
  const isWarning = score !== null && score < 70;
  const isOffline = score === null || status.hw === 'Offline';
  
  const systems = [
    { label: 'Soil', val: status.soil, color: status.soil === 'Offline' ? '#CBD5E1' : (status.soil === 'Warning' ? '#EF4444' : '#10B981') },
    { label: 'Water', val: status.water, color: status.water === 'Offline' ? '#CBD5E1' : '#10B981' },
    { label: 'Weather', val: status.weather, color: status.weather === 'Offline' ? '#CBD5E1' : '#10B981' },
    { label: 'Storage', val: status.storage, color: status.storage === 'Offline' ? '#CBD5E1' : '#10B981' },
    { label: 'Network', val: status.hw, color: status.hw === 'Offline' ? '#CBD5E1' : '#10B981' },
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
       <h3 style={{ fontSize: '0.75rem', fontWeight: 950, color: '#94A3B8', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Overview</h3>
       <div style={{ 
          background: 'white', borderRadius: '24px', padding: '1.5rem',
          display: 'flex', gap: '20px', alignItems: 'stretch', boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
          border: `1px solid ${COLORS.border}`
       }}>
         <div style={{ width: '45%', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: `1px solid ${COLORS.border}`, paddingRight: '15px' }}>
           <div style={{ fontSize: '0.65rem', fontWeight: 950, color: COLORS.subtext, textTransform: 'uppercase', marginBottom: '4px' }}>HEALTH</div>
           <div style={{ fontSize: '1.1rem', fontWeight: 950, color: isOffline ? '#CBD5E1' : (isWarning ? '#EF4444' : '#10B981'), marginBottom: '10px' }}>{isOffline ? 'OFFLINE' : (isWarning ? 'WARNING' : 'STABLE')}</div>
           <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>Rating: <span style={{ color: isOffline ? '#CBD5E1' : COLORS.text, fontWeight: 950 }}>{isOffline ? '---' : `${score}%`}</span></div>
         </div>
         
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
           {systems.map((s, i) => (
             <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.subtext }}>{s.label}:</span>
               <span style={{ fontSize: '0.75rem', fontWeight: 950, color: s.color }}>{s.val}</span>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
};

const SensorCard = ({ title, value, icon: Icon, color, status, onClick }) => {
  const isConnected = status === 'CONNECTED';
  return (
    <motion.div 
      whileTap={{ scale: 0.95 }} onClick={onClick}
      style={{ 
        background: 'white', borderRadius: '24px', padding: '1.25rem',
        border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
        position: 'relative', overflow: 'hidden', cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: isConnected ? `${color}10` : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={isConnected ? color : '#CBD5E1'} strokeWidth={2.5} />
        </div>
        <div style={{ fontSize: '0.55rem', fontWeight: 900, padding: '4px 8px', borderRadius: '6px', background: isConnected ? '#ECFDF5' : '#F8FAFC', color: isConnected ? '#10B981' : '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.04em', border: isConnected ? 'none' : `1px solid ${COLORS.border}` }}>
          {isConnected ? 'Online' : 'Offline'}
        </div>
      </div>
      <h4 style={{ margin: 0, fontSize: '0.75rem', color: COLORS.subtext, fontWeight: 700 }}>{title}</h4>
      <div style={{ fontSize: '1.3rem', fontWeight: 950, color: value === '---' ? '#CBD5E1' : COLORS.text, marginTop: '4px' }}>{value}</div>
    </motion.div>
  );
};

const ControlRow = ({ icon, label, status, isActive, onToggle }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${COLORS.border}` }}>
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <IconBox icon={icon} color={isActive ? COLORS.primary : COLORS.subtext} background={isActive ? '#ECFDF5' : '#F8FAFC'} />
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: COLORS.text }}>{label}</div>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: isActive ? COLORS.primary : COLORS.subtext }}>Status: {status}</div>
      </div>
    </div>
    <div onClick={onToggle} style={{ width: '52px', height: '28px', background: isActive ? COLORS.primary : '#E2E8F0', borderRadius: '20px', padding: '3px', cursor: 'pointer', transition: '0.3s' }}>
      <motion.div animate={{ x: isActive ? 24 : 0 }} style={{ width: '22px', height: '22px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
    </div>
  </div>
);

const Dashboard = () => {
  const { sensorData, farmHealthScore, toggleActuator, actuators, ACTUATORS, mqttStatus, user, farmInfo } = useApp();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isPumpActive = actuators ? actuators[ACTUATORS?.PUMP] : false;

  const systemStatus = useMemo(() => ({
    soil: (sensorData.soil?.moisture === null) ? 'Offline' : (sensorData.soil?.healthIndex > 70 ? 'Optimal' : 'Warning'),
    water: (sensorData.water?.level === null) ? 'Offline' : (sensorData.water?.level > 20 ? 'Optimal' : 'Low'),
    weather: (sensorData.weather?.temp === null) ? 'Offline' : 'Stable'
  }), [sensorData]);

  const overviewStatus = useMemo(() => ({ 
    soil: systemStatus.soil, water: systemStatus.water, weather: systemStatus.weather, 
    storage: (sensorData.storage?.temp === null) ? 'Offline' : 'Optimal',
    hw: mqttStatus === 'connected' ? 'Online' : 'Offline'
  }), [systemStatus, sensorData, mqttStatus]);

  return (
    <div style={{ padding: '1.25rem', paddingBottom: '100px', background: COLORS.bg }}>
      <section style={{ marginBottom: '2rem', padding: '0 4pt' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.subtext, margin: 0 }}>
          {(() => { const h = currentTime.getHours(); return h < 12 ? 'Good Morning,' : h < 17 ? 'Good Afternoon,' : h < 21 ? 'Good Evening,' : 'Good Night,'; })()}
        </h1>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 950, color: COLORS.primary, margin: '4px 0 12px 0', letterSpacing: '-0.04em' }}>{user?.name || 'Farmer'}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 800 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} color={COLORS.primary} /> Kalyani • Field A-1</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{currentTime.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toLowerCase().replace(' ', '')}<Clock size={14} style={{ marginLeft: '4px' }} /> {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
        </div>
      </section>

      <SystemInsightCard healthScore={farmHealthScore} status={systemStatus} />
      <QuickSummaryStrip sensorData={sensorData} />
      <SystemOverviewCard score={farmHealthScore} status={overviewStatus} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <SensorCard title="Soil" value={(sensorData?.soil?.moisture !== null && sensorData?.soil?.moisture !== undefined) ? `${Number(sensorData.soil.moisture).toFixed(1)}%` : '---'} icon={Sprout} color={COLORS.primary} status={sensorData?.soil?.moisture !== null ? "CONNECTED" : "OFFLINE"} onClick={() => navigate('/soil-monitoring')} />
        <SensorCard title="Irrigation" value={(sensorData?.water?.level !== null && sensorData?.water?.level !== undefined) ? `${Number(sensorData.water.level).toFixed(1)}%` : '---'} icon={Droplets} color={COLORS.secondary} status={sensorData?.water?.level !== null ? "CONNECTED" : "OFFLINE"} onClick={() => navigate('/irrigation')} />
        <SensorCard title="Weather" value={(sensorData?.weather?.temp !== null && sensorData?.weather?.temp !== undefined) ? `${Number(sensorData.weather.temp).toFixed(1)}°C` : '---'} icon={CloudRain} color="#14B8A6" status={sensorData?.weather?.temp !== null ? "CONNECTED" : "OFFLINE"} onClick={() => navigate('/weather')} />
        <SensorCard title="Storage" value={(sensorData?.storage?.temp !== null && sensorData?.storage?.temp !== undefined) ? `${Number(sensorData.storage.temp).toFixed(1)}°C` : '---'} icon={Archive} color="#8B5CF6" status={sensorData?.storage?.temp !== null ? "CONNECTED" : "OFFLINE"} onClick={() => navigate('/storage-hub')} />
      </div>

      <section style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: COLORS.text, marginBottom: '1.5rem' }}>Active Controls</h3>
        <ControlRow icon={Power} label="Irrigation Pump" status={isPumpActive ? 'ON' : 'OFF'} isActive={isPumpActive} onToggle={() => toggleActuator(ACTUATORS.PUMP)} />
      </section>

      <footer style={{ textAlign: 'center', paddingBottom: '100px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase' }}>System Online • v{farmInfo.version}</div>
      </footer>
    </div>
  );
};

export default Dashboard;
