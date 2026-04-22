# AgriSense v3.90: Scientific Intelligence Suite

An industrial-grade, IoT-driven precision agriculture platform. AgriSense v3.90 is a high-density monitoring ecosystem that bridges real-time hardware telemetry with scientific forensic diagnostics. Powered by **React 19**, **Vite**, and **Capacitor**, it delivers a zero-lag, zero-mock experience for professional farm management.

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

## 📚 Technical Documentation

- 🏗️ **[System Architecture](docs/ARCHITECTURE.md)**: Explore the MQTT event-loop and 5-node telemetry flow.
- 🔌 **[Hardware Setup](docs/HARDWARE_SETUP.md)**: ESP32 Pin maps for Soil, Weather, and Solar modules.
- ✨ **[Diagnostic Suite](docs/FEATURES.md)**: Breakdown of the 21+ forensic charts and correlation models.
- 📡 **[API Reference](docs/API_REFERENCE.md)**: MQTT topic structure and JSON payload definitions.

---

## 🛠️ Tech Stack

**Frontend & Mobile:**
- **React 19**: Modern reactive UI with strict purity.
- **Capacitor**: Native Android deployment.
- **Framer Motion**: Premium fluid transitions.
- **Recharts**: Stabilized industrial data visualization.

**Industrial Backend:**
- **MQTT Protocol**: Real-time hardware telemetry bridge.
- **Forensic Health Engine**: Weighted health scoring (RSSI, Latency, Packet Loss).
- **Reactive Heartbeat Service**: Managed node status transitions.

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

