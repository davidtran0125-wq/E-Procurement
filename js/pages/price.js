/* Module 13 · Price history — F-76 Material ID + period / vendor / source filters, F-77 price KPIs (last, 12-month weighted, min–max, vs 90-day),
   F-78 monthly chart + vendor comparison, F-79 ±N% alert rule (R-15), F-80 price records from PO / Bid / Quotation / Invoice / Contract,
   all excl. VAT; foreign currency shown with its VND equivalent (R-23). Routes: #/price(/trend|vendors|rule) (?id=) */
(function () {
  const { esc, num, pct, vnd, mid, pill, table, kpi, block, layout, t, tv } = App;
  const S = App.src;
  const D = () => window.DATA;
  I18N.add({
    'ph.sub.records': ['Price records', 'Bản ghi giá'], 'ph.sub.trend': ['Monthly trend', 'Xu hướng theo tháng'], 'ph.sub.vendors': ['Vendor comparison', 'So sánh NCC'], 'ph.sub.rule': ['Alert rule', 'Quy tắc cảnh báo'],
    'ph.subtitle': ['{m} · per {u} · all prices excl. VAT', '{m} · theo {u} · mọi giá chưa VAT'], 'ph.exportMsg': ['Exported PriceHistory_{id}.xlsx ({n} rows)', 'Đã xuất PriceHistory_{id}.xlsx ({n} dòng)'], 'ph.open360': ['Open Material 360°', 'Mở Vật tư 360°'],
    'ph.notFound': ['Material ID {id} was not found.', 'Không tìm thấy mã vật tư {id}.'], 'ph.back': ['Back to price history', 'Về lịch sử giá'],
    'ph.f.period': ['Period', 'Kỳ'], 'ph.p.12m': ['Last 12 months', '12 tháng gần nhất'], 'ph.p.ytd': ['Year to date', 'Từ đầu năm'], 'ph.p.24m': ['Last 24 months', '24 tháng gần nhất'], 'ph.allVendors': ['All vendors', 'Mọi NCC'], 'ph.f.source': ['Source', 'Nguồn'], 'ph.allSources': ['All sources', 'Mọi nguồn'],
    'ph.k.last': ['Last price (excl. VAT)', 'Giá gần nhất (chưa VAT)'], 'ph.k.noPurchase': ['No purchase yet', 'Chưa mua'], 'ph.k.avg': ['Average in view', 'Bình quân trong kỳ'], 'ph.k.avgN': ['Σ(qty × price) ÷ Σqty · {n} records with a qty', 'Σ(SL × giá) ÷ ΣSL · {n} bản ghi có SL'],
    'ph.k.minmax': ['Min – max', 'Thấp nhất – cao nhất'], 'ph.k.minmaxN': ['Records and monthly averages', 'Bản ghi và bình quân tháng'], 'ph.k.vs90': ['vs 90-day average', 'So với BQ 90 ngày'], 'ph.k.vs90N': ['Last {l} vs {a} · {n} records since {d}', 'Gần nhất {l} so với {a} · {n} bản ghi từ {d}'],
    'ph.k.alert': [' · price alert', ' · cảnh báo giá'], 'ph.k.basis': [' · Dashboard alert basis: monthly series avg {v} (incl. records outside this sample)', ' · cơ sở cảnh báo trên Bảng điều khiển: BQ chuỗi tháng {v} (gồm bản ghi ngoài mẫu)'], 'ph.k.no90': ['No records with a qty in the last 90 days', 'Không có bản ghi có SL trong 90 ngày qua'],
    'ph.ch.title': ['Monthly average price · {m}', 'Giá bình quân theo tháng · {m}'], 'ph.ch.all': ['All vendors (weighted avg)', 'Mọi NCC (BQ gia quyền)'], 'ph.ch.label': ['Monthly weighted average price of {m} from {a} to {b}, excl. VAT', 'Giá bình quân gia quyền theo tháng của {m} từ {a} đến {b}, chưa VAT'],
    'ph.ch.vendorPrices': ['; vendor prices: {v}', '; giá theo NCC: {v}'], 'ph.ch.note': ['Weighted average per {u}, excl. VAT, all vendors (blue line)', 'Bình quân gia quyền theo {u}, chưa VAT, mọi NCC (đường xanh)'], 'ph.ch.dots': [' · vendor dots = recorded prices that month (PO, bid, quotation, invoice, contract)', ' · chấm theo NCC = giá ghi nhận trong tháng (PO, hồ sơ thầu, báo giá, hóa đơn, hợp đồng)'],
    'ph.ch.none': ['No price records yet', 'Chưa có bản ghi giá'], 'ph.tr': ['tr', 'tr'],
    'ph.c.records': ['Records', 'Số bản ghi'], 'ph.c.latest': ['Latest price', 'Giá gần nhất'], 'ph.c.vsCheap': ['vs cheapest', 'So với rẻ nhất'], 'ph.cheapest': ['Cheapest', 'Rẻ nhất'], 'ph.noVendors': ['No approved vendors', 'Chưa có NCC được duyệt'],
    'ph.r.thr': ['Threshold (± %)', 'Ngưỡng (± %)'], 'ph.r.hint': ['Between 1 and 20%', 'Từ 1 đến 20%'], 'ph.r.save': ['Save rule', 'Lưu quy tắc'], 'ph.r.text': ['Notify Procurement when a new price differs from its 90-day average by more than ±{p}%.', 'Báo bộ phận Mua sắm khi giá mới chênh lệch so với bình quân 90 ngày quá ±{p}%.'],
    'ph.r.note': ['Applies to every Material ID; alerts appear on the Dashboard ("Price alerts by Material ID") and in notifications for the category buyer.', 'Áp dụng cho mọi mã vật tư; cảnh báo hiện trên Bảng điều khiển ("Cảnh báo giá theo mã vật tư") và thông báo cho người mua phụ trách nhóm hàng.'],
    'ph.r.title': ['Price alert rule', 'Quy tắc cảnh báo giá'], 'ph.r.edit': ['Edit rule', 'Sửa quy tắc'], 'ph.r.e': ['Enter a threshold between 1 and 20%.', 'Nhập ngưỡng từ 1 đến 20%.'], 'ph.r.saved': ['Price alert rule saved · ±{p}%', 'Đã lưu quy tắc cảnh báo giá · ±{p}%'],
    'ph.recs': ['Price records ({n})', 'Bản ghi giá ({n})'], 'ph.c.doc': ['Document', 'Chứng từ'], 'ph.c.qty': ['Qty', 'SL'], 'ph.c.unit': ['Unit price excl. VAT', 'Đơn giá chưa VAT'], 'ph.c.dprev': ['Δ vs previous PO', 'Δ so với PO trước'], 'ph.c.use': ['Use', 'Mục đích'],
    'ph.empty': ['No price records for these filters', 'Không có bản ghi giá phù hợp bộ lọc'], 'ph.recNote': ['Bids are recorded only after bid opening. Invoices are recorded when the price differs from the PO. Foreign-currency prices are converted to VND (rate source and date shown).', 'Giá dự thầu chỉ được ghi sau khi mở thầu. Hóa đơn được ghi khi giá khác PO. Giá ngoại tệ được quy đổi sang VND (có nguồn và ngày tỷ giá).']
  });
  I18N.values({
    Bid: 'Hồ sơ thầu', Invoice: 'Hóa đơn', Contract: 'Hợp đồng', 'Contract release': 'Phát hành từ hợp đồng', 'Invoice ≠ PO price': 'Giá hóa đơn ≠ giá PO', 'After bid opening': 'Sau mở thầu', 'Contract price': 'Giá hợp đồng', 'Current baseline': 'Giá cơ sở hiện hành',
    'Saving baseline': 'Cơ sở tính tiết kiệm', 'Tender round 1': 'Vòng thầu 1', 'Contract price Q4 (Phụ lục 01)': 'Giá hợp đồng Q4 (Phụ lục 01)', 'Spot quote': 'Báo giá lẻ', 'PR estimate (PR-2026-0431)': 'Ước tính PR (PR-2026-0431)', 'Spot quote · imported': 'Báo giá lẻ · nhập khẩu',
    'Vietcombank selling rate': 'Tỷ giá bán Vietcombank', 'Cummins Power Generation (import)': 'Cummins Power Generation (nhập khẩu)'
  });
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
    Object.entries(D().tenders).forEach(([k, tn]) => (tn.bidders || []).forEach((b) => { const i = tn.lines.findIndex((l) => l.mat === id); if (i >= 0 && b.prices && b.vid) add({ mat: id, date: (tn.opening && tn.opening.price.at.slice(0, 10)) || S.docOf(k).close, src: 'Bid', doc: k, vendor: b.vid, qty: tn.lines[i].qty, price: b.prices[i], use: tn.award && tn.award.status === 'Approved' && tn.award.pick[i] === b.vid ? 'Awarded' : 'After bid opening' }); }));
    D().contracts.forEach((c) => c.lines.forEach((l) => { if (l.mat === id && l.q4) add({ mat: id, date: c.start, src: 'Contract', doc: c.id, vendor: c.vendor, qty: null, price: l.q4, use: 'Contract price' }); }));
    out.sort((a, b) => App.dt(a.date) - App.dt(b.date));
    let prev = null; out.forEach((r) => { if (r.src === 'PO') { r.dPrev = prev ? (r.price - prev) / prev * 100 : null; prev = r.price; } else r.dPrev = prev ? (r.price - prev) / prev * 100 : null; });
    const pos = out.filter((r) => r.src === 'PO'); if (pos.length) { const last = pos[pos.length - 1]; if (!last.use || last.use === 'Contract release') last.use = 'Current baseline'; }
    if (id === 'CON-24015') { const b = out.find((r) => r.doc === 'PO-2026-0791'); if (b) b.use = 'Saving baseline'; }
    return out.reverse();
  }
  const vname = (r) => (r.vendor ? App.vshort(App.vendor(r.vendor)) : tv(r.vname) || '—');
  const sg = (x) => `${x > 0 ? '+' : x < 0 ? '−' : '±'}${pct(Math.abs(x))}`;

  const SUBS = [['', 'ph.sub.records'], ['trend', 'ph.sub.trend'], ['vendors', 'ph.sub.vendors'], ['rule', 'ph.sub.rule']];
  function render(p, subArg) {
    if (p.id && p.id !== st.lastId) { st.lastId = p.id; st.id = p.id; st.vendor = 'all'; }
    const cur = App.sub(SUBS, subArg || '');
    const m = App.material(st.id);
    if (!m) return layout({ title: t('nav.price'), blocks: [block(null, App.errorState(t('ph.notFound', { id: st.id })) + `<p class="m-0"><a class="btn" href="#/price?id=CON-24015">${esc(t('ph.back'))}</a></p>`)] });
    const mats = D().materials.filter((x) => x.last || records(x.id).length);
    const from = { '12m': '02/11/2025', ytd: '01/01/2026', '24m': '02/11/2024' }[st.period];
    const all = records(m.id); const vendors = [...new Set(all.map((r) => r.vendor).filter(Boolean))];
    const rows = all.filter((r) => App.dt(r.date) >= App.dt(from) && (st.vendor === 'all' || r.vendor === st.vendor) && (st.src === 'all' || r.src === st.src));
    const ser = series(m); const prices = rows.map((r) => r.price).concat(ser || []);
    const wavg = (xs) => { const q = xs.filter((r) => r.qty > 0); const tq = q.reduce((a, r) => a + r.qty, 0); return tq ? q.reduce((a, r) => a + r.qty * r.price, 0) / tq : null; };
    const avg = wavg(rows); const r90 = rows.filter((r) => App.daysTo(r.date) >= -90); const avg90 = wavg(r90);
    const d90 = m.last && avg90 ? (m.last - avg90) / avg90 * 100 : null; const thr = D().priceAlertThreshold;
    const filters = `<div class="filters"><label class="sr" for="ph-id">${esc(t('c.mid'))}</label><select class="inp" id="ph-id" data-phf="id">${mats.map((x) => `<option value="${esc(x.id)}"${x.id === m.id ? ' selected' : ''}>${esc(x.id)} · ${esc(x.name)}</option>`).join('')}</select>
      <label class="sr" for="ph-p">${esc(t('ph.f.period'))}</label><select class="inp" id="ph-p" data-phf="period">${['12m', 'ytd', '24m'].map((k) => `<option value="${k}"${st.period === k ? ' selected' : ''}>${esc(t('ph.p.' + k))}</option>`).join('')}</select>
      <label class="sr" for="ph-v">${esc(t('c.vendor'))}</label><select class="inp" id="ph-v" data-phf="vendor"><option value="all">${esc(t('ph.allVendors'))}</option>${vendors.map((v) => `<option value="${esc(v)}"${st.vendor === v ? ' selected' : ''}>${esc(App.vshort(App.vendor(v)))}</option>`).join('')}</select>
      <label class="sr" for="ph-s">${esc(t('ph.f.source'))}</label><select class="inp" id="ph-s" data-phf="src"><option value="all">${esc(t('ph.allSources'))}</option>${SRC.map((s) => `<option value="${s}"${st.src === s ? ' selected' : ''}>${esc(tv(s))}</option>`).join('')}</select></div>`;
    const kpis = [kpi(t('ph.k.last'), m.last ? vnd(m.last) : '—', m.lastPo ? `${esc(m.lastPo)} · ${esc(App.vshort(App.vendor(m.lastVendor)))}` : esc(t('ph.k.noPurchase'))),
      kpi(t('ph.k.avg'), avg ? vnd(avg) : '—', esc(t('ph.k.avgN', { n: rows.filter((r) => r.qty > 0).length }))),
      kpi(t('ph.k.minmax'), prices.length ? `${num(Math.min(...prices) / 1e6, 2)} – ${num(Math.max(...prices) / 1e6, 2)} ${t('ph.tr')}` : '—', esc(t('ph.k.minmaxN'))),
      kpi(t('ph.k.vs90'), d90 != null ? sg(d90) : '—', esc(avg90 ? t('ph.k.vs90N', { l: vnd(m.last), a: vnd(avg90), n: r90.filter((r) => r.qty > 0).length, d: App.addDays(D().today, -90) }) + (Math.abs(d90) > thr ? t('ph.k.alert') : '') + (m.avg90 && Math.round(m.avg90) !== Math.round(avg90) ? t('ph.k.basis', { v: vnd(m.avg90) }) : '') : t('ph.k.no90')), d90 != null && Math.abs(d90) > thr ? (d90 > 0 ? 'danger' : 'success') : '')];
    let blocks;
    if (cur === 'trend') {
      const mk = (dt) => dt.slice(3, 5) + '/' + dt.slice(8, 10);
      const vSeries = ser ? (st.vendor === 'all' ? vendors : [st.vendor]).map((vid) => { const vals = MONTHS.map((mo) => { const xs = all.filter((r) => r.vendor === vid && mk(r.date) === mo && (st.src === 'all' || r.src === st.src)); return xs.length ? xs.reduce((a, r) => a + r.price, 0) / xs.length : null; }); return { name: App.vshort(App.vendor(vid)), values: vals }; }).filter((x) => x.values.some((v) => v != null)).slice(0, 3) : [];
      blocks = [block(t('ph.ch.title', { m: m.id }), filters + (ser ? App.chart.line({ labels: MONTHS, values: ser, name: t('ph.ch.all'), series: vSeries, fmt: (v, axis) => (axis ? num(v / 1e6, v < 1e7 ? 2 : 1) + ' tr' : vnd(v)), label: t('ph.ch.label', { m: m.id, a: vnd(ser[0]), b: vnd(ser[11]) }) + (vSeries.length ? t('ph.ch.vendorPrices', { v: vSeries.map((x) => x.name + ' ' + x.values.map((v, i) => (v == null ? '' : MONTHS[i] + ' ' + vnd(v))).filter(Boolean).join(', ')).join('; ') }) : '') }) + `<p class="small muted">${esc(t('ph.ch.note', { u: m.uom }) + (vSeries.length ? t('ph.ch.dots') : ''))}.</p>` : App.emptyState(t('ph.ch.none'))))];
    } else if (cur === 'vendors') {
      const latestOf = (vid) => { const xs = all.filter((r) => r.vendor === vid).sort((a, b) => App.dt(b.date) - App.dt(a.date)); return xs.length ? xs[0] : null; };
      const withRec = m.vendors.filter((v) => latestOf(v[0])); const cheapest = withRec.length ? Math.min(...withRec.map((v) => latestOf(v[0]).price)) : null;
      blocks = [block(t('ph.sub.vendors'), m.vendors.length ? table([
        { h: t('c.vendor'), r: (v) => `<a href="#/vendors/${esc(v[0])}">${esc(App.vshort(App.vendor(v[0])))}</a> ${pill(v[1], v[1] === 'Blocked' ? 'danger' : v[1] === 'Preferred' ? 'success' : 'neutral')}`, w: 'minmax(180px,2fr)' },
        { h: t('ph.c.records'), r: (v) => String(all.filter((r) => r.vendor === v[0]).length), cls: 'num', w: '100px' },
        { h: t('ph.c.latest'), r: (v) => { const x = latestOf(v[0]); return x ? `${vnd(x.price)}<div class="small muted">${esc(tv(x.src))} · ${esc(x.date)}</div>` : '—'; }, cls: 'num', w: '170px' },
        { h: t('ph.c.vsCheap'), r: (v) => { const x = latestOf(v[0]); return !x ? '—' : x.price === cheapest ? pill(t('ph.cheapest'), 'success') : '+' + pct((x.price - cheapest) / cheapest * 100); }, cls: 'num', w: '130px' }
      ], m.vendors, { label: t('ph.sub.vendors') }) : App.emptyState(t('ph.noVendors')))];
    } else if (cur === 'rule') {
      const rule = st.rule != null ? `<form id="ph-rule" class="stack" novalidate><div class="field"><label for="ph-thr">${esc(t('ph.r.thr'))}</label><input id="ph-thr" class="inp" inputmode="decimal" value="${esc(st.rule)}"${st.rerr ? ' aria-invalid="true" aria-describedby="ph-thr-e"' : ''}>${st.rerr ? `<span class="err" id="ph-thr-e" role="alert">${esc(t(st.rerr))}</span>` : ''}<span class="hint">${esc(t('ph.r.hint'))}</span></div><div class="row-acts"><button type="button" class="btn btn-sm" data-ph="rule-cancel">${esc(t('c.cancel'))}</button><button type="submit" class="btn btn-sm btn-p">${esc(t('ph.r.save'))}</button></div></form>`
        : `<p class="mt-0">${esc(t('ph.r.text', { p: num(thr, 1) }))}</p><p class="small muted">${esc(t('ph.r.note'))}</p>`;
      blocks = [block(t('ph.r.title'), rule, { span: 6, actions: st.rule != null ? '' : `<button class="btn btn-sm" data-ph="rule-edit">${esc(t('ph.r.edit'))}</button>` })];
    } else {
      blocks = [block(t('ph.recs', { n: rows.length }), filters + table([
        { h: t('c.date'), r: (r) => `<span class="nowrap">${esc(r.date)}</span>`, w: '100px' },
        { h: t('ph.f.source'), r: (r) => pill(r.src, r.src === 'PO' ? 'info' : r.src === 'Invoice' ? 'warning' : 'neutral'), w: '120px' },
        { h: t('ph.c.doc'), r: (r) => `<span class="mono small">${esc(r.doc)}</span>`, w: 'minmax(130px,1.2fr)' },
        { h: t('c.vendor'), r: (r) => esc(vname(r)), w: 'minmax(120px,1.2fr)' },
        { h: t('ph.c.qty'), r: (r) => (r.qty != null ? `${num(r.qty)} ${esc(m.uom)}` : '—'), cls: 'num', w: '90px' },
        { h: t('ph.c.unit'), r: (r) => `${vnd(r.price)}${r.cur ? `<div class="small muted">${num(r.orig)} ${esc(r.cur)} × ${num(D().fx[r.cur])} · ${esc(tv(D().fx.src))} ${esc(D().fx.at)}</div>` : ''}`, cls: 'num', w: '170px' },
        { h: t('ph.c.dprev'), r: (r) => (r.dPrev != null ? sg(r.dPrev) : '—'), cls: 'num', w: '120px' },
        { h: t('ph.c.use'), r: (r) => esc(r.use ? tv(r.use) : '—'), w: 'minmax(130px,1.3fr)' }
      ], rows, { empty: t('ph.empty'), label: t('ph.sub.records') }) + `<p class="small muted">${esc(t('ph.recNote'))}</p>`)];
    }
    return layout({
      title: t('nav.price'), subtitle: `${mid(m.id)} ${esc(t('ph.subtitle', { m: m.name, u: m.uom }))}`,
      actions: `<button class="btn" data-act="toast" data-msg="${esc(t('ph.exportMsg', { id: m.id, n: rows.length }))}">${esc(t('c.export'))}</button><a class="btn btn-p" href="#/material360?id=${esc(m.id)}">${esc(t('ph.open360'))}</a>`,
      alerts: App.unknownSub(SUBS, subArg), kpis, subnav: App.subnav('price', SUBS, cur, 'id=' + encodeURIComponent(m.id)), blocks
    });
  }

  App.page('price', {
    titleKey: 'nav.price', ws: 'procurement', roles: ['procurement', 'admin'], render,
    mount(root) {
      root.addEventListener('change', (e) => { const k = e.target.dataset.phf; if (!k) return; st[k] = e.target.value; if (k === 'id') { st.vendor = 'all'; st.lastId = e.target.value; const sub = (location.hash.split('?')[0].split('/')[2] || ''); location.hash = '#/price' + (sub ? '/' + sub : '') + '?id=' + e.target.value; return; } App.render(); const x = document.getElementById(e.target.id); x && x.focus(); });
      root.addEventListener('submit', (e) => { if (e.target.id !== 'ph-rule') return; e.preventDefault(); const v = Number(document.getElementById('ph-thr').value.replace(',', '.'));
        if (!(v >= 1 && v <= 20)) { st.rule = document.getElementById('ph-thr').value; st.rerr = 'ph.r.e'; App.render(); document.getElementById('ph-thr').focus(); return; }
        D().priceAlertThreshold = v; st.rule = null; st.rerr = ''; App.render(); App.toast(t('ph.r.saved', { p: num(v, 1) })); });
      root.addEventListener('click', (e) => { const b = e.target.closest('[data-ph]'); if (!b) return; if (b.dataset.ph === 'rule-edit') { st.rule = num(D().priceAlertThreshold, 1); st.rerr = ''; App.render(); document.getElementById('ph-thr').focus(); } else { st.rule = null; st.rerr = ''; App.render(); } });
    }
  });
})();
