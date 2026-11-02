/* ProcureLink core: hash router, shell, layout system, helpers. Pages register via App.page(). i18n: js/i18n.js. */
(function () {
  const pages = {};
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }, del(k) { try { localStorage.removeItem(k); } catch (e) { /* storage blocked */ } } };
  // Language: Vietnamese by default; 'pl.lang' = 'en' switches the whole UI (numbers and dates stay vi-VN).
  const state = { role: ls.get('pl.role') || null, user: null, lang: ls.get('pl.lang') === 'en' ? 'en' : 'vi', toast: null };
  // Restore the signed-in user (P1-01)
  (function () { const em = ls.get('pl.user'); const U = (window.DATA && window.DATA.users) || []; const u = em && U.find((x) => x.email === em); if (u && state.role && u.roles.includes(state.role)) state.user = u; })();

  /* Accent-, case- and space-insensitive text match (P1-08) */
  const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').replace(/\s+/g, '').toLowerCase();
  const matches = (x, q) => norm(x).includes(norm(q));

  /* i18n: t(key, params) → string in the current language (fallback: English, then the key); tv(value) translates a data value */
  const I = window.I18N || { t: (l, k) => k, tv: (l, s) => s, add() {}, values() {} };
  const t = (k, p) => I.t(state.lang, k, p);
  const tv = (s) => I.tv(state.lang, s);

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const vnd = (n) => (n == null ? '' : Math.round(n).toLocaleString('vi-VN') + ' ₫');
  const num = (n, d = 0) => Number(n).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (n, d = 1) => num(n, d) + '%';
  const ty = (n) => num(n / 1e9, 1) + ' tỷ ₫';
  // Material ID chip — always a link to Material 360°
  const mid = (id) => `<a class="mid" href="#/material360?id=${esc(id)}">${esc(id)}</a>`;
  // Status pill: tone = success | warning | danger | info | neutral. Data values are translated (App.tv).
  const pill = (text, tone = 'neutral') => `<span class="pill pill-${tone}">${esc(tv(text))}</span>`;
  const docid = (id) => `<span class="mono">${esc(id)}</span>`;

  /* Generic table: cols = [{h, k | r(row), cls, w}], rows = array */
  function table(cols, rows, opts = {}) {
    const tpl = cols.map((c) => c.w || 'minmax(110px,1fr)').join(' ');
    // Min width = sum of each column's minimum (px from w, minmax() min, else 110) + cell gaps, so tables fit when the block is wide enough.
    const colMin = (w) => { const m = /^(?:minmax\()?(\d+)px/.exec(w || ''); return m ? +m[1] : 110; };
    const min = opts.min || Math.max(480, cols.reduce((a, c) => a + colMin(c.w), 0));
    const head = cols.map((c) => `<div class="th ${c.cls || ''}" role="columnheader">${esc(c.h)}</div>`).join('');
    const body = rows.length
      ? rows.map((r, i) => `<div class="tr" role="row" style="grid-template-columns:${tpl}">${cols.map((c) => `<div class="td ${c.cls || ''}" role="cell">${c.r ? c.r(r, i) : esc(r[c.k])}</div>`).join('')}</div>`).join('')
      : `<div class="empty">${esc(opts.empty || t('c.noRecords'))}</div>`;
    return `<div class="tbl-wrap${opts.cls ? ' ' + opts.cls : ''}" tabindex="0" role="region" aria-label="${esc(t('c.scrolls', { label: opts.label || t('c.table') }))}"><div class="tbl" role="table" style="min-width:${min}px"><div class="tr thead" role="row" style="grid-template-columns:${tpl}">${head}</div>${body}</div></div>`;
  }

  const kpi = (label, value, note, tone) => `<div class="card kpi"><div class="kpi-l">${esc(label)}</div><div class="kpi-v">${value}</div>${note ? `<div class="kpi-n ${tone ? 'tone-' + tone : ''}">${note}</div>` : ''}</div>`;
  const card = (title, body, actions = '') => `<section class="card"><div class="card-h"><h2>${esc(title)}</h2><div class="card-a">${actions}</div></div>${body}</section>`;

  /* ---------- Layout system (docs/ui-guidelines.md) ----------
     block(title, body, {span: 12|6|4, actions, id}) → equal card in the 12-column block grid.
     layout({title, crumbs, subtitle, actions, alerts, kpis: [kpi html], subnav, blocks: [block html]}) → page header → KPI row → sub-nav → block grid. */
  const SPANS = [12, 6, 4];
  function block(title, body, o = {}) {
    const span = SPANS.includes(o.span) ? o.span : 12;
    return `<section class="card blk s-${span}"${o.id ? ` id="${esc(o.id)}" tabindex="-1"` : ''}><div class="blk-h"><h2>${title == null ? '' : o.raw ? title : esc(title)}</h2>${o.actions ? `<div class="card-a">${o.actions}</div>` : ''}</div><div class="blk-b">${body}</div></section>`;
  }
  function layout(o) {
    const k = (o.kpis || []).filter(Boolean);
    const head = `<div class="page-h"><div class="page-t">${o.crumbs ? `<div class="crumbs small muted">${o.crumbs}</div>` : ''}<h1>${o.titleHtml || esc(o.title)}</h1>${o.subtitle ? `<div class="sub">${o.subtitle}</div>` : ''}</div>${o.actions ? `<div class="acts">${o.actions}</div>` : ''}</div>`;
    return head + (o.alerts || '') + (k.length ? `<div class="kpis kpis-${Math.min(k.length, 5)}">${k.slice(0, 5).join('')}</div>` : '') + (o.subnav || '') + `<div class="blocks">${(o.blocks || []).filter(Boolean).join('')}</div>`;
  }
  /* Sub-function routing: subnav(base, [[sub, labelKey, badge?]], cur, qs) → tabs routed as #/base/sub (first item = #/base). */
  function subnav(base, items, cur, qs) {
    const q = qs ? '?' + qs : '';
    const c = sub(items, cur);
    return `<nav class="subnav" aria-label="${esc(t('shell.subnav'))}">${items.map(([k, lk, b], i) => {
      const on = k === c;
      return `<a href="#/${base}${i === 0 ? '' : '/' + k}${q}"${on ? ' aria-current="page"' : ''}>${esc(t(lk))}${b ? ` <span class="badge">${esc(b)}</span>` : ''}</a>`;
    }).join('')}</nav>`;
  }
  // Resolve the current sub-function: unknown or empty → first item (never crash on a bad URL)
  function sub(items, cur) { return items.some((x) => x[0] === cur) ? cur : items[0][0]; }
  const unknownSub = (items, cur) => (cur && !items.some((x) => x[0] === cur) ? `<div class="alert alert-warning" role="status">${esc(t('shell.unknownSub', { sub: cur, first: t(items[0][1]) }))}</div>` : '');

  /* State blocks: empty / loading / error */
  const emptyState = (title, note = '', action = '') => `<div class="state" role="status"><b>${esc(title)}</b>${note ? `<span class="muted">${esc(note)}</span>` : ''}${action}</div>`;
  const loading = (label) => `<div class="state" role="status" aria-live="polite"><span class="spin" aria-hidden="true"></span><span class="muted">${esc(label || t('c.loading'))}</span></div>`;
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
      ['nav.g.overview', [['dashboard', 'nav.dashboard'], ['approvals', 'nav.approvals', 'approvals'], ['materials', 'nav.materials'], ['material360', 'nav.material360']]],
      ['nav.g.vendors', [['vendors', 'nav.vendors'], ['evaluation', 'nav.evaluation'], ['contracts', 'nav.contracts'], ['certificates', 'nav.certificates']]],
      ['nav.g.sourcing', [['tenders', 'nav.tenders'], ['pr', 'nav.pr'], ['po', 'nav.po'], ['invoices', 'nav.invoices']]],
      ['nav.g.insights', [['price', 'nav.price'], ['reports', 'nav.reports']]]
    ],
    supplier: [['nav.g.supplier', [['supplier', 'nav.s.overview'], ['supplier/invitations', 'nav.s.invitations'], ['supplier/quotations', 'nav.s.quotations'], ['supplier/pos', 'nav.s.pos'], ['supplier/deliveries', 'nav.s.deliveries'], ['supplier/invoices', 'nav.s.invoices'], ['supplier/contracts', 'nav.s.contracts'], ['supplier/certificates', 'nav.s.certificates'], ['supplier/scorecard', 'nav.s.scorecard'], ['supplier/profile', 'nav.s.profile']]]],
    admin: [['nav.g.admin', [['admin/users', 'nav.a.users'], ['admin/access', 'nav.a.access'], ['admin/matrix', 'nav.a.matrix'], ['materials', 'nav.a.materials'], ['admin/categories', 'nav.a.categories'], ['admin/templates', 'nav.a.templates'], ['admin/numbering', 'nav.a.numbering'], ['admin/tolerances', 'nav.a.tolerances'], ['admin/integrations', 'nav.a.integrations'], ['admin/rules', 'nav.a.rules'], ['admin/sod', 'nav.a.sod'], ['admin/audit', 'nav.a.audit']]]]
  };
  const USERS = {
    procurement: ['Nguyễn Minh Anh', 'Procurement Lead'],
    supplier: ['Võ Thị Lan', 'Công ty TNHH Thép Minh Phát'],
    admin: ['Phạm Thu Trang', 'System Admin']
  };
  const HOME = { procurement: 'dashboard', supplier: 'supplier', admin: 'admin/users' };
  const icon = (k) => `<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON[k.split('/').pop()] || ICON[{ pos: 'po', invitations: 'tenders', quotations: 'pr', deliveries: 'po', scorecard: 'evaluation', profile: 'vendors', supplier: 'dashboard', users: 'vendors', access: 'certificates', matrix: 'approvals', categories: 'materials', numbering: 'pr', integrations: 'material360', rules: 'approvals', sod: 'certificates', audit: 'reports', tolerances: 'invoices' }[k.split('/').pop()]] || ICON[k.split('/')[0]] || ICON.dot}"/></svg>`;
  const langBtn = () => `<button class="btn btn-sm lang" data-act="lang" aria-pressed="${state.lang === 'en'}" aria-label="${esc(t('shell.lang'))}"><span${state.lang === 'vi' ? ' class="on"' : ''}>VI</span><span aria-hidden="true">|</span><span${state.lang === 'en' ? ' class="on"' : ''}>EN</span></button>`;

  function shell(route, inner, ws) {
    const groups = NAV[ws].map(([g, items]) => `<div class="nav-g"><div class="nav-gt">${esc(t(g))}</div>${items.map(([k, label, badge]) => {
      const on = route === k || (k !== 'supplier' && route.startsWith(k + '/')) ? ' on' : '';
      const nq = badge ? (App.src ? App.src.myQueue().length : window.DATA.approvals.length) : 0;
      const b = badge === 'approvals' && nq ? `<span class="badge" aria-label="${esc(t('shell.waiting', { n: nq }))}">${nq}</span>` : '';
      return `<a class="nav-i${on}" href="#/${k}"${on ? ' aria-current="page"' : ''}>${icon(k)}<span>${esc(t(label))}</span>${b}</a>`;
    }).join('')}</div>`).join('');
    const foot = ws === 'procurement' ? `<a class="nav-i" href="#/admin/users">${icon('admin')}<span>${esc(t('nav.adminConsole'))}</span></a>`
      : ws === 'admin' ? `<a class="nav-i" href="#/dashboard">${icon('dashboard')}<span>${esc(t('nav.back'))}</span></a>` : '';
    const u = state.user; const [uname, urole] = u ? [u.name, u.vendor ? ((window.DATA.vendors.find((v) => v.id === u.vendor) || {}).name || u.title) : u.title] : USERS[ws];
    const sp = ws === 'supplier' && window.DATA.portal && window.DATA.portal[(u && u.vendor) || 'V-1001'];
    const unread = sp ? sp.notices.length : window.DATA.notifications.filter((n) => !n.read).length;
    return `<a class="skip" href="#main" data-act="skip">${esc(t('shell.skip'))}</a><div class="layout">
      <div class="scrim" data-act="menu-close" hidden></div>
      <aside class="side" id="side">
        <div class="brand"><span class="logo" aria-hidden="true">PL</span><span>ProcureLink</span><span class="ws">${esc(t('ws.' + ws))}</span></div>
        <nav aria-label="${esc(t('nav.main'))}">${groups}</nav>
        <div class="side-f">${foot}<button class="nav-i linkbtn" data-act="switch">${icon('dot')}<span>${esc(t('nav.switch'))}</span></button></div>
      </aside>
      <div class="main-col">
        <header class="top">
          <button class="icon-btn menu-btn" aria-label="${esc(t('shell.openMenu'))}" aria-controls="side" aria-expanded="false" data-act="menu"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
          ${ws === 'supplier' ? '' : `<form class="search" role="search" data-act="search"><label class="sr" for="gsearch">${esc(t('shell.search'))}</label><input id="gsearch" type="search" placeholder="${esc(t('shell.searchPh'))}"></form>`}
          <div class="top-r">
            ${langBtn()}
            <a class="icon-btn bell" href="${sp ? '#/supplier' : '#/notifications'}" aria-label="${esc(t('shell.notifs', { n: unread }))}"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>${unread ? `<span class="dotc">${unread}</span>` : ''}</a>
            <div class="user"><span class="av" aria-hidden="true">${esc(uname.split(' ').pop()[0])}</span><span class="un"><b>${esc(uname)}</b><small>${esc(tv(urole))}</small></span></div>
          </div>
        </header>
        <main class="content" lang="${state.lang}" id="main" tabindex="-1">${inner}</main>
      </div></div>`;
  }

  function parse() {
    let h = location.hash.replace(/^#\/?/, '');
    try { h = decodeURI(h); } catch (e) { /* keep raw */ }
    const i = h.indexOf('?');
    const path = (i < 0 ? h : h.slice(0, i)).replace(/\/+$/, '');
    let params = {};
    try { params = Object.fromEntries(new URLSearchParams(i < 0 ? '' : h.slice(i + 1))); } catch (e) { params = {}; }
    return { route: path || '', params };
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
  const titleOf = (p, route) => (p.titleKey ? t(p.titleKey) : p.title ? t(p.title) : route);

  function render() {
    const { route, params } = parse();
    const app = document.getElementById('app');
    if (!app) return;
    document.documentElement.lang = state.lang;
    if (!state.role || route === 'login') {
      if (route !== 'login') { location.hash = '#/login'; return; }
      try { app.innerHTML = pages.login ? pages.login.render(params) : 'Login'; pages.login && pages.login.mount && pages.login.mount(app, params); }
      catch (e) { console.error(e); app.innerHTML = errorState(t('shell.crash', { route })); }
      document.title = t('login.title') + ' · ProcureLink';
      return;
    }
    if (!route) { location.hash = '#/' + HOME[state.role]; return; }
    const found = findPage(route);
    // Role guard (P1-02): a page with `roles` opens only for those roles; otherwise redirect home with a message.
    if (found && found.p.roles && !found.p.roles.includes(state.role)) {
      state.notice = t('shell.noAccess', { title: titleOf(found.p, route), ws: t('ws.' + state.role) });
      location.replace('#/' + HOME[state.role]);
      return;
    }
    // The workspace (sidebar) follows the role; admins also see procurement pages in the procurement shell.
    const ws = state.role === 'admin' && found && found.p.ws ? found.p.ws : state.role;
    let inner; let ok = true;
    if (!found) inner = layout({ title: t('shell.notBuilt'), blocks: [block(null, `<p class="m-0">${esc(t('shell.notBuiltNote', { route }))}</p><p class="m-0"><a class="btn" href="#/${HOME[state.role]}">${esc(t('shell.goHome'))}</a></p>`)] });
    else {
      // Error boundary per page: a failing screen shows an alert inside the shell; navigation keeps working.
      try { inner = found.p.render(params, found.sub); }
      catch (e) { console.error(e); ok = false; inner = errorState(t('shell.crash', { route })) + `<p><a class="btn" href="#/${HOME[state.role]}">${esc(t('shell.goHome'))}</a></p>`; }
    }
    if (state.notice) { inner = `<div class="alert alert-warning" role="alert">${esc(state.notice)}</div>` + inner; state.notice = null; }
    app.innerHTML = shell(route, inner, ws);
    document.title = (found ? titleOf(found.p, route) : 'ProcureLink') + ' · ProcureLink';
    if (ok && found && found.p.mount) {
      try { found.p.mount(document.getElementById('main'), params, found.sub); }
      catch (e) { console.error(e); const m = document.getElementById('main'); if (m) m.insertAdjacentHTML('afterbegin', errorState(t('shell.crash', { route }))); }
    }
    subnavHint();
    window.scrollTo(0, 0);
  }
  // RB1-09: sub-nav that overflows (mobile) gets edge fades; the active tab is scrolled into view
  function subnavHint() {
    document.querySelectorAll('.subnav').forEach((n) => {
      const upd = () => { n.classList.toggle('more-r', n.scrollLeft + n.clientWidth < n.scrollWidth - 2); n.classList.toggle('more-l', n.scrollLeft > 2); };
      const on = n.querySelector('[aria-current=page]');
      if (on && n.scrollWidth > n.clientWidth) n.scrollLeft = Math.max(0, on.offsetLeft - (n.clientWidth - on.offsetWidth) / 2);
      upd(); n.addEventListener('scroll', upd, { passive: true });
    });
  }
  window.addEventListener('resize', () => subnavHint());

  /* Mobile drawer */
  function setMenu(open) {
    const side = document.getElementById('side'); if (!side) return;
    side.classList.toggle('open', open);
    const btn = document.querySelector('[data-act=menu]'), scrim = document.querySelector('.scrim');
    if (btn) { btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', t(open ? 'shell.closeMenu' : 'shell.openMenu')); }
    if (scrim) scrim.hidden = !open;
    if (open) { const f = side.querySelector('.nav-i.on, .nav-i'); f && f.focus(); } else if (btn && side.contains(document.activeElement)) btn.focus();
  }
  document.addEventListener('click', (e) => { if (e.target.closest('#side a[href]')) setMenu(false); }, true);

  /* Global delegated events */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const a = el.dataset.act;
    if (a === 'switch') { ls.del('pl.role'); ls.del('pl.user'); state.role = null; state.user = null; location.hash = '#/login'; }
    else if (a === 'lang') {
      // RB1-01: keep unsaved form input across the re-render
      const snap = [...document.querySelectorAll('#main input[id], #main select[id], #main textarea[id]')].filter((x) => x.type !== 'file').map((x) => [x.id, x.type === 'checkbox' || x.type === 'radio' ? x.checked : x.value, x.type]);
      state.lang = state.lang === 'vi' ? 'en' : 'vi'; ls.set('pl.lang', state.lang); render();
      snap.forEach(([id, v, ty]) => { const x = document.getElementById(id); if (!x) return; if (ty === 'checkbox' || ty === 'radio') x.checked = v; else x.value = v; }); const b = document.querySelector('[data-act=lang]'); b && b.focus(); }
    else if (a === 'menu') setMenu(!document.getElementById('side').classList.contains('open'));
    else if (a === 'menu-close') setMenu(false);
    else if (a === 'skip') { e.preventDefault(); const m = document.getElementById('main'); m && m.focus(); }
    else if (a === 'toast') toast(el.dataset.msg || t('c.done'));
    else if (a === 'tab') {
      const box = el.closest('[data-tabs]');
      box.querySelectorAll('[role=tab]').forEach((b) => b.setAttribute('aria-selected', b === el ? 'true' : 'false'));
      box.querySelectorAll('[role=tabpanel]').forEach((p) => { p.hidden = p.id !== el.getAttribute('aria-controls'); });
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

  /* Tabs helper (in-block tabs): tabs(id, [[key,label,html],...]) */
  function tabs(id, list) {
    return `<div data-tabs><div class="tabs" role="tablist">${list.map(([k, l], i) => `<button role="tab" data-act="tab" id="${id}-t-${k}" aria-controls="${id}-${k}" aria-selected="${i === 0}">${esc(l)}</button>`).join('')}</div>${list.map(([k, , html], i) => `<div role="tabpanel" id="${id}-${k}" aria-labelledby="${id}-t-${k}"${i ? ' hidden' : ''}>${html}</div>`).join('')}</div>`;
  }

  /* Dates are dd/mm/yyyy strings; today = DATA.today (02/11/2026). */
  const dt = (s) => { const [d, m, y] = String(s).split('/').map(Number); return new Date(y, m - 1, d); };
  const daysTo = (s) => Math.round((dt(s) - dt(window.DATA.today)) / 864e5);
  const addDays = (s, n) => { const x = dt(s); x.setDate(x.getDate() + n); return [x.getDate(), x.getMonth() + 1].map((v) => String(v).padStart(2, '0')).join('/') + '/' + x.getFullYear(); };
  // Short vendor name: "Công ty TNHH Thiết bị Công nghiệp Đại Phong" → "Đại Phong"
  const vshort = (v) => (v ? v.name.split(' ').slice(-2).join(' ') : '');
  // Form field shared by migrated pages: field(id, label, value, {options, req, hint, err, ph, mono, type, area, mode, name})
  function field(id, label, val, o = {}) {
    const n = o.name || id.split('-').pop();
    const desc = [o.hint ? id + '-h' : '', o.err ? id + '-e' : ''].filter(Boolean).join(' ');
    const attrs = `id="${id}" name="${n}"${desc ? ` aria-describedby="${desc}"` : ''}${o.err ? ' aria-invalid="true"' : ''}${o.dis ? ' disabled' : ''}`;
    const input = o.options ? `<select ${attrs}>${o.options.map((x) => { const [v, l] = Array.isArray(x) ? x : [x, tv(x)]; return `<option value="${esc(v)}"${String(val) === String(v) ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`
      : o.area ? `<textarea ${attrs}>${esc(val)}</textarea>`
        : `<input ${attrs} value="${esc(val)}"${o.mono ? ' class="mono"' : ''}${o.type ? ` type="${o.type}"` : ''}${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.mode ? ` inputmode="${o.mode}"` : ''}>`;
    return `<div class="field"><label for="${id}">${esc(label)}${o.req ? ' *' : ''}</label>${input}${o.hint ? `<span class="hint" id="${id}-h">${esc(o.hint)}</span>` : ''}${o.err ? `<span class="err" id="${id}-e" role="alert">${esc(o.err)}</span>` : ''}</div>`;
  }

  window.App = {
    dt, daysTo, addDays, vshort,
    page(key, def) { pages[key] = def; },
    pages, state, render, esc, norm, matches, t, tv, emptyState, loading, errorState, setMenu, vnd, num, pct, ty, mid, pill, docid, table, kpi, card, tabs, toast, HOME,
    layout, block, subnav, sub, unknownSub, field, langBtn, i18n: I,
    login(role, user) { state.role = role; state.user = user || null; ls.set('pl.role', role); if (user) ls.set('pl.user', user.email); else ls.del('pl.user'); location.hash = '#/' + HOME[role]; },
    material: (id) => window.DATA.materials.find((m) => m.id === id),
    vendor: (id) => window.DATA.vendors.find((v) => v.id === id)
  };
})();
window.addEventListener('hashchange', App.render);
window.addEventListener('DOMContentLoaded', App.render);
if (document.readyState !== 'loading') App.render();
