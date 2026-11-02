/* Module 2 · Dashboard & notifications — F-05 KPIs/filters/charts, F-06 Action required + bell (R-15), F-07 tenders closing,
   F-08 price alerts by Material ID, F-09 shell search. Routes: #/dashboard, #/notifications, #/search?q= */
(function () {
  const { esc, num, pct, vnd, mid, pill, table, kpi, card } = App;
  const D = () => window.DATA;
  const CAT = { CON: 'Construction', EQP: 'Equipment', SRV: 'Services', LOG: 'Logistics' };
  const PERIODS = { ytd: ['Year to date (01–10/2026)', 0, 10], q3: ['Q3 2026', 6, 9], oct: ['October 2026', 9, 10] };
  const st = { period: 'ytd', cat: 'all' };
  // Separate filter state for Dashboard "Action required" and the notification centre (P1-12)
  const stDash = { type: 'all', show: 'all' }, stNotif = { type: 'all', show: 'all' };
  const parseD = (s) => { const [d, m, y] = s.split(' ')[0].split('/').map(Number); return new Date(y, m - 1, d); };
  const TODAY = new Date(2026, 10, 2);
  const daysTo = (s) => Math.round((parseD(s) - TODAY) / 864e5);
  const typeTone = { 'PR approval': 'info', 'PO overdue': 'danger', 'Invoice exception': 'warning', Evaluation: 'info', Tender: 'neutral', 'Price alert': 'warning', Certificate: 'danger', Delivery: 'success' };

  /* ---- price alerts: |last − avg90| / avg90 > threshold ---- */
  function priceAlerts(cat) {
    return D().materials.filter((m) => m.last && m.avg90 && (cat === 'all' || m.cat === cat))
      .map((m) => ({ m, d: ((m.last - m.avg90) / m.avg90) * 100 }))
      .filter((x) => Math.abs(x.d) > D().priceAlertThreshold).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
  }

  function notifList(items, opts = {}) {
    if (!items.length) return '<div class="empty">Nothing here. You are all caught up.</div>';
    return `<ul class="nlist">${items.map((n) => `<li class="nitem${n.read ? '' : ' unread'}">
      <span class="ndot" aria-hidden="true"></span>
      <div class="nbody"><div class="nmeta">${pill(n.type, typeTone[n.type] || 'neutral')} <span class="mono small">${esc(n.doc)}</span> <span class="muted small">· ${esc(n.at)}</span>${n.read ? '' : ' <span class="sr">Unread</span>'}</div>
        <div>${esc(n.text)}</div>${n.mats && n.mats.length ? `<div class="chips">${n.mats.map(mid).join(' ')}</div>` : ''}</div>
      <div class="nacts"><a class="btn btn-sm${n.read ? '' : ' btn-p'}" href="${esc(n.href)}" data-nopen="${n.id}">${esc(n.action)}</a>${opts.toggle ? `<button class="btn btn-sm" data-ntoggle="${n.id}">Mark ${n.read ? 'unread' : 'read'}</button>` : ''}</div></li>`).join('')}</ul>`;
  }
  function filterNotifs(st) {
    return D().notifications.filter((n) => (st.type === 'all' || n.type === st.type) && (st.show === 'all' || (st.show === 'unread' ? !n.read : n.read)));
  }
  function notifFilters(st) {
    const types = [...new Set(D().notifications.map((n) => n.type))];
    return `<div class="filters"><label class="sr" for="nf-type">Type</label><select class="inp" id="nf-type" data-nf="type"><option value="all">All types</option>${types.map((t) => `<option${st.type === t ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>
      <div class="seg" role="group" aria-label="Read state">${['all', 'unread', 'read'].map((k) => `<button data-nshow="${k}" aria-pressed="${st.show === k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div></div>`;
  }
  function wireNotifs(root, st) {
    root.addEventListener('change', (e) => { if (e.target.dataset.nf) { st.type = e.target.value; App.render(); } });
    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-ntoggle],[data-nshow],[data-nopen],[data-nall]'); if (!t) return;
      if (t.dataset.nshow) { st.show = t.dataset.nshow; App.render(); }
      else if (t.dataset.ntoggle) { const n = D().notifications.find((x) => x.id === t.dataset.ntoggle); n.read = !n.read; App.render(); }
      else if (t.dataset.nopen) { const n = D().notifications.find((x) => x.id === t.dataset.nopen); if (n) n.read = true; }
      else if (t.dataset.nall != null) { D().notifications.forEach((n) => { n.read = true; }); App.render(); App.toast('All notifications marked as read'); }
    });
  }

  /* ---------------- Dashboard ---------------- */
  function dashboard() {
    const K = D().kpi, [plabel, a, b] = PERIODS[st.period];
    const cats = st.cat === 'all' ? Object.keys(K.byCat) : [st.cat];
    const sum = (arr) => arr.reduce((s, v) => s + v, 0);
    const spendOf = (c) => sum(K.byCat[c].spend.slice(a, b));
    const spend = sum(cats.map(spendOf));
    const saving = st.cat === 'all' ? K.savingYtd * (spend / K.spendYtd) : K.byCat[st.cat].saving * (spendOf(st.cat) / sum(K.byCat[st.cat].spend));
    const savingPct = (saving / spend) * 100;
    const otif90 = st.cat === 'all' ? K.otif90 : K.byCat[st.cat].otif;
    const openPr = st.cat === 'all' ? K.openPr : K.byCat[st.cat].openPr;
    const prAw = st.cat === 'all' ? K.prAwaiting : K.byCat[st.cat].prAwaiting;
    const tenders = D().docs.filter((d) => d.type === 'TND' && !['Awarded', 'Cancelled'].includes(d.status) && (st.cat === 'all' || d.cat === st.cat));
    const unread = D().notifications.filter((n) => !n.read).length;
    const yoy = st.period === 'ytd' && st.cat === 'all' ? `+${num(((K.spendYtd - K.spendPrevYtd) / K.spendPrevYtd) * 100, 1)}% vs same period 2025` : `${esc(plabel)}`;

    const kpis = `<div class="grid-k">
      ${kpi('Spend ' + (st.period === 'ytd' ? 'YTD' : st.period === 'q3' ? 'Q3' : 'Oct'), num(spend, 1) + ' tỷ ₫', yoy + ' · excl. VAT')}
      ${kpi('Saving ' + (st.period === 'ytd' ? 'YTD' : st.period === 'q3' ? 'Q3' : 'Oct'), num(saving, 1) + ' tỷ ₫', `${pct(savingPct)} of sourced spend · target ${K.savingTarget}%`, savingPct >= K.savingTarget ? 'success' : 'warning')}
      ${kpi('OTIF 90 days', pct(otif90), `Target ${K.otifTarget}% · ${otif90 >= K.otifTarget ? num(otif90 - K.otifTarget, 1) + ' pts above' : num(K.otifTarget - otif90, 1) + ' pts below'}`, otif90 >= K.otifTarget ? 'success' : 'warning')}
      ${kpi('Open PRs', num(openPr), `<a href="#/approvals">${prAw} awaiting approval</a>`)}
      ${kpi('Active tenders', num(tenders.length), `${tenders.filter((t) => t.close && daysTo(t.close) >= 0 && daysTo(t.close) <= 6).length} closing this week`)}
    </div>`;

    const O = D().otif;
    const otifChart = card('OTIF – last 12 months', App.chart.line({ labels: O.months, values: O.values, target: O.target, targetLabel: 'Target 95%', min: 85, max: 97, fmt: (v) => pct(v), label: `OTIF by month from ${O.months[0]} to ${O.months[11]}, between ${pct(Math.min(...O.values))} and ${pct(Math.max(...O.values))}, target 95%` })
      + `<p class="muted small">On time = received ≤ promised date · In full = accepted qty ≥ scheduled qty. ${st.cat !== 'all' ? `${CAT[st.cat]} 90-day OTIF: ${pct(otif90)}.` : 'All categories.'}</p>`, `<a class="btn btn-sm" href="#/reports">OTIF report</a>`);

    const rows = Object.keys(K.byCat).map((c) => ({ label: CAT[c], value: spendOf(c), note: `${K.byCat[c].vendors} active vendors · ${pct((spendOf(c) / sum(Object.keys(K.byCat).map(spendOf))) * 100)}`, dim: st.cat !== 'all' && st.cat !== c })).sort((x, y) => y.value - x.value);
    const spendCard = card('Spend by category', App.chart.bars(rows, (v) => num(v, 1) + ' tỷ ₫') + `<p class="muted small">${esc(plabel)} · PO value excl. VAT</p>`);

    const acts = D().notifications.filter((n) => n.type !== 'Price alert' && n.type !== 'Certificate' && (stDash.type === 'all' || n.type === stDash.type) && (stDash.show === 'all' || (stDash.show === 'unread' ? !n.read : n.read)));
    const actionCard = card(`Action required`, notifFilters(stDash) + notifList(acts, { toggle: true }), `<span class="pill pill-danger">${unread} unread</span><button class="btn btn-sm" data-nall>Mark all read</button>`);

    const tCard = card('Tenders closing soon', table([
      { h: 'Tender', r: (t) => `<a class="mono" href="#/tenders">${esc(t.id)}</a><div class="small">${esc(t.title)}</div>`, w: 'minmax(200px,2fr)' },
      { h: 'Category', r: (t) => esc(CAT[t.cat]) },
      { h: 'Closes', r: (t) => `${esc(t.close)}<div class="small muted">${daysTo(t.close) <= 0 ? 'Closed' : 'in ' + daysTo(t.close) + ' days'}</div>` },
      { h: 'Bids / invited', r: (t) => `${t.bids} / ${t.invited}${t.sealed ? ' · sealed' : ''}`, cls: 'num' },
      { h: 'Status', r: (t) => pill(t.status, t.status === 'Q&A' ? 'warning' : t.status === 'Evaluation' ? 'neutral' : 'info') }
    ], tenders.filter((t) => daysTo(t.close) > 0).sort((x, y) => parseD(x.close) - parseD(y.close)).slice(0, 5), { min: 620, empty: 'No tenders closing in this category' }), '<a class="btn btn-sm" href="#/tenders">All tenders</a>');

    const al = priceAlerts(st.cat);
    const pCard = card(`Price alerts by Material ID (±${D().priceAlertThreshold}% vs 90-day avg)`, table([
      { h: 'Material ID', r: (x) => `${mid(x.m.id)}<div class="small">${esc(x.m.name)}</div>`, w: 'minmax(190px,2fr)' },
      { h: 'Last price', r: (x) => vnd(x.m.last) + `<div class="small muted">/${esc(x.m.uom)}</div>`, cls: 'num' },
      { h: '90-day avg', r: (x) => vnd(x.m.avg90), cls: 'num' },
      { h: 'Δ', r: (x) => `<span class="${x.d > 0 ? 'tone-danger' : 'tone-success'}"><b>${x.d > 0 ? '+' : '−'}${pct(Math.abs(x.d))}</b></span>`, cls: 'num', w: '90px' },
      { h: 'Last vendor · source', r: (x) => `${esc((App.vendor(x.m.lastVendor) || {}).name || '')}<div class="mono small">${esc(x.m.lastPo)}</div>`, w: 'minmax(180px,1.6fr)' }
    ], al, { min: 760, empty: 'No price alerts in this category' }) + '<p class="muted small">Prices excl. VAT.</p>', '<a class="btn btn-sm" href="#/price">Open price history</a>');

    return `<div class="page-h"><div><h1>Dashboard</h1><div class="sub">Monday, 02/11/2026 · Good morning, ${esc((App.state.user && App.state.user.name) || 'Nguyễn Minh Anh')}</div></div>
      <div class="acts"><button class="btn" data-act="toast" data-msg="Report exported: Dashboard_${st.period}_${st.cat}.xlsx">Export report</button><a class="btn btn-p" href="#/pr">New PR</a></div></div>
      <div class="filters card-flat"><div class="field inline"><label for="db-period">Period</label><select id="db-period" class="inp" data-db="period">${Object.entries(PERIODS).map(([k, [l]]) => `<option value="${k}"${st.period === k ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="field inline"><label for="db-cat">Category</label><select id="db-cat" class="inp" data-db="cat"><option value="all">All categories</option>${Object.entries(CAT).map(([k, l]) => `<option value="${k}"${st.cat === k ? ' selected' : ''}>${l}</option>`).join('')}</select></div></div>
      ${kpis}
      <div class="grid-2">${otifChart}${spendCard}</div>
      ${actionCard}
      <div class="grid">${tCard}${pCard}</div>`;
  }
  App.page('dashboard', {
    title: 'Dashboard', ws: 'procurement', roles: ['procurement', 'admin'], render: dashboard,
    mount(root) {
      root.addEventListener('change', (e) => { const k = e.target.dataset.db; if (k) { st[k] = e.target.value; App.render(); } });
      wireNotifs(root, stDash);
    }
  });

  /* ---------------- Notifications (bell panel, R-15) ---------------- */
  App.page('notifications', {
    title: 'Notifications', ws: 'procurement', roles: ['procurement', 'admin'],
    render() {
      const unread = D().notifications.filter((n) => !n.read).length;
      return `<div class="page-h"><div><h1>Notifications</h1><div class="sub">${unread} unread · in-app and Gmail</div></div>
        <div class="acts"><button class="btn" data-nall>Mark all read</button><button class="btn" data-act="toast" data-msg="Daily digest at 08:00 turned on">Daily digest</button></div></div>
        ${card('Notification centre', notifFilters(stNotif) + notifList(filterNotifs(stNotif), { toggle: true }))}
        ${card('Reminder & escalation rules', `<ul class="plain small"><li>PO unconfirmed 48 h → remind supplier · 72 h → escalate to buyer (PO-2026-0869)</li><li>Certificate / contract expiry → 60 and 30 days before</li><li>Tender closing → 24 h before</li><li>Price alert → last price differs from 90-day average by more than ±${D().priceAlertThreshold}%</li></ul>`, '<a class="btn btn-sm" href="#/admin/rules">Edit rules</a>')}`;
    },
    mount: (root) => wireNotifs(root, stNotif)
  });

  /* ---------------- Global search (F-09) ---------------- */
  App.page('search', {
    title: 'Search', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p) {
      const q = (p.q || '').trim();
      const hit = (...f) => f.some((x) => x && App.matches(x, q));
      const mats = q ? D().materials.filter((m) => hit(m.id, m.name, m.en, m.group, m.hs)) : [];
      const vens = q ? D().vendors.filter((v) => hit(v.id, v.name, v.mst, v.email, v.contact, v.cat)) : [];
      const docs = q ? D().docs.filter((d) => hit(d.id, d.title, d.status, ...(d.mats || []))) : [];
      const total = mats.length + vens.length + docs.length;
      const route = { PR: 'pr', TND: 'tenders', PO: 'po', GRN: 'po', CT: 'contracts', INV: 'invoices', NCR: 'po' };
      return `<div class="page-h"><div><h1>Search</h1><div class="sub">${q ? `${total} results for “${esc(q)}”` : 'Type a Material ID, document number, vendor or MST'}</div></div></div>
        <form class="card filters" data-act="search"><label class="sr" for="sq">Search</label><input id="sq" class="inp grow" type="search" value="${esc(q)}" placeholder="e.g. CON-24015, PO-2026-0877, Minh Phát"><button class="btn btn-p">Search</button></form>
        ${q ? `${card(`Material IDs (${mats.length})`, table([
          { h: 'Material ID', r: (m) => mid(m.id), w: '130px' }, { h: 'Description', r: (m) => `${esc(m.name)}<div class="small muted">${esc(m.en)}</div>`, w: 'minmax(200px,2fr)' },
          { h: 'UoM', k: 'uom', w: '90px' }, { h: 'Status', r: (m) => pill(m.status, m.status === 'Active' ? 'success' : m.status === 'Blocked' ? 'danger' : 'warning') }
        ], mats, { min: 560, empty: 'No Material IDs' }))}
        ${card(`Vendors (${vens.length})`, table([
          { h: 'Vendor', r: (v) => `<a href="#/vendors/${esc(v.id)}"><span class="mono small">${esc(v.id)}</span> ${esc(v.name)}</a>`, w: 'minmax(240px,2fr)' }, { h: 'Category', k: 'cat' }, { h: 'MST', r: (v) => `<span class="mono small">${esc(v.mst)}</span>` }, { h: 'Status', r: (v) => pill(v.status, v.status === 'Preferred' ? 'success' : v.status === 'Probation' ? 'warning' : v.status === 'Approved' ? 'info' : 'neutral') }
        ], vens, { min: 620, empty: 'No vendors' }), '<a class="btn btn-sm" href="#/vendors">Vendors</a>')}
        ${card(`Documents (${docs.length})`, table([
          { h: 'Number', r: (d) => `<a class="mono" href="#/${route[d.type]}${d.type === 'CT' ? '/' + d.id : ''}">${esc(d.id)}</a>`, w: '150px' }, { h: 'Title', k: 'title', w: 'minmax(200px,2fr)' }, { h: 'Date', k: 'date', w: '110px' },
          { h: 'Material IDs', r: (d) => (d.mats || []).map(mid).join(' '), w: 'minmax(160px,1.5fr)' }, { h: 'Status', r: (d) => pill(d.status, 'neutral') }
        ], docs, { min: 760, empty: 'No documents' }))}` : ''}`;
    },
    mount(root) { const i = root.querySelector('#sq'); if (i && !i.value) i.focus(); const g = document.getElementById('gsearch'); if (g) g.value = (App.state.lastQ = (location.hash.split('q=')[1] ? decodeURIComponent(location.hash.split('q=')[1]) : '')); }
  });
})();
