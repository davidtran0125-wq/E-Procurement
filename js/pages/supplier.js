/* Module 15 · Supplier portal — F-87 overview & action list, F-88..F-91 invitations to bid (sealed bid by Material ID line, bid security, documents,
   Q&A by line, addendum acknowledgment, commitments + privacy consent, submit / revise / withdraw with receipt no. until close), F-92 PO confirm / decline / re-confirm,
   F-93 deliveries (ASN, date-change request, GRNs), F-94 results, contracts & certificates, F-95 e-invoice submission & status, F-96 NCR response,
   F-97 company profile & MST / bank change, F-98 Material IDs offered & onboarding checklist.
   A supplier only ever reads its own vendor's records (VID = signed-in user's vendor); other bidders' prices are never shown.
   Routes: #/supplier, #/supplier/invitations(/<TND>), #/supplier/quotations, #/supplier/pos(/<PO>(/print)), #/supplier/deliveries, #/supplier/invoices,
   #/supplier/contracts, #/supplier/certificates, #/supplier/scorecard, #/supplier/profile */
(function () {
  const { esc, num, pct, vnd, pill, table, kpi, card } = App;
  const S = App.src;
  const D = () => window.DATA;
  let tick = 30;
  const clock = () => { tick += 1; const h = 10 + Math.floor(tick / 60), m = tick % 60; return `${D().today} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; };
  const NOWD = new Date(2026, 10, 2, 10, 30);
  const VID = () => (App.state.user && App.state.user.vendor) || 'V-1001';
  const V = () => App.vendor(VID());
  const P = () => D().portal[VID()] || (D().portal[VID()] = { bids: {}, results: [], quotes: [], asns: [], checklist: [], notices: [], lastLogin: '—' });
  const mat = (id) => App.material(id) || { id, name: id, uom: '', vat: 8, vendors: [] };
  /* Material ID tag without a link: Material 360° is an internal screen */
  const mtag = (id) => `<span class="mid">${esc(id)}</span>`;
  const st = { cur: null, bid: null, berr: {}, up: null, q: null, qerr: {}, dec: null, derr: '', asn: null, aerr: {}, chg: null, cerr: {}, ncr: null, nerr: {}, inv: null, ierr: {}, cert: null, terr: {}, bank: null, kerr: {}, mst: null, prop: null };

  /* ---------- own records ---------- */
  const myPos = () => D().docs.filter((d) => d.type === 'PO' && d.vendor === VID() && !/Draft|Pending|^Approved$/.test(d.status)).sort((a, b) => App.dt(b.date) - App.dt(a.date));
  const myInv = () => D().docs.filter((d) => d.type === 'INV' && d.vendor === VID()).sort((a, b) => App.dt(b.date) - App.dt(a.date));
  const myNcr = () => Object.entries(D().ncrs).map(([id, n]) => Object.assign({ id }, n)).filter((n) => { const d = S.docOf(n.po); return (d && d.vendor === VID()) || (D().pos[n.po] && D().pos[n.po].vendor === VID()); });
  const myCts = () => D().contracts.filter((c) => c.vendor === VID());
  const myCerts = () => D().certificates.filter((c) => c.vendor === VID());
  const myGrns = () => Object.entries(D().grns).filter(([, g]) => { const d = S.docOf(g.po); return d && d.vendor === VID(); }).map(([id, g]) => Object.assign({ id }, g)).sort((a, b) => App.dt(b.date) - App.dt(a.date));
  const tndDoc = (id) => S.docOf(id);
  const invites = () => D().docs.filter((d) => d.type === 'TND' && ((D().tenders[d.id] && (D().tenders[d.id].bidders || []).some((b) => b.vid === VID())) || P().bids[d.id]));
  const closeAt = (d) => { const t = D().tenders[d.id] || {}; const [dd, mm, yy] = d.close.split('/').map(Number); const [h, mi] = String(t.closeTime || '17:00').split(':').map(Number); return new Date(yy, mm - 1, dd, h, mi); };
  const isClosed = (d) => closeAt(d) <= NOWD || /Awarded|Evaluation|Closed|Cancelled/.test(d.status);
  const left = (d) => { const ms = closeAt(d) - NOWD; if (ms <= 0) return 'Closed'; const h = Math.floor(ms / 36e5); return `${Math.floor(h / 24)} d ${h % 24} h left`; };
  const termsDays = () => +((String((V() || {}).terms || '30').match(/\d+/) || [30])[0]);
  const stageOf = (d) => (/Paid/.test(d.status) ? 4 : /Ready/.test(d.status) ? 3 : /Matched/.test(d.status) ? 2 : /Submitted/.test(d.status) ? 0 : 1);
  const STAGES = ['Submitted', 'Validated', 'Matched', 'Ready for payment', 'Paid'];
  const steps = (list, i, label) => `<ol class="steps" aria-label="${esc(label)}">${list.map((x, k) => { const dn = k < i; const cu = k === i; return `<li class="${dn ? 'done' : cu ? 'cur' : ''}"${cu ? ' aria-current="step"' : ''}><span class="st-n" aria-hidden="true">${dn ? '✓' : k + 1}</span><span class="st-l">${esc(x)}</span>${dn ? '<span class="sr"> (done)</span>' : ''}</li>`; }).join('')}</ol>`;
  const head = (title, sub, acts = '', crumbs = '') => `<div class="page-h"><div>${crumbs ? `<div class="crumbs small muted">${crumbs}</div>` : ''}<h1>${title}</h1><div class="sub">${sub}</div></div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
  const certStatus = (c) => { if (['Pending review', 'Rejected', 'Superseded'].includes(c.status)) return c.status; const d = App.daysTo(c.expiry); return d < 0 ? 'Expired' : d <= 60 ? 'Renewal due' : 'Valid'; };
  const cTone = (s) => ({ Valid: 'success', 'Renewal due': 'warning', Expired: 'danger', 'Pending review': 'info', Rejected: 'danger' }[s] || 'neutral');
  const notify = (text, doc, href, mats) => D().notifications.unshift({ id: 'N-' + (950 + D().notifications.length), type: 'Supplier portal', text, doc, mats: mats || [], at: clock(), read: false, action: 'Open', href });

  /* ---------- F-87 overview ---------- */
  function actions() {
    const out = [];
    myPos().forEach((d) => { const p = App.po.det(d.id); if (p.confirm && p.confirm.status === 'Not confirmed') out.push([`Confirm or decline ${d.id}`, d.note || 'Within 48 h of sending', `#/supplier/pos/${d.id}`, 'danger']);
      if (p.confirm && p.confirm.status === 'Awaiting re-confirmation') out.push([`Re-confirm ${d.id} Rev.${p.rev}`, 'Revision approved by the buyer', `#/supplier/pos/${d.id}`, 'warning']); });
    invites().forEach((d) => { const t = D().tenders[d.id]; if (isClosed(d)) return; (t.addenda || []).forEach((a) => { if (!a.acks.some((x) => x[0] === VID())) out.push([`Acknowledge ${d.id} Addendum ${String(a.no).padStart(2, '0')}`, `Closes ${d.close} ${t.closeTime}`, `#/supplier/invitations/${d.id}`, 'warning']); });
      const b = P().bids[d.id]; if (!b || b.status !== 'Submitted') out.push([`Submit your bid for ${d.id}`, `Closes ${d.close} ${t.closeTime} · ${left(d)}`, `#/supplier/invitations/${d.id}`, 'warning']); });
    myNcr().filter((n) => n.status !== 'Closed' && !n.response).forEach((n) => out.push([`Respond to ${n.id}`, `${num(n.qty)} ${mat(n.mat).uom} ${n.mat} · ${n.action}`, '#/supplier/deliveries', 'danger']));
    myCerts().filter((c) => certStatus(c) === 'Renewal due' && !myCerts().some((x) => x.replaces === c.id)).forEach((c) => out.push([`Upload renewal · ${c.type}`, `Expires ${c.expiry}`, '#/supplier/certificates', 'warning']));
    myCts().filter((c) => (S.docOf(c.id) || {}).status === 'Expiring').forEach((c) => out.push([`${c.id} expires ${c.end}`, 'Talk to your buyer about renewal', '#/supplier/contracts', 'neutral']));
    return out;
  }
  function overview() {
    const v = V(); const act = actions(); const open = invites().filter((d) => !isClosed(d));
    const sealed = Object.entries(P().bids).filter(([k, b]) => b.status === 'Submitted' && !isClosed(tndDoc(k))).length;
    const openPos = myPos().filter((d) => !/Closed|Cancelled|declined/.test(d.status));
    const sc = D().scorecards.find((x) => x.vendor === VID());
    return head(`${esc(v.name)}`, `${esc(v.id)} · MST ${esc(v.mst)} · signed in as ${esc(S.me())} (${esc(v.email)}) · last sign-in ${esc(P().lastLogin)}`)
      + `<div class="grid-k">${kpi('Open invitations', String(open.length), open.map((d) => d.id).join(', ') || 'None')}${kpi('Sealed bids', String(sealed), 'Submitted, not yet opened')}${kpi('Open POs', String(openPos.length), vnd(openPos.reduce((a, d) => a + d.value, 0)) + ' excl. VAT')}${kpi('My OTIF', v.otif != null ? pct(v.otif) : '—', 'Accepted qty · target 95%', v.otif >= 95 ? 'success' : 'warning')}${kpi('Scorecard', v.score ? `${num(v.score, 2)} · ${esc(v.grade)}` : '—', sc ? esc(sc.period) : '')}</div>
      <div class="grid-2"><div class="stack">${card(`Action needed (${act.length})`, act.length ? `<ul class="plain">${act.map(([t, n, h, tone]) => `<li class="row-acts between"><span><b>${esc(t)}</b><div class="small muted">${esc(n)}</div></span><a class="btn btn-sm${tone === 'danger' ? ' btn-p' : ''}" href="${h}">Open</a></li>`).join('')}</ul>` : App.emptyState('Nothing to do', 'You are up to date.'))}</div>
      <div class="stack">${card('Notifications', `<ul class="plain rows small">${P().notices.map(([at, t]) => `<li><span class="muted">${esc(at)}</span><div>${esc(t)}</div></li>`).join('') || '<li class="muted">None</li>'}</ul>`)}
      ${card('Quick links', `<ul class="plain qlinks"><li><a href="#/supplier/invitations">Bidding · invitations to bid</a></li><li><a href="#/supplier/pos">Orders · purchase orders & deliveries</a></li><li><a href="#/supplier/invoices">Invoices · submit an e-invoice</a></li><li><a href="#/supplier/profile">My company · profile, bank & Material IDs</a></li></ul>`)}</div></div>`;
  }

  /* ---------- F-88..F-91 invitations ---------- */
  function invList() {
    const rows = invites();
    const res = P().results;
    return head(esc(App.t('Invitations to bid')), 'Sealed bids per Material ID line · you only see your own prices')
      + card(`Invitations (${rows.length})`, table([
        { h: 'Tender', r: (d) => `<a class="mono" href="#/supplier/invitations/${esc(d.id)}">${esc(d.id)}</a><div class="small">${esc(d.title)}</div>`, w: 'minmax(220px,2fr)' },
        { h: 'Material IDs', r: (d) => `<span class="chips chips-inline">${d.mats.map(mtag).join('')}</span>`, w: 'minmax(180px,1.6fr)' },
        { h: 'Closes', r: (d) => `<span class="nowrap">${esc(d.close)} ${esc((D().tenders[d.id] || {}).closeTime || '')}</span><div class="small muted">${esc(left(d))}</div>`, w: '140px' },
        { h: 'My bid', r: (d) => { const b = P().bids[d.id]; return b ? `${pill(b.status, b.status === 'Submitted' ? 'success' : b.status === 'Withdrawn' ? 'danger' : 'neutral')}${b.rc ? `<div class="small mono">${esc(b.rc)} · v${b.ver}</div>` : ''}` : pill('Not started', 'warning'); }, w: '150px' },
        { h: 'Tender status', r: (d) => pill(isClosed(d) ? (d.status === 'Open' ? 'Closed' : d.status) : 'Open', isClosed(d) ? 'neutral' : 'info'), w: '120px' }
      ], rows, { min: 820, label: 'Invitations to bid', empty: 'No invitations' }))
      + card('Result notices', res.length ? `<ul class="plain">${res.map((r) => `<li class="row-acts between"><span><b class="mono">${esc(r.tnd)}</b> ${esc(r.title)} ${pill(r.outcome, r.outcome === 'Awarded' ? 'success' : 'neutral')}<div class="small">Your rank: <b>${r.rank} of ${r.of}</b> · notice ${esc(r.at)}${r.po ? ` · ${esc(r.po)}` : ''}</div><div class="small muted">${esc(r.sec)}</div></span></li>`).join('')}</ul><p class="small muted">Only your own rank is shown. Other bidders' names and prices are not disclosed.</p>` : App.emptyState('No results yet'));
  }
  function bidOf(id) {
    const t = D().tenders[id]; const b = P().bids[id];
    return b || (P().bids[id] = { status: 'Draft', rc: null, at: null, ver: 0, lines: t.lines.map(() => ({ price: null, lead: null, nobid: false })), sec: { form: 'Bank guarantee', bank: '', ref: '', amount: null, valid: '', file: '' }, files: [], note: '', consent: false, log: [] });
  }
  const secReq = (t) => t.secAmount || 0;
  function totals(t, lines) {
    const by = {}; t.lines.forEach((l, i) => { const x = lines[i]; if (!x || x.nobid || !(+x.price > 0)) return; const r = mat(l.mat).vat; by[r] = (by[r] || 0) + l.qty * x.price; });
    const net = Object.values(by).reduce((a, x) => a + x, 0); const vat = Object.entries(by).reduce((a, [r, x]) => a + x * r / 100, 0); return { by, net, vat, gross: net + vat };
  }
  function invDetail(id) {
    const d = tndDoc(id); const t = D().tenders[id];
    if (!d || !t || !invites().some((x) => x.id === id)) return App.errorState(`Invitation ${id} was not found in your portal.`, ' <a href="#/supplier/invitations">Back to invitations</a>');
    const b = bidOf(id); const closed = isClosed(d); const f = st.bid || b; const e = st.berr;
    const lines = f.lines; const tt = totals(t, lines);
    const unacked = (t.addenda || []).filter((a) => !a.acks.some((x) => x[0] === VID()));
    const minValid = App.addDays(d.close, 90);
    const dis = closed ? ' disabled' : '';
    const res = P().results.find((r) => r.tnd === id);
    const lineRows = t.lines.map((l, i) => { const m = mat(l.mat); const x = lines[i]; const err = e['l' + i];
      return `<div class="tr sb-cols" role="row"><div class="td" role="cell">${mtag(l.mat)}<div class="small">${esc(m.name)}</div>${err ? `<div class="err small" id="sb-e${i}" role="alert">${esc(err)}</div>` : ''}</div>
        <div class="td num" role="cell">${num(l.qty)} ${esc(m.uom)}</div>
        <div class="td num" role="cell"><label class="sr" for="sb-p${i}">Unit price excl. VAT, line ${i + 1}</label><input class="inp inp-num w-full" id="sb-p${i}" data-sb="price" data-i="${i}" inputmode="numeric" value="${x.price ? esc(num(x.price)) : ''}"${x.nobid || closed ? ' disabled' : ''}${err ? ` aria-invalid="true" aria-describedby="sb-e${i}"` : ''}></div>
        <div class="td" role="cell">${m.vat}%${m.vat === 8 ? ' <span class="small muted">(reduced, until 31/12/2026)</span>' : ''}${m.vat === 10 && /^CON-240/.test(l.mat) ? '<div class="small muted">Locked · metals 10%</div>' : '<div class="small muted">Set by Material ID</div>'}</div>
        <div class="td num" role="cell"><label class="sr" for="sb-l${i}">Lead time in days, line ${i + 1}</label><input class="inp inp-num w-full" id="sb-l${i}" data-sb="lead" data-i="${i}" inputmode="numeric" value="${x.lead != null ? esc(x.lead) : ''}"${x.nobid || closed ? ' disabled' : ''}></div>
        <div class="td" role="cell"><label class="chk"><input type="checkbox" data-sb="nobid" data-i="${i}"${x.nobid ? ' checked' : ''}${dis}> No bid</label></div>
        <div class="td num" role="cell" id="sb-a${i}">${x.nobid || !x.price ? '—' : vnd(l.qty * x.price)}</div></div>`; }).join('');
    const linesTbl = `<div class="tbl-wrap" tabindex="0" role="region" aria-label="Bid lines, scrolls horizontally"><div class="tbl tbl-1000" role="table"><div class="tr thead sb-cols" role="row"><div class="th">Material ID</div><div class="th num">Qty</div><div class="th num">Unit price excl. VAT</div><div class="th">VAT</div><div class="th num">Lead time (days)</div><div class="th">No bid</div><div class="th num">Amount excl. VAT</div></div>${lineRows}</div></div>`;
    const totalsHtml = `<dl class="dl dl-tot mt" id="sb-tot" aria-live="polite">${Object.entries(tt.by).sort((a, z) => z[0] - a[0]).map(([r, x]) => `<dt>VAT ${esc(S.vatLabel(r))} on</dt><dd>${vnd(x)} + VAT ${vnd(x * r / 100)}</dd>`).join('')}<dt>Total excl. VAT</dt><dd>${vnd(tt.net)}</dd><dt class="tot">Total incl. VAT</dt><dd class="tot"><b>${vnd(tt.gross)}</b></dd></dl>`;
    const s = f.sec;
    const secHtml = `<fieldset class="fs"><legend>Bid security (required ${vnd(secReq(t))} · valid ≥ 90 days after closing, until ${esc(minValid)} or later)</legend><div class="form-grid">
      ${S.field('sbs', e, 'form', 'Form', s.form, { options: ['Bank guarantee', 'Cash deposit'], dis: closed })}${S.field('sbs', e, 'bank', 'Issuing bank', s.bank, { dis: closed })}
      ${S.field('sbs', e, 'ref', 'Guarantee / deposit ref.', s.ref, { dis: closed })}${S.field('sbs', e, 'amount', 'Amount (₫)', s.amount ? num(s.amount) : '', { mode: 'numeric', req: true, dis: closed })}
      ${S.field('sbs', e, 'valid', 'Valid until', s.valid, { ph: 'dd/mm/yyyy', req: true, dis: closed })}${S.field('sbs', e, 'file', 'File', s.file, { ph: 'e.g. BL-VCB-….pdf', hint: 'Upload or replace the scanned guarantee (PDF)', dis: closed })}</div>
      <p class="small muted mt-0">Returned within 14 days if you are not awarded.</p></fieldset>`;
    const addHtml = (t.addenda || []).length ? (t.addenda || []).map((a) => { const mine = a.acks.find((x) => x[0] === VID());
      return `<div class="alert alert-${mine ? 'info' : 'warning'}" role="status"><b>Addendum ${String(a.no).padStart(2, '0')} · ${esc(a.at)}</b> <span class="chips chips-inline">${a.lines.map(mtag).join('')}</span><div>${esc(a.summary)}</div>
        <div class="row-acts between mt-s"><span class="small">${mine ? `Acknowledged by you ${esc(mine[1])}` : 'Not acknowledged yet — required before you submit or revise'}</span>${mine || closed ? '' : `<button class="btn btn-sm btn-p" data-sp="ack" data-no="${a.no}">Acknowledge</button>`}</div></div>`; }).join('') : '<p class="small muted mt-0">No addenda published.</p>';
    const myQs = (t.questions || []).filter((q) => q.from === VID());
    const qa = card(`Q&A by line (${(t.qa || []).length})`, `${(t.qa || []).length ? `<ul class="plain rows">${t.qa.map((x) => `<li><span class="small muted">Q${x.no} · ${esc(x.at)} · published to all bidders (anonymous)</span> ${mtag(x.line)}<div><b>${esc(x.q)}</b></div><div class="small">Answer: ${esc(x.a)}</div></li>`).join('')}</ul>` : '<p class="small muted mt-0">No published answers yet.</p>'}
      ${myQs.length ? `<h3 class="h-sub">Your questions waiting for an answer</h3><ul class="plain small">${myQs.map((q) => `<li>${mtag(q.line)} ${esc(q.q)} <span class="muted">· ${esc(q.at)}</span> ${pill('Awaiting answer', 'warning')}</li>`).join('')}</ul>` : ''}
      ${st.q ? `<form id="sp-q" class="stack mt" novalidate><div class="form-grid">${S.field('spq', st.qerr, 'line', 'Material ID line', st.q.line, { options: t.lines.map((l) => l.mat) })}${S.field('spq', st.qerr, 'q', 'Your question', st.q.q, { area: true, req: true, hint: 'The answer is sent to every bidder without your name' })}</div><div class="row-acts"><button type="button" class="btn btn-sm" data-sp="q-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Send question</button></div></form>` : ''}`,
      closed || st.q ? '' : '<button class="btn btn-sm" data-sp="q-open">Ask a question</button>');
    const files = S.files('spf', f.files, t.lines.map((l) => l.mat), closed ? null : st.up, ['Quotation letter', 'CO/CQ', 'Catalogue', 'Datasheet', 'Other']);
    const commit = `<fieldset class="fs"${e.commit ? ' aria-describedby="sb-commit-e"' : ''}><legend>Commitments</legend>
      <label class="chk"><input type="checkbox" name="c1" value="1"${f.c1 || b.status === 'Submitted' ? ' checked' : ''}${dis}> My bid is valid for ${t.validity} days after closing</label>
      <label class="chk"><input type="checkbox" name="c2" value="1"${f.c2 || b.status === 'Submitted' ? ' checked' : ''}${dis}> My bid follows the tender documents and every addendum</label>
      <label class="chk"><input type="checkbox" name="consent" value="1"${f.consent ? ' checked' : ''}${dis}> I agree that ProcureLink processes the personal data in this bid under privacy notice ${esc(D().privacy.current)} (Nghị định 13/2023)</label>
      ${e.commit ? `<span class="err" id="sb-commit-e" role="alert">${esc(e.commit)}</span>` : ''}</fieldset>`;
    const acts = closed ? '' : `<button type="button" class="btn" data-sp="draft">Save draft</button>${b.status === 'Submitted' ? '<button type="button" class="btn btn-d" data-sp="withdraw">Withdraw bid</button>' : ''}<button type="submit" class="btn btn-p">${b.status === 'Submitted' ? 'Submit revised bid' : 'Submit sealed bid'}</button>`;
    const form = card(`My bid${b.status === 'Draft' ? ' · draft' : ''}`, `<form id="sp-bid" class="stack" novalidate>${e._ ? `<div class="alert alert-danger" role="alert">${esc(e._)}</div>` : ''}
      ${closed ? `<div class="alert alert-warning" role="status"><b>Bidding closed ${esc(d.close)} ${esc(t.closeTime)}.</b> Submit, revise and withdraw are disabled.</div>` : ''}
      ${linesTbl}${totalsHtml}${secHtml}
      ${S.field('sb', e, 'note', 'Note to the buyer', f.note || '', { area: true, dis: closed })}${commit}
      <div class="row-acts">${acts}</div></form>`);
    const receipt = card('Receipt', b.rc ? `<p class="mt-0">${pill(b.status, b.status === 'Submitted' ? 'success' : 'danger')} <b class="mono">${esc(b.rc)}</b> · version ${b.ver}</p><p class="small">${b.status === 'Submitted' ? 'Sealed' : esc(b.status)} ${esc(b.at)} · the buyer cannot see your prices before the opening.</p>
      <h3 class="h-sub">History</h3><ul class="plain rows small">${b.log.slice().reverse().map(([at, x]) => `<li><span class="muted">${esc(at)}</span> · ${esc(x)}</li>`).join('')}</ul>` : '<p class="small muted mt-0">No receipt yet. A receipt number and timestamp are issued when you submit.</p>');
    const result = res ? card('Result notice', `<p class="mt-0">${pill(res.outcome, res.outcome === 'Awarded' ? 'success' : 'neutral')} Your rank <b>${res.rank} of ${res.of}</b> · ${esc(res.at)}</p><p class="small muted">${esc(res.sec)}</p>`) : '';
    return head(`<span class="mono">${esc(id)}</span> ${esc(d.title)}`, `${esc(t.method)} · closes ${esc(d.close)} ${esc(t.closeTime)} · ${pill(left(d), closed ? 'neutral' : 'warning')}`, '', '<a href="#/supplier/invitations">Invitations to bid</a> / ' + esc(id))
      + `<div class="stack"><div class="grid-2"><div class="stack">${card('Addenda', addHtml)}</div><div class="stack">${receipt}${result}</div></div>${form}<div class="grid-2"><div class="stack">${files}</div><div class="stack">${qa}</div></div></div>`;
  }
  function readBid(root) {
    const f = st.bid; const x = S.read(root, '#sp-bid');
    root.querySelectorAll('[data-sb=price],[data-sb=lead]').forEach((el) => { const l = f.lines[+el.dataset.i]; if (el.dataset.sb === 'price') l.price = el.value.trim() === '' ? null : S.money(el.value); else l.lead = el.value.trim() === '' ? null : +el.value; });
    root.querySelectorAll('[data-sb=nobid]').forEach((el) => { f.lines[+el.dataset.i].nobid = el.checked; });
    f.sec = { form: x.form, bank: x.bank, ref: x.ref, amount: x.amount ? S.money(x.amount) : null, valid: x.valid, file: x.file };
    f.note = x.note; f.c1 = (x.c1 || []).length > 0; f.c2 = (x.c2 || []).length > 0; f.consent = (x.consent || []).length > 0;
  }
  function saveBid(root, id, submit) {
    const d = tndDoc(id); const t = D().tenders[id]; const b = bidOf(id);
    if (isClosed(d)) { App.toast('Bidding is closed'); return; }
    readBid(root); const f = st.bid; const e = {};
    if (submit) {
      f.lines.forEach((l, i) => { if (l.nobid) return; if (!(l.price > 0)) e['l' + i] = 'Enter a unit price, or tick No bid.'; else if (!(l.lead > 0)) e['l' + i] = 'Enter the lead time in days.'; });
      if (f.lines.every((l) => l.nobid)) e._ = 'Quote at least one line, or decline the invitation.';
      if ((t.addenda || []).some((a) => !a.acks.some((x) => x[0] === VID()))) e._ = 'Acknowledge every addendum before you submit.';
      if (secReq(t)) { if (!(f.sec.amount >= secReq(t))) e.amount = `At least ${vnd(secReq(t))}.`; if (!S.validDate(f.sec.valid)) e.valid = 'Use dd/mm/yyyy.'; else if (App.dt(f.sec.valid) < App.dt(App.addDays(d.close, 90))) e.valid = `Must be valid until ${App.addDays(d.close, 90)} or later.`; if (!f.sec.file) e.file = 'Attach the guarantee file.'; else if (!/\.pdf$/i.test(f.sec.file)) e.file = 'PDF only.'; }
      if (!f.c1 || !f.c2 || !f.consent) e.commit = 'Tick all commitments, including the privacy consent.';
    }
    st.berr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#sp-bid'); return; }
    Object.assign(b, { lines: f.lines.map((l) => ({ ...l })), sec: f.sec, note: f.note, consent: f.consent, c1: f.c1, c2: f.c2 });
    if (!submit) { if (b.status !== 'Submitted') b.status = 'Draft'; st.bid = null; App.render(); App.toast('Draft saved · not visible to the buyer'); return; }
    const at = clock(); const tb = t.bidders.find((x) => x.vid === VID());
    const rev = b.status === 'Submitted';
    if (!b.rc || b.status === 'Withdrawn') b.rc = `RC-${id.slice(-3)}-${String(t.bidders.filter((x) => x.rc).length + (tb && tb.rc ? 0 : 1) + (b.status === 'Withdrawn' ? 1 : 0)).padStart(3, '0')}`;
    b.ver += 1; b.status = 'Submitted'; b.at = at; b.log.push([at, `${rev ? 'Revised' : 'Submitted'} · ${b.rc} v${b.ver}`]);
    if (tb) Object.assign(tb, { rc: b.rc, at, status: 'Submitted', warn: rev ? `Revised v${b.ver}` : undefined });
    d.bids = t.bidders.filter((x) => x.status === 'Submitted').length;
    S.audit('Bids and tenders', `Sealed bid ${rev ? 'revised' : 'submitted'} · ${b.rc} v${b.ver} (content sealed)`, id);
    st.bid = null; App.render(); App.toast(`Sealed bid ${rev ? 'revised' : 'submitted'} · receipt ${b.rc} · ${at}`);
  }

  /* ---------- quotations ---------- */
  function quotations() {
    const rows = Object.entries(P().bids).map(([id, b]) => { const t = D().tenders[id]; const d = tndDoc(id); return { id, b, t, d, tt: totals(t, b.lines) }; });
    return head(esc(App.t('My quotations')), 'Your bids and quotations · prices excl. VAT · only your own prices are shown')
      + card(`Tender bids (${rows.length})`, table([
        { h: 'Tender', r: (r) => `<a class="mono" href="#/supplier/invitations/${esc(r.id)}">${esc(r.id)}</a><div class="small">${esc(r.d.title)}</div>`, w: 'minmax(200px,2fr)' },
        { h: 'Lines quoted', r: (r) => r.t.lines.map((l, i) => (r.b.lines[i].nobid ? `<div class="small">${esc(l.mat)} · No bid</div>` : r.b.lines[i].price ? `<div class="small">${esc(l.mat)} · ${vnd(r.b.lines[i].price)} · ${r.b.lines[i].lead} d</div>` : `<div class="small muted">${esc(l.mat)} · —</div>`)).join(''), w: 'minmax(220px,2fr)' },
        { h: 'Total excl. VAT', r: (r) => vnd(r.tt.net), cls: 'num', w: '150px' },
        { h: 'Receipt', r: (r) => (r.b.rc ? `<span class="mono">${esc(r.b.rc)}</span> v${r.b.ver}<div class="small muted">${esc(r.b.at)}</div>` : '—'), w: '150px' },
        { h: 'Status', r: (r) => { const res = P().results.find((x) => x.tnd === r.id); return res ? pill(`${res.outcome} · rank ${res.rank}/${res.of}`, res.outcome === 'Awarded' ? 'success' : 'neutral') : pill(r.b.status, r.b.status === 'Submitted' ? 'success' : 'neutral'); }, w: '160px' }
      ], rows, { min: 900, label: 'Tender bids' }))
      + card(`Spot quotations (${P().quotes.length})`, table([
        { h: 'Quotation', r: (q) => `<span class="mono">${esc(q.id)}</span><div class="small muted">${esc(q.for)}</div>`, w: 'minmax(180px,1.6fr)' },
        { h: 'Material ID', r: (q) => mtag(q.mat), w: '120px' }, { h: 'Qty', r: (q) => `${num(q.qty)} ${esc(mat(q.mat).uom)}`, cls: 'num', w: '90px' },
        { h: 'Unit price excl. VAT', r: (q) => vnd(q.price), cls: 'num', w: '150px' }, { h: 'Sent · valid until', r: (q) => `${esc(q.date)} · ${esc(q.valid)}`, w: '170px' }, { h: 'Status', r: (q) => pill(q.status, 'info'), w: '90px' }
      ], P().quotes, { min: 760, label: 'Spot quotations', empty: 'No quotations' }));
  }

  /* ---------- F-92 / F-93 POs ---------- */
  function poList() {
    const rows = myPos();
    return head(esc(App.t('Purchase orders')), 'Confirm new POs within 48 h · every revision needs your re-confirmation')
      + card(`Purchase orders (${rows.length})`, table([
        { h: 'PO', r: (d) => `<a class="mono" href="#/supplier/pos/${esc(d.id)}">${esc(d.id)}</a> <span class="small muted">Rev.${App.po.det(d.id).rev}</span><div class="small">${esc(d.title)}</div>`, w: 'minmax(220px,2fr)' },
        { h: 'Material IDs', r: (d) => `<span class="chips chips-inline">${d.mats.map(mtag).join('')}</span>`, w: '130px' },
        { h: 'Ordered', r: (d) => esc(d.qty), cls: 'num', w: '100px' },
        { h: 'Delivered · accepted', r: (d) => { const r = App.po.sched(d.id); return `${num(r.reduce((a, x) => a + x.delivered, 0))} · ${num(r.reduce((a, x) => a + x.accepted, 0))}`; }, cls: 'num', w: '140px' },
        { h: 'Value excl. VAT', r: (d) => vnd(d.value), cls: 'num', w: '150px' },
        { h: 'Status', r: (d) => { const p = App.po.det(d.id); const c = p.confirm; return pill(d.status, /declined|not confirmed/.test(d.status) ? 'danger' : /Closed|Delivered|Confirmed/.test(d.status) ? 'success' : 'warning') + (c && c.status === 'Awaiting re-confirmation' ? `<div>${pill('Re-confirm Rev.' + p.rev, 'warning')}</div>` : ''); }, w: '170px' },
        { h: 'Next delivery', r: (d) => { const o = App.po.openSlots(d.id)[0]; return o ? `${num(o.qty)} ${esc(mat(o.mat).uom)} · ${esc(o.due)}` : '—'; }, w: '140px' },
        { h: 'Action', r: (d) => { const c = App.po.det(d.id).confirm; return c && /Not confirmed|Awaiting/.test(c.status) ? `<a class="btn btn-sm btn-p" href="#/supplier/pos/${esc(d.id)}">${c.status === 'Not confirmed' ? 'Confirm / decline' : 'Re-confirm'}</a>` : `<a class="btn btn-sm" href="#/supplier/pos/${esc(d.id)}">Open</a>`; }, w: '150px' }
      ], rows, { min: 1180, label: 'My purchase orders' }));
  }
  function poDetail(id, mode) {
    const d = S.docOf(id);
    if (!d || d.type !== 'PO' || d.vendor !== VID() || !myPos().includes(d)) return App.errorState(`Purchase order ${id} was not found in your portal.`, ' <a href="#/supplier/pos">Back to purchase orders</a>');
    if (mode === 'print') return App.po.print(d, '#/supplier/pos');
    const p = App.po.det(id); const c = p.confirm || {}; const tt = App.po.vatSplit(id); const rows = App.po.sched(id);
    const pend = p.revs.find((r) => /Pending/.test(r.status));
    const conf = c.status === 'Not confirmed' || c.status === 'Awaiting re-confirmation';
    const dec = st.dec ? `<form id="sp-dec" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">Decline ${esc(id)}</h3>${S.field('spd', st.derr ? { reason: st.derr } : {}, 'reason', 'Reason', st.dec.reason, { area: true, req: true, hint: 'Sent to the buyer, e.g. "Không đủ hàng D20 trước 12/11"' })}<div class="row-acts"><button type="button" class="btn btn-sm" data-sp="dec-cancel">Back</button><button type="submit" class="btn btn-sm btn-d">Decline PO</button></div></form>` : '';
    const confirmBody = c.status === 'Confirmed' ? `<p class="mt-0">${pill('Confirmed', 'success')} by ${esc(c.by)} · ${esc(c.at)}${c.note ? ' · ' + esc(c.note) : ''}</p>`
      : c.status === 'Declined' ? `<div class="alert alert-danger" role="status"><b>Declined.</b> ${esc(c.note)}</div>`
        : `<div class="alert alert-warning" role="status"><b>${esc(c.status === 'Not confirmed' ? 'Waiting for your confirmation' : `Rev.${p.rev} waits for your re-confirmation`)}.</b> Sent ${esc(c.sent || '')}${c.note ? ' · ' + esc(c.note) : ''}</div>`;
    const confirmCard = card('Your confirmation', confirmBody + (pend ? `<div class="alert alert-info" role="status">Rev.${pend.no} (${esc(pend.diff)}) is pending the buyer's approval. You will be asked to re-confirm once it is approved.</div>` : '') + dec,
      conf && !st.dec ? `${c.status === 'Not confirmed' ? '<button class="btn btn-sm btn-d" data-sp="dec-open">Decline</button>' : ''}<button class="btn btn-sm btn-p" data-sp="confirm">${c.status === 'Not confirmed' ? 'Confirm PO' : `Re-confirm Rev.${p.rev}`}</button>` : '');
    const lines = card(`Lines (${p.lines.length})`, table([
      { h: 'Material ID', r: (l) => `${mtag(l.mat)}<div class="small">${esc(mat(l.mat).name)}</div>`, w: 'minmax(170px,2fr)' },
      { h: 'Qty', r: (l) => `${num(l.qty - (l.cancelled || 0))} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '100px' },
      { h: 'Unit price excl. VAT', r: (l) => vnd(l.price), cls: 'num', w: '140px' }, { h: 'VAT', r: (l) => esc(S.vatLabel(mat(l.mat).vat)), w: '110px' },
      { h: 'Amount excl. VAT', r: (l) => vnd((l.qty - (l.cancelled || 0)) * l.price), cls: 'num', w: '150px' }
    ], p.lines, { min: 680, label: 'PO lines' }) + `<dl class="dl dl-tot mt"><dt>Total excl. VAT</dt><dd>${vnd(tt.net)}</dd><dt>VAT</dt><dd>${vnd(tt.vat)}</dd><dt class="tot">Total incl. VAT</dt><dd class="tot"><b>${vnd(tt.gross)}</b></dd></dl>`);
    const sch = card('Delivery schedule', table([
      { h: 'Material ID', r: (r) => mtag(r.mat), w: '120px' }, { h: 'Qty', r: (r) => `${num(r.qty)} ${esc(mat(r.mat).uom)}`, cls: 'num', w: '90px' },
      { h: 'Promised', r: (r) => `${esc(r.due)}${r.ncr ? `<div class="small muted">Replacement · ${esc(r.ncr)}</div>` : ''}`, w: '140px' },
      { h: 'Receipt', r: (r) => (r.g ? `<span class="mono">${esc(r.gid)}</span> ${esc(r.date)}` : r.rec ? 'Archived' : r.cx ? pill('Cancelled', 'danger') : r.asn ? pill('ASN ' + r.asn.id, 'info') : 'Open'), w: '160px' },
      { h: 'Accepted · rejected', r: (r) => (r.rec ? `${num(r.accepted)} · ${num(r.rejected)}` : '—'), cls: 'num', w: '130px' },
      { h: 'On time · in full', r: (r) => (r.onTime == null ? '—' : `${pill(r.onTime ? 'On time' : 'Late', r.onTime ? 'success' : 'danger')} ${pill(r.inFull ? 'In full' : 'Short', r.inFull ? 'success' : 'danger')}`), w: '170px' }
    ], rows, { min: 820, label: 'Delivery schedule' }) + '<p class="small muted">Send ASNs and ask for date changes under Deliveries.</p>');
    const revs = card('Revisions', p.revs.length ? `<ol class="plain rev-list">${p.revs.map((r) => `<li><b>Rev.${r.no}</b> ${pill(r.status, /Pending|awaiting/.test(r.status) ? 'warning' : 'neutral')} <span class="small muted">${esc(r.at)}</span><div class="small">${esc(r.diff)}</div></li>`).join('')}</ol>` : '<p class="small muted mt-0">Original issue.</p>');
    return head(`<span class="mono">${esc(id)}</span> <span class="small muted">Rev.${p.rev}</span> ${esc(d.title)}`, `${pill(d.status, /declined|not confirmed/.test(d.status) ? 'danger' : 'info')} · buyer ${esc(p.buyer)} · ${esc(p.site)} · ${esc(p.terms)}`,
      `<a class="btn" href="#/supplier/pos/${esc(id)}/print">Printable PO</a><button class="btn" data-act="toast" data-msg="${esc(id)}_Rev${p.rev}.pdf downloaded">Download PDF</button>`, '<a href="#/supplier/pos">Purchase orders</a> / ' + esc(id))
      + `<div class="grid-2"><div class="stack">${lines}${sch}</div><div class="stack">${confirmCard}${revs}</div></div>`;
  }

  /* ---------- F-93 deliveries + F-96 NCR ---------- */
  function deliveries() {
    const open = myPos().filter((d) => !/declined|Cancelled|Closed/.test(d.status) && App.po.det(d.id).confirm && App.po.det(d.id).confirm.status === 'Confirmed').flatMap((d) => App.po.openSlots(d.id).map((r) => Object.assign({ po: d.id }, r)));
    const a = st.asn; const ae = st.aerr; const ch = st.chg; const ce = st.cerr;
    const forms = (a ? `<form id="sp-asn" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">Advance shipping notice · ${esc(a.po)} · ${esc(a.mat)}</h3><div class="form-grid">${S.field('spa', ae, 'ship', 'Ship date', a.ship, { req: true, ph: 'dd/mm/yyyy' })}${S.field('spa', ae, 'qty', `Quantity (${mat(a.mat).uom})`, a.qty, { req: true, mode: 'decimal' })}${S.field('spa', ae, 'vehicle', 'Vehicle / driver', a.vehicle, { req: true, ph: '51C-123.45 · Nguyễn Văn A' })}${S.field('spa', ae, 'docs', 'CO/CQ file', a.docs, { ph: 'CQ_lot.pdf', hint: /^CON-240/.test(a.mat) ? 'Mill certificate required for steel' : 'Optional' })}</div><div class="row-acts"><button type="button" class="btn btn-sm" data-sp="asn-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Send ASN</button></div></form>` : '')
      + (ch ? `<form id="sp-chg" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">Request a delivery date change · ${esc(ch.po)} · ${esc(ch.mat)} (now ${esc(ch.due)})</h3><div class="form-grid">${S.field('spc', ce, 'to', 'New date', ch.to, { req: true, ph: 'dd/mm/yyyy' })}${S.field('spc', ce, 'reason', 'Reason', ch.reason, { area: true, req: true })}</div><p class="small muted mt-0">The buyer must accept. On-time is measured against the date the buyer accepted.</p><div class="row-acts"><button type="button" class="btn btn-sm" data-sp="chg-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Send request</button></div></form>` : '');
    const sched = card(`Open deliveries (${open.length})`, table([
      { h: 'PO', r: (r) => `<a class="mono" href="#/supplier/pos/${esc(r.po)}">${esc(r.po)}</a>`, w: '130px' }, { h: 'Material ID', r: (r) => mtag(r.mat), w: '120px' },
      { h: 'Qty', r: (r) => `${num(r.qty)} ${esc(mat(r.mat).uom)}`, cls: 'num', w: '90px' },
      { h: 'Promised', r: (r) => `${esc(r.due)}${r.ncr ? `<div class="small muted">Replacement · ${esc(r.ncr)}</div>` : ''}${r.req ? `<div class="small">${pill(r.req.status, /Pending/.test(r.req.status) ? 'warning' : /Accepted/.test(r.req.status) ? 'success' : 'danger')} → ${esc(r.req.to)}</div>` : ''}`, w: '170px' },
      { h: 'ASN', r: (r) => (r.asn ? `${pill(r.asn.id, 'info')}<div class="small">ship ${esc(r.asn.ship)} · ${num(r.asn.qty)}</div>` : '—'), w: '150px' },
      { h: 'Actions', r: (r) => `<button class="btn btn-sm" data-sp="asn-open" data-po="${esc(r.po)}" data-li="${r.li}" data-si="${r.si}"${r.asn ? ' disabled' : ''}>Send ASN</button> <button class="btn btn-sm" data-sp="chg-open" data-po="${esc(r.po)}" data-li="${r.li}" data-si="${r.si}"${r.req && /Pending/.test(r.req.status) ? ' disabled' : ''}>Change date</button>`, w: 'minmax(230px,1.4fr)' }
    ], open, { min: 940, label: 'Open deliveries', empty: 'No open deliveries' }) + forms);
    const grns = myGrns();
    const gcard = card(`Recent goods receipts (${grns.length})`, table([
      { h: 'GRN', r: (g) => `<span class="mono">${esc(g.id)}</span><div class="small muted">${esc(g.date)}</div>`, w: '140px' }, { h: 'PO', r: (g) => `<a class="mono" href="#/supplier/pos/${esc(g.po)}">${esc(g.po)}</a>`, w: '130px' },
      { h: 'Accepted · rejected', r: (g) => g.lines.map((x) => `${num(x[3])} · ${num(x[4])}`).join('<br>'), cls: 'num', w: '130px' },
      { h: 'On time · in full', r: (g) => { const r = App.po.sched(g.po).filter((x) => x.gid === g.id); return r.map((x) => `${pill(x.onTime ? 'On time' : 'Late', x.onTime ? 'success' : 'danger')} ${pill(x.inFull ? 'In full' : 'Short', x.inFull ? 'success' : 'danger')}`).join('<br>') || '—'; }, w: 'minmax(170px,1.4fr)' }
    ], grns.slice(0, 8), { min: 620, label: 'Goods receipts' }));
    const ncrs = myNcr();
    const ncrCard = card(`Non-conformance reports (${ncrs.length})`, ncrs.length ? `<ul class="plain ncr-list">${ncrs.map((n) => { const g = D().grns[n.grn]; const gl = g && g.lines.find((x) => x[4] || x[3] < x[2]) || (g && g.lines[0]); const open = n.status !== 'Closed';
      const form = st.ncr && st.ncr.id === n.id ? `<form id="sp-ncr" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">Your response</h3>${S.field('spn', st.nerr, 'opt', 'Proposed action', st.ncr.opt, { options: ['Replace', 'Return and credit note', 'Offer a discount'] })}${S.field('spn', st.nerr, 'disc', 'Discount % (if offering a discount)', st.ncr.disc, { mode: 'decimal' })}${S.field('spn', st.nerr, 'comment', 'Comment', st.ncr.comment, { area: true, req: true, hint: 'e.g. "Gửi bổ sung CQ lô 2 ngày 04/11, thay 15 tấn nếu không đạt"' })}<div class="row-acts"><button type="button" class="btn btn-sm" data-sp="ncr-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Send response</button></div></form>` : '';
      return `<li><div class="row-acts between"><span><b class="mono">${esc(n.id)}</b> ${mtag(n.mat)} ${pill(n.status, open ? 'warning' : 'success')}</span>${open && !n.response && !st.ncr ? `<button class="btn btn-sm btn-p" data-sp="ncr-open" data-id="${esc(n.id)}">Respond</button>` : ''}</div>
        <div class="small">${esc(n.grn)} · ${esc(n.po)} · delivered ${gl ? num(gl[2]) : '—'} · accepted ${gl ? num(gl[3]) : '—'} · rejected ${num(n.qty)} ${esc(mat(n.mat).uom)}</div>
        <div class="small">Reason: ${esc(gl ? gl[5] : '')} · inspector ${esc(n.by)} · buyer asks: ${esc(n.action)}${n.discount ? ' ' + num(n.discount) + '%' : ''}</div>
        ${g ? `<div class="small muted">Documents: ${g.checks.map(([c, ok]) => `${esc(c)} ${ok ? 'OK' : 'missing'}`).join(' · ')}</div>` : ''}
        ${n.response ? `<div class="small tone-success">Your response ${esc(n.response.at)}: ${esc(n.response.opt)}${n.response.disc ? ' ' + num(n.response.disc) + '%' : ''} — ${esc(n.response.comment)}</div>` : ''}
        ${open ? `<div class="small tone-warning">The rejected ${num(n.qty)} ${esc(mat(n.mat).uom)} cannot be invoiced until the NCR is closed.</div>` : ''}${form}</li>`; }).join('')}</ul>` : App.emptyState('No NCRs'));
    return head(esc(App.t('Deliveries')), 'Advance shipping notices, delivery date changes, goods receipts and NCRs') + `<div class="stack">${sched}${ncrCard}${gcard}</div>`;
  }

  /* ---------- F-95 invoices ---------- */
  const invoicedQtyGrn = (gid) => Object.values(D().invoices).filter((v) => v.grn === gid && v.type !== 'Replacement').reduce((a, v) => a + v.lines.reduce((s, x) => s + (x[0] ? x[2] : 0), 0), 0);
  const billable = () => myGrns().filter((g) => !D().grns[g.id].ses).map((g) => ({ g, acc: g.lines.reduce((a, x) => a + x[3], 0) - invoicedQtyGrn(g.id) })).filter((x) => x.acc > 0);
  function parsed(f) {
    const g = D().grns[f.grn]; const p = App.po.det(g.po); const gl = g.lines[0]; const l = p.lines[gl[0]]; const m = mat(l.mat);
    const qty = f.type === 'Original' ? billable().find((x) => x.g.id === f.grn).acc : gl[3];
    const no = String(1250 + Object.keys(D().invoices).length).padStart(8, '0');
    return { mau: '1', kh: '1C26TMP', no, date: D().today, mst: V().mst, cqt: '00' + (f.xml.length * 7919 + 1e9).toString(16).toUpperCase().padEnd(32, 'A').slice(0, 32), sig: 'Valid · Công ty TNHH Thép Minh Phát', line: [l.mat, m.name, qty, l.price, 0], vat: m.vat, net: qty * l.price, po: g.po, grn: f.grn, li: gl[0] };
  }
  function invoices() {
    const rows = myInv(); const f = st.inv; const e = st.ierr; const bl = billable();
    const list = card(`My invoices (${rows.length})`, rows.length ? `<ul class="plain rows">${rows.map((d) => { const v = D().invoices[d.id]; const i = stageOf(d); const due = App.addDays(d.date, termsDays());
      return `<li><div class="row-acts between"><span><b class="mono">${esc(d.id)}</b> <span class="small mono">${esc(v.kh)} · ${esc(v.no)}</span> ${pill(v.type, 'neutral')} ${pill(d.status, /Ready|Paid|Matched/.test(d.status) ? 'success' : /Blocked|Exception/.test(d.status) ? 'danger' : 'info')}<div class="small">${esc(d.title)} · ${esc(v.po)} · ${esc(v.grn)} · ${vnd(d.value)} excl. VAT</div></span><span class="small num">Invoice ${esc(d.date)}<br>Due <b>${esc(due)}</b></span></div>
        ${steps(STAGES, i, d.id + ' status')}${v.exported ? `<div class="small muted">Exported to accounting ${esc(v.exported.slice(0, 10))} · payment run follows the due date</div>` : ''}${v.orig ? `<div class="small muted">Replaces ${esc(v.orig)}</div>` : ''}</li>`; }).join('')}</ul>` : App.emptyState('No invoices yet'),
      f ? '' : `<button class="btn btn-sm btn-p" data-sp="inv-open"${bl.length ? '' : ' disabled'}>Submit e-invoice</button>`);
    let form = '';
    if (f) {
      const px = f.parsed;
      form = card('Submit an e-invoice', `<form id="sp-inv" class="stack" novalidate>${e._ ? `<div class="alert alert-danger" role="alert">${esc(e._)}</div>` : ''}<div class="form-grid">
        ${S.field('spi', e, 'grn', 'Goods receipt', f.grn, { options: bl.map((x) => [x.g.id, `${x.g.id} · ${x.g.po} · ${num(x.acc)} accepted, not invoiced`]) })}
        ${S.field('spi', e, 'type', 'Invoice type', f.type, { options: ['Original', 'Adjustment', 'Replacement'] })}
        ${f.type !== 'Original' ? S.field('spi', e, 'orig', 'Original invoice', f.orig, { options: [['', 'Choose…']].concat(rows.map((d) => [d.id, `${d.id} · ${D().invoices[d.id].kh} · ${D().invoices[d.id].no}`])), req: true }) : ''}
        ${S.field('spi', e, 'xml', 'XML file', f.xml, { req: true, ph: 'e.g. 1C26TMP_00001262.xml', hint: 'Signed XML from your e-invoice provider' })}${S.field('spi', e, 'pdf', 'PDF file', f.pdf, { req: true, ph: 'e.g. 1C26TMP_00001262.pdf' })}</div>
        <div class="row-acts start"><button type="button" class="btn btn-sm" data-sp="inv-parse">Read XML</button></div>
        ${px ? `<h3 class="h-sub">Fields read from the XML</h3><dl class="dl"><dt>Mẫu · ký hiệu · số</dt><dd class="mono">${esc(px.mau)} · ${esc(px.kh)} · ${esc(px.no)}</dd><dt>Invoice date</dt><dd>${esc(px.date)}</dd><dt>Seller MST</dt><dd>${esc(px.mst)}</dd><dt>Mã CQT</dt><dd class="mono small">${esc(px.cqt)}</dd><dt>Seller signature</dt><dd>${esc(px.sig)}</dd></dl>
          <div class="chips">${[['XML schema', true], ['Seller signature', true], ['Seller MST = profile', px.mst === V().mst], ['Mã CQT present', !!px.cqt], ['Material ID mapped', true], ['Qty ≤ GRN accepted', true]].map(([n, ok]) => pill((ok ? '✓ ' : '! ') + n, ok ? 'success' : 'danger')).join(' ')}</div>
          ${table([{ h: 'Invoice line', r: (x) => esc(x[1]), w: 'minmax(180px,2fr)' }, { h: 'Material ID', r: (x) => mtag(x[0]), w: '120px' }, { h: 'PO line · GRN', r: () => `${esc(px.po)} L${px.li + 1} · ${esc(px.grn)}`, w: '200px' }, { h: 'Qty', r: (x) => num(x[2]), cls: 'num', w: '70px' }, { h: 'Unit price', r: (x) => vnd(x[3]), cls: 'num', w: '130px' }, { h: 'Amount excl. VAT', r: (x) => vnd(x[2] * x[3]), cls: 'num', w: '150px' }], [px.line], { min: 860, label: 'Parsed invoice lines' })}
          <dl class="dl dl-tot mt"><dt>Excl. VAT</dt><dd>${vnd(px.net)}</dd><dt>VAT ${esc(S.vatLabel(px.vat))}</dt><dd>${vnd(px.net * px.vat / 100)}</dd><dt class="tot">Total</dt><dd class="tot"><b>${vnd(px.net * (1 + px.vat / 100))}</b></dd></dl>` : '<p class="small muted mt-0">Read the XML to check the fields before you submit.</p>'}
        <div class="row-acts"><button type="button" class="btn btn-sm" data-sp="inv-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Submit invoice</button></div></form>`);
    }
    return head(esc(App.t('Invoices')), `E-invoices (XML + PDF) against your goods receipts · payment terms ${esc((V() || {}).terms || '')}`) + `<div class="stack">${form}${list}<p class="small muted">Status: Submitted → Validated (legal checks, GDT lookup) → Matched (PO · GRN · invoice) → Ready for payment → Paid. Due date = invoice date + payment terms (${termsDays()} days). Rejected quantities under an open NCR cannot be invoiced.</p></div>`;
  }
  function readInv(root) { const x = S.read(root, '#sp-inv'); const f = st.inv; const ch = f.grn !== x.grn || f.type !== x.type || f.xml !== x.xml; Object.assign(f, x); if (ch) f.parsed = null; }
  function submitInv(root) {
    readInv(root); const f = st.inv; const e = {};
    if (!/\.xml$/i.test(f.xml || '')) e.xml = 'Attach the signed XML (.xml).'; if (!/\.pdf$/i.test(f.pdf || '')) e.pdf = 'Attach the PDF (.pdf).';
    if (f.type !== 'Original' && !f.orig) e.orig = 'Choose the invoice this one adjusts or replaces.';
    if (!Object.keys(e).length && !f.parsed) e._ = 'Read the XML first and check the fields.';
    st.ierr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#sp-inv'); return; }
    const px = f.parsed; const id = 'INV-2026-' + String(Math.max(...D().docs.filter((d) => d.type === 'INV').map((d) => +d.id.slice(9))) + 1).padStart(4, '0');
    const o = f.orig && D().invoices[f.orig];
    D().invoices[id] = { po: px.po, grn: px.grn, mau: px.mau, kh: px.kh, no: px.no, cqt: px.cqt, src: 'Portal', type: f.type, orig: o ? `${o.kh} · ${o.no} (${f.orig})` : undefined, lines: [px.line], stage: 0, files: [f.xml, f.pdf] };
    D().docs.push({ id, type: 'INV', title: `${mat(px.line[0]).name} – ${px.grn}`, date: D().today, status: 'Submitted · to match', mats: [px.line[0]], vendor: VID(), value: px.net });
    if (D().invoiceStats) D().invoiceStats.total++;
    notify(`${id} submitted by ${App.vshort(V())} via portal · ${px.grn} · ${vnd(px.net)} excl. VAT`, id, '#/invoices/' + id, [px.line[0]]);
    st.inv = null; App.render(); App.toast(`${id} submitted · ${px.kh} ${px.no} · status Submitted`);
  }

  /* ---------- F-94 contracts, certificates, scorecard ---------- */
  function contracts() {
    const cs = myCts();
    return head(esc(App.t('Contracts')), 'Your contracts with consumption by Material ID') + `<div class="stack">${cs.map((c) => { const d = S.docOf(c.id) || {}; const com = c.lines.reduce((a, l) => a + l.commit, 0); const rel = c.lines.reduce((a, l) => a + l.released, 0); const used = com ? rel / com * 100 : 0;
      return card(`${c.id} · ${d.title || ''}`, `<p class="mt-0">${pill(d.status || '', d.status === 'Expiring' ? 'warning' : d.status === 'Active' ? 'success' : 'neutral')} ${esc(c.ctype)} · ${esc(c.start)} – ${esc(c.end)} · ${esc(c.esign)}</p>
        <div class="grid-k">${kpi('Consumed', pct(used, 0), `${num(rel)} of ${num(com)} committed`)}${kpi('Ceiling', App.ty(c.ceiling), 'excl. VAT')}${kpi('Expires', esc(c.end), App.daysTo(c.end) >= 0 ? `${App.daysTo(c.end)} days` : 'Expired', App.daysTo(c.end) <= 60 ? 'warning' : '')}</div>
        ${S.bar(used)}
        ${table([{ h: 'Material ID', r: (l) => mtag(l.mat), w: '120px' }, { h: 'Price Q4 excl. VAT', r: (l) => (l.q4 ? vnd(l.q4) : '—'), cls: 'num', w: '150px' }, { h: 'Committed', r: (l) => num(l.commit), cls: 'num', w: '100px' }, { h: 'Released', r: (l) => num(l.released), cls: 'num', w: '100px' }, { h: 'Left', r: (l) => num(l.commit - l.released), cls: 'num', w: '90px' }], c.lines, { min: 600, label: 'Contract lines' })}
        <h3 class="h-sub">Releases (${c.releases.length})</h3><ul class="plain small">${c.releases.slice(-5).reverse().map((r) => `<li><span class="mono">${esc(r[0])}</span> · ${esc(r[1])} · ${num(r[2])} · ${vnd(r[3])} · ${esc(r[4])}</li>`).join('')}</ul>
        ${d.status === 'Expiring' ? `<div class="alert alert-warning" role="status">Expires ${esc(c.end)}. The buyer is reminded 90 / 60 / 30 days before; renewal is negotiated outside the portal.</div>` : ''}`); }).join('') || App.emptyState('No contracts')}</div>`;
  }
  function certificates() {
    const cs = myCerts(); const f = st.cert; const e = st.terr;
    const form = f ? `<form id="sp-cert" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">Upload renewal${f.replaces ? ' for ' + esc(f.replaces) : ''}</h3><div class="form-grid">${S.field('spt', e, 'type', 'Type', f.type, { req: true })}${S.field('spt', e, 'no', 'Certificate no.', f.no, { req: true })}${S.field('spt', e, 'issuer', 'Issuer', f.issuer, { req: true })}${S.field('spt', e, 'expiry', 'Valid until', f.expiry, { req: true, ph: 'dd/mm/yyyy' })}${S.field('spt', e, 'file', 'File', f.file, { req: true, ph: 'certificate.pdf' })}</div>
      <p class="small muted mt-0">Scope: ${f.mats.map(esc).join(', ')}. The buyer reviews it; until then the current certificate stays in force.</p><div class="row-acts"><button type="button" class="btn btn-sm" data-sp="cert-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Upload</button></div></form>` : '';
    return head(esc(App.t('Certificates')), 'Certificates required by your Material IDs · upload renewals before they expire') + card(`Certificates (${cs.length})`, table([
      { h: 'Type', r: (c) => `${esc(c.type)}<div class="small mono muted">${esc(c.no)}</div>`, w: 'minmax(200px,2fr)' },
      { h: 'Material IDs', r: (c) => `<span class="chips chips-inline">${c.mats.map(mtag).join('')}</span>`, w: 'minmax(150px,1.4fr)' },
      { h: 'Issuer', r: (c) => esc(c.issuer), w: 'minmax(140px,1.2fr)' }, { h: 'Valid until', r: (c) => `<span class="nowrap">${esc(c.expiry)}</span>`, w: '110px' },
      { h: 'Status', r: (c) => pill(certStatus(c), cTone(certStatus(c))) + (c.replaces ? `<div class="small muted">Renews ${esc(c.replaces)}</div>` : ''), w: '150px' },
      { h: '', r: (c) => (certStatus(c) === 'Renewal due' || certStatus(c) === 'Expired') && !cs.some((x) => x.replaces === c.id) && !f ? `<button class="btn btn-sm btn-p" data-sp="cert-open" data-id="${esc(c.id)}">Upload renewal</button>` : '', w: '160px' }
    ], cs, { min: 960, label: 'My certificates' }) + form, f ? '' : '<button class="btn btn-sm" data-sp="cert-open">Upload certificate</button>');
  }
  function scorecard() {
    const v = V(); const sc = D().scorecards.find((x) => x.vendor === VID()); const tpl = sc && D().evalTemplates.find((x) => x.id === sc.tpl); const ov = D().reports.otifVendors[VID()];
    const ncrs = myNcr(); const hist = D().scoreHistory[VID()] || [];
    return head(esc(App.t('Scorecard')), 'Your own evaluation · other vendors are never shown')
      + `<div class="grid-k">${kpi('Score', v.score ? `${num(v.score, 2)} · ${esc(v.grade)}` : '—', sc ? `${esc(sc.period)} · ${esc(sc.status)}` : 'Not evaluated')}${kpi('OTIF', v.otif != null ? pct(v.otif) : '—', ov ? `${num(ov[0])} deliveries · on time ${pct(ov[1])} · in full ${pct(ov[2])}` : '', v.otif >= 95 ? 'success' : 'warning')}${kpi('NCRs', String(ncrs.length), `${ncrs.filter((n) => n.status !== 'Closed').length} open`, ncrs.some((n) => n.status !== 'Closed') ? 'warning' : '')}${kpi('Status', esc(v.status), 'Grade A ≥ 4,2 = Preferred')}</div>
      <div class="grid-2"><div class="stack">${sc && tpl ? card(`Criteria · ${esc(sc.period)}`, table([
        { h: 'Criterion', r: (c) => `${esc(c.name)}<div class="small muted">${esc(c.src)} · weight ${c.w}%</div>`, w: 'minmax(200px,2fr)' },
        { h: 'Score', r: (c) => (sc.scores[tpl.criteria.indexOf(c)] != null ? num(sc.scores[tpl.criteria.indexOf(c)], 1) : '—'), cls: 'num', w: '80px' },
        { h: 'Evidence', r: (c) => esc(sc.evidence[tpl.criteria.indexOf(c)] || '—'), w: 'minmax(220px,2fr)' }
      ], tpl.criteria, { min: 640, label: 'Scorecard criteria' }) + (sc.comment ? `<p class="small">Buyer comment: “${esc(sc.comment)}”</p>` : '')) : App.emptyState('Not evaluated yet')}</div>
      <div class="stack">${card('Trend', hist.length ? `<ul class="plain">${hist.map(([q, s]) => `<li class="row-acts between"><span>${esc(q)}</span><b>${num(s, 2)}</b></li>`).join('')}</ul>` : '<p class="muted small">No history</p>')}${card('Grades', `<ul class="plain small">${D().grades.map(([g, min, s]) => `<li>${esc(g)} · ≥ ${num(min, 1)} · ${esc(s)}</li>`).join('')}</ul>`)}</div></div>`;
  }

  /* ---------- F-97 / F-98 profile ---------- */
  function profile() {
    const v = V(); const pt = P(); const b = v.bank || {}; const k = st.bank; const ke = st.kerr; const offered = D().materials.filter((m) => m.vendors.some((x) => x[0] === VID()));
    const ck = pt.checklist; const done = ck.filter((x) => x[1] === 'Done').length;
    const mst = st.mst;
    const usable = D().materials.filter((m) => m.id.startsWith(v.cat === 'Construction' ? 'CON' : v.cat.slice(0, 3).toUpperCase()) && !offered.includes(m) && !(v.proposed || []).includes(m.id));
    const u = D().users.find((x) => x.vendor === VID() && x.name === S.me()) || {};
    return head(esc(App.t('Company profile')), `${esc(v.name)} · profile ${pct(ck.length ? done / ck.length * 100 : 0, 0)} complete`)
      + `<div class="grid-2"><div class="stack">${card('Company', `<form id="sp-prof" class="stack" novalidate><div class="form-grid">
        <div class="field"><label for="spp-name">Company name</label><input id="spp-name" value="${esc(v.name)}" readonly aria-readonly="true"><span class="hint">Changes go through the buyer (legal name = Giấy CNĐKDN)</span></div>
        <div class="field"><label for="spp-mst">MST (tax code)</label><input id="spp-mst" name="mst" value="${esc(mst ? mst.v : v.mst)}" inputmode="numeric"${mst && mst.err ? ' aria-invalid="true" aria-describedby="spp-mst-e"' : ' aria-describedby="spp-mst-h"'}><span class="hint" id="spp-mst-h">10 digits, or 13 for a branch (0315284671-001)</span>${mst && mst.err ? `<span class="err" id="spp-mst-e" role="alert">${esc(mst.err)}</span>` : ''}</div>
        <div class="field"><label for="spp-rep">Legal representative</label><input id="spp-rep" name="rep" value="${esc(pt.legalRep || '')}"></div>
        <div class="field"><label for="spp-mail">Contact Gmail</label><input id="spp-mail" name="mail" value="${esc(v.email)}" readonly aria-readonly="true"><span class="hint">Your sign-in address</span></div>
        <div class="field"><label for="spp-ph">Phone</label><input id="spp-ph" name="phone" value="${esc(v.phone || '')}"></div>
        <div class="field"><label for="spp-ad">Address</label><input id="spp-ad" name="address" value="${esc(v.address || '')}"></div></div>
        ${mst && mst.ok ? `<div class="alert alert-info" role="status">GDT: <b>${esc(mst.ok)}</b> · checked ${esc(D().today)}</div>` : `<p class="small muted mt-0">Last MST check ${esc(v.mstChecked || pt.mstVerified)} · ${esc(v.taxStatus || '')}</p>`}
        <div class="row-acts"><button type="button" class="btn btn-sm" data-sp="mst">Check MST</button><button type="submit" class="btn btn-sm btn-p">Save profile</button></div></form>`)}
      ${card('Bank account', `<dl class="dl"><dt>In use</dt><dd>${esc(b.now || '—')}</dd>${b.pending ? `<dt>New account</dt><dd>${esc(b.pending)} ${pill('Pending Finance verification', 'warning')}<div class="small muted">Requested ${esc(b.requested)} · Finance calls back on the number in your profile before payments use it</div></dd>` : ''}</dl>
        ${k ? `<form id="sp-bank" class="stack mt decide-panel" novalidate><div class="form-grid">${S.field('spk', ke, 'bank', 'Bank', k.bank, { req: true, ph: 'Vietcombank' })}${S.field('spk', ke, 'acct', 'Account number', k.acct, { req: true, mode: 'numeric' })}${S.field('spk', ke, 'holder', 'Account holder', k.holder, { req: true, hint: 'Must equal the company name' })}${S.field('spk', ke, 'letter', 'Bank confirmation letter', k.letter, { req: true, ph: 'xac-nhan-tk.pdf' })}</div><div class="row-acts"><button type="button" class="btn btn-sm" data-sp="bank-cancel">Cancel</button><button type="submit" class="btn btn-sm btn-p">Request change</button></div></form>` : ''}`,
        k || b.pending ? '' : '<button class="btn btn-sm" data-sp="bank-open">Change bank account</button>')}
      ${card('Material IDs offered', `<ul class="plain">${offered.map((m) => `<li class="row-acts between"><span>${mtag(m.id)} ${esc(m.name)}</span>${pill(m.vendors.find((x) => x[0] === VID())[1], 'success')}</li>`).join('')}${(v.proposed || []).map((id) => `<li class="row-acts between"><span>${mtag(id)} ${esc(mat(id).name)}</span>${pill('Proposed · awaiting buyer approval', 'neutral')}</li>`).join('')}</ul>
        ${usable.length ? `<form id="sp-prop" class="row-acts start mt" novalidate><label class="sr" for="spp-prop">Material ID to offer</label><select class="inp grow w-full" id="spp-prop" name="prop">${usable.map((m) => `<option value="${esc(m.id)}">${esc(m.id)} · ${esc(m.name)}</option>`).join('')}</select><button type="submit" class="btn btn-sm">Propose</button></form>` : ''}`)}</div>
      <div class="stack">${card(`Onboarding checklist (${done} / ${ck.length})`, `<ul class="plain">${ck.map(([x, s]) => `<li class="row-acts between"><span>${esc(x)}</span>${pill(s, s === 'Done' ? 'success' : 'warning')}</li>`).join('')}</ul>`)}
      ${card('Privacy & consent', `<p class="mt-0">Privacy notice <b>${esc(D().privacy.current)}</b> accepted ${esc(u.consent || '—')} by ${esc(S.me())}.</p><p class="small muted">Under Nghị định 13/2023 you can ask for a copy of your personal data or withdraw consent; withdrawing ends portal access for this user.</p>`, `<button class="btn btn-sm" data-act="toast" data-msg="Consent settings: request sent to the ProcureLink admin (R-25)">Manage consent</button>`)}</div></div>`;
  }

  /* ---------- routing ---------- */
  const PAGES = { '': overview, invitations: null, quotations, pos: null, deliveries, invoices, contracts, certificates, scorecard, profile };
  function render(params, sub) {
    const [sec = '', id, mode] = (sub || '').split('/');
    const key = sub || '';
    if (st.cur !== key) { Object.assign(st, { cur: key, bid: null, berr: {}, up: null, q: null, qerr: {}, dec: null, derr: '', asn: null, aerr: {}, chg: null, cerr: {}, ncr: null, nerr: {}, inv: null, ierr: {}, cert: null, terr: {}, bank: null, kerr: {}, mst: null }); }
    if (sec === 'invitations') return id ? invDetail(id) : invList();
    if (sec === 'pos') return id ? poDetail(id, mode) : poList();
    const fn = PAGES[sec]; return fn ? fn() : App.errorState(`Screen supplier/${sec} was not found.`, ' <a href="#/supplier">Back to overview</a>');
  }
  function mount(root) {
    const ctx = () => { const [sec, id] = (location.hash.replace(/^#\/?supplier\/?/, '').split('?')[0] || '').split('/'); return { sec, id }; };
    root.addEventListener('change', (e) => {
      const { sec, id } = ctx();
      if (sec === 'invitations' && id && e.target.closest('#sp-bid')) {
        if (!st.bid) st.bid = JSON.parse(JSON.stringify(bidOf(id))); readBid(root); const sb = e.target.dataset.sb; const i = e.target.dataset.i;
        if (sb === 'nobid') { App.render(); const x = document.querySelector(`[data-sb="nobid"][data-i="${i}"]`); x && x.focus(); return; }
        /* price / lead: update amounts and totals in place so focus stays where the user moved it */
        const t = D().tenders[id]; const tt = totals(t, st.bid.lines);
        t.lines.forEach((l, k) => { const c = document.getElementById('sb-a' + k); const x = st.bid.lines[k]; if (c) c.textContent = x.nobid || !x.price ? '—' : vnd(l.qty * x.price); });
        const tot = document.getElementById('sb-tot'); if (tot) tot.innerHTML = `${Object.entries(tt.by).sort((a, z) => z[0] - a[0]).map(([r, x]) => `<dt>VAT ${esc(S.vatLabel(r))} on</dt><dd>${vnd(x)} + VAT ${vnd(x * r / 100)}</dd>`).join('')}<dt>Total excl. VAT</dt><dd>${vnd(tt.net)}</dd><dt class="tot">Total incl. VAT</dt><dd class="tot"><b>${vnd(tt.gross)}</b></dd>`;
        if (sb === 'price' && st.bid.lines[i].price) e.target.value = num(st.bid.lines[i].price);
      }
      if (e.target.closest('#sp-inv') && /spi-(grn|type)/.test(e.target.id)) { readInv(root); const fid = e.target.id; App.render(); const x = document.getElementById(fid); x && x.focus(); }
    });
    root.addEventListener('submit', (e) => {
      const f = e.target; const { sec, id } = ctx(); if (!f.id || !/^sp/.test(f.id)) return; e.preventDefault();
      if (f.id === 'sp-bid') { if (!st.bid) st.bid = JSON.parse(JSON.stringify(bidOf(id))); saveBid(root, id, true); }
      else if (f.id === 'spf-up') { const b = st.bid || bidOf(id); st.up = S.upload(root, 'spf', b.files); if (st.bid) bidOf(id).files = st.bid.files; App.render(); }
      else if (f.id === 'sp-q') { const x = S.read(root, '#sp-q'); st.q = x; st.qerr = {}; if ((x.q || '').length < 10) { st.qerr.q = 'Write the question (at least 10 characters).'; App.render(); S.focusErr('#sp-q'); return; }
        const t = D().tenders[id]; (t.questions = t.questions || []).push({ line: x.line, q: x.q, at: clock(), from: VID() }); notify(`${id}: new bidder question on ${x.line} (anonymous)`, id, '#/tenders/' + id, [x.line]); st.q = null; App.render(); App.toast('Question sent · the answer is published to all bidders'); }
      else if (f.id === 'sp-dec') { const r = S.read(root, '#sp-dec').reason || ''; st.dec = { reason: r }; if (r.length < 10) { st.derr = 'Give a reason of at least 10 characters.'; App.render(); S.focusErr('#sp-dec'); return; } App.po.decline(id, r, S.me()); S.audit('Orders', `PO declined · ${r}`, id); st.dec = null; App.render(); App.toast(`${id} declined · buyer notified`); }
      else if (f.id === 'sp-asn') { const x = S.read(root, '#sp-asn'); const a = Object.assign(st.asn, x); const er = {};
        if (!S.validDate(a.ship)) er.ship = 'Use dd/mm/yyyy.'; else if (App.daysTo(a.ship) < 0) er.ship = 'Cannot be in the past.';
        const q = Number(String(a.qty).replace(',', '.')); if (!(q > 0) || q > a.max * 1.1) er.qty = `Enter 1 – ${num(a.max * 1.1)}.`; if (!a.vehicle) er.vehicle = 'Enter the vehicle and driver.'; if (/^CON-240/.test(a.mat) && !/\.pdf$/i.test(a.docs || '')) er.docs = 'Attach the mill certificate (PDF).';
        st.aerr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#sp-asn'); return; }
        const aid = 'ASN-2026-' + String(301 + P().asns.length).padStart(4, '0'); const slot = App.po.det(a.po).lines[a.li].sched[a.si]; slot[5] = { id: aid, ship: a.ship, qty: q, vehicle: a.vehicle, docs: a.docs };
        P().asns.push({ id: aid, po: a.po, mat: a.mat, ship: a.ship, qty: q }); notify(`${aid} · ${a.po} ships ${num(q)} ${mat(a.mat).uom} ${a.mat} on ${a.ship}`, a.po, '#/po/' + a.po, [a.mat]); st.asn = null; App.render(); App.toast(`${aid} sent to the buyer`); }
      else if (f.id === 'sp-chg') { const x = S.read(root, '#sp-chg'); const c = Object.assign(st.chg, x); const er = {};
        if (!S.validDate(c.to)) er.to = 'Use dd/mm/yyyy.'; else if (App.daysTo(c.to) <= 0) er.to = 'Choose a date after today.'; else if (c.to === c.due) er.to = 'Same as the current date.'; if ((c.reason || '').length < 10) er.reason = 'Give a reason of at least 10 characters.';
        st.cerr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#sp-chg'); return; }
        const p = App.po.det(c.po); const d = S.docOf(c.po); const rid = `${c.po} DC-${p.lines[c.li].sched[c.si][1].slice(0, 5).replace('/', '')}`;
        const req = { id: rid, po: c.po, li: c.li, si: c.si, from: c.due, to: c.to, reason: c.reason, status: 'Pending buyer acceptance', at: clock() }; p.lines[c.li].sched[c.si][6] = req;
        D().approvals.push({ id: rid, type: 'Delivery date change', title: `${App.vshort(V())} asks ${c.mat} ${c.due} → ${c.to}`, mats: [c.mat], value: null, by: S.me() + ' (supplier)', step: 'Step 1 of 1', sla: App.addDays(D().today, 1) + ' 17:00', assignee: p.buyer, req, note: c.reason });
        D().approvalChains[rid] = [[`${S.me()} · Supplier`, 'Requested', req.at, c.reason], [`${p.buyer} · Buyer`, 'Waiting', 'SLA 1 working day', '']];
        notify(`${App.vshort(V())} requests delivery ${c.due} → ${c.to} on ${c.po}`, c.po, '#/approvals?id=' + encodeURIComponent(rid), d.mats); st.chg = null; App.render(); App.toast(`Request sent to ${p.buyer}`); }
      else if (f.id === 'sp-ncr') { const x = S.read(root, '#sp-ncr'); const r = Object.assign(st.ncr, x); const er = {};
        if ((r.comment || '').length < 10) er.comment = 'Write a comment of at least 10 characters.'; if (r.opt === 'Offer a discount' && !(Number(String(r.disc).replace(',', '.')) > 0 && Number(String(r.disc).replace(',', '.')) <= 30)) er.disc = 'Enter a discount of 1–30%.';
        st.nerr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#sp-ncr'); return; }
        const n = D().ncrs[r.id]; const at = clock(); n.response = { opt: r.opt, disc: r.opt === 'Offer a discount' ? Number(String(r.disc).replace(',', '.')) : null, comment: r.comment, at }; n.status = 'Supplier responded'; n.supplier = `Supplier responded ${at}: ${r.opt}${n.response.disc ? ' ' + n.response.disc + '%' : ''} — ${r.comment}`;
        const nd = S.docOf(r.id); if (nd) nd.status = 'Supplier responded'; notify(`${r.id}: ${App.vshort(V())} responded — ${r.opt}`, n.po, '#/po/' + n.po, [n.mat]); st.ncr = null; App.render(); App.toast(`Response to ${r.id} sent to the buyer`); }
      else if (f.id === 'sp-inv') submitInv(root);
      else if (f.id === 'sp-cert') { const x = S.read(root, '#sp-cert'); const c = Object.assign(st.cert, x); const er = {};
        ['type', 'no', 'issuer'].forEach((k) => { if (!c[k]) er[k] = 'Required.'; }); if (!S.validDate(c.expiry)) er.expiry = 'Use dd/mm/yyyy.'; else if (App.daysTo(c.expiry) <= 0) er.expiry = 'Must be in the future.'; if (!/\.pdf$/i.test(c.file || '')) er.file = 'PDF only.';
        st.terr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#sp-cert'); return; }
        const cid = 'CERT-' + String(Math.max(...D().certificates.map((y) => +y.id.slice(5))) + 1).padStart(4, '0');
        D().certificates.push({ id: cid, type: c.type, no: c.no, vendor: VID(), mats: c.mats, issuer: c.issuer, issued: D().today, expiry: c.expiry, status: 'Pending review', uploaded: `${S.me()} · ${D().today} (supplier)`, file: c.file, replaces: c.replaces || undefined });
        if (D().certStats) D().certStats.pending++; notify(`${c.type} renewal uploaded by ${App.vshort(V())} — review ${cid}`, VID(), '#/certificates', c.mats); st.cert = null; App.render(); App.toast(`${cid} uploaded · pending buyer review`); }
      else if (f.id === 'sp-bank') { const x = S.read(root, '#sp-bank'); const k = Object.assign(st.bank, x); const er = {};
        if (!k.bank) er.bank = 'Enter the bank.'; if (!/^\d{6,19}$/.test((k.acct || '').replace(/\s/g, ''))) er.acct = '6–19 digits.'; if (App.norm(k.holder) !== App.norm(V().name)) er.holder = 'The account holder must equal the company name.'; if (!/\.pdf$/i.test(k.letter || '')) er.letter = 'PDF only.';
        st.kerr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#sp-bank'); return; }
        const v = V(); const acct = `${k.bank} ···· ${k.acct.replace(/\s/g, '').slice(-4)}`; v.bank = Object.assign(v.bank || {}, { pending: acct, requested: clock(), by: S.me() + ' (portal)' });
        D().approvals = D().approvals.filter((a) => !(a.type === 'Vendor change' && a.id === v.id)); D().approvals.push({ id: v.id, type: 'Vendor change', title: `${App.vshort(v)} · new account ${acct}`, mats: [], value: null, by: S.me(), step: 'Step 1 of 2', sla: App.addDays(D().today, 1) + ' 17:00', assignee: 'Đỗ Hoàng Nam' });
        S.audit('Settings', `Bank account change requested · ${acct} (pending Finance verification)`, v.id); st.bank = null; App.render(); App.toast(`${acct} pending Finance verification`); }
      else if (f.id === 'sp-prof') { const x = S.read(root, '#sp-prof'); const v = V(); Object.assign(v, { phone: x.phone, address: x.address }); P().legalRep = x.rep; App.render(); App.toast('Profile saved'); }
      else if (f.id === 'sp-prop') { const x = S.read(root, '#sp-prop'); const v = V(); v.proposed = v.proposed || []; v.proposed.push(x.prop); notify(`${App.vshort(v)} proposes to supply ${x.prop}`, v.id, '#/vendors/' + v.id, [x.prop]); App.render(); App.toast(`${x.prop} proposed · awaiting buyer approval`); }
    });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sp], [data-files]'); if (!b) return; const { id } = ctx(); const a = b.dataset.sp;
      if (b.dataset.files === 'open') { if (!st.bid) st.bid = JSON.parse(JSON.stringify(bidOf(id))); st.up = { errs: {} }; App.render(); const x = document.getElementById('spf-up-name'); x && x.focus(); return; }
      if (b.dataset.files === 'cancel') { st.up = null; App.render(); return; }
      const focus = (sel) => { const x = document.querySelector(sel); if (x) { x.scrollIntoView({ block: 'center' }); x.focus({ preventScroll: true }); } };
      if (a === 'ack') { const t = D().tenders[id]; const ad = t.addenda.find((x) => x.no === +b.dataset.no); ad.acks.push([VID(), clock()]); S.audit('Bids and tenders', `Addendum ${b.dataset.no} acknowledged`, id); App.render(); App.toast(`Addendum ${String(ad.no).padStart(2, '0')} acknowledged`); }
      else if (a === 'draft') { if (!st.bid) st.bid = JSON.parse(JSON.stringify(bidOf(id))); saveBid(root, id, false); }
      else if (a === 'withdraw') { const d = tndDoc(id); if (isClosed(d)) return; const bb = bidOf(id); const t = D().tenders[id]; const at = clock(); bb.status = 'Withdrawn'; bb.at = at; bb.log.push([at, `Withdrawn · ${bb.rc}`]); const tb = t.bidders.find((x) => x.vid === VID()); if (tb) Object.assign(tb, { status: 'Withdrawn', at, warn: 'Withdrawn by the bidder ' + at }); d.bids = t.bidders.filter((x) => x.status === 'Submitted').length; S.audit('Bids and tenders', `Sealed bid withdrawn · ${bb.rc}`, id); st.bid = null; App.render(); App.toast(`Bid withdrawn · ${at} · you can submit again until closing`); }
      else if (a === 'q-open') { st.q = { line: D().tenders[id].lines[0].mat, q: '' }; st.qerr = {}; App.render(); focus('#spq-q'); }
      else if (a === 'q-cancel') { st.q = null; App.render(); }
      else if (a === 'confirm') { const p = App.po.det(id); const re = p.confirm && p.confirm.status === 'Awaiting re-confirmation'; App.po.confirm(id, S.me() + ' (portal)'); S.audit('Orders', re ? `PO Rev.${p.rev} re-confirmed` : 'PO confirmed', id); App.render(); App.toast(re ? `${id} Rev.${p.rev} re-confirmed` : `${id} confirmed · buyer notified`); }
      else if (a === 'dec-open') { st.dec = { reason: '' }; st.derr = ''; App.render(); focus('#spd-reason'); }
      else if (a === 'dec-cancel') { st.dec = null; App.render(); }
      else if (a === 'asn-open' || a === 'chg-open') { const r = App.po.sched(b.dataset.po).find((x) => x.li === +b.dataset.li && x.si === +b.dataset.si); const base = { po: b.dataset.po, li: r.li, si: r.si, mat: r.mat, due: r.due, max: r.qty };
        if (a === 'asn-open') { st.asn = Object.assign(base, { ship: App.addDays(r.due, -1) , qty: String(r.qty), vehicle: '', docs: '' }); st.chg = null; st.aerr = {}; App.render(); focus('#spa-ship'); } else { st.chg = Object.assign(base, { to: '', reason: '' }); st.asn = null; st.cerr = {}; App.render(); focus('#spc-to'); } }
      else if (a === 'asn-cancel') { st.asn = null; App.render(); }
      else if (a === 'chg-cancel') { st.chg = null; App.render(); }
      else if (a === 'ncr-open') { st.ncr = { id: b.dataset.id, opt: 'Replace', disc: '', comment: '' }; st.nerr = {}; App.render(); focus('#spn-opt'); }
      else if (a === 'ncr-cancel') { st.ncr = null; App.render(); }
      else if (a === 'inv-open') { const bl = billable(); st.inv = { grn: bl[0].g.id, type: 'Original', orig: '', xml: '', pdf: '', parsed: null }; st.ierr = {}; App.render(); focus('#spi-grn'); }
      else if (a === 'inv-cancel') { st.inv = null; App.render(); }
      else if (a === 'inv-parse') { readInv(root); const f = st.inv; st.ierr = {}; if (!/\.xml$/i.test(f.xml || '')) { st.ierr.xml = 'Attach the signed XML (.xml) to read it.'; App.render(); S.focusErr('#sp-inv'); return; } f.parsed = parsed(f); App.render(); App.toast('XML read · seller signature valid'); }
      else if (a === 'cert-open') { const old = b.dataset.id && D().certificates.find((x) => x.id === b.dataset.id); st.cert = old ? { replaces: old.id, type: old.type, no: '', issuer: old.issuer, expiry: '', file: '', mats: old.mats } : { replaces: '', type: '', no: '', issuer: '', expiry: '', file: '', mats: D().materials.filter((m) => m.vendors.some((x) => x[0] === VID())).map((m) => m.id).slice(0, 3) }; st.terr = {}; App.render(); focus('#spt-no'); }
      else if (a === 'cert-cancel') { st.cert = null; App.render(); }
      else if (a === 'bank-open') { st.bank = { bank: '', acct: '', holder: V().name, letter: '' }; st.kerr = {}; App.render(); focus('#spk-bank'); }
      else if (a === 'bank-cancel') { st.bank = null; App.render(); }
      else if (a === 'mst') { const x = (document.getElementById('spp-mst').value || '').replace(/[\s.]/g, ''); st.mst = { v: document.getElementById('spp-mst').value };
        if (!/^\d{10}(-\d{3})?$/.test(x)) st.mst.err = 'MST must be 10 digits, or 10 digits + "-" + 3 for a branch.'; else if (x.slice(0, 10) !== V().mst.replace(/\s/g, '')) st.mst.err = 'This MST belongs to another company in the GDT register. Contact your buyer to change the legal entity.'; else st.mst.ok = `${V().name} · ${V().taxStatus || 'Đang hoạt động'}`;
        if (st.mst.ok) { V().mstChecked = D().today; } App.render(); focus('#spp-mst'); }
    });
  }
  App.page('supplier', { title: 'Supplier portal', roles: ['supplier'], render, mount });
})();
