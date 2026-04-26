/**
 * Bharat Advisor Pro v17.1.0 Master State Manager
 * Organized Industrial State Engine for AgriSense Ecosystem.
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// API & Infrastructure
import mqttService from '../api/mqttService';
import { processDeviceState, calculateSystemOverview } from '../api/deviceService';
import { MASTER_CONFIG } from '../setup';

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
  // ─── STATE DEFINITIONS ────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Auth Persistence Failure:", e);
      return null;
    }
  });

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
  const [isDataLoading, setIsDataLoading] = useState(true);
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

  const [farmInfo, setFarmInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_branding');
      const parsed = saved ? JSON.parse(saved) : null;
      // Migrate stale defaults from old installs
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

  const lastSensorUpdate = useRef(null);

  const updateBranding = (newInfo) => {
    const updated = { ...farmInfo, ...newInfo };
    setFarmInfo(updated);
    localStorage.setItem('agrisense_branding', JSON.stringify(updated));
  };

  const updateProfileMeta = (newData) => setProfileMeta(prev => ({ ...prev, ...newData }));
  const updateUser = (newUserData) => {
    const updated = { ...user, ...newUserData, isGuest: false };
    setUser(updated);
    localStorage.setItem('agrisense_user', JSON.stringify(updated));
  };

  const login = (id, pass) => {
    const matchedUser = MASTER_CONFIG.AUTHORIZED_USERS.find(
      u => u.email.toLowerCase() === id?.trim().toLowerCase() && u.password === pass?.trim()
    );
    if (matchedUser || id === 'guest') {
      const userData = matchedUser || { email: 'guest@agrisense.io', name: 'Guest Farmer', location: 'Field Zone A', isGuest: true };
      setUser(userData);
      localStorage.setItem('agrisense_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => { 
    const defaultUser = { name: 'Guest Farmer', email: 'guest@agrisense.io', isGuest: true };
    setUser(defaultUser); 
    localStorage.setItem('agrisense_user', JSON.stringify(defaultUser));
  };

  const toggleActuator = (key) => {
    const newState = !actuators[key];
    setActuators(prev => ({ ...prev, [key]: newState }));
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


  // 3. Sensor History Logger (Stateful Sync with Multi-Tab Persistence)
  const [sensorHistory, setSensorHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_history');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // 🧪 MIGRATION: Clear history if it's corrupted (timestamp: 0 or missing)
      if (Array.isArray(parsed) && parsed.length > 0 && (!parsed[0].timestamp || parsed[0].timestamp < 1000000)) {
        localStorage.removeItem('agrisense_history');
        return [];
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  // 🏥 SYNC HISTORY ACROSS TABS
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'agrisense_history' && e.newValue) {
        try {
          const remoteHistory = JSON.parse(e.newValue);
          setSensorHistory(prev => {
            if (remoteHistory.length > prev.length) {
              // Mark as saved so we don't trigger a circular save loop
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

  // 🏥 STATE RECOVERY: Restore last known data on boot
  useEffect(() => {
    if (sensorHistory.length > 0) {
      const last = sensorHistory[sensorHistory.length - 1];
      if (last && !last.isInitial) {
        setSensorData(prev => ({
          ...prev,
          soil: last.soil || prev.soil,
          weather: last.weather || prev.weather,
          water: last.water || prev.water,
          storage: last.storage || prev.storage,
          vision: last.vision || prev.vision
        }));
        setIsDataLoading(false);
      }
    }
  }, []); // Run once on mount

  // Throttled persistence with multi-tab safety
  const lastSavedLen = useRef(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sensorHistory.length > lastSavedLen.current) {
        try {
          localStorage.setItem('agrisense_history', JSON.stringify(sensorHistory));
          lastSavedLen.current = sensorHistory.length;
        } catch (e) {
          console.warn("Storage Full - pruning history");
          setSensorHistory(prev => prev.slice(-500));
        }
      }
    }, 3000); 
    return () => clearTimeout(timer);
  }, [sensorHistory]);

  const lastHistoryUpdate = useRef(0);
  const [, setTick] = useState(0);

  // 🚀 HEARTBEAT: Force re-render every 5 seconds to keep Live charts moving
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const sensorDataRef = useRef(sensorData);
  useEffect(() => { sensorDataRef.current = sensorData; }, [sensorData]);

  // 🚀 PULSE ENGINE: Dedicated 5-second heartbeat for history logging
  useEffect(() => {
    const loggerInterval = setInterval(() => {
      const currentData = sensorDataRef.current;
      if (!currentData || (!currentData.soil && !currentData.weather)) return;

      setSensorHistory(prev => {
        const now = Date.now();
        lastHistoryUpdate.current = now;
        const newEntry = { ...currentData, timestamp: now };
        return [...prev, newEntry].slice(-5000); 
      });
    }, 5000); 
    
    return () => clearInterval(loggerInterval);
  }, []); // Run once, uses ref for stable data access

  // 🛰️ DYNAMIC VISION ZONE SYNC: Inherit from profile/location
  useEffect(() => {
    if (sensorData.vision.zone === '---' || sensorData.vision.zone === 'Sector A') {
      const loc = farmInfo?.location || user?.location || 'Field A';
      setSensorData(prev => ({
        ...prev,
        vision: { ...prev.vision, zone: loc }
      }));
    }
  }, [user, farmInfo, sensorData.vision.zone]);

  // 4. MQTT Linkage
  useEffect(() => {
    const bootTimer = setTimeout(() => {
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
            
            // 🛰️ DEVICE STATUS SYNC (Unified Node Wake-Up)
            setDevices(prevDevs => {
              const parts = topic.split('/');
              const topicType = parts[parts.length - 1];
              const nextDevs = { ...prevDevs };
              const timestamp = Date.now();

              // If it's a unified sensors payload, wake up ALL nodes
              if (topicType === 'sensors' || data.soil || data.weather) {
                ['soil_node', 'weather_node', 'storage_node', 'water_node'].forEach(id => {
                  if (nextDevs[id]) nextDevs[id] = { ...nextDevs[id], status: 'ACTIVE', lastUpdate: timestamp };
                });
              } else {
                // Handle discrete node topics (camera/vision/cam -> vision_node)
                let id = `${topicType}_node`;
                if (['camera', 'vision', 'cam'].includes(topicType)) id = 'vision_node';
                if (nextDevs[id]) nextDevs[id] = { ...nextDevs[id], status: 'ACTIVE', lastUpdate: timestamp };
              }

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
    }, 1500);
    return () => clearTimeout(bootTimer);
  }, []);

  // 5. Weather Satellite & Forecast Link
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!MASTER_CONFIG.OPENWEATHER_API_KEY) throw new Error("No API Key");
        const key = MASTER_CONFIG.OPENWEATHER_API_KEY;
        const city = MASTER_CONFIG.WEATHER_CITY;

        // Fetch Current Weather
        const currRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`);
        const currData = await currRes.json();
        
        if (currData && currData.main) {
          const { lat, lon } = currData.coord;
          
          // Fetch Air Pollution (AQI)
          let aqiLabel = '---';
          let uvIndex = 'Low';
          try {
            const [aqiRes, uvRes] = await Promise.all([
              fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`),
              fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${key}`)
            ]);
            const aqiData = await aqiRes.json();
            const uvData = await uvRes.json();
            
            const aqiValue = aqiData?.list?.[0]?.main?.aqi;
            const aqiMap = { 1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Critical' };
            aqiLabel = aqiMap[aqiValue] || '---';
            
            const uvVal = uvData?.value;
            uvIndex = uvVal !== undefined ? (uvVal < 3 ? 'Low' : (uvVal < 6 ? 'Mod' : (uvVal < 8 ? 'High' : 'Extreme'))) : 'Low';
          } catch (err) {
            console.warn("AQI/UV Fetch Failed:", err);
          }

          setApiWeather({
            temp: currData.main.temp,
            feelsLike: currData.main.feels_like,
            humidity: currData.main.humidity,
            pressure: currData.main.pressure,
            windSpeed: currData.wind?.speed,
            clouds: currData.clouds?.all,
            condition: currData.weather?.[0]?.main,
            icon: currData.weather?.[0]?.icon,
            city: currData.name,
            aqi: aqiLabel,
            uv: uvIndex,
            sunrise: new Date(currData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: new Date(currData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            lastUpdate: new Date().toLocaleTimeString()
          });
        }

        // Fetch 5-Day Forecast
        const foreRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${key}`);
        const foreData = await foreRes.json();
        if (foreData && foreData.list) {
          // Filter to get 1 forecast per day (around noon)
          const daily = foreData.list.filter(f => f.dt_txt.includes("12:00:00")).map(f => {
            let prob = f.pop !== undefined ? Math.round(f.pop * 100) : (f.rain ? 40 : 0);
            
            // 🌥️ CLOUD SENSITIVITY BOOST: If pop is 0 but it's cloudy, show a low humidity chance (5-15%)
            if (prob === 0 && f.weather?.[0]?.main === 'Clouds') {
              prob = f.clouds?.all > 50 ? 15 : 5;
            }

            return {
              date: new Date(f.dt * 1000).toLocaleDateString([], { weekday: 'short' }),
              temp: Math.round(f.main.temp),
              condition: f.weather[0].main,
              rainProb: `${prob}%`
            };
          });
          setApiForecast(daily);
        }

      } catch (e) {
        console.warn("Weather Satellite Failed - Hardware Backup Active", e);
        if (sensorData?.weather?.temp) {
          setApiWeather(prev => ({
            ...prev,
            temp: sensorData.weather.temp,
            humidity: sensorData.weather.humidity,
            condition: 'Hardware Stream',
            city: 'Field A',
            lastUpdate: 'Live'
          }));
        }
      }
    };

    fetchWeather();
    const timer = setInterval(fetchWeather, 600000); 
    return () => clearInterval(timer);
  }, [sensorData?.weather?.temp]);

  return (
    <AppContext.Provider value={{
      user, login, logout, updateUser, farmInfo, updateBranding,
      isDarkMode, toggleTheme, sensorData, apiWeather, apiForecast, recommendations, sensorHistory,
      actuators, toggleActuator, isSidebarOpen, setIsSidebarOpen, ACTUATORS,
      farmHealthScore, systemHealth, connectivityStatus, cloudSyncStatus, profileMeta, updateProfileMeta,
      isDataLoading, lastGlobalUpdate, mqttStatus, syncData, syncDeviceId,
      devices, systemOverview
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
