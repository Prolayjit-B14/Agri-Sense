import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MASTER_CONFIG } from '../config';
import { 
  Map as MapIcon, Compass, Navigation, MapPin, 
  Layers, Target, Activity, Droplets, Thermometer,
  FlaskConical, CheckCircle2, AlertCircle, RefreshCw,
  ChevronRight, Save, Trash2, Undo, Info,
  Map as MapIcon2, Fingerprint, Footprints, MousePointer2,
  Zap, Download, LayoutDashboard, Brain, Search, Clock
} from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  secondary: '#3B82F6',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#1E293B',
  subtext: '#64748B',
  bg: '#F8FAFC',
  border: '#F1F5F9',
  terminal: '#0F172A'
};

// ─── UTILS & MATH ─────────────────────────────────────────────────────────

const calculateArea = (points) => {
  if (points.length < 3) return 0;
  // Simplified Shoelace for local coordinates (simulated meters from center)
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
};

const getDistance = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────

const PrecisionSoilTesting = () => {
  const { sensorData } = useApp();
  const [activeTab, setActiveTab] = useState(1);
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  const [mappingMode, setMappingMode] = useState('TAP'); // WALK, TAP, DRAW
  const [gpsAccuracy, setGpsAccuracy] = useState(5.2);
  const [samples, setSamples] = useState([]);
  const [activeSampleIndex, setActiveSampleIndex] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [currentReadings, setCurrentReadings] = useState([]);
  const [collectStep, setCollectStep] = useState(0); // 0-3 readings
  const [activeLayer, setActiveLayer] = useState('moisture'); // moisture, ph, npk

  // Derived Values
  const fieldAreaSqM = useMemo(() => calculateArea(boundaryPoints) * 25, [boundaryPoints]); // scaling factor for simulation
  const fieldAreaAcre = (fieldAreaSqM / 4046.86).toFixed(2);
  const fieldAreaHectare = (fieldAreaSqM / 10000).toFixed(2);

  // 1. MAPPING LOGIC
  const handleAddPoint = (e) => {
    if (gpsAccuracy > 8) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setBoundaryPoints([...boundaryPoints, { x, y, acc: gpsAccuracy }]);
  };

  const handleUndo = () => setBoundaryPoints(boundaryPoints.slice(0, -1));
  const handleReset = () => { setBoundaryPoints([]); setSamples([]); };

  // 2. STRATEGY LOGIC
  const generateSamples = () => {
    if (boundaryPoints.length < 3) return;
    const area = parseFloat(fieldAreaAcre);
    let count = Math.max(3, Math.round(area * 2.5));
    if (area < 0.25) count = 2; // Micro sampling
    
    // Simple distribution within bounding box (clamped to boundary simulation)
    const newSamples = [];
    for (let i = 0; i < count; i++) {
        // Find center of mass
        const centerX = boundaryPoints.reduce((a, b) => a + b.x, 0) / boundaryPoints.length;
        const centerY = boundaryPoints.reduce((a, b) => a + b.y, 0) / boundaryPoints.length;
        // Distribute around center with buffer
        const angle = (i / count) * 2 * Math.PI;
        const radius = 50 + Math.random() * 30;
        newSamples.push({
            id: i + 1,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            readings: [],
            status: 'pending'
          });
    }
    setSamples(newSamples);
    setActiveTab(2);
  };

  // 3. COLLECTION LOGIC
  const startCollection = (index) => {
    setActiveSampleIndex(index);
    setIsCollecting(true);
    setCollectStep(0);
    setCurrentReadings([]);
  };

  useEffect(() => {
    let timer;
    if (isCollecting && collectStep < 3) {
      timer = setTimeout(() => {
        const newVal = {
          moisture: sensorData?.soil?.moisture !== null ? sensorData.soil.moisture + (Math.random() * 2 - 1) : null,
          temp: sensorData?.soil?.temp !== null ? sensorData.soil.temp + (Math.random() * 0.5 - 0.25) : null,
          ph: sensorData?.soil?.ph !== null ? sensorData.soil.ph + (Math.random() * 0.1 - 0.05) : null,
          npk: sensorData?.soil?.npk?.n !== null ? sensorData.soil.npk.n + (Math.random() * 4 - 2) : null
        };
        setCurrentReadings(prev => [...prev, newVal]);
        setCollectStep(s => s + 1);
      }, 2000);
    } else if (collectStep === 3) {
      // 🛡️ NOISE REDUCTION LOGIC (Outlier Removal)
      const filterOutliers = (arr, key) => {
        if (arr.length < 3) return arr;
        const vals = arr.map(r => r[key]);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        // Simple 50% deviation threshold
        return arr.filter(r => Math.abs(r[key] - avg) < (avg * 0.5));
      };

      const cleanReadings = {
        moisture: filterOutliers(currentReadings, 'moisture'),
        temp: filterOutliers(currentReadings, 'temp'),
        ph: filterOutliers(currentReadings, 'ph'),
        npk: filterOutliers(currentReadings, 'npk')
      };

      const avgReadings = {
        moisture: cleanReadings.moisture.reduce((a, b) => a + b.moisture, 0) / (cleanReadings.moisture.length || 1),
        temp: cleanReadings.temp.reduce((a, b) => a + b.temp, 0) / (cleanReadings.temp.length || 1),
        ph: cleanReadings.ph.reduce((a, b) => a + b.ph, 0) / (cleanReadings.ph.length || 1),
        npk: cleanReadings.npk.reduce((a, b) => a + b.npk, 0) / (cleanReadings.npk.length || 1),
        time: new Date().toISOString()
      };
      
      setSamples(prev => prev.map((s, i) => i === activeSampleIndex ? { ...s, readings: avgReadings, status: 'completed' } : s));
      setIsCollecting(false);
      setCollectStep(0);
    }
    return () => clearTimeout(timer);
  }, [isCollecting, collectStep]);

  // 4. REPORT LOGIC
  const healthReport = useMemo(() => {
    const completed = samples.filter(s => s.status === 'completed');
    if (completed.length === 0) return null;
    
    const avgM = completed.reduce((a, b) => a + b.readings.moisture, 0) / completed.length;
    const avgT = completed.reduce((a, b) => a + b.readings.temp, 0) / completed.length;
    const avgP = completed.reduce((a, b) => a + b.readings.ph, 0) / completed.length;
    const avgN = completed.reduce((a, b) => a + b.readings.npk, 0) / completed.length;

    // Normalize (0-100)
    const mScore = Math.max(0, 100 - Math.abs(avgM - 50) * 2) * 0.3;
    const nScore = Math.max(0, 100 - Math.abs(avgN - 70) * 1.5) * 0.3;
    const pScore = Math.max(0, 100 - Math.abs(avgP - 6.5) * 20) * 0.25;
    const tScore = Math.max(0, 100 - Math.abs(avgT - 25) * 4) * 0.15;
    
    return {
        score: Math.round(mScore + nScore + pScore + tScore),
        moisture: avgM.toFixed(1),
        temp: avgT.toFixed(1),
        ph: avgP.toFixed(1),
        npk: Math.round(avgN),
        variation: (Math.max(...completed.map(s => s.readings.moisture)) - Math.min(...completed.map(s => s.readings.moisture))).toFixed(1)
    };
  }, [samples]);

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* 🔝 HUD NAVIGATION */}
      <div style={{ background: 'white', padding: '1rem', borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
         <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
            {[1, 2, 3, 4, 5].map(t => (
               <button 
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    padding: '8px 16px', borderRadius: '12px', border: 'none',
                    background: activeTab === t ? COLORS.primary : '#F1F5F9',
                    color: activeTab === t ? 'white' : COLORS.subtext,
                    fontWeight: 950, fontSize: '0.65rem', whiteSpace: 'nowrap', transition: '0.2s'
                  }}
               >
                  STEP {t}: {['MAPPING', 'STRATEGY', 'COLLECTION', 'ZONES', 'REPORT'][t-1]}
               </button>
            ))}
         </div>
      </div>

      <div style={{ padding: '1.25rem' }}>

        <AnimatePresence mode="wait">
          
          {/* TAB 1: FIELD MAPPING */}
          {activeTab === 1 && (
            <motion.div key="tab1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Field Mapping</h2>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.subtext }}>Capture Farm Boundary</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 950, color: gpsAccuracy <= 8 ? COLORS.primary : COLORS.danger }}>
                       <Target size={14} /> GPS: {gpsAccuracy}m
                    </div>
                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, marginTop: '2px' }}>{gpsAccuracy <= 8 ? 'SIGNAL OPTIMAL' : 'WEAK SIGNAL'}</p>
                  </div>
               </div>

               {/* MAP INTERFACE */}
               <div 
                onClick={handleAddPoint}
                style={{ 
                  height: '420px', background: '#E2E8F0', borderRadius: '32px', overflow: 'hidden', 
                  position: 'relative', border: '4px solid white', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' 
                }}
               >
                  <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://www.openstreetmap.org/export/embed.html?bbox=${MASTER_CONFIG.MAP_LNG-0.002},${MASTER_CONFIG.MAP_LAT-0.002},${MASTER_CONFIG.MAP_LNG+0.002},${MASTER_CONFIG.MAP_LAT+0.002}&layer=mapnik`} style={{ border: 'none', filter: 'grayscale(0.3) brightness(0.95)' }} />
                  
                  {/* POLYGON OVERLAY */}
                  <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
                     {boundaryPoints.length > 0 && (
                        <polyline 
                           points={boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')} 
                           fill={`${COLORS.primary}20`} stroke={COLORS.primary} strokeWidth="3" strokeDasharray={mappingMode === 'DRAW' ? '0' : '5 5'}
                        />
                     )}
                     {boundaryPoints.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="5" fill="white" stroke={COLORS.primary} strokeWidth="2" />
                     ))}
                  </svg>

                  {/* MODE SELECTOR */}
                  <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <button onClick={(e) => { e.stopPropagation(); setMappingMode('WALK'); }} style={{ width: '40px', height: '40px', borderRadius: '12px', background: mappingMode === 'WALK' ? COLORS.primary : 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}><Footprints size={20} color={mappingMode === 'WALK' ? 'white' : COLORS.text} /></button>
                     <button onClick={(e) => { e.stopPropagation(); setMappingMode('TAP'); }} style={{ width: '40px', height: '40px', borderRadius: '12px', background: mappingMode === 'TAP' ? COLORS.primary : 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}><Fingerprint size={20} color={mappingMode === 'TAP' ? 'white' : COLORS.text} /></button>
                     <button onClick={(e) => { e.stopPropagation(); setMappingMode('DRAW'); }} style={{ width: '40px', height: '40px', borderRadius: '12px', background: mappingMode === 'DRAW' ? COLORS.primary : 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}><MousePointer2 size={20} color={mappingMode === 'DRAW' ? 'white' : COLORS.text} /></button>
                  </div>
               </div>

               {/* STATS & ACTIONS */}
               <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1, background: 'white', padding: '1.25rem', borderRadius: '24px', border: `1px solid ${COLORS.border}` }}>
                     <p style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext, textTransform: 'uppercase' }}>Field Area</p>
                     <h3 style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, margin: '4px 0 0 0' }}>{fieldAreaAcre} <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Acre</span></h3>
                     <p style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.primary, marginTop: '2px' }}>{fieldAreaHectare} Hectares</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <button onClick={handleUndo} style={{ flex: 1, padding: '0 15px', borderRadius: '14px', border: `1px solid ${COLORS.border}`, background: 'white', color: COLORS.subtext }}><Undo size={18} /></button>
                     <button onClick={handleReset} style={{ flex: 1, padding: '0 15px', borderRadius: '14px', border: `1px solid ${COLORS.border}`, background: 'white', color: COLORS.danger }}><Trash2 size={18} /></button>
                  </div>
               </div>

               {gpsAccuracy > 8 && (
                  <div style={{ marginTop: '1rem', padding: '12px', background: `${COLORS.danger}10`, borderRadius: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                     <AlertCircle size={18} color={COLORS.danger} />
                     <p style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.danger, margin: 0 }}>Low GPS accuracy — move to open sky for capture.</p>
                  </div>
               )}

               {parseFloat(fieldAreaAcre) < 0.25 && parseFloat(fieldAreaAcre) > 0 && (
                  <div style={{ marginTop: '1rem', padding: '12px', background: `${COLORS.warning}10`, borderRadius: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                     <Info size={18} color={COLORS.warning} />
                     <p style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.warning, margin: 0 }}>Small field detected. Reduced sample points (2-3) optimized for micro-plots.</p>
                  </div>
               )}

               <button 
                onClick={generateSamples}
                disabled={boundaryPoints.length < 3}
                style={{ width: '100%', height: '58px', borderRadius: '20px', background: COLORS.primary, color: 'white', border: 'none', fontWeight: 950, fontSize: '1rem', marginTop: '2rem', boxShadow: `0 12px 30px ${COLORS.primary}30`, opacity: boundaryPoints.length < 3 ? 0.5 : 1 }}
               >
                  GENERATE SAMPLING PLAN
               </button>
            </motion.div>
          )}

          {/* TAB 2: SAMPLING STRATEGY */}
          {activeTab === 2 && (
            <motion.div key="tab2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, marginBottom: '0.5rem' }}>Sampling Plan</h2>
               <p style={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.subtext, marginBottom: '2rem' }}>Adaptive Spatial Distribution</p>

               <div style={{ background: 'white', borderRadius: '32px', padding: '2rem', border: `1px solid ${COLORS.border}`, textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                     <div style={{ padding: '1rem', background: COLORS.bg, borderRadius: '20px' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 950, color: COLORS.subtext }}>AREA DETECTED</p>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 950 }}>{fieldAreaAcre} Ac</h4>
                     </div>
                     <div style={{ padding: '1rem', background: `${COLORS.primary}10`, borderRadius: '20px' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 950, color: COLORS.primary }}>POINTS REQUIRED</p>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 950, color: COLORS.primary }}>{samples.length}</h4>
                     </div>
                  </div>

                  <div style={{ height: '220px', background: COLORS.bg, borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                     <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                        <polyline points={boundaryPoints.map(p => `${p.x/2},${p.y/2}`).join(' ')} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="2" style={{ transform: 'translate(25%, 10%) scale(1.5)' }} />
                        {samples.map((s, i) => (
                           <circle key={i} cx={s.x/2} cy={s.y/2} r="6" fill={COLORS.secondary} style={{ transform: 'translate(25%, 10%) scale(1.5)' }} />
                        ))}
                     </svg>
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.subtext, marginTop: '1.5rem' }}>Grid-optimized coverage: Corners, Center, Mid-zones.</p>
               </div>

               <button onClick={() => setActiveTab(3)} style={{ width: '100%', height: '58px', borderRadius: '20px', background: COLORS.secondary, color: 'white', border: 'none', fontWeight: 950, fontSize: '1rem', boxShadow: `0 12px 30px ${COLORS.secondary}30` }}>
                  START DATA COLLECTION
               </button>
            </motion.div>
          )}

          {/* TAB 3: SAMPLE COLLECTION */}
          {activeTab === 3 && (
            <motion.div key="tab3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Data Collection</h2>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.subtext }}>Point-by-Point Field Audit</p>
                  </div>
                  <div style={{ background: COLORS.terminal, color: 'white', padding: '8px 14px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 950 }}>
                     {samples.filter(s => s.status === 'completed').length} / {samples.length} SAMPLES
                  </div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {samples.map((s, i) => (
                     <motion.div 
                        key={i} 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !isCollecting && startCollection(i)}
                        style={{ 
                           background: 'white', borderRadius: '24px', padding: '1.25rem', border: `1px solid ${activeSampleIndex === i ? COLORS.primary : COLORS.border}`,
                           display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', overflow: 'hidden'
                        }}
                     >
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.status === 'completed' ? COLORS.primary : COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           {s.status === 'completed' ? <CheckCircle2 size={24} color="white" /> : <MapPin size={24} color={COLORS.subtext} />}
                        </div>
                        <div style={{ flex: 1 }}>
                           <h4 style={{ fontSize: '1rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Sample #{s.id}</h4>
                           <p style={{ fontSize: '0.7rem', fontWeight: 800, color: COLORS.subtext, margin: '2px 0 0 0' }}>Distance: {Math.round(getDistance({x:100, y:100}, s))}m • 22.97°N</p>
                        </div>
                        {s.status === 'pending' && <ChevronRight size={20} color={COLORS.subtext} />}
                        
                        {isCollecting && activeSampleIndex === i && (
                           <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', background: COLORS.primary, width: `${(collectStep / 3) * 100}%`, transition: '0.5s' }} />
                        )}
                     </motion.div>
                  ))}
               </div>

               {isCollecting && (
                  <div style={{ position: 'fixed', bottom: '120px', left: '1.25rem', right: '1.25rem', background: COLORS.terminal, borderRadius: '24px', padding: '1.5rem', color: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 1000 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <RefreshCw size={20} color={COLORS.primary} className="animate-spin" />
                           <span style={{ fontSize: '0.9rem', fontWeight: 950 }}>READING {collectStep + 1} OF 3...</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>WAIT 5s BETWEEN SYNC</span>
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        <div style={{ textAlign: 'center' }}><p style={{ fontSize: '0.55rem', opacity: 0.6 }}>MOIST</p><h5 style={{ margin: 0 }}>{Math.round(currentReadings[currentReadings.length-1]?.moisture || 0)}%</h5></div>
                        <div style={{ textAlign: 'center' }}><p style={{ fontSize: '0.55rem', opacity: 0.6 }}>TEMP</p><h5 style={{ margin: 0 }}>{Math.round(currentReadings[currentReadings.length-1]?.temp || 0)}°C</h5></div>
                        <div style={{ textAlign: 'center' }}><p style={{ fontSize: '0.55rem', opacity: 0.6 }}>PH</p><h5 style={{ margin: 0 }}>{(currentReadings[currentReadings.length-1]?.ph || 0).toFixed(1)}</h5></div>
                        <div style={{ textAlign: 'center' }}><p style={{ fontSize: '0.55rem', opacity: 0.6 }}>NPK</p><h5 style={{ margin: 0 }}>{Math.round(currentReadings[currentReadings.length-1]?.npk || 0)}</h5></div>
                     </div>
                  </div>
               )}

               {samples.every(s => s.status === 'completed') && (
                  <button onClick={() => setActiveTab(4)} style={{ width: '100%', height: '58px', borderRadius: '20px', background: COLORS.primary, color: 'white', border: 'none', fontWeight: 950, fontSize: '1rem', marginTop: '2rem', boxShadow: `0 12px 30px ${COLORS.primary}30` }}>
                     GENERATE ZONE MAP
                  </button>
               )}
            </motion.div>
          )}

          {/* TAB 4: ZONE INTELLIGENCE */}
          {activeTab === 4 && (
            <motion.div key="tab4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, marginBottom: '0.5rem' }}>Zone Intelligence</h2>
               <p style={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.subtext, marginBottom: '2rem' }}>Interpolated Soil Variance Map</p>

               <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                  {['moisture', 'ph', 'npk'].map(l => (
                     <button 
                        key={l} onClick={() => setActiveLayer(l)}
                        style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: activeLayer === l ? COLORS.secondary : 'white', color: activeLayer === l ? 'white' : COLORS.subtext, fontWeight: 950, fontSize: '0.65rem', textTransform: 'uppercase' }}
                     >
                        {l} Layer
                     </button>
                  ))}
               </div>

               <div style={{ height: '380px', background: '#F1F5F9', borderRadius: '32px', position: 'relative', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  {/* SIMULATED INTERPOLATED HEATMAP */}
                  <div style={{ 
                     position: 'absolute', inset: 0, 
                     background: `radial-gradient(circle at 30% 40%, ${COLORS.primary}60 0%, transparent 60%), radial-gradient(circle at 70% 60%, ${COLORS.warning}60 0%, transparent 60%), radial-gradient(circle at 50% 20%, ${COLORS.danger}40 0%, transparent 50%)`,
                     filter: 'blur(15px)'
                  }} />
                  
                  {/* SAMPLE MARKERS */}
                  {samples.map((s, i) => (
                     <div 
                        key={i} 
                        style={{ position: 'absolute', top: s.y, left: s.x, width: '20px', height: '20px', background: 'white', borderRadius: '50%', border: `3px solid ${s.readings.moisture > 45 ? COLORS.primary : COLORS.warning}`, boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 950 }}
                     >
                        {i + 1}
                     </div>
                  ))}
                  
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'white', padding: '8px 12px', borderRadius: '10px', display: 'flex', gap: '15px', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS.primary }} /><span style={{ fontSize: '0.55rem', fontWeight: 950 }}>Optimal</span></div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS.warning }} /><span style={{ fontSize: '0.55rem', fontWeight: 950 }}>Moderate</span></div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS.danger }} /><span style={{ fontSize: '0.55rem', fontWeight: 950 }}>Poor</span></div>
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '20px', border: `1px solid ${COLORS.border}` }}>
                     <p style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext, marginBottom: '6px' }}>ZONE A INSIGHT</p>
                     <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0 }}>Moisture optimal. High nitrogen leaching potential.</p>
                  </div>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '20px', border: `1px solid ${COLORS.border}` }}>
                     <p style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext, marginBottom: '6px' }}>ZONE C INSIGHT</p>
                     <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0 }}>Soil slightly acidic (pH 5.8). Lime application suggested.</p>
                  </div>
               </div>

               <button onClick={() => setActiveTab(5)} style={{ width: '100%', height: '58px', borderRadius: '20px', background: COLORS.primary, color: 'white', border: 'none', fontWeight: 950, fontSize: '1rem', marginTop: '2rem', boxShadow: `0 12px 30px ${COLORS.primary}30` }}>
                  VIEW FINAL REPORT
               </button>
            </motion.div>
          )}

          {/* TAB 5: SOIL HEALTH REPORT */}
          {activeTab === 5 && healthReport && (
            <motion.div key="tab5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
               <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: `${COLORS.primary}10`, margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${COLORS.primary}` }}>
                     <h2 style={{ fontSize: '2rem', fontWeight: 950, color: COLORS.primary, margin: 0 }}>{healthReport.score}</h2>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Soil Health Index</h3>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.subtext, marginTop: '4px' }}>Weighted Forensic Audit</p>
               </header>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { label: 'Avg Moisture', val: `${healthReport.moisture}%`, icon: Droplets, color: COLORS.secondary },
                    { label: 'Avg Temp', val: `${healthReport.temp}°C`, icon: Thermometer, color: COLORS.danger },
                    { label: 'Avg pH', val: healthReport.ph, icon: FlaskConical, color: COLORS.warning },
                    { label: 'Avg NPK', val: healthReport.npk, icon: Zap, color: COLORS.primary }
                  ].map((item, i) => (
                    <div key={i} style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', border: `1px solid ${COLORS.border}` }}>
                       <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${item.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                          <item.icon size={16} color={item.color} />
                       </div>
                       <p style={{ fontSize: '0.65rem', fontWeight: 950, color: COLORS.subtext, textTransform: 'uppercase' }}>{item.label}</p>
                       <h4 style={{ fontSize: '1.2rem', fontWeight: 950, margin: '4px 0 0 0' }}>{item.val}</h4>
                    </div>
                  ))}
               </div>

               <div style={{ background: COLORS.terminal, borderRadius: '28px', padding: '1.75rem', color: 'white', marginBottom: '2.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}><Brain size={20} color={COLORS.primary} /> Advisory Summary</h4>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.6, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                     Overall soil vitality is high. pH levels are slightly drifting but manageable. 
                     **Recommended Crops**: Rice, Potato, Tomato. 
                     **Nutrient Suggestion**: Focus on Nitrogen top-dressing in Zone B.
                  </p>
               </div>

               <button onClick={() => window.print()} style={{ width: '100%', height: '58px', borderRadius: '20px', background: COLORS.primary, color: 'white', border: 'none', fontWeight: 950, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <Download size={20} /> DOWNLOAD PDF REPORT
               </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default PrecisionSoilTesting;
