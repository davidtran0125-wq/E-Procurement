/* Module 6 · Contracts — F-30 list & KPIs (off-contract detection), F-31 detail & actions, F-32 prices per Material ID & index adjustment,
   F-33 commitment vs released & released POs, F-34 terms & performance security 2–10% with 30-day alert (R-09),
   F-35 e-signature status & typed, versioned documents (R-19). Routes: #/contracts, #/contracts/<id> (or ?id=) */
(function () {
  const { esc, num, pct, vnd, ty, mid, pill, table, kpi, card } = App;
  const D = () => window.DATA;
  const TYPES = ['Framework', 'Fixed price', 'Service SLA', 'Rate card'];
  const DOC_TYPES = ['Signed contract', 'Phụ lục (amendment)', 'Performance security', 'Specification / drawing', 'BOQ', 'Quotation', 'Mill certificate', 'Biên bản giao nhận'];
  const st = { q: '', ctype: 'all', status: 'all', owner: 'all', form: null, errs: {}, sec: null, secErrs: {}, up: null, upErrs: {} };
  const DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const validDate = (s) => { const m = DATE.exec(s); if (!m) return false; const d = App.dt(s); return d.getDate() === +m[1] && d.getMonth() + 1 === +m[2]; };
  const doc = (id) => D().docs.find((d) => d.id === id);
  const statusOf = (c) => (doc(c.id) || {}).status || 'Draft';
  const sTone = (s) => ({ Active: 'success', Expiring: 'warning', Expired: 'danger', 'Pending signature': 'info' }[s] || 'neutral');
  const used = (c) => { const cm = c.lines.reduce((a, l) => a + l.commit, 0); return cm ? c.lines.reduce((a, l) => a + l.released, 0) / cm * 100 : 0; };
  const uom = (l) => (App.material(l.mat) || {}).uom || '';
  const curPrice = (l) => (l.q4 != null ? l.q4 : l.q3);
  const me = () => (App.state.user && App.state.user.name) || 'Nguyễn Minh Anh';
  const bar = (p, warn) => `<div class="bar" role="img" aria-label="${esc(pct(p, 0))} used"><span class="${warn ? 'warn' : ''}" style="width:${Math.min(100, p).toFixed(1)}%"></span></div>`;

  function field(pre, errs, n, label, val, o = {}) {
    const err = errs[n]; const id = `${pre}-${n}`;
    const attrs = `id="${id}" name="${n}"${err ? ` aria-invalid="true" aria-describedby="${id}-e"` : o.hint ? ` aria-describedby="${id}-h"` : ''}`;
    const input = o.options ? `<select ${attrs}>${o.options.map((x) => { const [v, l] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(v)}"${String(val) === String(v) ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`
      : `<input ${attrs} value="${esc(val)}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.mode ? ` inputmode="${o.mode}"` : ''}>`;
    return `<div class="field"><label for="${id}">${esc(label)}${o.req ? ' *' : ''}</label>${input}${o.hint ? `<span class="hint" id="${id}-h">${esc(o.hint)}</span>` : ''}${err ? `<span class="err" id="${id}-e" role="alert">${esc(err)}</span>` : ''}</div>`;
  }
  const read = (root, sel) => { const o = {}; root.querySelectorAll(`${sel} [name]`).forEach((el) => { o[el.name] = el.value.trim(); }); return o; };
  const money = (s) => Number(String(s).replace(/[.\s₫]/g, '').replace(',', '.'));

  /* ---------- New contract (L-05 step 1) ---------- */
  const vatLabel = (v) => (+v === 8 ? '8% (reduced, until 31/12/2026)' : v + '%');
  const blank = () => ({ ctype: 'Framework', vendor: 'V-1002', start: '01/01/2027', end: '31/12/2027', ceiling: '', vat: String((App.material('CON-24102') || { vat: 10 }).vat), owner: me(), mat: 'CON-24102', commit: '', price: '' });
  function newForm() {
    const f = st.form; const e = st.errs;
    return card('New contract', `<form id="ct-new" novalidate class="stack"><div class="alert alert-info">Number <b class="mono">${esc(nextId())}</b> is assigned on save. Signing happens in the external e-signature tool; ProcureLink stores the status and the signed file.</div>
      <div class="form-grid">
        ${field('cn', e, 'ctype', 'Contract type', f.ctype, { options: TYPES, req: true })}
        ${field('cn', e, 'vendor', 'Vendor', f.vendor, { options: D().vendors.filter((v) => v.status !== 'Blocked').map((v) => [v.id, `${v.id} · ${App.vshort(v)}`]), req: true })}
        ${field('cn', e, 'start', 'Start date', f.start, { req: true, ph: 'dd/mm/yyyy' })}
        ${field('cn', e, 'end', 'End date', f.end, { req: true, ph: 'dd/mm/yyyy' })}
        ${field('cn', e, 'ceiling', 'Ceiling value (₫, excl. VAT)', f.ceiling, { req: true, mode: 'numeric', ph: '1.500.000.000' })}
        ${field('cn', e, 'vat', 'VAT', f.vat, { options: [['8', '8% (reduced, until 31/12/2026)'], ['10', '10%'], ['5', '5%'], ['0', '0%']] })}
        ${field('cn', e, 'owner', 'Owner', f.owner, { options: D().users.filter((u) => u.roles.includes('procurement')).map((u) => u.name) })}
        ${field('cn', e, 'mat', 'Material ID (line 1)', f.mat, { options: D().materials.filter((m) => m.status === 'Active').map((m) => [m.id, `${m.id} · ${m.name}`]), req: true })}
        ${field('cn', e, 'commit', 'Committed qty', f.commit, { req: true, mode: 'decimal' })}
        ${field('cn', e, 'price', 'Contract unit price (₫)', f.price, { req: true, mode: 'numeric' })}
      </div>
      <div class="row-acts"><button type="button" class="btn" data-ct="cancel">Cancel</button><button type="submit" class="btn btn-p">Save contract</button></div></form>`);
  }
  function nextId() { const n = Math.max(...D().contracts.filter((c) => c.id.startsWith('CT-2026')).map((c) => +c.id.slice(8))) + 1; return 'CT-2026-' + String(n).padStart(3, '0'); }
  function saveNew(root) {
    const f = read(root, '#ct-new'); st.form = f; const e = {};
    ['start', 'end'].forEach((k) => { if (!validDate(f[k])) e[k] = 'Use dd/mm/yyyy.'; });
    if (!e.start && !e.end && App.dt(f.end) <= App.dt(f.start)) e.end = 'End date must be after the start date.';
    if (!(money(f.ceiling) > 0)) e.ceiling = 'Enter a value above 0.';
    if (!(Number(f.commit.replace(',', '.')) > 0)) e.commit = 'Enter a quantity above 0.';
    if (!(money(f.price) > 0)) e.price = 'Enter a unit price above 0.';
    const m = App.material(f.mat);
    if (!e.price && !e.commit && !e.ceiling && money(f.price) * Number(f.commit.replace(',', '.')) > money(f.ceiling)) e.ceiling = 'Ceiling is below committed qty × unit price.';
    if (m && +f.vat !== m.vat) e.vat = `VAT must match ${m.id} (${m.vat}%)`;
    else if (+f.vat === 8 && validDate(f.start) && App.dt(f.start) > App.dt('31/12/2026')) e.vat = '8% applies only until 31/12/2026';
    if (m && !m.vendors.some((v) => v[0] === f.vendor && v[1] !== 'Blocked')) e.mat = `${f.vendor} is not an approved vendor for ${m.id}. Approve the vendor – Material ID link first.`;
    st.errs = e; if (Object.keys(e).length) { App.render(); const x = document.querySelector('#ct-new [aria-invalid=true]'); x && x.focus(); return; }
    const id = nextId(); const ceiling = money(f.ceiling);
    D().contracts.push({ id, ctype: f.ctype, vendor: f.vendor, start: f.start, end: f.end, ceiling, vat: +f.vat, owner: f.owner, esign: 'Draft · not sent for signature', minPct: 0, forecast: null,
      lines: [{ mat: f.mat, commit: Number(f.commit.replace(',', '.')), released: 0, q3: null, q4: money(f.price) }], adjust: '—', terms: [['Payment', '30 days after invoice']],
      security: { amount: Math.round(ceiling * 0.05), bank: '—', ref: 'Pending', expiry: App.addDays(f.end, 30) }, releases: [], files: [] });
    D().docs.push({ id, type: 'CT', title: `${f.ctype} – ${App.vshort(App.vendor(f.vendor))}`, date: D().today, status: 'Draft', mats: [f.mat], vendor: f.vendor, value: ceiling });
    st.form = null; st.errs = {}; location.hash = '#/contracts/' + id; App.toast(`${id} saved as draft`);
  }

  /* ---------- List (F-30) ---------- */
  function list() {
    const q = st.q.trim(); const C = D().contracts;
    const rows = C.filter((c) => { const v = App.vendor(c.vendor) || {}; return (!q || [c.id, v.name, c.vendor, ...c.lines.map((l) => l.mat)].some((x) => App.matches(x, q)))
      && (st.ctype === 'all' || c.ctype === st.ctype) && (st.status === 'all' || statusOf(c) === st.status) && (st.owner === 'all' || c.owner === st.owner); });
    const sel = (k, label, opts) => `<label class="sr" for="cl-${k}">${label}</label><select class="inp" id="cl-${k}" data-cf="${k}"><option value="all">${label}: all</option>${opts.map((o) => `<option${st[k] === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    return card('Contracts', `<div class="filters"><label class="sr" for="cl-q">Search contracts</label><input class="inp grow" id="cl-q" data-cf="q" type="search" value="${esc(st.q)}" placeholder="Search contract no., vendor or Material ID">
      ${sel('ctype', 'Type', TYPES)}${sel('status', 'Status', [...new Set(C.map(statusOf))])}${sel('owner', 'Owner', [...new Set(C.map((c) => c.owner))])}</div>
      ${table([
        { h: 'Contract', r: (c) => `<a class="mono" href="#/contracts/${esc(c.id)}">${esc(c.id)}</a><div class="small muted">${esc(c.ctype)}</div>`, w: '130px' },
        { h: 'Vendor', r: (c) => `<a href="#/vendors/${esc(c.vendor)}">${esc(App.vshort(App.vendor(c.vendor)))}</a><div class="small muted">${esc((doc(c.id) || {}).title || '')}</div>`, w: 'minmax(200px,2fr)' },
        { h: 'Material IDs', r: (c) => `<div class="chips">${c.lines.map((l) => mid(l.mat)).join('')}</div>`, w: 'minmax(130px,1.2fr)' },
        { h: 'Period', r: (c) => { const d = App.daysTo(c.end); return `${esc(c.start)} – ${esc(c.end)}<div class="small ${d < 0 ? 'tone-danger' : d <= 60 ? 'tone-warning' : 'muted'}">${d < 0 ? `Expired ${-d} days ago` : `${d} days left`}</div>`; }, w: 'minmax(170px,1.3fr)' },
        { h: 'Ceiling', r: (c) => ty(c.ceiling), cls: 'num', w: '110px' },
        { h: 'Used', r: (c) => `${bar(used(c), c.minPct && used(c) < c.minPct)}<div class="small">${pct(used(c), 0)}</div>`, w: '110px' },
        { h: 'Owner', k: 'owner', w: 'minmax(120px,1fr)' },
        { h: 'Status', r: (c) => pill(statusOf(c), sTone(statusOf(c))), w: '150px' }
      ], rows, { min: 1180, empty: 'No contracts match these filters', label: 'Contracts' })}
      <p class="small muted">Showing ${rows.length} of ${D().contractStats.total} contracts (sample loaded) · values excl. VAT</p>`, '<button class="btn btn-sm" data-act="toast" data-msg="Exported contracts to Excel">Export</button>');
  }

  /* ---------- Detail (F-31..F-35) ---------- */
  function detail(c) {
    const v = App.vendor(c.vendor); const s = statusOf(c); const dl = App.daysTo(c.end);
    const commit = c.lines.reduce((a, l) => a + l.commit, 0), rel = c.lines.reduce((a, l) => a + l.released, 0); const u = uom(c.lines[0]);
    const relValue = c.releases.reduce((a, r) => a + r[2] * r[3], 0); const minQty = commit * c.minPct / 100;
    const sec = c.security; const secPct = sec.amount / c.ceiling * 100; const secDays = App.daysTo(sec.expiry);
    const head = `<div class="page-h"><div><div class="crumbs small muted"><a href="#/contracts">Contracts</a> / ${esc(c.id)}</div><h1><span class="mono">${esc(c.id)}</span> ${esc((doc(c.id) || {}).title || '')}</h1>
        <div class="sub">${esc(c.ctype)} · <a href="#/vendors/${esc(v.id)}">${esc(v.name)}</a> · ${pill(s, sTone(s))} · ${esc(c.esign)}</div></div>
      <div class="acts"><button class="btn" data-act="toast" data-msg="Amendment (Phụ lục) draft created for ${esc(c.id)} · index adjustment capped at ±5% per period">Amend (Phụ lục)</button><button class="btn" data-act="toast" data-msg="Renewal draft created from ${esc(c.id)} · lines and prices copied">Renew</button>
        ${s === 'Active' || s === 'Expiring' ? `<a class="btn btn-p" href="#/po?contract=${esc(c.id)}">Release PO from contract</a>` : `<button class="btn btn-p" disabled title="Only an active contract can release POs">Release PO from contract</button>`}</div></div>`;
    const alerts = [
      dl < 0 ? `<div class="alert alert-danger" role="alert">Expired ${esc(c.end)} — no new releases. POs for ${c.lines.map((l) => esc(l.mat)).join(', ')} are now off-contract.</div>`
        : dl <= 60 ? `<div class="alert alert-warning" role="status">Expires ${esc(c.end)} (${dl} days). Renewal reminder sent to ${esc(c.owner)} at 60 days; another at 30 days; escalates to the Procurement Lead at 7 days.</div>` : '',
      c.minPct && c.forecast != null && c.forecast < minQty ? `<div class="alert alert-warning" role="status">Forecast ${num(c.forecast)} ${esc(u)} by ${esc(c.end)} is below the minimum ${num(minQty)} ${esc(u)} (${c.minPct}% of ${num(commit)}). Plan releases or renegotiate.</div>` : '',
      secDays >= 0 && secDays <= 30 ? `<div class="alert alert-danger" role="alert">Performance security ${esc(sec.ref)} expires ${esc(sec.expiry)} (${secDays} days). ${sec.note ? esc(sec.note) + '.' : 'Ask the vendor for an extension.'}</div>` : ''
    ].join('');
    const summary = card('Summary', `<dl class="dl"><dt>Type</dt><dd>${esc(c.ctype)}</dd><dt>Vendor</dt><dd><a href="#/vendors/${esc(v.id)}">${esc(v.id)} ${esc(App.vshort(v))}</a></dd><dt>Period</dt><dd>${esc(c.start)} – ${esc(c.end)}</dd>
      <dt>Ceiling</dt><dd>${vnd(c.ceiling)} <span class="small muted">(${ty(c.ceiling)})</span></dd><dt>VAT</dt><dd>${esc(vatLabel(c.vat))}</dd><dt>Owner</dt><dd>${esc(c.owner)}</dd><dt>E-signature</dt><dd>${esc(c.esign)}</dd></dl>`);
    const consumption = card('Commitment vs released', `<p class="mt-0"><b>${num(rel)} / ${num(commit)} ${esc(u)}</b> released (${pct(rel / commit * 100, 0)})${c.minPct ? ` · minimum ${num(minQty)} ${esc(u)} = ${c.minPct}%` : ''}</p>${bar(rel / commit * 100, c.minPct && rel / commit * 100 < c.minPct)}
      <div class="stack mt">${c.lines.map((l) => `<div><div class="small">${mid(l.mat)} ${num(l.released)} / ${num(l.commit)} ${esc(uom(l))} · ${pct(l.commit ? l.released / l.commit * 100 : 0, 0)}</div>${bar(l.commit ? l.released / l.commit * 100 : 0)}</div>`).join('')}</div>
      <p class="small muted">Released value ${relValue ? ty(relValue) : '—'} across ${c.releases.length} PO${c.releases.length === 1 ? '' : 's'}${c.histNote ? ' (' + esc(c.histNote) + ')' : ''} · consumption is counted per Material ID.</p>`);
    const prices = card('Prices by Material ID', table([
      { h: 'Material ID', r: (l) => mid(l.mat), w: '120px' }, { h: 'Description', r: (l) => esc((App.material(l.mat) || {}).name || ''), w: 'minmax(160px,2fr)' },
      { h: 'Q3/2026', r: (l) => (l.q3 ? vnd(l.q3) : '—'), cls: 'num', w: '140px' }, { h: 'Q4/2026 (current)', r: (l) => (l.q4 ? vnd(l.q4) : '—'), cls: 'num', w: '150px' },
      { h: 'Change', r: (l) => (l.q3 && l.q4 ? `${l.q4 < l.q3 ? '−' : '+'}${pct(Math.abs(l.q4 - l.q3) / l.q3 * 100)}` : '—'), cls: 'num', w: '90px' }
    ], c.lines, { min: 620, label: 'Contract prices' }) + `<p class="small muted">${esc(c.adjust)}</p>`);
    const releases = card(`Released POs (${c.releases.length})`, table([
      { h: 'PO', r: (r) => (doc(r[0]) ? `<a class="mono" href="#/po">${esc(r[0])}</a>` : `<span class="mono">${esc(r[0])}</span>`), w: '130px' }, { h: 'Date', r: (r) => esc(r[4]), w: '110px' },
      { h: 'Material ID', r: (r) => mid(r[1]), w: '120px' }, { h: 'Qty', r: (r) => `${num(r[2])} ${esc((App.material(r[1]) || {}).uom || '')}`, cls: 'num', w: '100px' },
      { h: 'Unit price', r: (r) => vnd(r[3]), cls: 'num', w: '140px' }, { h: 'Value', r: (r) => vnd(r[2] * r[3]), cls: 'num', w: '160px' }
    ], c.releases.slice().reverse(), { min: 760, empty: 'No POs released yet', label: 'Released POs' }));
    const se = st.secErrs; const sv = st.sec || { amount: num(sec.amount), bank: sec.bank, expiry: sec.expiry };
    const terms = card('Terms & performance security', `<dl class="dl">${c.terms.map(([k, x]) => `<dt>${esc(k)}</dt><dd>${esc(x)}</dd>`).join('')}</dl>
      <h3 class="h-sub">Performance security (bảo đảm thực hiện hợp đồng)</h3>
      <dl class="dl"><dt>Amount</dt><dd>${vnd(sec.amount)} · <b>${pct(secPct)}</b> of ceiling ${secPct < 2 || secPct > 10 ? pill('Outside 2–10%', 'danger') : pill('Within 2–10%', 'success')}</dd><dt>Bank / ref.</dt><dd>${esc(sec.bank)} · <span class="mono">${esc(sec.ref)}</span></dd>
        <dt>Valid to</dt><dd>${esc(sec.expiry)} ${secDays < 0 ? pill('Expired', 'danger') : secDays <= 30 ? pill(`${secDays} days left`, 'danger') : `<span class="small muted">alert on ${esc(App.addDays(sec.expiry, -30))} (30 days before)</span>`}</dd></dl>
      ${st.sec ? `<form id="ct-sec" novalidate class="stack mt"><div class="form-grid">${field('cs', se, 'amount', 'Amount (₫)', sv.amount, { req: true, mode: 'numeric', hint: `2–10% of ${vnd(c.ceiling)} = ${vnd(c.ceiling * 0.02)} – ${vnd(c.ceiling * 0.1)}` })}${field('cs', se, 'bank', 'Issuing bank', sv.bank, { req: true })}${field('cs', se, 'expiry', 'Valid to', sv.expiry, { req: true, ph: 'dd/mm/yyyy', hint: 'Must cover the contract end date' })}</div>
        <div class="row-acts"><button type="button" class="btn btn-sm" data-ct="sec-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Save security</button></div></form>` : ''}`,
    st.sec ? '' : '<button class="btn btn-sm" data-ct="sec-edit">Edit security</button>');
    const ue = st.upErrs; const uv = st.up || { type: 'Signed contract', name: '', mat: '' };
    const files = card(`Documents (${c.files.length})`, table([
      { h: 'Type', r: (f) => esc(f.type), w: 'minmax(140px,1.3fr)' }, { h: 'File', r: (f) => `<span class="mono small">${esc(f.name)}</span>`, w: 'minmax(200px,2fr)' }, { h: 'Version', k: 'ver', w: '80px' },
      { h: 'Uploaded', r: (f) => `${esc(f.date)}<div class="small muted">${esc(f.by)}</div>`, w: 'minmax(130px,1.2fr)' }, { h: 'Label', r: (f) => pill(f.tag, f.tag === 'Signed' ? 'success' : f.tag === 'Uploaded by supplier' ? 'info' : 'neutral'), w: '170px' },
      { h: 'Material IDs', r: (f) => (f.mats.length ? `<div class="chips">${f.mats.map(mid).join('')}</div>` : '<span class="muted">—</span>'), w: 'minmax(130px,1.2fr)' }
    ], c.files.slice().reverse(), { min: 980, empty: 'No documents yet', label: 'Contract documents' })
      + (st.up ? `<form id="ct-up" novalidate class="stack mt"><div class="form-grid">${field('cu', ue, 'type', 'Document type', uv.type, { options: DOC_TYPES, req: true })}${field('cu', ue, 'name', 'File name', uv.name, { req: true, ph: 'e.g. CT-2026-008_PL02.pdf', hint: 'PDF, DOCX or XLSX · same type gets the next version' })}${field('cu', ue, 'mat', 'Material ID tag', uv.mat, { options: [['', '— none —']].concat(c.lines.map((l) => [l.mat, l.mat])) })}</div>
        <div class="row-acts"><button type="button" class="btn btn-sm" data-ct="up-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Upload</button></div></form>` : ''),
    st.up ? '' : '<button class="btn btn-sm" data-ct="up">Upload</button>');
    return `${head}${alerts}<div class="grid-k">${kpi('Ceiling', ty(c.ceiling), `VAT ${vatLabel(c.vat)} excl.`)}${kpi('Released', `${num(rel)} ${esc(u)}`, `of ${num(commit)} · ${pct(rel / commit * 100, 0)}`, c.minPct && rel / commit * 100 < c.minPct ? 'warning' : '')}${kpi('Released value', relValue ? ty(relValue) : '—', `${c.releases.length} PO${c.releases.length === 1 ? '' : 's'}${c.histNote ? ' · ' + c.histNote : ''}`)}${kpi('Days to expiry', dl < 0 ? 'Expired' : String(dl), esc(c.end), dl < 0 ? 'danger' : dl <= 60 ? 'warning' : '')}</div>
      <div class="grid-2"><div class="stack">${consumption}${prices}${releases}${files}</div><div class="stack">${summary}${terms}</div></div>`;
  }

  App.page('contracts', {
    title: 'Contracts', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, sub) {
      const id = sub || p.id;
      if (id) { const c = D().contracts.find((x) => x.id === id); if (st.cur !== id) { st.cur = id; st.sec = null; st.up = null; st.secErrs = {}; st.upErrs = {}; } return c ? detail(c) : App.errorState(`Contract ${id} was not found.`, ' <a href="#/contracts">Back to contracts</a>'); }
      const C = D().contracts; const exp = C.filter((c) => { const d = App.daysTo(c.end); return d >= 0 && d <= 60; });
      const avg = C.filter((c) => !['Expired', 'Pending signature', 'Draft'].includes(statusOf(c))).reduce((a, c, _, A) => a + used(c) / A.length, 0);
      return `<div class="page-h"><div><h1>${esc(App.t('Contracts'))}</h1><div class="sub">Framework, fixed-price, SLA and rate-card contracts · prices and commitments per Material ID</div></div>
        <div class="acts"><button class="btn btn-p" data-ct="new">New contract</button></div></div>
        <div class="grid-k">${kpi('Active contracts', `${D().contractStats.active} / ${D().contractStats.total}`, 'All vendors')}${kpi('Contract value', num(D().contractStats.value, 1) + ' tỷ ₫', 'Ceilings, excl. VAT')}${kpi('Expiring ≤ 60 days', String(exp.length), exp.map((c) => c.id).join(', ') || 'None', exp.length ? 'warning' : '')}${kpi('Average consumption', pct(D().contractStats.avgUse, 0), `${pct(avg, 0)} in this sample · released ÷ committed`)}</div>
        <div class="alert alert-warning" role="status"><b>Off-contract purchase</b> · ${App.docid('PO-2026-0861')} buys ${mid('CON-24102')} at ${vnd(1680000)} (+6,4% vs ${vnd(1580000)}) after <a class="mono" href="#/contracts/CT-2025-007">CT-2025-007</a> expired 30/09/2026. Renew the contract or tender the volume.</div>
        ${st.form ? newForm() : ''}${list()}`;
    },
    mount(root) {
      root.addEventListener('input', (e) => { if (e.target.dataset.cf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('cl-q'); i.focus(); i.setSelectionRange(pos, pos); } });
      root.addEventListener('change', (e) => { const k = e.target.dataset.cf; if (k && k !== 'q') { st[k] = e.target.value; App.render(); } });
      root.addEventListener('submit', (e) => {
        const f = e.target; if (!['ct-new', 'ct-sec', 'ct-up'].includes(f.id)) return; e.preventDefault();
        if (f.id === 'ct-new') return saveNew(root);
        const c = D().contracts.find((x) => x.id === st.cur);
        if (f.id === 'ct-sec') {
          const x = read(root, '#ct-sec'); st.sec = x; const er = {}; const amt = money(x.amount); const p = amt / c.ceiling * 100;
          if (!(amt > 0)) er.amount = 'Enter an amount.'; else if (p < 2 || p > 10) er.amount = `Must be 2–10% of the contract value (now ${num(p, 1)}%).`;
          if (!x.bank) er.bank = 'Issuing bank is required.';
          if (!validDate(x.expiry)) er.expiry = 'Use dd/mm/yyyy.'; else if (App.dt(x.expiry) < App.dt(c.end)) er.expiry = `Must be valid until at least the contract end (${c.end}).`;
          st.secErrs = er; if (Object.keys(er).length) { App.render(); const q = document.querySelector('#ct-sec [aria-invalid=true]'); q && q.focus(); return; }
          Object.assign(c.security, { amount: amt, bank: x.bank, expiry: x.expiry }); st.sec = null; App.render(); App.toast(`Performance security saved · alert set for ${App.addDays(x.expiry, -30)}`);
        } else {
          const x = read(root, '#ct-up'); st.up = x; const er = {};
          if (!/^[\w.\- ()]+\.(pdf|docx|xlsx)$/i.test(x.name)) er.name = 'Enter a file name ending in .pdf, .docx or .xlsx.';
          st.upErrs = er; if (Object.keys(er).length) { App.render(); document.getElementById('cu-name').focus(); return; }
          const ver = 'v' + (Math.max(0, ...c.files.filter((y) => y.type === x.type).map((y) => +String(y.ver).slice(1) || 0)) + 1);
          c.files.push({ type: x.type, name: x.name, ver, by: me(), date: D().today, mats: x.mat ? [x.mat] : [], tag: x.type === 'Signed contract' || x.type.startsWith('Phụ lục') ? 'Signed' : 'Uploaded' });
          st.up = null; App.render(); App.toast(`${x.name} uploaded as ${x.type} ${ver}`);
        }
      });
      root.addEventListener('click', (e) => {
        const t = e.target.closest('[data-ct]'); if (!t) return; const a = t.dataset.ct;
        if (a === 'new') { st.form = blank(); st.errs = {}; App.render(); document.getElementById('cn-ctype').focus(); }
        else if (a === 'cancel') { st.form = null; st.errs = {}; App.render(); }
        else if (a === 'sec-edit') { st.sec = { amount: num(D().contracts.find((x) => x.id === st.cur).security.amount), bank: D().contracts.find((x) => x.id === st.cur).security.bank, expiry: D().contracts.find((x) => x.id === st.cur).security.expiry }; st.secErrs = {}; App.render(); document.getElementById('cs-amount').focus(); }
        else if (a === 'sec-cancel') { st.sec = null; st.secErrs = {}; App.render(); }
        else if (a === 'up') { st.up = { type: 'Signed contract', name: '', mat: '' }; st.upErrs = {}; App.render(); document.getElementById('cu-type').focus(); }
        else if (a === 'up-cancel') { st.up = null; st.upErrs = {}; App.render(); }
      });
    }
  });
})();
