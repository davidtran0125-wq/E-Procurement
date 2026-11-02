/* Module 3 · Material 360° — F-14 VAT, F-17 profile & links, F-18 approved vendors & supply risk (R-16), F-19 purchase chain,
   price trend and linked documents (R-07, R-19). Route: #/material360?id=CON-24015 */
(function () {
  const { esc, num, pct, vnd, mid, pill, table, kpi, card } = App;
  const D = () => window.DATA;
  const CAT = { CON: 'Construction', EQP: 'Equipment', SRV: 'Services', LOG: 'Logistics' };
  const MONTHS = ['11/25', '12/25', '01/26', '02/26', '03/26', '04/26', '05/26', '06/26', '07/26', '08/26', '09/26', '10/26'];
  const ROUTE = { PR: 'pr', TND: 'tenders', PO: 'po', GRN: 'po', CT: 'contracts', INV: 'invoices', NCR: 'po' };
  const vTone = { Preferred: 'success', Approved: 'info', Probation: 'warning', Blocked: 'danger' };
  const dtone = (s) => (/Closed|Awarded|Delivered|Matched|Accepted|Ready/.test(s) ? 'success' : /Blocked|Exception|overdue|Open$/.test(s) ? 'danger' : /Awaiting|Pending|Expiring|Partially|Q&A|Evaluation|not confirmed/.test(s) ? 'warning' : 'info');
  const docLink = (id) => { const d = D().docs.find((x) => x.id === id); return `<a class="mono" href="#/${d ? ROUTE[d.type] + (['CT', 'PR', 'TND'].includes(d.type) ? '/' + d.id : '') : 'search?q=' + encodeURIComponent(id)}">${esc(id)}</a>`; };

  function series(m) {
    if (m.series) return m.series;
    if (!m.avg12) return null;
    // deterministic synthetic monthly averages ending at last price, centred on the 12-month average
    return MONTHS.map((_, i) => (i === 11 ? m.last : Math.round(m.avg12 * (1 + Math.sin(i * 1.3 + m.id.length) * 0.012 + ((m.avg90 - m.avg12) / m.avg12) * (i / 11)))));
  }

  const DOCTYPE = { PR: 'PRs', TND: 'Tenders', PO: 'POs', GRN: 'Deliveries', CT: 'Contracts', INV: 'Invoices', NCR: 'NCRs' };
  function render(p) {
    const id = p.id || 'CON-24015';
    const m = App.material(id);
    if (!m) return `<div class="page-h"><h1>Material 360°</h1></div><div class="alert alert-danger" role="alert">Material ID <b class="mono">${esc(id)}</b> was not found.</div><p><a class="btn" href="#/materials">Back to Material IDs</a></p>`;
    const docs = D().docs.filter((d) => (d.mats || []).includes(m.id));
    const of = (t) => docs.filter((d) => d.type === t);
    const prs = of('PR'), tnds = of('TND'), pos = of('PO'), cts = of('CT'), invs = of('INV'), ncrs = of('NCR'), grns = of('GRN');
    const openPr = prs.filter((d) => !/Closed/.test(d.status)), openTnd = tnds.filter((d) => !/Awarded/.test(d.status)), openPo = pos.filter((d) => !/Closed|Delivered/.test(d.status));
    const elig = m.vendors.filter((v) => v[1] !== 'Blocked');
    const blocked = m.vendors.filter((v) => v[1] === 'Blocked');
    const d90 = m.last && m.avg90 ? ((m.last - m.avg90) / m.avg90) * 100 : null;
    const otifPct = m.otif[1] ? (m.otif[0] / m.otif[1]) * 100 : null;
    const saving = m.id === 'CON-24015' ? 100000000 : null;
    const atts = D().attachments.filter((a) => a.mat === m.id);
    const ser = series(m);

    const switcher = `<label class="sr" for="m360-id">Open another Material ID</label><select id="m360-id" class="inp">${D().materials.map((x) => `<option value="${x.id}"${x.id === m.id ? ' selected' : ''}>${x.id} · ${esc(x.name)}</option>`).join('')}</select>`;

    const header = `<div class="page-h"><div><div class="crumbs small muted"><a href="#/materials">Material IDs</a> / Material 360°</div>
        <h1><span class="mid-lg">${mid(m.id)}</span> ${esc(m.name)}</h1>
        <div class="sub">${esc(m.en)} · ${esc(CAT[m.cat])} › ${esc(m.group)} · base UoM ${esc(m.uom)} · ${pill(m.status, m.status === 'Active' ? 'success' : m.status === 'Blocked' ? 'danger' : 'warning')}${m.step ? ' ' + esc(m.step) : ''}</div></div>
      <div class="acts">${switcher}<a class="btn" href="#/price?id=${esc(m.id)}">Price history</a><a class="btn" href="#/tenders/new?mat=${esc(m.id)}">Start tender</a><a class="btn btn-p" href="#/pr?mat=${esc(m.id)}">Create PR</a></div></div>`;

    const kpis = `<div class="grid-k">
      ${kpi('Last price (excl. VAT)', m.last ? vnd(m.last) : '—', m.last ? `${docLink(m.lastPo)} · ${esc((App.vendor(m.lastVendor) || {}).name || '')}` : 'No purchase yet')}
      ${kpi('90-day average', m.avg90 ? vnd(m.avg90) : '—', d90 != null ? `Last price ${Math.abs(d90) < 0.05 ? '±' : d90 > 0 ? '+' : '−'}${pct(Math.abs(d90))}${Math.abs(d90) > D().priceAlertThreshold ? ' · price alert' : ''}` : '', d90 != null && Math.abs(d90) > D().priceAlertThreshold ? (d90 > 0 ? 'danger' : 'success') : '')}
      ${kpi('12-month average', m.avg12 ? vnd(m.avg12) : '—', 'Weighted by quantity')}
      ${kpi('OTIF', otifPct != null ? pct(otifPct) : '—', m.otif[1] ? `${m.otif[0]} of ${m.otif[1]} deliveries` : 'No deliveries', otifPct != null ? (otifPct >= 95 ? 'success' : 'warning') : '')}
      ${kpi('Spend YTD', m.spendYtd ? num(m.spendYtd, 2) + ' tỷ ₫' : '—', saving ? `Saving ${vnd(saving)}` : 'excl. VAT')}
    </div>`;

    const tiles = [['Vendors', `${elig.length} approved`, '#/vendors'], ['Tenders', `${openTnd.length} open · ${tnds.length} total`, `#/tenders?q=${m.id}`], ['PRs', `${openPr.length} open`, `#/pr?q=${m.id}`], ['POs', `${openPo.length} open · ${pos.length} total`, '#/po'],
      ['Contracts', cts.length ? cts.map((c) => `${c.status} · ${c.id}`).join(', ') : 'None', cts.length === 1 ? '#/contracts/' + cts[0].id : '#/contracts'], ['Certificates', `${m.certs.length} required`, `#/certificates?mat=${m.id}`], ['Invoices', `${invs.length}`, '#/invoices'],
      ['Price records', ser ? '12 months' : 'None', `#/price?id=${m.id}`], ['OTIF', otifPct != null ? pct(otifPct) : '—', '#/reports'], ['Saving', saving ? vnd(saving) : '—', '#/reports']];
    const linked = card('Linked by Material ID', `<div class="tiles">${tiles.map(([l, v, h]) => `<a class="tile" href="${h}"><span class="small muted">${l}</span><b>${esc(v)}</b></a>`).join('')}</div>`);

    let chain = '';
    const src = prs.find((d) => d.next && D().docs.find((x) => x.id === d.next && x.status === 'Awarded'));
    if (src) {
      const t = D().docs.find((x) => x.id === src.next); const po = pos.find((x) => /TND/.test(x.title) && x.title.includes(t.id)) || pos[pos.length - 1]; const grn = grns[grns.length - 1];
      chain = card('Purchase chain', `<ol class="chain">${[[src.id, 'PR', src.title], [t.id, 'Tender', `Awarded ${App.vendor(t.award).name}`], [po.id, 'PO', `${po.date} · ${po.qty} · ${vnd(po.value)}`], [grn ? grn.id : '—', 'Delivery', grn ? grn.title : '']].map(([i, l, s]) => `<li><span class="small muted">${l}</span>${docLink(i)}<span class="small">${esc(s)}</span></li>`).join('')}</ol>
        ${saving ? `<div class="alert alert-success">Saving ${vnd(saving)} = (baseline ${vnd(16450000)} from PO-2026-0791 − awarded ${vnd(15200000)}) × 80 ${esc(m.uom)} · excl. VAT</div>` : ''}`);
    }

    const chart = card('Average unit price – 12 months', ser ? App.chart.line({ labels: MONTHS, values: ser, fmt: (v, axis) => (axis ? num(v / 1e6, v < 1e7 ? 2 : 1) + ' tr' : vnd(v)), label: `Monthly average unit price for ${m.id}, from ${vnd(ser[0])} to ${vnd(ser[11])}` }) + `<p class="muted small">Monthly weighted average, excl. VAT, per ${esc(m.uom)}.</p>` : '<div class="empty">No price records yet</div>', `<a class="btn btn-sm" href="#/price?id=${esc(m.id)}">Open price history</a>`);

    const risk = m.status !== 'Active' ? '' : elig.length <= 1
      ? `<div class="alert alert-warning" role="status"><b>Single source</b> · only ${elig.length} approved vendor for ${esc(m.id)}. Consider qualifying a second vendor.</div>`
      : `<div class="alert alert-success"><b>Not single source</b> · ${elig.length} eligible vendors.</div>`;
    const vendorsCard = card('Approved vendors & supply risk', risk + table([
      { h: 'Vendor', r: (v) => `<a href="#/vendors/${esc(v[0])}"><span class="mono small">${esc(v[0])}</span> ${esc(App.vendor(v[0]).name)}</a>`, w: 'minmax(220px,2fr)' },
      { h: 'Status', r: (v) => pill(v[1], vTone[v[1]]) + (v[5] ? `<div class="small tone-danger">${esc(v[5])}</div>` : ''), w: 'minmax(130px,1.2fr)' },
      { h: 'Score', r: (v) => (App.vendor(v[0]).score ? num(App.vendor(v[0]).score, 2) + ' · ' + App.vendor(v[0]).grade : '—'), cls: 'num', w: '90px' },
      { h: 'Last price', r: (v) => vnd(v[2]), cls: 'num' },
      { h: 'Lead time', r: (v) => (v[3] ? v[3] + ' days' : '—'), cls: 'num', w: '90px' },
      { h: 'OTIF', r: (v) => pct(v[4]), cls: 'num', w: '80px' }
    ], m.vendors, { min: 780, empty: 'No approved vendors yet' }) + (blocked.length ? `<p class="small muted">Blocked vendors cannot be invited or receive POs until the certificate is renewed.</p>` : ''), '<a class="btn btn-sm" href="#/vendors">Vendors</a>');

    const docTable = (rows, empty) => table([
      { h: 'Number', r: (d) => docLink(d.id), w: '150px' }, { h: 'Title', r: (d) => esc(d.title) + (d.note ? `<div class="small muted">${esc(d.note)}</div>` : ''), w: 'minmax(220px,2fr)' },
      { h: 'Date', k: 'date', w: '110px' }, { h: 'Vendor', r: (d) => (d.vendor ? esc(App.vendor(d.vendor).name) : d.type === 'TND' ? `${d.bids} / ${d.invited} bids` : esc(d.by || '')), w: 'minmax(160px,1.4fr)' },
      { h: 'Value', r: (d) => (d.value && !d.sealed ? vnd(d.value) : '—'), cls: 'num', w: '150px' }, { h: 'Status', r: (d) => pill(d.status, dtone(d.status)), w: 'minmax(140px,1.2fr)' }
    ], rows, { min: 900, empty });
    const openCard = card('Open PRs, POs & tenders', docTable([...openPr, ...openPo, ...openTnd], 'Nothing open for this Material ID'));
    const ctCard = card('Contracts', docTable(cts, 'No contract'), '<a class="btn btn-sm" href="#/contracts">Contracts</a>');
    const ncrCard = card('Quality · NCRs', docTable(ncrs, 'No NCR for this Material ID'));
    const docsCard = card('Linked documents', App.tabs('m360d', [
      ['all', `All documents (${docs.length})`, docTable(docs, 'No documents')],
      ...['PR', 'TND', 'PO', 'GRN', 'CT', 'INV', 'NCR'].filter((k) => of(k).length).map((k) => [k.toLowerCase(), `${DOCTYPE[k]} (${of(k).length})`, docTable(of(k), 'None')]),
      ['att', `Attachments (${atts.length})`, table([{ h: 'Type', k: 'type' }, { h: 'File', r: (a) => `<span class="mono small">${esc(a.name)}</span>`, w: 'minmax(220px,2fr)' }, { h: 'Version', k: 'ver', w: '90px' }, { h: 'Uploaded', k: 'date', w: '110px' }], atts, { min: 560, empty: 'No attachments' })],
    ]));

    const master = card('Master data', `<dl class="dl">
        <dt>Material ID</dt><dd>${mid(m.id)}</dd><dt>Category / group</dt><dd>${esc(CAT[m.cat])} › ${esc(m.group)}</dd>
        ${m.spec.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}
        <dt>HS code</dt><dd class="mono">${esc(m.hs)}</dd><dt>Lead time</dt><dd>${m.lead} days</dd><dt>MOQ</dt><dd>${esc(m.moq)}</dd>
        <dt>Default VAT</dt><dd><b>${esc(App.vatLabel ? App.vatLabel(m) : m.vat + '%')}</b></dd>
        <dt>Eligible for 8%</dt><dd>${m.vat8 ? 'Yes' : `No${/thép/i.test(m.name) ? ' · metal products excluded' : ''}`}</dd>
        <dt>Confirmed by Finance</dt><dd>${m.vatConfirmed ? pill('Confirmed', 'success') + ' <span class="small muted">' + esc(m.vatConfirmed) + '</span>' : pill('Pending', 'warning')}</dd>
        <dt>Owner</dt><dd>${esc(m.owner)}</dd><dt>Created</dt><dd>${esc(m.created)}</dd></dl>`, '<button class="btn btn-sm" data-act="toast" data-msg="Edit opens a change request routed to the Material master owner">Edit</button>');
    const uom = card('Alternative UoM', m.alt.length ? table([{ h: 'Alt UoM', r: (a) => esc(a[0]) }, { h: 'Conversion', r: (a) => esc(a[1]) }], m.alt, { min: 280 }) : `<div class="empty">Base UoM only (${esc(m.uom)})</div>`);
    const certs = card('Required certificates', m.certs.length ? `<ul class="plain">${m.certs.map(([c, w]) => `<li><b>${esc(c)}</b> <span class="small muted">· checked: ${esc(w)}</span></li>`).join('')}</ul>` : '<div class="empty">None required</div>', `<a class="btn btn-sm" href="#/certificates?mat=${esc(m.id)}">Certificate register</a>`);

    return `${header}${kpis}${linked}
      <div class="grid-2"><div class="stack">${chain}${chart}${vendorsCard}${openCard}${ctCard}${ncrCard}${docsCard}</div><div class="stack">${master}${uom}${certs}</div></div>`;
  }

  App.page('material360', {
    title: 'Material 360°', roles: ['procurement', 'admin'], render,
    mount(root) { const s = root.querySelector('#m360-id'); if (s) s.onchange = () => { location.hash = '#/material360?id=' + s.value; }; }
  });
})();
