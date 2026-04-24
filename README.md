# AgriSense Pro v17.1.0: Industrial Agronomy Suite

An industrial-grade, deterministic agronomic advisory and IoT monitoring platform. AgriSense v17.1.0 is a high-fidelity diagnostic ecosystem that bridges real-time field telemetry with scientific crop suitability intelligence. Powered by **React 19**, **Vite**, and **Capacitor**, it delivers a production-grade advisory experience for professional agriculture.

---

## 🚀 Key Innovations (v3.90)

### 📊 Scientific Intelligence Suite
*   **21+ Diagnostic Charts**: Forensic-level visualization across Soil, Weather, Storage, Water, and Solar energy tabs.
*   **Dual-Line Correlation Engine**: Advanced visual linking of environmental variables (e.g., Moisture vs. Temp) to visualize cause-and-effect field health.
*   **Zero-Lag Stabilization**: Hardened Recharts implementation with disabled animations and locked Y-axis domains for flicker-free industrial monitoring.

### 📡 Five-Node Industrial Management
*   **High-Density 2x2 Grid**: A compact, control-room interface for monitoring **Soil, Weather, Storage, Water, and Solar** nodes.
*   **Single-Line Forensic HUD**: Ultra-compact status indicators (Moisture ● pH ● NPK ●) providing instant situational awareness without UI clutter.
*   **Reactive Heartbeat Engine**: Real-time health scoring (0-100) and automated state transitions (Active → Stale → Offline).

### 🛡️ Pure Telemetry Protocol
*   **Zero-Mock Data Engine**: Strictly event-driven history plotting. No placeholder values; every coordinate is anchored to a physical MQTT sensor packet.
*   **Clinical Offline Guards**: Advanced null-handling and forensic "---" fallbacks to ensure data integrity even during partial network outages.

---

## 📚 Technical Documentation Matrix

For an in-depth dive into the technical implementation, please review the extensive documentation suite:

- 🏗️ **[System Architecture](docs/ARCHITECTURE.md)**: Explore the 5-node MQTT event-loop and reactive heartbeat flow.
- 🔌 **[Hardware Setup](docs/HARDWARE_SETUP.md)**: ESP32 Pin maps for Soil, Weather, and Solar modules.
- 🛠️ **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)**: Forensic procedures for OFFLINE node recovery.
- 📐 **[Calibration Manual](docs/CALIBRATION_GUIDE.md)**: Clinical procedures for sensor normalization.
- ✨ **[Diagnostic Suite](docs/FEATURES.md)**: Breakdown of the 21+ forensic charts and correlation models.
- 📡 **[API Reference](docs/API_REFERENCE.md)**: MQTT topic structure and JSON payload definitions.

---

## 🏗️ Whole-System Integration

AgriSense v3.94 operates as a unified agricultural monitoring instrument, integrating three core engineering layers:

1.  **Hardware Fabric (v2.9.0)**: Five modular ESP32 nodes (Soil, Weather, Storage, Water, Solar) broadcasting clinical telemetry via MQTT.
2.  **Service Layer**: Reactive heartbeat engines and health scoring services (`deviceService.js`) that manage node status and network integrity.
3.  **Forensic UI (v3.90)**: A high-density React 19 dashboard featuring 21+ stabilized charts and a 5-node management HUD.


---

## ⚙️ Installation & Build

1. **Clone & Install:**
   ```bash
   git clone https://github.com/Prolayjit-B14/Agri_Sense-.git
   cd Agri_Sense-
   npm install
   ```

2. **Development Mode:**
   ```bash
   npm run dev
   ```

3. **Production Android Build:**
   ```bash
   npm run build
   npx cap sync
   cd android && ./gradlew assembleDebug
   ```

---

## 📂 Project Structure

```text
Agri_Sense-/
├── src/
│   ├── components/      # High-density UI components
│   ├── context/         # Master AppContext & State Registry
│   ├── services/        # Device Management & MQTT Logic
│   ├── pages/           # Analytics Hub, Management, Diagnostics
│   ├── utils/           # Scientific Health & Recommendation Engines
│   └── App.jsx          # Forensic Routing & Auth Handover
├── android/             # Capacitor Android Project
└── public/              # Industrial Branding Assets
```

---

## 🏆 Author

**Prolayjit Biswas**  
*Industrial IoT Developer & Precision Agriculture Architect*

- [LinkedIn](#)
- [GitHub](https://github.com/Prolayjit-B14)
- [Portfolio](#)

