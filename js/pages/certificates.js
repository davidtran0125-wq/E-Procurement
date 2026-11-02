/* Module 7 · Certificates — F-36 register (per vendor & Material ID), F-37 review supplier uploads (Approve & unblock),
   F-38 block rule for expired mandatory certificates, F-39 90-day expiry timeline with 60/30-day reminders. Route: #/certificates (?vendor=, ?mat=, ?id=) */
(function () {
  const { esc, num, mid, pill, table, kpi, card } = App;
  const D = () => window.DATA;
  const TYPES = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'Hợp quy QCVN 7:2019/BKHCN', 'Hợp quy QCVN 16:2023/BXD', 'CO/CQ per lot', 'Test report'];
  const REJECT = ['Holder name does not match the vendor master', 'Scope does not cover the Material ID', 'Certificate expired or dates unreadable', 'Certification body not accredited', 'Other (see comment)'];
  const st = { q: '', type: 'all', holder: 'all', status: 'all', mand: false, review: null, rv: null, rerr: {}, up: null, uerr: {} };
  const DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const validDate = (s) => { const m = DATE.exec(s); if (!m) return false; const d = App.dt(s); return d.getDate() === +m[1] && d.getMonth() + 1 === +m[2]; };
  const me = () => (App.state.user && App.state.user.name) || 'Nguyễn Minh Anh';
  const requiredFor = (c) => c.mats.filter((m) => (App.material(m) || { certs: [] }).certs.some(([n]) => n === c.type));
  const statusOf = (c) => { if (['Pending review', 'Rejected', 'Superseded'].includes(c.status)) return c.status; const d = App.daysTo(c.expiry); return d < 0 ? 'Expired' : d <= 30 ? 'Expiring' : 'Valid'; };
  const sTone = (s) => ({ Valid: 'success', Expiring: 'warning', Expired: 'danger', 'Pending review': 'info', Rejected: 'danger' }[s] || 'neutral');
  const daysNote = (c) => { const d = App.daysTo(c.expiry); return d < 0 ? `<span class="small tone-danger">expired ${-d} days ago</span>` : `<span class="small ${d <= 30 ? 'tone-warning' : d <= 60 ? 'tone-warning' : 'muted'}">${d} days left</span>`; };
  // Blocked pairs (F-38): an expired certificate that a Material ID in scope requires blocks that vendor – Material ID pair, unless a valid replacement exists.
  const blocks = () => D().certificates.filter((c) => statusOf(c) === 'Expired').flatMap((c) => requiredFor(c).filter((m) => !D().certificates.some((x) => x !== c && x.vendor === c.vendor && x.type === c.type && x.mats.includes(m) && ['Valid', 'Expiring'].includes(statusOf(x)))).map((m) => ({ c, m })));

  function field(pre, errs, n, label, val, o = {}) {
    const err = errs[n]; const id = `${pre}-${n}`;
    const attrs = `id="${id}" name="${n}"${err ? ` aria-invalid="true" aria-describedby="${id}-e"` : ''}`;
    const input = o.options ? `<select ${attrs}>${o.options.map((x) => { const [v, l] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(v)}"${String(val) === String(v) ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`
      : o.area ? `<textarea ${attrs}>${esc(val)}</textarea>` : `<input ${attrs} value="${esc(val)}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}>`;
    return `<div class="field"><label for="${id}">${esc(label)}${o.req ? ' *' : ''}</label>${input}${o.hint ? `<span class="hint">${esc(o.hint)}</span>` : ''}${err ? `<span class="err" id="${id}-e" role="alert">${esc(err)}</span>` : ''}</div>`;
  }
  const read = (root, sel) => { const o = {}; root.querySelectorAll(`${sel} [name]`).forEach((el) => { o[el.name] = el.type === 'checkbox' ? el.checked : el.value.trim(); }); return o; };

  /* ---------- Register (F-36) ---------- */
  function register() {
    const q = st.q.trim(); const C = D().certificates;
    const rows = C.filter((c) => { const v = App.vendor(c.vendor) || {}; return (!q || [c.id, c.no, c.type, v.name, c.vendor, ...c.mats].some((x) => App.matches(x, q)))
      && (st.type === 'all' || c.type === st.type) && (st.holder === 'all' || c.vendor === st.holder) && (st.status === 'all' || statusOf(c) === st.status) && (!st.mand || requiredFor(c).length); });
    const sel = (k, label, opts) => `<label class="sr" for="cf-${k}">${label}</label><select class="inp" id="cf-${k}" data-cf="${k}"><option value="all">${label}: all</option>${opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}"${st[k] === v ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
    return card('Certificate register', `<div class="filters"><label class="sr" for="cf-q">Search certificates</label><input class="inp grow" id="cf-q" data-cf="q" type="search" value="${esc(st.q)}" placeholder="Search number, vendor or Material ID">
      ${sel('type', 'Type', [...new Set(C.map((c) => c.type))])}${sel('holder', 'Holder', [...new Set(C.map((c) => c.vendor))].map((id) => [id, `${id} · ${App.vshort(App.vendor(id))}`]))}${sel('status', 'Status', ['Valid', 'Expiring', 'Expired', 'Pending review', 'Superseded', 'Rejected'])}
      <label class="chk"><input type="checkbox" data-cf="mand"${st.mand ? ' checked' : ''}> Mandatory only</label></div>
      ${table([
        { h: 'Certificate', r: (c) => `<b>${esc(c.type)}</b><div class="small muted mono">${esc(c.no)}</div>`, w: 'minmax(190px,1.8fr)' },
        { h: 'Holder', r: (c) => `<a href="#/vendors/${esc(c.vendor)}"><span class="mono small">${esc(c.vendor)}</span> ${esc(App.vshort(App.vendor(c.vendor)))}</a>`, w: 'minmax(150px,1.3fr)' },
        { h: 'Scope · Material IDs', r: (c) => `<div class="chips">${c.mats.map(mid).join('')}</div>${requiredFor(c).length ? `<div class="small">Mandatory for ${requiredFor(c).map(esc).join(', ')}</div>` : '<div class="small muted">Not mandatory</div>'}`, w: 'minmax(190px,1.7fr)' },
        { h: 'Issuer', r: (c) => esc(c.issuer), w: 'minmax(140px,1.2fr)' },
        { h: 'Expiry', r: (c) => `${esc(c.expiry)}<div>${daysNote(c)}</div>`, w: '130px' },
        { h: 'Verified', r: (c) => (c.verified ? `<span class="small">${esc(c.verified)}</span>` : c.uploaded ? `<span class="small muted">Uploaded ${esc(c.uploaded)}</span>` : '—'), w: 'minmax(150px,1.3fr)' },
        { h: 'Status', r: (c) => pill(statusOf(c), sTone(statusOf(c))) + (statusOf(c) === 'Pending review' ? `<div><button class="linkish small" data-cert="review" data-id="${esc(c.id)}">Review</button></div>` : ''), w: '140px' }
      ], rows, { min: 1200, empty: 'No certificates match these filters', label: 'Certificate register' })}
      <p class="small muted">Showing ${rows.length} of ${num(Object.values(D().certStats).reduce((a, x) => a + x, 0))} certificates (sample loaded)</p>`,
    '<button class="btn btn-sm" data-act="toast" data-msg="Exported certificate register to Excel">Export</button>');
  }

  /* ---------- Review upload (F-37) ---------- */
  function review() {
    const c = D().certificates.find((x) => x.id === st.review); if (!c) return '';
    const v = App.vendor(c.vendor); const r = st.rv || (st.rv = { no: c.no, issuer: c.issuer, holder: v.name, expiry: c.expiry, acc: false, gap: false, reason: '', comment: '' }); const e = st.rerr;
    const need = D().materials.filter((m) => m.vendors.some((x) => x[0] === v.id) && m.certs.some(([n]) => n === c.type)).map((m) => m.id);
    const auto = [['Holder name matches the vendor master', App.norm(r.holder) === App.norm(v.name)], [`Scope covers ${need.length ? need.join(', ') : 'the Material IDs'} requiring ${c.type}`, need.every((m) => c.mats.includes(m))], ['Expiry date is after today', validDate(r.expiry) && App.daysTo(r.expiry) > 0]];
    return card(`Review upload · ${c.type} · ${v.name}`, `<form id="cert-rv" novalidate class="stack">
      <div class="grid-2"><div class="state" aria-label="PDF preview"><b>${esc(c.file || c.no + '.pdf')}</b><span class="muted small">PDF preview · page 1 of 2 · uploaded ${esc(c.uploaded || '')}</span></div>
        <div class="stack">${field('rv', e, 'no', 'Certificate number', r.no, { req: true })}${field('rv', e, 'issuer', 'Certification body', r.issuer, { req: true })}${field('rv', e, 'holder', 'Holder (as printed)', r.holder, { req: true })}${field('rv', e, 'expiry', 'Expiry date', r.expiry, { req: true, ph: 'dd/mm/yyyy' })}</div></div>
      <div><b class="small">Scope</b> <span class="chips">${c.mats.map(mid).join('')}</span>${c.replaces ? ` <span class="small muted">· replaces ${esc(c.replaces)}</span>` : ''}</div>
      <fieldset class="fs"><legend>Checklist</legend>
        ${auto.map(([l, ok]) => `<div class="small">${pill(ok ? 'Pass' : 'Fail', ok ? 'success' : 'danger')} ${esc(l)} <span class="muted">· auto</span></div>`).join('')}
        <label class="chk"><input type="checkbox" name="acc"${r.acc ? ' checked' : ''}> Certification body is accredited (BoA / IAF member) checked</label>
        <label class="chk"><input type="checkbox" name="gap"${r.gap ? ' checked' : ''}> Validity gap noted (old certificate expired ${c.replaces ? esc(D().certificates.find((x) => x.id === c.replaces).expiry) : '—'})</label>
        ${e.checks ? `<span class="err" role="alert">${esc(e.checks)}</span>` : ''}</fieldset>
      <div class="form-grid">${field('rv', e, 'reason', 'Reject reason (required to reject)', r.reason, { options: [['', '— choose —']].concat(REJECT) })}${field('rv', e, 'comment', 'Comment to supplier', r.comment, { area: true })}</div>
      <div class="row-acts"><button type="button" class="btn" data-cert="rv-close">Close</button><button type="button" class="btn btn-d" data-cert="reject">Reject</button><button type="submit" class="btn btn-p">Approve & unblock</button></div>
      <p class="small muted">Approving sets the certificate Valid, records you as verifier and lifts the block on ${esc(v.id)} for the Material IDs it covers.</p></form>`);
  }
  function decide(root, approve) {
    const c = D().certificates.find((x) => x.id === st.review); const v = App.vendor(c.vendor);
    const r = Object.assign(st.rv, read(root, '#cert-rv')); const e = {};
    if (approve) {
      if (!r.no) e.no = 'Certificate number is required.'; if (!r.issuer) e.issuer = 'Certification body is required.';
      if (!validDate(r.expiry)) e.expiry = 'Use dd/mm/yyyy.'; else if (App.daysTo(r.expiry) <= 0) e.expiry = 'Expiry must be after today.';
      if (App.norm(r.holder) !== App.norm(v.name)) e.holder = `Holder must match the vendor master (${v.name}).`;
      if (!r.acc || !r.gap) e.checks = 'Tick both manual checks before approving.';
    } else if (!r.reason) e.reason = 'Choose a reason to reject.';
    st.rerr = e; if (Object.keys(e).length) { App.render(); const x = document.querySelector('#cert-rv [aria-invalid=true], #cert-rv .err'); x && (x.focus ? x.focus() : 0); x && x.scrollIntoView({ block: 'center' }); return; }
    if (!approve) { c.status = 'Rejected'; c.rejectReason = r.reason; st.review = null; st.rv = null; App.render(); App.toast(`${c.type} rejected · ${v.contact} notified`); return; }
    Object.assign(c, { no: r.no, issuer: r.issuer, expiry: r.expiry, status: 'Valid', verified: `${me()} · ${D().today}` });
    const old = c.replaces && D().certificates.find((x) => x.id === c.replaces); if (old) old.status = 'Superseded';
    const unblocked = [];
    c.mats.forEach((m) => { const mat = App.material(m); const link = mat && mat.vendors.find((x) => x[0] === v.id); if (link && link[1] === 'Blocked') { link[1] = v.status === 'Probation' ? 'Probation' : 'Approved'; link.length = 5; unblocked.push(m); } });
    v.riskReasons = v.riskReasons.filter((x) => !x.includes(c.type));
    D().notifications.unshift({ id: 'N-' + Date.now(), type: 'Certificate', text: `${c.type} of ${v.name} verified — ${unblocked.length ? 'unblocked for ' + unblocked.join(', ') : 'no block to lift'}`, doc: v.id, mats: c.mats, at: D().today + ' 10:30', read: true, action: 'Open', href: '#/certificates' });
    st.review = null; st.rv = null; App.render(); App.toast(`${c.type} approved${unblocked.length ? ' · ' + v.id + ' unblocked for ' + unblocked.join(', ') : ''}`);
  }

  /* ---------- Upload (F-36) ---------- */
  function upload() {
    const u = st.up; const e = st.uerr;
    return card('Upload certificate', `<form id="cert-up" novalidate class="stack"><div class="form-grid">
      ${field('cu', e, 'vendor', 'Holder (vendor)', u.vendor, { options: D().vendors.map((v) => [v.id, `${v.id} · ${App.vshort(v)}`]), req: true })}
      ${field('cu', e, 'type', 'Certificate type', u.type, { options: TYPES, req: true })}
      ${field('cu', e, 'no', 'Certificate number', u.no, { req: true })}
      ${field('cu', e, 'issuer', 'Certification body', u.issuer, { req: true })}
      ${field('cu', e, 'mat', 'Scope · Material ID', u.mat, { options: D().materials.filter((m) => m.status === 'Active').map((m) => [m.id, `${m.id} · ${m.name}`]), req: true })}
      ${field('cu', e, 'expiry', 'Expiry date', u.expiry, { req: true, ph: 'dd/mm/yyyy' })}
      ${field('cu', e, 'file', 'File', u.file, { req: true, ph: 'ISO9001_2026.pdf', hint: 'PDF · stored as v1' })}</div>
      <div class="row-acts"><button type="button" class="btn" data-cert="up-cancel">Cancel</button><button type="submit" class="btn btn-p">Upload for review</button></div></form>`);
  }

  /* ---------- Timeline (F-39) & block rule (F-38) ---------- */
  function timeline() {
    const rows = D().certificates.filter((c) => !['Superseded', 'Rejected', 'Pending review'].includes(c.status)).map((c) => ({ c, d: App.daysTo(c.expiry) })).filter((x) => x.d >= 0 && x.d <= 90).sort((a, b) => a.d - b.d);
    return card('Expiring in the next 90 days', rows.length ? `<div class="hbars">${rows.map(({ c, d }) => `<div class="hbar"><div class="hbar-l"><b>${esc(c.type)}</b> · <a href="#/vendors/${esc(c.vendor)}">${esc(App.vshort(App.vendor(c.vendor)))}</a> <span class="chips chips-inline">${c.mats.map(mid).join('')}</span></div>
        <div class="bar" role="img" aria-label="${d} days left"><span class="${d <= 30 ? 'warn' : ''}" style="width:${Math.max(3, (d / 90) * 100).toFixed(1)}%"></span></div><div class="hbar-v num ${d <= 30 ? 'tone-warning' : ''}">${d} d · ${esc(c.expiry)}</div></div>`).join('')}</div>
      <p class="small muted">Orange = 30 days or less. The vendor and the certificate owner are reminded at 60 and 30 days; on expiry the status becomes Expired.</p>` : '<div class="empty">Nothing expires in the next 90 days</div>');
  }
  function blockRule() {
    const B = blocks();
    return card('Block rule · expired mandatory certificates', `<p class="small mt-0">When a certificate that a Material ID requires expires, the vendor is blocked for that Material ID: no new POs or awards, its bid on that line is marked Non-compliant at opening, and open POs continue.</p>
      ${B.length ? table([
        { h: 'Vendor', r: (b) => `<a href="#/vendors/${esc(b.c.vendor)}">${esc(App.vshort(App.vendor(b.c.vendor)))}</a>`, w: 'minmax(110px,1fr)' }, { h: 'Material ID', r: (b) => mid(b.m), w: '120px' },
        { h: 'Reason', r: (b) => `${esc(b.c.type)} expired ${esc(b.c.expiry)}${D().certificates.some((x) => x.replaces === b.c.id && x.status === 'Pending review') ? `<div><button class="linkish small" data-cert="review" data-id="${esc(D().certificates.find((x) => x.replaces === b.c.id).id)}">Renewal pending review</button></div>` : ''}`, w: 'minmax(170px,1.6fr)' }
      ], B, { min: 420, label: 'Blocked vendor – Material ID pairs' }) : '<div class="alert alert-success">No vendor – Material ID pair is blocked.</div>'}`);
  }

  App.page('certificates', {
    title: 'Certificates', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p) {
      if (p.vendor && st.lastV !== p.vendor) { st.holder = p.vendor; st.lastV = p.vendor; }
      if (p.mat && st.lastM !== p.mat) { st.q = p.mat; st.lastM = p.mat; }
      if (p.id && st.lastId !== p.id) { st.lastId = p.id; const c = D().certificates.find((x) => x.id === p.id); if (c && c.status === 'Pending review') { st.review = c.id; st.rv = null; } else if (c) st.q = c.no; }
      const C = D().certificates; const n = (s) => C.filter((c) => statusOf(c) === s).length;
      return `<div class="page-h"><div><h1>Certificates</h1><div class="sub">Vendor certificates by Material ID · mandatory ones block the vendor – Material ID pair when they expire</div></div>
        <div class="acts"><button class="btn btn-p" data-cert="up">Upload certificate</button></div></div>
        <div class="grid-k">${kpi('Valid', num(D().certStats.valid), `${n('Valid')} in this sample`, 'success')}${kpi('Expiring ≤ 30 days', num(n('Expiring')), C.filter((c) => statusOf(c) === 'Expiring').map((c) => App.vshort(App.vendor(c.vendor))).join(', '), 'warning')}${kpi('Expired', num(n('Expired')), `${blocks().length} blocked pair${blocks().length === 1 ? '' : 's'}`, 'danger')}${kpi('Pending review', num(n('Pending review')), 'Supplier uploads')}</div>
        ${st.up ? upload() : ''}${st.review ? review() : ''}
        <div class="grid-2"><div class="stack">${register()}</div><div class="stack">${timeline()}${blockRule()}</div></div>`;
    },
    mount(root) {
      root.addEventListener('input', (e) => { if (e.target.dataset.cf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('cf-q'); i.focus(); i.setSelectionRange(pos, pos); } });
      root.addEventListener('change', (e) => { const k = e.target.dataset.cf; if (k && k !== 'q') { st[k] = k === 'mand' ? e.target.checked : e.target.value; App.render(); } });
      root.addEventListener('submit', (e) => {
        if (e.target.id === 'cert-rv') { e.preventDefault(); decide(root, true); }
        if (e.target.id === 'cert-up') {
          e.preventDefault(); const u = st.up = read(root, '#cert-up'); const er = {};
          if (!u.no) er.no = 'Certificate number is required.'; if (!u.issuer) er.issuer = 'Certification body is required.';
          if (!validDate(u.expiry)) er.expiry = 'Use dd/mm/yyyy.'; else if (App.daysTo(u.expiry) <= 0) er.expiry = 'This certificate has already expired.';
          if (!/\.pdf$/i.test(u.file)) er.file = 'Upload a PDF file.';
          if (D().certificates.some((c) => c.no.toLowerCase() === u.no.toLowerCase())) er.no = 'This certificate number is already registered.';
          st.uerr = er; if (Object.keys(er).length) { App.render(); const x = document.querySelector('#cert-up [aria-invalid=true]'); x && x.focus(); return; }
          const id = 'CERT-' + String(Math.max(...D().certificates.map((c) => +c.id.slice(5))) + 1).padStart(4, '0');
          D().certificates.push({ id, type: u.type, no: u.no, vendor: u.vendor, mats: [u.mat], issuer: u.issuer, issued: D().today, expiry: u.expiry, status: 'Pending review', uploaded: `${me()} · ${D().today}`, file: u.file });
          st.up = null; st.uerr = {}; App.render(); App.toast(`${id} uploaded · Pending review`);
        }
      });
      root.addEventListener('click', (e) => {
        const t = e.target.closest('[data-cert]'); if (!t) return; const a = t.dataset.cert;
        if (a === 'review') { st.review = t.dataset.id; st.rv = null; st.rerr = {}; App.render(); document.getElementById('rv-no').focus(); }
        else if (a === 'rv-close') { st.review = null; st.rv = null; st.rerr = {}; App.render(); }
        else if (a === 'reject') decide(root, false);
        else if (a === 'up') { st.up = { vendor: 'V-1001', type: 'ISO 9001', no: '', issuer: '', mat: 'CON-24015', expiry: '', file: '' }; st.uerr = {}; App.render(); document.getElementById('cu-vendor').focus(); }
        else if (a === 'up-cancel') { st.up = null; st.uerr = {}; App.render(); }
      });
    }
  });
})();
