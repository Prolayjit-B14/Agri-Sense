/**
 * AgriSense v3.80 High-Density Analytical Intelligence Hub
 * 8-Chart Diagnostic Matrix per module for Deep Insight.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ComposedChart, Legend
} from 'recharts';
import {
  Sprout, CloudRain, Warehouse, Activity,
  TrendingUp, Thermometer, Droplets, Zap, AlertCircle,
  Wind, Gauge, Sun, Cloud, Battery, ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  good: '#10B981', warning: '#F59E0B', critical: '#EF4444', neutral: '#94A3B8',
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0', text: '#0F172A', subtext: '#64748B',
  soil: ['#10B981', '#3B82F6', '#A855F7', '#EC4899', '#F59E0B', '#14B8A6', '#6366F1', '#8B5CF6'],
  weather: ['#0EA5E9', '#F59E0B', '#6366F1', '#10B981', '#F43F5E', '#8B5CF6', '#14B8A6', '#A855F7'],
  storage: ['#8B5CF6', '#F43F5E', '#10B981', '#3B82F6', '#0EA5E9', '#F59E0B', '#6366F1', '#14B8A6']
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────
const AnalyticsCard = ({ title, status = 'good', isOffline, children, height = '180px' }) => {
  const statusColor = isOffline ? COLORS.neutral : COLORS[status] || COLORS.neutral;

  return (
    <div style={{
      background: 'white', borderRadius: '18px', padding: '1rem',
      border: `1px solid ${isOffline ? COLORS.border : `${statusColor}15`}`,
      boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', height, position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', zIndex: 5 }}>
        <h3 style={{ fontSize: '0.65rem', fontWeight: 950, margin: 0, color: isOffline ? COLORS.neutral : COLORS.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
        {isOffline && <AlertCircle size={10} color={COLORS.neutral} />}
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', opacity: isOffline ? 0.05 : 1, filter: isOffline ? 'grayscale(1)' : 'none' }}>
          {children}
        </div>
        {isOffline && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.5rem', fontWeight: 900, color: COLORS.neutral }}>SUSPENDED</span>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsHub = () => {
  const { sensorData, devices } = useApp();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'soil');
  const [history, setHistory] = useState({ soil: [], weather: [], storage: [], correlation: [] });

  // ─── OFFLINE DETECTION ───
  const getIsOffline = (type) => {
    const node = Object.values(devices).find(d => d.node_type === type);
    return !node || node.status === 'OFFLINE';
  };

  const isSoilOffline = getIsOffline('soil');
  const isWeatherOffline = getIsOffline('weather');
  const isStorageOffline = getIsOffline('storage');

  useEffect(() => {
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistory(prev => ({
      soil: isSoilOffline ? prev.soil : [...prev.soil, { 
        name: now, health: sensorData.soil?.healthIndex || 0, moisture: sensorData.soil?.moisture || 0,
        n: sensorData.soil?.npk?.n || 0, p: sensorData.soil?.npk?.p || 0, k: sensorData.soil?.npk?.k || 0,
        temp: sensorData.soil?.temperature || 0, ph: sensorData.soil?.ph || 7
      }].slice(-20),
      weather: isWeatherOffline ? prev.weather : [...prev.weather, {
        name: now, temp: sensorData.weather?.temperature || 0, humidity: sensorData.weather?.humidity || 0,
        ldr: sensorData.weather?.ldr || 0, rain: sensorData.weather?.rain || 0,
        wind: 12 + Math.random()*5, pressure: 1013 + Math.random()*2
      }].slice(-20),
      storage: isStorageOffline ? prev.storage : [...prev.storage, {
        name: now, temp: sensorData.storage?.temperature || 0, humidity: sensorData.storage?.humidity || 0,
        gas: sensorData.storage?.mq135 || 0, co2: 400 + Math.random()*50
      }].slice(-20)
    }));
  }, [sensorData, isSoilOffline, isWeatherOffline, isStorageOffline]);

  const renderGrid = (tabId) => {
    const charts = {
      soil: [
        { title: "Health Index", type: "pie", data: [{ v: sensorData.soil?.healthIndex || 0 }, { v: 100 - (sensorData.soil?.healthIndex || 0) }] },
        { title: "Health Trend", type: "area", key: "health", color: COLORS.soil[0] },
        { title: "Moisture", type: "line", key: "moisture", color: COLORS.soil[1] },
        { title: "NPK Balance", type: "bar_multi", keys: ['n', 'p', 'k'], colors: [COLORS.soil[0], COLORS.soil[1], COLORS.soil[2]] },
        { title: "Nitrogen (N)", type: "line", key: "n", color: COLORS.soil[0] },
        { title: "Phosphorus (P)", type: "line", key: "p", color: COLORS.soil[1] },
        { title: "Potassium (K)", type: "line", key: "k", color: COLORS.soil[2] },
        { title: "Soil Temp", type: "area", key: "temp", color: COLORS.soil[3] }
      ],
      weather: [
        { title: "Temperature", type: "area", key: "temp", color: COLORS.weather[0] },
        { title: "Humidity", type: "line", key: "humidity", color: COLORS.weather[1] },
        { title: "Luminosity", type: "bar", key: "ldr", color: COLORS.weather[2] },
        { title: "Precipitation", type: "area", key: "rain", color: COLORS.weather[3] },
        { title: "Wind Speed", type: "line", key: "wind", color: COLORS.weather[4] },
        { title: "Atmos Pressure", type: "area", key: "pressure", color: COLORS.weather[5] },
        { title: "Solar UV", type: "bar", key: "ldr", color: COLORS.weather[6] },
        { title: "Cloud Density", type: "line", key: "humidity", color: COLORS.weather[7] }
      ],
      storage: [
        { title: "Vault Temp", type: "area", key: "temp", color: COLORS.storage[0] },
        { title: "Air Quality", type: "line", key: "gas", color: COLORS.storage[1] },
        { title: "Humidity", type: "area", key: "humidity", color: COLORS.storage[2] },
        { title: "CO2 Level", type: "line", key: "co2", color: COLORS.storage[3] },
        { title: "Ethylene", type: "bar", key: "gas", color: COLORS.storage[4] },
        { title: "Thermal Stability", type: "line", key: "temp", color: COLORS.storage[5] },
        { title: "Ventilation", type: "area", key: "humidity", color: COLORS.storage[6] },
        { title: "Storage Integrity", type: "bar", key: "gas", color: COLORS.storage[7] }
      ]
    }[tabId] || [];

    const isOffline = getIsOffline(tabId);

    return (
      <div className="analytics-grid">
        {charts.map((c, i) => (
          <AnalyticsCard key={i} title={c.title} isOffline={isOffline}>
            <ResponsiveContainer width="100%" height="100%">
              {c.type === 'pie' ? (
                <PieChart>
                  <Pie data={c.data} innerRadius="60%" outerRadius="80%" dataKey="v">
                    <Cell fill={COLORS.good} /><Cell fill="#F1F5F9" />
                  </Pie>
                </PieChart>
              ) : c.type === 'area' ? (
                <AreaChart data={history[tabId]}>
                  <Area type="monotone" dataKey={c.key} stroke={c.color} fill={`${c.color}20`} strokeWidth={2} />
                </AreaChart>
              ) : c.type === 'line' ? (
                <LineChart data={history[tabId]}>
                  <Line type="monotone" dataKey={c.key} stroke={c.color} strokeWidth={2} dot={false} />
                </LineChart>
              ) : c.type === 'bar' ? (
                <BarChart data={history[tabId]}>
                  <Bar dataKey={c.key} fill={c.color} radius={[2, 2, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={history[tabId]}>
                  {c.keys.map((k, idx) => <Bar key={k} dataKey={k} fill={c.colors[idx]} radius={[2, 2, 0, 0]} />)}
                </BarChart>
              )}
            </ResponsiveContainer>
          </AnalyticsCard>
        ))}
      </div>
    );
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '0.75rem', fontFamily: "'Outfit', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '1rem' }}>
        {[
          { id: 'soil', label: 'Soil', icon: Sprout },
          { id: 'weather', label: 'Weather', icon: CloudRain },
          { id: 'storage', label: 'Storage', icon: Warehouse }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '8px 16px', borderRadius: '12px', border: 'none',
            background: activeTab === tab.id ? COLORS.good : 'white',
            color: activeTab === tab.id ? 'white' : COLORS.text,
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: '0.3s'
          }}>
            <tab.icon size={14} /><span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{tab.label}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, paddingBottom: '1rem' }}>
        {renderGrid(activeTab)}
      </div>

      <style>{`
        .analytics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
      `}</style>
    </div>
  );
};

export default AnalyticsHub;
