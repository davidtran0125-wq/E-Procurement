/* Module 13 · Price history — F-76 Material ID + period / vendor / source filters, F-77 price KPIs (last, 12-month weighted, min–max, vs 90-day),
   F-78 monthly chart + vendor comparison, F-79 ±N% alert rule (R-15), F-80 price records from PO / Bid / Quotation / Invoice / Contract,
   all excl. VAT; foreign currency shown with its VND equivalent (R-23). Route: #/price (?id=) */
(function () {
  const { esc, num, pct, vnd, mid, pill, table, kpi, card } = App;
  const S = App.src;
  const D = () => window.DATA;
  const MONTHS = ['11/25', '12/25', '01/26', '02/26', '03/26', '04/26', '05/26', '06/26', '07/26', '08/26', '09/26', '10/26'];
  const st = { id: 'CON-24015', period: '12m', vendor: 'all', src: 'all', rule: null, rerr: '' };
  const SRC = ['PO', 'Bid', 'Quotation', 'Invoice', 'Contract'];
  const series = (m) => (m.series ? m.series : !m.avg12 ? null : MONTHS.map((_, i) => (i === 11 ? m.last : Math.round(m.avg12 * (1 + Math.sin(i * 1.3 + m.id.length) * 0.012 + ((m.avg90 - m.avg12) / m.avg12) * (i / 11))))));

  function records(id) {
    const out = D().priceRecords.filter((r) => r.mat === id).map((r) => ({ ...r }));
    const seen = new Set(out.map((r) => r.doc + r.src + (r.vendor || '')));
    const add = (r) => { const k = r.doc + r.src + (r.vendor || ''); if (!seen.has(k)) { seen.add(k); out.push(r); } };
    D().docs.filter((d) => d.type === 'PO' && d.mats.includes(id) && !/Draft|Pending|Cancelled/.test(d.status)).forEach((d) => {
      const p = D().pos[d.id]; const l = p ? p.lines.find((x) => x.mat === id) : d.mats[0] === id ? { qty: parseFloat(String(d.qty).replace(/\./g, '').replace(',', '.')), price: d.price } : null;
      if (l && l.price) add({ mat: id, date: d.date, src: 'PO', doc: d.id, vendor: d.vendor, qty: l.qty, price: l.price, use: p && p.contract ? 'Contract release' : '' });
    });
    Object.entries(D().invoices).forEach(([k, v]) => v.lines.forEach((x) => { const p = D().pos[v.po]; const pl = p && p.lines.find((l) => l.mat === id); if (x[0] === id && pl && x[3] !== pl.price) add({ mat: id, date: S.docOf(k).date, src: 'Invoice', doc: k, vendor: S.docOf(k).vendor, qty: x[2], price: x[3], use: 'Invoice ≠ PO price' }); }));
    Object.entries(D().tenders).forEach(([k, t]) => (t.bidders || []).forEach((b) => { const i = t.lines.findIndex((l) => l.mat === id); if (i >= 0 && b.prices && b.vid) add({ mat: id, date: (t.opening && t.opening.price.at.slice(0, 10)) || S.docOf(k).close, src: 'Bid', doc: k, vendor: b.vid, qty: t.lines[i].qty, price: b.prices[i], use: t.award && t.award.status === 'Approved' && t.award.pick[i] === b.vid ? 'Awarded' : 'After bid opening' }); }));
    D().contracts.forEach((c) => c.lines.forEach((l) => { if (l.mat === id && l.q4) add({ mat: id, date: c.start, src: 'Contract', doc: c.id, vendor: c.vendor, qty: null, price: l.q4, use: 'Contract price' }); }));
    out.sort((a, b) => App.dt(a.date) - App.dt(b.date));
    let prev = null; out.forEach((r) => { if (r.src === 'PO') { r.dPrev = prev ? (r.price - prev) / prev * 100 : null; prev = r.price; } else r.dPrev = prev ? (r.price - prev) / prev * 100 : null; });
    const pos = out.filter((r) => r.src === 'PO'); if (pos.length) { const last = pos[pos.length - 1]; if (!last.use || last.use === 'Contract release') last.use = 'Current baseline'; }
    if (id === 'CON-24015') { const b = out.find((r) => r.doc === 'PO-2026-0791'); if (b) b.use = 'Saving baseline'; }
    return out.reverse();
  }
  const vname = (r) => (r.vendor ? App.vshort(App.vendor(r.vendor)) : r.vname || '—');
  const sg = (x) => `${x > 0 ? '+' : x < 0 ? '−' : '±'}${pct(Math.abs(x))}`;

  function render(p) {
    if (p.id && p.id !== st.lastId) { st.lastId = p.id; st.id = p.id; st.vendor = 'all'; }
    const m = App.material(st.id);
    const mats = D().materials.filter((x) => x.last || records(x.id).length);
    if (!m) return App.errorState(`Material ID ${st.id} was not found.`, ' <a href="#/price">Back to price history</a>');
    const from = { '12m': '02/11/2025', ytd: '01/01/2026', '24m': '02/11/2024' }[st.period];
    const all = records(m.id); const vendors = [...new Set(all.map((r) => r.vendor).filter(Boolean))];
    const rows = all.filter((r) => App.dt(r.date) >= App.dt(from) && (st.vendor === 'all' || r.vendor === st.vendor) && (st.src === 'all' || r.src === st.src));
    const ser = series(m); const prices = rows.map((r) => r.price).concat(ser || []);
    const d90 = m.last && m.avg90 ? (m.last - m.avg90) / m.avg90 * 100 : null; const thr = D().priceAlertThreshold;
    const filters = `<div class="card filters"><label class="sr" for="ph-id">Material ID</label><select class="inp" id="ph-id" data-phf="id">${mats.map((x) => `<option value="${esc(x.id)}"${x.id === m.id ? ' selected' : ''}>${esc(x.id)} · ${esc(x.name)}</option>`).join('')}</select>
      <label class="sr" for="ph-p">Period</label><select class="inp" id="ph-p" data-phf="period">${[['12m', 'Last 12 months'], ['ytd', 'Year to date'], ['24m', 'Last 24 months']].map(([k, l]) => `<option value="${k}"${st.period === k ? ' selected' : ''}>${l}</option>`).join('')}</select>
      <label class="sr" for="ph-v">Vendor</label><select class="inp" id="ph-v" data-phf="vendor"><option value="all">All vendors</option>${vendors.map((v) => `<option value="${esc(v)}"${st.vendor === v ? ' selected' : ''}>${esc(App.vshort(App.vendor(v)))}</option>`).join('')}</select>
      <label class="sr" for="ph-s">Source</label><select class="inp" id="ph-s" data-phf="src"><option value="all">All sources</option>${SRC.map((s) => `<option${st.src === s ? ' selected' : ''}>${s}</option>`).join('')}</select></div>`;
    const kpis = `<div class="grid-k">${kpi('Last price (excl. VAT)', m.last ? vnd(m.last) : '—', m.lastPo ? `${esc(m.lastPo)} · ${esc(App.vshort(App.vendor(m.lastVendor)))}` : 'No purchase yet')}
      ${kpi('12-month average', m.avg12 ? vnd(m.avg12) : '—', `Weighted by quantity · ${rows.length} records in view`)}
      ${kpi('Min – max', prices.length ? `${num(Math.min(...prices) / 1e6, 2)} – ${num(Math.max(...prices) / 1e6, 2)} tr` : '—', 'Records and monthly averages')}
      ${kpi('vs 90-day average', d90 != null ? sg(d90) : '—', m.avg90 ? `90-day avg ${vnd(m.avg90)}${Math.abs(d90) > thr ? ' · price alert' : ''}` : '', d90 != null && Math.abs(d90) > thr ? (d90 > 0 ? 'danger' : 'success') : '')}</div>`;
    const chart = card(`Monthly average price · ${m.id}`, ser ? App.chart.line({ labels: MONTHS, values: ser, fmt: (v, axis) => (axis ? num(v / 1e6, v < 1e7 ? 2 : 1) + ' tr' : vnd(v)), label: `Monthly weighted average price of ${m.id} from ${vnd(ser[0])} to ${vnd(ser[11])}, excl. VAT` }) + `<p class="small muted">Weighted average per ${esc(m.uom)}, excl. VAT, all vendors.</p>` : App.emptyState('No price records yet'));
    const cheapest = Math.min(...m.vendors.map((v) => v[2]));
    const cmp = card('Vendor comparison', m.vendors.length ? table([
      { h: 'Vendor', r: (v) => `<a href="#/vendors/${esc(v[0])}">${esc(App.vshort(App.vendor(v[0])))}</a> ${pill(v[1], v[1] === 'Blocked' ? 'danger' : v[1] === 'Preferred' ? 'success' : 'neutral')}`, w: 'minmax(170px,2fr)' },
      { h: 'Records', r: (v) => String(all.filter((r) => r.vendor === v[0]).length), cls: 'num', w: '80px' },
      { h: 'Latest price', r: (v) => vnd(v[2]), cls: 'num', w: '140px' },
      { h: 'vs cheapest', r: (v) => (v[2] === cheapest ? pill('Cheapest', 'success') : '+' + pct((v[2] - cheapest) / cheapest * 100)), cls: 'num', w: '110px' }
    ], m.vendors, { min: 520, label: 'Vendor comparison' }) : App.emptyState('No approved vendors'));
    const rule = st.rule != null ? `<form id="ph-rule" class="stack" novalidate><div class="field"><label for="ph-thr">Threshold (± %)</label><input id="ph-thr" class="inp" inputmode="decimal" value="${esc(st.rule)}"${st.rerr ? ' aria-invalid="true" aria-describedby="ph-thr-e"' : ''}>${st.rerr ? `<span class="err" id="ph-thr-e" role="alert">${esc(st.rerr)}</span>` : ''}<span class="hint">Between 1 and 20%</span></div><div class="row-acts"><button type="button" class="btn btn-sm" data-ph="rule-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Save rule</button></div></form>`
      : `<p class="mt-0">Notify Procurement when a new price differs from its 90-day average by more than <b>±${num(thr, 1)}%</b>.</p><p class="small muted">Applies to every Material ID; alerts appear on the Dashboard ("Price alerts by Material ID") and in notifications for the category buyer.</p>`;
    const ruleCard = card('Price alert rule', rule, st.rule != null ? '' : '<button class="btn btn-sm" data-ph="rule-edit">Edit rule</button>');
    const recs = card(`Price records (${rows.length})`, table([
      { h: 'Date', k: 'date', w: '100px' },
      { h: 'Source', r: (r) => pill(r.src, r.src === 'PO' ? 'info' : r.src === 'Invoice' ? 'warning' : 'neutral'), w: '100px' },
      { h: 'Document', r: (r) => `<span class="mono small">${esc(r.doc)}</span>`, w: 'minmax(130px,1.2fr)' },
      { h: 'Vendor', r: (r) => esc(vname(r)), w: 'minmax(130px,1.3fr)' },
      { h: 'Qty', r: (r) => (r.qty != null ? `${num(r.qty)} ${esc(m.uom)}` : '—'), cls: 'num', w: '100px' },
      { h: 'Unit price excl. VAT', r: (r) => `${vnd(r.price)}${r.cur ? `<div class="small muted">${num(r.orig)} ${esc(r.cur)} × ${num(D().fx[r.cur])} · ${esc(D().fx.src)} ${esc(D().fx.at)}</div>` : ''}`, cls: 'num', w: '190px' },
      { h: 'Δ vs previous PO', r: (r) => (r.dPrev != null ? sg(r.dPrev) : '—'), cls: 'num', w: '120px' },
      { h: 'Use', r: (r) => esc(r.use || '—'), w: 'minmax(140px,1.4fr)' }
    ], rows, { min: 1040, empty: 'No price records for these filters', label: 'Price records' }) + '<p class="small muted">Bids are recorded only after bid opening. Invoices are recorded when the price differs from the PO. Foreign-currency prices are converted to VND (rate source and date shown).</p>');
    return `<div class="page-h"><div><h1>${esc(App.t('Price history'))}</h1><div class="sub">${mid(m.id)} ${esc(m.name)} · per ${esc(m.uom)} · all prices excl. VAT</div></div>
      <div class="acts"><button class="btn" data-act="toast" data-msg="Exported PriceHistory_${esc(m.id)}.xlsx (${rows.length} rows)">Export Excel</button><a class="btn btn-p" href="#/material360?id=${esc(m.id)}">Open Material 360°</a></div></div>
      ${filters}${kpis}<div class="grid-2"><div class="stack">${chart}${recs}</div><div class="stack">${cmp}${ruleCard}</div></div>`;
  }

  App.page('price', {
    title: 'Price history', ws: 'procurement', roles: ['procurement', 'admin'], render,
    mount(root) {
      root.addEventListener('change', (e) => { const k = e.target.dataset.phf; if (!k) return; st[k] = e.target.value; if (k === 'id') { st.vendor = 'all'; st.lastId = e.target.value; location.hash = '#/price?id=' + e.target.value; return; } App.render(); const x = document.getElementById(e.target.id); x && x.focus(); });
      root.addEventListener('submit', (e) => { if (e.target.id !== 'ph-rule') return; e.preventDefault(); const v = Number(document.getElementById('ph-thr').value.replace(',', '.'));
        if (!(v >= 1 && v <= 20)) { st.rule = document.getElementById('ph-thr').value; st.rerr = 'Enter a threshold between 1 and 20%.'; App.render(); document.getElementById('ph-thr').focus(); return; }
        D().priceAlertThreshold = v; st.rule = null; st.rerr = ''; App.render(); App.toast(`Price alert rule saved · ±${num(v, 1)}%`); });
      root.addEventListener('click', (e) => { const b = e.target.closest('[data-ph]'); if (!b) return; if (b.dataset.ph === 'rule-edit') { st.rule = num(D().priceAlertThreshold, 1); st.rerr = ''; App.render(); document.getElementById('ph-thr').focus(); } else { st.rule = null; st.rerr = ''; App.render(); } });
    }
  });
})();
