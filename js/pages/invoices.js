/* Module 12 · Invoices & 3-way match — F-70 e-invoice inbox with tabs and tolerance banner (R-01), F-71 six legal checks incl. GDT lookup,
   F-72 match grid per Material ID line (price ±0,5% vs PO, qty ±2% vs GRN accepted for tấn/m³, exact for count units, open NCR blocks qty) (R-02),
   F-73 exceptions assigned to the buyer → My approvals / credit note, F-74 2-way match for SRV- against the service entry sheet,
   F-75 status stepper, due date from vendor terms, Ready for payment, Export to accounting (Material ID → item code, V-code → vendor code).
   Routes: #/invoices (?q=, ?tab=), #/invoices/<id> */
(function () {
  const { esc, num, pct, vnd, mid, pill, table, kpi, card } = App;
  const S = App.src;
  const D = () => window.DATA;
  const NOW = '02/11/2026 10:30'; const now = () => (App.now ? App.now() : NOW);
  const STAGES = ['Submitted', 'Validated', 'Matched', 'Ready for payment', 'Paid'];
  const TABS = [['all', 'All'], ['match', 'To match'], ['exc', 'Exceptions'], ['ready', 'Ready for payment'], ['blocked', 'Blocked']];
  const st = { tab: 'all', q: '', cur: null, map: {} };
  const mat = (id) => App.material(id) || { id, name: id, uom: '', vat: 8 };
  const list = () => D().docs.filter((d) => d.type === 'INV' && D().invoices[d.id]);
  const tabOf = (d) => (/Blocked/.test(d.status) ? 'blocked' : /Exception|No Material ID|credit|hold/i.test(d.status) ? 'exc' : /Ready|Paid/.test(d.status) ? 'ready' : 'match');
  const sTone = (s) => (/Ready|Paid|Matched/.test(s) ? 'success' : /Blocked/.test(s) ? 'danger' : 'warning');
  const termDays = (v) => +(/(\d+) days/.exec((App.vendor(v) || {}).terms || '') || [0, 30])[1];
  const due = (d) => App.addDays(d.date, termDays(d.vendor));
  const weight = (u) => ['tấn', 'm³', 'kg'].includes(u);

  /* F-71 legal checks; the first five block matching */
  function checks(d, v) {
    const ven = App.vendor(d.vendor); const C = D().company;
    return [
      ['Mã CQT present · GDT lookup', !!v.cqt, v.cqt ? 'Đã được cấp mã' : (v.gdt || 'Mã CQT missing'), true],
      ['Seller MST = vendor master', true, `${ven.mst} = ${ven.id}`, true],
      ['Buyer MST = company', true, `${C.mst} (${C.name})`, true],
      ['Ký hiệu / số format', /^[12][CK]\d{2}[TDLMNBGH][A-Z]{2}$/.test(v.kh) && /^\d{8}$/.test(v.no), `${v.kh} · ${v.no}`, true],
      ['Adjustment / replacement link', v.type === 'Original' || !!v.orig, v.type === 'Original' ? 'Not applicable (Original)' : `${v.type} of ${v.orig}`, true],
      ['Lines mapped to Material ID', v.lines.every((l) => l[0]), `${v.lines.filter((l) => l[0]).length} of ${v.lines.length} lines`, false]
    ];
  }
  const legalOk = (d, v) => checks(d, v).every((c) => c[1] || !c[3]);

  /* F-72 / F-74 match per line */
  function match(d, v) {
    const p = D().pos[v.po]; const g = D().grns[v.grn]; const T = D().tolerance;
    return v.lines.map((x) => {
      const [m, desc, qty, price, prev] = x; const r = { m, desc, qty, price };
      if (!m) return Object.assign(r, { res: 'No Material ID', tone: 'danger' });
      const li = p ? p.lines.findIndex((l) => l.mat === m) : -1; const pl = li >= 0 ? p.lines[li] : null;
      if (!pl) return Object.assign(r, { res: 'Not on PO', tone: 'danger' });
      const acc = g ? g.lines.filter((y) => y[0] === li).reduce((a, y) => a + y[3], 0) : 0;
      const ncr = Object.entries(D().ncrs).find(([, n]) => n.grn === v.grn && n.mat === m && n.status !== 'Closed');
      const avail = acc - (prev || 0); const qd = avail ? (qty - avail) / avail * 100 : 100; const pd = (price - pl.price) / pl.price * 100;
      const qTol = weight(mat(m).uom) ? T.qty : 0;
      const qOk = Math.abs(qd) <= qTol + 1e-9; const pOk = Math.abs(pd) <= T.price + 1e-9;
      Object.assign(r, { poQty: pl.qty, poPrice: pl.price, acc, avail, qd, pd, qTol, ncr: ncr ? [ncr[0], ncr[1].qty] : null, ses: g && g.ses ? g.sla : null, over: (price - pl.price) * qty });
      r.res = qOk && pOk ? 'Matched' : !pOk ? 'Price mismatch' : 'Qty mismatch'; r.tone = r.res === 'Matched' ? 'success' : 'danger';
      return r;
    });
  }
  const totals = (v) => { const by = {}; v.lines.forEach((l) => { const r = l[0] ? mat(l[0]).vat : 8; by[r] = (by[r] || 0) + l[2] * l[3]; }); const net = Object.values(by).reduce((a, x) => a + x, 0); const vat = Object.entries(by).reduce((a, [r, x]) => a + x * r / 100, 0); return { by, net, vat, gross: net + vat }; };
  const vb = (t, ok) => `<span class="var ${ok ? 'var-ok' : 'var-bad'}">${t}<span class="sr">${ok ? ' within tolerance' : ' outside tolerance'}</span></span>`;
  const sg = (x) => `${x > 0 ? '+' : x < 0 ? '−' : '±'}${pct(Math.abs(x))}`;
  /* P5-01 / P5-05 · (re)derive status from the current checks and tolerances: portal invoices auto-match when every line passes,
     otherwise go to the exception queue assigned to the PO buyer; open price exceptions re-match after a tolerance change. */
  function rematch(d) {
    const v = D().invoices[d.id]; if (!v || !legalOk(d, v)) return; const M = match(d, v); const ok = M.length && M.every((r) => r.res === 'Matched');
    const inAp = D().approvals.some((a) => a.id === d.id);
    if (v.stage < 2 && /^Submitted/.test(d.status)) {
      if (ok) { v.stage = 2; d.status = 'Matched'; }
      else { const pe = M.find((r) => r.res === 'Price mismatch'); d.status = 'Exception · ' + (pe ? 'price ' + sg(pe.pd) : 'qty'); v.stage = 1; v.hold = 'On hold'; v.assigned = (D().pos[v.po] || {}).buyer || 'Nguyễn Minh Anh'; v.resolveBy = App.addDays(D().today, 3); }
    } else if (/^Exception · price/.test(d.status) && !inAp && ok) { d.status = 'Matched'; v.stage = 2; v.hold = null; v.resolveBy = null; }
  }
  const banner = () => `<div class="alert alert-info" role="status">Tolerances: <b>price ±${num(D().tolerance.price, 1)}%</b> vs PO · <b>quantity ±${D().tolerance.qty}%</b> vs GRN accepted qty for weight/volume units (tấn, m³), exact for count units · SRV- uses 2-way match with the service entry sheet. ${App.state.role === 'admin' ? '<a href="#/admin/rules">Edit in Admin</a>' : 'Edited in Admin.'}</div>`;

  function listPage(p) {
    if (p.q != null && p.q !== st.lastQ) { st.q = p.q; st.lastQ = p.q; st.tab = 'all'; }
    if (p.tab && p.tab !== st.lastTab) { st.tab = p.tab; st.lastTab = p.tab; }
    const all = list(); all.forEach(rematch); const cnt = (k) => (k === 'all' ? all.length : all.filter((d) => tabOf(d) === k).length); const q = st.q.trim(); const X = D().invoiceStats;
    const rows = all.filter((d) => { const v = D().invoices[d.id]; return (st.tab === 'all' || tabOf(d) === st.tab) && (!q || App.matches(`${d.id} ${d.title} ${v.kh} ${v.no} ${v.po} ${v.grn} ${d.mats.join(' ')} ${(App.vendor(d.vendor) || {}).name} ${(App.vendor(d.vendor) || {}).mst}`, q)); }).sort((a, b) => App.dt(b.date) - App.dt(a.date));
    return `<div class="page-h"><div><h1>${esc(App.t('Invoices & matching'))}</h1><div class="sub">E-invoices (NĐ 123/2020, TT 78/2021) from the supplier portal and hoadon@ inbox · legal check, then 3-way match per Material ID line</div></div>
      <div class="acts"><button class="btn" data-act="toast" data-msg="hoadon@ inbox fetched · no new e-invoices since 08:00">Fetch e-invoice inbox</button><button class="btn" data-act="toast" data-msg="Choose the XML and PDF of the e-invoice (both required)">Upload XML + PDF</button></div></div>
      <div class="grid-k">${kpi('All invoices', num(X.total), `${all.length} in this sample`)}${kpi('To match', num(X.toMatch), `${cnt('match')} in this sample`)}${kpi('Exceptions', num(X.exceptions), all.filter((d) => tabOf(d) === 'exc').map((d) => d.id.slice(4)).join(', ') || 'None', cnt('exc') ? 'warning' : '')}${kpi('Blocked', num(X.blocked), all.filter((d) => tabOf(d) === 'blocked').map((d) => d.id.slice(4)).join(', ') || 'None', cnt('blocked') ? 'danger' : '')}</div>
      ${banner()}
      <div class="seg seg-wrap" role="group" aria-label="Invoice status">${TABS.map(([k, l]) => `<button data-inv="tab" data-k="${k}" aria-pressed="${st.tab === k}">${l} (${cnt(k)})</button>`).join('')}</div>
      ${card('E-invoices', `<div class="filters"><label class="sr" for="inv-q">Search invoices</label><input class="inp grow" id="inv-q" type="search" data-invf="q" value="${esc(st.q)}" placeholder="Search INV, ký hiệu/số, MST, PO, GRN or Material ID"></div>
        ${table([
          { h: 'Invoice', r: (d) => `<a class="mono" href="#/invoices/${esc(d.id)}">${esc(d.id)}</a><div class="small">${esc(d.title)}</div>`, w: 'minmax(200px,2fr)' },
          { h: 'Ký hiệu · số', r: (d) => { const v = D().invoices[d.id]; return `<span class="mono small">${esc(v.kh)} · ${esc(v.no)}</span><div class="small muted">${esc(v.src)} · ${esc(v.type)}</div>`; }, w: '150px' },
          { h: 'Seller MST', r: (d) => `<span class="mono small">${esc(App.vendor(d.vendor).mst)}</span><div class="small">${esc(App.vshort(App.vendor(d.vendor)))}</div>`, w: '140px' },
          { h: 'PO · GRN', r: (d) => { const v = D().invoices[d.id]; return `<a class="mono small" href="#/po/${esc(v.po)}">${esc(v.po)}</a><div class="mono small muted">${esc(v.grn)}</div>`; }, w: '140px' },
          { h: 'Excl. VAT', r: (d) => vnd(totals(D().invoices[d.id]).net), cls: 'num', w: '140px' },
          { h: 'VAT', r: (d) => vnd(totals(D().invoices[d.id]).vat), cls: 'num', w: '120px' },
          { h: 'Legal · match', r: (d) => { const v = D().invoices[d.id]; const ok = legalOk(d, v); return `${pill(ok ? 'Legal OK' : 'Legal fail', ok ? 'success' : 'danger')}<div class="mt-s">${pill(d.status, sTone(d.status))}</div>${v.lines.some((l) => !l[0]) ? `<div class="small tone-warning">${v.lines.filter((l) => !l[0]).length} line: No Material ID</div>` : ''}`; }, w: 'minmax(170px,1.4fr)' }
        ], rows, { min: 1100, empty: 'No invoices in this view', label: 'E-invoices' })}`)}`;
  }

  function detail(d) {
    rematch(d);
    const v = D().invoices[d.id]; const ven = App.vendor(d.vendor); const C = checks(d, v); const lok = legalOk(d, v); const M = lok ? match(d, v) : []; const tt = totals(v);
    const stage = Math.min(v.stage, 4);
    const steps = `<ol class="steps" aria-label="Invoice status">${STAGES.map((s, k) => { const dn = k < stage || (k === stage && k === 4); const cu = k === stage && !dn; return `<li class="${dn ? 'done' : cu ? 'cur' : ''}"${cu ? ' aria-current="step"' : ''}><span class="st-n" aria-hidden="true">${dn ? '✓' : k + 1}</span><span class="st-l">${s}${cu && v.hold ? ' · on hold' : ''}</span>${dn ? '<span class="sr"> (done)</span>' : ''}</li>`; }).join('')}</ol>`;
    const isSrv = M.some((r) => r.ses);
    const fields = card('E-invoice fields (parsed from XML)', `<dl class="dl dl-inv"><dt>Mẫu số</dt><dd>${esc(v.mau)}</dd><dt>Ký hiệu</dt><dd class="mono">${esc(v.kh)}</dd><dt>Số hóa đơn</dt><dd class="mono">${esc(v.no)}</dd><dt>Ngày lập</dt><dd>${esc(d.date)}</dd>
      <dt>MST người bán</dt><dd><span class="mono">${esc(ven.mst)}</span> · ${esc(ven.name)}</dd><dt>MST người mua</dt><dd><span class="mono">${esc(D().company.mst)}</span> · ${esc(D().company.name)}</dd><dt>Mã CQT</dt><dd class="mono">${v.cqt ? esc(v.cqt) : '<span class="tone-danger">— missing —</span>'}</dd>
      <dt>Type</dt><dd>${esc(v.type)}${v.orig ? ` · replaces ${esc(v.orig)}` : ''}</dd><dt>Source</dt><dd>${esc(v.src)} · XML + PDF</dd><dt>Subtotal</dt><dd>${vnd(tt.net)}</dd><dt>VAT</dt><dd>${Object.entries(tt.by).map(([r, x]) => `${r}% on ${vnd(x)} = ${vnd(x * r / 100)}`).join(' · ')}</dd><dt>Total</dt><dd><b>${vnd(tt.gross)}</b></dd></dl>`);
    const legal = card(`Legal checks (${C.filter((c) => c[1]).length} / ${C.length})`, `<ul class="plain legal-list">${C.map(([n, ok, note, hard]) => `<li class="row-acts between"><span>${esc(n)}<div class="small muted">${esc(note)}</div></span>${pill(ok ? 'Pass' : hard ? 'Fail · blocks matching' : 'Fail · map before match', ok ? 'success' : hard ? 'danger' : 'warning')}</li>`).join('')}</ul>`);
    const grid = lok ? table([
      { h: 'Material ID line', r: (r) => (r.m ? `${mid(r.m)}<div class="small">${esc(r.desc)}</div>` : `<span class="small">${esc(r.desc)}</span><div>${pill('No Material ID', 'danger')}</div>${mapper(d, r)}`), w: 'minmax(200px,2fr)' },
      { h: 'PO qty · price', r: (r) => (r.poQty != null ? `${num(r.poQty)} · ${vnd(r.poPrice)}` : '—'), cls: 'num', w: '170px' },
      { h: isSrv ? 'SES accepted' : 'GRN accepted', r: (r) => (r.acc != null ? `${num(r.acc)}${r.avail !== r.acc ? `<div class="small muted">${num(r.acc - r.avail)} already invoiced</div>` : ''}${r.ncr ? `<div class="small tone-danger">${num(r.ncr[1])} blocked · ${esc(r.ncr[0])} open</div>` : ''}${r.ses ? `<div class="small muted">SLA ${pct(r.ses[0])} ≥ ${pct(r.ses[1])}</div>` : ''}` : '—'), cls: 'num', w: '150px' },
      { h: 'Invoice qty · price', r: (r) => `${r.qd != null && Math.abs(r.qd) > r.qTol + 1e-9 ? `<span class="var-cell">${num(r.qty)}</span>` : num(r.qty)} · ${r.pd != null && Math.abs(r.pd) > D().tolerance.price + 1e-9 ? `<span class="var-cell">${vnd(r.price)}</span>` : vnd(r.price)}`, cls: 'num', w: '170px' },
      { h: 'Qty var.', r: (r) => (r.qd != null ? `${vb(sg(r.qd), Math.abs(r.qd) <= r.qTol + 1e-9)}<div class="small muted">tol. ${r.qTol ? '±' + r.qTol + '%' : 'exact'}</div>` : '—'), cls: 'num', w: '100px' },
      { h: 'Price var.', r: (r) => (r.pd != null ? `${vb(sg(r.pd), Math.abs(r.pd) <= D().tolerance.price + 1e-9)}<div class="small muted">tol. ±${num(D().tolerance.price, 1)}%</div>${Math.abs(r.pd) > D().tolerance.price ? `<div class="small tone-danger">${vnd(r.over)} over PO</div>` : ''}` : '—'), cls: 'num', w: '130px' },
      { h: 'Result', r: (r) => pill((r.tone === 'danger' ? '! ' : '✓ ') + r.res, r.tone), w: '150px' }
    ], M, { min: 1000, label: 'Match by Material ID line', cls: 'match-grid' }) : App.errorState('Matching is blocked until the legal checks pass. Ask the supplier for a replacement invoice with a valid Mã CQT.');
    const allOk = lok && M.length && M.every((r) => r.res === 'Matched');
    const priceExc = M.find((r) => r.res === 'Price mismatch');
    const exc = /Exception|No Material ID|hold|credit/i.test(d.status) ? `<div class="alert alert-warning" role="status"><b>${esc(v.hold || 'On hold')}.</b> Assigned to buyer <b>${esc(v.assigned || '—')}</b>${v.resolveBy ? ` · resolve by ${esc(v.resolveBy)} (escalates after 3 working days)` : ''}.${priceExc ? ` Invoice price ${vnd(priceExc.price)} vs PO ${vnd(priceExc.poPrice)} (${sg(priceExc.pd)}) — written to Price history as source Invoice.` : ''} Release needs the Procurement Lead (not the raiser).</div>` : '';
    const inAp = D().approvals.some((a) => a.id === d.id);
    let acts = '';
    if (!lok) acts = `<button class="btn btn-sm" data-act="toast" data-msg="Replacement invoice requested from ${esc(App.vshort(ven))} (Gmail + portal)">Request replacement invoice</button>`;
    else if (/Exception|hold|No Material ID|credit/i.test(d.status)) acts = `<button class="btn btn-sm" data-inv="credit">Request credit note</button>${priceExc ? (inAp ? `<a class="btn btn-sm btn-p" href="#/approvals?id=${esc(d.id)}">Open in My approvals</a>` : '<button class="btn btn-sm btn-p" data-inv="to-ap">Accept variance → My approvals</button>') : ''}`;
    else if (allOk && v.stage === 2) acts = '<button class="btn btn-sm" data-inv="hold">Hold</button><button class="btn btn-sm btn-p" data-inv="ready">Mark ready for payment</button>';
    else if (v.stage >= 3) acts = v.exported ? `<span class="small muted">Exported ${esc(v.exported)}</span>` : '<button class="btn btn-sm btn-p" data-inv="export">Export to accounting</button>';
    const pay = card('Payment', `<dl class="dl"><dt>Terms</dt><dd>${esc((ven.terms || '').split(' ·')[0])} (vendor master)</dd><dt>Due date</dt><dd><b>${esc(due(d))}</b> = ${esc(d.date)} + ${termDays(d.vendor)} days</dd><dt>Status</dt><dd>${pill(d.status, sTone(d.status))}</dd>${v.exported ? `<dt>Accounting</dt><dd>Exported ${esc(v.exported)} · Paid status comes from the accounting system</dd>` : ''}</dl>
      ${v.stage >= 3 ? `<h3 class="h-sub">Accounting mapping</h3><ul class="plain small">${v.lines.filter((l) => l[0]).map((l) => `<li>${mid(l[0])} → item code <span class="mono">VT-${esc(l[0].replace('-', ''))}</span></li>`).join('')}<li><span class="mono">${esc(d.vendor)}</span> → vendor code <span class="mono">NCC-${esc(d.vendor.slice(2))}</span></li></ul>` : ''}
      <div class="row-acts">${acts}</div>`);
    const head = `<div class="page-h"><div><div class="crumbs small muted"><a href="#/invoices">Invoices & matching</a> / ${esc(d.id)}</div><h1><span class="mono">${esc(d.id)}</span> ${esc(d.title)}</h1>
      <div class="sub">${esc(ven.name)} · ${pill(d.status, sTone(d.status))} · PO <a class="mono" href="#/po/${esc(v.po)}">${esc(v.po)}</a> · ${esc(v.grn)}</div></div>
      <div class="acts"><button class="btn" data-act="toast" data-msg="${esc(v.kh)}-${esc(v.no)}.pdf opened">View PDF</button></div></div>`;
    return `${head}${steps}${exc}${card(isSrv ? '2-way match · PO → service entry sheet' : '3-way match · PO → GRN → e-invoice', `<ol class="chain"><li><span class="small muted">PO</span><a class="mono" href="#/po/${esc(v.po)}">${esc(v.po)}</a></li><li><span class="small muted">${isSrv ? 'Service entry sheet' : 'GRN'}</span><span class="mono">${esc(v.grn)}</span></li><li><span class="small muted">E-invoice</span><span class="mono">${esc(v.kh)} · ${esc(v.no)}</span></li></ol>${grid}`)}<div class="grid-2"><div class="stack">${fields}</div>
      <div class="stack">${legal}${pay}</div></div>`;
  }
  function mapper(d, r) {
    const p = D().pos[D().invoices[d.id].po]; const opts = p ? p.lines.map((l) => l.mat) : [];
    return `<div class="mt-s"><label class="sr" for="inv-map">Map to Material ID</label><select class="inp" id="inv-map" data-inv-map="1"><option value="">Map to Material ID…</option>${opts.map((m) => `<option>${esc(m)}</option>`).join('')}<option value="new">Request a new Material ID</option></select></div>`;
  }

  App.inv = {
    onDecide(a, dcs) {
      if (a.type !== 'Invoice exception') return; const d = S.docOf(a.id); const v = D().invoices[a.id]; if (!d || !v) return;
      if (dcs === 'Approved') { d.status = 'Matched'; v.stage = 2; v.hold = null; v.accepted = 'Variance accepted by ' + S.me(); } else d.status = 'On hold · ' + dcs.toLowerCase();
    }
  };

  App.page('invoices', {
    title: 'Invoices & matching', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, sub) {
      if (st.cur !== (sub || 'list')) st.cur = sub || 'list';
      if (sub) { const d = list().find((x) => x.id === sub); return d ? detail(d) : App.errorState(`Invoice ${sub} was not found.`, ' <a href="#/invoices">Back to invoices</a>'); }
      return listPage(p);
    },
    mount(root) {
      root.addEventListener('input', (e) => { if (e.target.dataset.invf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('inv-q'); i.focus(); i.setSelectionRange(pos, pos); } });
      root.addEventListener('change', (e) => {
        if (!e.target.dataset.invMap) return; const d = S.docOf(st.cur); const v = D().invoices[st.cur]; const val = e.target.value; if (!val) return;
        if (val === 'new') { App.toast('Material ID request opened · the line stays on hold'); return; }
        const l = v.lines.find((x) => !x[0]); l[0] = val; if (v.lines.every((x) => x[0])) d.status = 'Exception · mapped, re-match'; App.render(); App.toast(`Line mapped to ${val} · re-matched`);
      });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-inv]'); if (!b) return; const k = b.dataset.inv;
        if (k === 'tab') { st.tab = b.dataset.k; App.render(); return; }
        const d = S.docOf(st.cur); const v = D().invoices[st.cur]; if (!d) return;
        if (k === 'credit') { d.status = 'On hold · credit note requested'; App.render(); App.toast(`Credit note requested from ${App.vshort(App.vendor(d.vendor))}`); }
        else if (k === 'to-ap') {
          const by = S.me(); const ap = by === 'Nguyễn Minh Anh' ? 'Đỗ Hoàng Nam' : 'Nguyễn Minh Anh'; const role = ap === 'Đỗ Hoàng Nam' ? 'Finance Director' : 'Procurement Lead';
          const t = totals(v); D().approvals.push({ id: d.id, type: 'Invoice exception', title: d.title, mats: d.mats, value: t.net, by, step: 'Step 1 of 1', sla: App.addDays(D().today, 2) + ' 17:00', assignee: ap });
          D().approvalChains[d.id] = [[`${by} · Buyer`, 'Raised', NOW, 'Accept price variance'], [`${ap} · ${role}`, 'Waiting', 'SLA 2 working days · SoD: raiser cannot approve', '']]; App.render(); App.toast(`${d.id} sent to My approvals (${ap}, not the raiser)`);
        }
        else if (k === 'hold') { d.status = 'On hold'; v.hold = 'On hold'; v.assigned = v.assigned || S.me(); App.render(); }
        else if (k === 'ready') { d.status = 'Ready for payment'; v.stage = 3; S.audit('Invoices', 'Marked ready for payment', d.id); App.render(); App.toast(`${d.id} ready for payment · due ${due(d)}`); }
        else if (k === 'export') { v.exported = now(); S.audit('Invoices', 'Exported to accounting', d.id); App.render(); App.toast(`${d.id} exported to accounting · Material ID → item code, V-code → vendor code`); }
      });
    }
  });
})();
