/**
 * AgriSense v3.85 High-Density Analytical Intelligence Hub
 * 8-Chart Diagnostic Matrix per module for Deep Insight.
 * Fixed: Synchronized with global sensor history for immediate graph rendering.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Sprout, CloudRain, Warehouse, AlertCircle
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
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
  const { sensorData, devices, sensorHistory } = useApp();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'soil');

  // ─── PROCESS GLOBAL HISTORY INTO CATEGORIZED TRENDS ───
  const historyData = useMemo(() => {
    return {
      soil: sensorHistory.map(entry => ({
        name: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        health: entry.soil?.healthIndex || 0, moisture: entry.soil?.moisture || 0,
        n: entry.soil?.npk?.n || 0, p: entry.soil?.npk?.p || 0, k: entry.soil?.npk?.k || 0,
        temp: entry.soil?.temperature || 0, ph: entry.soil?.ph || 0
      })),
      weather: sensorHistory.map(entry => ({
        name: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temp: entry.weather?.temperature || 0, humidity: entry.weather?.humidity || 0,
        ldr: entry.weather?.ldr || 0, rain: entry.weather?.rain || 0,
        wind: entry.weather?.windSpeed || 0, pressure: entry.weather?.pressure || 0
      })),
      storage: sensorHistory.map(entry => ({
        name: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temp: entry.storage?.temperature || 0, humidity: entry.storage?.humidity || 0,
        gas: entry.storage?.mq135 || 0, co2: entry.storage?.co2 || 0
      }))
    };
  }, [sensorHistory]);

  const getIsOffline = (type) => {
    const node = Object.values(devices).find(d => d.node_type === type);
    return !node || node.status === 'OFFLINE';
  };

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
    const tabData = historyData[tabId] || [];

    return (
      <div className="analytics-grid">
        {charts.map((c, i) => (
          <AnalyticsCard key={i} title={c.title} isOffline={isOffline}>
            <ResponsiveContainer width="100%" height="100%">
              {c.type === 'pie' ? (
                <PieChart>
                  <Pie data={c.data} innerRadius="60%" outerRadius="80%" dataKey="v" isAnimationActive={false}>
                    <Cell fill={COLORS.good} /><Cell fill="#F1F5F9" />
                  </Pie>
                </PieChart>
              ) : c.type === 'area' ? (
                <AreaChart data={tabData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <Area type="monotone" dataKey={c.key} stroke={c.color} fill={`${c.color}20`} strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              ) : c.type === 'line' ? (
                <LineChart data={tabData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <Line type="monotone" dataKey={c.key} stroke={c.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              ) : c.type === 'bar' ? (
                <BarChart data={tabData}>
                  <Bar dataKey={c.key} fill={c.color} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                </BarChart>
              ) : (
                <BarChart data={tabData}>
                  {c.keys.map((k, idx) => <Bar key={k} dataKey={k} fill={c.colors[idx]} radius={[2, 2, 0, 0]} isAnimationActive={false} />)}
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
