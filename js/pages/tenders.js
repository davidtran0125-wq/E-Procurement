/* Module 8 · Tenders — F-40 list, F-41 sealed bids (R-05), F-42 progress/settings/attachments (R-09, R-10, R-19), F-43 two-person bid opening & minutes,
   F-44 anonymous Q&A + addendum (R-11), F-45 committee & COI, F-46 technical envelope, F-47 price matrix per Material ID & bid security,
   F-48 award recommendation (Tờ trình) → approvals, notices, Create PO after approval (R-12), F-49 e-auction (R-22) & foreign currency (R-23).
   Routes: #/tenders (?q=), #/tenders/new (?mat= | ?pr=), #/tenders/<id> */
(function () {
  const { esc, num, pct, vnd, ty, mid, pill, table, kpi, card } = App;
  const S = App.src;
  const D = () => window.DATA;
  const STEPS = ['Draft', 'Invited', 'Q&A', 'Bidding', 'Bid opening', 'Evaluation', 'Award'];
  const STEP_OF = { Draft: 0, Invited: 1, 'Q&A': 2, Open: 3, 'Bid opening': 4, Evaluation: 5, 'Award pending': 5, Awarded: 6 };
  const TABS = [['all', 'All'], ['Open', 'Open'], ['Q&A', 'Q&A'], ['Evaluation', 'Evaluation'], ['Awarded', 'Awarded'], ['Draft', 'Draft']];
  const METHODS = ['RFQ', 'Sealed bid', 'Two-envelope', 'e-Auction'];
  const st = { tab: 'all', q: '', method: 'all', cur: null, nf: null, nerr: {}, set: null, serr: {}, up: null, aw: null, awErr: {}, qa: null, qaErr: {} };
  const tones = { Open: 'info', 'Q&A': 'info', Evaluation: 'warning', 'Award pending': 'warning', Awarded: 'success', Draft: 'neutral', Invited: 'info', Cancelled: 'danger' };

  const list = () => D().docs.filter((d) => d.type === 'TND');
  const det = (id) => D().tenders[id];
  const mat = (id) => App.material(id) || { id, name: id, uom: '', vat: 10, vat8: false };
  const estOf = (l) => { const m = mat(l.mat); return (m.avg90 || m.last || 0) * l.qty; };
  const estTotal = (t) => t.lines.reduce((a, l) => a + estOf(l), 0);
  const post2026 = (t) => t && t.delivery && App.dt(t.delivery) > App.dt('31/12/2026');
  const vat8Flag = (t) => post2026(t) && t.lines.some((l) => mat(l.mat).vat8);
  const closeAt = (doc, t) => `${doc.close} ${(t && t.closeTime) || '17:00'}`;
  const closed = (doc) => App.daysTo(doc.close) < 0;
  const vname = (b) => (b.vid ? App.vshort(App.vendor(b.vid)) : b.name.split(' ').slice(-2).join(' '));

  /* ---------- F-40 list ---------- */
  function listPage(p) {
    if (p.q != null && p.q !== st.lastQ) { st.q = p.q; st.lastQ = p.q; st.tab = 'all'; }
    const all = list(); const cnt = (k) => (k === 'all' ? all.length : all.filter((d) => d.status === k).length);
    const q = st.q.trim();
    const rows = all.filter((d) => {
      const t = det(d.id) || {}; const bidders = (t.bidders || []).map((b) => b.name).join(' ');
      return (st.tab === 'all' || d.status === st.tab) && (st.method === 'all' || t.method === st.method)
        && (!q || App.matches(`${d.id} ${d.title} ${d.mats.join(' ')} ${bidders} ${d.mats.map((m) => mat(m).name).join(' ')}`, q));
    }).sort((a, b) => App.dt(b.date) - App.dt(a.date));
    const closing = all.filter((d) => ['Open', 'Q&A'].includes(d.status) && App.daysTo(d.close) >= 0 && App.daysTo(d.close) <= 7);
    return `<div class="page-h"><div><h1>${esc(App.t('Tenders'))}</h1><div class="sub">RFQ, sealed-bid, two-envelope and e-auction tenders · every tender lists its Material ID lines</div></div>
      <div class="acts"><button class="btn" data-act="toast" data-msg="Exported Tenders_02-11-2026.xlsx (${rows.length} rows)">Export Excel</button><a class="btn btn-p" href="#/tenders/new">${esc(App.t('New tender'))}</a></div></div>
      <div class="grid-k">${kpi('Active tenders', num(D().kpi.activeTenders), `${all.filter((d) => !['Awarded', 'Draft'].includes(d.status)).length} in this sample`)}${kpi('Closing ≤ 7 days', String(closing.length), closing.map((d) => d.id.slice(4)).join(', ') || 'None', closing.length ? 'warning' : '')}${kpi('In evaluation', String(cnt('Evaluation') + cnt('Award pending')), 'TND-2026-029 due 04/11/2026')}${kpi('Awarded', String(cnt('Awarded')), 'This sample · 2026')}</div>
      <div class="seg" role="group" aria-label="Status">${TABS.map(([k, l]) => `<button data-tn="tab" data-k="${k}" aria-pressed="${st.tab === k}">${l} (${cnt(k)})</button>`).join('')}</div>
      ${card('Tenders', `<div class="filters"><label class="sr" for="tn-q">Search tenders</label><input class="inp grow" id="tn-q" type="search" data-tnf="q" value="${esc(st.q)}" placeholder="Search ID, title, Material ID or bidder">
        <label class="sr" for="tn-m">Method</label><select class="inp" id="tn-m" data-tnf="method"><option value="all">All methods</option>${METHODS.map((m) => `<option${st.method === m ? ' selected' : ''}>${m}</option>`).join('')}</select></div>
        ${table([
          { h: 'Tender', r: (d) => `${S.tndLink(d.id)}<div class="small">${esc(d.title)}</div>`, w: 'minmax(220px,2.2fr)' },
          { h: 'Method', r: (d) => esc((det(d.id) || {}).method || '—'), w: '120px' },
          { h: 'Material IDs', r: (d) => `<span class="chips chips-inline">${d.mats.map(mid).join('')}</span>`, w: 'minmax(170px,1.6fr)' },
          { h: 'Closes', r: (d) => `${esc(d.close || '—')}${['Open', 'Q&A'].includes(d.status) && d.close ? `<div class="small muted">${App.daysTo(d.close)} days</div>` : ''}`, w: '110px' },
          { h: 'Bids', r: (d) => `${d.bids} / ${d.invited}${(det(d.id) || {}).bidders && d.sealed ? '<div class="small muted">sealed</div>' : ''}`, cls: 'num', w: '80px' },
          { h: 'Status', r: (d) => `${pill(d.status, tones[d.status] || 'neutral')}${vat8Flag(det(d.id)) ? `<div class="mt-s">${pill('8% reduction ends 31/12/2026', 'warning')}</div>` : ''}`, w: 'minmax(150px,1.3fr)' }
        ], rows, { min: 900, empty: 'No tenders match these filters', label: 'Tenders' })}`)}`;
  }

  /* ---------- New tender from a PR (L-09 step 1–2) ---------- */
  function newPage(p) {
    if (!st.nf) {
      const pr = p.pr || (p.mat ? '' : 'PR-2026-0436');
      st.nf = { pr, mat: p.mat || '', qty: '', title: '', method: 'Sealed bid', envelopes: 'Single', close: '20/11/2026', time: '17:00', validity: '90', currency: 'VND', secPct: '1', delivery: '15/12/2026', wt: '40', wp: '60' };
      st.nerr = {};
    }
    const f = st.nf; const e = st.nerr;
    const prs = D().docs.filter((d) => d.type === 'PR' && ['Approved'].includes(d.status));
    const lines = f.pr && D().prs[f.pr] ? D().prs[f.pr].lines : f.mat ? [{ mat: f.mat, qty: +String(f.qty).replace(',', '.') || 0 }] : [];
    const est = lines.reduce((a, l) => a + estOf(l), 0); const sec = Math.round(est * (+String(f.secPct).replace(',', '.') || 0) / 100);
    const flag = f.delivery && S.validDate(f.delivery) && App.dt(f.delivery) > App.dt('31/12/2026') && lines.some((l) => mat(l.mat).vat8);
    return `<div class="page-h"><div><div class="crumbs small muted"><a href="#/tenders">Tenders</a> / New</div><h1>${esc(App.t('New tender'))}</h1><div class="sub">Lines are copied from the PR (Material ID and quantity) · the number TND-2026-NNN is issued on save</div></div></div>
      ${card('Tender setup', `<form id="tn-new" class="stack" novalidate>
        ${e._ ? `<div class="alert alert-danger" role="alert">${esc(e._)}</div>` : ''}
        <div class="form-grid">${S.field('tn', e, 'pr', 'Source PR', f.pr, { options: [['', f.mat ? `No PR · Material ID ${f.mat}` : '— choose —']].concat(prs.map((d) => [d.id, `${d.id} · ${d.title}`])), hint: 'Approved PRs that need a tender (value > 500tr, no active contract)' })}
          ${!f.pr ? S.field('tn', e, 'qty', `Quantity${f.mat ? ' (' + mat(f.mat).uom + ')' : ''}`, f.qty, { req: true, mode: 'decimal' }) : ''}
          ${S.field('tn', e, 'title', 'Title', f.title, { req: true, ph: 'e.g. Tủ điện MSB – Nhà xưởng C2' })}
          ${S.field('tn', e, 'method', 'Method', f.method, { options: METHODS })}
          ${S.field('tn', e, 'envelopes', 'Envelopes', f.envelopes, { options: [['Single', 'Single envelope'], ['Two', 'Two envelopes (technical + price)']] })}
          ${S.field('tn', e, 'close', 'Closing date', f.close, { req: true, ph: 'dd/mm/yyyy' })}${S.field('tn', e, 'time', 'Closing time', f.time, { ph: 'hh:mm' })}
          ${S.field('tn', e, 'validity', 'Bid validity (days)', f.validity, { mode: 'numeric', hint: 'At least 90 days' })}
          ${S.field('tn', e, 'currency', 'Bid currency', f.currency, { options: [['VND', 'VND'], ['VND or USD', 'VND or USD (converted at the bank selling rate on the opening day)']] })}
          ${S.field('tn', e, 'secPct', 'Bid security (% of estimated value)', f.secPct, { mode: 'decimal', hint: `Suggested 1–1,5% for goods/services ≤ 10 tỷ ₫ · = ${vnd(sec)}` })}
          ${S.field('tn', e, 'delivery', 'Last delivery date', f.delivery, { ph: 'dd/mm/yyyy' })}
          ${S.field('tn', e, 'wt', 'Technical weight %', f.wt, { mode: 'numeric' })}${S.field('tn', e, 'wp', 'Price weight %', f.wp, { mode: 'numeric', hint: 'Technical + price = 100%' })}</div>
        ${flag ? '<div class="alert alert-warning" role="status">8% reduction ends 31/12/2026 — rate is set at invoice date. Lines delivered in 2027 are invoiced at the standard VAT.</div>' : ''}
        <h3 class="h-sub">Lines (${lines.length})</h3>
        ${table([{ h: 'Material ID', r: (l) => mid(l.mat), w: '120px' }, { h: 'Description', r: (l) => esc(mat(l.mat).name), w: 'minmax(160px,2fr)' }, { h: 'Qty', r: (l) => `${num(l.qty)} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '110px' },
          { h: 'VAT', r: (l) => esc(S.vatLabel(mat(l.mat).vat)), w: 'minmax(120px,1.2fr)' }, { h: 'Est. value excl. VAT', r: (l) => vnd(estOf(l)), cls: 'num', w: '160px' }], lines, { min: 680, empty: 'Choose a PR or start from a Material ID', label: 'Tender lines' })}
        <p class="small muted mt-0">Estimated value ${vnd(est)} excl. VAT = Σ qty × 90-day average price (Price history).</p>
        <div class="row-acts"><a class="btn" href="#/tenders">Cancel</a><button type="submit" class="btn btn-p">Save draft tender</button></div></form>`)}`;
  }
  function saveNew(root) {
    const f = Object.assign(st.nf, S.read(root, '#tn-new')); const e = {};
    const lines = f.pr && D().prs[f.pr] ? D().prs[f.pr].lines.map((l) => ({ mat: l.mat, qty: l.qty })) : f.mat ? [{ mat: f.mat, qty: +String(f.qty).replace(',', '.') }] : [];
    if (!lines.length) e.pr = 'Choose a source PR.';
    if (!f.pr && f.mat && !(lines[0].qty > 0)) e.qty = 'Enter a quantity above 0.';
    if (!f.title) e.title = 'Enter a title.';
    if (!S.validDate(f.close)) e.close = 'Use dd/mm/yyyy.'; else if (App.daysTo(f.close) < 3) e.close = 'Closing must be at least 3 days from today.';
    if (!/^\d{2}:\d{2}$/.test(f.time)) e.time = 'Use hh:mm.';
    if (!(+f.validity >= 90)) e.validity = 'Bid validity must be at least 90 days.';
    const sp = +String(f.secPct).replace(',', '.');
    if (isNaN(sp) || sp < 0 || sp > 3) e.secPct = 'Bid security must be 0–3% of the estimated value.';
    if (f.delivery && !S.validDate(f.delivery)) e.delivery = 'Use dd/mm/yyyy.';
    if (+f.wt + +f.wp !== 100) e.wp = 'Technical + price weights must total 100%.';
    if (f.method === 'Two-envelope' && f.envelopes !== 'Two') e.envelopes = 'A two-envelope tender needs Two envelopes.';
    lines.forEach((l) => { const m = App.material(l.mat); if (m && m.status !== 'Active') e._ = `${l.mat} is ${m.status} and cannot be tendered.`; });
    st.nerr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#tn-new'); return; }
    const n = Math.max(...list().map((d) => +d.id.slice(9))) + 1; const id = 'TND-2026-' + String(n).padStart(3, '0');
    D().docs.push({ id, type: 'TND', title: f.title, cat: mat(lines[0].mat).cat, date: D().today, close: f.close, status: 'Draft', mats: lines.map((l) => l.mat), invited: 0, bids: 0 });
    D().tenders[id] = { method: f.method, envelopes: f.envelopes, pr: f.pr || null, owner: S.me(), delivery: f.delivery, currency: f.currency, validity: +f.validity, secPct: sp, closeTime: f.time, lines, step: 0, weights: [+f.wt, +f.wp], pass: 70, qa: [], addenda: [], files: [], committee: [[S.me(), 'Chair · evaluator', 'Not signed']] };
    if (f.pr) { const d = S.docOf(f.pr); if (d) { d.status = 'In tender'; d.next = id; } }
    st.nf = null; location.hash = '#/tenders/' + id; App.toast(`${id} saved as Draft · invite vendors next`);
  }

  /* ---------- Detail blocks ---------- */
  const progress = (i) => `<ol class="steps" aria-label="Tender progress">${STEPS.map((s, k) => `<li class="${k < i ? 'done' : k === i ? 'cur' : ''}"${k === i ? ' aria-current="step"' : ''}><span class="st-n" aria-hidden="true">${k < i ? '✓' : k + 1}</span><span class="st-l">${s}</span>${k < i ? '<span class="sr"> (done)</span>' : ''}</li>`).join('')}</ol>`;

  function linesCard(doc, t) {
    return card(`Lines by Material ID (${t.lines.length})`, table([
      { h: 'Material ID', r: (l) => mid(l.mat), w: '120px' }, { h: 'Description', r: (l) => esc(mat(l.mat).name), w: 'minmax(170px,2fr)' },
      { h: 'Qty', r: (l) => `${num(l.qty)} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '100px' }, { h: 'VAT', r: (l) => esc(S.vatLabel(mat(l.mat).vat)), w: 'minmax(130px,1.3fr)' },
      { h: '90-day avg excl. VAT', r: (l) => vnd(mat(l.mat).avg90 || mat(l.mat).last), cls: 'num', w: '150px' }, { h: 'Est. value excl. VAT', r: (l) => vnd(estOf(l)), cls: 'num', w: '150px' }
    ], t.lines, { min: 860, label: 'Tender lines' }) + `<p class="small muted">Estimated package ${vnd(estTotal(t))} excl. VAT · source ${S.prLink(t.pr)}${t.benchmark ? ' · ' + esc(t.benchmark) : ''}</p>`);
  }

  function settingsCard(doc, t) {
    const est = estTotal(t); const secAmt = t.secAmount || Math.round(est * t.secPct / 100);
    const locked = (doc.bids || 0) > 0 || STEP_OF[doc.status] >= 3;
    const secHint = t.secPct >= 1 && t.secPct <= 1.5 ? 'Within the suggested 1–1,5%' : t.secPct === 0 ? 'No bid security (RFQ)' : 'Outside the suggested 1–1,5% — note the reason';
    if (st.set) {
      const f = st.set; const e = st.serr;
      return card('Settings', `<form id="tn-set" class="stack" novalidate><div class="form-grid">
        ${S.field('ts', e, 'envelopes', 'Envelopes', f.envelopes, { options: [['Single', 'Single'], ['Two', 'Two (technical + price)']] })}
        ${S.field('ts', e, 'secPct', 'Bid security %', f.secPct, { mode: 'decimal', hint: 'Suggested 1–1,5% for goods/services ≤ 10 tỷ ₫' })}
        ${S.field('ts', e, 'validity', 'Bid validity (days)', f.validity, { mode: 'numeric', hint: 'At least 90' })}
        ${S.field('ts', e, 'currency', 'Currency', f.currency, { options: ['VND', 'VND or USD'] })}
        ${S.field('ts', e, 'wt', 'Technical weight %', f.wt, { mode: 'numeric' })}${S.field('ts', e, 'wp', 'Price weight %', f.wp, { mode: 'numeric' })}</div>
        <div class="row-acts"><button type="button" class="btn btn-sm" data-tn="set-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Save settings</button></div></form>`);
    }
    const w = t.weights || [40, 60];
    return card('Settings', `<dl class="dl"><dt>Method</dt><dd>${esc(t.method)}</dd><dt>Envelopes</dt><dd>${t.envelopes === 'Two' ? 'Two (technical + price)' : 'Single'}</dd>
      <dt>Bid security</dt><dd>${t.secPct ? `${num(t.secPct, 1)}% · ${vnd(secAmt)}` : 'None'} <div class="small muted">${esc(secHint)}</div></dd>
      ${t.envelopes === 'Two' ? `<dt>Weights</dt><dd>Technical ${w[0]}% · price ${w[1]}% · pass mark ${t.pass || 70}/100</dd><dt>Price score</dt><dd>Lowest total ÷ bidder total × 100</dd>` : ''}
      <dt>Bid validity</dt><dd>${t.validity} days</dd><dt>Currency</dt><dd>${esc(t.currency)}${t.fx ? `<div class="small muted">${esc(t.fx)}</div>` : ''}</dd>
      <dt>Closes</dt><dd>${esc(closeAt(doc, t))}</dd><dt>Last delivery</dt><dd>${esc(t.delivery || '—')}</dd><dt>Visibility</dt><dd>Invited vendors only</dd><dt>Owner</dt><dd>${esc(t.owner)}</dd></dl>
      ${locked ? '<p class="small muted">Settings are locked once bidding has started. Change them with an addendum.</p>' : ''}`,
    locked ? '' : '<button class="btn btn-sm" data-tn="set-edit">Edit settings</button>');
  }
  function saveSettings(root, t) {
    const f = Object.assign(st.set, S.read(root, '#tn-set')); const e = {}; const sp = +String(f.secPct).replace(',', '.');
    if (isNaN(sp) || sp < 0 || sp > 3) e.secPct = 'Bid security must be 0–3%.';
    if (!(+f.validity >= 90)) e.validity = 'Bid validity must be at least 90 days.';
    if (+f.wt + +f.wp !== 100) e.wp = 'Weights must total 100%.';
    if (t.method === 'Two-envelope' && f.envelopes !== 'Two') e.envelopes = 'A two-envelope tender needs Two envelopes.';
    st.serr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#tn-set'); return; }
    Object.assign(t, { envelopes: f.envelopes, secPct: sp, validity: +f.validity, currency: f.currency, weights: [+f.wt, +f.wp] }); delete t.secAmount;
    st.set = null; App.render(); App.toast('Settings saved');
  }

  function auctionCard(t) {
    const a = t.auction;
    return card('e-Auction settings', `<dl class="dl"><dt>Type</dt><dd>Reverse auction per Material ID line (${t.lines.map((l) => mid(l.mat)).join(' ')})</dd><dt>Live window</dt><dd>${esc(a.live)}</dd>
      <dt>Start price</dt><dd>${vnd(a.start)} / ${esc(mat(t.lines[0].mat).uom)} excl. VAT</dd><dt>Minimum decrement</dt><dd>${num(a.decrement, 1)}% (${vnd(a.start * a.decrement / 100)})</dd>
      <dt>Auto-extend</dt><dd>${a.extend} minutes when a bid arrives in the last ${a.extend} minutes</dd><dt>Supplier view</dt><dd>${esc(a.visibility)} — suppliers see only their own rank</dd></dl>
      <p class="small muted">The final price per line is written to Price history after the auction closes.</p>`);
  }
  function fxCard(t) {
    return card('Currency', `<p class="mt-0">Bids are accepted in <b>VND or USD</b>. ${esc(t.fx)}.</p><p class="small muted">The comparison matrix shows the VND equivalent excl. VAT with the original currency in its own column. Rate source and date are recorded in the bid opening minutes.</p>`);
  }

  function invitedCard(doc, t) {
    let rows = t.bidders;
    if (!rows) {
      const ids = [...new Set(t.lines.flatMap((l) => mat(l.mat).vendors.filter((v) => v[1] !== 'Blocked').map((v) => v[0])))];
      rows = doc.status === 'Draft' ? [] : ids.slice(0, Math.max(doc.invited, 0) || ids.length).map((vid, i) => ({ vid, name: App.vendor(vid).name, status: i < doc.bids ? 'Submitted' : 'Invited' }));
    }
    const elig = [...new Set(t.lines.flatMap((l) => mat(l.mat).vendors.filter((v) => v[1] !== 'Blocked').map((v) => v[0])))];
    return card(`Invited vendors (${doc.status === 'Draft' ? 0 : doc.invited})`, doc.status === 'Draft'
      ? `${App.emptyState('Not invited yet', `${elig.length} vendors are approved for these Material IDs: ${elig.map((v) => App.vshort(App.vendor(v))).join(', ') || 'none'}. Blocked vendor – Material ID pairs are excluded.`, '<button class="btn btn-p btn-sm" data-tn="invite">Invite vendors (Gmail + portal)</button>')}`
      : `<ul class="plain">${rows.map((b) => `<li class="row-acts between"><span>${b.vid ? `<a href="#/vendors/${esc(b.vid)}"><span class="mono small">${esc(b.vid)}</span> ${esc(vname(b))}</a>` : esc(b.name)}</span><span>${b.warn && /blocked/i.test(b.warn) ? pill('Certificate block', 'danger') + ' ' : ''}${pill(b.status || 'Submitted', (b.status || 'Submitted') === 'Submitted' ? 'success' : 'neutral')}</span></li>`).join('')}</ul>`);
  }

  /* F-41 sealed bids (R-05) */
  function sealedCard(doc, t) {
    const sub = t.bidders.filter((b) => b.status === 'Submitted').length; const isClosed = closed(doc);
    return card(`Bids · sealed · ${sub} of ${t.bidders.length} bids received`, `<div class="alert alert-info" role="status"><b>Sealed until ${esc(closeAt(doc, t))}.</b> Prices are hidden from Procurement until the tender closes and two committee members open the bids.</div>
      ${table([
        { h: 'Bidder', r: (b) => `${b.vid ? `<a href="#/vendors/${esc(b.vid)}">${esc(b.name)}</a><div class="small muted mono">${esc(b.vid)}</div>` : esc(b.name)}`, w: 'minmax(200px,2fr)' },
        { h: 'Receipt no.', r: (b) => (b.rc ? `<span class="mono">${esc(b.rc)}</span>` : '—'), w: '120px' },
        { h: 'Submitted', r: (b) => esc(b.at || '—'), w: '140px' },
        { h: 'Status', r: (b) => `${pill(b.status, b.status === 'Submitted' ? 'success' : 'warning')}${b.warn ? `<div class="small muted">${esc(b.warn)}</div>` : ''}`, w: 'minmax(170px,1.6fr)' },
        { h: 'Price', r: () => '<span class="muted">Sealed</span>', w: '90px' }
      ], t.bidders, { min: 760, label: 'Sealed bids' })}
      <h3 class="h-sub">Bid opening</h3>
      <p class="small mt-0">Opening needs two named committee members with a signed COI declaration: <b>Nguyễn Minh Anh</b> + <b>Đỗ Hoàng Nam</b>. The technical envelope opens 5 minutes after closing; the unseal event is written to the audit log.</p>
      <div class="row-acts start"><button class="btn btn-p btn-sm" ${isClosed ? 'data-tn="open-bids"' : 'disabled'} aria-describedby="tn-open-h">Open bids</button><span class="small muted" id="tn-open-h">${isClosed ? '' : `Available after ${esc(closeAt(doc, t))}`}</span></div>
      <h3 class="h-sub">Comparison matrix</h3>${App.emptyState('Locked until bid opening', `The price matrix per Material ID line unlocks after ${closeAt(doc, t)}.`)}`);
  }

  /* F-45 committee & COI (R-10) */
  function committeeCard(t) {
    if (!t.committee) return '';
    return card('Evaluation committee & COI', `<ul class="plain">${t.committee.map(([n, r, s], i) => `<li class="row-acts between"><span><b>${esc(n)}</b><div class="small muted">${esc(r)}</div></span><span>${pill(s.startsWith('Signed') ? 'COI ' + s.toLowerCase() : 'COI not signed', s.startsWith('Signed') ? 'success' : 'danger')}${s.startsWith('Signed') ? '' : ` <button class="btn btn-sm" data-tn="remind" data-n="${esc(n)}">Remind</button>`}</span></li>`).join('')}</ul>
      <p class="small muted">A member without a signed COI declaration cannot open or score bids. SoD: an evaluator cannot approve the award.</p>`);
  }

  /* F-44 Q&A + addendum (R-11) */
  function qaCard(t) {
    if (!t.qa) return '';
    const f = st.qa; const e = st.qaErr;
    const add = (t.addenda || []).map((a) => `<div class="alert alert-info mt" role="status"><b>Addendum No. ${a.no} · ${esc(a.at)}</b> <span class="chips chips-inline">${a.lines.map(mid).join('')}</span><div>${esc(a.summary)}</div>
      <div class="small mt-s">Acknowledged ${a.acks.length} / ${a.acks.length} · sent by Gmail and portal · ${a.acks.map(([v, at]) => `${esc(App.vendor(v) ? App.vshort(App.vendor(v)) : v)} ${esc(at)}`).join(' · ')}</div></div>`).join('');
    const form = f ? `<form id="tn-qa" class="stack mt" novalidate><div class="form-grid">${S.field('tq', e, 'line', 'Material ID line', f.line, { options: t.lines.map((l) => l.mat) })}${S.field('tq', e, 'q', 'Question (as received)', f.q, { req: true, area: true })}${S.field('tq', e, 'a', 'Answer', f.a, { req: true, area: true })}</div>
      <p class="small muted mt-0">Published to all invited bidders without naming who asked.</p><div class="row-acts"><button type="button" class="btn btn-sm" data-tn="qa-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Publish answer</button></div></form>` : '';
    return card(`Q&A (${t.qa.length})`, `${t.qa.length ? `<ul class="plain">${t.qa.map((x) => `<li><span class="small muted">Q${x.no} · ${esc(x.at)} · Bidder (anonymous)</span> ${mid(x.line)}<div><b>${esc(x.q)}</b></div><div class="small">Answer: ${esc(x.a)}</div></li>`).join('')}</ul>` : '<p class="muted small mt-0">No questions yet.</p>'}${add}${form}`,
      f ? '' : `<button class="btn btn-sm" data-act="toast" data-msg="Q&A log exported with timestamps (audit)">Open Q&A log</button><button class="btn btn-sm" data-tn="qa-new">Answer a question</button>`);
  }

  /* ---------- TND-2026-029: opened two-envelope evaluation ---------- */
  const techAvg = (b) => b.tech.reduce((a, x) => a + x, 0) / b.tech.length;
  const passed = (t, b) => techAvg(b) >= (t.pass || 70);
  const opened = (t) => t.bidders.filter((b) => passed(t, b) && b.prices);
  const compliant = (t, b) => b.prices && b.sec >= (t.secAmount || 0) && b.validity >= t.validity;
  const bidTotal = (t, b) => t.lines.reduce((a, l, i) => a + l.qty * b.prices[i], 0);
  const baseline = (l) => mat(l.mat).last || mat(l.mat).avg90;
  function ranking(t) {
    const C = opened(t).filter((b) => compliant(t, b)); const low = Math.min(...C.map((b) => bidTotal(t, b))); const w = t.weights || [40, 60];
    return C.map((b) => { const ps = low / bidTotal(t, b) * 100; return { b, ps, ws: techAvg(b) * w[0] / 100 + ps * w[1] / 100 }; }).sort((x, y) => y.ws - x.ws).map((r, i) => Object.assign(r, { rank: i + 1 }));
  }
  const lowestOn = (t, i) => { const C = opened(t).filter((b) => compliant(t, b)); return C.reduce((a, b) => (!a || b.prices[i] < a.prices[i] ? b : a), null); };

  function openingCard(t) {
    const o = t.opening; const minutes = t.bidders.map((b) => ({ b }));
    return card('Bid opening minutes · Biên bản mở thầu', `<ul class="plain small"><li><b>Technical envelopes</b> opened ${esc(o.tech.at)} (5 minutes after closing) by ${o.tech.by.map(esc).join(' + ')} · COI signed · audit logged</li>
      <li><b>Price envelopes</b> opened ${esc(o.price.at)} by ${o.price.by.map(esc).join(' + ')} · only for bidders who passed the technical envelope · audit logged</li></ul>
      ${table([
        { h: 'Bidder', r: (r) => `${esc(r.b.name)}<div class="small muted mono">${esc(r.b.rc)}</div>`, w: 'minmax(200px,2fr)' },
        { h: 'Total excl. VAT', r: (r) => (r.b.prices && passed(t, r.b) ? vnd(bidTotal(t, r.b)) : '<span class="muted">Not opened</span>'), cls: 'num', w: '170px' },
        { h: 'Validity', r: (r) => `${r.b.validity} days${r.b.validity < t.validity ? ' ' + pill('Short', 'danger') : ''}`, w: '110px' },
        { h: 'Bid security', r: (r) => (r.b.sec ? vnd(r.b.sec) : pill('Missing', 'danger')), cls: 'num', w: '140px' },
        { h: 'Submitted', r: (r) => esc(r.b.at), w: '140px' }
      ], minutes, { min: 800, label: 'Bid opening minutes' })}`, '<button class="btn btn-sm" data-act="toast" data-msg="TND-029_Bien-ban-mo-thau.pdf downloaded">Download PDF</button>');
  }
  function techCard(t) {
    return card(`Technical evaluation · envelope 1 · pass ≥ ${t.pass}/100`, table([
      { h: 'Bidder', r: (b) => esc(b.name), w: 'minmax(200px,2fr)' },
      ...t.evaluators.map((n, i) => ({ h: n, r: (b) => num(b.tech[i]), cls: 'num', w: '130px' })),
      { h: 'Consolidated', r: (b) => `<b>${num(techAvg(b), 1)}</b>`, cls: 'num', w: '110px' },
      { h: 'Result', r: (b) => pill(passed(t, b) ? 'Pass' : 'Fail', passed(t, b) ? 'success' : 'danger'), w: '90px' }
    ], t.bidders, { min: 720, label: 'Technical scores by evaluator' }) + '<p class="small muted">Criteria from the Material ID specifications (mác M300/M250, độ sụt, cần bơm 37 m). Consolidated = average of evaluators. Lê Quốc Huy has not signed the COI and cannot score.</p>');
  }
  function matrixCard(t) {
    const B = opened(t); const R = ranking(t); const rk = (b) => R.find((r) => r.b === b);
    const cols = [
      { h: 'Material ID line', r: (r) => r.mat ? `${mid(r.mat)}<div class="small">${esc(mat(r.mat).name)}</div>` : `<b>${esc(r.label)}</b>`, w: 'minmax(170px,1.8fr)' },
      { h: 'Qty', r: (r) => (r.mat ? `${num(r.qty)} ${esc(mat(r.mat).uom)}` : ''), cls: 'num', w: '90px' },
      { h: 'VAT', r: (r) => (r.mat ? esc(S.vatLabel(mat(r.mat).vat)) : ''), w: 'minmax(120px,1fr)' },
      { h: 'Baseline (last PO)', r: (r) => (r.mat ? `${vnd(baseline(r))}<div class="small muted">${esc(mat(r.mat).lastPo || '1st-round avg')}</div>` : r.k === 'sub' ? vnd(t.lines.reduce((a, l) => a + baseline(l) * l.qty, 0)) : ''), cls: 'num', w: '150px' },
      ...B.map((b) => ({ h: vname(b), cls: 'num', w: 'minmax(170px,1.4fr)', r: (r) => {
        const ok = compliant(t, b); const x = rk(b);
        if (r.mat) { const i = r.i; const lo = lowestOn(t, i); return `<div class="${lo === b ? 'best' : ''}">${vnd(b.prices[i])}<div class="small muted">${vnd(b.prices[i] * r.qty)}</div>${lo === b ? pill('Lowest', 'success') : ''}</div>`; }
        if (r.k === 'sub') return `<b>${vnd(bidTotal(t, b))}</b>`;
        if (r.k === 'vat') return vnd(t.lines.reduce((a, l, i) => a + l.qty * b.prices[i] * mat(l.mat).vat / 100, 0));
        if (r.k === 'tot') return vnd(t.lines.reduce((a, l, i) => a + l.qty * b.prices[i] * (1 + mat(l.mat).vat / 100), 0));
        if (r.k === 'sec') return b.sec >= t.secAmount ? `${vnd(b.sec)} ${pill('OK', 'success')}` : pill('Non-compliant · missing', 'danger');
        if (r.k === 'score') return ok && x ? `${num(techAvg(b), 1)} × ${t.weights[0]}% + ${num(x.ps, 2)} × ${t.weights[1]}% = <b>${num(x.ws, 2)}</b>` : '<span class="muted">Excluded</span>';
        if (r.k === 'rank') return ok && x ? pill('Rank ' + x.rank, x.rank === 1 ? 'success' : 'neutral') : pill('Non-compliant', 'danger');
        return '';
      } }))
    ];
    const rows = [...t.lines.map((l, i) => Object.assign({ i }, l)), { label: 'Subtotal excl. VAT', k: 'sub' }, { label: 'VAT', k: 'vat' }, { label: 'Total incl. VAT', k: 'tot' }, { label: `Bid security (≥ ${vnd(t.secAmount)})`, k: 'sec' }, { label: 'Weighted score', k: 'score' }, { label: 'Ranking', k: 'rank' }];
    const fail = t.bidders.filter((b) => !passed(t, b));
    return card('Price comparison · envelope 2 · prices excl. VAT', table(cols, rows, { min: 560 + B.length * 180, label: 'Bid comparison matrix by Material ID line', cls: 'mtx' })
      + `<p class="small muted">"Lowest" is per line among compliant bids. Price score = lowest total ÷ bidder total × 100; weighted = technical × ${t.weights[0]}% + price × ${t.weights[1]}%. ${fail.map((b) => esc(b.name)).join(', ')} failed the technical envelope — price envelope not opened. A bid without valid bid security is Non-compliant and not ranked.</p>`);
  }

  /* F-48 award recommendation (R-12) */
  function awardCard(doc, t) {
    const R = ranking(t); const C = R.map((r) => r.b);
    if (!st.aw || st.aw.id !== doc.id) st.aw = { id: doc.id, pick: t.lines.map(() => (R[0] ? R[0].b.vid : '')), why: (t.award && t.award.why) || '' };
    const a = st.aw; const award = t.award;
    const pickB = (i) => C.find((b) => b.vid === (award ? award.pick[i] : a.pick[i]));
    const val = t.lines.reduce((s, l, i) => s + l.qty * (pickB(i) ? pickB(i).prices[i] : 0), 0);
    const base = t.lines.reduce((s, l) => s + l.qty * baseline(l), 0); const saving = base - val;
    const notLowest = t.lines.map((l, i) => pickB(i) && lowestOn(t, i) !== pickB(i));
    const tbl = table([
      { h: 'Material ID', r: (l) => mid(l.mat), w: '120px' }, { h: 'Qty', r: (l) => `${num(l.qty)} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '90px' },
      { h: 'Recommended vendor', r: (l) => { const i = t.lines.indexOf(l); return award ? esc(vname(pickB(i))) : `<label class="sr" for="aw-${i}">Vendor for ${esc(l.mat)}</label><select class="inp w-full" id="aw-${i}" data-aw="${i}">${C.map((b) => `<option value="${esc(b.vid)}"${a.pick[i] === b.vid ? ' selected' : ''}>${esc(vname(b))}</option>`).join('')}</select>`; }, w: 'minmax(170px,1.6fr)' },
      { h: 'Awarded unit price', r: (l) => { const i = t.lines.indexOf(l); return `${vnd(pickB(i).prices[i])}${notLowest[i] ? `<div>${pill('Not lowest', 'warning')}</div>` : ''}`; }, cls: 'num', w: '160px' },
      { h: 'Saving vs baseline', r: (l) => { const i = t.lines.indexOf(l); return vnd((baseline(l) - pickB(i).prices[i]) * l.qty); }, cls: 'num', w: '150px' }
    ], t.lines, { min: 700, label: 'Award by Material ID line' });
    const e = st.awErr;
    const status = award ? (award.status === 'Approved'
      ? `<div class="alert alert-success" role="status"><b>Approved by ${esc(award.approver)} · ${esc(award.at)}.</b> Result notices sent by Gmail and portal. Awarded prices written to Price history.</div>`
      : `<div class="alert alert-warning" role="status"><b>Pending approval · ${esc(award.approver)} (Finance Director).</b> Submitted ${esc(award.submitted)} · in My approvals of the approver.</div>`) : '';
    const notices = award && award.status === 'Approved' ? `<h3 class="h-sub">Result notices</h3>${table([
      { h: 'Bidder', r: (b) => esc(b.name), w: 'minmax(200px,2fr)' },
      { h: 'Result', r: (b) => { const won = award.pick.includes(b.vid); const r = R.find((x) => x.b === b); return won ? pill('Awarded', 'success') : pill(`Unsuccessful${r ? ' · rank ' + r.rank : !passed(t, b) ? ' · technical Fail' : ' · non-compliant'}`, 'neutral'); }, w: 'minmax(170px,1.5fr)' },
      { h: 'Channel', r: () => 'Gmail + portal', w: '120px' },
      { h: 'Bid security', r: (b) => (b.sec ? (award.pick.includes(b.vid) ? 'Held until performance security' : `Release by ${esc(App.addDays(award.at.slice(0, 10), 14))}`) : '—'), w: 'minmax(160px,1.4fr)' }
    ], t.bidders, { min: 700, label: 'Result notices' })}` : '';
    const poBtn = award && award.status === 'Approved' ? `<a class="btn btn-p" href="#/po?tender=${esc(doc.id)}">Create PO</a><a class="btn" href="#/contracts">Create contract</a>`
      : '<button class="btn btn-p" disabled aria-describedby="aw-po-h">Create PO</button><button class="btn" disabled>Create contract</button><span class="small muted" id="aw-po-h">Enabled after the award is approved</span>';
    return card('Award recommendation · Tờ trình', `${status}${tbl}
      <dl class="dl mt"><dt>Award value</dt><dd><b>${vnd(val)}</b> excl. VAT</dd><dt>Baseline</dt><dd>${vnd(base)} (last PO price per Material ID)</dd><dt>Saving</dt><dd><b>${vnd(saving)}</b> = ${pct(saving / base * 100)} · (baseline − awarded) × qty per line</dd>
        <dt>Route</dt><dd>≤ 2 tỷ ₫ band needs the Procurement Lead, but Nguyễn Minh Anh evaluated this tender (SoD: evaluator ≠ award approver) → <b>Đỗ Hoàng Nam</b> approves.</dd></dl>
      ${award ? (award.why ? `<p class="small"><b>Justification:</b> ${esc(award.why)}</p>` : '') : `<form id="tn-aw" class="stack mt" novalidate>${S.field('aw', e, 'why', `Justification${notLowest.some(Boolean) ? ' (required: a line is not awarded to the lowest price)' : ''}`, a.why, { area: true, req: notLowest.some(Boolean) })}
        <div class="row-acts"><button type="submit" class="btn btn-p">Submit award recommendation</button></div></form>`}
      ${notices}<div class="row-acts mt">${poBtn}</div>`);
  }
  function submitAward(root, doc, t) {
    const a = st.aw; a.why = (root.querySelector('#aw-why') || {}).value || ''; a.why = a.why.trim();
    const R = ranking(t); const C = R.map((r) => r.b);
    const notLowest = t.lines.some((l, i) => lowestOn(t, i) !== C.find((b) => b.vid === a.pick[i]));
    st.awErr = {}; if (notLowest && a.why.length < 20) st.awErr.why = 'Explain in at least 20 characters why the lowest price is not chosen on every line.';
    if (Object.keys(st.awErr).length) { App.render(); S.focusErr('#tn-aw'); return; }
    const val = t.lines.reduce((s, l, i) => s + l.qty * C.find((b) => b.vid === a.pick[i]).prices[i], 0);
    t.award = { status: 'Pending', pick: a.pick.slice(), why: a.why, approver: 'Đỗ Hoàng Nam', submitted: D().today + ' 10:30', value: val };
    doc.status = 'Award pending';
    D().approvals.push({ id: doc.id, type: 'Award recommendation', title: `${doc.title} · ${[...new Set(a.pick)].map((v) => App.vshort(App.vendor(v))).join(', ')}`, mats: doc.mats, value: val, by: S.me(), step: 'Step 1 of 1', sla: '04/11/2026 17:00', assignee: 'Đỗ Hoàng Nam', note: 'SoD: evaluator ≠ award approver' });
    D().approvalChains[doc.id] = [[`${S.me()} · Chair`, 'Submitted', D().today + ' 10:30', a.why], ['Đỗ Hoàng Nam · Finance Director', 'Waiting', 'SLA ends 04/11/2026 17:00', '']];
    App.render(); App.toast(`${doc.id} award recommendation sent to Đỗ Hoàng Nam`);
  }

  function detail(doc) {
    const t = det(doc.id);
    if (!t) return App.errorState(`Tender ${doc.id} has no detail record.`, ' <a href="#/tenders">Back to tenders</a>');
    const step = doc.status === 'Awarded' ? 6 : (STEP_OF[doc.status] != null ? STEP_OF[doc.status] : t.step);
    const head = `<div class="page-h"><div><div class="crumbs small muted"><a href="#/tenders">Tenders</a> / ${esc(doc.id)}</div><h1><span class="mono">${esc(doc.id)}</span> ${esc(doc.title)}</h1>
      <div class="sub">${esc(t.method)} · ${esc((D().categories.find((c) => c.code === doc.cat) || {}).name || doc.cat || '')} · closes ${esc(closeAt(doc, t))} · ${pill(doc.status, tones[doc.status] || 'neutral')}</div></div>
      <div class="acts"><button class="btn" data-act="toast" data-msg="Reminder sent to bidders who have not submitted">Remind bidders</button>${doc.status === 'Draft' ? '<button class="btn btn-p" data-tn="invite">Invite vendors</button>' : ''}</div></div>`;
    const alerts = [
      post2026(t) && t.lines.some((l) => mat(l.mat).vat8) ? `<div class="alert alert-warning" role="status"><b>8% reduction ends 31/12/2026 — rate is set at invoice date.</b> Deliveries until ${esc(t.delivery)}: lines with reduced VAT are invoiced at the standard rate from 01/01/2027.</div>` : '',
      doc.sealed && !closed(doc) ? '' : ''
    ].join('');
    const kpis = `<div class="grid-k">${kpi('Estimated value', ty(estTotal(t)), 'excl. VAT · 90-day avg')}${kpi('Bids', `${doc.bids} / ${doc.invited}`, doc.sealed ? 'Sealed' : 'Received / invited')}${kpi('Closes', esc(doc.close), App.daysTo(doc.close) >= 0 ? `${App.daysTo(doc.close)} days · ${esc((t.closeTime) || '17:00')}` : 'Closed', App.daysTo(doc.close) >= 0 && App.daysTo(doc.close) <= 3 ? 'warning' : '')}${kpi('Bid security', t.secPct ? vnd(t.secAmount || Math.round(estTotal(t) * t.secPct / 100)) : '—', t.secPct ? num(t.secPct, 1) + '% of estimate' : 'Not required')}</div>`;
    const evalBlocks = t.bidders && t.bidders[0] && t.bidders[0].tech ? openingCard(t) + techCard(t) + matrixCard(t) + awardCard(doc, t) : '';
    const sealed = t.bidders && doc.sealed ? sealedCard(doc, t) : '';
    const upKey = 'tnf'; t.files = t.files || [];
    const left = [linesCard(doc, t), sealed, evalBlocks, t.auction ? auctionCard(t) : '', qaCard(t), S.files(upKey, t.files, t.lines.map((l) => l.mat), st.up, ['Specification / drawing', 'BOQ', 'Addendum', 'Bid opening minutes', 'Other'])].join('');
    const right = [settingsCard(doc, t), t.fx ? fxCard(t) : '', committeeCard(t), sealed ? '' : invitedCard(doc, t)].join('');
    let n = 0; const secs = [];
    const leftA = left.replace(/<section class="card"><div class="card-h"><h2>([^<]*)<\/h2>/g, (m0, h) => { const id = 'tn-s' + (++n); secs.push([id, h.replace(/&amp;/g, '&').split(' · ')[0].replace(/ \(.*$/, '')]); return `<section class="card" id="${id}" tabindex="-1"><div class="card-h"><h2>${h}</h2>`; });
    const nav = secs.length > 2 ? `<nav class="sec-nav" aria-label="Tender sections">${secs.map(([id, l]) => `<button type="button" data-sec="${id}">${esc(l)}</button>`).join('')}</nav>` : '';
    return `${head}${alerts}${progress(step)}${kpis}${nav}<div class="grid-2"><div class="stack">${leftA}</div><div class="stack">${right}</div></div>`;
  }

  App.page('tenders', {
    title: 'Tenders', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, sub) {
      const key = sub || 'list';
      if (st.cur !== key) { st.cur = key; st.set = null; st.serr = {}; st.up = null; st.aw = null; st.awErr = {}; st.qa = null; st.qaErr = {}; if (key !== 'new') st.nf = null; }
      if (sub === 'new') return newPage(p);
      if (sub) { const d = list().find((x) => x.id === sub); return d ? detail(d) : App.errorState(`Tender ${sub} was not found.`, ' <a href="#/tenders">Back to tenders</a>'); }
      return listPage(p);
    },
    mount(root) {
      root.addEventListener('click', (e) => { const b = e.target.closest('[data-sec]'); if (!b) return; const x = document.getElementById(b.dataset.sec); if (x) { x.scrollIntoView({ block: 'start' }); x.focus({ preventScroll: true }); } });
      root.addEventListener('input', (e) => {
        if (e.target.dataset.tnf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('tn-q'); i.focus(); i.setSelectionRange(pos, pos); }
      });
      root.addEventListener('change', (e) => {
        if (e.target.dataset.tnf === 'method') { st.method = e.target.value; App.render(); }
        if (e.target.closest('#tn-new') && ['pr', 'secPct', 'delivery', 'qty'].includes(e.target.name)) { Object.assign(st.nf, S.read(root, '#tn-new')); const id = e.target.id; App.render(); const x = document.getElementById(id); x && x.focus(); }
        if (e.target.dataset.aw != null) { st.aw.pick[+e.target.dataset.aw] = e.target.value; st.aw.why = (root.querySelector('#aw-why') || {}).value || st.aw.why; const id = e.target.id; App.render(); const x = document.getElementById(id); x && x.focus(); }
      });
      root.addEventListener('submit', (e) => {
        const id = e.target.id; if (!['tn-new', 'tn-set', 'tn-aw', 'tn-qa', 'tnf-up'].includes(id)) return; e.preventDefault();
        const doc = list().find((x) => x.id === st.cur); const t = doc && det(doc.id);
        if (id === 'tn-new') saveNew(root);
        else if (id === 'tn-set') saveSettings(root, t);
        else if (id === 'tn-aw') submitAward(root, doc, t);
        else if (id === 'tnf-up') { st.up = S.upload(root, 'tnf', t.files); App.render(); }
        else if (id === 'tn-qa') {
          const f = Object.assign(st.qa, S.read(root, '#tn-qa')); st.qaErr = {};
          if (f.q.length < 10) st.qaErr.q = 'Enter the question (at least 10 characters).'; if (f.a.length < 10) st.qaErr.a = 'Enter the answer (at least 10 characters).';
          if (Object.keys(st.qaErr).length) { App.render(); S.focusErr('#tn-qa'); return; }
          t.qa.push({ no: t.qa.length + 1, line: f.line, q: f.q, a: f.a, at: D().today + ' 10:30' }); st.qa = null; App.render(); App.toast(`Answer published to ${doc.invited} bidders (anonymous)`);
        }
      });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-tn], [data-files]'); if (!b) return;
        const doc = list().find((x) => x.id === st.cur); const t = doc && det(doc.id);
        if (b.dataset.files === 'open') { st.up = { errs: {} }; App.render(); const x = document.getElementById('tnf-up-name'); x && x.focus(); return; }
        if (b.dataset.files === 'cancel') { st.up = null; App.render(); return; }
        const a = b.dataset.tn;
        if (a === 'tab') { st.tab = b.dataset.k; App.render(); }
        else if (a === 'set-edit') { st.set = { envelopes: t.envelopes, secPct: String(t.secPct).replace('.', ','), validity: String(t.validity), currency: t.currency === 'VND or USD' ? 'VND or USD' : 'VND', wt: String((t.weights || [40, 60])[0]), wp: String((t.weights || [40, 60])[1]) }; st.serr = {}; App.render(); document.getElementById('ts-envelopes').focus(); }
        else if (a === 'set-cancel') { st.set = null; App.render(); }
        else if (a === 'qa-new') { st.qa = { line: t.lines[0].mat, q: '', a: '' }; st.qaErr = {}; App.render(); document.getElementById('tq-q').focus(); }
        else if (a === 'qa-cancel') { st.qa = null; App.render(); }
        else if (a === 'remind') App.toast(`COI reminder sent to ${b.dataset.n}`);
        else if (a === 'open-bids') App.toast('Bid opening needs Nguyễn Minh Anh + Đỗ Hoàng Nam to confirm');
        else if (a === 'invite') {
          const ids = [...new Set(t.lines.flatMap((l) => mat(l.mat).vendors.filter((v) => v[1] !== 'Blocked').map((v) => v[0])))];
          if (!ids.length) { App.toast('No approved vendor for these Material IDs — approve a vendor link first'); return; }
          doc.status = 'Open'; doc.invited = ids.length; t.step = 3; App.render(); App.toast(`${ids.length} vendors invited by Gmail + portal`);
        }
      });
    }
  });
})();
