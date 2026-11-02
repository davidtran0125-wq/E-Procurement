/* Module 5 · Vendor evaluation — F-27 criteria templates & grade thresholds (auto sources: NCR rate, OTIF by accepted qty — R-07),
   F-28 scorecard (weighted score = Σ score × weight), F-29 periods & progress.
   Routes: #/evaluation (progress) · sub-functions /scorecard(?vendor=V-1001), /templates, /history · admin: #/admin/templates */
(function () {
  const { esc, num, pill, table, kpi, block, layout, t, tv } = App;
  const D = () => window.DATA;
  I18N.add({
    'ev.title': ['Vendor evaluation', 'Đánh giá NCC'], 'ev.titleAdmin': ['Evaluation templates', 'Mẫu tiêu chí đánh giá'],
    'ev.subtitle': ['Weighted scorecards per period · auto criteria from GRN accepted qty, NCRs, prices by Material ID and bids', 'Bảng điểm có trọng số theo kỳ · tiêu chí tự động từ SL chấp nhận GRN, NCR, giá theo mã vật tư và hồ sơ thầu'],
    'ev.newPeriod': ['Start new period', 'Mở kỳ mới'], 'ev.newPeriodMsg': ['Q4/2026 opens 01/01/2027: scorecards are created as Not started for vendors with POs in the quarter, due 15/02/2027', 'Kỳ Q4/2026 mở ngày 01/01/2027: tạo bảng điểm Chưa bắt đầu cho NCC có PO trong quý, hạn 15/02/2027'],
    'ev.sub.progress': ['Progress', 'Tiến độ'], 'ev.sub.scorecard': ['Scorecard', 'Bảng điểm'], 'ev.sub.templates': ['Criteria templates', 'Mẫu tiêu chí'], 'ev.sub.history': ['History', 'Lịch sử'],
    'ev.k.submitted': ['Submitted', 'Đã nộp'], 'ev.k.of': ['of {n} · Q3/2026', 'trên {n} · Q3/2026'], 'ev.k.draft': ['Draft', 'Nháp'], 'ev.k.inProgress': ['In progress', 'Đang thực hiện'], 'ev.k.notStarted': ['Not started', 'Chưa bắt đầu'],
    'ev.k.due': ['Due 15/11/2026', 'Hạn 15/11/2026'], 'ev.k.avg': ['Average score', 'Điểm trung bình'], 'ev.k.scored': ['Scored vendors', 'NCC đã chấm'],
    'ev.progress': ['Progress · {p}', 'Tiến độ · {p}'], 'ev.counts': ['{a} submitted · {b} draft · {c} not started', '{a} đã nộp · {b} nháp · {c} chưa bắt đầu'], 'ev.dueNote': [' · due 15/11/2026', ' · hạn 15/11/2026'],
    'ev.template': ['Template', 'Mẫu'], 'ev.incomplete': ['(incomplete)', '(chưa đủ)'], 'ev.view': ['View', 'Xem'], 'ev.continue': ['Continue', 'Tiếp tục'], 'ev.evaluate': ['Evaluate', 'Chấm điểm'],
    'ev.noCards': ['No scorecards in this period', 'Không có bảng điểm trong kỳ này'], 'ev.scoreFor': ['Score for {c} (0–5)', 'Điểm cho {c} (0–5)'], 'ev.auto': ['auto', 'tự động'],
    'ev.scorecard': ['Scorecard', 'Bảng điểm'], 'ev.choose': ['Choose a vendor', 'Chọn nhà cung cấp'], 'ev.chooseN': ['Open a scorecard from the progress list.', 'Mở bảng điểm từ danh sách tiến độ.'], 'ev.vendorPick': ['Vendor', 'Nhà cung cấp'],
    'ev.archived': ['Submitted score {s} · {g}. Criterion detail is archived; open History for the trend.', 'Điểm đã nộp {s} · {g}. Chi tiết tiêu chí đã lưu trữ; xem Lịch sử để thấy xu hướng.'], 'ev.noPeriod': ['No scorecard for this period', 'Không có bảng điểm trong kỳ này'],
    'ev.noneYet': ['{v} has no scorecard in {p}', '{v} chưa có bảng điểm trong kỳ {p}'], 'ev.startN': ['Start one: auto criteria are filled from POs, GRNs (accepted qty), NCRs and bids.', 'Tạo mới: tiêu chí tự động lấy từ PO, GRN (SL chấp nhận), NCR và hồ sơ thầu.'], 'ev.start': ['Start scorecard', 'Tạo bảng điểm'],
    'ev.meta': ['{tpl} template · {p} · basis: {b} · evaluator {by}', 'Mẫu {tpl} · {p} · cơ sở: {b} · người chấm {by}'],
    'ev.c.criterion': ['Criterion', 'Tiêu chí'], 'ev.c.weight': ['Weight', 'Trọng số'], 'ev.c.basis': ['Basis', 'Cơ sở'], 'ev.c.score': ['Score (0–5)', 'Điểm (0–5)'], 'ev.c.weighted': ['Weighted', 'Điểm có trọng số'],
    'ev.criteria': ['Scorecard criteria', 'Tiêu chí bảng điểm'], 'ev.comment': ['Evaluator comment', 'Nhận xét của người chấm'],
    'ev.locked': ['Submitted by {by} on {at} · locked. Score and grade are shown on Vendors, Material 360° and the supplier portal.', 'Đã nộp bởi {by} ngày {at} · đã khóa. Điểm và hạng hiển thị ở Nhà cung cấp, Vật tư 360° và cổng NCC.'],
    'ev.submit': ['Submit scorecard', 'Nộp bảng điểm'], 'ev.total': ['Total {t} / 5 · grade {g} ({s})', 'Tổng {t} / 5 · hạng {g} ({s})'], 'ev.missing': [' · incomplete, missing scores count as 0', ' · chưa đủ, điểm thiếu tính là 0'],
    'ev.vsQ2': [' · {d} vs Q2/2026', ' · {d} so với Q2/2026'], 'ev.formula': ['Weighted score = score × weight; total = Σ weighted scores.', 'Điểm có trọng số = điểm × trọng số; tổng = Σ điểm có trọng số.'],
    'ev.critName': ['Criterion {n} name', 'Tên tiêu chí {n}'], 'ev.critSrc': ['Criterion {n} data source', 'Nguồn dữ liệu tiêu chí {n}'], 'ev.critW': ['Criterion {n} weight %', 'Trọng số tiêu chí {n} (%)'], 'ev.delCrit': ['Delete criterion {n}', 'Xóa tiêu chí {n}'],
    'ev.tplCriteria': ['Template criteria', 'Tiêu chí của mẫu'], 'ev.src': ['Data source', 'Nguồn dữ liệu'], 'ev.tplCard': ['Criteria template', 'Mẫu tiêu chí'],
    'ev.sum': ['Total weight {n}%', 'Tổng trọng số {n}%'], 'ev.sumBad': [' · must be 100% to save', ' · phải bằng 100% mới lưu được'],
    'ev.addCrit': ['Add criterion', 'Thêm tiêu chí'], 'ev.dupTpl': ['Duplicate template', 'Nhân bản mẫu'], 'ev.saveTpl': ['Save template', 'Lưu mẫu'],
    'ev.grades': ['Grade thresholds', 'Ngưỡng xếp hạng'], 'ev.vstatus': ['Vendor status', 'Trạng thái NCC'], 'ev.sources': ['Auto data sources', 'Nguồn dữ liệu tự động'],
    'ev.s1': ['NCR rate & accepted qty — NCRs per PO and accepted ÷ delivered qty from GRN quality inspection (R-07).', 'Tỷ lệ NCR & SL chấp nhận — số NCR trên PO và SL chấp nhận ÷ SL giao từ kiểm tra chất lượng GRN (R-07).'],
    'ev.s2': ['PO deliveries (OTIF) — on time (received ≤ promised date) and in full (accepted qty ≥ scheduled qty) ÷ all deliveries.', 'Giao hàng PO (OTIF) — đúng hạn (nhận ≤ ngày cam kết) và đủ (SL chấp nhận ≥ SL theo lịch) ÷ tổng số lần giao.'],
    'ev.s3': ['Price by Material ID — awarded price vs the Material ID’s 90-day average.', 'Giá theo mã vật tư — giá trúng thầu so với bình quân 90 ngày của mã.'], 'ev.s4': ['Tender response time — days from invitation to bid submission.', 'Thời gian phản hồi thầu — số ngày từ khi mời đến khi nộp hồ sơ.'],
    'ev.hist': ['Score history', 'Lịch sử điểm'], 'ev.trend': ['Trend · {v}', 'Xu hướng · {v}'], 'ev.trendLabel': ['Score trend for {v}: {s}', 'Xu hướng điểm của {v}: {s}'], 'ev.notEnough': ['Not enough periods', 'Chưa đủ số kỳ'],
    'ev.e.range': ['Enter a score from 0 to 5.', 'Nhập điểm từ 0 đến 5.'], 'ev.e.req': ['Required to submit.', 'Bắt buộc để nộp.'], 'ev.e.comment': ['Add a comment of at least 10 characters.', 'Nhập nhận xét ít nhất 10 ký tự.'],
    'ev.submitted': ['{id} scorecard submitted · {s} · grade {g}', 'Đã nộp bảng điểm {id} · {s} · hạng {g}'], 'ev.draftSaved': ['Draft saved', 'Đã lưu nháp'], 'ev.started': ['Scorecard started · auto criteria filled', 'Đã tạo bảng điểm · tiêu chí tự động đã điền'],
    'ev.e.sum': ['Total weight is {n}%; it must be 100%.', 'Tổng trọng số là {n}%; phải bằng 100%.'], 'ev.e.name': ['Every criterion needs a name.', 'Mỗi tiêu chí cần có tên.'], 'ev.e.int': ['Weights must be whole numbers above 0.', 'Trọng số phải là số nguyên lớn hơn 0.'],
    'ev.e.inProg': ['Criteria cannot be added or removed while this period has scorecards in progress. Duplicate the template instead.', 'Không thể thêm/xóa tiêu chí khi kỳ này còn bảng điểm đang chấm. Hãy nhân bản mẫu.'],
    'ev.e.locked': ['Weights are locked while Q3/2026 is in progress — Duplicate the template.', 'Trọng số bị khóa trong khi Q3/2026 đang diễn ra — hãy nhân bản mẫu.'], 'ev.tplSaved': ['Template saved', 'Đã lưu mẫu'], 'ev.tplDup': ['{n} duplicated', 'Đã nhân bản {n}'], 'ev.copy': [' (copy)', ' (bản sao)']
  });
  const SOURCES = ['Auto · NCR rate & accepted qty', 'Auto · PO deliveries (in full = accepted qty)', 'Auto · price by Material ID vs 90-day average', 'Auto · tender response time', 'Manual'];
  const st = { period: 'Q3/2026', vendor: 'V-1001', draft: null, errs: {}, tpl: 'TPL-CON', tdraft: null, terrs: [] };
  const tpl = (id) => D().evalTemplates.find((x) => x.id === id) || D().evalTemplates[0];
  const sTone = (s) => ({ Submitted: 'success', Draft: 'warning', 'Not started': 'neutral' }[s] || 'neutral');
  const gradeOf = (x) => (x == null ? null : D().grades.find((g) => Math.round(x * 100) / 100 >= g[1]));
  const total = (tp, scores, w = tp.criteria.map((c) => c.w)) => tp.criteria.reduce((a, c, i) => a + (scores[i] != null && scores[i] !== '' ? +scores[i] : 0) * w[i] / 100, 0);
  const wOf = (sc, tp) => sc.weights || tp.criteria.map((c) => c.w);
  const complete = (scores) => scores.every((x) => x != null && x !== '');
  const isAuto = (c) => c.src.startsWith('Auto');
  const tplFor = (v) => (!v ? 'TPL-CON' : /Equipment/.test(v.cat) ? 'TPL-EQP' : /Services|Logistics/.test(v.cat) ? 'TPL-SRV' : 'TPL-CON');
  const me = () => (App.state.user && App.state.user.name) || 'Nguyễn Minh Anh';
  const vlink = (id) => `<a href="#/vendors/${esc(id)}"><span class="mono small">${esc(id)}</span> ${esc(App.vshort(App.vendor(id)))}</a>`;

  function startCard(v) {
    const tp = tpl(tplFor(v)); const otifS = v.otif != null ? Math.max(1, Math.min(5, Math.round(((v.otif - 75) / 5) * 10) / 10)) : 3.5;
    const auto = { 'Auto · NCR rate & accepted qty': 4.0, 'Auto · PO deliveries (in full = accepted qty)': otifS, 'Auto · price by Material ID vs 90-day average': 3.8, 'Auto · tender response time': 3.5 };
    const sc = { vendor: v.id, tpl: tp.id, period: st.period, status: 'Not started', scores: tp.criteria.map((c) => (isAuto(c) ? auto[c.src] : null)), by: me(), prev: v.score, basis: 'Calculated from POs, GRNs, NCRs and bids in the period',
      evidence: tp.criteria.map((c) => (c.src.includes('deliveries') && v.otif != null ? `OTIF ${num(v.otif, 1)}%` : '')), comment: '' };
    D().scorecards.push(sc); return sc;
  }

  /* ---------- Progress (F-29) ---------- */
  function progress() {
    const cur = st.period === 'Q3/2026';
    const rows = cur ? D().scorecards : Object.entries(D().scoreHistory).map(([vid, h]) => ({ vendor: vid, h: h.find((x) => x[0] === st.period) })).filter((x) => x.h).map((x) => ({ vendor: x.vendor, status: 'Submitted', fixed: x.h[1], tpl: tplFor(App.vendor(x.vendor)) }));
    const cnt = (s) => rows.filter((r) => r.status === s).length;
    return block(t('ev.progress', { p: st.period }), `<p class="small muted">${esc(t('ev.counts', { a: cnt('Submitted'), b: cnt('Draft'), c: cnt('Not started') }))}${cur ? esc(t('ev.dueNote')) : ''}</p>` + table([
      { h: t('c.vendor'), r: (s) => vlink(s.vendor), w: 'minmax(170px,2fr)' },
      { h: t('ev.template'), r: (s) => esc(tv(tpl(s.tpl).name)), w: 'minmax(130px,1.4fr)' },
      { h: t('c.score'), r: (s) => { const x = s.fixed != null ? s.fixed : s.status === 'Not started' ? null : total(tpl(s.tpl), s.scores, wOf(s, tpl(s.tpl))); if (x == null) return '—'; if (s.fixed == null && !complete(s.scores)) return `${num(x, 2)} <span class="small muted">${esc(t('ev.incomplete'))}</span>`; return `${num(x, 2)} · ${gradeOf(x)[0]}`; }, cls: 'num', w: '120px' },
      { h: t('c.status'), r: (s) => pill(s.status, sTone(s.status)), w: '130px' },
      { h: '', r: (s) => `<a class="btn btn-sm" href="#/evaluation/scorecard?vendor=${esc(s.vendor)}">${esc(t(s.status === 'Submitted' ? 'ev.view' : s.status === 'Draft' ? 'ev.continue' : 'ev.evaluate'))}</a>`, w: '110px' }
    ], rows, { min: 640, empty: t('ev.noCards'), label: t('ev.progress', { p: st.period }) }));
  }

  /* ---------- Scorecard (F-28) ---------- */
  function scoreInput(c, i, locked) {
    const val = st.draft[i]; const err = st.errs['s' + i];
    if (isAuto(c) || locked) return `<b>${val == null || val === '' ? '—' : num(+val, 1)}</b>${isAuto(c) ? ` <span class="small muted">${esc(t('ev.auto'))}</span>` : ''}`;
    return `<input class="inp inp-score" aria-label="${esc(t('ev.scoreFor', { c: tv(c.name) }))}" id="ev-s${i}" data-ev-score="${i}" type="number" min="0" max="5" step="0.1" value="${val == null ? '' : esc(val)}"${err ? ' aria-invalid="true" aria-describedby="ev-s' + i + '-e"' : ''}>${err ? `<div class="err small" id="ev-s${i}-e" role="alert">${esc(t(err))}</div>` : ''}`;
  }
  const picker = () => `<label class="sr" for="ev-vendor">${esc(t('ev.vendorPick'))}</label><select class="inp" id="ev-vendor" data-evf="vendor">${D().vendors.map((v) => `<option value="${esc(v.id)}"${v.id === st.vendor ? ' selected' : ''}>${esc(v.id)} · ${esc(App.vshort(v))}</option>`).join('')}</select>`;
  function scorecard() {
    const v = App.vendor(st.vendor);
    const acts = { actions: picker() };
    if (!v) return block(t('ev.scorecard'), App.emptyState(t('ev.choose'), t('ev.chooseN')), acts);
    if (st.period !== 'Q3/2026') { const h = (D().scoreHistory[v.id] || []).find((x) => x[0] === st.period); return block(`${t('ev.scorecard')} · ${v.id} · ${st.period}`, h ? `<p>${esc(t('ev.archived', { s: num(h[1], 2), g: gradeOf(h[1])[0] }))}</p>` : App.emptyState(t('ev.noPeriod')), acts); }
    const sc = D().scorecards.find((s) => s.vendor === v.id && s.period === st.period);
    if (!sc) return block(`${t('ev.scorecard')} · ${v.id}`, App.emptyState(t('ev.noneYet', { v: v.name, p: st.period }), t('ev.startN'), `<button class="btn btn-p btn-sm" data-ev="start" data-id="${esc(v.id)}">${esc(t('ev.start'))}</button>`), acts);
    const tp = tpl(sc.tpl); const locked = sc.status === 'Submitted';
    if (!st.draft || st.draftFor !== v.id) { st.draft = sc.scores.slice(); st.comment = sc.comment; st.draftFor = v.id; }
    const W = wOf(sc, tp); const tot = total(tp, st.draft, W); const g = gradeOf(tot);
    return block(`${t('ev.scorecard')} · ${v.name}`, `<p class="small muted"><span class="mono">${esc(v.id)}</span> · ${esc(t('ev.meta', { tpl: tv(tp.name), p: st.period, b: tv(sc.basis), by: sc.by }))} ${pill(sc.status, sTone(sc.status))}</p>
      <form id="ev-form" novalidate class="stack">${table([
        { h: t('ev.c.criterion'), r: (c) => `<b>${esc(tv(c.name))}</b><div class="small muted">${esc(tv(c.src))}</div>`, w: 'minmax(200px,2fr)' },
        { h: t('ev.c.weight'), r: (c) => num(W[tp.criteria.indexOf(c)]) + '%', cls: 'num', w: '90px' },
        { h: t('ev.c.basis'), r: (c) => esc(tv(sc.evidence[tp.criteria.indexOf(c)]) || (isAuto(c) ? '' : tv('Evaluator judgement'))), w: 'minmax(200px,2fr)' },
        { h: t('ev.c.score'), r: (c) => scoreInput(c, tp.criteria.indexOf(c), locked), w: '130px' },
        { h: t('ev.c.weighted'), r: (c) => { const x = st.draft[tp.criteria.indexOf(c)]; return `<span data-ev-w="${tp.criteria.indexOf(c)}">${x == null || x === '' ? '—' : num(+x * W[tp.criteria.indexOf(c)] / 100, 3)}</span>`; }, cls: 'num', w: '130px' }
      ], tp.criteria, { min: 880, label: t('ev.criteria') })}
        <div class="alert ${complete(st.draft) ? (g[0] === 'A' ? 'alert-success' : g[0] === 'B' ? 'alert-info' : 'alert-warning') : 'alert-info'}" id="ev-total" role="status" aria-live="polite">${totalText(tot, g, sc)}</div>
        ${App.field('ev-comment', t('ev.comment'), st.comment, { area: true, req: !locked, dis: locked, err: st.errs.comment ? t(st.errs.comment) : '' })}
        ${locked ? `<p class="small muted m-0">${esc(t('ev.locked', { by: sc.by, at: sc.at }))}</p>` : `<div class="row-acts"><button type="button" class="btn" data-ev="draft">${esc(t('c.saveDraft'))}</button><button type="submit" class="btn btn-p">${esc(t('ev.submit'))}</button></div>`}
      </form>`, acts);
  }
  function totalText(tot, g, sc) {
    const delta = sc.prev != null ? tot - sc.prev : null;
    return `<b>${esc(t('ev.total', { t: num(tot, 2), g: g[0], s: tv(g[2]) }))}</b>${complete(st.draft) ? '' : esc(t('ev.missing'))}${delta != null && complete(st.draft) ? esc(t('ev.vsQ2', { d: `${delta >= 0 ? '+' : '−'}${num(Math.abs(delta), 2)}` })) : ''}<div class="small">${esc(t('ev.formula'))}</div>`;
  }

  /* ---------- Templates (F-27) ---------- */
  const sumText = (sum) => t('ev.sum', { n: num(sum) }) + (sum === 100 ? '' : t('ev.sumBad'));
  function templates() {
    if (!st.tdraft || st.tdraftFor !== st.tpl) { st.tdraft = tpl(st.tpl).criteria.map((c) => ({ ...c })); st.tdraftFor = st.tpl; st.terrs = []; }
    const sum = st.tdraft.reduce((a, c) => a + (+c.w || 0), 0);
    const rows = st.tdraft.map((c, i) => `<div class="tr tc-cols" role="row">
        <div class="td" role="cell"><input class="inp w-full" aria-label="${esc(t('ev.critName', { n: i + 1 }))}" id="tc-n${i}" data-tc="name" data-i="${i}" value="${esc(c.name)}"></div>
        <div class="td" role="cell"><select class="inp w-full" aria-label="${esc(t('ev.critSrc', { n: i + 1 }))}" id="tc-s${i}" data-tc="src" data-i="${i}">${SOURCES.map((s) => `<option value="${esc(s)}"${s === c.src ? ' selected' : ''}>${esc(tv(s))}</option>`).join('')}</select></div>
        <div class="td num" role="cell"><input class="inp inp-num" aria-label="${esc(t('ev.critW', { n: i + 1 }))}" id="tc-w${i}" data-tc="w" data-i="${i}" type="number" min="1" max="100" value="${esc(c.w)}"></div>
        <div class="td" role="cell"><button type="button" class="btn btn-sm" data-ev="tc-del" data-i="${i}" aria-label="${esc(t('ev.delCrit', { n: tv(c.name) || i + 1 }))}">${esc(t('c.delete'))}</button></div></div>`).join('');
    const tblHtml = `<div class="tbl-wrap" tabindex="0" role="region" aria-label="${esc(t('c.scrolls', { label: t('ev.tplCriteria') }))}"><div class="tbl tbl-640" role="table"><div class="tr thead tc-cols" role="row"><div class="th">${esc(t('ev.c.criterion'))}</div><div class="th">${esc(t('ev.src'))}</div><div class="th num">${esc(t('ev.c.weight'))}</div><div class="th"></div></div>${rows}</div></div>`;
    return [
      block(t('ev.tplCard'), `<div class="filters"><label class="sr" for="ev-tpl">${esc(t('ev.template'))}</label><select class="inp" id="ev-tpl" data-evf="tpl">${D().evalTemplates.map((x) => `<option value="${esc(x.id)}"${x.id === st.tpl ? ' selected' : ''}>${esc(tv(x.name))}</option>`).join('')}</select></div>
        ${tblHtml}
        <div id="tc-sum" class="alert ${sum === 100 ? 'alert-success' : 'alert-warning'}" role="status" aria-live="polite">${esc(sumText(sum))}</div>
        ${st.terrs.length ? `<div class="alert alert-danger" role="alert">${st.terrs.map((e) => esc(Array.isArray(e) ? t(e[0], e[1]) : t(e))).join('<br>')}</div>` : ''}
        <div class="row-acts"><button class="btn" data-ev="tc-add">${esc(t('ev.addCrit'))}</button><button class="btn" data-ev="tc-dup">${esc(t('ev.dupTpl'))}</button><button class="btn btn-p" data-ev="tc-save">${esc(t('ev.saveTpl'))}</button></div>`),
      block(t('ev.grades'), table([{ h: t('vd.grade'), r: (g) => `<b>${g[0]}</b>`, w: '70px' }, { h: t('c.score'), r: (g) => (g[0] === 'A' ? '≥ 4,20' : g[0] === 'B' ? '3,50 – 4,19' : g[0] === 'C' ? '3,00 – 3,49' : '< 3,00'), w: '110px' }, { h: t('ev.vstatus'), r: (g) => pill(g[2], g[0] === 'A' ? 'success' : g[0] === 'B' ? 'info' : g[0] === 'C' ? 'warning' : 'danger') }], D().grades, { min: 300, label: t('ev.grades') }), { span: 6 }),
      block(t('ev.sources'), `<ul class="plain small rule-list">${['ev.s1', 'ev.s2', 'ev.s3', 'ev.s4'].map((k) => `<li>${esc(t(k))}</li>`).join('')}</ul>`, { span: 6 })
    ];
  }
  function readTpl(root) { root.querySelectorAll('[data-tc]').forEach((el) => { const c = st.tdraft[+el.dataset.i]; if (c) c[el.dataset.tc] = el.dataset.tc === 'w' ? (el.value === '' ? '' : +el.value) : el.value; }); }

  /* ---------- History ---------- */
  function history() {
    const ids = Object.keys(D().scoreHistory);
    const v = ids.includes(st.vendor) ? st.vendor : ids[0]; const h = D().scoreHistory[v] || [];
    return [block(t('ev.hist'), table([
      { h: t('c.vendor'), r: (id) => vlink(id), w: 'minmax(170px,2fr)' },
      ...['Q1/2026', 'Q2/2026', 'Q3/2026'].map((p) => ({ h: p, r: (id) => { const x = D().scoreHistory[id].find((y) => y[0] === p); return x ? `${num(x[1], 2)} · ${gradeOf(x[1])[0]}` : '—'; }, cls: 'num', w: '110px' }))
    ], ids, { min: 520, label: t('ev.hist') }), { span: 6 }),
    block(t('ev.trend', { v }), h.length > 1 ? App.chart.line({ labels: h.map((x) => x[0]), values: h.map((x) => x[1]), target: 4.2, targetLabel: 'A', fmt: (x) => num(x, 2), label: t('ev.trendLabel', { v, s: h.map((x) => x[0] + ' ' + num(x[1], 2)).join(', ') }) }) : `<div class="empty">${esc(t('ev.notEnough'))}</div>`, { span: 6 })];
  }

  const SUBS = [['', 'ev.sub.progress'], ['scorecard', 'ev.sub.scorecard'], ['templates', 'ev.sub.templates'], ['history', 'ev.sub.history']];
  function render(p, subArg, admin) {
    if (p.vendor && p.vendor !== st.lastParam) { st.vendor = p.vendor; st.lastParam = p.vendor; st.draft = null; }
    const cur = admin ? 'templates' : App.sub(SUBS, subArg || (p.vendor ? 'scorecard' : ''));
    const sc = D().scorecards;
    const blocks = cur === 'templates' ? templates() : cur === 'history' ? history() : cur === 'scorecard' ? [scorecard()] : [progress()];
    return layout({
      title: t(admin ? 'ev.titleAdmin' : 'ev.title'), subtitle: esc(t('ev.subtitle')),
      actions: admin ? '' : `<label class="sr" for="ev-period">${esc(t('c.period'))}</label><select class="inp" id="ev-period" data-evf="period">${['Q3/2026', 'Q2/2026', 'Q1/2026'].map((x) => `<option${x === st.period ? ' selected' : ''}>${x}</option>`).join('')}</select><button class="btn btn-p" data-ev="new-period">${esc(t('ev.newPeriod'))}</button>`,
      alerts: admin ? '' : App.unknownSub(SUBS, subArg),
      kpis: [kpi(t('ev.k.submitted'), String(sc.filter((s) => s.status === 'Submitted').length), esc(t('ev.k.of', { n: sc.length })), 'success'), kpi(t('ev.k.draft'), String(sc.filter((s) => s.status === 'Draft').length), esc(t('ev.k.inProgress')), 'warning'),
        kpi(t('ev.k.notStarted'), String(sc.filter((s) => s.status === 'Not started').length), esc(t('ev.k.due'))), kpi(t('ev.k.avg'), num(D().vendors.filter((v) => v.score).reduce((a, v, _, A) => a + v.score / A.length, 0), 2), esc(t('ev.k.scored')))],
      subnav: admin ? '' : App.subnav('evaluation', SUBS, cur, cur === 'scorecard' && st.vendor ? 'vendor=' + encodeURIComponent(st.vendor) : ''), blocks
    });
  }

  function mount(root) {
    root.addEventListener('input', (e) => {
      const i = e.target.dataset.evScore;
      if (i != null) {
        st.draft[+i] = e.target.value === '' ? null : e.target.value;
        const sc = D().scorecards.find((s) => s.vendor === st.vendor && s.period === st.period); if (!sc) return; const tp = tpl(sc.tpl);
        const w = root.querySelector(`[data-ev-w="${i}"]`); if (w) w.textContent = e.target.value === '' ? '—' : num(+e.target.value * wOf(sc, tp)[+i] / 100, 3);
        const tot = total(tp, st.draft, wOf(sc, tp)); const box = root.querySelector('#ev-total'); if (box) box.innerHTML = totalText(tot, gradeOf(tot), sc);
      }
      if (e.target.id === 'ev-comment') st.comment = e.target.value;
      if (e.target.dataset.tc) { readTpl(root); const sum = st.tdraft.reduce((a, c) => a + (+c.w || 0), 0); const b = root.querySelector('#tc-sum'); if (b) { b.className = 'alert ' + (sum === 100 ? 'alert-success' : 'alert-warning'); b.textContent = sumText(sum); } }
    });
    root.addEventListener('change', (e) => {
      const k = e.target.dataset.evf;
      if (k === 'period') { st.period = e.target.value; st.draft = null; App.render(); }
      if (k === 'tpl') { st.tpl = e.target.value; App.render(); }
      if (k === 'vendor') { st.vendor = st.lastParam = e.target.value; st.draft = null; st.errs = {}; location.hash = '#/evaluation/scorecard?vendor=' + encodeURIComponent(st.vendor); }
    });
    const commit = (submit) => {
      const sc = D().scorecards.find((s) => s.vendor === st.vendor && s.period === st.period); if (!sc) return; const tp = tpl(sc.tpl); st.errs = {};
      tp.criteria.forEach((c, i) => { const x = st.draft[i]; if (isAuto(c)) return; if (x != null && x !== '' && (isNaN(+x) || +x < 0 || +x > 5)) st.errs['s' + i] = 'ev.e.range'; else if (submit && (x == null || x === '')) st.errs['s' + i] = 'ev.e.req'; });
      if (submit && (st.comment || '').trim().length < 10) st.errs.comment = 'ev.e.comment';
      if (Object.keys(st.errs).length) { App.render(); const er = document.querySelector('#ev-form [aria-invalid=true]'); er && er.focus(); return; }
      sc.scores = st.draft.map((x) => (x == null || x === '' ? null : +x)); sc.comment = st.comment;
      if (submit) { sc.weights = tp.criteria.map((c) => c.w); const tot = Math.round(total(tp, sc.scores, sc.weights) * 100) / 100; const v = App.vendor(sc.vendor); sc.status = 'Submitted'; sc.at = D().today; sc.by = me(); v.score = tot; v.grade = gradeOf(tot)[0]; App.render(); App.toast(t('ev.submitted', { id: v.id, s: num(tot, 2), g: v.grade })); }
      else { sc.status = 'Draft'; App.render(); App.toast(t('ev.draftSaved')); }
    };
    root.addEventListener('submit', (e) => { if (e.target.id === 'ev-form') { e.preventDefault(); commit(true); } });
    root.addEventListener('click', (e) => {
      const el = e.target.closest('[data-ev]'); if (!el) return; const a = el.dataset.ev;
      if (a === 'start') { const v = App.vendor(el.dataset.id); if (!v) return; startCard(v); st.draft = null; App.render(); App.toast(t('ev.started')); }
      else if (a === 'draft') commit(false);
      else if (a === 'new-period') App.toast(t('ev.newPeriodMsg'));
      else if (a === 'tc-add') { readTpl(root); st.tdraft.push({ name: '', src: 'Manual', w: 0 }); App.render(); const n = document.getElementById('tc-n' + (st.tdraft.length - 1)); n && n.focus(); }
      else if (a === 'tc-del') { readTpl(root); st.tdraft.splice(+el.dataset.i, 1); App.render(); }
      else if (a === 'tc-save') {
        readTpl(root); const sum = st.tdraft.reduce((x, c) => x + (+c.w || 0), 0); st.terrs = [];
        if (sum !== 100) st.terrs.push(['ev.e.sum', { n: sum }]);
        if (st.tdraft.some((c) => !String(c.name).trim())) st.terrs.push('ev.e.name');
        if (st.tdraft.some((c) => !(+c.w > 0) || !Number.isInteger(+c.w))) st.terrs.push('ev.e.int');
        if (!st.terrs.length) { const tp = tpl(st.tpl); if (D().scorecards.some((s) => s.tpl === tp.id && s.status !== 'Not started') && tp.criteria.length !== st.tdraft.length) st.terrs.push('ev.e.inProg'); else if (D().scorecards.some((s) => s.tpl === tp.id && s.period === 'Q3/2026' && (s.status === 'Submitted' || s.status === 'Draft')) && tp.criteria.some((c, i) => +st.tdraft[i].w !== c.w)) st.terrs.push('ev.e.locked'); }
        if (!st.terrs.length) { tpl(st.tpl).criteria = st.tdraft.map((c) => ({ ...c, w: +c.w })); App.render(); App.toast(t('ev.tplSaved')); } else App.render();
      }
      else if (a === 'tc-dup') { readTpl(root); const src = tpl(st.tpl); const id = src.id + '-' + (D().evalTemplates.length + 1); D().evalTemplates.push({ id, name: tv(src.name) + t('ev.copy'), cat: src.cat, criteria: st.tdraft.map((c) => ({ ...c })) }); st.tpl = id; App.render(); App.toast(t('ev.tplDup', { n: tv(src.name) })); }
    });
  }

  App.page('evaluation', { titleKey: 'ev.title', ws: 'procurement', roles: ['procurement', 'admin'], render: (p, s) => render(p, s, false), mount });
  App.page('admin/templates', { titleKey: 'ev.titleAdmin', roles: ['admin'], render: (p) => render(p, '', true), mount });
})();
