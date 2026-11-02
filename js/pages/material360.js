/* Module 3 · Material 360° — F-14 VAT, F-17 profile & links, F-18 approved vendors & supply risk (R-16), F-19 purchase chain,
   price trend and linked documents (R-07, R-19).
   Route: #/material360?id=CON-24015 · sub-functions: /price, /vendors, /docs, /files (all keep ?id=) */
(function () {
  const { esc, num, pct, vnd, mid, pill, table, kpi, block, layout, t, tv } = App;
  const D = () => window.DATA;
  I18N.add({
    'm3.title': ['Material 360°', 'Vật tư 360°'], 'm3.notFound': ['Material ID {id} was not found.', 'Không tìm thấy mã vật tư {id}.'], 'm3.back': ['Back to Material IDs', 'Về danh sách mã vật tư'],
    'm3.other': ['Open another Material ID', 'Mở mã vật tư khác'], 'm3.baseUom': ['base UoM {u}', 'ĐVT cơ sở {u}'], 'm3.priceHist': ['Price history', 'Lịch sử giá'], 'm3.tender': ['Start tender', 'Tạo gói thầu'], 'm3.pr': ['Create PR', 'Tạo PR'],
    'm3.sub.overview': ['Overview', 'Tổng quan'], 'm3.sub.price': ['Price trend', 'Xu hướng giá'], 'm3.sub.vendors': ['Vendors & risk', 'NCC & rủi ro'], 'm3.sub.docs': ['Documents', 'Chứng từ'], 'm3.sub.files': ['Attachments', 'Tệp đính kèm'],
    'm3.k.last': ['Last price (excl. VAT)', 'Giá gần nhất (chưa VAT)'], 'm3.k.noPurchase': ['No purchase yet', 'Chưa có giao dịch'], 'm3.k.avg90': ['90-day average', 'Bình quân 90 ngày'],
    'm3.k.vsLast': ['Last price {v}', 'Giá gần nhất {v}'], 'm3.k.alert': ['price alert', 'cảnh báo giá'], 'm3.k.avg12': ['12-month average', 'Bình quân 12 tháng'], 'm3.k.weighted': ['Weighted by quantity', 'Bình quân gia quyền theo SL'],
    'm3.k.otifN': ['{a} of {b} deliveries', '{a}/{b} lần giao'], 'm3.k.noDel': ['No deliveries', 'Chưa giao hàng'], 'm3.k.spend': ['Spend YTD', 'Chi tiêu lũy kế'], 'm3.k.saving': ['Saving {v}', 'Tiết kiệm {v}'],
    'm3.linked': ['Linked by Material ID', 'Liên kết theo mã vật tư'], 'm3.l.vendors': ['Vendors', 'Nhà cung cấp'], 'm3.l.approved': ['{n} approved', '{n} đã duyệt'], 'm3.l.tenders': ['Tenders', 'Gói thầu'],
    'm3.l.openTotal': ['{a} open · {b} total', '{a} đang mở · {b} tổng'], 'm3.l.open': ['{n} open', '{n} đang mở'], 'm3.l.contracts': ['Contracts', 'Hợp đồng'], 'm3.l.certs': ['Certificates', 'Chứng chỉ'], 'm3.l.req': ['{n} required', '{n} bắt buộc'],
    'm3.l.invoices': ['Invoices', 'Hóa đơn'], 'm3.l.prices': ['Price records', 'Dữ liệu giá'], 'm3.l.12m': ['12 months', '12 tháng'], 'm3.l.saving': ['Saving', 'Tiết kiệm'],
    'm3.chain': ['Purchase chain', 'Chuỗi mua hàng'], 'm3.ch.awarded': ['Awarded {v}', 'Trao thầu {v}'], 'm3.ch.tender': ['Tender', 'Gói thầu'], 'm3.ch.delivery': ['Delivery', 'Giao hàng'],
    'm3.ch.saving': ['Saving {s} = (baseline {b} from PO-2026-0791 − awarded {a}) × 80 {u} · excl. VAT', 'Tiết kiệm {s} = (giá gốc {b} từ PO-2026-0791 − giá trúng thầu {a}) × 80 {u} · chưa VAT'],
    'm3.chart': ['Average unit price – 12 months', 'Đơn giá bình quân – 12 tháng'], 'm3.chartLabel': ['Monthly average unit price for {id}, from {a} to {b}', 'Đơn giá bình quân tháng của {id}, từ {a} đến {b}'],
    'm3.chartNote': ['Monthly weighted average, excl. VAT, per {u}.', 'Bình quân gia quyền theo tháng, chưa VAT, trên mỗi {u}.'], 'm3.noPrice': ['No price records yet', 'Chưa có dữ liệu giá'], 'm3.openPrice': ['Open price history', 'Mở lịch sử giá'],
    'm3.single': ['Single source', 'Một nguồn'], 'm3.singleN': ['only {n} approved vendor for {id}. Consider qualifying a second vendor.', 'chỉ có {n} NCC được duyệt cho {id}. Nên phát triển thêm NCC thứ hai.'],
    'm3.notSingle': ['Not single source', 'Không phải một nguồn'], 'm3.notSingleN': ['{n} eligible vendors.', '{n} NCC đủ điều kiện.'], 'm3.vendors': ['Approved vendors & supply risk', 'NCC được duyệt & rủi ro cung ứng'],
    'm3.noVendors': ['No approved vendors yet', 'Chưa có NCC được duyệt'], 'm3.blockedNote': ['Blocked vendors cannot be invited or receive POs until the certificate is renewed.', 'NCC bị chặn không được mời thầu hay nhận PO cho đến khi gia hạn chứng chỉ.'],
    'm3.open': ['Open PRs, POs & tenders', 'PR, PO & gói thầu đang mở'], 'm3.nothingOpen': ['Nothing open for this Material ID', 'Không có chứng từ đang mở cho mã này'], 'm3.noContract': ['No contract', 'Không có hợp đồng'],
    'm3.ncr': ['Quality · NCRs', 'Chất lượng · NCR'], 'm3.noNcr': ['No NCR for this Material ID', 'Không có NCR cho mã này'], 'm3.docs': ['Linked documents', 'Chứng từ liên kết'], 'm3.allDocs': ['All documents ({n})', 'Tất cả chứng từ ({n})'],
    'm3.noDocs': ['No documents', 'Không có chứng từ'], 'm3.bids': ['{a} / {b} bids', '{a} / {b} hồ sơ'], 'm3.files': ['Attachments ({n})', 'Tệp đính kèm ({n})'], 'm3.noFiles': ['No attachments', 'Không có tệp đính kèm'],
    'm3.master': ['Master data', 'Dữ liệu gốc'], 'm3.catGroup': ['Category / group', 'Nhóm hàng / nhóm'], 'm3.hs': ['HS code', 'Mã HS'], 'm3.vat': ['Default VAT', 'VAT mặc định'], 'm3.vat8': ['Eligible for 8%', 'Được giảm 8%'],
    'm3.metalEx': ['metal products excluded', 'sản phẩm kim loại bị loại trừ'], 'm3.fin': ['Confirmed by Finance', 'Tài chính xác nhận'], 'm3.confirmed': ['Confirmed', 'Đã xác nhận'], 'm3.created': ['Created', 'Ngày tạo'],
    'm3.editMsg': ['Edit opens a change request routed to the Material master owner', 'Sửa sẽ tạo đề nghị thay đổi gửi Chủ quản danh mục'], 'm3.altUom': ['Alternative UoM', 'ĐVT quy đổi'], 'm3.baseOnly': ['Base UoM only ({u})', 'Chỉ có ĐVT cơ sở ({u})'],
    'm3.certs': ['Required certificates', 'Chứng chỉ bắt buộc'], 'm3.checked': ['checked: {v}', 'kiểm tra: {v}'], 'm3.noneReq': ['None required', 'Không yêu cầu'], 'm3.certReg': ['Certificate register', 'Sổ chứng chỉ']
  });
  const MONTHS = ['11/25', '12/25', '01/26', '02/26', '03/26', '04/26', '05/26', '06/26', '07/26', '08/26', '09/26', '10/26'];
  const ROUTE = { PR: 'pr', TND: 'tenders', PO: 'po', GRN: 'po', CT: 'contracts', INV: 'invoices', NCR: 'po' };
  const vTone = { Preferred: 'success', Approved: 'info', Probation: 'warning', Blocked: 'danger' };
  const dtone = (s) => (/Closed|Awarded|Delivered|Matched|Accepted|Ready/.test(s) ? 'success' : /Blocked|Exception|overdue|Open$/.test(s) ? 'danger' : /Awaiting|Pending|Expiring|Partially|Q&A|Evaluation|not confirmed/.test(s) ? 'warning' : 'info');
  const docLink = (id) => { const d = D().docs.find((x) => x.id === id); return `<a class="mono" href="#/${d ? ROUTE[d.type] + (['CT', 'PR', 'TND', 'PO', 'INV'].includes(d.type) ? '/' + d.id : d.po ? '/' + d.po : '') : 'search?q=' + encodeURIComponent(id)}">${esc(id)}</a>`; };
  const vname = (id) => (App.vendor(id) || { name: id }).name;

  function series(m) {
    if (m.series) return m.series;
    if (!m.avg12) return null;
    // deterministic synthetic monthly averages ending at last price, centred on the 12-month average
    return MONTHS.map((_, i) => (i === 11 ? m.last : Math.round(m.avg12 * (1 + Math.sin(i * 1.3 + m.id.length) * 0.012 + ((m.avg90 - m.avg12) / m.avg12) * (i / 11)))));
  }

  const SUBS = [['', 'm3.sub.overview'], ['price', 'm3.sub.price'], ['vendors', 'm3.sub.vendors'], ['docs', 'm3.sub.docs'], ['files', 'm3.sub.files']];
  function render(p, subArg) {
    const id = p.id || 'CON-24015';
    const m = App.material(id);
    if (!m) return layout({ title: t('m3.title'), blocks: [block(null, `<div class="alert alert-danger" role="alert">${esc(t('m3.notFound', { id }))}</div><p class="m-0"><a class="btn" href="#/materials">${esc(t('m3.back'))}</a></p>`)] });
    const cur = App.sub(SUBS, subArg || '');
    const docs = D().docs.filter((d) => (d.mats || []).includes(m.id));
    const of = (x) => docs.filter((d) => d.type === x);
    const prs = of('PR'), tnds = of('TND'), pos = of('PO'), cts = of('CT'), invs = of('INV'), ncrs = of('NCR'), grns = of('GRN');
    const openPr = prs.filter((d) => !/Closed/.test(d.status)), openTnd = tnds.filter((d) => !/Awarded/.test(d.status)), openPo = pos.filter((d) => !/Closed|Delivered/.test(d.status));
    const elig = m.vendors.filter((v) => v[1] !== 'Blocked');
    const blocked = m.vendors.filter((v) => v[1] === 'Blocked');
    const d90 = m.last && m.avg90 ? ((m.last - m.avg90) / m.avg90) * 100 : null;
    const otifPct = m.otif[1] ? (m.otif[0] / m.otif[1]) * 100 : null;
    const saving = m.id === 'CON-24015' ? 100000000 : null;
    const atts = D().attachments.filter((a) => a.mat === m.id);
    const ser = series(m);
    const qs = 'id=' + encodeURIComponent(m.id);

    const switcher = `<label class="sr" for="m360-id">${esc(t('m3.other'))}</label><select id="m360-id" class="inp">${D().materials.map((x) => `<option value="${esc(x.id)}"${x.id === m.id ? ' selected' : ''}>${esc(x.id)} · ${esc(x.name)}</option>`).join('')}</select>`;
    const kpis = [
      kpi(t('m3.k.last'), m.last ? vnd(m.last) : '—', m.last ? `${docLink(m.lastPo)} · ${esc(vname(m.lastVendor))}` : esc(t('m3.k.noPurchase'))),
      kpi(t('m3.k.avg90'), m.avg90 ? vnd(m.avg90) : '—', d90 != null ? esc(t('m3.k.vsLast', { v: `${Math.abs(d90) < 0.05 ? '±' : d90 > 0 ? '+' : '−'}${pct(Math.abs(d90))}` })) + (Math.abs(d90) > D().priceAlertThreshold ? ' · ' + esc(t('m3.k.alert')) : '') : '', d90 != null && Math.abs(d90) > D().priceAlertThreshold ? (d90 > 0 ? 'danger' : 'success') : ''),
      kpi(t('m3.k.avg12'), m.avg12 ? vnd(m.avg12) : '—', esc(t('m3.k.weighted'))),
      kpi('OTIF', otifPct != null ? pct(otifPct) : '—', esc(m.otif[1] ? t('m3.k.otifN', { a: m.otif[0], b: m.otif[1] }) : t('m3.k.noDel')), otifPct != null ? (otifPct >= 95 ? 'success' : 'warning') : ''),
      kpi(t('m3.k.spend'), m.spendYtd ? num(m.spendYtd, 2) + ' tỷ ₫' : '—', esc(saving ? t('m3.k.saving', { v: vnd(saving) }) : t('c.exclVat')))
    ];

    const docTable = (rows, empty) => table([
      { h: t('c.number'), r: (d) => docLink(d.id), w: '150px' }, { h: t('c.title'), r: (d) => esc(tv(d.title)) + (d.note ? `<div class="small muted">${esc(tv(d.note))}</div>` : ''), w: 'minmax(220px,2fr)' },
      { h: t('c.date'), k: 'date', w: '110px' }, { h: t('c.vendor'), r: (d) => (d.vendor ? esc(vname(d.vendor)) : d.type === 'TND' ? esc(t('m3.bids', { a: d.bids, b: d.invited })) : esc(d.by || '')), w: 'minmax(160px,1.4fr)' },
      { h: t('c.value'), r: (d) => (d.value && !d.sealed ? vnd(d.value) : '—'), cls: 'num', w: '150px' }, { h: t('c.status'), r: (d) => pill(d.status, dtone(d.status)), w: 'minmax(140px,1.2fr)' }
    ], rows, { min: 900, empty, label: t('m3.docs') });

    let blocks;
    if (cur === 'price') {
      blocks = [block(t('m3.chart'), ser ? App.chart.line({ labels: MONTHS, values: ser, fmt: (v, axis) => (axis ? num(v / 1e6, v < 1e7 ? 2 : 1) + ' tr' : vnd(v)), label: t('m3.chartLabel', { id: m.id, a: vnd(ser[0]), b: vnd(ser[11]) }) }) + `<p class="muted small">${esc(t('m3.chartNote', { u: m.uom }))}</p>` : `<div class="empty">${esc(t('m3.noPrice'))}</div>`, { actions: `<a class="btn btn-sm" href="#/price?id=${esc(m.id)}">${esc(t('m3.openPrice'))}</a>` })];
    } else if (cur === 'vendors') {
      const risk = m.status !== 'Active' ? '' : elig.length <= 1
        ? `<div class="alert alert-warning" role="status"><b>${esc(t('m3.single'))}</b> · ${esc(t('m3.singleN', { n: elig.length, id: m.id }))}</div>`
        : `<div class="alert alert-success"><b>${esc(t('m3.notSingle'))}</b> · ${esc(t('m3.notSingleN', { n: elig.length }))}</div>`;
      blocks = [block(t('m3.vendors'), risk + table([
        { h: t('c.vendor'), r: (v) => `<a href="#/vendors/${esc(v[0])}"><span class="mono small">${esc(v[0])}</span> ${esc(vname(v[0]))}</a>`, w: 'minmax(220px,2fr)' },
        { h: t('c.status'), r: (v) => pill(v[1], vTone[v[1]]) + (v[5] ? `<div class="small tone-danger">${esc(tv(v[5]))}</div>` : ''), w: 'minmax(130px,1.2fr)' },
        { h: t('c.score'), r: (v) => { const x = App.vendor(v[0]); return x && x.score ? num(x.score, 2) + ' · ' + x.grade : '—'; }, cls: 'num', w: '90px' },
        { h: t('c.lastPrice'), r: (v) => vnd(v[2]), cls: 'num' },
        { h: t('c.leadTime'), r: (v) => (v[3] ? esc(t('c.days', { n: v[3] })) : '—'), cls: 'num', w: '110px' },
        { h: 'OTIF', r: (v) => pct(v[4]), cls: 'num', w: '80px' }
      ], m.vendors, { min: 780, empty: t('m3.noVendors'), label: t('m3.vendors') }) + (blocked.length ? `<p class="small muted">${esc(t('m3.blockedNote'))}</p>` : ''), { actions: `<a class="btn btn-sm" href="#/vendors">${esc(t('c.vendors'))}</a>` })];
    } else if (cur === 'docs') {
      blocks = [
        block(t('m3.open'), docTable([...openPr, ...openPo, ...openTnd], t('m3.nothingOpen'))),
        block(t('m3.l.contracts'), docTable(cts, t('m3.noContract')), { span: 6, actions: `<a class="btn btn-sm" href="#/contracts">${esc(t('m3.l.contracts'))}</a>` }),
        block(t('m3.ncr'), docTable(ncrs, t('m3.noNcr')), { span: 6 }),
        block(t('m3.docs'), App.tabs('m360d', [
          ['all', t('m3.allDocs', { n: docs.length }), docTable(docs, t('m3.noDocs'))],
          ...['PR', 'TND', 'PO', 'GRN', 'CT', 'INV', 'NCR'].filter((k) => of(k).length).map((k) => [k.toLowerCase(), `${t('doc.' + k)} (${of(k).length})`, docTable(of(k), t('c.none'))])
        ]))
      ];
    } else if (cur === 'files') {
      blocks = [block(t('m3.files', { n: atts.length }), table([{ h: t('c.type'), r: (a) => esc(tv(a.type)) }, { h: t('c.file'), r: (a) => `<span class="mono small">${esc(a.name)}</span>`, w: 'minmax(220px,2fr)' }, { h: t('c.version'), k: 'ver', w: '90px' }, { h: t('c.uploaded'), k: 'date', w: '110px' }], atts, { min: 560, empty: t('m3.noFiles'), label: t('m3.sub.files') }))];
    } else {
      const tiles = [['m3.l.vendors', t('m3.l.approved', { n: elig.length }), '#/vendors'], ['m3.l.tenders', t('m3.l.openTotal', { a: openTnd.length, b: tnds.length }), `#/tenders?q=${m.id}`], ['doc.PR', t('m3.l.open', { n: openPr.length }), `#/pr?q=${m.id}`], ['doc.PO', t('m3.l.openTotal', { a: openPo.length, b: pos.length }), `#/po?q=${m.id}`],
        ['m3.l.contracts', cts.length ? cts.map((c) => `${tv(c.status)} · ${c.id}`).join(', ') : t('c.none'), cts.length === 1 ? '#/contracts/' + cts[0].id : '#/contracts'], ['m3.l.certs', t('m3.l.req', { n: m.certs.length }), `#/certificates?mat=${m.id}`], ['m3.l.invoices', `${invs.length}`, `#/invoices?q=${m.id}`],
        ['m3.l.prices', ser ? t('m3.l.12m') : t('c.none'), `#/material360/price?${qs}`], ['OTIF', otifPct != null ? pct(otifPct) : '—', '#/reports'], ['m3.l.saving', saving ? vnd(saving) : '—', '#/reports']];
      const linked = block(t('m3.linked'), `<div class="tiles">${tiles.map(([l, v, h]) => `<a class="tile" href="${h}"><span class="small muted">${esc(t(l))}</span><b>${esc(v)}</b></a>`).join('')}</div>`);
      const master = block(t('m3.master'), `<dl class="dl">
          <dt>${esc(t('c.mid'))}</dt><dd>${mid(m.id)}</dd><dt>${esc(t('m3.catGroup'))}</dt><dd>${esc(t('cat.' + m.cat))} › ${esc(m.group)}</dd>
          ${m.spec.map(([k, v]) => `<dt>${esc(tv(k))}</dt><dd>${esc(v)}</dd>`).join('')}
          <dt>${esc(t('m3.hs'))}</dt><dd class="mono">${esc(m.hs)}</dd><dt>${esc(t('c.leadTime'))}</dt><dd>${esc(t('c.days', { n: m.lead }))}</dd><dt>MOQ</dt><dd>${esc(m.moq)}</dd>
          <dt>${esc(t('m3.vat'))}</dt><dd><b>${esc(App.vatLabel ? App.vatLabel(m) : m.vat + '%')}</b></dd>
          <dt>${esc(t('m3.vat8'))}</dt><dd>${esc(m.vat8 ? t('c.yes') : t('c.no') + (/thép/i.test(m.name) ? ' · ' + t('m3.metalEx') : ''))}</dd>
          <dt>${esc(t('m3.fin'))}</dt><dd>${m.vatConfirmed ? pill(t('m3.confirmed'), 'success') + ' <span class="small muted">' + esc(m.vatConfirmed) + '</span>' : pill('Pending', 'warning')}</dd>
          <dt>${esc(t('c.owner'))}</dt><dd>${esc(m.owner)}</dd><dt>${esc(t('m3.created'))}</dt><dd>${esc(m.created)}</dd></dl>`, { span: 6, actions: `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('m3.editMsg'))}">${esc(t('c.edit'))}</button>` });
      const certs = block(t('m3.certs'), (m.certs.length ? `<ul class="plain">${m.certs.map(([c, w]) => `<li><b>${esc(tv(c))}</b> <span class="small muted">· ${esc(t('m3.checked', { v: tv(w) }))}</span></li>`).join('')}</ul>` : `<div class="empty">${esc(t('m3.noneReq'))}</div>`)
        + `<h3 class="h-sub">${esc(t('m3.altUom'))}</h3>` + (m.alt.length ? `<ul class="plain">${m.alt.map((a) => `<li><b>${esc(a[0])}</b> <span class="small muted">· ${esc(a[1])}</span></li>`).join('')}</ul>` : `<p class="small muted">${esc(t('m3.baseOnly', { u: m.uom }))}</p>`),
      { span: 6, actions: `<a class="btn btn-sm" href="#/certificates?mat=${esc(m.id)}">${esc(t('m3.certReg'))}</a>` });
      let chain = '';
      const src = prs.find((d) => d.next && D().docs.find((x) => x.id === d.next && x.status === 'Awarded'));
      if (src) {
        const tn = D().docs.find((x) => x.id === src.next); const po = pos.find((x) => /TND/.test(x.title) && x.title.includes(tn.id)) || pos[pos.length - 1]; const grn = grns[grns.length - 1];
        if (po) {
          chain = block(t('m3.chain'), `<ol class="chain">${[[src.id, 'PR', src.title], [tn.id, t('m3.ch.tender'), t('m3.ch.awarded', { v: vname(tn.award) })], [po.id, 'PO', `${po.date} · ${po.qty || ''} · ${vnd(po.value)}`], [grn ? grn.id : '—', t('m3.ch.delivery'), grn ? App.tv(grn.title) : '']].map(([i, l, s]) => `<li><span class="small muted">${esc(l)}</span>${docLink(i)}<span class="small">${esc(s)}</span></li>`).join('')}</ol>
            ${saving ? `<div class="alert alert-success">${esc(t('m3.ch.saving', { s: vnd(saving), b: vnd(16450000), a: vnd(15200000), u: m.uom }))}</div>` : ''}`);
        }
      }
      blocks = [linked, master, certs, chain];
    }

    return layout({
      crumbs: `<a href="#/materials">${esc(t('nav.materials'))}</a> / ${esc(t('m3.title'))}`,
      titleHtml: `<span class="mid-lg">${mid(m.id)}</span> ${esc(m.name)}`,
      subtitle: `<span lang="en">${esc(m.en)}</span> · ${esc(t('cat.' + m.cat))} › ${esc(m.group)} · ${esc(t('m3.baseUom', { u: m.uom }))} · ${pill(m.status, m.status === 'Active' ? 'success' : m.status === 'Blocked' ? 'danger' : 'warning')}${m.step ? ' ' + esc(tv(m.step)) : ''}`,
      actions: `${switcher}<a class="btn" href="#/price?id=${esc(m.id)}">${esc(t('m3.priceHist'))}</a><a class="btn" href="#/tenders/new?mat=${esc(m.id)}">${esc(t('m3.tender'))}</a><a class="btn btn-p" href="#/pr?mat=${esc(m.id)}">${esc(t('m3.pr'))}</a>`,
      alerts: App.unknownSub(SUBS, subArg), kpis, subnav: App.subnav('material360', SUBS, cur, qs), blocks
    });
  }

  App.page('material360', {
    titleKey: 'm3.title', roles: ['procurement', 'admin'], render,
    mount(root, p, subArg) { const s = root.querySelector('#m360-id'); if (s) s.onchange = () => { location.hash = '#/material360' + (subArg ? '/' + subArg : '') + '?id=' + encodeURIComponent(s.value); }; }
  });
})();
