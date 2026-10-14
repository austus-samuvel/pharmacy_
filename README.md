# ColdChain IoT — Pharmacy Cold-Storage Stock Monitoring Platform

> **Pure HTML / CSS / Vanilla JavaScript UI Prototype**  
> Zero external dependencies • Zero build tools (No Node/npm required) • Works 100% offline immediately

---

## 🚀 Quick Start (Instant Run)

You can launch and test the platform immediately using either method:

### Option 1: Direct File Open
Simply double-click **`index.html`** in Windows File Explorer, or run:
```powershell
Start-Process "d:\IoT Endsem\index.html"
```
It opens instantly in your default web browser (Edge, Chrome, Firefox).

### Option 2: Local HTTP Server (Optional)
If you prefer running via a local web server, run:
```powershell
python -m http.server 8000
```
Then visit: `http://localhost:8000`

---

## 🌟 Portals & Features Implemented

### 1. 🏥 Pharmacy Portal (City Care Pharmacy)
- **Dashboard:** Real-time summary cards, total medicines, estimated units, low-stock counter, live temperature gauge, and interactive Canvas charts (7-day stock trend, 24-hour cold-chain temperature band).
- **Medicine Inventory:** Searchable and filterable table (Low stock, Normal stock, Uncertain sensor readings). Full CRUD: Add medicine, Edit medicine, Delete medicine, and sensor confidence scores.
- **On-Demand Stock Scanning:** Simulated interrogation of the **ESP8266 NodeMCU** and **HC-SR04 ultrasonic distance sensor**. Real-time progress bar, live telemetry console logs, and simulated obstacle / uncertain reading toggle.
- **Cold-Storage Monitoring:** DS18B20 digital thermal sensor telemetry, configurable safe temperature boundaries (default: 2.0°C to 8.0°C), thermal spike simulation ("Door Open"), and CSV export.
- **Distributor Subscriptions:** Authorize or revoke wholesale distributor access requests. Approved channels immediately reflect across the platform.
- **Alerts & Warnings:** Severity badges (Critical, Warning, Info), category filters, and "Mark as Read" actions.
- **Device & Sensor Settings:** NodeMCU hardware specifications, IP/MAC details, Wi-Fi RSSI, sensor pinout mapping (Trig: D5, Echo: D6, Temp: D2), and speed-of-sound temperature compensation formulas.

### 2. 🚚 Wholesale Medicine Distributor Portal (MetroMed Wholesale)
- **Distributor Dashboard:** Overview of subscribed pharmacies, pending access requests, visible stock units, and network replenishment alerts.
- **Public Pharmacy Directory:** Searchable registry of pharmacies. Strict privacy enforcement: stock quantities and temperatures are confidential and hidden until approved.
- **Subscription Requests:** Submit new stock feed requests with custom notes; cancel pending requests.
- **Pharmacy Stock Details:** Unlocked exclusively for approved pharmacies. Displays live cold-storage temperature, stale-data warning if the device is offline, per-compartment inventory, and on-demand refresh requests.
- **Subscribed Alerts & Profile:** Threshold alerts from approved partner pharmacies and wholesale distributor license management.

### 3. 🛡️ Administrator Portal
- **Platform Overview:** High-level metrics on registered pharmacies, wholesalers, active IoT hardware nodes, and platform health.
- **Account Management:** Approve, suspend, or reactivate pharmacy and distributor accounts.
- **IoT Fleet Monitoring:** Monitor deployed ESP8266 devices across facilities, check chamber temperatures, ping nodes, and check firmware builds.
- **System Activity & Audit Log:** Simulated security and telemetry event records with CSV export.

### 4. 🌐 Role Switcher & Live IoT Simulator
- **One-Click Role Switcher:** Toggle between Pharmacy Staff, Medicine Distributor, Platform Administrator, and the Landing Page at any time from the top bar.
- **ESP8266 Online/Offline Simulator:** Click the ESP8266 status badge in the header to simulate gateway disconnections and test stale data warnings and offline alerts.
- **Reset Demo Data:** Revert the state back to default mock data anytime via the "Reset Data" button.
- **Persistent State:** Prototype changes (added medicines, approved subscriptions, configured temperature limits) are saved in browser `localStorage`.
