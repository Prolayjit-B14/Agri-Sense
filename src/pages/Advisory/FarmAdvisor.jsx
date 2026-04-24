/**
 * Farm Advisor v17.1.0 - Industrial Agronomy Decision Suite
 * Comprehensive Overhaul: Integrating Match, Fertilizer, Compost, and Pest Engines.
 * 
 * Aesthetics: Industrial Premium, Consistent Padding/Margins, Framer Motion.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  MapPin, Zap, Calculator, RefreshCw, Activity, Target, Plus, Minus,
  Bug, ShieldCheck, Leaf, Sprout, Globe, AlertCircle, CheckCircle2,
  XCircle, Waves, Clock, FlaskConical, BarChart3, CloudRain, Thermometer,
  ChevronDown, TrendingUp, Droplets
} from 'lucide-react';
import { useApp } from '../../state/AppContext';

// ─── ASSET IMPORTS ──────────────────────────────────────────────────────────
import cropCsv from '../../data/CropSuitabilityData_Final.csv?url';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  primaryDark: '#059669',
  secondary: '#0EA5E9',
  danger: '#EF4444',
  warning: '#F59E0B',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  textMain: '#0F172A',
  textMuted: '#64748B',
  border: 'rgba(0, 0, 0, 0.04)',
};

const RAD = {
  card: '32px',
  inner: '20px',
  btn: '16px'
};

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
    if (!crops[label]) {
      crops[label] = { 
        n: [], p: [], k: [], temperature: [], humidity: [], ph: [], rainfall: [],
        season: row.season, soil: row.soil_type, loc: row.location, sow: row.sowing_time,
        fert: row.fertilizer, comp: row.compost, pest: row.pest_control
      };
    }
    ['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall'].forEach(key => {
      const val = parseFloat(row[key]); if (!isNaN(val)) crops[label][key].push(val);
    });
  });
  const final = {};
  Object.keys(crops).forEach(label => {
    const r = crops[label];
    final[label] = { ...r };
    ['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall'].forEach(key => {
      const v = r[key];
      if (v.length === 0) { final[label][key] = { min: 0, max: 0, avg: 0, range: 1, mid: 0 }; return; }
      const min = Math.min(...v), max = Math.max(...v), avg = v.reduce((a, b) => a + b, 0) / v.length;
      final[label][key] = { min, max, avg, range: max - min || 1, mid: (min + max) / 2 };
    });
    const rain = final[label].rainfall || { min: 0, max: 0, avg: 0 };
    final[label].moisture = {
      min: Math.max(5, (rain.min || 0) / 20),
      max: Math.min(100, (rain.max || 0) / 10),
      avg: Math.min(90, (rain.avg || 0) / 15)
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
  wheat: { type: 'Grain', season: 'Rabi', water: 'MEDIUM', dur: '110–140d', bU: 120, bS: 50, bM: 40, bC: 2, soil: 'Loamy', weather: 'Cool/Dry', sow: 'Oct-Nov', pests: [{ n: 'Rust', s: 'Propiconazole', tm: 18, hm: 60, rm: 0, r: 'Cool moisture' }] },
  tomato: { type: 'Vegetable', season: 'Year-round', water: 'MEDIUM', dur: '60–80d', bU: 110, bS: 70, bM: 90, bC: 4, soil: 'Loamy', weather: 'Warm', sow: 'Jan-Feb', pests: [{ n: 'Hornworm', s: 'Bt Spray', tm: 25, hm: 65, rm: 0, r: 'High temp' }] },
  potato: { type: 'Vegetable', season: 'Rabi', water: 'MEDIUM', dur: '90–120d', bU: 135, bS: 90, bM: 175, bC: 5, soil: 'Loose Loam', weather: 'Cool', sow: 'Oct-Nov', pests: [{ n: 'Late Blight', s: 'Fungicide', tm: 18, hm: 85, rm: 0, r: 'High humidity' }] },
  rose: { type: 'Flower', season: 'Perennial', water: 'MEDIUM', dur: 'Yearly', bU: 70, bS: 45, bM: 45, bC: 2, soil: 'Clay Loam', weather: 'Moderate', sow: 'Dec-Feb', pests: [{ n: 'Aphids', s: 'Neem Oil', tm: 22, hm: 55, rm: 0, r: 'New growth' }] },
  marigold: { type: 'Flower', season: 'Year-round', water: 'LOW', dur: '60–70d', bU: 55, bS: 35, bM: 35, bC: 1, soil: 'Any', weather: 'Warm', sow: 'Feb-Mar', pests: [{ n: 'Slugs', s: 'Iron Phosphate', tm: 25, hm: 50, rm: 0, r: 'Wet soil' }] },
  sugarcane: { type: 'Cash Crop', season: 'Annual', water: 'HIGH', dur: '300–360d', bU: 225, bS: 90, bM: 135, bC: 6, soil: 'Deep Loam', weather: 'Hot/Humid', sow: 'Feb-Mar', pests: [{ n: 'Borer', s: 'Carbofuran', tm: 30, hm: 80, rm: 0, r: 'Monsoon' }] },
  cotton: { type: 'Fiber', season: 'Kharif', water: 'MEDIUM', dur: '150–180d', bU: 110, bS: 50, bM: 25, bC: 3, soil: 'Black Soil', weather: 'Sunny', sow: 'May-Jun', pests: [{ n: 'Bollworm', s: 'Synthetic', tm: 28, hm: 45, rm: 0, r: 'Dry periods' }] }
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const FarmAdvisor = () => {
  const { sensorData, user } = useApp();
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [area, setArea] = useState(1);
  const [db, setDb] = useState({ crops: null, loading: true });
  const [collapsed, setCollapsed] = useState(false);
  const [showOnlyIssues, setShowOnlyIssues] = useState(false);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 80], [1, 0.98]);

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setCollapsed(v > 60));
    fetch(cropCsv).then(r => r.text()).then(t => setDb({ crops: aggregateCropProfiles(parseCSV(t)), loading: false }));
    return () => unsub();
  }, [scrollY]);

  const brain = useMemo(() => {
    if (db.loading || !db.crops?.[selectedCrop]) return null;

    const profile = db.crops[selectedCrop];
    const metaSource = CROP_METADATA[selectedCrop] || {};
    const meta = {
      type: metaSource.type || 'Crop',
      season: profile.season || 'Kharif',
      soil: profile.soil || 'Loamy',
      weather: profile.weather || 'Moderate',
      sow: profile.sow || 'Jan-Dec',
      loc: profile.loc || 'India',
      fert: profile.fert || 'Balanced NPK',
      comp: profile.comp || 'Organic Manure',
      pest: profile.pest || 'Neem Oil',
      // Base doses for industrial calculations (if not in CSV)
      bU: metaSource.bU || 100, bS: metaSource.bS || 60, bM: metaSource.bM || 50, bC: metaSource.bC || 3,
      pests: metaSource.pests || [{ n: profile.pest, s: 'Integrated Mgmt', tm: 25, hm: 70, rm: 0, r: 'Standard risk' }]
    };

    const month = MONTHS[new Date().getMonth()];
    const season = ['Jun','Jul','Aug','Sep','Oct'].includes(month) ? 'Kharif' : (['Nov','Dec','Jan','Feb'].includes(month) ? 'Rabi' : 'Zaid');

    const cur = {
      n: sensorData.soil?.npk?.n, p: sensorData.soil?.npk?.p, k: sensorData.soil?.npk?.k,
      ph: sensorData.soil?.ph, moisture: sensorData.soil?.moisture,
      temp: sensorData.weather?.temp, hum: sensorData.weather?.humidity, rain: sensorData.weather?.rainLevel,
      season, soil: sensorData.soil?.type, weather: sensorData.weather?.condition, month
    };

    const isAvailable = (v) => v !== null && v !== 0 && v !== undefined && v !== '---';
    const calcScore = (val, range) => !isAvailable(val) ? 0 : Math.max(0, Math.min(1, 1 - (Math.abs(val - range.mid) / range.range)));

    // ─── 📊 SMART MATCH ENGINE ───
    const sensors = [
      { id: 'Nitrogen', val: cur.n, range: profile.n, unit: 'kg/ha', rec: 'Fertilize', icon: Leaf, color: '#10B981' },
      { id: 'Phosphorus', val: cur.p, range: profile.p, unit: 'kg/ha', rec: 'Fertilize', icon: Leaf, color: '#10B981' },
      { id: 'Potassium', val: cur.k, range: profile.k, unit: 'kg/ha', rec: 'Fertilize', icon: Leaf, color: '#10B981' },
      { id: 'Soil pH', val: cur.ph, range: profile.ph, unit: 'pH', rec: 'Treat Soil', icon: FlaskConical, color: '#8B5CF6' },
      { id: 'Moisture', val: cur.moisture, range: profile.moisture, unit: '%', rec: 'Irrigate', icon: Droplets, color: '#3B82F6' },
      { id: 'Temperature', val: cur.temp, range: profile.temperature, unit: '°C', rec: 'Cooling', icon: Thermometer, color: '#EF4444' },
      { id: 'Rainfall', val: cur.rain, range: profile.rainfall, unit: 'mm', rec: 'Weather', icon: CloudRain, color: '#6366F1' }
    ].map(s => {
      const active = isAvailable(s.val);
      let status = 'Missing';
      let type = 'missing';
      let action = 'Offline';

      if (active && s.range && typeof s.range.min !== 'undefined') {
        const val = parseFloat(s.val);
        if (val < s.range.min) { status = '🔻 Below Range'; type = 'bad'; action = s.rec; }
        else if (val > s.range.max) { status = '🔺 Above Range'; type = 'bad'; action = 'Drain'; }
        else { status = '✅ Optimal'; type = 'good'; action = 'None'; }
      } else {
        status = '⚠ Not Detected';
        type = 'missing';
        action = 'Offline';
      }
      return { ...s, status, type, action };
    });


    // ─── ⚖️ CROP MATCH COMPARISON ENGINE ───
    const matchTable = [
      { f: 'Season', ideal: meta.season, cur: cur.season, isMatch: meta.season.toLowerCase().includes(cur.season.toLowerCase()), icon: Clock, color: '#F59E0B' },
      { f: 'Soil Type', ideal: meta.soil, cur: cur.soil, isMatch: meta.soil.toLowerCase().includes(cur.soil?.toLowerCase() || 'loam'), icon: Globe, color: '#10B981' },
      { f: 'Location', ideal: meta.loc, cur: 'WB, IN', isMatch: meta.loc.toLowerCase().includes('india') || meta.loc.toLowerCase().includes('wb'), icon: MapPin, color: '#0EA5E9' },
      { f: 'Sowing Time', ideal: meta.sow, cur: cur.month, icon: Activity, color: '#EF4444' },
      { f: 'Fertilizer', ideal: meta.fert, cur: 'Available', isMatch: true, icon: FlaskConical, color: '#8B5CF6' },
      { f: 'Compost', ideal: meta.comp, cur: 'Organic', isMatch: true, icon: Sprout, color: '#10B981' },
      { f: 'Pest Control', ideal: meta.pest, cur: 'Monitored', isMatch: true, icon: Bug, color: '#F43F5E' }
    ].map(row => {
      let status = '❌ Not Suitable', type = 'bad';
      if (row.f === 'Sowing Time') {
        const [sS, sE] = (row.ideal || 'Jan-Dec').split('-');
        const sIdx = MONTHS.indexOf(sS), eIdx = MONTHS.indexOf(sE), cIdx = MONTHS.indexOf(cur.month);
        if (cIdx >= sIdx && cIdx <= eIdx) { status = '✅ Suitable'; type = 'good'; }
        else if (sIdx !== -1 && eIdx !== -1 && Math.min(Math.abs(cIdx - sIdx), Math.abs(cIdx - eIdx)) <= 1) { status = '⚠ Adjustment'; type = 'warning'; }
        else if (row.ideal === 'Year-round') { status = '✅ Suitable'; type = 'good'; }
      } else if (['Fertilizer', 'Compost', 'Pest Control'].includes(row.f)) {
        status = '✅ Info Loaded'; type = 'good';
      } else if (row.isMatch) {
        status = '✅ Suitable'; type = 'good';
      }
      return { ...row, status, type, cur: isAvailable(row.cur) ? row.cur : '—' };
    });

    // ─── 🧪 FERTILIZER ENGINE ───
    const canFertilize = isAvailable(cur.n) && isAvailable(cur.p) && isAvailable(cur.k);
    const defN = canFertilize && profile.n?.mid ? Math.max(0, profile.n.mid - cur.n) : 0;
    const defP = canFertilize && profile.p?.mid ? Math.max(0, profile.p.mid - cur.p) : 0;
    const defK = canFertilize && profile.k?.mid ? Math.max(0, profile.k.mid - cur.k) : 0;
    
    let urea = canFertilize ? (defN / 0.46) + (meta.bU * 0.3) : 0;
    let ssp = canFertilize ? (defP / 0.16) + (meta.bS * 0.3) : 0;
    let mop = canFertilize ? (defK / 0.60) + (meta.bM * 0.3) : 0;
    
    const fertReasons = [];
    if (canFertilize) {
      if (cur.temp > profile.temperature.max) { urea *= 0.9; fertReasons.push("High heat reduction"); }
      if (cur.moisture < profile.moisture.min) { urea *= 1.1; fertReasons.push("Low moisture adjustment"); }
    }
    const fertReason = canFertilize ? (fertReasons.length > 0 ? fertReasons.join(" • ") : "Standard biological dose") : "Connect NPK sensors for analysis";

    // ─── 🌿 COMPOST ENGINE ───
    const canCompost = isAvailable(cur.moisture) && isAvailable(cur.ph);
    let compost = canCompost ? meta.bC : 0;
    const cReasons = [];
    if (canCompost) {
      if (cur.moisture < profile.moisture.min) { compost += 2; cReasons.push("Low moisture"); }
      if (meta.soil.includes("Sandy")) { compost += 2; cReasons.push("Sandy soil"); }
      if (isAvailable(cur.n) && cur.n < profile.n.min) { compost += 1; cReasons.push("N-Deficiency"); }
    }
    const compostReason = canCompost ? (cReasons.length > 0 ? cReasons.join(" + ") : "Ideal field balance") : "Connect Soil/pH sensors";

    // ─── 🐛 PESTICIDE ENGINE ───
    const detectedPests = [{ 
      n: profile.pest || 'Standard Control', 
      s: 'High' , 
      tm: 0, hm: 0, rm: 0, 
      r: `Industrial recommendation for ${selectedCrop}` 
    }];


    return {
      sensors, matchTable, 
      fertilizer: {
        isValid: canFertilize,
        urea: urea * area, ssp: ssp * area, mop: mop * area,
        product: profile.fert,
        reason: fertReason
      },
      compost: {
        isValid: canCompost,
        total: compost * area,
        perAcre: compost,
        product: profile.comp,
        reason: compostReason
      },
      pests: {
        detected: detectedPests
      },
      meta
    };
  }, [db, selectedCrop, sensorData, area]);

  if (db.loading || !brain) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw className="animate-spin" color={COLORS.primary} /></div>;

  const cardStyle = {
    background: COLORS.cardBg,
    borderRadius: RAD.card,
    padding: '1.5rem',
    marginBottom: '1.25rem',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
  };

  const sectionHeader = { margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: 800, color: COLORS.textMain, display: 'flex', alignItems: 'center', gap: '10px' };

  return (
    <div className="no-scrollbar" style={{ background: COLORS.background, minHeight: '100dvh', paddingBottom: '2rem', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>

      {/* 🚀 SMART CROP CARD ENGINE */}
      <div style={{ padding: '1.25rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: '#FFFFFF', borderRadius: '32px', padding: '1.75rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.06)', border: `1px solid ${COLORS.border}`,
            position: 'relative', overflow: 'hidden'
          }}
        >
          {/* 1. Header: Dropdown + Badges */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                <select 
                  value={selectedCrop} 
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  style={{ 
                    appearance: 'none', background: 'transparent', border: 'none', 
                    fontSize: '1.75rem', fontWeight: 950, color: COLORS.textMain, 
                    paddingRight: '30px', outline: 'none', cursor: 'pointer', width: '100%'
                  }}
                >
                  {Object.keys(db.crops).sort().map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
                <ChevronDown size={22} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.3 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.6 }}>
                  <MapPin size={12} color={COLORS.textMuted} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase' }}>{user?.location || 'MAKAUT, WB'}</span>
                </div>
                <div style={{ width: '1px', height: '10px', background: COLORS.border }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} color={COLORS.primary} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: COLORS.primary, textTransform: 'uppercase' }}>High Demand</span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ background: COLORS.textMain, color: 'white', padding: '6px 14px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {brain.meta.season}
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.textMuted, marginTop: '4px', textTransform: 'uppercase' }}>{brain.meta.type}</div>
            </div>
          </div>

          {/* 3. Field Control: Area Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: COLORS.textMain, padding: '12px 20px', borderRadius: '22px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Farm Area</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 950 }}>{area} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Acres</span></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setArea(Math.max(1, area - 1))} style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}><Minus size={18} /></motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setArea(area + 1)} style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'white', border: 'none', color: COLORS.textMain }}><Plus size={18} /></motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <div style={{ padding: '0 1.25rem' }}>
        {/*Misleading summaries removed per user request */}

        {/* 📋 SMART MATCH TABLE ENGINE */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: COLORS.textMain }}>🌿 Sensor Data Analysis</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.65rem', fontWeight: 800, color: COLORS.textMuted }}>Live comparison between field sensors and crop requirements</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.8fr', gap: '10px', paddingBottom: '10px', borderBottom: `2px solid ${COLORS.background}`, marginBottom: '10px' }}>
             {['PARAMETER', 'FIELD VALUE', 'IDEAL RANGE', 'STATUS'].map((h, i) => (
               <span key={i} style={{ 
                 fontSize: '0.6rem', fontWeight: 950, color: COLORS.textMuted, textTransform: 'uppercase',
                 textAlign: i === 0 ? 'left' : (i === 3 ? 'right' : 'center'),
                 paddingLeft: i === 0 ? '44px' : 0
               }}>{h}</span>
             ))}
          </div>

          {brain.sensors.map((s, idx) => {
              const statusColor = s.type === 'good' ? COLORS.primary : (s.type === 'missing' ? COLORS.textMuted : COLORS.danger);
              const statusBg = s.type === 'good' ? '#ECFDF5' : (s.type === 'missing' ? '#F8FAFC' : '#FEF2F2');

              return (
                <motion.div 
                  layout key={s.id}
                  style={{ 
                    display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.8fr', gap: '10px', 
                    padding: '14px 0', borderBottom: `1px solid ${COLORS.background}`, 
                    alignItems: 'center' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ minWidth: '32px', height: '32px', borderRadius: '10px', background: `${s.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <s.icon size={16} color={s.color} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 850, color: COLORS.textMain, whiteSpace: 'nowrap' }}>{s.id}</span>
                  </div>
                  
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: s.type === 'missing' ? COLORS.textMuted : COLORS.textMain, textAlign: 'center' }}>
                    {s.type === 'missing' ? '—' : Math.round(parseFloat(s.val))}
                  </span>
                  
                  <span style={{ fontSize: '0.7rem', fontWeight: 750, color: COLORS.textMuted, textAlign: 'center' }}>
                    {s.range ? `${Math.round(s.range.min)}-${Math.round(s.range.max)}` : '—'}
                  </span>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {s.type === 'missing' ? <RefreshCw size={18} color={COLORS.textMuted} style={{ opacity: 0.5 }} /> : (
                      s.type === 'good' ? <CheckCircle2 size={18} color={COLORS.primary} /> : <AlertCircle size={18} color={COLORS.danger} />
                    )}
                  </div>
                </motion.div>
              );
            })
          }
          
        </motion.div>

        {/* 🌾 CROP SUITABILITY CHECK TABLE */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={sectionHeader}>🌾 Crop Suitability Check</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.8fr', gap: '10px', paddingBottom: '10px', borderBottom: `2px solid ${COLORS.background}`, marginBottom: '10px' }}>
            {['PARAMETER', 'YOUR FIELD', 'IDEAL FOR CROP', 'RESULT'].map((h, i) => (
              <span key={i} style={{ 
                fontSize: '0.6rem', fontWeight: 950, color: COLORS.textMuted, textTransform: 'uppercase',
                textAlign: i === 0 ? 'left' : (i < 3 ? 'center' : 'right'),
                paddingLeft: i === 0 ? '44px' : 0
              }}>{h}</span>
            ))}
          </div>

          {brain.matchTable.map((row, idx) => {
            return (
              <div key={row.f} style={{ 
                display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.8fr', gap: '10px', 
                padding: '14px 0', borderBottom: idx === brain.matchTable.length - 1 ? 'none' : `1px solid ${COLORS.background}`, 
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ minWidth: '32px', height: '32px', borderRadius: '10px', background: `${row.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <row.icon size={16} color={row.color} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 850, color: COLORS.textMain, whiteSpace: 'nowrap' }}>{row.f}</span>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 850, color: COLORS.textMain, textAlign: 'center' }}>{row.cur}</span>
                <span style={{ fontSize: '0.7rem', color: COLORS.textMuted, fontWeight: 750, textAlign: 'center' }}>{row.ideal}</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                   {row.type === 'good' ? <CheckCircle2 size={18} color={COLORS.primary} /> : (
                     row.type === 'warning' ? <Zap size={18} color={COLORS.warning} /> : <XCircle size={18} color={COLORS.danger} />
                   )}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* 🧪 FERTILIZER ENGINE */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${COLORS.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={20} color={COLORS.primary} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 950, color: COLORS.textMain }}>FERTILIZER ENGINE</h3>
              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase' }}>Precision Nutrient Dosage</p>
            </div>
          </div>

          {!brain.fertilizer.isValid ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '20px', border: `1px dashed ${COLORS.border}` }}>
              <RefreshCw size={24} color={COLORS.textMuted} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: COLORS.textMuted }}>NPK SENSORS OFFLINE</div>
              <div style={{ fontSize: '0.65rem', color: COLORS.textMuted, opacity: 0.7, marginTop: '4px' }}>Recommendation requires live nutrient data</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Urea', val: brain.fertilizer.urea },
                  { label: 'SSP', val: brain.fertilizer.ssp },
                  { label: 'MOP', val: brain.fertilizer.mop }
                ].map(f => (
                  <div key={f.label} style={{ padding: '16px 10px', borderRadius: '20px', background: '#F8FAFC', textAlign: 'center', border: '1px solid rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>{f.label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 950, color: COLORS.textMain }}>{Math.round(f.val)}<span style={{ fontSize: '0.5em', marginLeft: '2px', opacity: 0.6 }}>kg</span></div>
                  </div>
                ))}
              </div>
              <div style={{ background: `${COLORS.primary}08`, padding: '14px', borderRadius: '18px', borderLeft: `3px solid ${COLORS.primary}`, marginBottom: '10px' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.primary, textTransform: 'uppercase', marginBottom: '4px' }}>Field Analytics</div>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 750, color: COLORS.textMain, lineHeight: 1.4 }}>{brain.fertilizer.reason}</p>
              </div>
              <div style={{ padding: '12px', borderRadius: '16px', background: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '8px' }}><Sparkles size={14} color={COLORS.primary} /></div>
                <span style={{ fontSize: '0.7rem', fontWeight: 850, color: COLORS.textMain }}>Recommendation: <span style={{ color: COLORS.primaryDark }}>{brain.fertilizer.product}</span></span>
              </div>
            </>
          )}
        </motion.div>

        {/* 🌿 COMPOST ENGINE */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${COLORS.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={20} color={COLORS.primary} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 950, color: COLORS.textMain }}>COMPOST ENGINE</h3>
              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase' }}>Organic Soil Enrichment</p>
            </div>
          </div>

          {!brain.compost.isValid ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '20px', border: `1px dashed ${COLORS.border}` }}>
              <RefreshCw size={24} color={COLORS.textMuted} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: COLORS.textMuted }}>SOIL SENSORS OFFLINE</div>
              <div style={{ fontSize: '0.65rem', color: COLORS.textMuted, opacity: 0.7, marginTop: '4px' }}>Requires Soil pH & Moisture feedback</div>
            </div>
          ) : (
            <>
              <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '1.25rem', border: '1px solid rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organic Requirement</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 950, color: COLORS.textMain, lineHeight: 1, margin: '8px 0' }}>{brain.compost.total.toFixed(1)} <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.5 }}>Ton</span></div>
                <div style={{ fontSize: '0.7rem', fontWeight: 850, color: COLORS.primary }}>({brain.compost.perAcre} Ton / Acre)</div>
              </div>
              <div style={{ background: `${COLORS.primary}08`, padding: '14px', borderRadius: '18px', borderLeft: `3px solid ${COLORS.primary}`, marginBottom: '10px' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.primary, textTransform: 'uppercase', marginBottom: '4px' }}>Soil Health Report</div>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 750, color: COLORS.textMain, lineHeight: 1.4 }}>{brain.compost.reason}</p>
              </div>
              <div style={{ padding: '12px', borderRadius: '16px', background: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '8px' }}><Sprout size={14} color={COLORS.primary} /></div>
                <span style={{ fontSize: '0.7rem', fontWeight: 850, color: COLORS.textMain }}>Ideal Method: <span style={{ color: COLORS.primaryDark }}>{brain.compost.product}</span></span>
              </div>
            </>
          )}
        </motion.div>

        {/* 🐛 PESTICIDE ENGINE */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${COLORS.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bug size={20} color={COLORS.primary} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 950, color: COLORS.textMain }}>PESTICIDE SCAN</h3>
              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase' }}>Bio-Security & Pest Risk</p>
            </div>
          </div>

          {brain.pests.detected.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {brain.pests.detected.map((p, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: '22px', background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.02)', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}><Bug size={16} color={COLORS.danger} /></div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 950, color: COLORS.textMain }}>{p.n}</span>
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 950, padding: '4px 10px', borderRadius: '20px', background: '#FEF2F2', color: COLORS.danger }}>{p.s} RISK</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: COLORS.textMuted, fontWeight: 750, lineHeight: 1.4 }}>{p.r}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.02)' }}>
              <ShieldCheck size={32} color={COLORS.primary} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 850, color: COLORS.textMain }}>SECURE ENVIRONMENT</div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.65rem', color: COLORS.textMuted, fontWeight: 700 }}>No active pest risks detected in current climate</p>
            </div>
          )}
        </motion.div>

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default FarmAdvisor;
