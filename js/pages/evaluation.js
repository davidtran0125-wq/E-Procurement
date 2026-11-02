/* Module 5 · Vendor evaluation — F-27 criteria templates & grade thresholds (auto sources: NCR rate, OTIF by accepted qty — R-07),
   F-28 scorecard (weighted score = Σ score × weight), F-29 periods & progress. Route: #/evaluation (?vendor=V-1001) */
(function () {
  const { esc, num, pill, table, kpi, card } = App;
  const D = () => window.DATA;
  const SOURCES = ['Auto · NCR rate & accepted qty', 'Auto · PO deliveries (in full = accepted qty)', 'Auto · price by Material ID vs 90-day average', 'Auto · tender response time', 'Manual'];
  const st = { tab: 'scorecards', period: 'Q3/2026', vendor: 'V-1001', draft: null, errs: {}, tpl: 'TPL-CON', tdraft: null, terrs: [] };
  const tpl = (id) => D().evalTemplates.find((t) => t.id === id);
  const sTone = (s) => ({ Submitted: 'success', Draft: 'warning', 'Not started': 'neutral' }[s] || 'neutral');
  const gradeOf = (x) => (x == null ? null : D().grades.find((g) => Math.round(x * 100) / 100 >= g[1]));
  const total = (t, scores) => t.criteria.reduce((a, c, i) => a + (scores[i] != null && scores[i] !== '' ? +scores[i] : 0) * c.w / 100, 0);
  const complete = (scores) => scores.every((x) => x != null && x !== '');
  const isAuto = (c) => c.src.startsWith('Auto');
  const tplFor = (v) => (/Equipment/.test(v.cat) ? 'TPL-EQP' : /Services|Logistics/.test(v.cat) ? 'TPL-SRV' : 'TPL-CON');
  const me = () => (App.state.user && App.state.user.name) || 'Nguyễn Minh Anh';

  function startCard(v) {
    const t = tpl(tplFor(v)); const otifS = v.otif != null ? Math.max(1, Math.min(5, Math.round(((v.otif - 75) / 5) * 10) / 10)) : 3.5;
    const auto = { 'Auto · NCR rate & accepted qty': 4.0, 'Auto · PO deliveries (in full = accepted qty)': otifS, 'Auto · price by Material ID vs 90-day average': 3.8, 'Auto · tender response time': 3.5 };
    const sc = { vendor: v.id, tpl: t.id, period: st.period, status: 'Not started', scores: t.criteria.map((c) => (isAuto(c) ? auto[c.src] : null)), by: me(), prev: v.score, basis: 'Calculated from POs, GRNs, NCRs and bids in the period',
      evidence: t.criteria.map((c) => (c.src.includes('deliveries') && v.otif != null ? `OTIF ${num(v.otif, 1)}% by accepted qty` : '')), comment: '' };
    D().scorecards.push(sc); return sc;
  }

  /* ---------- Scorecards (F-28, F-29) ---------- */
  function progress() {
    const cur = st.period === 'Q3/2026';
    const rows = cur ? D().scorecards : Object.entries(D().scoreHistory).map(([vid, h]) => ({ vendor: vid, h: h.find((x) => x[0] === st.period) })).filter((x) => x.h).map((x) => ({ vendor: x.vendor, status: 'Submitted', fixed: x.h[1], tpl: tplFor(App.vendor(x.vendor)) }));
    const cnt = (s) => rows.filter((r) => r.status === s).length;
    return card(`Progress · ${st.period}`, `<p class="small muted mt-0">${cnt('Submitted')} submitted · ${cnt('Draft')} draft · ${cnt('Not started')} not started${cur ? ' · due 15/11/2026' : ''}</p>` + table([
      { h: 'Vendor', r: (s) => `<a href="#/vendors/${esc(s.vendor)}"><span class="mono small">${esc(s.vendor)}</span> ${esc(App.vshort(App.vendor(s.vendor)))}</a>`, w: 'minmax(170px,2fr)' },
      { h: 'Template', r: (s) => esc(tpl(s.tpl).name), w: 'minmax(130px,1.4fr)' },
      { h: 'Score', r: (s) => { const x = s.fixed != null ? s.fixed : s.status === 'Not started' ? null : total(tpl(s.tpl), s.scores); return x == null ? '—' : `${num(x, 2)} · ${gradeOf(x)[0]}`; }, cls: 'num', w: '100px' },
      { h: 'Status', r: (s) => pill(s.status, sTone(s.status)), w: '120px' },
      { h: '', r: (s) => `<button class="btn btn-sm" data-ev="open" data-id="${esc(s.vendor)}">${s.status === 'Submitted' ? 'View' : s.status === 'Draft' ? 'Continue' : 'Evaluate'}</button>`, w: '100px' }
    ], rows, { min: 640, empty: 'No scorecards in this period', label: 'Scorecard progress' }));
  }

  function scoreInput(c, i, sc, locked) {
    const val = st.draft[i]; const err = st.errs['s' + i];
    if (isAuto(c) || locked) return `<b>${val == null || val === '' ? '—' : num(+val, 1)}</b>${isAuto(c) ? ' <span class="small muted">auto</span>' : ''}`;
    return `<input class="inp inp-score" aria-label="Score for ${esc(c.name)} (0–5)" id="ev-s${i}" data-ev-score="${i}" type="number" min="0" max="5" step="0.1" value="${val == null ? '' : esc(val)}"${err ? ' aria-invalid="true" aria-describedby="ev-s' + i + '-e"' : ''}>${err ? `<div class="err small" id="ev-s${i}-e" role="alert">${esc(err)}</div>` : ''}`;
  }
  function scorecard() {
    const v = App.vendor(st.vendor);
    if (!v) return card('Scorecard', App.emptyState('Choose a vendor', 'Open a scorecard from the progress list.'));
    if (st.period !== 'Q3/2026') { const h = (D().scoreHistory[v.id] || []).find((x) => x[0] === st.period); return card(`Scorecard · ${v.id} · ${st.period}`, h ? `<p>Submitted score <b>${num(h[1], 2)} · ${gradeOf(h[1])[0]}</b>. Criterion detail is archived; open History for the trend.</p>` : App.emptyState('No scorecard for this period')); }
    const sc = D().scorecards.find((s) => s.vendor === v.id && s.period === st.period);
    if (!sc) return card(`Scorecard · ${v.id}`, App.emptyState(`${v.name} has no scorecard in ${st.period}`, 'Start one: auto criteria are filled from POs, GRNs (accepted qty), NCRs and bids.', `<button class="btn btn-p btn-sm" data-ev="start" data-id="${esc(v.id)}">Start scorecard</button>`));
    const t = tpl(sc.tpl); const locked = sc.status === 'Submitted';
    if (!st.draft || st.draftFor !== v.id) { st.draft = sc.scores.slice(); st.comment = sc.comment; st.draftFor = v.id; }
    const tot = total(t, st.draft); const g = gradeOf(tot);
    return card(`Scorecard · ${v.name}`, `<p class="small muted mt-0"><span class="mono">${esc(v.id)}</span> · ${esc(t.name)} template · ${esc(st.period)} · basis: ${esc(sc.basis)} · evaluator ${esc(sc.by)} ${pill(sc.status, sTone(sc.status))}</p>
      <form id="ev-form" novalidate class="stack">${table([
        { h: 'Criterion', r: (c) => `<b>${esc(c.name)}</b><div class="small muted">${esc(c.src)}</div>`, w: 'minmax(200px,2fr)' },
        { h: 'Weight', r: (c) => num(c.w) + '%', cls: 'num', w: '80px' },
        { h: 'Basis', r: (c) => esc(sc.evidence[t.criteria.indexOf(c)] || (isAuto(c) ? '' : 'Evaluator judgement')), w: 'minmax(200px,2fr)' },
        { h: 'Score (0–5)', r: (c) => scoreInput(c, t.criteria.indexOf(c), sc, locked), w: '130px' },
        { h: 'Weighted', r: (c) => { const x = st.draft[t.criteria.indexOf(c)]; return `<span data-ev-w="${t.criteria.indexOf(c)}">${x == null || x === '' ? '—' : num(+x * c.w / 100, 3)}</span>`; }, cls: 'num', w: '100px' }
      ], t.criteria, { min: 860, label: 'Scorecard criteria' })}
        <div class="alert ${complete(st.draft) ? (g[0] === 'A' ? 'alert-success' : g[0] === 'B' ? 'alert-info' : 'alert-warning') : 'alert-info'}" id="ev-total" role="status" aria-live="polite">${totalText(tot, g, sc)}</div>
        <div class="field"><label for="ev-comment">Evaluator comment${locked ? '' : ' *'}</label><textarea id="ev-comment"${locked ? ' disabled' : ''}${st.errs.comment ? ' aria-invalid="true" aria-describedby="ev-c-e"' : ''}>${esc(st.comment)}</textarea>${st.errs.comment ? `<span class="err" id="ev-c-e" role="alert">${esc(st.errs.comment)}</span>` : ''}</div>
        ${locked ? `<p class="small muted">Submitted by ${esc(sc.by)} on ${esc(sc.at)} · locked. Score and grade are shown on Vendors, Material 360° and the supplier portal.</p>` : '<div class="row-acts"><button type="button" class="btn" data-ev="draft">Save draft</button><button type="submit" class="btn btn-p">Submit scorecard</button></div>'}
      </form>`);
  }
  function totalText(tot, g, sc) {
    const delta = sc.prev != null ? tot - sc.prev : null;
    return `<b>Total ${num(tot, 2)} / 5 · grade ${g[0]} (${g[2]})</b>${complete(st.draft) ? '' : ' · incomplete, missing scores count as 0'}${delta != null && complete(st.draft) ? ` · ${delta >= 0 ? '+' : '−'}${num(Math.abs(delta), 2)} vs Q2/2026` : ''}<div class="small">Weighted score = score × weight; total = Σ weighted scores.</div>`;
  }

  /* ---------- Templates (F-27) ---------- */
  function templates() {
    if (!st.tdraft || st.tdraftFor !== st.tpl) { st.tdraft = tpl(st.tpl).criteria.map((c) => ({ ...c })); st.tdraftFor = st.tpl; st.terrs = []; }
    const sum = st.tdraft.reduce((a, c) => a + (+c.w || 0), 0);
    const rows = st.tdraft.map((c, i) => `<div class="tr tc-cols" role="row">
        <div class="td" role="cell"><input class="inp w-full" aria-label="Criterion ${i + 1} name" id="tc-n${i}" data-tc="name" data-i="${i}" value="${esc(c.name)}"></div>
        <div class="td" role="cell"><select class="inp w-full" aria-label="Criterion ${i + 1} data source" id="tc-s${i}" data-tc="src" data-i="${i}">${SOURCES.map((s) => `<option${s === c.src ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
        <div class="td num" role="cell"><input class="inp inp-num" aria-label="Criterion ${i + 1} weight %" id="tc-w${i}" data-tc="w" data-i="${i}" type="number" min="1" max="100" value="${esc(c.w)}"></div>
        <div class="td" role="cell"><button type="button" class="btn btn-sm" data-ev="tc-del" data-i="${i}" aria-label="Delete criterion ${esc(c.name || i + 1)}">Delete</button></div></div>`).join('');
    const tblHtml = `<div class="tbl-wrap" tabindex="0" role="region" aria-label="Template criteria, scrolls horizontally"><div class="tbl tbl-640" role="table"><div class="tr thead tc-cols" role="row"><div class="th">Criterion</div><div class="th">Data source</div><div class="th num">Weight</div><div class="th"></div></div>${rows}</div></div>`;
    return `<div class="grid-2"><div class="stack">${card('Criteria template', `<div class="filters"><label class="sr" for="ev-tpl">Template</label><select class="inp" id="ev-tpl" data-evf="tpl">${D().evalTemplates.map((t) => `<option value="${t.id}"${t.id === st.tpl ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
        ${tblHtml}
        <div id="tc-sum" class="alert mt ${sum === 100 ? 'alert-success' : 'alert-warning'}" role="status" aria-live="polite">Total weight ${num(sum)}%${sum === 100 ? '' : ' · must be 100% to save'}</div>
        ${st.terrs.length ? `<div class="alert alert-danger mt-s" role="alert">${st.terrs.map(esc).join('<br>')}</div>` : ''}
        <div class="row-acts mt"><button class="btn" data-ev="tc-add">Add criterion</button><button class="btn" data-ev="tc-dup">Duplicate template</button><button class="btn btn-p" data-ev="tc-save">Save template</button></div>`)}</div>
      <div class="stack">${card('Grade thresholds', table([{ h: 'Grade', r: (g) => `<b>${g[0]}</b>`, w: '70px' }, { h: 'Score', r: (g, i) => (g[0] === 'A' ? '≥ 4,20' : g[0] === 'B' ? '3,50 – 4,19' : g[0] === 'C' ? '3,00 – 3,49' : '< 3,00'), w: '110px' }, { h: 'Vendor status', r: (g) => pill(g[2], g[0] === 'A' ? 'success' : g[0] === 'B' ? 'info' : g[0] === 'C' ? 'warning' : 'danger') }], D().grades, { min: 300, label: 'Grade thresholds' }))}
        ${card('Auto data sources', `<ul class="plain small"><li><b>NCR rate & accepted qty</b> — NCRs per PO and accepted ÷ delivered qty from GRN quality inspection (R-07).</li><li><b>PO deliveries (OTIF)</b> — on time (received ≤ promised date) and in full (<b>accepted</b> qty ≥ scheduled qty) ÷ all deliveries.</li><li><b>Price by Material ID</b> — awarded price vs the Material ID’s 90-day average.</li><li><b>Tender response time</b> — days from invitation to bid submission.</li></ul>`)}</div></div>`;
  }
  function readTpl(root) { root.querySelectorAll('[data-tc]').forEach((el) => { const c = st.tdraft[+el.dataset.i]; c[el.dataset.tc] = el.dataset.tc === 'w' ? (el.value === '' ? '' : +el.value) : el.value; }); }

  /* ---------- History ---------- */
  function history() {
    const ids = Object.keys(D().scoreHistory);
    const v = ids.includes(st.vendor) ? st.vendor : ids[0]; const h = D().scoreHistory[v];
    return `<div class="grid-2"><div class="stack">${card('Score history', table([
      { h: 'Vendor', r: (id) => `<a href="#/vendors/${id}"><span class="mono small">${id}</span> ${esc(App.vshort(App.vendor(id)))}</a>`, w: 'minmax(170px,2fr)' },
      ...['Q1/2026', 'Q2/2026', 'Q3/2026'].map((p) => ({ h: p, r: (id) => { const x = D().scoreHistory[id].find((y) => y[0] === p); return x ? `${num(x[1], 2)} · ${gradeOf(x[1])[0]}` : '—'; }, cls: 'num', w: '110px' }))
    ], ids, { min: 520, label: 'Score history' }))}</div>
      <div class="stack">${card(`Trend · ${v}`, h.length > 1 ? App.chart.line({ labels: h.map((x) => x[0]), values: h.map((x) => x[1]), target: 4.2, targetLabel: 'A', fmt: (x) => num(x, 2), label: `Score trend for ${v}: ${h.map((x) => x[0] + ' ' + num(x[1], 2)).join(', ')}` }) : '<div class="empty">Not enough periods</div>')}</div></div>`;
  }

  function render(p, admin) {
    if (p.vendor && p.vendor !== st.lastParam) { st.vendor = p.vendor; st.lastParam = p.vendor; st.tab = 'scorecards'; st.draft = null; }
    if (admin) st.tab = 'templates';
    const sc = D().scorecards;
    const tabs = [['scorecards', 'Scorecards'], ['templates', 'Criteria templates'], ['history', 'History']];
    const body = st.tab === 'templates' ? templates() : st.tab === 'history' ? history() : `<div class="grid-2"><div class="stack">${scorecard()}</div><div class="stack">${progress()}</div></div>`;
    return `<div class="page-h"><div><h1>${admin ? 'Evaluation templates' : 'Vendor evaluation'}</h1><div class="sub">Weighted scorecards per period · auto criteria from GRN accepted qty, NCRs, prices by Material ID and bids</div></div>
      <div class="acts"><label class="sr" for="ev-period">Period</label><select class="inp" id="ev-period" data-evf="period">${['Q3/2026', 'Q2/2026', 'Q1/2026'].map((x) => `<option${x === st.period ? ' selected' : ''}>${x}</option>`).join('')}</select><button class="btn btn-p" data-ev="new-period">Start new period</button></div></div>
      <div class="grid-k">${kpi('Submitted', String(sc.filter((s) => s.status === 'Submitted').length), `of ${sc.length} · Q3/2026`, 'success')}${kpi('Draft', String(sc.filter((s) => s.status === 'Draft').length), 'In progress', 'warning')}${kpi('Not started', String(sc.filter((s) => s.status === 'Not started').length), 'Due 15/11/2026')}${kpi('Average score', num(D().vendors.filter((v) => v.score).reduce((a, v, _, A) => a + v.score / A.length, 0), 2), 'Scored vendors')}</div>
      ${admin ? '' : `<div class="seg" role="group" aria-label="View">${tabs.map(([k, l]) => `<button data-ev="tab" data-k="${k}" aria-pressed="${st.tab === k}">${l}</button>`).join('')}</div>`}
      ${body}`;
  }

  function mount(root) {
    root.addEventListener('input', (e) => {
      const i = e.target.dataset.evScore;
      if (i != null) {
        st.draft[+i] = e.target.value === '' ? null : e.target.value;
        const sc = D().scorecards.find((s) => s.vendor === st.vendor && s.period === st.period); const t = tpl(sc.tpl);
        const w = root.querySelector(`[data-ev-w="${i}"]`); if (w) w.textContent = e.target.value === '' ? '—' : num(+e.target.value * t.criteria[+i].w / 100, 3);
        const tot = total(t, st.draft); const box = root.querySelector('#ev-total'); if (box) box.innerHTML = totalText(tot, gradeOf(tot), sc);
      }
      if (e.target.id === 'ev-comment') st.comment = e.target.value;
      if (e.target.dataset.tc) { readTpl(root); const sum = st.tdraft.reduce((a, c) => a + (+c.w || 0), 0); const b = root.querySelector('#tc-sum'); b.className = 'alert mt ' + (sum === 100 ? 'alert-success' : 'alert-warning'); b.textContent = `Total weight ${num(sum)}%${sum === 100 ? '' : ' · must be 100% to save'}`; }
    });
    root.addEventListener('change', (e) => {
      const k = e.target.dataset.evf;
      if (k === 'period') { st.period = e.target.value; st.draft = null; App.render(); }
      if (k === 'tpl') { st.tpl = e.target.value; App.render(); }
    });
    const commit = (submit) => {
      const sc = D().scorecards.find((s) => s.vendor === st.vendor && s.period === st.period); const t = tpl(sc.tpl); st.errs = {};
      t.criteria.forEach((c, i) => { const x = st.draft[i]; if (isAuto(c)) return; if (x != null && x !== '' && (isNaN(+x) || +x < 0 || +x > 5)) st.errs['s' + i] = 'Enter a score from 0 to 5.'; else if (submit && (x == null || x === '')) st.errs['s' + i] = 'Required to submit.'; });
      if (submit && (st.comment || '').trim().length < 10) st.errs.comment = 'Add a comment of at least 10 characters.';
      if (Object.keys(st.errs).length) { App.render(); const er = document.querySelector('#ev-form [aria-invalid=true]'); er && er.focus(); return; }
      sc.scores = st.draft.map((x) => (x == null || x === '' ? null : +x)); sc.comment = st.comment;
      if (submit) { const tot = Math.round(total(t, sc.scores) * 100) / 100; const v = App.vendor(sc.vendor); sc.status = 'Submitted'; sc.at = D().today; sc.by = me(); v.score = tot; v.grade = gradeOf(tot)[0]; App.render(); App.toast(`${v.id} scorecard submitted · ${num(tot, 2)} · grade ${v.grade}`); }
      else { sc.status = 'Draft'; App.render(); App.toast('Draft saved'); }
    };
    root.addEventListener('submit', (e) => { if (e.target.id === 'ev-form') { e.preventDefault(); commit(true); } });
    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-ev]'); if (!t) return; const a = t.dataset.ev;
      if (a === 'tab') { st.tab = t.dataset.k; App.render(); }
      else if (a === 'open') { st.vendor = t.dataset.id; st.draft = null; st.errs = {}; App.render(); const f = document.querySelector('#ev-form, .card'); f && f.scrollIntoView({ block: 'start' }); }
      else if (a === 'start') { startCard(App.vendor(t.dataset.id)); st.draft = null; App.render(); App.toast('Scorecard started · auto criteria filled'); }
      else if (a === 'draft') commit(false);
      else if (a === 'new-period') App.toast('Q4/2026 opens 01/01/2027: scorecards are created as Not started for vendors with POs in the quarter, due 15/02/2027');
      else if (a === 'tc-add') { readTpl(root); st.tdraft.push({ name: '', src: 'Manual', w: 0 }); App.render(); const n = document.getElementById('tc-n' + (st.tdraft.length - 1)); n && n.focus(); }
      else if (a === 'tc-del') { readTpl(root); st.tdraft.splice(+t.dataset.i, 1); App.render(); }
      else if (a === 'tc-save') {
        readTpl(root); const sum = st.tdraft.reduce((x, c) => x + (+c.w || 0), 0); st.terrs = [];
        if (sum !== 100) st.terrs.push(`Total weight is ${sum}%; it must be 100%.`);
        if (st.tdraft.some((c) => !String(c.name).trim())) st.terrs.push('Every criterion needs a name.');
        if (st.tdraft.some((c) => !(+c.w > 0) || !Number.isInteger(+c.w))) st.terrs.push('Weights must be whole numbers above 0.');
        if (!st.terrs.length) { const tp = tpl(st.tpl); if (D().scorecards.some((s) => s.tpl === tp.id && s.status !== 'Not started') && tp.criteria.length !== st.tdraft.length) st.terrs.push('Criteria cannot be added or removed while this period has scorecards in progress. Duplicate the template instead.'); }
        if (!st.terrs.length) { tpl(st.tpl).criteria = st.tdraft.map((c) => ({ ...c, w: +c.w })); App.render(); App.toast('Template saved'); } else App.render();
      }
      else if (a === 'tc-dup') { readTpl(root); const src = tpl(st.tpl); const id = src.id + '-' + (D().evalTemplates.length + 1); D().evalTemplates.push({ id, name: src.name + ' (copy)', cat: src.cat, criteria: st.tdraft.map((c) => ({ ...c })) }); st.tpl = id; App.render(); App.toast(`${src.name} duplicated`); }
    });
  }

  App.page('evaluation', { title: 'Vendor evaluation', ws: 'procurement', roles: ['procurement', 'admin'], render: (p) => render(p, false), mount });
  App.page('admin/templates', { title: 'Evaluation templates', roles: ['admin'], render: (p) => render(p, true), mount });
})();
