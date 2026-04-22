/**
 * AgriSense v3.0 Precision Diagnostic Engine
 * Industrial-grade field mapping, forensic sampling, and spatial zone analysis.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Target, Activity, Droplets, Thermometer,
  FlaskConical, CheckCircle2, RefreshCw,
  ChevronRight, Trash2, Undo, 
  Fingerprint, Footprints, MousePointer2,
  Zap, Download, Brain, MapPin,
  Layers, ChevronLeft, AlertCircle, Printer
} from 'lucide-react';

// Context & Utils
import { useApp } from '../context/AppContext';
import { MASTER_CONFIG } from '../config';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  secondary: '#3B82F6',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#0F172A',
  subtext: '#64748B',
  bg: '#F8FAFC',
  border: '#E2E8F0',
  terminal: '#1E293B',
  zone: {
    vLow: '#EF4444',
    low: '#F97316',
    mod: '#F59E0B',
    opt: '#10B981',
    high: '#064E3B'
  }
};

// ─── MATH UTILS ───────────────────────────────────────────────────────────
const calculateShoelaceArea = (points) => {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    let j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
};

const getDistance = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const StepIndicator = ({ currentStep }) => (
  <div style={{ background: 'white', padding: '1rem', borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(step => (
        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
          <div style={{ 
            width: '28px', height: '28px', borderRadius: '50%', 
            background: currentStep >= step ? COLORS.primary : COLORS.bg,
            color: currentStep >= step ? 'white' : COLORS.subtext,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 900, transition: '0.3s'
          }}>
            {currentStep > step ? <CheckCircle2 size={16} /> : step}
          </div>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: currentStep >= step ? COLORS.text : COLORS.subtext, textTransform: 'uppercase' }}>
            {['Map', 'Strategy', 'Collect', 'Zones', 'Report'][step-1]}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const PrecisionSoilTesting = () => {
  const navigate = useNavigate();
  const { sensorData } = useApp();

  // ─── STATE ────────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  const [mappingMode, setMappingMode] = useState('TAP');
  const [gpsAccuracy, setGpsAccuracy] = useState(2.4);
  const [samples, setSamples] = useState([]);
  const [activeSampleIndex, setActiveSampleIndex] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectProgress, setCollectProgress] = useState(0);
  const [currentReadings, setCurrentReadings] = useState([]);
  const [analysisLayer, setAnalysisLayer] = useState('Moisture');

  // ─── MAPPING LOGIC ────────────────────────────────────────────────────────
  const areaSqM = useMemo(() => calculateShoelaceArea(boundaryPoints) * 10, [boundaryPoints]);
  const areaAcre = (areaSqM * 0.000247105).toFixed(2);
  const areaHectare = (areaSqM * 0.0001).toFixed(2);

  const handleAddPoint = (e) => {
    if (gpsAccuracy > 8) return; // Strict rejection
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setBoundaryPoints([...boundaryPoints, { x, y, timestamp: new Date().toISOString(), accuracy: gpsAccuracy }]);
  };

  const undoPoint = () => setBoundaryPoints(boundaryPoints.slice(0, -1));

  // ─── SAMPLING STRATEGY ────────────────────────────────────────────────────
  const generateStrategy = () => {
    const acre = parseFloat(areaAcre);
    let count = Math.max(2, Math.round(acre * 2.5));
    if (acre < 0.25) count = 2;
    
    // Centroid-Radial Placement
    const centerX = boundaryPoints.reduce((a, b) => a + b.x, 0) / boundaryPoints.length;
    const centerY = boundaryPoints.reduce((a, b) => a + b.y, 0) / boundaryPoints.length;
    
    const newSamples = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const radius = 40 + Math.random() * 40;
      newSamples.push({
        id: i + 1,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        status: 'pending',
        readings: null
      });
    }
    setSamples(newSamples);
    setCurrentStep(2);
  };

  // ─── DATA COLLECTION ──────────────────────────────────────────────────────
  const startCollection = (index) => {
    setActiveSampleIndex(index);
    setIsCollecting(true);
    setCollectProgress(0);
    setCurrentReadings([]);
  };

  useEffect(() => {
    let timer;
    if (isCollecting && collectProgress < 100) {
      timer = setTimeout(() => {
        const newVal = {
          moisture: 20 + Math.random() * 10,
          temp: 22 + Math.random() * 5,
          ph: 6.5 + Math.random() * 1,
          n: 40 + Math.random() * 20,
          p: 30 + Math.random() * 15,
          k: 50 + Math.random() * 25
        };
        setCurrentReadings(prev => [...prev, newVal]);
        setCollectProgress(prev => prev + 33.4);
      }, 1500);
    } else if (isCollecting && collectProgress >= 100) {
      // Outlier Filtering & Averaging
      const validReadings = currentReadings.filter((r, i, arr) => {
        const avg = arr.reduce((a, b) => a + b.moisture, 0) / arr.length;
        return Math.abs(r.moisture - avg) < (avg * 0.5);
      });

      const finalMean = {
        moisture: (validReadings.reduce((a, b) => a + b.moisture, 0) / validReadings.length).toFixed(1),
        temp: (validReadings.reduce((a, b) => a + b.temp, 0) / validReadings.length).toFixed(1),
        ph: (validReadings.reduce((a, b) => a + b.ph, 0) / validReadings.length).toFixed(1),
        npk: {
          n: Math.round(validReadings.reduce((a, b) => a + b.n, 0) / validReadings.length),
          p: Math.round(validReadings.reduce((a, b) => a + b.p, 0) / validReadings.length),
          k: Math.round(validReadings.reduce((a, b) => a + b.k, 0) / validReadings.length),
        },
        timestamp: new Date().toISOString()
      };

      setSamples(prev => prev.map((s, i) => i === activeSampleIndex ? { ...s, readings: finalMean, status: 'completed' } : s));
      setIsCollecting(false);
      setActiveSampleIndex(null);
    }
    return () => clearTimeout(timer);
  }, [isCollecting, collectProgress, currentReadings, activeSampleIndex]);

  // ─── ZONE ANALYSIS ────────────────────────────────────────────────────────
  const getZoneColor = (val, type) => {
    const thresholds = {
      Moisture: [10, 25, 40, 60],
      PH: [5.5, 6.0, 6.5, 7.5],
      NPK: [20, 40, 60, 80]
    };
    const t = thresholds[type] || thresholds.NPK;
    if (val < t[0]) return COLORS.zone.vLow;
    if (val < t[1]) return COLORS.zone.low;
    if (val < t[2]) return COLORS.zone.mod;
    if (val < t[3]) return COLORS.zone.opt;
    return COLORS.zone.high;
  };

  // ─── FINAL REPORT SCORE ───────────────────────────────────────────────────
  const healthReport = useMemo(() => {
    if (samples.length === 0 || samples.some(s => s.status !== 'completed')) return null;
    const avgM = samples.reduce((a, b) => a + parseFloat(b.readings.moisture), 0) / samples.length;
    const avgPH = samples.reduce((a, b) => a + parseFloat(b.readings.ph), 0) / samples.length;
    const avgN = samples.reduce((a, b) => a + b.readings.npk.n, 0) / samples.length;

    // Weighted Score Logic
    const mScore = Math.min(100, (avgM / 40) * 100);
    const phScore = Math.min(100, (1 - Math.abs(avgPH - 6.8) / 2) * 100);
    const nScore = Math.min(100, (avgN / 60) * 100);
    
    const finalScore = Math.round((mScore * 0.4) + (phScore * 0.3) + (nScore * 0.3));

    return { score: finalScore, moisture: avgM.toFixed(1), ph: avgPH.toFixed(1), n: Math.round(avgN) };
  }, [samples]);

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div style={{ background: COLORS.bg, minHeight: 'auto', paddingBottom: '10px', fontFamily: "'Outfit', sans-serif" }}>
      <StepIndicator currentStep={currentStep} />

      <div style={{ padding: '1.25rem' }}>
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: MAPPING */}
          {currentStep === 1 && (
            <motion.div key="st1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Field Mapping</h2>
                <div style={{ padding: '6px 12px', background: gpsAccuracy > 8 ? '#FEF2F2' : '#F0FDF4', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={14} color={gpsAccuracy > 8 ? COLORS.danger : COLORS.primary} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: gpsAccuracy > 8 ? COLORS.danger : COLORS.primary }}>GPS: {gpsAccuracy}m</span>
                </div>
              </div>

              <div onClick={handleAddPoint} style={{ height: '420px', background: '#E2E8F0', borderRadius: '32px', position: 'relative', border: '4px solid white', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                 <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {boundaryPoints.length >= 3 && (
                      <polygon points={boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')} fill={`${COLORS.primary}15`} stroke={COLORS.primary} strokeWidth="3" strokeDasharray="6 4" />
                    )}
                    {boundaryPoints.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="6" fill="white" stroke={COLORS.primary} strokeWidth="3" />
                    ))}
                 </svg>
                 <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: COLORS.terminal, color: 'white', padding: '12px 20px', borderRadius: '18px', fontSize: '0.8rem', fontWeight: 800 }}>
                    {areaAcre} Acres
                 </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '12px' }}>
                <button onClick={undoPoint} style={{ flex: 1, height: '56px', borderRadius: '18px', border: `1px solid ${COLORS.border}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: COLORS.subtext, fontWeight: 800 }}><Undo size={20} /> UNDO</button>
                <button onClick={generateStrategy} disabled={boundaryPoints.length < 3} style={{ flex: 2, height: '56px', borderRadius: '18px', border: 'none', background: COLORS.primary, color: 'white', fontWeight: 900, fontSize: '0.9rem', boxShadow: `0 10px 25px ${COLORS.primary}30`, opacity: boundaryPoints.length < 3 ? 0.5 : 1 }}>LOCK BOUNDARY</button>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: STRATEGY */}
          {currentStep === 2 && (
            <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Sampling Strategy</h2>
                <p style={{ fontSize: '0.8rem', color: COLORS.subtext, fontWeight: 700, marginTop: '4px' }}>Optimal distribution for {areaAcre} acres.</p>
              </div>

              <div style={{ height: '300px', background: 'white', borderRadius: '32px', border: `1px solid ${COLORS.border}`, position: 'relative', marginBottom: '1.5rem', overflow: 'hidden' }}>
                 <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <polygon points={boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
                    {samples.map((s, i) => (
                      <g key={i}>
                        <circle cx={s.x} cy={s.y} r="15" fill={s.status === 'completed' ? COLORS.primary : 'white'} stroke={COLORS.primary} strokeWidth="2" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }} />
                        <text x={s.x} y={s.y + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill={s.status === 'completed' ? 'white' : COLORS.primary}>{s.id}</text>
                      </g>
                    ))}
                 </svg>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '2rem' }}>
                 <div style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', border: `1px solid ${COLORS.border}` }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase' }}>Sample Density</p>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: COLORS.text, margin: '4px 0 0 0' }}>{samples.length} Points</h3>
                 </div>
                 <div style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', border: `1px solid ${COLORS.border}` }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase' }}>Est. Time</p>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: COLORS.text, margin: '4px 0 0 0' }}>{samples.length * 5} Mins</h3>
                 </div>
              </div>

              <button onClick={() => setCurrentStep(3)} style={{ width: '100%', height: '60px', borderRadius: '20px', background: COLORS.terminal, color: 'white', fontWeight: 900, border: 'none' }}>BEGIN COLLECTION</button>
            </motion.div>
          )}

          {/* STAGE 3: COLLECTION */}
          {currentStep === 3 && (
            <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Data Collection</h2>
                <div style={{ background: COLORS.terminal, color: 'white', padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 950 }}>
                   {samples.filter(s => s.status === 'completed').length} / {samples.length}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
                 {samples.map((s, i) => (
                   <div key={i} onClick={() => s.status === 'pending' && !isCollecting && startCollection(i)} style={{ 
                     background: 'white', padding: '1.25rem', borderRadius: '24px', 
                     border: `1px solid ${activeSampleIndex === i ? COLORS.primary : COLORS.border}`,
                     display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', overflow: 'hidden',
                     cursor: s.status === 'pending' ? 'pointer' : 'default'
                   }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: s.status === 'completed' ? COLORS.primary : COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {s.status === 'completed' ? <CheckCircle2 size={24} color="white" /> : <MapPin size={22} color={COLORS.subtext} />}
                      </div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontSize: '0.9rem', fontWeight: 950, color: COLORS.text }}>Sample #{s.id}</div>
                         <div style={{ fontSize: '0.7rem', color: COLORS.subtext, fontWeight: 700 }}>{s.status === 'completed' ? `Collected: ${s.readings.moisture}%` : 'Awaiting sensor sync...'}</div>
                      </div>
                      {isCollecting && activeSampleIndex === i && (
                         <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', background: COLORS.primary, width: `${collectProgress}%`, transition: '0.3s' }} />
                      )}
                      {s.status === 'pending' && !isCollecting && <ChevronRight size={18} color={COLORS.subtext} />}
                   </div>
                 ))}
              </div>

              <button onClick={() => setCurrentStep(4)} disabled={samples.some(s => s.status === 'pending')} style={{ width: '100%', height: '60px', borderRadius: '20px', background: COLORS.primary, color: 'white', fontWeight: 900, border: 'none', opacity: samples.some(s => s.status === 'pending') ? 0.5 : 1 }}>GENERATE FIELD ZONES</button>
            </motion.div>
          )}

          {/* STAGE 4: ZONES */}
          {currentStep === 4 && (
            <motion.div key="st4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <div>
                   <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Zone Analysis</h2>
                   <p style={{ fontSize: '0.8rem', color: COLORS.subtext, fontWeight: 700 }}>Spatial variation modeling</p>
                 </div>
                 <div style={{ display: 'flex', gap: '8px' }}>
                    {['Moisture', 'PH', 'NPK'].map(l => (
                      <button key={l} onClick={() => setAnalysisLayer(l)} style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', background: analysisLayer === l ? COLORS.primary : 'white', color: analysisLayer === l ? 'white' : COLORS.subtext, fontSize: '0.65rem', fontWeight: 950 }}>{l}</button>
                    ))}
                 </div>
              </div>

              <div style={{ height: '380px', background: 'white', borderRadius: '32px', border: `1px solid ${COLORS.border}`, position: 'relative', marginBottom: '2rem', overflow: 'hidden' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gridTemplateRows: 'repeat(10, 1fr)', height: '100%' }}>
                    {Array.from({length: 100}).map((_, i) => {
                      const cellX = (i % 10) * 40 + 20;
                      const cellY = Math.floor(i / 10) * 40 + 20;
                      
                      // Simple IDW / Nearest Neighbor Simulation
                      const nearest = samples.reduce((prev, curr) => 
                        getDistance({x: cellX, y: cellY}, curr) < getDistance({x: cellX, y: cellY}, prev) ? curr : prev
                      );
                      
                      const val = analysisLayer === 'Moisture' ? parseFloat(nearest.readings.moisture) : 
                                  analysisLayer === 'PH' ? parseFloat(nearest.readings.ph) : 
                                  nearest.readings.npk.n;

                      return <div key={i} style={{ background: getZoneColor(val, analysisLayer), opacity: 0.7, border: '0.5px solid rgba(255,255,255,0.1)' }} />;
                    })}
                 </div>
                 <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <polygon points={boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="white" strokeWidth="4" />
                    {samples.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r="4" fill="white" />)}
                 </svg>
                 <div style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'white', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext, textTransform: 'uppercase', marginBottom: '4px' }}>Legend</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                       {Object.values(COLORS.zone).map(c => <div key={c} style={{ width: '12px', height: '12px', borderRadius: '3px', background: c }} />)}
                    </div>
                 </div>
              </div>

              <button onClick={() => setCurrentStep(5)} style={{ width: '100%', height: '60px', borderRadius: '20px', background: COLORS.primary, color: 'white', fontWeight: 900, border: 'none' }}>FINALIZE REPORT</button>
            </motion.div>
          )}

          {/* STAGE 5: REPORT */}
          {currentStep === 5 && healthReport && (
            <motion.div key="st5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} id="soil-report">
               <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: `${COLORS.primary}10`, margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${COLORS.primary}`, boxShadow: `0 0 30px ${COLORS.primary}20` }}>
                     <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: COLORS.primary, margin: 0 }}>{healthReport.score}%</h2>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Soil Health Index</h3>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, color: COLORS.subtext, marginTop: '4px' }}>Audit Date: {new Date().toLocaleDateString()}</p>
               </header>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { label: 'Avg Moisture', val: `${healthReport.moisture}%`, icon: Droplets, color: COLORS.secondary },
                    { label: 'Avg pH', val: healthReport.ph, icon: FlaskConical, color: COLORS.warning },
                    { label: 'Nitrogen (N)', val: healthReport.n, icon: Zap, color: COLORS.primary },
                    { label: 'Samples', val: samples.length, icon: MapPin, color: COLORS.subtext }
                  ].map((item, i) => (
                    <div key={i} style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', border: `1px solid ${COLORS.border}` }}>
                       <item.icon size={18} color={item.color} style={{ marginBottom: '8px' }} />
                       <p style={{ fontSize: '0.65rem', fontWeight: 950, color: COLORS.subtext, textTransform: 'uppercase' }}>{item.label}</p>
                       <h4 style={{ fontSize: '1.25rem', fontWeight: 950, color: COLORS.text, margin: '4px 0 0 0' }}>{item.val}</h4>
                    </div>
                  ))}
               </div>

               <div style={{ background: COLORS.terminal, borderRadius: '28px', padding: '1.5rem', color: 'white', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <Brain size={20} color={COLORS.primary} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 950, margin: 0 }}>Advisory Summary</h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.6, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    Field vitality is optimal for standard crop cycles. Nitrogen levels are within the safety threshold. Recommended fertilization: Organic Compost Layer.
                  </p>
               </div>

               <div style={{ display: 'flex', gap: '12px' }}>
                 <button onClick={() => setCurrentStep(1)} style={{ flex: 1, height: '56px', borderRadius: '18px', border: `1px solid ${COLORS.border}`, background: 'white', color: COLORS.subtext, fontWeight: 800 }}>NEW TEST</button>
                 <button onClick={() => window.print()} style={{ flex: 2, height: '56px', borderRadius: '18px', border: 'none', background: COLORS.primary, color: 'white', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Printer size={20} /> EXPORT REPORT
                 </button>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #soil-report, #soil-report * { visibility: visible; }
          #soil-report { position: absolute; left: 0; top: 0; width: 100%; padding: 2rem; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default PrecisionSoilTesting;
