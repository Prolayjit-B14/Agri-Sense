import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { 
  Camera, LogOut, Code, Globe, Database, Cpu,
  User, Mail, Phone, MapPin, Save, Edit3,
  ChevronRight, ShieldCheck, Fingerprint,
  Sparkles, AlertCircle, CheckCircle2,
  Settings, Zap, Wifi, HardDrive, RefreshCw,
  Github, Info, BookOpen
} from 'lucide-react';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../../api/firebase';

// ─── ANIMATION VARIANTS ─────────────────────────────────────────────────────
const ANIM = {
  container: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  },
  item: {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
  }
};

// ─── REUSABLE PREMIUM COMPONENTS ─────────────────────────────────────────────

const Badge = ({ children, color = 'var(--primary)', icon: Icon }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', borderRadius: '12px',
    background: `${color}15`, color: color,
    fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'
  }}>
    {Icon && <Icon size={12} strokeWidth={3} />}
    {children}
  </div>
);

const SectionHeader = ({ title, icon: Icon, color = 'var(--primary)' }) => (
  <div style={{ padding: '24px 24px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ 
      width: '36px', height: '36px', borderRadius: '12px', 
      background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' 
    }}>
      {Icon && <Icon size={18} color={color} strokeWidth={2.5} />}
    </div>
    <h3 style={{ 
      fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', 
      textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 
    }}>
      {title}
    </h3>
  </div>
);

const InfoRow = ({ label, value, icon: Icon, color = 'var(--secondary)', isEditing, onChange, placeholder, type = "text", readOnly }) => (
  <div style={{ 
    padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px',
    transition: 'all 0.3s ease'
  }}>
    <div style={{ 
      width: '42px', height: '42px', borderRadius: '14px', 
      background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      {Icon && <Icon size={20} color={color} strokeWidth={2} />}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
        {label}
      </p>
      {isEditing && !readOnly ? (
        <motion.input 
          initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ 
            width: '100%', border: 'none', padding: '4px 0', 
            fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', 
            outline: 'none', background: 'transparent', borderBottom: '2px solid var(--primary)'
          }}
        />
      ) : (
        <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value || <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Not set</span>}
        </p>
      )}
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="premium-card" style={{ 
    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', 
    border: '1px solid var(--glass-stroke)', background: 'var(--bg-card)'
  }}>
    <div style={{ 
      width: '32px', height: '32px', borderRadius: '10px', 
      background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      {Icon && <Icon size={16} color={color} strokeWidth={2.5} />}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flex: 1 }}>
      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--text-main)' }}>{value}</span>
    </div>
  </div>
);

// ─── MAIN ACCOUNT COMPONENT ─────────────────────────────────────────────────

const Account = () => {
  const navigate = useNavigate();
  const { 
    user, updateUser, logout, farmInfo, updateBranding, syncDeviceId, currentGPS, syncGPS, profileMeta, isDarkMode, toggleTheme
  } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    photo: user?.photo || user?.photoURL || ''
  });

  const [codename, setCodename] = useState(farmInfo?.projectName || '');
  const [clientId, setClientId] = useState(farmInfo?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (user && !isSaving) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        photo: user.photo || user.photoURL || ''
      });
    }
  }, [user, isSaving]);

  useEffect(() => {
    if (farmInfo && !isSaving) {
      setCodename(farmInfo.projectName || '');
      setClientId(farmInfo.name || '');
    }
  }, [farmInfo, isSaving]);

  const handleImageUpload = async () => {
    try {
      const { Camera: CapCamera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const image = await CapCamera.getPhoto({
        quality: 90, allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt
      });

      if (image?.base64String) {
        setIsUploading(true);
        const userKey = user?.email || user?.uid || 'guest_user';
        const storageRef = ref(storage, `profiles/${userKey}_dp.jpg`);
        await uploadString(storageRef, image.base64String, 'base64', { contentType: 'image/jpeg' });
        const downloadURL = await getDownloadURL(storageRef);
        setFormData(prev => ({ ...prev, photo: downloadURL }));
        await updateUser({ photo: downloadURL });
        showToast("Profile Snapshot Updated! 📸");
      }
    } catch (err) {
      showToast("Camera access restricted.", 'error');
    } finally { setIsUploading(false); }
  };

  const handleFetchLocation = async () => {
    try {
      const city = await syncGPS();
      if (city) showToast(`Geospatial Link Active: ${city} 📍`);
      else showToast("GPS Link Timeout.", 'error');
    } catch (err) {
      showToast("GPS Link Timeout.", 'error');
    }
  };

  const handleSaveChanges = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const success = await updateUser(formData);
      if (success) {
        const brandSuccess = await updateBranding({ projectName: codename, name: clientId });
        if (brandSuccess) {
          syncDeviceId(codename, clientId);
          showToast("Cloud Synchronized Successfully ✅");
          setIsEditing(false);
        } else showToast("Device Info Save Failed.", 'error');
      } else showToast("Profile Sync Error.", 'error');
    } catch (e) { 
      showToast("Sync Error Occurred.", 'error'); 
    } finally { setIsSaving(false); }
  };

  return (
    <motion.div 
      initial="hidden" animate="visible" variants={ANIM.container}
      className="no-scrollbar" 
      style={{ 
        padding: '20px', paddingBottom: '140px', background: 'var(--bg-main)', 
        minHeight: '100dvh', display: 'flex', flexDirection: 'column', 
        gap: '24px', boxSizing: 'border-box', fontFamily: "'Outfit', sans-serif" 
      }}
    >
      
      {/* 🛡️ TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.9, x: '-50%' }}
            animate={{ y: 30, opacity: 1, scale: 1, x: '-50%' }}
            exit={{ y: -100, opacity: 0, scale: 0.9, x: '-50%' }}
            style={{ 
              position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 5000,
              background: toast?.type === 'error' ? 'var(--danger)' : 'var(--text-main)',
              backdropFilter: 'blur(20px)', color: 'white', padding: '14px 28px', 
              borderRadius: 'var(--radius-2xl)', fontWeight: 800, fontSize: '0.85rem',
              boxShadow: 'var(--shadow-premium)', border: '1px solid var(--glass-border)',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}
          >
            {toast?.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} color="var(--primary)" />}
            <span>{toast?.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 1. PROFILE HERO SECTION */}
      <motion.div variants={ANIM.item} style={{ position: 'relative' }}>
        <div className="premium-card" style={{ 
          padding: '32px 24px', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
          background: 'var(--bg-card)', boxShadow: 'var(--shadow-premium)'
        }}>
          {/* Abstract background shapes */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.08 }} />
          <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--secondary)', filter: 'blur(100px)', opacity: 0.08 }} />

          {/* Avatar Container */}
          <div style={{ position: 'relative' }} onClick={handleImageUpload}>
            <motion.div 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ 
                width: '110px', height: '110px', borderRadius: '40px', 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                boxShadow: '0 15px 35px rgba(16, 185, 129, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', cursor: 'pointer', border: '4px solid var(--bg-card)'
              }}
            >
              {formData.photo ? (
                <img src={formData.photo} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isUploading ? 0.4 : 1 }} alt="Profile" />
              ) : (
                <User size={48} color="white" strokeWidth={1.5} />
              )}
              {isUploading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '24px', height: '24px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                </div>
              )}
            </motion.div>
            <div style={{ 
              position: 'absolute', bottom: '2px', right: '2px', 
              background: 'var(--primary)', width: '32px', height: '32px', 
              borderRadius: '12px', border: '3px solid var(--bg-card)', color: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              boxShadow: 'var(--shadow-md)' 
            }}>
              <Camera size={14} strokeWidth={2.5} />
            </div>
          </div>

          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-main)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
              {user?.name || 'Farmer'}
            </h2>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', marginTop: '8px', zIndex: 1 }}>
            <StatCard label="Nodes" value={profileMeta?.nodesManaged || 5} icon={Cpu} color="var(--secondary)" />
            <StatCard 
              label="Level" 
              value={user?.email === 'prolayjitbiswas14112004@gmail.com' ? 'Admin' : 'Farmer'} 
              icon={ShieldCheck} 
              color="var(--primary)" 
            />
          </div>
        </div>
      </motion.div>

      {/* 📋 2. PERSONAL INFORMATION */}
      <motion.div variants={ANIM.item}>
        <div className="premium-card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '20px' }}>
            <SectionHeader title="Account Identity" icon={Fingerprint} color="var(--accent)" />
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
              style={{ 
                padding: '8px 16px', borderRadius: '12px', 
                background: isEditing ? 'var(--primary)' : 'var(--bg-main)',
                color: isEditing ? 'white' : 'var(--text-main)',
                border: '1px solid var(--glass-stroke)',
                fontSize: '0.7rem', fontWeight: 950, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: isEditing ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none'
              }}
            >
              {isEditing ? (isSaving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />) : <Edit3 size={14} />}
              {isEditing ? (isSaving ? 'SAVING...' : 'SAVE') : 'EDIT'}
            </motion.button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <InfoRow label="Legal Name" value={formData.name} isEditing={isEditing} onChange={e => setFormData({...formData, name: e.target.value})} icon={User} color="var(--accent)" />
            <div style={{ height: '1px', background: 'var(--bg-main)', margin: '0 24px', opacity: 0.5 }} />
            <InfoRow label="Email Registry" value={formData.email} readOnly icon={Mail} color="var(--secondary)" />
            <div style={{ height: '1px', background: 'var(--bg-main)', margin: '0 24px', opacity: 0.5 }} />
            <InfoRow label="Primary Phone" type="tel" value={formData.phone} isEditing={isEditing} onChange={e => setFormData({...formData, phone: e.target.value})} icon={Phone} color="var(--primary)" />
            <div style={{ height: '1px', background: 'var(--bg-main)', margin: '0 24px', opacity: 0.5 }} />
            
            <div onClick={handleFetchLocation} style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} color="var(--danger)" strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Deployment Location</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{currentGPS?.city || 'Locating Field...'}</p>
              </div>
              <motion.div whileTap={{ rotate: 180 }} style={{ color: 'var(--primary)' }}><RefreshCw size={18} /></motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🚀 3. DEVICE & SYSTEM INFRASTRUCTURE */}
      <motion.div variants={ANIM.item}>
        <div className="premium-card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
          <SectionHeader title="System Core" icon={Zap} color="var(--secondary)" />
          
          <div style={{ padding: '0 24px 24px' }}>
             <div style={{ 
               background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '20px',
               display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'
             }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Network Cluster</span>
                  {isEditing ? (
                    <input value={codename} onChange={e => setCodename(e.target.value)} style={{ border: 'none', background: 'var(--bg-card)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--secondary)', width: '100%' }} />
                  ) : (
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--secondary)' }}>{codename}</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Main Node ID</span>
                  {isEditing ? (
                    <input value={clientId} onChange={e => setClientId(e.target.value)} style={{ border: 'none', background: 'var(--bg-card)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', width: '100%' }} />
                  ) : (
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>{clientId}</span>
                  )}
                </div>
             </div>
          </div>
        </div>
      </motion.div>



      {/* 💎 PREMIUM FOOTER SECTION */}
      <motion.div variants={ANIM.item} style={{ marginTop: '32px', position: 'relative' }}>
        <div className="premium-card" style={{ 
          padding: '40px 24px', borderRadius: '32px',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-premium)',
          border: '1px solid var(--glass-stroke)',
          overflow: 'hidden', position: 'relative'
        }}>
          {/* Subtle Decorative Elements */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '180px', height: '180px', background: 'var(--secondary-soft)', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.3 }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '220px', height: '220px', background: 'var(--primary-soft)', borderRadius: '50%', filter: 'blur(70px)', opacity: 0.3 }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Branding */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ 
                width: '52px', height: '52px', borderRadius: '16px', 
                background: 'var(--primary-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Sparkles size={26} color="var(--primary)" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-0.03em', color: 'var(--text-main)' }}>AgriSense Pro</h4>

              </div>
            </div>

            {/* Credits Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--secondary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Code size={16} color="var(--secondary)" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>App Developers</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-main)', display: 'block' }}>Prolayjit Biswas</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-main)', display: 'block' }}>Ankan Bhowmik</span>
                </div>
              </div>

              <div style={{ height: '1px', width: '100%', background: 'var(--bg-main)', opacity: 0.5 }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={16} color="var(--primary)" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>App Owner</span>
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-main)' }}>Team SemiColon</span>
              </div>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
              {[
                { label: 'Source', icon: Github, color: 'var(--text-main)' },
                { label: 'About', icon: Info, color: 'var(--secondary)' },
                { label: 'Docs', icon: BookOpen, color: 'var(--primary)' }
              ].map((link, i) => (
                <motion.button
                  key={i}
                  whileHover={{ y: -4, background: 'var(--bg-main)', borderColor: 'var(--primary-soft)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    flex: '1 1 100px', padding: '14px', borderRadius: '20px', 
                    background: 'var(--bg-card)', border: '1px solid var(--glass-stroke)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <link.icon size={16} color={link.color} strokeWidth={2.5} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>{link.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Version Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ 
                padding: '8px 20px', borderRadius: '20px', background: 'var(--bg-main)',
                display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--glass-stroke)'
              }}>
                <Globe size={14} color="var(--primary)" />
                <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--text-muted)' }}>
                  System Version {farmInfo?.version || '19.1.1'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🚀 SYSTEM PREFERENCES & SECURITY */}
      <motion.div variants={ANIM.item} style={{ marginTop: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <motion.div 
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="premium-card"
            style={{ 
              padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
              background: 'var(--bg-card)', boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--secondary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={18} color="var(--secondary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', margin: 0 }}>THEME</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{isDarkMode ? 'Dark' : 'Light'}</p>
            </div>
          </motion.div>

          <div 
            className="premium-card"
            style={{ 
              padding: '20px', display: 'flex', alignItems: 'center', gap: '12px',
              background: 'var(--bg-card)', boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', margin: 0 }}>SECURITY</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Encrypted</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🚀 GLOBAL ACTIONS */}
      <motion.div variants={ANIM.item} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
        <motion.button 
          whileHover={{ background: 'var(--danger)', color: 'white' }} whileTap={{ scale: 0.98 }}
          onClick={() => { logout(); navigate('/login'); }}
          style={{ 
            height: '56px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', 
            color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 800, 
            fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', gap: '10px', transition: 'all 0.3s ease'
          }}
        >
          <LogOut size={18} /> LOG OUT
        </motion.button>
      </motion.div>

    </motion.div>
  );
};

export default Account;
