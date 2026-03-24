# API Reference & MQTT Topics

The application communicates exclusively via **MQTT** using **WebSockets (WSS)** for real-time bidirectional telemetry.

### Connection Parameters
- **Protocol**: `wss`
- **Port**: `8084` (Default WSS port, varies by config)
- **Path**: `/mqtt`
- **Reconnection strategy**: Every 5 seconds

---

## Publish Topics (App to Hardware)

### `agrisense/field_a/commands`
Used by the frontend to trigger physical relays based on user input (e.g., turning on an irrigation pump).
**Payload Example:**
```json
{
  "device": "pump",
  "action": "ON",
  "timestamp": 1718224523
}
```

---

## Subscribe Topics (Hardware to App)

### `agrisense/field_a/sensors`
Used by the App to ingest live telemetry from the `SoilNode` and `StorageNode`.
**Expected Payload Example:**
```json
{
  "moisture": 45.2,
  "temperature": 28.5,
  "humidity": 60.1,
  "nitrogen": 12,
  "phosphorus": 8,
  "potassium": 15
}
```

### `agrisense/field_a/camera`
Ingests frames or event flags from the `CameraNode` (e.g., when an animal is detected).
**Expected Payload Example:**
```json
{
  "event": "ANIMAL_DETECTED",
  "confidence": 0.85,
  "frame_url": "https://..."
}
```
