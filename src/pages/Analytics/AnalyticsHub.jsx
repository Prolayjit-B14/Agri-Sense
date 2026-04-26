/**
 * AgriSense Pro v17.1.0 High-Density Analytical Intelligence Hub
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
  Sprout, CloudRain, Warehouse, AlertCircle, Download
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
const AnalyticsCard = ({ title, status = 'good', isOffline, children, height = '240px' }) => {
  const statusColor = isOffline ? COLORS.neutral : COLORS[status] || COLORS.neutral;

  return (
    <div style={{
      background: 'white', borderRadius: '18px', padding: '0.65rem',
      border: `1px solid ${isOffline ? COLORS.border : `${statusColor}15`}`,
      boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', height, position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', zIndex: 5 }}>
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

const TIME_RANGES = [
  { id: 'realtime', label: 'Realtime', duration: 5 * 60 * 1000 },
  { id: '1h', label: '1 Hr', duration: 60 * 60 * 1000 },
  { id: '6h', label: '6 Hr', duration: 6 * 60 * 60 * 1000 },
  { id: '1d', label: '1 Day', duration: 24 * 60 * 60 * 1000 },
  { id: '1w', label: '1 Week', duration: 7 * 24 * 60 * 60 * 1000 },
  { id: '1m', label: '1 Month', duration: 30 * 24 * 60 * 60 * 1000 },
];

const AnalyticsHub = () => {
  const { sensorData, devices, sensorHistory } = useApp();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'soil');
  const [timeRange, setTimeRange] = useState(TIME_RANGES[0]);

  // ─── PROCESS GLOBAL HISTORY INTO CATEGORIZED TRENDS ───
  const historyData = useMemo(() => {
    const now = Date.now();
    const startTime = now - timeRange.duration;
    
    const filteredHistory = sensorHistory.filter(entry => entry.timestamp >= startTime);

    return {
      soil: filteredHistory.map(entry => ({
        name: entry.timestamp,
        health: entry.soil?.healthIndex, moisture: entry.soil?.moisture,
        n: entry.soil?.npk?.n, p: entry.soil?.npk?.p, k: entry.soil?.npk?.k,
        temp: entry.soil?.temp, ph: entry.soil?.ph
      })),
      weather: filteredHistory.map(entry => ({
        name: entry.timestamp,
        temp: entry.weather?.temp, humidity: entry.weather?.humidity,
        lightIntensity: entry.weather?.lightIntensity, rainLevel: entry.weather?.rainLevel
      })),
      storage: filteredHistory.map(entry => ({
        name: entry.timestamp,
        temp: entry.storage?.temp, humidity: entry.storage?.humidity,
        mq135: entry.storage?.mq135
      }))
    };
  }, [sensorHistory, timeRange]);

  const getIsOffline = (type) => {
    const node = devices[`${type}_node`];
    const deviceOffline = !node || node.status === 'OFFLINE';
    if (!deviceOffline) return false;
    // Fallback: if sensorHistory has data for this type, it's NOT offline
    if (type === 'soil') return !sensorData?.soil?.moisture && sensorHistory.length === 0;
    if (type === 'weather') return !sensorData?.weather?.temp && sensorHistory.length === 0;
    if (type === 'storage') return !sensorData?.storage?.temp && sensorHistory.length === 0;
    return deviceOffline;
  };

  // 🧠 ANALYTICS ENGINE: Static-Grid Oscilloscope Processor
  const now = Date.now();
  const processedData = useMemo(() => {
    const isRealtime = timeRange.id === 'realtime';
    const processed = {};
    Object.keys(historyData).forEach(tab => {
      const data = historyData[tab] || [];
      if (data.length === 0) {
        processed[tab] = [];
        return;
      }

      const mapped = data.map(entry => ({
        ...entry,
        plotTime: 300 - ((now - entry.name) / 1000)
      }));

      if (isRealtime) {
        // 🚀 EDGE IMMERSION: Extend the line to the absolute start and end of the grid
        const first = mapped[0];
        const last = mapped[mapped.length - 1];
        processed[tab] = [
          { ...first, plotTime: 0 },
          ...mapped,
          { ...last, plotTime: 300 }
        ];
      } else {
        processed[tab] = mapped;
      }
    });
    return processed;
  }, [historyData, timeRange.id, now]);

  const xDomain = timeRange.id === 'realtime' ? [0, 300] : ['dataMin', 'dataMax'];
  const xTicks = timeRange.id === 'realtime' ? [0, 60, 120, 180, 240, 300] : undefined;

  const renderGrid = (tabId) => {
    const charts = {
      soil: [
        { title: "Soil Moisture", type: "line", key: "moisture", color: COLORS.soil[1], minSpread: 10 },
        { title: "Soil pH", type: "line", key: "ph", color: COLORS.soil[4], minSpread: 1.5 },
        { title: "Soil Temp", type: "line", key: "temp", color: COLORS.soil[3], minSpread: 5 },
        { title: "Nitrogen (N)", type: "line", key: "n", color: COLORS.soil[0], minSpread: 10 },
        { title: "Phosphorus (P)", type: "line", key: "p", color: COLORS.soil[1], minSpread: 10 },
        { title: "Potassium (K)", type: "line", key: "k", color: COLORS.soil[2], minSpread: 10 },
        { title: "NPK Balance", type: "line_multi", keys: ['n', 'p', 'k'], colors: [COLORS.soil[0], COLORS.soil[1], COLORS.soil[2]], minSpread: 20 }
      ],
      weather: [
        { title: "Ambient Temp", type: "line", key: "temp", color: COLORS.weather[0], minSpread: 5 },
        { title: "Humidity", type: "line", key: "humidity", color: COLORS.weather[1], minSpread: 10 },
        { title: "Light (LDR)", type: "line", key: "lightIntensity", color: COLORS.weather[2], minSpread: 100 },
        { title: "Rain Level", type: "line", key: "rainLevel", color: COLORS.weather[3], minSpread: 10 }
      ],
      storage: [
        { title: "Storage Temp", type: "line", key: "temp", color: COLORS.storage[0], minSpread: 5 },
        { title: "Storage Humidity", type: "line", key: "humidity", color: COLORS.storage[1], minSpread: 10 },
        { title: "MQ135 (Gas)", type: "line", key: "mq135", color: COLORS.storage[2], minSpread: 50 }
      ]
    }[tabId] || [];

    const isOffline = getIsOffline(tabId);
    const tabData = processedData[tabId] || [];
    const isRealtime = timeRange.id === 'realtime';

    // 🧠 HYBRID ENGINE: Calculated Grid Time for Symmetry + Real Tooltip Time for Accuracy
    // 🧠 HARDWARE-LOCKED CROSSING ENGINE: Find the real timestamp of the data point crossing the grid line
    const formatXLabel = (v) => {
      if (!isRealtime) {
        const d = new Date(v);
        if (timeRange.duration <= 24 * 60 * 60 * 1000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
      
      if (!tabData || tabData.length === 0) return '';
      
      // Find the specific data point currently 'crossing' this vertical grid line
      let closest = tabData[0];
      let minDiff = Infinity;
      for (let entry of tabData) {
        const diff = Math.abs((entry.plotTime || 0) - v);
        if (diff < minDiff) {
          minDiff = diff;
          closest = entry;
        }
      }
      
      if (!closest || minDiff > 10) return ''; // Only show if data is reasonably close to the grid line
      const d = new Date(closest.name);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    };

    const formatTooltip = (v, name) => {
      // Tooltip always shows the REAL hardware timestamp of the specific data point
      const ts = isRealtime ? name : v;
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    };

    return (
      <div className="analytics-grid">
        {charts.map((c, i) => (
          <AnalyticsCard key={i} title={c.title} isOffline={isOffline}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tabData} margin={{ top: 15, right: 35, left: 10, bottom: 25 }}>
                <CartesianGrid stroke="#E2E8F0" vertical={true} horizontal={true} strokeOpacity={0.8} />
                <XAxis 
                  dataKey={isRealtime ? "plotTime" : "name"} 
                  type="number"
                  domain={xDomain}
                  ticks={xTicks}
                  tickFormatter={formatXLabel}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 800, fill: COLORS.text, dy: 10 }} 
                  interval={0}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: COLORS.text, dx: -5 }}
                  tickFormatter={(v) => Math.round(v)}
                  domain={['auto', 'auto']}
                  width={40}
                  nice={true}
                  tickCount={6}
                />
                <Tooltip 
                  labelFormatter={(v, items) => {
                    const name = items?.[0]?.payload?.name;
                    return formatTooltip(v, name);
                  }}
                  contentStyle={{ 
                    borderRadius: '16px', border: 'none', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)', 
                    fontSize: '0.8rem', fontWeight: 900,
                    padding: '12px',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)'
                  }} 
                  itemStyle={{ padding: '2px 0' }}
                  cursor={{ stroke: COLORS.good, strokeWidth: 2 }}
                />
                {c.type === 'line_multi' && <Legend iconType="circle" wrapperStyle={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', paddingTop: '10px' }} />}
                
                {c.type === 'line_multi' ? (
                  c.keys.map((k, idx) => (
                    <Line 
                      key={k} 
                      type="monotone" 
                      dataKey={k} 
                      stroke={c.colors[idx]} 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                      isAnimationActive={false}
                      connectNulls={true}
                      name={k.toUpperCase()}
                    />
                  ))
                ) : (
                  <Line 
                    type="monotone" 
                    dataKey={c.key} 
                    stroke={c.color} 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                )}
              </LineChart>
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

      {/* ⏱️ TIME RANGE SELECTOR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }} className="no-scrollbar">
          {TIME_RANGES.map(range => {
            const isSelected = timeRange.id === range.id;
            return (
              <button
                key={range.id}
                onClick={() => setTimeRange(range)}
                style={{
                  whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: '100px',
                  border: `1.5px solid ${isSelected ? COLORS.good : '#E2E8F0'}`,
                  background: isSelected ? `${COLORS.good}10` : 'transparent',
                  color: isSelected ? COLORS.good : COLORS.subtext,
                  fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer',
                  transition: '0.2s', outline: 'none'
                }}
              >
                {range.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(sensorHistory, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `AgriSense_History_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
          }}
          style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: '#FFFFFF', border: `1.5px solid #E2E8F0`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <Download size={14} color={COLORS.text} />
        </button>
      </div>

      <div style={{ flex: 1, paddingBottom: '1rem' }}>
        {renderGrid(activeTab)}
      </div>

      <style>{`
        .analytics-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
      `}</style>
    </div>
  );
};

export default AnalyticsHub;
