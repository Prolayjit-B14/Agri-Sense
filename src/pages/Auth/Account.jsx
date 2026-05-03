import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { 
  Camera, LogOut, Code,
  Globe, Database, Cpu,
  User, Mail, Phone, MapPin, Save, 
  ChevronRight, ShieldCheck, Fingerprint,
  Sparkles, AlertCircle
} from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../../api/firebase';

const COLORS = {
  primary: '#10B981',
  primaryDark: '#059669',
  accent: '#3B82F6',
  text: '#0F172A',
  subtext: '#64748B',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: 'rgba(226, 232, 240, 0.8)',
  danger: '#EF4444',
  success: '#10B981',
  glass: 'rgba(255, 255, 255, 0.9)'
};

const SectionHeader = ({ title, color = COLORS.primary }) => (
  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center' }}>
    <div style={{ width: '4px', height: '16px', background: color, borderRadius: '2px', marginRight: '12px' }} />
    <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: COLORS.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</h3>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text", icon: Icon, iconColor = COLORS.subtext, readOnly = false }) => (
  <div style={{ 
    padding: '12px 16px', 
    background: 'white',
    borderBottom: `1px solid ${COLORS.border}`,
    display: 'flex', alignItems: 'center', gap: '16px'
  }}>
    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${iconColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {Icon && <Icon size={16} color={iconColor} strokeWidth={2.5} />}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{label}</p>
      <input 
        type={type}
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        readOnly={readOnly}
        style={{ 
          width: '100%', border: 'none', padding: '0', 
          fontSize: '0.95rem', fontWeight: 700, color: COLORS.text, 
          outline: 'none', background: 'transparent' 
        }} 
      />
    </div>
  </div>
);

const Account = () => {
  const navigate = useNavigate();
  const { 
    user, updateUser, logout, farmInfo, updateBranding, syncDeviceId, currentGPS 
  } = useApp();
  
  const [formData, setFormData] = useState({ 
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    photo: user?.photo || user?.photoURL || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=200'
  });

  const [codename, setCodename] = useState(farmInfo?.projectName || '');
  const [clientId, setClientId] = useState(farmInfo?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (user && !isSaving) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        photo: user.photo || user.photoURL || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=200'
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
      console.warn("Camera/Upload Failed:", err);
    } finally { setIsUploading(false); }
  };

  const handleFetchLocation = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      const locStr = `${coordinates.coords.latitude.toFixed(4)}, ${coordinates.coords.longitude.toFixed(4)}`;
      setFormData(prev => ({ ...prev, location: locStr }));
      showToast("Geospatial Link Active! 📍");
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
        await updateBranding({ projectName: codename, name: clientId });
        syncDeviceId(codename, clientId);
        showToast("Cloud Synchronized Successfully ✅");
      } else { throw new Error("Update Failed"); }
    } catch (e) { showToast("Sync Error Occurred.", 'error'); } 
    finally { setIsSaving(false); }
  };

  return (
    <div className="no-scrollbar" style={{ padding: '16px', background: COLORS.bg, height: '100%', overflowY: 'auto', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* 🛡️ TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 20, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.9 }}
            style={{ 
              position: 'fixed', top: 0, left: '50%', x: '-50%', zIndex: 3000,
              background: toast?.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)', color: 'white', padding: '12px 28px', 
              borderRadius: '40px', fontWeight: 800, fontSize: '0.85rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}
          >
            {toast.type === 'error' ? <AlertCircle size={18} /> : <Sparkles size={18} color={COLORS.primary} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 1. HERO PROFILE CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)', 
          borderRadius: '32px', padding: '24px', marginBottom: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(16, 185, 129, 0.1)'
        }}
      >
        <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '150px', height: '150px', background: COLORS.primary, filter: 'blur(80px)', opacity: 0.08 }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative' }} onClick={handleImageUpload}>
            <div style={{ width: '80px', height: '80px', borderRadius: '28px', border: `2px solid ${COLORS.primary}20`, overflow: 'hidden', background: 'white', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
              <img src={formData.photo} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isUploading ? 0.4 : 1 }} alt="P" />
              {isUploading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '20px', height: '20px', border: `2px solid ${COLORS.primary}`, borderTopColor: 'transparent', borderRadius: '50%' }} />
                </div>
              )}
            </div>
            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: COLORS.primary, width: '28px', height: '28px', borderRadius: '10px', border: '3px solid white', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Camera size={12} strokeWidth={3} />
            </div>
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: COLORS.text, margin: 0, letterSpacing: '-0.02em' }}>{user?.name || 'Farmer'}</h2>
            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: COLORS.subtext, fontWeight: 700, wordBreak: 'break-all' }}>{user?.email}</span>
              {user?.isGuest && (
                <motion.div 
                  onClick={() => { navigator.clipboard.writeText(user.email); showToast("Registry ID Copied!"); }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '6px', 
                    background: '#ECFDF5', color: COLORS.primary, 
                    padding: '4px 12px', borderRadius: '10px', border: `1px solid ${COLORS.primary}20`,
                    cursor: 'pointer', alignSelf: 'flex-start'
                  }}
                >
                  <Fingerprint size={12} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.email.split('@')[0]}</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 📋 2. DATA REGISTRY SECTIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* PERSONAL SECTION */}
        <div style={{ background: 'white', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${COLORS.border}` }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.02)', borderBottom: `1px solid ${COLORS.border}` }}>
            <SectionHeader title="Personal Details" color="#F59E0B" />
          </div>
          <InputField label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} icon={User} iconColor="#F59E0B" />
          <InputField label="Email" value={formData.email} readOnly icon={Mail} iconColor="#3B82F6" />
          <InputField label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} icon={Phone} iconColor="#10B981" />
          
          <div onClick={handleFetchLocation} style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'rgba(16, 185, 129, 0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color="#F43F5E" strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Location</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.text, margin: 0 }}>{currentGPS?.city || 'Locate Field...'}</p>
              </div>
            </div>
            <div style={{ background: COLORS.primary, padding: '6px 12px', borderRadius: '12px', color: 'white', fontSize: '0.7rem', fontWeight: 900 }}>SYNC</div>
          </div>
        </div>

        {/* SYSTEM SECTION */}
        <div style={{ background: 'white', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${COLORS.border}` }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.02)', borderBottom: `1px solid ${COLORS.border}` }}>
            <SectionHeader title="Device Info" color="#8B5CF6" />
          </div>
          <InputField label="Project" value={codename} onChange={e => setCodename(e.target.value)} icon={Sparkles} iconColor="#8B5CF6" />
          <InputField label="Node ID" value={clientId} onChange={e => setClientId(e.target.value)} icon={Globe} iconColor="#06B6D4" />
        </div>

        {/* 🚀 GLOBAL ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <motion.button 
            whileTap={{ scale: 0.95 }} onClick={() => { logout(); navigate('/login'); }}
            style={{ height: '64px', borderRadius: '24px', background: 'white', color: COLORS.danger, border: `1px solid ${COLORS.danger}20`, fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <LogOut size={20} /> SIGN OUT
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }} onClick={handleSaveChanges} disabled={isSaving}
            style={{ height: '64px', borderRadius: '24px', background: COLORS.primary, color: 'white', border: 'none', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: `0 15px 30px ${COLORS.primary}30` }}
          >
            {isSaving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} /> : <><Save size={20} /> SAVE</>}
          </motion.button>
        </div>

        {/* 💎 PREMIUM CRYSTALLINE FOOTER (FINAL MASTERPIECE) */}
        <div style={{ 
          background: 'white', 
          borderRadius: '32px', padding: '24px', marginBottom: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header Row: Architect & Owner */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr auto 1fr', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
              {/* Architect */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Code size={18} color="#3B82F6" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Platform Architect</span>
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, paddingLeft: '2px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Prolayjit Biswas</span>
              </div>

              {/* Vertical Divider */}
              <div style={{ width: '1px', height: '48px', background: 'rgba(16, 185, 129, 0.2)' }} />

              {/* Owner */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={18} color={COLORS.primary} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Platform Owner</span>
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, paddingLeft: '2px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Semi Colon</span>
              </div>
            </div>

            {/* Bottom Row: Version Only (No Sub-Container) */}
            <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: COLORS.text, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                <span style={{ color: '#94A3B8', fontWeight: 800 }}>SYSTEM VERSION</span>
                <span style={{ marginLeft: '10px' }}>v17.3.9</span>
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
