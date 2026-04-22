/**
 * AgriSense v3.50 Definitive 2x2 Grid-Analytics Hub
 * Strict 2 Columns x 2 Rows Matrix, Zero-Lag Stabilization, and Live Telemetry.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceArea 
} from 'recharts';
import { 
  Sprout, CloudRain, Warehouse, AlertCircle 
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
const AnalyticsCard = ({ title, status = 'good', isOffline, children }) => {
  const statusColor = isOffline ? COLORS.neutral : COLORS[status] || COLORS.neutral;

  return (
    <div style={{ 
      background: 'white', borderRadius: '16px', padding: '1.2rem', 
      border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', height: '100%', minHeight: '280px',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', zIndex: 2 }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 950, margin: 0, color: isOffline ? COLORS.neutral : COLORS.text }}>{title}</h3>
        <div style={{ padding: '3px 8px', borderRadius: '6px', background: `${statusColor}15`, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: statusColor }} />
          <span style={{ fontSize: '0.55rem', fontWeight: 900, color: statusColor }}>{isOffline ? 'OFFLINE' : status.toUpperCase()}</span>
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative', opacity: isOffline ? 0.3 : 1 }}>
        {children}
      </div>

      {isOffline && (
        <div style={{ 
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(1px)', zIndex: 5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: COLORS.neutral, fontWeight: 950, fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            <AlertCircle size={12} /> DISCONNECTED
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsHub = () => {
  const { sensorData } = useApp();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'soil');
  const [history, setHistory] = useState({ soil: [], weather: [], storage: [] });

  // Update activeTab if location state changes
  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab);
  }, [location.state]);

  // ─── OFFLINE DETECTION ───
  const isSoilOffline = !sensorData.soil || sensorData.soil.moisture === '---';
  const isWeatherOffline = !sensorData.weather || sensorData.weather.temperature === '---';
  const isStorageOffline = !sensorData.storage || sensorData.storage.temperature === '---';

  // ─── ROLLING HISTORY ENGINE (STABILIZED) ───
  useEffect(() => {
    const timer = setInterval(() => {
      setHistory(prev => {
        const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return {
          soil: [...prev.soil, {
            name: now, health: 85, moisture: parseFloat(sensorData.soil?.moisture) || 0,
            n: parseInt(sensorData.soil?.npk?.n) || 0, p: parseInt(sensorData.soil?.npk?.p) || 0, k: parseInt(sensorData.soil?.npk?.k) || 0
          }].slice(-15),
          weather: [...prev.weather, {
            name: now, stability: 92, temp: parseFloat(sensorData.weather?.temperature) || 0, humidity: parseFloat(sensorData.weather?.humidity) || 0, ldr: parseFloat(sensorData.weather?.ldr) || 0
          }].slice(-15),
          storage: [...prev.storage, {
            name: now, stability: 96, gas: parseFloat(sensorData.storage?.mq135) || 0, temp: parseFloat(sensorData.storage?.temperature) || 0, humidity: parseFloat(sensorData.storage?.humidity) || 0, aqi: (parseFloat(sensorData.storage?.mq135)/10) || 0
          }].slice(-15)
        };
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [sensorData]);

  const currentData = activeTab === 'soil' ? history.soil : activeTab === 'weather' ? history.weather : history.storage;

  const TABS = [
    { id: 'soil', name: 'Soil Analytics', icon: Sprout },
    { id: 'weather', name: 'Weather Hub', icon: CloudRain },
    { id: 'storage', name: 'Storage Monitor', icon: Warehouse }
  ];

  const renderSoilTab = () => (
    <div className="analytics-grid">
      <AnalyticsCard title="Health Index" isOffline={isSoilOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ v: 85 }, { v: 15 }]} innerRadius={50} outerRadius={70} dataKey="v" isAnimationActive={false}>
              <Cell fill={COLORS.good} /><Cell fill={COLORS.bg} />
            </Pie>
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '1.2rem', fontWeight: 950, fill: COLORS.text }}>85%</text>
          </PieChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Stability Trend" isOffline={isSoilOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.bg} />
            <XAxis dataKey="name" hide /><YAxis hide domain={[0, 100]} />
            <Line type="monotone" dataKey="health" stroke={COLORS.good} strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Moisture Flow" isOffline={isSoilOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData}>
            <ReferenceArea y1={30} y2={50} fill={`${COLORS.good}10`} />
            <XAxis dataKey="name" hide /><YAxis hide domain={[0, 100]} />
            <Area type="monotone" dataKey="moisture" stroke={COLORS.soil[1]} fill={`${COLORS.soil[1]}15`} strokeWidth={3} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Nutrient Matrix" isOffline={isSoilOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData}>
            <XAxis dataKey="name" hide /><YAxis hide domain={[0, 255]} />
            <Bar dataKey="n" fill={COLORS.soil[0]} isAnimationActive={false} radius={[2, 2, 0, 0]} />
            <Bar dataKey="p" fill={COLORS.soil[2]} isAnimationActive={false} radius={[2, 2, 0, 0]} />
            <Bar dataKey="k" fill={COLORS.soil[3]} isAnimationActive={false} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </AnalyticsCard>
    </div>
  );

  const renderWeatherTab = () => (
    <div className="analytics-grid">
      <AnalyticsCard title="Weather Score" isOffline={isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ v: 92 }, { v: 8 }]} innerRadius={50} outerRadius={70} dataKey="v" isAnimationActive={false}>
              <Cell fill={COLORS.good} /><Cell fill={COLORS.bg} />
            </Pie>
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '1.2rem', fontWeight: 950 }}>92%</text>
          </PieChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Temperature Flow" isOffline={isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData}>
            <XAxis hide /><YAxis hide domain={[0, 60]} />
            <Line type="monotone" dataKey="temp" stroke={COLORS.critical} strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Humidity Trends" isOffline={isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData}>
            <YAxis hide domain={[0, 100]} />
            <Area type="monotone" dataKey="humidity" fill={`${COLORS.weather[0]}15`} stroke={COLORS.weather[0]} strokeWidth={3} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Light (LDR)" isOffline={isWeatherOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData}>
            <YAxis hide domain={[0, 1024]} />
            <Bar dataKey="ldr" fill={COLORS.weather[1]} isAnimationActive={false} radius={[2, 2, 0, 0]} />
          </BarChart>
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
      <AnalyticsCard title="Gas (MQ135) Trend" status="warning" isOffline={isStorageOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData}>
            <XAxis hide /><YAxis hide domain={[0, 1024]} />
            <Line type="monotone" dataKey="gas" stroke={COLORS.storage[1]} strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="Climate Sync" isOffline={isStorageOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData}>
            <XAxis hide /><YAxis hide domain={[0, 100]} />
            <Line type="monotone" dataKey="temp" stroke={COLORS.critical} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="humidity" stroke={COLORS.weather[0]} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsCard>
      <AnalyticsCard title="AQI Level" isOffline={isStorageOffline}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData}>
            <YAxis hide domain={[0, 100]} />
            <Bar dataKey="aqi" fill={COLORS.storage[0]} isAnimationActive={false} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </AnalyticsCard>
    </div>
  );

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '1rem', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', background: 'white', padding: '6px', borderRadius: '16px', border: `1px solid ${COLORS.border}` }}>
        {TABS.map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
              background: activeTab === tab.id ? COLORS.good : 'transparent',
              color: activeTab === tab.id ? 'white' : COLORS.subtext,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              cursor: 'pointer', transition: '0.3s'
            }}
          >
            <tab.icon size={16} />
            <span style={{ fontSize: '0.7rem', fontWeight: 950 }}>{tab.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === 'soil' ? renderSoilTab() : activeTab === 'weather' ? renderWeatherTab() : renderStorageTab()}
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
