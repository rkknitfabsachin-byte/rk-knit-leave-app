// ==========================================================================
// RK KNIT LEAVE PORTAL - CLIENT APPLICATION ENGINE
// Connected to Google Apps Script & Sheets Backend
// ==========================================================================

const API_URL = 'https://script.google.com/macros/s/AKfycbxGK1FnOiJJLgx2mO8bzu9tu67QRiWTgsJ9V5BOGaOD1gu3vkyQLTcD0PlJLCapX1nR/exec';
const MODE = 'live'; // 'live' | 'demo'

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// Application State
let D = { operators: [], leaves: [] };
let filter = 'All';
let deptFilter = 'All';
let admin = !!localStorage.pin;
let enteredPin = '';

// Department Color & Initial Map
const DEPT_COLORS = {
  'PRODUCTION': { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE', grad: 'linear-gradient(135deg, #4338CA, #312E81)' },
  'DYEING':     { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE', grad: 'linear-gradient(135deg, #7C3AED, #5B21B6)' },
  'CHECKER':    { bg: '#ECFEFF', text: '#0E7490', border: '#A5F3FC', grad: 'linear-gradient(135deg, #0891B2, #155E75)' },
  'RAISING':    { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', grad: 'linear-gradient(135deg, #D97706, #92400E)' },
  'DISPATCH':   { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', grad: 'linear-gradient(135deg, #2563EB, #1E40AF)' },
  'HR':         { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', grad: 'linear-gradient(135deg, #E11D48, #9F1239)' },
  'ACCOUNT':    { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', grad: 'linear-gradient(135deg, #059669, #065F46)' },
  'SALES':      { bg: '#FDF4FF', text: '#A21CAF', border: '#F5D0FE', grad: 'linear-gradient(135deg, #C026D3, #86198F)' },
  'CRM':        { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD', grad: 'linear-gradient(135deg, #0284C7, #075985)' },
  'SECURITY GUARD': { bg: '#F4F4F5', text: '#3F3F46', border: '#E4E4E7', grad: 'linear-gradient(135deg, #52525B, #27272A)' },
  'DEFAULT':    { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', grad: 'linear-gradient(135deg, #1E293B, #334155)' }
};

function getDeptStyle(dept) {
  const d = (dept || '').trim().toUpperCase();
  return DEPT_COLORS[d] || DEPT_COLORS['DEFAULT'];
}

function getInitials(name) {
  if (!name) return 'RK';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ==========================================================================
// PROCEDURAL WEB AUDIO HAPTICS ENGINE
// High-touch sensory feedback with zero audio downloads
// ==========================================================================
class SoundEngine {
  constructor() {
    this.enabled = localStorage.getItem('rk_sound') !== 'false';
    this.ctx = null;
    this.updateUI();
  }
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('rk_sound', this.enabled);
    this.updateUI();
    if (this.enabled) this.tap();
    return this.enabled;
  }
  updateUI() {
    const onIcon = $('.icon-sound-on');
    const offIcon = $('.icon-sound-off');
    if (onIcon && offIcon) {
      onIcon.style.display = this.enabled ? 'block' : 'none';
      offIcon.style.display = this.enabled ? 'none' : 'block';
    }
  }
  vibrate(pattern = 10) {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch (_) {}
    }
  }
  tap() {
    this.vibrate(8);
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.035);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch (_) {}
  }
  success() {
    this.vibrate([15, 30, 20]);
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.08, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.16);
      });
    } catch (_) {}
  }
  error() {
    this.vibrate([30, 40, 30]);
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [220, 164].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.07, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.14);
      });
    } catch (_) {}
  }
}
const audio = new SoundEngine();
$('#soundBtn').onclick = () => audio.toggle();

// ==========================================================================
// DATE & CALENDAR TIMEZONE-SAFE HELPERS
// ==========================================================================
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_HI = ['Ravivar', 'Somwar', 'Mangalwar', 'Budhwar', 'Guruwar', 'Shukrawar', 'Shaniwar'];

function getTodayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIso(iso) {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return { y: +m[1], m: +m[2], d: +m[3], iso: `${m[1]}-${m[2]}-${m[3]}` };
}

function fmt(iso) {
  const p = parseIso(iso);
  if (!p) return iso || '';
  return `${p.d} ${MON[p.m - 1]}`;
}

function fmtY(iso) {
  const p = parseIso(iso);
  if (!p) return iso || '';
  return `${p.d} ${MON[p.m - 1]} ${p.y}`;
}

function addDays(iso, num) {
  const p = parseIso(iso);
  if (!p) return iso;
  const d = new Date(p.y, p.m - 1, p.d);
  d.setDate(d.getDate() + num);
  const ny = d.getFullYear();
  const nm = String(d.getMonth() + 1).padStart(2, '0');
  const nd = String(d.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

function days(a, b) {
  const pa = parseIso(a);
  const pb = parseIso(b);
  if (!pa || !pb) return 0;
  const da = new Date(pa.y, pa.m - 1, pa.d);
  const db = new Date(pb.y, pb.m - 1, pb.d);
  return Math.round((db - da) / 864e5) + 1;
}

const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
let toastTimer = null;
function toast(m, type = 'info') {
  const t = $('#toast');
  const txt = t.querySelector('.toast-text');
  txt.textContent = m;
  t.className = `show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.className = '';
  }, 2800);
}

// ==========================================================================
// APPS SCRIPT API ENGINE (CORS-Safe + Live/Demo Dual Mode)
// ==========================================================================
async function api(body) {
  setSyncStatus('syncing', 'Syncing...');
  try {
    let r;
    if (body) {
      r = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body)
      });
    } else {
      r = await fetch(API_URL);
    }
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    setSyncStatus('live', 'Live');
    return j;
  } catch (err) {
    setSyncStatus('offline', 'Offline');
    throw err;
  }
}

function setSyncStatus(state, label) {
  const pill = $('#syncBtn');
  const txt = $('#syncText');
  pill.className = `status-pill ${state}`;
  txt.textContent = label;
}

$('#syncBtn').onclick = () => {
  audio.tap();
  load(true);
};

// Data Loading
async function load(isManual = false) {
  if (isManual) toast('Sheets se sync ho raha hai...');
  try {
    D = await api();
    localStorage.rk_leave_cache = JSON.stringify(D);
    if (isManual) {
      audio.success();
      toast('Sync ho gaya!', 'success');
    }
  } catch (e) {
    if (localStorage.rk_leave_cache) {
      D = JSON.parse(localStorage.rk_leave_cache);
      toast('Offline cache data dikha rahe hain: ' + e.message, 'error');
    } else {
      toast('Connection error: ' + e.message, 'error');
    }
  }
  render();
}

// Main Render Function
function render() {
  renderOps();
  renderToday();
  renderReg();
  updateNavBadges();
}

// Update badges on navigation
function updateNavBadges() {
  const t = getTodayIso();
  const ok = D.leaves.filter(l => l.status !== 'Rejected');
  const todayCount = ok.filter(l => l.from <= t && l.to >= t).length;
  const pendingCount = D.leaves.filter(l => l.status === 'Pending').length;

  const todayBadge = $('#navTodayBadge');
  if (todayCount > 0) {
    todayBadge.textContent = todayCount;
    todayBadge.style.display = 'inline-block';
  } else {
    todayBadge.style.display = 'none';
  }

  const pendingBadge = $('#navPendingBadge');
  if (pendingCount > 0) {
    pendingBadge.textContent = pendingCount;
    pendingBadge.style.display = 'inline-block';
  } else {
    pendingBadge.style.display = 'none';
  }
}

// ==========================================================================
// OPERATOR SELECTION & BOTTOM SHEET
// ==========================================================================
function renderOps() {
  const select = $('#op');
  const cur = select.value;
  select.innerHTML = '<option value="">-- naam chuno --</option>' + D.operators.map(o => `<option value="${esc(o.name)}">${esc(o.name)}</option>`).join('');
  select.value = cur;

  // Build Operator Sheet List
  renderOpModalList();
}

function renderOpModalList(query = '') {
  const container = $('#opListContainer');
  const q = query.trim().toLowerCase();
  const filtered = D.operators.filter(o => {
    return (o.name || '').toLowerCase().includes(q) || (o.dept || '').toLowerCase().includes(q);
  });

  if (!filtered.length) {
    container.innerHTML = '<div class="empty-state"><p>Koi karamchari nahi mila</p></div>';
    return;
  }

  container.innerHTML = filtered.map(o => {
    const initials = getInitials(o.name);
    const style = getDeptStyle(o.dept);
    return `
      <div class="op-item-row" data-name="${esc(o.name)}">
        <div class="op-item-left">
          <div class="avatar" style="background:${style.grad}; width:36px; height:36px; font-size:13px;">${initials}</div>
          <div>
            <div class="op-item-name">${esc(o.name)}</div>
            <div class="op-item-sub">${esc(o.dept || 'RK Staff')}${o.loc ? ' · ' + esc(o.loc) : ''}</div>
          </div>
        </div>
        <span class="badge-dept" style="background:${style.bg}; color:${style.text}; border-color:${style.border}">${esc(o.dept || 'Staff')}</span>
      </div>
    `;
  }).join('');
}

// Open / Close Operator Sheet
const opModal = $('#opModal');
$('#opPickerBtn').onclick = () => {
  audio.tap();
  opModal.style.display = 'flex';
  $('#opSearchInput').value = '';
  $('#clearOpSearch').style.display = 'none';
  renderOpModalList();
  setTimeout(() => $('#opSearchInput').focus(), 150);
};

$('#closeOpModal').onclick = () => {
  opModal.style.display = 'none';
};
$('#opModalBackdrop').onclick = () => {
  opModal.style.display = 'none';
};

$('#opSearchInput').oninput = e => {
  const val = e.target.value;
  $('#clearOpSearch').style.display = val ? 'flex' : 'none';
  renderOpModalList(val);
};

$('#clearOpSearch').onclick = () => {
  $('#opSearchInput').value = '';
  $('#clearOpSearch').style.display = 'none';
  renderOpModalList();
};

$('#opListContainer').onclick = e => {
  const row = e.target.closest('.op-item-row');
  if (!row) return;
  const name = row.dataset.name;
  selectOperator(name);
  opModal.style.display = 'none';
  audio.tap();
};

function selectOperator(name) {
  $('#op').value = name;
  const o = D.operators.find(x => x.name === name);
  if (o) {
    $('#dept').value = o.dept || '';
    $('#loc').value = o.loc || '';
    $('#opSelectedLabel').textContent = o.name;
    $('#opSelectedLabel').classList.remove('placeholder');
    const initials = getInitials(o.name);
    const style = getDeptStyle(o.dept);
    const av = $('#opAvatar');
    av.textContent = initials;
    av.style.background = style.grad;
    av.style.color = '#FFFFFF';
    av.classList.add('active');
  }
  check();
}

// Native select change handler as fallback
$('#op').onchange = () => {
  selectOperator($('#op').value);
};

// ==========================================================================
// CARD RENDERER (TAILORED INDUSTRIAL CRAFT)
// ==========================================================================
function card(l) {
  const same = l.from === l.to;
  const dateStr = same ? fmtY(l.from) : `${fmt(l.from)} <span class="date-arrow">→</span> ${fmtY(l.to)}`;
  const initials = getInitials(l.name);
  const deptStyle = getDeptStyle(l.dept);

  let statusIcon = '✓';
  if (l.status === 'Pending') statusIcon = '⏳';
  if (l.status === 'Rejected') statusIcon = '✕';

  return `
    <div class="item-card ${l.status}" data-row="${l.row}">
      <div class="item-top-row">
        <div class="avatar" style="background:${deptStyle.grad};">${initials}</div>
        <div class="item-operator-info">
          <div class="item-name">${esc(l.name)}</div>
          <div class="item-meta-badges">
            <span class="badge-dept" style="background:${deptStyle.bg}; color:${deptStyle.text}; border-color:${deptStyle.border};">${esc(l.dept || 'Staff')}</span>
            ${l.loc ? `<span class="badge-loc">📍 ${esc(l.loc)}</span>` : ''}
          </div>
        </div>
        <span class="status-tag ${l.status}">${statusIcon} ${l.status}</span>
      </div>

      <div class="item-dates-row">
        <div class="item-date-text">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${dateStr}
        </div>
        <span class="item-days-badge">${l.days} Din</span>
      </div>

      <div class="item-bottom-row">
        <span class="item-reason">${esc(l.reason)}</span>
        ${l.by ? `<span class="item-by">By: ${esc(l.by)}</span>` : ''}
      </div>

      ${admin && l.status === 'Pending' ? `
        <div class="item-acts">
          <button class="btn-approve" data-act-row="${l.row}" data-act-status="Approved">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Approve Karein
          </button>
          <button class="btn-reject" data-act-row="${l.row}" data-act-status="Rejected">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Reject
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

// ==========================================================================
// TAB 1: TODAY (AAJ) RENDERER
// ==========================================================================
function renderToday() {
  const t = getTodayIso();
  const ok = D.leaves.filter(l => l.status !== 'Rejected');
  const out = ok.filter(l => l.from <= t && l.to >= t);
  const soon = ok.filter(l => l.from > t).sort((a, b) => a.from.localeCompare(b.from)).slice(0, 12);
  const pend = D.leaves.filter(l => l.status === 'Pending').length;

  // Impacted Departments today
  const deptCounts = {};
  out.forEach(l => {
    const d = l.dept || 'Staff';
    deptCounts[d] = (deptCounts[d] || 0) + 1;
  });
  const deptChipsHtml = Object.entries(deptCounts).map(([d, c]) => `
    <span class="impact-chip">${esc(d)}: <b>${c}</b></span>
  `).join('');

  // Format today's date nicely
  const p = parseIso(t);
  const now = new Date();
  const dayName = DAYS_HI[now.getDay()] || '';
  const dateFormatted = `${dayName}, ${p.d} ${MON[p.m - 1]} ${p.y}`;

  const html = `
    <!-- Hero Attendance Card -->
    <div class="hero-status-card">
      <div class="hero-date-row">
        <span class="hero-today-date">${dateFormatted}</span>
        <span class="hero-live-badge">Live Attendance</span>
      </div>
      <div class="hero-main-row">
        <div class="hero-big-num">${out.length}</div>
        <div class="hero-summary-text">
          Karamchari Aaj Chhutti Par
          <small>${out.length === 0 ? 'Sabhi hazir hain' : `${out.length} sthanik chhuttiyan darj`}</small>
        </div>
      </div>
      ${deptChipsHtml ? `<div class="impact-dept-row">${deptChipsHtml}</div>` : ''}
    </div>

    <!-- Pending Approvals Banner -->
    ${pend > 0 ? `
      <div class="pending-alert-banner" id="btnGoToPending">
        <div class="pending-alert-content">
          <span class="pending-pulse-dot"></span>
          <div>
            <div class="pending-alert-title">${pend} Chhutti Approval Pending Hai</div>
            <div class="pending-alert-desc">Review aur manzoori ke liye tap karein</div>
          </div>
        </div>
        <button type="button" class="pending-alert-btn">Action Lein →</button>
      </div>
    ` : ''}

    <!-- Active Leaves Today -->
    <div class="section-title-wrap">
      <h3 class="section-title">Aaj Chhutti Par</h3>
      <span class="section-count-badge">${out.length}</span>
    </div>
    ${out.length ? out.map(card).join('') : `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        <h3>Sabhi Karamchari Hazir Hain</h3>
        <p>Aaj koi bhi leave par nahi hai.</p>
      </div>
    `}

    <!-- Upcoming Leaves -->
    <div class="section-title-wrap">
      <h3 class="section-title">Aane Wali Chhuttiyan (Upcoming)</h3>
      <span class="section-count-badge">${soon.length}</span>
    </div>
    ${soon.length ? soon.map(card).join('') : `
      <div class="empty-state">
        <p>Agli koi chhutti schedule nahi hai.</p>
      </div>
    `}
  `;

  $('#todayContent').innerHTML = html;

  // Bind pending alert banner click
  const pendingBanner = $('#btnGoToPending');
  if (pendingBanner) {
    pendingBanner.onclick = () => {
      audio.tap();
      filter = 'Pending';
      show('reg');
      renderReg();
    };
  }
}

// ==========================================================================
// TAB 3: REGISTER (RECORD & SEARCH) RENDERER
// ==========================================================================
function renderReg() {
  const q = ($('#q').value || '').trim().toLowerCase();

  // Metric counts
  const totalCount = D.leaves.length;
  const pendingCount = D.leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = D.leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = D.leaves.filter(l => l.status === 'Rejected').length;

  $('#statAll').textContent = totalCount;
  $('#statPending').textContent = pendingCount;
  $('#statApproved').textContent = approvedCount;
  $('#statRejected').textContent = rejectedCount;

  // Status Filter Chips
  const statusChips = [
    { id: 'All', label: `Sabhi (${totalCount})` },
    { id: 'Pending', label: `Pending (${pendingCount})` },
    { id: 'Approved', label: `Approved (${approvedCount})` },
    { id: 'Rejected', label: `Rejected (${rejectedCount})` }
  ];
  $('#chips').innerHTML = statusChips.map(s => `
    <button type="button" class="${s.id === filter ? 'on' : ''}" data-f="${s.id}">${s.label}</button>
  `).join('');

  // Department Filters
  const depts = ['All', ...new Set(D.operators.map(o => o.dept).filter(Boolean))];
  $('#deptChips').innerHTML = depts.map(d => `
    <button type="button" class="dept-chip ${d === deptFilter ? 'active' : ''}" data-dept="${esc(d)}">
      ${d === 'All' ? 'Sabhi Dept' : esc(d)}
    </button>
  `).join('');

  // Filter leaves
  const L = D.leaves.filter(l => {
    const matchStatus = (filter === 'All' || l.status === filter);
    const matchDept = (deptFilter === 'All' || (l.dept || '').toUpperCase() === deptFilter.toUpperCase());
    const matchQuery = (l.name + ' ' + (l.dept || '') + ' ' + (l.loc || '') + ' ' + (l.reason || '')).toLowerCase().includes(q);
    return matchStatus && matchDept && matchQuery;
  }).sort((a, b) => (b.from || '').localeCompare(a.from || ''));

  if (!L.length) {
    $('#list').innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3>Koi Record Nahi Mila</h3>
        <p>Filter badal kar ya doosra naam search karke dekhein.</p>
      </div>
    `;
  } else {
    $('#list').innerHTML = L.map(card).join('');
  }
}

// Search and Filter Events
$('#q').oninput = e => {
  $('#clearSearch').style.display = e.target.value ? 'flex' : 'none';
  renderReg();
};
$('#clearSearch').onclick = () => {
  $('#q').value = '';
  $('#clearSearch').style.display = 'none';
  renderReg();
};

$('#chips').onclick = e => {
  if (e.target.dataset.f) {
    audio.tap();
    filter = e.target.dataset.f;
    renderReg();
  }
};

$('#statsGrid').onclick = e => {
  const card = e.target.closest('.stat-card');
  if (card && card.dataset.f) {
    audio.tap();
    filter = card.dataset.f;
    renderReg();
  }
};

$('#deptChips').onclick = e => {
  const b = e.target.closest('[data-dept]');
  if (b) {
    audio.tap();
    deptFilter = b.dataset.dept;
    renderReg();
  }
};

// Handle Approve / Reject button clicks in cards
document.body.addEventListener('click', async e => {
  const b = e.target.closest('[data-act-row]');
  if (!b) return;
  audio.tap();
  b.disabled = true;
  const originalText = b.innerHTML;
  b.innerHTML = 'Koshish...';

  try {
    await api({
      action: 'status',
      row: +b.dataset.actRow,
      status: b.dataset.actStatus,
      pin: localStorage.pin
    });
    audio.success();
    toast(`Leave ${b.dataset.actStatus} ho gayi!`, 'success');
    load();
  } catch (er) {
    audio.error();
    if (/PIN/i.test(er.message)) {
      localStorage.removeItem('pin');
      admin = false;
      $('#adminBtn').classList.remove('on');
      render();
      toast('PIN galat hai ya session expire ho gaya. Dobara PIN enter karein.', 'error');
      openAdminModal();
    } else {
      toast(er.message || 'Error occurred', 'error');
    }
    b.disabled = false;
    b.innerHTML = originalText;
  }
});

// ==========================================================================
// APPLY FORM LOGIC (QUICK PRESETS, OVERLAP CHECK & DURATION)
// ==========================================================================
function check() {
  const f = $('#from').value;
  const t = $('#to').value;
  const n = $('#op').value;
  const daysBadge = $('#days');
  const warnBox = $('#warn');

  if (f && t) {
    if (t < f) {
      daysBadge.textContent = 'Galat tareekh';
      daysBadge.style.color = 'var(--rejected)';
      warnBox.style.display = 'block';
      warnBox.textContent = 'Dhyan dein: "Kab Tak" date "Kab Se" se pehle nahi ho sakti.';
      return;
    }
    const dCount = days(f, t);
    daysBadge.textContent = `🗓️ Total ${dCount} Din ki Leave`;
    daysBadge.style.color = 'var(--accent)';
  } else {
    daysBadge.textContent = '';
  }

  // Overlap verification
  const conflict = (f && t && n)
    ? D.leaves.find(l => l.name === n && l.status !== 'Rejected' && l.from <= t && l.to >= f)
    : null;

  if (conflict) {
    warnBox.style.display = 'block';
    warnBox.innerHTML = `⚠️ <b>Overlap alert:</b> ${esc(conflict.name)} ki <b>${fmt(conflict.from)} – ${fmt(conflict.to)}</b> tak leave pehle se darj hai (${conflict.status}).`;
  } else if (f && t && t >= f) {
    warnBox.style.display = 'none';
  }
}

['from', 'to'].forEach(id => $('#' + id).onchange = check);

// Quick Date Presets
$('#datePresets').onclick = e => {
  const b = e.target.closest('[data-preset]');
  if (!b) return;
  audio.tap();
  $$('#datePresets .preset-chip').forEach(c => c.classList.remove('active'));
  b.classList.add('active');

  const todayIso = getTodayIso();
  const preset = b.dataset.preset;

  if (preset === 'today') {
    $('#from').value = todayIso;
    $('#to').value = todayIso;
  } else if (preset === 'tomorrow') {
    const tom = addDays(todayIso, 1);
    $('#from').value = tom;
    $('#to').value = tom;
  } else if (preset === '2days') {
    $('#from').value = todayIso;
    $('#to').value = addDays(todayIso, 1);
  } else if (preset === '3days') {
    $('#from').value = todayIso;
    $('#to').value = addDays(todayIso, 2);
  } else if (preset === 'week') {
    $('#from').value = todayIso;
    $('#to').value = addDays(todayIso, 6);
  }
  check();
};

// Quick Reason Chips
$('#reasonChips').onclick = e => {
  const b = e.target.closest('[data-reason]');
  if (!b) return;
  audio.tap();
  $$('#reasonChips .reason-chip').forEach(c => c.classList.remove('active'));
  b.classList.add('active');
  $('#reason').value = b.dataset.reason;
};

// Form Submission
$('#f').onsubmit = async e => {
  e.preventDefault();
  audio.tap();

  if (!$('#op').value) {
    audio.error();
    toast('Kripya karamchari ka naam chunein', 'error');
    $('#opPickerBtn').focus();
    return;
  }
  if ($('#to').value < $('#from').value) {
    audio.error();
    return toast('"Kab Tak" date "Kab Se" se pehle nahi ho sakti', 'error');
  }

  const subBtn = $('#sub');
  subBtn.disabled = true;
  subBtn.querySelector('.btn-text').textContent = 'Bhej rahe hain...';

  try {
    await api({
      action: 'add',
      name: $('#op').value,
      dept: $('#dept').value,
      loc: $('#loc').value,
      from: $('#from').value,
      to: $('#to').value,
      reason: $('#reason').value.toUpperCase()
    });

    audio.success();
    toast('Chhutti safaltapoorvak darj ho gayi!', 'success');

    // Reset Form
    $('#f').reset();
    $('#opSelectedLabel').textContent = 'Naam chunein (56 Karamchari)...';
    $('#opSelectedLabel').classList.add('placeholder');
    $('#opAvatar').textContent = '?';
    $('#opAvatar').className = 'avatar-sm';
    $('#opAvatar').style = '';
    $('#days').textContent = '';
    $('#warn').style.display = 'none';
    $$('#datePresets .preset-chip').forEach(c => c.classList.remove('active'));
    $$('#reasonChips .reason-chip').forEach(c => c.classList.remove('active'));

    show('today');
    load();
  } catch (er) {
    audio.error();
    toast(er.message || 'Leave submit karne mein error aaya', 'error');
  }

  subBtn.disabled = false;
  subBtn.querySelector('.btn-text').textContent = 'Leave Bhejo';
};

// ==========================================================================
// NAVIGATION TAB CONTROLLER
// ==========================================================================
function show(t) {
  audio.tap();
  $$('.tab').forEach(x => x.classList.toggle('on', x.id === 'tab-' + t));
  $$('nav button').forEach(x => x.classList.toggle('on', x.dataset.t === t));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$('nav').onclick = e => {
  const btn = e.target.closest('button[data-t]');
  if (btn) show(btn.dataset.t);
};

// ==========================================================================
// ADMIN KEYPAD BOTTOM SHEET & PIN LOGIC
// ==========================================================================
const adminModal = $('#adminModal');

function openAdminModal() {
  adminModal.style.display = 'flex';
  if (admin) {
    $('#adminLoginView').style.display = 'none';
    $('#adminActiveView').style.display = 'block';
  } else {
    $('#adminLoginView').style.display = 'block';
    $('#adminActiveView').style.display = 'none';
    resetPinDisplay();
  }
}

function closeAdminModal() {
  adminModal.style.display = 'none';
}

$('#adminBtn').classList.toggle('on', admin);
$('#adminBtn').onclick = () => {
  audio.tap();
  openAdminModal();
};

$('#closeAdminModal').onclick = closeAdminModal;
$('#closeAdminActiveModal').onclick = closeAdminModal;
$('#adminModalBackdrop').onclick = closeAdminModal;

function resetPinDisplay() {
  enteredPin = '';
  $('#pinError').textContent = '';
  updatePinDots();
}

function updatePinDots() {
  const dots = $$('#pinDisplay .pin-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('filled', idx < enteredPin.length);
  });
}

// On-screen Keypad Handling
$('#keypadGrid').onclick = async e => {
  const btn = e.target.closest('.key-btn');
  if (!btn) return;
  audio.tap();
  const key = btn.dataset.key;

  if (key === 'clear') {
    resetPinDisplay();
    return;
  }
  if (key === 'back') {
    if (enteredPin.length > 0) {
      enteredPin = enteredPin.slice(0, -1);
      updatePinDots();
    }
    return;
  }

  // Digit entered
  if (enteredPin.length < 4) {
    enteredPin += key;
    updatePinDots();

    if (enteredPin.length === 4) {
      // 4-digit PIN complete - save and activate
      localStorage.pin = enteredPin;
      admin = true;
      $('#adminBtn').classList.add('on');
      audio.success();
      toast('Admin Mode Active!', 'success');
      closeAdminModal();
      render();
    }
  }
};

$('#btnLockAdmin').onclick = () => {
  audio.tap();
  localStorage.removeItem('pin');
  admin = false;
  $('#adminBtn').classList.remove('on');
  toast('Admin Mode Lock ho gaya');
  closeAdminModal();
  render();
};

$('#btnChangePin').onclick = () => {
  audio.tap();
  localStorage.removeItem('pin');
  admin = false;
  $('#adminBtn').classList.remove('on');
  $('#adminActiveView').style.display = 'none';
  $('#adminLoginView').style.display = 'block';
  resetPinDisplay();
};

// ==========================================================================
// PWA SERVICE WORKER & INITIALIZATION
// ==========================================================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Instant Cache-First Hydration (0ms load time)
if (localStorage.rk_leave_cache) {
  try {
    D = JSON.parse(localStorage.rk_leave_cache);
    render();
  } catch (_) {}
}

// Start live sync with Google Sheets
load();
