/* Module 11 · Purchase orders & goods receipt — F-61 list with status chips and flags, F-62 Create PO from Approved PR / Tender award / Contract release (R-03, R-16),
   F-63 detail + status bar + VAT split, F-64 delivery schedule & GRN (R-07), F-65 QC & NCR (Return / Replace / Accept with discount), F-66 3-way match summary,
   F-67 change orders with revision history, re-approval and supplier re-confirmation (R-13), F-68 cancel open quantity, F-69 printable PO (R-21) & typed attachments (R-19).
   Routes: #/po (?q=), #/po/new (?pr= | ?tender= | ?contract=; also accepted on #/po), #/po/<id>, #/po/<id>/print */
(function () {
  const { esc, num, pct, vnd, ty, mid, pill, table, kpi, card } = App;
  const S = App.src;
  const D = () => window.DATA;
  const NOW = '02/11/2026 10:30';
  const mat = (id) => App.material(id) || { id, name: id || '—', uom: '', vat: 8, vendors: [], certs: [] };
  const STEPS = ['Draft', 'Approved', 'Sent', 'Confirmed', 'Partially received', 'Closed'];
  const stepOf = (s) => (/Draft|Pending/.test(s) ? 0 : s === 'Approved' ? 1 : /^Sent/.test(s) ? 2 : s === 'Confirmed' ? 3 : /Partially|Delivered/.test(s) ? 4 : /Closed/.test(s) ? 5 : 0);
  const tone = (s) => (/Closed|Delivered|Confirmed/.test(s) ? 'success' : /not confirmed|Cancel/.test(s) ? 'danger' : /Partially|Pending|Sent/.test(s) ? 'warning' : s === 'Approved' ? 'info' : 'neutral');
  const CHIPS = ['Draft', 'Pending approval', 'Approved', 'Sent', 'Confirmed', 'Partially received', 'Delivered', 'Closed', 'Cancelled'];
  const chipOf = (s) => (/^Sent/.test(s) ? 'Sent' : /^Closed/.test(s) ? 'Closed' : s);
  const riskTone = { Low: 'success', Medium: 'warning', High: 'danger' };
  const st = { chip: 'all', q: '', vendor: 'all', site: 'all', cur: null, nf: null, nerr: {}, grn: null, gerr: {}, co: null, coErr: {}, cx: null, cxErr: {}, up: null, hold: false };

  const docs = () => D().docs.filter((d) => d.type === 'PO');
  const ncrsOf = (id) => Object.entries(D().ncrs).filter(([, n]) => n.po === id).map(([k, n]) => Object.assign({ id: k }, n));
  const openNcr = (id) => ncrsOf(id).filter((n) => n.status !== 'Closed');
  const short = (s) => String(s).split(' ·')[0].split(' (')[0];

  /* PO detail record (synthesised for older POs that only have a document row) */
  function det(id) {
    const d = S.docOf(id); if (!d || d.type !== 'PO') return null;
    if (!D().pos[id]) {
      const q = parseFloat(String(d.qty || '1').replace(/\./g, '').replace(',', '.')) || 1; const recv = /Closed|Delivered/.test(d.status);
      const g = D().docs.find((x) => x.type === 'GRN' && x.po === id);
      D().pos[id] = { vendor: d.vendor, pr: null, tender: null, contract: null, buyer: mat(d.mats[0]).owner || 'Nguyễn Minh Anh', site: d.title.split(' – ').pop(), terms: (App.vendor(d.vendor) || {}).terms || '30 days after invoice', rev: 0,
        lines: [{ mat: d.mats[0], qty: q, price: d.price || Math.round(d.value / q), sched: [[q, App.addDays(d.date, 14), recv ? (g ? g.id : 'archived') : null]] }],
        confirm: { status: 'Confirmed', by: 'Supplier (portal)', at: App.addDays(d.date, 1) }, revs: [], files: [] };
    }
    syncNcrSlots(id, D().pos[id]);
    return D().pos[id];
  }
  /* P4-03: an open NCR with action Replace / Return keeps the rejected qty open as its own schedule slot [qty, due, grn, cx, ncr] */
  function syncNcrSlots(id, p) {
    Object.entries(D().ncrs).forEach(([nid, n]) => {
      if (n.po !== id || !/Replace|Return/.test(n.action)) return;
      const li = p.lines.findIndex((l) => l.mat === n.mat); if (li < 0) return; const l = p.lines[li];
      const slot = l.sched.find((x) => x[4] === nid);
      if (n.status !== 'Closed' && !slot) { const m = /due (\d{2}\/\d{2}\/\d{4})/.exec(n.supplier || ''); n.due = n.due || (m ? m[1] : App.addDays(String(n.raised).slice(0, 10), 7)); l.sched.push([n.qty, n.due, null, null, nid]); }
      if (n.status === 'Closed' && slot && !slot[2] && !slot[3]) l.sched.splice(l.sched.indexOf(slot), 1);
    });
  }
  const openSlots = (p) => sched(p).filter((r) => !r.rec && !r.cx);
  /* Header note rebuilt from the schedule (P4-03) */
  function noteFrom(p, d) {
    const keep = /Rev\.\d pending/.exec(d.note || ''); const u = (r) => mat(r.mat).uom;
    const parts = openSlots(p).map((r) => `${num(r.qty)} ${u(r)} due ${r.due.slice(0, 5)}${r.ncr ? ` (${r.ncr})` : ''}`);
    const ncr = openNcr(d.id).map((n) => `${n.id} open · ${num(n.qty)} ${mat(n.mat).uom} rejected`);
    return parts.concat(ncr).concat(keep ? [keep[0]] : []).join(' · ');
  }
  /* Schedule rows with receipt results (OTIF uses the accepted qty, R-07) */
  function sched(p) {
    const rows = [];
    p.lines.forEach((l, li) => l.sched.forEach((s, si) => {
      const [qty, due, gid, cx, ncr] = s; const g = gid && D().grns[gid]; const gl = g && g.lines.find((x) => x[0] === li && x[1] === si);
      const arch = gid === 'archived'; const rec = !!(gl || arch);
      const delivered = arch ? qty : gl ? gl[2] : 0, accepted = arch ? qty : gl ? gl[3] : 0, rejected = gl ? gl[4] : 0;
      rows.push({ li, si, mat: l.mat, qty, due, gid, g, rec, cx, ncr, delivered, accepted, rejected, reason: gl ? gl[5] : '', date: g ? g.date : arch ? due : '', onTime: rec ? (arch || App.dt(g.date) <= App.dt(due)) : null, inFull: rec ? accepted >= qty : null });
    }));
    return rows;
  }
  const lineNet = (l) => (l.qty - (l.cancelled || 0)) * l.price;
  const value = (p) => p.lines.reduce((a, l) => a + lineNet(l), 0);
  function vatSplit(p) { const by = {}; p.lines.forEach((l) => { const r = mat(l.mat).vat; by[r] = (by[r] || 0) + lineNet(l); }); const net = Object.values(by).reduce((a, x) => a + x, 0); const vat = Object.entries(by).reduce((a, [r, x]) => a + x * r / 100, 0); return { by, net, vat, gross: net + vat }; }
  const invoicesOf = (id) => Object.entries(D().invoices).filter(([, v]) => v.po === id).map(([k, v]) => Object.assign({ id: k, doc: S.docOf(k) }, v));
  const invoicedQty = (id, l) => { let q = 0, prev = 0; invoicesOf(id).forEach((v) => v.lines.forEach((x) => { if (x[0] === l.mat) { q += x[2]; prev = Math.max(prev, x[4] || 0); } })); return q + prev; };
  const acceptedQty = (p, li) => sched(p).filter((r) => r.li === li).reduce((a, r) => a + r.accepted, 0);
  const receivedQty = (p, li) => sched(p).filter((r) => r.li === li).reduce((a, r) => a + r.delivered, 0);
  const openQty = (p, li) => sched(p).filter((r) => r.li === li && !r.rec && !r.cx).reduce((a, r) => a + r.qty, 0);
  const vlink = (vid) => { const v = App.vendor(vid); return v ? `<a href="#/vendors/${esc(v.id)}">${esc(v.name)}</a> ${pill('Risk: ' + v.risk, riskTone[v.risk] || 'neutral')}` : '—'; };
  const doclink = (id, route) => (id ? `<a class="mono" href="#/${route}/${esc(id)}">${esc(id)}</a>` : '—');
  const nextNo = (type, pre, w) => pre + String(Math.max(...D().docs.filter((d) => d.type === type && d.id.startsWith(pre)).map((d) => +d.id.slice(pre.length))) + 1).padStart(w, '0');
  const progress = (i, s) => `<ol class="steps" aria-label="PO status">${STEPS.map((x, k) => { const dn = k < i || s === 'Closed'; const cu = k === i && !dn; return `<li class="${dn ? 'done' : cu ? 'cur' : ''}"${cu ? ' aria-current="step"' : ''}><span class="st-n" aria-hidden="true">${dn ? '✓' : k + 1}</span><span class="st-l">${x}${cu && /Pending/.test(s) ? ' · pending approval' : ''}</span>${dn ? '<span class="sr"> (done)</span>' : ''}</li>`; }).join('')}</ol>`;

  /* ---------- F-61 list ---------- */
  function listPage(p) {
    if (p.q != null && p.q !== st.lastQ) { st.q = p.q; st.lastQ = p.q; st.chip = 'all'; }
    const all = docs(); all.forEach((d) => det(d.id));
    const cnt = (k) => (k === 'all' ? all.length : all.filter((d) => chipOf(d.status) === k).length);
    const vendors = [...new Set(all.map((d) => d.vendor))]; const sites = [...new Set(all.map((d) => short(det(d.id).site)))];
    const q = st.q.trim();
    const rows = all.filter((d) => { const x = det(d.id); return (st.chip === 'all' || chipOf(d.status) === st.chip) && (st.vendor === 'all' || d.vendor === st.vendor) && (st.site === 'all' || short(x.site) === st.site)
      && (!q || App.matches(`${d.id} ${d.title} ${d.mats.join(' ')} ${(App.vendor(d.vendor) || {}).name} ${x.pr || ''} ${x.tender || ''} ${x.contract || ''}`, q)); }).sort((a, b) => App.dt(b.date) - App.dt(a.date) || b.id.localeCompare(a.id));
    const notConf = all.filter((d) => (det(d.id).confirm || {}).status === 'Not confirmed'); const ncrPo = all.filter((d) => openNcr(d.id).length);
    const open = all.filter((d) => !/Closed|Cancelled|Draft/.test(d.status));
    return `<div class="page-h"><div><h1>${esc(App.t('Purchase orders'))}</h1><div class="sub">Every PO line is a Material ID · VAT per line · deliveries received against the schedule with QC</div></div>
      <div class="acts"><button class="btn" data-act="toast" data-msg="Exported PO_02-11-2026.xlsx (${rows.length} rows)">Export Excel</button><a class="btn btn-p" href="#/po/new">New PO</a></div></div>
      <div class="grid-k">${kpi('Purchase orders', num(D().poStats.total), `${all.length} in this sample`)}${kpi('Open value', ty(open.reduce((a, d) => a + d.value, 0)), `${open.length} open POs · excl. VAT`)}${kpi('Not confirmed', String(notConf.length), notConf.map((d) => d.id).join(', ') || 'None', notConf.length ? 'danger' : '')}${kpi('Open NCR', String(ncrPo.length), ncrPo.map((d) => d.id).join(', ') || 'None', ncrPo.length ? 'warning' : '')}</div>
      <div class="seg seg-wrap" role="group" aria-label="Status">${[['all', 'All']].concat(CHIPS.map((c) => [c, c])).map(([k, l]) => `<button data-po="chip" data-k="${esc(k)}" aria-pressed="${st.chip === k}">${esc(l)} (${cnt(k)})</button>`).join('')}</div>
      ${card('Purchase orders', `<div class="filters"><label class="sr" for="po-q">Search POs</label><input class="inp grow" id="po-q" type="search" data-pof="q" value="${esc(st.q)}" placeholder="Search PO, vendor, Material ID, PR or tender">
        <label class="sr" for="po-v">Vendor</label><select class="inp" id="po-v" data-pof="vendor"><option value="all">All vendors</option>${vendors.map((v) => `<option value="${esc(v)}"${st.vendor === v ? ' selected' : ''}>${esc(App.vshort(App.vendor(v)))}</option>`).join('')}</select>
        <label class="sr" for="po-s">Delivery site</label><select class="inp" id="po-s" data-pof="site"><option value="all">All sites</option>${sites.map((v) => `<option${st.site === v ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select></div>
        ${table([
          { h: 'PO', r: (d) => `<a class="mono" href="#/po/${esc(d.id)}">${esc(d.id)}</a>${det(d.id).rev ? ` <span class="small muted">Rev.${det(d.id).rev}</span>` : ''}<div class="small">${esc(d.title)}</div>`, w: 'minmax(220px,2.2fr)' },
          { h: 'Vendor', r: (d) => `${esc(App.vshort(App.vendor(d.vendor)))}<div class="small muted">${esc(d.date)}</div>`, w: 'minmax(130px,1.2fr)' },
          { h: 'Material IDs', r: (d) => `<span class="chips chips-inline">${d.mats.map(mid).join('')}</span>`, w: 'minmax(150px,1.5fr)' },
          { h: 'Source', r: (d) => { const x = det(d.id); return x.tender ? S.tndLink(x.tender) : x.contract ? doclink(x.contract, 'contracts') : x.pr ? S.prLink(x.pr) : '—'; }, w: '130px' },
          { h: 'Value excl. VAT', r: (d) => vnd(d.value), cls: 'num', w: '150px' },
          { h: 'Status', r: (d) => { const x = det(d.id); return `${pill(d.status, tone(d.status))}${(x.confirm || {}).status === 'Not confirmed' ? `<div class="mt-s">${pill('Not confirmed · 3 days', 'danger')}</div>` : ''}${openNcr(d.id).length ? `<div class="mt-s">${pill('NCR open', 'warning')}</div>` : ''}`; }, w: 'minmax(170px,1.4fr)' }
        ], rows, { min: 980, empty: 'No POs match these filters', label: 'Purchase orders' })}`)}`;
  }

  /* ---------- F-62 create PO ---------- */
  const approvedVendors = (m) => mat(m).vendors.filter((v) => v[1] !== 'Blocked').map((v) => v[0]);
  const awardedTenders = () => D().docs.filter((d) => d.type === 'TND' && D().tenders[d.id] && D().tenders[d.id].award && D().tenders[d.id].award.status === 'Approved');
  const activeCts = () => D().contracts.filter((c) => ['Active', 'Expiring'].includes((S.docOf(c.id) || {}).status));
  function build(src, ref, vendor) {
    const f = { src, ref, vendor: vendor || '', site: '', terms: '', lines: [], ack: false, note: '' };
    if (src === 'pr' && D().prs[ref]) {
      const pr = D().prs[ref]; f.site = pr.site; f.lines = pr.lines.map((l) => ({ mat: l.mat, qty: l.qty, price: l.price, due: pr.need }));
      f.vendor = vendor || (mat(pr.lines[0].mat).vendors.find((v) => v[1] === 'Preferred') || mat(pr.lines[0].mat).vendors[0] || [''])[0];
      if (ref === 'PR-2026-0436') f.vendor = vendor || 'V-1004';
    } else if (src === 'tender' && D().tenders[ref]) {
      const t = D().tenders[ref]; const a = t.award; const pr = t.pr && D().prs[t.pr]; f.site = pr ? pr.site : 'Nhà xưởng C2';
      if (!a || a.status !== 'Approved') { f.err = 'Award for ' + ref + ' is not approved yet — Create PO is available after approval.'; f.terms = ''; return f; }
      if (a.pick && t.bidders) { const vs = [...new Set(a.pick)]; f.vendor = vs.includes(vendor) ? vendor : vs[0]; const b = t.bidders.find((x) => x.vid === f.vendor); f.lines = t.lines.map((l, i) => ({ mat: l.mat, qty: l.qty, price: b.prices[i], due: t.delivery, keep: a.pick[i] === f.vendor })).filter((l) => l.keep); f.vendors = vs; }
      else { f.vendor = a.vendor; const tq = t.lines.reduce((s, l) => s + l.qty, 0); f.lines = t.lines.map((l) => ({ mat: l.mat, qty: l.qty, price: Math.round(a.value / tq), due: t.delivery })); }
      const prior = docs().filter((d) => { const x = D().pos[d.id]; return x && !/Cancelled|Draft/.test(d.status) && x.tender === ref && x.vendor === f.vendor; });
      if (prior.length) { f.lines.forEach((l) => { const used = prior.reduce((s, d) => s + D().pos[d.id].lines.filter((x) => x.mat === l.mat).reduce((a, x) => a + x.qty - (x.cancelled || 0), 0), 0); l.qty = Math.max(0, l.qty - used); });
        if (f.lines.every((l) => !(+l.qty > 0))) f.err = 'Award fully ordered on ' + prior.map((d) => d.id).join(', ') + '.'; }
    } else if (src === 'contract') {
      const c = D().contracts.find((x) => x.id === ref);
      if (c) { f.vendor = c.vendor; f.site = 'Kho B · KCN Tân Uyên, Bình Dương'; f.lines = c.lines.map((l) => ({ mat: l.mat, qty: '', price: l.q4, due: App.addDays(D().today, 7), ceiling: l.q4, left: l.commit - l.released })); }
    }
    f.terms = ((App.vendor(f.vendor) || {}).terms || '30 days').split(' ·')[0].replace(/^(\d+) days$/, '$1 days after invoice');
    return f;
  }
  const existingFor = (f) => docs().filter((d) => { const x = D().pos[d.id]; return x && d.status !== 'Cancelled' && ((f.src === 'pr' && x.pr === f.ref) || (f.src === 'tender' && x.tender === f.ref && x.vendor === f.vendor)); });
  function initNew(p, sub) {
    const draft = sub && sub !== 'new' ? sub : null;
    if (draft) { const x = det(draft); const f = build(x.pr ? 'pr' : x.tender ? 'tender' : x.contract ? 'contract' : 'pr', x.pr || x.tender || x.contract || '', x.vendor); f.id = draft; f.err = null; f.site = x.site; f.terms = x.terms; f.lines = x.lines.map((l) => ({ mat: l.mat, qty: l.qty, price: l.price, due: l.sched[0][1] })); return f; }
    const src = p.tender ? 'tender' : p.contract ? 'contract' : 'pr';
    const ref = p.tender || p.contract || p.pr || 'PR-2026-0436';
    const f = build(src, ref);
    const ex = existingFor(f).find((d) => d.status === 'Draft'); if (ex) f.id = ex.id;
    return f;
  }
  function priceCheck(l) {
    const m = mat(l.mat); const ref = m.last || m.avg90; if (!ref || !(+l.price > 0)) return '';
    const d = (l.price - ref) / ref * 100; const d90 = m.avg90 ? (l.price - m.avg90) / m.avg90 * 100 : null;
    const sg = (x) => `${x > 0 ? '+' : x < 0 ? '−' : '±'}${pct(Math.abs(x))}`;
    return `<span class="${Math.abs(d) > D().priceAlertThreshold ? 'tone-danger' : d <= 0 ? 'tone-success' : ''}">${sg(d)} vs last ${vnd(m.last || ref)}</span>${d90 != null ? `<div class="small muted">${sg(d90)} vs 90-day avg</div>` : ''}${l.ceiling && l.price > l.ceiling ? '<div class="small tone-danger">Above the contract price</div>' : ''}`;
  }
  function newPage() {
    const f = st.nf; const e = st.nerr; const v = App.vendor(f.vendor);
    const id = f.id || nextNo('PO', 'PO-2026-', 4);
    const tmp = { lines: f.lines.map((l) => ({ mat: l.mat, qty: +l.qty || 0, price: +l.price || 0 })) }; const tt = vatSplit(tmp);
    const ex = existingFor(f).filter((d) => d.id !== f.id);
    const prOpts = D().docs.filter((d) => d.type === 'PR' && D().prs[d.id]).map((d) => [d.id, `${d.id} · ${d.title}${d.status === 'Approved' ? '' : ' — ' + d.status + ' (not selectable)'}`, d.status !== 'Approved']);
    const refOpts = f.src === 'pr' ? prOpts : f.src === 'tender' ? awardedTenders().map((d) => [d.id, `${d.id} · ${d.title}`]).concat(awardedTenders().some((d) => d.id === f.ref) || !f.ref ? [] : [[f.ref, `${f.ref} — award not approved (not selectable)`, true]]) : activeCts().map((c) => [c.id, `${c.id} · ${(S.docOf(c.id) || {}).title}`]);
    const vendOpts = f.src === 'pr' ? [...new Set(f.lines.flatMap((l) => approvedVendors(l.mat)))].concat(D().vendors.filter((x) => x.risk === 'High').map((x) => x.id)) : f.vendors || [f.vendor];
    const blockedFor = f.lines.filter((l) => mat(l.mat).vendors.some((x) => x[0] === f.vendor && x[1] === 'Blocked')).map((l) => l.mat);
    const route = tt.net > 2000000000 ? ['Procurement Lead', 'Finance Director'] : ['Procurement Lead'];
    const lineRows = f.lines.map((l, i) => { const m = mat(l.mat); const err = e['l' + i];
      return `<div class="tr po-cols" role="row"><div class="td" role="cell">${mid(l.mat)}<div class="small">${esc(m.name)}</div>${err ? `<div class="err small" id="pn-e${i}" role="alert">${esc(err)}</div>` : ''}</div>
        <div class="td num" role="cell"><label class="sr" for="pn-q${i}">Quantity line ${i + 1}</label><input class="inp inp-num w-full" id="pn-q${i}" data-pn="qty" data-i="${i}" inputmode="decimal" value="${esc(l.qty)}"${err ? ` aria-invalid="true" aria-describedby="pn-e${i}"` : ''}> <span class="small muted">${esc(m.uom)}</span>${l.left != null ? `<div class="small muted">Contract left ${num(l.left)}</div>` : ''}</div>
        <div class="td num" role="cell"><label class="sr" for="pn-p${i}">Unit price line ${i + 1}</label><input class="inp inp-num w-full" id="pn-p${i}" data-pn="price" data-i="${i}" inputmode="numeric" value="${esc(l.price === '' ? '' : num(l.price))}"${f.src !== 'pr' ? ' readonly aria-readonly="true"' : ''}></div>
        <div class="td" role="cell">${esc(S.vatLabel(m.vat))}</div><div class="td num" role="cell">${vnd((+l.qty || 0) * (+l.price || 0))}<div class="small muted">VAT ${vnd((+l.qty || 0) * (+l.price || 0) * m.vat / 100)}</div></div>
        <div class="td" role="cell"><label class="sr" for="pn-d${i}">Delivery date line ${i + 1}</label><input class="inp w-full" id="pn-d${i}" data-pn="due" data-i="${i}" value="${esc(l.due)}" placeholder="dd/mm/yyyy"></div>
        <div class="td small" role="cell">${priceCheck(l)}</div></div>`; }).join('');
    const linesTbl = `<div class="tbl-wrap" tabindex="0" role="region" aria-label="PO lines, scrolls horizontally"><div class="tbl tbl-1100" role="table"><div class="tr thead po-cols" role="row"><div class="th">Material ID</div><div class="th num">Qty</div><div class="th num">Unit price excl. VAT</div><div class="th">VAT</div><div class="th num">Amount excl. VAT</div><div class="th">Delivery date</div><div class="th">Price check</div></div>${lineRows || '<div class="empty">Choose a source to fill the lines</div>'}</div></div>`;
    const form = card(`PO · ${id}${f.id ? ' (draft)' : ''}`, `<form id="po-new" class="stack" novalidate>${e._ ? `<div class="alert alert-danger" role="alert">${esc(e._)}</div>` : ''}
      <fieldset class="fs"><legend>Source</legend><div class="seg" role="group" aria-label="Source">${[['pr', 'Approved PR'], ['tender', 'Tender award'], ['contract', 'Contract release']].map(([k, l]) => `<button type="button" data-po="src" data-k="${k}" aria-pressed="${f.src === k}">${l}</button>`).join('')}</div></fieldset>
      <div class="form-grid"><div class="field"><label for="pn-ref">${f.src === 'pr' ? 'Purchase request' : f.src === 'tender' ? 'Awarded tender' : 'Contract'}</label><select id="pn-ref" name="ref" data-pn="ref"${e.ref ? ' aria-invalid="true" aria-describedby="pn-ref-e"' : ''}>${refOpts.length ? refOpts.map(([k, l, dis]) => `<option value="${esc(k)}"${f.ref === k ? ' selected' : ''}${dis ? ' disabled' : ''}>${esc(l)}</option>`).join('') : '<option value="">None available</option>'}</select>${e.ref ? `<span class="err" id="pn-ref-e" role="alert">${esc(e.ref)}</span>` : ''}<span class="hint">${f.src === 'pr' ? 'Only approved PRs can be selected' : f.src === 'tender' ? 'Tenders whose award is approved' : 'Active contracts · price may not exceed the contract price'}</span></div>
        <div class="field"><label for="pn-vendor">Vendor</label><select id="pn-vendor" name="vendor" data-pn="vendor"${f.src === 'contract' ? ' disabled' : ''}>${[...new Set(vendOpts)].map((x) => { const vv = App.vendor(x); return vv ? `<option value="${esc(x)}"${f.vendor === x ? ' selected' : ''}>${esc(App.vshort(vv))} · risk ${esc(vv.risk)} · ${esc(vv.status)}</option>` : ''; }).join('')}</select><span class="hint">${v ? `Risk index: ${esc(v.risk)} · OTIF ${v.otif != null ? pct(v.otif) : '—'} · score ${v.score != null ? num(v.score, 2) : '—'}` : ''}</span></div>
        ${S.field('pn', e, 'site', 'Ship-to / delivery site', f.site, { req: true })}${S.field('pn', e, 'terms', 'Payment terms', f.terms, { hint: 'Defaults to the vendor terms' })}</div>
      ${v && v.risk === 'High' ? `<div class="alert alert-warning" role="alert"><b>High-risk vendor.</b> ${esc(v.name)}: ${(v.riskReasons || []).map(esc).join(' · ')}.<label class="chk mt-s"><input type="checkbox" name="ack" value="1"${f.ack ? ' checked' : ''}${e.ack ? ' aria-invalid="true" aria-describedby="pn-ack-e"' : ''}> I have reviewed the risk and want to continue</label>${e.ack ? `<span class="err" id="pn-ack-e" role="alert">${esc(e.ack)}</span>` : ''}</div>` : ''}
      ${blockedFor.length ? `<div class="alert alert-danger" role="alert">${esc(v ? v.name : '')} is blocked for ${blockedFor.map(esc).join(', ')} (certificate). Choose another vendor.</div>` : ''}
      ${ex.length ? `<div class="alert alert-info" role="status">Already issued from this source: ${ex.map((d) => `<a class="mono" href="#/po/${esc(d.id)}">${esc(d.id)}</a> (${esc(d.status)})`).join(', ')}.</div>` : ''}
      ${f.err ? `<div class="alert alert-warning" role="alert">${esc(f.err)}</div>` : ''}
      <h3 class="h-sub">Lines (${f.lines.length})</h3>${linesTbl}
      <dl class="dl mt">${Object.entries(tt.by).sort((a, b) => b[0] - a[0]).map(([r, x]) => `<dt>VAT ${esc(S.vatLabel(r))} on</dt><dd>${vnd(x)} + VAT ${vnd(x * r / 100)}</dd>`).join('')}<dt>Total excl. VAT</dt><dd><b>${vnd(tt.net)}</b></dd><dt>Total incl. VAT</dt><dd><b>${vnd(tt.gross)}</b></dd></dl>
      <div class="row-acts"><a class="btn" href="#/po">Cancel</a><button type="button" class="btn" data-po="save-draft"${f.err ? ' disabled' : ''}>Save draft</button><button type="submit" class="btn btn-p"${f.err ? ' disabled aria-disabled="true"' : ''}>Submit for approval</button></div></form>`);
    const side = card('Approval route', `<ol class="chain">${route.map((r, i) => `<li><span class="small muted">Step ${i + 1} of ${route.length}</span><b>${r}</b><span class="small">${r === 'Procurement Lead' ? (S.me() === 'Nguyễn Minh Anh' ? 'Đỗ Hoàng Nam (SoD: you are the buyer)' : 'Nguyễn Minh Anh') : 'Đỗ Hoàng Nam'}</span></li>`).join('')}</ol>
      <p class="small muted">${vnd(tt.net)} excl. VAT · ${tt.net > 2000000000 ? '> 2 tỷ adds the Finance Director' : '≤ 2 tỷ ₫: Procurement Lead'}. Dept head approval is carried from the PR. After approval: Send to supplier (Gmail + portal), confirmation within 48 h.</p>`)
      + card('Price check', `<p class="small mt-0">Each line is compared with the last PO price and the 90-day average of its Material ID (excl. VAT). A difference above ±${D().priceAlertThreshold}% raises a price alert.</p>`);
    return `<div class="page-h"><div><div class="crumbs small muted"><a href="#/po">Purchase orders</a> / ${f.id ? esc(f.id) : 'New'}</div><h1>${f.id ? `Create PO · draft <span class="mono">${esc(f.id)}</span>` : 'Create PO'}</h1><div class="sub">Lines inherit Material ID, VAT and reference price from the source · buyer ${esc(S.me())}</div></div></div>
      <div class="grid-2"><div class="stack">${form}</div><div class="stack">${side}</div></div>`;
  }
  function readNew(root) {
    const f = st.nf; const x = S.read(root, '#po-new .form-grid'); f.site = x.site; f.terms = x.terms; if (x.vendor) f.vendor = x.vendor;
    const ack = root.querySelector('#po-new [name=ack]'); f.ack = !!(ack && ack.checked);
    root.querySelectorAll('[data-pn=qty],[data-pn=price],[data-pn=due]').forEach((el) => { const l = f.lines[+el.dataset.i]; const k = el.dataset.pn; if (k === 'qty') l.qty = el.value.replace(',', '.').trim(); else if (k === 'price') l.price = el.value === '' ? '' : S.money(el.value); else l.due = el.value.trim(); });
  }
  function saveNew(root, submit) {
    readNew(root); const f = st.nf; const e = {}; const v = App.vendor(f.vendor);
    if (f.err) { st.nerr = { _: f.err }; App.render(); return; }
    if (!f.lines.length) e._ = 'No lines — choose a source.';
    if (f.src === 'pr' && (S.docOf(f.ref) || {}).status !== 'Approved') e.ref = 'Only an approved PR can be used.';
    f.lines.forEach((l, i) => { const m = mat(l.mat);
      if (!(+l.qty > 0)) e['l' + i] = 'Enter a quantity above 0.'; else if (l.left != null && +l.qty > l.left) e['l' + i] = `Only ${num(l.left)} ${m.uom} left on the contract.`;
      else if (!(+l.price > 0)) e['l' + i] = 'Enter a unit price above 0.'; else if (l.ceiling && +l.price > l.ceiling) e['l' + i] = 'The price may not exceed the contract price.';
      else if (submit && (!S.validDate(l.due) || App.daysTo(l.due) <= 0)) e['l' + i] = 'Delivery date: dd/mm/yyyy after today.';
      if (m.vendors.some((x) => x[0] === f.vendor && x[1] === 'Blocked')) e._ = `${v.name} is blocked for ${l.mat}.`; });
    if (submit && !f.site) e.site = 'Enter the delivery site.';
    if (submit && v && v.risk === 'High' && !f.ack) e.ack = 'Confirm that you reviewed the high-risk vendor.';
    st.nerr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#po-new'); return; }
    const id = f.id || nextNo('PO', 'PO-2026-', 4);
    const lines = f.lines.map((l) => ({ mat: l.mat, qty: +l.qty, price: +l.price, sched: [[+l.qty, l.due || App.addDays(D().today, 14), null]] }));
    const p = { vendor: f.vendor, pr: f.src === 'pr' ? f.ref : (f.src === 'tender' && D().tenders[f.ref].pr) || null, tender: f.src === 'tender' ? f.ref : null, contract: f.src === 'contract' ? f.ref : null, buyer: S.me(), site: f.site, terms: f.terms, rev: 0, lines, confirm: null, revs: [], files: (D().pos[id] || {}).files || [] };
    D().pos[id] = p; const net = value(p);
    let d = S.docOf(id); const m0 = mat(lines[0].mat);
    const title = `${m0.name}${lines.length > 1 ? ` + ${lines.length - 1}` : ''} – ${short(f.site)}`;
    if (!d) { d = { id, type: 'PO', title, date: D().today, status: 'Draft', mats: [], vendor: f.vendor, qty: '', price: 0, value: 0 }; D().docs.push(d); }
    Object.assign(d, { vendor: f.vendor, mats: [...new Set(lines.map((l) => l.mat))], qty: `${num(lines[0].qty)} ${m0.uom}`, price: lines[0].price, value: net });
    if (submit) {
      d.status = 'Pending approval'; const lead = S.me() === 'Nguyễn Minh Anh' ? 'Đỗ Hoàng Nam' : 'Nguyễn Minh Anh'; const n = net > 2000000000 ? 2 : 1;
      D().approvals = D().approvals.filter((a) => a.id !== id);
      D().approvals.push({ id, type: 'PO approval', title: d.title, mats: d.mats, value: net, by: S.me(), step: 'Step 1 of ' + n, sla: App.addDays(D().today, 2) + ' 17:00', assignee: lead });
      D().approvalChains[id] = [[`${S.me()} · Buyer`, 'Submitted', NOW, ''], [`${lead} · Procurement Lead`, 'Waiting', 'SLA 2 working days', '']].concat(n > 1 ? [['Đỗ Hoàng Nam · Finance Director', 'Next', '', '']] : []);
      p.revs = [{ no: 0, status: 'Current', at: NOW, by: S.me(), diff: 'Original issue from ' + f.ref, reason: '' }];
    }
    st.nf = null; st.cur = null; const h = '#/po/' + id; if (location.hash === h) App.render(); else location.hash = h;
    App.toast(submit ? `${id} submitted · ${vnd(net)} excl. VAT → Procurement Lead approval` : `${id} saved as draft`);
  }

  /* ---------- F-63..F-69 detail ---------- */
  function linesCard(id, p) {
    const tt = vatSplit(p);
    return card(`Lines by Material ID (${p.lines.length})`, table([
      { h: 'Material ID', r: (l) => `${mid(l.mat)}<div class="small">${esc(mat(l.mat).name)}</div>`, w: 'minmax(160px,2fr)' },
      { h: 'Qty', r: (l) => `<span class="nowrap">${num(l.qty)} ${esc(mat(l.mat).uom)}</span>${l.cancelled ? `<div class="small tone-danger">−${num(l.cancelled)} cancelled</div>` : ''}`, cls: 'num', w: '120px' },
      { h: 'Unit price excl. VAT', r: (l) => vnd(l.price), cls: 'num', w: '130px' },
      { h: 'VAT', r: (l) => esc(S.vatLabel(mat(l.mat).vat)), w: 'minmax(64px,.6fr)' },
      { h: 'VAT amount', r: (l) => vnd(lineNet(l) * mat(l.mat).vat / 100), cls: 'num', w: '125px' },
      { h: 'Amount excl. VAT', r: (l) => vnd(lineNet(l)), cls: 'num', w: '140px' }
    ], p.lines, { min: 700, label: 'PO lines' }) + `<dl class="dl dl-tot mt">${Object.entries(tt.by).sort((a, b) => b[0] - a[0]).map(([r, x]) => `<dt>VAT ${esc(S.vatLabel(r))}</dt><dd>${vnd(x)} + VAT ${vnd(x * r / 100)}</dd>`).join('')}<dt class="tot">Total incl. VAT</dt><dd class="tot"><b>${vnd(tt.gross)}</b><div class="small muted">${vnd(tt.net)} + VAT ${vnd(tt.vat)}</div></dd></dl>`);
  }
  function schedCard(id, p, d) {
    const rows = sched(p);
    const canRecv = /Sent|Confirmed|Partially/.test(d.status) && rows.some((r) => !r.rec && !r.cx);
    const grns = [...new Set(rows.filter((r) => r.g).map((r) => r.gid))];
    const gBlocks = grns.map((gid) => { const g = D().grns[gid];
      return `<li><b class="mono">${esc(gid)}</b> <span class="small muted">· ${esc(g.date)} · receiver ${esc(g.receiver)} · inspector ${esc(g.inspector)}${g.ses ? ` · SLA ${pct(g.sla[0])} vs target ${pct(g.sla[1])}` : ''}</span>
        <div class="chips">${g.checks.map(([n, ok, note]) => pill(`${n}: ${ok ? 'OK' : 'Missing'}`, ok ? 'success' : 'danger') + (note ? ` <span class="small muted">${esc(note)}</span>` : '')).join(' ')}</div>${g.lines.filter((x) => x[4]).map((x) => `<div class="small tone-danger">Rejected ${num(x[4])} ${esc(mat(p.lines[x[0]].mat).uom)} — ${esc(x[5])}${g.ncr ? ` → ${esc(g.ncr)}` : ''}</div>`).join('')}</li>`; }).join('');
    return card('Delivery schedule & goods receipt', table([
      { h: 'Material ID', r: (r) => mid(r.mat), w: '120px' },
      { h: 'Scheduled', r: (r) => `${num(r.qty)} ${esc(mat(r.mat).uom)}`, cls: 'num', w: '100px' },
      { h: 'Promised', r: (r) => `${esc(r.due)}${r.ncr ? `<div class="small muted">${esc(r.ncr)}</div>` : ''}${r.cx ? `<div>${pill('Cancelled', 'danger')}</div>` : ''}`, w: '110px' },
      { h: 'GRN', r: (r) => (r.g ? `<span class="mono">${esc(r.gid)}</span><div class="small muted">${esc(r.date)}</div>` : r.rec ? '<span class="small muted">Archived</span>' : r.cx ? '—' : `<span class="small muted">${App.daysTo(r.due) < 0 ? 'Late · not received' : 'Open'}</span>`), w: '130px' },
      { h: 'Received · accepted · rejected', r: (r) => (r.rec ? `${num(r.delivered)} · <b>${num(r.accepted)}</b> · ${r.rejected ? `<span class="tone-danger">${num(r.rejected)}</span>` : '0'}` : '—'), cls: 'num', w: '180px' },
      { h: 'On time', r: (r) => (r.onTime == null ? '—' : pill(r.onTime ? 'Yes' : 'No', r.onTime ? 'success' : 'danger')), w: '90px' },
      { h: 'In full', r: (r) => (r.inFull == null ? '—' : pill(r.inFull ? 'Yes' : 'No', r.inFull ? 'success' : 'danger')), w: '90px' }
    ], rows, { min: 880, label: 'Delivery schedule' })
      + `<p class="small muted">OTIF: a delivery is on time when received ≤ promised date (as last accepted by the buyer, incl. revisions) and in full when the <b>accepted</b> qty ≥ scheduled qty.</p>${gBlocks ? `<h3 class="h-sub">Receipts & inspection</h3><ul class="plain grn-list">${gBlocks}</ul>` : ''}${st.grn ? grnForm(p, rows) : ''}`,
    canRecv && !st.grn ? '<button class="btn btn-sm btn-p" data-po="grn-open">Record goods receipt</button>' : '');
  }
  function grnForm(p, rows) {
    const f = st.grn; const e = st.gerr; const open = rows.filter((r) => !r.rec && !r.cx); const r = open.find((x) => `${x.li}:${x.si}` === f.slot) || open[0]; const m = mat(r.mat);
    const docsReq = m.certs.filter((c) => /GRN/.test(c[1])).map((c) => c[0]).concat(r.mat === 'CON-24015' || r.mat === 'CON-24020' ? ['Mill certificate'] : []).concat(['Biên bản giao nhận']);
    return `<form id="po-grn" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">Record goods receipt</h3>
      ${S.me() === p.buyer ? '<div class="alert alert-warning" role="status"><b>SoD warning:</b> you are the buyer of this PO. PO buyer ≠ GRN receiver is a warn rule — the receipt is allowed and logged.</div>' : ''}
      <div class="form-grid">${S.field('pg', e, 'slot', 'Scheduled delivery', `${r.li}:${r.si}`, { options: open.map((x) => [`${x.li}:${x.si}`, `${x.mat} · ${num(x.qty)} ${mat(x.mat).uom} · promised ${x.due}${x.ncr ? ' · replacement for ' + x.ncr : ''}`]) })}
        ${S.field('pg', e, 'date', 'Received on', f.date, { req: true, ph: 'dd/mm/yyyy' })}
        ${S.field('pg', e, 'delivered', `Delivered (${m.uom})`, f.delivered, { req: true, mode: 'decimal' })}${S.field('pg', e, 'accepted', `Accepted (${m.uom})`, f.accepted, { req: true, mode: 'decimal', hint: 'Accepted + rejected = delivered' })}
        ${S.field('pg', e, 'rejected', `Rejected (${m.uom})`, f.rejected, { mode: 'decimal' })}${S.field('pg', e, 'inspector', 'Inspector (QC)', f.inspector, { req: true })}
        ${S.field('pg', e, 'reason', 'Rejection reason', f.reason, { area: true, hint: 'Required when a quantity is rejected, e.g. "Xi măng ẩm, vón cục · 2 tấn"' })}
        ${S.field('pg', e, 'action', 'NCR action (if rejected)', f.action, { options: ['Return to vendor', 'Replace', 'Accept with discount'] })}${S.field('pg', e, 'discount', 'Discount % (Accept with discount)', f.discount, { mode: 'decimal' })}</div>
      <fieldset class="fs"${e.checks ? ' aria-describedby="pg-checks-e"' : ''}><legend>Quality documents checked</legend>${docsReq.map((c) => `<label class="chk"><input type="checkbox" name="checks" value="${esc(c)}"${(f.checks || []).includes(c) ? ' checked' : ''}> ${esc(c)}${c !== 'Biên bản giao nhận' ? ' (required by ' + esc(r.mat) + ')' : ''}</label>`).join('')}${e.checks ? `<span class="err" id="pg-checks-e" role="alert">${esc(e.checks)}</span>` : ''}</fieldset>
      <div class="row-acts"><button type="button" class="btn btn-sm" data-po="grn-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Save GRN</button></div></form>`;
  }
  function saveGrn(root, id, p, d) {
    const f = Object.assign(st.grn, S.read(root, '#po-grn')); f.checks = f.checks || []; const e = {};
    const rows = sched(p).filter((x) => !x.rec && !x.cx); const r = rows.find((x) => `${x.li}:${x.si}` === f.slot) || rows[0]; const m = mat(r.mat);
    const n = (s) => Number(String(s || '0').replace(',', '.'));
    const dl = n(f.delivered), ac = n(f.accepted), rj = n(f.rejected);
    if (!S.validDate(f.date)) e.date = 'Use dd/mm/yyyy.'; else if (App.daysTo(f.date) > 0) e.date = 'Cannot be in the future.';
    if (!(dl > 0)) e.delivered = 'Enter the delivered quantity.'; else if (dl > r.qty * 1.1) e.delivered = `More than 10% over the scheduled ${num(r.qty)} ${m.uom}.`;
    if (!(ac >= 0) || ac + rj !== dl) e.accepted = 'Accepted + rejected must equal delivered.';
    if (rj > 0 && (f.reason || '').length < 5) e.reason = 'Give the rejection reason.';
    if (rj > 0 && f.action === 'Accept with discount' && !(n(f.discount) > 0 && n(f.discount) <= 30)) e.discount = 'Enter a discount of 1–30%.';
    if (!f.inspector) e.inspector = 'Enter the inspector.';
    const req = m.certs.filter((c) => /GRN/.test(c[1])).map((c) => c[0]).concat(r.mat === 'CON-24015' || r.mat === 'CON-24020' ? ['Mill certificate'] : []);
    const miss = req.filter((c) => !f.checks.includes(c)); if (ac > 0 && miss.length) e.checks = `Check ${miss.join(', ')} before accepting (required by ${r.mat}).`;
    st.gerr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#po-grn'); return; }
    const gid = nextNo('GRN', 'GRN-2026-', 4);
    const g = { po: id, date: f.date, receiver: S.me(), inspector: f.inspector, lines: [[r.li, r.si, dl, ac, rj, f.reason || '']], checks: req.concat(['Biên bản giao nhận']).map((c) => [c, f.checks.includes(c), f.checks.includes(c) ? 'Checked' : 'Not checked']) };
    let msg = `${gid} saved · ${num(ac)} ${m.uom} accepted`;
    if (rj > 0) {
      const nid = nextNo('NCR', 'NCR-2026-', 3); g.ncr = nid;
      D().ncrs[nid] = { grn: gid, po: id, mat: r.mat, qty: rj, action: f.action, discount: f.action === 'Accept with discount' ? n(f.discount) : null, raised: NOW, by: f.inspector, supplier: 'Sent to supplier by Gmail + portal · answer due ' + App.addDays(D().today, 3), status: 'Open', due: App.addDays(D().today, 3) };
      D().docs.push({ id: nid, type: 'NCR', title: `${m.name} · ${num(rj)} ${m.uom} rejected`, date: D().today, status: 'Open', mats: [r.mat], vendor: p.vendor, po: id });
      msg += ` · ${nid} created (${f.action}) and sent to the supplier`;
    }
    D().grns[gid] = g; p.lines[r.li].sched[r.si][2] = gid;
    if (r.ncr && !rj && D().ncrs[r.ncr]) { const nn = D().ncrs[r.ncr]; nn.status = 'Closed'; nn.supplier += ' · replaced on ' + gid; const nd = S.docOf(r.ncr); if (nd) nd.status = 'Closed · replaced'; msg += ` · ${r.ncr} closed (replacement received)`; }
    syncNcrSlots(id, p);
    D().docs.push({ id: gid, type: 'GRN', title: `${m.name} · ${num(ac)} ${m.uom} accepted`, date: f.date, status: rj ? 'Accepted with NCR' : 'Accepted', mats: [r.mat], vendor: p.vendor, po: id });
    d.status = openSlots(p).length ? 'Partially received' : 'Delivered'; d.note = noteFrom(p, d);
    st.grn = null; App.render(); App.toast(msg);
  }
  function ncrCard(id) {
    const list = ncrsOf(id); if (!list.length) return '';
    return card(`Non-conformance (${list.length})`, `<ul class="plain ncr-list">${list.map((n) => `<li class="row-acts between"><span><b class="mono">${esc(n.id)}</b> ${mid(n.mat)} ${pill(n.status, n.status === 'Closed' ? 'success' : 'warning')}
      <div class="small">${num(n.qty)} ${esc(mat(n.mat).uom)} · ${esc(n.action)}${n.discount ? ` ${num(n.discount)}%` : ''} · ${esc(n.grn)} · raised ${esc(n.raised)} by ${esc(n.by)}</div><div class="small muted">Supplier: ${esc(n.supplier)}</div>
      ${n.status !== 'Closed' ? `<div class="small tone-warning">Open NCR blocks invoice matching for ${num(n.qty)} ${esc(mat(n.mat).uom)}; the quantity stays open on the PO.</div>` : ''}</span>
      ${n.status !== 'Closed' ? `<button class="btn btn-sm" data-po="ncr-close" data-id="${esc(n.id)}">Close NCR</button>` : ''}</li>`).join('')}</ul>`);
  }
  function matchCard(id, p) {
    const invs = invoicesOf(id);
    return card('3-way match summary', table([
      { h: 'Material ID', r: (l) => mid(l.mat), w: '120px' },
      { h: 'PO qty', r: (l) => `${num(l.qty - (l.cancelled || 0))} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '110px' },
      { h: 'GRN accepted', r: (l) => num(acceptedQty(p, p.lines.indexOf(l))), cls: 'num', w: '110px' },
      { h: 'Invoiced', r: (l) => num(invoicedQty(id, l)), cls: 'num', w: '90px' },
      { h: 'Invoices', r: (l) => invs.filter((v) => v.lines.some((x) => x[0] === l.mat)).map((v) => `<a class="mono" href="#/invoices/${esc(v.id)}">${esc(v.id)}</a> ${pill(v.doc.status, /Matched|Ready|Paid/.test(v.doc.status) ? 'success' : /Blocked/.test(v.doc.status) ? 'danger' : 'warning')}`).join('<br>') || '—', w: 'minmax(200px,2fr)' },
      { h: 'Still to invoice', r: (l) => { const q = l.qty - (l.cancelled || 0) - invoicedQty(id, l); return q > 0 ? `${num(q)} ${esc(mat(l.mat).uom)}<div class="small muted">${vnd(q * l.price)}</div>` : '—'; }, cls: 'num', w: '150px' }
    ], p.lines, { min: 860, label: '3-way match by Material ID line' }) + '<p class="small muted">Invoices are matched per line: quantity vs GRN accepted (±2% for tấn / m³), price vs PO (±0,5%).</p>');
  }
  function confirmCard(id, p, d) {
    const c = p.confirm;
    const body = !c ? `<p class="small mt-0">${d.status === 'Approved' ? 'Approved — send the PO to the supplier (Gmail + portal). The supplier confirms or declines within 48 h.' : 'Sent after approval.'}</p>`
      : c.status === 'Confirmed' ? `<p class="mt-0">${pill('Confirmed', 'success')} by ${esc(c.by)} · ${esc(c.at)}${c.note ? ` · ${esc(c.note)}` : ''}</p>`
        : `<div class="alert alert-${c.status === 'Not confirmed' ? 'danger' : 'warning'}" role="status"><b>${esc(c.status)}.</b> Sent ${esc(c.sent)}${c.note ? ` · ${esc(c.note)}` : ''}</div>`;
    const acts = d.status === 'Approved' ? '<button class="btn btn-sm btn-p" data-po="send">Send to supplier</button>' : c && c.status !== 'Confirmed' ? '<button class="btn btn-sm" data-act="toast" data-msg="Reminder sent to the supplier by Gmail + portal">Remind supplier</button><button class="btn btn-sm btn-p" data-po="confirm">Record confirmation</button>' : '';
    return card('Supplier confirmation', body + `<div class="row-acts">${acts}</div>`);
  }
  function revCard(id, p, d) {
    const pend = p.revs.find((r) => /Pending/.test(r.status)); const canCo = !/Draft|Pending|Cancelled|Closed/.test(d.status) && !pend;
    const list = p.revs.length ? `<ol class="plain rev-list">${p.revs.map((r) => `<li><b>Rev.${r.no}</b> ${pill(r.status, /Pending/.test(r.status) ? 'warning' : /Current|Approved/.test(r.status) ? 'success' : /Reject/.test(r.status) ? 'danger' : 'neutral')} <span class="small muted">${esc(r.at)} · ${esc(r.by)}</span><div class="small">${esc(r.diff)}</div>${r.reason ? `<div class="small muted">“${esc(r.reason)}”</div>` : ''}${r.approval && /Pending/.test(r.status) ? `<div class="small"><a href="#/approvals?id=${encodeURIComponent(r.approval)}">Open in My approvals</a> · approver Đỗ Hoàng Nam (SoD: raiser cannot approve)</div>` : ''}</li>`).join('')}</ol>` : '<p class="small muted mt-0">No revisions yet.</p>';
    let form = '';
    if (st.co) {
      const f = st.co; const e = st.coErr;
      form = `<form id="po-co" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">Change order · Rev.${Math.max(0, ...p.revs.map((r) => r.no)) + 1}</h3>
        ${p.lines.map((l, i) => { const lo = Math.max(receivedQty(p, i), invoicedQty(id, l)); const nx = sched(p).find((r) => r.li === i && !r.rec && !r.cx);
          return `<div class="form-grid">${S.field('pc', e, 'q' + i, `${l.mat} qty (${mat(l.mat).uom})`, f['q' + i], { mode: 'decimal', hint: `Now ${num(l.qty)} · at least ${num(lo)} (received / invoiced)` })}${nx ? S.field('pc', e, 'd' + i, `${l.mat} next delivery date`, f['d' + i], { ph: 'dd/mm/yyyy', hint: `Now ${nx.due}` }) : ''}</div>`; }).join('')}
        ${S.field('pc', e, 'reason', 'Reason', f.reason, { area: true, req: true, hint: 'Sent to the approver and the supplier' })}
        <p class="small muted mt-0">A value increase needs re-approval (approval matrix; SoD: you cannot approve your own change order). A date-only change needs no approval step. The supplier must re-confirm every revision.</p>
        <div class="row-acts"><button type="button" class="btn btn-sm" data-po="co-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Create revision</button></div></form>`;
    }
    return card('Change orders & revisions', list + form, canCo && !st.co ? '<button class="btn btn-sm" data-po="co-open">Change order</button>' : '');
  }
  function saveCo(root, id, p, d) {
    const f = Object.assign(st.co, S.read(root, '#po-co')); const e = {}; const ch = [];
    p.lines.forEach((l, i) => {
      const q = Number(String(f['q' + i]).replace(',', '.')); const lo = Math.max(receivedQty(p, i), invoicedQty(id, l)); const nx = sched(p).find((r) => r.li === i && !r.rec && !r.cx);
      if (!(q >= 0) || String(f['q' + i]).trim() === '') e['q' + i] = 'Enter a quantity.'; else if (q < lo) e['q' + i] = `Cannot go below ${num(lo)} ${mat(l.mat).uom} already received or invoiced.`; else if (q !== l.qty) ch.push({ i, qty: q });
      if (nx && f['d' + i] !== nx.due) { if (!S.validDate(f['d' + i])) e['d' + i] = 'Use dd/mm/yyyy.'; else ch.push({ i, si: nx.si, due: f['d' + i] }); }
    });
    if ((f.reason || '').length < 10) e.reason = 'Give a reason of at least 10 characters.';
    if (!Object.keys(e).length && !ch.length) e.reason = 'Nothing changed — edit a quantity or a date.';
    st.coErr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#po-co'); return; }
    const no = Math.max(0, ...p.revs.map((r) => r.no)) + 1; const before = value(p);
    const after = before + ch.filter((c) => c.qty != null).reduce((a, c) => a + (c.qty - p.lines[c.i].qty) * p.lines[c.i].price, 0);
    const diff = ch.map((c) => (c.qty != null ? `${p.lines[c.i].mat} qty ${num(p.lines[c.i].qty)} → ${num(c.qty)} ${mat(p.lines[c.i].mat).uom}` : `${p.lines[c.i].mat} delivery ${p.lines[c.i].sched[c.si][1]} → ${c.due}`)).join(' · ') + (after !== before ? ` · value ${vnd(before)} → ${vnd(after)} (${after > before ? '+' : '−'}${vnd(Math.abs(after - before))})` : ' · no value change');
    const rev = { no, at: NOW, by: S.me(), diff, reason: f.reason, change: ch };
    if (after > before) {
      const aid = `${id} Rev.${no}`; const appr = S.me() === 'Nguyễn Minh Anh' ? 'Đỗ Hoàng Nam' : 'Nguyễn Minh Anh';
      Object.assign(rev, { status: 'Pending approval', approval: aid });
      D().approvals.push({ id: aid, type: 'PO change order', title: `${short(d.title)} · ${diff.split(' · value')[0]}`, mats: d.mats, value: after, by: S.me(), step: 'Step 1 of 1', sla: App.addDays(D().today, 1) + ' 17:00', assignee: appr });
      D().approvalChains[aid] = [[`${S.me()} · Buyer`, 'Raised', NOW, f.reason], [`${appr} · ${appr === 'Đỗ Hoàng Nam' ? 'Finance Director' : 'Procurement Lead'}`, 'Waiting', 'SoD: raiser cannot approve', '']];
      App.toast(`Rev.${no} sent for re-approval to ${appr}`);
    } else { applyRev(id, p, d, rev); App.toast(`Rev.${no} issued · sent to the supplier for re-confirmation`); }
    p.revs.unshift(rev); st.co = null; App.render();
  }
  function applyRev(id, p, d, rev) {
    (rev.change || []).forEach((c) => { const l = p.lines[c.i]; if (c.qty != null) { const open = l.sched.find((s) => !s[2] && !s[3] && !s[4]); const dq = c.qty - l.qty; if (open) open[0] += dq; else l.sched.push([dq, App.addDays(D().today, 7), null]); l.qty = c.qty; } if (c.due) l.sched[c.si][1] = c.due; });
    p.revs.forEach((r) => { if (/^Current/.test(r.status)) r.status = 'Superseded'; });
    rev.status = 'Current · awaiting supplier re-confirmation'; p.rev = rev.no;
    p.confirm = { status: 'Awaiting re-confirmation', sent: NOW, note: `Rev.${rev.no} sent by Gmail + portal` };
    d.value = value(p); d.qty = `${num(p.lines[0].qty)} ${mat(p.lines[0].mat).uom}`; d.note = (d.note || '').replace(/ · Rev\.\d pending/, '');
  }
  function cancelCard(id, p, d) {
    const opens = p.lines.map((l, i) => [i, openQty(p, i)]).filter(([, q]) => q > 0);
    if (/Draft|Pending|Cancelled|Closed/.test(d.status)) return '';
    const recv = p.lines.reduce((a, l, i) => a + receivedQty(p, i), 0);
    if (!st.cx) return card('Cancel', `<p class="small mt-0">${opens.length ? `Open quantity can be cancelled with a reason; the supplier is notified. ${recv ? 'Received quantities cannot be cancelled.' : ''}` : 'Nothing open to cancel — every scheduled delivery has been received.'}</p>`, opens.length ? '<button class="btn btn-sm btn-d" data-po="cx-open">Cancel open qty</button>' : '');
    const f = st.cx; const e = st.cxErr;
    return card('Cancel open quantity', `<form id="po-cx" class="stack" novalidate>${S.field('px', e, 'scope', 'Scope', f.scope, { options: [['all', `Whole PO · all open quantity${recv ? ' (received qty stays)' : ''}`]].concat(opens.map(([i, q]) => { const nc = openSlots(p).filter((r) => r.li === i && r.ncr).map((r) => r.ncr); return [String(i), `Line ${i + 1} · ${p.lines[i].mat} · ${num(q)} ${mat(p.lines[i].mat).uom} open${nc.length ? ` (${nc.join(', ')})` : ''}`]; })) })}
      ${S.field('px', e, 'reason', 'Reason', f.reason, { area: true, req: true, hint: 'Required · sent to the supplier' })}
      <div class="row-acts"><button type="button" class="btn btn-sm" data-po="cx-cancel">Back</button><button type="submit" class="btn btn-sm btn-d">Cancel open quantity</button></div></form>`);
  }
  function saveCx(root, id, p, d) {
    const f = Object.assign(st.cx, S.read(root, '#po-cx')); st.cxErr = {};
    if ((f.reason || '').length < 10) { st.cxErr.reason = 'Give a reason of at least 10 characters.'; App.render(); S.focusErr('#po-cx'); return; }
    let cq = 0; const txt = [];
    p.lines.forEach((l, i) => { if (f.scope !== 'all' && +f.scope !== i) return; const q = openQty(p, i); if (!q) return; l.sched.forEach((s) => { if (!s[2] && !s[3]) s[3] = 'Cancelled'; }); l.cancelled = (l.cancelled || 0) + q; cq += q; txt.push(`${l.mat} −${num(q)} ${mat(l.mat).uom}`); });
    const recv = p.lines.reduce((a, l, i) => a + receivedQty(p, i), 0);
    const allInv = p.lines.every((l, i) => invoicedQty(id, l) >= acceptedQty(p, i));
    d.status = recv ? (openSlots(p).length ? d.status : (!openNcr(id).length && allInv ? 'Closed' : 'Delivered')) : (p.lines.every((l) => l.cancelled >= l.qty) ? 'Cancelled' : d.status);
    d.note = noteFrom(p, d);
    d.value = value(p);
    p.revs.forEach((r) => { if (/^Current/.test(r.status)) r.status = 'Superseded'; });
    const no = Math.max(0, ...p.revs.map((r) => r.no)) + 1; p.revs.unshift({ no, status: 'Current · cancellation sent to supplier', at: NOW, by: S.me(), diff: 'Cancelled open qty: ' + txt.join(' · '), reason: f.reason }); p.rev = no;
    st.cx = null; App.render(); App.toast(`${txt.join(' · ')} cancelled · supplier notified by Gmail + portal`);
  }
  function header(id, p, d) {
    return card('Header', `<dl class="dl"><dt>Vendor</dt><dd>${vlink(p.vendor)}<div class="small muted">MST ${esc((App.vendor(p.vendor) || {}).mst || '—')}</div></dd><dt>Source</dt><dd>${[p.pr ? 'PR ' + S.prLink(p.pr) : '', p.tender ? 'Tender ' + S.tndLink(p.tender) : '', p.contract ? 'Contract ' + doclink(p.contract, 'contracts') : ''].filter(Boolean).join(' · ') || '—'}</dd>
      <dt>Payment terms</dt><dd>${esc(p.terms)}</dd><dt>Delivery site</dt><dd>${esc(p.site)}</dd><dt>VAT</dt><dd>${[...new Set(p.lines.map((l) => S.vatLabel(mat(l.mat).vat)))].map(esc).join(' · ')}</dd><dt>Buyer</dt><dd>${esc(p.buyer)}</dd><dt>Revision</dt><dd>Rev.${p.rev}</dd><dt>Date</dt><dd>${esc(d.date)}</dd></dl>`);
  }
  function detail(d) {
    const id = d.id; const p = det(id); const v = App.vendor(p.vendor); const tt = vatSplit(p);
    const acc = p.lines.reduce((a, l, i) => a + acceptedQty(p, i) * l.price, 0); const invs = invoicesOf(id); const okInv = invs.filter((v) => /Matched|Ready|Paid/.test(v.doc.status)); const sub = (v) => v.lines.reduce((a, x) => a + x[2] * x[3], 0);
    const inv = okInv.reduce((a, v) => a + sub(v), 0); const exc = invs.filter((v) => !/Matched|Ready|Paid/.test(v.doc.status)).reduce((a, v) => a + sub(v), 0);
    const head = `<div class="page-h"><div><div class="crumbs small muted"><a href="#/po">Purchase orders</a> / ${esc(id)}</div><h1><span class="mono">${esc(id)}</span> <span class="small muted">Rev.${p.rev}</span> ${esc(d.title)}</h1>
      <div class="sub">${v ? esc(v.name) : ''} · ${pill(d.status, tone(d.status))}${d.note ? ` · <span class="small">${esc(d.note)}</span>` : ''}</div></div>
      <div class="acts"><a class="btn" href="#/po/${esc(id)}/print">Print preview</a>${/Sent|Confirmed|Partially/.test(d.status) && sched(p).some((r) => !r.rec && !r.cx) ? '<button class="btn btn-p" data-po="grn-open">Record goods receipt</button>' : ''}</div></div>`;
    const alerts = (v && v.risk === 'High' ? `<div class="alert alert-warning" role="status"><b>High-risk vendor.</b> ${(v.riskReasons || []).map(esc).join(' · ')}</div>` : '')
      + (p.confirm && p.confirm.status === 'Not confirmed' ? `<div class="alert alert-danger" role="alert"><b>Not confirmed by ${esc(App.vshort(v))}.</b> ${esc(p.confirm.note || '')}</div>` : '');
    const kpis = `<div class="grid-k kpi-money">${kpi('Value excl. VAT', vnd(tt.net), `Rev.${p.rev}`)}${kpi('VAT', vnd(tt.vat), Object.keys(tt.by).map((r) => r + '%').join(' + '))}${kpi('Total incl. VAT', vnd(tt.gross), ty(tt.gross))}${kpi('Accepted', pct(tt.net ? acc / tt.net * 100 : 0, 0), vnd(acc))}${kpi('Invoiced (matched)', pct(tt.net ? inv / tt.net * 100 : 0, 0), vnd(inv) + (exc ? `<div class="small tone-warning">${vnd(exc)} in exception / not matched</div>` : ''))}</div>`;
    const files = S.files('pof', p.files, d.mats, st.up, ['Signed PO', 'Mill certificate', 'Biên bản giao nhận', 'Specification / drawing', 'Other']);
    return `${head}${alerts}${progress(stepOf(d.status), d.status)}${kpis}<div class="grid-2"><div class="stack">${linesCard(id, p)}${schedCard(id, p, d)}${ncrCard(id)}${matchCard(id, p)}${files}</div>
      <div class="stack">${header(id, p, d)}${confirmCard(id, p, d)}${revCard(id, p, d)}${cancelCard(id, p, d)}</div></div>`;
  }

  /* ---------- F-69 printable PO (R-21) ---------- */
  function printPage(d) {
    const p = det(d.id); const v = App.vendor(p.vendor); const C = D().company; const tt = vatSplit(p);
    return `<div class="page-h no-print"><div><div class="crumbs small muted"><a href="#/po">Purchase orders</a> / <a href="#/po/${esc(d.id)}">${esc(d.id)}</a> / Print</div><h1>Print preview · <span class="mono">${esc(d.id)}</span> Rev.${p.rev}</h1><div class="sub">Đơn đặt hàng · the revision number matches the PO</div></div>
      <div class="acts"><button class="btn" data-po="print">Print</button><button class="btn btn-p" data-act="toast" data-msg="${esc(d.id)}_Rev${p.rev}.pdf downloaded">Download PDF</button></div></div>
      <article class="card po-doc" aria-label="Purchase order document"><div class="row-acts between"><div><b>${esc(C.name)}</b><div class="small">MST ${esc(C.mst)} · ${esc(C.address)}</div></div><div class="num"><b class="mono">${esc(d.id)} · Rev.${p.rev}</b><div class="small">Ngày ${esc(d.date)}</div></div></div>
        <h2 class="po-title">ĐƠN ĐẶT HÀNG <span class="muted">/ PURCHASE ORDER</span></h2>
        <div class="grid"><div><h3 class="h-sub mt-0">Bên bán / Supplier</h3><p class="small mt-0"><b>${esc(v.name)}</b><br>MST ${esc(v.mst)}<br>${esc(v.address || '')}<br>${esc(v.contact)} · ${esc(v.email)}</p></div>
          <div><h3 class="h-sub mt-0">Giao hàng / Delivery</h3><p class="small mt-0">${esc(p.site)}<br>${sched(p).filter((r) => !r.cx).map((r) => `${esc(r.mat)}: ${num(r.qty)} ${esc(mat(r.mat).uom)} · ${esc(r.due)}`).join('<br>')}</p></div></div>
        ${table([{ h: 'Mã vật tư', r: (l) => `<span class="mono">${esc(l.mat)}</span>`, w: '110px' }, { h: 'Diễn giải', r: (l) => esc(mat(l.mat).name), w: 'minmax(160px,2fr)' }, { h: 'ĐVT', r: (l) => esc(mat(l.mat).uom), w: '70px' },
          { h: 'Số lượng', r: (l) => num(l.qty - (l.cancelled || 0)), cls: 'num', w: '90px' }, { h: 'Đơn giá', r: (l) => vnd(l.price), cls: 'num', w: '130px' }, { h: 'VAT', r: (l) => mat(l.mat).vat + '%', cls: 'num', w: '60px' }, { h: 'Thành tiền', r: (l) => vnd(lineNet(l)), cls: 'num', w: '150px' }], p.lines, { min: 760, label: 'PO lines', cls: 'po-print-tbl' })}
        <dl class="dl dl-tot po-tot mt">${Object.entries(tt.by).map(([r, x]) => `<dt>Tiền thuế GTGT ${r}% trên ${vnd(x)}</dt><dd>${vnd(x * r / 100)}</dd>`).join('')}<dt>Tổng tiền trước thuế</dt><dd>${vnd(tt.net)}</dd><dt>Tổng thanh toán</dt><dd><b>${vnd(tt.gross)}</b></dd></dl>
        <h3 class="h-sub">Điều khoản / Terms</h3><p class="small mt-0">Thanh toán: ${esc(p.terms)}. Giao hàng kèm CO/CQ theo lô và biên bản giao nhận. Phạt chậm giao theo hợp đồng / điều kiện chung.</p>
        <div class="grid po-sign"><div class="small"><b>Đại diện bên mua</b><br>${esc(p.buyer)}<br>${pill(stepOf(d.status) >= 2 ? 'Digitally signed ' + d.date : 'Not signed yet', stepOf(d.status) >= 2 ? 'success' : 'neutral')}</div>
          <div class="small"><b>Đại diện bên bán</b><br>${esc(v.contact)}<br>${pill(p.confirm && p.confirm.status === 'Confirmed' ? 'Confirmed ' + p.confirm.at.slice(0, 10) : 'Awaiting confirmation', p.confirm && p.confirm.status === 'Confirmed' ? 'success' : 'warning')}</div></div></article>`;
  }

  /* Hook used by My approvals (PO approval / PO change order) */
  App.po = {
    onDecide(a, dcs) {
      if (a.type === 'PO approval') { const d = S.docOf(a.id); if (d) d.status = dcs === 'Approved' ? 'Approved' : 'Draft'; return; }
      if (a.type !== 'PO change order') return;
      const [id, r] = a.id.split(' Rev.'); const p = det(id); const d = S.docOf(id); if (!p) return; const rev = p.revs.find((x) => x.no === +r); if (!rev) return;
      if (dcs === 'Approved') { applyRev(id, p, d, rev); rev.status = 'Approved · awaiting supplier re-confirmation'; }
      else rev.status = dcs;
    }
  };

  App.page('po', {
    title: 'Purchase orders', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, sub) {
      const isNew = sub === 'new' || (!sub && (p.tender || p.contract || p.pr));
      const key = (sub || 'list') + (isNew ? JSON.stringify(p) : '');
      if (st.cur !== key) { st.cur = key; st.grn = null; st.co = null; st.cx = null; st.up = null; st.gerr = {}; st.coErr = {}; st.cxErr = {}; st.nf = null; st.nerr = {}; }
      if (isNew) { if (!st.nf) st.nf = initNew(p); return newPage(); }
      if (sub) {
        const [id, mode] = sub.split('/'); const d = docs().find((x) => x.id === id);
        if (!d) return App.errorState(`Purchase order ${id} was not found.`, ' <a href="#/po">Back to purchase orders</a>');
        if (mode === 'print') return printPage(d);
        if (d.status === 'Draft') { if (!st.nf) st.nf = initNew(p, id); return newPage(); }
        return detail(d);
      }
      return listPage(p);
    },
    mount(root) {
      const cur = () => { const id = (location.hash.split('/')[2] || '').split('?')[0]; const d = S.docOf(id); return d && d.type === 'PO' ? [id, det(id), d] : [null]; };
      root.addEventListener('mousedown', (e) => { if (e.target.closest('button[type=submit], [data-po=save-draft]')) st.hold = true; });
      root.addEventListener('input', (e) => { if (e.target.dataset.pof === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('po-q'); i.focus(); i.setSelectionRange(pos, pos); } });
      root.addEventListener('change', (e) => {
        const k = e.target.dataset.pof; if (k === 'vendor' || k === 'site') { st[k] = e.target.value; App.render(); return; }
        const pn = e.target.dataset.pn; if (!pn || !st.nf) return;
        if (pn === 'ref') { const f = build(st.nf.src, e.target.value); f.id = (existingFor(f).find((d) => d.status === 'Draft') || {}).id; st.nf = f; st.nerr = {}; App.render(); document.getElementById('pn-ref').focus(); return; }
        if (pn === 'vendor') { readNew(root); if (st.nf.src === 'tender') { const f = build('tender', st.nf.ref, e.target.value); st.nf = f; } else st.nf.vendor = e.target.value; App.render(); document.getElementById('pn-vendor').focus(); return; }
        readNew(root); if (st.hold) { st.hold = false; return; } const id = e.target.id; App.render(); const x = document.getElementById(id); x && x.focus();
      });
      root.addEventListener('submit', (e) => {
        const fid = e.target.id; if (!['po-new', 'po-grn', 'po-co', 'po-cx', 'pof-up'].includes(fid)) return; e.preventDefault(); st.hold = false;
        if (fid === 'po-new') return saveNew(root, true);
        const [id, p, d] = cur(); if (!id) return;
        if (fid === 'po-grn') saveGrn(root, id, p, d); else if (fid === 'po-co') saveCo(root, id, p, d); else if (fid === 'po-cx') saveCx(root, id, p, d);
        else { st.up = S.upload(root, 'pof', p.files); App.render(); }
      });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-po], [data-files]'); if (!b) return;
        if (b.dataset.files === 'open') { st.up = { errs: {} }; App.render(); const x = document.getElementById('pof-up-name'); x && x.focus(); return; }
        if (b.dataset.files === 'cancel') { st.up = null; App.render(); return; }
        const a = b.dataset.po; const [id, p, d] = cur();
        const focus = (sel) => { const x = document.querySelector(sel); if (x) { x.scrollIntoView({ block: 'center' }); x.focus({ preventScroll: true }); } };
        if (a === 'chip') { st.chip = b.dataset.k; App.render(); }
        else if (a === 'src') { st.nf = build(b.dataset.k, b.dataset.k === 'pr' ? 'PR-2026-0436' : b.dataset.k === 'tender' ? (awardedTenders()[0] || {}).id : (activeCts()[0] || {}).id); st.nerr = {}; App.render(); }
        else if (a === 'save-draft') { st.hold = false; saveNew(root, false); }
        else if (a === 'print') window.print();
        else if (!id) return;
        else if (a === 'grn-open') { st.grn = { date: D().today, delivered: '', accepted: '', rejected: '0', inspector: 'Hồ Thị Thanh (QC)', reason: '', action: 'Return to vendor', discount: '', checks: [] }; st.gerr = {}; App.render(); focus('#pg-slot'); }
        else if (a === 'grn-cancel') { st.grn = null; App.render(); }
        else if (a === 'co-open') { st.co = { reason: '' }; p.lines.forEach((l, i) => { st.co['q' + i] = String(l.qty); const nx = sched(p).find((r) => r.li === i && !r.rec && !r.cx); if (nx) st.co['d' + i] = nx.due; }); st.coErr = {}; App.render(); focus('#pc-q0'); }
        else if (a === 'co-cancel') { st.co = null; App.render(); }
        else if (a === 'cx-open') { st.cx = { scope: 'all', reason: '' }; st.cxErr = {}; App.render(); focus('#px-scope'); }
        else if (a === 'cx-cancel') { st.cx = null; App.render(); }
        else if (a === 'send') { d.status = 'Sent · not confirmed'; p.confirm = { status: 'Not confirmed', sent: NOW, note: 'Reminder at 48 h · escalation to the buyer at 72 h' }; if (!p.revs.length) p.revs = [{ no: 0, status: 'Current', at: NOW, by: S.me(), diff: 'Original issue', reason: '' }]; App.render(); App.toast(`${id} sent to ${App.vshort(App.vendor(p.vendor))} by Gmail + portal · PDF Rev.${p.rev} attached`); }
        else if (a === 'confirm') { const v = App.vendor(p.vendor); const re = p.confirm && p.confirm.status === 'Awaiting re-confirmation'; p.confirm = { status: 'Confirmed', by: v.contact + ' (portal)', at: NOW, note: re ? `Rev.${p.rev} re-confirmed` : '' }; if (/^Sent/.test(d.status)) d.status = 'Confirmed'; p.revs.forEach((r) => { if (/awaiting supplier re-confirmation/.test(r.status)) r.status = 'Current · re-confirmed by supplier ' + D().today; }); if (/3 days overdue/.test(d.note || '')) d.note = ''; D().notifications.filter((n) => n.doc === id).forEach((n) => { n.read = true; }); App.render(); App.toast(`${id} confirmed by ${v.contact}`); }
        else if (a === 'ncr-close') { const n = D().ncrs[b.dataset.id]; n.status = 'Closed'; n.supplier += ' · closed ' + D().today; const nd = S.docOf(b.dataset.id); if (nd) nd.status = n.action === 'Accept with discount' ? 'Closed · accepted with discount' : 'Closed'; if (n.action === 'Accept with discount') { const g = D().grns[n.grn]; const gl = g && g.lines.find((x) => x[4]); if (gl) { gl[3] += gl[4]; gl[4] = 0; } } syncNcrSlots(id, p); if (/Partially/.test(d.status) && !openSlots(p).length) d.status = 'Delivered'; d.note = noteFrom(p, d); App.render(); App.toast(`${b.dataset.id} closed · OTIF, NCR rate and Material 360° updated`); }
      });
    }
  });
})();
