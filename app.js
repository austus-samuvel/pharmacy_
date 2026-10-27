/**
 * ColdChain IoT - Pharmacy and Distributor Inventory Management System
 * Pure Vanilla JavaScript Client Engine (Powered by Live Supabase Telemetry)
 * ---------------------------------------------------------------------
 * Features:
 * - Direct Supabase integration with real-time IoT scan ingestion
 * - Automated depth-to-unit stock conversion from physical container dimensions
 * - Scanning arc visualization (0°–180°) mapped to live HC-SR04 sonar readings
 * - In-place DOM updates on every periodic 60-second scan
 * - Medicine slot configuration and distributor access workflows
 */

// ============================================================================
// 1. Supabase Client & Application State
// ============================================================================

const SUPABASE_URL = "https://bfqzofrxqgdftdfnsrki.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmcXpvZnJ4cWdkZnRkZm5zcmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTI0NjMsImV4cCI6MjEwODY2ODQ2M30.S85ZRPd2sRqBCCV7F6yEkftyuI6_2ppxkJB6bWvrDnU";

// Initialize Supabase Client
let supabase = null;

function getSupabase() {
  if (!supabase && typeof window !== "undefined" && window.supabase && typeof window.supabase.createClient === "function") {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

// Initial Default Medicine Slot Profiles matching active hardware servo angles
const DEFAULT_MEDICINES = [
  {
    id: "med-180",
    name: "Insulin Glargine Vials (100 U/mL)",
    storage_angle: 180,
    unit: "vials",
    empty_distance_cm: 45.0,
    full_distance_cm: 8.0,
    unit_height_cm: 0.74,
    max_capacity: 50,
    min_threshold: 15,
    current_stock: 45,
    last_distance_cm: 11.82,
    last_reading_at: new Date().toISOString(),
    status: "Normal",
  },
  {
    id: "med-147",
    name: "Amoxicillin Suspension (250mg/5mL)",
    storage_angle: 147,
    unit: "bottles",
    empty_distance_cm: 45.0,
    full_distance_cm: 8.0,
    unit_height_cm: 0.92,
    max_capacity: 40,
    min_threshold: 10,
    current_stock: 30,
    last_distance_cm: 17.85,
    last_reading_at: new Date().toISOString(),
    status: "Normal",
  },
  {
    id: "med-131",
    name: "Ceftriaxone Sodium 1g Powder",
    storage_angle: 131,
    unit: "vials",
    empty_distance_cm: 45.0,
    full_distance_cm: 8.0,
    unit_height_cm: 0.62,
    max_capacity: 60,
    min_threshold: 15,
    current_stock: 39,
    last_distance_cm: 21.11,
    last_reading_at: new Date().toISOString(),
    status: "Normal",
  },
  {
    id: "med-121",
    name: "Normal Saline 0.9% IV Bags (500mL)",
    storage_angle: 121,
    unit: "bags",
    empty_distance_cm: 85.0,
    full_distance_cm: 15.0,
    unit_height_cm: 2.33,
    max_capacity: 30,
    min_threshold: 8,
    current_stock: 5,
    last_distance_cm: 74.02,
    last_reading_at: new Date().toISOString(),
    status: "Low",
  },
];

const state = {
  // Authentication & Current User
  currentUser: {
    id: "pharm-001",
    email: "pharmacy@coldchain.demo",
    full_name: "Dr. Vijay (Pharmacy Owner)",
    role: "pharm", // 'pharm' | 'dist'
    pharmacy: {
      id: "pharma-shelf-a",
      name: "Shelf A Cold Storage",
      license_number: "DL-2026-PHARM-01",
      city: "Main Branch",
      device_uid: "esp32-demo-001",
    },
  },

  // Active Navigation Tab
  activeTab: {
    pharm: "dashboard", // 'dashboard' | 'inventory' | 'distributors' | 'sensors'
    dist: "pharmacies", // 'pharmacies' | 'inventory' | 'invitations'
  },

  // Pharmacy Inventory & Sensors
  pharmacyMedicines: [],
  pharmacyDistributors: [
    {
      id: "dist-1",
      name: "Apex Pharma Distributors",
      email: "orders@apexpharma.com",
      status: "accepted",
      city: "Metro Depot",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "dist-2",
      name: "CareLogistics Cold Chain",
      email: "logistics@carelogistics.com",
      status: "pending",
      city: "Regional Hub",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  sensorStatus: {
    device_status: "online",
    last_reading_at: null,
    is_stale: false,
    stale_threshold_seconds: 120,
    device_id: "esp32-demo-001",
  },

  // Telemetry History from Supabase
  recentScans: [],

  // Distributor View Data
  accessiblePharmacies: [
    {
      id: "pharma-shelf-a",
      name: "Shelf A Cold Storage",
      license_number: "DL-2026-PHARM-01",
      city: "Main Branch",
      medicines_count: 4,
      last_reading_at: new Date().toISOString(),
    },
  ],
  selectedPharmacy: null,
  selectedPharmacyInventory: [],
  distributorInvitations: [],

  // Polling Handle
  realtimeTimer: null,
};

// ============================================================================
// 2. Mathematical Stock Calculation Engine
// ============================================================================

/**
 * Converts ultrasonic distance reading into estimated medicine quantity
 * using physical compartment geometry:
 *   Stack Height = empty_distance_cm - measured_distance_cm
 *   Stock Units  = clamp(0, max_capacity, round(Stack Height / unit_height_cm))
 */
function calculateStockFromReading(measuredDistanceCm, angle, medicineConfig) {
  if (
    measuredDistanceCm === null ||
    measuredDistanceCm === undefined ||
    measuredDistanceCm < 0
  ) {
    return {
      valid: false,
      quantity: medicineConfig.current_stock || 0,
      status: "Invalid",
      confidence: 0,
      stack_height_cm: 0.0,
      error: "Missing or invalid sensor reading.",
    };
  }

  const emptyDist = Number(medicineConfig.empty_distance_cm) || 45.0;
  const fullDist = Number(medicineConfig.full_distance_cm) || 8.0;
  const maxCapacity = Number(medicineConfig.max_capacity) || 50;
  const minThreshold = Number(medicineConfig.min_threshold) || 15;
  const priorStock = Number(medicineConfig.current_stock) || 0;
  let unitHeight = Number(medicineConfig.unit_height_cm) || 0.0;

  const stackSpan = emptyDist - fullDist;
  if (stackSpan <= 0) {
    return {
      valid: false,
      quantity: priorStock,
      status: "Config Error",
      confidence: 0,
      stack_height_cm: 0.0,
      error: "Empty distance must exceed full distance.",
    };
  }

  if (unitHeight <= 0 && maxCapacity > 0) {
    unitHeight = stackSpan / maxCapacity;
  }

  // Detect out-of-range / empty floor reading
  if (measuredDistanceCm > emptyDist + 4.0) {
    return {
      valid: false,
      quantity: 0,
      status: "Out of Stock",
      confidence: 85,
      stack_height_cm: 0.0,
      error: `Distance ${measuredDistanceCm.toFixed(1)}cm reaches empty container floor.`,
    };
  }

  // Detect anomalous obstruction closer than full stack
  if (measuredDistanceCm < fullDist - 3.0) {
    return {
      valid: false,
      quantity: priorStock,
      status: "Uncertain",
      confidence: 40,
      stack_height_cm: Math.max(0, emptyDist - measuredDistanceCm),
      error: `Obstruction detected closer than full container.`,
    };
  }

  const stackHeight = Math.max(0, emptyDist - measuredDistanceCm);
  let calculatedUnits = 0;
  if (unitHeight > 0) {
    calculatedUnits = Math.round(stackHeight / unitHeight);
  } else {
    calculatedUnits = Math.round((stackHeight / stackSpan) * maxCapacity);
  }
  calculatedUnits = Math.max(0, Math.min(maxCapacity, calculatedUnits));

  let statusLabel = "Normal";
  if (calculatedUnits === 0) {
    statusLabel = "Out of Stock";
  } else if (calculatedUnits <= minThreshold) {
    statusLabel = "Low";
  }

  return {
    valid: true,
    quantity: calculatedUnits,
    status: statusLabel,
    confidence: 95,
    stack_height_cm: parseFloat(stackHeight.toFixed(2)),
    error: null,
  };
}

// ============================================================================
// 3. Supabase Data Ingestion & Realtime Sync
// ============================================================================

/**
 * Loads medicine definitions from localStorage or fallback defaults
 */
function loadStoredMedicines() {
  const stored = localStorage.getItem("PHARMACY_MEDICINES");
  if (stored) {
    try {
      state.pharmacyMedicines = JSON.parse(stored);
      return;
    } catch (e) {
      console.warn("Failed to parse stored medicines:", e);
    }
  }
  state.pharmacyMedicines = [...DEFAULT_MEDICINES];
  localStorage.setItem("PHARMACY_MEDICINES", JSON.stringify(state.pharmacyMedicines));
}

/**
 * Queries Supabase for live scans, readings, and device heartbeats
 */
async function fetchLiveTelemetryFromSupabase() {
  const sb = getSupabase();
  if (!sb) {
    console.warn("Supabase client is not initialized.");
    return;
  }

  try {
    // 1. Query latest scans and nested distance_readings
    const { data: scans, error: scansError } = await sb
      .from("scans")
      .select(`
        id,
        device_id,
        scan_id,
        scan_sequence,
        angles_scanned,
        valid_readings_count,
        invalid_readings_count,
        scan_duration_ms,
        created_at,
        distance_readings (
          id,
          scan_id,
          device_id,
          angle,
          distance_cm,
          is_valid,
          samples_count,
          created_at
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    if (scansError) {
      console.error("Error fetching scans from Supabase:", scansError);
      return;
    }

    // 2. Query device heartbeat
    const { data: device } = await sb
      .from("devices")
      .select("*")
      .eq("device_id", "esp32-demo-001")
      .maybeSingle();

    if (scans && scans.length > 0) {
      state.recentScans = scans;
      const latestScan = scans[0];
      const readings = latestScan.distance_readings || [];

      // Update Heartbeat status
      const lastTimestamp = latestScan.created_at || (device ? device.last_seen_at : null);
      state.sensorStatus.last_reading_at = lastTimestamp;

      const elapsedMs = Date.now() - new Date(lastTimestamp).getTime();
      state.sensorStatus.is_stale = elapsedMs > 120000; // Stale if no reading for 2 mins
      state.sensorStatus.device_status = state.sensorStatus.is_stale ? "offline" : "online";

      // 3. Map readings directly into each configured medicine slot
      state.pharmacyMedicines.forEach((m) => {
        // Find matching reading by angle (with tolerance of +/- 3 degrees)
        const reading = readings.find(
          (r) => Math.abs(r.angle - m.storage_angle) <= 3
        );

        if (reading && reading.is_valid && reading.distance_cm !== null) {
          const calc = calculateStockFromReading(reading.distance_cm, m.storage_angle, m);
          m.current_stock = calc.quantity;
          m.last_distance_cm = reading.distance_cm;
          m.last_reading_at = latestScan.created_at;
          m.status = calc.status;
        } else if (reading && !reading.is_valid) {
          m.status = "Invalid";
        }
      });

      // Save updated stock to storage
      localStorage.setItem("PHARMACY_MEDICINES", JSON.stringify(state.pharmacyMedicines));

      // Update DOM
      const modal = document.getElementById("modal-container");
      if (modal && modal.classList.contains("open")) {
        updatePharmacyDOMInPlace();
      } else {
        renderApp();
      }
    }
  } catch (err) {
    console.error("Telemetry sync exception:", err);
  }
}

/**
 * Initializes Supabase Realtime channel subscription and periodic polling
 */
function initRealtimeSync() {
  loadStoredMedicines();
  fetchLiveTelemetryFromSupabase();

  const sb = getSupabase();
  if (sb) {
    // Subscribe to Postgres changes on 'scans' table
    sb.channel("live-telemetry-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scans" },
        () => {
          fetchLiveTelemetryFromSupabase();
          showToast("⚡ New IoT scan received from ESP32!", "info");
        }
      )
      .subscribe();
  }

  // Periodic polling fallback every 8 seconds
  clearInterval(state.realtimeTimer);
  state.realtimeTimer = setInterval(() => {
    fetchLiveTelemetryFromSupabase();
  }, 8000);
}

// ============================================================================
// 4. In-Place DOM Updates & Formatting Helpers
// ============================================================================

function updatePharmacyDOMInPlace() {
  const totalMedsEl = document.getElementById("stat-total-meds");
  const totalUnitsEl = document.getElementById("stat-total-units");
  const lowStockEl = document.getElementById("stat-low-stock");
  const lastUpdateEl = document.getElementById("stat-last-update");
  const staleBannerEl = document.getElementById("pharm-stale-banner");

  const meds = state.pharmacyMedicines;
  if (totalMedsEl) totalMedsEl.innerText = meds.length;
  if (totalUnitsEl)
    totalUnitsEl.innerText = meds.reduce((sum, m) => sum + (m.current_stock || 0), 0);
  if (lowStockEl)
    lowStockEl.innerText = meds.filter((m) => m.current_stock <= m.min_threshold).length;
  if (lastUpdateEl)
    lastUpdateEl.innerText = formatTimestamp(state.sensorStatus.last_reading_at);

  if (staleBannerEl) {
    staleBannerEl.style.display = state.sensorStatus.is_stale ? "flex" : "none";
  }

  // Update inventory table rows
  meds.forEach((m) => {
    const stockCell = document.getElementById(`med-stock-${m.id}`);
    const badgeCell = document.getElementById(`med-badge-${m.id}`);
    const timeCell = document.getElementById(`med-time-${m.id}`);
    if (stockCell) stockCell.innerText = `${m.current_stock} ${m.unit}`;
    if (badgeCell) {
      badgeCell.className = `badge ${getStatusBadgeClass(m.status)}`;
      badgeCell.innerText = m.status;
    }
    if (timeCell) timeCell.innerText = formatTimestamp(m.last_reading_at);
  });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatTimestamp(isoString) {
  if (!isoString) return "No telemetry yet";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "Normal":
      return "badge-success";
    case "Low":
      return "badge-warning";
    case "Out of Stock":
      return "badge-danger";
    case "Invalid":
      return "badge-danger";
    default:
      return "badge-info";
  }
}

// ============================================================================
// 5. Router & Main Render
// ============================================================================

function renderApp() {
  const root = document.getElementById("app-root");
  if (!root) return;

  if (state.currentUser.role === "pharm") {
    root.innerHTML = renderPharmacyApp();
  } else if (state.currentUser.role === "dist") {
    root.innerHTML = renderDistributorApp();
  }

  // Inject modal & toast containers
  root.innerHTML += `
    <div id="modal-container" class="modal-backdrop"></div>
    <div id="toast-container" class="toast-container"></div>
  `;
}

// ============================================================================
// 6. Pharmacy Website Interface
// ============================================================================

function renderPharmacyApp() {
  const user = state.currentUser;
  const pharma = user.pharmacy || { name: "Pharmacy Cold Storage" };
  const tab = state.activeTab.pharm;

  return `
    <!-- Top Header -->
    <header class="app-header">
      <div class="header-inner">
        <div class="brand-wrapper">
          <div class="brand-icon">❄️</div>
          <div>
            <div class="brand-title">
              ${escapeHtml(pharma.name)}
              <span class="brand-tag">Pharmacy</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted);">
              ColdChain IoT • Device: <code>${escapeHtml(pharma.device_uid)}</code> • Live Supabase Ingestion
            </div>
          </div>
        </div>

        <div class="header-actions">
          <div class="iot-status-badge ${state.sensorStatus.is_stale ? "offline" : ""}" title="IoT Ultrasonic Transceiver Status">
            <span class="pulse-dot"></span>
            <span>${state.sensorStatus.is_stale ? "⚠️ Sensor Stale / Standalone" : "🟢 Sensor Active (60s Telemetry)"}</span>
          </div>

          <!-- Role Switcher Toggle -->
          <div style="display:flex; align-items:center; gap:0.5rem; background:var(--bg-muted); padding:0.25rem 0.5rem; border-radius:var(--radius-sm);">
            <span style="font-size:0.75rem; color:var(--text-muted);">Role:</span>
            <button class="btn btn-sm ${user.role === 'pharm' ? 'btn-primary' : 'btn-outline'}" onclick="switchRole('pharm')">Pharmacy</button>
            <button class="btn btn-sm ${user.role === 'dist' ? 'btn-primary' : 'btn-outline'}" onclick="switchRole('dist')">Distributor</button>
          </div>

          <div style="font-size:0.8125rem; font-weight:600; color:var(--text-main);">
            ${escapeHtml(user.full_name)}
          </div>
        </div>
      </div>
    </header>

    <div class="app-container">
      <!-- Sidebar Navigation -->
      <aside class="app-sidebar">
        <div class="sidebar-section-title">Pharmacy Management</div>
        <ul class="nav-list">
          <li>
            <a class="nav-link ${tab === "dashboard" ? "active" : ""}" onclick="switchPharmacyTab('dashboard')">
              <span class="nav-item-left"><span>📊</span><span>Dashboard</span></span>
            </a>
          </li>
          <li>
            <a class="nav-link ${tab === "inventory" ? "active" : ""}" onclick="switchPharmacyTab('inventory')">
              <span class="nav-item-left"><span>💊</span><span>Inventory & Angles</span></span>
              ${state.pharmacyMedicines.length ? `<span class="nav-badge">${state.pharmacyMedicines.length}</span>` : ""}
            </a>
          </li>
          <li>
            <a class="nav-link ${tab === "distributors" ? "active" : ""}" onclick="switchPharmacyTab('distributors')">
              <span class="nav-item-left"><span>🤝</span><span>Distributor Access</span></span>
            </a>
          </li>
          <li>
            <a class="nav-link ${tab === "sensors" ? "active" : ""}" onclick="switchPharmacyTab('sensors')">
              <span class="nav-item-left"><span>📟</span><span>IoT Transceiver</span></span>
              <span class="nav-badge" style="background:#10b981; color:#fff;">LIVE</span>
            </a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <div class="sidebar-user-card">
            <div class="user-avatar">RX</div>
            <div class="user-info">
              <div class="user-name">${escapeHtml(user.full_name)}</div>
              <div class="user-role">Pharmacy Owner</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="app-main">
        <div id="pharm-stale-banner" class="warning-callout" style="display:${state.sensorStatus.is_stale ? "flex" : "none"}; margin-bottom:1.25rem;">
          <div>⚠️</div>
          <div>
            <strong>Sensor Connection Notice:</strong> No live ultrasonic telemetry received within the last 120 seconds. Displayed inventory represents the latest stored readings.
          </div>
        </div>

        ${renderActivePharmacyTab(tab)}
      </main>
    </div>
  `;
}

function switchPharmacyTab(tabId) {
  state.activeTab.pharm = tabId;
  renderApp();
}

function switchRole(role) {
  state.currentUser.role = role;
  renderApp();
}

function renderActivePharmacyTab(tab) {
  switch (tab) {
    case "dashboard":
      return renderPharmacyDashboard();
    case "inventory":
      return renderPharmacyInventory();
    case "distributors":
      return renderPharmacyDistributors();
    case "sensors":
      return renderPharmacySensors();
    default:
      return renderPharmacyDashboard();
  }
}

// ============================================================================
// 7. Pharmacy Dashboard View
// ============================================================================

function renderPharmacyDashboard() {
  const meds = state.pharmacyMedicines;
  const totalMeds = meds.length;
  const totalUnits = meds.reduce((sum, m) => sum + (m.current_stock || 0), 0);
  const lowStock = meds.filter((m) => m.current_stock <= m.min_threshold).length;
  const lastUpdate = formatTimestamp(state.sensorStatus.last_reading_at);

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Cold-Storage Inventory Overview</h1>
        <p class="page-desc">Automated ultrasonic inventory calculated from live Supabase sensor scans</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" onclick="fetchLiveTelemetryFromSupabase()">
          🔄 Fetch Live Readings
        </button>
        <button class="btn btn-primary" onclick="openAddMedicineModal()">
          + Register Medicine Slot
        </button>
      </div>
    </div>

    <!-- Metrics Cards -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Configured Medicines</span>
          <div class="metric-icon-box" style="background:#e0f2fe; color:#0369a1;">💊</div>
        </div>
        <div class="metric-value" id="stat-total-meds">${totalMeds}</div>
        <div class="metric-sub">Assigned to fixed servo angles</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Calculated Stock Units</span>
          <div class="metric-icon-box" style="background:#d1fae5; color:#065f46;">📦</div>
        </div>
        <div class="metric-value" id="stat-total-units">${totalUnits}</div>
        <div class="metric-sub positive">Real-time depth conversion</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Low Stock Reorders</span>
          <div class="metric-icon-box" style="background:#fee2e2; color:#991b1b;">⚠️</div>
        </div>
        <div class="metric-value" id="stat-low-stock" style="color:var(--danger);">${lowStock}</div>
        <div class="metric-sub danger">At or below configured threshold</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Last Sensor Telemetry</span>
          <div class="metric-icon-box" style="background:#ccfbf1; color:#0f766e;">📡</div>
        </div>
        <div class="metric-value" id="stat-last-update" style="font-size:1.125rem;">${lastUpdate}</div>
        <div class="metric-sub">ESP32 60s periodic sweep</div>
      </div>
    </div>

    <!-- Storage Angular Arc Distribution -->
    <div class="card" style="margin-bottom:1.5rem;">
      <div class="card-header">
        <div class="card-title"><span>📐 Cold-Storage Chamber Scanning Arc (0° – 180°)</span></div>
        <span style="font-size:0.75rem; color:var(--text-muted);">Ceiling servo orientation mapping</span>
      </div>
      <div class="card-body">
        ${
          meds.length === 0
            ? `
          <div class="empty-state">
            <div class="empty-state-icon">📡</div>
            <div class="empty-state-title">No storage slots configured</div>
            <div class="empty-state-desc">Register your medicines and assign them to unique servo angles along the cold-storage arc.</div>
            <button class="btn btn-primary" onclick="openAddMedicineModal()">+ Configure First Slot</button>
          </div>
        `
            : `
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
            ${meds
              .map((m) => {
                const fillPct =
                  m.max_capacity > 0
                    ? Math.round((m.current_stock / m.max_capacity) * 100)
                    : 0;
                return `
                <div style="background:var(--bg-subtle); border:1px solid var(--border); border-radius:var(--radius); padding:1rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <span class="servo-angle-pill">📐 ${m.storage_angle}°</span>
                    <span class="badge ${getStatusBadgeClass(m.status)}">${m.status}</span>
                  </div>
                  <strong style="font-size:0.875rem; display:block; margin-bottom:0.25rem;">${escapeHtml(m.name)}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.5rem;">
                    Floor: ${m.empty_distance_cm}cm • Echo: <strong>${m.last_distance_cm ? m.last_distance_cm.toFixed(1) + "cm" : "—"}</strong>
                  </div>
                  <div class="progress-bar-container" style="height:6px; margin-bottom:0.35rem;">
                    <div class="progress-bar-fill" style="width:${Math.min(100, fillPct)}%; background:${fillPct <= 25 ? "var(--danger)" : "var(--primary)"};"></div>
                  </div>
                  <div style="display:flex; justify-content:space-between; font-size:0.75rem;">
                    <span>Stock: <strong>${m.current_stock}</strong> / ${m.max_capacity} ${escapeHtml(m.unit)}</span>
                    <span style="font-weight:600;">${fillPct}% filled</span>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        `
        }
      </div>
    </div>
  `;
}

// ============================================================================
// 8. Inventory & Angles Management View
// ============================================================================

function renderPharmacyInventory() {
  const meds = state.pharmacyMedicines;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Medicine Compartments & Arc Configuration</h1>
        <p class="page-desc">Calibrate compartment floor depths, container capacities, and unit heights</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="openAddMedicineModal()">
          + Register Medicine Slot
        </button>
      </div>
    </div>

    <div class="card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Angle</th>
              <th>Medicine Name</th>
              <th>Unit</th>
              <th>Empty Floor ($D_{empty}$)</th>
              <th>Full Stack ($D_{full}$)</th>
              <th>Unit Height</th>
              <th>Capacity</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${
              meds.length === 0
                ? `<tr><td colspan="10" style="text-align:center; padding:2rem; color:var(--text-muted);">No medicines configured yet.</td></tr>`
                : meds
                    .map(
                      (m) => `
              <tr>
                <td><span class="servo-angle-pill">📐 ${m.storage_angle}°</span></td>
                <td><strong>${escapeHtml(m.name)}</strong></td>
                <td>${escapeHtml(m.unit)}</td>
                <td><code>${m.empty_distance_cm} cm</code></td>
                <td><code>${m.full_distance_cm} cm</code></td>
                <td><code>${m.unit_height_cm || ( (m.empty_distance_cm - m.full_distance_cm)/m.max_capacity ).toFixed(2)} cm</code></td>
                <td>${m.max_capacity}</td>
                <td><strong id="med-stock-${m.id}">${m.current_stock} ${escapeHtml(m.unit)}</strong></td>
                <td><span id="med-badge-${m.id}" class="badge ${getStatusBadgeClass(m.status)}">${m.status}</span></td>
                <td style="text-align:right;">
                  <button class="btn btn-outline btn-sm" onclick="openEditMedicineModal('${m.id}')">Edit</button>
                  <button class="btn btn-outline btn-sm" style="color:var(--danger);" onclick="deleteMedicineSlot('${m.id}')">Delete</button>
                </td>
              </tr>
            `
                    )
                    .join("")
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// 9. Distributor Access Management View
// ============================================================================

function renderPharmacyDistributors() {
  const dists = state.pharmacyDistributors;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Wholesale Distributor Access Channels</h1>
        <p class="page-desc">Grant or revoke inventory visibility permissions to wholesale distributors</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="openInviteDistributorModal()">
          + Invite Wholesale Distributor
        </button>
      </div>
    </div>

    <div class="card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Distributor Name</th>
              <th>Email</th>
              <th>Hub City</th>
              <th>Status</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${
              dists.length === 0
                ? `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);">No distributors invited yet.</td></tr>`
                : dists
                    .map(
                      (d) => `
              <tr>
                <td><strong>${escapeHtml(d.name)}</strong></td>
                <td><code>${escapeHtml(d.email)}</code></td>
                <td>${escapeHtml(d.city || "Depot")}</td>
                <td>
                  <span class="badge ${d.status === "accepted" ? "badge-success" : "badge-warning"}">
                    ${d.status.toUpperCase()}
                  </span>
                </td>
                <td style="text-align:right;">
                  <button class="btn btn-outline btn-sm" style="color:var(--danger);" onclick="revokeDistributorAccess('${d.id}')">
                    Revoke Channel
                  </button>
                </td>
              </tr>
            `
                    )
                    .join("")
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// 10. IoT Transceiver & Telemetry Diagnostics View
// ============================================================================

function renderPharmacySensors() {
  const pharma = state.currentUser.pharmacy;
  const scans = state.recentScans;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">IoT Transceiver & Supabase Ingestion Stream</h1>
        <p class="page-desc">Automated 60-second hardware telemetry recorded live in Supabase PostgreSQL</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="fetchLiveTelemetryFromSupabase()">
          🔄 Refresh Stream Now
        </button>
      </div>
    </div>

    <div class="hardware-callout">
      <div style="font-size:1.5rem;">📟</div>
      <div>
        <strong>ESP32 Hardware Ingestion Active:</strong> Transceiver performs spatial sweeps every 60 seconds and publishes directly to Supabase table <code>scans</code>. Distance measurements are converted into stock counts in real time.
      </div>
    </div>

    <div class="charts-row" style="margin-bottom:1.5rem;">
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span>Telemetry Gateway Diagnostics</span></div>
        </div>
        <div class="card-body">
          <table class="data-table">
            <tr>
              <td><strong>Assigned Unit</strong></td>
              <td>${escapeHtml(pharma ? pharma.name : "Shelf A Monitor")}</td>
            </tr>
            <tr>
              <td><strong>Device UID</strong></td>
              <td><code>${escapeHtml(pharma ? pharma.device_uid : "esp32-demo-001")}</code></td>
            </tr>
            <tr>
              <td><strong>Ingestion Interval</strong></td>
              <td>Every 60 Seconds (Non-blocking)</td>
            </tr>
            <tr>
              <td><strong>Gateway Status</strong></td>
              <td>
                <span class="badge ${state.sensorStatus.is_stale ? "badge-danger" : "badge-success"}">
                  ${state.sensorStatus.is_stale ? "⚠️ Standalone / Disconnected" : "🟢 Active Online (Receiving Readings)"}
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>Last Recorded Ingestion</strong></td>
              <td>${formatTimestamp(state.sensorStatus.last_reading_at)}</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><span>Active Servo Arc Alignment</span></div>
        </div>
        <div class="card-body">
          <p style="font-size:0.8125rem; color:var(--text-muted); margin-bottom:1rem;">
            The horizontal SG90/MG90S servo motor positions the HC-SR04 ultrasonic transducer to calibrated angles:
          </p>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            ${state.pharmacyMedicines
              .map(
                (m) => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-muted); padding:0.5rem 0.75rem; border-radius:var(--radius-sm);">
                <span><span class="servo-angle-pill">📐 ${m.storage_angle}°</span> <strong>${escapeHtml(m.name)}</strong></span>
                <span><code>${m.last_distance_cm ? m.last_distance_cm.toFixed(1) + " cm" : "No echo"}</code></span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>

    <!-- Live Supabase Scans Log Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><span>📡 Real-Time Ingested Telemetry Feed (Supabase Table: scans)</span></div>
        <span style="font-size:0.75rem; color:var(--text-muted);">${scans.length} recent sweeps</span>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Sequence</th>
              <th>Recorded At</th>
              <th>Duration</th>
              <th>Echoes Captured</th>
              <th>Angular Distance Breakdown</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${
              scans.length === 0
                ? `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">Awaiting incoming telemetry from ESP32...</td></tr>`
                : scans
                    .map((s) => {
                      const readings = s.distance_readings || [];
                      return `
                <tr>
                  <td><strong>#${s.scan_sequence || 1}</strong></td>
                  <td>${formatTimestamp(s.created_at)}</td>
                  <td>${s.scan_duration_ms ? (s.scan_duration_ms / 1000).toFixed(2) + "s" : "—"}</td>
                  <td><span class="badge badge-info">${s.valid_readings_count || readings.length} / ${s.angles_scanned || readings.length}</span></td>
                  <td>
                    <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                      ${readings
                        .map(
                          (r) => `
                        <span style="background:var(--bg-muted); border:1px solid var(--border); padding:2px 6px; border-radius:4px; font-size:0.72rem; font-family:var(--font-mono);">
                          ${r.angle}°: <strong>${r.is_valid && r.distance_cm !== null ? r.distance_cm.toFixed(1) + "cm" : "TIMEOUT"}</strong>
                        </span>
                      `
                        )
                        .join("")}
                    </div>
                  </td>
                  <td><span class="badge badge-success">RECORDED</span></td>
                </tr>
              `;
                    })
                    .join("")
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// 11. Distributor Portal View
// ============================================================================

function renderDistributorApp() {
  const user = state.currentUser;
  const tab = state.activeTab.dist;

  return `
    <header class="app-header">
      <div class="header-inner">
        <div class="brand-wrapper">
          <div class="brand-icon">🚚</div>
          <div>
            <div class="brand-title">
              Apex Wholesale Logistics
              <span class="brand-tag" style="background:#0d9488; color:#fff;">Distributor Portal</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Real-Time Supply Chain Visibility</div>
          </div>
        </div>

        <div class="header-actions">
          <div style="display:flex; align-items:center; gap:0.5rem; background:var(--bg-muted); padding:0.25rem 0.5rem; border-radius:var(--radius-sm);">
            <span style="font-size:0.75rem; color:var(--text-muted);">Role:</span>
            <button class="btn btn-sm ${user.role === 'pharm' ? 'btn-primary' : 'btn-outline'}" onclick="switchRole('pharm')">Pharmacy</button>
            <button class="btn btn-sm ${user.role === 'dist' ? 'btn-primary' : 'btn-outline'}" onclick="switchRole('dist')">Distributor</button>
          </div>
          <div style="font-size:0.8125rem; font-weight:600; color:var(--text-main);">
            ${escapeHtml(user.full_name)}
          </div>
        </div>
      </div>
    </header>

    <div class="app-container">
      <main class="app-main" style="max-width:1400px; margin:0 auto;">
        <div class="page-header">
          <div>
            <h1 class="page-title">Authorized Pharmacy Depots</h1>
            <p class="page-desc">Cold-storage inventory status for pharmacies that have granted visibility</p>
          </div>
        </div>

        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title"><span>🏥 Shelf A Cold Storage — Live Stock Status</span></div>
            <span class="badge badge-success">ACTIVE GRANTED CHANNEL</span>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Angle</th>
                  <th>Medicine</th>
                  <th>Stock Available</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${state.pharmacyMedicines
                  .map(
                    (m) => `
                  <tr>
                    <td><span class="servo-angle-pill">📐 ${m.storage_angle}°</span></td>
                    <td><strong>${escapeHtml(m.name)}</strong></td>
                    <td><strong style="color:${m.current_stock <= m.min_threshold ? 'var(--danger)' : 'var(--primary)'};">${m.current_stock} ${escapeHtml(m.unit)}</strong></td>
                    <td><code>${m.min_threshold} ${escapeHtml(m.unit)}</code></td>
                    <td><span class="badge ${getStatusBadgeClass(m.status)}">${m.status}</span></td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `;
}

// ============================================================================
// 12. Modals (Add / Edit / Delete Slot & Invite Distributor)
// ============================================================================

function openAddMedicineModal() {
  const modal = document.getElementById("modal-container");
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">+ Register Medicine & Storage Angle</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="hardware-callout" style="margin-bottom:1rem; padding:0.75rem 1rem;">
          <div>📐</div>
          <div style="font-size:0.75rem;">
            Assign a servo angle (0° to 180°). The ceiling sensor rotates to this angle to interrogate this compartment.
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Medicine Full Name *</label>
          <input type="text" id="m-name" class="form-input" placeholder="e.g. Paracetamol Infusion 100mL" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Storage Servo Angle (0° – 180°) *</label>
            <input type="number" id="m-angle" class="form-input" placeholder="e.g. 90" min="0" max="180" required>
          </div>
          <div class="form-group">
            <label class="form-label">Unit Type *</label>
            <select id="m-unit" class="form-select">
              <option value="vials">Vials</option>
              <option value="bottles">Bottles</option>
              <option value="bags">Bags</option>
              <option value="ampoules">Ampoules</option>
              <option value="boxes">Boxes</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Empty Container Distance ($D_{empty}$ in cm) *</label>
            <input type="number" id="m-empty" class="form-input" value="45.0" step="0.5" required>
          </div>
          <div class="form-group">
            <label class="form-label">Full Stack Distance ($D_{full}$ in cm) *</label>
            <input type="number" id="m-full" class="form-input" value="8.0" step="0.5" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Maximum Container Capacity *</label>
            <input type="number" id="m-max" class="form-input" value="50" min="1" required>
          </div>
          <div class="form-group">
            <label class="form-label">Low Stock Reorder Threshold *</label>
            <input type="number" id="m-thresh" class="form-input" value="15" min="0" required>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitNewMedicine()">Save Medicine Slot</button>
      </div>
    </div>
  `;
  modal.classList.add("open");
}

function submitNewMedicine() {
  const name = document.getElementById("m-name")?.value.trim();
  const angle = parseInt(document.getElementById("m-angle")?.value, 10);
  const unit = document.getElementById("m-unit")?.value;
  const empty_cm = parseFloat(document.getElementById("m-empty")?.value);
  const full_cm = parseFloat(document.getElementById("m-full")?.value);
  const max_cap = parseInt(document.getElementById("m-max")?.value, 10);
  const thresh = parseInt(document.getElementById("m-thresh")?.value, 10);

  if (!name || isNaN(angle) || isNaN(empty_cm) || isNaN(full_cm) || isNaN(max_cap) || isNaN(thresh)) {
    showToast("Please fill in all required fields.", "warning");
    return;
  }

  if (empty_cm <= full_cm) {
    showToast("Empty container distance must exceed full stack distance.", "warning");
    return;
  }

  // Create new medicine slot
  const newMed = {
    id: `med-${Date.now()}`,
    name,
    storage_angle: angle,
    unit,
    empty_distance_cm: empty_cm,
    full_distance_cm: full_cm,
    unit_height_cm: parseFloat(((empty_cm - full_cm) / max_cap).toFixed(3)),
    max_capacity: max_cap,
    min_threshold: thresh,
    current_stock: Math.round(max_cap * 0.7),
    last_distance_cm: full_cm + (empty_cm - full_cm) * 0.3,
    last_reading_at: new Date().toISOString(),
    status: "Normal",
  };

  state.pharmacyMedicines.push(newMed);
  localStorage.setItem("PHARMACY_MEDICINES", JSON.stringify(state.pharmacyMedicines));

  closeModal();
  showToast(`Registered "${name}" at servo angle ${angle}°.`, "success");
  fetchLiveTelemetryFromSupabase();
  renderApp();
}

function openEditMedicineModal(medId) {
  const med = state.pharmacyMedicines.find((m) => m.id === medId);
  if (!med) return;

  const modal = document.getElementById("modal-container");
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">Edit Medicine & Geometry</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Medicine Full Name</label>
          <input type="text" id="edit-name" class="form-input" value="${escapeHtml(med.name)}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Storage Angle (°)</label>
            <input type="number" id="edit-angle" class="form-input" value="${med.storage_angle}">
          </div>
          <div class="form-group">
            <label class="form-label">Reorder Threshold</label>
            <input type="number" id="edit-thresh" class="form-input" value="${med.min_threshold}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Empty Distance (cm)</label>
            <input type="number" id="edit-empty" class="form-input" value="${med.empty_distance_cm}" step="0.5">
          </div>
          <div class="form-group">
            <label class="form-label">Full Distance (cm)</label>
            <input type="number" id="edit-full" class="form-input" value="${med.full_distance_cm}" step="0.5">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitEditMedicine('${med.id}')">Save Changes</button>
      </div>
    </div>
  `;
  modal.classList.add("open");
}

function submitEditMedicine(medId) {
  const med = state.pharmacyMedicines.find((m) => m.id === medId);
  if (!med) return;

  const name = document.getElementById("edit-name")?.value.trim();
  const angle = parseInt(document.getElementById("edit-angle")?.value, 10);
  const thresh = parseInt(document.getElementById("edit-thresh")?.value, 10);
  const empty_cm = parseFloat(document.getElementById("edit-empty")?.value);
  const full_cm = parseFloat(document.getElementById("edit-full")?.value);

  if (!name || isNaN(angle) || isNaN(thresh) || isNaN(empty_cm) || isNaN(full_cm)) {
    showToast("Please fill in all fields.", "warning");
    return;
  }

  med.name = name;
  med.storage_angle = angle;
  med.min_threshold = thresh;
  med.empty_distance_cm = empty_cm;
  med.full_distance_cm = full_cm;
  med.unit_height_cm = parseFloat(((empty_cm - full_cm) / med.max_capacity).toFixed(3));

  localStorage.setItem("PHARMACY_MEDICINES", JSON.stringify(state.pharmacyMedicines));
  closeModal();
  showToast("Medicine geometry updated.", "success");
  fetchLiveTelemetryFromSupabase();
  renderApp();
}

function deleteMedicineSlot(medId) {
  if (!confirm("Are you sure you want to remove this medicine storage slot?")) return;
  state.pharmacyMedicines = state.pharmacyMedicines.filter((m) => m.id !== medId);
  localStorage.setItem("PHARMACY_MEDICINES", JSON.stringify(state.pharmacyMedicines));
  showToast("Medicine slot removed.", "info");
  renderApp();
}

function openInviteDistributorModal() {
  const modal = document.getElementById("modal-container");
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">+ Invite Wholesale Distributor</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Distributor Firm Name *</label>
          <input type="text" id="dist-name" class="form-input" placeholder="e.g. MedSupply Wholesale Ltd.">
        </div>
        <div class="form-group">
          <label class="form-label">Distributor Email Address *</label>
          <input type="email" id="dist-email" class="form-input" placeholder="orders@medsupply.com">
        </div>
        <div class="form-group">
          <label class="form-label">Regional Hub / City</label>
          <input type="text" id="dist-city" class="form-input" placeholder="Central Depot">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitDistributorInvite()">Send Invitation</button>
      </div>
    </div>
  `;
  modal.classList.add("open");
}

function submitDistributorInvite() {
  const name = document.getElementById("dist-name")?.value.trim();
  const email = document.getElementById("dist-email")?.value.trim();
  const city = document.getElementById("dist-city")?.value.trim();

  if (!name || !email) {
    showToast("Please provide distributor name and email.", "warning");
    return;
  }

  state.pharmacyDistributors.push({
    id: `dist-${Date.now()}`,
    name,
    email,
    city: city || "Depot",
    status: "pending",
  });

  closeModal();
  showToast(`Invitation sent to ${email}.`, "success");
  renderApp();
}

function revokeDistributorAccess(distId) {
  if (!confirm("Revoke this distributor's inventory viewing channel?")) return;
  state.pharmacyDistributors = state.pharmacyDistributors.filter((d) => d.id !== distId);
  showToast("Distributor access revoked.", "info");
  renderApp();
}

function closeModal() {
  const modal = document.getElementById("modal-container");
  if (modal) modal.classList.remove("open");
}

// ============================================================================
// 13. Toast Notifications & Initialization
// ============================================================================

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Bootstrap on DOM Load
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => {
    renderApp();
    initRealtimeSync();
  });
} else {
  renderApp();
  initRealtimeSync();
}
