/* ProcureLink core: hash router, shell, helpers. Pages register via App.page(). */
(function () {
  const pages = {};
  const state = { role: localStorage.getItem('pl.role') || null, toast: null };

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const vnd = (n) => (n == null ? '' : Math.round(n).toLocaleString('vi-VN') + ' ₫');
  const num = (n, d = 0) => Number(n).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (n, d = 1) => num(n, d) + '%';
  const ty = (n) => num(n / 1e9, 1) + ' tỷ ₫';
  // Material ID chip — always a link to Material 360°
  const mid = (id) => `<a class="mid" href="#/material360?id=${esc(id)}">${esc(id)}</a>`;
  // Status pill: tone = success | warning | danger | info | neutral
  const pill = (text, tone = 'neutral') => `<span class="pill pill-${tone}">${esc(text)}</span>`;
  const docid = (id) => `<span class="mono">${esc(id)}</span>`;

  /* Generic table: cols = [{h, k | r(row), cls, w}], rows = array */
  function table(cols, rows, opts = {}) {
    const tpl = cols.map((c) => c.w || 'minmax(110px,1fr)').join(' ');
    const min = opts.min || Math.max(600, cols.length * 130);
    const head = cols.map((c) => `<div class="th ${c.cls || ''}">${esc(c.h)}</div>`).join('');
    const body = rows.length
      ? rows.map((r) => `<div class="tr" role="row" style="grid-template-columns:${tpl}">${cols.map((c) => `<div class="td ${c.cls || ''}" role="cell">${c.r ? c.r(r) : esc(r[c.k])}</div>`).join('')}</div>`).join('')
      : `<div class="empty">${esc(opts.empty || 'No records')}</div>`;
    return `<div class="tbl-wrap" tabindex="0" role="region" aria-label="${esc(opts.label || 'Table')}, scrolls horizontally"><div class="tbl" role="table" style="min-width:${min}px"><div class="tr thead" role="row" style="grid-template-columns:${tpl}">${head}</div>${body}</div></div>`;
  }

  const kpi = (label, value, note, tone) => `<div class="card kpi"><div class="kpi-l">${esc(label)}</div><div class="kpi-v">${value}</div>${note ? `<div class="kpi-n ${tone ? 'tone-' + tone : ''}">${note}</div>` : ''}</div>`;
  const card = (title, body, actions = '') => `<section class="card"><div class="card-h"><h2>${esc(title)}</h2><div class="card-a">${actions}</div></div>${body}</section>`;

  /* State blocks (additive helpers): empty / loading / error */
  const emptyState = (title, note = '', action = '') => `<div class="state" role="status"><b>${esc(title)}</b>${note ? `<span class="muted">${esc(note)}</span>` : ''}${action}</div>`;
  const loading = (label = 'Loading…') => `<div class="state" role="status" aria-live="polite"><span class="spin" aria-hidden="true"></span><span class="muted">${esc(label)}</span></div>`;
  const errorState = (msg, retry = '') => `<div class="alert alert-danger" role="alert">${esc(msg)}${retry}</div>`;

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  /* ---------- Navigation ---------- */
  const ICON = {
    dashboard: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    approvals: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9',
    materials: 'M3 3h8l10 10-8 8L3 11V3zM7.5 7.5h.01',
    material360: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9',
    vendors: 'M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3',
    evaluation: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z',
    contracts: 'M14 3H6v18h12V7l-4-4zM14 3v4h4M9 10h6M8 17c1.5-2 2.5-2 3 0s1.5 2 3 0',
    certificates: 'M12 15a6 6 0 1 0 0-12a6 6 0 1 0 0 12zM8.5 14L7 21l5-3 5 3-1.5-7',
    tenders: 'M9 3h6v3H9zM7 4.5H5V21h14V4.5h-2M9 12h6M9 16h4',
    pr: 'M14 3H6v18h12V7l-4-4zM14 3v4h4M12 11v6M9 14h6',
    po: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h3',
    invoices: 'M4 5h16v14H4zM4 9h16M8 14h3M14 14h2',
    price: 'M3 17l6-6 4 4 8-8M15 7h6v6',
    reports: 'M5 20V11M11 20V5M17 20v-6M3 20h18',
    admin: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    dot: 'M12 12h.01'
  };
  const NAV = {
    procurement: [
      ['Overview', [['dashboard', 'Dashboard'], ['approvals', 'My approvals', 'approvals'], ['materials', 'Material IDs'], ['material360', 'Material 360°']]],
      ['Vendors', [['vendors', 'Vendors'], ['evaluation', 'Vendor evaluation'], ['contracts', 'Contracts'], ['certificates', 'Certificates']]],
      ['Sourcing', [['tenders', 'Tenders'], ['pr', 'Purchase requests'], ['po', 'Purchase orders'], ['invoices', 'Invoices & matching']]],
      ['Insights', [['price', 'Price history'], ['reports', 'Reports']]]
    ],
    supplier: [['Supplier portal', [['supplier', 'Overview'], ['supplier/invitations', 'Invitations to bid'], ['supplier/quotations', 'My quotations'], ['supplier/pos', 'Purchase orders'], ['supplier/deliveries', 'Deliveries'], ['supplier/invoices', 'Invoices'], ['supplier/contracts', 'Contracts'], ['supplier/certificates', 'Certificates'], ['supplier/scorecard', 'Scorecard'], ['supplier/profile', 'Company profile']]]],
    admin: [['Admin console', [['admin/users', 'Users & roles'], ['admin/access', 'Access policy'], ['admin/matrix', 'Approval matrix'], ['materials', 'Material master'], ['admin/categories', 'Categories'], ['admin/templates', 'Evaluation templates'], ['admin/numbering', 'Numbering & ID rules'], ['admin/integrations', 'Integrations'], ['admin/rules', 'Notification rules'], ['admin/sod', 'SoD rules'], ['admin/audit', 'Audit log']]]]
  };
  const USERS = {
    procurement: ['Nguyễn Minh Anh', 'Procurement Lead'],
    supplier: ['Võ Thị Lan', 'Công ty TNHH Thép Minh Phát'],
    admin: ['Phạm Thu Trang', 'System Admin']
  };
  const HOME = { procurement: 'dashboard', supplier: 'supplier', admin: 'admin/users' };
  const icon = (k) => `<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON[k.split('/')[0]] || ICON.dot}"/></svg>`;

  function shell(route, inner, ws) {
    const groups = NAV[ws].map(([g, items]) => `<div class="nav-g"><div class="nav-gt">${esc(g)}</div>${items.map(([k, label, badge]) => {
      const on = route === k || (k !== 'supplier' && route.startsWith(k + '/')) ? ' on' : '';
      const b = badge === 'approvals' ? `<span class="badge" aria-label="${window.DATA.approvals.length} waiting">${window.DATA.approvals.length}</span>` : '';
      return `<a class="nav-i${on}" href="#/${k}"${on ? ' aria-current="page"' : ''}>${icon(k)}<span>${esc(label)}</span>${b}</a>`;
    }).join('')}</div>`).join('');
    const foot = ws === 'procurement' ? `<a class="nav-i" href="#/admin/users">${icon('admin')}<span>Admin console</span></a>`
      : ws === 'admin' ? `<a class="nav-i" href="#/dashboard">${icon('dashboard')}<span>Back to Procurement</span></a>` : '';
    const [uname, urole] = USERS[ws];
    const unread = window.DATA.notifications.filter((n) => !n.read).length;
    return `<a class="skip" href="#main" data-act="skip">Skip to content</a><div class="layout">
      <div class="scrim" data-act="menu-close" hidden></div>
      <aside class="side" id="side">
        <div class="brand"><span class="logo" aria-hidden="true">PL</span><span>ProcureLink</span><span class="ws">${esc(ws[0].toUpperCase() + ws.slice(1))}</span></div>
        <nav aria-label="Main">${groups}</nav>
        <div class="side-f">${foot}<button class="nav-i linkbtn" data-act="switch">${icon('dot')}<span>Switch workspace</span></button></div>
      </aside>
      <div class="main-col">
        <header class="top">
          <button class="icon-btn menu-btn" aria-label="Open menu" aria-controls="side" aria-expanded="false" data-act="menu"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
          <form class="search" role="search" data-act="search"><label class="sr" for="gsearch">Search</label><input id="gsearch" type="search" placeholder="Search Material ID, PR, PO, tender, vendor…  ( / )"></form>
          <div class="top-r">
            <a class="icon-btn bell" href="#/notifications" aria-label="Notifications, ${unread} unread"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>${unread ? `<span class="dotc">${unread}</span>` : ''}</a>
            <div class="user"><span class="av" aria-hidden="true">${esc(uname.split(' ').pop()[0])}</span><span class="un"><b>${esc(uname)}</b><small>${esc(urole)}</small></span></div>
          </div>
        </header>
        <main class="content" id="main" tabindex="-1">${inner}</main>
      </div></div>`;
  }

  function parse() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, q = ''] = h.split('?');
    return { route: path || '', params: Object.fromEntries(new URLSearchParams(q)) };
  }

  function findPage(route) {
    if (pages[route]) return { p: pages[route], sub: null };
    const parts = route.split('/');
    for (let i = parts.length - 1; i > 0; i--) {
      const k = parts.slice(0, i).join('/');
      if (pages[k]) return { p: pages[k], sub: parts.slice(i).join('/') };
    }
    return null;
  }

  function render() {
    const { route, params } = parse();
    const app = document.getElementById('app');
    if (!state.role || route === 'login') {
      if (route !== 'login') { location.hash = '#/login'; return; }
      app.innerHTML = pages.login ? pages.login.render(params) : 'Login';
      document.title = 'Sign in · ProcureLink';
      pages.login && pages.login.mount && pages.login.mount(app, params);
      return;
    }
    if (!route) { location.hash = '#/' + HOME[state.role]; return; }
    const found = findPage(route);
    const ws = found && found.p.ws ? found.p.ws : state.role;
    let inner;
    if (!found) inner = `<div class="page-h"><h1>Not built yet</h1></div><div class="card">Screen <code>${esc(route)}</code> is not available yet.</div>`;
    else {
      try { inner = found.p.render(params, found.sub); }
      catch (e) { console.error(e); inner = errorState(`This screen could not be displayed (${route}): ${e.message}`); }
    }
    app.innerHTML = shell(route, inner, ws);
    document.title = ((found && found.p.title) || 'ProcureLink') + ' · ProcureLink';
    if (found && found.p.mount) found.p.mount(document.getElementById('main'), params, found.sub);
    window.scrollTo(0, 0);
  }

  /* Mobile drawer */
  function setMenu(open) {
    const side = document.getElementById('side'); if (!side) return;
    side.classList.toggle('open', open);
    const btn = document.querySelector('[data-act=menu]'), scrim = document.querySelector('.scrim');
    if (btn) { btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
    if (scrim) scrim.hidden = !open;
    if (open) { const f = side.querySelector('.nav-i.on, .nav-i'); f && f.focus(); } else if (btn && side.contains(document.activeElement)) btn.focus();
  }
  document.addEventListener('click', (e) => { if (e.target.closest('#side a[href]')) setMenu(false); }, true);

  /* Global delegated events */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const a = t.dataset.act;
    if (a === 'switch') { localStorage.removeItem('pl.role'); state.role = null; location.hash = '#/login'; }
    else if (a === 'menu') setMenu(!document.getElementById('side').classList.contains('open'));
    else if (a === 'menu-close') setMenu(false);
    else if (a === 'skip') { e.preventDefault(); const m = document.getElementById('main'); m && m.focus(); }
    else if (a === 'toast') toast(t.dataset.msg || 'Done');
    else if (a === 'tab') {
      const box = t.closest('[data-tabs]');
      box.querySelectorAll('[role=tab]').forEach((b) => b.setAttribute('aria-selected', b === t ? 'true' : 'false'));
      box.querySelectorAll('[role=tabpanel]').forEach((p) => { p.hidden = p.id !== t.getAttribute('aria-controls'); });
    }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.dataset.act === 'search') {
      e.preventDefault();
      const q = f.querySelector('input').value.trim();
      if (q) location.hash = '#/search?q=' + encodeURIComponent(q);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { const sd = document.getElementById('side'); if (sd && sd.classList.contains('open')) { setMenu(false); return; } }
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      const s = document.getElementById('gsearch'); if (s) { e.preventDefault(); s.focus(); }
    }
  });

  /* Tabs helper: tabs(id, [[key,label,html],...]) */
  function tabs(id, list) {
    return `<div data-tabs><div class="tabs" role="tablist">${list.map(([k, l], i) => `<button role="tab" data-act="tab" id="${id}-t-${k}" aria-controls="${id}-${k}" aria-selected="${i === 0}">${esc(l)}</button>`).join('')}</div>${list.map(([k, , html], i) => `<div role="tabpanel" id="${id}-${k}" aria-labelledby="${id}-t-${k}"${i ? ' hidden' : ''}>${html}</div>`).join('')}</div>`;
  }

  window.App = {
    page(key, def) { pages[key] = def; },
    pages, state, render, esc, emptyState, loading, errorState, setMenu, vnd, num, pct, ty, mid, pill, docid, table, kpi, card, tabs, toast, HOME,
    login(role) { state.role = role; localStorage.setItem('pl.role', role); location.hash = '#/' + HOME[role]; },
    material: (id) => window.DATA.materials.find((m) => m.id === id),
    vendor: (id) => window.DATA.vendors.find((v) => v.id === id)
  };
})();
