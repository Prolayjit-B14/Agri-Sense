/**
 * AgriSense v3.60 IoT Device Management Service
 * Clinical health calculation, weighted scoring, and issue detection engine.
 */

const THRESHOLDS = {
  STALE: 30000, // 30 seconds
  OFFLINE: 60000, // 60 seconds
  ERROR: 60000,
  LATENCY_CRITICAL: 100, // 100ms
  RSSI_WEAK: -80, // -80 dBm
  PACKET_LOSS_MAX: 2, // 2%
};

/**
 * Calculates the status of an individual sensor.
 */
export const calculateSensorStatus = (sensor, nodeTimestamp) => {
  // Strict check for missing data
  if (!sensor || sensor.value === undefined || sensor.value === '---' || sensor.value === null || isNaN(parseFloat(sensor.value))) {
    return 'INACTIVE';
  }
  
  const lastUpdate = sensor.timestamp || nodeTimestamp;
  if (!lastUpdate) return 'INACTIVE';

  const delay = Date.now() - lastUpdate;

  if (delay < THRESHOLDS.STALE) return 'ACTIVE';
  if (delay < THRESHOLDS.OFFLINE) return 'STALE';
  return 'ERROR';
};


/**
 * Calculates human-readable issues for a node.
 */
export const detectIssues = (node, sensors, status) => {
  if (status === 'OFFLINE') return ['Device not responding'];
  
  const issues = [];
  
  // Sensor issues
  sensors.forEach(s => {
    if (s.status === 'STALE') issues.push(`${s.name} data delayed`);
    if (s.status === 'ERROR') issues.push(`${s.name} not responding`);
    if (s.status === 'INACTIVE') issues.push(`${s.name} not connected`);
  });

  // Network issues
  if (node.packet_loss > THRESHOLDS.PACKET_LOSS_MAX) issues.push('High packet loss detected');
  if (node.latency > THRESHOLDS.LATENCY_CRITICAL) issues.push('High latency detected');
  if (node.rssi < THRESHOLDS.RSSI_WEAK) issues.push('Weak signal detected');

  return issues.length > 0 ? issues : ['All systems operational'];
};

/**
 * Calculates the weighted health score (0-100).
 */
export const calculateHealthScore = (node, sensors) => {
  // 1. RSSI (30%) - map -30 to -90 -> 100 to 0
  const rssiScore = Math.max(0, Math.min(100, ((node.rssi + 90) / 60) * 100)) * 0.3;
  
  // 2. Packet Loss (30%) - 0% -> 100, 5%+ -> 0
  const lossScore = Math.max(0, Math.min(100, (1 - (node.packet_loss / 5)) * 100)) * 0.3;
  
  // 3. Latency (20%) - 0 to 150ms -> 100 to 0
  const latencyScore = Math.max(0, Math.min(100, (1 - (node.latency / 150)) * 100)) * 0.2;
  
  // 4. Availability (20%) - active / total
  const activeCount = sensors.filter(s => s.status === 'ACTIVE').length;
  const availabilityScore = (activeCount / sensors.length) * 100 * 0.2;

  return Math.round(rssiScore + lossScore + latencyScore + availabilityScore);
};

/**
 * Processes raw node data into a managed device state.
 */
export const processDeviceState = (nodeId, nodeType, rawData) => {
  const now = Date.now();
  // Ensure we have a valid lastSeen, defaulting to now if rawData just arrived
  const lastSeen = rawData ? (rawData.lastSeen || rawData.timestamp || now) : (0);
  const isOffline = (now - lastSeen > THRESHOLDS.OFFLINE) || !rawData;

  // Define sensor definitions based on type
  const sensorConfigs = {
    soil: ['moisture', 'ph', 'n', 'p', 'k', 'temperature'],
    weather: ['temperature', 'humidity', 'ldr', 'rain'],
    storage: ['temperature', 'humidity', 'mq135'],
    water: ['flow', 'level', 'pressure'],
    solar: ['voltage', 'battery', 'current', 'load']
  };


  const sensorNames = sensorConfigs[nodeType] || [];
  const processedSensors = sensorNames.map(name => {
    let sensorVal = rawData?.[name];
    if (name === 'n' || name === 'p' || name === 'k') sensorVal = rawData?.npk?.[name];
    
    const status = calculateSensorStatus({ value: sensorVal, timestamp: rawData?.timestamp || now }, lastSeen);
    return { name: name.toUpperCase(), value: sensorVal !== undefined ? sensorVal : '---', status };
  });

  // A node is OFFLINE only if no heartbeat is detected. 
  // If we have rawData, it is at least PARTIAL.
  const nodeStatus = isOffline ? 'OFFLINE' : (processedSensors.every(s => s.status === 'ACTIVE') ? 'ACTIVE' : 'PARTIAL');
  const issues = detectIssues(rawData || {}, processedSensors, nodeStatus);
  const healthScore = isOffline ? 0 : calculateHealthScore(rawData || {}, processedSensors);

  return {
    device_id: nodeId,
    node_type: nodeType,
    status: nodeStatus,
    lastSeen,
    metrics: {
      rssi: rawData?.rssi !== undefined ? rawData.rssi : '---',
      latency: rawData?.latency !== undefined ? rawData.latency : '---',
      uptime: rawData?.uptime !== undefined ? rawData.uptime : '---',
      packet_loss: rawData?.packet_loss !== undefined ? rawData.packet_loss : '---'
    },
    sensors: processedSensors,
    issues,
    health_score: healthScore
  };
};


/**
 * Aggregates all device states into a system-level overview for the Hero Card.
 */
export const calculateSystemOverview = (devices) => {
  const deviceList = Object.values(devices);
  const total_nodes = deviceList.length;
  
  const active_nodes = deviceList.filter(d => d.status === 'ACTIVE').length;
  const partial_nodes = deviceList.filter(d => d.status === 'PARTIAL').length;
  const offline_nodes = deviceList.filter(d => d.status === 'OFFLINE').length;

  let overall_status = 'HEALTHY';
  if (offline_nodes > 0) {
    overall_status = 'CRITICAL';
  } else if (partial_nodes > 0) {
    overall_status = 'DEGRADED';
  }

  const health_percent = total_nodes > 0 ? Math.round((active_nodes / total_nodes) * 100) : 0;

  return {
    total_nodes,
    active_nodes,
    partial_nodes,
    offline_nodes,
    overall_status,
    health_percent,
    last_updated: Date.now(),
    nodes: deviceList.map(d => ({
      node_type: d.node_type,
      device_id: d.device_id,
      status: d.status
    }))
  };
};

