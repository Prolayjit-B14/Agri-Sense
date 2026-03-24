# AgriSense

A comprehensive IoT-based smart agriculture monitoring system and cross-platform mobile application powered by React, Vite, and Capacitor.

---

## Demo

[Live Demo Link](#)

*(Add images or GIF preview here)*

---

## 📚 Documentation

For an in-depth dive into the technical implementation, please review the extensive documentation prepared for technical teams and judges:

- 🏗️ **[System Architecture](docs/ARCHITECTURE.md)**: Explore the MQTT flow and node layout.
- 🔌 **[Hardware Setup](docs/HARDWARE_SETUP.md)**: ESP32 Pin maps and wiring schematics.
- ✨ **[Platform Features](docs/FEATURES.md)**: A complete breakdown of the App capability stack.
- 📡 **[API Reference](docs/API_REFERENCE.md)**: WebSockets and MQTT payload definitions.

---

## Features

- **Dashboard & Analytics:** Real-time data visualization with advanced charts.
- **Smart Monitoring:** Integrated soil intelligence, solar power usage, and weather tracking.
- **Automated Control:** Remote irrigation control and storage hub monitoring.
- **AI & Advisory:** Crop recommendations, pest advisories, and market insights.
- **Security & Vision:** Live camera feeds with automated animal detection.
- **Cross-Platform:** Works seamlessly across Web and Android natively.
- **Geospatial Tracking:** Map views for tracking devices across the farm.

---

## Tech Stack

**Frontend & Mobile App:**
- React 19 (Vite Ecosystem)
- Capacitor (for Android native builds)
- React Router DOM
- Framer Motion (Animations)
- Recharts (Data Visualization)
- Lucide-React (Icons)

**IoT & Hardware:**
- ESP32 Microcontrollers
- Multi-Sensor Modules (Soil, Weather, Solar, etc.)
- Camera Module (for Animal Detection)
- Custom PCBs

**Protocols:**
- MQTT (Real-time telemetry and hardware communication)
- HTTP

---

## System Architecture

The following flow represents the data lifecycle for the system:

`Sensors/Cameras` → `ESP32` → `MQTT` → `Backend/Server` → `React/Mobile UI`

*(Include diagram image here)*

---

## Hardware Setup

**Components:**
- ESP32 Microcontroller
- Sensor modules (Soil Moisture, Temperature/Humidity, NPK, etc.)
- Vision module (e.g., ESP32-CAM)
- Power supply / Solar panels

**Pin connections:**
*(Add pin mapping details here)*

*(Optional: Add circuit diagram image here)*

---

## Installation

Clone the repository:
```bash
git clone https://github.com/Prolayjit-B14/Agri_Sense-.git
cd Agri_Sense-
```

Install dependencies:
```bash
npm install
```

Run the Web Application locally:
```bash
npm run dev
```

Build and Sync for Android App:
```bash
npm run production:sync
npm run android:open
```

---

## Usage

1. **Connect hardware** based on the provided pin connections.
2. **Upload firmware** to the ESP32 devices.
3. **Start the App:** Run the frontend development server and log in.
4. **Monitor via App:** Navigate through Dashboard, Animal Detection, or Analytics Hub to visualize the real-time MQTT data directly from your farm.

---

## Folder Structure

```text
Agri_Sense-/
├── android/             # Capacitor Android project files
├── docs/                # Project API & Architecture Documentation
├── src/
│   ├── components/      # Reusable UI components (Sidebar, TopBar)
│   ├── context/         # React Context (Global state)
│   ├── pages/           # App screens (Dashboard, AnimalDetection, etc.)
│   └── App.jsx          # Main routing and navigation
├── public/              # Static assets
└── package.json         # Project metadata and dependencies
```

---

## Screenshots

*(Add images here)*

- Dashboard UI
- Animal Detection Camera Feed
- Analytics Hub & Soil Intelligence
- Hardware setup & PCB design

---

## Future Improvements

- [ ] iOS App Deployment
- [ ] Expanded AI prediction models
- [ ] LoRaWAN support for remote areas without WiFi/GSM

---

## Author

**Prolayjit Biswas**
- [LinkedIn](#)
- [GitHub](https://github.com/Prolayjit-B14)
- [Portfolio](#)
