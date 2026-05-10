import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import mqttService from '../api/mqttService';
import { MASTER_CONFIG } from '../setup';
import { processMqttMessage } from '../engines/sensorController';
import { INITIAL_SENSOR_DATA } from '../types/sensorModel';
import { processDeviceState, calculateSystemOverview } from '../api/deviceService';
import { db } from '../api/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { calculateNodeHealth, calculateOverallHealth, getAIv2Recommendations } from '../logic/healthEngine';

const TelemetryContext = createContext();

export const TelemetryProvider = ({ children, user, farmInfo, nodePower }) => {
  const [sensorData, setSensorData] = useState(INITIAL_SENSOR_DATA);
  const [sensorHistory, setSensorHistory] = useState([]);

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
  const [mqttStatus, setMqttStatus] = useState('disconnected');
  const [cloudSyncStatus] = useState('Active');
  const [lastGlobalUpdate, setLastGlobalUpdate] = useState(null);
  
  // 🛰️ Ref used by MQTT callback closure to always access latest parsed data
  // without causing stale closure issues. setSensorData is called directly for
  // immediate React re-renders — no throttle needed for real hardware (2-5s intervals).
  const sensorDataRef = useRef(sensorData);
  const connectionRef = useRef(null);

  useEffect(() => {
    const toId = (raw) => {
      if (!raw || typeof raw !== 'string') return null;
      return raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
    };

    let primary = toId(farmInfo?.projectName) || toId(MASTER_CONFIG.PROJECT_NAME) || 'agrisense_pro';
    let secondary = toId(farmInfo?.name) || toId(MASTER_CONFIG.FARM_NAME) || 'master_field';

    if (primary.includes('agrisne') || primary.includes('agri_sense') || primary.includes('agrisence')) primary = 'agrisense_pro';
    if (secondary.includes('master') || secondary.includes('field') || secondary.includes('file')) secondary = 'master_field';

    const topic = `agrisense/${primary}/${secondary}/#`;

    if (connectionRef.current === topic) return;
    connectionRef.current = topic;

    const handleMqttMessage = (topic, data) => {
      if (!data || typeof data !== 'object') return;

      const timestamp = Date.now();
      const topicLower = topic.toLowerCase();

      // ✅ FIXED: Always update device status from topic routing first,
      // regardless of node name. This prevents the bug where checkAndSet()
      // results were silently discarded by the early return below.
      setDevices(prevDevs => {
        const nextDevs = { ...prevDevs };

        const checkAndSet = (key) => {
          nextDevs[key] = {
            ...nextDevs[key],
            status: 'ACTIVE',
            lastUpdate: timestamp
          };
        };

        // Topic-based routing (always applied for any message on our topic tree)
        if (topicLower.includes('soil') || data.soil) checkAndSet('soil_node');
        if (topicLower.includes('weather') || data.weather) checkAndSet('weather_node');
        if (topicLower.includes('storage') || data.storage) checkAndSet('storage_node');
        if (topicLower.includes('water') || topicLower.includes('irrigation') || data.water || data.irrigation) checkAndSet('water_node');
        if (topicLower.includes('vision') || data.vision) checkAndSet('vision_node');

        setSystemOverview(calculateSystemOverview(nextDevs));
        return nextDevs;
      });

      // ✅ PRODUCTION ENFORCEMENT: Only parse sensor values from authorized hardware node.
      // Device status is updated for ALL messages (above), but sensor DATA only
      // flows through if it's from our specific hardware node identifier.
      if (data.node === 'AgriSense_Pro_Node') {
        const updatedSensorData = processMqttMessage(topic, data, sensorDataRef.current);
        if (updatedSensorData !== sensorDataRef.current) {
          sensorDataRef.current = updatedSensorData;
          setSensorData(updatedSensorData); 
        }
      }

      setLastGlobalUpdate(new Date().toLocaleTimeString());
    };

    mqttService.connect(primary, secondary, handleMqttMessage, (status) => setMqttStatus(status));

    return () => {
      mqttService.disconnect();
      connectionRef.current = null;
    };
  }, [farmInfo?.projectName, farmInfo?.name]);

  useEffect(() => {
    const watchdog = setInterval(() => {
      const now = Date.now();
      setDevices(prevDevs => {
        let changed = false;
        const nextDevs = { ...prevDevs };
        Object.keys(nextDevs).forEach(id => {
          if (nextDevs[id].status !== 'OFFLINE') {
            if (!nextDevs[id].lastUpdate || (now - nextDevs[id].lastUpdate > 15000)) {
              nextDevs[id] = { ...nextDevs[id], status: 'OFFLINE' };
              changed = true;
            }
          }
        });
        if (changed) setSystemOverview(calculateSystemOverview(nextDevs));
        return changed ? nextDevs : prevDevs;
      });
    }, 5000);
    return () => clearInterval(watchdog);
  }, []);

  useEffect(() => {
    const livePulse = setInterval(() => {
      const currentData = sensorDataRef.current;
      // ✅ FIX #8: Only snapshot history when we have real sensor values.
      // Avoids polluting history with initial null-state entries.
      if (!currentData || currentData.soil?.moisture == null) return;
      const now = Date.now();
      setSensorHistory(prev => [...prev, { ...currentData, timestamp: now }].slice(-2000));
    }, 5000);
    return () => clearInterval(livePulse);
  }, []);

  // ✅ FIX #3: Use strict `=== false` check. If nodePower key is undefined/missing
  // (e.g. guest user with partial profile), we should SHOW data, not hide it.
  // The old truthy check `nodePower.soil ?` would zero out data if key was undefined.
  const maskedSensorData = useMemo(() => ({
    ...sensorData,
    soil:    nodePower?.soil    === false ? {} : sensorData.soil,
    weather: nodePower?.weather === false ? {} : sensorData.weather,
    water:   nodePower?.water   === false ? {} : sensorData.water,
    storage: nodePower?.storage === false ? {} : sensorData.storage,
    vision:  nodePower?.vision  === false ? {} : sensorData.vision,
  }), [sensorData, nodePower]);

  // ✅ FIX #9: Mask devices status based on nodePower. 
  // Ensures Dashboard reflects 'OFFLINE' when user manually disables a node.
  const maskedDevices = useMemo(() => {
    const next = { ...devices };
    if (nodePower?.soil    === false) next.soil_node    = { ...next.soil_node,    status: 'OFFLINE' };
    if (nodePower?.weather === false) next.weather_node = { ...next.weather_node, status: 'OFFLINE' };
    if (nodePower?.water   === false) next.water_node   = { ...next.water_node,   status: 'OFFLINE' };
    if (nodePower?.storage === false) next.storage_node = { ...next.storage_node, status: 'OFFLINE' };
    if (nodePower?.vision  === false) next.vision_node  = { ...next.vision_node,  status: 'OFFLINE' };
    return next;
  }, [devices, nodePower]);

  const fetchHistory = async (startTime) => {
    if (!user?.email) return [];
    try {
      const telRef = collection(db, "farmers", user.email, "telemetry");
      const q = query(
        telRef, 
        where("node", "==", "unified_snapshot"),
        where("timestamp", ">=", startTime),
        orderBy("timestamp", "asc"),
        limit(5000)
      );
      const telSnap = await getDocs(q);
      const history = telSnap.docs.map(d => d.data());
      if (history.length > 0) setSensorHistory(history);
      return history;
    } catch (err) {
      return [];
    }
  };

  const systemHealth = useMemo(() => ({
    soil: calculateNodeHealth('soil', maskedSensorData.soil),
    weather: calculateNodeHealth('weather', maskedSensorData.weather),
    storage: calculateNodeHealth('storage', maskedSensorData.storage),
    water: calculateNodeHealth('irrigation', maskedSensorData.water)
  }), [maskedSensorData]);

  const farmHealthScore = useMemo(() => calculateOverallHealth(systemHealth, maskedDevices), [systemHealth, maskedDevices]);
  const recommendations = useMemo(() => sensorData?.soil?.moisture != null ? getAIv2Recommendations(sensorData) : [], [sensorData]);

  const maskedSystemOverview = useMemo(() => calculateSystemOverview(maskedDevices), [maskedDevices]);

  const value = useMemo(() => ({
    sensorData: maskedSensorData,
    sensorHistory,
    devices: maskedDevices,
    rawDevices: devices, // Added rawDevices to allow control panel to see true hardware status
    systemOverview: maskedSystemOverview,
    mqttStatus,
    cloudSyncStatus,
    lastGlobalUpdate,
    setSensorHistory,
    fetchHistory,
    systemHealth,
    farmHealthScore,
    recommendations
  }), [
    maskedSensorData, sensorHistory, maskedDevices, devices, maskedSystemOverview, mqttStatus,
    cloudSyncStatus, lastGlobalUpdate, systemHealth, farmHealthScore, recommendations
  ]);

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
};

export const useTelemetry = () => useContext(TelemetryContext);
