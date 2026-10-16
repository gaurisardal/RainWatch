# RainWatch — Monsoon Waterlogging Early-Warning & Risk Mapping System (Pune)

A high-performance monsoon inundation early warning and risk intelligence web application built for the Pune metropolitan region. RainWatch integrates predictive terrain-hydrology factors (drainage limits, elevation dips, rainfall intensity, historical flood hotspots) with real-time citizen crowdsourcing and municipal response triage.

---

## 🚀 Quick Start

### 1. Change Directory & Install Dependencies
```bash
cd C:\Users\Gauri\.gemini\antigravity\scratch\rainwatch
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Authentication (Minimal Demo-Only)
- **Role:** Citizen (No login required, instant public access)
- **Role:** Response Team (Demo staff mode)
- **Demo Staff Passcode:** `pune2026`
- **Security Notice:** Selecting "Response Team" alone does **not** grant access. Passcode verification is required. A permanent banner indicates **"DEMO-ONLY STAFF MODE, NOT SECURE AUTHENTICATION"**.

---

## 🗺️ Key Features Implemented

### 1. Interactive Pune Monsoon Risk Map
- **Coverage:** Centered on Pune (`[18.5204, 73.8567]`) covering 10 critical arterial junctions and chronic monsoon bottlenecks (Sancheti Hospital Underpass, Alka Talkies Chowk, Pulgate Underpass, Swargate Subway, Paud Phata, Chandani Chowk, Balewadi Phata, Phoenix Mall stretch, Gadital Hadapsar, Station Approach).
- **Forecast Filter:** Toggle **1-Hour / 3-Hours / 6-Hours** ahead. Dynamically updates all hotspot scores and markers.
- **Visual Risk Coding:**
  - 🟢 **Low Risk (0–39):** Adequate gradient & clear runoff
  - 🟠 **Moderate Risk (40–74):** Slow transit, curb-depth water
  - 🔴 **High Risk (75–100):** Deep submergence threat (features animated pulse effect)
- **Multi-layer Toggles:** Independently show/hide Predicted Risk spots, Citizen Reports (`📢`), and Confirmed Emergency Incidents (`⚠️`).
- **Interactive Marker Popups:** Displays location name, demo estimate badge, composite risk score, forecast rainfall accumulation (mm), uncertainty margin (±X%), and detailed multi-factor breakdown (Drainage, Low Elevation, Intensity, Historical Flooding).
- **Map Coordinate Picker:** Clicking anywhere on the map drops a temporary selector pin and auto-populates latitude & longitude into the citizen report form.

### 2. Citizen Crowdsourced Reporting Portal
- **Location Selector:** Choose from 10 monitored hotspots or enter custom street coordinates (or click on the map).
- **Water Depth Gauge:** Interactive range slider estimating water level (curb height ~10 cm to severe vehicle submergence 70+ cm).
- **Photo Upload & Client Preview:** Fast in-browser image preview before submission.
- **Validation:** Minimum description length, metropolitan bounding box verification, and instant user feedback.
- **Instant Reactivity:** Submitted reports immediately appear on the map and in the public feed, persisted to `localStorage`.
- **Honesty Separation:** Citizen reports are strictly tagged as **unverified** until confirmed by response officers.

### 3. Response Centre Triage Table & Verification
- **Dynamic Prioritization:** Ranks monitored sites into **Critical, High, Medium, and Low** priority using composite calculation:
  $$\text{Effective Score} = \text{Forecast Score} + 12 \times (\text{Nearby Reports within } 500\,\text{m})$$
- **Nearby Proximity Clustering:** Dynamically computes distance using the Haversine formula to cluster crowdsourced reports within ~500m of vulnerable infrastructure.
- **Report Verification Workflow:** Staff can inspect unverified citizen reports and click **"Verify as Confirmed Incident"**. This creates a formal Incident object with assigned severity, officer name, and dispatch notes.
- **Live Recalculating Dashboard Cards:**
  - High-risk hotspots count
  - Moderate-risk roads count
  - Citizen reports received & pending count
  - Monitored locations currently requiring inspection
- **State Reset:** "Reset Demo State" button enables judges to instantly restore original sample data anytime.

### 4. Monsoon Route Advisories (Demo Data)
- Highlights vulnerable Pune roads (e.g., Shivajinagar to Deccan via Sancheti, Nagar Road, Pulgate) with cautious alternative detours.
- Clearly disclaimed as **Demo Data** without claiming automated routing algorithms.

---

## ⚙️ Environment Variables

RainWatch runs with **zero required environment variables** using OpenStreetMap standard tiles:

| Variable | Required | Description |
| :--- | :--- | :--- |
| `VITE_GOOGLE_MAPS_API_KEY` | **Optional** | If provided, switches tile provider to Google Maps tiles. If unset, automatically defaults to OpenStreetMap. Never blocks application startup. |

---

## 🛡️ Honesty & Transparency Rules
- Every prediction score features a visible **"Demo Estimate"** badge.
- Explicit notice that rainfall accumulation and risk scores are sample datasets for hackathon/demo purposes, not live bureau weather feeds.
- Predictions, crowdsourced reports, and verified incidents are isolated into strictly typed data structures.
