/* ProcureLink i18n — dictionaries (vi default, en) + translate helpers.
   I18N.add({ key: ['English', 'Tiếng Việt'] }) registers a key in both dictionaries (pages add their own keys).
   I18N.values({ 'Data value': 'Giá trị' }) translates enumerated data values (statuses, types…) shown via App.tv / App.pill.
   App.t(key, params) / App.tv(value) are wired in js/app.js. Numbers and dates always use vi-VN formats. */
(function () {
  const dict = { en: {}, vi: {} };
  const vals = {};
  const warned = {};
  const dev = typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname || '');
  function add(entries) {
    Object.keys(entries).forEach((k) => {
      const v = entries[k];
      dict.en[k] = v[0];
      dict.vi[k] = v[1];
    });
  }
  function values(entries) { Object.assign(vals, entries); }
  const fill = (s, p) => (p ? String(s).replace(/\{(\w+)\}/g, (m, n) => (p[n] == null ? m : p[n])) : String(s));
  function t(lang, key, params) {
    const d = dict[lang] || dict.vi;
    let s = d[key];
    if (s == null) {
      s = dict.en[key];
      if (s == null) {
        s = key;
        if (dev && !warned[key] && /^[a-z0-9]+(\.[a-zA-Z0-9_-]+)+$/.test(key)) { warned[key] = 1; console.warn('[i18n] missing key', key); }
      }
    }
    return fill(s, params);
  }
  const pats = [];
  function patterns(list) { list.forEach((x) => pats.push(x)); }
  function tv(lang, s) {
    if (lang !== 'vi' || s == null) return s;
    const k = String(s);
    if (vals[k] != null) return vals[k];
    for (const [rx, rep] of pats) if (rx.test(k)) return k.replace(rx, rep);
    return k;
  }
  window.I18N = { dict, vals, add, values, patterns, t, tv };

  /* ---------- Shared keys: shell, navigation, common words ---------- */
  add({
    'app.name': ['ProcureLink', 'ProcureLink'],
    'ws.procurement': ['Procurement', 'Mua sắm'], 'ws.supplier': ['Supplier', 'Nhà cung cấp'], 'ws.admin': ['Admin', 'Quản trị'],
    'nav.g.overview': ['Overview', 'Tổng quan'], 'nav.g.vendors': ['Vendors', 'Nhà cung cấp'], 'nav.g.sourcing': ['Sourcing', 'Tìm nguồn'], 'nav.g.insights': ['Insights', 'Phân tích'],
    'nav.g.supplier': ['Supplier portal', 'Cổng nhà cung cấp'], 'nav.g.admin': ['Admin console', 'Quản trị hệ thống'],
    'nav.dashboard': ['Dashboard', 'Bảng điều khiển'], 'nav.approvals': ['My approvals', 'Chờ tôi duyệt'], 'nav.materials': ['Material IDs', 'Mã vật tư'], 'nav.material360': ['Material 360°', 'Vật tư 360°'],
    'nav.vendors': ['Vendors', 'Nhà cung cấp'], 'nav.evaluation': ['Vendor evaluation', 'Đánh giá NCC'], 'nav.contracts': ['Contracts', 'Hợp đồng'], 'nav.certificates': ['Certificates', 'Chứng chỉ'],
    'nav.tenders': ['Tenders', 'Đấu thầu'], 'nav.pr': ['Purchase requests', 'Đề nghị mua hàng'], 'nav.po': ['Purchase orders', 'Đơn đặt hàng'], 'nav.invoices': ['Invoices & matching', 'Hóa đơn & đối chiếu'],
    'nav.price': ['Price history', 'Lịch sử giá'], 'nav.reports': ['Reports', 'Báo cáo'], 'nav.notifications': ['Notifications', 'Thông báo'], 'nav.search': ['Search', 'Tìm kiếm'],
    'nav.s.overview': ['Overview', 'Tổng quan'], 'nav.s.invitations': ['Invitations to bid', 'Thư mời thầu'], 'nav.s.quotations': ['My quotations', 'Báo giá của tôi'], 'nav.s.pos': ['Purchase orders', 'Đơn đặt hàng'],
    'nav.s.deliveries': ['Deliveries', 'Giao hàng'], 'nav.s.invoices': ['Invoices', 'Hóa đơn'], 'nav.s.contracts': ['Contracts', 'Hợp đồng'], 'nav.s.certificates': ['Certificates', 'Chứng chỉ'],
    'nav.s.scorecard': ['Scorecard', 'Bảng điểm'], 'nav.s.profile': ['Company profile', 'Hồ sơ công ty'],
    'nav.a.users': ['Users & roles', 'Người dùng & vai trò'], 'nav.a.access': ['Access policy', 'Chính sách truy cập'], 'nav.a.matrix': ['Approval matrix', 'Ma trận phê duyệt'], 'nav.a.materials': ['Material master', 'Danh mục vật tư'],
    'nav.a.categories': ['Categories', 'Nhóm hàng'], 'nav.a.templates': ['Evaluation templates', 'Mẫu tiêu chí đánh giá'], 'nav.a.numbering': ['Numbering & ID rules', 'Quy tắc đánh số'], 'nav.a.tolerances': ['Match tolerances', 'Dung sai đối chiếu'],
    'nav.a.integrations': ['Integrations', 'Tích hợp'], 'nav.a.rules': ['Notification rules', 'Quy tắc thông báo'], 'nav.a.sod': ['SoD rules', 'Quy tắc SoD'], 'nav.a.audit': ['Audit log', 'Nhật ký'],
    'nav.adminConsole': ['Admin console', 'Quản trị hệ thống'], 'nav.back': ['Back to Procurement', 'Về Mua sắm'], 'nav.switch': ['Switch workspace', 'Đổi không gian làm việc'], 'nav.main': ['Main', 'Điều hướng chính'],
    'shell.skip': ['Skip to content', 'Bỏ qua đến nội dung'], 'shell.search': ['Search', 'Tìm kiếm'], 'shell.searchPh': ['Search Material ID, PR, PO, tender, vendor…  ( / )', 'Tìm mã vật tư, PR, PO, gói thầu, NCC…  ( / )'],
    'shell.openMenu': ['Open menu', 'Mở menu'], 'shell.closeMenu': ['Close menu', 'Đóng menu'], 'shell.notifs': ['Notifications, {n} unread', 'Thông báo, {n} chưa đọc'], 'shell.waiting': ['{n} waiting', '{n} đang chờ'],
    'shell.lang': ['Language: English. Switch to Vietnamese', 'Ngôn ngữ: Tiếng Việt. Chuyển sang tiếng Anh'], 'shell.subnav': ['Sections', 'Chức năng con'],
    'shell.noAccess': ['No access: “{title}” is not available in the {ws} workspace. You were taken to your home page.', 'Không có quyền: “{title}” không có trong không gian {ws}. Bạn đã được chuyển về trang chính.'],
    'shell.notBuilt': ['Not available', 'Chưa có màn hình'], 'shell.notBuiltNote': ['Screen {route} does not exist.', 'Màn hình {route} không tồn tại.'],
    'shell.crash': ['This screen could not be displayed ({route}). Other screens still work.', 'Không thể hiển thị màn hình này ({route}). Các màn hình khác vẫn hoạt động.'],
    'shell.unknownSub': ['Section “{sub}” does not exist — showing {first}.', 'Không có mục “{sub}” — đang hiển thị {first}.'],
    'shell.goHome': ['Go to home page', 'Về trang chính'],
    'c.all': ['All', 'Tất cả'], 'c.allOf': ['{label}: all', '{label}: tất cả'], 'c.search': ['Search', 'Tìm kiếm'], 'c.status': ['Status', 'Trạng thái'], 'c.category': ['Category', 'Nhóm hàng'],
    'c.vendor': ['Vendor', 'Nhà cung cấp'], 'c.vendors': ['Vendors', 'Nhà cung cấp'], 'c.mid': ['Material ID', 'Mã vật tư'], 'c.mids': ['Material IDs', 'Mã vật tư'], 'c.description': ['Description', 'Mô tả'],
    'c.number': ['Number', 'Số chứng từ'], 'c.title': ['Title', 'Tiêu đề'], 'c.date': ['Date', 'Ngày'], 'c.value': ['Value', 'Giá trị'], 'c.type': ['Type', 'Loại'], 'c.file': ['File', 'Tệp'],
    'c.version': ['Version', 'Phiên bản'], 'c.uploaded': ['Uploaded', 'Tải lên'], 'c.owner': ['Owner', 'Phụ trách'], 'c.actions': ['Actions', 'Thao tác'], 'c.score': ['Score', 'Điểm'],
    'c.lastPrice': ['Last price', 'Giá gần nhất'], 'c.leadTime': ['Lead time', 'Thời gian giao'], 'c.days': ['{n} days', '{n} ngày'], 'c.uom': ['UoM', 'ĐVT'],
    'c.cancel': ['Cancel', 'Hủy'], 'c.close': ['Close', 'Đóng'], 'c.save': ['Save', 'Lưu'], 'c.saveDraft': ['Save draft', 'Lưu nháp'], 'c.edit': ['Edit', 'Sửa'], 'c.delete': ['Delete', 'Xóa'],
    'c.remove': ['Remove', 'Gỡ'], 'c.open': ['Open', 'Mở'], 'c.export': ['Export', 'Xuất Excel'], 'c.import': ['Import Excel', 'Nhập Excel'], 'c.upload': ['Upload', 'Tải lên'], 'c.reject': ['Reject', 'Từ chối'],
    'c.none': ['None', 'Không có'], 'c.noneOpt': ['— none —', '— không —'], 'c.choose': ['— choose —', '— chọn —'], 'c.yes': ['Yes', 'Có'], 'c.no': ['No', 'Không'],
    'c.noRecords': ['No records', 'Không có dữ liệu'], 'c.loading': ['Loading…', 'Đang tải…'], 'c.table': ['Table', 'Bảng'], 'c.scrolls': ['{label}, scrolls horizontally', '{label}, cuộn ngang'],
    'c.exclVat': ['excl. VAT', 'chưa VAT'], 'c.pricesExcl': ['Prices excl. VAT.', 'Giá chưa VAT.'], 'c.inSample': ['{n} in this sample', '{n} trong dữ liệu mẫu'], 'c.showing': ['Showing {n} of {total} (sample loaded)', 'Hiển thị {n} / {total} (dữ liệu mẫu)'],
    'c.allCats': ['All categories', 'Tất cả nhóm hàng'], 'c.required': ['required', 'bắt buộc'], 'c.back': ['Back', 'Quay lại'], 'c.period': ['Period', 'Kỳ'], 'c.done': ['Done', 'Đã xong'],
    'c.exported': ['Exported {n} rows to Excel', 'Đã xuất {n} dòng ra Excel'], 'c.dateFmt': ['Use dd/mm/yyyy.', 'Nhập theo dạng dd/mm/yyyy.'], 'c.target': ['Target {v}', 'Mục tiêu {v}'],
    'cat.CON': ['Construction', 'Xây dựng'], 'cat.EQP': ['Equipment', 'Thiết bị'], 'cat.SRV': ['Services', 'Dịch vụ'], 'cat.LOG': ['Logistics', 'Logistics'],
    'doc.PR': ['PRs', 'PR'], 'doc.TND': ['Tenders', 'Gói thầu'], 'doc.PO': ['POs', 'PO'], 'doc.GRN': ['Deliveries', 'Giao hàng'], 'doc.CT': ['Contracts', 'Hợp đồng'], 'doc.INV': ['Invoices', 'Hóa đơn'], 'doc.NCR': ['NCRs', 'NCR'],
    'login.title': ['Sign in', 'Đăng nhập']
  });

  /* Legacy English-text keys still used by pages not yet migrated (tenders, pr, po, invoices, approvals, price, reports, supplier, admin). */
  add({
    Overview: ['Overview', 'Tổng quan'], Dashboard: ['Dashboard', 'Bảng điều khiển'], 'My approvals': ['My approvals', 'Chờ tôi duyệt'], 'Material IDs': ['Material IDs', 'Mã vật tư'], 'Material 360°': ['Material 360°', 'Vật tư 360°'],
    Vendors: ['Vendors', 'Nhà cung cấp'], 'Vendor evaluation': ['Vendor evaluation', 'Đánh giá NCC'], Contracts: ['Contracts', 'Hợp đồng'], Certificates: ['Certificates', 'Chứng chỉ'], Tenders: ['Tenders', 'Đấu thầu'],
    'Purchase requests': ['Purchase requests', 'Đề nghị mua hàng'], 'Purchase orders': ['Purchase orders', 'Đơn đặt hàng'], 'Invoices & matching': ['Invoices & matching', 'Hóa đơn & đối chiếu'], 'Price history': ['Price history', 'Lịch sử giá'], Reports: ['Reports', 'Báo cáo'],
    'Invitations to bid': ['Invitations to bid', 'Thư mời thầu'], 'My quotations': ['My quotations', 'Báo giá của tôi'], Deliveries: ['Deliveries', 'Giao hàng'], Invoices: ['Invoices', 'Hóa đơn'], Scorecard: ['Scorecard', 'Bảng điểm'], 'Company profile': ['Company profile', 'Hồ sơ công ty'],
    'Admin console': ['Admin console', 'Quản trị hệ thống'], 'Users & roles': ['Users & roles', 'Người dùng & vai trò'], 'Access policy': ['Access policy', 'Chính sách truy cập'], 'Approval matrix': ['Approval matrix', 'Ma trận phê duyệt'], 'Material master': ['Material master', 'Danh mục vật tư'], Categories: ['Categories', 'Nhóm hàng'],
    'Evaluation templates': ['Evaluation templates', 'Mẫu tiêu chí đánh giá'], 'Numbering & ID rules': ['Numbering & ID rules', 'Quy tắc đánh số'], Integrations: ['Integrations', 'Tích hợp'], 'Notification rules': ['Notification rules', 'Quy tắc thông báo'], 'SoD rules': ['SoD rules', 'Quy tắc SoD'], 'Audit log': ['Audit log', 'Nhật ký'], 'Match tolerances': ['Match tolerances', 'Dung sai đối chiếu'],
    'New tender': ['New tender', 'Gói thầu mới'], 'Create PR': ['Create PR', 'Tạo đề nghị mua hàng'], 'No access': ['No access', 'Không có quyền truy cập']
  });

  /* Patterned data text (scorecard evidence, off-contract reasons) → Vietnamese */
  patterns([
    [/^(\d+) POs · (\d+) Material IDs?$/, '$1 PO · $2 mã vật tư'],
    [/^NCR rate (\d+) \/ (\d+) POs · ([\d,]+)% accepted qty$/, 'Tỷ lệ NCR $1 / $2 PO · $3% SL chấp nhận'],
    [/^No NCR · 100% accepted qty$/, 'Không có NCR · 100% SL chấp nhận'],
    [/^OTIF ([\d,]+)% by accepted qty(.*)$/, 'OTIF $1% theo SL chấp nhận$2'],
    [/^([A-Z]{3}-\d+) ([+−-][\d,]+)% vs 90-day average$/, '$1 $2% so với BQ 90 ngày'],
    [/^Avg\. tender response ([\d,]+) days$/, 'Phản hồi thầu TB $1 ngày'],
    [/^(CT-[\d-]+) expired (\S+)$/, '$1 hết hạn $2'],
    [/^Release from (CT-[\d-]+) \(Q4 price (.*)\)$/, 'Phát hành từ $1 (giá Q4 $2)'],
    [/^Release (CT-[\d-]+)(.*)$/, 'Phát hành $1$2'],
    [/^Onboarding rejected: (.*)$/, 'Từ chối hồ sơ: $1'],
    [/^(.*) \(portal\)$/, '$1 (cổng NCC)']
  ]);

  /* ---------- Enumerated data values (statuses, types, labels stored in DATA) → Vietnamese ---------- */
  values({
    Active: 'Đang hoạt động', 'Pending approval': 'Chờ duyệt', Draft: 'Nháp', Blocked: 'Bị chặn', Preferred: 'Ưu tiên', Approved: 'Đã duyệt', Probation: 'Theo dõi',
    Low: 'Thấp', Medium: 'Trung bình', High: 'Cao', Pending: 'Đang chờ', Proposed: 'Đề xuất', Verified: 'Đã xác minh', 'Not verified': 'Chưa xác minh', 'Not checked': 'Chưa kiểm tra',
    Valid: 'Còn hiệu lực', Expiring: 'Sắp hết hạn', Expired: 'Hết hạn', 'Pending review': 'Chờ xem xét', Rejected: 'Bị từ chối', Superseded: 'Đã thay thế', 'Pending signature': 'Chờ ký',
    Submitted: 'Đã nộp', 'Not started': 'Chưa bắt đầu', Open: 'Đang mở', Closed: 'Đã đóng', Awarded: 'Đã trao thầu', Evaluation: 'Đánh giá', 'Q&A': 'Hỏi đáp', Cancelled: 'Đã hủy',
    'Awaiting approval': 'Chờ phê duyệt', 'In tender': 'Đang đấu thầu', Delivered: 'Đã giao', 'Partially received': 'Nhận một phần', 'Sent · not confirmed': 'Đã gửi · chưa xác nhận',
    Confirmed: 'Đã xác nhận', 'Not confirmed': 'Chưa xác nhận', Accepted: 'Đã chấp nhận', Matched: 'Đã khớp', 'Ready for payment': 'Sẵn sàng thanh toán', 'Awaiting supplier': 'Chờ NCC',
    'Blocked · legal check': 'Bị chặn · kiểm tra pháp lý', 'Exception · price +2,7%': 'Ngoại lệ · giá +2,7%', 'Exception · price +1,2%': 'Ngoại lệ · giá +1,2%', Validated: 'Đã kiểm tra', Sent: 'Đã gửi',
    'Accepted with NCR': 'Chấp nhận kèm NCR', 'Rejected with NCR': 'Từ chối kèm NCR', 'Closed · accepted with discount': 'Đã đóng · chấp nhận có chiết khấu', OK: 'Đạt', Missing: 'Thiếu', Invited: 'Đã mời',
    Construction: 'Xây dựng', Equipment: 'Thiết bị', Services: 'Dịch vụ', Logistics: 'Logistics', 'Equipment / Services': 'Thiết bị / Dịch vụ',
    'PR approval': 'Duyệt PR', 'PO overdue': 'PO quá hạn', 'Invoice exception': 'Ngoại lệ hóa đơn', Tender: 'Gói thầu', 'Price alert': 'Cảnh báo giá', Certificate: 'Chứng chỉ', Delivery: 'Giao hàng',
    Review: 'Xem xét', 'Follow up': 'Theo dõi', Resolve: 'Xử lý', Evaluate: 'Đánh giá',
    Framework: 'Khung', 'Fixed price': 'Giá cố định', 'Service SLA': 'Dịch vụ SLA', 'Rate card': 'Bảng đơn giá',
    'Signed contract': 'Hợp đồng đã ký', 'Phụ lục (amendment)': 'Phụ lục', 'Performance security': 'Bảo đảm thực hiện HĐ', 'Specification / drawing': 'Thông số / bản vẽ', Quotation: 'Báo giá',
    'Mill certificate': 'Chứng chỉ xuất xưởng', 'Biên bản giao nhận': 'Biên bản giao nhận', 'Quotation letter': 'Thư báo giá', 'Draft contract': 'Dự thảo hợp đồng', 'Signed PO': 'PO đã ký',
    Signed: 'Đã ký', Uploaded: 'Đã tải lên', 'Uploaded by supplier': 'NCC tải lên', 'Spec sheet': 'Bảng thông số', Datasheet: 'Tài liệu kỹ thuật', Drawing: 'Bản vẽ',
    'Draft · not sent for signature': 'Nháp · chưa gửi ký', 'Sent for e-signature 28/10/2026 · waiting for vendor': 'Đã gửi ký điện tử 28/10/2026 · chờ NCC',
    'E-signed v3 · 05/01/2026': 'Đã ký điện tử v3 · 05/01/2026', 'E-signed v2 · 28/12/2025': 'Đã ký điện tử v2 · 28/12/2025', 'E-signed v1 · 28/09/2025': 'Đã ký điện tử v1 · 28/09/2025', 'E-signed v1 · 25/03/2026': 'Đã ký điện tử v1 · 25/03/2026',
    Diameter: 'Đường kính', Grade: 'Mác', Standard: 'Tiêu chuẩn', Length: 'Chiều dài', Type: 'Loại', Packing: 'Đóng gói', Slump: 'Độ sụt', 'Max aggregate': 'Cốt liệu tối đa', Power: 'Công suất',
    Voltage: 'Điện áp', Enclosure: 'Vỏ máy', Flow: 'Lưu lượng', Head: 'Cột áp', Pressure: 'Áp suất', 'Rated current': 'Dòng định mức', Input: 'Đầu vào', Scope: 'Phạm vi', 'Response SLA': 'SLA phản hồi',
    Area: 'Diện tích', Shifts: 'Ca làm', Boom: 'Cần bơm', Shift: 'Ca', Route: 'Tuyến', Container: 'Container', Location: 'Địa điểm', 'Blocked reason': 'Lý do chặn',
    'At GRN': 'Khi nhập kho (GRN)', 'Valid on PO date': 'Còn hiệu lực ngày PO', 'At tender and PO date': 'Khi mời thầu và ngày PO', 'CO/CQ per lot': 'CO/CQ theo lô', 'CO/CQ per unit': 'CO/CQ theo thiết bị', 'Test report': 'Biên bản thử nghiệm',
    'Step 1 of 3': 'Bước 1/3', 'Step 2 of 3': 'Bước 2/3', 'Step 3 of 3': 'Bước 3/3',
    'Procurement Lead': 'Trưởng phòng Mua sắm', 'Buyer – Equipment': 'Chuyên viên mua – Thiết bị', 'Buyer – Services & Logistics': 'Chuyên viên mua – Dịch vụ & Logistics', 'Finance Director (approver)': 'Giám đốc Tài chính (phê duyệt)', 'System Admin': 'Quản trị hệ thống',
    '30 days': '30 ngày', '45 days': '45 ngày', '60 days': '60 ngày', '30 days · advance 30% / 70%': '30 ngày · tạm ứng 30% / 70%',
    Payment: 'Thanh toán', Delivery_: 'Giao hàng', Warranty: 'Bảo hành', Penalty: 'Phạt', 'Price adjustment': 'Điều chỉnh giá',
    'Company & MST check': 'Kiểm tra công ty & MST', 'Legal representative': 'Người đại diện pháp luật', 'Giấy CNĐKDN upload': 'Tải lên Giấy CNĐKDN', 'Bank account': 'Tài khoản ngân hàng', Categories: 'Nhóm hàng',
    'Material IDs offered': 'Mã vật tư đề xuất', Certificates: 'Chứng chỉ', 'Code-of-conduct acceptance': 'Chấp nhận Bộ quy tắc ứng xử',
    'Q1/2026': 'Q1/2026', 'Q2/2026': 'Q2/2026', 'Q3/2026': 'Q3/2026',
    /* free text that appears on the main screens (notifications, change log, risk factors) */
    'PR-2026-0431 Máy phát điện 500kVA waits for your approval (1,85 tỷ ₫)': 'PR-2026-0431 Máy phát điện 500kVA đang chờ bạn duyệt (1,85 tỷ ₫)',
    'PO-2026-0869 not confirmed by Đại Phong — 3 days overdue, escalated to buyer': 'PO-2026-0869 chưa được Đại Phong xác nhận — trễ 3 ngày, đã chuyển cấp cho người mua',
    'INV-2026-0322 Sao Việt — unit price +2,7% vs PO-2026-0874 (tolerance ±0,5%)': 'INV-2026-0322 Sao Việt — đơn giá +2,7% so với PO-2026-0874 (dung sai ±0,5%)',
    'TND-2026-031 closes 05/11/2026 17:00 · 4 of 5 bids received · sealed': 'TND-2026-031 đóng thầu 05/11/2026 17:00 · đã nhận 4/5 hồ sơ · niêm phong',
    'TND-2026-029 award recommendation due 04/11/2026 — submit the Tờ trình': 'TND-2026-029 hạn đề xuất trao thầu 04/11/2026 — nộp Tờ trình',
    'LOG-61012 last price 18.500.000 ₫ is +8,9% vs 90-day average': 'LOG-61012 giá gần nhất 18.500.000 ₫ cao hơn 8,9% so với bình quân 90 ngày',
    'ISO 9001 of CTCP Kim khí Bắc Sơn expired 15/10/2026 — vendor blocked for CON-24015': 'ISO 9001 của CTCP Kim khí Bắc Sơn hết hạn 15/10/2026 — NCC bị chặn với CON-24015',
    'GRN-2026-1532 received 50 tấn CON-24015 on time & in full': 'GRN-2026-1532 đã nhận 50 tấn CON-24015 đúng hạn & đủ số lượng',
    'CON-24102 last price 1.680.000 ₫ is +6,4% vs 90-day average': 'CON-24102 giá gần nhất 1.680.000 ₫ cao hơn 6,4% so với bình quân 90 ngày',
    'Step 1 approved (Requester → Material master owner) · duplicate check passed': 'Duyệt bước 1 (Người đề nghị → Chủ quản danh mục) · kiểm tra trùng đạt',
    'Submitted for approval · number reserved': 'Đã gửi duyệt · đã giữ số', 'Alt-UoM added: 1 tấn = 54 cây': 'Thêm ĐVT quy đổi: 1 tấn = 54 cây',
    'Blocked · duplicate of LOG-61012 (number not reused)': 'Bị chặn · trùng LOG-61012 (không dùng lại số)', 'VAT 8% (reduced, until 31/12/2026) confirmed by Finance': 'Tài chính đã xác nhận VAT 8% (giảm, đến 31/12/2026)',
    'Saved as draft': 'Đã lưu nháp', 'Submitted for approval · number reserved · routed to Material master owner': 'Đã gửi duyệt · đã giữ số · chuyển Chủ quản danh mục',
    'Single source for LOG-61012 and LOG-61045': 'Một nguồn duy nhất cho LOG-61012 và LOG-61045', 'OTIF 86,7% (below 90% watch level)': 'OTIF 86,7% (dưới ngưỡng theo dõi 90%)',
    'INV-2026-0322 price exception +2,7%': 'INV-2026-0322 ngoại lệ giá +2,7%', 'Single source for EQP-31007': 'Một nguồn duy nhất cho EQP-31007',
    'PO-2026-0869 not confirmed · 3 days overdue': 'PO-2026-0869 chưa xác nhận · trễ 3 ngày', 'ISO 9001 expires 28/11/2026': 'ISO 9001 hết hạn 28/11/2026',
    'Onboarding review in progress': 'Đang xét duyệt hồ sơ', 'NCR-2026-017 awaiting supplier (CON-24020 · minor)': 'NCR-2026-017 chờ NCC (CON-24020 · nhẹ)',
    'NCR-2026-014 open (CON-24102 · 5 tấn bao rách)': 'NCR-2026-014 đang mở (CON-24102 · 5 tấn bao rách)', 'ISO 9001 expired 15/10/2026 (mandatory for CON-24015)': 'ISO 9001 hết hạn 15/10/2026 (bắt buộc cho CON-24015)',
    'OTIF 84,0% < 85%': 'OTIF 84,0% < 85%', 'INV-2026-0321 blocked · legal check': 'INV-2026-0321 bị chặn · kiểm tra pháp lý', 'Hợp quy QCVN 7 expires 20/11/2026': 'Hợp quy QCVN 7 hết hạn 20/11/2026',
    'New vendor · not yet assessed': 'NCC mới · chưa đánh giá', 'ISO 9001 expired 15/10/2026': 'ISO 9001 hết hạn 15/10/2026',
    'Calculated from POs, GRNs, NCRs and bids in the period': 'Tính từ PO, GRN, NCR và hồ sơ thầu trong kỳ', 'Evaluator judgement': 'Đánh giá của người chấm', Manual: 'Thủ công',
    'Auto · NCR rate & accepted qty': 'Tự động · tỷ lệ NCR & SL chấp nhận', 'Auto · PO deliveries (in full = accepted qty)': 'Tự động · giao hàng PO (đủ = SL chấp nhận)',
    'Auto · price by Material ID vs 90-day average': 'Tự động · giá theo mã vật tư so với BQ 90 ngày', 'Auto · tender response time': 'Tự động · thời gian phản hồi thầu',
    'Quality (NCR rate)': 'Chất lượng (tỷ lệ NCR)', 'Delivery (OTIF)': 'Giao hàng (OTIF)', Price: 'Giá', Responsiveness: 'Mức độ phản hồi', 'Documentation & compliance': 'Hồ sơ & tuân thủ', 'HSE compliance': 'Tuân thủ HSE',
    'Technical support': 'Hỗ trợ kỹ thuật', 'Warranty service': 'Dịch vụ bảo hành', 'Service quality (SLA)': 'Chất lượng dịch vụ (SLA)', 'Response time': 'Thời gian phản hồi', Safety: 'An toàn',
    'Preferred vendor': 'NCC ưu tiên', 'Approved vendor': 'NCC đã duyệt', 'Improvement plan': 'Kế hoạch cải tiến', 'Review / block': 'Xem xét / chặn',
    'Construction materials': 'Vật tư xây dựng', 'Equipment & spare parts': 'Thiết bị & phụ tùng', 'Services & logistics': 'Dịch vụ & logistics',
    Quality: 'Chất lượng', 'Price competitiveness': 'Cạnh tranh về giá', 'Commercial terms': 'Điều khoản thương mại', HSE: 'HSE', 'SLA / on-time service': 'SLA / dịch vụ đúng hạn',
    'Late delivery penalty': 'Phạt giao trễ', Incoterms: 'Incoterms', 'Spare parts': 'Phụ tùng', '30 days after invoice': '30 ngày sau hóa đơn', '0,1% per day, max 8%': '0,1%/ngày, tối đa 8%',
    'Replace defective lot within 7 days': 'Đổi lô lỗi trong 7 ngày', 'DAP site (Nhà xưởng C2 / Kho B)': 'DAP công trường (Nhà xưởng C2 / Kho B)', '500.000 ₫ per trip per day': '500.000 ₫/chuyến/ngày',
    'Door to door': 'Giao tận nơi', 'Monthly, 30 days': 'Hằng tháng, 30 ngày', '4 hours · penalty 2% of monthly fee per breach': '4 giờ · phạt 2% phí tháng mỗi lần vi phạm',
    '30 days after each visit': '30 ngày sau mỗi lần bảo trì', '8 hours on site': '8 giờ có mặt tại hiện trường', 'Billed at list price −10%': 'Tính theo giá niêm yết −10%', 'DAP site': 'DAP công trường',
    'Steel price index clause: max ±5% per quarter. Q4 index −6,8% → −5,0% applied by Phụ lục 01 (01/10/2026). PO price may not exceed the current contract price.': 'Điều khoản chỉ số giá thép: tối đa ±5%/quý. Chỉ số Q4 −6,8% → áp dụng −5,0% theo Phụ lục 01 (01/10/2026). Giá PO không được vượt giá hợp đồng hiện hành.',
    'Fuel surcharge reviewed quarterly, max ±3%.': 'Phụ phí nhiên liệu xem xét hằng quý, tối đa ±3%.', 'Fixed monthly fee for the term.': 'Phí cố định hằng tháng trong suốt thời hạn.',
    'Fixed price per quarterly service visit.': 'Giá cố định cho mỗi lần bảo trì hằng quý.', 'Fixed price for the term.': 'Giá cố định trong suốt thời hạn.', '—': '—',
    'Extension requested 28/10/2026': 'Đã yêu cầu gia hạn 28/10/2026', '+ 202 trips released before 2026 (history)': '+ 202 chuyến đã phát hành trước 2026 (lịch sử)',
    'Evaluation due 04/11/2026': 'Hạn đánh giá 04/11/2026', 'Sealed until 05/11/2026 17:00': 'Niêm phong đến 05/11/2026 17:00', '8% reduction ends 31/12/2026 — rate is set at invoice date': 'Giảm 8% kết thúc 31/12/2026 — thuế suất xác định theo ngày hóa đơn',
    'NCR-2026-014 open · 5 tấn rejected': 'NCR-2026-014 đang mở · 5 tấn bị loại', '3 days overdue': 'Trễ 3 ngày', 'GRN-2026-1532 50 tấn 28/10 · 30 tấn due 06/11 · Rev.2 pending': 'GRN-2026-1532 50 tấn 28/10 · 30 tấn hạn 06/11 · Rev.2 chờ',
    'Thép D16 · 50 tấn on time & in full': 'Thép D16 · 50 tấn đúng hạn & đủ', 'Thép D20 · lô 2 · 15 tấn quarantined (thiếu CQ)': 'Thép D20 · lô 2 · 15 tấn cách ly (thiếu CQ)', 'Expired 30/09/2026': 'Hết hạn 30/09/2026', 'Expires 31/12/2026': 'Hết hạn 31/12/2026',
    '1.200 tấn commitment · 640 tấn released · 01/01–31/12/2026': 'Cam kết 1.200 tấn · đã phát hành 640 tấn · 01/01–31/12/2026', 'Generator maintenance – Đại Phong': 'Bảo trì máy phát – Đại Phong',
    'Confirm within 48 h · due 03/11/2026 16:00': 'Xác nhận trong 48 giờ · hạn 03/11/2026 16:00', 'Rev.1 re-confirmed': 'Rev.1 đã xác nhận lại', 'Supplier confirms within 48 h (03/11/2026 16:00)': 'NCC xác nhận trong 48 giờ (03/11/2026 16:00)',
    'Reminder at 48 h (31/10) · escalated to the buyer at 72 h · 3 days overdue': 'Nhắc ở 48 giờ (31/10) · chuyển người mua ở 72 giờ · trễ 3 ngày',
    'Other vendor': 'NCC khác', 'Spot PO, not released from the contract': 'PO lẻ, không phát hành từ hợp đồng',
    'Fixed price – Xi măng An Khang 2025–2026': 'Giá cố định – Xi măng An Khang 2025–2026', 'Rate card Logistics Sao Việt': 'Bảng đơn giá Logistics Sao Việt',
    'Framework – Thép Minh Phát 2026': 'Hợp đồng khung – Thép Minh Phát 2026', 'HVAC maintenance SLA – Hưng Long': 'SLA bảo trì HVAC – Hưng Long',
    'Holder name does not match the vendor master': 'Tên chủ sở hữu không khớp hồ sơ NCC', 'Scope does not cover the Material ID': 'Phạm vi không bao gồm mã vật tư', 'Certificate expired or dates unreadable': 'Chứng chỉ hết hạn hoặc ngày không đọc được',
    'Certification body not accredited': 'Tổ chức chứng nhận chưa được công nhận', 'Other (see comment)': 'Khác (xem ghi chú)'
  });
})();
