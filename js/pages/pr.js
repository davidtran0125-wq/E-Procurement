/* Module 9 · Purchase requests — F-50 header, F-51 budget check + override step (R-14), F-52 lines by Material ID with VAT split (R-03),
   F-53 sourcing rule per line (contract release / tender > 500tr / RFQ), F-54 approval route preview (R-06, R-18), F-55 typed attachments (R-19).
   Routes: #/pr (?q=), #/pr/new (?mat=), #/pr/<id> */
(function () {
  const { esc, num, pct, vnd, ty, mid, pill, table, kpi, card } = App;
  const S = App.src;
  const D = () => window.DATA;
  const st = { q: '', status: 'all', cur: null, ed: null, errs: {}, up: null, look: null };
  const tones = { Draft: 'neutral', Submitted: 'info', 'Awaiting approval': 'warning', Approved: 'success', 'In tender': 'info', Closed: 'neutral', Rejected: 'danger', Returned: 'warning' };
  const TENDER_MIN = 500000000;
  const DEPTS = ['Phòng Mua hàng', 'Nhà máy Bình Dương', 'Nhà xưởng C2', 'Kho A', 'Kho B'];

  const mat = (id) => App.material(id);
  const lineVal = (l) => (+l.qty || 0) * (+l.price || 0);
  const totals = (lines) => {
    const by = {}; lines.filter((l) => mat(l.mat)).forEach((l) => { const v = mat(l.mat).vat; by[v] = (by[v] || 0) + lineVal(l); });
    const net = Object.values(by).reduce((a, x) => a + x, 0); const vat = Object.entries(by).reduce((a, [r, x]) => a + x * r / 100, 0);
    return { by, net, vat, gross: net + vat };
  };
  const contractFor = (m) => D().contracts.find((c) => c.lines.some((l) => l.mat === m) && ['Active', 'Expiring'].includes((S.docOf(c.id) || {}).status));
  /* F-53: walk the lines in order, consuming the contract's remaining quantity */
  function sourcing(lines) {
    const left = {};
    return lines.map((l) => {
      const m = mat(l.mat); if (!m) return null;
      const c = contractFor(m.id);
      if (c) {
        const commit = c.lines.reduce((a, x) => a + x.commit, 0); const rel = c.lines.reduce((a, x) => a + x.released, 0);
        const before = left[c.id] != null ? left[c.id] : commit - rel; const after = before - (+l.qty || 0); left[c.id] = after;
        if (after >= 0) return { kind: 'contract', c, text: `Release PO from contract ${c.id} · còn ${num(before)} / ${num(commit)} ${m.uom}`, sub: `${num(after)} ${m.uom} left after this line` };
        return { kind: 'tender', text: `Contract ${c.id} has only ${num(before)} ${m.uom} left — tender the rest`, sub: '' };
      }
      return lineVal(l) > TENDER_MIN ? { kind: 'tender', text: 'Tender required, value > 500tr', sub: 'No active contract for this Material ID' } : { kind: 'rfq', text: 'RFQ · 3 quotations (≤ 500tr)', sub: 'No active contract for this Material ID' };
    });
  }
  /* F-54: route by value excl. VAT + extra steps */
  function route(pr, lines) {
    const tot = totals(lines).net; const b = D().budgets[pr.cc]; const avail = b ? b.budget - b.invoiced - b.committed : Infinity;
    const steps = [['Dept head', pr.dept]];
    if (tot > 200000000) steps.push(['Procurement Lead', pr.requester === 'Nguyễn Minh Anh' ? 'Đỗ Hoàng Nam (SoD: requester is the Procurement Lead)' : 'Nguyễn Minh Anh']);
    const capex = lines.some((l) => /^EQP-/.test(l.mat)) && tot > 1000000000;
    if (tot > 2000000000 || capex) steps.push(['Finance Director', 'Đỗ Hoàng Nam' + (tot <= 2000000000 && capex ? ' · capex rule EQP- > 1 tỷ' : '')]);
    if (tot > avail) steps.push(['Budget override', 'Đỗ Hoàng Nam (Finance Director)']);
    const seen = new Set(); steps.forEach((s) => { const n = s[1].split(' (')[0].split(' ·')[0]; if (seen.has(n)) { s[1] += ' — skipped (already approved earlier step)'; s.skip = true; } seen.add(n); });
    const active = steps.filter((s) => !s.skip);
    return { steps, active, n: active.length, tot, over: tot > avail };
  }

  /* ---------- List ---------- */
  function listPage(p) {
    if (p.q != null && p.q !== st.lastQ) { st.q = p.q; st.lastQ = p.q; }
    const all = D().docs.filter((d) => d.type === 'PR'); const q = st.q.trim();
    const rows = all.filter((d) => (st.status === 'all' || d.status === st.status) && (!q || App.matches(`${d.id} ${d.title} ${d.mats.join(' ')} ${d.by} ${d.mats.map((m) => (mat(m) || {}).name).join(' ')}`, q))).sort((a, b) => App.dt(b.date) - App.dt(a.date));
    const statuses = [...new Set(all.map((d) => d.status))];
    return `<div class="page-h"><div><h1>${esc(App.t('Purchase requests'))}</h1><div class="sub">Every PR line is a Material ID · budget-checked and routed by value excl. VAT</div></div>
      <div class="acts"><button class="btn" data-act="toast" data-msg="Exported PR_02-11-2026.xlsx (${rows.length} rows)">Export Excel</button><a class="btn btn-p" href="#/pr/new">${esc(App.t('Create PR'))}</a></div></div>
      <div class="grid-k">${kpi('Open PRs', num(D().kpi.openPr), `${all.filter((d) => d.status !== 'Closed').length} in this sample`)}${kpi('Awaiting approval', num(D().kpi.prAwaiting), `${all.filter((d) => d.status === 'Awaiting approval').length} in this sample`, 'warning')}${kpi('Drafts', String(all.filter((d) => d.status === 'Draft').length), 'This sample')}${kpi('In tender', String(all.filter((d) => d.status === 'In tender').length), 'Value > 500tr, no contract')}</div>
      ${card('Purchase requests', `<div class="filters"><label class="sr" for="pr-q">Search PRs</label><input class="inp grow" id="pr-q" type="search" data-prf="q" value="${esc(st.q)}" placeholder="Search PR, title, Material ID or requester">
        <label class="sr" for="pr-s">Status</label><select class="inp" id="pr-s" data-prf="status"><option value="all">All statuses</option>${statuses.map((s) => `<option${st.status === s ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
        ${table([
          { h: 'PR', r: (d) => `<a class="mono" href="#/pr/${esc(d.id)}">${esc(d.id)}</a><div class="small">${esc(d.title)}</div>`, w: 'minmax(220px,2.2fr)' },
          { h: 'Material IDs', r: (d) => `<span class="chips chips-inline">${d.mats.map(mid).join('')}</span>`, w: 'minmax(170px,1.8fr)' },
          { h: 'Value excl. VAT', r: (d) => vnd(d.value), cls: 'num', w: '150px' },
          { h: 'Requester', r: (d) => `${esc(d.by)}<div class="small muted">${esc(d.date)}</div>`, w: 'minmax(140px,1.2fr)' },
          { h: 'Status', r: (d) => `${pill(d.status, tones[d.status] || 'neutral')}${d.next ? `<div class="small">${S.tndLink(d.next)}</div>` : ''}`, w: 'minmax(140px,1.2fr)' }
        ], rows, { min: 860, empty: 'No PRs match these filters', label: 'Purchase requests' })}`)}`;
  }

  /* ---------- Editor (create / draft) ---------- */
  function startEdit(id, p) {
    if (id && D().prs[id]) { const pr = D().prs[id]; st.ed = { id, f: { requester: pr.requester, dept: pr.dept, project: pr.project, cc: pr.cc, cat: pr.cat, need: pr.need, site: pr.site, reason: pr.reason, override: pr.override || '' }, lines: pr.lines.map((l) => ({ ...l, q: l.mat })), files: pr.files.slice(), saved: pr.saved }; }
    else {
      const m = p.mat && mat(p.mat);
      st.ed = { id: null, f: { requester: S.me(), dept: 'Phòng Mua hàng', project: '', cc: 'KHOB-VLXD', cat: m ? m.cat : 'CON', need: '', site: '', reason: '', override: '' }, lines: [m ? { mat: m.id, q: m.id, qty: '', price: m.last || m.avg90 || '' } : { mat: '', q: '', qty: '', price: '' }], files: [], saved: null };
    }
    st.errs = {}; st.up = null; st.look = null;
  }
  const sugg = (q) => (q.trim().length < 2 ? [] : D().materials.filter((m) => m.status === 'Active' && App.matches(`${m.id} ${m.name} ${m.en} ${m.group}`, q)).slice(0, 6));
  const suggHtml = (i, q) => { const s = sugg(q); return s.length ? s.map((m) => `<li role="option" tabindex="-1" data-pick="${esc(m.id)}" data-i="${i}"><span class="mono small">${esc(m.id)}</span> ${esc(m.name)} <span class="small muted">· ${esc(m.uom)} · VAT ${m.vat}%</span></li>`).join('') : (q.trim().length >= 2 ? '<li class="small muted" role="presentation">No active Material ID matches · <a href="#/materials">Request a new Material ID</a></li>' : ''); };

  function editor() {
    const E = st.ed; const f = E.f; const e = st.errs; const id = E.id || 'New PR';
    const pr = { ...f }; const lines = E.lines; const tt = totals(lines); const src = sourcing(lines); const R = route(pr, lines.filter((l) => mat(l.mat)));
    const b = D().budgets[f.cc]; const avail = b ? b.budget - b.invoiced - b.committed : 0; const left = avail - tt.net;
    const lineRows = lines.map((l, i) => {
      const m = mat(l.mat); const s = src[i]; const err = e['l' + i];
      return `<div class="tr pr-cols" role="row">
        <div class="td" role="cell"><div class="look"><label class="sr" for="pl-m${i}">Material ID for line ${i + 1}</label><input class="inp w-full" id="pl-m${i}" data-pl="q" data-i="${i}" value="${esc(l.q || l.mat)}" placeholder="Type a Material ID or name" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="pl-s${i}"${err && err.mat ? ` aria-invalid="true" aria-describedby="pl-e${i}"` : ''}>
          <ul class="look-l" id="pl-s${i}" role="listbox" aria-label="Material ID suggestions"></ul></div>
          ${m ? `<div class="small mt-s">${mid(m.id)} ${esc(m.name)}</div>` : ''}${err ? `<div class="err small" id="pl-e${i}" role="alert">${esc(err.mat || err.qty)}</div>` : ''}</div>
        <div class="td num" role="cell"><label class="sr" for="pl-q${i}">Quantity line ${i + 1}</label><input class="inp inp-num w-full" id="pl-q${i}" data-pl="qty" data-i="${i}" inputmode="decimal" value="${esc(l.qty)}"${err && err.qty ? ' aria-invalid="true"' : ''}> <span class="small muted">${esc(m ? m.uom : '')}</span></div>
        <div class="td num" role="cell"><label class="sr" for="pl-p${i}">Unit price line ${i + 1}</label><input class="inp inp-num w-full" id="pl-p${i}" data-pl="price" data-i="${i}" inputmode="numeric" value="${esc(l.price === '' ? '' : num(l.price))}">${m && m.lastPo ? `<div class="small muted">Last ${esc(m.lastPo)}</div>` : ''}</div>
        <div class="td" role="cell">${m ? esc(S.vatLabel(m.vat)) : '—'}</div>
        <div class="td num" role="cell">${m ? vnd(lineVal(l)) : '—'}</div>
        <div class="td" role="cell">${s ? `${pill(s.kind === 'contract' ? 'Contract' : s.kind === 'tender' ? 'Tender' : 'RFQ', s.kind === 'contract' ? 'success' : s.kind === 'tender' ? 'warning' : 'info')}<div class="small">${s.kind === 'contract' ? `<a href="#/contracts/${esc(s.c.id)}">${esc(s.text)}</a>` : esc(s.text)}</div>${s.sub ? `<div class="small muted">${esc(s.sub)}</div>` : ''}` : '—'}</div>
        <div class="td" role="cell"><button type="button" class="btn btn-sm" data-pr="del-line" data-i="${i}" aria-label="Remove line ${i + 1}">Remove</button></div></div>`;
    }).join('');
    const linesTbl = `<div class="tbl-wrap" tabindex="0" role="region" aria-label="PR lines, scrolls horizontally"><div class="tbl tbl-1100" role="table"><div class="tr thead pr-cols" role="row"><div class="th">Material ID</div><div class="th num">Qty</div><div class="th num">Unit price excl. VAT</div><div class="th">VAT</div><div class="th num">Amount excl. VAT</div><div class="th">Sourcing</div><div class="th"></div></div>${lineRows}</div></div>`;
    const totalsHtml = `<dl class="dl mt">${Object.entries(tt.by).sort((a, b2) => b2[0] - a[0]).map(([r, x]) => `<dt>VAT ${esc(S.vatLabel(r))} on</dt><dd>${vnd(x)} + VAT ${vnd(x * r / 100)}</dd>`).join('')}<dt>Total excl. VAT</dt><dd><b>${vnd(tt.net)}</b></dd><dt>VAT</dt><dd>${vnd(tt.vat)}</dd><dt>Total incl. VAT</dt><dd><b>${vnd(tt.gross)}</b></dd></dl>`;
    const segs = b ? [['Invoiced', b.invoiced, ''], ['Committed', b.committed, 'warn'], ['This PR', Math.min(tt.net, Math.max(avail, 0)), 'pr'], ['Remaining', Math.max(left, 0), 'rest']] : [];
    const budget = b ? card('Budget check', `<p class="small muted mt-0">${esc(b.name)} · line mapped from the Material ID group</p>
      <div class="stack-bar" role="img" aria-label="Budget ${ty(b.budget)}: invoiced ${ty(b.invoiced)}, committed ${ty(b.committed)}, this PR ${ty(tt.net)}, remaining ${ty(left)}">${segs.map(([l, v, c]) => `<span class="sb-${c || 'inv'}" style="width:${(v / b.budget * 100).toFixed(2)}%"></span>`).join('')}</div>
      <dl class="dl dl-num mt"><dt>Budget</dt><dd>${vnd(b.budget)}</dd><dt><span class="sw sb-inv" aria-hidden="true"></span>Invoiced</dt><dd>${vnd(b.invoiced)}</dd><dt><span class="sw sb-warn" aria-hidden="true"></span>Committed (open POs)</dt><dd>${vnd(b.committed)}</dd><dt>Available</dt><dd><b>${vnd(avail)}</b></dd><dt><span class="sw sb-pr" aria-hidden="true"></span>This PR</dt><dd>−${vnd(tt.net)}</dd>
        <dt class="tot">${left < 0 ? '' : '<span class="sw sb-rest" aria-hidden="true"></span>'}After this PR</dt><dd class="tot"><b class="${left < 0 ? 'tone-danger' : ''}">${left < 0 ? '−' : ''}${vnd(Math.abs(left))}</b> (${pct(left / b.budget * 100)})</dd></dl>
      ${left < 0 ? `<div class="alert alert-danger" role="alert">Over budget by ${vnd(-left)}. A <b>Budget override</b> step for the Finance Director is added to the route.</div>${S.field('pr', e, 'override', 'Override justification', f.override, { area: true, req: true, hint: 'Sent to the Finance Director with the PR' })}` : '<p class="small muted">Available = Budget − Invoiced − Committed.</p>'}`) : '';
    const routeCard = card('Approval route preview', `<ol class="chain">${R.steps.map((x) => `<li><span class="small muted">${x.skip ? 'Skipped' : `Step ${R.active.indexOf(x) + 1} of ${R.n}`}</span><b>${esc(x[0])}</b><span class="small">${esc(x[1])}</span>${x.skip ? '' : '<span class="small muted">SLA 2 working days</span>'}</li>`).join('')}</ol>
      <ul class="plain small"><li${R.tot <= 200000000 ? ' class="tone-success"' : ''}>≤ 200.000.000 ₫ — Dept head</li><li>≤ 2.000.000.000 ₫ — + Procurement Lead</li><li>> 2.000.000.000 ₫ — + Finance Director</li><li>EQP- capex above 1 tỷ ₫ adds the Finance Director · over budget adds Budget override</li></ul>
      <p class="small muted">Route for ${vnd(R.tot)} excl. VAT. SoD: the requester cannot approve their own PR; an approver who already approved a step is skipped.</p>`);
    const prMats = [...new Set(lines.filter((l) => mat(l.mat)).map((l) => l.mat))];
    const form = card(`Request · ${id}`, `<form id="pr-form" class="stack" novalidate>
      ${e._ ? `<div class="alert alert-danger" role="alert">${esc(e._)}</div>` : ''}
      <div class="form-grid">${S.field('pr', e, 'requester', 'Requester', f.requester, { dis: true })}${S.field('pr', e, 'dept', 'Department', f.dept, { options: DEPTS })}
        ${S.field('pr', e, 'project', 'Project', f.project, { req: true })}${S.field('pr', e, 'cc', 'Cost centre / budget line', f.cc, { options: Object.entries(D().budgets).map(([k, v]) => [k, `${k} · ${v.name}`]) })}
        ${S.field('pr', e, 'cat', 'Category', f.cat, { options: D().categories.map((c) => [c.code, c.name]) })}${S.field('pr', e, 'need', 'Needed by', f.need, { req: true, ph: 'dd/mm/yyyy' })}
        ${S.field('pr', e, 'site', 'Delivery location', f.site, { req: true })}${S.field('pr', e, 'reason', 'Justification', f.reason, { area: true, req: true })}</div>
      <h3 class="h-sub">Lines (${lines.length})</h3>${linesTbl}
      <div class="row-acts start mt"><button type="button" class="btn btn-sm" data-pr="add-line">Add line</button><button type="button" class="btn btn-sm" data-act="toast" data-msg="Import BOQ: map the Material ID column of your Excel file">Import BOQ</button><a class="btn btn-sm" href="#/materials">Request a new Material ID</a></div>
      ${totalsHtml}
      <p class="small muted">${E.saved ? `Last saved ${esc(E.saved)}` : 'Not saved yet'} · unit prices default to the last PO price of the Material ID · totals split by VAT rate.</p>
      <div class="row-acts"><a class="btn" href="#/pr">Cancel</a><button type="button" class="btn" data-pr="save">Save draft</button><button type="submit" class="btn btn-p">Submit for approval</button></div></form>`);
    const head = `<div class="page-h"><div><div class="crumbs small muted"><a href="#/pr">Purchase requests</a> / ${esc(id)}</div><h1>${E.id ? `<span class="mono">${esc(E.id)}</span> ${esc((S.docOf(E.id) || {}).title || '')}` : esc(App.t('Create PR'))}</h1>
      <div class="sub">${E.id ? pill((S.docOf(E.id) || {}).status || 'Draft', tones[(S.docOf(E.id) || {}).status] || 'neutral') + ' · ' : ''}${esc(f.requester)} · ${esc(f.dept)}</div></div></div>`;
    const ret = E.id && (S.docOf(E.id) || {}).status === 'Returned' ? D().approvalHistory.filter((h) => h.id === E.id).pop() : null;
    const retHtml = ret ? `<div class="alert alert-warning" role="status"><b>Returned for changes by ${esc(ret.by)} · ${esc(ret.at)}:</b> “${esc(ret.comment)}” Edit the request and submit it again.</div>` : '';
    return `${head}${retHtml}<div class="grid-2"><div class="stack">${form}${S.files('prf', E.files, prMats, st.up, ['Specification / drawing', 'BOQ', 'Quotation', 'Other'])}</div><div class="stack">${budget}${routeCard}</div></div>`;
  }

  function readEd(root) {
    Object.assign(st.ed.f, S.read(root, '#pr-form .form-grid'));
    const ov = root.querySelector('#pr-override'); if (ov) st.ed.f.override = ov.value.trim();
    root.querySelectorAll('[data-pl]').forEach((el) => { const l = st.ed.lines[+el.dataset.i]; const k = el.dataset.pl; if (k === 'q') l.q = el.value; else if (k === 'qty') l.qty = el.value.replace(',', '.'); else l.price = el.value === '' ? '' : S.money(el.value); });
  }
  function save(root, submit) {
    readEd(root); const E = st.ed; const f = E.f; const e = {};
    E.lines.forEach((l, i) => {
      if (!l.mat && !(l.q || '').trim() && !l.qty) { e['l' + i] = { mat: 'Empty line — remove it or choose a Material ID.' }; return; }
      if (!mat(l.mat) || (l.q && l.q !== l.mat)) e['l' + i] = { mat: 'Choose a Material ID from the suggestions.' };
      else if (!(+l.qty > 0)) e['l' + i] = { qty: 'Enter a quantity above 0.' };
      else if (!(+l.price > 0)) e['l' + i] = { qty: 'Enter a unit price above 0.' };
    });
    if (!E.lines.length) e._ = 'Add at least one line.';
    if (submit) {
      if (!f.project) e.project = 'Enter the project.'; if (!f.site) e.site = 'Enter the delivery location.'; if ((f.reason || '').length < 10) e.reason = 'Give a justification of at least 10 characters.';
      if (!S.validDate(f.need)) e.need = 'Use dd/mm/yyyy.'; else if (App.daysTo(f.need) <= 0) e.need = 'Needed-by date must be after today.';
      const b = D().budgets[f.cc]; if (b && totals(E.lines).net > b.budget - b.invoiced - b.committed && (f.override || '').length < 20) e.override = 'Over budget: justify the override (at least 20 characters).';
    }
    st.errs = e; if (Object.keys(e).length) { App.render(); if (Object.keys(e).length === 1 && e.override) { const o = document.getElementById('pr-override'); o.focus(); o.scrollIntoView({ block: 'center' }); } else S.focusErr('#pr-form'); return; }
    const lines = E.lines.map((l) => ({ mat: l.mat, qty: +l.qty, price: +l.price })); const net = totals(lines).net;
    let id = E.id;
    if (!id) {
      const n = Math.max(...D().docs.filter((d) => d.type === 'PR').map((d) => +d.id.slice(8))) + 1; id = 'PR-2026-' + String(n).padStart(4, '0');
      D().docs.push({ id, type: 'PR', title: f.project, date: D().today, status: 'Draft', mats: [], value: 0, by: f.requester });
    }
    const d = S.docOf(id); Object.assign(d, { mats: [...new Set(lines.map((l) => l.mat))], value: net, title: d.title || f.project });
    D().prs[id] = Object.assign(D().prs[id] || {}, { ...f, lines, files: E.files, saved: D().today + ' 10:30' });
    const R = route(f, lines);
    const go = () => { const h = '#/pr/' + id; if (location.hash === h) App.render(); else location.hash = h; };
    if (submit) {
      d.status = 'Awaiting approval'; delete d.returned;
      D().approvals = D().approvals.filter((x) => x.id !== id);
      const first = R.active[0];
      D().approvals.push({ id, type: 'PR approval', title: d.title, mats: d.mats, value: net, by: f.requester, step: 'Step 1 of ' + R.n, sla: App.addDays(D().today, 2) + ' 17:00', assignee: first[1].split(' (')[0].split(' ·')[0] });
      D().approvalChains[id] = [[f.requester + ' · Requester', 'Submitted', D().today + ' 10:30', f.override || '']].concat(R.active.map(([s, who], k) => [who.split(' (')[0].split(' ·')[0] + ' · ' + s, k ? 'Next' : 'Waiting', '', '']));
      st.ed = null; go(); App.toast(`${id} submitted · step 1 of ${R.n}: ${first[0]} · SLA 2 working days`);
    }
    else { d.status = 'Draft'; st.ed.saved = D().today + ' 10:30'; if (!E.id) { st.ed = null; go(); } else App.render(); App.toast(`${id} saved as draft`); }
  }

  /* ---------- Read-only view ---------- */
  function view(d) {
    const pr = D().prs[d.id];
    if (!pr) return `<div class="page-h"><div><div class="crumbs small muted"><a href="#/pr">Purchase requests</a> / ${esc(d.id)}</div><h1><span class="mono">${esc(d.id)}</span> ${esc(d.title)}</h1><div class="sub">${pill(d.status, tones[d.status] || 'neutral')}</div></div></div>${card('Summary', `<dl class="dl"><dt>Material IDs</dt><dd>${d.mats.map(mid).join(' ')}</dd><dt>Value</dt><dd>${vnd(d.value)} excl. VAT</dd><dt>Requester</dt><dd>${esc(d.by)}</dd></dl>`)}`;
    const tt = totals(pr.lines); const src = sourcing(pr.lines); const R = route(pr, pr.lines); const b = D().budgets[pr.cc];
    const appr = D().approvals.find((a) => a.id === d.id);
    return `<div class="page-h"><div><div class="crumbs small muted"><a href="#/pr">Purchase requests</a> / ${esc(d.id)}</div><h1><span class="mono">${esc(d.id)}</span> ${esc(d.title)}</h1>
      <div class="sub">${pill(d.status, tones[d.status] || 'neutral')} · ${esc(pr.requester)} · ${esc(pr.dept)} · needed by ${esc(pr.need)}</div></div>
      <div class="acts">${appr ? `<a class="btn" href="#/approvals?id=${esc(d.id)}">Open in My approvals</a>` : ''}${d.next ? `<a class="btn" href="#/tenders/${esc(d.next)}">Open ${esc(d.next)}</a>` : ''}${d.status === 'Approved' ? `<a class="btn btn-p" href="#/tenders/new?pr=${esc(d.id)}">Create tender</a>` : ''}</div></div>
      <div class="grid-k">${kpi('Total excl. VAT', ty(tt.net), vnd(tt.net))}${kpi('VAT', vnd(tt.vat), Object.keys(tt.by).map((r) => r + '%').join(' + '))}${kpi('Lines', String(pr.lines.length), [...new Set(pr.lines.map((l) => l.mat.slice(0, 3)))].join(', '))}${kpi('Approval steps', String(R.n), R.over ? 'Includes budget override' : 'SLA 2 working days each', R.over ? 'danger' : '')}</div>
      <div class="grid-2"><div class="stack">${card('Lines by Material ID', table([
        { h: 'Material ID', r: (l) => `${mid(l.mat)}<div class="small">${esc(mat(l.mat).name)}</div>`, w: 'minmax(180px,2fr)' }, { h: 'Qty', r: (l) => `${num(l.qty)} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '100px' },
        { h: 'Unit price excl. VAT', r: (l) => vnd(l.price), cls: 'num', w: '150px' }, { h: 'VAT', r: (l) => esc(S.vatLabel(mat(l.mat).vat)), w: 'minmax(120px,1.2fr)' }, { h: 'Amount', r: (l) => vnd(lineVal(l)), cls: 'num', w: '150px' },
        { h: 'Sourcing', r: (l) => { const s = src[pr.lines.indexOf(l)]; return `${esc(s.text)}${s.sub ? `<div class="small muted">${esc(s.sub)}</div>` : ''}`; }, w: 'minmax(200px,2fr)' }
      ], pr.lines, { min: 960, label: 'PR lines' }) + `<p class="small">${Object.entries(tt.by).map(([r, x]) => `VAT ${esc(S.vatLabel(r))} on ${vnd(x)}`).join(' · ')} · total incl. VAT <b>${vnd(tt.gross)}</b></p>`)}
        ${card('Request', `<dl class="dl"><dt>Project</dt><dd>${esc(pr.project)}</dd><dt>Cost centre</dt><dd>${esc(pr.cc)}${b ? ' · ' + esc(b.name) : ''}</dd><dt>Delivery</dt><dd>${esc(pr.site)}</dd><dt>Justification</dt><dd>${esc(pr.reason)}</dd><dt>Last saved</dt><dd>${esc(pr.saved)}</dd></dl>`)}
        ${S.files('prf', pr.files, d.mats, st.up, ['Specification / drawing', 'BOQ', 'Quotation', 'Other'])}</div>
      <div class="stack">${card('Approval route', `<ol class="chain">${R.steps.map((x) => `<li><span class="small muted">${x.skip ? 'Skipped' : `Step ${R.active.indexOf(x) + 1} of ${R.n}`}</span><b>${esc(x[0])}</b><span class="small">${esc(x[1])}</span></li>`).join('')}</ol>`)}
        ${b ? card('Budget', `<dl class="dl"><dt>Budget</dt><dd>${vnd(b.budget)}</dd><dt>Invoiced</dt><dd>${vnd(b.invoiced)}</dd><dt>Committed</dt><dd>${vnd(b.committed)}</dd><dt>Available</dt><dd>${vnd(b.budget - b.invoiced - b.committed)}</dd></dl>`) : ''}</div></div>`;
  }

  App.page('pr', {
    title: 'Purchase requests', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, sub) {
      const key = (sub || (p.mat ? 'new' : 'list')) + (p.mat ? '?' + p.mat : '');
      if (st.cur !== key) { st.cur = key; st.ed = null; st.errs = {}; st.up = null; }
      if (sub === 'new' || (!sub && p.mat)) { if (!st.ed) startEdit(null, p); return editor(); }
      if (sub) {
        const d = D().docs.find((x) => x.type === 'PR' && x.id === sub);
        if (!d) return App.errorState(`Purchase request ${sub} was not found.`, ' <a href="#/pr">Back to purchase requests</a>');
        if (['Draft', 'Returned'].includes(d.status) && D().prs[d.id]) { if (!st.ed) startEdit(d.id, p); return editor(); }
        return view(d);
      }
      return listPage(p);
    },
    mount(root) {
      const box = (i) => root.querySelector('#pl-s' + i);
      root.addEventListener('input', (e) => {
        if (e.target.dataset.prf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('pr-q'); i.focus(); i.setSelectionRange(pos, pos); return; }
        if (e.target.dataset.pl === 'q') { const i = +e.target.dataset.i; st.ed.lines[i].q = e.target.value; const ul = box(i); ul.innerHTML = suggHtml(i, e.target.value); e.target.setAttribute('aria-expanded', String(!!ul.children.length)); }
      });
      root.addEventListener('mousedown', (e) => { if (e.target.closest('button[type=submit], [data-pr=save]')) st.hold = true; });
      root.addEventListener('change', (e) => {
        if (e.target.dataset.prf === 'status') { st.status = e.target.value; App.render(); return; }
        if (!st.ed) return;
        if (e.target.dataset.pl === 'qty' || e.target.dataset.pl === 'price' || e.target.name === 'cc') { const id = e.target.id; readEd(root); if (st.hold) { st.hold = false; return; } App.render(); const x = document.getElementById(id); x && x.focus(); }
      });
      root.addEventListener('keydown', (e) => {
        if (e.target.dataset.pl === 'q' && e.key === 'ArrowDown') { const f = box(+e.target.dataset.i).querySelector('[data-pick]'); if (f) { e.preventDefault(); f.focus(); } }
        else if (e.target.dataset.pick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.click(); }
        else if (e.target.dataset.pick && e.key === 'ArrowDown' && e.target.nextElementSibling) { e.preventDefault(); e.target.nextElementSibling.focus(); }
        else if (e.target.dataset.pick && e.key === 'ArrowUp') { e.preventDefault(); (e.target.previousElementSibling || root.querySelector('#pl-m' + e.target.dataset.i)).focus(); }
        else if (e.key === 'Escape' && e.target.closest('.look')) { const ul = e.target.closest('.look').querySelector('ul'); ul.innerHTML = ''; root.querySelector('#pl-m' + ul.id.slice(4)).focus(); }
      });
      root.addEventListener('submit', (e) => {
        if (e.target.id === 'pr-form') { e.preventDefault(); st.hold = false; save(root, true); }
        if (e.target.id === 'prf-up') { e.preventDefault(); const list = st.ed ? st.ed.files : D().prs[st.cur].files; if (st.ed) readEd(root); st.up = S.upload(root, 'prf', list); App.render(); }
      });
      root.addEventListener('click', (e) => {
        const pk = e.target.closest('[data-pick]');
        if (pk) { readEd(root); const i = +pk.dataset.i; const m = mat(pk.dataset.pick); Object.assign(st.ed.lines[i], { mat: m.id, q: m.id, price: m.last || m.avg90 || '' }); if (st.errs['l' + i]) delete st.errs['l' + i]; App.render(); const q = document.getElementById('pl-q' + i); q && q.focus(); return; }
        const b = e.target.closest('[data-pr], [data-files]'); if (!b) return;
        if (b.dataset.files === 'open') { if (st.ed) readEd(root); st.up = { errs: {} }; App.render(); const x = document.getElementById('prf-up-name'); x && x.focus(); return; }
        if (b.dataset.files === 'cancel') { st.up = null; App.render(); return; }
        const a = b.dataset.pr;
        if (a === 'add-line') { readEd(root); st.ed.lines.push({ mat: '', q: '', qty: '', price: '' }); App.render(); const x = document.getElementById('pl-m' + (st.ed.lines.length - 1)); x && x.focus(); }
        else if (a === 'del-line') { readEd(root); st.ed.lines.splice(+b.dataset.i, 1); st.errs = {}; App.render(); }
        else if (a === 'save') { st.hold = false; save(root, false); }
      });
    }
  });
})();
