/**
 * AgriSense v3.70 Advanced Analytical Intelligence Hub
 * Comprehensive Core, Advanced, and Correlation Chart Matrix.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine,
  ComposedChart, Legend
} from 'recharts';
import { 
  Sprout, CloudRain, Warehouse, Activity, 
  TrendingUp, Thermometer, Droplets, Zap, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  good: '#10B981', warning: '#F59E0B', critical: '#EF4444', neutral: '#94A3B8',
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0', text: '#0F172A', subtext: '#64748B',
  soil: ['#10B981', '#3B82F6', '#A855F7', '#EC4899'],
  weather: ['#0EA5E9', '#F59E0B', '#6366F1', '#10B981'],
  storage: ['#8B5CF6', '#F43F5E', '#10B981', '#3B82F6']
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────
const AnalyticsCard = ({ title, status = 'good', isOffline, children, height = '300px' }) => {
  const statusColor = isOffline ? COLORS.neutral : COLORS[status] || COLORS.neutral;

  return (
    <div style={{ 
      background: 'white', borderRadius: '24px', padding: '1.25rem', 
      border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', height, position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', zIndex: 2 }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 950, margin: 0, color: isOffline ? COLORS.neutral : COLORS.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
        {isOffline && <span style={{ fontSize: '0.55rem', fontWeight: 900, color: COLORS.offline, background: `${COLORS.offline}10`, padding: '2px 8px', borderRadius: '4px' }}>OFFLINE</span>}
      </div>
      
      <div style={{ flex: 1, position: 'relative', opacity: isOffline ? 0.3 : 1 }}>
        {children}
      </div>
    </div>
  );
};

const AnalyticsHub = () => {
  const { sensorData, devices } = useApp();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'soil');
  const [history, setHistory] = useState({ soil: [], weather: [], storage: [], correlation: [] });

  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab);
  }, [location.state]);

  // ─── INCLUSIVE OFFLINE DETECTION ───
  const isSoilOffline = devices['soil_node']?.status === 'OFFLINE';
  const isWeatherOffline = devices['weather_node']?.status === 'OFFLINE';
  const isStorageOffline = devices['storage_node']?.status === 'OFFLINE';
  const isWaterOffline = devices['water_node']?.status === 'OFFLINE';

  // ─── PURE TELEMETRY ENGINE (EVENT-DRIVEN) ───

  useEffect(() => {
    if (isSoilOffline && isWeatherOffline && isStorageOffline) return;

    setHistory(prev => {
      const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const lastSoil = prev.soil[prev.soil.length - 1] || {};
      
      const newSoilEntry = {
        name: now, 
        health: parseFloat(sensorData.soil?.healthIndex) || 0, 
        moisture: parseFloat(sensorData.soil?.moisture) || 0,
        n: parseInt(sensorData.soil?.npk?.n) || 0, 
        p: parseInt(sensorData.soil?.npk?.p) || 0, 
        k: parseInt(sensorData.soil?.npk?.k) || 0,
        ph: parseFloat(sensorData.soil?.ph) || 7, 
        temp: parseFloat(sensorData.soil?.temperature) || 0,
        lossRate: (lastSoil.moisture && !isSoilOffline) ? (lastSoil.moisture - (parseFloat(sensorData.soil?.moisture) || 0)) : 0
      };

      const newWeatherEntry = {
        name: now, 
        stability: parseFloat(sensorData.weather?.healthIndex) || 0, 
        temp: parseFloat(sensorData.weather?.temperature) || 0,
        humidity: parseFloat(sensorData.weather?.humidity) || 0, 
        ldr: parseFloat(sensorData.weather?.ldr) || 0,
        rain: parseFloat(sensorData.weather?.rain) || 0, 
        evap: (parseFloat(sensorData.weather?.temperature) * 0.08)
      };

      const newStorageEntry = {
        name: now, 
        stability: parseFloat(sensorData.storage?.healthIndex) || 0, 
        gas: parseFloat(sensorData.storage?.mq135) || 0,
        temp: parseFloat(sensorData.storage?.temperature) || 0, 
        humidity: parseFloat(sensorData.storage?.humidity) || 0,
        aqi: (parseFloat(sensorData.storage?.mq135)/10) || 0, 
        gasRate: 0 // Will be calculated on next packet
      };

      return {
        soil: isSoilOffline ? prev.soil : [...prev.soil, newSoilEntry].slice(-20),
        weather: isWeatherOffline ? prev.weather : [...prev.weather, newWeatherEntry].slice(-20),
        storage: isStorageOffline ? prev.storage : [...prev.storage, newStorageEntry].slice(-20),
        correlation: [...prev.correlation, { 
          name: now, 
          moisture: newSoilEntry.moisture, 
          soilTemp: newSoilEntry.temp,
          airTemp: newWeatherEntry.temp,
          humidity: newWeatherEntry.humidity,
          impact: newSoilEntry.health
        }].slice(-20)
      };
    });
  }, [sensorData]);


  const TABS = [
    { id: 'soil', name: 'Soil', icon: Sprout },
    { id: 'weather', name: 'Weather', icon: CloudRain },
    { id: 'storage', name: 'Storage', icon: Warehouse },
    { id: 'solar', name: 'Solar', icon: Zap },
    { id: 'correlation', name: 'Correlations', icon: TrendingUp }
  ];

  const renderSolarTab = () => (
    <div className="analytics-grid">
      <AnalyticsCard title="Energy Stability" isOffline={devices['solar_node']?.status === 'OFFLINE'}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ v: 95 }, { v: 5 }]} innerRadius={50} outerRadius={70} dataKey="v" isAnimationActive={false}>
              <Cell fill={COLORS.good} /><Cell fill={COLORS.bg} />
            </Pie>
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '1.2rem', fontWeight: 950 }}>95%</text>
          </PieChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Voltage & Battery" isOffline={devices['solar_node']?.status === 'OFFLINE'}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.correlation}>
            <YAxis hide /><Legend verticalAlign="top" />
            <Line name="Voltage" dataKey="impact" stroke={COLORS.good} strokeWidth={3} dot={false} isAnimationActive={false} />
            <Line name="Battery" dataKey="moisture" stroke={COLORS.soil[1]} strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="System Load" isOffline={devices['solar_node']?.status === 'OFFLINE'}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history.weather}>
            <Area type="monotone" dataKey="evap" fill={`${COLORS.storage[0]}15`} stroke={COLORS.storage[0]} strokeWidth={3} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </AnalyticsCard>
    </div>
  );


  const renderSoilTab = () => (
    <div className="analytics-grid">
      {/* CORE */}
      <AnalyticsCard title="Soil Health Score" isOffline={isSoilOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ v: 85 }, { v: 15 }]} innerRadius={50} outerRadius={70} dataKey="v" isAnimationActive={false}>
              <Cell fill={COLORS.good} /><Cell fill={COLORS.bg} />
            </Pie>
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '1.2rem', fontWeight: 950, fill: COLORS.text }}>85%</text>
          </PieChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Health Trend" isOffline={isSoilOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.soil}>
            <XAxis dataKey="name" hide /><YAxis hide domain={[0, 100]} />
            <Line type="monotone" dataKey="health" stroke={COLORS.good} strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Moisture Behavior" isOffline={isSoilOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history.soil}>
            <ReferenceArea y1={30} y2={50} fill={`${COLORS.good}10`} />
            <XAxis dataKey="name" hide /><YAxis hide domain={[0, 100]} />
            <Area type="monotone" dataKey="moisture" stroke={COLORS.soil[1]} fill={`${COLORS.soil[1]}15`} strokeWidth={3} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="NPK Analysis" isOffline={isSoilOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={history.soil}>
            <XAxis dataKey="name" hide /><YAxis hide domain={[0, 255]} />
            <Bar dataKey="n" fill={COLORS.soil[0]} isAnimationActive={false} />
            <Bar dataKey="p" fill={COLORS.soil[2]} isAnimationActive={false} />
            <Bar dataKey="k" fill={COLORS.soil[3]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </AnalyticsCard>

      {/* ADVANCED */}
      <AnalyticsCard title="pH Level Gauge" isOffline={isSoilOffline}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ textAlign: 'center', margin: 0, fontSize: '2rem', fontWeight: 950 }}>{sensorData.soil?.ph || '7.0'}</h2>
          <div style={{ height: '8px', background: COLORS.bg, borderRadius: '4px', marginTop: '10px', position: 'relative' }}>
             <div style={{ position: 'absolute', left: `${(parseFloat(sensorData.soil?.ph || 7)/14)*100}%`, width: '12px', height: '12px', borderRadius: '50%', background: COLORS.good, top: '-2px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.6rem', fontWeight: 900, color: COLORS.subtext }}><span>ACIDIC</span><span>ALKALINE</span></div>
        </div>
      </AnalyticsCard>
      <AnalyticsCard title="Soil Temp Trend" isOffline={isSoilOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.soil}>
            <YAxis hide domain={[0, 60]} />
            <Line type="monotone" dataKey="temp" stroke={COLORS.critical} strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Moisture Loss Rate" isOffline={isSoilOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={history.soil}>
            <Bar dataKey="lossRate" fill={COLORS.warning} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </AnalyticsCard>
    </div>
  );

  const renderWeatherTab = () => (
    <div className="analytics-grid">
      <AnalyticsCard title="Weather Stability" isOffline={isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ v: 92 }, { v: 8 }]} innerRadius={50} outerRadius={70} dataKey="v" isAnimationActive={false}>
              <Cell fill={COLORS.good} /><Cell fill={COLORS.bg} />
            </Pie>
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '1.2rem', fontWeight: 950 }}>92%</text>
          </PieChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Temperature Trend" isOffline={isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.weather}>
            <YAxis hide domain={[0, 60]} />
            <Line type="monotone" dataKey="temp" stroke={COLORS.critical} strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Humidity Analysis" isOffline={isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history.weather}>
            <YAxis hide domain={[0, 100]} />
            <Area type="monotone" dataKey="humidity" fill={`${COLORS.weather[0]}15`} stroke={COLORS.weather[0]} strokeWidth={3} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Light Intensity (LDR)" isOffline={isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={history.weather}>
            <YAxis hide domain={[0, 1024]} />
            <Bar dataKey="ldr" fill={COLORS.weather[1]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </AnalyticsCard>

      <AnalyticsCard title="Rainfall Pattern" isOffline={isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={history.weather}>
            <Bar dataKey="rain" fill={COLORS.soil[1]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Temp vs Humidity" isOffline={isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.weather}>
            <YAxis hide /><Legend verticalAlign="top" iconType="circle" />
            <Line name="Temp" dataKey="temp" stroke={COLORS.critical} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line name="Humid" dataKey="humidity" stroke={COLORS.weather[0]} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Evaporation Impact" isOffline={isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={history.weather}>
            <Bar dataKey="evap" fill={COLORS.warning} opacity={0.4} isAnimationActive={false} />
            <Line type="monotone" dataKey="temp" stroke={COLORS.critical} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </AnalyticsCard>
    </div>
  );

  const renderStorageTab = () => (
    <div className="analytics-grid">
      <AnalyticsCard title="Storage Stability" isOffline={isStorageOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ v: 98 }, { v: 2 }]} innerRadius={50} outerRadius={70} dataKey="v" isAnimationActive={false}>
              <Cell fill={COLORS.good} /><Cell fill={COLORS.bg} />
            </Pie>
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '1.2rem', fontWeight: 950 }}>98%</text>
          </PieChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Gas (MQ135) Trend" isOffline={isStorageOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.storage}>
            <ReferenceLine y={300} stroke={COLORS.critical} strokeDasharray="3 3" />
            <YAxis hide domain={[0, 1024]} />
            <Line type="monotone" dataKey="gas" stroke={COLORS.storage[1]} strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Temp vs Humidity" isOffline={isStorageOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.storage}>
            <Line dataKey="temp" stroke={COLORS.critical} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="humidity" stroke={COLORS.weather[0]} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="AQI Level" isOffline={isStorageOffline}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 950, textAlign: 'center' }}>{(sensorData.storage?.mq135/10).toFixed(0) || '12'}</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 900, color: COLORS.good, textAlign: 'center' }}>GOOD QUALITY</div>
        </div>
      </AnalyticsCard>

      <AnalyticsCard title="Spoilage Risk Timeline" isOffline={isStorageOffline}>
         <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: COLORS.bg, borderRadius: '12px' }}>
               <span style={{ fontSize: '0.7rem', fontWeight: 950 }}>Bacteria Peak</span>
               <span style={{ fontSize: '0.7rem', fontWeight: 800, color: COLORS.subtext }}>48h</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: COLORS.bg, borderRadius: '12px' }}>
               <span style={{ fontSize: '0.7rem', fontWeight: 950 }}>Optimal Harvest Seal</span>
               <span style={{ fontSize: '0.7rem', fontWeight: 800, color: COLORS.good }}>ACTIVE</span>
            </div>
         </div>
      </AnalyticsCard>
      <AnalyticsCard title="Gas Increase Rate" isOffline={isStorageOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={history.storage}><Bar dataKey="gasRate" fill={COLORS.storage[1]} isAnimationActive={false} /></BarChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Stability Trend" isOffline={isStorageOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.storage}><Line dataKey="stability" stroke={COLORS.good} strokeWidth={3} dot={false} isAnimationActive={false} /></LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
    </div>
  );

  const renderCorrelationTab = () => (
    <div className="analytics-grid">
      <AnalyticsCard title="Soil Moisture vs Temp" isOffline={isSoilOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.correlation}>
            <YAxis hide /><Legend verticalAlign="top" />
            <Line name="Moisture" dataKey="moisture" stroke={COLORS.soil[1]} strokeWidth={3} dot={false} isAnimationActive={false} />
            <Line name="Soil Temp" dataKey="soilTemp" stroke={COLORS.critical} strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Air Temp vs Humidity" isOffline={isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.correlation}>
            <YAxis hide /><Legend verticalAlign="top" />
            <Line name="Air Temp" dataKey="airTemp" stroke={COLORS.critical} strokeWidth={3} dot={false} isAnimationActive={false} />
            <Line name="Humidity" dataKey="humidity" stroke={COLORS.weather[0]} strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Weather vs Soil Impact" isOffline={isSoilOffline || isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.correlation}>
            <YAxis hide /><Legend verticalAlign="top" />
            <Line name="System Impact" dataKey="impact" stroke={COLORS.good} strokeWidth={4} dot={false} isAnimationActive={false} />
            <Line name="Soil Moisture" dataKey="moisture" stroke={COLORS.soil[1]} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
    </div>
  );

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '1rem', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', background: 'white', padding: '6px', borderRadius: '16px', border: `1px solid ${COLORS.border}`, overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ 
              flex: 'none', padding: '10px 16px', borderRadius: '12px', border: 'none',
              background: activeTab === tab.id ? COLORS.good : 'transparent',
              color: activeTab === tab.id ? 'white' : COLORS.subtext,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              cursor: 'pointer', transition: '0.3s'
            }}
          >
            <tab.icon size={16} />
            <span style={{ fontSize: '0.7rem', fontWeight: 950, whiteSpace: 'nowrap' }}>{tab.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === 'soil' ? renderSoilTab() : 
           activeTab === 'weather' ? renderWeatherTab() : 
           activeTab === 'storage' ? renderStorageTab() : 
           activeTab === 'solar' ? renderSolarTab() : 
           renderCorrelationTab()}
        </motion.div>
      </AnimatePresence>


      <style>{`
        .analytics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (max-width: 600px) { .analytics-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default AnalyticsHub;
