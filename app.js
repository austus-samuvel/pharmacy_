/**
 * Pharmacy Cold-Storage Stock Monitoring Platform - Application Logic
 * Pure Vanilla JavaScript - Zero Build Tools - Instant Execution
 */

// ==========================================================================
// 1. Initial Mock Database & LocalStorage Persistence
// ==========================================================================

const INITIAL_DATA = {
  currentRole: 'pharmacy', // 'pharmacy' | 'distributor' | 'admin' | 'landing'
  activeTab: {
    pharmacy: 'dashboard',
    distributor: 'dashboard',
    admin: 'overview'
  },
  deviceOnline: true,
  simulateUncertainReading: false,
  
  pharmacyProfile: {
    id: 'pharma-1',
    name: 'City Care Pharmacy (Shelf A)',
    license: 'PHARM-8821-NY',
    city: 'Downtown Medical District, NY',
    channelToken: 'CCH-992-SECURE',
    channelStatus: 'Active',
    privacy: 'Public Directory Listed',
        lastUpdate: 'Just now',
    deviceId: 'esp32-demo-001'
  },

  device: {
    id: 'esp32-demo-001',
    assignedPharmacy: 'City Care Pharmacy',
    status: 'online',
    ip: '192.168.1.145',
    mac: 'EC:FA:BC:44:91:0A',
    firmware: 'v3.0.0 (ESP32 Servo Sonar Ingestion)',
    wifiSsid: 'PharmaColdNet_5G',
    wifiRssi: '-62 dBm (Excellent)',
    ultrasonicSensor: 'HC-SR04 + Servo (Trig: GPIO5, Echo: GPIO18, Servo: GPIO13)',
        lastSeen: '10 seconds ago',
    mode: 'Simulated IoT Node (Hardware Ready)'
  },

  medicines: [
    {
      id: 'med-1',
      name: 'Insulin Glargine 100 U/mL',
      unit: 'vials',
      compartment: 'Rack A - Slot 1 (180°)',
      quantity: 44,
      threshold: 15,
      status: 'Normal',
      lastMeasurement: 'Just now',
      distance: 12.2,
      confidence: 98,
      calibration: { empty: 45.0, full: 8.0, angle: 180 }
    },
    {
      id: 'med-2',
      name: 'Amoxicillin Suspension (250mg)',
      unit: 'bottles',
      compartment: 'Rack A - Slot 2 (147°)',
      quantity: 28,
      threshold: 15,
      status: 'Normal',
      lastMeasurement: 'Just now',
      distance: 19.2,
      confidence: 96,
      calibration: { empty: 45.0, full: 8.0, angle: 147 }
    },
    {
      id: 'med-3',
      name: 'COVID-19 mRNA Vaccine (Pfizer)',
      unit: 'vials',
      compartment: 'Ultra-Cold Shelf 1 (131°)',
      quantity: 21,
      threshold: 10,
      status: 'Normal',
      lastMeasurement: 'Just now',
      distance: 29.5,
      confidence: 95,
      calibration: { empty: 45.0, full: 8.0, angle: 131 }
    },
    {
      id: 'med-4',
      name: 'Oxytocin Injection 10 IU/mL',
      unit: 'ampoules',
      compartment: 'Rack B - Slot 1 (121°)',
      quantity: 10,
      threshold: 15,
      status: 'Low',
      lastMeasurement: 'Just now',
      distance: 61.2,
      confidence: 92,
      calibration: { empty: 85.0, full: 15.0, angle: 121 }
    }
  ],

  distributors: [
    {
      id: 'dist-1',
      name: 'MetroMed Wholesale Distribution',
      license: 'WHL-2024-91',
      contact: 'Marcus Vance (Logistics Director)',
      phone: '+1 (555) 234-8901',
      email: 'orders@metromed-supply.com',
      city: 'Regional Logistics Hub',
      status: 'Active'
    }
  ],

  directoryPharmacies: [
    {
      id: 'pharma-1',
      name: 'City Care Pharmacy (Shelf A)',
      license: 'PHARM-8821-NY',
      city: 'Downtown Medical District, NY',
      availability: 'Available for Subscriptions',
      status: 'Active',
      hours: '24/7 Cold Chain Ready'
    }
  ],

  subscriptions: [
    {
      id: 'sub-1',
      distributorId: 'dist-1',
      pharmacyId: 'pharma-1',
      status: 'approved',
      requestDate: '2026-10-27',
      notes: 'Urgent cold-chain restock monitoring agreement.'
    }
  ],

  alerts: [
    {
      id: 'alt-1',
      pharmacyId: 'pharma-1',
      title: 'Critical Low Stock: Tetanus Toxoid Vaccine',
      desc: 'Estimated stock at 5 ampoules (Low threshold: 15 ampoules). Reorder recommended.',
      severity: 'danger',
      timestamp: '14-Oct-2026 15:45',
      unread: true,
      category: 'stock'
    },
    {
      id: 'alt-2',
      pharmacyId: 'pharma-1',
      title: 'Low Stock Warning: Polio Oral Vaccine (bOPV)',
      desc: 'Estimated stock at 12 vials (Low threshold: 20 vials).',
      severity: 'warning',
      timestamp: '14-Oct-2026 14:30',
      unread: true,
      category: 'stock'
    },
        {
      id: 'alt-4',
      pharmacyId: 'pharma-1',
      title: 'Ultrasonic Distance Sensor Calibrated',
      desc: 'Echo velocity verified against ambient chamber temperature.',
      severity: 'info',
      timestamp: '14-Oct-2026 09:15',
      unread: false,
      category: 'device'
    }
  ],

  
  stockHistory: [
    { day: 'Wed', count: 185 },
    { day: 'Thu', count: 178 },
    { day: 'Fri', count: 192 },
    { day: 'Sat', count: 165 },
    { day: 'Sun', count: 150 },
    { day: 'Mon', count: 168 },
    { day: 'Tue', count: 174 }
  ],

  accounts: [
    { id: 'acc-1', name: 'City Care Pharmacy', role: 'Pharmacy', email: 'stock@citycarepharma.org', regDate: '2026-08-14', status: 'Active' },
    { id: 'acc-2', name: 'Apex Health Chemist', role: 'Pharmacy', email: 'admin@apexhealth.com', regDate: '2026-09-02', status: 'Active' },
    { id: 'acc-3', name: 'MetroMed Wholesale', role: 'Distributor', email: 'orders@metromed-supply.com', regDate: '2026-07-19', status: 'Active' },
    { id: 'acc-4', name: 'PharmaLink Regional', role: 'Distributor', email: 'supply@pharmalink-cold.org', regDate: '2026-09-11', status: 'Active' },
    { id: 'acc-5', name: 'St. Jude Community Meds', role: 'Pharmacy', email: 'lead@stjude-rx.org', regDate: '2026-10-14', status: 'Pending' }
  ],

  auditLog: [
    { time: '16:15:22', user: 'ESP8266-01', action: 'Telemetry Sync', details: 'Ultrasonic sweep completed on 7 compartments. Echo confidence 96%.' },
    { time: '14:32:10', user: 'City Care Admin', action: 'Subscription Updated', details: 'Approved stock access channel for MetroMed Wholesale.' },
    { time: '12:10:45', user: 'System Watchdog', action: 'Temp Range Check', details: 'Cold storage unit stable at 4.2°C (Bounds: 2.0°C to 8.0°C).' },
    { time: '09:05:00', user: 'Root Admin', action: 'Account Verification', details: 'Approved registration for PharmaLink Regional Supply.' }
  ]
};

// State Manager
let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem('COLDCHAIN_STATE_V2');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }
  return JSON.parse(JSON.stringify(INITIAL_DATA));
}

function saveState() {
  try {
    localStorage.setItem('COLDCHAIN_STATE_V2', JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

function resetAllData() {
  if (confirm('Reset all demo state to default sample data?')) {
    state = JSON.parse(JSON.stringify(INITIAL_DATA));
    saveState();
    showToast('Demo data reset to initial prototype state.', 'info');
    renderApp();
  }
}

// ==========================================================================
// 2. Navigation, Role Switching & Tab Management
// ==========================================================================

function switchRole(role) {
  state.currentRole = role;
  saveState();
  renderApp();
  showToast(`Switched view to ${getRoleLabel(role)}`, 'info');
}

function switchTab(tabId) {
  state.activeTab[state.currentRole] = tabId;
  saveState();
  renderApp();
}

function getRoleLabel(role) {
  switch (role) {
    case 'pharmacy': return 'Pharmacy Staff (City Care Pharmacy)';
    case 'distributor': return 'Medicine Distributor (MetroMed Wholesale)';
    case 'admin': return 'Administrator Portal';
    case 'landing': return 'Public Directory & Landing';
    default: return role;
  }
}

function toggleDeviceOnline() {
  state.deviceOnline = !state.deviceOnline;
  state.device.status = state.deviceOnline ? 'online' : 'offline';
  
  if (!state.deviceOnline) {
    state.alerts.unshift({
      id: 'alt-' + Date.now(),
      pharmacyId: 'pharma-1',
      title: 'ESP8266 IoT Node Offline',
      desc: 'Gateway lost heartbeat connection with cold-storage chamber sensors.',
      severity: 'danger',
      timestamp: 'Just now',
      unread: true,
      category: 'device'
    });
    showToast('Simulated IoT Device is now OFFLINE', 'danger');
  } else {
    showToast('Simulated IoT Device is ONLINE', 'success');
  }
  
  saveState();
  renderApp();
}

// ==========================================================================
// 3. Main Render Router
// ==========================================================================

function renderApp() {
  const container = document.getElementById('app-root');
  if (!container) return;

  const currentRole = state.currentRole;
  
  // Render App Structure
  container.innerHTML = `
    <!-- Global Header -->
    <header class="app-header">
      <div class="header-inner">
        <div class="brand-wrapper" onclick="switchRole('landing')">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <div class="brand-title">
              ColdChain IoT
              <span class="brand-tag">Prototype</span>
            </div>
            <div style="font-size:0.7rem; color:var(--text-muted);">Cloud Pharmacy Cold-Storage Platform</div>
          </div>
        </div>

        <!-- Role Switcher Pills -->
        <div class="role-switcher-container">
          <button class="role-btn ${currentRole === 'pharmacy' ? 'active' : ''}" onclick="switchRole('pharmacy')">
            🏥 Pharmacy Portal
          </button>
          <button class="role-btn role-distributor ${currentRole === 'distributor' ? 'active' : ''}" onclick="switchRole('distributor')">
            🚚 Distributor Portal
          </button>
          <button class="role-btn role-admin ${currentRole === 'admin' ? 'active' : ''}" onclick="switchRole('admin')">
            🛡️ Admin Portal
          </button>
          <button class="role-btn ${currentRole === 'landing' ? 'active' : ''}" onclick="switchRole('landing')">
            🌐 Landing & Directory
          </button>
        </div>

        <!-- Device Status & Global Controls -->
        <div class="header-actions">
          <div class="iot-status-badge ${state.deviceOnline ? '' : 'offline'}" onclick="toggleDeviceOnline()" title="Click to toggle Simulated Online/Offline state">
            <span class="pulse-dot"></span>
            <span>ESP8266: ${state.deviceOnline ? 'Online (Demo)' : 'Offline'}</span>
          </div>

          <button class="btn btn-outline btn-sm" onclick="resetAllData()" title="Reset mock data to factory state">
            🔄 Reset Data
          </button>
        </div>
      </div>
    </header>

    <!-- Main Workspace Container -->
    <div class="app-container">
      ${currentRole === 'landing' ? renderLandingPage() : renderPortalLayout()}
    </div>

    <!-- Modal Backdrop Container -->
    <div id="modal-container" class="modal-backdrop"></div>

    <!-- Toast Notifications Container -->
    <div id="toast-container" class="toast-container"></div>
  `;

  // Draw any charts after DOM nodes are injected
  requestAnimationFrame(() => {
    initCharts();
  });
}

function renderPortalLayout() {
  const role = state.currentRole;
  const activeTab = state.activeTab[role] || 'dashboard';

  let navItems = [];
  if (role === 'pharmacy') {
    const unreadAlerts = state.alerts.filter(a => a.unread).length;
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'inventory', label: 'Medicine Inventory', icon: '💊' },
      { id: 'scanning', label: 'Ultrasonic Scanning', icon: '📡' },
            { id: 'subscriptions', label: 'Distributor Access', icon: '🤝' },
      { id: 'alerts', label: 'Alerts & Warnings', icon: '🔔', badge: unreadAlerts || null },
      { id: 'channel', label: 'Channel Settings', icon: '⚙️' },
      { id: 'device', label: 'IoT Device & Sensors', icon: '📟' }
    ];
  } else if (role === 'distributor') {
    navItems = [
      { id: 'dashboard', label: 'Distributor Overview', icon: '📊' },
      { id: 'directory', label: 'Pharmacy Directory', icon: '🏥' },
      { id: 'subscriptions', label: 'Subscription Requests', icon: '🔗' },
      { id: 'stock', label: 'Pharmacy Stock Details', icon: '📦' },
      { id: 'alerts', label: 'Subscribed Alerts', icon: '🔔' },
      { id: 'profile', label: 'Distributor Profile', icon: '🏢' }
    ];
  } else if (role === 'admin') {
    const pendingCount = state.accounts.filter(a => a.status === 'Pending').length;
    navItems = [
      { id: 'overview', label: 'Platform Overview', icon: '📊' },
      { id: 'accounts', label: 'Account Management', icon: '👥', badge: pendingCount || null },
      { id: 'devices', label: 'IoT Device Fleet', icon: '📡' },
      { id: 'activity', label: 'System Audit Log', icon: '📜' }
    ];
  }

  return `
    <aside class="app-sidebar">
      <div class="sidebar-section-title">${getRoleSectionTitle(role)}</div>
      <ul class="nav-list">
        ${navItems.map(item => `
          <li>
            <a class="nav-link ${activeTab === item.id ? 'active' : ''}" onclick="switchTab('${item.id}')">
              <span class="nav-item-left">
                <span>${item.icon}</span>
                <span>${item.label}</span>
              </span>
              ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
            </a>
          </li>
        `).join('')}
      </ul>

      <div class="sidebar-footer">
        <div class="sidebar-user-card">
          <div class="user-avatar">${getAvatarInitials(role)}</div>
          <div class="user-info">
            <div class="user-name">${getCurrentUserName(role)}</div>
            <div class="user-role">${getRoleBadgeLabel(role)}</div>
          </div>
        </div>
      </div>
    </aside>

    <main class="app-main">
      <div class="demo-banner">
        <div class="demo-banner-content">
          <span>⚠️ <strong>Interactive Prototype:</strong> All readings, ultrasonic scans, and IoT communications are client-side simulated demonstrations.</span>
        </div>
        <button class="btn btn-outline btn-sm" onclick="switchRole('landing')">Directory View</button>
      </div>

      ${renderActiveTabContent(role, activeTab)}
    </main>
  `;
}

function getRoleSectionTitle(role) {
  if (role === 'pharmacy') return 'Pharmacy Portal Navigation';
  if (role === 'distributor') return 'Wholesale Distributor Portal';
  if (role === 'admin') return 'Administration Console';
  return 'Navigation';
}

function getAvatarInitials(role) {
  if (role === 'pharmacy') return 'CC';
  if (role === 'distributor') return 'MM';
  if (role === 'admin') return 'SA';
  return 'U';
}

function getCurrentUserName(role) {
  if (role === 'pharmacy') return state.pharmacyProfile.name;
  if (role === 'distributor') return state.distributors[0].name;
  if (role === 'admin') return 'System Administrator';
  return 'Guest Visitor';
}

function getRoleBadgeLabel(role) {
  if (role === 'pharmacy') return 'Pharmacy Staff • Unit 01';
  if (role === 'distributor') return 'Medicine Wholesaler';
  if (role === 'admin') return 'Superuser Role';
  return 'Visitor';
}

// ==========================================================================
// 4. Content Renderers by Role and Tab
// ==========================================================================

function renderActiveTabContent(role, tab) {
  if (role === 'pharmacy') {
    switch (tab) {
      case 'dashboard': return renderPharmacyDashboard();
      case 'inventory': return renderPharmacyInventory();
      case 'scanning': return renderStockScanning();
            case 'subscriptions': return renderPharmacySubscriptions();
      case 'alerts': return renderPharmacyAlerts();
      case 'channel': return renderPharmacyChannel();
      case 'device': return renderDeviceSettings();
      default: return renderPharmacyDashboard();
    }
  } else if (role === 'distributor') {
    switch (tab) {
      case 'dashboard': return renderDistributorDashboard();
      case 'directory': return renderDistributorDirectory();
      case 'subscriptions': return renderDistributorSubscriptions();
      case 'stock': return renderDistributorStock();
      case 'alerts': return renderDistributorAlerts();
      case 'profile': return renderDistributorProfile();
      default: return renderDistributorDashboard();
    }
  } else if (role === 'admin') {
    switch (tab) {
      case 'overview': return renderAdminOverview();
      case 'accounts': return renderAdminAccounts();
      case 'devices': return renderAdminDevices();
      case 'activity': return renderAdminActivity();
      default: return renderAdminOverview();
    }
  }
  return `<div>Tab not found</div>`;
}

// ==========================================================================
// 5. Pharmacy Portal Views
// ==========================================================================

function renderPharmacyDashboard() {
  const totalMeds = state.medicines.length;
  const totalUnits = state.medicines.reduce((sum, m) => sum + m.quantity, 0);
  const lowStockCount = state.medicines.filter(m => m.quantity <= m.threshold).length;
  const sub = state.subscriptions.find(s => s.distributorId === 'dist-1');
  const distApproved = sub && sub.status === 'approved';
  const lastScan = state.latestTelemetry;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${state.pharmacyProfile.name}</h1>
        <p class="page-desc">Cold-Storage Shelf A Monitoring System • Hardware Node: <code>${state.device.id}</code></p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" onclick="fetchSupabaseTelemetry(true)">
          🔄 Refresh Real-Time Data
        </button>
        <button class="btn btn-primary" onclick="openAddMedicineModal()">
          + Add Medicine
        </button>
      </div>
    </div>

    <!-- Active Hardware Node Callout -->
    <div class="hardware-callout" style="display:flex; justify-content:space-between; align-items:center; background:#f0fdf4; border:1px solid #bbf7d0; padding:0.85rem 1.25rem; border-radius:8px; margin-bottom:1.5rem;">
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <span style="font-size:1.6rem;">📟</span>
        <div>
          <div style="font-weight:700; color:#166534; font-size:1rem;">
            ${state.pharmacyProfile.name} — Shelf A Ultrasonic Monitor
          </div>
          <div style="font-size:0.8125rem; color:#15803d; margin-top:2px;">
            Hardware ID: <code>${state.device.id}</code> • HC-SR04 Transceiver + SG90 Servo • Auto-Scan Every 60s
          </div>
        </div>
      </div>
      <div style="text-align:right;">
        <span class="badge badge-success" style="font-size:0.8rem;">🟢 Live Ingestion Active</span>
        <div style="font-size:0.75rem; color:#166534; margin-top:3px;">
          Last Ingestion: <strong>${lastScan ? formatTime(lastScan.timestamp) : state.pharmacyProfile.lastUpdate}</strong>
        </div>
      </div>
    </div>

    <!-- Metrics Cards (No Temp) -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Registered Medicines</span>
          <div class="metric-icon-box" style="background:#e0f2fe; color:#0369a1;">💊</div>
        </div>
        <div class="metric-value">${totalMeds}</div>
        <div class="metric-sub">Calibrated to fixed servo angles</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Calculated Stock Units</span>
          <div class="metric-icon-box" style="background:#d1fae5; color:#065f46;">📦</div>
        </div>
        <div class="metric-value">${totalUnits}</div>
        <div class="metric-sub positive">Live ultrasonic depth conversion</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Low-Stock Items</span>
          <div class="metric-icon-box" style="background:#fee2e2; color:#991b1b;">⚠️</div>
        </div>
        <div class="metric-value" style="color:var(--danger);">${lowStockCount}</div>
        <div class="metric-sub danger">At or below configured threshold</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Distributor Access</span>
          <div class="metric-icon-box" style="background:#fef3c7; color:#92400e;">🤝</div>
        </div>
        <div class="metric-value" style="font-size:1.15rem;">
          <span class="badge ${distApproved ? 'badge-success' : 'badge-warning'}">
            ${distApproved ? 'Approved (Active)' : 'Pending Approval'}
          </span>
        </div>
        <div class="metric-sub">MetroMed Wholesale Distribution</div>
      </div>
    </div>

    <!-- Real-Time Ultrasonic Echo Telemetry Section -->
    <div class="card" style="margin-bottom:1.5rem;">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
        <div class="card-title">
          <span>📡 Real-Time Ultrasonic Echo Telemetry (ESP32 Servo 0°–180°)</span>
        </div>
        <div style="font-size:0.8125rem; color:var(--text-muted);">
          Latest Scan: <strong>#${lastScan ? lastScan.sequence : 'Live'}</strong> • Duration: <strong>${lastScan ? (lastScan.duration_ms / 1000).toFixed(2) + 's' : '2.78s'}</strong>
        </div>
      </div>
      <div class="card-body">
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
          ${renderAngleTelemetryCards()}
        </div>
      </div>
    </div>

    <!-- Weekly Stock History Canvas Chart -->
    <div class="card" style="margin-bottom:1.5rem;">
      <div class="card-header">
        <div class="card-title">
          <span>📊 Weekly Total Stock History</span>
        </div>
        <span class="badge badge-info">7-Day Aggregation</span>
      </div>
      <div class="card-body">
        <div class="chart-container">
          <canvas id="stockChart" class="mini-chart"></canvas>
        </div>
        <div class="chart-legend">
          <div class="legend-item"><span class="legend-color" style="background:#0d9488;"></span> Estimated Inventory Volume</div>
        </div>
      </div>
    </div>

    <!-- Quick Status & Alert Preview -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>🚨 Recent Cold-Storage Alerts</span>
        </div>
        <button class="btn btn-outline btn-sm" onclick="switchTab('alerts')">View All Alerts</button>
      </div>
      <div class="card-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Alert Details</th>
              <th>Category</th>
              <th>Timestamp</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.alerts.slice(0, 3).map(a => `
              <tr>
                <td>
                  <span class="badge badge-${a.severity}">
                    ${a.severity.toUpperCase()}
                  </span>
                </td>
                <td>
                  <strong>${a.title}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${a.desc}</div>
                </td>
                <td>${a.category}</td>
                <td>${a.timestamp}</td>
                <td>
                  <button class="btn btn-outline btn-sm" onclick="markAlertRead('${a.id}')">
                    ${a.unread ? 'Mark Read' : 'Acknowledged'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}


function renderAngleTelemetryCards() {
  const angleMap = [
    { angle: 180, medId: 'med-1', name: 'Insulin Glargine', max: 50, empty: 45.0, full: 8.0 },
    { angle: 147, medId: 'med-2', name: 'Amoxicillin Suspension', max: 40, empty: 45.0, full: 8.0 },
    { angle: 131, medId: 'med-3', name: 'COVID-19 mRNA Vaccine', max: 50, empty: 45.0, full: 8.0 },
    { angle: 121, medId: 'med-4', name: 'Oxytocin Injection', max: 30, empty: 85.0, full: 15.0 }
  ];

  return angleMap.map(slot => {
    const med = state.medicines.find(m => m.id === slot.medId) || {};
    const dist = med.distance !== undefined ? med.distance : 20.0;
    const qty = med.quantity !== undefined ? med.quantity : 30;
    const isLow = qty <= (med.threshold || 15);
    const fillPct = Math.round((qty / (slot.max || 50)) * 100);

    return `
      <div style="background:var(--bg-subtle); border:1px solid var(--border); border-radius:var(--radius); padding:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <span class="servo-angle-pill">📐 ${slot.angle}°</span>
          <span class="badge ${isLow ? 'badge-danger' : 'badge-success'}">${isLow ? 'Low Stock' : 'Normal'}</span>
        </div>
        <strong style="font-size:0.875rem; display:block; margin-bottom:0.25rem;">${slot.name}</strong>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.5rem;">
          Echo: <strong>${dist.toFixed(1)} cm</strong> • Tray: ${slot.empty}cm
        </div>
        <div class="progress-bar-container" style="height:6px; margin-bottom:0.35rem;">
          <div class="progress-bar-fill" style="width:${Math.min(100, fillPct)}%; background:${isLow ? 'var(--danger)' : 'var(--primary)'};"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.75rem;">
          <span>Stock: <strong>${qty} ${med.unit || 'units'}</strong></span>
          <span style="font-weight:600;">${fillPct}%</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderPharmacyInventory() {
  const searchTerm = (document.getElementById('inventory-search')?.value || '').toLowerCase();
  const filterStatus = document.getElementById('inventory-filter')?.value || 'all';

  let filtered = state.medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm) || m.compartment.toLowerCase().includes(searchTerm);
    if (!matchesSearch) return false;
    if (filterStatus === 'low') return m.quantity <= m.threshold;
    if (filterStatus === 'normal') return m.quantity > m.threshold && m.confidence >= 80;
    if (filterStatus === 'uncertain') return m.confidence < 80 || m.status === 'Uncertain';
    return true;
  });

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Medicine Cold-Storage Inventory</h1>
        <p class="page-desc">Real-time ultrasonic distance sensor estimates calibrated by medicine chamber height</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" onclick="switchTab('scanning')">
          📡 Run On-Demand Ultrasonic Scan
        </button>
        <button class="btn btn-primary" onclick="openAddMedicineModal()">
          + Add Medicine
        </button>
      </div>
    </div>

    <div class="info-callout">
      <div style="font-size:1.1rem;">💡</div>
      <div>
        <strong>Ultrasonic Estimation Methodology:</strong> HC-SR04 sonar pulses measure the air column height between the shelf sensor and the top of the medicine container stack. Calibrated formulas convert distance into estimated stock units.
      </div>
    </div>

    <!-- Table Toolbar -->
    <div class="table-toolbar">
      <div class="table-search-group">
        <input type="text" id="inventory-search" class="input-search" placeholder="Search medicine or compartment..." value="${searchTerm}" oninput="renderPharmacyInventoryOnly()">
        <select id="inventory-filter" class="filter-select" onchange="renderPharmacyInventoryOnly()">
          <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>All Stock Statuses</option>
          <option value="low" ${filterStatus === 'low' ? 'selected' : ''}>Low Stock Items</option>
          <option value="normal" ${filterStatus === 'normal' ? 'selected' : ''}>Normal Stock</option>
          <option value="uncertain" ${filterStatus === 'uncertain' ? 'selected' : ''}>Uncertain / Low Confidence</option>
        </select>
      </div>
      <div style="font-size:0.8125rem; color:var(--text-muted);">
        Showing <strong>${filtered.length}</strong> of ${state.medicines.length} medicines
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="table-responsive" id="inventory-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Unit</th>
            <th>Compartment</th>
            <th>Estimated Qty</th>
            <th>Low Threshold</th>
            <th>Stock Status</th>
            <th>Echo Distance</th>
            <th>Confidence</th>
            <th>Last Read</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length === 0 ? `
            <tr>
              <td colspan="10">
                <div class="empty-state">
                  <div class="empty-state-title">No medicines match filter criteria</div>
                  <div class="empty-state-desc">Try clearing search filters or add a new medicine to cold storage.</div>
                  <button class="btn btn-primary btn-sm" onclick="openAddMedicineModal()">+ Add New Medicine</button>
                </div>
              </td>
            </tr>
          ` : filtered.map(m => {
            const isLow = m.quantity <= m.threshold;
            const isUncertain = m.confidence < 80 || m.status === 'Uncertain';
            return `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td><span class="badge badge-neutral">${m.unit}</span></td>
                <td><code>${m.compartment}</code></td>
                <td>
                  <strong style="font-size:1rem; color:${isLow ? 'var(--danger)' : 'var(--text-main)'};">
                    ${m.quantity}
                  </strong>
                </td>
                <td>${m.threshold}</td>
                <td>
                  ${isUncertain ? '<span class="badge badge-warning">Uncertain</span>' : 
                    isLow ? '<span class="badge badge-danger">Low Stock</span>' : 
                    '<span class="badge badge-success">Optimal</span>'}
                </td>
                <td>${m.distance ? m.distance.toFixed(1) + ' cm' : 'N/A'}</td>
                <td>
                  <span style="font-weight:600; color:${m.confidence >= 90 ? 'var(--success-text)' : 'var(--warning-text)'};">
                    ${m.confidence}%
                  </span>
                </td>
                <td style="font-size:0.75rem; color:var(--text-muted);">${m.lastMeasurement}</td>
                <td style="text-align:right;">
                  <button class="btn btn-outline btn-sm" onclick="openEditMedicineModal('${m.id}')" title="Edit Medicine">✏️</button>
                  <button class="btn btn-danger-outline btn-sm" onclick="deleteMedicine('${m.id}')" title="Remove Medicine">🗑️</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderPharmacyInventoryOnly() {
  const main = document.querySelector('.app-main');
  if (main && state.activeTab.pharmacy === 'inventory') {
    main.innerHTML = `
      <div class="demo-banner">
        <span>⚠️ <strong>Interactive Prototype:</strong> All readings, ultrasonic scans, and IoT communications are client-side simulated demonstrations.</span>
        <button class="btn btn-outline btn-sm" onclick="switchRole('landing')">Directory View</button>
      </div>
      ${renderPharmacyInventory()}
    `;
  }
}

// ==========================================================================
// 6. Stock Scanning (Ultrasonic On-Demand Trigger)
// ==========================================================================

function renderStockScanning() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">On-Demand Ultrasonic Stock Scanning</h1>
        <p class="page-desc">Simulated hardware interrogation over ESP8266 Wi-Fi link</p>
      </div>
      <div class="page-actions">
        <label style="display:flex; align-items:center; gap:0.4rem; font-size:0.8125rem; cursor:pointer;">
          <input type="checkbox" id="chk-uncertain" ${state.simulateUncertainReading ? 'checked' : ''} onchange="toggleUncertainSim(this.checked)">
          <span>Simulate Sensor Obstacle / Uncertain Reading</span>
        </label>
        <button id="btn-start-scan" class="btn btn-primary" onclick="runSimulatedScan()">
          📡 Request Stock Scan Now
        </button>
      </div>
    </div>

    <!-- Hardware Interrogation Panel -->
    <div class="card" style="margin-bottom:1.5rem;">
      <div class="card-header">
        <div class="card-title">
          <span>📟 ESP8266 NodeMCU & HC-SR04 Transceiver Status</span>
        </div>
        <span class="badge ${state.deviceOnline ? 'badge-success' : 'badge-danger'}">
          ${state.deviceOnline ? 'Hardware Link Active' : 'Device Offline'}
        </span>
      </div>
      <div class="card-body">
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1rem;">
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Assigned Unit:</div>
            <strong>${state.device.assignedPharmacy}</strong>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted);">IP & Gateway:</div>
            <code>${state.device.ip}</code>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Wi-Fi RSSI:</div>
            <span>${state.device.wifiRssi}</span>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Sensor Array:</div>
            <span>${state.device.ultrasonicSensor}</span>
          </div>
        </div>

        <div style="font-size:0.8125rem; font-weight:600; margin-bottom:0.35rem;" id="scan-status-text">
          Status: Ready for scan request
        </div>
        
        <div class="progress-bar-container">
          <div id="scan-progress-bar" class="progress-bar-fill"></div>
        </div>

        <div id="scan-terminal" class="scan-console">
          <div class="log-line"><span class="log-time">[Ready]</span> ESP8266 telemetry daemon standby. Waiting for scan command trigger.</div>
        </div>
      </div>
    </div>

    <!-- Per-Medicine Reading Results Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>📦 Most Recent Ultrasonic Measurements</span>
        </div>
        <span style="font-size:0.75rem; color:var(--text-muted);">Refreshed automatically after scan</span>
      </div>
      <div class="card-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Compartment</th>
              <th>Echo Distance</th>
              <th>Estimated Units</th>
              <th>Confidence</th>
              <th>Reading Validity</th>
            </tr>
          </thead>
          <tbody id="scan-results-tbody">
            ${state.medicines.map(m => `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td><code>${m.compartment}</code></td>
                <td>${m.distance.toFixed(1)} cm</td>
                <td><strong>${m.quantity} ${m.unit}</strong></td>
                <td>
                  <span class="badge ${m.confidence >= 90 ? 'badge-success' : 'badge-warning'}">
                    ${m.confidence}%
                  </span>
                </td>
                <td>
                  <span class="badge ${m.status === 'Uncertain' ? 'badge-danger' : 'badge-success'}">
                    ${m.status === 'Uncertain' ? '⚠️ Flagged Uncertain' : '✅ Verified Valid'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function toggleUncertainSim(val) {
  state.simulateUncertainReading = val;
  saveState();
}

function runSimulatedScan() {
  if (!state.deviceOnline) {
    showToast('Cannot scan: ESP8266 IoT device is currently OFFLINE.', 'danger');
    return;
  }

  const btn = document.getElementById('btn-start-scan');
  const bar = document.getElementById('scan-progress-bar');
  const term = document.getElementById('scan-terminal');
  const statusText = document.getElementById('scan-status-text');

  if (btn) btn.disabled = true;
  if (bar) {
    bar.style.width = '0%';
    bar.classList.add('running');
  }

  const log = (msg, cls = '') => {
    if (term) {
      const now = new Date().toTimeString().split(' ')[0];
      term.innerHTML += `<div class="log-line ${cls}"><span class="log-time">[${now}]</span> ${msg}</div>`;
      term.scrollTop = term.scrollHeight;
    }
  };

  log('Triggering UDP discovery packet to ESP8266 node at ' + state.device.ip + '...', '');
  if (statusText) statusText.innerText = 'Status: Interrogating ESP8266 Controller...';

  setTimeout(() => {
    if (bar) bar.style.width = '25%';
    log('ACK received from ESP8266 (12ms round-trip). Waking HC-SR04 sonar module.', 'log-ok');

    setTimeout(() => {
      if (bar) bar.style.width = '55%';
      log('Emitting 40kHz ultrasonic burst across Compartments 1-7...', '');

      setTimeout(() => {
        if (bar) bar.style.width = '85%';
        log('Reading echo time-of-flight. Applying speed of sound compensation (331.3 + 0.606 * 3.8°C = 333.6 m/s)...', '');

        setTimeout(() => {
          if (bar) {
            bar.style.width = '100%';
            bar.classList.remove('running');
          }

          // Update medicine measurements
          const timestamp = new Date().toLocaleString();
          state.medicines.forEach((m, idx) => {
            if (state.simulateUncertainReading && idx === 1) {
              // Simulate uncertain measurement on item 2
              m.confidence = 45;
              m.status = 'Uncertain';
              log(`⚠️ Compartment ${m.compartment}: Echo interference detected! Confidence dropped to 45%. Retaining prior quantity: ${m.quantity} ${m.unit}.`, 'log-warn');
            } else {
              m.confidence = Math.floor(92 + Math.random() * 8);
              m.status = m.quantity <= m.threshold ? 'Low' : 'Normal';
              m.lastMeasurement = timestamp;
            }
          });

          log('Scan completed successfully. Stock estimates updated in local state.', 'log-ok');
          if (statusText) statusText.innerText = 'Status: Scan complete (100%)';
          if (btn) btn.disabled = false;

          state.auditLog.unshift({
            time: new Date().toTimeString().split(' ')[0],
            user: 'ESP8266 Transceiver',
            action: 'Ultrasonic Scan',
            details: `Interrogated ${state.medicines.length} medicine racks. Readings updated.`
          });

          saveState();
          showToast('Ultrasonic scan completed successfully!', 'success');
          
          // Re-render scanning table
          setTimeout(() => {
            if (state.activeTab.pharmacy === 'scanning') {
              renderApp();
            }
          }, 600);

        }, 700);
      }, 700);
    }, 700);
  }, 600);
}

// ==========================================================================
// 7. Cold-Storage Monitoring
// ==========================================================================

function renderColdStorageMonitoring() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Cold-Storage Chamber Monitoring</h1>
        <p class="page-desc">Chamber temperature regulation & DS18B20 digital thermal sensor logs</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" onclick="openTempConfigModal()">
          ⚙️ Configure Safe Temp Range
        </button>
        <button class="btn btn-teal" onclick="simulateTempSpike()">
          ⚡ Simulate Door Open (+3.5°C)
        </button>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Live Chamber Temp</span>
          <div class="metric-icon-box" style="background:#ccfbf1; color:#0f766e;">🌡️</div>
        </div>
        <div class="metric-value" style="color:${state.pharmacyProfile.currentTemp > state.pharmacyProfile.tempMax ? 'var(--danger)' : 'var(--teal)'};">
          ${state.pharmacyProfile.currentTemp}°C
        </div>
        <div class="metric-sub ${state.pharmacyProfile.currentTemp <= state.pharmacyProfile.tempMax ? 'positive' : 'danger'}">
          ${state.pharmacyProfile.currentTemp <= state.pharmacyProfile.tempMax ? 'Within Safe Limits' : '⚠️ Cold Chain Breach Warning'}
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Configured Min Temp</span>
          <div class="metric-icon-box" style="background:#e0f2fe; color:#0369a1;">❄️</div>
        </div>
        <div class="metric-value">${state.pharmacyProfile.tempMin}°C</div>
        <div class="metric-sub">Prevents freezing damage</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Configured Max Temp</span>
          <div class="metric-icon-box" style="background:#fee2e2; color:#991b1b;">🔥</div>
        </div>
        <div class="metric-value">${state.pharmacyProfile.tempMax}°C</div>
        <div class="metric-sub">Prevents thermal degradation</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Sensor Calibration</span>
          <div class="metric-icon-box" style="background:#f1f5f9; color:#475569;">🔬</div>
        </div>
        <div class="metric-value" style="font-size:1.25rem;">±0.15°C</div>
        <div class="metric-sub positive">NIST Traceable Certified</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:1.5rem;">
      <div class="card-header">
        <div class="card-title">
          <span>📈 24-Hour Chamber Temperature Curve</span>
        </div>
        <span class="badge badge-success">Safe Band: ${state.pharmacyProfile.tempMin}°C to ${state.pharmacyProfile.tempMax}°C</span>
      </div>
      <div class="card-body">
        <div class="chart-container" style="height:280px;">
          <canvas id="tempChartLarge" class="mini-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Reading Log Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>📋 Hourly Thermal Telemetry Records</span>
        </div>
        <button class="btn btn-outline btn-sm" onclick="exportDataCsv('temperature')">Export CSV</button>
      </div>
      <div class="card-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Recorded Temp</th>
              <th>Compliance Status</th>
              <th>Relative Humidity</th>
              <th>Sensor Node</th>
            </tr>
          </thead>
          <tbody>
            ${state.temperatureHistory.slice(-6).reverse().map(h => {
              const safe = h.temp >= state.pharmacyProfile.tempMin && h.temp <= state.pharmacyProfile.tempMax;
              return `
                <tr>
                  <td>Today, ${h.time}</td>
                  <td><strong>${h.temp}°C</strong></td>
                  <td>
                    <span class="badge ${safe ? 'badge-success' : 'badge-danger'}">
                      ${safe ? 'Compliant' : 'Breach Detected'}
                    </span>
                  </td>
                  <td>48.2% RH</td>
                  <td>DS18B20 (ESP8266-01)</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function simulateTempSpike() {
  state.pharmacyProfile.currentTemp = parseFloat((state.pharmacyProfile.currentTemp + 3.5).toFixed(1));
  state.temperatureHistory.push({
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    temp: state.pharmacyProfile.currentTemp
  });

  if (state.pharmacyProfile.currentTemp > state.pharmacyProfile.tempMax) {
    state.alerts.unshift({
      id: 'alt-' + Date.now(),
      pharmacyId: 'pharma-1',
      title: '🚨 CRITICAL: Cold Storage Temperature Breach',
      desc: `Chamber temperature rose to ${state.pharmacyProfile.currentTemp}°C, exceeding safe maximum threshold of ${state.pharmacyProfile.tempMax}°C.`,
      severity: 'danger',
      timestamp: 'Just now',
      unread: true,
      category: 'temp'
    });
    showToast(`Thermal alert! Chamber temperature spiked to ${state.pharmacyProfile.currentTemp}°C`, 'danger');
  } else {
    showToast(`Chamber temperature updated to ${state.pharmacyProfile.currentTemp}°C`, 'warning');
  }

  saveState();
  renderApp();
}

// ==========================================================================
// 8. Distributor Subscriptions (Pharmacy Portal View)
// ==========================================================================

function renderPharmacySubscriptions() {
  const sub = state.subscriptions.find(s => s.distributorId === 'dist-1') || {
    id: 'sub-1', distributorId: 'dist-1', pharmacyId: 'pharma-1', status: 'approved', requestDate: '2026-10-27', notes: 'Urgent cold-chain restock monitoring agreement.'
  };
  const isApproved = sub.status === 'approved';
  const dist = state.distributors[0];

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Wholesale Distributor Access Control</h1>
        <p class="page-desc">Manage viewing permissions for <strong>${state.pharmacyProfile.name}</strong> (Node: <code>${state.device.id}</code>)</p>
      </div>
    </div>

    <div class="info-callout" style="margin-bottom:1.5rem;">
      <div style="font-size:1.1rem;">🔒</div>
      <div>
        <strong>Single Distributor Channel:</strong> In compliance with pharmacy stock regulations, stock levels and live echo telemetry are only visible to the distributor when access is explicitly approved below.
      </div>
    </div>

    <!-- Distributor Card -->
    <div class="card" style="max-width:700px;">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
        <div class="card-title">
          <span>🏢 ${dist.name}</span>
        </div>
        <span class="badge ${isApproved ? 'badge-success' : 'badge-warning'}">
          ${isApproved ? '✅ Access Approved' : '⏳ Pending Approval'}
        </span>
      </div>
      <div class="card-body">
        <table class="data-table" style="margin-bottom:1.5rem;">
          <tr>
            <td><strong>Wholesale License:</strong></td>
            <td><code>${dist.license}</code></td>
          </tr>
          <tr>
            <td><strong>Primary Contact:</strong></td>
            <td>${dist.contact} (${dist.email})</td>
          </tr>
          <tr>
            <td><strong>Regional Depot:</strong></td>
            <td>${dist.city}</td>
          </tr>
          <tr>
            <td><strong>Request Date:</strong></td>
            <td>${sub.requestDate}</td>
          </tr>
          <tr>
            <td><strong>Purpose:</strong></td>
            <td>${sub.notes}</td>
          </tr>
          <tr>
            <td><strong>Current Access Status:</strong></td>
            <td>
              <strong>${isApproved ? 'Granted — Distributor sees live pharmacy dashboard' : 'Locked — Distributor sees access pending screen'}</strong>
            </td>
          </tr>
        </table>

        <div style="display:flex; gap:1rem;">
          ${isApproved ? `
            <button class="btn btn-danger-outline" onclick="toggleDistributorApproval('dist-1')">
              Revoke Distributor Access
            </button>
          ` : `
            <button class="btn btn-primary" onclick="toggleDistributorApproval('dist-1')">
              ✓ Approve Dashboard Access for Distributor
            </button>
          `}
          <button class="btn btn-outline" onclick="switchRole('distributor')">
            Switch to Distributor View
          </button>
        </div>
      </div>
    </div>
  `;
}

function toggleDistributorApproval(distId) {
  let sub = state.subscriptions.find(s => s.distributorId === distId);
  if (!sub) {
    sub = { id: 'sub-1', distributorId: distId, pharmacyId: 'pharma-1', status: 'approved', requestDate: '2026-10-27', notes: 'Restock agreement.' };
    state.subscriptions.push(sub);
  } else {
    sub.status = sub.status === 'approved' ? 'pending' : 'approved';
  }
  saveState();
  showToast(sub.status === 'approved' ? 'Distributor access granted. Live dashboard unlocked.' : 'Distributor access revoked.', sub.status === 'approved' ? 'success' : 'warning');
  renderApp();
}


function renderPharmacyAlerts() {
  const filterCat = document.getElementById('alert-filter-cat')?.value || 'all';
  
  let list = state.alerts.filter(a => {
    if (filterCat !== 'all' && a.category !== filterCat) return false;
    return true;
  });

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Alerts & System Notifications</h1>
        <p class="page-desc">Cold-chain exceptions, low-stock thresholds, and sensor telemetry flags</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" onclick="markAllAlertsRead()">
          ✓ Mark All as Read
        </button>
      </div>
    </div>

    <div class="table-toolbar">
      <div class="table-search-group">
        <select id="alert-filter-cat" class="filter-select" onchange="renderApp()">
          <option value="all">All Categories</option>
          <option value="stock">Stock Thresholds</option>
          <option value="temp">Cold Chain Temperatures</option>
          <option value="device">IoT & Ultrasonic Transceiver</option>
        </select>
      </div>
      <div style="font-size:0.8125rem; color:var(--text-muted);">
        Total Notifications: ${list.length}
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Severity</th>
              <th>Subject & Notification Details</th>
              <th>Category</th>
              <th>Logged Time</th>
              <th style="text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(a => `
              <tr style="${a.unread ? 'background:#f0f9ff;' : ''}">
                <td>
                  ${a.unread ? '<span class="badge badge-info">New</span>' : '<span style="color:var(--text-subtle); font-size:0.75rem;">Read</span>'}
                </td>
                <td>
                  <span class="badge badge-${a.severity}">
                    ${a.severity.toUpperCase()}
                  </span>
                </td>
                <td>
                  <strong>${a.title}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">${a.desc}</div>
                </td>
                <td><span class="badge badge-neutral">${a.category}</span></td>
                <td style="font-size:0.75rem;">${a.timestamp}</td>
                <td style="text-align:right;">
                  <button class="btn btn-outline btn-sm" onclick="markAlertRead('${a.id}')">
                    ${a.unread ? 'Mark Read' : 'Dismiss'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function markAlertRead(alertId) {
  const alert = state.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.unread = false;
    saveState();
    renderApp();
  }
}

function markAllAlertsRead() {
  state.alerts.forEach(a => a.unread = false);
  saveState();
  showToast('All notifications marked as read', 'info');
  renderApp();
}

// ==========================================================================
// 10. Pharmacy Channel Settings
// ==========================================================================

function renderPharmacyChannel() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pharmacy Channel & Privacy Settings</h1>
        <p class="page-desc">Public directory presence and cold-chain broadcasting tokens</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="showToast('Channel settings saved successfully.', 'success')">
          Save Channel Profile
        </button>
      </div>
    </div>

    <div class="card" style="max-width:750px;">
      <div class="card-header">
        <div class="card-title"><span>🏥 Pharmacy Profile & Credentials</span></div>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Pharmacy Legal Entity Name</label>
            <input type="text" class="form-input" value="${state.pharmacyProfile.name}">
          </div>
          <div class="form-group">
            <label class="form-label">State Pharmacy Board License ID</label>
            <input type="text" class="form-input" value="${state.pharmacyProfile.license}" readonly style="background:var(--bg-muted);">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Chamber Location / Street Address</label>
          <input type="text" class="form-input" value="${state.pharmacyProfile.city}">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Directory Discovery Status</label>
            <select class="form-select">
              <option value="public" selected>Listed in Public Pharmacy Directory</option>
              <option value="private">Unlisted (Private Token Invites Only)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Shareable Channel Identifier</label>
            <input type="text" class="form-input" value="${state.pharmacyProfile.channelToken}" readonly style="background:var(--bg-muted);">
          </div>
        </div>

        <div class="info-callout" style="margin-top:1rem;">
          <div>ℹ️</div>
          <div>Distributors searching the public directory will see your pharmacy name and location, but cannot inspect stock levels without approval.</div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 11. Device & Ultrasonic Hardware Settings
// ==========================================================================

function renderDeviceSettings() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">ESP8266 IoT Hardware Configuration</h1>
        <p class="page-desc">NodeMCU microcontroller, HC-SR04 ultrasonic sonar, and DS18B20 calibration</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" onclick="toggleDeviceOnline()">
          ${state.deviceOnline ? 'Simulate Disconnect' : 'Simulate Reconnect'}
        </button>
        <button class="btn btn-primary" onclick="recalibrateSensors()">
          🔄 Run Transducer Zero-Calibration
        </button>
      </div>
    </div>

    <div class="charts-row">
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span>📟 NodeMCU ESP8266 Specifications</span></div>
          <span class="badge ${state.deviceOnline ? 'badge-success' : 'badge-danger'}">
            ${state.deviceOnline ? 'Connected' : 'Offline'}
          </span>
        </div>
        <div class="card-body">
          <table class="data-table">
            <tr>
              <td><strong>Device Identifier</strong></td>
              <td><code>${state.device.id}</code></td>
            </tr>
            <tr>
              <td><strong>Firmware Build</strong></td>
              <td>${state.device.firmware}</td>
            </tr>
            <tr>
              <td><strong>Hardware MAC Address</strong></td>
              <td><code>${state.device.mac}</code></td>
            </tr>
            <tr>
              <td><strong>Local IP Address</strong></td>
              <td><code>${state.device.ip}</code></td>
            </tr>
            <tr>
              <td><strong>Wi-Fi Network (SSID)</strong></td>
              <td>${state.device.wifiSsid} (${state.device.wifiRssi})</td>
            </tr>
            <tr>
              <td><strong>Operating Mode</strong></td>
              <td><span class="badge badge-info">${state.device.mode}</span></td>
            </tr>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><span>📡 HC-SR04 Ultrasonic Calibration</span></div>
        </div>
        <div class="card-body">
          <p style="font-size:0.8125rem; color:var(--text-muted); margin-bottom:1rem;">
            Ultrasonic sound pulses take \(t\) microseconds to return from the top of the medicine containers.
          </p>

          <div class="form-group">
            <label class="form-label">Sound Velocity Temperature Compensation Factor</label>
            <input type="text" class="form-input" value="331.3 m/s + (0.606 * Temp) = 333.6 m/s" readonly style="background:var(--bg-muted);">
            <div class="form-hint">Automatically adjusted using live DS18B20 temperature sensor data.</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Default Empty Tray Depth</label>
              <input type="text" class="form-input" value="45.0 cm">
            </div>
            <div class="form-group">
              <label class="form-label">Full Stack Distance</label>
              <input type="text" class="form-input" value="8.0 cm">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Hardware Pinout Mapping</label>
            <div style="font-size:0.75rem; background:var(--bg-muted); padding:0.6rem; border-radius:var(--radius); font-family:var(--font-mono);">
              Trigger: Pin D5 (GPIO14) | Echo: Pin D6 (GPIO12) | Temp: Pin D2 (GPIO4)
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function recalibrateSensors() {
  showToast('Transducer zero-calibration initiated...', 'info');
  setTimeout(() => {
    showToast('Ultrasonic zero-distance calibrated against 3.8°C thermal baseline.', 'success');
  }, 1000);
}

// ==========================================================================
// 12. Distributor Portal Views
// ==========================================================================

function renderDistributorDashboard() {
  const sub = state.subscriptions.find(s => s.distributorId === 'dist-1');
  const isApproved = sub && sub.status === 'approved';
  const dist = state.distributors[0];

  if (!isApproved) {
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Wholesale Distributor Portal</h1>
          <p class="page-desc">${dist.name} • License: ${dist.license}</p>
        </div>
      </div>

      <div class="card" style="text-align:center; padding:3.5rem 1.5rem; max-width:650px; margin:2rem auto;">
        <div style="font-size:3.5rem; margin-bottom:1rem;">🔒</div>
        <h2 style="font-size:1.35rem; margin-bottom:0.5rem;">Access Awaiting Pharmacy Approval</h2>
        <p style="color:var(--text-muted); font-size:0.9rem; line-height:1.5; margin-bottom:1.5rem;">
          Your distributor account (<strong>${dist.name}</strong>) has not yet been approved by <strong>${state.pharmacyProfile.name}</strong> (Node: <code>${state.device.id}</code>).
          <br><br>
          Once approved in the Pharmacy Portal, the real-time stock dashboard and telemetry stream will be displayed here automatically.
        </p>
        <button class="btn btn-primary" onclick="switchRole('pharmacy'); switchTab('subscriptions');">
          Switch to Pharmacy Portal to Approve Access
        </button>
      </div>
    `;
  }

  // APPROVED: Display Pharmacy Dashboard with distributor banner!
  return `
    <div class="hardware-callout" style="display:flex; justify-content:space-between; align-items:center; background:#e0f2fe; border:1px solid #7dd3fc; padding:0.85rem 1.25rem; border-radius:8px; margin-bottom:1.5rem;">
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <span style="font-size:1.6rem;">🚚</span>
        <div>
          <div style="font-weight:700; color:#0369a1; font-size:1rem;">
            ${dist.name} — Authorized Read-Only Live Stock Feed
          </div>
          <div style="font-size:0.8125rem; color:#0284c7; margin-top:2px;">
            Viewing live inventory for <strong>${state.pharmacyProfile.name}</strong> • Node: <code>${state.device.id}</code>
          </div>
        </div>
      </div>
      <span class="badge badge-success" style="font-size:0.8rem;">Access Active</span>
    </div>

    ${renderPharmacyDashboard()}
  `;
}

function renderDistributorStock() {
  return renderDistributorDashboard();
}


function renderDistributorAlerts() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Subscribed Pharmacy Alerts</h1>
        <p class="page-desc">Critical threshold breaches from your approved pharmacy channels</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Pharmacy</th>
              <th>Severity</th>
              <th>Alert Title</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            ${state.alerts.map(a => `
              <tr>
                <td><strong>${state.pharmacyProfile.name}</strong></td>
                <td><span class="badge badge-${a.severity}">${a.severity.toUpperCase()}</span></td>
                <td>
                  <strong>${a.title}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${a.desc}</div>
                </td>
                <td style="font-size:0.75rem;">${a.timestamp}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderDistributorProfile() {
  const d = state.distributors[0];
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Wholesale Distributor Profile</h1>
        <p class="page-desc">Organization details and state cold-chain distribution license</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="showToast('Profile updated.', 'success')">Save Changes</button>
      </div>
    </div>

    <div class="card" style="max-width:700px;">
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">Company Name</label>
          <input type="text" class="form-input" value="${d.name}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Wholesale License ID</label>
            <input type="text" class="form-input" value="${d.license}" readonly style="background:var(--bg-muted);">
          </div>
          <div class="form-group">
            <label class="form-label">Primary Logistics Officer</label>
            <input type="text" class="form-input" value="${d.contact}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="text" class="form-input" value="${d.email}">
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input type="text" class="form-input" value="${d.phone}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Distribution Hub Location</label>
          <input type="text" class="form-input" value="${d.city}">
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 13. Administrator Portal Views
// ==========================================================================

function renderAdminOverview() {
  const pendingAccs = state.accounts.filter(a => a.status === 'Pending').length;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Platform Administrator Overview</h1>
        <p class="page-desc">Central oversight of pharmacies, distributors, and IoT sensor fleets</p>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Registered Pharmacies</span>
          <div class="metric-icon-box" style="background:#e0f2fe; color:#0369a1;">🏥</div>
        </div>
        <div class="metric-value">3</div>
        <div class="metric-sub">Active in network</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Distributor Partners</span>
          <div class="metric-icon-box" style="background:#d1fae5; color:#065f46;">🚚</div>
        </div>
        <div class="metric-value">2</div>
        <div class="metric-sub">Verified wholesalers</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Pending Approvals</span>
          <div class="metric-icon-box" style="background:#fef3c7; color:#92400e;">👥</div>
        </div>
        <div class="metric-value" style="color:${pendingAccs > 0 ? 'var(--warning-text)' : 'inherit'};">
          ${pendingAccs}
        </div>
        <div class="metric-sub warning">Requires admin review</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Active IoT Nodes</span>
          <div class="metric-icon-box" style="background:#ccfbf1; color:#0f766e;">📡</div>
        </div>
        <div class="metric-value">${state.deviceOnline ? '3' : '2'}</div>
        <div class="metric-sub">${state.deviceOnline ? 'All Nodes Healthy' : '1 Node Offline'}</div>
      </div>
    </div>

    <div class="charts-row">
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span>👥 Recent Account Registrations</span></div>
          <button class="btn btn-outline btn-sm" onclick="switchTab('accounts')">Manage Accounts</button>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.accounts.slice(0, 4).map(acc => `
                <tr>
                  <td><strong>${acc.name}</strong></td>
                  <td><span class="badge badge-neutral">${acc.role}</span></td>
                  <td>
                    <span class="badge ${acc.status === 'Active' ? 'badge-success' : 'badge-warning'}">
                      ${acc.status}
                    </span>
                  </td>
                  <td>
                    ${acc.status === 'Pending' ? `
                      <button class="btn btn-teal btn-sm" onclick="approveAccount('${acc.id}')">Approve</button>
                    ` : `<span style="font-size:0.75rem; color:var(--text-muted);">Verified</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><span>📜 Recent Platform Activity</span></div>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Event</th>
              </tr>
            </thead>
            <tbody>
              ${state.auditLog.slice(0, 4).map(log => `
                <tr>
                  <td style="font-size:0.75rem;">${log.time}</td>
                  <td><strong>${log.user}</strong></td>
                  <td>
                    <div>${log.action}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);">${log.details}</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderAdminAccounts() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Account Management</h1>
        <p class="page-desc">Review and verify pharmacy and distributor credentials</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Registration Date</th>
              <th>Status</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.accounts.map(acc => `
              <tr>
                <td><strong>${acc.name}</strong></td>
                <td><span class="badge badge-info">${acc.role}</span></td>
                <td>${acc.email}</td>
                <td>${acc.regDate}</td>
                <td>
                  <span class="badge ${acc.status === 'Active' ? 'badge-success' : acc.status === 'Pending' ? 'badge-warning' : 'badge-danger'}">
                    ${acc.status}
                  </span>
                </td>
                <td style="text-align:right;">
                  ${acc.status === 'Pending' ? `
                    <button class="btn btn-teal btn-sm" onclick="approveAccount('${acc.id}')">Approve</button>
                    <button class="btn btn-danger-outline btn-sm" onclick="rejectAccount('${acc.id}')">Reject</button>
                  ` : acc.status === 'Active' ? `
                    <button class="btn btn-danger-outline btn-sm" onclick="suspendAccount('${acc.id}')">Suspend</button>
                  ` : `
                    <button class="btn btn-outline btn-sm" onclick="approveAccount('${acc.id}')">Reactivate</button>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function approveAccount(accId) {
  const acc = state.accounts.find(a => a.id === accId);
  if (acc) {
    acc.status = 'Active';
    saveState();
    showToast(`Account "${acc.name}" approved and activated.`, 'success');
    renderApp();
  }
}

function suspendAccount(accId) {
  const acc = state.accounts.find(a => a.id === accId);
  if (acc) {
    acc.status = 'Suspended';
    saveState();
    showToast(`Account "${acc.name}" suspended.`, 'warning');
    renderApp();
  }
}

function rejectAccount(accId) {
  state.accounts = state.accounts.filter(a => a.id !== accId);
  saveState();
  showToast('Account registration rejected.', 'info');
  renderApp();
}

function renderAdminDevices() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">IoT Device Fleet Monitoring</h1>
        <p class="page-desc">ESP8266 NodeMCU & Ultrasonic hardware network telemetry</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Device Identifier</th>
              <th>Assigned Facility</th>
              <th>Status</th>
              <th>Chamber Temp</th>
              <th>Firmware</th>
              <th>Wi-Fi Signal</th>
              <th style="text-align:right;">Diagnostic Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>${state.device.id}</code></td>
              <td><strong>${state.device.assignedPharmacy}</strong></td>
              <td>
                <span class="badge ${state.deviceOnline ? 'badge-success' : 'badge-danger'}">
                  ${state.deviceOnline ? 'Online' : 'Offline'}
                </span>
              </td>
              <td>${state.pharmacyProfile.currentTemp}°C</td>
              <td>${state.device.firmware}</td>
              <td>${state.device.wifiRssi}</td>
              <td style="text-align:right;">
                <button class="btn btn-outline btn-sm" onclick="pingDevice('${state.device.id}')">Ping Node</button>
              </td>
            </tr>
            <tr>
              <td><code>ESP8266-NODEMCU-02</code></td>
              <td><strong>Apex Health Chemist</strong></td>
              <td><span class="badge badge-success">Online</span></td>
              <td>4.5°C</td>
              <td>v2.4.1 (ESP-IDF)</td>
              <td>-68 dBm</td>
              <td style="text-align:right;">
                <button class="btn btn-outline btn-sm" onclick="pingDevice('ESP8266-NODEMCU-02')">Ping Node</button>
              </td>
            </tr>
            <tr>
              <td><code>ESP8266-NODEMCU-03</code></td>
              <td><strong>Metro Well Pharmacy</strong></td>
              <td><span class="badge badge-success">Online</span></td>
              <td>5.2°C</td>
              <td>v2.3.9 (ESP-IDF)</td>
              <td>-74 dBm</td>
              <td style="text-align:right;">
                <button class="btn btn-outline btn-sm" onclick="pingDevice('ESP8266-NODEMCU-03')">Ping Node</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function pingDevice(deviceId) {
  showToast(`Pinging ${deviceId}... ACK received (14ms latency).`, 'success');
}

function renderAdminActivity() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Platform Audit & Activity Log</h1>
        <p class="page-desc">Simulated security events, IoT heartbeats, and administrative operations</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline btn-sm" onclick="exportDataCsv('audit')">Export Audit Log</button>
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor / Device</th>
              <th>Action Category</th>
              <th>Detailed Description</th>
            </tr>
          </thead>
          <tbody>
            ${state.auditLog.map(l => `
              <tr>
                <td style="font-size:0.75rem; white-space:nowrap;">Today, ${l.time}</td>
                <td><strong>${l.user}</strong></td>
                <td><span class="badge badge-neutral">${l.action}</span></td>
                <td>${l.details}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================================================
// 14. Landing Page View
// ==========================================================================

function renderLandingPage() {
  return `
    <div style="max-width:1200px; margin:0 auto; padding:1rem 0;">
      <!-- Hero -->
      <div class="landing-hero">
        <h1>Cloud Pharmacy Cold-Storage<br>Stock Monitoring Platform</h1>
        <p>
          A minimal, accessible prototype connecting pharmacy refrigerators to wholesale distributors via ESP8266 IoT microcontrollers, HC-SR04 ultrasonic sonar estimation, and continuous temperature monitoring.
        </p>

        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="switchRole('pharmacy')" style="padding:0.7rem 1.4rem; font-size:0.95rem;">
            🏥 Enter as Pharmacy Staff
          </button>
          <button class="btn btn-teal" onclick="switchRole('distributor')" style="padding:0.7rem 1.4rem; font-size:0.95rem;">
            🚚 Enter as Medicine Distributor
          </button>
          <button class="btn btn-outline" onclick="switchRole('admin')" style="padding:0.7rem 1.4rem; font-size:0.95rem;">
            🛡️ Enter as Administrator
          </button>
        </div>
      </div>

      <!-- Portal Entry Cards -->
      <div class="portal-cards-grid">
        <div class="portal-entry-card" onclick="switchRole('pharmacy')">
          <div class="portal-entry-icon" style="background:#e0f2fe; color:#0369a1;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h3 style="font-size:1.15rem; margin-bottom:0.4rem;">Pharmacy Cold-Storage Portal</h3>
          <p style="font-size:0.8125rem; color:var(--text-muted); margin-bottom:1rem; flex:1;">
            Real-time dashboard, ultrasonic inventory estimation, chamber temperature tracking (2°C - 8°C), and distributor subscription authorization.
          </p>
          <span style="font-size:0.8125rem; font-weight:600; color:var(--primary);">Explore Pharmacy Portal →</span>
        </div>

        <div class="portal-entry-card" onclick="switchRole('distributor')">
          <div class="portal-entry-icon" style="background:#f3e8ff; color:#7c3aed;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <h3 style="font-size:1.15rem; margin-bottom:0.4rem;">Wholesale Distributor Portal</h3>
          <p style="font-size:0.8125rem; color:var(--text-muted); margin-bottom:1rem; flex:1;">
            Browse public directory, request inventory access, and monitor cold stock levels of approved pharmacies to proactively dispatch restocks.
          </p>
          <span style="font-size:0.8125rem; font-weight:600; color:#7c3aed;">Explore Distributor Portal →</span>
        </div>

        <div class="portal-entry-card" onclick="switchRole('admin')">
          <div class="portal-entry-icon" style="background:#ccfbf1; color:#0f766e;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3 style="font-size:1.15rem; margin-bottom:0.4rem;">Platform Administration</h3>
          <p style="font-size:0.8125rem; color:var(--text-muted); margin-bottom:1rem; flex:1;">
            Review facility registrations, verify licenses, supervise ESP8266 hardware nodes, and inspect platform audit logs.
          </p>
          <span style="font-size:0.8125rem; font-weight:600; color:#0d9488;">Explore Admin Portal →</span>
        </div>
      </div>

      <!-- Public Pharmacy Directory (Zero-leakage proof) -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span>🏥 Public Pharmacy Network Registry</span></div>
          <span class="badge badge-info">Zero Stock Leakage Public View</span>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Pharmacy</th>
                <th>District / Location</th>
                <th>Channel Availability</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.directoryPharmacies.map(p => `
                <tr>
                  <td>
                    <strong>${p.name}</strong>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${p.license}</div>
                  </td>
                  <td>${p.city}</td>
                  <td><span class="badge badge-neutral">${p.availability}</span></td>
                  <td><span class="badge badge-success">Online & Audited</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 15. Canvas Charting Engine (Pure 2D Canvas - Zero Dependencies)
// ==========================================================================

function initCharts() {
      drawStockChart('stockChart', 220);
  drawDistributorChart('distributorStockChart', 220);
}

function drawTempChart(canvasId, height) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = height;
  const pad = { top: 20, right: 30, bottom: 30, left: 40 };

  const history = state.temperatureHistory;
  if (!history || history.length === 0) return;

  const minT = 0;
  const maxT = 10;

  const getY = (val) => h - pad.bottom - ((val - minT) / (maxT - minT)) * (h - pad.top - pad.bottom);
  const getX = (idx) => pad.left + (idx / (history.length - 1)) * (w - pad.left - pad.right);

  // Background Safe Zone (2°C to 8°C)
  const safeTop = getY(state.pharmacyProfile.tempMax);
  const safeBottom = getY(state.pharmacyProfile.tempMin);

  ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
  ctx.fillRect(pad.left, safeTop, w - pad.left - pad.right, safeBottom - safeTop);

  // Safe boundaries dashed lines
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.moveTo(pad.left, safeTop);
  ctx.lineTo(w - pad.right, safeTop);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(pad.left, safeBottom);
  ctx.lineTo(w - pad.right, safeBottom);
  ctx.stroke();

  ctx.setLineDash([]);

  // Safe boundary labels
  ctx.fillStyle = '#065f46';
  ctx.font = '10px -apple-system, sans-serif';
  ctx.fillText('Max Safe: ' + state.pharmacyProfile.tempMax + '°C', w - pad.right - 80, safeTop - 4);
  ctx.fillText('Min Safe: ' + state.pharmacyProfile.tempMin + '°C', w - pad.right - 80, safeBottom + 12);

  // Grid lines
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  for (let t = 0; t <= 10; t += 2) {
    const y = getY(t);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(t + '°', 15, y + 3);
  }

  // Draw temperature curve
  ctx.beginPath();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2.5;

  history.forEach((pt, i) => {
    const x = getX(i);
    const y = getY(pt.temp);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw data points & X-axis labels
  history.forEach((pt, i) => {
    const x = getX(i);
    const y = getY(pt.temp);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Time label
    ctx.fillStyle = '#64748b';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.fillText(pt.time, x - 12, h - 10);
  });
}

function drawStockChart(canvasId, height) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = height;
  const pad = { top: 20, right: 30, bottom: 30, left: 40 };

  const data = state.stockHistory;
  const maxV = 220;

  const getY = (val) => h - pad.bottom - (val / maxV) * (h - pad.top - pad.bottom);
  const barWidth = (w - pad.left - pad.right) / data.length - 16;

  data.forEach((item, i) => {
    const x = pad.left + i * ((w - pad.left - pad.right) / data.length) + 8;
    const y = getY(item.count);
    const barH = h - pad.bottom - y;

    // Bar fill
    ctx.fillStyle = '#0d9488';
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
    ctx.fill();

    // Value label
    ctx.fillStyle = '#0f172a';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.fillText(item.count, x + (barWidth / 2) - 8, y - 5);

    // Day label
    ctx.fillStyle = '#64748b';
    ctx.fillText(item.day, x + (barWidth / 2) - 10, h - 10);
  });
}

function drawDistributorChart(canvasId, height) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = height;
  const pad = { top: 20, right: 30, bottom: 30, left: 40 };

  const meds = state.medicines.slice(0, 5);
  const maxQ = 70;

  meds.forEach((m, i) => {
    const x = pad.left + i * ((w - pad.left - pad.right) / meds.length) + 6;
    const barWidth = (w - pad.left - pad.right) / meds.length - 12;
    const y = h - pad.bottom - (m.quantity / maxQ) * (h - pad.top - pad.bottom);
    const barH = h - pad.bottom - y;

    ctx.fillStyle = m.quantity <= m.threshold ? '#ef4444' : '#0284c7';
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.fillText(m.quantity, x + (barWidth / 2) - 6, y - 5);

    ctx.fillStyle = '#64748b';
    ctx.fillText(m.name.substring(0, 8) + '..', x, h - 10);
  });
}

// ==========================================================================
// 16. Modals & Dialog Handlers
// ==========================================================================

function openAddMedicineModal() {
  const modal = document.getElementById('modal-container');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">+ Add New Cold-Storage Medicine</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="info-callout" style="margin-bottom:1rem;">
          <div>💡</div>
          <div>
            <strong>Ultrasonic Calibration:</strong> Quantities are estimated based on stack clearance from shelf-mounted HC-SR04 sonar pulses.
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Medicine Full Name *</label>
          <input type="text" id="m-name" class="form-input" placeholder="e.g. Rabies Vaccine Human Diploid">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Counting Unit *</label>
            <select id="m-unit" class="form-select">
              <option value="vials">Vials</option>
              <option value="ampoules">Ampoules</option>
              <option value="bottles">Bottles</option>
              <option value="pre-filled syringes">Pre-filled Syringes</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Storage Compartment *</label>
            <input type="text" id="m-comp" class="form-input" placeholder="e.g. Rack A - Slot 3">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Initial Quantity *</label>
            <input type="number" id="m-qty" class="form-input" value="30">
          </div>
          <div class="form-group">
            <label class="form-label">Low-Stock Alert Threshold *</label>
            <input type="number" id="m-thresh" class="form-input" value="15">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Empty Tray Distance (cm)</label>
            <input type="number" id="m-empty" class="form-input" value="45.0" step="0.5">
          </div>
          <div class="form-group">
            <label class="form-label">Full Stack Distance (cm)</label>
            <input type="number" id="m-full" class="form-input" value="8.0" step="0.5">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveNewMedicine()">Register Medicine</button>
      </div>
    </div>
  `;
  modal.classList.add('open');
}

function saveNewMedicine() {
  const name = document.getElementById('m-name')?.value.trim();
  const unit = document.getElementById('m-unit')?.value;
  const comp = document.getElementById('m-comp')?.value.trim();
  const qty = parseInt(document.getElementById('m-qty')?.value, 10);
  const thresh = parseInt(document.getElementById('m-thresh')?.value, 10);
  const empty = parseFloat(document.getElementById('m-empty')?.value) || 45.0;
  const full = parseFloat(document.getElementById('m-full')?.value) || 8.0;

  if (!name || !comp || isNaN(qty) || isNaN(thresh)) {
    showToast('Please fill in all required fields.', 'warning');
    return;
  }

  const newMed = {
    id: 'med-' + Date.now(),
    name: name,
    unit: unit,
    compartment: comp,
    quantity: qty,
    threshold: thresh,
    status: qty <= thresh ? 'Low' : 'Normal',
    lastMeasurement: new Date().toLocaleString(),
    distance: parseFloat((empty - ((empty - full) * (qty / 50))).toFixed(1)),
    confidence: 96,
    calibration: { empty, full }
  };

  state.medicines.push(newMed);
  saveState();
  closeModal();
  showToast(`Registered "${name}" in cold-storage inventory.`, 'success');
  renderApp();
}

function openEditMedicineModal(medId) {
  const med = state.medicines.find(m => m.id === medId);
  if (!med) return;

  const modal = document.getElementById('modal-container');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">Edit Medicine & Sensor Limits</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Medicine Full Name</label>
          <input type="text" id="edit-name" class="form-input" value="${med.name}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Compartment Slot</label>
            <input type="text" id="edit-comp" class="form-input" value="${med.compartment}">
          </div>
          <div class="form-group">
            <label class="form-label">Quantity</label>
            <input type="number" id="edit-qty" class="form-input" value="${med.quantity}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Low-Stock Alert Level</label>
            <input type="number" id="edit-thresh" class="form-input" value="${med.threshold}">
          </div>
          <div class="form-group">
            <label class="form-label">Unit Type</label>
            <input type="text" class="form-input" value="${med.unit}" readonly style="background:var(--bg-muted);">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveEditedMedicine('${med.id}')">Save Changes</button>
      </div>
    </div>
  `;
  modal.classList.add('open');
}

function saveEditedMedicine(medId) {
  const med = state.medicines.find(m => m.id === medId);
  if (!med) return;

  med.name = document.getElementById('edit-name')?.value.trim() || med.name;
  med.compartment = document.getElementById('edit-comp')?.value.trim() || med.compartment;
  med.quantity = parseInt(document.getElementById('edit-qty')?.value, 10) || med.quantity;
  med.threshold = parseInt(document.getElementById('edit-thresh')?.value, 10) || med.threshold;
  med.status = med.quantity <= med.threshold ? 'Low' : 'Normal';

  saveState();
  closeModal();
  showToast(`Updated "${med.name}".`, 'success');
  renderApp();
}

function deleteMedicine(medId) {
  const med = state.medicines.find(m => m.id === medId);
  if (!med) return;

  if (confirm(`Remove "${med.name}" from cold-storage monitoring?`)) {
    state.medicines = state.medicines.filter(m => m.id !== medId);
    saveState();
    showToast(`Removed "${med.name}".`, 'info');
    renderApp();
  }
}

function openTempConfigModal() {
  const modal = document.getElementById('modal-container');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">Configure Safe Temperature Range</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:0.8125rem; color:var(--text-muted); margin-bottom:1rem;">
          Define acceptable temperature boundaries. Automated alerts trigger when the chamber violates these bounds.
        </p>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Minimum Temperature (°C)</label>
            <input type="number" id="temp-min" class="form-input" value="${state.pharmacyProfile.tempMin}" step="0.5">
          </div>
          <div class="form-group">
            <label class="form-label">Maximum Temperature (°C)</label>
            <input type="number" id="temp-max" class="form-input" value="${state.pharmacyProfile.tempMax}" step="0.5">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-teal" onclick="saveTempConfig()">Apply Limits</button>
      </div>
    </div>
  `;
  modal.classList.add('open');
}

function saveTempConfig() {
  const min = parseFloat(document.getElementById('temp-min')?.value);
  const max = parseFloat(document.getElementById('temp-max')?.value);

  if (isNaN(min) || isNaN(max) || min >= max) {
    showToast('Invalid temperature range: Min must be less than Max.', 'warning');
    return;
  }

  state.pharmacyProfile.tempMin = min;
  state.pharmacyProfile.tempMax = max;
  saveState();
  closeModal();
  showToast(`Chamber limits set to ${min}°C - ${max}°C.`, 'success');
  renderApp();
}

function openRequestAccessModal(pharmaId) {
  const pharma = state.directoryPharmacies.find(p => p.id === pharmaId);
  if (!pharma) return;

  const modal = document.getElementById('modal-container');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">Request Stock Feed Access</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:0.8125rem; color:var(--text-muted); margin-bottom:1rem;">
          Submit an access request to <strong>${pharma.name}</strong> to view live cold-storage medicine quantities.
        </p>
        <div class="form-group">
          <label class="form-label">Reason / Agreement Reference</label>
          <textarea id="sub-reason" class="form-textarea" rows="3" placeholder="e.g. Primary vaccine distributor restock monitoring agreement"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitAccessRequest('${pharma.id}')">Send Access Request</button>
      </div>
    </div>
  `;
  modal.classList.add('open');
}

function submitAccessRequest(pharmaId) {
  const reason = document.getElementById('sub-reason')?.value.trim() || 'Cold-chain restocking agreement';

  state.subscriptions.push({
    id: 'sub-' + Date.now(),
    distributorId: 'dist-1',
    pharmacyId: pharmaId,
    status: 'pending',
    requestDate: new Date().toISOString().split('T')[0],
    notes: reason
  });

  saveState();
  closeModal();
  showToast('Access request submitted. Awaiting pharmacy authorization.', 'info');
  renderApp();
}

function closeModal() {
  const modal = document.getElementById('modal-container');
  if (modal) modal.classList.remove('open');
}

// ==========================================================================
// 17. Toast System & Export Helpers
// ==========================================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'danger' ? '🚨' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

function exportDataCsv(type) {
  let csvContent = "data:text/csv;charset=utf-8,";
  if (type === 'temperature') {
    csvContent += "Time,Temperature_C,Chamber_Status\n";
    state.temperatureHistory.forEach(h => {
      csvContent += `${h.time},${h.temp},Normal\n`;
    });
  } else {
    csvContent += "Time,Actor,Action,Details\n";
    state.auditLog.forEach(l => {
      csvContent += `"${l.time}","${l.user}","${l.action}","${l.details}"\n`;
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `coldchain_${type}_export.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast(`Exported ${type} records as CSV.`, 'success');
}

// Window resize chart re-render
window.addEventListener('resize', () => {
  initCharts();
});


// ==========================================================================
// 18. Supabase Live Telemetry Synchronization
// ==========================================================================

const SUPABASE_URL = "https://bfqzofrxqgdftdfnsrki.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmcXpvZnJ4cWdkZnRkZm5zcmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTI0NjMsImV4cCI6MjEwODY2ODQ2M30.S85ZRPd2sRqBCCV7F6yEkftyuI6_2ppxkJB6bWvrDnU";

let supabaseClient = null;
function getSupabase() {
  if (!supabaseClient && typeof window !== "undefined" && window.supabase && typeof window.supabase.createClient === "function") {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

async function fetchSupabaseTelemetry(manual = false) {
  const sb = getSupabase();
  if (!sb) {
    console.warn("Supabase client not initialized.");
    return;
  }

  try {
    const { data: scans, error } = await sb
      .from("scans")
      .select("id, scan_id, scan_sequence, angles_scanned, valid_readings_count, scan_duration_ms, created_at, distance_readings(angle, distance_cm, is_valid)")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Supabase query error:", error);
      if (manual) showToast("Error connecting to Supabase: " + error.message, "danger");
      return;
    }

    if (!scans || scans.length === 0) {
      if (manual) showToast("No scans found in database.", "warning");
      return;
    }

    const latestScan = scans[0];
    const readings = latestScan.distance_readings || [];
    const scanTime = new Date(latestScan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    state.latestTelemetry = {
      sequence: latestScan.scan_sequence,
      duration_ms: latestScan.scan_duration_ms,
      timestamp: latestScan.created_at,
      readings: readings
    };

    // Angle mapping to medicines
    const angleMap = [
      { angle: 180, medId: 'med-1', empty: 45.0, full: 8.0, max: 50 },
      { angle: 147, medId: 'med-2', empty: 45.0, full: 8.0, max: 40 },
      { angle: 131, medId: 'med-3', empty: 45.0, full: 8.0, max: 50 },
      { angle: 121, medId: 'med-4', empty: 85.0, full: 15.0, max: 30 }
    ];

    let updatedAny = false;
    angleMap.forEach(slot => {
      const reading = readings.find(r => Math.abs(r.angle - slot.angle) <= 3);
      const med = state.medicines.find(m => m.id === slot.medId);
      if (med && reading && reading.is_valid && reading.distance_cm !== null) {
        med.distance = parseFloat(reading.distance_cm.toFixed(1));
        const stackSpan = Math.max(1, slot.empty - slot.full);
        const stackHeight = Math.max(0, slot.empty - med.distance);
        const qty = Math.max(0, Math.min(slot.max, Math.round((stackHeight / stackSpan) * slot.max)));
        med.quantity = qty;
        med.status = qty <= med.threshold ? 'Low' : 'Normal';
        med.lastMeasurement = scanTime;
        med.confidence = 98;
        updatedAny = true;
      }
    });

    state.deviceOnline = true;
    state.device.lastSeen = scanTime + ' (Live ESP32)';
    state.pharmacyProfile.lastUpdate = scanTime;

    saveState();
    renderApp();

    if (manual) {
      showToast(`Synced live scan #${latestScan.scan_sequence} from ESP32!`, 'success');
    }
  } catch (e) {
    console.error("Telemetry sync exception:", e);
    if (manual) showToast("Exception fetching telemetry: " + e.message, "danger");
  }
}

function formatTime(isoStr) {
  if (!isoStr) return "Just now";
  const d = new Date(isoStr);
  return isNaN(d.getTime()) ? "Just now" : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}


function initSupabaseSync() {
  fetchSupabaseTelemetry();
  setInterval(fetchSupabaseTelemetry, 8000);

  const sb = getSupabase();
  if (sb) {
    sb.channel("live-telemetry-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "scans" }, () => {
        fetchSupabaseTelemetry();
        showToast("⚡ New IoT scan received from ESP32!", "info");
      })
      .subscribe();
  }
}


// Initialization with Live Supabase Sync
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    renderApp();
    initSupabaseSync();
  });
} else {
  renderApp();
  initSupabaseSync();
}
