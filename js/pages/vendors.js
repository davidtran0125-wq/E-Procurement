/* Module 4 · Vendors — F-20 list & filters, F-21 risk (R-16), F-22 create/edit, F-23 MST check (R-04), F-24 bank change pending Finance (R-08),
   F-25 vendor – Material ID links, F-26 status & delete.
   Routes: #/vendors (list) · #/vendors/new · #/vendors/<id> (overview) · sub-functions /materials, /docs, /settings (status, bank, delete), /edit */
(function () {
  const { esc, num, pct, vnd, mid, pill, table, kpi, block, layout, t, tv } = App;
  const D = () => window.DATA;
  I18N.add({
    'vd.title': ['Vendors', 'Nhà cung cấp'], 'vd.subtitle': ['Vendor master · MST-verified, risk-rated and linked to the Material IDs they supply', 'Hồ sơ NCC · đã xác minh MST, xếp hạng rủi ro và gắn với mã vật tư cung cấp'],
    'vd.new': ['New vendor', 'Thêm NCC'], 'vd.sub.list': ['List', 'Danh sách'], 'vd.sub.new': ['New vendor', 'Thêm NCC'],
    'vd.k.vendors': ['Vendors', 'Nhà cung cấp'], 'vd.k.active': ['Active', 'Đang hoạt động'], 'vd.k.pending': ['Pending approval', 'Chờ duyệt'], 'vd.k.high': ['High risk', 'Rủi ro cao'],
    'vd.e.mstReq': ['MST is required.', 'Bắt buộc nhập MST.'], 'vd.e.mstFmt': ['MST format: 10 digits (enterprise), 10 digits + "-" + 3 digits for a branch (e.g. 0312456789-001), or a 12-digit personal ID.', 'MST: 10 chữ số (doanh nghiệp), 10 chữ số + "-" + 3 chữ số cho chi nhánh (VD: 0312456789-001), hoặc số định danh cá nhân 12 chữ số.'],
    'vd.e.branch': ['A branch MST must be added under its parent vendor. Choose the parent vendor.', 'MST chi nhánh phải thuộc NCC mẹ. Hãy chọn NCC mẹ.'], 'vd.e.parentMst': ["The first 10 digits must match the parent vendor's MST ({v}).", '10 chữ số đầu phải khớp MST của NCC mẹ ({v}).'],
    'vd.e.name': ['Company name is required.', 'Bắt buộc nhập tên công ty.'], 'vd.e.contact': ['Contact person is required.', 'Bắt buộc nhập người liên hệ.'],
    'vd.e.email': ['Enter the vendor’s Gmail address (used for portal sign-in and tender invitations).', 'Nhập Gmail của NCC (dùng để đăng nhập cổng NCC và nhận thư mời thầu).'], 'vd.e.emailDup': ['This Gmail is already used by another vendor.', 'Gmail này đã được NCC khác sử dụng.'],
    'vd.e.phone': ['Phone: 9–15 digits.', 'Điện thoại: 9–15 chữ số.'],
    'vd.mstIntro': ['Run “Check MST” to look up the registered name, address and tax status. A vendor cannot be approved for any Material ID until its MST is verified.', 'Bấm “Kiểm tra MST” để tra tên đăng ký, địa chỉ và tình trạng thuế. NCC chưa xác minh MST thì không được duyệt cho mã vật tư nào.'],
    'vd.gdt': ['Tax authority result · {at}', 'Kết quả cơ quan thuế · {at}'], 'vd.regName': ['Registered name', 'Tên đăng ký'], 'vd.address': ['Address', 'Địa chỉ'], 'vd.taxStatus': ['Tax status', 'Tình trạng thuế'],
    'vd.mismatch': ['Name mismatch: the company name differs from the registered name. Check before saving.', 'Tên không khớp: tên công ty khác tên đăng ký thuế. Kiểm tra trước khi lưu.'],
    'vd.editTitle': ['Edit vendor · {id}', 'Sửa NCC · {id}'], 'vd.dupMst': ['MST {mst} already belongs to {id} {name} — Save was blocked.', 'MST {mst} đã thuộc về {id} {name} — không thể lưu.'],
    'vd.f.name': ['Company name', 'Tên công ty'], 'vd.f.mst': ['Tax code (MST)', 'Mã số thuế (MST)'], 'vd.f.mstHint': ['10 digits · 10 + 3 for a branch (0312456789-001, under its parent) · 12-digit personal ID for individuals / household businesses', '10 chữ số · 10 + 3 cho chi nhánh (0312456789-001, thuộc NCC mẹ) · 12 chữ số cho cá nhân / hộ kinh doanh'],
    'vd.f.parent': ['Parent vendor (branch only)', 'NCC mẹ (chỉ cho chi nhánh)'], 'vd.f.terms': ['Payment terms', 'Điều khoản thanh toán'], 'vd.f.contact': ['Contact person', 'Người liên hệ'], 'vd.f.phone': ['Phone', 'Điện thoại'],
    'vd.f.email': ['Portal Gmail', 'Gmail cổng NCC'], 'vd.f.emailHint': ['Used for supplier portal sign-in and tender invitations', 'Dùng để đăng nhập cổng NCC và nhận thư mời thầu'], 'vd.f.city': ['City / province', 'Tỉnh / thành phố'],
    'vd.checkMst': ['Check MST', 'Kiểm tra MST'], 'vd.saveChanges': ['Save changes', 'Lưu thay đổi'], 'vd.create': ['Create vendor', 'Tạo NCC'], 'vd.statusStays': ['Status stays {s}.', 'Trạng thái giữ nguyên {s}.'],
    'vd.newNote': ['New vendors start as Pending approval: Procurement Lead → Finance (SoD: creator ≠ approver).', 'NCC mới ở trạng thái Chờ duyệt: Trưởng phòng Mua sắm → Tài chính (SoD: người tạo ≠ người duyệt).'],
    'vd.bankNote': ['Bank accounts are changed from the supplier portal and verified by Finance.', 'Tài khoản ngân hàng được đổi từ cổng NCC và do Tài chính xác minh.'],
    'vd.saved': ['{id} saved', 'Đã lưu {id}'], 'vd.savedRecheck': ['{id} saved · MST changed, re-check required', 'Đã lưu {id} · MST đã đổi, cần kiểm tra lại'], 'vd.created': ['{id} created · Pending approval (Procurement Lead → Finance)', 'Đã tạo {id} · Chờ duyệt (Trưởng phòng Mua sắm → Tài chính)'],
    'vd.searchLbl': ['Search vendors', 'Tìm nhà cung cấp'], 'vd.searchPh': ['Search name, MST, Gmail or Material ID', 'Tìm tên, MST, Gmail hoặc mã vật tư'], 'vd.risk': ['Risk', 'Rủi ro'], 'vd.grade': ['Grade', 'Hạng'],
    'vd.notVerified': ['Not verified', 'Chưa xác minh'], 'vd.supplied': ['Material IDs supplied', 'Mã vật tư cung cấp'], 'vd.editId': ['Edit {id}', 'Sửa {id}'], 'vd.delId': ['Delete {id}', 'Xóa {id}'],
    'vd.delBlockedTip': ['Open PO {po} — set to Blocked instead', 'Còn PO {po} đang mở — hãy chuyển sang Bị chặn'], 'vd.empty': ['No vendors match these filters', 'Không có NCC phù hợp bộ lọc'],
    'vd.showing': ['Showing {n} of 142 vendors (sample loaded) · risk last checked {at}', 'Hiển thị {n} / 142 NCC (dữ liệu mẫu) · rủi ro kiểm tra lần cuối {at}'], 'vd.recheck': ['Re-check risk', 'Kiểm tra lại rủi ro'],
    'vd.importMsg': ['Import Excel: template Vendor_import_v2.xlsx · MST is validated per row', 'Nhập Excel: mẫu Vendor_import_v2.xlsx · MST được kiểm tra từng dòng'],
    'vd.delQ': ['Delete {id} {name}? This removes the vendor and its Material ID links. Vendors with history are better set to Blocked.', 'Xóa {id} {name}? Thao tác này xóa NCC và các liên kết mã vật tư. NCC đã có lịch sử nên chuyển sang Bị chặn.'], 'vd.delVendor': ['Delete vendor', 'Xóa NCC'],
    'vd.sub.overview': ['Overview', 'Tổng quan'], 'vd.sub.materials': ['Material IDs', 'Mã vật tư'], 'vd.sub.docs': ['POs, contracts & certificates', 'PO, hợp đồng & chứng chỉ'], 'vd.sub.settings': ['Status & bank', 'Trạng thái & ngân hàng'], 'vd.sub.edit': ['Edit', 'Sửa'],
    'vd.scorecard': ['Scorecard', 'Bảng điểm'], 'vd.recheckMst': ['Re-check MST', 'Kiểm tra lại MST'], 'vd.editVendor': ['Edit vendor', 'Sửa NCC'], 'vd.riskLbl': ['Risk {p}', 'Rủi ro {p}'],
    'vd.k.score': ['Score', 'Điểm'], 'vd.k.notEval': ['Not evaluated', 'Chưa đánh giá'], 'vd.k.otif': ['OTIF (accepted qty)', 'OTIF (SL chấp nhận)'], 'vd.k.target': ['Target 95%', 'Mục tiêu 95%'], 'vd.k.mats': ['Material IDs', 'Mã vật tư'],
    'vd.k.proposed': ['{n} proposed', '{n} đề xuất'], 'vd.k.openPo': ['Open POs', 'PO đang mở'], 'vd.k.delBlocked': ['Delete is blocked', 'Không thể xóa'],
    'vd.profile': ['Company profile', 'Hồ sơ công ty'], 'vd.p.parent': ['Parent vendor', 'NCC mẹ'], 'vd.p.checked': ['checked {at}', 'kiểm tra {at}'], 'vd.p.regAddr': ['Registered address', 'Địa chỉ đăng ký'], 'vd.p.contact': ['Contact', 'Liên hệ'], 'vd.p.since': ['Vendor since', 'Hợp tác từ'],
    'vd.riskCard': ['Supplier risk', 'Rủi ro nhà cung cấp'], 'vd.lastChecked': ['Last checked {at}', 'Kiểm tra lần cuối {at}'], 'vd.noRisk': ['No risk factors found.', 'Không phát hiện yếu tố rủi ro.'],
    'vd.riskRules': ['Rules: tax status not Active (GDT), GDT high-risk list, mandatory certificate expired, OTIF < 85%, open NCRs, single source per Material ID. A High-risk vendor triggers a warning at PO creation.', 'Quy tắc: tình trạng thuế khác “Đang hoạt động”, danh sách rủi ro cao của Tổng cục Thuế, chứng chỉ bắt buộc hết hạn, OTIF < 85%, NCR đang mở, một nguồn theo mã vật tư. NCC rủi ro cao sẽ bị cảnh báo khi tạo PO.'],
    'vd.bank': ['Bank account', 'Tài khoản ngân hàng'], 'vd.inUse': ['In use', 'Đang dùng'], 'vd.bankPending': ['Pending Finance verification', 'Chờ Tài chính xác minh'],
    'vd.bankPendingN': ['new account {acc} requested {at} by {by}. The current account stays in use until Finance verifies it by call-back to the registered phone. SoD: the vendor-master editor cannot approve payments.', 'tài khoản mới {acc} được {by} yêu cầu ngày {at}. Tài khoản hiện tại vẫn dùng cho đến khi Tài chính gọi lại số điện thoại đăng ký để xác minh. SoD: người sửa hồ sơ NCC không được duyệt thanh toán.'],
    'vd.noPending': ['No pending change.', 'Không có thay đổi đang chờ.'], 'vd.openApprovals': ['Open in My approvals', 'Mở trong Chờ tôi duyệt'],
    'vd.matsTitle': ['Material IDs supplied ({n})', 'Mã vật tư cung cấp ({n})'], 'vd.linkStatus': ['Link status', 'Trạng thái liên kết'], 'vd.removeFrom': ['Remove {m} from {id}', 'Gỡ {m} khỏi {id}'], 'vd.noMats': ['No approved Material IDs yet', 'Chưa có mã vật tư được duyệt'],
    'vd.proposedLinks': ['Proposed links · approved per Material ID', 'Liên kết đề xuất · duyệt theo từng mã vật tư'], 'vd.approveLink': ['Approve link', 'Duyệt liên kết'], 'vd.toAdd': ['Material ID to add', 'Mã vật tư cần thêm'], 'vd.addMat': ['Add Material ID', 'Thêm mã vật tư'],
    'vd.mstNotVer': ['MST not verified — links stay Proposed until the MST check passes.', 'MST chưa xác minh — liên kết giữ trạng thái Đề xuất đến khi kiểm tra MST đạt.'],
    'vd.ob': ['Onboarding review checklist', 'Danh mục xét duyệt hồ sơ'], 'vd.markOk': ['Mark OK', 'Đánh dấu Đạt'], 'vd.obCount': ['{a} of {b} items OK. Approve needs every item OK.', '{a}/{b} mục Đạt. Cần tất cả mục Đạt mới được duyệt.'],
    'vd.rejReason': ['Reason for rejection', 'Lý do từ chối'], 'vd.confirmReject': ['Confirm reject', 'Xác nhận từ chối'], 'vd.toProbation': ['Approve → Probation', 'Duyệt → Theo dõi'], 'vd.toActive': ['Approve → Active', 'Duyệt → Hoạt động'],
    'vd.statusCard': ['Status & deletion', 'Trạng thái & xóa'], 'vd.statusLbl': ['Vendor status', 'Trạng thái NCC'], 'vd.statusNote': ['Active = Approved. Blocked vendors cannot be invited or receive new POs; open POs continue.', 'Hoạt động = Đã duyệt. NCC bị chặn không được mời thầu hay nhận PO mới; PO đang mở vẫn tiếp tục.'],
    'vd.delBlocked': ['Delete is blocked: open PO {pos}. Set the vendor to Blocked instead.', 'Không thể xóa: còn PO {pos} đang mở. Hãy chuyển NCC sang Bị chặn.'],
    'vd.docs': ['Open POs & contracts', 'PO đang mở & hợp đồng'], 'vd.noDocs': ['No open POs or contracts', 'Không có PO đang mở hay hợp đồng'], 'vd.certs': ['Certificates ({n})', 'Chứng chỉ ({n})'], 'vd.expires': ['expires {d}', 'hết hạn {d}'],
    'vd.noCerts': ['No certificates on file', 'Chưa có chứng chỉ'], 'vd.certReg': ['Certificate register', 'Sổ chứng chỉ'], 'vd.notFound': ['Vendor {id} was not found.', 'Không tìm thấy NCC {id}.'], 'vd.back': ['Back to vendors', 'Về danh sách NCC'],
    'vd.gdt.active': ['Active (operating)', 'Đang hoạt động'], 'vd.gdt.inactive': ['Ceased operating', 'Ngừng hoạt động'],
    'vd.mstInvalid': ['MST format is not valid', 'MST không đúng định dạng'], 'vd.mstResult': ['MST {mst} · {s}', 'MST {mst} · {s}'], 'vd.mstMatch': ['MST {mst} · {s} · registered name matches', 'MST {mst} · {s} · tên đăng ký khớp'],
    'vd.riskOne': ['Risk re-checked · {r} (no change)', 'Đã kiểm tra lại rủi ro · {r} (không đổi)'], 'vd.riskAll': ['Risk re-checked for {n} vendors · no level changed', 'Đã kiểm tra lại rủi ro {n} NCC · không thay đổi mức'],
    'vd.delBlockedT': ['Delete blocked: open PO', 'Không thể xóa: còn PO đang mở'], 'vd.deleted': ['{id} deleted', 'Đã xóa {id}'], 'vd.setTo': ['{id} set to {s}', 'Đã chuyển {id} sang {s}'], 'vd.proposedT': ['{m} proposed for {id} · approve per Material ID', 'Đã đề xuất {m} cho {id} · duyệt theo mã vật tư'],
    'vd.needMst': ['MST not verified — run Re-check MST first', 'MST chưa xác minh — hãy Kiểm tra lại MST trước'], 'vd.needOb': ['Approve the vendor (onboarding review) before approving Material ID links', 'Duyệt NCC (xét hồ sơ) trước khi duyệt liên kết mã vật tư'],
    'vd.linkOk': ['{m} approved for {id}', 'Đã duyệt {m} cho {id}'], 'vd.linkRej': ['{m} link rejected', 'Đã từ chối liên kết {m}'], 'vd.unlinked': ['{m} removed from {id}', 'Đã gỡ {m} khỏi {id}'], 'vd.obOk': ['{id} approved → {s}', 'Đã duyệt {id} → {s}'],
    'vd.rejShort': ['Give a reason of at least 10 characters; it is sent to the supplier.', 'Nhập lý do ít nhất 10 ký tự; lý do sẽ gửi cho NCC.'], 'vd.obRejected': ['{id} onboarding rejected · supplier notified', 'Đã từ chối hồ sơ {id} · đã thông báo NCC'],
    'vd.activeLbl': ['Active', 'Hoạt động']
  });
  const st = { q: '', cat: 'all', status: 'all', risk: 'all', grade: 'all', form: null, errs: {}, mst: null, dup: null, confirmDel: null, rejecting: false, reject: '' };
  const CATS = ['Construction', 'Equipment', 'Services', 'Logistics', 'Equipment / Services'];
  const TERMS = ['30 days', '45 days', '30 days · advance 30% / 70%', '60 days'];
  const STATUSES = ['Preferred', 'Approved', 'Probation', 'Blocked', 'Pending approval'];
  const sTone = (s) => ({ Preferred: 'success', Approved: 'info', Probation: 'warning', Blocked: 'danger' }[s] || 'neutral');
  const rTone = (r) => ({ Low: 'success', Medium: 'warning', High: 'danger' }[r] || 'neutral');
  const sLabel = (s) => (s === 'Approved' ? t('vd.activeLbl') : tv(s));
  const normMst = (s) => String(s || '').replace(/\s+/g, '');
  const fmtMst = (s) => { const n = normMst(s); return /^\d{10}/.test(n) ? `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7, 10)}${n.slice(10)}` : n; };
  const me = () => (App.state.user && App.state.user.name) || 'Nguyễn Minh Anh';
  const OPEN_PO = (d) => d.type === 'PO' && !/Closed|Delivered/.test(d.status);
  const openPos = (id) => D().docs.filter((d) => d.vendor === id && OPEN_PO(d));
  const links = (id) => D().materials.filter((m) => m.vendors.some((v) => v[0] === id)).map((m) => ({ m, l: m.vendors.find((v) => v[0] === id) }));
  const E = (e) => (e ? (Array.isArray(e) ? t(e[0], e[1]) : t(e)) : ''); // errors stored as key or [key, params]

  /* ---------- MST (F-23 / R-04) ---------- */
  function mstFormat(mst, parent) {
    const n = normMst(mst);
    if (!n) return 'vd.e.mstReq';
    if (!/^(\d{10}|\d{10}-\d{3}|\d{12})$/.test(n)) return 'vd.e.mstFmt';
    if (/-/.test(n)) {
      const p = App.vendor(parent);
      if (!p) return 'vd.e.branch';
      if (normMst(p.mst) !== n.slice(0, 10)) return ['vd.e.parentMst', { v: normMst(p.mst) }];
    }
    return '';
  }
  function dupOf(mst, selfId) { const n = normMst(mst); return D().vendors.find((v) => v.id !== selfId && normMst(v.mst) === n); }
  function gdtLookup(mst, name) {
    const n = normMst(mst); const known = D().vendors.find((v) => normMst(v.mst) === n);
    if (n === '0109999999') return { mst: n, regName: 'CÔNG TY TNHH THƯƠNG MẠI HẢI ĐĂNG', address: 'Q. Cầu Giấy, Hà Nội', status: 'Ngừng hoạt động', code: 'inactive', at: D().today };
    return { mst: n, regName: (known ? known.name : name || 'Chưa khai báo tên').toUpperCase(), address: known ? known.address : 'Theo đăng ký thuế', status: 'Đang hoạt động', code: 'active', at: D().today };
  }
  function mstBox(f) {
    const r = st.mst;
    if (!r || r.mst !== normMst(f.mst)) return `<div id="vf-mst-box"><p class="small muted m-0">${esc(t('vd.mstIntro'))}</p></div>`;
    const mismatch = f.name && App.norm(r.regName) !== App.norm(f.name);
    const ok = r.code === 'active';
    return `<div id="vf-mst-box" class="stack"><div class="alert ${ok ? 'alert-success' : 'alert-danger'}" role="status"><b>${esc(t('vd.gdt', { at: r.at }))}</b><br>${esc(t('vd.regName'))}: ${esc(r.regName)}<br>${esc(t('vd.address'))}: ${esc(r.address)}<br>${esc(t('vd.taxStatus'))}: <b>${esc(t('vd.gdt.' + r.code))}</b></div>
      ${mismatch ? `<div class="alert alert-warning" role="status">${esc(t('vd.mismatch'))}</div>` : ''}</div>`;
  }

  /* ---------- Form (F-22) ---------- */
  const blank = () => ({ name: '', mst: '', parent: '', cat: 'Construction', terms: '30 days', contact: '', phone: '', email: '', city: '' });
  const fromVendor = (v) => ({ name: v.name, mst: normMst(v.mst), parent: v.parent || '', cat: v.cat, terms: v.terms || '30 days', contact: v.contact, phone: v.phone || '', email: v.email, city: v.city });
  function readForm(root) {
    const g = (n) => { const el = root.querySelector(`#vf-${n}`); return el ? el.value.trim() : ''; };
    return { name: g('name'), mst: g('mst'), parent: g('parent'), cat: g('cat'), terms: g('terms'), contact: g('contact'), phone: g('phone'), email: g('email'), city: g('city') };
  }
  function validate(f, selfId) {
    const e = {};
    if (!f.name) e.name = 'vd.e.name';
    const m = mstFormat(f.mst, f.parent); if (m) e.mst = m;
    if (!f.contact) e.contact = 'vd.e.contact';
    if (!/^[a-z0-9._%+-]+@gmail\.com$/i.test(f.email)) e.email = 'vd.e.email';
    else if (D().vendors.some((v) => v.id !== selfId && v.email.toLowerCase() === f.email.toLowerCase())) e.email = 'vd.e.emailDup';
    if (f.phone && !/^[0-9 +.]{9,15}$/.test(f.phone)) e.phone = 'vd.e.phone';
    return e;
  }
  const fld = (n, label, f, o = {}) => App.field('vf-' + n, t(label), f[n], Object.assign({ name: n, err: E(st.errs[n]) }, o));
  function formBlock(id) {
    const F = st.form; const f = F.f; const v = F.id && App.vendor(F.id);
    return block(F.id ? t('vd.editTitle', { id: F.id }) : t('vd.new'), `<form id="vf" novalidate class="stack">
      ${st.dup ? `<div class="alert alert-danger" role="alert">${esc(t('vd.dupMst', { mst: normMst(f.mst), id: st.dup.id, name: App.vshort(st.dup) }))}</div>` : ''}
      <div class="form-grid">
        ${fld('name', 'vd.f.name', f, { req: true })}
        ${fld('mst', 'vd.f.mst', f, { req: true, mono: true, ph: '0312456789', hint: t('vd.f.mstHint') })}
        ${fld('parent', 'vd.f.parent', f, { options: [['', t('c.noneOpt')]].concat(D().vendors.filter((x) => !F.id || x.id !== F.id).map((x) => [x.id, `${x.id} · ${App.vshort(x)}`])) })}
        ${fld('cat', 'c.category', f, { options: CATS })}
        ${fld('terms', 'vd.f.terms', f, { options: TERMS })}
        ${fld('contact', 'vd.f.contact', f, { req: true })}
        ${fld('phone', 'vd.f.phone', f, { type: 'tel' })}
        ${fld('email', 'vd.f.email', f, { req: true, type: 'email', hint: t('vd.f.emailHint') })}
        ${fld('city', 'vd.f.city', f)}
      </div>
      <div class="row-acts"><a class="btn" href="#/vendors${id ? '/' + esc(id) : ''}" data-v="cancel">${esc(t('c.cancel'))}</a><button type="button" class="btn" data-v="check-mst">${esc(t('vd.checkMst'))}</button><button type="submit" class="btn btn-p">${esc(t(F.id ? 'vd.saveChanges' : 'vd.create'))}</button></div>
      ${mstBox(f)}
      <p class="small muted m-0">${esc(v ? t('vd.statusStays', { s: sLabel(v.status) }) : t('vd.newNote'))} ${esc(t('vd.bankNote'))}</p></form>`);
  }
  function save(root) {
    const F = st.form; const f = readForm(root); F.f = f;
    st.errs = validate(f, F.id); st.dup = null;
    if (!st.errs.mst) { const d = dupOf(f.mst, F.id); if (d) st.dup = d; }
    if (Object.keys(st.errs).length || st.dup) { App.render(); const x = document.querySelector('#vf [aria-invalid=true]') || document.querySelector('#vf .alert-danger'); if (x) { x.setAttribute('tabindex', '-1'); x.focus(); x.scrollIntoView({ block: 'center' }); } return; }
    const verified = !!(st.mst && st.mst.mst === normMst(f.mst) && st.mst.code === 'active');
    if (F.id) {
      const v = App.vendor(F.id); const mstChanged = normMst(v.mst) !== normMst(f.mst);
      Object.assign(v, { name: f.name, mst: fmtMst(f.mst), parent: f.parent || null, cat: f.cat, terms: f.terms, contact: f.contact, phone: f.phone, email: f.email, city: f.city });
      if (mstChanged || verified) Object.assign(v, { mstVerified: verified, mstChecked: verified ? D().today : v.mstChecked, taxStatus: verified ? st.mst.status : 'Not checked' });
      st.form = null; st.mst = null; location.hash = '#/vendors/' + v.id; App.toast(t(mstChanged && !verified ? 'vd.savedRecheck' : 'vd.saved', { id: v.id }));
    } else {
      const id = 'V-' + (Math.max(...D().vendors.map((x) => +x.id.slice(2))) + 1);
      D().vendors.push({ id, name: f.name, cat: f.cat, status: 'Pending approval', score: null, grade: '—', otif: null, email: f.email, contact: f.contact, mst: fmtMst(f.mst), parent: f.parent || null, risk: '—', city: f.city, terms: f.terms, phone: f.phone,
        address: verified ? st.mst.address : '—', since: D().today, taxStatus: verified ? st.mst.status : 'Not checked', mstChecked: verified ? D().today : '—', mstVerified: verified, riskChecked: '—', riskReasons: ['New vendor · not yet assessed'], bank: { now: '—' }, proposed: [] });
      st.form = null; st.mst = null; location.hash = '#/vendors/' + id; App.toast(t('vd.created', { id }));
    }
  }

  /* ---------- List (F-20, F-21) ---------- */
  function list() {
    const q = st.q.trim();
    const rows = D().vendors.filter((v) => (!q || [v.id, v.name, v.mst, normMst(v.mst), v.email, v.contact, ...links(v.id).map((x) => x.m.id)].some((x) => App.matches(x, q)))
      && (st.cat === 'all' || v.cat.includes(st.cat)) && (st.status === 'all' || v.status === st.status) && (st.risk === 'all' || v.risk === st.risk) && (st.grade === 'all' || v.grade === st.grade));
    const sel = (k, label, opts) => `<label class="sr" for="vl-${k}">${esc(label)}</label><select class="inp" id="vl-${k}" data-vf="${k}"><option value="all">${esc(t('c.allOf', { label }))}</option>${opts.map((o) => `<option value="${esc(o)}"${st[k] === o ? ' selected' : ''}>${esc(tv(o))}</option>`).join('')}</select>`;
    return block(t('vd.title'), `<div class="filters">
        <label class="sr" for="vl-q">${esc(t('vd.searchLbl'))}</label><input class="inp grow" id="vl-q" data-vf="q" type="search" value="${esc(st.q)}" placeholder="${esc(t('vd.searchPh'))}">
        ${sel('cat', t('c.category'), ['Construction', 'Equipment', 'Services', 'Logistics'])}${sel('status', t('c.status'), STATUSES)}${sel('risk', t('vd.risk'), ['Low', 'Medium', 'High'])}${sel('grade', t('vd.grade'), ['A', 'B', 'C', 'D'])}</div>
      ${table([
        { h: t('c.vendor'), r: (v) => `<a href="#/vendors/${esc(v.id)}"><span class="mono small">${esc(v.id)}</span> ${esc(v.name)}</a><div class="small muted">${esc(v.email)}</div>`, w: 'minmax(200px,2.4fr)' },
        { h: t('c.category'), r: (v) => esc(tv(v.cat)) + `<div class="small muted">${esc(v.city)}</div>`, w: 'minmax(100px,1fr)' },
        { h: 'MST', r: (v) => `<span class="mono small">${esc(v.mst)}</span>${v.mstVerified ? '' : `<div class="small tone-warning">${esc(t('vd.notVerified'))}</div>`}`, w: '120px' },
        { h: t('vd.supplied'), r: (v) => { const L = links(v.id); return L.length ? `<div class="chips">${L.slice(0, 3).map((x) => mid(x.m.id)).join('')}${L.length > 3 ? `<span class="small muted">+${L.length - 3}</span>` : ''}</div>` : '<span class="muted">—</span>'; }, w: 'minmax(140px,1.5fr)' },
        { h: t('c.score'), r: (v) => (v.score ? `${num(v.score, 2)} · ${esc(v.grade)}` : '—'), cls: 'num', w: '80px' },
        { h: 'OTIF', r: (v) => (v.otif != null ? pct(v.otif) : '—'), cls: 'num', w: '70px' },
        { h: t('vd.risk'), r: (v) => pill(v.risk === '—' ? 'Pending' : v.risk, rTone(v.risk)) + (v.riskReasons.length && v.risk !== 'Low' ? `<div class="small muted">${esc(tv(v.riskReasons[0]))}${v.riskReasons.length > 1 ? ` +${v.riskReasons.length - 1}` : ''}</div>` : ''), w: 'minmax(120px,1.3fr)' },
        { h: t('c.status'), r: (v) => `<span class="pill pill-${sTone(v.status)}">${esc(sLabel(v.status))}</span>`, w: '120px' },
        { h: t('c.actions'), r: (v) => { const o = openPos(v.id); return `<div class="row-acts start"><a class="btn btn-sm" href="#/vendors/${esc(v.id)}/edit" aria-label="${esc(t('vd.editId', { id: v.id }))}">${esc(t('c.edit'))}</a><button class="btn btn-sm btn-d" data-v="delete" data-id="${esc(v.id)}" aria-label="${esc(t('vd.delId', { id: v.id }))}"${o.length ? ` disabled title="${esc(t('vd.delBlockedTip', { po: o[0].id }))}"` : ''}>${esc(t('c.delete'))}</button></div>`; }, w: '150px' }
      ], rows, { empty: t('vd.empty'), label: t('vd.title') })}
      <p class="muted small">${esc(t('vd.showing', { n: rows.length, at: D().vendors[0] ? D().vendors[0].riskChecked : '—' }))}</p>`,
    { actions: `<button class="btn btn-sm" data-v="recheck-all">${esc(t('vd.recheck'))}</button><button class="btn btn-sm" data-act="toast" data-msg="${esc(t('vd.importMsg'))}">${esc(t('c.import'))}</button>` });
  }
  function delConfirm() {
    const v = st.confirmDel && App.vendor(st.confirmDel); if (!v) return '';
    return `<div class="alert alert-danger stack" role="alert"><div>${esc(t('vd.delQ', { id: v.id, name: v.name }))}</div>
      <div class="row-acts start"><button class="btn btn-sm" data-v="del-cancel">${esc(t('c.cancel'))}</button><button class="btn btn-sm btn-d" data-v="del-ok" data-id="${esc(v.id)}">${esc(t('vd.delVendor'))}</button></div></div>`;
  }

  /* ---------- Profile (F-21..F-26) ---------- */
  const PSUBS = [['', 'vd.sub.overview'], ['materials', 'vd.sub.materials'], ['docs', 'vd.sub.docs'], ['settings', 'vd.sub.settings'], ['edit', 'vd.sub.edit']];
  function profile(v, subArg) {
    const cur = App.sub(PSUBS, subArg || '');
    const L = links(v.id); const pos = openPos(v.id); const cts = D().contracts.filter((c) => c.vendor === v.id);
    const certs = D().certificates.filter((c) => c.vendor === v.id); const sc = D().scorecards.find((s) => s.vendor === v.id);
    const riskP = pill(v.risk === '—' ? 'Pending' : v.risk, rTone(v.risk));
    const kpis = [
      kpi(t('vd.k.score'), v.score ? `${num(v.score, 2)} · ${esc(v.grade)}` : '—', sc ? `${esc(tv(sc.period))} · ${esc(tv(sc.status))}` : esc(t('vd.k.notEval'))),
      kpi(t('vd.k.otif'), v.otif != null ? pct(v.otif) : '—', esc(t('vd.k.target')), v.otif != null ? (v.otif >= 95 ? 'success' : v.otif < 85 ? 'danger' : 'warning') : ''),
      kpi(t('vd.k.mats'), String(L.length), esc(t('vd.k.proposed', { n: v.proposed.length }))),
      kpi(t('vd.k.openPo'), String(pos.length), esc(pos.length ? t('vd.k.delBlocked') : t('c.none')), pos.length ? 'warning' : '')
    ];
    let blocks;
    if (cur === 'materials') {
      const usable = D().materials.filter((m) => !L.some((x) => x.m.id === m.id) && !v.proposed.includes(m.id) && m.status !== 'Blocked');
      blocks = [block(t('vd.matsTitle', { n: L.length }), table([
        { h: t('c.mid'), r: (x) => mid(x.m.id), w: '120px' }, { h: t('c.description'), r: (x) => esc(x.m.name), w: 'minmax(180px,2fr)' },
        { h: t('vd.linkStatus'), r: (x) => pill(x.l[1], sTone(x.l[1])) + (x.l[5] ? `<div class="small tone-danger">${esc(tv(x.l[5]))}</div>` : ''), w: 'minmax(130px,1.2fr)' },
        { h: t('c.lastPrice'), r: (x) => (x.l[2] ? vnd(x.l[2]) : '—'), cls: 'num', w: '140px' }, { h: t('c.leadTime'), r: (x) => (x.l[3] ? esc(t('c.days', { n: x.l[3] })) : '—'), cls: 'num', w: '110px' },
        { h: '', r: (x) => `<button class="btn btn-sm" data-v="unlink" data-id="${esc(v.id)}" data-m="${esc(x.m.id)}" aria-label="${esc(t('vd.removeFrom', { m: x.m.id, id: v.id }))}">${esc(t('c.remove'))}</button>`, w: '100px' }
      ], L, { min: 720, empty: t('vd.noMats'), label: t('vd.supplied') })
        + (v.proposed.length ? `<div class="stack"><b class="small">${esc(t('vd.proposedLinks'))}</b>${v.proposed.map((m) => `<div class="row-acts between"><span>${mid(m)} ${esc((App.material(m) || {}).name || '')} ${pill('Proposed', 'neutral')}</span><span><button class="btn btn-sm" data-v="reject-link" data-id="${esc(v.id)}" data-m="${esc(m)}">${esc(t('c.reject'))}</button> <button class="btn btn-sm" data-v="approve-link" data-id="${esc(v.id)}" data-m="${esc(m)}">${esc(t('vd.approveLink'))}</button></span></div>`).join('')}</div>` : '')
        + `<div class="filters"><label class="sr" for="vp-add">${esc(t('vd.toAdd'))}</label><select class="inp grow" id="vp-add">${usable.map((m) => `<option value="${esc(m.id)}">${esc(m.id)} · ${esc(m.name)}${m.status !== 'Active' ? ' (' + esc(tv(m.status)) + ')' : ''}</option>`).join('')}</select><button class="btn btn-sm" data-v="propose" data-id="${esc(v.id)}">${esc(t('vd.addMat'))}</button></div>
        ${v.mstVerified ? '' : `<p class="small tone-warning m-0">${esc(t('vd.mstNotVer'))}</p>`}`)];
    } else if (cur === 'docs') {
      blocks = [block(t('vd.docs'), table([
        { h: t('c.number'), r: (d) => (d.type === 'CT' ? `<a class="mono" href="#/contracts/${esc(d.id)}">${esc(d.id)}</a>` : `<a class="mono" href="#/po/${esc(d.id)}">${esc(d.id)}</a>`), w: '140px' }, { h: t('c.title'), r: (d) => esc(tv(d.title)) + (d.note ? `<div class="small muted">${esc(tv(d.note))}</div>` : ''), w: 'minmax(200px,2fr)' },
        { h: t('c.mids'), r: (d) => `<div class="chips">${(d.mats || []).map(mid).join('')}</div>`, w: 'minmax(130px,1fr)' }, { h: t('c.status'), r: (d) => pill(d.status, /overdue|not confirmed|Expir/i.test(d.status + (d.note || '')) ? 'warning' : 'neutral'), w: 'minmax(130px,1fr)' }
      ], [...pos, ...D().docs.filter((d) => d.type === 'CT' && cts.some((c) => c.id === d.id))], { min: 700, empty: t('vd.noDocs'), label: t('vd.docs') })),
      block(t('vd.certs', { n: certs.length }), certs.length ? `<ul class="plain">${certs.map((c) => `<li><b>${esc(tv(c.type))}</b> <span class="small muted">· ${esc(c.no)} · ${esc(t('vd.expires', { d: c.expiry }))}</span> <span class="chips chips-inline">${c.mats.map(mid).join('')}</span></li>`).join('')}</ul>` : `<div class="empty">${esc(t('vd.noCerts'))}</div>`, { actions: `<a class="btn btn-sm" href="#/certificates?vendor=${esc(v.id)}">${esc(t('vd.certReg'))}</a>` })];
    } else if (cur === 'settings') {
      const b = v.bank || {};
      const bank = block(t('vd.bank'), `<dl class="dl"><dt>${esc(t('vd.inUse'))}</dt><dd class="mono">${esc(b.now || '—')}</dd></dl>
        ${b.pending ? `<div class="alert alert-warning" role="status"><b>${esc(t('vd.bankPending'))}</b> · ${esc(t('vd.bankPendingN', { acc: b.pending, at: b.requested, by: tv(b.by) }))}</div>` : `<p class="small muted">${esc(t('vd.noPending'))}</p>`}`,
      { span: 6, actions: b.pending ? `<a class="btn btn-sm" href="#/approvals?id=${esc(v.id)}">${esc(t('vd.openApprovals'))}</a>` : '' });
      const status = block(t('vd.statusCard'), `<div class="seg" role="group" aria-label="${esc(t('vd.statusLbl'))}">${['Preferred', 'Approved', 'Probation', 'Blocked'].map((s) => `<button data-v="status" data-id="${esc(v.id)}" data-s="${s}" aria-pressed="${v.status === s}">${esc(sLabel(s))}</button>`).join('')}</div>
        <p class="small muted">${esc(t('vd.statusNote'))}</p>
        ${pos.length ? `<div class="alert alert-warning" role="status">${esc(t('vd.delBlocked', { pos: pos.map((x) => x.id).join(', ') }))}</div>` : ''}
        ${delConfirm()}
        <div class="row-acts"><button class="btn btn-sm btn-d" data-v="delete" data-id="${esc(v.id)}"${pos.length ? ' disabled' : ''}>${esc(t('vd.delVendor'))}</button></div>`, { span: 6 });
      blocks = [status, bank];
    } else if (cur === 'edit') {
      if (!st.form || st.form.id !== v.id) { st.form = { id: v.id, f: fromVendor(v) }; st.errs = {}; st.dup = null; st.mst = null; }
      blocks = [formBlock(v.id)];
    } else {
      const overview = block(t('vd.profile'), `<dl class="dl">
        <dt>MST</dt><dd><span class="mono">${esc(v.mst)}</span> ${v.mstVerified ? pill('Verified', 'success') : pill('Not verified', 'warning')}</dd>
        ${v.parent ? `<dt>${esc(t('vd.p.parent'))}</dt><dd><a href="#/vendors/${esc(v.parent)}">${esc(v.parent)}</a></dd>` : ''}
        <dt>${esc(t('vd.taxStatus'))}</dt><dd>${esc(tv(v.taxStatus))} <span class="small muted">· ${esc(t('vd.p.checked', { at: v.mstChecked }))}</span></dd>
        <dt>${esc(t('vd.p.regAddr'))}</dt><dd>${esc(v.address || '—')}</dd><dt>${esc(t('vd.f.terms'))}</dt><dd>${esc(tv(v.terms || '—'))}</dd>
        <dt>${esc(t('vd.p.contact'))}</dt><dd>${esc(v.contact)}${v.phone ? ` · ${esc(v.phone)}` : ''}</dd><dt>${esc(t('vd.f.email'))}</dt><dd>${esc(v.email)}</dd><dt>${esc(t('vd.p.since'))}</dt><dd>${esc(v.since || '—')}</dd></dl>`, { span: 6 });
      const risk = block(t('vd.riskCard'), `<p>${riskP} <span class="small muted">${esc(t('vd.lastChecked', { at: v.riskChecked }))}</span></p>
        ${v.riskReasons.length ? `<ul class="plain small">${v.riskReasons.map((r) => `<li>${esc(tv(r))}</li>`).join('')}</ul>` : `<p class="small muted">${esc(t('vd.noRisk'))}</p>`}
        <p class="small muted">${esc(t('vd.riskRules'))}</p>`, { span: 6, actions: `<button class="btn btn-sm" data-v="recheck" data-id="${esc(v.id)}">${esc(t('vd.recheck'))}</button>` });
      const ob = v.onboarding ? block(t('vd.ob'), `<ul class="plain">${v.onboarding.map(([k, s], i) => `<li class="row-acts between"><span>${esc(tv(k))}</span><span>${pill(s, s === 'OK' ? 'success' : 'danger')}${s !== 'OK' ? ` <button class="btn btn-sm" data-v="ob-ok" data-id="${esc(v.id)}" data-i="${i}">${esc(t('vd.markOk'))}</button>` : ''}</span></li>`).join('')}</ul>
        <p class="small muted">${esc(t('vd.obCount', { a: v.onboarding.filter((x) => x[1] === 'OK').length, b: v.onboarding.length }))}</p>
        ${st.rejecting ? `<div class="field"><label for="vp-rej">${esc(t('vd.rejReason'))} *</label><textarea id="vp-rej" aria-describedby="vp-rej-e">${esc(st.reject)}</textarea>${st.errs.reject ? `<span class="err" id="vp-rej-e" role="alert">${esc(E(st.errs.reject))}</span>` : ''}</div>` : ''}
        <div class="row-acts"><button class="btn btn-sm btn-d" data-v="ob-reject" data-id="${esc(v.id)}">${esc(t(st.rejecting ? 'vd.confirmReject' : 'c.reject'))}</button><button class="btn btn-sm" data-v="ob-approve" data-id="${esc(v.id)}" data-s="Probation"${v.onboarding.some((x) => x[1] !== 'OK') ? ' disabled' : ''}>${esc(t('vd.toProbation'))}</button><button class="btn btn-sm btn-p" data-v="ob-approve" data-id="${esc(v.id)}" data-s="Approved"${v.onboarding.some((x) => x[1] !== 'OK') ? ' disabled' : ''}>${esc(t('vd.toActive'))}</button></div>`) : '';
      blocks = [ob, overview, risk];
    }
    const base = 'vendors/' + v.id;
    return layout({
      crumbs: `<a href="#/vendors">${esc(t('vd.title'))}</a> / ${esc(v.id)}`, title: v.name,
      subtitle: `<span class="mono">${esc(v.id)}</span> · ${esc(tv(v.cat))} · ${esc(v.city)} · <span class="pill pill-${sTone(v.status)}">${esc(sLabel(v.status))}</span> · ${esc(t('vd.risk'))} ${riskP}`,
      actions: `<a class="btn" href="#/evaluation/scorecard?vendor=${esc(v.id)}">${esc(t('vd.scorecard'))}</a><button class="btn" data-v="check-mst-p" data-id="${esc(v.id)}">${esc(t('vd.recheckMst'))}</button>${cur === 'edit' ? '' : `<a class="btn btn-p" href="#/${base}/edit">${esc(t('vd.editVendor'))}</a>`}`,
      alerts: App.unknownSub(PSUBS, subArg), kpis, subnav: App.subnav(base, PSUBS, cur), blocks
    });
  }

  const LSUBS = [['', 'vd.sub.list'], ['new', 'vd.sub.new']];
  App.page('vendors', {
    titleKey: 'vd.title', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, subArg) {
      const parts = (subArg || '').split('/');
      const id = parts[0] === 'new' ? null : parts[0] || p.id;
      const key = id || 'list'; if (st.cur !== key) { st.cur = key; st.form = null; st.errs = {}; st.mst = null; st.dup = null; st.confirmDel = null; st.rejecting = false; st.reject = ''; }
      if (id) { const v = App.vendor(id); return v ? profile(v, parts.slice(1).join('/')) : layout({ title: t('vd.title'), blocks: [block(null, App.errorState(t('vd.notFound', { id })) + `<p class="m-0"><a class="btn" href="#/vendors">${esc(t('vd.back'))}</a></p>`)] }); }
      const V = D().vendors; const isNew = parts[0] === 'new';
      if (isNew && (!st.form || st.form.id)) { st.form = { id: null, f: blank() }; st.errs = {}; st.mst = null; st.dup = null; }
      const high = V.filter((v) => v.risk === 'High');
      return layout({
        title: t('vd.title'), subtitle: esc(t('vd.subtitle')),
        actions: isNew ? '' : `<a class="btn btn-p" href="#/vendors/new">${esc(t('vd.new'))}</a>`,
        alerts: delConfirm(),
        kpis: [kpi(t('vd.k.vendors'), '142', esc(t('c.allCats'))), kpi(t('vd.k.active'), '118', esc(t('c.inSample', { n: V.filter((v) => /Preferred|Approved/.test(v.status)).length })), 'success'),
          kpi(t('vd.k.pending'), '6', esc(t('c.inSample', { n: V.filter((v) => v.status === 'Pending approval').length })), 'warning'), kpi(t('vd.k.high'), String(high.length), esc(high.map((v) => App.vshort(v)).join(', ') || t('c.none')), 'danger')],
        subnav: App.subnav('vendors', LSUBS, isNew ? 'new' : ''), blocks: [isNew ? formBlock(null) : list()]
      });
    },
    mount(root) {
      root.addEventListener('input', (e) => {
        if (e.target.dataset.vf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('vl-q'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
        if (e.target.id === 'vp-rej') st.reject = e.target.value;
      });
      root.addEventListener('change', (e) => {
        const k = e.target.dataset.vf; if (k && k !== 'q') { st[k] = e.target.value; App.render(); return; }
        if (e.target.closest('#vf') && ['mst', 'name'].includes(e.target.name) && st.form) { st.form.f = readForm(root); const b = root.querySelector('#vf-mst-box'); if (b) b.outerHTML = mstBox(st.form.f); }
      });
      root.addEventListener('submit', (e) => { if (e.target.id === 'vf') { e.preventDefault(); save(root); } });
      root.addEventListener('click', (e) => {
        const el = e.target.closest('[data-v]'); if (!el) return;
        const a = el.dataset.v; const v = el.dataset.id && App.vendor(el.dataset.id);
        if (a === 'cancel') { st.form = null; st.errs = {}; st.dup = null; st.mst = null; }
        else if (a === 'check-mst') {
          const f = readForm(root); st.form.f = f; const err = mstFormat(f.mst, f.parent); st.errs = err ? { mst: err } : {};
          if (!err) { st.mst = gdtLookup(f.mst, f.name); const d = dupOf(f.mst, st.form.id); st.dup = d || null; }
          App.render(); App.toast(err ? t('vd.mstInvalid') : t('vd.mstResult', { mst: normMst(f.mst), s: t('vd.gdt.' + st.mst.code) }));
        }
        else if (!v && a !== 'recheck-all' && a !== 'del-cancel') return;
        else if (a === 'check-mst-p') { const r = gdtLookup(v.mst, v.name); Object.assign(v, { taxStatus: r.status, mstChecked: r.at, mstVerified: r.code === 'active' }); App.render(); App.toast(t('vd.mstMatch', { mst: normMst(v.mst), s: t('vd.gdt.' + r.code) })); }
        else if (a === 'recheck' || a === 'recheck-all') { (v ? [v] : D().vendors).forEach((x) => { if (x.riskChecked !== '—' || v) x.riskChecked = D().today + ' 10:30'; }); App.render(); App.toast(v ? t('vd.riskOne', { r: tv(v.risk === '—' ? 'Pending' : v.risk) }) : t('vd.riskAll', { n: D().vendors.length })); }
        else if (a === 'delete') { if (el.disabled) return; st.confirmDel = v.id; App.render(); }
        else if (a === 'del-cancel') { st.confirmDel = null; App.render(); }
        else if (a === 'del-ok') {
          if (openPos(v.id).length) { App.toast(t('vd.delBlockedT')); return; }
          D().vendors.splice(D().vendors.indexOf(v), 1); D().materials.forEach((m) => { m.vendors = m.vendors.filter((x) => x[0] !== v.id); });
          st.confirmDel = null; if (location.hash.includes(v.id)) location.hash = '#/vendors'; else App.render(); App.toast(t('vd.deleted', { id: v.id }));
        }
        else if (a === 'status') { v.status = el.dataset.s; D().materials.forEach((m) => m.vendors.forEach((x) => { if (x[0] === v.id && !x[5] && x[1] !== 'Preferred') x[1] = v.status === 'Preferred' ? 'Approved' : v.status; })); App.render(); App.toast(t('vd.setTo', { id: v.id, s: sLabel(v.status) })); }
        else if (a === 'propose') { const sel = root.querySelector('#vp-add'); const m = sel && sel.value; if (!m) return; v.proposed.push(m); App.render(); App.toast(t('vd.proposedT', { m, id: v.id })); }
        else if (a === 'approve-link') {
          if (!v.mstVerified) { App.toast(t('vd.needMst')); return; }
          if (v.status === 'Pending approval') { App.toast(t('vd.needOb')); return; }
          const m = App.material(el.dataset.m); if (!m) return; m.vendors.push([v.id, 'Approved', null, m.lead, v.otif || 0]); v.proposed = v.proposed.filter((x) => x !== m.id); App.render(); App.toast(t('vd.linkOk', { m: m.id, id: v.id }));
        }
        else if (a === 'reject-link') { v.proposed = v.proposed.filter((x) => x !== el.dataset.m); App.render(); App.toast(t('vd.linkRej', { m: el.dataset.m })); }
        else if (a === 'unlink') { const m = App.material(el.dataset.m); if (!m) return; m.vendors = m.vendors.filter((x) => x[0] !== v.id); App.render(); App.toast(t('vd.unlinked', { m: m.id, id: v.id })); }
        else if (a === 'ob-ok') { v.onboarding[+el.dataset.i][1] = 'OK'; App.render(); }
        else if (a === 'ob-approve') { v.status = el.dataset.s; v.risk = 'Low'; v.riskReasons = []; v.riskChecked = D().today + ' 10:30'; st.rejecting = false; App.render(); App.toast(t('vd.obOk', { id: v.id, s: sLabel(v.status) })); }
        else if (a === 'ob-reject') {
          if (!st.rejecting) { st.rejecting = true; st.errs = {}; App.render(); const r = document.getElementById('vp-rej'); r && r.focus(); return; }
          if (st.reject.trim().length < 10) { st.errs = { reject: 'vd.rejShort' }; App.render(); const r = document.getElementById('vp-rej'); r && r.focus(); return; }
          v.status = 'Blocked'; v.riskReasons = ['Onboarding rejected: ' + st.reject.trim()]; st.rejecting = false; st.reject = ''; st.errs = {}; App.render(); App.toast(t('vd.obRejected', { id: v.id }));
        }
      });
    }
  });
})();
