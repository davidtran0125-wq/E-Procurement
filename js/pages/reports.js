/* Module 14 · Reports — F-81 filters + OTIF KPIs by accepted qty (R-07), F-82 OTIF by vendor, F-83 saving KPIs reported vs Finance-validated (R-24),
   F-84 saving formula & records with type and status, F-85 spend cube (vendor / Material ID / project), top-5 concentration, contract coverage,
   off-contract list and cycle times (R-17), F-86 budget vs committed vs actual by project (R-14).
   Routes: #/reports (OTIF), #/reports/saving, /spend, /coverage, /cycle, /budget */
(function () {
  const { esc, num, pct, vnd, ty, mid, pill, table, kpi, block, layout, t, tv } = App;
  const S = App.src;
  const D = () => window.DATA;
  I18N.add({
    'rp.subtitle': ['OTIF, saving, spend and budget · every figure traces to Material ID lines · excl. VAT', 'OTIF, tiết kiệm, chi tiêu và ngân sách · mọi số liệu truy về dòng mã vật tư · chưa VAT'],
    'rp.xlsx': ['Exported Reports_02-11-2026.xlsx', 'Đã xuất Reports_02-11-2026.xlsx'], 'rp.pdf': ['Exported Reports_02-11-2026.pdf', 'Đã xuất Reports_02-11-2026.pdf'], 'rp.exportXlsx': ['Export Excel', 'Xuất Excel'], 'rp.exportPdf': ['Export PDF', 'Xuất PDF'],
    'rp.sub.otif': ['OTIF', 'OTIF'], 'rp.sub.saving': ['Saving', 'Tiết kiệm'], 'rp.sub.spend': ['Spend', 'Chi tiêu'], 'rp.sub.coverage': ['Contract coverage', 'Độ phủ hợp đồng'], 'rp.sub.cycle': ['Cycle time', 'Thời gian chu trình'], 'rp.sub.budget': ['Budget', 'Ngân sách'],
    'rp.f.period': ['Period', 'Kỳ'], 'rp.p.ytd': ['Year to date 2026', 'Từ đầu năm 2026'], 'rp.p.q3': ['Q3 2026', 'Quý 3/2026'], 'rp.p.90': ['Last 90 days', '90 ngày gần nhất'], 'rp.allCats': ['All categories', 'Mọi nhóm hàng'], 'rp.allVendors': ['All vendors', 'Mọi NCC'], 'rp.allMats': ['All Material IDs', 'Mọi mã vật tư'],
    'rp.k.otifN': ['{s} · target {t}', '{s} · mục tiêu {t}'], 'rp.k.ontime': ['On time', 'Đúng hạn'], 'rp.k.ontimeN': ['Received ≤ promised date', 'Nhận ≤ ngày hẹn'], 'rp.k.infull': ['In full', 'Đủ số lượng'], 'rp.k.infullN': ['Accepted qty ≥ scheduled qty', 'SL chấp nhận ≥ SL theo lịch'],
    'rp.k.dels': ['Deliveries', 'Lượt giao'], 'rp.k.delsN': ['{a} late · {b} short / rejected', '{a} trễ · {b} thiếu / bị loại'], 'rp.k.inScope': ['In scope', 'Trong phạm vi'],
    'rp.trend': ['OTIF trend vs target', 'Xu hướng OTIF so với mục tiêu'], 'rp.target95': ['Target 95%', 'Mục tiêu 95%'], 'rp.trendLabel': ['Monthly OTIF from {a} to {b} against a 95% target', 'OTIF theo tháng từ {a} đến {b} so với mục tiêu 95%'],
    'rp.otifDef': ['OTIF = deliveries that are on time (received ≤ promised date) and in full (accepted qty ≥ scheduled qty) ÷ all deliveries. One delivery = one PO schedule line per Material ID; for SRV- the SLA met counts as in full.', 'OTIF = số lượt giao đúng hạn (nhận ≤ ngày hẹn) và đủ (SL chấp nhận ≥ SL theo lịch) ÷ tổng số lượt giao. Một lượt giao = một dòng lịch giao PO theo mã vật tư; với SRV-, đạt SLA được tính là đủ.'],
    'rp.byVendor': ['OTIF by vendor', 'OTIF theo NCC'], 'rp.onTarget': ['On target', 'Đạt mục tiêu'], 'rp.risk85': ['< 85% · risk', '< 85% · rủi ro'], 'rp.below': ['Below target', 'Dưới mục tiêu'], 'rp.label': ['Label', 'Nhãn'],
    'rp.k.sav': ['Saving YTD (reported)', 'Tiết kiệm từ đầu năm (báo cáo)'], 'rp.k.savN': ['{r} of sourced spend · target {t}', '{r} chi tiêu qua tìm nguồn · mục tiêu {t}'], 'rp.k.val': ['Finance-validated', 'Tài chính đã xác nhận'], 'rp.k.valN': ['{p} of reported', '{p} số báo cáo'],
    'rp.k.avoid': ['Cost avoidance', 'Chi phí tránh được'], 'rp.k.avoidN': ['Reported separately, not in saving', 'Báo cáo riêng, không tính vào tiết kiệm'], 'rp.k.rate': ['Saving rate', 'Tỷ lệ tiết kiệm'], 'rp.above': ['Above target', 'Trên mục tiêu'],
    'rp.byCat': ['Saving by category', 'Tiết kiệm theo nhóm hàng'], 'rp.byCatN': ['Price reduction + negotiated terms · excl. VAT.', 'Giảm giá + điều khoản đàm phán · chưa VAT.'],
    'rp.recs': ['Saving records', 'Bản ghi tiết kiệm'], 'rp.formula': ['Saving = (Baseline − Awarded) × Qty per Material ID line · baseline = last PO price of the same Material ID (fallback: average of first-round bids) · excl. VAT. Status: Draft → Submitted → Validated by Finance.', 'Tiết kiệm = (Giá cơ sở − Giá trúng) × SL mỗi dòng mã vật tư · giá cơ sở = giá PO gần nhất của cùng mã vật tư (dự phòng: bình quân giá vòng 1) · chưa VAT. Trạng thái: Nháp → Đã gửi → Tài chính xác nhận.'],
    'rp.c.record': ['Record', 'Bản ghi'], 'rp.c.calc': ['Calculation', 'Cách tính'], 'rp.c.saving': ['Saving', 'Tiết kiệm'], 'rp.valByFin': ['Validated by Finance', 'Tài chính đã xác nhận'], 'rp.submit': ['Submit', 'Gửi'], 'rp.validate': ['Validate', 'Xác nhận'],
    'rp.finYou': ['You validate as Finance (Đỗ Hoàng Nam).', 'Bạn xác nhận với vai trò Tài chính (Đỗ Hoàng Nam).'], 'rp.finOnly': ['Only Finance (Đỗ Hoàng Nam) can validate saving records.', 'Chỉ Tài chính (Đỗ Hoàng Nam) được xác nhận bản ghi tiết kiệm.'], 'rp.savExport': ['Export saving records', 'Xuất bản ghi tiết kiệm'], 'rp.savExportMsg': ['Exported Saving_records_2026.xlsx', 'Đã xuất Saving_records_2026.xlsx'],
    'rp.baseTxt': ['1.520.000.000 ₫ (last PO per line)', '1.520.000.000 ₫ (PO gần nhất mỗi dòng)'], 'rp.submitted': ['{id} submitted to Finance', 'Đã gửi {id} cho Tài chính'], 'rp.validated': ['{id} validated by Finance', '{id} đã được Tài chính xác nhận'],
    'rp.cube': ['Spend cube', 'Khối chi tiêu'], 'rp.spendBy': ['Spend by', 'Chi tiêu theo'], 'rp.byV': ['By vendor', 'Theo NCC'], 'rp.byM': ['By Material ID', 'Theo mã vật tư'], 'rp.byP': ['By project', 'Theo dự án'], 'rp.top5': ['top 5', 'top 5'], 'rp.other': ['Other {n} vendors', '{n} NCC khác'],
    'rp.spendNote': ['Spend YTD {v} tỷ ₫ excl. VAT · keyed by Material ID → category.', 'Chi tiêu từ đầu năm {v} tỷ ₫ chưa VAT · theo mã vật tư → nhóm hàng.'], 'rp.conc': ['Top 5 vendors = {a} tỷ ₫ = {p} (concentration).', '5 NCC lớn nhất = {a} tỷ ₫ = {p} (mức độ tập trung).'], 'rp.projNote': ['Project spend = invoiced + committed.', 'Chi tiêu dự án = đã hóa đơn + đã cam kết.'], 'rp.matNote': ['Material IDs in this sample.', 'Các mã vật tư trong mẫu.'],
    'rp.k.spend': ['Spend YTD', 'Chi tiêu từ đầu năm'], 'rp.k.spendN': ['excl. VAT', 'chưa VAT'], 'rp.k.top5': ['Top 5 vendors', '5 NCC lớn nhất'], 'rp.k.vendors': ['Active vendors', 'NCC có chi tiêu'], 'rp.k.vendorsN': ['{n} named + {o} others', '{n} có tên + {o} khác'],
    'rp.cov.k': ['Contract coverage', 'Độ phủ hợp đồng'], 'rp.cov.kN': ['Spend under an active contract', 'Chi tiêu theo hợp đồng hiệu lực'], 'rp.off.k': ['Off-contract', 'Ngoài hợp đồng'], 'rp.off.kN': ['Bought outside an active contract, or after it expired', 'Mua ngoài hợp đồng hiệu lực, hoặc sau khi hợp đồng hết hạn'],
    'rp.off.n': ['Off-contract POs', 'PO ngoài hợp đồng'], 'rp.off.title': ['Off-contract POs', 'PO ngoài hợp đồng'], 'rp.c.from': ['Bought from', 'Mua từ'], 'rp.c.contract': ['Contract', 'Hợp đồng'], 'rp.c.value': ['Value excl. VAT', 'Giá trị chưa VAT'], 'rp.off.none': ['No off-contract POs', 'Không có PO ngoài hợp đồng'],
    'rp.cy.median': ['PR → PO median', 'Trung vị PR → PO'], 'rp.daysN': ['{n} days', '{n} ngày'], 'rp.cy.target': ['Target ≤ {n} days', 'Mục tiêu ≤ {n} ngày'], 'rp.cy.appr': ['Approval time', 'Thời gian duyệt'], 'rp.cy.apprN': ['Median per step', 'Trung vị mỗi bước'], 'rp.cy.tender': ['Tender duration', 'Thời gian đấu thầu'], 'rp.cy.tenderN': ['Invite → award, median', 'Mời → trao thầu, trung vị'],
    'rp.cy.title': ['Cycle time by route', 'Thời gian chu trình theo luồng duyệt'], 'rp.cy.route': ['Route', 'Luồng duyệt'], 'rp.cy.med': ['Median PR → PO', 'Trung vị PR → PO'], 'rp.cy.pos': ['POs', 'Số PO'],
    'rp.b.title': ['Budget vs committed vs actual', 'Ngân sách so với cam kết và thực tế'], 'rp.b.line': ['Project / budget line', 'Dự án / dòng ngân sách'], 'rp.b.aria': ['Invoiced {i}, committed {c} of {b}', 'Đã hóa đơn {i}, đã cam kết {c} trên {b}'], 'rp.b.budget': ['Budget', 'Ngân sách'], 'rp.b.inv': ['Invoiced (actual)', 'Đã hóa đơn (thực tế)'],
    'rp.b.com': ['Committed', 'Đã cam kết'], 'rp.b.avail': ['Available', 'Còn khả dụng'], 'rp.b.used': ['Used', 'Đã dùng'], 'rp.b.note': ['Available = Budget − Invoiced − Committed · committed = open PO value not yet invoiced · bar: dark = invoiced, amber = committed.', 'Khả dụng = Ngân sách − Đã hóa đơn − Đã cam kết · cam kết = giá trị PO đang mở chưa hóa đơn · thanh: đậm = đã hóa đơn, vàng = đã cam kết.'],
    'rp.k.bTot': ['Total budget', 'Tổng ngân sách'], 'rp.k.bUsed': ['Used', 'Đã dùng'], 'rp.k.bUsedN': ['Invoiced + committed', 'Đã hóa đơn + đã cam kết'], 'rp.k.bAvail': ['Available', 'Còn khả dụng'], 'rp.k.bLines': ['Budget lines', 'Dòng ngân sách'], 'rp.k.bOver': ['{n} above 75% used', '{n} dòng dùng trên 75%']
  });
  I18N.values({
    'Price reduction': 'Giảm giá', 'Negotiated terms': 'Điều khoản đàm phán', 'Cost avoidance': 'Chi phí tránh được', 'Validated by Finance': 'Tài chính đã xác nhận',
    '≤ 200tr · Dept head': '≤ 200tr · Trưởng bộ phận', '≤ 2 tỷ · + Procurement Lead': '≤ 2 tỷ · + Trưởng phòng Mua sắm', '> 2 tỷ · + Finance Director': '> 2 tỷ · + Giám đốc Tài chính', 'Contract release (no tender)': 'Phát hành từ hợp đồng (không đấu thầu)',
    'Nhà xưởng C2 · Steel': 'Nhà xưởng C2 · Thép'
  });
  const CAT = { CON: 'Construction', EQP: 'Equipment', SRV: 'Services', LOG: 'Logistics' };
  const st = { period: 'ytd', cat: 'all', vendor: 'all', mat: 'all', cube: 'vendor', extraVal: 0 };
  const R = () => D().reports;

  function savings() {
    return R().savings.map((s) => {
      if (!s.tender) return Object.assign(s, { val: (s.base - s.award) * s.qty });
      const tn = D().tenders[s.tender]; const doc = S.docOf(s.tender); const award = tn.award ? tn.award.value : 1465900000;
      if (doc.status === 'Awarded' && s.status === 'Draft') s.status = 'Submitted';
      return Object.assign(s, { val: 1520000000 - award, awardTxt: vnd(award) });
    });
  }

  function otif() {
    const V = D().vendors; const ov = R().otifVendors; const K = D().kpi;
    let o = K.otif90, onTime = R().otif.onTime, inFull = R().otif.inFull, dels = R().otif.deliveries, scope = t('rp.allCats');
    if (st.mat !== 'all') { const m = App.material(st.mat); dels = m.otif[1]; o = dels ? m.otif[0] / dels * 100 : 0; onTime = inFull = null; scope = st.mat; }
    else if (st.vendor !== 'all') { const x = ov[st.vendor] || [0, 0, 0]; dels = x[0]; o = App.vendor(st.vendor).otif; onTime = x[1]; inFull = x[2]; scope = App.vshort(App.vendor(st.vendor)); }
    else if (st.cat !== 'all') { o = K.byCat[st.cat].otif; onTime = inFull = null; dels = null; scope = tv(CAT[st.cat]); }
    const filters = `<div class="filters"><label class="sr" for="rp-p">${esc(t('rp.f.period'))}</label><select class="inp" id="rp-p" data-rpf="period">${['ytd', 'q3', '90'].map((k) => `<option value="${k}"${st.period === k ? ' selected' : ''}>${esc(t('rp.p.' + k))}</option>`).join('')}</select>
      <label class="sr" for="rp-c">${esc(t('c.category'))}</label><select class="inp" id="rp-c" data-rpf="cat"><option value="all">${esc(t('rp.allCats'))}</option>${Object.entries(CAT).map(([k, l]) => `<option value="${k}"${st.cat === k ? ' selected' : ''}>${esc(tv(l))}</option>`).join('')}</select>
      <label class="sr" for="rp-v">${esc(t('c.vendor'))}</label><select class="inp" id="rp-v" data-rpf="vendor"><option value="all">${esc(t('rp.allVendors'))}</option>${V.filter((v) => ov[v.id]).map((v) => `<option value="${v.id}"${st.vendor === v.id ? ' selected' : ''}>${esc(App.vshort(v))}</option>`).join('')}</select>
      <label class="sr" for="rp-m">${esc(t('c.mid'))}</label><select class="inp" id="rp-m" data-rpf="mat"><option value="all">${esc(t('rp.allMats'))}</option>${D().materials.filter((m) => m.otif[1]).map((m) => `<option value="${m.id}"${st.mat === m.id ? ' selected' : ''}>${m.id} · ${esc(m.name)}</option>`).join('')}</select></div>`;
    const kpis = [kpi('OTIF', pct(o), esc(t('rp.k.otifN', { s: scope, t: pct(D().otif.target, 0) })), o >= 95 ? 'success' : 'warning'), kpi(t('rp.k.ontime'), onTime != null ? pct(onTime) : '—', esc(t('rp.k.ontimeN'))), kpi(t('rp.k.infull'), inFull != null ? pct(inFull) : '—', esc(t('rp.k.infullN'))),
      kpi(t('rp.k.dels'), dels != null ? num(dels) : '—', esc(st.cat === 'all' && st.vendor === 'all' && st.mat === 'all' ? t('rp.k.delsN', { a: num(R().otif.late), b: num(R().otif.short) }) : t('rp.k.inScope')))];
    const O = D().otif;
    const trend = block(t('rp.trend'), filters + App.chart.line({ labels: O.months, values: O.values, target: O.target, targetLabel: t('rp.target95'), min: 85, max: 97, fmt: (v) => pct(v), label: t('rp.trendLabel', { a: O.months[0], b: O.months[11] }) }) + `<p class="small muted">${esc(t('rp.otifDef'))}</p>`);
    const vrows = V.filter((v) => ov[v.id]).map((v) => ({ v, x: ov[v.id] })).sort((a, b) => b.v.otif - a.v.otif);
    const byVendor = block(t('rp.byVendor'), table([
      { h: t('c.vendor'), r: (r) => `<a href="#/vendors/${r.v.id}">${esc(App.vshort(r.v))}</a>`, w: 'minmax(120px,1.6fr)' }, { h: t('rp.k.dels'), r: (r) => num(r.x[0]), cls: 'num', w: '80px' },
      { h: t('rp.k.ontime'), r: (r) => pct(r.x[1]), cls: 'num', w: '80px' }, { h: t('rp.k.infull'), r: (r) => pct(r.x[2]), cls: 'num', w: '80px' }, { h: 'OTIF', r: (r) => `<b>${pct(r.v.otif)}</b>`, cls: 'num', w: '70px' },
      { h: t('rp.label'), r: (r) => (r.v.otif >= 95 ? pill(t('rp.onTarget'), 'success') : r.v.otif < 85 ? pill(t('rp.risk85'), 'danger') : pill(t('rp.below'), 'warning')), w: '120px' }
    ], vrows, { label: t('rp.byVendor') }));
    return { kpis, blocks: [trend, byVendor] };
  }
  function saving() {
    const K = D().kpi; const SV = savings(); const sv = R().saving; const validated = sv.validated + st.extraVal / 1e9;
    const kpis = [kpi(t('rp.k.sav'), num(sv.reported, 1) + ' tỷ ₫', esc(t('rp.k.savN', { r: pct(sv.rate), t: pct(sv.target, 0) })), 'success'), kpi(t('rp.k.val'), num(validated, 1) + ' tỷ ₫', esc(t('rp.k.valN', { p: pct(validated / sv.reported * 100, 0) }))),
      kpi(t('rp.k.avoid'), num(sv.avoidance, 1) + ' tỷ ₫', esc(t('rp.k.avoidN'))), kpi(t('rp.k.rate'), pct(sv.rate), esc(t(sv.rate >= sv.target ? 'rp.above' : 'rp.below')), sv.rate >= sv.target ? 'success' : 'warning')];
    const isFin = S.me() === 'Đỗ Hoàng Nam';
    const recs = block(t('rp.recs'), `<p class="small mt-0">${esc(t('rp.formula'))}</p>` + table([
      { h: t('rp.c.record'), r: (s) => `<span class="mono small">${esc(s.id)}</span><div class="small muted">${esc(s.doc)}</div>`, w: 'minmax(150px,1.4fr)' }, { h: t('c.mid'), r: (s) => mid(s.mat), w: '120px' },
      { h: t('c.type'), r: (s) => pill(s.type, s.type === 'Cost avoidance' ? 'neutral' : 'info'), w: '150px' },
      { h: t('rp.c.calc'), r: (s) => (s.tender ? `${esc(t('rp.baseTxt'))}<div class="small muted">− ${esc(s.awardTxt)}</div>` : `(${vnd(s.base)} − ${vnd(s.award)}) × ${num(s.qty)}`), cls: 'num wrap', w: 'minmax(220px,2fr)' },
      { h: t('rp.c.saving'), r: (s) => `<b>${vnd(s.val)}</b>`, cls: 'num', w: '140px' },
      { h: t('c.status'), r: (s) => `${pill(s.status === 'Validated' ? t('rp.valByFin') : s.status, s.status === 'Validated' ? 'success' : s.status === 'Submitted' ? 'warning' : 'neutral')}${s.by ? `<div class="small muted">${esc(s.by)}</div>` : ''}${s.status === 'Draft' && !s.tender ? `<div class="mt-s"><button class="btn btn-sm" data-rp="submit" data-id="${s.id}">${esc(t('rp.submit'))}</button></div>` : ''}${s.status === 'Submitted' ? `<div class="mt-s"><button class="btn btn-sm" data-rp="validate" data-id="${s.id}"${isFin ? '' : ' disabled aria-describedby="rp-fin-h"'}>${esc(t('rp.validate'))}</button></div>` : ''}`, w: 'minmax(170px,1.4fr)' }
    ], SV, { label: t('rp.recs') }) + `<p class="small muted" id="rp-fin-h">${esc(t(isFin ? 'rp.finYou' : 'rp.finOnly'))}</p>`, { actions: `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('rp.savExportMsg'))}">${esc(t('rp.savExport'))}</button>` });
    const byCat = block(t('rp.byCat'), App.chart.bars(Object.keys(CAT).map((c) => ({ label: tv(CAT[c]), value: K.byCat[c].saving })), (v) => num(v, 1) + ' tỷ ₫') + `<p class="small muted">${esc(t('rp.byCatN'))}</p>`);
    return { kpis, blocks: [recs, byCat] };
  }
  const SPEND = 186.4;
  function spend() {
    const SV = R().spendVendor; const top5 = SV.slice(0, 5).reduce((a, x) => a + x[1], 0);
    const rows = st.cube === 'vendor' ? SV.map(([v, x], i) => ({ label: App.vshort(App.vendor(v)), value: x, note: i < 5 ? t('rp.top5') : '', href: '#/vendors/' + v })).concat([{ label: t('rp.other', { n: R().otherVendors }), value: SPEND - SV.reduce((a, x) => a + x[1], 0), dim: true }])
      : st.cube === 'mat' ? D().materials.filter((m) => m.spendYtd).sort((a, b) => b.spendYtd - a.spendYtd).map((m) => ({ label: `${m.id} ${m.name}`, value: m.spendYtd, href: '#/material360?id=' + m.id }))
        : Object.values(D().budgets).map((b) => ({ label: tv(b.name), value: (b.invoiced + b.committed) / 1e9 }));
    const kpis = [kpi(t('rp.k.spend'), num(SPEND, 1) + ' tỷ ₫', esc(t('rp.k.spendN'))), kpi(t('rp.k.top5'), pct(top5 / SPEND * 100), `${num(top5, 2)} tỷ ₫`, top5 / SPEND > 0.4 ? 'warning' : ''), kpi(t('rp.k.vendors'), num(SV.length + R().otherVendors), esc(t('rp.k.vendorsN', { n: SV.length, o: R().otherVendors }))), kpi(t('rp.cov.k'), pct(R().coverage), esc(t('rp.cov.kN')))];
    return { kpis, blocks: [block(t('rp.cube'), `<div class="seg seg-wrap" role="group" aria-label="${esc(t('rp.spendBy'))}">${[['vendor', 'rp.byV'], ['mat', 'rp.byM'], ['project', 'rp.byP']].map(([k, l]) => `<button data-rp="cube" data-k="${k}" aria-pressed="${st.cube === k}">${esc(t(l))}</button>`).join('')}</div><div class="mt">${App.chart.bars(rows, (v) => num(v, 2) + ' tỷ ₫')}</div>
      <p class="small muted">${esc(t('rp.spendNote', { v: num(SPEND, 1) }))} ${esc(st.cube === 'vendor' ? t('rp.conc', { a: num(top5, 2), p: pct(top5 / SPEND * 100) }) : st.cube === 'project' ? t('rp.projNote') : t('rp.matNote'))}</p>`)] };
  }
  function coverage() {
    const off = S.offContract();
    const kpis = [kpi(t('rp.cov.k'), pct(R().coverage), esc(t('rp.cov.kN'))), kpi(t('rp.off.k'), pct(100 - R().coverage), esc(t('rp.off.kN')), 'warning'), kpi(t('rp.off.n'), String(off.length), esc(off.map((x) => x.d.id).join(', ') || t('c.none')), off.length ? 'warning' : '')];
    return { kpis, blocks: [block(t('rp.off.title'), table([
      { h: t('c.mid'), r: (x) => mid(x.m), w: '120px' }, { h: 'PO', r: (x) => `<a class="mono" href="#/po/${x.d.id}">${x.d.id}</a><div class="small muted">${esc(x.d.date)}</div>`, w: '130px' },
      { h: t('rp.c.from'), r: (x) => esc(App.vshort(App.vendor(x.d.vendor))), w: 'minmax(120px,1fr)' }, { h: t('rp.c.contract'), r: (x) => `<a class="mono" href="#/contracts/${x.c.id}">${x.c.id}</a><div class="small muted">${esc(tv(x.why))}</div>`, w: 'minmax(160px,1.3fr)' },
      { h: t('rp.c.value'), r: (x) => vnd(x.d.value), cls: 'num', w: '150px' }
    ], off, { empty: t('rp.off.none'), label: t('rp.off.title') }))] };
  }
  function cycle() {
    const C = R().cycle;
    const kpis = [kpi(t('rp.cy.median'), esc(t('rp.daysN', { n: num(C.median, 1) })), esc(t('rp.cy.target', { n: C.target })), C.median <= C.target ? 'success' : 'warning'), kpi(t('rp.cy.appr'), esc(t('rp.daysN', { n: num(C.approval, 1) })), esc(t('rp.cy.apprN'))), kpi(t('rp.cy.tender'), esc(t('rp.daysN', { n: num(C.tender) })), esc(t('rp.cy.tenderN')))];
    return { kpis, blocks: [block(t('rp.cy.title'), table([{ h: t('rp.cy.route'), r: (r) => esc(tv(r[0])), w: 'minmax(220px,2fr)' }, { h: t('rp.cy.med'), r: (r) => esc(t('rp.daysN', { n: num(r[1], 1) })), cls: 'num', w: '160px' }, { h: t('rp.cy.pos'), r: (r) => num(r[2]), cls: 'num', w: '90px' }], C.routes, { label: t('rp.cy.title') }))] };
  }
  function budget() {
    const B = Object.values(D().budgets); const tot = B.reduce((a, b) => a + b.budget, 0); const used = B.reduce((a, b) => a + b.invoiced + b.committed, 0); const hi = B.filter((b) => (b.invoiced + b.committed) / b.budget > 0.75);
    const kpis = [kpi(t('rp.k.bTot'), ty(tot), esc(t('rp.k.spendN'))), kpi(t('rp.k.bUsed'), pct(used / tot * 100), esc(t('rp.k.bUsedN'))), kpi(t('rp.k.bAvail'), ty(tot - used), ''), kpi(t('rp.k.bLines'), String(B.length), esc(t('rp.k.bOver', { n: hi.length })), hi.length ? 'warning' : '')];
    return { kpis, blocks: [block(t('rp.b.title'), table([
      { h: t('rp.b.line'), r: (b) => `${esc(tv(b.name))}<div class="stack-bar mt-s" role="img" aria-label="${esc(t('rp.b.aria', { i: ty(b.invoiced), c: ty(b.committed), b: ty(b.budget) }))}"><span class="sb-inv" style="width:${(b.invoiced / b.budget * 100).toFixed(1)}%"></span><span class="sb-warn" style="width:${(b.committed / b.budget * 100).toFixed(1)}%"></span></div>`, w: 'minmax(220px,2.4fr)' },
      { h: t('rp.b.budget'), r: (b) => vnd(b.budget), cls: 'num', w: '150px' }, { h: t('rp.b.inv'), r: (b) => vnd(b.invoiced), cls: 'num', w: '150px' }, { h: t('rp.b.com'), r: (b) => vnd(b.committed), cls: 'num', w: '150px' },
      { h: t('rp.b.avail'), r: (b) => `<b>${vnd(b.budget - b.invoiced - b.committed)}</b>`, cls: 'num', w: '150px' }, { h: t('rp.b.used'), r: (b) => pct((b.invoiced + b.committed) / b.budget * 100), cls: 'num', w: '80px' }
    ], B, { label: t('rp.b.title') }) + `<p class="small muted">${esc(t('rp.b.note'))}</p>`)] };
  }

  const SUBS = [['', 'rp.sub.otif'], ['saving', 'rp.sub.saving'], ['spend', 'rp.sub.spend'], ['coverage', 'rp.sub.coverage'], ['cycle', 'rp.sub.cycle'], ['budget', 'rp.sub.budget']];
  const VIEW = { '': otif, saving, spend, coverage, cycle, budget };
  App.page('reports', {
    titleKey: 'nav.reports', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, subArg) {
      const cur = App.sub(SUBS, subArg || ''); const v = VIEW[cur]();
      return layout({
        title: t('nav.reports'), subtitle: esc(t('rp.subtitle')),
        actions: `<button class="btn" data-act="toast" data-msg="${esc(t('rp.xlsx'))}">${esc(t('rp.exportXlsx'))}</button><button class="btn" data-act="toast" data-msg="${esc(t('rp.pdf'))}">${esc(t('rp.exportPdf'))}</button>`,
        alerts: App.unknownSub(SUBS, subArg), kpis: v.kpis, subnav: App.subnav('reports', SUBS, cur), blocks: v.blocks
      });
    },
    mount(root) {
      root.addEventListener('change', (e) => { const k = e.target.dataset.rpf; if (!k) return; st[k] = e.target.value; App.render(); const x = document.getElementById(e.target.id); x && x.focus(); });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-rp]'); if (!b) return; const k = b.dataset.rp;
        if (k === 'cube') { st.cube = b.dataset.k; App.render(); return; }
        const s = R().savings.find((x) => x.id === b.dataset.id); if (!s) return;
        if (k === 'submit') { s.status = 'Submitted'; App.render(); App.toast(t('rp.submitted', { id: s.id })); }
        else if (k === 'validate' && S.me() === 'Đỗ Hoàng Nam') { s.status = 'Validated'; s.by = 'Đỗ Hoàng Nam · ' + D().today; st.extraVal += s.val; App.render(); App.toast(t('rp.validated', { id: s.id })); }
      });
    }
  });
})();
