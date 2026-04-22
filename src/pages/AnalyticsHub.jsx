/**
 * AgriSense v2.8.0 Analytics Hub
 * Pattern-based trend synthesis, forensic telemetry charts, and regional data modeling.
 */

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, Archive, CloudRain, 
  Activity, ArrowRight, LineChart as LineChartIcon 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, Tooltip, BarChart, Bar, Cell, LineChart, Line,
  CartesianGrid
} from 'recharts';

// Context & Utils
import { useApp } from '../context/AppContext';
import * as Engine from '../utils/analyticsEngine';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  soil: '#10B981',
  water: '#3B82F6',
  energy: '#F59E0B',
  weather: '#EF4444',
  storage: '#8B5CF6',
  text: '#1E293B',
  subtext: '#64748B',
  bg: '#F8FAFC',
  border: '#F1F5F9'
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const TrendCard = ({ data }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    style={{ 
      background: 'white', padding: '1.5rem', borderRadius: '28px', 
      marginBottom: '1.5rem', border: `1px solid ${COLORS.border}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: !data.summary ? '#F1F5F9' : `${COLORS.soil}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Activity size={16} color={!data.summary ? '#CBD5E1' : COLORS.soil} />
      </div>
      <h3 style={{ fontSize: '0.8rem', fontWeight: 950, color: COLORS.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Forensic Synthesis</h3>
    </div>
    <p style={{ fontSize: '0.9rem', color: COLORS.text, lineHeight: 1.6, margin: 0, fontWeight: 700 }}>
      {data.summary || "Synthesizing regional telemetry models..."}
    </p>
  </motion.div>
);

const AnalyticsChart = ({ title, type = 'area', data, dataKeys, colors, unit = '', insight }) => {
  const primaryKey = Array.isArray(dataKeys) ? dataKeys[0] : dataKeys;
  const primaryColor = Array.isArray(colors) ? colors[0] : colors;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      style={{ 
        background: 'white', borderRadius: '28px', padding: '1.5rem', 
        marginBottom: '1rem', border: `1px solid ${COLORS.border}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>{title}</h4>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: COLORS.subtext, marginTop: '4px' }}>{insight || "Real-time analysis..."}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
           <span style={{ fontSize: '1.2rem', fontWeight: 950, color: COLORS.text }}>
             {data && data.length > 0 ? (data[data.length - 1][primaryKey] ?? '---') : '---'}
           </span>
           <span style={{ fontSize: '0.7rem', fontWeight: 800, color: COLORS.subtext, marginLeft: '4px' }}>{unit}</span>
        </div>
      </div>

      <div style={{ height: '160px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`grad-${primaryKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis hide dataKey="time" />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '0.75rem', fontWeight: 950 }} labelStyle={{ display: 'none' }} />
              <Area type="monotone" dataKey={primaryKey} stroke={primaryColor} strokeWidth={3} fill={`url(#grad-${primaryKey})`} dot={false} />
            </AreaChart>
          ) : type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis hide dataKey="time" />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '0.75rem', fontWeight: 950 }} labelStyle={{ display: 'none' }} />
              {(Array.isArray(dataKeys) ? dataKeys : [dataKeys]).map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={Array.isArray(colors) ? colors[i] : colors} strokeWidth={3} dot={false} />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data.slice(-15)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis hide />
              <YAxis hide />
              <Bar dataKey={primaryKey} radius={[6, 6, 0, 0]} barSize={20}>
                {data.slice(-15).map((entry, index) => <Cell key={`cell-${index}`} fill={primaryColor} fillOpacity={0.4 + (index * 0.04)} />)}
              </Bar>
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: 'none', fontSize: '0.75rem', fontWeight: 950 }} labelStyle={{ display: 'none' }} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const AnalyticsHub = () => {
  // ─── HOOKS & CONTEXT ──────────────────────────────────────────────────────
  const navigate = useNavigate();
  const location = useLocation();
  const { sensorHistory } = useApp();
  
  // ─── STATE ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'Soil');
  
  // ─── EFFECTS ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);
  
  // ─── DERIVED STATE ────────────────────────────────────────────────────────
  const analysis = useMemo(() => ({
    soil: Engine.analyzeSoil(sensorHistory || []),
    weather: Engine.analyzeWeather(sensorHistory || []),
    storage: Engine.analyzeStorage(sensorHistory || []),
    irrigation: Engine.analyzeIrrigation(sensorHistory || []),
  }), [sensorHistory]);

  const chartData = useMemo(() => (sensorHistory || []).map(h => ({
    time: h.time,
    moisture: Engine.safeNum(h.soil?.moisture),
    temp: Engine.safeNum(h.weather?.temp),
    humid: Engine.safeNum(h.weather?.humidity),
    gas: Engine.safeNum(h.storage?.mq135),
    flow: Engine.safeNum(h.water?.flowRate),
    usage: Engine.safeNum(h.water?.totalUsage),
    n: Engine.safeNum(h.soil?.npk?.n),
    p: Engine.safeNum(h.soil?.npk?.p),
    k: Engine.safeNum(h.soil?.npk?.k),
  })), [sensorHistory]);

  const tabs = [
    { id: 'Soil', icon: Sprout, color: COLORS.soil },
    { id: 'Weather', icon: CloudRain, color: COLORS.weather },
    { id: 'Storage', icon: Archive, color: COLORS.storage },
  ];

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '1.25rem', paddingBottom: '40px' }}>
      
      {/* Horizontal Tab Selector */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '8px' }} className="no-scrollbar">
        {tabs.map(tab => (
          <motion.button
            key={tab.id} whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px', borderRadius: '18px', border: 'none',
              display: 'flex', alignItems: 'center', gap: '10px',
              background: activeTab === tab.id ? tab.color : 'white',
              color: activeTab === tab.id ? 'white' : COLORS.subtext,
              fontWeight: 950, fontSize: '0.75rem', whiteSpace: 'nowrap', cursor: 'pointer',
              boxShadow: activeTab === tab.id ? `0 8px 20px ${tab.color}30` : '0 4px 10px rgba(0,0,0,0.02)',
              transition: '0.3s'
            }}
          >
            <tab.icon size={16} strokeWidth={3} /> {tab.id}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
          <TrendCard data={analysis[activeTab.toLowerCase()]} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeTab === 'Soil' && <>
              <AnalyticsChart title="Soil Moisture" data={chartData} dataKeys="moisture" colors={COLORS.soil} unit="%" insight={analysis.soil.moisture.insight} />
              <AnalyticsChart title="Nutrient Matrix (N/P/K)" type="line" data={chartData} dataKeys={['n','p','k']} colors={[COLORS.soil, COLORS.water, COLORS.energy]} insight={analysis.soil.npk.insight} />
            </>}
            {activeTab === 'Weather' && <>
              <AnalyticsChart title="Relative Humidity" data={chartData} dataKeys="humid" colors={COLORS.water} unit="%" insight={analysis.weather.humidity.insight} />
            </>}
            {activeTab === 'Storage' && <>
              <AnalyticsChart title="Gas (MQ135)" data={chartData} dataKeys="gas" colors={COLORS.storage} unit="ppm" insight={analysis.storage.gas.insight} />
              <AnalyticsChart title="Internal Stability" type="line" data={chartData} dataKeys={['gas']} colors={[COLORS.storage]} insight="Storage environment metrics." />
            </>}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const mapping = { 'Soil': '/soil-monitoring', 'Weather': '/weather', 'Storage': '/storage-hub' };
              navigate(mapping[activeTab]);
            }}
            style={{ width: '100%', padding: '1.25rem', borderRadius: '24px', background: 'white', border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: '0.9rem', fontWeight: 950, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '1.5rem', cursor: 'pointer' }}
          >
            Launch {activeTab} Monitor <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AnalyticsHub;
