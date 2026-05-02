import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../state/AppContext';
import { 
  Users, MapPin, Sprout, 
  ChevronRight, ArrowLeft,
  Search, ShieldCheck, Activity,
  Mail, Calendar, ExternalLink,
  Cpu, Database, Zap, Clock,
  Globe, Fingerprint, Server,
  Terminal, BarChart3, Radio, AlertCircle
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../api/firebase';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  secondary: '#3B82F6',
  danger: '#EF4444',
  bg: '#FFFFFF',
  card: '#FFFFFF',
  border: '#F1F5F9',
  text: '#0F172A',
  textMuted: '#64748B',
  accent: '#1E293B'
};

const AdminDashboard = () => {
  const { getAllFarmers } = useApp();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // 🛡️ NEW ERROR STATE
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, registered: 0, guest: 0, activeToday: 0 });

  useEffect(() => {
    // 🛰️ LIVE SATELLITE STREAM: Listen for database changes in real-time
    try {
      const q = query(collection(db, "farmers"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("🛰️ [ADMIN] Global Registry Sync:", data.length, "units online");
        
        // 🛡️ SHOW ALL USERS: No more filtering, let the admin see everything
        setFarmers(data);
        setError(null); 

        // Global Statistics Engine
        const today = new Date().toISOString().split('T')[0];
        setStats({
          total: data.length,
          registered: data.filter(f => !f.isGuest).length,
          guest: data.filter(f => f.isGuest).length,
          activeToday: data.filter(f => f.lastLogin?.includes(today)).length
        });
        
        setLoading(false);
      }, (err) => {
        console.error("📡 FIREBASE STREAM ERROR:", err);
        setError(err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const filteredFarmers = farmers.filter(f => {
    const searchLow = search.toLowerCase();
    const nameMatch = (f.name || 'Unknown Farmer').toLowerCase().includes(searchLow);
    const emailMatch = (f.email || '').toLowerCase().includes(searchLow);
    return nameMatch || emailMatch;
  });

  return (
    <div style={{ 
      minHeight: '100dvh', background: COLORS.bg, color: COLORS.text,
      fontFamily: "'Outfit', sans-serif", padding: '24px'
    }}>
      
      {/* ── HEADER ── */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: `${COLORS.primary}15` }}>
              <ShieldCheck size={18} color={COLORS.primary} />
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Root Administrator
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: COLORS.accent, margin: 0, letterSpacing: '-0.02em' }}>
            Command Center
          </h1>
          <p style={{ fontSize: '0.85rem', color: COLORS.textMuted, marginTop: '2px' }}>Global Registry Management & Node Overview</p>
        </div>

        <div style={{ 
          background: COLORS.accent, padding: '10px 16px', borderRadius: '16px',
          display: 'flex', alignItems: 'center', gap: '10px', color: 'white',
          boxShadow: '0 10px 20px rgba(30, 41, 59, 0.1)'
        }}>
          <Server size={18} color={COLORS.primary} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.55rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Server Status</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>CLOUD ACTIVE</div>
          </div>
        </div>
      </div>

      {/* ── ERROR ALERT ── */}
      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
          color: COLORS.danger, padding: '16px', borderRadius: '16px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', fontWeight: 600
        }}>
          <AlertCircle size={18} />
          <span>Cloud Connection Error: {error}</span>
        </div>
      )}

      {/* ── GLOBAL STATS GRID ── */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', 
        marginBottom: '32px' 
      }}>
        <StatCard label="Total Registry" value={stats.total} icon={Users} color={COLORS.secondary} />
        <StatCard label="Live Syncs Today" value={stats.activeToday} icon={Zap} color={COLORS.primary} />
        <StatCard label="Registered Units" value={stats.registered} icon={Fingerprint} color="#8B5CF6" />
        <StatCard label="Guest Sessions" value={stats.guest} icon={Radio} color={COLORS.textMuted} />
      </div>

      {/* ── REGISTRY SECTION ── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '16px', padding: '0 4px'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: COLORS.accent }}>Deployment Registry</h2>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.textMuted }}>{filteredFarmers.length} Units Found</div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} color={COLORS.textMuted} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" placeholder="Search operational ID or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', height: '58px', background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', 
              border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '20px',
              paddingLeft: '52px', fontSize: '0.95rem', fontWeight: 600,
              outline: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)'
            }}
          />
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                  <Database size={32} color={COLORS.primary} style={{ opacity: 0.3 }} />
                </motion.div>
                <p style={{ marginTop: '16px', fontSize: '0.85rem', fontWeight: 700, color: COLORS.textMuted }}>Synchronizing with Global Database...</p>
              </div>
            ) : filteredFarmers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', borderRadius: '24px', border: '1px dashed rgba(255, 255, 255, 0.8)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9)' }}>
                <p style={{ color: COLORS.textMuted, fontSize: '0.9rem' }}>No operational records found.</p>
              </div>
            ) : (
              filteredFarmers.map((farmer, i) => (
                <FarmerRow key={farmer.email} farmer={farmer} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    style={{ 
      background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', padding: '20px', borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)'
    }}
  >
    <div style={{ 
      width: '40px', height: '40px', borderRadius: '12px', background: `${color}10`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
    }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: COLORS.accent, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase', marginTop: '6px', letterSpacing: '0.05em' }}>{label}</div>
  </motion.div>
);

const FarmerRow = ({ farmer, index }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    style={{ 
      background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', borderRadius: '24px', padding: '16px 20px',
      border: '1px solid rgba(255, 255, 255, 0.8)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)',
      marginBottom: '8px'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ position: 'relative' }}>
        <img 
          src={farmer.photo || `https://ui-avatars.com/api/?name=${farmer.name || 'F'}&background=10B981&color=fff`} 
          style={{ width: '52px', height: '52px', borderRadius: '16px', objectFit: 'cover' }} 
        />
        <div style={{ 
          position: 'absolute', bottom: '-4px', right: '-4px',
          padding: '4px', borderRadius: '6px', background: farmer.isGuest ? '#F1F5F9' : '#ECFDF5',
          border: '2px solid white'
        }}>
          {farmer.isGuest ? <Terminal size={10} color="#64748B" /> : <Globe size={10} color={COLORS.primary} />}
        </div>
      </div>

      <div>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: COLORS.accent }}>{farmer.name || 'System Operator'}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          {farmer.email?.toLowerCase() === 'prolayjitbiswas14112004@gmail.com' ? (
            <span style={{ 
              fontSize: '0.55rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px',
              background: 'rgba(16, 185, 129, 0.1)', color: '#10B981',
              textTransform: 'uppercase'
            }}>
              ADMINISTRATOR
            </span>
          ) : (
            <span style={{ 
              fontSize: '0.55rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px',
              background: farmer.isGuest ? '#F1F5F9' : '#ECFDF5', color: farmer.isGuest ? '#64748B' : COLORS.primary,
              textTransform: 'uppercase'
            }}>
              {farmer.isGuest ? 'GUEST SESSION' : 'REGISTERED UNIT'}
            </span>
          )}
          <span style={{ fontSize: '0.65rem', color: COLORS.textMuted, fontWeight: 600 }}>{farmer.email}</span>
        </div>
      </div>
    </div>

    <div style={{ textAlign: 'right' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginBottom: '4px' }}>
        <Clock size={12} color={COLORS.textMuted} />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.accent }}>
          {farmer.lastLogin ? new Date(farmer.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
        <MapPin size={10} color={COLORS.primary} />
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.textMuted }}>{farmer.location?.split('•')[1] || farmer.location || 'Unknown'}</span>
      </div>
    </div>
  </motion.div>
);

export default AdminDashboard;
