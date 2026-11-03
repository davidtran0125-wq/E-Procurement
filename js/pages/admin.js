/* Module 16 · Admin console (batch 3 layout) — F-99 users & roles (allowlist, consent, export / delete personal data, R-25), F-100 access policy, F-101 privacy notice versions,
   F-102 approval matrix + delegation policy + capex rule (R-06), F-103 SoD rules + override log (R-18), F-104 3-way match tolerances (R-02),
   F-105 notification rules + daily digest (R-15), F-106 categories, templates (evaluation.js) and numbering rules, F-107 integrations & code mappings (R-20), F-108 audit log.
   Every change writes the audit log (App.src.audit, as an i18n key) and edits the shared DATA used by the procurement screens.
   Routes: #/admin/users(/invites|/privacy) · /access(/allowlist|/privacy) · /matrix(/delegation) · /categories · /numbering · /tolerances
   · /integrations(/mappings|/log) · /rules · /sod(/overrides) · /audit */
(function () {
  const { esc, num, vnd, pill, table, kpi, block, layout, t, tv } = App;
  const S = App.src;
  const D = () => window.DATA;

  I18N.add({
    'ad.u.sub': ['Sign-in with Gmail (allowlist) · roles Procurement / Supplier / Admin · personal data under Luật BVDLCN 91/2025/QH15', 'Đăng nhập bằng Gmail (danh sách cho phép) · vai trò Mua sắm / Nhà cung cấp / Quản trị · dữ liệu cá nhân theo Luật BVDLCN 91/2025/QH15'],
    'ad.u.list': ['Users', 'Người dùng'], 'ad.u.invites': ['Invitations', 'Lời mời'], 'ad.u.privacy': ['Personal data', 'Dữ liệu cá nhân'],
    'ad.k.active': ['Active users', 'Người dùng hoạt động'], 'ad.k.invites': ['Pending invitations', 'Lời mời đang chờ'], 'ad.k.susp': ['Suspended', 'Bị tạm ngưng'], 'ad.k.no2': ['2-step not enabled', 'Chưa bật xác minh 2 bước'],
    'ad.k.no2N': ['Required for Admin / Approver / Finance', 'Bắt buộc với Quản trị / Người duyệt / Tài chính'], 'ad.k.dsr': ['Open data requests', 'Yêu cầu dữ liệu đang mở'],
    'ad.u.title': ['Users ({n})', 'Người dùng ({n})'], 'ad.u.search': ['Search users', 'Tìm người dùng'], 'ad.u.searchPh': ['Search name or Gmail', 'Tìm tên hoặc Gmail'],
    'ad.f.role': ['Role', 'Vai trò'], 'ad.f.allRoles': ['All roles', 'Mọi vai trò'], 'ad.f.allSt': ['All statuses', 'Mọi trạng thái'], 'ad.f.two': ['2-step', 'Xác minh 2 bước'], 'ad.f.twoAny': ['2-step: any', '2 bước: tất cả'], 'ad.f.twoOn': ['2-step on', 'Đã bật 2 bước'], 'ad.f.twoOff': ['2-step off', 'Chưa bật 2 bước'],
    'ad.c.user': ['User', 'Người dùng'], 'ad.c.roles': ['Roles', 'Vai trò'], 'ad.c.consent': ['Privacy consent', 'Đồng ý bảo mật'], 'ad.on': ['On', 'Bật'], 'ad.off': ['Off', 'Tắt'],
    'ad.invited': ['Invited {d}', 'Mời ngày {d}'], 'ad.anon': ['Anonymised', 'Đã ẩn danh'], 'ad.u.none': ['No users match', 'Không có người dùng phù hợp'],
    'ad.a.edit': ['Edit roles', 'Sửa vai trò'], 'ad.a.susp': ['Suspend', 'Tạm ngưng'], 'ad.a.react': ['Reactivate', 'Kích hoạt lại'], 'ad.a.export': ['Export data', 'Xuất dữ liệu'], 'ad.a.del': ['Delete data', 'Xóa dữ liệu'],
    'ad.e.title': ['Edit roles · {n}', 'Sửa vai trò · {n}'], 'ad.e.two': ['2-step verification enforced', 'Bắt buộc xác minh 2 bước'], 'ad.e.save': ['Save roles', 'Lưu vai trò'],
    'ad.e.keep': ['Keep at least one role (or suspend the user).', 'Giữ ít nhất một vai trò (hoặc tạm ngưng người dùng).'], 'ad.e.self': ['You cannot remove your own Admin role.', 'Bạn không thể gỡ vai trò Quản trị của chính mình.'],
    'ad.i.title': ['Invite user', 'Mời người dùng'], 'ad.i.email': ['Gmail address', 'Địa chỉ Gmail'], 'ad.i.emailH': ['Gmail or the Workspace domain; added to the allowlist', 'Gmail hoặc tên miền Workspace; được thêm vào danh sách cho phép'],
    'ad.i.name': ['Full name', 'Họ tên'], 'ad.i.vendor': ['Vendor', 'Nhà cung cấp'], 'ad.i.job': ['Job title', 'Chức danh'],
    'ad.i.note': ['The invitation expires after {d} days. The user accepts privacy notice {v} at first sign-in.', 'Lời mời hết hạn sau {d} ngày. Người dùng chấp nhận thông báo bảo mật {v} khi đăng nhập lần đầu.'], 'ad.i.send': ['Send invitation', 'Gửi lời mời'],
    'ad.i.pending': ['Pending invitations ({n})', 'Lời mời đang chờ ({n})'], 'ad.i.code': ['Invitation code', 'Mã mời'], 'ad.i.expires': ['Expires', 'Hết hạn'], 'ad.i.none': ['No pending invitations', 'Không có lời mời đang chờ'],
    'ad.i.eGmail': ['Use a Gmail address (…@gmail.com).', 'Dùng địa chỉ Gmail (…@gmail.com).'], 'ad.i.eDomain': ['Use a Gmail address or @{d}.', 'Dùng địa chỉ Gmail hoặc @{d}.'], 'ad.i.eDup': ['This Gmail already has an account.', 'Gmail này đã có tài khoản.'], 'ad.i.eName': ['Enter the full name.', 'Nhập họ tên.'],
    'ad.i.sent': ['Invitation sent to {e} · expires in {d} days', 'Đã gửi lời mời tới {e} · hết hạn sau {d} ngày'],
    'ad.d.reqs': ['Personal-data requests ({n} open)', 'Yêu cầu dữ liệu cá nhân ({n} đang mở)'], 'ad.d.req': ['Request', 'Yêu cầu'], 'ad.d.kind': ['Kind', 'Loại'], 'ad.d.recv': ['Received · due', 'Ngày nhận · hạn'], 'ad.d.done': ['Mark delivered', 'Đánh dấu đã giao'], 'ad.d.none': ['No requests', 'Không có yêu cầu'],
    'ad.d.note': ['Requests must be answered within 30 days (R-25). Exports are delivered to the user’s Gmail as a password-protected ZIP.', 'Yêu cầu phải được trả lời trong 30 ngày (R-25). Bản xuất được gửi tới Gmail của người dùng dưới dạng ZIP có mật khẩu.'],
    'ad.d.title': ['Delete personal data · {n}', 'Xóa dữ liệu cá nhân · {n}'], 'ad.d.body': ['Name, Gmail and phone are erased. Business records (POs, approvals, audit) keep a pseudonymous ID for the 10-year legal retention (Luật BVDLCN 91/2025/QH15, Luật Kế toán).', 'Họ tên, Gmail và điện thoại bị xóa. Hồ sơ nghiệp vụ (PO, phê duyệt, nhật ký) giữ mã ẩn danh trong thời hạn lưu trữ 10 năm theo luật (Luật BVDLCN 91/2025/QH15, Luật Kế toán).'],
    'ad.d.reason': ['Reason / request reference', 'Lý do / số yêu cầu'], 'ad.d.btn': ['Delete personal data', 'Xóa dữ liệu cá nhân'], 'ad.d.pick': ['Choose "Delete data" on a suspended user in the user list to erase their personal data.', 'Chọn "Xóa dữ liệu" ở một người dùng đã tạm ngưng trong danh sách để xóa dữ liệu cá nhân.'],
    'ad.d.eReason': ['Give the reason or request reference.', 'Nêu lý do hoặc số yêu cầu.'], 'ad.d.deleted': ['Personal data of {e} deleted · {id}', 'Đã xóa dữ liệu cá nhân của {e} · {id}'], 'ad.d.delUser': ['Deleted user {id}', 'Người dùng đã xóa {id}'],
    'ad.t.roles': ['{n}: roles saved', '{n}: đã lưu vai trò'], 'ad.t.noSelf': ['You cannot suspend yourself', 'Bạn không thể tự tạm ngưng'], 'ad.t.susp': ['{n} suspended', 'Đã tạm ngưng {n}'], 'ad.t.react': ['{n} reactivated', 'Đã kích hoạt lại {n}'],
    'ad.t.export': ['{id}: export of {e} sent as a protected ZIP', '{id}: đã gửi bản xuất của {e} dạng ZIP có bảo vệ'], 'ad.t.noDelSelf': ['You cannot delete your own data here', 'Bạn không thể xóa dữ liệu của chính mình tại đây'],
    'ad.t.suspFirst': ['Suspend the user first, then delete the personal data', 'Hãy tạm ngưng người dùng trước, rồi xóa dữ liệu cá nhân'], 'ad.t.dsr': ['{id} marked delivered', 'Đã đánh dấu {id} đã giao'],
    /* access */
    'ad.ac.sub': ['Who can sign in, how, and for how long', 'Ai được đăng nhập, bằng cách nào và trong bao lâu'], 'ad.ac.policy': ['Sign-in policy', 'Chính sách đăng nhập'], 'ad.ac.allow': ['Allowlist', 'Danh sách cho phép'], 'ad.ac.pn': ['Privacy notice', 'Thông báo bảo mật'],
    'ad.k.method': ['Sign-in method', 'Cách đăng nhập'], 'ad.k.idle': ['Idle timeout', 'Hết phiên khi không dùng'], 'ad.k.allowN': ['Allowlisted Gmail', 'Gmail được phép'], 'ad.k.pn': ['Privacy notice', 'Thông báo bảo mật'], 'ad.k.pnN': ['{n} users accepted', '{n} người đã chấp nhận'],
    'ad.min': ['{n} min', '{n} phút'], 'ad.ac.method': ['Sign-in method', 'Cách đăng nhập'], 'ad.ac.allowed': ['Allowed accounts', 'Tài khoản được phép'], 'ad.ac.allowList': ['Allowlist (Gmail addresses)', 'Danh sách cho phép (địa chỉ Gmail)'], 'ad.ac.allowDomain': ['Google Workspace domain', 'Tên miền Google Workspace'],
    'ad.ac.domain': ['Workspace domain', 'Tên miền Workspace'], 'ad.ac.domainH': ['Only used with "Google Workspace domain"', 'Chỉ dùng với "Tên miền Google Workspace"'], 'ad.ac.inv': ['Supplier invitation expires after (days)', 'Lời mời NCC hết hạn sau (ngày)'],
    'ad.ac.idle': ['Idle timeout (minutes)', 'Hết phiên khi không dùng (phút)'], 'ad.ac.reauth': ['Sign in again after (hours)', 'Đăng nhập lại sau (giờ)'], 'ad.ac.two': ['2-step verification required for', 'Bắt buộc xác minh 2 bước với'],
    'ad.ac.cfg': ['Idle timeout and re-auth: configuration only in this demo — enforced by the backend.', 'Hết phiên và đăng nhập lại: chỉ cấu hình trong bản demo — hệ thống phía máy chủ áp dụng.'], 'ad.ac.save': ['Save policy', 'Lưu chính sách'],
    'ad.ac.e2': ['2-step verification cannot be turned off for Admin.', 'Không thể tắt xác minh 2 bước với Quản trị.'], 'ad.ac.eDomain': ['Enter the Workspace domain, e.g. congty.com.vn.', 'Nhập tên miền Workspace, vd. congty.com.vn.'], 'ad.ac.eRange': ['{a} – {b}.', '{a} – {b}.'],
    'ad.ac.saved': ['Access policy saved', 'Đã lưu chính sách truy cập'], 'ad.al.title': ['Allowlist ({n})', 'Danh sách cho phép ({n})'], 'ad.al.add': ['Add Gmail address', 'Thêm địa chỉ Gmail'], 'ad.al.addBtn': ['Add', 'Thêm'], 'ad.al.rm': ['Remove {e}', 'Gỡ {e}'],
    'ad.al.eGmail': ['Use a Gmail address (…@gmail.com) or the Workspace domain.', 'Dùng địa chỉ Gmail (…@gmail.com) hoặc tên miền Workspace.'], 'ad.al.eDup': ['Already on the allowlist.', 'Đã có trong danh sách cho phép.'],
    'ad.al.added': ['{e} added to the allowlist', 'Đã thêm {e} vào danh sách cho phép'], 'ad.al.active': ['Suspend the active user before removing the address', 'Tạm ngưng người dùng đang hoạt động trước khi gỡ địa chỉ'], 'ad.al.removed': ['{e} removed from the allowlist', 'Đã gỡ {e} khỏi danh sách cho phép'],
    'ad.pn.cur': ['Current version {v} · published {d} · accepted by {n} users', 'Phiên bản hiện hành {v} · phát hành {d} · {n} người đã chấp nhận'], 'ad.pn.shown': ['Shown at: {s}.', 'Hiển thị tại: {s}.'], 'ad.pn.versions': ['Versions', 'Các phiên bản'],
    'ad.pn.what': ['What changes in {v}', 'Thay đổi trong {v}'], 'ad.pn.hint': ['Publishing forces every user to accept again at the next sign-in or bid', 'Phát hành buộc mọi người dùng chấp nhận lại khi đăng nhập hoặc nộp thầu lần tới'], 'ad.pn.pub': ['Publish', 'Phát hành'],
    'ad.pn.preview': ['Preview', 'Xem trước'], 'ad.pn.previewMsg': ['Preview: privacy notice {v} (VI / EN)', 'Xem trước: thông báo bảo mật {v} (VI / EN)'], 'ad.pn.edit': ['Edit text as {v}', 'Soạn phiên bản {v}'], 'ad.pn.e': ['Describe the change (at least 10 characters).', 'Mô tả thay đổi (ít nhất 10 ký tự).'],
    'ad.pn.done': ['{v} published · users accept again at next sign-in', 'Đã phát hành {v} · người dùng chấp nhận lại khi đăng nhập lần tới'],
    /* matrix */
    'ad.mx.sub': ['Value bands excl. VAT, extra steps and delegation (R-06) · used by PR, PO, change orders and My approvals', 'Ngưỡng giá trị chưa VAT, bước bổ sung và ủy quyền (R-06) · áp dụng cho PR, PO, điều chỉnh và Chờ tôi duyệt'],
    'ad.mx.bands': ['Bands & extra steps', 'Ngưỡng & bước bổ sung'], 'ad.mx.deleg': ['Delegation', 'Ủy quyền'], 'ad.k.b1': ['Band 1', 'Ngưỡng 1'], 'ad.k.b2': ['Band 2', 'Ngưỡng 2'], 'ad.k.extra': ['Extra steps on', 'Bước bổ sung đang bật'], 'ad.k.dl': ['Delegation', 'Ủy quyền'],
    'ad.mx.vb': ['Value bands', 'Ngưỡng giá trị'], 'ad.mx.val': ['Value excl. VAT', 'Giá trị chưa VAT'], 'ad.mx.route': ['Approval route', 'Tuyến phê duyệt'], 'ad.mx.extra': ['Extra steps', 'Bước bổ sung'], 'ad.mx.adds': ['adds {a}', 'thêm {a}'],
    'ad.mx.edit': ['Edit matrix', 'Sửa ma trận'], 'ad.mx.b1': ['Band 1 up to (₫)', 'Ngưỡng 1 đến (₫)'], 'ad.mx.b2': ['Band 2 up to (₫)', 'Ngưỡng 2 đến (₫)'], 'ad.mx.capex': ['Capex rule: EQP- above (₫)', 'Quy tắc capex: EQP- trên (₫)'], 'ad.mx.save': ['Save matrix', 'Lưu ma trận'],
    'ad.mx.eAmt': ['Enter an amount.', 'Nhập số tiền.'], 'ad.mx.eB2': ['Band 2 must be above band 1.', 'Ngưỡng 2 phải lớn hơn ngưỡng 1.'], 'ad.mx.saved': ['Approval matrix saved · applies to new PRs, POs and change orders', 'Đã lưu ma trận phê duyệt · áp dụng cho PR, PO và điều chỉnh mới'],
    'ad.dp.title': ['Delegation policy', 'Chính sách ủy quyền'], 'ad.dp.max': ['Max duration', 'Thời hạn tối đa'], 'ad.dp.cap': ['Cap', 'Hạn mức'], 'ad.dp.capV': ['{v} or the delegator\'s own limit if lower', '{v} hoặc hạn mức của người ủy quyền nếu thấp hơn'], 'ad.dp.bulk': ['Bulk approve', 'Duyệt hàng loạt'],
    'ad.dp.bulkV': ['Items < {v} only', 'Chỉ mục < {v}'], 'ad.dp.sodV': ['A delegate never approves an item they raised', 'Người được ủy quyền không duyệt mục do chính họ lập'],
    'ad.sd.title': ['Scheduled delegation', 'Ủy quyền đã lên lịch'], 'ad.sd.types': ['Types: {t} · cap {c} · above the cap → {a}', 'Loại: {t} · hạn mức {c} · vượt hạn mức → {a}'], 'ad.sd.none': ['None scheduled.', 'Chưa có ủy quyền.'], 'ad.sd.schedule': ['Schedule', 'Lên lịch'],
    'ad.sd.from': ['Delegator', 'Người ủy quyền'], 'ad.sd.to': ['Delegate', 'Người được ủy quyền'], 'ad.sd.start': ['From', 'Từ ngày'], 'ad.sd.until': ['Until', 'Đến ngày'], 'ad.sd.untilH': ['Max {n} days', 'Tối đa {n} ngày'],
    'ad.sd.cap': ['Cap per item (₫)', 'Hạn mức mỗi mục (₫)'], 'ad.sd.capH': ['≤ {v} or the delegator’s own limit', '≤ {v} hoặc hạn mức của người ủy quyền'], 'ad.sd.itemTypes': ['Item types', 'Loại mục'], 'ad.sd.save': ['Save delegation', 'Lưu ủy quyền'],
    'ad.sd.eAfter': ['Must be on or after the start.', 'Phải từ ngày bắt đầu trở đi.'], 'ad.sd.eMax': ['At most {n} days.', 'Tối đa {n} ngày.'], 'ad.sd.eSelf': ['The delegate must be someone else.', 'Người được ủy quyền phải là người khác.'], 'ad.sd.eTypes': ['Choose at least one item type.', 'Chọn ít nhất một loại mục.'],
    'ad.sd.saved': ['Delegation saved · My approvals updated', 'Đã lưu ủy quyền · đã cập nhật Chờ tôi duyệt'],
    /* categories & numbering */
    'ad.ca.sub': ['Material ID format CAT-NNNNN · each category has an owner and a match type', 'Định dạng mã vật tư CAT-NNNNN · mỗi nhóm có chủ quản và kiểu đối chiếu'], 'ad.ca.title': ['Categories ({n})', 'Nhóm hàng ({n})'],
    'ad.ca.code': ['Code', 'Mã'], 'ad.ca.name': ['Name', 'Tên'], 'ad.ca.range': ['ID range', 'Dải mã'], 'ad.ca.next': ['Next ID', 'Mã tiếp theo'], 'ad.ca.match': ['Match type', 'Kiểu đối chiếu'],
    'ad.ca.note': ['IDs are issued from the range and are never reused, even after a Material ID is blocked. 2-way (SES) categories match invoice ↔ PO ↔ service entry sheet. Owner and match type: configuration only in this demo — enforced by the backend.', 'Mã được cấp theo dải và không bao giờ dùng lại, kể cả khi mã vật tư bị chặn. Nhóm 2 bên (SES) đối chiếu hóa đơn ↔ PO ↔ biên bản nghiệm thu dịch vụ. Chủ quản và kiểu đối chiếu: chỉ cấu hình trong bản demo — hệ thống phía máy chủ áp dụng.'],
    'ad.ca.saved': ['{id} saved', 'Đã lưu {id}'], 'ad.k.cats': ['Categories', 'Nhóm hàng'], 'ad.k.mats': ['Material IDs', 'Mã vật tư'], 'ad.k.ses': ['2-way (SES) categories', 'Nhóm đối chiếu 2 bên (SES)'],
    'ad.nu.sub': ['Document numbers are issued by the system · cancelled numbers are never reused', 'Số chứng từ do hệ thống cấp · số đã hủy không bao giờ dùng lại'], 'ad.nu.title': ['Rules ({n})', 'Quy tắc ({n})'], 'ad.nu.doc': ['Document', 'Chứng từ'], 'ad.nu.fmt': ['Format', 'Định dạng'], 'ad.nu.next': ['Next number', 'Số tiếp theo'], 'ad.nu.rule': ['Rule', 'Quy tắc'],
    'ad.nu.note': ['YYYY = year of issue (reset on 01/01). Examples in use: INV-2026-0318, NCR-2026-017, CT-2026-008, PO-2026-0877 Rev.2 (a change order raises the revision and needs supplier re-confirmation).', 'YYYY = năm cấp (đặt lại ngày 01/01). Ví dụ đang dùng: INV-2026-0318, NCR-2026-017, CT-2026-008, PO-2026-0877 Rev.2 (mỗi điều chỉnh tăng số sửa đổi và cần NCC xác nhận lại).'],
    'ad.k.docTypes': ['Document types', 'Loại chứng từ'], 'ad.k.nextPo': ['Next PO', 'PO tiếp theo'], 'ad.k.nextPr': ['Next PR', 'PR tiếp theo'], 'ad.k.reuse': ['Number reuse', 'Dùng lại số'], 'ad.never': ['Never', 'Không bao giờ'],
    /* tolerances */
    'ad.to.sub': ['3-way match: invoice ↔ PO ↔ GRN accepted qty, per Material ID line (R-02)', 'Đối chiếu 3 bên: hóa đơn ↔ PO ↔ SL nhập kho chấp nhận, theo dòng mã vật tư (R-02)'], 'ad.to.title': ['Tolerances', 'Dung sai'],
    'ad.to.price': ['Price tolerance vs PO (± %)', 'Dung sai giá so với PO (± %)'], 'ad.to.priceH': ['0 – 5%', '0 – 5%'], 'ad.to.qty': ['Quantity tolerance vs GRN (± %)', 'Dung sai số lượng so với GRN (± %)'], 'ad.to.qtyH': ['Weight / volume units only (tấn, m³); count units must match exactly', 'Chỉ đơn vị khối lượng / thể tích (tấn, m³); đơn vị đếm phải khớp tuyệt đối'],
    'ad.to.over': ['Outside tolerance', 'Ngoài dung sai'], 'ad.to.rules': ['Rules', 'Quy tắc'], 'ad.to.ncr': ['An open NCR blocks matching for the rejected quantity', 'NCR đang mở chặn đối chiếu với số lượng bị loại'], 'ad.to.hist': ['Write invoice price differences to Price history (source Invoice)', 'Ghi chênh lệch giá hóa đơn vào Lịch sử giá (nguồn Hóa đơn)'],
    'ad.to.srv': ['SRV- Material IDs use a 2-way match against the service entry sheet', 'Mã vật tư SRV- đối chiếu 2 bên với biên bản nghiệm thu dịch vụ'], 'ad.to.cfg': ['Price and quantity tolerances drive the match grid and re-match open invoices. Outside-tolerance behaviour and the rules above: configuration only in this demo — enforced by the backend.', 'Dung sai giá và số lượng điều khiển bảng đối chiếu và đối chiếu lại hóa đơn đang mở. Xử lý ngoài dung sai và các quy tắc trên: chỉ cấu hình trong bản demo — hệ thống phía máy chủ áp dụng.'],
    'ad.to.save': ['Save tolerances', 'Lưu dung sai'], 'ad.to.force': ['In force', 'Đang áp dụng'], 'ad.to.p': ['Price', 'Giá'], 'ad.to.q': ['Quantity', 'Số lượng'], 'ad.to.by': ['Confirmed by', 'Xác nhận bởi'],
    'ad.to.ex': ['Example: INV-2026-0322 at 19.000.000 vs PO 18.500.000 = +2,7% → held in the buyer\'s exception queue.', 'Ví dụ: INV-2026-0322 giá 19.000.000 so với PO 18.500.000 = +2,7% → giữ trong hàng ngoại lệ của người mua.'],
    'ad.to.eP': ['Between 0 and 5%.', 'Từ 0 đến 5%.'], 'ad.to.eQ': ['Between 0 and 10%.', 'Từ 0 đến 10%.'], 'ad.to.saved': ['Tolerances saved · invoices are re-matched with the new values', 'Đã lưu dung sai · hóa đơn được đối chiếu lại theo giá trị mới'], 'ad.warnOnly': ['Warn only (no hold)', 'Chỉ cảnh báo (không giữ)'],
    'ad.to.byV': ['{u} · {d} (Finance confirmation requested)', '{u} · {d} (đã yêu cầu Tài chính xác nhận)'],
    /* integrations */
    'ad.in.sub': ['Sign-in, e-invoice intake, GDT lookup and accounting export (R-20)', 'Đăng nhập, nhận hóa đơn điện tử, tra cứu GDT và xuất kế toán (R-20)'], 'ad.in.conn': ['Connections', 'Kết nối'], 'ad.in.map': ['Mappings', 'Ánh xạ mã'], 'ad.in.log': ['Sync log', 'Nhật ký đồng bộ'],
    'ad.in.connT': ['Connections ({n})', 'Kết nối ({n})'], 'ad.in.name': ['Connection', 'Kết nối'], 'ad.in.last': ['Last run', 'Lần chạy gần nhất'], 'ad.in.mapT': ['Material ID → accounting item code ({n} unmapped)', 'Mã vật tư → mã hàng kế toán ({n} chưa ánh xạ)'],
    'ad.in.code': ['Item code', 'Mã hàng'], 'ad.in.codeFor': ['Item code for {m}', 'Mã hàng cho {m}'], 'ad.in.mapped': ['Mapped', 'Đã ánh xạ'], 'ad.in.unmapped': ['Unmapped', 'Chưa ánh xạ'], 'ad.in.save': ['Save mappings', 'Lưu ánh xạ'],
    'ad.in.vm': ['Vendor → accounting vendor code', 'NCC → mã NCC kế toán'], 'ad.in.vmV': ['{a} / {b} vendors mapped · unmapped: {u} (pending onboarding)', '{a} / {b} NCC đã ánh xạ · chưa ánh xạ: {u} (đang chờ hồ sơ)'],
    'ad.in.retry': ['Retry', 'Chạy lại'], 'ad.in.eFmt': ['Format: account-code, e.g. 152-BIEN-TAN', 'Định dạng: tài khoản-mã, vd. 152-BIEN-TAN'], 'ad.in.savedN': ['{n} mapping(s) saved · {u} unmapped', 'Đã lưu {n} ánh xạ · {u} chưa ánh xạ'], 'ad.in.nothing': ['Nothing to save', 'Không có gì để lưu'],
    'ad.in.retryOk': ['Retry succeeded', 'Chạy lại thành công'], 'ad.in.retryFail': ['Retry failed — map the Material ID first', 'Chạy lại thất bại — hãy ánh xạ mã vật tư trước'], 'ad.k.warn': ['Connections with warnings', 'Kết nối có cảnh báo'], 'ad.k.unmapped': ['Unmapped Material IDs', 'Mã vật tư chưa ánh xạ'], 'ad.k.failed': ['Failed jobs', 'Tác vụ lỗi'],
    'ad.in.job': ['Job', 'Tác vụ'], 'ad.in.detail': ['Detail', 'Chi tiết'],
    /* notification rules */
    'ad.nr.sub': ['Event × channel, reminders and escalation (R-15) · every channel keeps an in-app copy', 'Sự kiện × kênh, nhắc nhở và chuyển cấp (R-15) · mọi kênh đều lưu bản trong ứng dụng'], 'ad.nr.title': ['Rules ({n})', 'Quy tắc ({n})'],
    'ad.nr.ev': ['Event', 'Sự kiện'], 'ad.nr.rem': ['Reminder', 'Nhắc nhở'], 'ad.nr.esc': ['Escalation', 'Chuyển cấp'], 'ad.nr.last': ['Last run', 'Lần chạy gần nhất'], 'ad.nr.remFor': ['Reminder for {e}', 'Nhắc nhở cho {e}'], 'ad.nr.escFor': ['Escalation for {e}', 'Chuyển cấp cho {e}'],
    'ad.nr.chFor': ['{c} for {e}', '{c} cho {e}'], 'ad.nr.digest': ['Daily digest', 'Bản tin hằng ngày'], 'ad.nr.dg': ['Send a daily digest by Gmail', 'Gửi bản tin hằng ngày qua Gmail'], 'ad.nr.time': ['Time', 'Giờ gửi'], 'ad.nr.cfg': ['Configuration only in this demo — enforced by the backend.', 'Chỉ cấu hình trong bản demo — hệ thống phía máy chủ áp dụng.'],
    'ad.nr.save': ['Save rules', 'Lưu quy tắc'], 'ad.nr.add': ['Add rule', 'Thêm quy tắc'], 'ad.nr.evPh': ['e.g. Bid security expiring', 'vd. Bảo đảm dự thầu sắp hết hạn'], 'ad.nr.remPh': ['7 days before', 'trước 7 ngày'], 'ad.nr.escPh': ['— or → role', '— hoặc → vai trò'],
    'ad.nr.eCh': ['"{e}" needs at least one channel.', '"{e}" cần ít nhất một kênh.'], 'ad.nr.eTime': ['Digest time must be hh:mm.', 'Giờ gửi bản tin phải có dạng hh:mm.'], 'ad.nr.eEv': ['Name the event.', 'Đặt tên sự kiện.'], 'ad.nr.saved': ['Notification rules saved', 'Đã lưu quy tắc thông báo'], 'ad.nr.added': ['Rule added', 'Đã thêm quy tắc'],
    'ad.k.rules': ['Rules', 'Quy tắc'], 'ad.k.portal': ['Sent to the supplier portal', 'Gửi tới cổng NCC'], 'ad.k.digest': ['Daily digest', 'Bản tin hằng ngày'],
    /* SoD */
    'ad.sod.sub': ['Segregation of duties (R-18) · Block stops the action, Warn allows it and logs it · overrides only by an Admin, with a reason', 'Phân tách nhiệm vụ (R-18) · Chặn: dừng thao tác, Cảnh báo: cho phép và ghi nhật ký · chỉ Quản trị được vượt quyền, kèm lý do'],
    'ad.sod.rules': ['Rules', 'Quy tắc'], 'ad.sod.ovr': ['Override log', 'Nhật ký vượt quyền'], 'ad.sod.rulesN': ['Rules ({n})', 'Quy tắc ({n})'], 'ad.sod.rule': ['Rule', 'Quy tắc'], 'ad.sod.mode': ['Mode', 'Chế độ'], 'ad.sod.modeFor': ['Mode for {r}', 'Chế độ cho {r}'],
    'ad.sod.viol': ['Violations (30 days)', 'Vi phạm (30 ngày)'], 'ad.sod.save': ['Save modes', 'Lưu chế độ'], 'ad.sod.a': ['Person doing', 'Người thực hiện'], 'ad.sod.b': ['≠ person doing', '≠ người thực hiện'], 'ad.sod.aPh': ['e.g. Contract creator', 'vd. Người lập hợp đồng'], 'ad.sod.bPh': ['e.g. Contract approver', 'vd. Người duyệt hợp đồng'],
    'ad.sod.ovrN': ['Override log ({n})', 'Nhật ký vượt quyền ({n})'], 'ad.sod.item': ['Item', 'Mục'], 'ad.sod.by': ['By', 'Người thực hiện'], 'ad.sod.when': ['When', 'Thời điểm'], 'ad.sod.reason': ['Reason', 'Lý do'], 'ad.sod.none': ['No overrides', 'Không có vượt quyền'],
    'ad.sod.updated': ['{n} rule(s) updated', 'Đã cập nhật {n} quy tắc'], 'ad.sod.noCh': ['No changes', 'Không có thay đổi'], 'ad.sod.added': ['SoD rule added', 'Đã thêm quy tắc SoD'], 'ad.k.block': ['Block rules', 'Quy tắc Chặn'], 'ad.k.viol': ['Violations (30 days)', 'Vi phạm (30 ngày)'], 'ad.k.ovr': ['Overrides', 'Lần vượt quyền'],
    /* audit */
    'ad.au.sub': ['Read only · kept {y} years · {n} entries (sample loaded)', 'Chỉ đọc · lưu {y} năm · {n} bản ghi (đã tải mẫu)'], 'ad.au.export': ['Export Excel', 'Xuất Excel'], 'ad.au.exportMsg': ['AuditLog_{d}.xlsx exported ({n} rows in view)', 'Đã xuất AuditLog_{d}.xlsx ({n} dòng đang xem)'],
    'ad.au.title': ['Entries ({n})', 'Bản ghi ({n})'], 'ad.au.ph': ['Search action or reference (e.g. TND-2026-029, unseal)', 'Tìm thao tác hoặc tham chiếu (vd. TND-2026-029, mở niêm phong)'], 'ad.au.allU': ['All users', 'Mọi người dùng'], 'ad.au.type': ['Action type', 'Loại thao tác'], 'ad.au.allT': ['All action types', 'Mọi loại thao tác'],
    'ad.au.action': ['Action', 'Thao tác'], 'ad.au.ref': ['Reference', 'Tham chiếu'], 'ad.au.none': ['No entries match', 'Không có bản ghi phù hợp'], 'ad.au.more': ['Load more ({n})', 'Tải thêm ({n})'], 'ad.au.end': ['End of the loaded sample.', 'Hết dữ liệu mẫu đã tải.'],
    'ad.k.today': ['Entries today', 'Bản ghi hôm nay'], 'ad.k.ovrAu': ['Overrides', 'Vượt quyền'], 'ad.k.privacy': ['Data privacy', 'Bảo mật dữ liệu'], 'ad.k.kept': ['Retention', 'Thời gian lưu'], 'ad.years': ['{n} years', '{n} năm'],
    /* audit entries written by admin actions */
    'au.a.invite': ['User invited · {e} as {r} (allowlisted)', 'Mời người dùng · {e} vai trò {r} (đã thêm vào danh sách cho phép)'], 'au.a.roles': ['Roles changed · {a} → {b} · 2-step {two}', 'Đổi vai trò · {a} → {b} · 2 bước {two}'],
    'au.a.del': ['Personal data deleted · pseudonymous ID {id} kept on business records · {r}', 'Đã xóa dữ liệu cá nhân · giữ mã ẩn danh {id} trên hồ sơ nghiệp vụ · {r}'],
    'au.a.policy': ['Access policy saved · {a}{d} · idle {i} min · re-auth {h} h · invite {v} days · 2-step {two}', 'Lưu chính sách truy cập · {a}{d} · hết phiên {i} phút · đăng nhập lại {h} giờ · lời mời {v} ngày · 2 bước {two}'],
    'au.a.allowAdd': ['Allowlist · added {e}', 'Danh sách cho phép · thêm {e}'], 'au.a.allowRm': ['Allowlist · removed {e}', 'Danh sách cho phép · gỡ {e}'], 'au.a.pub': ['Privacy notice {v} published · every user must accept again · {s}', 'Phát hành thông báo bảo mật {v} · mọi người dùng phải chấp nhận lại · {s}'],
    'au.a.matrix': ['Approval matrix · bands ≤ {a} / ≤ {b} · capex EQP- > {c}', 'Ma trận phê duyệt · ngưỡng ≤ {a} / ≤ {b} · capex EQP- > {c}'], 'au.a.deleg': ['Delegation {f} → {to} · {s}–{u} · cap {c}', 'Ủy quyền {f} → {to} · {s}–{u} · hạn mức {c}'],
    'au.a.tol': ['Match tolerance price ±{p}% · qty ±{q}%', 'Dung sai đối chiếu giá ±{p}% · SL ±{q}%'], 'au.a.rules': ['Notification rules saved · daily digest {d}', 'Lưu quy tắc thông báo · bản tin hằng ngày {d}'], 'au.a.ruleAdd': ['Notification rule added · {e}', 'Thêm quy tắc thông báo · {e}'],
    'au.a.sod': ['SoD mode · {r}: {a} → {b}', 'Chế độ SoD · {r}: {a} → {b}'], 'au.a.sodAdd': ['SoD rule added · {a} ≠ {b} ({m})', 'Thêm quy tắc SoD · {a} ≠ {b} ({m})'], 'au.a.susp': ['User suspended', 'Tạm ngưng người dùng'], 'au.a.react': ['User reactivated', 'Kích hoạt lại người dùng'],
    'au.a.export': ['Personal data exported ({id}) · sent to the user\'s Gmail', 'Đã xuất dữ liệu cá nhân ({id}) · gửi tới Gmail người dùng'], 'au.a.dsr': ['{k} delivered ({id})', 'Đã giao {k} ({id})'], 'au.a.cat': ['Category {id} · {a} / {b} → {c} / {d}', 'Nhóm hàng {id} · {a} / {b} → {c} / {d}'],
    'au.a.map': ['Item code mapping {m} → {c}', 'Ánh xạ mã hàng {m} → {c}'], 'au.a.retry': ['Integration retry · {j} · {r}', 'Chạy lại tích hợp · {j} · {r}'], 'ad.off.l': ['off', 'tắt'], 'ad.ok.l': ['OK', 'thành công'], 'ad.fail.l': ['failed', 'thất bại']
  });
  I18N.values({
    procurement: 'Mua sắm', supplier: 'Nhà cung cấp', admin: 'Quản trị', Invited: 'Đã mời', Suspended: 'Bị tạm ngưng', 'Deleted (anonymised)': 'Đã xóa (ẩn danh)', Current: 'Hiện hành',
    'Google only': 'Chỉ Google', 'Google only (suppliers may use a password + email OTP)': 'Chỉ Google (NCC có thể dùng mật khẩu + OTP email)', Allowlist: 'Danh sách cho phép', Domain: 'Tên miền Workspace',
    Admin: 'Quản trị', Approver: 'Người duyệt', Finance: 'Tài chính', Buyer: 'Người mua', Supplier: 'Nhà cung cấp',
    'First sign-in · bid submission · Privacy link in the footer': 'Lần đăng nhập đầu · khi nộp thầu · liên kết Bảo mật ở chân trang',
    'Dept head → Procurement Lead': 'Trưởng bộ phận → Trưởng phòng Mua sắm', 'Dept head → Procurement Lead → Finance Director': 'Trưởng bộ phận → Trưởng phòng Mua sắm → Giám đốc Tài chính',
    'EQP- Material ID above 1 tỷ ₫ (capex)': 'Mã vật tư EQP- trên 1 tỷ ₫ (capex)', 'PR above the remaining budget line': 'PR vượt ngân sách còn lại', 'New vendor or vendor bank change': 'NCC mới hoặc đổi tài khoản ngân hàng NCC', 'New Material ID request': 'Yêu cầu mã vật tư mới',
    'Finance Director (call-back verification)': 'Giám đốc Tài chính (gọi xác minh)', 'Procurement Lead (material master owner)': 'Trưởng phòng Mua sắm (chủ quản danh mục)',
    'PO approval': 'Duyệt PO', 'PO change order': 'Điều chỉnh PO', '3-way': '3 bên', '3-way (POD)': '3 bên (POD)', '2-way (SES)': '2 bên (SES)',
    'Material ID': 'Mã vật tư', 'Purchase request': 'Đề nghị mua hàng', 'Bid receipt': 'Biên nhận hồ sơ thầu', 'Purchase order': 'Đơn đặt hàng', 'PO revision': 'Sửa đổi PO', Contract: 'Hợp đồng', 'Goods receipt': 'Phiếu nhập kho', 'Service entry sheet': 'Biên bản nghiệm thu dịch vụ',
    'Non-conformance': 'Báo cáo không phù hợp', 'Invoice (internal)': 'Hóa đơn (nội bộ)', Vendor: 'Nhà cung cấp', 'Range per category · never reused': 'Dải theo nhóm · không dùng lại', 'Yearly reset': 'Đặt lại hằng năm',
    'Per tender · issued on submit': 'Theo gói thầu · cấp khi nộp', 'Rev.N+1 per change order': 'Rev.N+1 mỗi lần điều chỉnh', 'Re-confirmation required': 'Cần xác nhận lại', 'Legal no. = mẫu · ký hiệu · số from the e-invoice': 'Số pháp lý = mẫu · ký hiệu · số trên hóa đơn điện tử', 'Never reused': 'Không dùng lại',
    'Google sign-in (OAuth)': 'Đăng nhập Google (OAuth)', 'E-invoice inbox hoadon@': 'Hộp thư hóa đơn điện tử hoadon@', 'GDT invoice lookup': 'Tra cứu hóa đơn GDT', 'Accounting export': 'Xuất kế toán', '1 error': '1 lỗi',
    'Allowlist mode · 58 active users': 'Chế độ danh sách cho phép · 58 người dùng hoạt động', 'Polls every 15 min · XML + PDF parsed': 'Quét 15 phút/lần · đọc XML + PDF', 'hoadondientu.gdt.gov.vn · 1 not found (INV-2026-0321)': 'hoadondientu.gdt.gov.vn · 1 không tìm thấy (INV-2026-0321)',
    'Daily 18:00 · Material ID → item code, V-code → vendor code': 'Hằng ngày 18:00 · mã vật tư → mã hàng, mã V → mã NCC',
    'E-invoice inbox': 'Hộp thư hóa đơn điện tử', 'GDT lookup': 'Tra cứu GDT', 'Vendor risk refresh': 'Cập nhật rủi ro NCC', Warning: 'Cảnh báo', Failed: 'Thất bại', Resolved: 'Đã xử lý', 'Failed (retried)': 'Thất bại (đã chạy lại)',
    'INV-2026-0314 exported · 1 line': 'Đã xuất INV-2026-0314 · 1 dòng', 'INV-2026-0324 · SRV-52210 has no item code': 'INV-2026-0324 · SRV-52210 chưa có mã hàng', '2 new e-mails · 1 invoice parsed (INV-2026-0323)': '2 email mới · đọc được 1 hóa đơn (INV-2026-0323)',
    'INV-2026-0321 · Mã CQT not found': 'INV-2026-0321 · không tìm thấy mã CQT', '11 vendors · tax status checked': '11 NCC · đã kiểm tra tình trạng thuế',
    'PO not confirmed by supplier': 'PO chưa được NCC xác nhận', 'Approval waiting': 'Phê duyệt đang chờ', 'Tender closing soon': 'Gói thầu sắp đóng', 'Certificate expiring': 'Chứng chỉ sắp hết hạn', 'Contract expiring': 'Hợp đồng sắp hết hạn',
    'NCR response due': 'Đến hạn phản hồi NCR', 'Price alert by Material ID': 'Cảnh báo giá theo mã vật tư', '48 h': '48 giờ', '72 h → buyer': '72 giờ → người mua', 'SLA − 4 h': 'SLA − 4 giờ', 'SLA breach → approver’s manager': 'Quá SLA → quản lý của người duyệt',
    '72 h and 24 h': '72 giờ và 24 giờ', '60 / 30 / 7 days': '60 / 30 / 7 ngày', 'Expired → block Material ID link': 'Hết hạn → chặn liên kết mã vật tư', '90 / 60 / 30 days': '90 / 60 / 30 ngày', '30 days → Procurement Lead': '30 ngày → Trưởng phòng Mua sắm',
    Immediately: 'Ngay lập tức', '3 working days → Procurement Lead': '3 ngày làm việc → Trưởng phòng Mua sắm', '24 h before due': '24 giờ trước hạn', 'Overdue → buyer': 'Quá hạn → người mua', 'On new price': 'Khi có giá mới', 'Not run yet': 'Chưa chạy',
    'In-app': 'Trong ứng dụng', Gmail: 'Gmail', Portal: 'Cổng NCC', Block: 'Chặn', Warn: 'Cảnh báo',
    'Requester ≠ approver of the same PR / change order / Material ID request': 'Người đề nghị ≠ người duyệt cùng PR / điều chỉnh / yêu cầu mã vật tư', 'Vendor creator ≠ vendor approver': 'Người tạo NCC ≠ người duyệt NCC', 'PO buyer ≠ GRN receiver': 'Người mua PO ≠ người nhận GRN',
    'Tender evaluator ≠ award approver': 'Người chấm thầu ≠ người duyệt trao thầu', 'Tender creator ≠ sole evaluator': 'Người tạo gói thầu ≠ người chấm duy nhất', 'Vendor master editor ≠ payment approver': 'Người sửa hồ sơ NCC ≠ người duyệt thanh toán',
    'Requester on leave; Finance Director approved by phone — logged per policy.': 'Người đề nghị nghỉ phép; Giám đốc Tài chính duyệt qua điện thoại — đã ghi nhật ký theo quy định.', 'SoD Warn mode · approved with warning': 'SoD chế độ Cảnh báo · duyệt kèm cảnh báo',
    'Export personal data': 'Xuất dữ liệu cá nhân', 'Delete personal data': 'Xóa dữ liệu cá nhân', 'Auto-hold in the buyer’s exception queue; release needs the Procurement Lead': 'Tự động giữ trong hàng ngoại lệ của người mua; Trưởng phòng Mua sắm mới được giải phóng',
    'Đỗ Hoàng Nam · 15/09/2026': 'Đỗ Hoàng Nam · 15/09/2026',
    Settings: 'Cài đặt', 'Sign-in': 'Đăng nhập', 'Bids and tenders': 'Hồ sơ & gói thầu', Overrides: 'Vượt quyền', 'Data privacy': 'Bảo mật dữ liệu', Orders: 'Đơn hàng', Invoices: 'Hóa đơn', System: 'Hệ thống',
    'Signed in with Google (2-step)': 'Đăng nhập bằng Google (2 bước)', 'Signed in with Google': 'Đăng nhập bằng Google', 'Price envelope opened (two keys) · 3 price bids unsealed': 'Mở túi giá (hai khóa) · mở niêm phong 3 hồ sơ giá',
    'Unseal · technical envelope opened (two keys) · 4 bids': 'Mở niêm phong · mở túi kỹ thuật (hai khóa) · 4 hồ sơ', 'Notification rule "Certificate expiring" reminders 60/30/7 days': 'Quy tắc thông báo "Chứng chỉ sắp hết hạn" nhắc trước 60/30/7 ngày',
    'SoD override · requester ≠ approver': 'Vượt quyền SoD · người đề nghị ≠ người duyệt', 'Personal data export delivered (DSR-2026-005)': 'Đã giao bản xuất dữ liệu cá nhân (DSR-2026-005)', 'Unseal · sealed bids opened at closing (4 bids)': 'Mở niêm phong · mở hồ sơ niêm phong khi đóng thầu (4 hồ sơ)',
    'Match tolerance price ±0,5% · qty ±2% (tấn, m³) confirmed by Đỗ Hoàng Nam': 'Dung sai đối chiếu giá ±0,5% · SL ±2% (tấn, m³) do Đỗ Hoàng Nam xác nhận',
    'Bank account change requested · Vietcombank ···· 5307 (pending Finance verification)': 'Yêu cầu đổi tài khoản ngân hàng · Vietcombank ···· 5307 (chờ Tài chính xác minh)', 'SoD warning acknowledged · approved': 'Đã ghi nhận cảnh báo SoD · đã duyệt',
    'Marked ready for payment': 'Đánh dấu sẵn sàng thanh toán', 'Exported to accounting': 'Đã chuyển kế toán', 'Notification rules': 'Quy tắc thông báo', 'Access policy': 'Chính sách truy cập', 'Privacy notice': 'Thông báo bảo mật',
    'Approval matrix': 'Ma trận phê duyệt', Tolerances: 'Dung sai', 'SoD rules': 'Quy tắc SoD', Categories: 'Nhóm hàng', Integrations: 'Tích hợp', 'All procurement users': 'Mọi người dùng mua sắm', Mapped: 'Đã ánh xạ', Scheduled: 'Đã lên lịch', off: 'tắt', 'procurement, admin': 'Mua sắm, Quản trị', 'admin, procurement': 'Quản trị, Mua sắm',
    'Admin/Approver/Finance': 'Quản trị/Người duyệt/Tài chính', 'Admin/Approver/Finance/Buyer': 'Quản trị/Người duyệt/Tài chính/Người mua', 'Admin/Approver/Finance/Buyer/Supplier': 'Quản trị/Người duyệt/Tài chính/Người mua/Nhà cung cấp'
  });
  I18N.patterns([
    [/^Sealed bid submitted · (RC-[\d-]+) \(content sealed\)$/, 'Đã nộp hồ sơ niêm phong · $1 (nội dung niêm phong)'], [/^Privacy notice (v[\d.]+) accepted$/, 'Đã chấp nhận thông báo bảo mật $1'],
    [/^(.+) · retried and exported$/, '$1 · đã chạy lại và xuất'], [/^Retry failed · (\S+) still has no item code — map it first$/, 'Chạy lại thất bại · $1 vẫn chưa có mã hàng — hãy ánh xạ trước'], [/^Deleted user (U-\d+)$/, 'Người dùng đã xóa $1']
  ]);

  const st = { cur: null, q: '', role: 'all', status: 'all', two: 'all', inv: null, ierr: {}, edit: null, eerr: '', del: null, derr: '', pol: null, perr: {}, add: '', aerr: '', pub: null, puerr: '', mx: null, mxErr: {}, dl: null, dlErr: {}, cat: null, tol: null, tErr: {}, map: {}, nr: null, nrErr: '', sod: null, sErr: {}, au: { user: 'all', type: 'all', q: '', n: 10 } };
  const staff = () => D().users.filter((u) => !u.vendor && u.roles.includes('procurement'));
  const tone = (s) => (/Active|OK|Done|Resolved/.test(s) ? 'success' : /Invited|Warning|Pending/.test(s) ? 'warning' : /Suspended|Failed|error|Deleted/.test(s) ? 'danger' : 'neutral');
  const isGmailOk = (e) => /^[a-z0-9._%+-]+@gmail\.com$/i.test(e) || (D().access.domain && new RegExp('@' + D().access.domain.replace(/\./g, '\\.') + '$', 'i').test(e));
  const focus = (sel) => { const x = document.querySelector(sel); if (x) { x.scrollIntoView({ block: 'center' }); x.focus({ preventScroll: true }); } };
  const audit = (type, k, p, ref) => S.audit(type, [k, p || {}], ref);
  const btns = (cancel, label, cls = 'btn-p') => `<div class="row-acts"><button type="button" class="btn btn-sm" data-ad="${cancel}">${esc(t('c.cancel'))}</button><button type="submit" class="btn btn-sm ${cls}">${esc(label)}</button></div>`;
  const roleName = (r) => t('ws.' + r);
  const page = (o) => layout(Object.assign({ subtitle: '' }, o));

  /* ---------- F-99 users & roles ---------- */
  const USUBS = [['', 'ad.u.list'], ['invites', 'ad.u.invites'], ['privacy', 'ad.u.privacy']];
  function users(subArg) {
    const cur = App.sub(USUBS, subArg || ''); const U = D().users; const X = D().userStats; const q = st.q.trim(); const reqs = D().dataRequests;
    const invited = U.filter((u) => u.status === 'Invited');
    const kpis = [kpi(t('ad.k.active'), num(X.active), esc(t('c.inSample', { n: U.filter((u) => u.status === 'Active').length }))), kpi(t('ad.k.invites'), num(X.invites), esc(invited.map((u) => u.email).join(', ') || t('c.none')), 'warning'),
      kpi(t('ad.k.susp'), num(X.suspended), ''), kpi(t('ad.k.no2'), num(X.no2step), esc(t('ad.k.no2N')), X.no2step ? 'warning' : ''), kpi(t('ad.k.dsr'), String(reqs.filter((r) => r.status === 'Open').length), '', reqs.some((r) => r.status === 'Open') ? 'warning' : '')];
    let blocks;
    if (cur === 'invites') {
      const f = st.inv || (st.inv = { email: '', name: '', role: 'procurement', vendor: 'V-1001', title: '' }); const e = st.ierr;
      blocks = [block(t('ad.i.title'), `<form id="ad-inv" class="stack" novalidate><div class="form-grid">${S.field('adi', e, 'email', t('ad.i.email'), f.email, { req: true, ph: 'name@gmail.com', hint: t('ad.i.emailH') })}${S.field('adi', e, 'name', t('ad.i.name'), f.name, { req: true })}
        ${S.field('adi', e, 'role', t('ad.f.role'), f.role, { options: [['procurement', roleName('procurement')], ['admin', roleName('admin')], ['supplier', roleName('supplier')]] })}${f.role === 'supplier' ? S.field('adi', e, 'vendor', t('ad.i.vendor'), f.vendor, { options: D().vendors.map((v) => [v.id, `${v.id} · ${App.vshort(v)}`]) }) : S.field('adi', e, 'title', t('ad.i.job'), f.title, {})}</div>
        <p class="small muted mt-0">${esc(t('ad.i.note', { d: D().access.inviteDays, v: D().privacy.current }))}</p><div class="row-acts"><button type="submit" class="btn btn-sm btn-p">${esc(t('ad.i.send'))}</button></div></form>`, { span: 6 }),
      block(t('ad.i.pending', { n: invited.length }), invited.length ? `<ul class="plain rows">${invited.map((u) => `<li><b>${esc(u.name)}</b> ${pill('Invited', 'warning')}<div class="small mono">${esc(u.email)}</div><div class="small muted">${esc(t('ad.invited', { d: u.invited }))} · ${esc(t('ad.i.expires'))} ${esc(App.addDays(u.invited, D().access.inviteDays))}${u.inviteCode ? ` · ${esc(t('ad.i.code'))} <span class="mono">${esc(u.inviteCode)}</span>` : ''}</div></li>`).join('')}</ul>` : App.emptyState(t('ad.i.none')), { span: 6 })];
    } else if (cur === 'privacy') {
      const del = st.del && U.find((u) => u.email === st.del);
      blocks = [block(t('ad.d.reqs', { n: reqs.filter((r) => r.status === 'Open').length }), table([
        { h: t('ad.d.req'), r: (r) => `<span class="mono">${esc(r.id)}</span>`, w: '140px' }, { h: t('ad.c.user'), r: (r) => `<span class="mono small">${esc(r.user)}</span>`, w: 'minmax(180px,1.5fr)' }, { h: t('ad.d.kind'), r: (r) => esc(tv(r.kind)), w: 'minmax(160px,1.4fr)' },
        { h: t('ad.d.recv'), r: (r) => `${esc(r.at)} · ${esc(r.due)}`, w: '180px' }, { h: t('c.status'), r: (r) => pill(r.status === 'Open' ? 'Open' : 'Delivered', r.status === 'Open' ? 'warning' : 'success'), w: '110px' },
        { h: '', r: (r) => (r.status === 'Open' ? `<button class="btn btn-sm" data-ad="dsr-done" data-id="${esc(r.id)}">${esc(t('ad.d.done'))}</button>` : ''), w: '170px' }
      ], reqs, { label: t('ad.u.privacy'), empty: t('ad.d.none') }) + `<p class="small muted">${esc(t('ad.d.note'))}</p>`),
      block(del ? t('ad.d.title', { n: del.name }) : t('ad.d.btn'), del ? `<form id="ad-del" class="stack" novalidate><p class="small mt-0">${esc(t('ad.d.body'))}</p>${S.field('add', st.derr ? { reason: st.derr } : {}, 'reason', t('ad.d.reason'), '', { area: true, req: true })}${btns('del-cancel', t('ad.d.btn'), 'btn-d')}</form>` : `<p class="small muted mt-0">${esc(t('ad.d.body'))}</p><p class="small m-0">${esc(t('ad.d.pick'))}</p>`)];
    } else {
      const rows = U.filter((u) => (st.role === 'all' || u.roles.includes(st.role)) && (st.status === 'all' || u.status === st.status) && (st.two === 'all' || (st.two === 'on') === !!u.twoStep) && (!q || App.matches(`${u.name} ${u.email} ${u.title}`, q)));
      const ed = st.edit && U.find((u) => u.email === st.edit);
      const editForm = ed ? `<form id="ad-roles" class="stack mt decide-panel" novalidate><h3 class="h-sub mt-0">${esc(t('ad.e.title', { n: ed.name }))}</h3><fieldset class="fs"><legend>${esc(t('ad.c.roles'))}</legend>${(ed.vendor ? ['supplier'] : ['procurement', 'admin']).map((r) => `<label class="chk"><input type="checkbox" name="roles" value="${r}"${ed.roles.includes(r) ? ' checked' : ''}${ed.vendor ? ' disabled' : ''}> ${esc(roleName(r))}</label>`).join('')}</fieldset>
        <label class="chk"><input type="checkbox" name="two" value="1"${ed.twoStep ? ' checked' : ''}> ${esc(t('ad.e.two'))}</label>${st.eerr ? `<div class="err" role="alert">${esc(t(st.eerr))}</div>` : ''}${btns('edit-cancel', t('ad.e.save'))}</form>` : '';
      const sel = (k, label, opts) => `<label class="sr" for="adu-${k}">${esc(label)}</label><select class="inp" id="adu-${k}" data-adf="${k}">${opts.map(([v, l]) => `<option value="${v}"${st[k] === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
      blocks = [block(t('ad.u.title', { n: rows.length }), `<div class="filters"><label class="sr" for="adu-q">${esc(t('ad.u.search'))}</label><input class="inp grow" id="adu-q" type="search" data-adf="q" value="${esc(st.q)}" placeholder="${esc(t('ad.u.searchPh'))}">${sel('role', t('ad.f.role'), [['all', t('ad.f.allRoles')], ['procurement', roleName('procurement')], ['supplier', roleName('supplier')], ['admin', roleName('admin')]])}${sel('status', t('c.status'), [['all', t('ad.f.allSt')], ['Active', tv('Active')], ['Invited', tv('Invited')], ['Suspended', tv('Suspended')]])}${sel('two', t('ad.f.two'), [['all', t('ad.f.twoAny')], ['on', t('ad.f.twoOn')], ['off', t('ad.f.twoOff')]])}</div>${editForm}`
        + table([
          { h: t('ad.c.user'), r: (u) => `<b>${esc(tv(u.name))}</b><div class="small mono">${esc(u.email)}</div><div class="small muted">${esc(tv(u.title))}</div>`, w: 'minmax(220px,2fr)' },
          { h: t('ad.c.roles'), r: (u) => u.roles.map((r) => `<span class="pill pill-info">${esc(roleName(r))}</span>`).join(' ') + (u.vendor ? `<div class="small muted">${esc(u.vendor)}</div>` : ''), w: 'minmax(140px,1.1fr)' },
          { h: t('c.status'), r: (u) => pill(u.status, tone(u.status)) + (u.invited ? `<div class="small muted">${esc(t('ad.invited', { d: u.invited }))}</div>` : ''), w: '130px' },
          { h: t('ad.f.two'), r: (u) => `<span class="pill pill-${u.twoStep ? 'success' : u.roles.includes('admin') ? 'danger' : 'neutral'}">${esc(t(u.twoStep ? 'ad.on' : 'ad.off'))}</span>`, w: '90px' },
          { h: t('ad.c.consent'), r: (u) => (u.consent ? `${esc(u.consent)}<div class="small muted">${esc(tv(u.consentVer || D().privacy.current))}</div>` : '—'), w: '120px' },
          { h: t('c.actions'), r: (u) => (/Deleted/.test(u.status) ? `<span class="small muted">${esc(t('ad.anon'))}</span>` : `<div class="nacts"><button class="btn btn-sm" data-ad="edit" data-id="${esc(u.email)}">${esc(t('ad.a.edit'))}</button><button class="btn btn-sm" data-ad="susp" data-id="${esc(u.email)}">${esc(t(u.status === 'Suspended' ? 'ad.a.react' : 'ad.a.susp'))}</button><button class="btn btn-sm" data-ad="export" data-id="${esc(u.email)}">${esc(t('ad.a.export'))}</button><button class="btn btn-sm" data-ad="del" data-id="${esc(u.email)}">${esc(t('ad.a.del'))}</button></div>`), w: 'minmax(250px,2fr)' }
        ], rows, { label: t('ad.u.list'), empty: t('ad.u.none') }))];
    }
    return page({ title: t('nav.a.users'), subtitle: esc(t('ad.u.sub')), actions: cur === 'invites' ? '' : `<a class="btn btn-p" href="#/admin/users/invites">${esc(t('ad.i.title'))}</a>`, alerts: App.unknownSub(USUBS, subArg), kpis,
      subnav: App.subnav('admin/users', USUBS.map((x) => (x[0] === 'privacy' && reqs.some((r) => r.status === 'Open') ? [x[0], x[1], String(reqs.filter((r) => r.status === 'Open').length)] : x)), cur), blocks });
  }

  /* ---------- F-100 access policy + F-101 privacy notice ---------- */
  const ASUBS = [['', 'ad.ac.policy'], ['allowlist', 'ad.ac.allow'], ['privacy', 'ad.ac.pn']];
  function access(subArg) {
    const cur = App.sub(ASUBS, subArg || ''); const A = D().access; const P = D().privacy; const nv = 'v' + (+P.current.slice(1) + 0.1).toFixed(1);
    const kpis = [kpi(t('ad.k.method'), esc(tv(A.allow)), esc(tv(A.method))), kpi(t('ad.k.idle'), esc(t('ad.min', { n: A.idle })), ''), kpi(t('ad.k.allowN'), String(A.allowlist.length), ''), kpi(t('ad.k.pn'), esc(P.current), esc(t('ad.k.pnN', { n: num(P.accepted) })))];
    let blocks;
    if (cur === 'allowlist') blocks = [block(t('ad.al.title', { n: A.allowlist.length }), `<form id="ad-allow" class="row-acts start" novalidate><div class="field grow"><label for="ada-email">${esc(t('ad.al.add'))}</label><input id="ada-email" name="email" value="${esc(st.add)}" placeholder="name@gmail.com"${st.aerr ? ' aria-invalid="true" aria-describedby="ada-email-e"' : ''}>${st.aerr ? `<span class="err" id="ada-email-e" role="alert">${esc(t(st.aerr))}</span>` : ''}</div><button type="submit" class="btn btn-sm btn-p">${esc(t('ad.al.addBtn'))}</button></form>
        <ul class="plain small mt rows">${A.allowlist.map((m) => `<li class="row-acts between"><span class="mono">${esc(m)}</span><button class="btn btn-sm" data-ad="allow-rm" data-id="${esc(m)}" aria-label="${esc(t('ad.al.rm', { e: m }))}">${esc(t('c.remove'))}</button></li>`).join('')}</ul>`)];
    else if (cur === 'privacy') blocks = [block(t('ad.ac.pn'), `<p class="mt-0">${esc(t('ad.pn.cur', { v: P.current, d: P.published, n: num(P.accepted) }))}</p><p class="small muted">${esc(t('ad.pn.shown', { s: tv(P.shown) }))}</p>
        ${st.pub ? `<form id="ad-pub" class="stack mt decide-panel" novalidate>${S.field('adb', st.puerr ? { summary: st.puerr } : {}, 'summary', t('ad.pn.what', { v: nv }), st.pub.summary, { area: true, req: true, hint: t('ad.pn.hint') })}${btns('pub-cancel', t('ad.pn.pub'))}</form>` : ''}`,
      { span: 6, actions: st.pub ? '' : `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('ad.pn.previewMsg', { v: P.current }))}">${esc(t('ad.pn.preview'))}</button><button class="btn btn-sm btn-p" data-ad="pub-open">${esc(t('ad.pn.edit', { v: nv }))}</button>` }),
      block(t('ad.pn.versions'), `<ul class="plain rows">${P.versions.map(([v, d, s]) => `<li class="row-acts between"><span>${esc(v)} · ${esc(d)}</span>${pill(s, s === 'Current' ? 'success' : 'neutral')}</li>`).join('')}</ul>`, { span: 6 })];
    else {
      const f = st.pol || A; const e = st.perr;
      blocks = [block(t('ad.ac.policy'), `<form id="ad-pol" class="stack" novalidate><div class="form-grid">
        ${S.field('adp', e, 'method', t('ad.ac.method'), f.method, { options: ['Google only', 'Google only (suppliers may use a password + email OTP)'] })}
        ${S.field('adp', e, 'allow', t('ad.ac.allowed'), f.allow, { options: [['Allowlist', t('ad.ac.allowList')], ['Domain', t('ad.ac.allowDomain')]] })}
        ${S.field('adp', e, 'domain', t('ad.ac.domain'), f.domain, { ph: 'congty.com.vn', hint: t('ad.ac.domainH') })}
        ${S.field('adp', e, 'inviteDays', t('ad.ac.inv'), f.inviteDays, { mode: 'numeric' })}
        ${S.field('adp', e, 'idle', t('ad.ac.idle'), f.idle, { mode: 'numeric' })}${S.field('adp', e, 'reauth', t('ad.ac.reauth'), f.reauth, { mode: 'numeric' })}</div>
        <fieldset class="fs"><legend>${esc(t('ad.ac.two'))}</legend>${['Admin', 'Approver', 'Finance', 'Buyer', 'Supplier'].map((r) => `<label class="chk"><input type="checkbox" name="twoStep" value="${r}"${f.twoStep.includes(r) ? ' checked' : ''}> ${esc(tv(r))}</label>`).join('')}</fieldset>
        <p class="small muted mt-0">${esc(t('ad.ac.cfg'))}</p><div class="row-acts"><button type="submit" class="btn btn-sm btn-p">${esc(t('ad.ac.save'))}</button></div></form>`)];
    }
    return page({ title: t('nav.a.access'), subtitle: esc(t('ad.ac.sub')), alerts: App.unknownSub(ASUBS, subArg), kpis, subnav: App.subnav('admin/access', ASUBS, cur), blocks });
  }

  /* ---------- F-102 approval matrix & delegation ---------- */
  const MSUBS = [['', 'ad.mx.bands'], ['delegation', 'ad.mx.deleg']];
  function matrix(subArg) {
    const cur = App.sub(MSUBS, subArg || '');
    const B = D().approvalBands; const R = D().approvalRules; const DP = D().delegPolicy; const g = D().delegation;
    const kpis = [kpi(t('ad.k.b1'), `≤ ${App.ty(B[0][0])}`, esc(tv('Dept head'))), kpi(t('ad.k.b2'), `≤ ${App.ty(B[1][0])}`, esc(tv('Procurement Lead'))), kpi(t('ad.k.extra'), `${R.filter((r) => r.on).length} / ${R.length}`, ''),
      kpi(t('ad.k.dl'), g ? esc(tv(S.dlgActive() ? 'Active' : 'Scheduled')) : '—', g ? esc(`${g.from} – ${g.until}`) : '', g && S.dlgActive() ? 'success' : '')];
    let blocks;
    if (cur === 'delegation') {
      const dl = st.dl; const de = st.dlErr;
      const dform = dl ? `<form id="ad-dl" class="stack mt decide-panel" novalidate><div class="form-grid">${S.field('add', de, 'from', t('ad.sd.from'), dl.from_u, { options: staff().map((u) => [u.name, u.name]), dis: true })}${S.field('add', de, 'to', t('ad.sd.to'), dl.to, { options: staff().map((u) => [u.name, u.name]) })}${S.field('add', de, 'start', t('ad.sd.start'), dl.start, { ph: 'dd/mm/yyyy', req: true })}${S.field('add', de, 'until', t('ad.sd.until'), dl.until, { ph: 'dd/mm/yyyy', req: true, hint: t('ad.sd.untilH', { n: DP.maxDays }) })}${S.field('add', de, 'cap', t('ad.sd.cap'), dl.cap, { mode: 'numeric', hint: t('ad.sd.capH', { v: App.ty(DP.cap) }) })}</div>
        <fieldset class="fs"><legend>${esc(t('ad.sd.itemTypes'))}</legend>${['PR approval', 'PO approval', 'PO change order', 'Invoice exception'].map((x) => `<label class="chk"><input type="checkbox" name="types" value="${x}"${dl.types.includes(x) ? ' checked' : ''}> ${esc(tv(x))}</label>`).join('')}${de.types ? `<span class="err" role="alert">${esc(t(de.types))}</span>` : ''}</fieldset>${btns('dl-cancel', t('ad.sd.save'))}</form>` : '';
      blocks = [block(t('ad.dp.title'), `<dl class="dl"><dt>${esc(t('ad.dp.max'))}</dt><dd>${esc(t('c.days', { n: DP.maxDays }))}</dd><dt>${esc(t('ad.dp.cap'))}</dt><dd>${esc(t('ad.dp.capV', { v: App.ty(DP.cap) }))}</dd><dt>${esc(t('ad.dp.bulk'))}</dt><dd>${esc(t('ad.dp.bulkV', { v: vnd(D().bulkLimit) }))}</dd><dt>SoD</dt><dd>${esc(t('ad.dp.sodV'))}</dd></dl>`, { span: 6 }),
        block(t('ad.sd.title'), (g ? `<p class="mt-0"><b>Nguyễn Minh Anh → ${esc(g.to)}</b> · ${esc(g.from)} – ${esc(g.until)} ${pill(S.dlgActive() ? 'Active' : 'Scheduled', S.dlgActive() ? 'success' : 'info')}</p><p class="small">${esc(t('ad.sd.types', { t: g.types.map(tv).join(', '), c: vnd(g.cap), a: g.above }))}</p>` : `<p class="small muted mt-0">${esc(t('ad.sd.none'))}</p>`) + dform,
          { span: 6, actions: dl ? '' : `<button class="btn btn-sm btn-p" data-ad="dl-open">${esc(t(g ? 'c.edit' : 'ad.sd.schedule'))}</button>` })];
    } else {
      const m = st.mx; const me = st.mxErr;
      const bands = [[`≤ ${App.ty(B[0][0])}`, 'Dept head'], [`≤ ${App.ty(B[1][0])}`, 'Dept head → Procurement Lead'], [`> ${App.ty(B[1][0])}`, 'Dept head → Procurement Lead → Finance Director']];
      const mform = m ? `<form id="ad-mx" class="stack mt decide-panel" novalidate><div class="form-grid">${S.field('adm', me, 'b1', t('ad.mx.b1'), m.b1, { mode: 'numeric' })}${S.field('adm', me, 'b2', t('ad.mx.b2'), m.b2, { mode: 'numeric' })}${S.field('adm', me, 'capex', t('ad.mx.capex'), m.capex, { mode: 'numeric' })}</div>
        <fieldset class="fs"><legend>${esc(t('ad.mx.extra'))}</legend>${R.map((r, i) => `<label class="chk"><input type="checkbox" name="rules" value="${i}"${m.rules.includes(String(i)) ? ' checked' : ''}> ${esc(tv(r.rule).replace('1 tỷ ₫', App.ty(r.above || 0)))} → ${esc(tv(r.adds))}</label>`).join('')}</fieldset>${btns('mx-cancel', t('ad.mx.save'))}</form>` : '';
      const ruleText = (r) => tv(r.rule).replace('1 tỷ ₫', App.ty(r.above || 0));
      blocks = [block(t('ad.mx.vb'), table([{ h: t('ad.mx.val'), r: (b) => esc(b[0]), w: '150px' }, { h: t('ad.mx.route'), r: (b) => esc(tv(b[1])), w: 'minmax(240px,2fr)' }], bands, { label: t('ad.mx.vb') }) + mform, { span: 6, actions: m ? '' : `<button class="btn btn-sm btn-p" data-ad="mx-open">${esc(t('ad.mx.edit'))}</button>` }),
        block(t('ad.mx.extra'), `<ul class="plain rows">${R.map((r) => `<li class="row-acts between"><span>${esc(ruleText(r))}<div class="small muted">${esc(t('ad.mx.adds', { a: tv(r.adds) }))}</div></span><span class="pill pill-${r.on ? 'success' : 'neutral'}">${esc(t(r.on ? 'ad.on' : 'ad.off'))}</span></li>`).join('')}</ul>`, { span: 6 })];
    }
    return page({ title: t('nav.a.matrix'), subtitle: esc(t('ad.mx.sub')), alerts: App.unknownSub(MSUBS, subArg), kpis, subnav: App.subnav('admin/matrix', MSUBS, cur), blocks });
  }

  /* ---------- F-106 categories & numbering ---------- */
  function categories() {
    const C = D().categories; const A = D().catAdmin; const c = st.cat;
    return page({ title: t('nav.a.categories'), subtitle: esc(t('ad.ca.sub')),
      kpis: [kpi(t('ad.k.cats'), String(C.length), ''), kpi(t('ad.k.mats'), num(D().materials.length), esc(t('c.inSample', { n: D().materials.length }))), kpi(t('ad.k.ses'), String(Object.values(A).filter((x) => /SES/.test(x.match)).length), '')],
      blocks: [block(t('ad.ca.title', { n: C.length }), table([
        { h: t('ad.ca.code'), r: (x) => `<b class="mono">${esc(x.code)}</b>`, w: '70px' }, { h: t('ad.ca.name'), r: (x) => esc(App.state.lang === 'vi' ? x.vi || x.name : x.name), w: 'minmax(140px,1.2fr)' },
        { h: t('ad.ca.range'), r: (x) => `<span class="mono small">${esc(x.code)}-${x.range[0]} … ${x.range[1]}</span>`, w: '190px' }, { h: t('ad.ca.next'), r: (x) => `<span class="mono">${esc(x.code)}-${x.next}</span>`, w: '110px' },
        { h: t('c.mids'), r: (x) => num(D().materials.filter((m) => m.id.startsWith(x.code)).length), cls: 'num', w: '100px' },
        { h: t('c.owner'), r: (x) => (c === x.code ? `<label class="sr" for="adc-o">${esc(t('c.owner'))}</label><select class="inp w-full" id="adc-o">${staff().map((u) => `<option value="${esc(u.name)}"${A[x.code].owner === u.name ? ' selected' : ''}>${esc(u.name)}</option>`).join('')}</select>` : esc(A[x.code].owner)), w: 'minmax(160px,1.3fr)' },
        { h: t('ad.ca.match'), r: (x) => (c === x.code ? `<label class="sr" for="adc-m">${esc(t('ad.ca.match'))}</label><select class="inp w-full" id="adc-m">${['3-way', '3-way (POD)', '2-way (SES)'].map((m) => `<option value="${m}"${A[x.code].match === m ? ' selected' : ''}>${esc(tv(m))}</option>`).join('')}</select>` : esc(tv(A[x.code].match))), w: 'minmax(130px,1fr)' },
        { h: '', r: (x) => (c === x.code ? `<button class="btn btn-sm btn-p" data-ad="cat-save" data-id="${x.code}">${esc(t('c.save'))}</button>` : `<button class="btn btn-sm" data-ad="cat-edit" data-id="${x.code}">${esc(t('c.edit'))}</button>`), w: '90px' }
      ], C, { label: t('nav.a.categories') }) + `<p class="small muted">${esc(t('ad.ca.note'))}</p>`)] });
  }
  function numbering() {
    const nx = (type, pre, w) => { const xs = D().docs.filter((d) => d.type === type && d.id.startsWith(pre)).map((d) => +d.id.slice(pre.length)); return xs.length ? pre + String(Math.max(...xs) + 1).padStart(w, '0') : pre + '1'.padStart(w, '0'); };
    const next = { 'Purchase request': nx('PR', 'PR-2026-', 4), Tender: nx('TND', 'TND-2026-', 3), 'Purchase order': nx('PO', 'PO-2026-', 4), Contract: nx('CT', 'CT-2026-', 3), 'Goods receipt': nx('GRN', 'GRN-2026-', 4), 'Non-conformance': nx('NCR', 'NCR-2026-', 3), 'Invoice (internal)': nx('INV', 'INV-2026-', 4), Vendor: 'V-' + (Math.max(...D().vendors.map((v) => +v.id.slice(2))) + 1) };
    const N = D().numbering;
    return page({ title: t('nav.a.numbering'), subtitle: esc(t('ad.nu.sub')),
      kpis: [kpi(t('ad.k.docTypes'), String(N.length), ''), kpi(t('ad.k.nextPr'), `<span class="mono">${esc(next['Purchase request'])}</span>`, ''), kpi(t('ad.k.nextPo'), `<span class="mono">${esc(next['Purchase order'])}</span>`, ''), kpi(t('ad.k.reuse'), esc(t('ad.never')), '', 'success')],
      blocks: [block(t('ad.nu.title', { n: N.length }), table([
        { h: t('ad.nu.doc'), r: (r) => esc(tv(r[0])), w: 'minmax(160px,1.4fr)' }, { h: t('ad.nu.fmt'), r: (r) => `<span class="mono">${esc(r[1])}</span>`, w: '160px' },
        { h: t('ad.nu.next'), r: (r) => `<span class="mono">${esc(tv(next[r[0]] || r[2] || '—'))}</span>`, w: '190px' }, { h: t('ad.nu.rule'), r: (r) => esc(tv(r[3])), w: 'minmax(220px,2fr)' }
      ], N, { label: t('nav.a.numbering') }) + `<p class="small muted">${esc(t('ad.nu.note'))}</p>`)] });
  }

  /* ---------- F-104 tolerances ---------- */
  function tolerances() {
    const T = D().tolerance; const R = D().toleranceRule; const f = st.tol || { price: num(T.price, 1), qty: num(T.qty, 0), over: R.over, ncr: R.ncrBlocks, hist: R.priceToHistory, srv: R.srv2way }; const e = st.tErr;
    return page({ title: t('nav.a.tolerances'), subtitle: esc(t('ad.to.sub')),
      kpis: [kpi(t('ad.to.p'), `±${num(T.price, 1)}%`, ''), kpi(t('ad.to.q'), `±${num(T.qty, 0)}%`, 'tấn, m³'), kpi(t('ad.to.over'), esc(tv(/Warn/.test(R.over) ? 'Warn' : 'Block')), '')],
      blocks: [block(t('ad.to.title'), `<form id="ad-tol" class="stack" novalidate><div class="form-grid">${S.field('adt', e, 'price', t('ad.to.price'), f.price, { mode: 'decimal', hint: t('ad.to.priceH') })}${S.field('adt', e, 'qty', t('ad.to.qty'), f.qty, { mode: 'decimal', hint: t('ad.to.qtyH') })}
        ${S.field('adt', e, 'over', t('ad.to.over'), f.over, { options: [[D().toleranceRule.over, tv(D().toleranceRule.over)], ['Warn only (no hold)', t('ad.warnOnly')]] })}</div>
        <fieldset class="fs"><legend>${esc(t('ad.to.rules'))}</legend><label class="chk"><input type="checkbox" name="ncr" value="1"${f.ncr ? ' checked' : ''}> ${esc(t('ad.to.ncr'))}</label><label class="chk"><input type="checkbox" name="hist" value="1"${f.hist ? ' checked' : ''}> ${esc(t('ad.to.hist'))}</label><label class="chk"><input type="checkbox" name="srv" value="1"${f.srv ? ' checked' : ''}> ${esc(t('ad.to.srv'))}</label></fieldset>
        <p class="small muted mt-0">${esc(t('ad.to.cfg'))}</p><div class="row-acts"><button type="submit" class="btn btn-sm btn-p">${esc(t('ad.to.save'))}</button></div></form>`, { span: 6 }),
      block(t('ad.to.force'), `<dl class="dl"><dt>${esc(t('ad.to.p'))}</dt><dd>±${num(T.price, 1)}%</dd><dt>${esc(t('ad.to.q'))}</dt><dd>±${num(T.qty, 0)}% (tấn, m³)</dd><dt>${esc(t('ad.to.by'))}</dt><dd>${esc(R.by ? t('ad.to.byV', R.by) : tv(R.approvedBy))}</dd></dl><p class="small muted">${esc(t('ad.to.ex'))}</p>`, { span: 6 })] });
  }

  /* ---------- F-107 integrations ---------- */
  const ISUBS = [['', 'ad.in.conn'], ['mappings', 'ad.in.map'], ['log', 'ad.in.log']];
  function integrations(subArg) {
    const cur = App.sub(ISUBS, subArg || ''); const I = D().integrations; const M = D().itemMap; const un = Object.entries(M).filter(([, v]) => !v); const VM = D().vendorMap; const L = D().syncLog;
    const kpis = [kpi(t('ad.k.warn'), String(I.filter((i) => i.status !== 'OK').length), '', I.some((i) => i.status !== 'OK') ? 'danger' : 'success'), kpi(t('ad.k.unmapped'), String(un.length), '', un.length ? 'warning' : ''),
      kpi(t('ad.k.failed'), String(L.filter((l) => l.status === 'Failed').length), '', L.some((l) => l.status === 'Failed') ? 'danger' : ''), kpi(t('ad.in.vm'), `${num(VM.mapped)} / ${num(VM.total)}`, '')];
    let blocks;
    if (cur === 'mappings') blocks = [block(t('ad.in.mapT', { n: un.length }), table([
        { h: t('c.mid'), r: ([k]) => `<span class="mid">${esc(k)}</span><div class="small">${esc((App.material(k) || {}).name || '')}</div>`, w: 'minmax(180px,2fr)' },
        { h: t('ad.in.code'), r: ([k, v]) => (v ? `<span class="mono">${esc(v)}</span>` : `<label class="sr" for="adx-${esc(k)}">${esc(t('ad.in.codeFor', { m: k }))}</label><input class="inp w-full" id="adx-${esc(k)}" data-map="${esc(k)}" value="${esc(st.map[k] || '')}" placeholder="152-…"${st.map['_e' + k] ? ` aria-invalid="true" aria-describedby="adx-${esc(k)}-e"` : ''}>${st.map['_e' + k] ? `<span class="err small" id="adx-${esc(k)}-e" role="alert">${esc(t(st.map['_e' + k]))}</span>` : ''}`), w: 'minmax(180px,1.6fr)' },
        { h: t('c.status'), r: ([, v]) => `<span class="pill pill-${v ? 'success' : 'danger'}">${esc(t(v ? 'ad.in.mapped' : 'ad.in.unmapped'))}</span>`, w: '120px' }
      ], Object.entries(M).sort((a, b) => (a[1] ? 1 : 0) - (b[1] ? 1 : 0)), { label: t('ad.in.map') }), { span: 6, actions: un.length ? `<button class="btn btn-sm btn-p" data-ad="map-save">${esc(t('ad.in.save'))}</button>` : '' }),
      block(t('ad.in.vm'), `<p class="mt-0">${esc(t('ad.in.vmV', { a: num(VM.mapped), b: num(VM.total), u: VM.unmapped || t('c.none') }))}</p>`, { span: 6 })];
    else if (cur === 'log') blocks = [block(t('ad.in.log'), table([
        { h: t('ad.sod.when'), r: (l) => `<span class="nowrap">${esc(l.at)}</span>`, w: '140px' }, { h: t('ad.in.job'), r: (l) => esc(tv(l.job)), w: 'minmax(150px,1.2fr)' },
        { h: t('c.status'), r: (l) => pill(l.status, tone(l.status)), w: '150px' }, { h: t('ad.in.detail'), r: (l) => esc(tv(l.detail)), w: 'minmax(240px,2.2fr)' },
        { h: '', r: (l) => (l.status === 'Failed' ? `<button class="btn btn-sm btn-p" data-ad="retry" data-i="${L.indexOf(l)}">${esc(t('ad.in.retry'))}</button>` : ''), w: '100px' }
      ], L, { label: t('ad.in.log') }))];
    else blocks = [block(t('ad.in.connT', { n: I.length }), table([
        { h: t('ad.in.name'), r: (i) => `<b>${esc(tv(i.name))}</b><div class="small muted">${esc(tv(i.note))}</div>`, w: 'minmax(260px,2.4fr)' }, { h: t('c.status'), r: (i) => pill(i.status, tone(i.status)), w: '120px' }, { h: t('ad.in.last'), r: (i) => `<span class="nowrap">${esc(i.last)}</span>`, w: '150px' }
      ], I, { label: t('ad.in.conn') }))];
    return page({ title: t('nav.a.integrations'), subtitle: esc(t('ad.in.sub')), alerts: App.unknownSub(ISUBS, subArg), kpis,
      subnav: App.subnav('admin/integrations', ISUBS.map((x) => (x[0] === 'mappings' && un.length ? [x[0], x[1], String(un.length)] : x[0] === 'log' && L.some((l) => l.status === 'Failed') ? [x[0], x[1], '!'] : x)), cur), blocks });
  }

  /* ---------- F-105 notification rules ---------- */
  function rules() {
    const R = D().notifRules; const CH = ['In-app', 'Gmail', 'Portal']; const G = D().digest; const nr = st.nr;
    const grid = `<form id="ad-rules" class="stack" novalidate><div class="tbl-wrap" tabindex="0" role="region" aria-label="${esc(t('c.scrolls', { label: t('nav.a.rules') }))}"><div class="tbl" role="table" style="min-width:940px"><div class="tr thead nr-cols" role="row"><div class="th">${esc(t('ad.nr.ev'))}</div><div class="th">${esc(t('ad.nr.rem'))}</div><div class="th">${esc(t('ad.nr.esc'))}</div>${CH.map((c) => `<div class="th">${esc(tv(c))}</div>`).join('')}<div class="th">${esc(t('ad.nr.last'))}</div></div>
      ${R.map((r, i) => `<div class="tr nr-cols" role="row"><div class="td" role="cell">${esc(tv(r.ev))}</div><div class="td" role="cell"><label class="sr" for="adr-r${i}">${esc(t('ad.nr.remFor', { e: tv(r.ev) }))}</label><input class="inp w-full" id="adr-r${i}" name="r${i}" value="${esc(tv(r.remind))}"></div><div class="td" role="cell"><label class="sr" for="adr-e${i}">${esc(t('ad.nr.escFor', { e: tv(r.ev) }))}</label><input class="inp w-full" id="adr-e${i}" name="e${i}" value="${esc(tv(r.esc))}"></div>
        ${CH.map((c) => `<div class="td" role="cell"><label class="chk"><input type="checkbox" id="adr-c${i}-${c.replace(/\W/g, '')}" name="c${i}" value="${c}"${r.ch.includes(c) ? ' checked' : ''}><span class="sr"> ${esc(t('ad.nr.chFor', { c: tv(c), e: tv(r.ev) }))}</span></label></div>`).join('')}<div class="td small" role="cell">${esc(tv(r.last))}</div></div>`).join('')}</div></div>
      ${st.nrErr ? `<div class="alert alert-danger" role="alert">${esc(Array.isArray(st.nrErr) ? t(st.nrErr[0], st.nrErr[1]) : t(st.nrErr))}</div>` : ''}
      <fieldset class="fs"><legend>${esc(t('ad.nr.digest'))}</legend><label class="chk"><input type="checkbox" id="adr-dg" name="dg" value="1"${G.on ? ' checked' : ''}> ${esc(t('ad.nr.dg'))}</label><div class="field"><label for="adr-dt">${esc(t('ad.nr.time'))}</label><input id="adr-dt" class="inp" name="dt" value="${esc(G.time)}" placeholder="hh:mm"></div></fieldset>
      <p class="small muted mt-0">${esc(t('ad.nr.cfg'))}</p><div class="row-acts"><button type="submit" class="btn btn-sm btn-p">${esc(t('ad.nr.save'))}</button></div></form>`;
    const add = nr ? `<form id="ad-nr" class="stack mt decide-panel" novalidate><div class="form-grid">${S.field('adn', nr.e || {}, 'ev', t('ad.nr.ev'), nr.ev, { req: true, ph: t('ad.nr.evPh') })}${S.field('adn', {}, 'remind', t('ad.nr.rem'), nr.remind, { ph: t('ad.nr.remPh') })}${S.field('adn', {}, 'esc', t('ad.nr.esc'), nr.esc, { ph: t('ad.nr.escPh') })}</div>${btns('nr-cancel', t('ad.nr.add'))}</form>` : '';
    return page({ title: t('nav.a.rules'), subtitle: esc(t('ad.nr.sub')),
      kpis: [kpi(t('ad.k.rules'), String(R.length), ''), kpi(t('ad.k.portal'), String(R.filter((r) => r.ch.includes('Portal')).length), ''), kpi(t('ad.k.digest'), G.on ? esc(G.time) : esc(t('ad.off')), '', G.on ? 'success' : '')],
      blocks: [block(t('ad.nr.title', { n: R.length }), grid + add, { actions: nr ? '' : `<button class="btn btn-sm" data-ad="nr-open">${esc(t('ad.nr.add'))}</button>` })] });
  }

  /* ---------- F-103 SoD ---------- */
  const SSUBS = [['', 'ad.sod.rules'], ['overrides', 'ad.sod.ovr']];
  function sod(subArg) {
    const cur = App.sub(SSUBS, subArg || ''); const R = D().sodRules; const V = D().sodViolations; const L = D().sodLog || []; const f = st.sod;
    const kpis = [kpi(t('ad.k.block'), `${R.filter((r) => r[1] === 'Block').length} / ${R.length}`, ''), kpi(t('ad.k.viol'), String(V.reduce((a, x) => a + x, 0)), '', V.some((x) => x) ? 'warning' : ''), kpi(t('ad.k.ovr'), String(L.length), '')];
    const blocks = cur === 'overrides' ? [block(t('ad.sod.ovrN', { n: L.length }), table([
      { h: t('ad.sod.item'), r: (x) => `<span class="mono">${esc(x.id)}</span>`, w: '170px' }, { h: t('ad.sod.by'), r: (x) => esc(x.by), w: '150px' }, { h: t('ad.sod.when'), r: (x) => esc(x.at), w: '150px' }, { h: t('ad.sod.reason'), r: (x) => esc(tv(x.reason)), w: 'minmax(240px,2fr)' }
    ], L.slice().reverse(), { label: t('ad.sod.ovr'), empty: t('ad.sod.none') }))]
      : [block(t('ad.sod.rulesN', { n: R.length }), `<form id="ad-sod" class="stack" novalidate>${table([
        { h: t('ad.sod.rule'), r: (r) => esc(tv(r[0])), w: 'minmax(280px,2.4fr)' },
        { h: t('ad.sod.mode'), r: (r) => { const i = R.indexOf(r); return `<label class="sr" for="ads-m${i}">${esc(t('ad.sod.modeFor', { r: tv(r[0]) }))}</label><select class="inp w-full" id="ads-m${i}" name="m${i}">${['Block', 'Warn'].map((m) => `<option value="${m}"${r[1] === m ? ' selected' : ''}>${esc(tv(m))}</option>`).join('')}</select>`; }, w: '130px' },
        { h: t('ad.sod.viol'), r: (r) => num(V[R.indexOf(r)] || 0), cls: 'num', w: '150px' }
      ], R, { label: t('ad.sod.rules') })}<div class="row-acts"><button type="submit" class="btn btn-sm btn-p">${esc(t('ad.sod.save'))}</button></div></form>
      ${f ? `<form id="ad-sodn" class="stack mt decide-panel" novalidate><div class="form-grid">${S.field('adsn', st.sErr, 'a', t('ad.sod.a'), f.a, { req: true, ph: t('ad.sod.aPh') })}${S.field('adsn', st.sErr, 'b', t('ad.sod.b'), f.b, { req: true, ph: t('ad.sod.bPh') })}${S.field('adsn', {}, 'mode', t('ad.sod.mode'), f.mode, { options: ['Block', 'Warn'] })}</div>${btns('sod-cancel', t('ad.nr.add'))}</form>` : ''}`, { actions: f ? '' : `<button class="btn btn-sm" data-ad="sod-open">${esc(t('ad.nr.add'))}</button>` })];
    return page({ title: t('nav.a.sod'), subtitle: esc(t('ad.sod.sub')), alerts: App.unknownSub(SSUBS, subArg), kpis, subnav: App.subnav('admin/sod', SSUBS, cur), blocks });
  }

  /* ---------- F-108 audit ---------- */
  function audit_() {
    const A = D().audit.slice().sort((a, b) => { const k = (s) => { const [d, x] = s.split(' '); return App.dt(d).getTime() + (x ? +x.replace(':', '') : 0); }; return k(b.at) - k(a.at); });
    const f = st.au; const users = [...new Set(A.map((x) => x.user))]; const types = ['Settings', 'Sign-in', 'Bids and tenders', 'Overrides', 'Data privacy', 'Orders', 'Invoices'];
    const rows = A.filter((x) => (f.user === 'all' || x.user === f.user) && (f.type === 'all' || x.type === f.type) && (!f.q.trim() || App.matches(`${x.action} ${App.ntext(x)} ${x.ref}`, f.q)));
    return page({ title: t('nav.a.audit'), subtitle: esc(t('ad.au.sub', { y: D().auditStats.years, n: num(D().auditStats.total) })),
      actions: `<button class="btn" data-act="toast" data-msg="${esc(t('ad.au.exportMsg', { d: D().today.replace(/\//g, ''), n: rows.length }))}">${esc(t('ad.au.export'))}</button>`,
      kpis: [kpi(t('ad.k.today'), String(A.filter((x) => x.at.startsWith(D().today)).length), ''), kpi(t('ad.k.ovrAu'), String(A.filter((x) => x.type === 'Overrides').length), '', 'danger'), kpi(t('ad.k.privacy'), String(A.filter((x) => x.type === 'Data privacy').length), ''), kpi(t('ad.k.kept'), esc(t('ad.years', { n: D().auditStats.years })), esc(num(D().auditStats.total)))],
      blocks: [block(t('ad.au.title', { n: rows.length }), `<div class="filters"><label class="sr" for="adl-q">${esc(t('c.search'))}</label><input class="inp grow" id="adl-q" type="search" data-auf="q" value="${esc(f.q)}" placeholder="${esc(t('ad.au.ph'))}">
        <label class="sr" for="adl-u">${esc(t('ad.c.user'))}</label><select class="inp" id="adl-u" data-auf="user"><option value="all">${esc(t('ad.au.allU'))}</option>${users.map((u) => `<option value="${esc(u)}"${f.user === u ? ' selected' : ''}>${esc(tv(u))}</option>`).join('')}</select>
        <label class="sr" for="adl-t">${esc(t('ad.au.type'))}</label><select class="inp" id="adl-t" data-auf="type"><option value="all">${esc(t('ad.au.allT'))}</option>${types.map((x) => `<option value="${x}"${f.type === x ? ' selected' : ''}>${esc(tv(x))}</option>`).join('')}</select></div>`
        + table([
          { h: t('ad.sod.when'), r: (x) => `<span class="nowrap">${esc(x.at)}</span>`, w: '140px' }, { h: t('ad.c.user'), r: (x) => esc(tv(x.user)), w: 'minmax(160px,1.3fr)' },
          { h: t('c.type'), r: (x) => pill(x.type, x.type === 'Overrides' ? 'danger' : x.type === 'Bids and tenders' ? 'info' : 'neutral'), w: '150px' },
          { h: t('ad.au.action'), r: (x) => esc(App.ntext(x)), w: 'minmax(260px,2.4fr)' }, { h: t('ad.au.ref'), r: (x) => (x.ref ? `<span class="mono small">${esc(tv(x.ref))}</span>` : '—'), w: 'minmax(120px,1fr)' }
        ], rows.slice(0, f.n), { label: t('nav.a.audit'), empty: t('ad.au.none') })
        + (rows.length > f.n ? `<div class="row-acts"><button class="btn btn-sm" data-ad="more">${esc(t('ad.au.more', { n: rows.length - f.n }))}</button></div>` : `<p class="small muted">${esc(t('ad.au.end'))}</p>`))] });
  }

  /* ---------- events ---------- */
  function mount(root) {
    const rerender = (id) => { App.render(); if (id) { const x = document.getElementById(id); if (x) { x.focus(); if (x.setSelectionRange && x.type === 'search') x.setSelectionRange(x.value.length, x.value.length); } } };
    root.addEventListener('input', (e) => { const k = e.target.dataset.adf; if (k === 'q') { st.q = e.target.value; rerender(e.target.id); } const a = e.target.dataset.auf; if (a === 'q') { st.au.q = e.target.value; st.au.n = 10; rerender(e.target.id); } if (e.target.dataset.map) st.map[e.target.dataset.map] = e.target.value; });
    root.addEventListener('change', (e) => {
      const k = e.target.dataset.adf; if (k && k !== 'q') { st[k] = e.target.value; rerender(e.target.id); }
      const a = e.target.dataset.auf; if (a && a !== 'q') { st.au[a] = e.target.value; st.au.n = 10; rerender(e.target.id); }
      if (e.target.id === 'adi-role' && st.inv) { Object.assign(st.inv, S.read(root, '#ad-inv')); rerender('adi-role'); }
    });
    root.addEventListener('submit', (e) => {
      const f = e.target; if (!f.id || !/^ad-/.test(f.id)) return; e.preventDefault();
      if (f.id === 'ad-inv') {
        const x = Object.assign(st.inv, S.read(root, '#ad-inv')); const er = {}; x.email = (x.email || '').toLowerCase();
        if (!isGmailOk(x.email)) er.email = D().access.domain ? ['ad.i.eDomain', { d: D().access.domain }] : 'ad.i.eGmail'; else if (D().users.some((u) => u.email === x.email)) er.email = 'ad.i.eDup';
        if ((x.name || '').length < 3) er.name = 'ad.i.eName';
        st.ierr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#ad-inv'); return; }
        const v = x.role === 'supplier' && App.vendor(x.vendor);
        D().users.push({ email: x.email, name: x.name, title: v ? `Supplier user · ${v.id}` : (x.title || 'Buyer'), roles: [x.role], vendor: v ? v.id : undefined, status: 'Invited', invited: D().today, inviteCode: 'PL-INV-' + Math.random().toString(36).slice(2, 6).toUpperCase(), twoStep: false });
        if (!D().access.allowlist.includes(x.email)) D().access.allowlist.push(x.email); D().userStats.invites++;
        audit('Settings', 'au.a.invite', { e: x.email, r: x.role }, x.email); st.inv = null; App.render(); App.toast(t('ad.i.sent', { e: x.email, d: D().access.inviteDays }));
      } else if (f.id === 'ad-roles') {
        const u = D().users.find((y) => y.email === st.edit); const x = S.read(root, '#ad-roles'); const roles = u.vendor ? ['supplier'] : x.roles || [];
        if (!roles.length) { st.eerr = 'ad.e.keep'; App.render(); return; }
        if (u.name === S.me() && !roles.includes('admin')) { st.eerr = 'ad.e.self'; App.render(); return; }
        const before = u.roles.join(', '); u.roles = roles; u.twoStep = (x.two || []).length > 0; st.edit = null; st.eerr = '';
        audit('Settings', 'au.a.roles', { a: before, b: roles.join(', '), two: u.twoStep ? 'On' : 'Off' }, u.email); App.render(); App.toast(t('ad.t.roles', { n: u.name }));
      } else if (f.id === 'ad-del') {
        const u = D().users.find((y) => y.email === st.del); const r = S.read(root, '#ad-del').reason || '';
        if (r.length < 5) { st.derr = 'ad.d.eReason'; App.render(); S.focusErr('#ad-del'); return; }
        const old = u.email; const pid = 'U-' + String(D().users.indexOf(u) + 1).padStart(4, '0');
        Object.assign(u, { name: `Deleted user ${pid}`, email: `${pid.toLowerCase()}@deleted.invalid`, status: 'Deleted (anonymised)', roles: [], twoStep: false, consent: null });
        D().access.allowlist = D().access.allowlist.filter((m) => m !== old);
        audit('Data privacy', 'au.a.del', { id: pid, r }, pid); st.del = null; st.derr = ''; App.render(); App.toast(t('ad.d.deleted', { e: old, id: pid }));
      } else if (f.id === 'ad-pol') {
        const x = S.read(root, '#ad-pol'); const er = {}; const n = (k, lo, hi) => { const v = +x[k]; if (!(v >= lo && v <= hi)) er[k] = ['ad.ac.eRange', { a: lo, b: hi }]; return v; };
        const inviteDays = n('inviteDays', 1, 30), idle = n('idle', 5, 240), reauth = n('reauth', 1, 72);
        if (x.allow === 'Domain' && !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(x.domain || '')) er.domain = 'ad.ac.eDomain';
        if (!(x.twoStep || []).includes('Admin')) er.method = 'ad.ac.e2';
        st.pol = Object.assign({}, D().access, x, { twoStep: x.twoStep || [] }); st.perr = er;
        if (Object.keys(er).length) { App.render(); S.focusErr('#ad-pol'); return; }
        Object.assign(D().access, { method: x.method, allow: x.allow, domain: x.domain, inviteDays, idle, reauth, twoStep: x.twoStep });
        audit('Settings', 'au.a.policy', { a: x.allow, d: x.domain ? ' @' + x.domain : '', i: idle, h: reauth, v: inviteDays, two: x.twoStep.join('/') }, 'Access policy'); st.pol = null; App.render(); App.toast(t('ad.ac.saved'));
      } else if (f.id === 'ad-allow') {
        const m = (S.read(root, '#ad-allow').email || '').toLowerCase(); st.add = m;
        st.aerr = !isGmailOk(m) ? 'ad.al.eGmail' : D().access.allowlist.includes(m) ? 'ad.al.eDup' : '';
        if (st.aerr) { App.render(); S.focusErr('#ad-allow'); return; }
        D().access.allowlist.push(m); audit('Settings', 'au.a.allowAdd', { e: m }, 'Access policy'); st.add = ''; App.render(); App.toast(t('ad.al.added', { e: m }));
      } else if (f.id === 'ad-pub') {
        const s = S.read(root, '#ad-pub').summary || ''; st.pub = { summary: s }; if (s.length < 10) { st.puerr = 'ad.pn.e'; App.render(); S.focusErr('#ad-pub'); return; }
        const P = D().privacy; const nv = 'v' + (+P.current.slice(1) + 0.1).toFixed(1); P.versions.forEach((v) => { if (v[2] === 'Current') v[2] = 'Superseded'; }); P.versions.unshift([nv, D().today, 'Current']); P.current = nv; P.published = D().today; P.accepted = 0;
        D().users.forEach((u) => { if (u.consent) { u.consentVer = 'Re-acceptance pending'; } });
        audit('Data privacy', 'au.a.pub', { v: nv, s }, 'Privacy notice'); st.pub = null; st.puerr = ''; App.render(); App.toast(t('ad.pn.done', { v: nv }));
      } else if (f.id === 'ad-mx') {
        const x = S.read(root, '#ad-mx'); const b1 = S.money(x.b1), b2 = S.money(x.b2), cx = S.money(x.capex); const er = {};
        if (!(b1 > 0)) er.b1 = 'ad.mx.eAmt'; if (!(b2 > b1)) er.b2 = 'ad.mx.eB2'; if (!(cx > 0)) er.capex = 'ad.mx.eAmt';
        st.mx = Object.assign(st.mx, x, { rules: x.rules || [] }); st.mxErr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#ad-mx'); return; }
        D().approvalBands[0][0] = b1; D().approvalBands[1][0] = b2; D().approvalRules.forEach((r, i) => { r.on = (x.rules || []).includes(String(i)); }); D().approvalRules[0].above = cx;
        audit('Settings', 'au.a.matrix', { a: vnd(b1), b: vnd(b2), c: vnd(cx) }, 'Approval matrix'); st.mx = null; App.render(); App.toast(t('ad.mx.saved'));
      } else if (f.id === 'ad-dl') {
        const x = S.read(root, '#ad-dl'); const er = {}; const DP = D().delegPolicy; const cap = S.money(x.cap);
        if (!S.validDate(x.start)) er.start = 'c.dateFmt'; if (!S.validDate(x.until)) er.until = 'c.dateFmt';
        else if (S.validDate(x.start)) { const days = (App.dt(x.until) - App.dt(x.start)) / 864e5 + 1; if (days < 1) er.until = 'ad.sd.eAfter'; else if (days > DP.maxDays) er.until = ['ad.sd.eMax', { n: DP.maxDays }]; }
        if (x.to === 'Nguyễn Minh Anh') er.to = 'ad.sd.eSelf'; if (!(cap > 0) || cap > DP.cap) er.cap = ['ad.ac.eRange', { a: 1, b: vnd(DP.cap) }]; if (!(x.types || []).length) er.types = 'ad.sd.eTypes';
        st.dl = Object.assign(st.dl, x, { types: x.types || [] }); st.dlErr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#ad-dl'); return; }
        D().delegation = { to: x.to, from: x.start, until: x.until, cap, types: x.types, above: 'Đỗ Hoàng Nam' };
        audit('Settings', 'au.a.deleg', { f: 'Nguyễn Minh Anh', to: x.to, s: x.start, u: x.until, c: vnd(cap) }, 'Approval matrix'); st.dl = null; App.render(); App.toast(t('ad.sd.saved'));
      } else if (f.id === 'ad-tol') {
        const x = S.read(root, '#ad-tol'); const p = Number(String(x.price).replace(',', '.')), q = Number(String(x.qty).replace(',', '.')); const er = {};
        if (!(p >= 0 && p <= 5)) er.price = 'ad.to.eP'; if (!(q >= 0 && q <= 10)) er.qty = 'ad.to.eQ';
        st.tol = { price: x.price, qty: x.qty, over: x.over, ncr: (x.ncr || []).length > 0, hist: (x.hist || []).length > 0, srv: (x.srv || []).length > 0 }; st.tErr = er; if (Object.keys(er).length) { App.render(); S.focusErr('#ad-tol'); return; }
        Object.assign(D().tolerance, { price: p, qty: q }); Object.assign(D().toleranceRule, { over: x.over, ncrBlocks: st.tol.ncr, priceToHistory: st.tol.hist, srv2way: st.tol.srv, approvedBy: `${S.me()} · ${D().today} (Finance confirmation requested)`, by: { u: S.me(), d: D().today } });
        audit('Settings', 'au.a.tol', { p: num(p, 1), q: num(q, 0) }, 'Tolerances'); st.tol = null; App.render(); App.toast(t('ad.to.saved'));
      } else if (f.id === 'ad-rules') {
        const x = S.read(root, '#ad-rules'); const R = D().notifRules;
        const bad = R.findIndex((r, i) => !(x['c' + i] || []).length); if (bad >= 0) { st.nrErr = ['ad.nr.eCh', { e: tv(R[bad].ev) }]; App.render(); return; }
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(x.dt || '')) { st.nrErr = 'ad.nr.eTime'; App.render(); return; }
        // Unchanged fields keep their stored (source) value, so data text stays translatable
        R.forEach((r, i) => { if (x['r' + i] !== tv(r.remind)) r.remind = x['r' + i]; if (x['e' + i] !== tv(r.esc)) r.esc = x['e' + i]; r.ch = x['c' + i]; }); Object.assign(D().digest, { on: (x.dg || []).length > 0, time: x.dt }); st.nrErr = '';
        audit('Settings', 'au.a.rules', { d: D().digest.on ? D().digest.time : 'off' }, 'Notification rules'); App.render(); App.toast(t('ad.nr.saved'));
      } else if (f.id === 'ad-nr') {
        const x = S.read(root, '#ad-nr'); if ((x.ev || '').length < 5) { st.nr = Object.assign(x, { e: { ev: 'ad.nr.eEv' } }); App.render(); S.focusErr('#ad-nr'); return; }
        D().notifRules.push({ ev: x.ev, remind: x.remind || '—', esc: x.esc || '—', ch: ['In-app'], last: 'Not run yet' }); audit('Settings', 'au.a.ruleAdd', { e: x.ev }, 'Notification rules'); st.nr = null; App.render(); App.toast(t('ad.nr.added'));
      } else if (f.id === 'ad-sod') {
        const x = S.read(root, '#ad-sod'); const ch = []; D().sodRules.forEach((r, i) => { if (x['m' + i] && x['m' + i] !== r[1]) { ch.push(r[0]); audit('Settings', 'au.a.sod', { r: r[0], a: r[1], b: x['m' + i] }, 'SoD rules'); r[1] = x['m' + i]; } }); App.render(); App.toast(ch.length ? t('ad.sod.updated', { n: ch.length }) : t('ad.sod.noCh'));
      } else if (f.id === 'ad-sodn') {
        const x = S.read(root, '#ad-sodn'); st.sod = x; st.sErr = {}; if (!x.a) st.sErr.a = 'sp.e.req'; if (!x.b) st.sErr.b = 'sp.e.req'; if (Object.keys(st.sErr).length) { App.render(); S.focusErr('#ad-sodn'); return; }
        D().sodRules.push([`${x.a} ≠ ${x.b}`, x.mode]); D().sodViolations.push(0); audit('Settings', 'au.a.sodAdd', { a: x.a, b: x.b, m: x.mode }, 'SoD rules'); st.sod = null; App.render(); App.toast(t('ad.sod.added'));
      }
    });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ad]'); if (!b) return; const a = b.dataset.ad; const id = b.dataset.id;
      const u = id && D().users.find((x) => x.email === id);
      if (a === 'edit') { st.edit = id; st.eerr = ''; App.render(); focus('#ad-roles input'); }
      else if (a === 'edit-cancel') { st.edit = null; App.render(); }
      else if (a === 'susp') { if (u.name === S.me()) { App.toast(t('ad.t.noSelf')); return; } u.status = u.status === 'Suspended' ? 'Active' : 'Suspended'; audit('Settings', u.status === 'Suspended' ? 'au.a.susp' : 'au.a.react', {}, u.email); App.render(); App.toast(t(u.status === 'Suspended' ? 'ad.t.susp' : 'ad.t.react', { n: u.name })); }
      else if (a === 'export') { const rid = 'DSR-2026-' + String(8 + D().dataRequests.length).padStart(3, '0'); D().dataRequests.unshift({ id: rid, user: u.email, kind: 'Export personal data', at: D().today, status: 'Delivered', due: D().today }); audit('Data privacy', 'au.a.export', { id: rid }, u.email); App.render(); App.toast(t('ad.t.export', { id: rid, e: u.email })); }
      else if (a === 'del') { if (u.name === S.me()) { App.toast(t('ad.t.noDelSelf')); return; } if (u.status === 'Active') { App.toast(t('ad.t.suspFirst')); return; } st.del = id; st.derr = ''; st.edit = null; location.hash = '#/admin/users/privacy'; }
      else if (a === 'del-cancel') { st.del = null; App.render(); }
      else if (a === 'dsr-done') { const r = D().dataRequests.find((x) => x.id === id); r.status = 'Delivered'; audit('Data privacy', 'au.a.dsr', { k: r.kind, id: r.id }, r.user); App.render(); App.toast(t('ad.t.dsr', { id: r.id })); }
      else if (a === 'allow-rm') { if (D().users.some((x) => x.email === id && x.status === 'Active')) { App.toast(t('ad.al.active')); return; } D().access.allowlist = D().access.allowlist.filter((m) => m !== id); audit('Settings', 'au.a.allowRm', { e: id }, 'Access policy'); App.render(); App.toast(t('ad.al.removed', { e: id })); }
      else if (a === 'pub-open') { st.pub = { summary: '' }; st.puerr = ''; App.render(); focus('#adb-summary'); }
      else if (a === 'pub-cancel') { st.pub = null; App.render(); }
      else if (a === 'mx-open') { const B = D().approvalBands; st.mx = { b1: num(B[0][0]), b2: num(B[1][0]), capex: num(D().approvalRules[0].above), rules: D().approvalRules.map((r, i) => (r.on ? String(i) : null)).filter((x) => x != null) }; st.mxErr = {}; App.render(); focus('#adm-b1'); }
      else if (a === 'mx-cancel') { st.mx = null; App.render(); }
      else if (a === 'dl-open') { const g = D().delegation || {}; st.dl = { from_u: 'Nguyễn Minh Anh', to: g.to || 'Lê Quốc Huy', start: g.from || '', until: g.until || '', cap: num(g.cap || 500000000), types: g.types || ['PR approval'] }; st.dlErr = {}; App.render(); focus('#add-to'); }
      else if (a === 'dl-cancel') { st.dl = null; App.render(); }
      else if (a === 'cat-edit') { st.cat = id; App.render(); focus('#adc-o'); }
      else if (a === 'cat-save') { const A = D().catAdmin[id]; const o = document.getElementById('adc-o').value, m = document.getElementById('adc-m').value; audit('Settings', 'au.a.cat', { id, a: A.owner, b: A.match, c: o, d: m }, 'Categories'); A.owner = o; A.match = m; st.cat = null; App.render(); App.toast(t('ad.ca.saved', { id })); }
      else if (a === 'map-save') { const M = D().itemMap; let n = 0; Object.keys(M).forEach((k) => { if (M[k]) return; const v = (st.map[k] || '').trim(); delete st.map['_e' + k]; if (!v) return; if (!/^\d{3}-[A-Z0-9-]{2,}$/i.test(v)) { st.map['_e' + k] = 'ad.in.eFmt'; return; } M[k] = v.toUpperCase(); n++; audit('Settings', 'au.a.map', { m: k, c: M[k] }, 'Integrations'); });
        App.render(); App.toast(n ? t('ad.in.savedN', { n, u: Object.values(M).filter((v) => !v).length }) : t('ad.in.nothing')); }
      else if (a === 'retry') { const l = D().syncLog[+b.dataset.i]; const miss = (l.detail.match(/([A-Z]{3}-\d{5}) has no item code/) || [])[1]; const ok = !miss || D().itemMap[miss]; const at = App.now();
        D().syncLog.unshift({ at, job: l.job, detail: ok ? l.detail.replace(/ · .*/, '') + ' · retried and exported' : `Retry failed · ${miss} still has no item code — map it first`, status: ok ? 'OK' : 'Failed' }); l.status = ok ? 'Resolved' : 'Failed (retried)';
        const acct = D().integrations.find((i) => i.key === 'acct'); if (ok && !D().syncLog.some((x) => x.status === 'Failed')) { acct.status = 'OK'; acct.last = at; } audit('Settings', 'au.a.retry', { j: l.job, r: ok ? 'OK' : 'Failed' }, 'Integrations'); App.render(); App.toast(t(ok ? 'ad.in.retryOk' : 'ad.in.retryFail')); }
      else if (a === 'nr-open') { st.nr = { ev: '', remind: '', esc: '' }; App.render(); focus('#adn-ev'); }
      else if (a === 'nr-cancel') { st.nr = null; App.render(); }
      else if (a === 'sod-open') { st.sod = { a: '', b: '', mode: 'Block' }; st.sErr = {}; App.render(); focus('#adsn-a'); }
      else if (a === 'sod-cancel') { st.sod = null; App.render(); }
      else if (a === 'more') { st.au.n += 10; App.render(); }
    });
  }
  const NOSUB = ['categories', 'numbering', 'tolerances', 'rules', 'audit'];
  const reg = (k, titleKey, fn) => App.page('admin/' + k, { titleKey, roles: ['admin'], render: (p, sub) => { if (st.cur !== k) { st.cur = k; st.inv = st.edit = st.del = st.pol = st.pub = st.mx = st.dl = st.cat = st.tol = st.nr = st.sod = null; st.ierr = {}; st.perr = {}; st.mxErr = {}; st.dlErr = {}; st.tErr = {}; st.sErr = {}; st.nrErr = ''; st.aerr = ''; } const html = fn(sub || ''); return NOSUB.includes(k) && sub ? `<div class="alert alert-warning" role="status">${esc(t('shell.unknownSub', { sub, first: t(titleKey) }))}</div>` + html : html; }, mount });
  reg('users', 'nav.a.users', users); reg('access', 'nav.a.access', access); reg('matrix', 'nav.a.matrix', matrix); reg('categories', 'nav.a.categories', categories);
  reg('numbering', 'nav.a.numbering', numbering); reg('tolerances', 'nav.a.tolerances', tolerances); reg('integrations', 'nav.a.integrations', integrations);
  reg('rules', 'nav.a.rules', rules); reg('sod', 'nav.a.sod', sod); reg('audit', 'nav.a.audit', audit_);
})();
