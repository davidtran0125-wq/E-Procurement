/* Module 8 · Tenders — F-40 list, F-41 sealed bids (R-05), F-42 progress/settings/attachments (R-09, R-10, R-19), F-43 two-person bid opening & minutes,
   F-44 anonymous Q&A + addendum (R-11), F-45 committee & COI, F-46 technical envelope, F-47 price matrix per Material ID & bid security,
   F-48 award recommendation (Tờ trình) → approvals, notices, Create PO after approval (R-12), F-49 e-auction (R-22) & foreign currency (R-23).
   Routes: #/tenders (?q=), #/tenders/new (?mat= | ?pr=), #/tenders/<id>(/bids|evaluation|award|qa|files|settings) */
(function () {
  const { esc, num, pct, vnd, ty, mid, pill, table, kpi, block, layout, t, tv } = App;
  const S = App.src;
  const D = () => window.DATA;
  I18N.add({
    'tn.subtitle': ['RFQ, sealed-bid, two-envelope and e-auction tenders · every tender lists its Material ID lines', 'Chào giá (RFQ), đấu thầu kín, hai túi hồ sơ và đấu giá điện tử · mỗi gói thầu liệt kê các dòng mã vật tư'],
    'tn.new': ['New tender', 'Tạo gói thầu'], 'tn.exportMsg': ['Exported Tenders_02-11-2026.xlsx ({n} rows)', 'Đã xuất Tenders_02-11-2026.xlsx ({n} dòng)'],
    'tn.sub.list': ['Tenders', 'Gói thầu'], 'tn.sub.new': ['New tender', 'Tạo gói thầu'],
    'tn.d.overview': ['Overview & lines', 'Tổng quan & dòng'], 'tn.d.bids': ['Bids & opening', 'Hồ sơ & mở thầu'], 'tn.d.eval': ['Evaluation', 'Đánh giá'], 'tn.d.award': ['Award', 'Trao thầu'],
    'tn.d.qa': ['Q&A & addenda', 'Hỏi đáp & sửa đổi'], 'tn.d.files': ['Files', 'Tệp'], 'tn.d.settings': ['Settings', 'Thiết lập'],
    'tn.k.active': ['Active tenders', 'Gói thầu đang chạy'], 'tn.k.closing': ['Closing ≤ 7 days', 'Đóng thầu ≤ 7 ngày'], 'tn.k.eval': ['In evaluation', 'Đang đánh giá'], 'tn.k.awarded': ['Awarded', 'Đã trao thầu'],
    'tn.k.sample2026': ['This sample · 2026', 'Mẫu này · 2026'], 'tn.k.awPending': ['award pending', 'chờ duyệt trao thầu'],
    'tn.tab.all': ['All', 'Tất cả'], 'tn.searchLbl': ['Search tenders', 'Tìm gói thầu'], 'tn.searchPh': ['Search ID, title, Material ID or bidder', 'Tìm mã, tên, mã vật tư hoặc nhà thầu'],
    'tn.method': ['Method', 'Hình thức'], 'tn.allMethods': ['All methods', 'Mọi hình thức'], 'tn.c.tender': ['Tender', 'Gói thầu'], 'tn.c.closes': ['Closes', 'Đóng thầu'], 'tn.c.bids': ['Bids', 'Hồ sơ'],
    'tn.daysN': ['{n} days', '{n} ngày'], 'tn.sealed': ['sealed', 'niêm phong'], 'tn.vat8end': ['8% reduction ends 31/12/2026', 'Giảm 8% kết thúc 31/12/2026'], 'tn.empty': ['No tenders match these filters', 'Không có gói thầu phù hợp bộ lọc'],
    'tn.setup': ['Tender setup', 'Thiết lập gói thầu'], 'tn.f.pr': ['Source PR', 'PR nguồn'], 'tn.f.noPr': ['No PR · Material ID {m}', 'Không có PR · mã vật tư {m}'], 'tn.f.prHint': ['Approved PRs without an active contract', 'PR đã duyệt chưa có hợp đồng hiệu lực'],
    'tn.newNote': ['Lines are copied from the PR (Material ID and quantity) · the number TND-2026-NNN is issued on save.', 'Dòng được sao chép từ PR (mã vật tư và số lượng) · số TND-2026-NNN được cấp khi lưu.'],
    'tn.f.qty': ['Quantity', 'Số lượng'], 'tn.f.title': ['Title', 'Tên gói thầu'], 'tn.f.titlePh': ['e.g. Tủ điện MSB – Nhà xưởng C2', 'vd. Tủ điện MSB – Nhà xưởng C2'], 'tn.f.envelopes': ['Envelopes', 'Số túi hồ sơ'],
    'tn.env.single': ['Single envelope', 'Một túi hồ sơ'], 'tn.env.two': ['Two envelopes (technical + price)', 'Hai túi hồ sơ (kỹ thuật + giá)'], 'tn.f.close': ['Closing date', 'Ngày đóng thầu'], 'tn.f.time': ['Closing time', 'Giờ đóng thầu'],
    'tn.f.validity': ['Bid validity (days)', 'Hiệu lực hồ sơ (ngày)'], 'tn.f.validityHint': ['At least 90 days', 'Tối thiểu 90 ngày'], 'tn.f.currency': ['Bid currency', 'Đồng tiền dự thầu'],
    'tn.cur.both': ['VND or USD (converted at the bank selling rate on the opening day)', 'VND hoặc USD (quy đổi theo tỷ giá bán của ngân hàng ngày mở thầu)'], 'tn.f.secPct': ['Bid security (% of estimated value)', 'Bảo đảm dự thầu (% giá trị ước tính)'],
    'tn.f.secHint': ['Suggested 1–1,5% for goods/services ≤ 10 bn ₫ · = {v}', 'Đề xuất 1–1,5% cho hàng hóa/dịch vụ ≤ 10 tỷ ₫ · = {v}'], 'tn.f.delivery': ['Last delivery date', 'Ngày giao cuối'],
    'tn.f.wt': ['Technical weight %', 'Trọng số kỹ thuật %'], 'tn.f.wp': ['Price weight %', 'Trọng số giá %'], 'tn.f.wHint': ['Technical + price = 100%', 'Kỹ thuật + giá = 100%'],
    'tn.vat8note': ['8% reduction ends 31/12/2026 — rate is set at invoice date. Lines delivered in 2027 are invoiced at the standard VAT.', 'Giảm 8% kết thúc 31/12/2026 — thuế suất xác định theo ngày hóa đơn. Dòng giao năm 2027 xuất hóa đơn theo VAT chuẩn.'],
    'tn.linesN': ['Lines ({n})', 'Dòng ({n})'], 'tn.c.qty': ['Qty', 'SL'], 'tn.c.est': ['Est. value excl. VAT', 'Giá trị ước tính chưa VAT'], 'tn.noLines': ['Choose a PR or start from a Material ID', 'Chọn PR hoặc bắt đầu từ một mã vật tư'],
    'tn.estNote': ['Estimated value {v} excl. VAT = Σ qty × 90-day average price (Price history).', 'Giá trị ước tính {v} chưa VAT = Σ SL × giá bình quân 90 ngày (Lịch sử giá).'], 'tn.saveDraft': ['Save draft tender', 'Lưu nháp gói thầu'],
    'tn.e.pr': ['Choose a source PR.', 'Chọn PR nguồn.'], 'tn.e.qty': ['Enter a quantity above 0.', 'Nhập số lượng lớn hơn 0.'], 'tn.e.title': ['Enter a title.', 'Nhập tên gói thầu.'], 'tn.e.close3': ['Closing must be at least 3 days from today.', 'Ngày đóng thầu phải cách hôm nay ít nhất 3 ngày.'],
    'tn.e.time': ['Use hh:mm.', 'Dùng định dạng hh:mm.'], 'tn.e.validity': ['Bid validity must be at least 90 days.', 'Hiệu lực hồ sơ tối thiểu 90 ngày.'], 'tn.e.sec': ['Bid security must be 0–3% of the estimated value.', 'Bảo đảm dự thầu phải từ 0–3% giá trị ước tính.'],
    'tn.e.sec2': ['Bid security must be 0–3%.', 'Bảo đảm dự thầu phải từ 0–3%.'], 'tn.e.weights': ['Technical + price weights must total 100%.', 'Trọng số kỹ thuật + giá phải bằng 100%.'], 'tn.e.weights2': ['Weights must total 100%.', 'Tổng trọng số phải bằng 100%.'],
    'tn.e.env': ['A two-envelope tender needs Two envelopes.', 'Gói thầu hai túi cần chọn Hai túi hồ sơ.'], 'tn.e.matStatus': ['{m} is {s} and cannot be tendered.', '{m} đang ở trạng thái {s}, không thể đấu thầu.'],
    'tn.savedDraft': ['{id} saved as Draft · invite vendors next', 'Đã lưu nháp {id} · tiếp theo mời NCC'],
    'tn.step.Draft': ['Draft', 'Nháp'], 'tn.step.Invited': ['Invited', 'Đã mời'], 'tn.step.QA': ['Q&A', 'Hỏi đáp'], 'tn.step.Bidding': ['Bidding', 'Nộp hồ sơ'], 'tn.step.Opening': ['Bid opening', 'Mở thầu'], 'tn.step.Evaluation': ['Evaluation', 'Đánh giá'], 'tn.step.Award': ['Award', 'Trao thầu'],
    'tn.progress': ['Tender progress', 'Tiến độ gói thầu'], 'tn.done': ['(done)', '(xong)'],
    'tn.lines': ['Lines by Material ID ({n})', 'Dòng theo mã vật tư ({n})'], 'tn.c.avg90': ['90-day avg excl. VAT', 'BQ 90 ngày chưa VAT'], 'tn.pkgNote': ['Estimated package {v} excl. VAT · source {pr}', 'Ước tính gói thầu {v} chưa VAT · nguồn {pr}'],
    'tn.settings': ['Settings', 'Thiết lập'], 'tn.s.secIn': ['Within the suggested 1–1,5%', 'Trong mức đề xuất 1–1,5%'], 'tn.s.secNone': ['No bid security (RFQ)', 'Không yêu cầu bảo đảm dự thầu (RFQ)'], 'tn.s.secOut': ['Outside the suggested 1–1,5% — note the reason', 'Ngoài mức đề xuất 1–1,5% — ghi rõ lý do'],
    'tn.s.single': ['Single', 'Một túi'], 'tn.s.two': ['Two (technical + price)', 'Hai túi (kỹ thuật + giá)'], 'tn.s.secPct': ['Bid security %', 'Bảo đảm dự thầu %'], 'tn.s.secHint': ['Suggested 1–1,5% for goods/services ≤ 10 bn ₫', 'Đề xuất 1–1,5% cho hàng hóa/dịch vụ ≤ 10 tỷ ₫'],
    'tn.s.atLeast90': ['At least 90', 'Tối thiểu 90'], 'tn.s.currency': ['Currency', 'Đồng tiền'], 'tn.s.save': ['Save settings', 'Lưu thiết lập'], 'tn.s.sec': ['Bid security', 'Bảo đảm dự thầu'], 'tn.s.none': ['None', 'Không'],
    'tn.s.weights': ['Weights', 'Trọng số'], 'tn.s.weightsV': ['Technical {a}% · price {b}% · pass mark {p}/100', 'Kỹ thuật {a}% · giá {b}% · điểm đạt {p}/100'], 'tn.s.priceScore': ['Price score', 'Điểm giá'], 'tn.s.priceScoreV': ['Lowest total ÷ bidder total × 100', 'Tổng thấp nhất ÷ tổng của nhà thầu × 100'],
    'tn.s.validity': ['Bid validity', 'Hiệu lực hồ sơ'], 'tn.s.lastDelivery': ['Last delivery', 'Giao lần cuối'], 'tn.s.visibility': ['Visibility', 'Phạm vi'], 'tn.s.invitedOnly': ['Invited vendors only', 'Chỉ NCC được mời'],
    'tn.s.locked': ['Settings are locked once bidding has started. Change them with an addendum.', 'Thiết lập bị khóa khi đã bắt đầu nhận hồ sơ. Thay đổi bằng văn bản sửa đổi.'], 'tn.s.edit': ['Edit settings', 'Sửa thiết lập'], 'tn.s.saved': ['Settings saved', 'Đã lưu thiết lập'],
    'tn.au.title': ['e-Auction settings', 'Thiết lập đấu giá điện tử'], 'tn.au.type': ['Reverse auction per Material ID line ({m})', 'Đấu giá ngược theo dòng mã vật tư ({m})'], 'tn.au.live': ['Live window', 'Khung giờ đấu giá'], 'tn.au.start': ['Start price', 'Giá khởi điểm'],
    'tn.au.dec': ['Minimum decrement', 'Bước giảm tối thiểu'], 'tn.au.extend': ['Auto-extend', 'Tự động gia hạn'], 'tn.au.extendV': ['{n} minutes when a bid arrives in the last {n} minutes', '{n} phút khi có giá trong {n} phút cuối'],
    'tn.au.view': ['Supplier view', 'NCC thấy'], 'tn.au.viewV': ['{v} — suppliers see only their own rank', '{v} — NCC chỉ thấy thứ hạng của mình'], 'tn.au.note': ['The final price per line is written to Price history after the auction closes.', 'Giá cuối mỗi dòng được ghi vào Lịch sử giá sau khi kết thúc đấu giá.'],
    'tn.fx.title': ['Currency', 'Đồng tiền'], 'tn.fx.body': ['Bids are accepted in VND or USD.', 'Nhận hồ sơ bằng VND hoặc USD.'], 'tn.fx.note': ['The comparison matrix shows the VND equivalent excl. VAT with the original currency in its own column. Rate source and date are recorded in the bid opening minutes.', 'Bảng so sánh hiển thị giá trị quy đổi VND chưa VAT, đồng tiền gốc ở cột riêng. Nguồn và ngày tỷ giá được ghi trong biên bản mở thầu.'],
    'tn.inv.title': ['Invited vendors ({n})', 'NCC được mời ({n})'], 'tn.inv.not': ['Not invited yet', 'Chưa mời'], 'tn.inv.elig': ['{n} vendors are approved for these Material IDs: {v}. Blocked vendor – Material ID pairs are excluded.', '{n} NCC đã được duyệt cho các mã vật tư này: {v}. Cặp NCC – mã vật tư bị chặn được loại trừ.'],
    'tn.inv.btn': ['Invite vendors (Gmail + portal)', 'Mời NCC (Gmail + cổng NCC)'], 'tn.inv.certBlock': ['Certificate block', 'Chặn do chứng chỉ'], 'tn.inv.extra': ['+{n} invited outside the approved list (by exception)', '+{n} mời ngoài danh sách đã duyệt (ngoại lệ)'],
    'tn.certWarn': ['Certificate block — {m}', 'Chặn do chứng chỉ — {m}'],
    'tn.sb.title': ['Bids · sealed · {a} of {b} bids received', 'Hồ sơ · niêm phong · đã nhận {a}/{b}'], 'tn.sb.until': ['Sealed until {d}.', 'Niêm phong đến {d}.'], 'tn.sb.hidden': ['Prices are hidden from Procurement until the tender closes and two committee members open the bids.', 'Giá được ẩn với bộ phận Mua sắm cho đến khi đóng thầu và hai thành viên tổ chuyên gia mở thầu.'],
    'tn.c.bidder': ['Bidder', 'Nhà thầu'], 'tn.c.rc': ['Receipt no.', 'Số biên nhận'], 'tn.c.submitted': ['Submitted', 'Thời điểm nộp'], 'tn.c.price': ['Price', 'Giá'], 'tn.sealedW': ['Sealed', 'Niêm phong'], 'tn.sb.label': ['Sealed bids', 'Hồ sơ niêm phong'],
    'tn.op.h': ['Bid opening', 'Mở thầu'], 'tn.op.rule': ['Opening needs two named committee members with a signed COI declaration: {a} + {b}. The technical envelope opens 5 minutes after closing; the unseal event is written to the audit log.', 'Mở thầu cần hai thành viên tổ chuyên gia đã ký cam kết COI: {a} + {b}. Túi kỹ thuật mở 5 phút sau khi đóng thầu; sự kiện mở niêm phong được ghi vào nhật ký.'],
    'tn.op.btn': ['Open bids', 'Mở thầu'], 'tn.op.after': ['Available after {d}', 'Mở được sau {d}'], 'tn.op.matrix': ['Comparison matrix', 'Bảng so sánh'], 'tn.op.locked': ['Locked until bid opening', 'Khóa đến khi mở thầu'],
    'tn.op.lockedN': ['The price matrix per Material ID line unlocks after {d}.', 'Bảng giá theo dòng mã vật tư mở khóa sau {d}.'], 'tn.op.needTwo': ['Bid opening needs Nguyễn Minh Anh + Đỗ Hoàng Nam to confirm', 'Mở thầu cần Nguyễn Minh Anh + Đỗ Hoàng Nam xác nhận'],
    'tn.com.title': ['Evaluation committee & COI', 'Tổ chuyên gia & xung đột lợi ích (COI)'], 'tn.com.signed': ['COI signed {d}', 'Đã ký COI {d}'], 'tn.com.not': ['COI not signed', 'Chưa ký COI'], 'tn.com.remind': ['Remind', 'Nhắc'],
    'tn.com.note': ['A member without a signed COI declaration cannot open or score bids. SoD: an evaluator cannot approve the award.', 'Thành viên chưa ký cam kết COI không được mở hoặc chấm hồ sơ. SoD: người chấm không được duyệt trao thầu.'], 'tn.com.reminded': ['COI reminder sent to {n}', 'Đã gửi nhắc ký COI cho {n}'], 'tn.com.none': ['No committee set yet', 'Chưa lập tổ chuyên gia'],
    'tn.qa.title': ['Q&A ({n})', 'Hỏi đáp ({n})'], 'tn.qa.add': ['Addendum No. {n} · {d}', 'Văn bản sửa đổi số {n} · {d}'], 'tn.qa.acks': ['Acknowledged {a} / {b} · sent by Gmail and portal · {list}', 'Đã xác nhận {a} / {b} · gửi qua Gmail và cổng NCC · {list}'],
    'tn.qa.line': ['Material ID line', 'Dòng mã vật tư'], 'tn.qa.q': ['Question (as received)', 'Câu hỏi (nguyên văn)'], 'tn.qa.a': ['Answer', 'Trả lời'], 'tn.qa.anon': ['Published to all invited bidders without naming who asked.', 'Công bố cho mọi nhà thầu được mời, không nêu tên người hỏi.'],
    'tn.qa.publish': ['Publish answer', 'Công bố trả lời'], 'tn.qa.pending': ['{n} question(s) from bidders waiting for an answer', '{n} câu hỏi từ nhà thầu đang chờ trả lời'], 'tn.qa.bidderAnon': ['bidder (anonymous)', 'nhà thầu (ẩn danh)'], 'tn.qa.answer': ['Answer', 'Trả lời'],
    'tn.qa.qn': ['Q{n} · {d} · Bidder (anonymous)', 'H{n} · {d} · Nhà thầu (ẩn danh)'], 'tn.qa.ans': ['Answer: {a}', 'Trả lời: {a}'], 'tn.qa.none': ['No questions yet.', 'Chưa có câu hỏi.'], 'tn.qa.log': ['Open Q&A log', 'Mở nhật ký hỏi đáp'],
    'tn.qa.logMsg': ['Q&A log exported with timestamps (audit)', 'Đã xuất nhật ký hỏi đáp kèm thời gian (kiểm toán)'], 'tn.qa.new': ['Answer a question', 'Trả lời câu hỏi'], 'tn.qa.e.q': ['Enter the question (at least 10 characters).', 'Nhập câu hỏi (ít nhất 10 ký tự).'],
    'tn.qa.e.a': ['Enter the answer (at least 10 characters).', 'Nhập câu trả lời (ít nhất 10 ký tự).'], 'tn.qa.published': ['Answer published to {n} bidders (anonymous)', 'Đã công bố trả lời cho {n} nhà thầu (ẩn danh)'], 'tn.qa.noQa': ['Q&A is not used for this tender.', 'Gói thầu này không dùng hỏi đáp.'],
    'tn.om.title': ['Bid opening minutes', 'Biên bản mở thầu'], 'tn.om.tech': ['Technical envelopes opened {d} (5 minutes after closing) by {by} · COI signed · audit logged', 'Mở túi kỹ thuật {d} (5 phút sau đóng thầu) bởi {by} · đã ký COI · đã ghi nhật ký'],
    'tn.om.price': ['Price envelopes opened {d} by {by} · only for bidders who passed the technical envelope · audit logged', 'Mở túi giá {d} bởi {by} · chỉ với nhà thầu đạt kỹ thuật · đã ghi nhật ký'], 'tn.c.totalEx': ['Total excl. VAT', 'Tổng chưa VAT'], 'tn.notOpened': ['Not opened', 'Không mở'],
    'tn.c.validity': ['Validity', 'Hiệu lực'], 'tn.short': ['Short', 'Thiếu'], 'tn.missing': ['Missing', 'Thiếu'], 'tn.om.pdf': ['TND-029_Bien-ban-mo-thau.pdf downloaded', 'Đã tải TND-029_Bien-ban-mo-thau.pdf'], 'tn.dlPdf': ['Download PDF', 'Tải PDF'],
    'tn.te.title': ['Technical evaluation · envelope 1 · pass ≥ {p}/100', 'Đánh giá kỹ thuật · túi 1 · đạt ≥ {p}/100'], 'tn.te.cons': ['Consolidated', 'Tổng hợp'], 'tn.te.result': ['Result', 'Kết quả'], 'tn.pass': ['Pass', 'Đạt'], 'tn.fail': ['Fail', 'Không đạt'],
    'tn.te.label': ['Technical scores by evaluator', 'Điểm kỹ thuật theo người chấm'], 'tn.te.note': ['Criteria from the Material ID specifications (mác M300/M250, độ sụt, cần bơm 37 m). Consolidated = average of evaluators. Lê Quốc Huy has not signed the COI and cannot score.', 'Tiêu chí lấy từ thông số mã vật tư (mác M300/M250, độ sụt, cần bơm 37 m). Tổng hợp = trung bình các người chấm. Lê Quốc Huy chưa ký COI nên không được chấm.'],
    'tn.mx.title': ['Price comparison · envelope 2 · prices excl. VAT', 'So sánh giá · túi 2 · giá chưa VAT'], 'tn.mx.line': ['Material ID line', 'Dòng mã vật tư'], 'tn.mx.base': ['Baseline (last PO)', 'Giá cơ sở (PO gần nhất)'], 'tn.mx.firstAvg': ['1st-round avg', 'BQ vòng 1'],
    'tn.mx.lowest': ['Lowest', 'Thấp nhất'], 'tn.mx.secNon': ['Non-compliant · missing', 'Không hợp lệ · thiếu'], 'tn.mx.excluded': ['Excluded', 'Bị loại'], 'tn.mx.rank': ['Rank {n}', 'Hạng {n}'], 'tn.mx.non': ['Non-compliant', 'Không hợp lệ'],
    'tn.mx.sub': ['Subtotal excl. VAT', 'Cộng chưa VAT'], 'tn.mx.tot': ['Total incl. VAT', 'Tổng gồm VAT'], 'tn.mx.secRow': ['Bid security (≥ {v})', 'Bảo đảm dự thầu (≥ {v})'], 'tn.mx.score': ['Weighted score', 'Điểm có trọng số'], 'tn.mx.ranking': ['Ranking', 'Xếp hạng'],
    'tn.mx.label': ['Bid comparison matrix by Material ID line', 'Bảng so sánh giá theo dòng mã vật tư'],
    'tn.mx.note': ['"Lowest" is per line among compliant bids. Price score = lowest total ÷ bidder total × 100; weighted = technical × {a}% + price × {b}%. {fail} failed the technical envelope — price envelope not opened. A bid without valid bid security is Non-compliant and not ranked.', '"Thấp nhất" tính theo dòng trong các hồ sơ hợp lệ. Điểm giá = tổng thấp nhất ÷ tổng của nhà thầu × 100; điểm có trọng số = kỹ thuật × {a}% + giá × {b}%. {fail} không đạt kỹ thuật — không mở túi giá. Hồ sơ không có bảo đảm dự thầu hợp lệ là Không hợp lệ và không xếp hạng.'],
    'tn.ev.none': ['No evaluation yet', 'Chưa đánh giá'], 'tn.ev.noneN': ['Technical and price evaluation starts after bid opening.', 'Đánh giá kỹ thuật và giá bắt đầu sau khi mở thầu.'],
    'tn.aw.title': ['Award recommendation · Tờ trình', 'Tờ trình đề xuất trao thầu'], 'tn.aw.vendorFor': ['Vendor for {m}', 'NCC cho {m}'], 'tn.aw.rec': ['Recommended vendor', 'NCC đề xuất'], 'tn.aw.unit': ['Awarded unit price', 'Đơn giá trúng thầu'], 'tn.aw.notLowest': ['Not lowest', 'Không thấp nhất'],
    'tn.aw.saving': ['Saving vs baseline', 'Tiết kiệm so với giá cơ sở'], 'tn.aw.label': ['Award by Material ID line', 'Trao thầu theo dòng mã vật tư'], 'tn.aw.approved': ['Approved by {a} · {d}.', 'Đã được {a} duyệt · {d}.'],
    'tn.aw.approvedN': ['Result notices sent by Gmail and portal. Awarded prices written to Price history.', 'Đã gửi thông báo kết quả qua Gmail và cổng NCC. Giá trúng thầu đã ghi vào Lịch sử giá.'], 'tn.aw.pending': ['Pending approval · {a} (Finance Director).', 'Chờ duyệt · {a} (Giám đốc Tài chính).'],
    'tn.aw.pendingN': ['Submitted {d} · in My approvals of the approver.', 'Đã gửi {d} · nằm trong Chờ tôi duyệt của người duyệt.'], 'tn.aw.notices': ['Result notices', 'Thông báo kết quả'], 'tn.aw.awarded': ['Awarded', 'Trúng thầu'],
    'tn.aw.unsucc': ['Unsuccessful', 'Không trúng thầu'], 'tn.aw.rankN': ['rank {n}', 'hạng {n}'], 'tn.aw.techFail': ['technical Fail', 'không đạt kỹ thuật'], 'tn.aw.nonc': ['non-compliant', 'không hợp lệ'], 'tn.aw.channel': ['Channel', 'Kênh'], 'tn.aw.gmailPortal': ['Gmail + portal', 'Gmail + cổng NCC'],
    'tn.aw.held': ['Held until performance security', 'Giữ đến khi có bảo đảm thực hiện HĐ'], 'tn.aw.release': ['Release by {d}', 'Hoàn trả trước {d}'], 'tn.createPo': ['Create PO', 'Tạo PO'], 'tn.createCt': ['Create contract', 'Tạo hợp đồng'], 'tn.aw.afterApproval': ['Enabled after the award is approved', 'Mở sau khi trao thầu được duyệt'],
    'tn.aw.value': ['Award value', 'Giá trị trao thầu'], 'tn.aw.baseline': ['Baseline', 'Giá cơ sở'], 'tn.aw.baselineV': ['{v} (last PO price per Material ID)', '{v} (giá PO gần nhất theo mã vật tư)'], 'tn.aw.savingL': ['Saving', 'Tiết kiệm'],
    'tn.aw.savingV': ['= {p} · (baseline − awarded) × qty per line', '= {p} · (giá cơ sở − giá trúng) × SL mỗi dòng'], 'tn.aw.route': ['Route', 'Luồng duyệt'],
    'tn.aw.routeV': ['≤ 2 bn ₫ band needs the Procurement Lead, but Nguyễn Minh Anh evaluated this tender (SoD: evaluator ≠ award approver) → Đỗ Hoàng Nam approves.', 'Mức ≤ 2 tỷ ₫ do Trưởng phòng Mua sắm duyệt, nhưng Nguyễn Minh Anh đã chấm gói thầu này (SoD: người chấm ≠ người duyệt trao thầu) → Đỗ Hoàng Nam duyệt.'],
    'tn.aw.just': ['Justification', 'Giải trình'], 'tn.aw.justReq': ['Justification (required: a line is not awarded to the lowest price)', 'Giải trình (bắt buộc: có dòng không trao cho giá thấp nhất)'], 'tn.aw.submit': ['Submit award recommendation', 'Gửi tờ trình trao thầu'],
    'tn.aw.e.why': ['Explain in at least 20 characters why the lowest price is not chosen on every line.', 'Giải trình ít nhất 20 ký tự vì sao không chọn giá thấp nhất ở mọi dòng.'], 'tn.aw.sent': ['{id} award recommendation sent to Đỗ Hoàng Nam', 'Đã gửi tờ trình trao thầu {id} cho Đỗ Hoàng Nam'],
    'tn.aw.simple': ['Award', 'Trao thầu'], 'tn.aw.to': ['Awarded to', 'Trao cho'], 'tn.aw.exVat': ['{v} excl. VAT', '{v} chưa VAT'], 'tn.aw.none': ['No award yet', 'Chưa trao thầu'], 'tn.aw.noneN': ['The award recommendation is prepared after the evaluation.', 'Tờ trình trao thầu được lập sau khi đánh giá.'],
    'tn.notFound': ['Tender {id} was not found.', 'Không tìm thấy gói thầu {id}.'], 'tn.noDetail': ['Tender {id} has no detail record.', 'Gói thầu {id} chưa có hồ sơ chi tiết.'], 'tn.back': ['Back to tenders', 'Về danh sách gói thầu'],
    'tn.closesAt': ['closes {d}', 'đóng thầu {d}'], 'tn.remind': ['Remind bidders', 'Nhắc nhà thầu'], 'tn.remindMsg': ['Reminder sent to bidders who have not submitted', 'Đã nhắc các nhà thầu chưa nộp hồ sơ'], 'tn.invite': ['Invite vendors', 'Mời NCC'],
    'tn.a.vat8': ['8% reduction ends 31/12/2026 — rate is set at invoice date.', 'Giảm 8% kết thúc 31/12/2026 — thuế suất xác định theo ngày hóa đơn.'], 'tn.a.vat8n': ['Deliveries until {d}: lines with reduced VAT are invoiced at the standard rate from 01/01/2027.', 'Giao hàng đến {d}: dòng hưởng VAT giảm sẽ xuất hóa đơn theo thuế suất chuẩn từ 01/01/2027.'],
    'tn.k.est': ['Estimated value', 'Giá trị ước tính'], 'tn.k.estN': ['excl. VAT · 90-day avg', 'chưa VAT · BQ 90 ngày'], 'tn.k.bids': ['Bids', 'Hồ sơ dự thầu'], 'tn.k.recv': ['Received / invited', 'Đã nhận / đã mời'], 'tn.k.closes': ['Closes', 'Đóng thầu'],
    'tn.k.closesN': ['{n} days · {t}', '{n} ngày · {t}'], 'tn.k.closed': ['Closed', 'Đã đóng'], 'tn.k.sec': ['Bid security', 'Bảo đảm dự thầu'], 'tn.k.secN': ['{p}% of estimate', '{p}% giá trị ước tính'], 'tn.k.notReq': ['Not required', 'Không yêu cầu'],
    'tn.noApproved': ['No approved vendor for these Material IDs — approve a vendor link first', 'Chưa có NCC được duyệt cho các mã vật tư này — hãy duyệt liên kết NCC trước'], 'tn.invited': ['{n} vendors invited by Gmail + portal', 'Đã mời {n} NCC qua Gmail + cổng NCC'],
    'tn.cur.VNDUSD': ['VND or USD', 'VND hoặc USD']
  });
  I18N.values({
    RFQ: 'Chào giá (RFQ)', 'Sealed bid': 'Đấu thầu kín', 'Two-envelope': 'Hai túi hồ sơ', 'e-Auction': 'Đấu giá điện tử', 'Award pending': 'Chờ duyệt trao thầu', 'Bid opening': 'Mở thầu', 'Not submitted': 'Chưa nộp',
    'Chair · technical evaluator': 'Chủ tịch · chấm kỹ thuật', 'Technical evaluator': 'Chấm kỹ thuật', 'Commercial evaluator': 'Chấm thương mại', 'Witness (bid opening)': 'Chứng kiến (mở thầu)', 'Award approver': 'Người duyệt trao thầu',
    'Chair · evaluator': 'Chủ tịch · người chấm', Evaluator: 'Người chấm', 'Rank only': 'Chỉ thứ hạng', 'VND or USD': 'VND hoặc USD',
    'USD bids converted at the Vietcombank selling rate on the opening day': 'Hồ sơ USD quy đổi theo tỷ giá bán Vietcombank ngày mở thầu',
    'CON-24015 line benchmarks CT-2026-008 (Q4 15.627.500 ₫)': 'Dòng CON-24015 so sánh với CT-2026-008 (Q4 15.627.500 ₫)',
    'SRV-52210: 36 → 40 ca; thêm yêu cầu cần bơm 37 m. Closing time unchanged (30/10/2026 17:00).': 'SRV-52210: 36 → 40 ca; thêm yêu cầu cần bơm 37 m. Giữ nguyên thời điểm đóng thầu (30/10/2026 17:00).',
    'CON-24330: giao 2 đợt (425 m³ mỗi đợt, 05/12 và 20/12/2026). Quantities and closing time unchanged (05/11/2026 17:00).': 'CON-24330: giao 2 đợt (425 m³ mỗi đợt, 05/12 và 20/12/2026). Giữ nguyên số lượng và thời điểm đóng thầu (05/11/2026 17:00).',
    System: 'Hệ thống'
  });
  I18N.patterns([[/^Reminder (\d{2}\/\d{2}\/\d{4} \d{2}:\d{2})$/, 'Nhắc $1'], [/^Awarded (\d{2}\/\d{2}\/\d{4})$/, 'Trao thầu $1']]);

  const STEPS = ['tn.step.Draft', 'tn.step.Invited', 'tn.step.QA', 'tn.step.Bidding', 'tn.step.Opening', 'tn.step.Evaluation', 'tn.step.Award'];
  const STEP_OF = { Draft: 0, Invited: 1, 'Q&A': 2, Open: 3, 'Bid opening': 4, Evaluation: 5, 'Award pending': 5, Awarded: 6 };
  const TABS = ['all', 'Open', 'Q&A', 'Evaluation', 'Awarded', 'Draft'];
  const METHODS = ['RFQ', 'Sealed bid', 'Two-envelope', 'e-Auction'];
  const st = { tab: 'all', q: '', method: 'all', cur: null, nf: null, nerr: {}, set: null, serr: {}, up: null, aw: null, awErr: {}, qa: null, qaErr: {} };
  const tones = { Open: 'info', 'Q&A': 'info', Evaluation: 'warning', 'Award pending': 'warning', Awarded: 'success', Draft: 'neutral', Invited: 'info', Cancelled: 'danger' };

  const list = () => D().docs.filter((d) => d.type === 'TND');
  const det = (id) => D().tenders[id];
  const mat = (id) => App.material(id) || { id, name: id, uom: '', vat: 10, vat8: false, vendors: [] };
  const estOf = (l) => { const m = mat(l.mat); return (m.avg90 || m.last || 0) * l.qty; };
  const estTotal = (tn) => tn.lines.reduce((a, l) => a + estOf(l), 0);
  const post2026 = (tn) => tn && tn.delivery && App.dt(tn.delivery) > App.dt('31/12/2026');
  const vat8Flag = (tn) => post2026(tn) && tn.lines.some((l) => mat(l.mat).vat8);
  const closeAt = (doc, tn) => `${doc.close} ${(tn && tn.closeTime) || '17:00'}`;
  const closed = (doc) => App.daysTo(doc.close) < 0;
  const vname = (b) => (b.vid ? App.vshort(App.vendor(b.vid)) : b.name.split(' ').slice(-2).join(' '));
  const catName = (code) => { const c = D().categories.find((x) => x.code === code); return c ? (App.state.lang === 'vi' ? c.vi : c.name) : code || ''; };
  const back = () => `<p class="m-0"><a class="btn" href="#/tenders">${esc(t('tn.back'))}</a></p>`;
  const vendorsOf = (tn) => [...new Set(tn.lines.flatMap((l) => mat(l.mat).vendors.filter((v) => v[1] !== 'Blocked').map((v) => v[0])))];

  /* ---------- F-40 list ---------- */
  function listBlock(all, inTab, cnt) {
    const q = st.q.trim();
    const rows = all.filter((d) => {
      const tn = det(d.id) || {}; const bidders = (tn.bidders || []).map((b) => b.name).join(' ');
      return inTab(d, st.tab) && (st.method === 'all' || tn.method === st.method)
        && (!q || App.matches(`${d.id} ${d.title} ${d.mats.join(' ')} ${bidders} ${d.mats.map((m) => mat(m).name).join(' ')}`, q));
    }).sort((a, b) => App.dt(b.date) - App.dt(a.date));
    const seg = `<div class="seg seg-wrap" role="group" aria-label="${esc(t('c.status'))}">${TABS.map((k) => `<button data-tn="tab" data-k="${esc(k)}" aria-pressed="${st.tab === k}">${esc(k === 'all' ? t('tn.tab.all') : tv(k))} (${cnt(k)})</button>`).join('')}</div>`;
    return block(t('tn.sub.list'), `${seg}<div class="filters"><label class="sr" for="tn-q">${esc(t('tn.searchLbl'))}</label><input class="inp grow" id="tn-q" type="search" data-tnf="q" value="${esc(st.q)}" placeholder="${esc(t('tn.searchPh'))}">
        <label class="sr" for="tn-m">${esc(t('tn.method'))}</label><select class="inp" id="tn-m" data-tnf="method"><option value="all">${esc(t('tn.allMethods'))}</option>${METHODS.map((m) => `<option value="${esc(m)}"${st.method === m ? ' selected' : ''}>${esc(tv(m))}</option>`).join('')}</select></div>
        ${table([
          { h: t('tn.c.tender'), r: (d) => `${S.tndLink(d.id)}<div class="small">${esc(d.title)}</div>`, w: 'minmax(220px,2.2fr)' },
          { h: t('tn.method'), r: (d) => esc(tv((det(d.id) || {}).method || '—')), w: '150px' },
          { h: t('c.mids'), r: (d) => `<span class="chips chips-inline">${d.mats.map(mid).join('')}</span>`, w: 'minmax(150px,1.4fr)' },
          { h: t('tn.c.closes'), r: (d) => `${esc(d.close || '—')}${['Open', 'Q&A'].includes(d.status) && d.close ? `<div class="small muted">${esc(t('tn.daysN', { n: App.daysTo(d.close) }))}</div>` : ''}`, w: '120px' },
          { h: t('tn.c.bids'), r: (d) => `${d.bids} / ${d.invited}${(det(d.id) || {}).bidders && d.sealed ? `<div class="small muted">${esc(t('tn.sealed'))}</div>` : ''}`, cls: 'num', w: '90px' },
          { h: t('c.status'), r: (d) => `${pill(d.status, tones[d.status] || 'neutral')}${vat8Flag(det(d.id)) ? `<div class="small tone-warning">${esc(t('tn.vat8end'))}</div>` : ''}`, w: 'minmax(170px,1.4fr)' }
        ], rows, { empty: t('tn.empty'), label: t('tn.sub.list') })}`,
    { actions: `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('tn.exportMsg', { n: rows.length }))}">${esc(t('c.export'))}</button>` });
  }

  /* ---------- New tender from a PR (L-09 step 1–2) ---------- */
  function newBlock(p) {
    // RB2-02: the form is keyed on its source (?pr= / ?mat=); a different source starts a fresh form
    const src = (p.pr || '') + '|' + (p.mat || '');
    if (st.nf && st.nfSrc !== src) st.nf = null;
    st.nfSrc = src;
    if (!st.nf) {
      const pr = p.pr || (p.mat ? '' : 'PR-2026-0436');
      const est = pr && D().prs[pr] ? D().prs[pr].lines.reduce((a, l) => a + estOf(l), 0) : Infinity;
      st.nf = { pr, mat: p.mat || '', qty: '', title: '', method: est <= 500000000 ? 'RFQ' : 'Sealed bid', envelopes: 'Single', close: '20/11/2026', time: '17:00', validity: '90', currency: 'VND', secPct: est <= 500000000 ? '0' : '1', delivery: '15/12/2026', wt: '40', wp: '60' };
      st.nerr = {};
    }
    const f = st.nf; const e = st.nerr;
    const prs = D().docs.filter((d) => d.type === 'PR' && ['Approved'].includes(d.status));
    const lines = f.pr && D().prs[f.pr] ? D().prs[f.pr].lines : f.mat ? [{ mat: f.mat, qty: +String(f.qty).replace(',', '.') || 0 }] : [];
    const est = lines.reduce((a, l) => a + estOf(l), 0); const sec = Math.round(est * (+String(f.secPct).replace(',', '.') || 0) / 100);
    const flag = f.delivery && S.validDate(f.delivery) && App.dt(f.delivery) > App.dt('31/12/2026') && lines.some((l) => mat(l.mat).vat8);
    return block(t('tn.setup'), `<form id="tn-new" class="stack" novalidate><p class="small muted m-0">${esc(t('tn.newNote'))}</p>
        ${e._ ? `<div class="alert alert-danger" role="alert">${esc(S.errText(e._))}</div>` : ''}
        <div class="form-grid">${S.field('tn', e, 'pr', t('tn.f.pr'), f.pr, { options: [['', f.mat ? t('tn.f.noPr', { m: f.mat }) : t('c.choose')]].concat(prs.map((d) => [d.id, `${d.id} · ${d.title}`])), hint: t('tn.f.prHint') })}
          ${!f.pr ? S.field('tn', e, 'qty', `${t('tn.f.qty')}${f.mat ? ' (' + mat(f.mat).uom + ')' : ''}`, f.qty, { req: true, mode: 'decimal' }) : ''}
          ${S.field('tn', e, 'title', t('tn.f.title'), f.title, { req: true, ph: t('tn.f.titlePh') })}
          ${S.field('tn', e, 'method', t('tn.method'), f.method, { options: METHODS })}
          ${S.field('tn', e, 'envelopes', t('tn.f.envelopes'), f.envelopes, { options: [['Single', t('tn.env.single')], ['Two', t('tn.env.two')]] })}
          ${S.field('tn', e, 'close', t('tn.f.close'), f.close, { req: true, ph: 'dd/mm/yyyy' })}${S.field('tn', e, 'time', t('tn.f.time'), f.time, { ph: 'hh:mm' })}
          ${S.field('tn', e, 'validity', t('tn.f.validity'), f.validity, { mode: 'numeric', hint: t('tn.f.validityHint') })}
          ${S.field('tn', e, 'currency', t('tn.f.currency'), f.currency, { options: [['VND', 'VND'], ['VND or USD', t('tn.cur.both')]] })}
          ${S.field('tn', e, 'secPct', t('tn.f.secPct'), f.secPct, { mode: 'decimal', hint: t('tn.f.secHint', { v: vnd(sec) }) })}
          ${S.field('tn', e, 'delivery', t('tn.f.delivery'), f.delivery, { ph: 'dd/mm/yyyy' })}
          ${S.field('tn', e, 'wt', t('tn.f.wt'), f.wt, { mode: 'numeric' })}${S.field('tn', e, 'wp', t('tn.f.wp'), f.wp, { mode: 'numeric', hint: t('tn.f.wHint') })}</div>
        ${flag ? `<div class="alert alert-warning" role="status">${esc(t('tn.vat8note'))}</div>` : ''}
        <h3 class="h-sub">${esc(t('tn.linesN', { n: lines.length }))}</h3>
        ${table([{ h: t('c.mid'), r: (l) => mid(l.mat), w: '120px' }, { h: t('c.description'), r: (l) => esc(mat(l.mat).name), w: 'minmax(160px,2fr)' }, { h: t('tn.c.qty'), r: (l) => `${num(l.qty)} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '110px' },
          { h: 'VAT', r: (l) => S.vatCell(mat(l.mat).vat), w: 'minmax(120px,1fr)' }, { h: t('tn.c.est'), r: (l) => vnd(estOf(l)), cls: 'num', w: '160px' }], lines, { empty: t('tn.noLines'), label: t('tn.linesN', { n: lines.length }) })}
        <p class="small muted mt-0">${esc(t('tn.estNote', { v: vnd(est) }))}</p>
        <div class="row-acts"><a class="btn" href="#/tenders">${esc(t('c.cancel'))}</a><button type="submit" class="btn btn-p">${esc(t('tn.saveDraft'))}</button></div></form>`);
  }
  function saveNew(root) {
    const f = Object.assign(st.nf, S.read(root, '#tn-new')); const e = {};
    const lines = f.pr && D().prs[f.pr] ? D().prs[f.pr].lines.map((l) => ({ mat: l.mat, qty: l.qty })) : f.mat ? [{ mat: f.mat, qty: +String(f.qty).replace(',', '.') }] : [];
    if (!lines.length) e.pr = 'tn.e.pr';
    if (!f.pr && f.mat && !(lines[0].qty > 0)) e.qty = 'tn.e.qty';
    if (!f.title) e.title = 'tn.e.title';
    if (!S.validDate(f.close)) e.close = 'c.dateFmt'; else if (App.daysTo(f.close) < 3) e.close = 'tn.e.close3';
    if (!/^\d{2}:\d{2}$/.test(f.time)) e.time = 'tn.e.time';
    if (!(+f.validity >= 90)) e.validity = 'tn.e.validity';
    const sp = +String(f.secPct).replace(',', '.');
    if (isNaN(sp) || sp < 0 || sp > 3) e.secPct = 'tn.e.sec';
    if (f.delivery && !S.validDate(f.delivery)) e.delivery = 'c.dateFmt';
    if (+f.wt + +f.wp !== 100) e.wp = 'tn.e.weights';
    if (f.method === 'Two-envelope' && f.envelopes !== 'Two') e.envelopes = 'tn.e.env';
    lines.forEach((l) => { const m = App.material(l.mat); if (m && m.status !== 'Active') e._ = ['tn.e.matStatus', { m: l.mat, s: tv(m.status) }]; });
    st.nerr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#tn-new'); return; }
    const n = Math.max(...list().map((d) => +d.id.slice(9))) + 1; const id = 'TND-2026-' + String(n).padStart(3, '0');
    D().docs.push({ id, type: 'TND', title: f.title, cat: mat(lines[0].mat).cat, date: D().today, close: f.close, status: 'Draft', mats: lines.map((l) => l.mat), invited: 0, bids: 0 });
    D().tenders[id] = { method: f.method, envelopes: f.envelopes, pr: f.pr || null, owner: S.me(), delivery: f.delivery, currency: f.currency, validity: +f.validity, secPct: sp, closeTime: f.time, lines, step: 0, weights: [+f.wt, +f.wp], pass: 70, qa: [], addenda: [], files: [], committee: [[S.me(), 'Chair · evaluator', 'Not signed']] };
    if (f.pr) { const d = S.docOf(f.pr); if (d) { d.status = 'In tender'; d.next = id; } }
    st.nf = null; location.hash = '#/tenders/' + id; App.toast(t('tn.savedDraft', { id }));
  }

  /* ---------- Detail blocks ---------- */
  const progress = (i, all) => `<ol class="steps" aria-label="${esc(t('tn.progress'))}">${STEPS.map((k, n) => { const dn = n < i || all; const cu = n === i && !all; return `<li class="${dn ? 'done' : cu ? 'cur' : ''}"${cu ? ' aria-current="step"' : ''}><span class="st-n" aria-hidden="true">${dn ? '✓' : n + 1}</span><span class="st-l">${esc(t(k))}</span>${dn ? `<span class="sr"> ${esc(t('tn.done'))}</span>` : ''}</li>`; }).join('')}</ol>`;

  function linesBlock(doc, tn, step) {
    return block(t('tn.lines', { n: tn.lines.length }), progress(step, doc.status === 'Awarded') + table([
      { h: t('c.mid'), r: (l) => mid(l.mat), w: '120px' }, { h: t('c.description'), r: (l) => esc(mat(l.mat).name), w: 'minmax(170px,2fr)' },
      { h: t('tn.c.qty'), r: (l) => `${num(l.qty)} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '100px' }, { h: 'VAT', r: (l) => S.vatCell(mat(l.mat).vat), w: 'minmax(130px,1.3fr)' },
      { h: t('tn.c.avg90'), r: (l) => vnd(mat(l.mat).avg90 || mat(l.mat).last), cls: 'num', w: '150px' }, { h: t('tn.c.est'), r: (l) => vnd(estOf(l)), cls: 'num', w: '150px' }
    ], tn.lines, { label: t('tn.lines', { n: tn.lines.length }) }) + `<p class="small muted">${t('tn.pkgNote', { v: vnd(estTotal(tn)), pr: S.prLink(tn.pr) })}${tn.benchmark ? ' · ' + esc(tv(tn.benchmark)) : ''}</p>`);
  }

  function settingsBlock(doc, tn) {
    const est = estTotal(tn); const secAmt = tn.secAmount || Math.round(est * tn.secPct / 100);
    const locked = (doc.bids || 0) > 0 || STEP_OF[doc.status] >= 3;
    const secHint = tn.secPct >= 1 && tn.secPct <= 1.5 ? t('tn.s.secIn') : tn.secPct === 0 ? t('tn.s.secNone') : t('tn.s.secOut');
    if (st.set) {
      const f = st.set; const e = st.serr;
      return block(t('tn.settings'), `<form id="tn-set" class="stack" novalidate><div class="form-grid">
        ${S.field('ts', e, 'envelopes', t('tn.f.envelopes'), f.envelopes, { options: [['Single', t('tn.s.single')], ['Two', t('tn.s.two')]] })}
        ${S.field('ts', e, 'secPct', t('tn.s.secPct'), f.secPct, { mode: 'decimal', hint: t('tn.s.secHint') })}
        ${S.field('ts', e, 'validity', t('tn.f.validity'), f.validity, { mode: 'numeric', hint: t('tn.s.atLeast90') })}
        ${S.field('ts', e, 'currency', t('tn.s.currency'), f.currency, { options: [['VND', 'VND'], ['VND or USD', t('tn.cur.VNDUSD')]] })}
        ${S.field('ts', e, 'wt', t('tn.f.wt'), f.wt, { mode: 'numeric' })}${S.field('ts', e, 'wp', t('tn.f.wp'), f.wp, { mode: 'numeric' })}</div>
        <div class="row-acts"><button type="button" class="btn btn-sm" data-tn="set-cancel">${esc(t('c.cancel'))}</button><button type="submit" class="btn btn-sm btn-p">${esc(t('tn.s.save'))}</button></div></form>`, { span: 6 });
    }
    const w = tn.weights || [40, 60];
    return block(t('tn.settings'), `<dl class="dl"><dt>${esc(t('tn.method'))}</dt><dd>${esc(tv(tn.method))}</dd><dt>${esc(t('tn.f.envelopes'))}</dt><dd>${esc(tn.envelopes === 'Two' ? t('tn.s.two') : t('tn.s.single'))}</dd>
      <dt>${esc(t('tn.s.sec'))}</dt><dd>${tn.secPct ? `${num(tn.secPct, 1)}% · ${vnd(secAmt)}` : esc(t('tn.s.none'))} <div class="small muted">${esc(secHint)}</div></dd>
      ${tn.envelopes === 'Two' ? `<dt>${esc(t('tn.s.weights'))}</dt><dd>${esc(t('tn.s.weightsV', { a: w[0], b: w[1], p: tn.pass || 70 }))}</dd><dt>${esc(t('tn.s.priceScore'))}</dt><dd>${esc(t('tn.s.priceScoreV'))}</dd>` : ''}
      <dt>${esc(t('tn.s.validity'))}</dt><dd>${esc(t('tn.daysN', { n: tn.validity }))}</dd><dt>${esc(t('tn.s.currency'))}</dt><dd>${esc(tv(tn.currency))}${tn.fx ? `<div class="small muted">${esc(tv(tn.fx))}</div>` : ''}</dd>
      <dt>${esc(t('tn.c.closes'))}</dt><dd>${esc(closeAt(doc, tn))}</dd><dt>${esc(t('tn.s.lastDelivery'))}</dt><dd>${esc(tn.delivery || '—')}</dd><dt>${esc(t('tn.s.visibility'))}</dt><dd>${esc(t('tn.s.invitedOnly'))}</dd><dt>${esc(t('c.owner'))}</dt><dd>${esc(tn.owner)}</dd></dl>
      ${locked ? `<p class="small muted">${esc(t('tn.s.locked'))}</p>` : ''}`,
    { span: 6, actions: locked ? '' : `<button class="btn btn-sm" data-tn="set-edit">${esc(t('tn.s.edit'))}</button>` });
  }
  function saveSettings(root, tn) {
    const f = Object.assign(st.set, S.read(root, '#tn-set')); const e = {}; const sp = +String(f.secPct).replace(',', '.');
    if (isNaN(sp) || sp < 0 || sp > 3) e.secPct = 'tn.e.sec2';
    if (!(+f.validity >= 90)) e.validity = 'tn.e.validity';
    if (+f.wt + +f.wp !== 100) e.wp = 'tn.e.weights2';
    if (tn.method === 'Two-envelope' && f.envelopes !== 'Two') e.envelopes = 'tn.e.env';
    st.serr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#tn-set'); return; }
    Object.assign(tn, { envelopes: f.envelopes, secPct: sp, validity: +f.validity, currency: f.currency, weights: [+f.wt, +f.wp] }); delete tn.secAmount;
    st.set = null; App.render(); App.toast(t('tn.s.saved'));
  }

  function auctionBlock(tn) {
    const a = tn.auction;
    return block(t('tn.au.title'), `<dl class="dl"><dt>${esc(t('c.type'))}</dt><dd>${t('tn.au.type', { m: tn.lines.map((l) => mid(l.mat)).join(' ') })}</dd><dt>${esc(t('tn.au.live'))}</dt><dd>${esc(a.live)}</dd>
      <dt>${esc(t('tn.au.start'))}</dt><dd>${vnd(a.start)} / ${esc(mat(tn.lines[0].mat).uom)} ${esc(t('c.exclVat'))}</dd><dt>${esc(t('tn.au.dec'))}</dt><dd>${num(a.decrement, 1)}% (${vnd(a.start * a.decrement / 100)})</dd>
      <dt>${esc(t('tn.au.extend'))}</dt><dd>${esc(t('tn.au.extendV', { n: a.extend }))}</dd><dt>${esc(t('tn.au.view'))}</dt><dd>${esc(t('tn.au.viewV', { v: tv(a.visibility) }))}</dd></dl>
      <p class="small muted">${esc(t('tn.au.note'))}</p>`, { span: 6 });
  }
  const fxBlock = (tn) => block(t('tn.fx.title'), `<p class="mt-0"><b>${esc(t('tn.fx.body'))}</b> ${esc(tv(tn.fx))}.</p><p class="small muted">${esc(t('tn.fx.note'))}</p>`, { span: 6 });

  /* P3-17: certificate block derived from the Material ID vendor links (follows CERT approvals) */
  function certWarn(tn, b) {
    if (!b.vid) return;
    const blk = tn.lines.map((l) => l.mat).find((m) => (mat(m).vendors || []).some((v) => v[0] === b.vid && v[1] === 'Blocked'));
    if (blk) b.warn = 'Certificate block — ' + blk; else if (b.warn && /block/i.test(b.warn)) delete b.warn;
  }
  const warnText = (w) => { const m = /^Certificate block — (.*)$/.exec(w || ''); return m ? t('tn.certWarn', { m: m[1] }) : tv(w); };
  function invitedBlock(doc, tn) {
    let rows = tn.bidders;
    if (!rows) {
      const ids = vendorsOf(tn);
      rows = doc.status === 'Draft' ? [] : ids.slice(0, Math.max(doc.invited, 0) || ids.length).map((vid, i) => ({ vid, name: App.vendor(vid).name, status: i < doc.bids ? 'Submitted' : 'Invited' }));
    }
    const elig = vendorsOf(tn);
    rows.forEach(certWarn.bind(null, tn));
    return block(t('tn.inv.title', { n: doc.status === 'Draft' ? 0 : rows.length }), doc.status === 'Draft'
      ? App.emptyState(t('tn.inv.not'), t('tn.inv.elig', { n: elig.length, v: elig.map((v) => App.vshort(App.vendor(v))).join(', ') || t('c.none') }), `<button class="btn btn-p btn-sm" data-tn="invite">${esc(t('tn.inv.btn'))}</button>`)
      : `<ul class="plain">${rows.map((b) => `<li class="row-acts between"><span>${b.vid ? `<a href="#/vendors/${esc(b.vid)}"><span class="mono small">${esc(b.vid)}</span> ${esc(vname(b))}</a>` : esc(b.name)}</span><span>${b.warn && /^Certificate block/.test(b.warn) ? pill(t('tn.inv.certBlock'), 'danger') + ' ' : ''}${pill(b.status || 'Submitted', (b.status || 'Submitted') === 'Submitted' ? 'success' : 'neutral')}</span></li>`).join('')}${rows.length < doc.invited ? `<li class="small muted">${esc(t('tn.inv.extra', { n: doc.invited - rows.length }))}</li>` : ''}</ul>`, { span: 6 });
  }

  /* F-41 sealed bids (R-05) */
  function sealedBlock(doc, tn) {
    tn.bidders.forEach(certWarn.bind(null, tn));
    const sub = tn.bidders.filter((b) => b.status === 'Submitted').length; const isClosed = closed(doc);
    return block(t('tn.sb.title', { a: sub, b: tn.bidders.length }), `<div class="alert alert-info" role="status"><b>${esc(t('tn.sb.until', { d: closeAt(doc, tn) }))}</b> ${esc(t('tn.sb.hidden'))}</div>
      ${table([
        { h: t('tn.c.bidder'), r: (b) => `${b.vid ? `<a href="#/vendors/${esc(b.vid)}">${esc(b.name)}</a><div class="small muted mono">${esc(b.vid)}</div>` : esc(b.name)}`, w: 'minmax(200px,2fr)' },
        { h: t('tn.c.rc'), r: (b) => (b.rc ? `<span class="mono">${esc(b.rc)}</span>` : '—'), w: '120px' },
        { h: t('tn.c.submitted'), r: (b) => esc(b.at || '—'), w: '140px' },
        { h: t('c.status'), r: (b) => `${pill(b.status, b.status === 'Submitted' ? 'success' : 'warning')}${b.warn ? `<div class="small muted">${esc(warnText(b.warn))}</div>` : ''}`, w: 'minmax(170px,1.6fr)' },
        { h: t('tn.c.price'), r: () => `<span class="muted">${esc(t('tn.sealedW'))}</span>`, w: '100px' }
      ], tn.bidders, { label: t('tn.sb.label') })}
      <h3 class="h-sub">${esc(t('tn.op.h'))}</h3>
      <p class="small mt-0">${esc(t('tn.op.rule', { a: 'Nguyễn Minh Anh', b: 'Đỗ Hoàng Nam' }))}</p>
      <div class="row-acts start"><button class="btn btn-p btn-sm" ${isClosed ? 'data-tn="open-bids"' : 'disabled'} aria-describedby="tn-open-h">${esc(t('tn.op.btn'))}</button><span class="small muted" id="tn-open-h">${isClosed ? '' : esc(t('tn.op.after', { d: closeAt(doc, tn) }))}</span></div>
      <h3 class="h-sub">${esc(t('tn.op.matrix'))}</h3>${App.emptyState(t('tn.op.locked'), t('tn.op.lockedN', { d: closeAt(doc, tn) }))}`);
  }

  /* F-45 committee & COI (R-10) */
  function committeeBlock(tn) {
    if (!tn.committee) return block(t('tn.com.title'), App.emptyState(t('tn.com.none')), { span: 6 });
    return block(t('tn.com.title'), `<ul class="plain">${tn.committee.map(([n, r, s]) => { const ok = s.startsWith('Signed'); return `<li class="row-acts between"><span><b>${esc(n)}</b><div class="small muted">${esc(tv(r))}</div></span><span>${pill(ok ? t('tn.com.signed', { d: s.slice(7) }) : t('tn.com.not'), ok ? 'success' : 'danger')}${ok ? '' : ` <button class="btn btn-sm" data-tn="remind" data-n="${esc(n)}">${esc(t('tn.com.remind'))}</button>`}</span></li>`; }).join('')}</ul>
      <p class="small muted">${esc(t('tn.com.note'))}</p>`, { span: 6 });
  }

  /* F-44 Q&A + addendum (R-11) */
  function qaBlock(tn) {
    if (!tn.qa) return block(t('tn.qa.title', { n: 0 }), App.emptyState(t('tn.qa.noQa')));
    const f = st.qa; const e = st.qaErr;
    const add = (tn.addenda || []).map((a) => `<div class="alert alert-info mt" role="status"><b>${esc(t('tn.qa.add', { n: a.no, d: a.at }))}</b> <span class="chips chips-inline">${a.lines.map(mid).join('')}</span><div>${esc(tv(a.summary))}</div>
      <div class="small mt-s">${esc(t('tn.qa.acks', { a: a.acks.length, b: (tn.bidders || []).filter((b) => b.vid).length || a.acks.length, list: a.acks.map(([v, at]) => `${App.vendor(v) ? App.vshort(App.vendor(v)) : v} ${at}`).join(' · ') }))}</div></div>`).join('');
    const form = f ? `<form id="tn-qa" class="stack mt" novalidate><div class="form-grid">${S.field('tq', e, 'line', t('tn.qa.line'), f.line, { options: tn.lines.map((l) => [l.mat, l.mat]) })}${S.field('tq', e, 'q', t('tn.qa.q'), f.q, { req: true, area: true })}${S.field('tq', e, 'a', t('tn.qa.a'), f.a, { req: true, area: true })}</div>
      <p class="small muted mt-0">${esc(t('tn.qa.anon'))}</p><div class="row-acts"><button type="button" class="btn btn-sm" data-tn="qa-cancel">${esc(t('c.cancel'))}</button><button type="submit" class="btn btn-sm btn-p">${esc(t('tn.qa.publish'))}</button></div></form>` : '';
    const pend = (tn.questions || []).length ? `<div class="alert alert-warning" role="status"><b>${esc(t('tn.qa.pending', { n: tn.questions.length }))}</b><ul class="plain small">${tn.questions.map((x, i) => `<li class="row-acts between"><span>${mid(x.line)} ${esc(x.q)} <span class="muted">· ${esc(x.at)} · ${esc(t('tn.qa.bidderAnon'))}</span></span><button class="btn btn-sm" data-tn="qa-new" data-pq="${i}">${esc(t('tn.qa.answer'))}</button></li>`).join('')}</ul></div>` : '';
    return block(t('tn.qa.title', { n: tn.qa.length }), pend + `${tn.qa.length ? `<ul class="plain">${tn.qa.map((x) => `<li><span class="small muted">${esc(t('tn.qa.qn', { n: x.no, d: x.at }))}</span> ${mid(x.line)}<div><b>${esc(x.q)}</b></div><div class="small">${esc(t('tn.qa.ans', { a: x.a }))}</div></li>`).join('')}</ul>` : `<p class="muted small mt-0">${esc(t('tn.qa.none'))}</p>`}${add}${form}`,
    { actions: f ? '' : `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('tn.qa.logMsg'))}">${esc(t('tn.qa.log'))}</button><button class="btn btn-sm" data-tn="qa-new">${esc(t('tn.qa.new'))}</button>` });
  }

  /* ---------- Two-envelope evaluation (TND-2026-029) ---------- */
  const techAvg = (b) => b.tech.reduce((a, x) => a + x, 0) / b.tech.length;
  const passed = (tn, b) => techAvg(b) >= (tn.pass || 70);
  const opened = (tn) => tn.bidders.filter((b) => passed(tn, b) && b.prices);
  const compliant = (tn, b) => b.prices && b.sec >= (tn.secAmount || 0) && b.validity >= tn.validity;
  const bidTotal = (tn, b) => tn.lines.reduce((a, l, i) => a + l.qty * b.prices[i], 0);
  const baseline = (l) => mat(l.mat).last || mat(l.mat).avg90;
  function ranking(tn) {
    const C = opened(tn).filter((b) => compliant(tn, b)); const low = Math.min(...C.map((b) => bidTotal(tn, b))); const w = tn.weights || [40, 60];
    return C.map((b) => { const ps = low / bidTotal(tn, b) * 100; return { b, ps, ws: techAvg(b) * w[0] / 100 + ps * w[1] / 100 }; }).sort((x, y) => y.ws - x.ws).map((r, i) => Object.assign(r, { rank: i + 1 }));
  }
  const lowestOn = (tn, i) => { const C = opened(tn).filter((b) => compliant(tn, b)); return C.reduce((a, b) => (!a || b.prices[i] < a.prices[i] ? b : a), null); };
  const hasEval = (tn) => !!(tn.bidders && tn.bidders[0] && tn.bidders[0].tech);

  function openingBlock(tn) {
    const o = tn.opening;
    return block(t('tn.om.title'), `<ul class="plain small"><li>${esc(t('tn.om.tech', { d: o.tech.at, by: o.tech.by.join(' + ') }))}</li>
      <li>${esc(t('tn.om.price', { d: o.price.at, by: o.price.by.join(' + ') }))}</li></ul>
      ${table([
        { h: t('tn.c.bidder'), r: (b) => `${esc(b.name)}<div class="small muted mono">${esc(b.rc)}</div>`, w: 'minmax(200px,2fr)' },
        { h: t('tn.c.totalEx'), r: (b) => (b.prices && passed(tn, b) ? vnd(bidTotal(tn, b)) : `<span class="muted">${esc(t('tn.notOpened'))}</span>`), cls: 'num', w: '170px' },
        { h: t('tn.c.validity'), r: (b) => `${esc(t('tn.daysN', { n: b.validity }))}${b.validity < tn.validity ? ' ' + pill(t('tn.short'), 'danger') : ''}`, w: '120px' },
        { h: t('tn.s.sec'), r: (b) => (b.sec ? vnd(b.sec) : pill(t('tn.missing'), 'danger')), cls: 'num', w: '140px' },
        { h: t('tn.c.submitted'), r: (b) => esc(b.at), w: '140px' }
      ], tn.bidders, { label: t('tn.om.title') })}`, { actions: `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('tn.om.pdf'))}">${esc(t('tn.dlPdf'))}</button>` });
  }
  function techBlock(tn) {
    return block(t('tn.te.title', { p: tn.pass }), table([
      { h: t('tn.c.bidder'), r: (b) => esc(b.name), w: 'minmax(200px,2fr)' },
      ...tn.evaluators.map((n, i) => ({ h: n, r: (b) => num(b.tech[i]), cls: 'num', w: '130px' })),
      { h: t('tn.te.cons'), r: (b) => `<b>${num(techAvg(b), 1)}</b>`, cls: 'num', w: '110px' },
      { h: t('tn.te.result'), r: (b) => pill(passed(tn, b) ? t('tn.pass') : t('tn.fail'), passed(tn, b) ? 'success' : 'danger'), w: '100px' }
    ], tn.bidders, { label: t('tn.te.label') }) + `<p class="small muted">${esc(t('tn.te.note'))}</p>`);
  }
  function matrixBlock(tn) {
    const B = opened(tn); const R = ranking(tn); const rk = (b) => R.find((r) => r.b === b);
    const cols = [
      { h: t('tn.mx.line'), r: (r) => (r.mat ? `${mid(r.mat)}<div class="small">${esc(mat(r.mat).name)}</div><div class="small muted">VAT ${esc(S.vatLabel(mat(r.mat).vat))}</div>` : `<b>${esc(r.label)}</b>`), w: 'minmax(200px,2fr)' },
      { h: t('tn.c.qty'), r: (r) => (r.mat ? `${num(r.qty)} ${esc(mat(r.mat).uom)}` : ''), cls: 'num', w: '90px' },
      { h: t('tn.mx.base'), r: (r) => (r.mat ? `${vnd(baseline(r))}<div class="small muted">${esc(mat(r.mat).lastPo || t('tn.mx.firstAvg'))}</div>` : r.k === 'sub' ? vnd(tn.lines.reduce((a, l) => a + baseline(l) * l.qty, 0)) : ''), cls: 'num', w: '150px' },
      ...B.map((b) => ({ h: vname(b), cls: 'num', w: 'minmax(160px,1.4fr)', r: (r) => {
        const ok = compliant(tn, b); const x = rk(b);
        if (r.mat) { const i = r.i; const lo = lowestOn(tn, i); return `<div class="${lo === b ? 'best' : ''}">${vnd(b.prices[i])}<div class="small muted">${vnd(b.prices[i] * r.qty)}</div>${lo === b ? pill(t('tn.mx.lowest'), 'success') : ''}</div>`; }
        if (r.k === 'sub') return `<b>${vnd(bidTotal(tn, b))}</b>`;
        if (r.k === 'vat') return vnd(tn.lines.reduce((a, l, i) => a + l.qty * b.prices[i] * mat(l.mat).vat / 100, 0));
        if (r.k === 'tot') return vnd(tn.lines.reduce((a, l, i) => a + l.qty * b.prices[i] * (1 + mat(l.mat).vat / 100), 0));
        if (r.k === 'sec') return b.sec >= tn.secAmount ? `${vnd(b.sec)} ${pill('OK', 'success')}` : pill(t('tn.mx.secNon'), 'danger');
        if (r.k === 'score') return ok && x ? `<b>${num(x.ws, 2)}</b><div class="small muted">${num(techAvg(b), 1)} × ${tn.weights[0]}% + ${num(x.ps, 2)} × ${tn.weights[1]}%</div>` : `<span class="muted">${esc(t('tn.mx.excluded'))}</span>`;
        if (r.k === 'rank') return ok && x ? pill(t('tn.mx.rank', { n: x.rank }), x.rank === 1 ? 'success' : 'neutral') : pill(t('tn.mx.non'), 'danger');
        return '';
      } }))
    ];
    const rows = [...tn.lines.map((l, i) => Object.assign({ i }, l)), { label: t('tn.mx.sub'), k: 'sub' }, { label: 'VAT', k: 'vat' }, { label: t('tn.mx.tot'), k: 'tot' }, { label: t('tn.mx.secRow', { v: vnd(tn.secAmount) }), k: 'sec' }, { label: t('tn.mx.score'), k: 'score' }, { label: t('tn.mx.ranking'), k: 'rank' }];
    const fail = tn.bidders.filter((b) => !passed(tn, b));
    return block(t('tn.mx.title'), table(cols, rows, { min: 450 + B.length * 160, label: t('tn.mx.label'), cls: 'mtx' })
      + `<p class="small muted">${esc(t('tn.mx.note', { a: tn.weights[0], b: tn.weights[1], fail: fail.map((b) => b.name).join(', ') || '—' }))}</p>`);
  }

  /* F-48 award recommendation (R-12) */
  function awardBlock(doc, tn) {
    const R = ranking(tn); const C = R.map((r) => r.b);
    if (!st.aw || st.aw.id !== doc.id) st.aw = { id: doc.id, pick: tn.lines.map(() => (R[0] ? R[0].b.vid : '')), why: (tn.award && tn.award.why) || '' };
    const a = st.aw; const award = tn.award;
    const pickB = (i) => C.find((b) => b.vid === (award ? award.pick[i] : a.pick[i]));
    const val = tn.lines.reduce((s, l, i) => s + l.qty * (pickB(i) ? pickB(i).prices[i] : 0), 0);
    const base = tn.lines.reduce((s, l) => s + l.qty * baseline(l), 0); const saving = base - val;
    const notLowest = tn.lines.map((l, i) => pickB(i) && lowestOn(tn, i) !== pickB(i));
    const tbl = table([
      { h: t('c.mid'), r: (l) => mid(l.mat), w: '120px' }, { h: t('tn.c.qty'), r: (l) => `${num(l.qty)} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '90px' },
      { h: t('tn.aw.rec'), r: (l) => { const i = tn.lines.indexOf(l); return award ? esc(vname(pickB(i))) : `<label class="sr" for="aw-${i}">${esc(t('tn.aw.vendorFor', { m: l.mat }))}</label><select class="inp w-full" id="aw-${i}" data-aw="${i}">${C.map((b) => `<option value="${esc(b.vid)}"${a.pick[i] === b.vid ? ' selected' : ''}>${esc(vname(b))}</option>`).join('')}</select>`; }, w: 'minmax(170px,1.6fr)' },
      { h: t('tn.aw.unit'), r: (l) => { const i = tn.lines.indexOf(l); return `${vnd(pickB(i).prices[i])}${notLowest[i] ? `<div>${pill(t('tn.aw.notLowest'), 'warning')}</div>` : ''}`; }, cls: 'num', w: '160px' },
      { h: t('tn.aw.saving'), r: (l) => { const i = tn.lines.indexOf(l); return vnd((baseline(l) - pickB(i).prices[i]) * l.qty); }, cls: 'num', w: '150px' }
    ], tn.lines, { label: t('tn.aw.label') });
    const e = st.awErr;
    const status = award ? (award.status === 'Approved'
      ? `<div class="alert alert-success" role="status"><b>${esc(t('tn.aw.approved', { a: award.approver, d: award.at }))}</b> ${esc(t('tn.aw.approvedN'))}</div>`
      : `<div class="alert alert-warning" role="status"><b>${esc(t('tn.aw.pending', { a: award.approver }))}</b> ${esc(t('tn.aw.pendingN', { d: award.submitted }))}</div>`) : '';
    const notices = award && award.status === 'Approved' ? `<h3 class="h-sub">${esc(t('tn.aw.notices'))}</h3>${table([
      { h: t('tn.c.bidder'), r: (b) => esc(b.name), w: 'minmax(200px,2fr)' },
      { h: t('tn.te.result'), r: (b) => { const won = award.pick.includes(b.vid); const r = R.find((x) => x.b === b); return won ? pill(t('tn.aw.awarded'), 'success') : pill(`${t('tn.aw.unsucc')} · ${r ? t('tn.aw.rankN', { n: r.rank }) : !passed(tn, b) ? t('tn.aw.techFail') : t('tn.aw.nonc')}`, 'neutral'); }, w: 'minmax(170px,1.5fr)' },
      { h: t('tn.aw.channel'), r: () => esc(t('tn.aw.gmailPortal')), w: '130px' },
      { h: t('tn.s.sec'), r: (b) => (b.sec ? esc(award.pick.includes(b.vid) ? t('tn.aw.held') : t('tn.aw.release', { d: App.addDays(award.at.slice(0, 10), 14) })) : '—'), w: 'minmax(160px,1.4fr)' }
    ], tn.bidders, { label: t('tn.aw.notices') })}` : '';
    // One primary per block: before approval the submit button is primary and the PO/contract buttons are quiet + disabled
    const poBtn = award && award.status === 'Approved' ? `<a class="btn" href="#/contracts/new">${esc(t('tn.createCt'))}</a><a class="btn btn-p" href="#/po?tender=${esc(doc.id)}">${esc(t('tn.createPo'))}</a>`
      : `<span class="small muted grow" id="aw-po-h">${esc(t('tn.aw.afterApproval'))}</span><button type="button" class="btn" disabled aria-describedby="aw-po-h">${esc(t('tn.createCt'))}</button><button type="button" class="btn" disabled aria-describedby="aw-po-h">${esc(t('tn.createPo'))}</button>`;
    return block(t('tn.aw.title'), `${status}${tbl}
      <dl class="dl mt"><dt>${esc(t('tn.aw.value'))}</dt><dd><b>${vnd(val)}</b> ${esc(t('c.exclVat'))}</dd><dt>${esc(t('tn.aw.baseline'))}</dt><dd>${esc(t('tn.aw.baselineV', { v: vnd(base) }))}</dd><dt>${esc(t('tn.aw.savingL'))}</dt><dd><b>${vnd(saving)}</b> ${esc(t('tn.aw.savingV', { p: pct(saving / base * 100) }))}</dd>
        <dt>${esc(t('tn.aw.route'))}</dt><dd>${esc(t('tn.aw.routeV'))}</dd></dl>
      ${award ? (award.why ? `<p class="small"><b>${esc(t('tn.aw.just'))}:</b> ${esc(award.why)}</p>` : '') : `<form id="tn-aw" class="stack mt" novalidate>${S.field('aw', e, 'why', notLowest.some(Boolean) ? t('tn.aw.justReq') : t('tn.aw.just'), a.why, { area: true, req: notLowest.some(Boolean) })}
        <div class="row-acts">${poBtn}<button type="submit" class="btn btn-p">${esc(t('tn.aw.submit'))}</button></div></form>`}
      ${notices}${award ? `<div class="row-acts mt">${poBtn}</div>` : ''}`);
  }
  function submitAward(root, doc, tn) {
    const a = st.aw; a.why = ((root.querySelector('#aw-why') || {}).value || '').trim();
    const R = ranking(tn); const C = R.map((r) => r.b);
    const notLowest = tn.lines.some((l, i) => lowestOn(tn, i) !== C.find((b) => b.vid === a.pick[i]));
    st.awErr = {}; if (notLowest && a.why.length < 20) st.awErr.why = 'tn.aw.e.why';
    if (Object.keys(st.awErr).length) { App.render(); S.focusErr('#tn-aw'); return; }
    const val = tn.lines.reduce((s, l, i) => s + l.qty * C.find((b) => b.vid === a.pick[i]).prices[i], 0);
    tn.award = { status: 'Pending', pick: a.pick.slice(), why: a.why, approver: 'Đỗ Hoàng Nam', submitted: D().today + ' 10:30', value: val };
    doc.status = 'Award pending';
    D().approvals.push({ id: doc.id, type: 'Award recommendation', title: `${doc.title} · ${[...new Set(a.pick)].map((v) => App.vshort(App.vendor(v))).join(', ')}`, mats: doc.mats, value: val, by: S.me(), step: 'Step 1 of 1', sla: '04/11/2026 17:00', assignee: 'Đỗ Hoàng Nam', note: 'SoD: evaluator ≠ award approver' });
    D().approvalChains[doc.id] = [[`${S.me()} · Chair`, 'Submitted', D().today + ' 10:30', a.why], ['Đỗ Hoàng Nam · Finance Director', 'Waiting', 'SLA ends 04/11/2026 17:00', '']];
    App.render(); App.toast(t('tn.aw.sent', { id: doc.id }));
  }

  const DSUBS = [['', 'tn.d.overview'], ['bids', 'tn.d.bids'], ['evaluation', 'tn.d.eval'], ['award', 'tn.d.award'], ['qa', 'tn.d.qa'], ['files', 'tn.d.files'], ['settings', 'tn.d.settings']];
  function detail(doc, subArg) {
    const tn = det(doc.id);
    if (!tn) return layout({ title: t('nav.tenders'), blocks: [block(null, App.errorState(t('tn.noDetail', { id: doc.id })) + back())] });
    const cur = App.sub(DSUBS, subArg || '');
    const step = doc.status === 'Awarded' ? 6 : (STEP_OF[doc.status] != null ? STEP_OF[doc.status] : tn.step);
    const alerts = vat8Flag(tn) ? `<div class="alert alert-warning" role="status"><b>${esc(t('tn.a.vat8'))}</b> ${esc(t('tn.a.vat8n', { d: tn.delivery }))}</div>` : '';
    const dc = App.daysTo(doc.close);
    const kpis = [kpi(t('tn.k.est'), ty(estTotal(tn)), esc(t('tn.k.estN'))), kpi(t('tn.k.bids'), `${doc.bids} / ${doc.invited}`, esc(doc.sealed ? t('tn.sealedW') : t('tn.k.recv'))),
      kpi(t('tn.k.closes'), esc(doc.close), esc(dc >= 0 ? t('tn.k.closesN', { n: dc, t: tn.closeTime || '17:00' }) : t('tn.k.closed')), dc >= 0 && dc <= 3 ? 'warning' : ''),
      kpi(t('tn.k.sec'), tn.secPct ? vnd(tn.secAmount || Math.round(estTotal(tn) * tn.secPct / 100)) : '—', esc(tn.secPct ? t('tn.k.secN', { p: num(tn.secPct, 1) }) : t('tn.k.notReq')))];
    let blocks;
    if (cur === 'bids') blocks = hasEval(tn) ? [openingBlock(tn)] : tn.bidders && doc.sealed ? [sealedBlock(doc, tn)] : [invitedBlock(doc, tn), committeeBlock(tn)];
    else if (cur === 'evaluation') blocks = hasEval(tn) ? [techBlock(tn), matrixBlock(tn)] : [block(t('tn.d.eval'), App.emptyState(t('tn.ev.none'), t('tn.ev.noneN')), { span: 6 }), committeeBlock(tn)];
    else if (cur === 'award') {
      blocks = [hasEval(tn) ? awardBlock(doc, tn) : tn.award && tn.award.status === 'Approved'
        ? block(t('tn.aw.simple'), `<dl class="dl"><dt>${esc(t('tn.aw.to'))}</dt><dd><a href="#/vendors/${esc(tn.award.vendor)}">${esc(App.vendor(tn.award.vendor).name)}</a></dd><dt>${esc(t('c.value'))}</dt><dd>${esc(t('tn.aw.exVat', { v: vnd(tn.award.value) }))}</dd></dl><div class="row-acts"><a class="btn btn-p" href="#/po?tender=${esc(doc.id)}">${esc(t('tn.createPo'))}</a></div>`)
        : block(t('tn.aw.simple'), App.emptyState(t('tn.aw.none'), t('tn.aw.noneN')))];
    } else if (cur === 'qa') blocks = [qaBlock(tn)];
    else if (cur === 'files') { tn.files = tn.files || []; blocks = [S.files('tnf', tn.files, tn.lines.map((l) => l.mat), st.up, ['Specification / drawing', 'BOQ', 'Addendum', 'Bid opening minutes', 'Other'], { block: true })]; }
    else if (cur === 'settings') {
      const extra = [tn.auction ? auctionBlock(tn) : null, tn.fx ? fxBlock(tn) : null].filter(Boolean);
      blocks = [settingsBlock(doc, tn)].concat(extra.length ? extra : [committeeBlock(tn)]);
    } else blocks = [linesBlock(doc, tn, step), hasEval(tn) || doc.sealed ? null : invitedBlock(doc, tn), hasEval(tn) || doc.sealed ? null : committeeBlock(tn)];
    return layout({
      crumbs: `<a href="#/tenders">${esc(t('nav.tenders'))}</a> / ${esc(doc.id)}`, titleHtml: `<span class="mono">${esc(doc.id)}</span> ${esc(doc.title)}`,
      subtitle: `${esc(tv(tn.method))} · ${esc(catName(doc.cat))} · ${esc(t('tn.closesAt', { d: closeAt(doc, tn) }))} · ${pill(doc.status, tones[doc.status] || 'neutral')}`,
      actions: `${/^(Open|Q&A)$/.test(doc.status) && App.daysTo(doc.close) >= 0 ? `<button class="btn" data-act="toast" data-msg="${esc(t('tn.remindMsg'))}">${esc(t('tn.remind'))}</button>` : doc.status === 'Awarded' || (tn.award && tn.award.status === 'Approved') ? `<a class="btn" href="#/po?tender=${esc(doc.id)}">${esc(t('tn.createPo'))}</a>` : /Evaluation|Closed/.test(doc.status) || App.daysTo(doc.close) < 0 ? `<a class="btn" href="#/tenders/${esc(doc.id)}/award">${esc(t('tn.d.award'))}</a>` : ''}${doc.status === 'Draft' ? `<button class="btn btn-p" data-tn="invite">${esc(t('tn.invite'))}</button>` : ''}`,
      alerts: App.unknownSub(DSUBS, subArg) + alerts, kpis, subnav: App.subnav('tenders/' + doc.id, DSUBS, cur), blocks
    });
  }

  const LSUBS = [['', 'tn.sub.list'], ['new', 'tn.sub.new']];
  App.page('tenders', {
    titleKey: 'nav.tenders', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, subArg) {
      const parts = (subArg || '').split('/'); const head = parts[0] || '';
      const isList = !head || head === 'new';
      const key = isList ? head || 'list' : head;
      if (st.cur !== key) { st.cur = key; st.set = null; st.serr = {}; st.up = null; st.aw = null; st.awErr = {}; st.qa = null; st.qaErr = {}; if (key !== 'new') st.nf = null; }
      if (!isList) { const d = list().find((x) => x.id === head); return d ? detail(d, parts.slice(1).join('/')) : layout({ title: t('nav.tenders'), blocks: [block(null, App.errorState(t('tn.notFound', { id: head })) + back())] }); }
      if (p.q != null && p.q !== st.lastQ) { st.q = p.q; st.lastQ = p.q; st.tab = 'all'; }
      const all = list(); const inTab = (d, k) => k === 'all' || d.status === k || (k === 'Evaluation' && d.status === 'Award pending'); const cnt = (k) => all.filter((d) => inTab(d, k)).length;
      const closing = all.filter((d) => ['Open', 'Q&A'].includes(d.status) && App.daysTo(d.close) >= 0 && App.daysTo(d.close) <= 7);
      const evals = all.filter((d) => inTab(d, 'Evaluation')).map((d) => `${d.id.slice(4)} ${d.status === 'Award pending' ? t('tn.k.awPending') : d.note ? tv(d.note) : ''}`).join(' · ');
      const qs = head === 'new' && (p.pr || p.mat) ? (p.pr ? 'pr=' + encodeURIComponent(p.pr) : 'mat=' + encodeURIComponent(p.mat)) : '';
      return layout({
        title: t('nav.tenders'), subtitle: esc(t('tn.subtitle')),
        actions: head === 'new' ? '' : `<a class="btn btn-p" href="#/tenders/new">${esc(t('tn.new'))}</a>`,
        kpis: [kpi(t('tn.k.active'), num(D().kpi.activeTenders), esc(t('c.inSample', { n: all.filter((d) => !['Awarded', 'Draft'].includes(d.status)).length }))), kpi(t('tn.k.closing'), String(closing.length), esc(closing.map((d) => d.id.slice(4)).join(', ') || t('c.none')), closing.length ? 'warning' : ''),
          kpi(t('tn.k.eval'), String(cnt('Evaluation')), esc(evals || t('c.none'))), kpi(t('tn.k.awarded'), String(cnt('Awarded')), esc(t('tn.k.sample2026')))],
        subnav: App.subnav('tenders', LSUBS, head, qs),
        blocks: [head === 'new' ? newBlock(p) : listBlock(all, inTab, cnt)]
      });
    },
    mount(root) {
      root.addEventListener('input', (e) => {
        if (e.target.dataset.tnf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('tn-q'); i.focus(); i.setSelectionRange(pos, pos); }
      });
      root.addEventListener('mousedown', (e) => { if (e.target.closest('button[type=submit]')) st.hold = true; });
      root.addEventListener('change', (e) => {
        if (e.target.dataset.tnf === 'method') { st.method = e.target.value; App.render(); }
        if (e.target.closest('#tn-new') && ['pr', 'secPct', 'delivery', 'qty'].includes(e.target.name)) { Object.assign(st.nf, S.read(root, '#tn-new')); if (st.hold) { st.hold = false; return; } const id = e.target.id; App.render(); const x = document.getElementById(id); x && x.focus(); }
        if (e.target.dataset.aw != null) { st.aw.pick[+e.target.dataset.aw] = e.target.value; st.aw.why = (root.querySelector('#aw-why') || {}).value || st.aw.why; const id = e.target.id; App.render(); const x = document.getElementById(id); x && x.focus(); }
      });
      root.addEventListener('submit', (e) => {
        const id = e.target.id; if (!['tn-new', 'tn-set', 'tn-aw', 'tn-qa', 'tnf-up'].includes(id)) return; e.preventDefault(); st.hold = false;
        const doc = list().find((x) => x.id === st.cur); const tn = doc && det(doc.id);
        if (id === 'tn-new') saveNew(root);
        else if (id === 'tn-set') saveSettings(root, tn);
        else if (id === 'tn-aw') submitAward(root, doc, tn);
        else if (id === 'tnf-up') { st.up = S.upload(root, 'tnf', tn.files); App.render(); }
        else if (id === 'tn-qa') {
          const f = Object.assign(st.qa, S.read(root, '#tn-qa')); st.qaErr = {};
          if (f.q.length < 10) st.qaErr.q = 'tn.qa.e.q'; if (f.a.length < 10) st.qaErr.a = 'tn.qa.e.a';
          if (Object.keys(st.qaErr).length) { App.render(); S.focusErr('#tn-qa'); return; }
          tn.qa.push({ no: tn.qa.length + 1, line: f.line, q: f.q, a: f.a, at: D().today + ' 10:30' }); if (f.pq != null && tn.questions) tn.questions.splice(f.pq, 1); st.qa = null; App.render(); App.toast(t('tn.qa.published', { n: doc.invited }));
        }
      });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-tn], [data-files]'); if (!b) return;
        const doc = list().find((x) => x.id === st.cur); const tn = doc && det(doc.id);
        if (b.dataset.files === 'open') { st.up = { errs: {} }; App.render(); const x = document.getElementById('tnf-up-name'); x && x.focus(); return; }
        if (b.dataset.files === 'cancel') { st.up = null; App.render(); return; }
        const a = b.dataset.tn;
        if (a === 'tab') { st.tab = b.dataset.k; App.render(); }
        else if (a === 'set-edit') { st.set = { envelopes: tn.envelopes, secPct: String(tn.secPct).replace('.', ','), validity: String(tn.validity), currency: tn.currency === 'VND or USD' ? 'VND or USD' : 'VND', wt: String((tn.weights || [40, 60])[0]), wp: String((tn.weights || [40, 60])[1]) }; st.serr = {}; App.render(); document.getElementById('ts-envelopes').focus(); }
        else if (a === 'set-cancel') { st.set = null; App.render(); }
        else if (a === 'qa-new') { const pq = b.dataset.pq != null && (tn.questions || [])[+b.dataset.pq]; st.qa = pq ? { line: pq.line, q: pq.q, a: '', pq: +b.dataset.pq } : { line: tn.lines[0].mat, q: '', a: '' }; st.qaErr = {}; App.render(); document.getElementById('tq-q').focus(); }
        else if (a === 'qa-cancel') { st.qa = null; App.render(); }
        else if (a === 'remind') App.toast(t('tn.com.reminded', { n: b.dataset.n }));
        else if (a === 'open-bids') App.toast(t('tn.op.needTwo'));
        else if (a === 'invite') {
          const ids = vendorsOf(tn);
          if (!ids.length) { App.toast(t('tn.noApproved')); return; }
          doc.status = 'Open'; doc.invited = ids.length; tn.step = 3; App.render(); App.toast(t('tn.invited', { n: ids.length }));
        }
      });
    }
  });
})();
