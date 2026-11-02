/* Module 4 · Vendors — F-20 list & filters, F-21 risk (R-16), F-22 create/edit, F-23 MST check (R-04), F-24 bank change pending Finance (R-08),
   F-25 vendor – Material ID links, F-26 status & delete. Routes: #/vendors, #/vendors/<id> (or ?id=) */
(function () {
  const { esc, num, pct, vnd, mid, pill, table, kpi, card } = App;
  const D = () => window.DATA;
  const st = { q: '', cat: 'all', status: 'all', risk: 'all', grade: 'all', form: null, errs: {}, mst: null, dup: null, confirmDel: null, rejecting: false, reject: '' };
  const CATS = ['Construction', 'Equipment', 'Services', 'Logistics', 'Equipment / Services'];
  const TERMS = ['30 days', '45 days', '30 days · advance 30% / 70%', '60 days'];
  const STATUSES = ['Preferred', 'Approved', 'Probation', 'Blocked', 'Pending approval'];
  const sTone = (s) => ({ Preferred: 'success', Approved: 'info', Probation: 'warning', Blocked: 'danger' }[s] || 'neutral');
  const rTone = (r) => ({ Low: 'success', Medium: 'warning', High: 'danger' }[r] || 'neutral');
  const normMst = (s) => String(s || '').replace(/\s+/g, '');
  const fmtMst = (s) => { const n = normMst(s); return /^\d{10}/.test(n) ? `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7, 10)}${n.slice(10)}` : n; };
  const me = () => (App.state.user && App.state.user.name) || 'Nguyễn Minh Anh';
  const OPEN_PO = (d) => d.type === 'PO' && !/Closed|Delivered/.test(d.status);
  const openPos = (id) => D().docs.filter((d) => d.vendor === id && OPEN_PO(d));
  const links = (id) => D().materials.filter((m) => m.vendors.some((v) => v[0] === id)).map((m) => ({ m, l: m.vendors.find((v) => v[0] === id) }));

  /* ---------- MST (F-23 / R-04) ---------- */
  function mstFormat(mst, parent) {
    const n = normMst(mst);
    if (!n) return 'MST is required.';
    if (!/^(\d{10}|\d{10}-\d{3}|\d{12})$/.test(n)) return 'MST format: 10 digits (enterprise), 10 digits + "-" + 3 digits for a branch (e.g. 0312456789-001), or a 12-digit personal ID.';
    if (/-/.test(n)) {
      const p = App.vendor(parent);
      if (!p) return 'A branch MST must be added under its parent vendor. Choose the parent vendor.';
      if (normMst(p.mst) !== n.slice(0, 10)) return `The first 10 digits must match the parent vendor's MST (${normMst(p.mst)}).`;
    }
    return '';
  }
  function dupOf(mst, selfId) { const n = normMst(mst); return D().vendors.find((v) => v.id !== selfId && normMst(v.mst) === n); }
  function gdtLookup(mst, name) {
    const n = normMst(mst); const known = D().vendors.find((v) => normMst(v.mst) === n);
    if (n === '0109999999') return { mst: n, regName: 'CÔNG TY TNHH THƯƠNG MẠI HẢI ĐĂNG', address: 'Q. Cầu Giấy, Hà Nội', status: 'Ngừng hoạt động', at: D().today };
    return { mst: n, regName: (known ? known.name : name || 'Chưa khai báo tên').toUpperCase(), address: known ? known.address : 'Theo đăng ký thuế', status: 'Đang hoạt động', at: D().today };
  }
  function mstBox(f) {
    const r = st.mst;
    if (!r || r.mst !== normMst(f.mst)) return '<div id="vf-mst-box"><p class="small muted">Run “Check MST” to look up the registered name, address and tax status. A vendor cannot be approved for any Material ID until its MST is verified.</p></div>';
    const mismatch = f.name && App.norm(r.regName) !== App.norm(f.name);
    const ok = r.status === 'Đang hoạt động';
    return `<div id="vf-mst-box" class="stack"><div class="alert ${ok ? 'alert-success' : 'alert-danger'}" role="status"><b>Tax authority result · ${esc(r.at)}</b><br>Registered name: ${esc(r.regName)}<br>Address: ${esc(r.address)}<br>Tax status: <b>${esc(r.status)}</b></div>
      ${mismatch ? '<div class="alert alert-warning" role="status">Name mismatch: the company name differs from the registered name. Check before saving.</div>' : ''}</div>`;
  }

  /* ---------- Form (F-22) ---------- */
  const blank = () => ({ name: '', mst: '', parent: '', cat: 'Construction', terms: '30 days', contact: '', phone: '', email: '', city: '' });
  const fromVendor = (v) => ({ name: v.name, mst: normMst(v.mst), parent: v.parent || '', cat: v.cat, terms: v.terms || '30 days', contact: v.contact, phone: v.phone || '', email: v.email, city: v.city });
  function readForm(root) {
    const g = (n) => { const el = root.querySelector(`#vf-${n}`); return el ? el.value.trim() : ''; };
    return { name: g('name'), mst: g('mst'), parent: g('parent'), cat: g('cat'), terms: g('terms'), contact: g('contact'), phone: g('phone'), email: g('email'), city: g('city') };
  }
  function validate(f, selfId) {
    const e = {};
    if (!f.name) e.name = 'Company name is required.';
    const m = mstFormat(f.mst, f.parent); if (m) e.mst = m;
    if (!f.contact) e.contact = 'Contact person is required.';
    if (!/^[a-z0-9._%+-]+@gmail\.com$/i.test(f.email)) e.email = 'Enter the vendor’s Gmail address (used for portal sign-in and tender invitations).';
    else if (D().vendors.some((v) => v.id !== selfId && v.email.toLowerCase() === f.email.toLowerCase())) e.email = 'This Gmail is already used by another vendor.';
    if (f.phone && !/^[0-9 +.]{9,15}$/.test(f.phone)) e.phone = 'Phone: 9–15 digits.';
    return e;
  }
  function field(n, label, f, o = {}) {
    const err = st.errs[n]; const ids = [o.hint ? `vf-${n}-h` : '', err ? `vf-${n}-e` : ''].filter(Boolean).join(' ');
    const attrs = `id="vf-${n}" name="${n}"${ids ? ` aria-describedby="${ids}"` : ''}${err ? ' aria-invalid="true"' : ''}`;
    const input = o.options ? `<select ${attrs}>${o.options.map((x) => { const [v, l] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(v)}"${String(f[n]) === String(v) ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`
      : `<input ${attrs} value="${esc(f[n])}"${o.mono ? ' class="mono"' : ''}${o.type ? ` type="${o.type}"` : ''}${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}>`;
    return `<div class="field"><label for="vf-${n}">${esc(label)}${o.req ? ' *' : ''}</label>${input}${o.hint ? `<span class="hint" id="vf-${n}-h">${esc(o.hint)}</span>` : ''}${err ? `<span class="err" id="vf-${n}-e" role="alert">${esc(err)}</span>` : ''}</div>`;
  }
  function formCard() {
    const F = st.form; const f = F.f; const v = F.id && App.vendor(F.id);
    return card(F.id ? `Edit vendor · ${F.id}` : 'New vendor', `<form id="vf" novalidate class="stack">
      ${st.dup ? `<div class="alert alert-danger" role="alert">MST ${esc(normMst(f.mst))} already belongs to ${esc(st.dup.id)} ${esc(App.vshort(st.dup))} — Save was blocked.</div>` : ''}
      <div class="form-grid">
        ${field('name', 'Company name', f, { req: true })}
        ${field('mst', 'Tax code (MST)', f, { req: true, mono: true, ph: '0312456789', hint: '10 digits · 10 + 3 for a branch (0312456789-001, under its parent) · 12-digit personal ID for individuals / household businesses' })}
        ${field('parent', 'Parent vendor (branch only)', f, { options: [['', '— none —']].concat(D().vendors.filter((x) => !F.id || x.id !== F.id).map((x) => [x.id, `${x.id} · ${App.vshort(x)}`])) })}
        ${field('cat', 'Category', f, { options: CATS })}
        ${field('terms', 'Payment terms', f, { options: TERMS })}
        ${field('contact', 'Contact person', f, { req: true })}
        ${field('phone', 'Phone', f, { type: 'tel' })}
        ${field('email', 'Portal Gmail', f, { req: true, type: 'email', hint: 'Used for supplier portal sign-in and tender invitations' })}
        ${field('city', 'City / province', f)}
      </div>
      <div class="row-acts"><button type="button" class="btn" data-v="cancel">Cancel</button><button type="button" class="btn" data-v="check-mst">Check MST</button><button type="submit" class="btn btn-p">${F.id ? 'Save changes' : 'Create vendor'}</button></div>
      ${mstBox(f)}
      <p class="small muted">${v ? `Status stays ${esc(v.status)}.` : 'New vendors start as Pending approval: Procurement Lead → Finance (SoD: creator ≠ approver).'} Bank accounts are changed from the supplier portal and verified by Finance.</p></form>`);
  }
  function save(root) {
    const F = st.form; const f = readForm(root); F.f = f;
    st.errs = validate(f, F.id); st.dup = null;
    if (!st.errs.mst) { const d = dupOf(f.mst, F.id); if (d) st.dup = d; }
    if (Object.keys(st.errs).length || st.dup) { App.render(); const er = document.querySelector('#vf [role=alert]'); er && er.scrollIntoView({ block: 'center' }); return; }
    const verified = !!(st.mst && st.mst.mst === normMst(f.mst) && st.mst.status === 'Đang hoạt động');
    if (F.id) {
      const v = App.vendor(F.id); const mstChanged = normMst(v.mst) !== normMst(f.mst);
      Object.assign(v, { name: f.name, mst: fmtMst(f.mst), parent: f.parent || null, cat: f.cat, terms: f.terms, contact: f.contact, phone: f.phone, email: f.email, city: f.city });
      if (mstChanged || verified) Object.assign(v, { mstVerified: verified, mstChecked: verified ? D().today : v.mstChecked, taxStatus: verified ? st.mst.status : 'Not checked' });
      st.form = null; st.mst = null; App.render(); App.toast(`${v.id} saved${mstChanged && !verified ? ' · MST changed, re-check required' : ''}`);
    } else {
      const id = 'V-' + (Math.max(...D().vendors.map((x) => +x.id.slice(2))) + 1);
      D().vendors.push({ id, name: f.name, cat: f.cat, status: 'Pending approval', score: null, grade: '—', otif: null, email: f.email, contact: f.contact, mst: fmtMst(f.mst), parent: f.parent || null, risk: '—', city: f.city, terms: f.terms, phone: f.phone,
        address: verified ? st.mst.address : '—', since: D().today, taxStatus: verified ? st.mst.status : 'Not checked', mstChecked: verified ? D().today : '—', mstVerified: verified, riskChecked: '—', riskReasons: ['New vendor · not yet assessed'], bank: { now: '—' }, proposed: [] });
      st.form = null; st.mst = null; location.hash = '#/vendors/' + id; App.toast(`${id} created · Pending approval (Procurement Lead → Finance)`);
    }
  }

  /* ---------- List (F-20, F-21) ---------- */
  function list() {
    const q = st.q.trim();
    const rows = D().vendors.filter((v) => (!q || [v.id, v.name, v.mst, normMst(v.mst), v.email, v.contact, ...links(v.id).map((x) => x.m.id)].some((x) => App.matches(x, q)))
      && (st.cat === 'all' || v.cat.includes(st.cat)) && (st.status === 'all' || v.status === st.status) && (st.risk === 'all' || v.risk === st.risk) && (st.grade === 'all' || v.grade === st.grade));
    const sel = (k, label, opts) => `<label class="sr" for="vl-${k}">${label}</label><select class="inp" id="vl-${k}" data-vf="${k}"><option value="all">${label}: all</option>${opts.map((o) => `<option${st[k] === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    return card('Vendors', `<div class="filters">
        <label class="sr" for="vl-q">Search vendors</label><input class="inp grow" id="vl-q" data-vf="q" type="search" value="${esc(st.q)}" placeholder="Search name, MST, Gmail or Material ID">
        ${sel('cat', 'Category', ['Construction', 'Equipment', 'Services', 'Logistics'])}${sel('status', 'Status', STATUSES)}${sel('risk', 'Risk', ['Low', 'Medium', 'High'])}${sel('grade', 'Grade', ['A', 'B', 'C', 'D'])}</div>
      ${table([
        { h: 'Vendor', r: (v) => `<a href="#/vendors/${esc(v.id)}"><span class="mono small">${esc(v.id)}</span> ${esc(v.name)}</a><div class="small muted">${esc(v.email)}</div>`, w: 'minmax(240px,2.4fr)' },
        { h: 'Category', r: (v) => esc(v.cat) + `<div class="small muted">${esc(v.city)}</div>`, w: 'minmax(120px,1fr)' },
        { h: 'MST', r: (v) => `<span class="mono small">${esc(v.mst)}</span>${v.mstVerified ? '' : '<div class="small tone-warning">Not verified</div>'}`, w: '130px' },
        { h: 'Material IDs supplied', r: (v) => { const L = links(v.id); return L.length ? `<div class="chips">${L.slice(0, 3).map((x) => mid(x.m.id)).join('')}${L.length > 3 ? `<span class="small muted">+${L.length - 3}</span>` : ''}</div>` : '<span class="muted">—</span>'; }, w: 'minmax(170px,1.5fr)' },
        { h: 'Score', r: (v) => (v.score ? `${num(v.score, 2)} · ${esc(v.grade)}` : '—'), cls: 'num', w: '90px' },
        { h: 'OTIF', r: (v) => (v.otif != null ? pct(v.otif) : '—'), cls: 'num', w: '80px' },
        { h: 'Risk', r: (v) => pill(v.risk === '—' ? 'Pending' : v.risk, rTone(v.risk)) + (v.riskReasons.length && v.risk !== 'Low' ? `<div class="small muted">${esc(v.riskReasons[0])}${v.riskReasons.length > 1 ? ` +${v.riskReasons.length - 1}` : ''}</div>` : ''), w: 'minmax(150px,1.3fr)' },
        { h: 'Status', r: (v) => pill(v.status, sTone(v.status)), w: '140px' },
        { h: 'Actions', r: (v) => { const o = openPos(v.id); return `<div class="row-acts start"><button class="btn btn-sm" data-v="edit" data-id="${esc(v.id)}" aria-label="Edit ${esc(v.id)}">Edit</button><button class="btn btn-sm btn-d" data-v="delete" data-id="${esc(v.id)}" aria-label="Delete ${esc(v.id)}"${o.length ? ` disabled title="Open PO ${esc(o[0].id)} — set to Blocked instead"` : ''}>Delete</button></div>`; }, w: '150px' }
      ], rows, { min: 1360, empty: 'No vendors match these filters', label: 'Vendors' })}
      <p class="muted small">Showing ${rows.length} of 142 vendors (sample loaded) · risk last checked ${esc(D().vendors[0].riskChecked)}</p>`,
    '<button class="btn btn-sm" data-v="recheck-all">Re-check risk</button><button class="btn btn-sm" data-act="toast" data-msg="Import Excel: template Vendor_import_v2.xlsx · MST is validated per row">Import Excel</button>');
  }
  function delConfirm() {
    const v = st.confirmDel && App.vendor(st.confirmDel); if (!v) return '';
    return `<div class="alert alert-danger stack" role="alert"><div>Delete <b>${esc(v.id)} ${esc(v.name)}</b>? This removes the vendor and its Material ID links. Vendors with history are better set to Blocked.</div>
      <div class="row-acts start"><button class="btn btn-sm" data-v="del-cancel">Cancel</button><button class="btn btn-sm btn-d" data-v="del-ok" data-id="${esc(v.id)}">Delete vendor</button></div></div>`;
  }

  /* ---------- Profile (F-21..F-26) ---------- */
  function profile(v) {
    const L = links(v.id); const pos = openPos(v.id); const cts = D().contracts.filter((c) => c.vendor === v.id);
    const certs = D().certificates.filter((c) => c.vendor === v.id); const sc = D().scorecards.find((s) => s.vendor === v.id);
    const head = `<div class="page-h"><div><div class="crumbs small muted"><a href="#/vendors">Vendors</a> / ${esc(v.id)}</div><h1>${esc(v.name)}</h1>
        <div class="sub"><span class="mono">${esc(v.id)}</span> · ${esc(v.cat)} · ${esc(v.city)} · ${pill(v.status, sTone(v.status))} · Risk ${pill(v.risk === '—' ? 'Pending' : v.risk, rTone(v.risk))}</div></div>
      <div class="acts"><a class="btn" href="#/evaluation?vendor=${esc(v.id)}">Scorecard</a><button class="btn" data-v="check-mst-p" data-id="${esc(v.id)}">Re-check MST</button><button class="btn btn-p" data-v="edit" data-id="${esc(v.id)}">Edit vendor</button></div></div>`;
    const kpis = `<div class="grid-k">${kpi('Score', v.score ? `${num(v.score, 2)} · ${esc(v.grade)}` : '—', sc ? `${esc(sc.period)} · ${esc(sc.status)}` : 'Not evaluated')}${kpi('OTIF (accepted qty)', v.otif != null ? pct(v.otif) : '—', 'Target 95%', v.otif != null ? (v.otif >= 95 ? 'success' : v.otif < 85 ? 'danger' : 'warning') : '')}${kpi('Material IDs', String(L.length), `${v.proposed.length} proposed`)}${kpi('Open POs', String(pos.length), pos.length ? 'Delete is blocked' : 'None', pos.length ? 'warning' : '')}</div>`;
    const overview = card('Company profile', `<dl class="dl">
      <dt>MST</dt><dd><span class="mono">${esc(v.mst)}</span> ${v.mstVerified ? pill('Verified', 'success') : pill('Not verified', 'warning')}</dd>
      ${v.parent ? `<dt>Parent vendor</dt><dd><a href="#/vendors/${esc(v.parent)}">${esc(v.parent)}</a></dd>` : ''}
      <dt>Tax status</dt><dd>${esc(v.taxStatus)} <span class="small muted">· checked ${esc(v.mstChecked)}</span></dd>
      <dt>Registered address</dt><dd>${esc(v.address || '—')}</dd><dt>Payment terms</dt><dd>${esc(v.terms || '—')}</dd>
      <dt>Contact</dt><dd>${esc(v.contact)}${v.phone ? ` · ${esc(v.phone)}` : ''}</dd><dt>Portal Gmail</dt><dd>${esc(v.email)}</dd><dt>Vendor since</dt><dd>${esc(v.since || '—')}</dd></dl>`);
    const risk = card('Supplier risk', `<p class="mt-0">${pill(v.risk === '—' ? 'Pending' : v.risk, rTone(v.risk))} <span class="small muted">Last checked ${esc(v.riskChecked)}</span></p>
      ${v.riskReasons.length ? `<ul class="plain small">${v.riskReasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : '<p class="small muted">No risk factors found.</p>'}
      <p class="small muted">Rules: tax status not “Đang hoạt động”, GDT high-risk list, mandatory certificate expired, OTIF &lt; 85%, open NCRs, single source per Material ID. A High-risk vendor triggers a warning at PO creation.</p>`, `<button class="btn btn-sm" data-v="recheck" data-id="${esc(v.id)}">Re-check risk</button>`);
    const b = v.bank || {};
    const bank = card('Bank account', `<dl class="dl"><dt>In use</dt><dd class="mono">${esc(b.now || '—')}</dd></dl>
      ${b.pending ? `<div class="alert alert-warning mt" role="status"><b>Pending Finance verification</b> · new account <span class="mono">${esc(b.pending)}</span> requested ${esc(b.requested)} by ${esc(b.by)}. The current account stays in use until Finance verifies it by call-back to the registered phone. SoD: the vendor-master editor cannot approve payments.</div>` : '<p class="small muted">No pending change.</p>'}`,
    b.pending ? '<a class="btn btn-sm" href="#/approvals">Open in My approvals</a>' : '');
    const usable = D().materials.filter((m) => !L.some((x) => x.m.id === m.id) && !v.proposed.includes(m.id) && m.status !== 'Blocked');
    const mats = card(`Material IDs supplied (${L.length})`, table([
      { h: 'Material ID', r: (x) => mid(x.m.id), w: '120px' }, { h: 'Description', r: (x) => esc(x.m.name), w: 'minmax(180px,2fr)' },
      { h: 'Link status', r: (x) => pill(x.l[1], sTone(x.l[1])) + (x.l[5] ? `<div class="small tone-danger">${esc(x.l[5])}</div>` : ''), w: 'minmax(130px,1.2fr)' },
      { h: 'Last price', r: (x) => (x.l[2] ? vnd(x.l[2]) : '—'), cls: 'num', w: '140px' }, { h: 'Lead time', r: (x) => (x.l[3] ? x.l[3] + ' days' : '—'), cls: 'num', w: '90px' },
      { h: '', r: (x) => `<button class="btn btn-sm" data-v="unlink" data-id="${esc(v.id)}" data-m="${esc(x.m.id)}" aria-label="Remove ${esc(x.m.id)} from ${esc(v.id)}">Remove</button>`, w: '100px' }
    ], L, { min: 720, empty: 'No approved Material IDs yet', label: 'Material IDs supplied' })
      + (v.proposed.length ? `<div class="stack mt"><b class="small">Proposed links · approved per Material ID</b>${v.proposed.map((m) => `<div class="row-acts between"><span>${mid(m)} ${esc((App.material(m) || {}).name || '')} ${pill('Proposed', 'neutral')}</span><span><button class="btn btn-sm" data-v="reject-link" data-id="${esc(v.id)}" data-m="${esc(m)}">Reject</button> <button class="btn btn-sm" data-v="approve-link" data-id="${esc(v.id)}" data-m="${esc(m)}">Approve link</button></span></div>`).join('')}</div>` : '')
      + `<div class="filters mt"><label class="sr" for="vp-add">Material ID to add</label><select class="inp grow" id="vp-add">${usable.map((m) => `<option value="${esc(m.id)}">${esc(m.id)} · ${esc(m.name)}${m.status !== 'Active' ? ' (' + esc(m.status) + ')' : ''}</option>`).join('')}</select><button class="btn btn-sm" data-v="propose" data-id="${esc(v.id)}">Add Material ID</button></div>
      ${v.mstVerified ? '' : '<p class="small tone-warning">MST not verified — links stay Proposed until the MST check passes.</p>'}`);
    const ob = v.onboarding ? card('Onboarding review checklist', `<ul class="plain">${v.onboarding.map(([k, s], i) => `<li class="row-acts between"><span>${esc(k)}</span><span>${pill(s, s === 'OK' ? 'success' : 'danger')}${s !== 'OK' ? ` <button class="btn btn-sm" data-v="ob-ok" data-id="${esc(v.id)}" data-i="${i}">Mark OK</button>` : ''}</span></li>`).join('')}</ul>
      <p class="small muted">${v.onboarding.filter((x) => x[1] === 'OK').length} of ${v.onboarding.length} items OK. Approve needs every item OK.</p>
      ${st.rejecting ? `<div class="field"><label for="vp-rej">Reason for rejection *</label><textarea id="vp-rej" aria-describedby="vp-rej-e">${esc(st.reject)}</textarea>${st.errs.reject ? `<span class="err" id="vp-rej-e" role="alert">${esc(st.errs.reject)}</span>` : ''}</div>` : ''}
      <div class="row-acts"><button class="btn btn-sm btn-d" data-v="ob-reject" data-id="${esc(v.id)}">${st.rejecting ? 'Confirm reject' : 'Reject'}</button><button class="btn btn-sm" data-v="ob-approve" data-id="${esc(v.id)}" data-s="Probation"${v.onboarding.some((x) => x[1] !== 'OK') ? ' disabled' : ''}>Approve → Probation</button><button class="btn btn-sm btn-p" data-v="ob-approve" data-id="${esc(v.id)}" data-s="Approved"${v.onboarding.some((x) => x[1] !== 'OK') ? ' disabled' : ''}>Approve → Active</button></div>`) : '';
    const status = card('Status & deletion', `<div class="seg" role="group" aria-label="Vendor status">${['Preferred', 'Approved', 'Probation', 'Blocked'].map((s) => `<button data-v="status" data-id="${esc(v.id)}" data-s="${s}" aria-pressed="${v.status === s}">${s === 'Approved' ? 'Active' : s}</button>`).join('')}</div>
      <p class="small muted">Active = Approved. Blocked vendors cannot be invited or receive new POs; open POs continue.</p>
      ${pos.length ? `<div class="alert alert-warning" role="status">Delete is blocked: open PO ${pos.map((p) => `<span class="mono">${esc(p.id)}</span>`).join(', ')}. Set the vendor to Blocked instead.</div>` : ''}
      ${delConfirm()}
      <div class="row-acts mt"><button class="btn btn-sm btn-d" data-v="delete" data-id="${esc(v.id)}"${pos.length ? ' disabled' : ''}>Delete vendor</button></div>`);
    const docs = card('Open POs & contracts', table([
      { h: 'Number', r: (d) => (d.type === 'CT' ? `<a class="mono" href="#/contracts/${esc(d.id)}">${esc(d.id)}</a>` : `<a class="mono" href="#/po">${esc(d.id)}</a>`), w: '140px' }, { h: 'Title', r: (d) => esc(d.title) + (d.note ? `<div class="small muted">${esc(d.note)}</div>` : ''), w: 'minmax(200px,2fr)' },
      { h: 'Material IDs', r: (d) => `<div class="chips">${(d.mats || []).map(mid).join('')}</div>`, w: 'minmax(130px,1fr)' }, { h: 'Status', r: (d) => pill(d.status, /overdue|not confirmed|Expir/i.test(d.status + (d.note || '')) ? 'warning' : 'neutral'), w: 'minmax(130px,1fr)' }
    ], [...pos, ...D().docs.filter((d) => d.type === 'CT' && cts.some((c) => c.id === d.id))], { min: 700, empty: 'No open POs or contracts', label: 'Open POs and contracts' }));
    const certCard = card(`Certificates (${certs.length})`, certs.length ? `<ul class="plain">${certs.map((c) => `<li><b>${esc(c.type)}</b> <span class="small muted">· ${esc(c.no)} · expires ${esc(c.expiry)}</span> <span class="chips">${c.mats.map(mid).join('')}</span></li>`).join('')}</ul>` : '<div class="empty">No certificates on file</div>', `<a class="btn btn-sm" href="#/certificates?vendor=${esc(v.id)}">Certificate register</a>`);
    return `${head}${st.form ? formCard() : ''}${kpis}<div class="grid-2"><div class="stack">${ob}${mats}${docs}${certCard}</div><div class="stack">${overview}${risk}${bank}${status}</div></div>`;
  }

  App.page('vendors', {
    title: 'Vendors', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, sub) {
      const id = sub || p.id;
      if (id) { const v = App.vendor(id); return v ? profile(v) : App.errorState(`Vendor ${id} was not found.`, ' <a href="#/vendors">Back to vendors</a>'); }
      const V = D().vendors;
      return `<div class="page-h"><div><h1>Vendors</h1><div class="sub">Vendor master · MST-verified, risk-rated and linked to the Material IDs they supply</div></div>
        <div class="acts"><button class="btn btn-p" data-v="new">New vendor</button></div></div>
        <div class="grid-k">${kpi('Vendors', '142', 'All categories')}${kpi('Active', '118', `${V.filter((v) => /Preferred|Approved/.test(v.status)).length} in this sample`, 'success')}${kpi('Pending approval', '6', `${V.filter((v) => v.status === 'Pending approval').length} in this sample`, 'warning')}${kpi('High risk', String(V.filter((v) => v.risk === 'High').length), V.filter((v) => v.risk === 'High').map((v) => App.vshort(v)).join(', ') || 'None', 'danger')}</div>
        ${st.form ? formCard() : ''}${delConfirm()}${list()}`;
    },
    mount(root) {
      root.addEventListener('input', (e) => {
        if (e.target.dataset.vf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('vl-q'); i.focus(); i.setSelectionRange(pos, pos); }
        if (e.target.id === 'vp-rej') st.reject = e.target.value;
      });
      root.addEventListener('change', (e) => {
        const k = e.target.dataset.vf; if (k && k !== 'q') { st[k] = e.target.value; App.render(); return; }
        if (e.target.closest('#vf') && ['mst', 'name'].includes(e.target.name)) { st.form.f = readForm(root); const b = root.querySelector('#vf-mst-box'); if (b) b.outerHTML = mstBox(st.form.f); }
      });
      root.addEventListener('submit', (e) => { if (e.target.id === 'vf') { e.preventDefault(); save(root); } });
      root.addEventListener('click', (e) => {
        const t = e.target.closest('[data-v]'); if (!t) return;
        const a = t.dataset.v; const v = t.dataset.id && App.vendor(t.dataset.id);
        if (a === 'new') { st.form = { id: null, f: blank() }; st.errs = {}; st.mst = null; st.dup = null; App.render(); document.getElementById('vf-name').focus(); }
        else if (a === 'edit') { st.form = { id: v.id, f: fromVendor(v) }; st.errs = {}; st.dup = null; st.mst = null; App.render(); document.getElementById('vf').scrollIntoView({ block: 'start' }); document.getElementById('vf-name').focus({ preventScroll: true }); }
        else if (a === 'cancel') { st.form = null; st.errs = {}; st.dup = null; st.mst = null; App.render(); }
        else if (a === 'check-mst') {
          const f = readForm(root); st.form.f = f; const err = mstFormat(f.mst, f.parent); st.errs = err ? { mst: err } : {};
          if (!err) { st.mst = gdtLookup(f.mst, f.name); const d = dupOf(f.mst, st.form.id); st.dup = d || null; }
          App.render(); App.toast(err ? 'MST format is not valid' : `MST ${normMst(f.mst)} · ${st.mst.status}`);
        }
        else if (a === 'check-mst-p') { const r = gdtLookup(v.mst, v.name); Object.assign(v, { taxStatus: r.status, mstChecked: r.at, mstVerified: r.status === 'Đang hoạt động' }); App.render(); App.toast(`MST ${normMst(v.mst)} · ${r.status} · registered name matches`); }
        else if (a === 'recheck' || a === 'recheck-all') { (v ? [v] : D().vendors).forEach((x) => { if (x.riskChecked !== '—' || v) x.riskChecked = D().today + ' 10:30'; }); App.render(); App.toast(v ? `Risk re-checked · ${v.risk === '—' ? 'Pending' : v.risk} (no change)` : `Risk re-checked for ${D().vendors.length} vendors · no level changed`); }
        else if (a === 'delete') { if (t.disabled) return; st.confirmDel = v.id; App.render(); }
        else if (a === 'del-cancel') { st.confirmDel = null; App.render(); }
        else if (a === 'del-ok') {
          if (openPos(v.id).length) { App.toast('Delete blocked: open PO'); return; }
          D().vendors.splice(D().vendors.indexOf(v), 1); D().materials.forEach((m) => { m.vendors = m.vendors.filter((x) => x[0] !== v.id); });
          st.confirmDel = null; if (location.hash.includes(v.id)) location.hash = '#/vendors'; else App.render(); App.toast(`${v.id} deleted`);
        }
        else if (a === 'status') { v.status = t.dataset.s; D().materials.forEach((m) => m.vendors.forEach((x) => { if (x[0] === v.id && !x[5] && x[1] !== 'Preferred') x[1] = v.status === 'Preferred' ? 'Approved' : v.status; })); App.render(); App.toast(`${v.id} set to ${v.status === 'Approved' ? 'Active' : v.status}`); }
        else if (a === 'propose') { const m = root.querySelector('#vp-add').value; if (!m) return; v.proposed.push(m); App.render(); App.toast(`${m} proposed for ${v.id} · approve per Material ID`); }
        else if (a === 'approve-link') {
          if (!v.mstVerified) { App.toast('MST not verified — run Re-check MST first'); return; }
          if (v.status === 'Pending approval') { App.toast('Approve the vendor (onboarding review) before approving Material ID links'); return; }
          const m = App.material(t.dataset.m); m.vendors.push([v.id, 'Approved', null, m.lead, v.otif || 0]); v.proposed = v.proposed.filter((x) => x !== m.id); App.render(); App.toast(`${m.id} approved for ${v.id}`);
        }
        else if (a === 'reject-link') { v.proposed = v.proposed.filter((x) => x !== t.dataset.m); App.render(); App.toast(`${t.dataset.m} link rejected`); }
        else if (a === 'unlink') { const m = App.material(t.dataset.m); m.vendors = m.vendors.filter((x) => x[0] !== v.id); App.render(); App.toast(`${m.id} removed from ${v.id}`); }
        else if (a === 'ob-ok') { v.onboarding[+t.dataset.i][1] = 'OK'; App.render(); }
        else if (a === 'ob-approve') { v.status = t.dataset.s; v.risk = 'Low'; v.riskReasons = []; v.riskChecked = D().today + ' 10:30'; st.rejecting = false; App.render(); App.toast(`${v.id} approved → ${v.status === 'Approved' ? 'Active' : v.status}`); }
        else if (a === 'ob-reject') {
          if (!st.rejecting) { st.rejecting = true; st.errs = {}; App.render(); document.getElementById('vp-rej').focus(); return; }
          if (st.reject.trim().length < 10) { st.errs = { reject: 'Give a reason of at least 10 characters; it is sent to the supplier.' }; App.render(); document.getElementById('vp-rej').focus(); return; }
          v.status = 'Blocked'; v.riskReasons = ['Onboarding rejected: ' + st.reject.trim()]; st.rejecting = false; st.reject = ''; st.errs = {}; App.render(); App.toast(`${v.id} onboarding rejected · supplier notified`);
        }
      });
    }
  });
})();
