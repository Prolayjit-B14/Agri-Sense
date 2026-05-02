import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { 
  Camera, LogOut, Code,
  Globe, Database, Cpu,
  User, Mail, Phone, MapPin, Save
} from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../../api/firebase';

const COLORS = {
  primary: '#10B981',
  text: '#0F172A',
  subtext: '#64748B',
  bg: '#FFFFFF',
  border: '#E2E8F0',
  danger: '#EF4444',
  card: '#FFFFFF'
};



const Account = () => {
  const navigate = useNavigate();
  const { 
    user, updateUser, logout, isDarkMode, toggleTheme, 
    farmInfo, updateBranding, syncDeviceId, currentGPS 
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
    if (user && !isSaving) { // Don't reset while saving
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
      // 1. Request/Check Permissions for Mobile
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt // Asks user: Camera or Gallery
      });

      if (image?.base64String) {
        setIsUploading(true);
        const userKey = user?.email || user?.uid || 'guest_user';
        const storageRef = ref(storage, `profiles/${userKey}_dp.jpg`);
        
        // 2. Upload to Firebase
        await uploadString(storageRef, image.base64String, 'base64', { contentType: 'image/jpeg' });
        
        // 3. Get URL and Update All States
        const downloadURL = await getDownloadURL(storageRef);
        setFormData(prev => ({ ...prev, photo: downloadURL }));
        await updateUser({ photo: downloadURL });
        
        showToast("Profile Picture Updated! 📸");
      }
    } catch (err) {
      console.warn("Camera/Upload Cancelled or Failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFetchLocation = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      const locStr = `${coordinates.coords.latitude.toFixed(4)}, ${coordinates.coords.longitude.toFixed(4)}`;
      setFormData(prev => ({ ...prev, location: locStr }));
      showToast("GPS Location Linked! 📍");
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
        showToast("Changes Saved Successfully ✅");
      } else {
        throw new Error("Update Failed");
      }
    } catch (e) {
      showToast("Update Failed. Check Connectivity.", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '12px', background: '#FFFFFF', paddingBottom: '0px', position: 'relative' }}>
      
      {/* CUSTOM TOAST NOTIFICATION */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={toast ? { y: 24, opacity: 1 } : { y: -60, opacity: 0 }}
        style={{ 
          position: 'fixed', top: 0, left: '50%', x: '-50%', zIndex: 2000,
          background: toast?.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'white', padding: '10px 24px', borderRadius: '40px', 
          fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          display: 'flex', alignItems: 'center', gap: '8px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <span>{toast?.message}</span>
      </motion.div>
      <div style={{ 
        background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', borderRadius: '24px', padding: '16px', 
        display: 'flex', alignItems: 'center', gap: '16px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)', marginBottom: '12px',
        border: '1px solid rgba(255, 255, 255, 0.8)'
      }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleImageUpload}>
          <div style={{ position: 'relative', width: '64px', height: '64px' }}>
            <img 
              src={formData.photo} 
              style={{ 
                width: '100%', height: '100%', borderRadius: '40px', objectFit: 'cover',
                opacity: isUploading ? 0.5 : 1, transition: 'all 0.3s ease',
                border: `2px solid ${COLORS.border}`
              }} 
              alt="Profile"
            />
            {isUploading && (
              <div style={{ 
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.4)', borderRadius: '50%'
              }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={{ width: '20px', height: '20px', border: `2px solid ${COLORS.primary}`, borderTopColor: 'transparent', borderRadius: '50%' }}
                />
              </div>
            )}
          </div>
          <div style={{ 
            position: 'absolute', bottom: '-4px', right: '-4px', 
            background: COLORS.primary, width: '28px', height: '28px', borderRadius: '14px', 
            border: '2px solid white', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)'
          }}>
            <Camera size={10} />
          </div>
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: '-0.02em' }}>
            {user?.name || 'Guest Farmer'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: COLORS.subtext, fontWeight: 600 }}>{user?.email || 'Field Operator'}</span>
            {user?.isGuest && (
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '4px', 
                background: '#F0FDF4', color: COLORS.primary, padding: '2px 8px', 
                borderRadius: '6px', border: `1px solid ${COLORS.primary}20`
              }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: COLORS.primary }} />
                <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>Guest</span>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* 2. PERSONAL INFORMATION */}
        <div style={{ background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.8)', marginBottom: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)' }}>
          <div style={{ padding: '14px 16px 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} color={COLORS.primary} strokeWidth={2} />
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Information</h3>
          </div>
          
          <div style={{ padding: '10px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.text, margin: 0, flex: 1 }}>Full Name</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1.5, justifyContent: 'flex-end' }}>
              <input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter name"
                style={{ width: '100%', border: 'none', padding: '0', fontSize: '0.85rem', fontWeight: 600, color: COLORS.subtext, textAlign: 'right', outline: 'none', background: 'transparent' }}
              />
              
            </div>
          </div>
          
          <div style={{ padding: '10px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.text, margin: 0, flex: 1 }}>Email Address</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1.5, justifyContent: 'flex-end' }}>
              <input 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email"
                style={{ width: '100%', border: 'none', padding: '0', fontSize: '0.85rem', fontWeight: 600, color: COLORS.subtext, textAlign: 'right', outline: 'none', background: 'transparent' }}
              />
              
            </div>
          </div>

          <div style={{ padding: '10px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.text, margin: 0, flex: 1 }}>Mobile Network</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1.5, justifyContent: 'flex-end' }}>
              <input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter mobile"
                style={{ width: '100%', border: 'none', padding: '0', fontSize: '0.85rem', fontWeight: 600, color: COLORS.subtext, textAlign: 'right', outline: 'none', background: 'transparent' }}
              />
              
            </div>
          </div>

          <div 
            onClick={handleFetchLocation}
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.text, margin: 0 }}>Field Location</p>
              <span style={{ fontSize: '0.55rem', fontWeight: 900, background: `${COLORS.primary}15`, color: COLORS.primary, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Sync</span>
            </div>
            <div style={{ textAlign: 'right', flex: 1.5 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.subtext, margin: 0 }}>{currentGPS?.city || 'Locating...'}</p>
              <p style={{ fontSize: '0.65rem', fontWeight: 500, color: COLORS.subtext, opacity: 0.6, margin: 0 }}>{formData.location || '0.00, 0.00'}</p>
            </div>
          </div>
        </div>

        {/* 3. DEVICE & SYSTEM */}
        <div style={{ background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', borderRadius: '24px', padding: '14px 16px', border: '1px solid rgba(255, 255, 255, 0.8)', marginBottom: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Cpu size={16} color={COLORS.primary} strokeWidth={2} />
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Device & System</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.text, margin: 0, flex: 1 }}>Project Codename</p>
              <input 
                value={codename} 
                onChange={(e) => setCodename(e.target.value)}
                placeholder="e.g. AgriSense Pro"
                style={{ width: '150px', border: 'none', borderBottom: `1px solid ${COLORS.border}`, padding: '4px 0', fontSize: '0.85rem', fontWeight: 600, color: COLORS.subtext, textAlign: 'right', outline: 'none', background: 'transparent' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.text, margin: 0, flex: 1 }}>Client Identifier</p>
              <input 
                value={clientId} 
                onChange={(e) => setClientId(e.target.value)}
                placeholder="e.g. Master Field"
                style={{ width: '150px', border: 'none', borderBottom: `1px solid ${COLORS.border}`, padding: '4px 0', fontSize: '0.85rem', fontWeight: 600, color: COLORS.subtext, textAlign: 'right', outline: 'none', background: 'transparent' }}
              />
            </div>
          </div>
          <p style={{ fontSize: '0.6rem', color: COLORS.subtext, textAlign: 'center', marginTop: '16px', opacity: 0.6 }}>
            Credentials must match your ESP32 hardware configuration
          </p>
        </div>

      {/* 4. GLOBAL ACTIONS */}
      <div style={{ marginTop: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => { logout(); navigate('/login'); }}
          style={{ 
            height: '48px', borderRadius: '14px', background: 'white', 
            color: COLORS.danger, border: `1px solid ${COLORS.danger}30`, 
            fontWeight: 950, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}
        >
          <LogOut size={16} /> SIGN OUT
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveChanges}
          disabled={isSaving}
          style={{ 
            height: '48px', borderRadius: '14px', background: COLORS.primary, 
            color: 'white', border: 'none', fontWeight: 950, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}
        >
          <Save size={16} /> SAVE CHANGES
        </motion.button>
      </div>

      {/* 5. ABOUT APP (BOTTOM) */}
      <div style={{ 
        background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', borderRadius: '24px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${COLORS.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code size={18} color={COLORS.primary} />
            </div>
            <div>
              <p style={{ fontSize: '0.55rem', fontWeight: 800, color: COLORS.subtext, margin: 0 }}>Platform Architect</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 900, color: COLORS.text, margin: 0 }}>Prolayjit Biswas</p>
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: COLORS.border, margin: '0 12px' }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.55rem', fontWeight: 800, color: COLORS.subtext, margin: 0 }}>Engine Version</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 900, color: COLORS.primary, margin: 0 }}>v17.1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
