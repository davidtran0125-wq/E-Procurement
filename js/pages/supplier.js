/* Module 15 · Supplier portal (batch 3 layout) — F-87 overview & action list, F-88..F-91 invitations to bid (sealed bid by Material ID line, bid security, documents,
   Q&A by line, addendum acknowledgment, commitments + privacy consent, submit / revise / withdraw with receipt no. until close), F-92 PO confirm / decline / re-confirm,
   F-93 deliveries (ASN, date-change request, GRNs), F-94 results, contracts & certificates, F-95 e-invoice submission & status, F-96 NCR response,
   F-97 company profile & MST / bank change, F-98 Material IDs offered & onboarding checklist.
   A supplier only ever reads its own vendor's records (VID = signed-in user's vendor); other bidders' prices are never shown.
   Routes (sub-functions, docs/ui-guidelines.md §7):
   #/supplier · /invitations(/results) · /invitations/<TND>(/bid|/qa|/results) · /quotations(/spot) · /pos · /pos/<PO>(/deliveries|/ncr|/invoices|/print)
   /deliveries(/receipts|/ncr) · /invoices(/new) · /contracts · /certificates(/upload) · /scorecard(/trend) · /profile(/bank|/onboarding|/materials) */
(function () {
  const { esc, num, pct, vnd, pill, table, kpi, block, layout, t, tv } = App;
  const S = App.src;
  const D = () => window.DATA;
  const clock = () => App.now();
  const NOWD = new Date(2026, 10, 2, 10, 30);
  const tvx = (s) => App.tvx(s);

  I18N.add({
    'sp.title': ['Supplier portal', 'Cổng nhà cung cấp'],
    'sp.notFound': ['{what} {id} was not found in your portal.', 'Không tìm thấy {what} {id} trong cổng của bạn.'], 'sp.w.inv': ['Invitation', 'Thư mời'], 'sp.w.po': ['Purchase order', 'Đơn đặt hàng'],
    'sp.backInv': ['Back to invitations', 'Về thư mời thầu'], 'sp.backPo': ['Back to purchase orders', 'Về đơn đặt hàng'],
    'sp.ov.sub': ['{id} · MST {mst} · signed in as {me} · last sign-in {at}', '{id} · MST {mst} · đăng nhập: {me} · lần trước {at}'],
    'sp.k.openInv': ['Open invitations', 'Thư mời đang mở'], 'sp.k.sealed': ['Sealed bids', 'Hồ sơ niêm phong'], 'sp.k.sealedN': ['Submitted, not yet opened', 'Đã nộp, chưa mở'],
    'sp.k.openPos': ['Open POs', 'PO đang mở'], 'sp.k.otif': ['My OTIF', 'OTIF của tôi'], 'sp.k.otifN': ['Accepted qty · target 95%', 'SL chấp nhận · mục tiêu 95%'], 'sp.k.score': ['Scorecard', 'Bảng điểm'],
    'sp.act.title': ['Action needed ({n})', 'Việc cần làm ({n})'], 'sp.act.none': ['Nothing to do', 'Không có việc cần làm'], 'sp.act.noneN': ['You are up to date.', 'Bạn đã xử lý hết.'],
    'sp.act.confirm': ['Confirm or decline {id}', 'Xác nhận hoặc từ chối {id}'], 'sp.act.confirmN': ['Within 48 h of sending', 'Trong 48 giờ kể từ khi gửi'],
    'sp.act.reconf': ['Re-confirm {id} Rev.{r}', 'Xác nhận lại {id} Rev.{r}'], 'sp.act.reconfN': ['Revision approved by the buyer', 'Người mua đã duyệt sửa đổi'],
    'sp.act.ack': ['Acknowledge {id} addendum {no}', 'Xác nhận phụ lục {no} của {id}'], 'sp.act.closes': ['Closes {d}', 'Đóng thầu {d}'],
    'sp.act.bid': ['Submit your bid for {id}', 'Nộp hồ sơ dự thầu {id}'], 'sp.act.ncr': ['Respond to {id}', 'Phản hồi {id}'],
    'sp.act.cert': ['Upload renewal · {t}', 'Tải lên bản gia hạn · {t}'], 'sp.act.certN': ['Expires {d}', 'Hết hạn {d}'],
    'sp.act.ct': ['{id} expires {d}', '{id} hết hạn {d}'], 'sp.act.ctN': ['Talk to your buyer about renewal', 'Trao đổi với người mua về gia hạn'],
    'sp.notices': ['Notifications', 'Thông báo'],
    'sp.left': ['{d} d {h} h left', 'còn {d} ngày {h} giờ'], 'sp.closed': ['Closed', 'Đã đóng'],
    'sp.inv.sub': ['Sealed bids per Material ID line · you only see your own prices', 'Hồ sơ niêm phong theo dòng mã vật tư · bạn chỉ thấy giá của mình'],
    'sp.inv.list': ['Invitations', 'Thư mời'], 'sp.inv.results': ['Result notices', 'Thông báo kết quả'],
    'sp.inv.title': ['Invitations ({n})', 'Thư mời ({n})'], 'sp.inv.none': ['No invitations', 'Chưa có thư mời'],
    'sp.c.tender': ['Tender', 'Gói thầu'], 'sp.c.closes': ['Closes', 'Đóng thầu'], 'sp.c.myBid': ['My bid', 'Hồ sơ của tôi'], 'sp.c.tStatus': ['Tender status', 'Trạng thái gói thầu'],
    'sp.k.awarded': ['Awarded to me', 'Trúng thầu'], 'sp.k.results': ['Result notices', 'Thông báo kết quả'],
    'sp.res.rank': ['Your rank: {r} of {n}', 'Thứ hạng của bạn: {r}/{n}'], 'sp.res.notice': ['notice {d}', 'thông báo {d}'], 'sp.res.none': ['No results yet', 'Chưa có kết quả'],
    'sp.res.note': ['Only your own rank is shown. Other bidders\' names and prices are not disclosed.', 'Chỉ hiển thị thứ hạng của bạn. Tên và giá của nhà thầu khác không được công bố.'],
    'sp.d.overview': ['Overview', 'Tổng quan'], 'sp.d.bid': ['My bid', 'Hồ sơ dự thầu'], 'sp.d.qa': ['Q&A & addenda', 'Hỏi đáp & phụ lục'], 'sp.d.results': ['Result', 'Kết quả'],
    'sp.d.sub': ['{m} · closes {d}', '{m} · đóng thầu {d}'], 'sp.k.quoted': ['Lines quoted', 'Dòng đã chào giá'], 'sp.k.total': ['My total excl. VAT', 'Tổng chưa VAT của tôi'],
    'sp.k.receipt': ['Receipt', 'Biên nhận'], 'sp.k.left': ['Time left', 'Thời gian còn lại'], 'sp.k.addenda': ['Addenda to acknowledge', 'Phụ lục cần xác nhận'],
    'sp.lines': ['Tender lines', 'Các dòng gói thầu'], 'sp.c.qty': ['Qty', 'SL'], 'sp.goBid': ['Open my bid', 'Mở hồ sơ dự thầu'],
    'sp.rc.title': ['Receipt', 'Biên nhận'], 'sp.rc.ver': ['version {v}', 'phiên bản {v}'], 'sp.rc.sealed': ['Sealed {at} · the buyer cannot see your prices before the opening.', 'Niêm phong {at} · người mua không thấy giá trước khi mở thầu.'],
    'sp.rc.state': ['{s} {at}', '{s} {at}'], 'sp.rc.none': ['No receipt yet. A receipt number and timestamp are issued when you submit.', 'Chưa có biên nhận. Số biên nhận và thời điểm được cấp khi bạn nộp.'], 'sp.rc.hist': ['History', 'Lịch sử'],
    'sp.closedAlert': ['Bidding closed {d}. Submit, revise and withdraw are disabled.', 'Đã đóng thầu {d}. Không thể nộp, sửa hoặc rút hồ sơ.'],
    'sp.c.unit': ['Unit price excl. VAT', 'Đơn giá chưa VAT'], 'sp.c.lead': ['Lead time (days)', 'Thời gian giao (ngày)'], 'sp.c.nobid': ['No bid', 'Không chào'], 'sp.c.amount': ['Amount excl. VAT', 'Thành tiền chưa VAT'],
    'sp.lbl.price': ['Unit price excl. VAT, line {n}', 'Đơn giá chưa VAT, dòng {n}'], 'sp.lbl.lead': ['Lead time in days, line {n}', 'Thời gian giao (ngày), dòng {n}'], 'sp.lbl.lines': ['Bid lines', 'Các dòng chào giá'],
    'sp.vatLock': ['Locked · metals 10%', 'Cố định · kim loại 10%'],
    'sp.tot.on': ['VAT {r} on', 'VAT {r} trên'], 'sp.tot.plus': ['{a} + VAT {v}', '{a} + VAT {v}'], 'sp.tot.net': ['Total excl. VAT', 'Tổng chưa VAT'], 'sp.tot.gross': ['Total incl. VAT', 'Tổng gồm VAT'],
    'sp.sec.legend': ['Bid security (required {v} · valid ≥ 90 days after closing, until {d} or later)', 'Bảo đảm dự thầu (bắt buộc {v} · hiệu lực ≥ 90 ngày sau đóng thầu, đến {d} hoặc sau)'],
    'sp.sec.form': ['Form', 'Hình thức'], 'sp.sec.bank': ['Issuing bank', 'Ngân hàng phát hành'], 'sp.sec.ref': ['Guarantee / deposit ref.', 'Số bảo lãnh / đặt cọc'], 'sp.sec.amount': ['Amount (₫)', 'Số tiền (₫)'],
    'sp.sec.valid': ['Valid until', 'Hiệu lực đến'], 'sp.sec.file': ['File', 'Tệp'], 'sp.sec.fileHint': ['Upload or replace the scanned guarantee (PDF)', 'Tải lên hoặc thay bản quét bảo lãnh (PDF)'], 'sp.sec.filePh': ['e.g. BL-VCB-….pdf', 'vd. BL-VCB-….pdf'],
    'sp.sec.ret': ['Returned within 14 days if you are not awarded.', 'Hoàn trả trong 14 ngày nếu không trúng thầu.'],
    'sp.note': ['Note to the buyer', 'Ghi chú cho người mua'], 'sp.commit': ['Commitments', 'Cam kết'],
    'sp.c1': ['My bid is valid for {n} days after closing', 'Hồ sơ của tôi có hiệu lực {n} ngày sau đóng thầu'], 'sp.c2': ['My bid follows the tender documents and every addendum', 'Hồ sơ của tôi tuân thủ hồ sơ mời thầu và mọi phụ lục'],
    'sp.c3': ['I agree that ProcureLink processes the personal data in this bid under privacy notice {v} (Luật BVDLCN 91/2025/QH15)', 'Tôi đồng ý để ProcureLink xử lý dữ liệu cá nhân trong hồ sơ này theo thông báo bảo mật {v} (Luật BVDLCN 91/2025/QH15)'],
    'sp.withdraw': ['Withdraw bid', 'Rút hồ sơ'], 'sp.submitRev': ['Submit revised bid', 'Nộp hồ sơ sửa đổi'], 'sp.submit': ['Submit sealed bid', 'Nộp hồ sơ niêm phong'], 'sp.bidDraft': ['My bid · draft', 'Hồ sơ dự thầu · nháp'],
    'sp.add.title': ['Addenda ({n})', 'Phụ lục ({n})'], 'sp.add.no': ['Addendum {no} · {at}', 'Phụ lục {no} · {at}'], 'sp.add.mine': ['Acknowledged by you {at}', 'Bạn đã xác nhận {at}'],
    'sp.add.need': ['Not acknowledged yet — required before you submit or revise', 'Chưa xác nhận — bắt buộc trước khi nộp hoặc sửa hồ sơ'], 'sp.add.btn': ['Acknowledge', 'Xác nhận'], 'sp.add.none': ['No addenda published.', 'Chưa có phụ lục.'],
    'sp.qa.title': ['Q&A by line ({n})', 'Hỏi đáp theo dòng ({n})'], 'sp.qa.meta': ['Q{n} · {at} · published to all bidders (anonymous)', 'Câu {n} · {at} · công bố cho mọi nhà thầu (ẩn danh)'], 'sp.qa.answer': ['Answer: {a}', 'Trả lời: {a}'],
    'sp.qa.none': ['No published answers yet.', 'Chưa có câu trả lời được công bố.'], 'sp.qa.mine': ['Your questions waiting for an answer', 'Câu hỏi của bạn đang chờ trả lời'],
    'sp.qa.line': ['Material ID line', 'Dòng mã vật tư'], 'sp.qa.q': ['Your question', 'Câu hỏi của bạn'], 'sp.qa.hint': ['The answer is sent to every bidder without your name', 'Câu trả lời được gửi cho mọi nhà thầu, không kèm tên bạn'],
    'sp.qa.send': ['Send question', 'Gửi câu hỏi'], 'sp.qa.ask': ['Ask a question', 'Đặt câu hỏi'],
    'sp.res.title': ['Result notice', 'Thông báo kết quả'], 'sp.res.wait': ['No result yet. You are notified when the award is approved.', 'Chưa có kết quả. Bạn sẽ được thông báo khi kết quả trao thầu được duyệt.'],
    'sp.e.closed': ['Bidding is closed', 'Đã đóng thầu'], 'sp.e.price': ['Enter a unit price, or tick No bid.', 'Nhập đơn giá hoặc chọn Không chào.'], 'sp.e.lead': ['Enter the lead time in days.', 'Nhập thời gian giao (ngày).'],
    'sp.e.allNo': ['Quote at least one line, or decline the invitation.', 'Chào giá ít nhất một dòng hoặc từ chối thư mời.'], 'sp.e.ack': ['Acknowledge every addendum before you submit.', 'Xác nhận mọi phụ lục trước khi nộp.'],
    'sp.e.atLeast': ['At least {v}.', 'Tối thiểu {v}.'], 'sp.e.validUntil': ['Must be valid until {d} or later.', 'Phải còn hiệu lực đến {d} hoặc sau.'], 'sp.e.secFile': ['Attach the guarantee file.', 'Đính kèm tệp bảo lãnh.'],
    'sp.e.pdf': ['PDF only.', 'Chỉ nhận PDF.'], 'sp.e.commit': ['Tick all commitments, including the privacy consent.', 'Đánh dấu mọi cam kết, gồm cả đồng ý bảo mật.'],
    'sp.t.draft': ['Draft saved · not visible to the buyer', 'Đã lưu nháp · người mua không thấy'], 'sp.t.sub': ['Sealed bid submitted · receipt {rc} · {at}', 'Đã nộp hồ sơ niêm phong · biên nhận {rc} · {at}'],
    'sp.t.rev': ['Sealed bid revised · receipt {rc} · {at}', 'Đã sửa hồ sơ niêm phong · biên nhận {rc} · {at}'], 'sp.t.wd': ['Bid withdrawn · {at} · you can submit again until closing', 'Đã rút hồ sơ · {at} · bạn có thể nộp lại trước khi đóng thầu'],
    'sp.t.ack': ['Addendum {no} acknowledged', 'Đã xác nhận phụ lục {no}'], 'sp.t.q': ['Question sent · the answer is published to all bidders', 'Đã gửi câu hỏi · câu trả lời được công bố cho mọi nhà thầu'], 'sp.e.q': ['Write the question (at least 10 characters).', 'Viết câu hỏi (ít nhất 10 ký tự).'],
    'sp.q.sub': ['Your bids and quotations · prices excl. VAT · only your own prices are shown', 'Hồ sơ và báo giá của bạn · giá chưa VAT · chỉ hiển thị giá của bạn'],
    'sp.q.bids': ['Tender bids', 'Hồ sơ dự thầu'], 'sp.q.spot': ['Spot quotations', 'Báo giá lẻ'], 'sp.q.bidsN': ['Tender bids ({n})', 'Hồ sơ dự thầu ({n})'], 'sp.q.spotN': ['Spot quotations ({n})', 'Báo giá lẻ ({n})'],
    'sp.c.linesQ': ['Lines quoted', 'Dòng đã chào'], 'sp.c.receipt': ['Receipt', 'Biên nhận'], 'sp.c.quote': ['Quotation', 'Báo giá'], 'sp.c.sentValid': ['Sent · valid until', 'Ngày gửi · hiệu lực đến'],
    'sp.q.none': ['No quotations', 'Chưa có báo giá'], 'sp.q.rank': ['{o} · rank {r}/{n}', '{o} · hạng {r}/{n}'], 'sp.days': ['{n} d', '{n} ngày'],
    'sp.k.submitted': ['Submitted bids', 'Hồ sơ đã nộp'], 'sp.k.drafts': ['Drafts', 'Bản nháp'], 'sp.k.spot': ['Spot quotations', 'Báo giá lẻ'],
    'sp.po.sub': ['Confirm new POs within 48 h · every revision needs your re-confirmation', 'Xác nhận PO mới trong 48 giờ · mỗi sửa đổi cần bạn xác nhận lại'],
    'sp.po.title': ['Purchase orders ({n})', 'Đơn đặt hàng ({n})'], 'sp.c.delAcc': ['Ordered · delivered · accepted', 'Đặt · giao · chấp nhận'], 'sp.c.next': ['Next delivery', 'Lần giao tới'],
    'sp.po.confDec': ['Confirm / decline', 'Xác nhận / từ chối'], 'sp.po.reconf': ['Re-confirm', 'Xác nhận lại'], 'sp.po.reconfRev': ['Re-confirm Rev.{r}', 'Xác nhận lại Rev.{r}'],
    'sp.k.toConfirm': ['To confirm', 'Cần xác nhận'], 'sp.k.openVal': ['Open value excl. VAT', 'Giá trị mở chưa VAT'], 'sp.k.ncrOpen': ['Open NCRs', 'NCR đang mở'],
    'sp.pd.overview': ['Overview', 'Tổng quan'], 'sp.pd.deliv': ['Deliveries & ASN', 'Giao hàng & ASN'], 'sp.pd.ncr': ['NCR', 'NCR'], 'sp.pd.inv': ['Invoices', 'Hóa đơn'], 'sp.pd.print': ['Print', 'Bản in'],
    'sp.pd.sub': ['buyer {b} · {site}', 'người mua {b} · {site}'], 'sp.pd.terms': ['Payment terms', 'Điều khoản thanh toán'],
    'sp.k.poVal': ['Value excl. VAT', 'Giá trị chưa VAT'], 'sp.k.delivered': ['Delivered', 'Đã giao'], 'sp.k.accepted': ['Accepted', 'Chấp nhận'], 'sp.k.conf': ['Confirmation', 'Xác nhận'],
    'sp.cf.title': ['Your confirmation', 'Xác nhận của bạn'], 'sp.cf.by': ['by {b} · {at}', 'bởi {b} · {at}'], 'sp.cf.declined': ['Declined.', 'Đã từ chối.'],
    'sp.cf.wait': ['Waiting for your confirmation.', 'Đang chờ bạn xác nhận.'], 'sp.cf.waitRev': ['Rev.{r} waits for your re-confirmation.', 'Rev.{r} đang chờ bạn xác nhận lại.'], 'sp.cf.sent': ['Sent {d}', 'Gửi {d}'],
    'sp.cf.pend': ['Rev.{r} ({d}) is pending the buyer\'s approval. You will be asked to re-confirm once it is approved.', 'Rev.{r} ({d}) đang chờ người mua duyệt. Bạn sẽ được yêu cầu xác nhận lại sau khi duyệt.'],
    'sp.cf.decline': ['Decline', 'Từ chối'], 'sp.cf.confirm': ['Confirm PO', 'Xác nhận PO'], 'sp.cf.decTitle': ['Decline {id}', 'Từ chối {id}'], 'sp.cf.reason': ['Reason', 'Lý do'],
    'sp.cf.reasonHint': ['Sent to the buyer, e.g. "Không đủ hàng D20 trước 12/11"', 'Gửi cho người mua, vd. "Không đủ hàng D20 trước 12/11"'], 'sp.cf.decBtn': ['Decline PO', 'Từ chối PO'],
    'sp.e.reason': ['Give a reason of at least 10 characters.', 'Nêu lý do (ít nhất 10 ký tự).'],
    'sp.t.conf': ['{id} confirmed · buyer notified', 'Đã xác nhận {id} · đã báo người mua'], 'sp.t.reconf': ['{id} Rev.{r} re-confirmed', 'Đã xác nhận lại {id} Rev.{r}'], 'sp.t.dec': ['{id} declined · buyer notified', 'Đã từ chối {id} · đã báo người mua'],
    'sp.pl.title': ['Lines ({n})', 'Các dòng ({n})'], 'sp.revs': ['Revisions', 'Sửa đổi'], 'sp.revs.none': ['Original issue.', 'Bản phát hành gốc.'],
    'sp.sch': ['Delivery schedule', 'Lịch giao hàng'], 'sp.c.promised': ['Promised', 'Ngày hẹn'], 'sp.c.grn': ['Receipt', 'Phiếu nhận'], 'sp.c.accRej': ['Accepted · rejected', 'Chấp nhận · loại'], 'sp.c.otif': ['On time · in full', 'Đúng hạn · đủ SL'],
    'sp.repl': ['Replacement · {id}', 'Hàng thay thế · {id}'], 'sp.archived': ['Archived', 'Lưu trữ'], 'sp.open': ['Open', 'Đang mở'],
    'sp.pdf': ['Download PDF', 'Tải PDF'], 'sp.pdfMsg': ['{id}_Rev{r}.pdf downloaded', 'Đã tải {id}_Rev{r}.pdf'], 'sp.printBtn': ['Print', 'In'],
    'sp.pi.none': ['No invoices for this PO yet.', 'Chưa có hóa đơn cho PO này.'], 'sp.pi.new': ['Submit e-invoice', 'Nộp hóa đơn điện tử'],
    'sp.dl.sub': ['Advance shipping notices, delivery date changes, goods receipts and NCRs', 'Thông báo giao hàng (ASN), đổi ngày giao, phiếu nhập kho và NCR'],
    'sp.dl.open': ['Open deliveries', 'Giao hàng đang mở'], 'sp.dl.rec': ['Goods receipts', 'Phiếu nhập kho'], 'sp.dl.ncr': ['NCRs', 'NCR'],
    'sp.dl.openN': ['Open deliveries ({n})', 'Giao hàng đang mở ({n})'], 'sp.dl.none': ['No open deliveries', 'Không có lần giao đang mở'], 'sp.dl.recN': ['Recent goods receipts ({n})', 'Phiếu nhập kho gần đây ({n})'],
    'sp.k.asn': ['ASNs sent', 'ASN đã gửi'], 'sp.k.chg': ['Date changes pending', 'Đổi ngày đang chờ'], 'sp.k.grns': ['Goods receipts', 'Phiếu nhập kho'],
    'sp.asn.ship': ['ship {d} · {q}', 'giao {d} · {q}'], 'sp.asn.send': ['Send ASN', 'Gửi ASN'], 'sp.chg.btn': ['Change date', 'Đổi ngày'],
    'sp.asn.title': ['Advance shipping notice · {po} · {m}', 'Thông báo giao hàng · {po} · {m}'], 'sp.asn.date': ['Ship date', 'Ngày giao'], 'sp.asn.qty': ['Quantity ({u})', 'Số lượng ({u})'],
    'sp.asn.veh': ['Vehicle / driver', 'Xe / tài xế'], 'sp.asn.docs': ['CO/CQ file', 'Tệp CO/CQ'], 'sp.asn.docsSteel': ['Mill certificate required for steel', 'Bắt buộc chứng chỉ xuất xưởng với thép'], 'sp.asn.docsOpt': ['Optional', 'Không bắt buộc'],
    'sp.chg.title': ['Request a delivery date change · {po} · {m} (now {d})', 'Đề nghị đổi ngày giao · {po} · {m} (hiện tại {d})'], 'sp.chg.to': ['New date', 'Ngày mới'],
    'sp.chg.note': ['The buyer must accept. On-time is measured against the date the buyer accepted.', 'Người mua phải chấp nhận. Đúng hạn được tính theo ngày người mua đã chấp nhận.'], 'sp.chg.send': ['Send request', 'Gửi đề nghị'],
    'sp.e.past': ['Cannot be in the past.', 'Không được ở quá khứ.'], 'sp.e.range': ['Enter 1 – {n}.', 'Nhập 1 – {n}.'], 'sp.e.veh': ['Enter the vehicle and driver.', 'Nhập xe và tài xế.'], 'sp.e.mill': ['Attach the mill certificate (PDF).', 'Đính kèm chứng chỉ xuất xưởng (PDF).'],
    'sp.e.after': ['Choose a date after today.', 'Chọn ngày sau hôm nay.'], 'sp.e.same': ['Same as the current date.', 'Trùng với ngày hiện tại.'],
    'sp.t.asn': ['{id} sent to the buyer', 'Đã gửi {id} cho người mua'], 'sp.t.chg': ['Request sent to {b}', 'Đã gửi đề nghị cho {b}'],
    'sp.ncr.title': ['Non-conformance reports ({n})', 'Báo cáo không phù hợp ({n})'], 'sp.ncr.none': ['No NCRs', 'Không có NCR'], 'sp.ncr.respond': ['Respond', 'Phản hồi'],
    'sp.ncr.qty': ['{g} · {po} · delivered {d} · accepted {a} · rejected {r} {u}', '{g} · {po} · đã giao {d} · chấp nhận {a} · loại {r} {u}'],
    'sp.ncr.reason': ['Reason: {r} · inspector {i} · buyer asks: {a}', 'Lý do: {r} · người kiểm tra {i} · người mua yêu cầu: {a}'], 'sp.ncr.docs': ['Documents: {d}', 'Chứng từ: {d}'], 'sp.ncr.missing': ['missing', 'thiếu'],
    'sp.ncr.resp': ['Your response {at}: {o} — {c}', 'Phản hồi của bạn {at}: {o} — {c}'], 'sp.ncr.block': ['The rejected {n} {u} cannot be invoiced until the NCR is closed.', '{n} {u} bị loại không được xuất hóa đơn cho đến khi đóng NCR.'],
    'sp.ncr.form': ['Your response', 'Phản hồi của bạn'], 'sp.ncr.opt': ['Proposed action', 'Đề xuất xử lý'], 'sp.ncr.disc': ['Discount % (if offering a discount)', 'Chiết khấu % (nếu đề xuất chiết khấu)'],
    'sp.ncr.comment': ['Comment', 'Ghi chú'], 'sp.ncr.hint': ['e.g. "Gửi bổ sung CQ lô 2 ngày 04/11, thay 15 tấn nếu không đạt"', 'vd. "Gửi bổ sung CQ lô 2 ngày 04/11, thay 15 tấn nếu không đạt"'], 'sp.ncr.send': ['Send response', 'Gửi phản hồi'],
    'sp.e.comment': ['Write a comment of at least 10 characters.', 'Viết ghi chú (ít nhất 10 ký tự).'], 'sp.e.disc': ['Enter a discount of 1–30%.', 'Nhập chiết khấu 1–30%.'], 'sp.t.ncr': ['Response to {id} sent to the buyer', 'Đã gửi phản hồi {id} cho người mua'],
    'sp.iv.sub': ['E-invoices (XML + PDF) against your goods receipts · payment terms {t}', 'Hóa đơn điện tử (XML + PDF) theo phiếu nhập kho · điều khoản thanh toán {t}'],
    'sp.iv.list': ['My invoices', 'Hóa đơn của tôi'], 'sp.iv.new': ['Submit e-invoice', 'Nộp hóa đơn điện tử'], 'sp.iv.listN': ['My invoices ({n})', 'Hóa đơn của tôi ({n})'], 'sp.iv.none': ['No invoices yet', 'Chưa có hóa đơn'],
    'sp.k.ivOpen': ['In progress', 'Đang xử lý'], 'sp.k.ivReady': ['Ready / paid', 'Sẵn sàng / đã trả'], 'sp.k.billable': ['GRNs to invoice', 'Phiếu nhập chờ xuất HĐ'], 'sp.k.terms': ['Payment terms', 'Điều khoản thanh toán'],
    'sp.iv.line': ['{t} · {po} · {g} · {v} excl. VAT', '{t} · {po} · {g} · {v} chưa VAT'], 'sp.iv.dates': ['Invoice {d} · due {due}', 'Hóa đơn {d} · hạn {due}'],
    'sp.iv.exp': ['Exported to accounting {d} · payment run follows the due date', 'Đã chuyển kế toán {d} · thanh toán theo hạn'], 'sp.iv.repl': ['Replaces {o}', 'Thay thế {o}'], 'sp.iv.stLabel': ['{id} status', 'Trạng thái {id}'],
    'sp.iv.flow': ['Status: Submitted → Validated (legal checks, GDT lookup) → Matched (PO · GRN · invoice) → Ready for payment → Paid. Due date = invoice date + payment terms ({n} days). Rejected quantities under an open NCR cannot be invoiced.', 'Trạng thái: Đã nộp → Đã kiểm tra (pháp lý, tra cứu GDT) → Đã khớp (PO · GRN · hóa đơn) → Sẵn sàng thanh toán → Đã thanh toán. Hạn = ngày hóa đơn + điều khoản thanh toán ({n} ngày). SL bị loại theo NCR đang mở không được xuất hóa đơn.'],
    'sp.iv.form': ['Submit an e-invoice', 'Nộp hóa đơn điện tử'], 'sp.iv.grn': ['Goods receipt', 'Phiếu nhập kho'], 'sp.iv.grnOpt': ['{g} · {po} · {n} accepted, not invoiced', '{g} · {po} · {n} đã nhận, chưa xuất HĐ'],
    'sp.iv.type': ['Invoice type', 'Loại hóa đơn'], 'sp.iv.orig': ['Original invoice', 'Hóa đơn gốc'], 'sp.iv.xml': ['XML file', 'Tệp XML'], 'sp.iv.xmlHint': ['Signed XML from your e-invoice provider', 'XML đã ký từ nhà cung cấp hóa đơn điện tử'],
    'sp.iv.pdf': ['PDF file', 'Tệp PDF'], 'sp.iv.read': ['Read XML', 'Đọc XML'], 'sp.iv.fields': ['Fields read from the XML', 'Thông tin đọc từ XML'], 'sp.iv.mau': ['Mẫu · ký hiệu · số', 'Mẫu · ký hiệu · số'],
    'sp.iv.date': ['Invoice date', 'Ngày hóa đơn'], 'sp.iv.mst': ['Seller MST', 'MST người bán'], 'sp.iv.sig': ['Seller signature', 'Chữ ký người bán'], 'sp.iv.sigV': ['Valid · {n}', 'Hợp lệ · {n}'],
    'sp.ck.schema': ['XML schema', 'Cấu trúc XML'], 'sp.ck.mst': ['Seller MST = profile', 'MST người bán = hồ sơ'], 'sp.ck.cqt': ['Mã CQT present', 'Có mã CQT'], 'sp.ck.mid': ['Material ID mapped', 'Đã ánh xạ mã vật tư'], 'sp.ck.qty': ['Qty ≤ GRN accepted', 'SL ≤ SL nhập kho chấp nhận'],
    'sp.iv.lineH': ['Invoice line', 'Dòng hóa đơn'], 'sp.iv.poLine': ['PO line · GRN', 'Dòng PO · GRN'], 'sp.iv.unit': ['Unit price', 'Đơn giá'], 'sp.iv.parsedL': ['Parsed invoice lines', 'Dòng hóa đơn đã đọc'],
    'sp.iv.readFirst': ['Read the XML to check the fields before you submit.', 'Đọc XML để kiểm tra thông tin trước khi nộp.'], 'sp.iv.submit': ['Submit invoice', 'Nộp hóa đơn'], 'sp.iv.noGrn': ['No goods receipt is waiting to be invoiced.', 'Không có phiếu nhập kho nào chờ xuất hóa đơn.'],
    'sp.e.xml': ['Attach the signed XML (.xml).', 'Đính kèm XML đã ký (.xml).'], 'sp.e.pdfF': ['Attach the PDF (.pdf).', 'Đính kèm PDF (.pdf).'], 'sp.e.orig': ['Choose the invoice this one adjusts or replaces.', 'Chọn hóa đơn được điều chỉnh hoặc thay thế.'],
    'sp.e.readXml': ['Read the XML first and check the fields.', 'Hãy đọc XML và kiểm tra thông tin trước.'], 'sp.e.xmlRead': ['Attach the signed XML (.xml) to read it.', 'Đính kèm XML đã ký (.xml) để đọc.'],
    'sp.t.xml': ['XML read · seller signature valid', 'Đã đọc XML · chữ ký người bán hợp lệ'], 'sp.t.inv': ['{id} submitted · {kh} {no} · status Submitted', 'Đã nộp {id} · {kh} {no} · trạng thái Đã nộp'],
    'sp.ct.sub': ['Your contracts with consumption by Material ID', 'Hợp đồng của bạn và mức sử dụng theo mã vật tư'], 'sp.k.cts': ['Contracts', 'Hợp đồng'], 'sp.k.consumed': ['Consumed', 'Đã sử dụng'], 'sp.k.ceiling': ['Ceiling', 'Giá trị trần'],
    'sp.k.expiring': ['Expiring ≤ 60 days', 'Hết hạn ≤ 60 ngày'], 'sp.ct.of': ['{r} of {c} committed', '{r}/{c} đã cam kết'], 'sp.ct.q4': ['Price Q4 excl. VAT', 'Giá Q4 chưa VAT'], 'sp.ct.commit': ['Committed', 'Cam kết'], 'sp.ct.rel': ['Released', 'Đã phát hành'],
    'sp.ct.left': ['Left', 'Còn lại'], 'sp.ct.lines': ['Contract lines', 'Dòng hợp đồng'], 'sp.ct.releases': ['Releases ({n})', 'Lần phát hành ({n})'], 'sp.ct.none': ['No contracts', 'Chưa có hợp đồng'],
    'sp.ct.exp': ['Expires {d}. The buyer is reminded 90 / 60 / 30 days before; renewal is negotiated outside the portal.', 'Hết hạn {d}. Người mua được nhắc trước 90 / 60 / 30 ngày; gia hạn được đàm phán ngoài cổng.'], 'sp.ct.daysLeft': ['{n} days left', 'còn {n} ngày'],
    'sp.ce.sub': ['Certificates required by your Material IDs · upload renewals before they expire', 'Chứng chỉ theo mã vật tư của bạn · tải bản gia hạn trước khi hết hạn'], 'sp.ce.reg': ['Register', 'Danh sách'], 'sp.ce.up': ['Upload', 'Tải lên'],
    'sp.ce.title': ['Certificates ({n})', 'Chứng chỉ ({n})'], 'sp.ce.issuer': ['Issuer', 'Tổ chức cấp'], 'sp.ce.valid': ['Valid until', 'Hiệu lực đến'], 'sp.ce.renews': ['Renews {id}', 'Gia hạn {id}'], 'sp.ce.renew': ['Upload renewal', 'Tải bản gia hạn'],
    'sp.k.valid': ['Valid', 'Còn hiệu lực'], 'sp.k.due': ['Renewal due / expired', 'Cần gia hạn / hết hạn'], 'sp.k.review': ['Pending buyer review', 'Chờ người mua xem xét'],
    'sp.ce.formT': ['Upload certificate', 'Tải lên chứng chỉ'], 'sp.ce.formR': ['Upload renewal for {id}', 'Tải bản gia hạn cho {id}'], 'sp.ce.type': ['Type', 'Loại'], 'sp.ce.no': ['Certificate no.', 'Số chứng chỉ'], 'sp.ce.file': ['File', 'Tệp'],
    'sp.ce.scope': ['Scope: {m}. The buyer reviews it; until then the current certificate stays in force.', 'Phạm vi: {m}. Người mua xem xét; trong thời gian đó chứng chỉ hiện hành vẫn có hiệu lực.'],
    'sp.e.req': ['Required.', 'Bắt buộc.'], 'sp.e.future': ['Must be in the future.', 'Phải là ngày trong tương lai.'], 'sp.t.cert': ['{id} uploaded · pending buyer review', 'Đã tải lên {id} · chờ người mua xem xét'],
    'sp.sc.sub': ['Your own evaluation · other vendors are never shown', 'Đánh giá của riêng bạn · không hiển thị NCC khác'], 'sp.sc.crit': ['Criteria', 'Tiêu chí'], 'sp.sc.trend': ['Trend & grades', 'Xu hướng & xếp loại'],
    'sp.k.ncrs': ['NCRs', 'NCR'], 'sp.k.ncrsN': ['{n} open', '{n} đang mở'], 'sp.k.status': ['Status', 'Trạng thái'], 'sp.k.statusN': ['Grade A ≥ 4,2 = Preferred', 'Loại A ≥ 4,2 = Ưu tiên'], 'sp.k.notEval': ['Not evaluated', 'Chưa đánh giá'],
    'sp.k.otifV': ['{n} deliveries · on time {o} · in full {f}', '{n} lần giao · đúng hạn {o} · đủ SL {f}'], 'sp.sc.critT': ['Criteria · {p}', 'Tiêu chí · {p}'], 'sp.sc.c': ['Criterion', 'Tiêu chí'], 'sp.sc.w': ['{s} · weight {w}%', '{s} · trọng số {w}%'],
    'sp.sc.ev': ['Evidence', 'Căn cứ'], 'sp.sc.comment': ['Buyer comment: “{c}”', 'Nhận xét của người mua: “{c}”'], 'sp.sc.none': ['Not evaluated yet', 'Chưa được đánh giá'], 'sp.sc.trendT': ['Trend', 'Xu hướng'], 'sp.sc.noHist': ['No history', 'Chưa có lịch sử'], 'sp.sc.grades': ['Grades', 'Xếp loại'],
    'sp.pf.sub': ['{n} · profile {p} complete', '{n} · hồ sơ hoàn thành {p}'], 'sp.pf.company': ['Company', 'Công ty'], 'sp.pf.bank': ['Bank account', 'Tài khoản ngân hàng'], 'sp.pf.onb': ['Onboarding & consent', 'Hồ sơ đăng ký & đồng ý'], 'sp.pf.mats': ['Materials offered', 'Vật tư cung cấp'],
    'sp.k.profile': ['Profile complete', 'Hồ sơ hoàn thành'], 'sp.k.offered': ['Material IDs offered', 'Mã vật tư cung cấp'], 'sp.k.bankK': ['Bank account', 'Tài khoản ngân hàng'], 'sp.k.consent': ['Privacy notice', 'Thông báo bảo mật'], 'sp.k.proposed': ['+ {n} proposed', '+ {n} đề xuất'],
    'sp.pf.name': ['Company name', 'Tên công ty'], 'sp.pf.nameH': ['Changes go through the buyer (legal name = Giấy CNĐKDN)', 'Thay đổi qua người mua (tên pháp lý = Giấy CNĐKDN)'], 'sp.pf.mst': ['MST (tax code)', 'MST (mã số thuế)'],
    'sp.pf.mstH': ['10 digits, or 13 for a branch (0315284671-001)', '10 số, hoặc 13 số với chi nhánh (0315284671-001)'], 'sp.pf.rep': ['Legal representative', 'Người đại diện pháp luật'], 'sp.pf.mail': ['Contact Gmail', 'Gmail liên hệ'], 'sp.pf.mailH': ['Your sign-in address', 'Địa chỉ đăng nhập của bạn'],
    'sp.pf.phone': ['Phone', 'Điện thoại'], 'sp.pf.addr': ['Address', 'Địa chỉ'], 'sp.pf.gdt': ['GDT: {r} · checked {d}', 'GDT: {r} · kiểm tra {d}'], 'sp.pf.last': ['Last MST check {d} · {s}', 'Kiểm tra MST gần nhất {d} · {s}'],
    'sp.pf.check': ['Check MST', 'Kiểm tra MST'], 'sp.pf.save': ['Save profile', 'Lưu hồ sơ'], 'sp.t.prof': ['Profile saved', 'Đã lưu hồ sơ'],
    'sp.e.mstF': ['MST must be 10 digits, or 10 digits + "-" + 3 for a branch.', 'MST gồm 10 số, hoặc 10 số + "-" + 3 số với chi nhánh.'], 'sp.e.mstO': ['This MST belongs to another company in the GDT register. Contact your buyer to change the legal entity.', 'MST này thuộc công ty khác trên hệ thống GDT. Liên hệ người mua để đổi pháp nhân.'],
    'sp.bk.use': ['In use', 'Đang dùng'], 'sp.bk.new': ['New account', 'Tài khoản mới'], 'sp.bk.req': ['Requested {d} · Finance calls back on the number in your profile before payments use it', 'Yêu cầu {d} · Tài chính gọi xác minh qua số điện thoại trong hồ sơ trước khi dùng để thanh toán'],
    'sp.bk.bank': ['Bank', 'Ngân hàng'], 'sp.bk.acct': ['Account number', 'Số tài khoản'], 'sp.bk.holder': ['Account holder', 'Chủ tài khoản'], 'sp.bk.holderH': ['Must equal the company name', 'Phải trùng tên công ty'], 'sp.bk.letter': ['Bank confirmation letter', 'Thư xác nhận của ngân hàng'],
    'sp.bk.reqBtn': ['Request change', 'Gửi yêu cầu đổi'], 'sp.bk.change': ['Change bank account', 'Đổi tài khoản ngân hàng'],
    'sp.e.bank': ['Enter the bank.', 'Nhập ngân hàng.'], 'sp.e.acct': ['6–19 digits.', '6–19 chữ số.'], 'sp.e.holder': ['The account holder must equal the company name.', 'Chủ tài khoản phải trùng tên công ty.'], 'sp.t.bank': ['{a} pending Finance verification', '{a} đang chờ Tài chính xác minh'],
    'sp.mt.title': ['Material IDs offered ({n})', 'Mã vật tư cung cấp ({n})'], 'sp.mt.prop': ['Awaiting buyer approval', 'Chờ người mua duyệt'], 'sp.mt.lbl': ['Material ID to offer', 'Mã vật tư muốn cung cấp'], 'sp.mt.btn': ['Propose', 'Đề xuất'],
    'sp.mt.add': ['Propose a Material ID', 'Đề xuất mã vật tư'], 'sp.mt.noMore': ['No other Material IDs in your category.', 'Không còn mã vật tư nào khác trong nhóm hàng của bạn.'], 'sp.t.prop': ['{m} proposed · awaiting buyer approval', 'Đã đề xuất {m} · chờ người mua duyệt'],
    'sp.ob.title': ['Onboarding checklist ({d} / {n})', 'Danh mục hồ sơ ({d} / {n})'], 'sp.pv.title': ['Privacy & consent', 'Bảo mật & đồng ý'],
    'sp.pv.pending': ['{v} not accepted yet — accept to keep using the portal.', 'Chưa chấp nhận {v} — hãy chấp nhận để tiếp tục dùng cổng.'], 'sp.pv.accept': ['Accept {v}', 'Chấp nhận {v}'],
    'sp.pv.ok': ['Privacy notice {v} accepted {d} by {u}.', 'Đã chấp nhận thông báo bảo mật {v} ngày {d} bởi {u}.'], 'sp.pv.rights': ['Under Luật BVDLCN 91/2025/QH15 you can ask for a copy of your personal data or withdraw consent; withdrawing ends portal access for this user.', 'Theo Luật BVDLCN 91/2025/QH15 bạn có thể yêu cầu bản sao dữ liệu cá nhân hoặc rút lại đồng ý; rút đồng ý sẽ chấm dứt quyền truy cập cổng của người dùng này.'],
    'sp.pv.manage': ['Manage consent', 'Quản lý đồng ý'], 'sp.pv.msg': ['Consent settings: request sent to the ProcureLink admin (R-25)', 'Cài đặt đồng ý: đã gửi yêu cầu tới quản trị ProcureLink (R-25)'], 'sp.t.pv': ['Privacy notice {v} accepted', 'Đã chấp nhận thông báo bảo mật {v}'],
    /* notifications written for the buyer (rendered with App.ntext, RB2-03) */
    'sp.n.inv': ['{id} submitted by {v} via portal · {g} · {net} excl. VAT', '{v} đã nộp {id} qua cổng NCC · {g} · {net} chưa VAT'], 'sp.n.q': ['{id}: new bidder question on {m} (anonymous)', '{id}: câu hỏi mới của nhà thầu về {m} (ẩn danh)'],
    'sp.n.asn': ['{id} · {po} ships {q} {u} {m} on {d}', '{id} · {po} giao {q} {u} {m} ngày {d}'], 'sp.n.chg': ['{v} requests delivery {f} → {to} on {po}', '{v} đề nghị đổi ngày giao {f} → {to} cho {po}'],
    'sp.n.ncr': ['{id}: {v} responded — {o}', '{id}: {v} đã phản hồi — {o}'], 'sp.n.cert': ['{t} renewal uploaded by {v} — review {id}', '{v} đã tải bản gia hạn {t} — xem xét {id}'], 'sp.n.prop': ['{v} proposes to supply {m}', '{v} đề xuất cung cấp {m}'],
    /* audit entries */
    'au.bidSub': ['Sealed bid submitted · {rc} v{v} (content sealed)', 'Đã nộp hồ sơ niêm phong · {rc} v{v} (nội dung niêm phong)'], 'au.bidRev': ['Sealed bid revised · {rc} v{v} (content sealed)', 'Đã sửa hồ sơ niêm phong · {rc} v{v} (nội dung niêm phong)'],
    'au.bidWd': ['Sealed bid withdrawn · {rc}', 'Rút hồ sơ niêm phong · {rc}'], 'au.ack': ['Addendum {no} acknowledged', 'Đã xác nhận phụ lục {no}'],
    'au.invPortal': ['{id} submitted via portal', 'Đã nộp {id} qua cổng NCC'], 'au.poDec': ['PO declined · {r}', 'Từ chối PO · {r}'], 'au.poConf': ['PO confirmed', 'Đã xác nhận PO'], 'au.poReconf': ['PO Rev.{r} re-confirmed', 'Đã xác nhận lại PO Rev.{r}'],
    'au.asn': ['ASN sent · {id}', 'Đã gửi ASN · {id}'], 'au.chg': ['Delivery date change requested → {d}', 'Đề nghị đổi ngày giao → {d}'], 'au.ncr': ['NCR response · {o}', 'Phản hồi NCR · {o}'], 'au.cert': ['Certificate uploaded · {t}', 'Đã tải lên chứng chỉ · {t}'],
    'au.bank': ['Bank account change requested · {a} (pending Finance verification)', 'Yêu cầu đổi tài khoản ngân hàng · {a} (chờ Tài chính xác minh)'], 'au.prof': ['Company profile saved', 'Đã lưu hồ sơ công ty'], 'au.prop': ['Material ID proposed · {m}', 'Đề xuất mã vật tư · {m}'],
    'au.mstOk': ['MST checked · valid', 'Kiểm tra MST · hợp lệ'], 'au.mstBad': ['MST checked · rejected', 'Kiểm tra MST · không hợp lệ'], 'au.consent': ['Privacy notice {v} accepted', 'Đã chấp nhận thông báo bảo mật {v}']
  });
  I18N.values({
    'Supplier portal': 'Cổng NCC', 'PO declined': 'PO bị từ chối', 'Renewal due': 'Cần gia hạn', 'Not awarded': 'Không trúng thầu', Withdrawn: 'Đã rút', 'Awaiting answer': 'Chờ trả lời',
    'Supplier responded': 'NCC đã phản hồi', 'Pending buyer acceptance': 'Chờ người mua chấp nhận', 'Awaiting re-confirmation': 'Chờ xác nhận lại', Declined: 'Đã từ chối', 'On time': 'Đúng hạn', Late: 'Trễ', 'In full': 'Đủ SL', Short: 'Thiếu SL',
    'Bank guarantee': 'Bảo lãnh ngân hàng', 'Cash deposit': 'Đặt cọc tiền mặt', Original: 'Gốc', Adjustment: 'Điều chỉnh', Replacement: 'Thay thế', 'Return and credit note': 'Trả hàng và chứng từ giảm trừ', 'Offer a discount': 'Đề xuất chiết khấu',
    Done: 'Hoàn thành', 'Pending Finance verification': 'Chờ Tài chính xác minh', 'Renewal due 15/12/2026': 'Cần gia hạn trước 15/12/2026', 'Code of conduct & privacy consent (v2.1)': 'Bộ quy tắc ứng xử & đồng ý bảo mật (v2.1)',
    'Submitted · to match': 'Đã nộp · chờ đối chiếu', Paid: 'Đã thanh toán', 'Sealed bid': 'Đấu thầu niêm phong', RFQ: 'Yêu cầu báo giá', 'Not confirmed': 'Chưa xác nhận',
    'PO-2026-0889 waits for your confirmation (due 03/11/2026 16:00)': 'PO-2026-0889 đang chờ bạn xác nhận (hạn 03/11/2026 16:00)', 'NCR-2026-017 raised on GRN-2026-1539 — please respond': 'NCR-2026-017 được lập trên GRN-2026-1539 — vui lòng phản hồi',
    'TND-2026-031 Addendum 01 published — acknowledge before you revise your bid': 'TND-2026-031 đã phát hành phụ lục 01 — xác nhận trước khi sửa hồ sơ',
    'Bid security not needed after award · performance security under CT-2026-008': 'Không cần bảo đảm dự thầu sau trao thầu · bảo đảm thực hiện theo CT-2026-008', 'Bid security returned 21/08/2026 (≤ 14 days)': 'Đã hoàn trả bảo đảm dự thầu 21/08/2026 (≤ 14 ngày)',
    'Spot RFQ · Lê Quốc Huy': 'Yêu cầu báo giá lẻ · Lê Quốc Huy', 'Chrome, TP.HCM': 'Chrome, TP.HCM'
  });
  I18N.patterns([
    [/^(Submitted|Revised) · (RC-[\d-]+)( v\d+)?$/, (m, a, rc, v) => `${a === 'Revised' ? 'Đã sửa' : 'Đã nộp'} · ${rc}${v || ''}`], [/^Withdrawn · (RC-[\d-]+)$/, 'Đã rút · $1'],
    [/^Supplier user · (V-\d+)$/, 'Người dùng NCC · $1'], [/^Revised v(\d+)$/, 'Sửa đổi v$1'], [/^Withdrawn by the bidder (.+)$/, 'Nhà thầu đã rút $1'], [/^Accepted by buyer (.+)$/, 'Người mua đã chấp nhận $1']
  ]);

  const VID = () => (App.state.user && App.state.user.vendor) || 'V-1001';
  const V = () => App.vendor(VID());
  const P = () => D().portal[VID()] || (D().portal[VID()] = { bids: {}, results: [], quotes: [], asns: [], checklist: [], notices: [], lastLogin: '—' });
  const mat = (id) => App.material(id) || { id, name: id, uom: '', vat: 8, vendors: [] };
  /* Material ID tag without a link: Material 360° is an internal screen */
  const mtag = (id) => `<span class="mid">${esc(id)}</span>`;
  const RESET = { bid: null, berr: {}, up: null, q: null, qerr: {}, dec: null, derr: '', asn: null, aerr: {}, chg: null, cerr: {}, ncr: null, nerr: {}, inv: null, ierr: {}, cert: null, terr: {}, bank: null, kerr: {}, mst: null };
  const st = Object.assign({ cur: null }, RESET);

  /* ---------- own records (data isolation: every list is filtered by VID) ---------- */
  const myPos = () => D().docs.filter((d) => d.type === 'PO' && d.vendor === VID() && !/Draft|Pending|^Approved$/.test(d.status)).sort((a, b) => App.dt(b.date) - App.dt(a.date));
  const myInv = () => D().docs.filter((d) => d.type === 'INV' && d.vendor === VID()).sort((a, b) => App.dt(b.date) - App.dt(a.date));
  const myNcr = () => Object.entries(D().ncrs).map(([id, n]) => Object.assign({ id }, n)).filter((n) => { const d = S.docOf(n.po); return (d && d.vendor === VID()) || (D().pos[n.po] && D().pos[n.po].vendor === VID()); });
  const myCts = () => D().contracts.filter((c) => c.vendor === VID());
  const myCerts = () => D().certificates.filter((c) => c.vendor === VID());
  const myGrns = () => Object.entries(D().grns).filter(([, g]) => { const d = S.docOf(g.po); return d && d.vendor === VID(); }).map(([id, g]) => Object.assign({ id }, g)).sort((a, b) => App.dt(b.date) - App.dt(a.date));
  const tndDoc = (id) => S.docOf(id);
  const invites = () => D().docs.filter((d) => d.type === 'TND' && ((D().tenders[d.id] && (D().tenders[d.id].bidders || []).some((b) => b.vid === VID())) || P().bids[d.id]));
  const closeAt = (d) => { const tn = D().tenders[d.id] || {}; const [dd, mm, yy] = d.close.split('/').map(Number); const [h, mi] = String(tn.closeTime || '17:00').split(':').map(Number); return new Date(yy, mm - 1, dd, h, mi); };
  const isClosed = (d) => closeAt(d) <= NOWD || /Awarded|Evaluation|Closed|Cancelled/.test(d.status);
  const left = (d) => { const ms = closeAt(d) - NOWD; if (ms <= 0 || isClosed(d)) return t('sp.closed'); const h = Math.floor(ms / 36e5); return t('sp.left', { d: Math.floor(h / 24), h: h % 24 }); };
  const termsDays = () => +((String((V() || {}).terms || '30').match(/\d+/) || [30])[0]);
  const stageOf = (d) => (/Paid/.test(d.status) ? 4 : /Ready/.test(d.status) ? 3 : /Matched/.test(d.status) ? 2 : /Submitted/.test(d.status) ? 0 : 1);
  const STAGES = ['Submitted', 'Validated', 'Matched', 'Ready for payment', 'Paid'];
  const steps = (list, i, label) => `<ol class="steps" aria-label="${esc(label)}">${list.map((x, k) => { const dn = k < i; const cu = k === i; return `<li class="${dn ? 'done' : cu ? 'cur' : ''}"${cu ? ' aria-current="step"' : ''}><span class="st-n" aria-hidden="true">${dn ? '✓' : k + 1}</span><span class="st-l">${esc(tv(x))}</span>${dn ? `<span class="sr"> (${esc(t('c.done'))})</span>` : ''}</li>`; }).join('')}</ol>`;
  const certStatus = (c) => { if (['Pending review', 'Rejected', 'Superseded'].includes(c.status)) return c.status; const d = App.daysTo(c.expiry); return d < 0 ? 'Expired' : d <= 60 ? 'Renewal due' : 'Valid'; };
  const cTone = (s) => ({ Valid: 'success', 'Renewal due': 'warning', Expired: 'danger', 'Pending review': 'info', Rejected: 'danger' }[s] || 'neutral');
  // Notifications for the buyer are stored as a key + params (RB2-03); `text` keeps an English copy for search
  const notify = (k, p, doc, href, mats) => D().notifications.unshift({ id: 'N-' + (950 + D().notifications.length), type: 'Supplier portal', k, p, text: I18N.t('en', k, p), doc, mats: mats || [], at: clock(), read: false, action: 'Open', href });
  const audit = (type, k, p, ref) => S.audit(type, [k, p], ref);
  const notFound = (what, id, href, back) => layout({ title: t('sp.title'), blocks: [block(null, App.errorState(t('sp.notFound', { what: t(what), id })) + `<p class="m-0"><a class="btn" href="${href}">${esc(t(back))}</a></p>`)] });
  const poTone = (s) => (/declined|not confirmed/.test(s) ? 'danger' : /Closed|Delivered|Confirmed/.test(s) ? 'success' : 'warning');
  const otifPills = (x) => `${pill(x.onTime ? 'On time' : 'Late', x.onTime ? 'success' : 'danger')} ${pill(x.inFull ? 'In full' : 'Short', x.inFull ? 'success' : 'danger')}`;
  const formBtns = (cancel, submitLabel, cls = 'btn-p') => `<div class="row-acts"><button type="button" class="btn btn-sm" data-sp="${cancel}">${esc(t('c.cancel'))}</button><button type="submit" class="btn btn-sm ${cls}">${esc(submitLabel)}</button></div>`;
  const reqPill = (r) => (r.req ? `<div class="small">${pill(r.req.status, /Pending/.test(r.req.status) ? 'warning' : /Accepted/.test(r.req.status) ? 'success' : 'danger')} → ${esc(r.req.to)}</div>` : '');

  /* ---------- F-87 overview ---------- */
  function actions() {
    const out = [];
    myPos().forEach((d) => { const p = App.po.det(d.id);
      if (p.confirm && p.confirm.status === 'Not confirmed') out.push([t('sp.act.confirm', { id: d.id }), d.note ? tvx(d.note) : t('sp.act.confirmN'), `#/supplier/pos/${d.id}`, 'danger']);
      if (p.confirm && p.confirm.status === 'Awaiting re-confirmation') out.push([t('sp.act.reconf', { id: d.id, r: p.rev }), t('sp.act.reconfN'), `#/supplier/pos/${d.id}`, 'warning']); });
    invites().forEach((d) => { const tn = D().tenders[d.id]; if (isClosed(d)) return;
      (tn.addenda || []).forEach((a) => { if (!a.acks.some((x) => x[0] === VID())) out.push([t('sp.act.ack', { id: d.id, no: String(a.no).padStart(2, '0') }), t('sp.act.closes', { d: `${d.close} ${tn.closeTime}` }), `#/supplier/invitations/${d.id}/qa`, 'warning']); });
      const b = P().bids[d.id]; if (!b || b.status !== 'Submitted') out.push([t('sp.act.bid', { id: d.id }), `${t('sp.act.closes', { d: `${d.close} ${tn.closeTime}` })} · ${left(d)}`, `#/supplier/invitations/${d.id}/bid`, 'warning']); });
    myNcr().filter((n) => n.status !== 'Closed' && !n.response).forEach((n) => out.push([t('sp.act.ncr', { id: n.id }), `${num(n.qty)} ${mat(n.mat).uom} ${n.mat} · ${tv(n.action)}`, '#/supplier/deliveries/ncr', 'danger']));
    myCerts().filter((c) => certStatus(c) === 'Renewal due' && !myCerts().some((x) => x.replaces === c.id)).forEach((c) => out.push([t('sp.act.cert', { t: tv(c.type) }), t('sp.act.certN', { d: c.expiry }), '#/supplier/certificates', 'warning']));
    myCts().filter((c) => (S.docOf(c.id) || {}).status === 'Expiring').forEach((c) => out.push([t('sp.act.ct', { id: c.id, d: c.end }), t('sp.act.ctN'), '#/supplier/contracts', 'neutral']));
    return out;
  }
  function overview() {
    const v = V(); const act = actions(); const open = invites().filter((d) => !isClosed(d));
    const sealed = Object.entries(P().bids).filter(([k, b]) => b.status === 'Submitted' && !isClosed(tndDoc(k))).length;
    const openPos = myPos().filter((d) => !/Closed|Cancelled|declined/.test(d.status));
    const sc = D().scorecards.find((x) => x.vendor === VID());
    const actList = act.length ? `<ul class="plain rows">${act.map(([x, n, h, tone]) => `<li class="row-acts between"><span><b>${esc(x)}</b><div class="small muted">${esc(n)}</div></span><a class="btn btn-sm${tone === 'danger' ? ' btn-p' : ''}" href="${h}">${esc(t('c.open'))}</a></li>`).join('')}</ul>` : App.emptyState(t('sp.act.none'), t('sp.act.noneN'));
    return layout({
      title: v.name, subtitle: esc(t('sp.ov.sub', { id: v.id, mst: v.mst, me: `${S.me()} (${v.email})`, at: tvx(P().lastLogin) })),
      kpis: [kpi(t('sp.k.openInv'), String(open.length), esc(open.map((d) => d.id).join(', ') || t('c.none'))), kpi(t('sp.k.sealed'), String(sealed), esc(t('sp.k.sealedN'))),
        kpi(t('sp.k.openPos'), String(openPos.length), esc(App.ty(openPos.reduce((a, d) => a + d.value, 0)) + ' ' + t('c.exclVat'))),
        kpi(t('sp.k.otif'), v.otif != null ? pct(v.otif) : '—', esc(t('sp.k.otifN')), v.otif >= 95 ? 'success' : 'warning'), kpi(t('sp.k.score'), v.score ? `${num(v.score, 2)} · ${esc(v.grade)}` : '—', sc ? esc(sc.period) : '')],
      blocks: [block(t('sp.act.title', { n: act.length }), actList, { span: 6 }),
        block(t('sp.notices'), `<ul class="plain rows small">${P().notices.map(([at, x]) => `<li><span class="muted">${esc(at)}</span><div>${esc(tv(x))}</div></li>`).join('') || `<li class="muted">${esc(t('c.none'))}</li>`}</ul>`, { span: 6 })]
    });
  }

  /* ---------- F-88..F-91 invitations ---------- */
  const ISUBS = [['', 'sp.inv.list'], ['results', 'sp.inv.results']];
  function invList(subArg) {
    const rows = invites(); const res = P().results; const cur = App.sub(ISUBS, subArg || '');
    const kpis = [kpi(t('sp.k.openInv'), String(rows.filter((d) => !isClosed(d)).length), esc(t('sp.inv.title', { n: rows.length }))), kpi(t('sp.k.sealed'), String(Object.values(P().bids).filter((b) => b.status === 'Submitted').length), ''),
      kpi(t('sp.k.results'), String(res.length), ''), kpi(t('sp.k.awarded'), String(res.filter((r) => r.outcome === 'Awarded').length), '', 'success')];
    const list = block(t('sp.inv.title', { n: rows.length }), table([
      { h: t('sp.c.tender'), r: (d) => `<a class="mono" href="#/supplier/invitations/${esc(d.id)}">${esc(d.id)}</a><div class="small">${esc(d.title)}</div>`, w: 'minmax(220px,2fr)' },
      { h: t('c.mids'), r: (d) => `<span class="chips chips-inline">${d.mats.map(mtag).join('')}</span>`, w: 'minmax(160px,1.4fr)' },
      { h: t('sp.c.closes'), r: (d) => `<span class="nowrap">${esc(d.close)} ${esc((D().tenders[d.id] || {}).closeTime || '')}</span><div class="small muted">${esc(left(d))}</div>`, w: '150px' },
      { h: t('sp.c.myBid'), r: (d) => { const b = P().bids[d.id]; return b ? `${pill(b.status, b.status === 'Submitted' ? 'success' : b.status === 'Withdrawn' ? 'danger' : 'neutral')}${b.rc ? `<div class="small mono">${esc(b.rc)} · v${b.ver}</div>` : ''}` : pill('Not started', 'warning'); }, w: '150px' },
      { h: t('sp.c.tStatus'), r: (d) => pill(isClosed(d) ? (d.status === 'Open' ? 'Closed' : d.status) : 'Open', isClosed(d) ? 'neutral' : 'info'), w: '130px' }
    ], rows, { label: t('sp.inv.list'), empty: t('sp.inv.none') }));
    const results = block(t('sp.inv.results'), res.length ? `<ul class="plain rows">${res.map((r) => `<li><b class="mono">${esc(r.tnd)}</b> ${esc(r.title)} ${pill(r.outcome, r.outcome === 'Awarded' ? 'success' : 'neutral')}<div class="small">${esc(t('sp.res.rank', { r: r.rank, n: r.of }))} · ${esc(t('sp.res.notice', { d: r.at }))}${r.po ? ` · ${esc(r.po)}` : ''}</div><div class="small muted">${esc(tv(r.sec))}</div></li>`).join('')}</ul><p class="small muted">${esc(t('sp.res.note'))}</p>` : App.emptyState(t('sp.res.none')));
    return layout({ title: t('nav.s.invitations'), subtitle: esc(t('sp.inv.sub')), alerts: App.unknownSub(ISUBS, subArg), kpis, subnav: App.subnav('supplier/invitations', ISUBS, cur), blocks: [cur === 'results' ? results : list] });
  }
  function bidOf(id) {
    const tn = D().tenders[id]; const b = P().bids[id];
    return b || (P().bids[id] = { status: 'Draft', rc: null, at: null, ver: 0, lines: tn.lines.map(() => ({ price: null, lead: null, nobid: false })), sec: { form: 'Bank guarantee', bank: '', ref: '', amount: null, valid: '', file: '' }, files: [], note: '', consent: false, log: [] });
  }
  const secReq = (tn) => tn.secAmount || 0;
  function totals(tn, lines) {
    const by = {}; tn.lines.forEach((l, i) => { const x = lines[i]; if (!x || x.nobid || !(+x.price > 0)) return; const r = mat(l.mat).vat; by[r] = (by[r] || 0) + l.qty * x.price; });
    const net = Object.values(by).reduce((a, x) => a + x, 0); const vat = Object.entries(by).reduce((a, [r, x]) => a + x * r / 100, 0); return { by, net, vat, gross: net + vat };
  }
  const totInner = (tt) => `${Object.entries(tt.by).sort((a, z) => z[0] - a[0]).map(([r, x]) => `<dt>${esc(t('sp.tot.on', { r: S.vatLabel(r) }))}</dt><dd>${esc(t('sp.tot.plus', { a: vnd(x), v: vnd(x * r / 100) }))}</dd>`).join('')}<dt>${esc(t('sp.tot.net'))}</dt><dd>${vnd(tt.net)}</dd><dt class="tot">${esc(t('sp.tot.gross'))}</dt><dd class="tot"><b>${vnd(tt.gross)}</b></dd>`;
  const DSUBS = [['', 'sp.d.overview'], ['bid', 'sp.d.bid'], ['qa', 'sp.d.qa'], ['results', 'sp.d.results']];
  function invDetail(id, subArg) {
    const d = tndDoc(id); const tn = D().tenders[id];
    if (!d || !tn || !invites().some((x) => x.id === id)) return notFound('sp.w.inv', id, '#/supplier/invitations', 'sp.backInv');
    const cur = App.sub(DSUBS, subArg || '');
    const b = bidOf(id); const closed = isClosed(d); const f = st.bid || b; const e = st.berr;
    const tt = totals(tn, f.lines); const unacked = (tn.addenda || []).filter((a) => !a.acks.some((x) => x[0] === VID()));
    const res = P().results.find((r) => r.tnd === id);
    const kpis = [kpi(t('sp.k.left'), esc(left(d)), esc(`${d.close} ${tn.closeTime}`), closed ? '' : 'warning'), kpi(t('sp.k.receipt'), b.rc ? `<span class="mono">${esc(b.rc)}</span>` : '—', esc(tv(b.status)), b.status === 'Submitted' ? 'success' : ''),
      kpi(t('sp.k.quoted'), `${f.lines.filter((x) => !x.nobid && x.price > 0).length} / ${tn.lines.length}`, ''), kpi(t('sp.k.total'), vnd(tt.net), ''), kpi(t('sp.k.addenda'), String(unacked.length), '', unacked.length ? 'warning' : '')];
    let blocks;
    if (cur === 'bid') blocks = [bidBlock(d, tn, b, f, e, tt, closed), S.files('spf', f.files, tn.lines.map((l) => l.mat), closed ? null : st.up, ['Quotation letter', 'CO/CQ', 'Catalogue', 'Datasheet', 'Other'], { block: true })];
    else if (cur === 'qa') blocks = [addendaBlock(tn, closed), qaBlock(tn, closed)];
    else if (cur === 'results') blocks = [block(t('sp.res.title'), res ? `<p class="mt-0">${pill(res.outcome, res.outcome === 'Awarded' ? 'success' : 'neutral')} ${esc(t('sp.res.rank', { r: res.rank, n: res.of }))} · ${esc(res.at)}</p><p class="small muted">${esc(tv(res.sec))}</p><p class="small muted">${esc(t('sp.res.note'))}</p>` : App.emptyState(t('sp.res.wait')))];
    else {
      const lines = block(t('sp.lines'), table([
        { h: t('c.mid'), r: (l) => `${mtag(l.mat)}<div class="small">${esc(mat(l.mat).name)}</div>`, w: 'minmax(180px,2fr)' }, { h: t('sp.c.qty'), r: (l) => `${num(l.qty)} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '100px' },
        { h: 'VAT', r: (l) => S.vatCell(mat(l.mat).vat), w: '120px' }, { h: t('sp.c.myBid'), r: (l) => { const x = f.lines[tn.lines.indexOf(l)]; return x.nobid ? esc(t('sp.c.nobid')) : x.price ? vnd(x.price) : '—'; }, cls: 'num', w: '140px' }
      ], tn.lines, { label: t('sp.lines') }), { span: 6, actions: closed ? '' : `<a class="btn btn-sm btn-p" href="#/supplier/invitations/${esc(id)}/bid">${esc(t('sp.goBid'))}</a>` });
      const receipt = block(t('sp.rc.title'), b.rc ? `<p class="mt-0">${pill(b.status, b.status === 'Submitted' ? 'success' : 'danger')} <b class="mono">${esc(b.rc)}</b> · ${esc(t('sp.rc.ver', { v: b.ver }))}</p><p class="small">${esc(b.status === 'Submitted' ? t('sp.rc.sealed', { at: b.at }) : t('sp.rc.state', { s: tv(b.status), at: b.at }))}</p>
        <h3 class="h-sub">${esc(t('sp.rc.hist'))}</h3><ul class="plain rows small">${b.log.slice().reverse().map(([at, x]) => `<li><span class="muted">${esc(at)}</span> · ${esc(tv(x))}</li>`).join('')}</ul>` : `<p class="small muted mt-0">${esc(t('sp.rc.none'))}</p>`, { span: 6 });
      blocks = [lines, receipt];
    }
    return layout({
      crumbs: `<a href="#/supplier/invitations">${esc(t('nav.s.invitations'))}</a> / ${esc(id)}`, titleHtml: `<span class="mono">${esc(id)}</span> ${esc(d.title)}`,
      subtitle: `${esc(t('sp.d.sub', { m: tv(tn.method), d: `${d.close} ${tn.closeTime}` }))} · ${pill(closed ? 'Closed' : 'Open', closed ? 'neutral' : 'info')}`,
      alerts: App.unknownSub(DSUBS, subArg) + (closed && cur === 'bid' ? `<div class="alert alert-warning" role="status">${esc(t('sp.closedAlert', { d: `${d.close} ${tn.closeTime}` }))}</div>` : ''),
      kpis, subnav: App.subnav('supplier/invitations/' + id, DSUBS.map((x) => (x[0] === 'qa' && unacked.length && !closed ? [x[0], x[1], String(unacked.length)] : x)), cur), blocks
    });
  }
  function bidBlock(d, tn, b, f, e, tt, closed) {
    const dis = closed ? ' disabled' : ''; const minValid = App.addDays(d.close, 90);
    const lineRows = tn.lines.map((l, i) => { const m = mat(l.mat); const x = f.lines[i]; const err = e['l' + i];
      return `<div class="tr sb-cols" role="row"><div class="td" role="cell">${mtag(l.mat)}<div class="small">${esc(m.name)}</div>${err ? `<div class="err small" id="sb-e${i}" role="alert">${esc(S.errText(err))}</div>` : ''}</div>
        <div class="td num" role="cell">${num(l.qty)} ${esc(m.uom)}</div>
        <div class="td num" role="cell"><label class="sr" for="sb-p${i}">${esc(t('sp.lbl.price', { n: i + 1 }))}</label><input class="inp inp-num w-full" id="sb-p${i}" data-sb="price" data-i="${i}" inputmode="numeric" value="${x.price ? esc(num(x.price)) : ''}"${x.nobid || closed ? ' disabled' : ''}${err ? ` aria-invalid="true" aria-describedby="sb-e${i}"` : ''}></div>
        <div class="td" role="cell">${S.vatCell(m.vat)}${m.vat === 10 && /^CON-240/.test(l.mat) ? `<div class="small muted">${esc(t('sp.vatLock'))}</div>` : ''}</div>
        <div class="td num" role="cell"><label class="sr" for="sb-l${i}">${esc(t('sp.lbl.lead', { n: i + 1 }))}</label><input class="inp inp-num w-full" id="sb-l${i}" data-sb="lead" data-i="${i}" inputmode="numeric" value="${x.lead != null ? esc(x.lead) : ''}"${x.nobid || closed ? ' disabled' : ''}></div>
        <div class="td" role="cell"><label class="chk"><input type="checkbox" id="sb-n${i}" data-sb="nobid" data-i="${i}"${x.nobid ? ' checked' : ''}${dis}> ${esc(t('sp.c.nobid'))}</label></div>
        <div class="td num" role="cell" id="sb-a${i}">${x.nobid || !x.price ? '—' : vnd(l.qty * x.price)}</div></div>`; }).join('');
    const linesTbl = `<div class="tbl-wrap" tabindex="0" role="region" aria-label="${esc(t('c.scrolls', { label: t('sp.lbl.lines') }))}"><div class="tbl" role="table" style="min-width:900px"><div class="tr thead sb-cols" role="row"><div class="th">${esc(t('c.mid'))}</div><div class="th num">${esc(t('sp.c.qty'))}</div><div class="th num">${esc(t('sp.c.unit'))}</div><div class="th">VAT</div><div class="th num">${esc(t('sp.c.lead'))}</div><div class="th">${esc(t('sp.c.nobid'))}</div><div class="th num">${esc(t('sp.c.amount'))}</div></div>${lineRows}</div></div>`;
    const s = f.sec;
    const secHtml = `<fieldset class="fs"><legend>${esc(t('sp.sec.legend', { v: vnd(secReq(tn)), d: minValid }))}</legend><div class="form-grid">
      ${S.field('sbs', e, 'form', t('sp.sec.form'), s.form, { options: ['Bank guarantee', 'Cash deposit'], dis: closed })}${S.field('sbs', e, 'bank', t('sp.sec.bank'), s.bank || '', { dis: closed })}
      ${S.field('sbs', e, 'ref', t('sp.sec.ref'), s.ref || '', { dis: closed })}${S.field('sbs', e, 'amount', t('sp.sec.amount'), s.amount ? num(s.amount) : '', { mode: 'numeric', req: true, dis: closed })}
      ${S.field('sbs', e, 'valid', t('sp.sec.valid'), s.valid || '', { ph: 'dd/mm/yyyy', req: true, dis: closed })}${S.field('sbs', e, 'file', t('sp.sec.file'), s.file || '', { ph: t('sp.sec.filePh'), hint: t('sp.sec.fileHint'), dis: closed })}</div>
      <p class="small muted mt-0">${esc(t('sp.sec.ret'))}</p></fieldset>`;
    const commit = `<fieldset class="fs"${e.commit ? ' aria-describedby="sb-commit-e"' : ''}><legend>${esc(t('sp.commit'))}</legend>
      <label class="chk"><input type="checkbox" name="c1" value="1"${f.c1 || b.status === 'Submitted' ? ' checked' : ''}${dis}> ${esc(t('sp.c1', { n: tn.validity }))}</label>
      <label class="chk"><input type="checkbox" name="c2" value="1"${f.c2 || b.status === 'Submitted' ? ' checked' : ''}${dis}> ${esc(t('sp.c2'))}</label>
      <label class="chk"><input type="checkbox" name="consent" value="1"${f.consent ? ' checked' : ''}${dis}> ${esc(t('sp.c3', { v: D().privacy.current }))}</label>
      ${e.commit ? `<span class="err" id="sb-commit-e" role="alert">${esc(S.errText(e.commit))}</span>` : ''}</fieldset>`;
    const acts = closed ? '' : `<button type="button" class="btn" data-sp="draft">${esc(t('c.saveDraft'))}</button>${b.status === 'Submitted' ? `<button type="button" class="btn btn-d" data-sp="withdraw">${esc(t('sp.withdraw'))}</button>` : ''}<button type="submit" class="btn btn-p">${esc(t(b.status === 'Submitted' ? 'sp.submitRev' : 'sp.submit'))}</button>`;
    return block(t(b.status === 'Draft' ? 'sp.bidDraft' : 'sp.d.bid'), `<form id="sp-bid" class="stack" novalidate>${e._ ? `<div class="alert alert-danger" role="alert">${esc(S.errText(e._))}</div>` : ''}
      ${linesTbl}<dl class="dl dl-tot mt" id="sb-tot" aria-live="polite">${totInner(tt)}</dl>${secHtml}
      ${S.field('sb', e, 'note', t('sp.note'), f.note || '', { area: true, dis: closed })}${commit}
      <div class="row-acts">${acts}</div></form>`);
  }
  function addendaBlock(tn, closed) {
    const A = tn.addenda || [];
    return block(t('sp.add.title', { n: A.length }), A.length ? A.map((a) => { const mine = a.acks.find((x) => x[0] === VID());
      return `<div class="alert alert-${mine ? 'info' : 'warning'}" role="status"><b>${esc(t('sp.add.no', { no: String(a.no).padStart(2, '0'), at: a.at }))}</b> <span class="chips chips-inline">${a.lines.map(mtag).join('')}</span><div>${esc(tvx(a.summary))}</div>
        <div class="row-acts between mt-s"><span class="small">${esc(mine ? t('sp.add.mine', { at: mine[1] }) : t('sp.add.need'))}</span>${mine || closed ? '' : `<button class="btn btn-sm btn-p" data-sp="ack" data-no="${a.no}">${esc(t('sp.add.btn'))}</button>`}</div></div>`; }).join('') : `<p class="small muted mt-0">${esc(t('sp.add.none'))}</p>`, { span: 6 });
  }
  function qaBlock(tn, closed) {
    const myQs = (tn.questions || []).filter((q) => q.from === VID()); const Q = tn.qa || [];
    return block(t('sp.qa.title', { n: Q.length }), `${Q.length ? `<ul class="plain rows">${Q.map((x) => `<li><span class="small muted">${esc(t('sp.qa.meta', { n: x.no, at: x.at }))}</span> ${mtag(x.line)}<div><b>${esc(x.q)}</b></div><div class="small">${esc(t('sp.qa.answer', { a: x.a }))}</div></li>`).join('')}</ul>` : `<p class="small muted mt-0">${esc(t('sp.qa.none'))}</p>`}
      ${myQs.length ? `<h3 class="h-sub">${esc(t('sp.qa.mine'))}</h3><ul class="plain small">${myQs.map((q) => `<li>${mtag(q.line)} ${esc(q.q)} <span class="muted">· ${esc(q.at)}</span> ${pill('Awaiting answer', 'warning')}</li>`).join('')}</ul>` : ''}
      ${st.q ? `<form id="sp-q" class="stack mt" novalidate><div class="form-grid">${S.field('spq', st.qerr, 'line', t('sp.qa.line'), st.q.line, { options: tn.lines.map((l) => [l.mat, l.mat]) })}${S.field('spq', st.qerr, 'q', t('sp.qa.q'), st.q.q, { area: true, req: true, hint: t('sp.qa.hint') })}</div>${formBtns('q-cancel', t('sp.qa.send'))}</form>` : ''}`,
    { span: 6, actions: closed || st.q ? '' : `<button class="btn btn-sm" data-sp="q-open">${esc(t('sp.qa.ask'))}</button>` });
  }
  function readBid(root) {
    const f = st.bid; const x = S.read(root, '#sp-bid');
    root.querySelectorAll('[data-sb=price],[data-sb=lead]').forEach((el) => { const l = f.lines[+el.dataset.i]; if (el.dataset.sb === 'price') l.price = el.value.trim() === '' ? null : S.money(el.value); else l.lead = el.value.trim() === '' ? null : +el.value; });
    root.querySelectorAll('[data-sb=nobid]').forEach((el) => { f.lines[+el.dataset.i].nobid = el.checked; });
    f.sec = { form: x.form, bank: x.bank, ref: x.ref, amount: x.amount ? S.money(x.amount) : null, valid: x.valid, file: x.file };
    f.note = x.note; f.c1 = (x.c1 || []).length > 0; f.c2 = (x.c2 || []).length > 0; f.consent = (x.consent || []).length > 0;
  }
  function saveBid(root, id, submit) {
    const d = tndDoc(id); const tn = D().tenders[id]; const b = bidOf(id);
    if (isClosed(d)) { App.toast(t('sp.e.closed')); return; }
    readBid(root); const f = st.bid; const e = {};
    if (submit) {
      f.lines.forEach((l, i) => { if (l.nobid) return; if (!(l.price > 0)) e['l' + i] = 'sp.e.price'; else if (!(l.lead > 0)) e['l' + i] = 'sp.e.lead'; });
      if (f.lines.every((l) => l.nobid)) e._ = 'sp.e.allNo';
      if ((tn.addenda || []).some((a) => !a.acks.some((x) => x[0] === VID()))) e._ = 'sp.e.ack';
      if (secReq(tn)) { if (!(f.sec.amount >= secReq(tn))) e.amount = ['sp.e.atLeast', { v: vnd(secReq(tn)) }]; if (!S.validDate(f.sec.valid)) e.valid = 'c.dateFmt'; else if (App.dt(f.sec.valid) < App.dt(App.addDays(d.close, 90))) e.valid = ['sp.e.validUntil', { d: App.addDays(d.close, 90) }]; if (!f.sec.file) e.file = 'sp.e.secFile'; else if (!/\.pdf$/i.test(f.sec.file)) e.file = 'sp.e.pdf'; }
      if (!f.c1 || !f.c2 || !f.consent) e.commit = 'sp.e.commit';
    }
    st.berr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#sp-bid'); return; }
    Object.assign(b, { lines: f.lines.map((l) => ({ ...l })), sec: f.sec, note: f.note, consent: f.consent, c1: f.c1, c2: f.c2 });
    if (!submit) { if (b.status !== 'Submitted') b.status = 'Draft'; st.bid = null; App.render(); App.toast(t('sp.t.draft')); return; }
    const at = clock(); const tb = tn.bidders.find((x) => x.vid === VID());
    const rev = b.status === 'Submitted';
    if (!b.rc || b.status === 'Withdrawn') b.rc = `RC-${id.slice(-3)}-${String(tn.bidders.filter((x) => x.rc).length + (tb && tb.rc ? 0 : 1) + (b.status === 'Withdrawn' ? 1 : 0)).padStart(3, '0')}`;
    b.ver += 1; b.status = 'Submitted'; b.at = at; b.log.push([at, `${rev ? 'Revised' : 'Submitted'} · ${b.rc} v${b.ver}`]);
    if (tb) Object.assign(tb, { rc: b.rc, at, status: 'Submitted', warn: rev ? `Revised v${b.ver}` : undefined });
    d.bids = tn.bidders.filter((x) => x.status === 'Submitted').length;
    audit('Bids and tenders', rev ? 'au.bidRev' : 'au.bidSub', { rc: b.rc, v: b.ver }, id);
    st.bid = null; App.render(); App.toast(t(rev ? 'sp.t.rev' : 'sp.t.sub', { rc: b.rc, at }));
  }

  /* ---------- quotations ---------- */
  const QSUBS = [['', 'sp.q.bids'], ['spot', 'sp.q.spot']];
  function quotations(subArg) {
    const cur = App.sub(QSUBS, subArg || '');
    const rows = Object.entries(P().bids).map(([id, b]) => { const tn = D().tenders[id]; const d = tndDoc(id); return { id, b, tn, d, tt: totals(tn, b.lines) }; });
    const bids = block(t('sp.q.bidsN', { n: rows.length }), table([
      { h: t('sp.c.tender'), r: (r) => `<a class="mono" href="#/supplier/invitations/${esc(r.id)}">${esc(r.id)}</a><div class="small">${esc(r.d.title)}</div>`, w: 'minmax(200px,2fr)' },
      { h: t('sp.c.linesQ'), r: (r) => r.tn.lines.map((l, i) => (r.b.lines[i].nobid ? `<div class="small">${esc(l.mat)} · ${esc(t('sp.c.nobid'))}</div>` : r.b.lines[i].price ? `<div class="small">${esc(l.mat)} · ${vnd(r.b.lines[i].price)} · ${esc(t('sp.days', { n: r.b.lines[i].lead }))}</div>` : `<div class="small muted">${esc(l.mat)} · —</div>`)).join(''), w: 'minmax(220px,2fr)' },
      { h: t('sp.tot.net'), r: (r) => vnd(r.tt.net), cls: 'num', w: '150px' },
      { h: t('sp.c.receipt'), r: (r) => (r.b.rc ? `<span class="mono">${esc(r.b.rc)}</span> v${r.b.ver}<div class="small muted">${esc(r.b.at)}</div>` : '—'), w: '150px' },
      { h: t('c.status'), r: (r) => { const res = P().results.find((x) => x.tnd === r.id); return res ? `<span class="pill pill-${res.outcome === 'Awarded' ? 'success' : 'neutral'}">${esc(t('sp.q.rank', { o: tv(res.outcome), r: res.rank, n: res.of }))}</span>` : pill(r.b.status, r.b.status === 'Submitted' ? 'success' : 'neutral'); }, w: '170px' }
    ], rows, { label: t('sp.q.bids') }));
    const spot = block(t('sp.q.spotN', { n: P().quotes.length }), table([
      { h: t('sp.c.quote'), r: (q) => `<span class="mono">${esc(q.id)}</span><div class="small muted">${esc(tv(q.for))}</div>`, w: 'minmax(180px,1.6fr)' },
      { h: t('c.mid'), r: (q) => mtag(q.mat), w: '120px' }, { h: t('sp.c.qty'), r: (q) => `${num(q.qty)} ${esc(mat(q.mat).uom)}`, cls: 'num', w: '90px' },
      { h: t('sp.c.unit'), r: (q) => vnd(q.price), cls: 'num', w: '150px' }, { h: t('sp.c.sentValid'), r: (q) => `${esc(q.date)} · ${esc(q.valid)}`, w: '190px' }, { h: t('c.status'), r: (q) => pill(q.status, 'info'), w: '100px' }
    ], P().quotes, { label: t('sp.q.spot'), empty: t('sp.q.none') }));
    return layout({ title: t('nav.s.quotations'), subtitle: esc(t('sp.q.sub')), alerts: App.unknownSub(QSUBS, subArg),
      kpis: [kpi(t('sp.k.submitted'), String(rows.filter((r) => r.b.status === 'Submitted').length), ''), kpi(t('sp.k.drafts'), String(rows.filter((r) => r.b.status === 'Draft').length), ''), kpi(t('sp.k.spot'), String(P().quotes.length), ''), kpi(t('sp.k.awarded'), String(P().results.filter((r) => r.outcome === 'Awarded').length), '', 'success')],
      subnav: App.subnav('supplier/quotations', QSUBS, cur), blocks: [cur === 'spot' ? spot : bids] });
  }

  /* ---------- F-92 / F-93 POs ---------- */
  function poList() {
    const rows = myPos(); const toConf = rows.filter((d) => { const c = App.po.det(d.id).confirm; return c && /Not confirmed|Awaiting/.test(c.status); }); const open = rows.filter((d) => !/Closed|Cancelled|declined/.test(d.status));
    return layout({ title: t('nav.s.pos'), subtitle: esc(t('sp.po.sub')),
      kpis: [kpi(t('sp.k.toConfirm'), String(toConf.length), esc(toConf.map((d) => d.id).join(', ') || t('c.none')), toConf.length ? 'danger' : ''), kpi(t('sp.k.openPos'), String(open.length), ''),
        kpi(t('sp.k.openVal'), App.ty(open.reduce((a, d) => a + d.value, 0)), ''), kpi(t('sp.k.ncrOpen'), String(myNcr().filter((n) => n.status !== 'Closed').length), '', myNcr().some((n) => n.status !== 'Closed') ? 'warning' : '')],
      blocks: [block(t('sp.po.title', { n: rows.length }), table([
        { h: 'PO', r: (d) => `<a class="mono" href="#/supplier/pos/${esc(d.id)}">${esc(d.id)}</a> <span class="small muted">Rev.${App.po.det(d.id).rev}</span><div class="small">${esc(tv(d.title))}</div>`, w: 'minmax(220px,2fr)' },
        { h: t('c.mids'), r: (d) => `<span class="chips chips-inline">${d.mats.map(mtag).join('')}</span>`, w: '120px' },
        { h: t('sp.c.delAcc'), r: (d) => { const r = App.po.sched(d.id); return `${esc(d.qty)}<div class="small muted">${num(r.reduce((a, x) => a + x.delivered, 0))} · ${num(r.reduce((a, x) => a + x.accepted, 0))}</div>`; }, cls: 'num', w: '140px' },
        { h: t('sp.k.poVal'), r: (d) => vnd(d.value), cls: 'num', w: '150px' },
        { h: t('c.status'), r: (d) => { const p = App.po.det(d.id); const c = p.confirm; return pill(d.status, poTone(d.status)) + (c && c.status === 'Awaiting re-confirmation' ? `<div><span class="pill pill-warning">${esc(t('sp.po.reconfRev', { r: p.rev }))}</span></div>` : ''); }, w: '170px' },
        { h: t('sp.c.next'), r: (d) => { const o = App.po.openSlots(d.id)[0]; return o ? `${num(o.qty)} ${esc(mat(o.mat).uom)}<div class="small muted">${esc(o.due)}</div>` : '—'; }, w: '120px' },
        { h: '', r: (d) => { const c = App.po.det(d.id).confirm; return c && /Not confirmed|Awaiting/.test(c.status) ? `<a class="btn btn-sm btn-p" href="#/supplier/pos/${esc(d.id)}">${esc(t(c.status === 'Not confirmed' ? 'sp.po.confDec' : 'sp.po.reconf'))}</a>` : `<a class="btn btn-sm" href="#/supplier/pos/${esc(d.id)}">${esc(t('c.open'))}</a>`; }, w: '150px' }
      ], rows, { label: t('nav.s.pos') }))] });
  }
  const PSUBS = [['', 'sp.pd.overview'], ['deliveries', 'sp.pd.deliv'], ['ncr', 'sp.pd.ncr'], ['invoices', 'sp.pd.inv'], ['print', 'sp.pd.print']];
  function poDetail(id, subArg) {
    const d = S.docOf(id);
    if (!d || d.type !== 'PO' || d.vendor !== VID() || !myPos().includes(d)) return notFound('sp.w.po', id, '#/supplier/pos', 'sp.backPo');
    const cur = App.sub(PSUBS, subArg || '');
    const p = App.po.det(id); const c = p.confirm || {}; const tt = App.po.vatSplit(id); const rows = App.po.sched(id);
    const pend = p.revs.find((r) => /Pending/.test(r.status)); const conf = c.status === 'Not confirmed' || c.status === 'Awaiting re-confirmation';
    const ncrs = myNcr().filter((n) => n.po === id); const invs = myInv().filter((x) => (D().invoices[x.id] || {}).po === id);
    const kpis = [kpi(t('sp.k.poVal'), vnd(tt.net), esc(t('c.exclVat'))), kpi(t('sp.k.delivered'), num(rows.reduce((a, x) => a + x.delivered, 0)), esc(d.qty)), kpi(t('sp.k.accepted'), num(rows.reduce((a, x) => a + x.accepted, 0)), ''),
      kpi(t('sp.k.conf'), esc(tv(c.status || '—')), c.at ? esc(c.at) : '', c.status === 'Confirmed' ? 'success' : conf ? 'danger' : ''), kpi(t('sp.k.ncrOpen'), String(ncrs.filter((n) => n.status !== 'Closed').length), '', ncrs.some((n) => n.status !== 'Closed') ? 'warning' : '')];
    let blocks; let actions = '';
    if (cur === 'print') {
      blocks = [App.po.printDoc(d)];
      actions = `<button class="btn" data-sp="print">${esc(t('sp.printBtn'))}</button><button class="btn btn-p" data-act="toast" data-msg="${esc(t('sp.pdfMsg', { id, r: p.rev }))}">${esc(t('sp.pdf'))}</button>`;
    } else if (cur === 'deliveries') blocks = [schedBlock(rows, id), grnBlock(myGrns().filter((g) => g.po === id))];
    else if (cur === 'ncr') blocks = [ncrBlock(ncrs)];
    else if (cur === 'invoices') blocks = [invListBlock(invs, false)];
    else {
      const dec = st.dec ? `<form id="sp-dec" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">${esc(t('sp.cf.decTitle', { id }))}</h3>${S.field('spd', st.derr ? { reason: st.derr } : {}, 'reason', t('sp.cf.reason'), st.dec.reason, { area: true, req: true, hint: t('sp.cf.reasonHint') })}<div class="row-acts"><button type="button" class="btn btn-sm" data-sp="dec-cancel">${esc(t('c.back'))}</button><button type="submit" class="btn btn-sm btn-d">${esc(t('sp.cf.decBtn'))}</button></div></form>` : '';
      const body = c.status === 'Confirmed' ? `<p class="mt-0">${pill('Confirmed', 'success')} ${esc(t('sp.cf.by', { b: tv(c.by), at: c.at }))}${c.note ? ' · ' + esc(tvx(c.note)) : ''}</p>`
        : c.status === 'Declined' ? `<div class="alert alert-danger" role="status"><b>${esc(t('sp.cf.declined'))}</b> ${esc(c.note)}</div>`
          : `<div class="alert alert-warning" role="status"><b>${esc(c.status === 'Not confirmed' ? t('sp.cf.wait') : t('sp.cf.waitRev', { r: p.rev }))}</b> ${esc(t('sp.cf.sent', { d: c.sent || '' }))}${c.note ? ' · ' + esc(tvx(c.note)) : ''}</div>`;
      const confirmB = block(t('sp.cf.title'), body + (pend ? `<div class="alert alert-info" role="status">${esc(t('sp.cf.pend', { r: pend.no, d: tvx(pend.diff) }))}</div>` : '') + dec
        + `<dl class="dl mt"><dt>${esc(t('sp.pd.terms'))}</dt><dd>${esc(tvx(p.terms))}</dd></dl><h3 class="h-sub">${esc(t('sp.revs'))}</h3>${p.revs.length ? `<ol class="plain rev-list">${p.revs.map((r) => `<li><b>Rev.${r.no}</b> ${pill(r.status, /Pending|awaiting/.test(r.status) ? 'warning' : 'neutral')} <span class="small muted">${esc(r.at)}</span><div class="small">${esc(tvx(r.diff))}</div></li>`).join('')}</ol>` : `<p class="small muted mt-0">${esc(t('sp.revs.none'))}</p>`}`,
      { span: 6, actions: conf && !st.dec ? `${c.status === 'Not confirmed' ? `<button class="btn btn-sm btn-d" data-sp="dec-open">${esc(t('sp.cf.decline'))}</button>` : ''}<button class="btn btn-sm btn-p" data-sp="confirm">${esc(c.status === 'Not confirmed' ? t('sp.cf.confirm') : t('sp.po.reconfRev', { r: p.rev }))}</button>` : '' });
      const lines = block(t('sp.pl.title', { n: p.lines.length }), table([
        { h: t('c.mid'), r: (l) => `${mtag(l.mat)}<div class="small">${esc(mat(l.mat).name)}</div>`, w: 'minmax(170px,2fr)' },
        { h: t('sp.c.qty'), r: (l) => `${num(l.qty - (l.cancelled || 0))} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '100px' },
        { h: t('sp.c.unit'), r: (l) => `${vnd(l.price)}<div class="small muted">VAT ${esc(mat(l.mat).vat + '%')}</div>`, cls: 'num', w: '150px' },
        { h: t('sp.c.amount'), r: (l) => vnd((l.qty - (l.cancelled || 0)) * l.price), cls: 'num', w: '150px' }
      ], p.lines, { label: t('sp.pl.title', { n: p.lines.length }) }) + `<dl class="dl dl-tot mt"><dt>${esc(t('sp.tot.net'))}</dt><dd>${vnd(tt.net)}</dd><dt>VAT</dt><dd>${vnd(tt.vat)}</dd><dt class="tot">${esc(t('sp.tot.gross'))}</dt><dd class="tot"><b>${vnd(tt.gross)}</b></dd></dl>`, { span: 6 });
      blocks = [lines, confirmB];
    }
    return layout({
      crumbs: `<a href="#/supplier/pos">${esc(t('nav.s.pos'))}</a> / ${esc(id)}`, titleHtml: `<span class="mono">${esc(id)}</span> <span class="small muted">Rev.${p.rev}</span> ${esc(tv(d.title))}`,
      subtitle: `${pill(d.status, poTone(d.status))} · ${esc(t('sp.pd.sub', { b: p.buyer, site: p.site }))}`,
      actions, alerts: App.unknownSub(PSUBS, subArg), kpis,
      subnav: App.subnav('supplier/pos/' + id, PSUBS.map((x) => (x[0] === 'ncr' && ncrs.some((n) => n.status !== 'Closed' && !n.response) ? [x[0], x[1], '!'] : x)), cur), blocks
    });
  }
  function schedBlock(rows, poId) {
    return block(t('sp.sch'), table([
      { h: t('c.mid'), r: (r) => mtag(r.mat), w: '120px' }, { h: t('sp.c.qty'), r: (r) => `${num(r.qty)} ${esc(mat(r.mat).uom)}`, cls: 'num', w: '100px' },
      { h: t('sp.c.promised'), r: (r) => `${esc(r.due)}${r.ncr ? `<div class="small muted">${esc(t('sp.repl', { id: r.ncr }))}</div>` : ''}${reqPill(r)}`, w: '170px' },
      { h: t('sp.c.grn'), r: (r) => (r.g ? `<span class="mono">${esc(r.gid)}</span> ${esc(r.date)}` : r.rec ? esc(t('sp.archived')) : r.cx ? pill('Cancelled', 'danger') : r.asn ? `<span class="mono small">${esc(r.asn.id)}</span>` : esc(t('sp.open'))), w: '160px' },
      { h: t('sp.c.accRej'), r: (r) => (r.rec ? `${num(r.accepted)} · ${num(r.rejected)}` : '—'), cls: 'num', w: '130px' },
      { h: t('sp.c.otif'), r: (r) => (r.onTime == null ? '—' : otifPills(r)), w: '170px' },
      { h: '', r: (r) => (!r.rec && !r.cx ? `<button class="btn btn-sm" data-sp="asn-open" data-po="${esc(poId)}" data-li="${r.li}" data-si="${r.si}"${r.asn ? ' disabled' : ''}>${esc(t('sp.asn.send'))}</button>` : ''), w: '120px' }
    ], rows, { label: t('sp.sch') }) + deliveryForms());
  }
  function grnBlock(grns) {
    return block(t('sp.dl.recN', { n: grns.length }), table([
      { h: 'GRN', r: (g) => `<span class="mono">${esc(g.id)}</span><div class="small muted">${esc(g.date)}</div>`, w: '150px' }, { h: 'PO', r: (g) => `<a class="mono" href="#/supplier/pos/${esc(g.po)}">${esc(g.po)}</a>`, w: '140px' },
      { h: t('sp.c.accRej'), r: (g) => g.lines.map((x) => `${num(x[3])} · ${num(x[4])}`).join('<br>'), cls: 'num', w: '140px' },
      { h: t('sp.c.otif'), r: (g) => { const r = App.po.sched(g.po).filter((x) => x.gid === g.id); return r.map(otifPills).join('<br>') || '—'; }, w: 'minmax(170px,1.4fr)' }
    ], grns.slice(0, 12), { label: t('sp.dl.rec') }));
  }
  function ncrBlock(ncrs) {
    return block(t('sp.ncr.title', { n: ncrs.length }), ncrs.length ? `<ul class="plain ncr-list">${ncrs.map((n) => { const g = D().grns[n.grn]; const gl = (g && g.lines.find((x) => x[4] || x[3] < x[2])) || (g && g.lines[0]); const open = n.status !== 'Closed'; const u = mat(n.mat).uom;
      const form = st.ncr && st.ncr.id === n.id ? `<form id="sp-ncr" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">${esc(t('sp.ncr.form'))}</h3>${S.field('spn', st.nerr, 'opt', t('sp.ncr.opt'), st.ncr.opt, { options: ['Replace', 'Return and credit note', 'Offer a discount'] })}${S.field('spn', st.nerr, 'disc', t('sp.ncr.disc'), st.ncr.disc, { mode: 'decimal' })}${S.field('spn', st.nerr, 'comment', t('sp.ncr.comment'), st.ncr.comment, { area: true, req: true, hint: t('sp.ncr.hint') })}${formBtns('ncr-cancel', t('sp.ncr.send'))}</form>` : '';
      return `<li><div class="row-acts between"><span><b class="mono">${esc(n.id)}</b> ${mtag(n.mat)} ${pill(n.status, open ? 'warning' : 'success')}</span>${open && !n.response && !st.ncr ? `<button class="btn btn-sm btn-p" data-sp="ncr-open" data-id="${esc(n.id)}">${esc(t('sp.ncr.respond'))}</button>` : ''}</div>
        <div class="small">${esc(t('sp.ncr.qty', { g: n.grn, po: n.po, d: gl ? num(gl[2]) : '—', a: gl ? num(gl[3]) : '—', r: num(n.qty), u }))}</div>
        <div class="small">${esc(t('sp.ncr.reason', { r: gl ? tvx(gl[5]) : '', i: n.by, a: tv(n.action) + (n.discount ? ' ' + num(n.discount) + '%' : '') }))}</div>
        ${g ? `<div class="small muted">${esc(t('sp.ncr.docs', { d: g.checks.map(([c, ok]) => `${tv(c)} ${ok ? tv('OK') : t('sp.ncr.missing')}`).join(' · ') }))}</div>` : ''}
        ${n.response ? `<div class="small tone-success">${esc(t('sp.ncr.resp', { at: n.response.at, o: tv(n.response.opt) + (n.response.disc ? ' ' + num(n.response.disc) + '%' : ''), c: n.response.comment }))}</div>` : ''}
        ${open ? `<div class="small tone-warning">${esc(t('sp.ncr.block', { n: num(n.qty), u }))}</div>` : ''}${form}</li>`; }).join('')}</ul>` : App.emptyState(t('sp.ncr.none')));
  }
  function deliveryForms() {
    const a = st.asn; const ae = st.aerr; const ch = st.chg; const ce = st.cerr;
    return (a ? `<form id="sp-asn" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">${esc(t('sp.asn.title', { po: a.po, m: a.mat }))}</h3><div class="form-grid">${S.field('spa', ae, 'ship', t('sp.asn.date'), a.ship, { req: true, ph: 'dd/mm/yyyy' })}${S.field('spa', ae, 'qty', t('sp.asn.qty', { u: mat(a.mat).uom }), a.qty, { req: true, mode: 'decimal' })}${S.field('spa', ae, 'vehicle', t('sp.asn.veh'), a.vehicle, { req: true, ph: '51C-123.45 · Nguyễn Văn A' })}${S.field('spa', ae, 'docs', t('sp.asn.docs'), a.docs, { ph: 'CQ_lot.pdf', hint: t(/^CON-240/.test(a.mat) ? 'sp.asn.docsSteel' : 'sp.asn.docsOpt') })}</div>${formBtns('asn-cancel', t('sp.asn.send'))}</form>` : '')
      + (ch ? `<form id="sp-chg" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">${esc(t('sp.chg.title', { po: ch.po, m: ch.mat, d: ch.due }))}</h3><div class="form-grid">${S.field('spc', ce, 'to', t('sp.chg.to'), ch.to, { req: true, ph: 'dd/mm/yyyy' })}${S.field('spc', ce, 'reason', t('sp.cf.reason'), ch.reason, { area: true, req: true })}</div><p class="small muted mt-0">${esc(t('sp.chg.note'))}</p>${formBtns('chg-cancel', t('sp.chg.send'))}</form>` : '');
  }

  /* ---------- F-93 deliveries + F-96 NCR ---------- */
  const LSUBS = [['', 'sp.dl.open'], ['receipts', 'sp.dl.rec'], ['ncr', 'sp.dl.ncr']];
  function deliveries(subArg) {
    const cur = App.sub(LSUBS, subArg || '');
    const open = myPos().filter((d) => !/declined|Cancelled|Closed/.test(d.status) && App.po.det(d.id).confirm && App.po.det(d.id).confirm.status === 'Confirmed').flatMap((d) => App.po.openSlots(d.id).map((r) => Object.assign({ po: d.id }, r)));
    const grns = myGrns(); const ncrs = myNcr();
    const sched = block(t('sp.dl.openN', { n: open.length }), table([
      { h: 'PO', r: (r) => `<a class="mono" href="#/supplier/pos/${esc(r.po)}">${esc(r.po)}</a>`, w: '140px' }, { h: t('c.mid'), r: (r) => mtag(r.mat), w: '120px' },
      { h: t('sp.c.qty'), r: (r) => `${num(r.qty)} ${esc(mat(r.mat).uom)}`, cls: 'num', w: '100px' },
      { h: t('sp.c.promised'), r: (r) => `${esc(r.due)}${r.ncr ? `<div class="small muted">${esc(t('sp.repl', { id: r.ncr }))}</div>` : ''}${reqPill(r)}`, w: '180px' },
      { h: 'ASN', r: (r) => (r.asn ? `<span class="mono small">${esc(r.asn.id)}</span><div class="small">${esc(t('sp.asn.ship', { d: r.asn.ship, q: num(r.asn.qty) }))}</div>` : '—'), w: '150px' },
      { h: t('c.actions'), r: (r) => `<div class="nacts"><button class="btn btn-sm" data-sp="asn-open" data-po="${esc(r.po)}" data-li="${r.li}" data-si="${r.si}"${r.asn ? ' disabled' : ''}>${esc(t('sp.asn.send'))}</button><button class="btn btn-sm" data-sp="chg-open" data-po="${esc(r.po)}" data-li="${r.li}" data-si="${r.si}"${r.req && /Pending/.test(r.req.status) ? ' disabled' : ''}>${esc(t('sp.chg.btn'))}</button></div>`, w: 'minmax(220px,1.4fr)' }
    ], open, { label: t('sp.dl.open'), empty: t('sp.dl.none') }) + deliveryForms());
    return layout({ title: t('nav.s.deliveries'), subtitle: esc(t('sp.dl.sub')), alerts: App.unknownSub(LSUBS, subArg),
      kpis: [kpi(t('sp.dl.open'), String(open.length), ''), kpi(t('sp.k.asn'), String(P().asns.length), ''), kpi(t('sp.k.chg'), String(open.filter((r) => r.req && /Pending/.test(r.req.status)).length), ''),
        kpi(t('sp.k.grns'), String(grns.length), ''), kpi(t('sp.k.ncrOpen'), String(ncrs.filter((n) => n.status !== 'Closed').length), '', ncrs.some((n) => n.status !== 'Closed') ? 'warning' : '')],
      subnav: App.subnav('supplier/deliveries', LSUBS.map((x) => (x[0] === 'ncr' && ncrs.some((n) => n.status !== 'Closed' && !n.response) ? [x[0], x[1], '!'] : x)), cur),
      blocks: [cur === 'receipts' ? grnBlock(grns) : cur === 'ncr' ? ncrBlock(ncrs) : sched] });
  }

  /* ---------- F-95 invoices ---------- */
  /* P5-02 · replacements count; the invoice they replace does not */
  const invoicedQtyGrn = (gid) => { const all = Object.values(D().invoices); const replaced = new Set(all.filter((v) => v.type === 'Replacement' && v.orig).map((v) => v.orig.split(' (')[0]));
    return all.filter((v) => v.grn === gid && !replaced.has(v.kh + ' · ' + v.no)).reduce((a, v) => a + v.lines.reduce((s, x) => s + (x[0] ? x[2] : 0), 0), 0); };
  const billable = () => myGrns().filter((g) => !D().grns[g.id].ses).map((g) => ({ g, acc: g.lines.reduce((a, x) => a + x[3], 0) - invoicedQtyGrn(g.id) })).filter((x) => x.acc > 0);
  /* P5-11 · 34-char Mã CQT: '00' + 32 hex derived from the invoice number */
  const cqtOf = (no) => { let h = ''; let x = 2166136261; for (let i = 0; i < 4; i++) { for (const c of no + i) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619) >>> 0; } h += x.toString(16).toUpperCase().padStart(8, '0'); } return '00' + h.slice(0, 32); };
  function parsed(f) {
    const g = D().grns[f.grn]; const p = App.po.det(g.po); const gl = g.lines[0]; const l = p.lines[gl[0]]; const m = mat(l.mat);
    const qty = f.type === 'Original' ? billable().find((x) => x.g.id === f.grn).acc : gl[3];
    const no = String(1250 + Object.keys(D().invoices).length).padStart(8, '0');
    return { mau: '1', kh: '1C26TMP', no, date: D().today, mst: V().mst, cqt: cqtOf(no), sig: V().name, line: [l.mat, m.name, qty, l.price, 0], vat: m.vat, net: qty * l.price, po: g.po, grn: f.grn, li: gl[0] };
  }
  function invListBlock(rows, withNew) {
    return block(t('sp.iv.listN', { n: rows.length }), rows.length ? `<ul class="plain rows">${rows.map((d) => { const v = D().invoices[d.id]; const i = stageOf(d); const due = App.addDays(d.date, termsDays());
      return `<li><div class="row-acts between"><span><b class="mono">${esc(d.id)}</b> <span class="small mono">${esc(v.kh)} · ${esc(v.no)}</span> ${pill(v.type, 'neutral')} ${pill(d.status, /Ready|Paid|Matched/.test(d.status) ? 'success' : /Blocked|Exception/.test(d.status) ? 'danger' : 'info')}<div class="small">${esc(t('sp.iv.line', { t: d.title, po: v.po, g: v.grn, v: vnd(d.value) }))}</div></span><span class="small num">${esc(t('sp.iv.dates', { d: d.date, due }))}</span></div>
        ${steps(STAGES, i, t('sp.iv.stLabel', { id: d.id }))}${v.exported ? `<div class="small muted">${esc(t('sp.iv.exp', { d: v.exported.slice(0, 10) }))}</div>` : ''}${v.orig ? `<div class="small muted">${esc(t('sp.iv.repl', { o: tv(v.orig) }))}</div>` : ''}</li>`; }).join('')}</ul>` : App.emptyState(withNew ? t('sp.iv.none') : t('sp.pi.none')),
    { actions: billable().length ? `<a class="btn btn-sm${withNew ? ' btn-p' : ''}" href="#/supplier/invoices/new">${esc(t('sp.pi.new'))}</a>` : '' });
  }
  const VSUBS = [['', 'sp.iv.list'], ['new', 'sp.iv.new']];
  function invoices(subArg) {
    const cur = App.sub(VSUBS, subArg || ''); const rows = myInv(); const bl = billable();
    if (cur === 'new' && !st.inv && bl.length) st.inv = { grn: bl[0].g.id, type: 'Original', orig: '', xml: '', pdf: '', parsed: null };
    const f = st.inv; const e = st.ierr;
    let form;
    if (!f) form = block(t('sp.iv.form'), App.emptyState(t('sp.iv.noGrn')));
    else {
      const px = f.parsed;
      form = block(t('sp.iv.form'), `<form id="sp-inv" class="stack" novalidate>${e._ ? `<div class="alert alert-danger" role="alert">${esc(S.errText(e._))}</div>` : ''}<div class="form-grid">
        ${S.field('spi', e, 'grn', t('sp.iv.grn'), f.grn, { options: bl.map((x) => [x.g.id, t('sp.iv.grnOpt', { g: x.g.id, po: x.g.po, n: num(x.acc) })]) })}
        ${S.field('spi', e, 'type', t('sp.iv.type'), f.type, { options: ['Original', 'Adjustment', 'Replacement'] })}
        ${f.type !== 'Original' ? S.field('spi', e, 'orig', t('sp.iv.orig'), f.orig, { options: [['', t('c.choose')]].concat(rows.map((d) => [d.id, `${d.id} · ${D().invoices[d.id].kh} · ${D().invoices[d.id].no}`])), req: true }) : ''}
        ${S.field('spi', e, 'xml', t('sp.iv.xml'), f.xml, { req: true, ph: '1C26TMP_00001262.xml', hint: t('sp.iv.xmlHint') })}${S.field('spi', e, 'pdf', t('sp.iv.pdf'), f.pdf, { req: true, ph: '1C26TMP_00001262.pdf' })}</div>
        <div class="row-acts start"><button type="button" class="btn btn-sm" data-sp="inv-parse">${esc(t('sp.iv.read'))}</button></div>
        ${px ? `<h3 class="h-sub">${esc(t('sp.iv.fields'))}</h3><dl class="dl"><dt>${esc(t('sp.iv.mau'))}</dt><dd class="mono">${esc(px.mau)} · ${esc(px.kh)} · ${esc(px.no)}</dd><dt>${esc(t('sp.iv.date'))}</dt><dd>${esc(px.date)}</dd><dt>${esc(t('sp.iv.mst'))}</dt><dd>${esc(px.mst)}</dd><dt>Mã CQT</dt><dd class="mono small">${esc(px.cqt)}</dd><dt>${esc(t('sp.iv.sig'))}</dt><dd>${esc(t('sp.iv.sigV', { n: px.sig }))}</dd></dl>
          <div class="chips">${[['sp.ck.schema', true], ['sp.iv.sig', true], ['sp.ck.mst', px.mst === V().mst], ['sp.ck.cqt', !!px.cqt], ['sp.ck.mid', true], ['sp.ck.qty', true]].map(([n, ok]) => `<span class="pill pill-${ok ? 'success' : 'danger'}">${ok ? '✓' : '!'} ${esc(t(n))}</span>`).join(' ')}</div>
          ${table([{ h: t('sp.iv.lineH'), r: (x) => esc(x[1]), w: 'minmax(180px,2fr)' }, { h: t('c.mid'), r: (x) => mtag(x[0]), w: '120px' }, { h: t('sp.iv.poLine'), r: () => `${esc(px.po)} L${px.li + 1}<div class="small muted">${esc(px.grn)}</div>`, w: '150px' }, { h: t('sp.c.qty'), r: (x) => num(x[2]), cls: 'num', w: '80px' }, { h: t('sp.iv.unit'), r: (x) => vnd(x[3]), cls: 'num', w: '130px' }, { h: t('sp.c.amount'), r: (x) => vnd(x[2] * x[3]), cls: 'num', w: '150px' }], [px.line], { label: t('sp.iv.parsedL') })}
          <dl class="dl dl-tot mt"><dt>${esc(t('sp.tot.net'))}</dt><dd>${vnd(px.net)}</dd><dt>VAT ${esc(S.vatLabel(px.vat))}</dt><dd>${vnd(px.net * px.vat / 100)}</dd><dt class="tot">${esc(t('sp.tot.gross'))}</dt><dd class="tot"><b>${vnd(px.net * (1 + px.vat / 100))}</b></dd></dl>` : `<p class="small muted mt-0">${esc(t('sp.iv.readFirst'))}</p>`}
        ${formBtns('inv-cancel', t('sp.iv.submit'))}</form>`);
    }
    const inProg = rows.filter((d) => stageOf(d) < 3).length;
    return layout({ title: t('nav.s.invoices'), subtitle: esc(t('sp.iv.sub', { t: tv((V() || {}).terms || '') })), alerts: App.unknownSub(VSUBS, subArg),
      kpis: [kpi(t('sp.iv.list'), String(rows.length), ''), kpi(t('sp.k.ivOpen'), String(inProg), ''), kpi(t('sp.k.ivReady'), String(rows.length - inProg), '', 'success'), kpi(t('sp.k.billable'), String(bl.length), '', bl.length ? 'warning' : ''), kpi(t('sp.k.terms'), esc(t('c.days', { n: termsDays() })), '')],
      subnav: App.subnav('supplier/invoices', VSUBS, cur),
      blocks: cur === 'new' ? [form] : [invListBlock(rows, true), block(null, `<p class="small muted m-0">${esc(t('sp.iv.flow', { n: termsDays() }))}</p>`)] });
  }
  function readInv(root) { const x = S.read(root, '#sp-inv'); const f = st.inv; const ch = f.grn !== x.grn || f.type !== x.type || f.xml !== x.xml; Object.assign(f, x); if (ch) f.parsed = null; }
  function submitInv(root) {
    readInv(root); const f = st.inv; const e = {};
    if (!/\.xml$/i.test(f.xml || '')) e.xml = 'sp.e.xml'; if (!/\.pdf$/i.test(f.pdf || '')) e.pdf = 'sp.e.pdfF';
    if (f.type !== 'Original' && !f.orig) e.orig = 'sp.e.orig';
    if (!Object.keys(e).length && !f.parsed) e._ = 'sp.e.readXml';
    st.ierr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#sp-inv'); return; }
    const px = f.parsed; const id = 'INV-2026-' + String(Math.max(...D().docs.filter((d) => d.type === 'INV').map((d) => +d.id.slice(9))) + 1).padStart(4, '0');
    const o = f.orig && D().invoices[f.orig];
    D().invoices[id] = { po: px.po, grn: px.grn, mau: px.mau, kh: px.kh, no: px.no, cqt: px.cqt, src: 'Portal', type: f.type, orig: o ? `${o.kh} · ${o.no} (${f.orig})` : undefined, lines: [px.line], stage: 0, files: [f.xml, f.pdf] };
    D().docs.push({ id, type: 'INV', title: `${mat(px.line[0]).name} – ${px.grn}`, date: D().today, status: 'Submitted · to match', mats: [px.line[0]], vendor: VID(), value: px.net });
    if (D().invoiceStats) D().invoiceStats.total++;
    audit('Invoices', 'au.invPortal', { id }, id);
    notify('sp.n.inv', { id, v: App.vshort(V()), g: px.grn, net: vnd(px.net) }, id, '#/invoices/' + id, [px.line[0]]);
    st.inv = null; st.ierr = {}; location.hash = '#/supplier/invoices'; App.toast(t('sp.t.inv', { id, kh: px.kh, no: px.no }));
  }

  /* ---------- F-94 contracts, certificates, scorecard ---------- */
  function contracts() {
    const cs = myCts(); const com = (c) => c.lines.reduce((a, l) => a + l.commit, 0); const rel = (c) => c.lines.reduce((a, l) => a + l.released, 0);
    const tc = cs.reduce((a, c) => a + com(c), 0); const tr = cs.reduce((a, c) => a + rel(c), 0);
    return layout({ title: t('nav.s.contracts'), subtitle: esc(t('sp.ct.sub')),
      kpis: [kpi(t('sp.k.cts'), String(cs.length), ''), kpi(t('sp.k.consumed'), tc ? pct(tr / tc * 100, 0) : '—', esc(t('sp.ct.of', { r: num(tr), c: num(tc) }))), kpi(t('sp.k.ceiling'), App.ty(cs.reduce((a, c) => a + (c.ceiling || 0), 0)), esc(t('c.exclVat'))),
        kpi(t('sp.k.expiring'), String(cs.filter((c) => App.daysTo(c.end) <= 60).length), '', cs.some((c) => App.daysTo(c.end) <= 60) ? 'warning' : '')],
      blocks: cs.length ? cs.map((c) => { const d = S.docOf(c.id) || {}; const used = com(c) ? rel(c) / com(c) * 100 : 0; const dl = App.daysTo(c.end);
        return block(`${c.id} · ${tv(d.title || '')}`, `<p class="mt-0">${pill(d.status || '', d.status === 'Expiring' ? 'warning' : d.status === 'Active' ? 'success' : 'neutral')} ${esc(tv(c.ctype))} · ${esc(c.start)} – ${esc(c.end)} · ${esc(tv(c.esign))} · ${esc(dl >= 0 ? t('sp.ct.daysLeft', { n: dl }) : tv('Expired'))}</p>
          <p class="small m-0">${esc(t('sp.k.consumed'))} ${pct(used, 0)} · ${esc(t('sp.ct.of', { r: num(rel(c)), c: num(com(c)) }))} · ${esc(t('sp.k.ceiling'))} ${App.ty(c.ceiling)}</p>${S.bar(used)}
          ${table([{ h: t('c.mid'), r: (l) => mtag(l.mat), w: '120px' }, { h: t('sp.ct.q4'), r: (l) => (l.q4 ? vnd(l.q4) : '—'), cls: 'num', w: '150px' }, { h: t('sp.ct.commit'), r: (l) => num(l.commit), cls: 'num', w: '110px' }, { h: t('sp.ct.rel'), r: (l) => num(l.released), cls: 'num', w: '110px' }, { h: t('sp.ct.left'), r: (l) => num(l.commit - l.released), cls: 'num', w: '100px' }], c.lines, { label: t('sp.ct.lines') })}
          <h3 class="h-sub">${esc(t('sp.ct.releases', { n: c.releases.length }))}</h3><ul class="plain small">${c.releases.slice(-5).reverse().map((r) => `<li><span class="mono">${esc(r[0])}</span> · ${esc(r[1])} · ${num(r[2])} · ${vnd(r[3])} · ${esc(tv(r[4]))}</li>`).join('')}</ul>
          ${d.status === 'Expiring' ? `<div class="alert alert-warning" role="status">${esc(t('sp.ct.exp', { d: c.end }))}</div>` : ''}`); }) : [block(null, App.emptyState(t('sp.ct.none')))] });
  }
  const CSUBS = [['', 'sp.ce.reg'], ['upload', 'sp.ce.up']];
  function certificates(subArg) {
    const cur = App.sub(CSUBS, subArg || ''); const cs = myCerts();
    if (cur === 'upload' && !st.cert) st.cert = { replaces: '', type: '', no: '', issuer: '', expiry: '', file: '', mats: D().materials.filter((m) => m.vendors.some((x) => x[0] === VID())).map((m) => m.id).slice(0, 3) };
    const f = st.cert; const e = st.terr;
    const reg = block(t('sp.ce.title', { n: cs.length }), table([
      { h: t('sp.ce.type'), r: (c) => `${esc(tv(c.type))}<div class="small mono muted">${esc(c.no)}</div>`, w: 'minmax(200px,2fr)' },
      { h: t('c.mids'), r: (c) => `<span class="chips chips-inline">${c.mats.map(mtag).join('')}</span>`, w: 'minmax(150px,1.4fr)' },
      { h: t('sp.ce.issuer'), r: (c) => esc(c.issuer), w: 'minmax(140px,1.2fr)' }, { h: t('sp.ce.valid'), r: (c) => `<span class="nowrap">${esc(c.expiry)}</span>`, w: '110px' },
      { h: t('c.status'), r: (c) => pill(certStatus(c), cTone(certStatus(c))) + (c.replaces ? `<div class="small muted">${esc(t('sp.ce.renews', { id: c.replaces }))}</div>` : ''), w: '150px' },
      { h: '', r: (c) => ((certStatus(c) === 'Renewal due' || certStatus(c) === 'Expired') && !cs.some((x) => x.replaces === c.id) ? `<button class="btn btn-sm btn-p" data-sp="cert-open" data-id="${esc(c.id)}">${esc(t('sp.ce.renew'))}</button>` : ''), w: '170px' }
    ], cs, { label: t('nav.s.certificates') }));
    const form = f ? block(f.replaces ? t('sp.ce.formR', { id: f.replaces }) : t('sp.ce.formT'), `<form id="sp-cert" class="stack" novalidate><div class="form-grid">${S.field('spt', e, 'type', t('sp.ce.type'), f.type, { req: true })}${S.field('spt', e, 'no', t('sp.ce.no'), f.no, { req: true })}${S.field('spt', e, 'issuer', t('sp.ce.issuer'), f.issuer, { req: true })}${S.field('spt', e, 'expiry', t('sp.ce.valid'), f.expiry, { req: true, ph: 'dd/mm/yyyy' })}${S.field('spt', e, 'file', t('sp.ce.file'), f.file, { req: true, ph: 'certificate.pdf' })}</div>
      <p class="small muted mt-0">${esc(t('sp.ce.scope', { m: f.mats.join(', ') }))}</p>${formBtns('cert-cancel', t('c.upload'))}</form>`) : null;
    const sts = cs.map(certStatus);
    return layout({ title: t('nav.s.certificates'), subtitle: esc(t('sp.ce.sub')), alerts: App.unknownSub(CSUBS, subArg),
      kpis: [kpi(t('sp.k.valid'), String(sts.filter((x) => x === 'Valid').length), '', 'success'), kpi(t('sp.k.due'), String(sts.filter((x) => /Renewal|Expired/.test(x)).length), '', sts.some((x) => /Renewal|Expired/.test(x)) ? 'warning' : ''), kpi(t('sp.k.review'), String(sts.filter((x) => x === 'Pending review').length), '')],
      subnav: App.subnav('supplier/certificates', CSUBS, cur), blocks: cur === 'upload' ? [form] : [reg] });
  }
  const SSUBS = [['', 'sp.sc.crit'], ['trend', 'sp.sc.trend']];
  function scorecard(subArg) {
    const cur = App.sub(SSUBS, subArg || '');
    const v = V(); const sc = D().scorecards.find((x) => x.vendor === VID()); const tpl = sc && D().evalTemplates.find((x) => x.id === sc.tpl); const ov = D().reports.otifVendors[VID()];
    const ncrs = myNcr(); const hist = D().scoreHistory[VID()] || [];
    const crit = sc && tpl ? block(t('sp.sc.critT', { p: sc.period }), table([
      { h: t('sp.sc.c'), r: (c) => `${esc(tv(c.name))}<div class="small muted">${esc(t('sp.sc.w', { s: tv(c.src), w: c.w }))}</div>`, w: 'minmax(220px,2fr)' },
      { h: t('c.score'), r: (c) => (sc.scores[tpl.criteria.indexOf(c)] != null ? num(sc.scores[tpl.criteria.indexOf(c)], 1) : '—'), cls: 'num', w: '90px' },
      { h: t('sp.sc.ev'), r: (c) => esc(tv(sc.evidence[tpl.criteria.indexOf(c)] || '—')), w: 'minmax(220px,2fr)' }
    ], tpl.criteria, { label: t('sp.sc.crit') }) + (sc.comment ? `<p class="small">${esc(t('sp.sc.comment', { c: sc.comment }))}</p>` : '')) : block(null, App.emptyState(t('sp.sc.none')));
    const trend = [block(t('sp.sc.trendT'), hist.length ? `<ul class="plain">${hist.map(([q, s]) => `<li class="row-acts between"><span>${esc(q)}</span><b>${num(s, 2)}</b></li>`).join('')}</ul>` : `<p class="muted small">${esc(t('sp.sc.noHist'))}</p>`, { span: 6 }),
      block(t('sp.sc.grades'), `<ul class="plain small">${D().grades.map(([g, min, s]) => `<li>${esc(g)} · ≥ ${num(min, 1)} · ${esc(tv(s))}</li>`).join('')}</ul>`, { span: 6 })];
    return layout({ title: t('nav.s.scorecard'), subtitle: esc(t('sp.sc.sub')), alerts: App.unknownSub(SSUBS, subArg),
      kpis: [kpi(t('c.score'), v.score ? `${num(v.score, 2)} · ${esc(v.grade)}` : '—', sc ? esc(`${sc.period} · ${tv(sc.status)}`) : esc(t('sp.k.notEval'))),
        kpi('OTIF', v.otif != null ? pct(v.otif) : '—', ov ? esc(t('sp.k.otifV', { n: num(ov[0]), o: pct(ov[1]), f: pct(ov[2]) })) : '', v.otif >= 95 ? 'success' : 'warning'),
        kpi(t('sp.k.ncrs'), String(ncrs.length), esc(t('sp.k.ncrsN', { n: ncrs.filter((n) => n.status !== 'Closed').length })), ncrs.some((n) => n.status !== 'Closed') ? 'warning' : ''), kpi(t('sp.k.status'), esc(tv(v.status)), esc(t('sp.k.statusN')))],
      subnav: App.subnav('supplier/scorecard', SSUBS, cur), blocks: cur === 'trend' ? trend : [crit] });
  }

  /* ---------- F-97 / F-98 profile ---------- */
  const FSUBS = [['', 'sp.pf.company'], ['bank', 'sp.pf.bank'], ['onboarding', 'sp.pf.onb'], ['materials', 'sp.pf.mats']];
  function profile(subArg) {
    const cur = App.sub(FSUBS, subArg || '');
    const v = V(); const pt = P(); const b = v.bank || {}; const k = st.bank; const ke = st.kerr; const offered = D().materials.filter((m) => m.vendors.some((x) => x[0] === VID()));
    const ck = pt.checklist; const done = ck.filter((x) => x[1] === 'Done').length; const mst = st.mst;
    const pre = v.cat === 'Construction' ? 'CON' : v.cat.slice(0, 3).toUpperCase();
    const usable = D().materials.filter((m) => m.id.startsWith(pre) && !offered.includes(m) && !(v.proposed || []).includes(m.id));
    const u = D().users.find((x) => x.vendor === VID() && x.name === S.me()) || {};
    let blocks;
    if (cur === 'bank') blocks = [block(t('sp.pf.bank'), `<dl class="dl"><dt>${esc(t('sp.bk.use'))}</dt><dd>${esc(b.now || '—')}</dd>${b.pending ? `<dt>${esc(t('sp.bk.new'))}</dt><dd>${esc(b.pending)} ${pill('Pending Finance verification', 'warning')}<div class="small muted">${esc(t('sp.bk.req', { d: b.requested }))}</div></dd>` : ''}</dl>
        ${k ? `<form id="sp-bank" class="stack mt decide-panel" novalidate><div class="form-grid">${S.field('spk', ke, 'bank', t('sp.bk.bank'), k.bank, { req: true, ph: 'Vietcombank' })}${S.field('spk', ke, 'acct', t('sp.bk.acct'), k.acct, { req: true, mode: 'numeric' })}${S.field('spk', ke, 'holder', t('sp.bk.holder'), k.holder, { req: true, hint: t('sp.bk.holderH') })}${S.field('spk', ke, 'letter', t('sp.bk.letter'), k.letter, { req: true, ph: 'xac-nhan-tk.pdf' })}</div>${formBtns('bank-cancel', t('sp.bk.reqBtn'))}</form>` : ''}`,
      { actions: k || b.pending ? '' : `<button class="btn btn-sm btn-p" data-sp="bank-open">${esc(t('sp.bk.change'))}</button>` })];
    else if (cur === 'onboarding') blocks = [block(t('sp.ob.title', { d: done, n: ck.length }), `<ul class="plain">${ck.map(([x, s]) => `<li class="row-acts between"><span>${esc(tv(x))}</span>${pill(s, s === 'Done' ? 'success' : 'warning')}</li>`).join('')}</ul>`, { span: 6 }),
      block(t('sp.pv.title'), `${u.consentVer === 'Re-acceptance pending' ? `<div class="alert alert-warning" role="status">${esc(t('sp.pv.pending', { v: D().privacy.current }))} <button class="btn btn-sm" data-sp="consent-accept">${esc(t('sp.pv.accept', { v: D().privacy.current }))}</button></div>` : `<p class="mt-0">${esc(t('sp.pv.ok', { v: u.consentVer || 'v2.1', d: u.consent || '—', u: S.me() }))}</p>`}<p class="small muted">${esc(t('sp.pv.rights'))}</p>`,
        { span: 6, actions: `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('sp.pv.msg'))}">${esc(t('sp.pv.manage'))}</button>` })];
    else if (cur === 'materials') blocks = [block(t('sp.mt.title', { n: offered.length }), `<ul class="plain rows">${offered.map((m) => `<li class="row-acts between"><span>${mtag(m.id)} ${esc(m.name)}</span>${pill(m.vendors.find((x) => x[0] === VID())[1], 'success')}</li>`).join('')}${(v.proposed || []).map((id) => `<li class="row-acts between"><span>${mtag(id)} ${esc(mat(id).name)}<div class="small muted">${esc(t('sp.mt.prop'))}</div></span>${pill('Proposed', 'neutral')}</li>`).join('')}</ul>`, { span: 6 }),
      block(t('sp.mt.add'), usable.length ? `<form id="sp-prop" class="stack" novalidate><div class="field"><label for="spp-prop">${esc(t('sp.mt.lbl'))}</label><select id="spp-prop" name="prop">${usable.map((m) => `<option value="${esc(m.id)}">${esc(m.id)} · ${esc(m.name)}</option>`).join('')}</select></div><div class="row-acts"><button type="submit" class="btn btn-sm btn-p">${esc(t('sp.mt.btn'))}</button></div></form>` : `<p class="small muted mt-0">${esc(t('sp.mt.noMore'))}</p>`, { span: 6 })];
    else blocks = [block(t('sp.pf.company'), `<form id="sp-prof" class="stack" novalidate><div class="form-grid">
        <div class="field"><label for="spp-name">${esc(t('sp.pf.name'))}</label><input id="spp-name" value="${esc(v.name)}" readonly aria-readonly="true" aria-describedby="spp-name-h"><span class="hint" id="spp-name-h">${esc(t('sp.pf.nameH'))}</span></div>
        <div class="field"><label for="spp-mst">${esc(t('sp.pf.mst'))}</label><input id="spp-mst" name="mst" value="${esc(mst ? mst.v : v.mst)}" inputmode="numeric"${mst && mst.err ? ' aria-invalid="true" aria-describedby="spp-mst-e"' : ' aria-describedby="spp-mst-h"'}><span class="hint" id="spp-mst-h">${esc(t('sp.pf.mstH'))}</span>${mst && mst.err ? `<span class="err" id="spp-mst-e" role="alert">${esc(t(mst.err))}</span>` : ''}</div>
        <div class="field"><label for="spp-rep">${esc(t('sp.pf.rep'))}</label><input id="spp-rep" name="rep" value="${esc(pt.legalRep || '')}"></div>
        <div class="field"><label for="spp-mail">${esc(t('sp.pf.mail'))}</label><input id="spp-mail" name="mail" value="${esc(v.email)}" readonly aria-readonly="true" aria-describedby="spp-mail-h"><span class="hint" id="spp-mail-h">${esc(t('sp.pf.mailH'))}</span></div>
        <div class="field"><label for="spp-ph">${esc(t('sp.pf.phone'))}</label><input id="spp-ph" name="phone" value="${esc(v.phone || '')}"></div>
        <div class="field"><label for="spp-ad">${esc(t('sp.pf.addr'))}</label><input id="spp-ad" name="address" value="${esc(v.address || '')}"></div></div>
        ${mst && mst.ok ? `<div class="alert alert-info" role="status">${esc(t('sp.pf.gdt', { r: mst.ok, d: D().today }))}</div>` : `<p class="small muted mt-0">${esc(t('sp.pf.last', { d: v.mstChecked || pt.mstVerified, s: tv(v.taxStatus || '') }))}</p>`}
        <div class="row-acts"><button type="button" class="btn btn-sm" data-sp="mst">${esc(t('sp.pf.check'))}</button><button type="submit" class="btn btn-sm btn-p">${esc(t('sp.pf.save'))}</button></div></form>`)];
    return layout({ title: t('nav.s.profile'), subtitle: esc(t('sp.pf.sub', { n: v.name, p: pct(ck.length ? done / ck.length * 100 : 0, 0) })), alerts: App.unknownSub(FSUBS, subArg),
      kpis: [kpi(t('sp.k.profile'), pct(ck.length ? done / ck.length * 100 : 0, 0), esc(`${done} / ${ck.length}`)), kpi(t('sp.k.offered'), String(offered.length), (v.proposed || []).length ? esc(t('sp.k.proposed', { n: v.proposed.length })) : ''),
        kpi(t('sp.k.bankK'), esc(tv(b.pending ? 'Pending Finance verification' : 'Verified')), '', b.pending ? 'warning' : 'success'), kpi(t('sp.k.consent'), esc(u.consentVer === 'Re-acceptance pending' ? tv('Pending') : (u.consentVer || 'v2.1')), '', u.consentVer === 'Re-acceptance pending' ? 'warning' : '')],
      subnav: App.subnav('supplier/profile', FSUBS, cur), blocks });
  }

  /* ---------- routing ---------- */
  function render(params, sub) {
    const parts = (sub || '').split('/'); const sec = parts[0] || '';
    const key = sec === 'invitations' || sec === 'pos' ? parts.slice(0, 2).join('/') : sec;
    if (st.cur !== key) Object.assign(st, { cur: key }, JSON.parse(JSON.stringify(RESET)));
    const rest = parts.slice(1).join('/');
    if (sec === 'invitations') return parts[1] && parts[1] !== 'results' ? invDetail(parts[1], parts.slice(2).join('/')) : invList(rest);
    if (sec === 'pos') return parts[1] ? poDetail(parts[1], parts.slice(2).join('/')) : poList();
    const PAGES = { '': overview, quotations, deliveries, invoices, contracts, certificates, scorecard, profile };
    const fn = PAGES[sec];
    return fn ? fn(rest) : layout({ title: t('sp.title'), blocks: [block(null, `<p class="m-0">${esc(t('shell.notBuiltNote', { route: 'supplier/' + sec }))}</p><p class="m-0"><a class="btn" href="#/supplier">${esc(t('shell.goHome'))}</a></p>`)] });
  }
  function mount(root) {
    const ctx = () => { const [sec, id] = (location.hash.replace(/^#\/?supplier\/?/, '').split('?')[0] || '').split('/'); return { sec, id }; };
    const focus = (sel) => { const x = document.querySelector(sel); if (x) { x.scrollIntoView({ block: 'center' }); x.focus({ preventScroll: true }); } };
    root.addEventListener('change', (e) => {
      const { sec, id } = ctx();
      if (sec === 'invitations' && id && e.target.closest('#sp-bid')) {
        if (!st.bid) st.bid = JSON.parse(JSON.stringify(bidOf(id))); readBid(root); const sb = e.target.dataset.sb; const i = e.target.dataset.i;
        if (sb === 'nobid') { App.render(); const x = document.querySelector(`[data-sb="nobid"][data-i="${i}"]`); x && x.focus(); return; }
        /* price / lead: update amounts and totals in place so focus stays where the user moved it */
        const tn = D().tenders[id]; const tt = totals(tn, st.bid.lines);
        tn.lines.forEach((l, k) => { const c = document.getElementById('sb-a' + k); const x = st.bid.lines[k]; if (c) c.textContent = x.nobid || !x.price ? '—' : vnd(l.qty * x.price); });
        const tot = document.getElementById('sb-tot'); if (tot) tot.innerHTML = totInner(tt);
        if (sb === 'price' && st.bid.lines[i].price) e.target.value = num(st.bid.lines[i].price);
      }
      if (e.target.closest('#sp-inv') && /spi-(grn|type)/.test(e.target.id)) { readInv(root); const fid = e.target.id; App.render(); const x = document.getElementById(fid); x && x.focus(); }
    });
    root.addEventListener('submit', (e) => {
      const f = e.target; const { id } = ctx(); if (!f.id || !/^sp/.test(f.id)) return; e.preventDefault();
      if (f.id === 'sp-bid') { if (!st.bid) st.bid = JSON.parse(JSON.stringify(bidOf(id))); saveBid(root, id, true); }
      else if (f.id === 'spf-up') { const b = st.bid || bidOf(id); st.up = S.upload(root, 'spf', b.files); if (st.bid) bidOf(id).files = st.bid.files; App.render(); }
      else if (f.id === 'sp-q') { const x = S.read(root, '#sp-q'); st.q = x; st.qerr = {}; if ((x.q || '').length < 10) { st.qerr.q = 'sp.e.q'; App.render(); S.focusErr('#sp-q'); return; }
        const tn = D().tenders[id]; (tn.questions = tn.questions || []).push({ line: x.line, q: x.q, at: clock(), from: VID() }); notify('sp.n.q', { id, m: x.line }, id, '#/tenders/' + id + '/qa', [x.line]); st.q = null; App.render(); App.toast(t('sp.t.q')); }
      else if (f.id === 'sp-dec') { const r = S.read(root, '#sp-dec').reason || ''; st.dec = { reason: r }; if (r.length < 10) { st.derr = 'sp.e.reason'; App.render(); S.focusErr('#sp-dec'); return; } App.po.decline(id, r, S.me()); audit('Orders', 'au.poDec', { r }, id); st.dec = null; App.render(); App.toast(t('sp.t.dec', { id })); }
      else if (f.id === 'sp-asn') { const x = S.read(root, '#sp-asn'); const a = Object.assign(st.asn, x); const er = {};
        if (!S.validDate(a.ship)) er.ship = 'c.dateFmt'; else if (App.daysTo(a.ship) < 0) er.ship = 'sp.e.past';
        const q = Number(String(a.qty).replace(',', '.')); if (!(q > 0) || q > a.max * 1.1) er.qty = ['sp.e.range', { n: num(a.max * 1.1) }]; if (!a.vehicle) er.vehicle = 'sp.e.veh'; if (/^CON-240/.test(a.mat) && !/\.pdf$/i.test(a.docs || '')) er.docs = 'sp.e.mill';
        st.aerr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#sp-asn'); return; }
        const aid = 'ASN-2026-' + String(301 + P().asns.length).padStart(4, '0'); const slot = App.po.det(a.po).lines[a.li].sched[a.si]; slot[5] = { id: aid, ship: a.ship, qty: q, vehicle: a.vehicle, docs: a.docs };
        P().asns.push({ id: aid, po: a.po, mat: a.mat, ship: a.ship, qty: q }); notify('sp.n.asn', { id: aid, po: a.po, q: num(q), u: mat(a.mat).uom, m: a.mat, d: a.ship }, a.po, '#/po/' + a.po, [a.mat]); audit('Orders', 'au.asn', { id: aid }, a.po); st.asn = null; App.render(); App.toast(t('sp.t.asn', { id: aid })); }
      else if (f.id === 'sp-chg') { const x = S.read(root, '#sp-chg'); const c = Object.assign(st.chg, x); const er = {};
        if (!S.validDate(c.to)) er.to = 'c.dateFmt'; else if (App.daysTo(c.to) <= 0) er.to = 'sp.e.after'; else if (c.to === c.due) er.to = 'sp.e.same'; if ((c.reason || '').length < 10) er.reason = 'sp.e.reason';
        st.cerr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#sp-chg'); return; }
        const p = App.po.det(c.po); const d = S.docOf(c.po); const rid = `${c.po} DC-${p.lines[c.li].sched[c.si][1].slice(0, 5).replace('/', '')}`;
        const req = { id: rid, po: c.po, li: c.li, si: c.si, from: c.due, to: c.to, reason: c.reason, status: 'Pending buyer acceptance', at: clock() }; p.lines[c.li].sched[c.si][6] = req;
        D().approvals.push({ id: rid, type: 'Delivery date change', title: `${App.vshort(V())} · ${c.mat} ${c.due} → ${c.to}`, mats: [c.mat], value: null, by: S.me() + ' (supplier)', step: 'Step 1 of 1', sla: App.addDays(D().today, 1) + ' 17:00', assignee: p.buyer, req, note: c.reason });
        D().approvalChains[rid] = [[`${S.me()} · Supplier`, 'Requested', req.at, c.reason], [`${p.buyer} · Buyer`, 'Waiting', 'SLA 1 working day', '']];
        notify('sp.n.chg', { v: App.vshort(V()), f: c.due, to: c.to, po: c.po }, c.po, '#/approvals?id=' + encodeURIComponent(rid), d.mats); audit('Orders', 'au.chg', { d: c.to }, c.po); st.chg = null; App.render(); App.toast(t('sp.t.chg', { b: p.buyer })); }
      else if (f.id === 'sp-ncr') { const x = S.read(root, '#sp-ncr'); const r = Object.assign(st.ncr, x); const er = {}; const disc = Number(String(r.disc).replace(',', '.'));
        if ((r.comment || '').length < 10) er.comment = 'sp.e.comment'; if (r.opt === 'Offer a discount' && !(disc > 0 && disc <= 30)) er.disc = 'sp.e.disc';
        st.nerr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#sp-ncr'); return; }
        const n = D().ncrs[r.id]; const at = clock(); n.response = { opt: r.opt, disc: r.opt === 'Offer a discount' ? disc : null, comment: r.comment, at }; n.status = 'Supplier responded'; n.supplier = `${at}: ${r.opt}${n.response.disc ? ' ' + n.response.disc + '%' : ''} — ${r.comment}`;
        audit('Orders', 'au.ncr', { o: r.opt }, r.id); const nd = S.docOf(r.id); if (nd) nd.status = 'Supplier responded'; notify('sp.n.ncr', { id: r.id, v: App.vshort(V()), o: r.opt }, n.po, '#/po/' + n.po + '/receipts', [n.mat]); st.ncr = null; App.render(); App.toast(t('sp.t.ncr', { id: r.id })); }
      else if (f.id === 'sp-inv') submitInv(root);
      else if (f.id === 'sp-cert') { const x = S.read(root, '#sp-cert'); const c = Object.assign(st.cert, x); const er = {};
        ['type', 'no', 'issuer'].forEach((k) => { if (!c[k]) er[k] = 'sp.e.req'; }); if (!S.validDate(c.expiry)) er.expiry = 'c.dateFmt'; else if (App.daysTo(c.expiry) <= 0) er.expiry = 'sp.e.future'; if (!/\.pdf$/i.test(c.file || '')) er.file = 'sp.e.pdf';
        st.terr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#sp-cert'); return; }
        const cid = 'CERT-' + String(Math.max(...D().certificates.map((y) => +y.id.slice(5))) + 1).padStart(4, '0');
        D().certificates.push({ id: cid, type: c.type, no: c.no, vendor: VID(), mats: c.mats, issuer: c.issuer, issued: D().today, expiry: c.expiry, status: 'Pending review', uploaded: `${S.me()} · ${D().today} (supplier)`, file: c.file, replaces: c.replaces || undefined });
        if (D().certStats) D().certStats.pending++; notify('sp.n.cert', { t: c.type, v: App.vshort(V()), id: cid }, VID(), '#/certificates', c.mats); audit('Settings', 'au.cert', { t: c.type }, VID()); st.cert = null; st.terr = {}; location.hash = '#/supplier/certificates'; App.toast(t('sp.t.cert', { id: cid })); }
      else if (f.id === 'sp-bank') { const x = S.read(root, '#sp-bank'); const k = Object.assign(st.bank, x); const er = {};
        if (!k.bank) er.bank = 'sp.e.bank'; if (!/^\d{6,19}$/.test((k.acct || '').replace(/\s/g, ''))) er.acct = 'sp.e.acct'; if (App.norm(k.holder) !== App.norm(V().name)) er.holder = 'sp.e.holder'; if (!/\.pdf$/i.test(k.letter || '')) er.letter = 'sp.e.pdf';
        st.kerr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#sp-bank'); return; }
        const v = V(); const acct = `${k.bank} ···· ${k.acct.replace(/\s/g, '').slice(-4)}`; v.bank = Object.assign(v.bank || {}, { pending: acct, requested: clock(), by: S.me() + ' (portal)' });
        D().approvals = D().approvals.filter((a) => !(a.type === 'Vendor change' && a.id === v.id)); D().approvals.push({ id: v.id, type: 'Vendor change', title: `${App.vshort(v)} · ${acct}`, mats: [], value: null, by: S.me(), step: 'Step 1 of 2', sla: App.addDays(D().today, 1) + ' 17:00', assignee: 'Đỗ Hoàng Nam' });
        audit('Settings', 'au.bank', { a: acct }, v.id); st.bank = null; App.render(); App.toast(t('sp.t.bank', { a: acct })); }
      else if (f.id === 'sp-prof') { const x = S.read(root, '#sp-prof'); const v = V(); Object.assign(v, { phone: x.phone, address: x.address }); P().legalRep = x.rep; audit('Settings', 'au.prof', {}, VID()); App.render(); App.toast(t('sp.t.prof')); }
      else if (f.id === 'sp-prop') { const x = S.read(root, '#sp-prop'); const v = V(); v.proposed = v.proposed || []; v.proposed.push(x.prop); audit('Settings', 'au.prop', { m: x.prop }, VID()); notify('sp.n.prop', { v: App.vshort(v), m: x.prop }, v.id, '#/vendors/' + v.id, [x.prop]); App.render(); App.toast(t('sp.t.prop', { m: x.prop })); }
    });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sp], [data-files]'); if (!b) return; const { id } = ctx(); const a = b.dataset.sp;
      if (b.dataset.files === 'open') { if (!st.bid) st.bid = JSON.parse(JSON.stringify(bidOf(id))); st.up = { errs: {} }; App.render(); const x = document.getElementById('spf-up-name'); x && x.focus(); return; }
      if (b.dataset.files === 'cancel') { st.up = null; App.render(); return; }
      if (a === 'ack') { const tn = D().tenders[id]; const ad = tn.addenda.find((x) => x.no === +b.dataset.no); ad.acks.push([VID(), clock()]); audit('Bids and tenders', 'au.ack', { no: String(b.dataset.no).padStart(2, '0') }, id); App.render(); App.toast(t('sp.t.ack', { no: String(ad.no).padStart(2, '0') })); }
      else if (a === 'draft') { if (!st.bid) st.bid = JSON.parse(JSON.stringify(bidOf(id))); saveBid(root, id, false); }
      else if (a === 'withdraw') { const d = tndDoc(id); if (isClosed(d)) return; const bb = bidOf(id); const tn = D().tenders[id]; const at = clock(); bb.status = 'Withdrawn'; bb.at = at; bb.log.push([at, `Withdrawn · ${bb.rc}`]); const tb = tn.bidders.find((x) => x.vid === VID()); if (tb) Object.assign(tb, { status: 'Withdrawn', at, warn: 'Withdrawn by the bidder ' + at }); d.bids = tn.bidders.filter((x) => x.status === 'Submitted').length; audit('Bids and tenders', 'au.bidWd', { rc: bb.rc }, id); st.bid = null; App.render(); App.toast(t('sp.t.wd', { at })); }
      else if (a === 'q-open') { st.q = { line: D().tenders[id].lines[0].mat, q: '' }; st.qerr = {}; App.render(); focus('#spq-q'); }
      else if (a === 'q-cancel') { st.q = null; App.render(); }
      else if (a === 'confirm') { const p = App.po.det(id); const re = p.confirm && p.confirm.status === 'Awaiting re-confirmation'; App.po.confirm(id, S.me() + ' (portal)'); audit('Orders', re ? 'au.poReconf' : 'au.poConf', { r: p.rev }, id); App.render(); App.toast(re ? t('sp.t.reconf', { id, r: p.rev }) : t('sp.t.conf', { id })); }
      else if (a === 'dec-open') { st.dec = { reason: '' }; st.derr = ''; App.render(); focus('#spd-reason'); }
      else if (a === 'dec-cancel') { st.dec = null; App.render(); }
      else if (a === 'print') window.print();
      else if (a === 'asn-open' || a === 'chg-open') { const r = App.po.sched(b.dataset.po).find((x) => x.li === +b.dataset.li && x.si === +b.dataset.si); const base = { po: b.dataset.po, li: r.li, si: r.si, mat: r.mat, due: r.due, max: r.qty };
        if (a === 'asn-open') { st.asn = Object.assign(base, { ship: App.addDays(r.due, -1), qty: String(r.qty), vehicle: '', docs: '' }); st.chg = null; st.aerr = {}; App.render(); focus('#spa-ship'); } else { st.chg = Object.assign(base, { to: '', reason: '' }); st.asn = null; st.cerr = {}; App.render(); focus('#spc-to'); } }
      else if (a === 'asn-cancel') { st.asn = null; App.render(); }
      else if (a === 'chg-cancel') { st.chg = null; App.render(); }
      else if (a === 'ncr-open') { st.ncr = { id: b.dataset.id, opt: 'Replace', disc: '', comment: '' }; st.nerr = {}; App.render(); focus('#spn-opt'); }
      else if (a === 'ncr-cancel') { st.ncr = null; App.render(); }
      else if (a === 'consent-accept') { const u = App.state.user; u.consent = D().today; u.consentVer = D().privacy.current; D().privacy.accepted = (D().privacy.accepted || 0) + 1; audit('Data privacy', 'au.consent', { v: u.consentVer }, u.email); App.render(); App.toast(t('sp.t.pv', { v: u.consentVer })); }
      else if (a === 'inv-cancel') { st.inv = null; st.ierr = {}; location.hash = '#/supplier/invoices'; }
      else if (a === 'inv-parse') { readInv(root); const f = st.inv; st.ierr = {}; if (!/\.xml$/i.test(f.xml || '')) { st.ierr.xml = 'sp.e.xmlRead'; App.render(); S.focusErr('#sp-inv'); return; } f.parsed = parsed(f); App.render(); App.toast(t('sp.t.xml')); }
      else if (a === 'cert-open') { const old = D().certificates.find((x) => x.id === b.dataset.id && x.vendor === VID()); st.cert = old ? { replaces: old.id, type: old.type, no: '', issuer: old.issuer, expiry: '', file: '', mats: old.mats } : null; st.terr = {}; location.hash = '#/supplier/certificates/upload'; }
      else if (a === 'cert-cancel') { st.cert = null; st.terr = {}; location.hash = '#/supplier/certificates'; }
      else if (a === 'bank-open') { st.bank = { bank: '', acct: '', holder: V().name, letter: '' }; st.kerr = {}; App.render(); focus('#spk-bank'); }
      else if (a === 'bank-cancel') { st.bank = null; App.render(); }
      else if (a === 'mst') { const x = (document.getElementById('spp-mst').value || '').replace(/[\s.]/g, ''); st.mst = { v: document.getElementById('spp-mst').value };
        if (!/^\d{10}(-\d{3})?$/.test(x)) st.mst.err = 'sp.e.mstF'; else if (x.slice(0, 10) !== V().mst.replace(/\s/g, '')) st.mst.err = 'sp.e.mstO'; else st.mst.ok = `${V().name} · ${tv(V().taxStatus || 'Active')}`;
        if (st.mst.ok) V().mstChecked = D().today; audit('Settings', st.mst.ok ? 'au.mstOk' : 'au.mstBad', {}, VID()); App.render(); focus('#spp-mst'); }
    });
  }
  App.page('supplier', { titleKey: 'sp.title', roles: ['supplier'], render, mount });
})();
