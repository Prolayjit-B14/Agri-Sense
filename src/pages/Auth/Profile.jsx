import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { 
  User, Shield, Phone, MapPin, 
  Camera, Mail, Save, LogOut, ShieldAlert, Loader2
} from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../../api/firebase';

// ─── PREMIUM MINIMALIST TOKENS ──────────────────────────────────────────────
const COLORS = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#10B981',
  text: '#0F172A',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  input: '#F1F5F9',
  danger: '#EF4444'
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGpsSyncing, setIsGpsSyncing] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    photo: user?.photo || user?.photoURL || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=200'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        photo: user.photo || user.photoURL || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=200'
      });
    }
  }, [user]);

  const handleImageUpload = async () => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt
      });

      if (image.base64String) {
        setIsUploading(true);
        const storageRef = ref(storage, `profiles/${user.email}_profile.jpg`);
        await uploadString(storageRef, image.base64String, 'base64', { contentType: 'image/jpeg' });
        const downloadURL = await getDownloadURL(storageRef);
        
        setFormData({ ...formData, photo: downloadURL });
        alert("Image Uploaded Successfully! 📸");
      }
    } catch (err) {
      console.error("Image Upload Failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFetchLocation = async () => {
    setIsGpsSyncing(true);
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      const locStr = `${coordinates.coords.latitude.toFixed(4)}, ${coordinates.coords.longitude.toFixed(4)}`;
      setFormData({ ...formData, location: locStr });
    } catch (err) {
      alert("📡 GPS Link Timeout. Ensure Location is ON.");
    } finally {
      setIsGpsSyncing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser(formData);
      alert("Profile Securely Updated ✅");
    } catch (e) {
      alert("Update Failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ 
      height: '100dvh', width: '100vw', background: COLORS.background, color: COLORS.text,
      fontFamily: "'Outfit', sans-serif", overflow: 'hidden', display: 'flex', flexDirection: 'column'
    }}>
      
      {/* 1. COMPACT HEADER */}
      <div style={{ 
        padding: '30px 24px 20px', background: 'white', textAlign: 'center', 
        borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 
      }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: 'relative', display: 'inline-block' }}>
          <div onClick={handleImageUpload} style={{ cursor: 'pointer', position: 'relative' }}>
            <img src={formData.photo} style={{ width: '85px', height: '85px', borderRadius: '28px', objectFit: 'cover', border: `4px solid ${COLORS.background}`, boxShadow: '0 15px 35px rgba(0,0,0,0.06)', opacity: isUploading ? 0.5 : 1 }} />
            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: COLORS.primary, padding: '7px', borderRadius: '10px', border: `3px solid white` }}>
              {isUploading ? <Loader2 size={12} color="white" className="animate-spin" /> : <Camera size={12} color="white" />}
            </div>
          </div>
        </motion.div>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 850, marginTop: '12px', marginBottom: '2px', color: COLORS.text }}>
          {user?.isGuest ? 'Guest Farmer' : (formData.name || 'AgriSense User')}
        </h2>
        <p style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {user?.isGuest ? 'Temporary Link' : 'Verified Operator'}
        </p>
      </div>

      {/* 2. LABEL-FREE FORM */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
        <ProfileField icon={User} value={formData.name} placeholder="Operator Name" onChange={v => setFormData({...formData, name: v})} />
        <ProfileField icon={Mail} value={formData.email} placeholder="Secure Email" onChange={v => setFormData({...formData, email: v})} readOnly={!user?.isGuest} />
        <ProfileField icon={Phone} value={formData.phone} placeholder="Mobile Network" onChange={v => setFormData({...formData, phone: v})} />
        <ProfileField 
          icon={MapPin} value={formData.location} placeholder="Field Coordinates"
          onChange={v => setFormData({...formData, location: v})} 
          action={{ 
            label: isGpsSyncing ? 'SYNCING...' : 'GPS', 
            onClick: handleFetchLocation,
            isLoading: isGpsSyncing
          }}
        />
        
        <motion.button 
          whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={isSaving || isUploading}
          style={{ 
            marginTop: '8px', height: '58px', borderRadius: '18px', background: COLORS.primary,
            color: 'white', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
            boxShadow: `0 10px 25px ${COLORS.primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            opacity: (isSaving || isUploading) ? 0.6 : 1
          }}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? 'SYNCING...' : 'SAVE PROFILE'}
        </motion.button>

        <button 
          onClick={() => { logout(); navigate('/login'); }}
          style={{ 
            height: '58px', borderRadius: '18px', background: 'white', border: `1px solid ${COLORS.danger}20`,
            color: COLORS.danger, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '4px'
          }}
        >
          <LogOut size={18} /> SIGN OUT
        </button>
      </div>

      {/* 3. TACTICAL FOOTER */}
      <div style={{ padding: '15px', textAlign: 'center', borderTop: `1px solid ${COLORS.border}`, background: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.55rem', fontWeight: 900, color: COLORS.textMuted, opacity: 0.5, textTransform: 'uppercase' }}>
          <ShieldAlert size={12} /> SECURE INDUSTRIAL LINK v20.2
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ icon: Icon, value, placeholder, onChange, action, readOnly }) => (
  <div style={{ 
    background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '16px', padding: '16px 18px',
    display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
  }}>
    <Icon size={18} color={COLORS.primary} strokeWidth={2.5} />
    <input 
      value={value} onChange={e => onChange(e.target.value)} readOnly={readOnly}
      placeholder={placeholder}
      style={{ 
        flex: 1, background: 'none', border: 'none', color: COLORS.text, 
        fontSize: '0.95rem', fontWeight: 600, outline: 'none', opacity: readOnly ? 0.5 : 1
      }}
    />
    {action && (
      <button 
        onClick={action.onClick}
        disabled={action.isLoading}
        style={{ 
          background: `${COLORS.primary}15`, border: 'none', color: COLORS.primary, 
          fontSize: '0.6rem', fontWeight: 900, padding: '7px 10px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}
      >
        {action.isLoading && <Loader2 size={10} className="animate-spin" />}
        {action.label}
      </button>
    )}
  </div>
);

export default Profile;
