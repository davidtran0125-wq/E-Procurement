/* Module 10 · Approvals — F-56 inbox (Waiting for me / Delegated / History) with type filter, SLA age, step and bulk approve under 50.000.000 ₫,
   F-57 item detail (Material ID lines with last price + 90-day avg, budget impact, approval chain), F-58 Approve / Reject / Return with mandatory comment,
   F-59 delegation with "on behalf of" (R-06), F-60 SoD block + Admin override (R-18). Route: #/approvals (?id=) */
(function () {
  const { esc, num, pct, vnd, mid, pill, table, kpi, card } = App;
  const S = App.src;
  const D = () => window.DATA;
  const NOW = '02/11/2026 10:30';
  const st = { tab: 'mine', type: 'all', sel: null, picked: [], comment: '', cerr: '', dlg: null, derr: {}, ovr: null, oerr: '', lastId: null };
  const TYPES = ['PR approval', 'Award recommendation', 'PO change order', 'New Material ID', 'Vendor change', 'Invoice exception'];

  const ts = (s) => { const [d, t = '00:00'] = s.split(' '); const x = App.dt(d); const [h, m] = t.split(':').map(Number); x.setHours(h, m); return x; };
  const hoursLeft = (a) => (ts(a.sla) - ts(NOW)) / 36e5;
  const slaText = (a) => { const h = hoursLeft(a); if (h < 0) return ['Overdue ' + Math.round(-h) + ' h', 'danger']; if (h < 24) return [`Due in ${Math.floor(h)} h ${Math.round((h % 1) * 60)} min`, 'warning']; return [`Due in ${Math.floor(h / 24)} d ${Math.round(h % 24)} h`, 'neutral']; };
  const stepOf = (a) => { const m = /Step (\d+) of (\d+)/.exec(a.step || ''); return m ? [+m[1], +m[2]] : [1, 1]; };
  const blocked = (a) => a.sod && !a.override;
  const eligible = (a) => a.value != null && a.value < D().bulkLimit && !blocked(a);
  const onBehalf = (a) => (S.assignee(a) !== S.me() && App.state.role !== 'admin' ? S.assignee(a) : null);
  const chipPrice = (id) => { const m = App.material(id); return m ? `${mid(id)} <span class="small muted">last ${m.last ? vnd(m.last) : '—'} · 90-day ${m.avg90 ? vnd(m.avg90) : '—'}</span>` : mid(id); };
  const nextName = (a) => { const c = D().approvalChains[a.id] || []; const n = c.find((r) => r[1] === 'Next'); return n ? n[0].split(' · ')[0] : null; };

  function queueRows(items) {
    return items.map((a) => {
      const [sl, tone] = slaText(a); const sel = st.sel === a.id; const ok = eligible(a);
      return `<li class="ap-item${sel ? ' sel' : ''}">
        <label class="chk ap-pick"><input type="checkbox" data-ap-pick="${esc(a.id)}"${st.picked.includes(a.id) ? ' checked' : ''}${ok ? '' : ' disabled'} aria-label="Select ${esc(a.id)}${ok ? '' : ' (not eligible for bulk approve)'}"></label>
        <div class="ap-main"><div class="ap-top"><button class="linkish mono" data-ap="open" data-id="${esc(a.id)}"${sel ? ' aria-current="true"' : ''}>${esc(a.id)}</button> ${blocked(a) ? pill('Blocked — SoD', 'danger') : ''}${onBehalf(a) ? ' ' + pill('On behalf of ' + onBehalf(a), 'info') : ''}</div>
          <div class="ap-title">${esc(a.title)}</div><div class="small muted">${esc(a.type)} · ${esc(a.by)} · step ${esc(a.step.replace('Step ', ''))}</div>${a.mats.length ? `<div class="chips">${a.mats.map(chipPrice).join('')}</div>` : ''}</div>
        <div class="ap-side"><div class="num"><b>${a.value != null ? vnd(a.value) : '—'}</b></div>${pill(sl, tone)}<div class="small muted">SLA ${esc(a.sla)}</div><button class="btn btn-sm${sel ? ' btn-p' : ''}" data-ap="open" data-id="${esc(a.id)}" aria-label="Review ${esc(a.id)}">${sel ? 'Reviewing' : 'Review'}</button></div></li>`;
    }).join('');
  }
  function queue(items) {
    const filtered = items.filter((a) => st.type === 'all' || a.type === st.type);
    const picked = st.picked.filter((id) => filtered.some((a) => a.id === id && eligible(a)));
    return card(st.tab === 'mine' ? `Waiting for me (${items.length})` : `Delegated (${items.length})`, `<div class="filters"><label class="sr" for="ap-type">Type</label><select class="inp" id="ap-type" data-apf="type"><option value="all">All types</option>${TYPES.map((t) => `<option${st.type === t ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
      ${filtered.length ? `<ul class="ap-list" aria-label="Approval queue">${queueRows(filtered)}</ul>`
        : st.tab === 'mine' ? App.emptyState('Nothing waiting for you', 'New items appear here and on the badge.') : App.emptyState('No delegated items', D().delegation ? `Delegation to ${D().delegation.to} runs ${D().delegation.from} – ${D().delegation.until}.` : 'No delegation is set.')}
      <div class="row-acts between mt"><span class="small muted">Bulk approve is allowed only for items under ${vnd(D().bulkLimit)} without an SoD block. ${filtered.filter(eligible).length} eligible.</span>
      <button class="btn btn-p btn-sm" data-ap="bulk"${picked.length ? '' : ' disabled'}>Approve selected · under 50.000.000 ₫${picked.length ? ` (${picked.length})` : ''}</button></div>`);
  }

  function history() {
    return card(`History (${D().approvalHistory.length})`, table([
      { h: 'Item', r: (h) => `<span class="mono">${esc(h.id)}</span><div class="small">${esc(h.title)}</div>`, w: 'minmax(200px,2fr)' }, { h: 'Type', k: 'type', w: 'minmax(130px,1.2fr)' },
      { h: 'Decision', r: (h) => pill(h.decision, h.decision === 'Approved' ? 'success' : h.decision === 'Rejected' ? 'danger' : 'warning'), w: '110px' },
      { h: 'By', r: (h) => `${esc(h.by)}${h.onBehalf ? `<div class="small">on behalf of ${esc(h.onBehalf)}</div>` : ''}<div class="small muted">${esc(h.at)}</div>`, w: 'minmax(170px,1.5fr)' },
      { h: 'Comment', r: (h) => esc(h.comment || '—'), w: 'minmax(180px,2fr)' }
    ], D().approvalHistory.slice().reverse(), { min: 900, label: 'Approval history' }));
  }

  /* F-57 detail */
  function detail(a) {
    if (!a) return card('Details', App.emptyState('Choose an item', 'Open an item to see its lines, budget impact and approval chain.'));
    const pr = D().prs[a.id]; const chain = D().approvalChains[a.id] || [];
    const lines = pr ? table([
      { h: 'Material ID', r: (l) => `${mid(l.mat)}<div class="small">${esc(App.material(l.mat).name)}</div>`, w: 'minmax(170px,2fr)' },
      { h: 'Qty', r: (l) => `${num(l.qty)} ${esc(App.material(l.mat).uom)}`, cls: 'num', w: '80px' },
      { h: 'Est. price', r: (l) => vnd(l.price), cls: 'num', w: '140px' },
      { h: 'Last price', r: (l) => { const m = App.material(l.mat); return m.last ? `${vnd(m.last)}<div class="small muted">${esc(m.lastPo)} · ${esc(App.vshort(App.vendor(m.lastVendor)))}</div>` : '—'; }, cls: 'num', w: '170px' },
      { h: '90-day avg', r: (l) => { const m = App.material(l.mat); return m.avg90 ? `${vnd(m.avg90)}<div class="small ${l.price > m.avg90 * 1.05 ? 'tone-warning' : 'muted'}">${l.price >= m.avg90 ? '+' : '−'}${pct(Math.abs(l.price / m.avg90 - 1) * 100)}</div>` : '—'; }, cls: 'num', w: '140px' },
      { h: 'VAT', r: (l) => esc(S.vatLabel(App.material(l.mat).vat)), w: 'minmax(110px,1fr)' }
    ], pr.lines, { min: 860, label: 'Lines by Material ID' }) : a.mats.length ? `<div class="chips">${a.mats.map(chipPrice).join('')}</div>` : '';
    const b = pr && D().budgets[pr.cc]; const avail = b ? b.budget - b.invoiced - b.committed : 0;
    const budget = b ? `<h3 class="h-sub">Budget impact</h3><dl class="dl"><dt>Budget line</dt><dd>${esc(b.name)}</dd><dt>Available</dt><dd>${vnd(avail)}</dd><dt>This item</dt><dd>−${vnd(a.value)}</dd><dt>After approval</dt><dd><b>${vnd(avail - a.value)}</b></dd></dl>` : '';
    const chainHtml = chain.length ? `<h3 class="h-sub">Approval chain</h3><ol class="chain">${chain.map(([who, s, at, c]) => `<li${s === 'Waiting' ? ' class="on"' : ''}><b>${esc(who)}</b>${pill(s, s === 'Approved' || s === 'Submitted' || s === 'Raised' ? 'success' : s === 'Waiting' ? 'info' : /Blocked/.test(s) ? 'danger' : 'neutral')}<span class="small muted">${esc(at)}</span>${c ? `<span class="small">“${esc(c)}”</span>` : ''}</li>`).join('')}</ol>` : '';
    const nx = nextName(a); const [i, n] = stepOf(a);
    const sod = blocked(a) ? `<div class="alert alert-danger" role="alert"><b>Blocked — SoD.</b> You raised this change order, so you cannot approve it. It is routed to Đỗ Hoàng Nam. Only an Admin can override, and the override is logged.</div>
      ${App.state.role === 'admin' ? `<form id="ap-ovr" class="stack" novalidate><div class="field"><label for="ap-ovr-r">Override reason (Admin) *</label><textarea id="ap-ovr-r"${st.oerr ? ' aria-invalid="true" aria-describedby="ap-ovr-e"' : ''}>${esc(st.ovr || '')}</textarea>${st.oerr ? `<span class="err" id="ap-ovr-e" role="alert">${esc(st.oerr)}</span>` : ''}</div><div class="row-acts"><button type="submit" class="btn btn-d btn-sm">Override SoD</button></div></form>` : ''}` : a.override ? `<div class="alert alert-warning" role="status">SoD overridden by ${esc(a.override.by)} · ${esc(a.override.at)}: “${esc(a.override.reason)}” (audit logged)</div>` : '';
    const ob = onBehalf(a);
    const decide = `<form id="ap-form" class="stack decide-panel" novalidate aria-labelledby="ap-dec-h"><h3 id="ap-dec-h" class="h-sub mt-0">Your decision</h3><div class="field"><label for="ap-c">Comment</label><textarea id="ap-c" aria-describedby="ap-c-h${st.cerr ? ' ap-c-e' : ''}"${st.cerr ? ' aria-invalid="true"' : ''}>${esc(st.comment)}</textarea><span class="hint" id="ap-c-h">Optional to approve · required (at least 10 characters) to reject or return.</span>${st.cerr ? `<span class="err" id="ap-c-e" role="alert">${esc(st.cerr)}</span>` : ''}</div>
      <p class="small mt-0">Approving as <b>${esc(S.me())}</b>${ob ? ` on behalf of <b>${esc(ob)}</b>` : ''} · step ${i} of ${n} · next: ${i < n && nx ? esc(nx) : 'final approval'}</p>
      <div class="row-acts decide-acts"><button type="button" class="btn" data-ap="decide" data-d="Returned">Return for changes</button><button type="button" class="btn btn-d" data-ap="decide" data-d="Rejected">Reject</button><button type="button" class="btn btn-p" data-ap="decide" data-d="Approved"${blocked(a) ? ' disabled' : ''}>Approve</button></div></form>`;
    const link = a.type === 'PR approval' ? `<a class="btn btn-sm" href="#/pr/${esc(a.id)}">Open PR</a>` : a.type === 'Award recommendation' ? `<a class="btn btn-sm" href="#/tenders/${esc(a.id)}">Open tender</a>` : a.type === 'New Material ID' ? `<a class="btn btn-sm" href="#/material360?id=${esc(a.id)}">Material 360°</a>` : a.type === 'Vendor change' ? `<a class="btn btn-sm" href="#/vendors/${esc(a.id)}">Open vendor</a>` : '';
    const files = pr && pr.files.length ? `<h3 class="h-sub">Attachments</h3><ul class="plain small">${pr.files.map((f) => `<li>${esc(f.type)} · <span class="mono">${esc(f.name)}</span> ${esc(f.ver)}${f.supplier ? ' ' + pill('Uploaded by supplier', 'info') : ''}</li>`).join('')}</ul>` : '';
    return card(`${a.id} · ${a.type}`, `<p class="mt-0"><b>${esc(a.title)}</b><br><span class="small muted">Requested by ${esc(a.by)} · ${a.value != null ? vnd(a.value) + ' excl. VAT' : 'no value'} · ${esc(a.step)}${a.note ? ' · ' + esc(a.note) : ''}</span></p>
      ${sod}${lines}${budget}${chainHtml}${files}${decide}`, link);
  }

  /* F-59 delegation */
  function delegation() {
    const g = D().delegation;
    if (st.dlg) {
      const f = st.dlg; const e = st.derr; const users = D().users.filter((u) => u.roles.includes('procurement') && u.name !== S.me());
      return card('Delegate approvals', `<form id="ap-dlg" class="stack" novalidate>${S.field('dl', e, 'to', 'Delegate to', f.to, { options: users.map((u) => [u.name, `${u.name} · ${u.title}`]) })}
        <div class="form-grid">${S.field('dl', e, 'from', 'From', f.from, { req: true, ph: 'dd/mm/yyyy' })}${S.field('dl', e, 'until', 'Until', f.until, { req: true, ph: 'dd/mm/yyyy', hint: 'At most 14 days' })}</div>
        ${S.field('dl', e, 'cap', 'Value cap (₫)', f.cap, { mode: 'numeric', hint: 'At most 2.000.000.000 ₫ (your own limit)' })}
        <fieldset class="fs"${e.types ? ' aria-describedby="dl-types-e"' : ''}><legend>Document types</legend>${TYPES.map((t) => `<label class="chk"><input type="checkbox" name="types" value="${esc(t)}"${f.types.includes(t) ? ' checked' : ''}> ${esc(t)}</label>`).join('')}${e.types ? `<span class="err" id="dl-types-e" role="alert">${esc(e.types)}</span>` : ''}</fieldset>
        <div class="row-acts"><button type="button" class="btn btn-sm" data-ap="dlg-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Save delegation</button></div></form>`);
    }
    return card('Delegation', g ? `<dl class="dl"><dt>Delegate</dt><dd>${esc(g.to)}</dd><dt>Period</dt><dd>${esc(g.from)} – ${esc(g.until)} ${pill(S.dlgActive() ? 'Active' : 'Scheduled', S.dlgActive() ? 'success' : 'info')}</dd><dt>Cap</dt><dd>≤ ${vnd(g.cap)}</dd><dt>Types</dt><dd>${g.types.map(esc).join(', ')}</dd><dt>Above cap</dt><dd>Goes to ${esc(g.above)}</dd></dl>
      <p class="small muted">Items the delegate approves show “on behalf of ${esc('Nguyễn Minh Anh')}” in the history. The delegate cannot approve their own requests.</p>
      <div class="row-acts"><button class="btn btn-sm btn-d" data-ap="dlg-del">Cancel delegation</button><button class="btn btn-sm" data-ap="dlg-edit">Edit</button></div>`
      : `${App.emptyState('No delegation', 'Delegate while you are away: up to 14 days, capped value, chosen document types.')}<div class="row-acts"><button class="btn btn-sm btn-p" data-ap="dlg-edit">Delegate approvals</button></div>`);
  }
  function saveDlg(root) {
    const f = Object.assign(st.dlg, S.read(root, '#ap-dlg')); f.types = f.types || []; const e = {};
    if (!f.to || f.to === S.me()) e.to = 'Choose another internal user.';
    if (!S.validDate(f.from)) e.from = 'Use dd/mm/yyyy.'; else if (App.daysTo(f.from) < 0) e.from = 'Start cannot be in the past.';
    if (!S.validDate(f.until)) e.until = 'Use dd/mm/yyyy.';
    else if (!e.from) { const d = Math.round((App.dt(f.until) - App.dt(f.from)) / 864e5) + 1; if (d < 1) e.until = 'Until must be on or after From.'; else if (d > 14) e.until = `Delegation can run at most 14 days (this is ${d}).`; }
    const cap = S.money(f.cap); if (!(cap > 0)) e.cap = 'Enter a cap above 0.'; else if (cap > 2000000000) e.cap = 'The cap cannot exceed 2.000.000.000 ₫.';
    if (!f.types.length) e.types = 'Choose at least one document type.';
    st.derr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#ap-dlg'); return; }
    D().delegation = { to: f.to, from: f.from, until: f.until, cap, types: f.types, above: 'Đỗ Hoàng Nam' }; st.dlg = null; App.render(); App.toast(`Approvals delegated to ${f.to} · ${f.from} – ${f.until}`);
  }

  function sodCard() {
    const log = D().sodLog || [];
    return card('SoD rules', `<ul class="plain small">${D().sodRules.map(([r, a]) => `<li>${esc(r)} ${pill(a, a === 'Block' ? 'danger' : 'warning')}</li>`).join('')}</ul><p class="small muted">Applies to new Material ID requests too. Only an Admin can override; every override is written to the audit log.</p>
      ${log.length ? `<h3 class="h-sub">Overrides</h3><ul class="plain small">${log.map((x) => `<li>${esc(x.at)} · ${esc(x.by)} · ${esc(x.id)} — ${esc(x.reason)}</li>`).join('')}</ul>` : ''}`);
  }

  function decideOne(a, d, comment) {
    const me = S.me(); const ob = onBehalf(a); const [i, n] = stepOf(a); const chain = D().approvalChains[a.id] || [];
    D().approvalHistory.push({ id: a.id, type: a.type, title: a.title, decision: d, by: me, onBehalf: ob, at: NOW, comment });
    const w = chain.find((r) => r[1] === 'Waiting'); if (w) { w[1] = d; w[2] = NOW + (ob ? ` · ${me} on behalf of ${ob}` : ''); w[3] = comment; }
    const doc = S.docOf(a.id);
    if (d === 'Approved' && i < n) {
      const nx = chain.find((r) => r[1] === 'Next'); if (nx) { nx[1] = 'Waiting'; nx[2] = 'Since ' + NOW; }
      a.step = `Step ${i + 1} of ${n}`; a.assignee = nextName(a) || (nx ? nx[0].split(' · ')[0] : 'Đỗ Hoàng Nam');
      if (nx) a.assignee = nx[0].split(' · ')[0];
      return `${a.id} approved · step ${i + 1} of ${n} → ${a.assignee}`;
    }
    D().approvals.splice(D().approvals.indexOf(a), 1);
    if (a.type === 'Award recommendation') {
      const t = D().tenders[a.id];
      if (d === 'Approved') { Object.assign(t.award, { status: 'Approved', approver: me, at: NOW }); doc.status = 'Awarded'; t.step = 6; }
      else { t.award = null; doc.status = 'Evaluation'; }
    } else if (doc && doc.type === 'PR') doc.status = d === 'Approved' ? 'Approved' : d;
    return `${a.id} ${d.toLowerCase()}${ob ? ' on behalf of ' + ob : ''}`;
  }

  App.page('approvals', {
    title: 'My approvals', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p) {
      if (p.id && p.id !== st.lastId) { st.lastId = p.id; st.sel = p.id; st.tab = 'mine'; st.comment = ''; st.cerr = ''; }
      const mine = S.myQueue(); const dlg = D().approvals.filter((a) => S.delegable(a));
      const items = st.tab === 'delegated' ? dlg : mine;
      if (!items.some((a) => a.id === st.sel)) st.sel = items[0] ? items[0].id : null;
      const sel = items.find((a) => a.id === st.sel);
      const dueToday = mine.filter((a) => hoursLeft(a) < 24).length;
      const tabs = [['mine', `Waiting for me (${mine.length})`], ['delegated', `Delegated (${dlg.length})`], ['history', `History (${D().approvalHistory.length})`]];
      return `<div class="page-h"><div><h1>${esc(App.t('My approvals'))}</h1><div class="sub">Approving as ${esc(S.me())}${App.state.role === 'admin' ? ' · Admin view of all pending items' : ''} · SLA 2 working days per step</div></div></div>
        <div class="grid-k">${kpi('Waiting for me', String(mine.length), 'Same as the menu badge')}${kpi('Due within 24 h', String(dueToday), mine.filter((a) => hoursLeft(a) < 24).map((a) => a.id).join(', ') || 'None', dueToday ? 'warning' : '')}${kpi('Blocked — SoD', String(mine.filter(blocked).length), 'Routed to another approver', mine.some(blocked) ? 'danger' : '')}${kpi('Delegation', D().delegation ? esc(D().delegation.to) : 'None', D().delegation ? `${esc(D().delegation.from)} – ${esc(D().delegation.until)}` : 'Not set')}</div>
        <div class="seg" role="group" aria-label="Queue">${tabs.map(([k, l]) => `<button data-ap="tab" data-k="${k}" aria-pressed="${st.tab === k}">${l}</button>`).join('')}</div>
        ${st.tab === 'history' ? history() : `<div class="ap-split">${queue(items)}${detail(sel)}</div>`}<div class="grid">${delegation()}${sodCard()}</div>`;
    },
    mount(root) {
      root.addEventListener('change', (e) => {
        if (e.target.dataset.apf === 'type') { st.type = e.target.value; App.render(); }
        if (e.target.dataset.apPick) { const id = e.target.dataset.apPick; st.picked = e.target.checked ? [...st.picked, id] : st.picked.filter((x) => x !== id); App.render(); const x = document.querySelector(`[data-ap-pick="${id}"]`); x && x.focus(); }
      });
      root.addEventListener('input', (e) => { if (e.target.id === 'ap-c') st.comment = e.target.value; if (e.target.id === 'ap-ovr-r') st.ovr = e.target.value; });
      root.addEventListener('submit', (e) => {
        if (e.target.id === 'ap-dlg') { e.preventDefault(); saveDlg(root); }
        if (e.target.id === 'ap-form') e.preventDefault();
        if (e.target.id === 'ap-ovr') {
          e.preventDefault(); const a = D().approvals.find((x) => x.id === st.sel); const r = (st.ovr || '').trim();
          if (r.length < 10) { st.oerr = 'Give a reason of at least 10 characters.'; App.render(); document.getElementById('ap-ovr-r').focus(); return; }
          a.override = { by: S.me(), at: NOW, reason: r }; (D().sodLog = D().sodLog || []).push({ id: a.id, by: S.me(), at: NOW, reason: r }); st.ovr = null; st.oerr = ''; App.render(); App.toast(`SoD overridden on ${a.id} · audit logged`);
        }
      });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-ap]'); if (!b) return; const k = b.dataset.ap;
        if (k === 'tab') { st.tab = b.dataset.k; st.sel = null; App.render(); }
        else if (k === 'open') { st.sel = b.dataset.id; st.comment = ''; st.cerr = ''; App.render(); const f = document.getElementById('ap-c'); if (f) { f.closest('.card').scrollIntoView({ block: 'start' }); f.focus({ preventScroll: true }); } }
        else if (k === 'decide') {
          const a = D().approvals.find((x) => x.id === st.sel); if (!a) return; const d = b.dataset.d; const c = (st.comment || '').trim();
          if (d !== 'Approved' && c.length < 10) { st.cerr = `A comment of at least 10 characters is required to ${d === 'Rejected' ? 'reject' : 'return'}.`; App.render(); document.getElementById('ap-c').focus(); return; }
          if (d === 'Approved' && blocked(a)) return;
          const msg = decideOne(a, d, c); st.comment = ''; st.cerr = ''; st.sel = null; st.picked = st.picked.filter((x) => x !== a.id); App.render(); App.toast(msg);
        }
        else if (k === 'bulk') {
          const ids = st.picked.filter((id) => { const a = D().approvals.find((x) => x.id === id); return a && eligible(a); });
          ids.forEach((id) => decideOne(D().approvals.find((x) => x.id === id), 'Approved', 'Bulk approved (under 50.000.000 ₫)')); st.picked = []; App.render(); App.toast(`${ids.length} item${ids.length === 1 ? '' : 's'} approved`);
        }
        else if (k === 'dlg-edit') { const g = D().delegation || { to: 'Lê Quốc Huy', from: '10/11/2026', until: '14/11/2026', cap: 500000000, types: ['PR approval', 'PO change order'] }; st.dlg = { to: g.to, from: g.from, until: g.until, cap: num(g.cap), types: g.types.slice() }; st.derr = {}; App.render(); document.getElementById('dl-to').focus(); }
        else if (k === 'dlg-cancel') { st.dlg = null; App.render(); }
        else if (k === 'dlg-del') { D().delegation = null; App.render(); App.toast('Delegation cancelled'); }
      });
    }
  });
})();
