/* Module 11 · Purchase orders & goods receipt — F-61 list with status chips and flags, F-62 Create PO from Approved PR / Tender award / Contract release (R-03, R-16),
   F-63 detail + status bar + VAT split, F-64 delivery schedule & GRN (R-07), F-65 QC & NCR (Return / Replace / Accept with discount), F-66 3-way match summary,
   F-67 change orders with revision history, re-approval and supplier re-confirmation (R-13), F-68 cancel open quantity, F-69 printable PO (R-21) & typed attachments (R-19).
   Routes: #/po (?q=), #/po/new (?pr= | ?tender= | ?contract=; also accepted on #/po), #/po/<id>(/receipts|match|revisions|print|files) */
(function () {
  const { esc, num, pct, vnd, ty, mid, pill, table, kpi, block, layout, t, tv } = App;
  const S = App.src;
  const D = () => window.DATA;
  I18N.add({
    'po.subtitle': ['Every PO line is a Material ID · VAT per line · deliveries received against the schedule with QC', 'Mỗi dòng PO là một mã vật tư · VAT theo dòng · nhận hàng theo lịch giao kèm kiểm tra chất lượng'],
    'po.new': ['New PO', 'Tạo PO'], 'po.sub.list': ['Purchase orders', 'Đơn đặt hàng'], 'po.sub.new': ['Create PO', 'Tạo PO'],
    'po.d.overview': ['Overview & lines', 'Tổng quan & dòng'], 'po.d.receipts': ['Receipts & NCR', 'Nhận hàng & NCR'], 'po.d.match': ['Invoices & match', 'Hóa đơn & đối chiếu'], 'po.d.revisions': ['Revisions', 'Phiên bản'], 'po.d.print': ['Print', 'In'], 'po.d.files': ['Files', 'Tệp'],
    'po.exportMsg': ['Exported PO_02-11-2026.xlsx ({n} rows)', 'Đã xuất PO_02-11-2026.xlsx ({n} dòng)'],
    'po.k.pos': ['Purchase orders', 'Đơn đặt hàng'], 'po.k.open': ['Open value', 'Giá trị đang mở'], 'po.k.openN': ['{n} open POs · excl. VAT', '{n} PO đang mở · chưa VAT'], 'po.k.notConf': ['Not confirmed', 'Chưa xác nhận'], 'po.k.ncr': ['Open NCR', 'NCR đang mở'],
    'po.all': ['All', 'Tất cả'], 'po.searchLbl': ['Search POs', 'Tìm PO'], 'po.searchPh': ['Search PO, vendor, Material ID, PR or tender', 'Tìm PO, NCC, mã vật tư, PR hoặc gói thầu'], 'po.allVendors': ['All vendors', 'Mọi NCC'], 'po.site': ['Delivery site', 'Nơi giao'], 'po.allSites': ['All sites', 'Mọi nơi giao'],
    'po.c.source': ['Source', 'Nguồn'], 'po.c.value': ['Value excl. VAT', 'Giá trị chưa VAT'], 'po.notConf3': ['Not confirmed · 3 days', 'Chưa xác nhận · 3 ngày'], 'po.ncrOpen': ['NCR open', 'NCR đang mở'], 'po.empty': ['No POs match these filters', 'Không có PO phù hợp bộ lọc'],
    'po.steps': ['PO status', 'Trạng thái PO'], 'po.st.Draft': ['Draft', 'Nháp'], 'po.st.Approved': ['Approved', 'Đã duyệt'], 'po.st.Sent': ['Sent', 'Đã gửi'], 'po.st.Confirmed': ['Confirmed', 'Đã xác nhận'], 'po.st.Partial': ['Partially received', 'Nhận một phần'], 'po.st.Closed': ['Closed', 'Đã đóng'], 'po.st.pendingAp': [' · pending approval', ' · chờ duyệt'],
    'po.e.awardNA': ['Award for {id} is not approved yet — Create PO is available after approval.', 'Kết quả trao thầu {id} chưa được duyệt — chỉ tạo PO sau khi duyệt.'], 'po.e.fully': ['Award fully ordered on {ids}.', 'Kết quả trao thầu đã đặt hàng hết trên {ids}.'],
    'po.pc.vsLast': ['{d} vs last {v}', '{d} so với giá gần nhất {v}'], 'po.pc.vs90': ['{d} vs 90-day avg', '{d} so với BQ 90 ngày'], 'po.pc.above': ['Above the contract price', 'Cao hơn giá hợp đồng'],
    'po.notSel': ['{s} (not selectable)', '{s} (không chọn được)'], 'po.awardNA': ['award not approved (not selectable)', 'chưa duyệt trao thầu (không chọn được)'],
    'po.l.qty': ['Quantity line {n}', 'Số lượng dòng {n}'], 'po.l.price': ['Unit price line {n}', 'Đơn giá dòng {n}'], 'po.l.due': ['Delivery date line {n}', 'Ngày giao dòng {n}'], 'po.l.ctLeft': ['Contract left {n}', 'Hợp đồng còn {n}'],
    'po.l.table': ['PO lines', 'Dòng PO'], 'po.c.qty': ['Qty', 'SL'], 'po.c.unit': ['Unit price excl. VAT', 'Đơn giá chưa VAT'], 'po.c.amount': ['Amount excl. VAT', 'Thành tiền chưa VAT'], 'po.c.due': ['Delivery date', 'Ngày giao'], 'po.c.pc': ['Price check', 'Kiểm tra giá'],
    'po.l.none': ['Choose a source to fill the lines', 'Chọn nguồn để điền các dòng'], 'po.form': ['PO · {id}', 'PO · {id}'], 'po.draftS': [' (draft)', ' (nháp)'], 'po.src': ['Source', 'Nguồn'], 'po.src.pr': ['Approved PR', 'PR đã duyệt'], 'po.src.tender': ['Tender award', 'Kết quả trao thầu'], 'po.src.contract': ['Contract release', 'Phát hành từ hợp đồng'],
    'po.ref.pr': ['Purchase request', 'Đề nghị mua hàng'], 'po.ref.tender': ['Awarded tender', 'Gói thầu đã trao'], 'po.ref.contract': ['Contract', 'Hợp đồng'], 'po.ref.none': ['None available', 'Không có'],
    'po.hint.pr': ['Only approved PRs can be selected', 'Chỉ chọn được PR đã duyệt'], 'po.hint.tender': ['Tenders whose award is approved', 'Gói thầu đã được duyệt trao thầu'], 'po.hint.contract': ['Active contracts · price may not exceed the contract price', 'Hợp đồng hiệu lực · giá không vượt giá hợp đồng'],
    'po.vendorOpt': ['{n} · risk {r} · {s}', '{n} · rủi ro {r} · {s}'], 'po.vendorHint': ['Risk index: {r} · OTIF {o} · score {s}', 'Chỉ số rủi ro: {r} · OTIF {o} · điểm {s}'], 'po.f.site': ['Ship-to / delivery site', 'Nơi nhận / nơi giao'], 'po.f.terms': ['Payment terms', 'Điều khoản thanh toán'], 'po.f.termsHint': ['Defaults to the vendor terms', 'Mặc định theo điều khoản của NCC'],
    'po.hiRisk': ['High-risk vendor.', 'NCC rủi ro cao.'], 'po.ack': ['I have reviewed the risk and want to continue', 'Tôi đã xem xét rủi ro và muốn tiếp tục'], 'po.blockedFor': ['{v} is blocked for {m} (certificate). Choose another vendor.', '{v} bị chặn với {m} (chứng chỉ). Hãy chọn NCC khác.'],
    'po.already': ['Already issued from this source:', 'Đã phát hành từ nguồn này:'], 'po.linesN': ['Lines ({n})', 'Dòng ({n})'], 'po.vatOn': ['VAT {r} on', 'VAT {r} trên'], 'po.plusVat': ['{a} + VAT {b}', '{a} + VAT {b}'], 'po.totEx': ['Total excl. VAT', 'Tổng chưa VAT'], 'po.totIn': ['Total incl. VAT', 'Tổng gồm VAT'],
    'po.submit': ['Submit for approval', 'Gửi duyệt'], 'po.route': ['Approval route', 'Luồng duyệt'], 'po.step': ['Step {i} of {n}', 'Bước {i}/{n}'], 'po.sodBuyer': ['Đỗ Hoàng Nam (SoD: you are the buyer)', 'Đỗ Hoàng Nam (SoD: bạn là người mua)'],
    'po.routeNote': ['{v} excl. VAT · {band}. Dept head approval is carried from the PR. After approval: Send to supplier (Gmail + portal), confirmation within 48 h.', '{v} chưa VAT · {band}. Phê duyệt của trưởng bộ phận lấy từ PR. Sau khi duyệt: gửi NCC (Gmail + cổng NCC), xác nhận trong 48 giờ.'],
    'po.bandFd': ['> {v} adds the Finance Director', '> {v} thêm Giám đốc Tài chính'], 'po.bandPl': ['≤ {v}: Procurement Lead', '≤ {v}: Trưởng phòng Mua sắm'],
    'po.pcNote': ['Each line is compared with the last PO price and the 90-day average of its Material ID (excl. VAT). A difference above ±{p}% raises a price alert.', 'Mỗi dòng được so với giá PO gần nhất và giá bình quân 90 ngày của mã vật tư (chưa VAT). Chênh lệch trên ±{p}% sẽ phát cảnh báo giá.'],
    'po.createTitle': ['Create PO', 'Tạo PO'], 'po.createDraft': ['Create PO · draft', 'Tạo PO · nháp'], 'po.createSub': ['Lines inherit Material ID, VAT and reference price from the source · buyer {me}', 'Dòng kế thừa mã vật tư, VAT và giá tham chiếu từ nguồn · người mua {me}'],
    'po.e.noLines': ['No lines — choose a source.', 'Chưa có dòng — hãy chọn nguồn.'], 'po.e.prOnly': ['Only an approved PR can be used.', 'Chỉ dùng được PR đã duyệt.'], 'po.e.qty': ['Enter a quantity above 0.', 'Nhập số lượng lớn hơn 0.'], 'po.e.left': ['Only {n} {u} left on the contract.', 'Hợp đồng chỉ còn {n} {u}.'],
    'po.e.price': ['Enter a unit price above 0.', 'Nhập đơn giá lớn hơn 0.'], 'po.e.ceiling': ['The price may not exceed the contract price.', 'Giá không được vượt giá hợp đồng.'], 'po.e.due': ['Delivery date: dd/mm/yyyy after today.', 'Ngày giao: dd/mm/yyyy, sau hôm nay.'],
    'po.e.blocked': ['{v} is blocked for {m}.', '{v} bị chặn với {m}.'], 'po.e.site': ['Enter the delivery site.', 'Nhập nơi giao.'], 'po.e.ack': ['Confirm that you reviewed the high-risk vendor.', 'Xác nhận bạn đã xem xét NCC rủi ro cao.'],
    'po.submitted': ['{id} submitted · {v} excl. VAT → {a} approves', 'Đã gửi {id} · {v} chưa VAT → {a} duyệt'], 'po.savedDraft': ['{id} saved as draft', 'Đã lưu nháp {id}'],
    'po.lines': ['Lines by Material ID ({n})', 'Dòng theo mã vật tư ({n})'], 'po.cancelled': ['−{n} cancelled', '−{n} đã hủy'], 'po.c.vatAmt': ['VAT amount', 'Tiền VAT'],
    'po.sch.title': ['Delivery schedule & goods receipt', 'Lịch giao & nhận hàng'], 'po.sch.recv': ['receiver {r} · inspector {i}', 'người nhận {r} · kiểm tra {i}'], 'po.sch.sla': ['SLA {a} vs target {b}', 'SLA {a} so với mục tiêu {b}'], 'po.ok': ['OK', 'Đạt'], 'po.missing': ['Missing', 'Thiếu'],
    'po.rejected': ['Rejected {n} {u} — {r}', 'Loại {n} {u} — {r}'], 'po.c.sched': ['Scheduled', 'Theo lịch'], 'po.c.promised': ['Promised', 'Hẹn giao'], 'po.archived': ['Archived', 'Lưu trữ'], 'po.late': ['Late · not received', 'Trễ · chưa nhận'], 'po.open': ['Open', 'Đang mở'],
    'po.asn': ['ship {d} · {q}', 'giao {d} · {q}'], 'po.asks': ['Supplier asks {d} ·', 'NCC đề nghị {d} ·'], 'po.reviewLk': ['review', 'xem xét'], 'po.c.rar': ['Received · accepted · rejected', 'Nhận · chấp nhận · loại'], 'po.c.ontime': ['On time', 'Đúng hạn'], 'po.c.infull': ['In full', 'Đủ số lượng'],
    'po.sch.label': ['Delivery schedule', 'Lịch giao hàng'], 'po.otifNote': ['OTIF: a delivery is on time when received ≤ promised date (as last accepted by the buyer, incl. revisions) and in full when the accepted qty ≥ scheduled qty.', 'OTIF: một lần giao đúng hạn khi nhận ≤ ngày hẹn (theo ngày người mua chấp nhận gần nhất, gồm các phiên bản) và đủ khi SL chấp nhận ≥ SL theo lịch.'],
    'po.receipts': ['Receipts & inspection', 'Phiếu nhận & kiểm tra'], 'po.grnOpen': ['Record goods receipt', 'Ghi nhận nhập kho'],
    'po.g.sod': ['SoD warning: you are the buyer of this PO. PO buyer ≠ GRN receiver is a warn rule — the receipt is allowed and logged.', 'Cảnh báo SoD: bạn là người mua của PO này. Người mua PO ≠ người nhận GRN là quy tắc cảnh báo — vẫn cho nhận hàng và ghi nhật ký.'],
    'po.g.slot': ['Scheduled delivery', 'Đợt giao theo lịch'], 'po.g.slotOpt': ['{m} · {q} {u} · promised {d}', '{m} · {q} {u} · hẹn {d}'], 'po.g.repl': [' · replacement for {n}', ' · hàng thay thế cho {n}'], 'po.g.date': ['Received on', 'Ngày nhận'],
    'po.g.delivered': ['Delivered ({u})', 'Đã giao ({u})'], 'po.g.accepted': ['Accepted ({u})', 'Chấp nhận ({u})'], 'po.g.accHint': ['Accepted + rejected = delivered', 'Chấp nhận + loại = đã giao'], 'po.g.rejected': ['Rejected ({u})', 'Loại ({u})'], 'po.g.inspector': ['Inspector (QC)', 'Người kiểm tra (QC)'],
    'po.g.reason': ['Rejection reason', 'Lý do loại'], 'po.g.reasonHint': ['Required when a quantity is rejected, e.g. "Xi măng ẩm, vón cục · 2 tấn"', 'Bắt buộc khi loại hàng, vd. "Xi măng ẩm, vón cục · 2 tấn"'], 'po.g.action': ['NCR action (if rejected)', 'Xử lý NCR (nếu loại)'], 'po.g.discount': ['Discount % (Accept with discount)', 'Chiết khấu % (chấp nhận có chiết khấu)'],
    'po.g.docs': ['Quality documents checked', 'Chứng từ chất lượng đã kiểm'], 'po.g.reqBy': [' (required by {m})', ' (bắt buộc với {m})'], 'po.g.save': ['Save GRN', 'Lưu GRN'],
    'po.g.e.future': ['Cannot be in the future.', 'Không được ở tương lai.'], 'po.g.e.delivered': ['Enter the delivered quantity.', 'Nhập số lượng đã giao.'], 'po.g.e.over': ['More than 10% over the scheduled {q} {u}.', 'Vượt quá 10% so với {q} {u} theo lịch.'], 'po.g.e.sum': ['Accepted + rejected must equal delivered.', 'Chấp nhận + loại phải bằng số đã giao.'],
    'po.g.e.reason': ['Give the rejection reason.', 'Nhập lý do loại.'], 'po.g.e.discount': ['Enter a discount of 1–30%.', 'Nhập chiết khấu 1–30%.'], 'po.g.e.insp': ['Enter the inspector.', 'Nhập người kiểm tra.'], 'po.g.e.checks': ['Check {c} before accepting (required by {m}).', 'Kiểm tra {c} trước khi chấp nhận (bắt buộc với {m}).'],
    'po.g.saved': ['{id} saved · {q} {u} accepted', 'Đã lưu {id} · chấp nhận {q} {u}'], 'po.g.ncr': [' · {n} created ({a}) and sent to the supplier', ' · đã tạo {n} ({a}) và gửi NCC'], 'po.g.ncrClosed': [' · {n} closed (replacement received)', ' · đã đóng {n} (đã nhận hàng thay thế)'],
    'po.ncr.title': ['Non-conformance ({n})', 'Không phù hợp ({n})'], 'po.ncr.raised': ['raised {d} by {b}', 'lập {d} bởi {b}'], 'po.ncr.resp': ['Supplier response: {r}', 'Phản hồi NCC: {r}'], 'po.ncr.blocks': ['Open NCR blocks invoice matching for {q} {u}; the quantity stays open on the PO.', 'NCR đang mở chặn đối chiếu hóa đơn cho {q} {u}; số lượng vẫn mở trên PO.'],
    'po.ncr.close': ['Close NCR', 'Đóng NCR'], 'po.ncr.closed': ['{id} closed · OTIF, NCR rate and Material 360° updated', 'Đã đóng {id} · cập nhật OTIF, tỷ lệ NCR và Vật tư 360°'], 'po.ncr.none': ['No non-conformance', 'Không có NCR'], 'po.ncr.noneN': ['Rejected quantities at goods receipt create an NCR here.', 'Số lượng bị loại khi nhận hàng sẽ tạo NCR tại đây.'],
    'po.m.title': ['3-way match summary', 'Tóm tắt đối chiếu 3 bên'], 'po.m.poQty': ['PO qty', 'SL PO'], 'po.m.grn': ['GRN accepted', 'GRN chấp nhận'], 'po.m.inv': ['Invoiced', 'Đã hóa đơn'], 'po.m.invs': ['Invoices', 'Hóa đơn'], 'po.m.still': ['Still to invoice', 'Còn chờ hóa đơn'],
    'po.m.label': ['3-way match by Material ID line', 'Đối chiếu 3 bên theo dòng mã vật tư'], 'po.m.note': ['Invoices are matched per line: quantity vs GRN accepted (±2% for tấn / m³), price vs PO (±0,5%).', 'Hóa đơn được đối chiếu theo dòng: số lượng so với GRN chấp nhận (±2% với tấn / m³), giá so với PO (±0,5%).'],
    'po.cf.title': ['Supplier confirmation', 'Xác nhận của NCC'], 'po.cf.approved': ['Approved — send the PO to the supplier (Gmail + portal). The supplier confirms or declines within 48 h.', 'Đã duyệt — gửi PO cho NCC (Gmail + cổng NCC). NCC xác nhận hoặc từ chối trong 48 giờ.'], 'po.cf.after': ['Sent after approval.', 'Gửi sau khi duyệt.'],
    'po.cf.by': ['by {b} · {a}', 'bởi {b} · {a}'], 'po.cf.sent': ['Sent {d}', 'Đã gửi {d}'], 'po.send': ['Send to supplier', 'Gửi NCC'], 'po.remind': ['Remind supplier', 'Nhắc NCC'], 'po.remindMsg': ['Reminder sent to the supplier by Gmail + portal', 'Đã nhắc NCC qua Gmail + cổng NCC'], 'po.recordConf': ['Record confirmation', 'Ghi nhận xác nhận'],
    'po.rv.title': ['Change orders & revisions', 'Lệnh thay đổi & phiên bản'], 'po.rv.openAp': ['Open in My approvals', 'Mở trong Chờ tôi duyệt'], 'po.rv.approver': ['approver Đỗ Hoàng Nam (SoD: raiser cannot approve)', 'người duyệt Đỗ Hoàng Nam (SoD: người tạo không được duyệt)'], 'po.rv.none': ['No revisions yet.', 'Chưa có phiên bản.'],
    'po.co.h': ['Change order · Rev.{n}', 'Lệnh thay đổi · Rev.{n}'], 'po.co.qty': ['{m} qty ({u})', '{m} SL ({u})'], 'po.co.qtyHint': ['Now {n} · at least {lo} (received / invoiced)', 'Hiện {n} · tối thiểu {lo} (đã nhận / đã hóa đơn)'], 'po.co.date': ['{m} next delivery date', '{m} ngày giao kế tiếp'], 'po.co.now': ['Now {d}', 'Hiện {d}'],
    'po.co.reason': ['Reason', 'Lý do'], 'po.co.reasonHint': ['Sent to the approver and the supplier', 'Gửi người duyệt và NCC'], 'po.co.note': ['A value increase needs re-approval (approval matrix; SoD: you cannot approve your own change order). A date-only change needs no approval step. The supplier must re-confirm every revision.', 'Tăng giá trị cần duyệt lại (ma trận phê duyệt; SoD: bạn không được tự duyệt lệnh thay đổi của mình). Chỉ đổi ngày thì không cần duyệt. NCC phải xác nhận lại mọi phiên bản.'],
    'po.co.create': ['Create revision', 'Tạo phiên bản'], 'po.co.btn': ['Change order', 'Lệnh thay đổi'], 'po.co.e.qty': ['Enter a quantity.', 'Nhập số lượng.'], 'po.co.e.below': ['Cannot go below {n} {u} already received or invoiced.', 'Không được thấp hơn {n} {u} đã nhận hoặc đã hóa đơn.'],
    'po.co.e.reason': ['Give a reason of at least 10 characters.', 'Nhập lý do ít nhất 10 ký tự.'], 'po.co.e.nothing': ['Nothing changed — edit a quantity or a date.', 'Chưa có thay đổi — hãy sửa số lượng hoặc ngày.'],
    'po.co.reapproval': ['Rev.{n} sent for re-approval to {a}', 'Đã gửi Rev.{n} để duyệt lại cho {a}'], 'po.co.issued': ['Rev.{n} issued · sent to the supplier for re-confirmation', 'Đã phát hành Rev.{n} · gửi NCC xác nhận lại'],
    'po.cx.title': ['Cancel', 'Hủy'], 'po.cx.title2': ['Cancel open quantity', 'Hủy số lượng còn mở'], 'po.cx.can': ['Open quantity can be cancelled with a reason; the supplier is notified.', 'Có thể hủy số lượng còn mở kèm lý do; NCC sẽ được thông báo.'], 'po.cx.recv': ['Received quantities cannot be cancelled.', 'Không hủy được số lượng đã nhận.'],
    'po.cx.nothing': ['Nothing open to cancel — every scheduled delivery has been received.', 'Không còn gì để hủy — mọi đợt giao đã được nhận.'], 'po.cx.btn': ['Cancel open qty', 'Hủy SL còn mở'], 'po.cx.scope': ['Scope', 'Phạm vi'], 'po.cx.all': ['Whole PO · all open quantity', 'Toàn bộ PO · mọi số lượng còn mở'], 'po.cx.allRecv': [' (received qty stays)', ' (giữ SL đã nhận)'],
    'po.cx.line': ['Line {i} · {m} · {q} {u} open', 'Dòng {i} · {m} · còn mở {q} {u}'], 'po.cx.reasonHint': ['Required · sent to the supplier', 'Bắt buộc · gửi NCC'], 'po.cx.done': ['{x} cancelled · supplier notified by Gmail + portal', 'Đã hủy {x} · đã báo NCC qua Gmail + cổng NCC'],
    'po.hd.title': ['Header', 'Thông tin chung'], 'po.hd.source': ['Source', 'Nguồn'], 'po.hd.terms': ['Payment terms', 'Điều khoản thanh toán'], 'po.hd.site': ['Delivery site', 'Nơi giao'], 'po.hd.buyer': ['Buyer', 'Người mua'], 'po.hd.rev': ['Revision', 'Phiên bản'], 'po.risk': ['Risk: {r}', 'Rủi ro: {r}'],
    'po.print': ['Print preview', 'Xem bản in'], 'po.notConfBy': ['Not confirmed by {v}.', 'Chưa được {v} xác nhận.'],
    'po.k.value': ['Value excl. VAT', 'Giá trị chưa VAT'], 'po.k.total': ['Total incl. VAT', 'Tổng gồm VAT'], 'po.k.accepted': ['Accepted', 'Đã chấp nhận'], 'po.k.invoiced': ['Invoiced (matched)', 'Đã hóa đơn (khớp)'], 'po.k.exc': ['{v} in exception / not matched', '{v} đang ngoại lệ / chưa khớp'],
    'po.pr.doc': ['PURCHASE ORDER', 'ĐƠN ĐẶT HÀNG'], 'po.pr.docAlt': ['ĐƠN ĐẶT HÀNG', 'PURCHASE ORDER'], 'po.pr.date': ['Date {d}', 'Ngày {d}'], 'po.pr.supplier': ['Supplier', 'Bên bán'], 'po.pr.delivery': ['Delivery', 'Giao hàng'], 'po.pr.desc': ['Description', 'Diễn giải'], 'po.pr.uom': ['UoM', 'ĐVT'],
    'po.pr.qty': ['Quantity', 'Số lượng'], 'po.pr.unit': ['Unit price', 'Đơn giá'], 'po.pr.amount': ['Amount', 'Thành tiền'], 'po.pr.vatOn': ['VAT {r}% on {v}', 'Tiền thuế GTGT {r}% trên {v}'], 'po.pr.net': ['Total before VAT', 'Tổng tiền trước thuế'], 'po.pr.gross': ['Total payable', 'Tổng thanh toán'],
    'po.pr.terms': ['Terms', 'Điều khoản'], 'po.pr.termsV': ['Payment: {t}. Deliveries come with CO/CQ per lot and a signed delivery note (biên bản giao nhận). Late delivery penalties per contract / general conditions.', 'Thanh toán: {t}. Giao hàng kèm CO/CQ theo lô và biên bản giao nhận. Phạt chậm giao theo hợp đồng / điều kiện chung.'],
    'po.pr.buyer': ['For the buyer', 'Đại diện bên mua'], 'po.pr.seller': ['For the supplier', 'Đại diện bên bán'], 'po.pr.signed': ['Digitally signed {d}', 'Đã ký số {d}'], 'po.pr.notSigned': ['Not signed yet', 'Chưa ký'], 'po.pr.conf': ['Confirmed {d}', 'Đã xác nhận {d}'], 'po.pr.await': ['Awaiting confirmation', 'Chờ xác nhận'],
    'po.pr.sub': ['The revision number matches the PO', 'Số phiên bản khớp với PO'], 'po.pr.title': ['Print preview · {id} Rev.{r}', 'Xem bản in · {id} Rev.{r}'], 'po.pr.btn': ['Print', 'In'], 'po.pr.pdf': ['{id}_Rev{r}.pdf downloaded', 'Đã tải {id}_Rev{r}.pdf'], 'po.pr.dl': ['Download PDF', 'Tải PDF'], 'po.pr.doclabel': ['Purchase order document', 'Chứng từ đơn đặt hàng'],
    'po.notFound': ['Purchase order {id} was not found.', 'Không tìm thấy đơn đặt hàng {id}.'], 'po.back': ['Back to purchase orders', 'Về danh sách đơn đặt hàng'],
    'po.sentMsg': ['{id} sent to {v} by Gmail + portal · PDF Rev.{r} attached', 'Đã gửi {id} cho {v} qua Gmail + cổng NCC · kèm PDF Rev.{r}'], 'po.confMsg': ['{id} confirmed by {v}', '{id} đã được {v} xác nhận'],
    'po.yes': ['Yes', 'Có'], 'po.no': ['No', 'Không'], 'po.mst': ['MST {v}', 'MST {v}']
  });
  I18N.values({
    'Sent · declined by supplier': 'Đã gửi · NCC từ chối', 'Closed · replaced': 'Đã đóng · đã thay thế', 'Awaiting re-confirmation': 'Chờ xác nhận lại', Declined: 'Từ chối', Current: 'Hiện hành',
    'Current · awaiting supplier re-confirmation': 'Hiện hành · chờ NCC xác nhận lại', 'Approved · awaiting supplier re-confirmation': 'Đã duyệt · chờ NCC xác nhận lại', 'Current · cancellation sent to supplier': 'Hiện hành · đã gửi hủy cho NCC',
    'Return to vendor': 'Trả lại NCC', Replace: 'Đổi hàng', 'Accept with discount': 'Chấp nhận có chiết khấu', 'PO declined': 'PO bị từ chối',
    '45 days after invoice': '45 ngày sau hóa đơn', '30 days after invoice · advance 30% / 70%': '30 ngày sau hóa đơn · tạm ứng 30% / 70%',
    'Reminder at 48 h · escalation to the buyer at 72 h': 'Nhắc ở 48 giờ · chuyển người mua ở 72 giờ',
    'Delivery 2 (30 tấn): 03/11 → 06/11/2026': 'Đợt giao 2 (30 tấn): 03/11 → 06/11/2026', 'no value change, no approval step': 'không đổi giá trị, không cần duyệt', 'Original issue': 'Phát hành gốc',
    'Original issue (RFQ ≤ 500tr)': 'Phát hành gốc (chào giá ≤ 500tr)', 'Lot 1 date 24/10 → 27/10/2026': 'Lô 1 đổi ngày 24/10 → 27/10/2026', 'no price change': 'không đổi giá', 'no value change': 'không đổi giá trị',
    'Original issue (spot PO, not released from CT-2026-008)': 'Phát hành gốc (PO lẻ, không phát hành từ CT-2026-008)',
    'Signed by both parties': 'Hai bên đã ký', '4 photos': '4 ảnh', 'Missing for this lot': 'Thiếu cho lô này', Checked: 'Đã kiểm', '12 / 12 trips': '12 / 12 chuyến', 'Proof of delivery (POD)': 'Bằng chứng giao hàng (POD)',
    'Service entry sheet (biên bản nghiệm thu)': 'Biên bản nghiệm thu dịch vụ', 'SLA 99,2% vs target 98%': 'SLA 99,2% so với mục tiêu 98%', 'Thiếu CQ lô 2 — quarantined until the CQ is received': 'Thiếu CQ lô 2 — cách ly đến khi nhận CQ',
    'Kho Hà Nội (POD)': 'Kho Hà Nội (POD)', 'Awaiting supplier · send CQ lô 2 or replace the lot': 'Chờ NCC · gửi CQ lô 2 hoặc đổi lô hàng', Photos: 'Ảnh chụp'
  });
  I18N.patterns([
    [/^(\S+) qty ([^·]+) → ([^·]+)$/, '$1 SL $2 → $3'], [/^(\S+) delivery ([^·]+) → ([^·]+)$/, '$1 ngày giao $2 → $3'], [/^value ([^·]+) → ([^·]+)$/, 'giá trị $1 → $2'], [/^Original issue from (\S+)( award)?$/, 'Phát hành gốc từ $1'],
    [/^Cancelled open qty: (.*)$/, 'Hủy SL còn mở: $1'], [/^Current · re-confirmed by supplier (.+)$/, 'Hiện hành · NCC đã xác nhận lại $1'], [/^Rev\.(\d+) re-confirmed$/, 'Rev.$1 đã xác nhận lại'], [/^Rev\.(\d+) sent by Gmail \+ portal$/, 'Đã gửi Rev.$1 qua Gmail + cổng NCC'],
    [/^Rev\.(\d+) pending$/, 'Rev.$1 chờ duyệt'], [/^Declined by (.+)$/, 'Bị từ chối bởi $1'], [/^Declined: (.*)$/, 'Từ chối: $1'], [/^([\d.,]+) (\S+) due (\d{2}\/\d{2})$/, '$1 $2 hạn $3'], [/^([\d.,]+) (\S+) due (\d{2}\/\d{2}) \((.+)\)$/, '$1 $2 hạn $3 ($4)'],
    [/^(NCR-[\d-]+) open$/, '$1 đang mở'], [/^([\d.,]+) (\S+) rejected$/, '$1 $2 bị loại'], [/^Awaiting supplier confirmation$/, 'Chờ NCC xác nhận'], [/^due (.+)$/, 'hạn $1'], [/^Accepted by (.+) (\d{2}\/\d{2}\/\d{4})$/, '$1 đã chấp nhận $2'],
    [/^Sent to supplier by Gmail \+ portal$/, 'Đã gửi NCC qua Gmail + cổng NCC'], [/^answer due (.+)$/, 'hạn trả lời $1'], [/^replaced on (.+)$/, 'đã thay thế tại $1'], [/^closed (.+)$/, 'đóng $1'], [/^(.+) \(QC\)$/, '$1 (QC)'],
    [/^Supplier \(portal\)$/, 'NCC (cổng NCC)'], [/^(\d+) days after invoice$/, '$1 ngày sau hóa đơn']
  ]);
  // Free text joined with " · ": translate the whole string, else each part
  const tvx = (s) => { if (!s) return s; const w = tv(s); return w !== s ? w : String(s).split(' · ').map((x) => tv(x)).join(' · '); };

  const NOW = '02/11/2026 10:30';
  const mat = (id) => App.material(id) || { id, name: id || '—', uom: '', vat: 8, vendors: [], certs: [] };
  const STEPS = ['po.st.Draft', 'po.st.Approved', 'po.st.Sent', 'po.st.Confirmed', 'po.st.Partial', 'po.st.Closed'];
  const stepOf = (s) => (/Draft|Pending/.test(s) ? 0 : s === 'Approved' ? 1 : /^Sent/.test(s) ? 2 : s === 'Confirmed' ? 3 : /Partially|Delivered/.test(s) ? 4 : /Closed/.test(s) ? 5 : 0);
  const tone = (s) => (/Closed|Delivered|Confirmed/.test(s) ? 'success' : /not confirmed|declined|Cancel/.test(s) ? 'danger' : /Partially|Pending|Sent/.test(s) ? 'warning' : s === 'Approved' ? 'info' : 'neutral');
  const CHIPS = ['Draft', 'Pending approval', 'Approved', 'Sent', 'Confirmed', 'Partially received', 'Delivered', 'Closed', 'Cancelled'];
  const chipOf = (s) => (/^Sent/.test(s) ? 'Sent' : /^Closed/.test(s) ? 'Closed' : s);
  const riskTone = { Low: 'success', Medium: 'warning', High: 'danger' };
  const st = { chip: 'all', q: '', vendor: 'all', site: 'all', cur: null, nf: null, nerr: {}, grn: null, gerr: {}, co: null, coErr: {}, cx: null, cxErr: {}, up: null, hold: false };

  const docs = () => D().docs.filter((d) => d.type === 'PO');
  const ncrsOf = (id) => Object.entries(D().ncrs).filter(([, n]) => n.po === id).map(([k, n]) => Object.assign({ id: k }, n));
  const openNcr = (id) => ncrsOf(id).filter((n) => n.status !== 'Closed');
  const short = (s) => String(s).split(' ·')[0].split(' (')[0];

  /* PO detail record (synthesised for older POs that only have a document row) */
  function det(id) {
    const d = S.docOf(id); if (!d || d.type !== 'PO') return null;
    if (!D().pos[id]) {
      const q = parseFloat(String(d.qty || '1').replace(/\./g, '').replace(',', '.')) || 1; const recv = /Closed|Delivered/.test(d.status);
      const g = D().docs.find((x) => x.type === 'GRN' && x.po === id);
      D().pos[id] = { vendor: d.vendor, pr: null, tender: null, contract: null, buyer: mat(d.mats[0]).owner || 'Nguyễn Minh Anh', site: d.title.split(' – ').pop(), terms: (App.vendor(d.vendor) || {}).terms || '30 days after invoice', rev: 0,
        lines: [{ mat: d.mats[0], qty: q, price: d.price || Math.round(d.value / q), sched: [[q, App.addDays(d.date, 14), recv ? (g ? g.id : 'archived') : null]] }],
        confirm: { status: 'Confirmed', by: 'Supplier (portal)', at: App.addDays(d.date, 1) }, revs: [], files: [] };
    }
    syncNcrSlots(id, D().pos[id]);
    return D().pos[id];
  }
  /* P4-03: an open NCR with action Replace / Return keeps the rejected qty open as its own schedule slot [qty, due, grn, cx, ncr] */
  function syncNcrSlots(id, p) {
    Object.entries(D().ncrs).forEach(([nid, n]) => {
      if (n.po !== id || !/Replace|Return/.test(n.action)) return;
      const li = p.lines.findIndex((l) => l.mat === n.mat); if (li < 0) return; const l = p.lines[li];
      const slot = l.sched.find((x) => x[4] === nid);
      if (n.status !== 'Closed' && !slot) { const m = /due (\d{2}\/\d{2}\/\d{4})/.exec(n.supplier || ''); n.due = n.due || (m ? m[1] : App.addDays(String(n.raised).slice(0, 10), 7)); l.sched.push([n.qty, n.due, null, null, nid]); }
      if (n.status === 'Closed' && slot && !slot[2] && !slot[3]) l.sched.splice(l.sched.indexOf(slot), 1);
    });
  }
  const openSlots = (p) => sched(p).filter((r) => !r.rec && !r.cx);
  /* Header note rebuilt from the schedule (P4-03) — stored in English, shown through tvx() */
  function noteFrom(p, d) {
    const keep = /Rev\.\d pending/.exec(d.note || ''); const u = (r) => mat(r.mat).uom;
    const parts = openSlots(p).map((r) => `${num(r.qty)} ${u(r)} due ${r.due.slice(0, 5)}${r.ncr ? ` (${r.ncr})` : ''}`);
    const ncr = openNcr(d.id).map((n) => `${n.id} open · ${num(n.qty)} ${mat(n.mat).uom} rejected`);
    return parts.concat(ncr).concat(keep ? [keep[0]] : []).join(' · ');
  }
  /* Schedule rows with receipt results (OTIF uses the accepted qty, R-07) */
  function sched(p) {
    const rows = [];
    p.lines.forEach((l, li) => l.sched.forEach((s, si) => {
      const [qty, due, gid, cx, ncr, asn, req] = s; const g = gid && D().grns[gid]; const gl = g && g.lines.find((x) => x[0] === li && x[1] === si);
      const arch = gid === 'archived'; const rec = !!(gl || arch);
      const delivered = arch ? qty : gl ? gl[2] : 0, accepted = arch ? qty : gl ? gl[3] : 0, rejected = gl ? gl[4] : 0;
      rows.push({ li, si, mat: l.mat, qty, due, gid, g, rec, cx, ncr, asn, req, delivered, accepted, rejected, reason: gl ? gl[5] : '', date: g ? g.date : arch ? due : '', onTime: rec ? (arch || App.dt(g.date) <= App.dt(due)) : null, inFull: rec ? accepted >= qty : null });
    }));
    return rows;
  }
  const lineNet = (l) => (l.qty - (l.cancelled || 0)) * l.price;
  const value = (p) => p.lines.reduce((a, l) => a + lineNet(l), 0);
  function vatSplit(p) { const by = {}; p.lines.forEach((l) => { const r = mat(l.mat).vat; by[r] = (by[r] || 0) + lineNet(l); }); const net = Object.values(by).reduce((a, x) => a + x, 0); const vat = Object.entries(by).reduce((a, [r, x]) => a + x * r / 100, 0); return { by, net, vat, gross: net + vat }; }
  const invoicesOf = (id) => Object.entries(D().invoices).filter(([, v]) => v.po === id).map(([k, v]) => Object.assign({ id: k, doc: S.docOf(k) }, v));
  const invoicedQty = (id, l) => { let q = 0, prev = 0; invoicesOf(id).forEach((v) => v.lines.forEach((x) => { if (x[0] === l.mat) { q += x[2]; prev = Math.max(prev, x[4] || 0); } })); return q + prev; };
  const acceptedQty = (p, li) => sched(p).filter((r) => r.li === li).reduce((a, r) => a + r.accepted, 0);
  const receivedQty = (p, li) => sched(p).filter((r) => r.li === li).reduce((a, r) => a + r.delivered, 0);
  const openQty = (p, li) => sched(p).filter((r) => r.li === li && !r.rec && !r.cx).reduce((a, r) => a + r.qty, 0);
  const vlink = (vid) => { const v = App.vendor(vid); return v ? `<a href="#/vendors/${esc(v.id)}">${esc(v.name)}</a> ${pill(t('po.risk', { r: tv(v.risk) }), riskTone[v.risk] || 'neutral')}` : '—'; };
  const doclink = (id, route) => (id ? `<a class="mono" href="#/${route}/${esc(id)}">${esc(id)}</a>` : '—');
  const nextNo = (type, pre, w) => pre + String(Math.max(...D().docs.filter((d) => d.type === type && d.id.startsWith(pre)).map((d) => +d.id.slice(pre.length))) + 1).padStart(w, '0');
  const progress = (i, s) => `<ol class="steps" aria-label="${esc(t('po.steps'))}">${STEPS.map((k, n) => { const dn = n < i || s === 'Closed'; const cu = n === i && !dn; return `<li class="${dn ? 'done' : cu ? 'cur' : ''}"${cu ? ' aria-current="step"' : ''}><span class="st-n" aria-hidden="true">${dn ? '✓' : n + 1}</span><span class="st-l">${esc(t(k))}${cu && /Pending/.test(s) ? esc(t('po.st.pendingAp')) : ''}</span>${dn ? `<span class="sr"> ${esc(t('tn.done'))}</span>` : ''}</li>`; }).join('')}</ol>`;
  const vatDl = (tt, cls) => `<dl class="dl ${cls || ''} mt">${Object.entries(tt.by).sort((a, b) => b[0] - a[0]).map(([r, x]) => `<dt>${esc(t('po.vatOn', { r: S.vatLabel(r) }))}</dt><dd>${esc(t('po.plusVat', { a: vnd(x), b: vnd(x * r / 100) }))}</dd>`).join('')}<dt>${esc(t('po.totEx'))}</dt><dd><b>${vnd(tt.net)}</b></dd><dt class="tot">${esc(t('po.totIn'))}</dt><dd class="tot"><b>${vnd(tt.gross)}</b></dd></dl>`;
  const notFound = (id) => layout({ title: t('nav.po'), blocks: [block(null, App.errorState(t('po.notFound', { id })) + `<p class="m-0"><a class="btn" href="#/po">${esc(t('po.back'))}</a></p>`)] });

  /* ---------- F-61 list ---------- */
  function listBlock(all) {
    const cnt = (k) => (k === 'all' ? all.length : all.filter((d) => chipOf(d.status) === k).length);
    const vendors = [...new Set(all.map((d) => d.vendor))]; const sites = [...new Set(all.map((d) => short(det(d.id).site)))];
    const q = st.q.trim();
    const rows = all.filter((d) => { const x = det(d.id); return (st.chip === 'all' || chipOf(d.status) === st.chip) && (st.vendor === 'all' || d.vendor === st.vendor) && (st.site === 'all' || short(x.site) === st.site)
      && (!q || App.matches(`${d.id} ${d.title} ${d.mats.join(' ')} ${(App.vendor(d.vendor) || {}).name} ${x.pr || ''} ${x.tender || ''} ${x.contract || ''}`, q)); }).sort((a, b) => App.dt(b.date) - App.dt(a.date) || b.id.localeCompare(a.id));
    return block(t('po.sub.list'), `<div class="seg seg-wrap" role="group" aria-label="${esc(t('c.status'))}">${['all'].concat(CHIPS).map((k) => `<button data-po="chip" data-k="${esc(k)}" aria-pressed="${st.chip === k}">${esc(k === 'all' ? t('po.all') : tv(k))} (${cnt(k)})</button>`).join('')}</div>
      <div class="filters"><label class="sr" for="po-q">${esc(t('po.searchLbl'))}</label><input class="inp grow" id="po-q" type="search" data-pof="q" value="${esc(st.q)}" placeholder="${esc(t('po.searchPh'))}">
        <label class="sr" for="po-v">${esc(t('c.vendor'))}</label><select class="inp" id="po-v" data-pof="vendor"><option value="all">${esc(t('po.allVendors'))}</option>${vendors.map((v) => `<option value="${esc(v)}"${st.vendor === v ? ' selected' : ''}>${esc(App.vshort(App.vendor(v)))}</option>`).join('')}</select>
        <label class="sr" for="po-s">${esc(t('po.site'))}</label><select class="inp" id="po-s" data-pof="site"><option value="all">${esc(t('po.allSites'))}</option>${sites.map((v) => `<option value="${esc(v)}"${st.site === v ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select></div>
        ${table([
          { h: 'PO', r: (d) => `<a class="mono" href="#/po/${esc(d.id)}">${esc(d.id)}</a>${det(d.id).rev ? ` <span class="small muted">Rev.${det(d.id).rev}</span>` : ''}<div class="small">${esc(d.title)}</div>`, w: 'minmax(220px,2.2fr)' },
          { h: t('c.vendor'), r: (d) => `${esc(App.vshort(App.vendor(d.vendor)))}<div class="small muted">${esc(d.date)}</div>`, w: 'minmax(130px,1.2fr)' },
          { h: t('c.mids'), r: (d) => `<span class="chips chips-inline">${d.mats.map(mid).join('')}</span>`, w: 'minmax(140px,1.4fr)' },
          { h: t('po.c.source'), r: (d) => { const x = det(d.id); return x.tender ? S.tndLink(x.tender) : x.contract ? doclink(x.contract, 'contracts') : x.pr ? S.prLink(x.pr) : '—'; }, w: '130px' },
          { h: t('po.c.value'), r: (d) => vnd(d.value), cls: 'num', w: '150px' },
          { h: t('c.status'), r: (d) => { const x = det(d.id); return `${pill(d.status, tone(d.status))}${(x.confirm || {}).status === 'Not confirmed' ? `<div class="mt-s">${pill(t('po.notConf3'), 'danger')}</div>` : ''}${openNcr(d.id).length ? `<div class="mt-s">${pill(t('po.ncrOpen'), 'warning')}</div>` : ''}`; }, w: 'minmax(160px,1.4fr)' }
        ], rows, { empty: t('po.empty'), label: t('po.sub.list') })}`,
    { actions: `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('po.exportMsg', { n: rows.length }))}">${esc(t('c.export'))}</button>` });
  }

  /* ---------- F-62 create PO ---------- */
  const approvedVendors = (m) => mat(m).vendors.filter((v) => v[1] !== 'Blocked').map((v) => v[0]);
  const awardedTenders = () => D().docs.filter((d) => d.type === 'TND' && D().tenders[d.id] && D().tenders[d.id].award && D().tenders[d.id].award.status === 'Approved');
  const activeCts = () => D().contracts.filter((c) => ['Active', 'Expiring'].includes((S.docOf(c.id) || {}).status));
  function build(src, ref, vendor) {
    const f = { src, ref, vendor: vendor || '', site: '', terms: '', lines: [], ack: false, note: '' };
    if (src === 'pr' && D().prs[ref]) {
      const pr = D().prs[ref]; f.site = pr.site; f.lines = pr.lines.map((l) => ({ mat: l.mat, qty: l.qty, price: l.price, due: pr.need }));
      f.vendor = vendor || (mat(pr.lines[0].mat).vendors.find((v) => v[1] === 'Preferred') || mat(pr.lines[0].mat).vendors[0] || [''])[0];
      if (ref === 'PR-2026-0436') f.vendor = vendor || 'V-1004';
    } else if (src === 'tender' && D().tenders[ref]) {
      const tn = D().tenders[ref]; const a = tn.award; const pr = tn.pr && D().prs[tn.pr]; f.site = pr ? pr.site : 'Nhà xưởng C2';
      if (!a || a.status !== 'Approved') { f.err = ['po.e.awardNA', { id: ref }]; f.terms = ''; return f; }
      if (a.pick && tn.bidders) { const vs = [...new Set(a.pick)]; f.vendor = vs.includes(vendor) ? vendor : vs[0]; const b = tn.bidders.find((x) => x.vid === f.vendor); f.lines = tn.lines.map((l, i) => ({ mat: l.mat, qty: l.qty, price: b.prices[i], due: tn.delivery, keep: a.pick[i] === f.vendor })).filter((l) => l.keep); f.vendors = vs; }
      else { f.vendor = a.vendor; const tq = tn.lines.reduce((s, l) => s + l.qty, 0); f.lines = tn.lines.map((l) => ({ mat: l.mat, qty: l.qty, price: Math.round(a.value / tq), due: tn.delivery })); }
      const prior = docs().filter((d) => { const x = D().pos[d.id]; return x && !/Cancelled|Draft/.test(d.status) && x.tender === ref && x.vendor === f.vendor; });
      if (prior.length) { f.lines.forEach((l) => { const used = prior.reduce((s, d) => s + D().pos[d.id].lines.filter((x) => x.mat === l.mat).reduce((a2, x) => a2 + x.qty - (x.cancelled || 0), 0), 0); l.qty = Math.max(0, l.qty - used); });
        if (f.lines.every((l) => !(+l.qty > 0))) f.err = ['po.e.fully', { ids: prior.map((d) => d.id).join(', ') }]; }
    } else if (src === 'contract') {
      const c = D().contracts.find((x) => x.id === ref);
      if (c) { f.vendor = c.vendor; f.site = 'Kho B · KCN Tân Uyên, Bình Dương'; f.lines = c.lines.map((l) => ({ mat: l.mat, qty: '', price: l.q4, due: App.addDays(D().today, 7), ceiling: l.q4, left: l.commit - l.released })); }
    }
    f.terms = ((App.vendor(f.vendor) || {}).terms || '30 days').split(' ·')[0].replace(/^(\d+) days$/, '$1 days after invoice');
    return f;
  }
  const existingFor = (f) => docs().filter((d) => { const x = D().pos[d.id]; return x && d.status !== 'Cancelled' && ((f.src === 'pr' && x.pr === f.ref) || (f.src === 'tender' && x.tender === f.ref && x.vendor === f.vendor)); });
  function initNew(p, draft) {
    if (draft) { const x = det(draft); const f = build(x.pr ? 'pr' : x.tender ? 'tender' : x.contract ? 'contract' : 'pr', x.pr || x.tender || x.contract || '', x.vendor); f.id = draft; f.err = null; f.site = x.site; f.terms = x.terms; f.lines = x.lines.map((l) => ({ mat: l.mat, qty: l.qty, price: l.price, due: l.sched[0][1] })); return f; }
    const src = p.tender ? 'tender' : p.contract ? 'contract' : 'pr';
    const ref = p.tender || p.contract || p.pr || 'PR-2026-0436';
    const f = build(src, ref);
    const ex = existingFor(f).find((d) => d.status === 'Draft'); if (ex) f.id = ex.id;
    return f;
  }
  function priceCheck(l) {
    const m = mat(l.mat); const ref = m.last || m.avg90; if (!ref || !(+l.price > 0)) return '';
    const d = (l.price - ref) / ref * 100; const d90 = m.avg90 ? (l.price - m.avg90) / m.avg90 * 100 : null;
    const sg = (x) => `${x > 0 ? '+' : x < 0 ? '−' : '±'}${pct(Math.abs(x))}`;
    return `<span class="${Math.abs(d) > D().priceAlertThreshold ? 'tone-danger' : d <= 0 ? 'tone-success' : ''}">${esc(t('po.pc.vsLast', { d: sg(d), v: vnd(m.last || ref) }))}</span>${d90 != null ? `<div class="small muted">${esc(t('po.pc.vs90', { d: sg(d90) }))}</div>` : ''}${l.ceiling && l.price > l.ceiling ? `<div class="small tone-danger">${esc(t('po.pc.above'))}</div>` : ''}`;
  }
  function newBlocks() {
    const f = st.nf; const e = st.nerr; const v = App.vendor(f.vendor);
    const id = f.id || nextNo('PO', 'PO-2026-', 4);
    const tt = vatSplit({ lines: f.lines.map((l) => ({ mat: l.mat, qty: +l.qty || 0, price: +l.price || 0 })) });
    const ex = existingFor(f).filter((d) => d.id !== f.id);
    const prOpts = D().docs.filter((d) => d.type === 'PR' && D().prs[d.id]).map((d) => [d.id, d.status === 'Approved' ? `${d.id} · ${d.title}` : t('po.notSel', { s: `${d.id} · ${d.title} — ${tv(d.status)}` }), d.status !== 'Approved']);
    const refOpts = f.src === 'pr' ? prOpts : f.src === 'tender' ? awardedTenders().map((d) => [d.id, `${d.id} · ${d.title}`]).concat(awardedTenders().some((d) => d.id === f.ref) || !f.ref ? [] : [[f.ref, `${f.ref} — ${t('po.awardNA')}`, true]]) : activeCts().map((c) => [c.id, `${c.id} · ${tv((S.docOf(c.id) || {}).title)}`]);
    const vendOpts = f.src === 'pr' ? [...new Set(f.lines.flatMap((l) => approvedVendors(l.mat)))].concat(D().vendors.filter((x) => x.risk === 'High').map((x) => x.id)) : f.vendors || [f.vendor];
    const blockedFor = f.lines.filter((l) => mat(l.mat).vendors.some((x) => x[0] === f.vendor && x[1] === 'Blocked')).map((l) => l.mat);
    const route = tt.net > D().approvalBands[1][0] ? ['Procurement Lead', 'Finance Director'] : ['Procurement Lead'];
    const lineRows = f.lines.map((l, i) => { const m = mat(l.mat); const err = e['l' + i];
      return `<div class="tr po-cols" role="row"><div class="td" role="cell">${mid(l.mat)}<div class="small">${esc(m.name)}</div>${err ? `<div class="err small" id="pn-e${i}" role="alert">${esc(S.errText(err))}</div>` : ''}</div>
        <div class="td num" role="cell"><label class="sr" for="pn-q${i}">${esc(t('po.l.qty', { n: i + 1 }))}</label><input class="inp inp-num w-full" id="pn-q${i}" data-pn="qty" data-i="${i}" inputmode="decimal" value="${esc(l.qty)}"${err ? ` aria-invalid="true" aria-describedby="pn-e${i}"` : ''}> <span class="small muted">${esc(m.uom)}</span>${l.left != null ? `<div class="small muted">${esc(t('po.l.ctLeft', { n: num(l.left) }))}</div>` : ''}</div>
        <div class="td num" role="cell"><label class="sr" for="pn-p${i}">${esc(t('po.l.price', { n: i + 1 }))}</label><input class="inp inp-num w-full" id="pn-p${i}" data-pn="price" data-i="${i}" inputmode="numeric" value="${esc(l.price === '' ? '' : num(l.price))}"${f.src !== 'pr' ? ' readonly aria-readonly="true"' : ''}></div>
        <div class="td" role="cell">${S.vatCell(m.vat)}</div><div class="td num" role="cell">${vnd((+l.qty || 0) * (+l.price || 0))}<div class="small muted">VAT ${vnd((+l.qty || 0) * (+l.price || 0) * m.vat / 100)}</div></div>
        <div class="td" role="cell"><label class="sr" for="pn-d${i}">${esc(t('po.l.due', { n: i + 1 }))}</label><input class="inp w-full" id="pn-d${i}" data-pn="due" data-i="${i}" value="${esc(l.due)}" placeholder="dd/mm/yyyy"></div>
        <div class="td small" role="cell">${priceCheck(l)}</div></div>`; }).join('');
    const linesTbl = `<div class="tbl-wrap" tabindex="0" role="region" aria-label="${esc(t('c.scrolls', { label: t('po.l.table') }))}"><div class="tbl tbl-1100" role="table"><div class="tr thead po-cols" role="row"><div class="th">${esc(t('c.mid'))}</div><div class="th num">${esc(t('po.c.qty'))}</div><div class="th num">${esc(t('po.c.unit'))}</div><div class="th">VAT</div><div class="th num">${esc(t('po.c.amount'))}</div><div class="th">${esc(t('po.c.due'))}</div><div class="th">${esc(t('po.c.pc'))}</div></div>${lineRows || `<div class="empty">${esc(t('po.l.none'))}</div>`}</div></div>`;
    const form = block(t('po.form', { id }) + (f.id ? t('po.draftS') : ''), `<form id="po-new" class="stack" novalidate>${e._ ? `<div class="alert alert-danger" role="alert">${esc(S.errText(e._))}</div>` : ''}
      <fieldset class="fs"><legend>${esc(t('po.src'))}</legend><div class="seg seg-wrap" role="group" aria-label="${esc(t('po.src'))}">${['pr', 'tender', 'contract'].map((k) => `<button type="button" data-po="src" data-k="${k}" aria-pressed="${f.src === k}">${esc(t('po.src.' + k))}</button>`).join('')}</div></fieldset>
      <div class="form-grid"><div class="field"><label for="pn-ref">${esc(t('po.ref.' + f.src))}</label><select id="pn-ref" name="ref" data-pn="ref"${e.ref ? ' aria-invalid="true" aria-describedby="pn-ref-e"' : ''}>${refOpts.length ? refOpts.map(([k, l, dis]) => `<option value="${esc(k)}"${f.ref === k ? ' selected' : ''}${dis ? ' disabled' : ''}>${esc(l)}</option>`).join('') : `<option value="">${esc(t('po.ref.none'))}</option>`}</select>${e.ref ? `<span class="err" id="pn-ref-e" role="alert">${esc(S.errText(e.ref))}</span>` : ''}<span class="hint">${esc(t('po.hint.' + f.src))}</span></div>
        <div class="field"><label for="pn-vendor">${esc(t('c.vendor'))}</label><select id="pn-vendor" name="vendor" data-pn="vendor"${f.src === 'contract' ? ' disabled' : ''}>${[...new Set(vendOpts)].map((x) => { const vv = App.vendor(x); return vv ? `<option value="${esc(x)}"${f.vendor === x ? ' selected' : ''}>${esc(t('po.vendorOpt', { n: App.vshort(vv), r: tv(vv.risk), s: tv(vv.status) }))}</option>` : ''; }).join('')}</select><span class="hint">${v ? esc(t('po.vendorHint', { r: tv(v.risk), o: v.otif != null ? pct(v.otif) : '—', s: v.score != null ? num(v.score, 2) : '—' })) : ''}</span></div>
        ${S.field('pn', e, 'site', t('po.f.site'), f.site, { req: true })}${S.field('pn', e, 'terms', t('po.f.terms'), tv(f.terms), { hint: t('po.f.termsHint') })}</div>
      ${v && v.risk === 'High' ? `<div class="alert alert-warning" role="alert"><b>${esc(t('po.hiRisk'))}</b> ${esc(v.name)}: ${(v.riskReasons || []).map((x) => esc(tv(x))).join(' · ')}.<label class="chk mt-s"><input type="checkbox" name="ack" value="1"${f.ack ? ' checked' : ''}${e.ack ? ' aria-invalid="true" aria-describedby="pn-ack-e"' : ''}> ${esc(t('po.ack'))}</label>${e.ack ? `<span class="err" id="pn-ack-e" role="alert">${esc(S.errText(e.ack))}</span>` : ''}</div>` : ''}
      ${blockedFor.length ? `<div class="alert alert-danger" role="alert">${esc(t('po.blockedFor', { v: v ? v.name : '', m: blockedFor.join(', ') }))}</div>` : ''}
      ${ex.length ? `<div class="alert alert-info" role="status">${esc(t('po.already'))} ${ex.map((d) => `<a class="mono" href="#/po/${esc(d.id)}">${esc(d.id)}</a> (${esc(tv(d.status))})`).join(', ')}.</div>` : ''}
      ${f.err ? `<div class="alert alert-warning" role="alert">${esc(S.errText(f.err))}</div>` : ''}
      <h3 class="h-sub">${esc(t('po.linesN', { n: f.lines.length }))}</h3>${linesTbl}
      ${vatDl(tt)}
      <div class="row-acts"><a class="btn" href="#/po">${esc(t('c.cancel'))}</a><button type="button" class="btn" data-po="save-draft"${f.err ? ' disabled' : ''}>${esc(t('c.saveDraft'))}</button><button type="submit" class="btn btn-p"${f.err ? ' disabled aria-disabled="true"' : ''}>${esc(t('po.submit'))}</button></div></form>`);
    const B2 = D().approvalBands[1][0];
    const side = block(t('po.route'), `<ol class="chain">${route.map((r, i) => `<li><span class="small muted">${esc(t('po.step', { i: i + 1, n: route.length }))}</span><b>${esc(tv(r))}</b><span class="small">${esc(r === 'Procurement Lead' ? (S.me() === 'Nguyễn Minh Anh' ? t('po.sodBuyer') : 'Nguyễn Minh Anh') : 'Đỗ Hoàng Nam')}</span></li>`).join('')}</ol>
      <p class="small muted">${esc(t('po.routeNote', { v: vnd(tt.net), band: tt.net > B2 ? t('po.bandFd', { v: App.ty(B2) }) : t('po.bandPl', { v: App.ty(B2) }) }))}</p>`, { span: 6 });
    const pc = block(t('po.c.pc'), `<p class="small mt-0">${esc(t('po.pcNote', { p: D().priceAlertThreshold }))}</p>`, { span: 6 });
    return [form, side, pc];
  }
  function readNew(root) {
    const f = st.nf; const x = S.read(root, '#po-new .form-grid'); f.site = x.site; if (x.terms !== tv(f.terms)) { f.terms = x.terms; f.termsEdited = true; } if (x.vendor) f.vendor = x.vendor;
    const ack = root.querySelector('#po-new [name=ack]'); f.ack = !!(ack && ack.checked);
    root.querySelectorAll('[data-pn=qty],[data-pn=price],[data-pn=due]').forEach((el) => { const l = f.lines[+el.dataset.i]; const k = el.dataset.pn; if (k === 'qty') l.qty = el.value.replace(',', '.').trim(); else if (k === 'price') l.price = el.value === '' ? '' : S.money(el.value); else l.due = el.value.trim(); });
  }
  function saveNew(root, submit) {
    readNew(root); const f = st.nf; const e = {}; const v = App.vendor(f.vendor);
    if (f.err) { st.nerr = { _: f.err }; App.render(); return; }
    if (!f.lines.length) e._ = 'po.e.noLines';
    if (f.src === 'pr' && (S.docOf(f.ref) || {}).status !== 'Approved') e.ref = 'po.e.prOnly';
    f.lines.forEach((l, i) => { const m = mat(l.mat);
      if (!(+l.qty > 0)) e['l' + i] = 'po.e.qty'; else if (l.left != null && +l.qty > l.left) e['l' + i] = ['po.e.left', { n: num(l.left), u: m.uom }];
      else if (!(+l.price > 0)) e['l' + i] = 'po.e.price'; else if (l.ceiling && +l.price > l.ceiling) e['l' + i] = 'po.e.ceiling';
      else if (submit && (!S.validDate(l.due) || App.daysTo(l.due) <= 0)) e['l' + i] = 'po.e.due';
      if (m.vendors.some((x) => x[0] === f.vendor && x[1] === 'Blocked')) e._ = ['po.e.blocked', { v: v.name, m: l.mat }]; });
    if (submit && !f.site) e.site = 'po.e.site';
    if (submit && v && v.risk === 'High' && !f.ack) e.ack = 'po.e.ack';
    st.nerr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#po-new'); return; }
    const id = f.id || nextNo('PO', 'PO-2026-', 4);
    const lines = f.lines.map((l) => ({ mat: l.mat, qty: +l.qty, price: +l.price, sched: [[+l.qty, l.due || App.addDays(D().today, 14), null]] }));
    const p = { vendor: f.vendor, pr: f.src === 'pr' ? f.ref : (f.src === 'tender' && D().tenders[f.ref].pr) || null, tender: f.src === 'tender' ? f.ref : null, contract: f.src === 'contract' ? f.ref : null, buyer: S.me(), site: f.site, terms: f.terms, rev: 0, lines, confirm: null, revs: [], files: (D().pos[id] || {}).files || [] };
    D().pos[id] = p; const net = value(p);
    let d = S.docOf(id); const m0 = mat(lines[0].mat);
    const title = `${m0.name}${lines.length > 1 ? ` + ${lines.length - 1}` : ''} – ${short(f.site)}`;
    if (!d) { d = { id, type: 'PO', title, date: D().today, status: 'Draft', mats: [], vendor: f.vendor, qty: '', price: 0, value: 0 }; D().docs.push(d); }
    Object.assign(d, { vendor: f.vendor, mats: [...new Set(lines.map((l) => l.mat))], qty: `${num(lines[0].qty)} ${m0.uom}`, price: lines[0].price, value: net });
    let lead = '';
    if (submit) {
      d.status = 'Pending approval'; lead = S.me() === 'Nguyễn Minh Anh' ? 'Đỗ Hoàng Nam' : 'Nguyễn Minh Anh'; const n = net > D().approvalBands[1][0] ? 2 : 1;
      D().approvals = D().approvals.filter((a) => a.id !== id);
      D().approvals.push({ id, type: 'PO approval', title: d.title, mats: d.mats, value: net, by: S.me(), step: 'Step 1 of ' + n, sla: App.addDays(D().today, 2) + ' 17:00', assignee: lead });
      D().approvalChains[id] = [[`${S.me()} · Buyer`, 'Submitted', NOW, ''], [`${lead} · Procurement Lead`, 'Waiting', 'SLA 2 working days', '']].concat(n > 1 ? [['Đỗ Hoàng Nam · Finance Director', 'Next', '', '']] : []);
      p.revs = [{ no: 0, status: 'Current', at: NOW, by: S.me(), diff: 'Original issue from ' + f.ref, reason: '' }];
    }
    st.nf = null; st.cur = null; const h = '#/po/' + id; if (location.hash === h) App.render(); else location.hash = h;
    App.toast(submit ? t('po.submitted', { id, v: vnd(net), a: lead }) : t('po.savedDraft', { id }));
  }

  /* ---------- F-63..F-69 detail blocks ---------- */
  function linesBlock(id, p, d) {
    const tt = vatSplit(p);
    return block(t('po.lines', { n: p.lines.length }), progress(stepOf(d.status), d.status) + table([
      { h: t('c.mid'), r: (l) => `${mid(l.mat)}<div class="small">${esc(mat(l.mat).name)}</div>`, w: 'minmax(160px,2fr)' },
      { h: t('po.c.qty'), r: (l) => `<span class="nowrap">${num(l.qty)} ${esc(mat(l.mat).uom)}</span>${l.cancelled ? `<div class="small tone-danger">${esc(t('po.cancelled', { n: num(l.cancelled) }))}</div>` : ''}`, cls: 'num', w: '110px' },
      { h: t('po.c.unit'), r: (l) => vnd(l.price), cls: 'num', w: '130px' },
      { h: 'VAT', r: (l) => S.vatCell(mat(l.mat).vat), w: 'minmax(90px,.8fr)' },
      { h: t('po.c.vatAmt'), r: (l) => vnd(lineNet(l) * mat(l.mat).vat / 100), cls: 'num', w: '120px' },
      { h: t('po.c.amount'), r: (l) => vnd(lineNet(l)), cls: 'num', w: '140px' }
    ], p.lines, { label: t('po.l.table') }) + vatDl(tt, 'dl-tot'));
  }
  function schedBlock(id, p, d) {
    const rows = sched(p);
    const canRecv = /Sent|Confirmed|Partially/.test(d.status) && rows.some((r) => !r.rec && !r.cx);
    const grns = [...new Set(rows.filter((r) => r.g).map((r) => r.gid))];
    const gBlocks = grns.map((gid) => { const g = D().grns[gid];
      return `<li><b class="mono">${esc(gid)}</b> <span class="small muted">· ${esc(g.date)} · ${esc(t('po.sch.recv', { r: tv(g.receiver), i: tv(g.inspector) }))}${g.ses ? ' · ' + esc(t('po.sch.sla', { a: pct(g.sla[0]), b: pct(g.sla[1]) })) : ''}</span>
        <div class="chips">${g.checks.map(([n, ok, note]) => pill(`${tv(n)}: ${t(ok ? 'po.ok' : 'po.missing')}`, ok ? 'success' : 'danger') + (note ? ` <span class="small muted">${esc(tv(note))}</span>` : '')).join(' ')}</div>${g.lines.filter((x) => x[4]).map((x) => `<div class="small tone-danger">${esc(t('po.rejected', { n: num(x[4]), u: mat(p.lines[x[0]].mat).uom, r: tv(x[5]) }))}${g.ncr ? ` → ${esc(g.ncr)}` : ''}</div>`).join('')}</li>`; }).join('');
    const yn = (x) => (x == null ? '—' : pill(t(x ? 'po.yes' : 'po.no'), x ? 'success' : 'danger'));
    return block(t('po.sch.title'), table([
      { h: t('c.mid'), r: (r) => mid(r.mat), w: '120px' },
      { h: t('po.c.sched'), r: (r) => `${num(r.qty)} ${esc(mat(r.mat).uom)}`, cls: 'num', w: '100px' },
      { h: t('po.c.promised'), r: (r) => `${esc(r.due)}${r.ncr ? `<div class="small muted">${esc(r.ncr)}</div>` : ''}${r.cx ? `<div>${pill('Cancelled', 'danger')}</div>` : ''}`, w: '110px' },
      { h: 'GRN', r: (r) => (r.g ? `<span class="mono">${esc(r.gid)}</span><div class="small muted">${esc(r.date)}</div>` : r.rec ? `<span class="small muted">${esc(t('po.archived'))}</span>` : r.cx ? '—' : `<span class="small muted">${esc(t(App.daysTo(r.due) < 0 ? 'po.late' : 'po.open'))}</span>${r.asn ? `<div class="small">${pill('ASN ' + r.asn.id, 'info')} ${esc(t('po.asn', { d: r.asn.ship, q: num(r.asn.qty) }))}</div>` : ''}${r.req && /Pending/.test(r.req.status) ? `<div class="small tone-warning">${esc(t('po.asks', { d: r.req.to }))} <a href="#/approvals?id=${encodeURIComponent(r.req.id)}">${esc(t('po.reviewLk'))}</a></div>` : ''}`), w: '150px' },
      { h: t('po.c.rar'), r: (r) => (r.rec ? `${num(r.delivered)} · <b>${num(r.accepted)}</b> · ${r.rejected ? `<span class="tone-danger">${num(r.rejected)}</span>` : '0'}` : '—'), cls: 'num', w: '170px' },
      { h: t('po.c.ontime'), r: (r) => yn(r.onTime), w: '100px' },
      { h: t('po.c.infull'), r: (r) => yn(r.inFull), w: '100px' }
    ], rows, { label: t('po.sch.label') })
      + `<p class="small muted">${esc(t('po.otifNote'))}</p>${gBlocks ? `<h3 class="h-sub">${esc(t('po.receipts'))}</h3><ul class="plain grn-list">${gBlocks}</ul>` : ''}${st.grn ? grnForm(p, rows) : ''}`,
    { actions: canRecv && !st.grn ? `<button class="btn btn-sm btn-p" data-po="grn-open">${esc(t('po.grnOpen'))}</button>` : '' });
  }
  const certReq = (m, r) => m.certs.filter((c) => /GRN/.test(c[1])).map((c) => c[0]).concat(r.mat === 'CON-24015' || r.mat === 'CON-24020' ? ['Mill certificate'] : []);
  function grnForm(p, rows) {
    const f = st.grn; const e = st.gerr; const open = rows.filter((r) => !r.rec && !r.cx); const r = open.find((x) => `${x.li}:${x.si}` === f.slot) || open[0]; if (!r) return ''; const m = mat(r.mat);
    const docsReq = certReq(m, r).concat(['Biên bản giao nhận']);
    return `<form id="po-grn" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">${esc(t('po.grnOpen'))}</h3>
      ${S.me() === p.buyer ? `<div class="alert alert-warning" role="status">${esc(t('po.g.sod'))}</div>` : ''}
      <div class="form-grid">${S.field('pg', e, 'slot', t('po.g.slot'), `${r.li}:${r.si}`, { options: open.map((x) => [`${x.li}:${x.si}`, t('po.g.slotOpt', { m: x.mat, q: num(x.qty), u: mat(x.mat).uom, d: x.due }) + (x.ncr ? t('po.g.repl', { n: x.ncr }) : '')]) })}
        ${S.field('pg', e, 'date', t('po.g.date'), f.date, { req: true, ph: 'dd/mm/yyyy' })}
        ${S.field('pg', e, 'delivered', t('po.g.delivered', { u: m.uom }), f.delivered, { req: true, mode: 'decimal' })}${S.field('pg', e, 'accepted', t('po.g.accepted', { u: m.uom }), f.accepted, { req: true, mode: 'decimal', hint: t('po.g.accHint') })}
        ${S.field('pg', e, 'rejected', t('po.g.rejected', { u: m.uom }), f.rejected, { mode: 'decimal' })}${S.field('pg', e, 'inspector', t('po.g.inspector'), f.inspector, { req: true })}
        ${S.field('pg', e, 'reason', t('po.g.reason'), f.reason, { area: true, hint: t('po.g.reasonHint') })}
        ${S.field('pg', e, 'action', t('po.g.action'), f.action, { options: ['Return to vendor', 'Replace', 'Accept with discount'] })}${S.field('pg', e, 'discount', t('po.g.discount'), f.discount, { mode: 'decimal' })}</div>
      <fieldset class="fs"${e.checks ? ' aria-describedby="pg-checks-e"' : ''}><legend>${esc(t('po.g.docs'))}</legend>${docsReq.map((c) => `<label class="chk"><input type="checkbox" name="checks" value="${esc(c)}"${(f.checks || []).includes(c) ? ' checked' : ''}> ${esc(tv(c))}${c !== 'Biên bản giao nhận' ? esc(t('po.g.reqBy', { m: r.mat })) : ''}</label>`).join('')}${e.checks ? `<span class="err" id="pg-checks-e" role="alert">${esc(S.errText(e.checks))}</span>` : ''}</fieldset>
      <div class="row-acts"><button type="button" class="btn btn-sm" data-po="grn-cancel">${esc(t('c.cancel'))}</button><button type="submit" class="btn btn-sm btn-p">${esc(t('po.g.save'))}</button></div></form>`;
  }
  function saveGrn(root, id, p, d) {
    const f = Object.assign(st.grn, S.read(root, '#po-grn')); f.checks = f.checks || []; const e = {};
    const rows = sched(p).filter((x) => !x.rec && !x.cx); const r = rows.find((x) => `${x.li}:${x.si}` === f.slot) || rows[0]; const m = mat(r.mat);
    const n = (s) => Number(String(s || '0').replace(',', '.'));
    const dl = n(f.delivered), ac = n(f.accepted), rj = n(f.rejected);
    if (!S.validDate(f.date)) e.date = 'c.dateFmt'; else if (App.daysTo(f.date) > 0) e.date = 'po.g.e.future';
    if (!(dl > 0)) e.delivered = 'po.g.e.delivered'; else if (dl > r.qty * 1.1) e.delivered = ['po.g.e.over', { q: num(r.qty), u: m.uom }];
    if (!(ac >= 0) || ac + rj !== dl) e.accepted = 'po.g.e.sum';
    if (rj > 0 && (f.reason || '').length < 5) e.reason = 'po.g.e.reason';
    if (rj > 0 && f.action === 'Accept with discount' && !(n(f.discount) > 0 && n(f.discount) <= 30)) e.discount = 'po.g.e.discount';
    if (!f.inspector) e.inspector = 'po.g.e.insp';
    const req = certReq(m, r);
    const miss = req.filter((c) => !f.checks.includes(c)); if (ac > 0 && miss.length) e.checks = ['po.g.e.checks', { c: miss.map((x) => tv(x)).join(', '), m: r.mat }];
    st.gerr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#po-grn'); return; }
    const gid = nextNo('GRN', 'GRN-2026-', 4);
    const g = { po: id, date: f.date, receiver: S.me(), inspector: f.inspector, lines: [[r.li, r.si, dl, ac, rj, f.reason || '']], checks: req.concat(['Biên bản giao nhận']).map((c) => [c, f.checks.includes(c), f.checks.includes(c) ? 'Checked' : 'Not checked']) };
    let msg = t('po.g.saved', { id: gid, q: num(ac), u: m.uom });
    if (rj > 0) {
      const nid = nextNo('NCR', 'NCR-2026-', 3); g.ncr = nid;
      D().ncrs[nid] = { grn: gid, po: id, mat: r.mat, qty: rj, action: f.action, discount: f.action === 'Accept with discount' ? n(f.discount) : null, raised: NOW, by: f.inspector, supplier: 'Sent to supplier by Gmail + portal · answer due ' + App.addDays(D().today, 3), status: 'Open', due: App.addDays(D().today, 3) };
      D().docs.push({ id: nid, type: 'NCR', title: `${m.name} · ${num(rj)} ${m.uom} rejected`, date: D().today, status: 'Open', mats: [r.mat], vendor: p.vendor, po: id });
      msg += t('po.g.ncr', { n: nid, a: tv(f.action) });
    }
    D().grns[gid] = g; p.lines[r.li].sched[r.si][2] = gid;
    if (r.ncr && !rj && D().ncrs[r.ncr]) { const nn = D().ncrs[r.ncr]; nn.status = 'Closed'; nn.supplier += ' · replaced on ' + gid; const nd = S.docOf(r.ncr); if (nd) nd.status = 'Closed · replaced'; msg += t('po.g.ncrClosed', { n: r.ncr }); }
    syncNcrSlots(id, p);
    D().docs.push({ id: gid, type: 'GRN', title: `${m.name} · ${num(ac)} ${m.uom} accepted`, date: f.date, status: rj ? 'Accepted with NCR' : 'Accepted', mats: [r.mat], vendor: p.vendor, po: id });
    d.status = openSlots(p).length ? 'Partially received' : 'Delivered'; d.note = noteFrom(p, d);
    st.grn = null; App.render(); App.toast(msg);
  }
  function ncrBlock(id) {
    const list = ncrsOf(id);
    if (!list.length) return block(t('po.ncr.title', { n: 0 }), App.emptyState(t('po.ncr.none'), t('po.ncr.noneN')));
    return block(t('po.ncr.title', { n: list.length }), `<ul class="plain ncr-list">${list.map((n) => `<li class="row-acts between"><span><b class="mono">${esc(n.id)}</b> ${mid(n.mat)} ${pill(n.status, n.status === 'Closed' ? 'success' : 'warning')}
      <div class="small">${num(n.qty)} ${esc(mat(n.mat).uom)} · ${esc(tv(n.action))}${n.discount ? ` ${num(n.discount)}%` : ''} · ${esc(n.grn)} · ${esc(t('po.ncr.raised', { d: n.raised, b: tv(n.by) }))}</div><div class="small muted">${esc(t('po.ncr.resp', { r: tvx(n.supplier) }))}</div>
      ${n.status !== 'Closed' ? `<div class="small tone-warning">${esc(t('po.ncr.blocks', { q: num(n.qty), u: mat(n.mat).uom }))}</div>` : ''}</span>
      ${n.status !== 'Closed' ? `<button class="btn btn-sm" data-po="ncr-close" data-id="${esc(n.id)}">${esc(t('po.ncr.close'))}</button>` : ''}</li>`).join('')}</ul>`);
  }
  function matchBlock(id, p) {
    const invs = invoicesOf(id);
    return block(t('po.m.title'), table([
      { h: t('c.mid'), r: (l) => mid(l.mat), w: '120px' },
      { h: t('po.m.poQty'), r: (l) => `${num(l.qty - (l.cancelled || 0))} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '110px' },
      { h: t('po.m.grn'), r: (l) => num(acceptedQty(p, p.lines.indexOf(l))), cls: 'num', w: '120px' },
      { h: t('po.m.inv'), r: (l) => num(invoicedQty(id, l)), cls: 'num', w: '110px' },
      { h: t('po.m.invs'), r: (l) => invs.filter((v) => v.lines.some((x) => x[0] === l.mat)).map((v) => `<a class="mono" href="#/invoices/${esc(v.id)}">${esc(v.id)}</a> ${pill(v.doc.status, /Matched|Ready|Paid/.test(v.doc.status) ? 'success' : /Blocked/.test(v.doc.status) ? 'danger' : 'warning')}`).join('<br>') || '—', w: 'minmax(200px,2fr)' },
      { h: t('po.m.still'), r: (l) => { const q = l.qty - (l.cancelled || 0) - invoicedQty(id, l); return q > 0 ? `${num(q)} ${esc(mat(l.mat).uom)}<div class="small muted">${vnd(q * l.price)}</div>` : '—'; }, cls: 'num', w: '150px' }
    ], p.lines, { label: t('po.m.label') }) + `<p class="small muted">${esc(t('po.m.note'))}</p>`);
  }
  function confirmBlock(id, p, d) {
    const c = p.confirm;
    const body = !c ? `<p class="small mt-0">${esc(t(d.status === 'Approved' ? 'po.cf.approved' : 'po.cf.after'))}</p>`
      : c.status === 'Confirmed' ? `<p class="mt-0">${pill('Confirmed', 'success')} ${esc(t('po.cf.by', { b: tv(c.by), a: c.at }))}${c.note ? ` · ${esc(tvx(c.note))}` : ''}</p>`
        : `<div class="alert alert-${c.status === 'Not confirmed' || c.status === 'Declined' ? 'danger' : 'warning'}" role="status"><b>${esc(tv(c.status))}.</b> ${esc(t('po.cf.sent', { d: c.sent }))}${c.note ? ` · ${esc(tvx(c.note))}` : ''}</div>`;
    const acts = d.status === 'Approved' ? `<button class="btn btn-sm btn-p" data-po="send">${esc(t('po.send'))}</button>` : c && c.status !== 'Confirmed' ? `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('po.remindMsg'))}">${esc(t('po.remind'))}</button><button class="btn btn-sm btn-p" data-po="confirm">${esc(t('po.recordConf'))}</button>` : '';
    return block(t('po.cf.title'), body + `<div class="row-acts">${acts}</div>`, { span: 6 });
  }
  function revBlock(id, p, d) {
    const pend = p.revs.find((r) => /Pending/.test(r.status)); const canCo = !/Draft|Pending|Cancelled|Closed/.test(d.status) && !pend;
    const list = p.revs.length ? `<ol class="plain rev-list">${p.revs.map((r) => `<li><b>Rev.${r.no}</b> ${pill(tvx(r.status), /Pending/.test(r.status) ? 'warning' : /Current|Approved/.test(r.status) ? 'success' : /Reject/.test(r.status) ? 'danger' : 'neutral')} <span class="small muted">${esc(r.at)} · ${esc(r.by)}</span><div class="small">${esc(tvx(r.diff))}</div>${r.reason ? `<div class="small muted">“${esc(r.reason)}”</div>` : ''}${r.approval && /Pending/.test(r.status) ? `<div class="small"><a href="#/approvals?id=${encodeURIComponent(r.approval)}">${esc(t('po.rv.openAp'))}</a> · ${esc(t('po.rv.approver'))}</div>` : ''}</li>`).join('')}</ol>` : `<p class="small muted mt-0">${esc(t('po.rv.none'))}</p>`;
    let form = '';
    if (st.co) {
      const f = st.co; const e = st.coErr;
      form = `<form id="po-co" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">${esc(t('po.co.h', { n: Math.max(0, ...p.revs.map((r) => r.no)) + 1 }))}</h3>
        ${p.lines.map((l, i) => { const lo = Math.max(receivedQty(p, i), invoicedQty(id, l)); const nx = sched(p).find((r) => r.li === i && !r.rec && !r.cx);
          return `<div class="form-grid">${S.field('pc', e, 'q' + i, t('po.co.qty', { m: l.mat, u: mat(l.mat).uom }), f['q' + i], { mode: 'decimal', hint: t('po.co.qtyHint', { n: num(l.qty), lo: num(lo) }) })}${nx ? S.field('pc', e, 'd' + i, t('po.co.date', { m: l.mat }), f['d' + i], { ph: 'dd/mm/yyyy', hint: t('po.co.now', { d: nx.due }) }) : ''}</div>`; }).join('')}
        ${S.field('pc', e, 'reason', t('po.co.reason'), f.reason, { area: true, req: true, hint: t('po.co.reasonHint') })}
        <p class="small muted mt-0">${esc(t('po.co.note'))}</p>
        <div class="row-acts"><button type="button" class="btn btn-sm" data-po="co-cancel">${esc(t('c.cancel'))}</button><button type="submit" class="btn btn-sm btn-p">${esc(t('po.co.create'))}</button></div></form>`;
    }
    return block(t('po.rv.title'), list + form, { span: 6, actions: canCo && !st.co ? `<button class="btn btn-sm" data-po="co-open">${esc(t('po.co.btn'))}</button>` : '' });
  }
  function saveCo(root, id, p, d) {
    const f = Object.assign(st.co, S.read(root, '#po-co')); const e = {}; const ch = [];
    p.lines.forEach((l, i) => {
      const q = Number(String(f['q' + i]).replace(',', '.')); const lo = Math.max(receivedQty(p, i), invoicedQty(id, l)); const nx = sched(p).find((r) => r.li === i && !r.rec && !r.cx);
      if (!(q >= 0) || String(f['q' + i]).trim() === '') e['q' + i] = 'po.co.e.qty'; else if (q < lo) e['q' + i] = ['po.co.e.below', { n: num(lo), u: mat(l.mat).uom }]; else if (q !== l.qty) ch.push({ i, qty: q });
      if (nx && f['d' + i] !== nx.due) { if (!S.validDate(f['d' + i])) e['d' + i] = 'c.dateFmt'; else ch.push({ i, si: nx.si, due: f['d' + i] }); }
    });
    if ((f.reason || '').length < 10) e.reason = 'po.co.e.reason';
    if (!Object.keys(e).length && !ch.length) e.reason = 'po.co.e.nothing';
    st.coErr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#po-co'); return; }
    const no = Math.max(0, ...p.revs.map((r) => r.no)) + 1; const before = value(p);
    const after = before + ch.filter((c) => c.qty != null).reduce((a, c) => a + (c.qty - p.lines[c.i].qty) * p.lines[c.i].price, 0);
    const diff = ch.map((c) => (c.qty != null ? `${p.lines[c.i].mat} qty ${num(p.lines[c.i].qty)} → ${num(c.qty)} ${mat(p.lines[c.i].mat).uom}` : `${p.lines[c.i].mat} delivery ${p.lines[c.i].sched[c.si][1]} → ${c.due}`)).join(' · ') + (after !== before ? ` · value ${vnd(before)} → ${vnd(after)} (${after > before ? '+' : '−'}${vnd(Math.abs(after - before))})` : ' · no value change');
    const rev = { no, at: NOW, by: S.me(), diff, reason: f.reason, change: ch };
    if (after > before) {
      const aid = `${id} Rev.${no}`; const appr = S.me() === 'Nguyễn Minh Anh' ? 'Đỗ Hoàng Nam' : 'Nguyễn Minh Anh';
      Object.assign(rev, { status: 'Pending approval', approval: aid });
      D().approvals.push({ id: aid, type: 'PO change order', title: `${short(d.title)} · ${diff.split(' · value')[0]}`, mats: d.mats, value: after, by: S.me(), step: 'Step 1 of 1', sla: App.addDays(D().today, 1) + ' 17:00', assignee: appr });
      D().approvalChains[aid] = [[`${S.me()} · Buyer`, 'Raised', NOW, f.reason], [`${appr} · ${appr === 'Đỗ Hoàng Nam' ? 'Finance Director' : 'Procurement Lead'}`, 'Waiting', 'SoD: raiser cannot approve', '']];
      App.toast(t('po.co.reapproval', { n: no, a: appr }));
    } else { applyRev(id, p, d, rev); App.toast(t('po.co.issued', { n: no })); }
    p.revs.unshift(rev); st.co = null; App.render();
  }
  function applyRev(id, p, d, rev) {
    (rev.change || []).forEach((c) => { const l = p.lines[c.i]; if (c.qty != null) { const open = l.sched.find((s) => !s[2] && !s[3] && !s[4]); const dq = c.qty - l.qty; if (open) open[0] += dq; else l.sched.push([dq, App.addDays(D().today, 7), null]); l.qty = c.qty; } if (c.due) l.sched[c.si][1] = c.due; });
    p.revs.forEach((r) => { if (/^Current/.test(r.status)) r.status = 'Superseded'; });
    rev.status = 'Current · awaiting supplier re-confirmation'; p.rev = rev.no;
    p.confirm = { status: 'Awaiting re-confirmation', sent: NOW, note: `Rev.${rev.no} sent by Gmail + portal` };
    d.value = value(p); d.qty = `${num(p.lines[0].qty)} ${mat(p.lines[0].mat).uom}`; d.note = (d.note || '').replace(/ · Rev\.\d pending/, '');
  }
  function cancelBlock(id, p, d) {
    const opens = p.lines.map((l, i) => [i, openQty(p, i)]).filter(([, q]) => q > 0);
    if (/Draft|Pending|Cancelled|Closed/.test(d.status)) return '';
    const recv = p.lines.reduce((a, l, i) => a + receivedQty(p, i), 0);
    if (!st.cx) return block(t('po.cx.title'), `<p class="small mt-0">${esc(opens.length ? t('po.cx.can') + (recv ? ' ' + t('po.cx.recv') : '') : t('po.cx.nothing'))}</p>`, { span: 6, actions: opens.length ? `<button class="btn btn-sm btn-d" data-po="cx-open">${esc(t('po.cx.btn'))}</button>` : '' });
    const f = st.cx; const e = st.cxErr;
    return block(t('po.cx.title2'), `<form id="po-cx" class="stack" novalidate>${S.field('px', e, 'scope', t('po.cx.scope'), f.scope, { options: [['all', t('po.cx.all') + (recv ? t('po.cx.allRecv') : '')]].concat(opens.map(([i, q]) => { const nc = openSlots(p).filter((r) => r.li === i && r.ncr).map((r) => r.ncr); return [String(i), t('po.cx.line', { i: i + 1, m: p.lines[i].mat, q: num(q), u: mat(p.lines[i].mat).uom }) + (nc.length ? ` (${nc.join(', ')})` : '')]; })) })}
      ${S.field('px', e, 'reason', t('po.co.reason'), f.reason, { area: true, req: true, hint: t('po.cx.reasonHint') })}
      <div class="row-acts"><button type="button" class="btn btn-sm" data-po="cx-cancel">${esc(t('c.back'))}</button><button type="submit" class="btn btn-sm btn-d">${esc(t('po.cx.title2'))}</button></div></form>`, { span: 6 });
  }
  function saveCx(root, id, p, d) {
    const f = Object.assign(st.cx, S.read(root, '#po-cx')); st.cxErr = {};
    if ((f.reason || '').length < 10) { st.cxErr.reason = 'po.co.e.reason'; App.render(); S.focusErr('#po-cx'); return; }
    const txt = [];
    p.lines.forEach((l, i) => { if (f.scope !== 'all' && +f.scope !== i) return; const q = openQty(p, i); if (!q) return; l.sched.forEach((s) => { if (!s[2] && !s[3]) s[3] = 'Cancelled'; }); l.cancelled = (l.cancelled || 0) + q; txt.push(`${l.mat} −${num(q)} ${mat(l.mat).uom}`); });
    const recv = p.lines.reduce((a, l, i) => a + receivedQty(p, i), 0);
    const allInv = p.lines.every((l, i) => invoicedQty(id, l) >= acceptedQty(p, i));
    d.status = recv ? (openSlots(p).length ? d.status : (!openNcr(id).length && allInv ? 'Closed' : 'Delivered')) : (p.lines.every((l) => l.cancelled >= l.qty) ? 'Cancelled' : d.status);
    d.note = noteFrom(p, d); d.value = value(p);
    p.revs.forEach((r) => { if (/^Current/.test(r.status)) r.status = 'Superseded'; });
    const no = Math.max(0, ...p.revs.map((r) => r.no)) + 1; p.revs.unshift({ no, status: 'Current · cancellation sent to supplier', at: NOW, by: S.me(), diff: 'Cancelled open qty: ' + txt.join(' · '), reason: f.reason }); p.rev = no;
    st.cx = null; App.render(); App.toast(t('po.cx.done', { x: txt.join(' · ') }));
  }
  function headerBlock(id, p, d) {
    return block(t('po.hd.title'), `<dl class="dl"><dt>${esc(t('c.vendor'))}</dt><dd>${vlink(p.vendor)}<div class="small muted">${esc(t('po.mst', { v: (App.vendor(p.vendor) || {}).mst || '—' }))}</div></dd><dt>${esc(t('po.hd.source'))}</dt><dd>${[p.pr ? 'PR ' + S.prLink(p.pr) : '', p.tender ? esc(t('tn.c.tender')) + ' ' + S.tndLink(p.tender) : '', p.contract ? esc(t('po.ref.contract')) + ' ' + doclink(p.contract, 'contracts') : ''].filter(Boolean).join(' · ') || '—'}</dd>
      <dt>${esc(t('po.hd.terms'))}</dt><dd>${esc(tv(p.terms))}</dd><dt>${esc(t('po.hd.site'))}</dt><dd>${esc(p.site)}</dd><dt>VAT</dt><dd>${[...new Set(p.lines.map((l) => S.vatLabel(mat(l.mat).vat)))].map(esc).join(' · ')}</dd><dt>${esc(t('po.hd.buyer'))}</dt><dd>${esc(p.buyer)}</dd><dt>${esc(t('po.hd.rev'))}</dt><dd>Rev.${p.rev}</dd><dt>${esc(t('c.date'))}</dt><dd>${esc(d.date)}</dd></dl>`, { span: 6 });
  }

  /* ---------- F-69 printable PO (R-21) ---------- */
  function printDoc(d, cls) {
    const p = det(d.id); const v = App.vendor(p.vendor); const C = D().company || {}; const tt = vatSplit(p);
    return `<article class="card po-doc${cls ? ' ' + cls : ''}" aria-label="${esc(t('po.pr.doclabel'))}"><div class="row-acts between"><div>${C.name ? `<b>${esc(C.name)}</b>` : ''}${C.mst || C.address ? `<div class="small">${[C.mst ? 'MST ' + esc(C.mst) : '', esc(C.address || '')].filter(Boolean).join(' · ')}</div>` : ''}</div><div class="num"><b class="mono">${esc(d.id)} · Rev.${p.rev}</b><div class="small">${esc(t('po.pr.date', { d: d.date }))}</div></div></div>
        <h2 class="po-title">${esc(t('po.pr.doc'))}</h2>
        <div class="grid"><div><h3 class="h-sub mt-0">${esc(t('po.pr.supplier'))}</h3><p class="small mt-0"><b>${esc(v.name)}</b><br>MST ${esc(v.mst)}<br>${esc(v.address || '')}<br>${esc(v.contact)} · ${esc(v.email)}</p></div>
          <div><h3 class="h-sub mt-0">${esc(t('po.pr.delivery'))}</h3><p class="small mt-0">${esc(p.site)}<br>${sched(p).filter((r) => !r.cx).map((r) => `${esc(r.mat)}: ${num(r.qty)} ${esc(mat(r.mat).uom)} · ${esc(r.due)}`).join('<br>')}</p></div></div>
        ${table([{ h: t('c.mid'), r: (l) => `<span class="mono">${esc(l.mat)}</span>`, w: '110px' }, { h: t('po.pr.desc'), r: (l) => esc(mat(l.mat).name), w: 'minmax(160px,2fr)' }, { h: t('po.pr.uom'), r: (l) => esc(mat(l.mat).uom), w: '70px' },
          { h: t('po.pr.qty'), r: (l) => num(l.qty - (l.cancelled || 0)), cls: 'num', w: '90px' }, { h: t('po.pr.unit'), r: (l) => vnd(l.price), cls: 'num', w: '130px' }, { h: 'VAT', r: (l) => mat(l.mat).vat + '%', cls: 'num', w: '60px' }, { h: t('po.pr.amount'), r: (l) => vnd(lineNet(l)), cls: 'num', w: '150px' }], p.lines, { label: t('po.l.table'), cls: 'po-print-tbl' })}
        <dl class="dl dl-tot po-tot mt">${Object.entries(tt.by).map(([r, x]) => `<dt>${esc(t('po.pr.vatOn', { r, v: vnd(x) }))}</dt><dd>${vnd(x * r / 100)}</dd>`).join('')}<dt>${esc(t('po.pr.net'))}</dt><dd>${vnd(tt.net)}</dd><dt>${esc(t('po.pr.gross'))}</dt><dd><b>${vnd(tt.gross)}</b></dd></dl>
        <h3 class="h-sub">${esc(t('po.pr.terms'))}</h3><p class="small mt-0">${esc(t('po.pr.termsV', { t: tv(p.terms) }))}</p>
        <div class="grid po-sign"><div class="small"><b>${esc(t('po.pr.buyer'))}</b><br>${esc(p.buyer)}<br>${pill(stepOf(d.status) >= 2 ? t('po.pr.signed', { d: d.date }) : t('po.pr.notSigned'), stepOf(d.status) >= 2 ? 'success' : 'neutral')}</div>
          <div class="small"><b>${esc(t('po.pr.seller'))}</b><br>${esc(v.contact)}<br>${pill(p.confirm && p.confirm.status === 'Confirmed' ? t('po.pr.conf', { d: p.confirm.at.slice(0, 10) }) : t('po.pr.await'), p.confirm && p.confirm.status === 'Confirmed' ? 'success' : 'warning')}</div></div></article>`;
  }
  const printActs = (d, p) => `<button class="btn" data-po="print">${esc(t('po.pr.btn'))}</button><button class="btn btn-p" data-act="toast" data-msg="${esc(t('po.pr.pdf', { id: d.id, r: p.rev }))}">${esc(t('po.pr.dl'))}</button>`;
  /* Supplier portal reuses the print page (#/supplier/pos/<id>/print) */
  function printPage(d, base = '#/po') {
    const p = det(d.id);
    return `<div class="page-h no-print"><div><div class="crumbs small muted"><a href="${base}">${esc(t('nav.po'))}</a> / <a href="${base}/${esc(d.id)}">${esc(d.id)}</a> / ${esc(t('po.d.print'))}</div><h1>${esc(t('po.pr.title', { id: d.id, r: p.rev }))}</h1><div class="sub">${esc(t('po.pr.sub'))}</div></div>
      <div class="acts">${printActs(d, p)}</div></div>${printDoc(d)}`;
  }

  const DSUBS = [['', 'po.d.overview'], ['receipts', 'po.d.receipts'], ['match', 'po.d.match'], ['revisions', 'po.d.revisions'], ['print', 'po.d.print'], ['files', 'po.d.files']];
  function detail(d, subArg) {
    const id = d.id; const p = det(id); const v = App.vendor(p.vendor); const tt = vatSplit(p); const cur = App.sub(DSUBS, subArg || '');
    const acc = p.lines.reduce((a, l, i) => a + acceptedQty(p, i) * l.price, 0); const invs = invoicesOf(id); const okInv = invs.filter((x) => /Matched|Ready|Paid/.test(x.doc.status)); const sub = (x) => x.lines.reduce((a, y) => a + y[2] * y[3], 0);
    const inv = okInv.reduce((a, x) => a + sub(x), 0); const exc = invs.filter((x) => !/Matched|Ready|Paid/.test(x.doc.status)).reduce((a, x) => a + sub(x), 0);
    const alerts = (v && v.risk === 'High' ? `<div class="alert alert-warning" role="status"><b>${esc(t('po.hiRisk'))}</b> ${(v.riskReasons || []).map((x) => esc(tv(x))).join(' · ')}</div>` : '')
      + (p.confirm && p.confirm.status === 'Not confirmed' ? `<div class="alert alert-danger" role="alert"><b>${esc(t('po.notConfBy', { v: App.vshort(v) }))}</b> ${esc(tvx(p.confirm.note || ''))}</div>` : '');
    const kpis = [kpi(t('po.k.value'), vnd(tt.net), `Rev.${p.rev}`), kpi('VAT', vnd(tt.vat), esc(Object.keys(tt.by).map((r) => r + '%').join(' + '))), kpi(t('po.k.total'), vnd(tt.gross), ty(tt.gross)),
      kpi(t('po.k.accepted'), pct(tt.net ? acc / tt.net * 100 : 0, 0), vnd(acc)), kpi(t('po.k.invoiced'), pct(tt.net ? inv / tt.net * 100 : 0, 0), vnd(inv) + (exc ? `<div class="small tone-warning">${esc(t('po.k.exc', { v: vnd(exc) }))}</div>` : ''))];
    let blocks;
    if (cur === 'receipts') blocks = [schedBlock(id, p, d), ncrBlock(id)];
    else if (cur === 'match') blocks = [matchBlock(id, p)];
    else if (cur === 'revisions') blocks = [revBlock(id, p, d), cancelBlock(id, p, d) || confirmBlock(id, p, d)];
    else if (cur === 'print') blocks = [printDoc(d, 'blk s-12')];
    else if (cur === 'files') blocks = [S.files('pof', p.files, d.mats, st.up, ['Signed PO', 'Mill certificate', 'Biên bản giao nhận', 'Specification / drawing', 'Other'], { block: true })];
    else blocks = [linesBlock(id, p, d), headerBlock(id, p, d), confirmBlock(id, p, d)];
    const canRecv = /Sent|Confirmed|Partially/.test(d.status) && sched(p).some((r) => !r.rec && !r.cx);
    return layout({
      crumbs: `<a href="#/po">${esc(t('nav.po'))}</a> / ${esc(id)}`, titleHtml: `<span class="mono">${esc(id)}</span> <span class="small muted">Rev.${p.rev}</span> ${esc(d.title)}`,
      subtitle: `${v ? esc(v.name) : ''} · ${pill(d.status, tone(d.status))}${d.note ? ` · <span class="small">${esc(tvx(d.note))}</span>` : ''}`,
      actions: cur === 'print' ? printActs(d, p) : `<a class="btn" href="#/po/${esc(id)}/print">${esc(t('po.print'))}</a>${canRecv && cur !== 'receipts' ? `<button class="btn btn-p" data-po="grn-open">${esc(t('po.grnOpen'))}</button>` : ''}`,
      alerts: App.unknownSub(DSUBS, subArg) + alerts, kpis, subnav: App.subnav('po/' + id, DSUBS, cur), blocks
    });
  }

  /* Supplier confirmation shared by the PO screen and the supplier portal (F-92). A contract release is drawn from the contract on confirmation. */
  function confirmPo(id, by) {
    const p = det(id); const d = S.docOf(id); const v = App.vendor(p.vendor); const re = p.confirm && p.confirm.status === 'Awaiting re-confirmation';
    p.confirm = { status: 'Confirmed', by: by || v.contact + ' (portal)', at: NOW, note: re ? `Rev.${p.rev} re-confirmed` : '' };
    if (/^Sent/.test(d.status)) d.status = 'Confirmed';
    p.revs.forEach((r) => { if (/awaiting supplier re-confirmation/.test(r.status)) r.status = 'Current · re-confirmed by supplier ' + D().today; });
    if (/overdue|Confirm within/.test(d.note || '')) d.note = '';
    D().notifications.filter((n) => n.doc === id).forEach((n) => { n.read = true; });
    const c = p.contract && D().contracts.find((x) => x.id === p.contract);
    if (c && !re && !c.releases.some((r) => r[0] === id)) p.lines.forEach((l) => { const cl = c.lines.find((x) => x.mat === l.mat); if (cl) { cl.released += l.qty; c.releases.push([id, l.mat, l.qty, l.price, d.date]); } });
    return v;
  }
  function declinePo(id, reason, by) {
    const p = det(id); const d = S.docOf(id);
    p.confirm = { status: 'Declined', sent: (p.confirm && p.confirm.sent) || NOW, note: `Declined by ${by} · ${reason}` }; d.status = 'Sent · declined by supplier'; d.note = 'Declined: ' + reason;
    D().notifications.unshift({ id: 'N-' + (900 + D().notifications.length), type: 'PO declined', k: 'n.poDeclined', p: { id, v: App.vshort(App.vendor(p.vendor)), r: reason }, text: `${id} declined by ${App.vshort(App.vendor(p.vendor))}: ${reason}`, doc: id, mats: d.mats, at: NOW, read: false, action: 'Open', href: '#/po/' + id });
  }
  App.po = {
    det, sched: (id) => sched(det(id)), openSlots: (id) => openSlots(det(id)), invoicesOf, vatSplit: (id) => vatSplit(det(id)), print: printPage, confirm: confirmPo, decline: declinePo, ncrsOf,
    onDecide(a, dcs) {
      if (a.type === 'Delivery date change') { const r = a.req; const p = det(r.po); if (p && dcs === 'Approved') { p.lines[r.li].sched[r.si][1] = r.to; } r.status = dcs === 'Approved' ? 'Accepted by buyer ' + D().today : dcs; return; }
      if (a.type === 'PO approval') { const d = S.docOf(a.id); if (d) d.status = dcs === 'Approved' ? 'Approved' : 'Draft'; return; }
      if (a.type !== 'PO change order') return;
      const [id, r] = a.id.split(' Rev.'); const p = det(id); const d = S.docOf(id); if (!p) return; const rev = p.revs.find((x) => x.no === +r); if (!rev) return;
      if (dcs === 'Approved') { applyRev(id, p, d, rev); rev.status = 'Approved · awaiting supplier re-confirmation'; }
      else rev.status = dcs;
    }
  };

  const LSUBS = [['', 'po.sub.list'], ['new', 'po.sub.new']];
  App.page('po', {
    titleKey: 'nav.po', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, subArg) {
      const parts = (subArg || '').split('/'); const head = parts[0] || '';
      const isNew = head === 'new' || (!head && (p.tender || p.contract || p.pr));
      const key = (isNew ? 'new' + JSON.stringify(p) : head || 'list');
      if (st.cur !== key) { st.cur = key; st.grn = null; st.co = null; st.cx = null; st.up = null; st.gerr = {}; st.coErr = {}; st.cxErr = {}; st.nf = null; st.nerr = {}; }
      const all = docs(); all.forEach((d) => det(d.id));
      const listLayout = (blocks, cur, qs) => {
        const notConf = all.filter((d) => (det(d.id).confirm || {}).status === 'Not confirmed'); const ncrPo = all.filter((d) => openNcr(d.id).length); const open = all.filter((d) => !/Closed|Cancelled|Draft/.test(d.status));
        return layout({
          title: t('nav.po'), subtitle: esc(t('po.subtitle')), crumbs: cur === 'draft' ? `<a href="#/po">${esc(t('nav.po'))}</a> / ${esc(st.nf.id)}` : '',
          titleHtml: cur === 'draft' ? `${esc(t('po.createDraft'))} <span class="mono">${esc(st.nf.id)}</span>` : '',
          actions: cur ? '' : `<a class="btn btn-p" href="#/po/new">${esc(t('po.new'))}</a>`,
          kpis: [kpi(t('po.k.pos'), num(D().poStats.total), esc(t('c.inSample', { n: all.length }))), kpi(t('po.k.open'), ty(open.reduce((a, d) => a + d.value, 0)), esc(t('po.k.openN', { n: open.length }))),
            kpi(t('po.k.notConf'), String(notConf.length), esc(notConf.map((d) => d.id).join(', ') || t('c.none')), notConf.length ? 'danger' : ''), kpi(t('po.k.ncr'), String(ncrPo.length), esc(ncrPo.map((d) => d.id).join(', ') || t('c.none')), ncrPo.length ? 'warning' : '')],
          alerts: cur === 'new' || cur === 'draft' ? `<p class="small muted m-0">${esc(t('po.createSub', { me: S.me() }))}</p>` : '',
          subnav: cur === 'draft' ? '' : App.subnav('po', LSUBS, cur, qs), blocks
        });
      };
      if (isNew) { const nsrc = ['pr', 'tender', 'contract'].map((k) => p[k] || '').join('|'); if (st.nf && st.nfSrc !== nsrc) st.nf = null; st.nfSrc = nsrc; if (!st.nf) st.nf = initNew(p); const qs = ['pr', 'tender', 'contract'].filter((k) => p[k]).map((k) => k + '=' + encodeURIComponent(p[k])).join('&'); return listLayout(newBlocks(), 'new', qs); }
      if (head) {
        const d = all.find((x) => x.id === head); if (!d) return notFound(head);
        if (d.status === 'Draft') { if (st.nf && st.nf.id !== head) st.nf = null; st.nfSrc = null; if (!st.nf) st.nf = initNew(p, head); return listLayout(newBlocks(), 'draft'); }
        return detail(d, parts.slice(1).join('/'));
      }
      if (p.q != null && p.q !== st.lastQ) { st.q = p.q; st.lastQ = p.q; st.chip = 'all'; }
      return listLayout([listBlock(all)], '');
    },
    mount(root) {
      const cur = () => { const id = (location.hash.split('/')[2] || '').split('?')[0]; const d = S.docOf(id); return d && d.type === 'PO' ? [id, det(id), d] : [null]; };
      root.addEventListener('mousedown', (e) => { if (e.target.closest('button[type=submit], [data-po=save-draft]')) st.hold = true; });
      root.addEventListener('input', (e) => { if (e.target.dataset.pof === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('po-q'); i.focus(); i.setSelectionRange(pos, pos); } });
      root.addEventListener('change', (e) => {
        const k = e.target.dataset.pof; if (k === 'vendor' || k === 'site') { st[k] = e.target.value; App.render(); return; }
        const pn = e.target.dataset.pn; if (!pn || !st.nf) return;
        if (pn === 'ref') { const f = build(st.nf.src, e.target.value); f.id = (existingFor(f).find((d) => d.status === 'Draft') || {}).id; st.nf = f; st.nerr = {}; App.render(); document.getElementById('pn-ref').focus(); return; }
        if (pn === 'vendor') { readNew(root); if (st.nf.src === 'tender') { st.nf = build('tender', st.nf.ref, e.target.value); } else { st.nf.vendor = e.target.value; if (!st.nf.termsEdited) st.nf.terms = ((App.vendor(st.nf.vendor) || {}).terms || '30 days').split(' ·')[0].replace(/^(\d+) days$/, '$1 days after invoice'); } App.render(); document.getElementById('pn-vendor').focus(); return; }
        readNew(root); if (st.hold) { st.hold = false; return; } const id = e.target.id; App.render(); const x = document.getElementById(id); x && x.focus();
      });
      root.addEventListener('submit', (e) => {
        const fid = e.target.id; if (!['po-new', 'po-grn', 'po-co', 'po-cx', 'pof-up'].includes(fid)) return; e.preventDefault(); st.hold = false;
        if (fid === 'po-new') return saveNew(root, true);
        const [id, p, d] = cur(); if (!id) return;
        if (fid === 'po-grn') saveGrn(root, id, p, d); else if (fid === 'po-co') saveCo(root, id, p, d); else if (fid === 'po-cx') saveCx(root, id, p, d);
        else { st.up = S.upload(root, 'pof', p.files); App.render(); }
      });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-po], [data-files]'); if (!b) return;
        if (b.dataset.files === 'open') { st.up = { errs: {} }; App.render(); const x = document.getElementById('pof-up-name'); x && x.focus(); return; }
        if (b.dataset.files === 'cancel') { st.up = null; App.render(); return; }
        const a = b.dataset.po; const [id, p, d] = cur();
        const focus = (sel) => { const x = document.querySelector(sel); if (x) { x.scrollIntoView({ block: 'center' }); x.focus({ preventScroll: true }); } };
        if (a === 'chip') { st.chip = b.dataset.k; App.render(); }
        else if (a === 'src') { st.nf = build(b.dataset.k, b.dataset.k === 'pr' ? 'PR-2026-0436' : b.dataset.k === 'tender' ? (awardedTenders()[0] || {}).id : (activeCts()[0] || {}).id); st.nerr = {}; App.render(); }
        else if (a === 'save-draft') { st.hold = false; saveNew(root, false); }
        else if (a === 'print') window.print();
        else if (!id) return;
        else if (a === 'grn-open') {
          st.grn = { date: D().today, delivered: '', accepted: '', rejected: '0', inspector: 'Hồ Thị Thanh (QC)', reason: '', action: 'Return to vendor', discount: '', checks: [] }; st.gerr = {};
          const h = '#/po/' + id + '/receipts'; if (location.hash !== h) location.hash = h; else App.render();
          setTimeout(() => focus('#pg-slot'), 0);
        }
        else if (a === 'grn-cancel') { st.grn = null; App.render(); }
        else if (a === 'co-open') { st.co = { reason: '' }; p.lines.forEach((l, i) => { st.co['q' + i] = String(l.qty); const nx = sched(p).find((r) => r.li === i && !r.rec && !r.cx); if (nx) st.co['d' + i] = nx.due; }); st.coErr = {}; App.render(); focus('#pc-q0'); }
        else if (a === 'co-cancel') { st.co = null; App.render(); }
        else if (a === 'cx-open') { st.cx = { scope: 'all', reason: '' }; st.cxErr = {}; App.render(); focus('#px-scope'); }
        else if (a === 'cx-cancel') { st.cx = null; App.render(); }
        else if (a === 'send') { d.status = 'Sent · not confirmed'; p.confirm = { status: 'Not confirmed', sent: NOW, note: 'Reminder at 48 h · escalation to the buyer at 72 h' }; if (!p.revs.length) p.revs = [{ no: 0, status: 'Current', at: NOW, by: S.me(), diff: 'Original issue', reason: '' }]; App.render(); App.toast(t('po.sentMsg', { id, v: App.vshort(App.vendor(p.vendor)), r: p.rev })); }
        else if (a === 'confirm') { const v = confirmPo(id); App.render(); App.toast(t('po.confMsg', { id, v: v.contact })); }
        else if (a === 'ncr-close') { const n = D().ncrs[b.dataset.id]; n.status = 'Closed'; n.supplier += ' · closed ' + D().today; const nd = S.docOf(b.dataset.id); if (nd) nd.status = n.action === 'Accept with discount' ? 'Closed · accepted with discount' : 'Closed'; if (n.action === 'Accept with discount') { const g = D().grns[n.grn]; const gl = g && g.lines.find((x) => x[4]); if (gl) { gl[3] += gl[4]; gl[4] = 0; } } syncNcrSlots(id, p); if (/Partially/.test(d.status) && !openSlots(p).length) d.status = 'Delivered'; d.note = noteFrom(p, d); App.render(); App.toast(t('po.ncr.closed', { id: b.dataset.id })); }
      });
    }
  });
})();
