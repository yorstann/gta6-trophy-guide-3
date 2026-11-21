// Leonida Legend 3 — entry point. Loads the trophy data, wires the hash
// router, keeps the header progress live, and renders the current view.
import { createStore } from './store.js';
import { defaultFilters } from './filters.js';
import { renderListView } from './render.js';
import { renderDetailView } from './detail.js';
import { renderRoadmapView, renderMissablesView } from './roadmap.js';
import { exportProgress, readImportFile } from './io.js';

const view = document.getElementById('view');
const progressText = document.getElementById('progress-text');
const progressPct = document.getElementById('progress-pct');
const progressFill = document.getElementById('progress-fill');
const progressBar = document.querySelector('.progress-bar');
const gradeCounts = document.getElementById('grade-counts');

const store = createStore();
const ui = { filters: defaultFilters(), shieldOn: false };

let trophies = [];
try {
  const data = await (await fetch('data/trophies.json')).json();
  trophies = data.trophies ?? data;
} catch (err) {
  view.textContent = 'Could not load the trophy data. Serve app/ over HTTP (node serve.ts) and reload.';
  throw err;
}

// Hash deep-links: #/trophies?shield=on&earn=22&kind=missable&effort=Grind
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  return { path: path || '', params: new URLSearchParams(query) };
}

function applyHashParams(params) {
  if (params.has('shield')) ui.shieldOn = params.get('shield') === 'on';
  if (params.has('kind')) ui.filters.kind = params.get('kind');
  if (params.has('effort')) ui.filters.effort = params.get('effort');
  if (params.has('grade')) ui.filters.grade = params.get('grade');
  if (params.has('q')) ui.filters.query = params.get('q');
  const earn = Number(params.get('earn'));
  if (Number.isInteger(earn) && trophies.some((t) => t.id === earn) && !store.isEarned(earn)) {
    store.setEarned(earn, true);
  }
}

function paintHeader() {
  const total = trophies.length;
  const earned = trophies.filter((t) => store.isEarned(t.id)).length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  progressText.textContent = `${earned} of ${total} earned`;
  progressPct.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
  progressBar.setAttribute('aria-valuenow', String(earned));
  const byGrade = {};
  for (const t of trophies) {
    if (!store.isEarned(t.id)) continue;
    byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  }
  const parts = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${byGrade[g] ?? 0} ${g}`)
    .join(' · ');
  gradeCounts.textContent = `Earned by grade: ${parts}`;
  for (const link of document.querySelectorAll('.main-nav a')) {
    link.removeAttribute('aria-current');
  }
  const current = document.querySelector(`.main-nav a[data-nav="${ui.nav}"]`);
  if (current) current.setAttribute('aria-current', 'page');
}

function ioRow() {
  const row = document.createElement('div');
  row.className = 'io-row';
  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.textContent = 'Export progress (JSON)';
  exportBtn.addEventListener('click', () => exportProgress(store.progress));
  const label = document.createElement('label');
  label.className = 'file-label';
  label.textContent = 'Import progress';
  const file = document.createElement('input');
  file.type = 'file';
  file.accept = 'application/json';
  file.addEventListener('change', async () => {
    if (!file.files[0]) return;
    try {
      const data = await readImportFile(file.files[0]);
      store.replace(data);
      status.textContent = 'Progress imported.';
    } catch {
      status.textContent = 'That file could not be imported — it is not a Leonida Legend progress file.';
    }
    file.value = '';
  });
  label.append(file);
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.textContent = 'Reset progress';
  resetBtn.addEventListener('click', () => {
    if (window.confirm('Clear every earned trophy and counter?')) store.reset();
  });
  const status = document.createElement('span');
  status.className = 'io-status';
  row.append(exportBtn, label, resetBtn, status);
  return row;
}

function render(scrollToTop = true) {
  const { path, params } = parseHash();
  applyHashParams(params);
  const segments = path.split('/').filter(Boolean);
  if (segments[0] === 'roadmap') {
    ui.nav = 'roadmap';
    renderRoadmapView(view, trophies, store);
  } else if (segments[0] === 'missables') {
    ui.nav = 'missables';
    renderMissablesView(view, trophies, store);
  } else if (segments[0] === 'trophy' && segments[1]) {
    ui.nav = 'list';
    const trophy = trophies.find((t) => t.id === Number(segments[1]));
    if (trophy) renderDetailView(view, trophy, trophies, store, ui.shieldOn, () => render(false));
    else view.textContent = 'No trophy with that number.';
  } else {
    ui.nav = 'list';
    renderListView(view, trophies, store, ui, () => render(false));
    view.append(ioRow());
  }
  paintHeader();
  if (scrollToTop) window.scrollTo(0, 0);
}

store.onChange(() => { paintHeader(); });
window.addEventListener('hashchange', render);
render();
