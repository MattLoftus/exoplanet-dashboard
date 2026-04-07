// ═══════════════════════════════════════════════════════════════════════
// Worlds Tab — 3D exoplanet system library
// Grid of system cards → click to enter full 3D orbital view
// ═══════════════════════════════════════════════════════════════════════

import { SystemView, SYSTEMS, generateSystemFromCandidate } from './system-view.js';

let view = null;
let activeSystemId = null;
let detailView = null;

// ── Grid rendering ─────────────────────────────────────────────

const SYSTEM_ORDER = [
  'proxima', 'toi-700', 'trappist-1', 'pegasi-51', 'cancri-55',
  'kepler-16', 'wasp-121', 'kepler-90', 'hr-8799', 'lich',
];

// Which systems our pipeline has scanned
const SCANNED_SYSTEMS = new Set(['toi-700']);

const STAR_TYPE_COLORS = {
  'M': '#ff6644', 'K': '#ffaa44', 'G': '#fff0a0', 'F': '#eef0ff', 'A': '#aaccff',
  'Pulsar': '#8899ff', 'Millisecond': '#8899ff',
};

function getStarColor(starType) {
  for (const [key, color] of Object.entries(STAR_TYPE_COLORS)) {
    if (starType.includes(key)) return color;
  }
  return '#ccc';
}

function renderGrid() {
  const grid = document.getElementById('worlds-grid');
  if (!grid) return;

  grid.innerHTML = SYSTEM_ORDER.map(id => {
    const sys = SYSTEMS[id];
    if (!sys) return '';
    const scanned = SCANNED_SYSTEMS.has(id);
    const starColor = getStarColor(sys.starType || '');
    const nPlanets = sys.nPlanets || sys.planets?.length || sys.pulsarPlanets?.length || 1;

    return `
      <div class="world-card" onclick="worldsAPI.openSystem('${id}')">
        <div class="world-card-star" style="background: radial-gradient(circle, ${starColor}40 0%, transparent 70%)">
          <div class="world-card-star-dot" style="background: ${starColor}; box-shadow: 0 0 20px ${starColor}88, 0 0 40px ${starColor}44"></div>
          ${Array.from({length: Math.min(nPlanets, 8)}, (_, i) => {
            const r = 18 + i * 7;
            return `<div class="world-card-orbit" style="width:${r*2}px;height:${r*2}px"></div>`;
          }).join('')}
        </div>
        ${scanned ? '<div class="world-card-badge">SCANNED</div>' : ''}
        <div class="world-card-name">${sys.name}</div>
        <div class="world-card-meta">${sys.starType}</div>
        <div class="world-card-stats">
          <span>${nPlanets} planet${nPlanets !== 1 ? 's' : ''}</span>
          <span>${sys.distance}</span>
        </div>
        <div class="world-card-notable">${sys.notable || ''}</div>
      </div>
    `;
  }).join('');
}

// ── 3D viewer management ───────────────────────────────────────

function openSystem(systemId) {
  const sys = SYSTEMS[systemId];
  if (!sys) return;

  activeSystemId = systemId;
  document.getElementById('worlds-grid-wrap').style.display = 'none';
  document.getElementById('worlds-viewer-wrap').style.display = 'block';
  document.getElementById('worlds-viewer-title').textContent = sys.name;
  document.getElementById('worlds-viewer-subtitle').textContent = `${sys.starType} — ${sys.distance}`;
  document.getElementById('worlds-viewer-desc').textContent = sys.description || '';

  const container = document.getElementById('worlds-3d-container');
  if (!view) {
    view = new SystemView(container);
  }

  view.cbFocus = (name) => {
    const items = document.querySelectorAll('.legend-item');
    items.forEach(el => el.classList.toggle('active', el.dataset.name === name));
  };

  view.init(systemId);
  renderLegend();
  renderSpeedSlider();
}

function closeSystem() {
  if (view && view.config) view.dispose();
  activeSystemId = null;
  document.getElementById('worlds-viewer-wrap').style.display = 'none';
  document.getElementById('worlds-grid-wrap').style.display = 'block';
}

function renderLegend() {
  const legend = document.getElementById('worlds-legend');
  if (!legend || !view) return;

  const objects = view.getObjects();
  legend.innerHTML = objects.map(o => `
    <div class="legend-item" data-name="${o.name}" onclick="worldsAPI.focusObject('${o.name}')">
      <span class="legend-dot"></span>
      <span>${o.name}</span>
    </div>
  `).join('');
}

function renderSpeedSlider() {
  const slider = document.getElementById('worlds-speed-slider');
  if (slider) {
    slider.value = 50;
    slider.oninput = () => {
      const raw = parseFloat(slider.value);
      const ts = Math.pow(5, (raw - 50) / 50);
      if (view) view.setTimeScale(ts);
      document.getElementById('worlds-speed-label').textContent = ts.toFixed(1) + 'x';
    };
  }
}

// ── Tab lifecycle ──────────────────────────────────────────────

function onTabShow() {
  renderGrid();
  if (activeSystemId && view) {
    // Returning to tab with active view — just resize
    view.resize();
  }
}

function onTabHide() {
  // Dispose the 3D view to free GPU resources when leaving the tab
  if (view && view.config) {
    view.dispose();
  }
  // Don't clear activeSystemId so we can re-enter the same system
}

// ── Detail panel 3D view ──────────────────────────────────────

function initDetailView(candidate) {
  disposeDetailView();
  const container = document.getElementById('detail-3d-container');
  if (!container) return;
  const systemId = generateSystemFromCandidate(candidate);
  detailView = new SystemView(container);
  detailView.init(systemId);
}

function disposeDetailView() {
  if (detailView) {
    detailView.destroy();
    detailView = null;
  }
}

// ── "View World" — open candidate in full Worlds tab ─────────

function viewCandidateWorld(ticId, planetNum) {
  const data = window.DATA;
  if (!data) return;
  const c = data.candidates.find(x => x.tic_id === ticId && x.planet_num === planetNum);
  if (!c) return;

  // Close detail panel if open
  if (typeof window.closeDetail === 'function') window.closeDetail();

  // Generate system and switch to Worlds tab
  const systemId = generateSystemFromCandidate(c);
  window.showTab('worlds');
  openSystem(systemId);
}

// ── Public API (exposed via window for inline script access) ──

window.worldsAPI = {
  onTabShow,
  onTabHide,
  openSystem,
  closeSystem,
  focusObject: (name) => { if (view) view.focusOn(name); },
  initDetailView,
  disposeDetailView,
  viewCandidateWorld,
};
