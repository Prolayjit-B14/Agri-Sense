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
    'water_node': processDeviceState('water_node', 'water', null)
  });

  const [systemOverview, setSystemOverview] = useState({
    total_nodes: 4, active_nodes: 0, partial_nodes: 0, offline_nodes: 4,
    overall_status: 'OFFLINE', health_percent: 0, nodes: []
  });

  const [apiWeather, setApiWeather] = useState(INITIAL_API_WEATHER);
  const [apiForecast, setApiForecast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [mqttStatus, setMqttStatus] = useState('disconnected');
  const [farmHealthScore, setFarmHealthScore] = useState(null);
  const [systemHealth, setSystemHealth] = useState(INITIAL_SYSTEM_HEALTH);
  const [connectivityStatus, setConnectivityStatus] = useState('Online');
  const [cloudSyncStatus, setCloudSyncStatus] = useState('Active');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [lastGlobalUpdate, setLastGlobalUpdate] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [actuators, setActuators] = useState({
    [ACTUATORS.PUMP]: false,
    [ACTUATORS.VALVE]: false,
    [ACTUATORS.SPRAYER]: false,
    [ACTUATORS.BUZZER]: false,
  });

  const [farmInfo, setFarmInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_branding');
      const data = saved ? JSON.parse(saved) : {
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

  // 1. Health Scoring Engine
  useEffect(() => {
    if (sensorData) {
      const sIdx = calculateNodeHealth('soil', sensorData.soil);
      const wIdx = calculateNodeHealth('weather', sensorData.weather);
      const stIdx = calculateNodeHealth('storage', sensorData.storage);
      const iIdx = calculateNodeHealth('irrigation', sensorData.water);
      const health = { soil: sIdx, weather: wIdx, storage: stIdx, water: iIdx };
      setSystemHealth(health);
      setFarmHealthScore(calculateOverallHealth(health, devices));
    }
  }, [sensorData, devices]);

  // 2. AI Recommendation Engine
  useEffect(() => {
    if (sensorData?.soil?.moisture !== null) {
      setRecommendations(getAIv2Recommendations(sensorData));
    }
  }, [sensorData?.soil?.moisture, sensorData?.soil?.ph, sensorData?.soil?.temp, sensorData?.soil?.npk]);

  // 3. Sensor History Logger
  useEffect(() => {
    if (sensorData && (sensorData.soil || sensorData.weather)) {
      setSensorHistory(prev => {
        const timestamp = Date.now();
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && JSON.stringify(lastEntry.soil) === JSON.stringify(sensorData.soil)) return prev;
        return [...prev, { ...sensorData, timestamp }].slice(-100);
      });
    }
  }, [sensorData]);

  // 4. MQTT Linkage
  useEffect(() => {
    const bootTimer = setTimeout(() => {
      if (!MASTER_CONFIG.USE_MOCK_DATA) {
        mqttService.connect(
          (topic, data) => {
            if (!data) return;
            lastSensorUpdate.current = Date.now();
            setSensorData(prev => {
              const updated = processMqttMessage(topic, data, prev);
              const parts = topic.split('/');
              let type = parts[parts.length - 1];
              if (type === 'telemetry') type = parts[parts.length - 2];
              
              setDevices(prevDevs => {
                let nextDevs = { ...prevDevs };
                const up = (t, d) => { if(!d) return; const id = d.device_id || `${t}_node`; nextDevs[id] = processDeviceState(id, t, d); nextDevs[`${t}_node`] = nextDevs[id]; };
                if (type === 'sensors' || data.soil || data.weather) {
                  if(data.soil) up('soil', data.soil); if(data.weather) up('weather', data.weather); if(data.storage) up('storage', data.storage); if(data.water) up('water', data.water);
                } else if (['soil', 'weather', 'storage', 'water'].includes(type)) { up(type, data); }
                setSystemOverview(calculateSystemOverview(nextDevs));
                return nextDevs;
              });
              return updated;
            });
            setIsDataLoading(false);
            setLastGlobalUpdate(new Date().toLocaleTimeString());
          },
          (status) => setMqttStatus(status)
        );
      } else {
        setIsDataLoading(false);
      }
    }, 1000);
    return () => clearTimeout(bootTimer);
  }, []);

  return (
    <AppContext.Provider value={{
      user, login, logout, updateUser, farmInfo, updateBranding,
      isDarkMode, toggleTheme, sensorData, apiWeather, apiForecast, recommendations, sensorHistory,
      actuators, toggleActuator, isSidebarOpen, setIsSidebarOpen, ACTUATORS,
      farmHealthScore, systemHealth, connectivityStatus, cloudSyncStatus, profileMeta, updateProfileMeta,
      isDataLoading, lastGlobalUpdate, mqttStatus, syncData,
      devices, systemOverview
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
