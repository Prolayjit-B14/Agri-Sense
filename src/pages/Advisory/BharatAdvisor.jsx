/**
 * Bharat Advisor v17.0.0 - Industrial Agronomy Decision Suite
 * Comprehensive Overhaul: Integrating Match, Fertilizer, Compost, and Pest Engines.
 * 
 * Engines:
 * 1. Match Engine (Weather, Soil, Season, Sowing)
 * 2. Fertilizer Engine (NPK Deficit + Env Adjustments)
 * 3. Compost Engine (Moisture + Soil Type + N-Boost)
 * 4. Pesticide Engine (Temp/Hum/Rain Strict Triggers)
 * 
 * Aesthetics: Industrial Premium, Dark/Light balance, Framer Motion.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  MapPin, Zap, Calculator, RefreshCw, Activity, Target, Plus, Minus,
  Bug, ShieldCheck, Leaf, Sprout, Globe, AlertCircle, CheckCircle2,
  XCircle, Waves, Clock, FlaskConical, BarChart3, CloudRain, Thermometer
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── ASSET IMPORTS ──────────────────────────────────────────────────────────
import cropCsv from '../assets/Crop_recommendation.csv?url';

// ─── UTILS & PARSERS ────────────────────────────────────────────────────────

const parseCSV = (t) => {
  if (!t) return [];
  const lines = t.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    return headers.reduce((obj, header, i) => { obj[header] = values[i]?.trim().replace(/"/g, ''); return obj; }, {});
  });
};

const aggregateCropProfiles = (data) => {
  const crops = {};
  data.forEach(row => {
    const label = row.label?.toLowerCase().trim();
    if (!label) return;
    if (!crops[label]) crops[label] = { n: [], p: [], k: [], temperature: [], humidity: [], ph: [], rainfall: [] };
    ['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall'].forEach(key => {
      const val = parseFloat(row[key]); if (!isNaN(val)) crops[label][key].push(val);
    });
  });
  const final = {};
  Object.keys(crops).forEach(label => {
    const r = crops[label];
    final[label] = {};
    Object.keys(r).forEach(key => {
      const v = r[key];
      if (v.length === 0) { final[label][key] = { min: 0, max: 0, avg: 0, range: 1, mid: 0 }; return; }
      const min = Math.min(...v), max = Math.max(...v), avg = v.reduce((a, b) => a + b, 0) / v.length;
      final[label][key] = { min, max, avg, range: max - min || 1, mid: (min + max) / 2 };
    });
    const rain = final[label].rainfall || { min: 0, max: 0, avg: 0 };
    final[label].moisture = {
      min: Math.max(10, (rain.min || 0) / 3),
      max: Math.min(100, (rain.max || 0) / 2),
      avg: Math.min(90, (rain.avg || 0) / 2.5)
    };
    final[label].moisture.mid = (final[label].moisture.min + final[label].moisture.max) / 2;
    final[label].moisture.range = final[label].moisture.max - final[label].moisture.min || 1;
  });
  return final;
};

// ─── MASTER METADATA (CROP PROFILES) ───
const CROP_METADATA = {
  rice: { type: 'Grain', season: 'Kharif', water: 'HIGH', dur: '120–150d', bU: 100, bS: 50, bM: 40, bC: 3, soil: 'Clayey/Alluvial', weather: 'Humid', sow: 'Jun-Jul', pests: [{ n: 'Stem Borer', s: 'Chlorpyrifos', tm: 25, hm: 75, rm: 0, r: 'High humidity' }] },
  maize: { type: 'Grain', season: 'Kharif', water: 'MEDIUM', dur: '90–110d', bU: 80, bS: 40, bM: 30, bC: 2, soil: 'Loamy', weather: 'Dry/Warm', sow: 'May-Jun', pests: [{ n: 'Armyworm', s: 'Spinosad', tm: 28, hm: 50, rm: 0, r: 'Dry heat' }] },
  watermelon: { type: 'Fruit', season: 'Summer', water: 'HIGH', dur: '75–90d', bU: 140, bS: 60, bM: 80, bC: 4, soil: 'Sandy', weather: 'Dry/Hot', sow: 'Jan-Feb', pests: [{ n: 'Fruit Fly', s: 'Traps', tm: 30, hm: 40, rm: 0, r: 'Extreme heat' }] },
  wheat: { type: 'Grain', season: 'Rabi', water: 'MEDIUM', dur: '110–140d', bU: 120, bS: 50, bM: 40, bC: 2, soil: 'Loamy', weather: 'Cool/Dry', sow: 'Oct-Nov', pests: [{ n: 'Rust', s: 'Propiconazole', tm: 18, hm: 60, rm: 0, r: 'Cool moisture' }] }
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = { '🟢': '#10B981', '🟡': '#F59E0B', '🔴': '#EF4444', bg: '#F8FAFC', text: '#0F172A', subtext: '#64748B' };

const CropAdvisor = () => {
  const { sensorData } = useApp();
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [area, setArea] = useState(1);
  const [db, setDb] = useState({ crops: null, loading: true });
  const [collapsed, setCollapsed] = useState(false);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 80], [1, 0.95]);

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setCollapsed(v > 60));
    fetch(cropCsv).then(r => r.text()).then(t => setDb({ crops: aggregateCropProfiles(parseCSV(t)), loading: false }));
    return () => unsub();
  }, [scrollY]);

  const brain = useMemo(() => {
    if (db.loading || !db.crops?.[selectedCrop]) return null;

    const profile = db.crops[selectedCrop];
    const meta = CROP_METADATA[selectedCrop] || { type: 'Vegetable', season: 'Kharif', water: 'MEDIUM', dur: '90–120d', bU: 50, bS: 40, bM: 30, bC: 2, soil: 'Loamy', weather: 'Warm', sow: 'Jun-Jul', pests: [] };

    const cur = {
      n: sensorData.soil?.npk?.n, p: sensorData.soil?.npk?.p, k: sensorData.soil?.npk?.k,
      ph: sensorData.soil?.ph, moisture: sensorData.soil?.moisture,
      temp: sensorData.weather?.temperature || 25, hum: sensorData.weather?.humidity || 50, rain: sensorData.weather?.rainLevel || 0,
      season: 'Kharif', soil: 'Loamy', weather: 'Humid', month: MONTHS[new Date().getMonth()]
    };

    const isAvailable = (v) => v !== null && v !== 0 && v !== undefined && v !== '---';
    const calcScore = (val, range) => !isAvailable(val) ? 0 : Math.max(0, Math.min(1, 1 - (Math.abs(val - range.mid) / range.range)));

    // ─── 📊 SENSOR TABLE ENGINE ───
    const sensors = [
      { id: 'Nitrogen', val: cur.n, range: profile.n, unit: 'kg/ha' },
      { id: 'Phosphorus', val: cur.p, range: profile.p, unit: 'kg/ha' },
      { id: 'Potassium', val: cur.k, range: profile.k, unit: 'kg/ha' },
      { id: 'Soil pH', val: cur.ph, range: profile.ph, unit: 'pH' },
      { id: 'Moisture', val: cur.moisture, range: profile.moisture, unit: '%' },
      { id: 'Temperature', val: cur.temp, range: profile.temperature, unit: '°C' },
      { id: 'Rainfall', val: cur.rain, range: profile.rainfall, unit: 'mm' }
    ].map(s => {
      const active = isAvailable(s.val);
      const status = active ? (s.val < s.range.min ? '🔴 Low' : (s.val > s.range.max ? '🟠 Excess' : '🟢 Good')) : '⚠ Offline';
      return { ...s, status, score: calcScore(s.val, s.range) };
    });

    const activeSensors = sensors.filter(s => !s.status.includes('Offline'));
    const confidence = Math.round((activeSensors.length / sensors.length) * 100);
    const avgScore = activeSensors.length > 0
      ? (activeSensors.reduce((a, s) => a + s.score, 0) / activeSensors.length) * (confidence / 100)
      : 0;
    const matchPercent = Math.min(100, Math.round(avgScore * 100));

    // ─── ⚖️ STRICT MATCH TABLE ───
    const matchTable = [
      { f: 'Weather Type', ideal: meta.weather || 'N/A', cur: cur.weather, s: (meta.weather && meta.weather.includes(cur.weather)) ? '✅' : '❌' },
      { f: 'Soil Type', ideal: meta.soil || 'N/A', cur: cur.soil, s: (meta.soil && meta.soil.includes(cur.soil)) ? '✅' : '❌' },
      { f: 'Season', ideal: meta.season || 'N/A', cur: cur.season, s: meta.season === cur.season ? '✅' : '❌' }
    ];
    // Sowing Logic
    const [sS, sE] = (meta.sow || 'Jan-Dec').split('-');
    const sIdx = MONTHS.indexOf(sS);
    const eIdx = MONTHS.indexOf(sE);
    const cIdx = MONTHS.indexOf(cur.month);
    let sowS = '❌', sowL = 'Wrong Time';
    if (cIdx >= sIdx && cIdx <= eIdx) { sowS = '✅'; sowL = 'On Time'; }
    else if (Math.min(Math.abs(cIdx - sIdx), Math.abs(cIdx - eIdx)) <= 1) { sowS = '⚠️'; sowL = 'Late/Early'; }
    matchTable.push({ f: 'Sowing Time', ideal: meta.sow || 'N/A', cur: cur.month, s: sowS, label: sowL });

    // ─── 🧪 FERTILIZER ENGINE ───
    const defN = isAvailable(cur.n) && profile.n?.mid ? Math.max(0, profile.n.mid - cur.n) : 0;
    const defP = isAvailable(cur.p) && profile.p?.mid ? Math.max(0, profile.p.mid - cur.p) : 0;
    const defK = isAvailable(cur.k) && profile.k?.mid ? Math.max(0, profile.k.mid - cur.k) : 0;
    let urea = (defN / 0.46) + (meta.bU * 0.3);
    let ssp = (defP / 0.16) + (meta.bS * 0.3);
    let mop = (defK / 0.60) + (meta.bM * 0.3);
    const fertReasons = [];
    if (cur.temp > profile.temperature.max) { urea *= 0.9; fertReasons.push("High heat reduction"); }
    if (cur.moisture < profile.moisture.min) { urea *= 1.1; fertReasons.push("Low moisture adjustment"); }
    const fertReason = fertReasons.length > 0 ? fertReasons.join(" • ") : "Standard biological dose";

    // ─── 🌿 COMPOST ENGINE ───
    let compost = meta.bC;
    const cReasons = [];
    if (isAvailable(cur.moisture) && cur.moisture < profile.moisture.min) { compost += 2; cReasons.push("Low moisture"); }
    if (meta.soil.includes("Sandy")) { compost += 2; cReasons.push("Sandy soil"); }
    if (isAvailable(cur.n) && cur.n < profile.n.min) { compost += 1; cReasons.push("N-Deficiency"); }
    const compostReason = cReasons.length > 0 ? cReasons.join(" + ") : "Ideal field balance";

    // ─── 🐛 PESTICIDE ENGINE ───
    const detectedPests = meta.pests.filter(p => (!p.tm || cur.temp >= p.tm) && (!p.hm || cur.hum >= p.hm) && (!p.rm || cur.rain >= p.rm))
      .map(p => ({ ...p, severity: (cur.temp > profile.temperature.max ? 'High' : 'Moderate') }));

    const status = matchPercent > 60 ? 'Recommended' : 'Not Recommended';
    const risk = matchPercent > 75 ? 'Low' : (matchPercent > 45 ? 'Medium' : 'High');
    const worst = [...sensors].sort((a, b) => (isAvailable(a.val) ? a.score : 1) - (isAvailable(b.val) ? b.score : 1))[0];

    return {
      matchPercent, status, risk, confidence,
      reason: !isAvailable(worst.val) ? 'Telemetric gaps detected' : `Extreme ${worst.id} mismatch`,
      sensors, matchTable, urea: urea * area, ssp: ssp * area, mop: mop * area, fertReason,
      compost: compost * area, cVal: compost, compostReason, detectedPests, meta
    };
  }, [db, selectedCrop, sensorData, area]);

  if (db.loading || !brain) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw className="animate-spin" color={COLORS['🟢']} /></div>;

  return (
    <div className="no-scrollbar" style={{ background: COLORS.bg, minHeight: '100dvh', paddingBottom: '10rem', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>

      {/* 🚀 STICKY HERO ENGINE */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1000, background: COLORS.bg, padding: '0.75rem' }}>
        <motion.div style={{ opacity: heroOpacity, background: 'white', borderRadius: collapsed ? '22px' : '35px', border: `2.5px solid ${brain.matchPercent > 60 ? COLORS['🟢'] : COLORS['🔴']}`, boxShadow: '0 20px 50px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: collapsed ? '12px 20px' : '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: brain.matchPercent > 60 ? COLORS['🟢'] : COLORS['🔴'] }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 950, color: COLORS.subtext, textTransform: 'uppercase' }}>{brain.status}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: collapsed ? '1.2rem' : '2rem', fontWeight: 950, color: COLORS.text }}>{selectedCrop.toUpperCase()}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: collapsed ? '1.2rem' : '2.5rem', fontWeight: 950, color: brain.matchPercent > 60 ? COLORS['🟢'] : COLORS['🔴'] }}>{brain.matchPercent}%</div>
                <span style={{ fontSize: '0.55rem', fontWeight: 950, opacity: 0.5 }}>SUITABILITY</span>
              </div>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '15px', borderTop: '1px solid #F1F5F9', paddingTop: '15px' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 800 }}>{brain.reason}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1, padding: '12px', background: '#F8FAFC', borderRadius: '15px', border: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: '0.55rem', fontWeight: 950, color: COLORS.subtext }}>RISK</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 950 }}>{brain.risk}</div>
                    </div>
                    <div style={{ flex: 1, padding: '12px', background: '#F8FAFC', borderRadius: '15px', border: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: '0.55rem', fontWeight: 950, color: COLORS.subtext }}>CONFIDENCE</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 950 }}>{brain.confidence}%</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div style={{ padding: '0 1.25rem' }}>

        {/* ⚙️ [ INPUT & FIELD SETUP ] */}
        <div style={{ background: 'white', borderRadius: '35px', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 950 }}>[ INPUT & FIELD SETUP ]</h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 950, color: COLORS.subtext, marginBottom: '8px', display: 'block' }}>🌱 SELECT CROP</label>
            <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}
              style={{ width: '100%', padding: '18px', borderRadius: '25px', border: '2.5px solid #F1F5F9', fontSize: '1rem', fontWeight: 950, background: '#F8FAFC', outline: 'none' }}>
              {Object.keys(db.crops).sort().map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color={COLORS['🔴']} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 950 }}>Kanchrapara</div>
                <div style={{ fontSize: '0.55rem', fontWeight: 950, color: COLORS['🟢'] }}>Auto-detected</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 950, color: COLORS['🟢'] }}>HIGH 📈</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 950, color: COLORS.subtext }}>MARKET DEMAND</div>
            </div>
          </div>
          <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '25px', border: '1.5px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 950, color: COLORS.subtext }}>📐 FARM AREA</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 950 }}>{area} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Acre</span></div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setArea(Math.max(1, area - 1))} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', border: '1.5px solid #E2E8F0' }}><Minus size={18} /></button>
              <button onClick={() => setArea(area + 1)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: COLORS.text, border: 'none', color: 'white' }}><Plus size={18} /></button>
            </div>
          </div>
        </div>

        {/* 📌 CROP SNAPSHOT */}
        <div style={{ background: '#0F172A', borderRadius: '35px', padding: '1.75rem', marginBottom: '1.5rem', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Sprout size={22} color={COLORS['🟡']} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 950, color: COLORS['🟡'] }}>📌 CROP SNAPSHOT</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><span style={{ fontSize: '0.55rem', opacity: 0.5, display: 'block' }}>TYPE</span><span style={{ fontSize: '0.9rem', fontWeight: 950 }}>{brain.meta.type}</span></div>
            <div><span style={{ fontSize: '0.55rem', opacity: 0.5, display: 'block' }}>SEASON</span><span style={{ fontSize: '0.9rem', fontWeight: 950 }}>{brain.meta.season}</span></div>
            <div><span style={{ fontSize: '0.55rem', opacity: 0.5, display: 'block' }}>WATER NEED</span><span style={{ fontSize: '0.9rem', fontWeight: 950 }}>{brain.meta.water}</span></div>
            <div><span style={{ fontSize: '0.55rem', opacity: 0.5, display: 'block' }}>DURATION</span><span style={{ fontSize: '0.9rem', fontWeight: 950 }}>{brain.meta.dur}</span></div>
          </div>
        </div>

        {/* 📡 DATA STATUS & SENSOR TABLE */}
        <div style={{ background: 'white', borderRadius: '35px', padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={20} /> SENSOR TABLE</h3>
            <div style={{ fontSize: '0.75rem', fontWeight: 950, color: COLORS['🟡'] }}>Confidence: {brain.confidence < 50 ? 'LOW' : 'HIGH'}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', paddingBottom: '10px', borderBottom: '1.5px solid #F1F5F9', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext }}>Parameter</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext }}>Value</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext }}>Range</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext, textAlign: 'right' }}>Status</span>
          </div>
          {brain.sensors.map(s => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '12px 0', borderBottom: '1px solid #F8FAFC', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{s.id}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 950 }}>{s.status.includes('Offline') ? '—' : Math.round(s.val)}</span>
              <span style={{ fontSize: '0.7rem', color: COLORS.subtext }}>{Math.round(s.range.min)}-{Math.round(s.range.max)}</span>
              <div style={{ textAlign: 'right', fontSize: '0.7rem', fontWeight: 950, color: s.status.includes('Good') ? COLORS['🟢'] : (s.status.includes('Offline') ? COLORS.subtext : COLORS['🔴']) }}>{s.status}</div>
            </div>
          ))}
        </div>

        {/* 🛠️ STRICT MATCH TABLE */}
        <div style={{ background: 'white', borderRadius: '35px', padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={20} color={COLORS['🟢']} /> [ MATCH TABLE ENGINE ]</h3>
          {brain.matchTable.map(row => (
            <div key={row.f} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr', padding: '15px 0', borderBottom: '1px solid #F8FAFC', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{row.f}</span>
              <span style={{ fontSize: '0.7rem', color: COLORS.subtext }}>{row.ideal || 'N/A'}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>{row.cur}</span>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '1.1rem' }}>{row.s}</span>
                {row.label && <span style={{ fontSize: '0.5rem', fontWeight: 950, opacity: 0.7 }}>{row.label}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* 🧪 FERTILIZER ENGINE */}
        <div style={{ background: 'white', borderRadius: '35px', padding: '1.75rem', marginBottom: '1.5rem', border: '1.5px solid #F1F5F9' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '10px' }}><FlaskConical size={20} color={COLORS['🔴']} /> FERTILIZER ENGINE</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '15px' }}>
            {[{ n: 'Urea', v: brain.urea }, { n: 'SSP', v: brain.ssp }, { n: 'MOP', v: brain.mop }].map(f => (
              <div key={f.n} style={{ padding: '15px 10px', borderRadius: '24px', background: '#F8FAFC', textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 950, color: COLORS.subtext }}>{f.n}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 950 }}>{Math.round(f.v)}kg</div>
              </div>
            ))}
          </div>
          <div style={{ borderLeft: '3px solid #EF4444', paddingLeft: '12px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext }}>PRECISION LOGIC:</span>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', fontWeight: 800 }}>{brain.fertReason}</p>
          </div>
        </div>

        {/* 🌿 COMPOST ENGINE */}
        <div style={{ background: 'white', borderRadius: '35px', padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '10px' }}><Leaf size={20} color={COLORS['🟢']} /> COMPOST ENGINE</h3>
          <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '25px', textAlign: 'center', marginBottom: '15px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 950, opacity: 0.5 }}>RECOMMENDED DOSAGE</div>
            <div style={{ fontSize: '2rem', fontWeight: 950 }}>{brain.compost} <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>Ton</span></div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS['🟢'] }}>({brain.cVal} Ton/Acre)</div>
          </div>
          <div style={{ borderLeft: '3px solid #10B981', paddingLeft: '12px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext }}>BIOLOGICAL REASON:</span>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', fontWeight: 800 }}>{brain.compostReason}</p>
          </div>
        </div>

        {/* 🐛 PESTICIDE ENGINE */}
        <div style={{ background: '#0F172A', borderRadius: '35px', padding: '1.75rem', marginBottom: '1.5rem', color: 'white' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '10px', color: COLORS['🟡'] }}><Bug size={20} /> PESTICIDE SCAN</h3>
          {brain.detectedPests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {brain.detectedPests.map(p => (
                <div key={p.n} style={{ padding: '15px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 950 }}>{p.n}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 950, color: p.severity === 'High' ? COLORS['🔴'] : COLORS['🟡'] }}>{p.severity}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Solution: {p.s}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '4px' }}>{p.r}</div>
                </div>
              ))}
            </div>
          ) : <div style={{ textAlign: 'center', padding: '20px' }}><ShieldCheck size={32} style={{ opacity: 0.2, marginBottom: '8px' }} /><p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>No active risks detected.</p></div>}
        </div>

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CropAdvisor;
