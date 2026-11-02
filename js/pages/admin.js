/* Module 16 · Admin console — F-99 users & roles (allowlist, consent, export / delete personal data, R-25), F-100 access policy, F-101 privacy notice versions,
   F-102 approval matrix + delegation policy + capex rule (R-06), F-103 SoD rules + override log (R-18), F-104 3-way match tolerances (R-02),
   F-105 notification rules + daily digest (R-15), F-106 categories, templates (evaluation.js) and numbering rules, F-107 integrations & code mappings (R-20), F-108 audit log.
   Every change writes the audit log (App.src.audit) and edits the shared DATA used by the procurement screens.
   Routes: #/admin/users, /access, /matrix, /categories, /numbering, /tolerances, /integrations, /rules, /sod, /audit */
(function () {
  const { esc, num, vnd, pill, table, kpi, card } = App;
  const S = App.src;
  const D = () => window.DATA;
  const st = { cur: null, q: '', role: 'all', status: 'all', two: 'all', inv: null, ierr: {}, edit: null, del: null, derr: '', pol: null, perr: {}, add: '', aerr: '', pub: null, puerr: '', mx: null, mxErr: {}, dl: null, dlErr: {}, cat: null, tol: null, tErr: {}, map: {}, nr: null, nrErr: '', sod: null, sErr: {}, au: { user: 'all', type: 'all', q: '', n: 10 } };
  const head = (title, sub, acts = '') => `<div class="page-h"><div><h1>${esc(App.t(title))}</h1><div class="sub">${sub}</div></div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
  const staff = () => D().users.filter((u) => !u.vendor && u.roles.includes('procurement'));
  const tone = (s) => (/Active|OK|Done/.test(s) ? 'success' : /Invited|Warning|Pending/.test(s) ? 'warning' : /Suspended|Failed|error|Deleted/.test(s) ? 'danger' : 'neutral');
  const isGmailOk = (e) => /^[a-z0-9._%+-]+@gmail\.com$/i.test(e) || (D().access.domain && new RegExp('@' + D().access.domain.replace(/\./g, '\\.') + '$', 'i').test(e));
  const focus = (sel) => { const x = document.querySelector(sel); if (x) { x.scrollIntoView({ block: 'center' }); x.focus({ preventScroll: true }); } };

  /* ---------- F-99 users & roles ---------- */
  function users() {
    const U = D().users; const X = D().userStats; const q = st.q.trim();
    const rows = U.filter((u) => (st.role === 'all' || u.roles.includes(st.role)) && (st.status === 'all' || u.status === st.status) && (st.two === 'all' || (st.two === 'on') === !!u.twoStep) && (!q || App.matches(`${u.name} ${u.email} ${u.title}`, q)));
    const f = st.inv; const e = st.ierr;
    const inviteForm = f ? `<form id="ad-inv" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">Invite user</h3><div class="form-grid">${S.field('adi', e, 'email', 'Gmail address', f.email, { req: true, ph: 'name@gmail.com', hint: 'Gmail or the Workspace domain; added to the allowlist' })}${S.field('adi', e, 'name', 'Full name', f.name, { req: true })}
      ${S.field('adi', e, 'role', 'Role', f.role, { options: [['procurement', 'Procurement'], ['admin', 'Admin'], ['supplier', 'Supplier']] })}${f.role === 'supplier' ? S.field('adi', e, 'vendor', 'Vendor', f.vendor, { options: D().vendors.map((v) => [v.id, `${v.id} · ${App.vshort(v)}`]) }) : S.field('adi', e, 'title', 'Job title', f.title, {})}</div>
      <p class="small muted mt-0">The invitation expires after ${D().access.inviteDays} days. The user accepts privacy notice ${esc(D().privacy.current)} at first sign-in.</p><div class="row-acts"><button type="button" class="btn btn-sm" data-ad="inv-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Send invitation</button></div></form>` : '';
    const ed = st.edit && U.find((u) => u.email === st.edit);
    const editForm = ed ? `<form id="ad-roles" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">Edit roles · ${esc(ed.name)}</h3><fieldset class="fs"><legend>Roles</legend>${(ed.vendor ? ['supplier'] : ['procurement', 'admin']).map((r) => `<label class="chk"><input type="checkbox" name="roles" value="${r}"${ed.roles.includes(r) ? ' checked' : ''}${ed.vendor ? ' disabled' : ''}> ${r[0].toUpperCase() + r.slice(1)}</label>`).join('')}</fieldset>
      <label class="chk"><input type="checkbox" name="two" value="1"${ed.twoStep ? ' checked' : ''}> 2-step verification enforced</label>${st.edit && st.eerr ? `<div class="err" role="alert">${esc(st.eerr)}</div>` : ''}<div class="row-acts"><button type="button" class="btn btn-sm" data-ad="edit-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Save roles</button></div></form>` : '';
    const del = st.del && U.find((u) => u.email === st.del);
    const delForm = del ? `<form id="ad-del" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">Delete personal data · ${esc(del.name)}</h3><p class="small mt-0">Name, Gmail and phone are erased. Business records (POs, approvals, audit) keep a pseudonymous ID for the 10-year legal retention (Nghị định 13/2023, Luật Kế toán).</p>${S.field('add', st.derr ? { reason: st.derr } : {}, 'reason', 'Reason / request reference', '', { area: true, req: true })}<div class="row-acts"><button type="button" class="btn btn-sm" data-ad="del-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-d">Delete personal data</button></div></form>` : '';
    const sel = (k, label, opts) => `<label class="sr" for="adu-${k}">${label}</label><select class="inp" id="adu-${k}" data-adf="${k}">${opts.map(([v, l]) => `<option value="${v}"${st[k] === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
    const tbl = table([
      { h: 'User', r: (u) => `<b>${esc(u.name)}</b><div class="small mono">${esc(u.email)}</div><div class="small muted">${esc(u.title)}</div>`, w: 'minmax(220px,2fr)' },
      { h: 'Roles', r: (u) => u.roles.map((r) => pill(r, 'info')).join(' ') + (u.vendor ? `<div class="small muted">${esc(u.vendor)}</div>` : ''), w: 'minmax(140px,1.2fr)' },
      { h: 'Status', r: (u) => pill(u.status, tone(u.status)) + (u.invited ? `<div class="small muted">Invited ${esc(u.invited)}</div>` : ''), w: '130px' },
      { h: '2-step', r: (u) => (u.twoStep ? pill('On', 'success') : pill('Off', u.roles.includes('admin') ? 'danger' : 'neutral')), w: '80px' },
      { h: 'Privacy consent', r: (u) => (u.consent ? `${esc(u.consent)}<div class="small muted">${esc(u.consentVer || D().privacy.current)}</div>` : '—'), w: '120px' },
      { h: 'Actions', r: (u) => (/Deleted/.test(u.status) ? '<span class="small muted">Anonymised</span>' : `<button class="linkish small" data-ad="edit" data-id="${esc(u.email)}">Edit roles</button> · <button class="linkish small" data-ad="susp" data-id="${esc(u.email)}">${u.status === 'Suspended' ? 'Reactivate' : 'Suspend'}</button> · <button class="linkish small" data-ad="export" data-id="${esc(u.email)}">Export data</button> · <button class="linkish small" data-ad="del" data-id="${esc(u.email)}">Delete data</button>`), w: 'minmax(260px,2fr)' }
    ], rows, { min: 1080, label: 'Users', empty: 'No users match' });
    const reqs = D().dataRequests;
    return head('Users & roles', 'Sign-in with Gmail (allowlist) · roles Procurement / Supplier / Admin · personal data under Nghị định 13/2023', f ? '' : '<button class="btn btn-p" data-ad="inv-open">Invite user</button>')
      + `<div class="grid-k">${kpi('Active users', num(X.active), `${U.filter((u) => u.status === 'Active').length} in this sample`)}${kpi('Pending invitations', num(X.invites), U.filter((u) => u.status === 'Invited').map((u) => u.email).join(', ') || 'None', 'warning')}${kpi('Suspended', num(X.suspended), '')}${kpi('2-step not enabled', num(X.no2step), 'Required for Admin / Approver / Finance', X.no2step ? 'warning' : '')}${kpi('Integration warnings', num(D().integrations.filter((i) => i.status !== 'OK').length), '<a href="#/admin/integrations">Integrations</a>', D().integrations.some((i) => i.status !== 'OK') ? 'danger' : '')}</div>
      ${card(`Users (${rows.length})`, `<div class="filters"><label class="sr" for="adu-q">Search users</label><input class="inp grow" id="adu-q" type="search" data-adf="q" value="${esc(st.q)}" placeholder="Search name or Gmail">${sel('role', 'Role', [['all', 'All roles'], ['procurement', 'Procurement'], ['supplier', 'Supplier'], ['admin', 'Admin']])}${sel('status', 'Status', [['all', 'All statuses'], ['Active', 'Active'], ['Invited', 'Invited'], ['Suspended', 'Suspended']])}${sel('two', '2-step', [['all', '2-step: any'], ['on', '2-step on'], ['off', '2-step off']])}</div>${inviteForm}${editForm}${delForm}${tbl}`)}
      ${card(`Open personal-data requests (${reqs.filter((r) => r.status === 'Open').length})`, table([
        { h: 'Request', r: (r) => `<span class="mono">${esc(r.id)}</span>`, w: '140px' }, { h: 'User', r: (r) => `<span class="mono small">${esc(r.user)}</span>`, w: 'minmax(180px,1.5fr)' }, { h: 'Kind', r: (r) => esc(r.kind), w: 'minmax(160px,1.4fr)' },
        { h: 'Received · due', r: (r) => `${esc(r.at)} · ${esc(r.due)}`, w: '170px' }, { h: 'Status', r: (r) => pill(r.status, r.status === 'Open' ? 'warning' : 'success'), w: '100px' },
        { h: '', r: (r) => (r.status === 'Open' ? `<button class="btn btn-sm" data-ad="dsr-done" data-id="${esc(r.id)}">Mark delivered</button>` : ''), w: '150px' }
      ], reqs, { min: 860, label: 'Personal data requests', empty: 'No requests' }) + '<p class="small muted">Requests must be answered within 30 days (R-25). Exports are delivered to the user’s Gmail as a password-protected ZIP.</p>')}`;
  }

  /* ---------- F-100 access policy + F-101 privacy notice ---------- */
  function access() {
    const A = D().access; const f = st.pol || A; const e = st.perr; const P = D().privacy;
    const pub = st.pub;
    return head('Access policy', 'Who can sign in, how, and for how long')
      + `<div class="grid-2"><div class="stack">${card('Sign-in policy', `<form id="ad-pol" class="stack" novalidate><div class="form-grid">
        ${S.field('adp', e, 'method', 'Sign-in method', f.method, { options: ['Google only', 'Google only (suppliers may use a password + email OTP)'] })}
        ${S.field('adp', e, 'allow', 'Allowed accounts', f.allow, { options: [['Allowlist', 'Allowlist (Gmail addresses below)'], ['Domain', 'Google Workspace domain']] })}
        ${S.field('adp', e, 'domain', 'Workspace domain', f.domain, { ph: 'congty.com.vn', hint: 'Only used with "Google Workspace domain"' })}
        ${S.field('adp', e, 'inviteDays', 'Supplier invitation expires after (days)', f.inviteDays, { mode: 'numeric' })}
        ${S.field('adp', e, 'idle', 'Idle timeout (minutes)', f.idle, { mode: 'numeric' })}${S.field('adp', e, 'reauth', 'Sign in again after (hours)', f.reauth, { mode: 'numeric' })}</div>
        <fieldset class="fs"><legend>2-step verification required for</legend>${['Admin', 'Approver', 'Finance', 'Buyer', 'Supplier'].map((r) => `<label class="chk"><input type="checkbox" name="twoStep" value="${r}"${f.twoStep.includes(r) ? ' checked' : ''}> ${r}</label>`).join('')}</fieldset>
        <div class="row-acts"><button type="submit" class="btn btn-sm btn-p">Save policy</button></div></form>`)}
      ${card(`Allowlist (${A.allowlist.length})`, `<form id="ad-allow" class="row-acts start" novalidate><div class="field grow"><label for="ada-email">Add Gmail address</label><input id="ada-email" name="email" value="${esc(st.add)}" placeholder="name@gmail.com"${st.aerr ? ' aria-invalid="true" aria-describedby="ada-email-e"' : ''}>${st.aerr ? `<span class="err" id="ada-email-e" role="alert">${esc(st.aerr)}</span>` : ''}</div><button type="submit" class="btn btn-sm">Add</button></form>
        <ul class="plain small mt">${A.allowlist.map((m) => `<li class="row-acts between"><span class="mono">${esc(m)}</span><button class="linkish small" data-ad="allow-rm" data-id="${esc(m)}" aria-label="Remove ${esc(m)}">Remove</button></li>`).join('')}</ul>`)}</div>
      <div class="stack">${card('Privacy notice', `<p class="mt-0">Current version <b>${esc(P.current)}</b> · published ${esc(P.published)} · accepted by <b>${num(P.accepted)}</b> users</p><p class="small muted">Shown at: ${esc(P.shown)}.</p>
        <ul class="plain small">${P.versions.map(([v, d, s]) => `<li class="row-acts between"><span>${esc(v)} · ${esc(d)}</span>${pill(s, s === 'Current' ? 'success' : 'neutral')}</li>`).join('')}</ul>
        ${pub ? `<form id="ad-pub" class="stack mt decide-panel" novalidate>${S.field('adb', st.puerr ? { summary: st.puerr } : {}, 'summary', `What changes in v${(+P.current.slice(1) + 0.1).toFixed(1)}`, pub.summary, { area: true, req: true, hint: 'Publishing forces every user to accept again at the next sign-in or bid' })}<div class="row-acts"><button type="button" class="btn btn-sm" data-ad="pub-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Publish</button></div></form>` : ''}`,
        pub ? '' : `<button class="btn btn-sm" data-act="toast" data-msg="Preview: privacy notice ${esc(P.current)} (VI / EN)">Preview</button><button class="btn btn-sm" data-ad="pub-open">Edit text as v${(+P.current.slice(1) + 0.1).toFixed(1)}</button>`)}</div></div>`;
  }

  /* ---------- F-102 approval matrix & delegation ---------- */
  function matrix() {
    const B = D().approvalBands; const R = D().approvalRules; const DP = D().delegPolicy; const g = D().delegation; const m = st.mx; const me = st.mxErr; const dl = st.dl; const de = st.dlErr;
    const bands = [[`≤ ${App.ty(B[0][0])}`, 'Dept head'], [`≤ ${App.ty(B[1][0])}`, 'Dept head → Procurement Lead'], [`> ${App.ty(B[1][0])}`, 'Dept head → Procurement Lead → Finance Director']];
    const mform = m ? `<form id="ad-mx" class="stack mt decide-panel" novalidate><div class="form-grid">${S.field('adm', me, 'b1', 'Band 1 up to (₫)', m.b1, { mode: 'numeric' })}${S.field('adm', me, 'b2', 'Band 2 up to (₫)', m.b2, { mode: 'numeric' })}${S.field('adm', me, 'capex', 'Capex rule: EQP- above (₫)', m.capex, { mode: 'numeric' })}</div>
      <fieldset class="fs"><legend>Extra steps</legend>${R.map((r, i) => `<label class="chk"><input type="checkbox" name="rules" value="${i}"${m.rules.includes(String(i)) ? ' checked' : ''}> ${esc(r.rule)} → ${esc(r.adds)}</label>`).join('')}</fieldset>
      <div class="row-acts"><button type="button" class="btn btn-sm" data-ad="mx-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Save matrix</button></div></form>` : '';
    const dform = dl ? `<form id="ad-dl" class="stack mt decide-panel" novalidate><div class="form-grid">${S.field('add', de, 'from', 'Delegator', dl.from_u, { options: staff().map((u) => u.name), dis: true })}${S.field('add', de, 'to', 'Delegate', dl.to, { options: staff().map((u) => u.name) })}${S.field('add', de, 'start', 'From', dl.start, { ph: 'dd/mm/yyyy', req: true })}${S.field('add', de, 'until', 'Until', dl.until, { ph: 'dd/mm/yyyy', req: true, hint: `Max ${DP.maxDays} days` })}${S.field('add', de, 'cap', 'Cap per item (₫)', dl.cap, { mode: 'numeric', hint: `≤ ${App.ty(DP.cap)} or the delegator’s own limit` })}</div>
      <fieldset class="fs"><legend>Item types</legend>${['PR approval', 'PO approval', 'PO change order', 'Invoice exception'].map((t) => `<label class="chk"><input type="checkbox" name="types" value="${t}"${dl.types.includes(t) ? ' checked' : ''}> ${t}</label>`).join('')}${de.types ? `<span class="err" role="alert">${esc(de.types)}</span>` : ''}</fieldset>
      <div class="row-acts"><button type="button" class="btn btn-sm" data-ad="dl-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Save delegation</button></div></form>` : '';
    return head('Approval matrix', 'Value bands excl. VAT, extra steps and delegation (R-06) · used by PR, PO, change orders and My approvals')
      + `<div class="grid-2"><div class="stack">${card('Value bands', table([{ h: 'Value excl. VAT', r: (b) => esc(b[0]), w: '160px' }, { h: 'Approval route', r: (b) => esc(b[1]), w: 'minmax(260px,2fr)' }], bands, { min: 460, label: 'Approval bands' })
        + `<h3 class="h-sub">Extra steps</h3><ul class="plain">${R.map((r) => `<li class="row-acts between"><span>${esc(r.rule.replace('1 tỷ ₫', App.ty(r.above || 0)))}<div class="small muted">adds ${esc(r.adds)}</div></span>${pill(r.on ? 'On' : 'Off', r.on ? 'success' : 'neutral')}</li>`).join('')}</ul>${mform}`, m ? '' : '<button class="btn btn-sm" data-ad="mx-open">Edit matrix</button>')}</div>
      <div class="stack">${card('Delegation policy', `<dl class="dl"><dt>Max duration</dt><dd>${DP.maxDays} days</dd><dt>Cap</dt><dd>${App.ty(DP.cap)} or the delegator's own limit if lower</dd><dt>Bulk approve</dt><dd>Items &lt; ${vnd(D().bulkLimit)} only</dd><dt>SoD</dt><dd>A delegate never approves an item they raised</dd></dl>`)}
      ${card('Scheduled delegation', g ? `<p class="mt-0"><b>Nguyễn Minh Anh → ${esc(g.to)}</b> · ${esc(g.from)} – ${esc(g.until)} ${pill(S.dlgActive() ? 'Active' : 'Scheduled', S.dlgActive() ? 'success' : 'info')}</p><p class="small">Types: ${g.types.map(esc).join(', ')} · cap ${vnd(g.cap)} · above the cap → ${esc(g.above)}</p>${dform}` : `<p class="small muted mt-0">None scheduled.</p>${dform}`, dl ? '' : `<button class="btn btn-sm" data-ad="dl-open">${g ? 'Edit' : 'Schedule'}</button>`)}</div></div>`;
  }

  /* ---------- F-106 categories & numbering ---------- */
  function categories() {
    const C = D().categories; const A = D().catAdmin; const c = st.cat;
    return head('Categories', 'Material ID format CAT-NNNNN · each category has an owner and a match type')
      + card(`Categories (${C.length})`, table([
        { h: 'Code', r: (x) => `<b class="mono">${esc(x.code)}</b>`, w: '70px' }, { h: 'Name', r: (x) => `${esc(x.name)}<div class="small muted">${esc(x.vi)}</div>`, w: 'minmax(140px,1.2fr)' },
        { h: 'ID range', r: (x) => `<span class="mono small">${esc(x.code)}-${x.range[0]} … ${x.range[1]}</span>`, w: '190px' }, { h: 'Next ID', r: (x) => `<span class="mono">${esc(x.code)}-${x.next}</span>`, w: '110px' },
        { h: 'Material IDs', r: (x) => num(D().materials.filter((m) => m.id.startsWith(x.code)).length), cls: 'num', w: '100px' },
        { h: 'Owner', r: (x) => (c === x.code ? `<label class="sr" for="adc-o">Owner</label><select class="inp w-full" id="adc-o">${staff().map((u) => `<option${A[x.code].owner === u.name ? ' selected' : ''}>${esc(u.name)}</option>`).join('')}</select>` : esc(A[x.code].owner)), w: 'minmax(160px,1.3fr)' },
        { h: 'Match type', r: (x) => (c === x.code ? `<label class="sr" for="adc-m">Match type</label><select class="inp w-full" id="adc-m">${['3-way', '3-way (POD)', '2-way (SES)'].map((t) => `<option${A[x.code].match === t ? ' selected' : ''}>${t}</option>`).join('')}</select>` : esc(A[x.code].match)), w: 'minmax(130px,1fr)' },
        { h: '', r: (x) => (c === x.code ? `<button class="btn btn-sm btn-p" data-ad="cat-save" data-id="${x.code}">Save</button>` : `<button class="btn btn-sm" data-ad="cat-edit" data-id="${x.code}">Edit</button>`), w: '90px' }
      ], C, { min: 1060, label: 'Categories' }) + '<p class="small muted">IDs are issued from the range and are never reused, even after a Material ID is blocked. 2-way (SES) categories match invoice ↔ PO ↔ service entry sheet.</p>');
  }
  function numbering() {
    const nx = (type, pre, w) => { const xs = D().docs.filter((d) => d.type === type && d.id.startsWith(pre)).map((d) => +d.id.slice(pre.length)); return xs.length ? pre + String(Math.max(...xs) + 1).padStart(w, '0') : pre + '1'.padStart(w, '0'); };
    const next = { 'Purchase request': nx('PR', 'PR-2026-', 4), Tender: nx('TND', 'TND-2026-', 3), 'Purchase order': nx('PO', 'PO-2026-', 4), Contract: nx('CT', 'CT-2026-', 3), 'Goods receipt': nx('GRN', 'GRN-2026-', 4), 'Non-conformance': nx('NCR', 'NCR-2026-', 3), 'Invoice (internal)': nx('INV', 'INV-2026-', 4), Vendor: 'V-' + (Math.max(...D().vendors.map((v) => +v.id.slice(2))) + 1) };
    return head('Numbering & ID rules', 'Document numbers are issued by the system · cancelled numbers are never reused')
      + card('Rules', table([
        { h: 'Document', r: (r) => esc(r[0]), w: 'minmax(160px,1.4fr)' }, { h: 'Format', r: (r) => `<span class="mono">${esc(r[1])}</span>`, w: '160px' },
        { h: 'Next number', r: (r) => `<span class="mono">${esc(next[r[0]] || r[2] || '—')}</span>`, w: '170px' }, { h: 'Rule', r: (r) => esc(r[3]), w: 'minmax(220px,2fr)' }
      ], D().numbering, { min: 760, label: 'Numbering rules' }) + `<p class="small muted">YYYY = year of issue (reset on 01/01). Examples in use: INV-2026-0318, NCR-2026-017, CT-2026-008, PO-2026-0877 Rev.2 (a change order raises the revision and needs supplier re-confirmation).</p>`);
  }

  /* ---------- F-104 tolerances ---------- */
  function tolerances() {
    const T = D().tolerance; const R = D().toleranceRule; const f = st.tol || { price: num(T.price, 1), qty: num(T.qty, 0), over: R.over, ncr: R.ncrBlocks, hist: R.priceToHistory, srv: R.srv2way }; const e = st.tErr;
    return head('Match tolerances', '3-way match: invoice ↔ PO ↔ GRN accepted qty, per Material ID line (R-02)')
      + `<div class="grid-2"><div class="stack">${card('Tolerances', `<form id="ad-tol" class="stack" novalidate><div class="form-grid">${S.field('adt', e, 'price', 'Price tolerance vs PO (± %)', f.price, { mode: 'decimal', hint: '0 – 5%' })}${S.field('adt', e, 'qty', 'Quantity tolerance vs GRN (± %)', f.qty, { mode: 'decimal', hint: 'Weight / volume units only (tấn, m³); count units must match exactly' })}
        ${S.field('adt', e, 'over', 'Outside tolerance', f.over, { options: [D().toleranceRule.over, 'Warn only (no hold)'] })}</div>
        <fieldset class="fs"><legend>Rules</legend><label class="chk"><input type="checkbox" name="ncr" value="1"${f.ncr ? ' checked' : ''}> An open NCR blocks matching for the rejected quantity</label><label class="chk"><input type="checkbox" name="hist" value="1"${f.hist ? ' checked' : ''}> Write invoice price differences to Price history (source Invoice)</label><label class="chk"><input type="checkbox" name="srv" value="1"${f.srv ? ' checked' : ''}> SRV- Material IDs use a 2-way match against the service entry sheet</label></fieldset>
        <div class="row-acts"><button type="submit" class="btn btn-sm btn-p">Save tolerances</button></div></form>`)}</div>
      <div class="stack">${card('In force', `<dl class="dl"><dt>Price</dt><dd>±${num(T.price, 1)}%</dd><dt>Quantity</dt><dd>±${num(T.qty, 0)}% (tấn, m³)</dd><dt>Confirmed by</dt><dd>${esc(R.approvedBy)}</dd></dl><p class="small muted">Example: INV-2026-0322 at 19.000.000 vs PO 18.500.000 = +2,7% → held in the buyer's exception queue.</p>`)}</div></div>`;
  }

  /* ---------- F-107 integrations ---------- */
  function integrations() {
    const I = D().integrations; const M = D().itemMap; const un = Object.entries(M).filter(([, v]) => !v); const VM = D().vendorMap;
    return head('Integrations', 'Sign-in, e-invoice intake, GDT lookup and accounting export (R-20)')
      + `<div class="grid-k">${I.map((i) => kpi(i.name, pill(i.status, tone(i.status)), `${esc(i.note)} · ${esc(i.last)}`)).join('')}</div>
      <div class="grid-2"><div class="stack">${card(`Material ID → accounting item code (${un.length} unmapped)`, table([
        { h: 'Material ID', r: ([k]) => `<span class="mid">${esc(k)}</span><div class="small">${esc((App.material(k) || {}).name || '')}</div>`, w: 'minmax(180px,2fr)' },
        { h: 'Item code', r: ([k, v]) => (v ? `<span class="mono">${esc(v)}</span>` : `<label class="sr" for="adx-${esc(k)}">Item code for ${esc(k)}</label><input class="inp w-full" id="adx-${esc(k)}" data-map="${esc(k)}" value="${esc(st.map[k] || '')}" placeholder="e.g. 152-…"${st.map['_e' + k] ? ` aria-invalid="true" aria-describedby="adx-${esc(k)}-e"` : ''}>${st.map['_e' + k] ? `<span class="err small" id="adx-${esc(k)}-e" role="alert">${esc(st.map['_e' + k])}</span>` : ''}`), w: 'minmax(180px,1.6fr)' },
        { h: 'Status', r: ([, v]) => pill(v ? 'Mapped' : 'Unmapped', v ? 'success' : 'danger'), w: '110px' }
      ], Object.entries(M).sort((a, b) => (a[1] ? 1 : 0) - (b[1] ? 1 : 0)), { min: 520, label: 'Material ID mapping' }), un.length ? '<button class="btn btn-sm btn-p" data-ad="map-save">Save mappings</button>' : '')}
      ${card('Vendor → accounting vendor code', `<p class="mt-0"><b>${num(VM.mapped)} / ${num(VM.total)}</b> vendors mapped · unmapped: <span class="mono">${esc(VM.unmapped || 'none')}</span> (pending onboarding)</p>`)}</div>
      <div class="stack">${card('Sync log', `<ul class="plain small">${D().syncLog.map((l, i) => `<li class="row-acts between"><span><span class="muted">${esc(l.at)}</span> · <b>${esc(l.job)}</b> ${pill(l.status, tone(l.status))}<div>${esc(l.detail)}</div></span>${l.status === 'Failed' ? `<button class="btn btn-sm" data-ad="retry" data-i="${i}">Retry</button>` : ''}</li>`).join('')}</ul>`)}</div></div>`;
  }

  /* ---------- F-105 notification rules ---------- */
  function rules() {
    const R = D().notifRules; const CH = ['In-app', 'Gmail', 'Portal']; const G = D().digest; const nr = st.nr;
    const grid = `<form id="ad-rules" class="stack" novalidate><div class="tbl-wrap" tabindex="0" role="region" aria-label="Notification rules, scrolls horizontally"><div class="tbl tbl-980" role="table"><div class="tr thead nr-cols" role="row"><div class="th">Event</div><div class="th">Reminder</div><div class="th">Escalation</div>${CH.map((c) => `<div class="th">${c}</div>`).join('')}<div class="th">Last run</div></div>
      ${R.map((r, i) => `<div class="tr nr-cols" role="row"><div class="td" role="cell">${esc(r.ev)}</div><div class="td" role="cell"><label class="sr" for="adr-r${i}">Reminder for ${esc(r.ev)}</label><input class="inp w-full" id="adr-r${i}" name="r${i}" value="${esc(r.remind)}"></div><div class="td" role="cell"><label class="sr" for="adr-e${i}">Escalation for ${esc(r.ev)}</label><input class="inp w-full" id="adr-e${i}" name="e${i}" value="${esc(r.esc)}"></div>
        ${CH.map((c) => `<div class="td" role="cell"><label class="chk"><input type="checkbox" name="c${i}" value="${c}"${r.ch.includes(c) ? ' checked' : ''}><span class="sr"> ${c} for ${esc(r.ev)}</span></label></div>`).join('')}<div class="td small" role="cell">${esc(r.last)}</div></div>`).join('')}</div></div>
      ${st.nrErr ? `<div class="alert alert-danger" role="alert">${esc(st.nrErr)}</div>` : ''}
      <fieldset class="fs"><legend>Daily digest</legend><label class="chk"><input type="checkbox" name="dg" value="1"${G.on ? ' checked' : ''}> Send a daily digest by Gmail</label><div class="field"><label for="adr-dt">Time</label><input id="adr-dt" class="inp" name="dt" value="${esc(G.time)}" placeholder="hh:mm"></div></fieldset>
      <div class="row-acts"><button type="submit" class="btn btn-sm btn-p">Save rules</button></div></form>`;
    const add = nr ? `<form id="ad-nr" class="stack mt decide-panel" novalidate><div class="form-grid">${S.field('adn', nr.e || {}, 'ev', 'Event', nr.ev, { req: true, ph: 'e.g. Bid security expiring' })}${S.field('adn', {}, 'remind', 'Reminder', nr.remind, { ph: '7 days before' })}${S.field('adn', {}, 'esc', 'Escalation', nr.esc, { ph: '— or → role' })}</div><div class="row-acts"><button type="button" class="btn btn-sm" data-ad="nr-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Add rule</button></div></form>` : '';
    return head('Notification rules', 'Event × channel, reminders and escalation (R-15) · every channel keeps an in-app copy')
      + card(`Rules (${R.length})`, grid + add, nr ? '' : '<button class="btn btn-sm" data-ad="nr-open">Add rule</button>');
  }

  /* ---------- F-103 SoD ---------- */
  function sod() {
    const R = D().sodRules; const V = D().sodViolations; const L = D().sodLog || []; const f = st.sod;
    return head('SoD rules', 'Segregation of duties (R-18) · Block stops the action, Warn allows it and logs it · overrides only by an Admin, with a reason')
      + card(`Rules (${R.length})`, `<form id="ad-sod" class="stack" novalidate>${table([
        { h: 'Rule', r: (r) => esc(r[0]), w: 'minmax(280px,2.4fr)' },
        { h: 'Mode', r: (r) => { const i = R.indexOf(r); return `<label class="sr" for="ads-m${i}">Mode for ${esc(r[0])}</label><select class="inp w-full" id="ads-m${i}" name="m${i}">${['Block', 'Warn'].map((m) => `<option${r[1] === m ? ' selected' : ''}>${m}</option>`).join('')}</select>`; }, w: '120px' },
        { h: 'Violations (30 days)', r: (r) => num(V[R.indexOf(r)] || 0), cls: 'num', w: '150px' }
      ], R, { min: 600, label: 'SoD rules' })}<div class="row-acts"><button type="submit" class="btn btn-sm btn-p">Save modes</button></div></form>
      ${f ? `<form id="ad-sodn" class="stack mt decide-panel" novalidate><div class="form-grid">${S.field('adsn', st.sErr, 'a', 'Person doing', f.a, { req: true, ph: 'e.g. Contract creator' })}${S.field('adsn', st.sErr, 'b', '≠ person doing', f.b, { req: true, ph: 'e.g. Contract approver' })}${S.field('adsn', {}, 'mode', 'Mode', f.mode, { options: ['Block', 'Warn'] })}</div><div class="row-acts"><button type="button" class="btn btn-sm" data-ad="sod-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Add rule</button></div></form>` : ''}`, f ? '' : '<button class="btn btn-sm" data-ad="sod-open">Add rule</button>')
      + card(`Override log (${L.length})`, table([
        { h: 'Item', r: (x) => `<span class="mono">${esc(x.id)}</span>`, w: '170px' }, { h: 'By', r: (x) => esc(x.by), w: '150px' }, { h: 'When', r: (x) => esc(x.at), w: '150px' }, { h: 'Reason', r: (x) => esc(x.reason), w: 'minmax(240px,2fr)' }
      ], L.slice().reverse(), { min: 700, label: 'SoD overrides', empty: 'No overrides' }));
  }

  /* ---------- F-108 audit ---------- */
  function audit() {
    const A = D().audit.slice().sort((a, b) => { const k = (s) => { const [d, t] = s.split(' '); return App.dt(d).getTime() + (t ? +t.replace(':', '') : 0); }; return k(b.at) - k(a.at); });
    const f = st.au; const users = [...new Set(A.map((x) => x.user))]; const types = ['Settings', 'Sign-in', 'Bids and tenders', 'Overrides', 'Data privacy', 'Orders'];
    const rows = A.filter((x) => (f.user === 'all' || x.user === f.user) && (f.type === 'all' || x.type === f.type) && (!f.q.trim() || App.matches(`${x.action} ${x.ref}`, f.q)));
    return head('Audit log', `Read only · kept ${D().auditStats.years} years · ${num(D().auditStats.total)} entries (sample loaded)`, `<button class="btn" data-act="toast" data-msg="AuditLog_${esc(D().today.replace(/\//g, ''))}.xlsx exported (${rows.length} rows in view)">Export Excel</button>`)
      + card(`Entries (${rows.length})`, `<div class="filters"><label class="sr" for="adl-q">Search</label><input class="inp grow" id="adl-q" type="search" data-auf="q" value="${esc(f.q)}" placeholder="Search action or reference (e.g. TND-2026-029, unseal)">
        <label class="sr" for="adl-u">User</label><select class="inp" id="adl-u" data-auf="user"><option value="all">All users</option>${users.map((u) => `<option${f.user === u ? ' selected' : ''}>${esc(u)}</option>`).join('')}</select>
        <label class="sr" for="adl-t">Action type</label><select class="inp" id="adl-t" data-auf="type"><option value="all">All action types</option>${types.map((t) => `<option${f.type === t ? ' selected' : ''}>${t}</option>`).join('')}</select></div>`
        + table([
          { h: 'When', r: (x) => `<span class="nowrap">${esc(x.at)}</span>`, w: '140px' }, { h: 'User', r: (x) => esc(x.user), w: 'minmax(160px,1.3fr)' },
          { h: 'Type', r: (x) => pill(x.type, x.type === 'Overrides' ? 'danger' : x.type === 'Bids and tenders' ? 'info' : 'neutral'), w: '150px' },
          { h: 'Action', r: (x) => esc(x.action), w: 'minmax(260px,2.4fr)' }, { h: 'Reference', r: (x) => (x.ref ? `<span class="mono small">${esc(x.ref)}</span>` : '—'), w: 'minmax(120px,1fr)' }
        ], rows.slice(0, f.n), { min: 980, label: 'Audit log', empty: 'No entries match' })
        + (rows.length > f.n ? `<div class="row-acts"><button class="btn btn-sm" data-ad="more">Load more (${rows.length - f.n})</button></div>` : '<p class="small muted">End of the loaded sample.</p>'));
  }

  /* ---------- events ---------- */
  function mount(root) {
    const rerender = (id) => { App.render(); if (id) { const x = document.getElementById(id); if (x) { x.focus(); if (x.setSelectionRange && x.type === 'search') x.setSelectionRange(x.value.length, x.value.length); } } };
    root.addEventListener('input', (e) => { const k = e.target.dataset.adf; if (k === 'q') { st.q = e.target.value; rerender(e.target.id); } const a = e.target.dataset.auf; if (a === 'q') { st.au.q = e.target.value; st.au.n = 10; rerender(e.target.id); } if (e.target.dataset.map) st.map[e.target.dataset.map] = e.target.value; });
    root.addEventListener('change', (e) => {
      const k = e.target.dataset.adf; if (k && k !== 'q') { st[k] = e.target.value; rerender(e.target.id); }
      const a = e.target.dataset.auf; if (a && a !== 'q') { st.au[a] = e.target.value; st.au.n = 10; rerender(e.target.id); }
      if (e.target.id === 'adi-role' && st.inv) { Object.assign(st.inv, S.read(root, '#ad-inv')); rerender('adi-role'); }
    });
    root.addEventListener('submit', (e) => {
      const f = e.target; if (!f.id || !/^ad-/.test(f.id)) return; e.preventDefault();
      if (f.id === 'ad-inv') {
        const x = Object.assign(st.inv, S.read(root, '#ad-inv')); const er = {}; x.email = (x.email || '').toLowerCase();
        if (!isGmailOk(x.email)) er.email = D().access.domain ? `Use a Gmail address or @${D().access.domain}.` : 'Use a Gmail address (…@gmail.com).'; else if (D().users.some((u) => u.email === x.email)) er.email = 'This Gmail already has an account.';
        if ((x.name || '').length < 3) er.name = 'Enter the full name.';
        st.ierr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#ad-inv'); return; }
        const v = x.role === 'supplier' && App.vendor(x.vendor);
        D().users.push({ email: x.email, name: x.name, title: v ? `Supplier user · ${v.id}` : (x.title || 'Buyer'), roles: [x.role], vendor: v ? v.id : undefined, status: 'Invited', invited: D().today, inviteCode: 'PL-INV-' + Math.random().toString(36).slice(2, 6).toUpperCase(), twoStep: false });
        if (!D().access.allowlist.includes(x.email)) D().access.allowlist.push(x.email); D().userStats.invites++;
        S.audit('Settings', `User invited · ${x.email} as ${x.role} (allowlisted)`, x.email); st.inv = null; App.render(); App.toast(`Invitation sent to ${x.email} · expires in ${D().access.inviteDays} days`);
      } else if (f.id === 'ad-roles') {
        const u = D().users.find((y) => y.email === st.edit); const x = S.read(root, '#ad-roles'); const roles = u.vendor ? ['supplier'] : x.roles || [];
        if (!roles.length) { st.eerr = 'Keep at least one role (or suspend the user).'; App.render(); return; }
        if (u.name === S.me() && !roles.includes('admin')) { st.eerr = 'You cannot remove your own Admin role.'; App.render(); return; }
        const before = u.roles.join(', '); u.roles = roles; u.twoStep = (x.two || []).length > 0; st.edit = null; st.eerr = '';
        S.audit('Settings', `Roles changed · ${before} → ${roles.join(', ')} · 2-step ${u.twoStep ? 'on' : 'off'}`, u.email); App.render(); App.toast(`${u.name}: roles saved`);
      } else if (f.id === 'ad-del') {
        const u = D().users.find((y) => y.email === st.del); const r = S.read(root, '#ad-del').reason || '';
        if (r.length < 5) { st.derr = 'Give the reason or request reference.'; App.render(); S.focusErr('#ad-del'); return; }
        const old = u.email; const pid = 'U-' + String(D().users.indexOf(u) + 1).padStart(4, '0');
        Object.assign(u, { name: `Deleted user ${pid}`, email: `${pid.toLowerCase()}@deleted.invalid`, status: 'Deleted (anonymised)', roles: [], twoStep: false, consent: null });
        D().access.allowlist = D().access.allowlist.filter((m) => m !== old);
        S.audit('Data privacy', `Personal data deleted · pseudonymous ID ${pid} kept on business records · ${r}`, pid); st.del = null; st.derr = ''; App.render(); App.toast(`Personal data of ${old} deleted · ${pid}`);
      } else if (f.id === 'ad-pol') {
        const x = S.read(root, '#ad-pol'); const er = {}; const n = (k, lo, hi) => { const v = +x[k]; if (!(v >= lo && v <= hi)) er[k] = `${lo} – ${hi}.`; return v; };
        const inviteDays = n('inviteDays', 1, 30), idle = n('idle', 5, 240), reauth = n('reauth', 1, 72);
        if (x.allow === 'Domain' && !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(x.domain || '')) er.domain = 'Enter the Workspace domain, e.g. congty.com.vn.';
        if (!(x.twoStep || []).includes('Admin')) er.inviteDays = er.inviteDays || '';
        st.pol = Object.assign({}, D().access, x, { twoStep: x.twoStep || [] }); st.perr = Object.fromEntries(Object.entries(er).filter(([, v]) => v));
        if (!(x.twoStep || []).includes('Admin')) st.perr.method = '2-step verification cannot be turned off for Admin.';
        if (Object.keys(st.perr).length) { App.render(); S.focusErr('#ad-pol'); return; }
        Object.assign(D().access, { method: x.method, allow: x.allow, domain: x.domain, inviteDays, idle, reauth, twoStep: x.twoStep });
        S.audit('Settings', `Access policy saved · ${x.allow}${x.domain ? ' @' + x.domain : ''} · idle ${idle} min · re-auth ${reauth} h · invite ${inviteDays} days · 2-step ${x.twoStep.join('/')}`, 'Access policy'); st.pol = null; App.render(); App.toast('Access policy saved');
      } else if (f.id === 'ad-allow') {
        const m = (S.read(root, '#ad-allow').email || '').toLowerCase(); st.add = m;
        if (!isGmailOk(m)) st.aerr = 'Use a Gmail address (…@gmail.com) or the Workspace domain.'; else if (D().access.allowlist.includes(m)) st.aerr = 'Already on the allowlist.'; else st.aerr = '';
        if (st.aerr) { App.render(); S.focusErr('#ad-allow'); return; }
        D().access.allowlist.push(m); S.audit('Settings', `Allowlist · added ${m}`, 'Access policy'); st.add = ''; App.render(); App.toast(`${m} added to the allowlist`);
      } else if (f.id === 'ad-pub') {
        const s = S.read(root, '#ad-pub').summary || ''; st.pub = { summary: s }; if (s.length < 10) { st.puerr = 'Describe the change (at least 10 characters).'; App.render(); S.focusErr('#ad-pub'); return; }
        const P = D().privacy; const nv = 'v' + (+P.current.slice(1) + 0.1).toFixed(1); P.versions.forEach((v) => { if (v[2] === 'Current') v[2] = 'Superseded'; }); P.versions.unshift([nv, D().today, 'Current']); P.current = nv; P.published = D().today; P.accepted = 0;
        D().users.forEach((u) => { if (u.consent) { u.consentVer = 'Re-acceptance pending'; } });
        S.audit('Data privacy', `Privacy notice ${nv} published · every user must accept again · ${s}`, 'Privacy notice'); st.pub = null; st.puerr = ''; App.render(); App.toast(`${nv} published · users accept again at next sign-in`);
      } else if (f.id === 'ad-mx') {
        const x = S.read(root, '#ad-mx'); const b1 = S.money(x.b1), b2 = S.money(x.b2), cx = S.money(x.capex); const er = {};
        if (!(b1 > 0)) er.b1 = 'Enter an amount.'; if (!(b2 > b1)) er.b2 = 'Band 2 must be above band 1.'; if (!(cx > 0)) er.capex = 'Enter an amount.';
        st.mx = Object.assign(st.mx, x, { rules: x.rules || [] }); st.mxErr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#ad-mx'); return; }
        D().approvalBands[0][0] = b1; D().approvalBands[1][0] = b2; D().approvalRules.forEach((r, i) => { r.on = (x.rules || []).includes(String(i)); }); D().approvalRules[0].above = cx;
        S.audit('Settings', `Approval matrix · bands ≤ ${vnd(b1)} / ≤ ${vnd(b2)} · capex EQP- > ${vnd(cx)}`, 'Approval matrix'); st.mx = null; App.render(); App.toast('Approval matrix saved · applies to new PRs, POs and change orders');
      } else if (f.id === 'ad-dl') {
        const x = S.read(root, '#ad-dl'); const er = {}; const DP = D().delegPolicy; const cap = S.money(x.cap);
        if (!S.validDate(x.start)) er.start = 'Use dd/mm/yyyy.'; if (!S.validDate(x.until)) er.until = 'Use dd/mm/yyyy.';
        else if (S.validDate(x.start)) { const days = (App.dt(x.until) - App.dt(x.start)) / 864e5 + 1; if (days < 1) er.until = 'Must be on or after the start.'; else if (days > DP.maxDays) er.until = `At most ${DP.maxDays} days.`; }
        if (x.to === 'Nguyễn Minh Anh') er.to = 'The delegate must be someone else.'; if (!(cap > 0) || cap > DP.cap) er.cap = `1 – ${vnd(DP.cap)}.`; if (!(x.types || []).length) er.types = 'Choose at least one item type.';
        st.dl = Object.assign(st.dl, x, { types: x.types || [] }); st.dlErr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#ad-dl'); return; }
        D().delegation = { to: x.to, from: x.start, until: x.until, cap, types: x.types, above: 'Đỗ Hoàng Nam' };
        S.audit('Settings', `Delegation Nguyễn Minh Anh → ${x.to} · ${x.start}–${x.until} · cap ${vnd(cap)}`, 'Approval matrix'); st.dl = null; App.render(); App.toast('Delegation saved · My approvals updated');
      } else if (f.id === 'ad-tol') {
        const x = S.read(root, '#ad-tol'); const p = Number(String(x.price).replace(',', '.')), q = Number(String(x.qty).replace(',', '.')); const er = {};
        if (!(p >= 0 && p <= 5)) er.price = 'Between 0 and 5%.'; if (!(q >= 0 && q <= 10)) er.qty = 'Between 0 and 10%.';
        st.tol = { price: x.price, qty: x.qty, over: x.over, ncr: (x.ncr || []).length > 0, hist: (x.hist || []).length > 0, srv: (x.srv || []).length > 0 }; st.tErr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#ad-tol'); return; }
        Object.assign(D().tolerance, { price: p, qty: q }); Object.assign(D().toleranceRule, { over: x.over, ncrBlocks: st.tol.ncr, priceToHistory: st.tol.hist, srv2way: st.tol.srv, approvedBy: `${S.me()} · ${D().today} (Finance confirmation requested)` });
        S.audit('Settings', `Match tolerance price ±${num(p, 1)}% · qty ±${num(q, 0)}%`, 'Tolerances'); st.tol = null; App.render(); App.toast('Tolerances saved · invoices are re-matched with the new values');
      } else if (f.id === 'ad-rules') {
        const x = S.read(root, '#ad-rules'); const R = D().notifRules;
        const bad = R.findIndex((r, i) => !(x['c' + i] || []).length); if (bad >= 0) { st.nrErr = `"${R[bad].ev}" needs at least one channel.`; App.render(); return; }
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(x.dt || '')) { st.nrErr = 'Digest time must be hh:mm.'; App.render(); return; }
        R.forEach((r, i) => { r.remind = x['r' + i]; r.esc = x['e' + i]; r.ch = x['c' + i]; }); Object.assign(D().digest, { on: (x.dg || []).length > 0, time: x.dt }); st.nrErr = '';
        S.audit('Settings', `Notification rules saved · daily digest ${D().digest.on ? D().digest.time : 'off'}`, 'Notification rules'); App.render(); App.toast('Notification rules saved');
      } else if (f.id === 'ad-nr') {
        const x = S.read(root, '#ad-nr'); if ((x.ev || '').length < 5) { st.nr = Object.assign(x, { e: { ev: 'Name the event.' } }); App.render(); S.focusErr('#ad-nr'); return; }
        D().notifRules.push({ ev: x.ev, remind: x.remind || '—', esc: x.esc || '—', ch: ['In-app'], last: 'Not run yet' }); S.audit('Settings', `Notification rule added · ${x.ev}`, 'Notification rules'); st.nr = null; App.render(); App.toast('Rule added');
      } else if (f.id === 'ad-sod') {
        const x = S.read(root, '#ad-sod'); const ch = []; D().sodRules.forEach((r, i) => { if (x['m' + i] && x['m' + i] !== r[1]) { ch.push(`${r[0]}: ${r[1]} → ${x['m' + i]}`); r[1] = x['m' + i]; } });
        if (ch.length) S.audit('Settings', 'SoD modes · ' + ch.join(' · '), 'SoD rules'); App.render(); App.toast(ch.length ? `${ch.length} rule(s) updated` : 'No changes');
      } else if (f.id === 'ad-sodn') {
        const x = S.read(root, '#ad-sodn'); st.sod = x; st.sErr = {}; if (!x.a) st.sErr.a = 'Required.'; if (!x.b) st.sErr.b = 'Required.'; if (Object.keys(st.sErr).length) { App.render(); S.focusErr('#ad-sodn'); return; }
        D().sodRules.push([`${x.a} ≠ ${x.b}`, x.mode]); D().sodViolations.push(0); S.audit('Settings', `SoD rule added · ${x.a} ≠ ${x.b} (${x.mode})`, 'SoD rules'); st.sod = null; App.render(); App.toast('SoD rule added');
      }
    });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ad]'); if (!b) return; const a = b.dataset.ad; const id = b.dataset.id;
      const u = id && D().users.find((x) => x.email === id);
      if (a === 'inv-open') { st.inv = { email: '', name: '', role: 'procurement', vendor: 'V-1001', title: '' }; st.ierr = {}; App.render(); focus('#adi-email'); }
      else if (a === 'inv-cancel') { st.inv = null; App.render(); }
      else if (a === 'edit') { st.edit = id; st.eerr = ''; st.del = null; App.render(); focus('#ad-roles input'); }
      else if (a === 'edit-cancel') { st.edit = null; App.render(); }
      else if (a === 'susp') { if (u.name === S.me()) { App.toast('You cannot suspend yourself'); return; } u.status = u.status === 'Suspended' ? 'Active' : 'Suspended'; S.audit('Settings', `User ${u.status === 'Suspended' ? 'suspended' : 'reactivated'}`, u.email); App.render(); App.toast(`${u.name} ${u.status.toLowerCase()}`); }
      else if (a === 'export') { const rid = 'DSR-2026-' + String(8 + D().dataRequests.length).padStart(3, '0'); D().dataRequests.unshift({ id: rid, user: u.email, kind: 'Export personal data', at: D().today, status: 'Delivered', due: D().today }); S.audit('Data privacy', `Personal data exported (${rid}) · sent to the user's Gmail`, u.email); App.render(); App.toast(`${rid}: export of ${u.email} sent as a protected ZIP`); }
      else if (a === 'del') { if (u.name === S.me()) { App.toast('You cannot delete your own data here'); return; } if (u.status === 'Active') { App.toast('Suspend the user first, then delete the personal data'); return; } st.del = id; st.derr = ''; st.edit = null; App.render(); focus('#add-reason'); }
      else if (a === 'del-cancel') { st.del = null; App.render(); }
      else if (a === 'dsr-done') { const r = D().dataRequests.find((x) => x.id === id); r.status = 'Delivered'; S.audit('Data privacy', `${r.kind} delivered (${r.id})`, r.user); App.render(); App.toast(`${r.id} marked delivered`); }
      else if (a === 'allow-rm') { if (D().users.some((x) => x.email === id && x.status === 'Active')) { App.toast('Suspend the active user before removing the address'); return; } D().access.allowlist = D().access.allowlist.filter((m) => m !== id); S.audit('Settings', `Allowlist · removed ${id}`, 'Access policy'); App.render(); }
      else if (a === 'pub-open') { st.pub = { summary: '' }; st.puerr = ''; App.render(); focus('#adb-summary'); }
      else if (a === 'pub-cancel') { st.pub = null; App.render(); }
      else if (a === 'mx-open') { const B = D().approvalBands; st.mx = { b1: num(B[0][0]), b2: num(B[1][0]), capex: num(D().approvalRules[0].above), rules: D().approvalRules.map((r, i) => (r.on ? String(i) : null)).filter((x) => x != null) }; st.mxErr = {}; App.render(); focus('#adm-b1'); }
      else if (a === 'mx-cancel') { st.mx = null; App.render(); }
      else if (a === 'dl-open') { const g = D().delegation || {}; st.dl = { from_u: 'Nguyễn Minh Anh', to: g.to || 'Lê Quốc Huy', start: g.from || '', until: g.until || '', cap: num(g.cap || 500000000), types: g.types || ['PR approval'] }; st.dlErr = {}; App.render(); focus('#add-to'); }
      else if (a === 'dl-cancel') { st.dl = null; App.render(); }
      else if (a === 'cat-edit') { st.cat = id; App.render(); focus('#adc-o'); }
      else if (a === 'cat-save') { const A = D().catAdmin[id]; const o = document.getElementById('adc-o').value, m = document.getElementById('adc-m').value; const ch = `${A.owner} / ${A.match} → ${o} / ${m}`; A.owner = o; A.match = m; S.audit('Settings', `Category ${id} · ${ch}`, 'Categories'); st.cat = null; App.render(); App.toast(`${id} saved`); }
      else if (a === 'map-save') { const M = D().itemMap; let n = 0; Object.keys(M).forEach((k) => { if (M[k]) return; const v = (st.map[k] || '').trim(); delete st.map['_e' + k]; if (!v) return; if (!/^\d{3}-[A-Z0-9-]{2,}$/i.test(v)) { st.map['_e' + k] = 'Format: account-code, e.g. 152-BIEN-TAN'; return; } M[k] = v.toUpperCase(); n++; S.audit('Settings', `Item code mapping ${k} → ${M[k]}`, 'Integrations'); });
        App.render(); App.toast(n ? `${n} mapping(s) saved · ${Object.values(M).filter((v) => !v).length} unmapped` : 'Nothing to save'); }
      else if (a === 'retry') { const l = D().syncLog[+b.dataset.i]; const miss = (l.detail.match(/([A-Z]{3}-\d{5}) has no item code/) || [])[1]; const ok = !miss || D().itemMap[miss]; const at = D().today + ' ' + new Date().toTimeString().slice(0, 5);
        D().syncLog.unshift({ at, job: l.job, detail: ok ? l.detail.replace(/ · .*/, '') + ' · retried and exported' : `Retry failed · ${miss} still has no item code — map it first`, status: ok ? 'OK' : 'Failed' }); l.status = ok ? 'Resolved' : 'Failed (retried)';
        const acct = D().integrations.find((i) => i.key === 'acct'); if (ok && !D().syncLog.some((x) => x.status === 'Failed')) { acct.status = 'OK'; acct.last = at; } S.audit('Settings', `Integration retry · ${l.job} · ${ok ? 'OK' : 'failed'}`, 'Integrations'); App.render(); App.toast(ok ? 'Retry succeeded' : 'Retry failed — map the Material ID first'); }
      else if (a === 'nr-open') { st.nr = { ev: '', remind: '', esc: '' }; App.render(); focus('#adn-ev'); }
      else if (a === 'nr-cancel') { st.nr = null; App.render(); }
      else if (a === 'sod-open') { st.sod = { a: '', b: '', mode: 'Block' }; st.sErr = {}; App.render(); focus('#adsn-a'); }
      else if (a === 'sod-cancel') { st.sod = null; App.render(); }
      else if (a === 'more') { st.au.n += 10; App.render(); }
    });
  }
  const reg = (k, title, fn) => App.page('admin/' + k, { title, roles: ['admin'], render: () => { if (st.cur !== k) { st.cur = k; st.inv = st.edit = st.del = st.pol = st.pub = st.mx = st.dl = st.cat = st.tol = st.nr = st.sod = null; st.ierr = {}; st.perr = {}; st.mxErr = {}; st.dlErr = {}; st.tErr = {}; st.sErr = {}; st.nrErr = ''; st.aerr = ''; } return fn(); }, mount });
  reg('users', 'Users & roles', users); reg('access', 'Access policy', access); reg('matrix', 'Approval matrix', matrix); reg('categories', 'Categories', categories);
  reg('numbering', 'Numbering & ID rules', numbering); reg('tolerances', 'Match tolerances', tolerances); reg('integrations', 'Integrations', integrations);
  reg('rules', 'Notification rules', rules); reg('sod', 'SoD rules', sod); reg('audit', 'Audit log', audit);
})();
