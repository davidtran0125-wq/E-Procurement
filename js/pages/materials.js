/* Module 3 · Material ID — F-10 list & filters, F-11 numbering & change log, F-12 new request, F-13 required certificates,
   F-14 VAT default & 8% reduction, F-15 duplicate check, F-16 approval workflow. Route: #/materials */
(function () {
  const { esc, num, vnd, mid, pill, table, kpi, card } = App;
  const D = () => window.DATA;
  const CAT = { CON: 'Construction', EQP: 'Equipment', SRV: 'Services', LOG: 'Logistics' };
  const METAL = /thép|kim loại|steel/i;
  const st = { q: '', cat: 'all', group: 'all', status: 'all', vat: 'all', single: false, form: false, f: null, errs: {}, dupReason: '' };

  const vatLabel = (m) => (m.vat === 'KCT' ? 'KCT' : m.vat === 8 ? '8% (reduced, until 31/12/2026)' : m.vat + '%');
  const statusTone = (s) => (s === 'Active' ? 'success' : s === 'Blocked' ? 'danger' : s === 'Draft' ? 'neutral' : 'warning');
  const eligibleVendors = (m) => m.vendors.filter((v) => v[1] !== 'Blocked');
  App.vatLabel = vatLabel;

  const blank = () => ({ cat: 'CON', group: 'Thép xây dựng', name: 'Thép cây D16 CB500-V', en: 'Rebar D16 CB500-V', uom: 'tấn', alt: '1 tấn = 54 cây', diameter: '16', grade: 'CB500-V', hs: '7214.20', lead: '7', moq: '5 tấn',
    certs: ['CO/CQ per lot', 'Hợp quy QCVN 7:2019/BKHCN'], vat: '10', vat8: 'No', attType: 'Spec sheet', attName: 'TCVN1651-2_CB500V.pdf' });

  function nextId(cat) { const c = D().categories.find((x) => x.code === cat); return `${cat}-${c.next}`; }

  /* Duplicate check: same category + group + UoM → base 60; same main spec (diameter) +20; name token overlap ×20 */
  function dupCheck(f) {
    const tok = (s) => new Set(String(s).toLowerCase().split(/[\s,]+/).filter(Boolean));
    const a = tok(f.name);
    return D().materials.filter((m) => m.status !== 'Blocked' && m.cat === f.cat && m.group === f.group && m.uom === f.uom).map((m) => {
      const b = tok(m.name); const inter = [...a].filter((x) => b.has(x)).length; const jac = inter / new Set([...a, ...b]).size;
      const dia = (m.spec.find((s) => s[0] === 'Diameter') || [])[1];
      const score = Math.round(60 + (dia && f.diameter && parseInt(dia, 10) === parseInt(f.diameter, 10) ? 20 : 0) + jac * 20);
      return { m, score };
    }).filter((x) => x.score >= 75).sort((x, y) => y.score - x.score);
  }

  function validate(f, submit) {
    const e = {};
    if (!f.name.trim()) e.name = 'Vietnamese description is required.';
    if (!f.en.trim()) e.en = 'English description is required.';
    if (!f.group.trim()) e.group = 'Material group is required.';
    if (!f.uom.trim()) e.uom = 'Base UoM is required.';
    if (submit) {
      if (f.hs && !/^\d{4}(\.\d{2}){0,2}$/.test(f.hs) && f.hs !== '—') e.hs = 'HS code format: 4 digits, optional .NN (e.g. 7214.20).';
      if (f.lead === '' || isNaN(+f.lead) || +f.lead < 0) e.lead = 'Lead time must be 0 or more days.';
      if (!f.moq.trim()) e.moq = 'MOQ is required.';
      if (f.vat8 === 'Yes' && METAL.test(f.group + ' ' + f.name)) e.vat8 = 'Metal products are excluded from the 8% reduction (NQ 204/2025). Use 10%.';
      if (f.vat8 === 'Yes' && f.vat !== '8') e.vat8 = 'An item eligible for the reduction must default to 8%.';
      if (f.vat === '8' && f.vat8 !== 'Yes') e.vat = '8% is only allowed for items eligible for the reduction.';
      const dups = dupCheck(f);
      if (dups.length && st.dupReason.trim().length < 10) e.dup = 'Explain why this is not a duplicate (at least 10 characters).';
    }
    return e;
  }

  function readForm(root) {
    const g = (n) => { const el = root.querySelector(`[name="${n}"]`); return el ? el.value : ''; };
    return { cat: g('cat'), group: g('group'), name: g('name'), en: g('en'), uom: g('uom'), alt: g('alt'), diameter: g('diameter'), grade: g('grade'), hs: g('hs'), lead: g('lead'), moq: g('moq'),
      certs: [...root.querySelectorAll('[name=certs]:checked')].map((c) => c.value), vat: g('vat'), vat8: g('vat8'), attType: g('attType'), attName: g('attName') };
  }

  function field(name, label, f, opts = {}) {
    const err = st.errs[name];
    const input = opts.options
      ? `<select id="nm-${name}" name="${name}">${opts.options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}"${String(f[name]) === String(v) ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`
      : `<input id="nm-${name}" name="${name}" value="${esc(f[name])}"${opts.mono ? ' class="mono"' : ''}${err ? ' aria-invalid="true"' : ''}>`;
    return `<div class="field"><label for="nm-${name}">${esc(label)}${opts.req ? ' *' : ''}</label>${input}${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}${err ? `<span class="err" role="alert">${esc(err)}</span>` : ''}</div>`;
  }

  function requestForm() {
    const f = st.f; const dups = dupCheck(f); const metal = METAL.test(f.group + ' ' + f.name);
    const certOpts = ['CO/CQ per lot', 'Hợp quy QCVN 7:2019/BKHCN', 'ISO 9001', 'Test report'];
    return card('New Material ID request', `
      <form id="nm-form" novalidate class="stack">
        <div class="alert alert-info">Material ID <b class="mono">${esc(nextId(f.cat))}</b> will be reserved on submit and assigned on approval. Numbers are never reused.</div>
        <div class="form-grid">
          ${field('cat', 'Category', f, { options: Object.entries(CAT).map(([k, l]) => [k, `${k} · ${l}`]), req: true })}
          ${field('group', 'Material group', f, { req: true, hint: 'e.g. Thép xây dựng, Xi măng, Bơm' })}
          ${field('name', 'Description (VN)', f, { req: true })}
          ${field('en', 'Description (EN)', f, { req: true })}
          ${field('uom', 'Base UoM', f, { req: true })}
          ${field('alt', 'Alt-UoM conversion', f, { hint: 'e.g. 1 tấn = 54 cây' })}
          ${field('diameter', 'Spec · diameter (mm)', f)}
          ${field('grade', 'Spec · grade', f)}
          ${field('hs', 'HS code', f, { mono: true })}
          ${field('lead', 'Lead time (days)', f)}
          ${field('moq', 'MOQ', f)}
        </div>
        <fieldset class="fs"><legend>Required certificates (checked at)</legend>${certOpts.map((c) => `<label class="chk"><input type="checkbox" name="certs" value="${esc(c)}"${f.certs.includes(c) ? ' checked' : ''}> ${esc(c)} <span class="muted small">· ${c.startsWith('CO') || c === 'Test report' ? 'GRN' : c.startsWith('Hợp') ? 'PO date' : 'tender & PO date'}</span></label>`).join('')}</fieldset>
        <div class="form-grid">
          ${field('vat', 'Default VAT rate', f, { options: [['0', '0%'], ['5', '5%'], ['8', '8% (reduced, until 31/12/2026)'], ['10', '10%'], ['KCT', 'KCT (not subject)']], req: true })}
          ${field('vat8', 'Eligible for 8% reduction', f, { options: ['No', 'Yes'], hint: metal ? 'Metal products are excluded (NQ 204/2025) → 10%' : 'NQ 204/2025 · valid until 31/12/2026' })}
          <div class="field"><span class="lbl">Confirmed by Finance</span><span>${pill('Pending · Đỗ Hoàng Nam', 'warning')}</span><span class="hint">Admin assigns the code only after Finance confirms VAT.</span></div>
        </div>
        <div class="form-grid">${field('attType', 'Attachment type', f, { options: ['Spec sheet', 'Datasheet', 'Certificate', 'Drawing'] })}${field('attName', 'File (v1)', f)}</div>
        ${dups.length ? `<div class="alert alert-warning" role="status"><b>Possible duplicate · same group, diameter and UoM</b><ul class="plain">${dups.map((d) => `<li>${mid(d.m.id)} ${esc(d.m.name)} · <b>${d.score}% match</b></li>`).join('')}</ul>
          <div class="field"><label for="nm-dup">Why is this not a duplicate? *</label><input id="nm-dup" name="dupReason" value="${esc(st.dupReason)}" placeholder="e.g. Grade differs: CB500-V vs CB400-V">${st.errs.dup ? `<span class="err" role="alert">${esc(st.errs.dup)}</span>` : ''}</div></div>` : '<div class="alert alert-success">No duplicates found in this group.</div>'}
        <div class="row-acts"><button type="button" class="btn" data-mm="cancel">Cancel</button><button type="button" class="btn" data-mm="check">Run duplicate check</button><button type="button" class="btn" data-mm="draft">Save draft</button><button type="submit" class="btn btn-p">Submit for approval</button></div>
        <p class="muted small">Route: Requester → Material master owner (duplicate, spec, VAT, certificates) → Admin assigns code. SoD: the requester cannot approve their own request.</p>
      </form>`);
  }

  function list() {
    const q = st.q.toLowerCase();
    const rows = D().materials.filter((m) => (!q || [m.id, m.name, m.en, m.hs, m.group].some((x) => String(x).toLowerCase().includes(q)))
      && (st.cat === 'all' || m.cat === st.cat) && (st.group === 'all' || m.group === st.group) && (st.status === 'all' || m.status === st.status)
      && (st.vat === 'all' || String(m.vat) === st.vat) && (!st.single || (m.status === 'Active' && eligibleVendors(m).length === 1)));
    const groups = [...new Set(D().materials.map((m) => m.group))].sort();
    const sel = (k, label, opts) => `<label class="sr" for="mf-${k}">${label}</label><select class="inp" id="mf-${k}" data-mf="${k}"><option value="all">${label}: all</option>${opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}"${st[k] === v ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
    return card('Material IDs', `<div class="filters">
        <label class="sr" for="mf-q">Search</label><input class="inp grow" id="mf-q" data-mf="q" type="search" value="${esc(st.q)}" placeholder="Search ID, description VN/EN, HS code">
        ${sel('cat', 'Category', Object.entries(CAT))}${sel('group', 'Group', groups)}${sel('status', 'Status', ['Active', 'Pending approval', 'Draft', 'Blocked'])}
        ${sel('vat', 'VAT', [['0', '0%'], ['5', '5%'], ['8', '8%'], ['10', '10%'], ['KCT', 'KCT']])}
        <label class="chk"><input type="checkbox" data-mf="single"${st.single ? ' checked' : ''}> Single source only</label></div>
      ${table([
        { h: 'Material ID', r: (m) => mid(m.id), w: '120px' },
        { h: 'Description', r: (m) => `${esc(m.name)}<div class="small muted">${esc(m.en)}</div>`, w: 'minmax(200px,2.2fr)' },
        { h: 'Category · group', r: (m) => `${esc(CAT[m.cat])}<div class="small muted">${esc(m.group)}</div>` },
        { h: 'UoM', k: 'uom', w: '80px' },
        { h: 'VAT', r: (m) => `${esc(m.vat === 8 ? '8%' : m.vat + '%')}${m.vat === 8 ? '<div class="small muted">reduced to 31/12</div>' : ''}${m.vatConfirmed ? '' : '<div class="small tone-warning">Finance pending</div>'}`, w: '110px' },
        { h: 'Last price', r: (m) => (m.last ? vnd(m.last) + `<div class="small muted mono">${esc(m.lastPo)}</div>` : '<span class="muted">—</span>'), cls: 'num', w: '150px' },
        { h: 'Vendors', r: (m) => { const n = eligibleVendors(m).length; return `${n}${m.status === 'Active' && n === 1 ? ' ' + pill('Single source', 'warning') : ''}`; }, w: '130px' },
        { h: 'Contracts', r: (m) => (m.contracts.length ? m.contracts.map((c) => `<a class="mono small" href="#/contracts">${esc(c)}</a>`).join('<br>') : '<span class="muted">—</span>'), w: '120px' },
        { h: 'Status', r: (m) => pill(m.status, statusTone(m.status)) + (m.step ? `<div class="small muted">${esc(m.step)}</div>` : ''), w: '140px' }
      ], rows, { min: 1180, empty: 'No Material IDs match these filters' })}
      <p class="muted small">Showing ${rows.length} of ${num(D().materialStats.total)} Material IDs (sample loaded) · prices excl. VAT</p>`,
      `<button class="btn btn-sm" data-act="toast" data-msg="Import Excel: template MaterialID_import_v3.xlsx">Import Excel</button><button class="btn btn-sm" data-act="toast" data-msg="Exported ${rows.length} Material IDs to Excel">Export</button>`);
  }

  function side() {
    const C = D().categories;
    const numbering = card('Numbering rules', `<p class="small" style="margin-top:0">Format <span class="mono">CAT-NNNNN</span>. Number reserved on submit, assigned on approval, never reused (e.g. LOG-61013 blocked as duplicate of LOG-61012).</p>` + table([
      { h: 'Category', r: (c) => `<b class="mono">${c.code}</b> ${esc(c.name)}` }, { h: 'Range', r: (c) => `<span class="mono small">${c.range[0]}–${c.range[1]}</span>` }, { h: 'Next', r: (c) => `<span class="mono small">${c.code}-${c.next}</span>` }
    ], C, { min: 340 }));
    const flow = card('Approval workflow', `<ol class="flow"><li><b>Requester</b><span class="small muted">Submits; number reserved</span></li><li><b>Material master owner</b><span class="small muted">Duplicate, spec, VAT, certificates</span></li><li><b>Admin</b><span class="small muted">Assigns code after Finance confirms VAT</span></li></ol>
      <p class="small muted">SoD: a requester cannot approve their own request. Pending: ${D().materials.filter((m) => m.status === 'Pending approval').map((m) => mid(m.id) + ' ' + esc(m.step || '')).join(', ') || 'none'}</p>`, '<a class="btn btn-sm" href="#/approvals">My approvals</a>');
    const vat = card('VAT rules', `<ul class="plain small"><li>VAT is an attribute of the Material ID; every PR, bid, PO and invoice line inherits it.</li><li>8% reduction (NQ 204/2025/QH15, NĐ 174/2025) valid until 31/12/2026, labelled "8% (reduced, until 31/12/2026)".</li><li>Metal products are excluded: ${mid('CON-24015')} ${mid('CON-24020')} stay at 10%.</li><li>"Confirmed by Finance" is required before the code is assigned.</li></ul>`);
    const log = card('Change log · last 7 days', `<ul class="log">${D().materialLog.map((l) => `<li><span class="small muted">${esc(l.at)} · ${esc(l.who)}</span><div>${mid(l.mat)} ${esc(l.what)}</div></li>`).join('')}</ul>`);
    return numbering + flow + vat + log;
  }

  App.page('materials', {
    title: 'Material IDs',
    render() {
      const S = D().materialStats;
      const pend = D().materials.filter((m) => m.status === 'Pending approval').length;
      return `<div class="page-h"><div><h1>Material IDs</h1><div class="sub">Master data · every vendor, tender, PR, PO and invoice line links to a Material ID</div></div>
        <div class="acts"><button class="btn btn-p" data-mm="new">New Material ID</button></div></div>
        <div class="grid-k">${kpi('Material IDs', num(S.total), 'All categories')}${kpi('Active', num(S.active), 'Usable on PR / PO')}${kpi('Pending approval', num(S.pending), `${pend} in this sample`, 'warning')}${kpi('Single source', num(S.singleSource), 'Only 1 approved vendor', 'warning')}</div>
        ${st.form ? requestForm() : ''}
        <div class="grid-2">${list()}<div class="stack">${side()}</div></div>`;
    },
    mount(root) {
      root.addEventListener('input', (e) => {
        if (e.target.dataset.mf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('mf-q'); i.focus(); i.setSelectionRange(pos, pos); }
        if (e.target.name === 'dupReason') st.dupReason = e.target.value;
      });
      root.addEventListener('change', (e) => {
        const k = e.target.dataset.mf;
        if (k && k !== 'q') { st[k] = k === 'single' ? e.target.checked : e.target.value; App.render(); return; }
        const form = e.target.closest('#nm-form');
        if (form && ['cat', 'group', 'uom', 'vat', 'vat8', 'diameter', 'name'].includes(e.target.name)) {
          st.f = readForm(root);
          if (e.target.name === 'vat8' && st.f.vat8 === 'Yes' && !METAL.test(st.f.group + st.f.name)) st.f.vat = '8';
          App.render();
        }
      });
      root.addEventListener('click', (e) => {
        const t = e.target.closest('[data-mm]'); if (!t) return;
        const a = t.dataset.mm;
        if (a === 'new') { st.form = true; st.f = st.f || blank(); st.errs = {}; App.render(); document.getElementById('nm-form').scrollIntoView({ block: 'start' }); }
        if (a === 'cancel') { st.form = false; st.f = null; st.errs = {}; st.dupReason = ''; App.render(); }
        if (a === 'check') { st.f = readForm(root); App.render(); App.toast(dupCheck(st.f).length ? 'Possible duplicate found' : 'No duplicates found'); }
        if (a === 'draft') { st.f = readForm(root); st.errs = validate(st.f, false); if (!Object.keys(st.errs).length) save('Draft'); else App.render(); }
      });
      root.addEventListener('submit', (e) => {
        if (e.target.id !== 'nm-form') return; e.preventDefault();
        st.f = readForm(root); st.errs = validate(st.f, true);
        if (Object.keys(st.errs).length) { App.render(); const er = document.querySelector('.err'); er && er.scrollIntoView({ block: 'center' }); return; }
        save('Pending approval');
      });
    }
  });

  function save(status) {
    const f = st.f; const c = D().categories.find((x) => x.code === f.cat); const id = `${f.cat}-${c.next}`; c.next += 1;
    D().materials.unshift({ id, cat: f.cat, group: f.group, name: f.name, en: f.en, uom: f.uom, alt: f.alt ? [[f.alt.split('=')[1] ? f.alt.split('=')[1].trim().replace(/^[\d.,]+\s*/, '') : f.alt, f.alt]] : [], status, step: status === 'Draft' ? null : 'Step 1 of 3',
      hs: f.hs, lead: +f.lead || 0, moq: f.moq, spec: [['Diameter', f.diameter ? f.diameter + ' mm' : '—'], ['Grade', f.grade || '—']].filter((s) => s[1] !== '—'),
      vat: f.vat === 'KCT' ? 'KCT' : +f.vat, vat8: f.vat8 === 'Yes', vatConfirmed: null, last: null, lastPo: null, avg90: null, avg12: null, vendors: [], contracts: [],
      certs: f.certs.map((x) => [x, x.startsWith('CO') || x === 'Test report' ? 'At GRN' : x.startsWith('Hợp') ? 'Valid on PO date' : 'At tender and PO date']),
      otif: [0, 0], spendYtd: 0, owner: 'Nguyễn Minh Anh', created: D().today, dupNote: st.dupReason });
    D().materialLog.unshift({ at: D().today + ' 10:30', mat: id, who: 'Nguyễn Minh Anh', what: status === 'Draft' ? 'Saved as draft' : 'Submitted for approval · number reserved · routed to Material master owner' });
    D().attachments.push({ id: 'ATT-' + id, mat: id, type: f.attType, name: f.attName, ver: 'v1', date: D().today });
    st.form = false; st.f = null; st.errs = {}; st.dupReason = '';
    App.render(); App.toast(status === 'Draft' ? `${id} saved as draft` : `${id} submitted · Step 1 of 3`);
  }
})();
