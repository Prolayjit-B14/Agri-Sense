import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, Droplets, CloudRain, Archive, 
  Wind, Sun, Zap, TrendingUp, AlertTriangle, 
  Camera, Power, Settings as SettingsIcon,
  MapPin, Clock, Thermometer, Droplet, Activity, 
  Plus, X, Command, RefreshCw
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

// ─── SUB-COMPONENTS (Moved outside for performance) ───────────────────────

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
  const isWarning = healthScore < 70;
  const isOffline = Object.values(status).every(s => s === 'Offline');
  
  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white',
        borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem',
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
    { icon: Thermometer, value: sensorData?.weather?.temp ? `${Number(sensorData.weather.temp).toFixed(1)}°C` : '--', color: '#EF4444' },
    { icon: Droplet, value: sensorData?.weather?.humidity ? `${Number(sensorData.weather.humidity).toFixed(1)}%` : '--', color: '#0EA5E9' },
    { icon: Wind, value: sensorData?.weather?.windSpeed ? `${Number(sensorData.weather.windSpeed).toFixed(1)} km/h` : '--', color: '#64748B' },
    { icon: Sun, value: sensorData?.weather?.lightIntensity ? (sensorData.weather.lightIntensity > 1000 ? 'High' : 'Normal') : '--', color: '#F59E0B' },
  ];

  return (
    <div style={{ 
      display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 0 20px 0',
      scrollbarWidth: 'none', msOverflowStyle: 'none'
    }} className="no-scrollbar">
      {stats.map((stat, i) => (
        <div key={i} style={{ 
          background: 'white', padding: '8px 12px', borderRadius: '14px',
          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: `1px solid ${COLORS.border}`
        }}>
          <stat.icon size={14} color={stat.value === '--' ? '#CBD5E1' : stat.color} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: stat.value === '--' ? '#CBD5E1' : COLORS.text }}>{stat.value}</span>
        </div>
      ))}
    </div>
  );
};

const SystemOverviewCard = ({ score, status }) => {
  const isWarning = score < 70;
  const isOffline = status.hw === 'Offline';
  
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
           <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>Rating: <span style={{ color: isOffline ? '#CBD5E1' : COLORS.text, fontWeight: 950 }}>{isOffline ? '--' : `${score}%`}</span></div>
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
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{ 
        background: 'white', borderRadius: '24px', padding: '1.25rem',
        border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
        position: 'relative', overflow: 'hidden', cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ 
          width: '42px', height: '42px', borderRadius: '14px', 
          background: isConnected ? `${color}10` : '#F1F5F9', display: 'flex', alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Icon size={20} color={isConnected ? color : '#CBD5E1'} strokeWidth={2.5} />
        </div>
        <div style={{ 
          fontSize: '0.55rem', fontWeight: 900, padding: '4px 8px', borderRadius: '6px',
          background: isConnected ? '#ECFDF5' : '#F8FAFC',
          color: isConnected ? '#10B981' : '#CBD5E1',
          textTransform: 'uppercase', letterSpacing: '0.04em',
          border: isConnected ? 'none' : `1px solid ${COLORS.border}`
        }}>
          {status === 'CONNECTED' ? 'Online' : 'Offline'}
        </div>
      </div>
      <h4 style={{ margin: 0, fontSize: '0.75rem', color: COLORS.subtext, fontWeight: 700 }}>{title}</h4>
      <div style={{ fontSize: '1.3rem', fontWeight: 950, color: value === '--' ? '#CBD5E1' : COLORS.text, marginTop: '4px' }}>
        {value}
      </div>
    </motion.div>
  );
};

const ControlRow = ({ icon, label, status, isActive, onToggle }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${COLORS.border}` }}>
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <IconBox icon={icon} color={isActive ? COLORS.primary : COLORS.subtext} background={isActive ? '#ECFDF5' : '#F8FAFC'} />
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: COLORS.text }}>{label}</div>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: isActive ? COLORS.primary : COLORS.subtext }}>
          Status: {status}
        </div>
      </div>
    </div>
    <div 
      onClick={onToggle}
      style={{ 
        width: '52px', height: '28px', background: isActive ? COLORS.primary : '#E2E8F0',
        borderRadius: '20px', padding: '3px', cursor: 'pointer', transition: '0.3s'
      }}
    >
      <motion.div 
        animate={{ x: isActive ? 24 : 0 }}
        style={{ width: '22px', height: '22px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
      />
    </div>
  </div>
);

const FAB = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const actions = [
    { icon: Power, label: 'Emergency Stop', color: '#EF4444' },
    { icon: RefreshCw, label: 'Sync Sensors', color: '#3B82F6' }
  ];

  return (
    <div style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
      <AnimatePresence>
        {isOpen && actions.map((action, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ delay: (actions.length - i) * 0.05 }}
            onClick={() => { onAction(action.label); setIsOpen(false); }}
            style={{
              width: 'auto', padding: '12px 16px', borderRadius: '16px', background: 'white',
              border: `1px solid ${COLORS.border}`, color: COLORS.text, fontWeight: 800, fontSize: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}
          >
            <action.icon size={16} color={action.color} />
            {action.label}
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px', height: '56px', borderRadius: '20px', 
          background: COLORS.primary, color: 'white', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 30px rgba(16, 185, 129, 0.4)', cursor: 'pointer'
        }}
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </motion.div>
      </motion.button>
    </div>
  );
};

// ─── MAIN DASHBOARD COMPONENT ─────────────────────────────────────────────

const Dashboard = () => {
  const { 
    sensorData, farmHealthScore, toggleActuator, actuators, ACTUATORS, mqttStatus, user, farmInfo
  } = useApp();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const isPumpActive = actuators ? actuators[ACTUATORS?.PUMP] : false;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const val = (v) => (v !== null && v !== undefined && v !== '---' ? v : null);

  const systemStatus = useMemo(() => ({
    soil: (sensorData.soil?.moisture === null) ? 'Offline' : (sensorData.soil.healthIndex > 70 ? 'Optimal' : 'Warning'),
    water: (sensorData.water?.level === null) ? 'Offline' : (sensorData.water.level > 20 ? 'Optimal' : 'Low'),
    weather: sensorData.weather?.temp === null ? 'Offline' : 'Stable'
  }), [sensorData]);

  const overviewStatus = useMemo(() => ({ 
    soil: systemStatus.soil, 
    water: systemStatus.water, 
    weather: systemStatus.weather, 
    storage: (sensorData.storage?.temp === null) ? 'Offline' : 'Optimal',
    hw: mqttStatus === 'connected' ? 'Online' : 'Offline'
  }), [systemStatus, sensorData, mqttStatus]);

  const handleAction = (label) => {
    if (label === 'Sync Sensors') window.location.reload();
    else alert(`${label} initiated...`);
  };

  return (
    <div style={{ padding: '1.25rem', paddingBottom: '100px', background: COLORS.bg }}>
      
      {/* 🌅 GREETING */}
      <section style={{ marginBottom: '2rem', padding: '0 4pt' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.subtext, margin: 0 }}>
          {(() => {
            const h = currentTime.getHours();
            return h < 12 ? 'Good Morning,' : h < 17 ? 'Good Afternoon,' : h < 21 ? 'Good Evening,' : 'Good Night,';
          })()}
        </h1>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 950, color: COLORS.primary, margin: '4px 0 12px 0', letterSpacing: '-0.04em' }}>
          {user?.name || 'Farmer'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 800 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} color={COLORS.primary} /> Kalyani • Field A-1</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {currentTime.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toLowerCase().replace(' ', '')}
            <Clock size={14} style={{ marginLeft: '4px' }} /> 
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        </div>
      </section>

      <SystemInsightCard healthScore={farmHealthScore} status={systemStatus} />
      <QuickSummaryStrip sensorData={sensorData} />
      <SystemOverviewCard score={farmHealthScore} status={overviewStatus} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <SensorCard title="Soil" value={val(sensorData?.soil?.moisture) ? `${Number(sensorData.soil.moisture).toFixed(1)}%` : '--'} icon={Sprout} color={COLORS.primary} status={val(sensorData?.soil?.moisture) ? "CONNECTED" : "OFFLINE"} onClick={() => navigate('/soil-monitoring')} />
        <SensorCard title="Irrigation" value={val(sensorData?.water?.level) ? `${Number(sensorData.water.level).toFixed(1)}%` : '--'} icon={Droplets} color={COLORS.secondary} status={val(sensorData?.water?.level) ? "CONNECTED" : "OFFLINE"} onClick={() => navigate('/irrigation')} />
        <SensorCard title="Weather" value={val(sensorData?.weather?.temp) ? `${Number(sensorData.weather.temp).toFixed(1)}°C` : '--'} icon={CloudRain} color="#14B8A6" status={val(sensorData?.weather?.temp) ? "CONNECTED" : "OFFLINE"} onClick={() => navigate('/weather')} />
        <SensorCard title="Solar" value={val(sensorData?.solar?.power) ? `${Number(sensorData.solar.power).toFixed(1)}W` : '--'} icon={Sun} color="#F59E0B" status={val(sensorData?.solar?.power) ? "CONNECTED" : "OFFLINE"} onClick={() => navigate('/solar-monitoring')} />
        <SensorCard title="Storage" value={val(sensorData?.storage?.temp) ? `${Number(sensorData.storage.temp).toFixed(1)}°C` : '--'} icon={Archive} color="#8B5CF6" status={val(sensorData?.storage?.temp) ? "CONNECTED" : "OFFLINE"} onClick={() => navigate('/storage-hub')} />
      </div>

      <section style={{ background: '#0F172A', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={18} color="#94A3B8" /><h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>Live Vision</h3></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '0.65rem', fontWeight: 900 }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748B' }} />OFFLINE</div>
        </div>
        <div style={{ height: '140px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8' }}>No Camera Connected</p>
          <button style={{ background: 'white', color: '#0F172A', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>Tap to setup</button>
        </div>
      </section>

      <section style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: COLORS.text, marginBottom: '1.5rem' }}>Active Controls</h3>
        <ControlRow icon={Power} label="Irrigation Pump" status={isPumpActive ? 'ON' : 'OFF'} isActive={isPumpActive} onToggle={() => toggleActuator(ACTUATORS.PUMP)} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><IconBox icon={SettingsIcon} color={COLORS.subtext} background="#F8FAFC" /><div><div style={{ fontSize: '0.85rem', fontWeight: 800, color: COLORS.text }}>System Mode</div><div style={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.primary }}>AUTOMATED MODE</div></div></div>
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '10px', padding: '4px' }}>
            <button style={{ padding: '6px 12px', borderRadius: '7px', border: 'none', background: 'white', color: COLORS.primary, fontSize: '0.65rem', fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>AUTO</button>
            <button style={{ padding: '6px 12px', borderRadius: '7px', border: 'none', background: 'transparent', color: COLORS.subtext, fontSize: '0.65rem', fontWeight: 900 }}>MANUAL</button>
          </div>
        </div>
      </section>

      <FAB onAction={handleAction} />

      <footer style={{ textAlign: 'center', paddingBottom: '20px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase' }}>System Online • v{farmInfo.version} • Sync: 2s ago</div>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Dashboard;
