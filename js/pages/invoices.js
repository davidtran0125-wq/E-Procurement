/* Module 12 · Invoices & 3-way match — F-70 e-invoice inbox with tabs and tolerance banner (R-01), F-71 six legal checks incl. GDT lookup,
   F-72 match grid per Material ID line (price ±0,5% vs PO, qty ±2% vs GRN accepted for tấn/m³, exact for count units, open NCR blocks qty) (R-02),
   F-73 exceptions assigned to the buyer → My approvals / credit note, F-74 2-way match for SRV- against the service entry sheet,
   F-75 status stepper, due date from vendor terms, Ready for payment, Export to accounting (Material ID → item code, V-code → vendor code).
   Routes: #/invoices (?q=, ?tab=), #/invoices/rules, #/invoices/<id>(/match|history) */
(function () {
  const { esc, num, pct, vnd, mid, pill, table, kpi, block, layout, t, tv } = App;
  const S = App.src;
  const D = () => window.DATA;
  I18N.add({
    'inv.subtitle': ['E-invoices (NĐ 123/2020, TT 78/2021) from the supplier portal and hoadon@ inbox · legal check, then 3-way match per Material ID line', 'Hóa đơn điện tử (NĐ 123/2020, TT 78/2021) từ cổng NCC và hộp thư hoadon@ · kiểm tra pháp lý, rồi đối chiếu 3 bên theo dòng mã vật tư'],
    'inv.fetch': ['Fetch e-invoice inbox', 'Lấy hóa đơn từ hộp thư'], 'inv.fetchMsg': ['hoadon@ inbox fetched · no new e-invoices since 08:00', 'Đã lấy hộp thư hoadon@ · không có hóa đơn mới từ 08:00'], 'inv.upload': ['Upload XML + PDF', 'Tải lên XML + PDF'], 'inv.uploadMsg': ['Choose the XML and PDF of the e-invoice (both required)', 'Chọn tệp XML và PDF của hóa đơn điện tử (bắt buộc cả hai)'],
    'inv.sub.list': ['E-invoices', 'Hóa đơn điện tử'], 'inv.sub.rules': ['Tolerances & checks', 'Dung sai & kiểm tra'], 'inv.d.overview': ['Overview & legal checks', 'Tổng quan & kiểm tra pháp lý'], 'inv.d.match': ['Match', 'Đối chiếu'], 'inv.d.history': ['History', 'Lịch sử'],
    'inv.k.all': ['All invoices', 'Tất cả hóa đơn'], 'inv.k.match': ['To match', 'Chờ đối chiếu'], 'inv.k.exc': ['Exceptions', 'Ngoại lệ'], 'inv.k.blocked': ['Blocked', 'Bị chặn'],
    'inv.tab.all': ['All', 'Tất cả'], 'inv.tab.match': ['To match', 'Chờ đối chiếu'], 'inv.tab.exc': ['Exceptions', 'Ngoại lệ'], 'inv.tab.ready': ['Ready for payment', 'Sẵn sàng thanh toán'], 'inv.tab.blocked': ['Blocked', 'Bị chặn'],
    'inv.banner': ['Tolerances: price ±{p}% vs PO · quantity ±{q}% vs GRN accepted qty for weight/volume units (tấn, m³), exact for count units · SRV- uses 2-way match with the service entry sheet.', 'Dung sai: giá ±{p}% so với PO · số lượng ±{q}% so với SL GRN chấp nhận với đơn vị khối lượng/thể tích (tấn, m³), chính xác với đơn vị đếm · SRV- đối chiếu 2 bên với biên bản nghiệm thu.'],
    'inv.editAdmin': ['Edit in Admin', 'Sửa trong Quản trị'], 'inv.editedAdmin': ['Edited in Admin.', 'Được sửa trong Quản trị.'], 'inv.statusLbl': ['Invoice status', 'Trạng thái hóa đơn'],
    'inv.searchLbl': ['Search invoices', 'Tìm hóa đơn'], 'inv.searchPh': ['Search INV, ký hiệu/số, MST, PO, GRN or Material ID', 'Tìm INV, ký hiệu/số, MST, PO, GRN hoặc mã vật tư'], 'inv.c.inv': ['Invoice', 'Hóa đơn'], 'inv.c.khno': ['Ký hiệu · số', 'Ký hiệu · số'], 'inv.c.sellerMst': ['Seller MST', 'MST người bán'],
    'inv.c.exVat': ['Excl. VAT', 'Chưa VAT'], 'inv.c.legal': ['Legal · match', 'Pháp lý · đối chiếu'], 'inv.legalOk': ['Legal OK', 'Pháp lý đạt'], 'inv.legalFail': ['Legal fail', 'Pháp lý không đạt'], 'inv.noMidN': ['{n} line: No Material ID', '{n} dòng: chưa có mã vật tư'], 'inv.empty': ['No invoices in this view', 'Không có hóa đơn trong mục này'],
    'inv.ck.cqt': ['Mã CQT present · GDT lookup', 'Có mã CQT · tra cứu Tổng cục Thuế'], 'inv.ck.cqtOk': ['Mã CQT issued', 'Đã được cấp mã'], 'inv.ck.cqtMissing': ['Mã CQT missing', 'Thiếu mã CQT'], 'inv.ck.seller': ['Seller MST = vendor master', 'MST người bán = hồ sơ NCC'], 'inv.ck.buyer': ['Buyer MST = company', 'MST người mua = công ty'],
    'inv.ck.buyerNa': ['Company details not configured', 'Chưa cấu hình thông tin công ty'], 'inv.ck.format': ['Ký hiệu / số format', 'Định dạng ký hiệu / số'], 'inv.ck.link': ['Adjustment / replacement link', 'Liên kết điều chỉnh / thay thế'], 'inv.ck.na': ['Not applicable (Original)', 'Không áp dụng (hóa đơn gốc)'],
    'inv.ck.of': ['{t} of {o}', '{t} của {o}'], 'inv.ck.mapped': ['Lines mapped to Material ID', 'Dòng đã gán mã vật tư'], 'inv.ck.mappedN': ['{a} of {b} lines', '{a}/{b} dòng'],
    'inv.r.noMid': ['No Material ID', 'Chưa có mã vật tư'], 'inv.r.notPo': ['Not on PO', 'Không có trên PO'], 'inv.r.matched': ['Matched', 'Khớp'], 'inv.r.price': ['Price mismatch', 'Lệch giá'], 'inv.r.qty': ['Qty mismatch', 'Lệch số lượng'],
    'inv.within': ['within tolerance', 'trong dung sai'], 'inv.outside': ['outside tolerance', 'ngoài dung sai'], 'inv.onHold': ['on hold', 'tạm giữ'],
    'inv.st.Submitted': ['Submitted', 'Đã nhận'], 'inv.st.Validated': ['Validated', 'Đã kiểm tra'], 'inv.st.Matched': ['Matched', 'Đã khớp'], 'inv.st.Ready': ['Ready for payment', 'Sẵn sàng thanh toán'], 'inv.st.Paid': ['Paid', 'Đã thanh toán'], 'inv.done': ['(done)', '(xong)'],
    'inv.f.title': ['E-invoice fields (parsed from XML)', 'Thông tin hóa đơn (đọc từ XML)'], 'inv.f.mau': ['Mẫu số', 'Mẫu số'], 'inv.f.kh': ['Ký hiệu', 'Ký hiệu'], 'inv.f.no': ['Invoice no.', 'Số hóa đơn'], 'inv.f.date': ['Issue date', 'Ngày lập'], 'inv.f.seller': ['Seller MST', 'MST người bán'], 'inv.f.buyer': ['Buyer MST', 'MST người mua'],
    'inv.f.cqt': ['Mã CQT', 'Mã CQT'], 'inv.f.missing': ['— missing —', '— thiếu —'], 'inv.f.type': ['Type', 'Loại'], 'inv.f.replaces': ['replaces {o}', 'thay thế {o}'], 'inv.f.src': ['Source', 'Nguồn'], 'inv.f.xml': ['{s} · XML + PDF', '{s} · XML + PDF'], 'inv.f.sub': ['Subtotal', 'Cộng tiền hàng'], 'inv.f.total': ['Total', 'Tổng cộng'],
    'inv.f.vatOn': ['{r}% on {v} = {x}', '{r}% trên {v} = {x}'], 'inv.legal': ['Legal checks ({a} / {b})', 'Kiểm tra pháp lý ({a} / {b})'], 'inv.pass': ['Pass', 'Đạt'], 'inv.failBlock': ['Fail · blocks matching', 'Không đạt · chặn đối chiếu'], 'inv.failMap': ['Fail · map before match', 'Không đạt · gán mã trước khi đối chiếu'],
    'inv.g.line': ['Material ID line', 'Dòng mã vật tư'], 'inv.g.po': ['PO qty · price', 'SL · giá PO'], 'inv.g.ses': ['SES accepted', 'Nghiệm thu chấp nhận'], 'inv.g.grn': ['GRN accepted', 'GRN chấp nhận'], 'inv.g.already': ['{n} already invoiced', '{n} đã xuất hóa đơn'], 'inv.g.blocked': ['{n} blocked · {id} open', '{n} bị chặn · {id} đang mở'],
    'inv.g.inv': ['Invoice qty · price', 'SL · giá hóa đơn'], 'inv.g.qv': ['Qty var.', 'Lệch SL'], 'inv.g.pv': ['Price var.', 'Lệch giá'], 'inv.g.tol': ['tol. {v}', 'dung sai {v}'], 'inv.g.exact': ['exact', 'chính xác'], 'inv.g.over': ['{v} over PO', 'cao hơn PO {v}'], 'inv.g.result': ['Result', 'Kết quả'], 'inv.g.label': ['Match by Material ID line', 'Đối chiếu theo dòng mã vật tư'],
    'inv.g.blockedMsg': ['Matching is blocked until the legal checks pass. Ask the supplier for a replacement invoice with a valid Mã CQT.', 'Chưa thể đối chiếu khi kiểm tra pháp lý chưa đạt. Hãy yêu cầu NCC xuất hóa đơn thay thế có mã CQT hợp lệ.'],
    'inv.x.assigned': ['Assigned to buyer {b}', 'Giao cho người mua {b}'], 'inv.x.resolve': [' · resolve by {d} (escalates after 3 working days)', ' · xử lý trước {d} (chuyển cấp sau 3 ngày làm việc)'], 'inv.x.price': ['Invoice price {a} vs PO {b} ({d}) — written to Price history as source Invoice.', 'Giá hóa đơn {a} so với PO {b} ({d}) — đã ghi vào Lịch sử giá với nguồn Hóa đơn.'],
    'inv.x.release': ['Release needs the Procurement Lead (not the raiser).', 'Giải phóng cần Trưởng phòng Mua sắm (không phải người tạo).'], 'inv.a.replace': ['Request replacement invoice', 'Yêu cầu hóa đơn thay thế'], 'inv.a.replaceMsg': ['Replacement invoice requested from {v} (Gmail + portal)', 'Đã yêu cầu {v} xuất hóa đơn thay thế (Gmail + cổng NCC)'],
    'inv.a.credit': ['Request credit note', 'Yêu cầu giảm trừ'], 'inv.a.openAp': ['Open in My approvals', 'Mở trong Chờ tôi duyệt'], 'inv.a.toAp': ['Accept variance → My approvals', 'Chấp nhận chênh lệch → Chờ tôi duyệt'], 'inv.a.hold': ['Hold', 'Tạm giữ'], 'inv.a.ready': ['Mark ready for payment', 'Đánh dấu sẵn sàng thanh toán'],
    'inv.a.exported': ['Exported {d}', 'Đã xuất {d}'], 'inv.a.export': ['Export to accounting', 'Xuất sang kế toán'], 'inv.pay': ['Payment', 'Thanh toán'], 'inv.pay.terms': ['Terms', 'Điều khoản'], 'inv.pay.termsV': ['{t} (vendor master)', '{t} (hồ sơ NCC)'], 'inv.pay.due': ['Due date', 'Hạn thanh toán'], 'inv.pay.dueV': ['= {d} + {n} days', '= {d} + {n} ngày'],
    'inv.pay.acc': ['Accounting', 'Kế toán'], 'inv.pay.accV': ['Exported {d} · Paid status comes from the accounting system', 'Đã xuất {d} · trạng thái Đã thanh toán lấy từ hệ thống kế toán'], 'inv.pay.map': ['Accounting mapping', 'Ánh xạ kế toán'], 'inv.pay.item': ['item code', 'mã hàng'], 'inv.pay.vendor': ['vendor code', 'mã NCC'],
    'inv.viewPdf': ['View PDF', 'Xem PDF'], 'inv.pdfMsg': ['{f}.pdf opened', 'Đã mở {f}.pdf'], 'inv.m2': ['2-way match · PO → service entry sheet', 'Đối chiếu 2 bên · PO → biên bản nghiệm thu'], 'inv.m3': ['3-way match · PO → GRN → e-invoice', 'Đối chiếu 3 bên · PO → GRN → hóa đơn điện tử'],
    'inv.ses': ['Service entry sheet', 'Biên bản nghiệm thu'], 'inv.einv': ['E-invoice', 'Hóa đơn điện tử'], 'inv.map': ['Map to Material ID', 'Gán mã vật tư'], 'inv.mapOpt': ['Map to Material ID…', 'Gán mã vật tư…'], 'inv.mapNew': ['Request a new Material ID', 'Đề nghị mã vật tư mới'],
    'inv.mapNewMsg': ['Material ID request opened · the line stays on hold', 'Đã mở đề nghị mã vật tư · dòng vẫn tạm giữ'], 'inv.mapped': ['Line mapped to {m} · re-matched', 'Đã gán dòng vào {m} · đối chiếu lại'], 'inv.creditMsg': ['Credit note requested from {v}', 'Đã yêu cầu {v} lập chứng từ giảm trừ'],
    'inv.toApMsg': ['{id} sent to My approvals ({a}, not the raiser)', 'Đã gửi {id} vào Chờ tôi duyệt ({a}, không phải người tạo)'], 'inv.readyMsg': ['{id} ready for payment · due {d}', '{id} sẵn sàng thanh toán · hạn {d}'], 'inv.exportMsg': ['{id} exported to accounting · Material ID → item code, V-code → vendor code', 'Đã xuất {id} sang kế toán · mã vật tư → mã hàng, mã NCC → mã nhà cung cấp kế toán'],
    'inv.notFound': ['Invoice {id} was not found.', 'Không tìm thấy hóa đơn {id}.'], 'inv.back': ['Back to invoices', 'Về danh sách hóa đơn'],
    'inv.h.title': ['Invoice history', 'Lịch sử hóa đơn'], 'inv.h.at': ['When', 'Thời điểm'], 'inv.h.event': ['Event', 'Sự kiện'], 'inv.h.by': ['By', 'Người thực hiện'], 'inv.h.recv': ['Received from {s} ({t})', 'Nhận từ {s} ({t})'], 'inv.h.legalOk': ['Legal checks passed ({a}/{b})', 'Kiểm tra pháp lý đạt ({a}/{b})'],
    'inv.h.legalFail': ['Legal checks failed — matching blocked', 'Kiểm tra pháp lý không đạt — chặn đối chiếu'], 'inv.h.status': ['Current status: {s}', 'Trạng thái hiện tại: {s}'], 'inv.h.decision': ['Approval: {d}', 'Phê duyệt: {d}'], 'inv.h.exported': ['Exported to accounting', 'Đã xuất sang kế toán'], 'inv.h.system': ['System', 'Hệ thống'],
    'inv.h.accepted': ['Variance accepted', 'Đã chấp nhận chênh lệch'],
    'inv.rules.tol': ['Match tolerances', 'Dung sai đối chiếu'], 'inv.rules.price': ['Price vs PO', 'Giá so với PO'], 'inv.rules.qty': ['Quantity vs GRN accepted (tấn, m³, kg)', 'Số lượng so với GRN chấp nhận (tấn, m³, kg)'], 'inv.rules.count': ['Count units', 'Đơn vị đếm'], 'inv.rules.exact': ['Exact', 'Chính xác'],
    'inv.rules.srv': ['Services (SRV-)', 'Dịch vụ (SRV-)'], 'inv.rules.srvV': ['2-way match with the service entry sheet', 'Đối chiếu 2 bên với biên bản nghiệm thu'], 'inv.rules.legal': ['Legal checks (NĐ 123/2020)', 'Kiểm tra pháp lý (NĐ 123/2020)'],
    'inv.rules.note': ['The first five checks block matching; an unmapped line must be mapped to a Material ID before matching.', 'Năm kiểm tra đầu chặn đối chiếu; dòng chưa gán mã vật tư phải được gán trước khi đối chiếu.'], 'inv.rules.flow': ['Exception flow', 'Luồng xử lý ngoại lệ'],
    'inv.rules.flowV': ['A mismatch puts the invoice on hold, assigned to the PO buyer for 3 working days. The buyer requests a credit note or sends the variance to My approvals; the Procurement Lead (not the raiser) releases it.', 'Khi lệch, hóa đơn bị tạm giữ và giao cho người mua của PO trong 3 ngày làm việc. Người mua yêu cầu giảm trừ hoặc gửi chênh lệch vào Chờ tôi duyệt; Trưởng phòng Mua sắm (không phải người tạo) giải phóng.']
  });
  I18N.values({
    'Inbox hoadon@': 'Hộp thư hoadon@', Portal: 'Cổng NCC', Original: 'Gốc', Replacement: 'Thay thế', '1C26TMP · 00001229 (wrong delivery address)': '1C26TMP · 00001229 (sai địa chỉ giao hàng)',
    'On hold · price exception': 'Tạm giữ · ngoại lệ giá', 'On hold · map line 2 to a Material ID': 'Tạm giữ · gán dòng 2 vào mã vật tư', 'On hold': 'Tạm giữ', 'On hold · credit note requested': 'Tạm giữ · đã yêu cầu giảm trừ',
    'Exception · mapped, re-match': 'Ngoại lệ · đã gán mã, đối chiếu lại', 'Exception · qty': 'Ngoại lệ · số lượng', '1 line: No Material ID': '1 dòng: chưa có mã vật tư', Paid: 'Đã thanh toán'
  });
  I18N.patterns([[/^Exception · price (.+)$/, 'Ngoại lệ · giá $1'], [/^On hold · (\w+)$/, 'Tạm giữ · $1'], [/^Variance accepted by (.+)$/, 'Chênh lệch được chấp nhận bởi $1']]);
  const NOW = '02/11/2026 10:30'; const now = () => (App.now ? App.now() : NOW);
  const STAGES = ['inv.st.Submitted', 'inv.st.Validated', 'inv.st.Matched', 'inv.st.Ready', 'inv.st.Paid'];
  const TABS = ['all', 'match', 'exc', 'ready', 'blocked'];
  const st = { tab: 'all', q: '', cur: null };
  const mat = (id) => App.material(id) || { id, name: id, uom: '', vat: 8 };
  const list = () => D().docs.filter((d) => d.type === 'INV' && D().invoices[d.id]);
  const tabOf = (d) => (/Blocked/.test(d.status) ? 'blocked' : /Exception|No Material ID|credit|hold/i.test(d.status) ? 'exc' : /Ready|Paid/.test(d.status) ? 'ready' : 'match');
  const sTone = (s) => (/Ready|Paid|Matched/.test(s) ? 'success' : /Blocked/.test(s) ? 'danger' : 'warning');
  const termDays = (v) => +(/(\d+) days/.exec((App.vendor(v) || {}).terms || '') || [0, 30])[1];
  const due = (d) => App.addDays(d.date, termDays(d.vendor));
  const weight = (u) => ['tấn', 'm³', 'kg'].includes(u);
  const isExc = (d) => /Exception|No Material ID|hold|credit/i.test(d.status);

  /* F-71 legal checks; the first five block matching. [label, ok, note, hard] */
  function checks(d, v) {
    const ven = App.vendor(d.vendor); const C = D().company || {};
    return [
      [t('inv.ck.cqt'), !!v.cqt, v.cqt ? t('inv.ck.cqtOk') : (v.gdt ? App.tv(v.gdt) : t('inv.ck.cqtMissing')), true],
      [t('inv.ck.seller'), true, `${ven.mst} = ${ven.id}`, true],
      [t('inv.ck.buyer'), true, C.mst ? `${C.mst}${C.name ? ` (${C.name})` : ''}` : t('inv.ck.buyerNa'), true],
      [t('inv.ck.format'), /^[12][CK]\d{2}[TDLMNBGH][A-Z]{2}$/.test(v.kh) && /^\d{8}$/.test(v.no), `${v.kh} · ${v.no}`, true],
      [t('inv.ck.link'), v.type === 'Original' || !!v.orig, v.type === 'Original' ? t('inv.ck.na') : t('inv.ck.of', { t: tv(v.type), o: tv(v.orig) }), true],
      [t('inv.ck.mapped'), v.lines.every((l) => l[0]), t('inv.ck.mappedN', { a: v.lines.filter((l) => l[0]).length, b: v.lines.length }), false]
    ];
  }
  const legalOk = (d, v) => checks(d, v).every((c) => c[1] || !c[3]);

  /* F-72 / F-74 match per line */
  function match(d, v) {
    const p = D().pos[v.po]; const g = D().grns[v.grn]; const T = D().tolerance;
    return v.lines.map((x) => {
      const [m, desc, qty, price, prev] = x; const r = { m, desc, qty, price };
      if (!m) return Object.assign(r, { res: 'noMid', tone: 'danger' });
      const li = p ? p.lines.findIndex((l) => l.mat === m) : -1; const pl = li >= 0 ? p.lines[li] : null;
      if (!pl) return Object.assign(r, { res: 'notPo', tone: 'danger' });
      const acc = g ? g.lines.filter((y) => y[0] === li).reduce((a, y) => a + y[3], 0) : 0;
      const ncr = Object.entries(D().ncrs).find(([, n]) => n.grn === v.grn && n.mat === m && n.status !== 'Closed');
      const avail = acc - (prev || 0); const qd = avail ? (qty - avail) / avail * 100 : 100; const pd = (price - pl.price) / pl.price * 100;
      const qTol = weight(mat(m).uom) ? T.qty : 0;
      const qOk = Math.abs(qd) <= qTol + 1e-9; const pOk = Math.abs(pd) <= T.price + 1e-9;
      Object.assign(r, { poQty: pl.qty, poPrice: pl.price, acc, avail, qd, pd, qTol, ncr: ncr ? [ncr[0], ncr[1].qty] : null, ses: g && g.ses ? g.sla : null, over: (price - pl.price) * qty });
      r.res = qOk && pOk ? 'matched' : !pOk ? 'price' : 'qty'; r.tone = r.res === 'matched' ? 'success' : 'danger';
      return r;
    });
  }
  const totals = (v) => { const by = {}; v.lines.forEach((l) => { const r = l[0] ? mat(l[0]).vat : 8; by[r] = (by[r] || 0) + l[2] * l[3]; }); const net = Object.values(by).reduce((a, x) => a + x, 0); const vat = Object.entries(by).reduce((a, [r, x]) => a + x * r / 100, 0); return { by, net, vat, gross: net + vat }; };
  const vb = (x, ok) => `<span class="var ${ok ? 'var-ok' : 'var-bad'}">${x}<span class="sr"> ${esc(t(ok ? 'inv.within' : 'inv.outside'))}</span></span>`;
  const sg = (x) => `${x > 0 ? '+' : x < 0 ? '−' : '±'}${pct(Math.abs(x))}`;
  /* P5-01 / P5-05 · (re)derive status from the current checks and tolerances */
  function rematch(d) {
    const v = D().invoices[d.id]; if (!v || !legalOk(d, v)) return; const M = match(d, v); const ok = M.length && M.every((r) => r.res === 'matched');
    const inAp = D().approvals.some((a) => a.id === d.id);
    if (v.stage < 2 && /^Submitted/.test(d.status)) {
      if (ok) { v.stage = 2; d.status = 'Matched'; }
      else { const pe = M.find((r) => r.res === 'price'); d.status = 'Exception · ' + (pe ? 'price ' + sg(pe.pd) : 'qty'); v.stage = 1; v.hold = 'On hold'; v.assigned = (D().pos[v.po] || {}).buyer || 'Nguyễn Minh Anh'; v.resolveBy = App.addDays(D().today, 3); }
    } else if (/^Exception · price/.test(d.status) && !inAp && ok) { d.status = 'Matched'; v.stage = 2; v.hold = null; v.resolveBy = null; }
  }
  const banner = () => `<div class="alert alert-info" role="status">${esc(t('inv.banner', { p: num(D().tolerance.price, 1), q: D().tolerance.qty }))} ${App.state.role === 'admin' ? `<a href="#/admin/tolerances">${esc(t('inv.editAdmin'))}</a>` : esc(t('inv.editedAdmin'))}</div>`;
  const notFound = (id) => layout({ title: t('nav.invoices'), blocks: [block(null, App.errorState(t('inv.notFound', { id })) + `<p class="m-0"><a class="btn" href="#/invoices">${esc(t('inv.back'))}</a></p>`)] });

  function listBlock(all) {
    const cnt = (k) => (k === 'all' ? all.length : all.filter((d) => tabOf(d) === k).length); const q = st.q.trim();
    const rows = all.filter((d) => { const v = D().invoices[d.id]; return (st.tab === 'all' || tabOf(d) === st.tab) && (!q || App.matches(`${d.id} ${d.title} ${v.kh} ${v.no} ${v.po} ${v.grn} ${d.mats.join(' ')} ${(App.vendor(d.vendor) || {}).name} ${(App.vendor(d.vendor) || {}).mst}`, q)); }).sort((a, b) => App.dt(b.date) - App.dt(a.date));
    return block(t('inv.sub.list'), `<div class="seg seg-wrap" role="group" aria-label="${esc(t('inv.statusLbl'))}">${TABS.map((k) => `<button data-inv="tab" data-k="${k}" aria-pressed="${st.tab === k}">${esc(t('inv.tab.' + k))} (${cnt(k)})</button>`).join('')}</div>
      <div class="filters"><label class="sr" for="inv-q">${esc(t('inv.searchLbl'))}</label><input class="inp grow" id="inv-q" type="search" data-invf="q" value="${esc(st.q)}" placeholder="${esc(t('inv.searchPh'))}"></div>
        ${table([
          { h: t('inv.c.inv'), r: (d) => `<a class="mono" href="#/invoices/${esc(d.id)}">${esc(d.id)}</a><div class="small">${esc(d.title)}</div>`, w: 'minmax(190px,2fr)' },
          { h: t('inv.c.khno'), r: (d) => { const v = D().invoices[d.id]; return `<span class="mono small nowrap">${esc(v.kh)} · ${esc(v.no)}</span><div class="small muted">${esc(tv(v.src))} · ${esc(tv(v.type))}</div>`; }, w: '170px' },
          { h: t('inv.c.sellerMst'), r: (d) => `<span class="mono small">${esc(App.vendor(d.vendor).mst)}</span><div class="small">${esc(App.vshort(App.vendor(d.vendor)))}</div>`, w: '130px' },
          { h: 'PO · GRN', r: (d) => { const v = D().invoices[d.id]; return `<a class="mono small" href="#/po/${esc(v.po)}">${esc(v.po)}</a><div class="mono small muted">${esc(v.grn)}</div>`; }, w: '130px' },
          { h: t('inv.c.exVat'), r: (d) => vnd(totals(D().invoices[d.id]).net), cls: 'num', w: '130px' },
          { h: 'VAT', r: (d) => vnd(totals(D().invoices[d.id]).vat), cls: 'num', w: '110px' },
          { h: t('inv.c.legal'), r: (d) => { const v = D().invoices[d.id]; const ok = legalOk(d, v); const nm = v.lines.filter((l) => !l[0]).length; return `${pill(t(ok ? 'inv.legalOk' : 'inv.legalFail'), ok ? 'success' : 'danger')}<div class="mt-s">${pill(d.status, sTone(d.status))}</div>${nm && tv(d.status) !== t('inv.noMidN', { n: nm }) ? `<div class="small tone-warning">${esc(t('inv.noMidN', { n: nm }))}</div>` : ''}`; }, w: 'minmax(170px,1.4fr)' }
        ], rows, { empty: t('inv.empty'), label: t('inv.sub.list') })}`);
  }
  function rulesBlocks() {
    const T = D().tolerance;
    return [block(t('inv.rules.tol'), `<dl class="dl"><dt>${esc(t('inv.rules.price'))}</dt><dd>±${num(T.price, 1)}%</dd><dt>${esc(t('inv.rules.qty'))}</dt><dd>±${T.qty}%</dd><dt>${esc(t('inv.rules.count'))}</dt><dd>${esc(t('inv.rules.exact'))}</dd><dt>${esc(t('inv.rules.srv'))}</dt><dd>${esc(t('inv.rules.srvV'))}</dd></dl>
      <p class="small muted">${App.state.role === 'admin' ? `<a href="#/admin/tolerances">${esc(t('inv.editAdmin'))}</a>` : esc(t('inv.editedAdmin'))}</p>`, { span: 6 }),
    block(t('inv.rules.legal'), `<ol class="small">${['inv.ck.cqt', 'inv.ck.seller', 'inv.ck.buyer', 'inv.ck.format', 'inv.ck.link', 'inv.ck.mapped'].map((k) => `<li>${esc(t(k))}</li>`).join('')}</ol><p class="small muted">${esc(t('inv.rules.note'))}</p>
      <h3 class="h-sub">${esc(t('inv.rules.flow'))}</h3><p class="small mt-0">${esc(t('inv.rules.flowV'))}</p>`, { span: 6 })];
  }

  const DSUBS = [['', 'inv.d.overview'], ['match', 'inv.d.match'], ['history', 'inv.d.history']];
  function detail(d, subArg) {
    rematch(d);
    const cur = App.sub(DSUBS, subArg || '');
    const v = D().invoices[d.id]; const ven = App.vendor(d.vendor); const C = checks(d, v); const lok = legalOk(d, v); const M = lok ? match(d, v) : []; const tt = totals(v);
    const stage = Math.min(v.stage, 4); const comp = D().company || {};
    const steps = `<ol class="steps" aria-label="${esc(t('inv.statusLbl'))}">${STAGES.map((k, n) => { const dn = n < stage || (n === stage && n === 4); const cu = n === stage && !dn; return `<li class="${dn ? 'done' : cu ? 'cur' : ''}"${cu ? ' aria-current="step"' : ''}><span class="st-n" aria-hidden="true">${dn ? '✓' : n + 1}</span><span class="st-l">${esc(t(k))}${cu && v.hold ? ' · ' + esc(t('inv.onHold')) : ''}</span>${dn ? `<span class="sr"> ${esc(t('inv.done'))}</span>` : ''}</li>`; }).join('')}</ol>`;
    const isSrv = M.some((r) => r.ses);
    const priceExc = M.find((r) => r.res === 'price');
    const inAp = D().approvals.some((a) => a.id === d.id);
    let acts = '';
    if (!lok) acts = `<button class="btn" data-act="toast" data-msg="${esc(t('inv.a.replaceMsg', { v: App.vshort(ven) }))}">${esc(t('inv.a.replace'))}</button>`;
    else if (isExc(d)) acts = `<button class="btn" data-inv="credit">${esc(t('inv.a.credit'))}</button>${priceExc ? (inAp ? `<a class="btn btn-p" href="#/approvals?id=${esc(d.id)}">${esc(t('inv.a.openAp'))}</a>` : `<button class="btn btn-p" data-inv="to-ap">${esc(t('inv.a.toAp'))}</button>`) : ''}`;
    else if (((M.length && M.every((r) => r.res === 'matched')) || v.accepted) && v.stage === 2) acts = `<button class="btn" data-inv="hold">${esc(t('inv.a.hold'))}</button><button class="btn btn-p" data-inv="ready">${esc(t('inv.a.ready'))}</button>`;
    else if (v.stage >= 3) acts = v.exported ? `<span class="small muted">${esc(t('inv.a.exported', { d: v.exported }))}</span>` : `<button class="btn btn-p" data-inv="export">${esc(t('inv.a.export'))}</button>`;
    const exc = isExc(d) ? `<div class="alert alert-warning" role="status"><b>${esc(tv(v.hold || 'On hold'))}.</b> ${esc(t('inv.x.assigned', { b: v.assigned || '—' }))}${v.resolveBy ? esc(t('inv.x.resolve', { d: v.resolveBy })) : ''}.${priceExc ? ' ' + esc(t('inv.x.price', { a: vnd(priceExc.price), b: vnd(priceExc.poPrice), d: sg(priceExc.pd) })) : ''} ${esc(t('inv.x.release'))}</div>` : '';
    let blocks;
    if (cur === 'match') {
      const grid = lok ? table([
        { h: t('inv.g.line'), r: (r) => (r.m ? `${mid(r.m)}<div class="small">${esc(r.desc)}</div>` : `<span class="small">${esc(r.desc)}</span><div>${pill(t('inv.r.noMid'), 'danger')}</div>${mapper(d)}`), w: 'minmax(200px,2fr)' },
        { h: t('inv.g.po'), r: (r) => (r.poQty != null ? `${num(r.poQty)} · ${vnd(r.poPrice)}` : '—'), cls: 'num', w: '170px' },
        { h: t(isSrv ? 'inv.g.ses' : 'inv.g.grn'), r: (r) => (r.acc != null ? `${num(r.acc)}${r.avail !== r.acc ? `<div class="small muted">${esc(t('inv.g.already', { n: num(r.acc - r.avail) }))}</div>` : ''}${r.ncr ? `<div class="small tone-danger">${esc(t('inv.g.blocked', { n: num(r.ncr[1]), id: r.ncr[0] }))}</div>` : ''}${r.ses ? `<div class="small muted">SLA ${pct(r.ses[0])} ≥ ${pct(r.ses[1])}</div>` : ''}` : '—'), cls: 'num', w: '150px' },
        { h: t('inv.g.inv'), r: (r) => `${r.qd != null && Math.abs(r.qd) > r.qTol + 1e-9 ? `<span class="var-cell">${num(r.qty)}</span>` : num(r.qty)} · ${r.pd != null && Math.abs(r.pd) > D().tolerance.price + 1e-9 ? `<span class="var-cell">${vnd(r.price)}</span>` : vnd(r.price)}`, cls: 'num', w: '170px' },
        { h: t('inv.g.qv'), r: (r) => (r.qd != null ? `${vb(sg(r.qd), Math.abs(r.qd) <= r.qTol + 1e-9)}<div class="small muted">${esc(t('inv.g.tol', { v: r.qTol ? '±' + r.qTol + '%' : t('inv.g.exact') }))}</div>` : '—'), cls: 'num', w: '110px' },
        { h: t('inv.g.pv'), r: (r) => (r.pd != null ? `${vb(sg(r.pd), Math.abs(r.pd) <= D().tolerance.price + 1e-9)}<div class="small muted">${esc(t('inv.g.tol', { v: '±' + num(D().tolerance.price, 1) + '%' }))}</div>${Math.abs(r.pd) > D().tolerance.price ? `<div class="small tone-danger">${esc(t('inv.g.over', { v: vnd(r.over) }))}</div>` : ''}` : '—'), cls: 'num', w: '130px' },
        { h: t('inv.g.result'), r: (r) => pill((r.tone === 'danger' ? '! ' : '✓ ') + t('inv.r.' + r.res), r.tone), w: '150px' }
      ], M, { label: t('inv.g.label'), cls: 'match-grid' }) : App.errorState(t('inv.g.blockedMsg'));
      blocks = [block(t(isSrv ? 'inv.m2' : 'inv.m3'), `${exc}<ol class="chain"><li><span class="small muted">PO</span><a class="mono" href="#/po/${esc(v.po)}">${esc(v.po)}</a></li><li><span class="small muted">${esc(isSrv ? t('inv.ses') : 'GRN')}</span><span class="mono">${esc(v.grn)}</span></li><li><span class="small muted">${esc(t('inv.einv'))}</span><span class="mono">${esc(v.kh)} · ${esc(v.no)}</span></li></ol>${grid}`)];
    } else if (cur === 'history') {
      const ev = [[d.date, t('inv.h.recv', { s: tv(v.src), t: tv(v.type) }), App.vshort(ven)], [d.date, lok ? t('inv.h.legalOk', { a: C.filter((c) => c[1]).length, b: C.length }) : t('inv.h.legalFail'), t('inv.h.system')]];
      D().approvalHistory.filter((h) => h.id === d.id).forEach((h) => ev.push([h.at, t('inv.h.decision', { d: tv(h.decision) }) + (h.comment ? ` · “${tv(h.comment)}”` : ''), h.by]));
      if (v.accepted) ev.push(['', t('inv.h.accepted'), tv(v.accepted)]);
      (D().audit || []).filter((a) => a.ref === d.id).slice().reverse().forEach((a) => ev.push([a.at, tv(a.action), a.user]));
      if (v.exported && !(D().audit || []).some((a) => a.ref === d.id && /Exported/.test(a.action))) ev.push([v.exported, t('inv.h.exported'), t('inv.h.system')]);
      ev.push([D().today, t('inv.h.status', { s: tv(d.status) }), '']);
      blocks = [block(t('inv.h.title'), table([{ h: t('inv.h.at'), r: (x) => esc(x[0] || '—'), w: '150px' }, { h: t('inv.h.event'), r: (x) => esc(x[1]), w: 'minmax(260px,3fr)' }, { h: t('inv.h.by'), r: (x) => esc(x[2] || '—'), w: 'minmax(150px,1.2fr)' }], ev, { label: t('inv.h.title') }))];
    } else {
      const fields = block(t('inv.f.title'), `<dl class="dl dl-inv"><dt>${esc(t('inv.f.mau'))}</dt><dd>${esc(v.mau)}</dd><dt>${esc(t('inv.f.kh'))}</dt><dd class="mono">${esc(v.kh)}</dd><dt>${esc(t('inv.f.no'))}</dt><dd class="mono">${esc(v.no)}</dd><dt>${esc(t('inv.f.date'))}</dt><dd>${esc(d.date)}</dd>
        <dt>${esc(t('inv.f.seller'))}</dt><dd><span class="mono">${esc(ven.mst)}</span> · ${esc(ven.name)}</dd>${comp.mst ? `<dt>${esc(t('inv.f.buyer'))}</dt><dd><span class="mono">${esc(comp.mst)}</span>${comp.name ? ' · ' + esc(comp.name) : ''}</dd>` : ''}<dt>${esc(t('inv.f.cqt'))}</dt><dd class="mono">${v.cqt ? esc(v.cqt) : `<span class="tone-danger">${esc(t('inv.f.missing'))}</span>`}</dd>
        <dt>${esc(t('inv.f.type'))}</dt><dd>${esc(tv(v.type))}${v.orig ? ` · ${esc(t('inv.f.replaces', { o: tv(v.orig) }))}` : ''}</dd><dt>${esc(t('inv.f.src'))}</dt><dd>${esc(t('inv.f.xml', { s: tv(v.src) }))}</dd><dt>${esc(t('inv.f.sub'))}</dt><dd>${vnd(tt.net)}</dd><dt>VAT</dt><dd>${Object.entries(tt.by).map(([r, x]) => esc(t('inv.f.vatOn', { r, v: vnd(x), x: vnd(x * r / 100) }))).join(' · ')}</dd><dt>${esc(t('inv.f.total'))}</dt><dd><b>${vnd(tt.gross)}</b></dd></dl>`, { span: 6 });
      const legal = block(t('inv.legal', { a: C.filter((c) => c[1]).length, b: C.length }), `<ul class="plain legal-list">${C.map(([n, ok, note, hard]) => `<li class="row-acts between"><span>${esc(n)}<div class="small muted">${esc(note)}</div></span>${pill(t(ok ? 'inv.pass' : hard ? 'inv.failBlock' : 'inv.failMap'), ok ? 'success' : hard ? 'danger' : 'warning')}</li>`).join('')}</ul>`, { span: 6 });
      const pay = block(t('inv.pay'), `${steps}<dl class="dl mt"><dt>${esc(t('inv.pay.terms'))}</dt><dd>${esc(t('inv.pay.termsV', { t: tv((ven.terms || '').split(' ·')[0]) }))}</dd><dt>${esc(t('inv.pay.due'))}</dt><dd><b>${esc(due(d))}</b> ${esc(t('inv.pay.dueV', { d: d.date, n: termDays(d.vendor) }))}</dd><dt>${esc(t('c.status'))}</dt><dd>${pill(d.status, sTone(d.status))}</dd>${v.exported ? `<dt>${esc(t('inv.pay.acc'))}</dt><dd>${esc(t('inv.pay.accV', { d: v.exported }))}</dd>` : ''}</dl>
        ${v.stage >= 3 ? `<h3 class="h-sub">${esc(t('inv.pay.map'))}</h3><ul class="plain small">${v.lines.filter((l) => l[0]).map((l) => `<li>${mid(l[0])} → ${esc(t('inv.pay.item'))} <span class="mono">VT-${esc(l[0].replace('-', ''))}</span></li>`).join('')}<li><span class="mono">${esc(d.vendor)}</span> → ${esc(t('inv.pay.vendor'))} <span class="mono">NCC-${esc(d.vendor.slice(2))}</span></li></ul>` : ''}`);
      blocks = [pay, fields, legal];
    }
    return layout({
      crumbs: `<a href="#/invoices">${esc(t('nav.invoices'))}</a> / ${esc(d.id)}`, titleHtml: `<span class="mono">${esc(d.id)}</span> ${esc(d.title)}`,
      subtitle: `${esc(ven.name)} · ${pill(d.status, sTone(d.status))} · PO <a class="mono" href="#/po/${esc(v.po)}">${esc(v.po)}</a> · ${esc(v.grn)}`,
      actions: `<button class="btn" data-act="toast" data-msg="${esc(t('inv.pdfMsg', { f: v.kh + '-' + v.no }))}">${esc(t('inv.viewPdf'))}</button>${acts}`,
      alerts: App.unknownSub(DSUBS, subArg) + (cur === 'match' ? '' : exc),
      kpis: [kpi(t('inv.f.sub'), vnd(tt.net), esc(t('c.exclVat'))), kpi('VAT', vnd(tt.vat), esc(Object.keys(tt.by).map((r) => r + '%').join(' + '))), kpi(t('inv.f.total'), vnd(tt.gross), ''), kpi(t('inv.pay.due'), esc(due(d)), esc(t('inv.pay.dueV', { d: d.date, n: termDays(d.vendor) })))],
      subnav: App.subnav('invoices/' + d.id, DSUBS, cur), blocks
    });
  }
  function mapper(d) {
    const p = D().pos[D().invoices[d.id].po]; const opts = p ? p.lines.map((l) => l.mat) : [];
    return `<div class="mt-s"><label class="sr" for="inv-map">${esc(t('inv.map'))}</label><select class="inp" id="inv-map" data-inv-map="1"><option value="">${esc(t('inv.mapOpt'))}</option>${opts.map((m) => `<option value="${esc(m)}">${esc(m)}</option>`).join('')}<option value="new">${esc(t('inv.mapNew'))}</option></select></div>`;
  }

  App.inv = {
    onDecide(a, dcs) {
      if (a.type !== 'Invoice exception') return; const d = S.docOf(a.id); const v = D().invoices[a.id]; if (!d || !v) return;
      if (dcs === 'Approved') { d.status = 'Matched'; v.stage = 2; v.hold = null; v.accepted = 'Variance accepted by ' + S.me(); } else d.status = 'On hold · ' + dcs.toLowerCase();
    }
  };
  I18N.values({ 'On hold · rejected': 'Tạm giữ · bị từ chối', 'On hold · returned': 'Tạm giữ · bị trả lại', 'Marked ready for payment': 'Đánh dấu sẵn sàng thanh toán', 'Exported to accounting': 'Đã xuất sang kế toán' });

  const LSUBS = [['', 'inv.sub.list'], ['rules', 'inv.sub.rules']];
  App.page('invoices', {
    titleKey: 'nav.invoices', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, subArg) {
      const parts = (subArg || '').split('/'); const head = parts[0] || '';
      st.cur = head && head !== 'rules' ? head : null;
      if (st.cur) { const d = list().find((x) => x.id === head); return d ? detail(d, parts.slice(1).join('/')) : notFound(head); }
      if (p.q != null && p.q !== st.lastQ) { st.q = p.q; st.lastQ = p.q; st.tab = 'all'; }
      if (p.tab && p.tab !== st.lastTab) { st.tab = p.tab; st.lastTab = p.tab; }
      const all = list(); all.forEach(rematch); const X = D().invoiceStats; const ids = (k) => all.filter((d) => tabOf(d) === k).map((d) => d.id.slice(4)).join(', ');
      return layout({
        title: t('nav.invoices'), subtitle: esc(t('inv.subtitle')),
        actions: `<button class="btn" data-act="toast" data-msg="${esc(t('inv.fetchMsg'))}">${esc(t('inv.fetch'))}</button><button class="btn btn-p" data-act="toast" data-msg="${esc(t('inv.uploadMsg'))}">${esc(t('inv.upload'))}</button>`,
        kpis: [kpi(t('inv.k.all'), num(X.total), esc(t('c.inSample', { n: all.length }))), kpi(t('inv.k.match'), num(X.toMatch), esc(t('c.inSample', { n: all.filter((d) => tabOf(d) === 'match').length }))),
          kpi(t('inv.k.exc'), num(X.exceptions), esc(ids('exc') || t('c.none')), ids('exc') ? 'warning' : ''), kpi(t('inv.k.blocked'), num(X.blocked), esc(ids('blocked') || t('c.none')), ids('blocked') ? 'danger' : '')],
        alerts: head === 'rules' ? '' : banner(), subnav: App.subnav('invoices', LSUBS, head),
        blocks: head === 'rules' ? rulesBlocks() : [listBlock(all)]
      });
    },
    mount(root) {
      root.addEventListener('input', (e) => { if (e.target.dataset.invf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('inv-q'); i.focus(); i.setSelectionRange(pos, pos); } });
      root.addEventListener('change', (e) => {
        if (!e.target.dataset.invMap) return; const d = S.docOf(st.cur); const v = D().invoices[st.cur]; const val = e.target.value; if (!val) return;
        if (val === 'new') { App.toast(t('inv.mapNewMsg')); return; }
        const l = v.lines.find((x) => !x[0]); l[0] = val; if (v.lines.every((x) => x[0])) d.status = 'Exception · mapped, re-match'; App.render(); App.toast(t('inv.mapped', { m: val }));
      });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-inv]'); if (!b) return; const k = b.dataset.inv;
        if (k === 'tab') { st.tab = b.dataset.k; App.render(); return; }
        const d = S.docOf(st.cur); const v = D().invoices[st.cur]; if (!d) return;
        if (k === 'credit') { d.status = 'On hold · credit note requested'; App.render(); App.toast(t('inv.creditMsg', { v: App.vshort(App.vendor(d.vendor)) })); }
        else if (k === 'to-ap') {
          const by = S.me(); const ap = by === 'Nguyễn Minh Anh' ? 'Đỗ Hoàng Nam' : 'Nguyễn Minh Anh'; const role = ap === 'Đỗ Hoàng Nam' ? 'Finance Director' : 'Procurement Lead';
          const tt = totals(v); D().approvals.push({ id: d.id, type: 'Invoice exception', title: d.title, mats: d.mats, value: tt.net, by, step: 'Step 1 of 1', sla: App.addDays(D().today, 2) + ' 17:00', assignee: ap });
          D().approvalChains[d.id] = [[`${by} · Buyer`, 'Raised', NOW, 'Accept price variance'], [`${ap} · ${role}`, 'Waiting', 'SLA 2 working days · SoD: raiser cannot approve', '']]; App.render(); App.toast(t('inv.toApMsg', { id: d.id, a: ap }));
        }
        else if (k === 'hold') { d.status = 'On hold'; v.hold = 'On hold'; v.assigned = v.assigned || S.me(); App.render(); }
        else if (k === 'ready') { d.status = 'Ready for payment'; v.stage = 3; S.audit('Invoices', 'Marked ready for payment', d.id); App.render(); App.toast(t('inv.readyMsg', { id: d.id, d: due(d) })); }
        else if (k === 'export') { v.exported = now(); S.audit('Invoices', 'Exported to accounting', d.id); App.render(); App.toast(t('inv.exportMsg', { id: d.id })); }
      });
    }
  });
})();
