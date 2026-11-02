# ProcureLink — Danh mục tính năng (feature inventory)

Phạm vi: 17 màn hình prototype (`Login`, `Main`, `Material360`, `MaterialMaster`, `Vendors`, `VendorEvaluation`, `PriceHistory`, `Contracts`, `Certificates`, `Tenders`, `PurchaseRequest`, `PurchaseOrders`, `Invoices`, `Approvals`, `Reports`, `SupplierPortal`, `Admin`). Chỉ liệt kê tính năng **thực sự hiển thị** trên màn hình. Mã yêu cầu (R-01…R-25, theo `requirements.md`) ghi trong ngoặc ở cuối cột Mô tả.

Vai trò: **Procurement** (Procurement Lead, buyer, người nhận hàng/QC) · **Supplier** (người dùng cổng NCC) · **Admin** (System Admin) · **Finance approver** (Finance Director, kế toán phải trả, người phê duyệt).

## Tóm tắt

| Module | Mã | Số tính năng |
|---|---|---|
| 1. Đăng nhập & phân quyền | F-01 – F-04 | 4 |
| 2. Dashboard & thông báo | F-05 – F-09 | 5 |
| 3. Material ID | F-10 – F-19 | 10 |
| 4. Nhà cung cấp | F-20 – F-26 | 7 |
| 5. Đánh giá NCC | F-27 – F-29 | 3 |
| 6. Hợp đồng | F-30 – F-35 | 6 |
| 7. Chứng chỉ | F-36 – F-39 | 4 |
| 8. Đấu thầu | F-40 – F-49 | 10 |
| 9. PR | F-50 – F-55 | 6 |
| 10. Phê duyệt | F-56 – F-60 | 5 |
| 11. PO & nhận hàng | F-61 – F-69 | 9 |
| 12. Hóa đơn & 3-way match | F-70 – F-75 | 6 |
| 13. Lịch sử giá | F-76 – F-80 | 5 |
| 14. Báo cáo | F-81 – F-86 | 6 |
| 15. Cổng NCC | F-87 – F-98 | 12 |
| 16. Admin | F-99 – F-108 | 10 |
| **Tổng** | | **108** |

---

## 1. Đăng nhập & phân quyền

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-01 | Đăng nhập bằng Gmail | Người dùng bấm "Continue with Gmail" để đăng nhập; chỉ tài khoản Gmail đã được Admin cấp quyền (allowlist) mới vào được. | Procurement, Supplier, Admin, Finance approver | Login | — |
| F-02 | Định tuyến theo vai trò & đổi workspace | Màn hình giới thiệu 3 vai trò Procurement / Supplier / Admin do Admin gán; sau đăng nhập người dùng vào đúng workspace (Main, SupplierPortal, Admin) và có nút "Switch workspace" ở sidebar. | Procurement, Supplier, Admin, Finance approver | Login, Main, SupplierPortal, Admin | — |
| F-03 | Chấp nhận lời mời NCC | NCC được mời qua email bấm "Accept invitation & sign in" để kích hoạt tài khoản và vào thẳng cổng NCC. (R-08) | Supplier | Login | — |
| F-04 | Thông báo dữ liệu cá nhân & đồng ý | Dòng đồng ý xử lý tên và Gmail theo Luật BVDLCN 91/2025/QH15 kèm popover "Privacy notice v2.1" (dữ liệu lưu giữ, mục đích) và liên kết Privacy / Terms / Help. (R-25) | Procurement, Supplier, Admin, Finance approver | Login | — |

## 2. Dashboard & thông báo

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-05 | KPI, bộ lọc & biểu đồ dashboard | Xem 5 thẻ KPI (Spend YTD 186,4 tỷ ₫, Saving YTD 9,7 tỷ ₫ = 5,2% so với mục tiêu 4%, OTIF 90 ngày 91,4% so với mục tiêu 95%, 38 PR mở, 7 tender đang chạy), biểu đồ OTIF 12 tháng, chi tiêu theo danh mục, lọc Period/Category, "Export report" và "New PR". | Procurement, Finance approver | Main | — |
| F-06 | Action required & chuông thông báo | Chuông "6 unread" và danh sách "Action required" (PR approval, PO overdue, Invoice exception, Evaluation, Tender) có trạng thái Unread/Read, lọc theo loại và nút hành động (Review, Follow up, Resolve, Open, Evaluate) dẫn tới màn hình xử lý. (R-15) | Procurement, Finance approver | Main | — |
| F-07 | Tender sắp đóng | Bảng tender sắp đóng thầu với danh mục, ngày đóng, số bid nhận/được mời (vd. 4 / 5) và trạng thái Open / Q&A. | Procurement | Main | — |
| F-08 | Cảnh báo giá theo Material ID | Bảng Material ID có giá giao dịch cuối lệch so với trung bình 90 ngày vượt ngưỡng ±5%, kèm NCC cuối và chứng từ nguồn, liên kết "Open price history". | Procurement | Main | Khóa chính của cảnh báo là Material ID (LOG-61012 +8,9%, CON-24015 −5,3%) |
| F-09 | Khung ứng dụng: tìm kiếm, menu, ngôn ngữ | Tìm kiếm toàn cục (Material ID, PR, PO, tender, vendor; phím tắt "/"), sidebar nhóm Overview / Vendors / Sourcing / Insights / Admin console, badge "6 waiting" ở My approvals và chuyển EN/VI. | Procurement, Finance approver, Admin | Tất cả màn hình nội bộ | Tìm kiếm theo Material ID |

## 3. Material ID

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-10 | Danh sách Material ID | Xem 1.284 Material ID (1.236 active, 9 pending approval, 37 single-source), tìm theo ID / mô tả VN-EN / HS code, lọc category, material group, status, VAT rate, "Single source only", xem VAT, giá cuối, số NCC được duyệt, hợp đồng; Import Excel / Export. (R-03, R-16) | Procurement | MaterialMaster | Màn hình gốc quản lý Material ID |
| F-11 | Quy tắc đánh số & change log | Hiển thị định dạng CAT-NNNNN, dải số theo danh mục (CON 24000–29999, EQP 31000–39999, SRV 52000–59999, LOG 61000–69999), số kế tiếp; số được giữ khi submit, cấp khi duyệt, không tái sử dụng; kèm nhật ký thay đổi 7 ngày. | Procurement, Admin | MaterialMaster | Sinh mã Material ID |
| F-12 | Yêu cầu tạo Material ID mới | Panel "New Material ID request" với ID tự sinh (CON-24331), category, group, mô tả VN/EN, base UoM + quy đổi, thuộc tính spec sửa được, HS code, lead time, MOQ, đính kèm có loại/phiên bản; Save draft / Submit for approval. (R-19) | Procurement | MaterialMaster | Tạo bản ghi Material ID |
| F-13 | Chứng chỉ bắt buộc theo Material ID | Khai báo chứng chỉ bắt buộc và thời điểm kiểm tra: CO/CQ theo từng lô tại GRN, Hợp quy QCVN 7:2019 còn hiệu lực tại ngày PO, ISO 9001 tại ngày tender và PO; liên kết Certificate register. | Procurement | MaterialMaster | Chứng chỉ gắn với Material ID, dùng để chặn NCC |
| F-14 | VAT mặc định & giảm 8% | Chọn VAT mặc định 0 / 5 / 8 / 10% / KCT, "Eligible for 8% reduction" Yes/No theo NQ 204/2025 (8% tới 31/12/2026, sản phẩm kim loại bị loại trừ) và trạng thái "Confirmed by Finance". (R-03) | Procurement, Finance approver | MaterialMaster, Material360 | VAT là thuộc tính của Material ID, mọi dòng PR/bid/PO/hóa đơn kế thừa |
| F-15 | Kiểm tra trùng lặp | Cảnh báo "Possible duplicate · same group, diameter and UoM" (CON-24015, 92% match) và cho người yêu cầu ghi lý do không trùng (khác grade CB500-V/CB400-V). | Procurement | MaterialMaster | So khớp với Material ID hiện có |
| F-16 | Quy trình phê duyệt Material ID | Luồng 3 bước Requester → Material master owner (kiểm tra trùng, spec, VAT, chứng chỉ) → Admin cấp mã sau khi Finance xác nhận VAT; ghi chú SoD người yêu cầu không được tự duyệt. (R-18) | Procurement, Admin, Finance approver | MaterialMaster, Approvals | Cấp mã khi duyệt |
| F-17 | Material 360°: hồ sơ & liên kết | Trang tổng hợp một Material ID: header (spec, trạng thái), nút Price history / Start tender / Create PR, 10 ô "Linked by Material ID" (NCC, tender, PR, PO, hợp đồng, chứng chỉ, hóa đơn, bản ghi giá, OTIF, saving) và panel Master data có Edit. | Procurement | Material360 | Mọi module đọc/ghi theo Material ID |
| F-18 | NCC được duyệt & rủi ro nguồn cung | Danh sách 4 NCC được duyệt cho Material ID (Preferred/Approved/Probation, điểm, giá cuối, lead time, OTIF), cảnh báo "Not single source · 3 eligible" và NCC bị chặn do ISO 9001 hết hạn. (R-16) | Procurement | Material360 | Rủi ro single-source tính theo Material ID |
| F-19 | Chuỗi mua, giá & tài liệu liên kết | Xem chuỗi PR → Tender → PO → Delivery, khung saving (15.200.000 so với baseline 16.450.000 → 100.000.000 ₫ / 80 tấn), biểu đồ đơn giá bình quân 12 tháng và bảng tài liệu liên kết (Attachment, Tender, PO, PR, NCR). (R-07, R-19) | Procurement | Material360 | Mọi chứng từ được lọc theo Material ID |

## 4. Nhà cung cấp

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-20 | Danh sách NCC | Xem 142 NCC (118 active, 6 pending approval), tìm theo tên / MST / Gmail / Material ID, lọc category, status, score, xem Material IDs supplied, điểm, OTIF, trạng thái; nút Edit/Delete từng dòng, "New vendor", "Import Excel". | Procurement | Vendors | Tìm NCC theo Material ID cung cấp |
| F-21 | Chỉ số rủi ro NCC | Cột Risk Low/Medium/High/Pending kèm lý do (single source, chứng chỉ hết hạn, OTIF < 85%), "Risk last checked 02/11/2026" và nút "Re-check risk". (R-16) | Procurement | Vendors | Single source tính trên Material ID |
| F-22 | Tạo / sửa hồ sơ NCC | Drawer "Edit vendor" với tên công ty, MST, điều khoản thanh toán (30/45 ngày, ứng 30% · 70%), danh mục, người liên hệ, điện thoại, Portal Gmail (dùng đăng nhập cổng và nhận mời thầu); Save changes / Cancel. (R-04) | Procurement | Vendors | — |
| F-23 | Kiểm tra MST | Kiểm tra định dạng (10 số, 10+3 cho chi nhánh dưới NCC mẹ, 12 số CCCD), tra cứu cơ quan thuế (Đang hoạt động, tên đăng ký khớp), "Re-check MST" và chặn Save khi trùng ("MST 0312456789 already belongs to V-1003"). (R-04) | Procurement | Vendors | NCC chưa xác minh MST không được duyệt cho Material ID |
| F-24 | Đổi tài khoản ngân hàng chờ Finance | Hiển thị tài khoản đang dùng và tài khoản mới gửi từ cổng NCC ở trạng thái "Pending Finance verification" cho tới khi gọi lại xác minh, liên kết sang My approvals. (R-08) | Procurement, Finance approver | Vendors | — |
| F-25 | Material ID cung cấp | Danh sách Material ID NCC cung cấp (6 mã), thêm mã mới (vd. EQP-31520) hoặc gỡ mã. | Procurement | Vendors | Tạo/gỡ liên kết NCC – Material ID |
| F-26 | Trạng thái & xóa NCC | Đặt Active / Probation / Blocked; nút Delete bị khóa khi NCC còn PO mở (PO-2026-0869) và gợi ý chuyển Blocked. | Procurement | Vendors | — |

## 5. Đánh giá NCC

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-27 | Mẫu tiêu chí & ngưỡng xếp hạng | Chọn template theo danh mục, thêm/đổi tên/đổi trọng số/xóa tiêu chí với nguồn dữ liệu Auto (NCR rate & accepted qty, PO deliveries, price by Material ID, tender response time) hoặc Manual, tổng trọng số phải 100%, ngưỡng A ≥ 4,20 · B 3,50–4,19 · C 3,00–3,49 · D < 3,00; Duplicate / Save template. (R-07) | Procurement, Admin | VendorEvaluation | Tiêu chí giá lấy từ giá theo Material ID |
| F-28 | Scorecard NCC | Chấm điểm NCC theo kỳ (V-1001 4,32/5, +0,08 so với Q2, hạng A): mỗi tiêu chí có trọng số, căn cứ, điểm, điểm quy đổi = điểm × trọng số, nhận xét người đánh giá; Save draft / Submit scorecard. | Procurement | VendorEvaluation | Căn cứ "18 POs · 5 Material IDs" |
| F-29 | Kỳ đánh giá & tiến độ | Chọn kỳ (Q3/Q2/Q1-2026), "Start new period", chuyển view Scorecards / Criteria templates / History và theo dõi tiến độ (3 submitted, 2 draft, 2 not started) với nút View / Continue / Evaluate. | Procurement | VendorEvaluation | — |

## 6. Hợp đồng

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-30 | Danh sách & KPI hợp đồng | Xem KPI (12/17 active, 48,6 tỷ ₫, 2 HĐ hết hạn ≤ 60 ngày, tiêu thụ TB 58%), tìm theo số HĐ / NCC / Material ID, lọc loại (Framework, Fixed price, Service SLA, Rate card), trạng thái, owner, banner mua ngoài HĐ (PO-2026-0861 +6,4% sau khi CT-2025-007 hết hạn); New contract / Export. (R-17) | Procurement | Contracts | Cột Material IDs; phát hiện mua ngoài HĐ theo Material ID |
| F-31 | Chi tiết HĐ & hành động | Header CT-2026-008 (Framework, Expiring, E-signed v3, trần 19,5 tỷ ₫, VAT 10%) với nút Amend (Phụ lục), Renew, "Release PO from contract", nhắc gia hạn 60 ngày trước hạn và dự báo 860 tấn so với mức tối thiểu 960 tấn. | Procurement | Contracts | — |
| F-32 | Giá theo Material ID & điều chỉnh giá | Bảng giá từng Material ID theo quý (Q3 so với Q4), điều khoản điều chỉnh theo chỉ số giá thép tối đa ±5% mỗi kỳ (index −6,8% → áp −5,0% bằng Phụ lục 01) và quy tắc giá PO không vượt giá HĐ hiện hành. | Procurement | Contracts | Giá HĐ khai báo theo dòng Material ID |
| F-33 | Cam kết khối lượng & PO đã phát hành | Thanh tiêu thụ 640 / 1.200 tấn (53%, tối thiểu 960 tấn = 80%) chia theo Material ID, giá trị đã phát hành 10,31 tỷ ₫ / 11 PO và danh sách PO phát hành theo HĐ. | Procurement | Contracts | Tiêu thụ tính riêng từng Material ID |
| F-34 | Điều khoản & bảo đảm thực hiện HĐ | Xem điều khoản chính (thanh toán 30 ngày, phạt chậm 0,1%/ngày tối đa 8%, bảo hành thay lô lỗi 7 ngày, DAP) và bảo lãnh thực hiện 975.000.000 ₫ = 5% (khung 2–10%), hiệu lực, cảnh báo 30 ngày trước hết hạn. (R-09) | Procurement | Contracts | — |
| F-35 | Ký điện tử & tài liệu phiên bản | Trạng thái ký điện tử (ký ở công cụ ngoài, ProcureLink lưu trạng thái và file), danh sách tài liệu có loại, phiên bản, nhãn Signed / Uploaded by supplier, chip Material ID và nút Upload. (R-19) | Procurement, Supplier | Contracts | Tài liệu được gắn Material ID |

## 7. Chứng chỉ

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-36 | Sổ đăng ký chứng chỉ | Xem KPI (Valid 214, Expiring ≤ 30 ngày 3, Expired 4, Pending review 5), tìm theo số / NCC / Material ID, lọc loại, holder, trạng thái, "Mandatory only", xem phạm vi, cơ quan cấp, hạn, người xác minh; Upload certificate / Export. | Procurement | Certificates | Phạm vi chứng chỉ gắn Material ID |
| F-37 | Duyệt chứng chỉ NCC tải lên | Panel "Review upload" có PDF preview, trường trích xuất sửa được, checklist (tên holder khớp, phạm vi phủ Material ID, hạn sau hôm nay, kiểm tra tổ chức công nhận, ghi nhận khoảng trống), lý do bắt buộc khi Reject, comment gửi NCC và "Approve & unblock". | Procurement | Certificates | Kiểm tra phạm vi phủ Material ID; duyệt gỡ chặn CON-24015 |
| F-38 | Chặn NCC khi chứng chỉ bắt buộc hết hạn | Quy tắc hiển thị: chứng chỉ bắt buộc hết hạn thì NCC bị chặn PO mới và trao thầu cho Material ID liên quan, bid trên dòng đó bị đánh Non-compliant khi mở thầu, PO đang mở vẫn tiếp tục (vd. Bắc Sơn – CON-24015). | Procurement | Certificates, Material360, Tenders | Chặn theo cặp NCC – Material ID |
| F-39 | Dòng thời gian hết hạn 90 ngày | Biểu đồ chứng chỉ sắp hết hạn trong 90 ngày với số ngày còn lại, tô cam khi ≤ 30 ngày, nhắc NCC và owner ở mốc 60 và 30 ngày. (R-15) | Procurement | Certificates | Chip Material ID trên từng chứng chỉ |

## 8. Đấu thầu

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-40 | Danh sách tender | Tab danh mục có số đếm, tìm theo ID / tiêu đề / Material ID / bidder, lọc phương thức (RFQ, Sealed bid, Two-envelope, e-Auction) và trạng thái, cờ "8% reduction ends 31/12/2026" cho gói giao sau năm 2026; New tender / Export Excel. (R-03) | Procurement | Tenders | Mỗi tender liệt kê các dòng Material ID |
| F-41 | Niêm phong hồ sơ dự thầu | TND-2026-031 "Sealed · 4 of 5 bids" chỉ hiện tên bidder, số biên nhận, giờ nộp, trạng thái, không hiện giá; ma trận so sánh bị khóa tới giờ đóng thầu. (R-05) | Procurement | Tenders | Bid lưu theo dòng Material ID |
| F-42 | Tiến trình, cấu hình & tài liệu tender | Thanh tiến trình 7 bước (Draft → Invited → Q&A → Bidding → Bid opening → Evaluation → Award), bảng cấu hình (Two envelopes, bid security, trọng số kỹ thuật 40% / giá 60%, Price score = lowest total ÷ bidder total × 100, hiệu lực 90 ngày, tiền tệ, visibility) và đính kèm có loại/phiên bản. (R-09, R-10, R-19) | Procurement | Tenders | Đính kèm gắn Material ID |
| F-43 | Mở thầu hai người & biên bản | Biên bản mở thầu ghi 2 thành viên có tên và COI đã ký, giờ mở phong bì kỹ thuật (5 phút sau đóng thầu), mở phong bì giá chỉ cho bidder đạt; cả hai sự kiện mở niêm phong ghi audit log. (R-05) | Procurement, Finance approver | Tenders | — |
| F-44 | Q&A & addendum | Câu hỏi/trả lời công bố cho mọi bidder không nêu tên người hỏi, tham chiếu dòng Material ID; Addendum No. 1 có tóm tắt thay đổi, số NCC đã xác nhận (4/4), thông báo Gmail và portal; "Open Q&A log". (R-11) | Procurement | Tenders | Câu hỏi/addendum gắn dòng Material ID (CON-24330, SRV-52210) |
| F-45 | Hội đồng & cam kết COI | Danh sách thành viên (chủ tịch, đánh giá kỹ thuật/thương mại, chứng kiến, người duyệt trao thầu) với trạng thái COI; người chưa ký không được mở hoặc chấm bid; nút "Remind". (R-10) | Procurement | Tenders | — |
| F-46 | Đánh giá kỹ thuật (phong bì 1) | Chấm kỹ thuật từng bidder theo từng người đánh giá, ngưỡng đạt 70/100, tiêu chí lấy từ spec Material ID, kết quả Pass/Fail. (R-10) | Procurement | Tenders | Tiêu chí lấy từ spec Material ID |
| F-47 | So sánh giá (phong bì 2) & bảo đảm dự thầu | Ma trận theo dòng Material ID: SL, VAT, baseline (PO cuối hoặc TB bid vòng 1), đơn giá và thành tiền từng bidder, nhãn "Lowest", tổng trước/sau VAT, điểm kỹ thuật × 40% + điểm giá × 60%, xếp hạng và dòng bid security (13.000.000 ₫, thiếu là Non-compliant). (R-03, R-09) | Procurement | Tenders | So sánh từng dòng Material ID |
| F-48 | Tờ trình trúng thầu & thông báo kết quả | Tờ trình (NCC đề xuất, giá trúng 1.266.150.000 ₫, saving 51.350.000 ₫ = 3,9%, công thức theo dòng, lý do bắt buộc khi không chọn giá thấp nhất), tuyến duyệt áp SoD, thông báo trúng/trượt kèm hạng, hoàn bảo đảm ≤ 14 ngày; "Submit award recommendation", "Create PO" chỉ mở sau khi duyệt. (R-12) | Procurement, Finance approver | Tenders, Approvals | Trao thầu tách được theo dòng Material ID; giá trúng ghi vào Price history |
| F-49 | e-Auction & bid ngoại tệ | Ghi chú cấu hình đấu giá ngược TND-2026-034 (live 09:00–10:00, bước giảm tối thiểu 0,5%, tự gia hạn 5 phút, NCC chỉ thấy hạng) và TND-2026-032 nhận bid VND hoặc USD quy đổi theo tỷ giá bán ngân hàng ngày mở thầu. (R-22, R-23) | Procurement | Tenders | Đấu giá theo dòng Material ID (LOG-61012, EQP-31244) |

## 9. PR

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-50 | Thông tin PR | Tạo PR-2026-0452 (Draft) với requester, phòng ban, dự án/cost center, danh mục, ngày cần, địa điểm giao, lý do, thời điểm lưu cuối; Save draft / Submit for approval. | Procurement | PurchaseRequest | — |
| F-51 | Kiểm tra ngân sách | Thẻ "Budget check" của dòng ngân sách: Budget 12 tỷ, Invoiced 2,15 tỷ, Committed 5,4 tỷ, Available 4,45 tỷ, PR này −4,0045 tỷ, còn 445.500.000 ₫ (3,7%), kèm thanh xếp chồng; vượt ngân sách sẽ thêm bước "Budget override". (R-14) | Procurement, Finance approver | PurchaseRequest | Dòng ngân sách ánh xạ theo nhóm Material ID |
| F-52 | Dòng hàng theo Material ID | Chọn Material ID qua ô gợi ý (gõ "bê tông" ra 3 mã), mô tả/UoM/VAT tự lấy từ Material master, đơn giá ước tính từ PO cuối, sửa SL, Add line, Import BOQ, "Request a new Material ID" và tổng tách theo thuế suất (VAT 10% và 8%). (R-03) | Procurement | PurchaseRequest | Mỗi dòng PR bắt buộc chọn Material ID |
| F-53 | Gợi ý phương thức mua | Mỗi dòng hiện "Release PO from contract" (CT-2026-008 · còn 560 / 1.200 tấn) hoặc "Tender required, value > 500tr" khi không có HĐ. | Procurement | PurchaseRequest | Dò HĐ đang hiệu lực theo Material ID |
| F-54 | Xem trước tuyến phê duyệt | Hiển thị các khung giá trị (≤ 200tr Dept head; ≤ 2 tỷ + Procurement Lead; > 2 tỷ + Finance Director), các bước áp dụng cho PR 4.004.500.000 ₫ với SLA 2 ngày làm việc và ghi chú SoD. (R-06, R-18) | Procurement | PurchaseRequest | — |
| F-55 | Đính kèm PR | Tải tệp có loại (Specification/drawing, BOQ, Quotation, Other), phiên bản, người tải, nhãn "Uploaded by supplier" và chip Material ID. (R-19) | Procurement | PurchaseRequest | Đính kèm gắn Material ID |

## 10. Phê duyệt

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-56 | Hộp phê duyệt & duyệt hàng loạt | Hàng đợi Waiting for me (6) / Delegated / History, lọc loại (PR approval, Award recommendation, PO change order, New Material ID, Vendor change, Invoice exception), mỗi mục có hạn SLA, giá trị, người yêu cầu, bước; "Approve selected · under 50.000.000 ₫". (R-06) | Procurement, Finance approver | Approvals | — |
| F-57 | Chi tiết hồ sơ cần duyệt | Chi tiết PR-2026-0431: dòng Material ID với giá ước tính, giá cuối + nguồn, TB 90 ngày, VAT; ảnh hưởng ngân sách; chuỗi duyệt (quy tắc capex EQP- > 1 tỷ thêm Finance Director); bình luận; đính kèm. | Procurement, Finance approver | Approvals | Chip Material ID kèm giá cuối và TB 90 ngày |
| F-58 | Approve / Reject / Request changes | Người duyệt ra quyết định; bắt buộc nhập comment khi Reject hoặc Request changes; hiển thị "Approving as … next: …". (R-06) | Procurement, Finance approver | Approvals | — |
| F-59 | Ủy quyền phê duyệt | Panel ủy quyền (cho Lê Quốc Huy 10/11–14/11/2026, trần 500.000.000 ₫, loại PR approval và PO change order), mục vượt trần chuyển Đỗ Hoàng Nam, lịch sử ghi "on behalf of"; Edit / Cancel delegation. (R-06) | Procurement, Finance approver | Approvals, Admin | — |
| F-60 | Kiểm soát SoD | Mục vi phạm hiện "Blocked — SoD" (tự tạo change order thì không tự duyệt, chuyển người khác), danh sách 4 quy tắc SoD, chỉ Admin được override và mọi override ghi audit log. (R-18) | Procurement, Finance approver, Admin | Approvals | Áp dụng cả yêu cầu Material ID mới |

## 11. PO & nhận hàng

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-61 | Danh sách PO | Xem 128 PO với chip trạng thái có số đếm (Draft, Approved, Sent, Confirmed, Partially received, Closed, Cancelled), tìm theo PO / NCC / Material ID / PR / tender, lọc NCC và nơi giao, cờ "Not confirmed · 3 days" / "NCR open"; New PO / Export Excel. | Procurement | PurchaseOrders | Cột Material IDs, tìm theo Material ID |
| F-62 | Tạo PO từ nguồn | Tạo PO-2026-0882 từ Approved PR / Tender award / Contract release (PR chưa duyệt không chọn được), chọn NCC có chỉ số rủi ro, nơi giao, điều khoản thanh toán, lịch giao; dòng điền sẵn; kiểm tra giá (giá cuối, TB 90 ngày, −1,5%); cảnh báo NCC High-risk; tuyến duyệt ≤ 2 tỷ; Save draft / Submit. (R-03, R-16) | Procurement | PurchaseOrders | Dòng PO kế thừa Material ID, VAT và giá tham chiếu |
| F-63 | Chi tiết PO & trạng thái | Header PO-2026-0877 Rev.1 (NCC, PR, tender, HĐ, thanh toán, nơi giao, VAT, buyer), thanh trạng thái Draft → Approved → Sent → Confirmed → Partially received → Closed, dòng hàng và tổng 1.216.000.000 + VAT 10% 121.600.000 = 1.337.600.000 ₫; nút Send to supplier, Record goods receipt. (R-03) | Procurement | PurchaseOrders | Dòng PO theo Material ID |
| F-64 | Lịch giao & nhận hàng (GRN) | Bảng lịch giao: SL, ngày hứa (đã đổi theo Rev.1), số GRN, ngày nhận, received · accepted · rejected, On time / In full, thông tin kiểm tra (người kiểm, mill certificate, CO/CQ, biên bản giao nhận, ảnh) và công thức OTIF. (R-07) | Procurement | PurchaseOrders | GRN line mang Material ID; CO/CQ theo yêu cầu của Material ID |
| F-65 | Kiểm tra chất lượng & NCR | Dòng GRN giao 60 / nhận 55 / loại 5 tấn kèm lý do, người kiểm, ảnh, NCR-2026-014 → Return to vendor, xác nhận của NCC; "In full: No" và khóa matching hóa đơn cho phần bị loại khi NCR còn mở; "Open NCR". (R-07) | Procurement | PurchaseOrders | NCR gắn Material ID (CON-24102) |
| F-66 | Tóm tắt 3-way match trên PO | Khối PO / GRN / Invoice cho dòng 1 → "Matched · INV-2026-0318", số còn phải xuất hóa đơn (30 tấn · 456.000.000 ₫) và liên kết sang Invoices. | Procurement, Finance approver | PurchaseOrders | Match theo dòng Material ID |
| F-67 | Change order & lịch sử revision | "Change order" tạo Rev.N với diff (Rev.2: 80 → 85 tấn, +76.000.000 ₫, chờ Đỗ Hoàng Nam duyệt do SoD), cần duyệt lại khi tăng giá trị vượt ngưỡng ma trận, NCC xác nhận lại mọi revision, không đổi SL đã nhận/đã xuất hóa đơn. (R-13) | Procurement, Finance approver | PurchaseOrders, Approvals | Thay đổi theo dòng Material ID |
| F-68 | Hủy PO | "Cancel PO" chỉ áp dụng cho SL còn mở (50 tấn đã nhận không hủy được), bắt buộc nhập lý do và thông báo NCC. (R-13) | Procurement | PurchaseOrders | — |
| F-69 | In PO & đính kèm | Xem trước "Đơn đặt hàng" (MST bên mua/bán, nơi và lịch giao, dòng có Mã vật tư, VAT, điều khoản, trạng thái ký số), Download PDF có số revision khớp PO; đính kèm có loại (Signed PO, Mill certificate, Biên bản giao nhận, Spec) và nhãn NCC tải lên. (R-21, R-19) | Procurement, Supplier | PurchaseOrders | In Mã vật tư trên từng dòng; đính kèm gắn Material ID |

## 12. Hóa đơn & 3-way match

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-70 | Hộp hóa đơn điện tử | Tab All 24 / To match 9 / Exceptions 3 / Ready for payment 6 / Blocked 1, nguồn (portal, inbox hoadon@), "Fetch e-invoice inbox", "Upload XML + PDF", bảng ký hiệu/số, MST bán, PO · GRN, tiền trước VAT, VAT, kết quả pháp lý và match; banner dung sai giá ±0,5% · SL ±2% · Edit in Admin. (R-01) | Procurement, Finance approver | Invoices | Ghi chú dòng "No Material ID" |
| F-71 | Kiểm tra pháp lý hóa đơn | 6 kiểm tra: có Mã CQT và tra GDT "Đã được cấp mã", MST bán = vendor master, MST mua = công ty, định dạng ký hiệu/số, liên kết hóa đơn điều chỉnh/thay thế, dòng đã ánh xạ Material ID; kèm trường đã parse; một kiểm tra lỗi là chặn trước khi match. (R-01) | Finance approver, Procurement | Invoices | Kiểm tra dòng hóa đơn ánh xạ Material ID |
| F-72 | 3-way match theo dòng | Thẻ PO → GRN → E-invoice và lưới dòng: SL/giá PO, SL GRN accepted, SL/giá hóa đơn, chênh SL, chênh giá, dung sai, kết quả; SL so với SL accepted, giá so với giá PO, dòng SL còn mở. (R-02) | Finance approver, Procurement | Invoices | Match từng dòng Material ID |
| F-73 | Xử lý ngoại lệ | INV-2026-0322 giá +3,0% > ±0,5%, vượt PO 6.660.000 ₫, On hold, giao buyer với hạn xử lý, đề xuất chuyển My approvals, "Request credit note"; giá hóa đơn ghi vào Price history dạng Invoice. (R-02) | Procurement, Finance approver | Invoices, Approvals | Giá lệch ghi Price history theo Material ID |
| F-74 | 2-way match dịch vụ | Hóa đơn SRV- đối chiếu giá PO với biên bản nghiệm thu dịch vụ SES (SLA 99,2% so với mục tiêu 98%), VAT 8% theo Material ID; "Mark ready for payment". (R-02) | Finance approver | Invoices | Quy tắc 2-way áp cho Material ID tiền tố SRV- |
| F-75 | Trạng thái thanh toán & xuất kế toán | Trạng thái Submitted → Validated → Matched → Ready for payment → Paid, hạn thanh toán theo điều khoản NCC (30 ngày → 28/11/2026), nút Hold / Mark ready for payment / Export to accounting với ánh xạ Material ID → mã hàng và V-code → mã NCC. (R-02, R-20) | Finance approver | Invoices | Material ID ánh xạ mã hàng kế toán |

## 13. Lịch sử giá

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-76 | Chọn Material ID & bộ lọc | Chọn Material ID, kỳ (12/24 tháng, YTD), NCC (Top 3 / All), nguồn PO / Bid / Quotation / Invoice; mọi giá trước VAT; Export Excel và "Open Material 360°". | Procurement | PriceHistory | Bộ lọc chính là Material ID |
| F-77 | KPI giá | Giá cuối 15.200.000 ₫ (PO-2026-0877), TB 12 tháng có trọng số SL 16.170.000 ₫ / 46 bản ghi, min–max 15,20–16,60tr, so với TB 90 ngày −5,3%. | Procurement | PriceHistory | Tính theo Material ID |
| F-78 | Biểu đồ giá theo NCC & so sánh | Đường giá TB tháng của từng NCC trong 12 tháng và thẻ so sánh NCC (số bản ghi, số tháng rẻ nhất, % so với NCC rẻ nhất). | Procurement | PriceHistory | Theo Material ID |
| F-79 | Quy tắc cảnh báo giá | Quy tắc "Notify Procurement when a new price differs from its 90-day average by more than ±5%" với nút Edit rule. (R-15) | Procurement | PriceHistory | Quy tắc gắn từng Material ID |
| F-80 | Bảng bản ghi giá | Danh sách bản ghi: ngày, nguồn, chứng từ, NCC, SL, đơn giá, Δ so với PO trước, mục đích sử dụng (Current baseline, Saving baseline, Tender round 2, Spot quote). | Procurement | PriceHistory | Bản ghi giá theo Material ID |

## 14. Báo cáo

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-81 | Bộ lọc & KPI OTIF | Lọc kỳ, danh mục, NCC, Material ID; Export Excel/PDF; KPI OTIF 91,4%, On-time 94,0%, In-full 96,8% (theo SL accepted), 1.284 lần giao, 77 trễ, 41 thiếu/bị loại; xu hướng tháng so với mục tiêu 95% và định nghĩa OTIF. (R-07) | Procurement, Finance approver | Reports | Một lần giao = một dòng lịch PO theo Material ID; lọc theo Material ID |
| F-82 | OTIF theo NCC | Danh sách NCC sắp theo OTIF với on-time/in-full và nhãn On target / Below / < 85%. | Procurement | Reports | — |
| F-83 | KPI saving & theo danh mục | Saving YTD 9,7 tỷ ₫, tỷ lệ 5,2% (mục tiêu 4%), cost avoidance 2,1 tỷ ₫ báo cáo riêng, Finance-validated 8,9 tỷ ₫ (92%) và saving theo danh mục. (R-24) | Procurement, Finance approver | Reports | — |
| F-84 | Cách tính & bản ghi saving | Công thức Saving = (Baseline − Awarded) × Qty, baseline = giá PO cuối cùng Material ID (dự phòng TB bid vòng 1), loại Price reduction / Cost avoidance / Negotiation, trạng thái Draft → Submitted → Validated by Finance, top 8 bản ghi và "Export saving records". (R-24) | Procurement, Finance approver | Reports | Bản ghi saving theo dòng Material ID |
| F-85 | Phân tích chi tiêu | Tập trung NCC (top 5 = 41,4%), chi tiêu ngoài HĐ 12,6% (độ phủ HĐ 87,4%) theo Material ID, cycle time trung vị PR → PO 9,5 ngày (mục tiêu ≤ 10) chia theo tuyến. (R-17) | Procurement | Reports | Off-contract liệt kê theo Material ID |
| F-86 | Ngân sách so với cam kết và thực chi | Bảng theo dự án: Budget, Invoiced, Committed, Available = Budget − Invoiced − Committed, % đã dùng và thanh xếp chồng. (R-14) | Procurement, Finance approver | Reports | — |

## 15. Cổng NCC

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-87 | Tổng quan & việc cần làm | Header công ty V-1001, Gmail đăng nhập, lần đăng nhập cuối; KPI lời mời, bid kín, PO mở, My OTIF 95,8%, scorecard 4,32 (A); danh sách "Action needed" có hạn và nút xử lý; chuông 3 thông báo; menu Bidding / Orders / My company. | Supplier | SupplierPortal | — |
| F-88 | Lời mời thầu & báo giá theo dòng | Thẻ TND-2026-031 (đóng 05/11/2026 17:00, đếm ngược, addendum), nhập đơn giá trước VAT, VAT (khóa 10% cho kim loại), lead time từng dòng, tick "No bid", tổng trước VAT, VAT tách theo thuế suất, tổng sau VAT. (R-03, R-05) | Supplier | SupplierPortal | Báo giá theo dòng Material ID |
| F-89 | Bảo đảm dự thầu & tài liệu bid | Khai báo bảo đảm dự thầu (yêu cầu 1% = 35.000.000 ₫, hiệu lực ≥ 90 ngày sau đóng thầu), hình thức, số tiền, ngày hiệu lực, tải/thay file; hoàn trả ≤ 14 ngày nếu trượt; đính kèm CO/CQ, catalogue, datasheet, thư chào giá có loại và phiên bản. (R-09, R-19) | Supplier | SupplierPortal | Đính kèm gắn Material ID |
| F-90 | Q&A & xác nhận addendum | Xem Addendum 01 đã xác nhận, danh sách Q&A đã công bố (tham chiếu Material ID, trạng thái), đặt câu hỏi kèm tham chiếu dòng; câu trả lời gửi mọi bidder ẩn danh. (R-11) | Supplier | SupplierPortal | Câu hỏi gắn dòng Material ID |
| F-91 | Cam kết & nộp / rút bid kín | Tick cam kết (hiệu lực 90 ngày, theo addendum, đồng ý xử lý dữ liệu cá nhân), ghi chú cho buyer, "Submit sealed bid" / Save draft / "Withdraw bid", biên nhận RC-031-002 kèm giờ; sửa được tới giờ đóng, sau đó nút bị khóa. (R-05, R-25) | Supplier | SupplierPortal | — |
| F-92 | Xác nhận / từ chối PO | PO-2026-0889 chờ xác nhận trong 48 h với Confirm PO / Decline. (R-13) | Supplier | SupplierPortal | Dòng PO hiện Material ID (CON-24020) |
| F-93 | PO của tôi, cập nhật ngày giao & GRN | Bảng PO (SL đặt, giao · nhận, giá trị, trạng thái, đợt giao tới, hành động), form đổi ngày/SL giao kèm lý do (cần buyer chấp nhận, on-time tính theo ngày được chấp nhận) và danh sách GRN gần đây On time / In full. (R-07) | Supplier | SupplierPortal | PO và GRN hiển thị theo Material ID |
| F-94 | Kết quả thầu, hợp đồng & chứng chỉ | Thông báo trúng thầu TND-2026-024 (hạng 1/4, PO, bảo đảm đã hoàn), HĐ CT-2026-008 đã tiêu thụ 53%, chứng chỉ sắp hết hạn với nút "Upload renewal". (R-12) | Supplier | SupplierPortal | Kết quả và HĐ hiện chip Material ID |
| F-95 | Gửi hóa đơn điện tử | Chọn GRN, loại hóa đơn Original / Adjustment / Replacement, tải XML (đã parse, có chữ ký người bán) + PDF, xem trường đã parse, pill kiểm tra hợp lệ, ánh xạ dòng → Material ID / PO line / GRN, dòng thời gian trạng thái và danh sách hóa đơn có hạn/ngày trả. (R-01) | Supplier | SupplierPortal | Dòng hóa đơn ánh xạ Material ID của dòng PO |
| F-96 | Phản hồi NCR | Chi tiết NCR-2026-017 (giao/nhận/loại, lý do, người kiểm, chứng từ, yêu cầu thay 2 tấn, ảnh), chọn Replace / Return and credit note / Offer a discount kèm comment, "Send response"; phần bị loại không xuất hóa đơn được tới khi đóng NCR. (R-07) | Supplier | SupplierPortal | NCR gắn Material ID |
| F-97 | Hồ sơ công ty & MST | Hồ sơ hoàn thiện 75%: tên, MST + "Check MST" (định dạng, kết quả GDT), người đại diện pháp luật, Gmail liên hệ, tài khoản ngân hàng đang dùng và tài khoản mới "Pending Finance verification"; Save profile. (R-04, R-08) | Supplier | SupplierPortal | — |
| F-98 | Material ID chào bán & checklist onboarding | Danh sách Material ID chào bán (Approved / Proposed · awaiting buyer approval) và checklist 8 mục (MST, đại diện, Giấy CNĐKDN, ngân hàng, danh mục, chứng chỉ, quy tắc ứng xử, đồng ý quyền riêng tư); "Manage consent". (R-08, R-25) | Supplier | SupplierPortal | NCC đề xuất liên kết NCC – Material ID |

## 16. Admin

| Mã | Tính năng | Mô tả | Vai trò | Màn hình | Liên kết Material ID |
|---|---|---|---|---|---|
| F-99 | Người dùng & vai trò | KPI (58 active, 4 lời mời chờ, 2 suspended, 3 chưa bật 2-step, 1 cảnh báo tích hợp), tìm/lọc theo vai trò, trạng thái, 2-step, bảng có ngày đồng ý quyền riêng tư; Invite user, Edit roles, Export/Delete personal data, yêu cầu dữ liệu đang mở. (R-25) | Admin | Admin | — |
| F-100 | Chính sách truy cập | Cấu hình phương thức đăng nhập (chỉ Google / có password cho NCC), tài khoản được phép (allowlist / domain Workspace), thêm Gmail vào allowlist, hạn lời mời NCC 7 ngày, idle timeout 30 phút, đăng nhập lại sau 12 h, bắt buộc 2-step cho Admin/Approver/Finance; Save policy. | Admin | Admin | — |
| F-101 | Phiên bản thông báo quyền riêng tư | Phiên bản v2.1 hiện hành (hiển thị ở lần đăng nhập đầu, khi nộp bid, link Privacy), 60 người đã chấp nhận, các phiên bản cũ; xuất bản bản mới buộc chấp nhận lại; Preview / Edit text as v2.2. (R-25) | Admin | Admin | — |
| F-102 | Ma trận phê duyệt & chính sách ủy quyền | Khung giá trị ≤ 200tr / ≤ 2 tỷ / > 2 tỷ, bước bổ sung (EQP- > 1 tỷ, vượt ngân sách, NCC mới/đổi ngân hàng, Material ID mới), chính sách ủy quyền (tối đa 14 ngày, trần 2 tỷ hoặc hạn mức người ủy quyền nếu thấp hơn, bulk approve < 50tr) và ủy quyền đã lên lịch; Edit matrix. (R-06) | Admin | Admin | Yêu cầu Material ID mới có bước Procurement Lead |
| F-103 | Quy tắc SoD | 6 quy tắc với chế độ Block/Warn và số lần vi phạm 30 ngày (requester ≠ approver, tender creator ≠ sole evaluator, vendor editor ≠ payment approver, vendor creator ≠ approver, evaluator ≠ award approver, PO buyer ≠ goods receiver); Add rule; override có lý do. (R-18) | Admin | Admin | Áp dụng cho yêu cầu Material ID |
| F-104 | Dung sai 3-way match | Đặt dung sai giá ±0,5% và SL ±2% (chỉ đơn vị khối lượng/thể tích tấn, m³; đơn vị đếm phải khớp tuyệt đối), hành vi vượt dung sai (auto-hold vào hàng ngoại lệ của buyer, nhả cần Procurement Lead / chỉ cảnh báo), NCR mở chặn match, ghi lệch giá vào Price history, 2-way cho SRV-. (R-02) | Admin, Finance approver | Admin | Match theo dòng Material ID; quy tắc SRV- |
| F-105 | Quy tắc thông báo & leo thang | Bảng 8 sự kiện (PO chưa xác nhận, chờ duyệt, tender sắp đóng, chứng chỉ/HĐ hết hạn, ngoại lệ hóa đơn, hạn NCR, cảnh báo giá) với nhắc, leo thang, kênh In-app/Gmail/Portal, lần chạy gần nhất; digest hằng ngày 07:30; Add rule. (R-15) | Admin | Admin | Cảnh báo giá theo Material ID |
| F-106 | Dữ liệu chủ, mẫu đánh giá & đánh số | Định dạng Material ID, danh mục CON/EQP/SRV/LOG (owner, kiểu match), template đánh giá và ngưỡng hạng, bảng quy tắc đánh số (PR-YYYY-NNNN, TND-YYYY-NNN, RC-, PO-YYYY-NNNN, Rev.N, CT-, GRN-, SES-, NCR-, INV-, V-NNNN; số hủy không tái sử dụng). | Admin | Admin | Định dạng CAT-NNNNN và danh mục của Material ID |
| F-107 | Tích hợp & ánh xạ mã | Thẻ trạng thái Google sign-in, e-invoice inbox, GDT invoice lookup, xuất kế toán (1 lỗi); bảng Material ID ↔ mã hàng (2 chưa map), vendor ↔ mã NCC 141/142; sync log có Retry. (R-20) | Admin, Finance approver | Admin | Ánh xạ Material ID → mã hàng kế toán |
| F-108 | Nhật ký kiểm toán | Audit log chỉ đọc, lưu 10 năm, 18.420 mục, lọc theo người dùng và loại hành động (Settings, Sign-in, Bids and tenders, Overrides), Export Excel, Load more. | Admin | Admin | — |

---

## Luồng nghiệp vụ chính

Bảng dữ liệu đề xuất (ngoài danh sách gợi ý có thêm vài bảng phụ, ghi rõ khi dùng): `material`, `material_spec`, `material_cert_req`, `vendor`, `vendor_material`, `vendor_bank_account`, `evaluation_template`, `evaluation_criterion`, `evaluation_score`, `contract`, `contract_line`, `certificate`, `purchase_request`, `pr_line`, `approval_task`, `delegation`, `tender`, `tender_line`, `tender_member`, `tender_qa`, `bid`, `bid_line`, `purchase_order`, `po_line`, `po_revision`, `grn`, `grn_line`, `ncr`, `service_acceptance`, `invoice`, `invoice_line`, `match_result`, `price_record`, `saving_record`, `budget`, `user_account`, `role`, `policy`, `notification`, `attachment`, `integration_log`, `audit_log`.

Quy ước: **FE** = front end hiển thị gì · **BE** = back end kiểm tra/tính gì · **Bảng** = R đọc / W ghi. Mọi thao tác ghi đều thêm một dòng `audit_log` (không nhắc lại ở từng bước trừ khi là trọng tâm).

### L-01 · Đăng nhập Gmail & định tuyến vai trò
- **Tác nhân:** mọi người dùng (Procurement, Supplier, Admin, Finance approver) · **Màn hình:** Login → Main / SupplierPortal / Admin · **Tính năng:** F-01, F-02, F-03, F-04, F-99, F-100, F-101, F-108
1. **FE:** Login hiện "Continue with Gmail", 3 thẻ vai trò, dòng đồng ý BVDLCN và popover Privacy notice v2.1. **BE:** khởi tạo Google OAuth. **Bảng:** R `policy` (sign-in method).
2. **BE:** xác thực token Google; email phải nằm trong allowlist (hoặc domain Workspace nếu policy cho phép) và `status` không phải Suspended; với Admin/Approver/Finance yêu cầu Google 2-step. **Bảng:** R `user_account`, `policy`; W `audit_log` (Signed in, "2-step passed").
3. **FE/BE:** NCC bấm "Accept invitation & sign in": kiểm tra lời mời chưa quá 7 ngày, gắn Gmail với mã NCC (vd. V-1007), chuyển Invited → Active. **Bảng:** R/W `user_account`; R `vendor`.
4. **BE:** nếu người dùng chưa chấp nhận phiên bản thông báo hiện hành (v2.1) thì FE hiện notice + checkbox đồng ý; lưu phiên bản và ngày đồng ý. **Bảng:** R `policy` (privacy_version); W `user_account` (consent_version, consent_at).
5. **BE:** đọc vai trò → định tuyến: Procurement/Approver/Finance → Main, Supplier → SupplierPortal (giới hạn dữ liệu theo vendor), Admin → Admin; nhiều vai trò thì FE hiện "Switch workspace". **Bảng:** R `role`, `user_account`.
6. **BE:** áp idle timeout 30 phút và buộc đăng nhập lại sau 12 h theo policy. **Bảng:** R `policy`.

### L-02 · Tạo Material ID với kiểm tra trùng & phê duyệt
- **Tác nhân:** buyer (Procurement), Material master owner, Finance approver, Admin · **Màn hình:** MaterialMaster, Approvals, Material360 · **Tính năng:** F-10, F-11, F-12, F-13, F-14, F-15, F-16, F-56, F-58, F-102, F-103
1. **FE:** "New Material ID" mở panel; chọn category CON. **BE:** tính số kế tiếp trong dải danh mục (CON 24000–29999, sau CON-24330 → CON-24331) để hiển thị. **Bảng:** R `material`, `policy` (numbering).
2. **FE:** nhập group, mô tả VN/EN, base UoM + quy đổi (1 tấn = 54 cây), spec, HS code, lead time, MOQ, chứng chỉ bắt buộc, VAT, đính kèm; Save draft. **BE:** kiểm tra trường bắt buộc, lưu Draft. **Bảng:** W `material` (Draft), `material_spec`, `material_cert_req`, `attachment`.
3. **BE:** chạy kiểm tra trùng: cùng group + thuộc tính spec chính (đường kính) + UoM → điểm giống (CON-24015 92%). **FE:** hiện "Possible duplicate"; người yêu cầu ghi lý do "grade differs". **Bảng:** R `material`, `material_spec`; W `material` (dup_check_note).
4. **FE:** "Submit for approval". **BE:** giữ số (không tái sử dụng), sinh 3 bước Requester → Material master owner → Admin; áp SoD requester ≠ approver; status Pending approval. **Bảng:** W `material`, `approval_task`, `notification`.
5. **FE:** Approvals hiện mục "New Material ID · Step 2 of 3 · duplicate check passed". **BE:** Procurement Lead duyệt; Finance xác nhận VAT (giảm 8% đến 31/12/2026, kim loại loại trừ → 10%). **Bảng:** W `approval_task`, `material` (vat_rate, reduced_eligible, vat_confirmed_by).
6. **BE:** Admin cấp mã → Active; mã bị từ chối/khóa (vd. LOG-61013 trùng LOG-61012 → Blocked) không tái sử dụng. **FE:** change log 7 ngày, Material 360° mở cho mã mới. **Bảng:** W `material` (Active), `audit_log`.

### L-03 · Tạo / sửa / xóa NCC với kiểm tra MST
- **Tác nhân:** Procurement, Finance approver · **Màn hình:** Vendors, Approvals, SupplierPortal · **Tính năng:** F-20, F-21, F-22, F-23, F-24, F-25, F-26, F-97
1. **FE:** danh sách NCC → "New vendor" hoặc biểu tượng Edit mở drawer. **Bảng:** R `vendor`, `vendor_material`.
2. **BE:** kiểm tra định dạng MST: 10 số (doanh nghiệp), 10+3 `0312456789-001` (chi nhánh, bắt buộc có NCC mẹ), 12 số (cá nhân/hộ kinh doanh); sai thì FE báo lỗi inline.
3. **FE:** "Re-check MST". **BE:** tra cứu cơ quan thuế → tên đăng ký, địa chỉ, trạng thái "Đang hoạt động", ngày kiểm tra; tên không khớp → cảnh báo. **Bảng:** W `vendor` (tax_status, mst_checked_at).
4. **BE:** ràng buộc MST duy nhất → chặn Save "MST 0312456789 already belongs to V-1003 Đại Phong". **Bảng:** R `vendor`.
5. **FE:** sửa thanh toán, danh mục, liên hệ, Portal Gmail, thêm/gỡ Material ID. **BE:** NCC chưa xác minh MST không được duyệt cho Material ID; NCC mới cần duyệt Procurement Lead rồi Finance, SoD creator ≠ approver. **Bảng:** W `vendor`, `vendor_material`, `approval_task`.
6. **BE:** đổi tài khoản ngân hàng (từ portal) tạo bản ghi Pending, gọi lại số đã đăng ký rồi Finance duyệt; tài khoản cũ vẫn dùng tới khi xác minh; SoD vendor-master editor ≠ payment approver. **Bảng:** W `vendor_bank_account`, `approval_task`.
7. **BE:** Delete kiểm tra PO mở (PO-2026-0869) → khóa nút, gợi ý Blocked. **Bảng:** R `purchase_order`; W `vendor` (status).
8. **BE:** "Re-check risk" tính Low/Medium/High từ trạng thái thuế, chứng chỉ bắt buộc hết hạn, OTIF < 85%, single source, NCR mở. **Bảng:** R `certificate`, `grn_line`, `ncr`, `vendor_material`; W `vendor` (risk, risk_checked_at).

### L-04 · Đánh giá NCC
- **Tác nhân:** Procurement (người đánh giá), Admin · **Màn hình:** VendorEvaluation, Admin, Main · **Tính năng:** F-27, F-28, F-29, F-106, F-06
1. **FE:** Criteria templates: sửa tiêu chí, nguồn dữ liệu, trọng số. **BE:** tổng trọng số phải 100% mới cho Save template. **Bảng:** W `evaluation_template`, `evaluation_criterion`.
2. **FE:** "Start new period" (Q3/2026). **BE:** sinh scorecard Not started cho NCC thuộc danh mục, gán người đánh giá, hạn 15/11. **Bảng:** R `vendor`; W `evaluation_score`.
3. **BE:** tính tiêu chí Auto: Quality từ NCR rate & accepted qty, OTIF từ PO deliveries (in full = accepted qty), Price competitiveness so với giá TB thị trường theo Material ID, Responsiveness từ thời gian phản hồi tender. **Bảng:** R `grn_line`, `ncr`, `price_record`, `bid`.
4. **FE:** người đánh giá nhập điểm Manual (Commercial, HSE) và nhận xét. **BE:** điểm quy đổi = điểm × trọng số; tổng = Σ (vd. 4,32); hạng A ≥ 4,20 Preferred · B 3,50–4,19 Approved · C 3,00–3,49 Probation · D < 3,00 Blocked. **Bảng:** W `evaluation_score`.
5. **FE:** "Submit scorecard". **BE:** khóa scorecard, cập nhật điểm/hạng NCC hiển thị ở Vendors, Material 360°, cổng NCC. **Bảng:** W `evaluation_score` (Submitted), `vendor` (score, grade).
6. **FE:** bảng tiến độ; Dashboard hiện "5 of 14 vendors not scored · due 15/11". **Bảng:** R `evaluation_score`; W `notification`.

### L-05 · Hợp đồng & phát hành PO từ hợp đồng
- **Tác nhân:** Procurement, Supplier · **Màn hình:** Contracts, PurchaseRequest, PurchaseOrders, Reports · **Tính năng:** F-30 – F-35, F-53, F-62, F-85
1. **FE:** "New contract": loại, NCC, kỳ hạn, trần giá trị, VAT, owner, dòng giá theo Material ID và khối lượng cam kết. **BE:** sinh CT-YYYY-NNN. **Bảng:** W `contract`, `contract_line`.
2. **BE:** lưu trạng thái ký điện tử và file đã ký (công cụ ngoài), tài liệu có phiên bản; bảo đảm thực hiện phải trong khung 2–10% giá trị, đặt cảnh báo 30 ngày trước hết hạn. **Bảng:** W `contract`, `attachment`, `notification`.
3. **FE:** "Amend (Phụ lục)" theo chỉ số. **BE:** giới hạn điều chỉnh ±5% mỗi kỳ (index −6,8% → áp −5,0%), lưu giá mới có ngày hiệu lực. **Bảng:** W `contract_line` (price, valid_from).
4. **FE:** dòng PR gợi ý "Release PO from contract"; PO chọn "Contract release". **BE:** HĐ phải Active, đúng Material ID, còn khối lượng, giá PO ≤ giá HĐ hiện hành. **Bảng:** R `contract`, `contract_line`; W `purchase_order`, `po_line`.
5. **BE:** cộng khối lượng/giá trị đã phát hành (640 / 1.200 tấn), dự báo so với tối thiểu 80% (960 tấn). **Bảng:** W `contract_line` (released_qty, released_value).
6. **BE:** job hết hạn nhắc owner 60/30 ngày, 7 ngày leo thang Procurement Lead; phát hiện mua ngoài HĐ khi PO cho Material ID có HĐ hiệu lực với NCC khác. **Bảng:** R `po_line`, `contract`; W `notification`.

### L-06 · Chứng chỉ: tải lên, duyệt, chặn khi hết hạn
- **Tác nhân:** Supplier, Procurement · **Màn hình:** SupplierPortal, Certificates, Material360, Tenders, PurchaseOrders · **Tính năng:** F-13, F-18, F-36, F-37, F-38, F-39, F-94
1. **FE:** NCC "Upload renewal" (hoặc buyer "Upload certificate"). **BE:** lưu file v1, trích xuất trường (số, chuẩn, holder, phạm vi, ngày cấp/hết hạn), status Pending review. **Bảng:** W `certificate`, `attachment`, `notification`.
2. **FE:** panel Review upload. **BE:** tự đánh dấu checklist: holder = vendor master, phạm vi phủ Material ID có chứng chỉ bắt buộc, hạn > hôm nay; mục thủ công: tổ chức công nhận, khoảng trống hiệu lực. **Bảng:** R `vendor`, `material_cert_req`.
3. **FE:** Reject bắt buộc chọn lý do; comment gửi NCC. **Bảng:** W `certificate` (Rejected), `notification`.
4. **FE:** "Approve & unblock". **BE:** status Valid, ghi người/ngày xác minh, gỡ chặn cặp NCC – Material ID. **Bảng:** W `certificate`, `vendor_material` (blocked=false), `audit_log`.
5. **BE (job hằng ngày):** nhắc NCC và owner ở 60/30 ngày; khi hết hạn → Expired; nếu bắt buộc cho Material ID → chặn NCC khỏi PO mới và trao thầu cho mã đó, bid trên dòng đó Non-compliant khi mở thầu, PO mở vẫn chạy. **Bảng:** W `certificate`, `vendor_material`, `notification`, `audit_log` (System).
6. **BE:** khi tạo PO/trao thầu kiểm tra `vendor_material.blocked`; tại GRN kiểm tra CO/CQ từng lô. **Bảng:** R `vendor_material`, `certificate`.

### L-07 · Tạo PR
- **Tác nhân:** Procurement (requester, buyer) · **Màn hình:** PurchaseRequest, Material360 · **Tính năng:** F-50 – F-55, F-17
1. **FE:** Create PR (hoặc "Create PR" từ Material 360°): nhập thông tin chung. **BE:** cấp PR-YYYY-NNNN khi lưu, status Draft. **Bảng:** W `purchase_request`.
2. **FE:** gõ vào ô Material ID → danh sách gợi ý. **BE:** trả mô tả, UoM, VAT từ Material master và giá PO cuối (chứng từ, ngày, NCC). **Bảng:** R `material`, `price_record`.
3. **BE:** thành tiền = SL × đơn giá; tổng tách theo thuế suất (10% trên 2.438.000.000, 8% trên 1.566.500.000); dòng trống không được gửi. **Bảng:** W `pr_line`.
4. **BE:** gợi ý mua: có HĐ hiệu lực còn khối lượng → "Release PO from contract"; không có HĐ và giá trị > 500tr → "Tender required". **Bảng:** R `contract_line`.
5. **BE:** kiểm tra ngân sách: Available = Budget − Invoiced − Committed; trừ PR này; vượt → thêm bước Budget override (Finance Director). **Bảng:** R `budget`, `po_line`, `invoice`.
6. **BE:** dựng tuyến duyệt theo giá trị trước VAT (≤ 200tr / ≤ 2 tỷ / > 2 tỷ) + bước bổ sung (EQP- > 1 tỷ, vượt ngân sách); PR 4.004.500.000 ₫ → 3 bước, SLA 2 ngày làm việc. **Bảng:** R `policy`.
7. **FE:** đính kèm có loại, gắn Material ID; "Submit for approval". **BE:** status Submitted, tạo approval_task bước 1, thông báo. **Bảng:** W `attachment`, `approval_task`, `notification`.

### L-08 · Phê duyệt với ủy quyền & SoD
- **Tác nhân:** Procurement Lead, Finance approver, Admin · **Màn hình:** Approvals, Admin, Main · **Tính năng:** F-56 – F-60, F-102, F-103, F-06
1. **FE:** My approvals hiện hàng đợi, badge 6. **BE:** lấy task giao cho người dùng + task được ủy quyền, tính tuổi so với SLA 2 ngày, "Step i of n". **Bảng:** R `approval_task`, `delegation`.
2. **FE:** chi tiết PR: dòng Material ID, giá cuối, TB 90 ngày, ảnh hưởng ngân sách, lịch sử, bình luận. **Bảng:** R `pr_line`, `price_record`, `budget`, `approval_task`.
3. **BE:** kiểm tra SoD: người yêu cầu = người duyệt → "Blocked — SoD", chuyển người kế (Đỗ Hoàng Nam); chỉ Admin override kèm lý do. **Bảng:** R `policy` (sod_rule); W `approval_task`, `audit_log` (SoD override).
4. **FE:** Approve / Reject / Request changes; comment bắt buộc với 2 lựa chọn sau. **BE:** cập nhật bước, kích hoạt bước kế; bỏ qua người đã duyệt bước trước của cùng hồ sơ; bước cuối → PR Approved. **Bảng:** W `approval_task`, `purchase_request`, `notification`.
5. **BE:** "Approve selected" chỉ cho mục < 50.000.000 ₫ (policy). **Bảng:** R `policy`.
6. **FE:** tạo ủy quyền (người nhận, ngày, trần, loại hồ sơ). **BE:** tối đa 14 ngày; trần = min(2 tỷ, hạn mức người ủy quyền); người nhận phải là nội bộ, không duyệt hồ sơ của mình; mục vượt trần chuyển cấp kế; ghi "on behalf of". **Bảng:** W `delegation`, `approval_task` (on_behalf_of).
7. **BE:** hết SLA nhắc người duyệt, +1 ngày làm việc leo thang tới quản lý. **Bảng:** W `notification`.

### L-09 · Thiết lập tender & mời thầu
- **Tác nhân:** Procurement · **Màn hình:** Tenders, PurchaseRequest, Material360 · **Tính năng:** F-40, F-42, F-44, F-45, F-49, F-53
1. **FE:** "New tender" (hoặc "Start tender" từ Material 360°) từ PR cần đấu thầu. **BE:** cấp TND-YYYY-NNN, chép dòng PR (Material ID, SL). **Bảng:** R `pr_line`; W `tender` (Draft), `tender_line`.
2. **FE:** cấu hình phương thức (RFQ / Sealed / Two-envelope / e-Auction), phong bì, trọng số 40/60, hiệu lực ≥ 90 ngày, tiền tệ, giờ đóng. **BE:** giá trị gói = Σ SL × giá ước tính từ Price history; bảo đảm dự thầu ≈ 1% (gợi ý 1–1,5% cho hàng hóa/dịch vụ ≤ 10 tỷ); giao sau 31/12/2026 → cờ VAT 8%. **Bảng:** R `price_record`; W `tender`.
3. **FE:** hội đồng và yêu cầu COI. **BE:** SoD: người tạo ≠ người đánh giá duy nhất, người đánh giá ≠ người duyệt trao thầu. **Bảng:** W `tender_member`.
4. **BE:** mời NCC được duyệt cho Material ID (loại NCC bị chặn) qua Gmail + portal; status Invited. **Bảng:** R `vendor_material`, `certificate`; W `notification`, `tender`.
5. **FE:** Q&A: trả lời công bố ẩn danh; Addendum (vd. đổi giờ đóng) có tóm tắt thay đổi. **BE:** thông báo mọi bidder, theo dõi xác nhận (4/4), ghi log. **Bảng:** W `tender_qa`, `tender`, `notification`, `audit_log`.
6. **BE:** 24 h trước đóng thầu nhắc NCC chưa nộp. **Bảng:** R `bid`; W `notification`.

### L-10 · NCC nộp bid kín
- **Tác nhân:** Supplier · **Màn hình:** SupplierPortal, Tenders · **Tính năng:** F-87 – F-91, F-41
1. **FE:** Invitations hiện TND-2026-031, giờ đóng, đếm ngược, addendum. **Bảng:** R `tender`, `tender_line`.
2. **FE:** nhập đơn giá trước VAT, VAT, lead time từng dòng hoặc "No bid". **BE:** VAT khóa 10% cho Material ID kim loại; tính tổng tách thuế suất; Save draft. **Bảng:** R `material`; W `bid` (Draft), `bid_line`.
3. **FE:** khai báo bảo đảm dự thầu. **BE:** số tiền ≥ 1% giá trị gói (35.000.000 ₫), hiệu lực ≥ 90 ngày sau đóng thầu (03/02/2027). **Bảng:** W `bid` (security_*), `attachment`.
4. **FE:** đính kèm CO/CQ, catalogue, thư chào giá đã ký, gắn Material ID; đặt câu hỏi Q&A theo dòng. **Bảng:** W `attachment`, `tender_qa`.
5. **FE:** tick cam kết (hiệu lực 90 ngày, theo Addendum 01, đồng ý dữ liệu cá nhân) → "Submit sealed bid". **BE:** niêm phong giá (Procurement không đọc được tới giờ đóng), cấp biên nhận RC-031-NNN + thời điểm; nộp lại thay biên nhận cũ. **Bảng:** W `bid` (Submitted, sealed), `user_account` (consent), `audit_log`.
6. **BE:** cho Revise/Withdraw tới giờ đóng; sau giờ đóng từ chối mọi lần nộp, FE khóa nút và hiện hạn. **FE (buyer):** chỉ thấy tên, biên nhận, giờ nộp. **Bảng:** R `tender` (closes_at).

### L-11 · Mở thầu, đánh giá hai phong bì & trao thầu
- **Tác nhân:** Procurement (hội đồng), Finance approver · **Màn hình:** Tenders, Approvals, SupplierPortal, PriceHistory · **Tính năng:** F-41, F-43, F-45, F-46, F-47, F-48, F-38, F-94
1. **FE:** sau giờ đóng nút "Open bids". **BE:** yêu cầu 2 thành viên có tên và COI đã ký; mở phong bì kỹ thuật; bid của NCC bị chặn chứng chỉ → Non-compliant trên dòng liên quan. **Bảng:** R `tender_member`, `vendor_material`; W `bid` (opened_at), `audit_log`.
2. **BE:** sinh "Biên bản mở thầu" (bidder, giá, hiệu lực, bảo đảm, thời điểm). **Bảng:** W `attachment`.
3. **FE:** từng người đánh giá chấm kỹ thuật. **BE:** điểm hợp nhất = trung bình; Pass khi ≥ 70/100. **Bảng:** W `bid` (tech_score, tech_result).
4. **BE:** lần mở thứ hai (2 người) chỉ mở phong bì giá cho bidder Pass; thiếu bảo đảm dự thầu hợp lệ → Non-compliant. **Bảng:** W `bid`, `audit_log`.
5. **BE:** ma trận theo dòng Material ID: "Lowest" từng dòng; Price score = tổng thấp nhất ÷ tổng của bidder × 100; Weighted = Tech × 40% + Price × 60%; xếp hạng; baseline = giá PO cuối, không có thì TB bid vòng 1; Saving = (Baseline − Awarded) × Qty. **Bảng:** R `bid_line`, `price_record`.
6. **FE:** tờ trình; bắt buộc lý do khi không chọn giá thấp nhất từng dòng. **BE:** tuyến duyệt theo ma trận + SoD (evaluator ≠ award approver → Finance Director). **Bảng:** W `tender` (recommendation), `approval_task`.
7. **BE (sau duyệt):** Awarded; thông báo trúng/trượt kèm hạng qua Gmail + portal; hoàn bảo đảm ≤ 14 ngày; ghi giá bid (sau mở thầu) và giá trúng vào Price history; mở "Create PO / Create contract". **Bảng:** W `tender`, `notification`, `price_record`, `saving_record`.

### L-12 · Tạo PO, gửi NCC & NCC xác nhận
- **Tác nhân:** Procurement, Supplier · **Màn hình:** PurchaseOrders, Approvals, SupplierPortal · **Tính năng:** F-61, F-62, F-63, F-69, F-92
1. **FE:** "New PO" chọn nguồn Approved PR / Tender award / Contract release. **BE:** chỉ liệt kê PR đã duyệt, tender đã duyệt trao thầu, HĐ Active. **Bảng:** R `purchase_request`, `tender`, `contract`.
2. **BE:** điền sẵn dòng (Material ID, SL, giá, VAT), cấp PO-YYYY-NNNN Draft; kiểm tra NCC không bị chặn cho Material ID, rủi ro High → cảnh báo trước Submit. **Bảng:** R `material`, `vendor`, `vendor_material`; W `purchase_order`, `po_line`.
3. **BE:** kiểm tra giá so với giá cuối và TB 90 ngày (vd. −1,5%), trần giá HĐ nếu là release. **Bảng:** R `price_record`, `contract_line`.
4. **FE:** Submit. **BE:** tuyến theo giá trị (≤ 2 tỷ: Dept head → Procurement Lead). **Bảng:** W `approval_task`.
5. **BE (sau duyệt):** Approved → "Send to supplier" qua Gmail + portal, sinh PDF Đơn đặt hàng có ký số; Sent; cộng committed vào ngân sách. **Bảng:** W `purchase_order`, `po_revision` (Rev.0), `attachment`, `budget`, `notification`.
6. **FE (portal):** "Confirm PO" / "Decline" trong 48 h. **BE:** 48 h nhắc NCC, 72 h leo thang buyer (PO-2026-0869); xác nhận → Confirmed. **Bảng:** W `purchase_order`, `po_revision` (confirmed_by/at), `notification`.

### L-13 · PO change order
- **Tác nhân:** Procurement, Finance approver, Supplier · **Màn hình:** PurchaseOrders, Approvals, SupplierPortal · **Tính năng:** F-67, F-68, F-56, F-60, F-92
1. **FE:** "Change order" trên PO. **BE:** tạo Rev.N Draft và diff theo dòng (80 → 85 tấn, +76.000.000 ₫). **Bảng:** W `po_revision`.
2. **BE:** không cho đổi/hủy SL đã nhận hoặc đã xuất hóa đơn; đổi ngày không đổi giá trị → không cần bước ma trận; tăng giá trị vượt ngưỡng ma trận → duyệt lại; SoD người yêu cầu ≠ người duyệt. **Bảng:** R `grn_line`, `invoice_line`, `policy`; W `approval_task`.
3. **FE:** Approvals hiện "PO change order · Blocked — SoD" cho người tạo, chuyển Finance Director. **Bảng:** W `approval_task`.
4. **BE (sau duyệt):** gửi NCC xác nhận lại revision; PDF cập nhật số Rev; Rev cũ → Superseded. **Bảng:** W `po_revision`, `purchase_order` (current_rev), `notification`.
5. **BE:** cập nhật tiêu thụ HĐ và committed ngân sách. **Bảng:** W `contract_line`, `budget`.
6. **FE:** "Cancel PO" bắt buộc lý do. **BE:** chỉ hủy SL mở, thông báo NCC. **Bảng:** W `po_line` (cancelled_qty), `purchase_order`, `notification`.

### L-14 · Nhận hàng với QC / NCR
- **Tác nhân:** Procurement (người nhận, QC), Supplier · **Màn hình:** PurchaseOrders, SupplierPortal, Material360, Reports, VendorEvaluation · **Tính năng:** F-64, F-65, F-93, F-96, F-19, F-81
1. **FE:** "Record goods receipt" cho một đợt giao. **BE:** cấp GRN-YYYY-NNNN; SoD cảnh báo nếu người nhận là buyer của PO. **Bảng:** R `po_line`; W `grn`, `grn_line`.
2. **FE:** nhập SL giao / nhận / loại, ảnh, người kiểm, chứng từ đã kiểm (CO/CQ, mill certificate). **BE:** kiểm tra chứng chỉ bắt buộc theo lô của Material ID. **Bảng:** R `material_cert_req`, `certificate`; W `grn_line`, `attachment`.
3. **BE:** On time = ngày nhận ≤ ngày hứa (đã được buyer chấp nhận); In full = SL accepted ≥ SL lịch giao. **Bảng:** W `grn_line` (on_time, in_full).
4. **BE:** SL loại > 0 → tạo NCR-YYYY-NNN với hành động Return / Replace / Accept with discount, thông báo NCC. **Bảng:** W `ncr`, `notification`.
5. **FE (portal):** NCC chọn Replace / Return and credit note / Offer a discount + comment. **BE:** nhắc NCC 1 ngày trước hạn, quá hạn → buyer. **Bảng:** W `ncr` (response), `notification`.
6. **BE:** NCR mở chặn match hóa đơn cho SL bị loại, SL đó vẫn mở trên PO; đóng NCR → cập nhật OTIF, NCR rate cho đánh giá NCC, lịch sử NCR trên Material 360°. **Bảng:** W `ncr` (Closed); R `grn_line`.

### L-15 · Thu nhận hóa đơn điện tử & 3-way match
- **Tác nhân:** Supplier, Finance approver, Procurement · **Màn hình:** SupplierPortal, Invoices, Approvals, Admin, PurchaseOrders · **Tính năng:** F-95, F-70 – F-75, F-66, F-104, F-107
1. **FE:** NCC "Submit e-invoice" (chọn GRN, loại Original / Adjustment / Replacement, XML + PDF) hoặc buyer "Fetch e-invoice inbox" / "Upload XML + PDF". **BE:** parse XML (mẫu số, ký hiệu, số 8 chữ số, ngày lập, MST bán/mua, Mã CQT, tiền), cấp INV-YYYY-NNNN. **Bảng:** W `invoice`, `invoice_line`, `attachment`.
2. **BE:** 6 kiểm tra pháp lý (Mã CQT + tra GDT, MST bán = vendor, MST mua = công ty, định dạng ký hiệu/số, liên kết hóa đơn gốc với điều chỉnh/thay thế, dòng ánh xạ Material ID); một lỗi → Blocked (INV-2026-0321). **Bảng:** R `vendor`, `po_line`; W `invoice` (legal_status).
3. **BE:** match từng dòng: SL hóa đơn so với SL GRN accepted (±2% cho tấn, m³; đơn vị đếm khớp tuyệt đối), giá so với giá PO (±0,5%); trừ SL NCR mở; SRV- dùng 2-way với SES. **Bảng:** R `po_line`, `grn_line`, `ncr`, `service_acceptance`, `policy`; W `match_result`.
4. **BE:** vượt dung sai → auto-hold, đưa vào hàng ngoại lệ của buyer, nhả cần Procurement Lead; giá lệch ghi Price history nguồn Invoice; leo thang sau 3 ngày làm việc. **FE:** Resolve / Request credit note / chuyển My approvals. **Bảng:** W `match_result`, `price_record`, `approval_task`, `notification`.
5. **BE:** Matched → "Mark ready for payment"; hạn = ngày hóa đơn + điều khoản NCC (30 ngày → 28/11/2026). **Bảng:** R `vendor`; W `invoice` (status, due_date).
6. **BE:** xuất kế toán hằng ngày 18:00 (PO, GRN, hóa đơn matched) với ánh xạ Material ID → mã hàng, vendor → mã NCC; dòng chưa map bị bỏ qua và báo lỗi, có Retry; trạng thái Paid lấy từ hệ thống kế toán. **Bảng:** R `material`, `vendor`; W `integration_log`, `invoice`.

### L-16 · Lịch sử giá & cảnh báo giá
- **Tác nhân:** Procurement · **Màn hình:** PriceHistory, Main, Material360, Admin · **Tính năng:** F-76 – F-80, F-08, F-105
1. **BE:** ghi bản ghi giá từ PO, bid (chỉ sau mở thầu), quotation, invoice (khi lệch PO); luôn trước VAT; ngoại tệ quy đổi VND theo tỷ giá và ngày. **Bảng:** W `price_record`.
2. **FE:** chọn Material ID, kỳ, NCC, nguồn. **BE:** giá cuối, TB 12 tháng có trọng số = Σ(giá × SL) ÷ Σ SL, min/max, % so với TB 90 ngày. **Bảng:** R `price_record`.
3. **FE:** biểu đồ giá TB tháng theo NCC, thẻ so sánh và bảng bản ghi kèm Δ so với PO trước và cờ sử dụng (Current baseline, Saving baseline). **Bảng:** R `price_record`.
4. **BE:** khi có giá mới lệch TB 90 ngày > ±5% → thông báo buyer danh mục và đưa vào "Price alerts by Material ID" trên Dashboard. **Bảng:** R `policy`; W `notification`.
5. **FE:** "Edit rule" đổi ngưỡng; "Export Excel". **Bảng:** W `policy`.

### L-17 · Dashboard
- **Tác nhân:** Procurement, Finance approver · **Màn hình:** Main · **Tính năng:** F-05 – F-09
1. **FE:** chọn Period / Category. **BE:** Spend YTD = Σ giá trị PO trước VAT (so với cùng kỳ), Saving YTD và tỷ lệ trên sourced spend (mục tiêu 4%), OTIF 90 ngày (mục tiêu 95%), PR mở, tender đang chạy. **Bảng:** R `purchase_order`, `saving_record`, `grn_line`, `purchase_request`, `tender`.
2. **BE:** chuỗi OTIF 12 tháng và chi tiêu theo danh mục (tỷ trọng, số NCC active). **Bảng:** R `grn_line`, `po_line`, `material`.
3. **FE:** "Action required" (Unread/Read, lọc loại). **BE:** gom task và thông báo của người dùng. **Bảng:** R `approval_task`, `notification`.
4. **BE:** tender sắp đóng (số bid / số mời) và cảnh báo giá ±5%. **Bảng:** R `tender`, `bid`, `price_record`.
5. **FE:** "Export report" / "New PR". **Bảng:** —.

### L-18 · Báo cáo OTIF & Saving
- **Tác nhân:** Procurement, Finance approver · **Màn hình:** Reports · **Tính năng:** F-81 – F-86
1. **FE:** lọc kỳ, danh mục, NCC, Material ID. **BE:** OTIF = số lần giao vừa đúng hạn vừa đủ ÷ tổng lần giao; một lần giao = một dòng lịch PO theo Material ID; in full theo SL accepted; dịch vụ SRV-: SLA đạt = in full. **Bảng:** R `po_line`, `grn_line`, `service_acceptance`.
2. **BE:** OTIF theo NCC, nhãn ≥ 95% On target, < 85% rủi ro. **Bảng:** R `grn_line`, `vendor`.
3. **BE:** Saving = (Baseline − Awarded) × Qty theo dòng Material ID; baseline = PO cuối cùng mã, dự phòng TB bid vòng 1; Cost avoidance báo riêng; Negotiation do Finance định giá. **Bảng:** R `price_record`, `bid_line`; W `saving_record`.
4. **FE:** Finance chuyển trạng thái Draft → Submitted → Validated; KPI hiện reported so với validated (8,9 / 9,7 tỷ). **Bảng:** W `saving_record` (validation_status, validated_by).
5. **BE:** top-5 NCC, off-contract (PO cho Material ID có HĐ hiệu lực với NCC khác), độ phủ HĐ, cycle time trung vị PR → PO. **Bảng:** R `po_line`, `contract_line`, `purchase_request`, `approval_task`.
6. **BE:** ngân sách theo dự án: Available = Budget − Invoiced − Committed (committed = giá trị PO mở chưa xuất hóa đơn). **FE:** Export Excel/PDF. **Bảng:** R `budget`, `purchase_order`, `invoice`.

### L-19 · Admin: người dùng, vai trò & chính sách
- **Tác nhân:** Admin (Finance approver cho dung sai) · **Màn hình:** Admin · **Tính năng:** F-99 – F-107
1. **FE:** "Invite user" (Gmail, vai trò, NCC nếu Supplier). **BE:** thêm allowlist, gửi lời mời hết hạn sau 7 ngày. **Bảng:** W `user_account` (Invited), `notification`, `audit_log`.
2. **FE:** Edit roles / Suspend. **BE:** Suspended chặn đăng nhập nhưng giữ lịch sử; đánh dấu người thiếu 2-step để yêu cầu lần đăng nhập tới. **Bảng:** W `user_account`, `role`.
3. **FE:** Access policy, Privacy notice (xuất bản v2.2 → mọi người chấp nhận lại). **BE:** xóa dữ liệu cá nhân giữ chứng từ kế toán, thay tên bằng user ID. **Bảng:** W `policy`, `user_account`.
4. **FE:** Approval matrix, Delegation policy, SoD rules, 3-way match tolerances, Notification rules. **BE:** kiểm tra giá trị hợp lệ (dải số, %), áp dụng ngay cho hồ sơ mới. **Bảng:** W `policy`.
5. **FE:** Categories, Evaluation templates, Numbering rules. **BE:** số đã hủy không tái sử dụng. **Bảng:** W `policy`, `evaluation_template`.
6. **FE:** Integrations: nhập mã hàng cho Material ID chưa map, Retry sync. **Bảng:** W `material` (accounting_code), `integration_log`.
7. **BE:** mọi thay đổi cài đặt ghi audit log (vd. idle timeout 60 → 30 phút). **Bảng:** W `audit_log`.

### L-20 · Thông báo & leo thang
- **Tác nhân:** hệ thống, mọi vai trò · **Màn hình:** Main, SupplierPortal, Admin, Certificates, Contracts · **Tính năng:** F-06, F-39, F-87, F-105, F-79
1. **BE:** các module phát sự kiện (PO gửi, chờ duyệt, tender sắp đóng, chứng chỉ/HĐ hết hạn, ngoại lệ hóa đơn, hạn NCR, cảnh báo giá). **Bảng:** W `notification`.
2. **BE (scheduler):** PO chưa xác nhận 48 h → nhắc NCC, 72 h → buyer; chờ duyệt tới hết SLA → người duyệt, +1 ngày làm việc → quản lý; tender 24 h trước đóng → NCC chưa nộp. **Bảng:** R `policy`, `purchase_order`, `approval_task`, `tender`, `bid`.
3. **BE:** chứng chỉ 60/30 ngày → NCC + buyer, hết hạn → Procurement Lead và gắn cờ NCC; HĐ 60/30 ngày → owner, 7 ngày → Procurement Lead; ngoại lệ hóa đơn ngay → buyer, 3 ngày làm việc → Procurement Lead; NCR 1 ngày trước → NCC, quá hạn → buyer. **Bảng:** R `certificate`, `contract`, `match_result`, `ncr`.
4. **BE:** gửi theo kênh In-app / Gmail / Portal; người dùng chọn digest 07:30. **Bảng:** R `user_account` (prefs).
5. **FE:** chuông số chưa đọc (6 nội bộ, 3 NCC), "Action required" / "Action needed", đánh dấu đã đọc. **Bảng:** W `notification` (read_at).
6. **BE:** mỗi lần leo thang ghi audit log ("System · Escalation rule"). **Bảng:** W `audit_log`.

### L-21 · Nhật ký kiểm toán
- **Tác nhân:** Admin (đọc), hệ thống (ghi) · **Màn hình:** Admin, Tenders, Approvals · **Tính năng:** F-108, F-43, F-60, F-103
1. **BE:** mọi hành động ghi (cài đặt, đăng nhập, nộp bid, mở thầu, override, xuất dữ liệu, leo thang) chèn một dòng: thời điểm, người, vai trò, hành động, đối tượng, chi tiết. **Bảng:** W `audit_log` (append-only).
2. **BE:** mở thầu hai người ghi cả hai tên ("Nguyễn Minh Anh + Đỗ Hoàng Nam"); SoD override bắt buộc lý do. **Bảng:** W `audit_log`.
3. **BE:** không cho sửa/xóa; lưu 10 năm; xóa dữ liệu cá nhân chỉ thay tên bằng user ID. **Bảng:** `audit_log`.
4. **FE:** Admin lọc theo người dùng và loại (Settings, Sign-in, Bids and tenders, Overrides), "Load more", "Export Excel". **Bảng:** R `audit_log`.
