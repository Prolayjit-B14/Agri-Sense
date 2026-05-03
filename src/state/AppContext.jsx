/**
 * AgriSense Pro v19.0.0 Master State Manager
 * Organized Industrial State Engine for AgriSense Ecosystem.
 */

import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';

// API & Infrastructure
import mqttService from '../api/mqttService';
import { processDeviceState, calculateSystemOverview } from '../api/deviceService';
import { MASTER_CONFIG } from '../setup';
import { db, auth } from '../api/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

import { doc, setDoc, getDoc, collection, getDocs, addDoc, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Types & Data Models
import { 
  INITIAL_SENSOR_DATA, 
  INITIAL_API_WEATHER, 
  INITIAL_SYSTEM_HEALTH 
} from '../types/sensorModel';

// Business Logic Engines
import { 
  getAIv2Recommendations,
  calculateNodeHealth, 
  calculateOverallHealth,
  ACTUATORS 
} from '../logic/healthEngine';
import { processMqttMessage } from '../engines/sensorController';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  // ─── STATE DEFINITIONS ────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [currentGPS, setCurrentGPS] = useState({ lat: null, lng: null, accuracy: null, city: 'Locating...' });


  // 🛰️ LIVE GPS ENGINE: Maintain a persistent high-accuracy coordinate anchor
  useEffect(() => {
    let watchId;
    const startTracking = async () => {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        
        // 🛡️ MANDATORY PERMISSION HANDSHAKE
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') throw new Error("Permission Denied");
        }

        // 🚀 INSTANT LOCK: Get current position immediately
        const instantPos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 5000 });
        if (instantPos && instantPos.coords) {
          setCurrentGPS(prev => ({
            ...prev,
            lat: instantPos.coords.latitude,
            lng: instantPos.coords.longitude,
            accuracy: instantPos.coords.accuracy
          }));
        }

        watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, async (pos) => {
          if (pos && pos.coords) {
            const { latitude: lat, longitude: lon } = pos.coords;
            setCurrentGPS(prev => ({
              ...prev,
              lat, lng: lon, accuracy: pos.coords.accuracy
            }));

            // 🌍 Reverse Geocode
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
                headers: { 'Accept': 'application/json', 'User-Agent': 'AgriSense/19.0.0' }
              });
              if (res.ok) {
                const data = await res.json();
                const cityName = data?.address?.city || data?.address?.village || data?.address?.town || data?.address?.neighbourhood || 'Unknown Field';
                setCurrentGPS(prev => ({ ...prev, city: cityName }));
              }
            } catch (e) {}
          }
        });
      } catch (e) {
        console.warn("GPS Tracking Failed:", e.message);
      }
    };
    startTracking();
    return () => { 
      if (watchId) {
        import('@capacitor/geolocation').then(m => m.Geolocation.clearWatch({ id: watchId })).catch(() => {});
      }
    };
  }, []);

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sensorData, setSensorData] = useState(INITIAL_SENSOR_DATA);
  
  const [devices, setDevices] = useState({
    'soil_node': processDeviceState('soil_node', 'soil', null),
    'weather_node': processDeviceState('weather_node', 'weather', null),
    'storage_node': processDeviceState('storage_node', 'storage', null),
    'water_node': processDeviceState('water_node', 'water', null),
    'vision_node': processDeviceState('vision_node', 'vision', null)
  });

  const [systemOverview, setSystemOverview] = useState({
    total_nodes: 5, active_nodes: 0, partial_nodes: 0, offline_nodes: 5,
    overall_status: 'OFFLINE', health_percent: 0, nodes: []
  });

  const [apiWeather, setApiWeather] = useState(INITIAL_API_WEATHER);
  const [apiForecast, setApiForecast] = useState([]);
  const [mqttStatus, setMqttStatus] = useState('disconnected');
  const [connectivityStatus, setConnectivityStatus] = useState('Online');
  const [cloudSyncStatus, setCloudSyncStatus] = useState('Active');
  const [lastGlobalUpdate, setLastGlobalUpdate] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [actuators, setActuators] = useState({
    [ACTUATORS.PUMP]:    false,
    [ACTUATORS.VALVE]:   false,
    [ACTUATORS.SPRAYER]: false,
    [ACTUATORS.BUZZER]:  false,
    [ACTUATORS.DISPLAY]: false,
    [ACTUATORS.LIGHT]:   false,
  });

  const [nodePower, setNodePower] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_node_power');
      return saved ? JSON.parse(saved) : { soil: true, weather: true, water: true, storage: true, vision: true };
    } catch (e) {
      return { soil: true, weather: true, water: true, storage: true, vision: true };
    }
  });

  useEffect(() => {
    localStorage.setItem('agrisense_node_power', JSON.stringify(nodePower));
  }, [nodePower]);

  const toggleNodePower = (id) => {
    setNodePower(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [farmInfo, setFarmInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_branding');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed?.projectName === 'Agri Sense' || parsed?.name === 'MAKAUT, WB') {
        localStorage.removeItem('agrisense_branding');
      }
      const data = (parsed?.projectName && parsed.projectName !== 'Agri Sense')
        ? parsed
        : {
            name: MASTER_CONFIG.FARM_NAME,
            projectName: MASTER_CONFIG.PROJECT_NAME,
            tagline: MASTER_CONFIG.TAGLINE,
          };
      data.version = "17.1.0"; 
      return data;
    } catch (e) {
      return {
        name: MASTER_CONFIG.FARM_NAME,
        projectName: MASTER_CONFIG.PROJECT_NAME,
        tagline: MASTER_CONFIG.TAGLINE,
        version: "17.1.0" 
      };
    }
  });

  const [profileMeta, setProfileMeta] = useState({
    role: 'Industrial Controller',
    accessLevel: 'Admin (L5)',
    nodesManaged: 4,
    lastLogin: 'Today',
    commandsIssued: 0,
    alertsResolved: 0,
    notifications: { push: true, email: false },
    aiSensitivity: 'Balanced'
  });

  const [sensorHistory, setSensorHistory] = useState([]);

  const lastSensorUpdate = useRef(null);
  const lastHistoryUpdate = useRef(0);
  const [, setTick] = useState(0);
  const sensorDataRef = useRef(sensorData);
  const lastSavedLen = useRef(0);

  // 🛰️ FIREBASE AUTH OBSERVER
  useEffect(() => {
    // 1. Auth State Observer
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, "farmers", fbUser.email));
          const userData = {
            uid: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName || 'Farmer',
            photoURL: fbUser.photoURL,
            lastLogin: new Date().toISOString(),
            location: 'Field Zone A'
          };
          
          if (userDoc.exists()) {
            const cloudData = userDoc.data();
            if (cloudData.farmInfo) setFarmInfo(cloudData.farmInfo);
            if (cloudData.profileMeta) setProfileMeta(cloudData.profileMeta);
          } else {
            await setDoc(doc(db, "farmers", fbUser.email), userData);
          }

          setUser(userData);
          localStorage.setItem('agrisense_user', JSON.stringify(userData));

          // 🛰️ VERIFY DATABASE LINK
          const checkDb = async () => {
            try {
              const testRef = doc(db, "farmers", fbUser.email);
              await getDoc(testRef);
              setCloudSyncStatus('Connected');
            } catch (e) {
              setCloudSyncStatus('Error');
              console.error("Database Handshake Failed:", e);
            }
          };
          checkDb();

          // telRef check moved to separate useEffect

          // History population moved to separate useEffect

        } catch (err) {
          console.error("Auth/Data sync error:", err);
        } finally {
          setIsDataLoading(false);
        }
      } else {
        // Handle Guest or Logged Out
        const saved = localStorage.getItem('agrisense_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          const isAuthorizedFallback = MASTER_CONFIG.AUTHORIZED_USERS.some(u => u.email.toLowerCase() === parsed.email?.toLowerCase());
          if (parsed.isGuest || isAuthorizedFallback) {
            setUser(parsed);
          } else {
            setUser(null);
            localStorage.removeItem('agrisense_user');
          }
        }
        setIsDataLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 🛰️ UNIVERSAL HISTORY ENGINE: Fetch previous data points for any logged-in user
  useEffect(() => {
    const fetchDeepHistory = async () => {
      if (!user?.email) return;
      try {
        console.log("🛰️ [HISTORY] Synchronizing Operational Logs for:", user.email);
        const telRef = collection(db, "farmers", user.email, "telemetry");
        const q = query(
          telRef, 
          where("node", "==", "unified_snapshot"),
          orderBy("timestamp", "desc"), 
          limit(2000) // 🚀 INCREASED: 2x more history on initial load
        );
        const telSnap = await getDocs(q);
        const history = telSnap.docs.map(d => d.data()).reverse();
        
        if (history.length > 0) {
          setSensorHistory(history);
          const last = history[history.length - 1];
          
          // 1. Restore Sensor Values
          setSensorData(prev => ({
            ...prev,
            soil: last.soil || prev.soil,
            weather: last.weather || prev.weather,
            water: last.water || prev.water,
            storage: last.storage || prev.storage,
            vision: last.vision || prev.vision
          }));

          // 2. 🛰️ WAKE UP DEVICES: Mark nodes as ACTIVE if data exists in history
          setDevices(prevDevs => {
            const nextDevs = { ...prevDevs };
            const timestamp = last.timestamp || Date.now();
            
            if (last.soil)    nextDevs['soil_node']    = { ...nextDevs['soil_node'],    status: 'ACTIVE', lastUpdate: timestamp };
            if (last.weather) nextDevs['weather_node'] = { ...nextDevs['weather_node'], status: 'ACTIVE', lastUpdate: timestamp };
            if (last.storage) nextDevs['storage_node'] = { ...nextDevs['storage_node'], status: 'ACTIVE', lastUpdate: timestamp };
            if (last.water)   nextDevs['water_node']   = { ...nextDevs['water_node'],   status: 'ACTIVE', lastUpdate: timestamp };
            if (last.vision)  nextDevs['vision_node']  = { ...nextDevs['vision_node'],  status: 'ACTIVE', lastUpdate: timestamp };
            
            return nextDevs;
          });

          console.log("☁️ [HISTORY] Device Status Synchronized from Logs");
        }
      } catch (err) {
        console.error("Historical Sync Failed:", err);
      }
    };

    fetchDeepHistory();
  }, [user?.email]);

  const updateBranding = async (newInfo) => {
    const updated = { ...farmInfo, ...newInfo };
    setFarmInfo(updated);
    localStorage.setItem('agrisense_branding', JSON.stringify(updated));
    if (user?.email) {
      try {
        await setDoc(doc(db, "farmers", user.email), { farmInfo: updated }, { merge: true });
      } catch (e) { console.warn("Firestore Branding Sync Failed", e); }
    }
  };

  const updateProfileMeta = async (newData) => {
    const updated = { ...profileMeta, ...newData };
    setProfileMeta(updated);
    if (user?.email) {
      await setDoc(doc(db, "farmers", user.email), { profileMeta: updated }, { merge: true });
    }
  };


  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest
      return true;
    } catch (err) {
      console.error("Login Failed", err);
      // Check if it's a master config user (fallback for dev)
      const matchedUser = MASTER_CONFIG.AUTHORIZED_USERS.find(
        u => u.email.toLowerCase() === email?.trim().toLowerCase() && u.password === password?.trim()
      );
      if (matchedUser) {
        setUser(matchedUser);
        localStorage.setItem('agrisense_user', JSON.stringify(matchedUser));
        return true;
      }
      return false;
    }
  };











  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return true;
    } catch (err) {
      console.error("Google Login Failed", err);
      return false;
    }
  };

  const guestLogin = async (guestName, existingId = null) => {
    const savedGuest = localStorage.getItem('agrisense_guest_id');
    // If we have an existing ID or a saved one that matches the new format, use it.
    // Otherwise, we generate a new sequential ID.
    let guestEmail = existingId || (savedGuest?.startsWith('guest-') ? savedGuest : null);

    if (!guestEmail) {
      try {
        // Fetch current guest count for sequential ID
        const q = query(collection(db, "farmers"), where("isGuest", "==", true));
        const snap = await getDocs(q);
        const count = snap.size + 1;
        const paddedCount = String(count).padStart(4, '0');
        guestEmail = `guest-${paddedCount}@agrisense.in`;
      } catch (e) {
        // Fallback if cloud check fails
        guestEmail = `guest-${Math.floor(1000 + Math.random() * 9000)}@agrisense.in`;
      }
      localStorage.setItem('agrisense_guest_id', guestEmail);
    }

    const userData = { 
      email: guestEmail, 
      name: guestName || 'Guest Farmer', 
      location: 'Field Zone A', 
      isGuest: true,
      lastLogin: new Date().toISOString()
    };
    setUser(userData);
    localStorage.setItem('agrisense_user', JSON.stringify(userData));
    
    // Save Initial Guest Record to Cloud
    try {
      await setDoc(doc(db, "farmers", guestEmail), userData, { merge: true });
    } catch (e) { console.warn("Guest Cloud Sync Delayed:", e); }
    
    return true;
  };

  const register = async (name, email, password) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });
      
      const newUser = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        location: 'Field Zone A',
        lastLogin: new Date().toISOString(),
        isRegistered: true,
        farmInfo: { ...farmInfo, name: name.trim() }
      };

      await setDoc(doc(db, "farmers", newUser.email), newUser);
      // onAuthStateChanged will handle the rest
      return true;
    } catch (err) {
      console.error("Registration Failed", err);
      return false;
    }
  };

  const updateUser = async (data) => {
    if (!user) return false;
    try {
      // 1. Update Local State Immediately for Snappy UI
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('agrisense_user', JSON.stringify(updatedUser));

      // 2. Attempt Firestore Sync for ALL Users (including Admin and Guests)
      if (updatedUser.email) {
        const userRef = doc(db, "farmers", updatedUser.email);
        await setDoc(userRef, data, { merge: true });
      }
      
      return true;
    } catch (err) {
      console.error("Cloud Sync Failed:", err);
      return true; // Still return true because local state was updated
    }
  };


  const getAllFarmers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "farmers"));
      return querySnapshot.docs.map(doc => doc.data());
    } catch (err) {
      console.error("Failed to fetch farmers:", err);
      return [];
    }
  };

  const fetchHistory = async (startTime) => {
    if (!user?.email) return [];
    try {
      const telRef = collection(db, "farmers", user.email, "telemetry");
      const q = query(
        telRef, 
        where("timestamp", ">=", startTime),
        orderBy("timestamp", "asc"),
        limit(20000)
      );
      const telSnap = await getDocs(q);
      const history = telSnap.docs.map(d => d.data());
      setSensorHistory(history);
      return history;
    } catch (err) {
      console.error("Historical Fetch Failed:", err);
      return [];
    }
  };

  const logout = async () => { 
    await signOut(auth);
    setUser(null); 
    localStorage.removeItem('agrisense_user');
  };

  const toggleActuator = (key) => {
    const newState = !actuators[key];
    setActuators(prev => ({ ...prev, [key]: newState }));
    
    // Global ESP-CAM HTTP toggles
    const CAM_IP = 'http://192.168.4.2';
    if (key === ACTUATORS.LIGHT) {
      fetch(`${CAM_IP}/light?state=${newState ? 'on' : 'off'}`).catch(() => {});
    } else if (key === ACTUATORS.BUZZER) {
      fetch(`${CAM_IP}/buzzer?state=${newState ? 'on' : 'off'}`).catch(() => {});
    }

    if (!MASTER_CONFIG.USE_MOCK_DATA) {
      const commands = MASTER_CONFIG.ACTUATOR_COMMANDS[key];
      if (commands) mqttService.publishCommand({ action: newState ? commands.ON : commands.OFF, actuator: key.toLowerCase().replace(' ', '_'), status: newState ? "ON" : "OFF" });
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const syncData = () => {
    setConnectivityStatus('Syncing...');
    mqttService.refresh();
    setTimeout(() => setConnectivityStatus('Online'), 2000);
  };

  const syncDeviceId = (codename, clientIdentifier) => {
    const toId = (raw) => raw?.trim() ? raw.trim().toLowerCase().replace(/\s+/g, '_') : null;
    const primary   = toId(codename)   || 'innovatex';
    const secondary = toId(clientIdentifier) || 'semicolon';
    console.log(`🔐 [PAIRING] Auth: ${primary} / ${secondary}`);
    setConnectivityStatus('Pairing...');
    mqttService.connect(
      primary, secondary,
      (topic, data) => {
        if (!data) return;
        setSensorData(prev => processMqttMessage(topic, data, prev));
        setIsDataLoading(false);
        setLastGlobalUpdate(new Date().toLocaleTimeString());
        setConnectivityStatus('Online');
      },
      (status) => setMqttStatus(status)
    );
  };

  // 1. Derived Health Logic (Pure Derivation)
  const systemHealth = React.useMemo(() => {
    if (!sensorData) return INITIAL_SYSTEM_HEALTH;
    return {
      soil: calculateNodeHealth('soil', sensorData.soil),
      weather: calculateNodeHealth('weather', sensorData.weather),
      storage: calculateNodeHealth('storage', sensorData.storage),
      water: calculateNodeHealth('irrigation', sensorData.water)
    };
  }, [sensorData]);

  const farmHealthScore = React.useMemo(() => {
    return calculateOverallHealth(systemHealth, devices);
  }, [systemHealth, devices]);

  // 2. AI Recommendation Logic
  const recommendations = React.useMemo(() => {
    if (sensorData?.soil?.moisture === null) return [];
    return getAIv2Recommendations(sensorData);
  }, [sensorData]);


  // 3. Sensor History Logger (Throttled Persistence Logic)


  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'agrisense_history' && e.newValue) {
        try {
          const remoteHistory = JSON.parse(e.newValue);
          setSensorHistory(prev => {
            if (remoteHistory.length > prev.length) {
              lastSavedLen.current = remoteHistory.length;
              return remoteHistory;
            }
            return prev;
          });
        } catch (err) { /* silent fail */ }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 🏥 STATE RECOVERY: No longer needed here as it's merged into Auth observer



  // 🚀 HEARTBEAT: Force re-render every 5 seconds to keep Live charts moving
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  // 🐕 WATCHDOG ENGINE: Monitor device timeouts and clear data when offline
  useEffect(() => {
    const watchdog = setInterval(() => {
      const now = Date.now();
      
      setDevices(prevDevs => {
        let changed = false;
        const nextDevs = { ...prevDevs };
        const offlineNodes = [];

        Object.keys(nextDevs).forEach(id => {
          if (nextDevs[id].status !== 'OFFLINE') {
             // 10 seconds offline threshold (Industrial Standard)
             if (!nextDevs[id].lastUpdate || (now - nextDevs[id].lastUpdate > 10000)) {
               nextDevs[id] = { ...nextDevs[id], status: 'OFFLINE' };
               offlineNodes.push(nextDevs[id].node_type);
               changed = true;
             }
          }
        });

        if (changed) {
          const overview = calculateSystemOverview(nextDevs);
          setSystemOverview(overview);
          
          if (overview.overall_status === 'OFFLINE') {
            setConnectivityStatus('Offline');
          }
          
          // Clear the actual sensor data so dashboard shows --- and chart gets a gap
          setSensorData(prevData => {
             const newData = { ...prevData };
             if (offlineNodes.includes('soil')) newData.soil = INITIAL_SENSOR_DATA.soil;
             if (offlineNodes.includes('weather')) newData.weather = INITIAL_SENSOR_DATA.weather;
             if (offlineNodes.includes('storage')) newData.storage = INITIAL_SENSOR_DATA.storage;
             if (offlineNodes.includes('water') || offlineNodes.includes('irrigation')) newData.water = INITIAL_SENSOR_DATA.water;
             if (offlineNodes.includes('vision')) newData.vision = INITIAL_SENSOR_DATA.vision;
             return newData;
          });
        }
        
        return changed ? nextDevs : prevDevs;
      });
    }, 2000); // Check every 2 seconds

    return () => clearInterval(watchdog);
  }, []);

  useEffect(() => { sensorDataRef.current = sensorData; }, [sensorData]);

  // 🚀 LIVE GRAPH ENGINE: High-frequency 5-second Local UI Update
  useEffect(() => {
    const livePulse = setInterval(() => {
      const currentData = sensorDataRef.current;
      if (!currentData) return;

      const now = Date.now();
      const newEntry = { ...currentData, timestamp: now };

      // Update Local State (for instant UI charts)
      setSensorHistory(prev => {
        // Prevent duplicate timestamps if processing is fast
        if (prev.length > 0 && prev[prev.length - 1].timestamp === now) return prev;
        return [...prev, newEntry].slice(-5000); // 🚀 INCREASED: Store more 'Live' points
      });
      
      console.log("📈 [LIVEGRAPH] 5s High-Res Pulse Complete");
    }, 5000);
    
    return () => clearInterval(livePulse);
  }, []);

  // ☁️ CLOUD PULSE ENGINE: Industrial 15-second Telemetry Persistence
  useEffect(() => {
    const cloudPulse = setInterval(async () => {
      const currentData = sensorDataRef.current;
      if (!currentData || !user?.email) return;

      try {
        setCloudSyncStatus('Syncing...');
        const telemetryRef = collection(db, "farmers", user.email, "telemetry");
        
        // 🛡️ BULLETPROOF IST OVERRIDE (UTC + 5:30)
        const now = new Date();
        const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const istTime = istDate.getUTCDate().toString().padStart(2, '0') + "/" + 
                       (istDate.getUTCMonth() + 1).toString().padStart(2, '0') + "/" + 
                        istDate.getUTCFullYear() + ", " + 
                        istDate.getUTCHours().toString().padStart(2, '0') + ":" + 
                        istDate.getUTCMinutes().toString().padStart(2, '0') + ":" + 
                        istDate.getUTCSeconds().toString().padStart(2, '0') + " IST";

        await addDoc(telemetryRef, {
          ...currentData,
          timestamp: Date.now(),
          localTime: istTime,
          gps: currentGPS?.lat ? { lat: currentGPS.lat, lng: currentGPS.lng, acc: currentGPS.accuracy, city: currentGPS.city } : null,
          node: 'unified_snapshot',
          isGuest: !!user.isGuest,
          email: user.email, // 🆔 Investigator Identity
          projectName: farmInfo?.projectName || 'Industrial', // 🆔 Client/Project ID
          farmName: farmInfo?.name || 'Field A' // 🆔 Site Identifier
        });
        
        setCloudSyncStatus('Active');
        console.log("☁️ [CLOUDPULSE] 15s Cloud Sync Complete");
      } catch (e) {
        setCloudSyncStatus('Error');
        console.error("Cloud Pulse Failed", e);
      }
    }, 15000);
    
    return () => clearInterval(cloudPulse);
  }, [user?.email, currentGPS]); 

  // 🛰️ DYNAMIC VISION ZONE SYNC: Inherit from profile/location
  useEffect(() => {
    if (sensorData.vision.zone === '---' || sensorData.vision.zone === 'Sector A') {
      const activeZone = (farmInfo?.name !== 'AgriSense') ? farmInfo.name : 'Primary Zone';
      setSensorData(prev => ({ ...prev, vision: { ...prev.vision, zone: activeZone }}));
    }
  }, [farmInfo?.name]);

  // 4. MQTT Linkage
  useEffect(() => {
    const bootTimer = setTimeout(() => {
      setIsDataLoading(true);
      const toId = (raw) => raw?.trim() ? raw.trim().toLowerCase().replace(/\s+/g, '_') : null;
      const primary   = toId(farmInfo?.projectName) || 'innovatex';
      const secondary = toId(farmInfo?.name)        || 'semicolon';

      mqttService.connect(
        primary, secondary,
        (topic, data) => {
          if (!data) return;
          console.log("📥 [MQTT] Received:", topic, data);
          
          lastSensorUpdate.current = Date.now();
          setSensorData(prev => {
            const updated = processMqttMessage(topic, data, prev);
            
            // 🛰️ DEEP CLOUD LOGGING: Persist every node update to Firestore Telemetry
            if (user?.email) {
              const parts = topic.split('/');
              const nodeType = parts[parts.length - 1]; // e.g., 'soil', 'weather'
              
              const telemetryRef = collection(db, "farmers", user.email, "telemetry");
              addDoc(telemetryRef, {
                node: nodeType,
                timestamp: Date.now(),
                data: data, // Raw payload for deep audit
                isGuest: !!user.isGuest,
                email: user.email, // 🆔 Investigator Identity
                projectName: farmInfo?.projectName || 'Industrial', // 🆔 Client/Project ID
                farmName: farmInfo?.name || 'Field A' // 🆔 Site Identifier
              }).catch(e => console.error("Telemetry Sync Error:", e));
            }

            // 🛰️ DEVICE STATUS SYNC (Precision Node Wake-Up)
            setDevices(prevDevs => {
              const topicLower = topic.toLowerCase();
              const nextDevs = { ...prevDevs };
              const timestamp = Date.now();

              // Node Detection (Check Topic Keywords OR Data Presence)
              if (topicLower.includes('soil') || data.soil) 
                nextDevs['soil_node'] = { ...nextDevs['soil_node'], status: 'ACTIVE', lastUpdate: timestamp };
              
              if (topicLower.includes('weather') || data.weather) 
                nextDevs['weather_node'] = { ...nextDevs['weather_node'], status: 'ACTIVE', lastUpdate: timestamp };
              
              if (topicLower.includes('storage') || data.storage) 
                nextDevs['storage_node'] = { ...nextDevs['storage_node'], status: 'ACTIVE', lastUpdate: timestamp };
              
              if (topicLower.includes('water') || topicLower.includes('irrigation') || data.water) 
                nextDevs['water_node'] = { ...nextDevs['water_node'], status: 'ACTIVE', lastUpdate: timestamp };
              
              if (topicLower.includes('vision') || topicLower.includes('camera') || topicLower.includes('cam') || data.vision) 
                nextDevs['vision_node'] = { ...nextDevs['vision_node'], status: 'ACTIVE', lastUpdate: timestamp };

              setSystemOverview(calculateSystemOverview(nextDevs));
              return nextDevs;
            });

            return updated;
          });

          setIsDataLoading(false);
          setLastGlobalUpdate(new Date().toLocaleTimeString());
          setConnectivityStatus('Online');
        },
        (status) => setMqttStatus(status)
      );

      // 🐕 FAIL-SAFE WATCHDOG: Force enter dashboard after 10s if handshake hangs
      setTimeout(() => {
        setIsDataLoading(prev => {
          if (prev) console.warn("AgriSense: Sync Timeout - Entering Offline Mode");
          return false;
        });
      }, 10000);
    }, 1500);
    return () => {
      clearTimeout(bootTimer);
      mqttService.disconnect();
    };
  }, [farmInfo?.projectName, farmInfo?.name]);

  // ⚡ INSTANT CONNECTIVITY SYNC
  useEffect(() => {
    if (mqttStatus === 'disconnected' || mqttStatus === 'error') {
      setConnectivityStatus('Offline');
    } else if (mqttStatus === 'connected') {
      setConnectivityStatus('Online');
    }
  }, [mqttStatus]);

  // 5. Weather Satellite & Forecast Link
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const key = MASTER_CONFIG.OPENWEATHER_API_KEY;
        if (!key || key.includes("VITE_")) {
          console.warn("AgriSense Weather: No valid OpenWeather API key found.");
          throw new Error("Missing API Key");
        }
        
        let lat, lon;
        let cityQuery = MASTER_CONFIG.WEATHER_CITY || "Kolkata";

        // ─── 1. RESOLVE LOCATION (GPS -> PROFILE -> CONFIG) ───
        try {
          const fetchPos = () => new Promise((resolve, reject) => {
            const options = { timeout: 6000, enableHighAccuracy: false };
            import('@capacitor/geolocation').then(({ Geolocation }) => {
              Geolocation.getCurrentPosition(options).then(resolve).catch(() => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
              });
            }).catch(() => {
              navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });
          });

          const pos = await fetchPos();
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
          setCurrentGPS({ lat, lng: lon, accuracy: pos.coords.accuracy });
        } catch (gpsErr) {
          // GPS Failed, check profile for "Lat, Lon • City" pattern
          if (user?.location && user.location.includes('•')) {
            const parts = user.location.split('•');
            const coords = parts[0].split(',');
            if (coords.length === 2) {
              lat = parseFloat(coords[0].replace(/[^\d.-]/g, ''));
              lon = parseFloat(coords[1].replace(/[^\d.-]/g, ''));
            }
            if (parts[1]) cityQuery = parts[1].trim();
          } else if (user?.location) {
            cityQuery = user.location;
          }
        }

        // ─── 2. FETCH CURRENT WEATHER ───
        const isCoordsValid = lat != null && lon != null && !isNaN(lat) && !isNaN(lon);
        const baseUrl = "https://api.openweathermap.org/data/2.5";
        const locationParams = isCoordsValid ? `lat=${lat}&lon=${lon}` : `q=${encodeURIComponent(cityQuery)}`;
        
        const weatherUrl = `${baseUrl}/weather?${locationParams}&units=metric&appid=${key}`;
        const weatherRes = await fetch(weatherUrl);
        
        if (!weatherRes.ok) throw new Error(`Weather API Error: ${weatherRes.status}`);
        const currData = await weatherRes.json();
        
        if (currData && currData.main) {
          const { lat: fLat, lon: fLon } = currData.coord;
          
          // Fetch AQI & UV in parallel
          const [aqiRes, uvRes] = await Promise.all([
            fetch(`${baseUrl}/air_pollution?lat=${fLat}&lon=${fLon}&appid=${key}`),
            fetch(`${baseUrl}/uvi?lat=${fLat}&lon=${fLon}&appid=${key}`)
          ]).catch(() => [null, null]);

          let aqiLabel = '---', uvIndex = 'Low';
          
          if (aqiRes?.ok) {
            const aqiData = await aqiRes.json();
            const aqiVal = aqiData?.list?.[0]?.main?.aqi;
            aqiLabel = { 1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Critical' }[aqiVal] || '---';
          }
          
          if (uvRes?.ok) {
            const uvData = await uvRes.json();
            const uvVal = uvData?.value;
            uvIndex = uvVal < 3 ? 'Low' : (uvVal < 6 ? 'Mod' : (uvVal < 8 ? 'High' : 'Extreme'));
          }

          setApiWeather({
            temp: currData.main.temp,
            feelsLike: Math.round(currData.main.feels_like),
            humidity: currData.main.humidity,
            pressure: currData.main.pressure,
            windSpeed: `${Math.round(currData.wind?.speed * 3.6)} km/h`,
            clouds: currData.clouds?.all,
            visibility: currData.visibility ? `${(currData.visibility / 1000).toFixed(1)} km` : '---',
            condition: currData.weather?.[0]?.main,
            icon: currData.weather?.[0]?.icon,
            city: currData.name,
            aqi: aqiLabel,
            uv: uvIndex,
            sunrise: new Date(currData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: new Date(currData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }

        // ─── 3. FETCH 5-DAY FORECAST ───
        const forecastUrl = `${baseUrl}/forecast?${locationParams}&units=metric&appid=${key}`;
        const foreRes = await fetch(forecastUrl);
        if (foreRes.ok) {
          const foreData = await foreRes.json();
          if (foreData?.list) {
            // Group by day and take the noon forecast
            const daily = foreData.list
              .filter(f => f.dt_txt.includes("12:00:00"))
              .map(f => ({
                date: new Date(f.dt * 1000).toLocaleDateString([], { weekday: 'short' }),
                temp: Math.round(f.main.temp),
                condition: f.weather[0].main,
                rainProb: f.pop != null ? `${Math.round(f.pop * 100)}%` : (f.rain ? '40%' : '0%')
              }));
            setApiForecast(daily);
          }
        }

      } catch (err) {
        console.error("AgriSense Weather Sync Failed:", err.message);
        // Fallback to Hardware sensors if available
        if (sensorData?.weather?.temp != null) {
          setApiWeather(prev => ({
            ...prev,
            temp: sensorData.weather.temp,
            humidity: sensorData.weather.humidity,
            condition: 'Hardware Link',
            city: 'Field A (Live)',
            lastUpdate: 'Now'
          }));
        }
      }
    };

    fetchWeather();
    const weatherTimer = setInterval(fetchWeather, 5000); // 5 sec (Requested)
    return () => clearInterval(weatherTimer);
  }, [user?.location, sensorData?.weather?.temp]);

  const maskedSensorData = useMemo(() => ({
    ...sensorData,
    soil:    nodePower.soil    ? sensorData.soil    : {},
    weather: nodePower.weather ? sensorData.weather : {},
    water:   nodePower.water   ? sensorData.water   : {},
    storage: nodePower.storage ? sensorData.storage : {},
    vision:  nodePower.vision  ? sensorData.vision  : {},
  }), [sensorData, nodePower]);

  const maskedSystemHealth = useMemo(() => ({
    ...systemHealth,
    soil:    nodePower.soil    ? systemHealth.soil    : null,
    weather: nodePower.weather ? systemHealth.weather : null,
    water:   nodePower.water   ? systemHealth.water   : null,
    storage: nodePower.storage ? systemHealth.storage : null,
    vision:  nodePower.vision  ? systemHealth.vision  : null,
  }), [systemHealth, nodePower]);

  const maskedSensorHistory = useMemo(() => (
    sensorHistory.map(snapshot => ({
      ...snapshot,
      soil:    nodePower.soil    ? snapshot.soil    : {},
      weather: nodePower.weather ? snapshot.weather : {},
      water:   nodePower.water   ? snapshot.water   : {},
      storage: nodePower.storage ? snapshot.storage : {},
    }))
  ), [sensorHistory, nodePower]);

  return (
    <AppContext.Provider value={{
      user, login, guestLogin, register, googleLogin, fetchHistory, logout, updateUser, farmInfo, updateBranding,
      getAllFarmers,
      isDarkMode, toggleTheme, sensorData: maskedSensorData, apiWeather, apiForecast, recommendations, 
      sensorHistory: maskedSensorHistory,
      actuators, toggleActuator, isSidebarOpen, setIsSidebarOpen, ACTUATORS,
      farmHealthScore, systemHealth: maskedSystemHealth, connectivityStatus, cloudSyncStatus, profileMeta, updateProfileMeta,
      isDataLoading, setIsDataLoading, lastGlobalUpdate, mqttStatus, syncData, syncDeviceId,
      devices, systemOverview, currentGPS,
      nodePower, toggleNodePower
    }}>
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => useContext(AppContext);
export default AppContext;
