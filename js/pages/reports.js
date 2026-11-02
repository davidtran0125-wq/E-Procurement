/* Module 14 · Reports — F-81 filters + OTIF KPIs by accepted qty (R-07), F-82 OTIF by vendor, F-83 saving KPIs reported vs Finance-validated (R-24),
   F-84 saving formula & records with type and status, F-85 spend cube (vendor / Material ID / project), top-5 concentration, contract coverage,
   off-contract list and cycle times (R-17), F-86 budget vs committed vs actual by project (R-14). Route: #/reports */
(function () {
  const { esc, num, pct, vnd, ty, mid, pill, table, kpi, card } = App;
  const S = App.src;
  const D = () => window.DATA;
  const CAT = { CON: 'Construction', EQP: 'Equipment', SRV: 'Services', LOG: 'Logistics' };
  const st = { period: 'ytd', cat: 'all', vendor: 'all', mat: 'all', cube: 'vendor', extraVal: 0 };
  const R = () => D().reports;

  function savings() {
    return R().savings.map((s) => {
      if (!s.tender) return Object.assign(s, { val: (s.base - s.award) * s.qty });
      const t = D().tenders[s.tender]; const doc = S.docOf(s.tender); const award = t.award ? t.award.value : 1465900000;
      if (doc.status === 'Awarded' && s.status === 'Draft') s.status = 'Submitted';
      return Object.assign(s, { val: 1520000000 - award, baseTxt: '1.520.000.000 ₫ (last PO per line)', awardTxt: vnd(award) });
    });
  }
  const offContract = () => D().docs.filter((d) => d.type === 'PO').flatMap((d) => d.mats.map((m) => {
    const c = D().contracts.find((x) => x.lines.some((l) => l.mat === m) && App.dt(x.start) <= App.dt(d.date) && App.dt(x.end) >= App.dt(d.date));
    const p = D().pos[d.id]; return c && (c.vendor !== d.vendor || (p && !p.contract && !p.tender)) ? { d, m, c } : null;
  })).filter(Boolean);

  function render() {
    const V = D().vendors; const ov = R().otifVendors; const K = D().kpi;
    let otif = K.otif90, onTime = R().otif.onTime, inFull = R().otif.inFull, dels = R().otif.deliveries, scope = 'All categories';
    if (st.mat !== 'all') { const m = App.material(st.mat); dels = m.otif[1]; otif = dels ? m.otif[0] / dels * 100 : 0; onTime = inFull = null; scope = st.mat; }
    else if (st.vendor !== 'all') { const x = ov[st.vendor] || [0, 0, 0]; dels = x[0]; otif = App.vendor(st.vendor).otif; onTime = x[1]; inFull = x[2]; scope = App.vshort(App.vendor(st.vendor)); }
    else if (st.cat !== 'all') { otif = K.byCat[st.cat].otif; onTime = inFull = null; dels = null; scope = CAT[st.cat]; }
    const filters = `<div class="card filters"><label class="sr" for="rp-p">Period</label><select class="inp" id="rp-p" data-rpf="period">${[['ytd', 'Year to date 2026'], ['q3', 'Q3 2026'], ['90', 'Last 90 days']].map(([k, l]) => `<option value="${k}"${st.period === k ? ' selected' : ''}>${l}</option>`).join('')}</select>
      <label class="sr" for="rp-c">Category</label><select class="inp" id="rp-c" data-rpf="cat"><option value="all">All categories</option>${Object.entries(CAT).map(([k, l]) => `<option value="${k}"${st.cat === k ? ' selected' : ''}>${l}</option>`).join('')}</select>
      <label class="sr" for="rp-v">Vendor</label><select class="inp" id="rp-v" data-rpf="vendor"><option value="all">All vendors</option>${V.filter((v) => ov[v.id]).map((v) => `<option value="${v.id}"${st.vendor === v.id ? ' selected' : ''}>${esc(App.vshort(v))}</option>`).join('')}</select>
      <label class="sr" for="rp-m">Material ID</label><select class="inp" id="rp-m" data-rpf="mat"><option value="all">All Material IDs</option>${D().materials.filter((m) => m.otif[1]).map((m) => `<option value="${m.id}"${st.mat === m.id ? ' selected' : ''}>${m.id} · ${esc(m.name)}</option>`).join('')}</select></div>`;
    const otifK = `<div class="grid-k">${kpi('OTIF', pct(otif), `${esc(scope)} · target ${pct(D().otif.target, 0)}`, otif >= 95 ? 'success' : 'warning')}${kpi('On time', onTime != null ? pct(onTime) : '—', 'Received ≤ promised date')}${kpi('In full', inFull != null ? pct(inFull) : '—', 'Accepted qty ≥ scheduled qty')}${kpi('Deliveries', dels != null ? num(dels) : '—', st.cat === 'all' && st.vendor === 'all' && st.mat === 'all' ? `${num(R().otif.late)} late · ${num(R().otif.short)} short / rejected` : 'In scope')}</div>`;
    const O = D().otif;
    const trend = card('OTIF trend vs target', App.chart.line({ labels: O.months, values: O.values, target: O.target, targetLabel: 'Target 95%', min: 85, max: 97, fmt: (v) => pct(v), label: `Monthly OTIF from ${O.months[0]} to ${O.months[11]} against a 95% target` })
      + '<p class="small muted"><b>OTIF</b> = deliveries that are on time (received ≤ promised date) <b>and</b> in full (<b>accepted</b> qty ≥ scheduled qty) ÷ all deliveries. One delivery = one PO schedule line per Material ID; for SRV- the SLA met counts as in full.</p>');
    const vrows = V.filter((v) => ov[v.id]).map((v) => ({ v, x: ov[v.id] })).sort((a, b) => b.v.otif - a.v.otif);
    const byVendor = card('OTIF by vendor', table([
      { h: 'Vendor', r: (r) => `<a href="#/vendors/${r.v.id}">${esc(App.vshort(r.v))}</a>`, w: 'minmax(140px,1.6fr)' }, { h: 'Deliveries', r: (r) => num(r.x[0]), cls: 'num', w: '90px' },
      { h: 'On time', r: (r) => pct(r.x[1]), cls: 'num', w: '90px' }, { h: 'In full', r: (r) => pct(r.x[2]), cls: 'num', w: '90px' }, { h: 'OTIF', r: (r) => `<b>${pct(r.v.otif)}</b>`, cls: 'num', w: '80px' },
      { h: 'Label', r: (r) => (r.v.otif >= 95 ? pill('On target', 'success') : r.v.otif < 85 ? pill('< 85% · risk', 'danger') : pill('Below target', 'warning')), w: '130px' }
    ], vrows, { min: 640, label: 'OTIF by vendor' }));

    const SV = savings(); const sv = R().saving; const validated = sv.validated + st.extraVal / 1e9;
    const savK = `<div class="grid-k">${kpi('Saving YTD (reported)', num(sv.reported, 1) + ' tỷ ₫', `${pct(sv.rate)} of sourced spend · target ${pct(sv.target, 0)}`, 'success')}${kpi('Finance-validated', num(validated, 1) + ' tỷ ₫', `${pct(validated / sv.reported * 100, 0)} of reported`)}${kpi('Cost avoidance', num(sv.avoidance, 1) + ' tỷ ₫', 'Reported separately, not in saving')}${kpi('Saving rate', pct(sv.rate), sv.rate >= sv.target ? 'Above target' : 'Below target', sv.rate >= sv.target ? 'success' : 'warning')}</div>`;
    const byCat = card('Saving by category', App.chart.bars(Object.keys(CAT).map((c) => ({ label: CAT[c], value: K.byCat[c].saving })), (v) => num(v, 1) + ' tỷ ₫') + '<p class="small muted">Price reduction + negotiated terms · excl. VAT.</p>');
    const isFin = S.me() === 'Đỗ Hoàng Nam';
    const recs = card('Saving records', `<p class="small mt-0"><b>Saving = (Baseline − Awarded) × Qty</b> per Material ID line · baseline = last PO price of the same Material ID (fallback: average of first-round bids) · excl. VAT. Status: Draft → Submitted → Validated by Finance.</p>` + table([
      { h: 'Record', r: (s) => `<span class="mono small">${esc(s.id)}</span><div class="small muted">${esc(s.doc)}</div>`, w: 'minmax(150px,1.4fr)' }, { h: 'Material ID', r: (s) => mid(s.mat), w: '120px' },
      { h: 'Type', r: (s) => pill(s.type, s.type === 'Cost avoidance' ? 'neutral' : 'info'), w: '140px' },
      { h: 'Calculation', r: (s) => (s.tender ? `${esc(s.baseTxt)} − ${esc(s.awardTxt)}` : `(${vnd(s.base)} − ${vnd(s.award)}) × ${num(s.qty)}`), cls: 'num', w: 'minmax(220px,2fr)' },
      { h: 'Saving', r: (s) => `<b>${vnd(s.val)}</b>`, cls: 'num', w: '140px' },
      { h: 'Status', r: (s) => `${pill(s.status === 'Validated' ? 'Validated by Finance' : s.status, s.status === 'Validated' ? 'success' : s.status === 'Submitted' ? 'warning' : 'neutral')}${s.by ? `<div class="small muted">${esc(s.by)}</div>` : ''}${s.status === 'Draft' && !s.tender ? `<div class="mt-s"><button class="btn btn-sm" data-rp="submit" data-id="${s.id}">Submit</button></div>` : ''}${s.status === 'Submitted' ? `<div class="mt-s"><button class="btn btn-sm" data-rp="validate" data-id="${s.id}"${isFin ? '' : ' disabled aria-describedby="rp-fin-h"'}>Validate</button></div>` : ''}`, w: 'minmax(170px,1.4fr)' }
    ], SV, { min: 1000, label: 'Saving records' }) + `<p class="small muted" id="rp-fin-h">${isFin ? 'You validate as Finance (Đỗ Hoàng Nam).' : 'Only Finance (Đỗ Hoàng Nam) can validate saving records.'}</p>`, '<button class="btn btn-sm" data-act="toast" data-msg="Exported Saving_records_2026.xlsx">Export saving records</button>');

    const SPEND = 186.4; const top5 = R().spendVendor.slice(0, 5).reduce((a, x) => a + x[1], 0);
    const cubeRows = st.cube === 'vendor' ? R().spendVendor.map(([v, x], i) => ({ label: App.vshort(App.vendor(v)), value: x, note: i < 5 ? 'top 5' : '', href: '#/vendors/' + v })).concat([{ label: `Other ${R().otherVendors} vendors`, value: SPEND - R().spendVendor.reduce((a, x) => a + x[1], 0), dim: true }])
      : st.cube === 'mat' ? D().materials.filter((m) => m.spendYtd).sort((a, b) => b.spendYtd - a.spendYtd).map((m) => ({ label: `${m.id} ${m.name}`, value: m.spendYtd, href: '#/material360?id=' + m.id }))
        : Object.values(D().budgets).map((b) => ({ label: b.name, value: (b.invoiced + b.committed) / 1e9 }));
    const cube = card('Spend cube', `<div class="seg" role="group" aria-label="Spend by">${[['vendor', 'By vendor'], ['mat', 'By Material ID'], ['project', 'By project']].map(([k, l]) => `<button data-rp="cube" data-k="${k}" aria-pressed="${st.cube === k}">${l}</button>`).join('')}</div><div class="mt">${App.chart.bars(cubeRows, (v) => num(v, 2) + ' tỷ ₫')}</div>
      <p class="small muted">Spend YTD ${num(SPEND, 1)} tỷ ₫ excl. VAT · keyed by Material ID → category. ${st.cube === 'vendor' ? `<b>Top 5 vendors = ${num(top5, 2)} tỷ ₫ = ${pct(top5 / SPEND * 100)}</b> (concentration).` : st.cube === 'project' ? 'Project spend = invoiced + committed.' : 'Material IDs in this sample.'}</p>`);
    const off = offContract();
    const cover = card('Contract coverage & off-contract spend', `<div class="grid-k">${kpi('Contract coverage', pct(R().coverage), 'Spend under an active contract')}${kpi('Off-contract', pct(100 - R().coverage), 'Material IDs with a contract, bought outside it', 'warning')}</div>` + table([
      { h: 'Material ID', r: (x) => mid(x.m), w: '120px' }, { h: 'PO', r: (x) => `<a class="mono" href="#/po/${x.d.id}">${x.d.id}</a><div class="small muted">${esc(x.d.date)}</div>`, w: '130px' },
      { h: 'Bought from', r: (x) => esc(App.vshort(App.vendor(x.d.vendor))), w: 'minmax(120px,1fr)' }, { h: 'Contract in force', r: (x) => `<a class="mono" href="#/contracts/${x.c.id}">${x.c.id}</a><div class="small muted">${esc(App.vshort(App.vendor(x.c.vendor)))}</div>`, w: 'minmax(130px,1fr)' },
      { h: 'Value excl. VAT', r: (x) => vnd(x.d.value), cls: 'num', w: '140px' }
    ], off, { min: 700, empty: 'No off-contract POs', label: 'Off-contract POs' }));
    const C = R().cycle;
    const cycle = card('Cycle times', `<div class="grid-k">${kpi('PR → PO median', num(C.median, 1) + ' days', `Target ≤ ${C.target} days`, C.median <= C.target ? 'success' : 'warning')}${kpi('Approval time', num(C.approval, 1) + ' days', 'Median per step')}${kpi('Tender duration', num(C.tender) + ' days', 'Invite → award, median')}</div>`
      + table([{ h: 'Route', r: (r) => esc(r[0]), w: 'minmax(200px,2fr)' }, { h: 'Median PR → PO', r: (r) => num(r[1], 1) + ' days', cls: 'num', w: '150px' }, { h: 'POs', r: (r) => num(r[2]), cls: 'num', w: '80px' }], C.routes, { min: 460, label: 'Cycle time by route' }));
    const budget = card('Budget vs committed vs actual', table([
      { h: 'Project / budget line', r: (b) => `${esc(b.name)}<div class="stack-bar mt-s" role="img" aria-label="Invoiced ${ty(b.invoiced)}, committed ${ty(b.committed)} of ${ty(b.budget)}"><span class="sb-inv" style="width:${(b.invoiced / b.budget * 100).toFixed(1)}%"></span><span class="sb-warn" style="width:${(b.committed / b.budget * 100).toFixed(1)}%"></span></div>`, w: 'minmax(240px,2.4fr)' },
      { h: 'Budget', r: (b) => vnd(b.budget), cls: 'num', w: '150px' }, { h: 'Invoiced (actual)', r: (b) => vnd(b.invoiced), cls: 'num', w: '150px' }, { h: 'Committed', r: (b) => vnd(b.committed), cls: 'num', w: '150px' },
      { h: 'Available', r: (b) => `<b>${vnd(b.budget - b.invoiced - b.committed)}</b>`, cls: 'num', w: '150px' }, { h: 'Used', r: (b) => pct((b.invoiced + b.committed) / b.budget * 100), cls: 'num', w: '80px' }
    ], Object.values(D().budgets), { min: 1000, label: 'Budget vs committed vs actual' }) + '<p class="small muted">Available = Budget − Invoiced − Committed · committed = open PO value not yet invoiced · bar: dark = invoiced, amber = committed.</p>');
    return `<div class="page-h"><div><h1>${esc(App.t('Reports'))}</h1><div class="sub">OTIF, saving, spend and budget · every figure traces to Material ID lines · excl. VAT</div></div>
      <div class="acts"><button class="btn" data-act="toast" data-msg="Exported Reports_02-11-2026.xlsx">Export Excel</button><button class="btn" data-act="toast" data-msg="Exported Reports_02-11-2026.pdf">Export PDF</button></div></div>
      ${filters}<h2 class="h-sub">Delivery performance (OTIF)</h2>${otifK}<div class="grid-2"><div class="stack">${trend}</div><div class="stack">${byVendor}</div></div>
      <h2 class="h-sub">Saving</h2>${savK}<div class="grid-2"><div class="stack">${recs}</div><div class="stack">${byCat}</div></div>
      <h2 class="h-sub">Spend analytics</h2><div class="grid-2"><div class="stack">${cube}${cover}</div><div class="stack">${cycle}</div></div>${budget}`;
  }

  App.page('reports', {
    title: 'Reports', ws: 'procurement', roles: ['procurement', 'admin'], render,
    mount(root) {
      root.addEventListener('change', (e) => { const k = e.target.dataset.rpf; if (!k) return; st[k] = e.target.value; App.render(); const x = document.getElementById(e.target.id); x && x.focus(); });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-rp]'); if (!b) return; const k = b.dataset.rp;
        if (k === 'cube') { st.cube = b.dataset.k; App.render(); return; }
        const s = R().savings.find((x) => x.id === b.dataset.id); if (!s) return;
        if (k === 'submit') { s.status = 'Submitted'; App.render(); App.toast(`${s.id} submitted to Finance`); }
        else if (k === 'validate' && S.me() === 'Đỗ Hoàng Nam') { s.status = 'Validated'; s.by = 'Đỗ Hoàng Nam · ' + D().today; st.extraVal += s.val; App.render(); App.toast(`${s.id} validated by Finance`); }
      });
    }
  });
})();
