import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  User, Shield, CheckCircle2, 
  Camera, Edit3, Award, Bell, 
  Cpu, Brain, Sun, Moon, Settings2,
  Heart, AlertCircle, MapPin, Phone,
  Terminal, MousePointer2, ChevronRight,
  Zap, Star, Trophy
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
  border: '#F1F5F9'
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const ProfileCard = ({ children, title, icon: Icon, color = COLORS.primary }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: COLORS.text, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      <Icon size={16} color={color} /> {title}
    </h3>
    <div style={{ 
      background: 'white', borderRadius: '24px', padding: '1.25rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: `1px solid ${COLORS.border}`,
      position: 'relative', overflow: 'hidden'
    }}>
      {children}
    </div>
  </div>
);

const AchievementBadge = ({ icon: Icon, label, score, color }) => (
  <div style={{ 
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    padding: '12px', borderRadius: '20px', background: `${color}08`, border: `1px solid ${color}15`,
    minWidth: '85px'
  }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 950, color }}>{score}</p>
    </div>
  </div>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const Profile = () => {
  const { 
    user, farmInfo, updateProfile, 
    isDarkMode, toggleTheme, farmHealthScore,
    profileMeta, updateProfileMeta 
  } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...farmInfo, name: user?.name || 'Farmer' });
  const [profilePhoto] = useState('https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=200');

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* 1. HERO IDENTITY */}
      <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #F8FAFC 0%, transparent 70%)' }} />
        
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
             <div style={{ width: '85px', height: '85px', borderRadius: '28px', border: '4px solid white', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
                <img src={profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             </div>
             <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '28px', height: '28px', borderRadius: '50%', background: COLORS.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white' }}>
                <Camera size={12} />
             </div>
          </div>
          <div style={{ flex: 1, paddingBottom: '5px' }}>
             <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, marginBottom: '4px' }}>{formData.name}</h2>
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#064E3B', color: 'white', padding: '4px 10px', borderRadius: '10px' }}>
                <Shield size={12} />
                <span style={{ fontSize: '0.65rem', fontWeight: 900 }}>{profileMeta.role}</span>
             </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.25rem' }}>
        
        {/* 2. ACHIEVEMENTS SLIDER */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '1.5rem', padding: '4px 0' }} className="no-scrollbar">
           <AchievementBadge icon={Trophy} label="Rank" score="Elite" color={COLORS.primary} />
           <AchievementBadge icon={Star} label="Score" score="98%" color={COLORS.secondary} />
           <AchievementBadge icon={Zap} label="Activity" score="High" color={COLORS.warning} />
           <AchievementBadge icon={Award} label="Badges" score="12" color="#8B5CF6" />
        </div>

        {/* 3. SYSTEM PROFILE */}
        <ProfileCard title="System Profile" icon={User}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
               <p style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, margin: 0, textTransform: 'uppercase' }}>ACCESS LEVEL</p>
               <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: COLORS.text }}>{profileMeta.accessLevel}</h4>
            </div>
            <button 
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              style={{ padding: '8px 16px', background: isEditing ? COLORS.primary : '#F1F5F9', border: 'none', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 900, color: isEditing ? 'white' : COLORS.subtext, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isEditing ? <CheckCircle2 size={14} /> : <Edit3 size={14} />}
              {isEditing ? 'SYNC' : 'EDIT'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { label: 'System Owner', value: formData.name, key: 'name', icon: User },
              { label: 'Coordinates', value: formData.location, key: 'location', icon: MapPin },
              { label: 'Comm Link', value: formData.phone, key: 'phone', icon: Phone }
            ].map((f, i) => (
              <div key={i}>
                <p style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase' }}>{f.label}</p>
                {isEditing ? (
                  <input value={f.value} onChange={e => setFormData({...formData, [f.key]: e.target.value})} style={{ width: '100%', border: 'none', borderBottom: `1px solid ${COLORS.border}`, padding: '5px 0', fontSize: '0.9rem', fontWeight: 800, outline: 'none', background: 'transparent' }} />
                ) : (
                  <p style={{ fontSize: '0.9rem', fontWeight: 900, color: COLORS.text, margin: 0 }}>{f.value}</p>
                )}
              </div>
            ))}
          </div>
        </ProfileCard>

        {/* 4. ACTIVITY ENGINE */}
        <ProfileCard title="Activity Analytics" icon={Terminal} color={COLORS.secondary}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
             <div>
                <p style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, marginBottom: '4px' }}>COMMANDS</p>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 950, margin: 0 }}>{profileMeta.commandsIssued.toLocaleString()}</h3>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: COLORS.primary, margin: '4px 0 0 0' }}>+12% GROWTH</p>
             </div>
             <div style={{ borderLeft: `1px solid ${COLORS.border}`, paddingLeft: '12px' }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, marginBottom: '4px' }}>ALERTS RESOLVED</p>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 950, margin: 0 }}>{profileMeta.alertsResolved}</h3>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: COLORS.primary, margin: '4px 0 0 0' }}>98.2% EFFICIENCY</p>
             </div>
          </div>
        </ProfileCard>

        {/* 5. PERSONALIZATION */}
        <ProfileCard title="System Logic" icon={Settings2} color={COLORS.warning}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       {isDarkMode ? <Moon size={18} color={COLORS.secondary} /> : <Sun size={18} color={COLORS.warning} />}
                    </div>
                    <div><h4 style={{ fontSize: '0.85rem', fontWeight: 900, margin: 0 }}>Interface Mode</h4><p style={{ fontSize: '0.65rem', color: COLORS.subtext, fontWeight: 700, margin: 0 }}>Dark & Light Themes</p></div>
                 </div>
                 <button onClick={toggleTheme} style={{ width: '50px', height: '26px', borderRadius: '15px', background: isDarkMode ? COLORS.primary : '#CBD5E1', border: 'none', position: 'relative', cursor: 'pointer' }}>
                    <motion.div animate={{ x: isDarkMode ? 24 : 2 }} style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
                 </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={18} color="#8B5CF6" /></div>
                    <div><h4 style={{ fontSize: '0.85rem', fontWeight: 900, margin: 0 }}>AI Sensory Level</h4><p style={{ fontSize: '0.65rem', color: COLORS.subtext, fontWeight: 700, margin: 0 }}>Calibrate Intelligence</p></div>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
                    {['Low', 'Balanced', 'High'].map(lv => (
                      <button key={lv} onClick={() => updateProfileMeta({ aiSensitivity: lv })} style={{ padding: '8px', borderRadius: '10px', border: 'none', background: profileMeta.aiSensitivity === lv ? 'white' : 'transparent', color: profileMeta.aiSensitivity === lv ? COLORS.primary : COLORS.subtext, fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', boxShadow: profileMeta.aiSensitivity === lv ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>{lv}</button>
                    ))}
                 </div>
              </div>
           </div>
        </ProfileCard>

        {/* 6. VITALS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
           {[
             { label: 'NODES', val: '11/12', color: COLORS.primary, icon: Cpu },
             { label: 'ALERTS', val: '2', color: COLORS.warning, icon: AlertCircle },
             { label: 'HEALTH', val: `${farmHealthScore}%`, color: COLORS.secondary, icon: Heart }
           ].map((v, i) => (
             <div key={i} style={{ background: 'white', borderRadius: '24px', padding: '1rem', textAlign: 'center', border: `1px solid ${COLORS.border}` }}>
                <v.icon size={16} color={v.color} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.55rem', fontWeight: 800, color: COLORS.subtext, margin: 0 }}>{v.label}</p>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 950, color: v.color, margin: '2px 0 0 0' }}>{v.val}</h4>
             </div>
           ))}
        </div>

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Profile;
